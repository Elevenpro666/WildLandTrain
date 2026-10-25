const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const [width,height] of [[320,568],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4186/');
   const result=await page.evaluate(async()=>{
    const [{createBattle},{battleView}]=await Promise.all([import('./src/game/battle.mjs'),import('./src/presentation/battle.mjs')]);
    const carriers=[{id:'head'},...Array.from({length:5},(_,i)=>({id:`c${i+1}`,level:1}))];
    const battle=createBattle({carriers,equipment:[]},1,{routeLength:2000});
    let before=0,after=0,s;
    for(let i=0;i<200;i++){
     battle.step(.025);s=battle.snapshot();
     if(s.choices.length)battle.choose(s.choices[0].id,s.upgradeId);
     const hit=s.enemies.find(e=>e.knock&&e.knockAge>0&&e.knockAge<.15);
     if(hit){before={id:hit.id,age:hit.knockAge,x:hit.x,origin:hit.knockOrigin.x};break;}
    }
    if(!before)return {before};
    battle.step(.1);s=battle.snapshot();
    document.body.className='battle-mode';const app=document.querySelector('#app');app.className='battle-mode';app.innerHTML=battleView(s);
    const fx=app.querySelector(`[data-knock-fx="${before.id}"]`);
    const svg=app.querySelector('.battle-field svg');
    const active=!!fx,hasText=fx?.querySelector('text')!==null;
    battle.step(.45);const later=document.createElement('div');later.innerHTML=battleView(battle.snapshot());
    return {before,fx:active,hasText,expired:!later.querySelector(`[data-knock-fx="${before.id}"]`),svg:!!svg,knocked:s.knocked};
   });
   assert.ok(result.before,'collision must happen during launch');
   assert.ok(result.fx,'collision has visible short-lived streak');
   assert.equal(result.hasText,false);assert.ok(result.knocked>0);assert.ok(result.expired,'collision streak must expire');
   await page.screenshot({path:path.join(__dirname,'output',`knock-visual-${width}.png`)});
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS 320/390 knock event, visual streak, no explanatory text');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
