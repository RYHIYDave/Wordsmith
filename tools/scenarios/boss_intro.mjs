// THE BOSS'S ENTRANCE AND THE FLOORS' NAMES (game/defs.ts BOSS_INTRO and FLOOR_NAMES, on; ui/cards.ts):
// pictures for the owner, from the game. His words, 10 Oct 2026, 21:30: "I’d like the boss fights to go
// like this.  The gate closes and the boss says a little line.  And the boss’s name shows up all
// stylized on the screen.  And I like the first 5 levels to be called Prison Level 1, Prison Level 2,
// so on.  But when you enter the next dungeon it’s called something that relates to the boss or the
// location.  And that is also stylized with the actual level under that in smaller font"; his pick at
// 21:33, "A". For looking at, not a test.
//   node tools/build_to.mjs dist/intro.html
//   node tools/playtest.mjs --file dist/intro.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/boss_intro.mjs --out shots/intro/phone
import { log, makeHands } from './lib.mjs';

// FILM=1: frames for films instead (a frame every 15th of a second of the game's time, the game slowed
// to a tenth while they are taken): f_..., the floor's name as he comes into floor 2; b_..., the boss's
// entrance. Joined by tools/intro_films.py.
// FILM=wait: one film, w_...: the ranger at his boss's open gate, the boss at the back of his hall;
// his arrows do nothing to the boss ("Not yet"); he walks in, the gate falls behind him, the boss says
// his line and his name comes up; then the arrows bite (his words of 21:49: "Makes sure the boss
// spawns far enough back so it can’t be hit before your character enters the gate").
export default async function (page, snap) {
  if (process.env.FILM === 'wait') return waitFilm(page, snap);
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

async function waitFilm(page, snap) {
  const FPS = 15;
  const SLOW = 0.1;
  const hands = await makeHands(page);
  const cdp = hands.touch ? await page.context().newCDPSession(page) : null;
  const touchAt = async (type, gx, gy) => {
    const c = await hands.client(gx, gy);
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(c.x), y: Math.round(c.y), id: 3 }] });
  };
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('ranger', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.bossIntro(true); d.floorNames(true);
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon(); });
  await page.waitForTimeout(3800);
  // (the hero set down outside the boss's open gate, on the line through its middle, facing in)
  const at = await page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level; const h = g.hero;
    g.monsters = g.monsters.filter((m) => m.boss);
    L.explored.fill(1);
    const boss = g.monsters[0];
    const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
    const gx = s.alongX ? s.a + 1.5 : s.plane;
    const gy = s.alongX ? s.plane : s.a + 1.5;
    const ux = s.alongX ? 0 : -s.out; const uy = s.alongX ? -s.out : 0;
    let out = 1.6;
    while (out > 0.6 && !g.free(L.walk, gx - ux * out, gy - uy * out, 0.45)) out -= 0.2;
    h.x = gx - ux * out; h.y = gy - uy * out; h.move = null; h.fx = ux; h.fy = uy;
    const inside = (x, y) => ((s.alongX ? y : x) - s.plane) * -s.out;
    return { ux, uy, out: +out.toFixed(1), bossIn: +inside(boss.x, boss.y).toFixed(1), dist: +Math.hypot(boss.x - h.x, boss.y - h.y).toFixed(1), w: window.__dbg.screen.w, h: window.__dbg.screen.h };
  });
  log('set down', JSON.stringify(at));
  await page.evaluate((v) => { window.__dbg.slowmo = v; }, SLOW);
  const step = 1000 / FPS / SLOW;
  const t0 = Date.now();
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss);
    return { t: g.time, gate: g.level.doors.find((q) => q.spot.kind === 'bossgate').want, intro: g.introT, life: b ? b.life : 0 };
  });
  const shoot = () => page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); if (b) g.useBasic(b.x, b.y); });
  const s0 = await state();
  const thumb = { x: at.w * 0.16, y: at.h * 0.72 };
  const sd = { x: at.ux - at.uy, y: (at.ux + at.uy) / 2 };
  const sn = Math.hypot(sd.x, sd.y) || 1;
  let shots = 0; let walking = false; let fellAt = -1; let introDone = -1; let lastShot = -9;
  for (let i = 0; i < 15 * 14; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    const s = await state();
    const t = s.t - s0.t;
    if (shots < 3 && t >= 0.25 + shots * 0.5) { await shoot(); shots++; lastShot = t; }
    if (!walking && fellAt < 0 && t >= 2.1) {
      walking = true;
      await touchAt('touchStart', thumb.x, thumb.y);
      await touchAt('touchMove', thumb.x + (sd.x / sn) * 22, thumb.y + (sd.y / sn) * 22);
    }
    if (fellAt < 0 && s.gate === 0) { fellAt = t; log('the gate falls', `${t.toFixed(2)} s`); }
    if (walking && fellAt >= 0 && t >= fellAt + 0.3) { walking = false; await touchAt('touchEnd', 0, 0); }
    if (fellAt >= 0 && introDone < 0 && s.intro <= 0 && t > fellAt + 0.5) { introDone = t; log('he fights', `${t.toFixed(2)} s`); }
    if (introDone >= 0 && t >= introDone + 0.2 && t - lastShot >= 0.45) { await shoot(); lastShot = t; }
    await snap(`w_f${String(i).padStart(3, '0')}`);
    if (introDone >= 0 && t >= introDone + 2.2) break;
  }
  const end = await state();
  log('the boss', `life ${Math.round(s0.life)} at the start, ${Math.round(end.life)} at the end`);
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
