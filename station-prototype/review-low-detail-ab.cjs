const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');

const output=path.resolve(__dirname,'output/low-detail-ab');
fs.mkdirSync(output,{recursive:true});

async function state(page){return JSON.parse(await page.evaluate(()=>render_game_to_text()));}
async function decoded(page){
 await page.evaluate(async()=>{
  await Promise.all([...document.querySelectorAll('image')].map(element=>{
   const image=new Image();
   image.src=new URL(element.getAttribute('href'),location.href).href;
   return image.decode();
  }));
 });
 await page.waitForTimeout(400);
}
async function showCandidate(page){
 await page.evaluate(()=>{
  for(const image of document.querySelectorAll('.battle-field image')){
   const href=image.getAttribute('href');
   if(/assets\/style-v2\/(head|car|scorpion-basic|scorpion-elite)\.png$/.test(href))image.setAttribute('href',href.replace('/style-v2/','/style-v3-candidate/'));
  }
 });
 await decoded(page);
}
async function showBase(page){
 await page.evaluate(()=>{
  for(const image of document.querySelectorAll('.battle-field image')){
   const href=image.getAttribute('href');
   if(/assets\/style-v3-candidate\/(head|car|scorpion-basic|scorpion-elite)\.png$/.test(href))image.setAttribute('href',href.replace('/style-v3-candidate/','/style-v2/'));
  }
 });
 await decoded(page);
}
async function pair(page,width,phase){
 const before=await state(page);
 await decoded(page);
 assert.equal(await page.locator('[data-train-body=head]').count(),1);
 assert.ok(await page.locator('[data-train-body=car]').count()>0);
 assert.ok(await page.locator('[data-enemy=walker]').count()>0);
 await page.screenshot({path:path.join(output,`${phase}-v2-${width}.png`)});
 await showCandidate(page);
 assert.deepEqual(await state(page),before,'visual variant must not alter battle state');
 await page.screenshot({path:path.join(output,`${phase}-low-${width}.png`)});
 await showBase(page);
}

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:width===320?568:844}});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4186/');
   await page.locator('[data-action=buyCart]').click();
   await page.locator('[data-action=buyCart]').click();
   await decoded(page);
   await page.locator('[data-action=depart]').click();
   await page.evaluate(()=>advanceTime(1800));
   await page.locator('[data-action=pauseBattle]').click();
   await pair(page,width,'departure');

   await page.locator('[data-action=pauseBattle]').click();
   for(let i=0;i<60;i++){
    const snapshot=await state(page);
    if(snapshot.t>=5)break;
    if(snapshot.choices?.length)await page.locator('[data-action=chooseUpgrade]').first().click();
    await page.evaluate(()=>advanceTime(300));
   }
   const normal=await state(page);
   assert.equal(normal.mode,'battle');
   assert.ok(normal.t>=5,'reached normal travel');
   if(!normal.paused)await page.locator('[data-action=pauseBattle]').click();
   await pair(page,width,'normal');
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('PASS same-state V2/low-detail screenshots at 320/390, departure/normal, no page errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
