import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:chromium.executablePath()});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4190/dev-preview.html');
await page.locator('canvas').waitFor();
await page.waitForTimeout(350);
await mkdir('output/canvas-flow',{recursive:true});
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const click=(x,y)=>page.mouse.click(x,y);
const advance=ms=>page.evaluate(value=>window.advanceTime(value),ms);
await page.screenshot({path:'output/canvas-flow/station.png'});
assert.equal((await state()).mode,'station');
await click(61,795);assert.equal((await state()).cash,60);
await click(98,405);assert.equal((await state()).selected,'c10');
await click(145,725);assert.equal((await state()).cash,48);
await click(312,795);assert.equal((await state()).mode,'battle');
await page.screenshot({path:'output/canvas-flow/departure.png'});
let selectedCards=0,bossSeen=false,arrivalSeen=false,manualSprint=false;
for(let n=0;n<500;n++){
 const s=await state();
 if(s.mode==='result')break;
 if(s.mode==='station'){await click(312,795);continue;}
 if(s.mode==='arrival'){arrivalSeen=true;await advance(1500);await page.screenshot({path:'output/canvas-flow/arrival.png'});await advance(2000);continue;}
 if(s.choices?.length){if(!selectedCards)await page.screenshot({path:'output/canvas-flow/choice.png'});await click(190,844*.35+39);selectedCards++;continue;}
 if(s.boss!==undefined&&!bossSeen){bossSeen=true;await page.screenshot({path:'output/canvas-flow/boss.png'});}
 if(!manualSprint&&s.sprintEnergy>=100&&!s.sprintLocked){await click(336,782);const after=await state();assert.equal(after.sprintActive,true);manualSprint=true;await advance(1500);await page.screenshot({path:'output/canvas-flow/manual-sprint.png'});}
 if(n===4)await page.screenshot({path:'output/canvas-flow/combat.png'});
 await advance(1000);
}
const end=await state();
await page.screenshot({path:'output/canvas-flow/result.png'});
assert.equal(end.mode,'result');assert.equal(end.phase,'won');
assert.ok(selectedCards>0);assert.equal(bossSeen,true);assert.equal(arrivalSeen,true);assert.equal(manualSprint,true);
assert.deepEqual(errors,[]);
await click(195,844*.57+31);assert.equal((await state()).mode,'station');
await page.setViewportSize({width:320,height:568});
await page.waitForTimeout(100);
await page.screenshot({path:'output/canvas-flow/station-320.png'});
assert.equal((await state()).mode,'station');
await page.mouse.click(320*312/390,568*795/844);
assert.equal((await state()).mode,'battle');
await page.screenshot({path:'output/canvas-flow/battle-320.png'});
await page.setViewportSize({width:390,height:844});
await page.goto('http://127.0.0.1:4190/dev-preview.html');
await page.waitForTimeout(100);
await click(185,795);
await click(130,405);
assert.equal((await state()).confirm,'merge');
await page.screenshot({path:'output/canvas-flow/merge-confirm.png'});
await click(270,458);
assert.equal((await state()).turnover,4);
await page.screenshot({path:'output/canvas-flow/turnover.png'});
await click(74,580);
assert.equal((await state()).confirm,'sell');
await click(270,458);
assert.equal((await state()).turnover,3);
await click(312,795);
assert.equal((await state()).mode,'station');
assert.deepEqual(errors,[]);
console.log('PASS Canvas触控：整备购买与装配、出站、选卡、入站、Boss、三段胜利及重开；无页面异常');
await browser.close();
