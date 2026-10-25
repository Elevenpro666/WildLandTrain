const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
async function decode(p){await p.evaluate(async()=>Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode();})));}
(async()=>{const b=await chromium.launch();try{for(const width of [320,390]){
 const p=await b.newPage({viewport:{width,height:width===320?568:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();await p.evaluate(()=>advanceTime(1800));await p.locator('[data-action=pauseBattle]').click();await decode(p);
 const count=await p.evaluate(()=>JSON.parse(render_game_to_text()).drones.length);assert.equal(await p.locator('[data-weapon=drone]').count(),count);assert.equal(count,1);
 await p.screenshot({path:`output/drone-live-${width}.png`});const state=await p.evaluate(()=>render_game_to_text());await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>render_game_to_text()),state);
 const result=await p.evaluate(async()=>{
  const {createBattle}=await import('./src/game/battle.mjs');const {battleView}=await import('./src/presentation/battle.mjs?v=drone-art-1');
  const b=createBattle({carriers:[{id:'head'},{id:'c1'},{id:'c2'}],equipment:['head','c1','c2'].map((carrier,i)=>({id:'d'+i,key:'drone',carrier}))});
  for(let i=0;i<1800&&!b.snapshot().choices.length&&!b.snapshot().done;i++)b.step(1/60);
  const s=b.snapshot();if(!b.choose('droneCount',s.upgradeId))throw Error('expansion unavailable');const after=b.snapshot(),before=JSON.stringify(after),html=battleView(after);
  if(before!==JSON.stringify(after))throw Error('render mutation');return {html,count:after.drones.length};
 });assert.equal(result.count,6);
 const f=await b.newPage({viewport:{width,height:width===320?568:844}});await f.setContent(`<base href="http://127.0.0.1:4186/"><link rel="stylesheet" href="style.css"><body class="battle-mode"><main id="app" class="battle-mode">${result.html}</main></body>`);await decode(f);
 assert.equal(await f.locator('[data-weapon=drone]').count(),6);await f.screenshot({path:`output/drone-expanded-fixture-${width}.png`});assert.deepEqual(errors,[]);await f.close();await p.close();
 }console.log('PASS drone live mixed mount, decode, pause, actual expansion snapshot 3→6, immutable drawing at 320/390');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
