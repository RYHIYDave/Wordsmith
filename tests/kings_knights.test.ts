// FLOOR 19'S KING'S KNIGHTS (src/art/kings_knights.ts, their look; src/art/kings_knights_moves.ts, their moves;
// src/art/kings_knights_fx.ts, what their blows leave on the floor). A MOCK-UP: NOT IN THE GAME, behind KNIGHTS_ON, off.
// His pick for them, offered as "Same brief, but surprisingly quick for men in full plate.": “Quick for their armour”;
// his rules for every new enemy (Movement 9, 24 Oct: “Like the wind up and wind down are big but the actual punch is
// lightning quick”; 28 Oct: “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE
// to compensate for the extra time the player gets to evade”). Held as floor 16's palace guard and Princess are
// (tests/palace_guard.test.ts, tests/princess.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), both blows, their setting off and stopping:
//      every frame, from in front and from behind, and every handover;
//   3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike's frames and the one
//      after it carry its smear; no other frame does;
//   4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel
//      whole or empty but the edge; the royal blue well clear of the friend's cyan, the old gold never a light;
//   5. NOTHING CUT OFF;
//   6. NOTHING OF THEM IN THE FLOOR: all they wear and carry;
//   7. THE HUSH leaking out of the sight while they live; a great breath of it as it leaves them; none once they lie
//      still; the dull pink in the sight while they live, gone out by the end; and down they lie, low on the floor;
//   8. the sword falls clear of him;
//   9. NOTHING FOLDS FLAT;
//  10. HIS PICK, QUICK FOR THEIR ARMOUR, AND HIS SIZES: a head taller than the knight; they run faster than the hero
//      (4.6 tiles a second), a flight between the strides; the chop raised high over the helm in both hands, held, its
//      point into the floor as it lands, and the crack running out six tiles; the rush crouched behind the shield, held,
//      carried three and a half tiles in its two frames, the knockback bursting out nearly two; dying, to his knee behind
//      his planted sword, his head bowed, then down;
//  11. WHAT THEIR BLOWS LEAVE: the crack out in two frames and gone; the knockback's flash in two and gone; nothing cyan.
//   run: tsx --test tests/kings_knights.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { BLUE, GOLD, KNIGHTS_ON, KN_CANVAS, KN_EXHALE, SMEAR, shieldOf, swordOf } from '../src/art/kings_knights';
import { CHOP_AT, KINGS_KNIGHT, KN_CHOP, KN_DIES, KN_PACE, KN_RUSH, KN_SHAPE, KN_STRIKES, smearedAt } from '../src/art/kings_knights_moves';
import { CRACK, KNOCK, crackPainted, knockPainted } from '../src/art/kings_knights_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';
import { TUNE } from '../src/game/defs';
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
const MOB: Mob = KINGS_KNIGHT;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function hueOf(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return -1;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return (h + 360) % 360;
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  const h = hueOf(r, g, b);
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

/** Every frame of every move of his (the game's frames of each: framesOf), painted on his whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;
const SMEARS = new Set(SMEAR.map((c) => rgba(c).slice(0, 3).join(',')));
const smearIn = (p: Painted): number => {
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && SMEARS.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(KNIGHTS_ON.on, false, 'KNIGHTS_ON is off');
  const users: string[] = [];
  const theirs = /^art\/kings_knights(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || theirs.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (theirs.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,rush,setOff,halt');
  const found = checkBoss(MOB, KN_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(KN_STRIKES).sort().join(','), 'attack,rush');
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(KN_STRIKES)) {
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
  for (const { move, view, t, p } of PAINTED) if (!KN_STRIKES[move] && smearIn(p) > 0) faults.push(`${said(move, view, t)}: smeared`);
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge; his blue no cyan, his gold no light', () => {
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
    // (what lights he gives off: the enemy's pink only, in a warning)
    for (const l of p.lights) if (l.color !== FLAME[1] && l.color !== FLAME[2]) faults.push(`${said(move, view, t)}: a light of ${l.color}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  // (the royal blue: its hue well clear of the friend's cyan, 160 to 205 degrees; the gold, never a glow's colour)
  for (const c of BLUE) {
    const [r, g, b] = rgba(c);
    const h = hueOf(r, g, b);
    assert.ok(h > 215 && h < 240, `the royal blue ${c} at ${h.toFixed(0)} degrees`);
  }
  for (const c of GOLD) assert.ok(!FLAME.includes(c) && Math.max(...rgba(c).slice(0, 3)) < 200, `the old gold ${c} as bright as a flame`);
});

test('5. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${KN_CANVAS.w}x${KN_CANVAS.h}`);
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

test('6. NOTHING OF HIM IN THE FLOOR: all he wears and carries', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      // (but his sword once it has fallen from his hands, which falls as itself: test 8)
      const bits: Bit[] = MOB.bits(st, at(move, t)).filter((b) => !(move === 'dying' && b.piece === 'sword' && t >= KN_DIES.drop));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        // (the blade's own point may rest on the floor where it is planted, or bite it as it lands)
        if (by > (b.part === 'blade' ? 0.9 : 0.6)) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** The Hush coming out of him at a moment (laid after his edge: the grains), but the warning's glints. */
function breathAt(st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  MOB.bits(st, m);
  return (MOB.grains?.(st, m) ?? []).filter((g) => g[1] !== FLAME[3] && g[1] !== FLAME[4]);
}

test('7. THE HUSH leaking out of the sight while he lives; a great breath of it as it leaves him; none once he lies still; pink in the sight while he lives, gone by the end; down he lies, low', () => {
  const st = stageOf();
  let most = 0;
  let frames = 0;
  let some = 0;
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const n = breathAt(st, at(move, t)).length;
      frames++;
      if (n > 0) some++;
      most = Math.max(most, n);
    }
  }
  assert.ok(some > 0.9 * frames, `the Hush leaking in ${some} of ${frames} living frames`);
  let great = 0;
  for (let t = KN_EXHALE[0]; t <= KN_EXHALE[1]; t += 0.05) great = Math.max(great, breathAt(st, dyingMoment(MOB, t)).length);
  assert.ok(great >= 1.5 * most, `the Hush leaving him, ${great} at most; the most while he lives, ${most}`);
  for (let t = KN_EXHALE[1] + 0.05; t <= KN_DIES.long + 1e-9; t += 0.05) assert.equal(breathAt(st, dyingMoment(MOB, t)).length, 0, `@${t.toFixed(2)}: the Hush still coming out`);
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) for (const t of framesOf(MOB, move)) assert.ok(pinkEyes(MOB.bits(st, at(move, t))), `${move} @${t.toFixed(2)}: no pink in the sight`);
  for (let t = KN_DIES.out[1]; t <= KN_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(MOB.bits(st, dyingMoment(MOB, t))), `@${t.toFixed(2)}: the pink still in the sight`);
  const height = (p: Painted): number => {
    const { w, h, d } = p.px;
    let y0 = h;
    let y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return y1 - y0;
  };
  for (const view of VIEWS) {
    const him: Mob = { ...MOB, fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const up = height(paintMob(MOB, 'stand', 0, view));
    const down = height(deathOfMob(him, 1, view));
    // (his shield on his back stands up off him as he lies: a little taller than the palace guard lying down)
    assert.ok(down < 0.7 * up, `${view}: ${down} pixels tall lying down, ${up} standing`);
  }
});

test('8. his sword falls from his hands and lies clear of him once he is down, from in front and from behind', () => {
  const him: Mob = { ...MOB, fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
  const pieces: Mob = { ...MOB, bits: (st, m) => MOB.bits(st, m).filter((b) => b.piece === 'sword') };
  for (const view of VIEWS) {
    for (let k = (KN_DIES.down + 0.1) / MOB.dieTime; k <= 1 + 1e-9; k += 0.04) {
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
      assert.ok(mine > 500 && theirs > 15, `${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of his sword`);
      assert.equal(both, 0, `${view} @${k.toFixed(2)}: his sword lies over him or under him by ${both} pixels`);
    }
  }
});

test('9. NOTHING FOLDS FLAT: no round thing he wears collapses into a flat sheet that spins', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(move, t))) {
        if (b.shape.k !== 'ball') continue;
        // (but what is made flat to be flat: the fans of his couters and poleyns, his helm's flat top, the crown on his breast)
        if (/couter|poleyn|charge/.test(b.piece) || (b.piece === 'helm' && b.part === 'helm')) continue;
        const [x, y, z] = b.shape.ax;
        const det = x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0]);
        const lens = Math.hypot(...x) * Math.hypot(...y) * Math.hypot(...z);
        if (lens > 0 && Math.abs(det) / lens < 0.5) faults.push(`${move} @${t.toFixed(2)}: ${b.piece} ${(Math.abs(det) / lens).toFixed(2)} square`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('10. HIS PICK, QUICK FOR THEIR ARMOUR, AND HIS SIZES: taller than the knight; faster than the hero runs, a flight in the stride; the chop high and into the floor, its crack six tiles out; the rush crouched, carried three and a half tiles in two frames; to his knee, then down', () => {
  // a head taller than the knight (58 tall): the top of his helm's circlet
  const s0 = skeletonAt(MOB, 'stand', 0);
  assert.ok(s0.head[2] + 10 > 58 + 7, `his helm's top ${(s0.head[2] + 10).toFixed(1)} up (the knight 58)`);
  // quick: faster than the hero runs, his walk painted for that pace, and a flight between his strides
  assert.ok(KN_PACE >= TUNE.heroSpeed, `he runs ${KN_PACE} tiles a second, the hero ${TUNE.heroSpeed}`);
  assert.equal(MOB.walk.ground, KN_PACE * TILE3, 'his run painted for his pace');
  let flights = 0;
  for (const t of framesOf(MOB, 'walk')) {
    const s = skeletonAt(MOB, 'walk', t);
    if (Math.min(s.toeL[2], s.heelL[2], s.toeR[2], s.heelR[2]) > 0.6) flights++;
  }
  assert.ok(flights >= 4, `${flights} frames of his run with both feet off the floor`);
  // THE CHOP: in the warning, both fists high over his helm; as it lands, its point down on the floor well before him
  const sw = skeletonAt(MOB, 'attack', (KN_CHOP.warn[0] + KN_CHOP.warn[1]) / 2);
  assert.ok(sw.handR[2] > sw.head[2] + 8 && sw.handL[2] > sw.head[2] + 8, `his fists ${sw.handR[2].toFixed(1)}, ${sw.handL[2].toFixed(1)} up, his head ${sw.head[2].toFixed(1)}`);
  const hitTip = swordOf(skeletonAt(MOB, 'attack', KN_CHOP.hit)).tip;
  assert.ok(hitTip[2] < 1.6 && hitTip[0] > TILE3, `the point lands at ${hitTip.map((v) => v.toFixed(1)).join(', ')}`);
  assert.ok(Math.abs(hitTip[0] - CHOP_AT) < 1.5, `the crack begins where the point bites (${CHOP_AT.toFixed(1)}, the point ${hitTip[0].toFixed(1)})`);
  assert.ok(CRACK.reach >= 6 && CRACK.wide >= 1, `the crack ${CRACK.reach} tiles out, ${CRACK.wide} across`);
  // THE RUSH: in the warning, crouched behind the shield on his arm; carried three and a half tiles in its two frames
  const tw = (KN_RUSH.warn[0] + KN_RUSH.warn[1]) / 2;
  const sr = skeletonAt(MOB, 'rush', tw);
  const qr = posedOfMob(MOB, 'rush', tw);
  const sh = shieldOf(sr, qr);
  assert.ok(qr.pt >= 0.999 && sh.c[0] > sr.ribs[0] + 6 && sh.n[0] > 0.8, `the shield before him (${sh.c.map((v) => v.toFixed(1)).join(', ')}, facing ${sh.n.map((v) => v.toFixed(2)).join(', ')})`);
  assert.ok(sr.pelvis[2] < skeletonAt(MOB, 'stand', 0).pelvis[2] - 6, `crouched: his hips ${sr.pelvis[2].toFixed(1)} up`);
  assert.ok(KN_RUSH.carry >= 3.5 && Math.round((KN_RUSH.strike[1] - KN_RUSH.strike[0]) * 30) === 2, `carried ${KN_RUSH.carry} tiles in its strike`);
  assert.ok(KNOCK.r >= 1.5, `the knockback ${KNOCK.r} tiles`);
  // (and on his back while he stands and runs)
  assert.ok(posedOfMob(MOB, 'stand', 0).pt === 0 && posedOfMob(MOB, 'walk', 0).pt === 0, 'the shield on his back as he stands and runs');
  // HIS DEATH: on his right knee behind his planted sword, its point on the floor, his head bowed; then down
  const k = skeletonAt(MOB, 'dying', (KN_DIES.bow[1] + KN_DIES.out[1]) / 2);
  assert.ok(k.kneeR[2] < 6.5 && k.kneeL[2] > 12, `to his right knee (knees ${k.kneeR[2].toFixed(1)}, ${k.kneeL[2].toFixed(1)} up)`);
  assert.ok(swordOf(k).tip[2] < 1.6 && swordOf(k).tip[0] > k.pelvis[0] + 10, 'his sword planted before him');
  assert.ok(posedOfMob(MOB, 'dying', (KN_DIES.bow[1] + KN_DIES.out[1]) / 2).faceUp < -20, 'his head bowed');
  const d = skeletonAt(MOB, 'dying', KN_DIES.long);
  // (his knee cops are thick: lying on them, his knees stand that much off the floor)
  assert.ok(d.kneeL[2] < 11.5 && d.kneeR[2] < 11.5 && d.head[2] < 20, `down at the end (knees ${d.kneeL[2].toFixed(1)}, ${d.kneeR[2].toFixed(1)}, head ${d.head[2].toFixed(1)})`);
});

test('11. WHAT THEIR BLOWS LEAVE: the crack out in two frames and gone; the knockback flash in two and gone; nothing cyan', () => {
  const pixels = (p: Painted): number => {
    let n = 0;
    for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
    return n;
  };
  for (const view of VIEWS) {
    assert.equal(Math.round((CRACK.open[1] - CRACK.open[0]) * 30), 2, 'the crack opens in two frames');
    const first = pixels(crackPainted(0, view));
    const open = pixels(crackPainted(CRACK.open[1], view));
    assert.ok(open > 2.5 * Math.max(40, first), `${view}: the crack out at once (${first} then ${open})`);
    for (let t = 0; t <= CRACK.long; t += 1 / 30) assert.ok(!cyanIn(crackPainted(t, view)), `the crack ${view} @${t.toFixed(2)}: cyan`);
    assert.equal(pixels(crackPainted(CRACK.long + 0.05, view)), 0, `${view}: the crack gone`);
    for (let t = 0; t <= Math.max(KNOCK.long, KNOCK.dust); t += 1 / 30) assert.ok(!cyanIn(knockPainted(t, view)), `the knockback ${view} @${t.toFixed(2)}: cyan`);
    assert.ok(pixels(knockPainted(KNOCK.flash, view)) > 200, `${view}: the knockback's flash`);
    assert.equal(pixels(knockPainted(Math.max(KNOCK.long, KNOCK.dust) + 0.05, view)), 0, `${view}: the knockback gone`);
  }
});
