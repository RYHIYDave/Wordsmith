// FLOOR 2 AS THE PRISON'S GROUNDS AT NIGHT in the game (GROUNDS on in the page built for it: __GROUNDS_TRY__): floor 2 entered as the
// game lays it, the hero set in a few of its places in turn (where he comes in, at the stair down from floor 1; just out of the
// gaoler's door; a courtyard's middle; before a gatehouse; before the chapel; at the way down to his yard; inside a courtyard's near
// wall), the game stepped a moment at each, pictured.
//   node tools/playtest.mjs --file dist/grounds.html --size 844x390 --dpr 2 --scenario tools/scenarios/grounds_look.mjs --out shots/grounds
export default async function (page, snap) {
  const SEED = Number(process.env.SEED || 4242);
  const idle = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
  await page.evaluate(([SEED]) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', SEED); d.seasoned(4); d.autoLevel = false; d.autoWords = false; d.god = true; }, [SEED]);
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const D = window.__dbg;
    let g = D.game();
    g.depth = 2; g.cleared = 1; g.enterDungeon();
    g = D.game();
    g.level.explored.fill(1);
    g.waveT = 1e9; D.bot(false);
    g.talentsLeft = () => 0;
    const boss = g.boss;
    for (const q of g.monsters) if (q !== boss) q.dead = true;
    g.monsters = boss ? [boss] : [];
    window.__step = g.update.bind(g); g.update = () => undefined;
    const P = g.level.grounds;
    return P ? { courts: P.courts.length, gates: P.gates.length, chapel: !!P.chapel, wayIn: !!P.wayIn } : null;
  });
  console.log('grounds', JSON.stringify(info));
  if (!info) return;
  const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const at = async (name, where, secs = 0.6) => {
    if (ONLY && !ONLY.includes(name)) return;
    const ok = await page.evaluate(([where, secs, idle]) => {
      const g = window.__dbg.game();
      const f = g.level.floor;
      const P = g.level.grounds;
      let p = null;
      const gate = (kind) => P.gates.find((q) => q.kind === kind);
      if (where === 'arrive') p = { x: f.start.x, y: f.start.y + 0.6 };
      else if (where === 'gaoldoor') { const q = gate('gaol'); if (q) p = { x: q.line + 2.6, y: q.a + 2.4 }; }
      else if (where === 'court') { const r = P.courts[0]; p = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
      else if (where === 'court2') { const r = [...P.courts].sort((a, b) => b.w * b.h - a.w * a.h)[0]; p = { x: r.x + r.w / 2 + 1, y: r.y + r.h / 2 + 1 }; }
      else if (where === 'gate' || where === 'barred') {
        const q = gate(where === 'gate' ? 'open' : 'barred');
        if (q) p = q.alongX ? { x: q.a + 1.5, y: q.line + 3.2 } : { x: q.line + 3.2, y: q.a + 1.5 };
      } else if (where === 'through') {
        const q = gate('open');
        if (q) p = q.alongX ? { x: q.a + 1.5, y: q.line - 3 } : { x: q.line - 3, y: q.a + 1.5 };
      } else if (where === 'chapel') {
        const c = P.chapel;
        if (c) p = c.alongX ? { x: c.a + 1.5, y: c.plane + 3.4 } : { x: c.plane + 3.4, y: c.a + 1.5 };
      } else if (where === 'down') {
        const Y = f.yard;
        if (Y) p = { x: Y.x + Y.door + 1.5, y: Y.y - 4 };
      } else if (where === 'nearwall') {
        const r = P.courts[1] ?? P.courts[0];
        p = { x: r.x + r.w / 2, y: r.y + r.h - 0.8 };
      }
      if (!p) return false;
      let best = null;
      for (let d = 0; d < 4 && !best; d += 0.5) for (let a = 0; a < 16 && !best; a++) {
        const x = p.x + Math.cos(a / 16 * Math.PI * 2) * d, y = p.y + Math.sin(a / 16 * Math.PI * 2) * d;
        if (g.free(g.level.walk, x, y, 0.4)) best = { x, y };
      }
      if (!best) return false;
      g.hero.x = best.x; g.hero.y = best.y;
      for (let k = 0; k < Math.round(secs * 30); k++) { g.hero.invuln = 1; g.hero.life = g.hero.d.maxLife; window.__step(1 / 30, idle); g.hero.x = best.x; g.hero.y = best.y; }
      for (let i = g.events.length - 1; i >= 0; i--) if (g.events[i].t === 'floorName' || g.events[i].t === 'bossIntro') g.events.splice(i, 1);
      return true;
    }, [where, secs, idle]);
    if (!ok) { console.log(`${name}: no place`); return; }
    await page.waitForTimeout(Number(process.env.SETTLE || 2500));
    await snap(name);
  };
  await page.waitForTimeout(Number(process.env.SETTLE || 4000));
  for (const n of ['arrive', 'gaoldoor', 'court', 'court2', 'gate', 'barred', 'through', 'chapel', 'down', 'nearwall']) await at(n, n);
}
