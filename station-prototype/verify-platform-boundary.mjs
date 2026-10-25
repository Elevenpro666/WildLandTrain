import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createBattle} from './src/game/battle.mjs';
import {createTrain} from './src/game/train.mjs';
import {config} from './config.mjs';

const roots=['src/game','configs'];
const forbidden=/\b(?:window|document|localStorage|requestAnimationFrame|HTMLElement|CanvasRenderingContext2D|wx)\s*(?:\.|\[|\()/;
function walk(dir){
 for(const entry of readdirSync(new URL(dir+'/',import.meta.url),{withFileTypes:true})){
  const path=join(dir,entry.name);
  if(entry.isDirectory())walk(path);
  else if(entry.name.endsWith('.mjs')){
   const source=readFileSync(new URL(path,import.meta.url),'utf8');
   assert.equal(forbidden.test(source),false,`${path} must not access a platform API`);
   assert.equal(/from\s+['"][^'"]*(?:presentation|adapters|bootstrap)\//.test(source),false,`${path} must not import UI`);
  }
 }
}
roots.forEach(walk);

const battle=createBattle(createTrain(config).snapshot(),1,{routeLength:100,boss:true});
assert.equal(battle.snapshot().invincible,true);
for(let i=0;i<300&&!battle.snapshot().boss;i++){
 const state=battle.snapshot();
 if(state.choices.length)assert.equal(battle.choose(state.choices[0].id,state.upgradeId),true);
 battle.step(1/60);
}
const state=battle.snapshot();
assert.ok(state.boss,'Boss must enter after the route');
assert.equal(state.invincible,false,'Boss must interrupt the departure sprint');
assert.equal(battle.release(),false,'Boss must lock manual sprint');
console.log('PASS game/config modules are platform-free; departure sprint, boss interruption and sprint lock run without DOM');
