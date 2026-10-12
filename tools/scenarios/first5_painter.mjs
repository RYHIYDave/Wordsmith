// THE FIRST FIVE FLOORS: THE PAINTER (render/painter.ts), in a real browser. A floor is come into and
// stood on: the painter paints its boss (and its films) beside the game, and the game is not held up.
//   node tools/build_to.mjs dist/first5.html
//   DEPTH=2 node tools/playtest.mjs --file dist/first5.html --scenario tools/scenarios/first5_painter.mjs --out shots/first5/painter2
//   ... --hash painter=off   the same with no painter: the game paints for itself (and has no films)
// DEPTH: which floor (2). SECS: for how long at most (90). FIGHT=1: the hero stands before the boss from the start.
// It says: whether there is a painter, how many frames it handed over and how many the game painted
// itself meanwhile, the films it made, and how long the game's frames were (the longest, and how many
// were longer than 34 thousandths of a second: two frames of a 60-a-second screen).
import { execSync } from 'node:child_process';
import { log } from './lib.mjs';

/** The room the browser's page and picture processes take, in megabytes (what the operating system says they hold). */
function room() {
  try {
    const out = execSync('ps -eo rss,args', { encoding: 'utf8' });
    let page = 0; let gpu = 0;
    for (const line of out.split('\n')) {
      const m = /^\s*(\d+)\s+(.*)$/.exec(line);
      if (!m) continue;
      if (/--type=renderer/.test(m[2])) page += Number(m[1]);
      else if (/--type=gpu-process/.test(m[2])) gpu += Number(m[1]);
    }
    return { page: Math.round(page / 1024), gpu: Math.round(gpu / 1024) };
  } catch { return null; }
}

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 2);
  const secs = Number(process.env.SECS || 90);
  const fight = !!process.env.FIGHT;
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(600);
  const start = await page.evaluate(([n, f]) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const boss = g.monsters.find((m) => m.boss);
    if (f) {
      g.monsters = g.monsters.filter((m) => m.boss);
      const s = g.level.doors.find((q) => q.spot.kind === 'bossgate').spot;
      const gx = s.alongX ? s.a + 1.5 : s.plane;
      const gy = s.alongX ? s.plane : s.a + 1.5;
      const k = Math.hypot(gx - boss.x, gy - boss.y);
      g.hero.x = boss.x + ((gx - boss.x) / k) * 3.5;
      g.hero.y = boss.y + ((gy - boss.y) / k) * 3.5;
    }
    // the game's frames, timed from here on
    const w = window;
    w.__ft = { last: performance.now(), max: 0, long: 0, n: 0, sum: 0 };
    const tick = (now) => {
      const d = now - w.__ft.last; w.__ft.last = now;
      w.__ft.n++; w.__ft.sum += d;
      if (d > w.__ft.max) w.__ft.max = d;
      if (d > 34) w.__ft.long++;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return { boss: boss.kind, painter: window.__dbg.painter.state, painted: { ...window.__dbg.painting } };
  }, [depth, fight]);
  log('start', JSON.stringify(start));
  const t0 = Date.now();
  let shot = 0;
  let quiet = 0;
  let lastFrames = -1;
  while (Date.now() - t0 < secs * 1000) {
    await page.waitForTimeout(2000);
    const st = await page.evaluate(() => {
      const d = window.__dbg; const p = d.painter; const ft = window.__ft;
      const out = { t: 0, state: p.state, workers: p.stats.workers, given: p.stats.frames, late: p.stats.late, films: p.stats.films, failed: p.stats.failed, busy: p.busy(), mainPainted: d.painting.frames, mainMs: Math.round(d.painting.ms), frames: ft.n, avg: +(ft.sum / Math.max(1, ft.n)).toFixed(1), max: Math.round(ft.max), long: ft.long };
      ft.max = 0; ft.long = 0; ft.n = 0; ft.sum = 0;
      return out;
    });
    st.t = +((Date.now() - t0) / 1000).toFixed(0);
    st.room = room();
    log('painter', JSON.stringify(st));
    if (shot < 3 && st.t >= shot * 8) await snap(`s${shot++}`);
    // (over when the painter has nothing left to do, or, with none, when the game has stopped painting for itself)
    const now = st.given + st.mainPainted;
    quiet = now === lastFrames && !st.busy ? quiet + 1 : 0;
    lastFrames = now;
    if (quiet >= 3) break;
  }
  await snap('end');
  // (the heavy figures' pictures as they are held: how many, and the room their pixels take)
  const held = await page.evaluate(() => {
    const b = window.__dbg.renderer.art.bestiary;
    const out = {};
    for (const f of ['headsman', 'chained', 'chained1', 'chained2', 'amalgam', 'fleshmancer']) {
      let n = 0; let px = 0; let bitmaps = 0; let lazy = 0;
      const art = b.of(f);
      const seen = new Set();
      for (const set of [art.front, art.back]) {
        const lists = [set.idle, set.walk];
        const c = set.clips || {};
        for (const k of ['attack', 'heavy', 'die', 'reel']) if (c[k]) lists.push(c[k].frames);
        for (const m of Object.values(c.moves || {})) lists.push(m.frames);
        for (const list of lists) for (let i = 0; i < list.length; i++) {
          const d = Object.getOwnPropertyDescriptor(list, i);
          if (!d || !('value' in d) || !d.value) { lazy++; continue; }
          if (seen.has(d.value)) continue;
          seen.add(d.value);
          n++; px += d.value.img.width * d.value.img.height;
          if (typeof d.value.img.close === 'function') bitmaps++;
        }
      }
      if (n) out[f] = { n, bitmaps, lazy, mb: +(px * 4 / 1048576).toFixed(1) };
    }
    return out;
  });
  log('held', JSON.stringify(held));
  if (process.env.DROP) {
    // (for measuring: the heavy figures let go of, and how much room that gives back)
    const before = room();
    await page.evaluate(() => {
      const b = window.__dbg.renderer.art.bestiary;
      window.__dbg.renderer.painter = null;
      for (const f of ['headsman', 'chained', 'chained1', 'chained2', 'amalgam', 'fleshmancer']) b.forget(f);
      window.__dbg.game().monsters = [];
    });
    await page.waitForTimeout(4000);
    log('dropped', JSON.stringify({ before, after: room() }));
  }
}
