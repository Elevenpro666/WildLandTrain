const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=pacing1');
   await page.locator('[data-action="depart"]').click();
   const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   const samples=[];
   for(const time of [0,.7,2,3.2,5,7,8]){
    let current=await state();
    while(current.t<time-.01){
     if(current.choices?.length)await page.locator('[data-action="chooseUpgrade"]').first().click();
     else await page.evaluate(ms=>advanceTime(ms),Math.min(100,(time-current.t)*1000));
     current=await state();
    }
    samples.push({t:+current.t.toFixed(2),speed:current.sprint.speedScene,phase:current.sprint.phase,wave:current.wave.phase,knocked:current.knocked,enemies:current.enemies.length,hp:current.hp});
    if([.7,3.2,5,8].includes(time))await page.screenshot({path:`output/default500-pacing-${width}-${time}.png`});
   }
   assert.ok(samples[1].knocked>=7&&samples[1].knocked<26,'departure crowd should continue past .7s');
   assert.equal(samples[2].knocked,26,'departure crowd should be cleared within about 2s');
   assert.equal(samples[3].phase,'charging','invulnerability should end before the first assault');
   assert.equal(samples[3].wave,'warning','warning should remain visible after the dash');
   assert.equal(samples[4].wave,'assault','first assault should begin by 5s');
   assert.ok(samples[4].enemies>0,'new enemies should be visible by 5s');
   assert.deepEqual(errors,[]);
   console.log(width,JSON.stringify(samples));
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
