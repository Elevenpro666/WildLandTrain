import {mountWorkEnvelope,propulsionSlots} from './mount-layout.mjs';

const fallbackBoosterSlots=count=>Array.from({length:count},(_,i)=>[i%2?1:-1,20+Math.floor(i/2)*17]);

export function boosterMountSlot(count,index){
 const slots=propulsionSlots[count]||fallbackBoosterSlots(count);
 return slots[index];
}

export function sawMountCenterY(count,index=0){
 const ys=mountWorkEnvelope.saw.twoSawCenterY;
 return count===2?(ys[index]??mountWorkEnvelope.saw.centerY):mountWorkEnvelope.saw.centerY;
}

function rectanglesOverlap(a,b){
 return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
}

export function checkWeaponMountFit(equipment){
 const carriers=new Map();
 for(const item of equipment){
  if(!item.carrier)continue;
  const group=carriers.get(item.carrier)||[];
  group.push(item);carriers.set(item.carrier,group);
 }

 for(const [carrier,items] of carriers){
  const saws=items.filter(item=>item.key==='saw');
  const boosts=items.filter(item=>item.key==='boost');
  if(!saws.length||!boosts.length)continue;

  const sawRects=[];
  saws.forEach((_,index)=>{
   const y=sawMountCenterY(saws.length,index),fit=mountWorkEnvelope.saw;
   // 联动升级最大行程下的中空承力臂/滑轨扫掠区，左右各一条。
   const innerX=fit.railRootX+fit.railStartInset;
   const outerX=fit.maxCenterX-fit.railEndInset+fit.railStrokeWidth/2;
   const halfHeight=fit.railCenterlineOffset+fit.railStrokeWidth/2;
   sawRects.push({left:innerX,right:outerX,top:y-halfHeight,bottom:y+halfHeight});
   sawRects.push({left:-outerX,right:-innerX,top:y-halfHeight,bottom:y+halfHeight});
   sawRects.push({left:fit.maxCenterX-fit.radius,right:fit.maxCenterX+fit.radius,top:y-fit.radius,bottom:y+fit.radius});
   sawRects.push({left:-fit.maxCenterX-fit.radius,right:-fit.maxCenterX+fit.radius,top:y-fit.radius,bottom:y+fit.radius});
  });

  const collision=boosts.some((_,index)=>{
   const [side,y]=boosterMountSlot(boosts.length,index),fit=mountWorkEnvelope.booster;
   const x=side*mountWorkEnvelope.boosterCenterX;
   const rect={left:x-fit.halfWidth,right:x+fit.halfWidth,top:y-fit.halfHeight,bottom:y+fit.halfHeight};
   return sawRects.some(sawRect=>rectanglesOverlap(sawRect,rect));
  });
  if(collision)return {ok:false,carrier,reason:'切割轮最高级横向往复支架会扫入助推器占位区；请先调整其中一类装备的位置。'};
 }
 return {ok:true,carrier:null,reason:''};
}
