import assert from 'node:assert/strict';
import {createBattle} from './src/game/battle.mjs';
import {createTrain} from './src/game/train.mjs';
import {config} from './config.mjs';
import {waveView} from './src/presentation/wave-view.mjs';
const b=createBattle(createTrain(config).snapshot(),1,{elite:true,routeLength:10000});
for(let i=0;i<1200&&!b.snapshot().elite;i++){const s=b.snapshot();if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);b.step(1/60);}
assert.equal(b.snapshot().elite.status,'active');
assert.equal(b.snapshot().enemies.find(e=>e.elite).definitionId,'brute');
assert.ok(waveView({...b.snapshot(),journey:{stage:2}}).includes('data-encounter-route="2"'));
for(let i=0;i<1000&&b.snapshot().sprint.energy<100;i++){const s=b.snapshot();if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);b.step(1/60);}
if(b.snapshot().choices.length)b.choose(b.snapshot().choices[0].id,b.snapshot().upgradeId);
assert.equal(b.release(),true);assert.equal(b.snapshot().sprintLocked,false);
for(let i=0;i<1000&&b.snapshot().elite.status==='active';i++){const s=b.snapshot();if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);b.step(1/60);}
assert.ok(['passed','defeated'].includes(b.snapshot().elite.status));
assert.ok(waveView({...b.snapshot(),journey:{stage:2}}).includes('data-encounter-route="3"'));
const snapshot=b.snapshot();snapshot.elite.status='fake';assert.notEqual(b.snapshot().elite.status,'fake');
console.log('PASS actual elite from catalog, sprint permitted, encounter resolution and route progression');
