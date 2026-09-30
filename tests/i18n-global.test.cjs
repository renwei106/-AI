const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const ts=require('../../聚合管理后台/node_modules/typescript');
const {hash,scan,renderCurrent,validateTranslation}=require('../i18n/catalog.cjs');
const {importEditorial}=require('../i18n/import-editorial.cjs');
const {appendConfigCopy}=require('../i18n/config-copy.cjs');
const ed=require('../i18n/editorial-en.json');

test('all current frontend copy has valid English; localized scripts remain parseable',()=>{
 const root=path.resolve(__dirname,'../dist'),inventory=scan(root,ts),dictionary={};
 for(const entry of Object.values(inventory.entries)){
  assert.equal(ed[entry.id]?.source,entry.source,'missing: '+entry.source);
  dictionary[entry.id]=validateTranslation(entry.source,ed[entry.id].text);
  assert.ok(!/[\u3400-\u9fff]/.test(dictionary[entry.id]),entry.source);
 }
 for(const file of Object.keys(inventory.files).filter(f=>f.endsWith('.js'))){const output=renderCurrent(fs.readFileSync(path.join(root,file),'utf8'),file,ts,dictionary);assert.equal(ts.createSourceFile(file,output,ts.ScriptTarget.Latest,true).parseDiagnostics.length,0,file)}
});

test('English reaches nested lazy modules without changing vendor imports, version or fragment',()=>{
 const output=renderCurrent("import {x} from './todo-calendar-core.js'; const p=import('./memo-paper.js?v=42#keep');const vendor=import('./assets/engine.js');const external=import('https://example.test/a.js');",'corner.js',ts,{},'en');
 assert.match(output,/todo-calendar-core.js\?locale=en/);
 assert.match(output,/memo-paper.js\?v=42&locale=en#keep/);
 assert.match(output,/import\('\.\/assets\/engine.js'\)/);
 assert.match(output,/import\('https:\/\/example.test\/a.js'\)/);
});

test('runtime translates approved public labels while preserving switches, URLs and user content',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../i18n/runtime.js'),'utf8'),dictionary={'我的小记':'Notes','用户内容':'must not replace','日常生活':'Daily life'};
 const sandbox={window:{SHIYU_LOCALE_STATE:{locale:'en',dictionary}}};vm.runInNewContext(source,sandbox);
 const config={world:{enabled:false,whitelist:'用户内容'},corner:{modules:[{id:'用户内容',entryName:'我的小记',href:'https://example.test/用户内容',enabled:false}]},account:{name:'用户内容',notes:['我的小记']}};
 const before=JSON.stringify(config),translated=sandbox.window.ShiyuI18n.operations(config);
 assert.equal(JSON.stringify(config),before);assert.equal(translated.corner.modules[0].entryName,'Notes');assert.equal(translated.corner.modules[0].id,'用户内容');assert.equal(translated.corner.modules[0].enabled,false);assert.equal(translated.corner.modules[0].href,config.corner.modules[0].href);assert.equal(translated.world.whitelist,'用户内容');assert.equal(translated.account.notes[0],'我的小记');assert.equal(sandbox.window.ShiyuI18n.text('新增未审核'),'新增未审核');
 const chinese={window:{SHIYU_LOCALE_STATE:{locale:'zh-CN'}}};vm.runInNewContext(source,chinese);assert.equal(chinese.window.ShiyuI18n.operations(config),config);
});

test('import preserves settings, notices, other languages and release until explicitly published',async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'shiyu-i18n-import-')),root=path.join(directory,'dist'),store=path.join(directory,'state.json');
 try{
  fs.mkdirSync(root);fs.writeFileSync(path.join(root,'app.js'),'const label="我的小记";');fs.writeFileSync(path.join(directory,'shiyu-operations.json'),JSON.stringify({corner:{modules:[{entryName:'我的常用',href:'https://example.test/秘密',id:'不应入库'}]},world:{whitelist:'私密名单'}}));
  const id=hash('我的小记'),initial={settings:{languages:[{code:'en',enabled:true}]},entries:{[id]:{source:'我的小记',translations:{ja:{text:'メモ',approved:true}}}},inventory:{entries:{},files:{}},notices:{announcement:{draft:{body:'保留'}}},releases:{en:{dictionary:{[id]:'Old notes'}}}};
  fs.writeFileSync(store,JSON.stringify(initial));const options={root,store,ts,editorial:ed};
  const result=await importEditorial(options);assert.equal(result.applied,false);assert.deepEqual(JSON.parse(fs.readFileSync(store)),initial);
  await importEditorial({...options,apply:true});const after=JSON.parse(fs.readFileSync(store));assert.deepEqual(after.settings,initial.settings);assert.deepEqual(after.notices,initial.notices);assert.deepEqual(after.releases,initial.releases);assert.deepEqual(after.entries[id].translations.ja,initial.entries[id].translations.ja);assert.equal(after.entries[id].translations.en.text,'Notes');assert.ok(after.inventory.entries[hash('我的常用')]);assert.ok(!after.inventory.entries[hash('私密名单')]);assert.ok(!after.inventory.entries[hash('不应入库')]);
  await importEditorial({...options,apply:true,publish:true});assert.equal(JSON.parse(fs.readFileSync(store)).releases.en.dictionary[id],'Notes');
 }finally{fs.rmSync(directory,{recursive:true,force:true})}
});
