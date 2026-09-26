'use strict';
const toggle=document.getElementById('enabled'), mode=document.getElementById('mode'), status=document.getElementById('status');
let saved={enabled:true,mode:'light'};
function render(){
  toggle.checked=saved.enabled; mode.value=saved.mode;
  status.textContent=saved.enabled?'配色を適用しています':'Notion Calendar本来の表示です';
}
chrome.storage.local.get(saved).then(settings=>{
  saved={enabled:settings.enabled!==false,mode:settings.mode==='dark'?'dark':'light'};
  render();toggle.disabled=mode.disabled=false;
}).catch(()=>{status.textContent='設定を読み込めません。拡張を開き直してください。';});
async function save(){
  toggle.disabled=mode.disabled=true;
  try{
    const next={enabled:toggle.checked,mode:mode.value};
    await chrome.storage.local.set(next);saved=next;render();
  }catch{render();status.textContent='保存できませんでした。もう一度お試しください。';}
  finally{toggle.disabled=mode.disabled=false;}
}
toggle.addEventListener('change',save);mode.addEventListener('change',save);
