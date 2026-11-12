// THE PACK COLLAR'S COMPANION PICKED ON THE COLLAR (game/companions.ts collarChoices; ui/inventory.ts, the row on its card; UNIQUES
// switched on for this page only): a Ranger at level 35 in town with the Hunting Companion taken, the collar worn; its card read
// on the GEAR page: her hawk and the collar's snake at her side, the row of the two it may bring (never her hawk); the wolf
// picked on the card; the collar in the bag; both talents, four to pick; out of town, a tap says “Choose companion in town”. His picks, 12
// Nov 2026: “Pick it on the collar”; “No, one of the other two (Recommended)”. For a look, and for his pictures.
//   node tools/build_to.mjs dist/collar.html
//   node tools/playtest.mjs --file dist/collar.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/pack_collar_pick.mjs --out shots/collar/a
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  let fails = 0;
  const check = (label, ok) => { if (!ok) { fails++; console.log(`  !! ${label}`); } else console.log(`  ok ${label}`); };
  // (the world stands still while the inventory is open: shut it a moment to see who is at her side, then open it on the collar again)
  const pets = async (shot = null) => {
    await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
    await page.waitForTimeout(900);
    if (shot) await snap(shot);
    const k = await page.evaluate(() => window.__dbg.game().pets.map((p) => p.kind).sort().join());
    await page.evaluate(() => {
      const d = window.__dbg; const h = d.game().hero;
      const i = h.bag.findIndex((it) => it && it.unique === 'packcollar');
      d.inv(); d.invUi.page = 'gear'; d.invUi.sel = i >= 0 ? { kind: 'bag', i } : { kind: 'gear', slot: 'amulet' };
    });
    await page.waitForTimeout(600);
    return k;
  };
  const set = await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.uniques.on = true;
    d.talents.on = true;
    d.run('ranger', 21);
    d.seasoned(35);
    const g = d.game(); const h = g.hero;
    d.autoLevel = false; d.autoWords = false;
    h.pending = 0;
    h.talents = ['keeneye', 'venom', 'huntcompanion'];
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    g.giveUnique('packcollar', 35);
    const i = h.bag.findIndex((it) => it && it.unique === 'packcollar');
    h.bag[i].reqLevel = 1;
    const why = g.equipFromBag(i);
    g.refresh();
    d.inv();
    d.invUi.page = 'gear';
    d.invUi.sel = { kind: 'gear', slot: 'amulet' };
    return { town: g.level.town, why, worn: g.worn };
  });
  console.log(`  set: ${JSON.stringify(set)}`);
  check('in town', set.town);
  await page.waitForTimeout(700);
  check('her hawk and the collar\'s snake', (await pets()) === 'hawk,snake');
  check('the row offers the snake and the wolf, not her hawk', (await hands.mark('collar:snake')) && (await hands.mark('collar:wolf')) && !(await hands.mark('collar:hawk')));
  await snap('1_collar_worn_snake');
  await hands.press('collar:wolf');
  await page.waitForTimeout(600);
  check('the wolf picked: at her side', (await pets('2b_town_hawk_and_wolf')) === 'hawk,wolf' && (await page.evaluate(() => window.__dbg.game().hero.pets.collar)) === 'wolf');
  await snap('2_collar_wolf_picked');
  // (in the bag, not worn: the same row; the pick kept for when it is worn)
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    g.unequip('amulet');
    const h = g.hero;
    d.invUi.sel = { kind: 'bag', i: h.bag.findIndex((it) => it && it.unique === 'packcollar') };
  });
  await page.waitForTimeout(500);
  check('in the bag: no collar\'s companion out', (await pets()) === 'hawk');
  await snap('3_collar_in_bag');
  // (both her companion talents taken: of either list, the other two of each; four on the row)
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    g.hero.talents = ['keeneye', 'venom', 'huntcompanion', 'fleet', 'windrunner', 'wildcompanion'];
    g.hero.pets = { hunt: 'hawk', wild: 'bat' };
    g.refresh();
  });
  await page.waitForTimeout(500);
  const four = await page.evaluate(() => [...window.__dbg.ui.marks.keys()].filter((k) => k.startsWith('collar:')).join());
  check(`both lists: the other two of each (${four})`, four === 'collar:snake,collar:wolf,collar:fox,collar:tortoise');
  await snap('3b_both_lists');
  // (out of town: no row, and the card says so)
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    g.equipFromBag(h.bag.findIndex((it) => it && it.unique === 'packcollar'));
    d.panels.open = 'none';
    g.depth = 1;
    g.enterDungeon();
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const d = window.__dbg; d.inv(); d.invUi.page = 'gear'; d.invUi.sel = { kind: 'gear', slot: 'amulet' }; });
  await page.waitForTimeout(700);
  check('out of town: in a dungeon', !(await page.evaluate(() => window.__dbg.game().level.town)));
  check('out of town: the same row', (await hands.mark('collar:snake')) && !(await hands.mark('collar:hawk')));
  await snap('4_out_of_town');
  // (a tap there: nothing picked, and a message says to choose in town. His words, 12 Nov 2026, 12:41)
  const before = await page.evaluate(() => window.__dbg.game().hero.pets.collar ?? null);
  await hands.press('collar:snake');
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => { const d = window.__dbg; return { note: d.invUi.note, pick: d.game().hero.pets.collar ?? null }; });
  check(`out of town, a tap: "${after.note}", nothing picked (${after.pick})`, after.note === 'Choose companion in town' && after.pick === before);
  await snap('5_out_of_town_tapped');
  if (fails) throw new Error(`${fails} thing(s) wrong with the Pack Collar's picker`);
}
