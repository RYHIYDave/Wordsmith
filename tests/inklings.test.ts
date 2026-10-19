// FLOOR 15'S SMALL MOB, THE INKLINGS (src/art/inklings.ts, their look; src/art/inklings_moves.ts, their moves;
// src/art/inkling_shots.ts, the pool they go about as): creatures of spilled ink. A MOCK-UP: NOT IN THE GAME, behind
// INKLINGS_ON, off. Their brief is this chat's, on his word of 18 Oct (“Hey go without my say so.  If something is shit
// I’ll get it to it but you’re doing a great jobs. At least for 11-15”), sent him with their films. Held as floor 15's
// Censor is (tests/censor.test.ts):
//   1. the switch is off, and only their pictures and drawings for the game (behind ACT2) import them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover (sunk into the pool, they rise from it): nothing through them; feet that grip; nothing
//      in the floor; nothing jerky; the lash drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as they
//      die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare;
//   5. NOTHING OF THEM IN THE FLOOR, beyond what the checks see: all of them, their pool too;
//   6. THE INK: dripping off them while they stand; flung off their claws at the lash; bursting out of them as they die;
//      sunk, only their pool is left, and risen they are whole again;
//   7. the pink in their eyes while they stand up, gone out once they are down; and down, only a stain on the floor;
//   8. the pool they go about as: drawn, black, its eyes the enemy's pink, nothing cyan.
//   run: tsx --test tests/inklings.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { DROP, IK_CANVAS, INKLINGS_ON } from '../src/art/inklings';
import { INKLING, IK_DIES, IK_LASH, IK_MELT, IK_RISE, IK_SHAPE } from '../src/art/inklings_moves';
import { TILE3 } from '../src/art/new_mobs3';
import { drawInkPool } from '../src/art/inkling_shots';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { FLAME, ENEMY_RIM } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf } from '../src/art/new_mobs3';
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

/** A move of a mob, as the game holds it. */
const moveOf = (mob: Mob, move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : (mob.more ?? {})[move]);
/** The moment of a move at `t`. */
const at = (mob: Mob, move: string, t: number): Moment => (move === 'dying' ? dyingMoment(mob, t) : momentOf(mob, moveOf(mob, move), t));
const stageOf = (mob: Mob): Stage => {
  const can = canvasOf(mob);
  return stage(paintViewOf(mob, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move of theirs (the game's frames of each: framesOf), painted on their whole picture both ways round. */
const PAINTED: { mob: Mob; move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
const ALL: Mob[] = [INKLING];
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (_mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

// (IN THE GAME BEHIND ACT2 since the Hush is built, 19 Oct 2026: through its pictures for the game, art/act1_figs/, and what it
// lays on the floor, render/act1_fx/, alone; its switch still off, as nothing of the game draws them while ACT2 is off)
test('1. the switch is off, and only their pictures and drawings for the game (behind ACT2) import them', () => {
  assert.equal(INKLINGS_ON.on, false, 'INKLINGS_ON is off');
  const resolve = (from: string, spec: string): string => {
    const parts = from.split('/').slice(0, -1);
    for (const s of spec.split('/')) {
      if (s === '..') parts.pop();
      else if (s !== '.') parts.push(s);
    }
    return parts.join('/');
  };
  const art = new Set(['art/inklings', 'art/inklings_moves', 'art/inkling_shots']);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || art.has(f.replace(/\.ts$/, ''))) continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    for (const m of text.matchAll(/from ['"]([^'"]+)['"]/g)) if (art.has(resolve(f, m[1]))) users.push(f);
  }
  assert.equal([...new Set(users)].sort().join(' '), 'art/act1_figs/inkling.ts render/act1_fx/inkling.ts', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,melt,rise');
    const found = checkBoss(mob, IK_SHAPE);
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
    assert.equal(`${w}x${h}`, `${IK_CANVAS.w}x${IK_CANVAS.h}`);
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
  assert.ok(least >= ROOM, `the nearest he comes to the edge: ${least}`);
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

test('5. NOTHING OF THEM IN THE FLOOR: all of them, their pool too', () => {
  const faults: string[] = [];
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        const bits: Bit[] = mob.bits(st, at(mob, move, t));
        for (const b of bits) {
          if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
          const by = under(b.shape);
          if (by > 0.6) faults.push(`${mob.name} ${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
        }
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** The grains of him at a moment (the words going free). */
function grainsAt(mob: Mob, st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  mob.bits(st, m);
  return mob.grains?.(st, m) ?? [];
}

test('6. THE INK: dripping off them as they stand, flung off their claws at the lash, bursting out of them as they die; sunk, only the pool; risen, whole again', () => {
  const mob = INKLING;
  const st = stageOf(mob);
  const drops = (move: string, t: number): number => grainsAt(mob, st, at(mob, move, t)).filter(([, c]) => c === DROP).length;
  let dripping = 0;
  for (let t = 0; t < 2.8; t += 0.1) dripping += drops('stand', t);
  assert.ok(dripping > 20, `${dripping} drops falling off them as they stand`);
  assert.ok(drops('attack', IK_LASH.hit + 0.08) > drops('attack', IK_LASH.warn[0]) + 6, 'ink flung off the claws at the lash');
  assert.ok(drops('dying', 0.2) > 10, 'ink bursting out of them as they die');
  const pieces = (move: string, t: number): Set<string> => new Set(mob.bits(st, at(mob, move, t)).map((b) => b.piece));
  assert.equal([...pieces('melt', IK_MELT.long)].join(','), 'pool', 'sunk: only the pool');
  assert.equal([...pieces('rise', 0)].join(','), 'pool', 'before they rise: only the pool');
  const whole = pieces('stand', 0);
  for (const p of whole) assert.ok(pieces('rise', IK_RISE.long).has(p), `risen, their ${p} is back`);
});

test('7. the pink in their eyes while they stand up, gone out once they are down; and down, only a stain on the floor', () => {
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && FLAME.includes(b.shape.c));
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of ['stand', 'walk', 'attack', 'reel']) {
      for (const t of framesOf(mob, move)) assert.ok(pinkEyes(mob.bits(st, at(mob, move, t))), `${mob.name} ${move} @${t.toFixed(2)}: no pink in the eyes`);
    }
    for (let t = IK_DIES.slump; t <= IK_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    const top = (bits: Bit[]): number => Math.max(...bits.map((b) => {
      const sh = b.shape;
      if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
      if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
      return -Infinity;
    }));
    const up = top(mob.bits(st, at(mob, 'stand', 0)));
    const down = top(mob.bits(st, dyingMoment(mob, IK_DIES.long)));
    assert.ok(down < 0.1 * up, `${mob.name}: its top ${down.toFixed(1)} over the ground once down, ${up.toFixed(1)} standing`);
  }
});

function recorder(): { g: CanvasRenderingContext2D; colours: Set<string>; n: () => number } {
  const colours = new Set<string>();
  let n = 0;
  const g = {
    globalAlpha: 1,
    fillStyle: '#000000',
    fillRect(): void {
      n++;
      colours.add(String(g.fillStyle));
    },
  } as unknown as CanvasRenderingContext2D;
  return { g, colours, n: () => n };
}

test('8. the pool they go about as: drawn, black, its eyes the enemy\'s pink, never cyan', () => {
  const floorAt = (x: number, y: number): readonly [number, number] => [100 + (x - y) * 16, 60 + (x + y) * 8];
  const r = recorder();
  for (let t = 0; t < 2; t += 0.1) drawInkPool(r.g, floorAt, 2 + t, 2 + 0.3 * t, 1, 0.3, t);
  drawInkPool(r.g, floorAt, 3, 3, 0, 0, 0.2);
  assert.ok(r.n() > 1500, `${r.n()} pixels drawn`);
  for (const c of r.colours) if (c.startsWith('#')) assert.ok(!isCyan(c), `the pool draws cyan, ${c}`);
  assert.ok([...r.colours].some((c) => FLAME.includes(c)), 'the eyes surfacing in it, pink');
  for (const c of r.colours) if (c.startsWith('#') && !FLAME.includes(c)) {
    const [rr, gg, bb] = rgba(c);
    assert.ok(Math.max(rr, gg, bb) < 90, `the pool's ink ${c}, not black`);
  }
});
