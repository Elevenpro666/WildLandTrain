const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/mount-fit-review.html?case=car4boost&platformArt=carV1&mountTrial=rearBank&sprintMoment=1&capture=1&v=boost-resource1');
  assert.equal(await page.locator('[data-boost-bank-frame-art="v1"]').count(),1);
  assert.equal(await page.locator('[data-boost-design="rear-bank"]').count(),4);
  assert.equal(await page.locator('[data-boost-nozzle-art="base-v1"]').count(),4);
  assert.equal(await page.locator('[data-boost-heat="true"]').count(),4);
  const resources=await page.evaluate(async()=>Promise.all([...document.querySelectorAll('[data-boost-bank-frame-art],[data-boost-nozzle-art]')].map(async node=>{
   const image=new Image();image.src=node.getAttribute('href');await image.decode();return {w:image.naturalWidth,h:image.naturalHeight};
  })));
  assert.equal(resources.length,5);assert.ok(resources.every(item=>item.w>0&&item.h>0));
  const state=JSON.parse(await page.evaluate(()=>render_game_to_text()));
  assert.equal(state.visibleMounts.boost,4);
  assert.deepEqual(errors,[]);
  console.log('PASS: 四孔安装梁1件、基础短喷口4件分别加载，四助推与四喷流存在，无页面错误。');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
