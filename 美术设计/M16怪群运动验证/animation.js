// 贴图网格形变的表现原型：不改原资产，不冒充正式骨骼/逐帧动画。
export function createScorpionMotion(source,S,D,config){
 const frames={walk:[],attack:[]},cols=config.columns,rows=config.rows;
 function vertex(x,y,phase,attack){const u=x/source.w,v=y/source.h,side=Math.sign(u-.5),edge=Math.max(0,(Math.abs(u-.5)-.16)/.34);let dx=0,dy=0;
  if(v<.42)dx=Math.sin(phase)*1.2*S*(.42-v)/.42;
  if(v>.4&&v<.77){const stride=Math.sin(phase+(v>.57?Math.PI:0)+(side>0?Math.PI:0));dx=edge*stride*1.1*S;dy=edge*Math.cos(phase+(side>0?Math.PI:0))*1.3*S;}
  if(v>.76){const k=(v-.76)/.24;dx=side*k*(attack?Math.sin(phase)*2.1*S:Math.sin(phase)*.35*S);dy=k*(attack?Math.max(0,-Math.sin(phase))*1.5*S:0);}
  return{x:x+dx,y:y+dy};
 }
 function tri(ctx,p,a,b,c){const [s0,s1,s2]=p,den=s0.x*(s1.y-s2.y)+s1.x*(s2.y-s0.y)+s2.x*(s0.y-s1.y);const solve=k=>[(a[k]*(s1.y-s2.y)+b[k]*(s2.y-s0.y)+c[k]*(s0.y-s1.y))/den,(a[k]*(s2.x-s1.x)+b[k]*(s0.x-s2.x)+c[k]*(s1.x-s0.x))/den,(a[k]*(s1.x*s2.y-s2.x*s1.y)+b[k]*(s2.x*s0.y-s0.x*s2.y)+c[k]*(s0.x*s1.y-s1.x*s0.y))/den];let X=solve('x'),Y=solve('y');ctx.save();ctx.beginPath();const center={x:(a.x+b.x+c.x)/3,y:(a.y+b.y+c.y)/3};const expand=p=>{const dx=p.x-center.x,dy=p.y-center.y,length=Math.hypot(dx,dy);const overlap=.8*source.w/source.im.width;return{x:p.x+dx/length*overlap,y:p.y+dy/length*overlap};};const aa=expand(a),bb=expand(b),cc=expand(c);ctx.moveTo(aa.x,aa.y);ctx.lineTo(bb.x,bb.y);ctx.lineTo(cc.x,cc.y);ctx.closePath();ctx.clip();ctx.transform(X[0],Y[0],X[1],Y[1],X[2],Y[2]);ctx.drawImage(source.im,0,0,source.im.width,source.im.height,0,0,source.w,source.h);ctx.restore();}
 for(const mode of ['walk','attack'])for(let f=0;f<config.frames;f++){const cv=document.createElement('canvas');cv.width=source.im.width;cv.height=source.im.height;const ctx=cv.getContext('2d');ctx.scale(source.im.width/source.w,source.im.height/source.h);const phase=f/config.frames*Math.PI*2;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a={x:x*source.w/cols,y:y*source.h/rows},b={x:(x+1)*source.w/cols,y:a.y},c={x:b.x,y:(y+1)*source.h/rows},d={x:a.x,y:c.y};let v=p=>vertex(p.x,p.y,phase,mode==='attack');tri(ctx,[a,b,c],v(a),v(b),v(c));tri(ctx,[a,c,d],v(a),v(c),v(d));}frames[mode].push({...source,im:cv});}
 return Object.freeze({frame(mode,phase){return frames[mode][Math.floor(((phase%1)+1)%1*config.frames)];},frameCount:config.frames*2});
}
