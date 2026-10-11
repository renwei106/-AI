// JPL approximate planetary elements, J2000. AU, degrees, days, kilometres.
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
export const PLANETS=[
 ['mercury','水星',2439.7,87.969,'#b9aaa0',.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593],
 ['venus','金星',6051.8,224.701,'#e8cda0',.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255],
 ['earth','地球',6371,365.256,'#78b7d0',1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],
 ['mars','火星',3389.5,686.98,'#c7795b',1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],
 ['jupiter','木星',69911,4332.59,'#dcc0a2',5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],
 ['saturn','土星',58232,10759.22,'#e2cea7',9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448],
 ['uranus','天王星',25362,30688.5,'#9bd4d7',19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503],
 ['neptune','海王星',24622,60182,'#6187d2',30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574]
].map(([id,name,radius,period,color,a,e,i,L,peri,node])=>({id,name,radius,period,color,a,e,i,M:L-peri,w:peri-node,node}));
export const DEG=Math.PI/180;
export function orbit(body,days,mean){
 const M=mean??(body.M*DEG+days/body.period*Math.PI*2);let E=M%(2*Math.PI);
 for(let j=0;j<8;j++)E-=(E-body.e*Math.sin(E)-M%(2*Math.PI))/(1-body.e*Math.cos(E));
 const x=body.a*(Math.cos(E)-body.e),y=body.a*Math.sqrt(1-body.e*body.e)*Math.sin(E);
 const w=body.w*DEG,n=body.node*DEG,i=body.i*DEG;
 return [(Math.cos(w)*Math.cos(n)-Math.sin(w)*Math.sin(n)*Math.cos(i))*x+(-Math.sin(w)*Math.cos(n)-Math.cos(w)*Math.sin(n)*Math.cos(i))*y,
 (Math.cos(w)*Math.sin(n)+Math.sin(w)*Math.cos(n)*Math.cos(i))*x+(-Math.sin(w)*Math.sin(n)+Math.cos(w)*Math.cos(n)*Math.cos(i))*y,
 Math.sin(w)*Math.sin(i)*x+Math.cos(w)*Math.sin(i)*y];
}
// A display-only semimajor-axis mapping. Eccentricity, inclination and phase remain orbital.
export function displayOrbit(body,days,mean){return orbit(body,days,mean).map(v=>v/body.a*(70+86*Math.log2(1+body.a)));}
export function planetRadius(p){return 3.8*Math.pow(p.radius/6371,.82);}
