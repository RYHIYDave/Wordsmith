// FLOOR 19'S BOSS, THE KING (src/art/king.ts, his look and the Hush's; src/art/king_moves.ts, his moves, the Hush's own
// figure, and how the checks see them; src/art/king_fx.ts, what his blows leave across the hall, and the clockwork
// songbird). A MOCK-UP: NOT IN THE GAME, behind KING_ON, off. His pick for how he moves, “Slow and heavy, huge reach
// (Recommended)”; his rulebook's Movement 9 for every new enemy (“Start from now on, but every enemy is going to need that
// change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”); and his rule 7, “I need
// all bosses ran through all checks from now on.  These boss fights are important”:
//   1. the switch is off, and nothing of the game imports him;
//   2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and from behind,
//      and every handover; with the Hush on his back, and without it (his last phase); and the Hush on its own;
//   3. HIS LIGHTNING STRIKES: each of his four blows winds up, holds, strikes in two frames and lands on the second; the
//      strike's frames, and the one after it, carry its smear; no other frame does;
//   4. every frame paints both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel
//      whole or empty but the edge; nothing red (never gory);
//   5. NOTHING CUT OFF;
//   6. NOTHING OF HIM IN THE FLOOR (his sword's point rests on the stones, on them and not in them);
//   7. HIS BRIEF: the Hush on his back with the dull pink eyes, his own eyes not pink; his crown on him; twice the knight's
//      height with the Hush; his sword taller than the knight, dragging; his death: down on the stones, his sword fallen,
//      the Hush unwound into nothing;
//   8. THE HUSH CLIMBS OFF: it ends where its own figure stands at his side; after it, nothing rides him; it hovers;
//   9. WHAT HIS BLOWS LEAVE: the sweep's wave and the Crown's ring out across the hall, the Decree's lines across its whole
//      width with gaps to slip through, the faces streaming the length of it; nothing cyan in any of them; the songbird
//      broken, winding, singing, and never glowing;
//  10. HIS SIZES AND REACH, in tiles, and his pace.
//   run: tsx --test tests/king.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { KING_CANVAS, KING_ON, SWORD_LONG, crownOnHead, hushRiding, hushStanding, swordOf } from '../src/art/king';
import { HS_FOG, HS_GRAB, HS_SHAPE, HS_STRIKES, HS_STRUCK, HUSH, HUSH_BESIDE, KG_ALONE_SHAPE, KG_CHARGE, KG_CLIMB, KG_DIES, KG_PACE, KG_RETIRED, KG_SHAPE, KG_SHIELD_SHAPE, KG_STRIKES, KG_WEIGHT, KING, KING_ALONE, KING_SHIELDED, TIP_Z, chargeCarried, grabBare, grabReach, hsSmearedAt, smearedAt } from '../src/art/king_moves';
import { BIRD, CHARGE_FX, CROWN_FX, chargeShards, chargeSparkAt, chargeSparks, DECREE_FX, DECREE_GAPS, FOG_CANVAS, FX_CANVAS, KG_REACH, SWEEP_FX, WEIGHT_CANVAS, WEIGHT_FX, birdPainted, breathPainted, crownPainted, curtainFaces, curtainsPainted, decreeKnights, decreePainted, fogPatchPainted, grabPainted, shieldPainted, sparksPainted, sweepPainted, weightAt, weightHead, weightPainted } from '../src/art/king_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { BLOOD, ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import { solve } from '../src/art/skeleton';
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
  return h >= 160 && h <= 205;
}
/** Anything cyan in a picture, or any light it gives off that is. */
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
const RED = new Set(BLOOD.map((c) => rgba(c).slice(0, 3).join(',')));

const moveOf = (mob: Mob, move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : move === 'dying' ? mob.dying : (mob.more ?? {})[move]);
const at = (mob: Mob, move: string, t: number): Moment => (move === 'dying' ? dyingMoment(mob, t) : momentOf(mob, moveOf(mob, move), t));
const stageOf = (mob: Mob, view: 'front' | 'back' = 'front'): Stage => {
  const can = canvasOf(mob);
  return stage(paintViewOf(mob, view), can.ax, can.ay, can);
};
const paint = (mob: Mob, move: string, t: number, view: 'front' | 'back'): Painted => (move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view));

/** Every frame of every move of his (the game's frames of each: framesOf), both ways round; of him alone (his last phase), every third frame; of the Hush on its own, its stand and its end. */
const PAINTED: { mob: Mob; move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
/** The Hush's moves of its own that are reviewed (its walk and its reel are its stand). */
const HUSH_MOVES = ['stand', 'attack', 'fog', 'wrap', 'struckOff', 'dying'];
for (const view of VIEWS) {
  for (const move of movesOf(KING)) for (const t of framesOf(KING, move)) PAINTED.push({ mob: KING, move, view, t, p: paint(KING, move, t, view) });
  for (const mob of [KING_ALONE, KING_SHIELDED]) for (const move of movesOf(mob)) framesOf(mob, move).forEach((t, i) => (i % 3 === 0 || smearedAt(move, t)) && PAINTED.push({ mob, move, view, t, p: paint(mob, move, t, view) }));
  for (const move of HUSH_MOVES) for (const t of framesOf(HUSH, move)) PAINTED.push({ mob: HUSH, move, view, t, p: paint(HUSH, move, t, view) });
}
const said = (mob: Mob, move: string, view: string, t: number): string => `${mob.id} ${move} ${view} @${t.toFixed(3)}`;
/** The smear's own colours (art/king.ts SMEAR). */
const SMEAR = new Set(['#6e6a8a', '#aeaac4', '#eeecf4'].map((c) => rgba(c).slice(0, 3).join(',')));
const smearIn = (p: Painted): number => {
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && SMEAR.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};

/** The game's files that import him (his figure now; his rules and effects as they are built). */
// (and floor 20's shadow of the King, brought in by the main chat on floor 20 behind HIGH_CITY (off): its rules and effects take his
// charge and the Crown's Weight from him, the art chat's mockup/royal-shadows)
const KING_USERS = 'art/act1_figs/gking.ts game/act1_rules/gking.ts game/act1_rules/rshadow.ts render/act1_fx/gking.ts render/act1_fx/rshadow.ts';

test('1. the switch is off, and of the game only floor 19\'s own files import him', () => {
  assert.equal(KING_ON.on, false, 'KING_ON is off');
  const users: string[] = [];
  const his = /^art\/king(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (floor 20's shadows of the four royals, art/royal_shadows.ts and art/royal_shadows_fx.ts, a mock-up of their own made from the royals' moves, which nothing of the game imports either: tests/royal_shadows.test.ts)
    if (!f.endsWith('.ts') || f.startsWith('dev') || his.test(f.replace(/\.ts$/, '')) || /^art\/royal_shadows/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (his.test(parts.join('/'))) users.push(f);
    }
  }
  // (Brought into the game by the main chat, 31 Oct 2026, on floor 19 behind HIGH_CITY (off): his figure, rules and effects files
  // import him, and nothing else of the game)
  assert.equal([...new Set(users)].sort().join(' '), KING_USERS, 'game files that import him');
});

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover; with the Hush on his back, without it, and the Hush on its own', () => {
  assert.equal(movesOf(KING).join(','), 'stand,walk,attack,reel,dying,decree,weight,curtains,climbOff');
  assert.equal(movesOf(KING_ALONE).join(','), 'stand,walk,attack,reel,dying,decree,weight,curtains');
  assert.equal(movesOf(KING_SHIELDED).join(','), 'stand,walk,attack,reel,dying,decree,weight,curtains');
  assert.equal(movesOf(HUSH).join(','), 'stand,walk,attack,reel,dying,fog,wrap,struckOff');
  for (const [mob, shape, moves] of [[KING, KG_SHAPE, undefined], [KING_ALONE, KG_ALONE_SHAPE, undefined], [KING_SHIELDED, KG_SHIELD_SHAPE, undefined], [HUSH, HS_SHAPE, HUSH_MOVES]] as const) {
    const found = checkBoss(mob, shape, moves);
    assert.equal(found.length, 0, `${mob.id}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
  // (every frame of every move a figure, nothing lost to a bad number)
  for (const mob of [KING, KING_ALONE, KING_SHIELDED, HUSH]) {
    for (const move of movesOf(mob)) {
      for (const t of framesOf(mob, move)) {
        const sk = skeletonAt(mob, move, t);
        assert.ok([sk.head, sk.pelvis, sk.handL, sk.handR, sk.toeL, sk.toeR].every((p) => p.every(Number.isFinite)), `${mob.id} ${move} @${t.toFixed(3)}: not a number`);
      }
    }
  }
  // (his old sweep and his crown's leap are kept in the code, out of his moves)
  assert.ok(KG_RETIRED.sweep().keys.length > 30 && KG_RETIRED.leap().keys.length > 30);
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(KG_STRIKES).sort().join(','), 'attack,curtains,decree,weight');
  assert.equal(Object.keys(HS_STRIKES).sort().join(','), 'attack,fog');
  const faults: string[] = [];
  for (const [mob, strikes] of [[KING, KG_STRIKES], [HUSH, HS_STRIKES]] as const) {
    for (const [move, [s0, s1]] of Object.entries(strikes)) {
      assert.equal(Math.round((s1 - s0) * 30), 2, `${mob.id} ${move}: its strike is two frames`);
      assert.equal(moveOf(mob, move).motion.hit, s1, `${mob.id} ${move}: it lands on the strike's last frame`);
    }
  }
  for (const { mob, move, view, t, p } of PAINTED) {
    const n = smearIn(p);
    const want = mob === HUSH ? hsSmearedAt(move, t) : smearedAt(move, t);
    if (want && n < 20) faults.push(`${said(mob, move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(mob, move, view, t)}: smeared out of its strike (${n})`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge; nothing red', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of PAINTED) {
    const { d } = p.px;
    let n = 0;
    let rim = 0;
    let odd = 0;
    let red = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      n++;
      if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
      if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
      if (RED.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) red++;
    }
    const alive = move !== 'dying';
    // (the Hush unwinding to nothing is nothing at its end)
    const least = mob === HUSH && move === 'dying' ? 0 : 600;
    if (n < least || cyanIn(p) || odd || red || (alive ? rim < 60 : rim !== 0)) faults.push(`${said(mob, move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty, ${red} red${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, he (his sword at its furthest, the Hush climbing off him) is inside his picture with room to spare', () => {
  const ROOM = 4;
  const faults: string[] = [];
  let least = Infinity;
  for (const { mob, move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    const can = canvasOf(mob);
    assert.equal(`${w}x${h}`, `${can.w}x${can.h}`);
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
  else if (sh.k === 'panel') z = sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  return Math.max(0, -z);
}

test('6. NOTHING OF HIM IN THE FLOOR: all he wears and holds; his sword\'s point on the stones, not in them', () => {
  const faults: string[] = [];
  for (const mob of [KING, KING_ALONE, KING_SHIELDED]) {
    const st = stageOf(mob);
    for (const move of movesOf(mob)) {
      for (const t of framesOf(mob, move)) {
        for (const b of mob.bits(st, at(mob, move, t))) {
          if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
          const by = under(b.shape);
          if (by > 0.6) faults.push(`${mob.id} ${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
        }
        if (move !== 'dying' || t < KG_DIES.drop) {
          const tip = swordOf(skeletonAt(mob, move, t)).tip;
          if (tip[2] < TIP_Z - 0.6) faults.push(`${mob.id} ${move} @${t.toFixed(2)}: his sword's point ${(-tip[2]).toFixed(1)} into the stones`);
        }
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. HIS BRIEF: the Hush rides his back with the dull pink eyes, his own eyes not pink; his crown on him; twice the knight with the Hush; his sword taller than the knight; his death', () => {
  const st = stageOf(KING);
  const pinkEyes = (bits: Bit[], part: string): boolean => bits.some((b) => b.part === part && b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of movesOf(KING).filter((m) => m !== 'dying' && m !== 'climbOff')) {
    for (const t of framesOf(KING, move)) {
      const bits = KING.bits(st, at(KING, move, t));
      assert.ok(pinkEyes(bits, 'hushHead'), `${move} @${t.toFixed(2)}: the Hush on his back, its eyes the dull pink`);
      assert.ok(!pinkEyes(bits, 'head'), `${move} @${t.toFixed(2)}: his own eyes pink`);
      const away = move === 'weight' && t >= KG_WEIGHT.send - 1e-6 && t < KG_WEIGHT.back - 1e-6;
      assert.ok(bits.some((b) => b.part === 'crown') !== away, `${move} @${t.toFixed(2)}: his crown ${away ? 'on his head while it is away' : 'not on him'}`);
      assert.ok(bits.some((b) => b.part === 'hush'), `${move} @${t.toFixed(2)}: the Hush on his back`);
    }
  }
  // (nothing rides him in his last phase)
  for (const move of movesOf(KING_ALONE)) assert.ok(!KING_ALONE.bits(st, at(KING_ALONE, move, 0.5)).some((b) => /^hush/.test(b.part)), `alone, ${move}: the Hush still on him`);
  // twice the knight's height (58) with the Hush on his back; a hundred standing straight without it
  const s0 = skeletonAt(KING, 'stand', 0);
  const H = hushRiding(s0, 0, [0, 0, 0]);
  assert.ok(H.head[2] + 8 >= 2 * 58 - 4, `the top of the Hush's head ${(H.head[2] + 8).toFixed(0)} up: twice the knight`);
  assert.ok(KING.build.tall >= 100, 'a hundred tall standing straight');
  assert.ok(SWORD_LONG > 58, `his sword ${SWORD_LONG.toFixed(0)} long: taller than the knight`);
  // dragging: its point on the stones behind him as he stands and walks
  for (const move of ['stand', 'walk']) {
    for (const t of framesOf(KING, move)) {
      const s = skeletonAt(KING, move, t);
      const tip = swordOf(s).tip;
      assert.ok(Math.abs(tip[2] - TIP_Z) < 0.4, `${move} @${t.toFixed(2)}: its point ${tip[2].toFixed(1)} up, not on the stones`);
      assert.ok(tip[0] < s.pelvis[0] - 20, `${move} @${t.toFixed(2)}: its point not behind him`);
    }
  }
  // his death: down on the stones, his sword fallen from his hand, the Hush unwound into nothing
  const end = skeletonAt(KING, 'dying', KG_DIES.long);
  // (he is huge: lying on the stones, his hips and his head are still a hand or two up; on his knees his head would be near ninety)
  assert.ok(end.pelvis[2] < 26 && end.head[2] < 34, `lying down: his hips ${end.pelvis[2].toFixed(0)}, his head ${end.head[2].toFixed(0)} up`);
  const endBits = KING.bits(st, dyingMoment(KING, KG_DIES.long));
  assert.ok(!endBits.some((b) => /^hush/.test(b.part)), 'the Hush gone at the end');
  const blade = endBits.find((b) => b.part === 'blade');
  assert.ok(blade && blade.shape.k === 'panel' && blade.shape.c[2] < 5, 'his sword lying on the stones');
});

test('8. THE HUSH CLIMBS OFF: it ends where its own figure stands at his side; it hovers there; and nothing rides him after', () => {
  const st = stageOf(KING);
  const end = KING.bits(st, at(KING, 'climbOff', KG_CLIMB.down[1] + 0.05)).filter((b) => b.part === 'hushHead' && b.piece === 'mask');
  const own = solve(HUSH.build, { ...HUSH.stand.rest, ...(HUSH.stand.motion.keys[0].pose as object) } as Posed);
  const want = hushStanding(own, [0, 0, 0]);
  assert.ok(end.length === 1, 'its mask, as it stands');
  const c = (end[0].shape as { c: V3 }).c;
  // (its mask hangs a little before its head and below it: art/king.ts, hushParts)
  const [wf, , wu] = want.face;
  const wc: V3 = [want.head[0] + HUSH_BESIDE[0] + wf[0] * 0.6 - wu[0] * 0.8, want.head[1] + HUSH_BESIDE[1] + wf[1] * 0.6 - wu[1] * 0.8, want.head[2] + wf[2] * 0.6 - wu[2] * 0.8];
  assert.ok(Math.hypot(c[0] - wc[0], c[1] - wc[1], c[2] - wc[2]) < 1, `its head where its own figure's is: ${c.map((v) => v.toFixed(1))} for ${wc.map((v) => v.toFixed(1))}`);
  assert.ok(!KING.bits(st, at(KING, 'climbOff', KG_CLIMB.long)).some((b) => /^hush/.test(b.part)), 'gone from his picture once it stands as its own');
  for (const t of framesOf(HUSH, 'stand')) {
    const s = skeletonAt(HUSH, 'stand', t);
    assert.ok(Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 1, `the Hush @${t.toFixed(2)}: a foot down`);
  }
});

test('9. WHAT HIS BLOWS LEAVE: across the hall, the Decree\'s lines with gaps, the faces the length of it; nothing cyan; the songbird broken, winding, singing, never glowing', () => {
  const extent = (p: Painted): number => {
    let n = 0;
    for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
    return n;
  };
  for (const view of VIEWS) {
    for (let t = 0; t <= SWEEP_FX.long; t += 1 / 30) assert.ok(!cyanIn(sweepPainted(t, view)), `the sweep's wave ${view} @${t.toFixed(2)}: cyan`);
    for (let t = 0; t <= CROWN_FX.long; t += 1 / 15) assert.ok(!cyanIn(crownPainted(t, view)), `the Crown's ring ${view} @${t.toFixed(2)}: cyan`);
    for (let t = 0; t <= 9; t += 0.5) assert.ok(!cyanIn(decreePainted(t, view)), `the Decree ${view} @${t.toFixed(2)}: cyan`);
    for (let t = -0.6; t <= 2.5; t += 0.2) assert.ok(!cyanIn(curtainsPainted(t, view)), `the Curtains ${view} @${t.toFixed(2)}: cyan`);
    for (const [s, t] of [['broken', 0], ['winding', 0.6], ['winding', 1.5], ['singing', 0.3]] as const) {
      const p = birdPainted(s, t, view);
      assert.ok(!cyanIn(p) && p.lights.length === 0 && extent(p) > 60, `the songbird ${s} ${view}: ${extent(p)} pixels, ${p.lights.length} lights`);
    }
    assert.ok(extent(sweepPainted(0.25, view)) > 1500 && extent(crownPainted(0.4, view)) > 1500, 'the wave and the ring drawn big');
    assert.equal(extent(sweepPainted(SWEEP_FX.long + 0.05, view)), 0, 'the wave gone');
  }
  // the Decree: its lines across the hall's whole width, each with its gaps (two knights wide) to slip through
  const ks = decreeKnights(5);
  const lines = new Map<number, number[]>();
  for (const k of ks) (lines.get(Math.round(k.x * 10)) ?? lines.set(Math.round(k.x * 10), []).get(Math.round(k.x * 10))!).push(k.y);
  assert.ok(lines.size === DECREE_FX.lines, `${lines.size} lines marching`);
  for (const ys of lines.values()) {
    ys.sort((a, b) => a - b);
    assert.ok(ys[ys.length - 1] - ys[0] >= 2 * KG_REACH.decreeHalf - 1.3, `a line ${(ys[ys.length - 1] - ys[0]).toFixed(1)} tiles across: the hall's width`);
    let gaps = 0;
    for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] >= 2.4) gaps++;
    assert.ok(gaps >= 2, `a line with ${gaps} gaps to slip through`);
  }
  assert.ok(DECREE_GAPS.every((g) => g.length >= 2));
  // the faces stream the length of the hall
  let far = 0;
  for (let t = 0; t < 2.5; t += 0.05) for (const f of curtainFaces(t)) far = Math.max(far, f.p[0] / TILE3);
  assert.ok(far >= 10, `the faces fly ${far.toFixed(1)} tiles out before him`);
  // the songbird sings only once it is wound
  const notes = (p: Painted): number => {
    let n = 0;
    for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] && p.px.d[i] === 0xf4 && p.px.d[i + 1] === 0xf4 && p.px.d[i + 2] === 0xfa) n++;
    return n;
  };
  assert.ok(notes(birdPainted('singing', BIRD.song * 0.3)) > notes(birdPainted('broken', 0)), 'its song');
});

test('10. HIS SIZES AND REACH: his pace slow, his blows across the hall', () => {
  assert.ok(KG_REACH.crown >= 9.5, 'the old ring (kept) out across most of the hall');
  assert.ok(KG_PACE <= 1.2, `his pace ${KG_PACE} tiles a second: slow and heavy`);
  assert.equal(KING.walk.ground, KG_PACE * TILE3, 'his walk painted for his pace');
  void KING_CANVAS;
  void SWEEP_FX;
});

/** How many pixels of a picture are drawn. */
const drawn = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};
/** How many pixels of a picture are this colour. */
const ofColour = (p: Painted, c: string): number => {
  const [r, g, b] = rgba(c);
  let n = 0;
  for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] && p.px.d[i] === r && p.px.d[i + 1] === g && p.px.d[i + 2] === b) n++;
  return n;
};
/** How near a picture's drawn pixels come to its edge. */
const room = (p: Painted): number => {
  const { w, h, d } = p.px;
  let least = Infinity;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) least = Math.min(least, x, y, w - 1 - x, h - 1 - y);
  return least;
};

test('11. THE CHARGE: the warning held, the strike two frames, carried nine tiles at twelve a second, his feet gripping as he runs; the line of sparks the length of it; after he stops, held, its sparks shoot off it and pop in shrapnel', () => {
  const C = KG_CHARGE;
  assert.ok(C.warn[1] - C.warn[0] >= 0.39, 'its warning held at least 0.4 s');
  assert.equal(Math.round((C.strike[1] - C.strike[0]) * 30), 2);
  assert.ok(Math.abs(chargeCarried(C.run[1]) / TILE3 - C.most) < 1e-6 && C.most >= 9 && C.pace >= 12, `carried ${(chargeCarried(C.run[1]) / TILE3).toFixed(2)} tiles at ${C.pace}`);
  assert.ok(Math.abs(C.burst - C.run[1] - C.burstAfter) < 1e-6, 'the line bursts burstAfter after he stops');
  // (his feet: each that is down stays where it is on the stones as the game carries him: KG_SHAPE.carried, held to SLIDE in check 2)
  assert.equal(KG_SHAPE.carried?.('attack', C.run[1]), chargeCarried(C.run[1]));
  // (running: off the stones between his steps, as a runner is, and leaning hard into it)
  let flying = 0;
  for (const t of framesOf(KING, 'attack')) {
    if (t <= C.hit || t >= C.run[1]) continue;
    const s = skeletonAt(KING, 'attack', t);
    if (Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 0.6) flying++;
    assert.ok(s.ribs[0] - s.pelvis[0] > 6, `@${t.toFixed(2)}: leaning into his run`);
  }
  assert.ok(flying >= 4, `${flying} frames off the stones between his steps`);
  // (the sword dragged on the stones behind him as he runs)
  for (const t of [0.9, 1.1, 1.3, 1.5]) {
    const tip = swordOf(skeletonAt(KING, 'attack', t)).tip;
    assert.ok(Math.abs(tip[2] - TIP_Z) < 0.5 && tip[0] < -40, `@${t}: his sword's point ${tip.map((v) => v.toFixed(0))}: not dragged behind him`);
  }
  // THE LINE: cut the length of his run, glowing; held; its sparks shooting off and popping; gone
  const ran = C.most / C.pace;
  const tb = ran + C.burstAfter;
  const F = CHARGE_FX;
  // (its numbers: the hit reaches the sparks' farthest out and the shrapnel round them; it lands from the first pop to the last shrapnel gone, all over before it is gone)
  assert.ok(Math.abs(F.reach - (F.out + F.r)) < 1e-9 && F.reach >= 2.5, `its reach ${F.reach} tiles round the line`);
  assert.ok(F.hold >= 0.3 && F.fly[0] >= 0.25 && F.fly[1] + F.shards < F.long, 'held, then flying, popping, gone');
  const sparks = chargeSparks();
  assert.equal(sparks.length, Math.round(C.most / F.every), 'one spark for every `every` tiles of the line');
  const x0 = -C.tail * TILE3;
  const x1 = (C.most - C.tail) * TILE3;
  let high = 0;
  let out = 0;
  const sides = new Set<number>();
  for (const k of sparks) {
    assert.ok(k.x >= x0 && k.x <= x1 && k.at >= F.fly[0] && k.at <= F.fly[1], 'each on the line, popping in its time');
    assert.ok(chargeSparkAt(k, 0)[2] < 1 && Math.abs(chargeSparkAt(k, 0)[1] - k.y) < 1e-9, 'it leaves from the line');
    const p = chargeSparkAt(k, k.at);
    assert.ok(Math.hypot(p[0] - k.pop[0], p[1] - k.pop[1], p[2] - k.pop[2]) < 1e-6, 'it pops where it says');
    // (up and out, never past its numbers; quick: in its first two frames it is well on its way up)
    assert.ok(k.pop[2] <= F.high * TILE3 + 1e-6 && Math.abs(k.pop[1] - k.y) <= F.out * TILE3 + 1e-6, 'no higher, no farther out');
    assert.ok(chargeSparkAt(k, 2 / 30)[2] >= 0.4 * k.pop[2], 'shot off: up 40% of its height in two frames');
    for (let s = 0; s < k.at; s += 0.01) assert.ok(chargeSparkAt(k, s + 0.01)[2] >= chargeSparkAt(k, s)[2] - 1e-9, 'rising until it pops');
    high = Math.max(high, k.pop[2]);
    out = Math.max(out, Math.abs(k.pop[1] - k.y));
    sides.add(Math.sign(k.pop[1] - k.y));
  }
  assert.ok(high >= 0.9 * F.high * TILE3 && out >= 0.9 * F.out * TILE3 && sides.size === 2, `up ${(high / TILE3).toFixed(2)} tiles, out ${(out / TILE3).toFixed(2)} tiles, to both sides`);
  // (its shrapnel: every way round each pop, out to `r`; all of it within `reach` of the line, and reaching it; on the stones, never in them)
  let most = 0;
  let wide = 0;
  for (let s = F.fly[0]; s < F.fly[1] + F.shards; s += 1 / 60) {
    for (const q of chargeShards(s)) {
      const r = Math.hypot(q.p[0] - q.from[0], q.p[1] - q.from[1]);
      const dx = Math.max(x0 - q.p[0], 0, q.p[0] - x1);
      const far = Math.hypot(dx, Math.abs(q.p[1]) - 4);
      assert.ok(r <= F.r * TILE3 + 1e-6 && far <= F.reach * TILE3 && q.p[2] >= 0.5, `shrapnel ${(r / TILE3).toFixed(2)} tiles from its pop, ${(far / TILE3).toFixed(2)} from the line`);
      most = Math.max(most, r);
      wide = Math.max(wide, far);
    }
  }
  assert.ok(most >= 0.9 * F.r * TILE3 && wide >= 0.9 * F.reach * TILE3, `shrapnel out ${(most / TILE3).toFixed(2)} tiles round its pops, ${(wide / TILE3).toFixed(2)} round the line`);
  assert.equal(chargeShards(F.fly[1] + F.shards).length, 0, 'the shrapnel gone');
  for (const view of VIEWS) {
    let far = 0;
    const mid = sparksPainted(ran, view);
    const st = stage(view === 'back' ? 'rear' : view, FX_CANVAS.ax, FX_CANVAS.ay, FX_CANVAS);
    const near = (p: Painted, v: V3, by: number): boolean => {
      const [X, Y] = st.at(v);
      for (let dy = -by; dy <= by; dy++) for (let dx = -by; dx <= by; dx++) if (p.px.d[((Math.round(Y) + dy) * p.px.w + Math.round(X) + dx) * 4 + 3]) return true;
      return false;
    };
    for (let x = x0; x < x1; x += TILE3 * 0.5) if (near(mid, [x, 0, 0], 4)) far = x;
    assert.ok(far / TILE3 >= C.most - C.tail - 1, `${view}: the line cut ${(far / TILE3 + C.tail).toFixed(1)} tiles`);
    // (the held beat: brighter as its moment comes)
    const hot = (p: Painted): number => ofColour(p, '#fff4c8');
    assert.ok(hot(sparksPainted(tb - 0.05, view)) > 2 * hot(sparksPainted(tb - 0.6, view)), `${view}: brighter, held`);
    // (painted where they are: the sparks in the air; the shrapnel round the pops)
    const fly = sparksPainted(tb + 0.2, view);
    assert.ok(sparks.filter((k) => near(fly, chargeSparkAt(k, 0.2), 1)).length >= 0.9 * sparks.length, `${view}: its sparks in the air`);
    const pops = sparksPainted(tb + 0.48, view);
    const shards = chargeShards(0.48);
    assert.ok(shards.length > 100 && shards.filter((q) => near(pops, q.p, 1)).length >= 0.8 * shards.length, `${view}: its shrapnel`);
    const before = drawn(sparksPainted(tb - 0.05, view));
    assert.ok(drawn(pops) > 1.5 * before && drawn(pops) > 3000, `${view}: its shrapnel ${drawn(pops)} pixels (${before} before)`);
    assert.equal(drawn(sparksPainted(tb + F.long, view)), 0, 'gone after');
    // (every frame of it: nothing cyan, nothing cut off, every pixel crisp; and for a shorter line, stopped by a wall)
    for (const lane of [C.most, 4]) {
      for (let t = 0; t < lane / C.pace + C.burstAfter + F.long; t += t < tb - 0.4 ? 0.1 : 1 / 30) {
        const p = sparksPainted(t, view, lane);
        let soft = 0;
        for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i] && p.px.d[i] !== 255) soft++;
        assert.ok(!cyanIn(p) && (drawn(p) === 0 || room(p) >= 4) && soft === 0, `${view} @${t.toFixed(2)}: cyan, or cut off, or soft`);
      }
    }
  }
});

test('12. THE CROWN\'S WEIGHT: sent up off his head, huge, high over you, following; held; slammed in two frames; home onto his head as it was', () => {
  const W = KG_WEIGHT;
  const F = WEIGHT_FX;
  assert.equal(Math.round((W.strike[1] - W.strike[0]) * 30), 2, 'its drop two frames');
  assert.ok(Math.abs(W.strike[1] - W.send - (F.follow + (F.hold[1] - F.hold[0]) + (F.drop[1] - F.drop[0]))) < 1e-6 && F.follow === 2.4 && W.pace === 3.2, 'its times: following 2.4 s from going up, held, dropped');
  assert.ok(F.hold[1] - F.hold[0] >= 0.5, 'held at least half a second');
  for (const view of VIEWS) {
    // (it leaves his head where it sits on it, and comes back to where it sits on it, as he is then)
    const a = weightAt(0, view);
    const h0 = weightHead(W.send, view);
    assert.ok(Math.hypot(a.c[0] - h0.c[0], a.c[1] - h0.c[1], a.c[2] - h0.c[2]) < 0.01 && Math.abs(a.k - 1) < 1e-6 && a.lerp === 0, `${view}: sent from his head`);
    const b = weightAt(F.long - 1e-4, view);
    const h1 = weightHead(W.back, view);
    assert.ok(Math.hypot(b.c[0] - h1.c[0], b.c[1] - h1.c[1], b.c[2] - h1.c[2]) < 0.5 && Math.abs(b.k - 1) < 0.01 && b.lerp > 0.999, `${view}: home on his head`);
    const st = stage(view === 'back' ? 'rear' : view, 10, 10, { w: 20, h: 20 });
    const on = crownOnHead(st, skeletonAt(KING, 'weight', W.back), 0);
    assert.ok(Math.hypot(on.c[0] - h1.c[0], on.c[1] - h1.c[1], on.c[2] - h1.c[2]) < 0.01, 'as his picture has it');
    // (huge, and high over the knight while it follows and hangs)
    for (const t of [0.6, 1.5, 2.4, 2.8]) {
      const w = weightAt(t, view);
      assert.ok(w.k >= 4.5 && w.c[2] >= 90 && Math.hypot(w.c[0], w.c[1]) < 2, `${view} @${t}: ${w.k.toFixed(1)} times as big, ${w.c[2].toFixed(0)} up, over its floor point`);
    }
    // (down on the stones when it lands, not in them)
    const l = weightAt(F.drop[1] + 0.01, view);
    assert.ok(l.c[2] > 0 && l.c[2] < 20, `${view}: on the stones as it lands (${l.c[2].toFixed(1)})`);
    // (its warning: the enemy's pink ring while it follows; brighter as it hangs; then the slam)
    const follow = weightPainted(1.4, view, 'floor');
    const hold = weightPainted(F.drop[0] - 0.02, view, 'floor');
    assert.ok(ofColour(follow, FLAME[1]) > 40, `${view}: its pink ring as it follows`);
    assert.ok(ofColour(hold, FLAME[2]) > 150, `${view}: bright as it hangs`);
    assert.ok(drawn(weightPainted(F.drop[1] + 0.05, view, 'floor')) > 1500, `${view}: the slam drawn big`);
    for (let t = 0; t < F.long; t += 1 / 15) {
      for (const part of ['crown', 'floor'] as const) {
        const p = weightPainted(t, view, part);
        assert.ok(!cyanIn(p) && room(p) >= 4, `${view} ${part} @${t.toFixed(2)}: cyan, or cut off (${room(p)})`);
      }
    }
    // (its drop smeared)
    assert.ok(smearIn(weightPainted(F.drop[1], view, 'crown')) > 40, `${view}: its drop smeared`);
    assert.equal(smearIn(weightPainted(F.drop[0] - 0.05, view, 'crown')), 0, 'no smear before it drops');
  }
  void WEIGHT_CANVAS;
});

test('13. THE HUSH\'S THREE MOVES: its grab shooting 8 tiles; its shield, clinging round him through all his moves, and struck off; its grey fog, lying 7 s and gone; none takes a word', () => {
  // GRAB AND DRAG
  assert.ok(Math.abs(grabReach(HS_GRAB.out[1]) - HS_GRAB.reach) < 1e-6 && HS_GRAB.reach >= 8 && HS_GRAB.pace >= 16, `its arms out ${grabReach(HS_GRAB.out[1])} tiles`);
  assert.equal(grabReach(HS_GRAB.haul[1]), 0, 'and home');
  assert.ok(!grabBare(HS_GRAB.strike[0]) && grabBare(0.9) && !grabBare(HS_GRAB.haul[1]), 'its forearms the effect\'s only while out');
  for (const view of VIEWS) {
    const st = stage(view === 'back' ? 'rear' : view, FX_CANVAS.ax, FX_CANVAS.ay, FX_CANVAS);
    const out = grabPainted(HS_GRAB.out[1], view);
    const [X, Y] = st.at([(HS_GRAB.reach + 1) * TILE3, 0, 34]);
    let near = 0;
    for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) if (out.px.d[((Math.round(Y) + dy) * out.px.w + Math.round(X) + dx) * 4 + 3]) near++;
    assert.ok(near > 20, `${view}: its hands out past 8 tiles (${near})`);
    for (let t = 0; t < HS_GRAB.long; t += 0.05) {
      const p = grabPainted(t, view);
      assert.ok(!cyanIn(p) && (drawn(p) === 0 || room(p) >= 4), `${view} @${t.toFixed(2)}: its arms cyan or cut off`);
    }
    for (const aim of [-45, 45]) assert.ok(room(grabPainted(HS_GRAB.out[1], view, { aim })) >= 4, `${view}: aimed ${aim}: cut off`);
  }
  // SHIELD: clinging round him in every frame of every move, its fog wound round him; wrapping, and struck off
  const st = stageOf(KING_SHIELDED);
  for (const move of movesOf(KING_SHIELDED).filter((m) => m !== 'dying')) {
    for (const t of framesOf(KING_SHIELDED, move).filter((_, i) => i % 4 === 0)) {
      const bits = KING_SHIELDED.bits(st, at(KING_SHIELDED, move, t));
      assert.ok(bits.some((b) => b.part === 'hush') && bits.some((b) => b.part === 'shroud') && bits.some((b) => b.part === 'hushHead' && b.piece === 'eyes'), `shielded, ${move} @${t.toFixed(2)}: not wrapped round him`);
    }
  }
  assert.ok(HS_STRUCK.knock[1] <= 0.5 && HS_STRUCK.long >= 1.2, 'flung off, and dazed a while');
  for (const view of VIEWS) {
    for (const mode of ['on', 'off'] as const) {
      const p = shieldPainted(0.2, view, mode);
      assert.ok(drawn(p) > 100 && !cyanIn(p), `${view} ${mode}: its fog round him`);
      const b = drawn(shieldPainted(0.2, view, mode, 'behind'));
      const f = drawn(shieldPainted(0.2, view, mode, 'before'));
      assert.ok(b > 20 && f > 20 && b + f >= drawn(p), `${view} ${mode}: behind him ${b}, before him ${f}`);
    }
  }
  // GREY FOG: the places marked as it draws breath; lying HS_FOG.r round; thinning; gone at HS_FOG.lies
  assert.ok(HS_FOG.r >= 1.7 && HS_FOG.lies >= 7);
  for (const view of VIEWS) {
    assert.ok(ofColour(fogPatchPainted(-0.2, view), FLAME[1]) > 20, `${view}: the place marked`);
    const lying = fogPatchPainted(3, view);
    const st2 = stage(view === 'back' ? 'rear' : view, FOG_CANVAS.ax, FOG_CANVAS.ay, FOG_CANVAS);
    let wide = 0;
    for (const a of [0, 90, 180, 270]) {
      const [X, Y] = st2.at([Math.cos((a * Math.PI) / 180) * HS_FOG.r * TILE3 * 0.75, Math.sin((a * Math.PI) / 180) * HS_FOG.r * TILE3 * 0.75, 0]);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (lying.px.d[((Math.round(Y) + dy) * lying.px.w + Math.round(X) + dx) * 4 + 3]) wide++;
    }
    assert.ok(wide > 60, `${view}: lying ${HS_FOG.r} tiles round (${wide})`);
    assert.ok(drawn(fogPatchPainted(HS_FOG.lies - 0.3, view)) < 0.6 * drawn(lying), `${view}: thinning at its end`);
    assert.equal(drawn(fogPatchPainted(HS_FOG.lies, view)), 0, 'gone');
    for (let t = -0.6; t < HS_FOG.lies; t += 0.25) {
      const p = fogPatchPainted(t, view);
      assert.ok(!cyanIn(p) && (drawn(p) === 0 || room(p) >= 2), `${view} @${t.toFixed(2)}: the patch cyan or cut off`);
    }
    for (let t = 0; t < 0.9; t += 0.1) assert.ok(!cyanIn(breathPainted(t, view)), 'its breath cyan');
    assert.ok(drawn(breathPainted(0.15, view)) > 300, `${view}: its breath drawn`);
  }
  // NONE OF THEM TAKES OR DARKENS WORDS: they are fog and arms; nothing of the words is in them (the game's rules: gking.ts)
  void HS_SHAPE;
});
