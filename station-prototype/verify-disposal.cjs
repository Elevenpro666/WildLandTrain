const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{
const p=await browser.newPage({viewport:{width:320,height:568}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4186');const click=s=>p.locator(s).click();const state=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
await click('[data-action=select][data-id=c1]');await p.screenshot({path:'output/cart-dialog-320.png'});
const box=await p.locator('[role=dialog]').boundingBox();assert.ok(box.y>=0&&box.y+box.height<=568);
await click('[data-action=sellCart]');await click('[data-action=cancel]');assert.equal((await state()).carriers.length,3);
await click('[data-action=sellCart]');await click('[data-action=confirm]');let s=await state();assert.equal(s.cash,102);assert.equal(s.equipment.length,5);assert.equal(s.equipment.filter(e=>!e.carrier).length,2);
await click('[data-action=select][data-id=c2]');await click('[data-action=select][data-id=c2]');await click('[data-action=discardCart]');await click('[data-action=confirm]');s=await state();assert.equal(s.carriers.length,1);assert.equal(s.cash,102);assert.equal(s.equipment.length,5);
// 通过正常UI清空装备，验证真实战败而非注入结果。
for(let i=0;i<5;i++){await p.locator('[data-action=inspect]').first().click();await click('[data-action=discard]');await click('[data-action=confirm]');}
await click('[data-action=depart]');await p.evaluate(()=>advanceTime(100000));s=await state();assert.equal(s.mode,'result');assert.equal(s.journey.phase,'lost');assert.equal(s.journey.rewardTotal,0);await p.screenshot({path:'output/journey-defeat-320.png'});
await click('[data-action=reset]');assert.equal((await state()).cash,90);assert.equal((await state()).equipment.length,5);assert.deepEqual(errors,[]);console.log('PASS cart sell/cancel/discard preserves equipment, small dialog, actual defeat, no reward and restart');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
