// FLOORS 8 AND 9 FROM HIS PHONE (docs/mockups/f8f9_fixes): the Pinewood's bridges, Echo Canyon's stronghold entrance and its
// walls, from the game itself at a phone's size (his phone's: 852 by 393, three to a point), with F8F9_FIX as asked.
//   node tools/build_to.mjs dist/f8f9.html
//   FIX=1 node tools/playtest.mjs --file dist/f8f9.html --hash painter=off --touch --size 852x393 --dpr 3 --scenario tools/scenarios/f8f9_look.mjs --out shots/f8f9/after
// FIX=1: the switch on (else as the game has it). SEED: the run's (9). WHAT: any of 'bridges', 'wide9', 'hold', 'walls', 'wide8'
// (all, if not given). WALLS: the way's points to stand at for 'walls' (every 8th, if not given). The painter is off
// (#painter=off) so the page's own switch is the one the ground is painted by. A wide view is the game's own picture with its
// screen made two and a half times as many game pixels each way (WIDE), for a view of more of the floor.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED || 9);
  const fix = process.env.FIX === '1';
  const what = (process.env.WHAT || 'bridges,wide9,hold,walls,wide8').split(',');
  const WIDE = Number(process.env.WIDE || 2.5);
  await page.evaluate(([s, on]) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.seasoned(14); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.looks.F8F9_FIX.on = on;
    // (no talent waiting: its button would stand over the picture)
    d.game().talentsLeft = () => 0;
  }, [seed, fix]);
  await page.waitForTimeout(600);
  const enter = (n) => page.evaluate((k) => {
    const g = window.__dbg.game();
    g.depth = k; g.cleared = k - 1; g.enterDungeon();
    g.talentsLeft = () => 0;
    const L = g.level;
    L.explored.fill(1);
    g.monsters = g.monsters.filter((m) => m.boss);
    const land = L.land;
    const W = L.floor.w;
    const mid = (b) => (b.x !== undefined ? { x: b.x, y: b.y, ang: b.ang } : { x: b.tiles.reduce((a, i) => a + (i % W) + 0.5, 0) / b.tiles.length, y: b.tiles.reduce((a, i) => a + Math.floor(i / W) + 0.5, 0) / b.tiles.length });
    return { w: W, h: L.floor.h, seed: L.floor.seed, holds: land.holds.map((q) => ({ gx: q.gx, gy: q.gy })), bridges: (land.bridges ?? []).map(mid), way: land.way };
  }, n);
  const go = async (x, y, name, wait = 1500) => {
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; g.hero.fx = -0.7; g.hero.fy = 0.7; }, [x, y]);
    await page.waitForTimeout(wait);
    await snap(name);
  };
  /** The screen made `k` times as many game pixels each way (the same canvas, its pixels smaller), or back as it was (k = 0). */
  const wide = (k) => page.evaluate((kk) => {
    const s = window.__dbg.screen;
    const cv = s.canvas;
    if (!kk) { window.dispatchEvent(new Event('resize')); return; }
    const was = { w: s.w, h: s.h, scale: s.scale };
    s.w = Math.round(was.w * kk);
    s.h = Math.round(was.h * kk);
    cv.width = s.w * 2;
    cv.height = s.h * 2;
    s.g.setTransform(2, 0, 0, 2, 0, 0);
    s.g.imageSmoothingEnabled = false;
  }, k);
  if (what.includes('bridges') || what.includes('wide9')) {
    const f9 = await enter(9);
    log('floor 9', JSON.stringify({ size: [f9.w, f9.h], seed: f9.seed, bridges: f9.bridges }));
    // (the floor's name gone from the screen)
    await page.waitForTimeout(7500);
    if (what.includes('bridges')) {
      let k = 0;
      for (const b of f9.bridges) {
        // on the deck, and on the near bank beside it
        await go(b.x, b.y, `f9_bridge${k}_on`);
        await go(b.x + 1.6, b.y + 1.9, `f9_bridge${k}_by`);
        k++;
      }
    }
    if (what.includes('wide9')) {
      const cx = f9.bridges.reduce((a, b) => a + b.x, 0) / f9.bridges.length;
      const cy = f9.bridges.reduce((a, b) => a + b.y, 0) / f9.bridges.length;
      await wide(WIDE);
      await go(cx, cy, 'f9_wide', 3500);
      await wide(0);
    }
  }
  if (what.includes('hold') || what.includes('walls') || what.includes('wide8')) {
    const f8 = await enter(8);
    log('floor 8', JSON.stringify({ size: [f8.w, f8.h], seed: f8.seed, holds: f8.holds }));
    await page.waitForTimeout(7500);
    if (what.includes('hold')) {
      let k = 0;
      for (const q of f8.holds) {
        await go(q.gx + 1.9, q.gy + 4.2, `f8_hold${k}`);
        await go(q.gx + 0.3, q.gy + 2.2, `f8_hold${k}_at`);
        k++;
      }
    }
    if (what.includes('walls')) {
      const every = Number(process.env.WALLS_EVERY || 8);
      const pts = process.env.WALLS ? process.env.WALLS.split(';').map((p) => p.split(',').map(Number)) : f8.way.filter((_, i) => i % every === 0);
      let k = 0;
      for (const [x, y] of pts) await go(x, y, `f8_walls${k++}`);
    }
    if (what.includes('wide8')) {
      const at = process.env.WIDE8 ? process.env.WIDE8.split(',').map(Number) : f8.way[Math.floor(f8.way.length / 3)];
      await wide(WIDE);
      await go(at[0], at[1], 'f8_wide', 3500);
      await wide(0);
    }
  }
}
