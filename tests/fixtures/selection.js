// Synthetic DOM fixture: no account, event or calendar data.
const listeners=[];
window.chrome={storage:{local:{get:async defaults=>defaults},onChanged:{addListener:fn=>listeners.push(fn)}}};
const chip=document.querySelector('[data-event-chip-key]');
const fill=chip.querySelector('.sc-1axd7p-11');
const resting='--background-color: rgb(225, 249, 255); --foreground-color-primary: rgb(0, 108, 191); --border-color: transparent;';
const selected='--background-color: rgb(50, 165, 228); --foreground-color-primary: var(--white); --border-color: transparent;';
chip.style.cssText=resting;
const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const configure=(mode,enabled=true)=>listeners.forEach(fn=>fn({mode:{newValue:mode},enabled:{newValue:enabled}},'local'));
document.getElementById('run').onclick=async()=>{
  const failures=[];
  let checks=0;
  for(const mode of ['light','dark']){
    configure(mode);
    const expected=CalendarLookColors.eventColors('rgb(225, 249, 255)','rgb(0, 108, 191)','transparent',mode,true);
    for(let cycle=0;cycle<3;cycle++)for(const [state,style] of [['selected',selected],['resting',resting]]){
      // Replace inline style just as the app can during a render, including
      // removal of extension-owned properties. Inspect the very next paint.
      await frame();
      chip.style.cssText=style;
      await frame();
      checks++;
      if(getComputedStyle(fill).backgroundColor!==expected.background)
        failures.push(`${mode} ${state} cycle ${cycle}: ${getComputedStyle(fill).backgroundColor}`);
      if(!chip.hasAttribute('data-cl-out-of-office'))failures.push('Lost out-of-office marker');
    }
    // Disable while a native mutation is still pending: queued work must not
    // recolor the chip after the user has turned the extension off.
    chip.style.cssText=selected;
    configure(mode,false);
    await frame();
    checks++;
    if(chip.hasAttribute('data-cl-event')||getComputedStyle(fill).backgroundColor!=='rgb(50, 165, 228)')
      failures.push(`${mode}: disabled restoration`);
    chip.style.cssText=resting;
  }
  configure('light');
  document.getElementById('result').textContent=failures.length?`FAIL\n${failures.join('\n')}`:`PASS: ${checks} first-paint selection and restoration checks`;
};
