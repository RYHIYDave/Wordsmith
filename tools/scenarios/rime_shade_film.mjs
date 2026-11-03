// FLOOR 20'S RIME SHADE IN PLAY (game/act1_rules/rshade.ts, behind RIME_SHADE_ON: switched on here with __dbg.rimeShade), filmed for
// the owner before it goes live (his “In 25.0 too”, 3 Nov 2026). On floor 20's own ground, the knight in its biggest room, the
// Rime Shades set round him and left to the game's own rules; he is moved as a thumb would move him: standing, stepping out of the
// line, running away down it, three together, and striking one down. A picture every thirtieth of a second of the GAME's time
// (as veteran_film.mjs).
//   node tools/build_to.mjs dist/rs.html
//   node tools/playtest.mjs --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/rime_shade_film.mjs --file dist/rs.html --out shots/rsfilm/x
//   env: PARTS_ONLY (the parts' names, between bars: |)

const FPS = 30;
/**
 * The parts: how long, where the Rime Shades stand (tiles from him: along the way he runs, and to its side), and what he does
 * (seconds into the part: 'side' a step out to the side, 'run' away down the line, 'hit' at the nearest, 'still').
 */
const PLAN = [
  { name: 'ONE BREATHES; HE STANDS', line: 'The line is marked, the rime creeps down it, and where it reaches him he is frozen.', long: 6.2, foes: [[-4.2, 0]], does: [] },
  { name: 'HE STEPS OUT OF IT', line: 'Seeing the mark, he steps out to the side: the rime creeps past him.', long: 4.6, foes: [[-4.2, 0]], does: [[1.0, 'side', 0.36]] },
  { name: 'HE OUTRUNS IT', line: 'It creeps slower than he runs: away down the line, it never reaches him.', long: 4.6, foes: [[-2.6, 0]], does: [[1.4, 'run', 1.6]] },
  { name: 'THREE TOGETHER', line: 'Two or three to a pack: their lines cross. Frozen once, he is not frozen again at once.', long: 6.4, foes: [[-4.2, 0], [2.4, 3.6], [2.6, -3.4]], does: [] },
  { name: 'STRUCK DOWN', line: 'Struck, its frost cracks; killed, it comes apart into fog.', long: 4.2, foes: [[-1.3, 0]], does: [[0.1, 'hit', 4]], weak: true },
];

export default async function (page, snap) {
  const only = process.env.PARTS_ONLY ? process.env.PARTS_ONLY.split('|') : null;
  const plan = only ? PLAN.filter((p) => only.includes(p.name)) : PLAN;
  let at = 0;
  for (const p of plan) { p.at = at; at += p.long; }
  const seconds = at;
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.rimeShade.on = true; d.run('warrior', 77); d.seasoned(18); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  const room = await page.evaluate(() => {
    const D = window.__dbg;
    D.high(true, 20);
    const g = D.game();
    g.level.explored.fill(1);
    g.waveT = 1e9; D.bot(false);
    for (const q of g.monsters) q.dead = true;
    g.monsters = [];
    const f = g.level.floor;
    // (the room with the longest run of open floor across it, along x)
    let best = null;
    for (const r of f.rooms.filter((q) => q.kind !== 'boss')) {
      const y = r.y + r.h / 2;
      for (let x0 = r.x + 1; x0 < r.x + r.w - 1; x0 += 0.5) {
        let n = 0;
        while (g.isOpen(x0 + n, y) && n < 30) n += 0.25;
        if (!best || n > best.n) best = { n, x: x0, y };
      }
    }
    return best;
  });
  console.log('room', JSON.stringify(room));
  // (him five tiles in from the left end of that run, the Rime Shades to his left and round him)
  await page.evaluate(([plan, room]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const home = [room.x + 5.2, room.y];
    const f = { t: 0, film: -1, parts: plan.map((p) => ({ ...p, done: false })), ids: [], home, log: [], last: '' };
    window.__rf = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      if (d.fx) d.fx.messages.length = 0;
      h.life = h.d.maxLife;
      let cc = c;
      if (f.film >= 0) {
        const ft = f.t - f.film;
        for (const p of f.parts) {
          if (!p.done && p.at <= ft) {
            p.done = true;
            for (const id of f.ids) { const k = g.monsters.findIndex((m) => m.id === id); if (k >= 0) g.monsters.splice(k, 1); }
            f.ids = [];
            g.perils.length = 0;
            h.x = f.home[0]; h.y = f.home[1]; h.fx = -1; h.fy = 0; h.iceT = 0; h.slowT = 0;
            for (const [a, b] of p.foes) {
              const m = g.spawn('rshade', h.x + a, h.y + b, 970, 0, false, g.rng);
              g.wakeUp(m);
              m.seen = true;
              if (p.weak) { m.life = m.maxLife = 40; }
              const q = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / q; m.fy = (h.y - m.y) / q;
              f.ids.push(m.id);
            }
            f.part = p;
            p.start = ft;
          }
        }
        const p = f.part;
        if (p) {
          const pt = ft - p.start;
          const ms = g.monsters.filter((m) => f.ids.includes(m.id) && !m.dead);
          const near = ms.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
          cc = { ...c, mx: 0, my: 0, fire: false };
          if (near) { cc.aimX = near.x; cc.aimY = near.y; }
          for (const [s, what, long] of p.does) {
            if (pt < s || pt > s + long) continue;
            const line = g.perils.find((q) => q.a1 === 'rshade:line');
            const fx = line ? line.fx : 1; const fy = line ? line.fy : 0;
            if (what === 'side') { cc.mx = fy; cc.my = -fx; }
            if (what === 'run') { cc.mx = fx; cc.my = fy; }
            if (what === 'hit' && near) { cc.fire = true; }
          }
          const tag = `${p.name} ${ms.map((m) => (m.act ? m.act.id : m.state)).join(',')} ice ${(h.iceT ?? 0) > 0 ? 1 : 0}`;
          if (tag !== f.last) { f.log.push(`${pt.toFixed(2)} ${tag}`); f.last = tag; }
        }
      }
      return run(dt, cc);
    };
  }, [plan, room]);
  // (its pictures painted meanwhile)
  await page.waitForTimeout(4000);
  const c0 = await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1e-6; window.__rf.film = window.__rf.t; return d.clock(); });
  const slow = 0.05;
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 300000 });
    await snap(`f${String(i).padStart(4, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__rf.log)).join('\n'));
  console.log('PARTS ' + JSON.stringify(plan.map((p) => [p.at, p.name, p.line])));
}
