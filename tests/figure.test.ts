// Tests for src/render/figure.ts (Version 11): which picture of a hero is shown at an instant,
// the scarf and feather that go with it, and when a hero left standing does one of the two things
// their class does (the owner: "Warrior tests the edge of his sword, mage snaps his finger and a
// mage light pops on and off, for the ranger a squirrel runs out from under his cloak ...").
//
// The art here is made up: its frames are plain objects with a name, in lists as long as the real
// ones. (Painting a frame needs a canvas; choosing among frames does not.) The figures face
// screen-right but for the last test: one that faces left is mirrored, which asks for a canvas,
// and there a canvas that does nothing is handed over for as long as the test runs.
//   run: tsx --test tests/figure.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { flipSprite } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { Figure, GESTURE_FIRST, GESTURE_GAP, TURN_FLIP, TURN_NARROW, TURN_TIME, VIEW_STICK, attackFrame } from '../src/render/figure';
import type { FigureState } from '../src/render/figure';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

// ---------------------------------------------------------------------------------------------
// Made-up art

/** A frame that is only a name (and a place its scarf is tied, as a real one has). */
function frame(name: string, tail: string | null = 'w-scarf-a'): Sprite {
  const s: Sprite = { img: name as unknown as HTMLCanvasElement, w: 20, h: 30, ax: 10, ay: 29 };
  if (tail) s.tails = [{ id: tail, x: 9, y: 8, over: false }];
  return s;
}
const frames = (name: string, n: number, tail: string | null = 'w-scarf-a'): Sprite[] => Array.from({ length: n }, (_, i) => frame(`${name} ${i}`, tail));
const clip = (name: string, n: number, fps: number, hit?: number): Clip => (hit === undefined ? { frames: frames(name, n), fps } : { frames: frames(name, n), fps, hit });
/** What a frame is called: "idle 3", "slam 7". */
const called = (s: Sprite): string => s.img as unknown as string;

/** The standing loop, as the heroes have it: twelve frames, ten to the second. */
const LOOP = 12;
const LOOP_FPS = 10;
const LOOP_SECONDS = LOOP / LOOP_FPS;

/** One facing of a made-up hero. `gestures`: has the two things done when left standing (one loop long, and two). */
function facing(tag: string, gestures: boolean): AnimSet {
  const set: AnimSet = {
    idle: frames(`${tag}idle`, LOOP), walk: frames(`${tag}walk`, 8), attack: frames(`${tag}strike still`, 3), heavy: frames(`${tag}slam still`, 3), leap: frames(`${tag}leap still`, 3),
    idleFps: LOOP_FPS, walkFps: 16,
    clips: { attack: clip(`${tag}strike`, 16, 30, 0.2), heavy: clip(`${tag}slam`, 19, 30, 0.3), leap: clip(`${tag}leap`, 13, 12) },
  };
  if (gestures && set.clips) {
    set.clips.idleA = clip(`${tag}first thing`, 25, 20);
    set.clips.idleB = clip(`${tag}second thing`, 49, 20);
  }
  return set;
}
const HERO: ActorArt = { front: facing('', true), back: facing('back ', false) };
const FRONT = HERO.front;
const A = FRONT.clips?.idleA as Clip;
const B = FRONT.clips?.idleB as Clip;

/** What the rules say of a hero who stands, facing screen-right and the camera. */
const STANDING: FigureState = { anim: 'idle', animT: 0, fx: 1, fy: 0, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
const DT = 1 / 60;

/** One call of Figure.frame, as these tests see it. */
interface Shown {
  /** The hero's animation clock at the call. */
  t: number;
  frame: Sprite;
  name: string;
  /** Which of the two things was begun in this very call (1 or 2), or 0. */
  began: number;
  busy: boolean;
  /** What the figure says it last showed. */
  last: Sprite | null;
}

/** A figure and a hero's animation clock to drive it with. */
class Stage {
  readonly fig = new Figure();
  /** The hero's animation clock (the rules start it again when an attack is begun). */
  t = 0;
  readonly seen: Shown[] = [];

  constructor(readonly art: ActorArt = HERO) {}

  /** Show the figure for `seconds`, a sixtieth at a time. Returns what was shown. */
  play(seconds: number, state: Partial<FigureState> = {}, gestures = true, dt = DT): Shown[] {
    const out: Shown[] = [];
    for (let k = 0; k < Math.round(seconds / DT); k++) {
      this.t += DT;
      out.push(this.show(state, gestures, dt));
    }
    return out;
  }

  /** One call, at the clock as it stands. */
  show(state: Partial<FigureState> = {}, gestures = true, dt = DT): Shown {
    const f = this.fig.frame(this.art, { ...STANDING, animT: this.t, ...state }, dt, 0, 0, gestures);
    const s: Shown = { t: this.t, frame: f, name: called(f), began: this.fig.began, busy: this.fig.busy, last: this.fig.last };
    this.seen.push(s);
    return s;
  }
}

/** The frame of the standing loop for a clock that began at `from`. */
const loopFrame = (set: AnimSet, t: number, from = 0): Sprite => set.idle[Math.floor(Math.max(0, t - from) * LOOP_FPS) % LOOP];
/** Is the standing loop on its first frame at this moment? */
const atLoopStart = (t: number, from = 0): boolean => Math.floor(Math.max(0, t - from) * LOOP_FPS) % LOOP === 0;

// ---------------------------------------------------------------------------------------------
// An attack's picture keeps time with the rules

test("an attack's picture is played so that its own wind-up ends when the rules' does; from the blow on it runs at its own pace", () => {
  // a swing of half a second, sixteen frames, whose blow falls at 0.2 s: on frame 6
  const c = clip('swing', 16, 30, 0.2);
  const at = (age: number, wind: number): number => c.frames.indexOf(attackFrame(c, age, wind));
  const own = (t: number): number => Math.max(0, Math.min(15, Math.floor(t * 30 + 1e-6)));
  for (const wind of [0.05, 0.1, 0.2, 0.3, 0.4]) {
    // begun: the first frame. The moment the rules land the blow: the frame the picture lands it on.
    assert.equal(at(0, wind), 0, `a wind-up of ${wind} s begins on the first frame`);
    assert.equal(at(wind, wind), 6, `a wind-up of ${wind} s: the blow falls on the picture's own frame for it`);
    // half way through the rules' wind-up the picture is half way through its own
    assert.equal(at(wind / 2, wind), 3, `half way through a wind-up of ${wind} s`);
    // before the blow, the frames before it, in order; none skipped back
    let last = 0;
    for (let k = 0; k <= 200; k++) {
      const i = at((wind + 0.6) * (k / 200), wind);
      assert.ok(i >= last, `a wind-up of ${wind} s: the picture never runs backwards`);
      if ((wind + 0.6) * (k / 200) < wind - 1e-9) assert.ok(i <= 6, 'and does not show the blow before it lands');
      last = i;
    }
    // from the blow on the picture runs at its own pace: the follow-through takes as long whatever the wind-up
    for (const after of [0.04, 0.1, 0.17, 0.25, 0.3]) assert.equal(at(wind + after, wind), own(0.2 + after), `${after} s after the blow, with a wind-up of ${wind} s`);
    assert.equal(at(wind + 0.3, wind), 15, 'it ends when the swing does');
    assert.equal(at(wind + 5, wind), 15, 'and its last frame is held');
  }
  // a wind-up the same as the picture's own: the picture simply plays
  for (let k = 0; k <= 40; k++) assert.equal(at(k / 60, 0.2), own(k / 60), `at its own pace, ${k} sixtieths in`);
  // shorter (a fast weapon): the wind-up is hurried; longer: it is drawn out
  assert.equal(at(0.05, 0.1), own(0.1));
  assert.equal(at(0.2, 0.4), own(0.1));
  assert.ok(at(0.15, 0.4) < at(0.15, 0.2) && at(0.15, 0.2) < at(0.15, 0.1), 'the longer the rules wind up, the less of the picture has gone by');
  // no wind-up at all: the picture begins at the blow
  assert.equal(at(0, 0), 6);
  assert.equal(at(0.1, 0), own(0.3));
  // a clip that does not say when its blow falls is held on its first frame until the rules' blow, then played from the start
  const plain = clip('plain', 10, 30);
  const p = (age: number, wind: number): number => plain.frames.indexOf(attackFrame(plain, age, wind));
  assert.deepEqual([p(0, 0.2), p(0.19, 0.2), p(0.2, 0.2), p(0.3, 0.2), p(9, 0.2)], [0, 0, 0, 3, 9]);
});

// ---------------------------------------------------------------------------------------------
// Which picture

test('walking and standing: the loop for what the hero is doing, by the hero\'s own clock, seen from the side they face', () => {
  const s = new Stage();
  // walking: sixteen frames a second, round and round
  for (const shown of s.play(1.5, { anim: 'walk' })) {
    assert.ok(shown.frame === FRONT.walk[Math.floor(shown.t * 16) % 8], `walking at ${shown.t.toFixed(3)} s: ${shown.name}`);
    assert.ok(shown.last === shown.frame, 'and the figure remembers what it last showed');
  }
  assert.equal(new Set(s.seen.map((x) => x.name)).size, 8, 'every frame of the walk is shown');
  // standing, with nothing of their own to do: the standing loop, ten frames a second
  const calm = new Stage();
  for (const shown of calm.play(3, {}, false)) assert.ok(shown.frame === loopFrame(FRONT, shown.t), `standing at ${shown.t.toFixed(3)} s: ${shown.name}`);
  assert.equal(new Set(calm.seen.map((x) => x.name)).size, LOOP);
  // facing away from the camera (up the screen and to the right): the pictures of the back
  const away = new Stage();
  for (const shown of away.play(1.5, { fx: 0, fy: -1 })) assert.ok(shown.frame === loopFrame(HERO.back, shown.t), `seen from behind: ${shown.name}`);
  for (const shown of away.play(1, { fx: 0, fy: -1, anim: 'walk' })) assert.ok(HERO.back.walk.includes(shown.frame));
  // (a figure facing straight to screen-right is drawn from the front: only one turned clearly up the screen shows its back)
  for (const [fx, fy, back] of [[1, 0, false], [0.7071, -0.7071, false], [0.6, -0.7, false], [0.5, -0.8, true], [0, -1, true], [0.7071, 0.7071, false]] as const) {
    const f = new Figure().frame(HERO, { ...STANDING, fx, fy }, DT, 0, 0, false);
    assert.equal(HERO.back.idle.includes(f), back, `facing (${fx}, ${fy})`);
  }
  // art that does not say how fast its loops play (the monsters' so far): two and eight frames a second
  const old: AnimSet = { idle: frames('old idle', 2), walk: frames('old walk', 4), attack: frames('old attack', 3) };
  const m = new Stage({ front: old, back: old });
  for (const shown of m.play(2, {}, false)) assert.ok(shown.frame === old.idle[Math.floor(shown.t * 2) % 2]);
  for (const shown of m.play(2, { anim: 'walk' })) assert.ok(shown.frame === old.walk[Math.floor(shown.t * 8) % 4]);
});

test('an attack: the timeline of the attack in hand, at the age the rules give it', () => {
  const fig = new Figure();
  const strike = FRONT.clips?.attack as Clip;
  const slam = FRONT.clips?.heavy as Clip;
  const show = (o: Partial<FigureState>, art: ActorArt = HERO): Sprite => fig.frame(art, { ...STANDING, anim: 'attack', ...o }, DT, 0, 0);
  for (const [age, wind] of [[0, 0.12], [0.06, 0.12], [0.12, 0.12], [0.2, 0.12], [0.41, 0.12], [0.05, 0.08], [0.3, 0.22]] as const) {
    // the quick attack, and the slow one
    assert.ok(show({ attackSkill: 0, attackAge: age, attackWind: wind }) === attackFrame(strike, age, wind), `the quick attack, ${age} s in`);
    assert.ok(show({ attackSkill: 1, attackAge: age, attackWind: wind }) === attackFrame(slam, age, wind), `the slow attack, ${age} s in`);
    // seen from behind (another figure: this one would have to turn round first, and that takes a moment)
    assert.ok(new Figure().frame(HERO, { ...STANDING, anim: 'attack', attackSkill: 0, attackAge: age, attackWind: wind, fx: 0, fy: -1 }, DT, 0, 0) === attackFrame(HERO.back.clips?.attack as Clip, age, wind));
  }
  // whatever the animation clock says: an attack is timed by its own age
  assert.ok(show({ attackAge: 0.2, attackWind: 0.12, animT: 77 }) === show({ attackAge: 0.2, attackWind: 0.12, animT: 0 }));
  // a figure with no picture of its own for the slow attack shows the quick one's
  const one: AnimSet = { ...FRONT, heavy: undefined, clips: { attack: strike } };
  assert.ok(show({ attackSkill: 1, attackAge: 0.2, attackWind: 0.12 }, { front: one, back: one }) === attackFrame(strike, 0.2, 0.12));
  // art of the first builds (three poses and no timeline): wound up until the blow, the blow for a moment, then after it
  const old: AnimSet = { idle: frames('old idle', 2), walk: frames('old walk', 4), attack: frames('old attack', 3), heavy: frames('old heavy', 3) };
  const three = (age: number, skill: number, set: AnimSet = old): string => called(show({ attackSkill: skill, attackAge: age, attackWind: 0.2 }, { front: set, back: set }));
  assert.deepEqual([three(0, 0), three(0.19, 0), three(0.2, 0), three(0.33, 0), three(0.35, 0), three(2, 0)], ['old attack 0', 'old attack 0', 'old attack 1', 'old attack 1', 'old attack 2', 'old attack 2']);
  assert.deepEqual([three(0.1, 1), three(0.25, 1), three(0.5, 1)], ['old heavy 0', 'old heavy 1', 'old heavy 2']);
  assert.equal(three(0.25, 1, { ...old, heavy: undefined }), 'old attack 1', 'no slow-attack poses: the quick attack\'s');
});

// From Version 15.1 (the owner, 6 Oct 2026: "the mage fires his beam and it blows his cloak back").
test('an attack that is held: the figure shows its loop for as long as it is held, lets go of it after, and a new attack starts afresh', () => {
  // (two frames of the blast arriving, then a loop of six: the ninth frame is the first of the loop again)
  const hold: Clip = { frames: frames('hold', 9), fps: 30, loop: 2 / 30 };
  const release = clip('release', 5, 30);
  const whirl: Clip = { frames: frames('whirl', 5), fps: 30, loop: 0 };
  const set: AnimSet = { ...FRONT, clips: { ...FRONT.clips, hold, release, whirl } };
  const art: ActorArt = { front: set, back: set };
  const fig = new Figure();
  const at = (st: Partial<FigureState>, a: ActorArt = art, f: Figure = fig): string => called(f.frame(a, { ...STANDING, anim: 'attack', attackWind: 0.2, ...st }, DT, 0, 0, false));
  const runs = (list: string[]): string[] => list.filter((n, i) => i === 0 || n !== list[i - 1]);
  // winding up: the attack's own frames
  assert.ok(at({ attackAge: 0.1 }).startsWith('strike'));
  // held: what comes before the loop once, then the loop round and round, and never its last frame (the first again)
  const held: string[] = [];
  for (let i = 0; i < 40; i++) held.push(at({ attackAge: 0.25, holdT: i * DT }));
  assert.deepEqual(runs(held).slice(0, 10), ['hold 0', 'hold 1', 'hold 2', 'hold 3', 'hold 4', 'hold 5', 'hold 6', 'hold 7', 'hold 2', 'hold 3']);
  assert.ok(!held.includes('hold 8'));
  // let go: the letting go from its first frame, in place of the rest of the attack
  const after: string[] = [];
  for (let i = 0; i < 6; i++) after.push(at({ attackAge: 0.25 + (i + 1) * DT }));
  assert.equal(after[0], 'release 0');
  assert.ok(after.every((n) => n.startsWith('release')), after.join(', '));
  // another attack begun (its clock starts again): that attack's own frames
  assert.ok(at({ attackAge: 0 }).startsWith('strike'));
  assert.ok(at({ attackAge: 0.05 }).startsWith('strike'));
  // a whirlwind that is held shows the spin; this figure has no picture for coming out of it, so the attack's frames follow
  assert.equal(at({ attackAge: 0.25, holdT: 0, holdAs: 'whirl' }), 'whirl 0');
  assert.equal(at({ attackAge: 0.25, holdT: 1 / 30, holdAs: 'whirl' }), 'whirl 1');
  assert.ok(at({ attackAge: 0.3 }).startsWith('strike'));
  // a figure with no loop of its own shows the attack's frame for as long as the attack is held, as before
  const plain = new Figure();
  assert.ok(at({ attackAge: 0.25, holdT: 0.5 }, HERO, plain) === called(attackFrame(FRONT.clips?.attack as Clip, 0.25, 0.2)));
  // walking or standing between: nothing of the letting go is left over for the next attack
  const fig2 = new Figure();
  at({ attackAge: 0.25, holdT: 0 }, art, fig2);
  fig2.frame(art, { ...STANDING, anim: 'idle' }, DT, 0, 0, false);
  assert.ok(at({ attackAge: 0.3 }, art, fig2).startsWith('strike'));
});

// From Version 15.1 (the owner, 6 Oct 2026: "I want things to have weight. That's very important").
test('a leap comes down: left standing where they land, the hero lands (a picture of its own), and anything else they do ends it at once', () => {
  const land = clip('land', 7, 30);
  const set: AnimSet = { ...FRONT, clips: { ...FRONT.clips, land } };
  const art: ActorArt = { front: set, back: set };
  const run = (after: (i: number) => Partial<FigureState>, n: number): string[] => {
    const fig = new Figure();
    // (in a quiet moment: the standing loop then takes up from its first frame; in a fight it goes by the rules' clock, as after anything else)
    const at = (st: Partial<FigureState>): string => called(fig.frame(art, { ...STANDING, ...st }, DT, 0, 0, true));
    at({ anim: 'walk', leapK: 0.5 });
    at({ anim: 'walk', leapK: 1 });
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(at(after(i)));
    return out;
  };
  // left standing (the rules still say walking in the step the leap ends): every frame of the landing, in order, then the standing loop
  const stood = run((i) => ({ anim: i === 0 ? 'walk' : 'idle', animT: i * DT }), 30);
  assert.equal(stood[0], 'land 0');
  const order = stood.filter((n, i) => i === 0 || n !== stood[i - 1]);
  assert.deepEqual(order.slice(0, 6), ['land 0', 'land 1', 'land 2', 'land 3', 'land 4', 'land 5'], 'the landing plays through');
  assert.ok(stood[29].startsWith('idle'), `and then the hero stands (${stood[29]})`);
  assert.ok(stood.indexOf('idle 0') > 0 && stood.slice(stood.indexOf('idle 0')).every((n) => n.startsWith('idle')), 'the standing loop takes up from its first frame and the landing does not come back');
  // an attack begun on landing is shown at once
  const struck = run(() => ({ anim: 'attack', attackAge: 0.05, attackWind: 0.2 }), 3);
  assert.ok(struck.every((n) => n.startsWith('strike')), `an attack on landing: ${struck.join(', ')}`);
  // walking off: the landing for the blink in which the rules cannot yet be told from the leap's end, then the walk, and no landing after
  const walked = run(() => ({ anim: 'walk' }), 20);
  assert.ok(walked.slice(6).every((n) => n.startsWith('walk')), `walking off: ${walked.join(', ')}`);
  // a figure with no landing of its own stands when it comes down, as before
  const fig = new Figure();
  fig.frame(HERO, { ...STANDING, anim: 'walk', leapK: 1 }, DT, 0, 0, false);
  assert.ok(FRONT.idle.includes(fig.frame(HERO, { ...STANDING, anim: 'idle' }, DT, 0, 0, false)));
});

// From Version 15.1: a hero whose life has run out falls (art: `clips.fall`), and is left as the
// fall leaves them. The rules have stopped by then, so the renderer says how long ago it was.
test('a hero whose life has run out: the figure shows the fall, whatever they were doing, and then stays as it left them', () => {
  const art: ActorArt = { front: { ...facing('', true), clips: { ...facing('', true).clips, fall: clip('fall', 46, 30) } }, back: { ...facing('back ', false), clips: { ...facing('back ', false).clips, fall: clip('back fall', 46, 30) } } };
  const fig = new Figure();
  // standing, alive
  assert.equal(called(fig.frame(art, STANDING, DT, 0, 0)), 'idle 0');
  // the blow falls in the middle of an attack: it is the fall that is shown, from its first frame
  const struck: FigureState = { ...STANDING, anim: 'attack', attackAge: 0.1, attackWind: 0.2, fallT: 0 };
  assert.equal(called(fig.frame(art, struck, DT, 0, 0)), 'fall 0');
  assert.equal(called(fig.frame(art, { ...struck, fallT: 0.5 }, DT, 0, 0)), 'fall 15');
  assert.equal(called(fig.frame(art, { ...struck, fallT: 1.5 }, DT, 0, 0)), 'fall 45');
  // ... and stays on its last for as long as they are shown
  assert.equal(called(fig.frame(art, { ...struck, fallT: 30 }, DT, 0, 0)), 'fall 45');
  // a hero who fell standing in peace does not start one of their little things down there
  const quiet = new Figure();
  for (let t = 0; t < GESTURE_FIRST + 3 * LOOP_SECONDS; t += DT) {
    const s = quiet.frame(art, { ...STANDING, animT: t, fallT: t }, DT, 0, 0, true);
    assert.ok(called(s).startsWith('fall '), `${t.toFixed(2)} s after falling the figure shows "${called(s)}"`);
    assert.equal(quiet.began, 0);
  }
  // seen from behind, it is the fall painted from behind
  const away = new Figure();
  assert.equal(called(away.frame(art, { ...STANDING, fx: 0, fy: -1, fallT: 0.5 }, DT, 0, 0)), 'back fall 15');
  // a figure with no fall of its own stands as it stood (a monster's art, an old hero's)
  const plain = new Figure();
  assert.equal(called(plain.frame(HERO, { ...STANDING, fallT: 0.5 }, DT, 0, 0)), 'idle 0');
  // a new character, alive: the standing loop again
  fig.reset();
  assert.equal(called(fig.frame(art, STANDING, DT, 0, 0)), 'idle 0');
});

// From Version 15.1: a heavy blow rocks the hero back (art: `clips.reel`). Only while they stand
// or walk: an attack that is under way goes on.
test('a hero rocked back by a blow: shown while they stand or walk, never over an attack, and then they are as they were', () => {
  const art: ActorArt = { front: { ...facing('', true), clips: { ...facing('', true).clips, reel: clip('reel', 8, 30) } }, back: { ...facing('back ', false), clips: { ...facing('back ', false).clips, reel: clip('back reel', 8, 30) } } };
  const fig = new Figure();
  assert.equal(called(fig.frame(art, STANDING, DT, 0, 0)), 'idle 0');
  // struck while standing: the reel from its first frame, for as long as it lasts
  assert.equal(called(fig.frame(art, { ...STANDING, reelT: 0 }, DT, 0, 0)), 'reel 0');
  assert.equal(called(fig.frame(art, { ...STANDING, animT: 0.1, reelT: 0.1 }, DT, 0, 0)), 'reel 3');
  assert.equal(called(fig.frame(art, { ...STANDING, animT: 0.2, reelT: 0.2 }, DT, 0, 0)), 'reel 6');
  // ... and when it has run its length they stand again, the loop from its first frame
  assert.equal(called(fig.frame(art, { ...STANDING, animT: 0.25, reelT: 0.25 }, DT, 0, 0)), 'idle 0');
  // struck while walking: the same, in place of the walk
  assert.equal(called(fig.frame(art, { ...STANDING, anim: 'walk', animT: 1, reelT: 0.1 }, DT, 0, 0)), 'reel 3');
  assert.ok(called(fig.frame(art, { ...STANDING, anim: 'walk', animT: 1.3, reelT: 0.35 }, DT, 0, 0)).startsWith('walk '));
  // struck in the middle of an attack: the attack goes on
  const striking: FigureState = { ...STANDING, anim: 'attack', attackAge: 0.1, attackWind: 0.2, reelT: 0.05 };
  assert.ok(called(fig.frame(art, striking, DT, 0, 0)).startsWith('strike '));
  // a hero who is reeling does not begin one of their little things
  const quiet = new Figure();
  for (let t = 0; t < 0.25; t += DT) {
    quiet.frame(art, { ...STANDING, animT: GESTURE_FIRST + 10 + t, reelT: t }, DT, 0, 0, true);
    assert.equal(quiet.began, 0);
  }
  // from behind it is the one painted from behind; and a figure with none stands as it stood
  assert.equal(called(new Figure().frame(art, { ...STANDING, fx: 0, fy: -1, reelT: 0.1 }, DT, 0, 0)), 'back reel 3');
  assert.equal(called(new Figure().frame(HERO, { ...STANDING, reelT: 0.1 }, DT, 0, 0)), 'idle 0');
  // struck from behind: thrown forward, if the figure has a picture of that; rocked back if it has not
  const two: ActorArt = { front: { ...art.front, clips: { ...art.front.clips, lurch: clip('lurch', 8, 30) } }, back: art.back };
  assert.equal(called(new Figure().frame(two, { ...STANDING, reelT: 0.1, reelBehind: true }, DT, 0, 0)), 'lurch 3');
  assert.equal(called(new Figure().frame(two, { ...STANDING, reelT: 0.1, reelBehind: false }, DT, 0, 0)), 'reel 3');
  assert.equal(called(new Figure().frame(art, { ...STANDING, reelT: 0.1, reelBehind: true }, DT, 0, 0)), 'reel 3');
  // a fall is a fall, whatever blow began it
  const both: ActorArt = { front: { ...art.front, clips: { ...art.front.clips, fall: clip('fall', 46, 30) } }, back: art.back };
  assert.equal(called(new Figure().frame(both, { ...STANDING, reelT: 0.1, fallT: 0.1 }, DT, 0, 0)), 'fall 3');
});

test('a leap: its timeline is laid over the jump, from leaving the floor to landing', () => {
  const fig = new Figure();
  const leap = FRONT.clips?.leap as Clip;
  const show = (leapK: number, o: Partial<FigureState> = {}, art: ActorArt = HERO): Sprite => fig.frame(art, { ...STANDING, anim: 'walk', leapK, ...o }, DT, 0, 0);
  // thirteen frames over the whole of it, the last as the hero lands
  for (let k = 0; k <= 100; k++) assert.ok(show(k / 100) === leap.frames[Math.min(12, Math.floor((k / 100) * 13))], `${k}% of the way through the leap`);
  assert.equal(called(show(0)), 'leap 0');
  assert.equal(called(show(1)), 'leap 12');
  // it is a leap whatever else the rules say the hero is doing, and whatever the clocks say
  assert.equal(called(show(0.5, { anim: 'attack', attackAge: 0.1, attackWind: 0.1 })), 'leap 6');
  assert.equal(called(show(0.5, { anim: 'idle', animT: 40 })), 'leap 6');
  assert.equal(called(new Figure().frame(HERO, { ...STANDING, anim: 'walk', leapK: 0.5, fx: 0, fy: -1 }, DT, 0, 0)), 'back leap 6');
  // not leaping: no leap (the rules give -1). In the step a leap ends the rules still call the
  // hero walking, as they do all through it: the figure has landed, and does not take that step
  // for walking off (from Version 15.1: see the landing, below). A hero who is still walking a
  // moment later is walking.
  assert.ok(FRONT.idle.includes(show(-1)), 'the step the leap ends: landed, not walking');
  for (let i = 0; i < 6; i++) show(-1);
  assert.ok(FRONT.walk.includes(show(-1)), 'and a moment later, walking');
  // art with three poses for it: pushing off, in the air, coming down
  const old: AnimSet = { idle: frames('old idle', 2), walk: frames('old walk', 4), attack: frames('old attack', 3), leap: frames('old leap', 3) };
  assert.deepEqual([0, 0.17, 0.18, 0.5, 0.69, 0.7, 1].map((k) => called(show(k, {}, { front: old, back: old }))), ['old leap 0', 'old leap 0', 'old leap 1', 'old leap 1', 'old leap 1', 'old leap 2', 'old leap 2']);
  // a figure with no picture of a leap (the ranger rolls; the mage vanishes) shows what the rules say it is doing
  const none: AnimSet = { idle: frames('n idle', 2), walk: frames('n walk', 4), attack: frames('n attack', 3) };
  assert.ok(none.walk.includes(show(0.5, {}, { front: none, back: none })));
});

// ---------------------------------------------------------------------------------------------
// Left standing

/** The first call at which a thing is begun, and all of what was shown up to it. */
function untilBegun(s: Stage, limit: number, state: Partial<FigureState> = {}): { before: Shown[]; at: Shown } {
  const before: Shown[] = [];
  for (let k = 0; k < Math.round(limit / DT); k++) {
    s.t += DT;
    const shown = s.show(state);
    if (shown.began) return { before, at: shown };
    before.push(shown);
  }
  throw new Error(`nothing was begun in ${limit} s`);
}

test('left standing, a hero does a thing of their own: after the wait, and only as the loop comes round to its first frame', () => {
  const s = new Stage();
  const { before, at } = untilBegun(s, 30);
  // until then: the standing loop and nothing else
  for (const shown of before) {
    assert.ok(shown.frame === loopFrame(FRONT, shown.t), `standing at ${shown.t.toFixed(3)} s: ${shown.name}`);
    assert.ok(!shown.busy && shown.began === 0);
  }
  // not before the wait is over, and then not until the loop is at its first frame
  assert.ok(at.t >= GESTURE_FIRST, `it began after ${at.t.toFixed(2)} s of standing (the wait is ${GESTURE_FIRST} s)`);
  assert.ok(atLoopStart(at.t), 'as the standing loop came round to its first frame');
  assert.ok(at.t < GESTURE_FIRST + LOOP_SECONDS + 2 * DT, 'the first time it did so after the wait');
  const waited = before.filter((x) => x.t >= GESTURE_FIRST);
  assert.ok(waited.length > 20 && waited.every((x) => !atLoopStart(x.t)), `the wait was over for ${waited.length} frames before the loop came round: nothing was begun in the middle of it`);
  // what is begun is the first of the two, from its first frame
  assert.ok(at.frame === A.frames[0] && at.began === 1 && at.busy, `it is the first thing (${at.name})`);
  // the wait is counted from when the hero came to a stand, whatever the clock says
  const late = new Stage();
  late.t = 1000.33;
  late.play(2, { anim: 'walk' });
  const stoodAt = late.t;
  const second = untilBegun(late, 30);
  assert.ok(second.at.t - stoodAt >= GESTURE_FIRST && second.at.t - stoodAt < GESTURE_FIRST + LOOP_SECONDS + 2 * DT && atLoopStart(second.at.t));
});

test('it is played to its end, and hands back to the standing loop at the loop\'s first frame', () => {
  const s = new Stage();
  const { at } = untilBegun(s, 30);
  const length = (A.frames.length - 1) / A.fps;
  // (long enough to see the whole of it, and then the standing loop go once round)
  const rest = s.play(length + LOOP_SECONDS + 0.3);
  const done = rest.findIndex((x) => !x.busy);
  assert.ok(done > 0);
  const playing = [at, ...rest.slice(0, done)];
  // every frame of it but the last (which is the standing figure again), in order, each for its twentieth of a second
  const order = playing.map((x) => A.frames.indexOf(x.frame));
  assert.ok(order.every((i) => i >= 0), 'while it is being done, only its frames are shown');
  for (let i = 1; i < order.length; i++) assert.ok(order[i] === order[i - 1] || order[i] === order[i - 1] + 1, `frame ${order[i - 1]} is followed by ${order[i]}`);
  assert.deepEqual([order[0], order[order.length - 1]], [0, A.frames.length - 2], 'from its first frame to its last but one');
  for (let i = 0; i < A.frames.length - 1; i++) {
    const n = order.filter((o) => o === i).length;
    assert.ok(n >= 2 && n <= 4, `frame ${i} is shown for three sixtieths, give or take one (${n})`);
  }
  // it takes as long as it is
  const back = rest[done];
  assert.ok(Math.abs(back.t - at.t - length) <= 2 * DT, `done ${(back.t - at.t).toFixed(3)} s after it began (it is ${length} s long)`);
  // only the call that began it says so
  assert.ok(playing.slice(1).every((x) => x.began === 0 && x.busy));
  // and then the loop: from its first frame, and on round from there
  assert.ok(back.frame === FRONT.idle[0], `handed back to ${back.name}`);
  for (const shown of rest.slice(done)) {
    assert.ok(shown.frame === loopFrame(FRONT, shown.t, back.t), `${(shown.t - back.t).toFixed(3)} s after: ${shown.name}`);
    assert.ok(!shown.busy && shown.began === 0);
  }
  assert.equal(new Set(rest.slice(done).map((x) => x.name)).size, LOOP, 'every frame of the loop, in its turn');
});

/** Run a test with the dice loaded: Math.random gives `value` while `fn` runs. */
function withDice(value: number, fn: () => void): void {
  const real = Math.random;
  Math.random = (): number => value;
  try {
    fn();
  } finally {
    Math.random = real;
  }
}

test('the two things take turns, with a wait between one and the next', () => {
  // (the wait is drawn by chance between the two ends of GESTURE_GAP, five seconds and nine: here
  // the dice are loaded to give the shortest, the middle and very nearly the longest)
  assert.ok(GESTURE_GAP[0] > 0 && GESTURE_GAP[1] > GESTURE_GAP[0]);
  for (const dice of [0, 0.5, 0.999]) {
    withDice(dice, () => {
      const s = new Stage();
      const gap = GESTURE_GAP[0] + dice * (GESTURE_GAP[1] - GESTURE_GAP[0]);
      const which: number[] = [];
      let from = 0;
      let wait: number = GESTURE_FIRST;
      for (let round = 0; round < 4; round++) {
        const { before, at } = untilBegun(s, 30);
        which.push(at.began);
        // begun after the wait, as the loop (which took up again at `from`) came round to its first frame
        assert.ok(at.t - from >= wait - 1e-9 && at.t - from < wait + LOOP_SECONDS + 2 * DT, `round ${round + 1}: begun ${(at.t - from).toFixed(2)} s after the last was done (the wait was ${wait.toFixed(2)} s)`);
        assert.ok(atLoopStart(at.t, from), `round ${round + 1}: as the loop came round`);
        assert.ok(before.filter((x) => x.t - from >= wait).every((x) => !atLoopStart(x.t, from)));
        assert.ok(at.frame === (at.began === 1 ? A : B).frames[0]);
        // let it be done
        const c = at.began === 1 ? A : B;
        const rest = s.play((c.frames.length - 1) / c.fps + 0.2);
        const done = rest.find((x) => !x.busy);
        assert.ok(done && done.frame === FRONT.idle[0], `round ${round + 1}: done, and back in the loop`);
        if (!done) return;
        assert.ok(rest.filter((x) => x.busy).every((x) => c.frames.includes(x.frame)), `round ${round + 1}: all of it was the same thing`);
        from = done.t;
        wait = gap;
      }
      assert.deepEqual(which, [1, 2, 1, 2], 'the first thing, the second, the first, the second');
    });
  }
  // told how long to wait, and which to begin with (the class cards take turns): that is what it does
  const card = new Stage();
  card.fig.reset(2, 1, 3);
  const first = untilBegun(card, 30);
  assert.equal(first.at.began, 2, 'the second thing first');
  assert.ok(first.at.t >= 2 && first.at.t < 2 + LOOP_SECONDS + 2 * DT && atLoopStart(first.at.t));
  const rest = card.play((B.frames.length - 1) / B.fps + 0.2);
  const done = rest.find((x) => !x.busy);
  assert.ok(done);
  if (!done) return;
  const next = untilBegun(card, 30);
  assert.equal(next.at.began, 1);
  assert.ok(next.at.t - done.t >= 3 - 1e-9 && next.at.t - done.t < 3 + LOOP_SECONDS + 2 * DT, `the same wait every time (${(next.at.t - done.t).toFixed(2)} s)`);
  // a hero with only one thing to do does that one every time
  for (const [only, began] of [['idleA', 1], ['idleB', 2]] as const) {
    const set: AnimSet = { ...FRONT, clips: { attack: FRONT.clips?.attack, [only]: only === 'idleA' ? A : B } };
    const solo = new Stage({ front: set, back: HERO.back });
    solo.fig.reset(1, 0, 1);
    for (let round = 0; round < 3; round++) {
      assert.equal(untilBegun(solo, 30).at.began, began, `only ${only}: round ${round + 1}`);
      solo.play(3);
    }
  }
});

test('it is dropped the moment the hero moves, attacks, leaps or is no longer left in peace', () => {
  const breaks: [string, Partial<FigureState>, boolean, (f: Sprite) => boolean][] = [
    ['walks', { anim: 'walk' }, true, (f) => FRONT.walk.includes(f)],
    ['attacks', { anim: 'attack', attackAge: 0.05, attackWind: 0.12 }, true, (f) => (FRONT.clips?.attack as Clip).frames.includes(f)],
    ['leaps', { anim: 'walk', leapK: 0.3 }, true, (f) => (FRONT.clips?.leap as Clip).frames.includes(f)],
    ['is no longer left in peace (monsters wake nearby)', {}, false, (f) => FRONT.idle.includes(f)],
  ];
  for (const [what, state, gestures, shows] of breaks) {
    const s = new Stage();
    untilBegun(s, 30);
    const part = s.play(0.5);
    assert.ok(part.every((x) => x.busy && A.frames.includes(x.frame)), 'half a second into the first thing');
    // one call, and it is gone
    s.t += DT;
    const cut = s.show(state, gestures);
    assert.ok(!cut.busy && shows(cut.frame), `the hero ${what}: ${cut.name} is shown at once`);
    // standing again, it is not taken up where it was left: the loop, by the hero's clock, and a whole new wait
    const stoodAt = s.t;
    const { before, at } = untilBegun(s, 30);
    assert.ok(before.length > 0 && before.every((x) => x.frame === loopFrame(FRONT, x.t)), `after the hero ${what}: the standing loop`);
    assert.ok(at.t - stoodAt >= GESTURE_FIRST - 1e-9 && atLoopStart(at.t), `after the hero ${what}: a new wait (${(at.t - stoodAt).toFixed(2)} s)`);
    assert.ok(at.frame === (at.began === 1 ? A : B).frames[0], 'and a thing begun from its beginning');
  }
  // the same before anything is begun: a step and a blow each start the wait again
  for (const [what, state, gestures] of breaks) {
    const s = new Stage();
    s.play(GESTURE_FIRST - 0.2);
    s.t += DT;
    s.show(state, gestures);
    const stoodAt = s.t;
    const { at } = untilBegun(s, 30);
    assert.ok(at.t - stoodAt >= GESTURE_FIRST - 1e-9, `a hero who ${what} just before the wait is over waits again (${(at.t - stoodAt).toFixed(2)} s)`);
  }
});

test('never while monsters are near, never while the game is stopped; a hero facing away turns round for it', () => {
  withFlip(() => {
    // not left in peace: half a minute of standing, and only the standing loop
    const wary = new Stage();
    for (const shown of wary.play(30, {}, false)) {
      assert.ok(shown.frame === loopFrame(FRONT, shown.t) && !shown.busy && shown.began === 0, `with monsters near, at ${shown.t.toFixed(2)} s: ${shown.name}`);
    }
    // Facing away: these things are painted for the view that faces the camera, so a hero who
    // stands with their back to us turns round to do theirs, and turns back when it is done. (At
    // first a hero facing away did nothing at all, and most heroes stand facing away: the way into
    // a town, the way up a corridor.)
    const both: ActorArt = { front: FRONT, back: facing('back ', true) };
    const away = new Stage(both);
    const turned = away.play(30, { fx: 0, fy: -1 });
    const first = turned.findIndex((x) => x.began !== 0);
    assert.ok(first > 0, 'facing away, the thing is begun all the same');
    assert.ok(turned.slice(0, first).every((x) => x.frame === loopFrame(both.back, x.t) && !x.busy), 'until then, the standing loop seen from behind');
    assert.ok(turned[first].t >= GESTURE_FIRST - 1e-9 && atLoopStart(turned[first].t), 'after the same wait, as the loop comes round');
    const clip = turned[first].began === 1 ? A : B;
    // the hero turns round to the camera for it, and a turn takes a moment: until it is half made,
    // it is still the hero's back that is seen
    const turnCalls = Math.ceil(TURN_TIME / DT) + 1;
    const facingUs = turned.findIndex((x, i) => i >= first && clip.frames.includes(x.frame));
    assert.ok(facingUs > first && facingUs - first <= turnCalls, `it is the picture that faces the camera, ${facingUs - first} calls after it began: the hero has turned round`);
    assert.ok(turned.slice(first, facingUs).every((x) => x.busy && both.back.idle.includes(x.frame)), 'seen from behind while turning');
    const done = turned.findIndex((x, i) => i > first && !x.busy);
    assert.ok(done > facingUs + 10 && turned.slice(facingUs, done).every((x) => x.busy && clip.frames.includes(x.frame)), 'then all of it is shown facing the camera');
    // and when it is done the hero turns their back to us again (the first half of that turn still facing us)
    const backAgain = turned.findIndex((x, i) => i >= done && both.back.idle.includes(x.frame));
    assert.ok(backAgain > done && backAgain - done <= turnCalls, 'and when it is done the hero has their back to us again');
    assert.ok(turned.slice(done, backAgain).every((x) => FRONT.idle.includes(x.frame)), 'having stood facing us for the first half of the turn');
    // a turn of the head is not a step: turning away in the middle of it does not break it off
    const mid = new Stage(both);
    untilBegun(mid, 30);
    mid.play(0.5);
    mid.t += DT;
    const still = mid.show({ fx: 0, fy: -1 }, true);
    assert.ok(still.busy && A.frames.includes(still.frame), 'turned away in the middle of it: it goes on');
    // a figure with nothing of its own to do (a monster) only stands
    const plain: AnimSet = { ...FRONT, clips: { attack: FRONT.clips?.attack } };
    const dull = new Stage({ front: plain, back: plain });
    assert.ok(dull.play(30).every((x) => x.frame === loopFrame(plain, x.t) && !x.busy));
    // the game stopped (no time passes): nothing is begun, and a thing being done stands still
    const s = new Stage();
    s.play(GESTURE_FIRST + 2 * LOOP_SECONDS, {}, true, 0);
    assert.ok(s.seen.every((x) => !x.busy && x.began === 0), 'stopped: the wait does not run');
    const { at } = untilBegun(s, 30);
    s.play(0.4);
    const held = s.fig.frame(HERO, { ...STANDING, animT: s.t }, 0, 0, 0);
    for (let k = 0; k < 30; k++) assert.ok(s.fig.frame(HERO, { ...STANDING, animT: s.t }, 0, 0, 0) === held, 'stopped in the middle of it: the same frame');
    assert.ok(A.frames.includes(held) && A.frames.indexOf(held) > A.frames.indexOf(at.frame) && s.fig.busy);
    // and it goes on from there when the game does
    const on = s.play(0.2);
    assert.ok(on.every((x) => x.busy) && A.frames.indexOf(on[on.length - 1].frame) > A.frames.indexOf(held));
  });
});

test('for the art tools: one of the two things done now, whatever the wait', () => {
  for (const which of [1, 2] as const) {
    const s = new Stage();
    const c = which === 1 ? A : B;
    s.play(0.37);
    s.fig.play(which);
    assert.ok(s.fig.busy);
    const shown = s.play((c.frames.length - 1) / c.fps - 0.05);
    assert.ok(shown.every((x) => x.busy && c.frames.includes(x.frame)), `thing ${which}, from the next call on`);
    assert.ok(shown[0].frame === c.frames[0] && shown[shown.length - 1].frame === c.frames[c.frames.length - 2], 'from its first frame to its last but one');
    // done: the loop takes up from its FIRST frame, wherever the hero's clock has got to (a third
    // of the way round, here), and goes on round from there
    const after = s.play(0.5);
    const back = after.find((x) => !x.busy);
    assert.ok(back && back.frame === FRONT.idle[0]);
    if (!back) return;
    assert.ok(!atLoopStart(back.t) && loopFrame(FRONT, back.t) !== FRONT.idle[0], '(by the clock alone it would be in the middle of the loop)');
    for (const shown of after.slice(after.indexOf(back))) assert.ok(shown.frame === loopFrame(FRONT, shown.t, back.t), `${(shown.t - back.t).toFixed(3)} s after it was done: ${shown.name}`);
  }
});

// ---------------------------------------------------------------------------------------------
// Turning (Version 11.1). The owner, on seeing Version 11: "The characters snap to a direction and
// if that could be smoother I'd like it."
//
// AND SWITCHED OFF in Version 14.5, once every hero was drawn facing the grid's four ways in
// earnest. The owner, 5 Oct 2026: "Can you remove the flip we added a long time ago. I'd like to
// see them now with the correct alignment". The machinery is kept (TURN_FLIP), and the tests of it
// below run with it switched on; the test after them is of the game as it is, with no flip.

/** Run a test of the turn's machinery with the flip switched on, and put the switch back. */
function withFlip(fn: () => void): void {
  const was = TURN_FLIP.on;
  TURN_FLIP.on = true;
  try {
    fn();
  } finally {
    TURN_FLIP.on = was;
  }
}

/** What is seen of a figure over some calls: how wide it is drawn, and whether it shows its back. */
function watch(s: Stage, seconds: number, state: Partial<FigureState>): { wide: number; back: boolean; turning: boolean; frame: Sprite }[] {
  const out: { wide: number; back: boolean; turning: boolean; frame: Sprite }[] = [];
  for (let k = 0; k < Math.round(seconds / DT); k++) {
    s.t += DT;
    const f = s.fig.frame(s.art, { ...STANDING, animT: s.t, ...state }, DT, 0, 0, false);
    out.push({ wide: s.fig.squash, back: HERO.back.idle.includes(f) || HERO.back.walk.includes(f), turning: s.fig.turning, frame: f });
  }
  return out;
}

test('a new figure stands as it is wanted: there is nothing to turn from', () => {
  for (const [fx, fy] of [[1, 0], [0, -1]] as const) {
    const s = new Stage();
    const seen = watch(s, 0.5, { fx, fy });
    assert.ok(seen.every((x) => x.wide === 1 && !x.turning), `facing (${fx}, ${fy}) from its first frame, at full width`);
  }
});

test('turning from front to back: the figure narrows, changes sides once at its narrowest, and widens again, in a seventh of a second', () => {
  withFlip(() => {
    const s = new Stage();
    watch(s, 0.5, {});
    const seen = watch(s, 0.5, { fx: 0, fy: -1 });
    const calls = TURN_TIME / DT;
    // it does not change sides in the first call, as it used to
    assert.ok(!seen[0].back && seen[0].wide < 1 && seen[0].turning, 'the first frame after the hero turns: still the front, a little narrower');
    const change = seen.findIndex((x) => x.back);
    assert.ok(Math.abs(change - calls / 2) <= 1, `the side changes half way through the turn (call ${change} of ${calls.toFixed(1)})`);
    assert.ok(seen.slice(change).every((x) => x.back), 'once');
    const over = seen.findIndex((x) => !x.turning);
    assert.ok(Math.abs(over - calls) <= 1, `the turn takes ${TURN_TIME} s (${over} calls)`);
    assert.ok(seen.slice(over).every((x) => x.wide === 1), 'and then the figure stands at full width');
    // narrower and narrower to the change, wider and wider after it; a quarter turn does not go edge-on
    for (let i = 1; i < change; i++) assert.ok(seen[i].wide < seen[i - 1].wide, 'narrowing up to the change');
    for (let i = change + 1; i <= over; i++) assert.ok(seen[i].wide > seen[i - 1].wide, 'widening after it');
    const least = Math.min(...seen.map((x) => x.wide));
    assert.ok(least >= TURN_NARROW.quarter - 1e-9 && least < TURN_NARROW.quarter + 0.1, `at its narrowest ${least.toFixed(2)} of its width (a quarter turn: ${TURN_NARROW.quarter})`);
    // slow to begin, quickest through the middle: as a thing turning on the spot is seen
    assert.ok(1 - seen[0].wide < seen[change - 2].wide - seen[change - 1].wide, 'it narrows faster as it goes');
  });
});

test('turning from right to left is half a turn: the figure goes all but edge-on, and comes back as its mirror image', () => {
  withFlip(() => {
    withBlankCanvas(() => {
      const s = new Stage();
      const before = watch(s, 0.3, { fx: 1, fy: 0 });
      const seen = watch(s, 0.5, { fx: 0, fy: 1 });
      const mirrored = (x: { frame: Sprite }): boolean => !FRONT.idle.includes(x.frame);
      assert.ok(before.every((x) => !mirrored(x)));
      const change = seen.findIndex(mirrored);
      assert.ok(change > 1 && seen.slice(0, change).every((x) => x.wide < 1) && seen.slice(change).every(mirrored), 'the mirror image comes in the middle of the turn, and stays');
      assert.ok(seen[change].frame === flipSprite(loopFrame(FRONT, s.t - (seen.length - 1 - change) * DT)), 'the same picture, in a mirror');
      const least = Math.min(...seen.map((x) => x.wide));
      assert.ok(least >= TURN_NARROW.half - 1e-9 && least < TURN_NARROW.half + 0.2, `at its narrowest ${least.toFixed(2)} of its width (half a turn: ${TURN_NARROW.half})`);
      assert.ok(seen[seen.length - 1].wide === 1 && !seen[seen.length - 1].turning);
      // right round (front right to back left) is half a turn too
      const r = new Stage();
      watch(r, 0.3, { fx: 1, fy: 0 });
      const round = watch(r, 0.5, { fx: -1, fy: 0 });
      assert.ok(Math.min(...round.map((x) => x.wide)) < TURN_NARROW.half + 0.2);
    });
  });
});

test('the side is kept until the hero has clearly turned out of it: a thumb wobbling on the line between two sides does not flip the picture', () => {
  withFlip(() => {
    withBlankCanvas(() => {
      // walking straight down the screen is the line between facing right and facing left
      const at = (deg: number): Partial<FigureState> => ({ anim: 'walk', fx: Math.cos(((45 + deg) * Math.PI) / 180), fy: Math.sin(((45 + deg) * Math.PI) / 180) });
      // (how far past the line the picture holds on, in degrees)
      const hold = (Math.asin(VIEW_STICK / Math.SQRT2) * 180) / Math.PI;
      assert.ok(hold > 4 && hold < 10, `the picture holds on for ${hold.toFixed(1)} degrees past the line`);
      const s = new Stage();
      watch(s, 0.3, at(-20));
      // a wobble of four degrees either side of the line, changing every call: nothing turns
      for (let k = 0; k < 60; k++) {
        const [x] = watch(s, DT, at(k % 2 ? 4 : -4));
        assert.ok(x.wide === 1 && !x.turning && FRONT.walk.includes(x.frame), `wobbling on the line, call ${k}`);
      }
      // clearly past it: the hero turns
      const turned = watch(s, 0.4, at(hold + 3));
      assert.ok(turned[0].turning && !FRONT.walk.includes(turned[turned.length - 1].frame), 'clearly past the line, the hero turns');
      // and now the same wobble does not turn them back
      for (let k = 0; k < 60; k++) {
        const [x] = watch(s, DT, at(k % 2 ? 4 : -4));
        assert.ok(x.wide === 1 && !x.turning && !FRONT.walk.includes(x.frame), `wobbling back over the line, call ${k}`);
      }
      // the other line, between the front and the back: a hero facing just up the screen of straight right
      const b = new Stage();
      watch(b, 0.3, { fx: 1, fy: 0 });
      for (let k = 0; k < 60; k++) {
        // (the back is shown from a facing of fx + fy < -0.2; these are either side of that)
        const [x] = watch(b, DT, k % 2 ? { fx: 0.62, fy: -0.78 } : { fx: 0.66, fy: -0.75 });
        assert.ok(x.wide === 1 && !x.back, `wobbling on the line between front and back, call ${k}`);
      }
    });
  });
});

test('a hero who thinks better of it before the turn is half made turns back, and never shows the other side', () => {
  withFlip(() => {
    const s = new Stage();
    watch(s, 0.3, {});
    const out = watch(s, 2 * DT, { fx: 0, fy: -1 });
    assert.ok(out.every((x) => x.turning && !x.back && x.wide < 1));
    const back = watch(s, 0.3, {});
    assert.ok(back.every((x) => !x.back), 'the back is never shown');
    assert.ok(back[0].wide > out[out.length - 1].wide, 'it widens again at once');
    const settled = back.findIndex((x) => !x.turning);
    assert.ok(settled >= 1 && settled <= 3 && back.slice(settled).every((x) => x.wide === 1), `and stands as it stood, ${settled} calls later`);
    // past the half way, a new turn is a turn back from as narrow as the figure is now: no jump in its width
    const t = new Stage();
    watch(t, 0.3, {});
    const most = watch(t, 6 * DT, { fx: 0, fy: -1 });
    assert.ok(most[most.length - 1].back && most[most.length - 1].turning, '(six calls in: past the half way, showing the back, not yet at full width)');
    const again = watch(t, 0.3, {});
    assert.ok(again[0].back && Math.abs(again[0].wide - most[most.length - 1].wide) < 0.2, 'it starts back from where it was');
    assert.ok(!again[again.length - 1].back && again[again.length - 1].wide === 1);
  });
});

test('a hero who turns to strike is round by the time the blow lands; with no time passing, a turn stands still', () => {
  withFlip(() => {
    // a quick weapon: the rules wind up for 0.08 s, less than a turn takes
    const s = new Stage();
    watch(s, 0.3, {});
    const wind = 0.08;
    let age = 0;
    let landed: { wide: number; back: boolean } | null = null;
    for (let k = 0; k < 12; k++) {
      s.t += DT;
      const f = s.fig.frame(HERO, { ...STANDING, anim: 'attack', attackSkill: 0, attackAge: age, attackWind: wind, fx: 0, fy: -1 }, DT, 0, 0);
      if (age >= wind && !landed) landed = { wide: s.fig.squash, back: (HERO.back.clips?.attack as Clip).frames.includes(f) };
      age += DT;
    }
    assert.ok(landed && landed.back && landed.wide === 1, `as the blow lands the hero has turned to it: ${JSON.stringify(landed)}`);
    // stopped: nothing moves
    const p = new Stage();
    watch(p, 0.3, {});
    watch(p, 3 * DT, { fx: 0, fy: -1 });
    const wide = p.fig.squash;
    for (let k = 0; k < 30; k++) p.fig.frame(HERO, { ...STANDING, animT: p.t, fx: 0, fy: -1 }, 0, 0, 0, false);
    assert.ok(p.fig.squash === wide && p.fig.turning && wide < 1, 'stopped in the middle of a turn: it stays as it is');
    const on = watch(p, 0.3, { fx: 0, fy: -1 });
    assert.ok(on[on.length - 1].back && on[on.length - 1].wide === 1, 'and it goes on when the game does');
  });
});

test('in a turn the picture closes in on the line through the feet, and the scarf\'s knot comes in with it', () => {
  withFlip(() => {
    const s = new Stage();
    watch(s, 1, {});
    const f = FRONT.idle[0];
    // standing: the frame lies where its anchor says (the made-up frames are 20 wide, anchored 10 in)
    assert.deepEqual(s.fig.span(f, 100), [90, 20]);
    assert.deepEqual(s.fig.span(f, 100, 2), [80, 40]);
    let narrowest = 1;
    for (let k = 0; k < 12; k++) {
      s.t += DT;
      const shown = s.fig.frame(HERO, { ...STANDING, animT: s.t, fx: 0, fy: -1 }, DT, 0, 0, false);
      const q = s.fig.squash;
      narrowest = Math.min(narrowest, q);
      const [left, wide] = s.fig.span(shown, 100);
      // to the half pixel (the picture has two pixels to a game pixel), and never wider than it is
      assert.ok(Math.abs(wide - 20 * q) <= 0.25 + 1e-9 && Math.abs(left - (100 - 10 * q)) <= 0.25 + 1e-9, `at ${q.toFixed(2)} of its width: from ${left}, ${wide} wide`);
      assert.ok(Number.isInteger(left * 2) && Number.isInteger(wide * 2), 'on the half pixel');
      assert.ok(left >= 90 && left + wide <= 110 + 1e-9, 'inside where it stands at full width');
      // the knot of the scarf (one pixel left of the feet at full width) is where the narrower picture has it
      const knot = s.fig.tails.shapes()[0].points[0];
      assert.ok(Math.abs(knot - -1 * q) < 0.02, `the knot ${knot.toFixed(3)} from the feet, at ${q.toFixed(2)} of the width`);
    }
    assert.ok(narrowest < 0.7, '(a turn was watched)');
    // a new hero is not in the middle of the old one's turn
    const t = new Stage();
    watch(t, 0.3, {});
    watch(t, 3 * DT, { fx: 0, fy: -1 });
    assert.ok(t.fig.turning);
    t.fig.reset();
    assert.ok(!t.fig.turning && t.fig.squash === 1);
  });
});

test('no flip (the game as it is since Version 14.5): a hero who turns simply faces the new way, at once and at full width', () => {
  assert.equal(TURN_FLIP.on, false, 'the flip is switched off in the game');
  withBlankCanvas(() => {
    // front to back: the back from the first call, never narrow, never "turning"
    const s = new Stage();
    watch(s, 0.3, {});
    const away = watch(s, 0.3, { fx: 0, fy: -1 });
    assert.ok(away.every((x) => x.back && x.wide === 1 && !x.turning), 'facing away from the first call');
    const again = watch(s, 0.3, {});
    assert.ok(again.every((x) => !x.back && x.wide === 1 && !x.turning), 'and facing us again from the first call');
    // right to left: the mirror image from the first call
    const r = new Stage();
    watch(r, 0.3, { fx: 1, fy: 0 });
    const left = watch(r, 0.3, { fx: 0, fy: 1 });
    assert.ok(left.every((x) => !FRONT.idle.includes(x.frame) && x.wide === 1 && !x.turning), 'the mirror image from the first call');
    assert.ok(left[0].frame === flipSprite(loopFrame(FRONT, r.t - (left.length - 1) * DT)), 'the same picture, in a mirror');
    // a picture is never drawn narrow, whatever the hero does: a second of a thumb going round and round
    const w = new Stage();
    for (let k = 0; k < 60; k++) {
      const a = (k * 37 * Math.PI) / 180;
      const [x] = watch(w, DT, { anim: 'walk', fx: Math.cos(a), fy: Math.sin(a) });
      assert.ok(x.wide === 1 && !x.turning, `call ${k}: at full width`);
      assert.deepEqual(w.fig.span(x.frame, 100), [100 - x.frame.ax, x.frame.w]);
    }
    // THE SIDE IS STILL KEPT until the hero has clearly turned out of it (that is not the flip): a
    // thumb wobbling on the line between two sides does not change the picture
    const at = (deg: number): Partial<FigureState> => ({ anim: 'walk', fx: Math.cos(((45 + deg) * Math.PI) / 180), fy: Math.sin(((45 + deg) * Math.PI) / 180) });
    const hold = (Math.asin(VIEW_STICK / Math.SQRT2) * 180) / Math.PI;
    const v = new Stage();
    watch(v, 0.3, at(-20));
    for (let k = 0; k < 60; k++) {
      const [x] = watch(v, DT, at(k % 2 ? 4 : -4));
      assert.ok(FRONT.walk.includes(x.frame), `wobbling on the line, call ${k}: the same side`);
    }
    const turned = watch(v, 0.1, at(hold + 3));
    assert.ok(turned.every((x) => !FRONT.walk.includes(x.frame)), 'clearly past the line: the other side, from the first call');
    for (let k = 0; k < 60; k++) {
      const [x] = watch(v, DT, at(k % 2 ? 4 : -4));
      assert.ok(!FRONT.walk.includes(x.frame), `wobbling back over the line, call ${k}: it stays turned`);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// What flies from the figure

test('the scarf goes with the picture shown: tied where the frame says, carried where the hero goes, gone with a new hero', () => {
  const fig = new Figure();
  const show = (state: Partial<FigureState>, ox: number, oy: number, dt = DT): Sprite => fig.frame(HERO, { ...STANDING, ...state }, dt, ox, oy, false);
  assert.deepEqual(fig.tails.shapes(), [], 'nothing flies from a figure that has not been shown');
  for (let k = 0; k < 120; k++) show({ animT: k * DT }, 0, 0);
  const tied = fig.tails.shapes();
  assert.deepEqual(tied.map((t) => [t.id, t.over]), [['w-scarf-a', false]], 'the tail the frame names, on the side of the figure it names');
  // (the made-up frames tie it one pixel left of the feet and twenty-one above them)
  assert.ok(Math.abs(tied[0].points[0] + 1) < 1e-3 && Math.abs(tied[0].points[1] + 21) < 1e-3, 'tied where the frame says, from the feet');
  const n = tied[0].points.length;
  assert.ok(tied[0].points[n - 2] < -6, 'and blown out behind a figure that faces screen-right');
  // time passes for it as for the figure: stopped, it hangs as it is; running, it moves
  const before = [...tied[0].points];
  show({ animT: 2 }, 0, 0, 0);
  assert.deepEqual(fig.tails.shapes()[0].points, before, 'no time, no movement');
  show({ animT: 2 }, 0, 0);
  assert.ok(fig.tails.shapes()[0].points.some((v, i) => v !== before[i]), 'a sixtieth of a second, and it has moved');
  // the hero walks off across the level, and warps: it comes along, never left stretched behind
  let ox = 0;
  for (let k = 0; k < 120; k++) {
    ox += 1.7;
    show({ anim: 'walk', animT: 2 + k * DT }, ox, 0);
  }
  show({ animT: 5 }, ox + 600, -300);
  const p = fig.tails.shapes()[0].points;
  assert.ok(Math.abs(p[0] + 1) < 1e-2 && Math.abs(p[1] + 21) < 1e-2, 'still tied to the figure');
  for (let i = 0; i < n; i += 2) assert.ok(Math.hypot(p[i] - p[0], p[i + 1] - p[1]) < 20, 'all of it within its own length of the knot');
  // a picture that names no tail has none
  const bare: AnimSet = { idle: frames('bare idle', 2, null), walk: frames('bare walk', 4, null), attack: frames('bare attack', 3, null) };
  fig.frame({ front: bare, back: bare }, STANDING, DT, 0, 0);
  assert.deepEqual(fig.tails.shapes(), []);
  // a new hero: nothing of the old one is kept, not its scarf and not the thing it was in the middle of
  const s = new Stage();
  untilBegun(s, 30);
  assert.ok(s.fig.busy && s.fig.tails.shapes().length === 1);
  s.fig.reset();
  assert.ok(!s.fig.busy);
  assert.deepEqual(s.fig.tails.shapes(), []);
  const fresh = s.t;
  const again = untilBegun(s, 30);
  assert.ok(again.at.t - fresh >= GESTURE_FIRST - 1e-9 && again.at.began === 1, 'the new hero waits their own wait, and begins with the first thing');
});

/**
 * Mirroring a frame draws it onto a new canvas. The mirror image itself is not looked at here
 * (there is no picture in these frames to mirror): what is, is everything that goes with it. So
 * for as long as `fn` runs, asking for a canvas gives one that takes whatever is drawn on it and
 * does nothing.
 */
function withBlankCanvas(fn: () => void): void {
  const g = globalThis as unknown as { document?: unknown };
  const had = g.document;
  const pen = { translate(): void {}, scale(): void {}, drawImage(): void {} };
  g.document = { createElement: (): unknown => ({ width: 0, height: 0, getContext: (): unknown => pen }) };
  try {
    fn();
  } finally {
    if (had === undefined) delete g.document;
    else g.document = had;
  }
}

test('facing screen-left the same frames are shown in a mirror: the knot, the lights and the scarf itself change sides', () => {
  withBlankCanvas(() => {
    // a frame at the finer grain (two picture pixels to a game pixel), with all that a hero's frame carries
    const s: Sprite = {
      img: 'a frame' as unknown as HTMLCanvasElement, w: 22, h: 33, ax: 8, ay: 32, density: 2,
      lights: [{ x: 15, y: 10, r: 9, color: '#22d0e0', a: 0.3 }],
      aura: { x: 6, y: 17, r: 23, color: '#28dcf0', a: 0.2 },
      tails: [{ id: 'w-scarf-a', x: 7, y: 9.5, over: false }, { id: 'w-scarf-b', x: 7, y: 10.25, over: true }],
    };
    const m = flipSprite(s);
    assert.ok(m !== s && flipSprite(s) === m, 'one mirror image for a frame, however often it is asked for');
    assert.deepEqual([m.w, m.h, m.ay, m.density], [22, 33, 32, 2]);
    // the anchor names a pixel: its mirror is one picture pixel (half a game pixel) short of the far edge
    assert.equal(m.ax, 22 - 0.5 - 8);
    // everything else is a point, and is as far from the right edge as it was from the left
    assert.deepEqual(m.lights, [{ x: 7, y: 10, r: 9, color: '#22d0e0', a: 0.3 }]);
    assert.deepEqual(m.aura, { x: 16, y: 17, r: 23, color: '#28dcf0', a: 0.2 });
    assert.deepEqual(m.tails, [{ id: 'w-scarf-a', x: 15, y: 9.5, over: false }, { id: 'w-scarf-b', x: 15, y: 10.25, over: true }], 'each tail tied at the mirrored spot, on the same side of the figure (behind it, or in front)');
    assert.deepEqual(s.tails, [{ id: 'w-scarf-a', x: 7, y: 9.5, over: false }, { id: 'w-scarf-b', x: 7, y: 10.25, over: true }], 'and the frame it was made from is untouched');
    // so, measured from the feet, the knot is as far to the right as it was to the left (to the half pixel the anchor is wide)
    assert.equal(15 - m.ax, -(7 - s.ax) + 0.5);

    // the figure: facing screen-left (toward the camera, then away from it) it shows the mirror image of the frame it would show facing right
    for (const [fx, fy, set] of [[0, 1, HERO.front], [-1, 0, HERO.back]] as const) {
      const left = new Stage();
      const right = new Stage();
      const mirrored = left.play(3, { fx, fy }, false);
      // (a facing is a step in the world, and the screen's left and right are its two world axes swapped)
      const plain = right.play(3, { fx: fy, fy: fx }, false);
      mirrored.forEach((shown, i) => {
        assert.ok(set.idle.includes(plain[i].frame), 'the frame for a figure facing the other way');
        assert.ok(shown.frame !== plain[i].frame && shown.frame === flipSprite(plain[i].frame), `facing (${fx}, ${fy}): the mirror image of ${plain[i].name}`);
      });
      // and its scarf: tied on the other side of the feet, and blown out the other way
      const a = right.fig.tails.shapes()[0].points;
      const b = left.fig.tails.shapes()[0].points;
      const n = a.length;
      assert.ok(Math.abs(a[0] + 1) < 1e-3 && Math.abs(b[0] - 2) < 1e-3 && Math.abs(a[1] - b[1]) < 1e-3, `the knot: ${a[0].toFixed(2)} from the feet facing right, ${b[0].toFixed(2)} facing left`);
      assert.ok(a[n - 2] < a[0] - 6 && b[n - 2] > b[0] + 6, 'the free end: behind the figure either way');
      for (let i = 0; i < n; i += 2) assert.ok(Math.abs((b[i] - b[0]) + (a[i] - a[0])) < 1e-3 && Math.abs(b[i + 1] - a[i + 1]) < 1e-3, 'the same scarf, in a mirror');
    }
  });
  assert.equal((globalThis as unknown as { document?: unknown }).document, undefined, 'the blank canvas is taken away again');
});
