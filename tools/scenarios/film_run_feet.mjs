// FILM 2 OF THE TWO TESTS OF WEIGHT (the art chat, 8 Oct 2026): a hero running in the practice
// room, straight along the grid (down the screen and to the right, so that he is seen from in
// front and runs along the floor's lines), at the rules' own speed. A picture every sixtieth of a
// second of the game's time, the game's clock taken in hand (weight_clock.mjs): as the game is
// today (the run played by the clock) and with the run played by the ground it covers
// (src/render/weight.ts, STRIDE; OFF in the game) switched on for this page only.
//   CLS=warrior|ranger|mage   STRIDE=0|1   FRAMES=60 (pictures, from when the run is well under way)
//   node tools/playtest.mjs --file dist/weight.html --scenario tools/scenarios/film_run_feet.mjs --out shots/weight/run_warrior_today
// Beside the pictures: <out>_at.json, for each picture where on the screen the middle of the
// stretch of floor he runs over is (game pixels: the films are cut out round it, so that the floor
// stands still in them and he runs over it), where his feet are, and which picture of his run is shown.
import { takeClock } from './weight_clock.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const stride = process.env.STRIDE === '1';
  const clock = await takeClock(page, 20261008);
  await clock.steps(10);
  await page.evaluate(([cls, stride]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const w = d.weight;
    if (stride && !w) throw new Error('this page has no switches for the tests of weight (__dbg.weight)');
    if (w) w.stride.on = stride;
  }, [cls, stride]);
  // (the room's words come up and go, and every frame of the hero is painted, before the film begins)
  await clock.steps(420);
  // He is set down two and a half tiles back along the grid from where he began, facing the way
  // he will run; then he runs, a third of a second before the film begins and all through it.
  const lead = 20;
  const frames = Number(process.env.FRAMES || 60);
  const info = await page.evaluate(([lead, frames]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const sp = h.d.moveSpeed;
    const x0 = h.x - 2.6; const y0 = h.y;
    h.x = x0; h.y = y0; h.fx = 1; h.fy = 0;
    // (the middle of the stretch he runs over while filmed)
    const mid = { x: x0 + (sp * (lead + frames / 2)) / 60, y: y0 };
    const run = g.update.bind(g);
    g.update = (dt, c) => { c.mx = 1; c.my = 0; c.face = false; return run(dt, c); };
    window.__film = { mid };
    return { speed: sp, x0, y0, mid };
  }, [lead, frames]);
  console.log(cls, stride ? 'run by the ground covered' : 'run by the clock (today)', JSON.stringify(info));
  await clock.steps(lead);
  const at = [];
  for (let i = 0; i < frames; i++) {
    await clock.step();
    at.push(await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const m = window.__film.mid;
      const a = d.at(m.x, m.y); const f = d.at(h.x, h.y);
      // (which picture of his run the game showed: its place in the list of them. He faces down the
      // screen and to the right, so the picture is not turned over and is the art's own.)
      const r = d.renderer;
      const walk = r.heroArt(g).front.walk.indexOf(r.figure.last);
      return { mid: [a.x, a.y], hero: [f.x, f.y], x: h.x, y: h.y, anim: h.anim, animT: h.animT, walk, of: r.heroArt(g).front.walk.length };
    }));
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  snap.note('at', at);
}
