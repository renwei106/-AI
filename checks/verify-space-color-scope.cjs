const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const STATES=[
  {theme:'flow',mode:'light',color:'#a95e76'},
  {theme:'cosmos',mode:'light',color:'#587cc7'},
  {theme:'flow',mode:'dark',color:'#a95e76'},
  {theme:'cosmos',mode:'dark',color:'#587cc7'}
];
let browser;

function channels(value){
  let match=value.match(/^rgba?\(([^)]+)\)$/i);
  if(match){
    const parts=match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return {rgb:parts.slice(0,3),alpha:parts[3]??1};
  }
  match=value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/i);
  if(match)return {rgb:match.slice(1,4).map(value=>Number(value)*255),alpha:match[4]===undefined?1:Number(match[4])};
  throw new Error(`Unsupported computed color: ${value}`);
}

function assertNeutral(value,label){
  const {rgb}=channels(value),spread=Math.max(...rgb)-Math.min(...rgb);
  assert(spread<=10,`${label} should be neutral black/white/gray, received ${value}`);
}

function luminance(value){
  const {rgb}=channels(value);
  return .299*rgb[0]+.587*rgb[1]+.114*rgb[2];
}

async function sample(page,value){
  return page.evaluate(value=>{
    const node=document.createElement('i');
    node.style.cssText=`position:fixed;pointer-events:none;background:${value}`;
    document.body.append(node);
    const result=getComputedStyle(node).backgroundColor;
    node.remove();
    return result;
  },value);
}

async function colors(locator){
  return locator.evaluate(node=>{
    const style=getComputedStyle(node);
    return {
      background:style.backgroundColor,
      color:style.color,
      border:style.borderColor,
      outline:style.outlineColor
    };
  });
}

async function prepare(page,state){
  await page.evaluate(state=>{
    signed=true;
    prefs.theme=state.theme;
    prefs.mode=state.mode;
    prefs.color=state.color;
    prefs.spaceThemePolicy='default';
    prefs.bookmarksPerPage=10;
    const target=data.find(item=>item.id==='work')||data[0];
    const current=target.scenes[0];
    if(!current.groups.length)current.groups.push({id:crypto.randomUUID(),name:'回归分组',icon:'folder',items:[]});
    const group=current.groups[0];
    while(group.items.length<14){
      const index=group.items.length+1;
      group.items.push([`主题验证 ${index}`,`https://example.com/color-scope/${index}`,'颜色范围回归','']);
    }
    styles[group.id]='shelf';
    bookmarkPages[group.id]=1;
    spaceId=target.id;
    sceneId=current.id;
    activeGroups[current.id]=group.id;
    view='space';
    persist();
    render();
  },state);
  await page.locator('.workspace .cards[data-display="shelf"] .bookmark').first().waitFor();
  await page.locator('#bookmark-pagination').waitFor();
}

async function verifyState(page,state){
  await prepare(page,state);
  const label=`${state.theme}/${state.mode}`;
  const accent=await sample(page,'var(--accent)');
  const soft=await sample(page,'var(--space-accent-soft)');
  const hover=await sample(page,'var(--space-accent-hover)');

  const jump=page.locator('#bookmark-page-jump');
  assert.equal((await colors(jump)).background,soft,`${label}: current page field follows the space theme`);
  await jump.focus();
  const jumpFocus=await colors(jump);
  assert([soft,hover].includes(jumpFocus.background),`${label}: focused current page field keeps a theme surface, received ${jumpFocus.background}`);
  assert.equal(jumpFocus.outline,accent,`${label}: current page focus ring follows the exact accent`);
  await jump.fill('2');
  await jump.press('Enter');
  await page.waitForFunction(()=>document.querySelector('#bookmark-page-jump')?.value==='2');
  assert.equal(await page.locator('.cards[data-display="shelf"]>.bookmark:not(.page-hidden)').count(),4,`${label}: entering page 2 updates the paginated list`);

  await page.locator('[data-link-settings]').click();
  const settings=page.locator('#link-view-settings[open]');
  await settings.waitFor();
  const shelf=settings.locator('[data-link-view="shelf"]');
  assert.equal(await shelf.getAttribute('aria-pressed'),'true',`${label}: shelf style is selected in the fixture`);
  const selectedShelf=(await colors(shelf)).background;
  assert([soft,hover].includes(selectedShelf),`${label}: selected shelf card follows the space theme, received ${selectedShelf}`);
  await shelf.hover();
  assert.equal((await colors(shelf)).background,hover,`${label}: shelf style card hover follows the space theme`);
  await settings.locator('.dialog-heading [data-action="close"]').click();

  assert.equal(await page.locator('.workspace .bookmark :is(.remove,[data-remove]),.workspace .bookmark:is(.remove,[data-remove])').count(),0,`${label}: website cards expose no direct delete control`);
  const bookmark=page.locator('.cards[data-display="shelf"]>.bookmark:not(.page-hidden)').first();
  await bookmark.hover();
  const edit=bookmark.locator(':scope>.bookmark-edit');
  assert.equal(await edit.count(),1,`${label}: website card keeps its edit entry`);
  await edit.hover();
  const editHover=await colors(edit);
  assert.equal(editHover.background,hover,`${label}: shelf edit hover follows the space theme`);
  assert.equal(editHover.color,accent,`${label}: shelf edit icon follows the exact accent`);

  await edit.click();
  const editor=page.locator('#bookmark-editor[open]');
  await editor.waitFor();
  const fields=editor.locator('#bookmark-editor-form input,#bookmark-editor-form textarea');
  assert.equal(await fields.count(),4,`${label}: bookmark editor exposes its four text fields`);
  const fieldColors=await fields.evaluateAll(nodes=>nodes.map(node=>{
    const style=getComputedStyle(node);
    return {background:style.backgroundColor,color:style.color,border:style.borderColor};
  }));
  for(const [index,field] of fieldColors.entries()){
    assertNeutral(field.background,`${label}: field ${index+1} background`);
    assertNeutral(field.color,`${label}: field ${index+1} text`);
    assertNeutral(field.border,`${label}: field ${index+1} border`);
    assert.equal(field.background,fieldColors[0].background,`${label}: all ordinary editor fields share one neutral background`);
    assert.equal(field.color,fieldColors[0].color,`${label}: all ordinary editor fields share one neutral text color`);
  }

  const close=editor.locator('.dialog-heading [data-action="close"]');
  const closeBase=await colors(close);
  assertNeutral(closeBase.background,`${label}: dialog close background`);
  assertNeutral(closeBase.color,`${label}: dialog close icon`);
  await close.hover();
  const closeHover=await colors(close);
  assertNeutral(closeHover.background,`${label}: dialog close hover background`);
  assertNeutral(closeHover.color,`${label}: dialog close hover icon`);
  await close.click();

  return {
    mode:state.mode,
    fieldBackground:fieldColors[0].background,
    fieldColor:fieldColors[0].color,
    fieldBorder:fieldColors[0].border,
    closeBackground:closeBase.background,
    closeColor:closeBase.color,
    closeHoverBackground:closeHover.background,
    closeHoverColor:closeHover.color
  };
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
  await context.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode:'light',homeEntryGesture:'single',spaceThemePolicy:'default'},signed:true})));
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  const snapshots=[];
  for(const state of STATES)snapshots.push({state,...await verifyState(page,state)});

  for(const mode of ['light','dark']){
    const [first,second]=snapshots.filter(snapshot=>snapshot.mode===mode);
    for(const key of ['fieldBackground','fieldColor','fieldBorder','closeBackground','closeColor','closeHoverBackground','closeHoverColor']){
      assert.equal(first[key],second[key],`${mode}: ${key} stays neutral when the theme/accent changes`);
    }
  }
  const light=snapshots.find(snapshot=>snapshot.mode==='light');
  const dark=snapshots.find(snapshot=>snapshot.mode==='dark');
  assert(luminance(light.fieldBackground)>180,`light fields use a light neutral surface, received ${light.fieldBackground}`);
  assert(luminance(dark.fieldBackground)<90,`dark fields use a dark neutral surface, received ${dark.fieldBackground}`);
  assert(luminance(light.fieldColor)<90,`light fields use dark neutral text, received ${light.fieldColor}`);
  assert(luminance(dark.fieldColor)>180,`dark fields use light neutral text, received ${dark.fieldColor}`);
  assert(luminance(light.closeColor)<100,`light dialog close uses a dark neutral icon, received ${light.closeColor}`);
  assert(luminance(dark.closeColor)>170,`dark dialog close uses a light neutral icon, received ${dark.closeColor}`);
  assert.deepEqual(errors,[],'no runtime errors');
  await context.close();
  console.log('PASS: neutral dialog controls stay independent from themes while space pagination, style cards, and bookmark actions follow the selected accent.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
