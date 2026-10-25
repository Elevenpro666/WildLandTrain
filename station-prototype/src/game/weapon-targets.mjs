import {sawSweepOffset} from './saw-kinematics.mjs';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const alive=e=>e.hp>0&&!e.knock&&!e.exited&&!e.emerging;
export function arcTargets(origin,enemies,p){
 const hit=[];let from=origin,range=p.range;
 while(hit.length<p.count){
  const next=enemies.filter(e=>alive(e)&&!hit.includes(e)&&distance(from,e)<=range).sort((a,b)=>distance(from,a)-distance(from,b)||a.id-b.id)[0];
  if(!next)break;hit.push(next);from=next;range=p.jump;
 }
 return hit;
}
export function sawTargets(origin,enemies,p,t=0){
 const radius=(p.reach-25)/2,center=25+radius+sawSweepOffset(t,p.sweep);
 return enemies.filter(e=>alive(e)&&!e.fly&&Math.abs(e.x-origin.x)>=center-radius&&Math.abs(e.x-origin.x)<=center+radius&&Math.abs(e.y-(origin.y+25))<=p.length);
}
export function droneTarget(origin,drone,enemies,p,claimed){
 const candidates=enemies.filter(e=>alive(e)&&distance(origin,e)<=p.range);
 candidates.sort((a,b)=>p.focus?((b.maxHp??b.hp)-(a.maxHp??a.hp)||a.id-b.id):
  (p.spread?(Number(claimed.has(a.id))-Number(claimed.has(b.id))):0)||distance(drone,a)-distance(drone,b)||a.id-b.id);
 return candidates[0]||null;
}
