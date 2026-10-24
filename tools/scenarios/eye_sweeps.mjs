// THE DROWNED EYE'S SWEEP BACK AND FORTH (game/act1_rules/eye.ts SWEEPS; the owner, 23 Oct 2026, by 20:48: “Like the tentacle
// swipe should be back and forth, maybe three times in a row.”): floor 10, the hero on his ring, the sweep the only move he
// has ready, filmed slowed through a row of them (each frame's game clock and his act logged, 'TIMES_sweeps [...]',
// 'ACTS [...]'), so that a video can be put together at the game's own speed. Not a test.
//   node tools/playtest.mjs --file dist/next.html --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/eye_sweeps.mjs --out shots/eye/sweeps/x
// SECS: game seconds filmed (12). SLOW (0.25). AIM: where round his ring the hero stands (degrees, 30).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const secs = Number(process.env.SECS) || 12;
  const slow = Number(process.env.SLOW) || 0.25;
  const aim = Number(process.env.AIM ?? 30);
  await page.evaluate((aim) => {
    const d = window.__dbg;
    d.saving(false); d.run('warrior', 5); d.seasoned(12);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game();
    g.hero.ring = true; g.hero.pending = 0; g.guide = null;
    g.depth = 10; g.cleared = 9; g.wayDepth = 10; g.enterDungeon();
    g.hero.invuln = 1e9;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    const b = g.monsters.find((m) => m.boss);
    // (on his ring, `aim` degrees round from his forward, 4.6 tiles out)
    const D = Math.PI / 180;
    const f = Math.cos(aim * D) * 4.6; const l = Math.sin(aim * D) * 4.6;
    g.hero.x = b.x + (f + l) * Math.SQRT1_2; g.hero.y = b.y + (f - l) * Math.SQRT1_2;
    g.bossMet = true; g.level.explored.fill(1);
    d.fx.messages.length = 0;
  }, aim);
  // (his pictures painted first)
  await page.waitForTimeout(25000);
  const hold = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss);
    if (!b.moveCd) return;
    for (let k = 0; k < b.moveCd.length; k++) if (k !== 2) b.moveCd[k] = 1e9;
    b.moveCd[2] = Math.min(b.moveCd[2], 0);
  });
  await hold();
  // (the swell kept off: his sweep alone)
  await page.evaluate((k) => { window.__dbg.slowmo = k; }, slow);
  const t0 = await page.evaluate(() => window.__dbg.game().time);
  const times = [];
  const acts = [];
  let n = 0;
  for (;;) {
    const s = await page.evaluate(() => {
      const g = window.__dbg.game();
      const b = g.monsters.find((m) => m.boss);
      for (const p of g.perils) if (p.a1 === 'eye:burst' && p.t < 0.3) p.dur = 0;
      return { t: g.time, act: b.act && b.act.id === 'eye:sweep' ? b.act.hand : 0 };
    });
    if (s.t - t0 > secs) break;
    await hold();
    times.push(+s.t.toFixed(3));
    acts.push(s.act);
    await snap(`sweeps_f${String(n++).padStart(4, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  log('TIMES_sweeps', JSON.stringify(times));
  log('ACTS', JSON.stringify(acts));
  const runs = [];
  for (let i = 0; i < acts.length; i++) if (acts[i] !== 0 && (i === 0 || acts[i - 1] !== acts[i])) runs.push(acts[i]);
  log('sweeps', JSON.stringify(runs));
  if (runs.length < 3) log(`!! ${runs.length} sweeps filmed, not three`);
}
