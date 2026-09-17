const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8').replaceAll('\r\n', '\n');
const base = name => read('baselines/feedback-before-20260917/' + name);
// A concurrent membership-config task added its own asset include and route after
// the feedback baseline. Preserve those additions and account for them explicitly.
assert.equal(read('dist/index.html').replace('<link rel="stylesheet" href="feedback.css"><script src="feedback.js"></script>', '').replace('<script src="member-plan-config.js"></script>', ''), base('index.html'));
assert.equal(read('preview.cjs').replace("const feedbackHandler=require('./feedback-server.cjs')\n", '').replace("  '/feedback.css':'feedback.css','/feedback.js':'feedback.js',\n", '').replace('  if(await feedbackHandler(req,res))return\n', '').replace("  '/member-plan-config.js':'member-plan-config.js',\n", ''), base('preview.cjs'));
assert.equal(read('.gitignore').replace('.local-feedback/\n', ''), base('.gitignore'));
console.log('PASS scope: only feedback additions plus preserved concurrent member-plan asset/route additions differ from the saved baseline.');
