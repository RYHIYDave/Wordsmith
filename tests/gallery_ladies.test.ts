// FLOOR 18'S LADIES-IN-WAITING (src/art/gallery_ladies.ts, their look; src/art/gallery_ladies_moves.ts, their moves;
// src/art/gallery_ladies_fx.ts, the light their mirrors throw). A MOCK-UP: NOT IN THE GAME, behind LADIES_ON, off. His pick
// for how they move, “Gliding in a line, quick (Recommended)”; the rest of the brief as offered (art/gallery_ladies.ts has
// it); his rulebook's Movement 9 for every enemy from the Princess on (“Start from now on, but every enemy is going to need
// that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”). Held as floor 16's
// gardeners and grooms and its Princess are (tests/palace_hands.test.ts, tests/princess.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF HERS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind,
//      and every handover (the dart setting her down where it ends; the glide into the dart);
//   3. HIS LIGHTNING STRIKE: her flash winds up, holds, strikes in two frames and lands on the second; the strike's
//      frames and the one after it carry its smear; no other frame of any move does;
//   4. every frame paints both ways round: nothing cyan, the pink edge while she lives and none as she dies, every pixel
//      whole or empty but the edge;
//   5. NOTHING CUT OFF: in every frame, both ways round, she (her dart and her beam too) is inside her picture with room;
//   6. NOTHING OF HER IN THE FLOOR, beyond what the checks see: all she wears and carries;
//   7. THE HUSH leaking out of her while she lives; a great breath of it as it leaves her; none once she is still;
//   8. the dull pink in her eyes while she lives, gone out once she is down; down she sinks, low on the floor, but sat up on
//      her knees, alive (not lying dead);
//   9. HER MIRROR: held up to her face as she stands (beside it, at her eyes' height); cracked across before it falls; once
//      fallen, lying clear of her, from in front and from behind;
//  10. HER FLASH: the mirror up over her head in the warning, the glint on it building to its full; thrust out before her
//      at the blow; the beam's light, in the air and on the floor, never cyan (no hue from 160 to 205 that is bright and
//      strong) and never the enemy's pink; on the floor out at once as the blow lands, and gone after;
//  11. HIS SIZES AND SPEEDS: she glides at 3.2 tiles a second (quicker than the knight's 2.5); her dart two and a half
//      tiles, nearly all of it in under half a second; her beam four and a half tiles long and two and a half wide at its
//      end, its light on the floor reaching that far.
//   run: tsx --test tests/gallery_ladies.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { LADIES_ON, LADY_CANVAS, mirrorOf } from '../src/art/gallery_ladies';
import { GALLERY_LADY, LD_DART, LD_DIES, LD_FLASH, LD_PACE, LD_SHAPE, LD_STRIKES, SMEAR, dartAlong, smearedAt } from '../src/art/gallery_ladies_moves';
import { FLASH_CANVAS, FLASH_FX, LIGHT, flashBeam, flashPainted } from '../src/art/gallery_ladies_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import { project } from '../src/art/skeleton';
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
const MOB: Mob = GALLERY_LADY;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
/** A bright, strong colour of hue `lo` to `hi` (degrees). */
function hueIn(r: number, g: number, b: number, lo: number, hi: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= lo && h <= hi;
}
/** Cyan: the friend's own colours, or any bright strong colour of hue 160 to 205 (the brief: never cyan, hue 160–205). */
const cyanPx = (r: number, g: number, b: number): boolean => (FRIEND.has(`${r},${g},${b}`) && !(r === g && g === b)) || hueIn(r, g, b, 160, 205);
const isCyan = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return cyanPx(r, g, b);
};
const cyanIn = (p: Painted): boolean => {
  const { d } = p.px;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] && cyanPx(d[i], d[i + 1], d[i + 2])) return true;
  return p.lights.some((l) => isCyan(l.color));
};

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const stageOf = (view: 'front' | 'back' = 'front'): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, view), can.ax, can.ay, can);
};

/** Every frame of every move of hers (the game's frames of each: framesOf), painted on her whole picture both ways round. */
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
  assert.equal(LADIES_ON.on, false, 'LADIES_ON is off');
  const users: string[] = [];
  const hers = /^art\/gallery_ladies(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || hers.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (hers.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF HERS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,dart');
  const found = checkBoss(MOB, LD_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKE: her flash strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(LD_STRIKES).join(','), 'attack');
  const [s0, s1] = LD_STRIKES.attack;
  assert.equal(Math.round((s1 - s0) * 30), 2, 'its strike is two frames');
  assert.equal(MOB.attack.motion.hit, s1, 'it lands on the strike\'s last frame');
  assert.ok(s0 - LD_FLASH.warn[1] < 0.05 && LD_FLASH.warn[1] - LD_FLASH.warn[0] >= 0.25, 'the warning held a quarter of a second and more, up to the strike');
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const n = smearIn(p);
    const want = smearedAt(move, t);
    if (want && n < 12) faults.push(`${said(move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(move, view, t)}: smeared out of its strike (${n})`);
  }
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
    if (n < 400 || cyanIn(p) || odd || (alive ? rim < 60 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, she (her dart and her beam too) is inside her picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${LADY_CANVAS.w}x${LADY_CANVAS.h}`);
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
  // (and her light on the floor, on its own picture)
  for (const view of VIEWS) {
    for (let t = -FLASH_FX.warn; t <= FLASH_FX.hold + FLASH_FX.fade; t += 1 / 30) {
      const { w, h, d } = flashPainted(t, view).px;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] && (x < 2 || y < 2 || x > w - 3 || y > h - 3)) assert.ok(false, `the light on the floor ${view} @${t.toFixed(2)} cut off at ${x},${y}`);
    }
  }
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

test('6. NOTHING OF HER IN THE FLOOR: all she wears and carries', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      // (but the mirror once it has fallen from her, which falls as itself: test 9)
      const bits: Bit[] = MOB.bits(st, at(move, t)).filter((b) => !(move === 'dying' && b.piece === 'mirror' && t >= LD_DIES.drop));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** The Hush coming out of her at a moment (laid after her edge: the grains), and nothing else of her grains. */
const BREATHS = new Set(['#b6b0cc', '#9890b4', '#625a7a']);
function breathAt(st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  MOB.bits(st, m);
  return (MOB.grains?.(st, m) ?? []).filter(([, c]) => !LIGHT.includes(c as (typeof LIGHT)[number]) && !SMEAR.includes(c as (typeof SMEAR)[number]) && !/^#(ffffff|e6e0f4|b6acd2|c8c2dc|8e98b8)$/.test(c));
}

test('7. THE HUSH leaking out of her while she lives; a great breath of it as it leaves her; none once she is still', () => {
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
  for (let t = 0.3; t <= 1.3; t += 0.05) {
    const v = breathAt(st, dyingMoment(MOB, t));
    great = Math.max(great, v.length);
    for (const [, c] of v) assert.ok(!isCyan(c), `the Hush in cyan, ${c}`);
  }
  assert.ok(great >= 1.5 * most, `the Hush leaving her, ${great} at most; the most while she lives, ${most}`);
  for (let t = LD_DIES.still; t <= LD_DIES.long + 1e-9; t += 0.05) assert.equal(breathAt(st, dyingMoment(MOB, t)).length, 0, `@${t.toFixed(2)}: the Hush still coming out`);
  void BREATHS;
});

test('8. the dull pink in her eyes while she lives, gone once she is down; she sinks low, but sits up on her knees, alive', () => {
  const st = stageOf();
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) for (const t of framesOf(MOB, move)) assert.ok(pinkEyes(MOB.bits(st, at(move, t))), `${move} @${t.toFixed(2)}: no pink in her eyes`);
  for (let t = LD_DIES.knees; t <= LD_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(MOB.bits(st, dyingMoment(MOB, t))), `@${t.toFixed(2)}: the pink still in her eyes`);
  const height = (p: Painted): number => {
    const { w, h, d } = p.px;
    let y0 = h;
    let y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return y1 - y0;
  };
  for (const view of VIEWS) {
    const her: Mob = { ...MOB, grains: () => [], fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const up = height(paintMob(her, 'stand', 0, view));
    const down = height(deathOfMob(her, 1, view));
    // (sat down in the pool of her skirts and bowed over: not as low as one who lies on his face, but well down)
    assert.ok(down < 0.78 * up, `${view}: ${down} pixels tall sunk down, ${up} standing`);
  }
  // (not lying dead: on her knees, her head up off the floor, a hand on it)
  const s = skeletonAt(MOB, 'dying', LD_DIES.long);
  assert.ok(Math.min(s.kneeL[2], s.kneeR[2]) < 4, 'her knees on the floor');
  assert.ok(s.pelvis[2] < 16, `sunk down: her hips ${s.pelvis[2].toFixed(1)} up`);
  assert.ok(s.head[2] > 18, `sat up, not lying: her head ${s.head[2].toFixed(1)} up`);
  assert.ok(s.handL[2] < 3, `a hand on the floor (${s.handL[2].toFixed(1)})`);
});

test('9. HER MIRROR: held up to her face as she stands; cracked across before it falls; once fallen, clear of her, both ways round', () => {
  for (const t of framesOf(MOB, 'stand')) {
    const s = skeletonAt(MOB, 'stand', t);
    const k = mirrorOf(s);
    assert.ok(Math.abs(k.c[2] - s.head[2]) < 4, `@${t.toFixed(2)}: the mirror ${k.c[2].toFixed(1)} high, her head ${s.head[2].toFixed(1)}`);
    assert.ok(Math.hypot(k.c[0] - s.head[0], k.c[1] - s.head[1]) < 16, `@${t.toFixed(2)}: the mirror beside her face`);
    // (its glass toward her face: she gazes into it)
    const toFace = [s.head[0] - k.c[0], s.head[1] - k.c[1], s.head[2] - k.c[2]];
    const d = Math.hypot(toFace[0], toFace[1], toFace[2]);
    assert.ok((k.n[0] * toFace[0] + k.n[1] * toFace[1] + k.n[2] * toFace[2]) / d > 0.5, `@${t.toFixed(2)}: its glass not turned to her`);
  }
  const st = stageOf();
  /** How many of the glass's points are crack lines (the seam's ink) at a moment. */
  const crackAt = (t: number): number => {
    let n = 0;
    for (const b of MOB.bits(st, dyingMoment(MOB, t))) {
      if (b.piece !== 'mirror' || b.shape.k !== 'ball' || typeof b.shape.skin !== 'function') continue;
      for (let r = 0.32; r < 0.7; r += 0.04) for (let a = 0; a < Math.PI * 2; a += 0.02) if (b.shape.skin([r * Math.cos(a), r * Math.sin(a), 0.6], 3, 0, 0) === '#0e0c24') n++;
    }
    return n;
  };
  assert.equal(crackAt(0), 0, 'the mirror whole as she is struck down');
  assert.ok(crackAt(LD_DIES.drop - 0.02) > 40, `the mirror cracked across before it falls (${crackAt(LD_DIES.drop - 0.02)})`);
  // (her alone, the mirror sent far off; and the mirror alone)
  const her: Mob = { ...MOB, grains: () => [], fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
  const mirror: Mob = { ...MOB, grains: () => [], bits: (s2, m) => MOB.bits(s2, m).filter((b) => b.piece === 'mirror') };
  for (const view of VIEWS) {
    for (let k = (LD_DIES.knees + 0.2) / MOB.dieTime; k <= 1 + 1e-9; k += 0.05) {
      const a = deathOfMob(her, Math.min(1, k), view).px.d;
      const b = deathOfMob(mirror, Math.min(1, k), view).px.d;
      let mine = 0;
      let its = 0;
      let both = 0;
      for (let i = 3; i < a.length; i += 4) {
        if (a[i]) mine++;
        if (b[i]) its++;
        if (a[i] && b[i]) both++;
      }
      assert.ok(mine > 500 && its > 15, `${view} @${k.toFixed(2)}: ${mine} pixels of her, ${its} of the mirror`);
      assert.equal(both, 0, `${view} @${k.toFixed(2)}: the mirror lies over her or under her by ${both} pixels`);
    }
  }
});

test('10. HER FLASH: the mirror up over her head in the warning, its glint building to full; thrust out at the blow; its light never cyan nor pink, out at once and gone after', () => {
  const warn = (LD_FLASH.warn[0] + LD_FLASH.warn[1]) / 2;
  const sw = skeletonAt(MOB, 'attack', warn);
  assert.ok(mirrorOf(sw).c[2] > sw.head[2] + 2, `the mirror ${mirrorOf(sw).c[2].toFixed(1)} high in the warning, her head ${sw.head[2].toFixed(1)}`);
  assert.ok(MOB.attack.glint?.(0.15) !== undefined && (MOB.attack.glint?.(0.15) as number) < 0.3 && (MOB.attack.glint?.(LD_FLASH.warn[1]) as number) > 0.99, 'the glint builds through the wind-up to its full');
  const sh = skeletonAt(MOB, 'attack', LD_FLASH.hit);
  const out = mirrorOf(sh).c;
  assert.ok(out[0] > 12 && out[0] - mirrorOf(sw).c[0] > 14, `the mirror thrust out before her at the blow (${out[0].toFixed(1)})`);
  // (its glass turned at you: forward)
  assert.ok(mirrorOf(sh).n[0] > 0.6, `the glass turned at you at the blow (${mirrorOf(sh).n[0].toFixed(2)})`);
  // the light: silver-white and lavender; never cyan, never the enemy's pink
  const pinkish = (c: string): boolean => {
    const [r, g, b] = rgba(c);
    return hueIn(r, g, b, 300, 360) || hueIn(r, g, b, 0, 20);
  };
  for (const c of [...LIGHT, ...SMEAR]) assert.ok(!isCyan(c) && !pinkish(c), `the light's colour ${c}`);
  for (let a = 0; a <= FLASH_FX.hold + FLASH_FX.fade; a += 1 / 30) for (const [, c] of flashBeam([10, -2, 40], a, (i) => (i * 0.618) % 1)) assert.ok(!isCyan(c) && !pinkish(c), `the beam's grain ${c}`);
  const pixels = (p: Painted): number => {
    let n = 0;
    for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
    return n;
  };
  for (const view of VIEWS) {
    const before = pixels(flashPainted(-1 / 30, view));
    const now = pixels(flashPainted(0, view));
    assert.ok(now > 20 * Math.max(10, before), `${view}: the light on the floor out at once (${before} then ${now})`);
    for (let t = -FLASH_FX.warn; t <= FLASH_FX.hold + FLASH_FX.fade; t += 1 / 30) assert.ok(!cyanIn(flashPainted(t, view)), `${view} @${t.toFixed(2)}: cyan on the floor`);
    assert.equal(pixels(flashPainted(FLASH_FX.hold + FLASH_FX.fade + 0.05, view)), 0, `${view}: the light gone`);
    // (and the beam in her own picture: there on the blow's frame, gone by the end of her move)
    const lit = (t: number): number => {
      const st = stageOf(view);
      const m = at('attack', t);
      MOB.bits(st, m);
      return (MOB.grains?.(st, m) ?? []).filter(([, c]) => LIGHT.includes(c as (typeof LIGHT)[number])).length;
    };
    assert.ok(lit(LD_FLASH.hit) > 300, `${view}: the beam thrown on the blow's frame (${lit(LD_FLASH.hit)})`);
  }
  const st = stageOf();
  const before = at('attack', LD_FLASH.hit - 1 / 30);
  MOB.bits(st, before);
  assert.equal((MOB.grains?.(st, before) ?? []).filter(([, c]) => LIGHT.includes(c as (typeof LIGHT)[number])).length, 0, 'no beam before the blow');
  const after = at('attack', LD_FLASH.long);
  MOB.bits(st, after);
  assert.equal((MOB.grains?.(st, after) ?? []).filter(([, c]) => LIGHT.includes(c as (typeof LIGHT)[number])).length, 0, 'the beam gone by the end of her move');
});

test('11. HIS SIZES AND SPEEDS: the glide 3.2 tiles a second; the dart two and a half tiles, in under half a second; the beam four and a half tiles long, two and a half wide', () => {
  assert.ok(LD_PACE >= 3.2 && LD_PACE > 2.5, `she glides at ${LD_PACE} tiles a second`);
  assert.equal(MOB.walk.ground, LD_PACE * TILE3, 'her glide painted for her pace');
  assert.ok(LD_DART.reach >= 2.5 * TILE3 - 1e-6, `the dart ${(LD_DART.reach / TILE3).toFixed(2)} tiles`);
  assert.ok(Math.abs(dartAlong(LD_DART.long) - LD_DART.reach) < 1e-6, 'the dart sets her down its whole reach on');
  assert.ok(dartAlong(LD_DART.burst[1]) - dartAlong(LD_DART.burst[0]) >= 0.9 * LD_DART.reach && LD_DART.burst[1] - LD_DART.burst[0] < 0.5, 'nine tenths of it in under half a second');
  // (and painted so: her hips go that far through her picture)
  const s0 = skeletonAt(MOB, 'dart', 0);
  const s1 = skeletonAt(MOB, 'dart', LD_DART.long);
  assert.ok(Math.abs(s1.pelvis[0] - s0.pelvis[0] - LD_DART.reach) < 0.5, `her hips go ${(s1.pelvis[0] - s0.pelvis[0]).toFixed(1)} on`);
  assert.ok(FLASH_FX.reach >= 4.5 * TILE3 - 1e-6, `the beam ${(FLASH_FX.reach / TILE3).toFixed(2)} tiles long`);
  assert.ok(FLASH_FX.wide >= 2.5 * TILE3 - 1e-6, `the beam ${(FLASH_FX.wide / TILE3).toFixed(2)} tiles wide at its end`);
  // (its light on the floor reaching that far: lit near the far end's middle, from in front and from behind)
  for (const view of VIEWS) {
    const p = flashPainted(0.03, view);
    const [x, y] = project([FLASH_FX.reach - 3, 0, 0], view === 'back' ? 'rear' : 'front');
    const cx = FLASH_CANVAS.ax + x;
    const cy = FLASH_CANVAS.ay + y;
    let n = 0;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (p.px.d[((Math.round(cy) + dy) * p.px.w + Math.round(cx) + dx) * 4 + 3]) n++;
    assert.ok(n > 15, `${view}: the light on the floor out at its far end (${n} pixels there)`);
  }
});
