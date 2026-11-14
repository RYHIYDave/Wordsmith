// FLOOR 9'S TWO SIDE AREAS, DRESSED FOR ITS SIDE BOSSES (docs/mockups/f9_side_bosses): the trolls' camp in the lair and the misty
// glade in the side area, from the game itself at a phone's size, wide (more of the floor in the picture), with F9_LAIRS as asked.
//   node tools/build_to.mjs dist/f9lairs.html
//   ON=1 node tools/playtest.mjs --file dist/f9lairs.html --hash painter=off --touch --size 852x393 --dpr 3 --scenario tools/scenarios/f9_lairs.mjs --out shots/f9lairs
// ON=1: the switch on (else as the game has it). SEED: the run's (9). WIDE: how many times the game pixels each way (1.7).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED || 9);
  const on = process.env.ON === '1';
  const WIDE = Number(process.env.WIDE || 1.7);
  await page.evaluate(([s, o]) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.seasoned(14); d.autoLevel = false; d.autoWords = false; d.god = true;
    if (d.looks.F9_LAIRS) d.looks.F9_LAIRS.on = o;
    d.game().talentsLeft = () => 0;
  }, [seed, on]);
  await page.waitForTimeout(600);
  const f9 = await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 9; g.cleared = 8; g.enterDungeon();
    g.talentsLeft = () => 0;
    const L = g.level;
    L.explored.fill(1);
    const land = L.land;
    const near = (b) => g.monsters.filter((m) => !m.dead && Math.hypot(m.x - b.x, m.y - b.y) < Math.max(b.rx, b.ry) + 3).map((m) => `${m.kind}${m.champion ? '*' : ''}${m.boss ? 'B' : ''}`);
    // (the bosses' and the traps' out of the picture; the monsters stand still)
    g.traps = []; if (L.hazards) L.hazards.length = 0;
    for (const m of g.monsters) m.stunT = 99999;
    // (the glade's packs and the floor's wanderers kept out of its picture: game/act1_layout.ts lays none there now)
    const lair = land.areas.find((a) => a.role === 'lair');
    const guards = lair ? g.monsters.filter((m) => m.champion && Math.hypot(m.x - lair.blob.x, m.y - lair.blob.y) < 12) : [];
    const gx = guards.length ? guards.reduce((s2, m) => s2 + m.x, 0) / guards.length : 0;
    const gy = guards.length ? guards.reduce((s2, m) => s2 + m.y, 0) / guards.length : 0;
    const counts = {};
    for (const p of L.props) if (p.name) counts[p.name] = (counts[p.name] || 0) + 1;
    const where = L.props.filter((p) => p.name && /troll|skull pole|chieftain/.test(p.name)).map((p) => `${p.name}@${p.tx},${p.ty}/${p.variant}`);
    return { w: L.floor.w, h: L.floor.h, areas: land.areas.map((a) => ({ role: a.role, x: a.blob.x, y: a.blob.y, rx: a.blob.rx, ry: a.blob.ry, rot: a.blob.rot, mobs: near(a.blob) })), start: L.floor.start, guards: [gx, gy], counts, where };
  });
  log('floor 9', JSON.stringify({ size: [f9.w, f9.h], start: f9.start, guards: f9.guards }));
  log('pieces', JSON.stringify(f9.counts));
  log('where', JSON.stringify(f9.where));
  for (const a of f9.areas) log('area', JSON.stringify(a));
  await page.waitForTimeout(7500);
  const wide = (k) => page.evaluate((kk) => {
    const s = window.__dbg.screen;
    const cv = s.canvas;
    if (!kk) { window.dispatchEvent(new Event('resize')); return; }
    s.w = Math.round(s.w * kk); s.h = Math.round(s.h * kk);
    cv.width = s.w * 2; cv.height = s.h * 2;
    s.g.setTransform(2, 0, 0, 2, 0, 0); s.g.imageSmoothingEnabled = false;
  }, k);
  const fs = await import('node:fs');
  const outDir = process.env.CANVAS_OUT || '';
  const go = async (x, y, name, wait = 2500) => {
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; g.hero.fx = -0.7; g.hero.fy = 0.7; }, [x, y]);
    await page.waitForTimeout(wait);
    await snap(name);
    // (CANVAS_OUT: the game's own canvas as it is, a picture pixel to a pixel, and where its spots for the bosses are on it)
    if (outDir) {
      const got = await page.evaluate(() => {
        const d = window.__dbg; const g = d.game(); const L = g.level; const s = d.screen; const cam = d.cam();
        const f = s.canvas.width / s.w;
        const at = (x, y) => [((x - y) * 16 + cam.ox) * f, ((x + y) * 8 + cam.oy) * f];
        const seat = L.props.find((p) => p.name === "the chieftain's seat");
        const beam = L.props.find((p) => p.name === 'the moonbeam');
        const fire = L.props.find((p) => p.name === "the trolls' fire");
        let chief = null;
        if (seat && fire) {
          const dx = fire.x - (seat.x + 0.5); const dy = fire.y - (seat.y + 0.5); const dd = Math.hypot(dx, dy) || 1;
          chief = at(seat.x + 0.5 + (dx / dd) * 2.2, seat.y + 0.5 + (dy / dd) * 2.2);
        }
        return { png: s.canvas.toDataURL('image/png'), w: s.canvas.width, h: s.canvas.height, chief, wolf: beam ? at(beam.x, beam.y + 0.3) : null };
      });
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(`${outDir}/${name}.png`, Buffer.from(got.png.split(',')[1], 'base64'));
      fs.writeFileSync(`${outDir}/${name}.json`, JSON.stringify({ w: got.w, h: got.h, chief: got.chief, wolf: got.wolf }));
      log('canvas', name, JSON.stringify({ w: got.w, h: got.h, chief: got.chief, wolf: got.wolf }));
    }
  };
  await wide(WIDE);
  for (const role of ['lair', 'side']) {
    const a = f9.areas.find((q) => q.role === role);
    if (!a) continue;
    const spot = await page.evaluate((r) => { const d = window.__dbg; return d.f9Lairs ? d.f9Lairs(r) : null; }, role);
    if (spot) log(role, JSON.stringify(spot));
    // (the camp seen from just outside its way in, where its guardians mill; the glade from a little toward the eye of its middle)
    if (role === 'lair' && f9.guards[0]) {
      const dx = f9.guards[0] - a.x;
      const dy = f9.guards[1] - a.y;
      const d = Math.hypot(dx, dy) || 1;
      await go(a.x + (dx / d) * (Math.max(a.rx, a.ry) + 3), a.y + (dy / d) * (Math.max(a.rx, a.ry) + 3), `f9_${role}`);
      await go(a.x + 1, a.y + 2.5, `f9_${role}_in`);
    } else await go(a.x + 1.5, a.y + 3, `f9_${role}`);
  }
  await wide(0);
}
