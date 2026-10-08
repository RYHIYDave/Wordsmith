// THE TWO TESTS OF WEIGHT (src/render/weight.ts: the art chat's mock-ups for the owner, 8 Oct 2026;
// his words, 6 Oct 2026, 00:32: "I want things to have weight. That's very important"). BOTH ARE
// OFF IN THE GAME. What is held here:
//   1. they are off, and with them off nothing changes: a run is played by the clock as it always
//      was, wherever the hero goes, and the renderer does not so much as look at the hold;
//   2. switched on (by these tests only, and put back), each does what the films show: a run
//      played by the ground it covers keeps the foot that is down where it was put, and a heavy
//      blow that lands on something holds the hero and what it struck for a moment, the rules'
//      own clocks untouched.
// The art for the figure is made up as in tests/figure.test.ts (frames that are only names); the
// feet are the heroes' own bones (src/art/moves3.ts, the same that paint them).
//   run: tsx --test tests/weight.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { UNITS_PER_TILE, groundPerTurn } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { bonesAt, project, solve } from '../src/art/skeleton';
import type { Sprite } from '../src/engine/px';
import { TUNE } from '../src/game/defs';
import { Figure } from '../src/render/figure';
import type { FigureState } from '../src/render/figure';
import { HITSTOP, PictureHold, STRIDE, lagAt, pushAt, shakeAt, strideFrame } from '../src/render/weight';
import type { HoldHero, HoldMonster } from '../src/render/weight';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs: { readFileSync(path: string, enc: string): string } = nodeFs;

const DT = 1 / 60;

/** Run `fn` with a switch set as asked, and put it back as it was, whatever happens. */
function withSwitch(sw: { on: boolean }, on: boolean, fn: () => void): void {
  const was = sw.on;
  sw.on = on;
  try {
    fn();
  } finally {
    sw.on = was;
  }
}

// ---------------------------------------------------------------------------------------------
// Made-up art: frames that are only names, a run of fifteen to a turn (as the heroes' are)

const named = (name: string): Sprite => ({ img: name as unknown as HTMLCanvasElement, w: 20, h: 30, ax: 10, ay: 29 });
const called = (s: Sprite): string => s.img as unknown as string;
function facing(tag: string, ground?: number): AnimSet {
  const set: AnimSet = {
    idle: Array.from({ length: 12 }, (_, i) => named(`${tag}idle ${i}`)),
    walk: Array.from({ length: 15 }, (_, i) => named(`${tag}run ${i}`)),
    attack: [named('a'), named('b'), named('c')],
    idleFps: 10,
    walkFps: 30,
  };
  if (ground !== undefined) set.walkGround = ground;
  return set;
}
const HERO: ActorArt = { front: facing('', 1.5), back: facing('back ', 1.5) };
const RUNNING: FigureState = { anim: 'walk', animT: 0, fx: 1, fy: 0, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };

/** A hero going along the grid: now quickly, now slowly, standing, jumping a long way (a warp), walking again. */
function journey(): FigureState[] {
  const out: FigureState[] = [];
  let x = 3;
  let t = 0;
  for (let k = 0; k < 400; k++) {
    const speed = k < 100 ? 4.6 : k < 160 ? 2.1 : k < 200 ? 0 : k < 300 ? 5.5 : 3;
    if (k === 250) x += 6;
    x += speed * DT;
    t += DT;
    const moving = speed > 0;
    out.push({ ...RUNNING, anim: moving ? 'walk' : 'idle', animT: t, x, y: 7 });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// 1. Off, and nothing changes

test('both tests of weight are switched off in the game', () => {
  assert.equal(HITSTOP.on, false, 'the hold of the picture is off');
  assert.equal(STRIDE.on, false, 'the run played by the ground covered is off');
});

test('with the switch off, a run is played by the clock as it always was, wherever the hero goes', () => {
  withSwitch(STRIDE, false, () => {
    const told = new Figure();
    const untold = new Figure();
    for (const st of journey()) {
      const a = told.frame(HERO, st, DT, 0, 0, false);
      // (the same, as the game asked for it before the hero's place was passed to the figure at all)
      const { x: _x, y: _y, ...without } = st;
      const b = untold.frame(HERO, without, DT, 0, 0, false);
      assert.equal(called(a), called(b), `at ${st.animT.toFixed(3)} s`);
      if (st.anim === 'walk') assert.equal(called(a), `run ${Math.floor(st.animT * 30) % 15}`, `the clock's own picture at ${st.animT.toFixed(3)} s`);
    }
  });
});

test('with the switch off, the renderer does not look at the hold of the picture at all', () => {
  // (the renderer is not run here: it needs a canvas. What it does with the hold is read off its
  // source: every use of it stands behind the switch.)
  const src = fs.readFileSync('src/render/render.ts', 'utf8');
  const uses = src.split('\n').filter((line) => line.includes('this.hold.') && !line.trim().startsWith('//') && !line.trim().startsWith('*'));
  assert.ok(uses.length >= 5, `the renderer uses the hold (${uses.length} lines)`);
  for (const line of uses) {
    const guarded = /HITSTOP\.on\s*(&&|\?)/.test(line) || line.includes('this.hold.reset()') || line.includes('this.hold.keep(') || line.includes('this.hold.look(');
    assert.ok(guarded, `behind the switch: ${line.trim()}`);
  }
  // (the two that are not on a line of their own with it: look is called only inside `if (HITSTOP.on)`,
  // keep only for a monster the hold returned, which it does only when the switch is on)
  const look = src.indexOf('this.hold.look(');
  const opener = src.lastIndexOf('if (HITSTOP.on) {', look);
  assert.ok(look > 0 && opener > 0 && !src.slice(opener, look).includes('}'), 'look is called inside if (HITSTOP.on) { ... }');
  assert.equal(src.indexOf('this.hold.look(', look + 1), -1, 'and nowhere else');
  const keep = src.indexOf('this.hold.keep(');
  const stop = src.lastIndexOf('const stop = HITSTOP.on', keep);
  assert.ok(stop > 0 && keep - stop < 2500, 'keep is reached only through a hold the switch let through');
  // (and a hold that has never been looked at changes nothing it is asked about)
  const hold = new PictureHold();
  const hero: HoldHero = { anim: 'attack', attackAge: 0.3, attackWind: 0.22 };
  assert.equal(hold.heroAge(hero), 0.3);
  assert.equal(hold.heroStill(hero), false);
  assert.equal(hold.victim(1), null);
});

// ---------------------------------------------------------------------------------------------
// 2a. The run played by the ground it covers

test('switched on, the run goes by the ground covered: standing still it waits, a warp does not count, a new run starts from its first picture', () => {
  withSwitch(STRIDE, true, () => {
    const fig = new Figure();
    let ground = 0;
    let was: number | null = null;
    for (const st of journey()) {
      const s = fig.frame(HERO, st, DT, 0, 0, false);
      if (st.anim !== 'walk') {
        ground = 0;
        was = null;
        continue;
      }
      const x = st.x as number;
      const step = was === null ? 0 : x - was;
      if (step < 1) ground += step;
      was = x;
      assert.equal(called(s), `run ${strideFrame(ground, 1.5, 15)}`, `at ${st.animT.toFixed(3)} s`);
    }
  });
  // (the nearest picture: a turn of 1.5 tiles in fifteen is a tenth of a tile each)
  assert.equal(strideFrame(0, 1.5, 15), 0);
  assert.equal(strideFrame(0.149, 1.5, 15), 1);
  assert.equal(strideFrame(1.5, 1.5, 15), 0);
  assert.equal(strideFrame(1.64, 1.5, 15), 1);
});

test('a turn of each hero\'s run covers the ground its two steps cover (measured on the bones)', () => {
  // (moves3.ts's run: a foot is down for 0.36 of a turn, going back from `reach` ahead of the hips to `push` behind them)
  const want: [string, number][] = [['krun', (9 + 12) / 0.36], ['rrun', (11 + 14.5) / 0.36], ['mrun', (7.5 + 9.5) / 0.36], ['ktownrun', (9 + 12) / 0.36], ['rtownrun', (11 + 14.5) / 0.36]];
  for (const [key, units] of want) {
    const g = groundPerTurn(MOVES3[key]) as number;
    assert.ok(Math.abs(g - units / UNITS_PER_TILE) < 0.03, `${key}: ${g.toFixed(3)} tiles a turn, ${(units / UNITS_PER_TILE).toFixed(3)} by its gait`);
  }
  // (a tile, in the figure's own units, is where the projection puts 16 game pixels across and 8 down)
  const [across, down] = project([UNITS_PER_TILE, 0, 0], 'front');
  assert.ok(Math.abs(across - 32) < 1e-9 && Math.abs(down - 16) < 1e-9, `a tile along the grid is ${across} by ${down} picture pixels`);
  assert.equal(groundPerTurn(MOVES3.strike), undefined, 'a move that does not go round has none');
});

/**
 * How far each toe moves over the floor while it is down, in game pixels along the line the hero
 * runs on (the mean over the steps of three seconds, and the most), the figure choosing the
 * pictures as the game does for a hero going straight along the grid at `speed`.
 */
function toeSlide(move: Move3, speed: number): { mean: number; most: number } {
  const n = Math.round(move.motion.keys[move.motion.keys.length - 1].at * 30);
  const set: AnimSet = { idle: [named('idle')], walk: Array.from({ length: n }, (_, i) => named(`${i}`)), attack: [named('a')], walkFps: 30, walkGround: groundPerTurn(move) };
  const art: ActorArt = { front: set, back: set };
  const toes = set.walk.map((_, i) => {
    const s = solve(move.build, bonesAt(move.motion.keys, move.rest, i / 30));
    return { L: s.toeL, R: s.toeR };
  });
  const perUnit = Math.hypot(16, 8) / UNITS_PER_TILE;
  const fig = new Figure();
  const slides: number[] = [];
  const open: Record<string, number[] | null> = { L: null, R: null };
  for (let k = 0; k <= 180; k++) {
    const t = k * DT;
    const at = speed * t;
    const i = Number(called(fig.frame(art, { ...RUNNING, animT: t, x: at, y: 0 }, DT, 0, 0, false)));
    for (const side of ['L', 'R'] as const) {
      const toe = toes[i][side];
      if (toe[2] < 0.5) (open[side] ??= []).push(at * UNITS_PER_TILE + toe[0]);
      else if (open[side]) {
        const xs = open[side] as number[];
        if (t > 1) slides.push((xs[xs.length - 1] - xs[0]) * perUnit);
        open[side] = null;
      }
    }
  }
  return { mean: slides.reduce((a, b) => a + b, 0) / slides.length, most: Math.max(...slides.map(Math.abs)) };
}

test('switched on, the foot that is down stays where it was put; today it slides', () => {
  for (const key of ['krun', 'rrun', 'mrun']) {
    let today = { mean: 0, most: 0 };
    let planted = { mean: 0, most: 0 };
    withSwitch(STRIDE, false, () => (today = toeSlide(MOVES3[key], TUNE.heroSpeed)));
    withSwitch(STRIDE, true, () => (planted = toeSlide(MOVES3[key], TUNE.heroSpeed)));
    assert.ok(today.mean > 2, `${key} today: the toe slides ${today.mean.toFixed(1)} game pixels a step`);
    assert.ok(planted.most < 1.5, `${key} by the ground covered: the toe moves at most ${planted.most.toFixed(1)} game pixels while it is down`);
  }
});

// ---------------------------------------------------------------------------------------------
// 2b. The hold of the picture

test('the hold, as numbers: still for the hold, then made up; shaken from side to side; knocked back and come back', () => {
  const s = { hold: 0.1, catchUp: 0.2 };
  assert.equal(lagAt(0, s.hold, s.catchUp), 0);
  assert.equal(lagAt(0.05, s.hold, s.catchUp), 0.05, 'standing still: behind second for second');
  assert.equal(lagAt(0.1, s.hold, s.catchUp), 0.1);
  assert.ok(Math.abs(lagAt(0.2, s.hold, s.catchUp) - 0.05) < 1e-12, 'half made up half way through');
  assert.equal(lagAt(0.3, s.hold, s.catchUp), 0, 'all made up');
  assert.equal(lagAt(0.5, s.hold, s.catchUp), 0);
  // (the picture never runs backward: the rules' clock less the lag only grows)
  let was = -1;
  for (let t = 0; t < 0.5; t += 0.001) {
    const shown = t - lagAt(t, s.hold, s.catchUp);
    assert.ok(shown >= was - 1e-12, `at ${t.toFixed(3)}`);
    was = shown;
  }
  // shaken: thirty times a second, each way, and not at all after the hold
  assert.equal(shakeAt(0.01, 0.1, 2), 2);
  assert.equal(shakeAt(0.045, 0.1, 2), -1);
  assert.equal(shakeAt(0.07, 0.1, 2), 1);
  assert.equal(shakeAt(0.1, 0.1, 2), 0);
  assert.equal(shakeAt(-0.01, 0.1, 2), 0);
  // knocked back for the hold, back over `back` after it
  assert.equal(pushAt(0.05, 0.1, 0.12), 1);
  assert.ok(Math.abs(pushAt(0.16, 0.1, 0.12) - 0.5) < 1e-12);
  assert.equal(pushAt(0.3, 0.1, 0.12), 0);
});

/** The Slam's wind-up and follow-through, as the rules have them (game/defs.ts). */
const WIND = 0.22;
const FOLLOW = 0.38;
/**
 * A Slam as the rules make it: begun, wound up for WIND seconds, landing on what is in `struck`,
 * then its follow-through; one look a sixtieth. `age`: the rules' own attack clock (0 once it is
 * over, as the game has it), `shown`: the clock the hero is drawn by.
 */
function slam(hold: PictureHold, struck: number[], seconds = 0.7): { age: number; shown: number; still: boolean; victim: ReturnType<PictureHold['victim']> }[] {
  const monsters: HoldMonster[] = [1, 2, 3].map((id) => ({ id, flash: 0, dead: false }));
  const out: { age: number; shown: number; still: boolean; victim: ReturnType<PictureHold['victim']> }[] = [];
  let t = 0;
  for (let k = 0; k < Math.round(seconds * 60); k++) {
    t += DT;
    const attacking = t < WIND + FOLLOW;
    for (const m of monsters) m.flash = Math.max(0, m.flash - DT);
    // (the blow lands in the step its wind-up runs out: the rules flash what it struck)
    if (t >= WIND && t - DT < WIND) for (const m of monsters) if (struck.includes(m.id)) m.flash = 0.12 - DT;
    const hero: HoldHero = { anim: attacking ? 'attack' : 'idle', attackAge: attacking ? t : 0, attackWind: WIND };
    hold.look(hero, true, monsters, DT);
    const v = hold.victim(1);
    if (v && v.held && v.still === null) hold.keep(1, named('struck pose'));
    out.push({ age: hero.attackAge, shown: hold.heroAge(hero), still: hold.heroStill(hero), victim: hold.victim(1) });
  }
  return out;
}

test('switched on: a Slam that lands on something holds the hero and what it struck, and the rules\' clocks go on', () => {
  withSwitch(HITSTOP, true, () => {
    const seen = slam(new PictureHold(), [1, 2]);
    const landed = seen.findIndex((f) => f.age >= WIND);
    // before the blow: as the rules have it
    for (const f of seen.slice(0, landed)) {
      assert.equal(f.shown, f.age);
      assert.equal(f.still, false);
      assert.equal(f.victim, null);
    }
    // the hold: six sixtieths in which the hero is drawn as he was when the blow landed
    const held = seen.filter((f) => f.still);
    assert.equal(held.length, Math.round(HITSTOP.hold * 60), `${held.length} sixtieths held`);
    for (const f of held) {
      // (the moment the rules' wind-up ran out: the picture of the blow itself, attackFrame's `hit`)
      assert.ok(Math.abs(f.shown - WIND) < 1e-9, `the blow's own moment (${f.shown})`);
      assert.ok(f.victim !== null && f.victim.held, 'what it struck is held too');
      assert.ok(f.victim !== null && f.victim.push === 1, '... knocked back all the while');
    }
    // the struck one shows the picture it had when the blow landed, and is shaken from side to side
    const shakes = held.map((f) => (f.victim ? f.victim.shake : 0));
    assert.ok(shakes.some((x) => x > 0) && shakes.some((x) => x < 0), `shaken: ${shakes.join(' ')}`);
    assert.ok(held.slice(1).every((f) => f.victim !== null && f.victim.still !== null && called(f.victim.still) === 'struck pose'), 'its picture stands still');
    // after it the picture makes the time up, and is the rules' own again before the attack is over
    const after = seen.slice(landed + held.length);
    assert.ok(after.some((f) => f.shown < f.age - 1e-9), 'still catching up just after the hold');
    const caught = after.findIndex((f) => Math.abs(f.shown - f.age) < 1e-9);
    assert.ok(caught >= 0 && after[caught].age > WIND && after[caught].age < WIND + FOLLOW, `caught up by ${after[caught]?.age.toFixed(3)} s, before the attack ends at ${WIND + FOLLOW}`);
    assert.ok(seen[seen.length - 1].victim === null, 'and it is all over');
  });
});

test('switched on: a Slam that strikes nothing holds nothing, and another attack is not held by the last one\'s blow', () => {
  withSwitch(HITSTOP, true, () => {
    for (const f of slam(new PictureHold(), [])) {
      assert.equal(f.shown, f.age);
      assert.equal(f.still, false);
      assert.equal(f.victim, null);
    }
    // (the hero begins another attack in the middle of the hold: it is drawn by its own clock)
    const hold = new PictureHold();
    const monsters: HoldMonster[] = [{ id: 1, flash: 0, dead: false }];
    hold.look({ anim: 'attack', attackAge: 0.21, attackWind: 0.22 }, true, monsters, DT);
    monsters[0].flash = 0.11;
    hold.look({ anim: 'attack', attackAge: 0.225, attackWind: 0.22 }, true, monsters, DT);
    assert.ok(hold.heroStill({ anim: 'attack', attackAge: 0.24, attackWind: 0.22 }), 'held');
    const other: HoldHero = { anim: 'attack', attackAge: 0.02, attackWind: 0.12 };
    hold.look(other, false, monsters, DT);
    assert.equal(hold.heroStill(other), false);
    assert.equal(hold.heroAge(other), 0.02);
    assert.ok(hold.victim(1) !== null, 'what was struck is still held: the blow did land');
  });
});
