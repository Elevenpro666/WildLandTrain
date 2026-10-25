const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const {weaponStats}=await import('./src/game/upgrades.mjs');
 const {arcMounts}=await import('./src/presentation/arc-mount.mjs');
 const group={carrier:'head',count:4,x:210,y:260};
 const state=upgrades=>({artVersion:'approved',mountTrialCandidate:true,mountArtTier:'basic',upgrades,weapons:Array.from({length:4},()=>({carrier:'head',key:'arc'}))});
 const basic=arcMounts(group,state({})),reach=arcMounts(group,state({arcReach:1}));
 assert.equal((basic.match(/data-mount="arc"/g)||[]).length,4);
 assert.equal((reach.match(/data-mount="arc"/g)||[]).length,4);
 assert.equal((basic.match(/data-arc-idle-spark="v1"/g)||[]).length,4);
 assert.equal((basic.match(/data-arc-emitter="ready"/g)||[]).length,0);
 assert.equal((reach.match(/data-arc-conductor="extended"/g)||[]).length,4);
 assert.equal((reach.match(/data-arc-conductor-art="v1"/g)||[]).length,4);
 assert.equal(weaponStats('arc',{}).jump,60);
 assert.equal(weaponStats('arc',{arcReach:1}).jump,90);
 assert.equal(weaponStats('arc',{}).range,weaponStats('arc',{arcReach:1}).range);
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&platformArt=carV1&weaponTrial=arcReach&v=arc-reach1');
  await page.locator('[data-action="depart"]').click();
  await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='battle');
  const snapshot=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
  assert.equal(snapshot.upgrades.arcReach,1);
  assert.equal(await page.locator('[data-arc-conductor="extended"]').count(),2);
  assert.equal(await page.locator('[data-arc-conductor-art="v1"]').count(),2);
  const artLoaded=await page.evaluate(async()=>Promise.all([...document.querySelectorAll('[data-arc-conductor-art]')].map(async node=>{
   const image=new Image();image.src=node.getAttribute('href');await image.decode();return image.naturalWidth>0&&image.naturalHeight>0;
  })));
  assert.ok(artLoaded.every(Boolean),'延伸电弧独立资源必须解码');
  assert.equal(await page.locator('[data-mount="arc"]').count(),2);
  assert.deepEqual(errors,[]);
  console.log('PASS: 基础/强化各4件独立表达、60→90连锁数值、初始射程不变；真实出发后2件传导端可见，无页面错误。');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
