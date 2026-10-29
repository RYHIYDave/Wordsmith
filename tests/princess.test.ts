// FLOOR 16'S BOSS, THE PRINCESS (src/art/princess.ts, her look; src/art/princess_moves.ts, her moves; src/art/princess_ride.ts
// and src/art/spectral_steed.ts, her ultimate; src/art/princess_fx.ts, what her casting leaves on the floor). A MOCK-UP:
// NOT IN THE GAME, behind PRINCESS_ON, off. His brief, 28 Oct (art/princess.ts has it in his words), his yes to her look
// and her steed (“Yes, that's her (Recommended)”, “Yes, that's the steed (Recommended)”), his “And remember this is a
// boss so follow the rules and run the checks”, and his rulebook's Movement 9 for every new enemy (“Start from now on”):
//   1. the switch is off, and nothing of the game imports her;
//   2. EVERY MOVE OF HERS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and from behind,
//      and every handover (her steed's three moves into each other);
//   3. HIS LIGHTNING STRIKES: each of her five blows winds up, holds, strikes in two frames and lands on the second; the
//      strike's frames, and the one after it, carry its smear; no other frame does;
//   4. every frame paints both ways round: nothing cyan, the pink edge while she lives and none as she dies, every pixel
//      whole or empty but the edge;
//   5. NOTHING CUT OFF;
//   6. NOTHING OF HER IN THE FLOOR (her steed rises out of it and sinks back into it, and is swallowed by it);
//   7. HIS BRIEF: no nettle shirt anywhere; she glides (her feet never down); the dull pink in her eyes while she lives,
//      gone once she has sunk; her nettles withered by the end, every leaf brown or fallen; not a corpse: she ends on her
//      knees, upright enough that her head is well off the floor;
//   8. HER STEED forms under her and fades; she sits its back through every leap; all four hooves off the floor while the
//      game carries her, all four down where they started once it lands and settles;
//   9. WHAT HER CASTING LEAVES: the snare's cage bursts out of the floor in two frames, the Vow's ring in two; neither,
//      nor the Eleven's feathers, nor her diving swans, has anything cyan.
//   run: tsx --test tests/princess.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { PRINCESS_ON, PR_CANVAS } from '../src/art/princess';
import { PRINCESS, PR_DIES, PR_SHAPE, PR_STRIKES, smearedAt } from '../src/art/princess_moves';
import { RIDE_LEAP, steedPoseAt } from '../src/art/princess_ride';
import { SNARE_FX, VOW_FX, featherLine, snarePainted, vowPainted } from '../src/art/princess_fx';
import { seatOf, solesOf } from '../src/art/spectral_steed';
import { swanPainted, swanLong } from '../src/art/garden_swans';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
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
const MOB: Mob = PRINCESS;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');
const RIDES = new Set(['rideForm', 'rideLeap', 'rideEnd']);

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

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const stageOf = (): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move of hers (the game's frames of each: framesOf), painted on her whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;
/** The smear's own colours (art/princess.ts SMEAR). */
const SMEAR = new Set(['#8a7aa4', '#cdbfdc', '#f4e8f0'].map((c) => rgba(c).slice(0, 3).join(',')));
const smearIn = (p: Painted): number => {
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && SMEAR.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};

test('1. the switch is off, and nothing of the game imports her', () => {
  assert.equal(PRINCESS_ON.on, false, 'PRINCESS_ON is off');
  const users: string[] = [];
  const hers = /^art\/(princess(_moves|_ride|_fx)?|spectral_steed)$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || hers.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (hers.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import her');
});

test('2. EVERY MOVE OF HERS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,snare,eleven,vow,rideForm,rideLeap,rideEnd');
  const found = checkBoss(MOB, PR_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(PR_STRIKES).sort().join(','), 'attack,eleven,rideLeap,snare,vow');
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(PR_STRIKES)) {
    assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: its strike is two frames`);
    assert.equal(moveOf(move).motion.hit, s1, `${move}: it lands on the strike's last frame`);
    for (const { move: m, view, t, p } of PAINTED) {
      if (m !== move) continue;
      const n = smearIn(p);
      const want = smearedAt(move, t);
      if (want && n < 12) faults.push(`${said(m, view, t)}: its smear only ${n} pixels`);
      if (!want && n > 0) faults.push(`${said(m, view, t)}: smeared out of its strike (${n})`);
    }
  }
  // (and no move that does not strike is smeared at all)
  for (const { move, view, t, p } of PAINTED) if (!PR_STRIKES[move] && smearIn(p) > 0) faults.push(`${said(move, view, t)}: smeared`);
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while she lives and none as she dies, every pixel whole or empty but the edge', () => {
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
    if (n < 600 || cyanIn(p) || odd || (alive ? rim < 60 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, she (and her steed, and her vine at its longest) is inside her picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${PR_CANVAS.w}x${PR_CANVAS.h}`);
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
    if (room < ROOM) faults.push(`${said(move, view, t)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest she comes to the edge: ${least}`);
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

test('6. NOTHING OF HER IN THE FLOOR: all she wears and holds (her steed rises out of it and sinks back into it, swallowed: not hers)', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      const bits: Bit[] = MOB.bits(st, at(move, t)).filter((b) => !b.part.startsWith('steed'));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
  // (and the steed's hooves never into the floor once it stands on it)
  for (const move of ['rideForm', 'rideLeap', 'rideEnd'] as const) {
    for (const t of framesOf(MOB, move)) {
      const P = steedPoseAt(move, t);
      if (P.z < -0.5) continue;
      for (const s of solesOf(P)) assert.ok(s[2] > -0.6, `${move} @${t.toFixed(2)}: a hoof ${(-s[2]).toFixed(1)} into the floor`);
    }
  }
});

test('7. HIS BRIEF: no nettle shirt; she glides; pink eyes while she lives; withered by the end; not a corpse, on her knees', () => {
  const st = stageOf();
  // no nettle shirt anywhere ("The shirt is dumb")
  for (const move of [...LIVING, 'dying']) for (const b of MOB.bits(st, at(move, 0.5))) assert.ok(!/shirt/i.test(b.part + b.piece), `${move}: a shirt (${b.part} ${b.piece})`);
  // she glides: never a foot down on the floor, standing, gliding or casting
  for (const move of ['stand', 'walk', 'attack', 'reel', 'snare', 'eleven', 'vow']) {
    for (const t of framesOf(MOB, move)) {
      const s = skeletonAt(MOB, move, t);
      assert.ok(Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 0.8, `${move} @${t.toFixed(2)}: a foot down`);
    }
  }
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) for (const t of framesOf(MOB, move)) assert.ok(pinkEyes(MOB.bits(st, at(move, t))), `${move} @${t.toFixed(2)}: her eyes not pink`);
  assert.ok(!pinkEyes(MOB.bits(st, dyingMoment(MOB, PR_DIES.long))), 'the pink still in her eyes at the end');
  // withered: no green leaf left on her at the end ("Steed fades, vines wither")
  const green = new Set(['#30552b', '#4a773a', '#72984f', '#1f361e']);
  const endBits = MOB.bits(st, dyingMoment(MOB, PR_DIES.long));
  let leaves = 0;
  for (const b of endBits) {
    if (b.shape.k !== 'ball' || !/leaf/.test(b.piece) || typeof b.shape.skin !== 'function') continue;
    leaves++;
    for (const u of [[0, 0, 0], [0.4, 0.1, 0], [-0.3, 0, 0]] as V3[]) {
      const c = b.shape.skin(u, 3, 0, 0);
      assert.ok(!c || !green.has(c), `a green leaf left at the end (${b.part})`);
    }
  }
  const startLeaves = MOB.bits(st, dyingMoment(MOB, 0)).filter((b) => /leaf/.test(b.piece)).length;
  assert.ok(leaves < startLeaves * 0.5, `her leaves fallen: ${leaves} of ${startLeaves} left`);
  // not a corpse: on her knees at the end, her head well up off the floor, not lying
  const s = skeletonAt(MOB, 'dying', PR_DIES.long);
  assert.ok(s.pelvis[2] < 16, `on her knees: her hips ${s.pelvis[2].toFixed(1)} up`);
  assert.ok(s.head[2] > 32, `upright: her head ${s.head[2].toFixed(1)} up`);
  assert.ok(Math.min(s.kneeL[2], s.kneeR[2]) < 4, 'her knees on the floor');
});

test('8. HER STEED forms under her and fades; she sits its back through every leap; off the floor while she is carried, down square once it lands', () => {
  assert.ok(steedPoseAt('rideForm', 0).formed < 0.05 && steedPoseAt('rideForm', 1.4).formed > 0.99, 'it forms');
  assert.ok(steedPoseAt('rideEnd', 0).formed > 0.99 && steedPoseAt('rideEnd', 1.4).formed < 0.05, 'it fades');
  for (const t of framesOf(MOB, 'rideLeap')) {
    const P = steedPoseAt('rideLeap', t);
    const s = skeletonAt(MOB, 'rideLeap', t);
    const seat = seatOf(P).at;
    const d = Math.hypot(s.pelvis[0] - seat[0], s.pelvis[1] - seat[1], s.pelvis[2] - seat[2]);
    assert.ok(d < 8, `@${t.toFixed(2)}: she is ${d.toFixed(1)} off its back`);
    const soles = solesOf(P);
    if (t > RIDE_LEAP.air[0] + 0.02 && t < RIDE_LEAP.air[1] - 0.04) for (const p of soles) assert.ok(p[2] > 0.6, `@${t.toFixed(2)}: a hoof down while she is carried`);
  }
  const s0 = solesOf(steedPoseAt('rideLeap', 0));
  const s1 = solesOf(steedPoseAt('rideLeap', RIDE_LEAP.long));
  for (let i = 0; i < 4; i++) assert.ok(Math.hypot(s0[i][0] - s1[i][0], s0[i][1] - s1[i][1], s0[i][2] - s1[i][2]) < 0.3, `hoof ${i} not back where it started`);
  // (the hit: its forehooves down on the strike's last frame)
  const hit = solesOf(steedPoseAt('rideLeap', RIDE_LEAP.hit));
  assert.ok(hit[0][2] < 0.6 && hit[1][2] < 0.6, 'its forehooves down as the blow lands');
});

test('9. WHAT HER CASTING LEAVES: the snare bursts out in two frames, the Vow in two; nothing cyan in them, the feathers, or her diving swans', () => {
  const pixels = (p: Painted): number => {
    let n = 0;
    for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
    return n;
  };
  const [b0, b1] = SNARE_FX.burst;
  assert.equal(Math.round((b1 - b0) * 30), 2, 'the snare bursts in two frames');
  for (const view of VIEWS) {
    const before = pixels(snarePainted(b0, view));
    const out = pixels(snarePainted(b1, view));
    assert.ok(out > 4 * Math.max(40, before), `${view}: the cage out at once (${before} then ${out})`);
    for (let t = 0; t <= SNARE_FX.long; t += 1 / 30) assert.ok(!cyanIn(snarePainted(t, view)), `the snare ${view} @${t.toFixed(2)}: cyan`);
    assert.ok(pixels(snarePainted(SNARE_FX.long, view)) < out * 0.2, `${view}: the cage gone back into the floor`);
    // the Vow: out in two frames, held, gone
    assert.equal(Math.round((VOW_FX.burst[1] - VOW_FX.burst[0]) * 30), 2);
    const v0 = pixels(vowPainted(0, view));
    const v1 = pixels(vowPainted(VOW_FX.burst[1], view));
    assert.ok(v1 > 4 * Math.max(20, v0), `${view}: the ring out at once (${v0} then ${v1})`);
    for (let t = 0; t <= VOW_FX.hold + VOW_FX.fade; t += 0.1) assert.ok(!cyanIn(vowPainted(t, view)), `the Vow ${view} @${t.toFixed(2)}: cyan`);
    assert.equal(pixels(vowPainted(VOW_FX.hold + VOW_FX.fade + 0.05, view)), 0, `${view}: the ring gone`);
    for (let t = 0; t < swanLong('dive'); t += 1 / 30) assert.ok(!cyanIn(swanPainted('dive', t, view)), `a diving swan ${view} @${t.toFixed(2)}: cyan`);
  }
  for (const [, c] of featherLine([0, -40], [0, 40], 1, 1, 0.5)) {
    const [r, g, b] = rgba(c);
    const grey = r === g && g === b;
    assert.ok((grey || !FRIEND.has(`${r},${g},${b}`)) && !cyanGlow(r, g, b), `a feather in cyan, ${c}`);
  }
});
