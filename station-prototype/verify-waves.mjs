import assert from 'node:assert/strict';
import {waveAt} from './src/game/waves.mjs';
import {createBattle} from './src/game/battle.mjs';
import {createTrain} from './src/game/train.mjs';
import {config} from './config.mjs';
assert.equal(waveAt(0).phase,'departure');assert.equal(waveAt(3).phase,'warning');
assert.equal(waveAt(7).phase,'assault');assert.equal(waveAt(21).phase,'respite');assert.equal(waveAt(27).number,2);
assert.ok(waveAt(31).flyingChance>waveAt(7).flyingChance);
assert.throws(()=>waveAt(NaN));
const b=createBattle(createTrain(config).snapshot(),1,{routeLength:10000});
const seen=new Set(Array.from({length:36},(_,i)=>i+1));let additions=0,sawRespite=false,sawSecond=false;
for(let i=0;i<2300&&!b.snapshot().done;i++){
 const before=b.snapshot();if(before.choices.length)b.choose(before.choices[0].id,before.upgradeId);
 b.step(1/60);const s=b.snapshot();
 for(const e of s.enemies)if(!seen.has(e.id)){assert.equal(s.wave.phase,'assault');assert.equal(e.wave,s.wave.number);seen.add(e.id);additions++;}
 if(s.wave.phase==='respite')sawRespite=true;if(s.wave.number===2)sawSecond=true;
 assert.ok(s.enemies.length<=40);
}
assert.ok(additions>0&&sawRespite&&sawSecond);
if(b.snapshot().choices.length)b.choose(b.snapshot().choices[0].id,b.snapshot().upgradeId);
b.toggle();const paused=b.snapshot();b.step(5);assert.deepEqual(b.snapshot(),paused);
console.log('PASS phase boundaries, actual spawning only during assault, alternating waves, cap and pause');
