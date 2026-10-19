// ACT 2, THE HUSH: FLOOR 13, THE MILLRACE, laid by its own map-maker and dresser (game/act2/millrace.ts; behind ACT2, off:
// switched on here by the test hook, __dbg.act2). Pictures of where he comes in (the side gate), a field and its farm bell,
// the cart bridge over the river, the mill and its wheel and race, the drying lines with him behind one (seen through), the
// Muffled Bell, and the Pulping Floor; its monsters taken away but the boss (FOES=1 keeps them).
//   node tools/build_to.mjs dist/millrace.html
//   node tools/playtest.mjs --file dist/millrace.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_millrace.mjs --out shots/millrace/m
// SEED: the run's (3). WAIT: ms to let the ground be painted at each place (2500).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED ?? 3);
  const wait = Number(process.env.WAIT ?? 2500);
  const foes = process.env.FOES === '1';
  const info = await page.evaluate(([s, keep]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', s);
    D.seasoned(20);
    D.god = true;
    D.act2(true, 13);
    const g = D.game();
    const L = g.level;
    const land = L.land;
    if (!keep) g.monsters = g.monsters.filter((m) => m.boss);
    const named = (n) => L.props.filter((p) => p.kind === 'piece' && p.name === n).map((p) => [p.x, p.y]);
    const W = L.floor.w;
    const tracks = land.tracks ?? [];
    const near = (x, y, t) => t.some((q) => Math.hypot(q[0] - x, q[1] - y) < 3);
    // (the cart bridge: the bridge over the river a track crosses)
    const cart = (land.bridges ?? []).map((b) => {
      const i = b.tiles[Math.floor(b.tiles.length / 2)];
      return [(i % W) + 0.5, Math.floor(i / W) + 0.5];
    }).find(([x, y]) => tracks.some((t) => near(x, y, t))) ?? null;
    const field = land.areas.filter((a) => a.role === 'path')[2]?.blob ?? null;
    return {
      kind: land.kind,
      size: [L.floor.w, L.floor.h],
      start: L.floor.start,
      boss: L.floor.boss,
      bossKind: g.boss?.kind ?? null,
      field: field ? [field.x, field.y] : null,
      cart,
      race: land.race,
      lines: named('drying lines'),
      muffled: land.bells?.muffled ?? null,
      bells: land.bells?.bells ?? [],
      hush: land.bells?.hush ?? null,
      packs: L.floor.packs.length,
      props: L.props.length,
      hazards: (L.floor.hazards ?? []).length,
    };
  }, [seed, foes]);
  log('floor', JSON.stringify({ kind: info.kind, size: info.size, boss: info.bossKind, packs: info.packs, props: info.props, hazards: info.hazards, bells: info.bells.length, hush: info.hush }));
  if (info.kind !== 'millrace') log('!! not the Millrace');
  if (!info.cart) log('!! no cart bridge found');
  if (!info.lines.length) log('!! no drying lines');
  const go = async (x, y, name) => {
    await page.evaluate(([a, b]) => {
      const g = window.__dbg.game();
      g.hero.x = a;
      g.hero.y = b;
    }, [x, y]);
    await page.waitForTimeout(wait);
    await snap(name);
  };
  await page.waitForTimeout(wait);
  await snap('a_start');
  if (info.field) await go(info.field[0], info.field[1], 'b_field');
  if (info.bells.length) await go(info.bells[0].x + 1.5, info.bells[0].y + 1.5, 'c_farm_bell');
  if (info.cart) await go(info.cart[0] + 2.5, info.cart[1] + 2.5, 'd_bridge');
  if (info.race) {
    // (the mill: the race's column past the wheel, the mill two tiles short of it)
    const cx = Math.floor(info.race[1][0]);
    const wy = (info.race[1][1] + info.race[2][1]) / 2;
    await go(cx - 1.5, wy + 3.5, 'e_mill');
    await go(cx + 1.5, wy + 2.5, 'f_wheel');
  }
  if (info.muffled) await go(info.muffled.x + 1.5, info.muffled.y + 1.5, 'g_muffled');
  if (info.lines.length) {
    const [x, y] = info.lines[0];
    await go(x + 0.2, y + 2.2, 'h_lines');
    // (behind them: up the screen of them, where their picture stands over him)
    await go(x - 0.4, y - 0.9, 'i_lines_behind');
  }
  await go(info.boss.x, info.boss.y + 3, 'j_pulping_floor');
}
