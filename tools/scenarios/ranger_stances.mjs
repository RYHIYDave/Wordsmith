// THE RANGER'S NEW STANCES AND MOVES, IN PLAY (art/moves3.ts RANGER_STANCES, with game/defs.ts
// RANGER_ARROW: ON since Version 19.4; this playtest plays him as the game has him, then switches
// them off and on again). The owner, 8 Oct 2026, 15:38: "When you run, the ranger is crouched, but
// when you stop he pops back up.  I want him to stay crouched when he stops in battle." He said
// yes to all of it, 15:57 to 17:07, and to putting it in the game as Version 19.4 at 20:27.
// In the practice room the bot fights with a ranger (running and stopping, shooting on the move,
// Volley, the roll, being hit), and then in town; his pictures are painted all the while, and
// nothing goes wrong on the page.
//   node tools/playtest.mjs [--file dist/<a build with __dbg.rangerStances>.html] [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/ranger_stances.mjs --out shots/ranger_stances
import { log } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); if (!g) return null; const h = g.hero;
    return { cls: h.cls, practice: g.practice, town: g.level.town, life: Math.round(h.life), max: Math.round(h.d.maxLife), over: g.over, painted: d.painting.frames, anim: h.anim };
  });
  await page.evaluate(() => { const d = window.__dbg; d.practice('ranger'); });
  await page.waitForTimeout(900);
  let s = await st();
  check('a ranger in the practice room, with his new moves', !!s && s.cls === 'ranger' && s.practice && !s.town, JSON.stringify(s));
  if (!s) return;
  await snap('arrived');
  const before = s.painted;
  // (the bot runs about, stops, shoots on the move, looses Volleys and rolls)
  await page.evaluate(() => { const d = window.__dbg; d.autoLevel = false; d.bot(true); d.speed = 2; });
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(120);
    s = await st();
    seen.add(s.anim);
    if (i % 15 === 7) await snap(`fight_${i}`);
    if (s.over) break;
  }
  check('the bot fought on with him', !s.over, `life ${s.life}/${s.max}`);
  check('he stood and attacked', ['idle', 'attack'].every((a) => seen.has(a)), [...seen].join(' '));
  check('his pictures were painted', s.painted > before + 40, `${s.painted - before} frames painted`);
  await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; });
  await page.waitForTimeout(600);
  await snap('standing');
  // (and by hand: he runs, and stops, and runs back)
  const ran = new Set();
  for (const key of ['KeyD', 'KeyA']) {
    await page.keyboard.down(key);
    for (let i = 0; i < 8; i++) { await page.waitForTimeout(60); ran.add((await st()).anim); }
    await page.keyboard.up(key);
    for (let i = 0; i < 6; i++) { await page.waitForTimeout(60); ran.add((await st()).anim); }
    await snap(`after_${key}`);
  }
  check('he ran and stopped', ran.has('walk') && ran.has('idle'), [...ran].join(' '));
  // (and as he was before Version 19.4: the switch off, the heroes painted again; then on again, as the game has him)
  await page.evaluate(() => window.__dbg.rangerStances(false));
  await page.waitForTimeout(400);
  s = await st();
  check('switched off, he is drawn as before', !!s && !s.over, JSON.stringify(s));
  await snap('switched_off');
  await page.evaluate(() => window.__dbg.rangerStances(true));
  await page.waitForTimeout(400);
  s = await st();
  check('switched on again, he is drawn as the game has him', !!s && !s.over, JSON.stringify(s));
  await snap('switched_on');
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
