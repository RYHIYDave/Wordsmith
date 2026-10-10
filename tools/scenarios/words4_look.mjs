// THE WORDS STILL TO COME, THE FIRST OF THEM (game/defs.ts WORDS4: off in the game; switched on for this
// page only): the screens Mystical, Power for attacks only and Volatile's hidden bomb appear on,
// photographed for the owner (pictures first). A mage who has found the fourteen words and holds one
// of each. Not part of tools/regress.sh.
//   node tools/build_to.mjs dist/w4.html
//   node tools/playtest.mjs --file dist/w4.html --scenario tools/scenarios/words4_look.mjs --out shots/w4look/pc
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const was = await page.evaluate(() => window.__dbg.words4());
  await page.evaluate(() => { window.__dbg.saving(false); window.__dbg.words4(true); });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const d = window.__dbg; d.run('mage', 11); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); const h = g.hero;
    while (h.level < 10) g.gainXp(200);
    while (h.pending > 0) g.chooseAttr('int');
    // (the ring lit and every slot open, as for a hero well into the game)
    d.seasoned(10);
    const words = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison', 'heavy', 'precise', 'frenzied', 'guarding', 'mystical'];
    for (const w of words) { h.words[w] = 1; g.meta.known[w].found = true; }
    h.gold = 900;
    g.refresh();
  });
  await page.waitForTimeout(700);
  await page.evaluate(() => window.__dbg.inv());
  await page.waitForTimeout(400);
  await hands.press('tab:attacks');
  await page.waitForTimeout(300);
  await snap('01_inv_attacks_mystical_among_them');
  // Power in hand, over the Wave's front slot: it says it does nothing there
  const hover = async (name) => {
    const s = await hands.mark(name);
    if (!s) return false;
    const c = await page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [s.x, s.y]);
    await page.mouse.move(c.x, c.y);
    await page.waitForTimeout(300);
    return true;
  };
  await hands.press('word:power');
  await page.waitForTimeout(250);
  console.log('hovered', await hover('socket:0:front:0'));
  await snap('02_power_over_the_wave');
  await hands.press('word:power');
  await page.waitForTimeout(200);
  // Mystical in hand over the same slot: what it does there
  await hands.press('word:mystical');
  await page.waitForTimeout(250);
  await hover('socket:0:front:0');
  await snap('03_mystical_over_the_wave');
  await hands.press('word:mystical');
  await page.waitForTimeout(200);
  // Mystical set in front of and behind the Wave: the attack's lines
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; h.words.mystical = 2; g.socket(0, 'front', 'mystical'); g.socket(0, 'behind', 'mystical'); });
  await page.waitForTimeout(300);
  await page.mouse.move(5, 5);
  await snap('04_mystical_wave_of_mysteries');
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  await page.waitForTimeout(200);
  // the Lexicon: Mystical, Power and Volatile as they read now
  await page.evaluate(() => window.__dbg.open('lexicon'));
  await page.waitForTimeout(300);
  for (const w of ['mystical', 'power', 'volatile']) {
    await hands.press(`lex:${w}`);
    await page.waitForTimeout(200);
    await snap(`05_lexicon_${w}`);
  }
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  await page.evaluate((was) => window.__dbg.words4(was), was);
}
