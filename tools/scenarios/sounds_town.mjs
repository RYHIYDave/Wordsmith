// (the crash he reported, 7 Nov 2026 21:33: “I can’t even move in the first town before the game crashes”) a fresh game, each hero, in town, walked about.
import { makeHands, log } from './lib.mjs';
export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e && e.stack || e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  let live = 0, most = 0, total = 0, done = 0, failed = 0;
  page.on('request', (r) => { if (r.url().includes('/sounds/')) { live++; total++; most = Math.max(most, live); } });
  page.on('requestfinished', (r) => { if (r.url().includes('/sounds/')) { live--; done++; } });
  page.on('requestfailed', (r) => { if (r.url().includes('/sounds/')) { live--; failed++; } });
  const hands = await makeHands(page);
  const cls = process.env.CLS || 'warrior';
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press(`class:${cls}`, 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForTimeout(6000);
  log('in game', await page.evaluate(() => { const g = window.__dbg.game(); return g ? { cls: g.hero.cls, town: !!g.level.town, x: g.hero.x, y: g.hero.y } : null; }));
  await snap('a_town');
  for (const k of ['KeyW', 'KeyD', 'KeyS', 'KeyA']) {
    await page.keyboard.down(k); await page.waitForTimeout(1200); await page.keyboard.up(k);
  }
  log('after keys', await page.evaluate(() => { const g = window.__dbg.game(); return g ? { x: g.hero.x, y: g.hero.y } : null; }));
  // a drag on the screen, as a thumb would
  await hands.dragAt(200, 250, 260, 200);
  await page.waitForTimeout(1500);
  await hands.dragAt(200, 250, 140, 300);
  await page.waitForTimeout(3000);
  log('after drags', await page.evaluate(() => { const g = window.__dbg.game(); return g ? { x: g.hero.x, y: g.hero.y } : null; }));
  await snap('b_moved');
  log('sounds: asked, done, failed, most at once', [total, done, failed, most]);
  log('errors', errs.length);
  for (const e of errs.slice(0, 10)) console.log('ERR', e.slice(0, 900));
}
