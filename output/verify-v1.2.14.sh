set -eu
printf '\nVERSIONS\n'
cat /opt/shiyu/current/RELEASE_VERSION
cat /opt/shiyu/current/RELEASE_COMMIT
cat /opt/shiyu-admin/current/RELEASE_COMMIT
printf '\nFRONT_HASHES\n'
(cd /opt/shiyu/current && sha256sum -c /tmp/shiyu-front-20261009101810.sha256)
printf '\nADMIN_HASHES\n'
(cd /opt/shiyu-admin/current && sha256sum -c /tmp/shiyu-admin-20261009101810.sha256)
printf '\nSERVICES\n'
systemctl show shiyu-preview shiyu-admin shiyu-tools -p Id -p ActiveState -p MemoryCurrent -p NRestarts
printf '\nKERNEL_WARNINGS\n'
journalctl -k -p warning --since=2026-10-09 --no-pager -n 25
printf '\nLOCAL_HEALTH\n'
curl --max-time 8 -s -o /dev/null -w 'front %{http_code}\n' http://127.0.0.1:4318/
curl --max-time 8 -s -o /dev/null -w 'admin %{http_code}\n' http://127.0.0.1:5175/login