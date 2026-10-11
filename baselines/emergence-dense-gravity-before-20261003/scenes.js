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
    rules: ['分离：太近，就让一让', '对齐：与身边的同伴同向', '聚拢：离远，就靠近一点', '避敌：远离天敌'],
    basic: [speed(), range('count', '群体数量', 40, 900, 20, 420, '个'), range('predators', '捕食者', 0, 4, 1, 1, '只', '靠近时避让，接触时捕获。'), shape(), pointer(), depth(), edgeWrap()],
    advanced: [range('current', '水流强度', 0, 1.5, .05, .55, '', '鱼形时生效。'), range('separation', '保持距离', .5, 2, .05, 1.25), range('alignment', '方向默契', .2, 2, .05, 1.1), range('cohesion', '靠拢倾向', .2, 2, .05, .75), range('perception', '感知范围', 35, 110, 5, 70), choice('replenish', '捕获后补充', [['yes', '自动补充'], ['no', '自然减少']], 'yes')],
    note: '只回应身边的同伴，群体的形状自然形成。',
    lifecycle: lifecycle(900, '个'),
  },
  cosmos: {
    id: 'cosmos', name: '宇宙', en: 'COSMOS', subtitle: '引力之间，各循其轨', model: 'gravity',
    title: '彼此牵引，\n各自闪耀。', description: '在相遇与碰撞之间，让星体慢慢聚集。',
    rules: ['引力：质量越大，牵引越强', '融合：相撞聚合，留下主体', '碎裂：部分散开，化为星尘', '再生：聚至 99%，再次爆发'],
    basic: [speed(), range('count', '初始星体数量', 100, 1200, 50, 650, '颗', '调整数量会重新生成星体；碰撞会改变当前数量。'), choice('pointer', '鼠标互动', [['none', '无'], ['repel', '推开'], ['attract', '牵引'], ['magnify', '放大镜']], 'none'), depth(), edgeWrap()],
    physics: [
      { title: '星体引力', fields: [range('mutualGravity', '星体间引力', 0, 2, .05, .7, '×', '质量越大，吸引越强；合并后颜色更浓、更亮，尺寸平滑微增，最多增大 20%。设为 0 关闭相互引力。'), choice('blackHoles', '黑洞演化', [['yes', '开启'], ['no', '关闭']], 'yes'), range('blackHoleThreshold', '形成所需质量占比', 80, 99, 1, 90, '%', '单颗星体占当前总质量达到此比例时，逐渐形成黑洞，扩大引力范围；接触黑核时吸收，关闭碰撞则不吸收。')] },
      { title: '碰撞演化', fields: [choice('collisions', '碰撞规则', [['auto', '自动判断'], ['merge', '仅正碰合并'], ['off', '关闭']], 'auto'), range('mergeOverlap', '合并所需深入程度', 30, 90, 5, 45, '%', '控制正碰融合的深入程度；自动判断下，低速接触可吸积融合，较快的擦边碰撞会留下主体并甩出碎片。'), range('mergeCooldown', '再次合并间隔', 1, 10, .5, 3, '秒', '碰撞后的星体短暂保持各自轨迹，避免连续吞并，不作弹性反弹。'), range('fragmentSpeed', '碎裂门槛', .5, 4, .1, 1.8, '', '相对局部逃逸速度判断；低速正碰易融合，高速碰撞甩出碎片，质量差也参与判断。'), range('fragmentGrace', '碎片冷却', 1, 6, .5, 2, '秒', '碎片短暂免碰撞；最多保留 1200 颗，达到上限时减少碎片数量，总质量不变。')] },
      { title: '星尘补给', fields: [choice('influx', '外来星尘', [['yes', '开启'], ['no', '关闭']], 'yes'), range('influxInterval', '补给间隔', 3, 30, 1, 8, '秒'), range('influxBatch', '每次进入', 1, 6, 1, 2, '颗', '从屏幕外缓慢进入，参与引力与碰撞；达到 1200 颗时暂停补给。')] },
    ],
    advanced: [range('orbit', '初始运动速度', .5, 1.4, .05, 1, '×', '调整后重新播种，查看新的轨道。'), range('trail', '轨迹长度', 0, 24, 1, 10)],
    note: '中心一点蓄能后向四周爆发，散开的亮点再陆续释放细小星尘；2D 在平面扩散，3D 向球面各个方向扩散。所有星尘共用设置中的初始数量和总质量，之后由引力与碰撞自然聚集。质量越大，有效引力范围越大；近处按牛顿引力运动，范围边缘平滑减弱，远处的微弱作用近似忽略。单颗星体达到设定的总质量占比时，原地形成黑洞，扩大引力范围并吸收接触的星体；这是主题的演化规则。低速正碰易融合，高速碰撞留下主体并甩出碎片。碎片越轻越小，主体增大最多 20%。尾迹默认记录最近约 0.25 秒的运动，越早越淡，长度随速度变化，与质量无关。单颗星体聚集当前总质量的 99% 时，在其当前位置收拢余量、浓缩、微胀并再次爆发；期间暂停补给，沿用初始数量并保留总质量；没有固定引力源，也不会强制让每轮都合成一颗。',
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
  const rules=config.mutualGravity>0?['引力：质量越大，牵引越强']:['惯性：无引力时，沿原方向运动'];
  if(config.collisions==='auto')rules.push('融合：相撞聚合，留下主体','碎裂：部分散开，化为星尘','再生：聚至 99%，再次爆发');
  else if(config.collisions==='merge')rules.push('融合：正面相撞，质量累加','穿行：擦边相遇，沿轨迹经过','再生：聚至 99%，再次爆发');
  else rules.push('穿行：相遇时穿过，不发生碰撞');
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
