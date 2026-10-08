// Prepare a local candidate from the current Nginx configuration. This does not reload Nginx.
import fs from 'node:fs';
const [source,destination]=process.argv.slice(2);
if(!source||!destination||source===destination)throw Error('Provide distinct source and candidate file paths');
let config=fs.readFileSync(source,'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
const server='server_name shiyubox.com space.shiyubox.com world.shiyubox.com;';
const start=config.indexOf(server),end=config.indexOf('\nserver {',start);
if(start<0||end<0)throw Error('Application server block not found');
const block=config.slice(start,end),host='        proxy_set_header Host 127.0.0.1:4318;';
if(block.split(host).length!==2)throw Error('Expected exactly one application proxy Host directive');
const directive='        proxy_set_header X-Shiyu-Public-Host $host;';
if(block.includes(directive))throw Error('Public-host directive already present; review the running configuration');
config=config.slice(0,start)+block.replace(host,host+'\n'+directive)+config.slice(end);
fs.writeFileSync(destination,config);
console.log('Prepared candidate; only the application proxy gains the public-host header.');
