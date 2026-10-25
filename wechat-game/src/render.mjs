import {upgradeCards} from '../../station-prototype/src/game/upgrades.mjs';

const ink='#20252a',paper='#e8e5da',dark='#303843',gold='#e7ae42',cyan='#55d8e7';
const names={saw:'切割轮',arc:'电弧',drone:'无人机',boost:'助推器'};
export function createRenderer(canvas,ctx,images){
 let W=390,H=844,hits=[];
 const box=(x,y,w,h,fill=paper,stroke=ink,r=8)=>{const R=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+R,y);ctx.lineTo(x+w-R,y);ctx.quadraticCurveTo(x+w,y,x+w,y+R);ctx.lineTo(x+w,y+h-R);ctx.quadraticCurveTo(x+w,y+h,x+w-R,y+h);ctx.lineTo(x+R,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-R);ctx.lineTo(x,y+R);ctx.quadraticCurveTo(x,y,x+R,y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}};
 const line=(x,y,X,Y,color=ink,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();};
 const txt=(value,x,y,size=16,color=ink,align='left',weight='normal')=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(value),x,y);};
 const picture=(name,x,y,w,h,flip=false)=>{const im=images[name];if(im?.loaded&&im.width){ctx.save();if(flip){ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(im,0,0,w,h);}else ctx.drawImage(im,x,y,w,h);ctx.restore();return true;}return false;};
 const button=(label,x,y,w,h,action,kind='light')=>{box(x,y,w,h,kind==='dark'?dark:kind==='gold'?gold:'#f6f4ea',kind==='dark'?null:ink,8);txt(label,x+w/2,y+h/2,17,kind==='dark'?'#fff':ink,'center','bold');hits.push({x,y,w,h,action});};
 const hit=(x,y,w,h,action)=>hits.push({x,y,w,h,action});
 const icon=(key,x,y,size)=>{if(key==='boost'){txt('↑',x+size/2,y+size/2,size*.78,ink,'center','bold');return;}if(!picture(key,x,y,size,size))txt(({saw:'◉',arc:'ϟ',drone:'✣'})[key],x+size/2,y+size/2,size*.7,ink,'center');};
 const bg=()=>{ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);};
 const header=(left,right)=>{box(12,14,W-24,49,'#f2efe5',ink,7);txt(left,26,39,20,ink,'left','bold');txt(right,W-24,39,15,ink,'right','bold');};
 const hash=n=>{let x=(n*1664525+1013904223)>>>0;x^=x>>>16;return x/4294967296;};
 function earthBlob(cx,cy,rx,ry,color,seed){ctx.beginPath();for(let i=0;i<15;i++){const a=i*Math.PI*2/15,r=.58+hash(seed*17+i)*.72,x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fillStyle=color;ctx.fill();}
 function wasteland(scroll){
  ctx.fillStyle='#d5d3c9';ctx.fillRect(-180,-100,780,1250);
  const unit=290,offset=(scroll*.62)%unit,index=Math.floor(scroll*.62/unit);
  for(let j=-2;j<6;j++){
   const id=j-index,y=j*unit+offset,lx=-40+hash(id*7)*100,rx=390-hash(id*11)*70;
   earthBlob(lx,y+hash(id*3)*95,120+hash(id*5)*53,86+hash(id*13)*48,'#aeb9bf',id*3);
   earthBlob(lx+57,y+53+hash(id*17)*72,74,77,'#aeb9bf',id*3+19);
   if(id%3!==0){earthBlob(rx,y+116+hash(id*23)*95,113+hash(id*29)*45,95+hash(id*37)*54,'#b7b9b2',id*5+1);earthBlob(rx-42,y+95,64,72,'#b7b9b2',id*5+7);}
   if(id%2===0)earthBlob(18+hash(id*19)*385,y+212,75,36,'#c5c4b9',id*13+2);
   for(let k=0;k<5;k++){const x=14+hash(id*31+k*13)*390,py=y+15+hash(id*23+k*17)*260,size=5+hash(id*37+k*7)*10;ctx.fillStyle=k===0?'#818a90':'#969991';ctx.beginPath();ctx.moveTo(x-size,py+size*.45);ctx.lineTo(x-size*.45,py-size*.5);ctx.lineTo(x+size*.5,py-size*.4);ctx.lineTo(x+size,py+size*.4);ctx.closePath();ctx.fill();}
   if(id%3===0){ctx.fillStyle='#5c6266';ctx.fillRect(3,y+68,18,24);ctx.fillStyle='#788087';ctx.fillRect(5,y+64,20,7);}
   if(id%4===1){ctx.fillStyle='#575f63';ctx.fillRect(391,y+35,25,16);ctx.fillStyle='#7e8180';ctx.fillRect(382,y+32,25,6);}
  }
 }
 function battleMount(w,t){
  if(w.key==='saw'){const x=w.x+48,y=w.y+1;line(w.x+23,w.y+7,x-10,y,'#303943',9);ctx.fillStyle='#aeb8b8';ctx.strokeStyle=ink;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<9;i++){const a=i*Math.PI*2/9+t*5;line(x+Math.cos(a)*17,y+Math.sin(a)*17,x+Math.cos(a)*24,y+Math.sin(a)*24,'#263039',4);}ctx.fillStyle='#5ad7de';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();return;}
  if(w.key==='arc'){for(const side of [-1,1]){line(w.x+side*17,w.y+4,w.x+side*23,w.y-23,'#222c33',7);ctx.fillStyle=cyan;ctx.beginPath();ctx.arc(w.x+side*23,w.y-25,5,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#263944';ctx.beginPath();ctx.arc(w.x,w.y-1,9,0,Math.PI*2);ctx.fill();return;}
  if(w.key==='drone'){icon(w.key,w.x-20,w.y-18,40);return;}
  ctx.fillStyle=gold;ctx.beginPath();ctx.moveTo(w.x-12,w.y+33);ctx.lineTo(w.x,w.y+52+Math.sin(t*16)*7);ctx.lineTo(w.x+12,w.y+33);ctx.closePath();ctx.fill();
 }
 function station(s){
  bg();const st=s.station,carriers=st.carriers,reserve=st.reserveCars,arriving=s.mode==='arrival',selected=[...carriers,...reserve].find(c=>c.id===s.selected)||carriers[0],equipped=st.equipment.filter(e=>e.carrier===selected.id),turnover=st.equipment.filter(e=>e.carrier===null);
  header('废土整备站',`${st.cash} ◈`);
  txt(`${selected.name}  Lv.${selected.level}   ${selected.used}/${selected.capacity}`,20,82,17,ink,'left','bold');
  box(14,101,W-28,137,'#dcdacf','#6a6c60',8);
  for(let i=0;i<selected.capacity;i++){
   const col=i%5,row=Math.floor(i/5),slotW=62,gap=8,x=25+col*(slotW+gap),y=112+row*58;
   box(x,y,slotW,51,'#eeece2','#9c9d90',6);
  }
  let used=0;for(const e of equipped){const x=25+(used%5)*70,y=112+Math.floor(used/5)*58;const w=Math.min(e.size,5-used%5)*62+(Math.min(e.size,5-used%5)-1)*8;box(x,y,w,51,'#fbf8eb',ink,6);icon(e.key,x+5,y+6,37);txt(e.size>1?`×${e.size}`:'',x+w-5,y+36,13,ink,'right');hit(x,y,w,51,{type:'stash',id:e.id});used+=e.size;}
  txt('点装备移入周转 · 点周转装备装入所选车厢',19,253,13,'#63675e');
  const trainTop=281,trainBottom=H-316,trainY=(trainTop+trainBottom)/2;
  box(14,trainTop,W-28,Math.max(100,trainBottom-trainTop),'#d5d4c8',null,8);
  line(24,trainY-24,W-24,trainY-24,'#797e73',4);line(24,trainY+24,W-24,trainY+24,'#797e73',4);
  const count=carriers.length,space=Math.min(65,(W-65)/count),start=W/2-(count-1)*space/2;
  carriers.forEach((c,i)=>{const x=start+(count-1-i)*space-(arriving?(1-s.arrival.progress)*(W+100):0),y=trainY;const isHead=i===0;
   ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/2);if(!picture(isHead?'head':'car',-24,-34,48,68)){box(-22,-30,44,60,'#898d80',ink,4);}ctx.restore();
   if(c.id===selected.id){ctx.strokeStyle=gold;ctx.lineWidth=4;ctx.strokeRect(x-29,y-40,58,80);}
   txt(isHead?'车头':`L${c.level}`,x,y+49,13,ink,'center','bold');
   hit(x-30,y-42,60,89,{type:s.mergeFrom?'mergeWith':'selectCar',id:c.id});
  });
  if(reserve.length){txt('待编',24,trainBottom-20,13,ink);reserve.slice(0,3).forEach((c,i)=>{const x=70+i*70,y=trainBottom-38;box(x,y,58,32,'#f3efe1',ink,4);txt(`L${c.level}`,x+29,y+16,14,ink,'center');hit(x,y,58,32,{type:s.mergeFrom?'mergeWith':'selectCar',id:c.id});});}
  if(arriving)txt('列车驶入整备站 →',W/2,trainTop+25,15,ink,'center','bold');
  else if(s.message)txt(s.message,W/2,trainTop+25,13,'#654d35','center');
  const bottom=H-302;
  box(14,bottom,W-28,102,'#eeeadd',ink,8);
  txt(`周转 ${turnover.length} 件${reserve.length?' · 待编 '+reserve.length+' 节':''}`,25,bottom+21,16,ink,'left','bold');
  turnover.slice(0,5).forEach((e,i)=>{const x=25+i*69,y=bottom+38;box(x,y,60,61,'#faf7ee',ink,6);icon(e.key,x+5,y+5,36);txt(`${e.size}格`,x+53,y+47,12,ink,'right');hit(x,y,60,61,{type:'install',id:e.id});box(x+42,y+1,18,20,'#f2e5d8','#9c6d5a',3);txt('售',x+51,y+11,11,'#743e30','center');hit(x+37,y,23,26,{type:'sell',id:e.id});});
  if(reserve.length){button('编入待编车厢',W-166,bottom+12,139,35,{type:'attachCart',id:reserve[0].id});}
  const shop=H-161;txt('装备补给',19,shop-17,17,ink,'left','bold');
  const moduleW=(W-38)/4;st.shop.forEach((m,i)=>{const x=14+i*(moduleW+3);box(x,shop,moduleW,76,'#f7f3e8',ink,6);icon(m.key,x+(moduleW-39)/2,shop+5,39);txt(m.name,x+moduleW/2,shop+51,12,ink,'center','bold');txt(`${m.price}◈`,x+moduleW/2,shop+68,12,ink,'center');hit(x,shop,moduleW,76,{type:'buyModule',key:m.key});});
  button('买车 30◈',14,H-76,108,57,{type:'buyCart'});
  button(s.mergeFrom?'取消合成':'合成车厢',130,H-76,111,57,s.mergeFrom?{type:'mergeStart',id:null}:{type:'mergeStart',id:selected.id});
  button('出站 →',249,H-76,W-263,57,{type:'depart'},'dark');
  if(s.confirm){ctx.fillStyle='rgba(22,26,22,.56)';ctx.fillRect(0,0,W,H);box(33,H/2-83,W-66,166,'#f5f1e6',ink,10);txt(s.confirm.type==='merge'?'两节车厢合成，装备进周转？':'确认出售？',W/2,H/2-39,17,ink,'center','bold');button('取消',52,H/2+13,132,48,{type:'cancel'});button('确认',W-184,H/2+13,132,48,{type:'confirm'},'dark');}
 }
 function encounterLine(s){const labels=['小怪','小怪','精英','小怪','BOSS'];const active=s.boss?4:Math.min(3,Math.max(0,Math.floor(s.wave.number/2)));const y=90,w=(W-32)/5;labels.forEach((label,i)=>{const x=16+i*w;line(x+9,y+14,x+w-7,y+14,i<=active?dark:'#acada2',2);ctx.fillStyle=i===active?dark:i<active?'#777c70':'#c8c7bc';ctx.beginPath();ctx.arc(x+6,y+14,5,0,Math.PI*2);ctx.fill();txt(label,x+w/2,y+34,12,ink,'center',i===active?'bold':'normal');});}
 function battle(s){
  bg();const b=s.battle,scale=Math.min(W/420,(H-130)/760),top=H<760?10:55,dx=W/2-210*scale;
  ctx.save();ctx.translate(dx,-top*scale);ctx.scale(scale,scale);
  wasteland(b.scroll);
  const travel=b.scroll%43;for(let y=-43;y<1150;y+=43){line(161,y+travel,259,y+travel,'#8c918b',6);}
  line(171,0,171,1150,'#4b5457',5);line(249,0,249,1150,'#4b5457',5);
  const forward=b.invincible?-Math.min(110,(b.sprint.distance-b.sprint.remaining)*.5):0;
  const formationOffset=Math.max(70,280-(b.cars.length-3)*65);
  ctx.save();ctx.translate(0,formationOffset);
  ctx.save();ctx.translate(0,forward);
  b.cars.forEach((c,i)=>{const im=i===0?'head':'car',width=i===0?78:84,height=i===0?113:101;ctx.fillStyle='rgba(24,28,28,.19)';ctx.beginPath();ctx.ellipse(c.x+4,c.y+33,width*.57,18,0,0,Math.PI*2);ctx.fill();if(!picture(im,c.x-width/2,c.y-height/2,width,height))box(c.x-width/2,c.y-height/2,width,height,'#81888a',ink,5);});
  b.weapons.forEach(w=>battleMount(w,b.t));
  ctx.restore();
  b.enemies.slice(0,90).forEach(e=>{const name=e.boss?'boss':e.elite?'elite':e.fly?'flyer':'walker',size=e.boss?126:e.elite?68:e.fly?43:40,x=e.x+(e.boss?0:(hash(e.id*9)-.5)*21),y=e.y+(e.boss?0:(hash(e.id*23)-.5)*18);ctx.fillStyle='rgba(26,30,31,.19)';ctx.beginPath();ctx.ellipse(x+3,y+size*.31,size*.38,size*.12,0,0,Math.PI*2);ctx.fill();if(!picture(name,x-size/2,y-size/2,size,size,!e.boss&&hash(e.id*31)>.5))box(x-size/2,y-size/2,size,size,e.boss?'#a25b36':'#826d5b',ink,8);if(e.boss||e.elite){ctx.fillStyle='#a64135';ctx.fillRect(x-size/2,y-size/2-8,size*Math.max(0,e.hp/e.maxHp),5);}});
  b.drones.forEach(d=>{ctx.strokeStyle=ink;ctx.lineWidth=3;line(d.x-13,d.y,d.x+13,d.y,ink,3);ctx.fillStyle='#4ecbd7';ctx.beginPath();ctx.arc(d.x,d.y,7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f3ede0';ctx.fillRect(d.x-2,d.y-2,4,4);});
  b.effects.slice(-18).forEach(e=>{const color=e.key==='arc'?cyan:gold,sy=e.y+forward,mx=(e.x+e.tx)/2+(e.key==='arc'?9:-4),my=(sy+e.ty)/2;line(e.x,sy,mx,my,color,e.key==='arc'?5:3);line(mx,my,e.tx,e.ty,color,e.key==='arc'?5:3);ctx.fillStyle=color;for(let i=0;i<6;i++){const a=i*Math.PI/3;line(e.tx+Math.cos(a)*3,e.ty+Math.sin(a)*3,e.tx+Math.cos(a)*11,e.ty+Math.sin(a)*11,color,3);}ctx.beginPath();ctx.arc(e.tx,e.ty,5,0,Math.PI*2);ctx.fill();});
  b.lootFeedback.slice(-8).forEach(drop=>{const age=b.t-drop.time,fy=drop.y-age*38;ctx.fillStyle=cyan;ctx.beginPath();ctx.moveTo(drop.x,fy-7);ctx.lineTo(drop.x+5,fy);ctx.lineTo(drop.x,fy+7);ctx.lineTo(drop.x-5,fy);ctx.closePath();ctx.fill();ctx.fillStyle=gold;ctx.fillRect(drop.x+8,fy-3,5,6);});
  if(b.invincible){ctx.save();ctx.translate(0,forward);ctx.strokeStyle='#fffdf0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(210,b.cars[0].y-24,43,Math.PI,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++)line(150+i*17,b.cars[b.cars.length-1].y+55,145+i*17,b.cars[b.cars.length-1].y+90,'#fff9df',3);ctx.restore();}
  ctx.restore();ctx.restore();
  box(12,12,W-24,62,'rgba(34,42,48,.93)',null,9);ctx.fillStyle=cyan;ctx.fillRect(13,12,4,62);txt(`耐久 ${Math.ceil(b.hp)}/300`,24,30,18,'#fff9ec','left','bold');
  ctx.fillStyle='#778285';ctx.fillRect(24,49,173,8);ctx.fillStyle=b.hp<90?'#e38c57':cyan;ctx.fillRect(24,49,173*Math.max(0,b.hp/300),8);
  txt(`Lv.${b.level}`,W-23,31,16,'#fff9ec','right','bold');txt(`◈ ${s.station.cash}`,W-23,54,14,gold,'right');encounterLine(b);
  if(b.boss){box(W/2-110,132,220,36,'#e7d7ce','#914335',5);txt(`持铁者  ${Math.ceil(b.boss.hp)}/${b.boss.maxHp}`,W/2,150,15,'#692f27','center','bold');}
  const state=b.choices.length?'choose':b.sprintLocked?'locked':b.invincible?'active':b.sprint.energy>=100?'ready':'charge';
  const bx=W-91,by=H-99,cx=bx+37,cy=by+37;ctx.fillStyle=state==='ready'?'#263c45':'#3a4649';ctx.strokeStyle=ink;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,38,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle=state==='ready'?gold:cyan;ctx.lineWidth=5;ctx.beginPath();ctx.arc(cx,cy,34,-Math.PI/2,-Math.PI/2+Math.PI*2*(state==='active'?1:b.sprint.energy/100));ctx.stroke();txt(state==='locked'?'×':state==='active'?'↑↑':'↑',cx,cy-9,30,'#f7f3e4','center','bold');txt(state==='locked'?'封锁':'冲刺',cx,cy+20,14,'#fff','center','bold');hit(bx-7,by-7,89,89,{type:'sprint'});
  if(b.choices.length){ctx.fillStyle='rgba(31,36,31,.73)';ctx.fillRect(0,0,W,H);txt('选择强化',W/2,H*.27,25,'#fff','center','bold');b.choices.forEach((card,i)=>{const y=H*.35+i*91;box(28,y,W-56,78,'#f1efe5',ink,8);icon(card.weapon||'boost',43,y+16,45);txt(card.name,102,y+26,18,ink,'left','bold');txt(card.weapon?names[card.weapon]:'通用强化',102,y+55,14,'#5d675d');hit(28,y,W-56,78,{type:'choose',id:card.id});});}
 }
 function arrival(s){station(s);hits=[];}
 function result(s){bg();txt(s.result.win?'远征完成':'列车失守',W/2,H*.37,29,ink,'center','bold');txt(`击败 ${s.result.kills}`,W/2,H*.45,18,ink,'center');button('重新出发',W/2-100,H*.57,200,62,{type:'reset'},'dark');}
 return {resize(width,height){W=390;H=height/width*390;canvas.width=Math.round(width);canvas.height=Math.round(height);if(canvas.style){canvas.style.width=width+'px';canvas.style.height=height+'px';}ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);},render(state){hits=[];ctx.clearRect(0,0,W,H);if(state.mode==='battle')battle(state);else if(state.mode==='arrival')arrival(state);else if(state.mode==='result')result(state);else station(state);},touch(px,py){const x=px/canvas.width*W,y=py/canvas.height*H;for(let i=hits.length-1;i>=0;i--){const h=hits[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)return h.action;}return null;},size:()=>({W,H})};
}
