// THE SWAMP COLOSSUS'S SOUNDS IN PLAY (25.3.1: the sound chat's fifth batch, game/act1_rules/colossus.ts `sounds`): a game begun as he
// begins one (so the sound is let start), then floor 10: his sounds fetched as it is come into (from the colossus pack); onto his
// stone, his waking (the rumble, his tentacles bursting up: takes played); phase 1's tentacles killed, his entrance (its one sound).
// What came, what failed, how many takes played, and no errors. Served with its sounds: --serve.
//   node tools/playtest.mjs --file <page> --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/colossus_sounds.mjs --out shots/colossus/sounds
import { makeHands, log } from './lib.mjs';
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
  await page.waitForTimeout(6000);
  const his = (d) => d.come.filter((n) => n.startsWith('colossus_'));
  const d0 = await page.evaluate(() => window.__dbg.soundsDetail());
  log('floor 10: his sounds come', JSON.stringify(his(d0)));
  check('none failed', !d0.failed.some((n) => n.startsWith('colossus_')), JSON.stringify(d0.failed));
  const stand = (u, v) => page.evaluate(([u, v]) => { const g = window.__dbg.game(); const S = g.level.land.stone; g.hero.x = S.cx + ((u - 8.5) + (v - 5.5)) / Math.SQRT2; g.hero.y = S.cy + ((v - 5.5) - (u - 8.5)) / Math.SQRT2; }, [u, v]);
  const fightMode = () => page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const f = b && b.a1 && b.a1.fight; return f ? f.mode : 'none'; });
  // (on the jetty's head till he is laid, then onto the stone: his fight begins as the hero steps on)
  for (let i = 0; i < 40; i++) { await stand(8.5, 11.6); if (await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); return !!(b && b.a1); })) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(800);
  let begun = false;
  for (let i = 0; i < 60 && !begun; i++) { await stand(8.5, 8.5); const m = await fightMode(); begun = m !== 'idle' && m !== 'none'; if (!begun) await page.waitForTimeout(250); }
  check('his fight begun', begun);
  await page.waitForTimeout(6000);
  const d1 = await page.evaluate(() => window.__dbg.soundsDetail());
  log('his sounds come by then', JSON.stringify(his(d1)));
  // (fetched ahead: by his waking every one of his, those not played yet among them; the hero here set down at the landing at once)
  check('his sounds fetched ahead', ['rise', 'tentacle', 'entrance', 'pour', 'roar', 'slime'].every((k) => his(d1).some((n) => n.startsWith(`colossus_${k}_`))), his(d1).length);
  check('his waking heard: the rumble and his tentacles', d1.heard.includes('rec:colossus_rise') && d1.heard.includes('rec:colossus_tentacle'), JSON.stringify(d1.heard.filter((k) => k.includes('colossus'))));
  // (phase 1's tentacles killed: his entrance)
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead)) g.damageMonster(m, m.life + 10, 'phys', true); });
  let changed = false;
  for (let i = 0; i < 40 && !changed; i++) { await page.waitForTimeout(250); changed = (await fightMode()) === 'change'; }
  check('his change to phase 2 begun', changed);
  await page.waitForTimeout(1500);
  await snap('entrance');
  const d2 = await page.evaluate(() => window.__dbg.soundsDetail());
  check('his entrance heard', d2.heard.includes('rec:colossus_entrance'), JSON.stringify(d2.heard.filter((k) => k.includes('colossus'))));
  log('his sounds come by then', JSON.stringify(his(d2)));
  check('no errors', errs.length === 0, errs.slice(0, 2).join(' | '));
}
