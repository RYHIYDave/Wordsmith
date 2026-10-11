// THE BOSS'S ENTRANCE AND THE FLOORS' NAMES (game/defs.ts BOSS_INTRO and FLOOR_NAMES, on; ui/cards.ts):
// pictures for the owner, from the game. His words, 10 Oct 2026, 21:30: "I’d like the boss fights to go
// like this.  The gate closes and the boss says a little line.  And the boss’s name shows up all
// stylized on the screen.  And I like the first 5 levels to be called Prison Level 1, Prison Level 2,
// so on.  But when you enter the next dungeon it’s called something that relates to the boss or the
// location.  And that is also stylized with the actual level under that in smaller font"; his pick at
// 21:33, "A". For looking at, not a test.
//   node tools/build_to.mjs dist/intro.html
//   node tools/playtest.mjs --file dist/intro.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/boss_intro.mjs --out shots/intro/phone
import { log } from './lib.mjs';

// FILM=1: frames for films instead (a frame every 15th of a second of the game's time, the game slowed
// to a tenth while they are taken): f_..., the floor's name as he comes into floor 2; b_..., the boss's
// entrance. Joined by tools/intro_films.py.
export default async function (page, snap) {
  if (process.env.FILM) return film(page, snap);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.bossIntro(true); d.floorNames(true);
  });
  await page.waitForTimeout(600);
  const slow = (s) => page.evaluate((v) => { window.__dbg.slowmo = v; }, s);

  // ---- the floors' names, as he comes into floors 1, 2 and 4 ----
  for (const depth of [1, 2, 4]) {
    await page.evaluate((n) => { const g = window.__dbg.game(); g.depth = n; g.cleared = n - 1; g.enterDungeon(); for (const m of g.monsters) if (Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 14) m.dead = true; }, depth);
    await page.waitForTimeout(1300);
    await snap(`floor${depth}_name`);
  }

  // ---- the boss's entrance on floor 1: walked into his hall, the gate falls behind ----
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon(); });
  await page.waitForTimeout(3800);
  const where = await page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level;
    g.monsters = g.monsters.filter((m) => m.boss);
    L.explored.fill(1);
    const boss = g.monsters[0];
    const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
    const gx = s.alongX ? s.a + 1.5 : s.plane;
    const gy = s.alongX ? s.plane : s.a + 1.5;
    const n = Math.hypot(gx - boss.x, gy - boss.y);
    const h = g.hero;
    h.x = boss.x + ((gx - boss.x) / n) * 4.2;
    h.y = boss.y + ((gy - boss.y) / n) * 4.2;
    h.fx = -(gx - boss.x) / n; h.fy = -(gy - boss.y) / n;
    return { hero: [+h.x.toFixed(2), +h.y.toFixed(2)], boss: [+boss.x.toFixed(2), +boss.y.toFixed(2)], name: boss.name };
  });
  log('boss', JSON.stringify(where));
  await slow(0.25);
  const t0 = Date.now();
  for (const [ms, name] of [[300, 'boss_a_gate'], [2000, 'boss_b_line'], [5600, 'boss_c_name'], [11000, 'boss_d_later'], [14000, 'boss_e_fight']]) {
    const wait = t0 + ms - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    const st = await page.evaluate(() => { const g = window.__dbg.game(); return { intro: +g.introT.toFixed(2), gate: g.level.doors.find((q) => q.spot.kind === 'bossgate').want }; });
    log(name, JSON.stringify(st));
    await snap(name);
  }
  await slow(1);
}

async function film(page, snap) {
  const FPS = 15;
  const SLOW = 0.1;
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.bossIntro(true); d.floorNames(true);
  });
  await page.waitForTimeout(600);
  const frames = async (name, n) => {
    await page.evaluate((v) => { window.__dbg.slowmo = v; }, SLOW);
    const step = 1000 / FPS / SLOW;
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const wait = t0 + i * step - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      await snap(`${name}_f${String(i).padStart(3, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  };
  // the floor's name: floor 2 (nothing awake near)
  await page.evaluate(() => { window.__dbg.slowmo = 0.1; const g = window.__dbg.game(); g.depth = 2; g.cleared = 1; g.enterDungeon(); for (const m of g.monsters) if (Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 14) m.dead = true; });
  await frames('f', Math.round(3.6 * FPS));
  // the boss's entrance on floor 1
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon(); });
  await page.waitForTimeout(3800);
  await page.evaluate(() => {
    window.__dbg.slowmo = 0.1;
    const g = window.__dbg.game(); const L = g.level;
    g.monsters = g.monsters.filter((m) => m.boss);
    L.explored.fill(1);
    const boss = g.monsters[0];
    const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
    const gx = s.alongX ? s.a + 1.5 : s.plane;
    const gy = s.alongX ? s.plane : s.a + 1.5;
    const n = Math.hypot(gx - boss.x, gy - boss.y);
    const h = g.hero;
    h.x = boss.x + ((gx - boss.x) / n) * 4.2;
    h.y = boss.y + ((gy - boss.y) / n) * 4.2;
    h.fx = -(gx - boss.x) / n; h.fy = -(gy - boss.y) / n;
  });
  await frames('b', Math.round(4.2 * FPS));
}
