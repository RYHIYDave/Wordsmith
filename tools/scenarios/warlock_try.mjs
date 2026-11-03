// THE WARLOCK TRIED (game/warlock.ts; a page built with him offered): the class cards; then in the practice room with a few
// skeletons that stand still, his bolt, his curse, his smoke step, his pact filled and a tap on him, the demon's rakes,
// Damning and smoke step, and its burning out. Pictures at each.
//   node tools/playtest.mjs --file dist/warlock.html --scenario tools/scenarios/warlock_try.mjs --out shots/warlock/w
const wait = (page, ms) => page.waitForTimeout(ms);

export default async function (page, snap) {
  const manOnly = process.env.MAN_ONLY === '1';
  // the class cards, four of them
  await page.evaluate(() => window.__dbg.toTitle && window.__dbg.toTitle());
  await wait(page, 600);
  await page.evaluate(() => { const ui = window.__dbg.titleUi; if (ui) ui.page = 'class'; });
  await wait(page, 1500);
  await snap('cards');

  await page.evaluate(() => window.__dbg.practice('warlock', 7));
  await wait(page, 500);
  // still skeletons round him
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.waveT = 1e9;
    g.monsters.length = 0;
    const h = g.hero;
    for (const [dx, dy] of [[3, 0], [4, 1.2], [2.2, -2], [-2.5, 1.5]]) {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.speed = 0;
      m.cd = 1e9;
      m.life = m.maxLife = 1e6;
    }
  });
  await wait(page, 4000);
  await snap('stand');
  const at = (dx, dy) => page.evaluate(([dx, dy]) => window.__dbg.at(window.__dbg.game().hero.x + dx, window.__dbg.game().hero.y + dy), [dx, dy]);
  // his bolt at the one before him
  let p = await at(3, 0);
  await page.mouse.move(p.x, p.y - 8);
  await page.mouse.down();
  await wait(page, 120);
  await page.mouse.up();
  await wait(page, 300);
  await snap('bolt');
  await wait(page, 1200);
  await snap('burning');
  // the curse
  p = await at(1, 0);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down({ button: 'right' });
  await wait(page, 100);
  await page.mouse.up({ button: 'right' });
  await wait(page, 400);
  await snap('curse');
  await wait(page, 1500);
  await snap('cursed');
  // the smoke step
  p = await at(-5, 0);
  await page.mouse.move(p.x, p.y);
  await page.keyboard.press('Space');
  await wait(page, 120);
  await snap('step');
  await wait(page, 1200);
  await snap('stepped');
  // his pact full: his arm blazes; a tap on him
  await page.evaluate(() => { window.__dbg.game().hero.pact = 30; });
  await wait(page, 2500);
  await snap('blaze');
  if (manOnly) return;
  await page.keyboard.press('KeyR');
  await wait(page, 900);
  await snap('change1');
  await wait(page, 900);
  await snap('change2');
  await wait(page, 2500);
  await snap('demon');
  // its rakes, Damning, its smoke step
  p = await at(3, 0);
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(p.x, p.y - 8);
    await page.mouse.down();
    await wait(page, 90);
    await page.mouse.up();
    await wait(page, 450);
  }
  await snap('rakes');
  await page.mouse.down({ button: 'right' });
  await wait(page, 100);
  await page.mouse.up({ button: 'right' });
  await wait(page, 500);
  await snap('damning');
  p = await at(5, 0);
  await page.mouse.move(p.x, p.y);
  await page.keyboard.press('Space');
  await wait(page, 200);
  await snap('dstep');
  await wait(page, 1500);
  // burning out
  await page.evaluate(() => { window.__dbg.game().hero.pact = 0.01; });
  await wait(page, 900);
  await snap('burnout1');
  await wait(page, 1200);
  await snap('burnout2');
  await wait(page, 2500);
  await snap('man');
  const g = await page.evaluate(() => { const h = window.__dbg.game().hero; return { form: h.form, pact: h.pact, skills: h.skills.map((s) => s.id) }; });
  console.log(JSON.stringify(g));
}
