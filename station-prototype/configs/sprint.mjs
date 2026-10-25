// 所有距离为玩法米或场景 SU；调整队形前须保持「行数×行距」落在 rangeY 内。
const standard=Object.freeze({
 id:'standard',speedSu:300,
 formation:Object.freeze({count:10,rangeY:Object.freeze({min:25,max:175}),leadInsetSu:15,rowSpacingSu:32,laneSpacingSu:75,staggerSu:6,longitudinalJitterSu:0}),
});
const impact500=Object.freeze({
 id:'impact500',speedSu:500,
 formation:Object.freeze({count:26,rangeY:Object.freeze({min:-770,max:210}),leadInsetSu:30,rowSpacingSu:75,laneSpacingSu:75,staggerSu:20,longitudinalJitterSu:22}),
});
const baseDistanceByHeadQuality=Object.freeze([300,420,540]);
const boosterDistance=120;
const sceneUnitsPerMetre=3.2;
export const sprintConfig=Object.freeze({
 sceneUnitsPerMetre,cruiseSpeedSu:120,decelerationSeconds:1.2,chargeSeconds:8,
 defaultProfileId:'impact500',
 baseDistanceByHeadQuality,boosterDistance,
 // 兼容现有站内展示和测试，别名引用同一份配置。
 baseDistance:baseDistanceByHeadQuality,boostDistance:boosterDistance,
 speed:impact500.speedSu/sceneUnitsPerMetre,
 profiles:Object.freeze({standard,impact500}),
});

function positive(value,name){if(!Number.isFinite(value)||value<=0)throw new RangeError(`Invalid sprint ${name}`);}
for(const value of baseDistanceByHeadQuality)positive(value,'head quality distance');
positive(boosterDistance,'booster distance');
positive(sprintConfig.sceneUnitsPerMetre,'scene unit mapping');
positive(sprintConfig.chargeSeconds,'charge seconds');
positive(sprintConfig.decelerationSeconds,'deceleration seconds');
for(const profile of Object.values(sprintConfig.profiles)){
 positive(profile.speedSu,'speed');
 if(profile.speedSu<=sprintConfig.cruiseSpeedSu)throw new RangeError('Sprint speed must exceed cruise speed');
 const f=profile.formation;
 if(!Number.isInteger(f.count)||f.count<1||f.count>60)throw new RangeError('Invalid departure enemy count');
 for(const [name,value] of Object.entries({minY:f.rangeY.min,maxY:f.rangeY.max,leadInsetSu:f.leadInsetSu,rowSpacingSu:f.rowSpacingSu,laneSpacingSu:f.laneSpacingSu,staggerSu:f.staggerSu,longitudinalJitterSu:f.longitudinalJitterSu})){
  if(!Number.isFinite(value))throw new RangeError(`Invalid formation ${name}`);
 }
 if(f.rangeY.min>=f.rangeY.max||f.leadInsetSu<0||f.rowSpacingSu<=0||f.laneSpacingSu<=0||f.staggerSu<0||f.longitudinalJitterSu<0||f.longitudinalJitterSu*2>=f.rowSpacingSu)throw new RangeError('Invalid departure formation');
 const near=f.rangeY.max-f.leadInsetSu,far=near-(Math.ceil(f.count/2)-1)*f.rowSpacingSu;
 if(far-f.longitudinalJitterSu<f.rangeY.min||near+f.longitudinalJitterSu>f.rangeY.max||f.laneSpacingSu/2+f.staggerSu>=78)throw new RangeError('Departure formation exceeds range or collision lane');
}
export function getSprintProfile(id=sprintConfig.defaultProfileId){
 const profile=sprintConfig.profiles[id];
 if(!profile)throw new RangeError(`Unknown sprint profile: ${id}`);
 return profile;
}
