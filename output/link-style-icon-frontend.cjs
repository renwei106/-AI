const fs=require('fs'),p='dist/space-atlas.js';let s=fs.readFileSync(p,'utf8');s=s.replace('let remoteSpaceViews=','let remoteLinkStyleIcons={},remoteLinkStyleIconCatalog={};\n  let remoteSpaceViews=');s=s.replace('remoteNames=value?.optionNames||{};', 'remoteNames=value?.optionNames||{};remoteLinkStyleIcons=value?.linkStyleIcons||{};remoteLinkStyleIconCatalog=value?.linkStyleIconCatalog||{};');s=s.replace('function applyRegularViewConfig(){',`function syncLinkStyleIcons(){
    const artwork=id=>remoteLinkStyleIconCatalog[remoteLinkStyleIcons[id]||id]?.svg;
    const replace=(target,svg)=>{if(!target||!svg||target.dataset.configuredStyleIcon===svg)return;target.innerHTML=svg;target.dataset.configuredStyleIcon=svg};
    document.querySelectorAll('#link-view-settings [data-link-view]').forEach(button=>replace(button.querySelector(':scope > span:not(.membership-badge)'),artwork(button.dataset.linkView)));
    const id=typeof displayRule==='function'?(displayRule()?.style||styles[currentGroup()?.id]||'cards'):'cards';
    document.querySelectorAll('.workspace [data-link-settings]').forEach(button=>{const svg=artwork(id);if(!svg)return;let icon=button.querySelector(':scope > .configured-link-style-icon');if(!icon){button.querySelector(':scope > svg')?.remove();icon=document.createElement('span');icon.className='configured-link-style-icon';icon.style.cssText='display:inline-flex;align-items:center;width:16px;height:16px';button.prepend(icon)}replace(icon,svg)});
  }
  function applyRegularViewConfig(){syncLinkStyleIcons();`);fs.writeFileSync(p,s);
