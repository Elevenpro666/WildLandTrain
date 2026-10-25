const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   // Keep the real UI/action path, but let advanceTime be the sole simulation clock.
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};});
   await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=saw-linked-live1');
   const snapshot=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   const selected=[];
   let verified=false;
   for(let step=0;step<1800;step++){
    const state=await snapshot();
    if(state.mode==='result')break;
    if(state.mode==='station'){
     await page.locator('[data-action="depart"]').click();
     continue;
    }
    if(state.choices?.length){
     const offer=state.choices.find(card=>card.id==='sawLinked'&&state.upgrades.sawReach)
      ||state.choices.find(card=>card.id==='sawReach')||state.choices[0];
     if(offer.id==='sawLinked'){
      const wheels=page.locator('[data-saw-tier]');
      assert.equal(await wheels.count(),4);
      assert.equal(await page.locator('[data-upgrade-art="sawLinked"]').count(),0);
      const before=await snapshot();
      const hideOffer=await page.addStyleTag({content:'.upgrade-shade{display:none!important}'});
      await page.screenshot({path:`output/saw-linked-live-before-${width}.png`});
      await hideOffer.evaluate(element=>element.remove());
      await page.locator(`[data-action="chooseUpgrade"][data-id="${offer.id}"]`).click();
      const after=await snapshot();
      assert.equal(after.upgrades.sawLinked,1);
      assert.equal(after.lastUpgrade.id,'sawLinked');
      assert.equal(after.t,before.t);
      assert.equal(await wheels.count(),4);
      assert.equal(await page.locator('[data-upgrade-art="sawLinked"]').count(),2);
      await page.screenshot({path:`output/saw-linked-live-after-${width}.png`});
      const rotor=await page.locator('[data-saw-rotor]').first().getAttribute('transform');
      const bladeX=await wheels.first().getAttribute('data-saw-x');
      await page.evaluate(()=>advanceTime(125));
      assert.notEqual(await page.locator('[data-saw-rotor]').first().getAttribute('transform'),rotor);
      assert.notEqual(await wheels.first().getAttribute('data-saw-x'),bladeX);
      await page.screenshot({path:`output/saw-linked-live-motion-${width}.png`});
      selected.push(offer.id);
      verified=true;
      break;
     }
     await page.locator(`[data-action="chooseUpgrade"][data-id="${offer.id}"]`).click();
     selected.push(offer.id);
    }else await page.evaluate(()=>advanceTime(250));
   }
   assert.equal(verified,true,`Linked card not offered through normal journey: ${selected.join(', ')}`);
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS live upgrade: ${selected.join(' → ')}, four blades, guide visible, motion continues`);
   await page.close();
   const trial=await browser.newPage({viewport:{width,height:844}}),trialErrors=[];
   trial.on('pageerror',error=>trialErrors.push(error.message));
   await trial.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};});
   await trial.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&weaponTrial=sawLinked&v=saw-slide1');
   assert.match(await trial.locator('body').textContent(),/横向往复刀盘试演/);
   await trial.locator('[data-action="depart"]').click();
   const trialState=await trial.evaluate(()=>JSON.parse(render_game_to_text()));
   assert.equal(trialState.upgrades.sawReach,1);
   assert.equal(trialState.upgrades.sawLinked,1);
   assert.equal(await trial.locator('[data-saw-tier]').count(),4);
   const initialX=await trial.locator('[data-saw-tier]').first().getAttribute('data-saw-x');
   await trial.evaluate(()=>advanceTime(125));
   assert.notEqual(await trial.locator('[data-saw-tier]').first().getAttribute('data-saw-x'),initialX);
   await trial.screenshot({path:`output/saw-linked-trial-${width}.png`});
   assert.deepEqual(trialErrors,[]);
   console.log(`${width} PASS direct in-game trial, normal combat and sliding blades`);
   await trial.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
