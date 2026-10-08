const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../manifest.json'),'utf8'));

test('calendar colors run on both Notion Calendar domains and no other sites',()=>{
  const scripts=manifest.content_scripts.filter(script=>script.js.includes('content.js'));
  assert.equal(scripts.length,1);
  assert.deepEqual([...scripts[0].matches].sort(),[
    'https://calendar.notion.com/*',
    'https://calendar.notion.so/*'
  ]);
  assert.ok(scripts[0].css.includes('theme.css'));
  assert.deepEqual(scripts[0].js,['colors.js','content.js']);
  assert.deepEqual(manifest.permissions,['storage']);
});
