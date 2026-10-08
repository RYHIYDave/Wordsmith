// LEDGES, STAIRS AND GAPS, FILMED IN THE GAME: the practice room in the hall built for them
// (level.ts, makeLedgeHall), a picture every thirtieth of a second of the GAME's time (the game is
// slowed so that the camera can keep up). Frames go to <out>_f000.png ...
//   node tools/playtest.mjs --file dist/ledges.html --hash "hall=ledges" --size 960x540 --scenario tools/scenarios/film_ledges.mjs --out shots/ledges/film/leap
// MOVE = leap   the warrior leaps from the floor up onto the terrace, and down again
//        roll   the ranger rolls over the gap to the island, and back
//        warp   the mage warps over the pit, and back
//        round  the hero stands on the terrace; three skeletons under the ledge go round by the stairs
//        stairs the hero walks up a flight and down it
const FILMS = {
  leap: { cls: 'warrior', hero: [12.5, 12.7], face: [0, -1], seconds: 2.0, acts: [[0.2, 'swipe', 12.5, 9.2], [1.1, 'swipe', 12.5, 13.2]] },
  roll: { cls: 'ranger', hero: [14.7, 21.5], face: [-1, 0], seconds: 1.9, acts: [[0.2, 'swipe', 10.5, 21.5], [1.05, 'swipe', 16.0, 21.5]] },
  warp: { cls: 'mage', hero: [17.2, 15.5], face: [1, 0], seconds: 1.8, acts: [[0.2, 'swipe', 22.5, 15.5], [1.0, 'swipe', 16.5, 15.5]] },
  round: { cls: 'warrior', hero: [12.5, 9.4], face: [0, 1], seconds: 4.2, fps: 20, monsters: [['skeleton', 11.6, 12.6], ['skeleton', 12.6, 12.9], ['skeleton', 13.6, 12.6]], acts: [[0.3, 'wake']] },
  stairs: { cls: 'mage', hero: [9.9, 13.2], face: [0, -1], seconds: 3.0, fps: 20, acts: [[0.2, 'walk', 0, -1], [1.4, 'walk', 0, 0], [1.6, 'walk', 0, 1], [2.8, 'walk', 0, 0]] },
};

export default async function (page, snap) {
  const film = FILMS[process.env.MOVE || 'leap'];
  if (!film) throw new Error('no such film');
  await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7, 'ledges'); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, [film.cls]);
  await page.waitForTimeout(400);
  await page.evaluate((film) => {
    const g = window.__dbg.game(); const h = g.hero;
    h.x = film.hero[0]; h.y = film.hero[1];
    const n = Math.hypot(film.face[0], film.face[1]); h.fx = film.face[0] / n; h.fy = film.face[1] / n;
    h.invuln = 1e9;
    for (const [kind, x, y] of film.monsters || []) {
      const m = g.spawn(kind, x, y, 900, 0, false, g.rng);
      m.xp = 0; m.seen = true;
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / d; m.fy = (h.y - m.y) / d;
    }
    // (they sleep until the film wakes them; the hero walks as the film says)
    window.__film = { asleep: true, mx: 0, my: 0 };
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      const f = window.__film;
      if (f.asleep) for (const m of g.monsters) m.state = 'sleep';
      c.mx = f.mx; c.my = f.my;
      h.invuln = 1e9;
      return run(dt, c);
    };
  }, film);
  // (the first frames of everything in the picture are painted before the film begins)
  await page.waitForTimeout(Number(process.env.WAIT || 5000));
  const slow = 0.1;
  const FPS = film.fps || 30;
  const step = 1000 / FPS / slow;
  const total = Math.ceil(film.seconds * FPS);
  const acts = film.acts.map((a) => ({ at: Math.round(a[0] * FPS), what: a[1], a: a[2], b: a[3] }));
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    for (const act of acts) {
      if (act.at !== i) continue;
      await page.evaluate((act) => {
        const g = window.__dbg.game(); const h = g.hero; const f = window.__film;
        if (act.what === 'swipe') {
          h.mana = h.d.maxMana;
          for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
          g.useEvasive(act.a, act.b, { evade: true, hold: false, mx: 0, my: 0 });
        } else if (act.what === 'wake') {
          f.asleep = false;
          for (const m of g.monsters) { m.state = 'sleep'; g.wakeUp(m); m.cd = 1e9; }
        } else if (act.what === 'walk') {
          f.mx = act.a; f.my = act.b;
        }
      }, act);
    }
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  console.log('late by', Date.now() - (t0 + (total - 1) * step), 'ms at the end');
  console.log('hero', await page.evaluate(() => { const h = window.__dbg.game().hero; return [h.x.toFixed(2), h.y.toFixed(2)].join(', '); }));
}
