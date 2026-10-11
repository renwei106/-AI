// Run from the navigation repository root. Upstream src/ is unmodified.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const adminRequire = createRequire(path.resolve(__dirname, '../../../聚合管理后台/package.json'));
const esbuild = createRequire(adminRequire.resolve('vite'))('esbuild');
const out = path.resolve(__dirname, '../../dist/assets/emergence/vendor');
fs.mkdirSync(out, { recursive: true });
esbuild.buildSync({entryPoints:[path.join(__dirname,'core-entry.ts')],bundle:true,format:'esm',target:'es2020',outfile:path.join(out,'gravity-core.js'),banner:{js:'/* Gravity Simulator core, Copyright (c) 2026 Dimitriuses, MIT. See gravity-LICENSE.txt and gravity-UPSTREAM.json. */'}});
fs.copyFileSync(path.join(__dirname,'LICENSE'),path.join(out,'gravity-LICENSE.txt'));
fs.copyFileSync(path.join(__dirname,'UPSTREAM.json'),path.join(out,'gravity-UPSTREAM.json'));
