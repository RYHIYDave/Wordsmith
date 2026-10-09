// THE SKILL TREES (game/talents.ts, `TALENTS.on`, OFF in the game until the owner has seen pictures
// and said yes): this playtest switches them on for itself. For each class, a hero at level 30 (six
// points) with four talents taken; the inventory's TALENTS page:
//   1. the tree with nothing being read;
//   2. a talent that can be taken now, read on its card, with TAKE;
//   3. TAKE pressed: it is taken, lit, and the points go down by one;
//   4. a talent whose way is not open yet, read: the card says why.
//   node tools/playtest.mjs --file <page> [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/talents_look.mjs --out shots/talents/pc
import { log, makeHands } from './lib.mjs';

const BUILDS = {
  mage: { taken: ['kindling', 'searing', 'flamewarp', 'charged'], take: 'fuel', shut: 'shatter' },
  ranger: { taken: ['fleet', 'windrunner', 'quickdraw', 'longshot'], take: 'lightstep', shut: 'farsight' },
  warrior: { taken: ['bloodlust', 'fury', 'battlerush', 'cleave'], take: 'earthshaker', shut: 'unbreakable' },
};

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  const hands = await makeHands(page);
  const only = process.env.CLS ? [process.env.CLS] : Object.keys(BUILDS);
  for (const cls of only) {
    const b = BUILDS[cls];
    await page.evaluate(([cls, taken]) => {
      const d = window.__dbg;
      d.saving(false);
      d.talents.on = true;
      d.run(cls, 21);
      d.seasoned(30);
      const g = d.game();
      d.autoLevel = false; d.autoWords = false;
      g.hero.pending = 0;
      g.hero.talents = [...taken];
      g.refresh();
      d.inv();
      d.invUi.page = 'talents';
      d.invUi.talents.sel = null;
    }, [cls, b.taken]);
    await page.waitForTimeout(500);
    await snap(`${cls}_1_tree`);
    const st = () => page.evaluate(() => {
      const d = window.__dbg; const g = d.game();
      const marks = [...d.ui.marks.keys()];
      return { taken: [...g.hero.talents], left: g.talentsLeft(), stones: marks.filter((m) => m.startsWith('talent:')).length, card: marks.includes('talent-card'), take: marks.includes('button:TAKE'), page: d.invUi.page, d: { fire: g.hero.d.stats.firePct, light: g.hero.d.stats.lightPct, move: g.hero.d.stats.moveSpeed, atk: g.hero.d.stats.atkSpeed, dmg: g.hero.d.stats.dmgPct } };
    });
    let s = await st();
    check(`${cls}: 1. the TALENTS page, fifteen talents, two points to spend`, s.page === 'talents' && s.stones === 15 && s.left === 2, `${s.stones} stones, ${s.left} left`);
    // 2. a talent that can be taken now, pressed and read
    await hands.press(`talent:${b.take}`);
    await page.waitForTimeout(300);
    await snap(`${cls}_2_read`);
    s = await st();
    check(`${cls}: 2. ${b.take} read on its card, with TAKE`, s.card && s.take);
    // 3. TAKE
    await hands.press('button:TAKE');
    await page.waitForTimeout(160);
    await snap(`${cls}_3_taken`);
    await page.waitForTimeout(700);
    s = await st();
    check(`${cls}: 3. taken, one point left`, s.taken.includes(b.take) && s.left === 1, `${s.taken.join(', ')}; ${s.left} left`);
    // 4. a talent whose way is not open
    await hands.press(`talent:${b.shut}`);
    await page.waitForTimeout(300);
    await snap(`${cls}_4_shut`);
    s = await st();
    check(`${cls}: 4. ${b.shut} read, no TAKE (its way is not open)`, s.card && !s.take);
    log(`${cls}: what the steps taken add`, JSON.stringify(s.d));
    // (closed, and the switch put back)
    await page.evaluate(() => { const d = window.__dbg; d.invUi.talents.sel = null; });
  }
  await page.evaluate(() => { window.__dbg.talents.on = false; });
  log('talents', fails ? `${fails} thing(s) wrong` : 'all as they should be');
}
