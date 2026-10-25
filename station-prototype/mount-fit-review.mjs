// 独立表现验证页：用真实装配容量与战斗绘制，不改游戏的购买/挂载规则。
import {config} from './config.mjs';
import {createTrain} from './src/game/train.mjs';
import {createBattle} from './src/game/battle.mjs?v=arc-count-body1';
import {battleView} from './src/presentation/battle.mjs?v=arc-power-tier1';

const cases=[
  {id:'empty',label:'空载平台',counts:{}},
  {id:'starting',label:'开局组合',counts:{head:{arc:1},c1:{saw:2},c2:{drone:1,arc:1}}},
  {id:'head4arc',label:'车头4电弧',counts:{head:{arc:4}}},
  {id:'car3saw',label:'二级厢3切割轮',counts:{c1:{saw:3}}},
  {id:'car3drone',label:'三级厢3无人机舱',counts:{c1:{drone:3}}},
  {id:'car4boost',label:'车厢4助推器',counts:{c2:{boost:4}}},
  {id:'carSawBoost',label:'同厢1刀盘2助推',counts:{c1:{saw:1,boost:2}}},
];
const current=new URLSearchParams(location.search).get('case')||'starting';
const selected=cases.find(item=>item.id===current)||cases[0];
if(new URLSearchParams(location.search).get('capture')==='1')document.body.classList.add('capture');

function requireInstalled(train,key,carrier){
  if(!train.buy(key,carrier))throw new Error(`无法创建${key}`);
  const equipment=train.snapshot().equipment.at(-1);
  if(equipment.carrier!==carrier)throw new Error(`${key}超出${carrier}容量`);
}
function loadoutFor(id){
  const train=createTrain(config);
  if(id==='empty')for(const equipment of train.snapshot().equipment.filter(e=>e.carrier))train.move(equipment.id,null);
  if(id==='head4arc')for(let i=0;i<3;i++)requireInstalled(train,'arc','head');
  if(id==='car3saw'){
    const second=train.add();
    if(!train.merge('c1',second))throw new Error('二级车厢合成失败');
    for(const equipment of train.snapshot().equipment.filter(e=>e.key==='saw'&&e.carrier===null)){
      if(!train.move(equipment.id,'c1'))throw new Error('切割轮重新挂载失败');
    }
    requireInstalled(train,'saw','c1');
  }
  if(id==='car3drone'){
    if(!train.merge('c1','c2'))throw new Error('第一辆二级车厢合成失败');
    const a=train.add(),b=train.add();
    if(!train.merge(a,b)||!train.merge('c1',a))throw new Error('三级车厢合成失败');
    for(let i=0;i<3;i++)requireInstalled(train,'drone','c1');
  }
  if(id==='car4boost'){
    for(const equipment of train.snapshot().equipment.filter(e=>e.carrier==='c2'))train.move(equipment.id,null);
    for(let i=0;i<4;i++)requireInstalled(train,'boost','c2');
  }
  if(id==='carSawBoost'){
    const saw=train.snapshot().equipment.find(e=>e.carrier==='c1'&&e.key==='saw');
    if(!saw)throw new Error('缺少切割轮');
    const other=train.snapshot().equipment.find(e=>e.carrier==='c1'&&e.key==='saw'&&e.id!==saw.id);
    if(!other||!train.remove(other.id))throw new Error('无法预备切割轮混装夹具');
    for(let i=0;i<2;i++)requireInstalled(train,'boost','c1');
  }
  return train.snapshot();
}

const loadout=loadoutFor(selected.id);
// 抬高测试页的选卡阈值，仅为了观察持续战斗中的挂载净空；不影响正式成长。
const sawTrial=new URLSearchParams(location.search).get('weaponTrial')==='sawLinked';
const trial=new URLSearchParams(location.search).get('weaponTrial');
const trialUpgrades={...(sawTrial?{sawReach:1,sawLinked:1}:{}),...(trial==='arcDamage'?{arcDamage:1}:{}),...(trial==='arcPulse'?{arcDamage:1,arcPulse:1}:{}),...(trial==='arcCount'?{arcReach:1,arcCount:1}:{})};
const battle=createBattle(loadout,1,{routeLength:1800,growth:{nextUpgrade:99999,...(Object.keys(trialUpgrades).length?{upgrades:trialUpgrades}:{})}});
// 默认在冲刺结束后取景；sprintMoment=1 专门检查助推喷流工作态。
const initialSprint=battle.snapshot().sprint;
const previewTime=new URLSearchParams(location.search).get('sprintMoment')==='1'?.6:initialSprint.distance/initialSprint.speedMetres+2.5;
for(let i=0;i<Math.ceil(previewTime*60);i++)battle.step(1/60);
const state=battle.snapshot();
state.choices=[];
Object.assign(state,{artVersion:'approved',platformArtCandidate:new URLSearchParams(location.search).get('platformArt')==='carV1',mountTrialCandidate:new URLSearchParams(location.search).get('mountTrial')==='fit2'||new URLSearchParams(location.search).get('platformArt')==='carV1',rearBankCandidate:new URLSearchParams(location.search).get('mountTrial')==='rearBank',boostArtTrial:['enhanced','rocket'].includes(new URLSearchParams(location.search).get('boostArt'))?new URLSearchParams(location.search).get('boostArt'):'base',mountArtTier:new URLSearchParams(location.search).get('mountArtTier')==='advanced'?'advanced':'basic',enemyArtCandidate:true,enemyArtVariant:'highrank',weaponSkinId:'blue',cash:90,journey:{stage:1}});
document.querySelector('#app').innerHTML=battleView(state);
document.querySelector('#review-control').innerHTML=cases.map(item=>`<button type="button" data-case="${item.id}" aria-current="${item.id===selected.id}">${item.label}</button>`).join('');
document.querySelector('#review-control').addEventListener('click',event=>{
  const button=event.target.closest('[data-case]');
  if(!button)return;
  const url=new URL(location.href);url.searchParams.set('case',button.dataset.case);location.href=url.href;
});
window.render_game_to_text=()=>JSON.stringify({mode:'mount-fit-review',coordinate:'390×844 SVG B units; x right, y down',case:selected.id,time:state.t,upgrades:state.upgrades,carriers:loadout.carriers.map(({id,level,capacity,used})=>({id,level,capacity,used})),equipment:loadout.equipment.filter(e=>e.carrier).map(({key,carrier,size})=>({key,carrier,size})),visibleMounts:{arc:document.querySelectorAll('[data-mount="arc"]').length,sawDiscs:document.querySelectorAll('[data-saw-tier]').length,drone:document.querySelectorAll('[data-mount="drone"]').length,boost:document.querySelectorAll('[data-mount="boost"]').length}});
window.advanceTime=ms=>{if(!Number.isFinite(ms)||ms<=0)return;for(let i=0;i<Math.ceil(ms/16.667);i++)battle.step(1/60);Object.assign(state,battle.snapshot(),{artVersion:'approved',platformArtCandidate:new URLSearchParams(location.search).get('platformArt')==='carV1',mountTrialCandidate:new URLSearchParams(location.search).get('mountTrial')==='fit2'||new URLSearchParams(location.search).get('platformArt')==='carV1',rearBankCandidate:new URLSearchParams(location.search).get('mountTrial')==='rearBank',boostArtTrial:['enhanced','rocket'].includes(new URLSearchParams(location.search).get('boostArt'))?new URLSearchParams(location.search).get('boostArt'):'base',mountArtTier:new URLSearchParams(location.search).get('mountArtTier')==='advanced'?'advanced':'basic',enemyArtCandidate:true,enemyArtVariant:'highrank',weaponSkinId:'blue',cash:90,journey:{stage:1},choices:[]});document.querySelector('#app').innerHTML=battleView(state);};
