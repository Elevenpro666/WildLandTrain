const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const [width,height] of [[320,568],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4186/');
   await page.locator('[data-action=depart]').click();
   assert.equal(await page.evaluate(async()=>{
    const original=document.querySelector('[data-action=sprint]');
    await new Promise(resolve=>setTimeout(resolve,120));
    return original===document.querySelector('[data-action=sprint]');
   }),true,'live rendering keeps the touch button node stable');
   // Keep the browser's real frame loop idle; advanceTime remains the single test clock.
   await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}));
   const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   assert.equal(await page.locator('.battle-controls button').count(),1);
   assert.equal(await page.locator('[data-action=sprint]').count(),1);
   assert.equal(await page.locator('[data-action=pauseBattle],[data-action=returnStation],.distance-hud,.battle-controls progress').count(),0);
   assert.equal(await page.locator('[data-route-node]').count(),5);
   assert.equal(await page.locator('[data-sprint-distance]').count(),1,'departure has distance feedback');
   let lootSeen=false;
   for(let i=0;i<320;i++){
    const s=await state();
    if(s.choices.length)await page.locator('[data-action=chooseUpgrade]').first().click();
    else await page.evaluate(()=>advanceTime(100));
    const next=await state();
    if(next.lootFeedback.length){lootSeen=true;assert.ok(await page.locator('[data-loot=experience]').count());assert.equal(await page.locator('[data-loot] text,[data-loot-summary]').count(),0);}
    if(next.sprint.energy>=100&&!next.invincible&&!next.choices.length)break;
   }
   assert.equal(lootSeen,true);
   const ready=await state();assert.equal(ready.sprint.energy,100);
   assert.equal(await page.locator('[data-sprint-distance]').count(),0,'departure distance hides before manual release');
   const button=page.locator('[data-action=sprint]');
   assert.equal(await button.getAttribute('data-state'),'ready');
   assert.equal(await button.evaluate(el=>el.style.getPropertyValue('--charge')),'100%');
   await page.screenshot({path:`output/minimal-hud-ready-${width}.png`});
   await page.evaluate(()=>{
    document.querySelector('[data-action=chooseUpgrade]')?.click();
    document.querySelector('[data-action=sprint]').click();
   });
   const released=await state();assert.equal(released.sprintStarts.length,2);
   assert.equal(await page.locator('[data-sprint-distance]').count(),0,'manual sprint has no distance feedback');
   assert.equal(await button.getAttribute('data-state'),'active');
   await page.evaluate(()=>advanceTime(500));
   assert.equal(await page.locator('[data-sprint-distance]').count(),0);
   assert.equal(await page.locator('.battle-controls button').count(),1);
   await page.screenshot({path:`output/minimal-hud-manual-${width}.png`});
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS 320/390 minimal HUD, icon-only loot, button charge, real manual sprint without distance');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
