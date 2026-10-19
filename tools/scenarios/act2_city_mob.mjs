// ACT 2, THE HUSH (behind ACT2, off; switched on here by the test hook, __dbg.act2): ONE OF FLOOR 11'S FOUR, THE CITY'S OWN
// (game/act1_rules/hushed.ts, watch.ts, scribe.ts, hound.ts), FIGHTING THE HERO ON FLOOR 11. For looking at: pictures at
// moments of its blow (its warning, the blow, after), and of its death.
//   node tools/build_to.mjs dist/act2.html
//   KIND=watch node tools/playtest.mjs --file dist/act2.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_city_mob.mjs --out shots/act2_k11a/watch
// KIND: hushed, watch, scribe or hound. N: how many (hushed 3: one of each look; the others 1). FAR: how far off the hero
// stands (by kind). LEAD=1 (the watch): a yellow pack, its sergeant and a watchman, the sergeant's brace of hounds with them.
// AT: the moments of its act to take a picture at, seconds (by kind: its warning, its blow, after). DIE=1: then one of them
// is killed (the others taken off), and its death taken at three moments. HEEL=1: first, pictures as they come in (the
// watch's hounds at its heels: with LEAD=1 and FAR=7). SEED: the floor. The game is held still for each picture.
import { log } from './lib.mjs';

const MOMENTS = {
  hushed: [0.32, 0.6, 0.85],
  watch: [0.5, 0.8, 0.9],
  scribe: [0.42, 0.75, 1.3],
  hound: [0.32, 0.6, 0.75],
};
const FARS = { hushed: 2.0, watch: 2.6, scribe: 3.6, hound: 2.0 };
const DEATHS = { hushed: [0.4, 1.2, 2.2], watch: [0.45, 1.3, 2.6], scribe: [0.35, 0.9, 2.4], hound: [0.6, 1.2, 2.0] };

export default async function (page, snap) {
  const kind = process.env.KIND || 'hushed';
  const n = Number(process.env.N || (kind === 'hushed' ? 3 : 1));
  const far = Number(process.env.FAR || FARS[kind] || 1.5);
  const lead = !!process.env.LEAD;
  const seed = Number(process.env.SEED || 3);
  const at = (process.env.AT ? process.env.AT.split(',').map(Number) : MOMENTS[kind]) || [0.6];
  await page.evaluate(([s]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', s);
    D.seasoned(20);
    D.autoLevel = false;
    D.autoWords = false;
    D.god = true;
    D.act2(true, 11);
  }, [seed]);
  // (the floor's name card, and the painter at its first frames)
  await page.waitForTimeout(4000);
  // (the hero taken to the floor's first open area along the way that is not the start, and nothing there yet: the
  // place's own name card comes up as he comes into it, and goes)
  await page.evaluate(([dist]) => {
    const g = window.__dbg.game();
    const L = g.level;
    L.explored.fill(1);
    g.monsters = [];
    g.boss = null;
    const land = L.land;
    const a = land.areas.find((q) => q.role === 'path') || land.areas[0];
    g.hero.x = a.blob.x - dist * 0.7071;
    g.hero.y = a.blob.y + dist * 0.7071;
  }, [far]);
  await page.waitForTimeout(6000);
  const where = await page.evaluate(([k, count, dist, isLead]) => {
    const g = window.__dbg.game();
    const L = g.level;
    const land = L.land;
    const a = land.areas.find((q) => q.role === 'path') || land.areas[0];
    const cx = a.blob.x;
    const cy = a.blob.y;
    const h = g.hero;
    h.x = cx - dist * 0.7071;
    h.y = cy + dist * 0.7071;
    const them = [];
    if (isLead) {
      them.push(g.spawn(k, cx, cy, 7, 1, false, g.rng, null, { rarity: 'leader', words: [] }));
      them.push(g.spawn(k, cx + 0.9, cy - 0.9, 7, 0, false, g.rng, null, { rarity: 'minion', words: [] }));
    } else {
      for (let i = 0; i < count; i++) {
        // (a crowd in an arc before the hero, each coming at him from its own side)
        const ang = Math.atan2(cy - h.y, cx - h.x) + (i - (count - 1) / 2) * 0.95;
        them.push(g.spawn(k, h.x + Math.cos(ang) * dist, h.y + Math.sin(ang) * dist, 7, 0, false, g.rng));
      }
    }
    for (const m of g.monsters) {
      m.words = [];
      m.state = 'chase';
      m.life = m.maxLife = 1e6;
      m.cd = 0;
    }
    const b = them[0];
    const ddx = b.x - h.x;
    const ddy = b.y - h.y;
    const dd = Math.hypot(ddx, ddy) || 1;
    h.fx = ddx / dd;
    h.fy = ddy / dd;
    return { hero: [+h.x.toFixed(2), +h.y.toFixed(2)], it: [+b.x.toFixed(2), +b.y.toFixed(2)], kinds: g.monsters.map((m) => `${m.kind}${m.form ? m.form : ''}`), n: g.monsters.length };
  }, [kind, n, far, lead]);
  log('it', JSON.stringify(where));
  // (watched slowed, the game held still for each picture)
  await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
  const hold = async (name) => {
    await page.evaluate(() => { window.__dbg.slowmo = 0; });
    await page.waitForTimeout(150);
    await snap(name);
    await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
  };
  // (the act watched: the first begun, then that one to its end)
  const first = (n) => page.evaluate(([k, want]) => {
    const g = window.__dbg.game();
    const m = g.monsters.find((q) => !q.dead && q.kind === k && q.act && (want < 0 || q.act.n === want));
    return m ? { id: m.act.id, t: m.act.t, n: m.act.n } : null;
  }, [kind, n]);
  // (HEEL=1: pictures as they come in, before any blow: the watch's hounds at its heels)
  if (process.env.HEEL) {
    const from = await page.evaluate(() => window.__dbg.clock());
    for (const [i, d] of [1.0, 2.5, 4.0].entries()) {
      await page.waitForFunction(([f, w]) => window.__dbg.clock() - f >= w, [from, d], { timeout: 30000 }).catch(() => {});
      await hold(`heel_${i}`);
      log('heel', JSON.stringify(await page.evaluate(() => {
        const g = window.__dbg.game();
        const h = g.hero;
        return { clock: +window.__dbg.clock().toFixed(2), them: g.monsters.map((m) => `${m.kind}${m.form || ''} ${m.state} ${m.gait ? m.gait.mode : '-'} d${Math.hypot(m.x - h.x, m.y - h.y).toFixed(2)}`) };
      })));
    }
  }
  let taken = 0;
  let serial = -1;
  const t0 = Date.now();
  while (taken < at.length && Date.now() - t0 < 60000) {
    const a = await first(serial);
    if (a && a.t >= at[taken]) {
      serial = a.n;
      log('act', `${a.id} @ ${a.t.toFixed(3)}`);
      await hold(`act_${taken}`);
      taken++;
    } else await page.waitForTimeout(15);
  }
  if (taken < at.length) log('!!', `only ${taken} of its moments were seen`);
  // (and one of them killed: its death, at three moments)
  if (process.env.DIE) {
    const deaths = DEATHS[kind];
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    await page.evaluate((k) => {
      const g = window.__dbg.game();
      // (the one watched; the others taken off, so that its death is seen whole)
      const m = g.monsters.find((q) => !q.dead && q.kind === k);
      g.monsters = g.monsters.filter((q) => q === m);
      g.perils.length = 0;
      if (m) {
        // (set beside the hero, to the right of him on the screen, facing him: in the clear)
        const h = g.hero;
        m.x = h.x + 1.3;
        m.y = h.y - 1.3;
        m.fx = -0.7071;
        m.fy = 0.7071;
        m.act = undefined;
        m.state = 'chase';
        g.kill(m);
      }
      window.__died = window.__dbg.clock();
    }, kind);
    for (let i = 0; i < deaths.length; i++) {
      await page.waitForFunction((d) => window.__dbg.clock() - window.__died >= d, deaths[i], { timeout: 20000 }).catch(() => {});
      await hold(`die_${i}`);
    }
  }
}
