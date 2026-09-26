(() => {
  'use strict';
  const rootAttribute='data-calendar-look', chipSelector='[data-event-chip-key]';
  const ownProperties=['--cl-event-bg','--cl-event-fg','--cl-event-border'];
  let settings={enabled:true,mode:'light'}, revision=0, timer;
  const pending=new Set(), fingerprints=new WeakMap();
  function colorChip(chip) {
    if(!chip.isConnected)return;
    const s=chip.style;
    // Read native inline values, never overwrite Notion's own properties.
    const input=['--background-color','--foreground-color-primary','--border-color'].map(k=>s.getPropertyValue(k));
    const signature=JSON.stringify([settings.mode,...input]);
    if(fingerprints.get(chip)===signature && ownProperties.every(k=>s.getPropertyValue(k)))return;
    fingerprints.set(chip,signature);
    const colors=CalendarLookColors.eventColors(...input,settings.mode);
    if(!colors){chip.removeAttribute('data-cl-event');ownProperties.forEach(k=>s.removeProperty(k));return;}
    chip.setAttribute('data-cl-event',colors.outlined?'outline':'filled');
    s.setProperty(ownProperties[0],colors.background);
    s.setProperty(ownProperties[1],colors.foreground);
    s.setProperty(ownProperties[2],colors.border);
  }
  const observer=new MutationObserver(records=>{
    if(!settings.enabled)return;
    for(const record of records) {
      if(record.type==='attributes'){
        if(record.target.matches(chipSelector))pending.add(record.target);
      } else for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches(chipSelector))pending.add(node);
        node.querySelectorAll(chipSelector).forEach(e=>pending.add(e));
      }
    }
    if(pending.size&&!timer)timer=setTimeout(flush,40);
  });
  function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['style','data-event-chip-key']});}
  function flush(){
    timer=undefined;observer.disconnect();
    if(settings.enabled)pending.forEach(colorChip);
    pending.clear();if(settings.enabled)observe();
  }
  function apply(){
    const root=document.documentElement;if(!root)return;
    observer.disconnect();clearTimeout(timer);timer=undefined;pending.clear();
    if(settings.enabled){
      root.setAttribute(rootAttribute,settings.mode);
      document.querySelectorAll(chipSelector).forEach(colorChip);observe();
    }else{
      root.removeAttribute(rootAttribute);
      document.querySelectorAll('[data-cl-event]').forEach(chip=>{
        chip.removeAttribute('data-cl-event');ownProperties.forEach(k=>chip.style.removeProperty(k));fingerprints.delete(chip);
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
