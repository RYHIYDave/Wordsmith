// A PHOTO OF THE GAME TO LAY BESIDE THE PICTURE OF A DUNGEON'S SHAPE (src/dev/preview_frame.ts, its
// "cam" view; the owner's yes by 18:28, 9 Oct 2026: "Yes, after 19.9 (Recommended)"). A run is begun,
// dungeon number DEPTH entered, every monster taken away (so that nothing stands in front of the
// walls), the whole of it shown, and the hero stood at AT, looking down and to the right as on coming
// in. The log gives the dungeon's own seed (the picture's) and where the game put the world (cam).
//   SEED=3897415668 DEPTH=3 AT=31.5,98.5 node tools/playtest.mjs --file dist/frame.html --size 1000x640 --dpr 1 --scenario tools/scenarios/frame_photo.mjs --out shots/frame/photo
// (run seed 3897415668 makes dungeon 3's own seed 23: game.ts enterDungeon, imul(seed, 7919) + depth * 104729)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 3897415668);
  const depth = Number(process.env.DEPTH || 3);
  const [ax, ay] = (process.env.AT || '31.5,98.5').split(',').map(Number);
  const info = await page.evaluate(([cls, seed, depth, ax, ay]) => {
    const d = window.__dbg; d.saving(false); d.run(cls, seed);
    const g = d.game();
    if (g.level.town) { g.depth = depth; g.enterDungeon(); }
    d.autoLevel = false; d.autoWords = false;
    g.wakeUp = () => {};
    const h = g.hero;
    h.x = ax; h.y = ay; h.fx = 1; h.fy = 0;
    clearInterval(window.__still);
    window.__still = setInterval(() => {
      g.monsters.length = 0;
      h.x = ax; h.y = ay; h.invuln = 1; h.flash = 0;
      g.level.explored.fill(1); g.level.visible.fill(1);
    }, 3);
    const own = (Math.imul(g.seed, 7919) + g.depth * 104729 + g.cleared * 31) >>> 0;
    return { own, depth: g.depth, w: g.level.floor.w, h: g.level.floor.h, rooms: g.level.floor.rooms.length };
  }, [cls, seed, depth, ax, ay]);
  log('dungeon', info);
  // (long enough for the lines the run begins with, "Dungeon 3" and the town's, to fade: 5 s and a little)
  await page.waitForTimeout(8000);
  const cam = await page.evaluate(() => {
    const d = window.__dbg; const c = d.cam();
    return { ox: c.ox, oy: c.oy, w: d.screen.w, h: d.screen.h, scale: d.screen.scale, monsters: d.game().monsters.length };
  });
  log('cam', cam);
  await snap('view');
}
