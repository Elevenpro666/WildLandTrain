const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const {waveView}=await import('./src/presentation/wave-view.mjs');
 assert.ok(waveView({journey:{stage:1},wave:{number:1},scroll:1800}).includes('data-encounter-route="0"'));
 assert.ok(waveView({journey:{stage:1},wave:{number:2},scroll:0}).includes('data-encounter-route="1"'));
 const b=await chromium.launch();try{for(const width of [320,390]){
 const p=await b.newPage({viewport:{width,height:width===320?568:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();const saved=new Set();
 for(let i=0;i<500;i++){
  const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));
  if(s.choices.length){await p.locator('[data-action=chooseUpgrade]').first().click();continue;}
  if(['warning','assault','respite'].includes(s.wave.phase)&&!saved.has(s.wave.phase)){
   assert.equal(await p.locator('[data-route-node]').count(),5);
   assert.equal(await p.locator('[aria-current=step]').count(),1);
   assert.ok(await p.locator('[data-action=sprint]').isVisible());
   await p.screenshot({path:`output/wave-${s.wave.phase}-${width}.png`});saved.add(s.wave.phase);
  }
  if(saved.size===3)break;await p.evaluate(()=>advanceTime(100));
 }
 assert.equal(saved.size,3);assert.deepEqual(errors,[]);await p.close();
}console.log('PASS 320/390 simple route remains visible across internal wave phases');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
