import assert from 'node:assert/strict';
import {createBattle} from './src/game/battle.mjs';
import {initialUpgrades} from './src/game/upgrades.mjs';

const loadout={carriers:[{id:'head'},{id:'c1'}],equipment:[
 {id:'arc-base',key:'arc',carrier:'c1'},
 {id:'arc-upgraded',key:'arc',carrier:'c1'},
]};
const upgrades={...initialUpgrades(),arcReach:1,arcCount:1};
const battle=createBattle(loadout,1,{routeLength:10000,arcCountCompare:true,growth:{level:1,nextUpgrade:999,experience:0,upgrades}});
const weapons=battle.snapshot().weapons;
assert.deepEqual(weapons.map(w=>w.arcCountTrialTier),['base','upgraded']);

const observed=new Map([['arc-base',new Set()],['arc-upgraded',new Set()]]);
const branching=new Set();
const deepest=new Map([['arc-base',0],['arc-upgraded',0]]);
for(let frame=0;frame<1200;frame++){
 battle.step(1/60);
 for(const effect of battle.snapshot().effects){
  if(!observed.has(effect.weaponId))continue;
  observed.get(effect.weaponId).add(effect.targetId);
  if(effect.arcCountLinked)branching.add(effect.weaponId);
  deepest.set(effect.weaponId,Math.max(deepest.get(effect.weaponId),effect.arcChainIndex??0));
 }
}
assert.ok(observed.get('arc-base').size>0,'comparison base weapon produces real hit events');
assert.ok(observed.get('arc-upgraded').size>0,'upgraded weapon produces real hit events');
assert.equal(branching.has('arc-base'),false,'base hits remain single-strand');
assert.equal(branching.has('arc-upgraded'),true,'only upgraded chain emits conductive branches');
assert.ok(deepest.get('arc-base')<=2,'base chain is capped at three actual targets');
assert.ok(deepest.get('arc-upgraded')>deepest.get('arc-base'),'upgrade reaches farther down the real hit chain');
console.log('PASS: arcCount comparison isolates base single-chain and upgraded branching conduction in real battle events.');
