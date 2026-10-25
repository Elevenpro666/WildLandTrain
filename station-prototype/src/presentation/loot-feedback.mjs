// 经验在击杀时已结算；粒子仅反馈，不负责发奖或影响升级时机。
import {approvedSprite} from './approved-art.mjs?rev=9aaf92649246d7f9';
export function lootFeedback(s,view={top:80,offset:0}){
 const drops=s.lootFeedback||[];
 return drops.slice(-8).map(drop=>{
  const age=s.t-drop.time,p=Math.max(0,Math.min(1,(age-.18)/.62));
  if(s.artVersion==='approved'){
   const ease=p*p*(3-2*p),x=drop.x+(366-drop.x)*ease;
   return ['xp',...(drop.scrap?['scrap']:[])].map((id,i)=>{const target=view.top+22+i*28-view.offset,y=drop.y+(target-drop.y)*ease;return `<g data-loot="${id}" opacity="${age>.8?0:1}">${approvedSprite(id,x,y,10)}</g>`;}).join('');
  }
  const ease=p*p*(3-2*p),x=drop.x+(210-drop.x)*ease,y=drop.y+(285-drop.y)*ease-24*Math.sin(p*Math.PI);
  return `<g data-loot="experience" transform="translate(${x},${y})" opacity="${1-p*.8}"><image href="assets/battle-state/experience-v1.svg" x="-8" y="-8" width="16" height="16"/>${drop.scrap?`<g data-loot="scrap" transform="translate(0,15)"><image href="assets/battle-state/scrap-v1.svg" x="-8" y="-8" width="16" height="16"/></g>`:''}</g>`;
 }).join('');
}
