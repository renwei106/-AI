/*
 * Local copy of the Earth / Atmosphere / Stars pieces from
 * jeantimex/flights-tracker (MIT License):
 * https://github.com/jeantimex/flights-tracker
 *
 * Flight entities, GUI controls and statistics are intentionally not included.
 */
import * as THREE from 'three';

// NOAA's approximate solar declination / equation of time, evaluated in UTC.
// https://gml.noaa.gov/grad/solcalc/solareqns.PDF
// Earth is north-up, with Greenwich at +Z and 90 degrees east at +X.
export function solarDirection(date=new Date(),target=new THREE.Vector3()){
  const year=date.getUTCFullYear(),start=Date.UTC(year,0,1),days=(Date.UTC(year+1,0,1)-start)/86400000;
  const day=Math.floor((date.getTime()-start)/86400000),minutes=date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60;
  const gamma=2*Math.PI/days*(day+(minutes/60-12)/24);
  const eqtime=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
  const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
  const longitude=THREE.MathUtils.degToRad((720-minutes-eqtime)/4);
  return target.set(Math.sin(longitude)*Math.cos(decl),Math.sin(decl),Math.cos(longitude)*Math.cos(decl));
}

export class Atmosphere {
  constructor(earthRadius=1.48){this.earthRadius=earthRadius;this.mesh=null;this.material=null;this.createAtmosphere()}
  createAtmosphere(){
    const atmosphereGeometry=new THREE.SphereGeometry(this.earthRadius*1.055,64,32);
    this.material=new THREE.ShaderMaterial({
      uniforms:{sunDirection:{value:new THREE.Vector3(0,0,1)}},
      vertexShader:`varying vec3 vNormal; varying vec3 vWorldNormal; void main(){vNormal=normalize(normalMatrix*normal);vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform vec3 sunDirection; varying vec3 vNormal; varying vec3 vWorldNormal; void main(){float intensity=pow(0.6-dot(vNormal,vec3(0.0,0.0,1.0)),2.0);float daylight=smoothstep(-0.15,0.25,dot(normalize(vWorldNormal),sunDirection));gl_FragColor=vec4(0.3,0.6,1.0,1.0)*intensity*mix(0.035,1.0,daylight);}`,
      blending:THREE.AdditiveBlending,side:THREE.BackSide,transparent:true,depthWrite:false
    });
    this.mesh=new THREE.Mesh(atmosphereGeometry,this.material);this.mesh.rotation.y=-Math.PI/2;
  }
  addToScene(scene){if(this.mesh)scene.add(this.mesh)}
  dispose(){this.mesh?.geometry?.dispose();this.material?.dispose()}
}

export class Earth {
  constructor(radius=1.48,textureURL,onTextureLoaded=null,waterMaskURL,nightLightsURL){this.radius=radius;this.mesh=null;this.atmosphere=new Atmosphere(radius);this.textureURL=textureURL;this.waterMaskURL=waterMaskURL;this.nightLightsURL=nightLightsURL;this.onTextureLoaded=onTextureLoaded;this.createEarth()}
  createEarth(){
    const geometry=new THREE.SphereGeometry(this.radius,128,64),textureLoader=new THREE.TextureLoader();
    let remaining=2,failed=false;
    const loaded=()=>{if(this.disposed||failed||--remaining)return;this.mesh.visible=true;this.atmosphere.mesh.visible=true;this.onTextureLoaded?.(true)};
    const error=()=>{if(this.disposed||failed)return;failed=true;this.onTextureLoaded?.(false)};
    const worldTexture=textureLoader.load(this.textureURL,loaded,undefined,error);
    this.waterMask=textureLoader.load(this.waterMaskURL,loaded,undefined,error);
    this.waterMask.format=THREE.RedFormat;
    this.waterMask.wrapS=THREE.RepeatWrapping;this.waterMask.wrapT=THREE.ClampToEdgeWrapping;
    // Optional light overlay: its failure must not hide the readable base globe.
    this.nightLightsReady={value:0};
    this.nightLights=textureLoader.load(this.nightLightsURL,()=>{if(!this.disposed)this.nightLightsReady.value=1},undefined,()=>{});
    this.nightLights.format=THREE.RedFormat;this.nightLights.wrapS=THREE.RepeatWrapping;
    worldTexture.colorSpace=THREE.SRGBColorSpace;
    worldTexture.wrapS=THREE.RepeatWrapping;worldTexture.wrapT=THREE.ClampToEdgeWrapping;worldTexture.minFilter=THREE.LinearMipmapLinearFilter;worldTexture.magFilter=THREE.LinearFilter;worldTexture.flipY=true;
    const material=new THREE.MeshPhongMaterial({map:worldTexture,shininess:38,specular:0x90a8bc});
    // Use geographic water boundaries, including inland seas and straits:
    // their near-black satellite pixels cannot reliably be identified by hue.
    material.onBeforeCompile=shader=>{
      shader.uniforms.oceanColor={value:new THREE.Color('#132c53')};
      shader.uniforms.waterMask={value:this.waterMask};
      shader.uniforms.nightLights={value:this.nightLights};
      shader.uniforms.nightLightsReady=this.nightLightsReady;
      shader.uniforms.nightColor={value:new THREE.Color('#ffd49a')};
      shader.uniforms.sunDirection=this.atmosphere.material.uniforms.sunDirection;
      shader.vertexShader='varying vec3 vEarthNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvEarthNormal=normalize(mat3(modelMatrix)*normal);');
      shader.fragmentShader='uniform vec3 oceanColor;\nuniform sampler2D waterMask;\nuniform sampler2D nightLights;\nuniform float nightLightsReady;\nuniform vec3 nightColor;\nuniform vec3 sunDirection;\nvarying vec3 vEarthNormal;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        float ocean = texture2D(waterMask, vMapUv).r;
        diffuseColor.rgb = mix(diffuseColor.rgb, max(diffuseColor.rgb, oceanColor), ocean);
      `).replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
        specularStrength *= mix(0.035, 0.18, ocean);
      `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float night = 1.0 - smoothstep(-0.12, 0.12, dot(normalize(vEarthNormal), sunDirection));
        float lights = pow(texture2D(nightLights, vMapUv).r, 1.4);
        totalEmissiveRadiance += nightColor * lights * night * nightLightsReady;
      `);
    };
    this.mesh=new THREE.Mesh(geometry,material);this.mesh.rotation.y=-Math.PI/2;this.mesh.visible=false;this.atmosphere.mesh.visible=false;
  }
  addToScene(scene){if(this.mesh)scene.add(this.mesh);this.atmosphere?.addToScene(scene)}
  dispose(){this.disposed=true;this.mesh?.geometry?.dispose();this.mesh?.material?.map?.dispose();this.waterMask?.dispose();this.nightLights?.dispose();this.mesh?.material?.dispose();this.atmosphere?.dispose()}
}

export class Stars {
  constructor(starCount=900,minRadius=8,maxRadius=13){this.starCount=starCount;this.minRadius=minRadius;this.maxRadius=maxRadius;this.mesh=null;this.material=null;this.time=0;this.createStars()}
  createStars(){
    const starsGeometry=new THREE.BufferGeometry(),starPositions=new Float32Array(this.starCount*3),starOpacities=new Float32Array(this.starCount);
    for(let i=0;i<this.starCount*3;i+=3){const radius=this.minRadius+Math.random()*(this.maxRadius-this.minRadius),theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);starPositions[i]=radius*Math.sin(phi)*Math.cos(theta);starPositions[i+1]=radius*Math.sin(phi)*Math.sin(theta);starPositions[i+2]=radius*Math.cos(phi);starOpacities[i/3]=Math.random()}
    starsGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));starsGeometry.setAttribute('opacity',new THREE.BufferAttribute(starOpacities,1));
    this.material=new THREE.ShaderMaterial({uniforms:{time:{value:0},pointSize:{value:3}},vertexShader:`uniform float pointSize; attribute float opacity; varying float vOpacity; void main(){vOpacity=opacity;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_PointSize=pointSize;gl_Position=projectionMatrix*mvPosition;}`,fragmentShader:`uniform float time; varying float vOpacity; void main(){float dist=length(gl_PointCoord-vec2(0.5));if(dist>0.5)discard;float twinkle=sin(time*vOpacity*3.0+vOpacity*10.0)*0.3+0.7;float alpha=(1.0-dist*2.0)*twinkle;gl_FragColor=vec4(1.0,1.0,1.0,alpha);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    this.mesh=new THREE.Points(starsGeometry,this.material)
  }
  addToScene(scene){if(this.mesh)scene.add(this.mesh)}
  setZoom(scale){const away=THREE.MathUtils.clamp((1-scale)/.6,0,1),near=THREE.MathUtils.clamp((scale-1)/.22,0,1);this.mesh.geometry.setDrawRange(0,Math.min(this.starCount,Math.round(900+1700*away-550*near)));this.material.uniforms.pointSize.value=3+1.5*away-.6*near;}
  update(deltaTime=.01){this.time+=deltaTime;if(this.material)this.material.uniforms.time.value=this.time}
  dispose(){this.mesh?.geometry?.dispose();this.material?.dispose()}
}
