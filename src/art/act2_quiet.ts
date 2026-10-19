// ACT 2'S PLACES A STEP QUIETER THAN ANY WORD (his art rulebook, Colour 4: "A place's palette stays darker and duller
// than any word's colour, so a word at work always reads"). A mock-up's helper; nothing of the game imports it.
//
// The Gate Ward's ground (art/gateward.ts) and the Hush's pieces (art/act2_kit.ts, art/floor11.ts, art/act2_set.ts)
// were painted, and shown him, a little richer than that: their clay roofs, oxblood awnings and brass at about 0.55
// to 0.6 of full colour where the dullest of the nine words is at 0.5. Every colour they put down is quietened here
// to at most QUIET_MOST of full colour, its hue and its brightness kept; what glows (an honest fire, a candle, the
// enemy's pink burning to gold, the Bells' cyan, the hero's) is left as it is, as Colour 3 asks it to be.

import type { RGB, TerrainLook } from './terrain';
import { CYAN } from './kit';
import { FLAME } from './mkit';
import { EMBER, COAL } from './props';

/** The most of full colour (HSV saturation) a place's colour may have: under the dullest word's (0.5). */
export const QUIET_MOST = 0.46;

/** What glows, and so may be bright (lower-case hex): the enemy's fire, the hero's cyan, an honest fire; and what a piece registers as its own glow. */
export const BRIGHT = new Set<string>([...FLAME, ...CYAN, ...EMBER, ...COAL, '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058'].map((c) => c.toLowerCase()));
/** A piece's own glowing colours (a candle's flame, the dome's shards' pink, a bell awake with the hero's cyan): left bright. */
export function bright(...ramps: ReadonlyArray<ReadonlyArray<string>>): void {
  for (const r of ramps) for (const c of r) BRIGHT.add(c.toLowerCase());
}

/** A colour no richer than QUIET_MOST of full colour, its hue and brightness kept. */
export function quietRGB(c: RGB): RGB {
  const [r, g, b] = c;
  const M = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  if (M <= 0 || (M - m) / M <= QUIET_MOST) return c;
  // (each channel keeps where it lies between the darkest and the brightest; the darkest raised toward the brightest)
  const m2 = M * (1 - QUIET_MOST);
  const k = (M - m2) / (M - m);
  return [M - (M - r) * k, M - (M - g) * k, M - (M - b) * k];
}
const hex2 = (v: number): string => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
const QUIET = new Map<string, string>();
/** The same for a colour as hex: left as it is if it glows. */
export function quietHex(c: string): string {
  const k = c.toLowerCase();
  if (BRIGHT.has(k)) return c;
  let q = QUIET.get(k);
  if (!q) {
    const rgb = quietRGB([parseInt(k.slice(1, 3), 16), parseInt(k.slice(3, 5), 16), parseInt(k.slice(5, 7), 16)]);
    QUIET.set(k, (q = '#' + rgb.map(hex2).join('')));
  }
  return q;
}

/**
 * A GROUND'S LOOK (art/terrain.ts) a step quieter than any word: every colour it puts down quietened as `quietRGB`
 * does, but those `keep` says to leave (an honest light). The Gate Ward's (art/gateward.ts) does the same itself.
 */
export function quietTerrain(L: TerrainLook, keep: (c: RGB) => boolean = () => false): TerrainLook {
  const q = (c: RGB): RGB => (keep(c) ? c : quietRGB(c));
  return {
    ...L,
    floor: (x, y, px, py, inside) => q(L.floor(x, y, px, py, inside)),
    face: (shade, v, px, py, x, y) => q(L.face(shade, v, px, py, x, y)),
    top: (x, y, px, py, back, climb) => q(L.top(x, y, px, py, back, climb)),
    nearFace: (v, px, py, x, y) => q(L.nearFace(v, px, py, x, y)),
    brow: (c, px, py) => q(L.brow(c, px, py)),
    ...(L.lip ? { lip: (c: RGB) => q(L.lip!(c)) } : {}),
    ...(L.hang ? { hang: { ...L.hang, at: (v: number, px: number, py: number, shade: number) => q(L.hang!.at(v, px, py, shade)) } } : {}),
  };
}
