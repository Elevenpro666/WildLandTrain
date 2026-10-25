const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=boost-state1');
  await page.locator('[data-action="select"][data-id="head"]').click();
  await page.locator('[data-action="buyModule"][data-key="boost"]').click();
  await page.locator('[data-action="depart"]').click();
  await page.evaluate(()=>advanceTime(1500));
  const mount=page.locator('[data-mount="boost"]');
  assert.equal(await mount.count(),1);
  const image=mount.locator('image');
  assert.equal(await image.getAttribute('href'),'assets/weapons/boost-module-v1-candidate.png');
  assert.equal(await image.evaluate(async el=>{const bitmap=await createImageBitmap(await (await fetch(el.href.baseVal)).blob());return bitmap.width===1062&&bitmap.height===1480;}),true);
  const state=await page.evaluate(()=>JSON.parse(render_game_to_text()));
  assert.equal(state.sprint.distance,420);
  assert.equal(state.sprint.phase,'sprinting');
  assert.equal(await mount.getAttribute('data-boost-state'),'sprinting');
  assert.equal(await mount.locator('g path').count(),6);
  await page.screenshot({path:`output/boost-sprinting-${width}.png`});
  await page.evaluate(()=>advanceTime(1400));
  assert.equal((await page.evaluate(()=>JSON.parse(render_game_to_text()))).sprint.phase,'decelerating');
  assert.equal(await mount.getAttribute('data-boost-state'),'decelerating');
  await page.screenshot({path:`output/boost-decelerating-${width}.png`});
  await page.evaluate(()=>advanceTime(1300));
  assert.equal((await page.evaluate(()=>JSON.parse(render_game_to_text()))).sprint.phase,'charging');
  assert.equal(await mount.getAttribute('data-boost-state'),'charging');
  assert.equal(await mount.locator('g path').count(),0);
  await page.screenshot({path:`output/boost-charging-${width}.png`});
  assert.deepEqual(errors,[]);
  console.log(`${width} PASS booster art, loaded image, distance and no page error`);
  await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
