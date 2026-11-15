// THE CHAINED ONE'S FIGHT, ITS LONG FRAMES (15 Nov 2026; his words to the main chat: “Also got a big lag spike in the chained
// one’s fight”): floor 3 come to as a run comes to it, the hero set by the Chained One, the fight let run SECS seconds with the
// hero unhurt, every frame's time; the frames over 100 ms with what was painted in them (the page's painter, by what asked) and
// where the time went (a profile of the whole fight); the monsters' bake as the fight goes (render: bakedMobs).
//   node tools/playtest.mjs --serve --file dist/wrapped.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/chained_lag.mjs --out shots/wrap/chained
//   SECS (30)  WAIT: seconds on the floor before he is woken (9)  WALK=1: the hero walked to him across the floor instead of set by him
// Lines marked !! are frames over 250 ms.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const secs = Number(process.env.SECS || 30);
  const wait = Number(process.env.WAIT || 9);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.run('warrior', 44);
    d.seasoned(10);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 3);
  });
  await page.waitForTimeout(wait * 1000);
  // (READY=1: as a floor is played, the boss is come to long after the floor is: his pictures all painted ahead first, up to READY_MAX s)
  if (process.env.READY === '1') {
    const most = Number(process.env.READY_MAX || 240);
    let waited = 0;
    let left = null;
    for (; waited < most; waited += 2) {
      await page.waitForTimeout(2000);
      left = await page.evaluate(() => {
        const d = window.__dbg;
        const b = d.game().monsters.find((m) => m.boss && !m.dead);
        const p = d.painter;
        return b ? { kind: b.kind, main: p.left(b.kind), side: p.sideLeft(b.kind) } : null;
      });
      if (left && left.main === 0 && left.side === 0) break;
    }
    log('his pictures painted ahead', `${waited} s: ${JSON.stringify(left)}`);
  }
  const before =await page.evaluate(() => window.__dbg.bakedMobs());
  log('the monsters\' bake on coming', JSON.stringify(before && { here: before.here, failed: before.failed }));
  const set = await page.evaluate(() => {
    const d = window.__dbg;
    const g = d.game();
    const b = g.monsters.find((m) => m.boss && !m.dead);
    if (!b) return { ok: false };
    const h = g.hero;
    let at = null;
    for (let r = 2.5; r <= 6 && !at; r += 0.5) for (let k = 0; k < 16 && !at; k++) {
      const x = b.x + r * Math.cos((k / 16) * Math.PI * 2);
      const y = b.y + r * Math.sin((k / 16) * Math.PI * 2);
      if (g.isOpen(x, y)) at = { x, y };
    }
    if (at) { h.x = at.x; h.y = at.y; }
    g.wakeUp(b);
    b.seen = true;
    return { ok: true, kind: b.kind, name: b.name };
  });
  if (!set.ok) { log('!! no boss found', ''); return; }
  log('the boss', JSON.stringify(set));
  await cdp.send('Profiler.start');
  const p0 = await page.evaluate(() => performance.now());
  const res = await page.evaluate((secs) => new Promise((done) => {
    const d = window.__dbg;
    const g = d.game();
    const P = d.painting;
    P.trace = new Map();
    const frames = [];
    const t0 = performance.now();
    let last = t0;
    let painted = P.ms;
    let traceAt = new Map();
    const bakes = [];
    let nextBake = 0;
    const tick = () => {
      const now = performance.now();
      g.hero.life = g.hero.d.maxLife;
      const ms = now - last;
      const paint = P.ms - painted;
      const f = { t: Math.round(now - t0), ms: Math.round(ms * 10) / 10, paint: Math.round(paint * 10) / 10 };
      if (ms > 100) {
        // (what was painted in this frame, by what asked for it)
        const now2 = new Map(P.trace);
        const grew = [];
        for (const [k, v] of now2) {
          const o = traceAt.get(k);
          const dn = v.n - (o ? o.n : 0);
          const dms = v.ms - (o ? o.ms : 0);
          if (dn > 0) grew.push(`${Math.round(dms)} ms ${dn}: ${k.slice(0, 120)}`);
        }
        f.what = grew.slice(0, 4);
        const b = g.monsters.find((m) => m.boss);
        f.boss = b ? `${b.state} ${b.anim ?? ''} ${b.act ?? ''} phase ${b.phase ?? ''}` : '';
      }
      traceAt = new Map([...P.trace].map(([k, v]) => [k, { n: v.n, ms: v.ms }]));
      frames.push(f);
      last = now;
      painted = P.ms;
      if (now - t0 > nextBake) { const s = d.bakedMobs(); bakes.push({ t: Math.round(now - t0), here: s ? s.here : null }); nextBake += 5000; }
      if (now - t0 < secs * 1000) requestAnimationFrame(tick);
      else {
        const sorted = frames.map((q) => q.ms).sort((a, b) => a - b);
        const traced = [...P.trace].sort((x, y) => y[1].ms - x[1].ms).slice(0, 10).map(([k, v]) => ({ at: k.slice(0, 160), n: v.n, ms: Math.round(v.ms) }));
        P.trace = null;
        done({
          t0,
          frames: frames.length,
          median: sorted[Math.floor(sorted.length / 2)],
          worst: frames.slice().sort((a, b) => b.ms - a.ms).slice(0, 8),
          over100: frames.filter((q) => q.ms > 100).length,
          over250: frames.filter((q) => q.ms > 250).length,
          paintMs: Math.round(frames.reduce((s, q) => s + q.paint, 0)),
          traced,
          bakes,
        });
      }
    };
    requestAnimationFrame(tick);
  }), secs);
  const { profile: prof } = await cdp.send('Profiler.stop');
  log('the fight', JSON.stringify({ frames: res.frames, median: res.median, over100: res.over100, over250: res.over250, paintMs: res.paintMs }));
  for (const w of res.worst) log(`${w.ms > 250 ? '!! ' : ''}a long frame at ${w.t} ms`, `${w.ms} ms, painting ${w.paint} ms; ${w.boss ?? ''}; ${(w.what ?? []).join(' || ')}`);
  for (const q of res.traced) log('painted in the fight', `${q.ms} ms, ${q.n} frames: ${q.at}`);
  for (const b of res.bakes) log(`the bake at ${b.t} ms`, JSON.stringify(b.here));
  // (where the time went in each of the three longest frames)
  const byId = new Map(prof.nodes.map((q) => [q.id, q]));
  const parent = new Map();
  for (const q of prof.nodes) for (const c of q.children ?? []) parent.set(c, q.id);
  const name = (q) => { const f = q.callFrame; return f.functionName || (f.url ? `(anon ${f.lineNumber}:${f.columnNumber})` : `(${f.functionName || 'program'})`); };
  const times = [];
  let t = prof.startTime;
  for (let i = 0; i < prof.samples.length; i++) { t += prof.timeDeltas[i]; times.push(p0 + (t - prof.startTime) / 1000); }
  for (const w of res.worst.slice(0, 4)) {
    const from = res.t0 + w.t - w.ms;
    const to = res.t0 + w.t;
    const m = new Map();
    const self = new Map();
    for (let i = 0; i < prof.samples.length; i++) {
      if (times[i] < from || times[i] > to) continue;
      const dt = (prof.timeDeltas[i + 1] ?? prof.timeDeltas[i]) / 1000;
      let id = prof.samples[i];
      const seen = new Set();
      const leaf = byId.get(id);
      self.set(name(leaf), (self.get(name(leaf)) ?? 0) + dt);
      while (id !== undefined) { const q = byId.get(id); const k = name(q); if (!seen.has(k)) { seen.add(k); m.set(k, (m.get(k) ?? 0) + dt); } id = parent.get(id); }
    }
    const top = [...m].filter(([k]) => !['(root)', '(program)', '(idle)'].includes(k)).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([k, v]) => `${k} ${Math.round(v)}`);
    const st = [...self].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `self:${k} ${Math.round(v)}`);
    log(`  where, the frame at ${w.t} ms`, [...top, ...st].join(' | '));
  }
  await snap('after');
}
