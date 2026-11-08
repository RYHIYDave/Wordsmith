// SPLITTING AND BINDING AT THE BENCH (game/items.ts ITEM_WORDS, switched on for this page only): the practice room's Warrior, two rings
// in his bag (four properties, and three); Splitting held over the first (the question), split (the bag: two rings now); Binding held
// over the first (it asks for the second), the second tapped (the question), bound (the ring read). For his pictures.
//   node tools/build_to.mjs dist/itemwords.html
//   node tools/playtest.mjs --file dist/itemwords.html --size 960x540 --scenario tools/scenarios/item_words_look.mjs --out shots/itemwords/a
export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const set = await page.evaluate(() => {
    const d = window.__dbg;
    d.itemWords.on = true;
    d.saving(false);
    d.practice('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    const plain = (seed) => { for (let s = seed; s < seed + 500; s++) { const it = d.item('ring', 0, 12, s); if (it.affixes.length === 0) { it.reqLevel = 1; return it; } } return d.item('ring', 0, 12, seed); };
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    h.bag[0] = plain(11);
    h.bag[1] = plain(41);
    for (const w of ['fire', 'leech', 'twin', 'swift']) { h.words[w] = (h.words[w] || 0) + 1; g.imbue({ kind: 'bag', i: 0 }, w); }
    for (const w of ['frost', 'volatile', 'power']) { h.words[w] = (h.words[w] || 0) + 1; g.imbue({ kind: 'bag', i: 1 }, w); }
    h.words.splitting = Math.max(1, h.words.splitting || 0);
    h.words.binding = Math.max(1, h.words.binding || 0);
    d.inv();
    d.invUi.page = 'gear';
    d.invUi.pending = { word: 'splitting', sel: { kind: 'bag', i: 0 } };
    return { a: h.bag[0].imbues.length, b: h.bag[1].imbues.length };
  });
  say(`set: ${JSON.stringify(set)}`);
  await page.waitForTimeout(500);
  await snap('1_split_question');
  const split = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; d.invUi.pending = null; const why = g.splitPiece({ kind: 'bag', i: 0 }); d.invUi.sel = { kind: 'bag', i: 0 }; return { why, rings: h.bag.filter((b) => b).map((b) => `${b.name} ${b.affixes.length + b.imbues.length}`) }; });
  say(`split: ${JSON.stringify(split)}`);
  if (split.why || split.rings.length !== 3) bad('the split did not make a second ring');
  await page.waitForTimeout(500);
  await snap('2_split_done');
  await page.evaluate(() => { const d = window.__dbg; d.invUi.sel = null; d.invUi.pending = { word: 'binding', sel: { kind: 'bag', i: 0 } }; });
  await page.waitForTimeout(400);
  await snap('3_bind_asks');
  await page.evaluate(() => { const d = window.__dbg; d.invUi.pending.with = { kind: 'bag', i: 1 }; });
  await page.waitForTimeout(400);
  await snap('4_bind_question');
  const bound = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; d.invUi.pending = null; const why = g.bindPieces({ kind: 'bag', i: 0 }, { kind: 'bag', i: 1 }); d.invUi.sel = { kind: 'bag', i: 0 }; return { why, rings: h.bag.filter((b) => b).length, props: h.bag[0].affixes.length + h.bag[0].imbues.length }; });
  say(`bound: ${JSON.stringify(bound)}`);
  if (bound.why || bound.props !== 4) bad('the binding did not make a ring of four');
  await page.waitForTimeout(500);
  await snap('5_bound_read');
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
