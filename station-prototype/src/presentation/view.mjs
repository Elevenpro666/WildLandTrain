import {equipmentIcon} from './equipment-icons.mjs';
import {stationBody} from './train-body.mjs?rev=d2385bb9b931f157';
import {sprintConfig} from '../game/sprint.mjs';
import {energyIcon} from './resource-icon.mjs';
const button=(label,action,extra='')=>`<button data-action="${action}" ${extra}>${label}</button>`;
export function view(s,ui){
 const target=s.carriers.find(c=>c.id===ui.target)||s.carriers[0];
 const entering=Number.isFinite(ui.arrivalProgress);
 // 前段保持可辨识的驶入速度，最后一段再刹车；避免三次衰减过早接近终点。
 const travel=entering?-120*(1-Math.min(1,ui.arrivalProgress/.95))**1.4:0;

 const installed=s.equipment.filter(e=>e.carrier===target.id);
 const selected=s.equipment.find(e=>e.id===ui.inspected);
 const selectedCart=[...s.carriers,...s.reserveCars].find(c=>c.id===ui.inspectedCart);
 let cells='';
 for(const e of installed)cells+=button(equipmentIcon(e.key)+`<small class="size-label">${e.size}接口</small>`,'inspect',`class="slot occupied equipment-block" style="grid-column:span ${e.size}" data-size="${e.size}" data-id="${e.id}" aria-label="${e.name}，占用${e.size}接口"`);
 for(let n=target.used;n<target.capacity;n++)cells+='<div class="slot empty-slot" aria-label="空容量">＋</div>';
 const loose=[...s.equipment.filter(e=>e.carrier===null),...s.reserveCars.map(c=>({...c,isCart:true}))],page=Math.min(ui.turnoverPage||0,Math.max(0,Math.ceil(loose.length/4)-1));
 return `<div class="station-screen station-fixed" ${entering?'inert aria-busy="true"':''}>
 <header class="station-header"><strong>废土整备站${ui.journey?' · '+ui.journey.stage+'/3':''}</strong><span>${energyIcon()} ${s.cash}</span><small>到站免费修复满耐久${ui.journey?.growth?' · Lv.'+ui.journey.growth.level+' 强化保留':''}</small></header>
 <section class="equipped-zone" data-equipment-owner="${target.id}"><h2>${target.name} · 装备舱 <small>${target.used} / ${target.capacity}</small></h2><div class="capacity-grid" data-capacity="${target.capacity}" style="grid-template-columns:repeat(${target.capacity},minmax(0,1fr))">${cells}</div><small>整块宽度表示占用接口 · 点击查看 / 拖动装配</small></section>
 <div class="station-dock">
 <div class="dock-target">${target.name} · ${target.used}/${target.capacity}${target.level?' · 再点已选车厢可管理':''}</div>
 <div class="rail" style="overflow:hidden">${[...s.carriers].reverse().map(c=>`<button class="car ${c.id===target.id?'selected':''}" style="transform:translateX(${travel*5}%)" data-action="select" data-id="${c.id}">${stationBody(c.id==='head',ui.artVersion,c.level,ui.platformArtCandidate)}<b>${c.level?'Lv.'+c.level:'车头'}</b><small>${c.used}/${c.capacity}</small></button>`).join('')}</div>
 </div>
 <section class="supply-zone"><h2>整备商店 <small>点击购入 → ${target.name}</small></h2><div class="icon-shop">${s.shop.map(m=>button(`${equipmentIcon(m.key)}<span>${m.name}</span><small>${energyIcon()} ${m.price} · 占${m.size}接口${m.key==='saw'&&target.level>0&&installed.some(e=>e.key==='saw')?' · 本厢限1组':''}</small>`,'buyModule',`class="equipment-tile" data-size="${m.size}" data-key="${m.key}" data-to="${target.id}" aria-label="购买${m.name} ${m.price}能源"`)).join('')}</div></section>
 <section class="turnover-zone"><h2>临时周转 <small>${loose.length} 件待处理</small></h2><div class="turnover-icons">${loose.slice(page*4,page*4+4).map(e=>button(e.isCart?'▣ Lv.'+e.level:equipmentIcon(e.key),e.isCart?'inspectCart':'inspect',`class="slot occupied" ${e.isCart?'':`data-size="${e.size}"`} data-id="${e.id}" aria-label="${e.name}"`)).join('')||'<small>暂无待安置物品</small>'}${loose.length>4?button('‹','page',`data-key="turnoverPage" data-page="${page-1}" ${page===0?'disabled':''}`)+button('›','page',`data-key="turnoverPage" data-page="${page+1}" ${page>=Math.ceil(loose.length/4)-1?'disabled':''}`):''}</div></section>
 <div class="station-bottom">
 <p class="notice" role="status">${ui.message||'点击载体查看装备；选择两节同阶车厢进行合成。'}</p>
 <div class="operations">${button('买车 · 30','buyCart')}${button('出站 →','depart')}</div>
 </div>
 <div class="test-settings">
 <details><summary>测试设置与说明</summary> <p>冲刺测试：${button('车头品质 '+(ui.quality||1)+' · 点击切换','quality')} 本次距离 ${sprintConfig.baseDistance[(ui.quality||1)-1]+s.equipment.filter(e=>e.carrier&&e.key==='boost').length*sprintConfig.boostDistance}米。已装助推器每件 +${sprintConfig.boostDistance}米。仅测试切换，不扣费。</p><p>刷新重置；前两段到站各奖励48能源。第三段击败Boss后结束，Boss战无法冲刺。</p>${button('重置演示','reset')}</details>
 </div>
 ${selected&&!ui.confirm?`<div class="shade"><section role="dialog" aria-modal="true"><h2>${selected.name}</h2><p>占用 ${selected.size} 接口 · 出售返还 ${selected.sellValue} 能源</p><div class="operations">${button(selected.carrier?'卸下':'装入','move',`data-id="${selected.id}" data-to="${selected.carrier?'':target.id}"`)}${button('出售','sell',`data-id="${selected.id}"`)}${button('丢弃','discard',`data-id="${selected.id}"`)}</div>${button('关闭','closeItem')}</section></div>`:''}
 ${selectedCart&&!ui.confirm?`<div class="shade"><section role="dialog" aria-modal="true"><h2>${selectedCart.name} · Lv.${selectedCart.level}</h2><p>容量 ${selectedCart.capacity} · 出售 ${s.cartSellValues[selectedCart.level]} 能源</p><p>未编组车厢不提供容量；移出或处置车厢会保留原装备。</p><div class="operations">${button(s.reserveCars.some(c=>c.id===selectedCart.id)?'编入':'移至周转',s.reserveCars.some(c=>c.id===selectedCart.id)?'attachCart':'detachCart',`data-id="${selectedCart.id}"`)}${button('出售','sellCart',`data-id="${selectedCart.id}"`)}${button('丢弃','discardCart',`data-id="${selectedCart.id}"`)}</div><p>选择同级车厢合成（原装备进入周转）：</p>${[...s.carriers,...s.reserveCars].filter(c=>c.id!==selectedCart.id&&c.level===selectedCart.level&&c.level<3).map(c=>button(c.name,'mergePair',`data-id="${selectedCart.id}" data-to="${c.id}"`)).join('')||'<small>暂无同级车厢</small>'}${button('关闭','closeItem')}</section></div>`:''}
 ${ui.confirm?`<div class="shade"><section role="dialog" aria-modal="true"><h2>确认${ui.confirm.type==='merge'?'合成':'处置装备'}</h2><p>${ui.confirm.text}</p><div class="operations">${button('取消','cancel')}${button('确认','confirm')}</div></section></div>`:''}</div>`;
}
