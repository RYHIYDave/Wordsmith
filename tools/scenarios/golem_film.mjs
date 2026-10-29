// HER GOLEM'S BLOWS, filmed in the game for the owner (28 Oct 2026, at his words of 20:25 and 20:26: “The golem’s slam is
// too slow to really plan a good hit”, “And his normal punch doesn’t really look very good”). In the practice room, among
// skeletons that stand and cannot die: her Golem whistled out, punching the one before it; then her hold twice, its ground
// pound. A picture every thirtieth of a second of the GAME's time (as tools/scenarios/tinkerer_film.mjs).
//   node tools/playtest.mjs --file dist/trial.html --size 1280x720 --scenario tools/scenarios/golem_film.mjs --out shots/gfilm/g
//   env: LABEL=now|before (the captions), SECONDS=11

const FPS = 30;
const PLAN = [
  [0.3, 'hold', 2.5, 0.0],
  [6.0, 'hold', 2.5, 0.0],
  [8.6, 'hold', 2.5, 0.0],
];
const PARTS = {
  now: [
    [0.0, 'NOW', 'Her Golem, whistled out.'],
    [1.0, 'NOW: ITS PUNCH', 'An uppercut: fist dragged back, scooped up through them.'],
    [5.9, 'NOW: GROUND POUND', 'Its fist hits the floor under 0.5 s after her whistle.'],
  ],
  before: [
    [0.0, 'BEFORE', 'Her Golem, whistled out.'],
    [1.0, 'BEFORE: ITS PUNCH', 'Its fist driven out at them.'],
    [5.9, 'BEFORE: GROUND POUND', 'Its fist hit the floor 1.1 s after her whistle.'],
  ],
};

export default async function (page, snap) {
  const seconds = Number(process.env.SECONDS || 11);
  const label = process.env.LABEL === 'before' ? 'before' : 'now';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.practice('tinkerer', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero; h.fx = 1; h.fy = 0;
  });
  await page.waitForTimeout(500);
  // (the controls a player's hand would give, by the game's clock; the skeletons set before the Golem as it arrives)
  await page.evaluate((plan) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const x0 = h.x; const y0 = h.y;
    const f = { t: 0, plan: plan.slice(), log: [], placed: false };
    window.__gfilm = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      // (no lines of the practice room's over the picture)
      if (d.fx) d.fx.messages.length = 0;
      while (f.plan.length && f.plan[0][0] <= f.t) {
        const [, what, a, b] = f.plan.shift();
        h.mana = h.d.maxMana;
        for (const s of h.skills) if (s) s.cd = 0;
        // (her hold aimed at the skeleton before it, once they are there)
        const sk = f.ids && g.monsters.find((q) => q.id === f.ids[0] && !q.dead);
        if (what === 'hold') { c.cast = true; c.castX = sk ? sk.x : x0 + a; c.castY = sk ? sk.y : y0 + b; }
        f.log.push(`${f.t.toFixed(2)} ${what}`);
      }
      const gm = g.golem;
      if (gm && !f.placed && gm.act !== 'arrive') {
        f.placed = true;
        // (one before it, one beside that: it punches the nearest; its pound catches both)
        f.ids = [];
        // (she stands back from it, a little up the screen, so that it is seen fighting them)
        h.x = gm.x + 0.5; h.y = gm.y - 2.5; h.fx = 0.2; h.fy = 1.0;
        for (const [dx, dy] of [[1.45, 0.0], [1.9, 1.0]]) {
          const m = g.spawn('skeleton', gm.x + dx, gm.y + dy, 1, 0, false, g.rng);
          g.wakeUp(m);
          m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9;
          m.state = 'recover'; m.t = 1e9; m.anim = 'idle';
          const far = Math.hypot(gm.x - m.x, gm.y - m.y) || 1; m.fx = (gm.x - m.x) / far; m.fy = (gm.y - m.y) / far;
          f.ids.push(m.id);
        }
        f.log.push(`${f.t.toFixed(2)} skeletons set before the Golem`);
      }
      const out = run(dt, c);
      for (const e of g.events) if (e.t === 'golemPunch' || e.t === 'golemPound') f.log.push(`${f.t.toFixed(2)} ${e.t}`);
      return out;
    };
  }, PLAN);
  const where = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return window.__dbg.at(h.x, h.y); });
  snap.note('film', { fps: FPS, from: 0, parts: PARTS[label], hero: where, size: await page.evaluate(() => [innerWidth, innerHeight]) });

  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
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
  console.log((await page.evaluate(() => window.__gfilm.log)).join('\n'));
}
