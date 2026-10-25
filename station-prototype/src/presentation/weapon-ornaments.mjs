// 只画装备的永久结构变化，升级数值仍由 game/upgrades 决定。
import {assetUrl} from './art-asset-registry.mjs?rev=c02ad52a83438f4d';
const root='assets/battle-state/';
const art=(id,file,x,y,size)=>`<image data-upgrade-art="${id}" href="${root}${file}" x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}"/>`;
export function arcOrnaments(w,s){
 let result='';
 if(s.upgrades.arcReach)result+=`<image data-upgrade-art="arcReach" href="${assetUrl('arc.upgrade.reachAntenna')}" x="${w.x-22}" y="${w.y-3}" width="20" height="20"/>`;
 return result;
}
export function droneOrnaments(w,s){
 let result='';const x=w.x,y=w.y+28;
 if(s.upgrades.dronePatrol)result+=`<image data-upgrade-art="dronePatrol" data-drone-patrol-hardware="radar-array-v1" href="assets/weapons/drone-patrol-radar-v1.svg" x="${x-18.5}" y="${y-23.5}" width="17" height="17"/>`;
 if(s.upgrades.droneCount)result+=`<g data-upgrade-art="droneCount" fill="#858e89" stroke="#303a35" stroke-width="2"><path d="M${x-16} ${y+10}v-11l5-4M${x+16} ${y+10}v-11l-5-4"/></g>`;
 return result;
}
export function supplyOrnament(s){
 if(!s.upgrades.supply)return '';
 const head=s.cars[0];
 return art('supply','supply-bus-v1.svg',head.x+22,head.y+40,16);
}
