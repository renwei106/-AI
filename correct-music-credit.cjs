const fs=require('fs');let s=fs.readFileSync('dist/v4.js','utf8');if(!s.includes("演唱者 · 赵红"))throw Error('credit not found');s=s.replace("演唱者 · 赵红","程序合成 · 纯音乐");fs.writeFileSync('dist/v4.js',s);
