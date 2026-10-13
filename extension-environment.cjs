'use strict';
const fs = require('node:fs');
const path = require('node:path');
const contract = require('./deploy/environment-contract.json');

function selectProfile(args = process.argv.slice(2)) {
  const requested = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--production') requested.push('production');
    else if (arg === '--development') requested.push('development');
    else if (arg === '--profile') requested.push(args[++index]);
    else if (arg.startsWith('--profile=')) requested.push(arg.slice('--profile='.length));
  }
  if (requested.length !== 1 || !['production', 'development'].includes(requested[0])) {
    throw Error('Select exactly one extension profile: --profile=production or --profile=development');
  }
  return requested[0];
}
function targets(profile) {
  if (!['production', 'development'].includes(profile)) throw Error('Invalid extension profile');
  const origin = contract.profiles[profile].browserOrigins.site[0];
  const url = new URL(origin);
  return { siteUrls: [origin + '/'], hostPermissions: [url.protocol + '//' + url.hostname + '/*'] };
}
function configTargets(source) {
  const literal = /^export const SITE_URLS = (\[[^\r\n]*\]);\s*$/m.exec(source)?.[1];
  if (!literal || !/^\[\s*(?:['"][^'"\\]+['"]\s*,?\s*)*\]$/.test(literal)) throw Error('Invalid extension target configuration');
  return [...literal.matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1]);
}
function assertPackageProfile(directory, profile) {
  const actual = configTargets(fs.readFileSync(path.join(directory, 'config.js'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  const expected = targets(profile);
  if (JSON.stringify(actual) !== JSON.stringify(expected.siteUrls) || JSON.stringify(manifest.host_permissions) !== JSON.stringify(expected.hostPermissions)) {
    throw Error('Extension profile targets or permissions do not match the environment contract');
  }
}
function writePackageProfile(directory, profile) {
  const expected = targets(profile);
  const manifestFile = path.join(directory, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  manifest.host_permissions = expected.hostPermissions;
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'config.js'), 'export const SITE_URLS = ' + JSON.stringify(expected.siteUrls) + ';\n');
  assertPackageProfile(directory, profile);
}
module.exports = { selectProfile, targets, configTargets, assertPackageProfile, writePackageProfile };
