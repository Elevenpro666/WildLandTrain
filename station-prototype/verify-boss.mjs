import assert from 'node:assert/strict';
import {createBattle} from './src/game/battle.mjs';
import {createTrain} from './src/game/train.mjs';
import {config} from './config.mjs';
import {departure} from './src/presentation/departure.mjs';
import {battleView} from './src/presentation/battle.mjs';
const load=createTrain(config).snapshot();
function enter(distance){
 const b=createBattle(load,1,{routeLength:distance,boss:true});
 for(let i=0;i<10000&&!b.snapshot().boss&&!b.snapshot().done;i++){
  const s=b.snapshot();if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);b.step(1/60);
 }
 assert.ok(b.snapshot().boss);return b;
}
const short=enter(100),s=short.snapshot();assert.equal(s.invincible,false);assert.equal(s.sprintLocked,true);assert.ok(s.sprint.remaining>0);assert.equal(s.done,false);
assert.equal(short.release(),false);assert.equal(short.release(),false);
const baseline=departure({...s,boss:null});assert.ok(Math.abs(departure(s).offset-baseline.offset)<1e-6);assert.ok(Math.abs(departure(s).travel-baseline.travel)<1e-6);
if(s.choices.length)short.choose(s.choices[0].id,s.upgradeId);
short.toggle();const frozen=short.snapshot();short.step(1);assert.deepEqual(short.snapshot(),frozen);short.toggle();
const energy=short.snapshot().sprint.energy;short.step(.2);assert.equal(short.snapshot().sprint.energy,energy);assert.ok(Math.abs(departure(short.snapshot()).offset)<=Math.abs(baseline.offset));
const charged=enter(600);assert.equal(charged.snapshot().sprint.energy,100);assert.equal(charged.release(),false);
for(let i=0;i<10000&&!charged.snapshot().done;i++){const s=charged.snapshot();if(s.choices.length)charged.choose(s.choices[0].id,s.upgradeId);charged.step(1/60);assert.equal(charged.release(),false);}
const end=charged.snapshot();assert.equal(end.boss.defeated,true);assert.ok(end.hp>0);assert.equal(end.done,true);const final=end;charged.step(1);assert.deepEqual(charged.snapshot(),final);
assert.ok(battleView(s).includes('data-state="locked"'));assert.ok(battleView(s).includes('Boss战期间无法冲刺'));assert.ok(!battleView(s).includes('data-effect="shield"'));assert.ok(battleView(s).includes('Boss耐久'));assert.ok(!battleView(s).includes('Boss封锁'));
const weak=createBattle({carriers:[{id:'head'}],equipment:[]},1,{boss:true,routeLength:1});for(let i=0;i<10000&&!weak.snapshot().done;i++)weak.step(1/60);assert.equal(weak.snapshot().hp,0);assert.equal(weak.snapshot().boss.defeated,false);
console.log('PASS boss interrupts active sprint, rejects charged/repeated release, freezes energy, smooth camera, pause, kill-to-win and death');
