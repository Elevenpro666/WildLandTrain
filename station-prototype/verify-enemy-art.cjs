const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const variant=process.argv[2]||'candidate';
 assert.ok(['candidate','generated','highrank','bone'].includes(variant));
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(`http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=${variant}&v=rear-flight1`);
   const snapshot=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
   let flyer=false,elite=false;const eliteStates=new Set();
   for(let i=0;i<1700&&!(flyer&&elite);i++){
    const s=await snapshot();
    if(s.mode==='station'){
     await page.locator('[data-action="select"][data-id="head"]').click();
     for(let n=0;n<(variant==='highrank'?0:3);n++){
      const station=await snapshot(),head=station.carriers.find(c=>c.id==='head');
      if(head.capacity-head.used<1||station.cash<12)break;
      await page.locator('[data-action="buyModule"][data-key="arc"]').click();
     }
     await page.locator('[data-action="depart"]').click();
    }else if(s.choices?.length){
     await page.locator('[data-action="chooseUpgrade"]').first().click();
    }else if(s.mode==='battle'){
    const eliteNode=page.locator('[data-art="layered-highrank"]').first();
    const earlyEliteState=await eliteNode.count()?await eliteNode.getAttribute('data-state'):null;
    if(earlyEliteState)eliteStates.add(earlyEliteState);
    const visibleFlyer=s.enemies.find(e=>e.fly&&!e.elite&&!e.boss&&e.x>55&&e.x<350&&e.y>125&&e.y<650);
    if(!flyer&&visibleFlyer){
      assert.ok(await page.locator(`[data-art="layered-candidate"][data-enemy="flyer"][data-enemy-id="${visibleFlyer.id}"]`).count());
      assert.ok(await page.locator(`[data-enemy="flyer"][data-enemy-id="${visibleFlyer.id}"] [data-flight-shadow]`).count());
      await page.screenshot({path:__dirname+`/enemy-${variant}-flyer-${width}.png`});flyer=true;
      const frames=new Set();
      for(let j=0;j<5;j++){
       const wing=page.locator(`[data-enemy="flyer"][data-enemy-id="${visibleFlyer.id}"] [data-wing="left"]`);
       if(await wing.count())frames.add(await wing.getAttribute('data-frame'));
       await page.screenshot({path:__dirname+`/enemy-${variant}-flyer-frame${j}-${width}.png`});
       await page.evaluate(()=>advanceTime(55));
      }
      assert.ok(frames.size>=3,`flyer wings did not animate through at least 3 poses: ${[...frames]}`);
    }
     if(!elite&&s.enemies.some(e=>e.elite)){
      assert.ok(await page.locator(`[data-art="${variant==='highrank'?'layered-highrank':'earth-candidate'}"][data-enemy="elite"]`).count());
      const overlap=await page.evaluate(()=>{const a=document.querySelector('[data-enemy="elite"]')?.getBoundingClientRect();return [...document.querySelectorAll('.build-group summary')].some(node=>{const b=node.getBoundingClientRect();return a&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});});
      assert.equal(overlap,false,`elite entry covered by build HUD at ${width}`);
      await page.screenshot({path:__dirname+`/enemy-${variant}-elite-${width}.png`});elite=true;
      if(variant==='highrank'){
       const poses=new Set(),states=new Set(),phases=new Set();
       for(let j=0;j<32;j++){
        const pose=await page.evaluate(()=>{const node=document.querySelector('[data-art="layered-highrank"]');return node?{state:node.getAttribute('data-state'),attackPhase:node.getAttribute('data-attack-phase'),left:node.querySelector('[data-part="left"]')?.getAttribute('transform'),facing:Number(node.querySelector('[data-facing]')?.getAttribute('data-facing'))}:null;});
        if(pose){
         states.add(pose.state);
         phases.add(pose.attackPhase);
         poses.add(pose.left);
         assert.ok(pose.facing>30&&pose.facing<150,`highrank is not facing train from right side: ${pose.facing}`);
         if(j===4||j===8||pose.attackPhase==='charge'&&j%3===0||pose.attackPhase==='strike')await page.screenshot({path:__dirname+`/enemy-highrank-motion${j}-${width}.png`});
        }
        await page.evaluate(()=>advanceTime(70));
       }
       assert.ok(poses.size>=3,`highrank limbs did not animate at ${width}`);
       assert.ok((states.has('walk')||eliteStates.has('walk'))&&states.has('attack'),`highrank missing walk/attack states at ${width}: ${[...eliteStates,...states]}`);
       assert.ok(phases.has('charge')&&phases.has('strike'),`highrank lacks charge/strike sequence at ${width}: ${[...phases]}`);
      }
     }
     if(await page.locator('[data-action="sprint"]:enabled').count())await page.locator('[data-action="sprint"]').click();
    }else if(s.mode==='result')throw Error('Ended before both enemy candidates appeared');
    await page.evaluate(()=>advanceTime(250));
   }
   assert.ok(flyer&&elite,`missing candidates at ${width}: flyer=${flyer} elite=${elite}`);
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS flyer and elite in actual battle`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
