import assert from 'node:assert/strict';
import {separateGround,groundProps,blockTrain} from './src/game/ground-bodies.mjs';
import {alive} from './src/game/weapon-targets.mjs';
const enemies=[{id:1,x:100,y:100,hp:10},{id:2,x:100,y:100,hp:10}];separateGround(enemies,0);assert.ok(Math.hypot(enemies[0].x-enemies[1].x,enemies[0].y-enemies[1].y)>=27.99);
const p=groundProps(0)[0],e={x:p.x,y:p.y+10,hp:10};separateGround([e],0);assert.ok(Math.hypot(e.x-p.x,e.y-p.y-10)>=20.99);
assert.equal(alive({hp:10,emerging:true}),false);assert.equal(alive({hp:10,emerging:false}),true);
console.log('PASS body separation / tree root / emerging excluded');
const cars=[{id:'head',x:210,y:260},{id:'car',x:210,y:345}];
for(const side of [-1,1]){const bug={x:210+side,y:371,hp:10,trainSide:side};blockTrain(bug,cars);assert.equal(bug.x,210+49*side);assert.equal(bug.climbing,true);assert.equal(bug.contactCar,'car');}
console.log('PASS train blocks both sides and preserves approach side');
const detached={x:259,y:371,hp:10};blockTrain(detached,cars);assert.ok(detached.climbing);
detached.x=350;blockTrain(detached,cars);assert.equal(detached.climbing,false);assert.equal(detached.contactCar,null);
for(const flags of [{knock:1},{hp:0},{exited:true}]){
 const bug={x:259,y:371,hp:10,climbing:true,contactCar:'car',...flags};
 separateGround([bug],0,cars);assert.equal(bug.climbing,false);assert.equal(bug.contactCar,null);
}
const emerging={x:220,y:371,hp:10,emerging:true};blockTrain(emerging,cars);assert.equal(emerging.climbing,false);
console.log('PASS detach / knock / death / exit clears contact; emerging cannot climb');
