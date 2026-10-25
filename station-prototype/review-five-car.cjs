const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch();
 const out=path.join(__dirname,'output','five-car-preview');
 fs.mkdirSync(out,{recursive:true});
 try{
  for(const [width,height] of [[320,568],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4186/');
   const result=await page.evaluate(async()=>{
    const {createBattle}=await import('./src/game/battle.mjs');
    const {battleView}=await import('./src/presentation/battle.mjs');
    const carriers=[{id:'head'},...Array.from({length:5},(_,i)=>({id:`c${i+1}`,level:1}))];
    const battle=createBattle({carriers,equipment:[]});
    const snapshot=battle.snapshot();
    snapshot.t=10;snapshot.paused=true;snapshot.enemies=[];snapshot.sprintStarts=[0];
    snapshot.sprint.active=false;snapshot.invincible=false;
    document.body.className='battle-mode';
    const app=document.querySelector('#app');app.className='battle-mode';app.innerHTML=battleView(snapshot);
    return {cars:snapshot.cars.length,positions:snapshot.cars.map(car=>car.y)};
   });
   assert.equal(result.cars,6);
   await page.locator('.battle-field > svg').evaluate(svg=>svg.setAttribute('viewBox','0 65 420 825'));
   await page.screenshot({path:path.join(out,`five-car-${width}.png`)});
   const boxes=await page.locator('[data-train-body]').evaluateAll(nodes=>nodes.map(node=>{
    const box=node.getBoundingClientRect();return {top:box.top,bottom:box.bottom,width:box.width};
   }));
   assert.equal(boxes.length,6);assert.deepEqual(errors,[]);
   fs.writeFileSync(path.join(out,`metrics-${width}.json`),JSON.stringify({viewport:{width,height},positions:result.positions,boxes},null,2));
   await page.close();
  }
  console.log('PASS five-car visual fixture captured at 320/390; no product cap changed');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
