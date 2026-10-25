const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/mount-fit-review.html?case=carSawBoost&platformArt=carV1&mountTrial=rearBank&boostArt=base&weaponTrial=sawLinked&sprintMoment=1&capture=1&v=saw-lateral-mix1');
  const state=JSON.parse(await page.evaluate(()=>render_game_to_text()));
  assert.equal(state.upgrades.sawReach,1);assert.equal(state.upgrades.sawLinked,1);
  assert.equal(state.visibleMounts.sawDiscs,2);assert.equal(state.visibleMounts.boost,2);
  assert.equal(await page.locator('[data-saw-hollow="true"]').count(),2);
  assert.equal(await page.locator('[data-saw-support-art="root"]').count(),2);
  assert.equal(await page.locator('[data-saw-support-art="slider"]').count(),2);
  const artLoaded=await page.evaluate(async()=>Promise.all([...document.querySelectorAll('[data-saw-support-art]')].map(async node=>{
   const image=new Image();image.src=node.getAttribute('href');await image.decode();return image.naturalWidth>0&&image.naturalHeight>0;
  })));
  assert.ok(artLoaded.every(Boolean),'中空支架分件资源必须解码');
  const frames=[];
  for(let step=0;step<12;step++){
   const sample=await page.evaluate(()=>{
    const discs=[...document.querySelectorAll('[data-saw-tier]')].map(n=>({x:Number(n.dataset.sawX),y:Number(n.dataset.sawY)}));
    const boosters=[...document.querySelectorAll('[data-boost-design="rear-bank"]')].map(n=>{
     const [,x,y]=n.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/);
     return {x:Number(x),y:Number(y)};
    });
    return {discs,boosters};
   });
   assert.equal(sample.discs.length,2);assert.equal(sample.boosters.length,2);
   assert.ok(sample.discs.every(d=>d.y===370),'横向升级不应改变纵向刀盘中心');
   assert.ok(sample.discs.every(d=>d.y+22.5+2<=sample.boosters[0].y-6),'刀盘与P位必须留2 B静态间隙');
   assert.ok(sample.discs.every(d=>Math.abs(d.x-210)+22.5<=90.001),'横向扫掠最外缘不得超过90 B');
   frames.push(sample);
   if(step===0||step===5)await page.screenshot({path:`output/saw-lateral-mix-${step}-390.png`});
   await page.evaluate(()=>advanceTime(60));
  }
  const extents=frames.map(frame=>Math.abs(frame.discs[0].x-210));
  assert.ok(Math.max(...extents)-Math.min(...extents)>15,'刀盘必须有清楚的横向行程');
  assert.deepEqual(errors,[]);
  console.log('390 PASS 横向扫掠、双刀盘数量、同厢双助推器2 B理论净空、无页面错误');
  await page.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
