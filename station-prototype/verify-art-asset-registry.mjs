import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {artAssets,assetUrl} from './src/presentation/art-asset-registry.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const registryPath=fileURLToPath(new URL('./src/presentation/art-asset-registry.mjs',import.meta.url));
const requiredIds=[
 'train.head.platform','train.head.current','train.head.compat',
 'train.car.platform','train.car.current','train.car.level1V6','train.car.level2V6','train.car.level3V6','train.car.compat',
 'booster.rear.base','booster.rear.turbine','booster.rear.rocket',
 'booster.sidePod.integrated','booster.compat',
 'arc.emitter.basic','arc.emitter.advanced',
 'arc.upgrade.highVoltageCapacitor','arc.upgrade.pulseCapacitor',
 'arc.upgrade.reachConductor','arc.upgrade.chainInductionRings',
 'arc.emitter.highVoltageSingle','arc.emitter.highVoltageDual','arc.upgrade.reachAntenna',
 'arc.emitter.seed','arc.emitter.singleFork','arc.emitter.singleForkBasic'
];
const semanticBindings=[
 "platformArtCandidate?'train.head.platform':'train.head.current'",
 "platformArtCandidate?'train.car.platform':'train.car.current'",
 "const artId=isHead?'train.head.compat':'train.car.compat'",
 "rocket?'booster.rear.rocket':enhanced?'booster.rear.turbine':'booster.rear.base'",
 "assetUrl('booster.sidePod.integrated')",
 'assetUrl("booster.compat")',
 "basic:{url:assetUrl('arc.emitter.basic')",
 "advanced:{url:assetUrl('arc.emitter.advanced')",
 "assetUrl('arc.upgrade.highVoltageCapacitor')",
 "assetUrl('arc.upgrade.pulseCapacitor')",
 "assetUrl('arc.upgrade.reachConductor')",
 "@arc.upgrade.chainInductionRings",
 "@arc.emitter.highVoltageSingle",
 "@arc.emitter.highVoltageDual",
 "@arc.emitter.seed",
 "@arc.emitter.singleFork",
 "@arc.emitter.singleForkBasic",
 "assetUrl(file.slice(1))",
 "assetUrl('arc.upgrade.reachAntenna')"
];
const sourceFiles=[
 'src/presentation/train-body.mjs',
 'src/presentation/weapon-feedback.mjs',
 'src/presentation/arc-mount.mjs',
 'src/presentation/approved-art.mjs',
 'src/presentation/weapon-ornaments.mjs'
].map(file=>path.join(path.dirname(registryPath),'..','..',file));
const fail=message=>{console.error(`ART ASSET REGISTRY FAIL: ${message}`);process.exitCode=1;};
const ids=Object.keys(artAssets);
if(new Set(ids).size!==ids.length)fail('asset IDs are not unique');
for(const id of requiredIds)if(!artAssets[id])fail(`missing required ID ${id}`);
for(const [id,asset] of Object.entries(artAssets)){
 if(!/^[a-f0-9]{64}$/.test(asset.sha256))fail(`${id} has invalid SHA-256`);
 if(!['candidate','compatibility'].includes(asset.status))fail(`${id} has unsupported status ${asset.status}`);
 const resolved=path.resolve(path.dirname(registryPath),asset.path);
 const rel=path.relative(root,resolved);
 if(rel.startsWith('..')||path.isAbsolute(rel))fail(`${id} escapes project root: ${asset.path}`);
 try{
  const info=await stat(resolved);
  if(!info.isFile())throw new Error('not a regular file');
  const digest=createHash('sha256').update(await readFile(resolved)).digest('hex');
  if(digest!==asset.sha256)fail(`${id} content changed; update its recorded revision`);
 }catch(error){fail(`${id} missing/unreadable: ${error.message}`);}
 const url=new URL(assetUrl(id));
 if(url.searchParams.get('rev')!==asset.sha256.slice(0,16))fail(`${id} URL revision is not tied to its content hash`);
}
const sourceText=(await Promise.all(sourceFiles.map(file=>readFile(file,'utf8')))).join('\n');
const runtimeRoot=path.resolve(path.dirname(registryPath),'../..');
const moduleImportPairs=[
 ['src/presentation/train-body.mjs','src/presentation/art-asset-registry.mjs'],
 ['src/presentation/weapon-feedback.mjs','src/presentation/art-asset-registry.mjs'],
 ['src/presentation/arc-mount.mjs','src/presentation/art-asset-registry.mjs'],
 ['src/presentation/approved-art.mjs','src/presentation/art-asset-registry.mjs'],
 ['src/presentation/weapon-ornaments.mjs','src/presentation/art-asset-registry.mjs'],
 ['src/presentation/arc-mount.mjs','src/presentation/approved-art.mjs'],
 ['src/presentation/arc-mount.mjs','src/presentation/weapon-ornaments.mjs'],
 ['src/presentation/weapon-feedback.mjs','src/presentation/arc-mount.mjs'],
 ['src/presentation/weapon-feedback.mjs','src/presentation/weapon-ornaments.mjs'],
 ['src/presentation/drone-view.mjs','src/presentation/approved-art.mjs'],
 ['src/presentation/drone-view.mjs','src/presentation/weapon-ornaments.mjs'],
 ['src/presentation/loot-feedback.mjs','src/presentation/approved-art.mjs'],
 ['src/presentation/battle.mjs','src/presentation/approved-art.mjs'],
 ['src/presentation/battle.mjs','src/presentation/train-body.mjs'],
 ['src/presentation/battle.mjs','src/presentation/weapon-feedback.mjs'],
 ['src/presentation/view.mjs','src/presentation/train-body.mjs']
];
for(const [importer,target] of moduleImportPairs){
 const targetPath=path.join(runtimeRoot,target),importerPath=path.join(runtimeRoot,importer);
 const digest=createHash('sha256').update(await readFile(targetPath)).digest('hex').slice(0,16);
 const importerText=await readFile(importerPath,'utf8');
 const expectedSpecifier=`./${path.basename(target)}?rev=${digest}`;
 if(!importerText.includes(expectedSpecifier))fail(`${importer} must import ${target} with content revision ${digest}`);
}

for(const binding of semanticBindings)if(!sourceText.includes(binding))fail(`semantic asset binding changed or missing: ${binding}`);
for(const id of requiredIds)if(!sourceText.includes(`'${id}'`)&&!sourceText.includes(`"${id}"`)&&!sourceText.includes(`@${id}`))fail(`${id} is not referenced by runtime source`);
if(/美术设计\/(?:M11用户车头地表对照|M17同系列平台车厢|M21推进装置)\//.test(sourceText))fail('runtime source still contains direct paths into managed art folders');
if(/assets\/(?:style-v2\/head\.png|style-v3-candidate\/long-platform-car-v1\.png|weapons\/boost-module-v1-candidate\.png)/.test(sourceText))fail('runtime source still contains a direct path to a managed compatibility asset');
if(!process.exitCode)console.log(`ART ASSET REGISTRY PASS: ${ids.length} semantic IDs, current SHA-256 revisions, managed runtime paths migrated.`);
