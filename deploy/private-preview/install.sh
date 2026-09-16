#!/usr/bin/env bash
set -euo pipefail

release_id="${1:?release id is required}"
archive="/tmp/shiyu-preview.tgz"
app_root="/opt/shiyu"
release_dir="${app_root}/releases/${release_id}"
service_user="shiyu"

if [[ ! -f "${archive}" ]]; then
  echo "Missing deployment archive: ${archive}" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi

if ! id "${service_user}" >/dev/null 2>&1; then
  useradd --system --home-dir "${app_root}" --shell /usr/sbin/nologin "${service_user}"
fi

install -d -o "${service_user}" -g "${service_user}" "${app_root}/releases" "${app_root}/shared/.local-shares"
install -d "${release_dir}"
tar -xzf "${archive}" -C "${release_dir}"
ln -s "${app_root}/shared/.local-shares" "${release_dir}/.local-shares"
chown -R "${service_user}:${service_user}" "${release_dir}" "${app_root}/shared"
ln -sfn "${release_dir}" "${app_root}/current"

cat >/etc/systemd/system/shiyu-preview.service <<'UNIT'
[Unit]
Description=Shiyu private preview
After=network.target

[Service]
Type=simple
User=shiyu
Group=shiyu
WorkingDirectory=/opt/shiyu/current
Environment=HOST=0.0.0.0
Environment=PORT=4318
ExecStart=/usr/bin/node /opt/shiyu/current/preview.cjs
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=/opt/shiyu/shared/.local-shares

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now shiyu-preview.service
systemctl restart shiyu-preview.service

for _ in {1..20}; do
  if curl --fail --silent --show-error http://127.0.0.1:4318/ >/dev/null; then
    echo "Shiyu private preview is running on 127.0.0.1:4318"
    exit 0
  fi
  sleep 0.5
done

systemctl status shiyu-preview.service --no-pager
exit 1
