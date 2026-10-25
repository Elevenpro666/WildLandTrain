export const upgradeCards=Object.freeze([
 {id:'sawReach',weapon:'saw',name:'加长支架',description:'切割轮左右覆盖55→70，扩大接触范围。'},
 {id:'sawLinked',weapon:'saw',requires:'sawReach',name:'横向往复',description:'现有刀盘沿侧向伸缩臂往复，前后覆盖保持30，最远横向覆盖70→90；同敌不重复伤害。'},
 {id:'sawDamage',weapon:'saw',name:'强化齿刃',description:'切割轮每轮伤害8→12。'},
 {id:'sawRate',weapon:'saw',requires:'sawDamage',name:'高速传动',description:'切割轮攻击间隔0.5→0.35秒。'},
 {id:'arcReach',weapon:'arc',name:'延伸电弧',description:'目标间连锁距离60→90，更易连接敌群。'},
 {id:'arcCount',weapon:'arc',requires:'arcReach',name:'多级传导',description:'电弧最多连接3→5个不同目标。'},
 {id:'arcDamage',weapon:'arc',name:'高压绕组',description:'电弧首目标伤害12→18。'},
 {id:'arcPulse',weapon:'arc',requires:'arcDamage',name:'双脉冲',description:'0.15秒后再击中首目标一次，不再次连锁。'},
 {id:'droneCount',weapon:'drone',name:'扩编机组',description:'每个机舱无人机1→2架，不占额外容量。'},
 {id:'dronePatrol',weapon:'drone',requires:'droneCount',name:'协同巡防',description:'巡航范围180→240，优先分散目标。'},
 {id:'droneDamage',weapon:'drone',name:'强化电极',description:'无人机接敌伤害14→20。'},
 {id:'droneFocus',weapon:'drone',requires:'droneDamage',name:'集中作业',description:'同舱集中攻击最大耐久最高的目标，优先于分散策略。'},
 {id:'repulsorChain',weapon:'repulsor',name:'相邻传导',description:'相邻车厢都安装拒止器时，拒止波沿两节车厢边缘连成连续力场；缺少拒止器的车厢会中断传导。'},
 {id:'supply',name:'强化供能',repeatable:true,description:'攻击设备伤害每层+10%，不影响冲刺。临时兜底，后续扩充分支。'},
].map(Object.freeze));

export function eligibleCards(weapons,owned){
 const types=new Set(weapons.map(w=>w.key));
 const pool=upgradeCards.filter(c=>c.weapon&&types.has(c.weapon)&&!owned[c.id]&&(!c.requires||owned[c.requires]));
 if(pool.length<3)pool.push(upgradeCards.find(c=>c.id==='supply'));
 return pool;
}
export const initialUpgrades=()=>Object.fromEntries(upgradeCards.map(c=>[c.id,0]));
export const upgradeCost=level=>[5,8,12,16,20,24][Math.min(5,Math.max(0,level-1))];
export function weaponStats(key,u){
 const factor=1+.1*(u.supply||0);
 if(key==='saw')return {damage:(u.sawDamage?12:8)*factor,interval:u.sawRate?.35:.5,reach:u.sawReach?70:55,length:30,sweep:u.sawLinked?20:0};
 if(key==='arc')return {damage:(u.arcDamage?18:12)*factor,chainDamage:8*factor,interval:1,range:120,jump:u.arcReach?90:60,count:u.arcCount?5:3,pulse:!!u.arcPulse};
 if(key==='drone')return {damage:(u.droneDamage?20:14)*factor,interval:.8,range:u.dronePatrol?240:180,speed:140,contact:25,count:u.droneCount?2:1,spread:!!u.dronePatrol,focus:!!u.droneFocus};
 return null;
}
