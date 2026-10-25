import assert from 'node:assert/strict';
import {departure} from './src/presentation/departure.mjs';
import {sceneSpeed} from './src/game/scene-distance.mjs';
// 历史 300 SU/s 取景对照，默认档另由 500 SU/s 出站测试覆盖。
const base={artVersion:'approved',sprint:{distance:300,speedScene:300,speedMetres:93.75},sprintStarts:[0]};
const gateTimes=[0,.15,.3,.45,.6,.75,.9];
const gatePositions=gateTimes.map(t=>departure({...base,t}).offset);
const gateSpeeds=gatePositions.slice(1).map((position,i)=>(gatePositions[i]-position)/.15);
assert.ok(gateSpeeds.slice(0,4).every(speed=>Math.abs(speed-300)<1),'legacy train must burst through the guardrail at 300 SU/s from the first frame');
let previous=null;
for(let i=0;i<=1000;i++){
 const t=i/100,scroll=t<=3.2?t*93.75:300+(t-3.2)*37.5;
 const m=departure({...base,t,scroll}),camera=m.travel+m.offset;
 if(previous){
  assert.ok(camera>=previous.camera,'camera never reverses');
  assert.ok(Math.abs((camera-previous.camera)-(m.offset-previous.offset)-(m.travel-previous.travel))<1e-8,'relative travel preserved');
  if(t>3.21)assert.ok(m.offset>=previous.offset-1e-6,'camera catches train after slowdown');
 }
 previous={...m,camera};
}
assert.ok(previous.offset>80&&previous.offset<180,'camera settles with the full train near screen centre');
const second=departure({...base,t:13,scroll:900,sprintStarts:[0,12]});
assert.equal(second.offset,0,'later sprint camera follows the train instead of pushing it out of frame');
assert.ok(second.travel>departure({...base,t:13,scroll:900}).travel,'later sprint still accelerates world travel');
console.log('PASS forward departure camera / relative ground motion / catch-up / manual sprint follow');
