// Pictures of who carries a word and who does not, in one dungeon: a named monster with a rune
// over its head, one without, and the boss (which always carries one).
//   CLS=warrior node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/scarce.mjs --out shots/scarce
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 31);
  const fail = async (msg) => { console.log('  !! ' + msg); await page.evaluate((m) => console.error(m), 'scarce: ' + msg); };
  const info = await page.evaluate(([c, sd0]) => {
    const d = window.__dbg; d.autoLevel = false; d.autoWords = false;
    // (THE FIRST LEVELS, the game's own since Version 19.5: no monster of the first dungeon carries a
    // word. So the second: a hero home from the first, the ring lit, at the level he would be. Its
    // named monsters carry a word by chance: the first seed from SEED on whose second dungeon has one
    // that does, so that there is a picture of one; up to twenty tried.)
    const fl = d.firstLevelsOn();
    let g = null;
    let sd = sd0;
    for (; sd < sd0 + 20; sd++) {
      d.run(c, sd);
      if (fl) d.seasoned(3);
      g = d.game();
      if (fl) { g.depth = 2; g.cleared = 1; }
      // (as a character fresh from the first dungeon: the class's first word, on the attack it is meant for)
      const first = { warrior: ['power', 0], ranger: ['poison', 1], mage: ['fire', 0] }[c];
      g.hero.words[first[0]] = 1;
      g.socket(first[1], 'front', first[0]);
      g.enterDungeon();
      if (!fl || g.monsters.some((m) => m.elite && !m.boss && m.carries.length)) break;
    }
    d.god = true;
    const named = g.monsters.filter((m) => m.elite && !m.boss);
    return { seed: sd,
      named: named.length, carrying: named.filter((m) => m.carries.length).length,
      withRune: named.filter((m) => m.carries.length).map((m) => m.id), without: named.filter((m) => !m.carries.length && !m.champion).map((m) => m.id),
      boss: g.boss ? { id: g.boss.id, carries: g.boss.carries } : null, monsters: g.monsters.length, depth: g.depth,
    };
  }, [cls, seed]);
  log('this dungeon', `seed ${info.seed}, dungeon ${info.depth}: ${info.monsters} monsters; ${info.named} named monsters and guardians, of which ${info.carrying} carry a word; the boss carries ${info.boss ? info.boss.carries.join(', ') : '-'}`);
  if (!info.withRune.length) await fail(`no carrier in the ${info.depth === 1 ? 'first' : 'second'} dungeon`);
  if (!info.boss || info.boss.carries.length !== 1) await fail('the boss should carry exactly one word');
  /** Stand the hero a few steps from a monster, with a clear line to it, and wait for the picture to settle. */
  const visit = async (id, name, from = 0.6, far = 4, wait = 1100) => {
    const ok = await page.evaluate(([mid, a0, r0]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor;
      const m = g.monsters.find((q) => q.id === mid);
      if (!m) return false;
      // (what was said about the last monster is not left on screen for this one)
      d.fx.messages.length = 0;
      for (let r = r0; r >= 2; r -= 0.5) for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + a0; const x = m.x + Math.cos(a) * r; const y = m.y + Math.sin(a) * r;
        let open = true;
        for (let s = 0; s <= 8 && open; s++) { const px = m.x + (x - m.x) * (s / 8); const py = m.y + (y - m.y) * (s / 8); open = g.level.walk[Math.floor(py) * f.w + Math.floor(px)] === 1; }
        if (open) { h.x = x; h.y = y; return true; }
      }
      return false;
    }, [id, from, far]);
    if (!ok) { await fail(`no place to stand near ${name}`); return; }
    await page.waitForTimeout(wait);
    await snap(name);
  };
  await visit(info.withRune[0], 'rune');
  if (info.without.length) await visit(info.without[0], 'no_rune'); else log('every named monster here carries', '(no picture of one without)');
  // (the hero stands up-screen of the boss, so that the boss and its rune are clear of the life bar at the top)
  // (and farther off: this boss is swift, and is on the hero in a second)
  if (info.boss) await visit(info.boss.id, 'boss', Math.PI, 6, 750);
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) await fail('text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
