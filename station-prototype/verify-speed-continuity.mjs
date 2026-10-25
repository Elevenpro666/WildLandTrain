import assert from 'node:assert/strict';
import {sceneTravel,sceneSpeed} from './src/game/scene-distance.mjs';
const h=.0001;
for(const boundary of [1.92,3.12]){
 const f=t=>sceneTravel(t,[0],1.92);
 const left=(f(boundary)-f(boundary-h))/h,right=(f(boundary+h)-f(boundary))/h;
 assert.ok(Math.abs(left-right)<.2,`speed discontinuity ${boundary}: ${left}/${right}`);
}
const speed=t=>(sceneTravel(t+h,[0],1.92)-sceneTravel(t,[0],1.92))/h;
assert.ok(Math.abs(speed(0)-sceneSpeed.sprint)<.2,'departure must be full speed immediately');
assert.ok(Math.abs(speed(1)-500)<.2);assert.ok(speed(2.5)<500&&speed(2.5)>120);assert.ok(Math.abs(speed(4)-120)<.01);
console.log('PASS immediate 500SU/s departure, smooth 1.2s deceleration to 120SU/s');
