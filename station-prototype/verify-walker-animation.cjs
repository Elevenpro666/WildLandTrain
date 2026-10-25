const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const {walkerView:w}=await import('./src/presentation/walker-view.mjs');
 const e=Object.freeze({id:2,x:0,y:0});
 assert.notEqual(w(e,0),w(e,.3));assert.equal(w(e,.3),w(e,.3));assert.match(w({...e,knock:1},.3),/data-walk-frame="0"/);
 const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:390,height:844}});await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();await p.locator('[data-action=pauseBattle]').click();
 const frames=()=>p.locator('[data-enemy=walker]').evaluateAll(es=>es.map(e=>e.getAttribute('data-walk-frame')));
 const before=await frames();assert.ok(before.length);await p.evaluate(()=>advanceTime(500));assert.deepEqual(await frames(),before);
 await p.screenshot({path:'output/walker-paused-390.png'});
 console.log('PASS walker frame, immutable input, knock and real pause');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
