import {upgradeCards,weaponStats} from '../game/upgrades.mjs?rev=43e9b7d674cf0733';
import {sawMount} from './saw-mount.mjs?rev=eb13b80589c47f77';
import {arcMounts} from './arc-mount.mjs?rev=49eee3e018744596';
import {droneBay,droneFlyer} from './drone-view.mjs?rev=858b3f9e28921ca1';
import {supplyOrnament} from './weapon-ornaments.mjs?rev=fb089a2e3a618b8e';
import {vehicleBodyWidth} from '../../configs/vehicle-geometry.mjs';
import {platformPads,mountDisplayEnvelope,rearBankBooster,boostLayerTrialMount} from '../../configs/mount-layout.mjs?rev=8bac6ce42d2f4cfe';
import {boosterMountSlot} from '../../configs/mount-fit.mjs';
import {mountAssignments} from '../game/mount-assignments.mjs';
import {repulsorMount,repulsorEffect} from './repulsor-view.mjs?rev=82c6e8086a2fa255';

import {assetUrl} from './art-asset-registry.mjs?rev=c02ad52a83438f4d';

function arcHash(value){
 let hash=2166136261;
 for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return hash>>>0;
}
function electricDischarge(e,s,x,y){
 const dx=e.tx-x,dy=e.ty-y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
 const seed=arcHash(`${e.weaponId}:${e.targetId}:${e.pulse||'primary'}`),segments=Math.max(5,Math.min(9,Math.round(length/22)));
 const phase=(s.t||0)*58+(seed%997)*.013,points=[{x,y}];
 for(let i=1;i<segments;i++){
  const t=i/segments,noise=Math.sin(phase+i*8.17)*4.2+Math.sin(phase*.53+i*13.1)*2.1;
  points.push({x:x+dx*t+nx*noise,y:y+dy*t+ny*noise});
 }
 points.push({x:e.tx,y:e.ty});
 const opacity=Math.min(1,e.life/.13),pulse=.82+.18*Math.sin(phase*.7);
 // Only the high-voltage primary strike (and its required secondary pulse) gets a thicker channel.
 // Chain damage, reach and target-count upgrades do not imply greater current output.
 const highVoltage=!!s.upgrades?.arcDamage&&e.damage===weaponStats('arc',s.upgrades).damage;
 const auraWidth=highVoltage?17:6,channelWidth=highVoltage?9:2.8,coreWidth=highVoltage?3.1:.9;
 const dash=-(phase*1.7%24).toFixed(1);
 const linked=!!e.arcCountLinked&&e.arcChainIndex>0,branchCount=linked?Math.min(5,e.arcChainIndex+1):0;
 const pathFor=(fanOffset=0)=>points.map((p,index)=>{
  const t=index/(points.length-1),x=p.x+nx*fanOffset*t,y=p.y+ny*fanOffset*t;
  return `${index?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
 }).join(' ');
 const path=pathFor();
 const branchFan=linked?Array.from({length:branchCount},(_,i)=>{
  const offset=(i-(branchCount-1)/2)*3.2,d=pathFor(offset);
  return `<g data-arc-chain-branch="${i+1}" data-arc-chain-branch-count="${branchCount}"><path d="${d}" stroke="#1c8fea" stroke-width="4.5" opacity=".28"/><path d="${d}" stroke="#39dfff" stroke-width="1.9" opacity=".98"/><path d="${d}" stroke="#f1ffff" stroke-width=".65" stroke-dasharray="4 3" stroke-dashoffset="${dash}" opacity=".92"/></g>`;
 }).join(''):'';
 return `<g data-arc-discharge="plasma-v1" data-arc-power-tier="${highVoltage?'high-voltage':'base'}" data-arc-branch-count="${branchCount}" data-arc-pulse="${e.pulse||'primary'}" data-arc-chain-index="${e.arcChainIndex??0}" data-arc-chain-origin="${linked?'previous-target':'weapon-emitter'}" data-arc-count-feedback="${linked?'multilevel-branch':'single-strand'}" opacity="${opacity.toFixed(2)}" fill="none" stroke-linecap="round" stroke-linejoin="round">
  ${linked?branchFan:`<path data-arc-layer="aura" d="${path}" stroke="#1c8fea" stroke-width="${auraWidth}" opacity="${highVoltage?'.3':'.24'}"/><path data-arc-layer="ion-channel" d="${path}" stroke="#32d9ff" stroke-width="${channelWidth}" opacity="${(.72*pulse).toFixed(2)}"/><path data-arc-layer="hot-core" d="${path}" stroke="#f1ffff" stroke-width="${coreWidth}" stroke-dasharray="4 2" stroke-dashoffset="${dash}"/>`}
  <circle data-arc-emitter-flash="true" cx="${x}" cy="${y}" r="${(2.8*pulse).toFixed(1)}" fill="#eaffff" stroke="#39dcff" stroke-width="1.5"/>
  <circle data-arc-impact-flash="true" cx="${e.tx}" cy="${e.ty}" r="${(7.5+1.5*pulse).toFixed(1)}" stroke="#8cf7ff" stroke-width="1.7" opacity=".9"/>
  <circle cx="${e.tx}" cy="${e.ty}" r="2.8" fill="#f7ffff" stroke="#45dfff" stroke-width="1.2"/>
 </g>`;
}

function rearBankMount(w,s,index){
 const [dx,dy]=rearBankBooster.slots[index],x=w.x+dx,y=w.y+dy;
 const active=s.sprint.phase!=='charging',strength=s.sprint.phase==='sprinting'?1:s.sprint.phase==='decelerating'?.55:.3;
 const glow=active?(.45+.4*strength+.15*Math.sin(s.t*25)).toFixed(2):'.25';
 const rocket=s.boostArtTrial==='rocket',enhanced=rocket||s.boostArtTrial==='enhanced';
 const flameLength=s.sprint.phase==='sprinting'?8.4:s.sprint.phase==='decelerating'?5.8:3.8;
 const flamePulse=.88+.12*Math.sin((s.t||0)*38+index*1.7),flameOpacity=(rocket?(.78+.22*flamePulse):0).toFixed(2);
 const rocketFlame=rocket?`<g data-boost-flame="rocket" data-boost-flame-state="${s.sprint.phase}" transform="translate(0,5.1)" opacity="${flameOpacity}"><path d="M-3.1 0Q-2.4 ${flameLength*.28} 0 ${flameLength}Q2.4 ${flameLength*.28} 3.1 0Z" fill="#e77835"/><path d="M-2.1 0Q-1.4 ${flameLength*.24} 0 ${flameLength*.78}Q1.4 ${flameLength*.24} 2.1 0Z" fill="#ffd16b"/><path d="M-.9 0Q-.5 ${flameLength*.2} 0 ${flameLength*.52}Q.5 ${flameLength*.2} .9 0Z" fill="#f8fff1"/><path d="M-3.3 0Q0 1.2 3.3 0" fill="none" stroke="#91eaff" stroke-width=".55" opacity=".85"/></g>`:'';
 const art=assetUrl(rocket?'booster.rear.rocket':enhanced?'booster.rear.turbine':'booster.rear.base');
 // One compact overhead turbine per slot. This candidate art is evaluated at its real 15×12 B envelope.
 return `<g data-mount="boost" data-boost-design="rear-bank" data-boost-art="${rocket?'rocket':enhanced?'enhanced':'base'}" data-boost-slot="${index+1}" data-boost-state="${s.sprint.phase}" transform="translate(${x},${y})"><rect x="-7.5" y="-6" width="15" height="12" fill="none"/><svg x="-7.5" y="-6" width="15" height="12" viewBox="95 125 1210 875"><image href="${art}" width="1402" height="1122"/></svg>${!enhanced?`<image data-boost-nozzle-art="base-v1" href="assets/weapons/boost-nozzle-collar-v1.svg" x="-4.5" y="1" width="9" height="5"/>`:''}${enhanced?`<circle data-boost-rotor="reinforced" cy="-.25" r="3.2" fill="none" stroke="#9fe7e8" stroke-width=".75" opacity=".8"/>${rocket?`<path data-boost-rocket-bell="true" d="M-2 1H2L5.5 5.3H-5.5Z" fill="#343b3c" stroke="#ce8b57" stroke-width=".9"/><path d="M-1.3 1.6H1.3L3.5 4.4H-3.5Z" fill="#11191b"/><path d="M-5.4 5.2H5.4" stroke="#f4c28a" stroke-width=".7"/>`:`<path data-boost-dual-outlet="true" d="M-3.3 4.3h2.5M.8 4.3h2.5" stroke="#b5f6ec" stroke-width="1"/>`}`:''}${rocketFlame}${active?`<path data-boost-heat="true" d="M-3 5.2Q0 ${5.6+strength*.3} 3 5.2" fill="none" stroke="#9de7da" stroke-width=".55" opacity="${glow}"/>`:''}</g>`;
}

function rearBankFrame(w){
 const x=w.x,y=w.y+55.5;
 return `<g data-boost-bank-frame="true" transform="translate(${x},${y})"><image data-boost-bank-frame-art="v1" href="assets/weapons/boost-rear-bank-frame-v1.svg" x="-36" y="-6" width="72" height="11"/></g>`;
}

function boostLayerMount(w,s,index,count){
 const slots=boostLayerTrialMount.slots[Math.min(count,4)]||boostLayerTrialMount.slots[4];
 const [side,dy]=slots[index]||slots[slots.length-1];
 const x=w.x+side*boostLayerTrialMount.centerOffset,y=w.y+dy;
 const rootX=w.x+side*boostLayerTrialMount.rootOffset;
 const phase=s.sprint.phase,active=!s.done;
 const strength=phase==='sprinting'?1:phase==='decelerating'?.55:.3;
 const rocket=s.boostArtTrial==='rocket',enhanced=rocket||s.boostArtTrial==='enhanced';
 const art=assetUrl(rocket?'booster.rear.rocket':enhanced?'booster.rear.turbine':'booster.rear.base');
 const flameLength=phase==='sprinting'?8.4:phase==='decelerating'?5.8:3.8;
 const pulse=.88+.12*Math.sin((s.t||0)*38+index*1.7);
 const flame=active?'<g data-boost-flame="rocket" data-boost-flame-state="'+phase+'" transform="translate(0,5.1)" opacity="'+(.78+.22*pulse).toFixed(2)+'"><path d="M-3.1 0Q-2.4 '+(flameLength*.28)+' 0 '+flameLength+'Q2.4 '+(flameLength*.28)+' 3.1 0Z" fill="#e77835"/><path d="M-2.1 0Q-1.4 '+(flameLength*.24)+' 0 '+(flameLength*.78)+'Q1.4 '+(flameLength*.24)+' 2.1 0Z" fill="#ffd16b"/><path d="M-.9 0Q-.5 '+(flameLength*.2)+' 0 '+(flameLength*.52)+'Q.5 '+(flameLength*.2)+' .9 0Z" fill="#f8fff1"/></g>':'';
 const support='<g data-boost-layer-support="body-edge-clamp" data-boost-support-side="'+(side<0?'left':'right')+'" transform="translate('+rootX+','+y+') scale('+side+',1)"><path d="M-11 -6H1V6H-11Z" fill="#2c3a3f" stroke="#121c20" stroke-width="1.7"/><path d="M-9 -3H-2M-9 3H-2" stroke="#91a5a5" stroke-width="1.1"/><circle cx="-8" cy="-3" r="1.15" fill="#d0c8ae" stroke="#263339" stroke-width=".5"/><circle cx="-8" cy="3" r="1.15" fill="#d0c8ae" stroke="#263339" stroke-width=".5"/><path d="M-1 -4V4" stroke="#17242a" stroke-width="1.5"/></g>';
 const bell=rocket?'<path data-boost-rocket-bell="true" d="M-2 1H2L5.5 5.3H-5.5Z" fill="#343b3c" stroke="#ce8b57" stroke-width=".9"/><path d="M-1.3 1.6H1.3L3.5 4.4H-3.5Z" fill="#11191b"/><path d="M-5.4 5.2H5.4" stroke="#f4c28a" stroke-width=".7"/>':'';
 const heat=active?'<path data-boost-heat="true" d="M-3 5.2Q0 '+(5.6+strength*.3)+' 3 5.2" fill="none" stroke="#9de7da" stroke-width=".55" opacity="'+(.55+strength*.4).toFixed(2)+'"/>':'';
 return support+'<g data-mount="boost" data-boost-design="integrated-body-edge" data-boost-mount-contact="side-skirt" data-boost-height-layer="body" data-boost-carrier="'+w.carrier+'" data-boost-art="'+(rocket?'rocket':enhanced?'enhanced':'base')+'" data-boost-slot="'+(index+1)+'" data-boost-state="'+phase+'" transform="translate('+x+','+y+')"><ellipse data-boost-shadow="true" cx="1.7" cy="2.2" rx="8.2" ry="6.7" fill="#101c22" opacity=".32"/>'+flame+'<svg x="-7.5" y="-6" width="15" height="12" viewBox="95 125 1210 875" overflow="visible"><image href="'+art+'" width="1402" height="1122"/></svg>'+(rocket?'<circle cx="0" cy="-.25" r="3.2" fill="none" stroke="#9fe7e8" stroke-width=".75" opacity=".85"/>':'')+bell+'<path d="M-5.4 5.2H5.4" stroke="#f4c28a" stroke-width=".7"/>'+heat+'</g>';
}

function boosterMount(w,s,index,count){
 const phase=s.sprint.phase,active=phase!=='charging';
 const strength=phase==='sprinting'?1:phase==='decelerating'?Math.max(.12,s.sprint.decelerationRemaining/1.2):0;
 const pulse=.88+.12*Math.sin(s.t*31);
 const reach=(10+22*strength)*pulse;
 const jets=active?(s.mountTrialCandidate?[0]:[-4,4]).map(x=>`<g transform="translate(${x},11)" opacity="${(.7+.3*strength).toFixed(2)}"><path d="M-4 0 Q-6 ${reach*.3} -1 ${reach} Q5 ${reach*.5} 4 0Z" fill="#9b512f"/><path d="M-3 0 Q-3 ${reach*.32} 0 ${reach*.82} Q3 ${reach*.34} 3 0Z" fill="#f3b961"/><path d="M-1.5 0 Q0 ${reach*.25} 0 ${reach*.52} Q2 ${reach*.2} 1.5 0Z" fill="#e7fff0"/></g>`).join(''):'';
 const slots={1:[[-1,37]],2:[[-1,37],[1,37]],3:[[-1,20],[1,37],[-1,53]],4:[[-1,20],[1,20],[-1,53],[1,53]]};
 const [side,dy]=s.mountTrialCandidate?boosterMountSlot(count,index):(slots[count]||Array.from({length:count},(_,i)=>[i%2?1:-1,20+Math.floor(i/2)*17]))[index];
 const edge=vehicleBodyWidth/2;
 const fit=mountDisplayEnvelope.booster;
 const x=w.x+side*(s.mountTrialCandidate?fit.centerOffset:edge),y=w.y+dy,root=w.x+side*(s.mountTrialCandidate?fit.rootOffset:edge-8);
 const scale=s.mountTrialCandidate?1:count>=3?.84:.94;
 const bracket=s.mountTrialCandidate
  ?`<g data-boost-bracket="${side<0?'left':'right'}" data-boost-support="edge-clamps" transform="translate(${root},${y}) scale(${side},1)"><path d="M-4 -8H9M-4 8H9" stroke="#1b292e" stroke-width="4"/><path d="M-3 -8H8M-3 8H8" stroke="#8aa4aa" stroke-width="1.8"/><circle cx="0" cy="-8" r="1.7" fill="#bfc5bd"/><circle cx="0" cy="8" r="1.7" fill="#bfc5bd"/></g>`
  :`<g data-boost-bracket="${side<0?'left':'right'}"><rect x="${root-4}" y="${y-8}" width="8" height="16" rx="2" fill="#344a55" stroke="#17232a" stroke-width="2"/><circle cx="${root}" cy="${y-4}" r="1.5" fill="#b5b7aa"/><circle cx="${root}" cy="${y+4}" r="1.5" fill="#b5b7aa"/><path d="M${root} ${y-5}H${x}M${root} ${y+5}H${x}" stroke="#1b2830" stroke-width="5"/><path d="M${root} ${y-5}H${x}M${root} ${y+5}H${x}" stroke="#78909a" stroke-width="2"/></g>`;
 const art=s.mountTrialCandidate
  ?`<svg x="${-fit.width/2}" y="${-fit.height/2}" width="${fit.width}" height="${fit.height}" viewBox="230 240 690 840" overflow="visible"><image href="${assetUrl('booster.sidePod.integrated')}" width="1150" height="1368"/></svg>`
  :'<svg x="-9" y="-12" width="18" height="25" viewBox="19 19 991 1375" overflow="visible"><image href="'+assetUrl("booster.compat")+'" width="1062" height="1480"/></svg>';
 return `${bracket}<g data-mount="boost" data-boost-slot="${index+1}" data-boost-side="${side<0?'left':'right'}" data-boost-state="${phase}" transform="translate(${x},${y}) scale(${scale})">${jets}${art}${active?`<path d="M-4 -1h8" stroke="#d7f8e8" stroke-width="${(1+strength*1.2).toFixed(2)}" opacity="${(.5+strength*.5).toFixed(2)}"/>`:''}</g>`;
}

export function weaponsView(s){
 // Allocate every carrier's physical T interfaces once; every renderer consumes the same map.
 const assignments=mountAssignments(s.cars,s.weapons);
 const groups=[];
 for(const w of s.weapons){
  const carrierLevel=w.carrier==='head'?0:Math.max(1,Math.min(3,Number(s.cars.find(c=>c.id===w.carrier)?.level)||1));
  const slots=assignments.get(w.id)??[0];
  let group=groups.find(item=>item.carrier===w.carrier&&item.key===w.key);
  if(group){group.count++;group.mountSlots.push(slots[0]);group.occupiedSlots.push(...slots);}
  else groups.push({...w,carrierLevel,count:1,mountSlots:[slots[0]],occupiedSlots:[...slots]});
 }
 const drawGroups=s.boostLayerCandidate?[...groups].sort((a,b)=>(a.key==='boost'?1:0)-(b.key==='boost'?1:0)):groups;
 return drawGroups.map(w=>{
  if(w.key==='saw')return Array.from({length:w.count},(_,index)=>sawMount(w,s,index,w.count)).join('');
  if(w.key==='drone')return Array.from({length:w.count},(_,index)=>droneBay(w,s,index,w.count)).join('');
  if(w.key==='repulsor')return Array.from({length:w.count},(_,index)=>repulsorMount(w,s,index)).join('');
  if(w.key==='boost')return s.boostLayerCandidate?Array.from({length:w.count},(_,index)=>boostLayerMount(w,s,index,w.count)).join(''):(s.rearBankCandidate&&w.carrier!=='head'?rearBankFrame(w):'')+Array.from({length:w.count},(_,index)=>s.rearBankCandidate&&w.carrier!=='head'&&index<rearBankBooster.slots.length?rearBankMount(w,s,index):boosterMount(w,s,index,w.count)).join('');
  return arcMounts(w,s);
 }).join('')+supplyOrnament(s);
}
export function droneFlyersView(s){
 return (s.drones||[]).map(d=>droneFlyer(d,s)).join('');
}
export function droneTargetingView(s){
 return (s.drones||[]).map(d=>{
  const target=s.enemies.find(e=>e.id===d.target);
  if(!target||target.hp<=0||target.knock)return '';
  if(s.upgrades?.droneFocus){
   const dx=target.x-d.x,dy=target.y-d.y,length=Math.hypot(dx,dy)||1,stop=9,tx=target.x-dx/length*stop,ty=target.y-dy/length*stop;
   const progress=.5+.5*Math.sin((s.t||0)*2.8+d.id.length),px=d.x+dx*progress,py=d.y+dy*progress,opacity=(.62+.3*(.5+.5*Math.sin((s.t||0)*6))).toFixed(2),phase=-((s.t||0)*24%18).toFixed(1);
   return `<g data-drone-focus-lock="true" data-drone-focus-target="${target.id}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M${d.x} ${d.y}L${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="#36c9ee" stroke-width="1.1" stroke-dasharray="3 7" stroke-dashoffset="${phase}" opacity=".72"/><path d="M${d.x} ${d.y}L${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="#e7ffff" stroke-width=".45" stroke-dasharray="1 14" stroke-dashoffset="${phase}" opacity=".72"/><circle data-drone-focus-scan-pulse="true" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.7" fill="#bcfaff" stroke="#1ac8ee" stroke-width=".8" opacity="${opacity}"/><circle data-drone-focus-reticle="true" cx="${target.x}" cy="${target.y}" r="5.5" stroke="#9bf5ff" stroke-width="1.25" stroke-dasharray="5 3" opacity="${opacity}"/><path d="M${target.x-7} ${target.y}h3m8 0h3M${target.x} ${target.y-7}v3m0 8v3" stroke="#efffff" stroke-width="1" opacity="${opacity}"/></g>`;
  }
  if(s.upgrades?.dronePatrol){
   const dx=target.x-d.x,dy=target.y-d.y,length=Math.hypot(dx,dy)||1,stop=8,tx=target.x-dx/length*stop,ty=target.y-dy/length*stop;
   const phase=-((s.t||0)*18%14).toFixed(1),pulse=.7+.2*(.5+.5*Math.sin((s.t||0)*4+d.id.length));
   const color=d.slot%2?'#69e1c9':'#62caff';
   return `<g data-drone-patrol-assignment="true" data-drone-patrol-target="${target.id}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M${d.x} ${d.y}L${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="${color}" stroke-width="1.3" stroke-dasharray="3 7" stroke-dashoffset="${phase}" opacity="${pulse.toFixed(2)}"/><path d="M${d.x} ${d.y}L${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="#eaffff" stroke-width=".45" stroke-dasharray="1 13" stroke-dashoffset="${phase}" opacity=".76"/><circle data-drone-patrol-mark="true" cx="${target.x}" cy="${target.y}" r="3.1" stroke="${color}" stroke-width="1" stroke-dasharray="2 3" opacity="${pulse.toFixed(2)}"/><path d="M${target.x-4.5} ${target.y}h2m5 0h2M${target.x} ${target.y-4.5}v2m0 5v2" stroke="#eaffff" stroke-width=".7" opacity="${pulse.toFixed(2)}"/></g>`;
  }
  if(d.timer>.18)return '';
  const pulse=.72+.28*Math.sin((s.t||0)*36);
  return `<g data-drone-lock="true" data-drone-target="${target.id}" transform="translate(${target.x},${target.y})" opacity="${pulse.toFixed(2)}" fill="none" stroke="#7cecff" stroke-width="1.25" stroke-linecap="round"><circle r="3.5" stroke-dasharray="4 3"/><path d="M-6 0h2m8 0h2M0-6v2m0 8v2"/></g>`;
 }).join('');
}
export function hitView(s){
 return s.effects.map(e=>{
  const opacity=Math.min(1,e.life/.15);
  if(e.key==='repulsor')return repulsorEffect(e,s);
  if(e.key==='saw')return `<path d="M${e.tx-10} ${e.ty+8}l20 -16m-19 0l18 16m-9 -22v10" stroke="#a44e3e" stroke-width="3" opacity="${opacity}"/>`;
  let x=e.x,y=e.y;
  if(s.mountTrialCandidate&&e.key==='arc'&&!e.arcCountLinked){
   const weapon=s.weapons.find(w=>w.id===e.weaponId);
   if(weapon){
    const siblings=s.weapons.filter(w=>w.carrier===weapon.carrier&&w.key==='arc');
    const carrierLevel=weapon.carrier==='head'?0:Math.max(1,Math.min(3,Number(s.cars.find(c=>c.id===weapon.carrier)?.level)||1));
    const slot=mountAssignments(s.cars,s.weapons).get(weapon.id)?.[0]??0;
    const pad=platformPads[weapon.carrier==='head'?'head':`carL${carrierLevel}`][slot];
   if(pad&&siblings.length<=4){
    // The T pad is the weapon center; begin slightly inside the emitter lip so the
    // discharge visually touches the hardware rather than floating beyond its outer edge.
    const facing=pad[0]<0?-1:1;
    x=weapon.x+pad[0]+facing*2;
    y=weapon.y+pad[1];
   }
   }
  }
  if(e.key==='drone'){
   const elapsed=Math.max(0,.25-e.life),travel=.14,upgraded=!!s.upgrades?.droneDamage;
   if(elapsed<travel){
    const dx=e.tx-x,dy=e.ty-y,length=Math.hypot(dx,dy)||1,progress=Math.min(1,elapsed/travel),px=x+dx*progress,py=y+dy*progress,tail=Math.min(upgraded?9:6,length*(upgraded?.5:.38)),sx=px-dx/length*tail,sy=py-dy/length*tail;
    return `<g data-drone-attack-phase="pulse" data-drone-attack-tier="${upgraded?'reinforced':'base'}">${upgraded?`<path data-drone-pulse-aura="true" d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${px.toFixed(1)} ${py.toFixed(1)}" stroke="#168bff" stroke-width="9" stroke-linecap="round" opacity=".58"/>`:''}<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${px.toFixed(1)} ${py.toFixed(1)}" stroke="#20bcf3" stroke-width="${upgraded?5:2.5}" stroke-linecap="round" opacity="${upgraded?'.96':'.78'}"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${upgraded?4.2:2.3}" fill="#30dfff" opacity="${upgraded?'.86':'.48'}"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${upgraded?2.2:1.25}" fill="#f2ffff"/></g>`;
   }
   const impactProgress=Math.min(1,(elapsed-travel)/(.25-travel)),impactOpacity=(1-impactProgress).toFixed(2),radius=(upgraded?7:4)+(upgraded?4:2.5)*impactProgress,spark=upgraded?2.6:1.3;
   return `<g data-drone-attack-phase="impact" data-drone-attack-tier="${upgraded?'reinforced':'base'}" transform="translate(${e.tx},${e.ty})" opacity="${impactOpacity}" fill="none" stroke-linecap="round">${upgraded?`<circle data-drone-impact-aura="true" r="${(radius+4).toFixed(1)}" stroke="#168bff" stroke-width="3.2" opacity=".68"/>`:''}<circle r="${radius.toFixed(1)}" stroke="#33dfff" stroke-width="${spark}"/><circle r="${(radius+(upgraded?3:2)).toFixed(1)}" stroke="#eaffff" stroke-width="${upgraded?1.4:.8}" opacity=".9"/><path d="M-13 -5l6 2m14 0l6-2M-5 13l2-6m6 0l2 6M-12 7l5-2m14 0l5 2M-7-12l2 5m0 14l-2 5" stroke="#c7fbff" stroke-width="${spark}"/><circle r="${upgraded?3.4:2.2}" fill="#eaffff" stroke="#4adfff" stroke-width="${upgraded?1.6:1}"/></g>`;
  }
  if(e.key==='arc')return electricDischarge(e,s,x,y);
  const mx=(x+e.tx)/2,my=(y+e.ty)/2;
  const path=`M${x} ${y}L${mx+9} ${my-8}l-18 16L${e.tx} ${e.ty}`;
  return `<path d="${path}" fill="none" stroke="#658d92" stroke-width="2" opacity="${opacity}"/>`;
 }).join('');
}
export function upgradeFeedback(s){
 const age=s.lastUpgrade?s.t-s.lastUpgrade.time:99;
 const card=upgradeCards.find(c=>c.id===s.lastUpgrade?.id);
 if(!card||age>=1.8)return '';
 const mount=s.weapons.find(w=>w.key===card.weapon);
 const x=mount?.x??s.cars[0].x,y=(mount?.y??s.cars[0].y)-10;
 const icon={arc:'upgrade-arc-v1.svg',saw:'upgrade-saw-v1.svg',drone:'upgrade-drone-v1.svg'}[card.weapon]||'upgrade-supply-v1.svg';
 return `<g data-upgrade-icon="${card.weapon||'all'}" opacity="${Math.min(1,(1.8-age)*3)}" transform="translate(${x+30},${y-27})"><circle r="15" fill="#eeebdf" stroke="#30372a" stroke-width="2"/><image href="assets/battle-state/${icon}" x="-12" y="-12" width="24" height="24"/></g>`;
}
