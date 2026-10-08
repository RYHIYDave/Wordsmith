// FILM 1 OF THE TWO TESTS OF WEIGHT (the art chat, 8 Oct 2026): the warrior's Slam, without the
// Power word, landing on a monster, in the practice room. A picture every sixtieth of a second of
// the game's time, the game's clock taken in hand (weight_clock.mjs), so that the film is the same
// frame for frame each time it is made: as the game is today, and with the hold of the picture
// (src/render/weight.ts, HITSTOP; OFF in the game) switched on for this page only.
//   HOLD=0       today (the switch left off)
//   HOLD=0.09    the hold of the picture on, this many seconds of it (SHAKE=2: how far the struck
//                one is shaken, in game pixels)
//   WHO=skeleton|brute   what is struck (the skeleton if not said)
//   DX=32 DY=16  where it stands, in game pixels from the hero (two tiles straight ahead of him)
//   FRAMES=60    how many pictures, from a tenth of a second before the Slam is begun
//   node tools/playtest.mjs --file dist/weight.html --scenario tools/scenarios/film_heavy_blow.mjs --out shots/weight/blow_today
// Beside the pictures: <out>_at.json, where the hero's feet and the monster's are on the screen.
import { takeClock } from './weight_clock.mjs';

export default async function (page, snap) {
  const hold = Number(process.env.HOLD || 0);
  const shake = Number(process.env.SHAKE || 2);
  const who = process.env.WHO || 'skeleton';
  // (the clock and the dice are taken in hand from the page's first frame: so the two films, as it
  // is today and with the change, are the same in everything else, spark for spark)
  const clock = await takeClock(page, 20261008);
  await clock.steps(10);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await clock.steps(20);
  const dx = Number(process.env.DX || 32), dy = Number(process.env.DY || 16);
  const id = await page.evaluate(([dx, dy, who, hold, shake]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    // (Slam is the one-handed sword's slow attack: the warrior starts with the great sword, whose
    // slow attack is the Whirlwind. The knight is drawn with the great sword whatever he holds.)
    if (!h.gear.mainhand || h.gear.mainhand.weapon !== 'sword') {
      const i = h.bag.findIndex((it) => it && it.weapon === 'sword');
      if (i < 0) throw new Error('no sword in the bag');
      const said = g.equipFromBag(i);
      if (said) throw new Error(said);
    }
    const w = d.weight;
    if (hold > 0) {
      if (!w) throw new Error('this page has no switches for the tests of weight (__dbg.weight)');
      w.hitstop.on = true; w.hitstop.hold = hold; w.hitstop.shake = shake;
    } else if (w) w.hitstop.on = false;
    const x = h.x + (dx / 16 + dy / 8) / 2; const y = h.y + (dy / 8 - dx / 16) / 2;
    const m = g.spawn(who, x, y, 1, 0, false, g.rng);
    g.wakeUp(m);
    m.life = m.maxLife = 1e7;
    m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9;
    const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
    h.fx = -m.fx; h.fy = -m.fy;
    return m.id;
  }, [dx, dy, who, hold, shake]);
  console.log('stood', who, id, 'skills', await page.evaluate(() => JSON.stringify(window.__dbg.game().hero.skills.map((s) => s && s.id))));
  // (the room's words come up and go, and every frame of the hero is painted, before the film begins)
  await clock.steps(420);
  const frames = Number(process.env.FRAMES || 60);
  const before = 6;
  const at = [];
  for (let i = 0; i < frames; i++) {
    if (i === before) await page.evaluate((id) => {
      const g = window.__dbg.game(); const m = g.monsters.find((m) => m.id === id); const h = g.hero;
      h.mana = h.d.maxMana; for (const s of h.skills) if (s) s.cd = 0;
      g.useSkill(1, m.x, m.y);
    }, id);
    await clock.step();
    at.push(await page.evaluate((id) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const m = g.monsters.find((m) => m.id === id);
      const a = d.at(h.x, h.y); const b = d.at(m.x, m.y);
      return { hero: [a.x, a.y], monster: [b.x, b.y], age: h.attackAge, anim: h.anim, flash: m.flash };
    }, id));
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  snap.note('at', at);
}
