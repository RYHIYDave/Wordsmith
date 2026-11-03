// FLOOR 20'S RIME SHADES IN PLAY (game/act1_rules/rshade.ts; switched on here, as in the release once he has said yes): on a phone
// held sideways, floor 20's own ground, the knight in its biggest room, three of them set round him and left to the game's own
// rules for eight seconds while he stands:
//   1. they breathe: their lines laid on the floor;
//   2. he is frozen where a line reaches him, and let go: never held longer than a freeze;
//   3. the frame time while three lines creep and lie (each painted afresh as its clock runs).
//   node tools/build_to.mjs dist/rs.html
//   node tools/playtest.mjs --file dist/rs.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/rime_shade_play.mjs --out shots/rsplay/x
import { log } from './lib.mjs';

export default async function (page, snap) {
  let bad = 0;
  const check = (what, ok, detail = '') => {
    if (!ok) bad++;
    console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`);
  };
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.rimeShade) d.rimeShade.on = true; d.run('warrior', 77); d.seasoned(18); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  const set = await page.evaluate(() => {
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
    let n = 0;
    for (const [dx, dy] of [[-4.2, 0], [2.4, 3.6], [2.6, -3.4], [4, 0], [0, 4], [0, -4]]) {
      if (n >= 3 || !g.isOpen(h.x + dx, h.y + dy)) continue;
      const m = g.spawn('rshade', h.x + dx, h.y + dy, 970, 0, false, g.rng);
      g.wakeUp(m);
      m.seen = true;
      n++;
    }
    const w = { lines: 0, frozen: 0, longest: 0, held: 0, was: false, seen: new Set() };
    window.__rs = w;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      h.life = h.d.maxLife;
      const o = run(dt, c);
      for (const p of g.perils) if (p.a1 === 'rshade:line' && !w.seen.has(p)) { w.seen.add(p); w.lines++; }
      const ice = (h.iceT ?? 0) > 0;
      if (ice && !w.was) { w.frozen++; w.held = 0; }
      if (ice) { w.held += dt; w.longest = Math.max(w.longest, w.held); }
      w.was = ice;
      return o;
    };
    return { n, on: !!(D.rimeShade && D.rimeShade.on) };
  });
  check('three Rime Shades set round him', set.n === 3 && set.on, JSON.stringify(set));
  const frames = await page.evaluate(() => new Promise((done) => {
    const times = []; let last = performance.now();
    const end = last + 8000;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (now < end) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ n: times.length, median: Math.round(times[Math.floor(times.length / 2)] * 10) / 10, worst: Math.round(times[times.length - 1] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }));
  await snap('lines');
  const w = await page.evaluate(() => ({ lines: window.__rs.lines, frozen: window.__rs.frozen, longest: window.__rs.longest }));
  log('rime shades', JSON.stringify(w));
  check('they breathe: their lines laid', w.lines >= 3, `${w.lines} lines`);
  check('frozen where a line reaches him, and let go', w.frozen >= 1 && w.longest <= 0.85, `frozen ${w.frozen} times, held at most ${w.longest.toFixed(2)} s`);
  log('frames while three lines creep and lie (ms)', JSON.stringify(frames));
  check('a frame in good time while they breathe', frames.median <= 40, `${frames.median} ms`);
  log('rime_shade_play', bad ? `${bad} thing(s) wrong` : 'all as they should be');
}
