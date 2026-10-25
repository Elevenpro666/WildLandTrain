const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=boss-art1');
  const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  let found=false;
  for(let i=0;i<1800;i++){
   const s=await state();
   if(s.mode==='result')break;
   if(s.mode==='station'){
    await page.locator('[data-action="select"][data-id="head"]').click();
    for(let n=0;n<3;n++){const q=await state(),head=q.carriers.find(c=>c.id==='head');if(head.capacity-head.used<1||q.cash<12)break;await page.locator('[data-action="buyModule"][data-key="arc"]').click();}
    await page.locator('[data-action="depart"]').click();
   }else if(s.choices?.length)await page.locator('[data-action="chooseUpgrade"]').first().click();
   else if(s.boss){
    const boss=page.locator('[data-enemy="boss"][data-art="iron-butcher-v2-candidate"]');
    assert.equal(await boss.count(),1);
    assert.equal(await boss.locator('image').evaluate(el=>el.href.baseVal.endsWith('iron-butcher-boss-v2-candidate.png')),true);
    const bounds=await boss.boundingBox();
    if(bounds&&bounds.y>100&&bounds.y<650){await page.screenshot({path:`output/boss-art1-${width}.png`});found=true;break;}
   }else if(await page.locator('[data-action="sprint"]:enabled').count())await page.locator('[data-action="sprint"]').click({timeout:1000}).catch(async e=>{if(await page.locator('[data-action="sprint"]:enabled').count())throw e;});
   await page.evaluate(()=>advanceTime(250));
  }
  assert.ok(found,`Boss did not appear at ${width}`);assert.deepEqual(errors,[]);
  console.log(`${width} PASS new Boss asset in real battle`);await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
