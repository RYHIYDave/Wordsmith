// THE WAYS BETWEEN THE FLOORS, IN THE GAME (game/ways.ts EXITS, off; turned on here): the art chat's pictures (art/cave4.ts,
// art/town_ways.ts) where the rules put them. Pictures, and checks of what the rules do as they are played. Not his yes.
//   node tools/playtest.mjs --file dist/exits.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/exits_look.mjs --out shots/exits/look
// SEED: the run's dice (5). FILM=1: frames of the wall giving way, the cage coming up and the gate unbarred, 10 a second of its time.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED) || 5;
  const film = !!process.env.FILM;
  await page.evaluate((s) => {
    const d = window.__dbg;
    d.exits.on = true;
    d.saving(false);
    d.run('warrior', s);
    d.autoLevel = false;
    d.god = true;
  }, seed);
  // (the painter's films take a few seconds: the town's are small)
  const settle = async (ms) => {
    await page.waitForTimeout(ms);
    await page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
  };
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const W = g.level.ways;
    return { town: g.level.town, depth: g.depth, cave: W?.cave?.state, barred: W?.barred, unbar: W?.unbar, shaft: W?.shaft?.state, hero: [+g.hero.x.toFixed(2), +g.hero.y.toFixed(2)] };
  });
  const hero = (x, y, fx = 0.7071, fy = 0.7071) => page.evaluate(([x, y, fx, fy]) => {
    const h = window.__dbg.game().hero;
    h.x = x; h.y = y; h.fx = fx; h.fy = fy;
  }, [x, y, fx, fy]);
  // ---- THE TOWN: the stairs down, the shaft's head with its cage, the gate barred ----
  log('start', JSON.stringify(await state()));
  await settle(3000);
  await hero(15.5, 15.2, 0.7071, 0.7071);
  await settle(800);
  await snap('town_stairs');
  await hero(18.6, 16.2, 0.7071, 0.7071);
  await settle(500);
  await snap('town_shaft');
  await hero(14.5, 8.6, -0.7071, -0.7071);
  await settle(600);
  await snap('town_gate_barred');
  // ---- FLOOR 1: in at the foot of the stairs up, in its gate's arch ----
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const st = g.level.ways.stair;
    g.hero.x = st.x + 0.5; g.hero.y = st.y + (st.wide ?? 1.25) / 2;
  });
  await page.waitForTimeout(2500);
  log('floor 1', JSON.stringify(await state()));
  await settle(2500);
  await snap('floor1_start');
  // ---- FLOOR 4: the wall standing; the boss dead, it gives way; the cave open ----
  const cave = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 4; g.cleared = 3; g.wayDepth = 4; g.enterDungeon();
    g.level.explored.fill(1);
    const W = g.level.ways;
    const s = W.cave.spot;
    const face = s.plane;
    const mid = s.alongX ? { x: s.a + 1.5, y: face } : { x: face, y: s.a + 1.5 };
    // (the hero a few tiles out from the wall, looking at it; the boss's company sent away)
    const out = 3.2;
    g.hero.x = s.alongX ? mid.x + 0.6 : mid.x + out;
    g.hero.y = s.alongX ? mid.y + out : mid.y + 0.6;
    g.hero.fx = -0.7071; g.hero.fy = -0.7071;
    for (const m of g.monsters) if (!m.boss) m.life = 0;
    return { alongX: s.alongX, mid };
  });
  log('cave', JSON.stringify(cave));
  await settle(1500);
  await snap('floor4_wall_still');
  // (its film: the painter makes it after the floor's monsters' pictures, a minute or two here)
  for (let k = 0; k < 200; k++) {
    const has = await page.evaluate(() => { const W = window.__dbg.game().level.ways; return !!window.__dbg.painter.filmOf(`cave:${W.cave.spot.alongX ? 'x' : 'y'}`); });
    if (has) { log('cave film', `after ${k} s`); break; }
    await page.waitForTimeout(1000);
  }
  await settle(300);
  await snap('floor4_wall');
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const boss = g.monsters.find((m) => m.boss);
    boss.x = g.hero.x + 2.5; boss.y = g.hero.y + 2.5;
    g.bossReady();
    g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
  });
  if (film) {
    await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
    for (let k = 0; k < 45; k++) {
      await page.waitForTimeout(400);
      await snap(`cave_f${String(k).padStart(2, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  } else {
    await page.waitForTimeout(1300);
    await snap('floor4_giving');
  }
  await page.waitForTimeout(4500);
  log('cave after', JSON.stringify(await state()));
  await settle(300);
  await snap('floor4_open');
  // ---- FLOOR 5: in at the cave's other end ----
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const s = g.level.ways.cave.spot;
    const m = s.alongX ? { x: s.a + 1.5, y: s.plane - 0.5 } : { x: s.plane - 0.5, y: s.a + 1.5 };
    g.hero.x = m.x; g.hero.y = m.y;
  });
  await page.waitForTimeout(3000);
  log('floor 5', JSON.stringify(await state()));
  await settle(4000);
  await snap('floor5_mouth');
  // ---- THE RIDE UP: the boss dead, the cage down, into it, up into the town's corner ----
  await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const m of g.monsters) if (!m.boss) m.life = 0;
    const boss = g.monsters.find((m) => m.boss);
    g.bossReady();
    g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
  });
  await page.waitForTimeout(9000);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const sh = g.level.ways.shaft;
    g.hero.x = sh.x + 0.5; g.hero.y = sh.y + 0.5;
  });
  for (let k = 0; k < 40; k++) {
    const st = await state();
    if (st.town) break;
    await page.waitForTimeout(250);
  }
  log('in town', JSON.stringify(await state()));
  if (film) {
    for (let k = 0; k < 40; k++) {
      await page.waitForTimeout(100);
      await snap(`arrive_f${String(k).padStart(2, '0')}`);
    }
  } else {
    await page.waitForTimeout(1600);
    await snap('town_arriving');
  }
  await page.waitForTimeout(3000);
  log('arrived', JSON.stringify(await state()));
  // ---- THE GATE, the first time he comes in sight of it after: unbarred ----
  await hero(14.5, 12.5, -0.7071, -0.7071);
  if (film) {
    for (let k = 0; k < 32; k++) {
      await page.waitForTimeout(100);
      await snap(`unbar_f${String(k).padStart(2, '0')}`);
    }
  } else {
    await page.waitForTimeout(700);
    await snap('town_gate_unbarring');
  }
  await page.waitForTimeout(3000);
  log('unbarred', JSON.stringify(await state()));
  await hero(14.5, 9.5, -0.7071, -0.7071);
  await settle(1200);
  await snap('town_gate_after');
}
