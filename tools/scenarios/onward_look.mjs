// EXITS, FLOORS 6 TO 10: THE WAYS ON AND WHERE EACH FLOOR BEGINS, IN THE GAME (game/ways.ts ONWARD; the art chat's pictures,
// art/act1_ways.ts, drawn by render/dress.ts). For each floor: where it begins; the way on shut; the boss struck down and its
// film playing; open; walked into, on to the next floor. Pictures, and checks of what the rules do. Not his yes.
//   node tools/playtest.mjs --file dist/exits.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/onward_look.mjs --out shots/onward/look
// SEED: the run's dice (5). FLOORS: which (6,7,8,9,10). FILM=1: frames of each film, 10 a second of its time.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED) || 5;
  const floors = (process.env.FLOORS || '6,7,8,9,10').split(',').map(Number);
  const film = !!process.env.FILM;
  await page.evaluate((s) => {
    const d = window.__dbg;
    d.exits.on = true;
    d.saving(false);
    d.run('warrior', s);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
  }, seed);
  const quiet = () => page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const W = g.level.ways;
    return { depth: g.depth, town: g.level.town, a1: W?.a1 ?? null, awake: W?.onward?.awake, leaving: g.leaving?.to ?? null, hero: [+g.hero.x.toFixed(2), +g.hero.y.toFixed(2)] };
  });
  const filmHas = (key) => page.evaluate((k) => !!window.__dbg.painter.filmOf(k), key);
  const waitFilm = async (key, secs) => {
    for (let k = 0; k < secs; k++) {
      if (await filmHas(key)) return k;
      await page.waitForTimeout(1000);
    }
    return -1;
  };
  for (const depth of floors) {
    // ---- WHERE IT BEGINS ----
    const st = await page.evaluate((k) => {
      const g = window.__dbg.game();
      g.hero.ring = true;
      g.hero.pending = 0;
      // (nothing here is what kills him: he is not to fall while the films are made)
      g.hero.invuln = 1e9;
      g.guide = null;
      g.depth = k; g.cleared = k - 1; g.wayDepth = k; g.enterDungeon();
      g.level.explored.fill(1);
      for (const m of g.monsters) if (!m.boss) m.life = 0;
      const a1 = g.level.ways.a1;
      // (looking into the floor, away from where he came out)
      const u = { 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] }[a1.startDir];
      g.hero.fx = -u[0]; g.hero.fy = -u[1];
      if (!g.hero.fx && !g.hero.fy) g.hero.fx = 1;
      return a1;
    }, depth);
    log(`floor ${depth}`, JSON.stringify(st));
    log('start film', await waitFilm(`start:${depth}:${st.startDir}`, 30));
    await page.waitForTimeout(800);
    await quiet();
    await snap(`f${depth}_start`);
    // (and from a step or two into the floor, looking back at it)
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const a1 = g.level.ways.a1;
      const u = { 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] }[a1.startDir];
      g.hero.x = g.level.floor.start.x - u[0] * 2; g.hero.y = g.level.floor.start.y - u[1] * 2;
      g.hero.fx = u[0]; g.hero.fy = u[1];
    });
    await page.waitForTimeout(500);
    await quiet();
    await snap(`f${depth}_start_back`);
    // ---- THE WAY ON, SHUT ----
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const W = g.level.ways;
      const on = W.onward;
      const u = { 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] }[W.a1.dir];
      g.hero.x = on.x - u[0] * 3.5; g.hero.y = on.y - u[1] * 3.5;
      g.hero.fx = u[0]; g.hero.fy = u[1];
    });
    log('way film', await waitFilm(`onward:${depth}:${st.dir}`, 240));
    await page.waitForTimeout(500);
    await quiet();
    await snap(`f${depth}_shut`);
    // ---- THE BOSS STRUCK DOWN: ITS FILM ----
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const W = g.level.ways;
      const u = { 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] }[W.a1.dir];
      const boss = g.monsters.find((m) => m.boss);
      for (let k = 0; k < 6 && boss && !W.onward.awake; k++) {
        boss.x = g.hero.x - u[0] * 2.5; boss.y = g.hero.y - u[1] * 2.5;
        g.bossReady();
        g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
      }
    });
    // (a boss whose death comes in stages: struck again as each comes)
    for (let k = 0; k < 20 && !(await state()).awake; k++) {
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        const g = window.__dbg.game();
        const W = g.level.ways;
        const boss = g.monsters.find((m) => m.boss && !m.dead);
        if (boss && !W.onward.awake) { g.bossReady(); g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1); }
      });
    }
    log('awake', JSON.stringify(await state()));
    if (film) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
      for (let k = 0; k < 50; k++) {
        await page.waitForTimeout(400);
        await snap(`f${depth}_film_${String(k).padStart(2, '0')}`);
      }
      await page.evaluate(() => { window.__dbg.slowmo = 1; });
    } else {
      await page.waitForTimeout(1300);
      await snap(`f${depth}_opening`);
    }
    await page.waitForTimeout(4500);
    log('open', JSON.stringify(await state()));
    await quiet();
    await snap(`f${depth}_open`);
    // ---- WALKED INTO: ON ----
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const on = g.level.ways.onward;
      g.hero.x = Math.floor(on.x) + 0.5; g.hero.y = Math.floor(on.y) + 0.5;
    });
    for (let k = 0; k < 20; k++) {
      const s = await state();
      if (s.depth !== depth || s.town) break;
      await page.waitForTimeout(250);
    }
    log('on', JSON.stringify(await state()));
  }
}
