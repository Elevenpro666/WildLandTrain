const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [320,390]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&v=shake-calm1');
   await page.locator('[data-action="depart"]').click();
   let collisions=0;
   for(let i=0;i<120;i++){
    await page.evaluate(()=>advanceTime(16));
    const sample=await page.evaluate(()=>({state:JSON.parse(render_game_to_text()),shake:document.querySelector('[data-battle-shake]')?.getAttribute('transform')}));
    if(sample.state.impact>0)collisions++;
    assert.equal(sample.shake,'translate(0,0)','opening hits must not repeatedly shake the battlefield');
   }
   assert.ok(collisions>25,'test must sample active collisions, not only quiet frames');
   await page.screenshot({path:`output/calm-shake-${width}.png`});
   assert.deepEqual(errors,[]);
   console.log(`${width} PASS ${collisions} collision frames without continuous scene shake`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
