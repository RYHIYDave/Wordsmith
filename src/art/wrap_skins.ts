// SKINS FOR THE BRAWLER'S WRAPS (14 Nov 2026): the game's four unique wraps drawn on his fists, as the Mage's unique staves are
// in her hand (art/staff_skins.ts), the Ranger's bows, the Tinkerer's wrenches and the Warrior's weapons in theirs. His word, 14
// Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; asked whether to start, his pick: “Start the rest
// of the cast (Recommended)”. PICTURES FIRST: nothing of the game draws these until he has seen them on him and said yes.
// Shown them (docs/mockups/wrap_skins/pictures/wraps_moves.mp4), 14 Nov 2026: “Yes, all four (Recommended)”. In the game behind art/heroes.ts WRAP_SKINS, ON at his
// yes to him wearing them in play (15 Nov 2026, by 09:16): “Yes, switch them on (Recommended)”.
//
// His wraps are a skin laid on his fists (dev/sculpt_veteran.ts WrapAt, WrapSkin; his own PLAIN_WRAPS, painted exactly as
// before): the straps round his knuckles, hand and wrist, and what is added to each fist. Each of these is drawn to its picture
// in the bag (art/items_unique.ts):
//   THE LAST ROUND: his knuckles' straps charred black, embers in them, and a fire licking up off the knuckles of both fists
//     (an honest fire's orange, the third globe's fire).
//   THE FOURTH GLOBE: a globe set on every knuckle, in dark steel, of both fists: a punch's green, a kick's orange, a jump's
//     white, and a fourth, green.
//   HOT STREAK: a champion's wraps, white linen gilt at the knuckles, and pinned to his lead wrist a blue rosette, its two
//     ribbons hanging.
//   TAPED KNUCKLES (the levelling unique of floor 7): white tape where his leather was, two bands of red tape across it.
// Only the fire glows, as fire does; nothing the enemy's pink or gold glow (the gilt is metal, not light).

import type { Ramp } from './kit';
import { add, cross, dot, mul, norm, sub } from './skeleton';
import type { V3 } from './skeleton';
import { PLAIN_WRAPS } from '../dev/sculpt_veteran';
import type { WrapAt, WrapSkin } from '../dev/sculpt_veteran';
import type { WrapId } from './heroes';

/** The game's four unique wraps (game/uniques.ts), by their ids (art/heroes.ts, where the game asks for them without the pictures). */
export type { WrapId };

const sh = (r: Ramp | readonly string[], k: number): string => r[Math.max(0, Math.min(r.length - 1, k))];
/** How far down the hand a point is, in fists (0 at the wrist, the knuckles' band about 2). */
const downHand = (p: V3, w: WrapAt): number => dot(sub(p, w.ha), w.d) / w.F;
/** Straight up in the world. */
const UP: V3 = [0, 0, 1];
/** A knuckle's place on the fist's band, out on the back of the hand (k: across, as the sculpt lays them, 1.9 to -2.0). */
const knuckle = (w: WrapAt, k: number, out = 0): V3 => add(w.ha, add(mul(w.d, (1.95 + 0.2) * w.F), add(mul(w.inw, (-1.1 - out) * w.F), mul(w.top, k * w.F))));
const KNUCKLES = [1.9, 0.6, -0.7, -2.0];

// ---------------------------------------------------------------------------------------------
// THE LAST ROUND (game/uniques.ts `lastround`: “The third globe of every combo sets itself in fire, the jump not spent.”)

/** Charred leather: near black, the faintest brown in its light. */
const CHAR: Ramp = ['#08060a', '#140e10', '#221816', '#34241c', '#4a3424'];
/** An honest fire: dark orange at its skin, yellow at its heart. */
const FIRE: Ramp = ['#b8401a', '#e8641e', '#ff9a2e', '#ffc85a', '#ffe9a6'];

export const LAST_ROUND_WRAPS: WrapSkin = {
  id: 'lastround',
  name: 'The Last Round',
  strap: CHAR,
  // (embers in the char, where the knuckles' band is: a few specks of fire that flicker by the pose)
  strapPaint: (h, w) => {
    const k = downHand(h.p, w);
    if (k > 1.4 && (h.x * 7 + h.y * 3) % 13 === 0 && h.tone >= 1) return FIRE[1];
    return w.far ? sh(CHAR, h.tone - 1) : null;
  },
  extras(sc, w, t) {
    const fire = sc.mat({ ramp: FIRE, crease: 0, paint: (h) => (h.tone >= 3 ? FIRE[4] : h.tone >= 2 ? FIRE[3] : FIRE[2]) });
    // three tongues of fire off each fist's knuckles, licking up and out, each its own flicker
    const out = norm(add(mul(w.d, 0.55), mul(w.inw, -0.45)));
    [1.4, -0.05, -1.5].forEach((k, i) => {
      const flick = Math.sin(t * 3.1 + i * 2.1 + (w.side === 'L' ? 0.9 : 0));
      const flick2 = Math.sin(t * 5.3 + i * 1.3);
      const base = add(knuckle(w, k, -0.35), mul(out, 0.4));
      const rise = norm(add(UP, add(mul(out, 0.6), mul(w.top, 0.18 * flick2))));
      const tall = (i === 1 ? 6.2 : 4.6) + flick * 1.3;
      const mid = add(base, add(mul(rise, tall * 0.5), mul(w.top, 0.4 * flick)));
      const tip = add(base, add(mul(rise, tall), mul(w.top, 0.9 * flick2)));
      sc.cone(fire, w.piece, base, mid, 1.15, 0.85, 0.4, { tag: 'fire' });
      sc.cone(fire, w.piece, mid, tip, 0.85, 0.12, 0.4, { tag: 'fire' });
    });
  },
};

// ---------------------------------------------------------------------------------------------
// THE FOURTH GLOBE (game/uniques.ts `fourthglobe`: “Your combos hold four globes: one more blow before the combo locks.”)

const DSTEEL: Ramp = ['#121218', '#24242e', '#3c3c4a', '#5c5c6c', '#8a8a9a'];
/** The globes' colours, as the bag's picture has them (art/items_unique.ts R): a punch's green, a kick's orange, a jump's white. */
const PUNCH: Ramp = ['#0c6a38', '#12a050', '#18c060', '#76f4ae', '#d4ffe6'];
const KICK: Ramp = ['#5a1606', '#a8340a', '#e8561a', '#ff7c2e', '#ffb486'];
const JUMP: Ramp = ['#6a6890', '#a4a2c4', '#d4d2ea', '#f2f2fc', '#ffffff'];

export const FOURTH_GLOBE_WRAPS: WrapSkin = {
  id: 'fourthglobe',
  name: 'The Fourth Globe',
  strap: PLAIN_WRAPS.strap,
  extras(sc, w) {
    const steel = sc.mat({ ramp: DSTEEL, crease: 0.3 });
    const globes = [PUNCH, KICK, JUMP, PUNCH].map((r) => sc.mat({ ramp: r, crease: 0.1, paint: (h) => (h.tone >= 4 ? '#ffffff' : null) }));
    // (on the knuckles' ridge itself, the striking face, standing out of it: up by his cheeks in his guard, they are on top)
    const n = norm(add(w.d, mul(w.inw, -0.7)));
    const m = norm(cross(n, w.top));
    KNUCKLES.forEach((k, i) => {
      const c = add(w.ha, add(mul(w.d, 3.35 * w.F), add(mul(w.inw, -0.75 * w.F), mul(w.top, k * 0.95 * w.F))));
      // the setting, then the globe in it
      sc.ell(steel, w.piece, c, [mul(n, 0.7), mul(w.top, 1.2), mul(m, 1.2)], 0.1, { tag: 'setting' });
      sc.ell(globes[i], w.piece, add(c, mul(n, 0.75)), [mul(n, 1.0), mul(w.top, 1.02), mul(m, 1.02)], 0, { tag: 'globe' });
    });
  },
};

// ---------------------------------------------------------------------------------------------
// HOT STREAK (game/uniques.ts `winningstreak`: “Every combo you finish makes your blows hit harder.”)

/** White linen, a champion's, clean. */
const WHITE_LINEN: Ramp = ['#4a4652', '#86818c', '#bcb6b8', '#e2dcd6', '#fbf7f0'];
/** Gilt: metal, not light. */
const GILT: Ramp = ['#3e2a0c', '#6c4c14', '#a47c26', '#d8b04a', '#f6e296'];
const ROSETTE: Ramp = ['#0e1638', '#1a2a66', '#2a449c', '#4a68c6', '#7c98e2'];

export const HOT_STREAK_WRAPS: WrapSkin = {
  id: 'winningstreak',
  name: 'Hot Streak',
  strap: WHITE_LINEN,
  // (gilt round the knuckles)
  strapPaint: (h, w) => (downHand(h.p, w) > 1.5 ? sh(GILT, h.tone - (w.far ? 1 : 0)) : null),
  extras(sc, w, t) {
    // the rosette on his lead wrist only, its two ribbons hanging
    if (w.side !== 'L') return;
    const blue = sc.mat({ ramp: ROSETTE, crease: 0.35, paint: (h) => (w.far ? sh(ROSETTE, h.tone - 1) : null) });
    const gold = sc.mat({ ramp: GILT, crease: 0.2 });
    const back = norm(mul(w.inw, -1));
    const across = norm(cross(back, w.d));
    const c = add(w.ha, add(mul(w.d, 0.1 * w.F), mul(back, 2.45 * w.F)));
    // its ribbons, from under it, hanging down whichever way his arm is
    const hang = norm(add(mul(UP, -1), mul(back, 0.25)));
    [-1, 1].forEach((s, i) => {
      const a = add(c, mul(across, s * 0.7));
      const sway = Math.sin(t * 2.2 + i * 1.7) * 0.5;
      const b = add(a, add(mul(hang, 4.2), mul(across, s * 0.9 + sway)));
      const wd = mul(norm(cross(sub(b, a), back)), 0.75);
      sc.tri(blue, w.piece, add(a, wd), sub(a, wd), add(b, wd), 0.32, 0.2, { tag: 'ribbon' });
      sc.tri(blue, w.piece, sub(a, wd), sub(b, wd), add(b, wd), 0.32, 0.2, { tag: 'ribbon' });
    });
    sc.ell(blue, w.piece, c, [mul(back, 0.6), mul(w.d, 2.0), mul(across, 2.0)], 0.2, { tag: 'rosette' });
    sc.ell(gold, w.piece, add(c, mul(back, 0.45)), [mul(back, 0.5), mul(w.d, 0.95), mul(across, 0.95)], 0, { tag: 'rosette' });
  },
};

// ---------------------------------------------------------------------------------------------
// TAPED KNUCKLES (game/uniques.ts `tapedknuckles`, the levelling unique of floor 7)

/** White tape, a little dirty. */
const TAPE: Ramp = ['#54505a', '#8e8a92', '#c6c2c4', '#e6e2de', '#faf8f4'];
const RED_TAPE: Ramp = ['#3c0a0e', '#6c1418', '#a0222a', '#cc3a3a', '#ec6a5e'];

export const TAPED_WRAPS: WrapSkin = {
  id: 'tapedknuckles',
  name: 'Taped Knuckles',
  strap: TAPE,
  // (two bands of red tape across it: over the knuckles, and round the wrist)
  strapPaint: (h, w) => {
    const k = downHand(h.p, w);
    const red = Math.abs(k - 2.05) < 0.24 || Math.abs(k - 0.1) < 0.2;
    if (red) return sh(RED_TAPE, h.tone - (w.far ? 1 : 0));
    return null;
  },
};

/** THE FOUR, by their ids. */
export const WRAP_SKIN_OF: Record<WrapId, WrapSkin> = {
  lastround: LAST_ROUND_WRAPS,
  fourthglobe: FOURTH_GLOBE_WRAPS,
  winningstreak: HOT_STREAK_WRAPS,
  tapedknuckles: TAPED_WRAPS,
};
/** His own first, then the four, in the order they are shown. */
export const WRAP_SKIN_LIST: WrapSkin[] = [PLAIN_WRAPS, LAST_ROUND_WRAPS, FOURTH_GLOBE_WRAPS, HOT_STREAK_WRAPS, TAPED_WRAPS];
