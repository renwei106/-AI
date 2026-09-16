const fs=require('fs');let s=fs.readFileSync('dist/v4.js','utf8');s=s.replace(".rain-landed:not(.rain-cycle-ghost) .rain-value,.rain-landed:not(.rain-cycle-ghost) .rain-date-piece')", ".rain-landed:not(.rain-cycle-ghost) .rain-value>span:not([style*=absolute]),.rain-landed:not(.rain-cycle-ghost) .rain-date-piece>span:not([style*=absolute])')");s+=`
elasticRainEntry=function(el,delay=0){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;el.animate([
 {transform:'translate(65px,-480px) rotate(-20deg)',opacity:0},
 {transform:'translate(-22px,0) rotate(8deg)',opacity:1,offset:.35},
 {transform:'translate(26px,-140px) rotate(-9deg)',opacity:1,offset:.51},
 {transform:'translate(-12px,0) rotate(4deg)',opacity:1,offset:.68},
 {transform:'translate(10px,-58px) rotate(-4deg)',opacity:1,offset:.79},
 {transform:'translate(-3px,0) rotate(1deg)',opacity:1,offset:.9},
 {transform:'translate(2px,-14px) rotate(-1deg)',opacity:1,offset:.95},
 {transform:'translate(0,0) rotate(0)',opacity:1}
 ],{duration:3100,delay,easing:'ease-out',fill:'backwards'})};
`;
fs.writeFileSync('dist/v4.js',s);
