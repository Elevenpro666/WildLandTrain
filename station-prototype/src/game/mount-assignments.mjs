import {platformPads} from '../../configs/mount-layout.mjs';

// 车站、战斗逻辑与表现层共用同一份物理 T 面接口分配。
export function mountAssignments(cars,weapons){
 const assignments=new Map();
 for(const carrier of cars){
  const level=carrier.id==='head'?0:Math.max(1,Math.min(3,Number(carrier.level)||1));
  const padKey=carrier.id==='head'?'head':`carL${level}`,padCount=(platformPads[padKey]??platformPads.carL1).length;
  const occupied=Array(padCount).fill(false),items=weapons.filter(w=>w.carrier===carrier.id);
  const saws=items.filter(w=>w.key==='saw'),rows=Math.floor(padCount/2);
  saws.forEach((weapon,index)=>{
   let row=saws.length===1?Math.floor((rows-1)/2):Math.round(index*(rows-1)/Math.max(1,saws.length-1));
   if(occupied[row*2]||occupied[row*2+1])row=Array.from({length:rows},(_,i)=>i).find(i=>!occupied[i*2]&&!occupied[i*2+1])??row;
   const slots=[row*2,row*2+1];slots.forEach(slot=>occupied[slot]=true);assignments.set(weapon.id,slots);
  });
  for(const weapon of items.filter(w=>w.key!=='saw')){
   const slot=occupied.findIndex(value=>!value);
   if(slot>=0){occupied[slot]=true;assignments.set(weapon.id,[slot]);}
  }
 }
 return assignments;
}

export function mountPoint(car,slot=0){
 const level=car.id==='head'?0:Math.max(1,Math.min(3,Number(car.level)||1));
 const pads=platformPads[car.id==='head'?'head':`carL${level}`]??platformPads.carL1;
 const pad=pads[slot]??pads[0]??[0,0];
 return {x:car.x+pad[0],y:car.y+pad[1],slot};
}
