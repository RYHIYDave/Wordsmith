// THE ROYAL CARDS (game/royal_cards.ts, behind HIGH_CITY, off): pictures and checks, with the switch on for the scenario alone.
//   1. in the practice hall, a pack a royal has touched, each with that royal's crest over its head (one of them an elite
//      with its word, the crest above it), and the four royals' cards lying on the floor, named;
//   2. at the stranger, in town, a hero holding Kings, Queens, a Princess and a Prince: the gamble's CARDS tab; his cards page,
//      every hand best first; the full house picked, HAND IN; what came, in his bag.
//   node tools/playtest.mjs --file <page> [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/royal_cards.mjs --out shots/royal/pc
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  // ---- 1. the crests and the cards on the floor
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.highCity.on = true;
    d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(6000);
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const lx = -Math.SQRT1_2; const ly = Math.SQRT1_2; const ux = -Math.SQRT1_2; const uy = -Math.SQRT1_2;
    const at = (far, deg) => { const a = (deg * Math.PI) / 180; return { x: h.x + far * (Math.cos(a) * lx + Math.sin(a) * ux), y: h.y + far * (Math.cos(a) * ly + Math.sin(a) * uy) }; };
    const royals = ['princess', 'prince', 'queen', 'king'];
    [[2.6, 150, 'skeleton', 0], [3.0, 175, 'skeleton', 0], [2.6, 200, 'skeleton', 1], [2.4, 20, 'cultist', 0], [2.8, 45, 'cultist', 0]].forEach(([far, deg, kind, rank], i) => {
      const p = at(far, deg);
      const m = g.spawn(kind, p.x, p.y, 1, rank, false, g.rng);
      if (rank === 0) { m.words = []; m.carries = []; }
      g.wakeUp(m); m.life = m.maxLife = 1e7; m.cd = 1e9; m.seen = true;
      m.royal = i < 3 ? 'queen' : 'king';
    });
    royals.forEach((r, i) => {
      const p = at(1.6, -60 + i * 28);
      g.drops.push({ kind: 'card', x: p.x, y: p.y, gold: 0, item: null, word: null, age: -1e9, royal: r }); // (never old enough to be taken up: they lie for the picture)
    });
    d.god = true;
  });
  await page.waitForTimeout(700);
  const seen = await page.evaluate(() => { const g = window.__dbg.game(); return { crests: g.monsters.filter((m) => m.royal && !m.dead).length, cards: g.drops.filter((d) => d.kind === 'card').length }; });
  check('1. five touched enemies and four cards on the floor', seen.crests === 5 && seen.cards >= 1, JSON.stringify(seen));
  await snap('1_floor');
  // ---- 2. the stranger
  await page.evaluate(() => {
    const d = window.__dbg; d.run('warrior', 31); d.seasoned(20); const g = d.game(); g.depth = 2; g.cleared = 1;
    const h = g.hero; h.bag.fill(null); h.cards = { king: 3, queen: 2, princess: 1, prince: 1 };
  });
  await page.waitForTimeout(400);
  const at = await page.evaluate(() => window.__dbg.game().level.stations.some((q) => q.kind === 'stranger'));
  check('2. the stranger is in town', at);
  await page.evaluate(() => window.__dbg.open('stranger'));
  await page.waitForTimeout(400);
  check('2. his gamble has the CARDS tab', !!(await hands.mark('button:CARDS')));
  await snap('2_gamble');
  await hands.press('button:CARDS');
  await page.waitForTimeout(300);
  const full = 'hand:fullhouse:king:queen';
  check('2. his cards page: the full house there', !!(await hands.mark(full)));
  await snap('3_cards');
  await hands.press(full);
  await page.waitForTimeout(300);
  check('2. picked: HAND IN', !!(await hands.mark('button:HAND IN')));
  await snap('4_picked');
  await hands.press('button:HAND IN');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => { const g = window.__dbg.game(); return { cards: g.hero.cards, won: g.wonHand.length, bag: g.hero.bag.filter(Boolean).length }; });
  check('2. handed in: the five cards gone, three pieces in the bag', JSON.stringify(after.cards) === JSON.stringify({ princess: 1, prince: 1 }) && after.won === 3 && after.bag === 3, JSON.stringify(after));
  await snap('5_got');
  await page.evaluate(() => { window.__dbg.highCity.on = false; });
  log('royal cards', fails ? `${fails} thing(s) wrong` : 'all as they should be');
}
