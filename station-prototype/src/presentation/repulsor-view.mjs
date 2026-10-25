import {platformPads} from '../../configs/mount-layout.mjs';
import {assetUrl} from './art-asset-registry.mjs?rev=c02ad52a83438f4d';
import {headDeckSlot} from './train-shared-parts.mjs';

export function repulsorMount(weapon,state,index=0){
 const level=weapon.carrier==='head'?0:Math.max(1,Math.min(3,Number(state.cars.find(car=>car.id===weapon.carrier)?.level)||1));
 const pads=platformPads[weapon.carrier==='head'?'head':`carL${level}`]??platformPads.carL1;
 const slot=weapon.mountSlots?.[index]??weapon.mountSlot??0,[dx,dy]=pads[slot]??pads[0];
 const x=weapon.x+dx,y=weapon.y+dy,pulse=(.68+.22*Math.sin((state.t||0)*6+index)).toFixed(2);
 return `<g data-mount="repulsor" data-repulsor-carrier="${weapon.carrier}" data-repulsor-slot="${slot+1}" data-repulsor-layer="T-face" transform="translate(${x},${y})">
  ${headDeckSlot(0,0,'data-repulsor-slot-base="shared-head-slot"')}
  <circle r="10.5" fill="#163a45" opacity=".22"/>
  <image data-repulsor-art="repulsor.tslot.basic" href="${assetUrl('repulsor.tslot.basic')}" x="-9" y="-9" width="18" height="18"/>
  <circle data-repulsor-core-live="true" r="4.2" fill="none" stroke="#c9ffff" stroke-width=".7" opacity="${pulse}"/>
 </g>`;
}

export function repulsorEffect(effect,state){
 const duration=effect.maxLife??.52,age=Math.max(0,duration-effect.life),progress=Math.min(1,age/duration),opacity=(1-progress).toFixed(2);
 const cars=effect.fieldCars??[],radius=effect.fieldRadius??56;
 const groupLeft=effect.fieldLeft??Math.min(...cars.map(car=>car.x-car.halfWidth)),groupRight=effect.fieldRight??Math.max(...cars.map(car=>car.x+car.halfWidth));
 const groupTop=effect.fieldTop??Math.min(...cars.map(car=>car.top)),groupBottom=effect.fieldBottom??Math.max(...cars.map(car=>car.bottom));
 const maxHalfWidth=cars.length?Math.max(...cars.map(car=>car.halfWidth)):37,reach=effect.fieldReach??Math.max(8,radius-maxHalfWidth);
 const groupX=(groupLeft+groupRight)/2,phase=((state.t||0)*96).toFixed(1),spread=progress*5;
 const uid=`repulsor-${String(effect.targetId??'target').replace(/[^a-z0-9_-]/gi,'')}`;
 const outlinePath=(left,top,right,bottom,chamfer)=>`M${left+chamfer} ${top}H${right-chamfer}L${right} ${top+chamfer}V${bottom-chamfer}L${right-chamfer} ${bottom}H${left+chamfer}L${left} ${bottom-chamfer}V${top+chamfer}Z`;
 const edgeFlow=cars.map((car,index)=>{
  const left=car.left??car.x-car.halfWidth,right=car.right??car.x+car.halfWidth,mid=(car.top+car.bottom)/2,wave=Math.min(reach,5+progress*(reach-3)),bodyPath=outlinePath(left,car.top,right,car.bottom,8);
  return `<g data-repulsor-field-car="${car.carrier}" data-field-left="${left}" data-field-right="${right}" data-field-top="${car.top}" data-field-bottom="${car.bottom}">
   <path d="${bodyPath}" stroke="#32c9d8" stroke-width="5" opacity=".12" filter="url(#${uid}-glow)"/>
   <path data-repulsor-edge-flow="true" data-outline="chamfered-car" d="${bodyPath}" stroke="url(#${uid}-rim)" stroke-width="1.05" stroke-dasharray="3 2 10 3" stroke-dashoffset="-${phase}" filter="url(#${uid}-warp)"/>
   <path data-repulsor-pressure-front="left" d="M${left-wave} ${car.top+9}Q${left-wave-4} ${mid},${left-wave} ${car.bottom-9}" stroke="#c7ffff" stroke-width="${(1.2-progress*.5).toFixed(2)}" opacity="${(.58-progress*.36).toFixed(2)}" filter="url(#${uid}-warp)"/>
   <path data-repulsor-pressure-front="right" d="M${right+wave} ${car.top+9}Q${right+wave+4} ${mid},${right+wave} ${car.bottom-9}" stroke="#c7ffff" stroke-width="${(1.2-progress*.5).toFixed(2)}" opacity="${(.58-progress*.36).toFixed(2)}" filter="url(#${uid}-warp)"/>
   <path d="M${left+7} ${car.top}Q${car.x} ${car.top-3-index},${right-7} ${car.top}M${left+7} ${car.bottom}Q${car.x} ${car.bottom+3+index},${right-7} ${car.bottom}" stroke="#8af4fa" stroke-width=".75" opacity=".6" filter="url(#${uid}-glow)"/>
  </g>`;
 }).join('');
 const sources=(effect.emitters??[]).map((emitter,index)=>{
  const car=cars.find(item=>item.carrier===emitter.carrier);
  const left=car?(car.left??car.x-car.halfWidth):groupLeft,right=car?(car.right??car.x+car.halfWidth):groupRight,top=car?.top??groupTop,bottom=car?.bottom??groupBottom;
  const useLeft=emitter.x<=(car?.x??groupX),side=useLeft?'left':'right',sign=useLeft?-1:1,wallX=useLeft?left:right;
  const entryY=Math.max(top+7,Math.min(bottom-7,emitter.y)),nearX=emitter.x+sign*Math.min(5,Math.max(2,Math.abs(wallX-emitter.x)*.35));
  return `<g data-repulsor-energy-source="${emitter.carrier}" data-repulsor-nearest-wall="${side}">
   <circle cx="${emitter.x}" cy="${emitter.y}" r="${(7+3*progress).toFixed(1)}" fill="url(#${uid}-core)" opacity="${(.92-.34*progress).toFixed(2)}" filter="url(#${uid}-glow)"/>
   <circle cx="${emitter.x}" cy="${emitter.y}" r="${(2+1.5*progress).toFixed(1)}" fill="#f4ffff" opacity="${(.95-.25*progress).toFixed(2)}"/>
   <path data-repulsor-energy-conduit="nearest-wall" d="M${nearX} ${emitter.y}C${nearX+sign*3} ${emitter.y-index},${wallX-sign*3} ${entryY+index},${wallX} ${entryY}" stroke="#e5ffff" stroke-width="1.55" stroke-dasharray="2 2 6 2" stroke-dashoffset="-${phase}" filter="url(#${uid}-glow)"/>
   <g data-repulsor-energy-entry="${side}" filter="url(#${uid}-glow)">
    <circle cx="${wallX}" cy="${entryY}" r="${(2.4+1.5*progress).toFixed(1)}" fill="#eaffff" opacity=".9"/>
    <path d="M${wallX} ${entryY}V${top+7}M${wallX} ${entryY}V${bottom-7}" stroke="#9bfbff" stroke-width="1.25" stroke-dasharray="2 3 8 3" stroke-dashoffset="${useLeft?'-':''}${phase}"/>
   </g>
   <circle cx="${wallX}" cy="${entryY-7-progress*5}" r=".9" fill="#fff"/><circle cx="${wallX}" cy="${entryY+7+progress*6}" r=".75" fill="#9effff"/>
  </g>`;
 }).join('');
 const propagation=effect.linked?`<g data-repulsor-propagation="adjacent-cars" stroke="#b8ffff" stroke-width=".9" stroke-dasharray="2 4 9 5" stroke-dashoffset="-${phase}" opacity=".7" filter="url(#${uid}-glow)"><path d="M${groupLeft} ${groupTop+5}V${groupBottom-5}"/><path d="M${groupRight} ${groupTop+5}V${groupBottom-5}"/></g>`:'';
 const shellX=groupLeft-reach-spread,shellY=groupTop-reach-spread,shellRight=groupRight+reach+spread,shellBottom=groupBottom+reach+spread;
 const shellPath=outlinePath(shellX,shellY,shellRight,shellBottom,12+reach*.25),outerPath=outlinePath(shellX-2,shellY-2,shellRight+2,shellBottom+2,14+reach*.25);
 return `<g data-repulsor-field="contact-release" data-repulsor-target="${effect.targetId}" data-repulsor-field-tier="${effect.linked?'linked':'local'}" data-field-reference="car-bounds" data-field-left="${groupLeft}" data-field-right="${groupRight}" data-field-top="${groupTop}" data-field-bottom="${groupBottom}" opacity="${opacity}" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <defs>
   <radialGradient id="${uid}-core"><stop offset="0" stop-color="#fff"/><stop offset=".22" stop-color="#c7ffff" stop-opacity=".95"/><stop offset=".58" stop-color="#36dbea" stop-opacity=".46"/><stop offset="1" stop-color="#13788e" stop-opacity="0"/></radialGradient>
   <linearGradient id="${uid}-rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#54dae6" stop-opacity=".3"/><stop offset=".34" stop-color="#f2ffff"/><stop offset=".68" stop-color="#74f4ff" stop-opacity=".62"/><stop offset="1" stop-color="#1787a1" stop-opacity=".2"/></linearGradient>
   <linearGradient id="${uid}-veil" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#0b5366" stop-opacity=".05"/><stop offset=".18" stop-color="#65edf4" stop-opacity=".34"/><stop offset=".5" stop-color="#d8ffff" stop-opacity=".08"/><stop offset=".82" stop-color="#65edf4" stop-opacity=".34"/><stop offset="1" stop-color="#0b5366" stop-opacity=".05"/></linearGradient>
   <filter id="${uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
   <filter id="${uid}-warp" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".025 .11" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.7"/></filter>
  </defs>
  ${sources}${edgeFlow}${propagation}
  <path data-repulsor-train-envelope="inner" data-outline="chamfered-car-union" d="${shellPath}" fill="url(#${uid}-veil)" stroke="#4edbe7" stroke-width="6" opacity=".035" filter="url(#${uid}-glow)"/>
  <path data-repulsor-train-envelope="outer" data-outline="chamfered-car-union" d="${outerPath}" stroke="url(#${uid}-rim)" stroke-width="${(.65-.22*progress).toFixed(2)}" stroke-dasharray="2 9 13 17" stroke-dashoffset="-${phase}" opacity="${(.2-.1*progress).toFixed(2)}" filter="url(#${uid}-warp)"/>
  <g data-repulsor-contact-ripple="impact" transform="translate(${effect.tx} ${effect.ty})" filter="url(#${uid}-glow)">
   <path d="M${-(7+14*progress)} -3C${-(3+5*progress)} ${-(9+10*progress)},${3+5*progress} ${-(9+10*progress)},${7+14*progress} -2" stroke="#ecffff" stroke-width="${(1.7-.7*progress).toFixed(2)}"/>
   <path d="M${-(8+17*progress)} 3C${-(2+7*progress)} ${8+12*progress},${4+8*progress} ${7+10*progress},${9+17*progress} 1" stroke="#4be0eb" stroke-width="${(2.1-1.1*progress).toFixed(2)}"/>
   <circle cx="${-5-progress*8}" cy="${2-progress*5}" r="1.1" fill="#fff"/><circle cx="${4+progress*10}" cy="${-1+progress*4}" r=".9" fill="#9effff"/>
  </g>
 </g>`;
}
