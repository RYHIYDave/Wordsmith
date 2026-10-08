// NORMAL MODE (game/modes.ts, `MODES.on`, on since Version 19.1), its pictures and its playtest (in the
// regression: modes_pc, modes_phone):
//   1. the class cards with the mode's button, as they open (Normal), and pressed (Hardcore);
//   2. a Normal warrior falls in dungeon 4, with what he found there in his bag: YOU FELL, what it
//      cost, and "Back to town";
//   3. pressed: he wakes in town, without what he found, and the lines say so.
//   node tools/playtest.mjs --file <page> --scenario tools/scenarios/modes_look.mjs --out shots/modeslook/pc
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.modes.on = true; d.meta().mode = 'normal'; });
  await page.waitForTimeout(300);

  // ---- 1. the class cards ----------------------------------------------------------------------
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(400);
  await snap('01_cards_normal');
  check('1. the cards offer the mode, Normal first', !!(await hands.mark('button:MODE: NORMAL')));
  await hands.press('button:MODE: NORMAL');
  await page.waitForTimeout(300);
  await snap('02_cards_hardcore');
  const hard = await page.evaluate(() => window.__dbg.meta().mode);
  check('   pressed, it is Hardcore', hard === 'hardcore' && !!(await hands.mark('button:MODE: HARDCORE')), hard);
  await hands.press('button:MODE: HARDCORE');
  await page.waitForTimeout(200);
  check('   and Normal again', (await page.evaluate(() => window.__dbg.meta().mode)) === 'normal');

  // ---- 2. a Normal death in dungeon 4 -------------------------------------------------------------
  const set = await page.evaluate(() => {
    const d = window.__dbg;
    d.run('warrior', 47);
    const g = d.game();
    g.mode = 'normal';
    d.autoLevel = false; d.autoWords = false;
    // (a warrior some way along: level 6, three dungeons behind him, 240 gold)
    g.gainXp(5200);
    g.hero.pending = 0;
    g.depth = 4; g.cleared = 3;
    g.hero.gold = 240;
    g.enterDungeon();
    // what he finds in there: two pieces, a word, 140 gold
    const h = g.hero;
    const free = () => h.bag.findIndex((it) => it === null);
    h.bag[free()] = d.item('chest', 'magic', 4, 11);
    h.bag[free()] = d.item('ring', 'rare', 4, 12);
    h.words.frost += 1;
    h.gold += 140;
    // (he falls near the first pack he would meet)
    const f = g.level.floor;
    let best = null; let bd = 1e9;
    for (const m of g.monsters) { if (m.boss) continue; const dd = Math.hypot(m.x - f.start.x, m.y - f.start.y); if (dd < bd) { bd = dd; best = m; } }
    if (best) {
      for (let r = 2; r <= 4; r++) for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
        if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] === 1) { h.x = x; h.y = y; r = 9; break; }
      }
      g.wakeUp(best);
    }
    return { level: h.level, gold: h.gold, by: best ? best.name : '' };
  });
  await page.waitForTimeout(900);
  // (for the picture: the lines of the way in cleared, and the pointer off the buttons)
  if (!(await page.evaluate(() => window.__dbg.screen.touch))) await page.mouse.move(4, 4);
  await page.evaluate(() => {
    window.__dbg.fx.messages.length = 0;
    const g = window.__dbg.game();
    const m = g.monsters.find((q) => !q.dead && !q.boss) || null;
    g.hero.invuln = 0;
    g.hurtHero(1e9, 'phys', [], m, 'a test');
  });
  for (let i = 0; i < 40 && !(await hands.mark('button:Back to town')); i++) await page.waitForTimeout(100);
  await page.waitForTimeout(200);
  await snap('03_you_fell');
  const fell = await page.evaluate(() => { const g = window.__dbg.game(); return { over: g.over, wakes: g.wakes, lost: g.losses() }; });
  check('2. a Normal death: YOU FELL, and Back to town', fell.over && fell.wakes && !!(await hands.mark('button:Back to town')), JSON.stringify(fell));
  check('   what it costs: two pieces, a word, 140 gold, and a quarter of the 240 carried in', fell.lost && fell.lost.items === 2 && fell.lost.words === 1 && fell.lost.gold === 140 && fell.lost.share === 60, JSON.stringify(fell.lost));

  // ---- 3. awake in town ----------------------------------------------------------------------------
  await hands.press('button:Back to town');
  await page.waitForTimeout(1200);
  await snap('04_awake_in_town');
  const woke = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    return { town: g.level.town, over: g.over, gold: g.hero.gold, level: g.hero.level, depth: g.depth, frost: g.hero.words.frost, bag: g.hero.bag.filter(Boolean).length, said: d.fx.messages.map((m) => m.text).join(' | ') };
  });
  check('3. he wakes in town, at his level, the same dungeon waiting, 180 gold, nothing he found', woke.town && !woke.over && woke.level === set.level && woke.depth === 4 && woke.gold === 180 && woke.frost === 0 && woke.bag === 0, JSON.stringify(woke));
  check('   and the line says so', /You wake in town\. Lost: what you found in dungeon 4 \(2 items, 1 word, 140 gold\), and 60 of your own gold\./.test(woke.said), woke.said);
  log(fails === 0 ? 'finished clean' : `${fails} failed`);
}
