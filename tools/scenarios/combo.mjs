// STRIKE'S COMBO, PLAYED WITH REAL INPUT (game/defs.ts, COMBO: OFF in the game until the owner has
// said yes; this playtest switches it on for itself and puts it back).
//
// The owner, 7 Oct 2026, 23:18: "I’d like STRIKE to have two animations.  The first is the strike
// we have now.  That one always plays first.  If the player taps again quickly, then the second
// animation, I downward slash, plays.  Back to the first if they tap again.  If it’s not tapped for
// a set duration, it goes back to the first animation.  Like a two hit combo if you tap twice";
// 23:18: "And I want him to move forward a little every swing"; 23:19: "Not much, but some".
//
// In the practice room, with a skeleton that cannot die stood within the knight's reach. On a
// phone a TAP on the right of the screen is Strike; on a PC a CLICK on the monster.
//   1. two quick taps (clicks): two swings, Strike and then the slash (on a PC the second click is
//      made in the middle of the first swing, and waits its turn: main.ts, `click`);
//   2. a tap long after them: Strike again; and one quickly after that: the slash;
//   3. every swing stepped him forward, about a third of a tile, until the monster stopped him;
//   4. with the switch off: two quick taps are Strike and Strike, and he does not step.
//   node tools/playtest.mjs [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/combo.mjs --out shots/combo/pc
import { makeHands, log } from './lib.mjs';

/** (game/defs.ts, TUNE.heroRadius) */
const HERO_RADIUS = 0.3;

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  const client = hands.client;
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  /** One quick touch or click at a point in game pixels (the press is not waited for before the release: see lib.mjs). */
  const hit = async (gx, gy) => {
    const c = await client(gx, gy);
    if (cdp) {
      const pt = [{ x: Math.round(c.x), y: Math.round(c.y), id: 7 }];
      const down = cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt });
      await page.waitForTimeout(45);
      await Promise.all([down, cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })]);
    } else {
      await page.mouse.move(c.x, c.y);
      await page.mouse.down();
      await page.waitForTimeout(45);
      await page.mouse.up();
    }
  };

  /** The practice room, the knight, a skeleton that cannot die `dist` tiles ahead of him; the combo's switch as asked. Every swing begun is written down. */
  const room = (on, dist) => page.evaluate(([on, dist]) => {
    const d = window.__dbg; d.saving(false);
    d.practice('warrior', 7);
    const g = d.game();
    d.god = true; d.autoLevel = false; d.autoWords = false;
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    if (window.__comboWas === undefined) window.__comboWas = d.combo.on;
    d.combo.on = on;
    const h = g.hero;
    h.fx = Math.SQRT1_2; h.fy = -Math.SQRT1_2;
    const m = g.spawn('skeleton', h.x + h.fx * dist, h.y + h.fy * dist, 1, 0, false, g.rng);
    g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e7;
    window.__swings = [];
    let last = 1e9;
    const up = g.update.bind(g);
    g.update = (dt, c) => {
      up(dt, c);
      if (h.anim === 'attack' && h.attackSkill === 0 && h.attackAge < last) window.__swings.push({ which: h.combo, x: h.x, y: h.y, fx: h.fx, fy: h.fy, at: performance.now() });
      last = h.anim === 'attack' && h.attackSkill === 0 ? h.attackAge : 1e9;
    };
    return m.id;
  }, [on, dist]);

  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const c = d.cam(); const s = d.screen;
    const m = g.monsters.find((q) => !q.dead);
    const scr = (x, y) => ({ x: c.ox + (x - y) * 16, y: c.oy + (x + y) * 8 });
    return { w: s.w, h: s.h, x: h.x, y: h.y, uses: h.skills[0].uses, swings: window.__swings.slice(), mon: m ? { x: m.x, y: m.y, r: m.r, at: scr(m.x, m.y) } : null, between: 1 / Math.max(0.3, h.skills[0].r.rate) };
  });
  /** Where to tap or click for Strike: on a phone, open floor on the right of the screen; on a PC, the monster's body. */
  const spot = (s) => (touch ? { x: Math.round(s.w * 0.84), y: Math.round(s.h * 0.56) } : { x: s.mon.at.x, y: s.mon.at.y - 12 });
  const until = async (pred, ms) => { for (let t = 0; t < ms; t += 40) { const s = await st(); if (pred(s)) return s; await page.waitForTimeout(40); } return st(); };
  const names = (list) => list.map((q) => (q.which === 1 ? 'slash' : 'Strike')).join(', ');

  // ---- 1. two quick taps: Strike, then the slash ----------------------------------------------------
  await room(true, 1.4);
  await page.waitForTimeout(600);
  let s = await st();
  log('screen', `${s.w}x${s.h}, ${touch ? 'touch' : 'mouse'}; ${s.between.toFixed(2)} s between blows`);
  let p = spot(s);
  await snap('01_before');
  await hit(p.x, p.y);
  await page.waitForTimeout(160);
  await hit(p.x, p.y);
  s = await until((q) => q.swings.length >= 2, 3000);
  await page.waitForTimeout(500);
  s = await st();
  check('1. two quick taps: Strike, then the slash', names(s.swings) === 'Strike, slash', names(s.swings) || 'no swing');
  const gap = s.swings.length >= 2 ? (s.swings[1].at - s.swings[0].at) / 1000 : 0;
  check('   the second as soon as the first allowed it', gap > s.between - 0.15 && gap < s.between + 0.35, `${gap.toFixed(2)} s apart`);
  await snap('02_after_the_two');

  // ---- 2. a tap long after: Strike again; one quickly after that: the slash -----------------------
  await page.waitForTimeout(Math.round((s.between + 1.4) * 1000));
  s = await st();
  let n = s.swings.length;
  p = spot(s);
  await hit(p.x, p.y);
  s = await until((q) => q.swings.length > n, 2500);
  await page.waitForTimeout(120);
  await hit(p.x, p.y);
  s = await until((q) => q.swings.length > n + 1, 3000);
  await page.waitForTimeout(400);
  s = await st();
  check('2. a tap long after: Strike again; and one quickly after that: the slash', names(s.swings.slice(n)) === 'Strike, slash', names(s.swings.slice(n)));
  await snap('03_again');

  // ---- 3. every swing stepped him forward (until the monster stopped him) -------------------------
  const steps = [];
  for (let i = 1; i < s.swings.length; i++) {
    const a = s.swings[i - 1]; const b = s.swings[i];
    steps.push((b.x - a.x) * a.fx + (b.y - a.y) * a.fy);
  }
  check('3. every swing stepped him forward, a third of a tile, until the monster stopped him', steps.length >= 3 && steps[0] > 0.25 && steps[0] < 0.42 && steps.every((d) => d > -0.02 && d < 0.42), steps.map((d) => d.toFixed(2)).join(', '));
  // (the game keeps a hero this far from a monster: his own 0.3 and four fifths of its size, game.ts)
  const near = Math.hypot(s.mon.x - s.x, s.mon.y - s.y);
  const least = HERO_RADIUS + s.mon.r * 0.8;
  check('   and he is not inside it', near > least - 0.02, `${near.toFixed(2)} tiles from it; the least the game allows is ${least.toFixed(2)}`);

  // ---- 4. with the switch off: Strike and Strike, and no step ---------------------------------------
  await room(false, 1.4);
  await page.waitForTimeout(600);
  s = await st();
  const x0 = s.x; const y0 = s.y;
  p = spot(s);
  await hit(p.x, p.y);
  await page.waitForTimeout(160);
  await hit(p.x, p.y);
  s = await until((q) => q.swings.length >= (touch ? 2 : 1), 3000);
  await page.waitForTimeout(1600);
  s = await st();
  check('4. with the switch off: every swing is Strike', s.swings.length >= 1 && s.swings.every((q) => q.which === 0), names(s.swings));
  check('   (on a phone the second tap waits its turn, as it always has; on a PC a click in the middle of a swing is lost, as it always has been)', s.swings.length === (touch ? 2 : 1), `${s.swings.length} swing(s)`);
  check('   and he does not step', Math.hypot(s.x - x0, s.y - y0) < 1e-6, `${Math.hypot(s.x - x0, s.y - y0).toFixed(4)} tiles`);

  await page.evaluate(() => { const d = window.__dbg; d.combo.on = window.__comboWas; });
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `combo: ${fails} thing(s) wrong` : 'combo: ok');
}
