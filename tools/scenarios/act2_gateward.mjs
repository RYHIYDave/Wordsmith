// ACT 2, THE HUSH: FLOOR 11, THE GATE WARD, as its own map-maker lays it (game/act2/gateward.ts; behind ACT2, off, switched on
// here by the test hook, __dbg.act2). Pictures of the hero at the broken gate where he comes in, in a lane, in a square of the
// market, walking into a house (before and after its front and roof fade: render/act2_houses.ts), the Crier's Square, and a
// map of the floor's tiles.
//   node tools/build_to.mjs dist/gw.html
//   node tools/playtest.mjs --file dist/gw.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_gateward.mjs --out shots/gw/a
// SEED: the run's (3). FOES=1: its monsters kept (else all but the boss taken away). ONLY: a comma list of the pictures to take
// (gate, lane, square, house, crier, map). WAIT: ms after each move (1200).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED ?? 3);
  const foes = process.env.FOES === '1';
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
  const want = (k) => !only || only.has(k);
  const wait = Number(process.env.WAIT ?? 1200);
  const info = await page.evaluate(([s, keep]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', s);
    D.seasoned(20);
    D.autoLevel = false;
    D.god = true;
    const t0 = performance.now();
    D.act2(true, 11);
    const ms = Math.round(performance.now() - t0);
    const g = D.game();
    const L = g.level;
    L.explored.fill(1);
    if (!keep) g.monsters = g.monsters.filter((m) => m.boss);
    const land = L.land;
    return {
      ms,
      kind: land?.kind,
      w: L.floor.w,
      h: L.floor.h,
      start: L.floor.start,
      boss: L.floor.boss,
      exit: land.exit,
      areas: land.areas.map((a) => ({ x: a.blob.x, y: a.blob.y, rx: a.blob.rx, ry: a.blob.ry, role: a.role })),
      lanes: land.lanes.map((l) => l.pts),
      way: land.way,
      houses: land.houses,
      bells: land.bells,
      pieces: L.props.filter((p) => p.kind === 'piece').length,
      boss_kind: g.boss?.kind ?? null,
    };
  }, [seed, foes]);
  log('floor', JSON.stringify({ ms: info.ms, kind: info.kind, size: [info.w, info.h], areas: info.areas.length, houses: info.houses.length, bells: info.bells.bells.length, pieces: info.pieces, boss: info.boss_kind }));
  // (the shells of the houses walked into: painted by the ground's worker, a house at a time)
  const shells = async (ms) => {
    const t0 = Date.now();
    let n = 0;
    while (Date.now() - t0 < ms) {
      n = await page.evaluate(() => window.__dbg.renderer.houses.ready());
      if (n >= info.houses.length) break;
      await page.waitForTimeout(500);
    }
    log('shells', `${n} of ${info.houses.length} in ${Date.now() - t0} ms`, JSON.stringify(await page.evaluate(() => window.__dbg.renderer.houses.stats)));
  };
  const go = async (x, y, name, ms = wait) => {
    await page.evaluate(([a, b]) => {
      const g = window.__dbg.game();
      g.hero.x = a;
      g.hero.y = b;
    }, [x, y]);
    await page.waitForTimeout(ms);
    if (name) await snap(name);
  };
  await page.waitForTimeout(3000);
  if (want('gate')) await snap('a_gate');
  await shells(90000);
  if (want('lane')) {
    // (a main lane, half way along it)
    const l = info.lanes[Math.min(2, info.lanes.length - 1)];
    const a = l[Math.floor((l.length - 1) / 2)];
    const b = l[Math.floor((l.length - 1) / 2) + 1];
    await go((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 'b_lane');
  }
  if (want('square')) {
    // (the biggest square of the market on the main way, a little off its heart)
    const sq = info.areas.filter((q) => q.role === 'path').sort((p, q) => q.rx * q.ry - p.rx * p.ry)[0];
    await go(sq.x + 1.5, sq.y + 2.5, 'c_square');
  }
  if (want('house')) {
    // (each house walked into, or the first two: in the street two tiles before its doorway, then in it, then in its room)
    const list = info.houses.slice(0, Number(process.env.HOUSES ?? 2));
    for (let k = 0; k < list.length; k++) {
      const h = list[k];
      const F = h.front;
      const mid = (F.door[0] + F.door[1]) / 2;
      const out = F.along === 'x' ? [mid, F.at + 2.5] : [F.at + 2.5, mid];
      const door = F.along === 'x' ? [mid, F.at + 0.5] : [F.at + 0.5, mid];
      const inn = F.along === 'x' ? [mid, F.at - 1.5] : [F.at - 1.5, mid];
      await go(out[0], out[1], `d_house${k}_1street`);
      await go(door[0], door[1], `d_house${k}_2door_fading`, 150);
      await go(inn[0], inn[1], `d_house${k}_3inside`, 900);
      log(`house ${k} shown`, JSON.stringify(await page.evaluate(() => window.__dbg.renderer.houses.showing())));
      await go(out[0], out[1], `d_house${k}_4back_out`, 900);
    }
  }
  if (want('bells')) {
    // (the Muffled Bell in its bell-cote by the side market's back edge, gagged; each small bell, quiet)
    const B = info.bells;
    await go(B.muffled.x + 1.5, B.muffled.y + 2.5, 'g_bell_muffled');
    for (let k = 0; k < B.bells.length; k++) await go(B.bells[k].x + 1.5, B.bells[k].y + 2, `g_bell${k}`);
  }
  if (want('crier')) {
    const b = info.areas.find((q) => q.role === 'boss');
    // (the Crier's gate at the main way's mouth into his square, then the square from its middle, then by the way on)
    const e = info.way[info.way.length - 2];
    await go(e[0] - Math.sign(b.x - e[0]) * (Math.abs(b.x - e[0]) > Math.abs(b.y - e[1]) ? 2.5 : 0), e[1] - Math.sign(b.y - e[1]) * (Math.abs(b.y - e[1]) >= Math.abs(b.x - e[0]) ? 2.5 : 0), 'e_crier_gate');
    await go(b.x, b.y, 'e_crier');
    await go(info.exit.x, info.exit.y - 3, 'e_crier_far');
  }
  if (want('map')) {
    // A MAP OF THE FLOOR'S TILES, over the screen: houses dark, the streets grey, the squares paler, the rooms brown, the fronts of
    // houses walked into red, what stands in the way white; the start green, the boss red, the way on gold; the Muffled Bell
    // magenta, the small bells cyan, the Hush's circle round them; the packs orange
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const L = g.level;
      const f = L.floor;
      const land = L.land;
      const k = Math.max(2, Math.floor(Math.min(window.innerWidth / f.w, window.innerHeight / f.h) * (window.devicePixelRatio || 1)));
      const c = document.createElement('canvas');
      c.width = f.w * k;
      c.height = f.h * k;
      c.style.cssText = `position:fixed;left:0;top:0;z-index:99;width:${(f.w * k) / (window.devicePixelRatio || 1)}px;height:${(f.h * k) / (window.devicePixelRatio || 1)}px;image-rendering:pixelated;background:#000`;
      const x = c.getContext('2d');
      for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
        const i = ty * f.w + tx;
        const z = land.zones[i];
        const front = land.houses.some((h) => (h.front.along === 'x' ? ty === h.front.at && tx >= h.room[0] && tx < h.room[2] : tx === h.front.at && ty >= h.room[1] && ty < h.room[3]));
        x.fillStyle = f.tiles[i] !== 1 ? (front ? '#c03030' : '#1d1828') : L.walk[i] !== 1 ? '#e8e8e8' : z === 2 ? '#8a5a34' : z === 1 ? '#77707e' : '#4c4652';
        x.fillRect(tx * k, ty * k, k, k);
      }
      const dot = (p, col, r = 1) => {
        x.fillStyle = col;
        x.fillRect(Math.floor(p.x) * k - (r - 1) * k, Math.floor(p.y) * k - (r - 1) * k, k * (2 * r - 1), k * (2 * r - 1));
      };
      for (const p of f.packs) dot(p, '#ff9a2a');
      dot(f.start, '#3cff6a', 2);
      if (f.boss) dot(f.boss, '#ff2a2a', 2);
      dot(land.exit, '#ffd040', 2);
      const B = land.bells;
      dot(B.muffled, '#ff40ff', 2);
      for (const b of B.bells) dot(b, '#30e8ff', 2);
      x.strokeStyle = '#ff40ff';
      x.lineWidth = Math.max(1, k / 2);
      x.beginPath();
      x.arc(B.hush.x * k, B.hush.y * k, B.hush.r * k, 0, Math.PI * 2);
      x.stroke();
      document.body.appendChild(c);
    });
    await page.waitForTimeout(300);
    await snap('f_map');
  }
}
