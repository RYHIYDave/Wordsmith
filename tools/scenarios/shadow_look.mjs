// THE LIVING SHADOW IN PLAY (art/shadow_art.ts, behind LIVING_SHADOW; the queue's finish-mage-and-warlock-eight-sides, step 3,
// 12 Nov 2026): film frames of the Warlock on floor 11's ground (the measure's own: the Mage's spot, AT=40,57), changing into it
// and doing all it does, by the game's own rules, his controls put in as a player's would be; and stills for the measure. As
// the Mage's (tools/scenarios/mage_up_look.mjs on art/mage-up2). A page built with its switch as wanted:
// node tools/shadow_page.mjs dist/shadow_on.html on.
//   CLS=warlock|brawler   who (warlock)
//   MODE=whole            one picture of the whole screen
//   MODE=still            one picture standing, facing down and right (NAME=...)
//   MODE=demon            one picture of it standing, changed (NAME=...)
//   MODE=film             frames, a picture every thirtieth of a second of the game's time; and plan.json, what each part is
//   CLIP=230x160          the picture's size in game pixels, round him       UP=40  how far above his feet its middle is
// With --size 1126x520 --dpr 3 a game pixel is six screen pixels.
import fs from 'node:fs';
import path from 'node:path';
import { log } from './lib.mjs';

const FPS = 30;

export default async function (page, snap) {
  const cls = process.env.CLS || 'warlock';
  const mode = process.env.MODE || 'film';
  const depth = Number(process.env.DEPTH || 11);
  const [cw, ch] = (process.env.CLIP || '230x160').split('x').map(Number);
  const up = Number(process.env.UP || 40);
  const out = process.env.OUT || 'shots/shadow/x';
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
  const DR = [1, 0];
  add(1.2, { face: DR }, 'The Warlock, as a man');
  add(0.1, { change: true }, 'Tapped: he changes into the Living Shadow');
  add(3.8, {}, 'Tapped: he changes into the Living Shadow');
  add(1.6, {}, 'It stands, up on two legs');
  add(1.0, { run: [0.71, 0.71] }, 'It drops onto all fours to run, and rears up to stop');
  add(0.9, {}, 'It drops onto all fours to run, and rears up to stop');
  add(1.0, { run: [-1, 0] }, 'It drops onto all fours to run, and rears up to stop');
  add(0.9, {}, 'It drops onto all fours to run, and rears up to stop');
  add(0.12, { fire: [1, 0] }, 'Tap: its slashes, left claw then right');
  add(0.45, {}, 'Tap: its slashes, left claw then right');
  add(0.12, { fire: [1, 0] }, 'Tap: its slashes, left claw then right');
  add(1.1, {}, 'Tap: its slashes, left claw then right');
  add(1.1, { run: [0.71, -0.71], fire: [1, 0] }, 'Tap while moving: it slashes walking on two legs');
  add(0.8, {}, 'Tap while moving: it slashes walking on two legs');
  add(0.1, { cast: [2.2, 0.5] }, 'Tap and hold: Damning');
  add(2.0, {}, 'Tap and hold: Damning');
  add(0.1, { evade: [-5, 2] }, 'Swipe: the smoke step');
  add(2.0, {}, 'Swipe: the smoke step');
  add(0.1, { burn: true }, 'Its pact runs dry: it burns out, and he gets up');
  add(6.4, {}, 'Its pact runs dry: it burns out, and he gets up');
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
  log('forms', forms.join(' '));
  log('film', `${total} frames in ${dir}`);
  void snap;
}
