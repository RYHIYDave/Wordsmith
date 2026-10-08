// TRIANGLES: stills of rooms whose walls are not all on the slant (level.ts, makeShapeRoom:
// __dbg.practice(cls, seed, 'shape:<name>')), each in the practice room's place with the hero and a
// few monsters for scale.
//   SHAPES=square,cut node tools/playtest.mjs --file dist/tri.html --size 1300x660 --scenario tools/scenarios/triangles.mjs --out shots/tri/a
// (the names: square, stepped, cut, eight, back, across, updown; WAIT=9000 lets the practice room's messages go)
import { log } from './lib.mjs';

const PLACES = {
  square: { hero: [15.5, 16.5], monsters: [['skeleton', 12.5, 12.5], ['archer', 18.5, 11.5], ['skeleton', 19.5, 17.5]] },
  stepped: { hero: [15.5, 16.5], monsters: [['skeleton', 12.5, 12.5], ['archer', 18.5, 11.5], ['skeleton', 19.5, 17.5]] },
  cut: { hero: [15.5, 16.5], monsters: [['skeleton', 12.5, 12.5], ['archer', 18.5, 11.5], ['skeleton', 19.5, 17.5]] },
  eight: { hero: [15.5, 16.5], monsters: [['skeleton', 12.5, 12.5], ['archer', 18.5, 11.5], ['skeleton', 19.5, 17.5]] },
  back: { hero: [14.5, 14.5], monsters: [['skeleton', 16.5, 12.5], ['skeleton', 12.5, 16.5], ['cultist', 18.5, 15.5]] },
  across: { hero: [15.5, 15.5], monsters: [['skeleton', 13.6, 16.4], ['archer', 19.5, 9.5], ['skeleton', 9.5, 19.5]] },
  updown: { hero: [15.5, 15.5], monsters: [['skeleton', 13.5, 13.5], ['archer', 9.5, 9.5], ['skeleton', 19.5, 19.5]] },
};

export default async function (page, snap) {
  const want = (process.env.SHAPES || Object.keys(PLACES).join(',')).split(',');
  for (const name of want) {
    const pl = PLACES[name];
    if (!pl) continue;
    const told = await page.evaluate(([name, pl]) => {
      const d = window.__dbg; d.saving(false); d.practice('warrior', 7, 'shape:' + name);
      const g = d.game();
      g.waveT = 1e9;
      for (const m of g.monsters) m.dead = true;
      g.monsters.length = 0;
      const h = g.hero;
      h.x = pl.hero[0]; h.y = pl.hero[1]; h.fx = 0.7; h.fy = 0.7;
      for (const [kind, x, y] of pl.monsters) {
        const m = g.spawn(kind, x, y, 900, 0, false, g.rng);
        m.xp = 0; m.state = 'sleep'; m.seen = true;
        const dd = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / dd; m.fy = (h.y - m.y) / dd;
      }
      clearInterval(window.__still);
      window.__still = setInterval(() => { for (const m of g.monsters) m.state = 'sleep'; h.invuln = 1; h.flash = 0; }, 3);
      return { cut: g.level.floor.cut ? Array.from(g.level.floor.cut).filter((v) => v).length : 0 };
    }, [name, pl]);
    await page.waitForTimeout(Number(process.env.WAIT || 900));
    log(name, told);
    await snap(name);
  }
}
