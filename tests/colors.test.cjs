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
