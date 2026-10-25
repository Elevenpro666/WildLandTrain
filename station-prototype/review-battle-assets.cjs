const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');

const equipmentByCar={head:['arc','drone'],c1:['saw','saw'],c2:['drone','arc'],c3:['arc','arc','arc','arc'],c4:['drone','boost'],c5:['saw','arc','boost']};
const required=['wheel-hub-v1.svg','ground-scuffs-v1.svg','road-dust-v1.svg','exhaust-flare-v1.svg','sprint-shock-v1.svg','impact-burst-v1.svg','hit-spark-v1.svg','boss-pressure-v1.svg','sprint-ready-v1.svg','sprint-locked-v1.svg','experience-v1.svg','scrap-v1.svg','upgrade-saw-v1.svg','upgrade-arc-v1.svg','upgrade-drone-v1.svg','upgrade-supply-v1.svg','saw-drive-v1.svg','arc-fork-v1.svg','arc-antenna-v1.svg','drone-radar-v1.svg','drone-electrode-v1.svg','drone-focus-v1.svg','supply-bus-v1.svg','iron-bearer-boss-v1.png'];
const allUpgrades={sawReach:1,sawLinked:1,sawDamage:1,sawRate:1,arcReach:1,arcCount:1,arcDamage:1,arcPulse:1,droneCount:1,dronePatrol:1,droneDamage:1,droneFocus:1,supply:1};

(async()=>{
 const browser=await chromium.launch();
 const out=path.join(__dirname,'output','battle-asset-review');fs.mkdirSync(out,{recursive:true});
 try{
  for(const [width,height] of [[320,568],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4186/');
   const missing=await page.evaluate(async files=>{
    const results=await Promise.all(files.map(async file=>{
     const response=await fetch('assets/battle-state/'+file);
     if(!response.ok)return file;
     if(file.endsWith('.svg')){
      const parsed=new DOMParser().parseFromString(await response.text(),'image/svg+xml');
      if(parsed.querySelector('parsererror'))return file;
     }
     return null;
    }));return results.filter(Boolean);
   },required);
   assert.deepEqual(missing,[],'every runtime art file must load and SVG parse');
   const loadout=await page.evaluate(async loadout=>{
    const [{config},{createBattle},{battleView}]=await Promise.all([import('./config.mjs'),import('./src/game/battle.mjs'),import('./src/presentation/battle.mjs')]);
    const carriers=[{id:'head'},...Array.from({length:5},(_,i)=>({id:`c${i+1}`,level:1}))];
    const equipment=Object.entries(loadout).flatMap(([carrier,keys])=>keys.map((key,i)=>({...config.modules.find(m=>m.key===key),id:`${carrier}-${key}-${i}`,carrier})));
    window.__assetLoadout={carriers,equipment};window.__assetBattle=createBattle({carriers,equipment},1,{routeLength:2000});window.__assetView=battleView;
    document.body.className='battle-mode';document.querySelector('#app').className='battle-mode';
    return {carriers:carriers.length,weapons:equipment.length};
   },equipmentByCar);
   assert.equal(loadout.carriers,6);assert.equal(loadout.weapons,15);
   const base=await page.evaluate(()=>{
    const battle=window.__assetBattle;battle.step(.7);const s=battle.snapshot();document.querySelector('#app').innerHTML=window.__assetView(s);
    const wheel=document.querySelector('[data-wheel-hub]').getAttribute('transform');
    battle.step(.1);document.querySelector('#app').innerHTML=window.__assetView(battle.snapshot());
    return {wheels:document.querySelectorAll('[data-wheel-hub]').length,wheelMoves:wheel!==document.querySelector('[data-wheel-hub]').getAttribute('transform'),ground:document.querySelectorAll('[data-state-art=ground]').length,dust:document.querySelectorAll('[data-state-art=road-dust]').length,exhaust:document.querySelectorAll('[data-state-art=exhaust]').length,shock:document.querySelectorAll('[data-state-art=sprint-shock]').length};
   });
   assert.equal(base.wheels,12);assert.ok(base.wheelMoves);assert.equal(base.ground,6);assert.ok(base.dust>=3);assert.equal(base.exhaust,2);assert.equal(base.shock,1);
   await page.screenshot({path:path.join(out,`sprint-${width}.png`)});
   const upgraded=await page.evaluate(upgrades=>{
    return import('./src/game/battle.mjs').then(({createBattle})=>{
     const battle=createBattle(window.__assetLoadout,1,{routeLength:2000,growth:{upgrades}});battle.step(6.5);
     const s=battle.snapshot();document.querySelector('#app').innerHTML=window.__assetView(s);
     return {markers:[...document.querySelectorAll('[data-upgrade-art]')].map(el=>el.getAttribute('data-upgrade-art')),sawAdvanced:!!document.querySelector('[data-saw-tier=advanced]'),arcAdvanced:!!document.querySelector('[data-arc-tier=advanced]'),drones:s.drones.length};
    });
   },allUpgrades);
   for(const id of ['sawRate','arcReach','arcCount','droneCount','dronePatrol','droneDamage','droneFocus','supply'])assert.ok(upgraded.markers.includes(id),id);
   assert.ok(upgraded.sawAdvanced);assert.ok(upgraded.arcAdvanced);assert.ok(upgraded.drones>=2);
   await page.screenshot({path:path.join(out,`upgraded-${width}.png`)});
   const boss=await page.evaluate(async()=>{
    const {createBattle}=await import('./src/game/battle.mjs');const battle=createBattle(window.__assetLoadout,1,{routeLength:100,boss:true});
    for(let i=0;i<1000&&!battle.snapshot().boss&&!battle.snapshot().done;i++){const s=battle.snapshot();if(s.choices.length)battle.choose(s.choices[0].id,s.upgradeId);else battle.step(.05);}
    const s=battle.snapshot();document.querySelector('#app').innerHTML=window.__assetView(s);
    return {present:!!document.querySelector('[data-enemy=boss] image[href*=iron-bearer]'),pressure:!!document.querySelector('[data-state-art=boss-pressure]'),locked:document.querySelector('[data-action=sprint]')?.dataset.state};
   });
   assert.ok(boss.present);assert.ok(boss.pressure);assert.equal(boss.locked,'locked');
   await page.screenshot({path:path.join(out,`boss-${width}.png`)});
   const hurt=await page.evaluate(async()=>{
    const {createBattle}=await import('./src/game/battle.mjs');
    const battle=createBattle({carriers:[{id:'head'}],equipment:[]},1,{routeLength:2000});
    for(let i=0;i<1200&&!battle.snapshot().hurtFx&&!battle.snapshot().done;i++)battle.step(.05);
    const s=battle.snapshot();document.querySelector('#app').innerHTML=window.__assetView(s);
    return {hp:s.hp,spark:!!document.querySelector('[data-state-art=hit-spark]')};
   });
   assert.ok(hurt.hp<300);assert.ok(hurt.spark);
   if(width===390){
    await page.setViewportSize({width:900,height:1200});
    await page.setContent(`<style>body{margin:0;padding:20px;background:#dedbd0;font:14px sans-serif}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.item{height:136px;background:#ece9df;border:1px solid #8a8b80;display:grid;place-items:center;align-content:center;gap:6px}.item img{width:80px;height:88px;object-fit:contain}.item small{font-size:11px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}</style><div class="grid">${required.map(file=>`<div class="item"><img src="http://127.0.0.1:4186/assets/battle-state/${file}"><small>${file}</small></div>`).join('')}</div>`);
    await page.locator('.item img').first().evaluate(async()=>Promise.all([...document.images].map(img=>img.decode())));
    await page.screenshot({path:path.join(out,'contact-sheet.png'),fullPage:true});
   }
   assert.deepEqual(errors,[]);await page.close();
   console.log(`PASS ${width} assets load, sprint, all upgrade markers, boss lock`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
