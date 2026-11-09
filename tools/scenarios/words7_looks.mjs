// THE SEVEN NEW WORDS' LOOKS (render/words7.ts, behind WORDS7_LOOK, off in the game): a still of each word's
// three sides at work (in front, behind, on a monster) in the practice room, as the game draws it, for the
// sheet (tools/words7_sheet.py). With no rules for them yet, the page plays the looks by hand
// (__dbg.words7), each held at its key moment: the world is stopped (slowmo) and the look's own clock set.
//   node tools/build_to.mjs dist/words7_looks.html
//   node tools/playtest.mjs --file dist/words7_looks.html --touch --size 844x360 --dpr 3 --scenario tools/scenarios/words7_looks.mjs --out /dev/shm/w7/s
//   env: ONLY=piercing:front,... (only those scenes)
// Beside each picture a note (<out>_<scene>.json) says where on the screen, in game pixels, the hero and the look are.
// who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you);
// each scene: its monsters, what the hero does, the look and the moment of it held for the still.
const SCENES = [
  {
    key: 'piercing:front',
    face: [1, -1],
    mobs: [['skeleton', 1.15, 0, 'a', 'idle'], ['skeleton', 2.5, 0, 'b', 'idle'], ['skeleton', 3.9, 0, 'c', 'idle']],
    swing: 'a',
    play: { from: [0.35, 0], dir: [1, 0], ids: ['a', 'b', 'c'], along: [0.8, 2.15, 3.55], r: 6.5 },
    at: 0.152,
    focus: [2.2, -0.2],
    close: [2.6, -0.7],
  },
  {
    key: 'piercing:behind',
    face: [1, -1],
    mobs: [['skeleton', 2.0, 0.35, 'a', 'walk'], ['cultist', 3.6, 0.35, 'b', 'walk']],
    play: { from: [0.9, 0.35], to: [4.7, 0.35], ids: ['a', 'b'] },
    at: 0.6,
    focus: [2.4, 0],
    close: [3.0, 0],
  },
  {
    key: 'bleeding:front',
    face: [1, -1],
    mobs: [['cultist', 2.5, 0.35, 'a', 'walk', [1, -1]]],
    play: { ids: ['a'], dir: [1, 0], path: [[1.0, 0.3], [1.4, 0.36], [1.8, 0.3], [2.15, 0.38]] },
    at: 0.32,
    focus: [1.6, 0],
    close: [2.3, -0.6],
  },
  {
    key: 'bleeding:behind',
    face: [1, -1],
    mobs: [['skeleton', 2.5, 0.45, 'a', 'walk', [-1, 1]]],
    play: { at: [2.4, 0.3], r: 1.35, ids: ['a'] },
    at: 0.9,
    focus: [1.8, 0],
    close: [2.4, -0.3],
  },
  {
    key: 'bleeding:monster',
    face: [1, -1],
    mobs: [['cultist', 1.25, -0.15, 'a', 'attack', [-1, 1]]],
    play: { dir: [-1, 0], ids: ['a'] },
    at: 0.12,
    focus: [0.5, 0],
    close: [0.3, -0.8],
  },
  {
    key: 'reaping:front',
    face: [1, -1],
    mobs: [['skeleton', 3.3, 0.7, 'a', 'idle', [-1, 1]]],
    corpse: 'a',
    play: { at: [3.3, 0.7], dir: [-1, 0] },
    at: 0.3,
    focus: [1.7, -0.6],
    close: [1.6, -1.2],
  },
  {
    key: 'reaping:behind',
    face: [1, -1],
    mobs: [['skeleton', 1.5, 1.4, 'dead', 'idle', [-1, 1]], ['skeleton', 2.2, 0.3, 'spirit', 'attack', [1, -1]], ['cultist', 3.3, 0.3, 'foe', 'idle', [-1, 1]]],
    corpse: 'dead',
    play: { at: [1.5, 1.4], ids: ['spirit', 'foe'], strike: 0.1 },
    at: 0.14,
    focus: [1.9, 0.1],
    close: [2.6, -0.6],
  },
  {
    key: 'reaping:monster',
    face: [1, -1],
    mobs: [['skeleton', 2.4, 0.4, 'a', 'idle', [-1, 1]]],
    corpse: 'a',
    dieT: 0.9,
    play: { at: [2.4, 0.4] },
    at: 0.62,
    focus: [1.4, -0.2],
    close: [2.4, -0.6],
  },
  {
    key: 'culling:front',
    face: [1, -1],
    mobs: [['skeleton', 1.2, 0, 'a', 'idle', [-1, 1]]],
    weak: 'a',
    swing: 'a',
    play: { ids: ['a'], dir: [1, 0] },
    at: 0.09,
    focus: [0.8, -0.2],
    close: [1.1, -0.7],
  },
  {
    key: 'culling:behind',
    face: [1, -1],
    mobs: [['skeleton', 3.25, 0.75, 'a', 'walk', [-1, 1]]],
    weak: 'a',
    play: { at: [2.5, 0.4], r: 1.2, ids: ['a'], taken: 0.3 },
    at: 0.4,
    focus: [1.9, -0.2],
    close: [2.7, -0.3],
  },
  {
    key: 'culling:monster',
    face: [1, -1],
    low: true,
    mobs: [['skeleton', 1.35, -0.2, 'a', 'attack', [-1, 1]]],
    play: { ids: ['a'] },
    at: 0.1,
    focus: [0.7, -0.3],
    close: [0.7, -0.9],
  },
  {
    key: 'surging:front',
    face: [1, -1],
    mobs: [['skeleton', 2.1, 0.7, 'a', 'idle', [-1, 1]], ['cultist', -1.9, -0.6, 'b', 'idle', [1, -1]]],
    play: { at: [0, 0], r: 2.2 },
    at: 0.17,
    focus: [0, -0.3],
    close: [0.9, 0],
  },
  {
    key: 'surging:behind',
    face: [1, -1],
    mobs: [['skeleton', 2.6, 0.2, 'a', 'idle', [-1, 1]]],
    roll: { from: [-2.0, 0.1], to: [1.2, -0.05], t: 0.13 },
    play: { at: [-2.0, 0.1], r: 1.5 },
    at: 0.15,
    focus: [-0.2, -0.2],
    close: [-1.0, -0.4],
  },
  {
    key: 'surging:monster',
    face: [1, -1],
    mobs: [['cultist', 2.0, 0.3, 'a', 'attack', [-1, 1]]],
    play: { ids: ['a'], r: 2.3 },
    at: 1.15,
    focus: [1.2, 0],
    close: [1.6, -0.6],
  },
  {
    key: 'plundering:front',
    face: [1, -1],
    mobs: [['skeleton', 2.2, 0.4, 'a', 'idle', [-1, 1]]],
    corpse: 'a',
    dieT: 0.15,
    play: { at: [2.2, 0.4] },
    at: 0.3,
    focus: [1.6, -0.3],
    close: [2.2, -0.8],
  },
  {
    key: 'plundering:behind',
    face: [1, -1],
    mobs: [['skeleton', 3.1, 0.8, 'a', 'idle', [-1, 1]]],
    corpse: 'a',
    play: { at: [3.1, 0.8] },
    at: 0.3,
    focus: [1.6, -0.4],
    close: [1.7, -1.0],
  },
  {
    key: 'plundering:monster',
    face: [1, -1],
    mobs: [['skeleton', 1.4, -0.2, 'a', 'attack', [-1, 1]]],
    play: { ids: ['a'] },
    at: 0.24,
    focus: [0.7, -0.4],
    close: [0.7, -1.0],
  },
  {
    key: 'mirroring:front',
    face: [1, 0],
    mobs: [['skeleton', 0.95, 0.95, 'a', 'idle', [-1, 0]], ['skeleton', 0.25, 2.35, 'b', 'idle', [-1, 0]]],
    swing: 'a',
    play: {},
    at: 0.07,
    focus: [-0.2, 0.6],
    close: [-0.4, 0.2],
  },
  {
    key: 'mirroring:behind',
    face: [1, -1],
    hero: [-1.7, -0.4],
    mobs: [['skeleton', -0.6, -0.4, 'near', 'idle', [-1, 1]], ['skeleton', 1.8, 0.6, 'far', 'idle', [-1, 1]]],
    swing: 'near',
    play: { at: [0.5, 0.6], dir: [1, 0] },
    at: 0.06,
    focus: [0.1, -0.3],
    close: [0.7, -0.6],
  },
  {
    key: 'mirroring:monster',
    face: [1, -1],
    mobs: [['skeleton', 1.2, 0, 'a', 'idle', [-1, 1]]],
    swing: 'a',
    play: { ids: ['a'] },
    at: 0.17,
    focus: [0.6, -0.3],
    close: [0.6, -0.8],
  },
  {
    key: 'piercing:monster',
    face: [0, -1],
    wall: true,
    mobs: [],
    play: {},
    at: 0,
    focus: [0.8, -1.6],
    close: [1.3, -2.6],
  },
];

export default async function (page, snap) {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const bad = (s) => console.log(`  !! ${s}`);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false);
    d.practice('warrior', 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    for (const side of ['front', 'behind']) for (let k = 0; k < 3; k++) g.unsocket(0, side, k);
    d.words7.switch.on = true; d.words7.clear();
  });
  await page.waitForTimeout(1500);
  // the rune stones, as pictures
  const runes = await page.evaluate(() => Object.fromEntries(window.__dbg.words7.words.map((w) => [w, window.__dbg.words7.runePng(w)])));
  for (const [w, url] of Object.entries(runes)) snap.note(`rune_${w}`, { png: url });
  const home = await page.evaluate(() => { const h = window.__dbg.game().hero; return [h.x, h.y]; });

  for (const sc of SCENES) {
    if (only.length && !only.includes(sc.key)) continue;
    const [word, side] = sc.key.split(':');
    // set the room: the world running, the hero home, nothing else there
    const res = await page.evaluate(([sc, home]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const fx = d.fx;
      d.slowmo = 1;
      g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0; g.drops.length = 0;
      // (everything the last scene left in the air: its blows' smears, its numbers, its sparks)
      for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
      d.words7.clear();
      h.move = null; h.swingT = 0; h.life = h.d.maxLife;
      let hx = home[0]; let hy = home[1];
      if (sc.wall) { hx = 15.4; hy = 9.2; }
      const at = (ax, dn) => [hx + (ax + dn) / 2 * 1.4, hy + (dn - ax) / 2 * 1.4];
      if (sc.hero) [hx, hy] = at(sc.hero[0], sc.hero[1]);
      h.x = hx; h.y = hy;
      const fl = Math.hypot(sc.face[0], sc.face[1]); h.fx = sc.face[0] / fl; h.fy = sc.face[1] / fl;
      const ids = {};
      for (const [kind, ax, dn, role, anim, face] of sc.mobs) {
        const [x, y] = at(ax, dn);
        const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
        g.wakeUp(m);
        m.life = m.maxLife = 1e7; m.words = [];
        m.state = 'recover'; m.t = 1e9; m.anim = anim; m.animT = anim === 'walk' ? 0.25 : anim === 'attack' ? 0.18 : 0; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
        if (face) { const l = Math.hypot(face[0], face[1]); m.fx = face[0] / l; m.fy = face[1] / l; } else { const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far; }
        ids[role] = m.id;
      }
      if (sc.weak) { const m = g.monsters.find((q) => q.id === ids[sc.weak]); if (m) m.life = m.maxLife * 0.1; }
      if (sc.low) h.life = Math.max(1, Math.round(h.d.maxLife * 0.12));
      return { ids, hx, hy };
    }, [sc, home]);
    if (Object.keys(res.ids).length !== sc.mobs.length) bad(`${sc.key}: only ${Object.keys(res.ids).length} of ${sc.mobs.length} stood`);
    await page.waitForTimeout(sc.wall ? 2500 : 700);
    // the hero's swing, let run to the middle of it
    if (sc.swing) {
      await page.evaluate(([role, ids]) => {
        const d = window.__dbg; const g = d.game(); const h = g.hero;
        const m = g.monsters.find((q) => q.id === ids[role]); if (!m) return;
        h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
        const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
        d.slowmo = 0.15; g.useBasic(m.x, m.y);
      }, [sc.swing, res.ids]);
      const c0 = await page.evaluate(() => window.__dbg.clock());
      await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + (sc.swingAt ?? 0.11), { polling: 'raf', timeout: 20000 });
    }
    // the look, played and held at its moment
    const focus = await page.evaluate(([sc, ids, word, side, hx, hy]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const w7 = d.words7; const fx = d.fx;
      const at = (ax, dn) => [hx + (ax + dn) / 2 * 1.4, hy + (dn - ax) / 2 * 1.4];
      const dirOf = (v) => { const [x0, y0] = at(0, 0); const [x1, y1] = at(v[0], v[1]); const l = Math.hypot(x1 - x0, y1 - y0) || 1; return [(x1 - x0) / l, (y1 - y0) / l]; };
      const p = sc.play;
      const o = { seed: 7 + word.length * 13 + side.length, dur: 30 };
      if (p.ids) o.ids = p.ids.map((r) => ids[r]);
      if (p.r) o.r = p.r;
      if (sc.roll) {
        // (just out of his roll: he stands where it ended, the surge let out where it began)
        const [x0, y0] = at(sc.roll.from[0], sc.roll.from[1]); const [x1, y1] = at(sc.roll.to[0], sc.roll.to[1]);
        h.x = x1; h.y = y1;
        const l = Math.hypot(x1 - x0, y1 - y0) || 1; h.fx = (x1 - x0) / l; h.fy = (y1 - y0) / l;
        o.x1 = x1; o.y1 = y1;
      }
      let fall = -1;
      if (sc.corpse) fall = w7.corpse(ids[sc.corpse], sc.dieT ?? 5);
      if (word === 'piercing' && side === 'front') {
        const [x, y] = at(p.from[0], p.from[1]); const [dx, dy] = dirOf(p.dir);
        Object.assign(o, { x, y, dx, dy, pts: p.along.map((a) => a * 1.0), x1: x + dx * p.r, y1: y + dy * p.r });
      } else if (word === 'piercing' && side === 'behind') {
        const [x, y] = at(p.from[0], p.from[1]); const [x1, y1] = at(p.to[0], p.to[1]);
        Object.assign(o, { x, y, x1, y1 });
      } else if (word === 'piercing' && side === 'monster') {
        // its shot from beyond the wall, through it, at him: the wall's face is where the room's floor begins (y = 6)
        const x = h.x + 0.9; const y = 3.2; const x1 = h.x; const y1 = h.y;
        const L = Math.hypot(x1 - x, y1 - y); const sWall = ((6 - y) / (y1 - y)) * L;
        Object.assign(o, { x, y, x1, y1, r: sWall, t: 0 });
        o.at = (sWall + 1.1) / 11;
      } else if (word === 'bleeding' && side === 'front') {
        const pts = []; for (const [ax, dn] of p.path) pts.push(...at(ax, dn));
        const [dx, dy] = dirOf(p.dir);
        Object.assign(o, { pts, dx, dy, x: pts[0], y: pts[1] });
      } else if (word === 'bleeding' && side === 'behind') {
        const [x, y] = at(p.at[0], p.at[1]); Object.assign(o, { x, y });
      } else if (word === 'bleeding' && side === 'monster') {
        const [dx, dy] = dirOf(p.dir); Object.assign(o, { x: h.x, y: h.y, dx, dy });
      } else if (word === 'reaping' && side === 'front') {
        const [x, y] = at(p.at[0], p.at[1]); const [dx, dy] = dirOf(p.dir); Object.assign(o, { x, y, x1: h.x, y1: h.y, dx, dy });
      } else if (word === 'reaping' && side === 'behind') {
        const [x, y] = at(p.at[0], p.at[1]); Object.assign(o, { x, y, pts: [p.strike] });
      } else if (word === 'reaping' && side === 'monster') {
        const [x, y] = at(p.at[0], p.at[1]); Object.assign(o, { x, y, fall, dieT: sc.dieT });
      } else if (word === 'culling' && side === 'front') {
        const [dx, dy] = dirOf(p.dir); const m = g.monsters.find((q) => q.id === ids.a); Object.assign(o, { x: m.x, y: m.y, dx, dy });
      } else if (word === 'culling' && side === 'behind') {
        const [x, y] = at(p.at[0], p.at[1]); Object.assign(o, { x, y, pts: [p.taken] });
      } else if (side === 'monster') {
        const m = g.monsters.find((q) => q.id === o.ids[0]); Object.assign(o, { x: m.x, y: m.y, x1: h.x, y1: h.y, dx: h.x - m.x, dy: h.y - m.y });
      } else if (word === 'surging') {
        const [x, y] = at(p.at[0], p.at[1]); Object.assign(o, { x, y });
      } else if (word === 'plundering') {
        const [x, y] = at(p.at[0], p.at[1]); Object.assign(o, { x, y, x1: h.x, y1: h.y });
      } else if (word === 'mirroring' && side === 'front') {
        Object.assign(o, { x: h.x, y: h.y });
      } else if (word === 'mirroring' && side === 'behind') {
        const [x, y] = at(p.at[0], p.at[1]); const [dx, dy] = dirOf(p.dir); Object.assign(o, { x, y, dx, dy });
      }
      const still = o.at ?? sc.at;
      delete o.at;
      w7.play(word, side, o);
      d.slowmo = 1e-6;
      // (no numbers of the game's own over them: the still is of the look)
      fx.floaters.length = 0;
      for (const m of g.monsters) if (!sc.weak) m.life = m.maxLife;
      w7.at(still);
      const pt = (ax, dn) => { const [x, y] = at(ax, dn); return d.at(x, y); };
      return { hero: d.at(h.x, h.y), focus: pt(sc.focus[0], sc.focus[1]), close: pt(sc.close[0], sc.close[1]), scale: d.screen.scale, w: d.screen.w, h: d.screen.h, still };
    }, [sc, res.ids, word, side, res.hx, res.hy]);
    await page.waitForTimeout(400);
    snap.note(sc.key.replace(':', '_'), focus);
    await snap(sc.key.replace(':', '_'));
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
