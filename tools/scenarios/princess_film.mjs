// THE PRINCESS, FLOOR 16'S BOSS, filmed in the game for the owner (game/act1_rules/princess.ts, behind HIGH_CITY: she is put in
// the practice room by hand, the room about her arena's size, 18 by 18 tiles). A picture every thirtieth of a second of the
// GAME's time (the game slowed so the camera keeps up, and stopped while each is taken, so a frame still being painted costs the
// film nothing), as tools/scenarios/warlock_film.mjs films. What she does, by the game's clock (her moves let come one at a
// time, by her own rules, each when the one before is done):
//   her glide and her nettle vine lash; the vine snare round the hero, who swings at it till it breaks; the Eleven; the Vow
//   (the hero walks in to her); her second phase come: the spectral steed, its whole ultimate (it forms, fifteen leaps, eight
//   round the room and seven at the hero, who rolls out from under the last few; it fades); then she falls: her swans fly
//   off, she sinks to her knees and whispers.
// Frames go to <out>_f0000.png ..., and <out>_film.json says what each part of the film is (python3 tools/warlock_film.py
// <dir> <out.mp4> 0.9 makes the film of them).
//   node tools/build_to.mjs dist/princess.html
//   node tools/playtest.mjs --file dist/princess.html --size 1280x720 --scenario tools/scenarios/princess_film.mjs --out shots/pfilm/p
//   env: SECONDS=46 (how long), FROM=0 (the first second filmed), STILLS=1 (only a picture every half second), CLS=warrior

const FPS = 30;

// What happens, by the game's clock (seconds from the start of the film).
//   only id     of her moves only this one is ready (her rules choose when: as soon as it can be made)
//   swing a b   the hero swings at the floor beside him, from a to b seconds
//   walkIn a b  the hero walks in toward her, from a to b
//   roll        the hero rolls aside, once its leap at him has sprung (through the steed's last leaps)
//   phase k     her life brought to k of it (her second phase: the steed comes)
//   kill        she falls
const PLAN = [
  [0.0, 'only', 'princess:lash'],
  [3.6, 'only', 'princess:snare'],
  [5.0, 'swing', 5.0, 8.8],
  [9.0, 'only', 'princess:eleven'],
  [12.6, 'only', 'princess:vow'],
  [12.6, 'walkIn', 12.6, 13.8],
  [16.0, 'only', 'none'],
  [16.0, 'phase', 0.6],
  [27.6, 'roll'],
  [36.6, 'only', 'princess:lash'],
  [39.6, 'kill'],
];
// What the film says, from when (seconds), its title and the line under it.
const PARTS = [
  [0.0, 'THE PRINCESS', 'She glides without a sound. Her swans circle her.'],
  [0.4, 'THE NETTLE VINE LASH', 'A quarter turn, seven and a half tiles of whip.'],
  [3.5, 'THE VINE SNARE', 'It holds you in. Break it, or wait six seconds.'],
  [8.9, 'THE ELEVEN', 'Her swans dive along the lines. Stand between them.'],
  [12.5, 'THE VOW', 'A ring of silence. Your words go dark inside it.'],
  [15.9, 'HER ULTIMATE: THE SPECTRAL STEED', 'It forms under her: fifteen leaps.'],
  [17.4, 'ROUND THE ARENA', 'The first eight leaps: a lap of her arena.'],
  [25.4, 'AT YOU', 'The last seven land where you stood as it sprang.'],
  [32.4, 'THE STEED FADES', 'And she glides again.'],
  [39.5, 'SHE FALLS', 'Her swans fly off over the wall. “Stop the dancing.”'],
];

export default async function (page, snap) {
  const seconds = Number(process.env.SECONDS || 46);
  const from = Number(process.env.FROM || 0);
  const stills = process.env.STILLS === '1';
  const cls = process.env.CLS || 'warrior';
  // (WHERE=floor16, the main chat's: on her own ground on floor 16 itself, at dawn, the rest of the floor's packs gone)
  const onFloor = process.env.WHERE === 'floor16';
  if (onFloor) {
    await page.evaluate((cls) => {
      const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
      d.run(cls, 7); d.seasoned(22); d.autoLevel = false; d.autoWords = false; d.god = true;
      d.high(true, 16);
    }, cls);
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const m = g.monsters.find((q) => q.kind === 'princess');
      for (const q of g.monsters) if (q !== m) q.dead = true;
      g.projectiles.length = 0;
      h.x = m.x - 5; h.y = m.y; h.fx = 1; h.fy = 0;
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.words = []; m.shield = 0;
      g.boss = m; g.bossMet = true;
      g.level.explored.fill(1);
    });
  }
  if (!onFloor) await page.evaluate((cls) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, cls);
  await page.waitForTimeout(500);
  if (!onFloor) await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    // (the hero west of the room's middle, she east of him, five tiles off)
    h.x = 11.5; h.y = 15.5; h.fx = 1; h.fy = 0;
    const m = g.spawn('princess', h.x + 5, h.y, 9, 0, true, g.rng);
    g.wakeUp(m);
    m.life = m.maxLife = 1e7; m.words = []; m.shield = 0; m.name = 'The Princess';
    g.boss = m; g.bossMet = true;
    g.level.explored.fill(1);
  });
  // (the controls a player's hand would give, by the game's clock: the game's own update given them)
  await page.evaluate((plan) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const f = { t: 0, plan: plan.slice(), log: [], swing: null, walk: null, roll: false, rolled: -1, only: null };
    window.__pfilm = f;
    const run = g.update.bind(g);
    const her = () => g.monsters.find((q) => q.kind === 'princess' && !q.dead);
    g.update = (dt, c) => {
      f.t += dt;
      while (f.plan.length && f.plan[0][0] <= f.t) {
        const [, what, a, b] = f.plan.shift();
        const m = her();
        if (what === 'only') f.only = a;
        else if (what === 'swing') f.swing = [a, b];
        else if (what === 'walkIn') f.walk = [a, b];
        else if (what === 'roll') f.roll = true;
        else if (what === 'phase' && m) m.life = m.maxLife * a;
        else if (what === 'kill' && m) { f.roll = false; g.kill(m); }
        f.log.push(`${f.t.toFixed(2)} ${what} ${a ?? ''} ${m ? m.act ? m.act.id : m.anim : 'dead'}`);
      }
      const m = her();
      // (of her moves, only the one the film is at is let come; the others kept waiting)
      if (m && m.moveCd && f.only) m.moveCd = m.moveCd.map((v, i) => (['princess:lash', 'princess:snare', 'princess:eleven', 'princess:vow'][i] === f.only ? Math.min(v, 0.6) : 1e9));
      if (f.swing && f.t >= f.swing[0] && f.t <= f.swing[1]) { c.fire = true; c.aimX = h.x + 0.8; c.aimY = h.y + 0.3; }
      if (f.walk && m && f.t >= f.walk[0] && f.t <= f.walk[1]) { const dx = m.x - h.x; const dy = m.y - h.y; const l = Math.hypot(dx, dy) || 1; if (l > 2) { c.mx = dx / l; c.my = dy / l; } }
      // (out from under the steed's leaps at him, once each has sprung)
      if (f.roll && m && m.act && m.act.id === 'princess:leap' && m.act.a === 1 && m.act.t > 0.33 && f.rolled !== m.act.n) {
        f.rolled = m.act.n;
        const dx = h.x - m.act.x; const dy = h.y - m.act.y;
        const side = (m.act.n % 2 ? 1 : -1);
        c.evade = true; c.evadeX = h.x + (-m.fy * side) * 3; c.evadeY = h.y + (m.fx * side) * 3;
        void dx; void dy;
      }
      const out = run(dt, c);
      // (her whisper as she falls: kept up by the game's clock, as the film's is slowed: the effects count a line's time in the
      // page's own, which runs on while each picture is taken)
      const say = d.fx.bossSay;
      if (say && say.text === 'Stop the dancing.') { f.sayT ??= f.t; say.t = f.t - f.sayT; }
      return out;
    };
  }, PLAN);
  const where = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return window.__dbg.at(h.x, h.y); });
  snap.note('film', { fps: FPS, from, parts: PARTS, hero: where, size: await page.evaluate(() => [innerWidth, innerHeight]) });

  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    if (i / FPS < from) continue;
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 60 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'princess'); const h = g.hero; const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : -1; return `her ${m ? (m.dead ? 'dead' : (m.act ? m.act.id : m.anim)) : 'gone'} perils=${g.perils.map((p) => p.a1).join(',')} hushed=${g.hushT.toFixed(1)} hero ${h.x.toFixed(1)},${h.y.toFixed(1)} heap ${mem} MB painted ${window.__dbg.painting.frames}`; }));
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__pfilm.log)).join('\n'));
}
