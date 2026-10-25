import {createSession} from './session.mjs';
import {createRenderer} from './render.mjs';

const canvas=wx.createCanvas();
const ctx=canvas.getContext('2d');
const session=createSession();
const images={};
for(const key of ['head','car','walker','flyer','elite','boss','saw','arc','drone']){
 const image=wx.createImage();image.loaded=false;image.onload=()=>{image.loaded=true;render();};image.onerror=()=>{image.loaded=false;};image.src=`assets/${key}.png`;images[key]=image;
}
const renderer=createRenderer(canvas,ctx,images);
function dimensions(){const info=wx.getSystemInfoSync();return {width:info.windowWidth||info.screenWidth||390,height:info.windowHeight||info.screenHeight||844,dpr:info.pixelRatio||1};}
function resize(){const d=dimensions();renderer.resize(d.width,d.height);render();}
function render(){renderer.render(session.state());}
resize();
let active=true,last=0,accumulator=0;
function frame(now){
 if(active){if(last){accumulator=Math.min(.1,accumulator+Math.min(.1,(now-last)/1000));while(accumulator>=1/60){session.step(1/60);accumulator-=1/60;}}last=now;render();}
 (canvas.requestAnimationFrame||requestAnimationFrame)(frame);
}
(canvas.requestAnimationFrame||requestAnimationFrame)(frame);
wx.onTouchEnd(event=>{const touch=event.changedTouches?.[0];if(!touch)return;const command=renderer.touch(touch.clientX,touch.clientY);if(command){session.action(command);render();}});
wx.onHide(()=>{active=false;last=0;accumulator=0;});
wx.onShow(()=>{active=true;last=0;accumulator=0;resize();});
wx.onWindowResize?.(resize);
// 只读验证接口；小游戏发布前可移除，不暴露可变内部集合。
if(typeof globalThis!=='undefined')globalThis.__ER_CHECK__=()=>{const s=session.state();return {mode:s.mode,stage:s.journey.stage,phase:s.journey.phase,hp:s.battle?.hp,choices:s.battle?.choices.map(c=>c.id),boss:s.battle?.boss?.hp,sprintEnergy:s.battle?.sprint.energy,sprintActive:s.battle?.sprint.active,sprintLocked:s.battle?.sprintLocked,selected:s.selected,cash:s.station.cash,cars:s.station.carriers.length,turnover:s.station.equipment.filter(e=>!e.carrier).length,confirm:s.confirm?.type||null};};
if(typeof globalThis!=='undefined'){
 globalThis.__ER_STEP__=dt=>session.step(dt);
 globalThis.__ER_RENDER__=render;
}
