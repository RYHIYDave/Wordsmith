// THE FIRST LEVELS (game/defs.ts FIRST_LEVELS, a mock-up behind a switch that is off): the moment a
// move opens, filmed for the owner (his words, 8 Oct 2026, 22:23: "And I want it to be a moment when
// your new moves unlock.  These animations should be strike skill slides over and whirlwind is
// revealed with a flourish"), and the first pack, a softball (22:25). A warrior in a new player's
// first dungeon: a still of the start (Strike alone, nothing else shown), one of the first pack;
// then level 2 and level 5 filmed, the game slowed so that the camera keeps up. Each frame's game
// time goes in <out>_times.json. Not part of tools/regress.sh.
//   node tools/playtest.mjs --file dist/fl.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/first_levels_film.mjs --out shots/flf/w
//   CLS (warrior), SEED (21), SLOW (0.15), SECS (game seconds filmed for each, 2.0)
export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 21);
  const slow = Number(process.env.SLOW || 0.15);
  const secs = Number(process.env.SECS || 2.0);
  await page.evaluate(([cls, seed]) => {
    const d = window.__dbg;
    d.saving(false);
    d.firstLevels(true);
    d.first(cls, seed);
    d.god = true;
    d.autoLevel = false;
  }, [cls, seed]);
  await page.waitForTimeout(1600);
  await snap('a_start');
  // the first pack, the softball: the hero brought up to it, awake and coming
  const first = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero; const f = g.level.floor;
    // the pack nearest the way in, as the rules chose it: the slow ones
    const soft = g.monsters.filter((m) => !m.dead && !m.boss && m.speed === 2);
    if (!soft.length) return null;
    const cx = soft.reduce((a, m) => a + m.x, 0) / soft.length; const cy = soft.reduce((a, m) => a + m.y, 0) / soft.length;
    // stand the hero a few steps off, on open ground, facing them
    let best = null;
    for (let k = 0; k < 24 && !best; k++) {
      const a = (k / 24) * Math.PI * 2;
      const x = cx + Math.cos(a) * 3.5; const y = cy + Math.sin(a) * 3.5;
      if (g.level.open[Math.floor(y) * f.w + Math.floor(x)] === 1) best = { x, y };
    }
    if (best) { h.x = best.x; h.y = best.y; }
    const far = Math.hypot(cx - h.x, cy - h.y) || 1; h.fx = (cx - h.x) / far; h.fy = (cy - h.y) / far;
    for (const m of soft) { m.state = 'chase'; m.seen = true; }
    if (g.guide) g.guide.met = true;
    return soft.map((m) => ({ kind: m.kind, life: Math.round(m.maxLife), dmg: [m.dmgMin, m.dmgMax].map((v) => +v.toFixed(2)), speed: m.speed }));
  });
  snap.note('softball', first);
  await page.waitForTimeout(700);
  await snap('b_softball');
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; });
  await page.waitForTimeout(600);
  const times = {};
  /** Film `secs` of the game's time from now, after `go` has been run, slowed down. */
  const film = async (tag, go) => {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    const t0 = await page.evaluate(() => window.__dbg.game().time);
    await page.evaluate(go);
    const list = [];
    for (let n = 0; n < 400; n++) {
      const t = await page.evaluate(() => window.__dbg.game().time);
      if (t - t0 > secs) break;
      const name = `${tag}_f${String(n).padStart(3, '0')}`;
      await snap(name);
      list.push([name, +(t - t0).toFixed(3)]);
    }
    times[tag] = list;
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  };
  await film('c_level2', () => { const g = window.__dbg.game(); while (g.hero.level < 2) g.gainXp(40); });
  await page.waitForTimeout(3500);
  await snap('d_after_level2');
  await film('e_level5', () => { const g = window.__dbg.game(); while (g.hero.level < 5) g.gainXp(80); });
  await page.waitForTimeout(3500);
  await snap('f_after_level5');
  snap.note('times', times);
}
