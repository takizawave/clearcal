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
  // Tall/compact cards and icon wrappers must all use the same pale palette.
  // Also simulate a legacy ordinary-event writer touching its shared variables.
  const wrapper=chip.querySelector('.sc-1axd7p-5');
  for(const mode of ['light','dark'])for(const color of [
    {name:'blue',rest:'rgb(225, 249, 255)',text:'rgb(0, 108, 191)',selected:'rgb(50, 165, 228)'},
    {name:'red',rest:'rgb(255, 213, 196)',text:'rgb(167, 37, 28)',selected:'rgb(238, 0, 13)'}
  ])for(const height of [24,360]){
    configure(mode);
    wrapper.className=height===360?'alternate-title-icon':'sc-1axd7p-5';
    const expected=CalendarLookColors.eventColors(color.rest,color.text,'transparent',mode,true);
    for(const active of [false,true,false]){
      chip.style.cssText=`height:${height}px; --background-color:${active?color.selected:color.rest}; --foreground-color-primary:${active?'var(--white)':color.text}; --border-color:transparent;`;
      await frame();
      checks++;
      if(getComputedStyle(fill).backgroundColor!==expected.background)
        failures.push(`${mode}/${color.name}/${height}/${active}: incorrect pale fill`);
      // Ordinary-event colors must never turn an already recognized away card
      // back into a saturated card, even if another writer updates these vars.
      chip.style.setProperty('--cl-event-bg',color.selected);
      chip.style.setProperty('--cl-event-fg','#ffffff');
      await frame();
      checks++;
      const expectedText=`rgb(${CalendarLookColors.rgb(expected.foreground).join(', ')})`;
      if(getComputedStyle(fill).backgroundColor!==expected.background||getComputedStyle(fill).color!==expectedText)
        failures.push(`${mode}/${color.name}/${height}: ordinary palette overwrote away colors`);
    }
  }
  wrapper.className='sc-1axd7p-5';
  const icon=wrapper.querySelector('svg');
  icon.remove();
  await frame();
  checks++;
  if(chip.hasAttribute('data-cl-out-of-office')||chip.style.getPropertyValue('--clearcal-away-bg'))
    failures.push('Reused ordinary card retained away styling');
  wrapper.append(icon);
  chip.style.cssText=resting;
  configure('light');
  await frame();
  document.getElementById('result').textContent=failures.length?`FAIL\n${failures.join('\n')}`:`PASS: ${checks} selection, pale-color isolation and restoration checks`;
};
