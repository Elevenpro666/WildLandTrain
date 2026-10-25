// 纯SVG描述；锚定车头，跟随同一出站镜头，不拥有血量或计时。
export function healthView(s){
 const head=s.cars[0];
 if(!head||!Number.isFinite(s.hp)||!Number.isFinite(s.maxHp)||s.maxHp<=0)return '';
 const ratio=Math.max(0,Math.min(1,s.hp/s.maxHp)),height=64;
 const color=ratio<=.25?'#c87959':'#88b5a4';
 return `<g data-train-health role="meter" aria-label="整列耐久" aria-valuemin="0" aria-valuemax="${s.maxHp}" aria-valuenow="${Math.max(0,s.hp)}" pointer-events="none" transform="translate(${head.x-42},${head.y-27})"><rect width="7" height="${height}" rx="3" fill="#42463d"/><rect data-health-fill x="2" y="${2+(height-4)*(1-ratio)}" width="3" height="${(height-4)*ratio}" rx="1" fill="${color}"/></g>`;
}
