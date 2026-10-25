import {config,journeyStages} from '../../config.mjs?rev=repulsor-chain3';
import {createTrain} from '../game/train.mjs?rev=1b649ab13b7f1d22';
import {createEconomy} from '../game/economy.mjs';
import {createStation} from '../game/station.mjs?v=repulsor-tslot1';
import {view} from '../presentation/view.mjs?rev=b983591d4fa78f7e';
import {mount} from '../adapters/browser.mjs?v=drag-fix-2';
import {createBattle} from '../game/battle.mjs?rev=5d7b2884e8ad33ce';
import {battleView} from '../presentation/battle.mjs?rev=792d87380ea15d35';
import {createArrival} from '../game/arrival.mjs';
import {createJourney} from '../game/journey.mjs';
import {resultView} from '../presentation/result.mjs?v=station-unified1';
let battle=null;
let arrival=null;
let quality=1;
let game,journey,economy,seq=0,ui;
function prepareBoostRocketTrial(){
 const existing=game.snapshot().equipment.filter(item=>item.carrier==='c2');
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('助推视觉试演准备失败：无法清空测试车厢');}
 for(let i=0;i<4;i++){const result=game.dispatch({type:'buyModule',key:'boost',to:'c2',commandId:++seq});if(!result.ok)throw new Error('助推视觉试演准备失败：无法安装四个助推器');}
}
function prepareArcCountCompareTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('电弧外观对照准备失败：无法清理其他攻击装置');}
 for(let i=0;i<2;i++){const result=game.dispatch({type:'buyModule',key:'arc',to:'c1',commandId:++seq});if(!result.ok)throw new Error('电弧外观对照准备失败：无法安装两件电弧');}
}
function prepareSawBoostMixTrial(){
 const existing=game.snapshot().equipment.filter(item=>item.carrier==='c1');
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('刀盘与助推混装试演准备失败：无法清理测试车厢');}
 for(const key of ['saw','boost','boost']){const result=game.dispatch({type:'buyModule',key,to:'c1',commandId:++seq});if(!result.ok)throw new Error('刀盘与助推混装试演准备失败：同厢安装失败');}
}
function prepareDroneBoostMixTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('无人机与助推混装试演准备失败：无法清理测试装配');}
 for(const key of ['drone','boost']){const result=game.dispatch({type:'buyModule',key,to:'c1',commandId:++seq});if(!result.ok)throw new Error('无人机与助推混装试演准备失败：同厢安装失败');}
}
function prepareArcDroneMixTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('电弧与无人机混装试演准备失败：无法清理测试装配');}
 for(const key of ['arc','drone']){const result=game.dispatch({type:'buyModule',key,to:'c1',commandId:++seq});if(!result.ok)throw new Error('电弧与无人机混装试演准备失败：同厢安装失败');}
}

function prepareArcBoostMixTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('电弧与助推器混装试演准备失败：无法清理测试装配');}
 for(const key of ['arc','boost','boost','boost']){const result=game.dispatch({type:'buyModule',key,to:'c1',commandId:++seq});if(!result.ok)throw new Error('电弧与助推器混装试演准备失败：同厢安装失败');}
}
function prepareSawArcBoostMixTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('三类武器混装试演准备失败：无法清理测试装配');}
 for(const key of ['saw','arc','boost']){const result=game.dispatch({type:'buyModule',key,to:'c1',commandId:++seq});if(!result.ok)throw new Error('三类武器混装试演准备失败：同厢安装失败');}
}
function prepareBoostLayerTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('分层P区挂点试演准备失败：无法清理原装备');}
 economy.credit(50); // 仅本试演补足样例装配费用，不改普通开局经济。
 for(const key of ['saw','boost','boost']){const result=game.dispatch({type:'buyModule',key,to:'c1',commandId:++seq});if(!result.ok)throw new Error('分层P区挂点试演准备失败：第一节车厢装配未完成');}
 for(let i=0;i<4;i++){const result=game.dispatch({type:'buyModule',key:'boost',to:'c2',commandId:++seq});if(!result.ok)throw new Error('分层P区挂点试演准备失败：第二节车厢装配未完成');}
}
function prepareRepulsorTSlotTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('拒止器T面试演准备失败：无法清空测试车厢');}
 const result=game.dispatch({type:'buyModule',key:'repulsor',to:'c1',commandId:++seq});
 if(!result.ok)throw new Error('拒止器T面试演准备失败：无法安装单槽拒止器');
}
function prepareRepulsorChainTrial(){
 const existing=game.snapshot().equipment;
 for(const item of existing){const result=game.dispatch({type:'discard',id:item.id,commandId:++seq});if(!result.ok)throw new Error('拒止传导试演准备失败：无法清空测试装配');}
 for(const carrier of ['c1','c2']){const result=game.dispatch({type:'buyModule',key:'repulsor',to:carrier,commandId:++seq});if(!result.ok)throw new Error('拒止传导试演准备失败：相邻车厢拒止器安装失败');}
}

function reset(){
 game?.dispose();journey?.dispose();battle=null;arrival=null;quality=1;economy=createEconomy(config.cash);game=createStation({config,train:createTrain(config),economy});journey=createJourney({stages:journeyStages,credit:v=>economy.credit(v)});seq=0;
 const trial=new URLSearchParams(location.search).get('weaponTrial');
 if(trial==='boostRocket')prepareBoostRocketTrial();
 if(trial==='arcCountCompare')prepareArcCountCompareTrial();
 if(trial==='boostLayerTrial')prepareBoostLayerTrial();
 if(trial==='sawBoostMix')prepareSawBoostMixTrial();
 if(trial==='droneBoostMix')prepareDroneBoostMixTrial();
 if(trial==='arcDroneMix')prepareArcDroneMixTrial();
 if(trial==='arcBoostMix')prepareArcBoostMixTrial();
 if(trial==='sawArcBoostMix')prepareSawArcBoostMixTrial();
 if(trial==='repulsorTSlot')prepareRepulsorTSlotTrial();
 if(trial==='repulsorChain')prepareRepulsorChainTrial();
const message=trial==='repulsorTSlot'?'K1A拒止器试演：第一节车厢安装1件单槽T面拒止器；贴近地面单位会被推离，不造成伤害。普通商店暂不出售。':trial==='boostLayerTrial'?'每厢P区分层挂点试演：c1装1刀盘＋2助推，c2装4助推；每件仍占本厢容量，短助推器嵌入车厢侧缘安装板并贴合车体；仅为外观候选，冲刺规则不变。':trial==='sawLinked'?'横向往复刀盘试演：出发后预置加长支架与横向往复；普通入口不受影响。':trial==='sawRate'?'高速传动部件试演：仅本试演预置强化齿刃与高速传动，驱动轴承装在每个刀盘轮心；普通入口不受影响。':trial==='sawBoostMix'?'同厢混装试演：一件刀盘＋两件短火箭助推；横向往复与冲刺喷焰在同一车厢运行，普通开局不受影响。':trial==='droneBoostMix'?'同厢混装试演：一座无人机舱＋一件短火箭助推，各占1个接口；两架无人机起飞，喷口同时运行，普通开局不受影响。':trial==='sawArcBoostMix'?'三类武器同厢试演：一件切割轮跨接一整排2个接口，电弧与助推器各占1个接口；分别保留攻击、横移与喷焰表现，普通开局不受影响。':trial==='arcDroneMix'?'T区主武器混装试演：一件高压电弧＋一座无人机舱，各占1个接口；显示单线放电与双机巡航，普通开局不受影响。':trial==='arcBoostMix'?'同厢满载试演：一件高压电弧＋三件短火箭助推，占满4个接口；观察T区主武器与车尾助推阵列是否互相遮挡，普通开局不受影响。':trial==='arcDamage'?'高压绕组视觉试演：出发后预置高压状态；普通入口不受影响。':trial==='arcPulse'?'双脉冲视觉试演：同一炮口间隔0.15秒二次放电；普通入口不受影响。':trial==='arcCount'?'正俯视多级传导试演：每个电弧逐件占用一个T位；连锁规则不变。':trial==='arcCountCompare'?'独立双电弧对照：左基础件单线传导、最多3个目标；右强化件从命中点逐级分叉、最多5个目标，实际攻击只来自这两件装置。':trial==='arcReach'?'延伸电弧试演：出发后预置传导端强化；普通入口不受影响。':trial==='droneDamage'?'机载电极强化试演：升级部件装在飞行无人机上；普通入口不受影响。':trial==='droneFocus'?'双翼扫描锁定试演：侧翼扫描回路跟随模拟时间运行，锁定线指向最高耐久目标；普通入口不受影响。':trial==='droneFocusPair'?'双机编队试演：两架无人机可继续锁定同一目标，但飞行位置保持左右分开；普通入口不受影响。':trial==='droneCount'?'扩编机组试演：同一无人机舱出动两架无人机，实际巡航与分散索敌；普通入口不受影响。':trial==='dronePatrol'?'协同巡防试演：预置双机与雷达巡防，实际扩大巡航并分散索敌；普通入口不受影响。':trial==='boostRocket'?'助推喷口视觉试演：仅本试演将第二节测试车厢替换为4件助推器（试演能源支出80）；外观由链接切换，现行冲刺规则不变，普通开局不受影响。':'三段远征流程测试：保留当前起手装备与冲刺体验.';
ui={artVersion:new URLSearchParams(location.search).get('art')==='approved'?'approved':'legacy',platformArtCandidate:new URLSearchParams(location.search).get('platformArt')==='carV1',target:trial==='boostRocket'?'c2':'c1',message};
 if(trial==='repulsorTSlot')ui.message='基础拒止器试演：第一节车厢安装1件单槽拒止器，只保护本节车厢；贴近地面单位会被推离，不造成伤害。';
 if(trial==='repulsorChain')ui.message='拒止传导试演：相邻两节车厢各安装1件拒止器，并预置相邻传导升级；能量从核心沿车厢边缘接力形成连续拒止环。';
}
reset();
function submit(cmd){const r=game.dispatch({...cmd,commandId:++seq});ui.message=r.message;}
function tick(dt){
 if(arrival){
  arrival.step(dt);
  if(arrival.snapshot().done){arrival=null;journey.arrive();submit({type:'returnStation'});ui.message='安全到站，已免费修复；区段奖励 +48，强化保留。';adapter.draw();}
  return true;
 }
 if(!battle)return false;
 battle.step(dt);
 const s=battle.snapshot();
 if(s.done){journey.finish(s);if(journey.snapshot().phase==='arrival')arrival=createArrival(s.cars);battle=null;adapter.draw();}
 return true;
}
const adapter=mount(()=>['won','lost'].includes(journey.snapshot().phase)?resultView(journey.snapshot()):arrival?view(game.snapshot(),{...ui,journey:journey.snapshot(),arrivalProgress:arrival.snapshot().progress,message:'列车正在靠站，停稳后即可整备…'}):battle?battleView({...battle.snapshot(),cash:game.snapshot().cash,journey:journey.snapshot(),arcCountArtComparison:new URLSearchParams(location.search).get('weaponTrial')==='arcCountCompare',artVersion:new URLSearchParams(location.search).get('art')==='approved'?'approved':'legacy',platformArtCandidate:new URLSearchParams(location.search).get('platformArt')==='carV1',mountTrialCandidate:new URLSearchParams(location.search).get('mountTrial')==='fit2'||new URLSearchParams(location.search).get('platformArt')==='carV1',rearBankCandidate:new URLSearchParams(location.search).get('mountTrial')==='rearBank',boostLayerCandidate:new URLSearchParams(location.search).get('mountTrial')==='boostLayer1',boostArtTrial:['base','enhanced','rocket'].includes(new URLSearchParams(location.search).get('boostArt'))?new URLSearchParams(location.search).get('boostArt'):'base',mountArtTier:new URLSearchParams(location.search).get('mountArtTier')==='advanced'?'advanced':'basic',weaponSkinId:['clayred','claygloss','bluegloss'].includes(new URLSearchParams(location.search).get('weaponSkin'))?new URLSearchParams(location.search).get('weaponSkin'):'blue',enemyArtCandidate:['candidate','generated','highrank','bone'].includes(new URLSearchParams(location.search).get('enemyArt')),enemyArtVariant:new URLSearchParams(location.search).get('enemyArt')}):view(game.snapshot(),{...ui,journey:journey.snapshot()}),a=>{
 if(['won','lost'].includes(journey.snapshot().phase)){if(a.action==='reset'){reset();adapter.draw();}return;}
 if(arrival)return;
 if(a.action==='chooseUpgrade'){battle?.choose(a.id,Number(a.offer));adapter.draw();return;}
 if(battle?.snapshot().choices.length&&a.action!=='returnStation')return;
 if(a.action==='dropCart'){
  if(battle||ui.confirm||ui.inspected||ui.inspectedCart||ui.merge)return;
  const s=game.snapshot(),cars=[...s.carriers,...s.reserveCars];
  const from=cars.find(c=>c.id===a.id),to=cars.find(c=>c.id===a.to);
  if(!from||!to||from.id===to.id||from.level===0||from.level!==to.level||from.level>=config.capacities.length-1){ui.message='拖到另一节同级车厢可合成，车头与满级车厢不可合成。';adapter.draw();return;}
  ui.confirm={type:'merge',a:from.id,b:to.id,text:`两节 Lv.${from.level} 合成为 Lv.${from.level+1}，容量 ${config.capacities[from.level+1]}；原装备进入周转区，由你重新装配。`};
  adapter.draw();return;
 }
 if(a.action==='dragHover'||a.action==='dropEquipment'){
  if(battle||ui.confirm||ui.inspected||ui.inspectedCart||ui.merge)return;
  if(a.action==='dragHover'){ui.target=a.id;}
  else if(!a.valid){ui.message='放置无效，装备已回原位';}
  else submit({type:a.key?'buyModule':'move',key:a.key,id:a.id,to:a.to||null});
  adapter.draw();return;
 }
 if(a.action==='sprint'){battle?.release();adapter.draw();return;}
 if(a.action==='quality'&&!ui.confirm&&!battle){quality=quality%3+1;ui.quality=quality;adapter.draw();return;}
 if(a.action==='pauseBattle'){battle?.toggle();adapter.draw();return;}
 if(a.action==='returnStation'){battle=null;journey.debugReturn();submit({type:'returnStation'});ui.message='测试返回：未完成本段，不发奖励，不保留本段新强化。';adapter.draw();return;}
 if(ui.confirm&&a.action!=='confirm'&&a.action!=='cancel')return;
 if(a.action==='inspect'&&!battle){ui.inspected=a.id;adapter.draw();return;}
 if(a.action==='inspectCart'&&!battle){ui.inspectedCart=a.id;adapter.draw();return;}
 if(a.action==='closeItem'){ui.inspected=null;ui.inspectedCart=null;adapter.draw();return;}
 if(ui.inspectedCart&&!['attachCart','detachCart','sellCart','discardCart','mergePair','confirm','cancel'].includes(a.action))return;
 if(a.action==='mergePair'){const s=game.snapshot(),c=[...s.carriers,...s.reserveCars].find(c=>c.id===a.id);if(c)ui.confirm={type:'merge',a:a.id,b:a.to,text:`合成为 Lv.${c.level+1}，容量 ${config.capacities[c.level+1]}；参与车厢的装备移入周转，由你重新装配。`};adapter.draw();return;}
 if(a.action==='sellCart'||a.action==='discardCart'){const s=game.snapshot(),c=[...s.carriers,...s.reserveCars].find(c=>c.id===a.id);if(c)ui.confirm={type:a.action,id:a.id,text:`${c.name}：${a.action==='sellCart'?'出售返还 '+s.cartSellValues[c.level]+' 能源':'丢弃不返还'}。原装备保留在周转区，是否确认？`};adapter.draw();return;}
 if(ui.inspected&&!['move','sell','discard','confirm','cancel'].includes(a.action))return;
 if(a.action==='page'&&!battle){if(['equippedPage','turnoverPage'].includes(a.key))ui[a.key]=Math.max(0,Number(a.page)||0);adapter.draw();return;}
 if(a.action==='reset')reset();
 else if(a.action==='cancel')ui.confirm=null;
 else if(a.action==='confirm'){submit(ui.confirm);ui.confirm=null;ui.merge=null;}
 else if(a.action==='select'){
  if(ui.merge){const s=game.snapshot(),x=s.carriers.find(c=>c.id===ui.merge),y=s.carriers.find(c=>c.id===a.id);
   if(x&&y&&x.id!==y.id&&x.level>0&&x.level===y.level&&x.level<3)ui.confirm={type:'merge',a:x.id,b:y.id,text:`两节 Lv.${x.level} 合成 Lv.${x.level+1}，新容量 ${config.capacities[x.level+1]}。原两节的全部装备移至周转区，由你重新分配，不会自动丢弃。`};
   else ui.message='请选择另一节同阶车厢，车头不可合成。';
  } else {if(ui.target===a.id&&a.id!=='head')ui.inspectedCart=a.id;ui.target=a.id;ui.equippedPage=0;}
 } else if(a.action==='mergeSelect')ui.merge=ui.merge?null:ui.target;
 else if(a.action==='sell'||a.action==='discard'){const e=game.snapshot().equipment.find(e=>e.id===a.id);if(e)ui.confirm={type:a.action,id:a.id,text:`${e.name}，占用 ${e.size}。${a.action==='sell'?'出售返还 '+e.sellValue+' 能源':'丢弃不返还资源'}。是否确认？`};}
 else submit({type:a.action,id:a.id,to:a.to||null,key:a.key});
 if(['move','confirm'].includes(a.action))ui.inspected=null;
 if(['attachCart','detachCart','confirm'].includes(a.action))ui.inspectedCart=null;
 if(game.snapshot().mode==='ready'&&!battle&&journey.depart()){
  const j=journey.snapshot(),trial=new URLSearchParams(location.search).get('weaponTrial');
  const trialUpgrade=trial==='repulsorChain'?{repulsorChain:1}:trial==='arcBoostMix'?{arcDamage:1}:trial==='arcDroneMix'?{arcDamage:1,droneCount:1}:trial==='sawArcBoostMix'?{sawReach:1,sawLinked:1,arcDamage:1}:trial==='boostLayerTrial'||trial==='sawLinked'||trial==='sawBoostMix'?{sawReach:1,sawLinked:1}:trial==='sawRate'?{sawDamage:1,sawRate:1}:trial==='arcDamage'?{arcDamage:1}:trial==='arcPulse'?{arcDamage:1,arcPulse:1}:trial==='arcCount'||trial==='arcCountCompare'?{arcReach:1,arcCount:1}:trial==='arcReach'?{arcReach:1}:trial==='droneDamage'?{droneDamage:1}:trial==='droneFocus'?{droneDamage:1,droneFocus:1}:trial==='droneFocusPair'?{droneCount:1,droneDamage:1,droneFocus:1}:trial==='droneCount'?{droneCount:1}:trial==='dronePatrol'?{droneCount:1,dronePatrol:1}:trial==='droneBoostMix'?{droneCount:1}:null;
  const growth=trialUpgrade?{...j.growth,upgrades:{...j.growth?.upgrades,...trialUpgrade}}:j.growth;
  battle=createBattle(game.snapshot(),quality,{routeLength:j.route.distance,growth,boss:j.route.boss,elite:j.stage===2,sprintProfileId:new URLSearchParams(location.search).get('speedTrial')==='300'?'standard':undefined,arcCountCompare:trial==='arcCountCompare',compactL3MountTrial:new URLSearchParams(location.search).get('mountTrial')==='compactL3',creditLoot:amount=>economy.credit(amount)});
 }
 adapter.draw();
},tick);
window.render_game_to_text=()=>JSON.stringify({...(['won','lost'].includes(journey.snapshot().phase)?{mode:'result'}:arrival?arrival.snapshot():battle?battle.snapshot():{...game.snapshot(),selected:ui.target,message:ui.message,confirmation:ui.confirm||null,coordinate:'DOM responsive portrait; train head on right at station'}),journey:journey.snapshot()});
window.advanceTime=ms=>{if(Number.isFinite(ms)&&ms>0)for(let n=0;n<Math.ceil(ms/16.667);n++)tick(1/60);adapter.draw();};
window.addEventListener('pagehide',()=>{adapter.stop();game.dispose();journey.dispose();},{once:true});
adapter.draw();
