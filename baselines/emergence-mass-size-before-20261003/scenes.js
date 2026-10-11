// A scene owns its rules and parameter schema; the shell only renders the schema.
const range = (key, label, min, max, step, value, unit = '', hint = '') => ({ key, label, type: 'range', min, max, step, value, unit, hint });
const choice = (key, label, options, value) => ({ key, label, type: 'choice', options, value });
const speed = () => range('speed', '运行速度', .25, 2, .05, .8, '×');
const depth = () => choice('depth', '显示维度', [['flat', '2D'], ['depth', '3D']], 'flat');
const edgeWrap = () => choice('edgeWrap', '边缘穿透', [['no', '不穿透'], ['yes', '穿透']], 'no');
const pointer = () => choice('pointer', '鼠标互动', [['none', '无'], ['repel', '驱散'], ['attract', '吸引'], ['magnify', '放大镜']], 'repel');
const shape = (value = 'triangle') => choice('shape', '个体形状', [['bird', '鸟形'], ['fish', '鱼形'], ['triangle', '三角'], ['line', '短线'], ['dot', '圆点']], value);
const lifecycle = (cap, unit) => [
  { title: '群体繁衍', fields: [
    choice('breeding', '定期繁衍', [['yes', '开启'], ['no', '关闭']], 'yes'),
    range('birthInterval', '繁衍间隔', 10, 60, 5, 20, '秒'),
    range('birthBatch', '每次新增', 1, 10, 1, 3, unit),
    range('populationCap', '群体数量上限', 40, cap, 20, cap, unit),
  ] },
  { title: '捕食规则', fields: [
    range('huntSpeed', '追逐速度', .6, 1.4, .05, 1, '×', '相对于捕食者默认速度。'),
    range('captureRadius', '捕获距离', 6, 16, 1, 10),
    range('huntRest', '进食后休息', 2, 20, 1, 4, '秒'),
  ] },
  { title: '捕食者繁衍', fields: [
    choice('predatorBreeding', '缓慢繁衍', [['yes', '开启'], ['no', '关闭']], 'yes'),
    range('predatorBirthInterval', '最短繁衍间隔', 180, 900, 60, 300, '秒', '整个捕食者群体每轮最多新增 1 只。'),
    range('birthMeals', '亲代所需进食', 3, 12, 1, 5, '次', '满足时间与进食条件后才会繁衍。'),
    range('predatorCap', '捕食者数量上限', 1, 6, 1, 4, '只'),
  ] },
];

export const SCENES = {
  birds: {
    id: 'birds', name: '群游', en: 'FLOCK', subtitle: '聚散之间，自有默契', model: 'flock',
    title: '聚散之间，\n自有默契。', description: '简单的规则，让微小的个体一起生长。',
    rules: ['太近，就让一让', '与身边的同伴同向', '离远，就靠近一点'],
    basic: [speed(), range('count', '群体数量', 40, 900, 20, 420, '个'), range('predators', '捕食者', 0, 4, 1, 1, '只', '靠近时避让，接触时捕获。'), shape(), pointer(), depth(), edgeWrap()],
    advanced: [range('current', '水流强度', 0, 1.5, .05, .55, '', '鱼形时生效。'), range('separation', '保持距离', .5, 2, .05, 1.25), range('alignment', '方向默契', .2, 2, .05, 1.1), range('cohesion', '靠拢倾向', .2, 2, .05, .75), range('perception', '感知范围', 35, 110, 5, 70), choice('replenish', '捕获后补充', [['yes', '自动补充'], ['no', '自然减少']], 'yes')],
    note: '只回应身边的同伴，群体的形状自然形成。',
    lifecycle: lifecycle(900, '个'),
  },
  cosmos: {
    id: 'cosmos', name: '宇宙', en: 'COSMOS', subtitle: '引力之间，各循其轨', model: 'gravity',
    title: '彼此牵引，\n各自闪耀。', description: '在相遇与碰撞之间，让星体慢慢聚集。',
    rules: ['质量越大，彼此牵引越强', '正面低速相撞，合并变重', '擦边相遇，偏转分开', '高速正面相撞，碎成小块'],
    basic: [speed(), range('count', '初始星体数量', 100, 1200, 50, 650, '颗', '调整数量会重新生成星体；碰撞会改变当前数量。'), choice('pointer', '鼠标互动', [['none', '无'], ['repel', '推开'], ['attract', '牵引'], ['magnify', '放大镜']], 'none'), depth(), edgeWrap()],
    physics: [
      { title: '星体引力', fields: [range('mutualGravity', '星体间引力', 0, 2, .05, .7, '×', '质量越大，吸引越强；合并后大小不变，以颜色深浅和亮度表示质量。设为 0 关闭相互引力。')] },
      { title: '碰撞演化', fields: [choice('collisions', '碰撞规则', [['auto', '自动判断'], ['merge', '仅正碰合并'], ['off', '关闭']], 'auto'), range('mergeOverlap', '合并所需深入程度', 30, 90, 5, 65, '%', '越高越需要正面相撞。65% 表示运动路径进入两者接触距离的内侧 35%，不代表接触面积。'), range('mergeCooldown', '再次合并间隔', 1, 10, .5, 3, '秒', '合并后的星体暂时只会偏转或碎裂，避免连续吞并。'), range('fragmentSpeed', '碎裂门槛', .5, 4, .1, 1.8, '', '高速正面撞击才会碎裂；擦边、速度不适合合并时偏转分开。'), range('fragmentGrace', '碎片冷却', 1, 6, .5, 2, '秒', '碎片短暂免碰撞，避免立即重新合并。最多保留 1200 颗，达到上限时偏转分开。')] },
    ],
    advanced: [range('orbit', '初始运动速度', .5, 1.4, .05, 1, '×', '调整后重新播种，查看新的轨道。'), range('trail', '轨迹长度', 0, 24, 1, 10)],
    note: '这是简化的引力演化风景。自动判断时，正面且低速的碰撞才合并；擦边或尚未满足合并条件时弹开，高速正面碰撞可碎裂。碰撞保留总质量，不自动补充星体，也不保证永远不收缩。没有额外的固定引力源；星体大小与碰撞范围保持不变，用颜色深浅和亮度表示质量。',
  },
};

export function migrateSelection(saved = {}) {
  if(saved.scene!=='fish'&&!saved.configs?.fish)return saved;
  const configs={...saved.configs};
  if(saved.scene==='fish'||!configs.birds)configs.birds={shape:'fish',...configs.fish};
  delete configs.fish;
  return {...saved,scene:saved.scene==='fish'?'birds':saved.scene,configs};
}
export function mergeLegacyContent(raw) {
  if(!raw?.scenes?.fish)return raw;
  const scenes={...raw.scenes},birds=scenes.birds,fish=scenes.fish;
  const preferFish=raw.defaultScene==='fish'||!birds||birds.enabled===false&&fish.enabled===true;
  scenes.birds={...(preferFish?fish:birds),enabled:birds?.enabled===true||fish.enabled===true,defaults:{...(preferFish?{shape:'fish'}:{}),...(preferFish?fish:birds)?.defaults}};
  delete scenes.fish;
  return {...raw,defaultScene:raw.defaultScene==='fish'?'birds':raw.defaultScene,scenes};
}
export const fieldsFor = id => [...SCENES[id].basic, ...SCENES[id].advanced, ...(SCENES[id].lifecycle || []).flatMap(group => group.fields), ...(SCENES[id].physics || []).flatMap(group => group.fields)];
export function rulesFor(id,config) {
  if(id!=='cosmos')return SCENES[id].rules;
  const rules=config.mutualGravity>0?['质量越大，彼此牵引越强']:['无引力时，沿原方向运动'];
  if(config.collisions==='auto')rules.push('正面低速相撞，合并变重','擦边相遇，偏转分开','高速正面相撞，碎成小块');
  else if(config.collisions==='merge')rules.push('正面相撞时合并，质量累加','擦边相遇，偏转分开');
  else rules.push('相遇时穿过，不发生碰撞');
  return rules;
}
export const defaultsFor = id => Object.fromEntries(fieldsFor(id).map(field => [field.key, field.value]));
export function sanitize(id, raw = {}) {
  const safe = {};
  for (const field of fieldsFor(id)) {
    const input = raw?.[field.key];
    if (field.type === 'choice') safe[field.key] = field.options.some(([key]) => key === input) ? input : field.value;
    else {
      const numeric = typeof input === 'number' && Number.isFinite(input) ? input : field.value;
      safe[field.key] = Number((field.min + Math.round((Math.max(field.min, Math.min(field.max, numeric)) - field.min) / field.step) * field.step).toFixed(4));
    }
  }
  if (SCENES[id].lifecycle) {
    safe.populationCap = Math.max(safe.count, safe.populationCap);
    safe.predatorCap = Math.max(safe.predators, safe.predatorCap);
  }
  return safe;
}
