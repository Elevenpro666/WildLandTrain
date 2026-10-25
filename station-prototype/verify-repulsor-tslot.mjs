import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createBattle} from './src/game/battle.mjs';
import {mountAssignments,mountPoint} from './src/game/mount-assignments.mjs';
import {weaponsView,hitView} from './src/presentation/weapon-feedback.mjs';
import {config} from './config.mjs';
import {repulsorField,repulsorContact,repulsorGroups} from './src/game/repulsor-field.mjs';

assert.equal(config.modules.find(module=>module.key==='repulsor').size,1);
const loadout={carriers:[{id:'head',level:0},{id:'c1',level:1}],equipment:[{...config.modules.find(module=>module.key==='repulsor'),id:'repulsor-test',carrier:'c1'}]};
const assignments=mountAssignments(loadout.carriers,loadout.equipment);
assert.deepEqual(assignments.get('repulsor-test'),[0]);
const battle=createBattle(loadout,1,{routeLength:9999,growth:{level:1,nextUpgrade:9999,experience:0,upgrades:{}}});
const initial=battle.snapshot(),weapon=initial.weapons[0],car=initial.cars.find(item=>item.id==='c1'),expected=mountPoint(car,0);
assert.equal(weapon.mountX,expected.x);assert.equal(weapon.mountY,expected.y);
const mountHtml=weaponsView({...initial,t:0});
assert.match(mountHtml,/data-mount="repulsor"/);assert.match(mountHtml,/data-repulsor-slot-base="shared-head-slot"/);assert.match(mountHtml,/data-repulsor-art="repulsor\.tslot\.basic"/);
const localField=repulsorField([car],56);
const visualHalfWidth=70*800/740/2,visualHalfHeight=70*875/740/2;
assert.equal(localField.left,car.x-visualHalfWidth,'field derives its left edge from the rendered car body');
assert.equal(localField.right,car.x+visualHalfWidth,'field derives its right edge from the rendered car body');
assert.equal(localField.top,car.y+26-visualHalfHeight,'field uses the rendered car centre offset, not the simulation anchor');
assert.equal(localField.bottom,car.y+26+visualHalfHeight,'field covers the rendered car bottom edge');
assert.equal(localField.reach,56-visualHalfWidth,'field reach is the configured radius minus the rendered car half-width');
assert.equal(repulsorContact({x:localField.centerX-54,y:car.y},localField).inside,true,'base repulsor covers its own car flank');
assert.equal(repulsorContact({x:localField.centerX-54,y:initial.cars[0].y},localField).inside,false,'base repulsor does not cover a different car');
const adjacentCars=[...initial.cars,{id:'c2',level:1,x:210,y:420}],adjacentWeapons=[weapon,{...weapon,id:'repulsor-2',carrier:'c2'}];
assert.equal(repulsorGroups(adjacentCars,adjacentWeapons,false,56).length,2,'without upgrade adjacent repulsors remain local');
const linkedGroups=repulsorGroups(adjacentCars,adjacentWeapons,true,56);
assert.equal(linkedGroups.length,1);assert.equal(linkedGroups[0].cars.length,2,'upgrade links only adjacent equipped cars');
let impact=null,state=null;
for(let index=0;index<1800&&!impact;index++){
 battle.step(1/60);state=battle.snapshot();impact=state.effects.find(effect=>effect.key==='repulsor');
}
assert.ok(impact,'repulsor should contact a ground target');
const target=state.enemies.find(enemy=>enemy.id===impact.targetId);
assert.ok(target?.repel,'target receives authoritative release movement');
assert.equal(target.hp,target.maxHp,'repulsor does not deal damage');
assert.match(hitView(state),/data-repulsor-field="contact-release"/);
assert.match(hitView(state),/data-repulsor-train-envelope="inner"/);
assert.match(hitView(state),/data-repulsor-energy-source=/);
assert.match(hitView(state),/data-field-reference="car-bounds"/);
assert.match(hitView(state),/data-repulsor-energy-conduit="nearest-wall"/);
assert.doesNotMatch(hitView(state),/data-repulsor-direction|marker-end|arrow/i);
console.log('PASS local base field, adjacent upgrade linkage, shared T-slot base, zero damage and energy-field feedback');

const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/11/.codex/skills/develop-web-game/node_modules/playwright');
const browser=await chromium.launch();
try{
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&platformArt=carV1&weaponTrial=repulsorTSlot&v=repulsor-trainfield2',{waitUntil:'networkidle'});
  const stationState=JSON.parse(await page.evaluate(()=>render_game_to_text()));
  assert.equal(stationState.shop.some(item=>item.key==='repulsor'),false,'trial module stays out of normal shop');
  assert.equal(stationState.equipment.filter(item=>item.key==='repulsor'&&item.carrier==='c1').length,1);
  await page.locator('[data-action="depart"]').click();
  await page.locator('[data-mount="repulsor"]').waitFor();
  assert.equal(await page.locator('[data-repulsor-slot-base="shared-head-slot"]').count(),1);
  let feedback=false;
  for(let attempt=0;attempt<120&&!feedback;attempt++){
   await page.evaluate(()=>advanceTime(100));
   feedback=await page.locator('[data-repulsor-field="contact-release"]').count()>0;
  }
  assert.equal(feedback,true,'live battle should render contact-release feedback');
  assert.equal(await page.locator('[data-repulsor-field-car]').count(),1,'base field stays on its own car');
  assert.equal(await page.locator('[data-repulsor-train-envelope]').count(),2);
  assert.equal(await page.locator('[data-repulsor-direction],[marker-end]').count(),0,'force-field feedback must not draw a direction arrow');
  await page.screenshot({path:`output/repulsor-tslot-${width}.png`,fullPage:true});

  await page.goto('http://127.0.0.1:4191/station-prototype/?art=approved&enemyArt=highrank&platformArt=carV1&weaponTrial=repulsorChain&v=repulsor-chain3',{waitUntil:'networkidle'});
  const linkedStation=JSON.parse(await page.evaluate(()=>render_game_to_text()));
  assert.equal(linkedStation.equipment.filter(item=>item.key==='repulsor'&&item.carrier).length,2);
  await page.locator('[data-action="depart"]').click();
  assert.equal(await page.locator('[data-mount="repulsor"]').count(),2);
  let linkedFeedback=false;
  for(let attempt=0;attempt<120&&!linkedFeedback;attempt++){
   await page.evaluate(()=>advanceTime(100));
   linkedFeedback=await page.locator('[data-repulsor-field-tier="linked"]').count()>0;
  }
  assert.equal(linkedFeedback,true,'adjacent upgraded repulsors should create a linked field');
  assert.equal(await page.locator('[data-repulsor-field-car]').count(),2);
  assert.equal(await page.locator('[data-repulsor-energy-source]').count(),2);
  assert.equal(await page.locator('[data-repulsor-energy-conduit="nearest-wall"]').count(),2,'each device connects only to its nearest car wall');
  assert.equal(await page.locator('[data-repulsor-energy-conduit="left"],[data-repulsor-energy-conduit="right"]').count(),0,'no device shoots a conduit across the far wall');
  const fieldBounds=await page.locator('[data-repulsor-field="contact-release"]').first().evaluate(node=>({reference:node.getAttribute('data-field-reference'),left:Number(node.getAttribute('data-field-left')),right:Number(node.getAttribute('data-field-right')),carLeft:Math.min(...[...node.querySelectorAll('[data-repulsor-field-car]')].map(car=>Number(car.getAttribute('data-field-left')))),carRight:Math.max(...[...node.querySelectorAll('[data-repulsor-field-car]')].map(car=>Number(car.getAttribute('data-field-right'))))}));
  assert.deepEqual(fieldBounds,{reference:'car-bounds',left:fieldBounds.carLeft,right:fieldBounds.carRight,carLeft:fieldBounds.carLeft,carRight:fieldBounds.carRight},'visible field bounds use protected car bodies as their coordinate reference');
  assert.equal(await page.locator('[data-repulsor-edge-flow][data-outline="chamfered-car"]').count(),2,'each protected car uses the same chamfered outer silhouette as the rendered body');
  assert.equal(await page.locator('[data-repulsor-train-envelope][data-outline="chamfered-car-union"]').count(),2,'linked field envelope follows the chamfered union silhouette');
  assert.equal(await page.locator('[data-repulsor-propagation="adjacent-cars"]').count(),1);
  assert.equal(await page.locator('[data-repulsor-direction],[marker-end]').count(),0);
  await page.screenshot({path:`output/repulsor-chain-${width}.png`,fullPage:true});
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS 320/390 live local/linked fields, edge-flow energy, arrow-free feedback and no page errors');
}finally{await browser.close();}
