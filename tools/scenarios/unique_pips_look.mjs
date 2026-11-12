// A UNIQUE'S PIPS (ui/panels.ts UNIQUE_PIPS, drawItemPips): the practice room's Warrior with six uniques in his bag, chosen to
// show every count a unique can have (none to two ordinary stats, one or two special modifiers, a price or none), and two of his
// own magic pieces beside them for scale. One shot of the bag for each way of counting and colouring them, and the card of one.
// For his pictures, and to check that every unique shows the pips it should.
//   node tools/build_to.mjs dist/unique_pips.html
//   node tools/playtest.mjs --file dist/unique_pips.html --size 960x540 --scenario tools/scenarios/unique_pips_look.mjs --out shots/unique_pips/a
// UNIQUE_PIPS_WAYS=all/split,stats/split,... (count/colour) picks the ways shot; the default shoots the three counts split and 'all' orange.
const IDS = ['twofacedmask', 'brokenshackles', 'drownedarm', 'censorsseal', 'bloodprice', 'wardenskeys'];
// what each should show, by count: [stats, powers, price]
const WANT = { twofacedmask: [0, 1, 0], brokenshackles: [1, 1, 1], drownedarm: [2, 1, 0], censorsseal: [2, 1, 1], bloodprice: [2, 1, 1], wardenskeys: [2, 2, 0] };

export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const set = await page.evaluate((ids) => {
    const d = window.__dbg;
    d.uniques.on = true;
    if (d.uniqueArt) d.uniqueArt.on = true;
    d.saving(false);
    d.loading.on = false;
    d.practice('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    for (const id of ids) g.giveUnique(id, 12);
    // two of his own magic pieces beside them, for scale (a copy each: his stay on him)
    for (const slot of ['helm', 'gloves']) {
      const it = h.gear[slot];
      const free = h.bag.indexOf(null);
      if (it && free >= 0) h.bag[free] = { ...JSON.parse(JSON.stringify(it)), uid: it.uid + 900000 };
    }
    for (const it of h.bag) if (it) it.reqLevel = 1;
    d.inv();
    d.invUi.page = 'gear';
    d.invUi.sel = null;
    return h.bag.filter(Boolean).map((it) => ({ name: it.name, rarity: it.rarity, unique: it.unique ?? null, affixes: it.affixes.length }));
  }, IDS);
  say(`bag: ${JSON.stringify(set)}`);
  for (const it of set) {
    if (!it.unique) continue;
    const want = WANT[it.unique];
    if (want && it.affixes !== want[0]) bad(`${it.name}: ${it.affixes} ordinary stats, wanted ${want[0]}`);
  }
  const ways = (process.env.UNIQUE_PIPS_WAYS || 'all/split,stats/split,lines/split,all/orange').split(',').map((w) => w.split('/'));
  for (const [count, colour] of ways) {
    const pips = await page.evaluate(([count, colour]) => {
      const d = window.__dbg;
      d.uniquePips.count = count;
      d.uniquePips.colour = colour;
      return true;
    }, [count, colour]);
    if (!pips) bad('no uniquePips on __dbg');
    await page.waitForTimeout(350);
    await snap(`bag_${count}_${colour}`);
  }
  // the card of one, with the pips as his pick will have them (the first way asked)
  await page.evaluate(([count, colour]) => {
    const d = window.__dbg;
    d.uniquePips.count = count;
    d.uniquePips.colour = colour;
    d.invUi.sel = { kind: 'bag', i: 3 };
  }, ways[0]);
  await page.waitForTimeout(350);
  await snap(`card_${ways[0].join('_')}`);
  say('done');
}
