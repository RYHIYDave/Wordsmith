// HER GOLEM'S ROCKET JUMP AND ITS RUN, THE ART CHAT'S, IN THE GAME (art/golem_rocket_fx.ts, behind GOLEM_ROCKET: switched on here
// with __dbg.golemRocket), filmed for the owner before it goes live (his word, 2 Nov 2026, 21:29: “And the golem is gonna need
// that rocket jump for positioning, and probably more movespeed”). In the practice room, among skeletons that stand and cannot
// die: her Golem standing by her, to her left; skeletons off to her right, eight tiles off it: it rocket-jumps at them past
// her, from in front, and punches; then skeletons back to her left: it rocket-jumps at those, from behind; then, its jump
// held, skeletons up the screen and down it: its gallop from behind and from in front. A picture every thirtieth of a second
// of the GAME's time (as golem_film.mjs). (The practice room's open lanes run along its floor's two ways, between its pillars.)
// Its film for him: docs/mockups/golem_rocket/pictures/golem_rocket_in_game.mp4, these frames captioned, 30 a second.
//   node tools/build_to.mjs dist/rocket.html
//   node tools/playtest.mjs --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/golem_rocket_film.mjs --file dist/rocket.html --out shots/rocket/x
//   env: FILM_SECONDS=12 (how long the film is)

const FPS = 30;
/**
 * (seconds into the film) what is set before the Golem: where (tiles along a way from the Golem, 'golem', or a spot from her,
 * 'her'), and whether it may jump.
 */
const PLAN = [
  [0.5, 'front', 'golem', [0.995, -0.1], 7.6, true],
  [3.6, 'behind', 'golem', [-0.995, 0.1], 7.6, true],
  [6.7, 'gallop up', 'her', [-1.5, -6.5], 0, false],
  [8.8, 'gallop down', 'her', [-1.2, 6.5], 0, false],
];
const PARTS = [
  [0.0, 'ITS ROCKET JUMP, IN THE GAME', 'Her Golem by her side.'],
  [0.5, 'ROCKET JUMP, FROM IN FRONT', 'Crouch, stacks down, blast off; up three times its height; slam.'],
  [3.6, 'ROCKET JUMP, FROM BEHIND', 'The same jump, flying away from us.'],
  [6.7, 'ITS RUN: THE GALLOP', '5.5 tiles a second: fist planted, body vaulting.'],
];
/** Which way she faces (her Golem keeps a little behind her: to the left of her on the screen, clear of her). */
const FACE = [0.941, 0.339];

export default async function (page, snap) {
  const seconds = Number(process.env.FILM_SECONDS || 12);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.golemRocket(true);
    d.practice('tinkerer', 5); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(500);
  await page.evaluate((face) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const f = { t: 0, log: [], film: -1, plan: null, ids: [] };
    window.__grf = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      if (d.fx) d.fx.messages.length = 0;
      for (const s of h.skills) if (s) s.cd = 0;
      h.mana = h.d.maxMana;
      h.fx = face[0]; h.fy = face[1];
      // (her hold: her Golem whistled out beside her)
      if (f.t > 0.1 && !f.called) { f.called = true; c.cast = true; c.castX = h.x - 1; c.castY = h.y - 1; }
      const gm = g.golem;
      if (f.film >= 0 && gm) {
        const ft = f.t - f.film;
        while (f.plan.length && f.plan[0][0] <= ft) {
          const [, what, from, way, far, jump] = f.plan.shift();
          const at = from === 'golem' ? [gm.x + way[0] * far, gm.y + way[1] * far] : [h.x + way[0], h.y + way[1]];
          const run = from === 'golem' ? way : [(at[0] - gm.x) / Math.hypot(at[0] - gm.x, at[1] - gm.y), (at[1] - gm.y) / Math.hypot(at[0] - gm.x, at[1] - gm.y)];
          // (the last ones gone; two set before it, eight tiles off: one there, one beside it)
          for (const id of f.ids) { const k = g.monsters.findIndex((m) => m.id === id); if (k >= 0) g.monsters.splice(k, 1); }
          f.ids = [];
          for (const [a, b] of [[0, 0], [0.75, -0.45]]) {
            const x = at[0] - run[1] * a + run[0] * b;
            const y = at[1] + run[0] * a + run[1] * b;
            const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
            g.wakeUp(m);
            m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9;
            m.state = 'recover'; m.t = 1e9; m.anim = 'idle';
            const q = Math.hypot(gm.x - m.x, gm.y - m.y) || 1; m.fx = (gm.x - m.x) / q; m.fy = (gm.y - m.y) / q;
            f.ids.push(m.id);
          }
          gm.jumpCd = jump ? 0 : 1e9;
          f.log.push(`${ft.toFixed(2)} ${what}: set ${Math.hypot(at[0] - gm.x, at[1] - gm.y).toFixed(1)} tiles off it at ${at[0].toFixed(2)},${at[1].toFixed(2)} (${Math.hypot(h.x - at[0], h.y - at[1]).toFixed(1)} off her)`);
        }
      }
      const was = gm ? gm.act : '';
      const out = run(dt, c);
      const ft = f.film >= 0 ? f.t - f.film : -1;
      if (gm && gm.act !== was) f.log.push(`${ft.toFixed(2)} ${gm.act}${gm.act === 'jump' ? ` (${gm.fx.toFixed(2)}, ${gm.fy.toFixed(2)}) from ${gm.x.toFixed(2)},${gm.y.toFixed(2)} to ${gm.ax.toFixed(2)},${gm.ay.toFixed(2)}` : ''}`);
      for (const e of g.events) {
        if (e.t === 'bombsAway' || e.t === 'golemArrive') f.log.push(`${ft.toFixed(2)} ${e.t}${e.rocket ? ' (its rocket)' : ''} at ${e.x.toFixed(2)},${e.y.toFixed(2)}`);
      }
      return out;
    };
  }, FACE);
  // (her Golem out and settled by her side, its frames painted ahead meanwhile)
  await page.waitForFunction(() => { const g = window.__dbg.game(); return g.golem && g.golem.act !== 'arrive' && window.__grf.t > 2; }, null, { timeout: 120000 });
  const painted = await page.evaluate(() => ({ frames: window.__dbg.painting.frames, ms: Math.round(window.__dbg.painting.ms) }));
  console.log('painted so far', JSON.stringify(painted));
  // (and stood exactly where it keeps by her, a little behind her, as the game puts it: game.ts stepGolem)
  // (time held still from here, so that the film's first frame is the plan's first moment)
  const c0 = await page.evaluate((plan) => {
    const d = window.__dbg; d.slowmo = 1e-6;
    const g = d.game(); const h = g.hero; const gm = g.golem; const f = window.__grf;
    gm.x = h.x - h.fx * 0.8 - h.fy * 1.7; gm.y = h.y - h.fy * 0.8 + h.fx * 1.7; gm.act = 'stand'; gm.actT = 0; gm.fx = 0.995; gm.fy = -0.1;
    f.plan = plan.slice(); f.film = f.t;
    f.log.push(`her at ${h.x.toFixed(2)},${h.y.toFixed(2)}; it at ${gm.x.toFixed(2)},${gm.y.toFixed(2)}`);
    return d.clock();
  }, PLAN);
  const where = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return window.__dbg.at(h.x, h.y); });
  snap.note('film', { fps: FPS, from: 0, parts: PARTS, hero: where, size: await page.evaluate(() => [innerWidth, innerHeight]) });

  const slow = 0.05;
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__grf.log)).join('\n'));
  console.log('painted in all', JSON.stringify(await page.evaluate(() => ({ frames: window.__dbg.painting.frames, ms: Math.round(window.__dbg.painting.ms) }))));
}
