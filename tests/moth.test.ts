// FLOOR 20'S BOSS, THE MOTH (src/art/moth.ts, its look; src/art/moth_moves.ts, its moves; src/art/moth_fx.ts, what its
// moves leave on the top). A MOCK-UP: NOT IN THE GAME, behind MOTH_ON, off. His pick for how it moves, “Slow, heavy
// wingbeats”; the rest of the brief as offered him (art/moth.ts has it); his rules for every boss (his rulebook, How art is
// made 7, “I need all bosses ran through all checks from now on.  These boss fights are important”) and for every enemy
// from the Princess on (Movement 9, “Like the wind up and wind down are big but the actual punch is lightning quick”;
// “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the
// extra time the player gets to evade”):
//   1. the switch is off, and nothing of the game imports it;
//   2. EVERY MOVE OF IT THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and from behind, and
//      every handover (its moves begun in step with its beat: tests/moth_shape.ts);
//   3. HIS LIGHTNING STRIKES: each of its five blows winds up, holds, strikes in two frames and lands on the second; the
//      strike's frames, and the one after it, carry its smear; no other frame does;
//   4. its frames paint both ways round: nothing cyan, the pink edge while it lives and none as it dies, every pixel whole
//      or empty but the edge;
//   5. NOTHING CUT OFF, it or what its moves leave;
//   6. NOTHING OF IT IN THE FLOOR, and its feet grip the stones once down;
//   7. HIS BRIEF: a real moth (four wings, six legs, two feathered antennae, a head, a thorax, eight segments); an eye on
//      each wing, the Hush's dull pink in them, that open and shut and follow you (half-lidded hovering; shut as they blink;
//      wide in the Eyes); slow wingbeats; it lands only in its last phase; it dies screaming, the words pour out of it, and
//      it crumbles to dust;
//   8. WHAT ITS MOVES LEAVE: in the enemy's colours and the Hush's, never cyan; the beams out in two frames;
//   9. ITS SIZES: the biggest thing in the game; its wings, spread, as wide as the top is long; what its blows cover big.
//   run: tsx --test tests/moth.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { AB_R, FUR, HUSH_DUST, IRIS, MOTH_CANVAS, MOTH_ON, MOTH_SMEAR, onWing, spanOf, wingRim } from '../src/art/moth';
import { BEAT_RING, BUFFET_CONE, DUST_CLOUD, EYE_BEAMS, MOTH, MOTH_BEAT, MOTH_DIES, MOTH_EYES, MOTH_PACE, MOTH_STRIKES, MOTH_WORDS, SWARM, mothGeomAt, mothPoseAt, smearedAt } from '../src/art/moth_moves';
import { BEAM_FX, CLOUD_FX, FX_CANVAS, beamsPainted, chapterPainted, cloudPainted, gustPainted, swarmAt, swarmPainted, wavePainted, wordsPainted } from '../src/art/moth_fx';
import { CARRION_QUEEN } from '../src/art/carrion_queen';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { WORD_COLOR } from '../src/art/icons';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { MOTH_SHAPE } from './moth_shape';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

const VIEWS = ['front', 'back'] as const;
const MOB: Mob = MOTH;
const ALL = movesOf(MOB);
const LIVING = ALL.filter((m) => m !== 'dying');
const ON_BOOK = new Set(['land', 'perch', 'beat', 'perchReel', 'dying']);
const FR = 1 / 30;

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
const keyOf = (c: string): string => rgba(c).slice(0, 3).join(',');
const countIn = (p: Painted, cols: Set<string>): number => {
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && cols.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};
const pixels = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};
const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const paint = (move: string, t: number, view: (typeof VIEWS)[number]): Painted => (move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view));

/** Frames painted for the picture checks, both ways round: every third frame of every move the game shows, and every frame of each strike and the frames round it. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of ALL) {
    const ts = framesOf(MOB, move);
    const s = MOTH_STRIKES[move];
    ts.forEach((t, i) => {
      const nearStrike = !!s && t >= s[0] - 2 * FR - 1e-6 && t <= s[1] + 2 * FR + 1e-6;
      if (i % 3 === 0 || i === ts.length - 1 || nearStrike) PAINTED.push({ move, view, t, p: paint(move, t, view) });
    });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;

test('1. the switch is off, and nothing of the game imports it', () => {
  assert.equal(MOTH_ON.on, false, 'MOTH_ON is off');
  const users: string[] = [];
  const its = /^art\/moth(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || its.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (its.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import it');
});

test('2. EVERY MOVE OF IT THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(ALL.join(','), 'stand,walk,attack,reel,dying,dust,eyes,swarm,land,perch,beat,perchReel');
  const found = checkBoss(MOB, MOTH_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
  // (and the review sees all of it: its six feet gripping the book's stones, its two arms and more, its wings)
  const s = skeletonAt(MOB, 'perch', 0);
  const q = posedOfMob(MOB, 'perch', 0);
  assert.equal(MOTH_SHAPE.grips?.('perch', 0, s, q).length, 6, 'six feet');
  assert.equal(MOTH_SHAPE.arms?.('perch', 0, s, q).length, 6, 'six legs');
  assert.equal(MOTH_SHAPE.things?.('perch', 0, s, q).filter((x) => /wing/.test(x.name)).length, 4, 'four wings');
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(MOTH_STRIKES).sort().join(','), 'attack,beat,dust,eyes,swarm');
  const SMEAR = new Set(MOTH_SMEAR.map(keyOf));
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(MOTH_STRIKES)) {
    assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: its strike is two frames`);
    assert.equal(moveOf(move).motion.hit, s1, `${move}: it lands on the strike's last frame`);
    // (and its warning held before it: a third of a second and more)
    assert.ok(s0 >= 0.6, `${move}: its wind-up ${s0.toFixed(2)} s`);
  }
  for (const { move, view, t, p } of PAINTED) {
    const n = countIn(p, SMEAR);
    const want = smearedAt(move, t);
    if (want && n < 40) faults.push(`${said(move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(move, view, t)}: smeared out of its strike (${n})`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while it lives and none as it dies, every pixel whole or empty but the edge', () => {
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
    if (n < 4000 || cyanIn(p) || odd || (alive ? rim < 400 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

/** How near a painting comes to its canvas's edge (picture pixels). */
function room(p: Painted): number {
  const { w, h, d } = p.px;
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
  return x1 < 0 ? Infinity : Math.min(x0, y0, w - 1 - x1, h - 1 - y1);
}
test('5. NOTHING CUT OFF: in every frame, both ways round, it is inside its picture with room to spare; and what its moves leave inside theirs', () => {
  const faults: string[] = [];
  let least = Infinity;
  for (const { move, view, t, p } of PAINTED) {
    assert.equal(`${p.px.w}x${p.px.h}`, `${MOTH_CANVAS.w}x${MOTH_CANVAS.h}`);
    const r = room(p);
    least = Math.min(least, r);
    if (r < 6) faults.push(`${said(move, view, t)}: ${r} pixels from the edge`);
  }
  for (const view of VIEWS) {
    const pv = paintViewOf(MOB, view);
    const G = mothGeomAt('eyes', MOTH_EYES.strike[1]);
    for (const [name, p] of [['gust', gustPainted(0.65, pv)], ['cloud', cloudPainted(1.6, pv)], ['beams', beamsPainted(0.1, pv, G)], ['swarm', swarmPainted(1.6, pv, mothGeomAt('swarm', 1.2).TC)], ['wave', wavePainted(0.8, pv)], ['words', wordsPainted(2.2, pv, () => mothGeomAt('dying', 1).HC)]] as const) {
      if (room(p) < 2) faults.push(`${name} ${view}: cut off`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= 6, `the nearest it comes to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return Math.max(0, -z);
}
test('6. NOTHING OF IT IN THE FLOOR: its body, legs, antennae and the whole outline of each wing; its feet down only on the stones and gripping them', () => {
  const st = stage(paintViewOf(MOB, 'front'), canvasOf(MOB).ax, canvasOf(MOB).ay, canvasOf(MOB));
  const faults: string[] = [];
  for (const move of ALL) {
    for (const t of framesOf(MOB, move)) {
      const bits: Bit[] = MOB.bits(st, at(move, t));
      for (const b of bits) {
        if (b.part === 'smear' || b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot' || b.shape.k === 'panel') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
      }
      const G = mothGeomAt(move, t);
      for (const w of G.wings) for (const [x, y] of wingRim(w.hind, 40)) {
        const z = onWing(w, x * w.len, y * w.len)[2];
        if (z < -0.6) faults.push(`${move} @${t.toFixed(2)}: a wing's edge ${(-z).toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. HIS BRIEF: a real moth; an eye on each wing that opens, shuts and follows you; slow wingbeats; it lands only in its last phase; it dies screaming, the words pour out, it crumbles to dust', () => {
  const st = stage(paintViewOf(MOB, 'front'), canvasOf(MOB).ax, canvasOf(MOB).ay, canvasOf(MOB));
  // A REAL MOTH: four wings (two panels each, about its fold), six legs, two feathered antennae, a head with its compound
  // eyes and palps, its thorax and its mane, eight segments of abdomen
  const bits = MOB.bits(st, at('stand', 0.8));
  const parts = new Set(bits.map((b) => b.part));
  for (const p of ['wingNearFore', 'wingNearHind', 'wingFarFore', 'wingFarHind']) assert.equal(bits.filter((b) => b.part === p && b.shape.k === 'panel').length, 2, `${p}: one wing, cupped about its fold`);
  assert.ok(parts.has('legsL') && parts.has('legsR'), 'its legs');
  assert.equal(bits.filter((b) => b.piece === 'femur').length, 6, 'six legs');
  assert.equal(bits.filter((b) => b.piece === 'claw').length, 12, 'each with its claw');
  assert.ok(bits.filter((b) => b.piece === 'comb').length > 80, 'feathered antennae, combed both sides');
  for (const piece of ['compound1', 'compound-1', 'palp', 'thorax', 'mane', 'tongue']) assert.ok(bits.some((b) => b.piece === piece), piece);
  for (let i = 0; i < AB_R.length; i++) assert.ok(bits.some((b) => b.piece === `seg${i}`), `segment ${i}`);
  // NOT GORY: nothing of it red as blood; NOT CUTE: grey, ash and bone (its fur the darkest of its ramps)
  const hov = PAINTED.filter((f) => f.move === 'stand');
  for (const { view, t, p } of hov) {
    const { d } = p.px;
    let n = 0;
    let grey = 0;
    let red = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] !== 255) continue;
      n++;
      const mx = Math.max(d[i], d[i + 1], d[i + 2]);
      const mn = Math.min(d[i], d[i + 1], d[i + 2]);
      if (mx === 0 || (mx - mn) / mx < 0.25) grey++;
      if (d[i] > 120 && d[i + 1] < 60 && d[i + 2] < 60) red++;
    }
    assert.ok(grey > n * 0.93, `stand ${view} @${t.toFixed(2)}: grey, ash and bone (${((grey / n) * 100).toFixed(1)}% of it)`);
    assert.equal(red, 0, `stand ${view} @${t.toFixed(2)}: blood red`);
  }
  void FUR;
  // ITS EYES: the dull pink of the Hush in each of the four, half-lidded as it hovers; shut as they blink; wide in the Eyes, burning
  const IRISES = new Set(IRIS.map(keyOf));
  const eyesAt = (move: string, t: number): number => mothPoseAt(move, t).eyes;
  const stand = framesOf(MOB, 'stand').map((t) => eyesAt('stand', t));
  assert.ok(Math.max(...stand) > 0.3 && Math.max(...stand) < 0.45, `half-lidded as it hovers: ${Math.max(...stand).toFixed(2)}`);
  assert.ok(Math.min(...stand) < 0.05, 'and once a beat they blink shut');
  assert.ok(Math.max(...framesOf(MOB, 'eyes').map((t) => eyesAt('eyes', t))) > 1.1, 'wide, burning, in the Eyes');
  const half = PAINTED.find((f) => f.move === 'stand' && f.view === 'back' && Math.abs(f.t - 0.8) < 0.04);
  assert.ok(half && countIn(half.p, IRISES) > 300, `the dull pink in its eyes: ${half ? countIn(half.p, IRISES) : 0} pixels`);
  // (and they follow you: as its wings beat, each pupil keeps to you, its way across the eye turning against the wing's)
  const look = mothPoseAt('stand', 0).look;
  const pupilWay = (t: number): number => {
    const G = mothGeomAt('stand', t);
    const w = G.wings[1];
    const e = onWing(w, 0.5 * w.len, 0.4 * w.len);
    const g = [look[0] - e[0], look[1] - e[1], look[2] - e[2]];
    return Math.atan2(g[0] * w.d[0] + g[1] * w.d[1] + g[2] * w.d[2], g[0] * w.c[0] + g[1] * w.c[1] + g[2] * w.c[2]);
  };
  assert.ok(Math.abs(pupilWay(0) - pupilWay(1.2)) > 0.3, 'its pupils turn as its wings beat, to keep to you');
  // SLOW, HEAVY WINGBEATS: one beat in 2.4 seconds, the downstroke heavier (shorter) than the climb back
  assert.equal(MOTH_BEAT.long, 2.4);
  const beat = framesOf(MOB, 'stand').map((t) => mothPoseAt('stand', t).beat);
  assert.ok(Math.max(...beat) - Math.min(...beat) > 80, `a full beat: ${(Math.max(...beat) - Math.min(...beat)).toFixed(0)} degrees`);
  // IT LANDS ONLY IN ITS LAST PHASE: in the air its lowest point well up off the top, its feet never down
  for (const move of ALL) {
    for (const t of framesOf(MOB, move)) {
      const G = mothGeomAt(move, t);
      const feet = G.legs.map((l) => l.tarsus[5][2]);
      if (!ON_BOOK.has(move)) {
        assert.ok(Math.min(...feet) > 2, `${move} @${t.toFixed(2)}: a foot down in the air`);
        assert.ok(Math.min(...G.ab.map((c, i) => c[2] - AB_R[i])) > 30, `${move} @${t.toFixed(2)}: its body low`);
      }
    }
  }
  for (const t of framesOf(MOB, 'perch')) assert.ok(mothGeomAt('perch', t).legs.every((l) => l.tarsus[5][2] < 0.6), `on the book @${t.toFixed(2)}: its feet down`);
  // IT DIES SCREAMING: its mouthparts wide, its head thrown back; the first sound it makes (the game's)
  const [sc0, sc1] = MOTH_DIES.scream;
  assert.ok(mothPoseAt('dying', (sc0 + sc1) / 2).scream > 0.95, 'its mouth wide');
  assert.ok(MOB.bits(st, dyingMoment(MOB, (sc0 + sc1) / 2)).some((b) => b.piece === 'mouth'), 'its mouth open');
  // EVERY WORD IT SWALLOWED POURS OUT OF IT: the game's own glyphs in their own colours
  const WORDS = new Set(MOTH_WORDS.map((w) => keyOf(WORD_COLOR[w])));
  const mid = deathOfMob(MOB, ((MOTH_DIES.words[0] + MOTH_DIES.words[1]) / 2) / MOB.dieTime, 'front');
  assert.ok(countIn(mid, WORDS) > 200, `the words pouring out: ${countIn(mid, WORDS)} pixels`);
  // AND IT CRUMBLES TO DUST: at the end, a heap of its dust where it fell, little of it left
  const first = pixels(deathOfMob(MOB, 0, 'front'));
  const last = deathOfMob(MOB, 1, 'front');
  assert.ok(pixels(last) < first * 0.12, `crumbled: ${pixels(last)} of ${first} pixels left`);
  assert.ok(countIn(last, new Set(HUSH_DUST.map(keyOf))) > 150, 'its dust lying on the top');
});

test('8. WHAT ITS MOVES LEAVE: in the enemy\'s colours and the Hush\'s and bone, never cyan; the beams out in two frames, bone white about the dull pink', () => {
  for (const view of VIEWS) {
    const pv = paintViewOf(MOB, view);
    const G = mothGeomAt('eyes', MOTH_EYES.strike[1]);
    for (let t = 0; t <= 1.25; t += 0.1) {
      assert.ok(!cyanIn(gustPainted(t, pv)), `the gust ${view} @${t.toFixed(1)}: cyan`);
      assert.ok(!cyanIn(wavePainted(t, pv)), `the beat's wind ${view} @${t.toFixed(1)}: cyan`);
    }
    for (let t = 0; t <= CLOUD_FX.fall + CLOUD_FX.hold + CLOUD_FX.fade; t += 0.5) assert.ok(!cyanIn(cloudPainted(t, pv)), `the cloud ${view} @${t.toFixed(1)}: cyan`);
    for (let t = 0; t <= SWARM.long; t += 0.4) assert.ok(!cyanIn(swarmPainted(t, pv, G.TC)), `the swarm ${view} @${t.toFixed(1)}: cyan`);
    for (let t = MOTH_DIES.words[0]; t <= MOTH.dieTime; t += 0.4) assert.ok(!cyanIn(wordsPainted(t, pv, () => G.HC)), `the words ${view} @${t.toFixed(1)}: cyan`);
    assert.ok(!cyanIn(chapterPainted(pv, 1, 0.3)), 'the chapter: cyan');
    // the beams: nothing before the strike; half out on its first frame, all out on its last; bone white, the dull pink at their core
    assert.equal(pixels(beamsPainted(-2 * (1 / 30), pv, G)), 0, 'no beam before the strike');
    const b0 = pixels(beamsPainted(-1 / 30, pv, G));
    const b1 = pixels(beamsPainted(0, pv, G));
    assert.ok(b0 > 400 && b1 > 1.5 * b0, `${view}: the beams out in two frames (${b0} then ${b1})`);
    for (let t = -1 / 30; t <= BEAM_FX.hold + BEAM_FX.fade; t += 0.05) assert.ok(!cyanIn(beamsPainted(t, pv, G)), `the beams ${view} @${t.toFixed(2)}: cyan`);
    const lit = beamsPainted(0.1, pv, G);
    assert.ok(countIn(lit, new Set([FLAME[1], FLAME[2]].map(keyOf))) > 200 && countIn(lit, new Set(['#eae3d4', '#d0c7b4'].map(keyOf))) > 400, 'bone white about the dull pink');
  }
  // the swarm: little moths, each a real one (its own body and four wings), many, all across the top
  const sw = swarmAt(1.6, [40, 0, 200]);
  assert.ok(sw.length > 80, `${sw.length} little moths in the air`);
  // the dust off its wings is the Hush itself: its grains the Hush's own grey
  const gst = stage('front', MOTH_CANVAS.ax, MOTH_CANVAS.ay, MOTH_CANVAS);
  const gm = at('dust', 1.2);
  MOB.bits(gst, gm);
  const grains = MOB.grains?.(gst, gm) ?? [];
  assert.ok(grains.length > 60 && grains.every((g) => HUSH_DUST.includes(g[1])), 'its dust, the Hush');
});

test('9. ITS SIZES: the biggest thing in the game; its wings, spread, as wide as the top is long; what its blows cover big', () => {
  // (spread on the book, its wings as wide as a boss's arena is long, about 20 tiles; hovering, half spread or more)
  const spread = spanOf(mothGeomAt('perch', 0));
  assert.ok(spread >= 18.5, `spread, ${spread.toFixed(1)} tiles`);
  const hover = Math.max(...framesOf(MOB, 'stand').map((t) => spanOf(mothGeomAt('stand', t))));
  assert.ok(hover >= 15, `hovering, ${hover.toFixed(1)} tiles`);
  // (bigger than the Carrion Queen, the biggest before it, her wings wider than the trail)
  const width = (p: Painted): number => {
    const { w, h, d } = p.px;
    let x0 = w;
    let x1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
    }
    return x1 - x0;
  };
  const queen = Math.max(...['stand', 'attack'].map((m) => width(paintMob(CARRION_QUEEN, m, 0.5, 'front'))));
  const moth = Math.max(...PAINTED.filter((f) => f.move === 'perch').map((f) => width(f.p)));
  assert.ok(moth > queen * 1.2, `its width ${moth} against the Carrion Queen's ${queen}`);
  // (his “bigger AOE”: the buffet's cone 140 degrees and 9 tiles; the dust 7 tiles across; the beams the top's whole
  // length; the swarm across most of it; the beat's wind over the whole top)
  assert.ok(BUFFET_CONE.deg >= 140 && BUFFET_CONE.tiles >= 9, 'the buffet');
  assert.ok(DUST_CLOUD.tiles >= 7, 'the dust');
  assert.ok(EYE_BEAMS.tiles >= 20 && EYE_BEAMS.wide >= 1.2, 'the beams');
  assert.ok(SWARM.tiles >= 16 && SWARM.wide >= 5, 'the swarm');
  assert.ok(BEAT_RING.tiles >= 10, 'the beat');
  assert.ok(MOTH_PACE >= 3, 'its drift');
  void TILE3;
});
