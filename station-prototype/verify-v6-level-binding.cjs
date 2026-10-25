const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&platformArt=carV1&v=v6-level-binding1');
  const state=async()=>JSON.parse(await page.evaluate(()=>render_game_to_text()));
  const cartArt=async(id)=>page.locator(`[data-action="select"][data-id="${id}"] [data-art-id]`).getAttribute('data-art-id');
  const cartSlots=id=>page.locator(`[data-action="select"][data-id="${id}"] [data-t-slot]`).count();
  const sell=async id=>{
   const current=await state(),equipment=current.equipment.find(item=>item.id===id);
   if(equipment?.carrier&&current.selected!==equipment.carrier)await page.locator(`[data-action="select"][data-id="${equipment.carrier}"]`).click();
   await page.locator(`[data-action="inspect"][data-id="${id}"]`).click();
   await page.locator('[data-action="sell"]').click();
   await page.locator('[data-action="confirm"]').click();
  };
  const merge=async(a,b)=>{
   const current=await state();
   if(current.selected!==a)await page.locator(`[data-action="select"][data-id="${a}"]`).click();
   await page.locator(`[data-action="select"][data-id="${a}"]`).click();
   await page.locator(`[data-action="mergePair"][data-id="${a}"][data-to="${b}"]`).click();
   await page.locator('[data-action="confirm"]').click();
  };

  let s=await state();
  assert.equal(s.carriers.find(c=>c.id==='c1').capacity,4);
  assert.equal(await cartArt('c1'),'train.car.level1V6');
  assert.equal(await cartSlots('c1'),4);
  for(const id of ['e2','e4','e5'])await sell(id);
  await page.locator('[data-action="buyCart"]').click();
  await page.locator('[data-action="buyCart"]').click();
  s=await state();
  assert.equal(s.carriers.length,5);
  assert.deepEqual(s.carriers.filter(c=>c.level>0).map(c=>c.capacity),[4,4,4,4]);

  await merge('c1','c2');
  s=await state();
  assert.equal(s.carriers.find(c=>c.id==='c1').capacity,6);
  assert.equal(await cartArt('c1'),'train.car.level2V6');
  assert.equal(await cartSlots('c1'),6);
  await merge('c10','c11');
  await merge('c1','c10');
  s=await state();
  assert.equal(s.carriers.length,2);
  assert.equal(s.carriers.find(c=>c.id==='c1').level,3);
  assert.equal(s.carriers.find(c=>c.id==='c1').capacity,8);
  assert.equal(await cartArt('c1'),'train.car.level3V6');
  assert.equal(await cartSlots('c1'),8);
  await page.screenshot({path:'output/v6-level-binding-station-390.png'});

  await page.locator('[data-action="depart"]').click();
  s=await state();
  assert.equal(s.mode,'battle');
  assert.equal(s.cars.find(c=>c.id==='c1').level,3);
  const body=page.locator('[data-train-body="car"]').first();
  assert.equal(await body.getAttribute('data-art-id'),'train.car.level3V6');
  assert.equal(await body.getAttribute('data-mount-layout'),'level3-v6');
  assert.equal(await page.locator('[data-car-t-slot-layer][data-slot-level="3"] [data-t-slot]').count(),8);
  await page.screenshot({path:'output/v6-level-binding-battle-390.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS V6 car levels bind to L1/L2/L3 art and 4/6/8 capacity; L3 persists into battle');
  await page.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
