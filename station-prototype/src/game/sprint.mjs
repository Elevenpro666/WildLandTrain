import {sceneSpeed,sceneUnitsPerMetre} from './scene-distance.mjs?v=sprint-500-trial1';
export {sprintConfig} from '../../configs/sprint.mjs';
import {sprintConfig} from '../../configs/sprint.mjs';
// 品质决定玩法距离；速度统一从场景SU/s及唯一距离换算推导。
export function createSprint(quality=1,boosters=0,sprintSceneSpeed=sceneSpeed.sprint){
 if(!Number.isInteger(quality)||quality<1||quality>sprintConfig.baseDistanceByHeadQuality.length||!Number.isInteger(boosters)||boosters<0||!Number.isFinite(sprintSceneSpeed)||sprintSceneSpeed<=sceneSpeed.cruise)throw new RangeError('Invalid sprint loadout');
 const distance=sprintConfig.baseDistanceByHeadQuality[quality-1]+boosters*sprintConfig.boosterDistance;
 const speedMetres=sprintSceneSpeed/sceneUnitsPerMetre;
 let remaining=distance,energy=0,phase='sprinting',decelerationRemaining=0;
 return {step(dt){if(!Number.isFinite(dt)||dt<=0)return;
  if(phase==='sprinting'){const elapsed=Math.min(dt,remaining/speedMetres);remaining=Math.max(0,remaining-speedMetres*elapsed);dt-=elapsed;if(remaining<1e-8){remaining=0;phase='decelerating';decelerationRemaining=sprintConfig.decelerationSeconds;}}
  if(phase==='decelerating'&&dt>0){const elapsed=Math.min(dt,decelerationRemaining);decelerationRemaining=Math.max(0,decelerationRemaining-elapsed);dt-=elapsed;if(decelerationRemaining<1e-8){decelerationRemaining=0;phase='charging';}}
  if(phase==='charging')energy=Math.min(100,energy+100*dt/sprintConfig.chargeSeconds);
 },
 release(){if(phase!=='charging'||energy<100)return false;energy=0;remaining=distance;phase='sprinting';return true;},
 interrupt(){const wasActive=phase!=='charging';phase='charging';decelerationRemaining=0;return wasActive;},
 snapshot(){return {active:phase!=='charging',phase,energy,remaining,decelerationRemaining,distance,quality,boosters,speedMetres,speedScene:sprintSceneSpeed};}};
}
