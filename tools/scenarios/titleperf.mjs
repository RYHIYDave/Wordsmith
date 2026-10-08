// How smoothly the starting screen runs: frames counted over two rounds of its change (the two
// paintings turn into each other, which is worked out as it is drawn).
//   THROTTLE=4  slows the browser's processor down four times, to stand in for a phone
//   SECS        how long to count (default 17: two rounds of 8.4 s)
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/titleperf.mjs --out shots/tp
export default async function (page, snap) {
  const throttle = Number(process.env.THROTTLE || 1);
  if (throttle > 1) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    console.log('processor slowed down by', throttle);
  }
  const secs = Number(process.env.SECS || 17);
  const r = await page.evaluate((s) => new Promise((res) => {
    let n = 0; let worst = 0; let last = performance.now(); const t0 = last; const gaps = [];
    const tick = (now) => {
      n++; const d = now - last; gaps.push(d); worst = Math.max(worst, d); last = now;
      if (now - t0 < s * 1000) requestAnimationFrame(tick);
      else {
        gaps.sort((a, b) => a - b);
        res({ fps: +(n / ((now - t0) / 1000)).toFixed(1), worstMs: +worst.toFixed(1), p95Ms: +gaps[Math.floor(gaps.length * 0.95)].toFixed(1), framesOver50ms: gaps.filter((g) => g > 50).length, frames: n });
      }
    };
    requestAnimationFrame(tick);
  }), secs);
  console.log('title frame rate', JSON.stringify(r));
  await snap('title');
}
