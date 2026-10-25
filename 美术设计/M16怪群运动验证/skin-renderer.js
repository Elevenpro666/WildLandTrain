// 浏览器美术工具适配：仅改变RGB，保留透明度/尺寸/结构。
export function applySkin(image, skin) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  if (skin.offsets.every(row => row.every(v => v === 0))) return canvas;
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const d = pixels.data;
    if (!d[i + 3]) continue;
    const value = (.2126*d[i] + .7152*d[i+1] + .0722*d[i+2]) / 255 * 2;
    const lo = Math.min(1, Math.floor(value)), mix = value - lo;
    for (let k=0;k<3;k++) d[i+k] += skin.offsets[lo][k]*(1-mix) + skin.offsets[lo+1][k]*mix;
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}
