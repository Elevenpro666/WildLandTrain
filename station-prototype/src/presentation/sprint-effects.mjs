import {flyerView} from './flyer-view.mjs';
import {walkerView} from './walker-view.mjs';
import {knockView} from './knock-view.mjs';
// 所有动画由战斗快照时间驱动，暂停时自然冻结。
export function sprintEffects(s){
 if(!s.invincible)return '';
 const bottom=s.cars.at(-1).y+75;
 return `<g data-effect="shield" fill="none" stroke="#fffdf4">
 <image data-state-art="sprint-shock" href="assets/battle-state/sprint-shock-v1.svg" x="160" y="${s.cars[0].y-65}" width="100" height="35" opacity=".8"/>
 ${Array.from({length:14},(_,i)=>{const x=i<7?25+i*17:293+(i-7)*17,y=(i*73+s.scroll*4)%640;return `<path d="M${x} ${y}v${35+i%3*15}" stroke-width="${i%3+1}" opacity=".8"/>`;}).join('')}
 <path d="M190 ${bottom+6}l-8 52M210 ${bottom+6}v72M230 ${bottom+6}l8 52" stroke-width="6"/>
 </g>`;
}
export function monster(e,time=0){
 if(e.fly&&!e.elite&&!e.boss)return flyerView(e,time);
 if(!e.elite&&!e.boss&&!e.fly)return walkerView(e,time);
 if(e.elite)return `${knockView(e)}<g data-enemy="elite" transform="translate(${e.x},${e.y}) rotate(${e.angle||0})"><image href="assets/style-v2/scorpion-elite.png" x="-31" y="-33" width="62" height="66"/><rect x="-25" y="-40" width="50" height="5" rx="2" fill="#30332d"/><rect x="-24" y="-39" width="${48*Math.max(0,e.hp)/e.maxHp}" height="3" rx="1" fill="#c86a48"/></g>`;
 if(e.boss)return `<g data-enemy="boss" transform="translate(${e.x},${e.y}) rotate(${(Math.sin(time*3)*2).toFixed(2)})"><image href="assets/battle-state/iron-bearer-boss-v1.png" x="-41" y="-43" width="82" height="91"/></g>`;
 return `<g transform="translate(${e.x},${e.y}) rotate(${e.angle||0})" stroke="#292b26" stroke-width="2" fill="${e.knock?'#fffdf4':'#d0d0c6'}">
 ${e.knock?'<path d="M-25 -15l-14 -9M-26 0h-17" fill="none"/>':''}
 <path d="M-9 4l-7 13M9 4l7 13M-7 10l-3 12M7 10l3 12" fill="none"/>
 <circle r="${e.fly?9:12}"/><path d="M-5 -3l3 3M5 -3L2 0M-4 6h8" fill="none"/>
 ${e.fly?'<path d="M-9 0l-15 -10M9 0l15 -10"/>':''}</g>`;
}
export function stationCrowd(){
 return `<svg viewBox="0 0 420 108" aria-label="整备站围栏外聚集的怪群"><rect width="420" height="108" fill="#deded4"/>
 ${Array.from({length:22},(_,i)=>monster({x:12+(i%11)*39,y:16+Math.floor(i/11)*34})).join('')}
 <path d="M0 80H420M0 87H420" stroke="#34362c" stroke-width="3"/><text x="210" y="103" text-anchor="middle" font-size="11">站外围堵 · 出站自动无敌冲开怪群</text></svg>`;
}
