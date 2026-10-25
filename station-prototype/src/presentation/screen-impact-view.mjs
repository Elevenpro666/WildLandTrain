// 只读撞飞快照的短时前景演出；固定在视口，不跟随地表或列车镜头。
export const screenImpactTargetId=24;

export function screenImpactView(s){
 if(s.sprintStarts?.length!==1)return '';
 const enemy=s.enemies.find(e=>e.id===screenImpactTargetId&&e.knock&&e.bornAt===undefined);
 if(!enemy)return '';
 const age=enemy.knockAge??0;
 if(age<.18||age>=1.1)return '';
 const approach=Math.min(1,(age-.18)/.36);
 const size=.68+2.25*approach;
 const x=322-48*approach,y=214+108*approach;
 const monsterOpacity=Math.max(0,Math.min(1,(.82-age)/.22));
 const frame=Math.min(3,Math.floor(Math.max(0,age-.18)*8));
 const monster=monsterOpacity>0?`<g data-foreground-scorpion opacity="${monsterOpacity}" transform="translate(${x},${y}) rotate(${35+190*approach}) scale(${size})"><svg x="-18.25" y="-18.25" width="36.5" height="36.5" viewBox="${frame%2*627} ${Math.floor(frame/2)*627} 627 627"><image href="assets/scorpion-roll-v1.png" width="1254" height="1254"/></svg></g>`:'';
 return monster?`<g data-screen-impact pointer-events="none" aria-hidden="true">${monster}</g>`:'';
}
