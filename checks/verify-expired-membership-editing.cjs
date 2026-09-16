const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const results=[];
const errors=[];
let browser;

async function expectNoGate(page,message){
  assert.equal(await page.locator('#member-gate[open]').count(),0,message);
}

async function expectCreateGate(page,kind){
  await page.evaluate(kind=>editOrganization(kind),kind);
  await page.locator('#member-gate[open]').waitFor();
  assert.match(await page.locator('#member-gate').innerText(),/当前功能需要会员/);
  await page.locator('#member-gate [data-member-close]').click();
}

async function dragFirstPastThird(page,kind){
  await page.evaluate(kind=>manageOrganization(kind),kind);
  const rows=page.locator('#organization .organization-list>[data-organization-id]');
  const before=await rows.evaluateAll(items=>items.map(item=>item.dataset.organizationId));
  const from=await rows.nth(0).locator('span').boundingBox();
  const to=await rows.nth(2).locator('span').boundingBox();
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);
  await page.mouse.down();
  await page.waitForTimeout(430);
  await page.mouse.move(to.x+to.width/2,to.y+to.height*.9,{steps:8});
  await page.mouse.up();
  await page.waitForTimeout(140);
  const after=await rows.evaluateAll(items=>items.map(item=>item.dataset.organizationId));
  assert.notDeepEqual(after,before,`expired membership must still allow historical ${kind} sorting`);
  await expectNoGate(page,`sorting historical ${kind} items must not open membership`);
  await page.locator('#organization .dialog-heading [data-action=close]').click();
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1288,height:1041}});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
  await page.evaluate(()=>{
    const makeGroup=(sid,ci,gi)=>({
      id:`${sid}-scene-${ci}-group-${gi}`,
      name:`历史分组 ${gi}`,
      icon:'folder',
      items:Array.from({length:31},(_,i)=>[`历史网址 ${i+1}`,`https://example.com/${sid}/${ci}/${gi}/${i}`,'历史收藏','E'])
    });
    const makeSpace=si=>({
      id:`expired-space-${si}`,
      name:`历史空间 ${si}`,
      icon:'globe',
      scenes:Array.from({length:4},(_,ci)=>({
        id:`expired-space-${si}-scene-${ci+1}`,
        name:`历史场景 ${ci+1}`,
        description:'会员到期前创建',
        icon:'work',
        groups:Array.from({length:4},(_,gi)=>makeGroup(`expired-space-${si}`,ci+1,gi+1))
      }))
    });
    data=[makeSpace(1),makeSpace(2),makeSpace(3),makeSpace(4)];
    signed=true;
    prefs.membership={expiresAt:Date.now()-86400000};
    prefs.firstSpaceCapacityV1=true;
    prefs.firstSpaceRealSitesV1=true;
    prefs.inspirationMockV1=true;
    prefs.twelveSpacePreviewAdded=true;
    spaceId=data[1].id;
    sceneId=data[1].scenes[3].id;
    activeGroups[sceneId]=data[1].scenes[3].groups[3].id;
    view='space';
    persist();
    render();
  });
  await page.waitForTimeout(180);

  assert.equal(await page.evaluate(()=>isMember()),false);
  assert.equal(await page.evaluate(()=>memberReadOnly()),false);

  const oldGroupId=await page.evaluate(()=>currentGroup().id);
  await page.evaluate(id=>editOrganization('group',id),oldGroupId);
  await page.locator('#organization-name').fill('到期后仍可编辑');
  await page.locator('#organization-form [type=submit]').click();
  assert.equal(await page.evaluate(()=>currentGroup().name),'到期后仍可编辑');
  await expectNoGate(page,'renaming historical groups must not open membership');

  const firstBookmark=page.locator('.workspace .bookmark-edit').first();
  await firstBookmark.click();
  await page.locator('#bookmark-editor [name=name]').fill('到期后仍可修改网址');
  await page.locator('#bookmark-editor-form [type=submit]').click();
  assert.equal(await page.evaluate(()=>currentGroup().items[0][0]),'到期后仍可修改网址');
  await expectNoGate(page,'editing historical bookmarks must not open membership');

  await dragFirstPastThird(page,'group');
  await dragFirstPastThird(page,'scene');
  await dragFirstPastThird(page,'space');
  results.push('历史空间、场景、分组和网址仍可编辑与排序，不触发会员弹窗');

  const beforeCount=await page.evaluate(()=>currentGroup().items.length);
  const addButton=page.locator('.workspace [data-action="add"]').first();
  assert.equal(await addButton.locator('.membership-badge').count(),0,'bookmark entry must not show a member badge');
  await addButton.click();
  await page.locator('#add[open]').waitFor();
  await expectNoGate(page,'bookmark creation must never open membership');
  await page.locator('#add-form [name=title]').fill('不限量收藏验证');
  await page.locator('#add-form [name=url]').fill('https://example.org/unlimited-bookmark');
  await page.locator('#add-form [type=submit]').click();
  assert.equal(await page.evaluate(()=>currentGroup().items.length),beforeCount+1);
  results.push('网址收藏入口无会员标识，超过旧额度后仍可继续保存');

  await page.locator('.workspace .space-mode-entry').hover();
  await page.locator('[data-space-mode=atlas]').click();
  await page.waitForTimeout(420);
  const groupNode=page.locator('.at-node[data-kind=group] .at-node-main').first();
  await groupNode.click();
  await page.waitForTimeout(420);
  const linkNode=page.locator('.at-node[data-kind=link]').first();
  await linkNode.hover({force:true});
  await linkNode.locator('[data-at-details]').click();
  await page.locator('[data-at-manage=edit]').click();
  await page.locator('#bookmark-editor[open]').waitFor();
  await expectNoGate(page,'atlas bookmark editing must not open membership');
  await page.locator('#bookmark-editor .dialog-heading [data-action=close]').click();
  await linkNode.hover({force:true});
  await linkNode.locator('[data-at-details]').click();
  await page.locator('[data-at-manage=move]').click();
  await page.locator('[data-at-destination]').first().click();
  await page.waitForTimeout(420);
  await expectNoGate(page,'moving an existing bookmark to an over-quota historical group must not open membership');
  assert.match(await page.locator('.at-notice').innerText(),/已移动到/);
  results.push('图谱里的历史网址也可编辑和跨分组移动，不受旧额度误拦截');

  await expectCreateGate(page,'group');
  await expectCreateGate(page,'scene');
  await expectCreateGate(page,'space');
  results.push('新增空间、场景和分组仍按免费版额度触发会员说明');

  const memberPage=await context.newPage();
  memberPage.on('pageerror',error=>errors.push(error.message));
  await memberPage.goto('http://127.0.0.1:4318/?page=membership',{waitUntil:'networkidle'});
  await memberPage.locator('#member-center[open]').waitFor();
  const memberText=await memberPage.locator('#member-center').innerText();
  assert.match(memberText,/已有空间、场景、分组和收藏仍可编辑、排序与移动/);
  assert.match(memberText,/网址可继续收藏/);
  assert.doesNotMatch(memberText,/每分组网址|更多收藏|超额部分只读|300 条/);
  await memberPage.locator('#member-center').evaluate(element=>{element.scrollTop=element.scrollHeight});
  await memberPage.waitForTimeout(120);
  await memberPage.screenshot({path:'checks/v6/expired-member-policy.png'});
  results.push('会员页同步说明到期后的真实权限，不再把网址收藏列为会员额度');

  assert.deepEqual(errors,[],'page errors: '+errors.join(' | '));
  console.log(JSON.stringify({ok:true,results},null,2));
  await browser.close();
})().catch(async error=>{
  console.error(error);
  if(browser)await browser.close();
  process.exit(1);
});
