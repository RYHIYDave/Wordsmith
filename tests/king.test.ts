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
import { KING_CANVAS, KING_ON, SWORD_LONG, hushRiding, hushStanding, swordOf } from '../src/art/king';
import { HS_SHAPE, HUSH, HUSH_BESIDE, KG_ALONE_SHAPE, KG_CLIMB, KG_CROWN, KG_DIES, KG_PACE, KG_SHAPE, KG_STRIKES, KG_SWEEP, KING, KING_ALONE, TIP_Z, smearedAt } from '../src/art/king_moves';
import { BIRD, CROWN_FX, DECREE_FX, DECREE_GAPS, KG_REACH, SWEEP_FX, birdPainted, crownPainted, curtainFaces, curtainsPainted, decreeKnights, decreePainted, sweepPainted } from '../src/art/king_fx';
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
for (const view of VIEWS) {
  for (const move of movesOf(KING)) for (const t of framesOf(KING, move)) PAINTED.push({ mob: KING, move, view, t, p: paint(KING, move, t, view) });
  for (const move of movesOf(KING_ALONE)) framesOf(KING_ALONE, move).forEach((t, i) => i % 3 === 0 && PAINTED.push({ mob: KING_ALONE, move, view, t, p: paint(KING_ALONE, move, t, view) }));
  for (const move of ['stand', 'dying']) for (const t of framesOf(HUSH, move)) PAINTED.push({ mob: HUSH, move, view, t, p: paint(HUSH, move, t, view) });
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

test('1. the switch is off, and nothing of the game imports him', () => {
  assert.equal(KING_ON.on, false, 'KING_ON is off');
  const users: string[] = [];
  const his = /^art\/king(_moves|_fx)?$/;
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

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover; with the Hush on his back, without it, and the Hush on its own', () => {
  assert.equal(movesOf(KING).join(','), 'stand,walk,attack,reel,dying,decree,crown,curtains,climbOff');
  assert.equal(movesOf(KING_ALONE).join(','), 'stand,walk,attack,reel,dying,decree,crown,curtains');
  for (const [mob, shape, moves] of [[KING, KG_SHAPE, undefined], [KING_ALONE, KG_ALONE_SHAPE, undefined], [HUSH, HS_SHAPE, ['stand', 'dying']]] as const) {
    const found = checkBoss(mob, shape, moves);
    assert.equal(found.length, 0, `${mob.id}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(KG_STRIKES).sort().join(','), 'attack,crown,curtains,decree');
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(KG_STRIKES)) {
    assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: its strike is two frames`);
    assert.equal(moveOf(KING, move).motion.hit, s1, `${move}: it lands on the strike's last frame`);
  }
  for (const { mob, move, view, t, p } of PAINTED) {
    if (mob === HUSH) continue;
    const n = smearIn(p);
    const want = smearedAt(move, t);
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
  for (const mob of [KING, KING_ALONE]) {
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
      assert.ok(bits.some((b) => b.part === 'crown'), `${move} @${t.toFixed(2)}: his crown`);
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
  assert.ok(end.pelvis[2] < 22 && end.head[2] < 22, `lying down: his hips ${end.pelvis[2].toFixed(0)}, his head ${end.head[2].toFixed(0)} up`);
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
  const wc: V3 = [want.head[0] + HUSH_BESIDE[0], want.head[1] + HUSH_BESIDE[1], want.head[2] - 0.6];
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

test('10. HIS SIZES AND REACH: the sweep round from behind his right to his left, the wave ten tiles out, the ring ten, the leap five tiles; his pace slow', () => {
  const tipAt = (t: number): V3 => KG_SHAPE.tip?.('attack', t, skeletonAt(KING, 'attack', t), posedOfMob(KING, 'attack', t)) as V3;
  const s0 = skeletonAt(KING, 'attack', KG_SWEEP.strike[0]);
  const deg = (p: V3, c: V3): number => (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180) / Math.PI;
  const [a, b] = KG_SWEEP.strike;
  assert.ok(deg(tipAt(a), s0.pelvis) <= -140, `the sweep starts from ${deg(tipAt(a), s0.pelvis).toFixed(0)} degrees (behind his right)`);
  assert.ok(deg(tipAt(b), s0.pelvis) >= 50, `and lands at ${deg(tipAt(b), s0.pelvis).toFixed(0)} degrees (his left)`);
  for (const t of [a, b]) assert.ok(Math.hypot(tipAt(t)[0], tipAt(t)[1]) >= 2.2 * TILE3, `the blade itself reaches ${(Math.hypot(tipAt(t)[0], tipAt(t)[1]) / TILE3).toFixed(1)} tiles`);
  assert.ok(SWEEP_FX.to - SWEEP_FX.from >= 200, `the wave's wedge ${SWEEP_FX.to - SWEEP_FX.from} degrees`);
  assert.ok(KG_REACH.sweep >= 9.5 && KG_REACH.crown >= 9.5, 'the wave and the ring out across most of the hall (about 17 by 20 tiles)');
  assert.ok(KG_CROWN.carry >= 5, `his leap carries him ${KG_CROWN.carry} tiles`);
  assert.ok(KG_CROWN.top >= 50, `his leap ${KG_CROWN.top} high`);
  assert.ok(KG_PACE <= 1.2, `his pace ${KG_PACE} tiles a second: slow and heavy`);
  assert.equal(KING.walk.ground, KG_PACE * TILE3, 'his walk painted for his pace');
  // (in the air while the game carries him: both feet off the stones)
  for (const t of framesOf(KING, 'crown')) {
    if (t <= KG_CROWN.air[0] + 0.05 || t >= KG_CROWN.air[1] - 0.02) continue;
    const s = skeletonAt(KING, 'crown', t);
    assert.ok(Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 0.6, `the Crown @${t.toFixed(2)}: a foot down while he is in the air`);
  }
  void KING_CANVAS;
});
