/*
 * Local copy of the Earth / Atmosphere / Stars pieces from
 * jeantimex/flights-tracker (MIT License):
 * https://github.com/jeantimex/flights-tracker
 *
 * Flight entities, GUI controls and statistics are intentionally not included.
 */
import * as THREE from 'three';

export class Atmosphere {
  constructor(earthRadius=1.48){this.earthRadius=earthRadius;this.mesh=null;this.material=null;this.createAtmosphere()}
  createAtmosphere(){
    const atmosphereGeometry=new THREE.SphereGeometry(this.earthRadius*1.055,64,32);
    this.material=new THREE.ShaderMaterial({
      vertexShader:`varying vec3 vNormal; varying vec3 vPosition; void main(){vNormal=normalize(normalMatrix*normal);vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`varying vec3 vNormal; varying vec3 vPosition; void main(){float intensity=pow(0.6-dot(vNormal,vec3(0.0,0.0,1.0)),2.0);gl_FragColor=vec4(0.3,0.6,1.0,1.0)*intensity;}`,
      blending:THREE.AdditiveBlending,side:THREE.BackSide,transparent:true,depthWrite:false
    });
    this.mesh=new THREE.Mesh(atmosphereGeometry,this.material);this.mesh.rotation.y=-Math.PI/2;
  }
  addToScene(scene){if(this.mesh)scene.add(this.mesh)}
  dispose(){this.mesh?.geometry?.dispose();this.material?.dispose()}
}

export class Earth {
  constructor(radius=1.48,textureURL,onTextureLoaded=null){this.radius=radius;this.mesh=null;this.atmosphere=new Atmosphere(radius);this.textureURL=textureURL;this.onTextureLoaded=onTextureLoaded;this.createEarth()}
  createEarth(){
    const geometry=new THREE.SphereGeometry(this.radius,64,32),textureLoader=new THREE.TextureLoader();
    const worldTexture=textureLoader.load(this.textureURL,()=>this.onTextureLoaded?.(),undefined,()=>this.onTextureLoaded?.());
    worldTexture.wrapS=THREE.RepeatWrapping;worldTexture.wrapT=THREE.ClampToEdgeWrapping;worldTexture.minFilter=THREE.LinearFilter;worldTexture.magFilter=THREE.LinearFilter;worldTexture.flipY=true;
    const material=new THREE.MeshPhongMaterial({map:worldTexture,shininess:10});this.mesh=new THREE.Mesh(geometry,material);this.mesh.rotation.y=-Math.PI/2;
  }
  addToScene(scene){if(this.mesh)scene.add(this.mesh);this.atmosphere?.addToScene(scene)}
  dispose(){this.mesh?.geometry?.dispose();this.mesh?.material?.map?.dispose();this.mesh?.material?.dispose();this.atmosphere?.dispose()}
}

export class Stars {
  constructor(starCount=900,minRadius=8,maxRadius=13){this.starCount=starCount;this.minRadius=minRadius;this.maxRadius=maxRadius;this.mesh=null;this.material=null;this.time=0;this.createStars()}
  createStars(){
    const starsGeometry=new THREE.BufferGeometry(),starPositions=new Float32Array(this.starCount*3),starOpacities=new Float32Array(this.starCount);
    for(let i=0;i<this.starCount*3;i+=3){const radius=this.minRadius+Math.random()*(this.maxRadius-this.minRadius),theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);starPositions[i]=radius*Math.sin(phi)*Math.cos(theta);starPositions[i+1]=radius*Math.sin(phi)*Math.sin(theta);starPositions[i+2]=radius*Math.cos(phi);starOpacities[i/3]=Math.random()}
    starsGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));starsGeometry.setAttribute('opacity',new THREE.BufferAttribute(starOpacities,1));
    this.material=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`attribute float opacity; varying float vOpacity; void main(){vOpacity=opacity;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_PointSize=3.0;gl_Position=projectionMatrix*mvPosition;}`,fragmentShader:`uniform float time; varying float vOpacity; void main(){float dist=length(gl_PointCoord-vec2(0.5));if(dist>0.5)discard;float twinkle=sin(time*vOpacity*3.0+vOpacity*10.0)*0.3+0.7;float alpha=(1.0-dist*2.0)*twinkle;gl_FragColor=vec4(1.0,1.0,1.0,alpha);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    this.mesh=new THREE.Points(starsGeometry,this.material)
  }
  addToScene(scene){if(this.mesh)scene.add(this.mesh)}
  update(deltaTime=.01){this.time+=deltaTime;if(this.material)this.material.uniforms.time.value=this.time}
  dispose(){this.mesh?.geometry?.dispose();this.material?.dispose()}
}
