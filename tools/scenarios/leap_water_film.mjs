// THE SWIPE OVER WATER (game/water.ts LEAP_WATER, off; turned on here): A FILM FROM THE GAME for his yes. Floor 13, the Millrace:
// the hero in the mill's yard beside the race, his swipe move across it onto the strip past the wheel, the walk up the strip to
// the chest, and the swipe on over the river to its far bank. Frames as it plays, slowed (<out>_<cls>_f0000.png ...), for a video
// put together after. Each swipe's landing is logged, with '!!' if he stands in the water or did not cross. Not a test.
//   node tools/playtest.mjs --file dist/next.html --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/leap_water_film.mjs --out shots/leap/x
// SEED: the run's dice (5). CLASSES: whose swipes (warrior,ranger,mage). SLOW: how slowed (0.4).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED) || 5;
  const SLOW = Number(process.env.SLOW) || 0.4;
  const classes = (process.env.CLASSES || 'warrior,ranger,mage').split(',');
  let part = '';
  let n = 0;
  const frame = async () => snap(`${part}_f${String(n++).padStart(4, '0')}`);
  const rec = async (ms) => {
    const end = Date.now() + ms;
    while (Date.now() < end) await frame();
  };
  const held = new Set();
  const hold = async (want) => {
    for (const k of [...held]) if (!want.includes(k)) { await page.keyboard.up(k); held.delete(k); }
    for (const k of want) if (!held.has(k)) { await page.keyboard.down(k); held.add(k); }
  };
  const walkTo = async (x, y, ms) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      await frame();
      const h = await page.evaluate(() => { const h = window.__dbg.game().hero; return { x: h.x, y: h.y }; });
      const dx = x - h.x;
      const dy = y - h.y;
      if (Math.hypot(dx, dy) < 0.35) break;
      const sx = (dx - dy) * 2;
      const sy = dx + dy;
      const m = Math.hypot(sx, sy);
      const want = [];
      if (sx > 0.38 * m) want.push('KeyD');
      if (sx < -0.38 * m) want.push('KeyA');
      if (sy > 0.38 * m) want.push('KeyS');
      if (sy < -0.38 * m) want.push('KeyW');
      await hold(want);
    }
    await hold([]);
  };
  /** His swipe move toward (x, y), as a swipe makes it; then where he landed. */
  const swipe = async (x, y, what) => {
    await page.evaluate(([x, y]) => {
      const g = window.__dbg.game();
      for (const s of g.hero.skills) { s.cd = 0; s.charges = Math.max(1, s.charges); }
      g.useEvasive(x, y, { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false });
    }, [x, y]);
    await rec(2200);
    const at = await page.evaluate(() => {
      const g = window.__dbg.game(); const h = g.hero; const L = g.level; const i = Math.floor(h.y) * L.floor.w + Math.floor(h.x);
      return { x: +h.x.toFixed(2), y: +h.y.toFixed(2), ground: L.walk[i] === 1, water: !!(L.water && L.water[i]) };
    });
    log(`${what}: landed`, JSON.stringify(at));
    return at;
  };
  for (const cls of classes) {
    part = cls;
    n = 0;
    const m = await page.evaluate(([cls, seed]) => {
      const d = window.__dbg;
      d.leapWater.on = true;
      d.saving(false);
      d.run(cls, seed);
      d.seasoned(20);
      d.autoLevel = false; d.autoWords = false; d.god = true;
      const g = d.game();
      g.hero.ring = true; g.hero.pending = 0; g.guide = null;
      g.depth = 13; g.cleared = 12; g.wayDepth = 13; g.enterDungeon();
      g.hero.invuln = 1e9;
      g.bossMet = true;
      g.monsters.length = 0;
      g.level.explored.fill(1);
      // (the mill, as game/act2/millrace.ts millOf and millWorks have it)
      const r = g.level.land.race;
      const s = r[2][1] > r[1][1] ? 1 : -1;
      const cx = Math.floor(r[1][0]);
      const wy = Math.floor((r[1][1] + r[2][1]) / 2);
      const chest = [cx + 2, wy - 3 * s];
      g.hero.x = cx - 0.5; g.hero.y = chest[1] + 0.5;
      g.hero.fx = 1; g.hero.fy = 0;
      return { cx, wy, s, chest, water: !!g.level.water };
    }, [cls, seed]);
    log(`${cls}: the mill`, JSON.stringify(m));
    if (!m.water) log('!! no water marked: LEAP_WATER is not on');
    await page.waitForTimeout(2500);
    await page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
    await page.evaluate((k) => { window.__dbg.slowmo = k; }, SLOW);
    await rec(1500);
    // ---- over the race, onto the strip ----
    const a = await swipe(m.cx + 1.5, m.chest[1] + 0.5, `${cls}, over the race`);
    if (!a.ground || a.water || a.x < m.cx + 1) log(`!! ${cls}: did not land on the strip past the race`);
    // ---- up the strip to the chest ----
    await walkTo(m.chest[0] - 0.4, m.chest[1] + 0.5 + m.s, 6000);
    await rec(1500);
    // ---- over the river, to its far bank ----
    const b = await swipe(m.cx + 7.5, m.chest[1] + 0.5 + m.s, `${cls}, over the river`);
    if (!b.ground || b.water || b.x < m.cx + 5.5) log(`!! ${cls}: did not land on the river's far bank`);
    await rec(1200);
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  }
}
