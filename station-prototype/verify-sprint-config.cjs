const assert=require('node:assert/strict');

(async()=>{
 const [{sprintConfig,getSprintProfile},{departurePositions},{createSprint}]=await Promise.all([
  import('./configs/sprint.mjs'),import('./src/game/departure-formation.mjs'),import('./src/game/sprint.mjs'),
 ]);
 assert.equal(getSprintProfile('standard').speedSu,300);
 assert.equal(getSprintProfile('impact500').speedSu,500);
 assert.equal(getSprintProfile().id,'impact500');
 assert.equal(createSprint().snapshot().speedScene,500);
 assert.throws(()=>getSprintProfile('unknown'),RangeError);
 for(const [quality,distance] of [[1,300],[2,420],[3,540]]){
  assert.equal(createSprint(quality,0,300).snapshot().distance,distance);
  assert.equal(createSprint(quality,0,500).snapshot().distance,distance);
  assert.equal(createSprint(quality,1,500).snapshot().distance,distance+120);
 }
 const formation=getSprintProfile('impact500').formation;
 const base=departurePositions(formation);
 assert.equal(base.length,26);
 assert.ok(Math.max(...base.map(p=>p[1]))-Math.min(...base.map(p=>p[1]))>880);
 assert.ok(new Set(base.map(p=>Math.round(p[1]))).size>20,'the creatures should not form identical pairs');
 const fewer=departurePositions({...formation,count:10});
 assert.equal(fewer.length,10);
 const spread=departurePositions({...formation,rowSpacingSu:76});
 assert.ok(Math.min(...spread.map(p=>p[1]))<Math.min(...base.map(p=>p[1])));
 assert.throws(()=>departurePositions({...formation,rowSpacingSu:90}),RangeError);
 assert.throws(()=>departurePositions({...formation,rangeY:{min:0,max:175}}),RangeError);
 assert.equal(sprintConfig.chargeSeconds,8);
 console.log('PASS sprint profiles, quality distances, booster, independent formation controls and bounds');
})().catch(error=>{console.error(error);process.exitCode=1;});
