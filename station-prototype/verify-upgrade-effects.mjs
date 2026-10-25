import assert from 'node:assert/strict';
import {createBattle} from './src/game/battle.mjs';
import {battleView} from './src/presentation/battle.mjs';
for(const [key,ids] of [['saw',['sawReach','sawDamage']],['arc',['arcReach','arcDamage']],['drone',['droneCount','droneDamage']]]){
 const loadout={carriers:[{id:'head'},{id:'c1'},{id:'c2'}],equipment:[0,1,2].map(i=>({id:'e'+i,key,carrier:['head','c1','c2'][i]}))};
 const b=createBattle(loadout);
 for(let i=0;i<1800&&!b.snapshot().choices.length&&!b.snapshot().done;i++)b.step(1/60);
 const s=b.snapshot();assert.deepEqual(new Set(s.choices.map(c=>c.id)),new Set([...ids,'supply']));
 assert.equal(b.choose(ids[0],s.upgradeId),true);assert.equal(b.choose(ids[0],s.upgradeId),false);
 const after=b.snapshot();assert.equal(after.upgrades[ids[0]],1);
 assert.equal(after.weapons.length,3);
 if(key==='drone')assert.equal(after.drones.length,6);
 if(key==='saw'){
  const svg=battleView(after);
  assert.equal((svg.match(/data-saw-reach="70"/g)||[]).length,6);
  assert.equal((svg.match(/width="45" height="45" viewBox=/g)||[]).length,6);
 }
 assert.ok(!battleView(after).includes('NaN'));
 for(let i=0;i<4000&&!b.snapshot().done;i++){const s=b.snapshot();if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);b.release();b.step(1/60);}
 assert.ok(b.snapshot().done);
 assert.equal(createBattle(loadout).snapshot().upgrades[ids[0]],0);
 console.log('PASS',key,'filtered branches, choice dedupe, real effect, finish and new-run reset');
}
