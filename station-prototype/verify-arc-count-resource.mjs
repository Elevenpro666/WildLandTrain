import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {arcMounts} from './src/presentation/arc-mount.mjs?v=arc-count-induction1';
import {hitView} from './src/presentation/weapon-feedback.mjs?v=arc-emitter-flush1';
import {weaponStats,initialUpgrades} from './src/game/upgrades.mjs';

const group={carrier:'head',count:4,x:210,y:260};
const upgrades={...initialUpgrades(),arcReach:1,arcCount:1};
const state={artVersion:'approved',mountTrialCandidate:true,mountArtTier:'basic',upgrades,t:0,
 weapons:Array.from({length:4},(_,index)=>({id:`arc-${index}`,key:'arc',carrier:'head'}))};
const markup=arcMounts(group,state);
const count=needle=>markup.split(needle).length-1;
assert.equal(count('data-mount="arc"'),4);
assert.equal(count('data-approved="arcCountUpgrade"'),4,'chain-capacity upgrade layers reinforced weapon-shaped jaws on each unchanged base body');
assert.equal(count('data-approved="arcForkBasic"'),4,'upgraded arc preserves the existing body silhouette and attack ends');
assert.equal(count('width="18" height="12.631578947368421"'),8,'each upgraded arc body plus its overlay preserves the basic asset ratio within one T slot');
assert.equal(count('data-arc-art-tier="induction-rings"'),4);
assert.equal(count('data-arc-distributor'),0,'rejected five-port hardware must not be rendered');
assert.equal(count('arc-fiveway-distributor-v1.svg'),0);
assert.equal(count('data-arc-conductor="extended"'),0,'the arcCount body contains the longitudinal conductor inside its slot instead of adding an overhanging reach part');
assert.deepEqual(weaponStats('arc',upgrades),{damage:12,chainDamage:8,interval:1,range:120,jump:90,count:5,pulse:false});
const fittedMarkup=arcMounts(group,{...state,mountTrialCandidate:false});
assert.equal(fittedMarkup.split('data-approved="arcCountUpgrade"').length-1,4,'regular layout layers the same reinforced fork jaws');
assert.equal(fittedMarkup.split('data-approved="arcForkBasic"').length-1,4,'regular layout preserves the base arc body');
assert.equal(fittedMarkup.split('width="18" height="12.631578947368421"').length-1,8,'regular mounted arc bodies and overlays preserve the basic asset ratio');
assert.equal(fittedMarkup.split('data-arc-distributor').length-1,0,'regular layout also excludes the rejected hardware');
const basicMarkup=arcMounts(group,{...state,upgrades:{...initialUpgrades(),arcReach:1,arcCount:0}});
assert.equal(basicMarkup.split('data-approved="arcCountUpgrade"').length-1,0,'base arc keeps its existing art without upgrade hardware');
assert.equal(basicMarkup.split('data-approved="arcForkBasic"').length-1,4,'base arc emitter count and art remain unchanged');
const manifest=JSON.parse(await readFile(new URL('./assets/weapons/weapon-assets-manifest.json',import.meta.url),'utf8'));
assert.ok(!manifest.assets.some(asset=>asset.id==='arc-fiveway-distributor-v1'));
const compareState={...state,arcCountArtComparison:true,weapons:[{id:'arc-a',key:'arc',carrier:'c1'},{id:'arc-b',key:'arc',carrier:'c1'}]};
const compareMarkup=arcMounts({carrier:'c1',count:2,x:210,y:345},compareState);
assert.equal(compareMarkup.split('data-mount="arc"').length-1,2,'comparison presents exactly two arcs on the same car');
assert.equal(compareMarkup.split('data-approved="arcForkBasic"').length-1,2,'both comparison bodies share the same original base art');
assert.equal(compareMarkup.split('data-approved="arcCountUpgrade"').length-1,1,'comparison includes one reinforced fork muzzle');
assert.equal(compareMarkup.split('width="18" height="12.631578947368421"').length-1,3,'both body sprites and the upgrade overlay use the same dimensions and source ratio');
assert.equal(compareMarkup.split('overflow="hidden"').length-1,6,'both bodies and overlay clip to the exact same display envelope at both SVG levels');
const compareSlots=[...compareMarkup.matchAll(/data-arc-art-tier="(comparison-base|induction-rings)"[^>]*transform="translate\(([^,]+),([^\)]+)\)/g)];
assert.equal(compareSlots.length,2);
assert.notEqual(compareSlots[0][2],compareSlots[1][2],'base and upgrade occupy separate adjacent T pads');
assert.equal(compareSlots[0][3],compareSlots[1][3],'base and upgrade share a row for direct visual comparison');
const mixedArcMarkup=arcMounts({carrier:'c1',count:1,x:210,y:345},{...state,upgrades:{...initialUpgrades(),arcDamage:1},weapons:[
 {id:'mixed-saw',key:'saw',carrier:'c1'},
 {id:'mixed-arc',key:'arc',carrier:'c1'},
 {id:'mixed-boost',key:'boost',carrier:'c1'},
]});
assert.match(mixedArcMarkup,/data-mount="arc"[^>]*transform="translate\(200,358\) scale\(-1,1\)"/,'mixed-loadout arc body is centered on its first car T pad');
assert.match(mixedArcMarkup,/data-arc-capacitor-tier="1" transform="translate\(0,0\)"/,'high-voltage module stays centered on the arc body and T pad');
const mixedArcEffect=hitView({...state,mountTrialCandidate:true,upgrades:{...initialUpgrades(),arcDamage:1},
 weapons:[{id:'mixed-arc',key:'arc',carrier:'c1',x:210,y:345}],
 effects:[{key:'arc',weaponId:'mixed-arc',targetId:'enemy-1',damage:18,x:210,y:370,tx:290,ty:220,life:.2}]});
assert.match(mixedArcEffect,/data-arc-emitter-flash="true" cx="198" cy="358"/,'high-voltage strike begins within the installed emitter mouth');
assert.ok(manifest.assets.some(asset=>asset.id==='arc-count-induction-rings-v2'&&asset.path==='arc-count-induction-rings-v2.svg'&&asset.displaySizeSceneUnits[0]===18&&asset.displaySizeSceneUnits[1]<=20));
const art=await readFile(new URL('./assets/weapons/arc-count-induction-rings-v2.svg',import.meta.url),'utf8');
assert.match(art,/<svg[^>]*viewBox="0 0 570 400"/);
assert.match(art,/data-art-part="arcCount-induction-ring-stack"/);
assert.equal((art.match(/data-induction-ring="[123]"/g)||[]).length,3,'the upgrade adds exactly three visible conductive rings');
assert.doesNotMatch(art,/<image\s+href=/,'overlay remains self-contained so the game safely layers it over the unchanged base PNG');
assert.equal((art.match(/<ellipse /g)||[]).length,12,'each ring has dark structural, metal, copper and highlight layers');
const oldManifest=manifest.assets.find(asset=>asset.id==='arc-count-branch-overlay-v2');
assert.equal(oldManifest.approval,'rejected by player visual review; retained as history, not used by the game');
const forkDraft=manifest.assets.find(asset=>asset.id==='arc-count-fork-jaw-v1');
assert.equal(forkDraft.approval,'not used; superseded by player direction for stacked induction rings');
await assert.rejects(access(new URL('./assets/weapons/arc-count-longitudinal-v1.svg',import.meta.url)),{code:'ENOENT'});
await assert.rejects(access(new URL('./assets/weapons/arc-count-branch-channel-v2.svg',import.meta.url)),{code:'ENOENT'});
await assert.rejects(access(new URL('./assets/weapons/arc-fiveway-distributor-v1.svg',import.meta.url)),{code:'ENOENT'});
console.log('PASS: base art remains unchanged; T-pad body and high-voltage part align; discharge begins at emitter edge; arcCount remains intact.');
