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
//   4. HUMAN SIZED: a man a head taller than the knight (the top of his hood 66 to 68 up at rest), and never
//      more than that as he floats (his float lifts him, it does not grow him); the skull of his staff
//      above his hood;
//   5. HE FLOATS, UNMISTAKABLY: in every frame of his stand the lowest of his robe's tails is clear of the floor
//      by a few game pixels (a gap of floor under him), and he rises and sinks on nothing by 4 to 6 game
//      pixels as he stands;
//   6. his staff is in his right hand from in front and from behind: his back as the camera truly sees him;
//      and it passes outside the mantle he wears over his shoulders (which his arms are under, as the
//      Headsman's are under his cape: so it is not among the solids the review keeps his arms out of);
//   7. THE GOUT OF FIRE HE FLINGS leaves his hand, is thrown a long way out before him (toward you, from in
//      front), clear of him, and bursts on the floor beside him from in front and from behind;
//   8. HIS LIGHT NEVER WASHES OVER HIM IN ONE FRAME: from one frame of his stand to the next, all the light
//      he gives off grows by two fifths at most (it swells over two or three frames);
//   9. THE SKULL, the second thing he is known by, is about his hood's width (his emblem: the man is the mass);
//  10. NO LONE PIXEL, in any frame either way round: with his pink edge round it, a pixel alone is a cross (+),
//      and an ember or a spark of his is never one;
//  11. HIS ATTACKS (his picks by 08:36 on 11 Oct; his word that day: “I don’t need the whole mock up sheet,
//      just show me what he looks like and what the attacks look like”) paint in every frame both ways round,
//      nothing cyan, his edge round him, no lone pixel;
//  12. THE SHARDS (“Bone shards from the skull (Recommended)”): the skull cocked back behind him, then swung
//      over until it points at you, its jaws open, on the blow; the shards leave its jaws then;
//  13. THE RINGS OF HANDS (“Rings of hands (Recommended)”): his claw raised high, then slammed down at the
//      floor on the blow, the staff's foot striking the floor with it; each of the hands bursts up out of
//      the floor, grabs, and is dragged back under (nothing of it left above the floor);
//  14. RAISING THE DEAD (“Raise the dead (Recommended)”): both his hands up over his hood while the dead come
//      up, the skull's jaws wide (it shrieks);
//  15. THE SWEEPING FIRE (“Sweeping fire”): the skull high over his hood while it pours, its jaws wide, and the
//      stream goes round the room once;
//  16. HIS GLIDE (“Glides, feet just off the floor (Recommended)”): never a foot near the floor, the lowest of
//      his tails off it in every frame, borne along leaning into his way;
//  17. HIS DEATH (“His own dead drag him down (Recommended)”): the pit opens under him, he goes under it, his
//      hood before his claw and the skull last, and by its last frame nothing of him is left but the pit closing
//      (no edge of light round him as he dies, nothing cyan, no lone pixel).
//   run: tsx --test tests/fleshmancer.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { FLESHMANCER, FLESHMANCER_SWITCH, FM_ATTACKS, FM_DEATH, FM_SHAPE_UNDER, fmPitAt, FM_BODY, FM_FIRE, FM_HAND_FPS, FM_HAND_FRAMES, FM_HAND_KINDS, FM_HAND_UNDER, FM_RAISE, FM_RINGS, FM_SHARDS, fmFireTurn, fmJawOf, fmMouthAt, makeRingHandArt, paintRingHand, FM_GOUT_LAND, FM_GOUT_LET, FM_GOUT_SPOT, FM_HOOD_R, FM_HOOD_UP, FM_MADE, FM_REST, FM_SHAPE, FM_SKULL_WIDE, fmGoutAt, fmHemOf, fmHoodTop, fmMantle, fmSolids, fmTails, makeFleshmancerArt3, staffOf } from '../src/art/fleshmancer';
import { checkBoss, findingsSaid, framesOf, inLump } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { KNIGHT_BODY } from '../src/art/moves3';
import { deathOfMob, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { project, solve } from '../src/art/skeleton';
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
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/fleshmancer.ts' || f === 'art/fm_spells.ts') continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    assert.ok(!/from ['"][^'"]*(fleshmancer|fm_spells)['"]/.test(text), `src/${f} imports the fleshmancer`);
  }
});

test('2. EVERY MOVE OF HIS THROUGH EVERY CHECK: every frame, from in front and from behind, and from every frame of his stand into each and back, into his glide and out of it; his death as he is dragged down through the floor', () => {
  assert.equal(FM_MADE.join(','), 'stand,walk,setOff,halt,attack,rings,raise,fire,reel,dying');
  assert.equal(framesOf(FLESHMANCER, 'stand').length, FLESHMANCER.idleFrames + 1);
  const found = checkBoss(FLESHMANCER, FM_SHAPE, FM_MADE.filter((m) => m !== 'dying'));
  assert.equal(found.length, 0, `the fleshmancer: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  const under = checkBoss(FLESHMANCER, FM_SHAPE_UNDER, ['dying']);
  assert.equal(under.length, 0, `his death: ${findingsSaid(under).slice(0, 12).join('; ')}`);
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

test('4. human sized: a man a head taller than the knight (his hood 66 to 68 up at rest), never more as he floats; the skull of his staff above his hood; its foot off the floor', () => {
  const knight = KNIGHT_BODY.tall;
  const head = KNIGHT_BODY.headR[2] * 2;
  const rest = solve(FM_BODY, FM_REST);
  const atRest = fmHoodTop(rest);
  assert.ok(atRest >= 66 && atRest <= 68, `at rest the top of his hood is ${atRest.toFixed(1)} up (the knight ${knight}, his head ${head.toFixed(1)})`);
  for (let i = 0; i < FLESHMANCER.idleFrames; i++) {
    const s = skeletonAt(FLESHMANCER, 'stand', i / FLESHMANCER.idleFps);
    const top = fmHoodTop(s);
    // (his own height: the top of his hood less how far his float has lifted him above where he floats at rest)
    const own = top - (s.pelvis[2] - rest.pelvis[2]);
    assert.ok(own > knight && own <= knight + head + 0.5, `at ${(i / FLESHMANCER.idleFps).toFixed(1)} s he is ${own.toFixed(1)} tall (the knight ${knight}, his head ${head.toFixed(1)})`);
    const skull = staffOf(s).skull;
    assert.ok(skull[2] > top + 8, `at ${(i / FLESHMANCER.idleFps).toFixed(1)} s the skull is ${skull[2].toFixed(1)} up, his hood ${top.toFixed(1)}`);
    // (and the staff floats with him: its foot, a knob of bone 1.8 round, never in the floor)
    const foot = staffOf(s).foot;
    assert.ok(foot[2] > 1.8 + 0.5, `at ${(i / FLESHMANCER.idleFps).toFixed(1)} s the staff's foot is ${foot[2].toFixed(1)} up`);
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

test('7. the gout of fire he flings leaves his hand, is thrown a long way out before him, clear of him, and bursts on the floor beside him from in front and from behind', () => {
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
  // (it is thrown, not dropped: it goes a long way out across the floor from where it left his hand, and comes down in front of him, toward you)
  const out = Math.hypot(FM_GOUT_SPOT[0] - from[0], FM_GOUT_SPOT[1] - from[1]);
  assert.ok(out > 40 && topZ >= from[2], `it lands ${out.toFixed(1)} out from where it left his hand`);
  const s0 = skeletonAt(FLESHMANCER, 'stand', FM_GOUT_LAND);
  assert.ok(project(FM_GOUT_SPOT, 'front')[1] - project([s0.pelvis[0], s0.pelvis[1], 0], 'front')[1] > 8, 'from in front it comes down on the floor in front of him, toward you');
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

test('9. the skull, his emblem, is about his hood\u2019s width: not smaller, and not the bigger thing', () => {
  assert.ok(FM_SKULL_WIDE >= 2 * FM_HOOD_R[1] - 1 && FM_SKULL_WIDE <= 2 * FM_HOOD_R[1] + 1, `the skull ${FM_SKULL_WIDE} across, his hood ${(2 * FM_HOOD_R[1]).toFixed(1)}`);
});

test('10. no lone pixel in any frame either way round (with his pink edge round it a pixel alone is a cross)', () => {
  const art = makeFleshmancerArt3();
  for (const view of ['front', 'back'] as const) {
    art[view].idle.forEach((sp, i) => {
      const { w, h, d } = paintingOf(sp);
      const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
      const lone: string[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!solid(x, y)) continue;
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && solid(x + dx, y + dy)) n++;
          if (n === 0) lone.push(`${x},${y}`);
        }
      }
      assert.equal(lone.length, 0, `${view}, frame ${i}: lone pixels at ${lone.slice(0, 6).join(' ')}`);
    });
  }
});

const ART = makeFleshmancerArt3();
/** Of a move's frames both ways round: what each paints (as test 3 asks), and any lone pixel. */
function frameFaults(which: string): string[] {
  const out: string[] = [];
  for (const view of ['front', 'back'] as const) {
    const clips = ART[view].clips;
    const frames = (which === 'attack' ? clips?.attack?.frames : which === 'walk' ? ART[view].walk : which === 'reel' ? clips?.reel?.frames : clips?.moves?.[which]?.frames) ?? [];
    if (!frames.length) out.push(`${which} ${view}: no frames`);
    for (const [i, sp] of frames.entries()) {
      const f = looked(sp);
      if (!(f.n > 900 && !f.cyan && f.rim > 60 && f.odd === 0)) out.push(`${which} ${view} ${i}: ${f.n} pixels, ${f.rim} edge, ${f.odd} odd${f.cyan ? ', cyan' : ''}`);
      const { w, h, d } = paintingOf(sp);
      const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!solid(x, y)) continue;
          let m = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && solid(x + dx, y + dy)) m++;
          if (m === 0) out.push(`${which} ${view} ${i}: a lone pixel at ${x},${y}`);
        }
      }
    }
  }
  return out;
}

test('11. his four attacks, his glide, setting off and stopping, and struck paint in every frame both ways round: nothing cyan, his edge round him, every pixel whole or empty but the edge, no lone pixel', () => {
  for (const which of ['attack', 'rings', 'raise', 'fire', 'walk', 'setOff', 'halt', 'reel']) {
    const faults = frameFaults(which);
    assert.equal(faults.length, 0, faults.slice(0, 8).join('; '));
  }
});

test('12. the shards: the skull cocked back behind him, then swung over until it points at you, its jaws open, on the blow', () => {
  assert.equal(FLESHMANCER.attack.motion.hit, FM_SHARDS.hit);
  const held = skeletonAt(FLESHMANCER, 'attack', 0.5);
  const spit = skeletonAt(FLESHMANCER, 'attack', FM_SHARDS.hit);
  const back = staffOf(held).skull[0] - held.pelvis[0];
  const out = staffOf(spit).skull[0] - spit.pelvis[0];
  assert.ok(back < -15, `held back, the skull is ${back.toFixed(1)} before him (behind him)`);
  assert.ok(out > 30, `on the blow the skull is ${out.toFixed(1)} before him`);
  assert.ok(fmJawOf(FM_ATTACKS.shards, FM_SHARDS.hit) >= 3.5, 'its jaws wide as it spits');
  // (where the shards leave it, from in front: before him and lower than where it was held, toward you)
  const m0 = fmMouthAt('attack', 0.5);
  const m1 = fmMouthAt('attack', FM_SHARDS.hit);
  assert.ok(m1[0] > m0[0] + 30 && m1[1] > m0[1], `the jaws at ${m0} held back, at ${m1} as it spits`);
});

test('13. the rings of hands: his claw raised high, slammed down at the floor on the blow, the staff striking the floor; each hand bursts up, grabs, and goes back under', () => {
  assert.equal(FLESHMANCER.more?.rings.motion.hit, FM_RINGS.hit);
  const up = skeletonAt(FLESHMANCER, 'rings', 0.6);
  const down = skeletonAt(FLESHMANCER, 'rings', FM_RINGS.hit);
  assert.ok(up.handL[2] - down.handL[2] > 40, `his claw comes down ${(up.handL[2] - down.handL[2]).toFixed(1)}`);
  const foot = staffOf(down).foot[2];
  assert.ok(foot > 0 && foot < 9, `the staff's foot ${foot.toFixed(1)} off the floor as it strikes it`);
  for (let k = 0; k < FM_HAND_KINDS; k++) {
    const art = makeRingHandArt('front', k);
    assert.equal(art.length, FM_HAND_FRAMES);
    const sizes = art.map((sp) => looked(sp));
    for (const [i, f] of sizes.entries()) assert.ok(!f.cyan && f.odd === 0, `hand ${k}, frame ${i}: ${f.odd} odd${f.cyan ? ', cyan' : ''}`);
    // (up high, then nothing of the arm left above the floor once it is under: only its hole and the stone round it)
    const high = Math.max(...sizes.slice(2, 10).map((f) => f.n));
    const last = sizes[FM_HAND_FRAMES - 1].n;
    assert.ok(high > 250 && last < high * 0.3, `hand ${k}: ${high} pixels up, ${last} in its last frame`);
    assert.ok(FM_HAND_UNDER < FM_HAND_FRAMES / FM_HAND_FPS);
  }
  assert.ok(paintRingHand(0.3).lights.length > 0, 'its fingers burn');
});

test('14. raising the dead: both his hands up over his hood while they come up, the skull shrieking', () => {
  for (let t = 0.9; t < FM_RAISE.hold; t += 0.1) {
    const s = skeletonAt(FLESHMANCER, 'raise', t);
    const hood = fmHoodTop(s);
    assert.ok(s.handL[2] > hood && staffOf(s).skull[2] > hood + 20, `at ${t.toFixed(1)} s his claw is ${s.handL[2].toFixed(0)} up, the skull ${staffOf(s).skull[2].toFixed(0)}, his hood ${hood.toFixed(0)}`);
    assert.ok(fmJawOf(FM_ATTACKS.raise, t) >= 3.5, `at ${t.toFixed(1)} s the skull's jaws are open`);
  }
});

test('15. the sweeping fire: the skull high over his hood while it pours, its jaws wide, and the stream goes round once', () => {
  for (let t = FM_FIRE.pour; t < FM_FIRE.stop; t += 0.2) {
    const s = skeletonAt(FLESHMANCER, 'fire', t);
    assert.ok(staffOf(s).skull[2] > fmHoodTop(s) + 25, `at ${t.toFixed(1)} s the skull is ${staffOf(s).skull[2].toFixed(0)} up`);
    assert.ok(fmJawOf(FM_ATTACKS.fire, t) >= 3.5, `at ${t.toFixed(1)} s the skull's jaws are open`);
  }
  const round = fmFireTurn(FM_FIRE.stop) - fmFireTurn(FM_FIRE.pour);
  assert.ok(Math.abs(round - Math.PI * 2) < 0.01, `it goes ${(round / Math.PI / 2).toFixed(2)} times round`);
});

test('16. his glide: never a foot near the floor, his tails off it, leaning into his way', () => {
  for (let i = 0; i < FLESHMANCER.walkFrames; i++) {
    const t = i / FLESHMANCER.walkFps;
    const s = skeletonAt(FLESHMANCER, 'walk', t);
    const tails = fmTails(fmHemOf(s), 0, 1);
    const lowest = Math.min(...tails.flatMap((x) => x.pts.map((p) => p[2] - x.r)));
    assert.ok(lowest > 4 && Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 2, `at ${t.toFixed(2)} s his tails are ${lowest.toFixed(1)} off the floor`);
    assert.ok(s.head[0] - s.pelvis[0] > 3, `at ${t.toFixed(2)} s he leans ${(s.head[0] - s.pelvis[0]).toFixed(1)} into his way`);
  }
});

test('17. his death: the pit opens under him, he goes under, his hood first and the skull last, and nothing of him is left', () => {
  assert.ok(fmPitAt(0) === 0 && fmPitAt(FM_DEATH.grab) > 15 && fmPitAt(FM_DEATH.long) < 0.5, 'the pit opens and closes');
  const at = (t: number) => skeletonAt(FLESHMANCER, 'dying', t);
  const before = at(FM_DEATH.skull - 0.15);
  assert.ok(fmHoodTop(before) < 0 && staffOf(before).skull[2] > 0, `a moment before the skull goes under, his hood ${fmHoodTop(before).toFixed(0)} and the skull ${staffOf(before).skull[2].toFixed(0)}`);
  assert.ok(staffOf(at(FM_DEATH.skull + 0.1)).skull[2] < -2, 'then the skull goes under');
  for (const view of ['front', 'back'] as const) {
    const n = Math.round(FLESHMANCER.dieTime * 20);
    let was = Infinity;
    for (let i = 0; i <= n; i++) {
      const p = deathOfMob(FLESHMANCER, i / n, view).px;
      let solid = 0;
      let lone = 0;
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          if (p.d[(y * p.w + x) * 4 + 3] !== 255) continue;
          solid++;
          let m = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && x + dx >= 0 && y + dy >= 0 && x + dx < p.w && y + dy < p.h && p.d[((y + dy) * p.w + x + dx) * 4 + 3] === 255) m++;
          if (m === 0) lone++;
        }
      }
      assert.equal(lone, 0, `${view}, death frame ${i}: ${lone} lone pixels`);
      if (i === n) assert.ok(solid < 60, `${view}: ${solid} pixels of him left in his death's last frame`);
      was = solid;
    }
    assert.ok(was < Infinity);
  }
});
