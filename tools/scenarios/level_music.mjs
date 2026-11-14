// ACT 1'S LEVEL MUSIC IN PLAY (the sound chat's tenth batch; engine/audio.ts levelMusic, game/level_music.ts): a new game begun as
// he begins one; the town's walk faded in; floor 1's walk, the town's let go of; a fight on floor 1 (an enemy woken beside him):
// its music in at full, the walk down to nothing; the fight over (the enemy gone off and asleep): the fight's faded out, the walk
// back; floor 3's, floor 1's let go of; the title: none held. What failed, and no errors. Served with its sounds: --serve.
// EACH MUSIC FILE THE PAGE ASKS FOR IS HANDED IT AS THE SAME MUSIC MADE A SMALL WAV, as long to the sample (ffmpeg, 8 kHz mono,
// made here), and what is tested is the game's playing of it: when each loop starts, fades and is let go. (Made so when the music
// was AAC in .mp4, which Playwright's Chromium could not decode; MP3 since 14 Nov 2026, kept for being light.)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { makeHands, log } from './lib.mjs';
export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e && e.stack || e)));
  const wavs = new Map();
  await page.route(/\/sounds\/[0-9a-f]+\/music_[a-z0-9_]+\.mp3$/, (route) => {
    const name = route.request().url().replace(/.*\//, '');
    let b = wavs.get(name);
    if (!b) {
      b = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join('assets', 'sound', name), '-ac', '1', '-ar', '8000', '-f', 'wav', '-'], { maxBuffer: 64 << 20 });
      wavs.set(name, b);
    }
    return route.fulfill({ status: 200, contentType: 'audio/wav', body: b });
  });
  if (!fs.existsSync(path.join('assets', 'sound', 'music_town_walk.mp3'))) console.log('  !! the music files are not in assets/sound');
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
  const check = (label, ok) => console.log(ok ? `  ok ${label}` : `  !! ${label}`);
  const VOL = 0.6;
  const near = (v, to) => v !== null && Math.abs(v - to) < 0.05;
  const t = await music();
  log('town', show(t));
  check('the town: its walk, at its loudness', t.place === 'town' && near(t.walk, VOL) && t.fight === null && t.held.includes('music_town_walk.mp3'));
  // floor 1
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon('gate'); for (const m of g.monsters) { m.state = 'sleep'; } });
  await page.waitForTimeout(5000);
  const f1 = await music();
  log('floor 1, walking', show(f1));
  check("floor 1: its walk; its fight's come; the town's let go of", f1.place === 'f1' && near(f1.walk, VOL) && f1.fight === null && f1.held.includes('music_f1_walk.mp3') && f1.held.includes('music_f1_fight.mp3') && !f1.held.includes('music_town_walk.mp3'));
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
  const on = await music();
  log('floor 1, the fight on', show(on));
  check('the fight on: its music at full, the walk down to nothing (and going on)', near(on.fight, VOL) && on.walk !== null && on.walk < 0.05);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const m of g.monsters) if (!m.dead && Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 14) { m.x = g.hero.x + 40; m.state = 'sleep'; }
    window.__away = setInterval(() => { for (const m of g.monsters) if (!m.dead && Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 12) m.state = 'sleep'; }, 50);
  });
  await page.waitForTimeout(2000);
  const after = await music();
  log('floor 1, 2 s after the last one went', show(after));
  check('2 s after the last went: the fight still on', near(after.fight, VOL));
  await page.waitForTimeout(5000);
  const over = await music();
  log('floor 1, the fight over', show(over));
  check('the fight over: its music gone, the walk back', over.fight === null && near(over.walk, VOL));
  // floor 3
  await page.evaluate(() => { clearInterval(window.__away); const g = window.__dbg.game(); g.depth = 3; g.cleared = 2; g.wayDepth = 3; g.enterDungeon('way'); for (const m of g.monsters) m.state = 'sleep'; });
  await page.waitForTimeout(5000);
  const f3 = await music();
  log('floor 3, walking', show(f3));
  check("floor 3: its walk; floor 1's let go of", f3.place === 'f3' && near(f3.walk, VOL) && f3.held.includes('music_f3_walk.mp3') && !f3.held.some((f) => f.startsWith('music_f1_')));
  await page.evaluate(() => clearInterval(window.__keep));
  const d = await page.evaluate(() => window.__dbg.soundsDetail());
  log('music failed', d.failed.filter((f) => f.startsWith('music_')));
  check('no music failed to come', !d.failed.some((f) => f.startsWith('music_')));
  log('errors', errs.length);
  check('no errors', errs.length === 0);
  for (const e of errs.slice(0, 5)) console.log('ERR', e.slice(0, 600));
}
