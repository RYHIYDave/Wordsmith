// THE GROUND AT A FLOOR'S START, MEASURED (the art chat, 20 Oct 2026): on coming onto each of DEPTHS, the test bot playing,
// how many of the ground's pieces on the screen are not painted yet (drawn as the floor's deep colour), frame by frame,
// for SECS seconds; with the page's CPU slowed THROTTLE times (a phone, roughly). Pictures at SNAP (ms, comma-separated).
export default async function (page, snap) {
  const depths = (process.env.DEPTHS ?? '11,12,13,14,15').split(',').map(Number);
  const secs = Number(process.env.SECS ?? 6);
  const rate = Number(process.env.THROTTLE ?? 1);
  const snaps = (process.env.SNAP ?? '').split(',').filter(Boolean).map(Number);
  const cdp = await page.context().newCDPSession(page);
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  // (the ground's worker started first and given time to come up, as it is for a hero who has come this far)
  await page.evaluate(() => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', 3);
    D.painter.warmGround();
  });
  await page.waitForTimeout(Number(process.env.WARM ?? 8000));
  for (const d of depths) {
    await page.evaluate(([d]) => {
      const D = window.__dbg;
      D.saving(false);
      D.run('warrior', 3);
      D.seasoned(20);
      D.god = true;
      D.act2(true, d);
      D.bot(true);
      window.__holes = [];
      const run = (window.__holesRun = (window.__holesRun ?? 0) + 1);
      const t0 = performance.now();
      const step = () => {
        if (window.__holesRun !== run) return;
        const R = D.renderer;
        const o = R.outdoor;
        const cam = R.cam;
        const W = D.screen.w;
        const H = D.screen.h;
        let miss = 0;
        let all = 0;
        if (o && o.pieces) {
          const P = 128;
          const x0 = -cam.ox * 2, y0 = -cam.oy * 2;
          const i0 = Math.floor(x0 / P), j0 = Math.floor(y0 / P), i1 = Math.floor((x0 + W * 2) / P), j1 = Math.floor((y0 + H * 2) / P);
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
            all++;
            if (!o.pieces.has((i + 4096) * 8192 + (j + 4096))) miss++;
          }
        }
        window.__holes.push([Math.round(performance.now() - t0), miss, all, o?.stats?.pieces ?? 0, o?.stats?.worker ?? 0]);
        if (performance.now() - t0 < 1000 * 30) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, [d]);
    let was = 0;
    for (const s of snaps) {
      await page.waitForTimeout(s - was);
      was = s;
      await snap(`f${d}_${s}`);
    }
    await page.waitForTimeout(Math.max(0, secs * 1000 - was));
    const holes = await page.evaluate(() => window.__holes.splice(0));
    const worst = holes.reduce((m, h) => Math.max(m, h[1]), 0);
    const withHoles = holes.filter((h) => h[1] > 0);
    const last = withHoles.length ? withHoles[withHoles.length - 1][0] : 0;
    const frames = holes.length;
    const gaps = holes.slice(1).map((h, i) => h[0] - holes[i][0]);
    const slow = gaps.filter((g) => g > 50).length;
    console.log(`  floor ${d}: ${frames} frames in ${secs} s (${slow} over 50 ms, longest ${Math.max(...gaps)} ms); frames with holes ${withHoles.length}, most ${worst} of ${holes[0]?.[2]} pieces, last at ${last} ms; painted ${holes[holes.length - 1]?.[3]} (worker ${holes[holes.length - 1]?.[4]})`);
    console.log('   ', holes.filter((h, i) => i % Number(process.env.EVERY ?? 15) === 0).map((h) => `${h[0]}:${h[1]}`).join(' '));
  }
}
