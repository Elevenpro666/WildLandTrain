import {arcOrnaments} from './weapon-ornaments.mjs?rev=fb089a2e3a618b8e';
import {approvedSprite} from './approved-art.mjs?rev=9aaf92649246d7f9';
import {platformPads} from '../../configs/mount-layout.mjs?rev=8bac6ce42d2f4cfe';
import {assetUrl} from './art-asset-registry.mjs?rev=c02ad52a83438f4d';
// Presentation-only bounds in source pixels; no gameplay dimensions are changed.
const art=Object.freeze({
 basic:{url:assetUrl('arc.emitter.basic'),box:[284,277,687,735]},
 advanced:{url:assetUrl('arc.emitter.advanced'),box:[87,314,1080,655]},
});
// 高压绕组是独立储能部件；不同装配尺度只改变显示尺寸，不重画结构。
function highVoltageCapacitor(x,y,width,height,tier=1){
 return `<g data-upgrade-part="arcDamage" data-arc-capacitor-tier="${tier}" transform="translate(${x},${y})"><image data-arc-capacitor-art="v1" href="${assetUrl('arc.upgrade.highVoltageCapacitor')}" x="${-width/2}" y="${-height/2}" width="${width}" height="${height}"/></g>`;
}
function doublePulseCapacitor(x,y,width,height){
 return `<g data-upgrade-part="arcPulse" data-arc-pulse-capacitor="v1" transform="translate(${x},${y})"><image href="${assetUrl('arc.upgrade.pulseCapacitor')}" x="${-width/2}" y="${-height/2}" width="${width}" height="${height}"/></g>`;
}
// 空闲炮口只保留微弱、短促的电荷跳火，不画表示方向的箭头形零件。
function idleDischargeSpark(time=0){
 const opacity=(.38+.42*Math.abs(Math.sin(time*18))).toFixed(2);
 return `<g data-arc-idle-spark="v1" opacity="${opacity}" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M13-.8 14.1-2.2 14.7-.3 16-.9M13.2 1 14 .2 14.8 1.5 16 .8" stroke="#176c76" stroke-width="2.2"/>
  <path d="M13-.8 14.1-2.2 14.7-.3 16-.9M13.2 1 14 .2 14.8 1.5 16 .8" stroke="#7ef5ed" stroke-width="1.15"/>
  <circle cx="14.8" cy=".5" r=".75" fill="#edfff1" stroke="#8ffbf1" stroke-width=".45"/>
 </g>`;
}
export function arcMounts(group,s){
 if(s.artVersion==='approved'){
  if(s.arcCountArtComparison&&group.carrier!=='c1')return '';
  if(s.mountTrialCandidate&&group.count<=4){
   const padKey=group.carrier==='head'?'head':`carL${Math.max(1,Math.min(3,Number(group.carrierLevel)||1))}`;
   const pads=platformPads[padKey]??platformPads.carL1;
   const hasDrone=s.weapons.some(w=>w.carrier===group.carrier&&w.key==='drone');
   const selected=group.mountSlots?.length?group.mountSlots.map(index=>pads[index]).filter(Boolean):s.arcCountArtComparison&&group.carrier==='c1'?[pads[0],pads[1]]:hasDrone&&group.count===1&&group.carrier!=='head'?[pads[0]]:pads.slice(0,group.count);
   return selected.map(([dx,dy],index)=>{
    const side=dx<0?-1:1;
    // Platform pad is the equipment's visual center. Attack direction is expressed by
    // mirroring the emitter only; offsetting the hardware here would pull it off the T slot.
    const x=group.x+dx,y=group.y+dy;
    const advanced=s.mountArtTier==='advanced';
    const tier=s.upgrades.arcPulse?2:s.upgrades.arcDamage?1:0;
    const compareBase=s.arcCountArtComparison&&group.carrier==='c1'&&index===0;
    const conductor=s.upgrades.arcCount?'':s.upgrades.arcReach
     ?`<g data-upgrade-part="arcReach" data-arc-conductor="extended"><image data-arc-conductor-art="v1" href="${assetUrl('arc.upgrade.reachConductor')}" x="11" y="-4" width="15" height="8"/></g>`
     :idleDischargeSpark(s.t||0);
    const capacitor=tier===2?doublePulseCapacitor(0,0,14,16):tier===1?highVoltageCapacitor(0,0,14,16,1):'';
    const bodyArt=s.upgrades.arcCount||compareBase?'arcForkBasic':advanced?'arcFork':'arcForkBasic';
    const body=approvedSprite(bodyArt,0,0,18,{clip:true});
    const inductionRings=s.upgrades.arcCount&&!compareBase?approvedSprite('arcCountUpgrade',0,0,18,{clip:true}):'';
    return `<g data-mount="arc" data-arc-state="${tier===2?'parallel':tier===1?'high-voltage':s.upgrades.arcCount?'chain-capacity':'basic'}" data-arc-art-tier="${compareBase?'comparison-base':s.upgrades.arcCount?'induction-rings':advanced?'advanced':'basic'}" data-arc-installed="${group.count}" data-arc-slot="${(group.mountSlots?.[index]??index)+1}" data-attack-facing="${side<0?'left':'right'}" transform="translate(${x},${y}) scale(${side},1)">${body}${inductionRings}${capacitor}${conductor}</g>`;
   }).join('');
  }
  // 基础单通道与强化并联通道来自同一美术系列；重复购买按件数分别绘制。
  // 双脉冲沿用同一基础发射器，只更换储能/时序部件；不画成第二条武器通道。
  const sprite=s.upgrades.arcCount?'arcForkBasic':'arcSeed';
  const isHead=group.carrier==='head';
  const hasDrone=s.weapons.some(w=>w.carrier===group.carrier&&w.key==='drone');
  const count=group.count;
  if(isHead&&count===4){
   // 四件电弧使用两侧前后挂架，避开中轴上的驾驶舱、前铲和尾钩。
   const tier=s.upgrades.arcPulse?2:s.upgrades.arcDamage?1:0;
   const slots=[[-1,-22],[1,-22],[-1,24],[1,24]];
   return slots.map(([side,dy],index)=>{
    const x=group.x+side*32,y=group.y+dy;
    const root=group.x+side*23;
    const rack=`<g data-arc-rack="${side<0?'left':'right'}" stroke-linecap="round"><path d="M${root} ${y-9}H${x}M${root} ${y+9}H${x}" stroke="#17232a" stroke-width="7"/><path d="M${root} ${y-9}H${x}M${root} ${y+9}H${x}" stroke="#627b87" stroke-width="3"/><circle cx="${root}" cy="${y-9}" r="3" fill="#a7aba2" stroke="#17232a" stroke-width="1.5"/><circle cx="${root}" cy="${y+9}" r="3" fill="#a7aba2" stroke="#17232a" stroke-width="1.5"/></g>`;
    const capacitor=tier===2?doublePulseCapacitor(x,y,10,14):tier===1?highVoltageCapacitor(x,y,10,14,1):'';
    const width=s.upgrades.arcCount?18:44;
    const body=approvedSprite(sprite,x,y,width,{clip:!!s.upgrades.arcCount});
    const inductionRings=s.upgrades.arcCount?approvedSprite('arcCountUpgrade',x,y,18,{clip:true}):'';
    return `<g data-mount="arc" data-arc-state="${tier===2?'parallel':tier===1?'high-voltage':s.upgrades.arcCount?'chain-capacity':'basic'}" data-arc-art-tier="${s.upgrades.arcCount?'induction-rings':'basic'}" data-arc-installed="4" data-arc-slot="${(group.mountSlots?.[index]??index)+1}">${rack}${body}${inductionRings}${capacitor}</g>`;
  }).join('')+arcOrnaments(group,s);
  }
  const positions=count===1?[isHead?group.y+19:group.y+(hasDrone?0:24)]:
   count===2?(isHead?[group.y-12,group.y+26]:[group.y+1,group.y+47]):
   count===3?(isHead?[group.y-29,group.y+2,group.y+33]:[group.y-2,group.y+26,group.y+54]):
   [group.y-47,group.y-18,group.y+11,group.y+40];
  const width=s.upgrades.arcCount?18:count>=3?(isHead?56:54):count===2?62:68;
  const tier=s.upgrades.arcPulse?2:s.upgrades.arcDamage?1:0;
  const mounts=positions.slice(0,count).map((y,index)=>{
   const capacitor=tier===2?doublePulseCapacitor(group.x,y,13,17):tier===1?highVoltageCapacitor(group.x,y,13,17,1):'';
   const body=approvedSprite(sprite,group.x,y,width,{clip:!!s.upgrades.arcCount});
   const inductionRings=s.upgrades.arcCount?approvedSprite('arcCountUpgrade',group.x,y,18,{clip:true}):'';
   return `<g data-mount="arc" data-arc-state="${tier===2?'parallel':tier===1?'high-voltage':s.upgrades.arcCount?'chain-capacity':'basic'}" data-arc-art-tier="${s.upgrades.arcCount?'induction-rings':'basic'}" data-arc-installed="${count}" data-arc-slot="${(group.mountSlots?.[index]??index)+1}">${body}${inductionRings}${capacitor}</g>`;
  }).join('');
  return mounts+arcOrnaments(group,s);
 }
 const pulse=!!s.upgrades.arcPulse,highVoltage=!!s.upgrades.arcDamage,asset=art.basic;
 const mixed=s.weapons.some(w=>w.carrier===group.carrier&&w.key!=='arc'&&w.key!=='saw');
 const count=group.count,cols=count>4?3:count>1?2:1,rows=Math.ceil(count/cols);
 const zoneHeight=mixed?22:46;
 const width=count===1?(mixed?Math.min(23,zoneHeight/(asset.box[3]/asset.box[2])):34):Math.min(18,42/cols,zoneHeight/rows/(asset.box[3]/asset.box[2]));
 const height=width*asset.box[3]/asset.box[2];
 return Array.from({length:count},(_,i)=>{
  const x=count===1?group.x+(mixed?9:0):group.x+(i%cols-(cols-1)/2)*(44/cols);
  const y=group.y+(mixed?14:26)+(Math.floor(i/cols)-(rows-1)/2)*(zoneHeight/rows);
  const capacitor=pulse?doublePulseCapacitor(x,y-5,Math.min(13,width*.42),Math.min(17,height*.72)):highVoltage?highVoltageCapacitor(x,y-5,Math.min(13,width*.42),Math.min(17,height*.72),1):'';
  return `<g data-mount="arc" data-arc-tier="${pulse?'pulse':highVoltage?'high-voltage':'basic'}"><svg x="${x-width/2}" y="${y-height/2}" width="${width}" height="${height}" viewBox="${asset.box.join(' ')}"><image href="${asset.url}" width="1254" height="1254"/></svg>${capacitor}</g>`;
 }).join('')+arcOrnaments(group,s);
}
