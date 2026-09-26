/* Adapted from ITEM Inc. Paper Crumple, MIT. See LICENSE and upstream/. */
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { createPaper, updatePaperFrame, paintPaper } from "./paper.js";
import { loadVATData } from "./paper-vat.js";


let animationDataPromise;
function getAnimationData() { return animationDataPromise ||= loadVATData(new URL("./vat/", import.meta.url).href).catch(error=>{animationDataPromise=null;throw error;}); }

export async function createPaperScene(app, options = {}) {
// ==================================================
// シーン基本セットアップ
// ==================================================
let disposed = false, pouring = false, pourResolve, pourTime = 0;
const reduced = options.reducedMotion;

const scene = new THREE.Scene();

// 配色 — GUI から変更できる
const colorSettings = {
  background: options.background || "#f5f4ee", // 背面の壁と背景
  floor: options.background || "#f5f4ee",
};
// Keep the canvas compositable over the note covers during the handoff.
scene.background = null;

// カメラ — 斜め前方から見る (GUI で調整できる)
const cameraSettings = { x: 0, y: 2.2, z: 3.6, targetY: 0.35 };
const camera = new THREE.PerspectiveCamera(
  40,
  app.clientWidth / app.clientHeight,
  0.01,
  100,
);
camera.position.set(cameraSettings.x, cameraSettings.y, cameraSettings.z);
camera.lookAt(0, cameraSettings.targetY, 0);

function applyCameraSettings() {
  camera.position.set(cameraSettings.x, cameraSettings.y, cameraSettings.z);
  camera.lookAt(0, cameraSettings.targetY, 0);
  updateOpenPose();
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(colorSettings.background, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(app.clientWidth, app.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// 床と背面の壁
const FLOOR_VISUAL_Y = -0.1;
const WALL_Z = -1.1;

const floorMat = new THREE.ShadowMaterial({ opacity: options.dark ? 0.22 : 0.10 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 80), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, FLOOR_VISUAL_Y, 1);
floor.receiveShadow = true;
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({
  color: colorSettings.background,
});
const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), wallMat);
wall.position.set(0, FLOOR_VISUAL_Y + 3, WALL_Z);
wall.receiveShadow = true;
// The host supplies the background; keep the paper stage visually seamless.
wall.visible = false; scene.add(wall);

// ライト
const ambient = new THREE.AmbientLight(0xffffff, 1.25);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
dirLight.position.set(-2, 2.6, 1.4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.left = -4;
dirLight.shadow.camera.right = 4;
dirLight.shadow.camera.top = 4;
dirLight.shadow.camera.bottom = -3;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 12;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0);
fillLight.position.set(-2, 1, -1);
scene.add(fillLight);

// ポストプロセス — SSAO で折り目・凹みを暗くする
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const ssaoPass = new SSAOPass(
  scene,
  camera,
  app.clientWidth,
  app.clientHeight,
);
ssaoPass.kernelRadius = 0.01;
ssaoPass.minDistance = 0.0001;
ssaoPass.maxDistance = 0.08;
// 注意: SSAOPass に intensity プロパティは無い (設定しても no-op)。
// オン/オフは ssaoPass.enabled、強さの調整は kernelRadius / maxDistance で行う。
composer.addPass(ssaoPass);

composer.addPass(new OutputPass());

// ==================================================
// GUI
// ==================================================
const animSettings = { speed: reduced ? 100 : 1.5, openFrame: 0 };
const debugPhysics = false;
const papers = [];
let animData = null;
let activePaper = null;

const PAPER_OFFSETS = [
  [-1.25, 0.02, -0.1],
  [0, 0.02, 0.12],
  [1.25, 0.02, -0.06],
];

// 開いた紙: カメラ正面 OPEN_DISTANCE 先に、画面高さの90%で正対表示する
// (ステージ上のどの紙玉よりもカメラに近い距離にして、必ず最前面に見えるようにする)
const OPEN_SCREEN_RATIO = 0.88;
const OPEN_DISTANCE = 1.5;
const CLOSED_SCALE = 1.15;

const flatSize = { width: 1, depth: 1.4 };

// 紙玉が動ける床の範囲 (壁と画面から決めた固定ステージ)
const STAGE_BOUNDS = { minX: -2.4, maxX: 2.4, minZ: WALL_Z, maxZ: 1.7 };
const OPEN_DURATION = 1.15;
const DISCARD_DURATION = 1.25;
const ROLL_LINEAR_RESISTANCE = 2.6;
const ROLL_ANGULAR_RESISTANCE = 4.5;
const ROLL_SETTLE_SPEED = 0.018;
const PHYSICS_STEP = 1 / 60;
const PAPER_MASS = 0.16;

// 掴んで投げる操作
const GRAB_LIFT = 0.5;
const GRAB_STIFFNESS = 14;
const GRAB_MAX_SPEED = 4.5;
const THROW_MAX_SPEED = 3.2;
const CLICK_DRAG_THRESHOLD_PX = 6;

// くしゃくしゃ状態の衝突球・回転中心 — VAT ロード後に実測値で上書きする
let collisionRadius = 0.25;
let restCenterY = FLOOR_VISUAL_Y + 0.25; // 静止時の紙玉中心の高さ
let restMeshY = 0.02; // 静止時のメッシュ原点の高さ
const crumpleCenter = new THREE.Vector3(0, 0.2, 0);

// ==================================================
// 簡易物理 — 丸まった紙だけ球体剛体として扱う
// ==================================================
const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -7.0, 0),
});
physicsWorld.allowSleep = false;
physicsWorld.defaultContactMaterial.friction = 0.8;
physicsWorld.defaultContactMaterial.restitution = 0.15;

const paperMaterial = new CANNON.Material("paper");
const floorPhysicsMaterial = new CANNON.Material("floor");
physicsWorld.addContactMaterial(
  new CANNON.ContactMaterial(paperMaterial, floorPhysicsMaterial, {
    friction: 1.0,
    restitution: 0.12,
  }),
);
// 紙同士 — 軽く弾む
physicsWorld.addContactMaterial(
  new CANNON.ContactMaterial(paperMaterial, paperMaterial, {
    friction: 0.6,
    restitution: 0.3,
  }),
);

const floorBody = new CANNON.Body({
  mass: 0,
  material: floorPhysicsMaterial,
  shape: new CANNON.Plane(),
  position: new CANNON.Vec3(0, FLOOR_VISUAL_Y, 0),
  quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
});
physicsWorld.addBody(floorBody);

// メッシュ原点は紙玉の底付近にあるため、剛体の中心(=紙玉の中心)との間で
// crumpleCenter ぶんのオフセットを行き来させる。
const _crumpleOffset = new THREE.Vector3();
function crumpleWorldOffset(scale, quaternion) {
  return _crumpleOffset
    .copy(crumpleCenter)
    .multiplyScalar(scale)
    .applyQuaternion(quaternion);
}

function createPaperBody(paper) {
  const off = crumpleWorldOffset(CLOSED_SCALE, paper.mesh.quaternion);
  const body = new CANNON.Body({
    mass: PAPER_MASS,
    material: paperMaterial,
    shape: new CANNON.Sphere(collisionRadius),
    linearDamping: 0.15,
    angularDamping: 0.35,
    position: new CANNON.Vec3(
      paper.mesh.position.x + off.x,
      paper.mesh.position.y + off.y,
      paper.mesh.position.z + off.z,
    ),
  });
  body.quaternion.set(
    paper.mesh.quaternion.x,
    paper.mesh.quaternion.y,
    paper.mesh.quaternion.z,
    paper.mesh.quaternion.w,
  );
  physicsWorld.addBody(body);
  return body;
}

function setPaperBodyDynamic(paper, enabled) {
  const body = paper.body;
  body.type = enabled ? CANNON.Body.DYNAMIC : CANNON.Body.KINEMATIC;
  body.mass = enabled ? PAPER_MASS : 0;
  body.collisionFilterGroup = enabled ? 1 : 0;
  body.collisionFilterMask = enabled ? 1 : 0;
  if (!enabled) {
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
    body.force.set(0, 0, 0);
    body.torque.set(0, 0, 0);
  }
  body.updateMassProperties();
  body.wakeUp();
}

function syncBodyToMesh(paper) {
  const off = crumpleWorldOffset(paper.mesh.scale.x, paper.mesh.quaternion);
  paper.body.position.set(
    paper.mesh.position.x + off.x,
    paper.mesh.position.y + off.y,
    paper.mesh.position.z + off.z,
  );
  paper.body.quaternion.set(
    paper.mesh.quaternion.x,
    paper.mesh.quaternion.y,
    paper.mesh.quaternion.z,
    paper.mesh.quaternion.w,
  );
}

function syncMeshToBody(paper, scale = CLOSED_SCALE) {
  paper.mesh.quaternion.set(
    paper.body.quaternion.x,
    paper.body.quaternion.y,
    paper.body.quaternion.z,
    paper.body.quaternion.w,
  );
  const off = crumpleWorldOffset(scale, paper.mesh.quaternion);
  paper.mesh.position.set(
    paper.body.position.x - off.x,
    paper.body.position.y - off.y,
    paper.body.position.z - off.z,
  );
  paper.mesh.scale.setScalar(scale);
}

function isOnGround(body) {
  return body.position.y <= restCenterY + 0.05;
}

function applyRollingResistance(body, dt) {
  const linearDecay = Math.exp(-ROLL_LINEAR_RESISTANCE * dt);
  const angularDecay = Math.exp(-ROLL_ANGULAR_RESISTANCE * dt);
  body.velocity.x *= linearDecay;
  body.velocity.z *= linearDecay;
  body.angularVelocity.x *= angularDecay;
  body.angularVelocity.y *= angularDecay;
  body.angularVelocity.z *= angularDecay;
}

function finishRollingPaper(paper, maxFrame) {
  paper.state = "closed";
  paper.time = 0;
  paper.homePosition.copy(paper.mesh.position);
  paper.homeRotation.copy(paper.mesh.rotation);
  paper.frameIdx = maxFrame;
  updatePaperFrame(paper, animData, paper.frameIdx);
  syncBodyToMesh(paper);
  syncMeshToBody(paper);
}

const BOUNDS_PULL = 3.0;

function applyPhysicsBounds(dt) {
  const bounds = getThrowBounds();
  const minX = bounds.minX + collisionRadius;
  const maxX = bounds.maxX - collisionRadius;
  const minZ = bounds.minZ + collisionRadius;
  const maxZ = bounds.maxZ - collisionRadius;

  for (const paper of papers) {
    if (!paper.body || paper.body.type !== CANNON.Body.DYNAMIC) continue;

    // 範囲外では外向き速度を反射し、ゆるやかに内側へ引き戻す
    // (位置を瞬間移動させると捨てた直後などに見た目が飛ぶため)
    const body = paper.body;
    if (body.position.x < minX) {
      if (body.velocity.x < 0) {
        body.velocity.x = Math.abs(body.velocity.x) * 0.42;
      }
      body.velocity.x += BOUNDS_PULL * dt;
    } else if (body.position.x > maxX) {
      if (body.velocity.x > 0) {
        body.velocity.x = -Math.abs(body.velocity.x) * 0.42;
      }
      body.velocity.x -= BOUNDS_PULL * dt;
    }

    if (body.position.z < minZ) {
      if (body.velocity.z < 0) {
        body.velocity.z = Math.abs(body.velocity.z) * 0.42;
      }
      body.velocity.z += BOUNDS_PULL * dt;
    } else if (body.position.z > maxZ) {
      if (body.velocity.z > 0) {
        body.velocity.z = -Math.abs(body.velocity.z) * 0.42;
      }
      body.velocity.z -= BOUNDS_PULL * dt;
    }
  }
}

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
  return t * t * t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function captureTransform(paper) {
  return {
    position: paper.mesh.position.clone(),
    quaternion: paper.mesh.quaternion.clone(),
    scale: paper.mesh.scale.x,
    frameIdx: paper.frameIdx,
  };
}

function getThrowBounds() {
  const halfWidth = Math.min(2.4, Math.max(0.42, camera.aspect * 1.32));
  const rect=renderer.domElement.getBoundingClientRect();
  const top=options.landingTop?.()??rect.top+rect.height*.18;
  const ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,1-2*(top-rect.top)/rect.height),camera);
  const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-restCenterY),new THREE.Vector3());
  return { ...STAGE_BOUNDS, minZ:hit?Math.min(WALL_Z,hit.z-collisionRadius):WALL_Z, minX: -halfWidth, maxX: halfWidth };
}

const _viewDir = new THREE.Vector3();
function computeOpenPose() {
  camera.getWorldDirection(_viewDir);
  const position = camera.position
    .clone()
    .addScaledVector(_viewDir, OPEN_DISTANCE);

  // 紙の法線(+Y)をカメラへ向け、紙の上端(+Z)を画面の上方向に揃える
  const yAxis = _viewDir.clone().negate();
  const zAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis),
  );

  // 画面高さの 90% に合わせる (幅がはみ出す場合は幅で制限)
  const viewH =
    2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * OPEN_DISTANCE;
  const viewW = viewH * camera.aspect;
  const scale = Math.min(
    (viewH * OPEN_SCREEN_RATIO) / flatSize.depth,
    (viewW * OPEN_SCREEN_RATIO) / flatSize.width,
  );

  return { position, quaternion, scale };
}

// カメラや画面が変わった時、開いている紙を追従させる
function updateOpenPose() {
  if (!activePaper) return;
  if (activePaper.state === "opening" && activePaper.target) {
    const pose = computeOpenPose();
    activePaper.target.position.copy(pose.position);
    activePaper.target.quaternion.copy(pose.quaternion);
    activePaper.target.scale = pose.scale;
  } else if (activePaper.state === "open") {
    const pose = computeOpenPose();
    activePaper.mesh.position.copy(pose.position);
    activePaper.mesh.quaternion.copy(pose.quaternion);
    activePaper.mesh.scale.setScalar(pose.scale);
    options.onResize?.(editorRect());
  }
}

async function init() {


  // VAT ファイル (FBX + EXR) からアニメーションデータを構築。
  // パスはこのファイル (src/) の1つ上の階層基準 — vite の開発サーバーでも、
  // docs/ をそのまま静的配信した場合でも同じ場所に解決される。
  // (new URL(リテラル, import.meta.url) は vite に書き換えられるため文字列で組む)
  const moduleDir = import.meta.url.replace(/[^/]*$/, "");
  animData = await getAnimationData();
  if (disposed) return;

  // 開いた紙の実寸 — 画面比率に合わせたスケール計算に使う
  flatSize.width = animData.flat.width;
  flatSize.depth = animData.flat.depth;

  // くしゃくしゃメッシュの実測値で衝突球と回転中心を設定
  // 紙玉の底が見た目の床 (FLOOR_VISUAL_Y) に接するようにする
  crumpleCenter.fromArray(animData.crumple.center);
  collisionRadius = animData.crumple.radius * CLOSED_SCALE;
  // 半径は90パーセンタイル値なので、はみ出た角がめり込まないよう少し余裕を持たせる
  restCenterY = FLOOR_VISUAL_Y + collisionRadius * 1.08;
  restMeshY = restCenterY - crumpleCenter.y * CLOSED_SCALE;
  floorBody.position.y = restCenterY - collisionRadius;
  console.log(
    "[VAT] physics: collisionRadius =", collisionRadius.toFixed(3),
    "restCenterY =", restCenterY.toFixed(3),
  );

}

function initialPaperPosition(i) {
  if (i < PAPER_OFFSETS.length) {
    return new THREE.Vector3(PAPER_OFFSETS[i][0], restMeshY, PAPER_OFFSETS[i][2]);
  }
  return randomSpawnPosition();
}

function randomSpawnPosition() {
  const bounds = getThrowBounds();
  const margin = collisionRadius * 1.3;
  const pos = new THREE.Vector3(0, restMeshY, 0);
  // 既存の紙と重ならない位置を探す (見つからなければ最後の候補で妥協)
  for (let attempt = 0; attempt < 40; attempt++) {
    //pos.x = randomRange(bounds.minX + margin, bounds.maxX - margin);
    //pos.z = randomRange(bounds.minZ + margin, bounds.maxZ - margin);
    const clear = papers.every((p) => {
      const dx = p.body.position.x - pos.x;
      const dz = p.body.position.z - pos.z;
      return dx * dx + dz * dz > (collisionRadius * 2.4) ** 2;
    });
    if (clear) break;
  }
  return pos;
}

let spawnCounter = 0;

function spawnPaper(position, dropIn, dropHeight = randomRange(0.8, 1.2)) {
  const maxFrame = animData.frameCount - 1;
  // デザイン (KIFFMA / HACHIDORI) を交互に割り当てる
  const base = createPaper(animData);
  base.mesh.castShadow = true;
  base.mesh.rotation.set(
    0,
    randomRange(-Math.PI, Math.PI),
    randomRange(-0.18, 0.18),
  );
  base.mesh.position.copy(position);
  base.mesh.scale.setScalar(CLOSED_SCALE);
  scene.add(base.mesh);
  const body = createPaperBody(base);

  const paper = {
    ...base,
    body,
    frameIdx: maxFrame,
    state: "closed",
    time: 0,
    homePosition: base.mesh.position.clone(),
    homeRotation: base.mesh.rotation.clone(),
    start: null,
    target: null,
    throw: null,
  };
  updatePaperFrame(paper, animData, maxFrame);
  papers.push(paper);

  // 記事用 (?debug=physics): 衝突球をワイヤーフレームで可視化
  if (debugPhysics) {
    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(collisionRadius, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x00b566, wireframe: true }),
    );
    scene.add(wire);
    paper.debugSphere = wire;
  }

  if (dropIn) {
    // 上から落として登場させる
    paper.state = "rolling";
    paper.throw = { settleTimer: 0 };
    body.position.y += dropHeight;
    body.angularVelocity.set(
      randomRange(-1.5, 1.5),
      randomRange(-0.5, 0.5),
      randomRange(-1.5, 1.5),
    );
    syncMeshToBody(paper);
  }
  return paper;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const grabPlane = new THREE.Plane();
const grabHitPoint = new THREE.Vector3();
let pointerState = null;

renderer.domElement.style.touchAction = "none";

function updatePointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickPaper(e) {
  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(papers.map((p) => p.mesh));
  if (hit.length === 0) return null;
  return papers.find((p) => p.mesh === hit[0].object) || null;
}

function isGrabbable(paper) {
  return paper.state === "closed" || paper.state === "rolling";
}

renderer.domElement.addEventListener("pointerdown", (e) => {
  if (!animData || pointerState || pouring || e.button !== 0) return;
  const p = pickPaper(e);
  pointerState = {
    paper: p,
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    grabbing: false,
  };
  try {
    renderer.domElement.setPointerCapture(e.pointerId);
  } catch {
    // 合成イベントなど pointerId が有効でない場合は無視
  }

  // Start a grab only after the pointer actually moves; holding still never
  // changes the paper's state or position.
  if (p && p.state === "rolling" && options.canGrab?.() !== false) beginGrab(p, e);
});

renderer.domElement.addEventListener("pointermove", (e) => {
  if (!pointerState) {
    updateHoverCursor(e);
    return;
  }
  if (e.pointerId !== pointerState.pointerId) return;
  if (e.pointerType === "mouse" && !(e.buttons & 1)) { cancelPointer(); updateHoverCursor(e); return; }
  if (!pointerState.grabbing) {
    const paper = pointerState.paper;
    const moved = Math.hypot(e.clientX - pointerState.startX, e.clientY - pointerState.startY);
    if (paper && isGrabbable(paper) && moved > CLICK_DRAG_THRESHOLD_PX && options.canGrab?.() !== false) beginGrab(paper, e);
  }
  if (pointerState.grabbing) updateGrabTarget(pointerState.paper, e);
});

renderer.domElement.addEventListener("pointerup", (e) => {
  if (!pointerState || e.pointerId !== pointerState.pointerId) return;
  if (pointerState.grabbing) {
    const paper = pointerState.paper;
    releaseGrab(paper, true);
    pointerState = null;
    options.onDrop?.(paper.noteId, e.clientX, e.clientY);
    options.onDragEnd?.();
  } else {
    handleClick(e);
  }
  pointerState = null;
});

function cancelPointer(e) {
  if (!pointerState || e?.pointerId!==undefined && e.pointerId !== pointerState.pointerId) return;
  if (pointerState.grabbing) releaseGrab(pointerState.paper, false);
  pointerState = null;
  options.onDragEnd?.();
}
renderer.domElement.addEventListener("pointercancel",cancelPointer);
renderer.domElement.addEventListener("lostpointercapture",cancelPointer);
window.addEventListener("blur",cancelPointer);

function updateHoverCursor(e) {
  if (!animData) return;
  const p = pickPaper(e);
  renderer.domElement.style.cursor = p
    ? isGrabbable(p) ? "grab" : "pointer"
    : "";
}

function handleClick(e) {
  const p = pickPaper(e);
  if (!p) return;
  if (options.onPick?.(p.noteId, e.clientX, e.clientY) === false) return;

  const previousActive = activePaper;
  if (previousActive) {
    startDiscard(previousActive);
    activePaper = null;
  }

  if (previousActive === p || !isGrabbable(p)) return;

  startOpen(p);
  activePaper = p;
}

function beginGrab(paper, e) {
  pointerState.grabbing = true;
  paper.state = "grabbed";
  paper.time = 0;

  const body = paper.body;
  body.type = CANNON.Body.KINEMATIC;
  body.mass = 0;
  body.updateMassProperties();
  body.velocity.set(0, 0, 0);
  body.angularVelocity.set(0, 0, 0);
  // 掴んでいる間も他の紙玉を押しのけられるよう衝突は有効のまま
  body.collisionFilterGroup = 1;
  body.collisionFilterMask = 1;
  body.wakeUp();

  paper.grab = {
    depth: Math.max(2.4, new THREE.Vector3(body.position.x, body.position.y, body.position.z).sub(camera.position).dot(camera.getWorldDirection(_viewDir))),
    target: new THREE.Vector3(
      body.position.x,
      body.position.y,
      body.position.z,
    ),
  };
  updateGrabTarget(paper, e);
  renderer.domElement.style.cursor = "grabbing";
}

function updateGrabTarget(paper, e) {
  const rect=renderer.domElement.getBoundingClientRect(),margin=Math.min(24,rect.width*.06);
  const top=rect.top+margin;
  updatePointer({clientX:Math.max(rect.left+margin,Math.min(rect.right-margin,e.clientX)),clientY:Math.max(top,Math.min(rect.bottom-margin,e.clientY))});
  raycaster.setFromCamera(pointer, camera);
  camera.getWorldDirection(_viewDir);
  grabPlane.setFromNormalAndCoplanarPoint(
    _viewDir,
    camera.position.clone().addScaledVector(_viewDir, paper.grab.depth),
  );
  if (!raycaster.ray.intersectPlane(grabPlane, grabHitPoint)) return;
  paper.grab.target.copy(grabHitPoint);
}

function releaseGrab(paper, withThrow) {
  const body = paper.body;
  let vx = withThrow ? body.velocity.x : 0;
  let vz = withThrow ? body.velocity.z : 0;
  const speed = Math.hypot(vx, vz);
  if (speed > THROW_MAX_SPEED) {
    const k = THROW_MAX_SPEED / speed;
    vx *= k;
    vz *= k;
  }

  body.type = CANNON.Body.DYNAMIC;
  body.mass = PAPER_MASS;
  body.updateMassProperties();
  body.velocity.set(vx, 0, vz);
  // 進行方向に転がる向きの回転を付ける
  body.angularVelocity.set(
    (vz / collisionRadius) * 0.6,
    0,
    (-vx / collisionRadius) * 0.6,
  );
  body.wakeUp();

  paper.state = "rolling";
  paper.time = 0;
  paper.throw = { settleTimer: 0 };
  renderer.domElement.style.cursor = "grab";
}

function startOpen(paper) {
  cancelPointer();
  if(paper.note)paintPaper(paper,paper.note,false);
  options.onOpening?.(paper.noteId);
  setPaperBodyDynamic(paper, false);
  syncMeshToBody(paper);
  paper.state = "opening";
  paper.time = 0;
  paper.start = captureTransform(paper);
  const pose = computeOpenPose();
  paper.target = {
    position: pose.position,
    quaternion: pose.quaternion,
    scale: pose.scale,
    frameIdx: animSettings.openFrame,
  };
}

function startDiscard(paper) {
  if(paper.note)paintPaper(paper,paper.note,true);
  options.onClose?.();
  if (paper.state === "discarding" || paper.state === "rolling") return;

  // 開いた紙はカメラ手前にあるので、必ず奥(ステージ側)へ向けて捨てる
  const dir = new THREE.Vector3(
    randomRange(-1, 1),
    0,
    randomRange(-1.3, -0.45),
  );
  dir.normalize();

  paper.state = "discarding";
  paper.time = 0;
  paper.start = captureTransform(paper);
  setPaperBodyDynamic(paper, true);
  syncBodyToMesh(paper);
  paper.body.velocity.set(
    dir.x * randomRange(1.4, 2.0),
    randomRange(0.5, 0.9),
    dir.z * randomRange(1.4, 2.0),
  );
  paper.body.angularVelocity.set(
    randomRange(-2.4, 2.4),
    randomRange(-0.8, 0.8),
    randomRange(-2.4, 2.4),
  );
  paper.throw = {
    settleTimer: 0,
  };
}

// ==================================================
// アニメーション再生
// ==================================================
const FPS = 24;
const FRAME_DURATION = 1.0 / FPS;
let prevTime = null;

function startAnimation() {
  prevTime = performance.now() / 1000;
  renderer.setAnimationLoop(tick);
}

function tick() {
  const now = performance.now() / 1000;
  const dt = Math.min(now - prevTime, 0.05);
  prevTime = now;

  if (!animData) return;

  physicsWorld.step(PHYSICS_STEP, Math.min(dt, 0.05), 3);
  if (!pouring) applyPhysicsBounds(dt);

  for (const p of papers) {
    updatePaperMotion(p, dt);
  }

  if (debugPhysics) {
    for (const p of papers) {
      if (!p.debugSphere) continue;
      p.debugSphere.position.set(
        p.body.position.x,
        p.body.position.y,
        p.body.position.z,
      );
    }
  }

  if (pouring) {
    pourTime += dt;
    camera.rotation.z = Math.min(0.28, pourTime * 0.22);
    for (const p of papers) { p.mesh.material.opacity = Math.max(0, 1 - Math.max(0, pourTime - 0.5) / 0.8); }
    if (pourTime >= 1.3) finishPour();
  }
  composer.render();
}

function updatePaperMotion(paper, dt) {
  const maxFrame = animData.frameCount - 1;

  if (paper.state === "opening") {
    paper.time += dt * animSettings.speed;
    const t = clamp01(paper.time / OPEN_DURATION);
    const e = easeOutCubic(t);
    const openEase = easeInCubic(t);

    paper.mesh.position.lerpVectors(
      paper.start.position,
      paper.target.position,
      e,
    );
    paper.mesh.quaternion.slerpQuaternions(
      paper.start.quaternion,
      paper.target.quaternion,
      e,
    );
    paper.mesh.scale.setScalar(lerp(paper.start.scale, paper.target.scale, e));

    paper.frameIdx = lerp(
      paper.start.frameIdx,
      paper.target.frameIdx,
      openEase,
    );
    updatePaperFrame(paper, animData, paper.frameIdx);

    if (t >= 1) {
      paper.state = "open";
      options.onOpen?.(paper.noteId, editorRect());
      paper.frameIdx = paper.target.frameIdx;
      paper.mesh.position.copy(paper.target.position);
      paper.mesh.quaternion.copy(paper.target.quaternion);
      paper.mesh.scale.setScalar(paper.target.scale);
      syncBodyToMesh(paper);
      updatePaperFrame(paper, animData, paper.frameIdx);
    }
    return;
  }

  if (paper.state === "discarding") {
    paper.time += dt * animSettings.speed;
    const t = clamp01(paper.time / DISCARD_DURATION);
    const closeEase = easeOutCubic(t);
    const scale = lerp(paper.start.scale, CLOSED_SCALE, closeEase);

    paper.frameIdx = lerp(paper.start.frameIdx, maxFrame, closeEase);
    syncMeshToBody(paper, scale);
    updatePaperFrame(paper, animData, paper.frameIdx);

    if (t >= 1) {
      paper.state = "rolling";
      paper.time = 0;
      paper.frameIdx = maxFrame;
      updatePaperFrame(paper, animData, paper.frameIdx);
    }
    return;
  }

  if (paper.state === "grabbed") {
    const body = paper.body;
    const target = paper.grab.target;
    // ポインタ位置へバネ状に追従する速度を与える (KINEMATIC なので
    // step() が速度から位置を積分し、他の紙玉も自然に押しのけられる)
    let vx = (target.x - body.position.x) * GRAB_STIFFNESS;
    let vy = (target.y - body.position.y) * GRAB_STIFFNESS;
    let vz = (target.z - body.position.z) * GRAB_STIFFNESS;
    const speed = Math.hypot(vx, vy, vz);
    // Keep apparent following speed steady when dragging far into the scene.
    const maxSpeed=GRAB_MAX_SPEED*Math.max(1,camera.position.distanceTo(target)/4);
    if (speed > maxSpeed) {
      const k = maxSpeed / speed;
      vx *= k;
      vy *= k;
      vz *= k;
    }
    body.velocity.set(vx, vy, vz);
    syncMeshToBody(paper);
    return;
  }

  if (paper.state === "rolling") {
    paper.time += dt;
    const grounded = isOnGround(paper.body);
    // 転がり抵抗は接地中のみ — 空中では自然に飛ぶ
    if (grounded) applyRollingResistance(paper.body, dt);
    syncMeshToBody(paper);
    const speed =
      paper.body.velocity.lengthSquared() +
      paper.body.angularVelocity.lengthSquared() * 0.02;
    paper.throw.settleTimer = grounded && speed < ROLL_SETTLE_SPEED
      ? paper.throw.settleTimer + dt
      : 0;

    if (paper.throw.settleTimer > 0.35) {
      finishRollingPaper(paper, maxFrame);
    }
    return;
  }

  if (paper.state === "closed") {
    if (isOnGround(paper.body)) applyRollingResistance(paper.body, dt);
    syncMeshToBody(paper);
  }
}

// ==================================================
// リサイズ対応
// ==================================================

function resize() {
  if (disposed || !app.clientWidth || !app.clientHeight) return;
  camera.aspect = app.clientWidth / app.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(app.clientWidth, app.clientHeight);
  composer.setSize(app.clientWidth, app.clientHeight);
  updateOpenPose();
}
const observer = new ResizeObserver(resize);
observer.observe(app);
function editorRect() {
  const pose = computeOpenPose();
  const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * OPEN_DISTANCE;
  const height = flatSize.depth * pose.scale / viewH * app.clientHeight;
  const width = height * flatSize.width / flatSize.depth;
  return { left: (app.clientWidth-width)/2, top: (app.clientHeight-height)/2, width, height };
}
function clearPapers() {
  cancelPointer(); activePaper = null;
  for (const p of papers) { scene.remove(p.mesh); p.mesh.geometry.dispose();p.mesh.material.map?.dispose(); p.mesh.material.dispose(); physicsWorld.removeBody(p.body); }
  papers.length = 0;
}
function setNotes(notes) {
  if (disposed) return;
  clearPapers(); options.onClose?.();
  const bounds = getThrowBounds(), span = bounds.maxX-bounds.minX-collisionRadius*2.8;
  const cols = Math.max(1, Math.min(notes.length, Math.floor(span/(collisionRadius*2.7))+1));
  notes.forEach((note, i) => {
    // Scatter the original physical objects instead of displaying a rigid grid.
    // Keep spacing stable for each note and center a partially filled last row.
    let seed=0;for(const char of String(note.id))seed=(seed*31+char.charCodeAt(0))>>>0;
    const row=Math.floor(i/cols), rowCount=Math.min(cols,notes.length-row*cols);
    const spacing=cols>1?span/(cols-1):0;
    const jitter=notes.length>1?((seed%97)/96-.5)*collisionRadius*.6:0;
    const x=(i%cols-(rowCount-1)/2)*spacing+jitter;
    const z=(notes.length<=cols?.2:-.35+row*collisionRadius*2.4)+(notes.length>1?(((seed>>>7)%83)/82-.5)*collisionRadius*1.7:0);
    const p = spawnPaper(new THREE.Vector3(x,restMeshY,Math.min(1.25,z)),false);
    p.noteId = note.id;
    p.note=note;paintPaper(p,note);
  });
  renderer.domElement.dataset.paperCount = String(papers.length);
}
// Hand the real card rectangle to the original VAT discard / physics state
// machine. This is the bridge between the HTML cover and the paper mesh.
function tossNote(note, rect, angle = 0) {
  if (disposed || pouring || !animData) return;
  const p = spawnPaper(new THREE.Vector3(0, restMeshY, 0), false);
  p.noteId = note.id;
  p.note=note;paintPaper(p,note);
  const canvasRect = renderer.domElement.getBoundingClientRect();
  const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * OPEN_DISTANCE;
  const pose = computeOpenPose();
  const x = ((rect.left + rect.width / 2 - canvasRect.left) / canvasRect.width - .5) * viewH * camera.aspect;
  const y = (.5 - (rect.top + rect.height / 2 - canvasRect.top) / canvasRect.height) * viewH;
  p.mesh.position.copy(pose.position).add(new THREE.Vector3(x, y, 0).applyQuaternion(camera.quaternion));
  p.mesh.quaternion.copy(pose.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle));
  p.mesh.scale.setScalar(rect.height / canvasRect.height * viewH / flatSize.depth);
  p.frameIdx = 0; p.state = 'open'; updatePaperFrame(p, animData, 0);
  startDiscard(p);
  renderer.domElement.dataset.paperCount = String(papers.length);
}
function paperPosition(id) {
  const p = papers.find(p => p.noteId === id); if (!p) return null;
  const v = p.mesh.position.clone().add(crumpleCenter.clone().multiplyScalar(p.mesh.scale.x).applyQuaternion(p.mesh.quaternion)).project(camera);
  const rect = renderer.domElement.getBoundingClientRect();
  return {x: rect.left + (v.x + 1) / 2 * rect.width, y: rect.top + (1 - v.y) / 2 * rect.height};
}
function updateNotes(notes){
  for(const p of papers){const note=notes.find(n=>n.id===p.noteId);if(note){p.note=note;paintPaper(p,note,p.state!=='open'&&p.state!=='opening');}}
}
function removeNote(id){
  const index=papers.findIndex(p=>p.noteId===id);if(index<0)return;
  const [paper]=papers.splice(index,1);
  scene.remove(paper.mesh);physicsWorld.removeBody(paper.body);
  paper.mesh.geometry.dispose();paper.mesh.material.map?.dispose();paper.mesh.material.dispose();
  renderer.domElement.dataset.paperCount=String(papers.length);
}
function openNote(id) {
  if (pouring) return;
  const p = papers.find(p=>p.noteId===id); if (!p) return;
  if (activePaper === p) return;
  if (activePaper) startDiscard(activePaper);
  startOpen(p); activePaper = p;
}
function closeNote() {
  if (activePaper) startDiscard(activePaper);
  activePaper = null;
}
function finishPour() {
  clearPapers(); pouring = false; camera.rotation.z = 0;
  physicsWorld.gravity.set(0,-7,0); physicsWorld.addBody(floorBody);
  const done = pourResolve; pourResolve = null; done?.(true);
}
function pour() {
  if (disposed) return Promise.resolve(false);
  cancelPointer();
  if (reduced) { clearPapers(); return Promise.resolve(true); }
  return new Promise(resolve=>{
    pourResolve=resolve; pouring=true; pourTime=0; activePaper=null; pointerState=null;
    options.onClose?.(); physicsWorld.removeBody(floorBody); physicsWorld.gravity.set(7,-8,0);
    for (const p of papers) {
      setPaperBodyDynamic(p,true); p.state='rolling'; p.throw={settleTimer:0};
      p.mesh.material.transparent=true; p.body.velocity.set(2+Math.random(),1,0);
      p.body.angularVelocity.set(1,0,-4); updatePaperFrame(p,animData,animData.frameCount-1);
    }
  });
}
function dispose() {
  if (disposed) return; disposed=true; observer.disconnect(); renderer.setAnimationLoop(null);
  window.removeEventListener('blur',cancelPointer);
  const done=pourResolve; pourResolve=null; done?.(false); clearPapers();
  scene.traverse(object=>{object.geometry?.dispose();if(object.material)object.material.dispose();});
  dirLight.shadow.dispose(); for (const pass of composer.passes) pass.dispose?.(); composer.dispose();
  renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
}
function visibility() { if (!disposed) { renderer.setAnimationLoop(document.hidden ? null : tick); prevTime=performance.now()/1000; } }
document.addEventListener('visibilitychange',visibility);
try { await init(); resize(); startAnimation(); }
catch(error) { document.removeEventListener('visibilitychange',visibility); dispose(); throw error; }
return { setNotes, updateNotes, removeNote, cancelDrag:cancelPointer, tossNote, paperPosition, openNote, closeNote, pour, editorRect, setBackground(color) { renderer.setClearColor(color, 0); }, dispose() { document.removeEventListener('visibilitychange',visibility); dispose(); } };

}
