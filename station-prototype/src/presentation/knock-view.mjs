// 碰撞瞬间的短残迹；时间与位置均来自战斗快照，不另开动画时钟。
export function knockView(e){
 if(!e.knock||!e.knockOrigin||e.knockAge>.42)return '';
 const age=e.knockAge,fade=Math.max(0,1-age/.42);
 const x=e.x,y=e.y,origin=e.knockOrigin,side=e.vx<0?-1:1;
 const tailX=x-side*16,tailY=y-8;
 return `<g data-knock-fx="${e.id}" opacity="${fade.toFixed(2)}" fill="none" stroke="#383c35" stroke-linecap="round">
 <image href="assets/battle-state/impact-burst-v1.svg" x="${origin.x-17}" y="${origin.y-17}" width="34" height="34" opacity="${Math.max(0,1-age/.2).toFixed(2)}"/>
 <path d="M${origin.x} ${origin.y}Q${(origin.x+tailX)/2} ${origin.y-8} ${tailX} ${tailY}" stroke-width="3" stroke-dasharray="7 6"/>
 <path d="M${origin.x+side*4} ${origin.y-13}l${side*10} -9M${origin.x+side*6} ${origin.y+12}l${side*11} 7" stroke-width="2.5"/>
 <path d="M${x-side*12} ${y-13}l${-side*10} -4M${x-side*12} ${y+13}l${-side*8} 5" stroke="#f8f5e8" stroke-width="3"/>
 </g>`;
}
