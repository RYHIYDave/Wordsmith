// ACT 1, THE DESCENT: ONE OF ITS OWN KINDS IN THE GAME, ON ITS FLOOR (game/act1_rules/). For looking at, and films.
//   node tools/build_to.mjs dist/act1.html
//   KIND=qgolem node tools/playtest.mjs --file dist/act1.html --size 1014x468 --scenario tools/scenarios/act1_mob.mjs --out shots/act1/qgolem
// KIND: the kind (game/types.ts ACT1_KINDS, and Act 2's). DEPTH: its floor (the kind's own: 6 to 15). N: how many (1; a boss is
// always the floor's one). FAR: how far off the hero stands (3.5 tiles). SECS: how long to watch (10).
// ACT: an act to have it make over and over (its id, 'qgolem:smash'): every other is kept cooling.
// FILM=1: a frame every 15th of a second of the game's time (the game slowed), named f_0000... (else a picture a second).
// HURT: its life as a share of its whole (for what comes as it is hurt). CLS: the hero (warrior). STILL=1: the hero is struck by nothing (god) and stands.
import { log } from './lib.mjs';

const FLOOR = {
  chanter: 6, firepot: 6, qgolem: 6, rubbling: 6, unfinished: 6, vulture: 7, crawler: 7, queen: 7, scorpion: 8, devil: 8, cantor: 8, deer: 9, wolf: 9, stag: 9, drowned: 10, leech: 10, spawn: 10, eye: 10,
  // (ACT 2, THE HUSH, Version 23.0: floors 11 to 15's own)
  hushed: 11, watch: 11, scribe: 11, hound: 11, crier: 11, rat: 12, dredger: 12, ratking: 12, fieldhand: 13, carter: 13, palimpsest: 13, scraper: 13, quill: 13,
  patient: 14, orderly: 14, physician: 14, inkling: 15, bookwarden: 15, censor: 15,
};
// (floor 13's: the Scraper with the Quill beside it, Version 23.6; the Palimpsest with the pair off)
const BOSSES = ['unfinished', 'queen', 'cantor', 'stag', 'eye', 'crier', 'ratking', 'palimpsest', 'scraper', 'physician', 'censor'];

export default async function (page, snap) {
  const kind = process.env.KIND || 'qgolem';
  const depth = Number(process.env.DEPTH || FLOOR[kind] || 6);
  const n = Number(process.env.N || 1);
  const far = Number(process.env.FAR || 3.5);
  const secs = Number(process.env.SECS || 10);
  const act = process.env.ACT || '';
  const film = !!process.env.FILM;
  const hurt = process.env.HURT ? Number(process.env.HURT) : 0;
  const cls = process.env.CLS || 'warrior';
  await page.evaluate(([c]) => {
    const d = window.__dbg; d.saving(false); d.run(c, 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, [cls]);
  await page.waitForTimeout(600);
  const where = await page.evaluate(([k, dep, count, dist, lf, isBoss]) => {
    const g = window.__dbg.game();
    g.depth = dep; g.cleared = dep - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    let them;
    if (isBoss) {
      g.monsters = g.monsters.filter((m) => m.boss);
      them = g.monsters;
    } else {
      g.monsters = [];
      g.boss = null;
      // (in the floor's widest open area: its first that is not the start)
      const land = L.land;
      const a = land.areas.find((q) => q.role === 'path') || land.areas[0];
      let cx = a.blob.x, cy = a.blob.y;
      g.hero.x = cx - dist * 0.7; g.hero.y = cy - dist * 0.7;
      // (ACT 2, THE HUSH, Version 23.0: an area's middle may be a sewer's channel or a house's wall: then the nearest floor
      // there with room round it, and the hero `dist` off on floor in plain sight of it, the way between all floor)
      const f = L.floor;
      const walk = (x, y) => { const tx = Math.floor(x), ty = Math.floor(y); return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.walk[ty * f.w + tx] === 1; };
      const roomy = (x, y) => walk(x, y) && walk(x + 0.9, y) && walk(x - 0.9, y) && walk(x, y + 0.9) && walk(x, y - 0.9);
      const clear = (x0, y0, x1, y1) => { for (let k = 0; k <= 20; k++) if (!walk(x0 + ((x1 - x0) * k) / 20, y0 + ((y1 - y0) * k) / 20)) return false; return true; };
      if (!roomy(cx, cy) || !clear(cx, cy, g.hero.x, g.hero.y)) {
        let best = null;
        for (let r = 0; r <= 12 && !best; r++) {
          for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r && !best; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const x = Math.floor(cx) + dx + 0.5, y = Math.floor(cy) + dy + 0.5;
            if (!roomy(x, y)) continue;
            for (let k = 0; k < 16; k++) {
              const ang = (k / 16) * Math.PI * 2 + Math.PI * 1.25;
              const hx = x + Math.cos(ang) * dist, hy = y + Math.sin(ang) * dist;
              if (roomy(hx, hy) && clear(x, y, hx, hy)) { best = [x, y, hx, hy]; break; }
            }
          }
        }
        if (best) { cx = best[0]; cy = best[1]; g.hero.x = best[2]; g.hero.y = best[3]; }
      }
      them = [];
      for (let i = 0; i < count; i++) {
        const ang = (i / Math.max(1, count)) * Math.PI * 2;
        const m = g.spawn(k, cx + Math.cos(ang) * 0.9 * (count > 1 ? 1 : 0), cy + Math.sin(ang) * 0.9 * (count > 1 ? 1 : 0), 7, 0, false, g.rng);
        them.push(m);
      }
    }
    const h = g.hero;
    const b = them[0];
    if (isBoss) {
      // (the hero `dist` off him, toward the way in)
      const sx = L.floor.start.x - b.x, sy = L.floor.start.y - b.y;
      const kk = Math.hypot(sx, sy) || 1;
      h.x = b.x + (sx / kk) * dist; h.y = b.y + (sy / kk) * dist;
    }
    for (const m of them) {
      m.words = []; m.state = 'chase';
      if (lf > 0) m.life = Math.round(m.maxLife * lf);
    }
    const ddx = b.x - h.x, ddy = b.y - h.y, dd = Math.hypot(ddx, ddy) || 1;
    h.fx = ddx / dd; h.fy = ddy / dd;
    return { hero: [+h.x.toFixed(2), +h.y.toFixed(2)], it: [+b.x.toFixed(2), +b.y.toFixed(2)], name: b.name, kind: b.kind, life: b.life, n: them.length };
  }, [kind, depth, n, far, hurt, BOSSES.includes(kind)]);
  log('it', JSON.stringify(where));
  if (where.kind !== kind) log('!!', `the game made a ${where.kind}: ${kind} is not built yet (its rules are null), or is stood in for`);
  if (act) {
    // (only that act: every other of its kind's is kept cooling; that one never)
    await page.evaluate((a) => {
      window.__only = setInterval(() => {
        const g = window.__dbg.game(); if (!g) return;
        for (const m of g.monsters) {
          if (m.dead || !m.moveCd) continue;
          const acts = g.bosses && m.act !== undefined ? null : null; void acts;
          const list = window.__dbg.actsOf ? window.__dbg.actsOf(m) : null;
          if (!list) continue;
          list.forEach((d, i) => { m.moveCd[i] = d.id === a ? Math.min(m.moveCd[i], 0) : 99; });
        }
      }, 50);
    }, act);
  }
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const list = g.monsters.filter((m) => !m.dead);
    const b = list[0];
    if (!b) return { gone: true, perils: g.perils.length };
    return { st: b.state, gait: b.gait ? b.gait.mode : null, act: b.act ? `${b.act.id}@${b.act.t.toFixed(2)}` : null, life: b.life, d: +Math.hypot(b.x - g.hero.x, b.y - g.hero.y).toFixed(2), a1: b.a1 || null, perils: g.perils.length, monsters: list.length, hero: Math.round(g.hero.life) };
  });
  if (film) {
    const FPS = 15;
    const SLOW = 0.25;
    await page.evaluate((v) => { window.__dbg.slowmo = v; }, SLOW);
    const step = 1000 / FPS / SLOW;
    const t0 = Date.now();
    const count = Math.round(secs * FPS);
    for (let i = 0; i < count; i++) {
      const wait = t0 + i * step - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      await snap(`f_${String(i).padStart(4, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    log('end', JSON.stringify(await state()));
    return;
  }
  // (every act any of them begins, watched every twentieth of a second: an act is often over between two pictures)
  await page.evaluate(() => {
    window.__acts = new Set();
    window.__actsWatch = setInterval(() => {
      const g = window.__dbg.game(); if (!g) return;
      for (const m of g.monsters) if (!m.dead && m.act) window.__acts.add(m.act.id);
    }, 50);
  });
  for (let i = 0; i < secs; i++) {
    await page.waitForTimeout(1000);
    log(`t${i + 1}`, JSON.stringify(await state()));
    await snap(`s${String(i).padStart(2, '0')}`);
  }
  const acts = new Set(await page.evaluate(() => { clearInterval(window.__actsWatch); return [...window.__acts]; }));
  log('acts', JSON.stringify([...acts]));
  // (in the time watched, it must have done something of its own: a monster that only stands is broken)
  if (secs >= 8 && !acts.size) log('!! it never acted');
}
