// ACT 2, THE HUSH: FLOOR 13'S KINDS IN THE GAME (game/act1_rules/fieldhand.ts, carter.ts, palimpsest.ts), behind ACT2 (off;
// switched on here by the test hook, __dbg.act2), on the stand-in floor 13 until its own map-maker is in. For looking at.
//   node tools/build_to.mjs dist/k13.html
//   SCENE=mobs node tools/playtest.mjs --file dist/k13.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_k13.mjs --out shots/k13/mobs
// SCENE:
//   mobs   a reaper, a gleaner and a carter coming at the hero (god): the sickle slash, the whip's crack, the drag
//   boss   the Palimpsest before the hero, each of its four moves at its moments, whole, half worn and worn (HURT: its
//          life's share for all of them, else one move at each of 1, 0.5, 0.2)
//   pages  its pages torn off by blows, lying, burning under a fire word's blow, crawling home in its Rewrite
//   intro  the hero coming into its ground: its line, the rustle of its pages, and its name
//   room   its frames as the painter paints them through its three looks, and what they hold (with --init tools/canvas_room.js)
// The game is slowed (SLOW, 0.25) while a moment is waited for, so that the picture is of that moment.
import { log } from './lib.mjs';

const SLOW = Number(process.env.SLOW || 0.25);

export default async function (page, snap) {
  const scene = process.env.SCENE || 'mobs';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 13); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.act2(true, 13);
    const g = d.game();
    g.level.explored.fill(1);
  });
  await page.waitForTimeout(1500);
  /** Wait (the game slowed) until `test` says so in the page, at most `ms` of the wall clock. */
  const until = async (fn, arg, ms = 20000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await page.evaluate(fn, arg)) return true;
      await page.waitForTimeout(15);
    }
    return false;
  };
  const slow = (v) => page.evaluate((s) => { window.__dbg.slowmo = s; }, v);
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game();
    return g.monsters.filter((m) => !m.dead).map((m) => ({ k: m.kind, n: m.name, f: m.form ?? 0, st: m.state, act: m.act ? `${m.act.id}@${m.act.t.toFixed(2)}` : null, d: +Math.hypot(m.x - g.hero.x, m.y - g.hero.y).toFixed(2), life: Math.round(m.life) }));
  });

  if (scene === 'mobs') {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const boss = g.monsters.find((m) => m.boss);
      g.monsters = [];
      g.boss = boss ?? null;
      const L = g.level;
      const a = L.land.areas.find((q) => q.role === 'path') || L.land.areas[0];
      const h = g.hero;
      h.x = a.blob.x; h.y = a.blob.y;
      const put = (k, dx, dy, form) => {
        const m = g.spawn(k, h.x + dx, h.y + dy, 71, 0, false, g.rng);
        if (form !== undefined && m.kind === 'fieldhand') {
          m.form = form;
          m.name = form ? m.name.replace('Reaper', 'Gleaner') : m.name.replace('Gleaner', 'Reaper');
        }
        m.words = []; m.state = 'chase'; m.cd = 0.4;
        m.life = m.maxLife = 1e6;
        return m;
      };
      put('fieldhand', 2.2, -0.6, 0);
      put('fieldhand', -0.4, 2.4, 1);
      put('carter', 3.6, 2.6);
      h.fx = 0.7; h.fy = 0.7;
    });
    log('mobs', JSON.stringify(await state()));
    await snap('a_come');
    await slow(SLOW);
    // (the sickle crossing before one of them, the lash cracking, and a hero caught being dragged)
    const moment = async (kind, id, t, name) => {
      const ok = await until(([k, a, tt]) => { const g = window.__dbg.game(); return g.monsters.some((m) => m.kind === k && m.act && m.act.id === a && m.act.t >= tt); }, [kind, id, t]);
      log(name, ok ? 'caught' : 'not seen', JSON.stringify(await state()));
      if (ok) await snap(name);
    };
    await moment('fieldhand', 'fieldhand:slash', 0.3, 'b_slash_warn');
    await moment('fieldhand', 'fieldhand:slash', 17 / 30, 'c_slash');
    // (the hero steps off, so the carter's lash is cast at him from its length)
    await page.evaluate(() => { const g = window.__dbg.game(); const c = g.monsters.find((m) => m.kind === 'carter'); const h = g.hero; if (c) { const d = Math.hypot(h.x - c.x, h.y - c.y) || 1; c.x = h.x + ((c.x - h.x) / d) * 2.3; c.y = h.y + ((c.y - h.y) / d) * 2.3; } for (const m of g.monsters) if (m.kind === 'fieldhand') { m.x += 4; m.y -= 3; } });
    await moment('carter', 'carter:lash', 0.45, 'd_lash_warn');
    await moment('carter', 'carter:lash', 25 / 30, 'e_crack');
    await moment('carter', 'carter:lash', 1.4, 'f_drag');
    await slow(1);
    await page.waitForTimeout(2500);
    await snap('g_after');
    return;
  }

  if (scene === 'intro') {
    // (the hero comes into its ground: it says its line, the rustle of its pages, and its name comes up)
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const b = g.monsters.find((m) => m.boss);
      g.monsters = b ? [b] : [];
      const h = g.hero;
      const st = g.level.floor.start;
      const sx = st.x - b.x, sy = st.y - b.y;
      const k = Math.hypot(sx, sy) || 1;
      h.x = b.x + (sx / k) * 5.5; h.y = b.y + (sy / k) * 5.5;
    });
    await page.waitForTimeout(900);
    await snap('i_line');
    await page.waitForTimeout(900);
    await snap('i_name');
    return;
  }

  // THE PALIMPSEST before the hero
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss);
    g.monsters = b ? [b] : [];
    const h = g.hero;
    const L = g.level;
    const st = L.floor.start;
    const sx = st.x - b.x, sy = st.y - b.y;
    const k = Math.hypot(sx, sy) || 1;
    h.x = b.x + (sx / k) * 3.2; h.y = b.y + (sy / k) * 3.2;
    g.bossReady();
    if (b.state === 'sleep') b.state = 'chase';
    b.words = [];
  });
  log('boss', JSON.stringify(await state()));

  if (scene === 'room') {
    // its frames as the painter paints them: whole, then (as it is hurt) half worn and worn, each the next ahead
    const measure = async (label) => {
      const r = await page.evaluate(() => {
        const d = window.__dbg; const b = d.renderer.art.bestiary;
        const out = {};
        for (const f of ['palimpsest', 'palimpsest:1', 'palimpsest:2', 'fieldhand', 'fieldhand:1', 'carter']) {
          let art; try { art = b.of(f); } catch { continue; }
          let n = 0; let lazy = 0; let mb = 0; const seen = new Set();
          for (const set of [art.front, art.back]) {
            const c = set.clips || {};
            const lists = [set.idle, set.walk, ...['attack', 'heavy', 'die', 'reel'].map((k) => c[k] && c[k].frames), ...Object.values(c.moves || {}).map((m) => m.frames)];
            for (const list of lists) {
              if (!list) continue;
              for (let i = 0; i < list.length; i++) {
                const dd = Object.getOwnPropertyDescriptor(list, i);
                if (!dd || !('value' in dd) || !dd.value) { lazy++; continue; }
                if (seen.has(dd.value)) continue;
                seen.add(dd.value); n++;
                mb += dd.value.img.width * dd.value.img.height * 4 / 1048576;
              }
            }
          }
          out[f] = { painted: n, waiting: lazy, MB: +mb.toFixed(1) };
        }
        return { figures: out, canvas: window.__canvasRoom ? window.__canvasRoom() : null, painter: { state: d.painter.state, ...d.painter.stats } };
      });
      log('room ' + label, JSON.stringify(r));
    };
    const settle = async (secs) => {
      const t0 = Date.now(); let last = -1; let quiet = 0;
      while (Date.now() - t0 < secs * 1000) {
        await page.waitForTimeout(5000);
        const now = await page.evaluate(() => { const d = window.__dbg; return d.painter.stats.frames + d.painting.frames; });
        quiet = now === last ? quiet + 1 : 0; last = now;
        if (quiet >= 2) break;
      }
      return Math.round((Date.now() - t0) / 1000);
    };
    // (the boss kept from fighting: it is the frames that are measured)
    await page.evaluate(() => { window.__hold = setInterval(() => { const g = window.__dbg.game(); for (const m of g.monsters) { m.cd = 9; if (m.moveCd) m.moveCd.fill(99); } }, 100); });
    for (const lf of [1, 0.5, 0.2]) {
      await page.evaluate((f) => { const b = window.__dbg.game().monsters.find((m) => m.boss); if (b) b.life = Math.round(b.maxLife * f); }, lf);
      const secs = await settle(Number(process.env.SECS || 400));
      log('painted', JSON.stringify({ life: lf, secs }));
      await measure(`life ${lf}`);
      await snap(`room_${lf}`);
    }
    return;
  }

  // (only `id` of its acts ready, again and again)
  const only = (id) => page.evaluate((a) => {
    clearInterval(window.__only);
    window.__only = setInterval(() => {
      const g = window.__dbg.game();
      for (const m of g.monsters) {
        if (m.dead || !m.moveCd) continue;
        const list = window.__dbg.actsOf(m);
        list.forEach((d, i) => { m.moveCd[i] = d.id === a ? Math.min(m.moveCd[i], 0) : 99; });
      }
    }, 40);
  }, id);
  const life = (f) => page.evaluate((x) => { const b = window.__dbg.game().monsters.find((m) => m.boss); if (b) { b.life = Math.round(b.maxLife * x); } }, f);
  const moment = async (id, t, name, ms = 25000) => {
    const ok = await until(([a, tt]) => { const b = window.__dbg.game().monsters.find((m) => m.boss); return !!b && !!b.act && b.act.id === a && b.act.t >= tt; }, [id, t], ms);
    log(name, ok ? 'caught' : 'not seen', JSON.stringify(await state()));
    if (ok) await snap(name);
    return ok;
  };
  /** Its pages torn off by `n` blows, a while apart (the game's own: as the hero's blows land). */
  const blows = async (n) => {
    for (let i = 0; i < n; i++) {
      await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); if (b) g.damageMonster(b, 1, 'phys', false, -1); });
      await page.waitForTimeout(400 / SLOW);
    }
  };

  if (scene === 'pages') {
    await slow(SLOW);
    await only('none');
    await life(0.5);
    await blows(9);
    await snap('p_a_lying');
    // (a fire word's blow on the floor among them: they burn, and set their neighbours alight)
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const p = g.perils.find((q) => q.a1 === 'palimpsest:page' && q.done === 0 && q.t >= 0);
      if (p) g.bosses.floorBlow(p.x, p.y, 0.5, 'fire');
    });
    await page.waitForTimeout(300 / SLOW);
    await snap('p_b_burning');
    await page.waitForTimeout(1500 / SLOW);
    await blows(8);
    await only('palimpsest:rewrite');
    await moment('palimpsest:rewrite', 0.9, 'p_c_rewrite');
    await moment('palimpsest:rewrite', 1.5, 'p_d_rewrite');
    await slow(1);
    return;
  }

  // SCENE boss: each of its moves, at the moments its pictures make them, as worn as the life says
  const hurt = process.env.HURT ? [Number(process.env.HURT)] : null;
  const plan = [
    ['palimpsest:slam', [0.6, 29 / 30, 1.2], 1],
    ['palimpsest:cuts', [0.5, 1.4], 0.5],
    ['palimpsest:leaves', [0.6, 1.25, 1.7], 0.5],
    ['palimpsest:rewrite', [1.0, 1.8], 0.2],
  ];
  await slow(SLOW);
  for (const [id, times, lf] of plan) {
    await life(hurt ? hurt[0] : lf);
    if (id === 'palimpsest:rewrite') {
      await only('none');
      await blows(7);
    }
    if (id === 'palimpsest:leaves') {
      // (the hero stands off: the birds come to him)
      await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss); const h = g.hero; const d = Math.hypot(h.x - b.x, h.y - b.y) || 1; const want = 4.5; const nx = b.x + ((h.x - b.x) / d) * want; const ny = b.y + ((h.y - b.y) / d) * want; if (g.isOpen(nx, ny)) { h.x = nx; h.y = ny; } });
    }
    await only(id);
    for (const t of times) await moment(id, t, `${id.split(':')[1]}_${t.toFixed(2)}_w${(hurt ? hurt[0] : lf)}`);
    await until(() => { const b = window.__dbg.game().monsters.find((m) => m.boss); return !!b && b.state !== 'act'; }, null, 10000);
  }
  await slow(1);
  await page.waitForTimeout(1500);
  log('end', JSON.stringify(await state()));
}
