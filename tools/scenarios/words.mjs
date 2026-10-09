// Photographs every power word in front of and behind both abilities of one class, mid-fight.
//   CLS=mage node tools/playtest.mjs --scenario tools/scenarios/words.mjs --out shots/w_mage
export default async function (page, snap) {
  const cls = process.env.CLS || 'mage';
  // (and since Version 19.3 the four new words, with their looks: Heavy, Precise, Frenzied, Guarding)
  const words = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison', 'heavy', 'precise', 'frenzied', 'guarding'];
  await page.evaluate((c) => { const d = window.__dbg; d.run(c, 11); d.god = true; d.speed = 6; d.bot(true); }, cls);
  const st = () => page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    const awake = g.monsters.filter((m) => !m.dead && m.state !== 'sleep' && Math.hypot(m.x - h.x, m.y - h.y) < 7).length;
    return { town: g.level.town, awake, proj: g.projectiles.length, zones: g.zones.length, traps: g.traps.length, left: g.monsters.filter((m) => !m.dead).length, depth: g.depth, skills: h.skills.map((k) => k.r.name) };
  });
  const setWords = (side, word) => page.evaluate(([side, word]) => {
    const g = window.__dbg.game(); const h = g.hero;
    for (let s = 0; s < 2; s++) for (const sd of ['front', 'behind']) { const grp = sd === 'front' ? h.skills[s].front : h.skills[s].behind; for (let i = 0; i < grp.length; i++) if (grp[i]) g.unsocket(s, sd, i); }
    for (const w of Object.keys(h.words)) h.words[w] = 0;
    h.words[word] = 2;
    const a = g.socket(0, side, word); const b = g.socket(1, side, word);
    h.mana = h.d.maxMana;
    for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; }
    return [a, b];
  }, [side, word]);
  for (const side of ['front', 'behind']) {
    for (const word of words) {
      const res = await setWords(side, word);
      await page.evaluate(() => { window.__dbg.speed = 6; });
      let s = await st();
      for (let i = 0; i < 160; i++) { s = await st(); if (!s.town && s.awake >= 2) break; await page.waitForTimeout(100); }
      await page.evaluate(() => { window.__dbg.speed = 1; const h = window.__dbg.game().hero; h.mana = h.d.maxMana; for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; } });
      await page.waitForTimeout(1100);
      s = await st();
      await snap(`${side}_${word}`);
      console.log(`${side.padEnd(6)} ${word.padEnd(9)} ${JSON.stringify(s.skills.slice(0, 2)).padEnd(52)} awake ${s.awake} proj ${s.proj} zones ${s.zones} traps ${s.traps} left ${s.left} d${s.depth} ${res[0] || res[1] ? 'SOCKET PROBLEM ' + JSON.stringify(res) : ''}`);
    }
  }
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
