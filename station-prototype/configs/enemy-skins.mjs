// 身体随地貌，功能器官保留对比；这里只登记候选图，不代表地形玩法区已实现。
const highRankModel=Object.freeze({id:'scorpion.highrank',width:51,height:51});

const highRankSkins=Object.freeze({
 wasteland:Object.freeze({
  model:highRankModel.id,
  terrainRole:'hill-candidate',source:'scorpion-highrank-wasteland-hill-v3-candidate.png',
  shell:'#8e8375',stinger:'#e4a63e',claw:'#e3a644',
 }),
 tundra:Object.freeze({
  model:highRankModel.id,
  terrainRole:'hill-candidate',
  source:'scorpion-highrank-tundra-v1-candidate.png',
  shell:'#354b68',stinger:'#ff9367',claw:'#f87752',
 }),
});

function luminance(hex){
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 return rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
}
for(const skin of Object.values(highRankSkins)){
 if((luminance(skin.stinger)+.05)/(luminance(skin.shell)+.05)<1.6)throw Error('HIGH_RANK_STINGER_CONTRAST_TOO_LOW');
}

export function highRankSkin(environmentId){
 const skin=highRankSkins[environmentId];
 if(!skin)throw Error(`UNDEFINED_HIGH_RANK_SKIN:${environmentId}`);
 return Object.freeze({model:highRankModel,...skin});
}
