const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

const base='http://127.0.0.1:4191/station-prototype/mount-fit-review.html';
const rows=[
  {id:'carSawBoost',count:2,slots:[[-27,55.5],[27,55.5]]},
  {id:'car4boost',count:4,slots:[[-27,55.5],[27,55.5],[-9,55.5],[9,55.5]]},
];

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const row of rows)for(const sprint of [false,true])for(const art of ['base','rocket']){
   const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   const url=`${base}?case=${row.id}&platformArt=carV1&mountTrial=rearBank&boostArt=${art}&capture=1&v=boost-rocket3${sprint?'&sprintMoment=1':''}`;
   await page.goto(url);
   await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
   const state=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
   assert.equal(state.case,row.id);
   const mounts=await page.locator('[data-boost-design="rear-bank"]').evaluateAll(nodes=>nodes.map(node=>{
    const transform=node.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/);
    const rect=node.querySelector('rect');
    return {x:Number(transform[1]),y:Number(transform[2]),w:Number(rect.getAttribute('width')),h:Number(rect.getAttribute('height')),heat:!!node.querySelector('[data-boost-heat]')};
   }));
   assert.equal(mounts.length,row.count);
   assert.equal(await page.locator(`[data-boost-art="${art}"]`).count(),row.count);
   assert.equal(await page.locator('[data-boost-rocket-bell]').count(),art==='rocket'?row.count:0);
   // Review train centers on x=210; c1/c2 logical centers are y=345/430.
   const cy=row.id==='car4boost'?430:345;
   assert.deepEqual(mounts.map(({x,y})=>[x-210,y-cy]),row.slots);
   assert.ok(mounts.every(m=>m.w===15&&m.h===12));
   assert.ok(mounts.every(m=>m.heat===sprint));
   // The rendering envelope stays on this car; neither its body nor local heat cue reaches the following car.
   const rearEdge=55.5+12/2,nextCarFront=85+26-(70*1038/776)/2;
   assert.ok(nextCarFront-rearEdge>=2,'尾部喷口应与后一车保留至少2 B实体净空');
   assert.equal(errors.length,0,errors.join('\n'));
   const output=path.resolve(__dirname,`output/rear-bank-${row.id}-${sprint?'sprint':'cruise'}-${art}-390.png`);
   await page.screenshot({path:output});
   if(sprint){
    for(const [step,elapsed] of [400,800,1400].entries()){
     await page.evaluate(ms=>window.advanceTime(ms),elapsed);
     assert.equal(await page.locator('[data-boost-design="rear-bank"]').count(),row.count,'跨冲刺时段的设备数不得变化');
     if(step===1)await page.screenshot({path:path.resolve(__dirname,`output/rear-bank-${row.id}-mid-${art}-390.png`)});
    }
   }
   console.log(`${row.id} ${sprint?'sprint':'cruise'} ${art} PASS ${output}`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
