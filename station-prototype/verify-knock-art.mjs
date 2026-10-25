import assert from 'node:assert/strict';
import {approvedScorpion} from './src/presentation/approved-art.mjs';
import {knockbackView} from './src/presentation/knockback-view.mjs';
import {createBattle} from './src/game/battle.mjs';
import {createTrain} from './src/game/train.mjs';
import {config} from './config.mjs';
const s={sprintStarts:[0]},e={id:4,x:210,y:300,knock:1,knockAge:.7,angle:140};
const before=JSON.stringify(e);
assert.ok(approvedScorpion(e,s).includes('toward-camera'));
assert.ok(approvedScorpion({...e,id:5},s).includes('data-knock-art="side"'));
assert.ok(approvedScorpion(e,{sprintStarts:[0,12]}).includes('data-knock-art="side"'));
assert.equal(approvedScorpion({...e,knockAge:1.1},s),'');
for(const body of ['<circle r="10"/>','<path d="M-10 10L0-10 10 10Z"/>'])for(const mode of ['camera','side']){
 const args={x:100,y:200,originX:80,age:.4,body,mode};
 assert.ok(knockbackView(args).includes(body));assert.equal(knockbackView(args),knockbackView(args));
}
assert.throws(()=>knockbackView({x:NaN,y:0,body:''}),TypeError);
assert.equal(JSON.stringify(e),before);
const frames=['BACK','SIDE','BELLY','OTHER'];
const shapes=new Set();
for(let variant=0;variant<6;variant++){
 const art=knockbackView({x:100,y:200,body:'BACK',frames,variant,age:.4});
 assert.ok(!art.includes('NaN'));shapes.add(art);
}
assert.equal(shapes.size,6);
assert.ok(knockbackView({x:100,y:200,body:'BACK',frames,age:.55}).includes('BELLY'));
assert.throws(()=>knockbackView({x:100,y:200,body:'BACK',frames:[]}),TypeError);
const battle=createBattle(createTrain(config).snapshot());
for(let i=0;i<64;i++){const state=battle.snapshot();if(state.choices.length)battle.choose(state.choices[0].id,state.upgradeId);battle.step(1/60);}
const flight=battle.snapshot().enemies.filter(enemy=>enemy.knock);
assert.ok(flight.length>0,'the opening crowd must still be flying after the train passes');
assert.ok(flight.some(enemy=>enemy.y>battle.snapshot().cars.at(-1).y+110),'knocked scorpions must pass behind the train, not stay before its nose');
const sample=knockbackView({x:100,y:600,originX:80,age:.8,body:'BACK'});
assert.ok(Number(sample.match(/data-flying-y="([^"]+)"/)?.[1])<600,'flying body must separate from its ground shadow');
const highArc=knockbackView({x:100,y:600,originX:80,age:.55,variant:3,body:'BACK'});
assert.ok(Number(highArc.match(/data-flying-y="([^"]+)"/)?.[1])<480,'high arc should visibly lift the creature away from its ground trajectory');
console.log('PASS launch-only subset / side fallback / fade / pure presentation');
