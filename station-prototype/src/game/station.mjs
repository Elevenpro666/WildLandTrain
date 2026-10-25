export function createStation({train,economy,config}) {
  let mode='station',lastId=0,disposed=false;
  const snapshot=()=>({mode,cash:economy.balance(),...train.snapshot(),shop:config.modules.filter(m=>!m.trialOnly).map(m=>({...m})),cartPrice:config.cartPrice,cartSellValues:[...config.cartSellValues]});
  return {snapshot,dispose(){disposed=true;},dispatch(cmd){
    if(disposed)return {ok:false,message:'整备已关闭'};
    if(!cmd||!Number.isSafeInteger(cmd.commandId)||cmd.commandId<=lastId)return {ok:false,message:'重复或过期操作'};
    lastId=cmd.commandId;if(cmd.type==='returnStation'&&mode==='ready'){mode='station';return {ok:true,message:'已返回整备，装备与余额保留'};}if(mode!=='station')return {ok:false,message:'已经完成出站检查'};
    let ok=false,message='无法执行，请检查选择';
    if(cmd.type==='buyCart'){
      const attached=train.canAdd();ok=economy.purchase(config.cartPrice,()=>train.add());message=ok?(attached?'新车厢已接入':'已获得车厢，暂放周转区，可合成或自行处理'):'能源不足';
    } else if(cmd.type==='buyModule') {
      const m=config.modules.find(m=>m.key===cmd.key);
      if(!m)message='未知装备';
      else {const issue=train.installationIssue(cmd.to,m.size,cmd.key);ok=economy.purchase(m.price,()=>train.buy(cmd.key,cmd.to));message=ok?(issue?`已获得装备，暂放周转区：${issue}`:'装备已安装'):'能源不足';}
    } else if(cmd.type==='move') {const e=train.snapshot().equipment.find(item=>item.id===cmd.id);const issue=e&&cmd.to!==null?train.installationIssue(cmd.to,e.size,e.key,e.id):null;ok=train.move(cmd.id,cmd.to);message=ok?(cmd.to===null?'装备已移至周转区':'装备已装回'):issue||'该装备不存在或目标容量不足';
    } else if(cmd.type==='merge'){ok=train.merge(cmd.a,cmd.b);message=ok?'合成完成，请自行装回周转装备':'只能合成两节同阶车厢，最高三级';
    } else if(cmd.type==='attachCart'||cmd.type==='detachCart'){ok=train[cmd.type](cmd.id);message=ok?(cmd.type==='attachCart'?'车厢已编入':'车厢及其装备已移至周转区'):'无法编入或移出，请检查编组位置';
    } else if(cmd.type==='sellCart'||cmd.type==='discardCart'){const c=train.removeCart(cmd.id);ok=!!c;if(c&&cmd.type==='sellCart')economy.credit(config.cartSellValues[c.level]);message=ok?'车厢已处置，原装备保留在周转区':'车厢不存在或为车头';
    } else if(cmd.type==='sell'||cmd.type==='discard') {const e=train.remove(cmd.id);ok=!!e;if(e&&cmd.type==='sell')economy.credit(e.sellValue);message=ok?(cmd.type==='sell'?'装备已出售':'装备已丢弃'):'装备已不存在';
    } else if(cmd.type==='depart'){const s=train.snapshot();if(s.equipment.some(e=>e.carrier===null)||s.reserveCars.length)message='周转区还有物品，请装载、编入或自行处置后出站';else {mode='ready';ok=true;message='出站检查通过';}}
    return {ok,message};
  }};
}
