// THE NEW MONSTERS (Version 19.9), filmed in the game for the owner: the practice room, the warrior
// standing (he cannot be killed: the god switch), the new monsters switched on (their pictures and the
// rings with them), and
//   WHO=shades    a blue pack of five Shades (Frost) round him: their rakes; the blue rings;
//   WHO=boneward  a Boneward six tiles off: it hurls its spear, which falls at his feet; it comes on with
//                 its shield, stoops for its spear beside him, and thrusts;
//   WHO=golem     a Golem six tiles off: a skull hurled high, its shadow growing where it will come down,
//                 bursting; then it comes on and swings its club;
//   WHO=champion  a yellow pack: the skeleton champion (Flame) and four skeletons, his minions, with half
//                 his Flame: his ring of letters and theirs half there; he cries, and their rings fill
//                 with his word while it holds; his cleave.
// The monsters cannot die. A picture every 1/FPS second of the GAME's time, the game slowed so that the
// camera keeps up. Frames: <out>_fNNN.png.
//   WHO=shades|boneward|golem|champion  SECONDS=9  FPS=20
//   node tools/playtest.mjs --file dist/<a build>.html --size 960x540 --scenario tools/scenarios/new_mobs_film.mjs --out shots/film/<who>
export default async function (page, snap) {
  const who = process.env.WHO || 'shades';
  const seconds = Number(process.env.SECONDS || 9);
  const FPS = Number(process.env.FPS || 20);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.monsterAttacks(true); d.newMonsters(true);
    d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  // (the practice room's words of welcome fade first)
  await page.waitForTimeout(Number(process.env.SETTLE || 7000));
  const ids = await page.evaluate((who) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    // (a place `far` tiles off, `deg` degrees round from straight to the screen's left of him)
    const at = (far, deg) => {
      const a = (deg * Math.PI) / 180;
      // the screen's left is (-1, 1) in the floor's tiles; its up is (-1, -1)
      const lx = -Math.SQRT1_2; const ly = Math.SQRT1_2; const ux = -Math.SQRT1_2; const uy = -Math.SQRT1_2;
      return { x: h.x + far * (Math.cos(a) * lx + Math.sin(a) * ux), y: h.y + far * (Math.cos(a) * ly + Math.sin(a) * uy) };
    };
    const NAMES = { shade: 'Shade', boneward: 'Boneward', golem: 'Ossuary Golem', champion: 'Skeleton Champion', skeleton: 'Skeleton' };
    const put = (kind, p, pack = null) => {
      const m = g.spawn(kind, p.x, p.y, 1, pack && pack.rarity === 'leader' ? 1 : 0, false, g.rng, null, pack);
      if (!pack) { m.words = []; m.name = NAMES[kind]; }
      m.shield = 0; m.carries = [];
      g.wakeUp(m);
      m.life = m.maxLife = 1e7;
      const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far;
      return m;
    };
    const made = [];
    if (who === 'shades') {
      const pack = { rarity: 'blue', words: ['frost'] };
      for (const [far, deg] of [[1.2, 0], [1.3, 70], [1.3, 145], [1.3, -70], [1.4, -145]]) { const m = put('shade', at(far, deg), pack); m.cd = 0; made.push(m); }
    } else if (who === 'boneward') {
      // (six tiles off along the floor's rows, up and to the left on the screen: clear of the room's pillars)
      const m = put('boneward', { x: h.x - 6, y: h.y }); m.cd = 0.2; m.moveCd = [0, 0, 0]; made.push(m);
    } else if (who === 'golem') {
      const m = put('golem', { x: h.x - 6, y: h.y }); m.cd = 0.2; m.moveCd = [0, 0]; made.push(m);
    } else {
      const words = ['fire'];
      const c = put('champion', at(2.6, 0), { rarity: 'leader', words });
      // (his cry a moment into the fight, as it would come: his cleave first if the warrior is near)
      c.cd = 0.3; c.moveCd = [0, 1.2]; made.push(c);
      for (const [far, deg] of [[1.2, 40], [1.3, 120], [1.3, -40], [1.4, -120]]) { const m = put('skeleton', at(far, deg), { rarity: 'minion', words }); m.cd = 0.5; made.push(m); }
    }
    const m0 = made[0]; const far = Math.hypot(h.x - m0.x, h.y - m0.y) || 1;
    h.fx = (m0.x - h.x) / far; h.fy = (m0.y - h.y) / far;
    // (still, for the first moment, while the camera settles: the filming begins a second and a half
    // later, and the slowing of the game with it)
    made.forEach((m, k) => {
      m.state = 'recover';
      m.t = 2.1 + (who === 'champion' && k > 0 ? 0.9 + 0.35 * k : 0.5 * k);
    });
    return made.map((m) => m.id);
  }, who);
  console.log('stood', JSON.stringify(ids));
  await page.waitForTimeout(1500);
  const slow = 0.1;
  const step = 1000 / FPS / slow;
  const total = Math.ceil(seconds * FPS);
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  const told = [];
  for (let i = 0; i < total; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f${String(i).padStart(3, '0')}`);
    const now = await page.evaluate(() => {
      const g = window.__dbg.game();
      const mv = (m) => (m.move !== undefined && m.move >= 0 ? m.move : -1);
      return g.monsters.map((m) => `${m.kind}:${m.state}:${mv(m)}${m.bare ? ':bare' : ''}${m.rallyT ? ':rallied' : ''}`).join(' ') + ` spears ${g.spears.length} zones ${g.zones.map((z) => z.kind).join(',')} shots ${g.projectiles.map((p) => p.look).join(',')}`;
    });
    if (told[told.length - 1] !== now) { told.push(now); console.log(`  ${(i / FPS).toFixed(2)}s ${now}`); }
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log('late by', Date.now() - (t0 + (total - 1) * step), 'ms at the end');
}
