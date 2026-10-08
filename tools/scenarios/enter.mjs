// PICKING A HERO: the entrance, held to its rules in the game itself.
//   With the heroes painted over the bones (the game's own from Version 16):
//     - a card pressed does NOT begin the run at once: the hero makes ready on the card first;
//     - Escape calls it off, and the cards are as they were;
//     - a second press anywhere lets them go at once;
//     - left alone, the run begins when they have made ready and gone, in the first dungeon,
//       and the hero says a line of their own.
//   With the first heroes (a page opened with #heroes=old), whose art has no picture of making
//   ready: a card pressed begins the run at once, as it did up to Version 15.
//   node tools/playtest.mjs --scenario tools/scenarios/enter.mjs --out shots/enter/new
//   node tools/playtest.mjs --hash "heroes=old" --scenario tools/scenarios/enter.mjs --out shots/enter/old
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  // (the heroes painted over the bones are the game's own from Version 16; the first heroes are shown to a page opened with #heroes=old)
  const fresh = await page.evaluate(() => new URLSearchParams(location.hash.slice(1)).get('heroes') !== 'old');
  const hands = await makeHands(page);
  let wrong = 0;
  const hold = (ok, what) => { console.log(`  ${ok ? 'ok ' : '!! '} ${what}`); if (!ok) wrong++; };
  const inGame = () => page.evaluate(() => { const g = window.__dbg.game(); return g ? { cls: g.hero.cls, town: !!g.level.town, depth: g.depth } : null; });
  const said = () => page.evaluate(() => { const q = window.__dbg.fx.quip; return q ? q.text : null; });
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  if (!fresh) {
    await hands.press('class:ranger');
    await page.waitForTimeout(150);
    const g = await inGame();
    hold(g !== null && g.cls === 'ranger', `the first heroes: a card pressed begins the run at once (${JSON.stringify(g)})`);
    await page.waitForTimeout(1500);
    hold((await said()) === null, 'and nothing is said on arriving');
    await snap('old_begun');
  } else {
    // 1. a press begins the entrance, not the run; Escape calls it off
    // (`stay`: these presses are not to wait for the entrance to be over, which every other playtest's are)
    await hands.press('class:ranger', 0, true);
    await page.waitForTimeout(250);
    hold((await inGame()) === null, 'a card pressed: the run has not begun, the hero is making ready');
    await snap('making_ready');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2600);
    hold((await inGame()) === null, 'Escape: called off (two and a half seconds later the run has still not begun)');
    hold((await hands.mark('class:ranger')) !== null, 'and the cards are still there');
    // 2. a second press lets them go at once
    await hands.press('class:mage', 0, true);
    await page.waitForTimeout(250);
    hold((await inGame()) === null, 'another card pressed: making ready again');
    await hands.pressAt(20, 20);
    await page.waitForTimeout(120);
    let g = await inGame();
    hold(g !== null && g.cls === 'mage' && !g.town && g.depth === 1, `a press anywhere: the run begins at once, in the first dungeon (${JSON.stringify(g)})`);
    await page.waitForTimeout(1100);
    const line = await said();
    hold(typeof line === 'string' && line.length > 8, `and she says a line of her own ("${line}")`);
    await snap('skipped_in');
    // 3. left alone: it runs its course
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await hands.press('button:End run');
    await page.waitForTimeout(400);
    hold((await inGame()) === null, 'back on the start screen');
    await hands.press('button:NEW GAME');
    await page.waitForTimeout(500);
    await hands.press('class:warrior', 0, true);
    const t0 = Date.now();
    let began = -1;
    while (Date.now() - t0 < 4000) {
      if ((await inGame()) !== null) { began = Date.now() - t0; break; }
      await page.waitForTimeout(40);
    }
    g = await inGame();
    hold(began > 1200 && began < 2600 && g !== null && g.cls === 'warrior', `left alone, the knight makes ready and goes: the run began after ${began} ms (${JSON.stringify(g)})`);
    await page.waitForTimeout(1200);
    hold(typeof (await said()) === 'string', `and he says his line ("${await said()}")`);
    await snap('arrived');
  }
  log(await page.evaluate(() => { const g = window.__dbg.game(); return g ? `${g.hero.cls} in ${g.level.town ? 'town' : 'dungeon ' + g.depth}` : 'title'; }), {});
  if (wrong) throw new Error(`${wrong} thing(s) wrong with the entrance`);
}
