// 遭遇进度由实际出怪波次和精英/Boss状态推动，不按行进里程提前跳格。
export function waveView(s){
 const stage=s.journey?.stage||1;
 const current=s.boss?4:stage===1?(s.wave?.number>=2?1:0):stage===2?(!s.elite||s.elite.status==='active'?2:3):3;
 const labels=['小怪','小怪','精英','小怪','BOSS·持铁者'];
 return `<div role="list" aria-label="远征遭遇路线" data-encounter-route="${current}" class="encounter-route">${labels.map((label,i)=>{
  const active=i===current,passed=i<current;
  return `${i?'<span class="route-link" aria-hidden="true"></span>':''}<span role="listitem" data-route-node="${i}" ${active?'aria-current="step"':''} aria-label="${label}，${active?'当前':passed?'已通过':'待遭遇'}" class="route-node ${active?'current':passed?'passed':'upcoming'}">${passed?'✓ ':active?'› ':''}${label}</span>`;
 }).join('')}</div>`;
}
