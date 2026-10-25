const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=departure-crowd1');
   await page.locator('[data-action="depart"]').click();
   const state=()=>page.evaluate(()=>{
    const head=document.querySelector('[data-train-body="head"]'),camera=document.querySelector('[data-camera="departure"]');
    return {s:JSON.parse(render_game_to_text()),gate:!!document.querySelector('[data-station-exit]'),offset:Number(camera?.getAttribute('transform')?.match(/translate\(0,(-?\d+(?:\.\d+)?)\)/)?.[1]),headTop:head?.getBoundingClientRect().top,monsters:document.querySelectorAll('[data-enemy="scorpion"]').length,flight:[...document.querySelectorAll('[data-knock-art]')].map(node=>({ground:Number(node.getAttribute('data-ground-y')),body:Number(node.getAttribute('data-flying-y'))}))};
   });
   const sample=async(label)=>{const value=await state();await page.screenshot({path:__dirname+`/station-exit-${label}-${width}.png`});return value;};
   const advanceTo=async(seconds)=>{
    for(let i=0;i<170;i++){
     const current=await state();if(current.s.t>=seconds)return current;
     if(current.s.choices?.length)await page.locator('[data-action="chooseUpgrade"]').first().click();
     else await page.evaluate(()=>advanceTime(100));
    }
    throw Error(`Cannot advance battle to ${seconds}s`);
   };
   const start=await sample('start');
   assert.ok(start.s.t<.1);
   assert.equal(start.gate,true);
   assert.equal(start.s.enemies.length,26,'twenty-six ordinary scorpions should fill the extended departure');
   assert.ok(start.monsters>=24,'most of the extended crowd should be visible before impact');
   assert.ok(start.offset>600);
   const passing=await advanceTo(.25);await sample('passing');
   assert.ok(passing.s.t>.2,'battle must run immediately, not pause for an intro');
   assert.ok(passing.offset<start.offset-100,'train must already be at 500 SU/s at the gate');
   const duration=start.s.sprint.distance/start.s.sprint.speedMetres;
   const top=await advanceTo(1.5);await sample('top');
   assert.equal(top.gate,false);
   assert.ok(top.headTop<passing.headTop-300,`train did not shoot toward top: ${passing.headTop} -> ${top.headTop}`);
   assert.ok(top.s.sprint.remaining>0,'train must reach the top before the dash runs out');
   const rear=await advanceTo(2.5);await sample('rear-flight');
   assert.equal(rear.s.knocked,26,'the full departure formation must be hit');
   const recovered=await advanceTo(duration+3.6);await sample('recovered');
   assert.ok(recovered.headTop>top.headTop+60,`camera did not catch slowing train: ${top.headTop} -> ${recovered.headTop}`);
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS immediate sprint, gate, crowd, top, camera catch-up`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
