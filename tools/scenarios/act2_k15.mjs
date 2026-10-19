// ACT 2, THE HUSH (behind ACT2, off; switched on here by the test hook, __dbg.act2): FLOOR 15'S KINDS IN THE GAME, on the
// stand-in floor 15 (its map-maker is another's): the Censor's every move, his blacking out of the floor at half his life
// and his death with the book of stolen words bursting; the inklings' melt, pool and rise and their lash; the Bookwardens'
// tome slam and its mark. For looking at (game/act1_rules/inkling.ts, bookwarden.ts, censor.ts).
//   node tools/build_to.mjs dist/k15.html
//   WHO=censor node tools/playtest.mjs --file dist/k15.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_k15.mjs --out shots/k15/c
// WHO: censor (default), inkling or bookwarden. SEED: the floor's (2). PAINT: seconds at most for the painter (150).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const who = process.env.WHO || 'censor';
  const seed = Number(process.env.SEED || 2);
  await page.evaluate(([s]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', s);
    D.seasoned(20);
    D.god = true;
    D.autoLevel = false;
    D.autoWords = false;
    D.act2(true, 15);
  }, [seed]);
  await page.waitForTimeout(1500);
  const info = await page.evaluate((w) => {
    const g = window.__dbg.game();
    const L = g.level;
    L.explored.fill(1);
    const boss = g.boss;
    g.bossReady();
    const h = g.hero;
    if (w === 'censor') {
      g.monsters = g.monsters.filter((m) => m.boss);
      const st = L.floor.start;
      const k = Math.hypot(st.x - boss.x, st.y - boss.y) || 1;
      h.x = boss.x + ((st.x - boss.x) / k) * 3.2;
      h.y = boss.y + ((st.y - boss.y) / k) * 3.2;
      boss.state = 'chase';
      // (the book of stolen words on its lectern, two tiles beside him: the stand-in floor has none)
      const W = L.floor.w;
      for (const [dx, dy] of [[2, -2], [-2, 2], [2, 2], [-2, -2]]) {
        const tx = Math.floor(boss.x) + dx;
        const ty = Math.floor(boss.y) + dy;
        if (L.walk[ty * W + tx] !== 1) continue;
        L.props.push({ kind: 'piece', name: 'the book of stolen words', tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: 0 });
        L.walk[ty * W + tx] = 0;
        break;
      }
      return { kind: boss.kind, name: boss.name, life: boss.maxLife, at: [boss.x, boss.y] };
    }
    // (a pack of the kind before the hero, in the floor's first open area past the start; the boss far off)
    g.monsters = g.monsters.filter((m) => m.boss);
    const a = L.land.areas.find((q) => q.role === 'path') || L.land.areas[0];
    h.x = a.blob.x - 3;
    h.y = a.blob.y - 3;
    const them = [];
    for (let i = 0; i < 3; i++) {
      const m = g.spawn(w, a.blob.x + (i - 1) * 1.2, a.blob.y + 1.5, 71, 0, false, g.rng);
      m.state = 'chase';
      m.words = [];
      them.push(m.kind);
    }
    return { kinds: them, boss: boss.kind };
  }, who);
  log('it', JSON.stringify(info));
  // (the painter paints them: the Censor is heavy)
  const secs = Number(process.env.PAINT || 150);
  const t0 = Date.now();
  let quiet = 0;
  let last = -1;
  while (Date.now() - t0 < secs * 1000) {
    await page.waitForTimeout(3000);
    const st = await page.evaluate(() => {
      const d = window.__dbg;
      const p = d.painter;
      return { given: p.stats.frames, busy: p.busy(), main: d.painting.frames };
    });
    const now = st.given + st.main;
    quiet = now === last && !st.busy ? quiet + 1 : 0;
    last = now;
    if (quiet >= 2) break;
  }
  log('painted', JSON.stringify({ secs: Math.round((Date.now() - t0) / 1000) }));
  await page.evaluate(() => {
    window.__dbg.slowmo = 0.3;
  });
  // (only act `id` of theirs ready: every other kept cooling)
  const only = (id) =>
    page.evaluate((a) => {
      clearInterval(window.__only);
      window.__only = setInterval(() => {
        const g = window.__dbg.game();
        if (!g) return;
        for (const m of g.monsters) {
          if (m.dead || !m.moveCd) continue;
          const list = window.__dbg.actsOf(m);
          if (list) list.forEach((d, i) => (m.moveCd[i] = d.id === a ? Math.min(m.moveCd[i], 0) : 99));
        }
      }, 40);
    }, id);
  /** Wait until one of them is `t` seconds into act `id` (game seconds), then a picture. */
  const at = async (id, t, name) => {
    try {
      await page.waitForFunction(([a, tt]) => window.__dbg.game().monsters.some((m) => !m.dead && m.act && m.act.id === a && m.act.t >= tt), [id, t], { timeout: 40000, polling: 10 });
    } catch {
      log('!!', `${id} never came to ${t}`);
      return;
    }
    await snap(name);
  };
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game();
    const m = g.monsters.find((q) => !q.dead);
    return m ? { act: m.act ? `${m.act.id}@${m.act.t.toFixed(2)}` : null, d: +Math.hypot(m.x - g.hero.x, m.y - g.hero.y).toFixed(2), hushT: +g.hushT.toFixed(2), perils: g.perils.map((p) => p.a1).filter(Boolean) } : null;
  });
  if (who === 'censor') {
    await snap('stand');
    for (const [id, ts] of [['censor:slash', [0.5, 0.82, 1.0]], ['censor:redact', [0.6, 1.04, 1.6]], ['censor:strike', [0.6, 1.0, 1.25]], ['censor:hush', [0.8, 1.4, 2.0]]]) {
      await only(id);
      for (const t of ts) await at(id, t, `${id.split(':')[1]}_${String(t).replace('.', '')}`);
      log(id, JSON.stringify(await state()));
      await page.waitForTimeout(3000);
    }
    // AT HALF HIS LIFE: the floor blacked out
    await only('none');
    await page.evaluate(() => {
      const b = window.__dbg.game().boss;
      b.life = Math.floor(b.maxLife * 0.49);
    });
    for (const t of [0.7, 1.06, 1.6]) await at('censor:blackout', t, `blackout_${String(t).replace('.', '')}`);
    await page.waitForTimeout(6000);
    await snap('blackout_after');
    log('blackout', JSON.stringify(await page.evaluate(() => {
      const g = window.__dbg.game();
      return { tiles: g.level.act1.tiles.filter((t) => t.name === 'the floor blacked out').length };
    })));
    // HIS DEATH, and the book bursting
    await page.evaluate(() => {
      const g = window.__dbg.game();
      g.kill(g.boss);
    });
    // (game seconds into his death, the game slowed to 0.3)
    let was = 0;
    for (const gt of [0.3, 1.0, 1.8, 2.8]) {
      await page.waitForTimeout(((gt - was) / 0.3) * 1000);
      was = gt;
      await snap(`death_${String(gt).replace('.', '')}`);
    }
    return;
  }
  if (who === 'inkling') {
    await only('inkling:lash');
    await page.evaluate(() => {
      for (const m of window.__dbg.game().monsters) if (m.kind === 'inkling' && m.a1) m.a1.mcd = 0;
    });
    await at('inkling:melt', 0.5, 'melt_05');
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(700);
      await snap(`pool_${i}`);
    }
    await at('inkling:rise', 0.5, 'rise_05');
    await at('inkling:lash', 0.35, 'lash_035');
    await at('inkling:lash', 0.62, 'lash_062');
    log('inkling', JSON.stringify(await state()));
    return;
  }
  await only('bookwarden:slam');
  for (const t of [0.6, 0.97, 1.3]) await at('bookwarden:slam', t, `slam_${String(t).replace('.', '')}`);
  log('bookwarden', JSON.stringify(await state()));
}
