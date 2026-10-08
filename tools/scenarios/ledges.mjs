// LEDGES, STAIRS, A PIT AND A GAP, photographed in the hall built for them (level.ts,
// makeLedgeHall): the practice room in that hall, its packs held back, the hero stood at a few
// places and a few monsters stood where they show the heights.
//   node tools/playtest.mjs --file dist/ledges.html --size 1300x660 --scenario tools/scenarios/ledges.mjs --out shots/ledges/a
// CLS = warrior | ranger | mage. SHOTS: which of the places to photograph (a comma list of their names; all without it).
import { log } from './lib.mjs';

const PLACES = {
  // the hero on the low floor, looking at the long edge of the terrace and its stairs
  floor: { hero: [12.5, 14.5], face: [-0.2, -1], monsters: [['archer', 9.5, 9.5], ['archer', 12.6, 9.6], ['skeleton', 10.4, 15.2], ['skeleton', 14.5, 13.5], ['cultist', 11.5, 7.5]] },
  // the hero on the terrace, at its long edge, a pack below
  terrace: { hero: [11.5, 9.5], face: [0.3, 1], monsters: [['skeleton', 10.9, 13.5], ['skeleton', 13.6, 12.9], ['brute', 12.4, 14.4], ['archer', 9.5, 7.5]] },
  // the hero half way up each flight
  stairsN: { hero: [9.9, 11.45], face: [0, -1], monsters: [['skeleton', 11.8, 12.8], ['skeleton', 8.6, 13.2], ['archer', 12.5, 8.5]] },
  stairsW: { hero: [15.5, 8.5], face: [-1, 0], monsters: [['skeleton', 16.6, 8.5], ['skeleton', 16.5, 7.5], ['archer', 13.5, 8.5]] },
  // what stands on the low floor BEHIND raised ground is hidden by it: a skeleton behind each flight of stairs
  behind: { hero: [12.5, 13.5], face: [-1, -1], monsters: [['skeleton', 8.72, 11.45], ['skeleton', 15.5, 7.72], ['brute', 15.45, 7.3]] },
  // the hero in the middle of a leap from the floor up onto the terrace (the leap is held half way)
  leap: { hero: [11.5, 12.6], face: [0, -1], leap: [11.5, 9.4], monsters: [['skeleton', 12.6, 13.4], ['archer', 13.5, 8.5]] },
  // by the pit
  pit: { hero: [16.5, 15.5], face: [1, 0], monsters: [['skeleton', 21.6, 15.5], ['archer', 21.5, 13.5], ['bat', 19.5, 15.5]] },
  // by the gap, the island across it
  gap: { hero: [14.5, 20.5], face: [-1, 0.1], monsters: [['skeleton', 16.5, 19.0], ['skeleton', 18.0, 21.0], ['archer', 10.5, 21.5]] },
};

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const want = (process.env.SHOTS || Object.keys(PLACES).join(',')).split(',');
  await page.evaluate((c) => window.__dbg.practice(c, 7, 'ledges'), cls);
  await page.waitForTimeout(500);
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
        // (they stand and look at the hero: asleep, so that nothing moves between the pictures)
        m.state = 'sleep';
        m.seen = true;
        const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
        m.fx = (h.x - m.x) / d; m.fy = (h.y - m.y) / d;
      }
      return { hero: [h.x, h.y], monsters: g.monsters.length, step: !!g.level.step };
    }, pl);
    await page.waitForTimeout(700);
    log(name, told);
    await snap(name);
  }
}
