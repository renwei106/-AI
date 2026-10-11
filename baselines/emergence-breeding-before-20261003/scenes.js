// A scene owns its rules and parameter schema; the shell only renders the schema.
const range = (key, label, min, max, step, value, unit = '', hint = '') => ({ key, label, type: 'range', min, max, step, value, unit, hint });
const choice = (key, label, options, value) => ({ key, label, type: 'choice', options, value });
const speed = () => range('speed', '运行速度', .25, 2, .05, .8, '×');
const depth = () => choice('depth', '空间层次', [['flat', '平面'], ['depth', '轻景深']], 'flat');
const pointer = () => choice('pointer', '鼠标互动', [['none', '无'], ['repel', '驱散'], ['attract', '吸引']], 'repel');
const shape = (value = 'triangle') => choice('shape', '个体形状', [['triangle', '三角'], ['line', '短线'], ['dot', '圆点'], ['fish', '鱼形']], value);

export const SCENES = {
  birds: {
    id: 'birds', name: '鸟群', en: 'FLOCK', subtitle: '聚散之间，自有默契', model: 'flock',
    title: '没有领头者，\n也能一起飞翔。', description: '每一次微小的转向，都让秩序悄然发生。',
    rules: ['太近，就让一让', '与身边的同伴同向', '离远，就靠近一点'],
    basic: [speed(), range('count', '鸟群数量', 60, 900, 20, 420, '只'), range('predators', '捕食者', 0, 4, 1, 0, '只', '靠近时避让，接触时捕获。'), shape(), pointer(), depth()],
    advanced: [range('separation', '保持距离', .5, 2, .05, 1.25), range('alignment', '方向默契', .2, 2, .05, 1.1), range('cohesion', '靠拢倾向', .2, 2, .05, .75), range('perception', '感知范围', 35, 110, 5, 70), choice('replenish', '捕获后补充', [['yes', '自动补充'], ['no', '自然减少']], 'yes')],
    note: '只回应身边的同伴，群体的形状自然形成。',
  },
  fish: {
    id: 'fish', name: '鱼群', en: 'SHOAL', subtitle: '随流而动，相伴而游', model: 'flock',
    title: '顺着水流，\n找到彼此的方向。', description: '水流轻推，同伴相随。让思绪慢慢游远。',
    rules: ['留出游动的距离', '跟随附近的同伴', '顺着水流轻轻转向'],
    basic: [speed(), range('count', '鱼群数量', 40, 600, 20, 260, '尾'), range('current', '水流强度', 0, 1.5, .05, .55), range('predators', '捕食者', 0, 4, 1, 0, '只'), shape('fish'), pointer(), depth()],
    advanced: [range('separation', '保持距离', .5, 2, .05, 1.1), range('alignment', '跟随倾向', .2, 2, .05, 1.5), range('cohesion', '聚群倾向', .2, 2, .05, 1), range('perception', '感知范围', 35, 110, 5, 85), choice('replenish', '捕获后补充', [['yes', '自动补充'], ['no', '自然减少']], 'yes')],
    note: '水流会改变游动方向，鱼群仍保留自己的默契。',
  },
  water: {
    id: 'water', name: '水滴', en: 'DROPLETS', subtitle: '相互靠近，轻盈流动', model: 'fluid',
    title: '轻轻相遇，\n聚成新的形状。', description: '靠近、推挤、流动。简单的作用，也能柔软。',
    rules: ['靠近时相互吸引', '挤在一起就推开', '流动逐渐缓和下来'],
    basic: [speed(), range('count', '微滴数量', 30, 260, 10, 140, '颗'), range('tension', '聚合强度', .2, 1.5, .05, .8), range('viscosity', '黏滞程度', .1, 1.5, .05, .55), pointer()],
    advanced: [range('radius', '微滴大小', 5, 12, .5, 8, 'px'), range('pressure', '排斥强度', .5, 2, .05, 1.2)],
    note: '用吸引、排斥与阻尼，探索水滴般的聚合与流动。',
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

export const fieldsFor = id => [...SCENES[id].basic, ...SCENES[id].advanced];
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
  return safe;
}
