// THE CLASS CARDS' PACE: the start screen's NEW GAME pressed, and then for some seconds how long each frame took (the
// browser's own frames), to see whether the cards' heroes being painted hold the page up.
//   node tools/playtest.mjs --file <page> --scenario tools/scenarios/cards_fps.mjs --out shots/cards/x   env: SECS=8
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  const secs = Number(process.env.SECS || 8);
  const gaps = await page.evaluate((secs) => new Promise((done) => {
    const out = [];
    let last = performance.now();
    const t0 = last;
    const step = (now) => {
      out.push(now - last);
      last = now;
      if (now - t0 < secs * 1000) requestAnimationFrame(step);
      else done(out);
    };
    requestAnimationFrame(step);
  }), secs);
  const per = [];
  let t = 0;
  let k = 0;
  for (let s = 1; s <= secs; s++) {
    const inSec = [];
    while (k < gaps.length && t + gaps[k] <= s * 1000) { t += gaps[k]; inSec.push(gaps[k]); k++; }
    per.push(`${s}s: ${inSec.length} frames, longest ${Math.round(Math.max(0, ...inSec))} ms`);
  }
  console.log(per.join('\n'));
  await snap('cards');
}
