// Photographs power words at work in the practice room, in slow motion, at set moments after the
// ability is used. For each loadout: the slow ability, then the quick one.
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/wordfx.mjs --out shots/wfx
// Environment:
//   CLS    warrior | ranger | mage                         (default warrior)
//   SETS   loadouts, separated by ';'. Each is  front|behind  with words separated by '+'.
//          "fire|" = Flame in front; "|fire" = of Flame; "power+fire|twin+volatile" = all four sockets.
//          Default: every word alone in front, then every word alone behind.
//   TIMES  moments to photograph, in game seconds after the ability goes off. The default,
//          0.02,0.07,0.13,0.2,0.3,0.45,0.7,0.84,0.95,1.24,1.36,1.42,1.5,1.66,1.72, covers the hit and
//          then what is left behind: an echo repeats at 0.8 s; a rune goes off 1.2 s after it is
//          written (at once under a Slam or Nova, on impact for a shot, at 0.4 s for a trap).
//   SLOW   slow-motion factor while photographing (default 0.2).
//   GAP    how far from the monsters the hero stands (default 1.3 for the warrior, 3 for the others).
// The monsters are kept from attacking while the pictures are taken, so nothing of theirs is in the way.
import { makeHands, log } from './lib.mjs';

const WORDS = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const times = (process.env.TIMES || '0.02,0.07,0.13,0.2,0.3,0.45,0.7,0.84,0.95,1.24,1.36,1.42,1.5,1.66,1.72').split(',').map(Number);
  const slow = Number(process.env.SLOW || 0.2);
  const gap = Number(process.env.GAP || (cls === 'warrior' ? 1.3 : 3));
  const sets = (process.env.SETS || [...WORDS.map((w) => `${w}|`), ...WORDS.map((w) => `|${w}`)].join(';'))
    .split(';').map((s) => s.trim()).filter(Boolean)
    .map((s) => { const [f, b] = s.split('|'); return { front: (f || '').split('+').filter(Boolean), behind: (b || '').split('+').filter(Boolean) }; });
  await page.evaluate((c) => { const d = window.__dbg; d.practice(c, 7); d.autoLevel = false; }, cls);
  await page.waitForTimeout(400);
  const hands = await makeHands(page);
  const setWords = (set) => page.evaluate((set) => {
    const g = window.__dbg.game(); const h = g.hero;
    for (let k = 0; k < 2; k++) for (const sd of ['front', 'behind']) { const grp = sd === 'front' ? h.skills[k].front : h.skills[k].behind; for (let i = 0; i < grp.length; i++) if (grp[i]) g.unsocket(k, sd, i); }
    for (const w of Object.keys(h.words)) h.words[w] = 4;
    const problems = [];
    for (let k = 0; k < 2; k++) {
      for (const w of set.front) { const why = g.socket(k, 'front', w); if (why) problems.push(`${w} in front: ${why}`); }
      for (const w of set.behind) { const why = g.socket(k, 'behind', w); if (why) problems.push(`${w} behind: ${why}`); }
    }
    return problems;
  }, set);
  const ready = () => page.evaluate(() => { const h = window.__dbg.game().hero; h.mana = h.d.maxMana; h.life = h.d.maxLife; h.might = 0; h.mightT = 0; h.haste = 0; h.hasteT = 0; h.swingT = 0; for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; } });
  /** Nothing left over from the last ability: its ground, its shots, its effects. */
  const sweep = () => page.evaluate(() => { const d = window.__dbg; const g = d.game(); g.zones.length = 0; g.projectiles.length = 0; g.traps.length = 0; g.drops.length = 0; d.fx.clear(); });
  /** The monsters hold their blows (they still walk and still die). */
  const calm = () => page.evaluate(() => {
    const g = window.__dbg.game();
    g.waveT = Math.max(g.waveT, 4); // and no new pack walks in half way through
    for (const m of g.monsters) {
      if (m.dead) continue;
      m.cd = 9;
      if (m.state === 'windup' || m.state === 'recover') { m.state = 'chase'; m.anim = 'idle'; }
      // and they stay where they are, so a shot can be seen on its way to them
      if (m.speed > 0) { m.heldSpeed = m.speed; m.speed = 0; }
    }
    for (let i = g.zones.length - 1; i >= 0; i--) if (g.zones[i].hostile) g.zones.splice(i, 1);
    for (let i = g.projectiles.length - 1; i >= 0; i--) if (g.projectiles[i].hostile) g.projectiles.splice(i, 1);
  });
  /** The pictures are taken: the monsters may move again. */
  const release = () => page.evaluate(() => { for (const m of window.__dbg.game().monsters) if (m.heldSpeed) { m.speed = m.heldSpeed; m.heldSpeed = 0; } });
  /** Stand `gap` tiles from the thickest knot of monsters. Says how many are in the knot, or null if the room is empty. */
  const place = (weak) => page.evaluate(([gap, weak]) => {
    const g = window.__dbg.game(); const h = g.hero; const L = g.level; const f = L.floor;
    const all = g.monsters.filter((m) => !m.dead);
    // too few left to make a picture: call the next pack in now (the room would, in its own time)
    if (all.length < 4) { g.spawnWave(); return null; }
    const walkers = all.filter((m) => m.kind !== 'bat');
    const alive = walkers.length >= 2 ? walkers : all;
    let best = alive[0]; let most = -1;
    for (const m of alive) { const n = alive.filter((o) => Math.hypot(o.x - m.x, o.y - m.y) < 1.8).length; if (n > most) { best = m; most = n; } }
    // of the places `gap` away with a clear floor between, the one with the most room round it
    let spot = null; let room = -1;
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const x = best.x + Math.cos(a) * gap; const y = best.y + Math.sin(a) * gap;
      let clear = true;
      for (let s = 0; s <= 6 && clear; s++) { const px = best.x + (x - best.x) * (s / 6); const py = best.y + (y - best.y) * (s / 6); if (L.walk[Math.floor(py) * f.w + Math.floor(px)] !== 1) clear = false; }
      if (!clear) continue;
      let near = 99;
      for (const o of all) near = Math.min(near, Math.hypot(o.x - x, o.y - y));
      if (near > room) { room = near; spot = { x, y }; }
    }
    if (!spot) return null;
    h.x = spot.x; h.y = spot.y;
    window.__aim = best;
    // a kill is needed to show what some words leave behind
    if (weak) for (const o of all) if (Math.hypot(o.x - best.x, o.y - best.y) < 2.2) o.life = 1;
    return most;
  }, [gap, weak]);
  const aim = () => page.evaluate(() => { const d = window.__dbg; const m = window.__aim; return d.at(m.x, m.y); });
  const clock = () => page.evaluate(() => window.__dbg.game().time);
  const speed = (k) => page.evaluate((k) => { window.__dbg.slowmo = k; }, k);
  let worst = 0;
  for (const set of sets) {
    let peak = 0;
    const tag = `${set.front.join('+') || '-'}_${set.behind.join('+') || '-'}`;
    await speed(1);
    await sweep();
    const problems = await setWords(set);
    await page.waitForTimeout(2400); // the "word joined" flourish plays out before the pictures
    for (const [label, button] of [['slow', 'right'], ['quick', 'left']]) {
      await sweep();
      await ready();
      let knot = null;
      for (let i = 0; i < 80 && knot === null; i++) { knot = await place(set.behind.includes('leech')); if (knot === null) await page.waitForTimeout(100); }
      if (knot === null) { log(`${tag} ${label}`, 'no monsters came'); continue; }
      await calm();
      await page.waitForTimeout(350); // the camera catches up
      await calm();
      const at = await aim();
      const c = await hands.client(at.x, at.y - 10);
      await page.mouse.move(c.x, c.y);
      // where the target is in the pictures, so the contact sheets can frame hero and target together
      snap.note(`${tag}_${label}`, { x: Math.round(c.x), y: Math.round(c.y) });
      await speed(slow);
      // (a life orb is a matter of chance: for the picture, the chance is made certain)
      if (set.behind.includes('leech')) await page.evaluate(() => { for (const s of window.__dbg.game().hero.skills) if (s.r.orbChance > 0) s.r.orbChance = 1; });
      const before = await page.evaluate(() => window.__dbg.game().hero.skills.slice(0, 2).map((s) => s.uses));
      await page.mouse.down({ button });
      let went = true;
      try {
        await page.waitForFunction((b) => window.__dbg.game().hero.skills.slice(0, 2).some((s, i) => s.uses > b[i]), before, { timeout: 6000, polling: 'raf' });
      } catch { went = false; }
      const t0 = await clock();
      await page.mouse.up({ button });
      if (!went) { log(`${tag} ${label}`, 'the ability did not go off'); await speed(1); await release(); continue; }
      for (let i = 0; i < times.length; i++) {
        const due = t0 + times[i];
        // a long wait is run at full speed, then slowed again just before the moment
        if (due - (await clock()) > 0.12) {
          await speed(1);
          await page.waitForFunction((t) => window.__dbg.game().time >= t - 0.05, due, { polling: 'raf', timeout: 8000 });
          await speed(slow);
        }
        await page.waitForFunction((t) => window.__dbg.game().time >= t, due, { polling: 'raf', timeout: 8000 });
        await snap(`${tag}_${label}_${String(i).padStart(2, '0')}`);
        peak = Math.max(peak, await page.evaluate(() => window.__dbg.fx.particles.length));
        await calm();
      }
      await speed(1);
      await release();
      await page.waitForTimeout(300);
    }
    const names = await page.evaluate(() => window.__dbg.game().hero.skills.slice(0, 2).map((k) => k.r.name));
    worst = Math.max(worst, peak);
    log(tag, `${names.join(' / ')}   (${peak} particles at most)${problems.length ? '   !! ' + problems.join('; ') : ''}`);
  }
  log('most particles in the air at once', worst);
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
