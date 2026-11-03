// FLOOR 18'S QUEEN'S GUARD, THE MIRROR DUELLISTS (src/art/queens_guard.ts, their look; src/art/queens_guard_moves.ts,
// their moves; src/art/queens_guard_fx.ts, what their blows leave). A MOCK-UP: NOT IN THE GAME, behind QGUARD_ON, off. His
// pick of 30 Oct, “Mirror duellists (Recommended)” (art/queens_guard.ts has it as offered), which replaces the first design;
// his rulebook's Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”; for the
// enemies, “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for
// the extra time the player gets to evade”). Held as the Princess and the palace guard are:
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and from behind,
//      and every handover (the stand into the glass, out of it, back on guard);
//   3. HIS LIGHTNING STRIKES: both blows, and both steps of the mirror step, strike in two frames; the double slash's second
//      slash two frames more at once after the first; each strike's frames, and the one after, carry its smear, no other;
//   4. every frame paints both ways round: nothing cyan, the pink edge while they are here, none as they die, every pixel
//      whole or empty but the edge;
//   5. NOTHING CUT OFF;
//   6. NOTHING OF THEM IN THE FLOOR;
//   7. THE HUSH seeping out of them while they are here, a great breath of it as it leaves them, none at the end; the dull
//      pink behind the helm while they are here, gone once the Hush has left them;
//   8. THEY SHATTER LIKE A MIRROR: the cracks race over them first; then none of them but shards, which fall, lie on the
//      floor, and are gone by the end;
//   9. HIS PICK, THE LOOK: the tallest and thinnest guard of Act 2 (a head and a half over the knight); mirrored plate; a
//      faceless helm; a violet cape; a glass blade in each hand; no shield, no halberd, no tabard, no swan;
//  10. HIS PICK, THE MOVES, IN TILES: no charge; the mirror step (into a ripple and gone, out of another, about 0.6 s each,
//      a ripple at each end); the double slash (two slashes of two frames in quick succession, an X of glass light out to
//      two tiles); the shard fan (five shards, sixty degrees, eight tiles each, out in two frames, smeared); nothing cyan;
//  11. NOTHING FOLDS FLAT.
//   run: tsx --test tests/queens_guard.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { WATCH_BODY } from '../src/art/hushed_watch';
import { KNIGHT_BODY } from '../src/art/moves3';
import { CRACK, GLASS, MIRROR, QG_BLADE, QG_BODY, QG_CANVAS, QGUARD_ON, RIPPLE, VIOLET, bladeR } from '../src/art/queens_guard';
import { QG_DIES, QG_FAN, QG_FAN_WAYS, QG_GLIDE, QG_SHAPE, QG_SLASH, QG_STEP_IN, QG_STEP_OUT, QG_STRIKES, QG_WALK, QUEENS_GUARD, awayAt, fanShardAt, rippleOf, smearedAt } from '../src/art/queens_guard_moves';
import { FAN_FX, X_FX, fanPainted, xPainted } from '../src/art/queens_guard_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import { solve, standing } from '../src/art/skeleton';
import type { Posed, V3 } from '../src/art/skeleton';
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
const MOB: Mob = QUEENS_GUARD;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');
/** Whether they are here to be seen at a moment of a move (not through the glass, not shattered). */
const here = (move: string, t: number): boolean => !awayAt(move, t) && !(move === 'dying' && t >= QG_DIES.shatter);

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
/** The friend's cyan, as his rule has it: any strong colour of a hue from 160 to 205. */
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 160 && h <= 205;
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
const key = (c: string): string => rgba(c).slice(0, 3).join(',');
const countOf = (p: Painted, colours: ReadonlyArray<string>): number => {
  const want = new Set(colours.map(key));
  let n = 0;
  for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] === 255 && want.has(`${p.px.d[i]},${p.px.d[i + 1]},${p.px.d[i + 2]}`)) n++;
  return n;
};

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const stageOf = (): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move of theirs (the game's frames of each: framesOf), painted on their whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;
/** The smear's own colours (art/queens_guard.ts QG_SMEAR). */
const SMEAR = ['#6e6c9a', '#c2c2e4', '#f4f4ff'];
const pixels = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};

test('1. the switch is off, and only their own files of the game import them (the main chat\'s, built 31 Oct)', () => {
  assert.equal(QGUARD_ON.on, false, 'QGUARD_ON is off');
  const users: string[] = [];
  const theirs = /^art\/queens_guard(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || theirs.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (theirs.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].sort().join(' '), 'art/act1_figs/qguard.ts game/act1_rules/qguard.ts render/act1_fx/qguard.ts', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,stepIn,stepOut,fan');
  const found = checkBoss(MOB, QG_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
  const h = (QG_SHAPE.handovers ?? []).map((x) => `${x.from}>${x.to}`);
  for (const w of ['stand>stepIn', 'stepIn>stepOut', 'stepOut>stand', 'stand>attack', 'attack>stand', 'stand>fan', 'fan>stand', 'walk>stand', 'stand>walk']) assert.ok(h.includes(w), `the handover ${w}`);
});

test('3. HIS LIGHTNING STRIKES: two frames each (the second slash two more at once after the first); the strikes and the frame after each smeared, no other frame', () => {
  assert.equal(Object.keys(QG_STRIKES).sort().join(','), 'attack,fan,stepIn,stepOut');
  for (const [move, [s0, s1]] of Object.entries(QG_STRIKES)) assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: its strike is two frames`);
  const [q0, q1] = QG_SLASH.second;
  assert.equal(Math.round((q1 - q0) * 30), 2, 'the second slash is two frames');
  assert.ok(q0 - QG_SLASH.strike[1] <= 1 / 30 + 1e-9, 'the second slash at once after the first');
  for (const move of ['attack', 'fan']) assert.equal(moveOf(move).motion.hit, QG_STRIKES[move][1], `${move}: it lands on the strike's last frame`);
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const n = countOf(p, SMEAR);
    const want = smearedAt(move, t);
    if (want && n < 12) faults.push(`${said(move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(move, view, t)}: smeared out of its strike (${n})`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  // (the warning held long: each blow's wind-up held a good third of a second and more)
  for (const [move, warn] of [['attack', QG_SLASH.warn], ['fan', QG_FAN.warn]] as const) assert.ok(warn[1] - warn[0] >= 0.35, `${move}: its warning held ${(warn[1] - warn[0]).toFixed(2)} s`);
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while they are here and none as they die, every pixel whole or empty but the edge', () => {
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
    const seen = here(move, t);
    const bad = cyanIn(p) || odd > 0 || (alive ? seen && (n < 600 || rim < 60) : rim !== 0) || (move === 'dying' && seen && n < 600);
    if (bad) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, they (the blades at their highest and widest, the ripple, the shards) are inside their picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${QG_CANVAS.w}x${QG_CANVAS.h}`);
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
  assert.ok(least >= ROOM, `the nearest they come to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all); a panel by the outline its skin draws, not its box. */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  else if (sh.k === 'panel') {
    const lu = Math.hypot(...sh.u);
    const lv = Math.hypot(...sh.v);
    for (let i = -20; i <= 20; i++) {
      for (let j = -20; j <= 20; j++) {
        const a = i / 20;
        const b = j / 20;
        if (!sh.skin(a * lu, b * lv, true, 2)) continue;
        z = Math.min(z, sh.c[2] + a * sh.u[2] + b * sh.v[2]);
      }
    }
  } else if (sh.k === 'thread') z = Math.min(sh.a[2], sh.b[2]);
  return Math.max(0, -z);
}

test('6. NOTHING OF THEM IN THE FLOOR: all they wear and carry, the ripple, the shards', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(move, t))) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** The Hush coming out of them at a moment: their grains of its greys. */
const HUSHY = new Set(['#b6b0cc', '#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4']);
function hushAt(st: Stage, m: Moment): number {
  MOB.bits(st, m);
  return (MOB.grains?.(st, m) ?? []).filter(([, c]) => HUSHY.has(c)).length;
}

test('7. THE HUSH seeping out while they are here, a great breath as it leaves them, none at the end; the pink behind the helm until it has left them', () => {
  const st = stageOf();
  let most = 0;
  let frames = 0;
  let some = 0;
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      if (!here(move, t)) continue;
      const n = hushAt(st, at(move, t));
      frames++;
      if (n > 0) some++;
      most = Math.max(most, n);
    }
  }
  assert.ok(some > 0.9 * frames, `the Hush seeping in ${some} of ${frames} frames they are here`);
  let great = 0;
  for (let t = 0.5; t <= 1.2; t += 0.05) great = Math.max(great, hushAt(st, dyingMoment(MOB, t)));
  assert.ok(great >= 1.5 * most, `the Hush leaving them, ${great} at most; the most while they live, ${most}`);
  for (let t = 1.45; t <= QG_DIES.long + 1e-9; t += 0.05) assert.equal(hushAt(st, dyingMoment(MOB, t)), 0, `@${t.toFixed(2)}: the Hush still coming out`);
  const pink = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) for (const t of framesOf(MOB, move)) if (here(move, t)) assert.ok(pink(MOB.bits(st, at(move, t))), `${move} @${t.toFixed(2)}: no pink behind the helm`);
  assert.ok(pink(MOB.bits(st, dyingMoment(MOB, 0.3))), 'the pink still there as the cracks race over them');
  for (let t = 0.7; t < QG_DIES.shatter; t += 0.05) assert.ok(!pink(MOB.bits(st, dyingMoment(MOB, t))), `@${t.toFixed(2)}: the pink still behind the helm`);
});

test('8. THEY SHATTER LIKE A MIRROR: the cracks race over them; then only shards, which fall, lie on the floor and are gone by the end', () => {
  const st = stageOf();
  assert.equal(countOf(paintMob(MOB, 'stand', 0, 'front'), [CRACK.split, CRACK.lit]), 0, 'no cracks while they live');
  for (const view of VIEWS) assert.ok(countOf(deathOfMob(MOB, QG_DIES.crack[1] / MOB.dieTime, view), [CRACK.split, CRACK.lit]) > 40, `${view}: cracked all over before they shatter`);
  for (let t = QG_DIES.shatter; t <= QG_DIES.long + 1e-9; t += 0.05) {
    const bits = MOB.bits(st, dyingMoment(MOB, t));
    const other = bits.filter((b) => b.piece !== 'shard' && b.shape.k !== 'mote' && b.shape.k !== 'glow');
    assert.equal(other.length, 0, `@${t.toFixed(2)}: ${other.map((b) => b.piece).slice(0, 4).join(' ')} still there after the shatter`);
  }
  const shards = (t: number): Bit[] => MOB.bits(st, dyingMoment(MOB, t)).filter((b) => b.piece === 'shard');
  assert.ok(shards(QG_DIES.shatter + 0.05).length >= 50, `${shards(QG_DIES.shatter + 0.05).length} shards as they burst`);
  // (by the time they fade, every shard lies on the floor)
  const lying = shards(QG_DIES.gone[0] - 0.02).filter((b) => b.shape.k === 'panel' && b.shape.c[2] < 0.6);
  assert.ok(lying.length >= 0.8 * shards(QG_DIES.gone[0] - 0.02).length, `${lying.length} of the shards lying on the floor`);
  assert.equal(shards(QG_DIES.long).length, 0, 'the shards gone by the end');
  for (const view of VIEWS) assert.ok(pixels(deathOfMob(MOB, 1, view)) < 20, `${view}: nothing left at the end`);
});

test('9. HIS PICK, THE LOOK: the tallest, thinnest guard of Act 2; mirrored plate; a faceless helm; a violet cape; a glass blade in each hand; no shield, no halberd', () => {
  const st = stageOf();
  // the tallest: the helm's top a head and a half over the knight's, and over the palace guard's (floor 16) by a good half head
  const top = (B: typeof QG_BODY, s: { head: V3 }, k: number): number => s.head[2] + B.headR[2] * k;
  const ours = top(QG_BODY, skeletonAt(MOB, 'stand', 0), 1.3 * 1.0) + 0.9;
  const knightHead = 2 * KNIGHT_BODY.headR[2];
  const knight = solve(KNIGHT_BODY, standing(KNIGHT_BODY) as Posed).head[2] + KNIGHT_BODY.headR[2];
  assert.ok(ours >= knight + 1.4 * knightHead - 2 && ours <= knight + 1.8 * knightHead, `the helm's top at ${ours.toFixed(1)}; the knight's about ${knight.toFixed(1)}, his head ${knightHead.toFixed(1)}`);
  assert.ok(QG_BODY.tall >= WATCH_BODY.tall + 5, `taller than the palace guard: ${QG_BODY.tall} to ${WATCH_BODY.tall}`);
  // the thinnest: narrower in the shoulder, the chest and the limbs than the palace guard and the knight, for all their height
  for (const [who, B] of [['the palace guard', WATCH_BODY], ['the knight', KNIGHT_BODY]] as const) {
    for (const f of ['shoulderHalf', 'ribHalf', 'waistHalf'] as const) assert.ok(QG_BODY[f] < B[f], `${f}: ${QG_BODY[f].toFixed(1)}, ${who} ${B[f].toFixed(1)}`);
    assert.ok(QG_BODY.legR[0] < B.legR[0] && QG_BODY.armR[0] < B.armR[0], `limbs thinner than ${who}'s`);
    assert.ok(QG_BODY.shoulderHalf / QG_BODY.tall < 0.9 * (B.shoulderHalf / B.tall) && QG_BODY.ribHalf / QG_BODY.tall < 0.85 * (B.ribHalf / B.tall), `slimmer for their height than ${who}`);
  }
  // mirrored plate: standing, a good share of them shows the mirror's colours, light and dark
  for (const view of VIEWS) {
    const p = paintMob(MOB, 'stand', 0, view);
    const levels = MIRROR.filter((c) => countOf(p, [c]) > 4).length;
    assert.ok(countOf(p, MIRROR) > 150 && levels >= 4, `${view}: ${countOf(p, MIRROR)} pixels of mirror, ${levels} of its shades`);
    // the violet cape, most of all from behind
    assert.ok(countOf(p, VIOLET) > (view === 'back' ? 500 : 60), `${view}: ${countOf(p, VIOLET)} pixels of the violet cape`);
  }
  // the faceless helm: a smooth egg (nothing on it but the pink deep behind its face), taller than it is wide
  const bits = MOB.bits(st, at('stand', 0));
  const helm = bits.filter((b) => b.part === 'helm');
  assert.ok(helm.every((b) => b.piece === 'helm' || b.piece === 'eyes'), `on the helm: ${[...new Set(helm.map((b) => b.piece))].join(' ')}`);
  const egg = helm.find((b) => b.piece === 'helm' && b.shape.k === 'ball');
  assert.ok(egg && egg.shape.k === 'ball' && Math.hypot(...egg.shape.ax[2]) > Math.hypot(...egg.shape.ax[1]), 'the helm an egg, taller than wide');
  // a glass blade in each hand, long, of the glass's colours (not cyan)
  for (const part of ['bladeR', 'bladeL']) assert.ok(bits.some((b) => b.part === part && b.piece === 'blade' && b.shape.k === 'panel'), `the ${part}`);
  assert.ok(QG_BLADE.long >= 1.1 * TILE3, `the blades ${(QG_BLADE.long / TILE3).toFixed(2)} tiles long`);
  for (const c of [...GLASS, ...RIPPLE, ...MIRROR]) assert.ok(!cyanGlow(...(rgba(c).slice(0, 3) as [number, number, number])), `cyan in their colours: ${c}`);
  // no shield, no halberd; never floor 16's palace guard (no tabard, no swan, no plume); never the first design
  for (const move of [...LIVING, 'dying']) for (const b of MOB.bits(st, at(move, 0.3))) assert.ok(!/shield|halberd|axe|tabard|crest|swan|plume|spike/i.test(b.part + b.piece), `${move}: ${b.part} ${b.piece}`);
});

test('10. HIS PICK, THE MOVES, IN TILES: no charge; the mirror step; the double slash and its X out to two tiles; the shard fan, five shards, sixty degrees, eight tiles; nothing cyan', () => {
  // they don't charge: they glide, and step through the glass
  assert.ok(!movesOf(MOB).some((m) => /charge|bash/.test(m)), 'no charge');
  assert.equal(MOB.walk.ground, QG_GLIDE * TILE3, 'the glide painted for its pace');
  assert.ok(QG_GLIDE <= 2, `the glide ${QG_GLIDE} tiles a second`);
  assert.equal(QG_WALK.frames, 20);
  // THE MIRROR STEP: about 0.6 s each way; gone between; a ripple at each end
  for (const S of [QG_STEP_IN, QG_STEP_OUT]) assert.ok(S.long >= 0.5 && S.long <= 0.7, `a step of ${S.long} s`);
  assert.ok(awayAt('stepIn', QG_STEP_IN.long) && awayAt('stepOut', 0), 'gone between the steps');
  assert.ok(!awayAt('stepIn', QG_STEP_IN.strike[0]) && !awayAt('stepOut', QG_STEP_OUT.strike[1]), 'here up to the step in, and from the step out');
  assert.ok((rippleOf('stepIn', QG_STEP_IN.strike[0])?.open ?? 0) > 0.95, 'the ripple open as they step in');
  assert.ok((rippleOf('stepOut', QG_STEP_OUT.strike[1])?.open ?? 0) > 0.95, 'the ripple open as they step out');
  assert.equal(rippleOf('stepIn', QG_STEP_IN.long), null, 'the ripple closed after them');
  for (const view of VIEWS) assert.ok(countOf(paintMob(MOB, 'stepIn', 0.3, view), RIPPLE) > 300, `${view}: the ripple`);
  // THE DOUBLE SLASH: its X of glass light from under half a tile out to two, more than a tile and a half across; the
  // right blade's point out past a tile as it lands
  assert.ok(QG_SLASH.reach >= 2 && QG_SLASH.from <= 0.5 && QG_SLASH.wide >= 1.5, `the X ${QG_SLASH.from} to ${QG_SLASH.reach} tiles, ${QG_SLASH.wide} across`);
  const tip = bladeR(skeletonAt(MOB, 'attack', QG_SLASH.hit)).tip;
  assert.ok(tip[0] >= 1.2 * TILE3 && tip[2] < 12, `the blade's point ${(tip[0] / TILE3).toFixed(2)} tiles out, ${tip[2].toFixed(1)} up, as it lands`);
  for (const view of VIEWS) {
    const one = pixels(xPainted(0, view));
    const two = pixels(xPainted(X_FX.two[1], view));
    assert.ok(one > 200 && two > 1.6 * one, `${view}: the X's first stroke (${one}) and both (${two})`);
    for (let t = 0; t <= X_FX.long; t += 1 / 15) assert.ok(!cyanIn(xPainted(t, view)), `the X ${view} @${t.toFixed(2)}: cyan`);
    assert.equal(pixels(xPainted(X_FX.long + 0.05, view)), 0, `${view}: the X gone`);
  }
  // THE SHARD FAN: five shards, sixty degrees from one side to the other, each flying eight tiles; out in two frames, smeared
  assert.equal(QG_FAN.count, 5);
  assert.equal(QG_FAN_WAYS.length, 5);
  assert.equal(QG_FAN_WAYS[4] - QG_FAN_WAYS[0], 60, 'sixty degrees wide');
  for (let i = 0; i < 5; i++) {
    const end = fanShardAt(i, FAN_FX.flight);
    assert.ok(Math.abs(Math.hypot(end[0], end[1]) - QG_FAN.range * TILE3) < 1e-6 && QG_FAN.range === 8, `shard ${i} flies ${(Math.hypot(end[0], end[1]) / TILE3).toFixed(2)} tiles`);
  }
  const st = stageOf();
  const mid = (QG_FAN.strike[0] + QG_FAN.strike[1]) / 2;
  assert.equal(MOB.bits(st, at('fan', QG_FAN.warn[1] - 0.05)).filter((b) => b.piece === 'shard').length, 5, 'five shards gathered at the cross in the warning');
  assert.equal(MOB.bits(st, at('fan', mid)).filter((b) => b.piece === 'shard').length, 5, 'five shards thrown in the strike');
  for (const view of VIEWS) {
    for (let t = 0; t <= FAN_FX.long; t += 1 / 15) assert.ok(!cyanIn(fanPainted(t, view)), `the fan ${view} @${t.toFixed(2)}: cyan`);
    assert.ok(countOf(fanPainted(0.1, view), SMEAR) > 20, `${view}: the shards smeared as they fly`);
    assert.equal(pixels(fanPainted(FAN_FX.long + 0.05, view)), 0, `${view}: the fan gone`);
  }
});

test('11. NOTHING FOLDS FLAT: in every frame of every move no round thing they wear collapses into a flat sheet that spins', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(move, t))) {
        if (b.shape.k !== 'ball') continue;
        const [x, y, z] = b.shape.ax;
        const det = x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0]);
        const lens = Math.hypot(...x) * Math.hypot(...y) * Math.hypot(...z);
        if (lens > 0 && Math.abs(det) / lens < 0.5) faults.push(`${move} @${t.toFixed(2)}: ${b.piece} ${(Math.abs(det) / lens).toFixed(2)} square`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});
