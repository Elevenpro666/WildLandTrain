const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const {weaponStats}=await import('./src/game/upgrades.mjs');
 const base=weaponStats('arc',{}),high=weaponStats('arc',{arcDamage:1});
 assert.equal(base.damage,12);
 assert.equal(high.damage,18);
 assert.equal(high.interval,base.interval);
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&platformArt=carV1&weaponTrial=arcDamage&v=arc-damage-resource1');
  await page.locator('[data-action="depart"]').click();
  await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='battle');
  const state=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
  assert.equal(state.upgrades.arcDamage,1);
  const mounts=await page.locator('[data-mount="arc"]').count();
  assert.equal(mounts,2);
  assert.equal(await page.locator('[data-arc-state="high-voltage"]').count(),mounts);
  assert.equal(await page.locator('[data-arc-capacitor-art="v1"]').count(),mounts);
  const loaded=await page.evaluate(async()=>Promise.all([...document.querySelectorAll('[data-arc-capacitor-art="v1"]')].map(async node=>{
   const image=new Image();image.src=node.getAttribute('href');await image.decode();return image.naturalWidth===16&&image.naturalHeight===18;
  })));
  assert.ok(loaded.every(Boolean),'高压储能部件资源必须按16×18解码');
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'output/arc-damage-resource1.png'});
  const review=await browser.newPage({viewport:{width:390,height:844}});
  review.on('pageerror',error=>errors.push(error.message));
  await review.goto('http://127.0.0.1:4191/station-prototype/mount-fit-review.html?case=head4arc&platformArt=carV1&weaponTrial=arcDamage&v=arc-damage-resource1');
  assert.equal(await review.locator('[data-mount="arc"]').count(),4);
  assert.equal(await review.locator('[data-arc-capacitor-art="v1"]').count(),4);
  assert.equal(await review.locator('[data-arc-state="high-voltage"]').count(),4);
  await review.evaluate(async()=>Promise.all([...document.querySelectorAll('[data-arc-capacitor-art="v1"]')].map(async node=>{
   const image=new Image();image.src=node.getAttribute('href');await image.decode();
  })));
  await review.screenshot({path:'output/arc-damage-resource1-head4arc.png'});
  assert.deepEqual(errors,[]);
  await review.close();
  console.log(`PASS: 实战${mounts}件电弧逐件加载高压储能资源；四格审阅位4/4加载；伤害12→18、间隔不变，无页面错误。`);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
