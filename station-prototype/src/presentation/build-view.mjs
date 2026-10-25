import {upgradeCards} from '../game/upgrades.mjs';
const groups=[['saw','切割轮'],['arc','电弧'],['drone','无人机'],['supply','通用供能']];
export function buildView(s){
 const signature=upgradeCards.map(c=>Math.max(0,s.upgrades?.[c.id]||0)).join(',');
 return `<aside class="build-hud" data-live="build" data-signature="${signature}" aria-label="已获得的构筑强化">${groups.map(([key,name])=>{
 const cards=upgradeCards.filter(c=>(c.weapon||'supply')===key&&s.upgrades?.[c.id]>0);
 if(!cards.length)return '';
 const total=cards.reduce((n,c)=>n+s.upgrades[c.id],0);
 return `<details class="build-group" data-build-group="${key}"><summary aria-label="${name}，已获得${total}层强化"><img alt="" src="assets/battle-state/upgrade-${key}-v1.svg"><span>${total}</span></summary><div class="build-details"><strong>${name}</strong>${cards.map(c=>`<div data-build-card="${c.id}"><b>${c.name}${s.upgrades[c.id]>1?' ×'+s.upgrades[c.id]:''}</b><p>${c.description}</p></div>`).join('')}</div></details>`;
 }).join('')}</aside>`;
}
