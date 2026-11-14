// FLOOR 9'S TWO SIDE BOSSES IN PLAY (game/act1_rules/f9_bosses.ts, art/f9_bosses_art.ts, render/act1_fx/f9_bosses.ts; behind
// game/f9_lairs.ts F9_LAIRS, off; docs/mockups/f9_side_bosses/README.md): the troll chieftain in his camp and the mist wolf in its glade,
// each carrying its piece of the ward-stone; each move ending as it stands (the ground it covers covered by the rules); every blow
// landing where and when its picture's does, and not beside it; their pictures in the enemy's colours, never cyan.
// @ts-ignore
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CHIEF_STAND, CK, WK, WOLF_STAND } from '../src/art/f9_bosses_sculpt';
import { CHIEF_MOVES, CHIEF_PLAY, LUNGE_LONG, RUSH_LONG, TILE3, WOLF_MOVES, WOLF_PLAY, chiefCarry, chiefDie, chiefInPlay, chiefWalk, wolfCarry, wolfDie, wolfInPlay, wolfWalk } from '../src/art/f9_bosses_moves';
import type { ChiefMove, WolfMove } from '../src/art/f9_bosses_moves';
import { BITE_RING, CHIEF_LANDS, CLAW_SWEEP, SLAM_CRACK } from '../src/art/f9_bosses_fx';
import { makeMistWolfArt, makeWarchiefArt } from '../src/art/f9_bosses_art';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Rules } from '../src/game/act1_rules/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { F9_TUNE, RULES_CHIEF, RULES_WOLF, raging } from '../src/game/act1_rules/f9_bosses';
import { F9_LAIRS } from '../src/game/f9_lairs';
import { blobDist } from '../src/game/act1_layout';
import { Game } from '../src/game/game';
import { MONSTERS } from '../src/game/defs';
import type { Monster } from '../src/game/state';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';
import { cyanIn, room, watch } from './act1_kinds_room';

paintWithoutCanvas();

const near = (a: number, b: number, by: number, what: string): void => assert.ok(Math.abs(a - b) <= by, `${what}: ${a.toFixed(3)} (want ${b.toFixed(3)} ± ${by})`);
const off = (a: readonly number[], b: readonly number[]): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const floor9 = (seed: number, on: boolean, quest = false): Game => {
  const was = F9_LAIRS.on;
  F9_LAIRS.on = on;
  try {
    const g = new Game('warrior', seed);
    g.depth = 9;
    g.cleared = 8;
    g.wayDepth = 9;
    if (quest) {
      g.hero.feather = 'given';
      g.hero.pieces = 0;
    }
    g.enterDungeon();
    return g;
  } finally {
    F9_LAIRS.on = was;
  }
};

test('1. built and registered: their rules, their pictures with every clip their acts name, what they draw; off until his yes', () => {
  assert.equal(F9_LAIRS.on, false, 'behind F9_LAIRS, off');
  for (const [kind, rules] of [['warchief', RULES_CHIEF], ['mistwolf', RULES_WOLF]] as const) {
    assert.ok(act1Rules(kind) === rules && rules, `${kind}: its rules`);
    assert.ok(act1Fig(kind)?.heavy, `${kind}: its pictures, painted for its floor`);
    assert.ok(act1Fx(kind)?.ground && act1Fx(kind)?.air, `${kind}: what it draws`);
    assert.equal(MONSTERS[kind].size, 'boss', `${kind}: a boss`);
  }
  for (const [kind, art, M] of [['warchief', makeWarchiefArt(), CHIEF_MOVES], ['mistwolf', makeMistWolfArt(), WOLF_MOVES]] as const) {
    for (const view of ['front', 'back'] as const) {
      const set = art[view];
      for (const a of act1Rules(kind)!.acts) {
        const clip = a.clip === 'attack' ? set.clips!.attack : set.clips!.moves![a.clip];
        assert.ok(clip, `${kind}, ${view}: ${a.id}'s clip`);
        const long = (M as Record<string, { long: number }>)[a.id.split(':')[1]].long;
        assert.equal(clip!.frames.length, Math.round(long * 30) + 1, `${kind}, ${view}: ${a.id}, a frame each thirtieth of its ${long} s`);
        near(clip!.hit!, a.hit, 1e-9, `${kind}, ${view}: ${a.id} lands as its picture does`);
        near(a.long, long, 1e-9, `${kind}: ${a.id} as long as its picture`);
      }
      assert.ok(set.clips!.die!.frames.length > 40 && set.clips!.reel!.frames.length >= 9, `${kind}, ${view}: its death and its flinch`);
    }
  }
});

test('2. ON: the troll chieftain before his seat in his camp, the mist wolf on the moonbeam in its glade; each as hard as a floor\'s boss for the floor, not its boss; off, neither', () => {
  for (const seed of [9, 4, 17]) {
    assert.ok(!floor9(seed, false).monsters.some((m) => m.kind === 'warchief' || m.kind === 'mistwolf'), `seed ${seed}, off: neither`);
    const g = floor9(seed, true);
    const land = g.level.land!;
    const lair = land.areas.find((a) => a.role === 'lair')!;
    const side = land.areas.find((a) => a.role === 'side')!;
    const chief = g.monsters.filter((m) => m.kind === 'warchief');
    const wolf = g.monsters.filter((m) => m.kind === 'mistwolf');
    assert.equal(chief.length, 1, `seed ${seed}: one troll chieftain`);
    assert.equal(wolf.length, 1, `seed ${seed}: one mist wolf`);
    assert.ok(blobDist(lair.blob, chief[0].x, chief[0].y) < 1, `seed ${seed}: the chieftain in his camp`);
    assert.ok(blobDist(side.blob, wolf[0].x, wolf[0].y) < 1, `seed ${seed}: the wolf in its glade`);
    const seat = g.level.props.find((p) => p.name === "the chieftain's seat")!;
    assert.ok(Math.hypot(chief[0].x - (seat.tx + 1), chief[0].y - (seat.ty + 1)) < 4.5, `seed ${seed}: before his seat`);
    const beam = g.level.props.find((p) => p.name === 'the moonbeam')!;
    assert.ok(Math.hypot(wolf[0].x - beam.x, wolf[0].y - beam.y) < 2, `seed ${seed}: on the moonbeam`);
    for (const m of [chief[0], wolf[0]]) {
      assert.ok(!m.boss && m.elite, `seed ${seed}, ${m.kind}: not the floor's boss; marked`);
      assert.ok(m.maxLife >= MONSTERS[m.kind].life, `seed ${seed}, ${m.kind}: its life grown with the floor (${m.maxLife})`);
    }
  }
});

test('3. each carries its area\'s piece of the ward-stone where the quest wants it: the wolf the glade\'s, the chieftain the camp\'s; the Stag his', () => {
  for (const seed of [9, 4]) {
    const g = floor9(seed, true, true);
    const chief = g.monsters.find((m) => m.kind === 'warchief')!;
    const wolf = g.monsters.find((m) => m.kind === 'mistwolf')!;
    assert.equal(wolf.piece, 0, `seed ${seed}: the wolf carries the side area's piece`);
    assert.equal(chief.piece, 1, `seed ${seed}: the chieftain carries the lair's piece`);
    assert.ok(!g.drops.some((d) => d.kind === 'piece'), `seed ${seed}: none lying about`);
    assert.ok(!g.monsters.some((m) => m.piece !== undefined && m !== chief && m !== wolf && m.kind !== 'stag'), `seed ${seed}: no guard carries one`);
  }
});

test('4. each move ends as it stands, over the floor point the rules carried it to; its walk goes round, its feet gripping the floor', () => {
  for (const mv of Object.keys(CHIEF_MOVES) as ChiefMove[]) {
    const p = chiefInPlay(mv, CHIEF_MOVES[mv].long);
    for (const k of ['hip', 'footL', 'footR', 'fistR', 'fistL', 'clubEnd'] as const) assert.ok(off(p[k], CHIEF_STAND[k]) < 1.6, `the chieftain's ${mv}: his ${k} ends as he stands (${off(p[k], CHIEF_STAND[k]).toFixed(2)} off)`);
  }
  for (const mv of Object.keys(WOLF_MOVES) as WolfMove[]) {
    const p = wolfInPlay(mv, WOLF_MOVES[mv].long);
    for (const k of ['root', 'pawFL', 'pawFR', 'pawHL', 'pawHR'] as const) assert.ok(off(p[k], WOLF_STAND[k]) < 1.6, `the wolf's ${mv}: its ${k} ends as it stands (${off(p[k], WOLF_STAND[k]).toFixed(2)} off)`);
  }
  // (the ground covered: the rush and the lunge carry them on past where the hero stood, the bite and the slam a little)
  near(chiefCarry('rush', CHIEF_MOVES.rush.long), RUSH_LONG + 10, 0.5, 'the bull rush: on past where he was aimed, his own lengths');
  near(wolfCarry('lunge', WOLF_MOVES.lunge.long), LUNGE_LONG, 0.5, 'the lunge: through and on past, its own lengths');
  // (their walks: round, and a foot that is down goes back under them as fast as they go on)
  for (const [who, walk, W, K, feet] of [['the chieftain', chiefWalk, CHIEF_PLAY.walk, CK, ['footL', 'footR']], ['the wolf', wolfWalk, WOLF_PLAY.walk, WK, ['pawFL', 'pawFR', 'pawHL', 'pawHR']]] as const) {
    const L = W.frames / W.fps;
    const a = walk(0) as unknown as Record<string, number[]>;
    const b = walk(L) as unknown as Record<string, number[]>;
    for (const f of feet) assert.ok(off(a[f], b[f]) < 1e-6, `${who}'s walk goes round (${f})`);
    const dt = 1 / 120;
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * L;
      const p = walk(t) as unknown as Record<string, number[]>;
      const q = walk(t + dt) as unknown as Record<string, number[]>;
      for (const f of feet) {
        const floorZ = f.startsWith('paw') ? 3 : 5;
        if (Math.abs(p[f][2] - floorZ) > 1e-6 || Math.abs(q[f][2] - floorZ) > 1e-6) continue;
        near(((p[f][0] - q[f][0]) / dt) * (K / TILE3), W.pace, 0.02, `${who}'s ${f} down at ${t.toFixed(2)} s grips the floor`);
      }
    }
  }
  // (their deaths: he is stone, it is gone)
  assert.equal(chiefDie(CHIEF_PLAY.dies).stone, 1, 'the chieftain stone at the last');
  assert.equal(wolfDie(WOLF_PLAY.dies).gone, 1, 'the wolf gone at the last');
});

/** Where the hero stands for a spot of the boss's own lengths (forward, to its left) before it, facing +x as `room` has it: in tiles from it. */
const before = (m: Monster, k: number, f: number, l: number): { x: number; y: number } => ({ x: m.x + (f * k) / TILE3, y: m.y - (l * k) / TILE3 });
const act = (rules: NonNullable<typeof RULES_CHIEF>, id: string): number => rules.acts.findIndex((a) => a.id === id);
const start = (g: Game, m: Monster, rules: NonNullable<typeof RULES_CHIEF>, id: string): void => {
  m.moveCd = rules.acts.map(() => 1e9);
  m.cd = 1e9;
  g.bosses.startAct(m, rules.acts, act(rules, id));
};

test('5. the chieftain\'s blows: the smash on its ring, the slam\'s crack as it reaches you, the rush into you, the roar round him; each once, and not beside', () => {
  const C = RULES_CHIEF!;
  {
    // (the smash: on its ring, struck once, as the club lands; the game held still and the screen kicked)
    const { g, m } = room('warchief', 2, 'warchief:smash');
    start(g, m, C, 'warchief:smash');
    const p = before(m, CK, CHIEF_LANDS.smash[0], CHIEF_LANDS.smash[1]);
    g.hero.x = p.x;
    g.hero.y = p.y;
    const s = watch(g, m, 3);
    assert.equal(s.hurts.length, 1, 'on the smash\'s ring: struck once');
    near(s.hurts[0].t, CHIEF_MOVES.smash.beats[0].at, 0.05, 'as the club lands');
    assert.ok(s.events.some((e) => e.t === 'shake' && (e as { hold?: number }).hold), 'the game held still a moment as it lands');
  }
  {
    const { g, m } = room('warchief', 2, 'warchief:smash');
    start(g, m, C, 'warchief:smash');
    const p = before(m, CK, CHIEF_LANDS.smash[0], CHIEF_LANDS.smash[1] + 70);
    g.hero.x = p.x;
    g.hero.y = p.y;
    assert.equal(watch(g, m, 3).hurts.length, 0, 'beside the ring: not struck');
  }
  {
    // (the slam: far along the lane, struck once, after it lands, as the crack reaches him; beside the lane, not)
    for (const [l, n] of [[0, 1], [70, 0]] as const) {
      const { g, m } = room('warchief', 3, 'warchief:slam');
      start(g, m, C, 'warchief:slam');
      const f = CHIEF_LANDS.slam[0] + SLAM_CRACK.long * 0.8;
      const p = before(m, CK, f + 11, CHIEF_LANDS.slam[1] + l);
      g.hero.x = p.x;
      g.hero.y = p.y;
      const s = watch(g, m, 3);
      assert.equal(s.hurts.length, n, `the slam's crack, ${l ? 'beside it' : 'along it'}`);
      if (n) assert.ok(s.hurts[0].t > CHIEF_MOVES.slam.beats[0].at + 0.12, `struck as the crack reaches him, not as it lands (${s.hurts[0].t.toFixed(2)})`);
    }
  }
  {
    // (the bull rush: whoever he runs into, once; he ends on past him)
    const { g, m } = room('warchief', 4, 'warchief:rush');
    start(g, m, C, 'warchief:rush');
    const x0 = m.x;
    const s = watch(g, m, 2.7);
    assert.equal(s.hurts.length, 1, 'run into: struck once');
    assert.ok(s.hurts[0].t > 1.15 && s.hurts[0].t < 1.5, `as he runs (${s.hurts[0].t.toFixed(2)})`);
    assert.ok(m.x - x0 > 3, `carried on down the lane (${(m.x - x0).toFixed(2)} tiles)`);
  }
  {
    // (the war cry: struck by the roar near him; then the rage: quicker, faster, for its while)
    const { g, m } = room('warchief', 1.6, 'warchief:warcry');
    const base = m.speed;
    start(g, m, C, 'warchief:warcry');
    const s = watch(g, m, 3.4);
    assert.equal(s.hurts.length, 1, 'the roar: struck once');
    assert.ok(raging(m), 'enraged after');
    watch(g, m, 0.1);
    near(m.speed, base * F9_TUNE.rage.fast, 1e-6, 'his feet faster');
    start(g, m, C, 'warchief:smash');
    near(m.act!.rate ?? 1, F9_TUNE.rage.quick, 1e-9, 'his blows quicker');
    watch(g, m, F9_TUNE.rage.lasts + 1);
    assert.ok(!raging(m), 'the rage over in its while');
    near(m.speed, base, 1e-6, 'his feet as they were');
  }
});

test('6. the wolf\'s: the bite in its ring, the claw\'s three rakes across its arc, the lunge through you (nothing reaching it as mist), the cloud\'s claws again and again, the howl\'s wolves', () => {
  const W = RULES_WOLF!;
  {
    const { g, m } = room('mistwolf', 1.5, 'mistwolf:bite');
    start(g, m, W, 'mistwolf:bite');
    const p = before(m, WK, BITE_RING.f, 0);
    g.hero.x = p.x;
    g.hero.y = p.y;
    const s = watch(g, m, 1.5);
    assert.equal(s.hurts.length, 1, 'the bite: once');
    near(s.hurts[0].t, WOLF_MOVES.bite.beats[0].at, 0.05, 'as its jaws shut');
  }
  {
    for (const [f, l, n] of [[CLAW_SWEEP.f + 55, 20, 1], [-30, 0, 0]] as const) {
      const { g, m } = room('mistwolf', 1.5, 'mistwolf:claw');
      start(g, m, W, 'mistwolf:claw');
      const p = before(m, WK, f, l);
      g.hero.x = p.x;
      g.hero.y = p.y;
      assert.equal(watch(g, m, 2.0).hurts.length, n * 3, `the claw, ${n ? 'across its arc: its three rakes' : 'behind it'}`);
    }
  }
  {
    const { g, m } = room('mistwolf', 1.8, 'mistwolf:lunge');
    start(g, m, W, 'mistwolf:lunge');
    let unreached = false;
    const s = watch(g, m, 1.8, (t) => {
      if (t > 0.72 && t < 0.8 && W.reachable && !W.reachable(m)) unreached = true;
      return null;
    });
    assert.equal(s.hurts.length, 1, 'the lunge: struck once as it passes through');
    assert.ok(m.x > g.hero.x, 'it ends beyond him');
    assert.ok(unreached, 'nothing reaches it while it is mist');
  }
  {
    const { g, m } = room('mistwolf', 1.2, 'mistwolf:cloud');
    start(g, m, W, 'mistwolf:cloud');
    const s = watch(g, m, 3.3);
    assert.equal(s.hurts.length, 4, 'in its cloud: its claws four times');
  }
  {
    const { g, m } = room('mistwolf', 3, 'mistwolf:howl');
    start(g, m, W, 'mistwolf:howl');
    watch(g, m, 3.1);
    const called = g.monsters.filter((o) => !o.dead && o.kind === 'wolf' && o.packId === m.packId);
    assert.equal(called.length, 2, 'two wolves out of the mist');
    const o = g.spawn('wolf', m.x, m.y + 1, m.packId, 0, false, g.rng);
    assert.ok(o && !W.can!(g.bosses, m, W.acts[act(W, 'mistwolf:howl')], 3, true), 'no howl while three are about');
  }
});

test('7. their pictures: in the enemy\'s colours, never cyan, their edge of light while they live; the smash smeared; he dies to stone, it to nothing', () => {
  const pixels = (s: Sprite): { n: number; rim: number; flame: number } => {
    const p = paintingOf(s);
    let n = 0;
    let rim = 0;
    let flame = 0;
    for (let i = 0; i < p.d.length; i += 4) {
      if (!p.d[i + 3]) continue;
      n++;
      const [r, g, b] = [p.d[i], p.d[i + 1], p.d[i + 2]];
      if (r > 200 && g < 120 && b > 80 && b < 160) rim++;
      if (r > 230 && g > 150 && b < 140) flame++;
    }
    return { n, rim, flame };
  };
  const chief = makeWarchiefArt();
  const wolf = makeMistWolfArt();
  for (const view of ['front', 'back'] as const) {
    for (const [who, s, least] of [['the chieftain', chief[view].idle[0], 3000], ['the wolf', wolf[view].idle[0], 1500]] as const) {
      const f = pixels(s);
      assert.ok(f.n > least && f.rim > 30, `${who}, ${view}, standing: ${f.n} pixels, ${f.rim} of its edge`);
      assert.equal(cyanIn(s), 0, `${who}, ${view}: nothing cyan`);
    }
  }
  const hitAt = Math.round(CHIEF_MOVES.smash.beats[0].at * 30);
  const strike = pixels(chief.front.clips!.attack!.frames[hitAt]);
  assert.ok(strike.flame > 200, `the smash's strike smeared (${strike.flame} pixels of it)`);
  const chiefDead = chief.front.clips!.die!.frames;
  const dead = pixels(chiefDead[chiefDead.length - 1]);
  assert.ok(dead.n > 2000 && dead.rim === 0, `the chieftain at the last: stone, no edge (${dead.n} pixels, ${dead.rim} edge)`);
  const wolfDead = wolf.front.clips!.die!.frames;
  assert.ok(pixels(wolfDead[wolfDead.length - 1]).n < 40, 'the wolf at the last: gone');
});

test('8. squaring up: a hero standing off its four ways, as a move comes it goes to stand with him square before it, and its blow finds him', () => {
  for (const [kind, id, k] of [['warchief', 'warchief:smash', CK], ['mistwolf', 'mistwolf:bite', WK]] as const) {
    const { g, m } = room(kind, 2, id);
    const h = g.hero;
    // (the hero half way between two of its ways, as far off as its blow reaches)
    const reach = kind === 'warchief' ? (CHIEF_LANDS.smash[0] * k) / TILE3 : (BITE_RING.f * k) / TILE3;
    h.x = m.x + reach / Math.SQRT2;
    h.y = m.y + reach / Math.SQRT2;
    let lined = -1;
    const s = watch(g, m, 6, () => {
      if (lined < 0 && m.state === 'act') lined = Math.min(Math.abs(h.x - m.x), Math.abs(h.y - m.y));
      return null;
    });
    assert.ok(lined >= 0 && lined < F9_TUNE.square.off + 0.1, `${kind}: square to him as it strikes (${lined.toFixed(2)} tiles off its way)`);
    assert.ok(s.hurts.length >= 1, `${kind}: its blow finds him`);
  }
});
