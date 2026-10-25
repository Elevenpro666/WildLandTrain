const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{for(const width of [320,390]){
const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4191/station-prototype/');
const frames=await page.evaluate(async()=>{
 const {createBattle}=await import('./src/game/battle.mjs');
 const {battleView}=await import('./src/presentation/battle.mjs');
 const make=()=>createBattle({carriers:[{id:'head'}],equipment:[]},1,{boss:true,routeLength:1});
 const battle=make(),out=[];
 const capture=label=>{const s=battle.snapshot();out.push({label,hp:s.hp,max:s.maxHp,html:battleView(s)});};
 capture('full');
 for(let i=0;i<10000&&battle.snapshot().hp===battle.snapshot().maxHp;i++)battle.step(1/60);
 capture('hurt');battle.toggle();const frozen=JSON.stringify(battle.snapshot());battle.step(3);
 if(JSON.stringify(battle.snapshot())!==frozen)throw Error('Pause mutated battle');capture('paused');battle.toggle();
 for(let i=0;i<10000&&battle.snapshot().hp>battle.snapshot().maxHp*.25;i++)battle.step(1/60);
 capture('critical');for(let i=0;i<10000&&!battle.snapshot().done;i++)battle.step(1/60);capture('dead');
 const fresh=make().snapshot();out.push({label:'restart',hp:fresh.hp,max:fresh.maxHp,html:battleView(fresh)});return out;
});
assert.ok(frames[1].hp<frames[0].hp);assert.equal(frames[1].hp,frames[2].hp);assert.equal(frames[4].hp,0);assert.equal(frames[5].hp,frames[5].max);
for(const f of frames){await page.evaluate(html=>document.querySelector('#app').innerHTML=html,f.html);
const meter=page.locator('[data-train-health]');assert.equal(await meter.count(),1);assert.equal(Number(await meter.getAttribute('aria-valuenow')),f.hp);
assert.ok(Math.abs(Number(await page.locator('[data-health-fill]').getAttribute('height'))-60*f.hp/f.max)<1e-6);
if(f.label==='critical'){assert.equal(await page.locator('[data-health-fill]').getAttribute('fill'),'#c87959');await page.screenshot({path:__dirname+`/health-critical-${width}.png`});}
}
assert.deepEqual(errors,[]);console.log(width,frames.map(({label,hp})=>({label,hp})));await page.close();
}console.log('PASS real damage/pause/critical/death/fresh battle => health SVG');}finally{await browser.close();}})();
