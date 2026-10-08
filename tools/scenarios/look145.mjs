// The look of the place (Version 14.5): a walk through a dungeon with nothing in it to fight,
// stopping in a room of each kind and in a corridor, and a picture taken at each stop; then the
// town. For looking at, and for the few things a picture cannot say that a test can.
//   node tools/playtest.mjs --size 1300x660 --scenario tools/scenarios/look145.mjs --out shots/look145
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/look145.mjs --out shots/look145_phone
//   CLS=mage  DEPTH=2  SEED=9  STOPS=6 (how many rooms)  ONLY=elite (rooms of one kind)  MONSTERS=1 (leave them in)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const depth = Number(process.env.DEPTH) || 2;
  const seed = Number(process.env.SEED) || 9;
  const stops = Number(process.env.STOPS) || 6;
  let bad = 0;
  const flag = (what) => { bad++; console.log(`  !! ${what}`); };
  await page.evaluate(([c, s]) => { const d = window.__dbg; d.saving(false); d.run(c, s); d.autoLevel = false; d.autoWords = false; d.god = true; }, [cls, seed]);
  await page.waitForTimeout(600);
  await snap('00_town');
  await page.evaluate(([dep, keep]) => {
    const g = window.__dbg.game(); g.depth = dep; g.cleared = dep; g.enterDungeon();
    g.level.explored.fill(1);
    if (!keep) g.monsters.splice(0);
  }, [depth, process.env.MONSTERS === '1']);
  await page.waitForTimeout(600);
  const rooms = await page.evaluate(() => {
    const g = window.__dbg.game(); const f = g.level.floor;
    return f.rooms.map((r) => ({ id: r.id, kind: r.kind, x: r.x, y: r.y, w: r.w, h: r.h, path: r.path }));
  });
  log('rooms', rooms.map((r) => `${r.kind} ${r.w}x${r.h}`).join(', '));
  /** Set the hero down on the free tile nearest a point, and let the picture settle. */
  const goto = async (x, y) => {
    const at = await page.evaluate(([px, py]) => {
      const g = window.__dbg.game(); const L = g.level; const f = L.floor; const h = g.hero;
      let best = null; let bd = 1e9;
      for (let ty = Math.floor(py) - 4; ty <= py + 4; ty++) for (let tx = Math.floor(px) - 4; tx <= px + 4; tx++) {
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h || L.walk[ty * f.w + tx] !== 1) continue;
        if (L.props.some((p) => p.solid && p.tx === tx && p.ty === ty)) continue;
        const d = Math.hypot(tx + 0.5 - px, ty + 0.5 - py);
        if (d < bd) { bd = d; best = { x: tx + 0.5, y: ty + 0.5 }; }
      }
      if (!best) return null;
      h.x = best.x; h.y = best.y; h.fx = 0.7; h.fy = 0.7;
      return best;
    }, [x, y]);
    await page.waitForTimeout(450);
    return at;
  };
  // a room of each kind first, then the biggest of the rest
  const order = [];
  for (const k of ['start', 'normal', 'elite', 'treasure', 'guardian', 'boss']) { const r = rooms.find((q) => q.kind === k); if (r) order.push(r); }
  for (const r of [...rooms].sort((a, b) => b.w * b.h - a.w * a.h)) if (!order.includes(r)) order.push(r);
  // (ONLY=elite: just the rooms of that kind)
  const only = process.env.ONLY ? order.filter((r) => r.kind === process.env.ONLY) : order;
  let n = 0;
  for (const r of only.slice(0, stops)) {
    const at = await goto(r.x + r.w / 2, r.y + r.h / 2);
    if (!at) { flag(`no free tile in room ${r.id}`); continue; }
    n++;
    await snap(`${String(n).padStart(2, '0')}_${r.kind}_${r.w}x${r.h}`);
  }
  // a corridor: the floor tile farthest from every room's middle that is still floor
  const mid = await page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level; const f = L.floor;
    const inRoom = (x, y) => f.rooms.some((r) => x >= r.x - 1 && y >= r.y - 1 && x <= r.x + r.w && y <= r.y + r.h);
    let best = null; let bd = -1;
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
      if (L.walk[y * f.w + x] !== 1 || inRoom(x, y)) continue;
      let d = 1e9;
      for (const r of f.rooms) d = Math.min(d, Math.hypot(x - (r.x + r.w / 2), y - (r.y + r.h / 2)));
      if (d > bd) { bd = d; best = { x: x + 0.5, y: y + 0.5 }; }
    }
    return best;
  });
  if (mid && !process.env.ONLY) { await goto(mid.x, mid.y); await snap('20_corridor'); }
  // what the page said while it was looked at
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) flag(`letters the fonts cannot draw: ${missing.join(' ')}`);
  log('result', bad ? `${bad} problem(s)` : 'looked at; nothing a test can see is wrong');
}
