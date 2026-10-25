// B 为战斗画面单位；同一模拟时间驱动刀盘表现和命中。
export function sawSweepOffset(t,travel){
 if(!travel)return 0;
 return travel*(1-Math.cos(t*Math.PI*2*1.4))/2;
}
