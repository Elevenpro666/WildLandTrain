import assert from 'node:assert/strict';
import {createBattle} from './src/game/battle.mjs';
import {battleView} from './src/presentation/battle.mjs';
const load={carriers:[{id:'head'}],equipment:[]};
const b=createBattle(load);
b.step(2.9);assert.equal(b.snapshot().routeRemaining,685);
b.step(.2);assert.ok(Math.abs(b.snapshot().routeRemaining-672.5)<1e-6,'split fast and cruise');
b.toggle();const frozen=b.snapshot();b.step(1);assert.deepEqual(b.snapshot(),frozen);b.toggle();
const base=b.snapshot();
for(const [t,opacity] of [[4.9,1],[5.25,.5],[5.6,0]]){
 const s={...base,t};assert.ok(battleView(s).includes(`data-sprint-distance opacity="${opacity}"`));
}
assert.ok(battleView({...base,t:12,sprintStarts:[0,12],sprint:{...base.sprint,active:true}}).includes('data-sprint-distance opacity="1"'));
assert.ok(battleView(base).includes('距下一站'));
function finish(manual){
 const x=createBattle({carriers:[{id:'head'},{id:'c1'},{id:'c2'}],equipment:['head','c1','c2'].flatMap(carrier=>['saw','arc','drone'].map(key=>({id:carrier+key,carrier,key})))});
 for(let i=0;i<3000&&!x.snapshot().done;i++){
  const s=x.snapshot();if(s.choices.length)x.choose(s.choices[0].id,s.upgradeId);
  if(manual)x.release();x.step(1/60);
 }
 assert.equal(x.snapshot().routeRemaining,0);return x.snapshot().t;
}
assert.ok(finish(true)<finish(false),'sprinting arrives earlier');
console.log('PASS route units, boundary integration, pause, hold/fade/reappear, sprint earlier arrival');
