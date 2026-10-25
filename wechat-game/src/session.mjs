import {config,journeyStages} from '../../station-prototype/config.mjs';
import {createTrain} from '../../station-prototype/src/game/train.mjs';
import {createEconomy} from '../../station-prototype/src/game/economy.mjs';
import {createStation} from '../../station-prototype/src/game/station.mjs';
import {createBattle} from '../../station-prototype/src/game/battle.mjs';
import {createJourney} from '../../station-prototype/src/game/journey.mjs';
import {createArrival} from '../../station-prototype/src/game/arrival.mjs';

export function createSession(){
 let station,economy,journey,battle=null,arrival=null,seq=0,selected='c1',mergeFrom=null,confirm=null,message='',result=null;
 function reset(){station?.dispose();journey?.dispose();economy=createEconomy(config.cash);station=createStation({config,train:createTrain(config),economy});journey=createJourney({stages:journeyStages,credit:amount=>economy.credit(amount)});battle=null;arrival=null;seq=0;selected='c1';mergeFrom=null;confirm=null;message='';result=null;}
 reset();
 const send=command=>{const response=station.dispatch({...command,commandId:++seq});message=response.message;return response.ok;};
 const state=()=>({mode:result?'result':arrival?'arrival':battle?'battle':'station',station:station.snapshot(),journey:journey.snapshot(),battle:battle?.snapshot()??null,arrival:arrival?.snapshot()??null,selected,mergeFrom,confirm,message,result});
 function action(input){
  if(!input||!input.type)return false;
  if(result){if(input.type==='reset'){reset();return true;}return false;}
  if(arrival)return false;
  if(battle){
   if(input.type==='sprint')return battle.release();
   if(input.type==='choose'){const s=battle.snapshot();return battle.choose(input.id,s.upgradeId);}
   return false;
  }
  if(confirm){
   if(input.type==='cancel'){confirm=null;return true;}
   if(input.type==='confirm'){const pending=confirm;confirm=null;mergeFrom=null;return send(pending);}
   return false;
  }
  if(input.type==='selectCar'){selected=input.id;message='';return true;}
  if(input.type==='buyCart')return send({type:'buyCart'});
  if(input.type==='buyModule')return send({type:'buyModule',key:input.key,to:selected});
  if(input.type==='stash')return send({type:'move',id:input.id,to:null});
  if(input.type==='install')return send({type:'move',id:input.id,to:selected});
  if(input.type==='attachCart')return send({type:'attachCart',id:input.id});
  if(input.type==='sell'){confirm={type:'sell',id:input.id};return true;}
  if(input.type==='sellCart'){confirm={type:'sellCart',id:input.id};return true;}
  if(input.type==='mergeStart'){mergeFrom=input.id;message='再点一节同级车厢';return true;}
  if(input.type==='mergeWith'){
   const cars=[...station.snapshot().carriers,...station.snapshot().reserveCars];
   const from=cars.find(c=>c.id===mergeFrom),to=cars.find(c=>c.id===input.id);
   if(!from||!to||from.id===to.id||from.level!==to.level||from.level===0||from.level>=3){message='只能合成两节不同的同级车厢';return false;}
   confirm={type:'merge',a:from.id,b:to.id};return true;
  }
  if(input.type==='depart'){
   if(!send({type:'depart'}))return false;
   if(!journey.depart())return false;
   const j=journey.snapshot();battle=createBattle(station.snapshot(),1,{routeLength:j.route.distance,growth:j.growth,boss:j.route.boss,elite:j.stage===2,creditLoot:amount=>economy.credit(amount)});
   return true;
  }
  return false;
 }
 function step(dt){
  if(arrival){arrival.step(dt);if(arrival.snapshot().done){arrival=null;journey.arrive();send({type:'returnStation'});message='到站修复完成，强化保留';}return;}
  if(!battle||!Number.isFinite(dt)||dt<=0)return;
  battle.step(dt);const end=battle.snapshot();
  if(end.done){journey.finish(end);const phase=journey.snapshot().phase;if(phase==='arrival')arrival=createArrival(end.cars);else result={win:phase==='won',kills:journey.snapshot().kills};battle=null;}
 }
 return {state,action,step,reset};
}
