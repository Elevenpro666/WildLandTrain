const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const {approvedScorpion}=await import('./src/presentation/approved-art.mjs');
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=foreground-only1');
   await page.locator('[data-action="depart"]').click();
   const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   let hit=null;
   for(let i=0;i<100;i++){
    const current=await state(),enemy=current.enemies.find(e=>e.id===24);
    if(enemy?.knockAge>=.55&&enemy.knockAge<.68){hit=current;break;}
    await page.evaluate(()=>advanceTime(40));
   }
   assert.ok(hit,'the selected scorpion should still be knocked away');
   assert.equal(hit.sprint.speedScene,500);
   assert.equal(await page.locator('[data-screen-crack]').count(),0,'the screen crack must be absent');
   assert.equal(await page.locator('[data-foreground-scorpion]').count(),1,'the foreground scorpion must appear');
   assert.equal(approvedScorpion(hit.enemies.find(e=>e.id===24),hit),'','the selected scorpion must not be drawn twice');
   await page.screenshot({path:`output/foreground-only-${width}.png`});
   await page.evaluate(()=>advanceTime(1000));
   assert.equal(await page.locator('[data-screen-impact]').count(),0);
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS foreground scorpion without crack or duplicate world sprite; overlay expires`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
