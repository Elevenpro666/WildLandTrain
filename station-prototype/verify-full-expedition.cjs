const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{for(const width of [320,390]){
 const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved'+(process.argv.includes('--speed-300')?'&speedTrial=300':'')+'&v=sprint-default500');
 const snap=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));const initial=await snap();
 let bossSeen=false,result=null;
 for(let i=0;i<1800;i++){
  const s=await snap();
  if(s.mode==='result'){result=s;break;}
  if(s.mode==='station'){
   await page.locator('[data-action="select"][data-id="head"]').click();
   for(let n=0;n<3;n++){const q=await snap(),head=q.carriers.find(c=>c.id==='head');if(head.capacity-head.used<1||q.cash<12)break;await page.locator('[data-action="buyModule"][data-key="arc"]').click();}
   await page.locator('[data-action="depart"]').click();
  }else if(s.choices?.length)await page.locator('[data-action="chooseUpgrade"]').first().click();
  else if(s.boss){bossSeen=true;if(await page.locator('[data-action="sprint"]').count())assert.equal(await page.locator('[data-action="sprint"]').isEnabled(),false);}
  else if(!s.done&&await page.locator('[data-action="sprint"]:enabled').count())await page.locator('[data-action="sprint"]').click({timeout:1000}).catch(async error=>{if(await page.locator('[data-action="sprint"]:enabled').count())throw error;});
  await page.evaluate(()=>advanceTime(250));
 }
 assert.ok(result);assert.ok(bossSeen);assert.equal(result.journey.phase,'won');assert.equal(result.journey.completed.length,3);
 await page.screenshot({path:__dirname+`/expedition-won-${width}.png`});
 await page.locator('[data-action="reset"]').click();let reset=await snap();assert.equal(reset.cash,initial.cash);assert.equal(reset.journey.stage,1);assert.equal(reset.journey.growth,null);assert.deepEqual(reset.equipment,initial.equipment);
 // 使用正常出售界面清空武器，验证真正失败及重开，禁止直接改HP。
 for(const e of reset.equipment){
  await page.locator(`[data-action="select"][data-id="${e.carrier}"]`).click();
  if(await page.locator('[data-action="closeItem"]').count())await page.locator('[data-action="closeItem"]').click();
  await page.locator(`[data-action="inspect"][data-id="${e.id}"]`).click();
  await page.locator('[data-action="sell"]').click();await page.locator('[data-action="confirm"]').click();
 }
 await page.locator('[data-action="depart"]').click();
 for(let i=0;i<800&&(await snap()).mode!=='result';i++)await page.evaluate(()=>advanceTime(250));
 assert.equal((await snap()).journey.phase,'lost');await page.screenshot({path:__dirname+`/expedition-lost-${width}.png`});
 await page.locator('[data-action="reset"]').click();reset=await snap();assert.equal(reset.cash,initial.cash);assert.deepEqual(reset.equipment,initial.equipment);assert.equal(reset.journey.growth,null);
 await page.locator('[data-action="depart"]').click();assert.equal((await snap()).hp,300);assert.deepEqual(errors,[]);
 console.log({width,result:'PASS 3-stage win / Boss lock / sell-to-fail / clean restart'});await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
