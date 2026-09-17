from pathlib import Path
p=Path('dist/corner.js')
s=p.read_text(encoding='utf-8')
def replace(a,b):
 global s
 assert a in s, a[:120]
 s=s.replace(a,b)
replace('const FREE_CARDS=3, MEMBER_CARDS=12;', "const FREE_CARDS=3, MEMBER_CARDS=12;\n  const isInbox=g=>g?.system==='inbox';\n  const customCount=()=>collection().groups.filter(g=>!isInbox(g)).length;")
replace('const count=collection().groups.length,full=', 'const count=customCount(),full=')
replace('免费用户可拥有 3 张卡片，会员最多可拥有 12 张。', '暂存不占额度；免费用户可自建 3 张卡片，会员最多可自建 12 张。')
replace('    return library;','''    if(!library.groups.some(isInbox)){
      library.groups.unshift({id:uid(),system:'inbox',name:'暂存',iconMode:'manual',icon:'lib-Inbox',refs:[]});persist();
    }
    return library;''')
replace("['theme','.mode-pull-cord']", "['mode','.mode-pull-cord']")
replace("if(kind==='theme')cycleCornerTheme();else", "if(kind==='mode'){prefs.mode={light:'dark',dark:'system',system:'light'}[prefs.mode||'system'];for(const o of Object.values(overrides))if(o&&o.mode)o.mode=prefs.mode;persist();apply();for(const el of panel.querySelectorAll('[data-corner-card]'))applyCardColor(el,collection().groups.find(g=>g.id===el.dataset.cornerCard));syncCornerCords();cornerNotice('已切换为'+({light:'日间模式',dark:'夜间模式',system:'跟随系统'}[prefs.mode]));}else")
replace("kind==='theme'?'点击或下拉，切换主题'", "kind==='mode'?'点击或下拉，切换日夜模式'")
replace("return '<article class=\"corner-card '+(flipped.has(g.id)?", "return '<article class=\"corner-card '+(isInbox(g)?'corner-inbox ':'')+(flipped.has(g.id)?")
replace("data-corner-drag-group=\"'+g.id+'\" title=\"点击翻面 · 长按拖动排序\"", "'+(isInbox(g)?'title=\"暂存 · 点击翻面编辑\"':'data-corner-drag-group=\"'+g.id+'\" title=\"点击翻面 · 长按拖动排序\"')+'")
replace("'+String(index+1).padStart(2,'0')+'", "'+(isInbox(g)?'默认':String(index).padStart(2,'0'))+'")
replace("<p>把常去的地方，收进来</p><small>在原网址的编辑窗口中<br>选择「收进我的一隅」</small>", "<p>'+(isInbox(g)?'还没想好放哪里，先留在这里':'把常去的地方，收进来')+'</p><small>'+(isInbox(g)?'之后可拖动网址到其他卡牌':'在原网址的编辑窗口中<br>选择「收进我的一隅」')+'</small>")
replace("<button data-corner-delete=\"'+g.id+'\">删除卡片</button>", "'+(isInbox(g)?'<span>默认卡片 · 不可删除</span>':'<button data-corner-delete=\"'+g.id+'\">删除卡片</button>')+'")
replace("if(groups.length>=MEMBER_CARDS)return;if(!isMember()&&groups.length>=FREE_CARDS)", "if(customCount()>=MEMBER_CARDS)return;if(!isMember()&&customCount()>=FREE_CARDS)")
replace('iconSlot:groups.length%20', 'iconSlot:customCount()%20')
replace("if(b?.dataset.cornerDelete){", "if(b?.dataset.cornerDelete){if(isInbox(g))return;")
replace("if(b?.dataset.cornerConfirmDelete){", "if(b?.dataset.cornerConfirmDelete){if(isInbox(g))return;")
replace("while(to>0&&center<", "while(to>1&&center<")
replace("el.querySelector('.corner-card-number').textContent=String(i+1).padStart(2,'0');", "el.querySelector('.corner-card-number').textContent=isInbox(g)?'默认':String(i).padStart(2,'0');")
replace("const groups=collection().groups;\n    peek.innerHTML", "const groups=collection().groups.filter(g=>!isInbox(g));\n    peek.innerHTML")
replace("if(changed){clearTimeout(flipTimers.get(el));el.classList.remove('is-settled');void el.offsetWidth;el.classList.toggle('is-flipped',next);if(reduced())el.classList.add('is-settled');else flipTimers.set(el,setTimeout(()=>el.classList.add('is-settled'),850));}", """if(changed){
        clearTimeout(flipTimers.get(el));
        const turn=el.querySelector('.corner-card-turn');
        // Settled faces are flattened for crisp text; restore their starting angle before animating.
        const start=el.classList.contains('is-settled')?(el.classList.contains('is-flipped')?'rotateY(180deg)':'rotateY(0deg)'):getComputedStyle(turn).transform;
        turn.style.transition='none';turn.style.transform=start;el.classList.remove('is-settled');void turn.offsetWidth;
        turn.style.removeProperty('transition');el.classList.toggle('is-flipped',next);turn.style.transform=next?'rotateY(180deg)':'rotateY(0deg)';
        const settle=()=>{el.classList.add('is-settled');turn.style.removeProperty('transform');};
        if(reduced())settle();else flipTimers.set(el,setTimeout(settle,850));
      }""")
start=s.index('  function openPicker(gid, selectedSource) {')
end=s.index('  function enablePastedLinks(gid)',start)
s=s[:start]+'''  function openPicker(gid, selectedSource) {
    picker??=dialog('corner-picker','选择常用网址');const entries=sources(),groups=collection().groups;
    const expired=signed&&!isMember()&&Math.max(Number(prefs.membership?.expiresAt)||0,Number(prefs.membershipDemo?.expiresAt)||0)>0;
    const destination=expired?groups.find(isInbox)?.id:(gid||groups.find(isInbox)?.id);
    const branches=data.flatMap(s=>s.scenes.flatMap(c=>c.groups.map(g=>({sid:s.id,cid:c.id,gid:g.id,name:g.name,path:s.name+' / '+c.name+' / '+g.name}))));
    let current=branches.find(g=>g.gid===selectedSource?.gid)||branches[0];
    picker.innerHTML=heading('添加网址')+`<label>收进哪张卡片<select id="corner-destination">${groups.map(g=>`<option value="${g.id}" ${g.id===destination?'selected':''}>${esc(g.name)}</option>`).join('')}</select></label><label>搜索收藏<input id="corner-search" type="search" placeholder="搜索空间、场景、分组、名称或网址"></label><div class="corner-library-browser"><nav class="corner-library-nav" aria-label="空间、场景和分组"></nav><section class="corner-library-content"><div class="corner-library-toolbar"></div><div class="corner-source-list"></div></section></div><p class="corner-picker-note" role="status"></p><button class="primary" id="corner-save">添加到卡片</button>`;
    const chosen=new Set(selectedSource?[entries.findIndex(x=>x.gid===selectedSource.gid&&x.url===selectedSource.url)]:[]);chosen.delete(-1);
    const nav=picker.querySelector('.corner-library-nav');
    nav.innerHTML=data.map(s=>`<details ${s.id===current?.sid?'open':''}><summary>${esc(s.name)}</summary>${s.scenes.map(c=>`<details ${c.id===current?.cid?'open':''}><summary>${esc(c.name)}</summary>${c.groups.map(g=>`<button type="button" data-library-group="${g.id}" aria-current="${g.id===current?.gid}"><span>${esc(g.name)}</span><small>${g.items.length}</small></button>`).join('')}</details>`).join('')}</details>`).join('')||'<p>还没有空间</p>';
    function listing(){
      const q=picker.querySelector('#corner-search').value.trim().toLowerCase(),rows=entries.map((x,i)=>({x,i})).filter(({x})=>q?(x.item[0]+' '+x.url+' '+x.path).toLowerCase().includes(q):x.gid===current?.gid);
      const all=rows.length>0&&rows.every(({i})=>chosen.has(i));
      picker.querySelector('.corner-library-toolbar').innerHTML='<span>'+esc(q?'搜索结果 · '+rows.length+' 个网址':current?.path||'选择分组')+'</span>'+(!q&&current?'<button type="button" data-library-select-group '+(!rows.length?'disabled':'')+'>'+(all?'取消本组选中':'全选本组网址')+'</button>':'');
      picker.querySelector('[data-library-select-group]')?.addEventListener('click',()=>{for(const {i} of rows)all?chosen.delete(i):chosen.add(i);listing();});
      picker.querySelector('.corner-source-list').innerHTML=rows.map(({x,i})=>`<label class="corner-source"><input type="checkbox" value="${i}" ${chosen.has(i)?'checked':''}><i>${bookmarkMark(x.item)}</i><span>${esc(x.item[0])}<small>${esc(q?x.path:x.url)}</small></span></label>`).join('')||`<p>${q?'没有匹配的网址，换个词试试':'这个分组还没有网址'}</p>`;
      picker.querySelector('.corner-picker-note').textContent='已选择 '+chosen.size+' 个网址';
    }
    nav.onclick=e=>{const b=e.target.closest('[data-library-group]');if(!b)return;current=branches.find(g=>g.gid===b.dataset.libraryGroup);picker.querySelector('#corner-search').value='';for(const el of nav.querySelectorAll('[data-library-group]'))el.setAttribute('aria-current',String(el===b));listing();};
    listing();picker.querySelector('#corner-search').oninput=listing;
    picker.querySelector('.corner-source-list').onchange=e=>{if(!e.target.matches('input[type=checkbox]'))return;const i=Number(e.target.value);e.target.checked?chosen.add(i):chosen.delete(i);listing();};
    picker.querySelector('#corner-save').onclick=()=>{
      if(!chosen.size){picker.querySelector('.corner-picker-note').textContent='先选一个常用的网址吧';return;}
      const target=groups.find(g=>g.id===picker.querySelector('select').value)||groups.find(isInbox);
      for(const i of chosen){const x=entries[i];if(!x)continue;let existing;
        for(const g of groups){const ref=g.refs.find(r=>r.gid===x.gid&&r.url===x.url);if(ref){existing=ref;g.refs=g.refs.filter(r=>r!==ref);break;}}
        target.refs.push(existing||{id:uid(),sid:x.sid,cid:x.cid,gid:x.gid,url:x.url});
      }
      persist();picker.close();if(panel?.open)refreshLinks(groups.map(g=>g.id));toast('已收进我的一隅');
    };
    if(gid)enablePastedLinks(gid);
    if(!picker.open)picker.showModal();
  }
''' +s[end:]
replace("    picker.querySelector('.dialog-heading p').textContent='选择已有收藏，或粘贴一个、多个网址';\n", "    picker.querySelector('.dialog-heading p')?.remove();\n")
replace("picker.querySelector('.corner-source-list').hidden=mode!=='saved'", "picker.querySelector('.corner-library-browser').hidden=mode!=='saved'")
p.write_text(s,encoding='utf-8')
