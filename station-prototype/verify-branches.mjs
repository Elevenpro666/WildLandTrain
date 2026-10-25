import assert from 'node:assert/strict';
import './verify-weapon-asset-references.mjs';
import './verify-art-asset-registry.mjs';
import {upgradeCards,eligibleCards,initialUpgrades,weaponStats,upgradeCost} from './src/game/upgrades.mjs';
import {arcTargets,sawTargets,droneTarget} from './src/game/weapon-targets.mjs';
import {createBattle} from './src/game/battle.mjs';
import {droneTargetingView} from './src/presentation/weapon-feedback.mjs';
import {droneOrnaments} from './src/presentation/weapon-ornaments.mjs';
assert.equal(upgradeCards.filter(c=>c.weapon).length,13);
const owned=initialUpgrades(),types=['saw','arc','drone'].map(key=>({key}));
let pool=eligibleCards(types,owned);assert.equal(pool.length,6);assert.ok(!pool.some(c=>c.requires||c.id==='supply'));
assert.deepEqual(eligibleCards([{key:'saw'}],owned).map(c=>c.id),['sawReach','sawDamage','supply']);
owned.sawReach=1;pool=eligibleCards(types,owned);assert.ok(pool.some(c=>c.id==='sawLinked'));assert.ok(!pool.some(c=>c.id==='sawReach'));
for(const c of upgradeCards.filter(c=>c.weapon))owned[c.id]=1;
assert.deepEqual(eligibleCards(types,owned).map(c=>c.id),['supply']);owned.supply=2;
assert.equal(weaponStats('saw',owned).damage,14.399999999999999);assert.equal(weaponStats('arc',owned).damage,21.599999999999998);assert.equal(weaponStats('drone',owned).damage,24);
assert.deepEqual([1,2,3,4,5,6,7].map(upgradeCost),[5,8,12,16,20,24,24]);
const e=(id,x,y,extra={})=>({id,x,y,hp:100,maxHp:100,fly:false,...extra});
const enemies=[e(1,100,0),e(2,155,0),e(3,210,0),e(4,280,0),e(5,500,0)];
assert.deepEqual(arcTargets({x:0,y:0},enemies,weaponStats('arc',initialUpgrades())).map(e=>e.id),[1,2,3]);
assert.deepEqual(arcTargets({x:0,y:0},enemies,weaponStats('arc',owned)).map(e=>e.id),[1,2,3,4]);
const sawEnemies=[e(1,40,25),e(2,65,25),e(3,40,70),e(4,40,25,{fly:true}),e(5,0,25)];
assert.deepEqual(sawTargets({x:0,y:0},sawEnemies,weaponStats('saw',initialUpgrades())).map(e=>e.id),[1]);
assert.deepEqual(sawTargets({x:0,y:0},sawEnemies,weaponStats('saw',owned)).map(e=>e.id),[1,2]);
assert.equal(droneTarget({x:0,y:0},{x:0,y:0},[e(1,20,0),e(2,40,0,{maxHp:200})],weaponStats('drone',owned),new Set()).id,2);
const patrolView=droneTargetingView({t:1,upgrades:{dronePatrol:1},enemies:[e(1,30,0),e(2,40,0)],drones:[{id:'left',slot:1,x:0,y:0,target:1},{id:'right',slot:2,x:0,y:10,target:2}]});
assert.equal((patrolView.match(/data-drone-patrol-assignment=/g)||[]).length,2);assert.match(patrolView,/data-drone-patrol-target="1"/);assert.match(patrolView,/data-drone-patrol-target="2"/);
const patrolHardware=droneOrnaments({x:100,y:100},{upgrades:{dronePatrol:1}});assert.match(patrolHardware,/data-drone-patrol-hardware="radar-array-v1"/);assert.match(patrolHardware,/assets\/weapons\/drone-patrol-radar-v1\.svg/);assert.doesNotMatch(droneOrnaments({x:100,y:100},{upgrades:{}}),/drone-patrol-radar-v1/);
const focusPatrolView=droneTargetingView({t:1,upgrades:{dronePatrol:1,droneFocus:1},enemies:[e(1,30,0)],drones:[{id:'left',slot:1,x:0,y:0,target:1}]});assert.match(focusPatrolView,/data-drone-focus-lock=/);assert.doesNotMatch(focusPatrolView,/data-drone-patrol-assignment=/);
const load={carriers:[{id:'head'}],equipment:[{id:'bay',key:'drone',carrier:'head'}]};
const b=createBattle(load);const start=b.snapshot();b.step(.1);const next=b.snapshot();assert.notDeepEqual(next.drones,start.drones);
assert.ok(Math.hypot(next.drones[0].x-start.drones[0].x,next.drones[0].y-start.drones[0].y)<=14.00001);
for(const fx of next.effects.filter(e=>e.key==='drone'))assert.ok(Math.hypot(fx.x-fx.tx,fx.y-fx.ty)<=25);
const upgraded=createBattle(load,1,{growth:{level:3,nextUpgrade:25,experience:13,upgrades:{...initialUpgrades(),droneCount:1}}});assert.equal(upgraded.snapshot().drones.length,2);
const paired=createBattle(load,1,{growth:{level:1,nextUpgrade:999,experience:0,upgrades:{...initialUpgrades(),droneCount:1,droneDamage:1,droneFocus:1}}});
for(let i=0;i<24;i++)paired.step(1/60);
const pairedIdle=paired.snapshot().drones;assert.equal(pairedIdle.length,2);assert.ok(Math.abs(pairedIdle[0].x-pairedIdle[1].x)>=40);
for(let i=0;i<696;i++)paired.step(1/60);
const pairedCombat=paired.snapshot(),pairA=pairedCombat.drones[0],pairB=pairedCombat.drones[1];
assert.ok(pairA.target!==null&&pairA.target===pairB.target);assert.ok(Math.hypot(pairA.x-pairB.x,pairA.y-pairB.y)>=30);
const sharedTarget=pairedCombat.enemies.find(e=>e.id===pairA.target);assert.ok(sharedTarget);
const empty=createBattle({carriers:[{id:'head'}],equipment:[]},1,{growth:upgraded.snapshot().growth});assert.equal(empty.snapshot().drones.length,0);
console.log('PASS 13 cards including repulsor linkage, prerequisites, one fallback, damage stacking, XP thresholds, chain distance, saw ground-only, drone targeting/movement, visible paired formation and rebuild');

const all=Object.fromEntries(upgradeCards.map(c=>[c.id,c.weapon?1:0]));
const fallback=createBattle(load,1,{growth:{level:13,nextUpgrade:5,experience:5,upgrades:all}});
fallback.step(.01);let offer=fallback.snapshot();assert.deepEqual(offer.choices.map(c=>c.id),['supply']);
const frozen=fallback.snapshot();fallback.step(1);assert.deepEqual(fallback.snapshot(),frozen);
assert.equal(fallback.choose('supply',offer.upgradeId),true);assert.equal(fallback.choose('supply',offer.upgradeId),false);assert.equal(fallback.snapshot().upgrades.supply,1);assert.equal(fallback.snapshot().growth.firstSupplyLevel,14);
// 真实场景里查验追加脉冲：同一目标连续两次命中，时间间隔至少0.15秒。
const pulseBattle=createBattle({carriers:[{id:'head'}],equipment:[{id:'coil',key:'arc',carrier:'head'}]},1,{growth:{level:3,nextUpgrade:999,experience:0,upgrades:{...initialUpgrades(),arcDamage:1,arcPulse:1}}});
const hits=new Map();let repeated=false,secondarySeen=false;
for(let i=0;i<1200&&!pulseBattle.snapshot().done;i++){
 pulseBattle.step(1/60);const s=pulseBattle.snapshot();
 for(const fx of s.effects.filter(e=>e.life>.23)){
  if(fx.pulse==='secondary')secondarySeen=true;
  const prior=hits.get(fx.targetId);if(prior&&s.t-prior>.14&&s.t-prior<.19)repeated=true;
  hits.set(fx.targetId,s.t);
 }
}
assert.ok(repeated,'delayed second pulse actually applies');assert.ok(secondarySeen,'secondary hit carries its own presentation marker');
console.log('PASS single fallback offer, repeat dedupe, pause and delayed arc pulse');
