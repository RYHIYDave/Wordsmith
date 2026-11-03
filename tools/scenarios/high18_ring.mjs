// THE QUEEN'S RING OF MIRRORS (his fifth for her, 30 Oct 2026), filmed for him: in her hall, nothing can kill the hero; she makes
// her ring twice. The first time he breaks two mirrors, then hers: she falls out, stunned. The second he breaks two, then waits:
// every mirror still whole strikes at once, and she steps out of hers. A picture every thirtieth of the game's second (STILLS=1:
// every half second).
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high18_ring.mjs --out shots/h18r/r
const FPS = 30;
const PARTS = [
  [0, 'THE RING OF MIRRORS', 'She goes into a glass; a ring of mirrors rises round you, her in every one.'],
  [5, 'FIND HER', 'Three blows break a mirror. Break hers: she falls out, stunned.'],
  [17, 'TOO SLOW', 'Every mirror still whole when time runs out strikes at once.'],
];
export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  const seconds = Number(process.env.SECONDS || 34);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 7); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 18);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.monsters.find((q) => q.kind === 'gqueen');
    for (const q of g.monsters) if (q !== m) q.dead = true;
    g.projectiles.length = 0;
    h.x = m.x + 4; h.y = m.y + 2;
    m.state = 'chase'; m.cd = 0.5;
    m.life = m.maxLife = 1e7; m.words = []; m.shield = 0;
    g.boss = m; g.bossMet = true;
    g.level.explored.fill(1);
    // (only her ring, as soon as it may be: the others held off)
    const f = { t: 0, round: 0, want: true, seen: false, next: 0 };
    window.__ring = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      // (only her ring, as soon as it may be, when it is wanted: her other blows held off)
      if (m.moveCd) for (let i = 0; i < m.moveCd.length; i++) if (i !== 4 || !f.want) m.moveCd[i] = Math.max(m.moveCd[i], i === 4 ? 0.5 : 99); else m.moveCd[i] = 0;
      const any = g.perils.find((q) => q.a1 === 'gqueen:ring');
      if (any && any.c !== 0 && !f.seen) { f.seen = true; f.round++; f.want = false; f.next = f.t + 2.6; }
      if (!any && !f.want && f.t > f.next) { f.want = true; f.seen = false; }
      const p = any && any.c === 0 ? any : null;
      if (p) {
        // (the mirrors as the rules lay them: round where he stood, turned by the peril's way)
        const R = 4.5; const n = 6; const a0 = Math.atan2(p.fy, p.fx);
        const spots = Array.from({ length: n }, (_, i) => ({ i, x: p.x + Math.cos(a0 + (i * Math.PI * 2) / n) * R, y: p.y + Math.sin(a0 + (i * Math.PI * 2) / n) * R }));
        const whole = spots.filter((s) => !(p.b & (1 << s.i)));
        const wrong = whole.filter((s) => s.i !== p.a);
        const broken = n - whole.length;
        // (first round: two wrong, then hers; second: two wrong, then he waits)
        const want = broken < 2 ? wrong[0] : f.round === 0 ? whole.find((s) => s.i === p.a) : null;
        if (want && p.t > 1.0) {
          const dx = want.x - h.x; const dy = want.y - h.y; const dist = Math.hypot(dx, dy);
          if (dist > 1.3) { c.mx = dx / dist; c.my = dy / dist; } else { c.fire = true; c.aimX = want.x; c.aimY = want.y; }
        }
      }
      return run(dt, c);
    };
  });
  snap.note('film', { fps: FPS, from: 0, parts: PARTS, size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 30 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'gqueen'); const p = g.perils.find((q) => q.a1 === 'gqueen:ring'); return `${m ? (m.act ? m.act.id + '@' + m.act.t.toFixed(1) : m.state) : 'gone'} ring ${p ? `t${p.t.toFixed(1)} b${p.b} c${p.c} real${p.a}` : '-'}`; }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; });
}
