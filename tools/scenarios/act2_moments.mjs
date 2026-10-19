// ACT 2, THE HUSH (behind ACT2, off; switched on here by the test hook, __dbg.act2): EACH OF FLOORS 11 TO 15'S MOMENT AROUND THE
// HERO (the art chat's films, art/floor11_moments.ts to floor15_moments.ts; laid by game/act2_moments.ts, played by
// render/act1_pieces.ts), filmed in the game: the hero set down some seven tiles off, on a straight walk to it; a picture of it
// waiting; then he walks up (the keys, as a player's) until it starts as he comes near and sees it; and from then a picture
// every tenth of a second of the game's own clock (the game slowed while each is taken) until it is over and a second more.
// His words (rulebook Places 8, 10 Oct 2026): “I’d also like a couple environmental things happening around you for immersion
// unique for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and they fly off,  a root
// shrivels as you walk by.  That sort of stuff”.
//   node tools/build_to.mjs dist/act2_moments.html
//   DEPTHS=11,12 node tools/playtest.mjs --file dist/act2_moments.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_moments.mjs --out shots/moments/floor
//   (pictures: shots/moments/floor_<depth>/0000.png on; env DEPTHS, SEED, CLS)
export default async function (page, snap) {
  const depths = (process.env.DEPTHS ?? '11,12,13,14,15').split(',').map(Number);
  const seed = Number(process.env.SEED ?? 3);
  const cls = process.env.CLS ?? 'warrior';
  let fails = 0;
  const check = (what, ok, more = '') => {
    if (!ok) fails++;
    console.log(`  ${ok ? 'ok' : '!! FAILED'} ${what}${more ? `   (${more})` : ''}`);
    return ok;
  };
  const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
  const keysDown = new Set();
  /** Hold the keys that walk him toward a screen direction (dx, dy). */
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

  for (const depth of depths) {
    console.log(`floor ${depth}`);
    const info = await page.evaluate(([depth, seed, cls]) => {
      const D = window.__dbg;
      D.saving(false);
      D.run(cls, seed);
      D.seasoned(20);
      D.god = true;
      D.autoLevel = false;
      D.autoWords = false;
      D.act2(true, depth);
      const g = D.game();
      const L = g.level;
      const f = L.floor;
      const m = L.act1?.moments?.[0];
      if (!m) return { none: true };
      // (nobody to fight while it is filmed)
      g.monsters.length = 0;
      // where he is set down: a walkable tile some seven tiles off, the way to where he sees it from walkable all along, the
      // nearer the eye the better (in front of it on the screen); he walks to the tile he sees it from (the street or the
      // walkway before a roof or the water), or to three tiles short of it on the floor
      const seenX = (m.seen % f.w) + 0.5;
      const seenY = Math.floor(m.seen / f.w) + 0.5;
      const onFloor = m.seen === Math.floor(m.y) * f.w + Math.floor(m.x);
      const walk = (x, y) => { const tx = Math.floor(x); const ty = Math.floor(y); return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.walk[ty * f.w + tx] === 1; };
      const clearLine = (ax, ay, bx, by) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 0.2); for (let k = 0; k <= n; k++) for (const [ox, oy] of [[0, 0], [0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]]) if (!walk(ax + ((bx - ax) * k) / n + ox, ay + ((by - ay) * k) / n + oy)) return false; return true; };
      let best = null;
      for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
        const x = tx + 0.5;
        const y = ty + 0.5;
        const d = Math.hypot(x - m.x, y - m.y);
        if (d < (m.over ? 5.7 : 6.8) || d > 8.5 || !walk(x, y)) continue;
        let to = [seenX, seenY];
        if (onFloor) { const k = 3 / d; to = [m.x + (x - m.x) * k, m.y + (y - m.y) * k]; }
        // (a roof: along the street before it from its -x side, so that the roof comes onto his screen: it is at the very top)
        if (m.over) { if (x > m.x - 4 || Math.abs(y - seenY) > 2.2) continue; to = [m.x - 1.5, seenY]; }
        if (!clearLine(x, y, to[0], to[1])) continue;
        const score = (x + y) - (m.x + m.y) - Math.abs((x - y) - (m.x - m.y)) * 0.5;
        if (!best || score > best.score) best = { x, y, to, score };
      }
      if (!best) return { m, nowhere: true };
      g.hero.x = best.x;
      g.hero.y = best.y;
      return { m, from: [best.x, best.y], to: best.to, kind: L.land?.kind };
    }, [depth, seed, cls]);
    if (!check(`floor ${depth} has its moment laid`, !info.none, JSON.stringify(info.m ?? null))) continue;
    if (!check(`a place to walk up to it from`, !info.nowhere)) continue;
    console.log(`  the moment ${info.m.key} at (${info.m.x}, ${info.m.y}); from (${info.from}) to (${info.to.map((v) => v.toFixed(1))})`);
    // (its film made by the painter's worker first)
    const t0 = Date.now();
    const made = await page.waitForFunction((key) => !!window.__dbg.painter.filmOf(key), info.m.key, { polling: 500, timeout: 90000 }).then(() => true, () => false);
    if (!check('its film made by the painter', made, `${((Date.now() - t0) / 1000).toFixed(1)} s`)) continue;
    await page.waitForTimeout(1500);
    let n = 0;
    const shot = async () => { await snap(`${depth}/${String(n).padStart(4, '0')}`); n++; };
    await shot();
    // he walks up to it
    let state = 'wait';
    const walkT0 = Date.now();
    while (Date.now() - walkT0 < 20000) {
      const st = await page.evaluate(() => {
        const D = window.__dbg;
        const h = D.game().hero;
        return { x: h.x, y: h.y, state: D.renderer.act1.momentStates()[0]?.state ?? 'none' };
      });
      state = st.state;
      if (state !== 'wait') break;
      const dx = info.to[0] - st.x;
      const dy = info.to[1] - st.y;
      if (Math.hypot(dx, dy) < 0.3) { await letGo(); await page.waitForTimeout(100); continue; }
      await steer(dx - dy, (dx + dy) * 0.5);
      await page.waitForTimeout(60);
    }
    await letGo();
    if (!check('it begins as he comes near and sees it', state === 'play', state)) continue;
    // a picture every tenth of a second of the game's clock, the game slowed while each is taken
    const len = await page.evaluate((key) => window.__dbg.painter.filmOf(key).frames.length / 30, info.m.key);
    const g0 = await page.evaluate(() => window.__dbg.game().time);
    for (let k = 1; k <= Math.ceil(len * 10) + 10; k++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.1; });
      await page.waitForFunction((at) => {
        const D = window.__dbg;
        if (D.game().time < at) return false;
        D.slowmo = 1e-6;
        return true;
      }, g0 + k / 10, { polling: 'raf', timeout: 20000 });
      await shot();
    }
    const end = await page.evaluate(() => { const D = window.__dbg; D.slowmo = 1; return D.renderer.act1.momentStates()[0]?.state; });
    check('it is over, and stays over', end === 'done', end);
    await page.waitForTimeout(1200);
    const still = await page.evaluate(() => window.__dbg.renderer.act1.momentStates()[0]?.state);
    check('a second later it is still over (it plays once)', still === 'done', still);
    await shot();
  }
  console.log(fails ? `ACT 2 MOMENTS: ${fails} FAILED` : 'ACT 2 MOMENTS: all ok');
}
