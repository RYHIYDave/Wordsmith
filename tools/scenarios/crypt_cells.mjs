// THE CRYPT'S CELLS AND ITS OPEN FLOORS (game/dungeon.ts, CRYPT_LAYOUT, off), with the art chat's
// Crypt (art/crypt.ts, CRYPT, off) on with it: pictures of them in the game, for the owner. The
// owner, 10 Oct 2026, 08:26: "rows of jail cells along the wall.  Small rooms each with a door.
// And I’d like for the current 5, as the floors get less and less finished, I’d like to open up
// more and not be so confined and claustrophobic." Nothing to fight (the monsters are taken out),
// the whole map seen. For looking at, not a test.
//   node tools/build_to.mjs dist/cells.html
//   node tools/playtest.mjs --file dist/cells.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/crypt_cells.mjs --out shots/cells/c
//   SEED=9  CLS=warrior  OPEN=3,4,5 (the floors photographed for opening up)  CELLS=1 (the floor of the cell block)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED) || 9;
  const cellsAt = Number(process.env.CELLS) || 1;
  const opens = (process.env.OPEN || '3,4,5').split(',').map(Number);
  await page.evaluate(([c, s]) => { const d = window.__dbg; d.saving(false); d.run(c, s); d.autoLevel = false; d.autoWords = false; d.god = true; }, [cls, seed]);
  await page.waitForTimeout(600);
  /** Down to floor `dep` with the Crypt and its layout on, nothing in it to fight, the whole map seen. */
  const go = async (dep) => {
    const info = await page.evaluate((d) => {
      const dbg = window.__dbg;
      dbg.crypt(true);
      dbg.cryptLayout(true);
      // (the fallen wordsmith is not laid in it: his quest is the first floor's, and not what these show)
      const g = dbg.game(); g.depth = d; g.cleared = d; g.bodySearched = true; g.enterDungeon();
      const L = g.level; const f = L.floor;
      L.explored.fill(1);
      g.monsters.splice(0);
      dbg.fx.messages.length = 0;
      return { seed: f.seed, w: f.w, rooms: f.rooms.map((r) => ({ id: r.id, kind: r.kind, x: r.x, y: r.y, w: r.w, h: r.h, block: !!r.block, cell: !!r.cell })) };
    }, dep);
    await page.waitForTimeout(500);
    log(`floor ${dep}`, `the map-maker's seed ${info.seed}`);
    return info;
  };
  /** The hero at (x, y), facing (fx, fy); a moment for the camera; the messages cleared; a picture. */
  const shot = async (name, x, y, fx, fy) => {
    await page.evaluate(([px, py, ax, ay]) => {
      const g = window.__dbg.game(); const h = g.hero;
      h.x = px; h.y = py; h.fx = ax; h.fy = ay;
    }, [x, y, fx, fy]);
    await page.waitForTimeout(700);
    await page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
    await page.waitForTimeout(120);
    await snap(name);
  };
  const map = async (name) => {
    await page.evaluate(() => { window.__dbg.panels.open = 'map'; });
    await page.waitForTimeout(400);
    await snap(name);
    await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
    await page.waitForTimeout(200);
  };

  // ---- THE CELL BLOCK ----
  const one = await go(cellsAt);
  const cells = one.rooms.filter((r) => r.cell);
  // (the block with the most cells: a cell hangs off the block whose back wall it is three tiles behind)
  const blocks = one.rooms.filter((r) => r.block).map((b) => {
    const alongX = b.w >= b.h;
    const mine = cells.filter((c) => (alongX ? c.y + c.h + 3 === b.y && c.x >= b.x && c.x + c.w <= b.x + b.w : c.x + c.w + 3 === b.x && c.y >= b.y && c.y + c.h <= b.y + b.h));
    return { ...b, alongX, cells: mine };
  }).sort((p, q) => q.cells.length - p.cells.length);
  log('cell blocks', blocks.map((b) => `${b.w}x${b.h} with ${b.cells.length} cells`).join(', '));
  const b = blocks[0];
  if (b && b.cells.length > 0) {
    const mid = b.cells[(b.cells.length - 1) >> 1];
    // in the hall, three tiles out from its back wall, before the middle cell; facing the cells
    if (b.alongX) await shot('cells_hall', mid.x + mid.w / 2, b.y + 3.5, 0, -1);
    else await shot('cells_hall', b.x + 3.5, mid.y + mid.h / 2, -1, 0);
    // the middle cell's door opened, as it is when he comes near it
    await page.evaluate((id) => {
      const g = window.__dbg.game();
      for (const d of g.level.doors) if (d.spot.room === id) { d.want = 1; d.open = 1; }
    }, mid.id);
    if (b.alongX) await shot('cells_open', mid.x + mid.w / 2, b.y + 2.2, 0, -1);
    else await shot('cells_open', b.x + 2.2, mid.y + mid.h / 2, -1, 0);
    // standing in it
    await shot('cell_inside', mid.x + mid.w / 2, mid.y + mid.h / 2, b.alongX ? 0 : 1, b.alongX ? 1 : 0);
    // along the hall, the row of doors seen from its end
    if (b.alongX) await shot('cells_along', b.x + 2.5, b.y + b.h / 2, 1, -0.4);
    else await shot('cells_along', b.x + b.w / 2, b.y + 2.5, -0.4, 1);
  }
  await map(`map_d${cellsAt}`);

  // ---- THE FLOORS OPENING UP ----
  for (const dep of opens) {
    const info = await go(dep);
    // the widest breach: a run of five tiles or more of floor in the row of wall along a room's side
    const breach = await page.evaluate(() => {
      const g = window.__dbg.game(); const f = g.level.floor;
      const fl = (x, y) => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === 1;
      let best = null;
      for (const r of f.rooms) {
        for (const [line, alongX, out] of [[r.y - 1, true, -1], [r.y + r.h, true, 1], [r.x - 1, false, -1], [r.x + r.w, false, 1]]) {
          const len = alongX ? r.w : r.h;
          let run = 0;
          for (let k = 0; k <= len; k++) {
            const open = k < len && (alongX ? fl(r.x + k, line) : fl(line, r.y + k));
            if (open) { run++; continue; }
            if (run >= 5 && (!best || run > best.run)) {
              const a = (alongX ? r.x : r.y) + k - run / 2;
              // (the hero two tiles inside the room, before the breach's middle, looking through it)
              best = { run, x: alongX ? a : line - out * 3 + 0.5, y: alongX ? line - out * 3 + 0.5 : a, fx: alongX ? 0 : out, fy: alongX ? out : 0 };
            }
            run = 0;
          }
        }
      }
      return best;
    });
    log(`floor ${dep}`, breach ? `widest breach ${breach.run} tiles` : 'no breach');
    if (breach) await shot(`open_d${dep}_breach`, breach.x, breach.y, breach.fx, breach.fy);
    // and its biggest room, from near its middle
    const big = info.rooms.filter((r) => r.kind !== 'boss' && !r.cell).sort((p, q) => q.w * q.h - p.w * p.h)[0];
    await shot(`open_d${dep}_room`, big.x + big.w / 2, big.y + big.h / 2 + 1, 0.7, 0.7);
    await map(`map_d${dep}`);
  }
  await page.evaluate(() => { window.__dbg.crypt(false); window.__dbg.cryptLayout(false); });
}
