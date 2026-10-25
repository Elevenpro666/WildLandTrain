const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {createArrival}=await import('./src/game/arrival.mjs');
 for(const n of [1,6]){
  const a=createArrival(Array.from({length:n},(_,i)=>({id:'car'+i,level:1})));
  a.step(NaN);a.step(-1);assert.equal(a.snapshot().elapsed,0);
  a.toggle();a.step(1);assert.equal(a.snapshot().elapsed,0);a.toggle();
  a.step(10);assert.equal(a.snapshot().done,true);const s=a.snapshot();a.step(1);assert.deepEqual(a.snapshot(),s);
 }
 const b=await chromium.launch();
 for(const width of [320,390]){
  const page=await b.newPage({viewport:{width,height:width===320?568:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4186');
  const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  const initial=await state();
  await page.locator('[data-action=depart]').click();
  for(let i=0;i<240;i++){
   const s=await state();if(s.mode!=='battle')break;
   if(s.choices.length)await page.locator('[data-action=chooseUpgrade]').first().click();
   await page.evaluate(()=>advanceTime(400));
  }
  assert.equal((await state()).mode,'arrival');
  assert.equal(await page.locator('.station-screen[inert]').count(),1);
  assert.equal(await page.locator('.battle-screen').count(),0);
  const startTransform=await page.locator('.rail .car').last().evaluate(e=>e.style.transform);
  await page.waitForTimeout(450);
  const movedTransform=await page.locator('.rail .car').last().evaluate(e=>e.style.transform);
  assert.notEqual(movedTransform,startTransform,'real frame moves train');
  await page.evaluate(()=>advanceTime(700));
  await page.screenshot({path:`output/arrival-${width}.png`});
  assert.equal(await page.locator('.rail .car').count(),initial.carriers.length);
  await page.evaluate(()=>advanceTime(3500));
  const station=await state();assert.equal(station.mode,'station');assert.equal(station.journey.rewardTotal,48);assert.ok(station.cash>=initial.cash+48);assert.deepEqual(station.equipment,initial.equipment);
  assert.equal(await page.locator('.station-screen[inert]').count(),0);
  await page.locator('[data-action=depart]').click();assert.equal((await state()).hp,300);assert.equal((await state()).level,station.journey.growth.level);
  assert.deepEqual(errors,[]);await page.close();
 }
 await b.close();console.log('PASS arrival unit boundaries, 320/390 battle-to-arrival-to-station, pause, economy/loadout retention, full-health redeparture');
})().catch(e=>{console.error(e);process.exit(1)});
