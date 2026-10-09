// Photographs the Power word at work, frame by frame: the slow ability, then the quick one, with
// Power in front of both; then the moment a word is slotted in the Words panel.
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/powerfx.mjs --out shots/pfx_warrior
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const word = process.env.WORD || 'power';
  // (THE FIRST LEVELS, the game's own since Version 19.5: a hero some way in, the ring lit and all three moves open)
  await page.evaluate((c) => { const d = window.__dbg; d.run(c, 11); d.seasoned(5); d.god = true; d.speed = 6; d.autoLevel = false; d.autoWords = false; d.bot(true); }, cls);
  const hands = await makeHands(page);
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const near = g.monsters.filter((m) => !m.dead && m.state !== 'sleep' && Math.hypot(m.x - h.x, m.y - h.y) < 6);
    near.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
    const t = near[0];
    return { town: g.level.town, awake: near.length, target: t ? { ...d.at(t.x, t.y), d: +Math.hypot(t.x - h.x, t.y - h.y).toFixed(1) } : null, skills: h.skills.map((k) => k.r.name), freeze: d.fx.freeze, cracks: d.fx.cracks.length };
  });
  // the bot walks into a fight
  let s = await st();
  for (let i = 0; i < 200; i++) { s = await st(); if (!s.town && s.awake >= 3) break; await page.waitForTimeout(100); }
  // from here a person plays: Power in front of both abilities, everything ready
  await page.evaluate((w) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    d.bot(false); d.speed = 1;
    for (let k = 0; k < 2; k++) for (const sd of ['front', 'behind']) { const grp = sd === 'front' ? h.skills[k].front : h.skills[k].behind; for (let i = 0; i < grp.length; i++) if (grp[i]) g.unsocket(k, sd, i); }
    for (const q of Object.keys(h.words)) h.words[q] = 0;
    h.words[w] = 3;
    g.socket(0, 'front', w); g.socket(1, 'front', w);
    h.mana = h.d.maxMana;
    for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; }
  }, word);
  await page.waitForTimeout(500);
  s = await st();
  log('ready', JSON.stringify({ skills: s.skills.slice(0, 2), awake: s.awake, target: s.target }));

  const burst = async (label, button, n) => {
    s = await st();
    if (!s.target) { log(label, 'no monster in reach'); return; }
    const c = await hands.client(s.target.x, s.target.y - 10);
    await page.mouse.move(c.x, c.y);
    await page.mouse.down({ button: button === 2 ? 'right' : 'left' });
    let maxFreeze = 0;
    for (let i = 0; i < n; i++) {
      await snap(`${label}_${String(i).padStart(2, '0')}`);
      const q = await st();
      maxFreeze = Math.max(maxFreeze, q.freeze);
    }
    await page.mouse.up({ button: button === 2 ? 'right' : 'left' });
    s = await st();
    log(label, `longest hold seen ${maxFreeze.toFixed(3)} s, cracks on the floor ${s.cracks}`);
    await page.evaluate(() => { const h = window.__dbg.game().hero; h.mana = h.d.maxMana; for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; } });
    await page.waitForTimeout(700);
  };
  await burst('slow', 2, 9);
  // the slow ability tends to finish the fight: let the bot find another one for the quick ability
  await page.evaluate(() => { const d = window.__dbg; d.bot(true); d.speed = 6; });
  for (let i = 0; i < 200; i++) { s = await st(); if (!s.town && s.awake >= 2 && s.target && s.target.d < 4) break; await page.waitForTimeout(100); }
  await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; const h = d.game().hero; h.mana = h.d.maxMana; for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; } });
  await page.waitForTimeout(250);
  await burst('quick', 0, 9);

  // the Words screen
  await hands.key('Tab');
  await page.waitForTimeout(200);
  await snap('inventory_tab');
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
