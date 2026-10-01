'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { create, verify, restore, audit } = require('./account-snapshot.cjs');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-backup-test-'));
  const keyFile = path.join(root, 'key'), source = path.join(root, 'users.json'), vault = path.join(root, 'vault');
  fs.writeFileSync(keyFile, crypto.randomBytes(32), { mode: 0o600 });
  // No real accounts or production files are used by these tests.
  const user = {
    id: 'test-user-a', password: 'fixture-only', accountData: [{ id: 's1', name: '空间一', scenes: [{ id: 'c1', name: '场景一', groups: [
      { id: 'g1', name: '分组一', items: [['原名称', 'https://example.test/one', '原描述', 'N']] },
      { id: 'g2', name: '分组二', items: [] },
    ] }] }],
    toolData: {
      memo: { revision: 1, data: { notes: [{ id: 'm1', title: '小记一', body: '正文一' }, { id: 'm2', title: '小记二', archivedAt: 123 }], cardOrder: ['m2', 'm1'] } },
      todo: { revision: 3, data: { calendarV2: { tasks: [{ id: 't1', title: '任务', done: false, date: '2026-10-02' }], groups: [{ id: 'tg1', name: '工作' }] } } },
      corner: { revision: 2, data: { groups: [{ id: 'card1', refs: [{ id: 'ref1', sid: 's1', cid: 'c1', gid: 'g1', url: 'https://example.test/one' }] }] } },
    },
    unknownFutureField: { nested: ['keep', 42] },
  };
  const second = structuredClone(user); second.id = 'test-user-b';
  const document = { items: [user, second], updatedAt: 'fixture', unknownRoot: true };
  const write = () => { const raw = Buffer.from(JSON.stringify(document, null, 2) + '\n'); fs.writeFileSync(source, raw); return raw; };
  const options = { source, vault, keyFile, environment: 'test' };
  // Resolve and check the exact temporary directory before recursive cleanup.
  t.after(() => {
    const resolved = fs.realpathSync(root), temp = fs.realpathSync(os.tmpdir());
    assert.equal(path.dirname(resolved), temp); assert.ok(path.basename(resolved).startsWith('shiyu-backup-test-'));
    fs.rmSync(resolved, { recursive: true });
  });
  write(); return { root, user, document, write, options };
}
test('新增、修改、移动、排序、删除：每份新快照保存最新状态，旧快照逐字节恢复', t => {
  const f = fixture(t), saved = [];
  const capture = () => {
    const raw = f.write(), snapshot = create(f.options);
    assert.deepEqual(snapshot.warnings, []); saved.push({ raw, snapshot });
  };
  capture();
  const groups = f.user.accountData[0].scenes[0].groups;
  groups[0].items.push(['新增网址', 'https://example.test/two', '', 'T']); capture();
  groups[0].items[0][0] = '修改后的名称'; groups[0].items[0][2] = '修改后的描述';
  f.user.toolData.memo.data.notes[0].body = '修改后的正文';
  f.user.toolData.todo.data.calendarV2.tasks[0].done = true; capture();
  groups[1].items.push(groups[0].items.shift());
  f.user.toolData.corner.data.groups[0].refs[0].gid = 'g2';
  f.user.accountData[0].scenes.push({ id: 'c2', name: '新场景', groups: [{ id: 'g3', items: [] }] });
  f.user.accountData.push({ id: 's2', name: '新空间', scenes: [] }); capture();
  groups.reverse(); f.user.accountData.reverse(); f.user.toolData.memo.data.cardOrder.reverse();
  f.user.toolData.todo.data.calendarV2.tasks.push({ id: 't2', title: '新的事项', done: false });
  f.user.toolData.todo.data.calendarV2.tasks.reverse(); capture();
  groups.find(g => g.id === 'g2').items = []; f.user.toolData.corner.data.groups[0].refs = [];
  f.user.toolData.memo.data.notes[0].deletedAt = 456; capture();
  assert.equal(fs.readdirSync(f.options.vault).length, saved.length);
  saved.forEach(({ raw, snapshot }, index) => {
    const result = restore({ ...f.options, file: snapshot.file, target: path.join(f.root, 'restore-' + index) });
    assert.deepEqual(fs.readFileSync(result.output), raw);
    const restored = JSON.parse(fs.readFileSync(result.output));
    assert.deepEqual(restored.items[1], f.document.items[1]);
    assert.deepEqual(restored.items[0].unknownFutureField, f.user.unknownFutureField);
  });
  assert.equal(verify({ ...f.options, file: saved[1].snapshot.file }).report.counts.urls, 3);
  assert.equal(verify({ ...f.options, file: saved.at(-1).snapshot.file }).report.counts.urls, 2);
});
test('同名网址处于不同分组，按完整位置保留；不按 URL 去重', t => {
  const f = fixture(t), groups = f.user.accountData[0].scenes[0].groups;
  groups[1].items.push(structuredClone(groups[0].items[0])); f.write();
  const result = create(f.options); assert.equal(result.counts.urls, 3); assert.deepEqual(result.warnings, []);
});
test('已有失效引用会报告，快照不静默修复或丢弃原始关系', t => {
  const f = fixture(t); f.user.accountData[0].scenes[0].groups[0].items = []; const raw = f.write();
  const snapshot = create(f.options); assert.deepEqual(snapshot.warnings, [{ userIndex: 0, code: 'REF_PATH_UNRESOLVED' }]);
  assert.deepEqual(verify({ ...f.options, file: snapshot.file }).raw, raw);
});
test('快照加密，不暴露账号正文；错误密钥不能解密', t => {
  const f = fixture(t), snapshot = create(f.options), bytes = fs.readFileSync(snapshot.file);
  assert.equal(bytes.includes(Buffer.from('fixture-only')), false);
  const wrong = path.join(f.root, 'wrong-key'); fs.writeFileSync(wrong, crypto.randomBytes(32), { mode: 0o600 });
  assert.throws(() => verify({ ...f.options, file: snapshot.file, keyFile: wrong }));
});
test('篡改或截断快照时拒绝恢复，且不创建恢复目录', t => {
  const f = fixture(t), snapshot = create(f.options), original = fs.readFileSync(snapshot.file);
  for (const bytes of [original.subarray(0, original.length - 1), Buffer.from(original)]) {
    bytes[bytes.length - 1] ^= 1;
    const damaged = path.join(f.root, crypto.randomUUID() + '.shiyubak'); fs.writeFileSync(damaged, bytes);
    const target = path.join(f.root, 'should-not-exist');
    assert.throws(() => restore({ ...f.options, file: damaged, target })); assert.equal(fs.existsSync(target), false);
  }
});
test('拒绝把测试备份误认为生产备份', t => {
  const f = fixture(t), snapshot = create(f.options);
  assert.throws(() => verify({ ...f.options, file: snapshot.file, environment: 'production' }), /environment/);
  assert.throws(() => verify({ ...f.options, file: snapshot.file, environment: undefined }), /environment/);
});
test('恢复不覆盖已有文件或目录，原业务数据不变', t => {
  const f = fixture(t), raw = fs.readFileSync(f.options.source), snapshot = create(f.options);
  assert.throws(() => restore({ ...f.options, file: snapshot.file, target: f.root }));
  assert.throws(() => restore({ ...f.options, file: snapshot.file, target: f.options.source }));
  assert.deepEqual(fs.readFileSync(f.options.source), raw);
});
test('坏 JSON、重复 ID 不能生成伪成功的新快照，历史仍保留', t => {
  const f = fixture(t), snapshot = create(f.options), old = fs.readFileSync(snapshot.file);
  fs.writeFileSync(f.options.source, '{'); assert.throws(() => create(f.options));
  f.document.items.push(f.document.items[0]); f.write(); assert.throws(() => create(f.options), /duplicate IDs/);
  assert.deepEqual(fs.readFileSync(snapshot.file), old); assert.equal(fs.readdirSync(f.options.vault).length, 1);
});
test('空账号库可以备份，缺失来源不能当空库成功', t => {
  const f = fixture(t); f.document.items = []; f.write();
  assert.equal(create(f.options).counts.users, 0);
  assert.throws(() => create({ ...f.options, source: path.join(f.root, 'missing') }));
});
test('密钥不能保存在备份目录中，也不接受短密钥', t => {
  const f = fixture(t); fs.mkdirSync(f.options.vault);
  const keyFile = path.join(f.options.vault, 'key'); fs.copyFileSync(f.options.keyFile, keyFile); fs.chmodSync(keyFile, 0o600);
  assert.throws(() => create({ ...f.options, keyFile }), /outside/);
  fs.writeFileSync(f.options.keyFile, 'short'); assert.throws(() => create(f.options), /32/);
});
test('备份未包含尚未保存的浏览器修改', t => {
  const f = fixture(t); f.user.accountData[0].name = '尚未提交服务器';
  const snapshot = create(f.options), decoded = verify({ ...f.options, file: snapshot.file });
  assert.equal(JSON.parse(decoded.raw).items[0].accountData[0].name, '空间一');
});
test('排序残留引用独立报告，归档和删除标志不被过滤', t => {
  const f = fixture(t); f.user.toolData.memo.data.cardOrder.push('missing');
  assert.ok(audit(f.document).warnings.some(w => w.code === 'MEMO_ORDER_STALE'));
});
test('定时任务日志同时保留成功、失败环节和结构化原因，不泄露坏 JSON 的内容', t => {
  const f = fixture(t), { run } = require('./run-backup.cjs'), logDir = path.join(f.root, 'logs');
  const success = run({ ...f.options, logDir });
  assert.equal(success.status, 'success'); assert.equal(success.snapshot.coverage.withMemo, 2);
  fs.writeFileSync(f.options.source, '{ SECRET_PERSONAL_CONTENT');
  const failed = run({ ...f.options, logDir });
  assert.equal(failed.status, 'failed'); assert.equal(failed.phase, 'validate_source');
  assert.equal(JSON.stringify(failed).includes('SECRET_PERSONAL_CONTENT'), false);
  assert.equal(fs.readdirSync(logDir).length, 4);
  assert.equal(fs.readdirSync(f.options.vault).length, 1);
});
test('缺失工具内容以覆盖统计呈现，不声称本机内容已备份', t => {
  const f = fixture(t); delete f.user.toolData; f.write();
  const report = create(f.options);
  assert.equal(report.counts.users, 2); assert.equal(report.coverage.withMemo, 1);
});
