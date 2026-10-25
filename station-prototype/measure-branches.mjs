import {createBattle} from './src/game/battle.mjs';
import {createTrain} from './src/game/train.mjs';
import {config,journeyStages} from './config.mjs';
const routes={coverage:['sawReach','sawLinked','arcReach','arcCount','droneCount','dronePatrol'],focused:['arcDamage','arcPulse','droneDamage','droneFocus','sawDamage','sawRate'],fallback:['supply']};
const results=[];
for(const [policy,priority] of Object.entries(routes))for(const sprint of [true,false]){
 let growth=null;const stages=[];
 for(const [index,stage] of journeyStages.entries()){
  const b=createBattle(createTrain(config).snapshot(),1,{routeLength:stage.distance,growth});
  for(let i=0;i<20000&&!b.snapshot().done;i++){
   const s=b.snapshot();if(s.choices.length){const card=priority.map(id=>s.choices.find(c=>c.id===id)).find(Boolean)||s.choices[0];b.choose(card.id,s.upgradeId);}
   if(sprint)b.release();b.step(1/60);
  }
  const s=b.snapshot();growth=s.growth;stages.push({stage:index+1,hp:s.hp,seconds:+s.t.toFixed(1),kills:s.kills,level:s.level,supply:s.upgrades.supply});if(s.hp<=0)break;
 }
 results.push({policy,sprint,stages,firstSupplyLevel:growth.firstSupplyLevel,supplyRatio:+(growth.upgrades.supply/Math.max(1,growth.level-1)).toFixed(3)});
}
console.log(JSON.stringify(results,null,2));
