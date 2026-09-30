/* Phone/tablet review of the same local app. No publishing and no separate mobile build. */
const http=require('node:http');
const port=Number(process.env.SHIYU_MOBILE_PREVIEW_PORT)||4344;
http.createServer((req,res)=>{
  const headers={...req.headers,host:'127.0.0.1:4337'};
  if(headers.origin===`http://${req.headers.host}`)headers.origin='http://127.0.0.1:4337';
  const upstream=http.request({hostname:'127.0.0.1',port:4337,path:req.url,method:req.method,headers},response=>{
    res.writeHead(response.statusCode,response.headers);response.pipe(res);
  });
  upstream.on('error',()=>{res.writeHead(503,{'content-type':'text/plain; charset=utf-8'});res.end('本地预览未启动，请先运行 node checks/preview-unified.cjs。')});
  req.on('aborted',()=>upstream.destroy());req.pipe(upstream);
}).listen(port,'0.0.0.0',()=>console.log(`Mobile LAN preview: port ${port}, upstream http://127.0.0.1:4337/`));
