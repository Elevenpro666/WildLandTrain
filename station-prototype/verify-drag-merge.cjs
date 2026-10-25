const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4186/');
   const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
   const drag=async(a,b)=>{
    const x=await page.locator(`.rail [data-id="${a}"]`).boundingBox();
    const y=await page.locator(`.rail [data-id="${b}"]`).boundingBox();
    await page.mouse.move(x.x+x.width/2,x.y+x.height/2);await page.mouse.down();
    await page.mouse.move(y.x+y.width/2,y.y+y.height/2,{steps:12});await page.mouse.up();
   };
   await drag('c1','head');assert.equal((await state()).confirmation,null);
   await drag('c1','c2');assert.equal((await state()).confirmation.type,'merge');
   await page.screenshot({path:`output/drag-merge-${width}.png`});
   await page.locator('[data-action="cancel"]').click();assert.equal((await state()).carriers.length,3);
   await drag('c1','c2');await page.locator('[data-action="confirm"]').click();
   const s=await state();assert.equal(s.carriers.length,2);assert.equal(s.carriers.find(c=>c.level===2).capacity,6);
   assert.equal(s.equipment.filter(e=>e.carrier===null).length,4);assert.equal(s.cash,90);
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: 320/390 拖动合成、取消、车头拒绝、装备保留');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
