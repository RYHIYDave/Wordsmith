// WHAT THE TOWN DRAWS A FRAME, BY WHO ASKED: a new game begun as town_lag begins one, the hero standing in town; every drawImage
// (and fillRect, fill, stroke, putImageData) of N frames (30) counted with the game function that called it and the area it covers
// (in screens: 1 is every pixel of the screen once), the largest first. WALK=KeyD: walking that way meanwhile. Measured 11 Nov
// 2026 on 25.3.1: 714 pictures a frame covering 17.5 screens, 67 of them glows covering 11; with render/still_floor.ts,
// still_glows.ts and still_dark.ts: 367 pictures covering 6.1 screens.
//   node tools/playtest.mjs --file dist/<page>.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/town_draws.mjs
import { makeHands, log } from './lib.mjs';
import { writeFileSync } from 'node:fs';
export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press(`class:${process.env.CLS || 'warrior'}`, 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!window.__dbg.game())) break; await page.waitForTimeout(100); }
  await page.waitForTimeout(8000);
  if (process.env.WALK) { await page.keyboard.down(process.env.WALK); await page.waitForTimeout(1500); }
  const out = await page.evaluate(async (N) => {
    const screen = document.querySelector('canvas');
    const P = CanvasRenderingContext2D.prototype;
    const rows = new Map();
    const note = (ctx, kind, area, extra) => {
      const st = new Error().stack.split('\n').slice(3, 9).map((s) => (s.match(/at (?:Object\.|new )?([\w$.<>]+)/) || [, '?'])[1]);
      const who = st.slice(0, Number(window.__depth || 3)).join(' < ');
      const where = ctx.canvas === screen ? 'screen' : `other ${ctx.canvas.width}x${ctx.canvas.height}`;
      const k = `${kind} | ${where === 'screen' ? 'screen' : 'other'} | ${who}${extra ? ' | ' + extra : ''}`;
      const r = rows.get(k) || { n: 0, px: 0 }; r.n++; r.px += area; rows.set(k, r);
    };
    const di = P.drawImage, fr = P.fillRect, fl = P.fill, sk = P.stroke, pi = P.putImageData, gi = P.getImageData, cr = P.clearRect;
    P.drawImage = function (img, ...a) {
      const t = this.getTransform(); const sc = Math.abs(t.a * t.d - t.b * t.c);
      const area = (a.length >= 8 ? a[6] * a[7] : a.length >= 4 ? a[2] * a[3] : (img.width || 0) * (img.height || 0)) * sc;
      const ex = [this.globalCompositeOperation !== 'source-over' ? this.globalCompositeOperation : '', this.globalAlpha !== 1 ? 'alpha' : '', this.filter && this.filter !== 'none' ? 'filter' : '', (t.b || t.c) ? 'turned' : '', this.imageSmoothingEnabled && (Math.abs(t.a) !== Math.round(Math.abs(t.a)) || (a.length >= 8 && (a[2] !== a[6] || a[3] !== a[7]))) ? 'smooth-scaled' : ''].filter(Boolean).join(',');
      note(this, 'drawImage', Math.abs(area), ex);
      return di.call(this, img, ...a);
    };
    P.fillRect = function (...a) { const t = this.getTransform(); note(this, 'fillRect', Math.abs(a[2] * a[3] * (t.a * t.d - t.b * t.c)), this.globalCompositeOperation !== 'source-over' ? this.globalCompositeOperation : ''); return fr.apply(this, a); };
    P.fill = function (...a) { note(this, 'fill', 0, ''); return fl.apply(this, a); };
    P.stroke = function (...a) { note(this, 'stroke', 0, ''); return sk.apply(this, a); };
    P.putImageData = function (...a) { note(this, 'putImageData', a[0].width * a[0].height, ''); return pi.apply(this, a); };
    P.getImageData = function (...a) { note(this, 'getImageData', a[2] * a[3], ''); return gi.apply(this, a); };
    P.clearRect = function (...a) { note(this, 'clearRect', 0, ''); return cr.apply(this, a); };
    let frames = 0;
    await new Promise((ok) => { const tick = () => { if (++frames > N) ok(); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    P.drawImage = di; P.fillRect = fr; P.fill = fl; P.stroke = sk; P.putImageData = pi; P.getImageData = gi; P.clearRect = cr;
    const g = window.__dbg.game();
    return { frames: N, screen: [screen.width, screen.height], css: [screen.style.width, screen.style.height, screen.style.transform], dpr: devicePixelRatio, town: g.level.town, size: [g.level.w, g.level.h], rows: [...rows.entries()].map(([k, v]) => ({ k, n: v.n / N, px: v.px / N })) };
  }, Number(process.env.N || 30));
  if (process.env.WALK) await page.keyboard.up(process.env.WALK);
  const spx = out.screen[0] * out.screen[1];
  log('screen canvas', `${out.screen.join('x')} css ${out.css.join(' ')} dpr ${out.dpr}; town ${out.town} ${out.size}`);
  const tot = (f) => out.rows.filter(f).reduce((a, r) => [a[0] + r.n, a[1] + r.px], [0, 0]);
  const S = tot((r) => r.k.startsWith('drawImage | screen')); const O = tot((r) => r.k.startsWith('drawImage | other'));
  log('a frame', `on the screen ${S[0].toFixed(0)} pictures covering ${(S[1] / spx).toFixed(2)} screens; elsewhere ${O[0].toFixed(0)} pictures, ${(O[1] / spx).toFixed(2)} screens`);
  const rows = out.rows.sort((a, b) => b.px - a.px || b.n - a.n);
  if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(out, null, 1));
  for (const r of rows.slice(0, Number(process.env.TOP || 60))) console.log(`${r.n.toFixed(1).padStart(7)}  ${(r.px / spx).toFixed(3).padStart(7)} scr  ${r.k}`);
  await snap('draws');
}
