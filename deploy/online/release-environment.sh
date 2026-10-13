#!/usr/bin/env bash
set -euo pipefail
if [ "${1:-}" != --within-deadline ]; then
  exec timeout --signal=TERM --kill-after=240s 720s bash "$0" --within-deadline "${1:?mode}" "${2:?plan path}" "${3:?plan SHA}"
fi
mode="${2:?mode}"; plan="${3:?plan path}"; expected_sha="${4:?plan SHA}"
[[ "$mode" = preflight || "$mode" = prepare || "$mode" = publish || "$mode" = resume-preflight || "$mode" = resume-publish ]]
[[ "$expected_sha" =~ ^[a-f0-9]{64}$ ]]
[[ "$plan" =~ ^/opt/shiyu/backups/environment-isolation-[0-9]{14}/plan\.json$ ]]
base="$(dirname "$plan")"
test "$(sha256sum "$plan" | cut -d ' ' -f1)" = "$expected_sha"
test "$(id -u)" = 0
exec 8>/opt/shiyu/.coordinated-release.lock
flock -w 5 8
exec 7>/opt/shiyu-admin/.admin-release.lock
flock -w 5 7
exec 9>/opt/shiyu/.front-release.lock
flock -w 5 9
exec 6>/opt/shiyu-tools/.tools-release.lock
flock -w 5 6
# Keep locks while the engine performs its separately bounded reverse-order rollback.
trap ':' TERM INT HUP
/opt/node-v24/bin/node "$base/release-environment.cjs" "$mode" "$plan"
