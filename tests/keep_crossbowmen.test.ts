// FLOOR 19'S CROSSBOWMEN ON THE WALLS (src/art/keep_crossbowmen.ts, their look; src/art/keep_crossbowmen_moves.ts, their
// moves; src/art/keep_crossbowmen_fx.ts, their aim line and their bolt). A MOCK-UP: NOT IN THE GAME, behind CROSSBOW_ON,
// off. His pick, “Stand and shoot” (offered as: "Same brief, but they plant and hold their spot."). Held as floor 16's
// gardeners and grooms and its Princess are (tests/palace_hands.test.ts, tests/princess.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind, and every
//      handover the game plays (the shot always followed by the reload; the jog into the plant);
//   3. HIS LIGHTNING STRIKE (his Movement 9): the shot strikes in two frames, landing on the second; smeared then, and only then;
//   4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel
//      whole or empty but the edge;
//   5. NOTHING CUT OFF; 6. NOTHING IN THE FLOOR, all they wear and carry, the pavise too;
//   7. THE HUSH leaking out of them while they live; a great breath of it as it leaves them; none once it has;
//   8. the dull pink in their eyes while they live, gone out once they are down; they slump behind the pavise;
//   9. the crossbow that drops from them lies clear of them and of the pavise, from in front and from behind;
//  10. HIS BRIEF: the knight's size; the pavise on the back jogging, planted before them after; they hold their spot; the
//      jog's pace; the hands on the crossbow; the crank turned, the string spanned and loosed, the bolt laid in;
//  11. THE AIM LINE AND THE BOLT: twelve tiles, most of a tile wide; drawn out, held through the warning, gone at the
//      strike; the bolt down the whole line in two frames; a deep warning red, never the enemy's pink, never cyan;
//  12. NOTHING FOLDS FLAT: no round thing they wear collapses into a flat sheet that spins.
//   run: tsx --test tests/keep_crossbowmen.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { CB_CANVAS, CROSSBOW_ON, PAVISE, breathOf, planted } from '../src/art/keep_crossbowmen';
import { CB_DIES, CB_LINE, CB_PACE, CB_PLANT, CB_RELOAD, CB_SHAPE, CB_SHOT, CB_SMEAR, CB_STRIKES, CROSSBOWMAN, boltLands, bowAtMove, loadedAt, paviseAtMove, smearedAt } from '../src/art/keep_crossbowmen_moves';
import { BOLT_HOT, CB_FX, CB_LANE, LINE_RED, shotPainted } from '../src/art/keep_crossbowmen_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import { dot, sub } from '../src/art/skeleton';
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

const MOB = CROSSBOWMAN;
const VIEWS = ['front', 'back'] as const;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
const hueOf = (r: number, g: number, b: number): number => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return -1;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return (h + 360) % 360;
};
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
    if (!d[i + 3]) continue;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) return true;
  }
  return p.lights.some((l) => {
    const [r, g, b] = rgba(l.color);
    return cyanGlow(r, g, b);
  });
};

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const stageOf = (): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move (the game's frames of each: framesOf), painted on their whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;
const SMEAR = new Set(CB_SMEAR.map((c) => rgba(c).slice(0, 3).join(',')));
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
  assert.equal(CROSSBOW_ON.on, false, 'CROSSBOW_ON is off');
  const theirs = /^art\/keep_crossbowmen(_moves|_fx)?$/;
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

test('2. EVERY MOVE THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,plant,reload');
  const found = checkBoss(MOB, CB_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKE: the shot strikes in two frames and lands on the second; its strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(CB_STRIKES).join(','), 'attack');
  const [s0, s1] = CB_SHOT.strike;
  assert.equal(Math.round((s1 - s0) * 30), 2, 'the strike is two frames');
  assert.equal(MOB.attack.motion.hit, s1, 'it lands on the strike\'s last frame');
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const n = smearIn(p);
    const want = smearedAt(move, t);
    if (want && n < 12) faults.push(`${said(move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(move, view, t)}: smeared out of its strike (${n})`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
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
    if (n < 400 || cyanIn(p) || odd || (alive ? rim < 50 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, they (the pavise, the crossbow at its highest, the kick\'s smear) are inside their picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${CB_CANVAS.w}x${CB_CANVAS.h}`);
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

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  else if (sh.k === 'panel') z = sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  else if (sh.k === 'thread') z = Math.min(sh.a[2], sh.b[2]);
  return Math.max(0, -z);
}

test('6. NOTHING OF THEM IN THE FLOOR: all they wear and carry, the pavise and its prop too', () => {
  const faults: string[] = [];
  const st = stageOf();
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      // (but the crossbow once it has dropped from them, which falls as itself: test 9)
      const bits: Bit[] = MOB.bits(st, at(move, t)).filter((b) => !(move === 'dying' && b.piece === 'xbow' && t >= CB_DIES.drop));
      for (const b of bits) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part}/${b.piece} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. THE HUSH leaking out of them while they live; a great breath of it as it leaves them; none once it has', () => {
  const st = stageOf();
  let most = 0;
  let frames = 0;
  let some = 0;
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const m = at(move, t);
      MOB.bits(st, m);
      const n = breathOf(m).length;
      frames++;
      if (n > 0) some++;
      most = Math.max(most, n);
    }
  }
  assert.ok(some > 0.85 * frames, `the Hush leaking in ${some} of ${frames} living frames`);
  let great = 0;
  for (let t = 0.2; t <= 1.2; t += 0.05) {
    const m = dyingMoment(MOB, t);
    MOB.bits(st, m);
    great = Math.max(great, breathOf(m).length);
    for (const [, c] of breathOf(m)) {
      const [r, g, b] = rgba(c);
      assert.ok(!cyanGlow(r, g, b) && !FRIEND.has(`${r},${g},${b}`), `the Hush in cyan, ${c}`);
    }
  }
  assert.ok(great >= 1.5 * most, `the Hush leaving them, ${great} at most; the most while they live, ${most}`);
  for (let t = 1.7; t <= CB_DIES.long + 1e-9; t += 0.05) {
    const m = dyingMoment(MOB, t);
    MOB.bits(st, m);
    assert.equal(breathOf(m).length, 0, `@${t.toFixed(2)}: the Hush still coming out`);
  }
});

test('8. the dull pink in their eyes while they live, gone out once they are down; slumped behind the pavise, low', () => {
  const st = stageOf();
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) for (const t of framesOf(MOB, move)) assert.ok(pinkEyes(MOB.bits(st, at(move, t))), `${move} @${t.toFixed(2)}: no pink in the eyes`);
  for (let t = CB_DIES.knees; t <= CB_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(MOB.bits(st, dyingMoment(MOB, t))), `@${t.toFixed(2)}: the pink still in the eyes`);
  const up = skeletonAt(MOB, 'stand', 0);
  const down = skeletonAt(MOB, 'dying', CB_DIES.long);
  assert.ok(down.head[2] < 0.72 * up.head[2], `slumped: his head ${down.head[2].toFixed(1)} up, standing ${up.head[2].toFixed(1)}`);
  // (behind the pavise: all of him nearer than its back)
  const pv = planted();
  const back = sub(pv.c, [pv.n[0] * PAVISE.thick, pv.n[1] * PAVISE.thick, pv.n[2] * PAVISE.thick]);
  for (const p of [down.head, down.handL, down.handR, down.kneeL, down.kneeR, down.toeL, down.toeR, down.ribs]) assert.ok(dot(sub(p, back), pv.n) < -2, `a part of him at ${p.map((x) => x.toFixed(1))} not behind the pavise`);
});

test('9. the crossbow that drops from them lies clear of them and of the pavise once down, from in front and from behind', () => {
  const him: Mob = { ...MOB, fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
  const bow: Mob = { ...MOB, bits: (st, m) => MOB.bits(st, m).filter((b) => b.piece === 'xbow'), grains: undefined };
  for (const view of VIEWS) {
    for (let k = (CB_DIES.drop + 0.7) / CB_DIES.long; k <= 1 + 1e-9; k += 0.04) {
      const a = deathOfMob(him, Math.min(1, k), view).px.d;
      const b = deathOfMob(bow, Math.min(1, k), view).px.d;
      let mine = 0;
      let its = 0;
      let both = 0;
      for (let i = 3; i < a.length; i += 4) {
        if (a[i]) mine++;
        if (b[i]) its++;
        if (a[i] && b[i]) both++;
      }
      assert.ok(mine > 500 && its > 40, `${view} @${k.toFixed(2)}: ${mine} pixels of him, ${its} of the crossbow`);
      assert.equal(both, 0, `${view} @${k.toFixed(2)}: the crossbow lies over him or the pavise by ${both} pixels`);
    }
  }
});

test('10. HIS BRIEF: the knight\'s size; the pavise on the back jogging, planted before them after; the jog\'s pace; the hands on the crossbow; the crank, the string, the bolt', () => {
  // the knight's size (58 tall): the crown of the helm
  const s = skeletonAt(MOB, 'stand', 0);
  const crown = s.head[2] + MOB.build.headR[2] * 1.5;
  assert.ok(crown > 55 && crown < 66, `his helm's crown ${crown.toFixed(1)} up (the knight 58)`);
  // the jog: a quick one, carried at its pace
  assert.ok(CB_PACE >= 2, `the jog ${CB_PACE} tiles a second`);
  assert.equal(MOB.walk.ground, CB_PACE * TILE3, 'carried at its pace');
  // the pavise: on the back jogging (its painted face out behind), planted before them in every other move but the plant's
  // first half; the same place in all of them (they hold their spot)
  const P = planted();
  for (const t of framesOf(MOB, 'walk')) {
    const sk = skeletonAt(MOB, 'walk', t);
    const pv = paviseAtMove('walk', t, sk);
    assert.ok(dot(pv.n, sk.chest[0]) < -0.8 && pv.c[0] < sk.pelvis[0] - 6, `walk @${t.toFixed(2)}: the pavise not on his back`);
  }
  for (const move of ['stand', 'attack', 'reload', 'reel', 'dying']) {
    for (const t of framesOf(MOB, move)) {
      const pv = paviseAtMove(move, t, skeletonAt(MOB, move, t));
      assert.ok(Math.hypot(...sub(pv.c, P.c)) < 1e-6, `${move} @${t.toFixed(2)}: the pavise moved`);
    }
  }
  assert.ok(P.c[0] > 16, `planted ${P.c[0].toFixed(1)} before them`);
  for (const t of framesOf(MOB, 'plant')) {
    const pv = paviseAtMove('plant', t, skeletonAt(MOB, 'plant', t));
    if (t >= CB_PLANT.slam) assert.ok(Math.hypot(...sub(pv.c, P.c)) < 0.05, `plant @${t.toFixed(2)}: not planted after the slam`);
  }
  // the hands on the crossbow: the right on its grip or its crank, or sliding along the stock between them; the left under
  // the fore-stock, wherever they hold it
  const near = (a: V3, b: V3): number => Math.hypot(...sub(a, b));
  const toStock = (p: V3, cb: ReturnType<typeof bowAtMove>): number => {
    const ab = sub(cb.nose, cb.butt);
    const k = Math.max(0, Math.min(1, dot(sub(p, cb.butt), ab) / dot(ab, ab)));
    return near(p, [cb.butt[0] + ab[0] * k, cb.butt[1] + ab[1] * k, cb.butt[2] + ab[2] * k]);
  };
  for (const move of ['stand', 'attack', 'reload', 'plant', 'walk', 'reel']) {
    for (const t of framesOf(MOB, move)) {
      const sk = skeletonAt(MOB, move, t);
      const cb = bowAtMove(move, t, sk, posedOfMob(MOB, move, t));
      const r = Math.min(near(sk.handR, cb.grip), near(sk.handR, cb.handle) - 0.6, toStock(sk.handR, cb) - 1.6);
      const onCase = move === 'reload' && t > CB_RELOAD.crank[1] && t < CB_RELOAD.laid + 0.12;
      if (!onCase) assert.ok(r < 1.6, `${move} @${t.toFixed(2)}: the right hand ${r.toFixed(1)} off the crossbow`);
      if (move === 'attack' && t > CB_SHOT.raise[1] && t < 1.7) assert.ok(near(sk.handR, cb.grip) < 1.2, `attack @${t.toFixed(2)}: the right hand off the grip as they aim`);
    }
  }
  for (const t of framesOf(MOB, 'attack')) {
    if (t < CB_SHOT.raise[1] || t > 1.7) continue;
    const sk = skeletonAt(MOB, 'attack', t);
    const cb = bowAtMove('attack', t, sk, posedOfMob(MOB, 'attack', t));
    const along = dot(sub(sk.handL, cb.grip), cb.way);
    const off = Math.hypot(...sub(sub(sk.handL, cb.grip), [cb.way[0] * along, cb.way[1] * along, cb.way[2] * along]));
    assert.ok(along > 5 && along < 14 && off < 3.5, `attack @${t.toFixed(2)}: the left hand not under the fore-stock (${along.toFixed(1)} along, ${off.toFixed(1)} off)`);
  }
  // the crank turned: twice as they wind up the shot, five times as they reload; the string loosed by the shot, spanned by the reload
  const bowAt = (move: string, t: number) => bowAtMove(move, t, skeletonAt(MOB, move, t), posedOfMob(MOB, move, t));
  assert.ok(Math.abs(posedOfMob(MOB, 'attack', CB_SHOT.crank[1]).pAz - posedOfMob(MOB, 'attack', CB_SHOT.crank[0]).pAz - 720) < 30, 'two turns of the crank in the wind-up');
  assert.ok(Math.abs(posedOfMob(MOB, 'reload', CB_RELOAD.crank[1]).pAz - posedOfMob(MOB, 'reload', CB_RELOAD.crank[0]).pAz - 360 * CB_RELOAD.turns) < 30, 'the crank turned five times as they reload');
  assert.ok(bowAt('attack', CB_SHOT.strike[0]).draw > 0.99 && bowAt('attack', CB_SHOT.hit).draw < 0.01, 'the string loosed in the strike');
  assert.ok(bowAt('reload', 0).draw < 0.01 && bowAt('reload', CB_RELOAD.crank[1]).draw > 0.99, 'the string spanned by the crank');
  assert.ok(loadedAt('attack', CB_SHOT.strike[0]) && !loadedAt('attack', CB_SHOT.hit) && !loadedAt('reload', CB_RELOAD.take) && loadedAt('reload', CB_RELOAD.long), 'the bolt loosed, and laid in again');
});

test('11. THE AIM LINE AND THE BOLT: twelve tiles, most of a tile wide; drawn out, held through the warning, gone at the strike; the bolt down the whole line in two frames; a deep warning red, never pink, never cyan', () => {
  assert.equal(CB_LINE.tiles, 12);
  assert.ok(CB_LANE.wide >= 0.75, `the lane ${CB_LANE.wide} tiles wide`);
  const [g0, g1] = CB_FX.grow;
  const [s0, s1] = CB_FX.strike;
  assert.ok(s0 - g1 >= 0.6, `the line held ${(s0 - g1).toFixed(2)} s at its full length before the bolt`);
  const lane = (t: number, view: 'front' | 'back') => pixels(shotPainted(t, view).under);
  for (const view of VIEWS) {
    assert.equal(lane(g0 - 0.05, view), 0, `${view}: no line before it is drawn`);
    const full = lane(g1 + 0.02, view);
    assert.ok(full > 900, `${view}: the lane drawn out (${full} pixels)`);
    for (let t = g1; t < s0; t += 1 / 30) assert.ok(lane(t, view) > 0.8 * full, `${view} @${t.toFixed(2)}: the lane not held`);
    assert.equal(lane(s1 + 2 / 30, view), 0, `${view}: the lane gone once the bolt has flown`);
    // the bolt: half way down the line in the first frame of the strike, at its end in the second; the streak gone soon after
    const hot = (t: number): { n: number; far: number } => {
      const p = shotPainted(t, view).over.px;
      const HOT = new Set(BOLT_HOT.map((c) => rgba(c).slice(0, 3).join(',')));
      let n = 0;
      let far = 0;
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
        const i = (y * p.w + x) * 4;
        if (p.d[i + 3] && HOT.has(`${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`)) {
          n++;
          far = Math.max(far, x);
        }
      }
      return { n, far };
    };
    const a = hot(s0 + 1 / 30);
    const b = hot(s1);
    assert.ok(a.n > 60 && b.n > a.n * 1.5, `${view}: the bolt's streak ${a.n} then ${b.n} pixels`);
    assert.ok(b.far > a.far + 100, `${view}: the bolt half way, then at the end (${a.far}, ${b.far})`);
    assert.equal(hot(CB_FX.fade[1] + 0.05).n, 0, `${view}: the streak gone`);
    // every colour of it a deep warning red (or the bolt's white heat, the grit, the hiss): never the enemy's pink, never cyan
    for (let t = g0; t <= CB_FX.fade[1]; t += 1 / 30) {
      for (const p of [shotPainted(t, view).under, shotPainted(t, view).over]) {
        assert.ok(!cyanIn(p), `${view} @${t.toFixed(2)}: cyan`);
        const { d } = p.px;
        for (let i = 0; i < d.length; i += 4) {
          if (!d[i + 3]) continue;
          const h = hueOf(d[i], d[i + 1], d[i + 2]);
          const sat = (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2])) / Math.max(1, Math.max(d[i], d[i + 1], d[i + 2]));
          assert.ok(!(sat > 0.25 && h >= 300 && h <= 350), `${view} @${t.toFixed(2)}: a pink in it, rgb(${d[i]},${d[i + 1]},${d[i + 2]})`);
        }
      }
    }
  }
  for (const c of LINE_RED) {
    const [r, g, b] = rgba(c);
    const h = hueOf(r, g, b);
    assert.ok(h >= 0 && h <= 15, `the line's red ${c} at hue ${h.toFixed(0)}`);
  }
  // (the bolt lands at the line's end: the review's own blow, test 2)
  assert.ok(Math.abs(boltLands()[0] - CB_LINE.tiles * TILE3) < 1e-6);
});

test('12. NOTHING FOLDS FLAT: in every frame of every move, no round thing they wear collapses into a flat sheet that spins', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(move, t))) {
        if (b.shape.k !== 'ball' || b.piece === 'crest' || b.piece === 'xbow') continue;
        const [x, y, z] = b.shape.ax;
        const det = x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0]);
        const lens = Math.hypot(...x) * Math.hypot(...y) * Math.hypot(...z);
        if (lens > 0 && Math.abs(det) / lens < 0.5) faults.push(`${move} @${t.toFixed(2)}: ${b.piece} ${(Math.abs(det) / lens).toFixed(2)} square`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});
