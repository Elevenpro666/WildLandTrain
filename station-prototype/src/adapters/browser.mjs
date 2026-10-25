import {mountDrag} from './drag.mjs?v=drag-fix-2';
export function mount(render,onAction,onFrame=()=>false){
 const root=document.getElementById('app');
 const stopDrag=mountDrag(root,onAction);
 const click=e=>{const b=e.target.closest('button[data-action]');if(b&&!b.disabled)onAction({...b.dataset});};
 const key=e=>{if(e.key==='f'){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});}};
 root.addEventListener('click',click);document.addEventListener('keydown',key);
 let last=0,raf;const frame=now=>{const dt=last?Math.min((now-last)/1000,.033):0;last=now;if(!document.hidden&&onFrame(dt)){const next=document.createElement('div');next.innerHTML=render();for(const freshCar of next.querySelectorAll('.rail .car')){const car=root.querySelector(`.rail .car[data-id="${freshCar.dataset.id}"]`);if(car)car.style.transform=freshCar.style.transform;}for(const tag of ['header',root.querySelector('.battle-field')?'.battle-field>svg':'svg']){const old=root.querySelector(tag),fresh=next.querySelector(tag);if(old&&fresh)old.replaceWith(fresh);}const oldBuild=root.querySelector('[data-live="build"]'),newBuild=next.querySelector('[data-live="build"]');if(oldBuild&&newBuild&&oldBuild.dataset.signature!==newBuild.dataset.signature){const open=new Set([...oldBuild.querySelectorAll('details[open]')].map(d=>d.dataset.buildGroup));oldBuild.replaceWith(newBuild);newBuild.querySelectorAll('details').forEach(d=>{d.open=open.has(d.dataset.buildGroup);});}const oldUpgrade=root.querySelector('[data-live="upgrades"]'),newUpgrade=next.querySelector('[data-live="upgrades"]');if(oldUpgrade&&newUpgrade&&oldUpgrade.innerHTML!==newUpgrade.innerHTML){oldUpgrade.replaceWith(newUpgrade);newUpgrade.querySelector('button')?.focus({preventScroll:true});}const button=root.querySelector('[data-action="sprint"]'),freshButton=next.querySelector('[data-action="sprint"]');if(button&&freshButton){button.disabled=freshButton.disabled;button.title=freshButton.title;button.dataset.state=freshButton.dataset.state;button.style.setProperty('--charge',freshButton.style.getPropertyValue('--charge'));button.setAttribute('aria-label',freshButton.getAttribute('aria-label'));button.querySelector('.sprint-label').textContent=freshButton.querySelector('.sprint-label').textContent;}}raf=requestAnimationFrame(frame);};raf=requestAnimationFrame(frame);
 return {draw(){
  const wasBattle=root.classList.contains('battle-mode');
  const openBuild=new Set([...root.querySelectorAll('[data-build-group][open]')].map(d=>d.dataset.buildGroup));
  const scrollTop=root.querySelector('.station-scroll')?.scrollTop||0;
  const previousOwner=root.querySelector('[data-equipment-owner]')?.dataset.equipmentOwner;
  root.innerHTML=render();
  const isBattle=!!root.querySelector('.battle-screen');
  if(wasBattle&&isBattle)root.querySelectorAll('[data-build-group]').forEach(d=>{d.open=openBuild.has(d.dataset.buildGroup);});
  root.classList.toggle('battle-mode',isBattle);
  document.body.classList.toggle('battle-mode',isBattle);
  const isStation=!!root.querySelector('.station-screen');
  root.classList.toggle('station-mode',isStation);document.body.classList.toggle('station-mode',isStation);
  if(isStation&&!wasBattle){
   const owner=root.querySelector('[data-equipment-owner]')?.dataset.equipmentOwner;
   const scroller=root.querySelector('.station-scroll');if(scroller)scroller.scrollTop=owner===previousOwner?scrollTop:0;
  }
  if(wasBattle!==isBattle){window.scrollTo(0,0);root.querySelector('button:not(:disabled)')?.focus({preventScroll:true});}
 },stop(){stopDrag();cancelAnimationFrame(raf);root.removeEventListener('click',click);document.removeEventListener('keydown',key);document.body.classList.remove('battle-mode');root.classList.remove('battle-mode','station-mode');document.body.classList.remove('station-mode');}};
}
