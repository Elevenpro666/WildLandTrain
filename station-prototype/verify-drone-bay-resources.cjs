const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/mount-fit-review.html?case=car3drone&platformArt=carV1&capture=1&v=drone-resource1');
  assert.equal(await page.locator('[data-mount="drone"]').count(),3);
  assert.equal(await page.locator('[data-drone-independent="true"]').count(),3);
  assert.equal(await page.locator('[data-drone-base-art="v1"]').count(),3);
  assert.equal(await page.locator('[data-drone-door-art="v1"]').count(),3);
  const resources=await page.evaluate(async()=>Promise.all([...document.querySelectorAll('[data-drone-base-art],[data-drone-door-art]')].map(async node=>{
   const image=new Image();image.src=node.getAttribute('href');await image.decode();return {src:image.src,w:image.naturalWidth,h:image.naturalHeight};
  })));
  assert.equal(resources.length,6);assert.ok(resources.every(item=>item.w>0&&item.h>0));
  const bases=await page.locator('[data-drone-base]').evaluateAll(nodes=>nodes.map(node=>({x:Number(node.getAttribute('x')),y:Number(node.getAttribute('y')),w:Number(node.getAttribute('width')),h:Number(node.getAttribute('height'))})));
  assert.ok(bases.every(item=>item.w===18&&item.h===20));
  for(let i=0;i<bases.length;i++)for(let j=i+1;j<bases.length;j++)assert.ok(bases[i].x+bases[i].w<=bases[j].x||bases[j].x+bases[j].w<=bases[i].x||bases[i].y+bases[i].h<=bases[j].y||bases[j].y+bases[j].h<=bases[i].y,'独立底座不得叠合');
  assert.deepEqual(errors,[]);
  console.log('PASS: 三座无人机舱分别加载底座和舱门资源，18×20 B底座互不叠合，无页面错误。');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
