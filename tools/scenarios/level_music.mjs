// ACT 1'S LEVEL MUSIC IN PLAY (the sound chat's tenth batch; engine/audio.ts levelMusic, game/level_music.ts): a new game begun as
// he begins one; the town's walk faded in; floor 1's walk, the town's let go of; a fight on floor 1 (an enemy woken beside him):
// its music in at full, the walk down to nothing; the fight over (the enemy gone off and asleep): the fight's faded out, the walk
// back; floor 3's, floor 1's let go of; the title: none held. What failed, and no errors. Served with its sounds: --serve.
import { makeHands, log } from './lib.mjs';
export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e && e.stack || e)));
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press('class:warrior', 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForTimeout(9000);
  const music = () => page.evaluate(() => window.__dbg.music());
  const r2 = (v) => (v === null ? null : Math.round(v * 100) / 100);
  const show = (m) => ({ place: m.place, walk: r2(m.walk), fight: r2(m.fight), started: m.started, held: m.held });
  log('town', show(await music()));
  // floor 1
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon('gate'); for (const m of g.monsters) { m.state = 'sleep'; } });
  await page.waitForTimeout(5000);
  log('floor 1, walking', show(await music()));
  // a fight: an enemy woken beside him (he is kept alive)
  const woke = await page.evaluate(() => {
    const g = window.__dbg.game();
    const h = g.hero;
    const m = g.monsters.find((q) => !q.dead && !q.boss);
    if (!m) return null;
    m.x = h.x + 2.5;
    m.y = h.y;
    m.state = 'chase';
    const full = h.life; window.__keep = setInterval(() => { h.life = Math.max(h.life, full); }, 50);
    return m.kind;
  });
  log('woken beside him', woke);
  await page.waitForTimeout(1500);
  log('floor 1, the fight on', show(await music()));
  await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const m of g.monsters) if (!m.dead && Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 14) { m.x = g.hero.x + 40; m.state = 'sleep'; }
    window.__away = setInterval(() => { for (const m of g.monsters) if (!m.dead && Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 12) m.state = 'sleep'; }, 50);
  });
  await page.waitForTimeout(2000);
  log('floor 1, 2 s after the last one went', show(await music()));
  await page.waitForTimeout(5000);
  log('floor 1, the fight over', show(await music()));
  // floor 3
  await page.evaluate(() => { clearInterval(window.__away); const g = window.__dbg.game(); g.depth = 3; g.cleared = 2; g.wayDepth = 3; g.enterDungeon('way'); for (const m of g.monsters) m.state = 'sleep'; });
  await page.waitForTimeout(5000);
  log('floor 3, walking', show(await music()));
  await page.evaluate(() => clearInterval(window.__keep));
  const d = await page.evaluate(() => window.__dbg.soundsDetail());
  log('music failed', d.failed.filter((f) => f.startsWith('music_')));
  log('errors', errs.length);
  for (const e of errs.slice(0, 5)) console.log('ERR', e.slice(0, 600));
}
