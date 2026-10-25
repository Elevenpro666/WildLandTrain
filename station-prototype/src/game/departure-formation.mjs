// 纯函数：有界且可复现的纵横错位，避免初始怪群呈阅兵式配对。
export function departurePositions(formation){
 const {count,rangeY,leadInsetSu,rowSpacingSu,laneSpacingSu,staggerSu,longitudinalJitterSu=0}=formation;
 const rows=Math.ceil(count/2),near=rangeY.max-leadInsetSu;
 if(!Number.isInteger(count)||count<1||!Number.isFinite(near)||!Number.isFinite(rangeY.min)||
    !Number.isFinite(rowSpacingSu)||rowSpacingSu<=0||!Number.isFinite(laneSpacingSu)||laneSpacingSu<=0||
    !Number.isFinite(staggerSu)||staggerSu<0||!Number.isFinite(longitudinalJitterSu)||longitudinalJitterSu<0||
    longitudinalJitterSu*2>=rowSpacingSu||near+longitudinalJitterSu>rangeY.max||
    near-(rows-1)*rowSpacingSu-longitudinalJitterSu<rangeY.min)throw new RangeError('Departure formation does not fit configured range');
 const jitter=(index,salt)=>(((index*37+salt*53+index*index*11)%101)/50)-1;
 if(longitudinalJitterSu>0){
  const gaps=Array.from({length:count-1},(_,i)=>1+jitter(i,2)*longitudinalJitterSu/rowSpacingSu);
  const total=gaps.reduce((sum,value)=>sum+value,0);
  const span=(rows-1)*rowSpacingSu;
  let y=near;
  return Array.from({length:count},(_,index)=>{
   if(index)y-=span*gaps[index-1]/total;
   const side=index%7===2?1:index%7===5?-1:index%2===0?-1:1;
   return [210+side*laneSpacingSu/2+jitter(index,1)*staggerSu,y];
  });
 }
 return Array.from({length:count},(_,index)=>{
  const row=Math.floor(index/2),side=index%2===0?-1:1;
  return [210+side*laneSpacingSu/2+jitter(index,1)*staggerSu,near-row*rowSpacingSu+jitter(index,2)*longitudinalJitterSu];
 });
}
