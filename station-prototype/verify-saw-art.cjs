const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
async function decode(p){await p.evaluate(async()=>Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode();})));}
(async()=>{const b=await chromium.launch();try{for(const width of [320,390]){
 const p=await b.newPage({viewport:{width,height:width===320?568:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();await p.evaluate(()=>advanceTime(1800));await p.locator('[data-action=pauseBattle]').click();await decode(p);
 assert.equal(await p.locator('[data-saw-tier=basic]').count(),2);
 await p.screenshot({path:`output/saw-basic-live-${width}.png`});
 const before=await p.locator('[data-saw-rotor]').first().getAttribute('transform');await p.evaluate(()=>advanceTime(500));assert.equal(await p.locator('[data-saw-rotor]').first().getAttribute('transform'),before);
 const html=await p.evaluate(async()=>{
  const {battleView}=await import('./src/presentation/battle.mjs?v=saw-art-1');
  const {sawMount}=await import('./src/presentation/saw-mount.mjs?v=saw-art-1');
  const s=JSON.parse(render_game_to_text()),w=s.weapons.find(w=>w.key==='saw');
  const base=sawMount(w,s);s.upgrades.sawRate=1;if(base===sawMount(w,s))throw Error('rate has no visual effect');
  Object.assign(s.upgrades,{sawReach:1,sawLinked:1,sawDamage:1});s.t=8;s.sprint.active=false;s.invincible=false;s.sprint.remaining=0;s.impact=0;s.enemies=[];s.effects=[];
  const before=JSON.stringify(s),html=battleView(s);if(before!==JSON.stringify(s))throw Error('snapshot changed');return html;
 });
 const f=await b.newPage({viewport:{width,height:width===320?568:844}});await f.setContent(`<base href="http://127.0.0.1:4186/"><link rel="stylesheet" href="style.css"><body class="battle-mode"><main id="app" class="battle-mode">${html}</main></body>`);await decode(f);
 assert.equal(await f.locator('[data-saw-tier=advanced]').count(),4);assert.equal(await f.locator('[data-saw-reach="70"]').count(),4);
 await f.screenshot({path:`output/saw-advanced-fixture-${width}.png`});assert.deepEqual(errors,[]);await f.close();await p.close();
 }console.log('PASS saw live basic, pause, advanced linked/reach/rate drawing fixture, decode and immutability at 320/390');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
