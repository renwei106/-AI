#!/usr/bin/env bash
set -euo pipefail
release_id="${1:?release id required}"
front_commit="${2:?frontend commit required}"
admin_commit="${3:?admin commit required}"
[[ "$release_id" =~ ^[0-9]{14}$ && "$front_commit" =~ ^[a-f0-9]{40}$ && "$admin_commit" =~ ^[a-f0-9]{40}$ ]]
old_front=$(readlink -f /opt/shiyu/current)
old_admin=$(readlink -f /opt/shiyu-admin/current)
front_release="/opt/shiyu/releases/$release_id"
admin_release="/opt/shiyu-admin/releases/$release_id"
test -d "$old_front" && test -d "$old_admin/node_modules"
test ! -e "$front_release" && test ! -e "$admin_release"
mkdir -p "$front_release" "$admin_release"
tar -xzf "/tmp/shiyu-front-$release_id.tgz" -C "$front_release"
tar -xzf "/tmp/shiyu-admin-$release_id.tgz" -C "$admin_release"

# Retain live data in place; never upload local test accounts or credentials.
for name in .local .local-shares .local-feedback; do
  if [ -d "$old_front/$name" ]; then ln -s "$(readlink -f "$old_front/$name")" "$front_release/$name"; fi
done
ln -s "$(readlink -f "$old_admin/node_modules")" "$admin_release/node_modules"
if [ -d "$old_admin/.local" ]; then ln -s "$(readlink -f "$old_admin/.local")" "$admin_release/.local"; fi
if [ -d "$old_admin/mocks" ]; then
  mv "$admin_release/mocks" "$admin_release/mocks.bundled"
  ln -s "$(readlink -f "$old_admin/mocks")" "$admin_release/mocks"
fi
for pair in "$old_front|$front_release" "$old_admin|$admin_release" "$old_front/payments|$front_release/payments"; do
  source_dir=${pair%%|*}; target_dir=${pair#*|}
  for envfile in "$source_dir"/.env "$source_dir"/.env.local "$source_dir"/.env.production; do
    if [ -f "$envfile" ]; then ln -s "$envfile" "$target_dir/$(basename "$envfile")"; fi
  done
done
for name in node_modules keys; do
  if [ -d "$old_front/payments/$name" ]; then ln -s "$(readlink -f "$old_front/payments/$name")" "$front_release/payments/$name"; fi
done
ln -sfn /opt/shiyu/current /opt/shiyu-admin/releases/导航站
ln -sfn /opt/shiyu-admin/current /opt/shiyu/releases/聚合管理后台
printf '%s\n' "$front_commit" > "$front_release/RELEASE_COMMIT"
printf '%s\n' "$admin_commit" > "$admin_release/RELEASE_COMMIT"
chown -hR shiyu:shiyu "$front_release"
/usr/bin/node --check "$front_release/preview.cjs"
/usr/bin/node --check "$front_release/i18n/frontend-server.cjs"
/opt/node-v22/bin/node --check "$admin_release/shiyu-i18n/service.cjs"

switch_link() { ln -sfn "$1" "$2.next"; mv -Tf "$2.next" "$2"; }
rollback() {
  trap - ERR
  echo 'Release failed; restoring both previous versions.' >&2
  switch_link "$old_front" /opt/shiyu/current
  switch_link "$old_admin" /opt/shiyu-admin/current
  systemctl restart shiyu-admin.service shiyu-preview.service
  exit 1
}
trap rollback ERR
switch_link "$admin_release" /opt/shiyu-admin/current
switch_link "$front_release" /opt/shiyu/current
systemctl restart shiyu-admin.service shiyu-preview.service
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:5175/ >/dev/null 2>&1 && curl -fsS http://127.0.0.1:4318/ >/dev/null 2>&1; then break; fi
  sleep 1
done
systemctl is-active --quiet shiyu-admin.service shiyu-preview.service
curl -fsS http://127.0.0.1:4318/api/shiyu/operations -o "/tmp/shiyu-operations-$release_id.json"
grep -q 'corner' "/tmp/shiyu-operations-$release_id.json"
grep -q 'membershipColor' "/tmp/shiyu-operations-$release_id.json"
curl -fsS http://127.0.0.1:4318/api/shiyu/plans -o "/tmp/shiyu-plans-$release_id.json"
grep -q 'isDefault' "/tmp/shiyu-plans-$release_id.json"
curl -fsS http://127.0.0.1:4318/api/shiyu/agreements -o "/tmp/shiyu-agreements-$release_id.json"
grep -q 'membership' "/tmp/shiyu-agreements-$release_id.json"
curl -fsS -H 'Cookie: shiyu-language=en' http://127.0.0.1:4318/ -o "/tmp/shiyu-home-$release_id.html"
grep -q 'earth-theme.js' "/tmp/shiyu-home-$release_id.html"
curl -fsS http://127.0.0.1:5175/api/shiyu/i18n/public -o "/tmp/shiyu-languages-$release_id.json"
locales=$(/opt/node-v22/bin/node -e 'const fs=require("fs");const state=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));console.log(state.settings.languages.filter(l=>l.enabled&&l.code!=="zh-CN").map(l=>l.code).join(" "))' "/tmp/shiyu-languages-$release_id.json")
for locale in $locales; do
  [[ "$locale" =~ ^[a-zA-Z-]+$ ]]
  curl -fsS "http://127.0.0.1:5175/api/shiyu/i18n/asset?locale=$locale&file=v4.js" -o "/tmp/shiyu-$locale-$release_id.js"
  grep -q 'wechat-inline-login' "/tmp/shiyu-$locale-$release_id.js"
done
echo "ENABLED_EXTRA_LOCALES=$locales"
trap - ERR
printf 'ONLINE_RELEASE=%s\nFRONT_COMMIT=%s\nADMIN_COMMIT=%s\nPREVIOUS_FRONT=%s\nPREVIOUS_ADMIN=%s\n' "$release_id" "$front_commit" "$admin_commit" "$old_front" "$old_admin"
