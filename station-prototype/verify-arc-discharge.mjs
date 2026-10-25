import assert from 'node:assert/strict';
import {hitView} from './src/presentation/weapon-feedback.mjs?v=arc-count-feedback6';

const state={t:0,upgrades:{arcDamage:0},weapons:[],effects:[{
 key:'arc',weaponId:'arc-head-1',targetId:7,damage:12,x:180,y:260,tx:310,ty:190,life:.22,
}]};
const first=hitView(state);
assert.match(first,/data-arc-discharge="plasma-v1"/);
assert.match(first,/data-arc-power-tier="base"/);
assert.match(first,/data-arc-layer="aura"/);
assert.match(first,/data-arc-layer="ion-channel"/);
assert.match(first,/data-arc-layer="hot-core"/);
assert.match(first,/data-arc-impact-flash="true"/);
assert.equal((first.match(/data-arc-chain-strand=/g)||[]).length,0);
assert.match(first,/data-arc-branch-count="0"/);
assert.ok((first.match(/L/g)||[]).length>=6,'arc is a segmented jagged channel, not a simple example polyline');

state.t=.025;
const animated=hitView(state);
assert.notEqual(animated,first,'arc path and dash phase respond to simulation time');

state.upgrades={arcDamage:1,arcReach:1,arcCount:1};
state.effects[0]={...state.effects[0],damage:18};
const highVoltage=hitView(state);
assert.match(highVoltage,/data-arc-power-tier="high-voltage"/);
assert.match(highVoltage,/data-arc-layer="aura"[^>]*stroke-width="17"/);
assert.match(highVoltage,/data-arc-layer="ion-channel"[^>]*stroke-width="9"/);
assert.match(highVoltage,/data-arc-layer="hot-core"[^>]*stroke-width="3\.1"/);

state.upgrades={arcReach:1};
state.effects[0]={...state.effects[0],damage:8,arcChainIndex:1,arcChainCount:3,arcCountLinked:false};
const baseChain=hitView(state);
assert.match(baseChain,/data-arc-power-tier="base"/,'extra chain targets do not falsely imply higher output power');
assert.match(baseChain,/data-arc-layer="ion-channel"[^>]*stroke-width="2\.8"/);
assert.match(baseChain,/data-arc-count-feedback="single-strand"/);
assert.doesNotMatch(baseChain,/data-arc-chain-transfer=/,'base chain hits keep the established effect');

state.upgrades={arcReach:1,arcCount:1};
state.effects[0]={...state.effects[0],life:.28,arcChainIndex:1,arcChainCount:5,arcCountLinked:true};
state.mountTrialCandidate=true;
state.weapons=[{id:'arc-head-1',carrier:'c1',x:500,y:500}];
const upgradedChain=hitView(state);
assert.match(upgradedChain,/data-arc-count-feedback="multilevel-branch"/);
assert.match(upgradedChain,/data-arc-chain-origin="previous-target"/);
assert.equal((upgradedChain.match(/data-arc-chain-branch="/g)||[]).length,2,'first continuation splits into two fine arcs');
assert.match(upgradedChain,/data-arc-branch-count="2"/);
assert.match(upgradedChain,/data-arc-chain-branch="1" data-arc-chain-branch-count="2"/);
assert.match(upgradedChain,/data-arc-chain-branch="1"[^>]*><path d="M180\.0 260\.0/,'branch fan begins at the preceding target');
assert.doesNotMatch(upgradedChain,/data-arc-chain-branch="1"[^>]*><path d="M500\./,'branch fan does not reset to the weapon muzzle');
assert.doesNotMatch(upgradedChain,/data-arc-layer="ion-channel"/,'branch fan replaces the single bolt rather than running parallel to it');

state.effects[0]={...state.effects[0],arcChainIndex:2};
const deeperChain=hitView(state);
assert.equal((deeperChain.match(/data-arc-chain-branch="/g)||[]).length,3,'each deeper level adds another fork');
state.effects[0]={...state.effects[0],arcChainIndex:4};
const deepestChain=hitView(state);
assert.equal((deepestChain.match(/data-arc-chain-branch="/g)||[]).length,5,'branch count stays bounded by the five-target chain cap');

state.upgrades={arcReach:1,arcCount:1};
state.effects[0]={...state.effects[0],arcChainIndex:0,arcCountLinked:false,life:.22};
const basePrimary=hitView(state);
assert.match(basePrimary,/data-arc-power-tier="base"/);
assert.match(basePrimary,/data-arc-layer="aura"[^>]*stroke-width="6"/);
assert.match(basePrimary,/data-arc-layer="ion-channel"[^>]*stroke-width="2\.8"/);
assert.match(basePrimary,/data-arc-layer="hot-core"[^>]*stroke-width="0\.9"/);
assert.doesNotMatch(basePrimary,/data-arc-chain-branch=/,'base primary is a single thin lightning path');

state.upgrades={arcDamage:1,arcReach:1,arcCount:1};
state.effects[0]={...state.effects[0],damage:18,pulse:'secondary',arcChainIndex:0,arcCountLinked:false};
const secondary=hitView(state);
assert.match(secondary,/data-arc-pulse="secondary"/);
assert.match(secondary,/data-arc-power-tier="high-voltage"/);
assert.match(secondary,/data-arc-layer="hot-core"/);
assert.equal((secondary.match(/data-arc-chain-branch=/g)||[]).length,0);
console.log('PASS: base arc is one fine strand; arcCount chains fork from prior impacts with depth-scaled branch counts.');
