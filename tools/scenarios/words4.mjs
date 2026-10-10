// THE WORDS STILL TO COME, THE FIRST OF THEM, IN PLAY (game/defs.ts WORDS4: off in the game until his
// yes to them at work; this playtest switches it on for its page and puts it back): MYSTICAL, with POWER
// FOR ATTACKS ONLY, and VOLATILE'S HIDDEN BOMB, played by the game's own rules with their looks.
// 1. The practice room, the mage with the staff: Mystical in front of and behind the Wave, at a skeleton
//    three tiles off: its hits carry the word and show it (the crescent); ARCANA builds to five, the moon
//    at her shoulder shows it, and it is gone five seconds after; Power in front of the Wave does nothing,
//    and its lines say so.
// 2. The mage with the wand: Mystical in front of the Familiar: its bolts splash the one beside what they
//    strike (the constellation), and not the one far off.
// 3. The warrior: Volatile in front of Strike: a charge stuck on the first enemy a use hits, drawn on it,
//    bursting a moment later on all near it; on one the blow kills, where it fell.
// 4. The bot fighting in a dungeon with the words on, Mystical on the mage's Wave and Orb.
// 5. Switched off: Mystical no word of the game (the practice room hands none out) and Power feeds the
//    Wave again; the switch left as the game has it.
// Nothing may go wrong on the page.
//   node tools/playtest.mjs [--file dist/<a build>.html] [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/words4.mjs --out shots/words4
import { log } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  await page.evaluate(() => { window.__dbg.saving(false); });
  const was = await page.evaluate(() => window.__dbg.words4());
  check('the switch is off in the game', was === false);
  check('switched on for this page', await page.evaluate(() => window.__dbg.words4(true)) === true);

  /**
   * The practice room, emptied, with `cls` holding `weapon` (if given) and the words set; the game's
   * events kept in window.__said; monsters stood where `layout` says (tiles across and down the
   * screen from the hero), held still, with life enough unless `weak`.
   */
  const room = async (cls, weapon, sockets, layout) => page.evaluate(([cls, weapon, sockets, layout]) => {
    const d = window.__dbg; d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.bombs.length = 0;
    d.words3.clear();
    const h = g.hero;
    if (weapon && g.weapon() !== weapon) g.equipFromBag(h.bag.findIndex((it) => it && it.weapon === weapon));
    const set = [];
    for (const [i, side, w] of sockets) {
      h.words[w] = (h.words[w] || 0) + 1;
      set.push(g.socket(i, side, w) ?? 'ok');
    }
    const said = (window.__said = []);
    const emit = g.emit.bind(g);
    g.emit = (e) => {
      if (e.t === 'hit' && !e.onHero) said.push({ t: 'hit', words: e.words || [], x: e.x, y: e.y });
      else if (['mysticSplash', 'bomb', 'bombBurst'].includes(e.t) || (e.t === 'buff' && e.kind === 'arcana')) said.push(JSON.parse(JSON.stringify(e)));
      emit(e);
    };
    const ids = {};
    for (const [kind, ax, dn, role, weak] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = weak ? 1 : 1e7; m.shield = 0;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.speed = 0;
      ids[role] = m.id;
    }
    const t = g.monsters.find((m) => m.id === ids.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return { set, ids, lines: h.skills.map((s) => s.r.lines), r: h.skills.map((s) => ({ id: s.id, mystic: s.r.mystic, arcana: s.r.arcana, bomb: s.r.bomb, splash: s.r.splash, dmgMult: s.r.dmgMult })) };
  }, [cls, weapon, sockets, layout]);
  /** The hero's quick attack at monster `id`, by the game's own rules. */
  const attack = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return 'none';
    h.swingT = 0; h.mana = h.d.maxMana;
    for (const s of h.skills) s.cd = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, id);
  const said = () => page.evaluate(() => window.__said);
  const lifeOf = (id) => page.evaluate((id) => { const m = window.__dbg.game().monsters.find((q) => q.id === id); return m ? m.life : -1; }, id);

  // ---- 1. the mage with the staff: Mystical on the Wave --------------------------------------------
  const staff = await room('mage', 'staff', [[0, 'front', 'mystical'], [0, 'behind', 'mystical']], [['skeleton', 3, 0, 'target']]);
  check('Mystical goes in front of and behind the Wave', staff.set.every((s) => s === 'ok'), staff.set.join(','));
  check('it feeds the Wave: a bigger spell hit, and ARCANA behind', staff.r[0].mystic === true && staff.r[0].arcana > 0, JSON.stringify(staff.r[0]));
  let shown = 0;
  for (let k = 0; k < 6; k++) {
    await attack(staff.ids.target);
    await page.waitForTimeout(700);
    shown = Math.max(shown, await page.evaluate(() => window.__dbg.words3.state.mystic.shown));
    if (k === 2) await snap('arcana_building');
  }
  await page.waitForTimeout(500);
  await snap('full_arcana');
  let s1 = await said();
  const mysticHits = s1.filter((e) => e.t === 'hit' && e.words.includes('mystical'));
  check('the Wave\'s hits carry Mystical, for its look', mysticHits.length >= 3, `${mysticHits.length}`);
  const arcana = s1.filter((e) => e.t === 'buff');
  check('ARCANA builds with each spell blow that lands, to five', arcana.length >= 5 && Math.max(...arcana.map((e) => e.stacks)) === 5, arcana.map((e) => e.stacks).join(','));
  const sweeps = await page.evaluate(() => window.__dbg.words3.state.sweeps.length);
  check('the moon at her shoulder showed it', shown >= 4, `the moon showed ${shown}`);
  const held = await page.evaluate(() => { const h = window.__dbg.game().hero; return { arcana: h.arcana, t: h.arcanaT }; });
  check('the hero holds five stacks', Math.abs(held.arcana - 5 * staff.r[0].arcana) < 0.01, JSON.stringify(held));
  void sweeps;
  await page.waitForTimeout(5600);
  const gone = await page.evaluate(() => ({ arcana: window.__dbg.game().hero.arcana, moon: window.__dbg.words3.state.mystic.shown }));
  check('five seconds after the last, ARCANA and the moon are gone', gone.arcana === 0 && gone.moon === 0, JSON.stringify(gone));
  // Power on the Wave: nothing
  const power = await room('mage', 'staff', [[0, 'front', 'power']], [['skeleton', 3, 0, 'target']]);
  const bare = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const w = h.skills[0].front.indexOf('power');
    h.skills[0].front[w] = null; g.refresh(); const dm = h.skills[0].r.dmgMult;
    h.skills[0].front[w] = 'power'; g.refresh();
    return dm;
  });
  check('Power in front of the Wave does nothing', Math.abs(power.r[0].dmgMult - bare) < 1e-9, `${power.r[0].dmgMult} against ${bare}`);
  check('and its lines say so', power.lines[0].includes('Power: nothing on a spell. Power is for attacks.'), power.lines[0].join(' | '));
  await attack(power.ids.target);
  await page.waitForTimeout(900);
  s1 = await said();
  const powerHits = s1.filter((e) => e.t === 'hit');
  check('its hits do not carry Power (no look of it)', powerHits.length > 0 && powerHits.every((e) => !e.words.includes('power')), `${powerHits.length} hits`);

  // ---- 2. the mage with the wand: the Familiar's splash -------------------------------------------
  const wand = await room('mage', 'wand', [[0, 'front', 'mystical']], [['skeleton', 3.2, 0, 'target'], ['skeleton', 3.2, 0.9, 'beside'], ['skeleton', 3.2, 4.5, 'far']]);
  check('the wand\'s tap is the Familiar, splashing with Mystical', wand.r[0].id === 'familiar' && wand.r[0].splash > 0, JSON.stringify(wand.r[0]));
  await attack(wand.ids.target);
  let caught = false;
  for (let k = 0; k < 30; k++) {
    await page.waitForTimeout(100);
    const links = await page.evaluate(() => window.__dbg.words3.state.links.length);
    if (links > 0 && !caught) { caught = true; await snap('constellation'); }
  }
  const s2 = await said();
  const splashes = s2.filter((e) => e.t === 'mysticSplash');
  const beside = await page.evaluate((ids) => { const g = window.__dbg.game(); const at = (id) => g.monsters.find((m) => m.id === id); return { b: at(ids.beside), f: at(ids.far) }; }, wand.ids);
  check('its bolts splash the one beside what they strike', splashes.some((e) => e.to.some((p) => Math.hypot(p.x - beside.b.x, p.y - beside.b.y) < 0.05)), `${splashes.length} splashes`);
  check('and not the one far off', beside.f.life === beside.f.maxLife, `${beside.f.life}`);
  check('the constellation was drawn', caught);

  // ---- 3. the warrior: Volatile's hidden bomb ------------------------------------------------------
  const vol = await room('warrior', null, [[0, 'front', 'volatile']], [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 1.4, 0.75, 'beside']]);
  check('Volatile in front of Strike: a hidden bomb', vol.r[0].bomb > 0, JSON.stringify(vol.r[0]));
  const lives = [await lifeOf(vol.ids.target), await lifeOf(vol.ids.beside)];
  await attack(vol.ids.target);
  await page.waitForTimeout(450);
  const stuck = await page.evaluate(() => window.__dbg.game().bombs.map((b) => ({ id: b.id, t: b.t, dmg: b.dmg })));
  check('a charge is stuck on the one it hit', stuck.length === 1 && stuck[0].id === vol.ids.target, JSON.stringify(stuck));
  await snap('charge');
  await page.waitForTimeout(700);
  await snap('charge_late');
  await page.waitForTimeout(800);
  const s3 = await said();
  check('it burst', s3.some((e) => e.t === 'bombBurst'), s3.map((e) => e.t).join(','));
  await snap('burst');
  const after = [await lifeOf(vol.ids.target), await lifeOf(vol.ids.beside)];
  check('and hurt the one beside it, which the blow never touched', after[1] < lives[1], `${lives[1]} to ${after[1]}`);
  check('the charges are spent', await page.evaluate(() => window.__dbg.game().bombs.length) === 0);
  // on one the blow kills
  const kill = await room('warrior', null, [[0, 'front', 'volatile']], [['skeleton', 1.25, -0.25, 'target', true], ['skeleton', 1.4, 0.75, 'beside']]);
  const at = await page.evaluate((id) => { const m = window.__dbg.game().monsters.find((q) => q.id === id); return [m.x, m.y]; }, kill.ids.target);
  await attack(kill.ids.target);
  await page.waitForTimeout(2200);
  const s4 = await said();
  const burst = s4.find((e) => e.t === 'bombBurst');
  check('on one the blow kills, it bursts where it fell', !!burst && Math.hypot(burst.x - at[0], burst.y - at[1]) < 0.05, JSON.stringify(burst));
  check('and still hurts the one beside', (await lifeOf(kill.ids.beside)) < 1e7);

  // ---- 4. the bot in a dungeon with the words on --------------------------------------------------
  const dungeon = await page.evaluate(() => {
    const d = window.__dbg; d.run('mage', 404); d.seasoned(12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.depth = 3; g.cleared = 2; g.enterDungeon();
    const h = g.hero;
    const set = [];
    for (const [i, side] of [[0, 'front'], [1, 'behind']]) { h.words.mystical = (h.words.mystical || 0) + 1; set.push(g.socket(i, side, 'mystical') ?? 'ok'); }
    d.bot('mage'); d.speed = 2;
    return set;
  });
  check('a dungeon: Mystical on the mage\'s Wave and Orb', dungeon.every((s) => s === 'ok'), dungeon.join(','));
  let over = false;
  for (let i = 0; i < 160; i++) {
    await page.waitForTimeout(120);
    over = await page.evaluate(() => window.__dbg.game().over);
    if (over) break;
    if (i === 60) await snap('dungeon');
  }
  await page.evaluate(() => { const d = window.__dbg; d.bot(false); d.speed = 1; d.god = false; });
  check('the bot fought on', !over);

  // ---- 5. switched off ----------------------------------------------------------------------------
  check('switched off', await page.evaluate(() => window.__dbg.words4(false)) === false);
  const off = await page.evaluate(() => {
    const d = window.__dbg; d.practice('mage', 7);
    const g = d.game(); const h = g.hero;
    const before = h.skills[0].r.dmgMult;
    h.words.power = (h.words.power || 0) + 1;
    g.socket(0, 'front', 'power');
    return { mystical: h.words.mystical || 0, power: h.skills[0].r.dmgMult / before };
  });
  check('switched off, the practice room hands out no Mystical', off.mystical === 0, `${off.mystical}`);
  check('and Power feeds the Wave again', off.power > 1.2, `${off.power}`);
  check('the switch as the game has it', await page.evaluate((was) => window.__dbg.words4(was), was) === was);
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
