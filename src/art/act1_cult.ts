// ACT 1, FLOORS 6 TO 10: THE CULT'S OWN PIECES, for every floor of the set (a mock-up; nothing of the
// game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): "Going forward, let’s do 25 that are
// the theme of the 5 levels, then 25 for each boss." The theme of these five is the descent behind the
// cult's lines to the town it besieges (his words of 12 Oct, 17:01: "Let’s say the cult has put the town
// under siege with some magic that is being power by some eldritch being in this ancient swamp.  So you
// kinda come down behind enemy lines and kill the eldritch horror and break the siege"): so the set's
// pieces are the cult's, on the march and dug in: its banners, its fires, its strongholds.
//
// THE STRONGHOLDS (his plan of 12 Oct, 17:21: "A cultist stronghold.  Fight a couple rare mobs as guards.
// Then you have to sacrifice a word to the door to open it and enter.  You can sacrifice up to three."),
// as the planning chat painted the Quarry's door with his yes by 09:52 on 13 Oct ("Yes, this is it
// (Recommended)"): its door sealed with the cult's mark burning pink, an altar before it with three empty
// hollows the shape of a rune stone, one for each word given, a groove from each to the door; the cult's
// banners and braziers of its pink fire.
//
// THE CULT'S MARK is floor 5's own (art/floor5.ts, `shriekAt`): the shrieking skull, face on, its jaw
// dropped wide. (The planning chat's rough paint marked the cult with a cross; floor 5's rules for the
// mark say never a cross, so the skull it is; he was told, 13 Oct, 10:47.)
//
// THE RULES THEY KEEP (his art rulebook): pink burning to gold glows only on the enemy: the cult's fire
// and its mark burning (FLAME, as the game's enemy fire); nothing else of them glows; the cloth a step
// quieter than any word; crisp pixels, two to a game pixel; light from the upper left; the indigo seam.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { shriekAt } from './floor5';
import { Scene, XYZ, toneAt } from './floor4';
import { GRAIN, compose, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';

/** THE CULT'S CLOTH, a dusky violet, a step quieter than any word (the cultists' own robes are brighter: they are figures). */
export const CLOTH: Ramp = ['#1f1a2a', '#2d2540', '#40335a', '#56457a', '#6a5a8e'];
/** Its bone-pale paint, for the mark on the cloth. */
export const PAINT = '#d9d2c4';
export const PAINT_SHADE = '#a9a092';
/** Iron, dark (art/floor6.ts's own). */
const IRON: Ramp = ['#24222e', '#353342', '#4e4c5e', '#727083', '#9a98aa'];
/** Weathered timber (art/floor6.ts's own). */
const TIMBER: Ramp = ['#3a2b28', '#55402f', '#765a42', '#937455', '#ad8e6c'];
/** The cult's dark stone, as its altars are cut from: a slate, a little violet in it (floor 5's cult slab, a step lighter in daylight). */
export const SLATE: Ramp = ['#211c2b', '#2f2a3c', '#433d54', '#5a536c', '#6f6880'];

const fr = (t: number): number => t - Math.floor(t);

/** A flame of the cult's pink burning to gold (his rulebook's enemy fire, mkit FLAME), `h` rows from (x, base) up, `w` half wide, its tip `lean` over. Joined rows, never loose pixels. */
export function pinkFlame(p: Px, x: number, base: number, h: number, w: number, lean: number): void {
  let prev = x;
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.2 + t * 0.8)) ** 0.8 * (1 - t * 0.3));
    const m = x + lean * t * t;
    let x0 = Math.floor(m - hw);
    let x1 = Math.ceil(m + hw);
    x0 = Math.min(x0, Math.round(prev));
    x1 = Math.max(x1, Math.round(prev) + 1);
    for (let xx = x0; xx < x1; xx++) {
      const d = Math.abs(xx + 0.5 - m) / hw;
      p.set(xx, base - i, d < 0.4 && t < 0.4 ? FLAME[4] : d < 0.75 && t < 0.65 ? FLAME[3] : t > 0.85 ? FLAME[0] : t > 0.7 ? FLAME[1] : FLAME[2]);
    }
    prev = m;
  }
}

/**
 * THE CULT'S BANNER ON ITS POLE: a tall pole of timber with a crosspiece, the violet cloth hung from it,
 * its foot ragged into tails, the shrieking skull painted on it in bone-pale; stirring, frame by frame
 * (4 frames, at about 6 a second). 56 x 132 at (20, 124).
 */
export function cultBanner(f: number): Sprite {
  const W = 56;
  const H = 132;
  const px0 = 20;
  const foot = 124;
  const pole = new Px(W, H);
  const cloth = new Px(W, H);
  // the pole, its lit left edge, its finial
  for (let y = 10; y <= foot; y++) {
    pole.set(px0 - 1, y, TIMBER[3]).set(px0, y, TIMBER[2]).set(px0 + 1, y, TIMBER[1]);
  }
  pole.set(px0 - 1, 8, IRON[3]).set(px0, 8, IRON[3]).set(px0, 7, IRON[4]).set(px0, 6, IRON[3]);
  // the crosspiece
  for (let x = px0 - 2; x <= px0 + 30; x++) {
    pole.set(x, 14, TIMBER[3]).set(x, 15, TIMBER[1]);
  }
  // the cloth: from the crosspiece down, stirring (each column swung a little, more at its foot)
  const top = 16;
  const len = 70;
  const ph = (f / 4) * Math.PI * 2;
  for (let c = 0; c < 26; c++) {
    const x = px0 + 3 + c;
    const sway = (k: number): number => Math.round(Math.sin(ph + c * 0.35) * 1.4 * k + Math.sin(ph * 2 + c * 0.9) * 0.6 * k);
    // its foot ragged into tails: three of them, the cloth cut between
    const tail = Math.abs(fr(c / 8.67) - 0.5) * 2;
    const bottom = top + len + Math.round(6 * (1 - tail)) + (hash(c, 1, 960) > 0.7 ? 2 : 0);
    for (let y = top; y <= bottom; y++) {
      const k = (y - top) / len;
      const xs = x + sway(k);
      // its folds: the cloth lit and shaded in long vertical runs as it hangs
      const fold = Math.sin(c * 0.75 + ph * 0.5 + k * 1.2);
      let tone = fold > 0.45 ? 3 : fold < -0.45 ? 1 : 2;
      if (c === 0) tone = 3;
      if (y >= bottom - 1) tone = Math.max(0, tone - 1);
      cloth.set(xs, y, CLOTH[tone]);
    }
  }
  // the mark, painted on it: the shrieking skull, 16 across
  const mx = px0 + 16;
  const my = top + 30;
  for (let y = -20; y <= 20; y++) {
    for (let x = -9; x <= 9; x++) {
      const m = shriekAt((x + 0.5) / 8.5, -(y + 0.5) / 9.5);
      if (!m) continue;
      const k = (my + y - top) / len;
      const c = Math.round(x + mx - px0 - 3);
      const sway = Math.round(Math.sin(ph + c * 0.35) * 1.4 * k + Math.sin(ph * 2 + c * 0.9) * 0.6 * k);
      if (m === 'bone') cloth.set(mx + x + sway, my + y, x > 4 ? PAINT_SHADE : PAINT);
    }
  }
  return compose(null, [pole, cloth], null).sprite(px0, foot, GRAIN);
}

/**
 * A BRAZIER OF THE CULT'S FIRE: an iron bowl on a tripod of iron, coals in it, and the cult's pink fire
 * burning to gold over it, leaping (4 frames, at about 8 a second); it lights what is round it in its
 * pink (the enemy's glow, as a cultist's own fire does). 48 x 96 at (24, 88).
 */
export function pinkBrazier(f: number): Sprite {
  const S = new Scene(new Px(48, 96), 24, 88);
  // the tripod: three legs splayed from under the bowl to the floor
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    S.rod([Math.cos(a) * 3, Math.sin(a) * 3, 34], [Math.cos(a) * 11, Math.sin(a) * 11, 0], 1, 0.9, IRON, 1);
  }
  S.rod([0, 0, 22], [0, 0, 34], 0.9, 0.9, IRON, 1);
  // the bowl: a wide shallow dish of iron, its rim lit
  S.egg([0, 0, 38], XYZ, [11, 11, 5], (n, w) => (w[2] > 41.5 ? IRON[4] : toneAt(n, IRON, 0.05)), 2);
  S.egg([0, 0, 42.6], XYZ, [9, 9, 0.6], (_n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 961 + f) > 0.6 ? FLAME[1] : '#2a1424'), 3);
  S.seams();
  const p = S.p;
  // the fire over it: a body of flame and tongues leaping from it by turns, each its own height
  const [bx, by] = S.at([0, 0, 43]);
  const X = Math.round(bx);
  const Y = Math.round(by);
  const lean = [1, -2, 2, -1][f % 4];
  pinkFlame(p, X, Y + 1, 12, 8.5, lean * 0.5);
  pinkFlame(p, X - 2, Y - 2, 18 + [2, 6, 0, 5][f % 4], 4.6, lean);
  pinkFlame(p, X + 4, Y - 1, 12 + [5, 0, 6, 2][f % 4], 3.2, lean + 1.5);
  pinkFlame(p, X - 6, Y, 9 + [0, 4, 2, 5][f % 4], 2.6, lean - 1.5);
  // sparks rising, two pixels each
  for (let k = 0; k < 3; k++) {
    const sy = Math.round(by - 26 - ((f * 7 + k * 11) % 20));
    const sx = Math.round(bx + Math.sin(f + k * 2.1) * 6);
    p.set(sx, sy, FLAME[3]).set(sx, sy - 1, FLAME[4]);
  }
  const s = compose(null, [p], null).sprite(24, 88, GRAIN);
  const lights: Light[] = [{ x: bx / GRAIN, y: (by - 14) / GRAIN, r: 34 + (f % 2) * 2, color: FLAME[2], a: 0.42 }];
  s.lights = lights;
  return s;
}

/**
 * WHERE THE THREE WORDS LIE IN THE ALTAR: each hollow's middle, in picture pixels from the altar's anchor,
 * for the main chat to set a word given into it in the game's own look of a rune stone.
 */
export const ALTAR_HOLLOWS: ReadonlyArray<readonly [number, number]> = [];

/**
 * THE ALTAR OF THE WORDS before a stronghold's door: a long block of the cult's dark slate along x, its
 * top cut with three hollows the shape of a rune stone (the dark of a slot, its rim of the stone lit), a
 * groove from each to its back edge, toward the door; the shrieking skull cut in its front. Nothing of it
 * glows: the words given to it will. 120 x 76 at (56, 50).
 */
export function wordAltar(): Sprite {
  const S = new Scene(new Px(120, 76), 56, 50);
  const L = 44;
  const D = 14;
  const H = 22;
  const hollows: [number, number][] = [[-26, 0], [0, 0], [26, 0]];
  // its plinth
  S.box([0, 0, 2.5], XYZ, [L + 3, D + 3, 2.5], (f, _u, _v, n) => (f === 4 ? SLATE[3] : toneAt(n, SLATE, -0.05)), 1);
  S.box([0, 0, 5 + H / 2], XYZ, [L, D, H / 2], (f, u, v, n) => {
    if (f === 4) {
      // its top: the hollows, the grooves to its back
      const x = (u * 2 - 1) * L;
      const y = (v * 2 - 1) * D;
      for (const [hx, hy] of hollows) {
        const dx = (x - hx) / 7;
        const dy = (y - hy) / 9;
        const r = Math.max(Math.abs(dx), Math.abs(dy)) * 0.7 + Math.hypot(dx, dy) * 0.3; // a rune stone's round-cornered shape
        if (r < 1) return r > 0.82 ? (dx + dy < 0 ? '#0e0b16' : SLATE[4]) : '#0e0b16';
        if (Math.abs(x - hx) < 1.6 && y < hy - 8) return SLATE[1]; // the groove to the back edge
      }
      return hash(Math.floor(x / 3), Math.floor(y / 3), 962) > 0.9 ? SLATE[2] : SLATE[3];
    }
    if (f === 2) {
      // its front: the mark cut in it
      const x = (v * 2 - 1) * L;
      const z = (u * 2 - 1) * (H / 2);
      const m = shriekAt(x / 8, z / 9);
      if (m === 'dark') return '#0e0b16';
      if (m === 'bone') return SLATE[1];
    }
    return toneAt(n, SLATE, 0);
  }, 2);
  S.seams();
  // where the hollows lie on the picture, for the main chat
  (ALTAR_HOLLOWS as [number, number][]).length = 0;
  for (const [hx, hy] of hollows) {
    const [sx, sy] = S.at([hx, hy, 5 + H]);
    (ALTAR_HOLLOWS as [number, number][]).push([Math.round(sx - 56), Math.round(sy - 50)]);
  }
  return compose(null, [S.p], null).sprite(56, 50, GRAIN);
}

/** (for the tests: the colours of the cult's fire, the one thing here that may glow) */
export const CULT_FIRE: readonly string[] = [...FLAME];
