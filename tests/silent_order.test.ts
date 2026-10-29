// THE SILENT ORDER (src/art/silent_order.ts, their look; src/art/silent_order_moves.ts, their moves; src/art/silent_order_fx.ts,
// the grey wave and the knife in flight): the guest (17), the armed last (19) and the masks (20). A MOCK-UP: NOT IN THE
// GAME, behind ORDER_ON, off. His pick for how they move: “Still, then sudden (Recommended)”; his Movement 9 (“Like the
// wind up and wind down are big but the actual punch is lightning quick”) and his “bigger AOE”; and “It’s all too slow
// and too narrow and too small”. Held as floor 16's guard and its Princess are (tests/palace_guard.test.ts,
// tests/princess.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF ALL THREE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and behind, every handover;
//   3. HIS LIGHTNING STRIKES: the palm, the knife and the rush's launch each strike in two frames, smeared then and only then;
//   4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel crisp;
//   5. NOTHING CUT OFF;
//   6. NOTHING OF THEM IN THE FLOOR;
//   7. THE PINK ONLY IN THE EYE HOLES (and the knife's glint as it is wound up), lit while they live, out as they die;
//   8. THE MASK CRACKS IN TWO AND THE CLOAK FALLS EMPTY: two halves fall clear and lie; nobody in the cloak, which lies low;
//      the masks' fog scattered and gone;
//   9. THE BRIEF'S SIZES AND SPEEDS, in tiles: the knight's size; two blows; the run 5.5 tiles a second; the rush 4.5 tiles
//      in a fifth of a second, off the floor while carried; the grey wave 5.5 tiles out and 100 degrees across, out in four
//      frames; the knife 8 tiles at 20 tiles a second;
//  10. NOTHING FOLDS FLAT; and what their blows leave (the wave, the knife) holds nothing cyan, the wave no pink.
//   run: tsx --test tests/silent_order.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { FLAME, ENEMY_RIM } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, skeletonAt } from '../src/art/new_mobs3';
import { KNIFE_FAN, ORDER_BODY, ORDER_ARMED_BODY, ORDER_CANVAS, ORDER_ON, SMEAR, fanOf } from '../src/art/silent_order';
import type { OrderWho } from '../src/art/silent_order';
import { KNIFE_FLIGHT, ORDER_ALL, ORDER_DIES, ORDER_PACE, ORDER_SHAPES, ORDER_STRIKES, PALM, RUSH, THROW, rushCarry, smearedAt } from '../src/art/silent_order_moves';
import { PALM_WAVE, knifeAt, knifePainted, waveFront, wavePainted } from '../src/art/silent_order_fx';
import { KNIGHT_BODY } from '../src/art/moves3';
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
const whoOf = (mob: Mob): OrderWho => mob.id.replace('order-', '') as OrderWho;

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
const PINKS = new Set<string>(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));

const moveOf = (mob: Mob, move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : (mob.more ?? {})[move]);
const at = (mob: Mob, move: string, t: number): Moment => (move === 'dying' ? dyingMoment(mob, t) : momentOf(mob, moveOf(mob, move), t));
const stageOf = (mob: Mob): Stage => {
  const can = canvasOf(mob);
  return stage(paintViewOf(mob, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move of all three, painted both ways round. */
const PAINTED: { mob: Mob; move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const mob of ORDER_ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (mob: Mob, move: string, view: string, t: number): string => `${whoOf(mob)} ${move} ${view} @${t.toFixed(2)}`;
const SMEARS = new Set<string>(SMEAR.map((c) => rgba(c).slice(0, 3).join(',')));
const smearIn = (p: Painted): number => {
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && SMEARS.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};
const heightOf = (p: Painted): number => {
  const { w, h, d } = p.px;
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] === 255) {
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return y1 - y0;
};

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(ORDER_ON.on, false, 'ORDER_ON is off');
  const theirs = /^art\/silent_order(_moves|_fx)?$/;
  const users: string[] = [];
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

test('2. EVERY MOVE OF ALL THREE THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  for (const mob of ORDER_ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,knife,rush');
    const found = checkBoss(mob, ORDER_SHAPES[whoOf(mob)]);
    assert.equal(found.length, 0, `${mob.name}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('3. HIS LIGHTNING STRIKES: the palm, the knife and the rush strike in two frames (the blows landing on the second); smeared then, and no other move', () => {
  assert.equal(Object.keys(ORDER_STRIKES).sort().join(','), 'attack,knife,rush');
  const faults: string[] = [];
  for (const mob of ORDER_ALL) {
    for (const [move, [s0, s1]] of Object.entries(ORDER_STRIKES)) {
      assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: its strike is two frames`);
      if (move !== 'rush') assert.equal(moveOf(mob, move)?.motion.hit, s1, `${move}: it lands on the strike's last frame`);
    }
  }
  for (const { mob, move, view, t, p } of PAINTED) {
    const n = smearIn(p);
    const want = smearedAt(move, t);
    if (want && n < 12) faults.push(`${said(mob, move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(mob, move, view, t)}: smeared out of its strike (${n})`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel whole or empty but the edge', () => {
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
    // (the masks wear the edge round their mask alone: their fog has none)
    const least = whoOf(mob) === 'mask' ? 14 : 40;
    if (n < (alive ? 120 : 20) || cyan || odd || (alive ? rim < least : rim !== 0)) faults.push(`${said(mob, move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, all three are inside their picture with room to spare', () => {
  const ROOM = 4;
  const faults: string[] = [];
  let least = Infinity;
  for (const { mob, move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${ORDER_CANVAS.w}x${ORDER_CANVAS.h}`);
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
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

test('6. NOTHING OF THEM IN THE FLOOR: all they wear and carry, all three', () => {
  const faults: string[] = [];
  for (const mob of ORDER_ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        // (but the mask's halves once they have let go: they fall as themselves, test 8)
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && (b.piece === 'maskL' || b.piece === 'maskR') && t >= ORDER_DIES.maskL));
        for (const b of bits) {
          if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
          const by = under(b.shape);
          if (by > 0.6) faults.push(`${whoOf(mob)} ${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
        }
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. THE PINK ONLY IN THE EYE HOLES (and the knife\'s glint as it is wound up): lit while they live, out as they die', () => {
  const faults: string[] = [];
  for (const mob of ORDER_ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        const bits = mob.bits(st, at(mob, move, t));
        let eyes = 0;
        for (const b of bits) {
          const sh = b.shape;
          const c = sh.k === 'dot' || sh.k === 'mote' || sh.k === 'glow' ? sh.c : null;
          if (!c || !PINKS.has(rgba(c).slice(0, 3).join(','))) continue;
          if (b.piece === 'eyes') eyes++;
          else if (b.piece !== 'glint') faults.push(`${whoOf(mob)} ${move} @${t.toFixed(2)}: pink on ${b.piece}`);
        }
        const lit = move !== 'dying' || t < ORDER_DIES.crack[0];
        if (lit && eyes < 2) faults.push(`${whoOf(mob)} ${move} @${t.toFixed(2)}: the eyes not lit`);
        if (move === 'dying' && t >= ORDER_DIES.crack[1] && eyes > 0) faults.push(`${whoOf(mob)} dying @${t.toFixed(2)}: the pink still in the eyes`);
        // (and the grains they lay: grey, never pink, never cyan)
        for (const [, c] of mob.grains?.(st, at(mob, move, t)) ?? []) if (isCyan(c) || PINKS.has(rgba(c).slice(0, 3).join(','))) faults.push(`${whoOf(mob)} ${move} @${t.toFixed(2)}: a grain ${c}`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('8. THE MASK CRACKS IN TWO AND THE CLOAK FALLS EMPTY: the halves fall clear and lie; nobody in the cloak, which lies low; the masks\' fog scattered and gone', () => {
  const body = /^(leg|shin|foot|buckle|breech|arm|fore|lace|hand|cuff|finger|doublet|mail|buttons|sash|mask$)/;
  for (const mob of ORDER_ALL) {
    const who = whoOf(mob);
    const st = stageOf(mob);
    // (cracking: whole before it, two halves by its end)
    const pieces = (t: number): Set<string> => new Set(mob.bits(st, dyingMoment(mob, t)).map((b) => b.piece));
    assert.ok(pieces(0.05).has('mask') && !pieces(0.05).has('maskL'), `${who}: the mask whole before it cracks`);
    assert.ok(pieces(ORDER_DIES.crack[1]).has('maskL') && pieces(ORDER_DIES.crack[1]).has('maskR'), `${who}: in two halves once cracked`);
    // (empty: after it empties, nothing of anyone is painted in it)
    for (let t = ORDER_DIES.empty + 0.01; t <= ORDER_DIES.long; t += 0.1) {
      const bad = mob.bits(st, dyingMoment(mob, t)).filter((b) => body.test(b.piece));
      assert.equal(bad.length, 0, `${who} @${t.toFixed(2)}: still in it: ${[...new Set(bad.map((b) => b.piece))].join(', ')}`);
    }
    for (const view of VIEWS) {
      // (the halves lie on the floor clear of the heap)
      const halves: Mob = { ...mob, bits: (s2, m) => mob.bits(s2, m).filter((b) => b.piece === 'maskL' || b.piece === 'maskR') };
      const rest: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
      const a = deathOfMob(rest, 1, view).px.d;
      const b = deathOfMob(halves, 1, view).px.d;
      let mine = 0;
      let theirs = 0;
      let both = 0;
      for (let i = 3; i < a.length; i += 4) {
        if (a[i]) mine++;
        if (b[i]) theirs++;
        if (a[i] && b[i]) both++;
      }
      assert.ok(theirs > 20, `${who} ${view}: the halves lying, ${theirs} pixels`);
      assert.equal(both, 0, `${who} ${view}: the halves over the heap by ${both} pixels`);
      // (it lies low: an empty cloak, not a body)
      const up = heightOf(paintMob(mob, 'stand', 0, view));
      const down = heightOf(deathOfMob(rest, 1, view));
      if (who === 'mask') assert.ok(mine < 30, `${who} ${view}: the fog not gone, ${mine} pixels`);
      else assert.ok(down < 0.42 * up, `${who} ${view}: the heap ${down} pixels tall, ${up} standing`);
    }
  }
});

test('9. THE BRIEF\'S SIZES AND SPEEDS, in tiles: the knight\'s size; two blows; the run; the rush; the grey wave; the knife', () => {
  // the knight's size (his bones 58 tall), the armed last no more than a little over
  assert.ok(Math.abs(ORDER_BODY.tall - KNIGHT_BODY.tall) <= 1 && Math.abs(ORDER_ARMED_BODY.tall - KNIGHT_BODY.tall) <= 2, `tall: ${ORDER_BODY.tall}, ${ORDER_ARMED_BODY.tall}; the knight ${KNIGHT_BODY.tall}`);
  for (const mob of ORDER_ALL) {
    // a medium mob: two blows, the palm and the knife
    assert.ok(mob.attack.motion.hit !== undefined && mob.more?.knife?.motion.hit !== undefined, `${mob.name}: two blows`);
    // the run: 5.5 tiles a second, twice the knight's walk and more, its feet gripping (the review's)
    assert.equal(mob.pace, ORDER_PACE);
    assert.ok(ORDER_PACE >= 2 * 2.5, `the run ${ORDER_PACE} tiles a second`);
    assert.equal(mob.walk.ground, ORDER_PACE * TILE3);
    // the rush: still, then 4.5 tiles in a fifth of a second; both feet off the floor all the while the game carries them
    assert.ok(Math.abs(rushCarry(RUSH.air[1]) - RUSH.carry * TILE3) < 0.01, `the rush carries ${(rushCarry(RUSH.air[1]) / TILE3).toFixed(2)} tiles`);
    assert.ok(RUSH.air[1] - RUSH.air[0] <= 0.2 + 1e-9, `in ${(RUSH.air[1] - RUSH.air[0]).toFixed(3)} s`);
    for (let t = RUSH.air[0] + 1 / 30; t < RUSH.air[1] - 1e-6; t += 1 / 30) {
      const s = skeletonAt(mob, 'rush', t);
      for (const p of [s.heelL, s.toeL, s.heelR, s.toeR]) assert.ok(p[2] > 0.6, `${mob.name} rush @${t.toFixed(2)}: a foot down while carried`);
    }
    for (let t = 0; t <= RUSH.air[0] + 1e-6; t += 1 / 30) assert.equal(rushCarry(t), 0, 'not carried before they launch');
    // still before it: nothing of them moves more than a hair through its first 0.18 s
    const s0 = skeletonAt(mob, 'rush', 0);
    const s1 = skeletonAt(mob, 'rush', RUSH.still);
    assert.ok(Math.hypot(...(s1.pelvis.map((v, i) => v - s0.pelvis[i]) as [number, number, number])) < 0.5, 'still, before the rush');
  }
  // the grey wave: 5.5 tiles out, 100 degrees across, out in four frames
  assert.ok(Math.abs(PALM_WAVE.reach - 5.5 * TILE3) < 1e-6 && PALM_WAVE.half * 2 === 100, 'the wave 5.5 tiles, 100 degrees');
  assert.ok(Math.abs(waveFront(PALM_WAVE.burst[1]) - PALM_WAVE.reach) < 2 && waveFront(1 / 30) > PALM_WAVE.reach * 0.35, 'out in four frames');
  assert.equal(Math.round(PALM_WAVE.burst[1] * 30), 4);
  // the knife: 8 tiles at 20 tiles a second, then down
  assert.ok(KNIFE_FLIGHT.reach === 8 && KNIFE_FLIGHT.speed === 20, 'the knife 8 tiles at 20 a second');
  assert.ok(knifeAt(0.39).flying && !knifeAt(0.41).flying && Math.abs(knifeAt(0.41).x - 8) < 0.5, 'it flies 8 tiles in 0.4 s');
  assert.ok(knifeAt(0.8).z < 1.5, 'and lies on the floor');
  // the blows' warnings are held, their strikes lightning
  assert.ok(PALM.warn[1] - PALM.warn[0] >= 0.35 && THROW.warn[1] - THROW.warn[0] >= 0.35, 'warnings held a third of a second and more');
});

test('10. NOTHING FOLDS FLAT; and what their blows leave (the wave, the knife) holds nothing cyan, the wave no pink', () => {
  const faults: string[] = [];
  for (const mob of ORDER_ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        for (const b of mob.bits(st, at(mob, move, t))) {
          if (b.shape.k !== 'ball') continue;
          const [x, y, z] = b.shape.ax;
          const det = x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0]);
          const lens = Math.hypot(...x) * Math.hypot(...y) * Math.hypot(...z);
          if (lens > 0 && Math.abs(det) / lens < 0.5) faults.push(`${whoOf(mob)} ${move} @${t.toFixed(2)}: ${b.piece} ${(Math.abs(det) / lens).toFixed(2)} square`);
        }
      }
    }
  }
  for (const view of VIEWS) {
    for (let t = 0; t <= PALM_WAVE.long; t += 0.1) {
      const { d } = wavePainted(t, view).px;
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        if (cyanGlow(d[i], d[i + 1], d[i + 2]) || PINKS.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) faults.push(`the wave @${t.toFixed(1)} ${view}: ${d[i]},${d[i + 1]},${d[i + 2]}`);
      }
    }
    for (let t = 0; t <= 0.8; t += 0.05) {
      const p = knifePainted(t, view);
      let n = 0;
      for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3]) {
        n++;
        if (cyanGlow(p.px.d[i], p.px.d[i + 1], p.px.d[i + 2])) faults.push(`the knife @${t.toFixed(2)} ${view}: cyan`);
      }
      if (n < 20) faults.push(`the knife @${t.toFixed(2)} ${view}: only ${n} pixels`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('11. HIS FAN OF THREE (“A fan of three on 19 (Recommended)”): the armed last throws three curved knives, 30 to 40 degrees apart, each its 8 tiles; the guest and the masks one', () => {
  assert.equal(fanOf('armed').length, 3, 'the armed last: three');
  assert.equal(fanOf('guest').length, 1, 'the guest: one');
  assert.equal(fanOf('mask').length, 1, 'the masks: one');
  const ways = fanOf('armed');
  for (let i = 1; i < ways.length; i++) assert.ok(ways[i] - ways[i - 1] >= 30 && ways[i] - ways[i - 1] <= 40, `${ways[i] - ways[i - 1]} degrees apart`);
  assert.ok(KNIFE_FAN.spread >= 30 && KNIFE_FAN.spread <= 40);
  // (held in the fist through the warning: three knives for the armed last, one for the guest)
  for (const mob of ORDER_ALL) {
    const st = stageOf(mob);
    const held = new Set(mob.bits(st, at(mob, 'knife', 0.6)).filter((b) => /^knife\d$/.test(b.piece)).map((b) => b.piece));
    assert.equal(held.size, fanOf(whoOf(mob)).length, `${mob.name}: ${held.size} knives in the fist`);
  }
  // (each of the three painted flying its own way, and lying where it comes down: nothing cyan)
  for (const way of ways) {
    for (const view of VIEWS) {
      for (const t of [0.1, 0.3, 0.6]) {
        const { d } = knifePainted(t, view, 40, way).px;
        let n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3]) {
          n++;
          assert.ok(!cyanGlow(d[i], d[i + 1], d[i + 2]), `knife ${way} @${t} ${view}: cyan`);
        }
        assert.ok(n > 20, `knife ${way} @${t} ${view}: ${n} pixels`);
      }
    }
  }
});
