// ACT 2, THE HUSH: FLOOR 15, THE GREAT LIBRARY, AS ITS MAP-MAKER LAYS IT AND ITS DRESSER DRESSES IT (game/act2/library.ts; behind
// ACT2, off: switched on here by the test hook, __dbg.act2). Pictures of the doors where he comes in, the stacks, a great hall,
// the scriptorium, the room of the closing bell (the Muffled Bell), the Reading Room, the way on past it, and a map of the
// floor's tiles (its rooms by zone, its pieces, its bells and the Hush's circle, the start, the boss and the way on).
//   node tools/build_to.mjs dist/act2.html
//   node tools/playtest.mjs --file dist/act2.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_library.mjs --out shots/f15/lib
// SEED: the run's (3). FOES=1: its monsters kept (else all but the boss taken away). WAIT: ms at each place (2500).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED ?? 3);
  const foes = process.env.FOES === '1';
  const wait = Number(process.env.WAIT ?? 2500);
  const info = await page.evaluate(([s, keep]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', s);
    D.seasoned(20);
    D.autoLevel = false;
    D.autoWords = false;
    D.god = true;
    D.act2(true, 15);
    const g = D.game();
    const L = g.level;
    L.explored.fill(1);
    if (!keep) g.monsters = g.monsters.filter((m) => m.boss);
    const f = L.floor;
    const land = L.land;
    const W = f.w;
    const zoneAt = (r) => land.zones[(r.y + Math.floor(r.h / 2)) * W + r.x + Math.floor(r.w / 2)];
    // (a walkable tile nearest a point)
    const near = (x, y) => {
      let best = null;
      let bd = Infinity;
      for (let ty = Math.floor(y) - 6; ty <= Math.floor(y) + 6; ty++) for (let tx = Math.floor(x) - 6; tx <= Math.floor(x) + 6; tx++) {
        if (tx < 0 || ty < 0 || tx >= W || ty >= f.h || L.walk[ty * W + tx] !== 1) continue;
        const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
        if (d < bd) { bd = d; best = { x: tx + 0.5, y: ty + 0.5 }; }
      }
      return best;
    };
    const roomOf = (pred) => f.rooms.find(pred);
    const mid = (r) => near(r.x + r.w / 2, r.y + r.h / 2);
    const stacks = roomOf((r) => zoneAt(r) === 0 && r.path > 0);
    const hall = roomOf((r) => zoneAt(r) === 1 && r.path > 1 && r.kind !== 'boss' && r.w * r.h > 280);
    const script = roomOf((r) => zoneAt(r) === 3 && r.path > 0) ?? roomOf((r) => zoneAt(r) === 3);
    const reading = roomOf((r) => r.kind === 'boss');
    const heart = { x: reading.x + Math.floor(reading.w / 2) + 0.5, y: reading.y + Math.floor(reading.h / 2) + 0.5 };
    const dx = Math.sign(Math.round(f.boss.x - heart.x));
    const dy = Math.sign(Math.round(f.boss.y - heart.y));
    const bm = land.bells?.muffled;
    return {
      w: W, h: f.h, depth: g.depth, kind: land.kind,
      packs: f.packs.length, monsters: g.monsters.length, boss: g.boss?.kind ?? null,
      bells: land.bells ? land.bells.bells.length : 0,
      start: f.start,
      stacks: stacks ? mid(stacks) : null,
      hall: hall ? mid(hall) : null,
      script: script ? mid(script) : null,
      reading: near(heart.x - dx * 7, heart.y - dy * 7),
      lectern: near(heart.x - dx * 3 + dy * 2, heart.y - dy * 3 + dx * 2),
      bell: bm ? near(bm.x + 2, bm.y + 2) : null,
      exit: near(land.exit.x + 1, land.exit.y + 1),
    };
  }, [seed, foes]);
  log('floor 15', JSON.stringify(info));
  if (info.kind !== 'library') log('!! not the Great Library', info.kind);
  const go = async (p, name) => {
    if (!p) { log('!! no place for', name); return; }
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [p.x, p.y]);
    await page.waitForTimeout(wait);
    await snap(name);
  };
  // (the floor's name card gone first)
  await page.waitForTimeout(Math.max(wait, 12000));
  await snap('a_doors');
  await go(info.stacks, 'b_stacks');
  await go(info.hall, 'c_hall');
  await go(info.script, 'd_scriptorium');
  await go(info.bell, 'e_bell');
  // (the Reading Room as it is laid: the boss, a stand-in until the Censor is built, kept out of its pictures, and his line not said)
  await page.evaluate(() => { const g = window.__dbg.game(); g.bossMet = true; g.monsters = g.monsters.filter((m) => !m.boss); });
  await go(info.reading, 'f_reading');
  await go(info.lectern, 'f_reading_heart');
  await go(info.exit, 'g_wayon');
  // THE MAP: the floor's tiles, its rooms by zone, what stands, its bells and the Hush's circle
  const K = 4;
  const size = page.viewportSize();
  await page.setViewportSize({ width: info.w * K + 8, height: info.h * K + 8 });
  await page.evaluate((k) => {
    const g = window.__dbg.game();
    const L = g.level;
    const f = L.floor;
    const land = L.land;
    const c = document.createElement('canvas');
    c.id = 'f15map';
    c.width = f.w * k + 8;
    c.height = f.h * k + 8;
    c.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#0c0a0d';
    const x = c.getContext('2d');
    const ZC = ['#6b4a2e', '#8a877e', '#5a2e2a', '#4a4d52'];
    for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
      const i = ty * f.w + tx;
      if (f.tiles[i] !== 1) continue;
      x.fillStyle = ZC[land.zones[i]] ?? '#888';
      x.fillRect(4 + tx * k, 4 + ty * k, k, k);
      if (L.walk[i] !== 1) { x.fillStyle = '#1a1414'; x.fillRect(4 + tx * k + 1, 4 + ty * k + 1, k - 2, k - 2); }
    }
    for (const h of f.hazards ?? []) { x.fillStyle = '#000'; x.fillRect(4 + h.x * k, 4 + h.y * k, k, k); }
    const dot = (p, col, r) => { x.fillStyle = col; x.beginPath(); x.arc(4 + p.x * k, 4 + p.y * k, r, 0, Math.PI * 2); x.fill(); };
    for (const p of L.props) if (p.name === 'a candle chandelier') dot(p, '#f0a040', 1.5);
    for (const p of f.packs) dot(p, '#c03050', 3);
    const b = land.bells;
    if (b) {
      x.strokeStyle = 'rgba(200,200,220,0.7)';
      x.beginPath(); x.arc(4 + b.hush.x * k, 4 + b.hush.y * k, b.hush.r * k, 0, Math.PI * 2); x.stroke();
      for (const q of b.bells) dot(q, '#28dcf0', 4);
      dot(b.muffled, '#ffffff', 5);
    }
    dot(f.start, '#40ff60', 5);
    dot(f.boss, '#ff40ff', 5);
    dot(land.exit, '#ffff40', 5);
    document.body.appendChild(c);
  }, K);
  await page.waitForTimeout(300);
  await snap('h_map');
  await page.evaluate(() => document.getElementById('f15map')?.remove());
  await page.setViewportSize(size);
}
