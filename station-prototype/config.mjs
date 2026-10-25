// 本轮站内交互夹具，不代表正式装备平衡与开局经济。
export const lootConfig=Object.freeze({scrapPerKill:1}); // 掉落体验测试值，非正式经济。
export const journeyStages=Object.freeze([
  {distance:1800,reward:48,environmentId:'wasteland'},{distance:1800,reward:48,environmentId:'wasteland'},{distance:900,reward:0,boss:true,environmentId:'wasteland'}
]);
export const repulsorTrialConfig=Object.freeze({fieldRadius:56,releaseDistance:34,releaseSeconds:.22,interval:.58,effectLife:.52});
export const config = Object.freeze({cash:90,cartPrice:30,capacities:[0,4,6,8],maxCarts:4,
  cartSellValues:[0,12,24,48],
  modules:[{key:'saw',name:'切割轮',size:2,price:20,sellValue:8,icon:'◉'},
    {key:'arc',name:'电弧线圈',size:1,price:12,sellValue:4,icon:'ϟ'},
    {key:'drone',name:'无人机舱',size:1,price:32,sellValue:12,icon:'✣'},
    {key:'boost',name:'动力助推器',size:1,price:20,sellValue:8,icon:'↑'},
    // K1A隔离试演装备：进入统一装配链，但暂不进入普通商店和正式平衡。
    {key:'repulsor',name:'拒止器',size:1,price:0,sellValue:0,icon:'⊙',trialOnly:true}]});
