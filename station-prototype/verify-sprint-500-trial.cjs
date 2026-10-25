const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const [{createBattle},{createTrain},{config},{sceneTravel}]=await Promise.all([
  import('./src/game/battle.mjs'),import('./src/game/train.mjs'),import('./config.mjs'),import('./src/game/scene-distance.mjs'),
 ]);
 const battle=createBattle(createTrain(config).snapshot(),1,{sprintProfileId:'impact500'});
 const first=battle.snapshot();
 assert.equal(first.enemies.length,26);
 assert.equal(first.sprint.speedScene,500);
 assert.equal(first.sprint.distance/first.sprint.speedMetres,1.92);
 const ys=first.enemies.map(e=>e.y);
 assert.ok(Math.max(...ys)-Math.min(...ys)>=880);
 assert.ok(Math.abs(sceneTravel(.7,[0],1.92,null,500)-350)<1e-8);
 for(let i=0;i<42;i++)battle.step(1/60);
 assert.ok(battle.snapshot().knocked>=7&&battle.snapshot().knocked<26,'the crowd must extend past the first .7s');
 for(let i=42;i<116;i++)battle.step(1/60);
 assert.equal(battle.snapshot().knocked,26);
 assert.equal(battle.snapshot().hp,first.hp);

 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=sprint-default500');
   await page.locator('[data-action="depart"]').click();
   const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   const start=await state();
   assert.equal(start.enemies.length,26);
   assert.equal(start.sprint.speedScene,500);
   await page.screenshot({path:__dirname+`/sprint-500-start-${width}.png`});
   await page.evaluate(()=>advanceTime(700));
   const crossed=await state();
   assert.ok(crossed.knocked>=7&&crossed.knocked<26);
   await page.evaluate(()=>advanceTime(1250));
   assert.equal((await state()).knocked,26);
   assert.equal(crossed.hp,300);
   await page.screenshot({path:__dirname+`/sprint-500-crossed-${width}.png`});
   await page.evaluate(()=>advanceTime(3400));
   const settled=await state();
   assert.equal(settled.sprint.phase,'charging');
   assert.equal(settled.invincible,false);
   await page.screenshot({path:__dirname+`/sprint-500-settled-${width}.png`});
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS 26 irregular scorpions across about 2s, 500 SU/s, deceleration and return`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
