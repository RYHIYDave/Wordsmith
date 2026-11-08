// QUEST MARKERS (game/quest_marks.ts, QUEST_MARKS; his 7 Nov 2026, 23:41): pictures for him, the switch on. Not a test.
//   1. a new game in town: the marker over the wordsmith;
//   2. the master rune-stone carried into floor 2, the Headsman's Yard: "Speak to the WORDSMITH" and the marker over its waypoint;
//   3. back in town, the stone handed in (his ring lit): the marker over the armourer, "Speak to the ARMOURER".
//   node tools/build_to.mjs dist/qm.html
//   node tools/playtest.mjs --file dist/qm.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/quest_marks_look.mjs --out shots/qm/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.questMarks.on = true; d.run('warrior', 7); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(2500);
  log('1 givers', await page.evaluate(() => window.__dbg.game().questGivers()));
  await snap('1_town_wordsmith');
  // 2. the stone carried into floor 2
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.questGiven = true;
    g.hero.quest = 'heart';
    g.depth = 2; g.cleared = 1; g.enterDungeon('gate');
    g.level.explored.fill(1);
    const w = g.level.ways && g.level.ways.way;
    if (w) { g.hero.x = w.x + 1; g.hero.y = w.y + 1.2; }
  });
  // (the floor's name first; then the line)
  await page.waitForTimeout(8500);
  log('2 speak, turn in', await page.evaluate(() => { const g = window.__dbg.game(); return [g.speakTo, g.turnInFor(), g.level.floor.depth, !!(g.level.ways && g.level.ways.way)]; }));
  await snap('2_yard_waypoint');
  // 3. back in town, the stone handed in: his ring lit
  await page.evaluate(() => { const g = window.__dbg.game(); g.enterTown('way'); });
  await page.waitForTimeout(5500);
  await snap('3a_town_back');
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.hero.quest = null;
    g.hero.ring = true;
    const st = g.level.stations.find((s) => s.kind === 'armourer');
    if (st) { g.hero.x = st.x - 0.5; g.hero.y = st.y + 1.6; }
  });
  await page.waitForTimeout(1500);
  log('3 givers, speak', await page.evaluate(() => { const g = window.__dbg.game(); return [g.questGivers(), g.speakTo]; }));
  await snap('3b_town_armourer');
}
