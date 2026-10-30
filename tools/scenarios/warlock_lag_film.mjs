// THE WARLOCK'S LAG MENDED, filmed in real time for the owner (his word to the art chat, 30 Oct 2026: worst "Changing into the
// demon,Casting spells"). The worst case: straight into the practice room, nothing of his painted yet. A ring of skeletons that
// stand to be struck; he casts his bolt and his curse; his pact filled, he changes, and the demon fights. Real time, as played
// (the playtest's --video): his pictures are painted beside the game (render/painter.ts) as he plays.
//   node tools/playtest.mjs --file dist/warlock.html --size 1280x720 --video shots/lagfilm --scenario tools/scenarios/warlock_lag_film.mjs --out shots/lagfilm/l
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false);
    d.practice('warlock', 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    const h = g.hero;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2; const r = 2.4 + (i % 3) * 1.0;
      const m = g.spawn('skeleton', h.x + Math.cos(a) * r, h.y + Math.sin(a) * r, 7, 0, false, g.rng);
      m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 1e7; m.cd = 1e9; m.speed = 0;
      g.wakeUp(m);
    }
    const f = { t: 0, change: false };
    window.__lag = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      const ms = g.monsters.filter((q) => !q.dead);
      const m = ms[Math.floor(f.t * 0.9) % Math.max(1, ms.length)];
      if (m) {
        if (Math.floor(f.t * 2) % 2 === 0) { c.fire = true; c.aimX = m.x; c.aimY = m.y; }
        if (Math.floor(f.t / 3) !== Math.floor((f.t - dt) / 3)) { c.cast = true; c.castX = m.x; c.castY = m.y; }
      }
      if (f.change) { c.change = true; f.change = false; }
      return run(dt, c);
    };
  });
  const from = snap.videoAt();
  const size = await page.evaluate(() => [innerWidth, innerHeight]);
  const stats = [];
  const watch = (long) => page.evaluate((long) => new Promise((res) => {
    let n = 0; let worst = 0; let last = performance.now(); const t0 = last;
    const tick = (now) => { n++; worst = Math.max(worst, now - last); last = now; if (now - t0 < long * 1000) requestAnimationFrame(tick); else res({ fps: +(n / ((now - t0) / 1000)).toFixed(1), worst: Math.round(worst) }); };
    requestAnimationFrame(tick);
  }), long);
  stats.push(['man', await watch(16)]);
  await page.evaluate(() => { window.__dbg.game().hero.pact = 999; window.__lag.change = true; });
  stats.push(['change and demon', await watch(16)]);
  snap.note('film', { fps: 30, from, size, parts: [[0, 'THE WARLOCK, FIRST PLAYED', 'Nothing of his painted yet. He casts his bolt and his curse.'], [16, 'THE CHANGE', 'His pact full, he changes into the demon.'], [20, 'THE DEMON', 'The game runs on while his pictures are painted beside it.']] });
  console.log('stats', JSON.stringify(stats), 'painter frames', await page.evaluate(() => window.__dbg.painter.heroFrames));
}
