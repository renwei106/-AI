/* Local-only raster to Low Poly SVG. Delaunator is bundled under its ISC license. */
(function (root) {
  'use strict';
  function random(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function convert({ pixels, width: w, height: h, detail = 'balanced', tone = 'original', accent = '#648b83' }) {
    const rng = random(187), count = ({simple:420, balanced:1100, fine:2500})[detail] || 1100;
    const points = [[0,0],[w,0],[w,h],[0,h]], grid = new Set();
    const spacing = Math.sqrt(w*h/count), cell = Math.max(2, spacing * .48);
    function add(x,y) { const key = Math.floor(x/cell)+':'+Math.floor(y/cell); if(grid.has(key)) return false; grid.add(key); points.push([x,y]); return true; }
    for(let x=spacing;x<w;x+=spacing) { add(x,0);add(x,h); }
    for(let y=spacing;y<h;y+=spacing) { add(0,y);add(w,y); }
    const sample=(x,y)=>{const i=(Math.max(0,Math.min(h-1,Math.round(y)))*w+Math.max(0,Math.min(w-1,Math.round(x))))*4; const a=pixels[i+3]/255;return [0,1,2].map(k=>pixels[i+k]*a+246*(1-a));};
    const gray=(x,y)=>{const c=sample(x,y);return c[0]*.299+c[1]*.587+c[2]*.114;};
    // Keep quiet regions broad while placing more vertices along visible edges.
    for(let i=0;i<count*.44;i++) add(rng()*w,rng()*h);
    const candidates=[];
    for(let i=0;i<count*16;i++){const x=2+rng()*(w-4),y=2+rng()*(h-4);const edge=Math.abs(gray(x+2,y)-gray(x-2,y))+Math.abs(gray(x,y+2)-gray(x,y-2));candidates.push({x,y,score:edge*(.65+rng()*.7)});}
    candidates.sort((a,b)=>b.score-a.score);
    for(const p of candidates){if(points.length>=count)break;add(p.x,p.y);}
    const triangles=root.Delaunator.from(points).triangles, tint=accent.match(/[a-f\d]{2}/gi)?.map(x=>parseInt(x,16)) || [100,139,131];
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="三角切面图像"><g stroke-linejoin="round" stroke-width="0.65">`;
    for(let i=0;i<triangles.length;i+=3){
      const a=points[triangles[i]],b=points[triangles[i+1]],c=points[triangles[i+2]],x=(a[0]+b[0]+c[0])/3,y=(a[1]+b[1]+c[1])/3;
      const samples=[[x,y],[(x+a[0])/2,(y+a[1])/2],[(x+b[0])/2,(y+b[1])/2],[(x+c[0])/2,(y+c[1])/2]].map(p=>sample(...p));
      const rgb=[0,1,2].map(k=>{const v=samples.reduce((sum,s)=>sum+s[k],0)/4;return Math.round(tone==='theme'?v*.77+tint[k]*.23:v);});
      const color=`rgb(${rgb.join(',')})`;
      svg+=`<path d="M${a.map(v=>v.toFixed(1))}L${b.map(v=>v.toFixed(1))}L${c.map(v=>v.toFixed(1))}Z" fill="${color}" stroke="${color}"/>`;
    }
    return svg+'</g></svg>';
  }
  root.ShiyuPolyEngine={convert,random};
})(typeof self !== 'undefined' ? self : globalThis);
