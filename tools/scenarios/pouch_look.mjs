// THE WORDS IN THE INVENTORY: a hero holding many words (N different ones, two of each), the inventory open on GEAR, then on
// ATTACKS; with ROOM=1 the bottom that shows every word (ui/inventory.ts WORD_ROOM, off; turned on here), and its ALL tile
// pressed on GEAR. For the owner's pictures (his 23 Oct 2026, 11:06: the words' strip has run out of room). Not his yes.
//   node tools/playtest.mjs --file dist/words.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/pouch_look.mjs --out shots/pouch/phone
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const n = Number(process.env.N) || 999;
  const room = !!process.env.ROOM;
  const half = !!process.env.HALF;
  const hands = await makeHands(page);
  const info = await page.evaluate(([n, room, half]) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 5); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.wordRoom.on = room;
    d.wordHalf.on = half;
    const g = d.game(); const h = g.hero;
    const ids = Object.keys(h.words);
    let k = 0;
    for (const w of ids) h.words[w] = k++ < n ? 2 : 0;
    // (a few pieces in the bag, so that it is plain which is which)
    return { ids: ids.length, held: Math.min(n, ids.length), bag: h.bag.filter(Boolean).length };
  }, [n, room, half]);
  log('words', JSON.stringify(info));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(800);
  await snap('a_gear');
  if (room) {
    log('pressed', await hands.press('button:ALL WORDS'));
    await page.waitForTimeout(400);
    await snap('b_gear_all');
    log('pressed', await hands.press('button:BAG'));
    await page.waitForTimeout(400);
    await snap('c_gear_bag');
  }
  await page.evaluate(() => window.__dbg.inv(0));
  await page.waitForTimeout(800);
  await snap('d_attacks');
  const marks = await page.evaluate(() => [...window.__dbg.ui.marks.keys()].filter((k) => k.startsWith('word:')).length);
  log('words on screen', marks);
  if (half) {
    // (a word pressed in the panel: in hand, read)
    const first = await page.evaluate(() => [...window.__dbg.ui.marks.keys()].find((k) => k.startsWith('word:')));
    log('pressed', await hands.press(first));
    await page.waitForTimeout(400);
    await snap('e_attacks_word');
  }
}
