// 可替换的美术分件；位置与时序只读战斗快照。
const root='assets/battle-state/';
export function trainMotionEffects(s){
 const fast=s.invincible,cars=s.cars||[];
 const dust=cars.filter((_,i)=>i%2===0).map((c,i)=>{
  const phase=(s.t*2+i*.43)%1,opacity=(fast?.32:.16)*(1-phase);
  return `<image data-state-art="road-dust" href="${root}road-dust-v1.svg" x="${c.x-37}" y="${c.y+42+phase*20}" width="74" height="47" opacity="${opacity.toFixed(2)}"/>`;
 }).join('');
 const tail=cars.at(-1);
 const exhaust=fast&&tail?[-1,1].map((side,i)=>`<image data-state-art="exhaust" href="${root}exhaust-flare-v1.svg" x="${tail.x+side*14-11}" y="${tail.y+48}" width="22" height="44" opacity="${(.72+.18*Math.sin(s.t*15+i)).toFixed(2)}"/>`).join(''):'';
 return `<g data-train-motion>${dust}${exhaust}</g>`;
}
export function bossPressure(s){
 if(!s.boss)return '';
 const age=s.t-s.boss.startedAt;
 if(age<0||age>1.5)return '';
 const boss=s.enemies.find(e=>e.boss);if(!boss)return '';
 const opacity=Math.sin(Math.PI*Math.min(1,age/1.5));
 return `<image data-state-art="boss-pressure" href="${root}boss-pressure-v1.svg" x="${boss.x-55}" y="${boss.y-88}" width="110" height="70" opacity="${opacity.toFixed(2)}"/>`;
}
export function hurtFeedback(s){
 const hit=s.hurtFx,age=hit?s.t-hit.time:99;
 if(age<0||age>.32)return '';
 const size=36+age*35;
 return `<image data-state-art="hit-spark" href="${root}hit-spark-v1.svg" x="${hit.x-size/2}" y="${hit.y-size/2}" width="${size}" height="${size}" opacity="${(1-age/.32).toFixed(2)}"/>`;
}
