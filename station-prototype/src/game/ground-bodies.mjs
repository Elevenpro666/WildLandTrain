import {vehicleBodyWidth} from '../../configs/vehicle-geometry.mjs';
// 世界占位：只处理位置，不结算伤害；同一Battle步调用，无独立时钟。
export function groundProps(distance){return [['tree',48,150,44,7],['rock',357,285,28,12],['rock',63,655,24,10],['tree',352,730,38,7]].map(([kind,x,y,width,radius])=>({kind,x,y:(y+distance)%1100-60,width,radius}));}
export function blockTrain(e,cars){
 e.climbing=false;e.contactCar=null;
 for(let i=0;i<cars.length;i++){
  const c=cars[i],top=i===0?c.y-82:c.y-21,bottom=c.y+(i===0?57:73),half=vehicleBodyWidth/2;
  if(e.y<top-10||e.y>bottom+10||Math.abs(e.x-c.x)>half+14)continue;
  const side=e.trainSide??(e.x<c.x?-1:1);
  e.x=c.x+side*(half+14);e.trainSide=side;
  e.climbing=!e.emerging;e.contactCar=c.id;
 }
}
export function separateGround(enemies,distance,cars=[]){
 for(const e of enemies)if(e.hp<=0||e.fly||e.boss||e.knock||e.exited){e.climbing=false;e.contactCar=null;}
 const active=enemies.filter(e=>e.hp>0&&!e.fly&&!e.boss&&!e.knock&&!e.repel&&!e.exited);
 const props=groundProps(distance);
 for(let pass=0;pass<12;pass++){
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const a=active[i],b=active[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=28)continue;if(d<.001){dx=0;dy=1;d=1;}const n=(28-d)/2;a.x-=dx/d*n;a.y-=dy/d*n;b.x+=dx/d*n;b.y+=dy/d*n;}
  for(const e of active)for(const p of props){const py=p.y+(p.kind==='tree'?10:2);let dx=e.x-p.x,dy=e.y-py,d=Math.hypot(dx,dy),min=14+p.radius;if(d>=min)continue;if(d<.001){dx=1;dy=0;d=1;}e.x=p.x+dx/d*min;e.y=py+dy/d*min;}
  if(cars.length)for(const e of active)blockTrain(e,cars);
 }
}
