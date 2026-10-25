export function createEconomy(initial) {
  let cash=initial;
  return {balance:()=>cash,
    purchase(cost,commit){if(!Number.isFinite(cost)||cost<0||cash<cost)return false;
      // 同步提交成功才扣款，不跨 await 暴露半完成交易。
      if(commit()===false)return false;cash-=cost;return true;},
    credit(value){if(!Number.isInteger(value)||value<0)throw Error('Invalid credit');cash+=value;}
  };
}
