// THE WAYS THROUGH THE CRYPT (art/crypt_ways.ts, behind CRYPT, off): pictures of the stairwell
// down and the waypoint in the game, where this puts them (__dbg.cryptMarks); nothing of the game
// knows of them. Not a test.
//   MODE=photos  a picture of a room of each floor in DEPTHS with the stairwell in it, and on
//                every floor but the first the waypoint too
//   MODE=film    on floor DEPTH: the waypoint asleep, the hero walks up to it, it wakes, he steps
//                on, and the warp; a frame every 30th of a second of the game's time (<out>_f000.png ...)
//   node tools/playtest.mjs --file dist/crypt.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/crypt_ways.mjs --out shots/crypt/ways
import { log } from './lib.mjs';

export default async function (page, snap) {
  const mode = process.env.MODE || 'photos';
  const seed = Number(process.env.SEED) || 9;
  await page.evaluate((s) => { const d = window.__dbg; d.saving(false); d.run('warrior', s); d.autoLevel = false; d.autoWords = false; d.god = true; }, seed);
  await page.waitForTimeout(600);
  /** Go down to floor `dep` with the Crypt on, nothing in it to fight, and set the stairwell and the waypoint in its biggest room. */
  const floor = (dep, withWay) => page.evaluate(([d, way]) => {
    const dbg = window.__dbg;
    dbg.crypt(true);
    const g = dbg.game(); g.depth = d; g.cleared = d; g.enterDungeon();
    const L = g.level; const f = L.floor;
    L.explored.fill(1);
    g.monsters.splice(0);
    const r = [...f.rooms].filter((q) => q.kind !== 'start' && q.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h)[0];
    const stair = { x: r.x + 1, y: r.y + 1.2, way: 'x' };
    const wayAt = way ? { x: r.x + r.w - 3.5, y: r.y + r.h / 2 + 0.5, state: 'awake', t0: 0 } : null;
    // (nothing lying or standing where they are)
    const clear = (p) => !(p.x > stair.x - 1.5 && p.x < stair.x + 4.5 && p.y > stair.y - 0.5 && p.y < stair.y + 5) && !(wayAt && Math.hypot(p.x - wayAt.x, p.y - wayAt.y) < 1.4);
    L.props = L.props.filter(clear);
    dbg.cryptMarks({ stair, way: wayAt });
    const h = g.hero;
    h.x = wayAt ? (stair.x + wayAt.x) / 2 + 0.5 : stair.x + 2; h.y = stair.y + 3.2; h.fx = -0.7; h.fy = -0.7;
    dbg.fx.messages.length = 0;
    return { room: r, stair, way: wayAt };
  }, [dep, withWay]);
  if (mode === 'stairs') {
    // the hero at the top of the steps, about to go down them (they go down to the lower right of the screen)
    for (const d of (process.env.DEPTHS || '1,2,3,4').split(',').map(Number)) {
      const at = await floor(d, false);
      await page.evaluate((st) => {
        const dbg = window.__dbg; const g = dbg.game(); const h = g.hero;
        h.x = st.x - 0.45; h.y = st.y + 0.62; h.fx = 0.7071; h.fy = 0.7071;
      }, at.stair);
      await page.waitForTimeout(700);
      await page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
      await page.waitForTimeout(100);
      await snap(`stairs_d${d}`);
    }
  } else if (mode === 'photos') {
    for (const d of (process.env.DEPTHS || '1,2,3,4').split(',').map(Number)) {
      const at = await floor(d, d > 1);
      await page.waitForTimeout(700);
      await page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
      await page.waitForTimeout(100);
      await snap(`d${d}`);
      log(`floor ${d}`, JSON.stringify(at.stair));
    }
  } else {
    const dep = Number(process.env.DEPTH) || 2;
    const at = await floor(dep, true);
    // the hero where he can stand clear of everything, and the waypoint three tiles up the screen
    // from him (straight up his way: he walks up the screen to it), it asleep, nothing in between
    const way = await page.evaluate((w) => {
      const dbg = window.__dbg; const g = dbg.game(); const L = g.level; const f = L.floor; const h = g.hero;
      const ok = (x, y) => { const tx = Math.floor(x); const ty = Math.floor(y); return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.walk[ty * f.w + tx] === 1; };
      let at = null;
      for (let r = 0; r < 6 && !at; r++) for (let dx = -r; dx <= r && !at; dx++) for (let dy = -r; dy <= r && !at; dy++) {
        const hx = Math.floor(w.x + 2.1) + dx + 0.5; const hy = Math.floor(w.y + 2.1) + dy + 0.5;
        let clear = true;
        for (let k = 0; k <= 12; k++) if (!ok(hx - (k / 12) * 3.6, hy - (k / 12) * 3.6)) clear = false;
        if (clear) at = { x: hx - 2.1, y: hy - 2.1 };
      }
      const way = at || w;
      L.props = L.props.filter((p) => { const u = (p.x - way.x + p.y - way.y) / 2; const v = Math.abs(p.x - way.x - (p.y - way.y)) / 2; return !(u > -1.5 && u < 3 && v < 1.2); });
      h.x = way.x + 2.1; h.y = way.y + 2.1; h.fx = -0.7071; h.fy = -0.7071;
      dbg.cryptMarks({ way: { x: way.x, y: way.y, state: 'asleep', t0: 0 } });
      return { x: way.x, y: way.y };
    }, at.way);
    at.way = { ...at.way, ...way };
    await page.waitForTimeout(800);
    await page.evaluate(() => { window.__dbg.fx.messages.length = 0; window.__dbg.slowmo = 0.1; });
    const FPS = 30;
    const step = 1000 / FPS / 0.1;
    const t0 = Date.now();
    let walking = false;
    let woke = false;
    let warpAt = -1;
    let last = 99;
    for (let i = 0; i < 200; i++) {
      const wait = t0 + i * step - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      const st = await page.evaluate((w) => { const h = window.__dbg.game().hero; return { d: Math.hypot(h.x - w.x, h.y - w.y), clock: window.__dbg.clock(), hx: h.x, hy: h.y }; }, at.way);
      if (i % 6 === 0 && process.env.DEBUG) log(`f${i}`, `hero ${st.hx.toFixed(2)},${st.hy.toFixed(2)} way ${at.way.x.toFixed(2)},${at.way.y.toFixed(2)} d ${st.d.toFixed(2)}`);
      if (i === 12 && !walking) { await page.keyboard.down('KeyW'); walking = true; }
      // (he walks straight up the screen to the middle of it: the game's own walk, the line held straight)
      if (walking) {
        const k = Math.min(1, (i - 12) * 0.045);
        await page.evaluate(([w, k]) => { const h = window.__dbg.game().hero; h.x = w.x + 2.1 * (1 - k); h.y = w.y + 2.1 * (1 - k); }, [at.way, k]);
        st.d = 2.97 * (1 - k);
      }
      if (!woke && st.d < 2.2) {
        woke = true;
        await page.evaluate((w) => window.__dbg.cryptMarks({ way: { ...w, state: 'awake' } }), at.way);
      }
      // (he stops on the middle of it: when he is as near it as he will come)
      if (walking && st.d < 0.01) { await page.keyboard.up('KeyW'); walking = false; warpAt = i + 14; }
      last = st.d;
      if (i === warpAt) await page.evaluate(([w, c]) => window.__dbg.cryptMarks({ way: { ...w, state: 'warp', t0: c } }), [at.way, st.clock]);
      await snap(`f${String(i).padStart(3, '0')}`);
      if (warpAt >= 0 && i >= warpAt + 9) break;
    }
    if (walking) await page.keyboard.up('KeyW');
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  }
  await page.evaluate(() => { window.__dbg.crypt(false); });
}
