// THE UNIQUE ITEMS' OWN PICTURES (art/items_unique.ts UNIQUE_ART, switched on for this page only, with UNIQUES): the practice
// room's hero with uniques in his bag, the bag open, so each picture is seen at the game's own size beside the game's own item
// pictures (what he wears and what else is in the bag). For a look, and for his pictures.
//   node tools/build_to.mjs dist/uniques_art.html
//   UNIQUE_IDS=longecho,brokenshackles node tools/playtest.mjs --file dist/uniques_art.html --size 852x393 --dpr 3 --touch \
//     --scenario tools/scenarios/uniques_art_look.mjs --out shots/uniques_art/phone
// UNIQUE_IDS: which to put in the bag (all that are drawn, if not given). UNIQUE_ART=off: the same bag as the build shows it today.
export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const ids = (process.env.UNIQUE_IDS || '').split(',').filter(Boolean);
  const artOn = process.env.UNIQUE_ART !== 'off';
  const set = await page.evaluate(({ ids, artOn }) => {
    const d = window.__dbg;
    d.uniques.on = true;
    d.uniqueArt.on = artOn;
    d.saving(false);
    d.loading.on = false;
    d.practice('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    const kept = h.bag.filter(Boolean).slice(0, 3);
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    const given = [];
    for (const id of ids) if (g.giveUnique(id, 12)) given.push(id);
    // (a few of the game's own pieces after them, to see the two side by side)
    for (const it of kept) { const free = h.bag.indexOf(null); if (free >= 0) h.bag[free] = it; }
    for (const it of h.bag) if (it) it.reqLevel = 1;
    d.inv();
    d.invUi.page = 'gear';
    d.invUi.sel = null;
    return { given, bag: h.bag.filter(Boolean).map((it) => it.name) };
  }, { ids, artOn });
  say(`set: ${JSON.stringify(set)}`);
  if (ids.length && set.given.length !== ids.length) bad(`only ${set.given.length} of ${ids.length} went into the bag`);
  await page.waitForTimeout(600);
  await snap('1_bag');
  await page.evaluate(() => { const d = window.__dbg; d.invUi.sel = { kind: 'bag', i: 0 }; });
  await page.waitForTimeout(300);
  await snap('2_card_first');
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
