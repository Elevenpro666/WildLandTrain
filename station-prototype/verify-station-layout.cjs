const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const [width,height] of [[320,568],[1280,720]]){
 await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:4186');await p.locator('[data-action=buyCart]').click();await p.locator('[data-action=buyCart]').click();
 const frame=await p.locator('#app').boundingBox(),dock=await p.locator('.station-dock').boundingBox();assert.ok(Math.abs(frame.width/frame.height-9/16)<.001);assert.ok(dock.y>frame.y+frame.height*.5);
 await p.locator('.station-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);assert.deepEqual(await p.locator('.station-dock').boundingBox(),dock);
 assert.equal(await p.locator('.station-crowd').count(),0);
 await p.locator('[data-action=select][data-id=head]').click();
 assert.equal(await p.locator('.station-scroll').evaluate(e=>e.scrollTop),0);
 assert.ok((await p.locator('[data-equipment-owner=head]').innerText()).includes('电弧'));
 await p.locator('[data-action=select][data-id=c1]').click();
 assert.equal(await p.locator('[data-equipment-owner=c1] .item').count(),2);
 assert.equal(await p.evaluate(()=>scrollY),0);assert.equal(await p.locator('.rail button').count(),5);
 const cars=await p.locator('.rail button').all();for(const car of cars){const r=await car.boundingBox();assert.ok(r.width>=44&&r.x>=frame.x&&r.x+r.width<=frame.x+frame.width+1);}
 await p.locator('.station-scroll').evaluate(e=>e.scrollTop=0);await p.screenshot({path:`output/station-layout-${width}.png`});
 await p.locator('[data-action=depart]').click();const battle=await p.locator('#app').boundingBox();assert.deepEqual(battle,frame);
 await p.locator('[data-action=returnStation]').click();assert.deepEqual(await p.locator('#app').boundingBox(),frame);
}assert.deepEqual(errors,[]);await b.close();console.log('PASS station frame, fixed dock, five cars, internal scroll and battle matching');})().catch(e=>{console.error(e);process.exit(1)});
