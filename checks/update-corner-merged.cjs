const fs=require('fs');const p='dist/corner.js';let s=fs.readFileSync(p,'utf8');
const start=s.indexOf(`+'<article class="corner-card corner-add-card"`,s.indexOf('function renderPanel')),end=s.indexOf(`+'</div><button class="corner-deck-arrow next`,start);
if(start<0||end<0)throw Error('markup missing');s=s.slice(0,start)+'+newCardMarkup()'+s.slice(end);
s=s.replace('if(flipped.size)return;const groups=collection().groups,newGroup=','if(flipped.size)return;const groups=collection().groups;if(groups.length>=MEMBER_CARDS)return;if(!isMember()&&groups.length>=FREE_CARDS){showCardLimit();return;}const newGroup=');
const a=s.indexOf('  const previousDock=dock;'),b=s.indexOf('  // Put the new action',a);
s=s.slice(0,a)+`  function refreshDockPreview(){
    const peek=document.querySelector('.corner-dock-preview');if(!peek)return;
    const groups=collection().groups;
    peek.innerHTML='<p>我的常用</p><div class="corner-peek-groups">'+groups.map(g=>'<button type="button" data-corner-peek="'+g.id+'"><i>'+cardIcon(g)+'</i><span>'+esc(g.name)+'</span></button>').join('')+'</div>'+(!groups.length?'<small>点击入口，创建你的第一张卡片</small>':'');
  }
  const previousDock=dock;
  dock=function(){
    previousDock();const dockEl=document.querySelector('#dock .dock');if(!dockEl)return;
    // Keep original space options in place for a reversible entry change.
    const legacy=dockEl.querySelector('.dock-options');if(legacy){legacy.hidden=true;legacy.setAttribute('aria-hidden','true');legacy.inert=true;}
    const entry=dockEl.querySelector('.dock-trigger');if(!entry)return;
    entry.removeAttribute('data-action');entry.classList.add('corner-entry','corner-themed-entry');entry.title='点击打开我的常用';entry.setAttribute('aria-label','打开我的一隅');entry.setAttribute('aria-haspopup','dialog');entry.querySelector('.dock-label').textContent='我的一隅';
    const peek=document.createElement('div');peek.className='corner-dock-preview';dockEl.prepend(peek);dockEl.classList.add('corner-unified');refreshDockPreview();
    const closePeek=()=>{dockEl.classList.remove('corner-peeking','open');entry.setAttribute('aria-expanded','false');};
    dockEl.addEventListener('pointerenter',()=>{if(panel?.open)return;refreshDockPreview();dockEl.classList.add('corner-peeking');entry.setAttribute('aria-expanded','true');});
    dockEl.addEventListener('pointerleave',closePeek);
    dockEl.addEventListener('focusin',()=>{if(!panel?.open){dockEl.classList.add('corner-peeking');entry.setAttribute('aria-expanded','true');}});
    dockEl.addEventListener('focusout',e=>{if(!dockEl.contains(e.relatedTarget))closePeek();});
    entry.onclick=e=>{e.stopPropagation();closePeek();openCorner(entry);};
    peek.onclick=e=>{const b=e.target.closest('[data-corner-peek]');if(b){closePeek();openCorner(entry,b.dataset.cornerPeek);}};
  };
`+s.slice(b);fs.writeFileSync(p,s);
