// THE FLESHMANCER, THE CRYPT'S LAIR BOSS ON FLOOR 5 (src/art/fleshmancer.ts): HIS LOOK, A MOCK-UP. Nothing of
// the game makes him. His words, 9 Oct, 22:47 (his outline of the Crypt): "Floor 5 will have the Lair boss,
// which will be a very powerful cultist fleshmancer." "Hes human sized". His brief, by 08:36 on 11 Oct:
// "Hooded priest, hands of power"; "A staff topped with a skull"; "Glides, feet just off the floor
// (Recommended)"; "Nothing gory (Recommended)". And, 9 Oct, 23:35: "I need all bosses ran through all checks
// from now on.  These boss fights are important" (the art rulebook, How art is made 7). So:
//   1. the switch is off, and nothing of the game imports him;
//   2. HIS STAND THROUGH EVERY CHECK, the whole review the other bosses had (src/art/boss_checks.ts), every
//      frame, from in front and from behind as the camera truly sees him: nothing through him (his arms,
//      his staff, its skull), nothing of him in the floor, nothing jerky (his loop closing too), alive when
//      still, and nothing that leaps where his stand hands over to his rest pose, from whatever frame of it
//      (where every move of his to come will begin);
//   3. his stand paints in every frame both ways round: nothing cyan (and no light that is not the
//      enemy's), his pink edge round him, every pixel whole or empty but the edge;
//   4. HUMAN SIZED: the top of his hood about the knight's height, a head taller at most; the skull of his
//      staff above his hood;
//   5. HE FLOATS, UNMISTAKABLY: in every frame of his stand the lowest of his robe's tails is clear of the floor
//      by a few game pixels (a gap of floor under him), and he rises and sinks on nothing by 4 to 6 game
//      pixels as he stands;
//   6. his staff is in his right hand from in front and from behind: his back as the camera truly sees him;
//      and it passes outside the mantle he wears over his shoulders (which his arms are under, as the
//      Headsman's are under his cape: so it is not among the solids the review keeps his arms out of);
//   7. THE GOUT OF FIRE HE FLINGS leaves his hand, arcs out beside him (from in front and from behind, clear
//      of him) and bursts on the floor;
//   8. HIS LIGHT NEVER WASHES OVER HIM IN ONE FRAME: from one frame of his stand to the next, all the light
//      he gives off grows by two fifths at most (it swells over two or three frames);
//   9. THE SKULL, the second thing he is known by, is wider than his hood.
//   run: tsx --test tests/fleshmancer.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { FLESHMANCER, FLESHMANCER_SWITCH, FM_GOUT_LAND, FM_GOUT_LET, FM_GOUT_SPOT, FM_HOOD_R, FM_HOOD_UP, FM_MADE, FM_SHAPE, FM_SKULL_WIDE, fmGoutAt, fmHemOf, fmHoodTop, fmMantle, fmSolids, fmTails, makeFleshmancerArt3, staffOf } from '../src/art/fleshmancer';
import { checkBoss, findingsSaid, framesOf, inLump } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { KNIGHT_BODY } from '../src/art/moves3';
import { paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { project } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

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
/** Of one frame: how many pixels it paints, how many of them are the enemy's edge, whether any (or any of its lights) is cyan or not the enemy's, and how many pixels are neither whole nor empty but the edge. */
function looked(sp: Sprite): { n: number; rim: number; cyan: boolean; odd: number } {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const d = paintingOf(sp).d;
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
  // (every light he gives off, and his pool of light, the enemy's: hot pink to gold, never cyan)
  for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) {
    const [r, g, b] = rgba(l.color);
    if (cyanGlow(r, g, b) || FRIEND.has(`${r},${g},${b}`) || r < 150 || r < g || r < b) cyan = true;
  }
  return { n, rim, cyan, odd };
}

test('1. the switch is off, and nothing of the game imports him', () => {
  assert.equal(FLESHMANCER_SWITCH.on, false);
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/fleshmancer.ts') continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    assert.ok(!/from ['"][^'"]*fleshmancer['"]/.test(text), `src/${f} imports the fleshmancer`);
  }
});

test('2. HIS STAND THROUGH EVERY CHECK: every frame, from in front and from behind, and into his rest pose from every frame of it', () => {
  assert.equal(FM_MADE.join(','), 'stand');
  assert.equal(framesOf(FLESHMANCER, 'stand').length, FLESHMANCER.idleFrames + 1);
  const found = checkBoss(FLESHMANCER, FM_SHAPE, FM_MADE);
  assert.equal(found.length, 0, `the fleshmancer: ${findingsSaid(found).slice(0, 12).join('; ')}`);
});

test('3. his stand paints in every frame both ways round: nothing cyan, his edge round him, every pixel whole or empty but the edge', () => {
  const art = makeFleshmancerArt3();
  for (const view of ['front', 'back'] as const) {
    const idle = art[view].idle;
    assert.equal(idle.length, FLESHMANCER.idleFrames);
    idle.forEach((sp, i) => {
      const f = looked(sp);
      assert.ok(f.n > 900 && !f.cyan && f.rim > 60 && f.odd === 0, `${view}, frame ${i}: ${f.n} pixels, ${f.rim} of his edge, ${f.odd} neither whole nor empty${f.cyan ? ', and cyan' : ''}`);
    });
  }
});

test('4. human sized: his hood about the knight’s height, a head taller at most; the skull of his staff above it; its foot off the floor', () => {
  const knight = KNIGHT_BODY.tall;
  const head = KNIGHT_BODY.headR[2] * 2;
  for (let i = 0; i < FLESHMANCER.idleFrames; i++) {
    const s = skeletonAt(FLESHMANCER, 'stand', i / FLESHMANCER.idleFps);
    const top = fmHoodTop(s);
    assert.ok(top > knight - 4 && top <= knight + head, `at ${(i / FLESHMANCER.idleFps).toFixed(1)} s the top of his hood is ${top.toFixed(1)} up (the knight ${knight}, his head ${head.toFixed(1)})`);
    const skull = staffOf(s).skull;
    assert.ok(skull[2] > top + 8, `at ${(i / FLESHMANCER.idleFps).toFixed(1)} s the skull is ${skull[2].toFixed(1)} up, his hood ${top.toFixed(1)}`);
    // (and the staff floats with him: its foot, a knob of bone 1.6 round, never in the floor)
    const foot = staffOf(s).foot;
    assert.ok(foot[2] > 1.6 + 0.5, `at ${(i / FLESHMANCER.idleFps).toFixed(1)} s the staff's foot is ${foot[2].toFixed(1)} up`);
  }
  assert.ok(FM_HOOD_UP > 0);
});

test('5. he floats, unmistakably: a gap of floor under the lowest of his tails in every frame, and he rises and sinks by 4 to 6 game pixels', () => {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < FLESHMANCER.idleFrames; i++) {
    const t = i / FLESHMANCER.idleFps;
    const s = skeletonAt(FLESHMANCER, 'stand', t);
    const q = posedOfMob(FLESHMANCER, 'stand', t);
    const tails = fmTails(fmHemOf(s), (t / (FLESHMANCER.idleFrames / FLESHMANCER.idleFps)) * Math.PI * 2, q.gale);
    const lowest = Math.min(...tails.flatMap((x) => x.pts.map((p) => p[2] - x.r)));
    // (a gap of four game pixels at the least: eight of the picture's)
    assert.ok(lowest > 8, `at ${t.toFixed(1)} s the lowest of his tails is ${lowest.toFixed(1)} off the floor`);
    // (and nothing of his body down there either: his drawn-up feet are inside his robe, above its hem)
    assert.ok(Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 2, `at ${t.toFixed(1)} s a foot of his is near the floor`);
    lo = Math.min(lo, fmHoodTop(s));
    hi = Math.max(hi, fmHoodTop(s));
  }
  const bob = (hi - lo) / 2;
  assert.ok(bob >= 4 && bob <= 6, `he rises and sinks by ${bob.toFixed(1)} game pixels`);
});

test('6. his staff is in his right hand from in front and from behind (his back as the camera truly sees him), and passes outside his mantle', () => {
  assert.equal(paintViewOf(FLESHMANCER, 'back'), 'rear');
  assert.equal(paintViewOf(FLESHMANCER, 'front'), 'front');
  for (let i = 0; i < FLESHMANCER.idleFrames; i += 5) {
    const s = skeletonAt(FLESHMANCER, 'stand', i / FLESHMANCER.idleFps);
    const { foot, top } = staffOf(s);
    const mid: [number, number, number] = [(foot[0] + top[0]) / 2, (foot[1] + top[1]) / 2, (foot[2] + top[2]) / 2];
    const front = project(mid, 'front')[0] - project(s.pelvis, 'front')[0];
    const back = project(mid, 'rear')[0] - project(s.pelvis, 'rear')[0];
    assert.ok(front < -5 && back > 5, `frame ${i}: the staff ${front.toFixed(0)} across the picture facing you, ${back.toFixed(0)} facing away`);
  }
  for (let i = 0; i < FLESHMANCER.idleFrames; i++) {
    const s = skeletonAt(FLESHMANCER, 'stand', i / FLESHMANCER.idleFps);
    const staff = FM_SHAPE.things?.('stand', i / FLESHMANCER.idleFps, s, posedOfMob(FLESHMANCER, 'stand', i / FLESHMANCER.idleFps)).find((x) => x.name === 'staff');
    const mantle = fmMantle(s);
    const deepest = Math.max(...(staff?.pts ?? []).map((p) => inLump(p, mantle)));
    assert.ok(staff && deepest + staff.r < 0.5, `frame ${i}: the staff is ${(deepest + (staff?.r ?? 0)).toFixed(1)} into his mantle`);
  }
});

test('7. the gout of fire he flings leaves his hand, arcs out beside him (clear of him, from in front and from behind) and bursts on the floor', () => {
  const at = skeletonAt(FLESHMANCER, 'stand', FM_GOUT_LET);
  const leaves = fmGoutAt(FM_GOUT_LET);
  assert.ok(leaves !== null, 'it is in flight as it leaves his hand');
  const from = leaves as readonly [number, number, number];
  const fromHand = Math.hypot(from[0] - at.handL[0], from[1] - at.handL[1], from[2] - at.handL[2]);
  assert.ok(fromHand < 6, `it leaves ${fromHand.toFixed(1)} from his hand`);
  assert.ok(FM_GOUT_SPOT[2] === 0 && fmGoutAt(FM_GOUT_LAND) === null, 'it lands on the floor, and is gone from the air');
  let topZ = -Infinity;
  for (let t = FM_GOUT_LET; t < FM_GOUT_LAND; t += 0.02) {
    const p = fmGoutAt(t);
    if (!p) continue;
    topZ = Math.max(topZ, p[2]);
    const s = skeletonAt(FLESHMANCER, 'stand', t);
    const { lumps } = fmSolids(s);
    for (const o of lumps) assert.ok(inLump(p, o) < -1, `at ${t.toFixed(2)} s it passes through his ${o.name}`);
  }
  assert.ok(topZ > from[2] + 4, `it arcs (its top ${topZ.toFixed(1)} up, it left at ${from[2].toFixed(1)})`);
  // (where it bursts is beside him as the eye sees him, from in front and from behind, not under him)
  const s = skeletonAt(FLESHMANCER, 'stand', FM_GOUT_LAND);
  for (const view of ['front', 'rear'] as const) {
    const across = Math.abs(project(FM_GOUT_SPOT, view)[0] - project(s.pelvis, view)[0]) / 2;
    assert.ok(across > 14, `${view}: it bursts ${across.toFixed(1)} game pixels across the picture from him`);
  }
});

test('8. his light never washes over him in one frame: from one frame to the next it grows by two fifths at most', () => {
  for (const view of ['front', 'back'] as const) {
    const all: number[] = [];
    for (let i = 0; i < FLESHMANCER.idleFrames; i++) all.push(paintMob(FLESHMANCER, 'stand', i / FLESHMANCER.idleFps, view).lights.reduce((a, l) => a + (l.a ?? 0.5) * l.r * l.r, 0));
    all.forEach((v, i) => {
      const next = all[(i + 1) % all.length];
      assert.ok(next <= v * 1.4, `${view}: from frame ${i} to the next his light grows ${(next / v).toFixed(2)} times`);
    });
  }
});

test('9. the skull, the second thing he is known by, is wider than his hood', () => {
  assert.ok(FM_SKULL_WIDE >= 2 * FM_HOOD_R[1] + 2, `the skull ${FM_SKULL_WIDE} across, his hood ${(2 * FM_HOOD_R[1]).toFixed(1)}`);
});
