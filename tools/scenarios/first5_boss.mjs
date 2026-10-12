// THE FIRST FIVE FLOORS: A FLOOR'S BOSS, IN THE GAME (game/bosses.ts). For looking at, and for films.
//   node tools/build_to.mjs dist/first5.html
//   DEPTH=2 node tools/playtest.mjs --file dist/first5.html --scenario tools/scenarios/first5_boss.mjs --out shots/first5/boss2
// DEPTH: which floor (2 the Headsman, 3 the Chained One, 4 the amalgamation, 5 the Fleshmancer).
// ACT: an act to have him make over and over (its id, game/bosses.ts ACTS), with the hero stood where it reaches;
//      none: the fight as it comes, the hero standing 3.5 tiles off.
// CLS: the hero (warrior). FAR: how far off the hero stands (tiles). SECS: how long to watch (14).
// FILM=1: a frame every 15th of a second of the game's time (the game slowed), named f_0000...
// LIFE: the boss's life as a share of his whole (for the acts that come as he is hurt).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 2);
  const act = process.env.ACT || '';
  const cls = process.env.CLS || 'warrior';
  const far = Number(process.env.FAR || 3.5);
  const secs = Number(process.env.SECS || 14);
  const film = !!process.env.FILM;
  const life = process.env.LIFE ? Number(process.env.LIFE) : 0;
  await page.evaluate(([c]) => {
    const d = window.__dbg; d.saving(false); d.run(c, 9); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, [cls]);
  await page.waitForTimeout(600);
  const where = await page.evaluate(([n, a, dist, lf]) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    g.monsters = g.monsters.filter((m) => m.boss);
    L.explored.fill(1);
    const boss = g.monsters[0];
    boss.words = [];
    const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
    const gx = s.alongX ? s.a + 1.5 : s.plane;
    const gy = s.alongX ? s.plane : s.a + 1.5;
    const k = Math.hypot(gx - boss.x, gy - boss.y);
    const h = g.hero;
    h.x = boss.x + ((gx - boss.x) / k) * dist;
    h.y = boss.y + ((gy - boss.y) / k) * dist;
    h.fx = -(gx - boss.x) / k; h.fy = -(gy - boss.y) / k;
    if (lf > 0) boss.life = Math.round(boss.maxLife * lf);
    window.__act = a;
    return { hero: [+h.x.toFixed(2), +h.y.toFixed(2)], boss: [+boss.x.toFixed(2), +boss.y.toFixed(2)], name: boss.name, kind: boss.kind, life: boss.life };
  }, [depth, act, far, life]);
  log('boss', JSON.stringify(where));
  // (the gate falls behind him, the boss says his line and his name comes up: then the fight)
  await page.waitForTimeout(film ? 300 : 4200);
  if (act) {
    // (only that act: every other of his is kept cooling)
    await page.evaluate(() => {
      window.__only = setInterval(() => {
        const g = window.__dbg.game(); if (!g) return;
        const b = g.monsters.find((m) => m.boss); if (!b || !b.moveCd) return;
        const acts = g.bosses.constructor ? null : null;
        void acts;
      }, 50);
    });
  }
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss);
    if (!b) return { dead: true, perils: g.perils.length, monsters: g.monsters.length };
    return { st: b.state, gait: b.gait ? b.gait.mode : null, act: b.act ? `${b.act.id}@${b.act.t.toFixed(2)}` : null, life: b.life, form: b.form ?? 0, d: +Math.hypot(b.x - g.hero.x, b.y - g.hero.y).toFixed(2), perils: g.perils.length, risers: g.risers.length, monsters: g.monsters.length, hero: Math.round(g.hero.life), painted: window.__dbg.painting.frames };
  });
  if (film) {
    const FPS = 15;
    const SLOW = 0.25;
    await page.evaluate((v) => { window.__dbg.slowmo = v; }, SLOW);
    const step = 1000 / FPS / SLOW;
    const t0 = Date.now();
    const n = Math.round(secs * FPS);
    for (let i = 0; i < n; i++) {
      const wait = t0 + i * step - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      await snap(`f_${String(i).padStart(4, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    return;
  }
  const t0 = Date.now();
  let shot = 0;
  let last = '';
  while (Date.now() - t0 < secs * 1000) {
    const st = await state();
    const key = `${st.st}:${st.gait}:${st.act ? st.act.split('@')[0] : ''}`;
    if (key !== last) {
      log(((Date.now() - t0) / 1000).toFixed(1), JSON.stringify(st));
      last = key;
    }
    if ((Date.now() - t0) / 1000 >= shot * (secs / 6)) {
      await snap(`s${shot}`);
      shot++;
    }
    await page.waitForTimeout(120);
  }
  log('end', JSON.stringify(await state()));
}
