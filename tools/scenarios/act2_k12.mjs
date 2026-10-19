// ACT 2, THE HUSH: FLOOR 12'S KINDS IN THE GAME (behind ACT2, off; switched on here by the test hook, __dbg.act2): the King's rats,
// the Order's dredgers and the Rat King (game/act1_rules/rat.ts, dredger.ts, ratking.ts), on floor 12 as it is laid now. For
// looking at, and films. As tools/scenarios/act1_mob.mjs, on the Hush's floor:
//   node tools/build_to.mjs dist/k12.html
//   KIND=ratking ACT=ratking:roll FILM=1 node tools/playtest.mjs --file dist/k12.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_k12.mjs --out shots/k12/roll
// KIND: rat, dredger or ratking (ratking). N: how many (a pack of 8 rats, 2 dredgers; the boss is the floor's one). FAR: how far
// off the hero stands (3.5 tiles). SECS: how long to watch (8). ACT: an act to have it make over and over (its id): every other is
// kept cooling. FILM=1: a frame every 15th of a second of the game's time (the game slowed), named f_0000... (else a picture a
// second). SLEEP=1: they lie not yet woken, kept so with the hero FAR off (the rats looking round now and then; a picture only:
// they are put back to sleep every twentieth of a second). HURT: its life as a share of its whole.
// KILL=s: killed s seconds in (its death). CLS: the hero (warrior). The hero is struck by nothing (god).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const kind = process.env.KIND || 'ratking';
  const n = Number(process.env.N || (kind === 'rat' ? 8 : kind === 'dredger' ? 2 : 1));
  const far = Number(process.env.FAR || 3.5);
  const secs = Number(process.env.SECS || 8);
  const act = process.env.ACT || '';
  const film = !!process.env.FILM;
  const sleep = !!process.env.SLEEP;
  const hurt = process.env.HURT ? Number(process.env.HURT) : 0;
  const killAt = process.env.KILL ? Number(process.env.KILL) : -1;
  const cls = process.env.CLS || 'warrior';
  await page.evaluate(([c]) => {
    const d = window.__dbg; d.saving(false); d.run(c, 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.act2(true, 12);
  }, [cls]);
  await page.waitForTimeout(800);
  const where = await page.evaluate(([k, count, dist, lf, asleep]) => {
    const g = window.__dbg.game();
    const L = g.level;
    L.explored.fill(1);
    const h = g.hero;
    let them;
    if (k === 'ratking') {
      g.monsters = g.monsters.filter((m) => m.boss);
      them = g.monsters;
      const b = them[0];
      // (the hero `dist` off him, toward the way in)
      const sx = L.floor.start.x - b.x, sy = L.floor.start.y - b.y;
      const kk = Math.hypot(sx, sy) || 1;
      h.x = b.x + (sx / kk) * dist; h.y = b.y + (sy / kk) * dist;
    } else {
      g.monsters = [];
      g.boss = null;
      // (in the floor's widest open area that is not the start)
      const land = L.land;
      const a = land.areas.filter((q) => q.role === 'path').sort((p, q) => q.blob.rx * q.blob.ry - p.blob.rx * p.blob.ry)[0] || land.areas[0];
      const cx = a.blob.x, cy = a.blob.y;
      h.x = cx - dist * 0.7; h.y = cy - dist * 0.7;
      them = [];
      for (let i = 0; i < count; i++) {
        const ang = (i / Math.max(1, count)) * Math.PI * 2;
        const r = count > 1 ? (k === 'rat' ? 0.8 : 1.1) : 0;
        them.push(g.spawn(k, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 7, 0, false, g.rng));
      }
    }
    const b = them[0];
    for (const m of them) {
      m.words = [];
      if (!asleep) m.state = 'chase';
      if (lf > 0) m.life = Math.round(m.maxLife * lf);
    }
    const ddx = b.x - h.x, ddy = b.y - h.y, dd = Math.hypot(ddx, ddy) || 1;
    h.fx = ddx / dd; h.fy = ddy / dd;
    return { land: L.land?.kind, hero: [+h.x.toFixed(2), +h.y.toFixed(2)], it: [+b.x.toFixed(2), +b.y.toFixed(2)], name: b.name, kind: b.kind, life: b.life, n: them.length };
  }, [kind, n, far, hurt, sleep]);
  log('it', JSON.stringify(where));
  if (where.kind !== kind) log('!!', `the game made a ${where.kind}: ${kind} is not built (its rules are null), or is stood in for`);
  if (sleep) {
    await page.evaluate(() => {
      window.__sleep = setInterval(() => {
        const g = window.__dbg.game(); if (!g) return;
        for (const m of g.monsters) if (!m.dead) { m.state = 'sleep'; m.act = undefined; m.anim = 'idle'; }
      }, 50);
    });
  }
  if (kind === 'ratking') {
    // (he waits for the hero to come into his ground, then says his line: wait it out, a picture of it)
    await page.waitForTimeout(1200);
    await snap('intro');
    await page.waitForTimeout(3000);
  }
  if (act) {
    await page.evaluate((a) => {
      window.__only = setInterval(() => {
        const g = window.__dbg.game(); if (!g) return;
        for (const m of g.monsters) {
          if (m.dead || !m.moveCd) continue;
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
    return { st: b.state, gait: b.gait ? b.gait.mode : null, act: b.act ? `${b.act.id}@${b.act.t.toFixed(2)}` : null, at: [+b.x.toFixed(1), +b.y.toFixed(1)], d: +Math.hypot(b.x - g.hero.x, b.y - g.hero.y).toFixed(2), a1: b.a1 || null, perils: g.perils.length, monsters: list.length, held: g.hero.held || 0 };
  });
  await page.evaluate(() => {
    window.__acts = new Set();
    window.__actsWatch = setInterval(() => {
      const g = window.__dbg.game(); if (!g) return;
      for (const m of g.monsters) if (!m.dead && m.act) window.__acts.add(m.act.id);
    }, 50);
  });
  const kill = () => page.evaluate(() => {
    const g = window.__dbg.game();
    for (const m of g.monsters) if (!m.dead) g.kill(m);
  });
  if (film) {
    const FPS = 15;
    const SLOW = 0.25;
    await page.evaluate((v) => { window.__dbg.slowmo = v; }, SLOW);
    const step = 1000 / FPS / SLOW;
    const t0 = Date.now();
    const count = Math.round(secs * FPS);
    let killed = false;
    for (let i = 0; i < count; i++) {
      const wait = t0 + i * step - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      if (killAt >= 0 && !killed && i / FPS >= killAt) {
        killed = true;
        await kill();
      }
      await snap(`f_${String(i).padStart(4, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  } else {
    for (let i = 0; i < secs; i++) {
      await page.waitForTimeout(1000);
      if (killAt >= 0 && i + 1 === Math.round(killAt)) await kill();
      log(`t${i + 1}`, JSON.stringify(await state()));
      await snap(`s${String(i).padStart(2, '0')}`);
    }
  }
  const acts = await page.evaluate(() => { clearInterval(window.__actsWatch); return [...window.__acts]; });
  log('acts', JSON.stringify(acts));
  log('end', JSON.stringify(await state()));
  if (secs >= 6 && !acts.length && !sleep) log('!! it never acted');
}
