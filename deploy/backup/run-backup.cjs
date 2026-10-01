'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { create, publish } = require('./account-snapshot.cjs');
const reasons = {
  ENOENT: '找不到来源、密钥或目标路径，请核对配置和挂载状态。',
  EACCES: '没有读取来源或写入备份目录的权限。',
  EPERM: '操作被文件权限或系统策略拒绝。',
  ENOSPC: '磁盘空间不足，新的备份未完成。',
  EIO: '磁盘读写出现错误。',
  EROFS: '目标磁盘为只读状态。',
};
function run(config) {
  for (const name of ['source', 'vault', 'keyFile', 'logDir']) {
    if (typeof config[name] !== 'string' || !path.isAbsolute(config[name])) throw Error('Backup config requires absolute paths');
  }
  const startedAt = new Date().toISOString(), id = crypto.randomUUID();
  const record = { id, startedAt, environment: config.environment, status: 'running', phase: 'prepare_log', offsiteVerified: false };
  // Cannot run without durable reporting. Errors before this point go to systemd journal.
  fs.mkdirSync(config.logDir, { recursive: true, mode: 0o700 });
  publish(path.join(config.logDir, id + '.started.json'), Buffer.from(JSON.stringify(record)));
  try {
    record.snapshot = create({ ...config, onStage: stage => { record.phase = stage; } });
    record.status = record.snapshot.warnings.length ? 'warning' : 'success';
    record.phase = 'complete';
    if (record.status === 'warning') record.reason = '快照已保留，但发现原始数据关系警告，请审查。';
  } catch (error) {
    record.status = 'failed';
    record.reasonCode = Object.hasOwn(reasons, error.code) ? error.code : 'BACKUP_FAILED';
    // JSON parse errors may contain personal data: never record exception.message.
    record.reason = reasons[record.reasonCode] || ({
      read_key: '密钥无效或权限不符合要求。',
      read_source: '读取来源时检测到文件变化或大小不符合要求。',
      validate_source: '来源不是完整账号 JSON，或存在无效结构、重复 ID。',
      prepare_vault: '备份目录配置不符合要求，来源和密钥须在目录之外。',
      verify_snapshot: '落盘后的解密或完整性校验失败。',
    }[record.phase] || '备份未完成，请按失败环节检查配置和系统日志。');
  }
  record.finishedAt = new Date().toISOString();
  publish(path.join(config.logDir, id + '.finished.json'), Buffer.from(JSON.stringify(record)));
  return record;
}
module.exports = { run };
if (require.main === module) {
  try {
    const record = run(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
    console.log(JSON.stringify(record));
    process.exitCode = record.status === 'success' ? 0 : record.status === 'warning' ? 2 : 1;
  } catch {
    console.error(JSON.stringify({ status: 'failed', phase: 'config_or_log', reason: '配置无法读取或备份日志无法写入，请检查计划任务系统日志。' }));
    process.exitCode = 1;
  }
}
