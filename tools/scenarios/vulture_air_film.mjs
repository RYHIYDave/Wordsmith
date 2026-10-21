// THE VULTURES STRUCK IN THE AIR (Version 23.5), FILMED IN THE GAME FOR HIM. His words to the main chat, 20 Oct 2026,
// 21:31 Pacific: “Oh the vultures being unhittable in the air has to go.  It’s infuriating to fight them”.
//   node tools/build_to.mjs dist/v235.html
//   node tools/playtest.mjs --file dist/v235.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/vulture_air_film.mjs --out shots/film/vultures
// On the Ledge Road (floor 7), the hero on the road by the drop: (1) a flock of four called down round him, the test bot
// fighting them, each struck where it flies; (2) one circling over the road struck down: it falls onto the road; (3) one
// circling over the drop struck down: it falls away into the drop, and what it carried lands on the road. A frame every
// 20th of a second of the game's time (the game slowed to a quarter), named f_0000...; the hero struck by nothing (god).
// Checks, logged '!!': a blow lands on a vulture up in the air; each struck down up there falls; what falls over the drop
// leaves its word on walkable floor. SNAP=0: the checks only, no frames kept (the regression's vulture_air_phone).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED || 9);
  const FPS = 20;
  const SLOW = 0.25;
  const keep = process.env.SNAP !== '0';
  await page.evaluate((s) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', s);
    D.seasoned(20);
    D.autoLevel = false;
    D.autoWords = false;
    D.god = true;
  }, seed);
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 7;
    g.cleared = 6;
    g.enterDungeon();
    const L = g.level;
    const f = L.floor;
    // (the hero on the road where the most of the drop is near: within two and a half tiles)
    let best = null;
    let most = -1;
    for (let ty = 2; ty < f.h - 2; ty++) for (let tx = 2; tx < f.w - 2; tx++) {
      if (L.walk[ty * f.w + tx] !== 1) continue;
      let pits = 0;
      let road = 0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const i = (ty + dy) * f.w + tx + dx;
        if (f.tiles[i] === 3) pits++;
        if (L.walk[i] === 1) road++;
      }
      if (pits > 10 && road > 18 && pits + road * 0.5 > most) { most = pits + road * 0.5; best = { x: tx + 0.5, y: ty + 0.5 }; }
    }
    if (best) { g.hero.x = best.x; g.hero.y = best.y; }
    g.monsters = [];
    L.explored.fill(1);
    window.__dbg.fx.messages = [];
    g.talentsLeft = () => 0;
    return { at: best, w: f.w, h: f.h };
  });
  log('film', JSON.stringify(info));
  if (!info.at) { log('!!', 'no place on the road by the drop'); return; }
  await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
  const step = 1000 / FPS / SLOW;
  let t0 = Date.now();
  let i = 0;
  const frame = async () => {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (keep) await snap(`f_${String(i).padStart(4, '0')}`);
    i++;
  };
  const hold = async (s) => { const n = Math.round(s * FPS); for (let k = 0; k < n; k++) await frame(); };
  // a watch on every blow on a vulture up in the air, and on every death of one
  await page.evaluate(() => {
    const g = window.__dbg.game();
    window.__air = { struckHigh: 0, deaths: [] };
    const was = g.damageMonster.bind(g);
    g.damageMonster = (m, ...rest) => {
      const high = m.kind === 'vulture' && m.a1 && m.a1.lift > 9;
      const life = m.life;
      was(m, ...rest);
      if (high && m.life < life) window.__air.struckHigh++;
    };
    const kill = g.kill.bind(g);
    g.kill = (m) => {
      const lift = m.kind === 'vulture' && m.a1 ? m.a1.lift : 0;
      const n = g.events.length;
      kill(m);
      const e = g.events.slice(n).find((x) => x.t === 'die');
      if (m.kind === 'vulture') window.__air.deaths.push({ lift, eLift: e?.lift ?? 0, away: !!e?.away });
    };
  });
  // (1) a flock of four called down round him, the bot fighting them
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const h = g.hero;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      const m = g.spawn('vulture', h.x + Math.cos(a) * 2.5, h.y + Math.sin(a) * 2.5, 900, 0, false, g.rng);
      g.wakeUp(m);
    }
    window.__dbg.bot(true);
  });
  t0 = Date.now();
  i = 0;
  for (let s = 0; s < 14; s++) {
    await hold(1);
    const left = await page.evaluate(() => window.__dbg.game().monsters.filter((m) => !m.dead && m.kind === 'vulture').length);
    if (left === 0) break;
  }
  await hold(1.2);
  // (2) and (3): one circling, struck down as it flies over the road, then one over the drop
  for (const over of ['road', 'drop']) {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      window.__dbg.bot(false);
      g.monsters = g.monsters.filter((m) => !m.dead);
      const h = g.hero;
      // (it comes in on the side of the drop)
      const f = g.level.floor;
      let sx = 2.4, sy = 0;
      for (let a = 0; a < 16; a++) {
        const x = h.x + Math.cos(a * Math.PI / 8) * 2.4, y = h.y + Math.sin(a * Math.PI / 8) * 2.4;
        if (f.tiles[Math.floor(y) * f.w + Math.floor(x)] === 3) { sx = x - h.x; sy = y - h.y; break; }
      }
      const m = g.spawn('vulture', h.x + sx, h.y + sy, 901, 0, false, g.rng);
      g.wakeUp(m);
      m.carries = ['fire'];
      m.a1.next = 99;
    });
    let done = false;
    for (let k = 0; k < 14 * FPS && !done; k++) {
      await frame();
      done = await page.evaluate((o) => {
        const g = window.__dbg.game();
        const m = g.monsters.find((x) => !x.dead && x.packId === 901);
        if (!m || m.a1.lift < 22 || m.a1.lift > 30) return false;
        const f = g.level.floor;
        const i = Math.floor(m.y) * f.w + Math.floor(m.x);
        const pit = f.tiles[i] === 3;
        const road = g.level.walk[i] === 1;
        if (o === 'drop' ? !pit : !road) return false;
        // (the hero's own blow: he turns to it and strikes)
        const h = g.hero;
        const d = Math.hypot(m.x - h.x, m.y - h.y) || 1;
        h.fx = (m.x - h.x) / d;
        h.fy = (m.y - h.y) / d;
        g.damageMonster(m, Math.ceil(m.life), 'phys', false, 0);
        return true;
      }, over);
    }
    if (!done) log('!!', `no vulture came over the ${over} to be struck down`);
    else log('struck', `over the ${over} at frame ${i - 1}`);
    await hold(1.6);
    const where = await page.evaluate(() => {
      const g = window.__dbg.game();
      const L = g.level;
      return g.drops.filter((d) => d.kind === 'word').map((d) => L.walk[Math.floor(d.y) * L.floor.w + Math.floor(d.x)] === 1);
    });
    if (where.some((ok) => !ok)) log('!!', `a word dropped off the floor (${over})`);
  }
  const air = await page.evaluate(() => window.__air);
  log('air', JSON.stringify({ frames: i, struckHigh: air.struckHigh, deaths: air.deaths }));
  if (air.struckHigh < 1) log('!!', 'no blow landed on a vulture up in the air');
  if (!air.deaths.some((d) => d.lift > 20 && d.eLift > 20 && !d.away)) log('!!', 'none struck down high over the road fell from there');
  if (!air.deaths.some((d) => d.away)) log('!!', 'none fell away into the drop');
}
