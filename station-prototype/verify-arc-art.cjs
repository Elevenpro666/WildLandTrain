const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{for(const width of [320,390]){
 const p=await b.newPage({viewport:{width,height:width===320?568:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();await p.evaluate(()=>advanceTime(1800));await p.locator('[data-action=pauseBattle]').click();
 await p.evaluate(async()=>{await Promise.all(['basic','advanced'].map(t=>{const i=new Image();i.src=`assets/weapons/arc-${t}-source-v2.png`;return i.decode();}));});
 assert.equal(await p.locator('[data-arc-tier=basic]').count(),2);
 await p.screenshot({path:`output/arc-basic-live-${width}.png`});
 const html=await p.evaluate(async()=>{
  const {battleView}=await import('./src/presentation/battle.mjs?v=arc-art-2');
  const snapshot=JSON.parse(render_game_to_text());snapshot.upgrades.arcPulse=1;snapshot.upgrades.arcDamage=1;snapshot.t=8;snapshot.sprint.active=false;snapshot.invincible=false;snapshot.sprint.remaining=0;snapshot.paused=true;snapshot.impact=0;snapshot.enemies=[];snapshot.effects=[];
  const before=JSON.stringify(snapshot),html=battleView(snapshot);if(before!==JSON.stringify(snapshot))throw Error('render mutated snapshot');return html;
 });
 const f=await b.newPage({viewport:{width,height:width===320?568:844}});
 await f.setContent(`<base href="http://127.0.0.1:4186/"><link rel="stylesheet" href="style.css"><body class="battle-mode"><main id="app" class="battle-mode">${html}</main></body>`);
 await f.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode();}));});
 assert.equal(await f.locator('[data-arc-tier=advanced]').count(),2);
 await f.screenshot({path:`output/arc-advanced-fixture-${width}.png`});
 assert.deepEqual(errors,[]);await p.close();await f.close();
 }console.log('PASS: live basic at 320/390, both assets decode, advanced renderer fixture and snapshot immutability');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
