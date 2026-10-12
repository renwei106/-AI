/* Demo 4 port of Ibaliqbal/codrops-motion-path-transition (MIT).
 * Source: github.com/Ibaliqbal/codrops-motion-path-transition, script4 (MIT).
 * Host adaptations are the logo origin, trailing-card-first opening,
 * preload, reverse visibility and scroll viewport. Theme delegation remains.
 */
(() => {
  gsap.registerPlugin(MotionPathPlugin);
  const coverFor=id=>brandModePreview(id)||BRAND_THEME_COVERS[id]||(id==='starlink'?'/assets/starlink/cover.svg':null);
  let dispose,active;
  window.consumeBrandThemeWheel=event=>active?.consumeWheel(event)===true;
  window.installBrandMotion = source => {
    const wrapper=source.parentElement,brand=wrapper.querySelector('.brand');
    const entries=[...source.querySelectorAll('[data-brand-theme]')].map(el=>({id:el.dataset.brandTheme,name:el.querySelector('b')?.textContent||el.textContent,selected:el.getAttribute('aria-pressed')}));
    source.replaceChildren();source.style.setProperty('display','none','important');
    if(active?.wrapper===wrapper&&active.stage.isConnected){active.sync(source,entries);return;}
    dispose?.();
    const trigger=brand;
    wrapper.classList.add('brand-demo4-host');brand.classList.add('brand-demo4-entry');
    brand.removeAttribute('title');brand.dataset.action='brand-name';brand.setAttribute('aria-label','拾隅，展开或收起主题卡片');brand.setAttribute('aria-expanded','false');
    const stage=document.createElement('div');stage.className='brand-demo4-stage';stage.setAttribute('aria-hidden','true');
    const scroll=document.createElement('div');scroll.className='brand-demo4-scroll';scroll.setAttribute('aria-label','主题卡片');
    const canvas=document.createElement('div');canvas.className='brand-demo4-canvas';scroll.append(canvas);stage.append(scroll);document.body.append(stage);
    function addCard(entry){
      const button=document.createElement('button');button.type='button';button.className='brand-demo4-card';button.dataset.brandTheme=entry.id;button.setAttribute('aria-pressed',entry.selected||'false');button.tabIndex=-1;
      const img=new Image();img.src=coverFor(entry.id);img.alt='';img.loading='eager';img.decoding='async';
      const label=document.createElement('b');label.textContent=entry.name;button.append(img,label);canvas.append(button);
      gsap.set(button,{scale:0});
      return button;
    }
    entries.forEach(addCard);
    const navigation=document.createElement('div');navigation.className='brand-demo4-navigation';navigation.innerHTML='<button type="button" data-theme-step="-1" aria-label="上一个主题"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m7 14 5-5 5 5"/></svg></button><button type="button" data-theme-step="1" aria-label="下一个主题"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m7 10 5 5 5-5"/></svg></button>';stage.append(navigation);
    let stepping=false;
    const abort=new AbortController(),options={signal:abort.signal};
    let tl,closing,opened=false,dead=false,requestVersion=0;
    const cards=()=>[...canvas.querySelectorAll('[data-brand-theme]')];
    function revealSelected(){
      if(!opened||!stage.classList.contains('is-settled'))return;
      const selected=cards().find(card=>card.getAttribute('aria-pressed')==='true');if(!selected)return;
      const item=selected.getBoundingClientRect(),viewport=scroll.getBoundingClientRect(),padding=8;
      const delta=item.top<viewport.top+padding?item.top-viewport.top-padding:item.bottom>viewport.bottom-padding?item.bottom-viewport.bottom+padding:0;
      if(delta)scroll.scrollBy({top:delta,behavior:reduced?'instant':'smooth'});
    }
    const ready=Promise.all([...canvas.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function build(){
      tl?.kill();closing?.kill();stage.classList.remove('is-settled');scroll.scrollTop=0;
      const items=cards();if(!items.length)return;
      // Keep the existing list geometry; cards emerge from the logo one by one.
      const top=brand.getBoundingClientRect().bottom+12;
      navigation.style.top=top+'px';scroll.style.top=(top+38)+'px';canvas.style.height='100%';
      const width=Math.min(216,innerWidth-48),height=width*9/16;
      stage.style.setProperty('--demo4-width',width+'px');stage.style.setProperty('--demo4-height',height+'px');
      const scale=innerWidth<768?.6:1,gap=10;
      const brandRect=brand.getBoundingClientRect(),stackOffset=Math.max(12,brandRect.left+brandRect.width/2-width*scale/2);
      navigation.style.left=stackOffset+'px';navigation.style.width=width*scale+'px';
      const icon=trigger.getBoundingClientRect(),originY=icon.top+icon.height/2-scroll.getBoundingClientRect().top-height/2;
      // Clear before setting the hidden origin; clearing in the same set erases scale:0.
      gsap.set(items,{clearProps:'transform,clipPath'});
      gsap.set(items,{x:icon.left+icon.width/2-width/2,y:originY,scale:0,zIndex:i=>items.length-i});
      const targetX=stackOffset,targetY=stackOffset;
      const scaleSetters=items.map(item=>{
        const setX=gsap.quickSetter(item,'scaleX'),setY=gsap.quickSetter(item,'scaleY');
        return value=>{setX(value);setY(value);};
      });
      tl=gsap.timeline({paused:true,defaults:{duration:reduced?0:.72,ease:'power1.inOut'},
        // Reach full size at the first row, then keep it while travelling farther down.
        onUpdate:()=>items.forEach((item,index)=>scaleSetters[index](scale*Math.max(0,Math.min(1,(Number(gsap.getProperty(item,'y'))-originY)/(targetY-originY))))),
        onComplete:()=>{
        if(!opened)return;scaleSetters.forEach(set=>set(scale));canvas.style.height=(targetY+items.length*(height*scale+gap)+24)+'px';stage.classList.add('is-settled');items.forEach(el=>el.tabIndex=0);revealSelected();window.dispatchEvent(new Event('shiyu-theme-cards-settled'));
      }});
      tl.to(items,{
        motionPath:index=>({path:[{x:targetX,y:targetY+index*(height*scale+gap)}]}),
        stagger:{from:'end',each:reduced?0:.075}
      });
    }
    async function toggle(){
      const request=++requestVersion;
      opened=!opened;trigger.setAttribute('aria-expanded',String(opened));
      await ready;if(dead||request!==requestVersion)return;
      if(opened){if(!tl||closing||tl.progress()===0)build();stage.classList.add('is-open');stage.setAttribute('aria-hidden','false');tl?.restart();}
      else closeVisual();
    }
    function closeVisual(){
      tl?.pause();closing?.kill();
      const items=cards(),offset=scroll.scrollTop,icon=trigger.getBoundingClientRect();
      const clipped=stage.classList.contains('is-settled'),viewportTop=scroll.getBoundingClientRect().top;
      const clips=items.map(item=>{
        const rect=item.getBoundingClientRect();
        const clip=clipped&&rect.height?Math.max(0,Math.min(1,(viewportTop-rect.top)/rect.height)):0;
        if(clip)item.style.clipPath=`inset(${clip*100}% 0 0)`;
        return clip;
      });
      stage.classList.remove('is-settled');canvas.style.height='100%';scroll.scrollTop=0;
      items.forEach(el=>{el.tabIndex=-1;gsap.set(el,{y:Number(gsap.getProperty(el,'y'))-offset});});
      const width=parseFloat(stage.style.getPropertyValue('--demo4-width'))||216,height=parseFloat(stage.style.getPropertyValue('--demo4-height'))||121.5;
      const x=icon.left+icon.width/2-width/2,y=icon.top+icon.height/2-scroll.getBoundingClientRect().top-height/2;
      const firstY=Math.max(12,icon.left+icon.width/2-width*(innerWidth<768?.6:1)/2);
      const returning=items.map((item,index)=>{
        const startY=Number(gsap.getProperty(item,'y')),scale=Number(gsap.getProperty(item,'scaleX'));
        const span=Math.min(firstY,startY)-y;
        const setX=gsap.quickSetter(item,'scaleX'),setY=gsap.quickSetter(item,'scaleY');
        if(span<=0||scale===0||clips[index]===1){setX(0);setY(0);return null;}
        return {item,scale,span,startY,clip:clips[index],setScale:value=>{setX(value);setY(value);}};
      }).filter(Boolean);
      const finish=()=>{returning.forEach(card=>card.setScale(0));items.forEach(item=>item.style.clipPath='');if(!opened){stage.classList.remove('is-open');stage.setAttribute('aria-hidden','true');}};
      if(!returning.length){finish();return;}
      closing=gsap.timeline({
        // Retrace the opening path; shrink only after passing the first row.
        onUpdate:()=>returning.forEach(card=>{
          const currentY=Number(gsap.getProperty(card.item,'y'));
          card.setScale(card.scale*Math.max(0,Math.min(1,(currentY-y)/card.span)));
          if(card.clip)card.item.style.clipPath=`inset(${card.clip*100*Math.max(0,Math.min(1,(currentY-y)/(card.startY-y)))}% 0 0)`;
        }),
        onComplete:finish
      });
      closing.to(returning.map(card=>card.item),{duration:reduced?0:.72,ease:'power1.inOut',motionPath:{path:[{x,y}]},stagger:{from:'start',each:reduced?0:.075}});
    }
    function close(){if(!opened)return;requestVersion++;opened=false;trigger.setAttribute('aria-expanded','false');closeVisual();}
    // Handle the entire button (including its invisible hit padding) before legacy Logo actions.
    document.addEventListener('click',event=>{if(brand.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();toggle();}},{...options,capture:true});
    function outsidePointer(event,clientX=event.clientX,clientY=event.clientY){
      // Keep the guide's button visible from pointer down through its click.
      if(event.target.closest?.('.sy-tour'))return;
      if(!opened||navigation.contains(event.target)||trigger.contains(event.target)||canvas.contains(event.target)&&event.target.closest('[data-brand-theme]'))return;
      const rect=scroll.getBoundingClientRect();
      if(stage.classList.contains('is-settled')&&clientX<=rect.right+24&&clientY>=rect.top-24)return;
      close();
    }
    document.addEventListener('pointerdown',outsidePointer,options);
    const frameDocuments=new WeakSet();
    function bindFrame(frame){
      try{const doc=frame.contentDocument;if(!doc||frameDocuments.has(doc))return;frameDocuments.add(doc);
        doc.addEventListener('pointerdown',event=>{const rect=frame.getBoundingClientRect();outsidePointer(event,rect.left+event.clientX,rect.top+event.clientY);},options);
      }catch{} // Cross-origin frames keep their own interaction boundary.
    }
    document.querySelectorAll('iframe').forEach(bindFrame);
    document.addEventListener('load',event=>{if(event.target.tagName==='IFRAME')bindFrame(event.target);},{...options,capture:true});
    document.addEventListener('keydown',event=>{if(event.key==='Escape')close();},options);
    navigation.addEventListener('click',event=>{
      const button=event.target.closest('[data-theme-step]');if(!button||!opened)return;
      const items=cards().filter(card=>!card.hidden&&getComputedStyle(card).display!=='none');if(!items.length)return;
      const current=items.findIndex(card=>card.getAttribute('aria-pressed')==='true'),direction=Number(button.dataset.themeStep);
      const next=items[(current+direction+items.length)%items.length];
      stepping=true;try{next.click();}finally{stepping=false;}
    },options);
    const coverObserver=new MutationObserver(()=>{
      cards().forEach(button=>{const img=button.querySelector('img'),next=coverFor(button.dataset.brandTheme);if(img&&next&&img.getAttribute('src')!==next){img.src=next;img.decode().catch(()=>{});}});
    });
    coverObserver.observe(document.body,{attributes:true,attributeFilter:['data-dark']});
    canvas.addEventListener('click',event=>{if(!stepping&&event.target.closest('[data-brand-theme]'))close();},options);
    window.addEventListener('resize',()=>{if(!tl)return;if(!opened){closing?.progress(1);return;}const progress=tl.progress();build();tl.progress(progress).play();},options);
    const observer=new MutationObserver(()=>{if(!source.isConnected)cleanup();});observer.observe(wrapper,{childList:true});
    let guideWasOpen=null;
    stage.addEventListener('shiyu-theme-guide',event=>{if(event.detail){if(guideWasOpen===null)guideWasOpen=opened;if(!opened)void toggle();}else if(guideWasOpen!==null){const restore=guideWasOpen;guideWasOpen=null;if(!restore)close();}},options);
    active={wrapper,stage,consumeWheel(event){
      if(!opened||event.ctrlKey)return false;
      const rect=scroll.getBoundingClientRect(),top=navigation.getBoundingClientRect().top;
      if(event.clientX<0||event.clientX>rect.right+24||event.clientY<top-12||event.clientY>innerHeight)return false;
      event.preventDefault();event.stopImmediatePropagation();
      scroll.scrollTop+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?scroll.clientHeight:1);
      return true;
    },sync(nextSource,nextEntries){
      // A render replaces the data source, not the mounted animation or pending click.
      source=nextSource;
      brand.removeAttribute('title');brand.dataset.action='brand-name';brand.setAttribute('aria-label','拾隅，展开或收起主题卡片');
      const existing=new Map(cards().map(el=>[el.dataset.brandTheme,el]));
      nextEntries.forEach(entry=>{
        const button=existing.get(entry.id)||addCard(entry);
        let img=button.querySelector('img');
        if(!img){img=new Image();img.src=coverFor(entry.id);img.alt='';img.loading='eager';img.decoding='async';img.decode().catch(()=>{});}
        const label=button.querySelector('b')||document.createElement('b');label.textContent=entry.name;
        button.replaceChildren(img,label);button.setAttribute('aria-pressed',entry.selected||'false');
      });
      requestAnimationFrame(revealSelected);
    }};
    function cleanup(){dead=true;requestVersion++;abort.abort();tl?.kill();closing?.kill();observer.disconnect();coverObserver.disconnect();stage.remove();brand.classList.remove('brand-demo4-entry');wrapper.classList.remove('brand-demo4-host');if(active?.stage===stage)active=null;}
    dispose=cleanup;
    ready.then(()=>{if(!dead&&!tl)build();});
  };
})();
