const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{for(const width of [320,390]){
 const p=await browser.newPage({viewport:{width,height:width===320?568:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4186');const state=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));let previousLevel=1;
 let bossSeen=false,eliteSeen=false;
 for(let stage=1;stage<=3;stage++){
  await p.locator('[data-action=depart]').click();let s=await state();assert.equal(s.journey.stage,stage);assert.equal(s.level,previousLevel);assert.equal(s.hp,300);
  for(let i=0;i<500;i++){
   s=await state();if(s.mode!=='battle')break;
   assert.equal(await p.locator('[data-route-node]').count(),5);
   if(s.elite?.status==='active'&&!eliteSeen){eliteSeen=true;assert.equal(s.sprintLocked,false);await p.screenshot({path:`output/elite-route-${width}.png`});}
   if(s.boss&&!bossSeen){
    bossSeen=true;assert.equal(s.invincible,false);assert.equal(s.done,false);assert.ok(s.sprint.remaining>0,'manual sprint was interrupted before distance exhausted');assert.equal(await p.locator('[data-action=sprint]').isDisabled(),true);
    assert.ok((await p.locator('.battle-hud').textContent()).includes('Boss耐久'));
    assert.equal(await p.locator('[data-effect=shield]').count(),0);
    await p.screenshot({path:`output/boss-entry-${width}.png`});
   }
   if(s.choices.length)await p.locator('[data-action=chooseUpgrade]').first().click();
   else if(s.sprint.energy===100&&!s.sprintLocked&&(stage<3||s.routeRemaining<200)){
    try{await p.locator('[data-action=sprint]').click({timeout:500});}
    catch(error){const current=await state();if(current.mode==='battle'&&current.choices.length)continue;throw error;}
   }
   await p.evaluate(()=>advanceTime(300));
  }
  s=await state();previousLevel=s.journey.growth.level;
if(stage<3){assert.equal(s.mode,'arrival');assert.equal(await p.locator('.station-screen[inert]').count(),1);await p.evaluate(()=>advanceTime(3500));s=await state();assert.equal(s.mode,'station');assert.equal(s.cash,90+stage*48+s.journey.kills*(await import('./config.mjs')).lootConfig.scrapPerKill);await p.screenshot({path:`output/journey-station-${stage}-${width}.png`});}
  else{assert.ok(eliteSeen);assert.ok(bossSeen);assert.equal(s.mode,'result');assert.equal(s.journey.phase,'won');await p.screenshot({path:`output/journey-result-${width}.png`});}
 }
 await p.locator('[data-action=reset]').click();const s=await state();assert.equal(s.cash,90);assert.equal(s.journey.stage,1);assert.equal(s.journey.growth,null);assert.deepEqual(errors,[]);await p.close();
 }console.log('PASS 320/390 full expedition, two inline arrivals, growth, rewards, result and restart');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
