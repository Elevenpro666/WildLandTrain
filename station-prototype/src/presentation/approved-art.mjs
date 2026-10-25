import {groundProps} from '../game/ground-bodies.mjs';
import {assetUrl} from './art-asset-registry.mjs?rev=c02ad52a83438f4d';
import {knockbackView} from './knockback-view.mjs?v=impact-glass1';
import {knockView} from './knock-view.mjs';
import {highRankSkin} from '../../configs/enemy-skins.mjs';
import {screenImpactTargetId} from './screen-impact-view.mjs?v=foreground-only1';
const root='../美术设计/';
const assets={
 scorpion:['M13荒土生态配色/荒土蝎.png',[1254,1254],[167,67,921,1115]],
 tree:['M7轻斜俯视小样/枯树.png',[1214,1295],[294,344,660,667]],
 rock:['M6统一画风小样/石块.png',[1254,1254],[310,280,656,645]],
 arcSeed:['@arc.emitter.seed',[1774,887],[0,0,1774,887]],
 arcCompact:['M18电弧挂载验证/电弧单板紧凑模块候选V1.png',[1254,1254],[196,264,984,712]],
 arcFork:['@arc.emitter.singleFork',[1254,1254],[105,225,1100,795]],
 arcForkBasic:['@arc.emitter.singleForkBasic',[1254,1254],[380,415,570,400]],
 droneBaySquare:['M18电弧挂载验证/无人机单格独立舱原创候选V1.png',[1254,1254],[150,240,955,770]],
 droneBayBasic:['M18电弧挂载验证/无人机单格基础舱原创候选V1.png',[1254,1254],[300,325,660,590]],
 arcCountUpgrade:['@arc.upgrade.chainInductionRings',[570,400],[0,0,570,400]],
 arc:['M18电弧挂载验证/电弧发射器V2.png',[1254,1254],[38,291,1178,677]],
 dual:['M18电弧挂载验证/电弧双组候选V1.png',[1254,1254],[106,185,1041,926]],
 arcHigh:['@arc.emitter.highVoltageSingle',[1254,1254],[22,282,1210,690]],
 dualHigh:['@arc.emitter.highVoltageDual',[1254,1254],[70,165,1120,955]],
 xp:['M19资源图标/经验晶体候选V1.png',[1122,1402],[223,133,682,1112]],
 scrap:['M19资源图标/绿色能源候选V1.png',[1233,1275],[273,26,683,1225]],
};
export function approvedSprite(id,x,y,width,{clip=false}={}){const [file,size,crop]=assets[id],height=width*crop[3]/crop[2],url=file.startsWith('@')?assetUrl(file.slice(1)):file.startsWith('assets/')?file:root+file,inner=clip?`<svg x="0" y="0" width="${crop[2]}" height="${crop[3]}" viewBox="${crop.join(' ')}" overflow="hidden"><image href="${url}" width="${size[0]}" height="${size[1]}"/></svg>`:`<image href="${url}" width="${size[0]}" height="${size[1]}"/>`;return `<svg data-approved="${id}" x="${x-width/2}" y="${y-height/2}" width="${width}" height="${height}" viewBox="0 0 ${crop[2]} ${crop[3]}" overflow="hidden">${inner}</svg>`;}
export function approvedEnvironment(distance,offset=0){
 const worldDistance=distance;
 distance+=offset;
 const off=distance%844;
 const ground=[-1,0,1,2].map(i=>{const flip=(Math.floor(distance/844)-i)%2!==0;return `<g transform="translate(0,${off+i*844+(flip?844:0)}) scale(1,${flip?-1:1})"><image href="${root}M6统一画风小样/裸地.png" x="15" width="390" height="844" preserveAspectRatio="none"/></g>`;}).join('');
 const sx=[320,380,444,679,744,802],dx=[171.5,178,182,238,242,248.5],leftRailCenter=180,rightRailCenter=240;
 let rail='';for(let y=distance%48-48;y<950;y+=24){const flip=Math.round((y-(distance%48-48))/24)%2;rail+=`<g data-approved-track="wide-wheel-gauge" data-track-left="${leftRailCenter}" data-track-right="${rightRailCenter}" data-track-gauge="${rightRailCenter-leftRailCenter}" transform="translate(0,${y+(flip?24:0)}) scale(1,${flip?-1:1})">${sx.slice(0,-1).map((x,i)=>`<svg x="${dx[i]}" width="${dx[i+1]-dx[i]}" height="24" viewBox="${x} 225 ${sx[i+1]-x} 200" preserveAspectRatio="none"><image href="${root}M20直轨资产/直轨材质V2.png" width="1122" height="1402"/></svg>`).join('')}</g>`;}
 const props=groundProps(worldDistance).map(({kind:id,x,y:cy,width:w})=>`<ellipse cx="${x+2}" cy="${cy+7}" rx="${w*.35}" ry="${w*.13}" fill="#302c24" opacity=".22"/>${approvedSprite(id,x,cy,w)}`).join('');
 return ground+rail+`<g transform="translate(0,${offset})">${props}</g>`;
}
export function approvedScorpion(e,s){
 if(e.id===screenImpactTargetId&&e.knock&&s.sprintStarts?.length===1&&e.bornAt===undefined&&e.knockAge>=.18&&e.knockAge<1.1)return '';
 if(e.knock)return knockbackView({x:e.x,y:e.y,originX:e.knockOrigin?.x??e.x,age:e.knockAge||0,angle:e.angle||0,
  mode:s.sprintStarts?.length===1&&e.bornAt===undefined&&[2,4].includes(e.id)?'camera':'side',lane:e.id%2===0?(e.id===2?-1:1):-1,variant:(e.id-1)%6,
  frames:Array.from({length:4},(_,i)=>`<svg x="-18.25" y="-18.25" width="36.5" height="36.5" viewBox="${i%2*627} ${Math.floor(i/2)*627} 627 627"><image href="assets/scorpion-roll-v1.png" width="1254" height="1254"/></svg>`),
  body:'<svg x="-15" y="-18.25" width="30" height="36.5" viewBox="0 0 120 146"><image href="assets/scorpion-motion-approved.png" width="1440" height="292"/></svg>'});
 const nearest=s.cars.reduce((a,b)=>Math.hypot(e.x-a.x,e.y-a.y)<Math.hypot(e.x-b.x,e.y-b.y)?a:b);
 const angle=Math.atan2(nearest.y-e.y,nearest.x-e.x)*180/Math.PI-90;
 const moving=!e.climbing&&Math.hypot(nearest.x-e.x,nearest.y-e.y)>34;
 const frame=e.knock?0:Math.floor(((s.t*3+(e.id||0)*.31)%1)*12),row=moving?0:1;
 if(e.emerging){const r=Math.max(0,Math.min(1,(s.t-e.bornAt-.45)/.85)),clip=`emerge-${e.id}`;return `<g transform="translate(${e.x},${e.y}) rotate(${angle})"><ellipse rx="12" ry="7" fill="#41301e" opacity=".4"/><defs><clipPath id="${clip}"><ellipse rx="${3+r*20}" ry="${2+r*25}"/></clipPath></defs><g clip-path="url(#${clip})">${r?approvedSprite('scorpion',0,0,30):''}</g></g>`;}
 const lean=e.climbing?-(e.trainSide||1)*6:0;
 return `<g data-enemy="scorpion" data-climbing="${!!e.climbing}" transform="translate(${e.x+lean},${e.y})"><ellipse cx="0" cy="5" rx="${e.climbing?9:12}" ry="${e.climbing?5:7}" fill="#261e16" opacity=".40"/><ellipse data-contact-shadow cx="0" cy="5" rx="8" ry="4.5" fill="#211b15" opacity=".70"/><g transform="rotate(${angle})"><svg x="-15" y="-18.25" width="30" height="36.5" viewBox="${frame*120} ${row*146} 120 146"><image href="assets/scorpion-motion-approved.png" width="1440" height="292"/></svg></g></g>`;
}
// 两个候选兵种先在真实战斗里按实战尺寸试配；运动仍由Battle快照驱动。
export function approvedSpecialEnemy(e,s){
 if(e.boss){
  const bodyWidth=102,bodyHeight=120,lean=Math.sin(s.t*2.4)*2;
  return `<g data-enemy="boss" data-art="iron-butcher-v2-candidate" transform="translate(${e.x},${e.y})"><ellipse cx="3" cy="19" rx="42" ry="15" fill="#2d261f" opacity=".46"/><g transform="translate(0,${lean})"><image href="assets/enemies/iron-butcher-boss-v2-candidate.png" x="${-bodyWidth/2}" y="${-bodyHeight/2}" width="${bodyWidth}" height="${bodyHeight}"/></g></g>`;
 }
 const elite=!!e.elite;
 if(!elite&&!e.fly)return null;
 const width=51,height=51;
 const path=elite?(s.enemyArtVariant==='highrank'?highRankSkin(s.journey?.route?.environmentId??'wasteland').source:s.enemyArtVariant==='bone'?'scorpion-highrank-bone-v1-candidate.png':s.enemyArtVariant==='generated'?'scorpion-elite-earth-v1-candidate.png':'scorpion-elite-user-v1-candidate.png'):'mosquito-earth-v1-candidate.png';
 const angle=elite?(e.angle||0):(e.angle||0);
 const flight=e.fly&&!elite;
 const shadow='<ellipse cx="1" cy="7" rx="20" ry="10" fill="#30241d" opacity=".34"/>';
 const health=elite?`<g transform="translate(0,-35)"><rect x="-25" width="50" height="5" rx="2" fill="#30332d"/><rect x="-24" y="1" width="${48*Math.max(0,e.hp)/e.maxHp}" height="3" rx="1" fill="#c86a48"/></g>`:'';
 if(flight){
  const frame=Math.floor((((s.t*4.5+(e.id||0)*.13)%1)+1)%1*4);
  const span=[1,.68,.35,.68][frame],tilt=[-10,4,16,4][frame];
  const bob=Math.sin(s.t*9+(e.id||0))*.6;
  const wing=(side)=>`<g data-wing="${side}" data-frame="${frame}" transform="translate(${side==='left'?-4:4},${-9+bob}) scale(${side==='left'?1:-1} 1) rotate(${tilt}) scale(${span} 1)"><svg x="-24" y="-24" width="24" height="24" viewBox="0 0 1233 1275"><image href="assets/enemies/mosquito-wing-left-v3-candidate.png" width="1233" height="1275"/></svg></g>`;
  return `${knockView(e)}<g data-enemy="flyer" data-art="layered-candidate" data-enemy-id="${e.id||0}" transform="translate(${e.x},${e.y})"><ellipse data-flight-shadow cx="4" cy="16" rx="11" ry="4" fill="#342b22" opacity=".30"/><g transform="rotate(${angle})">${wing('left')}${wing('right')}<g transform="translate(0,${-8+bob})"><svg x="-14" y="-18" width="28" height="36" viewBox="0 0 1254 1254"><image href="assets/enemies/mosquito-body-v2-candidate.png" width="1254" height="1254"/></svg></g></g></g>`;
 }
 if(elite&&s.enemyArtVariant==='highrank'){
  const nearest=s.cars.reduce((a,b)=>Math.hypot(e.x-a.x,e.y-a.y)<Math.hypot(e.x-b.x,e.y-b.y)?a:b);
  const moving=!e.climbing&&Math.hypot(nearest.x-e.x,nearest.y-e.y)>34;
  const charge=e.climbing&&e.attackTimer>0&&e.attackTimer<=.55?Math.max(0,Math.min(1,(.55-e.attackTimer)/.43)):0;
  const strike=e.climbing&&e.attackTimer>0&&e.attackTimer<.12?1-e.attackTimer/.12:0;
  const recovery=e.climbing&&e.attackTimer>e.interval-.2?Math.max(0,(e.attackTimer-(e.interval-.2))/.2):0;
  const punch=Math.max(strike,recovery);
  const attack=charge>0||punch>0;
  const attackPhase=punch>0?'strike':charge>0?'charge':moving?'walk':'idle';
  const phase=s.t*8+(e.id||0)*.71;
  const stride=moving?Math.sin(phase)*5:Math.sin(phase)*1.2;
  const clawAngle=attack?36*charge-44*punch:2+Math.sin(phase)*1.8;
  const lash=attack?19*charge-52*punch:Math.sin(phase*.55)*3;
  const facing=Math.atan2(e.x-nearest.x,nearest.y-e.y)*180/Math.PI;
  const id=`elite-${e.id||0}`;
  const sprite=`<image href="assets/enemies/${path}" x="-25.5" y="-25.5" width="51" height="51"/>`;
  const part=(name,transform)=>`<g data-part="${name}" transform="${transform}" clip-path="url(#${id}-${name})">${sprite}</g>`;
  return `${knockView(e)}<g data-enemy="elite" data-art="layered-highrank" data-state="${attack?'attack':moving?'walk':'idle'}" data-attack-phase="${attackPhase}" data-enemy-id="${e.id||0}" transform="translate(${e.x},${e.y})"><ellipse cx="1" cy="7" rx="${20+charge*3}" ry="${10+charge*1.5}" fill="#30241d" opacity="${.34+charge*.14}"/><g data-facing="${facing}" transform="rotate(${facing})"><defs><clipPath id="${id}-tail" clipPathUnits="userSpaceOnUse"><path d="M-10-26H20V-5H-10Z"/></clipPath><clipPath id="${id}-left" clipPathUnits="userSpaceOnUse"><path d="M-26-5H-8V25H-26Z"/></clipPath><clipPath id="${id}-right" clipPathUnits="userSpaceOnUse"><path d="M8-5H26V25H8Z"/></clipPath><clipPath id="${id}-body" clipPathUnits="userSpaceOnUse"><path d="M-12-9H12V19H-12Z"/></clipPath></defs><ellipse data-charge-glow cx="0" cy="13" rx="22" ry="10" fill="#f0aa40" opacity="${.26*charge}"/>${part('tail',`rotate(${lash} 0 -7)`)}${part('left',`rotate(${stride+clawAngle} -9 1)`)}${part('right',`rotate(${-stride-clawAngle} 9 1)`)}${part('body',`translate(0 ${moving?Math.sin(phase*2)*.6:-4*charge+7*punch}) scale(${1+.08*charge} ${1-.08*charge})`)}<path d="M-22 13l-4 4m48-4 4 4" stroke="#ffca69" stroke-width="2" stroke-linecap="round" opacity="${.7*charge}"/></g>${health}</g>`;
 }
 return `${knockView(e)}<g data-enemy="elite" data-art="earth-candidate" data-enemy-id="${e.id||0}" transform="translate(${e.x},${e.y}) rotate(${angle})">${shadow}<image href="assets/enemies/${path}" x="${-width/2}" y="${-height/2}" width="${width}" height="${height}"/>${health}</g>`;
}
export function approvedResources(s){return `<div class="resource-hud" aria-label="资源"><div><img alt="经验" src="${root+assets.xp[0]}"><span>${s.experience-s.levelStartExperience}/${s.nextUpgrade-s.levelStartExperience}</span></div><div><img alt="能源" src="${root+assets.scrap[0]}"><span>${s.cash??0}</span></div></div>`;}
export function approvedRadar(s){return `<svg class="battle-radar" viewBox="0 0 90 80" aria-label="敌情缩略图"><rect width="90" height="80" rx="5" fill="#303831" opacity=".88"/>${s.cars.map(c=>`<rect x="43" y="${c.y/950*76}" width="4" height="5" fill="#a9c6bb"/>`).join('')}${s.enemies.filter(e=>e.hp>0).map(e=>`<circle cx="${Math.max(3,Math.min(87,e.x/420*90))}" cy="${Math.max(3,Math.min(77,e.y/950*80))}" r="${e.boss?3:e.elite?2:1}" fill="${e.boss?'#e1755d':e.elite?'#d5b05f':'#b8a58b'}"/>`).join('')}</svg>`;}
