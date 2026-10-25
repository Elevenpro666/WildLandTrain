const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4186/');await p.locator('[data-action=depart]').click();
 await p.evaluate(()=>advanceTime(1800));await p.locator('[data-action=pauseBattle]').click();
 assert.equal(await p.locator('[data-mount-count="2"]').count(),1);
 assert.equal(await p.locator('[data-mount="drone"]').count(),1);
 await p.screenshot({path:'output/mounts-game-390.png'});
 const result=await p.evaluate(async()=>{
  const {weaponsView}=await import('./src/presentation/weapon-feedback.mjs?v=arc-art-2');
  const cases=[['saw','saw'],['drone','arc'],Array(6).fill('arc'),['drone','drone','drone','arc'],Array(10).fill('boost')];
  const s={t:1,upgrades:{},drones:[],weapons:cases.flatMap((keys,i)=>keys.map((key,j)=>({id:`${i}-${j}`,carrier:`c${i}`,key,x:210,y:40+i*65})))};
  const before=JSON.stringify(s),svg=weaponsView(s);
  document.querySelector('.battle-field').innerHTML=`<svg viewBox="0 0 420 640">${cases.map((_,i)=>`<rect x="185" y="${40+i*65}" width="50" height="52" fill="#faf9ed" stroke="#30372a"/>`).join('')}${svg}</svg>`;
  return {unchanged:before===JSON.stringify(s),svg,fixture:document.querySelector('.battle-field').innerHTML};
 });
 assert.ok(result.unchanged);for(const n of [2,3,10])assert.ok(result.svg.includes(`data-mount-count="${n}"`));
 assert.equal((result.svg.match(/data-arc-tier=/g)||[]).length,8);
 const fixture=await browser.newPage({viewport:{width:390,height:844}});
 await fixture.setContent(`<base href="http://127.0.0.1:4186/"><body style="margin:0;background:#e7e5d7;font:14px sans-serif"><p>挂载满载检查（非实战）</p>${result.fixture}</body>`);
 await fixture.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode();}));});
 await fixture.screenshot({path:'output/mounts-stress-390.png'});
 await fixture.setViewportSize({width:320,height:568});await fixture.screenshot({path:'output/mounts-stress-320.png'});
 assert.deepEqual(errors,[]);console.log('PASS: live mounts, five full-load drawing fixtures, immutable snapshot, 320/390 screenshots');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
