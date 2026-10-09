// The monsters' pictures, as the game shows them (Version 14).
//
// The owner, 4 Oct 2026: "we need the dungeons and mobs brought up to the level of the character
// models". Each monster is now a rig of its own built with the heroes' kit (src/art/monster_*.ts),
// handed to the game by src/art/bestiary.ts. Every frame of every one of them is painted here
// (about 760), a plain painting standing in for the canvas (tests/helpers.ts), and held to what
// the game needs of it:
//   - it is all there: both facings, standing, walking, an attack (the Warden: two);
//   - no frame runs off the canvas it was painted on;
//   - the attack is played by the rules' clock, and its blow is on a frame;
//   - what glows on an enemy is never the heroes' cyan;
//   - the sizes the game goes by (the bar over a head, a finger on a monster) fit the pictures;
//   - the flat-colour copies of frames that a hit or an ailment asks for cannot fill a phone's memory.
// (Written before THE MONSTERS' ATTACKS of Version 19.8, it holds them off, rules and pictures: the
// monsters here have their one attack, as they had then. tests/monster_attacks.test.ts has them on.)
//   run: tsx --test tests/monsters.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { FIGURE_SIZE, MONSTER_FIGURES, figureOf, makeBestiary, useMonsterAttacks } from '../src/art/bestiary';
import type { ClassicFigure as MonsterFigure } from '../src/art/bestiary';
import { CLIP_FPS, GRAIN, IDLE_FRAMES, KAX, KAY, KH, KW, RIM_ALPHA, WALK_FRAMES } from '../src/art/kit';
import { DEATH_FPS, DEATH_TIME, ENEMY_RIM, onGrid, strike } from '../src/art/mkit';
import type { Canvas } from '../src/art/mkit';
import { BRUTE_CANVAS } from '../src/art/monster_brute';
import { WARDEN_CANVAS } from '../src/art/monster_warden';
import { TINT_BUDGET, rgba, silhouette, tintedPixels } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { RNG } from '../src/engine/rng';
import { MONSTERS, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { MONSTER_KINDS } from '../src/game/types';
import type { MonsterKind } from '../src/game/types';
import { attackFrame, monsterAttackAge } from '../src/render/figure';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();
useMonsterAttacks(false);

const BEASTS = makeBestiary();
const VIEWS = ['front', 'back'] as const;
type View = (typeof VIEWS)[number];

/** The canvas each figure is painted on: the kit's, or a bigger one of its own. */
const KIT: Canvas = { w: KW, h: KH, ax: KAX, ay: KAY };
const CANVAS: Record<MonsterFigure, Canvas> = { skeleton: KIT, archer: KIT, cultist: KIT, bat: KIT, brute: BRUTE_CANVAS, guardian: BRUTE_CANVAS, warden: WARDEN_CANVAS };
/** The monster of the rules each figure is the picture of. */
const KIND: Record<MonsterFigure, MonsterKind> = { skeleton: 'skeleton', archer: 'archer', cultist: 'cultist', bat: 'bat', brute: 'brute', guardian: 'brute', warden: 'warden' };

function clip(set: AnimSet, k: 'attack' | 'heavy'): Clip {
  const c = set.clips ? set.clips[k] : undefined;
  if (!c) throw new Error(`no ${k} clip`);
  return c;
}

/** Every figure, facing each way. */
function each(fn: (figure: MonsterFigure, view: View, set: AnimSet, name: string, art: ActorArt) => void): void {
  for (const figure of MONSTER_FIGURES) {
    const art = BEASTS.of(figure);
    for (const view of VIEWS) fn(figure, view, art[view], `the ${figure}, ${view === 'front' ? 'facing the camera' : 'facing away'}`, art);
  }
}

/** Every animation of one facing: its name and its frames. */
function lists(set: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['standing', set.idle], ['walking', set.walk], ['attack', clip(set, 'attack').frames]];
  if (set.clips && set.clips.heavy) out.push(['second attack', set.clips.heavy.frames]);
  if (set.clips && set.clips.die) out.push(['death', set.clips.die.frames]);
  return out;
}

/** How many pixels of a frame are painted. */
function pixels(s: Sprite): number {
  const p = paintingOf(s);
  let n = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) n++;
  return n;
}

/** How many different pictures there are in a list of frames. */
function different(frames: Sprite[]): number {
  const kept: Sprite[] = [];
  for (const f of Array.from(frames)) if (!kept.some((k) => unlike(k, f) === 0)) kept.push(f);
  return kept.length;
}

// =============================================================================================

test('every monster of the rules has a figure, and the guardian one of its own', () => {
  for (const kind of MONSTER_KINDS) assert.equal(figureOf({ kind, champion: false }), kind);
  assert.equal(figureOf({ kind: 'brute', champion: true }), 'guardian', 'a guardian is a brute in the rules, and its own figure');
  assert.equal(figureOf({ kind: 'warden', champion: false }), 'warden');
  assert.deepEqual([...MONSTER_FIGURES].sort(), [...MONSTER_KINDS, 'guardian'].sort());
  // (one set of pictures for each, however often it is asked for)
  for (const f of MONSTER_FIGURES) assert.ok(BEASTS.of(f) === BEASTS.of(f));
  assert.ok(BEASTS.of('brute') !== BEASTS.of('guardian'));
});

test('every figure has every animation, facing the camera and facing away', () => {
  each((figure, _view, set, name) => {
    assert.deepEqual([set.idle.length, set.walk.length], [IDLE_FRAMES, WALK_FRAMES], `${name}: a standing loop of twelve frames and a walk of eight`);
    assert.ok((set.idleFps ?? 0) >= 6 && (set.idleFps ?? 0) <= 24 && (set.walkFps ?? 0) >= 8 && (set.walkFps ?? 0) <= 20, `${name}: played at a pace of its own (${set.idleFps} and ${set.walkFps} frames a second)`);
    assert.ok(set.clips, `${name}: its attack is a timeline`);
    const c = clip(set, 'attack');
    assert.equal(c.fps, CLIP_FPS, `${name}: the attack plays at thirty frames a second`);
    assert.ok(c.frames.length >= 14, `${name}: the attack is a real swing (${c.frames.length} frames; it used to be three poses)`);
    assert.equal(set.attack.length, 3, `${name}: and three stills of it for older code`);
    // only the Warden has two attacks
    assert.equal(!!(set.clips && set.clips.heavy), figure === 'warden', `${name}: ${figure === 'warden' ? 'has' : 'has no'} second attack`);
    // it is a picture: something is painted in every frame, and it is at the heroes' grain
    for (const [what, frames] of lists(set)) {
      Array.from(frames).forEach((f, i) => {
        assert.equal(f.density, GRAIN, `${name}: ${what}, frame ${i}, is painted at the finer grain`);
        assert.ok(pixels(f) > 60, `${name}: ${what}, frame ${i}, is a picture (${pixels(f)} pixels)`);
      });
    }
  });
});

test('seen from the front and from behind they are two pictures, and neither stands like a statue', () => {
  for (const figure of MONSTER_FIGURES) {
    const art = BEASTS.of(figure);
    const whole = pixels(art.front.idle[0]);
    const apart = unlike(art.front.idle[0], art.back.idle[0]);
    assert.ok(apart > whole * 0.12, `the ${figure}: its back is not its front (${apart} of ${whole} pixels differ)`);
    for (const view of VIEWS) {
      const set = art[view];
      assert.ok(different(set.idle) >= 4, `the ${figure}, ${view}: it breathes (${different(set.idle)} different pictures in the standing loop)`);
      assert.ok(different(set.walk) >= 6, `the ${figure}, ${view}: it walks (${different(set.walk)} different pictures in eight)`);
      // (the walk is not the standing figure slid along)
      let most = 0;
      for (const f of Array.from(set.walk)) most = Math.max(most, unlike(f, set.idle[0]));
      assert.ok(most > whole * 0.06, `the ${figure}, ${view}: walking moves it (${most} pixels at the most)`);
    }
  }
});

test('no frame of any of them runs off the canvas it was painted on', () => {
  each((figure, _view, set, name) => {
    const cv = CANVAS[figure];
    for (const [what, frames] of lists(set)) {
      Array.from(frames).forEach((f, i) => {
        const p = paintingOf(f);
        // (a frame is cut down to what is painted, and anchored: measure it back from its anchor)
        const left = -f.ax * GRAIN;
        const top = -f.ay * GRAIN;
        assert.ok(left > -cv.ax && top > -cv.ay && left + p.w < cv.w - cv.ax && top + p.h < cv.h - cv.ay, `${name}: ${what}, frame ${i}, keeps clear of the edge of its ${cv.w} x ${cv.h} canvas (it reaches ${-left} left, ${-top} up, ${left + p.w} right and ${top + p.h} down of the floor point)`);
      });
    }
  });
});

test('nothing sinks into the floor: what stands, stands on it', () => {
  for (const figure of MONSTER_FIGURES) {
    for (const view of VIEWS) {
      const set = BEASTS.of(figure)[view];
      for (const f of [...Array.from(set.idle), ...Array.from(set.walk)]) {
        const p = paintingOf(f);
        // how far below the floor point the picture reaches, and how far above it it starts
        const below = p.h - f.ay * GRAIN;
        // (the crisp edge of light round a living monster, Version 17, is one picture pixel more of
        // picture all round it, and a frame is cut on whole game pixels: so up to two picture pixels
        // more below than the figure's own lowest. The bounds were 8 and 10 before it.)
        if (figure === 'bat') assert.ok(below < -7, `the bat, ${view}: it flies (its lowest pixel is ${-below} above the floor)`);
        else assert.ok(below >= -4 && below <= 12, `the ${figure}, ${view}: its feet are on the floor (the picture ends ${below} pixels below the floor point)`);
      }
    }
  }
});

// The owner, 5 Oct 2026: "I think we want death animations and corpses for enemies."
// Each figure's death is its own (the skeletons fall apart into their bones, the cultist crumples
// and his fire goes out, the bat drops, the brutes go over, the Warden comes apart piece by
// piece), painted from the figure's own picture (art/death.ts), and its LAST FRAME IS ITS BODY,
// which the game leaves lying where it fell until the hero leaves the dungeon.
// (The cultist's and the brutes' were switched off for Version 15.0, `DEATH_PAINTED` in their
// files: he saw the first ones and said they were not very good. Both were painted again on 6 Oct
// 2026, an empty cloak crumpling and a brute whose knees go, and are on again; NOT YET LIVE. A
// figure whose death is switched off goes in this list: it then bursts and leaves nothing.)
const NO_DEATH_YET: MonsterFigure[] = [];
test('every figure has a death of its own, seen from both sides, and it ends as a body lying on the floor', () => {
  assert.equal(DEATH_FPS, 20);
  each((figure, _view, set, name) => {
    const die = set.clips ? set.clips.die : undefined;
    if (NO_DEATH_YET.includes(figure)) {
      assert.ok(!die, `${name}: its death is switched off (take it out of NO_DEATH_YET when it is painted again)`);
      return;
    }
    assert.ok(die, `${name}: it has a death`);
    if (!die) return;
    assert.equal(die.fps, DEATH_FPS, `${name}: its death plays at twenty frames a second`);
    const frames = Array.from(die.frames);
    const seconds = (frames.length - 1) / DEATH_FPS;
    assert.ok(seconds >= DEATH_TIME - 0.01 && seconds <= 2.5, `${name}: it takes ${seconds} seconds to die`);
    // it begins as the figure stood (or flew): the same size, near enough
    const stood = paintingOf(set.idle[0]);
    const first = paintingOf(frames[0]);
    assert.ok(Math.abs(first.w - stood.w) <= 6 && Math.abs(first.h - stood.h) <= 6, `${name}: its death begins as it stood (${first.w} x ${first.h}; standing it is ${stood.w} x ${stood.h})`);
    // it moves: most of its frames are pictures of their own
    assert.ok(different(frames) >= frames.length * 0.7, `${name}: ${different(frames)} different pictures in ${frames.length} frames`);
    // its body: lower than it stood (the bat: on the floor, where it never was), with its foot on the floor
    const body = frames[frames.length - 1];
    const lying = paintingOf(body);
    const below = lying.h - body.ay * GRAIN;
    // (measured against the figure at its tallest while it dies: a brute that carries its club at
    // its side is as broad as it is tall until, struck, it flings the club up; and then it goes over)
    const tallest = Math.max(...frames.map((f) => paintingOf(f).h));
    if (figure !== 'bat') assert.ok(lying.h <= tallest * 0.72, `${name}: its body lies (${lying.h} pixels high; dying, it stood ${tallest})`);
    assert.ok(below >= 0 && below <= 12, `${name}: its body is on the floor (the picture ends ${below} pixels below the floor point)`);
    assert.ok(pixels(body) > 400, `${name}: there is something of it left to see (${pixels(body)} pixels)`);
    // nothing on a body gives off light
    assert.equal((body.lights ?? []).length, 0, `${name}: its body gives off no light`);
    assert.ok(!body.aura, `${name}: and has no pool of light behind it`);
    // and no dying thing has a pool of light behind it either
    for (const f of frames) assert.ok(!f.aura, `${name}: a dying thing has no pool of light behind it`);
  });
  // the big ones take longer to fall, and the Warden the longest by far
  const long = (f: MonsterFigure): number => (BEASTS.of(f).front.clips?.die?.frames.length ?? 0) - 1;
  if (NO_DEATH_YET.length === 0) assert.ok(long('brute') > long('skeleton') && long('guardian') > long('brute'), `skeleton ${long('skeleton')}, brute ${long('brute')}, guardian ${long('guardian')} frames`);
  assert.ok(long('warden') >= long('skeleton') * 2, `skeleton ${long('skeleton')}, Warden ${long('warden')} frames`);
});

test('the fire is out of a dead thing: no pixel of a body is the colour of an eye or of a flame', () => {
  // (what burns in the living is SOCKET and the hot end of FLAME: art/mkit.ts)
  const hot = ['#ff4f8a', '#ffb070', '#fff0a0'].map((c) => rgba(c));
  each((figure, _view, set, name) => {
    const die = set.clips ? set.clips.die : undefined;
    if (!die) return;
    const body = paintingOf(die.frames[die.frames.length - 1]);
    let burning = 0;
    for (let y = 0; y < body.h; y++) {
      for (let x = 0; x < body.w; x++) {
        if (!body.has(x, y)) continue;
        const i = (y * body.w + x) * 4;
        if (hot.some((c) => c[0] === body.d[i] && c[1] === body.d[i + 1] && c[2] === body.d[i + 2])) burning++;
      }
    }
    // (the archer's hood, the brutes' loincloths and the Warden's cape are red cloth, which is none of these)
    assert.equal(burning, 0, `${name}: ${burning} pixels of its body still burn`);
    void figure;
  });
});

// The owner, 6 Oct 2026, of his "visual overhaul": "Give the entities a subtle neon glow or a loop
// crisp 1-pixel border so they pop against the dark dungeon". A hero's edge is cyan (art/skin.ts);
// an enemy's is the pink of its eyes, on every frame of it alive and on none of its death.
test('a living monster has a crisp edge of pink light all round it, one picture pixel wide; a dying one has none', () => {
  const pink = rgba(ENEMY_RIM);
  /** The pixels of a frame that are the edge: the rim's colour, part seen through. */
  const rimOf = (f: Sprite): { n: number; lonely: number; outline: number } => {
    const p = paintingOf(f);
    const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < p.w && y < p.h && p.d[(y * p.w + x) * 4 + 3] === 255;
    let n = 0;
    let lonely = 0;
    let outline = 0;
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const i = (y * p.w + x) * 4;
        const a = p.d[i + 3];
        if (a === RIM_ALPHA && p.d[i] === pink[0] && p.d[i + 1] === pink[1] && p.d[i + 2] === pink[2]) {
          n++;
          // (an edge pixel lies against the figure)
          if (!(solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) lonely++;
        } else if (a === 0 && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) outline++;
      }
    }
    return { n, lonely, outline };
  };
  each((figure, _view, set, name) => {
    const clips = set.clips;
    const alive: Sprite[] = [set.idle[0], set.walk[3], ...(clips && clips.attack ? [clips.attack.frames[Math.floor(clips.attack.frames.length / 2)]] : [])];
    for (const f of alive) {
      const r = rimOf(f);
      assert.ok(r.n > 40, `${name}: an edge of light round it (${r.n} pixels)`);
      assert.equal(r.lonely, 0, `${name}: every pixel of the edge lies against the figure`);
      assert.equal(r.outline, 0, `${name}: and the edge goes all the way round (${r.outline} bare places)`);
    }
    const die = clips ? clips.die : undefined;
    if (die) for (const f of [die.frames[Math.floor(die.frames.length / 2)], die.frames[die.frames.length - 1]]) assert.equal(rimOf(f).n, 0, `${name}: no edge of light on the dying or the dead`);
    void figure;
  });
});

test("the attack's blow is on a frame, and where the rules land it", () => {
  each((figure, view, set, name, art) => {
    const def = MONSTERS[KIND[figure]];
    const moves: ['attack' | 'heavy', number][] = figure === 'warden' ? [['attack', def.windup], ['heavy', TUNE.wardenVolleyWindup]] : [['attack', def.windup]];
    for (const [k, windup] of moves) {
      const c = clip(set, k);
      const hit = c.hit;
      assert.ok(hit !== undefined, `${name}: the ${k} has a moment of impact`);
      if (hit === undefined) return;
      // The picture's wind-up is played by how much of the rules' is done, so the two need not be
      // equal: but the picture's is the rules' to the nearest frame, or it would crawl or snap.
      assert.ok(Math.abs(hit * c.fps - Math.round(hit * c.fps)) < 1e-6, `${name}: the ${k}'s blow is on a frame (${(hit * c.fps).toFixed(3)})`);
      assert.ok(Math.abs(hit - windup) <= 0.5 / c.fps + 1e-9, `${name}: the ${k} winds up for ${hit.toFixed(3)} s in the picture, ${windup} s in the rules`);
      // after the blow the rules give the monster TUNE.monsterRecover in which it does nothing else
      const after = (c.frames.length - 1) / c.fps - hit;
      assert.ok(Math.abs(after - TUNE.monsterRecover) <= 1 / c.fps + 1e-9, `${name}: ${after.toFixed(3)} s of picture after the ${k}'s blow, ${TUNE.monsterRecover} s of rest in the rules`);
      // the same attack seen from the other side: as long, and landing at the same moment
      const other = clip(art[view === 'front' ? 'back' : 'front'], k);
      assert.deepEqual([c.frames.length, c.hit], [other.frames.length, other.hit], `${name}: front and back agree about the ${k}`);
    }
  });
});

test('an attack begins as the figure stands, is unmistakable when wound up, and comes back to standing', () => {
  each((figure, _view, set, name) => {
    const rest = set.idle[0];
    const whole = pixels(rest);
    for (const k of figure === 'warden' ? (['attack', 'heavy'] as const) : (['attack'] as const)) {
      const c = clip(set, k);
      const n = c.frames.length;
      const hitFrame = Math.round((c.hit ?? 0) * c.fps);
      // (to within a few pixels: a flame or a pair of eyes may be at another moment of its own flicker)
      assert.ok(unlike(c.frames[0], rest) <= whole * 0.08, `${name}: the ${k} begins as the figure stands (${unlike(c.frames[0], rest)} of ${whole} pixels differ)`);
      assert.ok(unlike(c.frames[n - 1], rest) <= whole * 0.12, `${name}: the ${k} ends as the figure stands (${unlike(c.frames[n - 1], rest)} of ${whole} pixels differ)`);
      // THE WARNING: three quarters of the way through the wind-up the figure looks nothing like itself standing
      const wound = c.frames[Math.round(hitFrame * 0.75)];
      assert.ok(unlike(wound, rest) > whole * 0.35, `${name}: wound up for the ${k}, it does not look as it does standing (${unlike(wound, rest)} of ${whole} pixels differ)`);
      // and it is HELD: the frames of the last third of the wind-up are close to one another (the
      // player has time to see it), where the blow itself is a big change in one frame or two
      const held = unlike(c.frames[Math.round(hitFrame * 0.7)], c.frames[Math.round(hitFrame * 0.85)]);
      const blow = unlike(c.frames[Math.round(hitFrame * 0.85)], c.frames[hitFrame]);
      assert.ok(held < blow, `${name}: the wound-up pose of the ${k} is held (${held} pixels change while it is held, ${blow} as the blow falls)`);
    }
  });
  // (the Warden's two attacks must not be mistaken for one another, from early on)
  for (const view of VIEWS) {
    const set = BEASTS.of('warden')[view];
    const slam = clip(set, 'attack');
    const volley = clip(set, 'heavy');
    const a = slam.frames[Math.round((slam.hit ?? 0) * slam.fps * 0.4)];
    const b = volley.frames[Math.round((volley.hit ?? 0) * volley.fps * 0.4)];
    assert.ok(unlike(a, b) > pixels(set.idle[0]) * 0.3, `the Warden, ${view}: two fifths of the way into the wind-up the slam and the volley are different pictures (${unlike(a, b)} pixels)`);
  }
});

test('what glows on an enemy is hot pink burning to gold, never the cyan of the heroes', () => {
  each((_figure, _view, set, name) => {
    let lights = 0;
    for (const [what, frames] of lists(set)) {
      Array.from(frames).forEach((f, i) => {
        for (const l of f.lights ?? []) {
          lights++;
          const [r, g, b] = rgba(l.color);
          assert.ok(r >= 150 && r >= b && r >= g, `${name}: ${what}, frame ${i}: a light of ${l.color} (red ${r}, green ${g}, blue ${b})`);
          assert.ok(l.r > 0 && l.r < 60 && (l.a ?? 0.5) > 0 && (l.a ?? 0.5) <= 1, `${name}: ${what}, frame ${i}: a light of a sensible size (${l.r} game pixels across, strength ${l.a})`);
        }
        // the pool of light behind it: a monster's own, pink, and dim
        if (f.aura) {
          const [r, , b] = rgba(f.aura.color);
          assert.ok(r > b && (f.aura.a ?? 0.5) <= 0.25, `${name}: ${what}, frame ${i}: its pool of light is ${f.aura.color}, strength ${f.aura.a}`);
        }
      });
    }
    // (every one of them has eyes that glow, at the least from the front)
    if (name.includes('facing the camera')) assert.ok(lights > 0, `${name}: something on it glows`);
  });
  // the cultist's fire swells as the warning of its attack: far brighter wound up than at rest
  for (const view of VIEWS) {
    const set = BEASTS.of('cultist')[view];
    const c = clip(set, 'attack');
    const big = (s: Sprite): number => Math.max(0, ...(s.lights ?? []).map((l) => l.r));
    const wound = c.frames[Math.round((c.hit ?? 0) * c.fps * 0.8)];
    assert.ok(big(wound) > big(set.idle[0]) * 1.5, `the cultist, ${view}: wound up, its fire lights ${big(wound)} game pixels round it; at rest ${big(set.idle[0])}`);
  }
});

test('the sizes the game goes by fit the pictures: where a bar hangs, and what a finger is on', () => {
  for (const figure of MONSTER_FIGURES) {
    const size = FIGURE_SIZE[figure];
    const s = BEASTS.of(figure).front.idle[0];
    const p = paintingOf(s);
    const ax = Math.round(s.ax * GRAIN);
    const ay = Math.round(s.ay * GRAIN);
    // The top of the HEAD: the highest thing painted on the figure's own centre line (a sword or a
    // club held up beside the head is higher, and is not where a bar of life should hang).
    // (The Warden's horns are part of his head, and stand to either side of that line.)
    const span = figure === 'warden' ? 22 : 3;
    let head = 0;
    for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - span; x <= ax + span; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
    assert.ok(Math.abs(size.top - head) <= 4, `the ${figure}: the game takes its head to be ${size.top} game pixels up; in the picture it is ${head}`);
    assert.ok(size.top <= s.ay + 1, `the ${figure}: that is not above the picture (${s.ay} tall)`);
    // Half its width: within the picture's own (which includes whatever it holds out to the side)
    const reach = Math.max(s.ax, s.w - s.ax);
    assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `the ${figure}: the game takes it to be ${size.half} game pixels to either side; the picture reaches ${reach}`);
  }
  // and they are the sizes they were asked to be, beside one another
  const tall = (f: MonsterFigure): number => FIGURE_SIZE[f].top;
  assert.ok(tall('bat') < tall('skeleton') && tall('skeleton') < tall('guardian') && tall('brute') < tall('guardian') && tall('guardian') < tall('warden'), 'bat, skeleton, guardian, Warden: each taller than the last');
  assert.ok(tall('warden') >= tall('skeleton') * 2, 'the Warden towers: twice a skeleton');
});

test("played by the rules' clock, a monster's picture lands its blow in the step the rules land theirs", () => {
  const dt = 1 / 60;
  for (const figure of MONSTER_FIGURES) {
    for (const chilled of [false, true]) {
      for (const move of figure === 'warden' ? ([0, 1] as const) : ([0] as const)) {
        // an empty practice room, a hero who stands still, and the monster beside them (the Warden's volley: further off)
        const g = Game.forPractice('warrior', 5);
        const hooks = g as unknown as { waveT: number; spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster; wakeUp(m: Monster): void };
        hooks.waveT = 1e9;
        g.monsters.length = 0;
        const h = g.hero;
        const kind = KIND[figure];
        const far = move === 1 ? 6 : kind === 'archer' || kind === 'cultist' ? 4.5 : kind === 'warden' ? 2.4 : 0.9;
        const m = hooks.spawn(kind, h.x - far, h.y, 1, figure === 'guardian' ? 2 : 0, figure === 'warden', new RNG(9));
        hooks.wakeUp(m);
        m.cd = 0;
        m.speed = 0;
        m.life = m.maxLife = 1e9;
        if (chilled) {
          m.chillT = 99;
          m.chill = 0.6;
        }
        assert.equal(figureOf(m), figure);
        const windup = move === 1 ? TUNE.wardenVolleyWindup : MONSTERS[kind].windup;
        const what = `the ${figure}${move === 1 ? "'s volley" : ''}${chilled ? ', chilled' : ''}`;
        const art = BEASTS.of(figure);
        const ctl = emptyControls();
        const shown = (): number => {
          const set = m.fx + m.fy < -0.2 ? art.back : art.front;
          const c = clip(set, move === 1 ? 'heavy' : 'attack');
          return c.frames.indexOf(attackFrame(c, monsterAttackAge(m.state === 'windup', m.t, windup), windup));
        };
        const c0 = clip(art.front, move === 1 ? 'heavy' : 'attack');
        const blow = Math.round((c0.hit ?? 0) * c0.fps);
        let began = -1;
        let landed = -1;
        let before = 0;
        let last = 0;
        let steps = 0;
        for (let k = 0; k < 600; k++) {
          const was = m.state;
          g.update(dt, ctl);
          h.life = h.d.maxLife;
          if (m.anim !== 'attack') {
            if (landed >= 0) break;
            continue;
          }
          if (began < 0) {
            began = k;
            assert.equal(m.atk, move, `${what}: it is that attack`);
            assert.ok(shown() <= 1, `${what}: begun, the picture is at its start (frame ${shown()})`);
          }
          const i = shown();
          assert.ok(i >= 0, `${what}: a frame of that attack is shown`);
          assert.ok(i >= last, `${what}: the picture does not run backwards (${last} then ${i})`);
          if (m.state === 'windup') {
            assert.ok(i < blow, `${what}: while the rules wind it up the picture is short of its blow (frame ${i}; the blow is ${blow})`);
            before = i;
            steps++;
          }
          if (was === 'windup' && m.state === 'recover') {
            landed = i;
            assert.ok(i === blow, `${what}: in the step the rules land the blow the picture is on the frame of its blow (${i}; the blow is ${blow}; before it ${before})`);
          }
          last = i;
        }
        assert.ok(landed >= 0, `${what}: it made its attack`);
        // (a chilled monster winds up more slowly in the rules, and so in the picture)
        const took = steps * dt;
        const want = windup / (chilled ? 0.6 + 0.4 * (1 - 0.6) : 1);
        assert.ok(Math.abs(took - want) <= 2 * dt + 1e-9, `${what}: it wound up for ${took.toFixed(3)} s (the rules: ${want.toFixed(3)})`);
        const n = c0.frames.length;
        assert.ok(last >= n - 3, `${what}: when it may act again the picture has run to its end (frame ${last} of ${n - 1})`);
      }
    }
  }
});

test('the rules count a wind-up down: how far the picture has got is read off what is left', () => {
  const w = 0.85;
  assert.equal(monsterAttackAge(true, w, w), 0, 'just begun');
  assert.ok(Math.abs(monsterAttackAge(true, w / 2, w) - w / 2) < 1e-12, 'half done');
  assert.ok(Math.abs(monsterAttackAge(true, 0.01, w) - (w - 0.01)) < 1e-12, 'all but done');
  // (while the rules have not landed the blow the picture is a hair short of it, however little is left)
  const done = monsterAttackAge(true, 0, w);
  assert.ok(done < w && done > w * 0.999, `nothing left to count, and not yet struck: ${done}`);
  assert.equal(monsterAttackAge(true, 1e-17, w), done, '(the count can stop a rounding error short of nothing)');
  assert.equal(monsterAttackAge(true, -0.004, w), done, '(or a step can carry it a little past)');
  assert.equal(monsterAttackAge(true, w * 2, w), 0, '(more left than there ever was: not begun)');
  // then it rests, and the picture goes on from its blow at its own pace
  assert.ok(Math.abs(monsterAttackAge(false, TUNE.monsterRecover, w) - w) < 1e-12, 'the blow has just landed');
  assert.ok(Math.abs(monsterAttackAge(false, 0.1, w) - (w + TUNE.monsterRecover - 0.1)) < 1e-12);
  assert.ok(Math.abs(monsterAttackAge(false, 0, w) - (w + TUNE.monsterRecover)) < 1e-12, 'it may act again');
  assert.equal(TUNE.monsterRecover, 0.3, 'the rest after a blow is what it was');
  assert.equal(TUNE.wardenVolleyWindup, 0.7, "and the wind-up of the Warden's volley");
});

test('a blow that falls between two frames is put on the nearest', () => {
  const t = strike(0.85, { hx: 1 }, { hx: 2 }, { hx: 3 });
  assert.equal(t.hit, 0.85);
  const g = onGrid(t);
  assert.ok(Math.abs((g.hit ?? 0) - 26 / 30) < 1e-12, `0.85 s is between frames 25 and 26: it goes to ${g.hit}`);
  assert.equal(g.keys.length, t.keys.length);
  // the keys keep their order and their poses; those up to the blow are stretched, those after moved along
  g.keys.forEach((k, i) => {
    assert.deepEqual(k.pose, t.keys[i].pose);
    assert.ok(i === 0 || k.at > g.keys[i - 1].at, 'in order');
    if (t.keys[i].at <= 0.85) assert.ok(Math.abs(k.at - (t.keys[i].at * (26 / 30)) / 0.85) < 1e-12);
    else assert.ok(Math.abs(k.at - (t.keys[i].at + 26 / 30 - 0.85)) < 1e-12);
  });
  assert.ok(Math.abs(g.keys[g.keys.length - 1].at - (g.hit ?? 0) - 0.3) < 1e-12, 'and it still ends three tenths of a second after the blow');
  // one already on a frame is left alone
  const on = strike(0.4, {}, {}, {});
  assert.ok(onGrid(on) === on);
  // and one with no blow at all
  const none = { keys: [{ at: 0, pose: {} }, { at: 1, pose: {} }] };
  assert.ok(onGrid(none) === none);
});

test('frames are painted ahead of need a figure at a time, turn and turn about', () => {
  // (a bestiary of its own: nothing of it has been looked at yet)
  const fresh = makeBestiary();
  let painted = 0;
  const proto = Object.getPrototypeOf(paintingOf(BEASTS.of('bat').front.idle[0])) as { toCanvas: () => unknown };
  const plain = proto.toCanvas;
  proto.toCanvas = function (this: unknown): unknown {
    painted++;
    return plain.call(this);
  };
  try {
    const figures: MonsterFigure[] = ['skeleton', 'bat'];
    const total = (f: MonsterFigure): number => {
      const art = BEASTS.of(f);
      // (standing, walking, the attack, and last of all how it dies)
      return VIEWS.reduce((n, v) => n + art[v].idle.length + art[v].walk.length + clip(art[v], 'attack').frames.length + (art[v].clips?.die?.frames.length ?? 0), 0);
    };
    // one frame a call
    for (let i = 1; i <= 6; i++) {
      assert.equal(fresh.warm(figures), true);
      assert.equal(painted, i, 'one frame is painted each time');
    }
    // forty frames of each (standing and walking, both ways) before any of the attacks: after
    // eighty calls both can stand and walk, and reading those frames paints nothing more
    for (let i = 6; i < 80; i++) fresh.warm(figures);
    assert.equal(painted, 80);
    for (const f of figures) for (const v of VIEWS) for (const list of [fresh.of(f)[v].idle, fresh.of(f)[v].walk]) for (let i = 0; i < list.length; i++) void list[i];
    assert.equal(painted, 80, 'standing and walking were painted first, for both of them');
    // to the end: every frame once, and then there is nothing left to do
    let calls = 80;
    while (fresh.warm(figures)) calls++;
    assert.equal(calls, total('skeleton') + total('bat'), 'every frame of both');
    assert.equal(painted, calls);
    assert.equal(fresh.warm(figures), false);
    assert.equal(painted, calls, 'and nothing is painted twice');
    // a figure that turns up later (the Warden calls skeletons; a new dungeon has cultists) takes its turn
    assert.equal(fresh.warm(['skeleton', 'cultist']), true);
    assert.equal(fresh.warm([]), false, 'with nothing in the dungeon there is nothing to paint');
  } finally {
    proto.toCanvas = plain;
  }
});

test("flat-colour copies of frames (a hit's flash, what ails a monster) are kept only up to a budget", () => {
  // (a canvas that takes whatever is drawn on it and does nothing: the copies' sizes are what is counted)
  const g = globalThis as unknown as { document?: unknown };
  const had = g.document;
  const pen = { drawImage(): void {}, fillRect(): void {}, globalCompositeOperation: '', fillStyle: '' };
  g.document = { createElement: (): unknown => ({ width: 0, height: 0, getContext: (): unknown => pen }) };
  try {
    const frame = (w: number, h: number): Sprite => ({ img: { width: w, height: h } as unknown as HTMLCanvasElement, w: w / 2, h: h / 2, ax: 7, ay: 9, density: 2 });
    const before = tintedPixels();
    const a = frame(100, 120);
    const white = silhouette(a, '#ffffff');
    assert.ok(silhouette(a, '#ffffff') === white, 'one copy of a frame in a colour, however often it is asked for');
    assert.ok(silhouette(a, '#3cc4c0') !== white, 'another colour, another copy');
    assert.equal(tintedPixels(), before + 2 * 100 * 120);
    assert.deepEqual([white.w, white.h, white.ax, white.ay, white.density], [50, 60, 7, 9, 2], 'laid down where the frame is');
    // a long evening: the Warden struck on every frame of his, thirty times over
    let most = 0;
    for (let i = 0; i < 2000; i++) {
      silhouette(frame(180, 240), '#ffffff');
      most = Math.max(most, tintedPixels());
      assert.ok(tintedPixels() <= TINT_BUDGET, `never more than the budget (${tintedPixels()} pixels kept)`);
    }
    assert.ok(most > TINT_BUDGET * 0.9, `and the budget is used (${most} of ${TINT_BUDGET})`);
    // the first was let go with the rest, and is simply made again when it is wanted
    const again = silhouette(a, '#ffffff');
    assert.ok(again !== white && silhouette(a, '#ffffff') === again);
  } finally {
    if (had === undefined) delete g.document;
    else g.document = had;
  }
});
