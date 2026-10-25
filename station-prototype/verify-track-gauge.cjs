const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[],consoleProblems=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(['error','warning'].includes(message.type()))consoleProblems.push(`${message.type()}: ${message.text()}`);});
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&platformArt=carV1&weaponTrial=sawLinked&v=track-gauge1');
  await page.locator('[data-action="depart"]').click();
  await page.evaluate(()=>advanceTime(500));
  const geometry=await page.evaluate(()=>{
   const track=document.querySelector('[data-approved-track]');
   const wheelCenters=[...document.querySelectorAll('[data-car-wheel="c1"]')].map(wheel=>Number(wheel.getAttribute('x'))+Number(wheel.getAttribute('width'))/2);
   return {left:Number(track.dataset.trackLeft),right:Number(track.dataset.trackRight),gauge:Number(track.dataset.trackGauge),wheelLeft:Math.min(...wheelCenters),wheelRight:Math.max(...wheelCenters)};
  });
  assert.equal(geometry.gauge,60);
  assert.ok(Math.abs(geometry.left-geometry.wheelLeft)<=3,`left wheel tread does not cover rail: ${JSON.stringify(geometry)}`);
  assert.ok(Math.abs(geometry.right-geometry.wheelRight)<=3,`right wheel tread does not cover rail: ${JSON.stringify(geometry)}`);
  assert.deepEqual(errors,[]);assert.deepEqual(consoleProblems,[]);
  await page.screenshot({path:`output/track-gauge-${width}.png`});
  console.log(`${width} PASS rail centers ${geometry.left}/${geometry.right}, car wheel centers ${geometry.wheelLeft}/${geometry.wheelRight}`);
  await page.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
