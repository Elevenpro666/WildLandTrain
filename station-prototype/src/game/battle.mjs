import {createSprint} from './sprint.mjs?v=sprint-500-trial1';
import {waveAt} from './waves.mjs?v=pacing1';
import {createEnemyCatalog} from './enemy-pools.mjs';
import {enemyCatalogConfig} from '../../configs/enemies.mjs';
import {lootConfig,repulsorTrialConfig} from '../../config.mjs?rev=repulsor-chain3';
import {eligibleCards,initialUpgrades,upgradeCost,weaponStats} from './upgrades.mjs?rev=43e9b7d674cf0733';
import {arcTargets,sawTargets,droneTarget,alive} from './weapon-targets.mjs';
import {separateGround} from './ground-bodies.mjs?v=contact-loop1';
import {separateAir} from './air-bodies.mjs';
import {sceneTravel,sceneUnitsPerMetre} from './scene-distance.mjs?v=sprint-500-trial1';
import {getSprintProfile} from '../../configs/sprint.mjs';
import {departurePositions} from './departure-formation.mjs?v=natural2';
import {bossTuning} from '../../configs/boss.mjs';
import {mountAssignments,mountPoint} from './mount-assignments.mjs';
import {repulsorGroups,repulsorContact,repulsorReleaseVector} from './repulsor-field.mjs?rev=48ea0990d7fc831e';
const tuning={routeLength:975,hp:300,
 knockSpeed:250,knockDuration:1.1,shieldWidth:78};
export {bossTuning};
export function createBattle(loadout,quality=1,options={}){
 const catalog=options.catalog??createEnemyCatalog(enemyCatalogConfig),chapter=options.chapter??1;
 const definition=id=>{const result=catalog.pick(id,chapter,random);if(!result.ok)throw Error('Encounter unavailable: '+id);return result.enemy;};
 let waveSpawned=0,spawnWave=0,elite=null;
 const routeLength=options.routeLength??tuning.routeLength;
 if(!Number.isFinite(routeLength)||routeLength<=0)throw Error('Invalid route length');
 const profile=getSprintProfile(options.sprintProfileId);
 const sprintSceneSpeed=profile.speedSu;
 const sprint=createSprint(quality,loadout.equipment.filter(e=>e.carrier&&e.key==='boost').length,sprintSceneSpeed);
 let scroll=0,impact=0,knocked=0,hurtFx=null;
 let boss=null,sprintInterruptedAt=null;
 const complete=()=>hp<=0||(options.boss?boss?.defeated===true:scroll>=routeLength);
 const sprintStarts=[0]; // 有限路线与8秒充能约束冲刺记录数量。
 let t=0,hp=tuning.hp,kills=0,spawn=0,id=0,seed=17,paused=false;
 let enemies=[],effects=[];
 let lootFeedback=[]; // 有界表现记录，经验仍在击杀时立即结算。
 let scrapEarned=0;
 if(options.creditLoot!==undefined&&typeof options.creditLoot!=='function')throw Error('Invalid loot callback');
 let level=options.growth?.level??1,nextUpgrade=options.growth?.nextUpgrade??5,choices=[],upgradeId=0,lastUpgrade=null;
 let levelStartExperience=options.growth?.levelStartExperience??(level===1?0:Math.max(0,nextUpgrade-upgradeCost(level)));
 if(!Number.isFinite(levelStartExperience)||levelStartExperience<0||levelStartExperience>=nextUpgrade)throw Error('Invalid experience interval');
 const priorKills=options.growth?.experience??0;
 let firstSupplyLevel=options.growth?.firstSupplyLevel??null;
 const upgrades={...initialUpgrades(),...options.growth?.upgrades};
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const carHeights=[0,70*875/740,70*998/740,70*1239/740],firstCarOffsets=[0,80,86,98];
 let previousCar=null;
 const cars=loadout.carriers.map(c=>{
  if(c.level===0)return {...c,x:210,y:260};
  const level=Math.max(1,Math.min(3,Number(c.level)||1)),layoutLevel=level;
  const y=previousCar
   ?previousCar.y+(carHeights[previousCar.level]+carHeights[layoutLevel])/2-5
   :260+firstCarOffsets[layoutLevel];
  previousCar={y,level:layoutLevel};
  return {...c,level,x:210,y};
 });
 const makeEnemy=(d,x,y)=>({id:++id,definitionId:d.id,name:d.name,rank:d.rank,x,y,hp:d.hp,maxHp:d.hp,damage:d.damage,interval:d.attackInterval,speed:d.speed,attackTimer:0,fly:d.movement==='flying'});
 for(const [x,y] of departurePositions(profile.formation))enemies.push(makeEnemy(catalog.getEnemy('walker'),x,y));
 const compareArcs=options.arcCountCompare?loadout.equipment.filter(e=>e.key==='arc'&&e.carrier==='c1').slice(0,2):[];
 const compareArcTiers=new Map(compareArcs.map((e,index)=>[e.id,index===0?'base':'upgraded']));
 const equipped=loadout.equipment.filter(e=>e.carrier),assignedMounts=mountAssignments(cars,equipped);
 const weapons=equipped.map(e=>{const c=cars.find(c=>c.id===e.carrier),arcCountTrialTier=compareArcTiers.get(e.id),mountSlot=assignedMounts.get(e.id)?.[0]??0,mount=mountPoint(c,mountSlot);return {...e,x:c.x,y:c.y,mountSlot,mountX:mount.x,mountY:mount.y,timer:0,...(arcCountTrialTier?{arcCountTrialTier}:{})};});
 const drones=[];const pulses=[];
 const syncDrones=()=>{for(const w of weapons.filter(w=>w.key==='drone')){
  const count=weaponStats('drone',upgrades).count;
  for(let n=drones.filter(d=>d.owner===w.id).length;n<count;n++)drones.push({id:w.id+'-drone-'+n,owner:w.id,slot:n,x:w.x+(n?35:-35),y:w.y+25,timer:0,target:null});
 }};
 syncDrones();
 const hit=(w,e,damage,origin={x:w.x,y:w.y+25},feedback={})=>{
  if(!alive(e))return;
  e.hp-=damage;effects.push({weaponId:w.id,targetId:e.id,damage,x:origin.x,y:origin.y,tx:e.x,ty:e.y,key:w.key,life:feedback.arcCountLinked ? .44 : .25,...feedback});
 };
 return {choose(cardId,offerId){
  if(offerId!==upgradeId||!choices.some(c=>c.id===cardId))return false;
  lastUpgrade={id:cardId,time:t};upgrades[cardId]++;levelStartExperience=nextUpgrade;level++;if(cardId==='supply'&&firstSupplyLevel===null)firstSupplyLevel=level;choices=[];nextUpgrade+=upgradeCost(level);syncDrones();
  return true;
 },toggle(){if(!choices.length)paused=!paused;},release(){if(boss||choices.length||paused||complete()||!sprint.release())return false;sprintStarts.push(t);return true;},step(dt){if(choices.length||paused||complete()||!Number.isFinite(dt)||dt<=0)return;t+=dt;spawn-=dt;
  const sprintBefore=sprint.snapshot(),invincible=sprintBefore.active;
  const travelAt=time=>sceneTravel(time,sprintStarts,sprintBefore.distance/sprintBefore.speedMetres,sprintInterruptedAt,sprintSceneSpeed);
  const groundTravel=travelAt(t),groundDelta=groundTravel-travelAt(t-dt);
  scroll=Math.min(routeLength,scroll+groundDelta/sceneUnitsPerMetre);
  if(!boss)sprint.step(dt);impact=Math.max(0,impact-dt);
  const wave=waveAt(t);
  if(wave.number!==spawnWave){spawnWave=wave.number;waveSpawned=0;}
  if(wave.phase!=='assault')spawn=0;
  if(!boss&&options.elite&&!elite&&wave.phase==='assault'&&enemies.length<40){
   const e=makeEnemy(definition('eliteEncounter'),295,235);e.elite=true;enemies.push(e);elite={id:e.id,status:'active',name:e.name};
  }
  const encounterId=wave.number%2===0?'mixedWave':'groundWave',encounter=catalog.getEncounter(encounterId);
  if(!boss&&wave.phase==='assault'&&spawn<=0&&waveSpawned<encounter.count&&enemies.length<encounter.maxAlive){spawn=encounter.interval;const x=random()<.5?15:405,y=170+random()*400;const e=makeEnemy(definition(encounterId),x,y);e.wave=wave.number;if(!e.fly){e.bornAt=t;e.emerging=true;e.x=x<210?100:320;}enemies.push(e);waveSpawned++;}
  for(const e of enemies){
   if(e.emerging){e.y+=groundDelta;if(t-e.bornAt<1.3){continue;}e.emerging=false;}
   if(e.boss){
    const age=t-boss.startedAt,p=Math.min(1,age/bossTuning.entrySeconds);
    e.x=335-70*p;e.y=245+(cars[0].y+25-245)*p;
    if(p>=1){e.attackTimer-=dt;if(e.attackTimer<=0){hp=Math.max(0,hp-e.damage);hurtFx={x:cars[0].x+25,y:cars[0].y+10,time:t};e.attackTimer=e.interval;}}
    continue;
   }
   if(e.repel){e.x+=e.repel.vx*dt;e.y+=e.repel.vy*dt;e.repel.remaining-=dt;if(e.repel.remaining<=0)e.repel=null;continue;}
   if(e.knock){e.knock-=dt;e.knockAge+=dt;e.x+=e.vx*dt;const flight=Math.min(1,e.knockAge/tuning.knockDuration);e.y=e.knockOrigin.y+760*flight**1.35;e.angle+=e.vx*dt*2;if(e.knock<=0)e.exited=true;continue;}
   if(invincible&&Math.abs(e.x-210)<tuning.shieldWidth&&e.y>cars[0].y-85&&e.y<cars[cars.length-1].y+65){
    e.knock=tuning.knockDuration;e.knockAge=0;e.knockOrigin={x:e.x,y:e.y};e.vx=(e.x<210?-1:1)*tuning.knockSpeed;e.angle=0;impact=.16;knocked++;continue;
   }
   if(invincible&&!e.fly){e.y+=groundDelta;continue;}
   e.attackTimer=Math.max(0,e.attackTimer-dt);
   const c=cars.reduce((a,b)=>Math.hypot(e.x-a.x,e.y-a.y)<Math.hypot(e.x-b.x,e.y-b.y)?a:b);let dx=c.x-e.x,dy=c.y-e.y,d=Math.hypot(dx,dy);if(d>32&&!e.climbing){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt;}
  }
  separateGround(enemies,groundTravel,cars);
  separateAir(enemies);
  // 基础设备只保护本节；相邻传导升级后，仅连续安装拒止器的相邻车厢能组成共享边界。
  const repulsors=weapons.filter(weapon=>weapon.key==='repulsor');
  for(const weapon of repulsors)weapon.timer=Math.max(0,weapon.timer-dt);
  if(!invincible)for(const group of repulsorGroups(cars,repulsors,!!upgrades.repulsorChain,repulsorTrialConfig.fieldRadius)){
   const ready=group.weapons.some(weapon=>weapon.timer<=0);
   const candidates=ready?enemies.filter(e=>alive(e)&&!e.fly&&!e.boss&&!e.knock&&!e.repel&&repulsorContact(e,group.field).inside):[];
   const target=candidates.sort((a,b)=>repulsorContact(a,group.field).distance-repulsorContact(b,group.field).distance)[0];
   if(target){
   const source=group.weapons[0],direction=repulsorReleaseVector(target,group.field);
   const speed=repulsorTrialConfig.releaseDistance/repulsorTrialConfig.releaseSeconds;
   target.repel={remaining:repulsorTrialConfig.releaseSeconds,vx:direction.x*speed,vy:direction.y*speed,source:source.id};
   target.climbing=false;target.contactCar=null;for(const weapon of group.weapons)weapon.timer=repulsorTrialConfig.interval;
   effects.push({weaponId:source.id,targetId:target.id,key:'repulsor',x:group.field.centerX,y:(group.field.top+group.field.bottom)/2,tx:target.x,ty:target.y,fieldLeft:group.field.left,fieldRight:group.field.right,fieldTop:group.field.top,fieldBottom:group.field.bottom,fieldRadius:group.field.radius,fieldReach:group.field.reach,fieldCars:group.segments,emitters:group.weapons.map(weapon=>({x:weapon.mountX,y:weapon.mountY,carrier:weapon.carrier})),linked:group.cars.length>1,life:repulsorTrialConfig.effectLife,maxLife:repulsorTrialConfig.effectLife});
   }
  }
  // 精英首次攀附先蓄力，避免同一帧贴车即造成无预兆伤害。
  if(!invincible)for(const e of enemies){
   if(e.elite&&alive(e)&&e.climbing&&!e.firstAttackPrepared){e.firstAttackPrepared=true;e.attackTimer=.55;}
  }
  // 本帧位移和占位完成后才结算普通近战，不能沿用上一帧的攀附标记。
  if(!invincible)for(const e of enemies){
   if(!alive(e)||e.boss||e.attackTimer>0)continue;
   const c=e.fly?cars.find(c=>Math.hypot(e.x-c.x,e.y-c.y)<=32):cars.find(c=>e.climbing&&c.id===e.contactCar);
   if(!c)continue;
   hp=Math.max(0,hp-e.damage);hurtFx={x:(e.x+c.x)/2,y:(e.y+c.y)/2,time:t};e.attackTimer=e.interval;
  }
  // 待发脉冲只由模拟时间驱动，选卡或暂停时不会推进。
  for(let i=pulses.length-1;i>=0;i--){const pulse=pulses[i];pulse.remaining-=dt;
   if(pulse.remaining<=0){const e=enemies.find(e=>e.id===pulse.target);if(e)hit(pulse.weapon,e,pulse.damage,undefined,{pulse:'secondary'});pulses.splice(i,1);}
  }
  for(const w of weapons){
   if(w.key==='repulsor')continue;
   w.timer-=dt;const weaponUpgrades=w.arcCountTrialTier==='base'?{...upgrades,arcCount:0}:upgrades,p=weaponStats(w.key,weaponUpgrades);
   if(!p||w.key==='drone'||w.timer>0)continue;
   const targets=w.key==='saw'?sawTargets(w,enemies,p,t):arcTargets({x:w.x,y:w.y+25},enemies,p);
   if(!targets.length)continue;w.timer=p.interval;
   let origin={x:w.x,y:w.y+25};
   for(let i=0;i<targets.length;i++){
    const e=targets[i],chainFeedback=w.key==='arc'?{arcChainIndex:i,arcChainCount:targets.length,arcCountLinked:(w.arcCountTrialTier==='upgraded'||(!w.arcCountTrialTier&&!!upgrades.arcCount))&&i>0}:{};
    hit(w,e,w.key==='arc'&&i>0?p.chainDamage:p.damage,origin,chainFeedback);origin=e;
   }
   if(w.key==='arc'&&p.pulse)pulses.push({weapon:w,target:targets[0].id,damage:p.damage,remaining:.15});
  }
  const claimed=new Set();
  for(const d of drones){
   const w=weapons.find(w=>w.id===d.owner);const p=weaponStats('drone',upgrades);d.timer-=dt;
   const target=droneTarget(w,d,enemies,p,claimed);d.target=target?.id??null;if(target)claimed.add(target.id);
   const paired=p.count>1,lane=d.slot===0?-1:1;
   let dest;
   if(target&&paired){
    // 两机可以继续攻击同一目标，但从两侧编队接敌，避免坐标完全重合。
    let nx=-(target.y-w.y),ny=target.x-w.x,norm=Math.hypot(nx,ny)||1;nx/=norm;ny/=norm;
    if(target.x<40||target.x>380){nx=0;ny=1;}
    dest={x:target.x+lane*20*nx,y:target.y+lane*20*ny};
   }else dest=target||{x:w.x+(paired?lane*22:35),y:w.y+25};
   const dx=dest.x-d.x,dy=dest.y-d.y,dist=Math.hypot(dx,dy);
   const flankApproach=!!target&&paired;
   const travel=Math.min(Math.max(0,dist-(target&&!flankApproach?p.contact*.8:0)),p.speed*dt);
   if(dist>0){d.x+=dx/dist*travel;d.y+=dy/dist*travel;}
   if(target&&Math.hypot(target.x-d.x,target.y-d.y)<=p.contact&&d.timer<=0){hit(w,target,p.damage,d);d.timer=p.interval;}
  }
  if(boss){const target=enemies.find(e=>e.id===boss.id);boss.hp=Math.max(0,target?.hp??0);boss.defeated=boss.hp===0;}
  lootFeedback=lootFeedback.filter(drop=>t-drop.time<.8);
  let scrapThisStep=0;
  for(const e of enemies)if(e.hp<=0){kills++;scrapThisStep+=lootConfig.scrapPerKill;lootFeedback.push({id:e.id,x:e.x,y:e.y,time:t,scrap:lootConfig.scrapPerKill});}
  if(lootFeedback.length>64)lootFeedback.splice(0,lootFeedback.length-64);
  if(elite?.status==='active'){const e=enemies.find(e=>e.id===elite.id);if(e?.hp<=0)elite.status='defeated';else if(!e||e.exited||e.y>=700)elite.status='passed';}
  enemies=enemies.filter(e=>e.hp>0&&(e.knock||e.y<700)&&!e.exited);effects.forEach(e=>e.life-=dt);effects=effects.filter(e=>e.life>0);
  if(scrapThisStep){scrapEarned+=scrapThisStep;options.creditLoot?.(scrapThisStep);}
  if(options.boss&&!boss&&hp>0&&scroll>=routeLength){
   const e=makeEnemy(definition('bossEncounter'),335,245);e.boss=true;e.attackTimer=e.interval;
   boss={id:e.id,name:e.name,hp:e.hp,maxHp:e.hp,startedAt:t,defeated:false};if(sprint.interrupt())sprintInterruptedAt=t;
   enemies.push(e);
  }
  if(!complete()&&priorKills+kills>=nextUpgrade){
   const pool=eligibleCards(weapons,upgrades);
   for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
   choices=pool.slice(0,3);if(choices.length)upgradeId++;
  }
},snapshot(){return JSON.parse(JSON.stringify({mode:'battle',elite,routeLength,wave:waveAt(t),scrapEarned,lootFeedback,boss,sprintLocked:!!boss,sprintInterruptedAt,routeRemaining:Math.max(0,routeLength-scroll),growth:{level,nextUpgrade,levelStartExperience,experience:priorKills+kills,upgrades,firstSupplyLevel},experience:priorKills+kills,lastUpgrade,level,nextUpgrade,levelStartExperience,choices,upgradeId,upgrades,t,hp,maxHp:tuning.hp,kills,paused,done:complete(),compactL3MountTrial:!!options.compactL3MountTrial,scroll,sprintStarts,impact,knocked,hurtFx,sprint:sprint.snapshot(),invincible:sprint.snapshot().active,cars,weapons,drones,enemies,effects}));}};
}
