// THE WALLS STANDING WHOLE, FILMED (the art chat, 20 Oct 2026): on each of DEPTHS the hero put in the open a few tiles from a
// near wall, then walked behind it (down the screen), along it (left, then right) and back out (up), the game slowed (SLOW,
// 0.3) and a picture taken as often as can be: the frames as f0001.png... in OUT_DIR/<depth>/ for a video. WHOLE=1, the walls
// standing whole (render/act2_walls.ts). SEED; PICK (which near-wall spot).
import fs from 'node:fs';
import path from 'node:path';
export default async function (page, snap) {
  const depths = (process.env.DEPTHS ?? '15').split(',').map(Number);
  const seed = Number(process.env.SEED ?? 3);
  const pick = Number(process.env.PICK ?? 0);
  const slow = Number(process.env.SLOW ?? 0.3);
  const outDir = process.env.OUT_DIR ?? 'shots/walls/film';
  const plan = (process.env.PLAN ?? 'KeyS:900,KeyA:1100,KeyD:1600,KeyW:900').split(',').map((s) => s.split(':')).map(([k, ms]) => [k, Number(ms)]);
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
      for (let y = 5; y < f.h - 5; y++) {
        for (let x = 5; x < f.w - 5; x++) {
          if (at(x, y) !== FLOOR) continue;
          let open = true;
          for (let k = 1; k <= 3 && open; k++) for (let j = -3; j <= 3 && open; j++) if (at(x + j, y - k) !== FLOOR || at(x - k, y + j - 3) !== FLOOR) open = false;
          if (!open) continue;
          if (at(x, y + 1) === FLOOR || at(x + 1, y + 1) === FLOOR || at(x - 1, y + 1) === FLOOR || at(x + 1, y + 2) === FLOOR || at(x, y + 2) === FLOOR) continue;
          if (at(x + 1, y) !== FLOOR || at(x - 1, y) !== FLOOR || at(x - 2, y) !== FLOOR) continue;
          spots.push([x, y]);
        }
      }
      const [x, y] = spots[Math.min(pick, spots.length - 1)] ?? [g.hero.x, g.hero.y];
      // (in the open: a tile and a half up the screen from the spot, which is up and left in the world)
      g.hero.x = x - 1 + 0.5;
      g.hero.y = y - 2 + 0.5;
      g.monsters.length = 0;
      return { depth: d, spots: spots.length, at: [x, y] };
    }, [d, seed, pick, process.env.WHOLE === '1']);
    console.log('  floor', JSON.stringify(info));
    await page.waitForTimeout(Number(process.env.WAIT ?? 3500));
    await page.evaluate((s) => { window.__dbg.slowmo = s; }, slow);
    const dir = path.resolve(outDir, String(d));
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    let n = 0;
    const shoot = async () => {
      n++;
      await page.screenshot({ path: path.join(dir, `f${String(n).padStart(4, '0')}.png`) });
    };
    for (let i = 0; i < 8; i++) await shoot();
    for (const [key, ms] of plan) {
      await page.keyboard.down(key);
      const t0 = Date.now();
      // (ms of the game's own time, slowed)
      while (Date.now() - t0 < ms / slow) await shoot();
      await page.keyboard.up(key);
      for (let i = 0; i < 3; i++) await shoot();
    }
    for (let i = 0; i < 10; i++) await shoot();
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    console.log('  frames', n, 'in', dir);
  }
}
