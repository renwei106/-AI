from pathlib import Path
p=Path('dist/space-atlas.js');s=p.read_text(encoding='utf-8')
start=s.index('<div class="at-header-actions space-top-actions">');end=s.index('</div>',start)+6;s=s[:start]+s[end:]
s=s.replace("mountGlobalSearch(query('.at-header-actions'));",'')
s=s.replace("const host=query('.at-mode-host'),buttons=query('.at-header-actions');","const host=query('.at-mode-host');")
s=s.replace("    if(actions){buttons.style.left=actions.left+'px';buttons.style.top=actions.top+'px';buttons.style.right='auto'}else{buttons.style.left='auto';buttons.style.right='18px';buttons.style.top='24px'}\n    clearCordOverlap(buttons);\n",'')
s=s.replace("    const original=document.querySelector('.workspace [data-action=add]');if(original)query('[data-at-header=add]').innerHTML=original.innerHTML;\n    const originalSettings=document.querySelector('.workspace [data-display-scope-open]');if(originalSettings)query('[data-at-header=settings]').innerHTML=originalSettings.innerHTML;\n",'')
s=s.replace("else if(!query('.global-search-results').hidden)","else if(document.querySelector('.workspace .global-search-results:not([hidden])'))")
s=s.replace("function clearSearch(){const el=query('.space-global-search');", "function clearSearch(){const el=document.querySelector('.workspace .space-global-search');")
p.write_text(s,encoding='utf-8')
p=Path('dist/corner.js');s=p.read_text(encoding='utf-8');s=s.replace("el.querySelector('.corner-icon-choices').innerHTML=tmp.content.querySelector('.corner-icon-choices').innerHTML;", "const choices=el.querySelector('.corner-icon-choices');if(choices)choices.innerHTML=tmp.content.querySelector('.corner-icon-choices').innerHTML;")
s=s.replace("panel.querySelector('[data-corner-next-theme]').focus({preventScroll:true});", "panel.querySelector('[data-corner-next-theme]').blur();")
p.write_text(s,encoding='utf-8')
