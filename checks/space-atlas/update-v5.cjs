const fs=require('node:fs');
const file='dist/space-atlas.js';let s=fs.readFileSync(file,'utf8');
function replace(a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,80));s=s.replace(a,b)}
replace('data-layout="${state.layout}"','data-layout="${state.layout}" data-presentation="${solar()?\'solar\':\'spatial\'}"');
const start=s.indexOf("${state.mode==='2d'?'<div class=\"at-layout-picker\">");
const end=s.indexOf('</div>\n      <div class="at-canvas"',start);
if(start<0||end<0)throw Error('layout template');
s=s.slice(0,start)+'${layoutPicker()}'+s.slice(end);
replace("const layoutName=id=>({radial:'径向环绕',organization:'层级结构',mindmap:'思维脉络'}[id]);",`const layoutName=id=>({radial:'径向环绕',organization:'层级结构',mindmap:'思维脉络',spatial:'星际漫游',solar:'行星轨道'}[id]);
  function layoutPicker(){
    const current=state.mode==='2d'?state.layout:state.scene3d,ids=state.mode==='2d'?['radial','organization','mindmap']:['spatial','solar'];
    const descriptions={radial:'从中心向四周逐级展开',organization:'从上到下，清楚呈现层级',mindmap:'从左到右，沿着分支浏览',spatial:'在立体空间中，探索收藏的关系',solar:'以当前节点为恒星，沿轨道环绕'};
    return '<div class="at-layout-picker"><button class="at-quiet" data-at="layouts" aria-expanded="false">'+layoutIcon(current)+'<span>'+layoutName(current)+'</span>'+icons.down+'</button><div class="at-layout-menu" hidden>'+ids.map(id=>'<button data-at-layout="'+id+'" aria-pressed="'+(id===current)+'">'+layoutIcon(id)+'<span><b>'+layoutName(id)+'</b><small>'+descriptions[id]+'</small></span></button>').join('')+'</div></div>';
  }`);
replace("function layoutIcon(id){return id==='radial'",`function layoutIcon(id){if(id==='solar')return svg('<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="6" transform="rotate(-25 12 12)"/><circle cx="21" cy="8" r="2"/>');if(id==='spatial')return icons.space;return id==='radial'`);
replace("state.layout=b.dataset.atLayout;savePreferences();resetCamera();renderAtlas();return",`if(state.mode==='3d'){state.scene3d=b.dataset.atLayout;state.motion=solar()&&!reduceMotion.matches}else state.layout=b.dataset.atLayout;savePreferences();resetCamera();renderAtlas();return`);
replace("flow.innerHTML='<circle class=\"at-packet-halo\" r=\"8\"/><circle class=\"at-packet-trail\" r=\"2\"/><circle class=\"at-packet-trail\" r=\"2.7\"/><circle class=\"at-packet-head\" r=\"4\"/>'",`flow.innerHTML='<circle class="at-packet-head" r="1.65"/>'`);
replace("state.focus=key;state.limit=0;", "state.focus=key;state.limit=0;state.overview=false;");
replace("['up','向前排列',icons.up],['down','向后排列',icons.down],",'');
replace("['up','向前排列',icons.up],['down','向后排列',icons.down],",'');
replace('${body}`;', '${body}<button class="at-drawer-done" data-at="close-drawer">完成</button>`;');
replace("if(b.hasAttribute('data-at-focus'))",`if(b.hasAttribute('data-at-create')){const n=get(b.dataset.atCreate);if(n)addChild(n);return}
    if(b.hasAttribute('data-at-overview')){state.overview=!state.overview;renderAtlas();return}
    if(b.hasAttribute('data-at-focus'))`);
replace("if(node&&!node.classList.contains('is-parent'))", "if(node&&['add','bundle'].includes(node.dataset.kind))return;\n    if(node&&!node.classList.contains('is-parent'))");
replace("query('.at-hint').textContent=state.mode==='3d'?'拖动节点 · 空白处旋转 · 滚轮缩放':'拖动节点 · 松手归位 · 滚轮缩放';", "query('.at-hint').textContent=state.mode==='3d'?'拖动排序 · 空白处旋转 · 滚轮缩放':'拖动排序 · 空白处移动 · 滚轮缩放';");
fs.writeFileSync(file,s);
