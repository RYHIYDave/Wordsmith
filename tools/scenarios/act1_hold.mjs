// ACT 1, THE DESCENT: A STRONGHOLD OF THE CULT, IN THE GAME (game/act1_holds.ts): its guards, its altar opened
// beside the inventory and words laid in it, its door opened, the hall and its last fight (with HOLD_WAVES, its five waves, each killed in turn), its reward, and out.
//   node tools/build_to.mjs dist/act1.html
//   DEPTH=6 node tools/playtest.mjs --file dist/act1.html --size 1014x468 --scenario tools/scenarios/act1_hold.mjs --out shots/act1/hold6
// DEPTH: the floor (6 to 10). WORDS: how many words to lay (1 to 3). SEED: the run's (9).
import { log, makeHands } from './lib.mjs';

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
  const hint = await page.evaluate(() => window.__dbg.game().interactHint());
  log('hint', JSON.stringify(hint));
  // (with fingers, as a phone has it: the prompt tapped; with keys, E)
  const hands = await makeHands(page);
  if (await hands.mark(`button:${hint}`)) await hands.press(`button:${hint}`);
  else await page.keyboard.press('KeyE');
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
  if (await hands.mark('button:OPEN THE DOOR')) await hands.press('button:OPEN THE DOOR');
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  const opened = await page.evaluate(() => window.__dbg.game().level.holds[0]);
  log('open', JSON.stringify(opened));
  if (!opened.open) log('!! the door did not open');
  // (ALTAR_GOES, on since his yes of 17 Oct: the altar is gone once the door is open)
  const altar = await page.evaluate(() => {
    const g = window.__dbg.game(); const q = g.level.land.holds[0];
    return { on: window.__dbg.looks.ALTAR_GOES.on, there: g.level.props.some((p) => p.kind === 'piece' && p.name === 'the altar of the words' && p.tx === q.gx && p.ty === q.gy + 1) };
  });
  log('altar', JSON.stringify(altar));
  if (altar.on && altar.there) log('!! the altar still stands with the door open');
  await snap('d_door_open');
  // (into the door)
  await page.evaluate(([gx, gy]) => { const g = window.__dbg.game(); g.hero.x = gx - 0.5; g.hero.y = gy + 0.4; }, info.gate);
  await page.waitForTimeout(1500);
  // (who is in the hall: its old one pack, or, with HOLD_WAVES, the packs of its wave)
  const hall = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const st = g.level.holds[0];
    const ids = [st.pack, ...(st.packs ?? [])];
    const pack = g.monsters.filter((m) => !m.dead && ids.includes(m.packId));
    return { hero: [g.hero.x, g.hero.y], entered: st.entered, wave: st.wave ?? 0, won: !!st.won, pack: pack.map((m) => [m.kind, m.name, m.rarity, m.words, m.life]) };
  });
  const inside = await hall();
  log('inside', JSON.stringify(inside));
  if (!inside.entered) log('!! not in the hall');
  if (!inside.pack.length) log('!! no one in the hall');
  if (!inside.wave && inside.pack.length !== 4) log(`!! the hall's pack is ${inside.pack.length}, not 4`);
  await snap('e_hall');
  await page.waitForTimeout(1500);
  await snap('f_hall_fight');
  // (every one in the hall killed, wave after wave, until it falls)
  let seen = [];
  for (let i = 0; i < 8; i++) {
    const now = await hall();
    if (now.won) break;
    if (now.wave) seen.push(now.wave);
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const st = g.level.holds[0];
      const ids = [st.pack, ...(st.packs ?? [])];
      for (const m of g.monsters) if (!m.dead && ids.includes(m.packId)) g.kill(m);
    });
    // (the next wave comes 2 s after the last is dead)
    await page.waitForTimeout(2800);
    if (i === 1) await snap('f2_wave');
  }
  seen = [...new Set(seen)];
  log('waves', JSON.stringify(seen));
  if (inside.wave && seen.length !== 5) log(`!! waves seen ${seen.join(',')}, not 1 to 5`);
  await page.waitForTimeout(600);
  const won = await page.evaluate(() => { const g = window.__dbg.game(); return { st: g.level.holds[0], drops: g.drops.map((d) => [d.kind, d.gold]) }; });
  log('won', JSON.stringify(won));
  if (!won.st.won) log('!! the stronghold did not fall');
  if (!won.drops.some((d) => d[0] === 'dust')) log('!! no runedust in its reward');
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
