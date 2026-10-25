import {sprintEffects,monster} from './sprint-effects.mjs?v=walker-anim-1';
import {weaponsView,droneTargetingView,droneFlyersView,hitView,upgradeFeedback} from './weapon-feedback.mjs?rev=c7853ca4f800fc46';
import {upgradeView} from './upgrade-view.mjs?rev=26bff1d23029afb8';
import {departure,roadside,stationExitView} from './departure.mjs?rev=ec630615b644ffb1';
import {waveView} from './wave-view.mjs?v=encounters-1';
import {lootFeedback} from './loot-feedback.mjs?rev=0d1bf39c77847a3d';
import {trainBody,trainConnections} from './train-body.mjs?rev=d2385bb9b931f157';
import {trainMotionEffects,bossPressure,hurtFeedback} from './battle-state-view.mjs';
import {approvedEnvironment,approvedScorpion,approvedSpecialEnemy,approvedResources,approvedRadar} from './approved-art.mjs?rev=9aaf92649246d7f9';
import {healthView} from './health-view.mjs';
import {buildView} from './build-view.mjs?v=terrain-family1';
import {screenImpactView} from './screen-impact-view.mjs?v=foreground-only1';
export function battleView(s){
 const motion=departure(s);
 // Follow only part of the forward lunge: keep all five bodies visible without canceling the sprint motion.
 // Full-bleed battlefield: the HUD floats over the scene, so show more of the train vertically.
 const fullTrain=s.cars.length===6;
 const cameraTop=(fullTrain?65:80)+(s.artVersion==='approved'?0:Math.min(0,motion.offset)*.8);
 const cameraHeight=s.artVersion==='approved'?844:(fullTrain?825:700);
 const sprintAge=s.sprintInterruptedAt!==null&&s.sprintInterruptedAt!==undefined?s.t-s.sprintInterruptedAt:s.t-s.sprintStarts.at(-1)-s.sprint.distance/s.sprint.speedMetres;
 const sprintOpacity=s.sprint.active?1:Math.max(0,Math.min(1,1-(sprintAge-2)/.5));
 const showDepartureDistance=s.sprintStarts?.length===1&&s.sprint.phase==='sprinting'&&sprintOpacity>0;
 const sprintState=s.choices?.length?'choosing':s.sprintLocked?'locked':s.invincible?'active':s.sprint.energy>=100&&!s.paused&&!s.done?'ready':'charging';
 const sprintLabel='冲刺 ↑';
 // 群体撞击会连续刷新impact：出站演出不摇整张战场，后续单次撞击也限制为轻微位移。
 const openingRush=s.sprintStarts?.length===1&&s.invincible;
 const shake=s.impact>0&&!openingRush?Math.sin(s.t*68)*Math.min(.7,s.impact/.16*.7):0;
 const svg=`<svg viewBox="${s.artVersion==='approved'?15:0} ${cameraTop} ${s.artVersion==='approved'?390:420} ${cameraHeight}" preserveAspectRatio="${s.artVersion==='approved'?'xMidYMid meet':'xMidYMid slice'}" aria-label="向上行进的列车战斗"><g data-battle-shake transform="translate(${shake},0)">${s.artVersion==='approved'?approvedEnvironment(motion.travel,motion.offset):`<rect width="420" height="950" fill="#dedbd0"/>${[-1,0,1,2,3,4].map(i=>`<image data-state-art="ground" href="assets/battle-state/ground-scuffs-v1.svg" x="0" y="${i*256+motion.travel%256}" width="420" height="256"/>`).join('')}
 ${roadside(motion.travel)}
 ${Array.from({length:32},(_,i)=>`<path d="M178 ${i*30+motion.travel%30}h64" stroke="#aaa995" stroke-width="5"/>`).join('')}<path d="M185 0v950 M235 0v950" stroke="#505448" stroke-width="3"/>`}
 ${s.artVersion==='approved'&&s.sprintStarts?.length===1?stationExitView(s.t):''}
 <g data-camera="departure" transform="translate(0,${motion.offset})">
 ${trainMotionEffects(s)}${trainConnections(s.cars)}${s.cars.map((c,i)=>trainBody(c,i===0,s.t,s.artVersion,motion.travel,s.platformArtCandidate,s.compactL3MountTrial)).join('')}
 ${weaponsView(s)}${healthView(s)}
 ${s.enemies.map(e=>s.artVersion==='approved'?(!e.fly&&!e.elite&&!e.boss?approvedScorpion(e,s):e.boss||s.enemyArtCandidate?approvedSpecialEnemy(e,s)??monster(e,s.t):monster(e,s.t)):monster(e,s.t)).join('')}${droneTargetingView(s)}${droneFlyersView(s)}${bossPressure(s)}${sprintEffects(s)}
 ${hitView(s)}${hurtFeedback(s)}${lootFeedback(s,{top:cameraTop,offset:motion.offset})}</g></g>${s.artVersion==='approved'?screenImpactView(s):''}${showDepartureDistance?`<g data-sprint-distance opacity="${sprintOpacity}" transform="translate(290,255)" fill="#30372a"><rect x="-8" y="-6" width="118" height="56" rx="5" fill="#eeebdf" fill-opacity=".9"/><text x="0" y="11" font-size="11">出站已冲刺</text><text x="0" y="39" font-size="25" font-weight="bold">${Math.floor(Math.max(0,s.sprint.distance-s.sprint.remaining))}<tspan font-size="12"> 米</tspan></text></g>`:''}${upgradeFeedback(s)}</svg>`;
 return `<div class="battle-screen">
 <header class="battle-hud ${s.artVersion==='approved'?'approved-hud':''}">${s.artVersion==='approved'?approvedRadar(s)+approvedResources(s):''}<div class="hud-row"><div class="battle-vitals"><small>Lv.${s.level}</small></div>${s.boss?`<div class="boss-hud"><strong>Boss耐久 ${Math.ceil(s.boss.hp)} / ${s.boss.maxHp}</strong><progress aria-label="Boss耐久" max="${s.boss.maxHp}" value="${s.boss.hp}"></progress></div>`:''}</div>${waveView(s)}</header>
 <div class="battle-field">${svg}</div>${buildView(s)}
 <div class="battle-controls"><button class="sprint-button" data-action="sprint" data-state="${sprintState}" style="--charge:${Math.floor(s.sprint.energy)}%" aria-label="${sprintLabel}，${sprintState==='charging'?'充能'+Math.floor(s.sprint.energy)+'%':sprintState==='ready'?'已充能可释放':sprintState==='locked'?'Boss战期间无法释放':'无敌冲刺'}" ${s.choices?.length||s.sprintLocked||s.invincible||s.sprint.energy<100||s.paused||s.done?'disabled':''}><span class="sprint-label">${sprintLabel}</span><span class="sprint-meter" aria-hidden="true"></span></button></div>${upgradeView(s)}</div>`;
}
