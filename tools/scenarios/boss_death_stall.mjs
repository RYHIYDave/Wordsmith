// THE STALL AS A BOSS DIES (the queue's fix-boss-death-stall-and-rime-shade): on each floor asked for, the hero set by its boss, the
// boss's life run down by the rules' own hand over FIGHT seconds (as a fight would), then killed; every frame's time from the
// first blow to AFTER seconds past his death, and where the time went in the seconds round it (a profile of the page).
//   FLOORS=4,10,15,20   FIGHT=10   AFTER=5   PROFILE=1 (where the time went, the longest frames' own)
//   node tools/build_to.mjs dist/now.html
//   FLOORS=4 node tools/playtest.mjs --file dist/now.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/boss_death_stall.mjs --out shots/bds/x
import { log } from './lib.mjs';

export default async function (page, snap) {
  const floors = (process.env.FLOORS || '4,10,15,20').split(',').map(Number);
  const fight = Number(process.env.FIGHT || 10);
  const after = Number(process.env.AFTER || 5);
  const profile = process.env.PROFILE !== '0';
  const cdp = profile ? await page.context().newCDPSession(page) : null;
  if (cdp) {
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  }
  const out = [];
  for (const n of floors) {
    await page.evaluate((n) => {
      const d = window.__dbg;
      d.saving(false);
      d.run('warrior', 41 + n);
      d.seasoned(Math.min(40, 4 + 2 * n));
      d.autoLevel = false; d.autoWords = false; d.god = true;
      d.high(true, n);
    }, n);
    // (the loading screen and the floor's first pictures)
    await page.waitForTimeout(9000);
    // (READY=1: as a floor is played, the boss is come to long after the floor is: his pictures all painted ahead first, up to READY_MAX s)
    if (process.env.READY === '1') {
      const most = Number(process.env.READY_MAX || 150);
      let ok = 0;
      let waited = 0;
      for (; waited < most && ok < 3; waited++) {
        await page.waitForTimeout(1000);
        const left = await page.evaluate(() => {
          const d = window.__dbg;
          const b = d.game().monsters.find((m) => m.boss && !m.dead);
          const p = d.painter;
          return b ? { main: p.left(b.kind), side: p.sideLeft(b.kind) } : null;
        });
        ok = left && left.main === 0 && left.side === 0 ? ok + 1 : 0;
      }
      log(`floor ${n}`, `waited ${waited} s for his pictures (${ok >= 3 ? 'all painted' : 'not all painted'})`);
    }
    const set = await page.evaluate(() => {
      const d = window.__dbg;
      const g = d.game();
      const b = g.monsters.find((m) => m.boss && !m.dead);
      if (!b) return { ok: false, depth: g.depth };
      g.waveT = 1e9;
      d.bot(false);
      for (const q of g.monsters) if (q !== b && !q.boss) q.dead = true;
      const h = g.hero;
      // (a place by him clear of walls)
      let at = null;
      for (let r = 2.5; r <= 6 && !at; r += 0.5) {
        for (let k = 0; k < 16 && !at; k++) {
          const x = b.x + r * Math.cos((k / 16) * Math.PI * 2);
          const y = b.y + r * Math.sin((k / 16) * Math.PI * 2);
          if (g.isOpen(x, y)) at = { x, y };
        }
      }
      if (at) { h.x = at.x; h.y = at.y; }
      g.wakeUp(b);
      b.seen = true;
      return { ok: true, depth: g.depth, kind: b.kind, name: b.name, life: Math.round(b.maxLife), near: !!at };
    });
    if (!set.ok) {
      out.push({ floor: n, error: 'no boss found' });
      log(`floor ${n}`, 'no boss found');
      continue;
    }
    // (his life run down by the rules' own hand as the game goes on, to 1%, then he is killed)
    const pending = page.evaluate(([fight, after]) => new Promise((done) => {
      const d = window.__dbg;
      const g = d.game();
      const b = g.monsters.find((m) => m.boss && !m.dead);
      const P = d.painting;
      const max = b.maxLife;
      let t = 0;
      let deadAt = null;
      const run = g.update.bind(g);
      g.update = (dt, c) => {
        t += dt;
        g.hero.life = g.hero.d.maxLife;
        if (!b.dead) {
          b.life = Math.max(max * 0.01, max * (1 - t / fight));
          if (t >= fight) { g.kill(b); deadAt = performance.now(); P.trace = new Map(); }
        }
        return run(dt, c);
      };
      const frames = [];
      let last = performance.now();
      let painted = P.ms;
      const tick = () => {
        const now = performance.now();
        frames.push({ at: now, ms: now - last, paint: P.ms - painted });
        last = now;
        painted = P.ms;
        if (deadAt === null || now < deadAt + after * 1000) requestAnimationFrame(tick);
        else {
          g.update = run;
          // (what was painted where the game is played after he died, by what asked for it)
          const traced = P.trace ? [...P.trace].sort((x, y) => y[1].ms - x[1].ms).slice(0, 8).map(([k, v]) => ({ at: k.slice(0, 160), n: v.n, ms: Math.round(v.ms) })) : [];
          P.trace = null;
          const rel = frames.map((f) => ({ t: Math.round(f.at - deadAt), ms: Math.round(f.ms * 10) / 10, paint: Math.round(f.paint * 10) / 10 }));
          const round = rel.filter((f) => f.t >= -1000 && f.t <= after * 1000);
          const before = rel.filter((f) => f.t < -1000);
          const sorted = round.map((f) => f.ms).sort((a, b) => a - b);
          const fightSorted = before.map((f) => f.ms).sort((a, b) => a - b);
          done({
            deadAt,
            worst: round.slice().sort((a, b) => b.ms - a.ms).slice(0, 6),
            over50: round.filter((f) => f.ms > 50).length,
            over100: round.filter((f) => f.ms > 100).length,
            lost: Math.round(round.reduce((s, f) => s + Math.max(0, f.ms - 33.4), 0)),
            median: sorted[Math.floor(sorted.length / 2)],
            fightWorst: fightSorted[fightSorted.length - 1],
            fightMedian: fightSorted[Math.floor(fightSorted.length / 2)],
            painted: Math.round(round.reduce((s, f) => s + f.paint, 0)),
            afterPaint: Math.round(rel.filter((f) => f.t > 0).reduce((s, f) => s + f.paint, 0)),
            traced,
          });
        }
      };
      requestAnimationFrame(tick);
    }), [fight, after]);
    let p0 = 0;
    if (cdp) {
      await page.waitForTimeout(Math.max(0, fight - 2) * 1000);
      await cdp.send('Profiler.start');
      p0 = await page.evaluate(() => performance.now());
    }
    const res = await pending;
    if (cdp) {
      const { profile: prof } = await cdp.send('Profiler.stop');
      res.where = whereTime(prof, p0, res.deadAt, res.worst.slice(0, 3), after);
      for (const w of res.where) log(`  floor ${n}: ${w.what}`, w.top.map(([k, v]) => `${k} ${v}`).join(' | '));
    }
    out.push({ floor: n, kind: set.kind, ...res });
    for (const q of res.traced) log(`  floor ${n} painted after`, `${q.ms} ms, ${q.n} frames: ${q.at}`);
    log(`floor ${n} (${set.kind})`, JSON.stringify({ afterPaint: res.afterPaint, worst: res.worst, over50: res.over50, over100: res.over100, lost: res.lost, median: res.median, fightMedian: res.fightMedian, fightWorst: res.fightWorst, paintedRound: res.painted }));
    await snap(`f${n}_after`);
  }
  log('boss_death_stall', JSON.stringify(out.map((o) => ({ floor: o.floor, kind: o.kind, afterPaint: o.afterPaint, worst: o.worst ? o.worst[0] : null, over50: o.over50, lost: o.lost }))));
}

/** Where the time went: the functions the page was in (each counted once a sample, with all that called it), over the seconds round
 * the death and in each of the longest frames (ms). */
function whereTime(prof, p0, deadAt, worst, after) {
  const byId = new Map(prof.nodes.map((q) => [q.id, q]));
  const parent = new Map();
  for (const q of prof.nodes) for (const c of q.children ?? []) parent.set(c, q.id);
  const name = (q) => {
    const f = q.callFrame;
    return f.functionName || (f.url ? `(anon ${f.lineNumber})` : `(${f.functionName || 'program'})`);
  };
  const times = [];
  let t = prof.startTime;
  for (let i = 0; i < prof.samples.length; i++) {
    t += prof.timeDeltas[i];
    times.push(p0 + (t - prof.startTime) / 1000);
  }
  const tally = (from, to) => {
    const m = new Map();
    let self = new Map();
    for (let i = 0; i < prof.samples.length; i++) {
      if (times[i] < from || times[i] > to) continue;
      const dt = (prof.timeDeltas[i + 1] ?? prof.timeDeltas[i]) / 1000;
      let id = prof.samples[i];
      const seen = new Set();
      const leaf = byId.get(id);
      self.set(name(leaf), (self.get(name(leaf)) ?? 0) + dt);
      while (id !== undefined) {
        const q = byId.get(id);
        const k = name(q);
        if (!seen.has(k)) { seen.add(k); m.set(k, (m.get(k) ?? 0) + dt); }
        id = parent.get(id);
      }
    }
    const top = [...m].filter(([k]) => !['(root)', '(program)', '(idle)'].includes(k)).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => [k, Math.round(v)]);
    const selfTop = [...self].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => [`self:${k}`, Math.round(v)]);
    return [...top, ...selfTop];
  };
  const out = [{ what: `-1 s to +${after} s`, top: tally(deadAt - 1000, deadAt + after * 1000) }];
  for (const w of worst) out.push({ what: `frame at ${w.t} ms (${w.ms} ms)`, top: tally(deadAt + w.t - w.ms, deadAt + w.t) });
  return out;
}
