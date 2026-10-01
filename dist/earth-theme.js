/* 星海行旅：直接接入 flights-tracker 的 Earth / Atmosphere / Stars 实现。 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Earth,Stars,solarDirection} from './earth-source.js';

let state=null;
function stopGlobeTheme(){if(!state)return;cancelAnimationFrame(state.frame);if(state.resize)removeEventListener('resize',state.resize);state.cleanup?.();state.controls.dispose();state.earth.dispose();state.stars.dispose();state.renderer.dispose();state=null}
async function startGlobeTheme(){
  const stage=document.querySelector('#earth-theme-stage'),canvas=document.querySelector('#earth-theme-canvas');if(!stage||!canvas)return;if(state?.canvas===canvas)return;stopGlobeTheme();
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,0,6.45);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const controls=new OrbitControls(camera,canvas);Object.assign(controls,{enableDamping:true,dampingFactor:.06,enableZoom:false,enablePan:false,autoRotate:true,autoRotateSpeed:.32,minPolarAngle:.95,maxPolarAngle:2.2});
  // Sunlight is independent of the viewing angle. Gentle ambient fill keeps
  // oceans and land readable at night; the distant Sun supplies the day side.
  scene.add(new THREE.AmbientLight(0xc5d5ff,.65));scene.add(camera);
  const sun=new THREE.DirectionalLight(0xfff4ed,3.2);scene.add(sun);
  // NASA Earth Observatory, Blue Marble (August 2004), downsampled from 21600 × 10800.
  const textureSize=innerWidth>760&&renderer.capabilities.maxTextureSize>=8192?8192:4096;
  const textureURL=new URL(`assets/site-icons/earth-blue-marble-200408-${textureSize}.webp`,import.meta.url).href;
  const waterMaskURL=new URL(`assets/site-icons/earth-water-mask-${textureSize}.png`,import.meta.url).href;
  const nightLightsURL=new URL(`assets/site-icons/earth-night-lights-2016-${textureSize}.webp`,import.meta.url).href;
  const loading=stage.querySelector('[data-globe-loading]');
  const stars=new Stars(2600);stars.setZoom(1);stars.addToScene(scene);const earth=new Earth(1.48,textureURL,loaded=>{if(!stage.isConnected)return;if(loading){loading.hidden=loaded;if(!loaded)loading.textContent='地球影像暂时未能加载，请刷新重试';}},waterMaskURL,nightLightsURL);earth.addToScene(scene);
  earth.mesh.material.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  earth.waterMask.anisotropy=earth.mesh.material.map.anisotropy;
  earth.nightLights.anisotropy=earth.mesh.material.map.anisotropy;
  let solarTime=0;
  const updateSun=()=>{const now=Date.now();if(Math.abs(now-solarTime)<1000)return;solarTime=now;const direction=solarDirection(new Date(now));sun.position.copy(direction).multiplyScalar(100);earth.atmosphere.material.uniforms.sunDirection.value.copy(direction);};
  updateSun();
  const zoom={current:1,target:1},raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let wheelAt=0,wheelX=0,wheelY=0,previousFrame=performance.now();
  const wheel=event=>{
    if(event.ctrlKey||!earth.mesh.visible||document.querySelector('dialog[open]'))return;
    const rect=canvas.getBoundingClientRect(),now=performance.now();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
    raycaster.setFromCamera(pointer,camera);
    // Keep an ongoing wheel burst captured if the globe shrinks under the cursor.
    const continuing=now-wheelAt<300&&Math.abs(event.clientX-wheelX)<2&&Math.abs(event.clientY-wheelY)<2;
    if(!continuing&&!raycaster.intersectObject(earth.mesh,false).length)return;
    event.preventDefault();event.stopImmediatePropagation();
    wheelAt=now;wheelX=event.clientX;wheelY=event.clientY;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?rect.height:1);
    zoom.target=THREE.MathUtils.clamp(zoom.target*Math.exp(-THREE.MathUtils.clamp(delta,-160,160)*.0018),.4,1.22);
    return true;
  };
  // The world's capture-phase gesture handler must offer Earth the wheel first.
  canvas.consumeGlobeWheel=wheel;
  canvas.addEventListener('wheel',wheel,{passive:false});
  state={canvas,stage,scene,camera,renderer,controls,stars,earth,sun,zoom,frame:0,cleanup:()=>{canvas.removeEventListener('wheel',wheel);delete canvas.consumeGlobeWheel;}};
  const resize=()=>{if(!state||!stage.isConnected)return;const rect=stage.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);camera.aspect=w/h;const halfFov=THREE.MathUtils.degToRad(camera.fov/2),fitAngle=Math.min(halfFov,Math.atan(Math.tan(halfFov)*camera.aspect)),distance=innerWidth<=1100?Math.max(6.45,1.65/Math.sin(fitAngle)):6.45;camera.position.setLength(distance);camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
  const frame=()=>{if(!state||!stage.isConnected||document.body.dataset.theme!=='globe'){stopGlobeTheme();return}resize();updateSun();const now=performance.now(),dt=Math.min((now-previousFrame)/1000,.1);previousFrame=now;zoom.current=THREE.MathUtils.lerp(zoom.current,zoom.target,1-Math.exp(-14*dt));earth.mesh.scale.setScalar(zoom.current);earth.atmosphere.mesh.scale.setScalar(zoom.current);stars.setZoom(zoom.current);stars.update(.012);controls.update();renderer.render(scene,camera);state.frame=requestAnimationFrame(frame)};
  addEventListener('resize',resize);state.resize=resize;resize();frame();
}
window.startGlobeTheme=startGlobeTheme;
if(document.body?.dataset.theme==='globe')startGlobeTheme();
