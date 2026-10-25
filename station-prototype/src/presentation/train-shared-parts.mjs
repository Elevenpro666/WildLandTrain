import {assetUrl} from './art-asset-registry.mjs?rev=c02ad52a83438f4d';

const source={url:assetUrl('train.head.platform'),width:1715,height:917};
const slotCrop=[456,387,94,101];
const wheelCrops={left:[352,478,84,140],right:[675,478,84,140]};

function croppedPart({crop,x,y,width,height,attributes=''}){
 return `<svg ${attributes} x="${x-width/2}" y="${y-height/2}" width="${width}" height="${height}" viewBox="${crop.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${source.url}" width="${source.width}" height="${source.height}"/></svg>`;
}

// 直接复用车头平台图中的真实接口，不再用近似色块仿画。
export function headDeckSlot(x,y,attributes=''){
 return croppedPart({crop:slotCrop,x,y,width:16,height:16,attributes:`data-t-slot-resource="train.head.platform" ${attributes}`});
}

// 车厢轮组使用车头同一张图里的左右轮面，保留方向差异。
export function headStyleWheel(x,y,side,attributes=''){
 return croppedPart({crop:wheelCrops[side<0?'left':'right'],x,y,width:11,height:19,attributes:`data-wheel-resource="train.head.platform" data-wheel-side="${side<0?'left':'right'}" ${attributes}`});
}
