const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const equipmentByCar={head:['arc','drone'],c1:['saw','saw'],c2:['drone','arc'],c3:['arc','arc','arc','arc'],c4:['drone','boost'],c5:['saw','arc','boost']};
const stages=[['departure',.7],['sprint',2.6],['cruise',6.5],['recharge',13.5]];

(async()=>{
 const browser=await chromium.launch();
 const out=path.join(__dirname,'output','six-car-motion');fs.mkdirSync(out,{recursive:true});
 try{
  for(const [width,height] of [[320,568],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4186/');
   const first=await page.evaluate(async loadout=>{
    const [{config},{createBattle},{battleView}]=await Promise.all([import('./config.mjs'),import('./src/game/battle.mjs'),import('./src/presentation/battle.mjs')]);
    const carriers=[{id:'head'},...Array.from({length:5},(_,i)=>({id:`c${i+1}`,level:1}))];
    const equipment=Object.entries(loadout).flatMap(([carrier,keys])=>keys.map((key,i)=>({...config.modules.find(m=>m.key===key),id:`${carrier}-${key}-${i}`,carrier})));
    for(const c of carriers){const used=equipment.filter(e=>e.carrier===c.id).reduce((n,e)=>n+e.size,0);if(used!==4)throw Error(`${c.id}: ${used}/4`);}
    window.__reviewBattle=createBattle({carriers,equipment},1,{routeLength:2000});
    window.__reviewView=battleView;
    window.__reviewAdvance=(target)=>{let b=window.__reviewBattle,s=b.snapshot();while(s.t<target-.0001&&!s.done){if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);else b.step(Math.min(.05,target-s.t));s=b.snapshot();}return s;};
    window.__reviewRender=()=>{const s=window.__reviewBattle.snapshot();document.body.className='battle-mode';const app=document.querySelector('#app');app.className='battle-mode';app.innerHTML=window.__reviewView(s);return {t:s.t,hp:s.hp,kills:s.kills,enemies:s.enemies.length,effects:s.effects.length,sprint:s.sprint,carriers:s.cars.length,weapons:s.weapons.length,paused:s.paused,done:s.done};};
    return window.__reviewRender();
   },equipmentByCar);
   assert.equal(first.carriers,6);assert.equal(first.weapons,15);
   const records=[];
   for(const [label,time] of stages){
    const record=await page.evaluate(t=>{window.__reviewAdvance(t);return window.__reviewRender();},time);
    await page.evaluate(async()=>Promise.all([...document.querySelectorAll('.battle-field image')].map(el=>{const img=new Image();img.src=new URL(el.getAttribute('href'),location.href).href;return img.decode();})));
    await page.screenshot({path:path.join(out,`${label}-${width}.png`)});
    records.push({label,...record});
   }
   const released=await page.evaluate(()=>{const b=window.__reviewBattle;if(!b.release())return null;window.__reviewAdvance(b.snapshot().t+.9);return window.__reviewRender();});
   if(released){await page.screenshot({path:path.join(out,`manual-sprint-${width}.png`)});records.push({label:'manual-sprint',...released});}
   assert.deepEqual(errors,[]);
   fs.writeFileSync(path.join(out,`metrics-${width}.json`),JSON.stringify(records,null,2));
   console.log(width,records.map(r=>`${r.label}: t=${r.t.toFixed(1)}, hp=${r.hp}, enemies=${r.enemies}, hits=${r.effects}`).join(' | '));
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
