const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[320,568],[390,844],[420,850],[1280,720]]){
  await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:4186');
  await p.locator('[data-action="buyCart"]').click();await p.locator('[data-action="buyCart"]').click();await p.locator('[data-action="buyCart"]').click();
  await p.locator('[data-action="depart"]').click();await p.evaluate(()=>advanceTime(500));
  const layout=await p.evaluate(()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,y:scrollY,buttons:[...document.querySelectorAll('.battle-controls button')].map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,left:r.left,right:r.right};}),cars:JSON.parse(render_game_to_text()).cars.length}));
  assert.ok(layout.height<=height+1);assert.ok(layout.width<=width);assert.equal(layout.y,0);assert.equal(layout.cars,6);
  const frame=await p.locator('#app').boundingBox();assert.ok(Math.abs(frame.width-Math.min(390,width))<1);
  assert.ok(Math.abs(frame.height-height)<1);
  assert.ok(Math.abs(frame.x-(width-frame.width)/2)<1&&Math.abs(frame.y)<1);
  assert.equal(layout.buttons.length,1,'battle keeps only the sprint action');
  for(const r of layout.buttons){assert.ok(r.height>=44&&r.top>=0&&r.bottom<=height&&r.left>=0&&r.right<=width);}
  await p.screenshot({path:`output/layout-${width}.png`});
 }
 const mobile=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto('http://127.0.0.1:4186');await mobile.locator('[data-action="depart"]').click();
 const phone=await mobile.locator('#app').boundingBox();assert.equal(phone.width,390);assert.equal(phone.height,844);
 await mobile.screenshot({path:'output/layout-phone.png'});
 assert.deepEqual(errors,[]);await b.close();console.log('PASS full-height battle viewport, mobile actual viewport, head plus five cars, one sprint control');
})().catch(e=>{console.error(e);process.exit(1)});
