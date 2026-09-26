// Run `pnpm --dir memo-paper install`, then `node memo-paper/build.cjs`.
const path=require('node:path'),fs=require('node:fs');
const modules=process.env.MEMO_BUILD_MODULES||path.join(__dirname,'node_modules');
require(path.join(modules,'esbuild')).buildSync({
  entryPoints:[path.join(__dirname,'engine.js')],bundle:true,format:'esm',target:'es2022',minify:true,
  nodePaths:[modules],outfile:path.join(__dirname,'../dist/assets/memo-paper/engine.js'),
  legalComments:'eof',banner:{js:'/*! Paper Crumple by ITEM Inc. (MIT), adapted for Shiyu. See LICENSE and THIRD_PARTY_NOTICES.txt. */'}
});
fs.copyFileSync(path.join(__dirname,'LICENSE'),path.join(__dirname,'../dist/assets/memo-paper/LICENSE'));
fs.writeFileSync(path.join(__dirname,'../dist/assets/memo-paper/THIRD_PARTY_NOTICES.txt'),
  'Paper Crumple: https://github.com/item-develop/paper-crumple-demo (MIT, 2026 nagasawa / ITEM Inc.)\n\n'+
  ['three','cannon-es'].map(name=>name+'\n'+fs.readFileSync(path.join(modules,name,'LICENSE'),'utf8')).join('\n\n')+'\n\n'+
  'Carousel with drag and wheel: https://codepen.io/supah/pen/xxJMbbg\n'+fs.readFileSync(path.join(__dirname,'LICENSE'),'utf8').replace('Copyright (c) 2026 nagasawa (ITEM Inc.)','Copyright (c) Fabio Ottaviani (supah)'));
