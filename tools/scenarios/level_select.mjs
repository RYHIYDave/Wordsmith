// THE LEVEL SELECT (game/defs.ts LEVEL_SELECT, off until his yes): the start screen's Options, its button, the page of floors,
// a floor pressed, a class picked, as he would; the test hero on the floor; and the saved run left as it was.
//   node tools/playtest.mjs --file dist/lvl.html --scenario tools/scenarios/level_select.mjs --out shots/lvl/x
// FLOOR: which floor (8). CLS: which class (warrior). UPRIGHT: turn the game upright first (a phone held upright). OFF: the
// switch left off (the options and the menu only, as the game has them).
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const want = Number(process.env.FLOOR || 8);
  const cls = process.env.CLS || 'warrior';
  const hands = await makeHands(page);
  // (OFF=1: the switch left off, the options photographed as the game has them, for the before and after)
  if (!process.env.OFF) await page.evaluate(() => { window.__dbg.levelSelect.on = true; });
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => localStorage.getItem('arpg-save-v2') ?? localStorage.getItem(Object.keys(localStorage).find((k) => k.includes('save')) ?? ''));
  await hands.press('button:OPTIONS');
  await page.waitForTimeout(300);
  // (UPRIGHT=1: the game turned upright first, as the options' own switch does, where it is offered)
  if (process.env.UPRIGHT) {
    await hands.press('button:PLAY UPRIGHT');
    await page.waitForTimeout(600);
  }
  await snap('options');
  if (process.env.OFF) {
    await hands.press('button:BACK');
    await page.waitForTimeout(300);
    await snap('menu');
    return;
  }
  await hands.press('button:BACK');
  await page.waitForTimeout(300);
  await snap('menu');
  await hands.press('button:OPTIONS');
  await page.waitForTimeout(300);
  await hands.press('button:LEVEL SELECT');
  await page.waitForTimeout(300);
  await snap('floors');
  await hands.press(`floor:${want}`);
  await page.waitForTimeout(400);
  await snap('class');
  await hands.press(`class:${cls}`);
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => {
    const g = window.__dbg.game();
    if (!g) return null;
    const h = g.hero;
    const words = Object.entries(h.words).filter(([, n]) => n > 0).map(([w]) => w);
    const gear = Object.entries(h.gear).filter(([, it]) => it).map(([s, it]) => `${s}:${it.ilvl}/${it.rarity}`);
    return { depth: g.depth, trial: g.trial, practice: g.practice, town: g.level.town, level: h.level, attrs: h.attrs, life: Math.round(h.d.maxLife), ring: h.ring, words: words.length, gear: gear.join(' '), wayDepth: g.wayDepth };
  });
  log('level select', JSON.stringify(st));
  await snap('floor');
  await page.waitForTimeout(2500);
  await snap('floor2');
  // (the saved run as it was before: the test hero is never saved, even as the page is left)
  await page.evaluate(() => { window.__dbg.save(); window.dispatchEvent(new Event('pagehide')); });
  const after = await page.evaluate(() => localStorage.getItem('arpg-save-v2') ?? localStorage.getItem(Object.keys(localStorage).find((k) => k.includes('save')) ?? ''));
  const runOf = (s) => { try { return JSON.stringify(JSON.parse(s ?? 'null')?.run ?? null); } catch { return 'unreadable'; } };
  log('saved run before', runOf(before).slice(0, 80));
  log('saved run after ', runOf(after).slice(0, 80));
  log('saved run unchanged', runOf(before) === runOf(after));
}
