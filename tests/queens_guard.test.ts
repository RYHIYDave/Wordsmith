// FLOOR 18'S QUEEN'S GUARD (src/art/queens_guard.ts, their look; src/art/queens_guard_moves.ts, their moves;
// src/art/queens_guard_fx.ts, what their blows leave on the floor). A MOCK-UP: NOT IN THE GAME, behind QGUARD_ON, off. The
// brief as offered (art/queens_guard.ts), his pick for how they move, “Measured, then a sudden charge (Recommended)”, his
// rulebook's Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”; for the
// enemies, “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for
// the extra time the player gets to evade”), and his words on speed and size of 28 Oct. Held as the Princess and the
// palace guard are (tests/princess.test.ts, tests/palace_guard.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and from behind,
//      and every handover (the march and the stand into the charge, into its loop, out of it, into a blow);
//   3. HIS LIGHTNING STRIKES: both blows wind up, hold, strike in two frames and land on the second; the strike's frames,
//      and the one after it, carry its smear; no other frame does;
//   4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel
//      whole or empty but the edge (crisp);
//   5. NOTHING CUT OFF;
//   6. NOTHING OF THEM IN THE FLOOR: all they wear and carry (what falls from them as they die, apart);
//   7. THE HUSH leaking out of the visor while they live, a great breath of it as it leaves them, none at the end; the dull
//      pink in the slit while they live, gone once it has left them; and down at the end, slumped, not lying (alive);
//   8. what falls from them as they die (the halberd, the cracked shield) lies clear of them;
//   9. THE BRIEF: a head taller than the knight; the glass spikes round the helm; the mirror shield, a mirror; no tabard,
//      no swan; two blows; the shield cracks like glass as they die, to one knee (the right knee down, the left up),
//      then down;
//  10. HIS SPEEDS AND SIZES IN TILES: the march slow, the charge sudden and fast (six tiles a second, six times the march),
//      each painted for its pace; the chop's axe biting two tiles out, its line six and a half long and more than a tile
//      and a half wide, out in two frames; the shield charge carrying them three tiles in two frames, its ring three tiles
//      across, out in two frames; nothing cyan in either;
//  11. NOTHING FOLDS FLAT (his “what’s the thing that flips around like crazy on the death animation?”, of floor 16's guard).
//   run: tsx --test tests/queens_guard.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { KNIGHT_BODY } from '../src/art/moves3';
import { GLASS, MIRROR, QG_BODY, QG_CANVAS, QG_HALBERD, QG_SPIKES, QGUARD_ON, halberdOf } from '../src/art/queens_guard';
import { QG_BASH, QG_CHARGE, QG_CHARGE_IN, QG_CHARGE_OUT, QG_CHOP, QG_DIES, QG_MARCH, QG_SHAPE, QG_STRIKES, QG_WALK, QUEENS_GUARD, bashCarried, smearedAt } from '../src/art/queens_guard_moves';
import { BASH_FX, CHOP_FX, bashPainted, chopPainted } from '../src/art/queens_guard_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
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
const MOB: Mob = QUEENS_GUARD;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
/** The friend's cyan, as his rule has it: any strong colour of a hue from 160 to 205. */
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

/** Every frame of every move of theirs (the game's frames of each: framesOf), painted on their whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;
/** The smear's own colours (art/queens_guard.ts QG_SMEAR). */
const SMEAR = new Set(['#6e6c9a', '#c2c2e4', '#f4f4ff'].map((c) => rgba(c).slice(0, 3).join(',')));
const smearIn = (p: Painted): number => {
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && SMEAR.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};
const pixels = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(QGUARD_ON.on, false, 'QGUARD_ON is off');
  const users: string[] = [];
  const theirs = /^art\/queens_guard(_moves|_fx)?$/;
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
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,chargeIn,charge,chargeOut,bash');
  const found = checkBoss(MOB, QG_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
  // (and the march and the stand into the charge, into its loop and out of it into either blow, are among the handovers)
  const h = (QG_SHAPE.handovers ?? []).map((x) => `${x.from}>${x.to}`);
  for (const w of ['stand>chargeIn', 'walk>chargeIn', 'chargeIn>charge', 'charge>chargeOut', 'chargeOut>stand', 'chargeOut>attack', 'chargeOut>bash', 'bash>stand', 'attack>stand']) assert.ok(h.includes(w), `the handover ${w}`);
});

test('3. HIS LIGHTNING STRIKES: both blows strike in two frames and land on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(QG_STRIKES).sort().join(','), 'attack,bash');
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(QG_STRIKES)) {
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
  for (const { move, view, t, p } of PAINTED) if (!QG_STRIKES[move] && smearIn(p) > 0) faults.push(`${said(move, view, t)}: smeared`);
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  // (the warning held long and the wind-down long: each blow's wind-up a good half second, its strike a fifteenth)
  for (const [move, warn] of [['attack', QG_CHOP.warn], ['bash', QG_BASH.warn]] as const) assert.ok(warn[1] - warn[0] >= 0.35, `${move}: its warning held ${(warn[1] - warn[0]).toFixed(2)} s`);
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel whole or empty but the edge', () => {
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

test('5. NOTHING CUT OFF: in every frame, both ways round, they (and the halberd at its highest and furthest, and the shield charge’s streaks) are inside their picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${QG_CANVAS.w}x${QG_CANVAS.h}`);
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
  assert.ok(least >= ROOM, `the nearest they come to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all); a panel by the outline its skin draws, not its box. */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  else if (sh.k === 'panel') {
    const lu = Math.hypot(...sh.u);
    const lv = Math.hypot(...sh.v);
    for (let i = -20; i <= 20; i++) {
      for (let j = -20; j <= 20; j++) {
        const a = i / 20;
        const b = j / 20;
        if (!sh.skin(a * lu, b * lv, true, 2)) continue;
        z = Math.min(z, sh.c[2] + a * sh.u[2] + b * sh.v[2]);
      }
    }
  }
  return Math.max(0, -z);
}

test('6. NOTHING OF THEM IN THE FLOOR: all they wear and carry (what falls from them as they die apart: test 8)', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      const bits: Bit[] = MOB.bits(st, at(move, t)).filter((b) => !(move === 'dying' && ((b.piece === 'halberd' && t >= QG_DIES.drop) || (b.piece === 'shield' && t >= QG_DIES.shield))));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** The Hush coming out of them at a moment: their grains of its greys (not the glass, not the flash). */
const HUSHY = new Set(['#b6b0cc', '#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4']);
function hushAt(st: Stage, m: Moment): number {
  MOB.bits(st, m);
  return (MOB.grains?.(st, m) ?? []).filter(([, c]) => HUSHY.has(c)).length;
}

test('7. THE HUSH leaking out of them while they live, a great breath as it leaves them, none at the end; the pink in the slit until it has left them; down at the end, slumped, not lying', () => {
  const st = stageOf();
  let most = 0;
  let frames = 0;
  let some = 0;
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const n = hushAt(st, at(move, t));
      frames++;
      if (n > 0) some++;
      most = Math.max(most, n);
    }
  }
  assert.ok(some > 0.9 * frames, `the Hush leaking in ${some} of ${frames} living frames`);
  let great = 0;
  for (let t = QG_DIES.gasp; t <= QG_DIES.gasp + 0.8; t += 0.05) great = Math.max(great, hushAt(st, dyingMoment(MOB, t)));
  assert.ok(great >= 1.5 * most, `the Hush leaving them, ${great} at most; the most while they live, ${most}`);
  for (let t = 2.6; t <= QG_DIES.long + 1e-9; t += 0.05) assert.equal(hushAt(st, dyingMoment(MOB, t)), 0, `@${t.toFixed(2)}: the Hush still coming out`);
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) for (const t of framesOf(MOB, move)) assert.ok(pinkEyes(MOB.bits(st, at(move, t))), `${move} @${t.toFixed(2)}: no pink in the slit`);
  assert.ok(pinkEyes(MOB.bits(st, dyingMoment(MOB, 0.3))), 'the pink still there as the shield cracks');
  for (let t = 1.8; t <= QG_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(MOB.bits(st, dyingMoment(MOB, t))), `@${t.toFixed(2)}: the pink still in the slit`);
  // (down: slumped and bowed, sat back on their heels: low, but their head well up off the floor, alive)
  const s = skeletonAt(MOB, 'dying', QG_DIES.long);
  assert.ok(Math.max(s.kneeL[2], s.kneeR[2]) < 6, `both knees down (${s.kneeL[2].toFixed(1)}, ${s.kneeR[2].toFixed(1)})`);
  assert.ok(s.pelvis[2] < 18, `sat back: their hips ${s.pelvis[2].toFixed(1)} up`);
  assert.ok(s.head[2] > 16 && s.head[2] < 40, `bowed, not lying: their head ${s.head[2].toFixed(1)} up`);
});

test('8. what falls from them as they die (the halberd, the cracked shield) lies clear of them, from in front and from behind', () => {
  const fallen = new Set(['halberd', 'shield']);
  const him: Mob = { ...MOB, fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; }, grains: () => [] };
  const pieces: Mob = { ...MOB, bits: (st, m) => MOB.bits(st, m).filter((b) => fallen.has(b.piece)), grains: () => [] };
  const down = (QG_DIES.down[1] + 0.1) / MOB.dieTime;
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
      assert.ok(mine > 500 && theirs > 60, `${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what fell`);
      assert.equal(both, 0, `${view} @${k.toFixed(2)}: what fell lies over him or under him by ${both} pixels`);
    }
  }
});

test('9. THE BRIEF: a head taller than the knight; the glass crown; a mirror for a shield; no tabard, no swan; two blows; the shield cracks like glass, to one knee, then down', () => {
  const st = stageOf();
  // a head taller: the top of the helm (not its spikes) over the knight's height by about a head
  const s0 = skeletonAt(MOB, 'stand', 0);
  const top = s0.head[2] + QG_BODY.headR[2] * 1.08 + 0.2;
  assert.ok(top > KNIGHT_BODY.tall + 6 && top < KNIGHT_BODY.tall + 18, `the helm's top at ${top.toFixed(1)}, the knight ${KNIGHT_BODY.tall}`);
  // the glass spikes round the helm, the tallest at the brow, all of the glass's colours (not cyan)
  const bits = MOB.bits(st, at('stand', 0));
  const spikes = bits.filter((b) => b.piece === 'spike' && b.shape.k === 'rod' && b.shape.ramp === GLASS);
  assert.equal(spikes.length, QG_SPIKES.length, 'a spike of glass for each of the crown’s');
  assert.ok(QG_SPIKES[0][0] === 0 && QG_SPIKES.every(([, h]) => h <= QG_SPIKES[0][1]), 'the tallest at the brow');
  for (const c of GLASS) assert.ok(!cyanGlow(...(rgba(c).slice(0, 3) as [number, number, number])), `the glass in cyan, ${c}`);
  // a mirror: standing, from in front, a good share of the shield's face shows the mirror's own colours, both light and dark
  const front = paintMob(MOB, 'stand', 0, 'front').px.d;
  const want = new Map(Object.entries(MIRROR).map(([k, c]) => [rgba(c).slice(0, 3).join(','), k]));
  const seen = new Map<string, number>();
  for (let i = 0; i < front.length; i += 4) {
    const k = want.get(`${front[i]},${front[i + 1]},${front[i + 2]}`);
    if (k && front[i + 3] === 255) seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  const all = [...seen.values()].reduce((a, b) => a + b, 0);
  assert.ok(all > 80 && seen.size >= 4, `the mirror: ${all} pixels of its colours, ${[...seen.keys()].join(' ')}`);
  // never floor 16's palace guard: no tabard, no crest, no swan, no plume
  for (const move of [...LIVING, 'dying']) for (const b of MOB.bits(st, at(move, 0.4))) assert.ok(!/tabard|crest|swan|plume/i.test(b.part + b.piece), `${move}: ${b.part} ${b.piece}`);
  // two blows
  assert.ok(MOB.attack && MOB.more?.bash, 'the halberd chop and the shield charge');
  // the shield cracks like glass: whole as they stand, cracked through by the time the halberd drops (its split's dark and bright lip)
  const CRACKS = new Set(['#120e1c', '#f1eefc'].map((c) => rgba(c).slice(0, 3).join(',')));
  const crackPx = (p: Painted): number => {
    let n = 0;
    for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] === 255 && CRACKS.has(`${p.px.d[i]},${p.px.d[i + 1]},${p.px.d[i + 2]}`)) n++;
    return n;
  };
  assert.equal(crackPx(paintMob(MOB, 'stand', 0, 'front')), 0, 'no crack while they live');
  assert.ok(crackPx(deathOfMob(MOB, QG_DIES.crack[1] / MOB.dieTime, 'front')) > 30, 'the shield cracked across as they die');
  // to one knee (the right knee down, the left up), then down
  const k = skeletonAt(MOB, 'dying', (QG_DIES.hold[0] + QG_DIES.hold[1]) / 2);
  assert.ok(k.kneeR[2] < 4.5, `the right knee down, ${k.kneeR[2].toFixed(1)} up`);
  assert.ok(k.kneeL[2] > 12, `the left knee up, ${k.kneeL[2].toFixed(1)} up`);
});

test('10. HIS SPEEDS AND SIZES IN TILES: a slow march, a sudden fast charge; the chop’s long line; the shield charge’s burst and ring; out in two frames; nothing cyan', () => {
  // measured, then a sudden charge, each painted for its pace
  assert.ok(QG_MARCH <= 1.2, `the march ${QG_MARCH} tiles a second`);
  assert.ok(QG_CHARGE >= 6 && QG_CHARGE >= 5 * QG_MARCH, `the charge ${QG_CHARGE} tiles a second`);
  assert.equal(MOB.walk.ground, QG_MARCH * TILE3, 'the march painted for its pace');
  assert.equal(MOB.more?.charge.ground, QG_CHARGE * TILE3, 'the charge painted for its pace');
  assert.ok(QG_CHARGE_IN.long <= 0.21, `into the charge in ${QG_CHARGE_IN.long} s: sudden`);
  assert.equal(QG_WALK.frames % 3, 0);
  // (and the charge's feet grip the floor at its pace: test 2's SLIDE; its body runs low, its strides long)
  const run = skeletonAt(MOB, 'charge', 0);
  const stand = skeletonAt(MOB, 'stand', 0);
  assert.ok(run.head[2] < stand.head[2] - 5, 'low behind the shield as they charge');
  // THE CHOP: the axe bites the floor two tiles out, the halberd swept through a great arc in its two frames
  const [c0, c1] = QG_CHOP.strike;
  const edge = (t: number): V3 => halberdOf(skeletonAt(MOB, 'attack', t), posedOfMob(MOB, 'attack', t) as unknown as { draw: number }).edge;
  const tip = (t: number): V3 => halberdOf(skeletonAt(MOB, 'attack', t), posedOfMob(MOB, 'attack', t) as unknown as { draw: number }).tip;
  const bite = edge(QG_CHOP.hit);
  assert.ok(bite[0] >= QG_CHOP.bite * TILE3 * 0.95 && bite[2] < 6, `the axe bites ${(bite[0] / TILE3).toFixed(2)} tiles out, ${bite[2].toFixed(1)} up`);
  const ang = (v: V3, s: V3): number => (Math.atan2(v[2] - s[2], v[0] - s[0]) * 180) / Math.PI;
  const hand0 = skeletonAt(MOB, 'attack', c0).handR;
  const hand1 = skeletonAt(MOB, 'attack', c1).handR;
  const swept = ang(tip(c0), hand0) - ang(tip(c1), hand1);
  assert.ok(swept > 120, `the halberd swept ${swept.toFixed(0)} degrees in two frames`);
  assert.ok(QG_CHOP.reach >= 6 && QG_CHOP.wide >= 1.5 && QG_CHOP.from <= QG_CHOP.bite, `the line ${QG_CHOP.from} to ${QG_CHOP.reach} tiles, ${QG_CHOP.wide} wide`);
  assert.ok(QG_HALBERD.long >= 2.5 * TILE3, `the halberd ${(QG_HALBERD.long / TILE3).toFixed(1)} tiles long`);
  // THE SHIELD CHARGE: carried three tiles in its two frames, and its ring three tiles across
  const [b0, b1] = QG_BASH.strike;
  assert.ok(bashCarried(b1) - bashCarried(b0) >= 3 * TILE3 - 1e-6, `carried ${((bashCarried(b1) - bashCarried(b0)) / TILE3).toFixed(1)} tiles in two frames`);
  assert.ok(QG_BASH.ring >= 3, `the ring ${QG_BASH.ring} tiles across`);
  assert.ok(QG_CHARGE_OUT.shift > 0 && QG_BASH.end > 0);
  // what they leave: out in two frames (the line run out to its end, the ring out), nothing cyan, gone by the end
  for (const view of VIEWS) {
    const l0 = pixels(chopPainted(0, view));
    const l2 = pixels(chopPainted(CHOP_FX.run[1], view));
    assert.ok(l2 > 3 * Math.max(60, l0), `${view}: the chop's line out at once (${l0} then ${l2})`);
    const r0 = pixels(bashPainted(0, view));
    const r2 = pixels(bashPainted(BASH_FX.out[1], view));
    assert.ok(r2 > 1.5 * Math.max(60, r0), `${view}: the ring out at once (${r0} then ${r2})`);
    for (let t = 0; t <= CHOP_FX.long; t += 1 / 15) assert.ok(!cyanIn(chopPainted(t, view)), `the chop's line ${view} @${t.toFixed(2)}: cyan`);
    for (let t = 0; t <= BASH_FX.long; t += 1 / 15) assert.ok(!cyanIn(bashPainted(t, view)), `the ring ${view} @${t.toFixed(2)}: cyan`);
    assert.equal(pixels(chopPainted(CHOP_FX.long + 0.05, view)), 0, `${view}: the line gone`);
    assert.equal(pixels(bashPainted(BASH_FX.long + 0.05, view)), 0, `${view}: the ring gone`);
  }
});

test('11. NOTHING FOLDS FLAT: in every frame of every move no round thing they wear collapses into a flat sheet that spins (but the shield, flat by its making)', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(move, t))) {
        if (b.shape.k !== 'ball' || b.piece === 'shield') continue;
        const [x, y, z] = b.shape.ax;
        const det = x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0]);
        const lens = Math.hypot(...x) * Math.hypot(...y) * Math.hypot(...z);
        if (lens > 0 && Math.abs(det) / lens < 0.5) faults.push(`${move} @${t.toFixed(2)}: ${b.piece} ${(Math.abs(det) / lens).toFixed(2)} square`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});
