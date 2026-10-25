import assert from 'node:assert/strict';
import {createBattle} from './src/game/battle.mjs';

const snapshot=levels=>createBattle({
 carriers:[{id:'head',level:0},...levels.map((level,index)=>({id:`c${index+1}`,level}))],
 equipment:[]
},1,{routeLength:2000}).snapshot();

for(const [level,offset] of [[1,80],[2,86],[3,98]]){
 const cars=snapshot([level]).cars;
 assert.equal(cars[1].y-cars[0].y,offset,`L${level} first-car spacing`);
}

const height=level=>70*[0,875,998,1239][level]/740;
const mixed=snapshot([1,2,3]).cars;
for(let index=2;index<mixed.length;index++){
 const previous=mixed[index-1],current=mixed[index];
 const expected=(height(previous.level)+height(current.level))/2-5;
 assert.ok(Math.abs((current.y-previous.y)-expected)<1e-9,`${previous.id}-${current.id} spacing`);
}

console.log('PASS compact head/car and inter-car spacing for L1/L2/L3');
