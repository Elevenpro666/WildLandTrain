const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{for(const width of [320,390]){
  const p=await browser.newPage({viewport:{width,height:width===320?568:844}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();
  let s;
  for(let i=0;i<400;i++){
   s=await p.evaluate(()=>{advanceTime(33);return JSON.parse(render_game_to_text());});
   assert.equal(s.experience,s.kills);assert.ok(s.lootFeedback.length<=64);
   if(s.lootFeedback.length&&!s.choices.length)break;
   if(s.choices.length)await p.locator('[data-action=chooseUpgrade]').first().click();
  }
  assert.ok(s.lootFeedback.length);await p.locator('[data-action=pauseBattle]').click();
  const before=await p.evaluate(()=>render_game_to_text());await p.evaluate(()=>advanceTime(1000));
  assert.equal(await p.evaluate(()=>render_game_to_text()),before);
  assert.ok(await p.locator('[data-loot=experience]').count());
  await p.screenshot({path:`output/loot-${width}.png`});assert.deepEqual(errors,[]);await p.close();
 }}finally{await browser.close();}
 console.log('PASS 320/390 real kill feedback, XP consistency, pause freeze, visible particles');
})().catch(e=>{console.error(e);process.exitCode=1;});
