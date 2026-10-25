import assert from 'node:assert/strict';
import {sceneDistance} from './src/game/scene-distance.mjs';
import {createBattle} from './src/game/battle.mjs';
import {createTrain} from './src/game/train.mjs';
import {config} from './config.mjs';
const b=createBattle(createTrain(config).snapshot());
const clear=()=>{const s=b.snapshot();if(s.choices.length)b.choose(s.choices[0].id,s.upgradeId);};
let a=b.snapshot();b.step(.1);let z=b.snapshot();
assert.ok(Math.abs(z.scroll-a.scroll-15.625)<1e-8);
assert.ok(Math.abs(sceneDistance(z.scroll)-sceneDistance(a.scroll)-50)<1e-8);
for(let i=0;i<400&&b.snapshot().invincible;i++){clear();b.step(.02);}
clear();a=b.snapshot();assert.equal(a.invincible,false);assert.equal(a.done,false);
b.step(.1);z=b.snapshot();assert.ok(Math.abs(z.scroll-a.scroll-3.75)<1e-8);
assert.ok(Math.abs(sceneDistance(z.scroll)-sceneDistance(a.scroll)-12)<1e-8);
clear();b.toggle();a=b.snapshot();b.step(2);assert.deepEqual(b.snapshot(),a);
console.log('PASS cruise 37.5m/s→120SU/s / sprint 156.25m/s→500SU/s / pause frozen');
