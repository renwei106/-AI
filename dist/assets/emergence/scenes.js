// A scene owns its rules and parameter schema; the shell only renders the schema.
const range = (key, label, min, max, step, value, unit = '', hint = '') => ({ key, label, type: 'range', min, max, step, value, unit, hint });
const choice = (key, label, options, value) => ({ key, label, type: 'choice', options, value });
const speed = (max = 2) => range('speed', '运行速度', .25, max, .05, .8, '×');
const depth = () => choice('depth', '显示维度', [['flat', '2D'], ['depth', '3D']], 'flat');
const edgeWrap = () => choice('edgeWrap', '边缘穿透', [['no', '不穿透'], ['yes', '穿透']], 'no');
const pointer = () => choice('pointer', '鼠标互动', [['none', '无'], ['repel', '驱散'], ['attract', '吸引']], 'repel');
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
    rules: ['引力：彼此吸引', '惯性：保持原有运动', '融合：相撞合并，逐渐长大'],
    basic: [range('speed','运行速度',.025,10,.005,1,'×','1× 为标准演化节奏，可慢放或加快；长按临时加速至当前速度的 3 倍。'), range('count', '初始星体数量', 100, 4000, 50, 2500, '颗', '调整数量会重新生成星体；碰撞会改变当前数量。'), choice('pointer', '鼠标互动', [['none', '无'], ['repel', '推开'], ['attract', '牵引']], 'none'), depth(), {...edgeWrap(),value:'yes'}],
    physics: [
      { title: '星体引力', fields: [range('mutualGravity', '星体间引力', 0, 7, .07, .7, '×', '质量越大，牵引越强、范围越大；普通星体范围最多 8 m，恒星至少 12 m、星系源至少 20 m，黑洞逐渐扩大至 36 m；以质量的立方根增长；尘埃、碎片与碎石同样参与双向引力，速度和方向随受力逐渐改变。'), choice('blackHoles', '黑洞演化', [['yes', '开启'], ['no', '关闭']], 'yes')] },
      { title: '星体质量倍率', fields: [range('fragmentMass','碎片基础质量',.1,100,.1,2,'kg'),range('rockRatio','碎石',1.1,64,.1,4,'倍'),range('satelliteRatio','小行星',1.1,64,.1,4,'倍'),range('planetRatio','行星',1.1,64,.1,4,'倍'),range('starRatio','恒星',1.1,64,.1,4,'倍'),range('sourceRatio','星系源',1.1,64,.1,8,'倍'),range('blackHoleRatio','黑洞',1.1,64,.1,16,'倍')] },
      { title: '碰撞演化', fields: [choice('collisions', '碰撞融合', [['auto', '开启'], ['off', '关闭']], 'auto','两个黑洞碰撞合并后，在原地爆发并释放碎粒。')] },
      { title: '星尘补给', fields: [choice('influx', '外来星尘', [['yes', '开启'], ['no', '关闭']], 'yes'), range('influxInterval', '补给周期', 1, 30, 1, 3, '秒'), range('influxBatch', '每周期星尘', 1, 120, 1, 24, '颗', '开场释放完成后持续补给，以背景渐显为主，少量从四周流入；达到初始数量时暂停补给，最多保留 4000 颗。')] },
    ],
    advanced: [range('orbit', '初始运动速度', .5, 1.4, .05, 1, '×', '画面宽度为 100 m（3D 以中心平面为准），质量单位为 kg。1× 基准初速为 0.15 m/s，粒子速度有随机差异。运行速度控制时间播放倍率。调整后重新开始生效。'), range('trailSeconds', '轨迹保留时间', 1, 20, 1, 8, '秒', '保留最近 1–20 秒的轨迹；暂停时冻结，调整无需重新开始。')],
    note: '中心蓄能后爆发，开场初速平滑减弱并保留漂移；剩余星尘在背景中带着初速度逐渐显现，初始以尘埃为主，含少量碎片、碎石与更少的小行星，不直接生成行星或星系。质量等级：尘埃、碎片、碎石、小行星、行星、恒星、星系源、黑洞；这是主题的演化分级。碰撞累加质量；吸附尘埃与碎片不改变宿主速度，其他融合按质量合成速度。黑洞合并后继续长大，达到黑洞初始质量门槛的 4 倍才爆发，质量分批随机分配给碎片、碎石和小行星。引力仍会逐渐改变轨迹，颜色和尺寸随等级变化。不预设聚集中心、系统数量或最终形态。',
  },


};

export function migrateSelection(saved = {}) {
  const configs={...saved.configs};
  delete configs.stars;delete configs.gravity;delete configs.accretion;
  saved={...saved,scene:['stars','gravity','accretion'].includes(saved.scene)?'birds':saved.scene,configs};
  if(saved.configs?.cosmos&&saved.configs.cosmos.timeScale!==10){
    saved={...saved,configs:{...saved.configs,cosmos:sanitize('cosmos',saved.configs.cosmos)}};
  }
  if(saved.scene!=='fish'&&!saved.configs?.fish)return saved;
  const migrated={...saved.configs};
  if(saved.scene==='fish'||!migrated.birds)migrated.birds={shape:'fish',...migrated.fish};
  delete migrated.fish;
  return {...saved,scene:saved.scene==='fish'?'birds':saved.scene,configs:migrated};
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
  return [config.mutualGravity>0?'引力：彼此吸引':'引力：已关闭', '惯性：保持原有运动', config.collisions!=='off'?'融合：相撞合并，逐渐长大':'融合：已关闭'];
}
export const defaultsFor = id => ({...Object.fromEntries(fieldsFor(id).map(field => [field.key, field.value])),...(id==='cosmos'?{timeScale:10}:{})});
export function sanitize(id, raw = {}) {
  if(id==='cosmos'){
    raw={...raw};if(raw.starRatio===undefined&&raw.starMass===undefined&&raw.sourceRatio!==undefined)raw.sourceRatio=raw.sourceRatio/4;let previous=raw.fragmentMass??2;
    for(const [ratio,mass,fallback] of [['rockRatio','rockMass',8],['satelliteRatio','satelliteMass',32],['planetRatio','planetMass',128],['starRatio','starMass',(raw.planetMass??128)*4],['sourceRatio','sourceMass',4096],['blackHoleRatio','blackHoleMass',65536]]){
      if(raw[ratio]===undefined&&Number.isFinite(raw[mass]))raw[ratio]=raw[mass]/previous;
      previous=raw[mass]??fallback;
    }
  }
  if(id==='cosmos'&&raw?.timeScale!==10&&typeof raw?.speed==='number')raw={...raw,speed:raw.speed===.8?1:raw.speed/10};
  const safe = {};
  for (const field of fieldsFor(id)) {
    const input = field.key==='collisions'&&raw?.[field.key]==='merge'?'auto':raw?.[field.key];
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
  if(id==='cosmos'){
    safe.timeScale=10;let mass=safe.fragmentMass;
    for(const [ratio,key] of [['rockRatio','rockMass'],['satelliteRatio','satelliteMass'],['planetRatio','planetMass'],['starRatio','starMass'],['sourceRatio','sourceMass'],['blackHoleRatio','blackHoleMass']]){mass*=safe[ratio];safe[key]=Number(mass.toPrecision(12));}
  }
  return safe;
}
