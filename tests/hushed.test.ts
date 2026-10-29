// FLOOR 11'S SMALL MOB, THE HUSHED TOWNSFOLK (src/art/hushed.ts, their look; src/art/hushed_moves.ts, their moves).
// A MOCK-UP: NOT IN THE GAME, behind HUSHED_ON, off. The owner's brief in the art chat, 18 Oct 2026: of floor 11's
// monsters, “The Hushed townsfolk (Recommended)”; what marks them, “The Hush leaking out”; how they fight, “Shuffle,
// then lunge and grab (Recommended)”; how they go down, “The Hush leaves them (Recommended)”; of their look, “Yes,
// animate them (Recommended)”; of their four films (walk, attack, reel, die), “Yes, as shown (Recommended)”. So, for
// each of the three of them (the porter, the goodwife and the baker):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover: nothing through them, feet that grip, nothing in the floor, nothing jerky, the
//      blow drawn back, held and carried through, hips first, alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as
//      they die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare;
//   5. NOTHING OF THEM IN THE FLOOR, beyond what the checks see: all they wear (a skirt, an apron, a smock);
//   6. THE HUSH LEAKING OUT: grey breath from their mouths in every living frame; one great breath of it as it leaves
//      them, near twice the most they ever breathe out while they live (as they lunge); and none once they lie still;
//   7. the cult's dull pink in their eyes while they live, gone out once they are down; and down they lie: people
//      again, low on the floor.
//   run: tsx --test tests/hushed.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { HUSHED_CANVAS, HUSHED_ON } from '../src/art/hushed';
import { HUSHED_ALL, HU_DIES, HU_SHAPE } from '../src/art/hushed_moves';
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
for (const mob of HUSHED_ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (mob: Mob, move: string, view: string, t: number): string => `${mob.name.replace('A Hushed ', '')} ${move} ${view} @${t.toFixed(2)}`;

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(HUSHED_ON.on, false, 'HUSHED_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (and the Hushed watch and the mute watch hounds, mock-ups of their own that take their breath from them:
    // tests/hushed_watch.test.ts, tests/hounds.test.ts; and floor 13's Hushed in the fields, their body and breath:
    // tests/fieldhands.test.ts; and floor 14's Hushed patients, the same: tests/patients.test.ts)
    // (and, behind ACT2, off: their pictures as the game holds them, art/act1_figs/hushed.ts, since 19 Oct; only them)
    // (and Act 2's town hub, the camp's people, the same three with their voices back, art/hub2_folk.ts, behind HUB2, off:
    // tests/hub2.test.ts)
    // (and floor 16's gardeners and grooms, its palace guard and its boss, the Princess, their breath and its lag from
    // them: tests/palace_hands.test.ts, tests/palace_guard.test.ts, tests/princess.test.ts; and floor 17's boss, the, princess.test.ts; and floor 17's footmen, their, princess.test.ts), princess.test.ts; and floor 18's queen's guard:
    // Prince, his fog's breath and its lag: tests/prince.test.ts, skin and breath: tests/masque_footmen.test.ts, (and floor 17's masked dancers, the same: tests/masque_dancers.test.ts, tests/queens_guard.test.ts,  (and floor 18's ladies-in-waiting, their breath and its lag: tests/gallery_ladies.test.ts)
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(hushed(_moves|_watch|_watch_moves)?|hounds|fieldhands|patients|hub2_folk|palace_hands(_moves)?|palace_guard(_moves)?|princess(_moves|_ride)?|prince(_moves, masque_footmen(_moves|_fx|masque_dancers(_moves)?|queens_guard|gallery_ladies)\.ts$/.test(f) || f === 'art/act1_figs/hushed.ts') continue;
    // (each import followed to the file it names: the game's own files named for the kind, game/act1_rules/hushed.ts and
    // render/act1_fx/hushed.ts, and the registers that import them, are not these)
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = f.split('/').slice(0, -1);
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (/^art\/hushed(_moves)?$/.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal(users.join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover, all three of them', () => {
  for (const mob of HUSHED_ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying');
    const found = checkBoss(mob, HU_SHAPE);
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
    assert.equal(`${w}x${h}`, `${HUSHED_CANVAS.w}x${HUSHED_CANVAS.h}`);
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

test('5. NOTHING OF THEM IN THE FLOOR: all they wear, all three of them', () => {
  const faults: string[] = [];
  for (const mob of HUSHED_ALL) {
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

/** How many motes of the Hush come out of them at a moment (laid after their edge: the grains). */
function breathAt(mob: Mob, st: Stage, m: Moment): number {
  mob.bits(st, m);
  return (mob.grains?.(st, m) ?? []).length;
}

test('6. THE HUSH LEAKING OUT: grey breath in every living frame; one great breath of it as it leaves them; none once they lie still', () => {
  for (const mob of HUSHED_ALL) {
    const st = stageOf(mob);
    let most = 0;
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const n = breathAt(mob, st, at(mob, move, t));
        assert.ok(n > 0, `${mob.name} ${move} @${t.toFixed(2)}: no breath`);
        most = Math.max(most, n);
      }
    }
    let great = 0;
    for (let t = 0.3; t <= 1.3; t += 0.05) great = Math.max(great, breathAt(mob, st, dyingMoment(mob, t)));
    assert.ok(great >= 1.8 * most, `${mob.name}: the great breath as the Hush leaves them, ${great} motes; the most while they live, ${most}`);
    for (let t = 1.75; t <= HU_DIES.long + 1e-9; t += 0.05) assert.equal(breathAt(mob, st, dyingMoment(mob, t)), 0, `${mob.name} @${t.toFixed(2)}: still breathing out the Hush`);
    // (and the breath is the Hush's grey: nothing cyan in it)
    mob.bits(st, dyingMoment(mob, 0.8));
    for (const [, c] of mob.grains?.(st, dyingMoment(mob, 0.8)) ?? []) assert.ok(!isCyan(c), `${mob.name}: the Hush in cyan, ${c}`);
  }
});

test('7. the dull pink in their eyes while they live, gone out once they are down; and down they lie, low on the floor', () => {
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  const height = (p: Painted): number => {
    const { w, h, d } = p.px;
    let y0 = h;
    let y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3]) {
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
      }
    }
    return y1 - y0;
  };
  for (const mob of HUSHED_ALL) {
    const st = stageOf(mob);
    for (const move of LIVING(mob)) for (const t of framesOf(mob, move)) assert.ok(pinkEyes(mob.bits(st, at(mob, move, t))), `${mob.name} ${move} @${t.toFixed(2)}: no pink in the eyes`);
    for (let t = HU_DIES.knees; t <= HU_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    // (seen from above at the game's slant a body lying along the floor still stands some way up the picture: about
    // three fifths of their standing height from behind, less from in front)
    for (const view of VIEWS) {
      const up = height(paintMob(mob, 'stand', 0, view));
      const down = height(deathOfMob(mob, 1, view));
      assert.ok(down < 0.65 * up, `${mob.name} ${view}: ${down} pixels tall lying down, ${up} standing`);
    }
  }
});
