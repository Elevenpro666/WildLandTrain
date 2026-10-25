// body仅接受项目内部生成的可信SVG；不持有计时器或素材。
export function knockbackView({x,y,originX=x,age=0,duration=1.1,angle=0,mode='side',body,width=30,height=36.5,lane=1,frames=null,variant=0}){
 if(![x,y,originX,age,duration,angle,width,height].every(Number.isFinite)||duration<=0||width<=0||height<=0||!['camera','side'].includes(mode)||typeof body!=='string')throw new TypeError('Invalid knockback presentation');
 if(age>=duration)return '';
 if(!Number.isInteger(variant)||variant<0||variant>5||frames!==null&&(!Array.isArray(frames)||frames.length<2||frames.some(f=>typeof f!=='string')))throw new TypeError('Invalid knockback frames or variant');
 const p=Math.max(0,age/duration),toward=mode==='camera';
 if(!Number.isFinite(lane)||Math.abs(lane)>1)throw new TypeError('Invalid knockback lane');
 const profile=[{spread:110,lift:55,curve:12,roll:1},{spread:70,lift:170,curve:28,roll:1.3},{spread:140,lift:90,curve:-16,roll:.9},{spread:100,lift:220,curve:-24,roll:1.6},{spread:125,lift:120,curve:22,roll:1.15},{spread:160,lift:45,curve:-12,roll:.8}][variant];
 const px=originX+lane*(profile.spread*p+profile.curve*Math.sin(p*Math.PI));
 const scale=toward?1+(variant===3?2.4:1.9)*p*p:1+.25*Math.sin(p*Math.PI);
 // 场景中的y负责把怪甩到列车后方；这里仅表达离地高度，不再把整段后退抵消掉。
 const lift=profile.lift*.85*Math.sin(p*Math.PI*.75);
 const fade=Math.min(1,(1-p)/(toward?.32:.2));
 const turn=lane*(toward?20:45)*p;
 const artwork=frames?frames[Math.floor(p*profile.roll*frames.length)%frames.length]:body;
 return `<g data-knock-art="${toward?'toward-camera':'side'}" data-trajectory="${variant}" data-ground-y="${y}" data-flying-y="${y-lift}" opacity="${fade}" pointer-events="none"><ellipse cx="${px}" cy="${y+7}" rx="${width*11/30*(1-p*.65)}" ry="${height*6/36.5*(1-p*.65)}" fill="#261e16" opacity="${.34*(1-p)}"/><g transform="translate(${px},${y-lift}) rotate(${turn}) scale(${scale})">${artwork}</g></g>`;
}
