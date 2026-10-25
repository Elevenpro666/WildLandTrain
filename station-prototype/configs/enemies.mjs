// 已接入Battle的测试目录；普通/Boss数值沿用原型，精英为测试值，非正式平衡。
export const enemyCatalogConfig={
 enemies:[
  {id:'walker',name:'游荡者',rank:'normal',movement:'ground',hp:24,damage:4,attackInterval:1.5,speed:40,minChapter:1},
  {id:'flyer',name:'飞行怪',rank:'normal',movement:'flying',hp:32,damage:5,attackInterval:2,speed:40,minChapter:1},
  {id:'brute',name:'重装精英',rank:'elite',movement:'ground',hp:120,damage:8,attackInterval:2,speed:32,minChapter:1},
  {id:'ironBearer',name:'持铁者',rank:'boss',movement:'ground',hp:600,damage:12,attackInterval:2,speed:40,minChapter:1}
 ],
 pools:[
  {id:'groundGroup',entries:[{enemyId:'walker',weight:90},{enemyId:'flyer',weight:10}]},
  {id:'mixedGroup',entries:[{enemyId:'walker',weight:55},{enemyId:'flyer',weight:45}]}
 ],
 encounters:[
  {id:'groundWave',source:{type:'pool',id:'groundGroup'},count:34,interval:.42,maxAlive:40},
  {id:'mixedWave',source:{type:'pool',id:'mixedGroup'},count:34,interval:.42,maxAlive:40},
  {id:'eliteEncounter',source:{type:'fixed',id:'brute'},count:1,interval:1,maxAlive:1},
  {id:'bossEncounter',source:{type:'fixed',id:'ironBearer'},count:1,interval:1,maxAlive:1}
 ]
};
