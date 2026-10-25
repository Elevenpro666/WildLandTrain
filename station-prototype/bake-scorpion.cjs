const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch();try{const p=await browser.newPage();await p.route('**/bake-shell',r=>r.fulfill({contentType:'text/html',body:'<body></body>'}));await p.goto('http://127.0.0.1:4191/bake-shell');const url=await p.evaluate(async()=>{
 const {createScorpionMotion}=await import('/美术设计/M16怪群运动验证/animation.js');const {applySkin}=await import('/美术设计/M16怪群运动验证/skin-renderer.js');
 const image=new Image();image.src='/美术设计/M13荒土生态配色/荒土蝎.png';await image.decode();const colored=applySkin(image,{offsets:[[0,0,0],[-25,-30,-34],[-3,-5,-7]]});
 const c=document.createElement('canvas');c.width=120;c.height=146;c.getContext('2d').drawImage(colored,167,67,921,1115,0,0,120,146);
 const source={im:c,w:30,h:36.5,bodyW:30,bodyH:36.5};const motion=createScorpionMotion(source,1,4,{columns:8,rows:12,frames:12});
 const sheet=document.createElement('canvas');sheet.width=12*120;sheet.height=292;const ctx=sheet.getContext('2d');for(let row=0;row<2;row++)for(let f=0;f<12;f++)ctx.drawImage(motion.frame(row?'attack':'walk',f/12).im,f*120,row*146);return sheet.toDataURL();
});fs.writeFileSync(__dirname+'/assets/scorpion-motion-approved.png',Buffer.from(url.split(',')[1],'base64'));console.log('Baked 24 frames');}finally{await browser.close();}})();
