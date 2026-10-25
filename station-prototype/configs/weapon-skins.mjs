// Weapon appearance is presentation-only. Keep silhouette and gameplay stats separate.
const sawBasicModel=Object.freeze({box:'0 0 1254 1254',size:Object.freeze([1254,1254])});

const sawBasicSkins=Object.freeze({
 blue:Object.freeze({id:'blue',url:'assets/weapons/saw-basic-trainmat-v1-candidate.png'}),
 bluegloss:Object.freeze({id:'bluegloss',url:'assets/weapons/saw-basic-bluegloss-v1-candidate.png'}),
 clayred:Object.freeze({id:'clayred',url:'assets/weapons/saw-basic-clayred-v1-candidate.png'}),
 claygloss:Object.freeze({id:'claygloss',url:'assets/weapons/saw-basic-claygloss-v1-candidate.png'}),
});

export function sawBasicAppearance(skinId='blue'){
 const skin=sawBasicSkins[skinId];
 if(!skin)throw Error(`UNDEFINED_SAW_SKIN:${skinId}`);
 return {...sawBasicModel,...skin};
}
