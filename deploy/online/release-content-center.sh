#!/usr/bin/env bash
set -euo pipefail
id="${1:?id}"
[[ "$id" =~ ^[0-9]{14}$ ]]
node=/opt/node-v24/bin/node
old_admin=$(readlink -f /opt/shiyu-admin/current)
old_front=$(readlink -f /opt/shiyu/current)
new_admin="/opt/shiyu-admin/releases/$id"
new_front="/opt/shiyu/releases/$id"
[[ "$old_admin" =~ ^/opt/shiyu-admin/releases/[0-9]{14}$ && "$old_front" =~ ^/opt/shiyu/releases/[0-9]{14}$ ]]
test ! -e "$new_admin"; test ! -e "$new_front"
exec 8>/opt/shiyu-admin/.release.lock
flock -w 5 8
for service in nginx shiyu-preview shiyu-admin shiyu-tools; do timeout 5s systemctl is-active --quiet "$service"; done
mem=$(awk '/MemAvailable:/{print $2}' /proc/meminfo)
disk=$(df --output=avail -k /opt | tail -1)
inodes=$(df --output=iavail /opt | tail -1)
[ "$mem" -gt 262144 ]; [ "$disk" -gt 2097152 ]; [ "$inodes" -gt 10000 ]
awk -v cpus="$(getconf _NPROCESSORS_ONLN)" '{exit !($1<=cpus*2)}' /proc/loadavg
printf 'PREFLIGHT memory_kb=%s disk_kb=%s inodes=%s\n' "$mem" "$disk" "$inodes"
health(){ timeout --kill-after=2s 25s curl -fsS --max-time 4 --retry 15 --retry-delay 1 --retry-max-time 22 --retry-connrefused "$1" >/dev/null; }
switched_admin=0
rollback(){
 status=$?; trap - EXIT TERM INT; set +e
 if [ "$status" -ne 0 ] && [ "$switched_admin" = 1 ]; then
  if [ "$(readlink -f /opt/shiyu/current)" != "$old_front" ]; then
   ln -s "$old_front" "/opt/shiyu/rollback-$id"; mv -Tf "/opt/shiyu/rollback-$id" /opt/shiyu/current
   timeout --kill-after=3s 35s systemctl restart shiyu-preview
   health https://shiyubox.com/ || exit 91
  fi
  ln -s "$old_admin" "/opt/shiyu-admin/rollback-$id"; mv -Tf "/opt/shiyu-admin/rollback-$id" /opt/shiyu-admin/current
  timeout --kill-after=3s 35s systemctl restart shiyu-admin
  health http://127.0.0.1:5175/login && health https://admin.shiyubox.com/login || exit 92
  echo ROLLBACK_ADMIN_VERIFIED
 fi
 exit "$status"
}
trap rollback EXIT
trap 'exit 124' TERM INT
mkdir "$new_admin" "$new_front"
cp -a "$old_admin/." "$new_admin/"
cp -a "$old_front/." "$new_front/"
tar -xzf "/tmp/shiyu-admin-delta-$id.tgz" -C "$new_admin"
tar -xzf "/tmp/shiyu-front-delta-$id.tgz" -C "$new_front"
(cd "$new_admin" && sha256sum -c "/tmp/shiyu-admin-$id.sha256")
(cd "$new_front" && sha256sum -c "/tmp/shiyu-front-$id.sha256")
# The only removed runtime source is the superseded world configuration component.
test "$(realpath "$new_admin/src")" = "$new_admin/src"
rm -f -- "$new_admin/src/ShiyuWorldEntryControls.tsx"
test "$(readlink -f "$new_admin/.local")" = "$(readlink -f "$old_admin/.local")"
test "$(readlink -f "$new_admin/mocks")" = "$(readlink -f "$old_admin/mocks")"
test "$(readlink -f "$new_admin/node_modules")" = "$(readlink -f "$old_admin/node_modules")"
cmp "$old_admin/platform-creators.json" "$new_admin/platform-creators.json"
# Dependencies, environment and callbacks are inherited from the active release.
cmp "$old_admin/package.json" "$new_admin/package.json"
"$node" -e 'const fs=require("fs"),r=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));fs.writeFileSync(process.argv[2]+"/RELEASE_COMMIT",r.adminCommit+"\n");fs.writeFileSync(process.argv[2]+"/RELEASE_VERSION",r.version+"\n")' "/tmp/shiyu-release-$id.json" "$new_admin"
printf '%s\n' "$(basename "$old_admin")" > "$new_admin/PREVIOUS_RELEASE"
chown -hR shiyu:shiyu "$new_front"
# Back up live data and append the release record before the first service switch.
timeout --kill-after=5s 40s "$node" /tmp/release-state.mjs prepare "$id"
ln -s "$new_admin" "/opt/shiyu-admin/current.next-$id"
switched_admin=1
mv -Tf "/opt/shiyu-admin/current.next-$id" /opt/shiyu-admin/current
timeout --kill-after=5s 35s systemctl restart shiyu-admin
health http://127.0.0.1:5175/login
health https://admin.shiyubox.com/login
timeout 5s systemctl is-active --quiet shiyu-admin
timeout --signal=TERM --kill-after=100s 240s bash /tmp/release-front-only.sh "$id" --resume
health https://admin.shiyubox.com/login
for service in nginx shiyu-preview shiyu-admin shiyu-tools; do timeout 5s systemctl is-active --quiet "$service"; done
timeout --kill-after=5s 20s "$node" /tmp/release-state.mjs verify "$id"
"$node" -e 'const fs=require("fs"),r=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));for(const root of ["/opt/shiyu/current","/opt/shiyu-admin/current"]){if(fs.readFileSync(root+"/RELEASE_VERSION","utf8").trim()!==r.version)throw Error("Version mismatch")}if(fs.readFileSync("/opt/shiyu-admin/current/RELEASE_COMMIT","utf8").trim()!==r.adminCommit)throw Error("Admin commit mismatch")' "/tmp/shiyu-release-$id.json"
echo CONTENT_CENTER_RELEASE_VERIFIED
