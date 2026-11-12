// WHAT THE UNIQUE ITEMS SHOW IN PLAY (render/unique_fx.ts UNIQUE_PLAY, switched on for this page only, with UNIQUES): the
// practice room's hero wearing one, a few enemies set by him, pictures taken as it works. For a look, and for his pictures.
//   node tools/build_to.mjs dist/uniques_play.html
//   LOOK=tome node tools/playtest.mjs --file dist/uniques_play.html --size 852x393 --dpr 3 --touch \
//     --scenario tools/scenarios/uniques_play_look.mjs --out shots/uniques_play/tome
// LOOK: tome (The Restless Tome, the Warlock), risen (The Fleshmancer's Brand, the Warrior), globe (The Fourth Globe, the
// Brawler), arm (The Drowned Arm, the Warrior), talons (The Queen's Talons, the Ranger), wrench (The Sticky Wrench, the Tinkerer), wind (The
// Windcutter, the Warrior: three Strikes in a row, twice), moth (The Moth's Wing, the Warrior: struck, a word of his goes dark). PLAY=off: the same as the build shows it today (its stand-ins). ELITE: the kind of the elite he kills (risen).
// STAGE=1 (risen, with FILM): the elite set two tiles off and struck dead with no swing of his, so its rising is seen clear.
// FILM=<seconds>: a film of it in place of the stills, frame by frame (30 a second, the game's clock stepped so that no
// frame is missed): <out>_f0000.png on, each cut to the part of the screen round him (tools/uniques_play_film.py makes the MP4
// and picks the stills from them).
export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const look = process.env.LOOK || 'tome';
  const playOn = process.env.PLAY !== 'off';
  const film = Number(process.env.FILM || 0);
  const outAt = process.argv.indexOf('--out');
  const out = outAt >= 0 ? process.argv[outAt + 1] : 'shots/uniques_play/x';
  /**
   * A FILM: `seconds` of it at 30 frames a second, the game's clock let on a thirtieth of a second at a time and stopped while
   * each frame is taken; `due` (seconds in, what to do then) is done as its moment comes; each frame cut to `clip` (the page's
   * own pixels, round the middle of the screen, where he stands).
   */
  const shoot = async (seconds, clip, due = []) => {
    const FPS = 30;
    const c0 = await page.evaluate(() => window.__dbg.clock());
    const todo = [...due].sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < Math.round(seconds * FPS); i++) {
      while (todo.length && todo[0][0] <= i / FPS) await todo.shift()[1]();
      await page.evaluate(() => { window.__dbg.slowmo = 0.3; });
      await page.waitForFunction((at) => {
        const d = window.__dbg;
        if (d.clock() < at) return false;
        d.slowmo = 1e-6;
        return true;
      }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      await page.screenshot({ path: `${out}_f${String(i).padStart(4, '0')}.png`, clip });
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  };
  const mid = await page.evaluate(() => [innerWidth / 2, innerHeight / 2]);
  const round = (l, t, r, b) => ({ x: Math.round(mid[0] - l), y: Math.round(mid[1] - t), width: l + r, height: t + b });
  const elite = process.env.ELITE || 'skeleton';
  const cls = look === 'tome' ? 'warlock' : look === 'globe' ? 'brawler' : look === 'talons' ? 'ranger' : look === 'wrench' ? 'tinkerer' : 'warrior';
  // (LOOK=kinds: every kind of monster risen in turn, to see each one's risen look: below)
  const id = look === 'tome' ? 'restlesstome' : look === 'globe' ? 'fourthglobe' : look === 'arm' ? 'drownedarm' : look === 'talons' ? 'queenstalons' : look === 'wrench' ? 'stickywrench' : look === 'wind' ? 'windcutter' : look === 'moth' ? 'mothswing' : 'fleshmancersbrand';
  const set = await page.evaluate(({ cls, id, playOn }) => {
    const d = window.__dbg;
    d.uniques.on = true;
    if (d.uniqueArt) d.uniqueArt.on = true;
    if (d.uniquePlay) for (const k of Object.keys(d.uniquePlay)) d.uniquePlay[k] = playOn;
    d.saving(false);
    d.loading.on = false;
    d.practice(cls, 7);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    g.giveUnique(id, 12);
    for (const it of h.bag) if (it) it.reqLevel = 1;
    const i = h.bag.findIndex((it) => it && it.unique === id);
    const why = i < 0 ? 'not in the bag' : g.equipFromBag(i);
    d.panels.open = 'none';
    d.god = true;
    h.life = h.d.maxLife;
    h.fx = 1; h.fy = 0;
    return { why, worn: g.worn, play: d.uniquePlay ? { ...d.uniquePlay } : null };
  }, { cls, id, playOn });
  say(`set: ${JSON.stringify(set)}`);
  if (set.why) bad(`could not put it on: ${set.why}`);
  // (the practice room's words to him fade; the pictures are of the fight)
  // and the game's controls kept as it is stepped, for a press of the Brawler's (Game.vetPress wants them)
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    const run = g.update.bind(g);
    g.update = (dt, c) => { window.__c = c; if (d.fx) d.fx.messages.length = 0; return run(dt, c); };
  });
  const mk = (kind, dx, dy, o = {}) => page.evaluate(({ kind, dx, dy, o }) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.spawn(kind, h.x + dx, h.y + dy, 1, 0, false, g.rng);
    g.wakeUp(m); m.speed = 0; m.cd = 1e9;
    m.life = m.maxLife = o.life ?? 4000;
    if (o.elite) { m.elite = true; m.name = o.name ?? 'An elite'; m.words = ['leech']; }
    if (o.face) { m.fx = o.face[0]; m.fy = o.face[1]; }
    return m.id;
  }, { kind, dx, dy, o });
  const wait = (ms) => page.waitForTimeout(ms);

  if (look === 'kinds') {
    // EVERY KIND RISEN, one after another (KINDS=a,b,c; the rules' own Risen put there, stepped by the game): each as it stands,
    // then fallen; a page error is told of by its kind. For a sheet of them all (tools/uniques_play_sheet.py).
    const kinds = (process.env.KINDS || '').split(',').filter(Boolean);
    let errs0 = 0;
    for (const kind of kinds) {
      await page.evaluate((kind) => {
        const g = window.__dbg.game(); const h = g.hero;
        g.monsters.length = 0;
        g.risen = { kind, name: kind, x: h.x + 1.6, y: h.y + 0.2, fx: -0.6, fy: 0.8, r: 0.35, t: 15, act: 'rise', actT: 0, did: false, target: -1, cd: 0, walked: 0, champion: false };
      }, kind);
      await wait(300); await snap(`k_${kind}_0rise`);
      await wait(600); await snap(`k_${kind}_1stands`);
      await page.evaluate(() => { const g = window.__dbg.game(); if (g.risen) g.risen.t = 0.01; });
      await wait(350);
      const errs = await page.evaluate(() => (window.__errors || []).length);
      if (errs > errs0) { bad(`${kind}: ${errs - errs0} errors on the page`); errs0 = errs; }
    }
    return;
  }
  if (look === 'wind') {
    // THE WINDCUTTER (the Warrior wearing it): three Strikes in a row at the one before him; the third sends its blade on ahead,
    // through the ones in its line; then again, facing the other way
    await mk('skeleton', 2.6, 0.2); await mk('skeleton', 4.2, -0.3); await mk('cultist', 5.8, 0.1); await mk('skeleton', -2.8, 0.2); await mk('skeleton', -4.6, -0.2);
    const strike = (dx) => () => page.evaluate((dx) => { const d = window.__dbg; const g = d.game(); const h = g.hero; h.swingT = 0; h.fx = Math.sign(dx); h.fy = 0; g.useBasic(h.x + dx, h.y); }, dx);
    await wait(400);
    // (BARE=1: its blade alone, sent by the rules with no swing of his, to see it clear)
    const bare = (fx, fy) => () => page.evaluate(([fx, fy]) => { const g = window.__dbg.game(); const h = g.hero; h.fx = fx; h.fy = fy; g.windBlade(); }, [fx, fy]);
    const due = process.env.BARE ? [[0.1, bare(1, 0)], [0.8, bare(0.6, -0.8)], [1.5, bare(-1, 0)]] : [[0.2, strike(1)], [0.62, strike(1)], [1.04, strike(1)], [2.2, strike(-1)], [2.62, strike(-1)], [3.04, strike(-1)]];
    if (film) { await shoot(film, round(300, 160, 300, 110), due); return; }
    for (const [, f] of due.slice(0, 3)) { await f(); await wait(420); }
    for (let k = 0; k < 6; k++) { await wait(k === 0 ? 30 : 90); await snap(`${k + 1}_blade`); }
    return;
  }
  if (look === 'moth') {
    // THE MOTH'S WING (the Warrior wearing it, words on his attacks): struck, one of his words goes dark for a while; struck again,
    // another; the HUD's skill buttons are where it shows
    await page.evaluate(() => {
      const d = window.__dbg; const g = d.game();
      try { g.socket(0, 'front', 'fire'); g.socket(0, 'front', 'power'); g.socket(1, 'front', 'frost'); g.socket(1, 'behind', 'leech'); } catch (e) { console.log('words: ' + e); }
      d.god = false;
    });
    await mk('skeleton', 1.2, 0.0, { life: 1e7 });
    const hit = () => page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters[0]; const h = g.hero; h.life = h.d.maxLife; g.hurtHero(3, 'phys', [], m); });
    await wait(400);
    const full = { x: 0, y: 0, width: Math.round(mid[0] * 2), height: Math.round(mid[1] * 2) };
    if (film) { await shoot(film, full, [[0.3, hit], [1.6, hit]]); return; }
    await snap('1_before'); await hit(); await wait(150); await snap('2_dark'); await hit(); await wait(150); await snap('3_another');
    const errs = await page.evaluate(() => (window.__errors || []).length);
    if (errs) bad(`${errs} errors on the page`);
    return;
  }
  if (look === 'wrench') {
    // THE STICKY WRENCH (the Tinkerer): her vial tossed at one before her sticks to it, and to the one it walks with
    await mk('skeleton', 2.4, 0.2); await mk('cultist', 3.4, -1.2);
    const toss = () => page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; h.swingT = 0; g.useBasic(h.x + 2.4, h.y + 0.2); });
    await wait(500);
    if (film) { await shoot(film, round(150, 150, 240, 100), [[0.2, toss], [1.4, toss]]); return; }
    await toss();
    for (let k = 0; k < 6; k++) { await wait(k === 0 ? 400 : 120); await snap(`${k + 1}_vial`); }
    return;
  }
  if (look === 'talons') {
    // THE QUEEN'S TALONS (the Ranger wearing them): a critical hit calls her bird onto the nearest enemy; here called as a critical
    // hit calls it (Game.callBird), onto one to his right, then, that one sent off, onto one before him and to his left
    const a = await mk('skeleton', 2.6, -0.6); await mk('cultist', 0.4, 2.7); await mk('skeleton', 4.6, 1.8);
    const call = () => page.evaluate(() => window.__dbg.game().callBird());
    const away = () => page.evaluate((id) => { const m = window.__dbg.game().monsters.find((q) => q.id === id); if (m) { m.x += 6; m.y -= 6; } }, a);
    await wait(500);
    if (film) { await shoot(film, round(190, 185, 240, 110), [[0.2, call], [1.5, away], [1.55, call]]); return; }
    await call();
    for (let k = 0; k < 6; k++) { await wait(k === 0 ? 100 : 120); await snap(`${k + 1}_bird`); }
    return;
  }
  if (look === 'arm') {
    // THE DROWNED ARM (the Warrior wearing it): he strikes the one before him; its arm comes up under that one (the rules' every
    // 5 seconds; the first at once)
    await mk('skeleton', 1.45, 0.0); await mk('skeleton', 3.2, -1.7); await mk('cultist', 3.6, 1.7);
    const strike = () => page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; h.swingT = 0; g.useBasic(h.x + 1, h.y); });
    await wait(400);
    if (film) { await shoot(film, round(150, 150, 230, 90), [[0.2, strike]]); return; }
    await strike();
    for (let k = 0; k < 6; k++) { await wait(k === 0 ? 120 : 110); await snap(`${k + 1}_arm`); }
    return;
  }
  if (look === 'tome') {
    // enemies standing where its circle passes (1.8 from him), before him and behind
    await mk('skeleton', 1.8, 0.2); await mk('skeleton', -0.3, 1.8); await mk('cultist', -1.7, -0.6); await mk('skeleton', 3.4, 1.2);
    if (film) { await wait(400); await shoot(film, round(170, 125, 170, 100)); return; }
    for (let k = 0; k < 8; k++) { await wait(k === 0 ? 700 : 215); await snap(`${k + 1}_turn`); }
  } else if (look === 'risen' && process.env.STAGE) {
    // SET APART, to be seen clear of him (STAGE=1, with FILM): the elite two tiles off, struck dead by the game's own blow with
    // no swing of his over it; it rises, goes for the three beyond it, and with a few seconds left (its ring nearly burnt away)
    // is let run out and falls.
    const id = await mk(elite, 2.0, 0.1, { elite: true, life: 60, face: [-1, 0] });
    await mk('skeleton', 3.4, 0.8, { life: 170 }); await mk('skeleton', 3.3, -0.9, { life: 170 }); await mk('skeleton', 4.7, 0.1, { life: 170 });
    const kill = () => page.evaluate((id) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === id); if (m) g.damageMonster(m, Math.ceil(m.life), 'phys', false, -1); }, id);
    const low = () => page.evaluate(() => { const g = window.__dbg.game(); if (g.risen) g.risen.t = 2.6; });
    await wait(400);
    await shoot(film || 9.6, round(90, 125, 250, 100), [[0.5, kill], [6.2, low]]);
    return;
  } else if (look === 'risen') {
    await mk(elite, 1.4, 0, { elite: true, life: 60, face: [-1, 0] });
    await mk('skeleton', 3.0, 0.9); await mk('skeleton', 3.1, -1.0); await mk('skeleton', 4.6, 0.1);
    const strike = () => page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; h.swingT = 0; g.useBasic(h.x + 1, h.y); });
    await wait(500);
    if (film) {
      // (he strikes the elite down; it rises and fights for its fifteen seconds, the brand under it burning away; it falls)
      const weak = () => page.evaluate(() => { for (const m of window.__dbg.game().monsters) if (!m.elite) m.life = m.maxLife = 170; });
      await weak();
      await shoot(film, round(110, 125, 230, 100), [[0.3, strike], [0.75, strike], [1.2, strike], [1.65, strike]]);
      return;
    }
    await snap('1_before');
    let risen = false;
    // (his Strike again and again until the elite is dead; looked for often, so the first picture is of its rising's start)
    for (let k = 0; k < 10 && !risen; k++) {
      await strike();
      for (let q = 0; q < 14 && !risen; q++) { await wait(30); risen = await page.evaluate(() => !!window.__dbg.game().risen); }
    }
    if (!risen) bad('no elite rose');
    await snap('2_rise_a'); await wait(130); await snap('3_rise_b'); await wait(160); await snap('4_rise_c'); await wait(350);
    await snap('5_stands');
    for (let k = 0; k < 10; k++) { await wait(300); await snap(`6_fights_${k}`); }
    // its time run out: it falls
    await page.evaluate(() => { const g = window.__dbg.game(); if (g.risen) g.risen.t = 0.05; });
    await wait(200); await snap('7_fall_a'); await wait(300); await snap('8_fall_b'); await wait(500); await snap('9_fall_c');
  } else {
    await mk('skeleton', 1.3, 0, { life: 1e7 }); await mk('skeleton', 2.4, 0.8, { life: 1e7 });
    await wait(600);
    const press = (kind) => page.evaluate((kind) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const m = g.monsters[0];
      return g.vetPress(kind, { ...window.__c, aimX: m ? m.x : h.x + 1, aimY: m ? m.y : h.y }) ? null : 'not taken';
    }, kind);
    const globes = () => page.evaluate(() => { const v = window.__dbg.game().hero.vet; return v ? v.globes.slice() : null; });
    if (film) {
      // (two combos of four: punch, punch, kick, punch; then kick, punch, punch, kick)
      const at = (t, k) => [t, () => press(k)];
      await shoot(film, round(130, 135, 210, 90), [at(0.5, 'tap'), at(0.9, 'tap'), at(1.3, 'hold'), at(1.7, 'tap'), at(5.2, 'hold'), at(5.6, 'tap'), at(6.0, 'tap'), at(6.4, 'hold')]);
      return;
    }
    await snap('1_empty');
    for (const [k, kind] of [['2_one', 'tap'], ['3_two', 'tap'], ['4_three', 'hold'], ['5_four', 'tap']]) {
      const r = await press(kind);
      if (r) say(`press ${kind}: ${r}`);
      await wait(260);
      await snap(k);
      say(`globes: ${JSON.stringify(await globes())}`);
    }
    await wait(300); await snap('6_locked');
  }
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
