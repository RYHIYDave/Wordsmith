// THE MAGE BROUGHT UP, IN THE GAME (art/mage_up.ts, behind MAGE_UP): pictures and film frames of her on floor 11, the Gate
// Ward (the measure's own ground: How art is made and approved, 10), as she is and redrawn, and of the Brawler on the same
// spot for the measure. A page built with her switch as wanted: node tools/mage_up_page.mjs dist/mage_new.html on (and
// dist/mage_old.html off).
//   CLS=mage|brawler   who (mage)
//   MODE=whole         one picture of the whole screen, to see where she is
//   MODE=still         one picture of her standing in her guard, facing WAY (0 to 7: down-right, down, down-left, left, up-left,
//                      up, up-right, right)
//   MODE=sides         a picture of her facing each of the eight ways
//   MODE=film          frames, a picture every thirtieth of a second of the game's time: she stands, turns through her eight
//                      sides, runs three ways, casts the Wave twice and the Orb once
//   MODE=moves         stills of chosen moments (the Wave wound up and let go, the Orb's slam, her run)
//   CLIP=150x110       the picture's size in game pixels, round her     UP=22  how far above her feet its middle is
//   PLACE=town         in town, not on the floor
// Each picture is cut round her; with --size 1126x520 --dpr 4 a game pixel is eight screen pixels.
import fs from 'node:fs';
import path from 'node:path';
import { log } from './lib.mjs';

const WAYS = [[1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71], [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71]];
const FPS = 30;

export default async function (page, snap) {
  const cls = process.env.CLS || 'mage';
  const mode = process.env.MODE || 'still';
  const depth = Number(process.env.DEPTH || 11);
  const seed = Number(process.env.SEED || 9);
  const town = process.env.PLACE === 'town';
  const [cw, ch] = (process.env.CLIP || '150x110').split('x').map(Number);
  const up = Number(process.env.UP || 22);
  const out = process.env.OUT || 'shots/mage_up/x';
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
  // (where she stands: AT=x,y, or a few tiles in from where she comes in)
  const at = process.env.AT ? process.env.AT.split(',').map(Number) : null;
  if (at) await page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; }, at);
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.fx = 1; g.hero.fy = 0; const f = window.__dbg.renderer && window.__dbg.renderer.figure; if (f) f.wait = 1e9; });
  // (the floor's name gone from the screen, its ground painted, her first pictures painted)
  await page.waitForTimeout(Number(process.env.WAIT || 9000));
  const scr = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h, cw: window.innerWidth }));
  const k = scr.cw / scr.w;
  log('the screen', `${scr.w}x${scr.h} game pixels, ${k} css pixels each`);
  const where = async () => page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; const s = d.at(h.x, h.y); return { sx: s.x, sy: s.y, x: h.x, y: h.y }; });
  const clipNow = async () => {
    const w = await where();
    return { x: Math.round(w.sx - cw / 2) * k, y: Math.round(w.sy - up - ch / 2) * k, width: cw * k, height: ch * k };
  };
  const raf = () => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
  // (nothing of her own done standing while she is looked at: a hero left standing turns to the camera for it, render/figure.ts)
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
    // (a moment of her breathing: the same one every time)
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
  // ---- the film and the moves: the game's own rules, her controls put in as a player's would be ----
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
        if (p.cast && !p.did) { p.did = true; c.cast = true; c.castX = h.x + p.cast[0]; c.castY = h.y + p.cast[1]; c.aimX = c.castX; c.aimY = c.castY; }
      }
      return run(dt, c);
    };
  });
  const PLAN = [];
  let t = 0;
  const add = (long, what) => { PLAN.push({ from: t, to: t + long, ...what }); t += long; };
  if (mode === 'film') {
    add(2.4, { face: WAYS[0] });
    for (let i = 1; i < 8; i++) add(0.6, { face: WAYS[i] });
    add(0.6, { face: WAYS[0] });
    add(0.9, { run: [0.71, 0.71] });
    add(0.5, {});
    add(0.9, { run: [-1, 0] });
    add(0.5, {});
    add(0.9, { run: [0.71, -0.71] });
    add(0.7, {});
    add(0.12, { fire: [1, 0] });
    add(0.9, {});
    add(0.12, { fire: [-0.71, 0.71] });
    add(0.9, {});
    // (the Orb set down beside her, in the picture: two tiles off, down and to the right)
    add(0.1, { cast: [2.2, 0.5] });
    add(1.6, {});
  }
  const total = Math.round(t * FPS);
  const dir = process.env.FRAMES || `${out}_frames`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const c0 = await page.evaluate((plan) => { const d = window.__dbg; d.slowmo = 1e-6; const f = window.__mf; f.plan = plan.map((p) => ({ ...p, from: p.from + f.t, to: p.to + f.t })); return d.clock(); }, PLAN);
  const slow = 0.05;
  for (let i = 0; i < total; i++) {
    await page.evaluate((s) => { window.__dbg.slowmo = s; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 600000 });
    await raf();
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`), clip: await clipNow() });
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  log('film', `${total} frames in ${dir}`);
  void snap;
}
