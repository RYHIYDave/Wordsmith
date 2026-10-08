// FLOOR ONE LEVEL UP AND FLOOR ONE LEVEL DOWN, photographed in the hall built for them (level.ts,
// makeStepHall): the practice room in that hall, its packs held back, the hero stood at a few
// places and a few monsters stood where they show the heights.
// The owner, 7 Oct 2026, 08:01: "Stairs should go down as well".
//   node tools/playtest.mjs --file dist/down.html --size 1300x660 --scenario tools/scenarios/steps.mjs --out shots/steps/a
// CLS = warrior | ranger | mage. SHOTS: which of the places to photograph (a comma list of their names; all without it).
// WAIT: milliseconds to wait before the first picture (9000 lets the practice room's own messages go).
import { log } from './lib.mjs';

// (the terrace is the floor of x 6..12, y 6..9; the sunken floor of x 13..20, y 14..20; a flight goes down
// into it at 16..17, 14 (toward +y) and one at 13, 17..18 (toward +x))
const PLACES = {
  // the hero on the hall's own floor, between the two: the terrace behind, the sunken floor in front
  both: { hero: [12.0, 12.6], face: [1, 0.7], monsters: [['archer', 9.5, 7.5], ['skeleton', 16.5, 17.5], ['skeleton', 18.6, 16.4], ['brute', 17.5, 19.2], ['skeleton', 21.5, 13.0]] },
  // at the head of the flight down, looking down it
  head: { hero: [17.0, 13.3], face: [0, 1], monsters: [['skeleton', 16.2, 17.3], ['skeleton', 18.4, 16.8], ['archer', 19.5, 19.5], ['cultist', 22.5, 17.5]] },
  // half way down it
  down: { hero: [17.0, 14.5], face: [0, 1], monsters: [['skeleton', 16.2, 17.3], ['skeleton', 18.4, 16.8], ['archer', 22.0, 15.5]] },
  // in the sunken floor, a pack coming down the other flight and along the rim
  inside: { hero: [17.5, 17.5], face: [-1, 0], monsters: [['skeleton', 13.5, 17.5], ['skeleton', 12.2, 18.4], ['archer', 15.5, 12.8], ['skeleton', 21.6, 16.5], ['brute', 11.5, 17.0]] },
  // what stands in sunken floor BEHIND the floor on its near side is hidden by it up to the rim: the hero and a skeleton under the near rim
  near: { hero: [18.5, 20.6], face: [-1, -0.3], monsters: [['skeleton', 16.5, 20.6], ['skeleton', 20.6, 18.5], ['skeleton', 19.5, 21.6], ['archer', 21.6, 20.5]] },
  // the same, seen plainly: three in a row under the near rim, and an archer on the floor in front of it
  rim: { hero: [17.5, 20.7], face: [0, -1], monsters: [['skeleton', 16.3, 20.72], ['brute', 15.2, 20.5], ['archer', 19.6, 21.7]] },
  // the hero in the middle of a leap from the rim down into the sunken floor (held half way)
  leap: { hero: [19.5, 13.2], face: [0, 1], leap: [19.5, 16.2], monsters: [['skeleton', 18.5, 17.6], ['skeleton', 20.4, 17.2]] },
};

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const want = (process.env.SHOTS || Object.keys(PLACES).join(',')).split(',');
  // (no pack walks in while the practice room's own messages are waited out)
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.practice(c, 7, 'steps'); d.autoLevel = false; d.autoWords = false; const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; }, cls);
  await page.waitForTimeout(Number(process.env.WAIT || 500));
  for (const name of want) {
    const pl = PLACES[name];
    if (!pl) continue;
    const told = await page.evaluate((pl) => {
      const g = window.__dbg.game();
      g.waveT = 1e9;
      for (const m of g.monsters) m.dead = true;
      g.monsters.length = 0;
      const h = g.hero;
      h.x = pl.hero[0]; h.y = pl.hero[1];
      const n = Math.hypot(pl.face[0], pl.face[1]);
      h.fx = pl.face[0] / n; h.fy = pl.face[1] / n;
      h.move = pl.leap ? { kind: 'leap', t: 500, dur: 1000, x0: h.x, y0: h.y, x1: pl.leap[0], y1: pl.leap[1] } : null;
      // (nothing wakes and nothing is hurt between the pictures)
      clearInterval(window.__still);
      window.__still = setInterval(() => { for (const m of g.monsters) m.state = 'sleep'; h.invuln = 1; h.flash = 0; }, 3);
      for (const [kind, x, y] of pl.monsters) {
        const m = g.spawn(kind, x, y, 900, 0, false, g.rng);
        m.xp = 0;
        m.state = 'sleep';
        m.seen = true;
        const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
        m.fx = (h.x - m.x) / d; m.fy = (h.y - m.y) / d;
      }
      const f = g.level.floor;
      return { hero: [h.x, h.y], level: f.height[Math.floor(h.y) * f.w + Math.floor(h.x)], monsters: g.monsters.length, step: !!g.level.step };
    }, pl);
    await page.waitForTimeout(700);
    log(name, told);
    await snap(name);
  }
}
