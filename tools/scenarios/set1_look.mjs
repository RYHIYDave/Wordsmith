// SET 1 IN PLAY, FOR HIS LOOK: the battle axe's and the warhammer's uniques (game/uniques.ts SET1_DEFS) at work, each worn by the
// practice room's Warrior with its weapon, a few enemies set by him, filmed as it works. SET1 and SET1_LOOK switched on for this
// page only (their switches, off in the game until his yes).
//   node tools/build_to.mjs dist/set1.html
//   LOOK=star FILM=3 node tools/playtest.mjs --file dist/set1.html --size 852x393 --dpr 3 --touch \
//     --scenario tools/scenarios/set1_look.mjs --out shots/set1/star
// LOOK: gyre, tithe, widow, knell, weight, star. PLAY=off: the build's stand-ins. FILM=<seconds>: a film, frame by frame (30 a
// second, the game's clock stepped so that no frame is missed), <out>_f0000.png on, each cut round him.
export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const look = process.env.LOOK || 'star';
  const playOn = process.env.PLAY !== 'off';
  const film = Number(process.env.FILM || 0);
  const outAt = process.argv.indexOf('--out');
  const out = outAt >= 0 ? process.argv[outAt + 1] : 'shots/set1/x';
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
  const ID = { gyre: 'gyre', tithe: 'redtithe', widow: 'widowfall', knell: 'deathknell', weight: 'deadweight', star: 'starbreaker' };
  const id = ID[look];
  const weapon = ['gyre', 'tithe', 'widow'].includes(look) ? 'battleaxe' : 'warhammer';
  const talents = look === 'tithe' ? ['rend'] : [];
  const set = await page.evaluate(({ id, weapon, talents, playOn }) => {
    const d = window.__dbg;
    d.uniques.on = true;
    d.set1.on = true;
    d.set1Look.on = playOn;
    if (d.uniqueArt) d.uniqueArt.on = true;
    d.saving(false);
    d.loading.on = false;
    d.practice('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    for (const t of [weapon, ...talents]) if (!h.talents.includes(t)) h.talents.push(t);
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    g.giveUnique(id, 12);
    for (const it of h.bag) if (it) it.reqLevel = 1;
    const i = h.bag.findIndex((it) => it && it.unique === id);
    const why = i < 0 ? 'not in the bag' : g.equipFromBag(i);
    g.refresh();
    d.panels.open = 'none';
    d.god = true;
    h.life = h.d.maxLife;
    h.fx = 1; h.fy = 0;
    return { why, worn: g.worn, skills: h.skills.map((s) => s.id) };
  }, { id, weapon, talents, playOn });
  say(`set: ${JSON.stringify(set)}`);
  if (set.why) bad(`could not put it on: ${set.why}`);
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    const run = g.update.bind(g);
    g.update = (dt, c) => { if (d.fx) d.fx.messages.length = 0; return run(dt, c); };
  });
  const mk = (kind, dx, dy, o = {}) => page.evaluate(({ kind, dx, dy, o }) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.spawn(kind, h.x + dx, h.y + dy, 1, 0, false, g.rng);
    g.wakeUp(m); m.speed = 0; m.cd = 1e9;
    m.life = m.maxLife = o.life ?? 4000;
    if (o.bleed) { m.bleedDps = 5; m.bleedT = 30; }
    return m.id;
  }, { kind, dx, dy, o });
  const wait = (ms) => page.waitForTimeout(ms);
  /** One of his three pressed toward (dx, dy) from him: 0 his tap, 1 his hold, 2 his swipe (the game's own presses). */
  const press = (i, dx, dy) => () => page.evaluate(([i, dx, dy]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    for (const s of h.skills) { s.cd = 0; s.charges = s.maxCharges; }
    h.mana = h.d.maxMana; h.swingT = 0;
    h.fx = dx / Math.hypot(dx, dy); h.fy = dy / Math.hypot(dx, dy);
    if (i === 0) g.useBasic(h.x + dx, h.y + dy);
    else if (i === 1) g.useSkill(1, h.x + dx, h.y + dy);
    else g.useEvasive(h.x + dx, h.y + dy, { evade: true, evadeX: h.x + dx, evadeY: h.y + dy });
  }, [i, dx, dy]);
  const clip = round(300, 200, 300, 120);
  let due = [];
  if (look === 'gyre') {
    // two throws, each axe left spinning where its flight ends among the skeletons there; then a third, the oldest falling
    await mk('skeleton', 5.6, 0.4); await mk('skeleton', 6.4, -0.6); await mk('skeleton', 4.2, 3.6); await mk('skeleton', 5.0, 4.4);
    due = [[0.2, press(1, 1, 0)], [1.2, press(1, 0.75, 0.66)], [2.4, press(1, 0.9, -0.44)]];
  } else if (look === 'tithe') {
    // a bleeding one cut down by his Cleave: its blood thrown to the next, and that one's, when it falls, to the next
    await mk('skeleton', 1.3, 0, { life: 30, bleed: true });
    await mk('skeleton', 3.4, 0.8, { life: 30 }); await mk('skeleton', 4.6, -1.6, { life: 30 }); await mk('skeleton', 5.8, 1.0);
    due = [[0.2, press(0, 1, 0)], [1.2, () => page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.dead && (m.bleedT ?? 0) > 0) m.life = 1; })]];
  } else if (look === 'widow') {
    // Leaping Chop into a ring of them: the Cleave all round him as he lands, and all of them bleeding
    for (const [x, y] of [[4.2, 0], [5.6, 1.4], [5.6, -1.4], [7.0, 0], [4.6, 1.8], [4.6, -1.8]]) await mk('skeleton', x, y);
    due = [[0.3, press(2, 5.2, 0)]];
  } else if (look === 'knell') {
    // his Earthquake into the first; they ring; his Smash on a ringing one: it peals, and the pack beyond rings in turn
    await mk('skeleton', 1.4, 0); await mk('skeleton', 2.0, 1.0); await mk('skeleton', 4.0, 0.6); await mk('skeleton', 4.2, -0.8); await mk('skeleton', 5.6, 0.2);
    due = [[0.2, press(1, 1, 0)], [1.3, press(0, 1, 0)], [2.3, press(0, 1, 0)]];
  } else if (look === 'weight') {
    // five Smashes in a row: heavier each time, the fifth an Earthquake; then he stops, and the weight drains away
    await mk('skeleton', 1.4, 0); await mk('skeleton', 2.6, 1.2); await mk('skeleton', 2.6, -1.2);
    const t0 = 0.2;
    due = [0, 1, 2, 3, 4].map((k) => [t0 + k * 0.75, press(0, 1, 0)]);
  } else {
    // STARBREAKER: his Earthquake, the meteor seen falling as he winds up, striking as the hammer comes down; then with Tremors
    await mk('skeleton', 1.4, 0.3); await mk('skeleton', 2.2, -0.6); await mk('skeleton', 0.9, -1.0);
    due = [[0.2, press(1, 1, 0)], [2.4, () => page.evaluate(() => { const g = window.__dbg.game(); g.hero.talents.push('tremors'); g.refresh(); })], [2.5, press(1, 1, 0)]];
  }
  await wait(400);
  if (film) { await shoot(film, clip, due); return; }
  for (const [at, f] of due) { await f(); await wait(300); await snap(`${look}_${at}`); }
  await wait(600);
  await snap(`${look}_end`);
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
