// THE TINKERER AND THE BRAWLER FROM EIGHT SIDES, IN THE GAME (art/sides_more.ts, behind EIGHT_MORE): pictures and film frames
// of each on floor 11, the Gate Ward (the measure's own ground: How art is made and approved, 10), as the game has them today
// and from all eight sides. After tools/scenarios/mage_up_look.mjs (the Mage chat's), for these two. A page built with the
// switch as wanted: node tools/sides_more_page.mjs dist/eight_on.html on (and dist/eight_off.html off).
//   CLS=tinkerer|brawler   who (tinkerer)
//   MODE=whole         one picture of the whole screen, to see where they are
//   MODE=still         one picture standing, facing WAY (0 to 7: down-right, down, down-left, left, up-left, up, up-right, right)
//   MODE=sides         a picture facing each of the eight ways
//   MODE=film          frames, a picture every thirtieth of a second of the game's time: standing, turned through the eight
//                      ways, run four ways, then their moves thrown the ways the game used to mirror or never drew
//   MODE=moves         stills of a move at its blow, thrown each of the eight ways (the Brawler's cross; her vial toss)
//   CLIP=150x110       the picture's size in game pixels, round them     UP=22  how far above their feet its middle is
//   PLACE=town         in town, not on the floor
// Each picture is cut round the hero; with --size 1126x520 --dpr 4 a game pixel is eight screen pixels.
import fs from 'node:fs';
import path from 'node:path';
import { log } from './lib.mjs';

const WAYS = [[1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71], [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71]];
const FPS = 30;

export default async function (page, snap) {
  const cls = process.env.CLS || 'tinkerer';
  const mode = process.env.MODE || 'still';
  const depth = Number(process.env.DEPTH || 11);
  const seed = Number(process.env.SEED || 9);
  const town = process.env.PLACE === 'town';
  const [cw, ch] = (process.env.CLIP || '150x110').split('x').map(Number);
  const up = Number(process.env.UP || 22);
  const out = process.env.OUT || 'shots/sides_more/x';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.evaluate(([cls, seed]) => {
    const d = window.__dbg; d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, seed); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, [cls, seed]);
  await page.waitForTimeout(600);
  if (!town) {
    await page.evaluate((n) => {
      const g = window.__dbg.game();
      g.depth = n; g.cleared = n - 1; g.enterDungeon();
      g.level.explored.fill(1);
      g.monsters.length = 0;
      g.guide = null;
      g.hero.invuln = 1e9;
    }, depth);
  }
  // (where they stand: AT=x,y, or where they come in)
  const at = process.env.AT ? process.env.AT.split(',').map(Number) : null;
  if (at) await page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; }, at);
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.fx = 1; g.hero.fy = 0; const f = window.__dbg.renderer && window.__dbg.renderer.figure; if (f) f.wait = 1e9; });
  // (the floor's name gone from the screen, its ground painted, their first pictures painted)
  await page.waitForTimeout(Number(process.env.WAIT || 9000));
  const scr = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h, cw: window.innerWidth }));
  const k = scr.cw / scr.w;
  log('the screen', `${scr.w}x${scr.h} game pixels, ${k} css pixels each`);
  const where = async () => page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; const s = d.at(h.x, h.y); return { sx: s.x, sy: s.y, x: h.x, y: h.y }; });
  // (the film's picture stays where they began: they move within it, as on the screen)
  let held = null;
  const clipNow = async () => {
    const w = held ?? (await where());
    return { x: Math.round(w.sx - cw / 2) * k, y: Math.round(w.sy - up - ch / 2) * k, width: cw * k, height: ch * k };
  };
  const raf = () => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
  // (nothing of their own done standing while they are looked at: a hero left standing turns to the camera for it, render/figure.ts)
  const calm = () => page.evaluate(() => { const f = window.__dbg.renderer && window.__dbg.renderer.figure; if (f) f.wait = 1e9; return !!f; });
  const face = async (i) => { await page.evaluate(([fx, fy]) => { const h = window.__dbg.game().hero; h.fx = fx; h.fy = fy; }, WAYS[i]); await calm(); };
  log('calm', String(await calm()));
  const shot = async (name, whole = false) => {
    const file = `${out}_${name}.png`;
    await raf();
    await page.screenshot(whole ? { path: file } : { path: file, clip: await clipNow() });
    log('shot', file);
  };
  log('where', JSON.stringify(await where()));
  if (mode === 'whole') { await shot('whole', true); return; }
  if (mode === 'still') {
    await face(Number(process.env.WAY || 0));
    await page.waitForTimeout(1500);
    await shot(process.env.NAME || `still_${cls}`);
    return;
  }
  if (mode === 'sides') {
    for (let i = 0; i < 8; i++) {
      await face(i);
      await page.waitForTimeout(1500);
      await shot(`side_${i}`);
    }
    return;
  }
  // ---- the film and the moves: the game's own rules, the controls put in as a player's would be ----
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const f = { t: 0, plan: [], c: {}, log: [] };
    window.__mf = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      h.mana = h.d.maxMana;
      for (const sk of h.skills) if (sk) sk.cd = 0;
      Object.assign(c, { mx: 0, my: 0, fire: false, cast: false, hold: false, evade: false, face: false, approach: false });
      for (const p of f.plan) {
        if (f.t < p.from || f.t >= p.to) continue;
        if (p.face) { h.fx = p.face[0]; h.fy = p.face[1]; }
        if (p.run) { c.mx = p.run[0]; c.my = p.run[1]; }
        if (p.fire) { c.fire = true; c.aimX = h.x + p.fire[0] * 4; c.aimY = h.y + p.fire[1] * 4; }
        if (p.cast) { c.cast = true; c.castX = h.x + p.cast[0] * 3; c.castY = h.y + p.cast[1] * 3; c.aimX = c.castX; c.aimY = c.castY; }
        if (p.evade && !p.did) { p.did = true; c.evade = true; c.evadeX = p.evade[0]; c.evadeY = p.evade[1]; }
      }
      return run(dt, c);
    };
  });
  const PLAN = [];
  let t = 0;
  const add = (long, what) => { PLAN.push({ from: t, to: t + long, ...what }); t += long; };
  /** Frames to take a still at: [seconds into the plan, name]. */
  const STILLS = [];
  if (mode === 'film') {
    add(1.6, { face: WAYS[0] });
    for (let i = 1; i < 8; i++) add(0.6, { face: WAYS[i] });
    add(0.6, { face: WAYS[0] });
    // (run the four ways the game never drew: straight down, left, up and right of the screen; back to where they began)
    add(0.8, { run: [0.71, 0.71] });
    add(0.4, {});
    add(0.8, { run: [-0.71, 0.71] });
    add(0.4, {});
    add(0.8, { run: [-0.71, -0.71] });
    add(0.4, {});
    add(0.8, { run: [0.71, -0.71] });
    add(0.6, {});
    if (cls === 'brawler') {
      // (jab, cross, hook straight down the screen; a round kick to the left; a jab and a cross down and to the left, which
      // the game mirrored; his dodging jump away to the right)
      add(0.1, { fire: WAYS[1] }); add(0.5, {});
      add(0.1, { fire: WAYS[1] }); add(0.6, {});
      add(0.1, { fire: WAYS[1] }); add(1.7, {});
      add(0.1, { cast: WAYS[3] }); add(1.9, {});
      add(0.1, { fire: WAYS[2] }); add(0.5, {});
      add(0.1, { fire: WAYS[2] }); add(1.6, {});
      add(0.1, { evade: WAYS[7] }); add(1.6, {});
    } else {
      // (a vial tossed straight down the screen, and one down and to the left, which the game mirrored; her blast jump to the
      // left; a vial tossed up the screen)
      add(0.1, { fire: WAYS[1] }); add(1.3, {});
      add(0.1, { fire: WAYS[2] }); add(1.3, {});
      add(0.1, { evade: WAYS[3] }); add(1.8, {});
      add(0.1, { fire: WAYS[5] }); add(1.4, {});
    }
  } else if (mode === 'moves') {
    const blow = Number(process.env.BLOW || (cls === 'brawler' ? 0.5 : 0.47));
    for (let i = 0; i < 8; i++) {
      add(0.3, { face: WAYS[i] });
      const t0 = t;
      add(0.1, cls === 'brawler' && process.env.KICK ? { cast: WAYS[i] } : { fire: WAYS[i] });
      STILLS.push([t0 + blow, `move_${i}`]);
      add(Number(process.env.AFTER || 2.2), {});
    }
  }
  const total = Math.round(t * FPS);
  const dir = process.env.FRAMES || `${out}_frames`;
  if (mode === 'film') {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
  }
  held = await where();
  const c0 = await page.evaluate((plan) => { const d = window.__dbg; d.slowmo = 1e-6; const f = window.__mf; f.plan = plan.map((p) => ({ ...p, from: p.from + f.t, to: p.to + f.t })); return d.clock(); }, PLAN);
  const slow = Number(process.env.SLOW || 0.05);
  const want = mode === 'film' ? null : new Map(STILLS.map(([s, n]) => [Math.round(s * FPS), n]));
  for (let i = 0; i < total; i++) {
    await page.evaluate((s) => { window.__dbg.slowmo = s; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 600000 });
    if (want) {
      if (want.has(i)) await shot(want.get(i));
      continue;
    }
    await raf();
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`), clip: await clipNow() });
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  log(mode, mode === 'film' ? `${total} frames in ${dir}` : `${STILLS.length} stills`);
  void snap;
}
