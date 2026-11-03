// FLOOR 16, THE SWAN GARDENS, filmed in play for the owner (behind HIGH_CITY, switched on here alone): a hero of level 22 on
// the floor itself, the test bot fighting for him (nothing can kill him), its packs one after another: the swans, the Hushed
// gardeners and grooms among the nettles, the palace guard, and a pack a royal has touched (its crests; its cards dropped and
// taken). A picture every thirtieth of a second of the GAME's time, as tools/scenarios/princess_film.mjs films (her fight is
// that film's, on her own ground: WHERE=floor16).
// Frames go to <out>_f0000.png ..., and <out>_film.json says what each part is (python3 tools/princess_film.py <dir> <out.mp4>).
//   node tools/playtest.mjs --file dist/floor16.html --size 1280x720 --scenario tools/scenarios/floor16_film.mjs --out shots/f16film/g
//   env: STILLS=1 (only a picture every half second), SEED=3

const FPS = 30;

export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  const seed = Number(process.env.SEED || 3);
  await page.evaluate((seed) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', seed); d.seasoned(22); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 16);
    window.__dbg.game().level.explored.fill(1);
    // (the new run's welcome line is the town's, not this floor's)
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
  }, seed);
  await page.waitForTimeout(1500);
  // the places to film at: where the floor laid a pack of each kind (its own packs then cleared away, and a small one of each
  // made there, so that each scene shows the one kind clearly; the boss left asleep on her ground)
  const plan = await page.evaluate(() => {
    const g = window.__dbg.game();
    const at = (k) => { const ms = g.monsters.filter((m) => !m.dead && !m.boss && m.kind === k); if (!ms.length) return null; const m = ms[Math.floor(ms.length / 2)]; return { x: m.x, y: m.y }; };
    const places = { swans: at('swan'), crowd: at('gardener') ?? at('groom'), guards: at('pguard'), touched: at('groom') ?? at('gardener') };
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    g.monsters = g.monsters.filter((m) => m.boss);
    return places;
  });
  console.log('  places', JSON.stringify(plan));
  // scenes: [from (s), title, line, place, what to make there: [kind, how many][], touched by, bot on]
  const scenes = [
    [0, 'THE SWAN GARDENS', 'Floor 16. In through the garden gate, at dawn.', null, [], null, false],
    [4, 'THE SWANS', 'A flock. They charge, and their bills strike a long way.', plan.swans, [['swan', 7]], null, true],
    [14, 'THE HUSHED GARDENERS AND GROOMS', 'Shears and forks. Their marks show where each will land.', plan.crowd, [['gardener', 3], ['groom', 3]], null, true],
    [24, 'THE PALACE GUARD', 'Partisans and swords, marching in step: the long thrust, the sweep.', plan.guards, [['pguard', 4]], null, true],
    [35, 'THE ROYAL CARDS', 'Touched by the Queen: her crest over each, and each drops her card.', plan.touched, [['gardener', 2], ['groom', 2]], 'queen', true],
  ];
  const seconds = Number(process.env.SECONDS || 47);
  snap.note('film', { fps: FPS, from: 0, parts: scenes.map(([t, a, b]) => [t, a, b]), size: await page.evaluate(() => [innerWidth, innerHeight]) });

  const go = (scene) => page.evaluate(([p, make, royal, bot, n]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor;
    // (what the last scene left: gone)
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    g.monsters = g.monsters.filter((m) => m.boss);
    g.projectiles.length = 0;
    if (p) {
      const walkable = (x, y) => g.level.walk[Math.floor(y) * f.w + Math.floor(x)] === 1;
      // (he stands four tiles from the place, on open ground; they are made about it, across from him)
      let best = null; let bd = 1e9;
      for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
        if (!walkable(tx + 0.5, ty + 0.5)) continue;
        const dd = Math.abs(Math.hypot(tx + 0.5 - p.x, ty + 0.5 - p.y) - 4);
        if (dd < bd) { bd = dd; best = { x: tx + 0.5, y: ty + 0.5 }; }
      }
      h.x = best.x; h.y = best.y;
      let k = 0;
      for (const [kind, count] of make) {
        for (let i = 0; i < count; i++, k++) {
          let x = p.x; let y = p.y;
          for (let tries = 0; tries < 40; tries++) {
            const a = (k * 2.4 + tries * 0.7); const r = 0.6 + 0.35 * k + tries * 0.05;
            const qx = p.x + Math.cos(a) * r; const qy = p.y + Math.sin(a) * r;
            if (walkable(qx, qy)) { x = qx; y = qy; break; }
          }
          const m = g.spawn(kind, x, y, 900 + n, 0, false, g.rng);
          m.words = []; m.carries = []; m.shield = 0;
          if (royal) { m.royal = royal; m.life = Math.round(m.maxLife * 0.3); }
          g.wakeUp(m);
        }
      }
    }
    d.bot(bot);
  }, [scene[3], scene[4], scene[5], scene[6], scenes.indexOf(scene)]);

  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  let next = 0;
  for (let i = 0; i < total; i++) {
    while (next < scenes.length && scenes[next][0] * FPS <= i) {
      await go(scenes[next]);
      next++;
    }
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 90 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; const near = g.monsters.filter((m) => !m.dead && Math.hypot(m.x - h.x, m.y - h.y) < 9); return `near ${near.map((m) => m.kind + (m.royal ? '*' : '')).join(',')} hero ${h.x.toFixed(1)},${h.y.toFixed(1)} cards ${JSON.stringify(h.cards ?? {})} drops ${g.drops.filter((q) => q.kind === 'card').length}`; }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); d.high(false); });
}
