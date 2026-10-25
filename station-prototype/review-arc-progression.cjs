const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.cancelAnimationFrame=()=>{};});
   await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=arc-progression1');
   await page.locator('[data-action="depart"]').click();
   await page.evaluate(()=>advanceTime(4000));
   const snapshots=await page.evaluate(async()=>{
    const {battleView}=await import('./src/presentation/battle.mjs?v=arc-progression1');
    const state=JSON.parse(render_game_to_text());
    const base={...state,artVersion:'approved',enemyArtCandidate:true,enemyArtVariant:'highrank',cash:90};
    const stages=[{name:'base',arcDamage:0,arcPulse:0},{name:'middle',arcDamage:1,arcPulse:0},{name:'upper',arcDamage:1,arcPulse:1}];
    return stages.map(stage=>({name:stage.name,html:battleView({...base,upgrades:{...base.upgrades,arcDamage:stage.arcDamage,arcPulse:stage.arcPulse}})}));
   });
   await page.close();
   for(const {name,html} of snapshots){
    const preview=await browser.newPage({viewport:{width,height:844}});
    preview.on('pageerror',error=>errors.push(error.message));
    await preview.setContent(`<base href="http://127.0.0.1:4191/station-prototype/"><link rel="stylesheet" href="style.css"><body class="battle-mode"><main id="app" class="battle-mode">${html}</main></body>`);
    await preview.evaluate(async()=>{
     await Promise.all([...document.querySelectorAll('image')].map(async image=>{
      const src=image.getAttribute('href');if(!src)return;
      const loaded=new Image();loaded.src=new URL(src,document.baseURI).href;await loaded.decode();
     }));
    });
    assert.equal(await preview.locator('[data-approved="arc"]').count(),2);
    assert.equal(await preview.locator('[data-arc-capacitor-tier="1"]').count(),name==='middle'?2:0);
    assert.equal(await preview.locator('[data-arc-capacitor-tier="2"]').count(),name==='upper'?2:0);
    await preview.screenshot({path:`output/arc-progression-${name}-${width}.png`});
    await preview.close();
   }
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS same-frame base / first upgrade / second upgrade, two original arc weapons, no page errors`);
  }
  const comparison=await browser.newPage({viewport:{width:1190,height:900},deviceScaleFactor:1});
  const items=[['基础电弧','base'],['高压绕组 · 首次强化','middle'],['双脉冲 · 进阶强化','upper']].map(([label,name])=>({label,src:'data:image/png;base64,'+fs.readFileSync(`output/arc-progression-${name}-390.png`).toString('base64')}));
  await comparison.setContent(`<style>body{margin:0;background:#26302c;color:#f0eee4;font:18px sans-serif}.row{display:flex;gap:10px;padding:10px}.item{width:390px}.label{height:34px;text-align:center;font-weight:bold}.item img{display:block;width:390px;height:844px}</style><div class="row">${items.map(item=>`<div class="item"><div class="label">${item.label}</div><img src="${item.src}"></div>`).join('')}</div>`);
  await comparison.screenshot({path:'output/arc-progression-comparison-390.png'});
  await comparison.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
