// FLOOR 11'S BOSS, THE CRIER (src/art/crier.ts, his look; src/art/crier_moves.ts, his moves; src/art/crier_shots.ts,
// what he does to the floor). A MOCK-UP: NOT IN THE GAME, behind CRIER, off. The owner's brief in the art chat,
// 18 Oct 2026: "The act 1 boss was a big huge non-moving horror.  I think we want a smaller, quick moving, no
// frills fight"; "Heavy and pompous, then sudden (Recommended)"; "The great brass trumpet, its throat burning
// pink (Recommended)"; his four moves, "Yes, these four (Recommended)"; his death, "The Hush pours out of him";
// "Nothing gory (Recommended),Not a clown or jester"; of his look, "Bigger at game size", then "Yes, animate him
// (Recommended)". So:
//   1. the switch is off, and nothing of the game imports him;
//   2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover from one move to the next: nothing through him or his coat, feet that grip,
//      nothing in the floor, nothing jerky, blows drawn back, held and carried through, hips first, alive when
//      still;
//   3. every frame of every move paints both ways round: nothing cyan, his pink edge while he lives and none as
//      he dies, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame of every move, both ways round, he is inside his picture with room to
//      spare;
//   5. NOTHING OF HIM IN THE FLOOR, beyond what the checks see (all he wears and carries: his coat, his hat, his
//      satchel, his trumpet): but the trumpet's bell where his swing slams it down, a little way in (it cracks the
//      flags: art/crier_shots.ts drawBellSlam);
//   6. as he dies the pink goes out of the trumpet's throat before it falls, and stays out;
//   7. what falls from him as he dies, his trumpet and his hat, lies clear of him once he is down, from in front
//      and from behind;
//   8. what he does to the floor is drawn in the enemy's colours and the Hush's, never a friend's cyan, and only
//      while it lasts.
//   run: tsx --test tests/crier.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { CRIER, CR_CANVAS, CR_HAT_GOES, CR_SWING_HIT, CR_TRUMPET_GOES } from '../src/art/crier';
import { CRIER_MOB, CR_SHAPE } from '../src/art/crier_moves';
import { CROWD_FOR, PROCLAIM_FOR, RISING_FOR, SHOUT_FOR, SLAM_FOR, drawBellSlam, drawCrowdBreath, drawCrowdCall, drawHushedRising, drawProclaimWarn, drawProclamation, drawShoutBlast, drawShoutWarn } from '../src/art/crier_shots';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import type { FloorAt } from '../src/art/mob_shots';
import type { Bit, Mob, Shape } from '../src/art/new_mobs3';
import { canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
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

const MOB = CRIER_MOB;
/** Every move of his, but his death. */
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');
const VIEWS = ['front', 'back'] as const;

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

/** Every frame of every move of his (the game's frames of each: framesOf), painted on his whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}

// (ACT 2, THE HUSH: he is in the game behind ACT2 (off) through his figure and what he draws alone: art/act1_figs/crier.ts,
// render/act1_fx/crier.ts. His rules know nothing of his pictures: game/act1_rules/crier.ts, held to them by
// tests/act2_crier.test.ts. His switch gates nothing of the game, and is off until the act is in)
const HIS_OWN = ['art/act1_figs/crier.ts', 'render/act1_fx/crier.ts'];
test('1. the switch is off, and nothing of the game imports him but his figure and what he draws (behind ACT2)', () => {
  assert.equal(CRIER.on, false, 'CRIER is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (and the city's mobs, mock-ups of their own that take the Hush's colours from him: art/hushed.ts and the rest;
    // floor 13's Hushed in the fields, art/fieldhands.ts: tests/fieldhands.test.ts; floor 14's pieces, art/floor14.ts,
    // whose spilled tonic lets the Hush out: tests/floor14.test.ts; and its Hushed patients, art/patients.ts, the Hush
    // leaking out of them: tests/patients.test.ts; and floor 16's palace guard and its boss, the Princess, the Hush's
    // colours theirs: tests/palace_guard.test.ts and tests/princess.test.ts; and floor 20's shapes of the Hush, its colours
    // theirs: tests/hush_shapes.test.ts)
    if (!f.endsWith('.ts') || f.startsWith('dev') || HIS_OWN.includes(f) || /^art\/(crier(_moves|_shots)?|hushed(_moves)?|hushed_watch(_moves)?|hounds|fieldhands|floor14|patients|palace_guard(_moves)?|palace_hands(_moves)?|princess(_moves|_ride)?|hush_shapes)\.ts$/.test(f)) continue;
    // (by where each import leads, not by its name: game/act1_rules/crier.ts, his rules, is a "crier" too)
    const dir = f.split('/').slice(0, -1);
    for (const [, spec] of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const bit of spec.split('/')) {
        if (bit === '..') parts.pop();
        else if (bit !== '.') parts.push(bit);
      }
      if (/^art\/crier(_moves|_shots)?$/.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal(users.join(' '), '', 'game files that import him');
});

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,setOff,halt,shout,proclaim,crowd');
  const found = checkBoss(MOB, CR_SHAPE);
  assert.equal(found.length, 0, `the Crier: ${findingsSaid(found).slice(0, 12).join('; ')}`);
});

test('3. every frame paints both ways round: nothing cyan, his pink edge while he lives and none as he dies, every pixel whole or empty but the edge', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
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
    if (n < 600 || cyan || odd || (alive ? rim < 60 : rim !== 0)) faults.push(`${move} ${view} @${t.toFixed(2)}: ${n} pixels, ${rim} of his edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${CR_CANVAS.w}x${CR_CANVAS.h}`);
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
    if (room < ROOM) faults.push(`${move} ${view} @${t.toFixed(2)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest he comes to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  return Math.max(0, -z);
}

/** Where his swing slams the trumpet's bell down (seconds), and as far as it goes into the floor there (his own lengths). */
const SLAMMED: [number, number] = [CR_SWING_HIT - 0.02, CR_SWING_HIT + 0.3];
const SLAM_MOST = 4.5;

test('5. NOTHING OF HIM IN THE FLOOR: all he wears and carries, but the bell where his swing slams it down', () => {
  const can = canvasOf(MOB);
  const st = stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
  const faults: string[] = [];
  let bit = 0;
  for (const move of [...LIVING, 'dying']) {
    const mv = move === 'dying' ? MOB.dying : move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move];
    for (const t of framesOf(MOB, move)) {
      const m = move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, mv, t);
      const bits: Bit[] = MOB.bits(st, m).filter((b) => !(move === 'dying' && ((b.piece === 'trumpet' && t >= CR_TRUMPET_GOES) || (b.piece === 'hat' && t >= CR_HAT_GOES))));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        const slam = move === 'attack' && b.piece === 'trumpet' && t >= SLAMMED[0] && t <= SLAMMED[1];
        if (slam) bit = Math.max(bit, by);
        if (by > (slam ? SLAM_MOST : 0.6)) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
  assert.ok(bit >= 1, `where it slams down, the bell goes into the floor ${bit.toFixed(1)}`);
});

test('6. as he dies the pink goes out of the trumpet’s throat before it falls, and stays out', () => {
  const can = canvasOf(MOB);
  const st = stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
  const throatLit = (m: ReturnType<typeof dyingMoment>): boolean => MOB.bits(st, m).some((b) => b.part === 'throat' && b.shape.k === 'glow');
  assert.ok(throatLit(dyingMoment(MOB, 0)), 'the throat burns as he is struck down');
  for (const t of framesOf(MOB, 'dying')) if (t >= CR_TRUMPET_GOES - 0.05) assert.ok(!throatLit(dyingMoment(MOB, t)), `@${t.toFixed(2)}: the throat still burns`);
});

test('7. what falls from him as he dies, his trumpet and his hat, lies clear of him once he is down, from in front and from behind', () => {
  const fallen = new Set(['trumpet', 'hat']);
  // (him alone: what falls from him sent far off his picture; and what falls alone)
  const him: Mob = { ...MOB, fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
  const pieces: Mob = { ...MOB, bits: (st, m) => MOB.bits(st, m).filter((b) => fallen.has(b.piece)) };
  const down = 2.4 / MOB.dieTime;
  for (const view of VIEWS) {
    for (let k = down; k <= 1 + 1e-9; k += 0.04) {
      const a = deathOfMob(him, Math.min(1, k), view).px.d;
      const b = deathOfMob(pieces, Math.min(1, k), view).px.d;
      let mine = 0;
      let theirs = 0;
      let both = 0;
      for (let i = 3; i < a.length; i += 4) {
        if (a[i]) mine++;
        if (b[i]) theirs++;
        if (a[i] && b[i]) both++;
      }
      assert.ok(mine > 1500 && theirs > 400, `${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what fell`);
      assert.equal(both, 0, `${view} @${k.toFixed(2)}: what fell from him lies over him or under him by ${both} pixels`);
    }
  }
});

test('8. what he does to the floor is in the enemy’s colours and the Hush’s, never cyan, and only while it lasts', () => {
  // (a canvas that keeps what is drawn on it: each colour, and how many pixels)
  const drawn: string[] = [];
  const c: { fillStyle: string; globalAlpha: number; fillRect(): void } = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(): void {
      drawn.push(c.fillStyle);
    },
  };
  const g = c as unknown as CanvasRenderingContext2D;
  const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];
  const count = (draw: () => void): number => {
    const was = drawn.length;
    draw();
    return drawn.length - was;
  };
  const [fx, fy] = [1, 0];
  // (each lasting so long from its moment; and each warning, as far through it as `k`)
  const all: [string, (t: number) => void, number][] = [
    ['the bell slams', (t) => drawBellSlam(g, ISO, 2, 0, t), SLAM_FOR],
    ['the Shout', (t) => drawShoutBlast(g, ISO, 0, 0, fx, fy, t), SHOUT_FOR],
    ['the Proclamation', (t) => drawProclamation(g, ISO, 0, 0, fx, fy, t), PROCLAIM_FOR],
    ['the Crowd calls', (t) => drawCrowdCall(g, ISO, 0, 0, t), CROWD_FOR],
    ['the Hushed come', (t) => drawHushedRising(g, ISO, 3, 2, t), RISING_FOR],
  ];
  for (const [name, draw, long] of all) {
    for (let t = 0.05; t < long; t += 0.1) assert.ok(count(() => draw(t)) > 10, `${name} @${t.toFixed(2)}: drawn`);
    assert.equal(count(() => draw(long + 0.05)), 0, `${name}: gone after ${long.toFixed(2)} s`);
    assert.equal(count(() => draw(-0.1)), 0, `${name}: nothing before it`);
  }
  const warns: [string, (k: number, t: number) => void][] = [
    ['the Shout warns', (k, t) => drawShoutWarn(g, ISO, 0, 0, fx, fy, k, t)],
    ['the Proclamation warns', (k, t) => drawProclaimWarn(g, ISO, 0, 0, fx, fy, k, t)],
    ['the Crowd warns', (k, t) => drawCrowdBreath(g, ISO, 0, 0, k, t)],
  ];
  for (const [name, draw] of warns) {
    assert.equal(count(() => draw(0, 0.3)), 0, `${name}: nothing before it begins`);
    for (let k = 0.1; k <= 1; k += 0.1) assert.ok(count(() => draw(k, k)) > 10, `${name} at ${k.toFixed(1)}: drawn`);
  }
  const cyan = [...new Set(drawn)].filter(isCyan);
  assert.equal(cyan.join(' '), '', 'cyan drawn on the floor');
});
