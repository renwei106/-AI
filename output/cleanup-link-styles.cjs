const fs=require('fs');const update=(p,fn)=>fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));
update('dist/v4.js',s=>s.replace("function linkMode(id){if(id==='cloud'||id==='poly')return 'cards';return id==='follow'?'cards':id}","function linkMode(id){return id==='cloud'?'cards':LINK_VIEWS[id]?id:'cards'}")
.replace("if(chosen==='follow')styles[g.id]=actual;groupsBeforeThemedLinks();if(chosen==='follow')styles[g.id]=chosen;","groupsBeforeThemedLinks();")
.replace(",follow:'star'",'')
.replace(/,details=d\.querySelector\('\.more-link-views'\);if\(details\)\{.*?details\.replaceWith\(section\)\}/,";")
.replace("const linkModeBeforeProjection=linkMode;linkMode=function(id){return linkModeBeforeProjection(id)};",'')
.replace("const linkBeforeWallfilm=linkMode;linkMode=function(id){return linkBeforeWallfilm(id)};",''));
update('dist/reading-theme.js',s=>s.replace(/  const modeBefore=linkMode;\r?\n  linkMode=function\(id\)\{return modeBefore\(id\);\};\r?\n/,''));
update('dist/space-atlas.js',s=>s.replace('follow:true,','').replace("['follow','cards'","['cards'").replace("0,'poly','shelf'","0,'shelf'"));
update('dist/v4.css',s=>s.replace(/\.view-section-title\{[^}]*\}|\.link-view-grid \.follow-priority\{[^}]*\}|\.more-link-views(?: summary| \.link-view-grid)?\{[^}]*\}/g,'').replace('including theme-following cards','with the same shared content'));
