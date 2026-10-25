import {vehicleBodyWidth} from '../../configs/vehicle-geometry.mjs';
import {platformPads} from '../../configs/mount-layout.mjs?rev=8bac6ce42d2f4cfe';
// Survivor-built steel differs materially from organic enemies; equipment stays a separate layer.
import {assetUrl} from './art-asset-registry.mjs?rev=c02ad52a83438f4d';
import {headDeckSlot,headStyleWheel} from './train-shared-parts.mjs?rev=0af98ad74c19b72a';
const head={url:assetUrl('train.head.compat'),source:[468,865]};
const car={url:assetUrl('train.car.compat'),source:[1024,1536]};
function carTSlots(c,level){
 const pads=platformPads[`carL${level}`]||platformPads.carL1;
 return `<g data-car-t-slot-layer="true" data-carrier="${c.id}" data-slot-level="${level}" data-t-slot-style="head-slot-resource" pointer-events="none">${pads.map(([dx,dy],index)=>headDeckSlot(c.x+dx,c.y+dy,`data-t-slot="${index+1}" data-t-slot-row="${Math.floor(index/2)+1}"`)).join('')}</g>`;
}

const carHeight=level=>70*[0,875,998,1239][Math.max(1,Math.min(3,level))]/740;
export function trainConnections(cars=[]){
 return `<g data-train-connections="true" pointer-events="none">${cars.slice(1).map((car,index)=>{
  const previous=cars[index],previousEnd=previous.level===0?previous.y+57:previous.y+26+carHeight(previous.level)/2;
  const nextStart=car.y+26-carHeight(car.level)/2,mid=(previousEnd+nextStart)/2;
  return `<g data-train-connection="${previous.id}-${car.id}"><path d="M${car.x} ${previousEnd-3}V${nextStart+3}" stroke="#171b1d" stroke-width="8" stroke-linecap="round"/><path d="M${car.x} ${previousEnd-3}V${nextStart+3}" stroke="#777c7a" stroke-width="4" stroke-linecap="round"/><rect x="${car.x-5}" y="${mid-3.5}" width="10" height="7" rx="2" fill="#9b9e98" stroke="#171b1d" stroke-width="1.5"/></g>`;
 }).join('')}</g>`;
}
export function trainBody(c,isHead,time=0,artVersion='legacy',distance=0,platformArtCandidate=false,compactL3MountTrial=false){
 if(artVersion==='approved'){
  if(!isHead&&(platformArtCandidate||compactL3MountTrial)){
   const level=Math.max(1,Math.min(3,Number(c.level)||1));
   const levelAssets={
    1:{id:'train.car.level1V6',url:assetUrl('train.car.level1V6'),source:[800,875]},
    2:{id:'train.car.level2V6',url:assetUrl('train.car.level2V6'),source:[800,998]},
    3:{id:'train.car.level3V6',url:assetUrl('train.car.level3V6'),source:[800,1239]}
   };
   const candidate=levelAssets[level]||levelAssets[3];
   const bodyWidth=70,alphaWidth=740,fullWidth=bodyWidth*candidate.source[0]/alphaWidth,fullHeight=bodyWidth*candidate.source[1]/alphaWidth,y=c.y+26-fullHeight/2;
   const rows=[platformPads[`carL${level}`][0][1]-3,platformPads[`carL${level}`].at(-1)[1]+3];
   const wheels=rows.flatMap(wheelY=>[-1,1].map(side=>headStyleWheel(c.x+side*32,c.y+wheelY,side,`data-car-wheel="${c.id}" data-wheel-style="head-resource"`))).join('');
   return `<image data-train-body="car" data-art="approved" data-art-id="${candidate.id}" data-mount-layout="level${level}-v6" href="${candidate.url}" x="${c.x-fullWidth/2}" y="${y}" width="${fullWidth}" height="${fullHeight}"/>${wheels}${carTSlots(c,level)}`;
  }
  const artId=isHead
   ?(platformArtCandidate?'train.head.platform':'train.head.current')
   :(platformArtCandidate?'train.car.platform':'train.car.current');
  const a={url:assetUrl(artId),size:isHead?(platformArtCandidate?[1715,917]:[1716,917]):[1122,1402],crop:isHead?[363,134,389,728]:[173,180,776,1038]};
  const width=vehicleBodyWidth,height=(isHead?width:70)*a.crop[3]/a.crop[2],y=isHead?c.y+57-height:c.y+26-height/2;
  const phase=(distance%5)/5,brightness=.45+.5*(.5-.5*Math.cos((time/3.6+distance/400)*Math.PI*2));
  const wheels=[-1,1].flatMap(side=>(isHead?[.365,.555,.748]:[.353,.666]).map(v=>`<path d="M${c.x+side*width*.44-2} ${y+height*v+(phase-.5)*4}h4" stroke="#b0ada0" stroke-width="1" opacity=".6"/>`)).join('');
  const lamps=(isHead?[[.5,.2],[.3,.72],[.7,.72]]:[[.2,.32],[.8,.32],[.2,.67],[.8,.67]]).map(([u,v])=>`<g opacity="${brightness}"><circle cx="${c.x+(u-.5)*width}" cy="${y+v*height}" r="3" fill="#efc55d" opacity=".25"/><rect x="${c.x+(u-.5)*width-1}" y="${y+v*height-1.5}" width="2" height="3" fill="#ffe7a2"/></g>`).join('');
  return `<svg data-train-body="${isHead?'head':'car'}" data-art="approved" data-art-id="${artId}" x="${c.x-width/2}" y="${y}" width="${width}" height="${height}" viewBox="${a.crop.join(' ')}"><image href="${a.url}" width="${a.size[0]}" height="${a.size[1]}"/></svg><g data-train-motion>${wheels}${lamps}</g>`;
 }
 const asset=isHead?head:car,width=isHead?56:60,height=width*asset.source[1]/asset.source[0];
 const y=isHead?c.y+57-height:c.y+26-height/2;
 const hubs=[-1,1].map(side=>`<image data-wheel-hub href="assets/battle-state/wheel-hub-v1.svg" x="-6" y="-6" width="12" height="12" transform="translate(${c.x+side*(isHead?22:26)} ${c.y+(isHead?21:27)}) rotate(${Math.floor(time*480)%360})"/>`).join('');
 const artId=isHead?'train.head.compat':'train.car.compat';
 return `<g><svg data-train-body="${isHead?'head':'car'}" data-art-id="${artId}" x="${c.x-width/2}" y="${y}" width="${width}" height="${height}" viewBox="0 0 ${asset.source.join(' ')}"><image href="${asset.url}" width="${asset.source[0]}" height="${asset.source[1]}" style="filter:brightness(1.22)"/></svg>${hubs}</g>`;
}
export function stationBody(isHead,artVersion='legacy',level=1,platformArtCandidate=false){
 return `<svg aria-hidden="true" style="display:block;width:100%;height:40px;pointer-events:none" viewBox="-80 -40 200 80"><g transform="rotate(90)">${trainBody({x:0,y:-26,level},isHead,0,artVersion,0,platformArtCandidate)}</g></svg>`;
}
