// Stable product taxonomy. Shared copy may belong to more than one location.
const GROUPS=[
 {id:'home',name:'首页展示',children:[['home-main','首页与搜索'],['home-themes','主题与默认文案'],['home-corner','我的一隅']]},
 {id:'space',name:'空间页',children:[['space-scenes','空间与场景'],['space-groups','分组管理'],['space-bookmarks','网址与收藏'],['space-inbox','稍后整理'],['space-views','视图与样式'],['space-search','空间搜索'],['space-guide','新手指引']]},
 {id:'world',name:'世界页',children:[['world-discover','发现与导航'],['world-resources','资源与素材'],['world-routes','学习路线'],['world-creators','创作者与共建']]},
 {id:'common',name:'全站通用',children:[['common-settings','个性化设置'],['common-account','个人中心'],['common-login','登录与账号'],['common-member','会员与支付'],['common-notices','公告与版本更新'],['common-extension','浏览器插件'],['common-feedback','反馈与帮助'],['common-actions','通用操作与提示']]}
].map(g=>({...g,children:g.children.map(([id,name])=>({id,name}))}));
function classify(file,context,text){
 const c=context.toLowerCase(),t=text.toLowerCase();
 if(file==='world.js'||file==='world-config.js'){
  if(/notice|announcement|release|update-dialog|ops-|\b(details|center|deliver|loadpublished)\b/.test(c))return 'common-notices';
  if(/creator|contribut|co-build/.test(c))return 'world-creators';
  if(/route|learning|roadmap/.test(c))return 'world-routes';
  if(/resource|material|tool/.test(c))return 'world-resources';
  return 'world-discover';
 }
 if(file==='space-atlas.js')return 'space-views';
 if(file==='corner.js')return 'home-corner';
 if(file.startsWith('member-'))return 'common-member';
 if(file==='feedback.js')return 'common-feedback';
 if(file==='extension/store.js')return 'common-extension';
 if(/-theme\.js$|nature-cinema|poly-engine|theme-availability/.test(file))return 'home-themes';
 if(/\bseed\b/.test(c))return /\bitems\b/.test(c)?'space-bookmarks':/\bgroups\b/.test(c)?'space-groups':'space-scenes';
 if(/^(工作空间|生活空间|灵感空间)$/.test(text))return 'space-scenes';
 if(/^(个性化设置|个人中心|登录)$/.test(text))return text==='登录'?'common-login':text==='个人中心'?'common-account':'common-settings';
 if(/login|signin|sign-in|register|password|auth-dialog|verification/.test(c))return 'common-login';
 if(/account|profile|avatar|personal-center/.test(c))return 'common-account';
 if(/member|payment|checkout|subscribe/.test(c))return 'common-member';
 if(/workspace-guide|onboarding/.test(c+t))return 'space-guide';
 if(/inbox|pending|later-organize/.test(c))return 'space-inbox';
 if(/global.?search|space.?search/.test(c))return 'space-search';
 if(/bookmark|link-editor|link-move|destination|metadata|add-dialog/.test(c))return 'space-bookmarks';
 if(/group.?view|link.?view|link.?style|link.?settings|atlas/.test(c))return 'space-views';
 if(/group/.test(c))return 'space-groups';
 if(/scene|space|workspace|sidebar/.test(c))return 'space-scenes';
 if(/setting|palette|color|appearance|font|personaliz/.test(c))return 'common-settings';
 if(/corner/.test(c))return 'home-corner';
 if(/theme|home|cover|memoir|surge|projection/.test(c))return 'home-themes';
 if(/search|engine/.test(c))return 'home-main';
 if(/notice|announcement/.test(c))return 'common-notices';
 if(file.startsWith('extension/'))return 'common-extension';
 return 'common-actions';
}
function groupInfo(id){for(const g of GROUPS){const child=g.children.find(x=>x.id===id);if(child)return {module:g.id,moduleName:g.name,group:child.id,groupName:child.name}}return null}
module.exports={GROUPS,classify,groupInfo};
