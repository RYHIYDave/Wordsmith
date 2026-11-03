// FLOOR 20'S RIME SHADE (src/art/rime_shade.ts, its look; src/art/rime_shade_moves.ts, its moves; src/art/rime_shade_fx.ts,
// its breath's mark, its line of rime and the frost closing over the hero). A MOCK-UP: NOT IN THE GAME, behind RIME_SHADE_ON,
// off. His pick, 3 Nov 2026: “Rime Shade (Recommended)”, offered as: a hunched figure of frost and fog, icicles for fingers;
// its breath sends a creeping line of rime along the floor that freezes you in place if it reaches you. A small mob: one
// attack. Held as the Hush's shapes are (tests/hush_shapes.test.ts):
//   1. the switch is off, and nothing of the game imports it;
//   2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`: it is on the heroes' bones), every frame,
//      from in front and from behind, and every handover;
//   3. HIS LIGHTNING STRIKE (Movement 9): the breath strikes in two frames, landing on the second; smeared then, no other
//      frame;
//   4. every frame paints both ways round: nothing cyan, the pink rim while it lives and none as it dies, every pixel whole
//      or empty but the rim (crisp);
//   5. NOTHING CUT OFF; 6. NOTHING OF IT IN THE FLOOR;
//   7. ITS MARK: its hollow, dark, with the enemy's dull pink eyes in it, from in front, no face from behind; its icicle
//      fingers and its frost in every frame it lives; its fog streaming off it;
//   8. ITS COLOURS: grey and bone white, the frost's faint blue only (hue 200 to 232, saturation under 0.185), never cyan;
//   9. STRUCK, torn and closing, shards flung; ITS DEATH, coming apart into fog and frost, nothing left lying;
//  10. ITS SIZES: hunched about the knight's height, straightened taller; its drift;
//  11. THE RIME BREATH: its held warning, the cold gathering in its hollow, the frost forming over it, the mark on the floor
//      before it comes; spent after; the line's numbers (6 tiles, 1 wide, 3.5 tiles a second: slower than the hero runs),
//      frozen 0.8 s, the rime lying 3 s;
//  12. THE LINE, THE MARK AND THE FROST OVER THE HERO, painted: crisp, no cyan, the frost's colours, nothing cut off; the
//      crystals spiking up at the front and settling; the line melting away; the ice closing in two frames, held, shattering.
//   run: tsx --test tests/rime_shade.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, INK, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { KNIGHT_BODY } from '../src/art/moves3';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
import { RIME_SHADE_ON, RS_CANVAS, RS_FOG, RS_FOG_DEEP, RS_FROST, RS_HOLLOW, RS_ICE, RS_SMEAR, rimePainter } from '../src/art/rime_shade';
import { RIME_SHADE, RS_BREATH, RS_DIES, RS_PACE, RS_REEL, RS_SAY, RS_SHAPE, RS_STRIKES, breathAt, frostAt, hollowOf, smearedAt } from '../src/art/rime_shade_moves';
import { FROZEN, FROZEN_CANVAS, FX_CANVAS, FX_PINK, HERO_RUNS, LINE_GONE, RIME_LINE, crystalUp, freezesAt, frozenPainted, frozenUp, inLine, lineFront, linePainted, markPainted, reachesAt, rimeLeft } from '../src/art/rime_shade_fx';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';
import { TUNE } from '../src/game/defs';
import { Px, rgba } from '../src/engine/px';
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
const MOB: Mob = RIME_SHADE;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
function hueSat(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) * 60;
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
    else h = (4 + (r - g) / (max - min)) * 60;
  }
  return [(h + 360) % 360, max === 0 ? 0 : (max - min) / max, max];
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const [h, s, max] = hueSat(r, g, b);
  return max >= 150 && s >= 0.45 && h >= 165 && h <= 205;
}
const cyanIn = (px: Px, lights: ReadonlyArray<{ color: string }> = []): boolean => {
  const { d } = px;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    if (FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) || cyanGlow(d[i], d[i + 1], d[i + 2])) return true;
  }
  return lights.some((l) => {
    const [r, g, b] = rgba(l.color);
    return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
  });
};
const keyOf = (c: string): string => rgba(c).slice(0, 3).join(',');
/** How many whole pixels of these colours a frame has. */
const countOf = (px: Px, colours: ReadonlyArray<string>): number => {
  const want = new Set(colours.map(keyOf));
  const { d } = px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && want.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};
const solidIn = (px: Px): number => {
  let n = 0;
  for (let i = 3; i < px.d.length; i += 4) if (px.d[i]) n++;
  return n;
};
/** THE COLOURS RULE: every whole pixel grey or bone white or the frost's faint blue (but the enemy's pink, the seam, its hollow, white's glint); the worst found. */
const PINKS = new Set([...FLAME, ENEMY_RIM, ...FX_PINK].map(keyOf));
function offColour(px: Px): string | null {
  const { d } = px;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] !== 255) continue;
    const k = `${d[i]},${d[i + 1]},${d[i + 2]}`;
    if (PINKS.has(k) || k === keyOf(INK)) continue;
    const [h, s, max] = hueSat(d[i], d[i + 1], d[i + 2]);
    if (max < 50) continue;
    if (s > 0.185 || (s >= 0.08 && (h < 200 || h > 232))) return `${k} (hue ${h.toFixed(0)}, saturation ${s.toFixed(2)})`;
  }
  return null;
}

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move) as NonNullable<ReturnType<typeof moveOf>>, t));
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

// (BROUGHT IN BY THE MAIN CHAT, 3 Nov 2026, for 25.0 at his word, “In 25.0 too”: the game reaches it through its own files
// only: its rules, its figure, what its breath does drawn, floor 20's list of kinds, which draws it only while it is on, and the
// page's hooks for its films and playtests, __dbg.rimeShade)
const BROUGHT_IN = ['art/act1_figs/rshade.ts', 'game/act1_rules/rshade.ts', 'game/act2_mobs.ts', 'main.ts', 'render/act1_fx/rshade.ts'];
test('1. its switch, and the game reaches it through its own files only', () => {
  assert.equal(typeof RIME_SHADE_ON.on, 'boolean', 'RIME_SHADE_ON');
  const users: string[] = [];
  const theirs = /^art\/rime_shade(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || theirs.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (theirs.test(parts.join('/'))) users.push(f);
    }
  }
  assert.deepEqual([...new Set(users)].sort(), BROUGHT_IN, `game files that import it: ${users.join(', ')}`);
});

test('2. EVERY MOVE THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying', 'a small mob: its stand, its drift, ONE attack, struck, its death');
  const found = checkBoss(MOB, RS_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKE: the breath strikes in two frames, landing on the second; smeared then, no other frame', () => {
  assert.equal(Object.keys(RS_STRIKES).join(','), 'attack');
  const [s0, s1] = RS_STRIKES.attack;
  assert.equal(Math.round((s1 - s0) * 30), 2, 'its strike is two frames');
  assert.equal(MOB.attack.motion.hit, s1, 'it lands on its strike\'s last frame');
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const n = countOf(p.px, RS_SMEAR);
    const want = move === 'attack' && smearedAt(move, t);
    if (want && n < 12) faults.push(`${said(move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(move, view, t)}: smeared out of its strike (${n})`);
  }
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
    const cyan = cyanIn(p.px, p.lights);
    if ((alive && n < 900) || cyan || odd || (alive ? rim < 60 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the rim, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, all of it is inside its picture with room to spare', () => {
  const ROOM = 6;
  const faults: string[] = [];
  let least = Infinity;
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${RS_CANVAS.w}x${RS_CANVAS.h}`);
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!d[(y * w + x) * 4 + 3]) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
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

test('6. NOTHING OF IT IN THE FLOOR: nothing it is made of, in any frame of any move (its fog, its breath and its frost too)', () => {
  const faults: string[] = [];
  const st = stageOf();
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      const m = at(move, t);
      for (const b of MOB.bits(st, m) as Bit[]) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
      const gs = MOB.grains?.(st, m) ?? [];
      if (!gs.length) faults.push(`${move} @${t.toFixed(2)}: no grains to look at`);
      for (const [p] of gs) if (p[2] < -0.6) faults.push(`${move} @${t.toFixed(2)}: a grain ${(-p[2]).toFixed(1)} into the floor`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. ITS MARK: its dark hollow with the dull pink eyes in it from in front, no face from behind; its icicles and its frost in every frame it lives; its fog streaming off it', () => {
  const faults: string[] = [];
  let front = 0;
  let faceFront = 0;
  let back = 0;
  let eyesBack = 0;
  for (const { move, view, t, p } of PAINTED) {
    if (move === 'dying') continue;
    const hollow = countOf(p.px, [RS_HOLLOW]);
    const eyes = countOf(p.px, [FLAME[1], FLAME[2]]);
    if (view === 'front') {
      // (its hollow and its eyes as it stands, drifts and is struck; its hollow as it rises and draws in its breath, until it
      // throws itself forward and down and its hood hangs over the floor)
      if (move === 'attack') {
        if (t < RS_STRIKES.attack[0] && hollow < 4) faults.push(`${said(move, view, t)}: its hollow, ${hollow} pixels`);
        continue;
      }
      front++;
      if (hollow >= 4 && eyes >= 2) faceFront++;
    } else {
      back++;
      if (eyes > 0) eyesBack++;
    }
    if (countOf(p.px, RS_ICE) < 20) faults.push(`${said(move, view, t)}: its icicles, ${countOf(p.px, RS_ICE)} pixels`);
    if (countOf(p.px, RS_FROST) < 60) faults.push(`${said(move, view, t)}: its frost, ${countOf(p.px, RS_FROST)} pixels`);
    if (countOf(p.px, [...RS_FOG, ...RS_FOG_DEEP]) < 400) faults.push(`${said(move, view, t)}: its fog, ${countOf(p.px, [...RS_FOG, ...RS_FOG_DEEP])} pixels`);
  }
  assert.ok(faceFront >= 0.9 * front, `its hollow and its eyes, from in front, in ${faceFront} of ${front} frames`);
  assert.ok(eyesBack <= 0.1 * back, `its eyes seen from behind in ${eyesBack} of ${back} frames`);
  // (no face but its hollow: its only marks are its two eyes)
  const st = stageOf();
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const m = at(move, t);
      const dots = MOB.bits(st, m).filter((b) => b.shape.k === 'dot');
      if (dots.length !== 2 || dots.some((d) => d.piece !== 'eye')) faults.push(`${move} @${t.toFixed(2)}: ${dots.length} marks on its head`);
      if ((MOB.grains?.(st, m) ?? []).length < 20) faults.push(`${move} @${t.toFixed(2)}: no fog streaming off it`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('8. ITS COLOURS: grey, bone white and the frost\'s faint blue only (hue 200 to 232, saturation under 0.185), but the enemy\'s pink; never cyan', () => {
  for (const ramp of [RS_FOG, RS_FOG_DEEP, RS_FROST, RS_ICE]) {
    for (const c of ramp) {
      const [h, s] = hueSat(...(rgba(c).slice(0, 3) as [number, number, number]));
      assert.ok(s <= 0.18 && (s < 0.02 || (h >= 210 && h <= 230)), `${c}: hue ${h.toFixed(0)}, saturation ${s.toFixed(2)}`);
    }
  }
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const off = offColour(p.px);
    if (off) faults.push(`${said(move, view, t)}: ${off}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('9. STRUCK, its fog torn and closing, its frost cracking; ITS DEATH, coming apart into fog and frost, nothing left lying', () => {
  const whole: Mob = { ...MOB, ...((): Pick<Mob, 'bits' | 'grains' | 'finish'> => { const p = rimePainter({ ...RS_SAY, tear: () => 0 }); return { bits: p.bits, grains: p.grains, finish: p.finish }; })() };
  for (const view of VIEWS) {
    const torn = solidIn(paintMob(MOB, 'reel', 2 / 30, view).px);
    const not = solidIn(paintMob(whole, 'reel', 2 / 30, view).px);
    assert.ok(not - torn >= 25, `${view}: torn through by ${not - torn} pixels as it is struck`);
    assert.equal(solidIn(paintMob(MOB, 'reel', RS_REEL, view).px), solidIn(paintMob(whole, 'reel', RS_REEL, view).px), `${view}: closed again`);
  }
  // (shards of its frost flung off as it is struck)
  const st = stageOf();
  const grainsAt = (move: string, t: number): number => {
    const m = at(move, t);
    MOB.bits(st, m);
    return (MOB.grains?.(st, m) ?? []).length;
  };
  assert.ok(grainsAt('reel', 0.15) > grainsAt('stand', 0) + 30, `shards flung off as it is struck (${grainsAt('reel', 0.15)} grains, standing ${grainsAt('stand', 0)})`);
  // its death: whole as it is struck, less and less of it, nothing at the end but a few last wisps; no frost lying on the floor
  const fog = [...RS_FOG, ...RS_FOG_DEEP];
  for (const view of VIEWS) {
    const k = (t: number): Painted => deathOfMob(MOB, t / MOB.dieTime, view);
    const counts = [0.25, 0.8, 1.2, 1.6].map((t) => countOf(k(t).px, [...fog, ...RS_FROST, ...RS_ICE]));
    assert.ok(counts[0] > 1200, `${view}: ${counts[0]} pixels of its fog and frost as it is struck`);
    assert.ok(counts[1] < counts[0] && counts[2] < counts[1] && counts[3] < counts[2], `${view}: coming apart, ${counts.join(', ')}`);
    const end = k(RS_DIES.long).px;
    assert.equal(countOf(end, fog), 0, `${view}: its fog all gone at its end`);
    assert.equal(countOf(end, [...RS_ICE, ...RS_FROST]), 0, `${view}: none of its frost or ice left lying`);
    assert.ok(solidIn(end) < 80, `${view}: ${solidIn(end)} pixels left at its end`);
  }
});

test('10. ITS SIZES: hunched, about the knight\'s height; straightened, taller; its drift', () => {
  const crown = (move: string, t: number): number => {
    const s = skeletonAt(MOB, move, t);
    return (s.head[2] + MOB.build.headR[2] * 1.3) / KNIGHT_BODY.tall;
  };
  let hunched = 0;
  for (const t of framesOf(MOB, 'stand')) hunched = Math.max(hunched, crown('stand', t));
  assert.ok(hunched > 1.0 && hunched < 1.4, `hunched, its crown ${hunched.toFixed(2)} of the knight's height`);
  const risen = crown('attack', (RS_BREATH.warn[0] + RS_BREATH.warn[1]) / 2);
  assert.ok(risen > 1.4 && risen > hunched + 0.15, `straightened, its crown ${risen.toFixed(2)} of the knight's height`);
  assert.ok(crown('attack', RS_BREATH.spent) < hunched - 0.1, `spent, hunched lower than it stands (${crown('attack', RS_BREATH.spent).toFixed(2)})`);
  assert.equal(RS_PACE, 1.8);
  assert.equal(MOB.walk.ground, RS_PACE * TILE3, 'carried at its pace');
  // (its feet never on the floor as it drifts: half walking)
  for (const move of ['stand', 'walk'] as const) for (const t of framesOf(MOB, move)) {
    const s = skeletonAt(MOB, move, t);
    assert.ok(Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 1.5, `${move} @${t.toFixed(1)}: a foot down`);
  }
});

test('11. THE RIME BREATH: held, the cold in its hollow, the frost forming, the line marked before it comes; spent after; the line\'s numbers', () => {
  const [w0, w1] = RS_BREATH.warn;
  // held: its hollow (what strikes) nearly still a third of a second and more
  let held = 0;
  let most = 0;
  let was: V3 | null = null;
  for (const t of framesOf(MOB, 'attack')) {
    const p = hollowOf(skeletonAt(MOB, 'attack', t));
    if (t >= w0 - 1e-6 && t <= w1 + 1e-6 && was) {
      held = Math.hypot(p[0] - was[0], p[1] - was[1], p[2] - was[2]) < 1.2 ? held + 1 : 0;
      most = Math.max(most, held);
    }
    was = p;
  }
  assert.ok(most / 30 >= 0.3, `held ${(most / 30).toFixed(2)} s`);
  for (let t = w0 + 0.1; t <= RS_BREATH.hit; t += 1 / 30) assert.ok((MOB.attack.glint?.(t) ?? 0) > 0.95, `the cold in its hollow @${t.toFixed(2)}`);
  assert.ok(frostAt('attack', w0 + 0.2) > frostAt('stand', 0) + 0.3, 'the frost forming over it as it draws in');
  assert.ok(frostAt('attack', RS_BREATH.spent) < frostAt('stand', 0) - 0.2, 'its frost gone thin, spent');
  assert.ok(breathAt('attack', 0.55).draw > 0.9 && breathAt('attack', 1.0).pour > 0.9, 'drawn in, then poured out');
  // the mark: before it comes, by half a second and more
  assert.ok(RS_BREATH.hit - RS_BREATH.mark >= 0.5, `marked ${(RS_BREATH.hit - RS_BREATH.mark).toFixed(2)} s before it comes`);
  // THE LINE'S NUMBERS
  assert.equal(`${RIME_LINE.long},${RIME_LINE.half * 2},${RIME_LINE.pace},${RIME_LINE.lies},${RIME_LINE.melt},${FROZEN.hold}`, '6,1,3.5,3,0.8,0.8');
  assert.equal(HERO_RUNS, TUNE.heroSpeed, 'the hero\'s speed, the game\'s');
  assert.ok(RIME_LINE.pace < HERO_RUNS, 'slower than the hero runs');
  assert.equal(lineFront(-0.1), null);
  assert.equal(lineFront(0), RIME_LINE.from);
  assert.ok(Math.abs((lineFront(1) as number) - (RIME_LINE.from + RIME_LINE.pace)) < 1e-9);
  assert.equal(lineFront(10), RIME_LINE.from + RIME_LINE.long);
  assert.ok(Math.abs((reachesAt(3.0) as number) - (3.0 - RIME_LINE.from) / RIME_LINE.pace) < 1e-9);
  assert.ok(inLine(3, 0.45) && !inLine(3, 0.55) && !inLine(RIME_LINE.from + RIME_LINE.long + 0.1, 0), 'one tile wide, six long');
  assert.equal(freezesAt(3, 0.8), null, 'stepped out of it: never frozen');
  // outrun: running straight away down it from 2 tiles, as it breathes out, the front never reaches him
  for (let t = 0; t <= 3; t += 1 / 30) {
    const front = lineFront(t) as number;
    assert.ok(front < 2 + HERO_RUNS * t, `outrun @${t.toFixed(2)}`);
  }
  assert.ok(Math.abs(LINE_GONE - (RIME_LINE.long / RIME_LINE.pace + RIME_LINE.lies)) < 1e-9);
  assert.equal(rimeLeft(0), 1);
  assert.equal(rimeLeft(RIME_LINE.lies), 0);
});

test('12. THE LINE, THE MARK AND THE FROST OVER THE HERO, painted: crisp, no cyan, the frost\'s colours, nothing cut off; spiking, settling, melting; the ice closing in two frames, held, shattering', () => {
  const faults: string[] = [];
  const check = (px: Px, what: string, room = 2): void => {
    const { w, h, d } = px;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] !== 0 && d[i + 3] !== 255) { faults.push(`${what}: not crisp`); break; }
    if (cyanIn(px)) faults.push(`${what}: cyan`);
    const off = offColour(px);
    if (off) faults.push(`${what}: ${off}`);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!d[(y * w + x) * 4 + 3]) continue;
      if (x < room || y < room || x >= w - room || y >= h - room) {
        faults.push(`${what}: cut off at ${x},${y}`);
        return;
      }
    }
  };
  for (const view of VIEWS) {
    for (let t = 0; t <= LINE_GONE + 0.1; t += 1 / 15) {
      for (const layer of ['floor', 'air'] as const) {
        const p = linePainted(t, view, layer);
        assert.equal(`${p.px.w}x${p.px.h}`, `${FX_CANVAS.w}x${FX_CANVAS.h}`);
        check(p.px, `the line ${layer} ${view} @${t.toFixed(2)}`);
        if (p.lights.some((l) => cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number])))) faults.push(`the line's light ${view} @${t.toFixed(2)}: cyan`);
      }
    }
    for (let t = 0; t <= RS_BREATH.long; t += 1 / 30) check(markPainted(t, view), `the mark ${view} @${t.toFixed(2)}`);
    // (aimed straight at the hero, turned off the way its picture faces: up to half way to the next way it faces, either side)
    for (const turn of [-Math.PI / 4, -0.4, 0.4, Math.PI / 4]) {
      check(markPainted(RS_BREATH.warn[1], view, turn), `the mark ${view} turned ${turn.toFixed(2)}`);
      for (const t of [0.5, 1.0, 1.8]) for (const layer of ['floor', 'air'] as const) check(linePainted(t, view, layer, 'all', 0, turn).px, `the line ${layer} ${view} @${t} turned ${turn.toFixed(2)}`);
    }
    // the mark, plain on the floor through its held warning; none before it is laid
    assert.ok(countOf(markPainted(RS_BREATH.warn[1], view), FX_PINK) > 60, `${view}: the mark through its held warning`);
    assert.equal(solidIn(markPainted(RS_BREATH.mark - 0.05, view)), 0, `${view}: no mark before it is laid`);
    // the line: there as it creeps, gone when it has melted
    assert.ok(solidIn(linePainted(1.0, view, 'floor').px) > 400 && solidIn(linePainted(1.0, view, 'air').px) > 200, `${view}: the line as it creeps`);
    assert.equal(solidIn(linePainted(LINE_GONE + 0.06, view, 'floor').px) + solidIn(linePainted(LINE_GONE + 0.06, view, 'air').px), 0, `${view}: melted away`);
    for (let t = 0; t <= FROZEN.hold + FROZEN.shatter + 0.05; t += 1 / 30) for (const half of ['far', 'near'] as const) {
      const p = frozenPainted(t, view, half);
      assert.equal(`${p.px.w}x${p.px.h}`, `${FROZEN_CANVAS.w}x${FROZEN_CANVAS.h}`);
      check(p.px, `the frost over him ${half} ${view} @${t.toFixed(2)}`, 1);
    }
    assert.ok(solidIn(frozenPainted(0.3, view, 'near').px) > 120 && solidIn(frozenPainted(0.3, view, 'far').px) > 80, `${view}: the ice round his legs, before and behind them`);
    assert.equal(solidIn(frozenPainted(FROZEN.hold + FROZEN.shatter + 0.04, view, 'all').px), 0, `${view}: the ice gone`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  // the crystals: spiking up at the front, settling behind it, melting away
  assert.ok(crystalUp(0.06) > 0.95, 'spiking up at its front');
  assert.ok(crystalUp(0.8) < 0.45 && crystalUp(0.8) > 0.15, `settled behind it (${crystalUp(0.8).toFixed(2)})`);
  assert.equal(crystalUp(RIME_LINE.lies), 0, 'melted');
  // the ice over him: shut in two frames, held, let go
  assert.equal(frozenUp(0), 0);
  assert.ok(frozenUp(FROZEN.close) >= 0.85, 'closed in two frames');
  assert.equal(Math.round(FROZEN.close * 30), 2);
  assert.equal(frozenUp(FROZEN.hold), 0, 'let go');
});
