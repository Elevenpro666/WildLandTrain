import {checkWeaponMountFit} from '../../configs/mount-fit.mjs';

export function createTrain(config) {
  let nextId=10;
  const reserveCars=[];
  const carriers=[{id:'head',name:'车头',level:0,capacity:4},{id:'c1',name:'车厢 01',level:1,capacity:4},{id:'c2',name:'车厢 02',level:1,capacity:4}];
  const equipment=[['e1','arc','head'],['e2','saw','c1'],['e4','drone','c2'],['e5','arc','c2']].map(([id,key,carrier])=>({...config.modules.find(m=>m.key===key),id,carrier,paid:0}));
  const find=id=>carriers.find(c=>c.id===id);
  const findCart=id=>find(id)||reserveCars.find(c=>c.id===id);
  const used=id=>equipment.filter(e=>e.carrier===id).reduce((n,e)=>n+e.size,0);
  const geometryIssue=(id,key,excludeId=null)=>{
    const prospective=equipment.filter(e=>e.carrier===id&&e.id!==excludeId);
    if(id!=='head'&&key==='saw'&&prospective.some(e=>e.key==='saw'))return '每节车厢只能安装1组切割轮（占2个接口），请改装到其他车厢';
    prospective.push({key,carrier:id});
    const fit=checkWeaponMountFit(prospective);
    return fit.ok?null:fit.reason;
  };
  const installationIssue=(id,size,key,excludeId=null)=>{
    const carrier=find(id);if(!carrier)return '目标车厢不存在';
    const excluded=equipment.find(e=>e.id===excludeId&&e.carrier===id);
    if(used(id)-(excluded?.size||0)+size>carrier.capacity)return '目标容量不足';
    return key?geometryIssue(id,key,excludeId):null;
  };
  return {
    snapshot:()=>({carriers:carriers.map(c=>({...c,used:used(c.id)})),reserveCars:reserveCars.map(c=>({...c,used:0})),equipment:equipment.map(e=>({...e}))}),
    canAdd:()=>carriers.length-1<config.maxCarts,
    add(){const id='c'+nextId++;const list=this.canAdd()?carriers:reserveCars;list.push({id,name:'车厢 '+id.slice(1),level:1,capacity:config.capacities[1]});return id;},
    attachCart(id){const i=reserveCars.findIndex(c=>c.id===id);if(i<0||!this.canAdd())return false;carriers.push(reserveCars.splice(i,1)[0]);return true;},
    detachCart(id){const i=carriers.findIndex(c=>c.id===id&&c.level>0);if(i<0)return false;equipment.forEach(e=>{if(e.carrier===id)e.carrier=null;});reserveCars.push(carriers.splice(i,1)[0]);return true;},
    removeCart(id){const c=findCart(id);if(!c||c.level===0)return null;equipment.forEach(e=>{if(e.carrier===id)e.carrier=null;});const list=find(id)?carriers:reserveCars;return list.splice(list.indexOf(c),1)[0];},
    installationIssue,
    canInstall(id,size,key,excludeId){return installationIssue(id,size,key,excludeId)===null;},

    buy(key,id){const m=config.modules.find(m=>m.key===key);if(!m)return false;equipment.push({...m,id:'e'+nextId++,carrier:this.canInstall(id,m.size,key)?id:null,paid:m.price});return true;},
    move(id,to){const e=equipment.find(e=>e.id===id);if(!e)return false;if(e.carrier===to)return true;if(to!==null&&!this.canInstall(to,e.size,e.key,e.id))return false;e.carrier=to;return true;}, 
    remove(id){const i=equipment.findIndex(e=>e.id===id);if(i<0)return null;return equipment.splice(i,1)[0];},
    merge(a,b){let ca=findCart(a),cb=findCart(b);if(!ca||!cb||a===b||ca.level===0||ca.level!==cb.level||ca.level>=config.capacities.length-1)return false;
      if(!find(ca.id)&&find(cb.id))[ca,cb]=[cb,ca];
      equipment.forEach(e=>{if(e.carrier===a||e.carrier===b)e.carrier=null;});
      ca.level++;ca.capacity=config.capacities[ca.level];const list=find(cb.id)?carriers:reserveCars;list.splice(list.indexOf(cb),1);return true;}
  };
}
