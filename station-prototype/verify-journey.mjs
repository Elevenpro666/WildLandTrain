import assert from 'node:assert/strict';
import {createJourney} from './src/game/journey.mjs';
import {createBattle} from './src/game/battle.mjs';
import {journeyStages,config} from './config.mjs';
import {createTrain} from './src/game/train.mjs';
let cash=0;
const j=createJourney({stages:journeyStages,credit:v=>cash+=v});
const load=createTrain(config).snapshot();
let previous=null;
for(let n=1;n<=3;n++){
 assert.equal(j.depart(),true);assert.equal(j.depart(),false);
 const before=j.snapshot();const b=createBattle(load,1,{routeLength:before.route.distance,growth:before.growth,boss:before.route.boss});
 if(previous){assert.deepEqual(b.snapshot().upgrades,previous.upgrades);assert.equal(b.snapshot().experience,previous.experience);assert.equal(b.snapshot().hp,300);}
 for(let i=0;i<20000&&!b.snapshot().done;i++){
  const s=b.snapshot();if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);b.release();b.step(1/60);
 }
 const end=b.snapshot();assert.ok(end.hp>0);assert.equal(end.routeRemaining,0);previous=end.growth;
 assert.equal(j.finish(end),true);assert.equal(j.finish(end),false);assert.equal(cash,Math.min(n,2)*48);
 if(n<3){assert.equal(j.arrive(),true);assert.equal(j.arrive(),false);}
}
assert.equal(j.snapshot().phase,'won');assert.equal(j.depart(),false);j.dispose();assert.equal(j.debugReturn(),false);
const fresh=createJourney({stages:journeyStages,credit:v=>cash+=v});assert.equal(fresh.snapshot().growth,null);fresh.depart();
fresh.finish({done:true,hp:0,kills:2,routeRemaining:300,growth:{level:1}});assert.equal(fresh.snapshot().phase,'lost');assert.equal(cash,96);
console.log('PASS three stages, shared growth, full repair, rewards once, death, restart and dispose');
