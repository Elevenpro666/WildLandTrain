const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{
 const p=await b.newPage();await p.goto('http://127.0.0.1:4186/');
 const html=await p.evaluate(async()=>{
  const {weaponsView}=await import('./src/presentation/weapon-feedback.mjs?v=density-1');const {trainBody}=await import('./src/presentation/train-body.mjs');
  const cases=[['arc','drone'],[...Array(7).fill('arc'),'drone'],['drone','drone','drone','arc'],['arc','drone','boost','saw'],Array(10).fill('arc')];
  return [false,true].map(advanced=>`<svg viewBox="0 0 420 640" style="height:100%;max-width:100%">${cases.map((keys,i)=>{
   const c={x:210,y:100+i*65},s={t:1,upgrades:advanced?{arcPulse:1,sawReach:1,sawLinked:1,sawDamage:1}:{},drones:[],weapons:keys.map((key,n)=>({id:'w'+n,carrier:'c'+i,key,...c}))};const before=JSON.stringify(s),drawing=weaponsView(s);if(before!==JSON.stringify(s))throw Error('mutated');
   return `<g data-density-case="${i}">${trainBody(c,i===0)}${drawing}</g>`;
  }).join('')}</svg>`);
 });
 let overlaps=0;for(const width of [320,390])for(let tier=0;tier<2;tier++){
  const f=await b.newPage({viewport:{width,height:width===320?568:844}});await f.setContent(`<base href="http://127.0.0.1:4186/"><body style="margin:0;background:#e7e5d7;height:100vh;display:flex;align-items:center;justify-content:center">${html[tier]}</body>`);
  await f.evaluate(async()=>Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode();})));
  overlaps+=await f.evaluate(()=>{
   // Nested SVG boundingClientRect includes source-image overflow before clipping.
   // Compare the actual clipping viewports, expressed in the same train coordinates.
   const rect=e=>{const x=e.x.baseVal.value,y=e.y.baseVal.value;return {left:x,top:y,right:x+e.width.baseVal.value,bottom:y+e.height.baseVal.value};};
   let n=0;for(const group of document.querySelectorAll('[data-density-case]')){const bay=group.querySelector('[data-mount=drone] svg');if(!bay)continue;const b=rect(bay);for(const arc of group.querySelectorAll('[data-mount=arc]')){const a=rect(arc);if(Math.min(a.right,b.right)>Math.max(a.left,b.left)+.1&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+.1)n++;}}return n;
  });
  await f.screenshot({path:`output/density-${process.argv.includes('--before')?'before':'after'}-${width}-${tier}.png`});await f.close();
 }
 console.log('arc/bay overlaps:',overlaps);if(!process.argv.includes('--before'))assert.equal(overlaps,0);
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
