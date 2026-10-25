// 时间遭遇测试配置；不以里程补怪，保留冲刺的策略收益。
export const waveConfig=Object.freeze({departure:2,warning:2,assault:14,respite:6,interval:.42,groundFlyingChance:.1,mixedFlyingChance:.45});
for(const key of ['departure','warning','assault','respite','interval'])if(!Number.isFinite(waveConfig[key])||waveConfig[key]<=0)throw Error('Invalid wave duration');
for(const key of ['groundFlyingChance','mixedFlyingChance'])if(waveConfig[key]<0||waveConfig[key]>1)throw Error('Invalid wave probability');
export function waveAt(seconds){
 if(!Number.isFinite(seconds)||seconds<0)throw Error('Invalid wave time');
 if(seconds<waveConfig.departure)return {number:0,phase:'departure',label:'冲出包围',remaining:waveConfig.departure-seconds,progress:seconds/waveConfig.departure};
 const length=waveConfig.warning+waveConfig.assault+waveConfig.respite,age=seconds-waveConfig.departure;
 const number=Math.floor(age/length)+1,local=age%length,mixed=number%2===0;
 const phase=local<waveConfig.warning?'warning':local<waveConfig.warning+waveConfig.assault?'assault':'respite';
 const start=phase==='warning'?0:phase==='assault'?waveConfig.warning:waveConfig.warning+waveConfig.assault;
 const duration=waveConfig[phase];
 return {number,phase,label:mixed?'空地混编':'地面围攻',remaining:duration-(local-start),progress:(local-start)/duration,interval:waveConfig.interval,flyingChance:mixed?waveConfig.mixedFlyingChance:waveConfig.groundFlyingChance};
}
