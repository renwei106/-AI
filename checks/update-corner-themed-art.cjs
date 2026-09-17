const fs=require('fs'),f='dist/corner.js';let s=fs.readFileSync(f,'utf8');
const ring='<circle cx="12" cy="12" r="8"/>';
const cosmos=[
 ['太阳','<circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity=".15"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>'],
 ['水星',ring+'<circle cx="9" cy="9" r="2"/><path d="M14 6h2m-3 8 3 2m-9-2 1 2"/>'],
 ['金星',ring+'<path d="M7 7c5 4 6-2 10 2M5 12c6 3 7-2 14 2M8 17c3-2 6 1 8 0"/>'],
 ['地球',ring+'<path d="m7 5 2 3-2 3 3 2 1 5 3 1 1-4 3-2-2-3-3 1-2-3 2-3M5 15l3-1"/>'],
 ['月球',ring+'<circle cx="9" cy="8" r="2"/><circle cx="15" cy="14" r="3"/><circle cx="8" cy="16" r="1"/><path d="M15 6h1"/>'],
 ['火星',ring+'<path d="m8 6 3 3-3 3 3 2m4-8 2 4-3 3 2 5M6 16l2 1"/>'],
 ['木星',ring+'<path d="M6 7h12M4 11h16M5 15h7m5 0h2M8 18h8"/><ellipse cx="15" cy="15" rx="3" ry="1.5"/>'],
 ['土星','<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="3" transform="rotate(-28 12 12)"/><path d="m10 8 5 1"/>'],
 ['天王星','<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="3" ry="11" transform="rotate(22 12 12)"/>'],
 ['海王星',ring+'<path d="M6 9c4 3 8-3 12 0M5 14c4 3 10-3 14 0M8 17h8"/>'],
 ['冥王星','<circle cx="11" cy="13" r="7"/><path d="M7 10c1-3 4-1 4 0 0-2 4-3 4 0 0 2-4 5-4 5s-4-3-4-5Z"/><circle cx="20" cy="4" r="2"/>'],
 ['彗星','<circle cx="7" cy="17" r="4"/><path d="M7 13 18 2M11 17 22 6M11 13 21 3"/>'],
 ['流星','<path d="m7 12 2 3 4 1-3 3v3l-4-2-3 1 1-4-2-3 5-2ZM11 9l6-6m-3 10 7-7M9 6l3-3"/>'],
 ['小行星','<path d="m7 3 9 1 5 7-3 8-9 2-6-8 4-10Z"/><circle cx="9" cy="9" r="2"/><path d="m13 13 4 2-2 3M6 15h1"/>'],
 ['行星轨道','<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="6" transform="rotate(-30 12 12)"/><circle cx="19" cy="6" r="2"/>'],
 ['银河','<path d="M13 10c7-3 7 7-1 8C0 20-1 5 12 4c15-1 16 18 2 19M11 14c-7 3-7-7 1-8"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'],
 ['星云','<path d="M5 9c-2-5 6-8 9-4 6-2 10 5 5 8 3 5-5 10-9 6-6 2-10-6-5-10Z"/><path d="m12 7 1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4Z"/>'],
 ['双星','<circle cx="8" cy="10" r="4"/><circle cx="17" cy="15" r="3"/><path d="M3 17c3 5 15 6 18-3M6 3c6-3 13 1 15 6"/>'],
 ['月相','<path d="M14 3a9 9 0 1 0 7 14A10 10 0 0 1 14 3Z"/><path d="m19 3 .7 2.3L22 6l-2.3.7L19 9l-.7-2.3L16 6l2.3-.7L19 3Z"/>'],
 ['星座','<circle cx="5" cy="5" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="10" cy="13" r="2"/><circle cx="17" cy="21" r="1.5"/><path d="m7 5 9 2m-1 2-3 3m-1 3 5 5M4 7l5 4"/>']
];
const paper=[
 ['日报','<path d="M5 3h16v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7h2v12M5 3v16"/><path d="M8 6h10M8 9h10M8 12h4v5H8zM15 12h3m-3 3h3M8 19h10"/>'],
 ['双栏报','<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M6 6h12M12 9v9M6 10h3m6 0h3M6 14h3m6 0h3M6 18h3m6 0h3"/>'],
 ['折叠报','<path d="m3 6 16-3 2 15-16 3-2-15Z"/><path d="m4 12 16-3M7 8l8-1M8 16l3-.5m3-.5 3-.5"/>'],
 ['头版','<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M7 5h10M7 8h10M7 11h10v6H7zM7 20h4m3 0h3"/>'],
 ['新闻集','<path d="M7 2h14v17H7zM3 5v17h15M10 5h8M10 8h8M10 11h3v4h-3zM16 11h2m-2 4h2"/>'],
 ['晨报','<path d="M3 10h18v11H3zM6 13h5v5H6zM14 13h4m-4 4h4M8 7a4 4 0 0 1 8 0M12 1v2M4 3l2 2m12 0 2-2"/>'],
 ['晚报','<rect x="3" y="8" width="18" height="14" rx="1"/><path d="M6 11h5v7H6zM14 11h4m-4 4h4m-4 4h4M15 1a4 4 0 1 0 5 5 5 5 0 0 1-5-5Z"/>'],
 ['杂志','<path d="M4 3h14l3 3v15H4V3Zm14 0v4h3M7 6h7M7 10h10v7H7zM7 19h10"/>'],
 ['周刊','<path d="M3 4h18v17H3zM6 2v4m12-4v4M3 8h18M6 11h4v6H6zM13 11h5m-5 3h5m-5 3h5"/>'],
 ['剪报','<path d="m4 3 3 1 3-1 3 1 3-1 4 1v16l-4-1-3 1-3-1-3 1-3-1V3ZM7 7h10M7 11h4v5H7zM14 11h3m-3 4h3"/>'],
 ['图文','<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M6 6h12v8H6zM6 13l4-4 3 3 2-1 3 3M6 17h12M6 19h8"/>'],
 ['书评','<path d="M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1v16M5 8h4M5 12h4M15 8h4m-4 4h4"/>'],
 ['卷报','<path d="M6 3h12a3 3 0 0 1 0 6H6M6 3a3 3 0 0 0 0 6v12h12V9M9 12h6m-6 3h6m-6 3h4"/>'],
 ['社论','<path d="M4 3h12v7M4 3v18h16v-6M7 7h6M7 11h3M7 15h3m-3 3h8m0-6 6-8 2 2-6 8-3 1 1-3Z"/>'],
 ['藏刊','<path d="M3 3h17v18H3zM7 3v18M11 3v8l3-2 3 2V3M10 15h7m-7 3h7"/>'],
 ['信笺','<path d="M3 7h18v14H3zM3 8l9 7 9-7M7 10V2h10v8M9 5h6m-6 3h4"/>'],
 ['特刊','<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M6 6h12m-6 3 1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L7 12.5l3.5-.5L12 9Z"/>'],
 ['档案','<path d="M3 7h18v14H3zM2 3h20v4H2zM9 11h6v4H9zM6 18h12"/>'],
 ['小报','<path d="M6 2h13v18H6zM3 6v16h13M9 5h7M9 9h7M9 12h3v5H9zM14 12h2m-2 3h2"/>'],
 ['连载','<path d="M2 4h9v16H2zM13 4h9v16h-9zM4 7h5m-5 4h5m-5 4h3M15 7h5m-5 4h5m-5 4h3"/>']
];
const code='  const themeDrawings='+JSON.stringify({cosmos,paper})+';\n  function renderCardIcon(id){const m=/^theme-(cosmos|paper)-(\\d+)$/.exec(id||\'\');return m&&themeDrawings[m[1]][Number(m[2])]?glyph(themeDrawings[m[1]][Number(m[2])][1]):ENTITY_ICONS[id]?entityIcon(id):cardsIcon;}\n';
s=s.replace('  const followsTheme=',code+'  const followsTheme=');
s=s.replace("function themeChoices(){const key=effective().theme;return", "function themeChoices(){const key=effective().theme;if(themeDrawings[key])return themeDrawings[key].map(([name],i)=>({id:'theme-'+key+'-'+i,name}));return");
s=s.replace("const cardIcon=g=>followsTheme(g)?entityIcon(themeIconId(g)):g.icon&&ENTITY_ICONS[g.icon]?entityIcon(g.icon)","const cardIcon=g=>followsTheme(g)?renderCardIcon(themeIconId(g)):g.icon?renderCardIcon(g.icon)");
s=s.replace("entityIcon(x.id)+'</button>').join('');","renderCardIcon(x.id)+'</button>').join('');");fs.writeFileSync(f,s);
