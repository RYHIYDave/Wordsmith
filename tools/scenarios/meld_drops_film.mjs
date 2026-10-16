// RUNEDUST AND THE MELDSTONE DRAWN (art/meld_drops.ts, render/meld_drops.ts, behind MELD_DROPS, off in the
// game): films of them in the game for the owner, a picture every thirtieth of a second of the game's own
// clock (the game is slowed so that the camera keeps up). His words, 16 Oct 2026, 17:40: "Runedust and the
// meldstone need to be done". The switches are thrown for this page only (__dbg.meld, __dbg.handIn,
// __dbg.meldDrops); what happens is the rules' own (the Fleshmancer killed, the drops taken by walking up,
// the Meldstone given by using the wordsmith).
//   node tools/build_to.mjs dist/meld_drops.html
//   SCENE=fall node tools/playtest.mjs --file dist/meld_drops.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/meld_drops_film.mjs --out shots/md/fall
//   env: SCENE = fall (the Fleshmancer dies; his runedust and the Meldstone burst up; then taken)
//              | give (in town: the Meldstone given to the wordsmith; then kept over his slab)
//              | stills (the three heaps and the Meldstone hanging; the screens with runedust)
//        OFF=1: stills with the switch off (the stand-ins: before)
export default async function (page, snap) {
  const scene = process.env.SCENE || 'fall';
  const off = process.env.OFF === '1';
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  const slow = 0.05;
  let c0 = 0;
  let n = 0;
  /** The next picture: the game run on to its moment (a thirtieth of a second after the last), then still while it is taken. */
  const frame = async (name) => {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + n / 30, { polling: 'raf', timeout: 20000 });
    await snap(`${name}_f${String(n).padStart(3, '0')}`);
    n++;
  };
  const where = async (name, x, y) => snap.note(`${name}_where`, await page.evaluate(([x, y]) => window.__dbg.at(x, y), [x, y]));

  await page.evaluate((off) => {
    const d = window.__dbg;
    d.saving(false);
    d.meld(true);
    d.handIn(true);
    d.meldDrops(!off);
  }, off);

  if (scene === 'fall') {
    await page.evaluate(() => { const d = window.__dbg; d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; });
    await page.waitForTimeout(600);
    const ok = await page.evaluate(() => {
      const g = window.__dbg.game();
      g.depth = 5; g.cleared = 4; g.enterDungeon();
      const L = g.level;
      L.explored.fill(1);
      const boss = g.monsters.find((m) => m.kind === 'fleshmancer');
      if (!boss) return false;
      g.monsters = [boss];
      const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
      const gx = s.alongX ? s.a + 1.5 : s.plane;
      const gy = s.alongX ? s.plane : s.a + 1.5;
      const k = Math.hypot(gx - boss.x, gy - boss.y);
      const h = g.hero;
      h.x = boss.x + ((gx - boss.x) / k) * 3.9;
      h.y = boss.y + ((gy - boss.y) / k) * 3.9;
      return true;
    });
    check('the Fleshmancer is in his hall, the hero 3.9 tiles off', ok);
    // (the floor's name and his entrance go by first)
    await page.waitForTimeout(5000);
    const at = await page.evaluate(() => {
      const g = window.__dbg.game();
      const boss = g.monsters.find((m) => m.kind === 'fleshmancer');
      boss.speed = 0; boss.cd = 1e9; boss.moveCd = 1e9;
      return { x: boss.x, y: boss.y };
    });
    await where('fall', at.x, at.y);
    c0 = await page.evaluate(() => window.__dbg.clock());
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const boss = g.monsters.find((m) => m.kind === 'fleshmancer');
      boss.life = 0;
      g.kill(boss);
      // (for this film only his runedust and the Meldstone are left lying: his gold, gear and word are taken away, so they are seen alone)
      g.drops = g.drops.filter((q) => q.kind === 'dust' || q.kind === 'stone');
    });
    const drops = await page.evaluate(() => window.__dbg.game().drops.filter((q) => q.kind === 'dust' || q.kind === 'stone').map((q) => ({ kind: q.kind, age: +q.age.toFixed(2) })));
    check('he drops runedust and the Meldstone, held under the floor while he goes down', drops.length === 2 && drops.every((q) => q.age < -2), JSON.stringify(drops));
    // his death (3.0 s), the Meldstone and the runedust bursting up, and hanging: 6 s
    for (let i = 0; i < 180; i++) await frame('fall');
    const lying = await page.evaluate(() => window.__dbg.game().drops.filter((q) => q.kind === 'dust' || q.kind === 'stone').map((q) => ({ kind: q.kind, age: +q.age.toFixed(2), x: q.x, y: q.y })));
    check('both lie there, not taken', lying.length === 2, JSON.stringify(lying));
    // TAKEN: the hero steps up to them (a cut), and they come to him
    const st = lying.find((q) => q.kind === 'stone');
    // (first just out of their reach, till the camera has come to him; then a step nearer, and they come to him)
    await page.evaluate((st) => {
      const g = window.__dbg.game();
      const h = g.hero;
      h.x = st.x - 2.8; h.y = st.y + 2.0;
      window.__dbg.slowmo = 1;
    }, st);
    await page.waitForTimeout(1500);
    await page.evaluate(() => { window.__dbg.slowmo = 1e-6; });
    const still = await page.evaluate(() => window.__dbg.game().drops.filter((q) => q.kind === 'dust' || q.kind === 'stone').length);
    check('out of their reach, both still lie there', still === 2, still);
    await page.evaluate((st) => {
      const g = window.__dbg.game();
      const h = g.hero;
      h.x = st.x - 2.2; h.y = st.y + 1.6;
    }, st);
    await where('take', st.x - 2.2, st.y + 1.6);
    n = 0;
    c0 = await page.evaluate(() => window.__dbg.clock());
    for (let i = 0; i < 75; i++) await frame('take');
    const got = await page.evaluate(() => { const g = window.__dbg.game(); return { dust: g.hero.dust, meld: g.hero.meld, left: g.drops.filter((q) => q.kind === 'dust' || q.kind === 'stone').length }; });
    check('taken: the runedust counted, the Meldstone carried', got.dust >= 3 && got.meld === 'stone' && got.left === 0, JSON.stringify(got));
    await snap('take_carried');
  }

  if (scene === 'give') {
    await page.evaluate(() => {
      const d = window.__dbg; d.run('warrior', 31); d.seasoned(8); d.autoLevel = false; d.autoWords = false;
      const g = d.game(); g.depth = 6; g.cleared = 5;
      const h = g.hero; h.meld = 'stone'; h.dust = 3;
    });
    await page.waitForTimeout(600);
    const at = await page.evaluate(() => {
      const g = window.__dbg.game();
      const st = g.level.stations.find((s) => s.kind === 'wordsmith');
      const slab = g.level.props.find((p) => p.kind === 'runeSlab');
      const h = g.hero;
      // (beside him, to the side of his slab, so as not to stand in front of it)
      h.x = st.x + 1.5; h.y = st.y - 0.6; h.fx = -0.7; h.fy = 0.7;
      return { near: g.stationNear(), slab: { x: slab.x, y: slab.y }, hero: { x: h.x, y: h.y }, give: g.handInNear() };
    });
    check('beside the wordsmith with the Meldstone: his prompt is to give it', at.near === 'wordsmith' && at.give === 'meldstone', JSON.stringify(at));
    await page.waitForTimeout(1500);
    await snap('give_before');
    await where('give', at.slab.x, at.slab.y);
    c0 = await page.evaluate(() => window.__dbg.clock());
    // given: by using him (the rules' own hand-in)
    const given = await page.evaluate(() => { const g = window.__dbg.game(); const r = g.handIn(); return { r, meld: g.hero.meld, meta: g.meta.meld }; });
    check('given: he can meld now', given.r && given.meld === 'open', JSON.stringify(given));
    for (let i = 0; i < 120; i++) await frame('give');
  }

  if (scene === 'stills') {
    const tag = off ? 'before' : 'after';
    await page.evaluate(() => {
      const d = window.__dbg; d.practice('warrior', 5); d.autoLevel = false; d.autoWords = false;
      const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
      const h = g.hero; h.x = 14.5; h.y = 15.5;
      // the three heaps (1, 3 and 6 runedust) and the Meldstone, laid as if long dropped
      g.drops.length = 0;
      g.drops.push({ x: h.x + 2.2, y: h.y - 1.6, kind: 'dust', gold: 1, item: null, word: null, age: 9 });
      g.drops.push({ x: h.x + 2.9, y: h.y - 0.6, kind: 'dust', gold: 3, item: null, word: null, age: 9 });
      g.drops.push({ x: h.x + 3.6, y: h.y + 0.4, kind: 'dust', gold: 6, item: null, word: null, age: 9 });
      g.drops.push({ x: h.x + 1.2, y: h.y - 2.6, kind: 'stone', gold: 0, item: null, word: null, age: 9 });
      h.x -= 1.5; h.y += 1.5;
    });
    await page.waitForTimeout(1500);
    await snap(`stills_${tag}_floor`);
    for (let i = 1; i <= 3; i++) { await page.waitForTimeout(170); await snap(`stills_${tag}_floor_${i}`); }
    await page.evaluate(() => { const g = window.__dbg.game(); g.drops.length = 0; g.hero.dust = 7; g.hero.meld = 'open'; });
    await page.evaluate(() => window.__dbg.inv(0));
    await page.waitForTimeout(500);
    await snap(`stills_${tag}_inventory`);
  }
}
