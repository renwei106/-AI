const fs=require('node:fs');const file='dist/space-atlas.js';let s=fs.readFileSync(file,'utf8');
const start=s.indexOf('    }else if(radial){'),end=s.indexOf('    }else if(direct.length>12){',start);if(start<0||end<0)throw Error('radial block');
s=s.slice(0,start)+s.slice(end);s=s.replace('}else if(radial&&n.parent){','}else if(radial){');
s=s.replace("solar()?2:Math.max(1,Math.floor((radial?budget-result.length:budget)/Math.max(1,first.length)))","solar()?2:Math.min(n.kind==='space'&&radial?3:Infinity,Math.max(1,Math.floor((radial?budget-result.length:budget)/Math.max(1,first.length))))");
s=s.replace("catch{notify('本次视图设置暂时保留，浏览器未能保存')}","catch{toast('本次视图设置暂时保留，浏览器未能保存')}");
fs.writeFileSync(file,s);
const test='checks/space-atlas/inspect-v5.cjs';s=fs.readFileSync(test,'utf8');s=s.replace("await p.locator('.at-node-main[data-at-focus=\"c:mock-inspiration-v1-0\"]').click()","await p.locator('.at-node-main[data-at-focus=\"c:mock-inspiration-v1-0\"]').hover({force:true});await p.locator('.at-node-main[data-at-focus=\"c:mock-inspiration-v1-0\"]').click()");
const a=s.indexOf("console.log(await p.locator('.at-node')"),b=s.indexOf(';await p.locator',a);if(a>=0&&b>=0)s=s.slice(0,a)+"console.log('overview rendered')"+s.slice(b);
s=s.replace("process.exitCode=1","process.exit(1)");fs.writeFileSync(test,s);
