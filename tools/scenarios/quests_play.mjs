// THE QUESTS OF FLOORS 6 TO 20 IN PLAY (Version 25.3.18: game/quests610.ts MUSTER, game/quests1115.ts, game/quests1620.ts), in a
// real browser on the page as published: each quest's moments played through by the game's own rules (__dbg), the page drawing
// all the while. Lines marked !! are problems.
//   node tools/playtest.mjs --serve --file dist/wrapped.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/quests_play.mjs --out shots/quests/p
export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  const bad = (msg) => console.log('  !!', msg);
  const ev = (fn, arg) => page.evaluate(fn, arg);
  const say = (s) => console.log('  ' + s);
  const run = async (secs) => {
    for (let i = 0; i < Math.round(secs / 0.25); i++) {
      await ev(() => {
        const g = window.__dbg.game();
        g.hero.life = g.hero.d.maxLife;
      });
      await page.waitForTimeout(250);
    }
  };
  await ev(() => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', 5);
    D.seasoned(25);
    D.god = true;
  });
  await page.waitForTimeout(1500);

  // FLOOR 7: a stronghold won drops a page of the muster roll
  const roll = await ev(() => {
    const D = window.__dbg;
    const g = D.game();
    g.hero.feather = 'asked';
    g.depth = 7;
    g.cleared = 6;
    g.wayDepth = 7;
    g.enterDungeon();
    const st = g.level.holds?.[0];
    if (!st) return 'no stronghold';
    st.entered = true;
    st.wave = 1000;
    g.monsters = [];
    for (let i = 0; i < 60; i++) g.update(1 / 30, { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false });
    return g.drops.filter((d) => d.kind === 'quest' && d.thing === 'roll').length;
  });
  if (roll !== 1) bad(`floor 7's stronghold won: a muster roll page dropped? ${roll}`);
  else say('floor 7: a stronghold won drops a page of the muster roll');
  await run(1);
  await snap('1_muster_roll_page');

  // FLOOR 12: the Crier's jar and the captain's jar, walked up to
  const jars = await ev(() => {
    const D = window.__dbg;
    const g = D.game();
    g.hero.jar = 'asked';
    D.high(true, 12);
    g.monsters = [];
    const both = g.level.props.filter((p) => p.name === "the jar of the Crier's voice");
    return both.map((p) => ({ x: p.x, y: p.y, v: p.variant }));
  });
  if (jars.length !== 2) bad(`floor 12: two jars, the Crier's and the captain's? ${jars.length}`);
  for (const j of jars) {
    await ev((j) => {
      const g = window.__dbg.game();
      g.hero.x = j.x + 0.2;
      g.hero.y = j.y + 0.5;
    }, j);
    await run(0.75);
  }
  const got12 = await ev(() => {
    const h = window.__dbg.game().hero;
    return { jar: h.jar, captain: h.captainJar, line: window.__dbg.game().speakTo?.who };
  });
  if (got12.jar !== 'got' || got12.captain !== 'got') bad(`floor 12: both jars taken? ${JSON.stringify(got12)}`);
  else say(`floor 12: both jars taken; the quest line points at the ${got12.line}`);
  await snap('2_floor12_jars_taken');

  // FLOORS 17 AND 18: the Prince's key, the Queen's spring
  for (const [depth, kind, thing] of [[17, 'prince', 'key'], [18, 'gqueen', 'spring']]) {
    const n = await ev(([depth, kind, thing]) => {
      const D = window.__dbg;
      const g = D.game();
      D.high(true, depth);
      const b = g.monsters.find((m) => m.kind === kind && m.boss);
      if (!b) return -1;
      g.kill(b);
      g.monsters = [];
      g.drops = g.drops.filter((q) => q.kind !== 'word');
      const d = g.drops.find((q) => q.kind === 'quest' && q.thing === thing);
      if (!d) return 0;
      g.hero.x = d.x;
      g.hero.y = d.y;
      return 1;
    }, [depth, kind, thing]);
    if (n !== 1) bad(`floor ${depth}: the ${kind} dropped the ${thing}? ${n}`);
    await run(1);
  }
  const parts = await ev(() => window.__dbg.game().hero.birdParts);
  if (parts !== 3) bad(`the key and the spring taken? birdParts ${parts}`);
  else say('floors 17 and 18: the songbird\'s key and spring taken');
  await snap('3_key_and_spring_taken');

  // FLOOR 19: the knight-captain given his voice; the King fallen, the songbird taken; the way on, home
  const cap = await ev(() => {
    const D = window.__dbg;
    const g = D.game();
    D.high(true, 19);
    const c = g.level.captain;
    if (!c) return 'no captain';
    const knights = g.monsters.filter((m) => m.kind === 'kknight').length;
    g.hero.x = c.x + 1.2;
    g.hero.y = c.y + 0.6;
    const items = g.drops.filter((d) => d.kind === 'item').length;
    g.captainUsed();
    return { knights, left: g.monsters.filter((m) => m.kind === 'kknight').length, gift: g.drops.filter((d) => d.kind === 'item').length - items, jar: g.hero.captainJar };
  });
  if (typeof cap === 'string' || cap.left !== 0 || cap.gift !== 1 || cap.jar !== 'given') bad(`floor 19: the captain's voice given? ${JSON.stringify(cap)}`);
  else say(`floor 19: the captain spoke; ${cap.knights} knights stood down; his gift dropped`);
  await run(1);
  await snap('4_captain_spoke');
  const bird = await ev(() => {
    const g = window.__dbg.game();
    const k = g.monsters.find((m) => m.kind === 'gking');
    if (!k) return 'no king';
    g.kill(k);
    g.monsters = [];
    // (no word left lying: one walked over opens the bag over the game, which stops it)
    g.drops = g.drops.filter((d) => d.kind !== 'word');
    return g.birdSpot() ? 'ok' : 'no bird to take';
  });
  if (bird !== 'ok') bad(`floor 19: ${bird}`);
  // (the King's fall played out: his death, the bird winding itself up and singing; then walked up to)
  await run(4);
  const near = await ev(() => {
    const g = window.__dbg.game();
    const b = g.birdSpot();
    if (b) {
      g.hero.x = b.x + 0.2;
      g.hero.y = b.y + 0.4;
    }
    return b ? 'by the bird' : `no bird: ${g.monsters.filter((m) => !m.dead).map((m) => m.kind).join(',')} depth ${g.depth} town ${!!g.level.town}`;
  });
  say(`floor 19: ${near}`);
  await run(1.5);
  const shut = await ev(() => {
    const g = window.__dbg.game();
    const parts = g.hero.birdParts;
    g.drops = [];
    g.takeWay('on');
    return { parts, town: !!g.level.town, depth: g.depth };
  });
  if (shut.parts !== 7 || !shut.town) bad(`floor 19: the bird taken (${shut.parts}), and the way on home (town ${shut.town})?`);
  else say('floor 19: the songbird taken; the way on takes him home, the tower shut');
  await run(1.5);
  await snap('5_tower_shut');

  // THE CAMP: the songbird mended; the whole court
  const camp = await ev(() => {
    const g = window.__dbg.game();
    g.hero.clapper = 'given';
    const a = g.level.stations.find((q) => q.kind === 'armourer');
    g.hero.x = a.x;
    g.hero.y = a.y + 1;
    const due = g.handInNear();
    g.handIn();
    g.hero.court = 'asked';
    g.hero.cards = { princess: 1, prince: 1, queen: 1, king: 1 };
    const s = g.level.stations.find((q) => q.kind === 'stranger');
    g.hero.x = s.x;
    g.hero.y = s.y + 1;
    const due2 = g.handInNear();
    g.handIn();
    return { due, bird: g.hero.bird, way: g.wayDepth, due2, court: g.hero.court };
  });
  if (camp.bird !== 'mended' || camp.way < 20 || camp.court !== 'given') bad(`the camp: ${JSON.stringify(camp)}`);
  else say(`the camp: the armourer mended the songbird (waypoint to ${camp.way}); the stranger took the whole court`);
  await run(1.5);
  await snap('6_camp');

  // FLOOR 20: the Moth's fight, the song
  const song = await ev(() => {
    const D = window.__dbg;
    const g = D.game();
    D.high(true, 20);
    const m = g.monsters.find((q) => q.kind === 'moth');
    if (!m) return 'no moth';
    g.monsters = [m];
    g.hero.x = m.x + 3;
    g.hero.y = m.y + 1;
    if (!g.songReady()) return 'the song not ready';
    g.sing();
    return m.stunT > 0 && !g.songReady() ? 'ok' : `stun ${m.stunT}`;
  });
  if (song !== 'ok') bad(`floor 20: ${song}`);
  else say('floor 20: the songbird sang; the Moth stunned; once this phase');
  await run(2);
  await snap('7_the_song');

  if (errs.length) for (const e of errs.slice(0, 5)) bad(`page error: ${e.slice(0, 300)}`);
  else say('no page errors');
}
