import assert from 'node:assert/strict';
import {createSession} from './src/session.mjs';

const game=createSession();
assert.equal(game.state().mode,'station');
assert.equal(game.state().station.cash,90);
assert.equal(game.action({type:'buyCart'}),true);
assert.equal(game.state().station.carriers.length,4);
assert.equal(game.action({type:'selectCar',id:'c10'}),true);
assert.equal(game.action({type:'buyModule',key:'arc'}),true);
assert.equal(game.state().station.equipment.some(e=>e.carrier==='c10'&&e.key==='arc'),true);
assert.equal(game.action({type:'depart'}),true);
assert.equal(game.state().mode,'battle');
let sawChoice=false,seenBoss=false;
for(let i=0;i<50000&&!game.state().result;i++){
 const s=game.state();
 if(s.mode==='battle'){
  if(s.battle.choices.length){sawChoice=true;assert.equal(game.action({type:'choose',id:s.battle.choices[0].id}),true);}
  if(s.battle.boss){seenBoss=true;assert.equal(game.action({type:'sprint'}),false);}
  else if(s.battle.sprint.energy>=100)game.action({type:'sprint'});
 }else if(s.mode==='station')assert.equal(game.action({type:'depart'}),true);
 game.step(1/30);
}
const end=game.state();
assert.equal(sawChoice,true,'upgrade selection must occur');
assert.equal(seenBoss,true,'boss must occur');
assert.equal(end.mode,'result');
assert.equal(end.result.win,true);
assert.equal(end.journey.completed.length,3);
assert.equal(game.action({type:'reset'}),true);
assert.equal(game.state().mode,'station');
console.log('PASS 微信画面会话复用原规则：购车/装配/出站/选卡/冲刺/Boss/入站/三段胜利/重开');

const merge=createSession();
assert.equal(merge.action({type:'mergeStart',id:'c1'}),true);
assert.equal(merge.action({type:'mergeWith',id:'c2'}),true);
assert.equal(merge.state().confirm.type,'merge');
assert.equal(merge.action({type:'confirm'}),true);
assert.equal(merge.state().station.carriers.length,2);
assert.equal(merge.state().station.reserveCars.length,0);
assert.equal(merge.state().station.equipment.filter(e=>!e.carrier).length,4);
assert.equal(merge.action({type:'depart'}),false);
const spare=merge.state().station.equipment.find(e=>!e.carrier);
assert.equal(merge.action({type:'sell',id:spare.id}),true);
assert.equal(merge.action({type:'cancel'}),true);
assert.ok(merge.state().station.equipment.some(e=>e.id===spare.id));
assert.equal(merge.action({type:'sell',id:spare.id}),true);
assert.equal(merge.action({type:'confirm'}),true);
assert.ok(!merge.state().station.equipment.some(e=>e.id===spare.id));
console.log('PASS 合成后装备进入周转；出站阻止、出售确认与取消按玩家选择生效');
