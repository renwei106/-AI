import assert from 'node:assert/strict';
const get=url=>fetch(url,{redirect:'manual',signal:AbortSignal.timeout(10000)});
const canonical=html=>[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)].map(m=>m[1]);
for(const domain of ['shiyubox.com','www.shiyubox.com']){
 const base='https://'+domain+'/',home=await get(base);assert.equal(home.status,200);
 const html=await home.text();assert.deepEqual(canonical(html),[base]);
 if(domain.startsWith('www.')){
  assert.match(html,/<title>拾隅官网｜个性化起始页，网址收藏与导航<\/title>/);
  assert.match(html,/content="拾隅是一站式个性化网址收藏与导航平台/);
 }
 const robots=await get(base+'robots.txt');assert.equal(robots.status,200);assert.match(robots.headers.get('content-type'),/text\/plain/);assert((await robots.text()).includes('Sitemap: '+base+'sitemap.xml'));
 const sitemap=await get(base+'sitemap.xml');assert.equal(sitemap.status,200);assert.match(sitemap.headers.get('content-type'),/xml/);assert.deepEqual([...((await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g))].map(m=>m[1]),[base]);
}
for(const url of ['https://space.shiyubox.com/','https://world.shiyubox.com/','https://shiyubox.com/?page=membership']){const r=await get(url);assert.equal(r.status,200);assert(!canonical(await r.text()).includes('https://shiyubox.com/'),url)}
const old=await get('https://shiyubox.com/official/v2/?source=baidu');assert.equal(old.status,301);assert.equal(old.headers.get('location'),'https://www.shiyubox.com/?source=baidu');
assert.equal((await get('https://shiyubox.com/official/v2/official.js')).status,410);
console.log('PASS live SEO metadata, two domain maps/robots, canonical isolation and permanent redirects');
