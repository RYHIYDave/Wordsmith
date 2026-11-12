// WHAT FLOOR 20'S RIME SHADES' LINES COST TO DRAW (the queue's fix-boss-death-stall-and-rime-shade): three of them set round the
// knight on floor 20, as tools/scenarios/rime_shade_play.mjs sets them, left to breathe for SECONDS; the page profiled meanwhile,
// and the time spent in drawing their lines (render/act1_fx/rshade.ts and all it calls: painting each picture afresh, laying its
// pixels on its canvas, drawing it) told in thousandths of a second a frame, beside the frame's own time.
//   SECONDS=8
//   node tools/build_to.mjs dist/rs.html
//   node tools/playtest.mjs --file dist/rs.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/rime_shade_cost.mjs --out shots/rscost/x
import fs from 'node:fs';
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seconds = Number(process.env.SECONDS || 8);
  // (where the lines' drawing is in the page's script: its module's lines)
  const at = process.argv.indexOf('--file');
  const file = at >= 0 ? process.argv[at + 1] : 'Play.html';
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const from = lines.findIndex((l) => l.trim() === '// src/render/act1_fx/rshade.ts');
  let to = from + 1;
  while (to < lines.length && !/^\s*\/\/ src\//.test(lines[to])) to++;
  if (from < 0) throw new Error('the lines\' drawing is not in the page');
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.rimeShade) d.rimeShade.on = true; d.run('warrior', 77); d.seasoned(18); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  const n = await page.evaluate(() => {
    const D = window.__dbg;
    D.high(true, 20);
    const g = D.game();
    g.level.explored.fill(1);
    g.waveT = 1e9; D.bot(false);
    for (const q of g.monsters) q.dead = true;
    g.monsters = [];
    const f = g.level.floor;
    const room = f.rooms.filter((q) => q.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h)[0];
    const h = g.hero;
    h.x = room.x + room.w / 2; h.y = room.y + room.h / 2;
    let k = 0;
    for (const [dx, dy] of [[-4.2, 0], [2.4, 3.6], [2.6, -3.4], [4, 0], [0, 4], [0, -4]]) {
      if (k >= 3 || !g.isOpen(h.x + dx, h.y + dy)) continue;
      const m = g.spawn('rshade', h.x + dx, h.y + dy, 970, 0, false, g.rng);
      g.wakeUp(m);
      m.seen = true;
      k++;
    }
    const run = g.update.bind(g);
    window.__rsLines = 0;
    g.update = (dt, c) => { h.life = h.d.maxLife; const o = run(dt, c); window.__rsLines = Math.max(window.__rsLines, g.perils.filter((p) => p.a1 === 'rshade:line').length); return o; };
    return k;
  });
  // (their first breaths: the floor's pictures settled, the lines begun)
  await page.waitForTimeout(3000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
  await cdp.send('Profiler.start');
  const frames = await page.evaluate((seconds) => new Promise((done) => {
    const times = []; let last = performance.now();
    const end = last + seconds * 1000;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (now < end) requestAnimationFrame(tick); else { const s = times.slice().sort((a, b) => a - b); done({ n: times.length, median: Math.round(s[Math.floor(s.length / 2)] * 10) / 10, worst: Math.round(s[s.length - 1] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }), seconds);
  const { profile: prof } = await cdp.send('Profiler.stop');
  // (each sample counted once if anything of the lines' drawing is on its stack)
  const byId = new Map(prof.nodes.map((q) => [q.id, q]));
  const parent = new Map();
  for (const q of prof.nodes) for (const c of q.children ?? []) parent.set(c, q.id);
  const inLines = new Map();
  const isOurs = (id) => {
    if (inLines.has(id)) return inLines.get(id);
    const q = byId.get(id);
    const ln = q.callFrame.lineNumber;
    const own = q.callFrame.url !== '' && ln >= from && ln < to;
    const v = own || (parent.has(id) ? isOurs(parent.get(id)) : false);
    inLines.set(id, v);
    return v;
  };
  let ours = 0;
  let all = 0;
  // (and within it, by the function the page was in)
  const self = new Map();
  for (let i = 0; i < prof.samples.length; i++) {
    const dt = prof.timeDeltas[i] / 1000;
    all += dt;
    if (!isOurs(prof.samples[i])) continue;
    ours += dt;
    const f = byId.get(prof.samples[i]).callFrame;
    const k = f.functionName || `(anon ${f.lineNumber})`;
    self.set(k, (self.get(k) ?? 0) + dt);
  }
  const top = [...self].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${Math.round(v)}`).join(' | ');
  const most = await page.evaluate(() => window.__rsLines);
  await snap('lines');
  const perFrame = Math.round((ours / frames.n) * 100) / 100;
  log('rime shades', `${n} set round him, up to ${most} lines on the floor at once`);
  log('frames (ms)', JSON.stringify(frames));
  log('drawing their lines', `${Math.round(ours)} ms of ${Math.round(all)} profiled (${Math.round(ours / seconds)} ms a second), ${perFrame} ms a frame (${Math.round((100 * ours) / all)}% of the page's time)`);
  log('of which', top);
  log('rime_shade_cost', JSON.stringify({ lines: most, perFrame, median: frames.median, worst: frames.worst }));
}
