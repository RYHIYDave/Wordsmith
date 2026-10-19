// ACT 2, THE HUSH: FLOOR 14'S KINDS IN THE GAME (behind ACT2, off; switched on here by the test hook, __dbg.act2): the Hushed patients in
// their beds, rising as the hero passes and screaming; the orderlies' mallet; the Physician, his rap, the Draw (a word of the hero's over
// his head), Tonic (clouds of the Hush) and Rounds (patients rising out of the beds near him). On the stand-in floor 14 (its map-maker
// another helper's), the beds laid here by the scenario as the map-maker will lay them.
//   node tools/build_to.mjs dist/k14.html
//   SCENE=ward node tools/playtest.mjs --file dist/k14.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_k14.mjs --out shots/k14/ward
// SCENE: ward (patients in their beds, the hero walking past), orderly, boss. ACT (boss): one of his acts made over and over
// ('physician:draw'), every other kept cooling. SECS: how long (10). FILM=1: a picture every fifteenth of a second of the game's time
// (slowed), else every EVERY ms (500). SEED (3).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const scene = process.env.SCENE || 'ward';
  const secs = Number(process.env.SECS || 10);
  const every = Number(process.env.EVERY || 500);
  const act = process.env.ACT || '';
  const film = !!process.env.FILM;
  await page.evaluate(([seed]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', seed);
    D.seasoned(20);
    D.autoLevel = false;
    D.autoWords = false;
    D.god = true;
    D.act2(true, 14);
  }, [Number(process.env.SEED || 3)]);
  await page.waitForTimeout(800);
  const info = await page.evaluate(([scene]) => {
    const g = window.__dbg.game();
    const L = g.level;
    const f = L.floor;
    const h = g.hero;
    L.explored.fill(1);
    const land = L.land;
    const area = scene === 'boss' ? land.areas.find((a) => a.role === 'boss') : land.areas.find((a) => a.role === 'path') || land.areas[0];
    const cx = Math.floor(area.blob.x) + 0.5;
    const cy = Math.floor(area.blob.y) + 0.5;
    const walk = (x, y) => x >= 0 && y >= 0 && x < f.w && y < f.h && L.walk[Math.floor(y) * f.w + Math.floor(x)] === 1;
    // (clear the place of the floor's own things that stand, so that what is laid here has room)
    const clear = (x0, y0, x1, y1) => {
      for (const p of L.props) {
        if (p.tx < x0 || p.ty < y0 || p.tx > x1 || p.ty > y1 || p.kind !== 'piece') continue;
        p.solid = false;
        p.tx = -99;
        p.x = -99;
      }
      L.props = L.props.filter((p) => p.tx !== -99);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (f.tiles[y * f.w + x] === 1) L.walk[y * f.w + x] = 1;
    };
    const beds = [];
    const bed = (tx, ty, variant) => {
      if (!walk(tx + 0.5, ty + 0.5)) return null;
      const p = { kind: 'piece', name: 'an iron ward bed', tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant };
      L.props.push(p);
      L.walk[ty * f.w + tx] = 0;
      beds.push(p);
      return p;
    };
    let out = {};
    if (scene === 'ward' || scene === 'orderly') {
      g.monsters = g.monsters.filter((m) => m.boss);
      const bx = Math.floor(cx) - 3;
      const by = Math.floor(cy) - 3;
      clear(bx - 2, by - 2, bx + 9, by + 8);
      if (scene === 'ward') {
        // (a row of beds, their heads toward -y (the patients facing down the screen to the right), and one turned the other way)
        for (let i = 0; i < 3; i++) bed(bx, by + 2 * i, 2);
        bed(bx + 3, by - 1, 0);
        const them = [];
        for (const p of beds) them.push(g.spawn('patient', p.x + (p.variant === 2 ? 0.9 : 0), p.y + (p.variant === 0 ? 0.9 : 0), 9001, 0, false, g.rng));
        // (and one asleep on its feet, no bed)
        them.push(g.spawn('patient', bx + 2.5, by + 5.5, 9001, 0, false, g.rng));
        for (const m of them) m.words = [];
        h.x = bx + 7.5;
        h.y = by + 2.5;
        out = { beds: beds.length, lying: them.filter((m) => m.a1 && m.a1.bed === 1).length };
      } else {
        const them = [];
        for (let i = 0; i < 2; i++) them.push(g.spawn('orderly', bx + 2.5, by + 1.5 + 2 * i, 9002, 0, false, g.rng));
        for (const m of them) {
          m.words = [];
          m.state = 'chase';
        }
        h.x = bx + 5.0;
        h.y = by + 2.5;
        out = { orderlies: them.length };
      }
    } else {
      // THE PHYSICIAN in his ground: beds near him, two of them with patients lying in them; the hero with a word set
      const b = g.boss;
      g.monsters = g.monsters.filter((m) => m.boss);
      const bx = Math.floor(b.x);
      const by = Math.floor(b.y);
      clear(bx - 6, by - 6, bx + 6, by + 6);
      for (let i = 0; i < 4; i++) bed(bx - 4, by - 3 + 2 * i, 2);
      for (let i = 0; i < 2; i++) {
        const p = beds[i];
        if (p) g.spawn('patient', p.x + 0.9, p.y, 9003, 0, false, g.rng).words = [];
      }
      b.words = [];
      h.skills[0].front[0] = 'fire';
      h.words.fire = Math.max(0, (h.words.fire || 0) - 1);
      g.refresh();
      // (the hero comes into his ground from the side the floor begins on)
      const sx = f.start.x - b.x;
      const sy = f.start.y - b.y;
      const k = Math.hypot(sx, sy) || 1;
      h.x = b.x + (sx / k) * 3.2;
      h.y = b.y + (sy / k) * 3.2;
      out = { boss: b.kind, name: b.name, beds: beds.length };
    }
    const dx = (scene === 'boss' ? g.boss.x : h.x - 5) - h.x;
    const dy = (scene === 'boss' ? g.boss.y : h.y) - h.y;
    const d = Math.hypot(dx, dy) || 1;
    h.fx = dx / d;
    h.fy = dy / d;
    return { ...out, hero: [+h.x.toFixed(2), +h.y.toFixed(2)], area: area.role };
  }, [scene]);
  log('scene', JSON.stringify(info));
  if (act) {
    await page.evaluate((a) => {
      window.__only = setInterval(() => {
        const g = window.__dbg.game();
        if (!g) return;
        for (const m of g.monsters) {
          if (m.dead || !m.moveCd || !m.boss) continue;
          const list = window.__dbg.actsOf(m);
          if (!list) continue;
          list.forEach((d, i) => { m.moveCd[i] = d.id === a ? Math.min(m.moveCd[i], 0) : 99; });
        }
      }, 50);
    }, act);
  }
  // (the hero, in the ward, walks slowly down past the beds)
  if (scene === 'ward') {
    await page.evaluate(() => {
      window.__walk = setInterval(() => {
        const g = window.__dbg.game();
        if (!g || window.__dbg.slowmo === 0) return;
        const h = g.hero;
        if (g.time > 1.2 && g.time < 5.5) h.x -= 0.05 * window.__dbg.slowmo;
      }, 50);
    });
  }
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const list = g.monsters.filter((m) => !m.dead);
    return {
      t: +g.time.toFixed(2),
      them: list.map((m) => `${m.kind}${m.a1 && m.a1.bed ? `(bed ${m.a1.bed})` : ''}${m.act ? `:${m.act.id.split(':')[1]}@${m.act.t.toFixed(2)}` : ''}${m.a1 && m.a1.held ? ' HOLDS A WORD' : ''}`).join(' | '),
      hushed: +g.hushT.toFixed(2),
      perils: g.perils.filter((p) => p.kind === 'act1').map((p) => p.a1.split(':')[1]).join(','),
      sock: g.hero.skills[0].front.join(','),
    };
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
      if (i % 15 === 0) log(`f${i}`, JSON.stringify(await state()));
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    return;
  }
  const n = Math.round((secs * 1000) / every);
  for (let i = 0; i < n; i++) {
    await page.waitForTimeout(every);
    log(`s${i}`, JSON.stringify(await state()));
    await snap(`s${String(i).padStart(2, '0')}`);
  }
}
