#!/usr/bin/env bash
# Invoke through timeout --kill-after=120s 600s bash ... RELEASE_ID
set -euo pipefail
id="${1:?release id}"
[[ "$id" =~ ^[0-9]{14}$ ]]
node=/opt/node-v24/bin/node
exec 9>/opt/shiyu/.front-release.lock
flock -w 5 9
exec 8>/opt/shiyu-admin/.release.lock
flock -w 5 8
roots=(/opt/shiyu /opt/shiyu-admin /opt/shiyu-time)
services=(shiyu-preview shiyu-admin shiyu-time)
ports=(4318 5175 5176)
urls=(https://shiyubox.com/ https://admin.shiyubox.com/login https://time-admin.shiyubox.com/)
kinds=(front admin time)
old=()
changed=()
for root in "${roots[@]}"; do old+=("$(readlink -f "$root/current")"); done
health(){ timeout --kill-after=2s 22s curl -fsS --max-time 5 --retry 10 --retry-delay 1 --retry-max-time 19 --retry-connrefused "$1" >/dev/null; }
rollback(){
 status=$?; trap - EXIT TERM INT; set +e
 if [ "$status" -ne 0 ]; then
  for ((j=${#changed[@]}-1;j>=0;j--)); do
   i=${changed[$j]}
   ln -s "${old[$i]}" "${roots[$i]}/rollback-$id"
   mv -Tf "${roots[$i]}/rollback-$id" "${roots[$i]}/current"
   timeout --kill-after=5s 35s systemctl restart "${services[$i]}"
   health "http://127.0.0.1:${ports[$i]}/" && health "${urls[$i]}" || { echo ROLLBACK_HEALTH_FAILED; exit 92; }
  done
  echo ROLLBACK_VERIFIED
 fi
 exit "$status"
}
trap rollback EXIT
trap 'exit 124' TERM INT
for service in nginx shiyu-preview shiyu-admin shiyu-time shiyu-space shiyu-tools; do timeout 5s systemctl is-active --quiet "$service"; done
awk '/MemAvailable:/{exit !($2>400000)}' /proc/meminfo
awk '/SwapTotal:/{t=$2}/SwapFree:/{exit !(t==0||$2>65536)}' /proc/meminfo
awk -v cpus="$(getconf _NPROCESSORS_ONLN)" '{exit !($1<=cpus*2)}' /proc/loadavg
[ "$(df --output=avail -k /opt | tail -1)" -gt 3145728 ]
[ "$(df --output=iavail /opt | tail -1)" -gt 10000 ]
for i in 0 1 2; do
 root=${roots[$i]}; new="$root/releases/$id"
 [[ "${old[$i]}" =~ ^$root/releases/[0-9]{14}$ ]]
 test ! -e "$new"
 mkdir "$new"
 cp -a "${old[$i]}/." "$new/"
 tar -xzf "/tmp/shiyu-${kinds[$i]}-delta-$id.tgz" -C "$new"
 (cd "$new" && sha256sum -c "/tmp/shiyu-${kinds[$i]}-$id.sha256" >/dev/null)
 for name in .local mocks; do
  if [ -L "${old[$i]}/$name" ]; then test "$(readlink -f "$new/$name")" = "$(readlink -f "${old[$i]}/$name")"; elif [ -d "${old[$i]}/$name" ]; then diff -qr "${old[$i]}/$name" "$new/$name"; fi
 done
 for env in .env .env.local .env.production; do if [ -e "${old[$i]}/$env" ]; then cmp "${old[$i]}/$env" "$new/$env"; fi; done
 "$node" -e 'const fs=require("fs"),r=JSON.parse(fs.readFileSync(process.argv[1],"utf8")),p=process.argv[2];fs.writeFileSync(p+"/RELEASE_VERSION",r.version+"\n");fs.writeFileSync(p+"/RELEASE_COMMIT",r[process.argv[3]]+"\n")' "/tmp/shiyu-release-$id.json" "$new" "${kinds[$i]}Commit"
 basename "${old[$i]}" > "$new/PREVIOUS_RELEASE"
done
# The consumer package changes only in this prepared release; never install on the host.
time_new="${roots[2]}/releases/$id"
if [ -L "$time_new/node_modules" ]; then
 rm "$time_new/node_modules"
 cp -al "$(readlink -f "${old[2]}/node_modules")" "$time_new/node_modules"
fi
test "$(realpath "$time_new/node_modules")" = "$time_new/node_modules"
mkdir "$time_new/node_modules/.release-admin-ui"
tar -xzf "$time_new/vendor/qing-platform-admin-ui-2.0.5.tgz" --strip-components=1 -C "$time_new/node_modules/.release-admin-ui"
test -L "$time_new/node_modules/@qing-platform/admin-ui"
rm "$time_new/node_modules/@qing-platform/admin-ui"
ln -s ../.release-admin-ui "$time_new/node_modules/@qing-platform/admin-ui"
chown -hR shiyu:shiyu "${roots[0]}/releases/$id"
timeout --kill-after=5s 45s "$node" /tmp/release-state.mjs prepare "$id"
# Update one service at a time and verify both local and external access.
for i in 1 2 0; do
 root=${roots[$i]}
 ln -s "$root/releases/$id" "$root/current.next-$id"
 changed+=("$i")
 mv -Tf "$root/current.next-$id" "$root/current"
 timeout --kill-after=5s 35s systemctl restart "${services[$i]}"
 timeout 5s systemctl is-active --quiet "${services[$i]}"
 health "http://127.0.0.1:${ports[$i]}/"
 health "${urls[$i]}"
 echo "VERIFIED_SERVICE=${services[$i]}"
done
timeout --kill-after=5s 20s "$node" /tmp/release-state.mjs verify "$id"
for i in 0 1 2; do
 (cd "${roots[$i]}/current" && sha256sum -c "/tmp/shiyu-${kinds[$i]}-$id.sha256" >/dev/null)
 timeout 5s systemctl is-active --quiet "${services[$i]}"
 health "${urls[$i]}"
done
for service in nginx shiyu-space shiyu-tools; do timeout 5s systemctl is-active --quiet "$service"; done
trap - EXIT TERM INT
echo RESPONSIVE_RELEASE_VERIFIED
