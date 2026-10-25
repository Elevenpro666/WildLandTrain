const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{for(const width of [320,390]){
 const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved');
 const snapshot=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
 await page.locator('[data-action="depart"]').click();let arrived=false,choices=0,arrivalSeen=false;
 for(let i=0;i<400;i++){
  const s=await snapshot();if(s.mode==='result')throw Error('Lost before station');
  if(s.choices?.length){await page.locator('[data-action="chooseUpgrade"]').first().click();choices++;}
  if(await page.locator('[data-action="sprint"]:enabled').count())await page.locator('[data-action="sprint"]').click();
  if(s.journey.phase==='arrival'){arrivalSeen=true;assert.equal(await page.locator('.station-screen[inert]').count(),1);}
  if(s.journey.stage===2&&s.mode==='station'){arrived=true;break;}
  await page.evaluate(()=>advanceTime(250));
 }
 assert.ok(arrived);assert.ok(arrivalSeen);
 const station=await snapshot(),growth=station.journey.growth;
 await page.evaluate(()=>advanceTime(2000));assert.equal((await snapshot()).cash,station.cash,'arrival reward once');
 // 原选中车厢已满：购入装备应进周转，不自动替换旧装备。
 await page.locator('[data-action="buyModule"][data-key="arc"]').click();const overflow=await snapshot();
 const loose=overflow.equipment.find(e=>e.key==='arc'&&e.carrier===null);assert.ok(loose);
 assert.equal(overflow.cash,station.cash-12);
 await page.locator('[data-action="buyCart"]').click();const bought=await snapshot();
 assert.equal(bought.cash,overflow.cash-30);assert.equal(bought.carriers.length,station.carriers.length+1);
 const cart=bought.carriers.find(c=>!station.carriers.some(old=>old.id===c.id));
 await page.locator(`[data-action="select"][data-id="${cart.id}"]`).click();
 await page.locator(`[data-action="inspect"][data-id="${loose.id}"]`).click();
 await page.locator('[data-action="move"]').click();const equipped=await snapshot();
 assert.ok(equipped.equipment.some(e=>e.carrier===cart.id&&e.key==='arc'));
 assert.equal(equipped.cash,bought.cash);assert.equal(equipped.equipment.find(e=>e.id===loose.id).carrier,cart.id);
 await page.screenshot({path:__dirname+`/roundtrip-station-${width}.png`});
 await page.locator('[data-action="depart"]').click();const next=await snapshot();
 assert.equal(next.mode,'battle');assert.equal(next.journey.stage,2);assert.equal(next.hp,next.maxHp);
 assert.deepEqual(next.upgrades,growth.upgrades);assert.equal(next.level,growth.level);
 assert.equal(next.cars.length,equipped.carriers.length);assert.ok(next.weapons.some(e=>e.carrier===cart.id&&e.key==='arc'));
 await page.evaluate(()=>advanceTime(300));await page.screenshot({path:__dirname+`/roundtrip-depart-${width}.png`});
 assert.deepEqual(errors,[]);console.log({width,result:'PASS station roundtrip',choices,cars:next.cars.length,level:next.level});await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
