// HAND_IN (game/defs.ts), behind its switch, off in the game: quest items given by using the one they
// are for, not by walking past him. His word, 13 Oct 2026, 14:25 (to the planning chat): “I’d like the
// quest turn ins to be triggered by interacting with the npcs not just when you walk by.” Pictures for
// him, with it switched on by the test hook (__dbg.handIn), checking as it goes:
//   1. a new hero carrying the master rune-stone walks right up to the wordsmith: nothing is given;
//      his prompt says GIVE THE RUNE-STONE
//   2. the prompt pressed: the stone is given and the ring powers up (the art chat's), then the first word
//   3. another hero, the same again by a tap on the wordsmith from across the ring: he walks over and gives it
//   4. with the switch off, walking up gives it, as before
//   node tools/build_to.mjs dist/hand_in.html
//   node tools/playtest.mjs --file dist/hand_in.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/hand_in.mjs --out shots/hand_in
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const st = () => page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; return { town: g.level.town, quest: h.quest, ring: h.ring, hint: g.interactHint(), panel: d.panels.open, words: Object.values(h.words).reduce((a, b) => a + b, 0), errand: d.errand() }; });
  /** A new hero in town, the ring dark, carrying the stone, `far` tiles from the wordsmith along the walkable floor nearest that. */
  const fresh = (seed, far) => page.evaluate(([seed, far]) => {
    const d = window.__dbg; d.saving(false);
    d.run('warrior', seed);
    const g = d.game(); const h = g.hero;
    h.ring = false; g.meta.ring = false; h.quest = 'heart';
    for (const w of Object.keys(h.words)) h.words[w] = 0;
    g.refresh();
    const s = g.level.stations.find((x) => x.kind === 'wordsmith'); const f = g.level.floor;
    let best = null; let bd = 1e9;
    for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
      if (g.level.walk[ty * f.w + tx] !== 1) continue;
      const dd = Math.abs(Math.hypot(tx + 0.5 - s.x, ty + 0.5 - s.y) - far) + (ty + 0.5 < s.y ? 3 : 0);
      if (dd < bd) { bd = dd; best = { x: tx + 0.5, y: ty + 0.5 }; }
    }
    h.x = best.x; h.y = best.y;
    const k = Math.hypot(s.x - h.x, s.y - h.y) || 1;
    h.fx = (s.x - h.x) / k; h.fy = (s.y - h.y) / k;
    return { at: +Math.hypot(s.x - h.x, s.y - h.y).toFixed(2) };
  }, [seed, far]);

  // ---- 1. walked right up to him: nothing is given -------------------------------------------------
  await page.evaluate(() => window.__dbg.handIn(true));
  // (he stands where a player walking up to the wordsmith would: the open floor nearest him)
  let at = await fresh(31, 0.9);
  await page.waitForTimeout(900);
  let s = await st();
  check('in town, carrying the stone, the ring dark', s.town && s.quest === 'heart' && !s.ring, JSON.stringify({ ...s, at }));
  check('walked right up to the wordsmith: nothing is given', s.quest === 'heart' && !s.ring);
  check('his prompt says so', s.hint === 'Give the rune-stone', s.hint);
  await snap('01_beside_him_the_prompt');

  // ---- 2. the prompt pressed ---------------------------------------------------------------------------
  const pressed = await hands.press(hands.touch ? 'button:Give the rune-stone' : 'button:Give the rune-stone (E)');
  check('the prompt is there to press', !!pressed);
  await page.waitForTimeout(250);
  s = await st();
  check('pressed: the stone is given and the ring lit, and no panel opens', s.quest === null && s.ring && s.panel === 'none', JSON.stringify(s));
  check('his prompt is his own again', s.hint === 'Wordsmith', s.hint);
  await snap('02_given_the_ring_lights');
  await page.waitForTimeout(1600);
  await snap('03_the_ring_powering_up');
  await page.waitForTimeout(3600);
  s = await st();
  check('once it has powered up, the first word is given', s.words === 1, JSON.stringify(s));
  await snap('04_the_first_word');

  // ---- 3. a tap on him, from across the ring -------------------------------------------------------------
  at = await fresh(37, 4.5);
  await page.waitForTimeout(600);
  s = await st();
  check('a second hero, carrying the stone, out of his reach', s.quest === 'heart' && !s.ring && s.hint === null, JSON.stringify({ ...s, at }));
  const tap = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const s = g.level.stations.find((x) => x.kind === 'wordsmith');
    const p = d.at(s.x, s.y);
    for (let up = 0; up <= 40; up += 4) for (const dx of [0, -4, 4]) if (d.spot(p.x + dx, p.y - up) === 'wordsmith') return { x: p.x + dx, y: p.y - up };
    return null;
  });
  check('the wordsmith can be tapped', !!tap, JSON.stringify(tap));
  if (tap) {
    await hands.pressAt(tap.x, tap.y);
    await page.waitForTimeout(150);
    check('tapped: he goes to the wordsmith', (await st()).errand === 'wordsmith');
    await snap('05_tapped_he_goes');
    let done = false;
    for (let k = 0; k < 40 && !done; k++) {
      await page.waitForTimeout(100);
      s = await st();
      done = s.quest === null;
    }
    check('there, he gives it, and no panel opens', s.quest === null && s.ring && s.panel === 'none', JSON.stringify(s));
    await page.waitForTimeout(300);
    await snap('06_tapped_given');
  }
  // and once given, using him opens his trade, as always
  const after = await hands.press(hands.touch ? 'button:Wordsmith' : 'button:Wordsmith (E)');
  await page.waitForTimeout(300);
  check('used again, he opens his half of the screen', !!after && (await st()).panel === 'wordsmith');
  await hands.press('button:DONE');
  await page.waitForTimeout(300);

  // ---- 3b. (WORDMELDING, where the page has it) the Meldstone, the same way -------------------------------
  if (await page.evaluate(() => !!window.__dbg.meld)) {
    await page.evaluate(() => window.__dbg.meld(true));
    at = await fresh(43, 0.9);
    await page.evaluate(() => { const h = window.__dbg.game().hero; h.quest = null; h.ring = true; h.meld = 'stone'; });
    await page.waitForTimeout(900);
    s = await st();
    const m0 = await page.evaluate(() => window.__dbg.game().hero.meld);
    check('carrying the Meldstone, walked right up to the wordsmith: nothing is given', m0 === 'stone', JSON.stringify({ ...s, at }));
    check('his prompt says so', s.hint === 'Give the Meldstone', s.hint);
    await snap('07_meldstone_beside_him');
    await hands.press(hands.touch ? 'button:Give the Meldstone' : 'button:Give the Meldstone (E)');
    await page.waitForTimeout(250);
    const m1 = await page.evaluate(() => window.__dbg.game().hero.meld);
    s = await st();
    check('pressed: he takes it, melding is open, and no panel opens', m1 === 'open' && s.panel === 'none', JSON.stringify(s));
    await snap('08_meldstone_given');
    await page.evaluate(() => window.__dbg.meld(false));
  }

  // ---- 4. with the switch off, as before ---------------------------------------------------------------
  await page.evaluate(() => window.__dbg.handIn(false));
  at = await fresh(41, 0.9);
  await page.waitForTimeout(600);
  s = await st();
  check('switched off: walked up to, he takes it, as before', s.quest === null && s.ring, JSON.stringify(s));
  log('done', 'hand_in');
}
