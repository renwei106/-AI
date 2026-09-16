const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const source = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';
  let data;
  if (process.argv[2]) data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  else {
    const response = await fetch(source);
    if (!response.ok) throw new Error('Land source returned ' + response.status);
    data = await response.json();
  }
  const polygons = data.features.flatMap(feature => feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates);
  const rounded = polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat]) => [Number(lon.toFixed(2)), Number(lat.toFixed(2))])));
  const out = path.resolve(__dirname, '../../dist/official/v2/assets/land-outline.js');
  const text = '// Natural Earth 1:110m land, public domain. See PARTICLE-REVISION.md for source.\nwindow.SHIYU_LAND = ' + JSON.stringify(rounded) + ';\n';
  fs.writeFileSync(out, text);
  console.log(JSON.stringify({ polygons: rounded.length, bytes: Buffer.byteLength(text), output: out }));
})().catch(error => { console.error(error); process.exit(1); });
