const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch();
 for(const width of [320,390]){
  const p=await b.newPage({viewport:{width,height:width===320?568:844}});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4186');
  const state=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  await p.locator('[data-action=depart]').click();
  await p.evaluate(()=>advanceTime(6000));
  await p.locator('[data-action=chooseUpgrade]').first().click();
  await p.locator('[data-action=pauseBattle]').click();
  const paused=await state();
  await p.evaluate(()=>advanceTime(1000));assert.deepEqual(await state(),paused);
  assert.equal(await p.locator('[data-upgrade-toast]').count(),1);
  assert.ok((await p.locator('[data-upgrade-summary]').textContent()).includes('×1'));
  await p.screenshot({path:`output/upgrade-feedback-${width}.png`});
  await p.locator('[data-action=pauseBattle]').click();
  let released=false;
  for(let i=0;i<240;i++){
   let s=await state();if(s.mode!=='battle'||s.done)break;
   if(s.choices.length)await p.locator('[data-action=chooseUpgrade]').first().click();
   s=await state();
   if(!released&&s.sprint.energy>=100){await p.locator('[data-action=sprint]').click();assert.equal((await state()).invincible,true);released=true;}
   await p.evaluate(()=>advanceTime(500));
  }
  assert.ok(released,'manual sprint after upgrades');
  assert.equal((await state()).mode,'arrival');
  await p.evaluate(()=>advanceTime(3500));
  assert.equal((await state()).mode,'station');
  assert.equal(await p.locator('[data-upgrade-summary]').count(),0);
  const growth=(await state()).journey.growth;
  await p.locator('[data-action=depart]').click();
  const fresh=await state();assert.equal(fresh.level,growth.level);assert.deepEqual(fresh.upgrades,growth.upgrades);assert.equal(fresh.lastUpgrade,null);assert.equal(fresh.hp,300);
  assert.deepEqual(errors,[]);await p.close();
 }
 await b.close();console.log('PASS 320/390 feedback, pause freeze, upgrades + manual sprint, end, station return, repaired restart');
})().catch(e=>{console.error(e);process.exit(1)});
