(() => {
  'use strict';
  const rootAttribute='data-calendar-look', chipSelector='[data-event-chip-key]';
  const ownProperties=['--cl-event-bg','--cl-event-fg','--cl-event-border','--cl-event-icon'];
  // Keep out-of-office colors independent of the ordinary event palette.
  const awayProperties=['--clearcal-away-bg','--clearcal-away-fg','--clearcal-away-border','--clearcal-away-icon'];
  const allProperties=[...ownProperties,...awayProperties];
  let settings={enabled:true,mode:'light'}, revision=0, scheduled=false;
  const pending=new Set(), fingerprints=new WeakMap();
  function colorChip(chip) {
    if(!chip.isConnected)return;
    const s=chip.style;
    // Read native inline values, never overwrite Notion's own properties.
    const input=['--background-color','--foreground-color-primary','--border-color'].map(k=>s.getPropertyValue(k));
    const outOfOffice=[...chip.querySelectorAll('svg path')]
      .some(path=>CalendarLookColors.isOutOfOfficePath(path.getAttribute('d')));
    const signature=JSON.stringify([settings.mode,...input,outOfOffice]);
    const required=outOfOffice?allProperties:ownProperties;
    if(fingerprints.get(chip)===signature && required.every(k=>s.getPropertyValue(k)) &&
      chip.hasAttribute('data-cl-event') && chip.hasAttribute('data-cl-out-of-office')===outOfOffice)return;
    fingerprints.set(chip,signature);
    const colors=CalendarLookColors.eventColors(...input,settings.mode,outOfOffice);
    if(!colors){chip.removeAttribute('data-cl-event');chip.removeAttribute('data-cl-out-of-office');allProperties.forEach(k=>s.removeProperty(k));return;}
    chip.setAttribute('data-cl-event',colors.outlined?'outline':'filled');
    chip.toggleAttribute('data-cl-out-of-office',outOfOffice);
    s.setProperty(ownProperties[0],colors.background);
    s.setProperty(ownProperties[1],colors.foreground);
    s.setProperty(ownProperties[2],colors.border);
    s.setProperty(ownProperties[3],colors.icon||colors.foreground);
    if(outOfOffice){
      [colors.background,colors.foreground,colors.border,colors.icon||colors.foreground]
        .forEach((value,i)=>s.setProperty(awayProperties[i],value));
    }else awayProperties.forEach(k=>s.removeProperty(k));
  }
  const observer=new MutationObserver(records=>{
    if(!settings.enabled)return;
    for(const record of records) {
      // Icons may be added, removed or replaced when a virtualized chip is reused.
      const owner=record.target.nodeType===1?record.target.closest(chipSelector):null;
      if(owner)pending.add(owner);
      if(record.type==='attributes'){
        if(record.target.matches(chipSelector))pending.add(record.target);
      } else for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches(chipSelector))pending.add(node);
        node.querySelectorAll(chipSelector).forEach(e=>pending.add(e));
      }
    }
    // React replaces native colors when a chip is selected. Correct them before
    // the next paint instead of exposing the native saturated fill for 40ms.
    if(pending.size&&!scheduled){scheduled=true;queueMicrotask(flush);}
  });
  function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['style','data-event-chip-key','d','class']});}
  function flush(){
    if(!scheduled)return;
    scheduled=false;observer.disconnect();
    if(settings.enabled)pending.forEach(colorChip);
    pending.clear();if(settings.enabled)observe();
  }
  function apply(){
    const root=document.documentElement;if(!root)return;
    observer.disconnect();scheduled=false;pending.clear();
    if(settings.enabled){
      root.setAttribute(rootAttribute,settings.mode);
      document.querySelectorAll(chipSelector).forEach(colorChip);observe();
    }else{
      root.removeAttribute(rootAttribute);
      document.querySelectorAll('[data-cl-event]').forEach(chip=>{
        chip.removeAttribute('data-cl-event');chip.removeAttribute('data-cl-out-of-office');allProperties.forEach(k=>chip.style.removeProperty(k));fingerprints.delete(chip);
      });
    }
  }
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=='local'||!(changes.enabled||changes.mode))return;
    revision++;
    if(changes.enabled)settings.enabled=changes.enabled.newValue!==false;
    if(changes.mode)settings.mode=changes.mode.newValue==='dark'?'dark':'light';
    apply();
  });
  const initialRevision=revision;
  chrome.storage.local.get(settings).then(saved=>{
    if(revision!==initialRevision)return;
    settings={enabled:saved.enabled!==false,mode:saved.mode==='dark'?'dark':'light'};apply();
  }).catch(()=>apply());
  if(!document.documentElement){
    const ready=new MutationObserver(()=>{if(document.documentElement){ready.disconnect();apply();}});
    ready.observe(document,{childList:true});
  }
})();
