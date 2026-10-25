const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
async function decoded(p){await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode();}));});}
(async()=>{const b=await chromium.launch();try{for(const width of [320,390]){
 const p=await b.newPage({viewport:{width,height:width===320?568:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=buyCart]').click();await p.locator('[data-action=buyCart]').click();await p.locator('[data-action=buyCart]').click();await decoded(p);
 assert.equal(await p.locator('[data-train-body=head]').count(),1);assert.equal(await p.locator('[data-train-body=car]').count(),5);
 await p.screenshot({path:`output/train-full-station-${width}.png`});
 await p.locator('[data-action=depart]').click();await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});advanceTime(1800)});await decoded(p);
 assert.equal(await p.locator('[data-train-body]').count(),6);
 const bounds=await p.evaluate(()=>{const f=document.querySelector('.battle-field').getBoundingClientRect();return [...document.querySelectorAll('[data-train-body]')].map(e=>{const r=e.getBoundingClientRect();return r.y>=f.y-1&&r.bottom<=f.bottom+1;});});assert.ok(bounds.every(Boolean));
 await p.screenshot({path:`output/train-full-battle-${width}.png`});
 assert.equal(await p.locator('[data-action=pauseBattle],[data-action=returnStation]').count(),0);
 const snapshot=await p.evaluate(()=>render_game_to_text());assert.ok(JSON.parse(snapshot).cars.length===6);
 assert.deepEqual(errors,[]);await p.close();
 }console.log('PASS train source decode, six bodies, 320/390 battle bounds and current single-control HUD');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
