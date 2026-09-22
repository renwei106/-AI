const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex').slice(0,20);
const {classify}=require('./groups.cjs');
const chinese=/[\u3400-\u9fff]/,variable=/__SHIYU_VAR_\d+__/g;
function parts(text){
 const result=[],masked=text.split(''),add=(start,end,attribute=false)=>{const raw=text.slice(start,end),lead=raw.length-raw.trimStart().length,value=raw.trim();if(chinese.test(value))result.push({start:start+lead,end:start+lead+value.length,source:value,id:hash(value),attribute})};
 // Exported HTML can contain code. It is not ordinary interface text.
 for(const m of text.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi))for(let i=m.index;i<m.index+m[0].length;i++)masked[i]='\0';
 let work=masked.join('');
 for(const m of work.matchAll(/<[^>]*(?:>|$)/g)){const tag=m[0];for(const a of tag.matchAll(/\b(?:title|placeholder|aria-label|alt)\s*=\s*(["'])(.*?)\1/g)){const offset=m.index+a.index+a[0].indexOf(a[2]);add(offset,offset+a[2].length,true)}for(let i=m.index;i<m.index+tag.length;i++)masked[i]='\0'}
 work=masked.join('');
 for(const m of work.matchAll(/[^\0]+/g)){
  const raw=m[0];
  // CSS selectors and partial HTML concatenations: only extract their label values.
  if(/\b(?:aria-label|placeholder|title|alt)\s*=/.test(raw)){for(const a of raw.matchAll(/\b(?:aria-label|placeholder|title|alt)\s*=\s*(["'])(.*?)\1/g)){const start=m.index+a.index+a[0].indexOf(a[2]);add(start,start+a[2].length,true)}const end=raw.lastIndexOf('>');if(end>=0)add(m.index+end+1,m.index+raw.length);continue}
  if(/(?:\bfunction\s*\(|\bconst\s+\w+\s*=|document\.)/.test(raw))continue;
  if(/[<>"']/.test(raw)){for(const a of raw.matchAll(/[\u3400-\u9fff][^<>"'\n]*/g))add(m.index+a.index,m.index+a.index+a[0].length);continue}
  add(m.index,m.index+raw.length);
 }
 return result.sort((a,b)=>a.start-b.start).filter((p,i,all)=>i===0||p.start>=all[i-1].end);
}
function literals(source,filename,ts){
 if(filename.endsWith('.html'))return [{start:0,end:source.length,value:source,html:true}];
 const ast=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 function context(n){const names=[];for(let a=n.parent;a&&a!==ast;a=a.parent){if(a.name)names.push(a.name.getText(ast));if(ts.isBinaryExpression(a)&&a.operatorToken.kind===ts.SyntaxKind.EqualsToken)names.push(a.left.getText(ast));}return names.join(' ')}
 function gather(root){const out=[];function visit(n){
  if(ts.isTemplateExpression(n)){const expressions=n.templateSpans.map(s=>({start:s.expression.getStart(ast),end:s.expression.end,nodes:gather(s.expression)}));let value=n.head.text;n.templateSpans.forEach((s,i)=>value+='__SHIYU_VAR_'+i+'__'+s.literal.text);out.push({start:n.getStart(ast),end:n.end,value,context:context(n),template:true,expressions});return}
  if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){if(n.parent?.name===n&&(ts.isPropertyAssignment(n.parent)||ts.isMethodDeclaration(n.parent)))return;if(chinese.test(n.text))out.push({start:n.getStart(ast),end:n.end,value:n.text,context:context(n),template:ts.isNoSubstitutionTemplateLiteral(n)});return}ts.forEachChild(n,visit)}visit(root);return out}return gather(ast);
}
function walkNodes(nodes,fn){for(const n of nodes){fn(n);for(const e of n.expressions||[])walkNodes(e.nodes,fn)}}
function scan(root,ts){const entries={},files={};const names=fs.readdirSync(root).filter(n=>/\.(js|html)$/.test(n)&&!n.startsWith('i18n-'));for(const name of ['extension/integration.js','extension/store.js'])if(fs.existsSync(path.join(root,name)))names.push(name);for(const name of names){const source=fs.readFileSync(path.join(root,name),'utf8'),nodes=literals(source,name,ts);files[name]={hash:hash(source),nodes};walkNodes(nodes,node=>{for(const p of parts(node.value)){entries[p.id]??={id:p.id,source:p.source,files:[],groups:[],order:Object.keys(entries).length};const entry=entries[p.id];if(!entry.files.includes(name))entry.files.push(name);const markup=node.value.slice(0,p.start),tags=[...markup.matchAll(/<(?:dialog|section|form|div)\b[^>]*(?:id|class)=["']([^"']+)["'][^>]*>/g)];const context=(node.context||'')+' '+tags.slice(-2).map(x=>x[1]).join(' ');const group=classify(name,context,p.source);if(!entry.groups.includes(group))entry.groups.push(group)}})}for(const e of Object.values(entries))if(e.groups.length>1)e.groups=e.groups.filter(g=>g!=='common-actions');return {entries,files}}
function validateTranslation(source,text){if(typeof text!=='string'||!text.trim()||/[<>]/.test(text))throw new Error('译文无效');const tokens=s=>(s.match(variable)||[]).sort().join('|');if(tokens(source)!==tokens(text))throw new Error('译文中的变量占位符必须与原文一致');return text}
function replaceText(text,dictionary){let result=text;for(const p of parts(text).reverse()){const t=validateTranslation(p.source,dictionary[p.id]);const safe=p.attribute?t.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'):t;result=result.slice(0,p.start)+safe+result.slice(p.end)}return result}
function compile(source,filename,inventory,dictionary){const info=inventory.files[filename];if(!info)return source;if(hash(source)!==info.hash)throw new Error('源文案已变化，请重新扫描并发布语言包');const escape=s=>s.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');function segment(start,end,nodes){let value=source.slice(start,end);for(const n of [...nodes].reverse()){let text=replaceText(n.value,dictionary),code;if(n.html)code=text;else if(!n.template)code=JSON.stringify(text);else{code='`'+escape(text).replace(variable,token=>{const i=Number(token.match(/\d+/)[0]),e=n.expressions[i];return '${'+segment(e.start,e.end,e.nodes)+'}'})+'`'}value=value.slice(0,n.start-start)+code+value.slice(n.end-start)}return value}return segment(0,source.length,info.nodes)}
function renderCurrent(source,filename,ts,dictionary={}){
 const nodes=literals(source,filename,ts),current={};
 // A release contains approved text, never an alternative application version.
 // New or changed copy remains in the source language until it is published.
 walkNodes(nodes,node=>{for(const p of parts(node.value))current[p.id]=dictionary[p.id]??p.source});
 return compile(source,filename,{files:{[filename]:{hash:hash(source),nodes}}},current);
}
module.exports={hash,parts,scan,compile,validateTranslation,renderCurrent};


