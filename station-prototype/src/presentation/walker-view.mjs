import {knockView} from './knock-view.mjs';
// Battle owns animation time; no wall-clock or independent loop.
export function walkerView(e, time = 0) {
 const frame = e.knock ? 0 : Math.floor(Math.max(0, time) / .28 + (e.id || 0)) % 2;
 const scorpion=(e.id||0)%4===0;
 const asset=scorpion?'scorpion-basic':'infected';
 const width=scorpion?42:35,height=scorpion?50:41;
 const tilt=e.knock?18:frame?7:-7;
 return `${knockView(e)}<g data-enemy="walker" data-walk-frame="${frame}" transform="translate(${e.x},${e.y}) rotate(${e.angle || 0})">
 ${e.knock ? '<path d="M-19 -12l-12 -8M-20 0h-12" stroke="#fffdf4" stroke-width="3"/>' : ''}
 <image href="assets/style-v2/${asset}.png" x="${-width/2}" y="${-height/2}" width="${width}" height="${height}" transform="rotate(${tilt})"/></g>`;
}
