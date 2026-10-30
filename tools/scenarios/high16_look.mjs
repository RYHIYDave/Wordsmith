// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS, laid by its own map-maker and dresser (game/act2/swangardens.ts;
// behind HIGH_CITY, off: switched on here by the test hook, __dbg.high). Pictures of where he comes in (the gate shut behind
// him), the forecourt, a terrace wall and its stair, the parterre, the gardeners' corner with her vines, the hedge maze, the
// rose terrace and its garden party, a bed of nettles with him in it, the lake and the Swan Pavilion, the boss's ground, and
// the gate on up the hill; its monsters taken away but the boss (FOES=1 keeps them).
//   node tools/build_to.mjs dist/high16.html
//   node tools/playtest.mjs --file dist/high16.html --size 1280x720 --scenario tools/scenarios/high16_look.mjs --out shots/high16/g
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
    D.high(true, 16);
    const g = D.game();
    const L = g.level;
    const land = L.land;
    if (!keep) g.monsters = g.monsters.filter((m) => m.boss);
    const G = land.garden;
    const named = (n) => L.props.filter((p) => p.kind === 'piece' && p.name === n).map((p) => [p.x, p.y]);
    return {
      kind: land.kind,
      size: [L.floor.w, L.floor.h],
      start: L.floor.start,
      boss: L.floor.boss,
      bossKind: g.boss?.kind ?? null,
      exit: land.exit,
      a1: L.ways?.a1 ? { dir: L.ways.a1.dir, start: L.ways.a1.startDir } : null,
      keys: D.wayKeys(),
      walls: G.walls,
      fountains: G.fountains,
      royals: G.royals,
      nettles: G.nettles,
      sides: G.sides,
      maze: G.maze,
      lake: G.lake,
      pavilion: G.pavilion,
      party: G.party,
      vines: named('a yew cone, her vine reaching out of it'),
      packs: L.floor.packs.length,
      props: L.props.length,
    };
  }, [seed, foes]);
  log('floor', JSON.stringify({ kind: info.kind, size: info.size, boss: info.bossKind, packs: info.packs, props: info.props, a1: info.a1, keys: info.keys }));
  if (info.kind !== 'swangardens') log('!! not the Swan Gardens');
  const go = async (x, y, name, extra = 0) => {
    await page.evaluate(([a, b]) => {
      const g = window.__dbg.game();
      g.hero.x = a;
      g.hero.y = b;
    }, [x, y]);
    await page.waitForTimeout(wait + extra);
    await snap(name);
  };
  await page.waitForTimeout(wait);
  await snap('a_start');
  // the forecourt: the fountain of the four royals, the drive
  if (info.royals) await go(info.royals.x + 1, info.royals.y - 3, 'b_forecourt');
  // a terrace wall and its stair: at the forecourt's stair's foot, looking up it
  const w0 = info.walls[0];
  await go(w0.tx + 1, w0.y + 3.5, 'c_stair');
  // the parterre, its still fountain and its beds
  const f1 = info.fountains[0];
  await go(f1.x + 1, f1.y + 4, 'd_parterre');
  // the gardeners' corner, her vines (in by its gap)
  const gc = info.sides.find((s) => s.role === 'gardeners');
  await go(gc.gap[0] - 1.5, gc.gap[1] + 1.5, 'e_gardeners');
  await go((gc.r[0] + gc.r[2]) / 2, (gc.r[1] + gc.r[3]) / 2 + 1, 'e_gardeners_in', 800);
  // the hedge maze: at its way in, and inside it
  const m = info.maze;
  await go(m.gin[0] - 1.5, m.gin[1] + 0.5, 'f_maze_in');
  await go(m.x0 + m.pitch * 2 + 2.5, m.y0 + m.pitch + 2.5, 'g_maze');
  // the rose terrace, its fountain and arbours; its garden party
  const f3 = info.fountains[1];
  await go(f3.x + 5.5, f3.y + 0.5, 'h_roses');
  if (info.party) await go(info.party.x + 1.5, info.party.y - 2.5, 'i_party');
  // a bed of nettles, with him in it (stirred, stung, slowed)
  const n0 = info.nettles[0];
  await go((n0[0] + n0[2]) / 2, (n0[1] + n0[3]) / 2, 'j_nettles', 0);
  // the lake and the Swan Pavilion, from the lake walk; the boss's ground; the gate on up the hill
  await go(info.pavilion.x - 4, info.lake[3] + 1.5, 'k_lake');
  await go(info.boss.x - 2, info.boss.y - 4, 'l_arena');
  await go(info.exit.x, info.exit.y + 4.5, 'm_gate_on');
  // the lair, the treasure garden; the lake terrace's near end, where he comes up onto it; and where he came in again (the gate behind him)
  const lair = info.sides.find((s) => s.role === 'lair');
  await go((lair.r[0] + lair.r[2]) / 2 - 1, (lair.r[1] + lair.r[3]) / 2 + 1, 'n_lair');
  const tre = info.sides.find((s) => s.role === 'treasure');
  await go((tre.r[0] + tre.r[2]) / 2, (tre.r[1] + tre.r[3]) / 2 + 1, 'o_treasure');
  const w3 = info.walls[3];
  await go(w3.tx + 0.5, w3.y - 2.5, 'p_lake_west');
  await go(info.start.x, info.start.y, 'q_start_again');
}
