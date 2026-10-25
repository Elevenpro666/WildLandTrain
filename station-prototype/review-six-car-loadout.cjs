const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const equipmentByCar={
 head:['arc','drone'],c1:['saw','saw'],c2:['drone','arc'],
 c3:['arc','arc','arc','arc'],c4:['drone','boost'],c5:['saw','arc','boost']
};

(async()=>{
 const browser=await chromium.launch();
 const out=path.join(__dirname,'output','six-car-loadout');fs.mkdirSync(out,{recursive:true});
 try{
  for(const [width,height] of [[320,568],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4186/');
   const fixture=await page.evaluate(async loadout=>{
    const [{config},{createBattle},{battleView}]=await Promise.all([
      import('./config.mjs'),import('./src/game/battle.mjs'),import('./src/presentation/battle.mjs')
    ]);
    const carriers=[{id:'head'},...Array.from({length:5},(_,i)=>({id:`c${i+1}`,level:1}))];
    const equipment=Object.entries(loadout).flatMap(([carrier,keys])=>keys.map((key,i)=>({
      ...config.modules.find(module=>module.key===key),id:`${carrier}-${key}-${i}`,carrier
    })));
    for(const carrier of carriers){
      const used=equipment.filter(item=>item.carrier===carrier.id).reduce((sum,item)=>sum+item.size,0);
      if(used>4)throw new Error(`Over-capacity fixture: ${carrier.id}`);
    }
    const battle=createBattle({carriers,equipment});
    const state=battle.snapshot();state.t=10;state.paused=true;
    window.__loadoutPreviewEnemies=state.enemies.slice(0,8);state.enemies=[];
    state.sprintStarts=[0];state.sprint.active=false;state.invincible=false;
    document.body.className='battle-mode';const app=document.querySelector('#app');
    app.className='battle-mode';app.innerHTML=battleView(state);
    return {cars:state.cars.length,weapons:state.weapons.length};
   },equipmentByCar);
   assert.equal(fixture.cars,6);assert.equal(fixture.weapons,15);
   await page.evaluate(async()=>Promise.all([...document.querySelectorAll('.battle-field image')].map(element=>{
     const image=new Image();image.src=new URL(element.getAttribute('href'),location.href).href;return image.decode();
   })));
   await page.screenshot({path:path.join(out,`clean-${width}.png`)});
   await page.evaluate(async()=>{
    const {monster}=await import('./src/presentation/sprint-effects.mjs');
    const field=document.querySelector('.battle-field > svg > g > [data-camera=departure]');
    const enemies=window.__loadoutPreviewEnemies.map((enemy,index)=>({
      ...enemy,x:index%2?300:120,y:260+Math.floor(index/2)*145
    }));
    field.insertAdjacentHTML('beforeend',enemies.map(enemy=>monster(enemy,10)).join(''));
   });
   await page.evaluate(async()=>Promise.all([...document.querySelectorAll('.battle-field image')].map(element=>{
     const image=new Image();image.src=new URL(element.getAttribute('href'),location.href).href;return image.decode();
   })));
   await page.screenshot({path:path.join(out,`combat-${width}.png`)});
   const bounds=await page.locator('[data-train-body]').evaluateAll(nodes=>nodes.map(node=>{
     const rect=node.getBoundingClientRect();return {top:rect.top,bottom:rect.bottom,width:rect.width};
   }));
   assert.equal(bounds.length,6);assert.ok(bounds.every(rect=>rect.top>=0&&rect.bottom<=height));
   assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,`metrics-${width}.json`),JSON.stringify({fixture,bounds},null,2));
   await page.close();
  }
  console.log('PASS legal 15-module six-car loadout, decoded art, 320/390 screenshots and bounds');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
