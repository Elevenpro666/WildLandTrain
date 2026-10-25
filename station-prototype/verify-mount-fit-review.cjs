const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const candidate=process.env.PLATFORM_ART_CANDIDATE==='1';

const ids=['empty','starting','head4arc','car3saw','car3drone','car4boost'];
const expected={
 empty:{arc:0,sawDiscs:0,drone:0,boost:0},
 starting:{arc:2,sawDiscs:4,drone:1,boost:0},
 head4arc:{arc:5,sawDiscs:4,drone:1,boost:0},
 car3saw:{arc:2,sawDiscs:6,drone:1,boost:0},
 car3drone:{arc:1,sawDiscs:0,drone:3,boost:0},
 car4boost:{arc:1,sawDiscs:4,drone:0,boost:4},
};

(async()=>{
 const {vehicleBodyWidth}=await import('./configs/vehicle-geometry.mjs');
 const {blockTrain}=await import('./src/game/ground-bodies.mjs');
 assert.equal(vehicleBodyWidth,74);
 const contact={x:260,y:345,emerging:false};
 blockTrain(contact,[{id:'head',x:210,y:260},{id:'c1',x:210,y:345}]);
 assert.equal(contact.x,261,'车厢侧缘碰撞应随74 B宽度外移');
 assert.equal(contact.contactCar,'c1');
 const browser=await chromium.launch();
 try{
  for(const id of ids){
   const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   const url=`http://127.0.0.1:4191/station-prototype/mount-fit-review.html?case=${id}&capture=1${candidate?'&platformArt=carV1':''}`;
   await page.goto(url);
   await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
   await page.evaluate(async()=>Promise.all([...document.images,...document.querySelectorAll('svg image')].map(element=>{const src=element.currentSrc||element.getAttribute('href');if(!src)return;const img=new Image();img.src=src;return img.decode();})));
   const state=JSON.parse(await page.evaluate(()=>render_game_to_text()));
   assert.equal(state.case,id);assert.deepEqual(state.visibleMounts,expected[id]);
   const bodyWidths=await page.locator('[data-train-body]').evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('width'))));
   assert.ok(bodyWidths.every(width=>width===74),'车头与每节车厢须同为74 B宽');
   const bodyHeights=await page.locator('[data-train-body]').evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('height'))));
   assert.ok(bodyHeights.slice(1).every(height=>Math.abs(height-70*1038/776)<0.01),'车厢纵向长度须保持原值');
   assert.equal(await page.locator('[data-mount-count]').count(),0,'实装舱位不再使用数量角标');
   if(id==='starting')assert.equal(await page.locator(candidate?'[data-approved="arcForkBasic"]':'[data-approved="arcSeed"]').count(),2,'基础电弧应使用当前试演素材');
   if(id==='head4arc'){
    if(candidate)assert.equal(await page.locator('[data-arc-state="fork-trial"][data-arc-installed="4"]').count(),4,'候选电弧须逐件占四块T板');
    else{
     assert.equal(await page.locator('[data-arc-rack]').count(),4,'车头四件电弧须各有承力挂座');
     const sides=await page.locator('[data-arc-rack]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-arc-rack')));
     assert.deepEqual(sides.sort(),['left','left','right','right']);
    }
   }
  if(id==='car3drone'){
    assert.equal(await page.locator('[data-drone-slot]').count(),3,'三个无人机舱各自占位');
    if(candidate){
     assert.equal(await page.locator('[data-drone-independent="true"] [data-approved="droneBayBasic"]').count(),3,'三格须分别有一座独立舱');
     assert.equal(await page.locator('image[href*="无人机单格基础舱原创候选V1.png"]').count(),3,'仅使用新单格舱素材，不能退回旧整舱');
     assert.equal(await page.locator('image[href*="drone-bay-source-v1.png"]').count(),0,'候选不能混入旧整舱素材');
     assert.equal(await page.locator('[data-drone-base-art="v1"]').count(),3,'三座舱须分别加载独立底座资源');
     assert.equal(await page.locator('[data-drone-door-art="v1"]').count(),3,'三座舱须分别加载独立舱门框资源');
     const bases=await page.locator('[data-drone-base]').evaluateAll(nodes=>nodes.map(node=>({x:Number(node.getAttribute('x')),y:Number(node.getAttribute('y')),w:Number(node.getAttribute('width')),h:Number(node.getAttribute('height'))})));
     assert.equal(bases.length,3,'每座舱必须有可见的独立底座');
     for(let i=0;i<bases.length;i++)for(let j=i+1;j<bases.length;j++)assert.ok(bases[i].x+bases[i].w<=bases[j].x||bases[j].x+bases[j].w<=bases[i].x||bases[i].y+bases[i].h<=bases[j].y||bases[j].y+bases[j].h<=bases[i].y,'独立舱底座不得互相叠合');
    }
   }
   if(id==='car4boost'){
    const sides=await page.locator('[data-boost-side]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-boost-side')));
    assert.deepEqual(sides.sort(),['left','left','right','right']);
    if(candidate){
     assert.equal(await page.locator('[data-boost-support="edge-clamps"]').count(),4,'每件助推器必须有与车身连接的边缘夹具');
     assert.equal(await page.locator('image[href*="助推器短舱蓝灰材质原创候选V2.png"]').count(),4,'四件助推器须使用短舱新素材');
     const sizes=await page.locator('[data-mount="boost"] > svg').evaluateAll(nodes=>nodes.map(node=>({w:Number(node.getAttribute('width')),h:Number(node.getAttribute('height'))})));
     assert.ok(sizes.every(({w,h})=>w===17&&h===19),'P位本体必须遵守17×19 B显示包络');
     const body=await page.locator('[data-train-body="car"]').last().evaluate(node=>({x:Number(node.getAttribute('x')),y:Number(node.getAttribute('y')),w:Number(node.getAttribute('width')),h:Number(node.getAttribute('height'))}));
     const mounts=await page.locator('[data-mount="boost"]').evaluateAll(nodes=>nodes.map(node=>{const m=node.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/);return {x:Number(m[1]),y:Number(m[2])};}));
     assert.ok(mounts.every(({x,y})=>y>=body.y+12&&y<=body.y+body.h-10&&Math.abs(x-(body.x+body.w/2))<=body.w/2),'四助推器主体中心须压入本车厢轮廓，不得悬在外侧');
    }
   }
   assert.equal(await page.locator('.battle-field > svg').count(),1);
   const later=JSON.parse(await page.evaluate(()=>{advanceTime(125);return render_game_to_text();}));
   assert.ok(later.time>state.time);
   assert.deepEqual(later.visibleMounts,expected[id]);
   assert.deepEqual(errors,[]);
   const output=path.resolve(__dirname,`output/mount-fit-${id}${candidate?'-platform-fit2':''}-390.png`);
   await page.screenshot({path:output});
   console.log(`${id}: ${JSON.stringify(state.visibleMounts)} -> ${output}`);
   await page.close();
  }
  if(candidate){
   for(const [id,asset,count] of [['head4arc','arcFork',5],['car3drone','droneBaySquare',3]]){
    const page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto(`http://127.0.0.1:4191/station-prototype/mount-fit-review.html?case=${id}&capture=1&platformArt=carV1&mountTrial=fit2&mountArtTier=advanced`);
    assert.equal(await page.locator(`[data-approved="${asset}"]`).count(),count,'高阶美术切换必须使用高阶独立图');
    await page.close();
   }
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
