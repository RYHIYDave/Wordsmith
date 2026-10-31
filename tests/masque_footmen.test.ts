// FLOOR 17'S FOOTMEN (src/art/masque_footmen.ts, their look; src/art/masque_footmen_moves.ts, their moves;
// src/art/masque_footmen_fx.ts, the tray in flight and the candles' fire). A MOCK-UP: NOT IN THE GAME, behind FOOTMEN_ON,
// off. His pick for how they move, “Brisk and stiff (Recommended)”; the brief as offered (art/masque_footmen.ts has it);
// his rulebook (every boss and every mob through every check, How art is made 7; real shapes, rule 9); his Movement 9
// for every enemy from the Princess on (“Start from now on”); and his sizes and speeds of 28 Oct (“It’s all too slow and
// too narrow and too small”). Held as floor 16's palace guard and Princess are (tests/palace_guard.test.ts,
// tests/princess.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), both blows: every frame, from in front and from
//      behind, and every handover;
//   3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it
//      smeared, no other frame;
//   4. every frame paints both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel whole
//      or empty but the edge;
//   5. NOTHING CUT OFF;
//   6. NOTHING OF HIM IN THE FLOOR: all he wears and carries;
//   7. THE LIVERY: every colour of his clear of the enemy's pink and the friend's cyan; no pink on him but his eyes;
//   8. THE HUSH leaking out of him while he lives; a great breath of it as it leaves him; none once he is still;
//   9. HIS MARKS: the powdered wig and the silver tray (on his hand in every frame but while it flies), white gloves, no
//      armour; the dull pink in his eyes while he lives, gone once he is down;
//  10. THE CANDLES: an honest flame in every frame while he holds them, their light orange, out once they fall; the warning a
//      pink glint on what he strikes with;
//  11. HIS SIZE AND SPEED: a little taller than the knight; marching faster than the knight walks, painted for that pace;
//  12. THE TRAY FLUNG: it leaves his hand as the blow lands and is caught again; it flies six tiles out and back round a
//      loop two tiles and more across, spinning; in the air it has the enemy's edge, nothing cyan, every pixel whole;
//  13. THE CANDELABRUM'S FIRE: out in two frames, three tiles and a third of a turn across; honest fire, nothing cyan, no
//      pink; gone at its end;
//  14. HIS DEATH (his pick of 30 Oct, “Yes, these (Recommended)”): rigid a moment, then over backwards like a plank, hinged at
//      his heels, the line from heel to head straight as he falls; flat on his back, a little bounce, then still; his
//      handover into it from his stand and his march at any frame, and from struck; the tray flies from his hand, comes
//      down on its rim, rolls round and round on it, flatter and flatter, and lies still, flat, face up, never in the floor;
//      the tray and the candelabrum lie clear of him, both ways round;
//  15. NOTHING FOLDS FLAT: no round thing he wears collapses into a sheet that spins.
//   run: tsx --test tests/masque_footmen.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import type { Handover } from '../src/art/boss_checks';
import { HUSH } from '../src/art/crier';
import { BREATH_PALE } from '../src/art/hushed';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { CANDLE, CANDLE_LIGHT, COAT, CRIMSON, FOOTMAN_BODY, FOOTMAN_CANVAS, FOOTMEN_ON, GILT, GLOVE, LACE, SILK, SILVER, SMEAR, TRAY, WAX, WIG } from '../src/art/masque_footmen';
import { FIRE_FX, TRAY_FX, firePainted, trayShotPainted } from '../src/art/masque_footmen_fx';
import { FM_DIES, FM_PACE, FM_SHAPE, FM_STRIKES, FM_SWING, FM_THROW, FOOTMAN, TRAY_FLIGHT, smearedAt, trayFlight, trayLooseAt } from '../src/art/masque_footmen_moves';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { KNIGHT_BODY } from '../src/art/moves3';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
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
const MOB: Mob = FOOTMAN;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
/** Hue (degrees), saturation and value of a colour. */
function hsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0, max / 255];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max, max / 255];
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const [h, s, v] = hsv(r, g, b);
  return v >= 150 / 255 && s >= 0.45 && h >= 165 && h <= 205;
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
/** The enemy's pink, strong: hues 300 to 350, saturated and bright. */
const pinkish = (r: number, g: number, b: number): boolean => {
  const [h, s, v] = hsv(r, g, b);
  return h >= 300 && h <= 350 && s >= 0.4 && v >= 0.35;
};
const lerp = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const pixels = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
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
  assert.equal(FOOTMEN_ON.on, false, 'FOOTMEN_ON is off');
  const users: string[] = [];
  const theirs = /^art\/masque_footmen(_moves|_fx)?$/;
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

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover, both blows', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,candelabrum');
  const found = checkBoss(MOB, FM_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(FM_STRIKES).sort().join(','), 'attack,candelabrum');
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(FM_STRIKES)) {
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
  for (const { move, view, t, p } of PAINTED) if (!FM_STRIKES[move] && smearIn(p) > 0) faults.push(`${said(move, view, t)}: smeared`);
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge', () => {
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
    if (n < 400 || cyanIn(p) || odd || (alive ? rim < 40 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${FOOTMAN_CANVAS.w}x${FOOTMAN_CANVAS.h}`);
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
/** What leaves him as he dies (the tray flies, the candelabrum falls: each held to its own way, and to lying clear of him, in 14). */
const FALLEN = new Set(['tray', 'candelabrum']);
const fallenAt = (piece: string, t: number): boolean => FALLEN.has(piece) && t >= (piece === 'tray' ? FM_DIES.drop : FM_DIES.dropC);

test('6. NOTHING OF HIM IN THE FLOOR: all he wears and carries', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      const bits: Bit[] = MOB.bits(st, at(move, t)).filter((b) => !(move === 'dying' && fallenAt(b.piece, t)));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. THE LIVERY: every colour of his clear of the enemy\'s pink (hues 300 to 350) and the friend\'s cyan (160 to 205); no pink on him but his eyes', () => {
  for (const [name, ramp] of Object.entries({ COAT, LACE, CRIMSON, SILK, GLOVE, WIG, SILVER, GILT, WAX, CANDLE })) {
    for (const c of ramp) {
      const [r, g, b] = rgba(c);
      const [h, s] = hsv(r, g, b);
      assert.ok(!(s >= 0.35 && h >= 300 && h <= 350), `${name} ${c}: pink`);
      assert.ok(!(s >= 0.35 && h >= 160 && h <= 205), `${name} ${c}: cyan`);
    }
  }
  const eyes = new Set([rgba(FLAME[1]).slice(0, 3).join(',')]);
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { d } = p.px;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && pinkish(d[i], d[i + 1], d[i + 2]) && !eyes.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
    if (n) faults.push(`${said(move, view, t)}: ${n} pixels of pink`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

/** The Hush coming out of him at a moment: what of his grains is the Hush's colours. */
const HUSHES = new Set([BREATH_PALE, ...HUSH].map((c) => c.toLowerCase()));
function breathAt(st: Stage, m: Moment): number {
  MOB.bits(st, m);
  return (MOB.grains?.(st, m) ?? []).filter(([, c]) => HUSHES.has(c.toLowerCase())).length;
}

test('8. THE HUSH leaking out of him while he lives; a great breath of it as it leaves him; none once he is still', () => {
  const st = stageOf();
  let most = 0;
  let frames = 0;
  let some = 0;
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const n = breathAt(st, at(move, t));
      frames++;
      if (n > 0) some++;
      most = Math.max(most, n);
    }
  }
  assert.ok(some > 0.9 * frames, `the Hush leaking in ${some} of ${frames} living frames`);
  let great = 0;
  // (the great breath once he is down on his back, rising out of him)
  for (let t = FM_DIES.breath[0]; t <= FM_DIES.breath[1]; t += 0.05) great = Math.max(great, breathAt(st, dyingMoment(MOB, t)));
  assert.ok(FM_DIES.breath[0] >= FM_DIES.land, 'the Hush leaves him once he is down');
  assert.ok(great >= 1.5 * most, `the Hush leaving him, ${great} at most; the most while he lives, ${most}`);
  for (let t = FM_DIES.breath[1] + 0.01; t <= FM_DIES.long + 1e-9; t += 0.05) assert.equal(breathAt(st, dyingMoment(MOB, t)), 0, `@${t.toFixed(2)}: the Hush still coming out`);
});

test('9. HIS MARKS: the powdered wig and the silver tray, white gloves, no armour; the dull pink in his eyes while he lives, gone once he is down', () => {
  const st = stageOf();
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const bits = MOB.bits(st, at(move, t));
      const flung = move === 'attack' && t > FM_THROW.hit + 1e-6 && t < FM_THROW.catch - 1e-6;
      assert.ok(bits.some((b) => b.piece === 'wig') && bits.some((b) => b.piece === 'rolls') && bits.some((b) => b.piece === 'queue'), `${move} @${t.toFixed(2)}: no wig`);
      assert.equal(bits.some((b) => b.piece === 'tray'), !flung, `${move} @${t.toFixed(2)}: the tray ${flung ? 'on his hand while it flies' : 'not on his hand'}`);
      assert.ok(pinkEyes(bits), `${move} @${t.toFixed(2)}: no pink in his eyes`);
      for (const b of bits) {
        assert.ok(!/steel|helm|cuirass|plume|pauldron|tasset|gorget|visor|armou?r/i.test(b.part + ' ' + b.piece), `${move}: armour (${b.part} ${b.piece})`);
        if (/^(hand|finger)[LR]$/.test(b.piece) && b.shape.k === 'rod') assert.equal(b.shape.ramp, GLOVE, `${move}: his ${b.piece} not gloved white`);
      }
    }
  }
  for (let t = FM_DIES.land; t <= FM_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(MOB.bits(st, dyingMoment(MOB, t))), `@${t.toFixed(2)}: the pink still in his eyes`);
});

test('10. THE CANDLES: an honest flame in every frame while he holds them, their light orange, out once they fall; the warning a pink glint on what he strikes with', () => {
  const st = stageOf();
  const flames = new Set(CANDLE.map((c) => c.toLowerCase()));
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const m = at(move, t);
      const bits = MOB.bits(st, m);
      const grains = MOB.grains?.(st, m) ?? [];
      const fire = grains.filter(([, c]) => flames.has(c.toLowerCase()));
      assert.ok(fire.length >= 9, `${move} @${t.toFixed(2)}: his candles not burning (${fire.length})`);
      const light = bits.filter((b) => b.shape.k === 'glow' && b.part === 'light');
      assert.ok(light.length === 1 && light[0].shape.k === 'glow' && light[0].shape.c === CANDLE_LIGHT, `${move} @${t.toFixed(2)}: their light`);
    }
  }
  const [lr, lg, lb] = rgba(CANDLE_LIGHT);
  const [lh] = hsv(lr, lg, lb);
  assert.ok(lh >= 15 && lh <= 45, `their light ${CANDLE_LIGHT} not orange`);
  for (let t = FM_DIES.dropC; t <= FM_DIES.long + 1e-9; t += 0.1) {
    const m = dyingMoment(MOB, t);
    MOB.bits(st, m);
    assert.equal((MOB.grains?.(st, m) ?? []).filter(([, c]) => flames.has(c.toLowerCase())).length, 0, `@${t.toFixed(2)}: his candles still burning once fallen`);
  }
  // (the warning: a pink glint on the tray as he coils, on the candelabrum as he holds it high)
  for (const [move, warn, piece] of [['attack', FM_THROW.warn, 'tray'], ['candelabrum', FM_SWING.warn, 'candelabrum']] as const) {
    const t = (warn[0] + warn[1]) / 2;
    const glint = MOB.bits(st, at(move, t)).find((b) => b.part === 'glint' && b.piece === piece);
    assert.ok(glint && glint.shape.k === 'glow' && glint.shape.c === FLAME[1], `${move}: no pink glint on the ${piece} in its warning`);
  }
});

test('11. HIS SIZE AND SPEED: a little taller than the knight; marching faster than the knight walks, painted for that pace', () => {
  assert.ok(FOOTMAN_BODY.tall > KNIGHT_BODY.tall && FOOTMAN_BODY.tall <= KNIGHT_BODY.tall + 6, `${FOOTMAN_BODY.tall} tall, the knight ${KNIGHT_BODY.tall}`);
  const s = skeletonAt(MOB, 'stand', 0);
  assert.ok(s.head[2] + FOOTMAN_BODY.headR[2] > KNIGHT_BODY.tall, `his crown at ${(s.head[2] + FOOTMAN_BODY.headR[2]).toFixed(1)}`);
  assert.ok(FM_PACE > 2.5, `he marches ${FM_PACE} tiles a second (the knight walks 2.5)`);
  assert.equal(MOB.walk.ground, FM_PACE * TILE3, 'his march painted for his pace');
});

test('12. THE TRAY FLUNG: it leaves his hand as the blow lands and is caught again; six tiles out and back round a loop two tiles and more across, spinning; in the air, the enemy\'s edge, nothing cyan, every pixel whole', () => {
  const T = TRAY_FLIGHT.long;
  assert.ok(T > 0.5 && T < 1.2, `its flight ${T.toFixed(2)} s`);
  let far = 0;
  let left = 0;
  let right = 0;
  for (let t = 0; t <= T + 1e-9; t += 1 / 60) {
    const f = trayFlight(t).c;
    far = Math.max(far, Math.hypot(f[0], f[1]));
    left = Math.max(left, f[1]);
    right = Math.min(right, f[1]);
    assert.ok(f[2] > 12, `@${t.toFixed(2)}: the tray down at ${f[2].toFixed(1)}`);
  }
  assert.ok(far >= 6 * TILE3 - 1e-6, `it flies ${(far / TILE3).toFixed(1)} tiles out`);
  assert.ok(left - right >= 2 * TILE3, `its loop ${((left - right) / TILE3).toFixed(1)} tiles across`);
  assert.ok(TRAY_FX.reach >= 6 * TILE3 - 1e-6);
  assert.ok(trayFlight(T).spin - trayFlight(0).spin >= 2, 'it spins as it flies');
  const [r, g, b] = rgba(ENEMY_RIM);
  for (const view of VIEWS) {
    for (let t = 0; t <= T; t += 0.1) {
      const p = trayShotPainted(trayFlight(t), view, [trayFlight(Math.max(0, t - 0.02)).c]);
      let rim = 0;
      let odd = 0;
      const { d } = p.px;
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
        if (d[i + 3] === RIM_ALPHA && d[i] === r && d[i + 1] === g && d[i + 2] === b) rim++;
      }
      assert.ok(pixels(p) > 60 && rim > 10 && !odd && !cyanIn(p), `the tray in the air ${view} @${t.toFixed(1)}: ${pixels(p)} pixels, ${rim} of its edge, ${odd} neither whole nor empty`);
    }
  }
});

test('13. THE CANDELABRUM\'S FIRE: out in two frames, three tiles out and a third of a turn across; honest fire, nothing cyan, no pink; gone at its end', () => {
  assert.ok(FIRE_FX.r >= 3 * TILE3 - 1e-6 && FIRE_FX.spread >= 120, `${(FIRE_FX.r / TILE3).toFixed(1)} tiles, ${FIRE_FX.spread} degrees`);
  const [b0, b1] = FIRE_FX.burst;
  assert.equal(Math.round((b1 - b0) * 30), 2, 'it bursts out in two frames');
  for (const view of VIEWS) {
    const before = pixels(firePainted(b0, view));
    const out = pixels(firePainted(b1 + 0.02, view));
    assert.ok(out > 4 * Math.max(40, before), `${view}: out at once (${before} then ${out})`);
    for (let t = 0; t <= FIRE_FX.long; t += 1 / 30) {
      const p = firePainted(t, view);
      assert.ok(!cyanIn(p), `${view} @${t.toFixed(2)}: cyan`);
      const { d } = p.px;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] && pinkish(d[i], d[i + 1], d[i + 2])) assert.ok(false, `${view} @${t.toFixed(2)}: pink fire`);
      for (const l of p.lights) assert.equal(l.color, CANDLE_LIGHT, 'its light the candles\' orange');
    }
    assert.equal(pixels(firePainted(FIRE_FX.long + 0.05, view)), 0, `${view}: gone at its end`);
  }
});

test('14. HIS DEATH: rigid, then over backwards like a plank, flat on his back; the tray flies, rolls round on its rim and lies still; all clear of him', () => {
  const D = FM_DIES;
  const at = (t: number) => skeletonAt(MOB, 'dying', t);
  const xz = (p: V3): [number, number] => [p[0], p[2]];
  // RIGID A MOMENT: from when he seizes to when he tips, upright, his head hardly moving (but the shiver), his arms at his sides
  const r0 = at(D.rigid);
  for (let t = D.rigid; t <= D.tip + 1e-9; t += 0.02) {
    const s = at(t);
    assert.ok(Math.hypot(s.head[0] - r0.head[0], s.head[1] - r0.head[1], s.head[2] - r0.head[2]) < 2.0, `@${t.toFixed(2)}: not held rigid (his head ${Math.hypot(s.head[0] - r0.head[0], s.head[1] - r0.head[1], s.head[2] - r0.head[2]).toFixed(2)} from where it was)`);
    for (const [h, sh] of [[s.handL, s.shoulderL], [s.handR, s.shoulderR]] as const) assert.ok(sh[2] - h[2] > 20, `@${t.toFixed(2)}: his arms not at his sides`);
  }
  assert.ok(D.tip - D.rigid >= 0.25, `held rigid ${(D.tip - D.rigid).toFixed(2)} s`);
  // (and the last stiff shiver through him, seen: his head trembles a little as he stands rigid)
  let shiver = 0;
  for (let t = D.shiver[0]; t <= D.shiver[1]; t += 1 / 60) shiver = Math.max(shiver, Math.hypot(at(t).head[1] - r0.head[1], at(t).head[0] - r0.head[0]));
  assert.ok(shiver > 0.6, `his shiver ${shiver.toFixed(2)}`);
  // OVER LIKE A PLANK: hinged at his heels (they stay where they stood); his line from ankle to head straight all the way
  // down (nothing of him more than a little off it: his hips, his knees, his chest, his neck), and quick
  const h0 = at(0);
  let leaned = 0;
  for (let t = D.tip; t <= D.long + 1e-9; t += 1 / 60) {
    const s = at(t);
    for (const [a, b] of [[s.heelL, h0.heelL], [s.heelR, h0.heelR]] as const) assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.8, `@${t.toFixed(2)}: a heel off its spot`);
    if (t > D.land + 1e-9) continue;
    const [hx, hz] = xz(lerp(s.ankleL, s.ankleR));
    const [tx, tz] = xz(s.head);
    const L = Math.hypot(tx - hx, tz - hz);
    for (const [name, p] of [['hips', s.pelvis], ['knee', lerp(s.kneeL, s.kneeR)], ['chest', s.ribs], ['neck', s.neck]] as const) {
      const [px, pz] = xz(p);
      const off = Math.abs((px - hx) * (tz - hz) - (pz - hz) * (tx - hx)) / L;
      assert.ok(off < 3.5, `@${t.toFixed(2)}: his ${name} ${off.toFixed(1)} off the line from ankle to head: not a plank`);
    }
    leaned = Math.max(leaned, (Math.atan2(hx - tx, tz - hz) * 180) / Math.PI);
  }
  assert.ok(leaned > 75, `he goes over ${leaned.toFixed(0)} degrees`);
  assert.ok(D.land - D.tip < 0.7, `his fall ${(D.land - D.tip).toFixed(2)} s: quick`);
  // FLAT ON HIS BACK, his head toward where his back was, his chest's front to the sky; a little bounce, and still
  const e = at(D.long);
  assert.ok(e.head[0] < -50 && e.head[2] < 10 && e.ribs[2] < 9 && e.pelvis[2] < 9 && Math.max(e.kneeL[2], e.kneeR[2]) < 9, `not lying: head ${e.head.map((v) => v.toFixed(1))}, hips ${e.pelvis[2].toFixed(1)} up`);
  assert.ok(e.chest[0][2] > 0.9, `not on his back: his chest faces ${e.chest[0].map((v) => v.toFixed(2))}`);
  const lift = Math.max(...[0.04, 0.07, 0.1].map((u) => at(D.land + u).ribs[2] - at(D.land).ribs[2]));
  assert.ok(lift > 0.3 && lift < 3, `his bounce: up ${lift.toFixed(2)}`);
  const still = at(D.ease[1] + 0.02);
  assert.ok(Math.hypot(...sub3(still.head, e.head)) < 1e-6 && Math.hypot(...sub3(still.handL, e.handL)) < 1e-6, 'still once the rigidity has gone out of him');
  // HIS HANDOVER INTO IT: from every frame of his stand and his march, and from struck as it starts and as it ends
  const handovers: Handover[] = [
    ...framesOf(MOB, 'stand').map((t): Handover => ({ from: 'stand', at: t, to: 'dying', toAt: 0 })),
    ...framesOf(MOB, 'walk').map((t): Handover => ({ from: 'walk', at: t, to: 'dying', toAt: 0 })),
    { from: 'reel', at: 0, to: 'dying', toAt: 0 },
    { from: 'reel', at: 'end', to: 'dying', toAt: 0 },
  ];
  const jumps = checkBoss(MOB, { ...FM_SHAPE, handovers }, ['dying']);
  assert.equal(jumps.length, 0, findingsSaid(jumps).slice(0, 8).join('; '));
  // THE TRAY: on his hand until he seizes; flung up and away; down on its rim; round and round on it, flatter and flatter;
  // flat on its back, face up, and still; never in the floor
  assert.equal(trayLooseAt(D.drop - 0.01), null, 'the tray loose before it leaves his hand');
  const tilt = (t: number): number => (Math.acos(Math.max(-1, Math.min(1, (trayLooseAt(t) as { n: V3 }).n[2]))) * 180) / Math.PI;
  const flung = trayLooseAt(D.drop + 0.1) as { c: V3 };
  assert.ok(flung.c[2] > (trayLooseAt(D.drop) as { c: V3 }).c[2], 'the tray not flung up from his hand');
  assert.ok(tilt(D.trayDown + 0.01) > 55, `it comes down tipped ${tilt(D.trayDown + 0.01).toFixed(0)} degrees: not on its rim`);
  let rounds = 0;
  let was = Math.atan2((trayLooseAt(D.trayDown) as { n: V3 }).n[1], (trayLooseAt(D.trayDown) as { n: V3 }).n[0]);
  let prevTilt = tilt(D.trayDown + 0.08);
  let lowest = Infinity;
  for (let t = D.drop; t <= D.long + 1e-9; t += 1 / 120) {
    const tr = trayLooseAt(t) as { c: V3; n: V3; u: V3 };
    // (the lowest of it: its rolled rim all round, and the edge of its bed)
    const v = cross3(tr.n, tr.u);
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * Math.PI * 2;
      const rim = tr.c[2] + 0.97 * TRAY.r * (tr.u[2] * Math.cos(a) + v[2] * Math.sin(a)) + 0.35 * tr.n[2];
      const bed = tr.c[2] + TRAY.r * (tr.u[2] * Math.cos(a) + v[2] * Math.sin(a));
      lowest = Math.min(lowest, rim - 0.55, bed);
    }
    if (t > D.trayDown + 0.08 && t < D.trayStill) {
      const now = Math.atan2(tr.n[1], tr.n[0]);
      let d = now - was;
      d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
      rounds += d / (2 * Math.PI);
      was = now;
      const th = tilt(t);
      assert.ok(th <= prevTilt + 1e-6, `@${t.toFixed(2)}: the tray tipping up again`);
      prevTilt = th;
    }
  }
  assert.ok(lowest > -0.1, `the tray ${(-lowest).toFixed(2)} into the floor`);
  assert.ok(Math.abs(rounds) >= 4, `it goes round on its rim ${rounds.toFixed(1)} times`);
  const flat = trayLooseAt(D.trayStill + 0.01) as { c: V3; n: V3; u: V3 };
  const end = trayLooseAt(D.long) as { c: V3; n: V3; u: V3 };
  assert.ok(flat.n[2] > 0.9999, 'the tray not lying flat, face up');
  assert.ok(Math.hypot(...sub3(flat.c, end.c)) < 1e-9 && Math.hypot(...sub3(flat.u, end.u)) < 1e-9, 'the tray not still');
  assert.ok(D.trayStill > D.land + 0.6 && D.trayStill < D.long - 0.3, 'the tray settles after he is down, and lies still a while');
  // WHAT LEFT HIM LIES CLEAR OF HIM, both ways round: him alone, and the tray and the candelabrum alone, never on the same pixel
  assert.ok(MOB.fall?.('candelabrum'), 'the candelabrum falls');
  const him: Mob = { ...MOB, id: 'fm-him', bits: (st, m) => MOB.bits(st, m).filter((b) => !FALLEN.has(b.piece)) };
  // (what left him alone: without the Hush still leaving him, which is his)
  const pieces: Mob = { ...MOB, id: 'fm-pieces', bits: (st, m) => MOB.bits(st, m).filter((b) => FALLEN.has(b.piece)), grains: () => [] };
  for (const view of VIEWS) {
    for (let k = (D.land + 0.05) / MOB.dieTime; k <= 1 + 1e-9; k += 0.04) {
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
      assert.ok(mine > 500 && theirs > 30, `${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what left him`);
      assert.equal(both, 0, `${view} @${k.toFixed(2)}: what left him lies over him or under him by ${both} pixels`);
    }
  }
});

test('15. NOTHING FOLDS FLAT: in every frame of every move, no round thing he wears collapses into a flat sheet that spins', () => {
  const st = stageOf();
  const faults: string[] = [];
  const flatByDesign = new Set<string>();
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(move, t))) {
        if (b.shape.k !== 'ball' || flatByDesign.has(b.piece)) continue;
        const [x, y, z] = b.shape.ax;
        const det = x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0]);
        const lens = Math.hypot(...x) * Math.hypot(...y) * Math.hypot(...z);
        if (lens > 0 && Math.abs(det) / lens < 0.5) faults.push(`${move} @${t.toFixed(2)}: ${b.piece} ${(Math.abs(det) / lens).toFixed(2)} square`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});
