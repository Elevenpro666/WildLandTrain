import {droneOrnaments} from './weapon-ornaments.mjs?rev=fb089a2e3a618b8e';
import {platformPads,mountDisplayEnvelope} from '../../configs/mount-layout.mjs?rev=8bac6ce42d2f4cfe';
import {approvedSprite} from './approved-art.mjs?rev=9aaf92649246d7f9';
// Raster views only: actual launch count, movement and targeting belong to Battle.
export function droneBay(w,s,index=0,count=1){
 const hasArc=s.weapons.some(p=>p.carrier===w.carrier&&p.key==='arc');
 if(s.mountTrialCandidate&&count<=4){
  const padKey=w.carrier==='head'?'head':`carL${Math.max(1,Math.min(3,Number(w.carrierLevel)||1))}`;
  const pads=platformPads[padKey]??platformPads.carL1;
  const mountSlot=w.mountSlots?.[index];
  const [dx,dy]=Number.isInteger(mountSlot)?pads[mountSlot]:hasArc&&count===1?pads[3]:pads[index];
  const x=w.x+dx,y=w.y+dy;
  const advanced=s.mountArtTier==='advanced';
  const fit=mountDisplayEnvelope.drone;
  const base=`<image data-drone-base="${index+1}" data-drone-base-art="v1" href="assets/weapons/drone-bay-base-v1.svg" x="${x-fit.baseWidth/2}" y="${y-fit.baseHeight/2}" width="${fit.baseWidth}" height="${fit.baseHeight}"/>`;
  const door=`<image data-drone-door-art="v1" href="assets/weapons/drone-bay-door-frame-v1.svg" x="${x-fit.spriteWidth/2}" y="${y-fit.spriteWidth/2}" width="${fit.spriteWidth}" height="${fit.spriteWidth}"/>`;
  return `<g data-mount="drone" data-drone-slot="${index+1}" data-drone-pad="${(w.mountSlots?.[index]??index)+1}" data-drone-independent="true" data-drone-art-tier="${advanced?'advanced':'basic'}">${base}${approvedSprite(advanced?'droneBaySquare':'droneBayBasic',x,y,fit.spriteWidth)}${door}${droneOrnaments({...w,x,y:y-28},s)}</g>`;
 }
 const offsets=count===3?[-22,0,22]:count===2?[-17,17]:[0];
 const width=count===3?20:count===2?24:28;
 const height=width*1070/781,x=w.x+offsets[index],y=w.y+(hasArc?49:30);
 return `<g data-mount="drone" data-drone-slot="${index+1}"><svg x="${x-width/2}" y="${y-height/2}" width="${width}" height="${height}" viewBox="194 95 781 1070"><image href="assets/weapons/drone-bay-source-v1.png" width="1170" height="1345"/></svg>${droneOrnaments({...w,x,y:y-28},s)}</g>`;
}
export function droneFlyer(p,s={}){
 // Signal lamp pulses from the battle simulation clock, so it pauses with the game and creates no private timer.
 const pulse=Math.pow(Math.max(0,Math.sin((s.t||0)*6.5)),2);
 const glow=(.03+.94*pulse).toFixed(2),core=(.12+.88*pulse).toFixed(2);
 const electrode=s.upgrades?.droneDamage?'<image data-drone-upgrade-part="droneDamage" data-drone-electrode="paired-contact" href="assets/weapons/drone-electrode-pair-v1.svg" x="-11" y="-4.5" width="22" height="9"/>':'';
 const focus=s.upgrades?.droneFocus?'<image data-drone-focus-part="droneFocus" href="assets/weapons/drone-focus-processor-v1.svg" x="-4.5" y="-3.25" width="9" height="7.5"/>':'';
 const scanPhase=(s.t||0)*96,scanOpacity=(.55+.4*(.5+.5*Math.sin((s.t||0)*7))).toFixed(2);
 const focusScan=s.upgrades?.droneFocus?`<g data-drone-focus-wing-scan="true" fill="none" stroke-linecap="round"><ellipse cx="-9" cy="0" rx="4.1" ry="8.1" stroke="#249ed6" stroke-width="1.8" opacity=".42"/><ellipse cx="9" cy="0" rx="4.1" ry="8.1" stroke="#249ed6" stroke-width="1.8" opacity=".42"/><ellipse cx="-9" cy="0" rx="4.1" ry="8.1" stroke="#b3f8ff" stroke-width=".8" stroke-dasharray="8 13" stroke-dashoffset="${scanPhase.toFixed(1)}" opacity="${scanOpacity}"/><ellipse cx="9" cy="0" rx="4.1" ry="8.1" stroke="#b3f8ff" stroke-width=".8" stroke-dasharray="8 13" stroke-dashoffset="${(-scanPhase).toFixed(1)}" opacity="${scanOpacity}"/><path d="M-9-8v-1.1m0 18.2v-1.1M9-8v-1.1m0 18.2v-1.1" stroke="#eaffff" stroke-width="1.2" opacity="${scanOpacity}"/></g>`:'';
 return `<g data-weapon="drone" data-drone-art="flight-v2-candidate" data-drone-signal="receiver-beacon" data-drone-signal-level="${pulse.toFixed(2)}" transform="translate(${p.x},${p.y})"><svg x="-18" y="-9.5" width="36" height="19" viewBox="0 0 1727 910"><image href="assets/weapons/drone-flyer-v2-candidate.png" width="1727" height="910"/></svg>${electrode}${focusScan}${focus}<rect data-drone-signal-glow="true" x="-1.8" y="-4.85" width="3.6" height="1.75" rx=".68" fill="#ff9d27" opacity="${glow}"/><rect data-drone-signal-bezel="true" x="-1.08" y="-4.43" width="2.16" height=".98" rx=".27" fill="#252b2d" stroke="#e2d6bb" stroke-width=".15"/><rect data-drone-signal-core="true" x="-.78" y="-4.2" width="1.56" height=".5" rx=".16" fill="#ffe38a" stroke="#fff8da" stroke-width=".14" opacity="${core}"/><path data-drone-signal-glint="true" d="M-.52-4.07H.52" stroke="#fff" stroke-width=".13" opacity="${core}"/></g>`;
}
