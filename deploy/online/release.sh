#!/usr/bin/env bash
set -euo pipefail
# The former implementation is preserved in Git history.
printf '%s\n' 'LEGACY_MULTI_SERVICE_RELEASE_DISABLED: use the reviewed per-module workflow and verified production bundle; see deploy/online/README.md.' >&2
exit 64
