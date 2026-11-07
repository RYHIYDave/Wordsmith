// THE SWAMP COLOSSUS, THE NEW DROWNED EYE (art/eye_colossus.ts; a mock-up: stage 1, his look, still). The owner, 7 Nov 2026,
// 00:13: “just scrap his look and start fresh.  big ancient gross eldritch horror swamp monster with tentacles and a big eye.”;
// his pick, “Swamp colossus (Recommended)”; and, shown 3e7b6844: “Eh.  Still not quite it.  Let’s keep the tentacles, they’re still
// split up into sections.  But let’s scrap the body.  I want the eye as the end of the tongue and the whole head to split open down the
// center for the maw.  Spittle and goo all over the place.  And have him like constantly melting and dripping”; 11:17: “And the eye
// waves around like its own tentacle”. What this holds:
//   1. the switch is off, and nothing of the game imports him; nothing of the old Eye (art/drowned_eye.ts) is in him;
//   2. his pictures (his head shut from in front and from behind, split open, under the water, a tentacle alone) are painted: nothing
//      cyan (no colour of the friend's, nothing at the friend's hue), the enemy's pink edge round him while he lives, his eye's iris
//      the enemy's pink and gold;
//   3. his measures: his lengths the game's (TILE3 to a tile), his eye wider than the knight is tall, what a frame of him costs;
//   4. his word of 7 Nov, “he needs to slide back a little so the tentacles don’t clip through him or the stage”: every arm's root
//      under the water before the stone, no arm in him (his head, his tongue, his eye, his drool), none in the stone or its edge
//      (shut, split open, and under the water);
//   5. his head splits: shut, no tooth shows and his eye is out on his tongue before him; split open, his halves stand far apart,
//      rows of teeth along them, his throat between them, his tongue risen out of it, the eye on its tip;
//   6. his tentacles and his tongue, one smooth taper each: sampled close, no step in their thickness, no twist, the suckers in order;
//   7. he melts: drips off his overhangs, gobs falling, splashes, the sheets of his flesh running into drips.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { TILE3 } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import {
  ARM_ALONE, ARM_ROOTS, ARMS_RISEN, ARMS_UNDER, C_TILE, COLOSSUS, EYE2, EYE_OPEN, EYE_SHUT, MAT, STONE, TONGUE_OPEN, TONGUE_SHUT,
  armClearances, costOf, headParts, meltParts, paintColossus, poseArm, poseRisen, poseUnder, tubeSmoothness,
} from '../src/art/eye_colossus';
import type { ColossusPicture, ColossusPose } from '../src/art/eye_colossus';

interface Assert {
  equal(a: unknown, b: unknown, msg?: string): void;
  ok(v: unknown, msg?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
/** The friend's glow: his hue, 160 to 205, at the friend's saturation. */
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
function count(p: ColossusPicture, c: string, alpha?: number): number {
  const [r, g, b] = rgba(c);
  const d = p.px.d;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] && d[i] === r && d[i + 1] === g && d[i + 2] === b && (alpha === undefined || d[i + 3] === alpha)) n++;
  return n;
}
const ofMat = (p: ColossusPicture, m: number): number => p.mat.reduce((n, v) => n + (v === m ? 1 : 0), 0);

// (small, so that the test is quick: a third of the game's size)
const Z = 1 / 3;
const frame = { w: Math.round(1100 * Z), h: Math.round(760 * Z), ax: Math.round(550 * Z), ay: Math.round(520 * Z), zoom: Z };
const POSES: [string, ColossusPose][] = [
  ['shut, from in front', poseRisen(0)],
  ['shut, from behind', poseRisen(0, 'back')],
  ['split open', poseRisen(1)],
  ['under the water', poseUnder()],
  ['a tentacle alone', poseArm()],
];
const PICS = POSES.map(([name, pose]) => [name, paintColossus(pose, frame)] as const);

test('1. the switch is off; nothing of the game imports him; nothing of the old Eye is in him', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/eye_colossus.ts') continue;
    if (/eye_colossus/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_colossus.ts');
  const me = fs.readFileSync(path.join('src', 'art', 'eye_colossus.ts'), 'utf8');
  assert.ok(!/from ['"][^'"]*drowned_eye['"]/.test(me), 'nothing of art/drowned_eye.ts is used');
  assert.ok(!/act1_figs\/eye|act1_rules\/eye/.test(me), 'nor the old Eye\'s pictures or rules');
});

test('2. his pictures: nothing cyan; the pink edge round him while he lives; his iris the enemy\'s pink and gold', () => {
  for (const [name, p] of PICS) {
    let painted = 0;
    for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) painted++;
    assert.ok(painted > 500, `${name}: painted (${painted} pixels)`);
    assert.equal(cyanIn(p), 0, `${name}: nothing cyan`);
    if (name !== 'under the water') assert.ok(count(p, ENEMY_RIM, RIM_ALPHA) > 40, `${name}: the enemy's pink edge round him`);
  }
  for (const i of [0, 2]) {
    const front = PICS[i][1];
    const pinks = count(front, FLAME[2]) + count(front, FLAME[1]);
    const golds = count(front, FLAME[3]) + count(front, FLAME[4]);
    assert.ok(pinks > 6 && golds > 2, `${PICS[i][0]}: his iris burns pink to gold (${pinks} pink, ${golds} gold)`);
  }
});

test('3. his measures: his lengths the game\'s; his eye huge; a frame\'s cost', () => {
  assert.ok(Math.abs(C_TILE - TILE3) < 1e-9, 'his lengths to a tile are the game\'s');
  assert.ok(COLOSSUS.eyeR * 2 > 1.5 * 58, `his eye (${COLOSSUS.eyeR * 2} across) half as wide again as the knight is tall (58)`);
  const c = costOf(30, 1, { w: 1000, h: 500 });
  assert.ok(Math.abs(c.frameMB - (1000 * 500 * 4) / 1048576) < 1e-9 && Math.abs(c.perSecondMB - c.frameMB * 30) < 1e-9, 'a frame at 4 bytes a pixel, 30 a second');
});

test('4. his arms clear of him and of the stone: roots in the water before the stone, none through him, none through the stone', () => {
  for (const [name, pose] of [['shut', poseRisen(0)], ['split open', poseRisen(1)], ['under the water', poseUnder()]] as const) {
    const c = armClearances(pose);
    assert.ok(c.rootsInWater, `${name}: every root under the water before the stone`);
    assert.ok(c.body > 5, `${name}: no arm through him (${c.body.toFixed(1)} of his lengths clear)`);
    assert.ok(c.stone > 5, `${name}: no arm through the stone or its edge (${c.stone.toFixed(1)} clear)`);
  }
  // (the main chat's stone, and where the arms rise along its edge: a third and two thirds; left, middle and right)
  assert.equal(`${STONE.across} x ${STONE.deep}`, '17 x 11', 'the stone 17 tiles across by 11 deep');
  const third = (STONE.across / 6) * C_TILE;
  assert.ok(ARM_ROOTS.under.every((x, i) => Math.abs(x - (i ? third : -third)) < 1.5), 'phase 1 at a third and two thirds along the edge');
  assert.ok(Math.abs(ARM_ROOTS.risen[0] + 2 * third) < 1.5 && ARM_ROOTS.risen[1] === 0 && Math.abs(ARM_ROOTS.risen[2] - 2 * third) < 1.5, 'phases 2 and 3 left, middle, right');
  poseRisen().arms.forEach((a, i) => assert.ok(a.path[0][0] === ARM_ROOTS.risen[i] && a.path[0][1] === ARM_ROOTS.y, `risen arm ${i} rises where its root is said to`));
  poseUnder().arms.forEach((a, i) => assert.ok(a.path[0][0] === ARM_ROOTS.under[i] && a.path[0][1] === ARM_ROOTS.y, `phase 1 arm ${i} rises where its root is said to`));
  assert.ok(STONE.edge / C_TILE > 7.5, `his middle ${(STONE.edge / C_TILE).toFixed(1)} tiles out from the stone`);
});

test('5. his head splits down its seam; his eye is on the end of his tongue', () => {
  const shut = PICS[0][1];
  const open = PICS[2][1];
  assert.equal(ofMat(shut, MAT.tooth), 0, 'shut: his fangs locked away inside his seam');
  assert.ok(ofMat(shut, MAT.eye) > 40 && ofMat(shut, MAT.tongue) > 40, `shut: his tongue out of his seam, the eye on it (${ofMat(shut, MAT.tongue)} tongue, ${ofMat(shut, MAT.eye)} eye)`);
  assert.ok(ofMat(open, MAT.tooth) > 150, `split open: rows of teeth along his inner edges (${ofMat(open, MAT.tooth)})`);
  assert.ok(ofMat(open, MAT.throat) > 150, `split open: his throat between his halves (${ofMat(open, MAT.throat)})`);
  assert.ok(ofMat(open, MAT.strand) > 20, `split open: spittle across the gap (${ofMat(open, MAT.strand)})`);
  const h0 = headParts(0);
  const h1 = headParts(1);
  assert.ok(h1.gap > 250, `split open, his halves ${h1.gap.toFixed(0)} of his lengths apart at his front`);
  assert.ok(h0.eye[1] > h0.frontShut + 20, `shut, his eye out before his head (${h0.eye[1].toFixed(0)} toward the camera; his front ${h0.frontShut.toFixed(0)})`);
  assert.ok(h0.eye[2] < COLOSSUS.tall * 0.7, 'shut, his eye low on his head');
  assert.ok(h1.eye[2] > h0.eye[2] + 150, 'open, his tongue risen out of his throat, the eye high over the split');
  // (the tongue runs from inside his throat to the eye, its last points inside the eye: the eye on its tip)
  for (const [T, E] of [[TONGUE_SHUT, EYE_SHUT], [TONGUE_OPEN, EYE_OPEN]] as const) {
    assert.ok(T[0][1] < -60, 'his tongue rises from deep in his throat');
    const last = T[T.length - 1];
    assert.ok(Math.hypot(last[0] - E[0], last[1] - E[1], last[2] - E[2]) < COLOSSUS.eyeR, 'its tip swollen into the eye');
  }
  assert.equal(TONGUE_SHUT.length, TONGUE_OPEN.length, 'the same tongue shut and open (so that it can move between)');
});

test('6. his tentacles and his tongue: one smooth taper each, no bands, no joints, no steps', () => {
  for (const [name, a] of [...ARMS_RISEN.map((a, i) => [`risen arm ${i}`, a] as const), ...ARMS_UNDER.map((a, i) => [`phase 1 arm ${i}`, a] as const), ['the arm alone', ARM_ALONE[0]] as const]) {
    const s = tubeSmoothness(a);
    assert.ok(s.samples >= 100, `${name}: sampled close (${s.samples})`);
    assert.ok(s.taperOnly, `${name}: only ever thinner toward its tip`);
    assert.ok(s.radiusStep < 1.2, `${name}: no step in its thickness (${s.radiusStep.toFixed(2)})`);
    assert.ok(s.turnDeg < 15, `${name}: its underside carried along it without a twist (${s.turnDeg.toFixed(1)} degrees at most)`);
    assert.ok(s.suckersInOrder, `${name}: its suckers in order along it`);
  }
  for (const [name, T] of [['his tongue shut', TONGUE_SHUT], ['his tongue open', TONGUE_OPEN]] as const) {
    const s = tubeSmoothness({ path: T, r: 0, belly: [0, 0, -1], seed: 9 });
    assert.ok(s.radiusStep < 1.2, `${name}: no step in its thickness (${s.radiusStep.toFixed(2)})`);
  }
});

test('7. he melts: drips off his overhangs, gobs falling off him, splashes; his sheets running into drips', () => {
  const m = meltParts();
  assert.ok(m.drips >= 12, `drips hanging off his overhangs (${m.drips})`);
  assert.ok(m.gobs >= 5, `gobs falling off him (${m.gobs})`);
  assert.ok(m.splashes >= m.gobs, `a splash where each hits the water (${m.splashes})`);
  assert.ok(m.sheetDrips >= 40 && m.longest > 100, `the sheets of his flesh running off him in drips (${m.sheetDrips}, the longest ${m.longest.toFixed(0)})`);
  const shut = PICS[0][1];
  assert.ok(ofMat(shut, MAT.goo) > 300, `goo running down him (${ofMat(shut, MAT.goo)} pixels)`);
});
