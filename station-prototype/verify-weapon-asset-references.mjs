import assert from 'node:assert/strict';
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {artAssets} from './src/presentation/art-asset-registry.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(readFileSync(path.join(root,'assets/weapons/weapon-assets-manifest.json'),'utf8'));
const sources=['src','configs'].flatMap(directory=>walk(path.join(root,directory)));
const refs=new Set();
const registryDir=path.join(root,'src/presentation');
for(const asset of Object.values(artAssets)){
 const relative=path.relative(root,path.resolve(registryDir,asset.path)).replaceAll(path.sep,'/');
 if(relative.startsWith('assets/weapons/'))refs.add(relative);
}
const refPattern=/assets\/weapons\/[A-Za-z0-9_./-]+\.(?:png|svg|webp)/g;
for(const file of sources){
 for(const ref of readFileSync(file,'utf8').match(refPattern)||[])refs.add(ref);
}

const resourceRoot=path.resolve(root,'assets/weapons');
const ids=new Set(),paths=new Set();
for(const asset of manifest.assets){
 assert.ok(asset.id&&asset.path,`Asset requires id and path: ${JSON.stringify(asset)}`);
 assert.ok(!ids.has(asset.id),`Duplicate weapon asset id: ${asset.id}`);ids.add(asset.id);
 assert.ok(!paths.has(asset.path),`Duplicate weapon asset path: ${asset.path}`);paths.add(asset.path);
 assert.match(asset.path,/^assets\/weapons\//,`Manifest paths must be rooted under assets/weapons: ${asset.path}`);
 assert.ok(!/rejected|superseded|not used/i.test(asset.approval||''),`Retired art must not be in the active manifest: ${asset.id}`);
 const resolvedPath=path.resolve(root,asset.path);
 assert.ok(resolvedPath.startsWith(resourceRoot+path.sep),`Manifest asset must remain inside assets/weapons: ${asset.path}`);
 assert.ok(statSync(resolvedPath).isFile(),`Manifest asset is missing: ${asset.path}`);
}
for(const ref of refs){
 assert.ok(paths.has(ref),`Runtime weapon asset is not registered: ${ref}`);
 assert.ok(statSync(path.join(root,ref)).isFile(),`Runtime weapon asset is missing: ${ref}`);
}
for(const assetPath of paths)assert.ok(refs.has(assetPath),`Manifest entry is not used by runtime source; remove it or add its consumer: ${assetPath}`);

const retiredFiles=['arc-count-branch-overlay-v2.svg','arc-count-fork-jaw-v1.svg','arc-count-induction-rings-v1.svg'];
for(const filename of retiredFiles)assert.ok(!statSafe(path.join(root,'assets/weapons',filename)),`Retired weapon art must not be restored silently: ${filename}`);

console.log(`PASS ${refs.size} runtime weapon asset references match ${paths.size} registered files; no retired arc variants remain`);

function walk(directory){
 return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  const target=path.join(directory,entry.name);
  if(entry.isDirectory())return walk(target);
  return /\.(?:mjs|js|cjs)$/.test(entry.name)?[target]:[];
 });
}
function statSafe(file){
 try{return statSync(file).isFile();}catch(error){if(error.code==='ENOENT')return false;throw error;}
}
