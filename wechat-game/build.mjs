import {build} from 'esbuild';
import {mkdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import sharp from 'sharp';
import {flatArt} from './src/flat-art.mjs';

const root=dirname(fileURLToPath(import.meta.url));
await build({entryPoints:[join(root,'src/main.mjs')],outfile:join(root,'game.js'),bundle:true,format:'iife',platform:'browser',target:'es2018',minify:false,logLevel:'info'});
const images={
 head:'style-v2/head.png',car:'style-v3-candidate/long-platform-car-v1.png',
 walker:'style-v2/infected.png',flyer:'style-v2/mosquito.png',
 elite:'style-v2/scorpion-elite.png',boss:'battle-state/iron-bearer-boss-v1.png',
 saw:'weapons/saw-basic-source-v1.png',arc:'weapons/arc-basic-source-v2.png',
 drone:'weapons/drone-bay-source-v1.png'
};
await mkdir(join(root,'assets'),{recursive:true});
const bounds={head:[150,280],car:[170,260],walker:[112,112],flyer:[112,112],elite:[142,142],boss:[220,220],saw:[96,96],arc:[96,96],drone:[96,96]};
let bytes=0;
for(const [name,source] of Object.entries(images)){
 const [width,height]=bounds[name],destination=join(root,'assets',name+'.png');
 const pipeline=flatArt[name]?sharp(Buffer.from(flatArt[name])).resize({width,height,fit:'inside'}):sharp(resolve(root,'../station-prototype/assets',source)).resize({width,height,fit:'inside',withoutEnlargement:true});
 await pipeline.png({palette:true,colours:256,compressionLevel:9,effort:6}).toFile(destination);
 bytes+=(await stat(destination)).size;
}
console.log(`微信小游戏验证包已生成：game.js + ${Object.keys(images).length} 件运行图（${Math.round(bytes/1024)} KB，源图未修改）`);
