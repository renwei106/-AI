from pathlib import Path
p=Path('dist/v4.js');s=p.read_text(encoding='utf-8')
s=s.replace("follow:['跟随主题',3,6],",'')
a=s.index('const viewsBeforeSections=openLinkSettings;');b=s.index('\n',a)
s=s[:a]+s[b:]
s=s.replace('#link-view-settings .more-link-views [data-link-view]','#link-view-settings [data-link-view]')
s=s.replace("return id==='follow'?({paper:'paper',music:'record',cinema:'film',cosmos:'planet',flip:'calendar',rain:'calendar'}[effective().theme]||'cards'):id","return id==='follow'?'cards':id")
s=s.replace("return id==='follow'&&effective().theme==='projection'?'film':linkModeBeforeProjection(id)","return linkModeBeforeProjection(id)")
s=s.replace("return id==='follow'&&effective().theme==='wallfilm'?'film':linkBeforeWallfilm(id)","return linkBeforeWallfilm(id)")
# Freeze legacy theme-following choices once, before the themed render functions run.
a=s.index('const LINK_VIEWS=')
migration="""function migrateIndependentLinkStyles(){const actual=({paper:'paper',music:'record',cinema:'film',cosmos:'planet',flip:'calendar',rain:'calendar',reading:'shelf',projection:'film',wallfilm:'film'}[effective().theme]||'cards');let changed=false;for(const id of Object.keys(styles))if(styles[id]==='follow'){styles[id]=actual;changed=true}for(const rules of [prefs.spaceDisplayRules,prefs.sceneDisplayRules])for(const rule of Object.values(rules||{}))if(rule?.style==='follow'){rule.style=actual;changed=true}if(changed)persist()}
migrateIndependentLinkStyles();
"""
s=s[:a]+migration+s[a:]
# Also migrate preferences restored by account sync before rendering.
s += "\nconst renderBeforeIndependentStyles=render;render=function(){migrateIndependentLinkStyles();return renderBeforeIndependentStyles()};\n"
p.write_text(s,encoding='utf-8')
p=Path('dist/reading-theme.js');s=p.read_text(encoding='utf-8');s=s.replace("return id==='follow'&&effective().theme==='reading'?'shelf':modeBefore(id)","return modeBefore(id)");p.write_text(s,encoding='utf-8')
p=Path('dist/space-atlas.js');s=p.read_text(encoding='utf-8');s=s.replace("?id==='follow':", "?id==='cards':");p.write_text(s,encoding='utf-8')
