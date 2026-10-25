import assert from 'node:assert/strict';
import {buildView} from './src/presentation/build-view.mjs';
assert.ok(!buildView({upgrades:{}}).includes('<details'));
const html=buildView({upgrades:{arcReach:1,arcCount:1,supply:3,sawDamage:0}});
assert.equal((html.match(/<details/g)||[]).length,2);
assert.equal((html.match(/data-build-card=/g)||[]).length,3);
assert.ok(html.includes('强化供能 ×3'));assert.ok(!html.includes('强化齿刃'));
assert.ok(html.includes('upgrade-arc-v1.svg'));assert.ok(html.includes('upgrade-supply-v1.svg'));
console.log('PASS build empty/owned only/grouped/stack/resource mapping');
