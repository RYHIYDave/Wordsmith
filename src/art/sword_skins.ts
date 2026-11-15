// SKINS FOR THE WARRIOR'S GREAT SWORD (14 Nov 2026): the game's three unique great swords drawn in his hands, as the Mage's
// staves are in hers (art/staff_skins.ts). His word, 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the
// cast”; asked whether to start, his pick: “Start the rest of the cast (Recommended)”. PICTURES FIRST: nothing of the game draws
// these until he has seen them on him and said yes.
//
// His great sword is painted flat on its own sheet, as it always was (art/hero_warrior.ts blade: the grip at a point, the blade
// so many degrees round, so long), and a skin paints another there (art/warrior_up.ts SwordSkin; his own PLAIN_SWORD, painted
// exactly as before). Each of these is drawn to its picture in the bag (art/items_unique.ts), the same sword in the hand:
//   MILLSTONE: a heavy blade, broader than his, of grey steel, and a millstone for a guard.
//   WINDCUTTER: a pale blade, a little curved, slotted for the wind, a winged guard, white streamers from it.
//   UNDERTOW: a blade the colour of deep water, an anchor's arms for a guard.
// What glows on him is the friend's: each blade's light is of the cyan's family (Millstone's faint, its steel grey).

import type { Light, Px } from '../engine/px';
import { dir, hash } from './kit';
import { PLAIN_SWORD } from './warrior_up';
import type { SwordSkin } from './warrior_up';

/** The parts of a sword at a point of its sheet, as art/hero_warrior.ts blade lays them: how far along it, how far across (the lit side +). */
interface At {
  u: number;
  v: number;
}
/**
 * Paint a sword along (hx, hy) at `deg`, `paint` saying the colour at each point (null: none), within `reach` of the grip. The lit
 * side of the blade is the one the light (from the upper left) falls on, as his own's.
 */
function laySword(p: Px, hx: number, hy: number, deg: number, reach: number, paint: (a: At) => string | null): void {
  const [dx, dy] = dir(deg);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const c = paint({ u: rx * dx + ry * dy, v: (-rx * dy + ry * dx) * litSide });
      if (c) p.set(x, y, c);
    }
  }
}
/** A sword's light: soft halos from its guard to its tip, in its own colour. */
function lightsAlong(color: string, a: number) {
  return (hx: number, hy: number, deg: number, len: number): Light[] => {
    const [dx, dy] = dir(deg);
    return [0.3, 0.62, 0.92].map((k) => ({ x: hx + dx * (4 + len * k), y: hy + dy * (4 + len * k), r: 9 + len * 0.12, color, a }));
  };
}
const GRIP_LEATHER = ['#3a1e10', '#5a3018', '#7e4826'] as const;
const POMMEL = ['#3a3478', '#7a74c8', '#d6d0ff'] as const;

// ---------------------------------------------------------------------------------------------
// MILLSTONE (game/uniques.ts `millstone`: “Whirlwind has no time limit: you spin for as long as you hold.”)

const MILL_STEEL = ['#22202a', '#36344a', '#57556c', '#82809a', '#b4b2c8'] as const;
const STONE = ['#3a3844', '#5a5866', '#86848f', '#b0aeb8', '#d4d2da'] as const;

/**
 * A heavy blade of dark grey steel, broad, a faint cyan fuller down it; a MILLSTONE for a guard, out past his fists, wide and
 * thick, a groove round it, a dark hole where the blade goes through.
 */
export const MILLSTONE_SWORD: SwordSkin = {
  id: 'millstone',
  name: 'Millstone',
  blade(p, hx, hy, deg, len, bw, grip, guard) {
    const w = bw * 1.55;
    const c = 6.2;
    const tip = c + 2 + len;
    const R = w + guard * 1.5;
    laySword(p, hx, hy, deg, len + grip + 16, ({ u, v }) => {
      // (the millstone: round, thick, seen across the blade, a groove round it and a dark hole where the blade goes through)
      const su = (u - c) / 2.9;
      const sv = v / R;
      const d = su * su + sv * sv;
      if (d <= 1) {
        if (Math.abs(v) < w * 0.6 && Math.abs(u - c) < 1.1) return '#1a1820';
        if (Math.abs(d - 0.55) < 0.07) return STONE[1];
        return v > R * 0.4 ? STONE[4] : v < -R * 0.5 ? STONE[1] : hash(Math.round(u * 3), Math.round(v * 3), 11) < 0.22 ? STONE[2] : STONE[3];
      }
      if (u >= c + 2 && u <= tip) {
        const half = u > tip - 5 ? (tip - u) * (w / 5) : w;
        if (Math.abs(v) > half) return null;
        if (Math.abs(v) < 0.5 && u < tip - 6) return '#8af6f0';
        return v > w * 0.45 ? MILL_STEEL[4] : v < -w * 0.4 ? MILL_STEEL[1] : MILL_STEEL[3];
      }
      if (u >= 2 - grip && u < c - 2.6 && Math.abs(v) <= 1.4) return Math.floor(u + 40) % 2 === 0 ? GRIP_LEATHER[1] : GRIP_LEATHER[2];
      if (u >= -grip - 0.8 && u < 2 - grip && Math.abs(v) <= 2.2) return v > 0.4 ? STONE[4] : v < -0.9 ? STONE[1] : STONE[3];
      return null;
    });
  },
  lights: lightsAlong('#8af6f0', 0.14),
};

// ---------------------------------------------------------------------------------------------
// WINDCUTTER (game/uniques.ts `windcutter`: “The third Strike in a row sends a blade of wind on ahead.”)

const WIND = ['#5a7e9e', '#8eb2cc', '#c4def0', '#eaf6ff', '#ffffff'] as const;

/** A pale blade, a little curved toward its edge, slotted for the wind; a guard of two swept-back wings; two white streamers from it. */
export const WINDCUTTER_SWORD: SwordSkin = {
  id: 'windcutter',
  name: 'Windcutter',
  blade(p, hx, hy, deg, len, bw, grip, guard) {
    const tip = 4 + len;
    laySword(p, hx, hy, deg, len + grip + 14, ({ u, v }) => {
      // (the curve: the blade's middle bowed toward its back as it runs to the point)
      const k = Math.max(0, (u - 4) / len);
      const bow = 2.2 * k * k;
      const vv = v + bow;
      if (u >= 4 && u <= tip) {
        const half = u > tip - 5 ? (tip - u) * (bw / 5) : bw * (1 - 0.15 * k);
        if (Math.abs(vv) > half) return null;
        // (the slots: three long holes down its middle, the wind through them)
        for (const at of [0.3, 0.5, 0.7]) if (Math.abs(u - (4 + len * at)) < 1.6 && Math.abs(vv) < 0.6) return null;
        return vv > bw * 0.35 ? WIND[4] : vv < -bw * 0.35 ? WIND[1] : WIND[3];
      }
      // (the wings: swept back from the guard either side, toward the grip as they go out)
      if (u >= 0.6 && u < 4) {
        const out = Math.abs(v);
        const back = (out - bw) * 0.55;
        if (out <= bw + guard + 2.6 && u >= 3.8 - 1.6 - Math.max(0, back) && u <= 4 - Math.max(0, back) * 0.9) return v > 1.5 ? WIND[4] : v < -2.5 ? WIND[0] : WIND[2];
      }
      // (the streamers: two white ribbons from the guard, hung back past the grip, rippling)
      for (const sd of [1, -1]) {
        const off = sd * (bw + 1.4) + Math.sin(u * 0.9 + sd) * 0.7;
        if (u < 2.4 && u > 2.4 - (grip + 9) && Math.abs(v - off) < 0.55) return u > -grip ? WIND[4] : WIND[3];
      }
      if (u >= 2 - grip && u < 2.2 && Math.abs(v) <= 1.3) return Math.floor(u + 40) % 2 === 0 ? WIND[1] : WIND[2];
      if (u >= -grip - 0.6 && u < 2 - grip && Math.abs(v) <= 2) return v > 0.4 ? POMMEL[2] : v < -0.9 ? POMMEL[0] : POMMEL[1];
      return null;
    });
  },
  lights: lightsAlong('#d8f4ff', 0.26),
};

// ---------------------------------------------------------------------------------------------
// UNDERTOW (game/uniques.ts `undertow`: “Adds Pulling in front of the hold attack: Whirlwind drags in what it cuts.”)

const DEEP = ['#0a2440', '#103e62', '#185e82', '#2a8aa2', '#6cc8cc'] as const;
const ANCHOR = ['#1e2230', '#3a4256', '#6a7488', '#a2aabc', '#e0e4ee'] as const;

/** A blade the colour of deep water, lighter at its edge as a wave's lip is; an anchor's two arms for a guard, curving up, barbed. */
export const UNDERTOW_SWORD: SwordSkin = {
  id: 'undertow',
  name: 'Undertow',
  blade(p, hx, hy, deg, len, bw, grip, guard) {
    const tip = 4 + len;
    laySword(p, hx, hy, deg, len + grip + 12, ({ u, v }) => {
      if (u >= 8.2 && u <= tip + 3) {
        const half = u > tip - 1 ? (tip + 3 - u) * (bw / 4) : bw;
        if (Math.abs(v) > half) return null;
        // (a wave's lip along its lit edge, the deep below, a ripple of lighter water down it)
        if (v > half - 0.7) return DEEP[4];
        if (Math.abs(v - Math.sin(u * 0.5) * 0.6) < 0.35 && u < tip - 4) return DEEP[3];
        return v < -bw * 0.35 ? DEEP[0] : DEEP[2];
      }
      // (THE ANCHOR: its shank from his fists up the blade's foot to its crown, well past his fists, and its two arms from the
      // crown out either side, curving up toward the point, each ending in a broad barbed fluke)
      const crown = 7.0;
      const reach = bw + guard + 3.6;
      const out = Math.abs(v);
      if (out <= reach + 1.2 && u >= crown - 1.6 && u < crown + 8) {
        const k = Math.max(0, (out - 0.8) / (reach - 0.8));
        const rise = crown + k * k * 5.2;
        if (out <= reach && Math.abs(u - rise) < 1.25 + k * 0.2) return v > 0 ? ANCHOR[4] : ANCHOR[2];
        // (the flukes: a broad barb at each arm's end)
        const fu = crown + 5.2;
        if (u > fu - 3.4 && u < fu + 0.8 && out > reach - 1.8 && out < reach + 1.2 - Math.max(0, fu - u) * 0.15) return v > 0 ? ANCHOR[3] : ANCHOR[1];
      }
      if (u >= 2.2 && u < crown && out <= bw * 0.75) return v > 0.4 ? ANCHOR[3] : ANCHOR[1];
      if (u >= 2 - grip && u < 2.2 && Math.abs(v) <= 1.3) return Math.floor(u + 40) % 2 === 0 ? DEEP[1] : DEEP[2];
      if (u >= -grip - 1.2 && u < 2 - grip && Math.abs(v) <= 2) {
        // (its pommel an anchor's ring)
        const r = Math.hypot(u - (1 - grip), v * 1.1);
        return r > 1.0 && r < 2.0 ? ANCHOR[3] : null;
      }
      return null;
    });
  },
  lights: lightsAlong('#36c0c8', 0.28),
};

/** The skins of his great sword, his own first. */
export const SWORD_SKIN_LIST: readonly SwordSkin[] = [PLAIN_SWORD, MILLSTONE_SWORD, WINDCUTTER_SWORD, UNDERTOW_SWORD];
