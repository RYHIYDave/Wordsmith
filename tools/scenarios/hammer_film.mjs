// THE WARRIOR'S WARHAMMER, A FILM FOR THE OWNER (docs/mockups/warrior_weapons/pictures/hammer_moves.mp4): made as the battle
// axe's film is (tools/scenarios/axe_film.mjs, whose player this is), his moves with the maul in place of the axe's.
//   OUT=/dev/shm/ham/film node tools/playtest.mjs --file dist/axe_film.html --touch --size 844x390 --dpr 3 \
//       --init tools/axe_film_init.js --scenario tools/scenarios/hammer_film.mjs --out /dev/shm/ham/film/x
//   python3 tools/warrior_axe_film.py /dev/shm/ham/film docs/mockups/warrior_weapons/pictures/hammer_moves.mp4
// (the axe's film's own notes follow)
// THE WARRIOR'S BATTLE AXE, A FILM FOR THE OWNER (docs/mockups/warrior_weapons/pictures/axe_moves.mp4), shot in the game's own
// practice room on a phone's wide screen, on the film's page (src/dev/axe_film_main.ts: the game, with his moves with the axe
// shown in place of his picture). The scenario is the player: frame by frame it says which picture of which move he is, where
// he stands and faces, where the thrown axes are, and what the blows do (the game's own hits, and its own cracked floor and dust
// where the Leaping Chop lands); the game draws it. Every picture is one thirtieth of a second of the game's time (a sixtieth in
// the slow passes), by the film's own clock (tools/axe_film_init.js).
//   node tools/axe_film_page.mjs
//   OUT=/dev/shm/axe/film node tools/playtest.mjs --file dist/axe_film.html --touch --size 844x390 --dpr 3 \
//       --init tools/axe_film_init.js --scenario tools/scenarios/axe_film.mjs --out /dev/shm/axe/film/x
//   python3 tools/warrior_axe_film.py /dev/shm/axe/film docs/mockups/warrior_weapons/pictures/axe_moves.mp4
//   env: ONLY = a shot's name (to look at one), FRAMES = how many of it
import fs from 'node:fs';
import path from 'node:path';

const S = Math.SQRT1_2;
const WAYS = { toward: [S, S], side: [S, -S], away: [-S, -S], front: [1, 0] };
const SAY = { toward: 'toward you', side: 'side-on', away: 'away from you' };
const TILE_SPEED = 4.6; // tiles a second: the game's run
const SWING_STEP = [0.33, 0.12]; // tiles, seconds: the game's step on each swing (TUNE.swingStep, swingStepTime)
// (art/warrior_up_hammer_moves.ts: HAMMER_SMASH_*, HAMMER_QUAKE_*, HAMMER_TREMORS, HAMMER_CHARGE_*)
const SMASH = { blow: 13, at: 1.4, round: 0.4 };
const QUAKE = { blow: 19, end: 49, at: 1.4, round: 2.0 };
const TREMORS = { after: 0.35, wider: 0.6, weaker: [1, 0.6, 0.35] };
const CHARGE = { go: 6, stop: 21, skid: 27, end: 42, far: 4.4, slide: 0.6, wide: 0.7, thrown: 1.6 }; // far: how far this film's charge goes (the rules': up to 6)

export default async function (page, snap) {
  const out = process.env.OUT || '/dev/shm/axe/film';
  fs.mkdirSync(out, { recursive: true });
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    // (the leap's own landing, the cracked floor and the dust: the game's, as it was before his Lunge took its place)
    d.thrust(false);
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    window.__axe.on = true; window.__axe.move = 'stand'; window.__axe.frame = 0;
    window.__home = { x: g.hero.x, y: g.hero.y };
  });
  // (every kind the film stands up, once, in real time, so that its pictures are painted before the film's clock takes over)
  await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    for (const [k, kind] of ['skeleton', 'cultist', 'brute'].entries()) { const m = g.spawn(kind, h.x + 3 + k, h.y - 3, 1, 0, false, g.rng); g.wakeUp(m); m.state = 'recover'; m.t = 1e9; m.cd = 1e9; m.speed = 0; }
  });
  await page.waitForTimeout(5000);
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; window.__manual(); });
  await page.waitForTimeout(300);

  const manifest = [];
  let n = 0;
  /** One picture of the film: the state the game is put in, a step of its clock, and the picture taken. */
  const take = async (st, note) => {
    const where = await page.evaluate((st) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const A = window.__axe;
      if (st.hero) { h.x = st.hero[0]; h.y = st.hero[1]; h.fx = st.face[0]; h.fy = st.face[1]; }
      h.anim = 'idle'; h.move = null; h.mana = h.d.maxMana; h.life = h.d.maxLife;
      A.move = st.move; A.frame = st.frame; A.lift = st.lift || 0; A.axes = st.axes || [];
      for (const e of st.events || []) {
        if (e.hit) for (const id of e.hit) { const m = g.monsters.find((q) => q.id === id); if (m && !m.dead) g.hitMonster(m, e.slot, e.frac, false); }
        if (e.blast) g.blast(2, e.blast[0], e.blast[1], e.blast[2], e.blast[4] ?? 1, e.blast[3] || 'land', e.blast[5] || 0);
        if (e.shove) { const m = g.monsters.find((q) => q.id === e.shove[0]); if (m) { m.x += e.shove[1]; m.y += e.shove[2]; } }
      }
      for (const m of g.monsters) { m.life = m.maxLife = 1e7; m.state = 'recover'; m.t = 1e9; m.cd = 1e9; m.speed = 0; }
      window.__tick(st.ms);
      return { hero: d.at(h.x, h.y), side: A.side, monsters: g.monsters.map((m) => ({ id: m.id, x: m.x, y: m.y })) };
    }, st);
    if (note) {
      const file = `f${String(n).padStart(5, '0')}.png`;
      await page.screenshot({ path: path.join(out, file) });
      manifest.push({ file, ...note, hero: where.hero, lift: st.lift || 0, side: where.side });
      n++;
    }
    return where;
  };
  /** The room cleared and stood up again: who stands where (tiles ahead of him and to his right), all facing him. */
  const stand = async (home, face, who) => page.evaluate(([home, face, who]) => {
    const g = window.__dbg.game(); const h = g.hero;
    g.monsters.length = 0; g.projectiles.length = 0;
    h.x = home[0]; h.y = home[1]; h.fx = face[0]; h.fy = face[1];
    const ids = [];
    for (const [kind, ahead, right] of who) {
      const x = h.x + face[0] * ahead - face[1] * right; const y = h.y + face[1] * ahead + face[0] * right;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) { ids.push(-1); continue; }
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      ids.push(m.id);
    }
    return ids;
  }, [home, face, who]);
  const home = await page.evaluate(() => [window.__home.x, window.__home.y]);
  /** Frames that are not filmed: the room settling round a new set of enemies. */
  const settle = async (st, k = 24) => { for (let i = 0; i < k; i++) { await take({ ...st, ms: 1000 / 30 }, null); await page.waitForTimeout(15); } };

  /**
   * A SHOT: a list of beats (which move, from which frame to which), played at full speed or at half, the hero carried as the
   * game would carry him; `more(state, beat, f, t)` adds what the beat does (the axes in the air, the blows).
   */
  const play = async (name, caption, { face, zoom = false, slow = false, beats, who, from = home, hold = 6, lead = 0 }) => {
    if (process.env.ONLY && process.env.ONLY !== name) return;
    const ids = await stand(from, face, who || []);
    const pos = [from[0], from[1]];
    await settle({ move: 'stand', frame: 0, hero: pos, face });
    const per = slow ? 2 : 1;
    const ms = 1000 / 30 / per;
    const ctx = { ids, pos, face, hit: new Map(), flown: 0 };
    // (a close pass may look ahead of him: the picture is cut round a point `lead` tiles on along his aim, in game pixels here)
    const ahead0 = [(face[0] - face[1]) * 16 * lead, (face[0] + face[1]) * 8 * lead];
    let shot = 0;
    for (const b of beats) {
      const last = b.to ?? b.from;
      const count = b.loop !== undefined ? b.loop : last - b.from + 1;
      for (let i = 0; i < count; i++) {
        const f = b.loop !== undefined ? b.from + (i % (last - b.from + 1)) : b.from + i;
        for (let s = 0; s < per; s++) {
          if (process.env.FRAMES && shot >= Number(process.env.FRAMES)) break;
          const st = { move: b.move, frame: f, hero: ctx.pos, face, ms, events: [], axes: [] };
          if (b.each) b.each(st, ctx, f, i, s === 0, ms / 1000);
          const w = await take(st, { shot: name, caption, zoom, slow, say: b.say || '', lead: ahead0 });
          ctx.monsters = w.monsters;
          shot++;
        }
      }
    }
    for (let i = 0; i < hold * per; i++) await take({ move: 'stand', frame: i % 60, hero: ctx.pos, face, ms }, { shot: name, caption, zoom, slow, say: '', lead: ahead0 });
  };
  const ahead = (ctx, a, r = 0) => [ctx.pos[0] + ctx.face[0] * a - ctx.face[1] * r, ctx.pos[1] + ctx.face[1] * a + ctx.face[0] * r];
  const turned = (v, deg) => { const a = deg * Math.PI / 180; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; };

  // ---- what each move does in the world ----
  /** Smash: the game's step on a swing, carried forward over its first moments; the blow on its frame: the game's pound there. */
  const smash = (st, ctx, f, i, first, dt) => {
    if (f * (1 / 30) < SWING_STEP[1]) { const d = SWING_STEP[0] * dt / SWING_STEP[1]; ctx.pos = ahead(ctx, d); st.hero = ctx.pos; }
    if (f === SMASH.blow && first) st.events.push({ blast: [...ahead(ctx, SMASH.at), SMASH.round, 'pound', 1, 0] });
  };
  /** Earthquake: the blow, and the ground heaving in a ring (the game's slam); Tremors: two more, later, wider and weaker. */
  const quake = (three) => (st, ctx, f, i, first) => {
    if (!first) return;
    const at = ahead(ctx, QUAKE.at);
    for (let k = 0; k < (three ? 3 : 1); k++) {
      if (f === QUAKE.blow + Math.round(k * TREMORS.after * 30)) st.events.push({ blast: [...at, QUAKE.round + k * TREMORS.wider, 'slam', TREMORS.weaker[k], k] });
    }
  };
  /** Shoulder Charge: carried through the drive and the skid; what he meets is struck and thrown aside, off his path. */
  const charge = (st, ctx, f, i, first, dt) => {
    const per = dt * 30;
    if (f > CHARGE.go && f <= CHARGE.stop) { ctx.pos = ahead(ctx, CHARGE.far * per / (CHARGE.stop - CHARGE.go)); st.hero = ctx.pos; }
    else if (f > CHARGE.stop && f <= CHARGE.skid) { const k = (f - CHARGE.stop) / (CHARGE.skid - CHARGE.stop); ctx.pos = ahead(ctx, CHARGE.slide * 2 * (1 - k) * per / (CHARGE.skid - CHARGE.stop)); st.hero = ctx.pos; }
    ctx.thrown = ctx.thrown || new Map();
    if (f > CHARGE.go && f <= CHARGE.skid) {
      for (const m of ctx.monsters || []) {
        if (ctx.thrown.has(m.id)) continue;
        const dx = m.x - ctx.pos[0]; const dy = m.y - ctx.pos[1];
        const along = dx * ctx.face[0] + dy * ctx.face[1]; const across = -dx * ctx.face[1] + dy * ctx.face[0];
        if (along > -0.2 && along < 0.9 && Math.abs(across) < CHARGE.wide) { ctx.thrown.set(m.id, { left: 8, side: across >= 0 ? 1 : -1 }); if (first) st.events.push({ hit: [m.id], slot: 0, frac: 1 }); }
      }
    }
    // (thrown aside: off his path, to its own side, over a quarter of a second)
    if (first) for (const [id, th] of ctx.thrown) if (th.left > 0) {
      const d = CHARGE.thrown * (th.left / 36);
      th.left--;
      st.events.push({ shove: [id, -ctx.face[1] * th.side * d + ctx.face[0] * d * 0.4, ctx.face[0] * th.side * d + ctx.face[1] * d * 0.4] });
    }
  };

  // ---- the film ----
  await play('stand', 'STANDING with the maul: his guard, alive', { face: WAYS.front, beats: [{ move: 'hstand', from: 0, to: 44 }], who: [['skeleton', 4.2, -1.6], ['cultist', 4.8, 1.8]], hold: 0 });
  {
    const R = 2.1; const turns = 2 * Math.PI * R / TILE_SPEED; const N = Math.round(turns * 30);
    const c = [home[0] + 1.2, home[1] - 1.2];
    await play('run', 'RUNNING with it: his own run, the maul\'s weight riding with his steps', {
      face: WAYS.side, from: [c[0] - R * S, c[1] - R * S], hold: 0,
      who: [['skeleton', 1.5, 7.5], ['brute', 6.5, 1.5]],
      beats: [{ move: 'hrun', from: 0, to: 14, loop: N, each: (st, ctx, f, i) => { const a = -3 * Math.PI / 4 + (2 * Math.PI * (i + 1)) / N; ctx.pos = [c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]; st.hero = ctx.pos; ctx.face = [-Math.sin(a), Math.cos(a)]; st.face = ctx.face; } }],
    });
  }
  const before = [['skeleton', 1.75, 0.15], ['cultist', 2.6, -1.5], ['skeleton', 2.8, 1.4]];
  const smashes = [{ move: 'smash', from: 0, to: 21, each: smash, say: 'one crushing blow straight down' }, { move: 'smash2', from: 0, to: 38, each: smash, say: 'a second tap: hauled up off the floor, and down again' }];
  for (const w of ['toward', 'side', 'away']) await play(`smash_${w}`, `SMASH (tap), ${SAY[w]}: down on the floor before him, then again`, { face: WAYS[w], beats: smashes, who: before });
  await play('smash_slow', 'SMASH at half speed, twice the size', { face: WAYS.side, zoom: true, slow: true, beats: smashes, who: before });
  const ring = [['skeleton', 2.2, -1.1], ['cultist', 3.0, 0.6], ['skeleton', 1.4, 1.5], ['brute', 3.2, -0.4]]; // (outside the maul's circle as he whirls, inside the ring)
  const qb = (three) => [{ move: 'quake', from: 0, to: QUAKE.end, each: quake(three), say: three ? 'a full spin, then down: the ground heaves three times, each wider and weaker' : 'a coil, held; a full spin; up and over, and down; the ground heaves in a ring' }];
  for (const w of ['side', 'away']) await play(`quake_${w}`, `EARTHQUAKE (hold), ${SAY[w]}: a full spin, then down`, { face: WAYS[w], beats: qb(false), who: ring });
  await play('tremors', 'TREMORS (a talent), toward you: a full spin, then three quakes', { face: WAYS.toward, beats: qb(true), who: ring, hold: 10 });
  await play('quake_slow', 'EARTHQUAKE at half speed, twice the size: a full spin, then down', { face: WAYS.side, zoom: true, slow: true, beats: qb(false), who: ring, lead: 1.0 });
  const lane = [['skeleton', 2.2, 0.25], ['cultist', 3.4, -0.3], ['skeleton', 5.4, 2.2]];
  const cb = [{ move: 'charge', from: 0, to: CHARGE.end, each: charge, say: 'a crouch, held; he drives through, shoulder first; the skid' }];
  const back = (w) => [home[0] - WAYS[w][0] * 2.2, home[1] - WAYS[w][1] * 2.2];
  for (const w of ['side', 'toward', 'away']) await play(`charge_${w}`, `SHOULDER CHARGE (swipe), ${SAY[w]}: what he meets is thrown aside`, { face: WAYS[w], beats: cb, who: lane, from: back(w), hold: 8 });
  await play('charge_slow', 'SHOULDER CHARGE at half speed, twice the size', { face: WAYS.side, zoom: true, slow: true, beats: cb, who: lane, from: back('side'), hold: 5, lead: 2.4 });

  const scale = await page.evaluate(() => window.__dbg.screen.scale ?? null);
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ frames: manifest, scale, dpr: 3, painted: await page.evaluate(() => window.__axe.painted) }));
  console.log(`${n} pictures (${(n / 30).toFixed(1)} s) in ${out}`);
}
