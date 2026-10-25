const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{
 const p=await b.newPage();await p.goto('http://127.0.0.1:4186/');
 const variants=await p.evaluate(async()=>{
  const {arcMounts}=await import('./src/presentation/arc-mount.mjs');
  const {trainBody}=await import('./src/presentation/train-body.mjs');
  return [false,true].flatMap(advanced=>[false,true].map(spread=>{
   const cars=Array.from({length:5},(_,i)=>({x:210,y:160+i*65}));
   return {advanced,spread,html:`<svg viewBox="0 0 420 640" style="width:100%;height:100%"><path d="M195 0V640M225 0V640" stroke="#999"/>${cars.map((c,i)=>{
    const count=i===0?4:10,s={upgrades:advanced?{arcPulse:1}:{},weapons:Array.from({length:count},()=>({key:'arc',carrier:'c'+i}))};
    let drawing=arcMounts({...c,count,carrier:'c'+i},s);
    if(spread&&i>0){const doc=new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${drawing}</svg>`,'image/svg+xml');
     const cols=advanced?3:4,rows=Math.ceil(count/cols),ratio=advanced?655/1080:735/687,w=Math.min(54/cols,46/rows/ratio),h=w*ratio;
     [...doc.documentElement.children].forEach((e,n)=>{const row=Math.floor(n/cols),inRow=Math.min(cols,count-row*cols);e.setAttribute('x',c.x+(n%cols-(inRow-1)/2)*(54/cols)-w/2);e.setAttribute('y',c.y+26+(row-(rows-1)/2)*46/rows-h/2);e.setAttribute('width',w);e.setAttribute('height',h)});
     drawing=doc.documentElement.innerHTML;
    }
    return trainBody(c,i===0)+drawing;
   }).join('')}</svg>`};
  }));
 });
 for(const width of [320,390])for(const v of variants){
  await p.setViewportSize({width,height:width===320?568:844});
  await p.setContent(`<base href="http://127.0.0.1:4186/"><body style="margin:0;background:#e7e5d7"><div style="height:calc(100vh - 130px);margin-top:60px">${v.html}</div></body>`);
  await p.evaluate(async()=>Promise.all([...document.querySelectorAll('image')].map(e=>{const i=new Image();i.src=e.getAttribute('href');return i.decode()})));
  assert.equal(await p.locator('[data-mount=arc]').count(),44);
  await p.screenshot({path:`output/arc-spread-${width}-${v.advanced?'advanced':'basic'}-${v.spread?'candidate':'current'}.png`});
 }
 console.log('PASS: 8 full-train fixtures, 44 mounts each, source decoding; no runtime changes');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
