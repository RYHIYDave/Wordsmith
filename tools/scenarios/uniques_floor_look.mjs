// A UNIQUE LYING ON THE FLOOR AS LOOT (render/render.ts: the same call as the bag, itemPic with the piece's `unique`), which
// the art chat's note left as not looked at (docs/mockups/uniques_art/README.md, “Not done”, 4). The practice room's Warrior,
// UNIQUES on for this page only, a ring of uniques laid on the floor round him with a few of the game's own pieces among them:
// a picture with UNIQUE_ART on (each its own picture), the same floor with it off (each its base's orange look, as the build
// shows them), then he steps onto one and it is taken, still the same unique. For a look; nothing here is in the game's play.
//   node tools/build_to.mjs dist/uniques_in.html
//   node tools/playtest.mjs --file dist/uniques_in.html --size 852x393 --dpr 3 --touch \
//     --scenario tools/scenarios/uniques_floor_look.mjs --out shots/uniques_in/floor_phone
// UNIQUE_IDS: which to lay down (a spread of kinds, if not given).
export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const ids = (process.env.UNIQUE_IDS || 'clockworksongbird,dancingshoes,queensglass,hollowcrown,nettleshirt,halfcarvedhand,wardenskeys,windcutter,restlesstome,fourthglobe').split(',').filter(Boolean);
  const set = await page.evaluate((ids) => {
    const d = window.__dbg;
    d.uniques.on = true;
    d.uniqueArt.on = true;
    d.saving(false);
    d.loading.on = false;
    d.practice('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    g.drops.length = 0;
    // (the game's own pieces he starts with, to lie among them)
    const own = h.bag.filter(Boolean).slice(0, 3);
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    const laid = [];
    const lay = (it, k, n, r) => {
      const a = (k / n) * Math.PI * 2;
      const x = h.x + Math.cos(a) * r; const y = h.y + Math.sin(a) * r;
      g.drops.push({ x, y, kind: 'item', gold: 0, item: it, word: null, age: 1 });
      return { x, y };
    };
    ids.forEach((id, k) => {
      if (!g.giveUnique(id, 12)) return;
      const i = h.bag.findIndex((it) => it && it.unique === id);
      const it = h.bag[i]; h.bag[i] = null;
      laid.push({ id, name: it.name, ...lay(it, k, ids.length, 2.6) });
    });
    own.forEach((it, k) => lay(it, k + 0.5, own.length, 1.5));
    d.panels.open = 'none';
    return { laid, own: own.map((it) => it.name), drops: g.drops.length, hero: { x: h.x, y: h.y } };
  }, ids);
  say(`laid: ${set.laid.map((l) => l.id).join(', ')}; the game's own: ${set.own.join(', ')}; ${set.drops} on the floor`);
  if (set.laid.length !== ids.length) bad(`only ${set.laid.length} of ${ids.length} were made`);
  await page.waitForTimeout(700);
  const still = await page.evaluate(() => window.__dbg.game().drops.length);
  if (still !== set.drops) bad(`${set.drops - still} were taken or lost before he moved`);
  await snap('1_floor_own_pictures');
  await page.evaluate(() => { window.__dbg.uniqueArt.on = false; });
  await page.waitForTimeout(400);
  await snap('2_floor_as_the_build_shows_them');
  await page.evaluate(() => { window.__dbg.uniqueArt.on = true; });
  // he steps onto the first: it is taken (worn if the place is empty and he may, else into the bag), and is still that unique
  const took = await page.evaluate((first) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    h.x = first.x; h.y = first.y;
    return { id: first.id };
  }, set.laid[0]);
  await page.waitForTimeout(900);
  const after = await page.evaluate((id) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const has = (it) => !!it && it.unique === id;
    return { onFloor: g.drops.some((dr) => has(dr.item)), inBag: h.bag.some(has), worn: Object.values(h.gear).some(has), drops: g.drops.length };
  }, took.id);
  say(`stepped onto ${took.id}: ${JSON.stringify(after)}`);
  if (after.onFloor || !(after.inBag || after.worn)) bad(`${took.id} was not taken from the floor as itself`);
  await page.evaluate(() => { const d = window.__dbg; d.inv(); d.invUi.page = 'gear'; d.invUi.sel = null; });
  await page.waitForTimeout(500);
  await snap('3_taken_and_in_his_gear');
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
