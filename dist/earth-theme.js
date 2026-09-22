/* 星海行旅：直接接入 flights-tracker 的 Earth / Atmosphere / Stars 实现。 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Earth,Stars} from './earth-source.js';

let state=null;
const textureURL='https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
function stopGlobeTheme(){if(!state)return;cancelAnimationFrame(state.frame);if(state.resize)removeEventListener('resize',state.resize);state.controls.dispose();state.earth.dispose();state.stars.dispose();state.renderer.dispose();state=null}
async function startGlobeTheme(){
  const stage=document.querySelector('#earth-theme-stage'),canvas=document.querySelector('#earth-theme-canvas');if(!stage||!canvas)return;if(state?.canvas===canvas)return;stopGlobeTheme();
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,0,6.45);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const controls=new OrbitControls(camera,canvas);Object.assign(controls,{enableDamping:true,dampingFactor:.06,enableZoom:false,enablePan:false,autoRotate:true,autoRotateSpeed:.32,minPolarAngle:.95,maxPolarAngle:2.2});
  scene.add(new THREE.AmbientLight(0x8197bd,1.1));const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(4,2,5);scene.add(sun);
  const stars=new Stars();stars.addToScene(scene);const earth=new Earth(1.48,textureURL);earth.addToScene(scene);
  state={canvas,stage,scene,camera,renderer,controls,stars,earth,frame:0};
  const loading=stage.querySelector('[data-globe-loading]');
  const resize=()=>{if(!state||!stage.isConnected)return;const rect=stage.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
  const frame=()=>{if(!state||!stage.isConnected||document.body.dataset.theme!=='globe'){stopGlobeTheme();return}resize();stars.update(.012);controls.update();renderer.render(scene,camera);state.frame=requestAnimationFrame(frame)};
  addEventListener('resize',resize);state.resize=resize;resize();if(loading)loading.hidden=true;frame();
}
window.startGlobeTheme=startGlobeTheme;
if(document.body?.dataset.theme==='globe')startGlobeTheme();
