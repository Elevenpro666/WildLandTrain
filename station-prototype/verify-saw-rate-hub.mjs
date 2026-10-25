import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sawMount} from './src/presentation/saw-mount.mjs';
import {weaponStats} from './src/game/upgrades.mjs';

const wheels=Array.from({length:2},(_,slot)=>sawMount({x:210,y:345},{t:.2,weaponSkinId:'blue',upgrades:{sawRate:1}},slot,2)).join('');
const base=Array.from({length:2},(_,slot)=>sawMount({x:210,y:345},{t:.2,weaponSkinId:'blue',upgrades:{}},slot,2)).join('');
assert.equal((wheels.match(/data-saw-drive-hub="high-speed"/g)||[]).length,4,'one drive hub per physical saw');
assert.equal((base.match(/data-saw-drive-hub=/g)||[]).length,0,'base saw has no high-speed hub');
assert.equal((wheels.match(/data-saw-spin-speed="1800"/g)||[]).length,4,'all upgraded blades retain the existing faster rotation');
assert.equal((base.match(/data-saw-spin-speed="1200"/g)||[]).length,4,'base rotation remains unchanged');
assert.equal(weaponStats('saw',{sawDamage:1,sawRate:1}).interval,.35,'existing attack interval is unchanged');
assert.equal(weaponStats('saw',{sawDamage:1}).interval,.5,'base attack interval is unchanged');
const svg=await readFile(new URL('./assets/weapons/saw-high-speed-hub-v1.svg',import.meta.url),'utf8');
assert.match(svg,/<svg[^>]+viewBox="0 0 24 24"/);
assert.doesNotMatch(wheels,/saw-drive-v1\.svg/,'old floating gear icon is no longer referenced');
console.log('PASS: high-speed drive hardware is fitted to all four real saw hubs; base/upgraded speed values are unchanged.');
