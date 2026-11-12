// THE WARLOCK BROUGHT UP IN PLAY (art/warlock_up.ts, behind WARLOCK_UP; the queue's finish-mage-and-warlock-eight-sides, step 4,
// 12 Nov 2026): film frames of the Warlock on floor 11's ground (the measure's own spot, AT=40,57) as a man, by the game's own
// rules, his controls put in as a player's would be: standing, turned through his eight sides, running three ways and stopping, his
// bolt, his curse, his smoke step, and changing into the Living Shadow; and stills for the measure and his eight sides. As
// tools/scenarios/shadow_look.mjs. A page built with his switch as wanted: node tools/warlock_up_page.mjs dist/warlock_up_on.html on.
//   CLS=warlock|brawler   who (warlock)
//   MODE=still            one picture standing, facing down and right (NAME=...)
//   MODE=sides            eight pictures standing, one facing each way (NAME=... : NAME_<way>.png)
//   MODE=film             frames, a picture every thirtieth of a second of the game's time; and plan.json, what each part is
//   CLIP=180x130          the picture's size in game pixels, round him       UP=40  how far above his feet its middle is
// With --size 1126x520 --dpr 3 a game pixel is six screen pixels.
import fs from 'node:fs';
import path from 'node:path';
import { log } from './lib.mjs';

const FPS = 30;

export default async function (page, snap) {
  const cls = process.env.CLS || 'warlock';
  const mode = process.env.MODE || 'film';
  const depth = Number(process.env.DEPTH || 11);
  const [cw, ch] = (process.env.CLIP || '180x130').split('x').map(Number);
  const up = Number(process.env.UP || 40);
  const out = process.env.OUT || 'shots/wup/x';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, [cls]);
  await page.waitForTimeout(600);
  await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    g.level.explored.fill(1);
    g.monsters.length = 0;
    g.guide = null;
    g.hero.invuln = 1e9;
  }, depth);
  const at = (process.env.AT || '40,57').split(',').map(Number);
  await page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.fx = 1; h.fy = 0; const f = window.__dbg.renderer && window.__dbg.renderer.figure; if (f) f.wait = 1e9; }, at);
  await page.waitForTimeout(Number(process.env.WAIT || 14000));
  const scr = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h, cw: window.innerWidth }));
  const k = scr.cw / scr.w;
  log('the screen', `${scr.w}x${scr.h} game pixels, ${k} css pixels each`);
  const where = async () => page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; const s = d.at(h.x, h.y); return { sx: s.x, sy: s.y, x: h.x, y: h.y, form: h.form, pact: h.pact }; });
  const clipNow = async () => {
    const w = await where();
    return { x: Math.round(w.sx - cw / 2) * k, y: Math.round(w.sy - up - ch / 2) * k, width: cw * k, height: ch * k };
  };
  const raf = () => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
  const calm = () => page.evaluate(() => { const f = window.__dbg.renderer && window.__dbg.renderer.figure; if (f) f.wait = 1e9; return !!f; });
  const shot = async (name, whole = false) => {
    const file = `${out}_${name}.png`;
    await raf();
    await page.screenshot(whole ? { path: file } : { path: file, clip: await clipNow() });
    log('shot', file);
  };
  log('where', JSON.stringify(await where()));
  if (mode === 'whole') { await shot('whole', true); return; }
  if (mode === 'still') {
    await calm();
    await page.waitForTimeout(1500);
    await shot(process.env.NAME || `still_${cls}`);
    return;
  }
  if (mode === 'sides') {
    // (standing, facing each of the eight ways in turn: the side the game shows for it)
    const ways = { downright: [1, 0], toward: [0.71, 0.71], downleft: [0, 1], left: [-0.71, 0.71], upleft: [-1, 0], away: [-0.71, -0.71], upright: [0, -1], right: [0.71, -0.71] };
    for (const [name, [fx, fy]] of Object.entries(ways)) {
      await page.evaluate(([fx, fy]) => { const h = window.__dbg.game().hero; h.fx = fx; h.fy = fy; }, [fx, fy]);
      await calm();
      await page.waitForTimeout(Number(process.env.SIDE_WAIT || 2500));
      await shot(`${process.env.NAME || 'side'}_${name}`);
    }
    return;
  }
  // ---- the game's own rules, his controls put in as a player's would be ----
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const f = { t: 0, plan: [], keep: false };
    window.__sf = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      h.mana = h.d.maxMana;
      for (const sk of h.skills) if (sk) sk.cd = 0;
      // (its pact kept full while it is filmed, but for the moment it is to burn out)
      if (f.keep && h.form === 'demon') h.pact = 30;
      Object.assign(c, { mx: 0, my: 0, fire: false, cast: false, hold: false, evade: false, face: false, approach: false, change: false });
      for (const p of f.plan) {
        if (f.t < p.from || f.t >= p.to) continue;
        if (p.face) { h.fx = p.face[0]; h.fy = p.face[1]; }
        if (p.run) { c.mx = p.run[0]; c.my = p.run[1]; }
        if (p.fire) { c.fire = true; c.aimX = h.x + p.fire[0] * 4; c.aimY = h.y + p.fire[1] * 4; c.face = !!p.run; }
        if (p.cast && !p.did) { p.did = true; c.cast = true; c.castX = h.x + p.cast[0]; c.castY = h.y + p.cast[1]; c.aimX = c.castX; c.aimY = c.castY; }
        if (p.evade && !p.did) { p.did = true; c.evade = true; c.evadeX = h.x + p.evade[0]; c.evadeY = h.y + p.evade[1]; }
        if (p.change && !p.did) { p.did = true; h.pact = 30; c.change = true; f.keep = true; }
        if (p.burn && !p.did) { p.did = true; f.keep = false; h.pact = 0.01; }
      }
      return run(dt, c);
    };
  });
  const PLAN = [];
  let t = 0;
  const add = (long, what, part) => { PLAN.push({ from: t, to: t + long, part, ...what }); t += long; };
  const BOLTS = process.env.BOLTS === '1';
  const W = { downright: [1, 0], toward: [0.71, 0.71], downleft: [0, 1], left: [-0.71, 0.71], upleft: [-1, 0], away: [-0.71, -0.71], upright: [0, -1], right: [0.71, -0.71] };
  // (BOLTS=1: only his bolt, thrown each of six ways, for a close look at it in flight)
  if (BOLTS) {
    add(0.8, { face: W.downright }, 'The hellfire bolt, thrown each way');
    for (const k of ['upright', 'away', 'upleft', 'left', 'toward', 'right']) {
      add(0.12, { face: W[k], fire: W[k] }, 'The hellfire bolt, thrown each way');
      add(1.0, {}, 'The hellfire bolt, thrown each way');
    }
  }
  if (!BOLTS) {
  add(1.6, { face: W.downright }, 'Standing, hunched and pained');
  for (const [k, name] of [['toward', 'toward you'], ['downleft', 'down-left'], ['left', 'left'], ['upleft', 'up-left'], ['away', 'away from you'], ['upright', 'up-right'], ['right', 'right'], ['downright', 'down-right']]) add(0.75, { face: W[k] }, `Turned through his eight sides: ${name}`);
  add(1.1, { run: W.toward }, 'Running, and stopping');
  add(0.6, {}, 'Running, and stopping');
  add(1.1, { run: W.left }, 'Running, and stopping');
  add(0.6, {}, 'Running, and stopping');
  add(1.1, { run: W.upright }, 'Running, and stopping');
  add(0.6, {}, 'Running, and stopping');
  add(0.12, { face: W.downleft, fire: W.downleft }, 'Tap: the hellfire bolt');
  add(1.4, {}, 'Tap: the hellfire bolt');
  add(0.12, { face: W.away, fire: W.away }, 'Tap: the hellfire bolt');
  add(1.4, {}, 'Tap: the hellfire bolt');
  add(0.1, { face: W.right, cast: [1.6, -1.6] }, 'Tap and hold: the Curse');
  add(2.3, {}, 'Tap and hold: the Curse');
  add(0.1, { evade: [3.5, 3.5] }, 'Swipe: the smoke step');
  add(1.6, {}, 'Swipe: the smoke step');
  add(0.4, { face: W.toward }, 'Tapped: he changes into the Living Shadow');
  add(0.1, { change: true }, 'Tapped: he changes into the Living Shadow');
  add(3.6, {}, 'Tapped: he changes into the Living Shadow');
  }
  const total = Math.round(t * FPS);
  const dir = process.env.FRAMES || `${out}_frames`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify({ fps: FPS, total, parts: PLAN.map((p) => ({ from: p.from, to: p.to, part: p.part })) }));
  const c0 = await page.evaluate((plan) => { const d = window.__dbg; d.slowmo = 1e-6; const f = window.__sf; f.plan = plan.map((p) => ({ ...p, from: p.from + f.t, to: p.to + f.t })); return d.clock(); }, PLAN);
  const slow = Number(process.env.SLOW || 0.05);
  const forms = [];
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
    if (i % 15 === 0) forms.push(`${i}:${(await where()).form}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  // (KEPT IN PACKS, render/baked.ts PACKS, on a page with his bake beside it: how many came and went, and how many were shown before
  // they were in hand, their first frame meanwhile)
  const packs = await page.evaluate(() => { const b = window.__dbg.baked && window.__dbg.baked(); return b && b.packs && b.packs.all ? b.packs : null; });
  if (packs) log('packs', JSON.stringify(packs));
  log('forms', forms.join(' '));
  log('film', `${total} frames in ${dir}`);
  void snap;
}
