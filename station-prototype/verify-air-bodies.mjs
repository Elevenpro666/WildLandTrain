import assert from 'node:assert/strict';
import {separateAir} from './src/game/air-bodies.mjs';

const flyers=[{id:1,x:100,y:100,hp:10,fly:true},{id:2,x:100,y:100,hp:10,fly:true}];
separateAir(flyers);
assert.ok(Math.hypot(flyers[0].x-flyers[1].x,flyers[0].y-flyers[1].y)>=23.99);
const ground={id:3,x:100,y:100,hp:10,fly:false};
const flying={id:4,x:100,y:100,hp:10,fly:true};
separateAir([ground,flying]);
assert.deepEqual([ground.x,ground.y,flying.x,flying.y],[100,100,100,100]);
const inactive={id:5,x:100,y:100,hp:10,fly:true,knock:1};
separateAir([flying,inactive]);
assert.deepEqual([flying.x,flying.y,inactive.x,inactive.y],[100,100,100,100]);
console.log('PASS air-air separation; ground and knocked enemies excluded');
