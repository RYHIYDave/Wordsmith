// ACT 1, FLOORS 6 TO 10: THE CULT'S CAMP, the set's own pieces for every floor of the five (a mock-up;
// nothing of the game imports it).
//
// His rule for a set from the second on (10 Oct, 14:54): "Going forward, let’s do 25 that are the theme
// of the 5 levels, then 25 for each boss." The theme of these five is the cult's siege of the town and
// the hero coming down behind its lines (12 Oct, 17:01). Five of the set's 25 are drawn already, for the
// strongholds (art/act1_cult.ts: the altar of the words, the brazier, the banner; art/redoubt.ts: the
// ring of magic, the hanging); these are the other twenty, the cult on the march and dug in: where it
// sleeps, eats, keeps its stores and its captives, watches the road and the cliffs, and lays its traps.
// Asked as a pop-up "Are these the rest of the Quarry's pieces?", his pick by 13:16 on 13 Oct: "Yes, on
// to the cult camp (Recommended)", offered as: next the cult's camp pieces for floors 6 to 10 (tents,
// fires, cages, barricades).
//
// The planning chat's mock-ups he said yes to give the camp its look: the cult's violet tents, its fires
// of pink, its banners, its crates and its hoist at a cliff's edge (src/dev/preview_act1.ts: the Ledge
// Road's reveal, the canyon's tops, the Pinewood's siege camp).
//
// THE RULES THEY KEEP (his art rulebook): pink burning to gold glows only on the enemy: the cult's fire
// (its watchfire, the fire under its cauldron, its fire trap; FLAME, the game's enemy fire) and nothing
// else; its mark is floor 5's shrieking skull (`shriekAt`), painted bone-pale on its cloth and dark on its
// hides; no letters; the cloth a step quieter than any word; crisp pixels, two to a game pixel; light from
// the upper left; the indigo seam; everything that stands stands on its foot.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CLOTH, PAINT, PAINT_SHADE, SLATE, pinkFlame } from './act1_cult';
import { IRON, ROCK, ROPE, TIMBER, add, beamAxes, cross, dot, finish, fr, mul, norm, rope, seenNormal, sub, tileUV, timber } from './floor6';
import { shriekAt } from './floor5';
import { Scene, XYZ, facetOf, skull, toneAt } from './floor4';
import type { V3 } from './floor4';
import { TOWARD } from './floor2';
import type { Piece } from './floorkit';
import { GRAIN, compose, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';

// =================================================================================================
// The colours

/** Hides, tanned and weathered: the lean-to's, the bedroll's, the drum's head. */
const HIDE: Ramp = ['#3e322f', '#5a4a42', '#7a6656', '#98826c', '#b29c84'];
/** Clay, fired and dull: the firepots. */
const CLAY: Ramp = ['#3a2c2c', '#56403a', '#76584a', '#93725c', '#ab8b70'];
/** Bone in the daylight, bleached. */
const SUN_BONE: Ramp = ['#5a5260', '#83797e', '#ada396', '#d2c8b6', '#e8e0cf'];
/** Wood dead and silvered by the weather: the dead tree. */
const DEADWOOD: Ramp = ['#2c2730', '#433c44', '#5c5358', '#776c6c', '#91857f'];
/** Wood burnt black, its edges grey. */
const CHAR: Ramp = ['#17131a', '#231d24', '#342b30', '#4a3e3e', '#625450'];
/** Ash, cold and grey. */
const ASH: Ramp = ['#3b3741', '#55515b', '#75717a', '#97929a', '#b5b0b4'];
/** Grain spilt from a sack. */
const GRAIN_PALE: Ramp = ['#5e5648', '#7c725e', '#9a8f76', '#b8ad90', '#d0c6a8'];
/** The deep dark inside a tent or a pot. */
const INSIDE = '#120d18';

// =================================================================================================
// Helpers

/**
 * A ROUND THING STANDING UP (a pot, a drum, a tent's wall, a cone of roof): its radius `rAt(z)` from z0
 * to z1 about `c`; `shade(n, a, z)` its colour at the angle `a` round it and the height `z`; its back half
 * not painted (the front covers it).
 */
function turned(S: Scene, c: V3, z0: number, z1: number, rAt: (z: number) => number, shade: (n: V3, a: number, z: number) => string | null, id: number): void {
  for (let z = z0; z <= z1; z += 0.5) {
    const r = rAt(z);
    if (r <= 0) continue;
    const slope = -(rAt(Math.min(z1, z + 0.5)) - rAt(Math.max(z0, z - 0.5))) / Math.max(0.5, Math.min(z1, z + 0.5) - Math.max(z0, z - 0.5));
    const da = 0.55 / (r + 1);
    for (let a = -Math.PI; a < Math.PI; a += da) {
      const n = norm([Math.cos(a), Math.sin(a), slope]);
      if (dot(n, TOWARD) < -0.3) continue;
      const q: V3 = add(c, [Math.cos(a) * r, Math.sin(a) * r, z]);
      const col = shade(n, a, z);
      if (!col) continue;
      const [x, y] = S.at(q);
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), col, id, q[2]);
    }
  }
}

/** The way an angle round a thing looks toward the eye (the front of a round thing). */
const FRONT = Math.atan2(TOWARD[1], TOWARD[0]);

/** The cult's mark painted on a round thing's side, `a0` round it, `zc` up, `w` across (world units) and `h` up: what of it falls at (a, z). */
function markOnRound(a: number, z: number, r: number, a0: number, zc: number, w: number, h: number): 'bone' | 'dark' | null {
  const s = ((((a - a0 + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
  return shriekAt((s * r) / (w / 2), (z - zc) / (h / 2));
}

/** A FLAME LAYER under or over a scene: the cult's fire at a scene's point, body and tongues, frame `f`. */
function cultFire(p: Px, x: number, y: number, f: number, size: number): void {
  const lean = [1, -2, 2, -1][f % 4];
  pinkFlame(p, x, y + 1, Math.round(12 * size), 8.5 * size, lean * 0.5);
  pinkFlame(p, x - 2, y - 2, Math.round((18 + [2, 6, 0, 5][f % 4]) * size), 4.6 * size, lean);
  pinkFlame(p, x + 4, y - 1, Math.round((12 + [5, 0, 6, 2][f % 4]) * size), 3.2 * size, lean + 1.5);
  pinkFlame(p, x - 6, y, Math.round((9 + [0, 4, 2, 5][f % 4]) * size), 2.6 * size, lean - 1.5);
}

/** Sparks rising off a fire, two pixels each. */
function sparks(p: Px, x: number, y: number, f: number, n: number, reach: number): void {
  for (let k = 0; k < n; k++) {
    const sy = Math.round(y - reach * 0.55 - ((f * 7 + k * 11) % Math.round(reach * 0.6)));
    const sx = Math.round(x + Math.sin(f + k * 2.1) * 7);
    p.set(sx, sy, FLAME[3]).set(sx, sy - 1, FLAME[4]);
  }
}

/** A ring of stones round a fire, on the floor. */
function fireStones(S: Scene, R: number, id: number): void {
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 + hash(k, 1, 1101) * 0.3;
    S.egg([Math.cos(a) * R, Math.sin(a) * R, 2], XYZ, [3.4 + hash(k, 2, 1101) * 1.2, 3 + hash(k, 3, 1101), 2.8], facetOf(ROCK, 0.08), id);
  }
}

/** The light of the cult's fire at a scene's point (picture pixels), in game pixels for the sprite. */
const fireLight = (x: number, y: number, r: number, a: number): Light => ({ x: x / GRAIN, y: y / GRAIN, r, color: FLAME[2], a });

// =================================================================================================
// WHERE THEY SLEEP

/**
 * THE CULT'S TENT: a ridge tent of the cult's violet cloth, its ridge running back up the screen to the
 * right (along y), its near end toward the lower left in the light, its long side in shade with the
 * shrieking skull painted on it bone-pale; its panels sewn, its hem dusty, its ridge pole out at both
 * ends, guy ropes to pegs. `open`: its door flaps tied back on the dark inside; else shut, the slit
 * between them. 116 x 100 at (58, 70).
 */
function cultTent(open: boolean): Sprite {
  const S = new Scene(new Px(116, 100), 58, 70);
  const L = 30;
  const B = 24;
  const HR = 46;
  // the long side toward the eye (+x), and the far one, seen only where the near end does not cover it
  const side = (sx: number, id: number): void => {
    const q: [V3, V3, V3, V3] = [[0, -L, HR], [0, L, HR], [sx * B, L, 2], [sx * B, -L, 2]];
    const n = seenNormal(q);
    S.quad(q, (u, v, w) => {
      if (v > 0.95) return CLOTH[1]; // its hem
      if (Math.abs(fr(u * 4) - 0.5) > 0.47) return CLOTH[1]; // the seams of its panels
      if (sx > 0) {
        const m = shriekAt((w[1] - 1) / 9, -(v - 0.42) / 0.19);
        if (m === 'bone') return u > 0.55 ? PAINT_SHADE : PAINT;
      }
      const sag = Math.sin(fr(u * 4) * Math.PI) * 0.12; // the cloth sags between the guys
      return toneAt(n, CLOTH, -0.02 + sag - (v > 0.82 ? 0.12 : 0));
    }, id);
  };
  side(1, 1);
  side(-1, 2);
  // the near end, and its door
  const endQ: [V3, V3, V3, V3] = [[-B, L, 2], [-0.6, L, HR], [0.6, L, HR], [B, L, 2]];
  const en = seenNormal(endQ);
  S.quad(endQ, (_u, _v, w) => {
    const x = w[0];
    const z = w[2];
    if (z < 3.5) return CLOTH[2]; // its hem
    const gap = 11 * (1 - z / 36);
    if (open) {
      if (Math.abs(x) < gap && z < 36) return INSIDE;
      if (Math.abs(x) < gap + 3.2 && z < 34) return Math.abs(x) - gap < 1.4 ? CLOTH[4] : CLOTH[2]; // the flaps rolled and tied back
    } else if (Math.abs(x) < 0.9 && z < 36) return CLOTH[0]; // the slit between the flaps
    if (Math.abs(x) < 7 && z > 37 && z < 40) return CLOTH[2]; // a seam across
    return toneAt(en, CLOTH, 0.08 - Math.abs(x) * 0.004);
  }, 3);
  // the ridge pole, out at both ends, and the uprights' heads
  S.rod([0, -L - 4, HR + 0.5], [0, L + 4, HR + 0.5], 1.2, 1.2, TIMBER, 4);
  S.rod([0, L + 1.5, HR], [0, L + 1.5, HR + 6], 1.1, 0.9, TIMBER, 5);
  S.rod([0, -L - 1.5, HR], [0, -L - 1.5, HR + 6], 1.1, 0.9, TIMBER, 5);
  // the guy ropes and their pegs
  const guy = (a: V3, b: V3, id: number): void => {
    rope(S, a, b, 0, id, 0.5);
    S.rod(b, add(b, [0, 0, 3]), 0.9, 0.7, TIMBER, id + 1);
  };
  guy([0, L + 4, HR + 0.5], [0, L + 18, 0], 6);
  guy([0, -L - 4, HR + 0.5], [0, -L - 18, 0], 8);
  for (const y of [-L + 6, L - 6]) guy([B, y, 2.5], [B + 9, y + (y > 0 ? 3 : -3), 0], 10);
  return finish(S, 58, 70);
}

/**
 * THE CULT'S PAVILION, its leader's: a round tent, its wall of the cult's violet in broad stripes of two
 * tones, a scalloped valance round the eaves, the roof rising to a pole with a pennant; its door toward
 * the eye, open on the dark, and the shrieking skull painted bone-pale either side of it. 112 x 140 at
 * (56, 118).
 */
function pavilion(): Sprite {
  const S = new Scene(new Px(112, 140), 56, 118);
  const R = 34;
  const WALL = 30;
  const TOP = 76;
  // its wall
  turned(S, [0, 0, 0], 0, WALL, () => R, (n, a, z) => {
    const da = Math.abs(((a - FRONT + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
    if (da < 0.26 && z < 25) return z > 22 || da > 0.2 ? CLOTH[4] : INSIDE; // the door, its edges rolled
    for (const off of [-0.62, 0.62]) {
      const m = markOnRound(a, z, R, FRONT + off, 15, 16, 20);
      if (m === 'bone') return dot(n, [-0.7, 0.7, 0]) > 0 ? PAINT : PAINT_SHADE;
    }
    const stripe = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 16) % 2;
    if (z < 2) return CLOTH[1];
    return toneAt(n, CLOTH, stripe ? 0.05 : -0.22);
  }, 1);
  // the roof, a cone, over the eaves
  turned(S, [0, 0, 0], WALL, TOP, (z) => (R + 3) * (1 - (z - WALL) / (TOP - WALL)), (n, a) => {
    const k = ((a + Math.PI) / (2 * Math.PI)) * 16;
    if (Math.abs(fr(k) - 0.5) > 0.46) return CLOTH[1]; // its seams
    return toneAt(n, CLOTH, Math.floor(k) % 2 ? 0.12 : -0.1);
  }, 2);
  // the valance round the eaves: scallops hanging
  turned(S, [0, 0, 0], WALL - 5, WALL, () => R + 3.2, (n, a, z) => {
    const k = fr(((a + Math.PI) / (2 * Math.PI)) * 32);
    const reach = 5 * Math.sin(k * Math.PI);
    if (z < WALL - reach) return null;
    return z > WALL - 1.2 ? CLOTH[4] : toneAt(n, CLOTH, -0.15);
  }, 3);
  // the pole and its pennant
  S.rod([0, 0, TOP - 2], [0, 0, TOP + 16], 1.2, 1, TIMBER, 4);
  S.quad([[0, 0, TOP + 15], [0, -15, TOP + 13], [0, -15, TOP + 11], [0, 0, TOP + 8]], (u, v) => (v < 0.2 || u > 0.9 ? CLOTH[2] : CLOTH[3]), 5);
  return finish(S, 56, 118);
}

/** A BEDROLL: a hide laid on the floor, a violet blanket on it, a roll for the head; or rolled up and tied (`rolled`). 64 x 44 at (32, 28). */
function bedroll(rolled: boolean): Sprite {
  const S = new Scene(new Px(64, 44), 32, 28);
  if (!rolled) {
    S.box([0, 0, 0.8], XYZ, [11, 22, 0.8], (f, u, v, n) => (f === 4 ? (Math.abs(fr(v * 5) - 0.5) > 0.46 ? HIDE[1] : HIDE[2]) : toneAt(n, HIDE, -0.1)), 1);
    S.egg([0, 4, 1.8], XYZ, [10, 15, 2.2], (n, w) => (Math.abs(w[0]) > 8.6 ? CLOTH[2] : toneAt(n, CLOTH, 0.1)), 2);
    S.rod([-8, -16, 3], [8, -16, 3], 3, 3, HIDE, 3);
  } else {
    S.rod([-12, 2, 4.6], [12, -2, 4.6], 4.6, 4.6, CLOTH, 1);
    S.egg([12.4, -2.1, 4.6], beamAxes([0, 0, 0], [1, -0.17, 0]), [0.6, 4.4, 4.4], (_n, w) => (Math.hypot(w[1] + 2.1, w[2] - 4.6) % 2 < 1 ? HIDE[2] : CLOTH[1]), 2);
    for (const t of [-6, 6]) S.rod([t, 2 - t / 6 + 0.3, 0.2], [t, 2 - t / 6 + 0.3, 9.4], 0.6, 0.6, ROPE, 3);
  }
  return finish(S, 32, 28);
}

/**
 * A LEAN-TO: hides stitched together over a ridge pole between two forked posts at its back, sloping
 * down toward the lower left where they are pegged to the ground, in the light; a bedroll and a pack
 * showing at its open side. 92 x 80 at (46, 60).
 */
function leanTo(): Sprite {
  const S = new Scene(new Px(92, 80), 46, 60);
  const BACK = -12;
  for (const x of [-22, 22]) {
    S.rod([x, BACK, 0], [x, BACK, 32], 1.4, 1.2, TIMBER, 1);
    S.rod([x, BACK, 30], [x - 2, BACK - 2, 37], 0.9, 0.8, TIMBER, 1);
    S.rod([x, BACK, 30], [x + 2, BACK + 2, 37], 0.9, 0.8, TIMBER, 1);
  }
  S.rod([-26, BACK, 34], [26, BACK, 34], 1.3, 1.3, TIMBER, 2);
  const q: [V3, V3, V3, V3] = [[-24, BACK, 34], [24, BACK, 34], [24, 22, 0.5], [-24, 22, 0.5]];
  const n = seenNormal(q);
  S.quad(q, (u, v, w) => {
    const su = u * 3 + Math.sin(v * 9 + Math.floor(u * 3)) * 0.06;
    const sv = v + Math.sin(u * 11) * 0.03;
    const hideK = Math.floor(su) + (sv > 0.5 ? 3 : 0);
    // its foot ragged where the hides end
    if (v > 0.9 && v > 0.93 + (hash(Math.floor(u * 24), 2, 1113) - 0.5) * 0.08) return null;
    if (Math.abs(fr(su) - 0.5) > 0.47 || Math.abs(sv - 0.5) < 0.022) return hash(Math.floor(w[0] / 1.5), Math.floor(w[1] / 1.5), 1114) > 0.5 ? HIDE[0] : HIDE[1]; // the stitched seams
    if (hash(Math.floor(w[0]), Math.floor(w[1] * 0.8), 1115 + hideK) > 0.9) return HIDE[hideK % 2 ? 1 : 3]; // the hair of the hide
    return toneAt(n, HIDE, (hash(hideK, 1, 1113) - 0.5) * 0.5 - 0.05);
  }, 3);
  for (const x of [-20, 0, 20]) S.rod([x, 23, 0], [x, 23.5, 3], 0.8, 0.6, TIMBER, 4);
  // showing at its open side, toward the lower right
  S.rod([22, 2, 3], [30, 0, 3], 3, 3, CLOTH, 5);
  S.egg([27, 10, 5], XYZ, [5, 4.4, 5], (nn) => toneAt(nn, HIDE, 0.1), 6);
  S.rod([27, 10, 10], [28.5, 10, 12], 0.9, 0.9, ROPE, 7);
  return finish(S, 46, 60);
}

// =================================================================================================
// WHERE THEY EAT AND KEEP WARM

/** THE CULT'S WATCHFIRE: logs stacked to a point in a ring of stones, the cult's pink fire roaring up from them, sparks (4 frames, about 8 a second); its pink light. 64 x 96 at (32, 82). */
function watchfire(f: number): Sprite {
  const S = new Scene(new Px(64, 96), 32, 82);
  fireStones(S, 14, 1);
  S.egg([0, 0, 0.4], XYZ, [11, 11, 0.6], (_n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 1102 + f) > 0.72 ? FLAME[1] : ASH[1]), 2);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.4;
    S.rod([Math.cos(a) * 10, Math.sin(a) * 10, 1.4], [Math.cos(a) * 1.5, Math.sin(a) * 1.5, 18], 2, 1.4, CHAR, 3 + k);
  }
  S.seams();
  const [bx, by] = S.at([0, 0, 6]);
  cultFire(S.p, Math.round(bx), Math.round(by), f, 1.25);
  sparks(S.p, Math.round(bx), Math.round(by), f, 4, 44);
  const s = compose(null, [S.p], null).sprite(32, 82, GRAIN);
  s.lights = [fireLight(bx, by - 16, 44 + (f % 2) * 2, 0.46)];
  return s;
}

/** A COLD FIRE: a ring of stones round grey ash and the black stubs of logs, burnt out; nothing glows. 56 x 40 at (28, 26). */
function coldFire(): Sprite {
  const S = new Scene(new Px(56, 40), 28, 26);
  fireStones(S, 13, 1);
  S.egg([0, 0, 0.5], XYZ, [11, 11, 0.8], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 1103) > 0.7 ? ASH[3] : toneAt(n, ASH, -0.1)), 2);
  S.rod([-6, -2, 1.4], [5, 3, 1.6], 1.8, 1.4, CHAR, 3);
  S.rod([2, -6, 1.4], [-1, 6, 1.4], 1.6, 1.3, CHAR, 4);
  return finish(S, 28, 26);
}

/**
 * THE CULT'S CAULDRON: an iron pot hung by a chain from three poles lashed at their tops, the cult's pink
 * fire under it among its logs, its brew dark and bubbling (4 frames, about 8 a second); the fire's pink
 * light. 72 x 104 at (36, 88).
 */
function cauldron(f: number): Sprite {
  const S = new Scene(new Px(72, 104), 36, 88);
  const flames = new Px(72, 104);
  // the three poles, the lashing, the chain
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.9;
    S.rod([Math.cos(a) * 18, Math.sin(a) * 18, 0], [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 64], 1.3, 1.1, TIMBER, 1);
  }
  S.egg([0, 0, 62], XYZ, [2.6, 2.6, 2.4], (n) => toneAt(n, ROPE, 0.1), 2);
  for (let z = 59; z > 34; z -= 2.4) S.ball([0, 0, z], 0.8, IRON, 3, undefined, 0.1);
  // the pot, its bail, its rim, the brew
  S.rod([-11, 0, 31], [0, 0, 35], 0.6, 0.6, IRON, 4);
  S.rod([11, 0, 31], [0, 0, 35], 0.6, 0.6, IRON, 4);
  S.egg([0, 0, 20], XYZ, [12.5, 12.5, 11], (n) => toneAt(n, IRON, 0.05), 5, (w) => w[2] < 29);
  turned(S, [0, 0, 0], 28.5, 30, () => 11.6, (n) => toneAt(n, IRON, 0.5), 6);
  S.egg([0, 0, 29], XYZ, [10.6, 10.6, 0.4], (_n, w) => {
    const b = Math.hypot(w[0] - 4 * Math.cos(f * 1.7), w[1] - 4 * Math.sin(f * 1.7));
    const b2 = Math.hypot(w[0] + 3 * Math.sin(f * 2.3 + 1), w[1] - 3 * Math.cos(f * 2.3 + 1));
    if (Math.abs(b - 2) < 0.8 || Math.abs(b2 - 1.4) < 0.7) return CLOTH[4]; // its bubbles
    return Math.hypot(w[0], w[1]) > 9.6 ? CLOTH[1] : CLOTH[2];
  }, 7);
  // the logs under it, and the fire, in a layer under the pot
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.2;
    S.rod([Math.cos(a) * 9, Math.sin(a) * 9, 1.2], [-Math.cos(a) * 3, -Math.sin(a) * 3, 1.6], 1.6, 1.4, CHAR, 8 + k);
  }
  S.seams();
  const [bx, by] = S.at([0, 0, 2]);
  cultFire(flames, Math.round(bx), Math.round(by), f, 0.75);
  const s = compose(null, [flames, S.p], null).sprite(36, 88, GRAIN);
  s.lights = [fireLight(bx, by - 8, 32 + (f % 2) * 2, 0.4)];
  return s;
}

// =================================================================================================
// THEIR STORES (breakables: whole, and broken)

/** A crate of the cult's: planks and battens, the shrieking skull painted on its side to the lower left; `top` a smaller one on it. */
function crate(S: Scene, c: V3, h: number, top: boolean, id: number): void {
  S.box(add(c, [0, 0, h]), XYZ, [h, h, h], (f, u, v, n) => {
    if (u < 0.08 || u > 0.92 || v < 0.08 || v > 0.92) return toneAt(n, TIMBER, 0.2); // the battens
    if (f === 2 && !top) {
      const m = shriekAt((v - 0.5) / 0.3, (u - 0.5) / 0.36);
      if (m === 'bone') return PAINT;
    }
    if (Math.abs(fr(f === 4 ? u * 3 : u * 3) - 0.5) > 0.45) return TIMBER[0]; // between the planks
    return toneAt(n, TIMBER, -0.05);
  }, id);
}

/** SUPPLY CRATES: a big crate with a small one on it; broken, their planks sprung and strewn, straw spilt. 56 x 64 at (28, 50). */
function crates(broken: boolean): Sprite {
  const S = new Scene(new Px(56, 64), 28, 50);
  if (!broken) {
    crate(S, [0, 0, 0], 11, false, 1);
    S.box([1, -1, 22 + 6], beamAxes([0, 0, 0], [1, 0.35, 0]), [6, 6, 6], (_f, u, v, n) => (u < 0.1 || u > 0.9 || v < 0.1 || v > 0.9 ? toneAt(n, TIMBER, 0.2) : toneAt(n, TIMBER, -0.05)), 2);
  } else {
    for (let i = 0; i < 9; i++) {
      const a = hash(i, 1, 1104) * Math.PI * 2;
      const r = 4 + hash(i, 2, 1104) * 12;
      const c: V3 = [Math.cos(a) * r, Math.sin(a) * r, 1 + (i % 3) * 0.8];
      const d: V3 = [Math.cos(a + 1.3 + hash(i, 3, 1104)), Math.sin(a + 1.3 + hash(i, 3, 1104)), 0.05];
      S.box(c, beamAxes([0, 0, 0], d), [8 + hash(i, 4, 1104) * 4, 3, 0.8], (_f, _u, _v, n) => toneAt(n, TIMBER, i % 2 ? 0 : -0.15), 1 + i);
    }
    for (let i = 0; i < 12; i++) {
      const a = hash(i, 5, 1104) * Math.PI * 2;
      const r = hash(i, 6, 1104) * 9;
      S.rod([Math.cos(a) * r, Math.sin(a) * r, 0.6], [Math.cos(a) * r + 3, Math.sin(a) * r - 1, 0.8], 0.6, 0.6, ROPE, 20);
    }
  }
  return finish(S, 28, 50);
}

/** A sack of coarse cloth, slumped, its neck tied. */
function sack(S: Scene, c: V3, r: number, tall: number, lean: V3, id: number): void {
  const top = add(c, add([0, 0, tall * 2], mul(lean, tall * 0.6)));
  S.egg(add(c, [0, 0, tall]), beamAxes([0, 0, 0], [1, 0, 0]), [r, r * 0.92, tall], (n, w) => (Math.abs(fr((w[2] + w[0] * 0.3) / 4) - 0.5) > 0.44 ? ROPE[1] : toneAt(n, ROPE, -0.05)), id);
  S.rod(sub(top, [0, 0, 2.6]), add(top, [0, 0, 0.6]), 2.2, 1.4, ROPE, id + 1);
  S.egg(sub(top, [0, 0, 2.4]), XYZ, [2.4, 2.4, 1], (n) => toneAt(n, ROPE, -0.3), id + 2);
}

/** SACKS OF GRAIN: three, slumped together; broken, one slit open and its grain spilt in a heap. 56 x 52 at (28, 40). */
function sacks(broken: boolean): Sprite {
  const S = new Scene(new Px(56, 52), 28, 40);
  sack(S, [-6, -5, 0], 8, 9, [0.2, -0.1, 0], 1);
  sack(S, [6, -2, 0], 7.5, 8, [-0.1, 0.2, 0], 4);
  if (!broken) sack(S, [0, 8, 0], 7, 7, [0.1, 0.1, 0], 7);
  else {
    S.egg([1, 9, 0.6], XYZ, [8, 6, 1.8], (n) => toneAt(n, ROPE, -0.2), 7);
    S.egg([6, 15, 0], XYZ, [9, 7, 4], (n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 1105) > 0.86 ? GRAIN_PALE[4] : toneAt(n, GRAIN_PALE, 0)), 8);
  }
  return finish(S, 28, 40);
}

/** FIREPOTS, the firepot throwers' stock: round clay pots in a low tray, rag wicks in their necks; broken, smashed to shards, their oil a dark stain. 56 x 48 at (28, 36). */
function firepots(broken: boolean): Sprite {
  const S = new Scene(new Px(56, 48), 28, 36);
  if (!broken) {
    S.box([0, 0, 2], XYZ, [15, 11, 2], (f, u, _v, n) => (f === 4 ? TIMBER[1] : Math.abs(fr(u * 3) - 0.5) > 0.44 ? TIMBER[0] : toneAt(n, TIMBER, -0.05)), 1);
    const at: [number, number][] = [[-8, -5], [1, -5], [-8, 5], [1, 5], [9.5, 0]];
    at.forEach(([x, y], i) => {
      S.egg([x, y, 9], XYZ, [5, 5, 5], (n) => toneAt(n, CLAY, 0), 2 + i);
      S.rod([x, y, 13], [x, y, 15.4], 2.2, 2, CLAY, 2 + i);
      S.rod([x, y, 15], [x - 0.6, y + 0.4, 18.4], 0.8, 0.6, ROPE, 10 + i);
    });
  } else {
    S.egg([0, 0, 0.2], XYZ, [15, 11, 0.5], () => '#2a2430', 1);
    S.box([-9, 4, 1.4], beamAxes([0, 0, 0], [1, 0.4, 0]), [9, 2.4, 1.2], (_f, _u, _v, n) => toneAt(n, TIMBER, -0.1), 2);
    for (let i = 0; i < 11; i++) {
      const a = hash(i, 1, 1106) * Math.PI * 2;
      const r = 3 + hash(i, 2, 1106) * 11;
      S.egg([Math.cos(a) * r, Math.sin(a) * r * 0.8, 1.4], XYZ, [2.6 + hash(i, 3, 1106) * 1.4, 2, 1.4], facetOf(CLAY, 0.05), 3 + i);
    }
    S.rod([4, -4, 0.8], [8, -7, 0.8], 0.7, 0.6, ROPE, 20);
  }
  return finish(S, 28, 36);
}

// =================================================================================================
// THEIR ARMS, THEIR CAPTIVES, THEIR LINES

/** A WEAPON RACK: two posts and a bar, spears leaning on it, two of the cult's wavy bone daggers hung from its pegs. 76 x 108 at (38, 92). */
function weaponRack(): Sprite {
  const S = new Scene(new Px(76, 108), 38, 92);
  for (const y of [-20, 20]) timber(S, [0, y, 0], [0, y, 46], 1.6, 1);
  timber(S, [0, -23, 44], [0, 23, 44], 1.4, 2);
  timber(S, [3, -21, 8], [3, 21, 8], 1.2, 3);
  // the spears, leaning back on the bar
  for (let k = 0; k < 4; k++) {
    const y = -15 + k * 10 + hash(k, 1, 1107) * 2;
    const a: V3 = [5, y, 1];
    const b: V3 = [-3, y + 1, 74 - k * 3];
    S.rod(a, b, 0.8, 0.8, TIMBER, 4 + k);
    const dir = norm(sub(b, a));
    S.rod(b, add(b, mul(dir, 9)), 1.5, 0.3, IRON, 10 + k);
  }
  // the daggers: wavy blades of bone, hilts bound dark, hung from pegs on the bar
  for (const y of [-10, 10]) {
    S.rod([1.5, y, 44], [2, y, 41], 0.9, 0.9, ['#1c1620', '#2a2230', '#3a3044', '#4a3e56', '#5a4c68'], 20);
    let prev: V3 = [2, y, 41];
    for (let i = 1; i <= 6; i++) {
      const nxt: V3 = [2, y + Math.sin(i * 1.6) * 1.3, 41 - i * 3];
      S.rod(prev, nxt, 1.4 - i * 0.12, 1.3 - i * 0.14, SUN_BONE, 21);
      prev = nxt;
    }
  }
  return finish(S, 38, 92);
}

/**
 * THE CAPTIVES' CAGE: a cage of rough poles lashed at its corners, barred all round and over, a scrap of
 * blanket and a bowl in it; its door in its side toward the lower left, shut, or broken open (`open`).
 * 88 x 108 at (44, 84).
 */
function cage(open: boolean): Sprite {
  const S = new Scene(new Px(88, 108), 44, 84);
  const H = 20;
  const T = 58;
  const corners: V3[] = [[-H, -H, 0], [H, -H, 0], [H, H, 0], [-H, H, 0]];
  corners.forEach((q, i) => timber(S, q, add(q, [0, 0, T + 2]), 1.6, 1 + i));
  // the frame, low and high, and the bars between
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    for (const z of [2, T]) S.rod(add(a, [0, 0, z]), add(b, [0, 0, z]), 1.3, 1.3, TIMBER, 5 + i);
    const door = i === 2; // the side from (H, H) to (-H, H): toward the lower left
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      const p = add(a, mul(sub(b, a), t));
      if (door && open && t > 0.2 && t < 0.8) continue;
      S.rod(add(p, [0, 0, 2]), add(p, [0, 0, T]), 0.75, 0.75, TIMBER, 9 + i);
    }
  }
  // its roof: bars across
  for (let k = 1; k < 5; k++) S.rod([-H, -H + k * 8, T + 0.6], [H, -H + k * 8, T + 0.6], 0.7, 0.7, TIMBER, 13);
  // the door, swung out and hanging by one lashing
  if (open) {
    const hinge: V3 = [H * 0.6, H, 0];
    const out: V3 = norm([0.35, 1, 0]);
    for (let k = 0; k < 4; k++) S.rod(add(hinge, add(mul(out, k * 5), [0, 0, 4])), add(hinge, add(mul(out, k * 5), [0, 0, 44 - k * 2])), 0.75, 0.75, TIMBER, 14);
    for (const z of [6, 40]) S.rod(add(hinge, [0, 0, z]), add(hinge, add(mul(out, 15), [0, 0, z - 3])), 0.9, 0.9, TIMBER, 14);
  }
  // the lashings at its corners
  for (const q of corners) for (const z of [2, T]) S.egg(add(q, [0, 0, z]), XYZ, [2.4, 2.4, 1.6], (n) => toneAt(n, ROPE, 0.05), 15);
  // in it
  S.egg([-5, -2, 0.8], XYZ, [9, 7, 1.4], (n) => toneAt(n, CLOTH, 0.05), 16);
  S.egg([8, 6, 1.6], XYZ, [3.4, 3.4, 1.6], (n, w) => (w[2] > 2.6 ? '#2a2430' : toneAt(n, CLAY, 0.1)), 17);
  return finish(S, 44, 84);
}

/**
 * STAKES: the cult's barricade, a log with sharpened stakes driven through it crossways in pairs, their
 * points out both ways, along x (`alongY` false) or along y. 92 x 72 at (46, 50).
 */
function stakes(alongY: boolean): Sprite {
  const S = new Scene(new Px(92, 72), 46, 50);
  const P = (l: number, w: number, z: number): V3 => (alongY ? [w, l, z] : [l, w, z]);
  S.rod(P(-32, 0, 9), P(32, 0, 9), 4, 4, TIMBER, 1);
  S.egg(P(32.2, 0, 9), alongY ? [[0, 1, 0], [1, 0, 0], [0, 0, 1]] : XYZ, [0.5, 3.8, 3.8], (_n, w) => (Math.hypot(alongY ? w[0] : w[1], w[2] - 9) % 1.6 < 0.8 ? TIMBER[3] : TIMBER[2]), 2);
  [-24, -8, 8, 24].forEach((l, k) => {
    for (const s of [-1, 1]) {
      const a = P(l + s * 1.5, -18 * s, 0);
      const b = P(l + s * 1.5, 18 * s, 34);
      const d = norm(sub(b, a));
      S.rod(add(a, mul(d, 4)), sub(b, mul(d, 6)), 1.9, 1.7, TIMBER, 3 + k * 2 + (s > 0 ? 1 : 0));
      S.rod(sub(b, mul(d, 6)), b, 1.7, 0.3, [TIMBER[1], TIMBER[2], TIMBER[3], TIMBER[4], '#c4a886'], 3 + k * 2 + (s > 0 ? 1 : 0));
      S.rod(add(a, mul(d, 4)), a, 1.9, 0.4, TIMBER, 3 + k * 2 + (s > 0 ? 1 : 0));
    }
  });
  return finish(S, 46, 50);
}

/** THE SKULL STANDARD: a tall pole with a crossbar, a great skull on its top shrieking, two skulls hung on cords from the bar's ends and rags of the cult's violet between. 56 x 148 at (28, 138). */
function skullStandard(): Sprite {
  const S = new Scene(new Px(56, 148), 28, 138);
  S.rod([0, 0, 0], [0, 0, 112], 1.5, 1.3, TIMBER, 1);
  S.rod([0, -16, 96], [0, 16, 96], 1.2, 1.2, TIMBER, 2);
  S.egg([0, 0, 96], XYZ, [2.4, 2.4, 2], (n) => toneAt(n, ROPE, 0.1), 3);
  skull(S, { c: [0.6, 0.6, 118], F: norm([0.7, 0.7, 0.05]), U: [0, 0, 1], R: 7, jaw: 0.8, snap: true }, SUN_BONE, 4);
  for (const y of [-14, 14]) {
    rope(S, [0, y, 95], [0, y, 84], 0, 5, 0.45);
    skull(S, { c: [0.4, y, 79], F: norm([0.75, 0.6, -0.15]), U: [0, 0, 1], R: 4.6, jaw: 0.4, snap: true }, SUN_BONE, 6 + (y > 0 ? 1 : 0));
  }
  // the rags, hanging from the bar
  for (let k = 0; k < 4; k++) {
    const y = -9 + k * 6;
    const len = 18 + hash(k, 1, 1108) * 10;
    S.quad([[0.2, y - 2, 95], [0.2, y + 2, 95], [0.6, y + 2.6, 95 - len], [0.6, y - 1.6, 95 - len + 3]], (u, v) => (v > 0.9 ? CLOTH[1] : u < 0.3 ? CLOTH[3] : CLOTH[2]), 8 + k);
  }
  return finish(S, 28, 138);
}

/**
 * THE CULT'S LOOKOUT: a watchtower of squared timbers, braced, a platform with a railing high up, a
 * ladder to it, a pennant of the cult's violet over it. Tall: seen through while someone is behind it.
 * 88 x 188 at (44, 172).
 */
function lookout(): Sprite {
  const S = new Scene(new Px(88, 188), 44, 172);
  const H = 15;
  const P = 92;
  const posts: V3[] = [[-H, -H, 0], [H, -H, 0], [H, H, 0], [-H, H, 0]];
  posts.forEach((q, i) => timber(S, q, add(q, [0, 0, P + 22]), 1.8, 1 + i, [0.05]));
  // the braces, crossed, on the two sides toward the eye, and the girts
  for (const [a, b] of [[1, 2], [2, 3]] as const) {
    const A = posts[a];
    const B = posts[b];
    for (const [z0, z1] of [[4, 46], [46, P - 2]] as const) {
      S.rod(add(A, [0, 0, z0]), add(B, [0, 0, z1]), 1, 1, TIMBER, 5 + a);
      S.rod(add(B, [0, 0, z0]), add(A, [0, 0, z1]), 1, 1, TIMBER, 5 + a);
    }
    S.rod(add(A, [0, 0, 46]), add(B, [0, 0, 46]), 1.1, 1.1, TIMBER, 5 + a);
  }
  // the platform and its railing
  S.box([0, 0, P], XYZ, [H + 4, H + 4, 1.6], (f, u, v, n) => (f === 4 && Math.abs(fr(u * 5) - 0.5) > 0.45 ? TIMBER[1] : toneAt(n, TIMBER, 0.05)), 8);
  const rail: V3[] = [[-H - 3, -H - 3, 0], [H + 3, -H - 3, 0], [H + 3, H + 3, 0], [-H - 3, H + 3, 0]];
  for (let i = 0; i < 4; i++) {
    const a = rail[i];
    const b = rail[(i + 1) % 4];
    for (const z of [P + 9, P + 17]) S.rod(add(a, [0, 0, z]), add(b, [0, 0, z]), 0.9, 0.9, TIMBER, 9);
  }
  // the ladder, up the side toward the lower left
  for (const x of [-6, 6]) S.rod([x, H + 9, 0], [x, H + 4, P], 1, 1, TIMBER, 10);
  for (let k = 1; k < 10; k++) {
    const t = k / 10;
    S.rod([-6, H + 9 - 5 * t, P * t], [6, H + 9 - 5 * t, P * t], 0.7, 0.7, TIMBER, 11);
  }
  // the pennant's pole at its far corner, the pennant
  S.rod([-H, -H, P + 20], [-H, -H, P + 40], 1, 0.9, TIMBER, 12);
  S.quad([[-H, -H, P + 39], [-H, -H - 17, P + 36], [-H, -H - 17, P + 34], [-H, -H, P + 30]], (u, v) => (v < 0.2 || u > 0.9 ? CLOTH[2] : CLOTH[3]), 13);
  return finish(S, 44, 172);
}

/**
 * THE CULT'S HOIST, for a cliff's edge: an A-frame of poles stayed back to a stake, its jib out over the
 * drop (toward the lower right, the way the cliff falls toward the eye), a block at its end, the rope
 * from a windlass at its foot up over the block and down to a crate hauled up under it. 112 x 128 at
 * (52, 108).
 */
function hoist(): Sprite {
  const S = new Scene(new Px(112, 128), 52, 108);
  const apex: V3 = [-4, 0, 70];
  S.rod([-10, -15, 0], apex, 1.6, 1.3, TIMBER, 1);
  S.rod([-10, 15, 0], apex, 1.6, 1.3, TIMBER, 2);
  S.rod([-9, -13, 24], [-9, 13, 24], 1, 1, TIMBER, 3);
  rope(S, add(apex, [0, 0, 1]), [-36, 0, 1], 1, 4, 0.55);
  S.rod([-36, 0, 0], [-36, 0, 5], 1, 0.8, TIMBER, 5);
  const tip: V3 = [34, 8, 82];
  S.rod([-6, 0, 50], tip, 1.5, 1.2, TIMBER, 6);
  S.rod(apex, add(tip, [-2, -0.4, 0]), 0.6, 0.6, ROPE, 7);
  S.egg(add(tip, [0, 0, -2.4]), [norm([0.3, -1, 0]), norm([1, 0.3, 0]), [0, 0, 1]], [1.2, 2.6, 2.6], (n) => toneAt(n, TIMBER, 0.2), 8);
  // the windlass at its foot
  for (const y of [-7, 7]) S.rod([-18, y, 0], [-18, y, 14], 1, 1, TIMBER, 9);
  S.rod([-18, -6, 11], [-18, 6, 11], 3, 3, ROPE, 10);
  S.rod([-18, -8, 11], [-18, -8.5, 4], 0.7, 0.7, IRON, 11);
  rope(S, [-18, 0, 13.4], add(tip, [0, 0, -0.4]), 2, 12, 0.5);
  // the hauled crate
  rope(S, add(tip, [0, 0, -4.6]), add(tip, [0, 0, -22]), 0, 13, 0.55);
  const c = add(tip, [0, 0, -32]);
  S.box(c, XYZ, [7, 7, 7], (_f, u, v, n) => (u < 0.1 || u > 0.9 || v < 0.1 || v > 0.9 ? toneAt(n, TIMBER, 0.2) : toneAt(n, TIMBER, -0.05)), 14);
  for (const [dx, dy] of [[-6, -6], [6, -6], [-6, 6], [6, 6]] as const) rope(S, add(tip, [0, 0, -22]), add(c, [dx, dy, 7]), 0, 13, 0.4);
  return finish(S, 52, 108);
}

// =================================================================================================
// THEIR RITES AND THEIR WAR

/** AN OFFERING BOWL: a short pillar of the cult's slate on a plinth, the shrieking skull cut in its front, a wide iron bowl on it, a small skull and bones offered in it. 52 x 60 at (26, 48). */
function offeringBowl(): Sprite {
  const S = new Scene(new Px(52, 60), 26, 48);
  S.box([0, 0, 1.5], XYZ, [10, 10, 1.5], (f, _u, _v, n) => (f === 4 ? SLATE[3] : toneAt(n, SLATE, -0.05)), 1);
  S.box([0, 0, 10], XYZ, [6.5, 6.5, 7], (f, u, v, n) => {
    if (f === 2) {
      const m = shriekAt((v - 0.5) / 0.4, (u - 0.5) / 0.36);
      if (m === 'dark') return '#0e0b16';
      if (m === 'bone') return SLATE[1];
    }
    return toneAt(n, SLATE, 0);
  }, 2);
  S.egg([0, 0, 21], XYZ, [13, 13, 5], (n, w) => (w[2] > 23.6 ? IRON[4] : toneAt(n, IRON, 0.05)), 3, (w) => w[2] < 24.2);
  S.egg([0, 0, 23.8], XYZ, [11.6, 11.6, 0.5], () => '#2a2430', 4);
  skull(S, { c: [-1, 1, 26.5], F: norm([0.7, 0.7, 0.3]), U: [0, 0, 1], R: 3.6, jaw: 0, snap: true }, SUN_BONE, 5);
  S.rod([3, -5, 24.6], [8, 1, 24.8], 0.9, 0.9, SUN_BONE, 6);
  S.rod([-7, -3, 24.6], [-2, -8, 24.8], 0.9, 0.9, SUN_BONE, 7);
  return finish(S, 26, 48);
}

/**
 * THE WAR DRUM: a great drum slung in a frame of timber, tilted so that its head looks toward the eye,
 * the head of hide with the shrieking skull painted dark on it, its shell laced with rope; two beaters
 * leaning on the frame. 80 x 84 at (40, 68).
 */
function warDrum(): Sprite {
  const S = new Scene(new Px(80, 84), 40, 68);
  const A: V3 = norm([0.3, 1, 0.5]); // its axis, its head toward the lower left and up
  const B: V3 = norm(cross([0, 0, 1], A));
  const C: V3 = norm(cross(A, B));
  const R = 15;
  const LEN = 11;
  const c: V3 = [0, 0, 24];
  // the frame: a leg each side, a bar under it
  for (const s of [-1, 1]) {
    const side = add(c, mul(B, s * (R + 2.6)));
    S.rod([side[0], side[1], 0], add(side, [0, 0, 6]), 1.5, 1.3, TIMBER, 1);
    S.rod([side[0] - 4, side[1] - 4, 0], [side[0], side[1], 0.5], 1.2, 1.2, TIMBER, 1);
    S.rod([side[0] + 4, side[1] + 4, 0], [side[0], side[1], 0.5], 1.2, 1.2, TIMBER, 1);
  }
  // its shell, turned about its axis
  for (let t = -LEN; t <= LEN; t += 0.4) {
    const r = R - Math.abs(t) * 0.06;
    for (let a = -Math.PI; a < Math.PI; a += 0.55 / (r + 1)) {
      const n = add(mul(B, Math.cos(a)), mul(C, Math.sin(a)));
      if (dot(n, TOWARD) < -0.3) continue;
      const q = add(add(c, mul(A, t)), mul(n, r));
      const k = fr(((a + Math.PI) / (2 * Math.PI)) * 14);
      const tt = (t + LEN) / (2 * LEN);
      let col: string;
      if (Math.abs(t) > LEN - 1.4) col = toneAt(n, HIDE, 0.25); // the hoops
      else if (Math.abs(k - (tt < 0.5 ? tt : 1 - tt)) < 0.07 || Math.abs(1 - k - (tt < 0.5 ? tt : 1 - tt)) < 0.07) col = toneAt(n, ROPE, 0.15); // the lacing
      else col = toneAt(n, TIMBER, -0.02);
      const [x, y] = S.at(q);
      S.put(Math.round(x), Math.round(y), dot(q, TOWARD), col, 2, q[2]);
    }
  }
  // its head, toward the eye, the mark painted dark on it
  S.egg(add(c, mul(A, LEN)), [A, B, C], [0.6, R - 0.6, R - 0.6], (n, w) => {
    const q = sub(w, c);
    const u = dot(q, B);
    const v = dot(q, C);
    const m = shriekAt(-u / 8.5, v / 10);
    if (m === 'bone') return CLOTH[1];
    return Math.hypot(u, v) > R - 2.2 ? HIDE[2] : toneAt(n, HIDE, 0.25);
  }, 3);
  // the beaters, leaning on the frame
  for (const s of [-1, 1]) {
    const foot = add(add(c, mul(B, s * (R + 6))), [4, 6, -24]);
    const top = add(add(c, mul(B, s * (R + 3))), [0, 0, 8]);
    S.rod(foot, top, 0.8, 0.8, TIMBER, 4);
    S.egg(top, XYZ, [2.2, 2.2, 2.2], (n) => toneAt(n, HIDE, 0.1), 5);
  }
  return finish(S, 40, 68);
}

/**
 * A DEAD TREE, gnarled and silvered, its bare limbs twisting up and out; a rag of the cult's violet tied
 * to one, the cult's marker. For every floor of the set (the canyon's tops, the wood toward the swamp).
 * 104 x 148 at (52, 136).
 */
function deadTree(seed: number): Sprite {
  const S = new Scene(new Px(104, 148), 52, 136);
  let id = 1;
  const limb = (a: V3, d: V3, len: number, r: number, depth: number): void => {
    let p = a;
    let dir = d;
    const steps = Math.max(2, Math.round(len / 9));
    for (let i = 0; i < steps; i++) {
      const bend: V3 = [(hash(depth, i, seed + 1110) - 0.5) * 0.7, (hash(depth, i, seed + 1111) - 0.5) * 0.7, 0.1];
      dir = norm(add(dir, bend));
      const r0 = r * (1 - (i / steps) * 0.45);
      const r1 = r * (1 - ((i + 1) / steps) * 0.45);
      const q = add(p, mul(dir, len / steps));
      S.rod(p, q, Math.max(0.7, r0), Math.max(0.7, r1), DEADWOOD, id);
      if (depth < 3 && i === steps - 2) {
        for (const s of [-1, 1]) {
          const side = norm(cross(dir, [0, 0, 1]));
          limb(q, norm(add(add(mul(dir, 0.6), mul(side, s * 0.9)), [0, 0, 0.35])), len * 0.62, r1 * 0.72, depth + 1);
        }
      }
      p = q;
    }
    id++;
  };
  // its roots, and its trunk
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    S.rod([0, 0, 4], [Math.cos(a) * 10, Math.sin(a) * 10, 0], 3, 1, DEADWOOD, 30);
  }
  limb([0, 0, 0], [0.1, -0.05, 1], 76, 4.6, 0);
  // the cult's rag, on a low limb
  const knot: V3 = [4, -2, 54];
  S.egg(knot, XYZ, [2, 2, 1.6], (n) => toneAt(n, CLOTH, 0.1), 40);
  S.quad([[4.6, -1, 54], [4.6, 2, 54], [5, 3, 38], [5, 0.4, 40]], (u) => (u < 0.4 ? CLOTH[3] : CLOTH[2]), 41);
  return finish(S, 52, 136);
}

// =================================================================================================
// THEIR TRAP

/**
 * THE CULT'S FIRE TRAP, a floor tile: a square of planks set flush in the dust over a buried firepot,
 * nailed; its second frame the cult's fire showing pink through the cracks between the planks (the
 * warning). 64 x 33 at (32, 0).
 */
function firePlate(warn: boolean): Sprite {
  const p = new Px(64, 33);
  for (let py = 0; py < 33; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const [U, V] = uv;
      if (U < 9 || U > 55 || V < 9 || V > 55) continue;
      const edge = U < 10.5 || U > 53.5 || V < 10.5 || V > 53.5;
      const crack = Math.abs(fr((U - 9) / 7.66) - 0.5) > 0.42;
      if (edge) p.set(px, py, V < 10.5 || U < 10.5 ? TIMBER[1] : TIMBER[0]);
      else if (crack) p.set(px, py, warn ? FLAME[(px + py) % 3 === 0 ? 3 : 2] : '#2a2430');
      else if (Math.abs(V - 16) < 1 || Math.abs(V - 48) < 1) p.set(px, py, (Math.floor((U - 9) / 7.66) + (V > 30 ? 1 : 0)) % 2 ? IRON[3] : TIMBER[2]);
      else p.set(px, py, hash(Math.floor((U - 9) / 7.66), Math.floor(V / 3), 1112) > 0.7 ? TIMBER[3] : TIMBER[2]);
    }
  }
  const s = p.sprite(32, 0, GRAIN);
  if (warn) s.lights = [{ x: 16, y: 8, r: 16, color: FLAME[2], a: 0.3 }];
  return s;
}

/** The fire trap going off: a column of the cult's fire up out of the plate, `k` 1 to 3 (bursting, at its height, falling away), its planks flung; its light. 72 x 124 at (36, 108). */
function fireBurst(k: number): Sprite {
  const p = new Px(72, 124);
  const B = 108;
  const h = [0, 40, 84, 52][k];
  const w = [0, 15, 12, 9][k];
  pinkFlame(p, 36, B + 1, Math.round(h * 0.45), w * 1.4, 0);
  pinkFlame(p, 34, B, h, w, -1);
  pinkFlame(p, 41, B, Math.round(h * 0.75), w * 0.6, 3);
  pinkFlame(p, 28, B + 1, Math.round(h * 0.55), w * 0.45, -3);
  if (k === 1) {
    // the planks flung up out of it
    for (const [x, y, d] of [[12, 60, 1], [55, 52, -1], [22, 40, 1], [47, 30, -1]] as const) for (let i = 0; i < 7; i++) p.set(x + i * d, y - Math.round(i * 0.5), i % 3 ? TIMBER[2] : TIMBER[3]).set(x + i * d, y + 1 - Math.round(i * 0.5), TIMBER[0]);
  }
  sparks(p, 36, B, k + 1, 4 + k, h + 10);
  const s = compose(null, [p], null).sprite(36, B, GRAIN);
  s.lights = [{ x: 18, y: (B - h * 0.5) / GRAIN, r: 30 + h * 0.4, color: FLAME[2], a: 0.55 }];
  return s;
}

// =================================================================================================
// THE LIST

let made: Piece[] | null = null;
/** THE CULT'S CAMP: twenty of the set's 25 pieces (the other five are its strongholds'), by name, made once. */
export function campPieces(): Piece[] {
  if (made) return made;
  made = [
    // where they sleep
    { name: "the cult's tent", kind: 'obstacle', frames: [cultTent(false), cultTent(true)], shadow: 1 },
    { name: "the cult's pavilion", kind: 'obstacle', frames: [pavilion()], shadow: 1.3 },
    { name: 'bedroll', kind: 'on the floor', frames: [bedroll(false), bedroll(true)] },
    { name: 'lean-to', kind: 'obstacle', frames: [leanTo()], shadow: 0.9 },
    // where they eat and keep warm
    { name: "the cult's watchfire", kind: 'obstacle', frames: [0, 1, 2, 3].map(watchfire), shadow: 0.4 },
    { name: 'a cold fire', kind: 'on the floor', frames: [coldFire()] },
    { name: "the cult's cauldron", kind: 'obstacle', frames: [0, 1, 2, 3].map(cauldron), shadow: 0.45 },
    // their stores: whole, and broken
    { name: 'supply crates', kind: 'breakable', frames: [crates(false), crates(true)], shadow: 0.36 },
    { name: 'sacks of grain', kind: 'breakable', frames: [sacks(false), sacks(true)], shadow: 0.34 },
    { name: 'firepots', kind: 'breakable', frames: [firepots(false), firepots(true)], shadow: 0.36 },
    // their arms, their captives, their lines
    { name: 'weapon rack', kind: 'obstacle', frames: [weaponRack()], shadow: 0.45 },
    { name: "the captives' cage", kind: 'obstacle', frames: [cage(false), cage(true)], shadow: 0.7 },
    { name: 'stakes', kind: 'obstacle', frames: [stakes(false), stakes(true)], shadow: 0.7 },
    { name: 'the skull standard', kind: 'obstacle', frames: [skullStandard()], shadow: 0.22 },
    { name: "the cult's lookout", kind: 'obstacle', frames: [lookout()], shadow: 0.8 },
    { name: "the cult's hoist", kind: 'obstacle', frames: [hoist()], shadow: 0.5 },
    // their rites and their war
    { name: 'offering bowl', kind: 'obstacle', frames: [offeringBowl()], shadow: 0.3 },
    { name: 'war drum', kind: 'obstacle', frames: [warDrum()], shadow: 0.55 },
    { name: 'dead tree', kind: 'obstacle', frames: [deadTree(0), deadTree(7)], shadow: 0.4 },
    // their trap: the plate, its warning, the fire bursting up
    { name: "the cult's fire trap", kind: 'trap', frames: [firePlate(false), firePlate(true), fireBurst(1), fireBurst(2), fireBurst(3)] },
  ];
  return made;
}

/** (for the tests: what burns with the cult's fire, and so may glow) */
export const CAMP_BURNS: readonly string[] = ["the cult's watchfire", "the cult's cauldron", "the cult's fire trap"];
