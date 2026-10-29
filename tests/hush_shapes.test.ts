// FLOOR 20'S SHAPES OF THE HUSH (src/art/hush_shapes.ts, their look; src/art/hush_shapes_moves.ts, their moves). A MOCK-UP:
// NOT IN THE GAME, behind HUSHSHAPES_ON, off. His pick for how they move: “Drifting, then darting (Recommended)”; the brief
// as offered (art/hush_shapes.ts): the Hush itself, grey fog pulled into a hunched, faceless figure with long thin arms and
// one open, silent mouth; the knight's size, in swarms; it drifts slowly, then darts in fast; one attack, the grip; it
// unravels into wisps as it dies and a word it had swallowed flies home. Held as floor 16's are (tests/palace_hands.test.ts,
// tests/princess.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind, and every
//      handover (the drift into the dart and the grip, the dart into what follows four tiles on);
//   3. HIS LIGHTNING STRIKES (Movement 9): the dart and the grip each strike in two frames, the grip landing on the second;
//      the strike and the frame after it smeared, no other frame;
//   4. every frame paints both ways round: nothing cyan, the pink rim while it lives and none as it dies, every pixel whole
//      or empty but the rim (crisp);
//   5. NOTHING CUT OFF: in every frame, both ways round, it (its dart, its smear, its word flying home) is inside its
//      picture with room to spare;
//   6. NOTHING OF IT IN THE FLOOR: nothing it is made of is below the floor in any frame;
//   7. ITS MARK: the one open mouth, its gape and the Hush's dull pink in it, seen from in front; no face from behind;
//      its fog thinned to mist below (every frame it hovers and drifts, and all but a few as it darts and grips, when its
//      tail swings in under it), and streaming off it in every frame it lives;
//   8. STRUCK, the fog tearing and closing; ITS DEATH, unravelling to nothing, the word it swallowed coming out in the
//      Hush's pink and flying away in its own colour, gone by the end;
//   9. LOOSE THINGS FOLLOW: its tail trails as it drifts, is left behind as it darts and swings on past as it stops;
//  10. ITS SIZES AND SPEEDS, IN TILES: the knight's size; a slow drift; four tiles in two frames; its arms spread two tiles
//      in its warning and shutting more than a tile before it; the grip's coils snap shut in two frames round an area more
//      than a tile and a half across, nothing cyan in them.
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
import { GRIP_FX, HS_CANVAS, HS_FOG, HS_MIST, HS_PALE, HS_SMEAR, HS_THROAT, HS_WORD, HUSHSHAPES_ON, gripCoils, gripPainted, hushPainter, hushWord } from '../src/art/hush_shapes';
import { HS_DART, HS_DIES, HS_GRIP, HS_PACE, HS_REEL, HS_SAY, HS_SHAPE, HS_STRIKES, HUSH_SHAPE, gripAt, lagAt, smearedAt } from '../src/art/hush_shapes_moves';
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
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,dart');
  const found = checkBoss(MOB, HS_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKES: the dart and the grip each strike in two frames; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(HS_STRIKES).sort().join(','), 'attack,dart');
  assert.equal(MOB.attack.motion.hit, HS_STRIKES.attack[1], 'the grip lands on its strike\'s last frame');
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
    // (its tail always comes apart into mist as it hovers and drifts; as it darts and grips its tail may swing in under it, out of sight)
    const misty = countOf(p, [HS_MIST]) >= 4;
    if (!misty && (move === 'stand' || move === 'walk')) faults.push(`${said(move, view, t)}: no mist at its tail`);
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

test('9. LOOSE THINGS FOLLOW: its tail trails as it drifts, is left behind as it darts, and swings on past as it stops', () => {
  for (let t = 0; t < 1.2; t += 0.1) assert.ok(lagAt('walk', t)[0] < -4, `drifting @${t.toFixed(1)}: its tail ${lagAt('walk', t)[0].toFixed(1)} behind it`);
  assert.ok(lagAt('dart', HS_DART.strike[1])[0] < -15, `darting: its tail left ${lagAt('dart', HS_DART.strike[1])[0].toFixed(1)} behind`);
  let past = 0;
  for (let t = HS_DART.strike[1]; t <= HS_DART.long; t += 1 / 30) past = Math.max(past, lagAt('dart', t)[0]);
  assert.ok(past > 1, `as it stops, its tail swings on ${past.toFixed(1)} past it`);
  const end = lagAt('dart', HS_DART.long);
  assert.ok(Math.hypot(...end) < 4, `settled by its end (${Math.hypot(...end).toFixed(1)})`);
});

test('10. ITS SIZES AND SPEEDS, IN TILES: the knight\'s size; a slow drift; four tiles in two frames; arms spread two tiles; the grip shutting a tile and more before it, round an area a tile and a half across', () => {
  // the knight's size (his crown, standing; its crown, hunched as it hovers)
  let top = 0;
  for (const t of framesOf(MOB, 'stand')) {
    const s = skeletonAt(MOB, 'stand', t);
    top = Math.max(top, s.head[2] + MOB.build.headR[2]);
  }
  const k = top / KNIGHT_BODY.tall;
  assert.ok(k > 0.85 && k < 1.15, `its crown ${top.toFixed(1)} over the floor, the knight's ${KNIGHT_BODY.tall}`);
  // the drift: slow (the knight walks 2.5 tiles a second), carried at its pace
  assert.ok(HS_PACE >= 1.2 && HS_PACE <= 2, `its drift ${HS_PACE} tiles a second`);
  assert.equal(MOB.walk.ground, HS_PACE * TILE3, 'carried at its pace');
  // the dart: four tiles in its two frames
  const [s0, s1] = HS_DART.strike;
  const went = (skeletonAt(MOB, 'dart', s1).pelvis[0] - skeletonAt(MOB, 'dart', s0).pelvis[0]) / TILE3;
  assert.ok(went >= 3.9, `the dart: ${went.toFixed(2)} tiles in ${Math.round((s1 - s0) * 30)} frames (${(went / (s1 - s0)).toFixed(0)} tiles a second)`);
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
