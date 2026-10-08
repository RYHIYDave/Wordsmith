// Where the hero's life is shown, and what it shows (Version 11.2).
// The owner, playing on a phone: "the health pool is hidden under my left thumb and is hard to see
// most of the time". So with fingers the life globe sits in the top left corner, and everywhere a
// bar of life hangs over the hero's head when it matters: in a fight, when hurt, just after a change.
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/hud.mjs --out shots/hud
//   CLS=mage node tools/playtest.mjs --scenario tools/scenarios/hud.mjs --out shots/hud_pc
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const hands = await makeHands(page);
  const bad = (s) => console.log(`  !! ${s}`);
  const touch = await page.evaluate(() => window.__dbg.screen.touch);
  await page.evaluate(([c]) => {
    const d = window.__dbg;
    d.saving(false);
    d.autoLevel = false;
    d.autoWords = false;
    d.run(c, 11);
    d.game().enterDungeon();
  }, [cls]);
  await page.waitForTimeout(700);
  const size = await page.evaluate(() => ({ w: window.__dbg.ui.w, h: window.__dbg.ui.h }));
  log('screen (game pixels)', `${size.w} x ${size.h}, ${touch ? 'fingers' : 'mouse'}`);
  const bar = () => page.evaluate(() => { const b = window.__dbg.renderer.lifeBar; return b ? { alpha: +b.alpha.toFixed(2), trail: +b.trail.toFixed(3), shown: +b.shown.toFixed(3) } : null; });
  const life = (frac) => page.evaluate((f) => { const h = window.__dbg.game().hero; h.life = Math.max(1, Math.round(h.d.maxLife * f)); }, frac);

  // ---- the globe and the flask ----------------------------------------------------------------
  const globe = await hands.mark('life');
  const flask = await hands.mark('potion');
  if (!globe) bad('the life globe is not on screen');
  if (!flask) bad('the flask is not on screen');
  if (globe && flask) {
    log('life globe at', `${Math.round(globe.x)}, ${Math.round(globe.y)}`);
    log('flask at', `${Math.round(flask.x)}, ${Math.round(flask.y)}`);
    if (touch) {
      if (!(globe.y < size.h * 0.3 && globe.x < size.w * 0.3)) bad('with fingers the life globe should be in the top left corner');
    } else if (!(globe.y > size.h * 0.7 && globe.x < size.w * 0.3)) bad('with a mouse the life globe should be in the bottom left corner');
    if (!(flask.y > size.h * 0.7 && flask.x < size.w * 0.3)) bad('the flask should be in the bottom left corner');
  }
  // nothing in the top left corner may sit on anything else there
  const corner = await page.evaluate(() => {
    const out = [];
    for (const [k, r] of window.__dbg.ui.marks) if (r.x < 140 && r.y < 80) out.push({ k, x: r.x, y: r.y, w: r.w, h: r.h });
    return out;
  });
  log('top left', corner.map((r) => `${r.k} ${r.x},${r.y} ${r.w}x${r.h}`).join(' | '));
  for (let i = 0; i < corner.length; i++) for (let j = i + 1; j < corner.length; j++) {
    const a = corner[i]; const b = corner[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) bad(`${a.k} and ${b.k} overlap in the top left corner`);
  }

  // ---- full life, nothing near: no bar ----------------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; for (const m of g.monsters) if (Math.hypot(m.x - h.x, m.y - h.y) < 16) m.dead = true; });
  await page.waitForTimeout(900);
  await snap('01_calm_full');
  let b = await bar();
  log('calm, full life', JSON.stringify(b));
  if (!b) bad('the renderer has no life bar');
  else if (b.alpha > 0.05) bad('at full life with nothing near, no bar should hang over the hero');

  // ---- a fight: the bar is there ----------------------------------------------------------------
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor;
    // (the monsters go on attacking and do no harm: the life shown is what this script says it is)
    g.hurtHero = () => {};
    let best = null; let bd = 1e9;
    for (const m of g.monsters) { if (m.dead || m.elite || m.boss) continue; const dd = Math.hypot(m.x - h.x, m.y - h.y); if (dd < bd) { bd = dd; best = m; } }
    if (!best) return;
    for (let r = 2.2; r <= 4 && best; r += 0.6) for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
      if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && g.sees(x, y, best.x, best.y)) { h.x = x; h.y = y; return; }
    }
  });
  await page.waitForTimeout(900);
  await snap('02_fight');
  b = await bar();
  log('in a fight', JSON.stringify(b));
  if (b && b.alpha < 0.9) bad('in a fight the bar should be there');

  // ---- hurt: the lost part lingers a moment, then goes --------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; h.life = h.d.maxLife; });
  await page.waitForTimeout(500);
  await life(0.55);
  await page.waitForTimeout(120);
  // (read before the picture is taken: the trail runs down in under a second, and a picture of a
  // phone's screen can take a good part of one when four playtests share the machine)
  b = await bar();
  await snap('03_just_hurt');
  log('just hurt', JSON.stringify(b));
  if (b && !(b.trail > b.shown + 0.2)) bad('just after a blow the lost life should still show as a trail');
  await page.waitForTimeout(1500);
  b = await bar();
  log('a moment later', JSON.stringify(b));
  if (b && b.trail > b.shown + 0.02) bad('the trail should have run down to the life left');
  await life(0.18);
  await page.waitForTimeout(700);
  await snap('04_low');
  await page.evaluate(() => { const h = window.__dbg.game().hero; h.burnT = 3; });
  await page.waitForTimeout(300);
  await snap('05_low_burning');
  await page.evaluate(() => { const h = window.__dbg.game().hero; h.burnT = 0; h.poisonT = 3; });
  await page.waitForTimeout(300);
  await snap('06_low_poisoned');
  await page.evaluate(() => { const h = window.__dbg.game().hero; h.poisonT = 0; });

  // ---- the hero has something to say: it stands clear of the bar ----------------------------------
  await life(0.7);
  await page.evaluate(() => { window.__dbg.fx.quip = { text: "I'm just warming up.", t: 0.3 }; });
  await page.waitForTimeout(250);
  await snap('07_line_over_bar');

  // ---- mana, when mana is what limits the slow attack ---------------------------------------------
  await page.evaluate(() => { const d = window.__dbg; if (d.meta().limit !== 'mana') d.flipLimit(); const h = d.game().hero; h.mana = h.d.maxMana * 0.4; });
  await page.waitForTimeout(300);
  await snap('08_mana');
  await page.evaluate(() => { const d = window.__dbg; if (d.meta().limit === 'mana') d.flipLimit(); });

  // ---- the thumb on the screen: is the life still in view? ---------------------------------------
  if (touch) {
    const cdp = await page.context().newCDPSession(page);
    const c = await page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [size.w * 0.13, size.h * 0.8]);
    const pt = [{ x: Math.round(c.x), y: Math.round(c.y), id: 3 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt });
    await page.waitForTimeout(80);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...pt[0], x: pt[0].x + 30, y: pt[0].y - 16 }] });
    await page.waitForTimeout(400);
    await snap('09_thumb_down');
    const stick = await page.evaluate(() => { const s = window.__dbg.input.stick; return { on: s.active, x: s.ox, y: s.oy }; });
    log('thumb', JSON.stringify(stick));
    if (!stick.on) bad('the thumb did not take the stick');
    if (globe && stick.on && Math.hypot(globe.x - stick.x, globe.y - stick.y) < 90) bad('the life globe is within a thumb of where the thumb rests');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  // ---- the fight over, healed: the bar goes -------------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; for (const m of g.monsters) if (Math.hypot(m.x - h.x, m.y - h.y) < 18) m.dead = true; h.life = h.d.maxLife; });
  await page.waitForTimeout(600);
  b = await bar();
  log('healed, half a second on', JSON.stringify(b));
  if (b && b.alpha < 0.5) bad('a change in life should keep the bar up for a moment');
  await page.waitForTimeout(3200);
  await snap('10_healed_calm');
  b = await bar();
  log('healed, later', JSON.stringify(b));
  if (b && b.alpha > 0.05) bad('healed and out of the fight, the bar should have gone');

  // ---- hurt and alone: it stays --------------------------------------------------------------------
  await life(0.6);
  await page.waitForTimeout(3500);
  await snap('11_hurt_calm');
  b = await bar();
  if (b && b.alpha < 0.9) bad('a hurt hero should keep the bar even with nothing near');

  // ---- the town: no bar ------------------------------------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); g.enterTown(); });
  await page.waitForTimeout(3600);
  await snap('12_town');
  b = await bar();
  log('town', JSON.stringify(b));
  if (b && b.alpha > 0.05) bad('in town at full life there should be no bar');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) bad(`letters the font cannot draw: ${missing.join(' ')}`);
}
