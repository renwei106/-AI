const fs=require('fs');let s=fs.readFileSync('dist/app.js','utf8');s=s.replace('field.replaceChildren();lastRainMinute=minute;','lastRainMinute=minute;');fs.writeFileSync('dist/app.js',s);
