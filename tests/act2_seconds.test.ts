// ACT 2, THE HUSH, VERSION 23.2: THE FIVE MEDIUM KINDS' SECOND ATTACKS, the art chat's (mockup/act2-seconds,
// docs/mockups/act2_seconds/README.md), put in the game's rules by the main chat on his word of 19 Oct 2026, 20:54 Pacific:
// "Second attacks are done". His rule of 9 Oct (his rulebook, "Their attacks"): a medium monster two attacks, a basic blow
// first, the bigger hit cooling down longer.
//   1. each is built: its act after the basic blow, cooling down longer and hitting harder; its clip in the kind's pictures,
//      as long as the act, its blow where the act's is; the rules' numbers the art's own
//   2. the orderlies' quake strikes all round where the mallet goes in, as it goes in, and throws him; not out past its ring
//   3. the carters' driver's lash cracks three times, further out each time: struck where a crack falls, not beyond the last
//   4. the dredgers' cast net falls three tiles out: struck and held under it; not in close
//   5. the watch's round sweep comes all the way round: struck before them and behind them; not beyond its reach
//   6. the Bookwardens' page storm pours out across a fan before them: struck in it; not behind them, nor off to the side

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { act1Fig } from '../src/art/act1_figs/index';
import { STORM_FROM, STORM_HALF, STORM_REACH, STORM_SPEED } from '../src/art/bookwarden_shots';
import { WB_STORM } from '../src/art/bookwardens_moves';
import { CT_LASHES } from '../src/art/carters_moves';
import { NET_FLIES, NET_LIES, NET_R, NET_REACH } from '../src/art/dredger_shots';
import { DR_NET } from '../src/art/dredgers_moves';
import { WA_ROUND, roundBladeAt } from '../src/art/hushed_watch_moves';
import { OD_QUAKE } from '../src/art/orderlies_moves';
import { QUAKE_CRACKS_FOR, QUAKE_REACH } from '../src/art/orderly_shots';
import { ROUND_REACH } from '../src/art/watch_shots';
import { LASH_CRACK_FOR, lashSpots } from '../src/art/carter_shots';
import { BOOKWARDEN } from '../src/game/act1_rules/bookwarden';
import { CARTER, crackSpot } from '../src/game/act1_rules/carter';
import { DREDGER } from '../src/game/act1_rules/dredger';
import { act1Rules } from '../src/game/act1_rules/index';
import { ORDERLY } from '../src/game/act1_rules/orderly';
import { ROUND, roundAt } from '../src/game/act1_rules/watch';
import type { MonsterKind } from '../src/game/types';
import { firstHurt, room, watch } from './act1_kinds_room';
import { fakeDocument } from './act1_kinds_room';
import { paintWithoutCanvas } from './helpers';
// (the effects last: they reach the rules through the game's own way in)
import { lashesWarnFrom } from '../src/render/act1_fx/carter';
import { mirrorFor } from '../src/render/act1_fx/watch';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();
fakeDocument();

const SECONDS: ReadonlyArray<[MonsterKind, string, string]> = [
  ['orderly', 'orderly:quake', 'quake'],
  ['carter', 'carter:lashes', 'lashes'],
  ['dredger', 'dredger:net', 'net'],
  ['watch', 'watch:round', 'round'],
  ['bookwarden', 'bookwarden:storm', 'storm'],
];

/** The kind's act by its id, and its place among the kind's acts. */
function actOf(kind: MonsterKind, id: string): { a: NonNullable<ReturnType<typeof act1Rules>>['acts'][number]; i: number } {
  const acts = act1Rules(kind)!.acts;
  const i = acts.findIndex((x) => x.id === id);
  assert.ok(i >= 0, `${kind}: ${id} is one of its acts`);
  return { a: acts[i], i };
}

test('1. each is built: its act after the basic blow, cooling down longer and hitting harder; its clip as long as the act; the numbers the art\'s', () => {
  for (const [kind, id, clip] of SECONDS) {
    const acts = act1Rules(kind)!.acts;
    assert.equal(acts.length, 2, `${kind}: two attacks, his rule`);
    const { a, i } = actOf(kind, id);
    assert.equal(i, 1, `${kind}: its second after its basic blow`);
    assert.ok(a.cooldown > acts[0].cooldown && a.dmg > acts[0].dmg, `${kind}: it cools down longer and hits harder than its basic blow`);
    assert.equal(a.clip, clip, `${kind}: its picture's move by name`);
    const art = act1Fig(kind)!.make();
    for (const set of [art.front, art.back]) {
      const c = set.clips?.moves?.[clip];
      assert.ok(c && c.frames.length > 0, `${kind}: its ${clip} painted`);
      near((c!.frames.length - 1) / c!.fps, a.long, 1.5 / c!.fps, `${kind}: its ${clip} as long as the act`);
      if (c!.hit !== undefined) near(c!.hit, a.hit, 1e-9, `${kind}: its ${clip}'s blow is the act's`);
    }
  }
  // (the rules' numbers, written down, are the art's own)
  near(ORDERLY.quake.long, OD_QUAKE.long, 1e-9, 'the quake: its length');
  near(ORDERLY.quake.hit, OD_QUAKE.hit, 1e-9, 'the quake: its blow');
  near(ORDERLY.quake.floor, OD_QUAKE.floor, 1e-9, 'the quake: in the floor');
  near(ORDERLY.quake.r, QUAKE_REACH, 1e-9, 'the quake: its ring');
  near(ORDERLY.quake.mark, QUAKE_CRACKS_FOR, 1e-9, 'the quake: its cracks lie');
  near(CARTER.lashes.long, CT_LASHES.long, 1e-9, 'the driver\'s lash: its length');
  CT_LASHES.cracks.forEach((T, k) => near(CARTER.lashes.cracks[k], T, 1e-9, `the driver's lash: crack ${k + 1}`));
  CT_LASHES.reach.forEach((r, k) => near(CARTER.lashes.reach[k], r, 0.06, `the driver's lash: crack ${k + 1}'s reach`));
  near(CARTER.lashes.mark, LASH_CRACK_FOR, 1e-9, 'the driver\'s lash: its marks lie');
  // (the round sweep's wake drawn the other way round for one drawn the other way round: a point at the figure's left, bearing
  // b, turned over to its right, the way it faces kept)
  {
    const id = (x: number, y: number) => [x, y] as const;
    const m = { x: 5, y: 7, fx: 0.6, fy: 0.8 };
    const f = mirrorFor(id, m, -1);
    const ahead = f(m.x + m.fx * 2, m.y + m.fy * 2);
    near(ahead[0], m.x + m.fx * 2, 1e-9, 'the wake turned over: ahead stays ahead (x)');
    near(ahead[1], m.y + m.fy * 2, 1e-9, 'the wake turned over: ahead stays ahead (y)');
    const left = f(m.x + m.fy, m.y - m.fx);
    near(left[0], m.x - m.fy, 1e-9, 'the wake turned over: left goes right (x)');
    near(left[1], m.y + m.fx, 1e-9, 'the wake turned over: left goes right (y)');
    assert.equal(mirrorFor(id, m, 1), id, 'the wake drawn as made for one drawn as made');
  }
  // (its warning's rings where its cracks fall, drawn either way round)
  for (const hand of [1, -1]) {
    for (const [fx, fy] of [[1, 0], [0, 1], [-0.6, 0.8]] as const) {
      const m = { x: 10, y: 10, fx, fy };
      const o = lashesWarnFrom(m, hand);
      lashSpots(o.x, o.y, fx, fy).forEach(([x, y], k) => {
        const s = crackSpot(m, hand, k);
        assert.ok(Math.hypot(x - s.x, y - s.y) <= 0.08, `the driver's lash drawn with hand ${hand}, facing ${fx}, ${fy}: its warning's ring ${k + 1} where it cracks`);
      });
    }
  }
  near(DREDGER.net.long, DR_NET.long, 1e-9, 'the net: its length');
  near(DREDGER.net.hit, DR_NET.hit, 1e-9, 'the net: let go of');
  near(DREDGER.net.flies, NET_FLIES, 1e-9, 'the net: its flight');
  near(DREDGER.net.reach, NET_REACH, 1e-9, 'the net: where it falls');
  near(DREDGER.net.r, NET_R, 1e-9, 'the net: its width');
  near(DREDGER.net.lies, NET_LIES, 1e-9, 'the net: it lies');
  near(ROUND.long, WA_ROUND.long, 1e-9, 'the round sweep: its length');
  near(ROUND.hit, WA_ROUND.hit, 1e-9, 'the round sweep: its blow');
  // (the blade's bearing frame by frame is the art's roundBladeAt; its reach the README's measure of the top spike, which the
  // warning's ring round them is drawn at (ROUND_REACH): roundBladeAt's own reach is the blade's tip, nearer in)
  for (const [t] of ROUND.at) {
    near(roundAt(t).bearing, roundBladeAt(t).bearing, 0.01, `the round sweep at ${t.toFixed(3)} s: the blade's bearing`);
    assert.ok(roundAt(t).reach >= roundBladeAt(t).reach && roundAt(t).reach <= ROUND_REACH + 0.1, `the round sweep at ${t.toFixed(3)} s: its reach ${roundAt(t).reach}, out to the spike and no further than its ring`);
  }
  near(BOOKWARDEN.storm.long, WB_STORM.long, 1e-9, 'the page storm: its length');
  near(BOOKWARDEN.storm.hit, WB_STORM.hit, 1e-9, 'the page storm: its blow');
  near(BOOKWARDEN.storm.pour[0], WB_STORM.pour[0], 1e-9, 'the page storm: its pour');
  near(BOOKWARDEN.storm.reach, STORM_REACH, 1e-9, 'the page storm: its reach');
  near(BOOKWARDEN.storm.half, STORM_HALF, 1e-9, 'the page storm: its fan');
  near(BOOKWARDEN.storm.from, STORM_FROM, 1e-9, 'the page storm: from');
  near(BOOKWARDEN.storm.speed, STORM_SPEED, 1e-9, 'the page storm: its speed');
});

/** Its second move made at once, the hero set at (dx, dy) from it (it facing +x); what it does to him in `secs`. */
function made(kind: MonsterKind, id: string, dx: number, dy: number, secs: number): ReturnType<typeof watch> & { held: boolean; knocked: boolean } {
  const { g, m } = room(kind, 1.5, id as never);
  const { i } = actOf(kind, id);
  g.bosses.startAct(m, act1Rules(kind)!.acts, i);
  g.hero.x = m.x + dx;
  g.hero.y = m.y + dy;
  let held = false;
  let knocked = false;
  const s = watch(g, m, secs, undefined, () => {
    if (g.hero.held && g.hero.held > 0) held = true;
    if (g.hero.step) knocked = true;
    return false;
  });
  return { ...s, held, knocked };
}

test('2. the orderlies\' quake strikes all round where the mallet goes in, as it goes in, and throws him; not out past its ring', () => {
  for (const [dx, dy] of [[1.5, 0], [2.6, 1.0], [0.4, -1.2]] as const) {
    const s = made('orderly', 'orderly:quake', dx, dy, 2.6);
    assert.equal(s.hurts.length, 1, `at ${dx}, ${dy}: struck once`);
    near(firstHurt(s) - s.began, ORDERLY.quake.floor, 0.05, `at ${dx}, ${dy}: as the mallet goes in`);
    assert.ok(s.knocked, `at ${dx}, ${dy}: thrown`);
  }
  for (const [dx, dy] of [[-2.0, 0], [4.2, 0], [1.5, 2.8]] as const) assert.equal(made('orderly', 'orderly:quake', dx, dy, 2.6).hurts.length, 0, `at ${dx}, ${dy}: out past its ring`);
});

test('3. the carters\' driver\'s lash cracks three times, further out each time: struck where a crack falls, not beyond the last', () => {
  CARTER.lashes.reach.forEach((r, k) => {
    const s = made('carter', 'carter:lashes', r, 0, 3.0);
    assert.equal(s.hurts.length, 1, `on crack ${k + 1}'s spot: struck once`);
    near(firstHurt(s) - s.began, CARTER.lashes.cracks[k] + CARTER.lashes.floor, 0.05, `on crack ${k + 1}'s spot: as it cracks there`);
  });
  for (const [dx, dy] of [[3.3, 0], [1.6, 1.2], [-1.0, 0]] as const) assert.equal(made('carter', 'carter:lashes', dx, dy, 3.0).hurts.length, 0, `at ${dx}, ${dy}: no crack falls there`);
});

test('4. the dredgers\' cast net falls three tiles out: struck and held under it; not in close', () => {
  const s = made('dredger', 'dredger:net', DREDGER.net.reach, 0.3, 2.4);
  assert.equal(s.hurts.length, 1, 'under it: struck once');
  near(firstHurt(s) - s.began, DREDGER.net.hit + DREDGER.net.flies, 0.05, 'as it falls');
  assert.ok(s.held, 'and held in it');
  assert.ok(s.events.some((e) => e.t === 'text' && (e as { text: string }).text === 'Netted'), 'he is told');
  for (const [dx, dy] of [[1.0, 0], [3.0, 1.6], [-2.0, 0]] as const) assert.equal(made('dredger', 'dredger:net', dx, dy, 2.4).hurts.length, 0, `at ${dx}, ${dy}: the net falls elsewhere`);
});

test('5. the watch\'s round sweep comes all the way round: struck before them and behind them; not beyond its reach', () => {
  for (const [dx, dy, what] of [[2.0, 0, 'before them'], [-2.0, 0, 'behind them'], [0, 1.8, 'to one side'], [0, -1.8, 'to the other']] as const) {
    const s = made('watch', 'watch:round', dx, dy, 2.6);
    assert.equal(s.hurts.length, 1, `${what}: struck once`);
    assert.ok(firstHurt(s) - s.began >= ROUND.from - 0.05 && firstHurt(s) - s.began <= ROUND.to + 0.05, `${what}: as the blade comes round`);
  }
  assert.equal(made('watch', 'watch:round', 3.4, 0, 2.6).hurts.length, 0, 'beyond its reach, it misses');
});

test('6. the Bookwardens\' page storm pours out across a fan before them: struck in it; not behind them, nor off to the side', () => {
  for (const d of [1.4, 2.4, 3.2]) {
    const s = made('bookwarden', 'bookwarden:storm', d, 0, 2.8);
    assert.equal(s.hurts.length, 1, `${d} tiles before them: struck once`);
    const front = BOOKWARDEN.storm.pour[0] + Math.max(0, d - BOOKWARDEN.storm.from) / BOOKWARDEN.storm.speed;
    near(firstHurt(s) - s.began, front, 0.1, `${d} tiles before them: as the pages reach him`);
  }
  for (const [dx, dy, what] of [[-1.5, 0, 'behind them'], [0.6, 2.0, 'off to the side'], [4.0, 0, 'beyond it']] as const) {
    assert.equal(made('bookwarden', 'bookwarden:storm', dx, dy, 2.8).hurts.length, 0, `${what}: not struck`);
  }
});
