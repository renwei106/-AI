const fs=require('node:fs');
const path=require('node:path');

const svgSlugs=['github','notion','figma','bilibili','douban','mdnwebdocs','dribbble','pinterest','xiaohongshu','zhihu','juejin','unsplash','stackoverflow','youtube','spotify','apple','wikipedia','baidu'];
const sources={
  ...Object.fromEntries(svgSlugs.map(slug=>[slug,{url:`https://cdn.simpleicons.org/${slug}`,type:'svg'}])),
  deepseek:{url:'https://unpkg.com/@lobehub/icons-static-svg@latest/icons/deepseek.svg',type:'svg'},
  feishu:{url:'https://www.feishu.cn/favicon.ico',type:'ico'},
  arena:{url:'https://www.are.na/favicon.ico',type:'ico'}
};
const output=path.resolve(__dirname,'../dist/assets/site-icons');

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await Promise.all(Object.entries(sources).map(async([name,source])=>{
    const response=await fetch(source.url,{signal:AbortSignal.timeout(15000),headers:{'user-agent':'Mozilla/5.0'}});
    if(!response.ok)throw new Error(`${name}: HTTP ${response.status}`);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(source.type==='svg'){
      const text=bytes.toString('utf8');
      if(!text.startsWith('<svg')||/<script|onload\s*=|<foreignObject/i.test(text))throw new Error(`${name}: invalid SVG`);
    }else if(bytes.length<4||bytes[0]!==0||bytes[1]!==0||bytes[2]!==1||bytes[3]!==0)throw new Error(`${name}: invalid ICO`);
    fs.writeFileSync(path.join(output,`${name}.${source.type}`),bytes);
  }));
  console.log(JSON.stringify({status:'PASS',count:Object.keys(sources).length,output},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
