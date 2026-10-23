// THE WAYS BETWEEN THE FLOORS, A FILM FROM THE GAME (game/ways.ts EXITS, off; turned on here): a new game in town, the
// wordsmith's quest, down the stairs to floor 1; floor 4's wall giving way and into the cave; out of floor 5's mouth; the
// ride up into the town; the gate unbarred and out to the Quarry. Frames as it plays, slowed (<out>_<part>_f0000.png ...),
// for a video put together after. Not a test.
//   node tools/playtest.mjs --file dist/exits.html --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/exits_film.mjs --out shots/exits/film/x
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED) || 5;
  const SLOW = Number(process.env.SLOW) || 0.35;
  const hands = await makeHands(page);
  let part = 'a';
  let n = 0;
  const frame = async () => snap(`${part}_f${String(n++).padStart(4, '0')}`);
  const rec = async (ms, until = null) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      await frame();
      if (until && (await page.evaluate(until))) break;
    }
  };
  const quiet = () => page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
  const slow = (k) => page.evaluate((k) => { window.__dbg.slowmo = k; }, k);
  const filmHas = (key) => page.evaluate((k) => !!window.__dbg.painter.filmOf(k), key);
  const waitFilm = async (key, secs) => {
    for (let k = 0; k < secs; k++) {
      if (await filmHas(key)) return k;
      await page.waitForTimeout(1000);
    }
    return -1;
  };
  const tapAt = async (x, y, up = 0) => {
    const p = await page.evaluate(([x, y]) => window.__dbg.at(x, y), [x, y]);
    await hands.pressAt(p.x, p.y - up);
  };
  // ---- 1. A NEW GAME, IN TOWN: the wordsmith's quest, and down the stairs ----
  await page.evaluate((s) => {
    const d = window.__dbg;
    d.exits.on = true;
    d.saving(false);
    d.first('warrior', s);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
  }, seed);
  log('town:ways', await waitFilm('town:ways:x', 20));
  await slow(SLOW);
  await rec(2500);
  const smith = await page.evaluate(() => window.__dbg.game().level.stations.find((s) => s.kind === 'wordsmith'));
  await tapAt(smith.x, smith.y, 14);
  await rec(14000, () => window.__dbg.game().questGiven);
  await rec(4500);
  log('quest given', await page.evaluate(() => window.__dbg.game().questGiven));
  const st = await page.evaluate(() => { const s = window.__dbg.game().level.ways.stair; return { x: s.x + 1.5, y: s.y + 1 }; });
  await tapAt(st.x, st.y);
  await rec(16000, () => !window.__dbg.game().level.town);
  await slow(1);
  log('floor 1 films', await waitFilm('up:1:x', 15), await waitFilm('up:1:y', 1));
  await slow(SLOW);
  await rec(5000);
  log('floor 1', await page.evaluate(() => ({ depth: window.__dbg.game().depth, town: window.__dbg.game().level.town })));
  // ---- 2. FLOOR 4: the boss falls, the wall gives way, into the cave ----
  part = 'b';
  n = 0;
  await slow(1);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    // (as a hero who brought the wordsmith his stone on the way: his ring lit; no level waiting to be chosen)
    g.hero.ring = true;
    g.hero.pending = 0;
    // (and the new player's lessons over: they are not what this film is of)
    g.guide = null;
    g.depth = 4; g.cleared = 3; g.wayDepth = 4; g.enterDungeon();
    g.level.explored.fill(1);
    const s = g.level.ways.cave.spot;
    const mid = s.alongX ? { x: s.a + 1.5, y: s.plane } : { x: s.plane, y: s.a + 1.5 };
    g.hero.x = s.alongX ? mid.x + 0.6 : mid.x + 3.4;
    g.hero.y = s.alongX ? mid.y + 3.4 : mid.y + 0.6;
    g.hero.fx = -0.7071; g.hero.fy = -0.7071;
    for (const m of g.monsters) if (!m.boss) m.life = 0;
  });
  log('cave film', await waitFilm(await page.evaluate(() => `cave:${window.__dbg.game().level.ways.cave.spot.alongX ? 'x' : 'y'}`), 200));
  await quiet();
  await slow(SLOW);
  await rec(1500);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const boss = g.monsters.find((m) => m.boss);
    boss.x = g.hero.x + 2.2; boss.y = g.hero.y + 2.2;
    g.bossReady();
    g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
  });
  await rec(16000, () => window.__dbg.game().level.ways.cave.state === 'open');
  await rec(2500);
  // (into the mouth)
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const s = g.level.ways.cave.spot;
    g.hero.fx = s.alongX ? 0 : -1; g.hero.fy = s.alongX ? -1 : 0;
  });
  // (up the screen and to the right is toward lesser y: W and D; toward lesser x, W and A)
  const along = await page.evaluate(() => window.__dbg.game().level.ways.cave.spot.alongX);
  await page.keyboard.down('KeyW');
  await page.keyboard.down(along ? 'KeyD' : 'KeyA');
  await rec(8000, () => window.__dbg.game().depth === 5);
  await page.keyboard.up('KeyW');
  await page.keyboard.up(along ? 'KeyD' : 'KeyA');
  if ((await page.evaluate(() => window.__dbg.game().depth)) !== 5) {
    log('walked in', 'no: put into the mouth');
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const s = g.level.ways.cave.spot;
      g.hero.x = s.alongX ? s.a + 1.5 : s.plane - 0.5;
      g.hero.y = s.alongX ? s.plane - 0.5 : s.a + 1.5;
    });
    await rec(6000, () => window.__dbg.game().depth === 5);
  }
  log('floor 5', await page.evaluate(() => window.__dbg.game().depth));
  // ---- 3. FLOOR 5: out of the cave's other end ----
  part = 'c';
  n = 0;
  await slow(1);
  log('mouth film', await waitFilm(await page.evaluate(() => `mouth:${window.__dbg.game().level.ways.mouth.alongX ? 'x' : 'y'}`), 30));
  await quiet();
  await slow(SLOW);
  await rec(4000);
  // ---- 4. THE RIDE UP, INTO THE TOWN'S CORNER ----
  part = 'd';
  n = 0;
  await slow(1);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const m of g.monsters) if (!m.boss) m.life = 0;
    const boss = g.monsters.find((m) => m.boss);
    g.bossReady();
    g.damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
  });
  await page.waitForTimeout(9000);
  await page.evaluate(() => { window.__dbg.game().hero.pending = 0; });
  log('shaft up film', await waitFilm('shaft:up', 120));
  await quiet();
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const sh = g.level.ways.shaft;
    g.hero.x = sh.x + 0.5; g.hero.y = sh.y + 0.5;
  });
  await slow(SLOW);
  await rec(30000, () => { const g = window.__dbg.game(); return g.level.town && g.level.ways.shaft.state === 'still'; });
  await rec(1500);
  // ---- 5. THE GATE UNBARRED, AND OUT TO THE QUARRY ----
  part = 'e';
  n = 0;
  await page.evaluate(() => { window.__dbg.game().hero.pending = 0; });
  const gate = await page.evaluate(() => { const L = window.__dbg.game().level; const s = L.stations.find((q) => q.kind === 'gate'); return { x: s.x, y: s.y }; });
  await tapAt(gate.x, gate.y, 10);
  await rec(40000, () => window.__dbg.game().depth === 6);
  await rec(3000);
  log('end', await page.evaluate(() => ({ depth: window.__dbg.game().depth, town: window.__dbg.game().level.town })));
}
