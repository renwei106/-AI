const fs=require('fs');fs.mkdirSync('baselines/v170-theme-order-cord-target',{recursive:true});for(const f of ['v4.js','v4.css'])fs.copyFileSync('dist/'+f,'baselines/v170-theme-order-cord-target/'+f);let s=fs.readFileSync('dist/v4.js','utf8');s=s.replace("function label(){button.setAttribute('aria-label','拉动切换模式，当前'+labels[prefs.mode||'system']);button.title='点击或下拉切换明暗模式'}label();", "function label(){syncCordTarget()}label();");s+=`
function syncCordTarget(){const b=document.querySelector('.mode-pull-cord');if(!b)return;const next={light:'dark',dark:'system',system:'light'}[prefs.mode||'system'],labels={light:'日间模式',dark:'夜间模式',system:'跟随系统'};b.dataset.nextMode=next;b.title='点击或下拉，切换为'+labels[next];b.setAttribute('aria-label',b.title)}
const applyBeforeCordTarget=apply;apply=function(){applyBeforeCordTarget();syncCordTarget()};
const themeOrder=['base','music',...Object.keys(THEMES).filter(id=>!['base','music','cinema','paper'].includes(id)),'cinema','paper'];
const orderedThemeEntries=themeOrder.map(id=>[id,THEMES[id]]);for(const [id]of orderedThemeEntries)delete THEMES[id];for(const [id,theme]of orderedThemeEntries)THEMES[id]=theme;
render();syncCordTarget();
`;fs.writeFileSync('dist/v4.js',s);fs.appendFileSync('dist/v4.css',`
.mode-pull-cord[data-next-mode=dark] .mode-cord-handle{background:#111;outline:1px solid #ffffff80}
.mode-pull-cord[data-next-mode=light] .mode-cord-handle{background:#fff;outline:1px solid #00000050}
.mode-pull-cord[data-next-mode=system] .mode-cord-handle{background:linear-gradient(135deg,#fff 0 49%,#151515 51% 100%);outline:1px solid #8888}
`);
