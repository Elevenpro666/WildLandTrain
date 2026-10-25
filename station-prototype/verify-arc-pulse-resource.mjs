import assert from 'node:assert/strict';
import {arcMounts} from './src/presentation/arc-mount.mjs';
import {createBattle} from './src/game/battle.mjs';
import {initialUpgrades,weaponStats} from './src/game/upgrades.mjs';
import {hitView} from './src/presentation/weapon-feedback.mjs';

const group={carrier:'head',count:4,x:210,y:260};
const upgrades={arcDamage:1,arcPulse:1};
const state={artVersion:'approved',mountTrialCandidate:true,mountArtTier:'basic',upgrades,t:1,
 weapons:Array.from({length:4},(_,index)=>({id:`arc-${index}`,key:'arc',carrier:'head'}))};
const markup=arcMounts(group,state);
const count=needle=>markup.split(needle).length-1;
assert.equal(count('data-mount="arc"'),4);
assert.equal(count('data-arc-pulse-capacitor="v1"'),4);
assert.equal(count('arc-pulse-capacitor-v1.svg'),4);
assert.equal(count('data-arc-capacitor-art="v1"'),0);
assert.equal(count('arcParallel'),0,'do not replace the weapon with a second-channel silhouette');
assert.deepEqual(weaponStats('arc',upgrades),{damage:18,chainDamage:8,interval:1,range:120,jump:60,count:3,pulse:true});

const battle=createBattle({carriers:[{id:'head'}],equipment:[{id:'arc-one',key:'arc',carrier:'head'}]},1,{growth:{level:1,nextUpgrade:99999,experience:0,upgrades:{...initialUpgrades(),...upgrades}}});
let secondary=null;
for(let i=0;i<1200&&!battle.snapshot().done&&!secondary;i++){
 battle.step(1/60);
 secondary=battle.snapshot().effects.find(effect=>effect.pulse==='secondary')||null;
}
assert.ok(secondary,'secondary pulse hit must be represented in combat effects');
const secondaryView=hitView({effects:[secondary],upgrades});
assert.ok(secondaryView.includes('data-arc-pulse="secondary"'));
assert.ok(secondaryView.includes('data-arc-layer="hot-core"'));
assert.ok(secondaryView.includes('data-arc-impact-flash="true"'));
console.log('PASS: same four arc mounts switch to paired-pulse module; weapon logic unchanged; real delayed hit has matching second-strike feedback.');
