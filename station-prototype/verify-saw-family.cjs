const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

const cases=[
 ['basic',{}],
 ['reach',{sawReach:1}],
 ['linked',{sawReach:1,sawLinked:1}],
 ['tooth',{sawDamage:1}],
 ['fast',{sawDamage:1,sawRate:1}],
 ['combined',{sawReach:1,sawLinked:1,sawDamage:1,sawRate:1}],
];

(async()=>{
 const {sawMount}=await import('./src/presentation/saw-mount.mjs');
 for(const count of [1,2]){
  for(const linked of [false,true]){
   const state={t:0,upgrades:{sawReach:1,sawLinked:Number(linked)},weaponSkinId:'blue'};
   const html=Array.from({length:count},(_,slot)=>sawMount({x:160,y:350},state,slot,count)).join('');
   assert.equal((html.match(/data-saw-tier=/g)||[]).length,count*2);
   assert.equal((html.match(/data-upgrade-art="sawLinked"/g)||[]).length,linked?count:0);
   assert.equal((html.match(/data-saw-support="(left|right)"/g)||[]).length,linked?count*2:0);
   assert.equal((html.match(/data-saw-load-beam="true"/g)||[]).length,linked?count*2:0);
   if(linked){
    assert.match(html,/data-saw-support="left"/);
    assert.match(html,/data-saw-support="right"/);
    assert.match(html,/data-saw-x=/);
   }
   const moving=Array.from({length:count},(_,slot)=>sawMount({x:160,y:350},{...state,t:.125},slot,count)).join('');
   assert.equal((moving.match(/data-saw-tier=/g)||[]).length,count*2);
   assert.equal((moving.match(/data-upgrade-art="sawLinked"/g)||[]).length,linked?count:0);
   if(linked){
    const supports=source=>[...source.matchAll(/data-saw-support="(?:left|right)"/g)].length;
    assert.equal(supports(html),supports(moving));
   }
   assert.notEqual(html.match(/data-saw-rotor transform="[^"]+"/)[0],moving.match(/data-saw-rotor transform="[^"]+"/)[0]);
   const restingX=[...html.matchAll(/data-saw-x="([^"]+)"/g)].map(match=>match[1]);
   const movingX=[...moving.matchAll(/data-saw-x="([^"]+)"/g)].map(match=>match[1]);
   const restingRows=[...html.matchAll(/data-saw-y="([^"]+)"/g)].map(match=>match[1]);
   const movingRows=[...moving.matchAll(/data-saw-y="([^"]+)"/g)].map(match=>match[1]);
   if(linked)assert.notDeepEqual(restingX,movingX);
   else assert.deepEqual(restingX,movingX);
   assert.deepEqual(restingRows,movingRows);
  }
 }
 const {upgradeCards}=await import('./src/game/upgrades.mjs');
 const {weaponStats}=await import('./src/game/upgrades.mjs');
 const {sawTargets}=await import('./src/game/weapon-targets.mjs');
 const sawOrigin={x:210,y:345};
 const reachOnly=weaponStats('saw',{sawReach:1});
 const linkedStats=weaponStats('saw',{sawReach:1,sawLinked:1});
 assert.equal(reachOnly.length,30);
 assert.equal(linkedStats.length,30);
 assert.equal(linkedStats.sweep,20);
 assert.equal(linkedStats.damage,reachOnly.damage);
 assert.equal(linkedStats.interval,reachOnly.interval);
 for(const direction of [-1,1]){
  const enemy={id:direction,hp:24,x:sawOrigin.x+direction*85,y:sawOrigin.y+25};
  assert.equal(sawTargets(sawOrigin,[enemy],reachOnly).length,0);
  assert.equal(sawTargets(sawOrigin,[enemy],linkedStats,0).length,0);
  assert.equal(sawTargets(sawOrigin,[enemy],linkedStats,1/2.8).length,1);
 }
 assert.match(upgradeCards.find(card=>card.id==='sawLinked').description,/现有刀盘/);
 assert.doesNotMatch(upgradeCards.find(card=>card.id==='sawLinked').description,/增加刀盘/);
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const live=await browser.newPage({viewport:{width,height:844}}),errors=[];
   live.on('pageerror',e=>errors.push(e.message));
   await live.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&weaponSkin=blue&v=saw-family1');
   await live.locator('[data-action="depart"]').click();
   await live.evaluate(()=>advanceTime(1500));
   const variants=await live.evaluate(async cases=>{
    const {battleView}=await import('./src/presentation/battle.mjs?v=saw-family1');
    const base=JSON.parse(render_game_to_text());
    const result=[];
    for(const [name,upgrades] of cases){
     for(const art of name==='basic'||name==='reach'||name==='linked'?['base']:['legacy','blue']){
      const s={...base,artVersion:'approved',enemyArtCandidate:true,enemyArtVariant:'highrank',weaponSkinId:'blue',advancedSawArt:art,upgrades:{...base.upgrades,...upgrades}};
      const before=JSON.stringify(s),html=battleView(s);
      result.push({name,art,html,time:s.t,unchanged:JSON.stringify(s)===before});
     }
    }
    return result;
   },cases);
   for(const variant of variants){
    assert.equal(variant.unchanged,true);
    const preview=await browser.newPage({viewport:{width,height:844}});
    preview.on('pageerror',e=>errors.push(e.message));
    await preview.setContent(`<base href="http://127.0.0.1:4191/station-prototype/"><link rel="stylesheet" href="style.css"><body class="battle-mode"><main id="app" class="battle-mode">${variant.html}</main></body>`);
    const wheels=preview.locator('[data-saw-tier]');
    assert.equal(await wheels.count(),4);
    const expectedTier=['basic','reach','linked'].includes(variant.name)?'basic':'advanced';
    assert.equal(await wheels.first().getAttribute('data-saw-tier'),expectedTier);
    assert.equal(await wheels.first().getAttribute('data-saw-skin'),expectedTier==='basic'?'blue':variant.art==='blue'?'advanced-blue':'legacy');
    assert.equal(await wheels.first().getAttribute('data-saw-spin-speed'),['fast','combined'].includes(variant.name)?'1800':'1200');
    assert.equal(await preview.locator('[data-upgrade-art="sawLinked"]').count(),['linked','combined'].includes(variant.name)?2:0);
    assert.equal(await preview.locator('[data-saw-support]').count(),['linked','combined'].includes(variant.name)?4:0);
    assert.equal(await preview.locator('[data-saw-load-beam]').count(),['linked','combined'].includes(variant.name)?4:0);
    const rows=await wheels.evaluateAll(nodes=>nodes.map(node=>({slot:Number(node.dataset.sawSlot),y:Number(node.dataset.sawY)})));
    const rowGap=Math.abs(rows.find(row=>row.slot===2).y-rows.find(row=>row.slot===1).y);
    const linked=['linked','combined'].includes(variant.name);
    const expectedGap=44;
    assert.ok(Math.abs(rowGap-expectedGap)<.001);
    const renderedX=await wheels.evaluateAll(nodes=>nodes.map(node=>Number(node.dataset.sawX)));
    assert.equal(renderedX.length,4);
    assert.equal(await preview.locator('[data-mount-count]').count(),0);
    const href=await wheels.first().locator('image').getAttribute('href');
    assert.equal((await preview.request.get(`http://127.0.0.1:4191/station-prototype/${href}`)).ok(),true);
    await preview.screenshot({path:`output/saw-family-${variant.name}-${variant.art}-${width}.png`});
    await preview.close();
   }
   const singleHtml=await live.evaluate(async()=>{
    const {battleView}=await import('./src/presentation/battle.mjs?v=saw-family1');
    const base=JSON.parse(render_game_to_text());
    const firstSawIndex=base.weapons.findIndex(weapon=>weapon.key==='saw');
    return battleView({...base,artVersion:'approved',enemyArtCandidate:true,enemyArtVariant:'highrank',weapons:base.weapons.filter((weapon,index)=>weapon.key!=='saw'||index===firstSawIndex),upgrades:{...base.upgrades,sawReach:1,sawLinked:1}});
   });
   const single=await browser.newPage({viewport:{width,height:844}});
   single.on('pageerror',e=>errors.push(e.message));
   await single.setContent(`<base href="http://127.0.0.1:4191/station-prototype/"><link rel="stylesheet" href="style.css"><body class="battle-mode"><main id="app" class="battle-mode">${singleHtml}</main></body>`);
   assert.equal(await single.locator('[data-saw-tier]').count(),2);
   assert.equal(await single.locator('[data-saw-support]').count(),2);
   await single.screenshot({path:`output/saw-family-linked-single-${width}.png`});
   await single.close();
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS ${variants.length} visual states, preserved snapshots, decoded asset paths, no page errors`);
   await live.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
