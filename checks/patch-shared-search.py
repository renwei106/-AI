from pathlib import Path
p=Path('dist/space-atlas.js');s=p.read_text(encoding='utf-8').replace("const results=query('.global-search-results');if(results)results.hidden=true", "const results=document.querySelector('.workspace .global-search-results');if(results)results.hidden=true");p.write_text(s,encoding='utf-8')
