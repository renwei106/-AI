// Rasterize Natural Earth's real ocean/lake boundaries in the NASA map projection.
// Input: ne_10m_ocean.geojson and ne_10m_lakes.geojson from
// https://github.com/nvkelso/natural-earth-vector/tree/master/geojson (public domain).
const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const polygons=[];
 for(const name of ['ocean','lakes']){
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,`earth-ocean/ne_10m_${name}.geojson`),'utf8'));
  for(const {geometry:g} of data.features){
   if(g.type==='Polygon')polygons.push(g.coordinates);
   else if(g.type==='MultiPolygon')polygons.push(...g.coordinates);
   else throw Error(`Unexpected geometry: ${g.type}`);
  }
 }
 for(const width of [8192,4096]){
  const height=width/2;
  const paths=polygons.map(rings=>'<path d="'+rings.map(ring=>ring.map(([lon,lat],i)=>`${i?'L':'M'}${((lon+180)/360*width).toFixed(3)},${((90-lat)/180*height).toFixed(3)}`).join('')+'Z').join('')+'"/>').join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/><g fill="white" fill-rule="evenodd">${paths}</g></svg>`;
  const file=path.join(__dirname,`../dist/assets/site-icons/earth-water-mask-${width}.png`);
  await sharp(Buffer.from(svg)).removeAlpha().greyscale().png({compressionLevel:9}).toFile(file);
  console.log(file,fs.statSync(file).size);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
