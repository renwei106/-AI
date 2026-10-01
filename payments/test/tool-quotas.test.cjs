const test=require('node:test'),assert=require('node:assert/strict');
const {saveTool,daily,quota}=require('../tool-quotas.cjs');
const rights=(n=2)=>['memo-limit','todo-limit','corner-limit','icon-daily-limit','color-daily-limit'].map(key=>({key,kind:'quantity',enabled:true,value:n}));
const note=(id,extra={})=>({id,title:'记录',...extra});
test('memo total includes archive; trash excluded; full edits and state moves allowed, growth denied',()=>{
 const user={},r=rights();
 let doc=saveTool(user,r,{tool:'memo',revision:0,data:{notes:[note('a'),note('b',{archivedAt:1}),note('c',{deletedAt:1})]}});
 assert.throws(()=>saveTool(user,r,{tool:'memo',revision:doc.revision,data:{notes:[note('a'),note('b',{archivedAt:1}),note('c')]}}),e=>e.code==='TOOL_QUOTA_EXCEEDED');
 doc=saveTool(user,r,{tool:'memo',revision:doc.revision,data:{notes:[note('a',{archivedAt:2}),note('b',{title:'可编辑'}),note('c',{deletedAt:1})]}});
 assert.equal(doc.revision,2);
 assert.throws(()=>saveTool(user,r,{tool:'memo',revision:1,data:doc.data}),e=>e.code==='TOOL_REVISION_CONFLICT');
 // Downgrade preserves all data and allows reductions/edits.
 doc=saveTool(user,rights(1),{tool:'memo',revision:2,data:doc.data});
 assert.equal(doc.data.notes.length,3);
});
test('todo counts all live unfinished tasks once; completion releases, undo/import restore must fit',()=>{
 const user={},r=rights(1),data={calendarV2:{tasks:[{id:'a',done:false},{id:'b',done:true},{id:'c',done:false,deletedAt:1}]}};
 let doc=saveTool(user,r,{tool:'todo',revision:0,data});
 const recovered=structuredClone(data);recovered.calendarV2.tasks[1].done=false;
 assert.throws(()=>saveTool(user,r,{tool:'todo',revision:1,data:recovered}),e=>e.tool==='todo');
 data.calendarV2.tasks[0].done=true;
 doc=saveTool(user,r,{tool:'todo',revision:1,data});
 data.calendarV2.tasks[1].done=false;
 doc=saveTool(user,r,{tool:'todo',revision:doc.revision,data});assert.equal(doc.revision,3);
 const imported=structuredClone(data);imported.calendarV2.tasks.push({id:'d',done:false});
 assert.throws(()=>saveTool(user,r,{tool:'todo',revision:3,data:imported}));
});
test('common cards exclude inbox and use same quota definition as published plans',()=>{
 const user={},r=rights(1);saveTool(user,r,{tool:'corner',revision:0,data:{groups:[{id:'inbox',system:'inbox'},{id:'one'}]}});
 assert.throws(()=>saveTool(user,r,{tool:'corner',revision:1,data:{groups:[{id:'one'},{id:'two'}]}}));
});
test('daily shared pool reserves atomically, retries are idempotent, failed delivery releases once',()=>{
 const user={},r=rights(10),now=Date.parse('2026-10-01T12:00:00+08:00');
 const call=(action,id,amount)=>daily(user,r,{tool:'icons',action,requestId:id,amount},now);
 assert.equal(call('reserve','copy-0001',9).used,9);
 assert.equal(call('reserve','copy-0001',9).used,9);
 assert.throws(()=>call('reserve','download-0002',2),e=>e.code==='TOOL_QUOTA_EXCEEDED');
 assert.equal(call('reserve','download-0002',1).used,10);
 assert.throws(()=>call('reserve','window-0003',1));
 assert.equal(call('cancel','download-0002').used,9);
 assert.equal(call('cancel','download-0002').used,9);
 assert.equal(call('commit','copy-0001').used,9);
 assert.equal(call('cancel','copy-0001').used,9,'committed receipts cannot be refunded');
});
test('Shanghai midnight reset, per-tool independence, plan change retains use, explicit unlimited',()=>{
 const user={},r=rights(1),time=Date.parse('2026-10-01T23:59:59+08:00');
 daily(user,r,{tool:'icons',action:'reserve',requestId:'request-001'},time);
 assert.equal(daily(user,r,{tool:'colors',action:'reserve',requestId:'request-002'},time).used,1);
 assert.equal(daily(user,rights(10),{tool:'icons',action:'reserve',requestId:'request-003',amount:9},time).used,10);
 assert.equal(daily(user,r,{tool:'icons',action:'reserve',requestId:'request-004'},time+1001).used,1);
 assert.equal(daily(user,r,{tool:'icons',action:'commit',requestId:'request-001'},time+1001).date,'2026-10-01');
 r[3].unlimited=true;assert.equal(quota(r,'icon-daily-limit'),Infinity);
 assert.equal(daily(user,r,{tool:'icons',action:'reserve',requestId:'request-005',amount:100},time+1001).limit,null);
 r[3].enabled=false;assert.equal(quota(r,'icon-daily-limit'),0);
});
test('one-time migration preserves existing overage without overwriting the server on repeated import',()=>{
 const user={},r=rights(1),data={notes:[note('a'),note('b')]};
 saveTool(user,r,{tool:'memo',initialize:true,revision:0,data});
 assert.equal(saveTool(user,r,{tool:'memo',initialize:true,revision:0,data:{notes:[]}}).data.notes.length,2);
 assert.throws(()=>saveTool(user,r,{tool:'memo',revision:1,data:{notes:[...data.notes,note('c')]}}));
});
