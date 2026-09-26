const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../colors.js');
test('contrast reference black/white is 21:1',()=>assert.equal(C.contrast('#000','#fff'),21));
test('every palette passes 4.5:1 for filled and outlined cards in both themes',()=>{
  for(const mode of ['light','dark'])for(const p of C.palettes){
    for(const bg of [p[mode],'var(--nds-surface-page)']){
      const c=C.eventColors(bg,p[mode],p[mode],mode);
      assert.ok(C.contrast(c.background,c.foreground)>=4.5,JSON.stringify(c));
    }
  }
});
test('actual Notion purple and cyan map to measured Google colors',()=>{
  assert.equal(C.eventColors('rgb(254, 236, 255)','','','dark').background,'#a75aba');
  assert.equal(C.eventColors('rgb(225, 249, 255)','','','dark').background,'#4b99d2');
});
test('outlined invitations stay outlined with readable text',()=>{
  const c=C.eventColors('var(--nds-surface-page)','rgb(167, 37, 28)','rgb(238, 0, 13)','dark');
  assert.equal(c.outlined,true);assert.equal(c.background,'#131314');
  assert.ok(C.contrast(c.background,c.foreground)>=4.5);
});
test('unrecognized colors fail safely',()=>assert.equal(C.eventColors('var(--unknown)','var(--unknown)','transparent','dark'),null));
test('out-of-office blue has a pale background and dark text in light mode',()=>{
  const normal=C.eventColors('rgb(225, 249, 255)','rgb(0, 108, 191)','transparent','light');
  const away=C.eventColors('rgb(225, 249, 255)','rgb(0, 108, 191)','transparent','light',true);
  assert.equal(normal.background,'#039be5');
  assert.equal(away.background,'rgb(225, 243, 252)');
  assert.equal(away.foreground,'#1f1f1f');
  assert.ok(C.contrast(away.foreground,away.background)>=4.5);
});
test('out-of-office text and icon remain readable across palettes and themes',()=>{
  for(const mode of ['light','dark'])for(const p of C.palettes){
    const c=C.eventColors(p[mode],p[mode],'transparent',mode,true);
    assert.ok(C.contrast(c.foreground,c.background)>=4.5);
    assert.ok(C.contrast(c.icon,c.background)>=4.5);
  }
});
test('outlined out-of-office events retain their invitation state',()=>{
  const normal=C.eventColors('var(--nds-surface-page)','#039be5','#039be5','light');
  const away=C.eventColors('var(--nds-surface-page)','#039be5','#039be5','light',true);
  assert.deepEqual(away,normal);
});
test('unrecognized or missing icon geometry does not identify out-of-office',()=>{
  assert.equal(C.isOutOfOfficePath(null),false);
  assert.equal(C.isOutOfOfficePath('M10 10 L20 20'),false);
});
