const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {flyerView}=await import('./src/presentation/flyer-view.mjs');
 const e=Object.freeze({id:2,x:150,y:200,fly:true});
 assert.notEqual(flyerView(e,0),flyerView(e,.17));
 assert.equal(flyerView(e,.17),flyerView(e,.17));
 assert.match(flyerView({...e,knock:1},.17),/data-fly-frame="0"/);
 const b=await chromium.launch();try{for(const width of [320,390]){
  const p=await b.newPage({viewport:{width,height:width===320?568:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();
  let found=false;
  for(let i=0;i<180;i++){
   const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));
   if(s.mode!=='battle')break;
   if(s.choices.length){await p.locator('[data-action=chooseUpgrade]').first().click();continue;}
   if(s.enemies.some(e=>e.fly)){found=true;break;}
   await p.evaluate(()=>advanceTime(100));
  }
  assert.ok(found,'real wave spawned flyer');await p.locator('[data-action=pauseBattle]').click();
  await p.evaluate(async()=>{const i=new Image();i.src='assets/enemies/flyer-simple-strip-v1.png';await i.decode()});
  const before=await p.locator('[data-enemy=flyer]').first().getAttribute('data-fly-frame');
  const t=await p.evaluate(()=>JSON.parse(render_game_to_text()).t);await p.evaluate(()=>advanceTime(500));
  assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).t),t);
  assert.equal(await p.locator('[data-enemy=flyer]').first().getAttribute('data-fly-frame'),before);
  await p.screenshot({path:`output/flyer-live-${width}.png`});
  await p.locator('[data-action=pauseBattle]').click();await p.evaluate(()=>advanceTime(170));
  assert.ok((await p.evaluate(()=>JSON.parse(render_game_to_text()).t))>t);assert.deepEqual(errors,[]);
  // Same anchor and scale, isolated poses next to each other for visual comparison.
  await p.setContent(`<base href="http://127.0.0.1:4186/"><body style="background:#e7e5d7"><svg viewBox="0 0 320 100">${flyerView({id:2,x:90,y:50},0)}${flyerView({id:2,x:230,y:50},.17)}</svg></body>`);
  await p.evaluate(async()=>{const i=new Image();i.src='assets/enemies/flyer-simple-strip-v1.png';await i.decode()});
  await p.screenshot({path:`output/flyer-poses-${width}.png`});await p.close();
 }console.log('PASS: frame change, deterministic pose, knock, real-wave pause/resume, 320/390 decode');}finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
