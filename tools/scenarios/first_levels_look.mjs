// THE FIRST LEVELS (Version 19.5, a mock-up behind game/defs.ts FIRST_LEVELS, off): the screens of a
// new player's first steps with it on, photographed for the owner (pictures first). Not part of
// tools/regress.sh.
//   node tools/build_to.mjs dist/fl.html
//   node tools/playtest.mjs --file dist/fl.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/first_levels_look.mjs --out shots/fl/ph
//   CLS=warrior|ranger|mage (ranger); SEED (21)
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const seed = Number(process.env.SEED || 21);
  const hands = await makeHands(page);
  await page.evaluate(([cls, seed]) => {
    const d = window.__dbg;
    d.saving(false);
    d.firstLevels(true);
    d.first(cls, seed);
    d.god = true;
    d.autoLevel = false;
  }, [cls, seed]);
  await page.waitForTimeout(1500);
  await snap('01_start');
  // the first monsters, awake and near: the fight prompt, with only the tap attack
  await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    const near = g.monsters.filter((m) => !m.dead && !m.boss).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y)).slice(0, 2);
    near.forEach((m, i) => { m.x = h.x + 3.2; m.y = h.y + (i ? 1 : -1) * 0.8; m.state = 'chase'; m.seen = true; m.cd = 9; });
    if (g.guide) g.guide.met = true;
  });
  await page.waitForTimeout(700);
  await snap('02_fight_tap_only');
  // level 2: the slow attack opens
  await page.evaluate(() => { const g = window.__dbg.game(); while (g.hero.level < 2) g.gainXp(50); });
  await page.waitForTimeout(450);
  await snap('03_new_move_level2');
  await page.waitForTimeout(3400);
  await snap('04_fight_level2');
  // the fallen wordsmith: his satchel holds the quest item
  await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    const b = g.level.body; if (b) { h.x = b.x; h.y = b.y + 0.7; }
  });
  await page.waitForTimeout(900);
  await snap('05_satchel_quest_item');
  await page.waitForTimeout(2500);
  await snap('06_carry_prompt');
  // the inventory before the ring is lit: every slot dark
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(400);
  await hands.press('tab:attacks');
  await page.waitForTimeout(300);
  await snap('07_inventory_before_ring');
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  await page.waitForTimeout(200);
  // town: bring it to the wordsmith
  await page.evaluate(() => { window.__dbg.game().enterTown(); });
  await page.waitForTimeout(1200);
  await snap('08_town_ring_prompt');
  await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    const st = g.level.stations.find((s) => s.kind === 'wordsmith');
    if (st) { h.x = st.x + 0.6; h.y = st.y + 0.6; }
  });
  await page.waitForTimeout(500);
  await snap('09_ring_lit_first_word');
  await page.waitForTimeout(3600);
  await snap('10_inventory_first_word');
  // the first word set before the quick attack
  const w = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return Object.keys(h.words).find((k) => h.words[k] > 0) || null; });
  if (w) {
    await page.evaluate((w) => { const g = window.__dbg.game(); g.placeWord({ skill: 0, side: 'front', idx: 0 }, w); }, w);
    await page.waitForTimeout(400);
    await hands.press('tab:attacks');
    await page.waitForTimeout(300);
    await snap('11_inventory_first_word_set');
  }
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  await page.waitForTimeout(300);
  // level 5: the swipe opens, and the second slot in front
  await page.evaluate(() => { const g = window.__dbg.game(); while (g.hero.level < 5) g.gainXp(80); });
  await page.waitForTimeout(450);
  await snap('12_new_move_level5');
  await page.waitForTimeout(3600);
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(400);
  await hands.press('tab:attacks');
  await page.waitForTimeout(300);
  await snap('13_inventory_level5');
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  // (and what the first dungeon held, for the note beside the pictures)
  const held = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    return { level: g.hero.level, ring: g.hero.ring, slots: g.slots(), offer: g.offer };
  });
  snap.note('state', held);
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
