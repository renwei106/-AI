import {AccretionEngine} from './accretion-engine.js';

// Physics only: the upstream solver never blocks the page's animation thread.
const engine=Object.create(AccretionEngine.prototype);
let generation=0;
self.onmessage=({data})=>{
  if(data.type==='reset'){
    engine.config=data.config;engine.bounds=data.bounds;generation=data.generation;engine.reset();
  }else if(data.generation!==generation)return;
  else if(data.type==='config')engine.setConfig(data.config);
  else if(data.type==='resize'){
    const previous=engine.bounds;engine.bounds=data.bounds;
    for(const p of engine.particles){p.position.x*=engine.bounds.width/previous.width;p.position.y*=engine.bounds.height/previous.height;}
    engine.physics.forcesDirty=true;engine.physics.tree=null;
  }else if(data.type==='step'){
    engine.advance(data.dt);
    self.postMessage({generation,age:engine.age,merged:engine.merged,bodies:engine.particles.map(p=>({id:p.visualId||(p.visualId=++nextId),x:p.position.x,y:p.position.y,mass:p.mass,radius:p.radius,born:p.born||0,blackHole:!!p.cosmicState?.blackHole,blackHoleLevel:p.cosmicState?.blackHoleLevel||0}))});
  }
};
let nextId=0;
