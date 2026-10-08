// The heroes' pictures in the game itself: the class cards, then each hero in the town (an open,
// quiet place) walking, standing and attacking in all four directions.
//   CLS=warrior node tools/playtest.mjs --size 1920x1080 --scenario tools/scenarios/heroes.mjs --out shots/heroes
// Set CLS to one class, or leave it out for all three. CARDS=0 skips the class cards.
// TWO=1 shows the warrior with a great sword in both hands.
import { makeHands, log } from './lib.mjs';

const DIRS = [
  ['front_right', ['KeyS', 'KeyD'], [1, 0.5]],
  ['back_right', ['KeyW', 'KeyD'], [1, -0.5]],
  ['front_left', ['KeyS', 'KeyA'], [-1, 0.5]],
  ['back_left', ['KeyW', 'KeyA'], [-1, -0.5]],
];

export default async function (page, snap) {
  const only = process.env.CLS || '';
  const hands = await makeHands(page);
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(300);
  if (process.env.CARDS !== '0') {
    await hands.press('button:NEW GAME');
    await page.waitForTimeout(400);
    await snap('cards');
    const m = await hands.mark('class:warrior');
    if (m && !(await page.evaluate(() => window.__dbg.screen.touch))) {
      const c = await page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [m.x, m.y]);
      await page.mouse.move(c.x, c.y);
      await page.waitForTimeout(300);
      await snap('cards_hover');
    }
  }
  for (const cls of ['warrior', 'ranger', 'mage']) {
    if (only && only !== cls) continue;
    // the practice room, with no monsters walking in: an open hall and nothing to bump into
    await page.evaluate(([c, two]) => {
      const d = window.__dbg; d.practice(c, 11); d.autoLevel = false; d.autoWords = false;
      const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
      // (the figure follows the weapon: show the one asked for)
      const m = g.hero.gear.mainhand;
      if (m && c === 'warrior') { m.hands = two ? 2 : 1; m.weapon = two ? 'greatsword' : 'sword'; }
    }, [cls, process.env.TWO === '1']);
    await page.waitForTimeout(900);
    const centre = await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; const p = d.at(h.x, h.y); return d.screen.toClient(p.x, p.y); });
    for (const [name, keys, dir] of DIRS) {
      for (const k of keys) await page.keyboard.down(k);
      await page.waitForTimeout(260);
      await snap(`${cls}_${name}_walk_a`);
      await page.waitForTimeout(190);
      await snap(`${cls}_${name}_walk_b`);
      for (const k of keys) await page.keyboard.up(k);
      await page.waitForTimeout(450);
      await snap(`${cls}_${name}_idle`);
      // an attack that way: the picture is taken a moment after the press, and again later in the swing
      const c = await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; const p = d.at(h.x, h.y); return d.screen.toClient(p.x, p.y); });
      await page.keyboard.down('ShiftLeft');
      await page.mouse.move(c.x + dir[0] * 160, c.y - 20 + dir[1] * 160);
      await page.mouse.down();
      await page.waitForTimeout(40);
      await snap(`${cls}_${name}_attack_a`);
      await page.waitForTimeout(90);
      await snap(`${cls}_${name}_attack_b`);
      await page.mouse.up();
      await page.keyboard.up('ShiftLeft');
      await page.waitForTimeout(500);
    }
    // the slow attack (right button) and the evasive move (space), toward screen-right and down
    {
      const c = await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; const p = d.at(h.x, h.y); return d.screen.toClient(p.x, p.y); });
      await page.mouse.move(c.x + 150, c.y + 60);
      await page.mouse.down({ button: 'right' });
      await page.waitForTimeout(30);
      await snap(`${cls}_slow_a`);
      await page.waitForTimeout(80);
      await snap(`${cls}_slow_b`);
      await page.waitForTimeout(90);
      await snap(`${cls}_slow_c`);
      await page.mouse.up({ button: 'right' });
      await page.waitForTimeout(700);
      await page.keyboard.down('Space');
      await page.waitForTimeout(50);
      await snap(`${cls}_evade_a`);
      await page.waitForTimeout(90);
      await snap(`${cls}_evade_b`);
      await page.keyboard.up('Space');
      await page.waitForTimeout(600);
    }
    log(cls, await page.evaluate(() => { const g = window.__dbg.game(); return { practice: g.practice, anim: g.hero.anim, uses: g.hero.skills.map((s) => s.uses) }; }));
    void centre;
  }
}
