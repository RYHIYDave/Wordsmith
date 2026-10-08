// Monsters' deaths, filmed in the game: figures stood round the hero in the practice room and
// killed all at once, a picture every thirtieth of a second of the GAME's time (the game is slowed
// so that the camera can keep up). Frames go to <out>_f000.png ...
//   WHO=brute@-84,-40,guardian@84,-40,brute@-84,44,guardian@84,44   each: figure@across,down, in
//       pixels of the game from the hero (a figure up the screen from him faces us; one down the
//       screen from him faces away)
//   SECONDS=1.6   how long to film after they are killed     FPS=30   pictures a second of the game's time
//   node tools/playtest.mjs --scenario tools/scenarios/film_death.mjs --file dist/film_now.html --out shots/film/dth
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(400);
  const put = (what, dx, dy) => page.evaluate(([what, dx, dy]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const x = h.x + (dx / 16 + dy / 8) / 2; const y = h.y + (dy / 8 - dx / 16) / 2;
    if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) return null;
    const kind = what === 'guardian' ? 'brute' : what;
    const m = g.spawn(kind, x, y, 1, what === 'guardian' ? 2 : 0, what === 'warden', g.rng);
    g.wakeUp(m);
    m.life = m.maxLife = 1e7;
    if (m.boss) g.boss = m;
    m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9;
    const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
    return m.id;
  }, [what, dx, dy]);
  const who = (process.env.WHO || 'brute@-84,-40,guardian@84,-40,brute@-84,44,guardian@84,44').split(/,(?=[a-z])/);
  const ids = [];
  for (const one of who) {
    const [what, at = '-72,-34'] = one.split('@');
    const [dx, dy] = at.split(',').map(Number);
    ids.push(await put(what, dx, dy));
  }
  console.log('stood', JSON.stringify(ids));
  // (the words that come up when the room is entered have gone by the time the film starts)
  await page.waitForTimeout(Number(process.env.WAIT || 6500));
  const fps = Number(process.env.FPS || 30);
  const slow = 0.08;
  const step = 1000 / fps / slow;     // real milliseconds between pictures
  const seconds = Number(process.env.SECONDS || 1.6);
  const before = Math.round(fps * 0.5);   // pictures of them standing, first
  const total = before + Math.ceil(seconds * fps);
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    // (killed by the rules' own hand, without a blow: no number flies up over them)
    if (i === before) await page.evaluate((ids) => { const g = window.__dbg.game(); for (const m of g.monsters) if (ids.includes(m.id)) g.kill(m); }, ids);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  console.log('late by', Date.now() - (t0 + (total - 1) * step), 'ms at the end');
}
