const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createWechatProfile,safeAvatar}=require('../../聚合管理后台/shiyu-wechat-profile.cjs');
function fixture(){
  let clock=1000,items=[],identity=null,writes=0,mode='ok',calls=0;
  const cfg={enabled:true,appId:'app-test',appSecret:'secret'};
  const api=createWechatProfile({config:()=>cfg,users:()=>structuredClone(items),save:value=>{items=structuredClone(value);writes++},session:()=>identity&&structuredClone(items.find(u=>u.id===identity)),json:(res,status,data)=>{res.statusCode=status;res.data=data;res.end()},body:async req=>req.body,now:()=>clock,fetch:async url=>{
    calls++;if(mode==='fail')throw Error('offline');
    const data=url.includes('/access_token?')?{access_token:'secret-token',openid:mode==='wrong'?'other':'openid',scope:'snsapi_userinfo'}:{openid:'openid',nickname:'微信昵称',headimgurl:'http://thirdwx.qlogo.cn/a/132'};
    return {ok:true,json:async()=>data};
  }});
  function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},end(value){this.text=value},statusCode:200}}
  async function call(path,method='GET',body,origin='https://shiyubox.com'){const res=response();await api.handle({method,headers:{origin,'content-type':'application/json'},body},res,new URL(path,'https://shiyubox.com'));return res;}
  function link(){const reply=api.reply('openid','service','app-test');assert.match(reply,/注册登录不受影响/);return reply.match(/ticket=([a-f0-9]+)/)[1];}
  function register(){const u={id:'U1',wechatAppId:'app-test',wechatOpenId:'openid',name:'一隅拾光',status:'active'};api.enroll(u,true);items=[u];identity='U1';return u;}
  return {api,call,link,register,get items(){return items},set items(v){items=v},set mode(v){mode=v},get writes(){return writes},get calls(){return calls},set clock(v){clock=v}};
}
test('late mobile authorization updates an already registered account without establishing a session',async()=>{
  const f=fixture(),ticket=f.link();f.register();
  assert.equal((await f.call('/api/shiyu/auth/wechat/profile')).data.pending,true);
  const start=await f.call('/api/shiyu/auth/wechat/profile-start?ticket='+ticket);const target=new URL(start.headers.Location);
  assert.equal(target.searchParams.get('scope'),'snsapi_userinfo');assert.equal(target.searchParams.get('redirect_uri'),'https://shiyubox.com/api/shiyu/auth/wechat/profile-callback');
  const callback=await f.call('/api/shiyu/auth/wechat/profile-callback?state='+ticket+'&code=code');assert.equal(callback.statusCode,200);assert.equal(callback.headers['Set-Cookie'],undefined);
  const result=(await f.call('/api/shiyu/auth/wechat/profile')).data;assert.equal(result.nickname,'微信昵称');assert.match(result.avatar,/^wechat:[a-f0-9]{24}$/);assert.equal(result.pending,false);assert.equal(result.avatarUrl,undefined);
  assert.equal((await f.call('/api/shiyu/auth/wechat/profile-callback?state='+ticket+'&code=code')).statusCode,410);
});
test('authorization before registration is retained independently of the login ticket',async()=>{const f=fixture(),ticket=f.link();await f.call('/api/shiyu/auth/wechat/profile-callback?state='+ticket+'&code=code');assert.equal(f.writes,0);f.register();assert.equal((await f.call('/api/shiyu/auth/wechat/profile')).data.nickname,'微信昵称');});
test('manual fields win independently, even when marked before OAuth completes',async()=>{const f=fixture(),ticket=f.link();f.register();await f.call('/api/shiyu/auth/wechat/profile','PUT',{userId:'U1',nameManual:true});await f.call('/api/shiyu/auth/wechat/profile-callback?state='+ticket+'&code=code');let result=(await f.call('/api/shiyu/auth/wechat/profile')).data;assert.equal(result.nickname,'');assert.ok(result.avatar);await f.call('/api/shiyu/auth/wechat/profile','PUT',{userId:'U1',avatarManual:true});result=(await f.call('/api/shiyu/auth/wechat/profile')).data;assert.equal(result.avatar,'');assert.equal((await f.call('/api/shiyu/auth/wechat/profile-avatar')).statusCode,404);});
test('wrong WeChat identity, forged state, expired links and upstream failure never alter the account',async()=>{for(const mode of ['wrong','fail','expired','forged']){const f=fixture(),ticket=f.link();f.register();if(mode==='expired')f.clock=1000000;else f.mode=mode;const r=await f.call('/api/shiyu/auth/wechat/profile-callback?state='+(mode==='forged'?'invalid':ticket)+'&code=code');assert.ok(r.statusCode>=400);assert.equal(f.writes,0);assert.equal(f.items[0].wechatProfile.revision,undefined);}});
test('legacy users are not prompted or enrolled; no-session and cross-origin writes rejected',async()=>{const f=fixture();assert.equal((await f.call('/api/shiyu/auth/wechat/profile')).statusCode,401);f.items=[{id:'old',wechatAppId:'app-test',wechatOpenId:'openid'}];assert.equal(f.api.reply('openid','service','app-test'),'');f.register();assert.equal((await f.call('/api/shiyu/auth/wechat/profile','PUT',{userId:'U2',nameManual:true})).statusCode,409);assert.equal((await f.call('/api/shiyu/auth/wechat/profile','PUT',{userId:'U1',nameManual:true},'https://evil.test')).statusCode,403);assert.equal(f.writes,0);});
test('image URLs cannot target arbitrary hosts, credentials or ports',()=>{for(const value of ['https://qlogo.cn.evil.test/a','https://127.0.0.1/a','https://a.qlogo.cn:8443/a','https://user@qlogo.cn/a','data:image/png;base64,aaa'])assert.equal(safeAvatar(value),'');assert.equal(safeAvatar('http://thirdwx.qlogo.cn/a'),'https://thirdwx.qlogo.cn/a');});
