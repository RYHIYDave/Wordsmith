// ACT 2, THE HUSH: FLOOR 12, THE UNDERCITY, as its map-maker and dresser lay it (game/act2/undercity.ts; behind ACT2, off:
// switched on here by the test hook, __dbg.act2). Pictures, the hero stood at each place in god mode, its monsters taken
// away but the King: where he comes in (the river's outflow under the walls), a tunnel with its channel and a crossing, a
// cistern round its pool, the Muffled Bell's cistern, a sluice and its bell, the King's Cistern; and a map of the floor's
// tiles as the screen sees them (the walkways, the cisterns' paving, the Order's dug tunnels, the grates and planks, the
// water; where he comes in, the bells, the Hush's circle, the King, the way on).
//   node tools/build_to.mjs dist/f12.html
//   node tools/playtest.mjs --file dist/f12.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_undercity.mjs --out shots/f12/a
// SEED: the run's (3). WAIT: ms at each place (6000: the ground's worker paints the pieces round him meanwhile). FOES=1: its monsters kept.
export default async function (page, snap) {
  const seed = Number(process.env.SEED ?? 3);
  const wait = Number(process.env.WAIT ?? 6000);
  const foes = process.env.FOES === '1';
  const info = await page.evaluate(([s, keep]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', s);
    D.seasoned(20);
    D.god = true;
    D.act2(true, 12);
    const g = D.game();
    const L = g.level;
    L.explored.fill(1);
    if (!keep) g.monsters = g.monsters.filter((m) => m.boss);
    const f = L.floor;
    const land = L.land;
    const W = f.w;
    const z = (x, y) => land.zones[y * W + x];
    const wet = (x, y) => land.water[y * W + x] === 1;
    // a crossing over a sewer's channel (two across), on the longest run of it: the hero on the near walkway beside it
    let cross = null;
    let longest = 0;
    const runOf = (x, y, dx, dy) => {
      let n = 0;
      for (const s of [1, -1]) for (let k = 1; k < 60; k++) {
        const u = x + dx * k * s;
        const v = y + dy * k * s;
        if (u < 0 || v < 0 || u >= W || v >= f.h || !(wet(u, v) || z(u, v) === 2 || z(u, v) === 3)) break;
        n++;
      }
      return n;
    };
    for (let i = 0; i < W * f.h; i++) {
      const x = i % W;
      const y = (i - x) / W;
      if (z(x, y) !== 2 && z(x, y) !== 3) continue;
      let c = null;
      let n = 0;
      if (wet(x - 1, y) && wet(x - 1, y + 1)) { c = { x: x + 1, y: y + 3.5 }; n = runOf(x, y, 1, 0); }
      else if (wet(x, y - 1) && wet(x + 1, y - 1)) { c = { x: x + 3.5, y: y + 1 }; n = runOf(x, y, 0, 1); }
      if (c && n > longest) { longest = n; cross = c; }
    }
    const rooms = f.rooms;
    const areas = land.areas.map((a) => ({ x: a.blob.x, y: a.blob.y, role: a.role, kind: rooms[a.room].kind, room: a.room }));
    // a cistern of the main way (paved, a pool), else the Muffled Bell's
    const isCistern = (r) => land.zones[(r.y + 1) * W + r.x + 1] === 1;
    const cistern = rooms.find((r) => r.kind !== 'boss' && r.path > 0 && isCistern(r)) ?? null;
    const b = land.bells;
    const bell = b.bells[0];
    const nest = L.props.find((p) => p.name === "the King's nest");
    const traps = (L.act1.traps ?? []).map((t) => ({ name: t.name, x: t.x + t.w / 2, y: t.y + t.h / 2 }));
    const flood = traps.find((t) => t.name === 'the flood, a sluice bursting') ?? null;
    const slick = traps.find((t) => t.name === 'a slick of slime') ?? null;
    return {
      flood, slick,
      nest: nest ? { x: nest.x, y: nest.y } : null,
      w: W, h: f.h, start: f.start, boss: f.boss, exit: land.exit, cross,
      cistern: cistern ? { x: cistern.x + cistern.w / 2, y: cistern.y + cistern.h - 3 } : null,
      muffled: b.muffled, bell, r: b.hush.r, bells: b.bells.length,
      packs: f.packs.length, props: L.props.length, hazards: L.hazards.length, areas: areas.length,
    };
  }, [seed, foes]);
  console.log('  floor 12', JSON.stringify({ size: [info.w, info.h], bells: info.bells, r: info.r, packs: info.packs, props: info.props, hazards: info.hazards, areas: info.areas }));
  const go = async (x, y, name) => {
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; }, [x, y]);
    await page.waitForTimeout(wait);
    // (a step and back, so that the ground's pieces round him are asked for again if any were missed)
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a + 0.3; g.hero.y = b; }, [x, y]);
    await page.waitForTimeout(800);
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; }, [x, y]);
    await page.waitForTimeout(1200);
    await snap(name);
  };
  await page.waitForTimeout(wait);
  await snap('a_start');
  if (info.cross) await go(info.cross.x, info.cross.y, 'b_tunnel');
  if (info.cistern) await go(info.cistern.x, info.cistern.y, 'c_cistern');
  await go(info.muffled.x + 1.5, info.muffled.y + 2, 'd_muffled');
  await go(info.bell.x + 1.5, info.bell.y + 0.2, 'e_bell');
  // (the King's Cistern from its nest's side: the nest, the jar of the Crier's voice, the floor open beyond)
  if (info.nest) await go(info.nest.x + 4, info.nest.y + 4, 'f_king_nest');
  await go(info.boss.x, info.boss.y + 5, 'f_king');
  await go(info.exit.x, info.exit.y + 1, 'g_way_on');
  // ITS TWO TRAPS: the flood (a sluice bursting, its walkway flooded on the spike floor's beat) and the slick, a few moments of each
  for (const [t, name] of [[info.flood, 'i_flood'], [info.slick, 'j_slick']]) {
    if (!t) continue;
    await go(t.x + 2.5, t.y + 2.5, `${name}_0`);
    for (let k = 1; k <= 7; k++) {
      await page.waitForTimeout(330);
      await snap(`${name}_${k}`);
    }
  }
  // THE MAP: the floor's tiles as the screen sees them (x down to the right, y down to the left), over the game
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const L = g.level;
    const f = L.floor;
    const land = L.land;
    const W = f.w;
    const H = f.h;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const k = Math.min((vw - 20) / (W + H), (vh - 20) / ((W + H) / 2));
    const ox = vw / 2 - ((W - H) / 2) * k;
    const oy = vh / 2 - ((W + H) / 4) * k;
    const c = document.createElement('canvas');
    c.width = vw * 2;
    c.height = vh * 2;
    c.style.cssText = `position:fixed;left:0;top:0;width:${vw}px;height:${vh}px;z-index:99;background:#0b0d14`;
    const x = c.getContext('2d');
    x.scale(2, 2);
    const at = (tx, ty) => [ox + (tx - ty) * k, oy + (tx + ty) * k / 2];
    const cell = (tx, ty, col) => {
      const [sx, sy] = at(tx, ty);
      x.fillStyle = col;
      x.beginPath();
      x.moveTo(sx, sy);
      x.lineTo(sx + k, sy + k / 2);
      x.lineTo(sx, sy + k);
      x.lineTo(sx - k, sy + k / 2);
      x.closePath();
      x.fill();
    };
    const ZC = ['#6a6c78', '#8a5c48', '#b8b0a0', '#c8a058', '#4a3a2c'];
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      const i = ty * W + tx;
      if (land.water[i]) cell(tx, ty, '#2a6a58');
      else if (f.tiles[i] === 1) cell(tx, ty, L.walk[i] ? ZC[land.zones[i]] ?? '#888' : '#222');
    }
    const dot = (p, col, r) => {
      const [sx, sy] = at(p.x, p.y);
      x.fillStyle = col;
      x.beginPath();
      x.arc(sx, sy, r, 0, Math.PI * 2);
      x.fill();
    };
    for (const z of L.hazards) dot({ x: z.spot.x + z.spot.w / 2, y: z.spot.y + z.spot.h / 2 }, '#e05030', 2.5);
    for (const p of f.packs) dot(p, '#c040c0', 2);
    const b = land.bells;
    // the Hush's circle (a circle on the floor is an ellipse on the screen)
    const [hx, hy] = at(b.hush.x, b.hush.y);
    x.strokeStyle = '#9090a0';
    x.setLineDash([3, 3]);
    x.beginPath();
    x.ellipse(hx, hy, b.hush.r * k * Math.SQRT2, b.hush.r * k * Math.SQRT2 / 2, 0, 0, Math.PI * 2);
    x.stroke();
    for (const q of b.bells) dot(q, '#30e0f0', 3);
    dot(b.muffled, '#ffffff', 4);
    dot(f.start, '#40ff40', 4);
    dot(f.boss, '#ff3030', 5);
    dot(land.exit, '#ffd040', 4);
    x.fillStyle = '#ddd';
    x.font = '11px sans-serif';
    x.fillText(`Floor 12, the Undercity: ${W} x ${H} tiles. green: where he comes in; white: the Muffled Bell; cyan: the bells; dashed: the Hush`, 8, 14);
    x.fillText('red: the King; yellow: the way on; purple: packs; orange-red: traps. Walkways grey, cisterns brick, the Order\'s tunnels dark, grates pale, planks gold, water green.', 8, 28);
    document.body.appendChild(c);
  });
  await page.waitForTimeout(300);
  await snap('h_map');
}
