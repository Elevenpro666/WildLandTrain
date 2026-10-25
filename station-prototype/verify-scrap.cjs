const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{for(const width of [320,390]){
 const p=await b.newPage({viewport:{width,height:width===320?568:844}});await p.goto('http://127.0.0.1:4186/');
 await p.locator('[data-action=depart]').click();let s;
 for(let i=0;i<400;i++){s=await p.evaluate(()=>{advanceTime(33);return JSON.parse(render_game_to_text());});if(s.lootFeedback.length&&!s.choices.length)break;}
 assert.ok(s.scrapEarned>0);assert.equal(s.scrapEarned,s.kills);
 await p.locator('[data-action=pauseBattle]').click();
 await p.screenshot({path:`output/scrap-${width}.png`});assert.ok(await p.locator('[data-loot=scrap]').count());
 const earned=(await p.evaluate(()=>JSON.parse(render_game_to_text()))).scrapEarned;
 await p.locator('[data-action=returnStation]').click();assert.equal((await p.evaluate(()=>JSON.parse(render_game_to_text()))).cash,90+earned);
 await p.close();
}console.log('PASS scrap matches kills, particles, wallet after return 320/390');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
