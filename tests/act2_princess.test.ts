// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S BOSS, THE PRINCESS, IN THE GAME, BEHIND HIGH_CITY (game/act1_rules/princess.ts; her
// pictures art/act1_figs/princess.ts, the art chat's art/princess.ts, princess_moves.ts, princess_ride.ts, spectral_steed.ts; what
// she casts, render/act1_fx/princess.ts, the art's princess_fx.ts and garden_swans.ts):
//   1. she is built: her rules, her pictures with every clip her acts name, heavy; floor 16's boss with HIGH_CITY on, the
//      Warden with it off, and nothing of her switched on with it off; her line a silence; her size as her pictures stand;
//   2. the rules' numbers are her pictures' own: her glide, every move's length, warning and moment, her lash's reach and
//      wedge, the snare's and the Vow's sizes and times, the steed's leaps and where its forehooves come down;
//   3. HER GLIDE: fast and never still for long, darting about the hero between her moves, at her pace;
//   4. THE LASH lands at its moment on whoever is in its quarter-turn wedge, as far as its tip; not beside or behind her;
//   5. THE SNARE bursts round where the hero stood as her warning ended; it holds him in (his walk and his roll); struck
//      enough, it breaks and lets him go, a blow at a time; left alone it holds six seconds, then withers;
//   6. THE ELEVEN: eleven lines across the arena a tile and a half apart, along the floor's way toward the hero; on a line as
//      its swan passes, struck; in a gap, not;
//   7. THE VOW: its burst strikes whoever is inside it; his words dark while he stands in it, back once he is out; not
//      outside it; it goes with her;
//   8. HER STEED: forms, fifteen leaps, the first eight a lap of her arena, the last seven each at the hero, landing where he
//      stood as it sprang; its landing strikes whoever is under it and not one who got out; then it fades; on it, she is
//      not brought below 1, and struck down to it the steed fades first, then she falls;
//   9. HER PHASES: the steed at the start of each from the second; more swans, more thread (the lash twice in a row, her
//      moves sooner), the Eleven twice in her third, the steed again in her third;
//  10. HER DEATH: her whisper, her swans flying off, her snare withering and letting him go; nothing of hers harms him after;
//  11. what she casts is drawn, never cyan; her things painted as the painter will paint them;
//  12. a long fight on a stand-in floor (floor 9's clearing, about 20 by 19 tiles, her in the stag's place): no exceptions,
//      every move made, her steed and her phases too.
//   run: tsx --test tests/act2_princess.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIG, SNARE_FRAMES, SNARE_STAGES, princessThings, snareFrameAt, snareShots, vowFrameAt, vowShots } from '../src/art/act1_figs/princess';
import { FIGURE_SIZE, HEAVY_FIGURES, makeBestiary } from '../src/art/bestiary';
import { SWAN_ON } from '../src/art/garden_swans';
import { TILE3 } from '../src/art/new_mobs3';
import { PRINCESS_ON } from '../src/art/princess';
import { SNARE_FX, VOW_FX } from '../src/art/princess_fx';
import { LASH_REACH, PRINCESS as PR_MOB, PR_DIES, PR_ELEVEN, PR_GLIDE, PR_LASH, PR_PACE, PR_REEL, PR_SNARE, PR_VOW } from '../src/art/princess_moves';
import { RIDE_END, RIDE_FORM, RIDE_LEAP, steedPoseAt } from '../src/art/princess_ride';
import { solesOf } from '../src/art/spectral_steed';
import { ACT1_FLOORS, HIGH_CITY, act1Floor, lastFloor } from '../src/game/act1';
import { PRINCESS, PRINCESS_ACTS, PRINCESS_FIGHT, PRINCESS_GAIT, PRINCESS_WHISPER, RULES, inLash, linesOf, phaseIn, princessGround, riding, snareOf, swansOf } from '../src/game/act1_rules/princess';
import { bossKind, gaitOf } from '../src/game/bosses';
import { BOSS_LINES, MONSTERS, TUNE, sizeOf } from '../src/game/defs';
import { beside } from '../src/game/facing';
import { Game } from '../src/game/game';
import { RNG } from '../src/engine/rng';
import { emptyControls } from '../src/game/state';
import type { Monster, Peril } from '../src/game/state';
import { FX } from '../src/render/act1_fx/princess';
import { colourCatcher, cyanish, floor, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { fakeCtx, fakeDocument } from './act1_kinds_room';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const act = (id: string) => PRINCESS_ACTS.find((a) => a.id === id)!;
const idx = (id: string): number => PRINCESS_ACTS.findIndex((a) => a.id === id);
/** Put the hero `fwd` tiles before her and `left` to the left her picture is drawn with. */
function put(g: Game, m: Monster, fwd: number, left: number): void {
  const p = beside(m.x, m.y, m.fx, m.fy, m.act ? m.act.hand : 1, fwd, left);
  g.hero.x = p.x;
  g.hero.y = p.y;
}
const perils = (g: Game, a1: string): Peril[] => g.perils.filter((p) => p.a1 === a1);
/** A hero who does not fall: a blow that would end him is not the end of him. */
function undying(g: Game): Game {
  (g as unknown as { die(): void }).die = () => {
    g.hero.life = g.hero.d.maxLife;
  };
  return g;
}
function highCity<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}
/** Her life brought to a share of it (her phases go by it). */
const lifeAt = (m: Monster, k: number): void => {
  m.life = m.maxLife * k;
};
/**
 * A STAND-IN FLOOR: floor 9's clearing (the pinewood stag's open ground, about 20 by 19 tiles), the stag taken off it and her
 * put in his place, its boss; floor 16 is not laid until its own map-maker is (the place helper's).
 */
function standIn(seed: number): { g: Game; m: Monster } {
  const g = undying(floor(9, seed));
  const b = g.boss!;
  g.monsters = g.monsters.filter((o) => o !== b);
  const m = g.spawn('princess', b.x, b.y, -3, 0, true, new RNG(seed));
  g.boss = m;
  g.bossReady();
  return { g, m };
}

paintWithoutCanvas();
fakeDocument();

test("1. she is built, heavy; floor 16's boss with HIGH_CITY on, the Warden with it off, nothing of her on; her line a silence; her size", () => {
  assert.ok(RULES && FIG && FX, 'her rules, her pictures and what she casts');
  assert.equal(PRINCESS_ON.on, false, "the art chat's switch left off");
  // (the swans' own switch, SWAN_ON, is the swan kind's figure's since floor 16's kinds were merged, art/act1_figs/swan.ts: the game
  // turns it on with the descent's figures, art/bestiary.ts useAct1Figs; so it is not hers to hold off here)
  void SWAN_ON;
  assert.equal(sizeOf('princess'), 'boss');
  const chosen = RULES!.acts.filter((a) => !a.forced);
  assert.equal(chosen.length, 4, "her four: the lash, the snare, the Eleven, the Vow (his doc's four, the Shirt his snare)");
  assert.equal(chosen[0].clip, 'attack', 'her basic blow first');
  assert.equal(chosen[0].cooldown, 0);
  for (let i = 2; i < 4; i++) assert.ok(chosen[i].cooldown > chosen[i - 1].cooldown, 'the bigger, the longer the cooldown');
  assert.equal(RULES!.acts.filter((a) => a.forced).map((a) => a.clip).join(','), 'rideForm,rideLeap,rideEnd', 'her ultimate, brought by the rules');
  assert.equal(FIG!.heavy, true, 'heavy: a boss, made for her floor');
  assert.ok(HEAVY_FIGURES.includes('princess'), 'painted by the painter, beside the game');
  const art = makeBestiary().of('princess');
  for (const set of [art.front, art.back]) {
    for (const a of RULES!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `her ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `her ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck, and her death');
    near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, PR_DIES.long, 1 / set.clips!.die!.fps, 'her death as long as the art\'s');
  }
  const s = measuredSize('princess');
  assert.ok(Math.abs(s.size.top - s.head) <= 4, `the game takes her to be ${s.size.top} up; in the picture she is ${s.head}`);
  assert.ok(s.size.half <= s.reach + 1 && s.size.half >= Math.min(12, s.reach * 0.4), `${s.size.half} to either side; the picture reaches ${s.reach}`);
  assert.equal(FIGURE_SIZE.princess.top, FIG!.size.top);
  assert.equal(BOSS_LINES.princess!.join(''), '...', 'a silence (she never makes a sound)');
  // (off: floor 16 is nothing, its boss the Warden; on: hers)
  assert.equal(HIGH_CITY.on, false);
  assert.equal(act1Floor(16), 0);
  assert.equal(lastFloor(), 15);
  assert.equal(bossKind(16), 'warden', 'off: nothing of her');
  highCity(() => {
    assert.equal(ACT1_FLOORS[16].boss, 'princess');
    assert.equal(bossKind(16), 'princess', "on: floor 16's boss");
  });
});

test("2. the rules' numbers are her pictures' own", () => {
  const G = gaitOf('princess')!;
  assert.equal(G, PRINCESS_GAIT);
  assert.equal(G.pace, PR_PACE, 'her glide at the pace it is painted for');
  assert.equal(MONSTERS.princess.speed, PR_PACE);
  near(G.cycle, 1 / PR_GLIDE.fps, 1e-9, 'stopped at any frame');
  assert.equal(G.trueBack, PR_MOB.trueBack === true);
  const L = PRINCESS.lash;
  assert.equal(L.long, PR_LASH.long);
  assert.equal(L.hit, PR_LASH.hit);
  assert.equal(L.warn.join(), PR_LASH.warn.join());
  assert.equal(L.strike.join(), PR_LASH.strike.join());
  assert.equal(L.from, PR_LASH.area[0]);
  assert.equal(L.to, PR_LASH.area[1]);
  assert.equal(L.held, PR_LASH.from);
  near(L.reach, LASH_REACH / TILE3, 1e-9, 'its reach, seven and a half tiles');
  for (const [id, art] of [['princess:lash', PR_LASH], ['princess:snare', PR_SNARE], ['princess:eleven', PR_ELEVEN], ['princess:vow', PR_VOW]] as const) {
    assert.equal(act(id).long, art.long, `${id}: as long as its picture`);
    assert.equal(act(id).hit, art.hit, `${id}: its moment its picture's`);
  }
  assert.equal(PRINCESS.snare.warn.join(), PR_SNARE.warn.join());
  assert.equal(PRINCESS.eleven.warn.join(), PR_ELEVEN.warn.join());
  assert.equal(PRINCESS.vow.warn.join(), PR_VOW.warn.join());
  // (the snare and the Vow: their sizes and times the art's)
  const S = PRINCESS.snare;
  near(S.r, SNARE_FX.r / TILE3, 1e-9, 'the snare five tiles across');
  assert.equal(S.heave, SNARE_FX.heave[1]);
  assert.equal(S.burst.join(), SNARE_FX.burst.join());
  assert.equal(S.sink.join(), SNARE_FX.sink.join());
  assert.equal(S.shake, SNARE_FX.hit);
  assert.equal(S.breaks, SNARE_FX.breaks);
  assert.equal(S.life, SNARE_STAGES, 'its life in blows, a stage of its pictures each');
  const V = PRINCESS.vow;
  near(V.r, VOW_FX.r / TILE3, 1e-9, 'the Vow ten tiles across');
  near(V.burst, VOW_FX.burst[1], 1e-9, 'out in two frames');
  assert.equal(V.hold, VOW_FX.hold);
  assert.equal(V.fade, VOW_FX.fade);
  // (the steed)
  const R = PRINCESS.ride;
  assert.equal(R.form, RIDE_FORM.long);
  assert.equal(R.formWarn.join(), RIDE_FORM.warn.join());
  assert.equal(R.leap, RIDE_LEAP.long);
  assert.equal(R.leapWarn.join(), RIDE_LEAP.warn.join());
  assert.equal(R.spring, RIDE_LEAP.spring);
  assert.equal(R.air.join(), RIDE_LEAP.air.join());
  assert.equal(R.hit, RIDE_LEAP.hit);
  assert.equal(R.carry, RIDE_LEAP.carry);
  assert.equal(R.laps, RIDE_LEAP.laps);
  assert.equal(R.atYou, RIDE_LEAP.atYou);
  assert.equal(R.end, RIDE_END.long);
  assert.equal(act('princess:ride').long, RIDE_FORM.long);
  assert.equal(act('princess:leap').long, RIDE_LEAP.long);
  assert.equal(act('princess:leap').hit, RIDE_LEAP.hit);
  assert.equal(act('princess:unride').long, RIDE_END.long);
  // (where its forehooves come down: before her floor point, as the art has them as they land)
  const soles = solesOf(steedPoseAt('rideLeap', RIDE_LEAP.hit));
  near(R.hoof, (soles[0][0] + soles[1][0]) / 2 / TILE3, 0.15, 'its forehooves come down before her');
  assert.equal(PRINCESS.reel, PR_REEL);
  assert.equal(PRINCESS.dies.long, PR_DIES.long);
  assert.equal(PRINCESS.dies.sink, PR_DIES.sink[0]);
  // (his sizes: bigger than the old enemies', his “And bigger AOE to compensate for the extra time the player gets to evade”)
  assert.ok(L.reach >= 7 && S.r * 2 >= 5 && V.r * 2 >= 10, 'the lash 7.5 tiles, the snare 5 across, the ring 10');
});

test('3. her glide: fast, darting about the hero between her moves, never still for long', () => {
  const { g, m } = room('princess', 6);
  m.moveCd = PRINCESS_ACTS.map(() => 1e9);
  const h = g.hero;
  let still = 0;
  let longest = 0;
  let moved = 0;
  let fastest = 0;
  const near0: number[] = [];
  for (let k = 0; k < 8 * 60; k++) {
    const x = m.x;
    const y = m.y;
    watch(g, m, 1 / 60);
    const d = Math.hypot(m.x - x, m.y - y);
    moved += d;
    fastest = Math.max(fastest, d * 60);
    still = d < 1e-6 ? still + 1 / 60 : 0;
    longest = Math.max(longest, still);
    near0.push(Math.hypot(m.x - h.x, m.y - h.y));
  }
  assert.ok(moved / 8 > 2.4, `she glides about (${(moved / 8).toFixed(2)} tiles a second on the whole, darts and hovers)`);
  near(fastest, PR_PACE, 0.05, 'at her pace');
  assert.ok(longest < 0.45, `never still long (${longest.toFixed(2)} s at most)`);
  const late = near0.slice(120);
  assert.ok(Math.min(...late) >= 2.5 && Math.max(...late) <= 8.5, `about the hero, within her lash's reach (${Math.min(...late).toFixed(1)} to ${Math.max(...late).toFixed(1)} tiles)`);
});

test('4. the lash lands at its moment on whoever is in its quarter-turn wedge, as far as its tip; not beside or behind her', () => {
  const L = PRINCESS.lash;
  const c40 = Math.cos((40 * Math.PI) / 180);
  const s40 = Math.sin((40 * Math.PI) / 180);
  const c55 = Math.cos((55 * Math.PI) / 180);
  const s55 = Math.sin((55 * Math.PI) / 180);
  for (const [fwd, left, hurt] of [[5, 0, true], [7.3, 0, true], [0.5, 0, true], [5 * c40, 5 * s40, true], [5 * c40, -5 * s40, true], [7 * c40, -7 * s40, true], [7.9, 0, false], [5 * c55, 5 * s55, false], [5 * c55, -5 * s55, false], [-2, 0, false], [0.3, -3, false]] as const) {
    const { g, m } = room('princess', 4, 'princess:lash');
    assert.ok(untilAct(g, m, 'princess:lash'), 'she lashes');
    put(g, m, fwd, left);
    const t0 = m.act!.t;
    const s = watch(g, m, 1.4, undefined, () => !!m.act && m.act.t >= L.hit + 0.05);
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd.toFixed(1)}, ${left.toFixed(1)}: struck once`);
      near(s.hurts[0].t + t0, L.hit, 1.5 / 60, 'at its blow');
    } else assert.equal(s.hurts.length, 0, `at ${fwd.toFixed(1)}, ${left.toFixed(1)}: out of its wedge`);
  }
  // (the wedge itself: as wide as a sixth of a boss arena, his “cover maybe 1/6 of the entire arena”)
  const area = (Math.PI * L.reach * L.reach) / 4;
  assert.ok(area / (17 * 20) > 0.12 && area / (17 * 20) < 0.16, `a quarter turn ${L.reach} tiles out: ${(area / 340).toFixed(3)} of a 17 by 20 arena`);
  const me = { x: 0, y: 0, fx: 1, fy: 0 };
  assert.ok(inLash(me, 1, 3, 0) && !inLash(me, 1, -3, 0) && !inLash(me, 1, 0, 3), 'before her, not behind or beside');
});

test('5. the snare: where he stood as her warning ended; holds him in; broken a blow at a time; left alone, six seconds', () => {
  const S = PRINCESS.snare;
  const C = emptyControls;
  const setUp = (): { g: Game; m: Monster; p: Peril } => {
    const { g, m } = room('princess', 4, 'princess:snare');
    assert.ok(untilAct(g, m, 'princess:snare'), 'she casts her snare');
    const h = g.hero;
    let at: [number, number] = [0, 0];
    watch(g, m, 1.2, undefined, () => {
      if (m.act && m.act.t < S.warn[1]) at = [h.x, h.y];
      return perils(g, 'princess:snare').length > 0;
    });
    const p = perils(g, 'princess:snare')[0];
    assert.ok(p, 'marked');
    near(m.act!.t, S.warn[1], 1.5 / 60, 'as her warning ends');
    near(Math.hypot(p.x - at[0], p.y - at[1]), 0, 0.02, 'where he stood');
    near(p.t, -(S.hit - S.warn[1]), 1.5 / 60, 'bursting a tenth of a second after her blow');
    // (it bursts: struck by its thorns, and held)
    const s = watch(g, m, 1, undefined, () => p.t >= S.burst[0] + 0.02);
    assert.equal(s.hurts.length, 1, 'struck by its thorns as it bursts');
    assert.ok(snareOf(p)!.held, 'held');
    m.moveCd = PRINCESS_ACTS.map(() => 1e9);
    m.cd = 1e9;
    return { g, m, p };
  };
  {
    // HELD IN: he walks away, and rolls, and stays inside its ring
    const { g, m, p } = setUp();
    const h = g.hero;
    let far = 0;
    watch(g, m, 2, (t, c) => {
      c.mx = 1;
      c.my = 0.3;
      if (Math.abs(t - 1) < 1 / 120) {
        c.evade = true;
        c.evadeX = h.x + 5;
        c.evadeY = h.y;
      }
      far = Math.max(far, Math.hypot(h.x - p.x, h.y - p.y));
    });
    assert.ok(far <= S.r - S.inside + 0.02, `kept within its ring (${far.toFixed(2)} of ${S.r})`);
    // STRUCK, A BLOW AT A TIME (two at once count once), then broken: it lets him go
    // (his roll's landing in it may have struck it already)
    for (let k = 1; k <= S.life && snareOf(p)!.life > 0; k++) {
      const was = snareOf(p)!.life;
      g.bosses.floorBlow(p.x + 1, p.y, 0.9, 'phys');
      g.bosses.floorBlow(p.x + 1, p.y, 0.9, 'phys');
      assert.equal(snareOf(p)!.life, was - 1, `blow ${k}: a stage of it gone`);
      watch(g, m, S.gap + 0.05);
    }
    assert.ok(snareOf(p)!.broken >= 0 && !snareOf(p)!.held, 'broken, and he is free');
    watch(g, m, 1.5, (_t, c) => {
      c.mx = 1;
    });
    assert.ok(Math.hypot(h.x - p.x, h.y - p.y) > S.r, 'he walks out');
    assert.ok(!g.perils.includes(p), 'gone, burst apart');
    void C;
  }
  {
    // LEFT ALONE: it holds until it withers, six seconds after her blow; then lets him go, and sinks
    const { g, m, p } = setUp();
    watch(g, m, 6, undefined, () => p.t >= S.sink[0] - 0.1);
    assert.ok(snareOf(p)!.held, `held still at ${p.t.toFixed(2)}`);
    watch(g, m, 1, undefined, () => p.t >= S.sink[0] + 0.02);
    assert.ok(!snareOf(p)!.held, 'let go as it withers');
    watch(g, m, 1);
    assert.ok(!g.perils.includes(p), 'sunk away');
  }
  {
    // HIS OWN BLOWS break it: he swings at the floor beside him
    const { g, m, p } = setUp();
    const h = g.hero;
    watch(g, m, 4, (_t, c) => {
      c.fire = true;
      c.aimX = h.x + 1;
      c.aimY = h.y;
    }, () => (snareOf(p)?.broken ?? 0) >= 0);
    assert.ok(snareOf(p)!.broken >= 0, `his swings broke it (${snareOf(p)!.life} left)`);
    assert.ok(snareOf(p)!.broken < S.sink[0] - 1, `sooner than it would have withered (${snareOf(p)!.broken.toFixed(2)} s)`);
  }
});

test('6. the Eleven: eleven lines across the arena, a tile and a half apart; on one as its swan passes, struck; between, not', () => {
  const E = PRINCESS.eleven;
  for (const [gap, line] of [[false, 3], [true, 3], [false, 5], [true, 7]] as const) {
    const { g, m } = room('princess', 6, 'princess:eleven');
    assert.ok(untilAct(g, m, 'princess:eleven'), 'she flings the Eleven');
    const h = g.hero;
    watch(g, m, 1, undefined, () => perils(g, 'princess:eleven').length > 0);
    const p = perils(g, 'princess:eleven')[0];
    near(m.act!.t, E.warn[0], 1.5 / 60, 'marked as her arms spread');
    const lines = linesOf(p);
    assert.equal(lines.length, E.n, 'eleven of them');
    assert.ok(Math.abs(p.fx) + Math.abs(p.fy) === 1 && p.fx * (h.x - m.x) + p.fy * (h.y - m.y) > 0, 'along the floor’s way, from her toward him');
    for (let k = 1; k < lines.length; k++) near(lines[k].v - lines[k - 1].v, E.apart, 1e-9, 'a tile and a half apart');
    assert.ok(lines.every((l) => l.u1 - l.u0 >= 14), `the length of the arena (${Math.min(...lines.map((l) => l.u1 - l.u0)).toFixed(1)} tiles at least)`);
    assert.ok(lines.some((l) => l.v === 0), 'one through him');
    // (he steps onto a line, or into the gap beside it)
    const v = lines[line].v + (gap ? E.apart / 2 : 0);
    h.x = p.x - p.fy * v;
    h.y = p.y + p.fx * v;
    const s = watch(g, m, 3, undefined, () => !g.perils.includes(p));
    if (gap) assert.equal(s.hurts.length, 0, 'in a gap: not struck');
    else {
      assert.equal(s.hurts.length, 1, 'on a line: struck once, as its swan passes');
    }
  }
  // (as its swan passes him: its own moment along the line)
  const { g, m } = room('princess', 6, 'princess:eleven');
  untilAct(g, m, 'princess:eleven');
  watch(g, m, 1, undefined, () => perils(g, 'princess:eleven').length > 0);
  const p = perils(g, 'princess:eleven')[0];
  const l = linesOf(p).find((q) => q.v === 0)!;
  const pt = p.t;
  const s = watch(g, m, 3);
  const due = -pt + l.go + (0 - l.u0) / E.speed;
  assert.equal(s.hurts.length, 1);
  near(s.hurts[0].t, due, 2.5 / 60, 'as its swan reaches him');
  assert.ok((l.u1 - l.u0) / E.speed < 1, 'the arena\'s length in under a second');
});

test('7. the Vow: its burst strikes whoever is inside; his words dark while he stands in it, back once out; not outside; it goes with her', () => {
  const V = PRINCESS.vow;
  {
    const { g, m } = room('princess', 3, 'princess:vow');
    assert.ok(untilAct(g, m, 'princess:vow'), 'she vows');
    const t0 = m.act!.t;
    const s = watch(g, m, 1.5, undefined, () => perils(g, 'princess:vow').length > 0);
    assert.equal(s.hurts.length, 1, 'struck as it bursts');
    near(s.hurts[0].t + t0, V.hit, 1.5 / 60, 'at her blow');
    const p = perils(g, 'princess:vow')[0];
    m.moveCd = PRINCESS_ACTS.map(() => 1e9);
    m.cd = 1e9;
    let dark = Infinity;
    watch(g, m, 1.5, () => {
      const h = g.hero;
      // (he stays in it, wherever she goes)
      const d = Math.hypot(h.x - m.x, h.y - m.y);
      if (d > V.r - 1) {
        h.x = m.x + ((h.x - m.x) * (V.r - 1.5)) / d;
        h.y = m.y + ((h.y - m.y) * (V.r - 1.5)) / d;
      }
      dark = Math.min(dark, g.hushT);
      assert.ok(Math.hypot(p.x - m.x, p.y - m.y) < 1e-9, 'it goes with her');
    });
    assert.ok(dark > 0, 'his words dark all the while he stands in it');
    // (out of it: his words back in a moment)
    const h = g.hero;
    const out = (): void => {
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
      h.x = m.x + ((h.x - m.x) * (V.r + 2)) / d;
      h.y = m.y + ((h.y - m.y) * (V.r + 2)) / d;
    };
    watch(g, m, V.dark + 0.2, () => out());
    assert.equal(g.hushT, 0, 'out of it, his words are back');
  }
  {
    // (outside it as it bursts: not struck, not hushed)
    const { g, m } = room('princess', 3, 'princess:vow');
    untilAct(g, m, 'princess:vow');
    const h = g.hero;
    const s = watch(g, m, 2.5, () => {
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
      h.x = m.x + ((h.x - m.x) * (V.r + 1.5)) / d;
      h.y = m.y + ((h.y - m.y) * (V.r + 1.5)) / d;
    });
    assert.equal(s.hurts.length, 0, 'outside it: not struck');
    assert.equal(g.hushT, 0, 'nor hushed');
  }
});

test('8. her steed: fifteen leaps, eight round her arena, seven at him, landing where he stood as it sprang; then it fades', () => {
  const R = PRINCESS.ride;
  const ride = (dodge: boolean): { g: Game; m: Monster; leaps: { from: [number, number]; to: [number, number]; at: number; him: [number, number]; sprung?: boolean }[]; hurts: number[]; acts: string[] } => {
    const { g, m } = room('princess', 5);
    m.moveCd = PRINCESS_ACTS.map(() => 1e9);
    lifeAt(m, 0.6);
    assert.ok(untilAct(g, m, 'princess:ride', 4), 'her second phase come: the steed forms');
    const h = g.hero;
    const home: [number, number] = [h.x, h.y];
    const leaps: { from: [number, number]; to: [number, number]; at: number; him: [number, number]; sprung?: boolean }[] = [];
    const hurts: number[] = [];
    const acts: string[] = [];
    let last = -1;
    let t = 0;
    for (let k = 0; k < 22 * 60 && (riding(m) || k === 0); k++) {
      const n = m.act ? m.act.n : -1;
      if (m.act && n !== last) {
        last = n;
        acts.push(m.act.id);
        if (m.act.id === 'princess:leap') leaps.push({ from: [m.x, m.y], to: [m.act.x, m.act.y], at: m.act.a, him: [h.x, h.y] });
      }
      // (at him: he stands; or he gets out from under it, its spring seen)
      if (m.act && m.act.id === 'princess:leap') {
        const L = leaps[leaps.length - 1];
        if (m.act.a === 1 && m.act.t > R.spring + 0.02 && !L.sprung) {
          L.sprung = true;
          L.to = [m.act.x, m.act.y];
        }
        if (dodge && m.act.a === 1 && m.act.t > R.spring + 0.1 && m.act.t < R.spring + 0.2) {
          h.x = home[0] + (leaps.length % 2 ? 3 : -3);
          h.y = home[1];
        }
        if (dodge && m.act.a === 1 && m.act.t > R.hit + 0.05) {
          h.x = home[0];
          h.y = home[1];
        }
      }
      const was = m.act && m.act.id === 'princess:leap' ? m.act.t : -1;
      const s = watch(g, m, 1 / 60);
      for (const q of s.hurts) hurts.push(t + q.t);
      t += 1 / 60;
      // (where he stood as it sprang: what its rules took)
      if (m.act && m.act.id === 'princess:leap' && m.act.a === 1 && was < R.spring && m.act.t >= R.spring) leaps[leaps.length - 1].him = [h.x, h.y];
    }
    return { g, m, leaps, hurts, acts };
  };
  const { g, m, leaps, hurts, acts } = ride(false);
  assert.equal(acts[0], 'princess:ride', 'it forms');
  assert.equal(acts[acts.length - 1], 'princess:unride', 'and fades');
  assert.equal(leaps.length, R.laps + R.atYou, 'fifteen leaps');
  assert.ok(leaps.slice(0, R.laps).every((l) => l.at === 0) && leaps.slice(R.laps).every((l) => l.at === 1), 'the first eight round, the last seven at him');
  // (round her arena: about its middle, an eighth of the way round each)
  const s = m.a1!;
  let turned = 0;
  for (let k = 0; k < R.laps; k++) {
    const l = leaps[k];
    const r = Math.hypot(l.to[0] - s.cx, l.to[1] - s.cy);
    assert.ok(r <= s.lr + 0.01 && r >= 1.5, `leap ${k + 1} lands round her arena's middle (${r.toFixed(2)} out)`);
    const a0 = Math.atan2(l.from[1] - s.cy, l.from[0] - s.cx);
    const a1 = Math.atan2(l.to[1] - s.cy, l.to[0] - s.cx);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    turned += da;
    if (k > 0) near(Math.hypot(l.to[0] - l.from[0], l.to[1] - l.from[1]), R.carry, 1.8, `leap ${k + 1}: about ${R.carry} tiles`);
  }
  near(Math.abs(turned), 2 * Math.PI, 0.6, 'a lap of her arena');
  // (at him: landing where he stood as it sprang; each lands on him, standing)
  for (const l of leaps.slice(R.laps)) near(Math.hypot(l.to[0] - l.him[0], l.to[1] - l.him[1]), 0, 0.05, 'where he stood');
  assert.ok(hurts.length >= R.atYou, `each leap at him strikes him, standing (${hurts.length} blows)`);
  assert.ok(!riding(m) && !m.dead, 'the steed faded; she hovers again');
  void g;
  // (one who gets out from under each, once it has sprung: not struck by those)
  const d = ride(true);
  const atYouFrom = d.hurts.length;
  assert.ok(atYouFrom <= R.laps, `out from under them: none of the seven strike him (${atYouFrom} blows in all)`);
  {
    // ON HER STEED SHE IS NOT BROUGHT BELOW 1: struck down to it, the steed fades first, then she falls
    const { g, m } = room('princess', 5);
    m.moveCd = PRINCESS_ACTS.map(() => 1e9);
    lifeAt(m, 0.6);
    untilAct(g, m, 'princess:ride', 4);
    watch(g, m, 3);
    assert.equal(RULES!.lifeFloor!(g.bosses, m), 1, 'kept at 1 while she rides');
    m.life = 1;
    const seen = watch(g, m, 0.1);
    assert.equal(m.act?.id, 'princess:unride', 'the steed fades at once');
    assert.ok(!m.dead && RULES!.invulnerable!(m), 'she cannot be hurt as it fades');
    const t = watch(g, m, 2, undefined, () => m.dead);
    assert.ok(m.dead, 'then she falls');
    assert.ok(t.events.some((e) => e.t === 'die' && e.kind === 'princess'), 'her death');
    void seen;
  }
});

test('9. her phases: the steed at each; more swans; more thread (the lash twice, her moves sooner); the Eleven twice in her third; the steed again', () => {
  const { g, m } = room('princess', 5);
  assert.equal(phaseIn(m), 1);
  assert.equal(swansOf(m), PRINCESS_FIGHT.swans[0], 'her swans circling her');
  m.moveCd = PRINCESS_ACTS.map(() => 1e9);
  lifeAt(m, 0.6);
  assert.ok(untilAct(g, m, 'princess:ride', 4), 'her second: the steed');
  assert.equal(phaseIn(m), 2);
  assert.ok(swansOf(m) > PRINCESS_FIGHT.swans[0], 'more swans');
  watch(g, m, 20, undefined, () => !riding(m));
  // (the lash twice in a row)
  m.moveCd = PRINCESS_ACTS.map((a) => (a.id === 'princess:lash' ? 0 : 1e9));
  m.cd = 0;
  const seen: string[] = [];
  let last = -1;
  watch(g, m, 5, () => {
    if (m.act && m.act.n !== last) {
      last = m.act.n;
      seen.push(m.act.id);
    }
  });
  assert.ok(seen.length >= 2 && seen[0] === 'princess:lash' && seen[1] === 'princess:lash', `the lash twice in a row (${seen.join(', ')})`);
  // (her moves sooner: the snare's wait)
  m.moveCd = PRINCESS_ACTS.map((a) => (a.id === 'princess:snare' ? 0 : 1e9));
  m.cd = 0;
  untilAct(g, m, 'princess:snare', 4);
  watch(g, m, 2, undefined, () => m.state !== 'act');
  near(m.moveCd[idx('princess:snare')], act('princess:snare').cooldown * PRINCESS_FIGHT.cd[1], 0.15, 'sooner in her second');
  // (her third: the steed, the most swans, the Eleven twice)
  lifeAt(m, 0.3);
  m.moveCd = PRINCESS_ACTS.map(() => 1e9);
  for (const p of [...g.perils]) p.dur = p.t;
  assert.ok(untilAct(g, m, 'princess:ride', 6), 'her third: the steed again');
  assert.equal(phaseIn(m), 3);
  assert.equal(swansOf(m), PRINCESS_FIGHT.swans[2]);
  watch(g, m, 20, undefined, () => !riding(m));
  m.moveCd = PRINCESS_ACTS.map((a) => (a.id === 'princess:eleven' ? 0 : 1e9));
  m.cd = 0;
  assert.ok(untilAct(g, m, 'princess:eleven', 6));
  watch(g, m, 1, undefined, () => perils(g, 'princess:eleven').length > 0);
  const flights = perils(g, 'princess:eleven');
  assert.equal(flights.length, 2, 'two flights of swans');
  near(Math.abs(linesOf(flights[1])[0].v - linesOf(flights[0])[0].v), PRINCESS_FIGHT.shift, 1e-9, 'the second half a gap over');
  assert.ok(flights[1].t < flights[0].t, 'and after the first');
  // (and the steed again, a while after)
  watch(g, m, 3, undefined, () => m.state !== 'act');
  m.a1!.re = PRINCESS_FIGHT.again;
  m.cd = 0;
  assert.ok(untilAct(g, m, 'princess:ride', 3), 'the steed again in her third');
});

test('10. her death: her whisper as she falls, her swans fly off, her snare withers and lets him go; nothing of hers harms him after', () => {
  for (const [id, when, far] of [['princess:lash', 0.6, 3], ['princess:snare', 1.2, 4], ['princess:eleven', 0.8, 6], ['princess:eleven', 1.4, 6], ['princess:vow', 1.2, 3]] as const) {
    const { g, m } = room('princess', far, id);
    assert.ok(untilAct(g, m, id, 4), `${id} begun`);
    watch(g, m, 2, undefined, () => !!m.act && m.act.t >= when);
    const snare = perils(g, 'princess:snare')[0];
    g.kill(m);
    const s = watch(g, m, 5);
    assert.equal(s.hurts.length, 0, `${id}, killed ${when} s in: nothing of hers harms him after`);
    if (snare && snareOf(snare)) assert.ok(!snareOf(snare)!.held && !g.perils.includes(snare), 'her snare withered, and let him go');
    const say = s.events.find((e) => e.t === 'bossSay');
    assert.ok(say && say.t === 'bossSay' && say.text === PRINCESS_WHISPER, 'her one whisper: “Stop the dancing.”');
    assert.equal(g.hushT, 0, 'his words back');
    assert.equal(g.perils.filter((p) => p.a1 && p.a1.startsWith('princess:')).length, 0, 'nothing of hers left after five seconds');
  }
  // (her swans fly off; her whisper as she sinks out of the air)
  const { g, m } = room('princess', 5);
  g.kill(m);
  const fall = perils(g, 'princess:fall')[0];
  assert.ok(fall && fall.a === swansOf(m), 'her swans fly off');
  const s = watch(g, m, 2);
  const at = s.events.findIndex((e) => e.t === 'bossSay');
  assert.ok(at >= 0, 'she whispers');
});

test('11. what she casts is drawn, never cyan; her things painted as the painter paints them', () => {
  const { g, m } = room('princess', 5);
  const { c } = fakeCtx(g);
  const draw = (layer: 'ground' | 'standing' | 'air', mm: Monster | null, p: Peril | null): { colours: Set<string>; images: number } => {
    const caught = colourCatcher();
    let images = 0;
    FX![layer]!({ ...c, g: caught.g, stand: () => void images++ }, mm, p);
    return { colours: caught.colours, images };
  };
  const ok = (what: string, col: Set<string>): void => assert.ok([...col].every((k) => !cyanish(k)), `${what}: nothing cyan (${[...col].join(' ')})`);
  // (her swans circling her, more each phase)
  assert.equal(draw('standing', m, null).images, swansOf(m), 'her swans circle her');
  // (the lash's wedge through its warning)
  m.moveCd = PRINCESS_ACTS.map((a) => (a.id === 'princess:lash' ? 0 : 1e9));
  m.cd = 0;
  untilAct(g, m, 'princess:lash');
  watch(g, m, 1, undefined, () => !!m.act && m.act.t > 0.5);
  const w = draw('ground', m, null);
  assert.ok(w.colours.size > 0, 'its wedge marked');
  ok('the wedge', w.colours);
  // (each of what she casts)
  const mk = (a1: string, more: Partial<Peril>): Peril => g.bosses.peril(m, 'act1', m.x - 2, m.y, { a1, ...more });
  const snare = mk('princess:snare', { t: -0.05, dur: 6.6 });
  assert.ok(draw('ground', null, snare).colours.size > 0, 'the snare marked');
  ok('the snare\'s mark', draw('ground', null, snare).colours);
  for (const t of [0.05, 0.15, 1, 3, 6.2]) {
    snare.t = t;
    assert.equal(draw('standing', null, snare).images, 2, `the snare at ${t}: its two halves`);
  }
  // (her swans flying off as she falls: up and away, over what stands)
  const off = mk('princess:fall', { a: 3, dur: 3.8, t: 0.6 });
  const { c: c3, drawn: d3 } = fakeCtx(g);
  FX!.air!(c3, null, off);
  assert.equal(d3.images.length, 3, 'her swans fly off');
  off.dur = 0;
  const vow = mk('princess:vow', { dur: 3.6 });
  for (const t of [0.03, 1, 3.3]) {
    vow.t = t;
    draw('ground', null, vow);
  }
  // (the Eleven, from a real one)
  const r = room('princess', 6, 'princess:eleven');
  untilAct(r.g, r.m, 'princess:eleven');
  watch(r.g, r.m, 2, undefined, () => perils(r.g, 'princess:eleven').some((p) => p.t > 0.2));
  const e = perils(r.g, 'princess:eleven')[0];
  const f = draw('ground', null, e);
  assert.ok(f.colours.size > 0, 'its feathers');
  ok('the feathers', f.colours);
  assert.ok(draw('standing', null, e).images > 0, 'its swans diving');
  // (the snare's bar, from a real one)
  const q = room('princess', 4, 'princess:snare');
  untilAct(q.g, q.m, 'princess:snare');
  watch(q.g, q.m, 2, undefined, () => perils(q.g, 'princess:snare').some((p) => p.t > 0.5));
  const bar = draw('air', null, perils(q.g, 'princess:snare')[0]);
  assert.ok(bar.colours.size > 0, 'its life, a bar under it');
  ok('its bar', bar.colours);
  // (her things as the painter makes them: every frame the effects ask for is one of them)
  const things = princessThings();
  assert.equal(things.snareFar.length, snareShots().length);
  assert.equal(things.vow.length, vowShots().length);
  for (let t = 0; t < 6.6; t += 0.05) for (const hp of Array.from({ length: SNARE_STAGES }, (_, k) => (SNARE_STAGES - k) / SNARE_STAGES)) {
    const i = snareFrameAt(t, hp);
    assert.ok(i >= 0 && i < things.snareFar.length, `a snare's frame at ${t.toFixed(2)}`);
  }
  for (let t = 0; t < VOW_FX.hold + VOW_FX.fade; t += 0.05) assert.ok(vowFrameAt(t) >= 0 && vowFrameAt(t) < things.vow.length);
  assert.ok(SNARE_FRAMES.hold > 0);
});

test('12. a long fight on a stand-in floor (floor 9\'s clearing): no exceptions, every move made, her steed and her phases', () => {
  const { g, m } = standIn(2);
  const h = g.hero;
  const gr = princessGround(g.level, m.x, m.y);
  assert.ok(gr.n > 200, `her ground about 17 by 20 tiles (${gr.n})`);
  const sp = g.spotsRound(m.x, m.y, 60).find((q) => Math.hypot(q.x - m.x, q.y - m.y) > 4 && g.sees(q.x, q.y, m.x, m.y))!;
  h.x = sp.x;
  h.y = sp.y;
  const acts = new Set<string>();
  const c = emptyControls();
  for (let k = 0; k < 120 * 60; k++) {
    const t = k / 60;
    Object.assign(c, emptyControls());
    if (Math.floor(t / 2.5) % 2 === 0) {
      c.mx = Math.cos(t * 0.9);
      c.my = Math.sin(t * 0.9);
    } else {
      c.fire = true;
      c.aimX = m.x;
      c.aimY = m.y;
    }
    if (k % 211 === 90) {
      c.evade = true;
      c.evadeX = h.x - h.fx * 3;
      c.evadeY = h.y - h.fy * 3;
    }
    if (k === 30 * 60) m.life = Math.min(m.life, Math.floor(m.maxLife * 0.6));
    if (k === 70 * 60) m.life = Math.min(m.life, Math.floor(m.maxLife * 0.3));
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    if (m.act) acts.add(m.act.id);
    g.events.length = 0;
    if (g.over || m.dead) break;
  }
  for (const a of PRINCESS_ACTS) assert.ok(acts.has(a.id), `she made her ${a.id} (made: ${[...acts].join(', ')})`);
  assert.ok(phaseIn(m) === 3 || m.dead, 'her third phase come');
  void TUNE;
});
