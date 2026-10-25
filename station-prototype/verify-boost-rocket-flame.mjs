import assert from 'node:assert/strict';
import {weaponsView} from './src/presentation/weapon-feedback.mjs';

const state=(phase,art='rocket')=>({
  weapons:Array.from({length:4},()=>({key:'boost',carrier:'c2',x:200,y:180})),
  cars:[{x:200,y:100}],
  upgrades:{},
  rearBankCandidate:true,
  boostArtTrial:art,
  sprint:{phase},
  t:.4,
});

const rendered={};
for(const phase of ['charging','sprinting','decelerating']){
  const html=weaponsView(state(phase));
  const flames=html.match(/data-boost-flame="rocket"/g)||[];
  assert.equal(flames.length,4,`${phase}: each rocket nozzle has its own flame`);
  assert.equal((html.match(new RegExp(`data-boost-flame-state="${phase}"`,'g'))||[]).length,4);
  rendered[phase]=html;
}
const maxPlume=(html)=>Math.max(...[...html.matchAll(/data-boost-flame="rocket"[\s\S]*?<path d="M-3\.1 0Q-2\.4 ([\d.]+)/g)].map(match=>Number(match[1])));
assert.ok(maxPlume(rendered.sprinting)>maxPlume(rendered.charging),'sprint plume is longer than cruise plume');
assert.ok(maxPlume(rendered.decelerating)<maxPlume(rendered.sprinting),'deceleration plume retracts');
assert.equal((weaponsView(state('charging','enhanced')).match(/data-boost-flame="rocket"/g)||[]).length,0,'non-rocket boost art remains unchanged');
console.log('PASS: 4 rocket nozzle flames are present at cruise/sprint/deceleration; sprint lengthens the plume; other boost art is unchanged.');
