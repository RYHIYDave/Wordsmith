// FLAT DAMAGE (game/items.ts FLAT_PAIRS; his 8 Nov 2026, “Craftabke on weapons and gloves and rings”) in the game: the practice room's
// Warrior, a plain ring in his bag; Fire held over it (the question: its three outcomes, Flat fire damage among them), then burned in
// until it gives the flat fire damage (a fresh plain ring each try), and the ring read. A line starting "!!" is something wrong.
//   node tools/playtest.mjs --file <page> [--serve] --size 960x540 --scenario tools/scenarios/flat_damage_look.mjs --out shots/flat
export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const set = await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.practice('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    window.__plain = (seed) => { for (let s = seed; s < seed + 500; s++) { const it = d.item('ring', 0, 12, s); if (it.affixes.length === 0) { it.reqLevel = 1; return it; } } return d.item('ring', 0, 12, seed); };
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    h.bag[0] = window.__plain(11);
    h.words.fire = Math.max(30, h.words.fire || 0);
    d.inv();
    return { ring: h.bag[0].name, choices: g.imbueChoices({ kind: 'bag', i: 0 }, 'fire').map((o) => `${o.stat} ${o.min}-${o.max}`) };
  });
  say(`set: ${JSON.stringify(set)}`);
  if (!set.choices.some((c) => c.startsWith('fireMin'))) bad('Fire offers no flat damage on a ring');
  await page.waitForTimeout(600);
  await snap('0_open');
  say(`panel: ${await page.evaluate(() => JSON.stringify({ open: window.__dbg.panels ? Object.keys(window.__dbg.panels) : null, ui: Object.keys(window.__dbg.ui || {}) }))}`);
  const at = (n) => page.evaluate((n) => { const d = window.__dbg; const r = d.ui.marks.get(n); return r ? d.screen.toClient(r.x + r.w / 2, r.y + r.h / 2) : null; }, n);
  say(`marks: ${await page.evaluate(() => { const m = window.__dbg.ui && window.__dbg.ui.marks; return m ? [...m.keys()].slice(0, 40).join(' ') : 'none'; })}`);
  // (the marks are not kept between frames here: the Fire word and the ring where the 960 x 540 screen has them)
  const from = (await at('word:fire')) ?? { x: 612, y: 322 };
  const to = (await at('bag:0')) ?? { x: 511, y: 428 };
  if (from && to) {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 4 });
    await page.mouse.move(to.x, to.y, { steps: 4 });
    await page.waitForTimeout(300);
    await page.mouse.up();
    await page.waitForTimeout(300);
    await snap('1_the_question');
  } else say(`(no marks for the word or the ring on this page: ${JSON.stringify({ from, to })})`);
  const made = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    d.inv();
    for (let k = 0; k < 40; k++) {
      h.bag[0] = window.__plain(11 + k * 3);
      const why = g.imbue({ kind: 'bag', i: 0 }, 'fire');
      if (why) return { why };
      const im = h.bag[0].imbues[0];
      if (im && im.mods[0].stat === 'fireMin') return { tries: k + 1, mods: im.mods.map((m) => `${m.stat} ${m.value}`) };
    }
    return { none: true };
  });
  say(`burned: ${JSON.stringify(made)}`);
  if (!made.mods) bad('no flat fire damage in 40 burns');
  await page.waitForTimeout(400);
  const ring = (await at('bag:0')) ?? { x: 511, y: 428 };
  if (ring) {
    await page.mouse.click(ring.x, ring.y);
    await page.waitForTimeout(400);
    await snap('2_the_ring_read');
  }
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
