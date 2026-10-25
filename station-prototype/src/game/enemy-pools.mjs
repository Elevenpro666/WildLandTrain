// 只处理内容目录与抽取。活体生成、计时与在场上限由Battle负责。
export function createEnemyCatalog(input){
 const fail=message=>{throw new Error(`Enemy catalog: ${message}`);};
 const positive=(n,label)=>{if(!Number.isFinite(n)||n<=0)fail(label);};
 const integer=(n,label)=>{positive(n,label);if(!Number.isSafeInteger(n))fail(label);};
 const index=(list,limit,label)=>{
  if(!Array.isArray(list)||!list.length||list.length>limit)fail(label);
  const map=new Map();
  for(const item of list){if(!item||typeof item.id!=='string'||!item.id.trim()||map.has(item.id))fail(`${label} id`);map.set(item.id,item);}
  return map;
 };
 if(!input||typeof input!=='object')fail('missing config');
 const enemies=index(input.enemies,256,'enemies'),pools=index(input.pools,128,'pools'),encounters=index(input.encounters,128,'encounters');
 for(const [id,e] of enemies){
  if(typeof e.name!=='string'||!e.name.trim()||!['normal','elite','boss'].includes(e.rank)||!['ground','flying'].includes(e.movement))fail(`enemy ${id}`);
  for(const key of ['hp','damage','attackInterval','speed'])positive(e[key],`${id}.${key}`);
  integer(e.minChapter,`${id}.minChapter`);
  enemies.set(id,Object.freeze({id,name:e.name,rank:e.rank,movement:e.movement,hp:e.hp,damage:e.damage,attackInterval:e.attackInterval,speed:e.speed,minChapter:e.minChapter}));
 }
 for(const [id,p] of pools){
  if(!Array.isArray(p.entries)||!p.entries.length||p.entries.length>256)fail(`pool ${id}`);
  const seen=new Set();let total=0;
  const entries=p.entries.map(e=>{
   if(!e||!enemies.has(e.enemyId)||seen.has(e.enemyId))fail(`pool ${id} reference`);
   positive(e.weight,`pool ${id} weight`);seen.add(e.enemyId);total+=e.weight;
   return Object.freeze({enemyId:e.enemyId,weight:e.weight});
  });if(!Number.isFinite(total))fail(`pool ${id} total weight`);
  pools.set(id,Object.freeze({id,entries:Object.freeze(entries)}));
 }
 for(const [id,e] of encounters){
  if(!e.source||!['pool','fixed'].includes(e.source.type))fail(`encounter ${id} source`);
  if(!(e.source.type==='pool'?pools:enemies).has(e.source.id))fail(`encounter ${id} reference`);
  integer(e.count,`${id}.count`);integer(e.maxAlive,`${id}.maxAlive`);positive(e.interval,`${id}.interval`);
  encounters.set(id,Object.freeze({id,source:Object.freeze({type:e.source.type,id:e.source.id}),count:e.count,interval:e.interval,maxAlive:e.maxAlive}));
 }
 return Object.freeze({
  getEnemy:id=>enemies.get(id)||null,
  getEncounter:id=>encounters.get(id)||null,
  pick(id,chapter,random){
   integer(chapter,'chapter');const encounter=encounters.get(id);
   if(!encounter)return {ok:false,reason:'UNKNOWN_ENCOUNTER'};
   if(encounter.source.type==='fixed'){
    const enemy=enemies.get(encounter.source.id);
    return enemy.minChapter<=chapter?{ok:true,enemy}:{ok:false,reason:'LOCKED'};
   }
   const entries=pools.get(encounter.source.id).entries;
   let total=0;for(const e of entries)if(enemies.get(e.enemyId).minChapter<=chapter)total+=e.weight;
   if(!total)return {ok:false,reason:'EMPTY_POOL'};
   if(typeof random!=='function')fail('random required');const value=random();
   if(!Number.isFinite(value)||value<0||value>=1)fail('random must be in [0,1)');
   let threshold=value*total,last;
   for(const entry of entries){const enemy=enemies.get(entry.enemyId);if(enemy.minChapter>chapter)continue;last=enemy;threshold-=entry.weight;if(threshold<0)return {ok:true,enemy};}
   return {ok:true,enemy:last}; // 浮点累计误差时仍返回最后一个合资格定义。
  }
 });
}
