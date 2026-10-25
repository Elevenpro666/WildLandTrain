const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=boost-slots1');
  await page.locator('[data-action="select"][data-id="head"]').click();
  for(let i=0;i<3;i++)await page.locator('[data-action="buyModule"][data-key="boost"]').click();
  await page.locator('[data-action="depart"]').click();
  await page.evaluate(()=>advanceTime(1500));
  const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
  assert.equal((await read()).sprint.boosters,3);
  assert.equal((await read()).sprint.distance,660);
  const mounts=page.locator('[data-mount="boost"]');
  assert.equal(await mounts.count(),3);
  assert.equal(await page.locator('[data-mount-count]').filter({hasText:'×3'}).count(),0);
  const positions=await mounts.evaluateAll(nodes=>nodes.map(node=>({slot:node.dataset.boostSlot,x:node.getBoundingClientRect().x,width:node.getBoundingClientRect().width})));
  assert.deepEqual(positions.map(p=>p.slot),['1','2','3']);
  for(let i=1;i<positions.length;i++)assert.ok(positions[i].x>=positions[i-1].x+positions[i-1].width-1,'booster art must occupy a separate visual slot');
  assert.deepEqual(await mounts.evaluateAll(nodes=>nodes.map(node=>node.dataset.boostState)),['sprinting','sprinting','sprinting']);
  await page.screenshot({path:`output/boost-slots-sprinting-${width}.png`});
  await page.evaluate(()=>advanceTime(3000));
  const phase=(await read()).sprint.phase;
  assert.ok(['decelerating','charging'].includes(phase));
  assert.deepEqual(await mounts.evaluateAll(nodes=>nodes.map(node=>node.dataset.boostState)),[phase,phase,phase]);
  await page.screenshot({path:`output/boost-slots-later-${width}.png`});
  assert.deepEqual(errors,[]);
  console.log(`${width} PASS three separate booster slots, no count badge, sprint +360 and state sync`);
  await page.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
