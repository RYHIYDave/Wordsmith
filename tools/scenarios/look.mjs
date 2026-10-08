// A quick look at the screens, for whoever is working on them: the starting screen and its pages,
// then a new game (the first dungeon with its prompts), the body, the word, the inventory.
//   node tools/playtest.mjs --scenario tools/scenarios/look.mjs --out shots/look
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(400);
  await snap('01_title_real');
  await page.waitForTimeout(4600);
  await snap('02_title_fade');
  await page.waitForTimeout(1600);
  await snap('03_title_dream');
  await hands.press('button:OPTIONS');
  await page.waitForTimeout(200);
  await snap('04_options');
  await hands.press('button:BACK');
  await hands.press('button:LEXICON');
  await page.waitForTimeout(200);
  await snap('05_lexicon_empty');
  await hands.press('button:x');
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(200);
  await snap('06_classes');
  await hands.press(`class:${cls}`);
  await page.waitForTimeout(900);
  await snap('07_first_dungeon_move');
  log('game', await page.evaluate(() => { const g = window.__dbg.game(); return g ? { town: g.level.town, depth: g.depth, guide: !!g.guide, step: g.guideStep() } : null; }));
  // walk a little, then stand near the first pack
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); d.autoLevel = false;
    g.guide.walked = 99;
    const h = g.hero; const f = g.level.floor;
    let best = null; let bd = 1e9;
    for (const m of g.monsters) { if (m.elite || m.boss) continue; const dd = Math.hypot(m.x - f.start.x, m.y - f.start.y); if (dd < bd) { bd = dd; best = m; } }
    for (let r = 5; r <= 7 && best; r++) for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
      if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && g.sees(x, y, best.x, best.y)) { h.x = x; h.y = y; return; }
    }
  });
  await page.waitForTimeout(700);
  await snap('08_fight_prompt');
  await page.evaluate(() => { const g = window.__dbg.game(); g.guide.quick = true; g.hero.skills[0].uses = 1; g.guide.hits = 2; });
  await page.waitForTimeout(900);
  await snap('09_fight_prompt_dodge');
  // to the body
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const b = g.level.body; const h = g.hero;
    g.guide.slow = g.guide.evade = true; h.skills[1].uses = 1; h.skills[2].uses = 1;
    // (everything near the body, and everything already awake: the pack met for the fight prompt was
    // left alive, and in some dungeons it is near enough, or fast enough (bats), to catch the hero up
    // at the body, where a fight rightly keeps the inventory shut. Seen in Version 12.1's regression.)
    for (const m of g.monsters) if (Math.hypot(m.x - b.x, m.y - b.y) < 14 || m.state !== 'sleep') m.dead = true;
    g.projectiles.length = 0;
    h.life = h.d.maxLife;
    h.x = b.x + 3.2; h.y = b.y + 1.4;
  });
  await page.waitForTimeout(800);
  await snap('10_body');
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.level.body; g.hero.x = b.x + 1.0; g.hero.y = b.y + 0.4; });
  await page.waitForTimeout(500);
  await snap('11_word_stands');
  if (!(await hands.until(() => { const g = window.__dbg.game(); return Object.values(g.hero.words).some((n) => n > 0); }))) console.log('  !! the word was never picked up');
  await page.waitForTimeout(900);
  await snap('12_word_found');
  if (!(await hands.until(() => window.__dbg.panels.open === 'inv', 6000))) console.log('  !! the inventory never opened for the word');
  await page.waitForTimeout(700);
  await snap('13_inventory_coach');
  log('panel', await page.evaluate(() => window.__dbg.panels.open));
  log('marks', (await hands.marks()).join(' '));
  // read the word, then drag it onto the suggested slot
  const w = await page.evaluate(() => { const g = window.__dbg.game(); return Object.keys(g.hero.words).find((k) => g.hero.words[k] > 0); });
  const from = await hands.mark(`word:${w}`);
  const to = await hands.mark(cls === 'ranger' ? 'socket:1:front:0' : 'socket:0:front:0');
  if (from && to) {
    await hands.pressAt(from.x, from.y);
    await page.waitForTimeout(250);
    await snap('13b_inventory_word_read');
    await hands.dragStart(from.x, from.y, to.x, to.y);
    await page.waitForTimeout(250);
    await snap('13c_inventory_dragging');
    await hands.dragEnd();
    await page.waitForTimeout(250);
    await snap('14_inventory_set_flash');
    await page.waitForTimeout(1300);
    await snap('15_inventory_done');
    // the word is only lent to the attack: read it where it sits, carry it to the other attack, and back
    await hands.pressAt(to.x, to.y);
    await page.waitForTimeout(250);
    await snap('16_inventory_set_word_read');
    const other = await hands.mark(cls === 'ranger' ? 'socket:0:front:0' : 'socket:1:front:0');
    await hands.dragStart(to.x, to.y, other.x, other.y);
    await page.waitForTimeout(250);
    await snap('16b_inventory_carrying_it_off');
    await hands.dragEnd();
    await page.waitForTimeout(1500);
    await snap('16c_inventory_moved');
    const moved = await page.evaluate(() => { const g = window.__dbg.game(); return { names: g.hero.skills.map((k) => k.r.name), spare: Object.values(g.hero.words).reduce((a, n) => a + n, 0), step: g.guideStep() }; });
    log('after the move', moved);
    if (moved.spare !== 0 || moved.step !== 'use') console.log('  !! the word carried to the other attack did not land on it');
    await hands.dragAt(other.x, other.y, to.x, to.y);
    await page.waitForTimeout(1500);
    const back = await page.evaluate(() => { const g = window.__dbg.game(); return { names: g.hero.skills.map((k) => k.r.name), spare: Object.values(g.hero.words).reduce((a, n) => a + n, 0), step: g.guideStep() }; });
    log('and back', back);
    if (back.spare !== 0 || back.step !== 'use' || back.names.join() === moved.names.join()) console.log('  !! the word carried back did not land where it came from');
    await hands.press('button:DONE');
    await page.waitForTimeout(1500);
    await snap('17_the_dead_stir');
  } else console.log('  !! no word or slot to drag between');
  log('guide', await page.evaluate(() => { const g = window.__dbg.game(); return { step: g.guideStep(), log: window.__dbg.guideLog.join('>'), risen: g.monsters.filter((m) => m.packId === -7).length }; }));
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
