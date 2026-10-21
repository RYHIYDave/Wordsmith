// FLOOR 13'S DOUBLE BOSS, THE SCRAPER AND THE QUILL (Version 23.6), FILMED IN THE GAME FOR HIM. The art chat's, with his
// “Looks good (Recommended)” (by 21:30 Pacific, 20 Oct 2026); his word on their hit areas, “make the hit boxes on the
// attacks, and the attacks themselves big”.
//   node tools/build_to.mjs dist/pair.html
//   node tools/playtest.mjs --file dist/pair.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/pair_film.mjs --out shots/film/pair
// On the Pulping Floor (floor 13), the hero by them, struck by nothing (god): (1) the two met, their names and their two
// bars; (2) the Scraper's three, the claw snap, the scour and the backward rush; (3) the Quill's two, the nib stab and the
// ink lines; (4) their combo, the Palimpsest, the hero on the strip; (5) Overwrite, the Quill writing over the Scraper's
// wounds, stopped by his blow; (6) the Quill felled, the Scraper fighting on alone; the Scraper felled, the way on. A frame
// every 20th of a second of the game's time (the game slowed to a quarter), named f_0000...
// Checks, logged '!!': every move made; the strip bursts and strikes him on it; the Scraper healed while written over and
// the writing stopped by his blow; each falls; the way on opens with both. SNAP=0: the checks only, no frames kept (the
// regression's pair_phone).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED || 7);
  const cls = process.env.CLS || 'warrior';
  const FPS = 20;
  const SLOW = 0.25;
  const keep = process.env.SNAP !== '0';
  await page.evaluate(([c, s]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run(c, s);
    D.seasoned(20);
    D.autoLevel = false;
    D.autoWords = false;
    D.god = true;
  }, [cls, seed]);
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const D = window.__dbg;
    const g = D.game();
    g.depth = 13;
    g.cleared = 12;
    g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    g.monsters = g.monsters.filter((m) => m.boss);
    D.fx.messages = [];
    g.talentsLeft = () => 0;
    const s = g.monsters.find((m) => m.kind === 'scraper');
    const q = g.monsters.find((m) => m.kind === 'quill');
    if (!s || !q) return { kinds: g.monsters.map((m) => m.kind) };
    // (the hero 5.5 tiles off the Scraper, toward the way in)
    const h = g.hero;
    const sx = L.floor.start.x - s.x;
    const sy = L.floor.start.y - s.y;
    const k = Math.hypot(sx, sy) || 1;
    h.x = s.x + (sx / k) * 5.5;
    h.y = s.y + (sy / k) * 5.5;
    // (what they do, watched every 20th of a second: every act begun; the strip's burst; the Scraper's life as it is written over)
    window.__pf = { acts: [], burst: 0, stripHit: 0, healed: 0, stopped: 0, quiet: new Set(['scraper', 'quill']), hold: true, killed: [], sent: 0 };
    const P = window.__pf;
    const kill = g.kill.bind(g);
    g.kill = (m) => { if (!m.dead) P.killed.push(m.kind); kill(m); };
    const msg = g.msg.bind(g);
    g.msg = (text, ...rest) => { if (/comes to write over/.test(text)) P.sent++; return msg(text, ...rest); };
    let lastLife = s.life;
    window.__pfWatch = setInterval(() => {
      for (const m of g.monsters) {
        if (m.dead || (m.kind !== 'scraper' && m.kind !== 'quill')) continue;
        if (m.act && !P.acts.includes(m.act.id)) P.acts.push(m.act.id);
        // (kept from their own blows while another is filmed: none of them ready, their pair's moments put off)
        if (P.quiet.has(m.kind)) {
          m.cd = Math.max(m.cd, 1);
          if (m.kind === 'scraper' && m.a1 && P.hold) { m.a1.combo = Math.max(m.a1.combo, 5); m.a1.heal = Math.max(m.a1.heal, 5); }
        }
      }
      const p = g.perils.find((x) => x.a1 === 'scraper:strip');
      if (p && p.done === 1) P.burst = 1;
      if (p && p.hit) P.stripHit = 1;
      const ss = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
      const qq = g.monsters.find((m) => m.kind === 'quill' && !m.dead);
      if (ss && qq && qq.act && qq.act.id === 'quill:write' && ss.life > lastLife) P.healed += ss.life - lastLife;
      if (ss) lastLife = ss.life;
    }, 50);
    // (one of them made to make `id` now, the hero `d` tiles before it, a little to one side, where the floor lets him stand)
    window.__pfMake = (kind, id, d, side) => {
      const m = g.monsters.find((x) => !x.dead && x.kind === kind);
      if (!m || m.state === 'act') return false;
      const list = D.actsOf(m);
      const i = list.findIndex((a) => a.id === id);
      if (i < 0) return false;
      const a0 = Math.atan2(h.y - m.y, h.x - m.x);
      for (const da of [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.2, -2.2, Math.PI]) {
        const ux = Math.cos(a0 + da);
        const uy = Math.sin(a0 + da);
        const x = m.x + ux * d + uy * side;
        const y = m.y + uy * d - ux * side;
        let clear = true;
        for (let t = 0.5; t <= d; t += 0.25) if (!g.free(L.walk, m.x + ux * t, m.y + uy * t, 0.3)) clear = false;
        if (!clear || !g.free(L.walk, x, y, 0.35)) continue;
        // (clear of the other of them, so that what this one does is seen)
        const o = g.monsters.find((z) => !z.dead && z !== m && (z.kind === 'scraper' || z.kind === 'quill'));
        if (o && (Math.hypot(o.x - x, o.y - y) < 3.4 || Math.hypot(o.x - (m.x + x) / 2, o.y - (m.y + y) / 2) < 2.2)) continue;
        h.x = x;
        h.y = y;
        const dd = Math.hypot(x - m.x, y - m.y) || 1;
        m.fx = (x - m.x) / dd;
        m.fy = (y - m.y) / dd;
        h.fx = -m.fx;
        h.fy = -m.fy;
        g.bosses.startAct(m, list, i);
        return true;
      }
      return false;
    };
    return { s: [+s.x.toFixed(1), +s.y.toFixed(1)], q: [+q.x.toFixed(1), +q.y.toFixed(1)], hero: [+h.x.toFixed(1), +h.y.toFixed(1)] };
  });
  log('film', JSON.stringify(info));
  if (!info.s) { log('!!', `floor 13's bosses are not the Scraper and the Quill: ${JSON.stringify(info.kinds)}`); return; }
  await page.evaluate((v) => { window.__dbg.slowmo = v; }, SLOW);
  const step = 1000 / FPS / SLOW;
  const t0 = Date.now();
  let i = 0;
  const frame = async () => {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (keep) await snap(`f_${String(i).padStart(4, '0')}`);
    i++;
  };
  const hold = async (s) => { const n = Math.round(s * FPS); for (let k = 0; k < n; k++) await frame(); };
  const busy = (kind) => page.evaluate((k) => { const m = window.__dbg.game().monsters.find((x) => !x.dead && x.kind === k); return !!m && m.state === 'act'; }, kind);
  const make = async (kind, id, d, side, rest) => {
    for (let k = 0; k < 4 * FPS && (await busy(kind)); k++) await frame();
    const ok = await page.evaluate(([a, b, c, e]) => window.__pfMake(a, b, c, e), [kind, id, d, side]);
    if (!ok) log('!!', `${id}: could not be made here`);
    await frame();
    for (let k = 0; k < 6 * FPS && (await busy(kind)); k++) await frame();
    await hold(rest);
  };
  // (1) met: both wake, their names, their two bars
  await hold(3);
  // (2) the Scraper's three
  await make('scraper', 'scraper:snap', 3.4, 0.3, 0.6);
  await make('scraper', 'scraper:scour', 2.6, 0.8, 0.6);
  await make('scraper', 'scraper:rush', 5.5, 0, 0.8);
  // (3) the Quill's two: the Scraper holding its ground meanwhile (as while it is written over), the hero off on the
  // Quill's side, the Quill wading out to him, clear of the Scraper
  for (let k = 0; k < 4 * FPS && ((await busy('scraper')) || (await busy('quill'))); k++) await frame();
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
    const q = g.monsters.find((m) => m.kind === 'quill' && !m.dead);
    s.a1.written = 1;
    const h = g.hero;
    const a0 = Math.atan2(q.y - s.y, q.x - s.x);
    for (const da of [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.2, -2.2, Math.PI]) {
      const x = s.x + Math.cos(a0 + da) * 7.5;
      const y = s.y + Math.sin(a0 + da) * 7.5;
      if (g.free(g.level.walk, x, y, 0.35)) { h.x = x; h.y = y; break; }
    }
  });
  for (let k = 0; k < 5 * FPS; k++) {
    await frame();
    const out = await page.evaluate(() => {
      const g = window.__dbg.game();
      const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
      const q = g.monsters.find((m) => m.kind === 'quill' && !m.dead);
      return Math.hypot(q.x - s.x, q.y - s.y) > 4.2 && Math.hypot(q.x - g.hero.x, q.y - g.hero.y) < 3.6;
    });
    if (out) break;
  }
  await make('quill', 'quill:stab', 2.5, 0.2, 0.6);
  await make('quill', 'quill:lines', 3.3, 0.6, 1.4);
  await page.evaluate(() => { window.__dbg.game().monsters.find((m) => m.kind === 'scraper' && !m.dead).a1.written = 0; });
  // (4) THE PALIMPSEST: the hero 5 tiles off the Scraper; once its line is planned, on the strip
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const P = window.__pf;
    const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
    const h = g.hero;
    const d = Math.hypot(h.x - s.x, h.y - s.y) || 1;
    h.x = s.x + ((h.x - s.x) / d) * 5;
    h.y = s.y + ((h.y - s.y) / d) * 5;
    P.quiet = new Set();
    s.a1.combo = 0;
    s.cd = 99;
    g.monsters.find((m) => m.kind === 'quill' && !m.dead).cd = 99;
    P.line = null;
  });
  for (let k = 0; k < 16 * FPS; k++) {
    await frame();
    const st = await page.evaluate(() => {
      const g = window.__dbg.game();
      const P = window.__pf;
      const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
      const q = g.monsters.find((m) => m.kind === 'quill' && !m.dead);
      // (their own blows kept back while they make it)
      s.cd = Math.max(s.cd, 1);
      q.cd = Math.max(q.cd, 1);
      if (!P.line && s.a1.plan === 1) P.line = { ux: s.a1.ux, uy: s.a1.uy, x: s.x, y: s.y };
      if (P.line && !P.burst) {
        // (the hero on the strip, five tiles out, as it is scraped and written)
        g.hero.x = P.line.x + P.line.ux * 5;
        g.hero.y = P.line.y + P.line.uy * 5;
      }
      const p = g.perils.find((x) => x.a1 === 'scraper:strip');
      return { burst: P.burst, gone: P.burst && !p, line: !!P.line };
    });
    if (st.gone) break;
  }
  await hold(0.6);
  // (5) OVERWRITE: the Scraper hurt; the Quill flies to it and writes over its wounds; a blow on the Quill stops it
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const P = window.__pf;
    const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
    P.quiet = new Set(['scraper', 'quill']);
    P.hold = false;
    s.life = Math.round(s.maxLife * 0.55);
    s.a1.heal = 0;
    s.a1.combo = 99;
    // (the hero further off: they are not drawn to strike him meanwhile)
    const h = g.hero;
    const d = Math.hypot(h.x - s.x, h.y - s.y) || 1;
    for (const r of [6.5, 6, 5.5, 5]) {
      const x = s.x + ((h.x - s.x) / d) * r;
      const y = s.y + ((h.y - s.y) / d) * r;
      if (g.free(g.level.walk, x, y, 0.35)) { h.x = x; h.y = y; break; }
    }
    s.a1.heal = 0;
    P.writeAt = -1;
  });
  for (let k = 0; k < 12 * FPS; k++) {
    await frame();
    const st = await page.evaluate(() => {
      const g = window.__dbg.game();
      const P = window.__pf;
      const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
      const q = g.monsters.find((m) => m.kind === 'quill' && !m.dead);
      if (q.act && q.act.id === 'quill:write' && P.writeAt < 0) P.writeAt = q.act.t;
      if (q.act && q.act.id === 'quill:write' && q.act.t > 2.5) {
        // (his blow on the Quill)
        const h = g.hero;
        const d = Math.hypot(q.x - h.x, q.y - h.y) || 1;
        h.fx = (q.x - h.x) / d;
        h.fy = (q.y - h.y) / d;
        g.damageMonster(q, 5, 'phys', false, 0);
        s.a1.heal = 99;
        return 'struck';
      }
      return '';
    });
    if (st === 'struck') break;
  }
  await frame();
  const after = await page.evaluate(() => {
    const g = window.__dbg.game();
    const q = g.monsters.find((m) => m.kind === 'quill' && !m.dead);
    const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
    if (q && !(q.act && q.act.id === 'quill:write')) window.__pf.stopped = 1;
    s.a1.heal = 99;
    return { stopped: window.__pf.stopped };
  });
  await hold(1.6);
  // (6) the Quill felled: the Scraper fights on alone; then the Scraper felled: the way on
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const q = g.monsters.find((m) => m.kind === 'quill' && !m.dead);
    // (his blow: its ward of words gone first, as his blows wear it down)
    q.shield = 0;
    g.damageMonster(q, Math.ceil(q.life) * 2 + 10, 'phys', false, 0);
    if (!q.dead) g.kill(q);
    window.__pf.quiet = new Set(['scraper']);
  });
  await hold(2.6);
  const mid = await page.evaluate(() => {
    const g = window.__dbg.game();
    const s = g.monsters.find((m) => m.kind === 'scraper' && !m.dead);
    const q = g.monsters.find((m) => m.kind === 'quill');
    const r = { quillDead: window.__pf.killed.includes('quill'), boss: g.boss ? g.boss.kind : null, onward: !!(g.level.ways && g.level.ways.onward && g.level.ways.onward.awake) };
    if (s) {
      s.shield = 0;
      g.damageMonster(s, Math.ceil(s.life) * 2 + 10, 'phys', false, 0);
      if (!s.dead) g.kill(s);
    }
    return r;
  });
  await hold(3.5);
  const end = await page.evaluate(() => {
    clearInterval(window.__pfWatch);
    const g = window.__dbg.game();
    const P = window.__pf;
    const s = g.monsters.find((m) => m.kind === 'scraper');
    const w = g.level.ways && g.level.ways.onward;
    return { acts: P.acts, burst: P.burst, stripHit: P.stripHit, healed: Math.round(P.healed), stopped: P.stopped, killed: P.killed, sent: P.sent, scraperDead: P.killed.includes('scraper'), onward: !!(w && w.awake) };
  });
  log('film', JSON.stringify({ frames: i, after, mid, end }));
  for (const id of ['scraper:snap', 'scraper:scour', 'scraper:rush', 'scraper:strip', 'quill:stab', 'quill:lines', 'quill:takeoff', 'quill:fly', 'quill:land', 'quill:swoop', 'quill:write']) {
    if (!end.acts.includes(id)) log('!!', `${id} never made`);
  }
  if (!end.burst) log('!!', 'the strip never burst');
  if (!end.stripHit) log('!!', 'the strip\'s burst never struck him on it');
  if (end.healed <= 0) log('!!', 'the Scraper was never healed as the Quill wrote over it');
  if (!after.stopped) log('!!', 'his blow did not stop the Quill writing');
  if (end.sent !== 1) log('!!', `the Quill was sent to write over the Scraper ${end.sent} times (once wanted)`);
  if (!mid.quillDead || mid.boss !== 'scraper') log('!!', `the Quill felled, the Scraper is not fighting on as the floor's boss: ${JSON.stringify(mid)}`);
  if (mid.onward) log('!!', 'the way on opened with one of them still standing');
  if (!end.scraperDead) log('!!', 'the Scraper never fell');
  if (!end.onward) log('!!', 'both fallen, the way on did not open');
}
