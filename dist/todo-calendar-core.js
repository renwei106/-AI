/* Local calendar data and date operations. No network or global preference writes. */
export const DAY = 1440;
export const clone = value => JSON.parse(JSON.stringify(value));
export const uid = () => globalThis.crypto?.randomUUID?.() || `todo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const pad = n => String(n).padStart(2, '0');
export function dateKey(value = new Date()) { return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`; }
export function parseDate(value) { const [y,m,d] = String(value).split('-').map(Number); return new Date(y,m-1,d,12); }
export function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && dateKey(parseDate(value)) === value; }
export function addDays(value, count) { const d = parseDate(value); d.setDate(d.getDate()+count); return dateKey(d); }
export function dayNumber(value) { const [y,m,d] = value.split('-').map(Number); return Date.UTC(y,m-1,d)/86400000; }
export function diffDays(a,b) { return dayNumber(a)-dayNumber(b); }
export function weekStart(value) { return addDays(value,-((parseDate(value).getDay()+6)%7)); }
export function shiftDate(value, count, view) {
  if(view !== 'month') return addDays(value,count*(view === 'week' ? 7 : 1));
  const d=parseDate(value),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+count);
  d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return dateKey(d);
}
export function timeText(minute) { return `${pad(Math.floor(((minute%DAY)+DAY)%DAY/60))}:${pad(((minute%60)+60)%60)}`; }
export function timeMinute(value) { const [h,m]=String(value).split(':').map(Number); return h*60+m; }
export function endDate(task) { return task.date ? addDays(task.date,Math.floor(((task.start||0)+(task.duration||30))/DAY)) : ''; }
export function taskEnd(task) { return (task.start||0)+(task.duration||30); }
export function onDate(task,date) {
  if(!task.date)return false;
  if(task.start===null) return date>=task.date&&date<=(task.dateEnd||task.date);
  const start=(diffDays(task.date,date)*DAY)+task.start,end=start+task.duration;
  return end>0&&start<DAY;
}
export function segment(task,date) {
  const start=diffDays(task.date,date)*DAY+task.start,end=start+task.duration;
  return {start:Math.max(0,start),end:Math.min(DAY,end),first:start>=0,last:end<=DAY};
}
export function isOverdue(task,now=new Date()) {
  if(task.done||task.deletedAt||!task.date)return false;
  if(task.start===null)return (task.dateEnd||task.date)<dateKey(now);
  const end=taskEnd(task),d=parseDate(task.date);d.setHours(0,end,0,0);return d.getTime()<now.getTime();
}
export function moveTo(task,date,minute) {
  const next={...task};
  if(!date){next.date='';next.dateEnd='';next.start=null;return next;}
  const span=task.date&&task.dateEnd ? Math.max(0,diffDays(task.dateEnd,task.date)) : 0;
  next.date=date;next.dateEnd=addDays(date,span);
  if(minute!==undefined) {next.start=minute===null?null:Math.max(0,Math.min(1439,minute));next.dateEnd=next.date;}
  return next;
}
export function normalizeTask(input,groupIds=new Set()) {
  if(!input||typeof input!=='object'||typeof input.title!=='string'||!input.title.trim())return null;
  const date=validDate(input.date)?input.date:'';
  const start=date&&input.start!==null&&Number.isFinite(Number(input.start))?Math.max(0,Math.min(1439,Math.floor(Number(input.start)))):null;
  return {...input,id:String(input.id||uid()),title:input.title.trim().slice(0,200),description:String(input.description||'').slice(0,10000),
    groupId:groupIds.has(input.groupId)?input.groupId:'',priority:[0,1,2,3].includes(Number(input.priority))?Number(input.priority):0,
    date,dateEnd:date&&validDate(input.dateEnd)&&input.dateEnd>=date?input.dateEnd:date,start,
    duration:Math.max(1,Math.min(525600,Number(input.duration)||30)),done:Boolean(input.done||input.completed||input.status==='done'),
    completedAt:Number(input.completedAt)||null,deletedAt:Number(input.deletedAt)||null,demo:Boolean(input.demo),updatedAt:Number(input.updatedAt)||Date.now()};
}
export function exampleTasks(today,groups) {
  const make=(title,description,group,extra={})=>normalizeTask({id:uid(),title,description,groupId:groups[group]?.id||'',demo:true,start:null,duration:30,...extra},new Set(groups.map(g=>g.id)));
  return [make('自己收集','这里是收集箱。想到要做的事，先记在这里；之后拖到日历安排时间，或在详情里选一个分组。',-1),
    make('高优先级事项','优先级会用颜色标记。试试在详情中调整优先级，或在四象限视图里查看。',0,{date:today,start:540,priority:3,duration:60}),
    make('低优先级事项','这件事优先级较低，可以稍后处理。你也可以拖动它调整日期或安排时间。',1,{date:today,start:null,priority:1}),
    make('试试调整事项时长','把鼠标移到上下边缘，出现上下箭头后拖动，就能调整时长。',0,{date:today,start:660,priority:2,duration:45}),
    make('安排一段阅读时间','拖到时间轴即可安排具体时段；拖动事项主体可以改期。',2,{date:addDays(today,1),start:900,priority:2,duration:30})];
}
export function initialState(library,today=dateKey()) {
  if(library.calendarV2?.version===2)return clone(library.calendarV2);
  const fresh=library.tasks===undefined&&library.inbox===undefined;
  const groups=(library.groups||[]).filter(g=>!g.system&&!['今天','进行中','已完成'].includes(g.name)).map(g=>({id:g.id,name:g.name}));
  if(!groups.length)for(const name of ['工作','生活','学习'])groups.push({id:uid(),name});
  const groupIds=new Set(groups.map(g=>g.id)),seen=new Set();
  const tasks=[...(library.tasks||[]),...(library.inbox||[]).map(t=>({...t,date:'',start:null}))].map(t=>normalizeTask(t,groupIds)).filter(Boolean).filter(t=>{if(seen.has(t.id))return false;seen.add(t.id);return true;});
  return {version:2,revision:0,groups,tasks:fresh?exampleTasks(today,groups):tasks,view:['day','week','month','board','groups','priority'].includes(library.view)?library.view:'week',date:today,sidebarOpen:false,guideDismissed:!fresh,initialized:true};
}
export function validateState(value) {
  if(!value||value.version!==2||!Array.isArray(value.tasks)||!Array.isArray(value.groups)||value.tasks.length>20000)throw Error('不是有效的待办备份文件');
  const groups=value.groups.filter(g=>g&&typeof g.name==='string').map(g=>({id:String(g.id||uid()),name:g.name.trim().slice(0,40)||'未命名分组'}));
  const ids=new Set(groups.map(g=>g.id));if(ids.size!==groups.length)throw Error('备份中存在重复分组');
  const tasks=value.tasks.map(t=>normalizeTask(t,ids));if(tasks.some(t=>!t)||new Set(tasks.map(t=>t.id)).size!==tasks.length)throw Error('备份中的事项格式有误');
  return {...value,groups,tasks};
}
/* Interval coloring: overlapping events are given stable parallel columns. */
export function layoutSegments(tasks,date) {
  const items=tasks.map(task=>({task,...segment(task,date)})).sort((a,b)=>a.start-b.start||b.end-a.end);
  let cluster=[],until=-1;const output=[];
  function flush(){const ends=[];for(const item of cluster){let col=ends.findIndex(end=>end<=item.start);if(col<0)col=ends.length;ends[col]=item.end;item.col=col;}for(const item of cluster)output.push({...item,cols:ends.length});cluster=[];}
  for(const item of items){if(item.start>=until){flush();until=-1;}cluster.push(item);until=Math.max(until,item.end);}flush();return output;
}
