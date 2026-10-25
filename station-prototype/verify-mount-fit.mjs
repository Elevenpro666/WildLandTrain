import assert from 'node:assert/strict';
import {checkWeaponMountFit} from './configs/mount-fit.mjs';
import {createTrain} from './src/game/train.mjs';
import {createStation} from './src/game/station.mjs';
import {platformPads} from './configs/mount-layout.mjs';

for(const key of ['carL1','carL2','carL3']){
 const pads=platformPads[key],xs=[...new Set(pads.map(([x])=>x))],ys=[...new Set(pads.map(([,y])=>y))];
 assert.deepEqual(xs,[-10,10],`${key} uses the same centered two-column spacing as the head deck`);
 assert.equal((ys[0]+ys.at(-1))/2,26,`${key} slot rows keep equal front/rear deck margins`);
}

const fit=items=>checkWeaponMountFit(items.map((key,index)=>({key,carrier:'c1',id:`${key}-${index}`})));
assert.equal(fit(['saw','boost','boost']).ok,true,'one saw and two rear P boosters retain clearance');
assert.equal(fit(['saw','boost']).ok,true,'one saw and one rear P booster retain clearance');
assert.match(fit(['saw','saw','boost']).reason,/横向往复支架/,'two-saw swept support conflicts with rear P');
assert.match(fit(['saw','saw','boost','boost','boost','boost']).reason,/助推器占位区/,'legal high-capacity mix is rejected for geometry, not capacity');
assert.equal(fit(['arc','drone','boost','boost']).ok,true,'arc effects and drone flight layer are not physical blockers');
assert.equal(fit(['saw','saw']).ok,true,'capacity and geometric fit remain separate');

const config={maxCarts:4,capacities:[4,6,10,12],modules:[
 {key:'arc',name:'电弧',size:1,price:1,sellValue:1},
 {key:'saw',name:'切割轮',size:2,price:1,sellValue:1},
 {key:'drone',name:'无人机舱',size:1,price:1,sellValue:1},
 {key:'boost',name:'助推器',size:1,price:1,sellValue:1},
]};
const train=createTrain(config);
assert.equal(train.merge('c1','c2'),true,'prepare a higher-capacity carrier');
const saw=train.snapshot().equipment.find(item=>item.key==='saw');
assert.equal(train.move(saw.id,'c1'),true);
assert.equal(train.buy('boost','c1'),true);
assert.equal(train.buy('boost','c1'),true);
assert.equal(train.snapshot().carriers.find(carrier=>carrier.id==='c1').used,4,'one saw plus two boosters uses four cells');
const issue=train.installationIssue('c1',2,'saw');
assert.match(issue,/只能安装1组切割轮/,'game installation API exposes the one-saw-per-car rule');
assert.equal(train.canInstall('c1',2,'saw'),false,'game installation gate blocks a second saw set');
assert.equal(train.snapshot().carriers.find(carrier=>carrier.id==='c1').capacity,10,'capacity progression was not changed');
assert.equal(train.buy('saw','c1'),true,'a purchased second saw remains recoverable in turnover');
const looseSaw=train.snapshot().equipment.find(item=>item.key==='saw'&&item.carrier===null);
const station=createStation({train,config,economy:{balance:()=>10,purchase:(_price,apply)=>apply(),credit:()=>{}}});
const rejected=station.dispatch({commandId:1,type:'move',id:looseSaw.id,to:'c1'});
assert.equal(rejected.ok,false);
assert.match(rejected.message,/只能安装1组切割轮/,'station status explains the one-saw-per-car rule');
console.log('PASS mount envelope fit: one saw set per car, legal small mix, independent capacity, arc/drone exclusions');
