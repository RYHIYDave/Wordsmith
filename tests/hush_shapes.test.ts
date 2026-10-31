// FLOOR 20'S SHAPES OF THE HUSH (src/art/hush_shapes.ts, their look; src/art/hush_shapes_moves.ts, their moves). A MOCK-UP:
// NOT IN THE GAME, behind HUSHSHAPES_ON, off. His pick for how they move was “Drifting, then darting (Recommended)”; the brief
// as offered (art/hush_shapes.ts): the Hush itself, grey fog pulled into a hunched, faceless figure with long thin arms and
// one open, silent mouth; the knight's size, in swarms; one attack, the grip; it unravels into wisps as it dies and a word it
// had swallowed flies home. THEIR RHYTHM MADE NEW (30 Oct), his pick “Yes, these (Recommended)” to "THE HUSH'S SHAPES never
// still, swirling round you in a tightening spiral, faster as they close, then wrapping you": no drift then dart (the dart is
// out of their moves, its code kept); they circle you, slow on the far ring and fast on the near one, and swoop, the swirl's
// last fast turn the wind-up of their grip. Held as floor 16's are (tests/palace_hands.test.ts, tests/princess.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind, and every
//      handover (circling, slow and fast, to either side, into the other pace, into the swoop, struck and struck down; out
//      of its hover, its drift, its grip, struck and its swoop into circling; the swoop into its grip);
//   3. HIS LIGHTNING STRIKES (Movement 9): the grip and the swoop each strike in two frames, landing on the second; the
//      strike and the frame after it smeared, no other frame;
//   4. every frame paints both ways round: nothing cyan, the pink rim while it lives and none as it dies, every pixel whole
//      or empty but the rim (crisp);
//   5. NOTHING CUT OFF: in every frame, both ways round, it (its swoop, its fog streaming round you, its smear, its word
//      flying home) is inside its picture with room to spare;
//   6. NOTHING OF IT IN THE FLOOR: nothing it is made of is below the floor in any frame;
//   7. ITS MARK: the one open mouth, its gape and the Hush's dull pink in it, seen from in front; no face from behind;
//      its fog thinned to mist below, and streaming off it in every frame it lives;
//   8. STRUCK, the fog tearing and closing; ITS DEATH, unravelling to nothing, the word it swallowed coming out in the
//      Hush's pink and flying away in its own colour, gone by the end;
//   9. LOOSE THINGS FOLLOW: its tail trails as it drifts; circling, its fog is left behind the way it goes from, more so fast;
//      swooping, it is flung on past as it brakes square before you, and streams out again as it swirls off;
//  10. ITS SIZES IN TILES: the knight's size; its drift kept; its arms spread two tiles in its warning and shutting more than
//      a tile before it; the grip's coils snap shut in two frames round an area more than a tile and a half across, nothing
//      cyan in them;
//  11. THEIR RHYTHM: no dart among their moves; the circling glides, to its left and to its right, slow and fast, each a round
//      of the walk's frames, all facing you, turned into the way it goes and leaning into the turn, more so fast; the
//      spiral's numbers (its rings, its paces, faster as it closes);
//  12. THE FOG ROUND THE CURVE: circling, its tail's end and its ribbons of fog out behind it, the way it goes from, curving
//      in round the ring toward you; streaming further fast than slow;
//  13. THE SWOOP: the game's carrying it through its last fast turn (a burst, braking to nothing square before you, its ring
//      closing to the grip's); its arms flung wide two tiles and held, the pink in its throat burning, a quarter of a second
//      and more; then its grip as it always was; and out into its slow glide.
//   run: tsx --test tests/hush_shapes.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { GRIP_FX, HS_CANVAS, HS_FOG, HS_MIST, HS_PALE, HS_SMEAR, HS_THROAT, HS_WORD, HUSHSHAPES_ON, gripCoils, gripPainted, hushPainter, hushWord, tailOf } from '../src/art/hush_shapes';
import { HS_CIRCLE, HS_DART, HS_DIES, HS_GLIDE_MOVES, HS_GLIDES, HS_GRIP, HS_PACE, HS_REEL, HS_SAY, HS_SHAPE, HS_STRIKES, HS_SWOOP, HUSH_SHAPE, circlePace, glidePace, glideRing, gripAt, hushBonesOf, lagAt, orbitOf, smearedAt, swoopCarry, swoopPace } from '../src/art/hush_shapes_moves';
import { WORD_COLOR } from '../src/art/icons';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { KNIGHT_BODY } from '../src/art/moves3';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

const VIEWS = ['front', 'back'] as const;
const MOB: Mob = HUSH_SHAPE;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
const cyanIn = (p: Painted): boolean => {
  const { d } = p.px;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) return true;
  }
  return p.lights.some((l) => {
    const [r, g, b] = rgba(l.color);
    return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
  });
};
/** How many whole pixels of these colours a frame has. */
const countOf = (p: Painted, colours: ReadonlyArray<string>): number => {
  const want = new Set(colours.map((c) => rgba(c).slice(0, 3).join(',')));
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && want.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};
const solidIn = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const SWOOPS = ['swoopLeft', 'swoopRight'] as const;
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const stageOf = (): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move (the game's frames of each: framesOf), painted on its whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(HUSHSHAPES_ON.on, false, 'HUSHSHAPES_ON is off');
  const users: string[] = [];
  const theirs = /^art\/hush_shapes(_moves)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || theirs.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (theirs.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,circleLeft,circleRight,circleLeftFast,circleRightFast,swoopLeft,swoopRight');
  const found = checkBoss(MOB, HS_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKES: the grip and the swoop each strike in two frames, landing on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(HS_STRIKES).sort().join(','), 'attack,swoopLeft,swoopRight');
  assert.equal(MOB.attack.motion.hit, HS_STRIKES.attack[1], 'the grip lands on its strike\'s last frame');
  for (const w of SWOOPS) assert.equal(moveOf(w)?.motion.hit, HS_STRIKES[w][1], `${w} lands on its strike's last frame`);
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(HS_STRIKES)) {
    assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: its strike is two frames`);
    for (const { move: m, view, t, p } of PAINTED) {
      if (m !== move) continue;
      const n = countOf(p, HS_SMEAR);
      const want = smearedAt(move, t);
      if (want && n < 12) faults.push(`${said(m, view, t)}: its smear only ${n} pixels`);
      if (!want && n > 0) faults.push(`${said(m, view, t)}: smeared out of its strike (${n})`);
    }
  }
  for (const { move, view, t, p } of PAINTED) if (!HS_STRIKES[move] && countOf(p, HS_SMEAR) > 0) faults.push(`${said(move, view, t)}: smeared`);
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink rim while it lives and none as it dies, every pixel whole or empty but the rim', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { d } = p.px;
    let n = 0;
    let rim = 0;
    let odd = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      n++;
      if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
      if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    }
    const alive = move !== 'dying';
    if ((alive && n < 600) || cyanIn(p) || odd || (alive ? rim < 40 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the rim, ${odd} neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, all of it is inside its picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${HS_CANVAS.w}x${HS_CANVAS.h}`);
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!d[(y * w + x) * 4 + 3]) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) continue;
    const room = Math.min(x0, y0, w - 1 - x1, h - 1 - y1);
    least = Math.min(least, room);
    if (room < ROOM) faults.push(`${said(move, view, t)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest it comes to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  else if (sh.k === 'panel') z = sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  return Math.max(0, -z);
}

test('6. NOTHING OF IT IN THE FLOOR: nothing it is made of, in any frame of any move', () => {
  const faults: string[] = [];
  const st = stageOf();
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      const bits: Bit[] = MOB.bits(st, at(move, t));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
      for (const [p] of MOB.grains?.(st, at(move, t)) ?? []) if (p[2] < -0.6) faults.push(`${move} @${t.toFixed(2)}: its fog ${(-p[2]).toFixed(1)} into the floor`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. ITS MARK: its one open mouth, gaping dark with the Hush\'s dull pink in it, from in front; no face from behind; its fog thinned to mist below and streaming off it while it lives', () => {
  const faults: string[] = [];
  let mouthFront = 0;
  let front = 0;
  let mouthBack = 0;
  let back = 0;
  let mist = 0;
  let all = 0;
  for (const { move, view, t, p } of PAINTED) {
    if (move === 'dying') continue;
    const gape = countOf(p, [HS_THROAT]);
    const pink = countOf(p, [FLAME[1], FLAME[2], FLAME[3]]);
    if (view === 'front') {
      front++;
      if (gape >= 3 && pink >= 1) mouthFront++;
    } else {
      back++;
      if (gape > 0) mouthBack++;
    }
    // (its tail always comes apart into mist as it hovers, drifts and circles; as it grips its tail may swing in under it, out of sight)
    const misty = countOf(p, [HS_MIST]) >= 4;
    if (!misty && (move === 'stand' || move === 'walk' || move.startsWith('circle'))) faults.push(`${said(move, view, t)}: no mist at its tail`);
    if (misty) mist++;
    all++;
  }
  assert.ok(mist >= 0.95 * all, `mist at its tail in ${mist} of ${all} frames it lives`);
  assert.ok(mouthFront >= 0.9 * front, `its gape and the pink in it, from in front, in ${mouthFront} of ${front} frames`);
  assert.ok(mouthBack <= 0.1 * back, `its gape seen from behind in ${mouthBack} of ${back} frames`);
  // (faceless: its only marks on its head are its gape and the pink in its throat; no eyes)
  const st = stageOf();
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const m = at(move, t);
      const dots = MOB.bits(st, m).filter((b) => b.shape.k === 'dot');
      if (dots.length !== 1 || dots[0].piece !== 'throat') faults.push(`${move} @${t.toFixed(2)}: ${dots.length} marks on its head`);
      if (!(MOB.grains?.(st, m) ?? []).length) faults.push(`${move} @${t.toFixed(2)}: no fog streaming off it`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('8. STRUCK, its fog torn and closing; ITS DEATH, unravelling to nothing, the word it swallowed coming out and flying home, gone by the end', () => {
  // (struck: a gash torn through it, closed again by the end)
  const whole: Mob = { ...MOB, ...((): Pick<Mob, 'bits' | 'grains' | 'finish'> => { const p = hushPainter({ ...HS_SAY, tear: () => 0 }); return { bits: p.bits, grains: p.grains, finish: p.finish }; })() };
  for (const view of VIEWS) {
    const torn = solidIn(paintMob(MOB, 'reel', 2 / 30, view));
    const not = solidIn(paintMob(whole, 'reel', 2 / 30, view));
    assert.ok(not - torn >= 25, `${view}: torn through by ${not - torn} pixels as it is struck`);
    assert.equal(solidIn(paintMob(MOB, 'reel', HS_REEL, view)), solidIn(paintMob(whole, 'reel', HS_REEL, view)), `${view}: closed again`);
  }
  // (its death: whole as it is struck, less and less of its fog, nothing at the end but a few last wisps)
  const own = WORD_COLOR[HS_WORD.id];
  const fog = [...HS_FOG, ...HS_PALE];
  for (const view of VIEWS) {
    const k = (t: number): Painted => deathOfMob(MOB, t / MOB.dieTime, view);
    const counts = [0.2, 0.7, 0.95, 1.2].map((t) => countOf(k(t), fog));
    assert.ok(counts[0] > 800, `${view}: ${counts[0]} pixels of its fog as it is struck`);
    assert.ok(counts[1] < counts[0] && counts[2] < counts[1] && counts[3] < counts[2], `${view}: unravelling, ${counts.join(', ')}`);
    assert.equal(countOf(k(HS_DIES.long), fog), 0, `${view}: its fog all gone at its end`);
    assert.ok(solidIn(k(HS_DIES.long)) < 80, `${view}: ${solidIn(k(HS_DIES.long))} pixels left at its end`);
    // the word: in the Hush's pink as it comes out; its own colour as it flies; gone by the end
    assert.ok(countOf(k(0.4), [FLAME[1]]) >= 8, `${view}: the word coming out in the Hush's pink`);
    assert.ok(countOf(k(1.25), [own]) >= 8, `${view}: the word in its own colour as it flies`);
    assert.equal(countOf(k(HS_DIES.word[4] + 0.05), [own]), 0, `${view}: the word gone home`);
  }
  // (never the twin or frost words, whose colours read as the hero's cyan: as from the Moth)
  for (const id of ['twin', 'frost', 'frost2'] as const) {
    const was = HS_WORD.id;
    HS_WORD.id = id;
    assert.ok(hushWord() !== id, `asked for ${id}, it lets go ${hushWord()}`);
    HS_WORD.id = was;
  }
});

test('9. LOOSE THINGS FOLLOW: its tail trails as it drifts; circling, its fog left behind the way it goes from; swooping, flung on past as it brakes, streaming out again as it swirls off', () => {
  for (let t = 0; t < 1.2; t += 0.1) assert.ok(lagAt('walk', t)[0] < -4, `drifting @${t.toFixed(1)}: its tail ${lagAt('walk', t)[0].toFixed(1)} behind it`);
  // circling: left behind on the side it goes from, every frame, more so fast
  for (const g of HS_GLIDE_MOVES) {
    const { side, fast } = HS_GLIDES[g];
    for (let t = 0; t < 1.2; t += 0.1) assert.ok(lagAt(g, t)[1] * side < (fast ? -24 : -16), `${g} @${t.toFixed(1)}: its fog ${lagAt(g, t)[1].toFixed(1)} to its side`);
  }
  assert.ok(Math.abs(lagAt('circleLeftFast', 0)[1]) > Math.abs(lagAt('circleLeft', 0)[1]) + 3, 'left further behind fast than slow');
  for (const w of SWOOPS) {
    const side = w === 'swoopLeft' ? 1 : -1;
    // (out of the near ring's glide as that left it)
    const from = lagAt(side > 0 ? 'circleLeftFast' : 'circleRightFast', 0);
    const at0 = lagAt(w, 0);
    assert.ok(Math.hypot(at0[0] - from[0], at0[1] - from[1], at0[2] - from[2]) < 3, `${w}: its fog as the near ring's glide left it`);
    // (flung on past it as it brakes square before you)
    let past = 0;
    for (let t = HS_SWOOP.turn[1]; t <= HS_SWOOP.warn[1]; t += 1 / 30) past = Math.max(past, lagAt(w, t)[1] * side);
    assert.ok(past > 2, `${w}: as it brakes, its fog flung on ${past.toFixed(1)} past it, the way it was going`);
    assert.ok(Math.hypot(...lagAt(w, HS_SWOOP.warn[1])) < 4, `${w}: settled by the end of its warning (${Math.hypot(...lagAt(w, HS_SWOOP.warn[1])).toFixed(1)})`);
    // (and streaming out again as it swirls off, into its slow glide's)
    const end = lagAt(w, HS_SWOOP.long);
    const slow = lagAt(side > 0 ? 'circleLeft' : 'circleRight', 0);
    assert.ok(Math.hypot(end[0] - slow[0], end[1] - slow[1], end[2] - slow[2]) < 4, `${w}: its fog at its end as its slow glide's (${end.map((v) => v.toFixed(1)).join(',')})`);
  }
});

test('10. ITS SIZES, IN TILES: the knight\'s size; its drift kept; arms spread two tiles; the grip shutting a tile and more before it, round an area a tile and a half across', () => {
  // the knight's size (his crown, standing; its crown, hunched as it hovers)
  let top = 0;
  for (const t of framesOf(MOB, 'stand')) {
    const s = skeletonAt(MOB, 'stand', t);
    top = Math.max(top, s.head[2] + MOB.build.headR[2]);
  }
  const k = top / KNIGHT_BODY.tall;
  assert.ok(k > 0.85 && k < 1.15, `its crown ${top.toFixed(1)} over the floor, the knight's ${KNIGHT_BODY.tall}`);
  // its drift (its walk) kept as it was, carried at its pace
  assert.equal(HS_PACE, 1.5);
  assert.equal(MOB.walk.ground, HS_PACE * TILE3, 'carried at its pace');
  // (the dart's code is kept, out of their moves: four tiles in two frames, as it was)
  assert.equal(HS_DART.carry, 4 * TILE3);
  // the grip: arms spread two tiles and more, hand to hand, in its warning; shut more than a tile before it
  const w = skeletonAt(MOB, 'attack', (HS_GRIP.warn[0] + HS_GRIP.warn[1]) / 2);
  const span = Math.hypot(w.handL[0] - w.handR[0], w.handL[1] - w.handR[1], w.handL[2] - w.handR[2]) / TILE3;
  assert.ok(span >= 2, `its arms spread ${span.toFixed(2)} tiles in its warning`);
  const g = gripAt();
  assert.ok(g[0] / TILE3 >= 1.2, `its grip shuts ${(g[0] / TILE3).toFixed(2)} tiles before it`);
  assert.ok((2 * GRIP_FX.area) / TILE3 >= 1.6, `the area it shuts on ${((2 * GRIP_FX.area) / TILE3).toFixed(2)} tiles across`);
  // the grip's coils: snapped shut in two frames, held, and gone; nothing cyan
  const radius = (t: number): number => Math.max(...gripCoils(t).flatMap((c) => c.pts.map((p) => Math.hypot(p[0], p[1]))));
  assert.ok(radius(0) > 1.6 * radius(GRIP_FX.snap[1]), `snapped shut: ${radius(0).toFixed(1)} to ${radius(GRIP_FX.snap[1]).toFixed(1)} in two frames`);
  assert.equal(Math.round(GRIP_FX.snap[1] * 30), 2);
  for (const view of VIEWS) {
    for (let t = 0; t < GRIP_FX.long; t += 1 / 30) {
      for (const half of ['far', 'near'] as const) assert.ok(!cyanIn(gripPainted(t, view, half)), `the grip ${view} ${half} @${t.toFixed(2)}: cyan`);
    }
    assert.ok(solidIn(gripPainted(0.2, view, 'near')) > 60 && solidIn(gripPainted(0.2, view, 'far')) > 60, `${view}: the grip round whoever it holds, before and behind them`);
    assert.equal(solidIn(gripPainted(GRIP_FX.long, view, 'all')), 0, `${view}: the grip gone by its end`);
  }
});

test('11. THEIR RHYTHM: no dart; the circling glides to either side, slow and fast, each a round of the walk\'s frames, facing you, turned into the way it goes and leaning into the turn; the spiral\'s numbers', () => {
  // (his pick of 30 Oct: never still, swirling round you; the dart is not one of their moves, its code kept)
  assert.equal(Object.keys(MOB.more ?? {}).join(','), 'circleLeft,circleRight,circleLeftFast,circleRightFast,swoopLeft,swoopRight');
  assert.ok(!movesOf(MOB).includes('dart'), 'the dart is one of their moves');
  // the spiral: far ring 5 tiles at 3 tiles a second, near ring 2.5 at 6.5 (the knight walks 2.5), closing 0.8 tiles a second
  const C = HS_CIRCLE;
  assert.equal(`${C.slow.ring},${C.slow.pace},${C.fast.ring},${C.fast.pace},${C.closing},${C.switchAt},${C.burst},${C.grip}`, '5,3,2.5,6.5,0.8,3.75,8,1.5');
  assert.ok(C.switchAt < C.slow.ring && C.switchAt > C.fast.ring, 'the fast glide from between the rings');
  assert.ok(Math.abs(C.grip - gripAt()[0] / TILE3) < 0.02, `the grip's ring where its grip shuts (${(gripAt()[0] / TILE3).toFixed(2)} tiles)`);
  assert.equal(circlePace(C.slow.ring), C.slow.pace);
  assert.equal(circlePace(C.fast.ring), C.fast.pace);
  for (let r = C.slow.ring; r > C.fast.ring; r -= 0.25) {
    assert.ok(circlePace(r - 0.25) > circlePace(r), `faster as it closes (${r} tiles)`);
    assert.ok(circlePace(r - 0.25) / (r - 0.25) > circlePace(r) / r, `round you faster as it closes (${r} tiles)`);
  }
  const lean: Record<string, { turn: number; tilt: number }> = {};
  for (const g of HS_GLIDE_MOVES) {
    const { side } = HS_GLIDES[g];
    const mv = moveOf(g);
    assert.ok(mv && mv.motion.loop !== undefined && mv.ground === 0 && Math.abs((mv.period ?? 0) - 1.2) < 1e-9, `${g}: a glide going round, carried by the game to its side`);
    const ts = framesOf(MOB, g);
    assert.equal(ts.length, MOB.walkFrames + 1, `${g}: a round of the walk's frames`);
    let turn = 0;
    let tilt = 0;
    for (const t of ts) {
      const s = skeletonAt(MOB, g, t);
      assert.ok(s.face[0][0] > 0.9 && s.hips[0][0] > 0.85, `${g} @${t.toFixed(1)}: not facing you`);
      assert.ok(s.hips[0][1] * side > 0.12, `${g} @${t.toFixed(1)}: not turned into the way it goes (${s.hips[0][1].toFixed(2)})`);
      assert.ok(s.chest[2][1] * side > 0.05 && s.chest[2][0] > 0.3, `${g} @${t.toFixed(1)}: not leaning into the turn (${s.chest[2].map((v) => v.toFixed(2)).join(',')})`);
      turn += s.hips[0][1] * side;
      tilt += s.chest[2][1] * side;
    }
    lean[g] = { turn: turn / ts.length, tilt: tilt / ts.length };
    assert.equal(glidePace(g), HS_GLIDES[g].fast ? C.fast.pace : C.slow.pace);
    assert.equal(glideRing(g), HS_GLIDES[g].fast ? C.fast.ring : C.slow.ring);
  }
  for (const [slow, fast] of [['circleLeft', 'circleLeftFast'], ['circleRight', 'circleRightFast']]) {
    assert.ok(lean[fast].turn > lean[slow].turn + 0.05 && lean[fast].tilt > lean[slow].tilt + 0.03, `${fast} turned and leaning more than ${slow}`);
  }
});

test('12. THE FOG ROUND THE CURVE: circling, its tail and its ribbons of fog out behind it the way it goes from, curving in round the ring toward you; further fast than slow', () => {
  const st = stageOf();
  const straight = hushPainter({ ...HS_SAY, orbit: (m) => { const o = HS_SAY.orbit?.(m); return o ? { ...o, r: 1e9 } : null; } });
  const far: Record<string, number> = {};
  for (const g of HS_GLIDE_MOVES) {
    const { side } = HS_GLIDES[g];
    const ring = glideRing(g) * TILE3;
    let reach = 0;
    for (const t of framesOf(MOB, g)) {
      const m = at(g, t);
      const s = m.s;
      // its tail's end out to the side it goes from, and curved in toward you round the ring
      const lag = lagAt(g, t);
      const tip = tailOf(s, lag, t, ring)[6].c;
      const tip0 = tailOf(s, lag, t)[6].c;
      assert.ok((tip[1] - s.pelvis[1]) * side < -15, `${g} @${t.toFixed(1)}: its tail's end ${(tip[1] - s.pelvis[1]).toFixed(1)} to its side`);
      assert.ok(Math.abs(tip[0] - tip0[0] - (tip0[1] - tailOf(s, lag, t)[0].c[1]) ** 2 / (2 * ring)) < 4 && tip[0] > tip0[0], `${g} @${t.toFixed(1)}: its tail curved round the ring`);
      // its fog streaming: out on the side it goes from, each wisp and ribbon curved in round the ring toward you
      orbitOf(g, t);
      MOB.bits(st, m);
      const gr = MOB.grains?.(st, m) ?? [];
      const m2 = at(g, t);
      straight.bits(st, m2);
      const gr0 = straight.grains(st, m2);
      assert.equal(gr.length, gr0.length, `${g} @${t.toFixed(1)}: its fog the same but for the curve`);
      let out = 0;
      let bent = 0;
      for (let i = 0; i < gr.length; i++) {
        const off = (gr[i][0][1] - s.pelvis[1]) * side;
        if (off < -25) {
          out++;
          if (gr[i][0][0] - gr0[i][0][0] > 0.4) bent++;
        }
        reach = Math.max(reach, -off);
      }
      assert.ok(out >= 25, `${g} @${t.toFixed(1)}: only ${out} wisps of its fog out behind it`);
      assert.ok(bent >= 0.6 * out, `${g} @${t.toFixed(1)}: only ${bent} of ${out} curved round toward you`);
    }
    far[g] = reach;
  }
  for (const [slow, fast] of [['circleLeft', 'circleLeftFast'], ['circleRight', 'circleRightFast']]) assert.ok(far[fast] > 1.2 * far[slow], `${fast}'s fog streaming ${far[fast].toFixed(0)} out, ${slow}'s ${far[slow].toFixed(0)}`);
});

test('13. THE SWOOP: its last fast turn (a burst, braking square before you, its ring closing to the grip\'s), its arms flung wide and held; then its grip as it always was; and out into its slow glide', () => {
  const C = HS_CIRCLE;
  const [t0, t1] = HS_SWOOP.turn;
  // the game's carrying it: from the near ring's pace, a burst, braking to nothing square before you by the end of the turn
  assert.equal(swoopPace(0), C.fast.pace);
  let top = 0;
  for (let t = t0; t <= t1; t += 1 / 60) top = Math.max(top, swoopPace(t));
  assert.ok(top >= C.burst - 0.05, `its burst ${top.toFixed(2)} tiles a second`);
  for (let t = t1; t <= HS_SWOOP.off[0]; t += 1 / 30) assert.ok(swoopPace(t) < 1e-6, `still before you @${t.toFixed(2)}`);
  assert.equal(swoopPace(HS_SWOOP.long), C.slow.pace, 'out at the far ring\'s pace as it swirls off');
  assert.ok(Math.abs(swoopCarry(t1).inward - (C.fast.ring - C.grip)) < 1e-6, `its ring closed ${swoopCarry(t1).inward.toFixed(2)} tiles, to the grip's`);
  assert.ok(swoopCarry(t1).round > 1.5, `its last turn ${swoopCarry(t1).round.toFixed(2)} tiles round you`);
  for (const w of SWOOPS) {
    const mv = moveOf(w);
    assert.ok(mv, w);
    if (!mv) continue;
    // ITS WARNING: arms flung wide, two tiles and more hand to hand, the pink in its throat at its full, its mouth gaping, held from the end of its turn to its hips coming first
    let held = 0;
    for (const t of framesOf(MOB, w)) {
      if (t < t1 - 1e-6 || t > HS_SWOOP.warn[1] + 1e-6) continue;
      const s = skeletonAt(MOB, w, t);
      const span = Math.hypot(s.handL[0] - s.handR[0], s.handL[1] - s.handR[1], s.handL[2] - s.handR[2]) / TILE3;
      assert.ok(span >= 2, `${w} @${t.toFixed(2)}: its arms ${span.toFixed(2)} tiles apart`);
      assert.ok((mv.glint?.(t) ?? 0) > 0.99 && (mv.jaw?.(t) ?? 0) > 1.2, `${w} @${t.toFixed(2)}: its warning`);
      held++;
    }
    assert.ok(held >= 8, `${w}: its warning held ${held} frames`);
    // (the turn: its arms rising and spreading as it goes round, its mouth opening, the pink rising)
    assert.ok((mv.glint?.(0.2) ?? 0) > 0.3 && (mv.glint?.(0.2) ?? 0) < 1, `${w}: the pink rising through its turn`);
    // THEN ITS GRIP AS IT ALWAYS WAS: every bone, its fingers, its mouth and its warning the grip's, from its warning's end through the hold
    for (const t of framesOf(MOB, w)) {
      if (t < HS_SWOOP.warn[1] - 1e-6 || t > HS_SWOOP.hold + 1e-6) continue;
      const a = hushBonesOf(w, t);
      const b = hushBonesOf('attack', t);
      for (const k of ['head', 'ribs', 'pelvis', 'handL', 'handR', 'elbowL', 'elbowR', 'shoulderL', 'shoulderR'] as const) {
        const d = Math.hypot(a[k][0] - b[k][0], a[k][1] - b[k][1], a[k][2] - b[k][2]);
        assert.ok(d < 1e-6, `${w} @${t.toFixed(2)}: its ${k} not the grip's (${d.toFixed(3)})`);
      }
      assert.ok(Math.abs((mv.jaw?.(t) ?? 0) - (MOB.attack.jaw?.(t) ?? 0)) < 1e-9 && Math.abs((mv.glint?.(t) ?? 0) - (MOB.attack.glint?.(t) ?? 0)) < 1e-9, `${w} @${t.toFixed(2)}: its mouth or its warning not the grip's`);
      const h0 = HS_SAY.hands(at(w, t));
      const h1 = HS_SAY.hands(at('attack', t));
      assert.ok(Math.abs(h0.splay - h1.splay) < 1e-9 && Math.abs(h0.curl - h1.curl) < 1e-9, `${w} @${t.toFixed(2)}: its fingers not the grip's`);
    }
    assert.equal(mv.motion.hit, MOB.attack.motion.hit, `${w}: its grip lands as the grip does`);
    // AND OUT INTO ITS SLOW GLIDE, the same way round
    const e = hushBonesOf(w, HS_SWOOP.long);
    const g = hushBonesOf(w === 'swoopLeft' ? 'circleLeft' : 'circleRight', 0);
    for (const k of ['head', 'ribs', 'pelvis', 'handL', 'handR'] as const) assert.ok(Math.hypot(e[k][0] - g[k][0], e[k][1] - g[k][1], e[k][2] - g[k][2]) < 0.5, `${w}: its end not its slow glide's (${k})`);
  }
});
