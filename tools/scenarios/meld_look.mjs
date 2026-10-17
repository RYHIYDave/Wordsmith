// WORDMELDING (game/melds.ts), behind MELD, which is off in the game: pictures for the owner, with it
// switched on by the test hook (__dbg.meld). His request, 13 Oct 2026, 12:15: "Can you begin adding
// the melded words?"; his picks of 12:36 in game/melds.ts. Nothing here is in the game until he has
// seen it and said yes.
//   1. the wordsmith's half, his trade, with the MELD tab; the melding page, empty; two words laid in;
//      the word made
//   2. the Fleshmancer's drops on the floor: runedust and the Meldstone
//   3. melded words at work in the practice room: Eruption's molten pool, Scald's steam, Thunder's bolt,
//      Wildfire's arcs setting burning, Eruption's heat
// Checked as it goes: the melding is done by the game's own rules, and comes out as they say.
//   node tools/playtest.mjs --file dist/meld.html --size 844x390 --dpr 3 --touch --scenario tools/scenarios/meld_look.mjs --out shots/meld
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };

  // ---- 1. at the wordsmith -----------------------------------------------------------------------------
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.meld(true);
    d.run('warrior', 31); d.seasoned(3);
    const g = d.game(); g.depth = 6; g.cleared = 5;
    const h = g.hero;
    h.dust = 3; h.meld = 'open';
    for (const w of ['power', 'fire', 'frost', 'poison', 'lightning', 'swift']) h.words[w] = Math.max(1, h.words[w]);
  });
  await page.waitForTimeout(300);
  const town = await page.evaluate(() => window.__dbg.game().level.town);
  check('the hero is in town', town);
  await page.evaluate(() => window.__dbg.open('wordsmith'));
  await page.waitForTimeout(400);
  await hands.settle?.();
  check('the wordsmith is open, his trade first', await page.evaluate(() => window.__dbg.panels.open === 'wordsmith' && !window.__dbg.panels.meldPage));
  check('his half has the MELD tab', !!(await hands.mark('button:MELD')));
  await snap('01_wordsmith_meld_tab');
  await hands.press('button:MELD');
  await page.waitForTimeout(300);
  check('the tab turns his half to melding', await page.evaluate(() => window.__dbg.panels.meldPage));
  await snap('02_melding_empty');
  await page.evaluate(() => { window.__dbg.panels.meldIn = ['power', 'fire']; });
  await page.waitForTimeout(300);
  await snap('03_melding_two_laid_in');
  const before = await page.evaluate(() => { const h = window.__dbg.game().hero; return { power: h.words.power, fire: h.words.fire, eruption: h.words.eruption, dust: h.dust }; });
  await hands.press('button:MELD: 1 RUNEDUST');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return { power: h.words.power, fire: h.words.fire, eruption: h.words.eruption, dust: h.dust, made: g.melded, found: g.meta.known.eruption.found }; });
  check('MELD: Power and Flame are used up, Eruption is made, a runedust spent', after.power === before.power - 1 && after.fire === before.fire - 1 && after.eruption === before.eruption + 1 && after.dust === before.dust - 1, JSON.stringify(after));
  check('it is new, and the Lexicon knows it', after.made && after.made.word === 'eruption' && after.made.first && after.found);
  await snap('04_melding_eruption_made');
  // a second: Frost and Lightning
  await page.evaluate(() => { window.__dbg.panels.meldIn = ['frost', 'lightning']; window.__dbg.game().melded = null; });
  await hands.press('button:MELD: 1 RUNEDUST');
  await page.waitForTimeout(300);
  const second = await page.evaluate(() => window.__dbg.game().melded);
  check('Frost and Lightning make Hailstorm', second && second.word === 'hailstorm', JSON.stringify(second));
  await hands.press('button:DONE');
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__dbg.inv(0));
  await page.waitForTimeout(400);
  await snap('05_inventory_melded_words_and_runedust');
  await hands.press('button:DONE');
  await page.waitForTimeout(300);

  // ---- 2. the Fleshmancer's drops -----------------------------------------------------------------------
  await page.evaluate(() => { const d = window.__dbg; d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  const fell = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 5; g.cleared = 4; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    const boss = g.monsters.find((m) => m.kind === 'fleshmancer');
    if (!boss) return null;
    g.monsters = [boss];
    const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
    const gx = s.alongX ? s.a + 1.5 : s.plane;
    const gy = s.alongX ? s.plane : s.a + 1.5;
    const k = Math.hypot(gx - boss.x, gy - boss.y);
    const h = g.hero;
    h.x = boss.x + ((gx - boss.x) / k) * 4.4;
    h.y = boss.y + ((gy - boss.y) / k) * 4.4;
    return true;
  });
  // (the floor's name goes by first)
  await page.waitForTimeout(4500);
  const fell2 = await page.evaluate(() => {
    const g = window.__dbg.game();
    const boss = g.monsters.find((m) => m.kind === 'fleshmancer');
    boss.life = 0;
    g.kill(boss);
    return { drops: g.drops.map((q) => q.kind), meld: g.hero.meld };
  });
  check('the Fleshmancer drops runedust and the Meldstone', fell && fell2.drops.includes('dust') && fell2.drops.includes('stone'), JSON.stringify(fell2));
  // (since Version 22.0 they wait under the floor while he is dragged down, then burst up out of it, STONE_RISE:
  // the Meldstone cannot be taken until it has come down to hang)
  const risen = () => page.evaluate(() => window.__dbg.game().drops.filter((q) => q.kind === 'dust' || q.kind === 'stone').every((q) => q.age >= (q.kind === 'stone' ? 1.3 : 0.5)));
  for (let k = 0; k < 50 && !(await risen()); k++) await page.waitForTimeout(200);
  await page.waitForTimeout(300);
  await snap('06_fleshmancer_drops_runedust_and_meldstone');
  // (and the two alone, for a closer look)
  await page.evaluate(() => { const g = window.__dbg.game(); g.drops = g.drops.filter((q) => q.kind === 'dust' || q.kind === 'stone'); });
  await page.waitForTimeout(400);
  await snap('06a_runedust_and_meldstone_alone');
  // the hero walks over them: picked up
  await page.evaluate(() => { const g = window.__dbg.game(); const s = g.drops.find((q) => q.kind === 'stone'); g.hero.x = s.x; g.hero.y = s.y; });
  await page.waitForTimeout(1200);
  const got = await page.evaluate(() => { const h = window.__dbg.game().hero; return { dust: h.dust, meld: h.meld, left: window.__dbg.game().drops.map((q) => q.kind) }; });
  check('taken up: the Meldstone carried, the runedust counted', got.meld === 'stone' && got.dust === 3 && !got.left.includes('stone') && !got.left.includes('dust'), JSON.stringify(got));
  await snap('06b_meldstone_taken');

  // ---- 3. at work, in the practice room ------------------------------------------------------------------
  const room = async (front, behind, monsters) => page.evaluate(({ front, behind, monsters }) => {
    const d = window.__dbg; d.practice('warrior', 5); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    const h = g.hero; h.x = 14.5; h.y = 15.5; h.fx = 1; h.fy = 0;
    for (const w of front) g.socket(0, 'front', w);
    for (const w of behind) g.socket(0, 'behind', w);
    for (const [dx, dy] of monsters) {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
    }
    return h.skills[0].r.name;
  }, { front, behind, monsters });
  const strike = async (n = 1, gap = 450) => {
    for (let k = 0; k < n; k++) {
      await page.evaluate(() => { const g = window.__dbg.game(); g.hero.skills[0].cd = 0; g.hero.swingT = 0; });
      // (a tap on the first skeleton: the quick attack, at it)
      const p = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); const m = g.monsters[0]; return d.at(m.x, m.y); });
      await hands.pressAt(p.x, p.y - 8);
      await page.waitForTimeout(gap);
    }
  };
  const near = [[1.1, 0], [1.7, 0.9], [1.7, -0.9]];

  let name = await room(['eruption'], [], near);
  log('in front, Eruption', name);
  await strike(1, 350);
  check('Eruption leaves a molten pool', await page.evaluate(() => window.__dbg.game().zones.some((z) => z.kind === 'burn' && !z.hostile)));
  await snap('07_eruption_front_pool');

  name = await room([], ['scald'], [[1.1, 0], [2.2, 0.6]]);
  log('behind, Scald', name);
  await strike(2, 500);
  check('Scald behind leaves steam', await page.evaluate(() => window.__dbg.game().zones.some((z) => z.kind === 'steam')));
  await snap('08_scald_behind_steam');

  name = await room(['thunder'], [], near);
  log('in front, Thunder', name);
  await strike(1, 120);
  await snap('09_thunder_front_bolt');

  name = await room(['wildfire'], [], [[1.1, 0], [2.6, 0.7], [2.6, -0.7], [3.4, 0]]);
  log('in front, Wildfire', name);
  await strike(1, 400);
  const burning = await page.evaluate(() => window.__dbg.game().monsters.filter((m) => m.burnT > 0).length);
  check('Wildfire\'s arcs set burning', burning >= 2, `${burning} burning`);
  await snap('10_wildfire_front_arcs_burn');

  name = await room([], ['eruption'], near);
  log('behind, Eruption', name);
  await strike(5, 420);
  await snap('11_eruption_behind_heat');
  await strike(1, 150);
  await snap('12_eruption_behind_erupts');
}
