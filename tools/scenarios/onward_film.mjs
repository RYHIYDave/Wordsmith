// EXITS, FLOORS 6 TO 10: A FILM FROM THE GAME of each floor's way on (game/ways.ts ONWARD; the art chat's pictures,
// art/act1_ways.ts): where the floor begins, the way on shut, the boss struck down and its film, the way open, and walked
// into, on. Frames as it plays, slowed (<out>_<floor>_f0000.png ...), for a video put together after. Not a test.
//   node tools/playtest.mjs --file dist/exits.html --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/onward_film.mjs --out shots/onward/film/x
// SEED: the run's dice (5). FLOORS: which (6,7,8,9,10). SLOW: how slowed (0.35).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED) || 5;
  const SLOW = Number(process.env.SLOW) || 0.35;
  const floors = (process.env.FLOORS || '6,7,8,9,10').split(',').map(Number);
  let part = 6;
  let n = 0;
  const frame = async () => snap(`${part}_f${String(n++).padStart(4, '0')}`);
  const rec = async (ms, until = null) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      await frame();
      if (until && (await page.evaluate(until))) break;
    }
  };
  const quiet = () => page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
  const slow = (k) => page.evaluate((k) => { window.__dbg.slowmo = k; }, k);
  const filmHas = (key) => page.evaluate((k) => !!window.__dbg.painter.filmOf(k), key);
  const waitFilm = async (key, secs) => {
    for (let k = 0; k < secs; k++) {
      if (await filmHas(key)) return k;
      await page.waitForTimeout(1000);
    }
    return -1;
  };
  await page.evaluate((s) => {
    const d = window.__dbg;
    d.exits.on = true;
    d.saving(false);
    d.run('warrior', s);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
  }, seed);
  const U = "({ 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] })";
  for (const depth of floors) {
    part = depth;
    n = 0;
    await slow(1);
    const st = await page.evaluate(([k, U]) => {
      const g = window.__dbg.game();
      const u = eval(U);
      g.hero.ring = true;
      g.hero.pending = 0;
      g.hero.invuln = 1e9;
      g.guide = null;
      g.depth = k; g.cleared = k - 1; g.wayDepth = k; g.enterDungeon();
      g.hero.invuln = 1e9;
      for (const m of g.monsters) if (!m.boss) m.life = 0;
      // (the boss kept off while the film is painted: far back in his ground)
      const a1 = g.level.ways.a1;
      const s = u[a1.startDir];
      g.hero.fx = -s[0]; g.hero.fy = -s[1];
      return a1;
    }, [depth, U]);
    log(`floor ${depth}`, JSON.stringify(st));
    log('start film', await waitFilm(`start:${depth}:${st.startDir}`, 30));
    // (the floor's name across the screen as he comes in: wait it out)
    await page.waitForTimeout(500);
    await quiet();
    await slow(SLOW);
    // ---- WHERE IT BEGINS: he walks a few steps in from it ----
    const into = await page.evaluate((U) => { const g = window.__dbg.game(); const s = eval(U)[g.level.ways.a1.startDir]; return s; }, U);
    const keyOf = (dx, dy) => {
      // (+x is down and to the right on the screen: S and D; -x up and left: W and A; +y down and left: S and A; -y up and right: W and D)
      if (dx > 0) return ['KeyS', 'KeyD'];
      if (dx < 0) return ['KeyW', 'KeyA'];
      if (dy > 0) return ['KeyS', 'KeyA'];
      return ['KeyW', 'KeyD'];
    };
    const inKeys = keyOf(-into[0], -into[1]);
    await rec(1200);
    for (const k of inKeys) await page.keyboard.down(k);
    await rec(2600);
    for (const k of inKeys) await page.keyboard.up(k);
    await rec(600);
    // ---- THE WAY ON, SHUT ----
    await slow(1);
    await page.evaluate((U) => {
      const g = window.__dbg.game();
      const W = g.level.ways;
      const u = eval(U)[W.a1.dir];
      g.level.explored.fill(1);
      g.hero.x = W.onward.x - u[0] * 4; g.hero.y = W.onward.y - u[1] * 4;
      g.hero.fx = u[0]; g.hero.fy = u[1];
      const boss = g.monsters.find((m) => m.boss);
      if (boss) { boss.x = g.hero.x - u[0] * 3; boss.y = g.hero.y - u[1] * 3; }
    }, U);
    // (the game held still while its film is painted: nobody fights)
    await slow(0);
    log('way film', await waitFilm(`onward:${depth}:${st.dir}`, 240));
    await slow(1);
    await page.evaluate((U) => {
      const g = window.__dbg.game();
      const W = g.level.ways;
      const u = eval(U)[W.a1.dir];
      g.hero.x = W.onward.x - u[0] * 4; g.hero.y = W.onward.y - u[1] * 4;
      g.hero.life = g.hero.d.maxLife;
    }, U);
    await quiet();
    await slow(SLOW);
    await rec(1500);
    // ---- THE BOSS STRUCK DOWN: ITS FILM ----
    await page.evaluate((U) => {
      const g = window.__dbg.game();
      const W = g.level.ways;
      const u = eval(U)[W.a1.dir];
      const boss = g.monsters.find((m) => m.boss);
      for (let k = 0; k < 6 && boss && !W.onward.awake; k++) {
        boss.x = g.hero.x - u[0] * 2.5; boss.y = g.hero.y - u[1] * 2.5;
        g.bossReady();
        g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
      }
    }, U);
    for (let k = 0; k < 30 && !(await page.evaluate(() => window.__dbg.game().level.ways.onward.awake)); k++) {
      await rec(300);
      await page.evaluate(() => {
        const g = window.__dbg.game();
        const W = g.level.ways;
        const boss = g.monsters.find((m) => m.boss && !m.dead);
        if (boss && !W.onward.awake) { g.bossReady(); g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1); }
      });
    }
    log('awake', await page.evaluate(() => window.__dbg.game().level.ways.onward.awake));
    await rec(20000, () => window.__dbg.game().level.ways.a1.open);
    await rec(1800);
    // ---- WALKED INTO IT: ON ----
    const onKeys = keyOf(...(await page.evaluate((U) => eval(U)[window.__dbg.game().level.ways.a1.dir], U)));
    for (const k of onKeys) await page.keyboard.down(k);
    await rec(9000, () => { const g = window.__dbg.game(); return !!g.leaving; });
    for (const k of onKeys) await page.keyboard.up(k);
    if (!(await page.evaluate(() => !!window.__dbg.game().leaving))) {
      log('walked in', 'no: put into it');
      await page.evaluate(() => {
        const g = window.__dbg.game();
        const on = g.level.ways.onward;
        g.hero.x = Math.floor(on.x) + 0.5; g.hero.y = Math.floor(on.y) + 0.5;
      });
    }
    await rec(4000, () => { const g = window.__dbg.game(); return g.depth !== depth || g.level.town; });
    log('on', await page.evaluate(() => ({ depth: window.__dbg.game().depth, town: window.__dbg.game().level.town })));
  }
}
