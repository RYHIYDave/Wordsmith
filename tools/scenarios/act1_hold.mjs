// ACT 1, THE DESCENT: A STRONGHOLD OF THE CULT, IN THE GAME (game/act1_holds.ts): its guards, its altar opened
// beside the inventory and words laid in it, its door opened, the hall and its last fight, its reward, and out.
//   node tools/build_to.mjs dist/act1.html
//   DEPTH=6 node tools/playtest.mjs --file dist/act1.html --size 1014x468 --scenario tools/scenarios/act1_hold.mjs --out shots/act1/hold6
// DEPTH: the floor (6 to 10). WORDS: how many words to lay (1 to 3). SEED: the run's (9).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 6);
  const nWords = Number(process.env.WORDS || 2);
  const seed = Number(process.env.SEED || 9);
  await page.evaluate((s) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.seasoned(12);
  }, seed);
  await page.waitForTimeout(600);
  const info = await page.evaluate(([n, k]) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    const q = L.land.holds[0];
    // (the hero's spare words: three to give)
    for (const w of ['fire', 'power', 'swift']) g.hero.words[w] = (g.hero.words[w] || 0) + 1;
    g.hero.x = q.altar.x + 1.2; g.hero.y = q.altar.y + 0.9;
    g.hero.fx = -0.7; g.hero.fy = -0.7;
    const guards = g.monsters.filter((m) => m.packId >= 9100);
    for (const m of guards) m.state = 'sleep';
    return { gate: [q.gx, q.gy], altar: q.altar, guards: guards.map((m) => [m.kind, m.name, m.rarity, m.carries]), words: k };
  }, [depth, nWords]);
  log('hold', JSON.stringify(info));
  await page.waitForTimeout(900);
  await snap('a_yard');
  log('hint', JSON.stringify(await page.evaluate(() => window.__dbg.game().interactHint())));
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(500);
  await snap('b_altar');
  const laid = await page.evaluate((k) => {
    const g = window.__dbg.game();
    const out = [];
    for (const w of ['fire', 'power', 'swift'].slice(0, k)) out.push(g.altarWord(0, w));
    return { out, words: g.level.holds[0].words };
  }, nWords);
  log('laid', JSON.stringify(laid));
  await page.waitForTimeout(300);
  await snap('c_altar_laid');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  log('open', JSON.stringify(await page.evaluate(() => window.__dbg.game().level.holds[0])));
  await snap('d_door_open');
  // (into the door)
  await page.evaluate(([gx, gy]) => { const g = window.__dbg.game(); g.hero.x = gx - 0.5; g.hero.y = gy + 0.4; }, info.gate);
  await page.waitForTimeout(1500);
  const inside = await page.evaluate(() => {
    const g = window.__dbg.game();
    const st = g.level.holds[0];
    const pack = g.monsters.filter((m) => !m.dead && m.packId === st.pack);
    return { hero: [g.hero.x, g.hero.y], entered: st.entered, pack: pack.map((m) => [m.kind, m.name, m.rarity, m.words, m.life]) };
  });
  log('inside', JSON.stringify(inside));
  await snap('e_hall');
  await page.waitForTimeout(1500);
  await snap('f_hall_fight');
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const st = g.level.holds[0];
    for (const m of g.monsters) if (!m.dead && m.packId === st.pack) g.kill(m);
  });
  await page.waitForTimeout(1800);
  log('won', JSON.stringify(await page.evaluate(() => { const g = window.__dbg.game(); return { st: g.level.holds[0], drops: g.drops.map((d) => [d.kind, d.gold]) }; })));
  await snap('g_reward');
  // (out by the threshold)
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const q = g.level.land.holds[0];
    g.hero.x = q.inside.x + q.inside.w / 2; g.hero.y = q.inside.y + q.inside.h - 0.3;
  });
  await page.waitForTimeout(1500);
  log('out', JSON.stringify(await page.evaluate(() => { const g = window.__dbg.game(); return [g.hero.x, g.hero.y]; })));
  await snap('h_out');
}
