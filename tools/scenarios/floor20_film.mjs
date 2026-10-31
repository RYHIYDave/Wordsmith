// FLOOR 20, THE QUIET TOWER, filmed in play for the owner (behind HIGH_CITY, switched on here alone): a hero of level 25 on the floor
// itself, the test bot fighting for him where there is a fight (nothing can kill him): the stair's foot; the scriptorium; a room the
// fog has filled and the Hush's dust; the Hush in its own shapes, a swarm, drifting and darting, their grip; the shadows of the four
// royals, each its royal's basic blow and big move; the Order's last masks; the belfry; up the tower's stair onto the top. A picture
// every thirtieth of a second of the game's time (python3 film_cut.py <dir> <out.mp4>); STILLS=1, every half second. The Moth's
// fight is tools/scenarios/high20_moth.mjs.
//   node tools/playtest.mjs --file dist/floor20.html --size 1280x720 --scenario tools/scenarios/floor20_film.mjs --out shots/f20film/k
const FPS = 30;
export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 4);
  const only = process.env.ONLY || '';
  await page.evaluate(([cls, seed]) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, seed); d.seasoned(25); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 20);
    const g = d.game(); g.level.explored.fill(1);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
  }, [cls, seed]);
  await page.waitForTimeout(2500);
  let scenes = [
    [0, 'THE QUIET TOWER', 'Floor 20. The highest tower of the High City, where the last chapter was taken.', 'start'],
    [4, 'THE SCRIPTORIUM', 'Blank books, blank pages, the copyists’ ink gone dry.', 'scriptorium'],
    [8, 'A ROOM THE FOG HAS FILLED', 'The Hush’s dust lies on the floor. Step in it and your words go dark.', 'fogged'],
    [14, 'THE HUSH, IN ITS OWN SHAPES', 'In swarms. They drift, then dart four tiles at you. Their grip darkens your words.', 'hush'],
    [26, 'SHADOW OF THE PRINCESS', 'Her vine’s lash, and her snare, small.', 'princess'],
    [34, 'SHADOW OF THE PRINCE', 'His thrust, and three of his masks.', 'prince'],
    [42, 'SHADOW OF THE QUEEN', 'Her comb, and into her hand mirror and out behind you.', 'queen'],
    [50, 'SHADOW OF THE KING', 'His sweep, and his crown: a leap and a slam.', 'king'],
    [60, 'THE ORDER’S LAST MASKS', 'Only the mask, held up by grey fog.', 'masks'],
    [68, 'THE BELL-LESS BELFRY', '', 'belfry'],
    [72, 'THE TOWER’S STAIR', 'Up it, to the top.', 'stair'],
  ];
  let seconds = 80;
  if (only) {
    const i = scenes.findIndex((s) => s[3] === only);
    const t0 = scenes[i][0];
    const t1 = i + 1 < scenes.length ? scenes[i + 1][0] : seconds;
    scenes = [[0, ...scenes[i].slice(1)]];
    seconds = t1 - t0;
  }
  snap.note('film', { fps: FPS, from: 0, parts: scenes.map(([t, a, b]) => [t, a, b]), size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const go = (what) => page.evaluate((what) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const L = g.level; const T = L.land.tower;
    const clear = () => { for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss); g.projectiles.length = 0; g.perils.length = 0; };
    const room = (role, k = 0) => T.rooms.filter((r) => r.role === role)[k];
    const mid = (q) => ({ x: (q.r[0] + q.r[2]) / 2, y: (q.r[1] + q.r[3]) / 2 });
    const spawn = (kind, x, y, form) => { const m = g.spawn(kind, x, y, 970, 0, false, g.rng); if (form !== undefined) { m.form = form; } m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 400; m.state = 'chase'; return m; };
    const royal = (form) => {
      clear();
      const q = room('scriptorium', 1) ?? room('fogged', 1) ?? room('belfry'); const c = mid(q);
      h.x = c.x; h.y = c.y + 2.5;
      const m = spawn('rshadow', c.x, c.y - 2.5, form);
      m.speed = [3.2, 3.42, 1.44, 0.64][form] * 1.1;
      m.life = m.maxLife = 1e5;
      d.bot(true);
    };
    if (what === 'start') {
      clear(); h.x = L.floor.start.x; h.y = L.floor.start.y; d.bot(false);
    } else if (what === 'scriptorium') {
      clear(); const c = mid(room('scriptorium')); h.x = c.x; h.y = c.y + 1; d.bot(false);
    } else if (what === 'fogged') {
      clear(); const z = (L.floor.hazards ?? [])[0]; if (z) { h.x = z.x + 0.5 + 1.8; h.y = z.y + 0.5 + 1.2; } d.bot(false);
    } else if (what === 'hush') {
      clear(); const q = room('fogged'); const c = mid(q);
      h.x = c.x + 3; h.y = c.y + 3;
      for (const [dx, dy] of [[-3, -3], [-1.5, -4], [0, -3.5], [-4, -1], [-2.5, -2]]) spawn('hshape', c.x + dx, c.y + dy);
      d.bot(true);
    } else if (what === 'princess') royal(0);
    else if (what === 'prince') royal(1);
    else if (what === 'queen') royal(2);
    else if (what === 'king') royal(3);
    else if (what === 'masks') {
      clear(); const q = room('landing', 1) ?? room('landing'); const c = mid(q);
      h.x = c.x; h.y = c.y + 2;
      for (const k of [-1, 0, 1]) { const m = spawn('order', c.x + k * 1.5, c.y - 2, 2); }
      d.bot(true);
    } else if (what === 'belfry') {
      clear(); const c = mid(room('belfry')); h.x = c.x + 1; h.y = c.y + 2.5; d.bot(false);
    } else if (what === 'stair') {
      clear(); h.x = T.stair.back.x + (T.stair.back.x - T.stair.x) * 0.6; h.y = T.stair.back.y + (T.stair.back.y - T.stair.y) * 0.6; d.bot(false);
      window.__walkStair = true;
    }
  }, what);
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  let next = 0;
  for (let i = 0; i < total; i++) {
    while (next < scenes.length && scenes[next][0] * FPS <= i) await go(scenes[next++][3]);
    // (up the stair: he walks into it)
    await page.evaluate(() => { if (!window.__walkStair) return; const g = window.__dbg.game(); const T = g.level.land.tower; const h = g.hero; if (h.x >= T.split) { window.__walkStair = false; return; } const dx = T.stair.x - h.x; const dy = T.stair.y - h.y; const d = Math.hypot(dx, dy) || 1; if (!g.leaving) { h.x += (dx / d) * 0.06; h.y += (dy / d) * 0.06; h.fx = dx / d; h.fy = dy / d; } });
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 180000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 90 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); return g.monsters.filter((m) => !m.dead && !m.boss).map((m) => `${m.kind}${m.form ?? ''}:${m.act ? m.act.id.split(':')[1] : m.anim}`).join(' '); }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
