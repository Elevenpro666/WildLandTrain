const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:320,height:568}});await page.goto('http://127.0.0.1:4186/');
 const drawings=await page.evaluate(async()=>{
  const {arcMounts}=await import('./src/presentation/arc-mount.mjs');
  return [false,true].map(advanced=>[5,7,10].map(count=>{
   const state={upgrades:advanced?{arcPulse:1}:{},weapons:Array.from({length:count},()=>({carrier:'c',key:'arc'}))};
   const before=JSON.stringify(state),svg=arcMounts({count,carrier:'c',x:50,y:0},state);
   if(JSON.stringify(state)!==before)throw Error('state mutation');
   return {advanced,count,svg};
  })).flat();
 });
 let body='';for(const d of drawings){
  const candidate=d.svg.replaceAll(`assets/weapons/arc-${d.advanced?'advanced':'basic'}-source-v2.png`,`output/arc-${d.advanced?'advanced':'basic'}-dense-v2.png`).replaceAll(d.advanced?'87 314 1080 655':'284 277 687 735',d.advanced?'28 310 1197 655':'223 206 808 873');
  assert.equal((candidate.match(/data-mount="arc"/g)||[]).length,d.count);
  body+=`<section><span>${d.advanced?'双极':'单极'} ×${d.count}</span><svg viewBox="0 0 100 60">${d.svg}</svg><svg viewBox="0 0 100 60">${candidate}</svg></section>`;
 }
 await page.setContent(`<base href="http://127.0.0.1:4186/"><style>body{margin:8px;background:#e7e5d7;font:12px sans-serif}header,section{display:grid;grid-template-columns:64px 1fr 1fr;align-items:center}section{height:80px;border-bottom:1px solid #aaa}svg{width:100%;height:70px}</style><header><span>320px对比</span><span>现用</span><span>简化候选</span></header>${body}`);
 await page.evaluate(async()=>Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode()})));
 await page.screenshot({path:'output/arc-dense-candidate-320.png'});
 console.log('PASS: counts, immutable state, source decoding; visual comparison requires inspection');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
