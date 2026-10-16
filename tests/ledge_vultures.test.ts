// FLOOR 7'S VULTURE (src/art/ledge_vultures.ts; a mock-up nothing of the game imports), held to his rulebook before he
// sees its standing picture: about the knight's height, crisp in every frame it has, the enemy's pink edge round it,
// nothing cyan and every light the cult's fire, nothing of it cut off at its canvas's edge, two pink eyes, a pale bald
// head, and its broken cult chain in sight from in front as well as from behind.
//   run: tsx --test tests/ledge_vultures.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { FIG as FIG_VULTURE } from '../src/art/act1_figs/vulture';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME, IRON } from '../src/art/mkit';
import { VULTURE, VULTURE_BODY, VULTURE_DEATH, VULTURE_DIVE, VULTURE_ON, VULTURE_REEL, VULTURE_REST, VULTURE_WALK, lowestOf, vultureDeathPose, vultureDeathSolids, vultureDivePose, vultureDyingPainted, vultureFlinchPose, vulturePainted, vultureStanding, vultureWalkPose } from '../src/art/ledge_vultures';
import { canvasOf, dyingMoment, momentOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { bonesAt, solve } from '../src/art/skeleton';
import { spriteOf3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const IRON_SET = new Set(IRON.map((c) => rgba(c).slice(0, 3).join(',')));

// every move it has (its walk, dive, flinch and death), both views, frame by frame; the flinch and the death every
// twentieth of a second through their own length, as well as the long run
const frames: { name: string; move: string; t: number; view: 'front' | 'back' }[] = [];
for (const view of ['front', 'back'] as const) {
  for (let i = 0; i <= 24; i += 3) frames.push({ name: `stand ${view} ${i}`, move: 'stand', t: i / 10, view });
  for (const move of ['walk', 'attack'] as const) {
    for (let i = 0; i <= 24; i += 3) frames.push({ name: `${move} ${view} ${i}`, move, t: i / 10, view });
  }
  for (const move of ['reel', 'dying'] as const) {
    for (let i = 0; i <= 24; i += 3) frames.push({ name: `${move} ${view} ${i}`, move, t: i / 10, view });
    for (let i = 0; i <= 20; i++) frames.push({ name: `${move} ${view} ${i / 20}`, move, t: i / 20, view });
  }
  for (const t of [0.7, 0.75, 0.8]) frames.push({ name: `the strike ${view} ${t}`, move: 'attack', t, view });
}

function hue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max];
}

function tallOf(sp: Sprite): number {
  const q = paintingOf(sp);
  let top = q.h;
  let bottom = -1;
  for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.d[(y * q.w + x) * 4 + 3] === 255) {
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  return bottom - top + 1;
}

// (ACT 1 IN THE GAME: no longer a mock-up nothing imports. The game holds its pictures through art/act1_figs/vulture.ts
// alone, and its switch goes on with the descent, as the bestiary throws the switches of every kind of it.)
test('in the game through art/act1_figs/vulture.ts alone, its switch thrown with the descent', () => {
  assert.ok(FIG_VULTURE !== null && (FIG_VULTURE.switches ?? []).includes(VULTURE_ON), 'its switch is one the bestiary throws with the descent');
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('ledge_vultures.ts')) continue;
    const at = f.split('\\').join('/');
    if (at === 'art/act1_figs/vulture.ts') continue;
    assert.ok(!/from ['"][^'"]*ledge_vultures['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the vulture`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge round it)', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = vulturePainted(f.t, f.view, f.move);
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    // (a dying thing gives its pink edge up, as the game holds a dying monster: deathOfMob has none)
    if (f.move === 'dying') assert.equal(rim, 0, `${f.name}: ${rim} pixels of pink edge (a dying thing gives it up)`);
    else assert.ok(rim > 80, `${f.name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = vulturePainted(f.t, f.view, f.move);
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its eyes burn the enemy\'s pink: two pink lights, one for each eye, from either side', () => {
  for (const view of ['front', 'back'] as const) {
    const { lights } = vulturePainted(0.4, view);
    const eyes = lights.filter((L) => L.color === ENEMY_RIM);
    assert.equal(eyes.length, 2, `${view}: ${eyes.length} pink eye lights`);
  }
});

test('its size, the knight\'s: about the knight\'s height standing', () => {
  const k = tallOf(vultureStanding(0.4, 'front')) / tallOf(spriteOf3(MOVES3.rear, 0, 'front'));
  assert.ok(k > 0.85 && k < 1.2, `${k.toFixed(2)} times the knight's height`);
});

test('its bald head pale at the top of the picture, and its broken cult chain in sight from in front and behind', () => {
  for (const view of ['front', 'back'] as const) {
    const { px } = vulturePainted(0.4, view);
    let chain = 0;
    let pale = 0;
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
      const i = (y * px.w + x) * 4;
      if (px.d[i + 3] !== 255) continue;
      if (IRON_SET.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) chain++;
      if (y < 110 && px.d[i] > 140 && px.d[i + 1] > 130 && px.d[i + 2] > 120) pale++;
    }
    assert.ok(chain > 20, `${view}: ${chain} pixels of the cult's iron (the chain and the shackle)`);
    // (from behind the bald crown shows as a small pale patch only, the ruff and mantle hiding the rest)
    assert.ok(pale > (view === 'front' ? 30 : 12), `${view}: ${pale} pale pixels at the top (the bald head and neck)`);
  }
});

test('its walk is flight: its feet off the floor all the round, its wings beating up and down once a round', () => {
  let lowest = Infinity;
  let lo = Infinity;
  let hi = -Infinity;
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const s = solve(VULTURE_BODY, bonesAt(VULTURE.walk.motion.keys, VULTURE_REST, i / N));
    for (const p of [s.heelL, s.heelR, s.toeL, s.toeR, s.ankleL, s.ankleR]) lowest = Math.min(lowest, p[2]);
    lo = Math.min(lo, s.handL[2]);
    hi = Math.max(hi, s.handL[2]);
  }
  assert.ok(lowest > 4, `its lowest foot point is ${lowest.toFixed(1)} above the floor (it must not stand on it)`);
  assert.ok(hi - lo > 6, `its hand goes ${(hi - lo).toFixed(1)} up and down in a round`);
  assert.equal(VULTURE.walk.period, VULTURE.walkFrames / VULTURE.walkFps, 'one round is its frames at its frame rate');
});

test('its walk round closes: its first and last moments are the same picture, from either side', () => {
  for (const view of ['front', 'back'] as const) {
    const a = vulturePainted(0, view, 'walk').px;
    const b = vulturePainted(1, view, 'walk').px;
    assert.equal(a.w, b.w);
    assert.equal(a.h, b.h);
    let diff = 0;
    for (let i = 0; i < a.d.length; i++) if (a.d[i] !== b.d[i]) diff++;
    assert.ok(diff === 0, `${view}: ${diff} values differ between the round's start and its end`);
  }
});

// THE RULEBOOK'S CHECKS, added on 14 Oct for the walk's revision and the dive (docs/art/RULEBOOK.md: Animations 1, Movement
// 1 to 7, Monsters 4 and 6, the frame rates): each one a test that runs every time.
const nums = (p: object): Record<string, number> => Object.fromEntries(Object.entries(p).filter(([, v]) => typeof v === 'number')) as Record<string, number>;
const ARM = VULTURE_BODY.upperArm + VULTURE_BODY.foreArm;

test('its walk is sixteen frames a second: the rulebook\'s "monsters walk 16"', () => {
  assert.equal(VULTURE_WALK.fps, 16);
  assert.equal(VULTURE_WALK.frames, 16);
});

test('its dive is thirty frames a second, a key every frame, ending at its long', () => {
  assert.equal(VULTURE_DIVE.fps, 30);
  const keys = VULTURE.attack.motion.keys;
  assert.ok(Math.abs(keys[1].at - keys[0].at - 1 / 30) < 1e-9, 'a key each thirtieth of a second');
  assert.ok(Math.abs(keys[keys.length - 1].at - VULTURE_DIVE.long) < 1e-9, 'it ends at its long');
});

test('its dive holds its strike for a tenth of a second, and moves again after it (Movement 7)', () => {
  const a = nums(vultureDivePose(VULTURE_DIVE.hit));
  for (const t of [VULTURE_DIVE.hit + 1 / 30, VULTURE_DIVE.hit + 2 / 30, VULTURE_DIVE.hit + VULTURE_DIVE.freeze]) {
    const b = nums(vultureDivePose(t));
    for (const f of Object.keys(a)) assert.ok(Math.abs(a[f] - b[f]) < 1e-9, `${f} moves during the freeze, at ${t.toFixed(3)} s`);
  }
  const after = nums(vultureDivePose(VULTURE_DIVE.hit + 0.2));
  assert.ok(Math.abs(after.pitch - a.pitch) > 5, 'it moves again after the freeze');
});

test('its dive winds up: it holds the warning at the top, its wings up high and trembling, its body rearing back (Monsters 4)', () => {
  const hands: number[] = [];
  for (let t = VULTURE_DIVE.warn + 0.02; t < 0.5; t += 0.02) {
    const p = nums(vultureDivePose(t));
    assert.ok(p.lhz > 0.9 * ARM, `at ${t.toFixed(2)} s its wings are only ${p.lhz.toFixed(1)} up`);
    assert.ok(Math.abs(p.pitch - (VULTURE_REST.pitch - 6)) < 3, `at ${t.toFixed(2)} s its body is ${p.pitch.toFixed(1)}`);
    hands.push(p.lhz);
  }
  assert.ok(Math.max(...hands) - Math.min(...hands) > 0.5, 'and its wings tremble in the hold');
});

test('its dive stoops head down: at the strike its body is pitched well past upright (Animations 1)', () => {
  const p = nums(vultureDivePose(VULTURE_DIVE.hit));
  assert.ok(p.pitch >= VULTURE_REST.pitch + 100, `pitched ${p.pitch.toFixed(0)} degrees forward at the strike`);
});

test('its dive sweeps its wings back from the warning to the strike (Animations 1)', () => {
  const up = nums(vultureDivePose(0.35)).lhz;
  const back = nums(vultureDivePose(VULTURE_DIVE.hit)).lhz;
  assert.ok(up - back > ARM * 0.8, `its wings go from ${up.toFixed(1)} to ${back.toFixed(1)} from the warning to the strike`);
});

test('its dive keeps its feet off the floor all the way, the talons at the strike too (Feet and Movement 1)', () => {
  let lowest = Infinity;
  for (let i = 0; i <= 72; i++) {
    const s = solve(VULTURE_BODY, bonesAt(VULTURE.attack.motion.keys, VULTURE_REST, i / 60));
    for (const p of [s.heelL, s.heelR, s.toeL, s.toeR, s.ankleL, s.ankleR]) lowest = Math.min(lowest, p[2]);
  }
  assert.ok(lowest > 4, `its lowest foot point is ${lowest.toFixed(1)} above the floor`);
});

test('its dive ends on the walk\'s first pose, so the walk takes it up again with no jump (Movement 3)', () => {
  const end = nums(vultureDivePose(VULTURE_DIVE.long));
  const w0 = nums(vultureWalkPose(0));
  for (const f of Object.keys(w0)) assert.ok(Math.abs(end[f] - w0[f]) < 1e-6, `${f}: ${end[f]} against the walk's ${w0[f]}`);
});

// ---------------------------------------------------------------------------------------------------------------------
// ITS FLINCH AND ITS DEATH (14 Oct; checked against the art rulebook before he sees them, as his rulebook asks: Hits 3
// and 5, Movement 1, 3, 7 and 8, Animations 1 and 4, Monsters 4 and 6, and the frame rates).

test('its flinch holds for a tenth of a second when it is struck (Movement 7: a heavy blow freezes), then is knocked back', () => {
  const a = nums(vultureFlinchPose(0));
  for (const t of [0.02, 0.05, VULTURE_REEL.freeze]) {
    const b = nums(vultureFlinchPose(t));
    for (const f of Object.keys(a)) assert.ok(Math.abs(a[f] - b[f]) < 1e-9, `${f} moves during the freeze, at ${t} s`);
  }
  const later = nums(vultureFlinchPose(0.2));
  assert.ok(Math.abs(later.pitch - a.pitch) > 5, 'it moves again after the freeze');
});

test('its head snaps back and its wings are flung out wide as it is struck (Animations 1)', () => {
  const w0 = nums(vultureWalkPose(0));
  const snap = nums(vultureFlinchPose(VULTURE_REEL.freeze + 0.06));
  assert.ok(snap.faceUp >= w0.faceUp + 20, `its head comes up ${(snap.faceUp - w0.faceUp).toFixed(0)} degrees: a snap`);
  assert.ok(snap.lhy > w0.lhy + 0.2 * ARM, `its wings are flung out (${snap.lhy.toFixed(1)} against ${w0.lhy.toFixed(1)})`);
});

test('its flinch ends on its walk\'s first pose, so the walk takes it up again with no jump (Movement 3)', () => {
  const end = nums(vultureFlinchPose(VULTURE_REEL.long));
  const w0 = nums(vultureWalkPose(0));
  for (const f of Object.keys(w0)) if (f in end) assert.ok(Math.abs(end[f] - w0[f]) < 1e-6, `${f}: ${end[f]} against the walk's ${w0[f]}`);
});

test('its flinch is thirty frames a second, a key every frame, and ends at its long (moves 30)', () => {
  assert.equal(VULTURE_REEL.fps, 30);
  const keys = VULTURE.reel!.motion.keys;
  for (let i = 1; i < keys.length; i++) assert.ok(Math.abs(keys[i].at - keys[i - 1].at - 1 / 30) < 1e-9, `a key each thirtieth of a second (key ${i})`);
  assert.ok(Math.abs(keys[keys.length - 1].at - VULTURE_REEL.long) < 1e-9, 'it ends at its long');
});

test('its eyes flash gold as it is struck, and fade back to pink in three tenths of a second (Animations 4)', () => {
  const glint = VULTURE.reel!.glint!;
  assert.equal(glint(0.05), 1);
  assert.ok(glint(0.15) > 0 && glint(0.15) < 1, `${glint(0.15).toFixed(2)} at 0.15 s: fading`);
  assert.equal(glint(0.4), 0);
});

test('what a blow throws off (feathers and drops of its blood) lasts half a second, and comes only in its flinch and its death', () => {
  const can = canvasOf(VULTURE);
  const st = stage('front', can.ax, can.ay, can);
  const count = (bits: ReadonlyArray<{ part: string }>): number => bits.filter((b) => b.part === 'shed' || b.part === 'blood').length;
  for (const mv of [VULTURE.stand, VULTURE.attack, VULTURE.walk!]) {
    for (const t of [0, 0.3, 0.6, 0.9]) assert.equal(count(VULTURE.bits(st, momentOf(VULTURE, mv, t))), 0, `${mv.name} at ${t} s throws nothing off`);
  }
  assert.ok(count(VULTURE.bits(st, momentOf(VULTURE, VULTURE.reel!, 0.2))) > 0, 'its flinch throws feathers and blood off at the blow');
  assert.equal(count(VULTURE.bits(st, momentOf(VULTURE, VULTURE.reel!, 0.6))), 0, 'and none by 0.6 s');
  assert.ok(count(VULTURE.bits(st, dyingMoment(VULTURE, 0.2))) > 0, 'its death throws feathers and blood off');
  assert.equal(count(VULTURE.bits(st, dyingMoment(VULTURE, 0.7))), 0, 'and none by 0.7 s');
});

test('its death is thirty frames a second, a key every frame, and ends at its long: a small thing dies quick (Hits 5, moves 30)', () => {
  assert.equal(VULTURE_DEATH.fps, 30);
  const keys = VULTURE.dying!.motion.keys;
  for (let i = 1; i < keys.length; i++) assert.ok(Math.abs(keys[i].at - keys[i - 1].at - 1 / 30) < 1e-9, `a key each thirtieth of a second (key ${i})`);
  assert.ok(Math.abs(keys[keys.length - 1].at - VULTURE_DEATH.long) < 1e-9, 'it ends at its long');
  assert.equal(VULTURE.dieTime, VULTURE_DEATH.long);
  assert.ok(VULTURE.dieTime <= 1.0 + 1e-9, `it dies in ${VULTURE.dieTime} s`);
});

test('its death knocks it from the air and over onto its back by its end, its feet up in the air (Hits 5, Animations 1)', () => {
  const end = nums(vultureDeathPose(VULTURE_DEATH.long));
  assert.ok(end.pitch <= -80, `pitched ${end.pitch.toFixed(0)} degrees: over onto its back`);
  assert.ok(end.lfz > 20 && end.rfz > 20, `its feet are up, ${end.lfz.toFixed(0)} and ${end.rfz.toFixed(0)}`);
});

test('it never sinks into the floor at any moment of its death, and at its end it touches the floor (Movement 1 and 3)', () => {
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const low = lowestOf(vultureDeathSolids(t));
    assert.ok(low >= -0.5, `at ${t.toFixed(2)} s its lowest point is ${low.toFixed(2)}: under the floor`);
  }
  const end = lowestOf(vultureDeathSolids(VULTURE_DEATH.long));
  assert.ok(end <= 0.5, `at its end its lowest point is ${end.toFixed(2)}: it lies on the floor`);
});

test('its feet stay off the floor through its death: it is a flier, and it never lands on them (Movement 8)', () => {
  for (let i = 20; i <= 30; i++) {
    const t = i / 30;
    const legs = vultureDeathSolids(t).filter((b) => b.part === 'legL' || b.part === 'legR');
    const low = lowestOf(legs);
    assert.ok(low > 3, `at ${t.toFixed(2)} s its feet are ${low.toFixed(1)} off the floor`);
  }
});

test('its body falls steadily from the top of its knock to its landing: it only comes down (Movement 3)', () => {
  const pelvisAt = (t: number): number => solve(VULTURE_BODY, bonesAt(VULTURE.dying!.motion.keys, VULTURE_REST, t)).pelvis[2];
  let prev = pelvisAt(0.2);
  for (let i = 7; i <= 18; i++) {
    const t = i / 30;
    const h = pelvisAt(t);
    assert.ok(h <= prev + 0.05, `at ${t.toFixed(2)} s it rises to ${h.toFixed(2)} from ${prev.toFixed(2)}`);
    prev = h;
  }
});

/** The furthest a part of its solids reaches toward −x (its head's side). */
function xReach(bits: ReadonlyArray<{ part: string; shape: any }>, part: string): number {
  let lo = Infinity;
  for (const b of bits) {
    if (b.part !== part) continue;
    const sh = b.shape;
    if (sh.k === 'rod') lo = Math.min(lo, sh.a[0] - sh.ra, sh.b[0] - sh.rb);
    else if (sh.k === 'ball') lo = Math.min(lo, sh.c[0] - Math.hypot(sh.ax[0][0], sh.ax[1][0], sh.ax[2][0]));
    else if (sh.k === 'panel') for (const x of [1, -1]) for (const y of [1, -1]) lo = Math.min(lo, sh.c[0] + x * sh.u[0] + y * sh.v[0]);
    else if (sh.k === 'dot' || sh.k === 'mote' || sh.k === 'glow') lo = Math.min(lo, sh.p[0]);
  }
  return lo;
}

test('its wings lie back along the floor at its end, not forward over its head (the stick it had, measured)', () => {
  const bits = vultureDeathSolids(VULTURE_DEATH.long);
  const head = xReach(bits, 'head');
  for (const w of ['wingL', 'wingR']) {
    const reach = xReach(bits, w);
    assert.ok(reach >= head - 12, `its ${w} reaches ${reach.toFixed(1)}, past its head at ${head.toFixed(1)}`);
  }
});

test('it lies still from 0.75 s to its end: every solid holds, its chain and tail too, and its picture is the same (Animations 1)', () => {
  // (each number to a millionth: the last key is solved by a different path, which differs only in the fifteenth place)
  const solids = (t: number): string => JSON.stringify(vultureDeathSolids(t), (_k, v) => (typeof v === 'number' ? Math.round(v * 1e6) : v));
  const still = solids(VULTURE_DEATH.still);
  for (const t of [0.8, 0.9, VULTURE_DEATH.long]) assert.equal(solids(t), still, `something moves at ${t} s`);
  const a = vultureDyingPainted(VULTURE_DEATH.still).px;
  for (const t of [0.8, 0.9, VULTURE_DEATH.long]) {
    const b = vultureDyingPainted(t).px;
    assert.equal(b.w, a.w);
    assert.equal(b.h, a.h);
    let diff = 0;
    for (let i = 0; i < a.d.length; i++) if (a.d[i] !== b.d[i]) diff++;
    assert.ok(diff === 0, `${diff} values differ at ${t} s from its picture at ${VULTURE_DEATH.still} s`);
  }
});

test('its eyes go out as it lands: its death holds no fire light at its end (Animations 4)', () => {
  for (const view of ['front', 'back'] as const) {
    const { lights } = vultureDyingPainted(VULTURE_DEATH.long, view);
    assert.equal(lights.length, 0, `${view}: ${lights.length} lights at its end`);
  }
});
