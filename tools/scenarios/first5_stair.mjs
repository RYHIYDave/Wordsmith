// THE FIRST FIVE FLOORS: THE STAIRWELL BREAKING OPEN (render/dress.ts, the art chat's film; game/ways.ts
// STAIR_OPENING). A floor of 1 to 4, its boss killed where he stands, the hero a few tiles off: the floor of
// his hall breaks open into the stairwell down; once it has, its top step takes him down.
//   node tools/build_to.mjs dist/first5.html
//   DEPTH=2 node tools/playtest.mjs --file dist/first5.html --scenario tools/scenarios/first5_stair.mjs --out shots/first5/stair2
// FILM=1: a frame every 15th of a second of the game's time (the game slowed).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 2);
  const film = !!process.env.FILM;
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(600);
  const at = await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    g.monsters = g.monsters.filter((m) => m.boss);
    const boss = g.monsters[0];
    const st = L.ways.stairs[0];
    // (the boss put a few tiles off the opening, so that it opens where it most likely will; the hero beside him)
    boss.x = st.x + 1.2; boss.y = st.y + 5.5;
    g.hero.x = st.x + 4.5; g.hero.y = st.y + 4.5; g.hero.fx = -0.7; g.hero.fy = -0.7;
    return { stairs: L.ways.stairs.map((s) => [s.x, s.y, s.way]), boss: boss.kind };
  }, depth);
  log('floor', depth, JSON.stringify(at));
  for (let i = 0; i < 160; i++) {
    const st = await page.evaluate(() => ({ films: Object.keys(window.__dbg.painter.stats.films), busy: window.__dbg.painter.busy() }));
    if (st.films.some((k) => k.startsWith('stair:'))) { log('films', JSON.stringify(st.films)); break; }
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => { const g = window.__dbg.game(); g.kill(g.monsters.find((m) => m.boss)); });
  if (film) await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
  const shots = film ? Array.from({ length: 60 }, (_, i) => i / 15) : [0.15, 0.6, 1.0, 1.5, 2.2, 3.0, 3.8];
  const slow = film ? 4 : 1;
  const t0 = Date.now();
  for (let i = 0; i < shots.length; i++) {
    const wait = t0 + shots[i] * 1000 * slow - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f_${String(i).padStart(3, '0')}`);
  }
  if (film) await page.evaluate(() => { window.__dbg.slowmo = 1; });
  const st = await page.evaluate(() => { const g = window.__dbg.game(); const s = g.level.ways.stair; return { stair: s ? [s.x, s.y, s.open, +(s.t ?? -1).toFixed(2)] : null, playing: window.__dbg.renderer.dress.stairPlaying(g) }; });
  log('opened', JSON.stringify(st));
  // (he steps onto its top step: down to the next floor)
  await page.evaluate(() => { const g = window.__dbg.game(); const s = g.level.ways.stair; g.hero.x = s.x + 0.5; g.hero.y = s.y + 0.62; });
  await page.waitForTimeout(1500);
  log('after', JSON.stringify(await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, town: g.level.town }; })));
}
