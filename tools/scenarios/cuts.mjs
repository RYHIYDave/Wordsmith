// TRIANGLES IN REAL DUNGEON ROOMS, photographed (the owner, 7 Oct 2026: "Triangles look pretty good
// I like it"; he was told: "You'll see real dungeon rooms before it goes live"; these are the
// pictures he said "That’s good." of, 11:28, and the corners are cut clean in the game since
// Version 18.2). This sets the switch for itself (__dbg.relief.cuts) and puts it back, begins a
// run, goes into dungeon number DEPTH, shows it whole, and stands the hero in the middle of each
// room that has a cut corner (up to ROOMS of them). The monsters stay where they were put, asleep.
//   SEED=5 DEPTH=2 ROOMS=4 node tools/playtest.mjs --file dist/tri.html --size 1300x660 --scenario tools/scenarios/cuts.mjs --out shots/cuts/a
// CUTS=0 takes the pictures with the switch off: the same rooms as they were before Version 18.2, for a before and after.
// ONLY=8,12 photographs those rooms alone. The log says of each room how its four corners are cut
// (back/right/left/front, in tiles), whether it has a terrace (and how many half tiles of it), sunken
// floor, chests: an eight-sided hall is one with three corners or more cut 3 or wider; a flat back
// wall is a back corner cut wider than the rest. AT=x,y stands the hero there in place of the
// room's middle (tiles from the room's back corner).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 5);
  const depth = Number(process.env.DEPTH || 2);
  const want = Number(process.env.ROOMS || 4);
  const on = process.env.CUTS !== '0';
  // The map-maker also lays corridors straight across the screen (its own switch, __dbg.relief.across: on in the game since Version 18.3; ACROSS=0 takes the pictures without them, ACROSS=1 with them whichever way the switch stands), and with ACROSS=1 up to BANDS of them are photographed, the hero standing in the middle of each
  const across = process.env.ACROSS === '1';
  const acrossOff = process.env.ACROSS === '0';
  const wantBands = Number(process.env.BANDS || 2);
  const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
  // (which rooms have a cut corner is asked with the switch on, whichever way the pictures are taken)
  const rooms = await page.evaluate(([cls, seed, depth, on, across, acrossOff]) => {
    const d = window.__dbg; d.saving(false);
    const was = [d.relief.cuts, d.relief.across];
    const enter = (cuts) => { d.relief.cuts = cuts; d.relief.across = cuts && !acrossOff && (across || was[1]); d.run(cls, seed); const g = d.game(); g.depth = depth; g.enterDungeon(); return g; };
    let g = enter(true);
    const f = g.level.floor;
    const out = [];
    if (f.cut) for (const r of f.rooms) {
      let n = 0;
      for (let y = r.y - 1; y <= r.y + r.h; y++) for (let x = r.x - 1; x <= r.x + r.w; x++) if (f.cut[y * f.w + x]) n++;
      if (!n) continue;
      // how many tiles each corner is cut (back, right, left, front): along the room's edge from the corner, the first tile that is floor
      const cutOf = (cx, cy, sx) => { let k = 0; while (k < 9 && f.tiles[cy * f.w + cx + k * sx] !== 1) k++; return k; };
      const x1 = r.x + r.w - 1, y1 = r.y + r.h - 1;
      const corners = [cutOf(r.x, r.y, 1), cutOf(x1, r.y, -1), cutOf(r.x, y1, 1), cutOf(x1, y1, -1)];
      // its terrace, and the half tiles of it
      let raised = 0, halves = 0, sunk = 0;
      if (f.height) for (let y = r.y; y <= y1; y++) for (let x = r.x; x <= x1; x++) {
        const i = y * f.w + x;
        if (f.tiles[i] !== 1) continue;
        if (f.height[i] > 0) { raised++; if (f.cut[i]) halves++; }
        if (f.height[i] < 0) sunk++;
      }
      const chests = g.level.props.filter((p) => p.kind === 'chest' && p.tx >= r.x && p.tx <= x1 && p.ty >= r.y && p.ty <= y1).length;
      out.push({ id: r.id, kind: r.kind, x: r.x, y: r.y, w: r.w, h: r.h, cuts: n, corners, raised, halves, sunk, chests });
    }
    // the corridors straight across the screen: the half tiles of floor that are in no room, on a band's far side, gathered band by band
    const bands = [];
    if (f.cut) {
      const inRoom = (x, y) => f.rooms.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
      const taken = new Set();
      for (let i = 0; i < f.cut.length; i++) {
        if (f.cut[i] !== 1 || f.tiles[i] !== 1 || taken.has(i) || inRoom(i % f.w, Math.floor(i / f.w))) continue;
        const run = [];
        for (let j = i; j >= 0 && f.cut[j] === 1 && f.tiles[j] === 1 && !taken.has(j); j += f.w - 1) { run.push(j); taken.add(j); }
        for (let j = i - f.w + 1; j >= 0 && f.cut[j] === 1 && f.tiles[j] === 1 && !taken.has(j); j -= f.w - 1) { run.push(j); taken.add(j); }
        run.sort((a, b) => (a % f.w) - (b % f.w));
        const m = run[Math.floor(run.length / 2)];
        // (the tile two rows toward the eye from the middle of its far side: the middle of its floor)
        bands.push({ long: run.length, x: (m % f.w) + 1.5, y: Math.floor(m / f.w) + 1.5 });
      }
    }
    window.__bands = bands;
    if (!on) g = enter(false);
    d.relief.cuts = was[0];
    d.relief.across = was[1];
    d.autoLevel = false; d.autoWords = false;
    g.wakeUp = () => {};
    g.level.explored.fill(1);
    return out;
  }, [cls, seed, depth, on, across, acrossOff]);
  log('rooms with a cut corner', rooms.map((r) => `${r.id}:${r.kind} ${r.w}x${r.h} corners ${r.corners.join('/')}${r.raised ? `, terrace ${r.raised} (${r.halves} half tiles)` : ''}${r.sunk ? ', sunken floor' : ''}${r.chests ? `, ${r.chests} chest(s)` : ''}`).join(' | ') || 'none');
  await page.evaluate((at) => { window.__cutsAt = at; }, process.env.AT || '');
  await page.waitForTimeout(500);
  let k = 0;
  for (const r of rooms.filter((q) => !only || only.includes(q.id)).slice(0, want)) {
    await page.evaluate((r) => {
      const g = window.__dbg.game(); const h = g.hero; const f = g.level.floor;
      const at = (window.__cutsAt || '').split(',').map(Number);
      const cx = at.length === 2 && !isNaN(at[0]) ? r.x + at[0] : r.x + r.w / 2, cy = at.length === 2 && !isNaN(at[1]) ? r.y + at[1] : r.y + r.h / 2;
      let best = null, bd = 1e9;
      for (let y = cy - 3; y <= cy + 3; y += 0.5) for (let x = cx - 3; x <= cx + 3; x += 0.5) {
        if (!g.free(g.level.walk, x, y, 0.45)) continue;
        let nearM = 1e9;
        for (const m of g.monsters) nearM = Math.min(nearM, Math.hypot(m.x - x, m.y - y));
        const d = Math.hypot(x - cx, y - cy) + (nearM < 1.6 ? 50 : 0);
        if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) { h.x = best[0]; h.y = best[1]; }
      h.fx = 0.7; h.fy = 0.7;
      clearInterval(window.__still);
      window.__still = setInterval(() => { for (const m of g.monsters) { m.state = 'sleep'; m.seen = true; } h.invuln = 1; h.flash = 0; g.level.explored.fill(1); g.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    }, r);
    await page.waitForTimeout(900);
    await snap(`room${r.id}`);
    k++;
  }
  log('rooms photographed', k);
  if (across) {
    const bands = await page.evaluate(() => window.__bands);
    log('corridors straight across the screen', bands.map((b) => `${b.long} tiles long, its middle at ${b.x},${b.y}`).join(' | ') || 'none');
    let n = 0;
    for (const b of bands.slice(0, wantBands)) {
      await page.evaluate((b) => { const g = window.__dbg.game(); const h = g.hero; h.x = b.x; h.y = b.y; h.fx = 0.7; h.fy = -0.7; }, b);
      await page.waitForTimeout(900);
      await snap(`band${n++}`);
    }
  }
}
