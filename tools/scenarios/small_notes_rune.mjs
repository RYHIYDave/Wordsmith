// THE QUEST MARKER A RUNE THAT FLASHES, AND “SPEAK TO THE ...” AS A NEW GAME BEGINS (art/small_notes.ts questRune; game/quest_marks.ts
// SPEAK_NEW; his 11 Nov 2026): a new game in town with both on. A picture every thirtieth of a second of the game's own time: first
// the line as the game begins (LINE seconds: frames a###), then, the line gone, the rune over the wordsmith flashing (RUNE seconds:
// frames b###); then one in the Headsman's Yard, the stone carried, over its waypoint (yard).
//   node tools/playtest.mjs --file dist/notes.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/small_notes_rune.mjs --out shots/rune/f
//   env: LINE (2), RUNE (4), OFF=1 (the switches left off: the marker and the line as they are live)
const FPS = 30;
export default async function (page, snap) {
  const off = process.env.OFF === '1';
  await page.evaluate((off) => {
    const d = window.__dbg; d.saving(false); d.questMarks.on = true;
    if (!off) { d.smallNotes.questRune = true; d.speakNew.on = true; }
    d.run('warrior', 7); d.autoLevel = false; d.autoWords = false;
  }, off);
  await page.waitForTimeout(2500);
  console.log('givers', JSON.stringify(await page.evaluate(() => window.__dbg.game().questGivers())), 'speak', JSON.stringify(await page.evaluate(() => window.__dbg.game().speakTo)));
  const film = async (tag, secs) => {
    const total = Math.round(secs * FPS);
    const c0 = await page.evaluate(() => window.__dbg.clock());
    for (let i = 0; i < total; i++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      await snap(`${tag}${String(i).padStart(3, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  };
  await film('a', Number(process.env.LINE ?? 2));
  // (the line seen its time and gone)
  await page.waitForFunction(() => !window.__dbg.game().speakTo, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  await film('b', Number(process.env.RUNE ?? 4));
  // (the stone carried into floor 2: the marker over its waypoint)
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.questGiven = true; g.hero.quest = 'heart'; g.depth = 2; g.cleared = 1; g.enterDungeon('gate'); g.level.explored.fill(1);
    const w = g.level.ways && g.level.ways.way; if (w) { g.hero.x = w.x + 1; g.hero.y = w.y + 1.2; }
  });
  await page.waitForTimeout(8500);
  await snap('yard');
}
