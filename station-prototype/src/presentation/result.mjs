export function resultView(s){
 const won=s.phase==='won';
 return `<div class="station-screen"><header><h1>${won?'远征完成':'远征结束'}</h1><p>${won?'三段流程已走通':'整备列车，再次出发'}</p></header><section><h2>抵达 ${s.completed.length} / ${s.total} 段</h2><p>累计击败 ${s.kills} · 构筑等级 ${s.growth?.level||1}</p><p>本次区段奖励 ${s.rewardTotal} 能源</p><p>重新出发将重置本局装备、能源与强化。</p><small>Boss测试版：拦截战全程禁止冲刺，造型与数值待调优。</small></section><div class="operations"><button data-action="reset">重新远征 →</button></div></div>`;
}
