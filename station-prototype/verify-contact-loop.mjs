import assert from 'node:assert/strict';
import {createBattle} from './src/game/battle.mjs';
const b=createBattle({carriers:[{id:'head'},{id:'car'}],equipment:[]},1,{routeLength:5000});
let contacts=0,hits=0,sprints=0;
for(let i=0;i<6000&&!b.snapshot().done;i++){
 const before=b.snapshot();
 if(before.sprint.energy>=100&&before.enemies.some(e=>e.climbing)&&b.release())sprints++;
 const active=b.snapshot().invincible;b.step(1/60);const after=b.snapshot();
 if(active)assert.equal(after.hp,before.hp,'invincible rejects contact damage');
 if(after.hp<before.hp)hits++;
 for(const e of after.enemies){
  if(e.knock||e.exited||e.hp<=0){assert.ok(!e.climbing);assert.equal(e.contactCar,null);}
  if(e.climbing){contacts++;const c=after.cars.find(c=>c.id===e.contactCar);assert.ok(c);assert.ok(Math.abs(e.x-c.x)>=49);assert.ok(!e.emerging);}
 }
 if(i===360){b.toggle();const frozen=b.snapshot();b.step(3);assert.deepEqual(b.snapshot(),frozen);b.toggle();}
}
assert.ok(contacts>0);assert.ok(hits>0);assert.ok(sprints>0);
console.log({result:'PASS contact loop, sprint immunity, detach and pause',contacts,hits,sprints});
