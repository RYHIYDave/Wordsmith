// EVERY WORD ON GEAR (his words, 8 Nov 2026, 06:45: “Every rune sorry”): a melded word and a ranked one burned into gear, in the
// game itself. The practice room's Warrior, a plain ring in his bag: Eruption held over it (the question: what it could become,
// two properties together), then burned in; Power II into a plain chest. A line starting "!!" is something wrong.
//   node tools/playtest.mjs --file <page> [--serve] --size 960x540 --scenario tools/scenarios/runes_gear.mjs --out shots/runes_gear
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
    const plain = (slot, seed) => { for (let s = seed; s < seed + 500; s++) { const it = d.item(slot, 0, 10, s); if (it.affixes.length === 0) { it.reqLevel = 1; return it; } } return d.item(slot, 0, 10, seed); };
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    h.bag[0] = plain('ring', 11);
    h.bag[1] = plain('chest', 31);
    h.words.eruption = Math.max(1, h.words.eruption || 0);
    h.words.power2 = Math.max(1, h.words.power2 || 0);
    d.inv();
    return { eruption: h.words.eruption, power2: h.words.power2, ring: h.bag[0].name, chest: h.bag[1].name, choices: g.imbueChoices({ kind: 'bag', i: 0 }, 'eruption').map((o) => `${o.stat}+${o.also ? o.also.stat : '-'}`) };
  });
  say(`set: ${JSON.stringify(set)}`);
  if (!set.choices.length) bad('Eruption offers nothing on a plain ring');
  if (set.choices.some((c) => c.endsWith('+-'))) bad('a melded word with one property only');
  await page.waitForTimeout(600);
  // (held over the ring: the question)
  const at = (n) => page.evaluate((n) => { const d = window.__dbg; const r = d.ui.marks.get(n); return r ? d.screen.toClient(r.x + r.w / 2, r.y + r.h / 2) : null; }, n);
  const from = await at('word:eruption');
  const to = await at('bag:0');
  if (from && to) {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 4 });
    await page.mouse.move(to.x, to.y, { steps: 4 });
    await page.waitForTimeout(300);
    await snap('1_over_the_ring');
    await page.mouse.up();
    await page.waitForTimeout(300);
    await snap('2_the_question');
  } else say(`(no marks for the word or the ring on this page: ${JSON.stringify({ from, to })})`);
  const made = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const why1 = g.imbue({ kind: 'bag', i: 0 }, 'eruption');
    const why2 = g.imbue({ kind: 'bag', i: 1 }, 'power2');
    const show = (it) => it.imbues.map((im) => `${im.word}: ${im.mods.map((m) => `${m.stat} ${m.value}`).join(', ')}`).join(' | ');
    return { why1, why2, ring: show(h.bag[0]), chest: show(h.bag[1]), gate: g.planProblem('eruption') };
  });
  say(`burned: ${JSON.stringify(made)}`);
  if (made.why1 || made.why2) bad(`refused: ${made.why1} / ${made.why2}`);
  if (!/eruption: \w+ [\d.]+, \w+ [\d.]+/.test(made.ring)) bad('the ring has not two properties from Eruption');
  if (!/power2: \w+ [\d.]+$/.test(made.chest)) bad('the chest has not one property from Power II');
  if (made.gate !== 'A melded word goes on attacks and gear only' && made.gate !== 'No spare word') bad(`the gate says: ${made.gate}`);
  const ring = await at('bag:0');
  if (ring) {
    await page.mouse.click(ring.x, ring.y);
    await page.waitForTimeout(400);
    await snap('3_the_ring_read');
  }
  const errs = await page.evaluate(() => (window.__errors || []).length);
  say(`errors ${errs}`);
}
