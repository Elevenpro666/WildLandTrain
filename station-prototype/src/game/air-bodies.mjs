// 飞行怪只与同一空中层相互占位；地面树石和地面怪不参与。
export function separateAir(enemies){
 const active=enemies.filter(e=>e.hp>0&&e.fly&&!e.boss&&!e.knock&&!e.exited);
 for(let pass=0;pass<2;pass++)for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
  const a=active[i],b=active[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
  if(d>=24)continue;
  if(d<.001){dx=(a.id??i)<(b.id??j)?1:-1;dy=0;d=1;}
  const n=(24-d)/2;a.x-=dx/d*n;a.y-=dy/d*n;b.x+=dx/d*n;b.y+=dy/d*n;
 }
}
