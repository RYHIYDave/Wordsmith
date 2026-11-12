// THE WARRIOR'S BATTLE AXE: A TAP WHILE THE THROWN AXE IS OUT (docs/mockups/warrior_weapons/pictures/axe_tap_flying.mp4; his
// words, 11 Nov 2026: “I want to make sure you can still do the tap attack while the axe hold is still flying”): he throws, taps
// at once, an axe appears in his hands and he Cleaves; the thrown one comes back and is gone into it. Made as axe_moves.mp4 is,
// by its player (tools/scenarios/axe_film.mjs); only the film below differs.
//   OUT=/dev/shm/atf/film node tools/playtest.mjs --file dist/axe_film.html --touch --size 844x390 --dpr 3 \
//       --init tools/axe_film_init.js --scenario tools/scenarios/axe_tap_flying.mjs --out /dev/shm/atf/film/x
//   python3 tools/warrior_axe_film.py /dev/shm/atf/film docs/mockups/warrior_weapons/pictures/axe_tap_flying.mp4
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
const FLIGHT = { far: 6, time: 1.0, from: 0.8, to: 0.4, wide: 0.7, spread: 14 }; // art/warrior_up_axe_moves.ts AXE_FLIGHT, AXE_TWIN_SPREAD
const CHOP = { leap: 5, land: 20, end: 42, far: 4.4, high: 40, reach: 1.5, round: 1.6 }; // AXE_CHOP_*; far: how far this film's leap goes (the rules': up to 6)

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
      A.move = st.move; A.frame = st.frame; A.lift = st.lift || 0; A.axes = st.axes || []; A.glint = st.glint ?? -1;
      for (const e of st.events || []) {
        if (e.hit) for (const id of e.hit) { const m = g.monsters.find((q) => q.id === id); if (m && !m.dead) g.hitMonster(m, e.slot, e.frac, false); }
        if (e.blast) g.blast(2, e.blast[0], e.blast[1], e.blast[2], 1, 'land');
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
  /** The game's step on a swing: carried forward over its first moments. The blow, on its frame, on all who stand in the cut. */
  const cut = (st, ctx, f, i, first, dt) => {
    if (f * (1 / 30) < SWING_STEP[1]) { const d = SWING_STEP[0] * dt / SWING_STEP[1]; ctx.pos = ahead(ctx, d); st.hero = ctx.pos; }
    if (f === 10 && first) {
      const struck = (ctx.monsters || []).filter((m) => {
        const dx = m.x - ctx.pos[0]; const dy = m.y - ctx.pos[1]; const far = Math.hypot(dx, dy);
        return far < 2.1 && (dx * ctx.face[0] + dy * ctx.face[1]) / (far || 1) > Math.cos(75 * Math.PI / 180);
      }).map((m) => m.id);
      st.events.push({ hit: struck, slot: 0, frac: 1 });
    }
  };
  /** The thrown axes in the air: `t` seconds since they left his hand; each strikes what it crosses, out and back. */
  const flight = (st, ctx, t, ways, longer = [0]) => {
    ways.forEach((deg, k) => {
      const T = FLIGHT.time + longer[k] / 30;
      if (t <= 0 || t >= T) return;
      const u = t / T;
      const far = FLIGHT.from + (FLIGHT.to - FLIGHT.from) * u + (FLIGHT.far - (FLIGHT.from + FLIGHT.to) / 2) * Math.sin(Math.PI * u);
      const way = turned(ctx.face, deg);
      const at = [ctx.pos[0] + way[0] * far, ctx.pos[1] + way[1] * far];
      st.axes.push({ x: at[0], y: at[1], turn: Math.round(t * 30) });
      const pass = t < T / 2 ? 'out' : 'back';
      const struck = (ctx.monsters || []).filter((m) => Math.hypot(m.x - at[0], m.y - at[1]) < FLIGHT.wide && !ctx.hit.has(`${k}:${pass}:${m.id}`)).map((m) => m.id);
      for (const id of struck) ctx.hit.set(`${k}:${pass}:${id}`, 1);
      if (struck.length) st.events.push({ hit: struck, slot: 1, frac: 0.55 });
    });
  };
  const throwBeats = (twin) => {
    const ways = twin ? [-FLIGHT.spread, FLIGHT.spread] : [0];
    const longer = twin ? [0, 3] : [0];
    const fly = (frame) => (st, ctx, f, i, first, dt) => { ctx.flown += dt; flight(st, ctx, ctx.flown, ways, longer); void frame; };
    return [
      { move: twin ? 'twin' : 'throw', from: 0, to: 11, say: 'the wind-up, held; the throw' },
      { move: twin ? 'twin' : 'throw', from: 12, to: 20, each: fly(), say: 'it flies; he braces' },
      { move: twin ? 'twinBraced' : 'braced', from: 0, to: 19, each: fly(), say: 'braced, his hand out for it' },
      { move: twin ? 'twinCatch' : 'catch', from: 0, to: twin ? 22 : 18, each: twin ? fly() : undefined, say: 'the catch' },
    ];
  };
  /** Leaping Chop: the crouch on the spot; carried and lifted through the leap; the blow as he lands, the game's cracked floor and dust. */
  const chop = (st, ctx, f, i, first, dt) => {
    if (f > CHOP.leap && f <= CHOP.land) {
      ctx.pos = ahead(ctx, CHOP.far * dt / ((CHOP.land - CHOP.leap) / 30)); st.hero = ctx.pos;
      ctx.air = (ctx.air || 0) + dt;
      st.lift = Math.round(Math.sin(Math.PI * Math.min(1, ctx.air / ((CHOP.land - CHOP.leap) / 30))) * CHOP.high);
    }
    if (f === CHOP.land && first) st.events.push({ blast: [...ahead(ctx, CHOP.reach), CHOP.round] });
  };

  // ---- the film ----
  const GLINT = 6; // art/warrior_up_axe_moves.ts AXE_GLINT_FRAMES
  /** He runs on along his aim at the game's run. */
  const go = (st, ctx, dt) => { ctx.pos = ahead(ctx, TILE_SPEED * dt); st.hero = ctx.pos; };
  /** The thrown axe out and back; once back, gone into the axe in his hands: the glint. */
  const outAndBack = (run) => (st, ctx, f, i, first, dt) => {
    ctx.flown += dt;
    if (run) go(st, ctx, dt);
    if (ctx.flown < FLIGHT.time) flight(st, ctx, ctx.flown, [0], [0]);
    else { ctx.glint = (ctx.glint ?? -1) + (first ? 1 : 0); if (ctx.glint < GLINT) st.glint = ctx.glint; }
  };
  const tap = (run) => {
    const fly = outAndBack(run);
    const cutting = (st, ctx, f, i, first, dt) => { cut(st, ctx, f, i, first, dt); fly(st, ctx, f, i, first, 0); ctx.flown += dt; };
    const beats = [{ move: 'throw', from: 0, to: 11, say: 'the throw' }];
    if (run) beats.push({ move: 'runEmpty', from: 0, to: 14, loop: 9, each: fly, say: 'it flies; he runs on' });
    beats.push(
      { move: 'cleaveAppear', from: 0, to: 3, each: cutting, say: 'a tap: an axe appears in his hands' },
      { move: 'cleave', from: 4, to: 36, each: cutting, say: 'and he Cleaves; the thrown one comes back, gone into it' },
    );
    return beats;
  };
  const S2 = Math.SQRT1_2;
  const near = [['skeleton', 1.9, 0.3], ['cultist', 6.2, -1.6]];
  await play('tap_standing', 'A TAP WHILE THE THROWN AXE IS OUT: an axe appears in his hands, and he Cleaves', { face: WAYS.side, beats: tap(false), who: near, hold: 4 });
  const start = [home[0] - 2.4 * S2, home[1] + 2.4 * S2];
  await play('tap_running', 'THE SAME ON THE RUN', { face: WAYS.side, beats: tap(true), who: [['skeleton', 3.3, 0.3], ['cultist', 7.0, -1.6]], from: start, hold: 4 });
  await play('tap_slow', 'AT HALF SPEED, TWICE THE SIZE', { face: WAYS.side, zoom: true, slow: true, beats: tap(false), who: near, hold: 2, lead: 0.8 });

  const scale = await page.evaluate(() => window.__dbg.screen.scale ?? null);
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ frames: manifest, scale, dpr: 3, painted: await page.evaluate(() => window.__axe.painted) }));
  console.log(`${n} pictures (${(n / 30).toFixed(1)} s) in ${out}`);
}
