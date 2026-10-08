// (MOCK-UP, NOT IN THE GAME) A HOLE KNOCKED IN A WALL: stills of the three rooms laid by hand for it
// (game/level.ts, makeHoleHall; the piece of broken wall: art/gates.ts, makeBreach).
//
// The owner, 7 Oct 2026, 17:53: "I'd also like another doorway that is just like somebody knocked a
// hole in a wall, all crumbly from one room to another."
//
//   AT='15.5,16.5,0,-1,before_the_right_hole;15.5,13.5,0,-1,in_it'   where the hero stands, the way he faces, the picture's name
//   NOWALL=1     the hall without the broken piece of wall (a plain gap one tile wide), to compare
//   WHOLE=1      the wall beside the hole stands whole (no dark notch), and is seen through while the hero is in the way
//   node tools/playtest.mjs --file dist/hole.html [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/hole.mjs --out shots/hole/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const at = (process.env.AT || '15.5,16.5,0,-1,before_the_right_hole').split(';').map((s) => s.split(','));
  const info = await page.evaluate(([cls, nowall, whole]) => {
    const d = window.__dbg; d.saving(false);
    d.holeLook.whole = whole;
    d.practice(cls, 5, 'holes');
    const g = d.game();
    d.god = true; d.autoLevel = false; d.autoWords = false;
    g.wakeUp = () => {};
    g.updatePractice = () => {};
    g.monsters.length = 0; g.projectiles.length = 0;
    if (nowall) g.level.doors.length = 0;
    clearInterval(window.__lit);
    window.__lit = setInterval(() => { const q = window.__dbg.game(); if (!q) return; q.monsters.length = 0; q.level.explored.fill(1); q.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    const f = g.level.floor;
    return { w: f.w, h: f.h, doors: g.level.doors.map((q) => q.spot), rooms: f.rooms };
  }, [cls, process.env.NOWALL === '1', process.env.WHOLE === '1']);
  log('the hall', JSON.stringify(info));
  await page.waitForTimeout(900);
  for (const [x, y, fx, fy, name] of at) {
    await page.evaluate(([x, y, fx, fy]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.move = null; h.fx = fx; h.fy = fy; }, [Number(x), Number(y), Number(fx), Number(fy)]);
    await page.waitForTimeout(900);
    await snap(name || `at_${x}_${y}`);
  }
}
