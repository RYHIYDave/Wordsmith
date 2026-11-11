// THE SWAMP COLOSSUS'S SOUNDS IN PLAY (game/act1_rules/colossus.ts `sounds`; the sound chat's fifth batch, 25.3.1, and its seventh,
// the rest of his fight): a game begun as he begins one (so the sound is let start), then floor 10: his sounds fetched as it is come
// into (from the colossus pack), every one the game plays and none failed; onto his stone, his waking (its one sound); a tentacle's
// slam on the stone (coiled, slammed, dragged back); phase 1's tentacles killed (their death), his entrance (its one sound); phase
// 2's killed, his slide (its one sound, the water pouring off him) and his ward's hum; his pillars put out, his ward's breaking;
// killed, his death (its one sound). What came, what failed, what was heard, and no errors. Served with its sounds: --serve.
//   node tools/playtest.mjs --file <page> --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_sounds.mjs --out shots/colossus/sounds
//   (with --init tools/mem_probe.js: how much decoded sound the page holds on his floor, too)
import { makeHands, log } from './lib.mjs';

/** Every sound of his the game plays (game/sound_families.ts COLOSSUS_SOUND_NAMES), without `colossus_`. */
const HIS = [
  'tentacle', 'entrance', 'pour', 'roar',
  'wake', 'bile', 'gaze', 'eyeslam', 'slide', 'death',
  'tentacle_coil', 'tentacle_slam', 'tentacle_drag', 'tentacle_death', 'water_slam', 'wave', 'wave_crash',
  'burst', 'tentacle_scrape', 'growl', 'snap',
  'ward_on', 'ward_ping', 'ward_break', 'pillar_set', 'pillar_topple', 'bolt', 'eye_hurt',
];

export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e && e.stack || e)));
  const check = (what, cond, more = '') => { console.log(`  ${cond ? 'ok' : '!!'} ${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press('class:warrior', 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForTimeout(6000);
  // (the sound let start by the game begun as he begins one; then a game as the Colossus's other playtests have it, no prompts)
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(28); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 10; g.cleared = 9; g.enterDungeon(); const L = g.level; L.explored.fill(1); const h = g.hero; h.x = L.land.landing.x; h.y = L.land.landing.y; });
  const his = (d) => d.come.filter((n) => n.startsWith('colossus_'));
  const detail = () => page.evaluate(() => window.__dbg.soundsDetail());
  // (every one of his fetched ahead, two at a time from the one pack: waited for, no longer than half a minute)
  let d0 = await detail();
  for (let i = 0; i < 60 && his(d0).length < HIS.length * 2; i++) { await page.waitForTimeout(500); d0 = await detail(); }
  log('floor 10: his sounds come', his(d0).length);
  check('none failed', !d0.failed.some((n) => n.startsWith('colossus_')), JSON.stringify(d0.failed));
  check('his sounds fetched ahead, both takes of each the game plays', HIS.every((k) => [1, 2].every((t) => d0.come.includes(`colossus_${k}_${t}.mp3`))), `${his(d0).length} of ${HIS.length * 2}; missing ${JSON.stringify(HIS.filter((k) => ![1, 2].every((t) => d0.come.includes(`colossus_${k}_${t}.mp3`))))}`);
  check('and only those: none of the parts that are inside a set move\'s own sound', his(d0).length === HIS.length * 2, JSON.stringify(his(d0).filter((n) => !HIS.some((k) => n === `colossus_${k}_1.mp3` || n === `colossus_${k}_2.mp3`))));
  const probe = await page.evaluate(() => (window.__probe ? window.__probe.counts().audioBuf : null));
  if (probe) log('decoded sound the page holds on his floor', JSON.stringify(probe));
  const stand = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; }, [u, v]);
  const fight = () => page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return f ? { mode: f.mode, ph: f.ph } : { mode: 'none', ph: 0 }; });
  // (what has been heard since the play began: the page keeps the last forty, so they are gathered as it goes)
  const heard = new Set();
  const listen = async () => { const d = await detail(); for (const k of d.heard) heard.add(k); return d; };
  const wait = async (cond, most, every = 250) => { for (let i = 0; i < most / every; i++) { await listen(); if (await cond()) return true; await page.waitForTimeout(every); } await listen(); return !!(await cond()); };
  const has = (...names) => names.every((n) => heard.has(`rec:colossus_${n}`));
  const killArms = () => page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); });
  // (on the jetty's head till he is laid, then onto the stone: his fight begins as the hero steps on)
  for (let i = 0; i < 40; i++) { await stand(8.5, 11.6); if (await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); return !!(b && b.a1); })) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(800);
  let begun = false;
  for (let i = 0; i < 60 && !begun; i++) { await stand(8.5, 8.5); const m = (await fight()).mode; begun = m !== 'idle' && m !== 'none'; if (!begun) await page.waitForTimeout(250); }
  check('his fight begun', begun);
  // HIS WAKING, then a slam on the stone
  await wait(async () => has('wake'), 3000);
  check('his waking heard: its one sound', has('wake'), JSON.stringify([...heard].filter((k) => k.includes('colossus'))));
  check('no rumble or tentacle bursts of their own with it', !heard.has('rec:colossus_rise') && !heard.has('rec:colossus_tentacle'));
  await wait(async () => has('tentacle_coil', 'tentacle_slam', 'tentacle_drag'), 16000);
  check('a slam on the stone heard: coiled, slammed, dragged back', has('tentacle_coil', 'tentacle_slam', 'tentacle_drag'), JSON.stringify([...heard].filter((k) => k.includes('colossus'))));
  check('the game\'s own slam not heard in his fight', !heard.has('sfx:slam'));
  // (phase 1's tentacles killed: their death, his entrance)
  await killArms();
  const changed = await wait(async () => (await fight()).mode === 'change', 10000);
  check('his change to phase 2 begun', changed);
  await page.waitForTimeout(1500);
  await listen();
  await snap('entrance');
  check('a tentacle\'s death heard', has('tentacle_death'));
  check('his entrance heard', has('entrance'), JSON.stringify([...heard].filter((k) => k.includes('colossus'))));
  // (phase 2's tentacles killed as soon as they stand: their death, his slide, his ward)
  await wait(async () => { const f = await fight(); return f.ph === 2 && f.mode === 'fight'; }, 14000);
  await page.waitForTimeout(1500);
  await killArms();
  const slid = await wait(async () => (await fight()).ph === 3, 14000);
  check('his slide into phase 3', slid);
  await wait(async () => has('ward_on'), 3000);
  check('his slide heard: its one sound, the water pouring off him under it', has('slide', 'pour'), JSON.stringify([...heard].filter((k) => k.includes('colossus'))));
  check('his ward\'s hum heard as it comes on', has('ward_on'));
  await snap('phase3');
  // (a blow at him, shielded; his pillars put out; a blow that hurts; killed)
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); g.damageMonster(b, 50, 'phys', true); });
  await wait(async () => has('ward_ping'), 2000);
  check('a blow glancing off his ward heard', has('ward_ping'));
  await page.evaluate(() => { const g = window.__dbg.game(); for (const p of g.level.pillars || []) { if (p.lit) g.setPillarPiece(p); } });
  await wait(async () => has('ward_break'), 3000);
  check('a piece set heard, and his ward breaking', has('pillar_set', 'ward_break'), JSON.stringify([...heard].filter((k) => k.includes('colossus'))));
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); g.damageMonster(b, b.maxLife * 0.06, 'phys', false); });
  await wait(async () => has('eye_hurt'), 2000);
  check('his eye struck heard: his own hurt, not the old Eye\'s', has('eye_hurt') && !heard.has('rec:eye_hurt'));
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); g.damageMonster(b, b.life + 10, 'phys', true); });
  await wait(async () => has('death'), 3000);
  await page.waitForTimeout(2500);
  await listen();
  await snap('death');
  check('his death heard: its one sound, not the old Eye\'s', has('death') && !heard.has('rec:eye_death'), JSON.stringify([...heard].filter((k) => k.includes('colossus') || k.includes('eye_'))));
  const d9 = await detail();
  check('none of his failed by the end', !d9.failed.some((n) => n.startsWith('colossus_')), JSON.stringify(d9.failed));
  log('his sounds heard', JSON.stringify([...heard].filter((k) => k.includes('colossus')).sort()));
  check('no errors', errs.length === 0, errs.slice(0, 2).join(' | '));
}
