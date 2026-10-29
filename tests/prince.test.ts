// FLOOR 17'S BOSS, THE PRINCE (src/art/prince.ts, his look; src/art/prince_moves.ts, his moves; src/art/prince_fx.ts, what
// his moves leave on the floor). A MOCK-UP: NOT IN THE GAME, behind PRINCE_ON, off. His brief, offered as a pop-up and his
// pick “Yes, this brief (Recommended)” (art/prince.ts has it as offered); his words for him, 28 Oct, “There are big bosses
// that can be slow.  But like the prince with a rapier, dancing is going to need to be fast and constantly moving”; his
// rulebook's Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”) and of the enemies
// “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra
// time the player gets to evade”; and his rule 7, “I need all bosses ran through all checks from now on.  These boss fights
// are important”:
//   1. the switch is off, and nothing of the game imports him;
//   2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and from behind,
//      and every handover;
//   3. HIS LIGHTNING STRIKES: each of his four blows winds up, holds, strikes in two frames and lands on the second; the
//      strike's frames, and the one after it, carry its smear; no other frame does;
//   4. every frame paints both ways round: nothing cyan, nothing in the pinks on him but the enemy's edge and the Hush's
//      eyes and glints, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge;
//   5. NOTHING CUT OFF;
//   6. NOTHING OF HIM IN THE FLOOR;
//   7. HIS BRIEF: the smiling gilt mask on his face in every frame he lives, the Hush's dull pink in its eyes; NEVER STILL
//      (his stand steps, sways and circles the point); the death leaves no body: the mask cracks and falls in two, fog where
//      his face was, and at the end nothing of him stands, only his clothes, the mask's halves and the rapier on the floor;
//   8. WHAT HIS MOVES LEAVE: the ring of partners snaps shut in two frames, the masks fly smeared and spinning, the clock's
//      rings roll out; nothing cyan in any of them;
//   9. HIS SIZES AND SPEEDS IN TILES (a boss arena about 17 by 20): a head taller than the knight; dancing 4.5 tiles a second
//      (the Princess glides at 4), faster in his darts; the lunge's point flung three tiles and more in its two frames, four
//      out from where he stood; the ring nine tiles across closing to five; the masks twelve tiles; the chimes across the
//      whole arena, twelve, faster each phase.
//   run: tsx --test tests/prince.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { PC_CANVAS, PRINCE_BODY, PRINCE_ON, rapierOf } from '../src/art/prince';
import { DART, PC_DIES, PC_MASKS, PC_PACE, PC_SHAPE, PC_STRIKES, PC_THRUST, PRINCE, WALTZ, bonesOf, smearedAt } from '../src/art/prince_moves';
import { CHIME, DANCE_FX, MASKS_FX, MASK_FLIGHT, chimePainted, chimeRing, dancePainted, danceRing, flungMask, maskPainted, maskSmear } from '../src/art/prince_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
import { KNIGHT_BODY } from '../src/art/moves3';
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
const MOB: Mob = PRINCE;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function hueOf(r: number, g: number, b: number): { h: number; sat: number; max: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return { h: 0, sat: 0, max };
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return { h: (h + 360) % 360, sat: (max - min) / max, max };
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const { h, sat, max } = hueOf(r, g, b);
  return max >= 150 && sat >= 0.45 && h >= 160 && h <= 205;
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
/** The pinks that may be on him: the enemy's edge and fire (eyes, glints) only. His own colours keep clear of hues 300 to 350. */
const ENEMY_PINKS = new Set([ENEMY_RIM, ...FLAME].map((c) => rgba(c).slice(0, 3).join(',')));
const strayPink = (p: Painted): string | null => {
  const { d } = p.px;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const key = `${d[i]},${d[i + 1]},${d[i + 2]}`;
    if (ENEMY_PINKS.has(key)) continue;
    const { h, sat, max } = hueOf(d[i], d[i + 1], d[i + 2]);
    if (h >= 300 && h <= 350 && sat >= 0.35 && max >= 90) return key;
  }
  return null;
};

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const stageOf = (view: 'front' | 'back' = 'front'): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, view), can.ax, can.ay, can);
};

/** The smear's own colours (art/prince.ts SMEAR). */
const SMEAR = new Set(['#7a7092', '#c8c0d4', '#f6eedc'].map((c) => rgba(c).slice(0, 3).join(',')));
/** What is asked of every frame he is painted in, worked out as it is painted (the pictures themselves are not kept). */
interface Seen {
  move: string;
  view: (typeof VIEWS)[number];
  t: number;
  n: number;
  rim: number;
  odd: number;
  cyan: boolean;
  pink: string | null;
  smear: number;
  room: number;
  size: string;
}
const [PR, PG, PB] = rgba(ENEMY_RIM);
function seenOf(move: string, view: (typeof VIEWS)[number], t: number, p: Painted): Seen {
  const { w, h, d } = p.px;
  let n = 0;
  let rim = 0;
  let odd = 0;
  let smear = 0;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] === 0) continue;
      n++;
      if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
      if (d[i + 3] === RIM_ALPHA && d[i] === PR && d[i + 1] === PG && d[i + 2] === PB) rim++;
      if (d[i + 3] === 255 && SMEAR.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) smear++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { move, view, t, n, rim, odd, cyan: cyanIn(p), pink: strayPink(p), smear, room: Math.min(x0, y0, w - 1 - x1, h - 1 - y1), size: `${w}x${h}` };
}
/** Every frame of every move of his (the game's frames of each: framesOf), painted on his whole picture both ways round. */
const PAINTED: Seen[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push(seenOf(move, view, t, move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view)));
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;
const pixels = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};

test('1. the switch is off, and nothing of the game imports him', () => {
  assert.equal(PRINCE_ON.on, false, 'PRINCE_ON is off');
  const users: string[] = [];
  const his = /^art\/prince(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || his.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (his.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import him');
});

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,setOff,halt,dart,dance,waltz,masks,midnight');
  const found = checkBoss(MOB, PC_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
  // (and every handover the game may make is one the review looks at)
  const h = PC_SHAPE.handovers ?? [];
  for (const m of movesOf(MOB).filter((x) => !['stand', 'walk', 'waltz', 'setOff', 'halt'].includes(x))) assert.ok(h.some((x) => x.from === 'stand' && x.to === m), `stand into ${m}`);
  for (const [a, b] of [['stand', 'setOff'], ['setOff', 'walk'], ['walk', 'halt'], ['halt', 'stand'], ['dance', 'waltz'], ['waltz', 'stand']]) assert.ok(h.some((x) => x.from === a && x.to === b), `${a} into ${b}`);
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(PC_STRIKES).sort().join(','), 'attack,dance,masks,midnight');
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(PC_STRIKES)) {
    assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: its strike is two frames`);
    assert.equal(moveOf(move).motion.hit, s1, `${move}: it lands on the strike's last frame`);
    // (the wind-up held: what strikes nearly still for a tenth of a second and more before it goes)
    for (const { move: m, view, t, smear: n } of PAINTED) {
      if (m !== move) continue;
      const want = smearedAt(move, t);
      if (want && n < 12) faults.push(`${said(m, view, t)}: its smear only ${n} pixels`);
      if (!want && n > 0) faults.push(`${said(m, view, t)}: smeared out of its strike (${n})`);
    }
  }
  for (const { move, view, t, smear } of PAINTED) if (!PC_STRIKES[move] && smear > 0) faults.push(`${said(move, view, t)}: smeared`);
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, no pink of his own, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge', () => {
  const faults: string[] = [];
  for (const { move, view, t, n, rim, odd, cyan, pink } of PAINTED) {
    const alive = move !== 'dying';
    if (n < 600 || cyan || odd || pink || (alive ? rim < 60 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}${pink ? `, a pink of his own ${pink}` : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, room, size } of PAINTED) {
    assert.equal(size, `${PC_CANVAS.w}x${PC_CANVAS.h}`);
    least = Math.min(least, room);
    if (room < ROOM) faults.push(`${said(move, view, t)}: ${room} pixels from the edge`);
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

test('6. NOTHING OF HIM IN THE FLOOR: all he wears and holds, in every frame of every move, his death too', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(move, t))) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot' || b.shape.k === 'thread') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. HIS BRIEF: the smiling gilt mask with the Hush in its eyes; never still; the mask cracks and falls, fog where his face was, and no body is left', () => {
  const st = stageOf();
  const masked = (bits: Bit[]): boolean => bits.some((b) => b.part === 'mask' && b.piece === 'maskA') && bits.some((b) => b.part === 'mask' && b.piece === 'maskB');
  const pinkEyes = (bits: Bit[]): boolean => bits.filter((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]).length === 2;
  for (const move of LIVING) for (const t of framesOf(MOB, move)) {
    const bits = MOB.bits(st, at(move, t));
    assert.ok(masked(bits), `${move} @${t.toFixed(2)}: no mask on his face`);
    assert.ok(pinkEyes(bits), `${move} @${t.toFixed(2)}: not the Hush's pink in its eyes`);
  }
  // THE SMILE: the mask's face, carved: its eye holes and its wide smile dark, its corners turned up, the rest gilt
  const mask = MOB.bits(st, at('stand', 0)).find((b) => b.piece === 'maskA' && b.shape.k === 'ball');
  assert.ok(mask && mask.shape.k === 'ball' && typeof mask.shape.skin === 'function', 'the mask');
  const skin = (mask as { shape: { skin: (u: V3, tone: number, x: number, y: number) => string | null } }).shape.skin;
  const on = (y: number, z: number): V3 => [Math.sqrt(Math.max(0, 1 - y * y - z * z)), y, z];
  assert.equal(skin(on(0, -0.44), 3, 0, 0), '#1a1208', 'the smile at its middle');
  assert.equal(skin(on(0.5, -0.24), 3, 0, 0), '#1a1208', 'the smile turned up at its corner');
  assert.equal(skin(on(0.36, 0.17), 3, 0, 0), '#1a1208', 'an eye hole');
  assert.ok(/^#[0-9a-f]{6}$/.test(skin(on(0.42, -0.08), 3, 0, 0) ?? '') && skin(on(0.42, -0.08), 3, 0, 0) !== '#1a1208', 'gilt on the cheek');
  // NEVER STILL (his “dancing is going to need to be fast and constantly moving”): standing, both feet step, his body sways
  // and rises, the rapier's point goes round
  const ts = framesOf(MOB, 'stand');
  const sk = ts.map((t) => skeletonAt(MOB, 'stand', t));
  const span = (f: (i: number) => number): number => Math.max(...ts.map((_, i) => f(i))) - Math.min(...ts.map((_, i) => f(i)));
  assert.ok(span((i) => sk[i].toeL[2]) > 1.5 && span((i) => sk[i].toeR[2]) > 1.5, 'each foot steps');
  assert.ok(span((i) => sk[i].pelvis[1]) > 2.5, `he sways: ${span((i) => sk[i].pelvis[1]).toFixed(1)}`);
  assert.ok(span((i) => sk[i].pelvis[2]) > 1.2, 'he rises and sinks');
  const tips = sk.map((s) => rapierOf(s).tip);
  assert.ok(span((i) => tips[i][1]) > 4 && span((i) => tips[i][2]) > 2, 'the point goes round');
  // HIS DEATH: the mask cracks across before it falls
  const crackA = MOB.bits(st, dyingMoment(MOB, (PC_DIES.crack[0] + PC_DIES.crack[1]) / 2)).find((b) => b.piece === 'maskA');
  assert.ok(crackA, 'the cracked mask');
  // (its halves fall and lie on the floor, face up)
  const end = deathOfMob(MOB, 1, 'front');
  const gilt = new Set(['#a47c26', '#d6ae46', '#f6e090', '#6c4c14'].map((c) => rgba(c).slice(0, 3).join(',')));
  let giltLow = 0;
  const { w, d } = end.px;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] && gilt.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && Math.floor(i / 4 / w) > PC_CANVAS.ay - 26) giltLow++;
  assert.ok(giltLow > 20, `the mask's halves on the floor: ${giltLow} pixels of gilt there`);
  // (fog where his face was, once the mask is gone)
  const fogFace = MOB.bits(st, dyingMoment(MOB, PC_DIES.maskFalls + 0.1)).find((b) => b.part === 'head' && b.shape.k === 'ball');
  assert.ok(fogFace && fogFace.shape.k === 'ball' && typeof fogFace.shape.skin === 'function' && ['#8f88aa', '#b6b0cc', '#d6d2e4', '#625a7a'].includes(fogFace.shape.skin([1, 0, 0], 3, 0, 0) ?? ''), 'fog where his face was');
  // (the fog pours out of him, and is gone by the end)
  assert.ok((MOB.grains?.(st, dyingMoment(MOB, PC_DIES.maskFalls + 0.4)) ?? []).length > 200, 'the fog pouring out of him');
  assert.equal((MOB.grains?.(st, dyingMoment(MOB, PC_DIES.long)) ?? []).length, 0, 'the fog all gone at the end');
  // NO BODY: at the end, nothing of him stands; all that is left lies on the floor (his clothes, empty and flat), and no pink
  const left = MOB.bits(st, dyingMoment(MOB, PC_DIES.long));
  assert.ok(!left.some((b) => b.piece === 'eyes'), 'no eyes left');
  let top = 0;
  for (let y = 0; y < end.px.h && !top; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) {
    top = PC_CANVAS.ay - y;
    break;
  }
  assert.ok(top < 16, `at the end nothing stands: the highest of what is left ${top} pixels up`);
});

test('8. WHAT HIS MOVES LEAVE: the ring snaps shut in two frames; the masks fly smeared and spinning; the chimes roll out; nothing cyan', () => {
  const F = DANCE_FX;
  assert.equal(Math.round((F.snap[1] - F.snap[0]) * 30), 2, 'the ring snaps in two frames');
  for (const view of VIEWS) {
    for (let t = 0; t <= F.long + 0.05; t += 1 / 15) assert.ok(!cyanIn(dancePainted(t, view)), `the Dance ${view} @${t.toFixed(2)}: cyan`);
    assert.ok(pixels(dancePainted(F.rise[1] + 0.3, view)) > 2000, `${view}: the partners risen`);
    assert.ok(pixels(dancePainted(F.long + 0.05, view)) === 0, `${view}: the partners gone`);
    for (let s = 0; s < 6.3; s += 0.5) assert.ok(!cyanIn(maskPainted(s, view)), `a mask ${view}: cyan`);
    for (const t of [0.05, 0.5, 1.5, 3.0]) assert.ok(!cyanIn(chimePainted(t, view, 0, 0.4, { w: 900, h: 600, ax: 450, ay: 300 })), `a chime ${view} @${t}: cyan`);
  }
  const r0 = danceRing(F.snap[0]).r;
  const r1 = danceRing(F.snap[1]).r;
  assert.ok(r0 - r1 > 1.5 * TILE3, `the snap flings them ${((r0 - r1) / TILE3).toFixed(1)} tiles in`);
  // (a mask spins as it flies, and trails its smear)
  assert.ok(Math.abs(flungMask(0, 0.2).spin - flungMask(0, 0).spin) > 2, 'it spins');
  assert.ok(maskSmear(2, 0.3).length > 20, 'its smear');
  // (a chime: the ring grows, and the gap is open)
  const big = chimePainted(1.0, 'front', 0, 0, { w: 900, h: 600, ax: 450, ay: 300 });
  const none = chimePainted(1.0, 'front', 0, null, { w: 900, h: 600, ax: 450, ay: 300 });
  assert.ok(pixels(big) > 400 && pixels(none) > pixels(big), 'the ring, and its gap');
});

test('9. HIS SIZES AND SPEEDS IN TILES: a head taller than the knight; fast; the lunge, the ring, the masks, the chimes all arena-sized', () => {
  // a head taller than the knight
  const crown = (b: typeof PRINCE_BODY): number => {
    const s = solve(b, standing(b) as Posed);
    return s.head[2] + b.headR[2];
  };
  const taller = crown(PRINCE_BODY) - crown(KNIGHT_BODY);
  const head = 2 * KNIGHT_BODY.headR[2];
  assert.ok(taller > 0.6 * head && taller < 1.6 * head, `a head taller: ${taller.toFixed(1)} (the knight's head ${head.toFixed(1)})`);
  // fast: dancing at 4.5 tiles a second (the Princess glides at 4), his walk painted for it; his darts faster
  assert.ok(PC_PACE >= 4.5, `he dances at ${PC_PACE} tiles a second`);
  assert.equal(MOB.walk.ground, PC_PACE * TILE3, 'his dance-step painted for his pace');
  const dartSpeed = DART.carry / (DART.air[1] - DART.air[0]);
  assert.ok(dartSpeed >= 8, `his dart ${dartSpeed.toFixed(1)} tiles a second`);
  assert.ok(WALTZ.pace >= 4, 'his waltz round the arena');
  // the lunge: in its two frames the point flung three tiles and more; at its end the point four tiles from where he stood, his body two and more
  const [s0, s1] = PC_THRUST.strike;
  const tip0 = rapierOf(bonesOf('attack', s0)).tip;
  const tip1 = rapierOf(bonesOf('attack', s1)).tip;
  const flung = Math.hypot(tip1[0] - tip0[0], tip1[1] - tip0[1]) / TILE3;
  assert.ok(flung >= 3, `the point flung ${flung.toFixed(1)} tiles in its two frames`);
  assert.ok(tip1[0] / TILE3 >= 4, `the point ${(tip1[0] / TILE3).toFixed(1)} tiles out`);
  assert.ok(bonesOf('attack', s1).pelvis[0] / TILE3 >= 2.2, 'his body flown two tiles and more');
  // the Dance: nine tiles across as it rises, five as it snaps
  assert.ok((2 * DANCE_FX.r0) / TILE3 >= 9 - 1e-6 && (2 * DANCE_FX.r1) / TILE3 >= 5 - 1e-6, 'the ring nine tiles across, closing to five');
  // Masks: five, each the length of the arena
  assert.equal(MASKS_FX.n, PC_MASKS.n, 'five masks');
  const far = flungMask(2, MASK_FLIGHT).at;
  assert.ok(Math.hypot(far[0], far[1]) / TILE3 >= 12 - 1e-6, `a mask flies ${(Math.hypot(far[0], far[1]) / TILE3).toFixed(1)} tiles`);
  assert.ok(MASKS_FX.speed >= 12, 'fast');
  // Midnight: twelve chimes, each ring across the whole arena, faster each phase
  assert.equal(CHIME.rings, 12);
  assert.ok(CHIME.reach >= 17, 'across the arena');
  assert.ok(chimeRing(1, 0).r > 4 * TILE3, 'it rolls out');
  for (let p = 1; p < 3; p++) {
    assert.ok(CHIME.every[p] < CHIME.every[p - 1], 'the clock strikes faster each phase');
    assert.ok(CHIME.speed[p] > CHIME.speed[p - 1], 'and its rings roll faster');
  }
});
