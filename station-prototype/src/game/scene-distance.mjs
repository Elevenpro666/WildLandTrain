import {sprintConfig} from '../../configs/sprint.mjs';
// 路程到场景坐标的统一换算；不改变路线、冲刺消耗或模拟时钟。
export const sceneUnitsPerMetre=sprintConfig.sceneUnitsPerMetre;
export const sceneDistance=metres=>metres*sceneUnitsPerMetre;
export const sceneSpeed=Object.freeze({cruise:sprintConfig.cruiseSpeedSu,sprint:sprintConfig.profiles[sprintConfig.defaultProfileId].speedSu});
export const decelerationSeconds=sprintConfig.decelerationSeconds;

// 首段出站即时全速；冲刺距离耗尽后用1.2秒连续降至巡航。
// 只读取主模拟时间和冲刺记录，不另建时钟；业务路线与场景位移同源。
export function sceneTravel(t,starts,duration,interruptedAt=null,sprintSceneSpeed=sceneSpeed.sprint){
 const extra=sprintSceneSpeed-sceneSpeed.cruise;
 let distance=sceneSpeed.cruise*Math.max(0,t);
 for(const start of starts){
  const full=Math.max(0,Math.min(duration,(interruptedAt??Infinity)-start));
  const age=Math.max(0,t-start);
  const sprintAge=Math.min(age,full);
  const interrupted=interruptedAt!==null&&interruptedAt!==undefined&&interruptedAt<start+duration;
  const p=interrupted?0:Math.min(1,Math.max(0,(age-full)/decelerationSeconds));
  distance+=extra*(sprintAge+decelerationSeconds*(p-p**3+.5*p**4));
 }
 return distance;
}
