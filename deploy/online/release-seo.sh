#!/usr/bin/env bash
# Run with: timeout --signal=TERM --kill-after=100s 240s bash this-script RELEASE_ID
# Only the website service is restarted. The extra kill budget protects rollback.
set -euo pipefail
id="${1:?release id}"
[[ "$id" =~ ^[0-9]{14}$ ]]
resume="${2:-}"
[[ -z "$resume" || "$resume" = --resume ]]
record="/tmp/shiyu-release-$id.json"
archive="/tmp/shiyu-front-delta-$id.tgz"
checksums="/tmp/shiyu-front-$id.sha256"
node=/opt/node-v24/bin/node

# The same lock covers preparation, the switch, validation and any rollback.
exec 9>/opt/shiyu/.front-release.lock
flock -w 5 9 || { echo 'ERROR: another website deployment holds the lock.' >&2; exit 1; }
old=$(readlink -f /opt/shiyu/current)
new="/opt/shiyu/releases/$id"
[[ "$old" =~ ^/opt/shiyu/releases/[0-9]{14}$ && "$old" != "$new" ]]
test -d "$old"
test -f "$record"
test -s "$checksums"
test -f /tmp/release-state.mjs
if [ "$resume" = --resume ]; then test -d "$new"; else test ! -e "$new"; test -s "$archive"; fi
version=$("$node" -e 'const fs=require("node:fs"),r=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(r.target!=="website"||!/^V\d+\.\d+\.\d+$/.test(r.version))throw Error("Invalid website release record");console.log(r.version)' "$record")
commit=$("$node" -e 'const fs=require("node:fs"),r=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(!/^[a-f0-9]{40}$/.test(r.commit||""))throw Error("Invalid website release commit");console.log(r.commit)' "$record")
if [ -f "$old/RELEASE_VERSION" ]; then
  "$node" -e 'const fs=require("node:fs"),r=JSON.parse(fs.readFileSync(process.argv[1],"utf8")),previous=fs.readFileSync(process.argv[2],"utf8").trim();if(r.previousVersion!==previous)throw Error("Record previousVersion does not match the running website")' "$record" "$old/RELEASE_VERSION"
fi

services=(nginx shiyu-preview shiyu-admin shiyu-tools)
for service in shiyu-space shiyu-time; do
  if [ "$(timeout 5s systemctl show --property=LoadState --value "$service")" = loaded ]; then services+=("$service"); fi
done
check_services(){
  for service in "${services[@]}"; do
    timeout 5s systemctl is-active --quiet "$service" || { echo "ERROR: $service is not active." >&2; return 1; }
  done
}
check_services
read -r mem_available swap_total swap_free < <(awk '
  /^MemAvailable:/ {m=$2} /^SwapTotal:/ {t=$2} /^SwapFree:/ {f=$2}
  END {print m+0,t+0,f+0}' /proc/meminfo)
cpu_count=$(getconf _NPROCESSORS_ONLN)
read -r load_one load_five load_fifteen _ < /proc/loadavg
disk_available=$(df --output=avail -k /opt/shiyu | tail -1 | tr -d ' ')
inodes_available=$(df --output=iavail /opt/shiyu | tail -1 | tr -d ' ')
printf 'PREFLIGHT mem_available_kb=%s swap_total_kb=%s swap_free_kb=%s cpus=%s load=%s,%s,%s disk_available_kb=%s inodes_available=%s current=%s\n' "$mem_available" "$swap_total" "$swap_free" "$cpu_count" "$load_one" "$load_five" "$load_fifteen" "$disk_available" "$inodes_available" "$old"
[ "$mem_available" -gt 262144 ] || { echo 'ERROR: less than 256 MiB available memory.' >&2; exit 1; }
if [ "$swap_total" -gt 0 ]; then
  [ "$swap_free" -gt 65536 ] || { echo 'ERROR: swap has less than 64 MiB free.' >&2; exit 1; }
fi
awk -v current_load="$load_one" -v cpus="$cpu_count" 'BEGIN {exit !(current_load <= cpus * 2)}' || { echo 'ERROR: system load is too high for deployment.' >&2; exit 1; }
[ "$disk_available" -gt 2097152 ] || { echo 'ERROR: less than 2 GiB available disk.' >&2; exit 1; }
[ "$inodes_available" -gt 10000 ] || { echo 'ERROR: too few available inodes.' >&2; exit 1; }

nginx_file=$(readlink -f /etc/nginx/sites-enabled/shiyu-preview)
nginx_backup="/opt/shiyu/backups/nginx-official-$id.conf"
test -s /tmp/shiyu-official-nginx-$id.conf
cmp -s "$nginx_file" /tmp/shiyu-official-nginx-before-$id.conf || { echo 'ERROR: nginx configuration changed since review.' >&2; exit 1; }
cp -a "$nginx_file" "$nginx_backup"
switched=0
health(){ timeout --kill-after=2s 20s curl -fsS --max-time 5 --retry 10 --retry-delay 1 --retry-max-time 17 --retry-connrefused "$1" >/dev/null; }
rollback(){
  local status=$? rollback_status=0
  trap - EXIT TERM INT
  set +e
  if [ "$switched" = 1 ]; then
    echo "ERROR: publication failed (status=$status); restoring $old." >&2
    # Rollback has its own total deadline, independent of the publication timer.
    timeout --kill-after=5s 90s bash -s -- "$old" "$id" "$nginx_file" "$nginx_backup" <<'ROLLBACK'
set -euo pipefail
previous="$1"
release_id="$2"
cp -a "$4" "$3"
timeout 10s nginx -t
timeout 10s systemctl reload nginx
rollback_link="/opt/shiyu/current.rollback-$release_id"
ln -s "$previous" "$rollback_link"
mv -Tf "$rollback_link" /opt/shiyu/current
timeout --kill-after=5s 35s systemctl restart shiyu-preview
timeout 5s systemctl is-active --quiet shiyu-preview
test "$(readlink -f /opt/shiyu/current)" = "$previous"
for url in http://127.0.0.1:4318/ https://shiyubox.com/ https://www.shiyubox.com/; do
  timeout --kill-after=2s 20s curl -fsS --max-time 5 --retry 10 --retry-delay 1 --retry-max-time 17 --retry-connrefused "$url" >/dev/null
done
echo "ROLLBACK_VERIFIED=$previous"
ROLLBACK
    rollback_status=$?
    if [ "$rollback_status" -ne 0 ]; then
      echo "ERROR: rollback failed or timed out (status=$rollback_status); inspect shiyu-preview and external HTTPS immediately." >&2
    fi
    [ "$status" -ne 0 ] || status=1
  elif [ "$status" -ne 0 ]; then
    echo "ERROR: release preparation failed (status=$status); the current website was not switched." >&2
  fi
  exit "$status"
}
trap rollback EXIT
trap 'exit 124' TERM INT

if [ "$resume" != --resume ]; then
  mkdir -p "$new"
  cp -a "$old/." "$new/"
  tar -xzf "$archive" -C "$new"
fi
cd "$new"
test "$(realpath -m dist/official/v2)" = "$new/dist/official/v2"
test ! -L dist/official/v2
rm -rf -- "$new/dist/official/v2"
test ! -e dist/official/v2
"$node" --check preview.cjs
"$node" --check i18n/frontend-server.cjs
"$node" --check dist/official/v3/official.js
sha256sum -c "$checksums"
for file in dist/app.js dist/v4.js dist/world.js dist/desktop-pet.js dist/desktop-pet-host.js dist/extension/page.js dist/extension/start.js; do "$node" --check "$file"; done
# Website and plugin records must describe the files actually being published.
"$node" -e 'const fs=require("node:fs"),path=require("node:path"),r=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(r.extensionRecord){const requested=r.extensionRecord.version.replace(/^V/,""),manifest=JSON.parse(fs.readFileSync("dist/extension/current/manifest.json","utf8")),release=JSON.parse(fs.readFileSync("dist/extension/release.json","utf8")),old=JSON.parse(fs.readFileSync(path.join(process.argv[2],"dist/extension/current/manifest.json"),"utf8")),next=old.version.split(".").map(Number);next[2]++;if(requested!==next.join(".")||manifest.version!==requested||release.latest!==requested)throw Error("Plugin version is not the next patch or does not match the release record")}' "$record" "$old"
printf '%s\n' "$id" > RELEASE_ID
printf '%s\n' "$version" > RELEASE_VERSION
printf '%s\n' "$commit" > RELEASE_COMMIT
basename "$old" > PREVIOUS_RELEASE
# Preserve production data and append both approved records before switching.
if [ "$resume" = --resume ]; then
  timeout --kill-after=5s 20s "$node" /tmp/release-state.mjs verify "$id"
else
  timeout --kill-after=5s 40s "$node" /tmp/release-state.mjs prepare "$id"
fi
check_services
test "$(readlink -f /opt/shiyu/current)" = "$old"
ln -s "$new" "/opt/shiyu/current.next-$id"
switched=1
cp /tmp/shiyu-official-nginx-$id.conf "$nginx_file"
timeout 10s nginx -t
mv -Tf "/opt/shiyu/current.next-$id" /opt/shiyu/current
timeout --kill-after=5s 35s systemctl restart shiyu-preview
timeout 10s systemctl reload nginx
check_services
for url in http://127.0.0.1:4318/ https://shiyubox.com/ https://space.shiyubox.com/ https://world.shiyubox.com/ https://shiyubox.com/extension/ https://shiyubox.com/extension/start.html; do health "$url"; done
health https://www.shiyubox.com/
health https://www.shiyubox.com/api/shiyu/operations
timeout --kill-after=5s 80s "$node" /tmp/verify-seo-online.mjs
test "$(curl -s --max-time 10 -o /dev/null -w '%{http_code}' https://shiyubox.com/official/v2/official.js)" = 410
test ! -e /opt/shiyu/current/dist/official/v2
timeout --kill-after=5s 20s "$node" /tmp/release-state.mjs verify "$id"
test "$(cat /opt/shiyu/current/RELEASE_VERSION)" = "$version"
test "$(cat /opt/shiyu/current/RELEASE_COMMIT)" = "$commit"
test "$(readlink -f /opt/shiyu/current)" = "$new"
cd /opt/shiyu/current
sha256sum -c "$checksums"
switched=0
trap - EXIT TERM INT
echo "PUBLISHED=$version CURRENT=$new PREVIOUS=$old"
# Retention is deliberately separate, after this verified success, and never
# removes the current release, the previous release, records or shared data.
