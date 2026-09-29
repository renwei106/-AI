import * as THREE from 'three';
const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const mesh=(geometry,material,parent,position=[0,0,0],rotation=[0,0,0])=>{const value=new THREE.Mesh(geometry,material);value.position.set(...position);value.rotation.set(...rotation);value.castShadow=true;value.receiveShadow=true;parent.add(value);return value};
const sphere=(parent,scale,material,position)=>{const value=mesh(new THREE.SphereGeometry(1,40,28),material,parent,position);value.scale.set(...scale);return value};
function createFace(root,config,rig){
 const skin=mat(config.skin,.82),dark=mat(config.hair,.7),lip=mat(config.lip,.7),white=mat(0xfffdf8,.7),iris=mat(config.iris,.4),black=mat(0x101218,.34);
 const neck=mesh(new THREE.CylinderGeometry(.27,.33,.62,24),skin,root,[0,2.42,0]);
 const head=new THREE.Group();head.position.set(0,3.06,0);root.add(head);rig.head=head;
 sphere(head,[.84,1,.78],skin,[0,0,0]);sphere(head,[.81,.92,.7],dark,[0,.22,-.18]);mesh(new THREE.SphereGeometry(.82,40,24,0,Math.PI*2,0,Math.PI*.49),dark,head,[0,.5,.02],[0,0,Math.PI]);
 const facePatch=sphere(head,[.70,.78,.18],skin,[0,-.05,.65]);facePatch.castShadow=false;
 const eyes=[];for(const side of [-1,1]){const eyeGroup=new THREE.Group();eyeGroup.position.set(side*.3,.08,.75);head.add(eyeGroup);const eye=sphere(eyeGroup,[.135,.075,.04],white,[0,0,0]);const pupil=sphere(eyeGroup,[.048,.052,.026],iris,[0,0,.045]);eyes.push({group:eyeGroup,eye,pupil});mesh(new THREE.TorusGeometry(.15,.022,10,28,Math.PI),dark,eyeGroup,[0,.07,.03],[0,0,side<0?0:Math.PI]);}rig.eyes=eyes;
 sphere(head,[.13,.055,.025],lip,[0,-.38,.78]);sphere(head,[.055,.11,.06],skin,[0,-.12,.82]);
 if(config.glasses){for(const side of [-1,1]){mesh(new THREE.BoxGeometry(.48,.29,.035),new THREE.MeshPhysicalMaterial({color:0x11131a,roughness:.16,transparent:true,opacity:.91}),head,[side*.29,.1,.84]);mesh(new THREE.BoxGeometry(.5,.035,.04),black,head,[side*.29,.25,.86]);}mesh(new THREE.BoxGeometry(.13,.035,.04),black,head,[0,.13,.88]);}
 if(config.kind==='girl'){for(const side of [-1,1]){sphere(head,[.39,.39,.35],dark,[side*.6,.72,-.03]);const earring=new THREE.Group();earring.position.set(side*.77,-.06,.12);head.add(earring);mesh(new THREE.TorusGeometry(.13,.045,10,22),mat(side<0?0x46a57b:0x4c8fc7,.46),earring,[0,0,0],[0,Math.PI/2,0]);[0xf0a43b,0xd15b54,0x397bb5].forEach((color,index)=>sphere(earring,[.07,.1,.06],mat(color,.68),[0,-.20-index*.15,0]));}}
 else{const topHair=new THREE.Group();topHair.position.set(0,.62,.04);head.add(topHair);[-.55,-.34,-.12,.12,.36,.56].forEach((x,index)=>{const lock=sphere(topHair,[.22,.38,.2],dark,[x,.08+Math.sin(index)*.1,.02]);lock.rotation.z=x*.35;});}
 rig.neck=neck;return {skin,dark};
}
function createTorso(root,config,rig,materials){
 const sweater=new THREE.MeshStandardMaterial({color:config.outfit,roughness:.9});const torso=sphere(root,[1.12,1.32,.56],sweater,[0,1.22,0]);rig.torso=torso;const waist=mesh(new THREE.CylinderGeometry(.76,.82,.5,28),sweater,root,[0,.28,0]);
 for(let row=0;row<3;row++)for(let col=0;col<5;col++){const colors=config.kind==='girl'?[0xe9a32f,0x4c9a70,0xb8474e,0x4e70a8]:[0x694f8f,0x305e72,0xc0784b,0x252a33];const dot=sphere(root,[.105,.105,.035],mat(colors[(row+col)%colors.length],.86),[(col-2)*.38,1.75-row*.42,.54]);dot.castShadow=false;}
 const arms=[];for(const side of [-1,1]){const shoulder=new THREE.Group();shoulder.position.set(side*.92,1.65,0);root.add(shoulder);mesh(new THREE.CapsuleGeometry(.22,.74,8,18),sweater,shoulder,[side*.25,-.34,0],[0,0,side*.20]);sphere(shoulder,[.21,.27,.19],materials.skin,[side*.42,-.87,.02]);arms.push(shoulder);}rig.arms=arms;
 if(config.kind==='boy'){mesh(new THREE.BoxGeometry(.09,1.9,.06),mat(0xe5d6bd,.62),root,[0,1.13,.57]);for(const side of [-1,1])mesh(new THREE.BoxGeometry(.42,.06,.05),mat(0xe5d6bd,.62),root,[side*.26,1.92,.58],[0,0,side*.72]);}rig.waist=waist;
}
export function createAvatar(config){const root=new THREE.Group(),rig={root};root.name=`avatar-${config.kind}`;const materials=createFace(root,config,rig);createTorso(root,config,rig,materials);root.scale.setScalar(.84);root.position.y=-1.66;return rig;}
