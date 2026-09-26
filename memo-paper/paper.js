/* Paper geometry and VAT interpolation: ITEM Inc., MIT. */
import * as THREE from "three";
export function createPaper(animData, designIndex = 0) {
  const { vertexCount, indices, uvs, positions, normals } = animData;

  const geometry = new THREE.BufferGeometry();

  // ===== 頂点位置（最初のフレームで初期化）=====
  // 毎フレーム書き換える前提なので Float32Array を直接持つ
  const positionArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount * 3; i++) {
    positionArray[i] = positions[i]; // フレーム0
  }
  const positionAttr = new THREE.BufferAttribute(positionArray, 3);
  positionAttr.setUsage(THREE.DynamicDrawUsage); // 頻繁に更新される
  geometry.setAttribute("position", positionAttr);

  // ===== 法線 =====
  const normalArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount * 3; i++) {
    normalArray[i] = normals[i];
  }
  const normalAttr = new THREE.BufferAttribute(normalArray, 3);
  normalAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("normal", normalAttr);

  // ===== UV =====
  const uvArray = new Float32Array(uvs.length);
  for (let i = 0; i < uvs.length; i++) {
    uvArray[i] = uvs[i];
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));

  // ===== インデックス =====
  // 140頂点なので Uint16 で十分
  const indexArray = new Uint16Array(indices);
  geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));

  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xfffdf7, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }));

  return {
    mesh,
    positionAttr,
    normalAttr,
  };
}

// Text is printed on the original UV surface, so the existing VAT bends and
// occludes it along with the paper instead of attaching a floating HTML label.
export function paintPaper(paper,note,showTitle=true){
  const signature=JSON.stringify([note.paperColor,note.title,note.number,showTitle]);
  if(paper.designSignature===signature)return;paper.designSignature=signature;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;
  const ctx=canvas.getContext('2d'),color=note.paperColor||'#8b9097';
  ctx.fillStyle='#fffdf7';ctx.fillRect(0,0,512,768);
  ctx.globalAlpha=showTitle?.24:.14;ctx.fillStyle=color;ctx.fillRect(0,0,512,768);ctx.globalAlpha=1;
  if(showTitle){
    ctx.fillStyle=color;ctx.fillRect(26,0,64,768);ctx.fillRect(0,566,512,86);
    ctx.fillStyle='#343930';ctx.font='500 62px "Microsoft YaHei", sans-serif';ctx.textBaseline='top';
    const text=Array.from(note.title||'无题');
    const lines=[];for(let start=0;start<text.length;start+=6)lines.push(text.slice(start,start+6).join(''));
    // Repeat actual title fragments across the surface: a single heading can
    // fold entirely inward, while these fragments remain visible on the creases.
    for(let row=0;row<6;row++){
      const chunk=lines[row%lines.length],x=row%2?72:112;
      ctx.fillText(chunk,x,34+row*118,488-x);
      if(text.length<=3)ctx.fillText(chunk,300,84+row*118,188);
    }
    ctx.save();ctx.translate(455,700);ctx.rotate(Math.PI);ctx.font='500 40px "Microsoft YaHei", sans-serif';
    ctx.fillText(text.slice(0,8).join(''),0,0,370);ctx.restore();
    ctx.globalAlpha=.65;ctx.font='36px Georgia, serif';ctx.fillText(String(note.number||'').padStart(2,'0'),100,464);
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  paper.mesh.material.map?.dispose();paper.mesh.material.map=texture;paper.mesh.material.color.set('#ffffff');paper.mesh.material.needsUpdate=true;
}

/**
 * 指定フレーム（小数可）の positions と normals でジオメトリを更新する。
 * 小数の場合は隣接フレーム間を線形補間する。
 */
export function updatePaperFrame(paper, animData, frameIdx) {
  const { vertexCount, frameCount, positions, normals } = animData;
  const { positionAttr, normalAttr } = paper;

  const len = vertexCount * 3;
  const f0 = Math.floor(frameIdx);
  const t = frameIdx - f0;

  const off0 = f0 * len;

  const posArray = positionAttr.array;
  const nrmArray = normalAttr.array;

  if (t < 1e-6) {
    // 整数フレーム — コピーだけ
    for (let i = 0; i < len; i++) {
      posArray[i] = positions[off0 + i];
      nrmArray[i] = normals[off0 + i];
    }
  } else {
    // 小数フレーム — lerp
    const f1 = (f0 + 1) % frameCount;
    const off1 = f1 * len;
    const s = 1 - t;
    for (let i = 0; i < len; i++) {
      posArray[i] = positions[off0 + i] * s + positions[off1 + i] * t;
      nrmArray[i] = normals[off0 + i] * s + normals[off1 + i] * t;
    }
  }

  positionAttr.needsUpdate = true;
  normalAttr.needsUpdate = true;

  paper.mesh.geometry.computeBoundingSphere();
  paper.mesh.geometry.computeBoundingBox();
}
