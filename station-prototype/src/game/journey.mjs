export function createJourney({stages,credit}) {
  if(!Array.isArray(stages)||stages.length!==3||stages.some(s=>!Number.isFinite(s.distance)||s.distance<=0||!Number.isInteger(s.reward)||s.reward<0))throw Error('Invalid journey stages');
  const route=stages.map(s=>({...s}));
  let stage=0,phase='station',growth=null,disposed=false,kills=0;
  const completed=[];
  return {
    snapshot(){return JSON.parse(JSON.stringify({stage:stage+1,total:route.length,phase,growth,kills,completed,rewardTotal:completed.reduce((n,id)=>n+route[id-1].reward,0),route:route[stage]}));},
    depart(){if(disposed||phase!=='station')return false;phase='battle';return true;},
    finish(battle){
      if(disposed||phase!=='battle'||!battle?.done||!battle.growth||!Number.isFinite(battle.hp)||!Number.isInteger(battle.kills)||battle.kills<0||!Number.isFinite(battle.routeRemaining)||battle.routeRemaining<0||(battle.hp>0&&battle.routeRemaining>0))return false;
      if(battle.hp>0&&route[stage].boss&&!battle.boss?.defeated)return false;
      growth=JSON.parse(JSON.stringify(battle.growth));kills+=battle.kills;
      if(battle.hp<=0){phase='lost';return true;}
      completed.push(stage+1);
      if(route[stage].reward)credit(route[stage].reward);
      phase=stage===route.length-1?'won':'arrival';return true;
    },
    arrive(){if(disposed||phase!=='arrival')return false;stage++;phase='station';return true;},
    abort(){if(disposed||phase!=='battle')return false;phase='lost';return true;},
    debugReturn(){if(disposed||phase!=='battle')return false;phase='station';return true;},
    dispose(){disposed=true;}
  };
}
