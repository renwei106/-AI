// A scene owns its rules and parameter schema; the shell only renders the schema.
const range = (key, label, min, max, step, value, unit = '', hint = '') => ({ key, label, type: 'range', min, max, step, value, unit, hint });
const choice = (key, label, options, value) => ({ key, label, type: 'choice', options, value });
const speed = () => range('speed', '运行速度', .25, 2, .05, .8, '×');
const depth = () => choice('depth', '显示维度', [['flat', '2D'], ['depth', '3D']], 'flat');
const pointer = () => choice('pointer', '鼠标互动', [['none', '无'], ['repel', '驱散'], ['attract', '吸引']], 'repel');
const shape = (value = 'triangle') => choice('shape', '个体形状', [['triangle', '三角'], ['line', '短线'], ['dot', '圆点'], ['fish', '鱼形']], value);
const lifecycle = (cap, unit) => [
  { title: '群体繁衍', fields: [
    choice('breeding', '定期繁衍', [['yes', '开启'], ['no', '关闭']], 'yes'),
    range('birthInterval', '繁衍间隔', 10, 60, 5, 20, '秒'),
    range('birthBatch', '每次新增', 1, 10, 1, 3, unit),
    range('populationCap', '群体数量上限', cap === 900 ? 60 : 40, cap, 20, cap, unit),
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
    id: 'birds', name: '鸟群', en: 'FLOCK', subtitle: '聚散之间，自有默契', model: 'flock',
    title: '没有领头者，\n也能一起飞翔。', description: '每一次微小的转向，都让秩序悄然发生。',
    rules: ['太近，就让一让', '与身边的同伴同向', '离远，就靠近一点'],
    basic: [speed(), range('count', '鸟群数量', 60, 900, 20, 420, '只'), range('predators', '捕食者', 0, 4, 1, 0, '只', '靠近时避让，接触时捕获。'), shape(), pointer(), depth()],
    advanced: [range('separation', '保持距离', .5, 2, .05, 1.25), range('alignment', '方向默契', .2, 2, .05, 1.1), range('cohesion', '靠拢倾向', .2, 2, .05, .75), range('perception', '感知范围', 35, 110, 5, 70), choice('replenish', '捕获后补充', [['yes', '自动补充'], ['no', '自然减少']], 'yes')],
    note: '只回应身边的同伴，群体的形状自然形成。',
    lifecycle: lifecycle(900, '只'),
  },
  fish: {
    id: 'fish', name: '鱼群', en: 'SHOAL', subtitle: '随流而动，相伴而游', model: 'flock',
    title: '顺着水流，\n找到彼此的方向。', description: '水流轻推，同伴相随。让思绪慢慢游远。',
    rules: ['留出游动的距离', '跟随附近的同伴', '顺着水流轻轻转向'],
    basic: [speed(), range('count', '鱼群数量', 40, 600, 20, 260, '尾'), range('current', '水流强度', 0, 1.5, .05, .55), range('predators', '捕食者', 0, 4, 1, 0, '只'), shape('fish'), pointer(), depth()],
    advanced: [range('separation', '保持距离', .5, 2, .05, 1.1), range('alignment', '跟随倾向', .2, 2, .05, 1.5), range('cohesion', '聚群倾向', .2, 2, .05, 1), range('perception', '感知范围', 35, 110, 5, 85), choice('replenish', '捕获后补充', [['yes', '自动补充'], ['no', '自然减少']], 'yes')],
    note: '水流会改变游动方向，鱼群仍保留自己的默契。',
    lifecycle: lifecycle(600, '尾'),
  },
  cosmos: {
    id: 'cosmos', name: '宇宙', en: 'COSMOS', subtitle: '引力之间，各循其轨', model: 'gravity',
    title: '彼此牵引，\n各自闪耀。', description: '给星尘一个初始方向，让引力写下轨迹。',
    rules: ['星尘受到引力中心吸引', '惯性让它继续向前', '距离越近，牵引越强'],
    basic: [speed(), range('count', '星尘数量', 100, 1200, 50, 650, '颗'), range('gravity', '引力强度', .4, 1.8, .05, 1), range('centers', '引力中心', 1, 3, 1, 1, '个'), choice('pointer', '鼠标互动', [['none', '无'], ['repel', '推开'], ['attract', '牵引']], 'none'), depth()],
    advanced: [range('orbit', '初始运动速度', .5, 1.4, .05, 1, '×', '调整后重新播种，查看新的轨道。'), range('trail', '轨迹长度', 0, 24, 1, 10)],
    note: '星尘围绕固定引力中心运动；多个中心会扰动轨道。',
  },
};

export const fieldsFor = id => [...SCENES[id].basic, ...SCENES[id].advanced, ...(SCENES[id].lifecycle || []).flatMap(group => group.fields)];
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
