// FLOOR 11 LAID AS ONE GREAT WARD, THE PIGEONS' ROW (game/act2/gateward.ts GW_PIGEON_ROW, on in the page built for it): the hero
// set down on the main way some eight tiles before the row of houses beside it, a picture of him there with the pigeons waiting on
// its roof; then he walks on along the way (the keys, as a player's) until they go up as he comes near and sees them, and a picture
// at a few moments of it, the game slowed while each is taken.
//   node tools/build_to.mjs dist/pigeons.html   (with GW_PIGEON_ROW on)
//   SEED=7 node tools/playtest.mjs --file dist/pigeons.html --size 844x390 --dpr 3 --touch --scenario tools/scenarios/pigeon_row_look.mjs --out shots/pigeons
//   (env SEED, CLS; FILM_WAIT, seconds to wait for the painter's film, 300)
export default async function (page, snap) {
  const seed = Number(process.env.SEED ?? 7);
  const cls = process.env.CLS ?? 'warrior';
  let fails = 0;
  const check = (what, ok, more = '') => {
    if (!ok) fails++;
    console.log(`  ${ok ? 'ok' : '!! FAILED'} ${what}${more ? `   (${more})` : ''}`);
    return ok;
  };
  const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
  const keysDown = new Set();
  const steer = async (dx, dy) => {
    const d = Math.hypot(dx, dy) || 1;
    const want = new Set();
    if (dy / d < -0.38) want.add('KeyW');
    if (dy / d > 0.38) want.add('KeyS');
    if (dx / d < -0.38) want.add('KeyA');
    if (dx / d > 0.38) want.add('KeyD');
    for (const k of KEYS) {
      if (want.has(k) && !keysDown.has(k)) { await page.keyboard.down(k); keysDown.add(k); }
      if (!want.has(k) && keysDown.has(k)) { await page.keyboard.up(k); keysDown.delete(k); }
    }
  };
  const letGo = async () => { for (const k of [...keysDown]) { await page.keyboard.up(k); keysDown.delete(k); } };

  const info = await page.evaluate(([seed, cls]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run(cls, seed);
    D.seasoned(20);
    D.god = true;
    D.autoLevel = false;
    D.autoWords = false;
    D.act2(true, 11);
    const g = D.game();
    const L = g.level;
    const f = L.floor;
    const m = L.act1?.moments?.[0];
    if (!m) return { none: true };
    if (!L.land?.pigeons) return { m, norow: true };
    g.monsters.length = 0;
    // (the main way, a quarter tile at a time, start to boss)
    const way = L.land.way;
    const pts = [];
    for (let i = 0; i + 1 < way.length; i++) {
      const [ax, ay] = way[i];
      const [bx, by] = way[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.25));
      for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
    }
    const walk = (x, y) => { const tx = Math.floor(x); const ty = Math.floor(y); return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.walk[ty * f.w + tx] === 1; };
    let near = 0;
    pts.forEach((p, i) => { if (Math.hypot(p[0] - m.x, p[1] - m.y) < Math.hypot(pts[near][0] - m.x, pts[near][1] - m.y)) near = i; });
    let from = -1;
    for (let i = near; i >= 0; i--) {
      if (!walk(pts[i][0], pts[i][1])) continue;
      if (Math.hypot(pts[i][0] - m.x, pts[i][1] - m.y) >= 8.5) { from = i; break; }
    }
    if (from < 0) return { m, nowhere: true };
    // (each a tile along it, moved off anything standing on the way, as a player walks round it)
    const solid = L.props.filter((p) => p.solid).map((p) => [p.tx + 0.5, p.ty + 0.5]);
    const roomy = (x, y) => [[0, 0], [0.4, 0], [-0.4, 0], [0, 0.4], [0, -0.4]].every(([ox, oy]) => walk(x + ox, y + oy)) && solid.every(([px, py]) => Math.hypot(px - x, py - y) > 0.9);
    const route = [];
    for (let i = from; i <= Math.min(pts.length - 1, near + 40); i += 4) {
      const [x, y] = pts[i];
      let at = roomy(x, y) ? [x, y] : null;
      for (let r = 0.5; r <= 2.5 && !at; r += 0.5) for (let a = 0; a < 16 && !at; a++) {
        const qx = x + r * Math.cos((a * Math.PI) / 8);
        const qy = y + r * Math.sin((a * Math.PI) / 8);
        if (roomy(qx, qy)) at = [qx, qy];
      }
      if (at) route.push(at);
    }
    g.hero.x = pts[from][0];
    g.hero.y = pts[from][1];
    return { m, row: L.land.pigeons, from: pts[from], near: pts[near], gap: Math.hypot(pts[near][0] - m.x, pts[near][1] - m.y), route };
  }, [seed, cls]);
  if (!check('floor 11 has its pigeons laid', !info.none)) return;
  if (!check('on the row of houses by the way', !info.norow, JSON.stringify(info.m))) return;
  if (!check('a place on the way to walk up from', !info.nowhere)) return;
  console.log(`  the pigeons at (${info.m.x}, ${info.m.y}); the way passes ${info.gap.toFixed(1)} tiles off; he sets out from (${info.from.map((v) => v.toFixed(1))})`);
  const t0 = Date.now();
  const wait = Number(process.env.FILM_WAIT ?? 300) * 1000;
  const made = await page.waitForFunction((key) => !!window.__dbg.painter.filmOf(key), info.m.key, { polling: 500, timeout: wait }).then(() => true, () => false);
  if (!check('its film made by the painter', made, `${((Date.now() - t0) / 1000).toFixed(1)} s`)) return;
  await page.waitForTimeout(1500);
  await snap('a_on_the_way');
  // he walks on along the way
  let state = 'wait';
  let leg = 0;
  let half = false;
  let closest = null;
  let best = Infinity;
  let still = 0;
  const walkT0 = Date.now();
  while (Date.now() - walkT0 < 30000 && leg < info.route.length) {
    const st = await page.evaluate(() => {
      const D = window.__dbg;
      const g = D.game();
      const h = g.hero;
      const pm = D.renderer.act1.played?.[0];
      const m = g.level.act1.moments[0];
      return { x: h.x, y: h.y, state: D.renderer.act1.momentStates()[0]?.state ?? 'none', d: Math.hypot(h.x - m.x, h.y - m.y), sees: g.level.visible[m.seen], shown: !!pm?.shown };
    });
    state = st.state;
    if (!closest || st.d < closest.d) closest = st;
    if (state !== 'wait') break;
    const [tx, ty] = info.route[leg];
    const dx = tx - st.x;
    const dy = ty - st.y;
    if (!half && Math.hypot(st.x - info.m.x, st.y - info.m.y) < 7) { half = true; await letGo(); await snap('b_coming_up'); }
    if (Math.hypot(dx, dy) < 0.5) { leg++; best = Infinity; still = 0; continue; }
    // (held up a second and more: on to the next)
    if (Math.hypot(dx, dy) < best - 0.1) { best = Math.hypot(dx, dy); still = 0; } else if (++still > 20) { leg++; best = Infinity; still = 0; continue; }
    await steer(dx - dy, (dx + dy) * 0.5);
    await page.waitForTimeout(50);
  }
  await letGo();
  if (!check('they go up as he comes near and sees them', state === 'play', `${state}; nearest he came: ${JSON.stringify(closest)}`)) return;
  const g0 = await page.evaluate(() => window.__dbg.game().time);
  const names = { 0.25: 'c_off', 0.7: 'd_up', 1.3: 'e_over', 2.2: 'f_gone' };
  for (const [at, name] of Object.entries(names)) {
    await page.evaluate(() => { window.__dbg.slowmo = 0.1; });
    await page.waitForFunction((at) => {
      const D = window.__dbg;
      if (D.game().time < at) return false;
      D.slowmo = 1e-6;
      return true;
    }, g0 + Number(at), { polling: 'raf', timeout: 30000 });
    await snap(name);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log(fails ? `PIGEONS' ROW: ${fails} FAILED` : "PIGEONS' ROW: all ok");
}
