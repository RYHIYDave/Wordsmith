// THE FIRST FIVE FLOORS' NEW LOOKS in the game (each switch on in the page built for it): a floor (FLOOR=3, 4 or 5) entered as the game
// lays it, the hero set in a few of its places in turn (its first room; a cell block or the like, the biggest room on the way; a
// corridor; before his hall's gate; in his hall by him, asleep; his gate falling behind the hero as the fight begins), the game stepped
// a moment at each, pictured.
//   node tools/playtest.mjs --file dist/looks.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/floor_looks.mjs --out shots/look3
export default async function (page, snap) {
  const FLOOR = Number(process.env.FLOOR || 3);
  const SEED = Number(process.env.SEED || 4242);
  const idle = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
  await page.evaluate(([SEED]) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', SEED); d.seasoned(4); d.autoLevel = false; d.autoWords = false; d.god = true; }, [SEED]);
  await page.waitForTimeout(600);
  await page.evaluate(([FLOOR]) => {
    const D = window.__dbg;
    let g = D.game();
    g.depth = FLOOR; g.cleared = FLOOR - 1; g.enterDungeon();
    g = D.game();
    g.level.explored.fill(1);
    g.waveT = 1e9; D.bot(false);
    g.talentsLeft = () => 0;
    // (nobody but him: the places seen bare, as the art shows them)
    const boss = g.boss;
    for (const q of g.monsters) if (q !== boss) q.dead = true;
    g.monsters = boss ? [boss] : [];
    window.__step = g.update.bind(g); g.update = () => undefined;
  }, [FLOOR]);
  /** Set the hero at (x, y) facing (fx, fy), step the game `secs`, the cards off the screen; then picture. */
  const at = async (name, where, secs = 0.6) => {
    const ok = await page.evaluate(([where, secs, idle]) => {
      const g = window.__dbg.game();
      const f = g.level.floor;
      const rooms = f.rooms;
      let p = null;
      if (where === 'start') { const r = rooms.find((q) => q.path === 0) ?? rooms[0]; p = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
      else if (where === 'block') {
        const r = rooms.filter((q) => q.kind !== 'boss' && q.path > 0).sort((a, b) => (b.block ? 1000 : 0) + b.w * b.h - ((a.block ? 1000 : 0) + a.w * a.h))[0];
        if (r) p = { x: r.x + r.w / 2, y: r.y + r.h / 2 + 1 };
      } else if (where === 'block2') {
        const r = rooms.filter((q) => q.kind !== 'boss' && q.path > 0).sort((a, b) => b.w * b.h - a.w * a.h)[1];
        if (r) p = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
      } else if (where === 'hall') { p = { x: f.boss.x + 2.2, y: f.boss.y + 2.6 }; }
      else if (where === 'hallFar') { const r = rooms.find((q) => q.kind === 'boss'); if (r) p = { x: r.x + r.w - 2, y: r.y + r.h - 2 }; }
      else if (where === 'channel') {
        const c = (g.level.channels ?? [])[0];
        if (c) p = c.alongX ? { x: c.bridge + 0.5, y: c.row + 3.4 } : { x: c.row + 3.4, y: c.bridge + 0.5 };
      } else if (where === 'door') {
        const e = g.level.ways?.exit;
        if (e) p = e.alongX ? { x: e.a + 1.6, y: e.line + 3.2 } : { x: e.line + 3.2, y: e.a + 1.6 };
      }
      if (!p) return false;
      // (on open floor near there)
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
  await at('start', 'start');
  await at('block', 'block');
  await at('block2', 'block2');
  await at('channel', 'channel');
  await at('hall', 'hall');
  await at('hall_far', 'hallFar');
  // (THE FIGHT BEGINS: his gate falls behind the hero; then the moment it lands)
  const fell = await page.evaluate(() => {
    const g = window.__dbg.game();
    if (g.bossReady) g.bossReady();
    const d = g.level.doors.find((q) => q.spot && q.spot.kind === 'bossgate');
    return d ? `gate ${d.fell !== undefined}` : 'no gate';
  });
  console.log(`fight: ${fell}`);
  for (const [n, secs] of [['gate_held', 0.2], ['gate_slam', 0.22], ['gate_after', 0.4]]) {
    await page.evaluate(([secs, idle]) => {
      const g = window.__dbg.game();
      for (let k = 0; k < Math.round(secs * 30); k++) { g.hero.invuln = 1; g.hero.life = g.hero.d.maxLife; window.__step(1 / 30, idle); }
      for (let i = g.events.length - 1; i >= 0; i--) if (g.events[i].t === 'floorName' || g.events[i].t === 'bossIntro') g.events.splice(i, 1);
    }, [secs, idle]);
    await page.waitForTimeout(40);
    await snap(n);
  }
  // (THE WAY ON: where it is a door out the back of his hall, PRISON_EXIT: shut by the hero; he falls; it unbars, swings open; open; the hero walks in)
  const door = await page.evaluate(() => !!window.__dbg.game().level.ways?.exit);
  if (door) {
    // (its film painted by the painter's worker, as the floor is played: waited for here, up to two minutes)
    for (let k = 0; k < 300; k++) {
      const ok = await page.evaluate(() => { const g = window.__dbg.game(); const e = g.level.ways.exit; return !!window.__dbg.painter.filmOf(`exit:${e.alongX ? 'x' : 'y'}`); });
      if (ok) { console.log(`door's film made (${k} s)`); break; }
      if (k % 30 === 0) console.log('painter', await page.evaluate(() => { const p = window.__dbg.painter; return JSON.stringify({ state: p.state, stats: p.stats, lanes: p.lanes.map((l) => (l ? `${l.n}:${l.ready}:${l.open}` : '-')) }).slice(0, 300); }));
      await page.waitForTimeout(1000);
    }
    await at('door_shut', 'door', 0.3);
    await page.evaluate(() => { const g = window.__dbg.game(); if (g.boss) g.kill(g.boss); });
    let done = 0;
    for (const [n, f] of [['door_f20', 20], ['door_f46', 46], ['door_f53', 53], ['door_f70', 70], ['door_open', 100]]) {
      await page.evaluate(([k, idle]) => {
        const g = window.__dbg.game();
        const x = g.hero.x, y = g.hero.y;
        for (let i = 0; i < k; i++) { g.hero.invuln = 1; g.hero.life = g.hero.d.maxLife; window.__step(1 / 30, idle); g.hero.x = x; g.hero.y = y; }
        for (let i = g.events.length - 1; i >= 0; i--) if (g.events[i].t === 'floorName' || g.events[i].t === 'bossIntro') g.events.splice(i, 1);
      }, [f - done, idle]);
      done = f;
      await page.waitForTimeout(60);
      await snap(n);
    }
    // (the hero at its sill, then on its doorway: on to floor 4)
    await page.evaluate(([idle]) => {
      const g = window.__dbg.game();
      const e = g.level.ways.exit;
      g.hero.x = e.alongX ? e.a + 1 : e.line + 1.35;
      g.hero.y = e.alongX ? e.line + 1.35 : e.a + 1;
      g.hero.fx = e.alongX ? 0 : -1; g.hero.fy = e.alongX ? -1 : 0;
      for (let i = 0; i < 3; i++) window.__step(1 / 30, idle);
    }, [idle]);
    await page.waitForTimeout(60);
    await snap('door_sill');
    const went = await page.evaluate(([idle]) => {
      const g = window.__dbg.game();
      const e = g.level.ways.exit;
      const d0 = g.depth;
      g.hero.x = e.alongX ? e.a + 1 : e.line + 0.5;
      g.hero.y = e.alongX ? e.line + 0.5 : e.a + 1;
      for (let i = 0; i < 90 && g.depth === d0; i++) window.__step(1 / 30, idle);
      return `state ${e.state}, depth ${d0} -> ${g.depth}`;
    }, [idle]);
    console.log(`door: ${went}`);
  }
}
