/* Isolated responsive review using the existing local backend. */
const http=require('node:http');
const upstreamPort=Number(process.env.SHIYU_PREVIEW_UPSTREAM)||4343;
const port=Number(process.env.SHIYU_MOBILE_PREVIEW_PORT)||4345;
http.createServer((req,res)=>{
 const host='127.0.0.1:'+upstreamPort,headers={...req.headers,host};
 if(headers.origin==='http://'+req.headers.host)headers.origin='http://'+host;
 const upstream=http.request({hostname:'127.0.0.1',port:upstreamPort,path:req.url,method:req.method,headers},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res)});
 upstream.on('error',()=>{res.writeHead(503,{'content-type':'text/plain; charset=utf-8'});res.end('本地适配预览未启动。')});
 req.on('aborted',()=>upstream.destroy());req.pipe(upstream);
}).listen(port,'0.0.0.0',()=>console.log('Responsive LAN preview: '+port+', upstream '+upstreamPort));
