'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

test('retired multi-service entrypoints reject before records, paths, uploads or service operations', t => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-retired-publish-'));
  assert(fixture.startsWith(path.resolve(os.tmpdir()) + path.sep));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  const ps = path.join(__dirname, 'publish.ps1'), sh = path.join(__dirname, 'release.sh');
  const marker = 'LEGACY_MULTI_SERVICE_RELEASE_DISABLED';
  const psSource = fs.readFileSync(ps, 'utf8'), shSource = fs.readFileSync(sh, 'utf8');
  assert(psSource.includes("throw '" + marker)); assert(!psSource.includes('Mandatory'));
  assert(!/Resolve-Path|scp\.exe|ssh\.exe|pnpm/.test(psSource));
  assert(shSource.includes('exit 64')); assert(!/release_id=|systemctl|readlink|tar -/.test(shSource));
  const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
  const result = spawnSync(powershell, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', ps, '-ReleaseRecord', path.join(fixture, 'missing-record.json'), '-AdminRepo', path.join(fixture, 'missing-admin'), '-ToolsRepo', path.join(fixture, 'missing-tools')], { cwd: fixture, timeout: 10000, encoding: 'utf8' });
  assert.equal(result.status, 1, result.stderr); assert.match(result.stdout + result.stderr, new RegExp(marker));
  let bash = 'bash';
  if (process.platform === 'win32') {
    const git = spawnSync('where.exe', ['git.exe'], { encoding: 'utf8', timeout: 3000 }).stdout.trim().split(/\r?\n/)[0];
    bash = path.resolve(git, '..', '..', 'bin', 'bash.exe');
    assert(fs.existsSync(bash), 'Git Bash is required for the shell entrypoint check');
  }
  const shell = spawnSync(bash, ['--noprofile', '--norc', sh.replaceAll('\\', '/')], { cwd: fixture, timeout: 10000, encoding: 'utf8' });
  assert.equal(shell.status, 64, shell.stderr); assert.match(shell.stderr, new RegExp(marker));
  assert.deepEqual(fs.readdirSync(fixture), [], 'Retired entrypoints wrote files before rejecting');
});
