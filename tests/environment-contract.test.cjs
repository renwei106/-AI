'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {validate,outputs}=require('../deploy/generate-environment-contract.cjs');
const source=path.resolve(__dirname,'../deploy/environment-contract.json');
const contract=JSON.parse(fs.readFileSync(source,'utf8'));
test('production browser origins cannot contain loopback, credentials, query strings or paths',()=>{
  for(const value of ['http://127.0.0.1:5175','https://localhost','https://user:password@admin.shiyubox.com','https://admin.shiyubox.com/api','https://admin.shiyubox.com?token=synthetic']){
    const copy=structuredClone(contract);copy.profiles.production.browserOrigins.admin.push(value);assert.throws(()=>validate(copy));
  }
});
test('development and fixtures never acquire production browser origins or automatic fallback',()=>{
  for(const mode of ['development','test']){const copy=structuredClone(contract);copy.profiles[mode].browserOrigins.admin.push('https://admin.shiyubox.com');assert.throws(()=>validate(copy));}
  const fallback=structuredClone(contract);fallback.profiles.development.allowDevelopmentFallback=true;assert.throws(()=>validate(fallback));
});
test('production loopback is allowed only in registered server upstreams, with explicit paused services',()=>{
  assert.equal(validate(contract),contract);
  assert.equal(contract.profiles.production.internalServices.spaceAdmin.enabled,false);
  assert.equal(contract.profiles.production.internalServices.timeAdmin.enabled,false);
  for(const origin of ['https://admin.shiyubox.com','http://192.168.1.10:5175','http://user:password@127.0.0.1:5175']){const copy=structuredClone(contract);copy.profiles.production.internalServices.admin.origin=origin;assert.throws(()=>validate(copy));}
});
test('browser artifact is generated from the canonical contract and carries its exact fingerprint',()=>{
  const generated=outputs()[0];assert.equal(fs.readFileSync(generated.file,'utf8'),generated.contents);
  const browser=require('../dist/environment-policy-data.js');assert.deepEqual(browser.environmentContract,contract);
  assert.equal(browser.environmentContractSha256,createHash('sha256').update(fs.readFileSync(source)).digest('hex'));
});

test('extension origins are a separate exact signed-package list, never a site or development fallback',()=>{
  assert.deepEqual(contract.profiles.production.extensionOrigins,['chrome-extension://aimemjbbacgllnbkibgjpeajmnokapoh']);
  for(const origin of ['chrome-extension://*','chrome-extension://unknown','chrome-extension://AIMEMJBBACGLLNBKIBGJPEAJMNOKAPOH','moz-extension://random','https://shiyubox.com','null']){
    const copy=structuredClone(contract);copy.profiles.production.extensionOrigins.push(origin);assert.throws(()=>validate(copy));
  }
  for(const mode of ['development','test']){const copy=structuredClone(contract);copy.profiles[mode].extensionOrigins=[...contract.profiles.production.extensionOrigins];assert.throws(()=>validate(copy));}
  assert.equal(Object.values(contract.profiles.production.browserOrigins).flat().some(origin=>origin.startsWith('chrome-extension:')),false);
});

test('public unpacked extension compatibility cannot expand beyond the native JSON tool-write route',()=>{
  for(const [key,value] of Object.entries({method:'PUT',path:'/api/shiyu/auth/',originScheme:'https',idPattern:'.*',secFetchSite:'cross-site',contentType:'text/plain'})){
    const copy=structuredClone(contract);copy.rules.nativeExtensionToolWrite[key]=value;assert.throws(()=>validate(copy));
  }
  const extra=structuredClone(contract);extra.rules.nativeExtensionToolWrite.allowMissingOrigin=true;assert.throws(()=>validate(extra));
});
