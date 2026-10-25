import {weaponStats} from '../game/upgrades.mjs';
import {sawSweepOffset} from '../game/saw-kinematics.mjs';
import {mountWorkEnvelope,platformPads} from '../../configs/mount-layout.mjs?rev=8bac6ce42d2f4cfe';
import {sawMountCenterY} from '../../configs/mount-fit.mjs';
import {sawBasicAppearance} from '../../configs/weapon-skins.mjs';
import {headDeckSlot} from './train-shared-parts.mjs?rev=0af98ad74c19b72a';

// 战斗与表现共用模拟时间和横向位移公式；本函数不拥有时钟。
export function sawMount(w,s,slot=0,count=1){
 const p=weaponStats('saw',s.upgrades),logicalRadius=(p.reach-25)/2;
 const tier=s.upgrades.sawDamage?'advanced':'basic';
 const advancedBlue=tier==='advanced'&&s.advancedSawArt==='blue';
 const asset=tier==='advanced'?(advancedBlue?{id:'advanced-blue',url:'assets/weapons/saw-advanced-blue-v1-candidate.png',box:'0 0 1254 1254',size:[1254,1254]}:{id:'legacy',url:'assets/weapons/saw-advanced-source-v1.png',box:'158 158 938 938',size:[1254,1254]}):sawBasicAppearance(s.weaponSkinId);
 const clay=tier==='basic'&&['clayred','claygloss'].includes(s.weaponSkinId);
 const bandFace=tier==='advanced'&&!advancedBlue?'#555653':clay?'#76534d':'#326492';
 const bandEdge=tier==='advanced'&&!advancedBlue?'#d0cec5':clay?'#9a7168':'#81acd0';
 const bandAccent=tier==='advanced'&&!advancedBlue?'#9c9e9a':clay?'#493a39':'#9b735b';
 const degreesPerSecond=s.upgrades.sawRate?1800:1200;
 const angle=(s.t*degreesPerSecond)%360;
 const linked=!!s.upgrades.sawLinked;
 const slide=sawSweepOffset(s.t,p.sweep);
 const carrierLevel=w.carrier==='head'?0:Math.max(0,Math.min(3,Number(w.carrierLevel)||0));
 const r=logicalRadius,offset=p.reach-r;
 const mountSlot=w.mountSlots?.[slot],mountRow=Number.isInteger(mountSlot)?Math.floor(mountSlot/2)+1:slot+1;
 const padKey=`carL${carrierLevel}`,padY=platformPads[padKey]?.[(mountRow-1)*2]?.[1];
 const y=w.y+(carrierLevel>0&&Number.isFinite(padY)?padY:sawMountCenterY(count,slot));
 const mountBases=[-1,1].map(side=>{
  const padIndex=(mountRow-1)*2+(side>0?1:0),padX=w.x+(platformPads[padKey]?.[padIndex]?.[0]??side*10);
  return headDeckSlot(padX,y,`data-saw-slot-base="true" data-saw-slot-side="${side<0?'left':'right'}" data-saw-slot-row="${mountRow}" data-t-slot-style="head-slot-resource" pointer-events="none"`);
 }).join('');
 const supports=linked?`<g data-upgrade-art="sawLinked" pointer-events="none">${[-1,1].map(side=>{
  const fit=mountWorkEnvelope.saw;
  const root=w.x+side*fit.railRootX,end=w.x+side*(offset+slide),railStart=root+side*fit.railStartInset,railEnd=end-side*fit.railEndInset;
  const railPath=`M${railStart} ${y-fit.railCenterlineOffset}H${railEnd}M${railStart} ${y+fit.railCenterlineOffset}H${railEnd}`;
  return `<g data-saw-support="${side<0?'left':'right'}" data-saw-hollow="true"><image data-saw-support-art="root" href="assets/weapons/saw-linked-root-v1.svg" x="${root-6}" y="${y-9}" width="12" height="18"/><path data-saw-load-beam="true" d="${railPath}" stroke="#15232c" stroke-width="${fit.railStrokeWidth}" stroke-linecap="square"/><path d="${railPath}" stroke="#6f8fa1" stroke-width="2.6" stroke-linecap="square"/><path d="M${railStart} ${y-7.5}H${railEnd}" stroke="#b5c2bf" stroke-width=".8"/><image data-saw-support-art="slider" href="assets/weapons/saw-linked-slider-v1.svg" x="${end-5}" y="${y-8}" width="10" height="16"/></g>`;
 }).join('')}</g>`:'';
 const blades=[-1,1].map(side=>{
  const x=w.x+side*(offset+slide),root=w.x+side*18;
  const spinBands=`<g data-saw-spin-bands pointer-events="none"><circle cx="${x}" cy="${y}" r="${r*.65}" fill="${bandFace}" opacity=".88"/><circle cx="${x}" cy="${y}" r="${r*.67}" fill="none" stroke="${bandEdge}" stroke-width="${r*.06}" opacity=".75"/><circle cx="${x}" cy="${y}" r="${r*.55}" fill="none" stroke="${bandAccent}" stroke-width="${r*.08}" opacity=".48"/><circle cx="${x}" cy="${y}" r="${r*.37}" fill="#27313d" stroke="#18222a" stroke-width="1"/><circle cx="${x}" cy="${y}" r="${r*.22}" fill="#777a79"/></g>`;
  const arm=linked?`<path d="M${root} ${y-6}H${w.x+side*25}M${root} ${y+6}H${w.x+side*25}" stroke="#253844" stroke-width="3"/><path d="M${root} ${y-6}H${w.x+side*25}" stroke="#82a6b6" stroke-width="1.4"/>`:`<path d="M${root} ${y-4}L${x} ${y-3}V${y+3}L${root} ${y+4}Z" fill="#92938a" stroke="#30342e" stroke-width="1.5"/>`;
  const driveHub=s.upgrades.sawRate?`<image data-upgrade-art="sawRate" data-saw-drive-hub="high-speed" href="assets/weapons/saw-high-speed-hub-v1.svg" x="${x-5}" y="${y-5}" width="10" height="10"/>`:'';
  return `<g data-saw-tier="${tier}" data-saw-skin="${asset.id}" data-saw-slot="${(mountSlot??slot)+1}" data-saw-mount-row="${mountRow}" data-saw-x="${x}" data-saw-y="${y}" data-saw-reach="${p.reach+slide}" data-saw-spin-speed="${degreesPerSecond}">${arm}<circle cx="${root}" cy="${y}" r="4" fill="#647f90" stroke="#192a34" stroke-width="1.5"/><g data-saw-rotor transform="rotate(${angle} ${x} ${y})" opacity=".85"><svg x="${x-r}" y="${y-r}" width="${r*2}" height="${r*2}" viewBox="${asset.box}"><image href="${asset.url}" width="${asset.size[0]}" height="${asset.size[1]}"/></svg></g>${spinBands}${driveHub}</g>`;
 }).join('');
 return mountBases+supports+blades;
}
