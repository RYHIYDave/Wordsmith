// NAMES BY ORDER (game/words.ts NAME_ORDER) and THE RISING NAME IN ITS COLOURS (render/fx.ts NAME_RAINBOW), both
// off in the game: pictures for the owner, with them switched on by the test hook (__dbg.names). His words, 18 Oct
// 2026, 09:41: "When the name of the ability comes up, it seems like the color of the whole name changes.  I like
// it when all the words are their respective rune color and the word is all rainbowed out"; 09:45: "Flaming
// Precise Strike and Precision Flame Strike are the same, but the wording changes based on where words are put in
// the chain." Nothing here is in the game until he has seen it and said yes.
//   A word joins the warrior's Strike, as when one is set outside the inventory, and its new name rises:
//   1. as now (both off); 2. in its colours; 3. and 4. in its colours, named by order, Flame first and Precise first;
//   5. a long one, with two words behind.
//   node tools/build_to.mjs dist/names.html
//   node tools/playtest.mjs --file dist/names.html --size 844x390 --dpr 3 --touch --scenario tools/scenarios/name_look.mjs --out shots/names/n
export default async function (page, snap) {
  const check = (what, cond, more = '') => { console.log(`  ${cond ? 'ok' : '!!'} ${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 3; g.cleared = 2; g.enterDungeon(); g.monsters = []; });
  await page.waitForTimeout(Number(process.env.SETTLE ?? 4500));
  const cases = [
    { tag: '1_now', order: false, rainbow: false, front: ['fire', 'precise'], behind: [null, null], word: 'fire' },
    { tag: '2_colours', order: false, rainbow: true, front: ['fire', 'precise'], behind: [null, null], word: 'fire' },
    { tag: '3_flame_first', order: true, rainbow: true, front: ['fire', 'precise'], behind: [null, null], word: 'fire' },
    { tag: '4_precise_first', order: true, rainbow: true, front: ['precise', 'fire'], behind: [null, null], word: 'precise' },
    { tag: '5_long', order: true, rainbow: true, front: ['twin', 'fire'], behind: ['swift', 'volatile'], word: 'volatile' },
  ];
  for (const c of cases) {
    const name = await page.evaluate((c) => {
      const d = window.__dbg; const g = d.game(); const s = g.hero.skills[0];
      s.front = [...c.front]; s.behind = [...c.behind];
      d.names(c.order, c.rainbow);
      d.joined(0, c.word);
      return s.r.name;
    }, c);
    check(`${c.tag}: the Strike is named`, true, name);
    await page.waitForTimeout(Number(process.env.AT ?? 380));
    await snap(c.tag);
    await page.waitForTimeout(1200);
  }
}
