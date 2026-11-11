// IS THE GAME'S OWN PICTURE OF THE TOWN'S GLOWS THE SAME WHEN THE CAMERA MOVES BY WHOLE PIXELS? (It is not: render/still_glows.ts,
// "how near it is to what it was".) The town's steady glows drawn as the game draws them one by one (engine/px.ts drawGlow: each
// a small soft picture stretched without smoothing and added) on a black canvas at one camera, and again with the camera moved
// by whole game pixels; the two compared where both show the same part of the world. Measured 11 Nov 2026 on 25.3.1: moved one
// pixel, 17,239 of 1,420,848 colour values differ, by 4 of 255 at most; moved (7, 3), 32,886, by 5 at most.
//   node tools/playtest.mjs --file dist/<page>.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/town_glow_ties.mjs
import { log } from './lib.mjs';
export default async function (page) {
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.god = true; }, 'warrior');
  await page.waitForTimeout(6000);
  const out = await page.evaluate(() => {
    const d = window.__dbg; const R = d.renderer; const L = d.game().level; const main = document.querySelector('canvas');
    const lights = R.lookNow.lights(L).filter((q) => q.glow && q.still);
    const glows = new Map();
    const glowOf = (color) => { let cv = glows.get(color); if (cv) return cv; cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const c = cv.getContext('2d'); const m = /^#(..)(..)(..)$/.exec(color); const v = m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255]; const grd = c.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, `rgba(${v[0]},${v[1]},${v[2]},1)`); grd.addColorStop(0.45, `rgba(${v[0]},${v[1]},${v[2]},0.45)`); grd.addColorStop(1, `rgba(${v[0]},${v[1]},${v[2]},0)`); c.fillStyle = grd; c.fillRect(0, 0, 64, 64); glows.set(color, cv); return cv; };
    const W = main.width / 2, H = main.height / 2;
    const draw = (ox, oy) => {
      const c = document.createElement('canvas'); c.width = main.width; c.height = main.height;
      const g = c.getContext('2d', { alpha: false }); g.setTransform(2, 0, 0, 2, 0, 0); g.imageSmoothingEnabled = false;
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      for (const q of lights) { const gx = ox + (q.x - q.y) * 16 + (q.dx ?? 0); const gy = oy + (q.x + q.y) * 8 - q.up; g.globalAlpha = Math.max(0, Math.min(1, q.glow.a)); const r = q.glow.r; g.drawImage(glowOf(q.glow.color), gx - r, gy - r, r * 2, r * 2); }
      return g.getImageData(0, 0, c.width, c.height).data;
    };
    const w = main.width, h = main.height;
    const cmp = (A, B, dx, dy) => { // B drawn with the camera moved (dx, dy) game pixels: B's pixel (x + 2dx, y + 2dy) is A's (x, y)
      let n = 0, most = 0, seen = 0;
      for (let y = 0; y < h; y++) { const y2 = y + 2 * dy; if (y2 < 0 || y2 >= h) continue; for (let x = 0; x < w; x++) { const x2 = x + 2 * dx; if (x2 < 0 || x2 >= w) continue; const i = (y * w + x) * 4, j = (y2 * w + x2) * 4; for (let k = 0; k < 3; k++) { seen++; const v = Math.abs(A[i + k] - B[j + k]); if (v) { n++; if (v > most) most = v; } } } }
      return { n, most, seen };
    };
    const base = [238, -111];
    const A = draw(base[0], base[1]);
    const rows = [];
    for (const [dx, dy] of [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [7, 3], [-13, 5], [40, -20], [-64, 9]]) rows.push({ moved: [dx, dy], ...cmp(A, draw(base[0] + dx, base[1] + dy), dx, dy) });
    return { glows: lights.length, rows };
  });
  log('steady glows', out.glows);
  for (const r of out.rows) log(`camera moved ${r.moved}`, `${r.n} values differ of ${r.seen} (by ${r.most} at most)`);
}
