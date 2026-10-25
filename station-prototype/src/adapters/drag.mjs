// Pointer事件统一支持鼠标与触屏；只在松手时提交一次业务命令。
export function mountDrag(root,onAction){
 let drag=null,ghost=null,blockedClick=false;
 const clear=()=>{ghost?.remove();ghost=null;root.querySelectorAll('.drop-target').forEach(e=>e.classList.remove('drop-target'));drag=null;};
 const down=e=>{
  blockedClick=false;
  if(e.button!==0||drag||root.querySelector('.shade'))return;
  const source=e.target.closest('[data-action="inspect"],[data-action="buyModule"],[data-action="inspectCart"],.rail [data-action="select"]');
  if(!source)return;blockedClick=false;
  if(source.dataset.id==='head')return;
  e.preventDefault();
  const cart=['select','inspectCart'].includes(source.dataset.action);
  drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,source:{...source.dataset},cart,markup:cart?source.innerHTML:source.querySelector('svg')?.outerHTML||'装备',active:false,hover:null};
 };
 const move=e=>{
  if(!drag||e.pointerId!==drag.pointer)return;
  if(!drag.active&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8)return;
  e.preventDefault();drag.active=true;
  if(!ghost){ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=drag.markup+(drag.cart?'<small>拖向同级车厢合成</small>':'<small>拖入装备舱 / 车厢</small>');document.body.append(ghost);}
  const grid=root.querySelector('.capacity-grid');
  const count=Number(grid?.dataset.capacity)||4,size=Number(drag.source.size)||1;
  const unit=grid?(grid.getBoundingClientRect().width-(count-1)*4)/count:44;
  const width=drag.cart?90:unit*size+(size-1)*4;
  ghost.style.width=width+'px';ghost.style.height='58px';ghost.style.left=Math.max(0,Math.min(innerWidth-width,e.clientX-width/2))+'px';ghost.style.top=Math.max(0,e.clientY-70)+'px';
  const hit=document.elementFromPoint(e.clientX,e.clientY);
  const car=hit?.closest('.rail [data-action="select"]');
  if(!drag.cart&&car&&drag.hover!==car.dataset.id){drag.hover=car.dataset.id;onAction({action:'dragHover',id:car.dataset.id});}
  root.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));
  const zone=document.elementFromPoint(e.clientX,e.clientY)?.closest(drag.cart?'.rail .car,[data-action="inspectCart"]':'.equipped-zone,.turnover-zone,.rail .car');if(zone?.dataset.id!==drag.source.id)zone?.classList.add('drop-target');
 };
 const up=e=>{
  if(!drag||e.pointerId!==drag.pointer)return;
  if(drag.active){blockedClick=true;e.preventDefault();const zone=document.elementFromPoint(e.clientX,e.clientY)?.closest(drag.cart?'.rail .car,[data-action="inspectCart"]':'.equipped-zone,.turnover-zone,.rail .car');
   onAction({action:drag.cart?'dropCart':'dropEquipment',id:drag.source.id,key:drag.source.key,to:zone?.matches('.turnover-zone')?'':zone?.dataset.equipmentOwner||zone?.dataset.id,valid:!!zone});
  }clear();
 };
 const cancel=()=>{if(drag?.active)blockedClick=true;clear();};
 const click=e=>{if(blockedClick){blockedClick=false;e.preventDefault();e.stopImmediatePropagation();}};
 const visibility=()=>{if(document.hidden)cancel();};
 const nativeDrag=e=>e.preventDefault();
 root.addEventListener('dragstart',nativeDrag);
 root.addEventListener('pointerdown',down);root.addEventListener('click',click,true);
 window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',visibility);
 return ()=>{clear();root.removeEventListener('dragstart',nativeDrag);root.removeEventListener('pointerdown',down);root.removeEventListener('click',click,true);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);document.removeEventListener('visibilitychange',visibility);};
}
