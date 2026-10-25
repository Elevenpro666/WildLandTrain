function bodyHalfLength(car){
 if(car.id==='head')return 74*728/389/2;
 const sourceHeights=[0,875,998,1239],level=Math.max(1,Math.min(3,Number(car.level)||1));
 return 70*sourceHeights[level]/740/2;
}

export function repulsorCarBounds(car){
 if(car.id==='head'){
  const halfHeight=bodyHalfLength(car),centerY=car.y+57-halfHeight;
  return {carrier:car.id,x:car.x,left:car.x-37,right:car.x+37,top:centerY-halfHeight,bottom:centerY+halfHeight,halfWidth:37};
 }
 const halfWidth=70*800/740/2,halfHeight=bodyHalfLength(car),centerY=car.y+26;
 return {carrier:car.id,x:car.x,left:car.x-halfWidth,right:car.x+halfWidth,top:centerY-halfHeight,bottom:centerY+halfHeight,halfWidth};
}

export function repulsorField(cars,radius){
 if(!cars.length)return null;
 const bounds=cars.map(repulsorCarBounds),left=Math.min(...bounds.map(body=>body.left)),right=Math.max(...bounds.map(body=>body.right));
 const halfWidth=Math.max(...bounds.map(body=>body.halfWidth));
 return {centerX:(left+right)/2,left,right,top:Math.min(...bounds.map(body=>body.top)),bottom:Math.max(...bounds.map(body=>body.bottom)),radius,reach:Math.max(8,radius-halfWidth)};
}

export function repulsorGroups(cars,weapons,linked,radius){
 const repulsors=weapons.filter(weapon=>weapon.key==='repulsor');
 const byCarrier=new Map();
 for(const weapon of repulsors){const list=byCarrier.get(weapon.carrier)??[];list.push(weapon);byCarrier.set(weapon.carrier,list);}
 const occupied=cars.map((car,index)=>byCarrier.has(car.id)?{car,index,weapons:byCarrier.get(car.id)}:null).filter(Boolean);
 const groups=[];
 for(const item of occupied){
  const previous=groups.at(-1);
  if(linked&&previous&&item.index===previous.lastIndex+1){previous.cars.push(item.car);previous.weapons.push(...item.weapons);previous.lastIndex=item.index;}
  else groups.push({cars:[item.car],weapons:[...item.weapons],lastIndex:item.index});
 }
 return groups.map(group=>({...group,field:repulsorField(group.cars,radius),segments:group.cars.map(repulsorCarBounds)}));
}

export function repulsorContact(enemy,field){
 const nearestX=Math.max(field.left,Math.min(field.right,enemy.x)),nearestY=Math.max(field.top,Math.min(field.bottom,enemy.y));
 const dx=enemy.x-nearestX,dy=enemy.y-nearestY,distance=Math.hypot(dx,dy);
 return {inside:distance<=field.reach,dx,dy,distance,nearestX,nearestY};
}

export function repulsorReleaseVector(enemy,field){
 const contact=repulsorContact(enemy,field);
 let {dx,dy,distance}=contact;
 if(distance<.001){dx=enemy.x<field.centerX?-1:1;dy=0;distance=1;}
 return {x:dx/distance,y:dy/distance};
}
