// THE SWAMP COLOSSUS'S MOVES, PART 1 (art/eye_moves.ts, painted by art/eye_colossus.ts; a mock-up behind EYE2, off): his stand, his
// lurk under the water and his entrance. The owner, 7 Nov 2026: shown him from his sketch (fe166263), “Yes, build on this”; his
// entrance, his pick “Rises shut, then splits”; then “Nice job that’s awesome”; and, 14:01, the entrance beat by beat: “And we want
// the screen to rumble and water pour off as it rises in the phase transition.  It opens with a big roar, more screen shake, the eye
// stalk comes out, let the moment breathe for a second, tentacles come up, phase 2.” His rules: “Action, like a movie”; every move a
// big held wind-up, a fast strike and a big wind-down; nothing passes through anything; “have him like constantly melting and
// dripping”; “Spittle and goo all over the place”; “And the eye waves around like its own tentacle”. What this holds:
//   1. the switch is off and nothing of the game imports his moves;
//   2. HIS STAND closes on itself: everything of him at the end of his loop is as at its start (his jaws, his throat, his tongue and
//      eye, his tentacles, his sliding flesh, his drips and gobs, his spittle), painted the same;
//   3. HIS ENTRANCE begins where his lurk is and ends on the frame before his stand's first; its beats in his order (the rise, the
//      roar, the eye stalk, the moment breathing, the tentacles, his stand), its strikes fast after a held wind-up;
//   4. nothing cyan; the pink edge round him while he lives, over the water;
//   5. NOTHING THROUGH ANYTHING: his tongue and eye clear of his jaws and teeth, his spittle clear of his tongue (but where it holds
//      a strand), his jaws clear of each other, in every third frame of his stand and every frame of his tongue's unfurling; his
//      tentacles clear of him and of the stone as he stands and as they burst up;
//   6. NEVER STILL: his flesh slides down him, his drips run and let go, his spittle snaps and knits, his jaws breathe, his throat's
//      glow pulses, his tongue weaves like a tentacle and his eye keeps looking at the hero;
//   7. NO LEAPS: from frame to frame, in his loops and where one move hands over to the next;
//   8. the screen: the rumble through his rise, the roar's shake bigger, the dark lifting as he roars, all gone by his stand.
// (art/boss_checks.ts `checkBoss` is for a boss with bones; he has none (he is painted as one solid, art/eye_colossus.ts), so its
// checks are asked here of what he is: THROUGH as 5, JERK and JUMP as 7, BLOW and STRIKE as 3, ALIVE as 6, FLOOR as 5's stone.)
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { ARMS_RISEN, EYE2, EYE_LOOP, SLIDE, STONE, armClearances, bodyClearances, meltGobs, meltSplashes, paintColossus, spitCounts, spitStates } from '../src/art/eye_colossus';
import type { ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { EYE_ENTRANCE, EYE_FPS, EYE_LURK, EYE_SCREEN, EYE_STAND, HERO_SPOT, armBurst, armStand, darkAt, entranceAt, entranceOpen, entranceTongue, eyeFrame, lurkAt, lurkTongue, shakeAt, standAnim } from '../src/art/eye_moves';
import type { EyeFrame } from '../src/art/eye_moves';

interface Assert {
  equal(a: unknown, b: unknown, msg?: string): void;
  ok(v: unknown, msg?: string): void;
  deepEqual(a: unknown, b: unknown, msg?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
declare const process: { stdout: { write(s: string): void } };
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
const E = EYE_ENTRANCE;

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 120 || max - min < 0.4 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 160 && h <= 205;
}
function cyanIn(p: ColossusPicture): number {
  const d = p.px.d;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) n++;
  }
  for (const l of p.lights) {
    const [r, g, b] = rgba(l.color);
    if (FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b)) n++;
  }
  return n;
}
function rims(p: ColossusPicture): number {
  const [r, g, b] = rgba(ENEMY_RIM);
  const d = p.px.d;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === RIM_ALPHA && d[i] === r && d[i + 1] === g && d[i + 2] === b) n++;
  return n;
}
/** All of him in a frame, as one pose (his jaws' frame, all his parts, his tentacles). */
function whole(F: EyeFrame): ColossusPose {
  const an = F.jaws.pose.anim;
  if (!an) throw new Error('a frame of a move');
  const T = F.tongue?.pose.anim;
  return { ...F.jaws.pose, drop: F.jaws.drop, back: F.jaws.back, anim: { ...an, tongue: T ? T.tongue : null, eye: T ? T.eye : an.eye, gaze: T ? T.gaze : an.gaze, lids: T ? T.lids : an.lids, roll: T ? T.roll : 0, swell: T ? T.swell : 1, parts: undefined }, arms: F.arms.filter((a) => a).map((a) => (a as { pose: ColossusPose }).pose.arms[0]) };
}
const Z = 1 / 3;
const small = { w: Math.round(1100 * Z), h: Math.round(760 * Z), ax: Math.round(550 * Z), ay: Math.round(520 * Z), zoom: Z };

test('1. the switch is off; nothing of the game imports his moves', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/eye_moves.ts') continue;
    if (/from ['"][^'"]*eye_moves['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_moves.ts');
});

test('2. his stand closes on itself: the end of his loop is its start', () => {
  assert.equal(EYE_STAND.frames, EYE_LOOP * EYE_FPS, `his stand ${EYE_STAND.frames} frames, ${EYE_LOOP} s at ${EYE_FPS} a second`);
  const a = standAnim(0);
  const b = standAnim(EYE_LOOP);
  const near = (x: unknown, y: unknown): boolean => JSON.stringify(x, (_, v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v)) === JSON.stringify(y, (_, v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v));
  assert.ok(near({ ...a, t: 0 }, { ...b, t: 0 }), 'his jaws, his throat, his tongue, his eye and its gaze: the same at the end of his loop as at its start');
  for (let i = 0; i < 3; i++) assert.ok(near(armStand(i, 0), armStand(i, EYE_LOOP)), `tentacle ${i} the same`);
  assert.ok(near(meltSplashes(a), meltSplashes(b)), 'his drips and gobs the same');
  assert.ok(near(spitStates(a), spitStates(b)), 'his spittle the same');
  // (and painted: his jaws and spittle at the start and at the end of his loop, the same pixels)
  const pa = paintColossus({ view: 'front', drop: 0, body: true, gaze: a.gaze, arms: [], anim: a }, small);
  const pb = paintColossus({ view: 'front', drop: 0, body: true, gaze: b.gaze, arms: [], anim: b }, small);
  let diff = 0;
  for (let i = 0; i < pa.px.d.length; i += 4) if (pa.px.d[i] !== pb.px.d[i] || pa.px.d[i + 1] !== pb.px.d[i + 1] || pa.px.d[i + 2] !== pb.px.d[i + 2] || pa.px.d[i + 3] !== pb.px.d[i + 3]) diff++;
  assert.ok(diff <= 2, `painted the same at the end of his loop as at its start (${diff} pixels differ)`);
  // (his lurk too)
  assert.ok(near(lurkAt(0), lurkAt(EYE_LOOP)) && near(lurkTongue(0), lurkTongue(EYE_LOOP)), 'his lurk closes on itself');
  assert.equal(EYE_LURK.frames, EYE_LOOP * EYE_FPS, 'his lurk a loop of the same length');
});

test('3. his entrance: from his lurk to the frame before his stand\'s first, his beats in his order, each strike fast after a held wind-up', () => {
  // (it begins where his lurk is: the frame after his lurk's last)
  const e0 = eyeFrame('entrance', 0);
  const l0 = eyeFrame('lurk', 0);
  assert.equal(e0.jaws.key, l0.jaws.key, 'his jaws as he lurks');
  assert.ok(Math.abs(e0.jaws.drop - l0.jaws.drop) < 1e-9 && Math.abs(e0.jaws.back - l0.jaws.back) < 1e-9, 'where he lurks');
  assert.equal(JSON.stringify(e0.tongue?.pose.anim?.tongue), JSON.stringify(l0.tongue?.pose.anim?.tongue), 'his tongue as he lurks');
  // (it ends on the frame before his stand's first: its last frame is his stand's last)
  const eN = eyeFrame('entrance', E.frames - 1);
  const s89 = eyeFrame('stand', EYE_STAND.frames - 1);
  for (const part of ['jaws', 'spit', 'tongue'] as const) assert.equal(JSON.stringify(eN[part]), JSON.stringify(s89[part]), `its last frame's ${part} his stand's last`);
  eN.arms.forEach((a, i) => assert.equal(JSON.stringify(a), JSON.stringify(s89.arms[i]), `its last frame's tentacle ${i} his stand's`));
  assert.deepEqual(eN.shake, [0, 0], 'the screen still at its end');
  assert.equal(eN.dark, 0, 'the screen lit again at its end');
  // (his beats in his order: the rise, the roar, the eye stalk, the moment breathing, the tentacles)
  const order = [E.stir[0], E.rise[0], E.strain[0], E.tear[0], E.settle[0], E.stalk[0], E.breathe[0], E.arms[0], E.frames];
  assert.ok(order.every((v, i) => i === 0 || v >= order[i - 1]), `his beats in order: ${order.join(', ')}`);
  // 1. he rises shut, slowly, the screen rumbling
  for (let k = E.rise[0]; k < E.strain[0]; k++) assert.equal(entranceOpen(k), 0, `frame ${k}: shut as he rises`);
  assert.ok((E.rise[1] - E.rise[0]) / EYE_FPS >= 2.4, `he rises slowly (${((E.rise[1] - E.rise[0]) / EYE_FPS).toFixed(1)} s)`);
  let fastest = 0;
  for (let k = E.rise[0]; k < E.rise[1]; k++) fastest = Math.max(fastest, entranceAt(k).drop - entranceAt(k + 1).drop);
  assert.ok(fastest < 6, `never faster than ${fastest.toFixed(1)} of his lengths a frame as he rises`);
  // 2. the roar: the strain held, then his jaws torn apart in four frames, then settling
  assert.ok(E.tear[0] - E.strain[0] >= 18, `the strain held ${E.tear[0] - E.strain[0]} frames`);
  assert.ok(entranceOpen(E.tear[0] - 1) < 0.15 && entranceOpen(E.tear[1] - 1) > 1, 'torn open from shut to wide in the tear');
  assert.ok(E.tear[1] - E.tear[0] <= 4, `the tear ${E.tear[1] - E.tear[0]} frames`);
  let strainStep = 0;
  for (let k = E.strain[0]; k < E.tear[0] - 1; k++) strainStep = Math.max(strainStep, entranceOpen(k + 1) - entranceOpen(k));
  let tearStep = 0;
  for (let k = E.tear[0] - 1; k < E.tear[1] - 1; k++) tearStep = Math.min(Infinity, Math.max(tearStep, entranceOpen(k + 1) - entranceOpen(k)));
  assert.ok(tearStep > 10 * strainStep, `the tear far faster than the strain (${tearStep.toFixed(2)} a frame against ${strainStep.toFixed(3)})`);
  assert.ok(E.settle[1] - E.settle[0] >= 15, `settling ${E.settle[1] - E.settle[0]} frames`);
  // 3. the eye stalk: his tongue out of his throat, its eye snapping open
  assert.equal(entranceTongue(E.stalk[0] - 1), null, 'his tongue drawn in until the stalk');
  const lids = [];
  for (let k = E.stalk[0]; k < E.stalk[1]; k++) lids.push((entranceTongue(k) as { lids: number }).lids);
  assert.ok(lids.filter((v) => v === 0).length > 20 && lids[lids.length - 1] === 1, 'its eye shut as it unfurls, open at the end');
  const opening = lids.filter((v) => v > 0 && v < 1).length;
  assert.ok(opening <= 2, `its eye snaps open (${opening + 1} frames)`);
  // 4. the moment breathes: nothing new comes
  for (let k = E.breathe[0]; k < E.breathe[1]; k++) {
    const F = eyeFrame('entrance', k);
    assert.ok(F.arms.every((a) => a === null) && F.tongue?.key.startsWith('T.s'), `frame ${k}: nothing new, his stand's own`);
  }
  assert.ok((E.breathe[1] - E.breathe[0]) / EYE_FPS >= 1, 'a second of it');
  // 5. the tentacles: each bursts up in two frames after the water bulges over it, held; settling
  for (let i = 0; i < 3; i++) {
    const t = 0;
    assert.equal(armBurst(i, -E.bulge - 1, t), null, `tentacle ${i}: nothing before it stirs`);
    const under = armBurst(i, -1, t) as { path: ReadonlyArray<readonly number[]> };
    const up = armBurst(i, 1, t) as { path: ReadonlyArray<readonly number[]> };
    const tipZ = (a: { path: ReadonlyArray<readonly number[]> }): number => a.path[a.path.length - 1][2];
    assert.ok(tipZ(under) < -20, `tentacle ${i}: still under the water at the end of its wind-up (${tipZ(under).toFixed(0)})`);
    assert.ok(tipZ(up) > 280, `tentacle ${i}: burst up in two frames (its tip ${tipZ(up).toFixed(0)} over the water)`);
    assert.ok(E.bulge >= 8 && E.settleArm >= 15, 'a held wind-up and a long wind-down');
  }
  process.stdout.write(`  his entrance: ${E.frames} frames (${(E.frames / EYE_FPS).toFixed(1)} s); rise ${E.rise[0]}, breaks the water ${E.breaks}, strain ${E.strain[0]}, tear ${E.tear[0]}, stalk ${E.stalk[0]}, eye open ${E.lids[0]}, breathe ${E.breathe[0]}, tentacles ${E.bursts.join(' ')}\n`);
});

test('4. nothing cyan; the pink edge round him while he lives', () => {
  const frames: Array<[string, EyeFrame]> = [['his stand', eyeFrame('stand', 0)], ['shut, risen', eyeFrame('entrance', E.strain[0])], ['tearing open', eyeFrame('entrance', E.tear[0] + 1)], ['his tongue unfurling', eyeFrame('entrance', E.stalk[0] + 18)], ['lurking', eyeFrame('lurk', 0)]];
  for (const [name, F] of frames) {
    const pose = whole(F);
    const p = paintColossus(pose, small);
    assert.equal(cyanIn(p), 0, `${name}: nothing cyan`);
    if (F.jaws.drop < 60) assert.ok(rims(p) > 40, `${name}: the enemy's pink edge round him (${rims(p)})`);
    for (const L of [F.jaws, F.spit, F.tongue, ...F.arms]) if (L) assert.equal(cyanIn(paintColossus(L.pose, { ...small, raw: true })), 0, `${name}: ${L.key}: nothing cyan`);
  }
});

test('5. nothing through anything: his tongue, eye, spittle and jaws; his tentacles clear of him and of the stone', () => {
  for (let k = 0; k < EYE_STAND.frames; k += 3) {
    const c = bodyClearances(whole(eyeFrame('stand', k)));
    assert.ok(c.tongue > 0, `stand ${k}: his tongue clear of his jaws and teeth (${c.tongue.toFixed(1)}; ${c.where})`);
    assert.ok(c.eye > 0, `stand ${k}: his eye clear of his jaws (${c.eye.toFixed(1)})`);
    assert.ok(c.spit > 0, `stand ${k}: his spittle clear of his tongue (${c.spit.toFixed(1)}; ${c.where})`);
    assert.ok(c.jaws > 0, `stand ${k}: his jaws clear of each other (${c.jaws.toFixed(1)})`);
  }
  for (let k = E.stalk[0]; k < E.stalk[1]; k++) {
    // (over the water: below it, inside his throat and the bottom of him, it is not seen)
    const c = bodyClearances(whole(eyeFrame('entrance', k)), 0);
    assert.ok(c.tongue > 0 && c.eye > 0, `unfurling, frame ${k}: his tongue and eye clear of his jaws and teeth (${c.tongue.toFixed(1)}, ${c.eye.toFixed(1)}; ${c.where})`);
  }
  // (shut and tearing open: his jaws pressed together never through each other)
  for (const k of [E.strain[0], E.tear[0], E.tear[0] + 1, E.tear[0] + 2]) {
    const c = bodyClearances(whole(eyeFrame('entrance', k)));
    assert.ok(c.jaws > 0, `frame ${k}: his jaws clear of each other (${c.jaws.toFixed(1)})`);
  }
  // (his tentacles, standing and bursting up: clear of him and of the stone, their roots in the water)
  const check = (name: string, F: EyeFrame): void => {
    const c = armClearances(whole(F));
    assert.ok(c.body > 0, `${name}: his tentacles clear of him (${c.body.toFixed(1)})`);
    assert.ok(c.stone > 0, `${name}: clear of the stone (${c.stone.toFixed(1)})`);
  };
  for (let k = 0; k < EYE_STAND.frames; k += 6) check(`stand ${k}`, eyeFrame('stand', k));
  for (let k = E.arms[0]; k < E.frames; k += 2) check(`entrance ${k}`, eyeFrame('entrance', k));
  assert.equal(ARMS_RISEN.length, 3, 'three tentacles in phase 2');
  assert.ok(STONE.edge > 0, 'the stone');
});

test('6. never still: his flesh slides, his drips run and let go, his spittle snaps and knits, his jaws breathe, his tongue weaves', () => {
  // (the sheets of his flesh slide down him a loop's time each; the drips off his overhangs let go and splash)
  assert.ok(SLIDE.n >= 3 && (SLIDE.top - SLIDE.bottom) / EYE_LOOP > 20, `his flesh sliding down him at ${((SLIDE.top - SLIDE.bottom) / EYE_LOOP).toFixed(0)} of his lengths a second`);
  let gobs = 0;
  let whole = 0;
  let snapped = 0;
  let openMin = 9;
  let openMax = 0;
  let glowMin = 9;
  let glowMax = 0;
  const eyes: number[][] = [];
  let looks = 1;
  for (let k = 0; k < EYE_STAND.frames; k++) {
    const a = standAnim(k / EYE_FPS);
    gobs += meltGobs(a);
    const s = spitStates(a);
    whole = Math.max(whole, s.whole);
    snapped = Math.max(snapped, s.snapped);
    openMin = Math.min(openMin, a.open);
    openMax = Math.max(openMax, a.open);
    glowMin = Math.min(glowMin, a.glow);
    glowMax = Math.max(glowMax, a.glow);
    eyes.push([...a.eye]);
    const h = [HERO_SPOT[0] - a.eye[0], HERO_SPOT[1] - a.eye[1], HERO_SPOT[2] - a.eye[2]];
    const hl = Math.hypot(h[0], h[1], h[2]);
    looks = Math.min(looks, (a.gaze[0] * h[0] + a.gaze[1] * h[1] + a.gaze[2] * h[2]) / hl);
  }
  assert.ok(gobs > 30, `gobs letting go of him, falling and landing (${gobs} gobs in the air in his loop's frames)`);
  const c = spitCounts();
  assert.ok(c.across >= 6 && whole >= 3 && snapped >= 2, `his spittle across his maw (${c.across} strands; at most ${whole} whole and ${snapped} snapped at once)`);
  assert.ok(c.seam >= 6 && c.seamFlesh >= 2, `strings of his flesh and spittle across his seam to snap as he tears open (${c.seam}, ${c.seamFlesh} of flesh)`);
  assert.ok(openMax - openMin > 0.08, `his jaws breathing (${openMin.toFixed(2)} to ${openMax.toFixed(2)} open)`);
  assert.ok(glowMax - glowMin > 0.3, `his throat's glow pulsing (${glowMin.toFixed(2)} to ${glowMax.toFixed(2)})`);
  const xs = eyes.map((e) => e[0]);
  const zs = eyes.map((e) => e[2]);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 60 && Math.max(...zs) - Math.min(...zs) > 15, `his eye waving like a tentacle (${(Math.max(...xs) - Math.min(...xs)).toFixed(0)} across, ${(Math.max(...zs) - Math.min(...zs)).toFixed(0)} up and down)`);
  assert.ok(looks > 0.3, `his eye always looking toward the hero (${looks.toFixed(2)} at the least)`);
});

test('7. no leaps: frame to frame in his loops, and where one move hands over to the next', () => {
  // (his eye, his tentacles' tips, how open he is: the most any frame moves against the usual, his loop's own step among them)
  const series = (move: 'stand' | 'lurk' | 'entrance', from: number, to: number, f: (F: EyeFrame) => number[], wrap: boolean): { worst: number; mean: number; at: number } => {
    const v: number[][] = [];
    for (let k = from; k < to; k++) v.push(f(eyeFrame(move, k)));
    if (wrap) v.push(v[0]);
    const steps = v.slice(1).map((q, i) => Math.hypot(...q.map((x, c) => x - v[i][c])));
    const mean = steps.reduce((a, b) => a + b, 0) / steps.length;
    let worst = 0;
    let at = 0;
    steps.forEach((s, i) => {
      if (s > worst) {
        worst = s;
        at = from + i;
      }
    });
    return { worst, mean, at };
  };
  const eye = (F: EyeFrame): number[] => [...(F.tongue?.pose.anim?.eye ?? [0, 0, 0])];
  const tips = (F: EyeFrame): number[] => F.arms.flatMap((a) => (a ? a.pose.arms[0].path[a.pose.arms[0].path.length - 1] : [0, 0, 0]));
  for (const [name, s] of [['his eye standing', series('stand', 0, EYE_STAND.frames, eye, true)], ['his tentacles standing', series('stand', 0, EYE_STAND.frames, tips, true)], ['his eye lurking', series('lurk', 0, EYE_LURK.frames, eye, true)]] as const) {
    assert.ok(s.worst < 2.2 * s.mean + 0.5, `${name}: no frame leaps (the most ${s.worst.toFixed(2)} at ${s.at}, the usual ${s.mean.toFixed(2)})`);
  }
  // (his entrance into his stand: the step from its last frame to his stand's first, against his stand's own steps)
  const st = series('stand', 0, EYE_STAND.frames, eye, true);
  const last = eye(eyeFrame('entrance', E.frames - 1));
  const first = eye(eyeFrame('stand', 0));
  const step = Math.hypot(...last.map((x, c) => x - first[c]));
  assert.ok(step < 2.2 * st.mean + 0.5, `into his stand without a leap (${step.toFixed(2)})`);
  // (his tongue unfurling: fast but no frame teleports; into his stand's weave without a leap)
  const un = series('entrance', E.stalk[0], E.breathe[0] + 4, eye, false);
  assert.ok(un.worst < 40, `his tongue unfurling: no leap of its eye (${un.worst.toFixed(1)} at the most, at ${un.at})`);
  // (where he is as he lurks, stirs and rises; how open he is outside his tear)
  const riseSteps: number[] = [];
  for (let k = E.rise[0]; k < E.rise[1]; k++) riseSteps.push(Math.hypot(entranceAt(k + 1).drop - entranceAt(k).drop, entranceAt(k + 1).back - entranceAt(k).back));
  const riseMean = riseSteps.reduce((a, b) => a + b, 0) / riseSteps.length;
  const worstRise = Math.max(...riseSteps);
  assert.ok(worstRise < 1.8 * riseMean, `no leap as he rises (${worstRise.toFixed(1)} of his lengths at the most, ${riseMean.toFixed(1)} the usual)`);
  let gather = 0;
  for (let k = 0; k < E.rise[0]; k++) gather = Math.max(gather, Math.hypot(entranceAt(k + 1).drop - entranceAt(k).drop, entranceAt(k + 1).back - entranceAt(k).back));
  assert.ok(gather < riseMean, `none as he gathers himself (${gather.toFixed(1)})`);
  for (let k = 0; k < E.frames - 1; k++) {
    if (k >= E.tear[0] - 1 && k < E.tear[1]) continue;
    assert.ok(Math.abs(entranceOpen(k + 1) - entranceOpen(k)) < 0.1, `frame ${k}: his jaws never leap outside the tear (${entranceOpen(k).toFixed(3)} to ${entranceOpen(k + 1).toFixed(3)})`);
  }
});

test('8. the screen: the rumble through his rise, the roar\'s shake bigger, the dark lifting as he roars, all gone by his stand', () => {
  let rumble = 0;
  let roar = 0;
  for (let k = 0; k < E.frames; k++) {
    const [x, y] = shakeAt(k);
    const m = Math.max(Math.abs(x), Math.abs(y));
    if (k >= EYE_SCREEN.rumble[0] && k < EYE_SCREEN.rumble[1]) rumble = Math.max(rumble, m);
    if (k >= EYE_SCREEN.roar[0] && k < EYE_SCREEN.roar[2]) roar = Math.max(roar, m);
  }
  assert.ok(rumble >= 1 && rumble <= 3, `the rumble (${rumble} game pixels)`);
  assert.ok(roar >= 2 * rumble, `the roar's shake bigger (${roar} game pixels)`);
  assert.ok(EYE_SCREEN.rumble[0] < E.rise[0] && EYE_SCREEN.rumble[1] === E.tear[0], 'rumbling all through his rise, until he roars');
  assert.ok(darkAt(E.rise[0] + 20) > 0.3 && darkAt(E.tear[0] + 20) === 0, 'dark as he rises, lit again as he roars');
  assert.equal(EYE_SCREEN.roarSound, E.tear[0], 'the roar\'s sound as his jaws tear apart');
  for (let k = E.settle[1] + 20; k < E.frames; k++) {
    const s = shakeAt(k);
    if (E.bursts.some((b) => k >= b && k < b + EYE_SCREEN.joltLong)) continue;
    assert.deepEqual(s, [0, 0], `frame ${k}: the screen still`);
  }
});
