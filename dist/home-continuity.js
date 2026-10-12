/* Preserve the live home scene across workspace visits, without persisting simulation data. */
(()=>{
 let retained=null,active=null,rendering=false,preserving=false,restoring=false;
 const key=()=>{const owner=signed?accountProfile().id||'':'guest';let orbit='';if(prefs.theme==='cosmos')try{orbit=localStorage.getItem('shiyu-cosmos-view:'+owner)||'starOrbit';}catch{}return JSON.stringify([owner,prefs.theme,orbit,prefs.theme==='flow'?prefs.flowStyle:'']);};
 const settings=()=>JSON.stringify([prefs,effective().theme,key()]);
 const matches=record=>!!record&&record.key===key()&&(view!=='home'||record.theme===effective().theme);
 const parking=document.createElement('div');parking.dataset.homeRetained='';parking.inert=true;parking.setAttribute('aria-hidden','true');
 parking.style.cssText='position:fixed;inset:0;visibility:hidden;pointer-events:none;z-index:-100;overflow:hidden;';document.body.append(parking);
 const move=(parent,node)=>{if(parent.moveBefore&&node.isConnected)parent.moveBefore(node,null);else parent.append(node);};
 const discard=()=>{if(active===retained)active=null;parking.replaceChildren();retained=null;};
 const unchanged=()=>!!active&&active.node.isConnected&&matches(active)&&active.signature===settings();
 function remember(){
  const node=document.querySelector('#main>.home'),theme=effective().theme;
  const displayed=node?.dataset.orbitTheme||[...(node?.classList||[])].find(name=>name.startsWith('home-'))?.slice(5);
  active=view==='home'&&node&&(displayed===theme||displayed==='surge'&&theme==='flow')?{node,theme,key:key(),signature:settings()}:null;
 }
 const previousHome=home;home=function(...args){
  // Direct home() calls refresh controls and subviews; only render() may reuse a scene.
  if(rendering&&view==='home'){
   if(matches(retained)){const main=document.querySelector('#main');main.replaceChildren();move(main,retained.node);retained=null;remember();return;}
   if(unchanged()&&active.node.parentElement===document.querySelector('#main'))return;
  }
  discard();const result=previousHome(...args);remember();return result;
 };
 const previousRender=render;render=function(...args){
  const before=[rendering,preserving,restoring];
  if(retained&&!matches(retained))discard();
  const current=document.querySelector('#main>.home');
  if(view!=='home'&&current){discard();if(active?.node===current&&matches(active)){retained=active;move(parking,current);}}
  restoring=matches(retained)&&view==='home';
  preserving=matches(retained)||view==='home'&&active?.node===current&&unchanged();rendering=true;
  try{return previousRender(...args);}finally{[rendering,preserving,restoring]=before;}
 };
 remember();
 window.ShiyuHomeContinuity={preserving:()=>preserving,restoring:()=>restoring,unchanged};
})();
