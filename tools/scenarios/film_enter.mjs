// PICKING A HERO, filmed in the game: the class cards, a card pressed, the hero making ready
// there and warping away, the run beginning with them warping in, and the line they say. A
// picture every thirtieth of a second of the screen's time (the page is slowed so that the
// camera can keep up). Frames go to <out>_f000.png ...
//   CLS=warrior|ranger|mage    SECONDS=5.5 (how long to film after the card is pressed)
//   node tools/playtest.mjs --file dist/play_new.html --hash "heroes=new" --scenario tools/scenarios/film_enter.mjs --out shots/film/enter_w
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(900);
  const slow = 0.1;
  const FPS = 30;
  const step = 1000 / FPS / slow;
  const seconds = Number(process.env.SECONDS || 5.5);
  const before = 8;
  const total = before + Math.ceil(seconds * FPS);
  await page.evaluate((s) => { window.__dbg.slowmo = s; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (i === before) await hands.press(`class:${cls}`);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  const said = await page.evaluate(() => { const g = window.__dbg.game(); return g ? `in the game: town=${!!g.level.town} depth=${g.depth} hero=${g.hero.cls}` : 'still on the title'; });
  console.log('late by', Date.now() - (t0 + (total - 1) * step), 'ms at the end;', said);
}
