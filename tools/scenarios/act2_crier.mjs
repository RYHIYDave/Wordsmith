// ACT 2, THE HUSH: FLOOR 11'S BOSS, THE CRIER, IN THE GAME (behind ACT2, off; switched on here by the test hook, __dbg.act2), on
// the floor as it stands (the stand-in Gate Ward until its map-maker is built): the hero set before him in his ground, and
// each of his moves made in turn, a picture at its warning, its blow and after, the game slowed so that each is caught.
//   node tools/build_to.mjs dist/crier.html
//   node tools/playtest.mjs --file dist/crier.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_crier.mjs --out shots/crier/c
// ACTS: which (comma-separated: swing, shout, proclaim, crowd, march, death; all of them). FAR: how far off the hero stands (4).
// SEED (3). CLS (warrior). SLOW: how slowed while a move is caught (0.2). PERF=1: no pictures, each move at the game's own
// speed, its frame times logged (the page's own clock between frames, in milliseconds: its median and its worst), and his
// stand's for a measure.
import { log } from './lib.mjs';

/** Each move: its act, and the moments of it to catch (seconds into it; past its end, what it leaves). */
const MOVES = {
  swing: { act: 'crier:swing', at: [0.45, 0.66, 0.74, 0.86, 1.2, 1.5] },
  shout: { act: 'crier:shout', at: [0.6, 0.78, 0.9, 1.1, 1.4, 1.9, 2.15] },
  proclaim: { act: 'crier:proclaim', at: [0.7, 0.88, 1.0, 1.2, 1.5, 2.3, 3.2] },
  crowd: { act: 'crier:crowd', at: [0.55, 0.72, 0.85, 1.2, 1.6, 2.2, 3.0, 4.0] },
};

export default async function (page, snap) {
  const which = (process.env.ACTS || 'swing,shout,proclaim,crowd,march,death').split(',');
  const far = Number(process.env.FAR || 4);
  const seed = Number(process.env.SEED || 3);
  const cls = process.env.CLS || 'warrior';
  const slow = Number(process.env.SLOW || 0.2);
  const where = await page.evaluate(([seed, cls]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run(cls, seed);
    D.seasoned(20);
    D.autoLevel = false;
    D.autoWords = false;
    D.god = true;
    D.act2(true, 11);
    const g = D.game();
    g.level.explored.fill(1);
    const b = g.boss;
    return { depth: g.depth, land: g.level.land?.kind, boss: b?.kind, name: b?.name, at: b ? [+b.x.toFixed(2), +b.y.toFixed(2)] : null };
  }, [seed, cls]);
  log('floor', JSON.stringify(where));
  if (where.boss !== 'crier') log('!!', `floor 11's boss is ${where.boss}: the Crier is not built (his rules are null)`);
  // (the frame clock: every frame's time from the last, kept while `__keep` is on)
  await page.evaluate(() => {
    window.__ft = [];
    window.__keep = false;
    let last = performance.now();
    const tick = (now) => {
      if (window.__keep) window.__ft.push(now - last);
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const frames = async (label) => {
    const ft = await page.evaluate(() => { const f = window.__ft; window.__ft = []; window.__keep = false; return f; });
    if (!ft.length) return;
    const s = [...ft].sort((a, b) => a - b);
    log('frames', `${label}: ${ft.length} frames, median ${s[Math.floor(s.length / 2)].toFixed(1)} ms, worst ${s[s.length - 1].toFixed(1)} ms`);
  };
  // (the hero before him, in his ground, toward where the floor began; he waits for the hero, says his line)
  // (`wide`: the way from him with the longest run of open floor, for a move that wants a street's length)
  const place = (dist, wide = false) => page.evaluate(([dist, wide]) => {
    const g = window.__dbg.game();
    const b = g.boss;
    const h = g.hero;
    const L = g.level;
    let sx = L.floor.start.x - b.x, sy = L.floor.start.y - b.y;
    if (wide) {
      let best = -1;
      for (let a = 0; a < 360; a += 5) {
        const cx = Math.cos((a * Math.PI) / 180), cy = Math.sin((a * Math.PI) / 180);
        let o = 0;
        for (let d = 0.35; d < 20; d += 0.35) { if (!g.free(L.walk, b.x + cx * d, b.y + cy * d, 0.3)) break; o = d; }
        if (o > best) { best = o; sx = cx; sy = cy; }
      }
    }
    const k = Math.hypot(sx, sy) || 1;
    // (on open floor: along the way toward the start, or the nearest open spot to it)
    let x = b.x + (sx / k) * dist, y = b.y + (sy / k) * dist;
    if (!g.isOpen(x, y)) {
      const s = g.spotsRound(x, y, 1)[0];
      if (s) { x = s.x; y = s.y; }
    }
    h.x = x; h.y = y;
    const dx = b.x - h.x, dy = b.y - h.y, dd = Math.hypot(dx, dy) || 1;
    h.fx = dx / dd; h.fy = dy / dd;
    return [+h.x.toFixed(2), +h.y.toFixed(2)];
  }, [dist, wide]);
  log('hero', JSON.stringify(await place(far)));
  await page.waitForTimeout(400);
  await snap('meet_a');
  await page.waitForTimeout(1300);
  await snap('meet_b');
  await page.waitForTimeout(2600);
  // (his stand, for a measure of the frames)
  await page.evaluate(() => { window.__ft = []; window.__keep = true; const g = window.__dbg.game(); for (const m of g.monsters) if (m.boss && m.moveCd) m.moveCd = m.moveCd.map(() => 99); g.boss.cd = 3; });
  await page.waitForTimeout(1500);
  await frames('standing');
  const only = (act) => page.evaluate((a) => {
    clearInterval(window.__only);
    window.__only = setInterval(() => {
      const g = window.__dbg.game(); if (!g || !g.boss || g.boss.dead || !g.boss.moveCd) return;
      const list = window.__dbg.actsOf(g.boss);
      list.forEach((d, i) => { g.boss.moveCd[i] = d.id === a ? Math.min(g.boss.moveCd[i], 0) : 99; });
      // (his calling put out of the way, so that each move is seen alone)
      for (const o of g.monsters) if (!o.boss && o.a1 && o.a1.crierCalled) o.dead = true;
    }, 40);
  }, act);
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.boss;
    return { act: b && b.act ? b.act.id : null, t: b && b.act ? b.act.t : -1, n: b && b.act ? b.act.n : -1, gait: b?.gait?.mode, d: b ? +Math.hypot(b.x - g.hero.x, b.y - g.hero.y).toFixed(2) : -1, hush: +g.hushT.toFixed(2), perils: g.perils.filter((p) => p.a1 && p.a1.startsWith('crier:')).map((p) => `${p.a1.slice(6)}@${p.t.toFixed(2)}`), called: g.monsters.filter((o) => !o.dead && o.a1 && o.a1.crierCalled).length, time: g.time };
  });
  for (const name of which) {
    const mv = MOVES[name];
    if (!mv) continue;
    // (that move alone ready, before the hero is set off from him: else he sets off after the hero first; and the game slowed
    // already, so that a busy machine's slow page does not let the moment go by before it is seen)
    await only(mv.act);
    await page.evaluate((v) => { window.__dbg.slowmo = v; }, process.env.PERF ? 1 : slow);
    await page.waitForTimeout(120);
    await place(name === 'proclaim' ? 5 : name === 'shout' ? 4.5 : name === 'swing' ? 2.4 : far, name === 'proclaim');
    // (wait for him to begin it)
    let s = await state();
    for (let i = 0; i < 200 && s.act !== mv.act; i++) {
      await page.waitForTimeout(50);
      s = await state();
    }
    // (begun: no more of it, nor any other, while it is watched)
    await page.evaluate(() => { clearInterval(window.__only); const g = window.__dbg.game(); for (let i = 0; i < g.boss.moveCd.length; i++) g.boss.moveCd[i] = 99; });
    if (s.act !== mv.act) {
      await page.evaluate(() => { window.__dbg.slowmo = 1; });
      log('!!', `${name}: he never began it (${JSON.stringify(s)})`);
      continue;
    }
    if (process.env.PERF) {
      // (at the game's own speed, no pictures: the frames' times while it plays out, and what it leaves)
      await page.evaluate(() => { window.__ft = []; window.__keep = true; });
      await page.waitForTimeout(Math.ceil(mv.at[mv.at.length - 1] * 1000) + 300);
      await frames(name);
      continue;
    }
    // (the game slowed; each moment caught as the game's clock passes it, from when he began)
    await page.evaluate((v) => { window.__dbg.slowmo = v; window.__ft = []; window.__keep = true; }, slow);
    const start = s.time - Math.max(0, s.t);
    for (let i = 0; i < mv.at.length; i++) {
      for (let k = 0; k < 400; k++) {
        s = await state();
        if (s.time - start >= mv.at[i]) break;
        await page.waitForTimeout(15);
      }
      log(`${name} ${mv.at[i]}`, JSON.stringify(s));
      await snap(`${name}_${String(i).padStart(2, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    await frames(`${name} (slowed ${slow})`);
    await page.waitForTimeout(800);
  }
  await page.evaluate(() => clearInterval(window.__only));
  if (which.includes('march')) {
    // HIS MARCH: the hero well off, he comes on at his pace
    await page.evaluate(() => { const g = window.__dbg.game(); g.boss.moveCd = g.boss.moveCd.map(() => 99); for (const o of g.monsters) if (!o.boss) o.dead = true; });
    await place(9, true);
    await page.evaluate((v) => { window.__dbg.slowmo = v; }, 0.5);
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(450);
      log(`march ${i}`, JSON.stringify(await state()));
      await snap(`march_${i}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  }
  if (which.includes('death')) {
    // HIS DEATH: the Hush pours out of him
    await page.evaluate(() => { const g = window.__dbg.game(); g.boss.moveCd = g.boss.moveCd.map(() => 99); g.boss.cd = 9; for (const o of g.monsters) if (!o.boss) o.dead = true; });
    await place(3.5, true);
    await page.waitForTimeout(300);
    await page.evaluate((v) => {
      const g = window.__dbg.game();
      window.__dbg.slowmo = v;
      g.boss.moveCd = g.boss.moveCd.map(() => 99);
      g.kill(g.boss);
    }, 0.5);
    for (let i = 0; i < 6; i++) {
      await snap(`death_${i}`);
      await page.waitForTimeout(1100);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    log('after', JSON.stringify(await page.evaluate(() => { const g = window.__dbg.game(); return { perils: g.perils.length, boss: g.boss ? g.boss.dead : null, way: !!g.level.ways?.onward }; })));
  }
}
