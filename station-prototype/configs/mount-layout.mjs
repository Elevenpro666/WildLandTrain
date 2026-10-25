import {vehicleBodyWidth} from './vehicle-geometry.mjs';

// 候选四格原画上的可见中心；B 为战斗画面单位。只服务试演绘制，不改变装配容量。
export const platformPads=Object.freeze({
 head:Object.freeze([[-10,-24],[10,-24],[-10,-5],[10,-5]]),
 car:Object.freeze([[-10,16.5],[10,16.5],[-10,35.5],[10,35.5]]),
 carL1:Object.freeze([[-10,16.5],[10,16.5],[-10,35.5],[10,35.5]]),
 carL2:Object.freeze([[-10,7],[10,7],[-10,26],[10,26],[-10,45],[10,45]]),
 carL3:Object.freeze([[-10,-2.5],[10,-2.5],[-10,16.5],[10,16.5],[-10,35.5],[10,35.5],[-10,54.5],[10,54.5]]),
});;
// P 试演改为边梁前后两组实体侧座；避开轮面，喷流在车体外侧纵向通过。
export const propulsionSlots=Object.freeze({
 1:[[-1,62]],
 2:[[-1,62],[1,62]],
 3:[[-1,-5],[-1,62],[1,62]],
 4:[[-1,-5],[1,-5],[-1,62],[1,62]],
});
// 分层侧梁挂点V1只供玩家预览：每个车厢各自保留四个P安装位。
// 助推器短舱贴合车体前/后端外缘；上层支架与切割轮层分开，但暂不宣称正式物理门禁通过。
export const boostLayerTrialMount=Object.freeze({
 width:15,height:12,centerOffset:vehicleBodyWidth/2-8,rootOffset:vehicleBodyWidth/2-2,frontY:-12,rearY:62,
 slots:Object.freeze({
  1:Object.freeze([[1,62]]),
  2:Object.freeze([[-1,62],[1,62]]),
  3:Object.freeze([[-1,-12],[1,-12],[-1,62]]),
  4:Object.freeze([[-1,-12],[1,-12],[-1,62],[1,62]]),
 }),
});
// 390×844 基准视口的静态显示包络（B），不是装备容量或伤害判定。
// 车厢四格T的中心距是横20/纵23；P设备必须部分压在74 B车体内。
export const mountDisplayEnvelope=Object.freeze({
 repulsor:Object.freeze({width:18,height:18}),
 drone:Object.freeze({spriteWidth:15,baseWidth:18,baseHeight:20}),
 booster:Object.freeze({centerOffset:vehicleBodyWidth/2-1,rootOffset:vehicleBodyWidth/2-10,width:17,height:19}),
})

// 最大工作包络（战斗画面单位 B）。只用于实体相交检查；攻击射程不等于实体占位。
export const mountWorkEnvelope=Object.freeze({
 saw:Object.freeze({maxCenterX:(25+(70-25)/2)+20,radius:(70-25)/2,railRootX:25,railStartInset:4,railEndInset:5,railStrokeWidth:5,railCenterlineOffset:6,centerY:25,twoSawCenterY:Object.freeze([3,47])}),
 boosterCenterX:mountDisplayEnvelope.booster.centerOffset,
 booster:Object.freeze({halfWidth:mountDisplayEnvelope.booster.width/2,halfHeight:mountDisplayEnvelope.booster.height/2}),
});
// 尾排推进试演：从左右外侧依次向内占位，所有位置均属于本车厢。
export const rearBankBooster=Object.freeze({
 slots:Object.freeze([[-27,55.5],[27,55.5],[-9,55.5],[9,55.5]].map(Object.freeze)),
 width:15,height:12,
});
