import {upgradeCards} from '../game/upgrades.mjs';
const clamp=value=>Math.max(0,Math.min(1,value));
export function hudState(battle,cash){
  if(!battle||battle.mode!=='battle')return null;
  const s=battle;
  if(![s.hp,s.maxHp,s.experience,s.levelStartExperience,s.nextUpgrade,cash,s.sprint?.energy].every(Number.isFinite)||s.maxHp<=0||s.nextUpgrade<=s.levelStartExperience||cash<0)throw Error('INVALID_HUD_STATE');
  const build=upgradeCards.filter(card=>s.upgrades[card.id]>0).map(card=>({id:card.id,weapon:card.weapon??'common',name:card.name,description:card.description,stacks:s.upgrades[card.id]}));
  const state=s.done?'ended':s.paused?'paused':s.choices.length?'choosing':s.sprintLocked?'locked':s.invincible?'active':s.sprint.energy>=100?'ready':'charging';
  return {
    health:{current:Math.max(0,s.hp),maximum:s.maxHp,ratio:clamp(s.hp/s.maxHp)},
    experience:{level:s.level,current:Math.max(0,s.experience-s.levelStartExperience),required:s.nextUpgrade-s.levelStartExperience,ratio:clamp((s.experience-s.levelStartExperience)/(s.nextUpgrade-s.levelStartExperience))},
    cash,build,sprint:{state,enabled:state==='ready',ratio:clamp(s.sprint.energy/100)},
  };
}
