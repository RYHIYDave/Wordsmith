// FLOOR 14'S SMALL MOB, THE HUSHED PATIENTS (src/art/patients.ts, their look; src/art/patients_moves.ts, their moves;
// src/art/patient_shots.ts, their scream's burst on the floor): a man and a woman in their nightclothes. A MOCK-UP: NOT IN
// THE GAME, behind PATIENTS_ON, off. Their brief is this chat's, on his word of 18 Oct (“Hey go without my say so.  If
// something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”), sent him with their films.
// Held as floor 13's field hands are (tests/fieldhands.test.ts):
//   1. in the game since 19 Oct (behind ACT2, off) through art/act1_figs/patient.ts and render/act1_fx/patient.ts alone, the switch on with the others';
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover (in bed only into their rising, their rising into their stand): feet that grip;
//      nothing in the floor; nothing jerky; the scream drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as they
//      die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare;
//   5. NOTHING OF THEM IN THE FLOOR, beyond what the checks see: all they wear;
//   6. IN BED, ON THE BED: lying and rising, nothing of them sinks into the mattress (deeper than a stuffed mattress
//      gives under them) or goes out past the bed's rails,
//      until their feet go over its side; and they stand where they rise, clear of the bed;
//   7. THE HUSH leaking out of them while they live (faint in their sleep); a great breath of it as it leaves them; none
//      once they lie still;
//   8. THEIR EYES: shut in bed, snapping open pink as they rise, pink while they live, gone out once they are down; and
//      down they lie, low on the floor;
//   9. THE SCREAM: the Hush bursting out of the mouth before them only from the scream on, and gone by the move's end;
//      and its burst across the floor reaches SCREAM_REACH before them and no further, is gone after SCREAM_FOR, and
//      is nothing cyan.
//   run: tsx --test tests/patients.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { PATIENTS_ON, PT_BED, PT_CANVAS } from '../src/art/patients';
import { PATIENT_MAN, PATIENT_WOMAN, PT_DIES, PT_RISE, PT_SCREAM, PT_SHAPE, mouthOf } from '../src/art/patients_moves';
import { SCREAM_FOR, SCREAM_REACH, drawScreamBurst } from '../src/art/patient_shots';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { FLAME, ENEMY_RIM } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import { dot, sub } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';
import { FIG } from '../src/art/act1_figs/patient';
import '../src/art/bestiary';
import { ACT1 } from '../src/game/act1';

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
const LIVING = (mob: Mob): string[] => movesOf(mob).filter((m) => m !== 'dying');

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
const isCyan = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
};

const moveOf = (mob: Mob, move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : (mob.more ?? {})[move]);
const at = (mob: Mob, move: string, t: number): Moment => (move === 'dying' ? dyingMoment(mob, t) : momentOf(mob, moveOf(mob, move), t));
const stageOf = (mob: Mob): Stage => {
  const can = canvasOf(mob);
  return stage(paintViewOf(mob, 'front'), can.ax, can.ay, can);
};

const PAINTED: { mob: Mob; move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
const ALL: Mob[] = [PATIENT_MAN, PATIENT_WOMAN];
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (mob: Mob, move: string, view: string, t: number): string => `${mob.id} ${move} ${view} @${t.toFixed(2)}`;

/** The game's files (not the dev pages) that import any of these (paths from src/, without .ts), by their imports' own paths. */
function importersOf(mods: readonly string[]): string[] {
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || mods.includes(f.slice(0, -3))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (mods.includes(parts.join('/')) && !users.includes(f)) users.push(f);
    }
  }
  return users.sort();
}

// (IN THE GAME since floor 14's kinds came in, 19 Oct 2026, behind the Hush's switch, ACT2, off: through their pictures for the
// game, art/act1_figs/patient.ts, and what they draw on the floor, render/act1_fx/patient.ts, alone; their switch on with the
// others' (art/bestiary.ts useAct1Figs). Until then a mock-up nothing of the game imported, its switch off)
test('1. in the game through art/act1_figs/patient.ts and render/act1_fx/patient.ts alone, their switch on with the others\'', () => {
  assert.ok(FIG && FIG.switches?.includes(PATIENTS_ON), 'their pictures for the game hold their switch');
  assert.equal(PATIENTS_ON.on, ACT1.on, 'on with the figures of the acts (art/bestiary.ts useAct1Figs)');
  assert.equal(importersOf(['art/patients', 'art/patients_moves', 'art/patient_shots']).join(', '), 'art/act1_figs/patient.ts, render/act1_fx/patient.ts', 'only their pictures for the game, and what they draw, import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover, both of them', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,abed,rise');
    const found = checkBoss(mob, PT_SHAPE);
    assert.equal(found.length, 0, `${mob.name}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('3. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel whole or empty but the edge', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of PAINTED) {
    const { d } = p.px;
    let n = 0;
    let rim = 0;
    let odd = 0;
    let cyan = false;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      n++;
      if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
      const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
      if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) cyan = true;
      if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    }
    for (const l of p.lights) if (isCyan(l.color)) cyan = true;
    const alive = move !== 'dying';
    if (n < 300 || cyan || odd || (alive ? rim < 40 : rim !== 0)) faults.push(`${said(mob, move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${PT_CANVAS.w}x${PT_CANVAS.h}`);
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
    const room = Math.min(x0, y0, w - 1 - x1, h - 1 - y1);
    least = Math.min(least, room);
    if (room < ROOM) faults.push(`${said(mob, move, view, t)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest they come to the edge: ${least}`);
});

/** The lowest point of a solid (and where it is across the floor, for the bed), as points with how thick it is there. */
function pointsOf(sh: Shape): [number, number, number][] {
  if (sh.k === 'rod') return [[sh.a[0], sh.a[1], sh.a[2] - sh.ra], [sh.b[0], sh.b[1], sh.b[2] - sh.rb]];
  if (sh.k === 'ball') return [[sh.c[0], sh.c[1], sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2])]];
  if (sh.k === 'band') return [[sh.ring.c[0], sh.ring.c[1], sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2])]];
  if (sh.k === 'cloth') return sh.rings.flatMap((r): [number, number, number][] => (r.pts ? r.pts.map((p: V3): [number, number, number] => [p[0], p[1], p[2]]) : [[r.c[0], r.c[1], r.c[2] - Math.hypot(r.u[2], r.v[2])]]));
  if (sh.k === 'panel') return [[sh.c[0], sh.c[1], sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2])]];
  return [];
}
const solids = (bits: Bit[]): Bit[] => bits.filter((b) => b.shape.k !== 'mote' && b.shape.k !== 'glow' && b.shape.k !== 'dot');

test('5. NOTHING OF THEM IN THE FLOOR: all they wear, both of them', () => {
  const faults: string[] = [];
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        for (const b of solids(mob.bits(st, at(mob, move, t)))) {
          const z = Math.min(...pointsOf(b.shape).map((p) => p[2]));
          if (z < -0.6) faults.push(`${mob.id} ${move} @${t.toFixed(2)}: ${b.part} ${(-z).toFixed(1)} into the floor`);
        }
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('6. IN BED, ON THE BED: lying and rising, nothing of them sinks into the mattress or goes out past its rails until their feet go over its side; they stand where they rise, clear of the bed', () => {
  const faults: string[] = [];
  const X0 = PT_BED.x - PT_BED.wide - 1;
  const X1 = PT_BED.x + PT_BED.wide + 1;
  for (const mob of ALL) {
    const st = stageOf(mob);
    const frames: [string, number][] = [...framesOf(mob, 'abed').map((t): [string, number] => ['abed', t]), ...framesOf(mob, 'rise').filter((t) => t <= PT_RISE.look).map((t): [string, number] => ['rise', t])];
    for (const [move, t] of frames) {
      for (const b of solids(mob.bits(st, at(mob, move, t)))) {
        for (const [x, y, z] of pointsOf(b.shape)) {
          if (z < PT_BED.top - 2.5) faults.push(`${mob.id} ${move} @${t.toFixed(2)}: ${b.part} ${(PT_BED.top - z).toFixed(1)} into the mattress`);
          if (x < X0 || x > X1 || Math.abs(y) > PT_BED.half - 1) faults.push(`${mob.id} ${move} @${t.toFixed(2)}: ${b.part} out past the bed's rails at (${x.toFixed(1)}, ${y.toFixed(1)})`);
        }
      }
    }
    // (stood: their feet, and all of them below the knee, in front of the bed)
    const m = at(mob, 'rise', PT_RISE.long);
    assert.ok(Math.max(m.s.heelL[0], m.s.heelR[0]) > X1 - 4 && Math.min(m.s.toeL[0], m.s.toeR[0]) > PT_BED.x + PT_BED.wide, `${mob.id}: stood with their feet at ${m.s.toeL[0].toFixed(1)}, ${m.s.toeR[0].toFixed(1)}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

function breathAt(mob: Mob, st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  mob.bits(st, m);
  return mob.grains?.(st, m) ?? [];
}

test('7. THE HUSH leaking out of them while they live (faint in their sleep); a great breath of it as it leaves them; none once they lie still', () => {
  for (const mob of ALL) {
    const st = stageOf(mob);
    let most = 0;
    let frames = 0;
    let some = 0;
    let asleep = 0;
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const n = breathAt(mob, st, at(mob, move, t)).length;
        frames++;
        if (n > 0) some++;
        if (move === 'abed') asleep = Math.max(asleep, n);
        else if (move !== 'attack') most = Math.max(most, n);
      }
    }
    assert.ok(some > 0.9 * frames, `the Hush leaking in ${some} of ${frames} living frames`);
    assert.ok(asleep > 0 && asleep < most, `asleep, the Hush at most ${asleep}; awake, ${most}`);
    let great = 0;
    for (let t = 0.3; t <= 1.2; t += 0.05) {
      const v = breathAt(mob, st, dyingMoment(mob, t));
      great = Math.max(great, v.length);
      for (const [, c] of v) assert.ok(!isCyan(c), `the Hush in cyan, ${c}`);
    }
    assert.ok(great >= 1.5 * most, `the Hush leaving them, ${great} at most; the most while they live, ${most}`);
    for (let t = 1.75; t <= PT_DIES.long + 1e-9; t += 0.05) assert.equal(breathAt(mob, st, dyingMoment(mob, t)).length, 0, `@${t.toFixed(2)}: the Hush still coming out`);
  }
});

test('8. THEIR EYES: shut in bed, open and pink as they rise, pink while they live, out once they are down; and down they lie, low on the floor', () => {
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  const height = (p: Painted): number => {
    const { w, h, d } = p.px;
    let y0 = h;
    let y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return y1 - y0;
  };
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const shut = move === 'abed' || (move === 'rise' && t < PT_RISE.eyes);
        assert.equal(pinkEyes(mob.bits(st, at(mob, move, t))), !shut, `${mob.id} ${move} @${t.toFixed(2)}: the eyes ${shut ? 'open' : 'shut'}`);
      }
    }
    for (let t = PT_DIES.knees; t <= PT_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.id} @${t.toFixed(2)}: the pink still in the eyes`);
    for (const view of VIEWS) {
      const up = height(paintMob(mob, 'stand', 0, view));
      const down = height(deathOfMob(mob, 1, view));
      assert.ok(down < 0.65 * up, `${mob.id} ${view}: ${down} pixels tall lying down, ${up} standing`);
    }
  }
});

test('9. THE SCREAM: the Hush bursting out before them from the scream on; its burst across the floor reaching SCREAM_REACH and no further, gone after SCREAM_FOR, nothing cyan', () => {
  for (const mob of ALL) {
    const st = stageOf(mob);
    const H = PT_SCREAM.hit;
    const long = framesOf(mob, 'attack').slice(-1)[0];
    // (the burst: puffs well out before the mouth, along the way they face; the Hush they breathe never goes so far)
    let before = 0;
    let ahead = 0;
    for (const t of framesOf(mob, 'attack')) {
      const m = at(mob, 'attack', t);
      const mouth = mouthOf(m.s);
      const out = breathAt(mob, st, m).filter(([p]) => dot(sub(p, mouth), [1, 0, 0]) > 12).length;
      if (t < H - 1e-6) before = Math.max(before, out);
      else if (t < H + PT_SCREAM.burst * 0.6) ahead = Math.max(ahead, out);
    }
    assert.ok(ahead >= 15, `${mob.id}: at most ${ahead} puffs of the scream out before the mouth`);
    assert.equal(before, 0, `${mob.id}: ${before} puffs out before the mouth before the scream`);
    assert.ok(H + PT_SCREAM.burst < long, `the burst gone by the move's end`);
  }
  // the burst across the floor, from (0, 0) along +x: drawn in tiles of 32 by 16 game pixels from (200, 120)
  const dots: { x: number; y: number; c: string }[] = [];
  const pen = { globalAlpha: 1, fillStyle: '' };
  const g = { ...pen, fillRect(x: number, y: number) { dots.push({ x, y, c: (g as unknown as typeof pen).fillStyle }); } } as unknown as CanvasRenderingContext2D;
  const atF = (x: number, y: number): [number, number] => [200 + (x - y) * 16, 120 + (x + y) * 8];
  let far = 0;
  for (let t = 0; t < SCREAM_FOR; t += 1 / 30) {
    dots.length = 0;
    drawScreamBurst(g, atF, 0, 0, 1, 0, t);
    for (const d of dots) {
      assert.ok(!isCyan(d.c), `the burst in cyan, ${d.c}`);
      // (back from the picture to the floor: along x)
      const fx = ((d.x - 200) / 16 + (d.y - 120) / 8) / 2;
      far = Math.max(far, fx);
    }
  }
  assert.ok(far > SCREAM_REACH * 0.8 && far < SCREAM_REACH + 0.5, `the burst reaches ${far.toFixed(2)} tiles (SCREAM_REACH ${SCREAM_REACH})`);
  dots.length = 0;
  drawScreamBurst(g, atF, 0, 0, 1, 0, SCREAM_FOR + 0.01);
  drawScreamBurst(g, atF, 0, 0, 1, 0, -0.01);
  assert.equal(dots.length, 0, 'the burst drawn outside its time');
});
