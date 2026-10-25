// Generic Jimeng image generator via Playwright CDP.
// usage: node gen-image.mjs "<prompt>" <outfile> [extra...]
import { chromium } from 'playwright-core';
import fs from 'fs';

const prompt = process.argv[2];
const outFile = process.argv[3];
if (!prompt || !outFile) { console.error('usage: node gen-image.mjs "<prompt>" <outfile>'); process.exit(1); }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
let page = ctx.pages().find((p) => /jimeng|jianying/.test(p.url())) || ctx.pages()[0];
await page.bringToFront();

// dismiss any promo modal
for (const b of await page.locator('.lv-modal-close-icon').all()) {
  if (await b.isVisible()) { try { await b.click({ timeout: 3000 }); } catch {} }
}

// capture current result srcs (to detect the NEW generation)
const before = new Set(await page.evaluate(() => {
  const out = [];
  for (const im of document.querySelectorAll('img')) { const s = im.currentSrc || im.src || ''; if (/dreamina-sign/.test(s)) out.push(s); }
  return out;
}));

// ensure prompt filled in the main editor
let eBox = null, main = null;
const editors = await page.locator('[contenteditable="true"]').all();
for (const e of editors) {
  const box = await e.boundingBox();
  if (box && box.width > 500 && box.height > 40) { eBox = box; main = e; break; }
}
if (!eBox) { console.error('NO_EDITOR'); process.exit(1); }
await main.click({ timeout: 8000 });
await page.keyboard.press('ControlOrMeta+a');
await page.keyboard.press('Backspace');
await page.keyboard.type(prompt, { delay: 10 });
await page.waitForTimeout(1200);

// click generate (primary-circle button at editor right)
let clicked = false;
for (const b of await page.locator('button').all()) {
  const cls = (await b.getAttribute('class') || '').toString();
  if (!/lv-btn-primary/i.test(cls)) continue;
  const box = await b.boundingBox();
  if (!box || box.width < 20) continue;
  if (box.x >= eBox.x + eBox.width - 140 && box.x <= eBox.x + eBox.width + 90 && box.y >= eBox.y - 60 && box.y <= eBox.y + 200) {
    await b.click({ force: true });
    clicked = true; break;
  }
}
if (!clicked) { console.error('NO_GEN_BUTTON'); process.exit(1); }
console.log('generation submitted...');

// poll until "生成中" status clears (max ~150s)
let done = false;
for (let i = 0; i < 50; i++) {
  await page.waitForTimeout(3000);
  const body = await page.evaluate(() => (document.body?document.body.innerText:''));
  if (!/生成中|正在生成|排队/.test(body)) { done = true; console.log('status cleared at poll', i); break; }
}
if (!done) console.log('timeout waiting; trying anyway');
await page.waitForTimeout(3000);

// collect NEW result srcs
const now = await page.evaluate(() => {
  const out = [];
  for (const im of document.querySelectorAll('img')) { const s = im.currentSrc || im.src || ''; if (/dreamina-sign/.test(s)) out.push(s); }
  return out;
});
const fresh = now.filter((s) => !before.has(s));
const pick = fresh.length ? fresh : now.filter((s) => { const m = s.match(/resize:(\d+):(\d+)/); return m && m[1] > 100 && m[2] > 100; });
if (!pick.length) { console.error('NO_RESULT_IMG'); process.exit(1); }
console.log('result count:', pick.length);

let i = 0;
for (const s of pick.slice(0, 4)) {
  i++;
  const resp = await ctx.request.get(s, { headers: { Referer: 'https://jimeng.jianying.com/', Origin: 'https://jimeng.jianying.com' }, timeout: 30000 });
  if (resp.status() !== 200) { console.log(`[${i}] HTTP ${resp.status()}`); continue; }
  const buf = await resp.body();
  const ext = (s.match(/\.(webp|png|jpg|jpeg)/i) || [, 'webp'])[1].toLowerCase();
  const f = i === 1 ? outFile : outFile.replace(/(\.[A-Za-z0-9]+)$/, `-${i}$1`);
  fs.writeFileSync(f, buf);
  console.log('saved', f, buf.length, 'bytes');
}
await browser.close();
