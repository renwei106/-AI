const {test}=require('node:test');
const assert=require('node:assert/strict');
const {policy,membershipState}=require('../theme-access/server.cjs');
const themes=[{id:'base',enabled:true},{id:'music',enabled:true},{id:'cosmos',enabled:true},{id:'rain',enabled:false}];
const rights=value=>[{key:'themes',kind:'selection',enabled:true,value}];
const plans=[{id:'free',entitlements:rights(['base'])}];
test('membership theme badges use free catalog, access uses actual user plan',()=>{
 const result=policy(themes,plans,rights(['base','music','rain']),true);
 assert.equal(result.items.find(item=>item.id==='music').memberOnly,true);
 assert.equal(result.items.find(item=>item.id==='music').allowed,true);
 assert.equal(result.items.find(item=>item.id==='cosmos').allowed,true);
 assert.equal(result.items.find(item=>item.id==='rain').allowed,false);
 assert.equal(policy(themes,plans).items.find(item=>item.id==='music').allowed,false);
});
test('active members automatically inherit newly enabled themes',()=>{
 const result=policy([...themes,{id:'future-theme',enabled:true}],plans,rights(['base','music']),true);
 assert.equal(result.items.find(item=>item.id==='future-theme').memberOnly,true);
 assert.equal(result.items.find(item=>item.id==='future-theme').allowed,true);
});
test('historic theme flags remain readable and retired resources stay hidden',()=>{
 const result=policy([...themes,{id:'reading',enabled:true}],[{id:'free',entitlements:[{key:'theme-base',enabled:true}]}]);
 assert.equal(result.fallback,'base');assert.equal(result.items.some(item=>item.id==='reading'),false);
});
test('date-only memberships end at China end of day, ISO remains exact',()=>{
 const now=Date.parse('2026-09-20T14:00:00Z');
 const identity=value=>({authenticated:true,user:{member:true,memberExpiresAt:value}});
 assert.equal(membershipState(identity('2026-09-20'),now).member,true);
 assert.equal(membershipState(identity('2026-09-20T13:59:00Z'),now).member,false);
 assert.equal(membershipState(identity('bad-date'),now).member,false);
 assert.equal(membershipState(identity('永久'),now).member,true);
 assert.equal(membershipState({authenticated:true,user:{member:false,memberExpiresAt:'永久'}},now).member,false);
});
