const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const {weaponStats}=await import('./src/game/upgrades.mjs');
 const base=weaponStats('arc',{}),high=weaponStats('arc',{arcDamage:1});
 assert.equal(base.damage,12);
 assert.equal(high.damage,18);
 assert.equal(high.interval,base.interval);
 const {hitView}=await import('./src/presentation/weapon-feedback.mjs');
 const impactMarkup=hitView({upgrades:{arcDamage:1},effects:[
  {key:'arc',damage:18,x:210,y:285,tx:265,ty:280,life:.15},
  {key:'arc',damage:8,x:265,y:280,tx:290,ty:300,life:.15},
 ]});
 assert.equal((impactMarkup.match(/data-arc-impact="concentrated"/g)||[]).length,1);
 const browser=await chromium.launch();
 try{
  for(const width of [390]){
   for(const trial of [false,true]){
    const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};});
    const url=`http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=arc-capacitor3${trial?'&weaponTrial=arcDamage':''}`;
    await page.goto(url);
    await page.locator('[data-action="depart"]').click();
    await page.evaluate(()=>advanceTime(4000));
    const state=await page.evaluate(()=>JSON.parse(render_game_to_text()));
    assert.equal(state.mode,'battle');
    assert.equal(state.upgrades.arcDamage,trial?1:0);
    assert.equal(await page.locator('[data-arc-state="high-voltage"]').count(),trial?2:0);
    assert.equal(await page.locator('[data-approved="arcSeed"]').count(),2);
    assert.equal(await page.locator('[data-upgrade-part="arcDamage"]').count(),trial?2:0);
    assert.equal(await page.locator('[data-arc-capacitor-tier="1"]').count(),trial?2:0);
    await page.evaluate(async()=>{
     await Promise.all([...document.querySelectorAll('[data-mount="arc"] image')].map(async image=>{
      const source=new Image();source.src=image.getAttribute('href');await source.decode();
     }));
    });
    await page.screenshot({path:`output/arc-capacitor-v3-${trial?'high':'base'}-${width}.png`});
    if(trial){
     const liveImpact=await page.evaluate(()=>{
      for(let step=0;step<450;step++){
       advanceTime(16);
       const snapshot=JSON.parse(render_game_to_text());
       if(snapshot.effects.some(effect=>effect.key==='arc'&&effect.damage===18))return {time:snapshot.t,damage:18};
       if(snapshot.choices?.length)break;
      }
      return null;
     });
     assert.ok(liveImpact,'expected a real high-voltage arc hit before the next upgrade choice');
     assert.ok(await page.locator('[data-arc-impact="concentrated"]').count());
     await page.screenshot({path:`output/arc-capacitor-v3-impact-${width}.png`});
     const {pulseHtml,dualHtml}=await page.evaluate(async()=>{
     const {battleView}=await import('./src/presentation/battle.mjs?v=arc-pulse-resource1');
      const snapshot=JSON.parse(render_game_to_text());
      const pulse={...snapshot,artVersion:'approved',upgrades:{...snapshot.upgrades,arcPulse:1}};
      const headArc=snapshot.weapons.find(w=>w.key==='arc'&&w.carrier==='head');
      const dual={...snapshot,artVersion:'approved',weapons:[...snapshot.weapons,{...headArc,id:'test-second-arc'}]};
      const before=JSON.stringify({pulse,dual});
      const result={pulseHtml:battleView(pulse),dualHtml:battleView(dual)};
      if(JSON.stringify({pulse,dual})!==before)throw Error('render mutated fixture');
      return result;
     });
     assert.equal((pulseHtml.match(/data-approved="arcSeed"/g)||[]).length,2);
     assert.equal((pulseHtml.match(/data-approved="arcParallel"/g)||[]).length,0);
     assert.equal((pulseHtml.match(/data-arc-pulse-capacitor="v1"/g)||[]).length,2);
     assert.equal((pulseHtml.match(/data-upgrade-part="arcDamage"/g)||[]).length,0);
     const dual=await browser.newPage({viewport:{width,height:844}});
     dual.on('pageerror',error=>errors.push(error.message));
     await dual.setContent(`<base href="http://127.0.0.1:4191/station-prototype/"><link rel="stylesheet" href="style.css"><body class="battle-mode"><main id="app" class="battle-mode">${dualHtml}</main></body>`);
     assert.equal(await dual.locator('[data-approved="arcSeed"]').count(),3);
     assert.equal(await dual.locator('[data-arc-installed="2"]').count(),2);
     assert.equal(await dual.locator('[data-upgrade-part="arcDamage"]').count(),3);
     await dual.evaluate(async()=>{
      await Promise.all([...document.querySelectorAll('[data-mount="arc"] image')].map(async image=>{
       const source=new Image();source.src=image.getAttribute('href');await source.decode();
      }));
     });
     await dual.screenshot({path:`output/arc-capacitor-v3-dual-${width}.png`});
     await dual.close();
    }
    assert.deepEqual(errors,[]);
    await page.close();
   }
   console.log(`${width} PASS basic/parallel art, one device per slot, high-voltage damage feedback, no page errors`);
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
