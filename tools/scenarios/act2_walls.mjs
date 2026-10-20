// THE WALLS OF FLOORS 11 TO 15 (the art chat, 20 Oct 2026): the hero stood just behind a near wall (one toward the eye: rock on
// the tile in front of him, along +x or +y, open floor behind him) on each of DEPTHS, and pictures taken; with WHOLE=1, the walls
// standing whole (render/act2_walls.ts, ACT2_WALLS). SEED; PICK (which of the spots found, 0 the first); WAIT (ms).
export default async function (page, snap) {
  const depths = (process.env.DEPTHS ?? '11,12,14,15').split(',').map(Number);
  const seed = Number(process.env.SEED ?? 3);
  const pick = Number(process.env.PICK ?? 0);
  for (const d of depths) {
    const info = await page.evaluate(([d, seed, pick, whole]) => {
      const D = window.__dbg;
      D.saving(false);
      D.run('warrior', seed);
      D.seasoned(20);
      D.god = true;
      if (D.act2Walls) D.act2Walls.on = whole;
      D.act2(true, d);
      const g = D.game();
      const f = g.level.floor;
      const at = (x, y) => (x >= 0 && y >= 0 && x < f.w && y < f.h ? f.tiles[y * f.w + x] : 1);
      const FLOOR = at(Math.floor(g.hero.x), Math.floor(g.hero.y));
      const spots = [];
      for (let y = 4; y < f.h - 4; y++) {
        for (let x = 4; x < f.w - 4; x++) {
          if (at(x, y) !== FLOOR) continue;
          // open floor behind (three tiles back along -x and -y), rock in front along +y two tiles deep, floor either side
          let open = true;
          for (let k = 1; k <= 3 && open; k++) if (at(x - k, y) !== FLOOR || at(x, y - k) !== FLOOR || at(x - k, y - k) !== FLOOR) open = false;
          if (!open) continue;
          if (at(x, y + 1) === FLOOR || at(x, y + 2) === FLOOR || at(x, y + 3) === FLOOR) continue;
          if (at(x - 1, y + 1) === FLOOR || at(x + 1, y + 1) === FLOOR) continue;
          spots.push([x, y]);
        }
      }
      const [x, y] = spots[Math.min(pick, spots.length - 1)] ?? [g.hero.x, g.hero.y];
      g.hero.x = x + 0.5;
      g.hero.y = y + 0.5;
      g.monsters.length = 0;
      return { depth: d, kind: g.level.land?.kind, spots: spots.length, at: [x, y] };
    }, [d, seed, pick, process.env.WHOLE === '1']);
    console.log('  floor', JSON.stringify(info));
    await page.waitForTimeout(Number(process.env.WAIT ?? 3000));
    await snap(`f${d}`);
  }
}
