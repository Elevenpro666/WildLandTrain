import {equipmentIcon} from './equipment-icons.mjs';
import {config} from '../../config.mjs?rev=98ca09bfe6949716';
function equipmentTag(card){
 const equipment=config.modules.find(m=>m.key===card.weapon);
 return `<small class="upgrade-equipment" data-equipment="${card.weapon||'all'}">${equipment?equipmentIcon(equipment.key):'<span aria-hidden="true">✦</span>'}${equipment?equipment.name:'通用 · 全部攻击装备'}</small>`;
}
export function upgradeView(s){
 return `<div data-live="upgrades">${s.choices?.length?`<div class="upgrade-shade"><div class="upgrade-panel" role="dialog" aria-modal="true" aria-label="选择局内强化"><small>列车升级 · 战斗已暂停</small><h2>选择一项强化</h2>${s.choices.map(c=>`<button data-action="chooseUpgrade" data-id="${c.id}" data-offer="${s.upgradeId}">${equipmentTag(c)}<b>${c.name}${c.requires?' · 进阶':''}</b><span>${c.description}</span></button>`).join('')}<small>本次远征有效 · 跨站保留</small></div></div>`:''}</div>`;
}
