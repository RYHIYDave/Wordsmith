// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S PALACE GUARD IN THE GAME (game/act1_rules/pguard.ts, art/act1_figs/pguard.ts,
// render/act1_fx/pguard.ts), behind HIGH_CITY (off until his yes):
//   1. they are built: their rules, both looks' pictures (the art chat's) with a clip by each name their acts use, from in front
//      and behind, their switch on with the descent's figures, their size as their pictures stand;
//   2. the rules' numbers are their pictures' own: the march's pace, both blows' moments and lengths, where each weapon's point
//      is as it is thrust, the sweep's blade frame by frame; each area beyond the steel, the partisan's bigger than the Hush's
//      like kind's (his rule of 28 Oct), the sword's shorter as its blade is;
//   3. THE LONG THRUST lands at its moment on whoever is along its line, once, and not beyond it, beside it or behind, each
//      look by its own weapon; each look thrusts from as far as its own reaches;
//   4. THE WIDE SWEEP strikes whoever the blade passes as it comes round, as it passes him, once, and throws him a little way;
//      not beyond its reach nor behind them;
//   5. TWO ATTACKS (his rule: a basic blow, no cooldown of its own, used while the big one cools down): both made, the sweep no
//      oftener than its cooldown, the thrusts between;
//   6. A SQUAD OF THE TWO: partisan and sword in turn, each shown and dying as itself;
//   7. MARCHING IN STEP: two who set off out of step fall into step;
//   8. with HIGH_CITY off they are nowhere; with it on, on floor 16, packs of a medium kind's size, and its lair's guardians;
//   9. THE WARNINGS: the thrust's line and the sweep's fan marked on the floor in the enemy's pink, where the rules strike;
//  10. a long fight with a squad of them (in the practice room, until floor 16's own map-maker is in): no exceptions, both
//      blows made.
//   run: tsx --test tests/act2_pguard.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, HEAVY_FIGURES, figureOf, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { FLAME } from '../src/art/mkit';
import { GUARD_ON, partisanOf, swordOf } from '../src/art/palace_guard';
import { GD_DIES, GD_PACE, GD_SWEEP, GD_THRUST, GD_WALK, GUARD_PARTISAN, GUARD_SWORD } from '../src/art/palace_guard_moves';
import { TILE3, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1, HIGH_CITY } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { ACT2_GUARD } from '../src/game/act2_mobs';
import { CARTER } from '../src/game/act1_rules/carter';
import { PARTISAN_GUARD, PGUARD, SWORD_GUARD, sweepBearing, sweepFan, thrustLine } from '../src/game/act1_rules/pguard';
import { WATCH } from '../src/game/act1_rules/watch';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { fromFigure } from '../src/game/facing';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import type { Game } from '../src/game/game';
import type { ActId, Monster } from '../src/game/state';
import { act1Fx } from '../src/render/act1_fx/index';
import { colourCatcher, cyanish, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { roomFight } from './high16_room';
import { paintWithoutCanvas, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

const LOOKS: [number, Mob, string][] = [[PARTISAN_GUARD, GUARD_PARTISAN, 'the partisan guard'], [SWORD_GUARD, GUARD_SWORD, 'the sword guard']];

function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}
function place(g: Game, m: Monster, fwd: number, left: number): void {
  const h = g.hero;
  const hand = m.act ? m.act.hand : 1;
  h.x = m.x + m.fx * fwd + m.fy * hand * left;
  h.y = m.y + m.fy * fwd - m.fx * hand * left;
}
/** A guard of look `look` in the practice room `far` tiles from the hero, only act `only` ready. */
function guard(look: number, far: number, only: ActId | null): { g: Game; m: Monster } {
  const { g, m } = room('pguard', far, only);
  m.form = look;
  return { g, m };
}
/** The weapon's point at a moment of a move (tiles before them, to their left, up): the partisan's tip, the sword's. */
function point(mob: Mob, move: string, t: number): [number, number, number] {
  const s = skeletonAt(mob, move, t);
  const p = mob === GUARD_PARTISAN ? partisanOf(s, posedOfMob(mob, move, t) as unknown as { draw: number }).tip : swordOf(s).tip;
  return [p[0] / TILE3, p[1] / TILE3, p[2] / TILE3];
}

test('1. they are built: their rules, both looks with a clip by each name their acts use, their switch, their size', () => {
  const r = act1Rules('pguard');
  const fig = act1Fig('pguard');
  assert.ok(r && fig && act1Fx('pguard'), 'their rules, their pictures, their warnings');
  assert.ok(fig!.switches?.includes(GUARD_ON), "the art chat's switch is theirs");
  makeBestiary();
  assert.equal(GUARD_ON.on, ACT1.on, "on with the descent's figures (art/bestiary.ts useAct1Figs): a switch nothing reads");
  assert.equal(fig!.looks?.length, 1, 'one other look: the sword guard');
  assert.ok(act1Fig('pguard:1') === fig!.looks![0], "the sword guard is the game's figure 'pguard:1'");
  for (const f of ['pguard', 'pguard:1'] as const) {
    assert.ok(FIRST5_FIGURES.includes(f) && !HEAVY_FIGURES.includes(f), `${f}: a figure the painter paints beside the game, light`);
    const art = makeBestiary().of(f);
    for (const set of [art.front, art.back]) {
      for (const a of r!.acts) {
        const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
        assert.ok(clip && clip.frames.length > 0, `${f}, ${a.id}: its clip ${a.clip}`);
        near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `${f}, ${a.id}'s length`);
        near(clip!.hit ?? -1, a.hit, 1e-9, `${f}: its clip's blow is the act's`);
      }
      assert.ok(set.clips?.reel && set.clips?.die, `${f}: struck, and to one knee then a crash`);
      near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, GD_DIES.long, 0.06, `${f}: their death's length`);
    }
    // (the plume over the helmet is not its head, as a club held over one is not: the helmet's top is a little under it)
    const m = measuredSize(f);
    assert.ok(Math.abs(m.size.top - m.head) <= 4, `${f}: the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
    assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${f}: ${m.size.half} to either side; the picture reaches ${m.reach}`);
  }
  assert.ok(measuredSize('pguard').size.top > measuredSize('hushed').size.top + 5, 'a head taller than the Hushed');
});

test("2. the rules' numbers are their pictures' own; each area beyond the steel", () => {
  const G = gaitOf('pguard')!;
  assert.equal(G.pace, GD_PACE, 'their march at the pace it is painted for');
  assert.equal(PGUARD.pace, GD_PACE);
  assert.equal(MONSTERS.pguard.speed, GD_PACE, 'and the game moves them so: their boots do not slide');
  near(PGUARD.round, GD_WALK.frames / GD_WALK.fps, 1e-9, 'their march\'s round');
  near(G.cycle, PGUARD.round / 2, 1e-9, 'they stop where both boots are down');
  assert.equal(makeBestiary().of('pguard').front.walkFps, GD_WALK.fps, 'their march shown at its own rate');
  const acts = actsOf({ kind: 'pguard' })!;
  assert.equal(acts.length, 2, 'medium: two attacks, the thrust and the sweep');
  const [thrust, sweep] = acts;
  assert.equal(thrust.clip, 'attack');
  assert.equal(sweep.clip, 'sweep', "the art's second blow, `more.sweep`");
  assert.equal(thrust.hit, GD_THRUST.hit);
  assert.equal(thrust.long, GD_THRUST.long);
  assert.equal(sweep.hit, GD_SWEEP.hit);
  assert.equal(sweep.long, GD_SWEEP.long);
  assert.equal(PGUARD.thrust.warn[0], GD_THRUST.warn[0]);
  assert.equal(PGUARD.sweep.warn[1], GD_SWEEP.warn[1]);
  assert.equal(MONSTERS.pguard.windup, GD_THRUST.hit);
  assert.equal(MONSTERS.pguard.range, PGUARD.thrust.far[PARTISAN_GUARD], 'its range, the partisan\'s thrust');
  for (const [look, mob, who] of LOOKS) {
    // THE THRUST: the point as it is thrust out, and how far it is carried on
    const [f, l] = point(mob, 'attack', GD_THRUST.hit);
    near(PGUARD.thrust.at[look][0], f, 0.02, `${who}: the point thrust out before them`);
    near(PGUARD.thrust.at[look][1], l, 0.02, `${who}: and to their left`);
    let out = 0;
    for (let t = GD_THRUST.hit; t <= 1.0; t += 1 / 30) out = Math.max(out, point(mob, 'attack', t)[0]);
    near(PGUARD.thrust.out[look], out, 0.02, `${who}: carried on`);
    const L = thrustLine(look);
    assert.ok(L.to >= out + 0.5, `${who}: the line beyond the point (${L.to.toFixed(2)})`);
    assert.ok(PGUARD.thrust.far[look] <= L.to - 0.4 && G.stopAt < PGUARD.thrust.far[look], `${who}: it thrusts from inside its line`);
    // THE SWEEP: the blade frame by frame, its bearing and reach the picture's; low enough to strike a man; before it, up or behind; after, turned back
    const A = PGUARD.sweep.at[look];
    for (const [t, b, r] of A) {
      const [x, y, z] = point(mob, 'sweep', t);
      near(b, Math.atan2(y, x), 0.01, `${who}: the blade's bearing at ${(t * 30).toFixed(0)}/30`);
      near(r, Math.hypot(x, y), 0.02, `${who}: its reach then`);
      assert.ok(z < 1.75, `${who}: low enough to strike a man at ${(t * 30).toFixed(0)}/30 (${z.toFixed(2)} tiles up)`);
    }
    const before = point(mob, 'sweep', A[0][0] - 1 / 30);
    assert.ok(before[2] > 1.75 || Math.atan2(before[1], before[0]) < A[0][1] - 0.4, `${who}: before its first frame the blade is still up or behind`);
    const after = point(mob, 'sweep', A[A.length - 1][0] + 1 / 30);
    assert.ok(Math.atan2(after[1], after[0]) <= A[A.length - 1][1] + 1e-3, `${who}: after its last, it turns back`);
    near(sweep.hit, 24 / 30, 1e-9, 'the sweep straight before them at its moment');
    const F = sweepFan(look);
    let reach = 0;
    for (const [, , r] of A) reach = Math.max(reach, r);
    assert.ok(F.r >= reach + 0.5 && PGUARD.sweep.far[look] <= F.r - 0.4, `${who}: the fan beyond the steel, and swept from inside it`);
  }
  // (his rule of 28 Oct: the partisan's bigger than the Hush's like kinds', the watch's halberd and the carter's lash)
  const P = sweepFan(PARTISAN_GUARD);
  const W = WATCH.sweep.at;
  const wReach = Math.max(...W.map(([, , r]) => r)) + TUNE.heroRadius * 0.5;
  assert.ok(P.r > wReach + 0.4 && P.b1 - P.b0 > W[W.length - 1][1] - W[0][1] + 0.5, `the partisan's sweep bigger than the watch's (${P.r.toFixed(2)} out, ${(((P.b1 - P.b0) * 180) / Math.PI).toFixed(0)} degrees round)`);
  const T = thrustLine(PARTISAN_GUARD);
  assert.ok(T.to > CARTER.lash.out[0] + TUNE.heroRadius * 0.5 + 0.3 && T.left1 - T.left0 > 2 * CARTER.lash.half + 0.2, 'its thrust a longer, wider line than the carter\'s lash');
  // (the sword's shorter, as its blade is)
  assert.ok(sweepFan(SWORD_GUARD).r < P.r && thrustLine(SWORD_GUARD).to < T.to, 'the sword guard\'s reach the shorter');
});

test('3. the long thrust: at its moment along its line, once; not beyond, beside or behind; each from as far as its own reaches', () => {
  const cases: [number, [number, number, boolean][]][] = [
    [PARTISAN_GUARD, [[1.0, 0, true], [2.6, 0.3, true], [3.2, -0.5, true], [3.45, 0, false], [1.5, 0.75, false], [1.5, -0.75, false], [-0.6, 0, false]]],
    [SWORD_GUARD, [[1.0, -0.2, true], [2.1, 0.3, true], [1.2, -0.8, true], [2.35, 0, false], [1.2, 0.55, false], [-0.6, 0, false]]],
  ];
  for (const [look, list] of cases) {
    for (const [fwd, left, hurt] of list) {
      const { g, m } = guard(look, 1.2, 'pguard:thrust');
      assert.ok(untilAct(g, m, 'pguard:thrust'), 'it thrusts');
      place(g, m, fwd, left);
      const t0 = m.act!.t;
      g.hero.invuln = 0;
      const s = watch(g, m, 1.6, undefined, () => m.state !== 'act');
      if (hurt) {
        assert.equal(s.hurts.length, 1, `look ${look} at ${fwd}, ${left}: struck once`);
        near(s.hurts[0].t + t0, GD_THRUST.hit, 1.5 / 60, 'as the point is thrust out');
      } else assert.equal(s.hurts.length, 0, `look ${look} at ${fwd}, ${left}: off its line, not struck`);
    }
  }
  // (each from as far as its own weapon reaches: the partisan from 2.2 tiles at once; the sword marches nearer first)
  for (const [look] of LOOKS) {
    const { g, m } = guard(look, 2.2, 'pguard:thrust');
    let from = -1;
    watch(g, m, 6, undefined, () => {
      if (m.state === 'act' && from < 0) from = Math.hypot(g.hero.x - m.x, g.hero.y - m.y);
      return from >= 0;
    });
    assert.ok(from > 0 && from <= PGUARD.thrust.far[look] + 1e-6, `look ${look}: thrust from ${from.toFixed(2)}`);
    if (look === PARTISAN_GUARD) near(from, 2.2, 0.05, 'the partisan from where it stood');
  }
});

test('4. the wide sweep: as the blade passes him, once, throwing him a little; not beyond its reach, nor behind', () => {
  const cases: [number, [number, number, boolean][]][] = [
    [PARTISAN_GUARD, [[-1.9, 2.5, true], [0, 3.1, true], [1.5, 2.0, true], [2.2, 2.0, true], [0.6, 1.0, true], [0, 3.45, false], [2.5, 1.5, false], [Math.PI, 1.0, false]]],
    [SWORD_GUARD, [[-1.9, 1.5, true], [0, 1.9, true], [1.7, 1.2, true], [0.5, 0.8, true], [0, 2.25, false], [2.0, 1.0, false], [Math.PI, 0.8, false]]],
  ];
  for (const [look, list] of cases) {
    const F = sweepFan(look);
    for (const [b, d, hurt] of list) {
      const { g, m } = guard(look, 1.2, 'pguard:sweep');
      assert.ok(untilAct(g, m, 'pguard:sweep'), 'it sweeps');
      place(g, m, Math.cos(b) * d, Math.sin(b) * d);
      const t0 = m.act!.t;
      const h = g.hero;
      h.invuln = 0;
      const x0 = h.x;
      const y0 = h.y;
      let moved = 0;
      const s = watch(g, m, 2, undefined, () => {
        moved = Math.hypot(h.x - x0, h.y - y0);
        return m.state !== 'act';
      });
      if (!hurt) {
        assert.equal(s.hurts.length, 0, `look ${look} at bearing ${b.toFixed(2)}, ${d}: not struck`);
        continue;
      }
      assert.equal(s.hurts.length, 1, `look ${look} at bearing ${b.toFixed(2)}, ${d}: struck once`);
      // (as the blade passes him: at its first frame for one at its right edge, its last for one at its left)
      let when = F.t0;
      for (let t = F.t0; t <= F.t1 + 1e-9; t += 1 / 240) if (sweepBearing(look, t) < b) when = t;
      if (b >= sweepBearing(look, F.t1 - 1e-6)) when = F.t1;
      near(s.hurts[0].t + t0, when, 2.5 / 60, `look ${look} at bearing ${b.toFixed(2)}: as the blade passes`);
      assert.ok(moved > 0.1, `thrown a little way (${moved.toFixed(2)})`);
    }
  }
});

test('5. two attacks: both made; the sweep no oftener than its cooldown; the thrust, the basic blow, between', () => {
  const { g, m } = guard(PARTISAN_GUARD, 1.4, null);
  const begun: [string, number][] = [];
  let last: string | null = null;
  watch(g, m, 20, undefined, () => {
    const id = m.state === 'act' && m.act ? m.act.id : null;
    if (id && id !== last) begun.push([id, g.time]);
    last = id;
    return false;
  });
  const sweeps = begun.filter(([id]) => id === 'pguard:sweep').map(([, t]) => t);
  const thrusts = begun.filter(([id]) => id === 'pguard:thrust').map(([, t]) => t);
  assert.ok(sweeps.length >= 2 && thrusts.length >= 2, `both made (${sweeps.length} sweeps, ${thrusts.length} thrusts in 20 s)`);
  for (let i = 1; i < sweeps.length; i++) assert.ok(sweeps[i] - sweeps[i - 1] >= PGUARD.sweep.long + PGUARD.sweep.cooldown - 0.05, `sweeps ${(sweeps[i] - sweeps[i - 1]).toFixed(2)} s apart`);
  // (the basic blow: no cooldown of its own, a short stand after each; made whenever the sweep is cooling)
  const acts = actsOf({ kind: 'pguard' })!;
  assert.ok(acts[0].cooldown === 0 && acts[1].cooldown > 0 && acts[1].dmg > acts[0].dmg, 'the thrust the basic blow, the sweep the bigger and cooling longer');
  for (let i = 1; i < thrusts.length; i++) assert.ok(thrusts[i] - thrusts[i - 1] >= PGUARD.thrust.long + PGUARD.thrust.after * 0.85, `thrusts ${(thrusts[i] - thrusts[i - 1]).toFixed(2)} s apart`);
  assert.ok(thrusts.length >= 2 * sweeps.length, `the thrust made between the sweeps (${thrusts.length} to ${sweeps.length})`);
});

test('6. a squad of the two: partisan and sword in turn, each shown and dying as itself', () => {
  const { g } = room('pguard', 4);
  const squad = Array.from({ length: 6 }, (_, i) => g.spawn('pguard', g.hero.x + 3, g.hero.y + i * 0.6 - 1.5, 61, 0, false, new RNG(300 + i)));
  for (const m of squad) {
    assert.equal(m.form, m.id % 2 === 0 ? PARTISAN_GUARD : SWORD_GUARD, 'in turn by its number');
    assert.equal(figureOf(m), m.form === SWORD_GUARD ? 'pguard:1' : 'pguard', 'shown as its look');
  }
  assert.equal(squad.filter((m) => m.form === SWORD_GUARD).length, 3, 'half of them sword guards');
  const art = makeBestiary();
  const a = art.of('pguard').front.idle[0];
  const b = art.of('pguard:1').front.idle[0];
  assert.ok(unlike(a, b) > 200, `the two stand differently (${unlike(a, b)} pixels)`);
  const m = squad.find((q) => q.form === SWORD_GUARD)!;
  m.life = 1;
  m.maxLife = 1;
  g.events.length = 0;
  (g as unknown as { kill(m: unknown): void }).kill(m);
  const died = g.events.find((e) => e.t === 'die');
  assert.ok(died && figureOf(died as unknown as { kind: 'pguard'; champion: boolean; form?: number }) === 'pguard:1', 'a sword guard falls as a sword guard');
});

test('7. marching in step: two who set off out of step fall into step within a few strides', () => {
  const { g, all } = room('pguard', 9, 'pguard:none', 2);
  const [a, b] = all;
  // (both on the march; then one put half a round out of step)
  watch(g, a, 0.5, undefined, () => !!a.gait && a.gait.mode === 'walk' && !!b.gait && b.gait.mode === 'walk');
  assert.ok(a.gait!.mode === 'walk' && b.gait!.mode === 'walk', 'both marching');
  b.gait!.t += PGUARD.round * 0.45;
  const off = (): number => {
    const P = PGUARD.round;
    let d = (((a.gait!.t - b.gait!.t) % P) + P) % P;
    if (d > P / 2) d = P - d;
    return d / P;
  };
  assert.ok(off() > 0.4, `out of step (${off().toFixed(2)} of a round)`);
  watch(g, a, 5.5, undefined, () => a.gait!.mode !== 'walk' || b.gait!.mode !== 'walk');
  assert.ok(a.gait!.mode === 'walk' && b.gait!.mode === 'walk', 'still marching');
  assert.ok(off() < 0.03, `in step (${off().toFixed(3)} of a round apart)`);
});

test('8. with HIGH_CITY off they are nowhere; with it on, on floor 16, packs of a medium kind\'s size, and its lair\'s guardians', () => {
  const rng = new RNG(6);
  for (let d = 1; d <= 16; d++) for (let k = 0; k < 40; k++) assert.ok(act1Pack(d, rng, 'normal').kind !== 'pguard', `HIGH_CITY off: none on floor ${d}`);
  high(() => {
    assert.equal(sizeOf('pguard'), 'medium');
    const [lo, hi] = PACK_BY_SIZE.medium;
    let seen = 0;
    for (let k = 0; k < 400; k++) {
      const p = act1Pack(16, rng, 'normal');
      if (p.kind !== 'pguard') continue;
      seen++;
      assert.ok(p.size >= lo && p.size <= hi, `a squad of ${p.size}`);
    }
    assert.ok(seen > 40, `their own squads on floor 16 (${seen} in 400)`);
    assert.equal(ACT2_GUARD[16], 'pguard', 'the floor\'s medium kind');
    assert.equal(act1Pack(16, rng, 'champion').kind, 'pguard', 'its lair\'s guardians, no stand-in now they are built');
  });
});

test('9. the warnings: the thrust\'s line and the sweep\'s fan marked on the floor in pink, where the rules strike and nowhere else', () => {
  const fx = act1Fx('pguard')!;
  for (const [look, , who] of LOOKS) {
    for (const id of ['pguard:thrust', 'pguard:sweep'] as const) {
      const { g, m } = guard(look, 1.2, id);
      assert.ok(untilAct(g, m, id));
      const drawn = (t: number): { colours: Set<string>; pts: [number, number][] } => {
        m.act!.t = t;
        const { g: canvas, colours } = colourCatcher();
        const pts: [number, number][] = [];
        fx.ground!({ g: canvas, at: (x, y) => { pts.push([x, y]); return [(x - y) * 16, (x + y) * 8]; }, game: g, t: 0.4, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null);
        return { colours, pts };
      };
      const w = drawn(0.45);
      assert.ok([...w.colours].some((c) => c === FLAME[2] || c === FLAME[3]), `${who}, ${id}: in the enemy's pink`);
      assert.ok(![...w.colours].some(cyanish), `${who}, ${id}: nothing cyan`);
      assert.ok(w.pts.length > 60, `${who}, ${id}: marked (${w.pts.length} points)`);
      let far = 0;
      for (const [x, y] of w.pts) {
        const r = fromFigure(m.x, m.y, m.fx, m.fy, m.act!.hand, x, y);
        if (id === 'pguard:thrust') {
          const L = thrustLine(look);
          far = Math.max(far, r.fwd);
          assert.ok(r.fwd >= L.from - 0.01 && r.fwd <= L.to + 0.01 && r.left >= L.left0 - 0.01 && r.left <= L.left1 + 0.01, `${who}: the thrust marked at (${r.fwd.toFixed(2)}, ${r.left.toFixed(2)}), inside its line`);
        } else {
          const F = sweepFan(look);
          const d = Math.hypot(r.fwd, r.left);
          far = Math.max(far, d);
          const bearing = Math.atan2(r.left, r.fwd);
          assert.ok(d <= F.r + 0.01 && (d < 0.05 || (bearing >= F.b0 - 0.02 && bearing <= F.b1 + 0.02)), `${who}: the sweep marked at bearing ${bearing.toFixed(2)}, ${d.toFixed(2)} out, inside its fan`);
        }
      }
      const edge = id === 'pguard:thrust' ? thrustLine(look).to : sweepFan(look).r;
      assert.ok(far > edge - 0.05, `${who}, ${id}: out to its far edge`);
      const after = id === 'pguard:thrust' ? GD_THRUST.hit + 0.05 : sweepFan(look).t0 + 0.05;
      assert.equal(drawn(after).pts.length, 0, `${who}, ${id}: none once the blow has come`);
    }
  }
});

test('10. a long fight with a squad of them: no exceptions, both blows made', () => {
  const { them, acts } = roomFight('pguard', 5, 40);
  assert.ok(them.some((m) => m.form === SWORD_GUARD) && them.some((m) => m.form === PARTISAN_GUARD), 'a mixed squad');
  assert.ok(acts.has('pguard:thrust') && acts.has('pguard:sweep'), `both blows made (${[...acts].join(', ')})`);
});
