const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {createSprint}=await import('./src/game/sprint.mjs');
 const sprint=createSprint(2,1);assert.equal(sprint.snapshot().distance,540);
 assert.equal(sprint.release(),false);sprint.step(sprint.snapshot().distance/sprint.snapshot().speedMetres);assert.equal(sprint.snapshot().phase,'decelerating');sprint.step(1.2);assert.equal(sprint.snapshot().active,false);
 sprint.step(8);assert.equal(sprint.snapshot().energy,100);sprint.step(2);assert.equal(sprint.snapshot().active,false);
 assert.equal(sprint.release(),true);assert.equal(sprint.release(),false);
 assert.throws(()=>createSprint(0));const before=sprint.snapshot();sprint.step(NaN);assert.deepEqual(sprint.snapshot(),before);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:850}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4191/station-prototype/?art=approved&v=scene-speed1');const click=a=>p.locator(`[data-action="${a}"]`).click();const state=async()=>JSON.parse(await p.evaluate(()=>render_game_to_text()));
 await p.locator('summary').click();await click('quality');await p.locator('[data-action="select"][data-id="head"]').click();await p.locator('[data-key="boost"]').click();await click('depart');
 assert.equal((await state()).sprint.distance,540);assert.equal((await state()).invincible,true);
 await p.evaluate(()=>advanceTime(4000));assert.equal((await state()).hp,300);
 for(let i=0;i<200&&(await state()).sprint.energy<100;i++){
  const s=await state();if(s.choices.length)await p.locator('[data-action="chooseUpgrade"]').first().click();
  await p.evaluate(()=>advanceTime(100));
 }
 assert.equal((await state()).sprint.energy,100);assert.equal((await state()).invincible,false);
 assert.equal(await p.locator('[data-action="sprint"]').isEnabled(),true);
 await click('sprint');assert.equal((await state()).invincible,true);assert.equal((await state()).sprint.energy,0);
 await p.evaluate(()=>advanceTime(650));
 const cameraTransform=await p.locator('[data-camera="departure"]').getAttribute('transform');
 assert.equal(cameraTransform,'translate(0,0)','manual sprint camera keeps the train framed');
 const headGeometry=await p.locator('[data-train-body="head"]').evaluate(head=>{
  const box=head.getBBox(),matrix=head.getScreenCTM(),field=document.querySelector('.battle-field').getBoundingClientRect();
  const a=new DOMPoint(box.x,box.y).matrixTransform(matrix),b=new DOMPoint(box.x+box.width,box.y+box.height).matrixTransform(matrix);
  const body={top:Math.min(a.y,b.y),bottom:Math.max(a.y,b.y),left:Math.min(a.x,b.x),right:Math.max(a.x,b.x)};
  return {body,field:{top:field.top,bottom:field.bottom,left:field.left,right:field.right},visible:body.bottom>field.top&&body.top<field.bottom&&body.right>field.left&&body.left<field.right};
 });
 await p.screenshot({path:'output/sprint-verified.png',fullPage:true});
 assert.equal(headGeometry.visible,true,`train head remains inside the battle viewport during manual sprint: ${JSON.stringify(headGeometry)}`);
 assert.deepEqual(errors,[]);await b.close();console.log('PASS sprint distance, invulnerability, charge, manual release; no page errors');
})().catch(e=>{console.error(e);process.exit(1)});
