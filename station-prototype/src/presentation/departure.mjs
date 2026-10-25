import {sprintConfig} from '../game/sprint.mjs?v=sprint-500-trial1';
import {sceneTravel,sceneSpeed,decelerationSeconds} from '../game/scene-distance.mjs?v=sprint-500-trial1';
import {bossTuning} from '../../configs/boss.mjs';
// 出站冲刺：站口同帧起跑，列车冲至屏幕顶部；减速后镜头追上并回中。
const smooth=t=>{const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10);};
export function departure(s){
 // offset为镜头路程减列车路程；同一offset应用于地表与实体。
 if(s.artVersion==='approved'){
  const speed=s.sprint.speedScene??sceneSpeed.sprint;
  const duration=s.sprint.distance/(s.sprint.speedMetres??sprintConfig.speed);
  const travel=sceneTravel(s.t,s.sprintStarts||[0],duration,s.sprintInterruptedAt,speed);
  // 300 SU/s 旧镜头为取景标尺；500 默认档更早冲顶，不偷改世界速度。
  const scale=300/speed,startFollow=2.3*scale,ramp=.5*scale,age=Math.max(0,s.t-startFollow);
  const following=age<ramp?speed*age*age/(2*ramp):speed*(age-ramp/2);
  const sprintEnd=Math.min(duration,s.sprintInterruptedAt??Infinity);
  const firstCamera=s.t<=sprintEnd?following:(()=>{
   const preAge=Math.max(0,sprintEnd-startFollow);
   const pre=preAge<ramp?speed*preAge*preAge/(2*ramp):speed*(preAge-ramp/2);
   const after=s.t-sprintEnd;
   if(speed>300){
    // 镜头比列车缓慢降速、自然追上车身；末速仍回到120 SU/s。
    const settle=decelerationSeconds+490/(speed-sceneSpeed.cruise);
    const p=Math.min(1,after/settle);
    return pre+sceneSpeed.cruise*after+(speed-sceneSpeed.cruise)*settle*(p-p**3+.5*p**4);
   }
   const coast=Math.min(after,decelerationSeconds),settle=Math.max(0,after-decelerationSeconds),tau=.76;
   return pre+speed*coast+sceneSpeed.cruise*settle+(speed-sceneSpeed.cruise)*tau*(1-Math.exp(-settle/tau));
  })();
  // 后续手动冲刺由镜头完全跟随：世界路程继续加速，但列车不再重复获得屏幕位移。
  const manualSprint=(s.sprintStarts||[0]).length>1;
  const rushOffset=manualSprint?0:640+firstCamera-travel;
  // Boss 打断冲刺后，镜头在入场时间内追上列车；不改世界行进距离。
  const offset=s.boss?rushOffset*(1-smooth((s.t-s.boss.startedAt)/bossTuning.entrySeconds)):rushOffset;
  return {offset,travel,phase:s.boss?'Boss战':s.invincible?'高速突围':'巡航'};
 }
 if(s.boss){
  const stamp=s.boss.startedAt,age=Math.max(0,s.t-stamp);
  const base=departure({...s,boss:null,t:stamp});
  const before=departure({...s,boss:null,t:Math.max(0,stamp-.001)});
  const speed=Math.max(0,(base.travel-before.travel)/.001);
  return {offset:base.offset*(1-smooth(age/1.5)),travel:base.travel+37.5*age+(speed-37.5)*1.5*(1-Math.exp(-age/1.5)),phase:age<1.5?'Boss拦截 · 减速':'Boss战'};
 }
 const starts=s.sprintStarts||[0],start=starts.at(-1),t=s.t-start;
 const duration=s.sprint.distance/sprintConfig.speed;
 const launch=start===0?.85:.45,settle=1.5,front=-105,origin=start===0?300:0;
 const offset=t<launch?origin+(front-origin)*smooth(t/launch):t<duration?front:front*(1-smooth((t-duration)/settle));
 // 连续积分的视觉路程，出站末段平滑减速，避免景物速度突变。
 const initialTime=s.t;
 const transition=Math.max(0,Math.min(settle,initialTime-duration));
 const x=transition/settle;
 const blendIntegral=settle*(2.5*x**4-3*x**5+x**6);
 let travel=initialTime<=duration?initialTime*150:duration*150+150*transition-112.5*blendIntegral+Math.max(0,initialTime-duration-settle)*37.5;
 const integral=x=>2.5*x**4-3*x**5+x**6;
 for(const stamp of starts.slice(1)){
  const age=Math.max(0,s.t-stamp),rise=.45;
  const a=Math.min(1,age/rise),fall=Math.max(0,Math.min(settle,age-duration));
  travel+=112.5*(rise*integral(a)+Math.max(0,Math.min(age,duration)-rise)+fall-settle*integral(fall/settle));
 }
 return {offset,travel,phase:t<launch?(start===0?'冲出整备站':'全速冲刺'):t<duration?'高速突围':t<duration+settle?'减速归中':''};
}
// 护栏固定在出站首屏下方，中央留出轨道通道；列车越过后淡出。
export function stationExitView(time){
 const opacity=1-smooth((time-.2)/.35);
 if(opacity<=0)return '';
 const posts=[32,93,157,263,326,388].map(x=>`<g transform="translate(${x},0)"><rect x="-5" y="-17" width="10" height="36" rx="2" fill="#5c594f" stroke="#343832" stroke-width="2"/><path d="M-3-7h6 M-3 9h6" stroke="#b3a184" stroke-width="2"/></g>`).join('');
 return `<g data-station-exit opacity="${opacity}"><path d="M15 805H405V950H15Z" fill="#908477" opacity=".14"/><path d="M15 820H164M256 820H405" stroke="#413e37" stroke-width="13" opacity=".18"/><g transform="translate(0,805)"><path d="M17-11H161M259-11H403M17 9H161M259 9H403" stroke="#393e3b" stroke-width="6" stroke-linecap="round"/><path d="M17-8H161M259-8H403" stroke="#988b71" stroke-width="2"/>${posts}</g></g>`;
}
export function roadside(distance){
 return Array.from({length:16},(_,i)=>{
  const near=i%2===0,x=i%4<2?22+(i%3)*29:326+(i%3)*24;
  const y=((i*119+distance*(near?2.8:.8))%820)-90;
  const debris=i%4===0?'<path d="M0 24V-17M0 4l-14-13M0-3l11-10M-4 18l-8 8"/>':i%4===1?'<path d="M-13 8l6-15 18 3 4 12-16 5Z M-8-4l11 13 M5-3l7 5"/>':i%4===2?'<path d="M-20 4l13-7 8 5 10-7 12 5 M1 2l-5 13-10 4 M1 2l12 9"/>':'<path d="M-10 24l5-33 11-3 M-5-9l14 5 M-12 18l16 4"/>';
  return `<g transform="translate(${x},${y})" stroke="${near?'#878477':'#b2afa1'}" stroke-width="${near?2.5:2}" fill="none" opacity="${near?.72:.5}">${debris}</g>`;
 }).join('');
}
