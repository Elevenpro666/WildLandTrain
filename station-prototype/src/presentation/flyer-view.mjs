import {knockView} from './knock-view.mjs';
// Both poses share one canvas size and body anchor; time comes from Battle only.
export function flyerView(e, time = 0) {
 const frame = e.knock ? 0 : Math.floor(Math.max(0, time) / 0.16 + (e.id || 0)) % 2;
 return `${knockView(e)}<g data-enemy="flyer" data-fly-frame="${frame}" data-enemy-id="${e.id || 0}" transform="translate(${e.x},${e.y}) rotate(${e.angle || 0})">
 ${e.knock ? '<path d="M-20 -8l-12 -6M-21 2h-12" stroke="#fffdf4" stroke-width="2"/>' : ''}
 <image href="assets/style-v2/mosquito.png" x="-22" y="-20" width="44" height="38" transform="scale(1 ${frame?0.9:1.05})"/></g>`;
}
