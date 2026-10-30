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
  }, seed);
  await page.waitForTimeout(1500);
  // the packs to visit: one of each kind, and one a royal touched (not the boss's ground)
  const plan = await page.evaluate(() => {
    const g = window.__dbg.game();
    const packs = new Map();
    for (const m of g.monsters) {
      if (m.dead || m.boss) continue;
      const p = packs.get(m.packId) ?? { id: m.packId, kinds: {}, n: 0, x: 0, y: 0, royal: m.royal ?? null };
      p.kinds[m.kind] = (p.kinds[m.kind] ?? 0) + 1; p.n++; p.x += m.x; p.y += m.y;
      packs.set(m.packId, p);
    }
    const all = [...packs.values()].map((p) => ({ ...p, x: p.x / p.n, y: p.y / p.n }));
    const of = (k, royal) => all.filter((p) => (p.kinds[k] ?? 0) > 0 && (royal === undefined || !!p.royal === royal)).sort((a, b) => b.n - a.n)[0] ?? null;
    const touched = all.filter((p) => p.royal && ((p.kinds.pguard ?? 0) || (p.kinds.gardener ?? 0) || (p.kinds.groom ?? 0) || (p.kinds.swan ?? 0))).sort((a, b) => b.n - a.n)[0] ?? null;
    return { swans: of('swan', false), crowd: of('gardener', false) ?? of('groom', false), guards: of('pguard', false), touched, start: { x: g.hero.x, y: g.hero.y } };
  });
  console.log('  packs', JSON.stringify({ swans: plan.swans?.n, crowd: plan.crowd?.n, guards: plan.guards?.n, touched: plan.touched ? `${plan.touched.n} ${plan.touched.royal}` : null }));
  const R = { princess: 'the Princess', prince: 'the Prince', queen: 'the Queen', king: 'the King' };
  // scenes: [from (s), title, line, pack to stand by (or null: where he is), bot on]
  const scenes = [
    [0, 'THE SWAN GARDENS', 'Floor 16. In through the garden gate, at dawn.', null, false],
    [4, 'THE SWANS', 'A flock. They charge, and their bills strike a long way.', plan.swans, true],
    [14, 'THE HUSHED GARDENERS AND GROOMS', 'Shears and forks. Their marks show where each will land.', plan.crowd, true],
    [24, 'THE PALACE GUARD', 'Partisans and swords, marching in step: the long thrust, the sweep.', plan.guards, true],
  ];
  const his = plan.touched && (plan.touched.royal === 'prince' || plan.touched.royal === 'king') ? 'his' : 'her';
  if (plan.touched) scenes.push([35, 'THE ROYAL CARDS', `Touched by ${R[plan.touched.royal]}: ${his} crest over each, and each drops ${his} card.`, plan.touched, true]);
  const seconds = Number(process.env.SECONDS || (plan.touched ? 47 : 35));
  snap.note('film', { fps: FPS, from: 0, parts: scenes.map(([t, a, b]) => [t, a, b]), size: await page.evaluate(() => [innerWidth, innerHeight]) });

  const go = (scene) => page.evaluate(([p, bot, isTouched]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor;
    if (p) {
      // (a walkable tile four to five tiles from the pack's middle, toward where the camera sees it)
      let best = null; let bd = 1e9;
      for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
        if (g.level.walk[ty * f.w + tx] !== 1) continue;
        const dd = Math.abs(Math.hypot(tx + 0.5 - p.x, ty + 0.5 - p.y) - 4.5);
        if (dd < bd) { bd = dd; best = { x: tx + 0.5, y: ty + 0.5 }; }
      }
      h.x = best.x; h.y = best.y;
      for (const m of g.monsters) {
        if (m.dead || m.packId !== p.id) continue;
        g.wakeUp(m);
        // (the touched pack: quick to fall, so their cards are seen dropped and taken)
        if (isTouched) m.life = Math.min(m.life, m.maxLife * 0.25);
      }
      // (the rest of the floor kept asleep and far: only this pack in the picture)
      for (const m of g.monsters) if (!m.dead && m.packId !== p.id && !m.boss && Math.hypot(m.x - h.x, m.y - h.y) < 12) m.dead = true;
    }
    d.bot(bot);
  }, [scene[3], scene[4], scene === scenes[4]]);

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
    if (i % 90 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; const near = g.monsters.filter((m) => !m.dead && Math.hypot(m.x - h.x, m.y - h.y) < 9); return `near ${near.map((m) => m.kind + (m.royal ? '*' : '')).join(',')} cards ${JSON.stringify(h.cards ?? {})} drops ${g.drops.filter((q) => q.kind === 'card').length}`; }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); d.high(false); });
}
