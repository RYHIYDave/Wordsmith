// FLOOR 13'S DOUBLE BOSS, THE SCRAPER AND THE QUILL: WHAT THEY ARE MADE OF (the art chat, 20 Oct 2026). A MOCK-UP: NOT IN THE
// GAME (behind PAIR_ON, art/scraper.ts).
//
// The owner, 20 Oct 2026, 14:14 Pacific: "I’d like the palimpsest to be something different.  There’s too many humanoid
// looking enemies"; then "I’d like a double boss.  What ideas do you have for two bosses at the same time"; his pick of three,
// "Scraper and Quill (Recommended)"; "New attacks for sure tho"; "And have them team up for a combo attack as well"; to the
// moves proposed, "Sounds good.  But make the hit boxes on the attacks, and the attacks themselves big".
//
// A palimpsest is a page scraped clean and written over. So the Palimpsest is two: THE SCRAPER, a giant crayfish of sodden,
// layered pages, its claws the Order's black ink, that scrapes; and THE QUILL, a heron of clean white pages, its beak a
// steel nib dripping ink, that writes over what is scraped. The same stuff as the floor's paper mill: the Palimpsest's own
// pages (art/palimpsest.ts pageSkin), its old writing under them and the stolen words burning there the enemy's pink.

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import type { PanelSkin } from './new_mobs3';
import type { Skin } from './skin';
import type { V3 } from './skeleton';

const fr = (t: number): number => t - Math.floor(t);

/** THE ORDER'S INK, wet and glossy: the Scraper's claws, the Quill's legs and the ink it writes with. */
export const INK: Ramp = ['#060509', '#100e15', '#1d1a25', '#332f40', '#5c5670'];
/** A NIB'S STEEL, dark and blued, its edge catching the light. */
export const STEEL: Ramp = ['#0e1016', '#1e222c', '#363c4a', '#5a6272', '#9aa2b2'];
/** THE QUILL'S PAGES: clean white vellum, scraped and ready, a little warm in the light, cool in the shade. */
export const WHITE: Ramp = ['#3e3c42', '#76747a', '#b4b0aa', '#dcd6c8', '#f4efe2'];
/** THE SCRAPER'S PAGES: grey and sodden, the newest the darkest with soaking. */
export const SODDEN: Ramp = ['#1b1a19', '#34322e', '#5a564c', '#827c6c', '#a29a86'];
/** The old layers under them: vellum gone yellow-brown, written in brown. */
export const OLDV: Ramp = ['#251a10', '#4a3720', '#7c6440', '#a48a5c', '#bea472'];
/** The grey pulp of its joints and legs. */
export const PULPG: Ramp = ['#1e1d1b', '#383631', '#5e5a51', '#857f72', '#a39c8c'];
const INK_NEW = '#14121a';
const INK_OLD = '#3e2616';

/**
 * A PAGE (a flat panel's skin), as the Palimpsest's pages are painted: torn at its edges; its writing in rows across it in the
 * Order's black ink; its lower edge curled out, catching the light, a dark line under it. `ramp`: the paper's (SODDEN for the
 * Scraper, WHITE for the Quill); `fine`: the writing finer and closer (the Quill's own hand); `blade` (0 to 1): its edges
 * glinting the enemy's pink, a page flung to cut; `wet`: soaked patches.
 */
export function leafSkin(seed: number, lu: number, lv: number, ramp: Ramp, fine = false, blade = 0, wet = 0.22): PanelSkin {
  const rowH = fine ? 2.2 : 2.9;
  const wordW = fine ? 3.4 : 4.6;
  return (a, b, front, tone0) => {
    const tone = [1, 2, 3, 3, 4][Math.max(0, Math.min(4, tone0))];
    const ja = 0.4 + 1.0 * hash(Math.floor((b + lv) / 1.6), seed, 7101);
    const jb = 0.3 + 1.0 * hash(Math.floor((a + lu) / 1.6), seed, 7102);
    if (Math.abs(a) > lu - ja || Math.abs(b) > lv - jb) return null;
    if (blade > 0.05 && (Math.abs(a) > lu - ja - 0.9 || Math.abs(b) > lv - jb - 0.9)) return blade > 0.6 ? FLAME[3] : FLAME[2];
    if (!front) return ramp[Math.max(0, tone - 1)];
    if (b > lv - jb - 1.0) return INK_NEW;
    if (b > lv - jb - 2.0) return ramp[Math.min(4, tone + 1)];
    const side = Math.abs(a) > lu - ja - 0.9;
    const damp = hash(Math.floor((a + 30) / 5.5), Math.floor((b + 30) / 4.5) + seed * 7, 7103) < wet;
    const base = ramp[Math.max(0, tone - (damp || side ? 1 : 0))];
    const rb = b + lv - 2.6;
    const row = Math.floor(rb / rowH);
    const end = lu - ja - 1.3 - 2.2 * hash(row, seed, 7107);
    if (rb - row * rowH < (fine ? 0.7 : 0.95) && rb > 0 && b < lv - jb - 2.6 && a > -lu + ja + 1.3 && a < end) {
      const off = hash(row, seed, 7104) * 4;
      const word = Math.floor((a + lu + off) / wordW);
      if (fr((a + lu + off) / wordW) < 0.76 && hash(word, row + seed * 13, 7105) < 0.9) return INK_NEW;
    }
    return base;
  };
}

/** THE OLD LAYERS under the pages, on a round solid: yellowed vellum written in brown, row on row; and here and there in it a stolen word burning the enemy's pink. `scale`: the solid's half-lengths, so the rows are the same size on every part. */
export function oldLayers(seed: number, scale: V3, burn = 0.3): Skin {
  return (u, tone0) => {
    const tone = [1, 1, 2, 3, 4][tone0];
    const z = u[2] * scale[2];
    const around = Math.atan2(u[1] * scale[1], u[0] * scale[0]) * ((scale[0] + scale[1]) / 2);
    const row = Math.floor(z / 2.7);
    if (z - row * 2.7 < 0.9) {
      const w = Math.floor((around + hash(row, seed, 7111) * 4) / 3.6);
      const lit = hash(w, row + seed * 11, 7112);
      if (lit < 0.05 + 0.1 * burn) return lit < 0.02 + 0.04 * burn ? FLAME[3] : FLAME[2];
      if (lit < 0.78) return INK_OLD;
    }
    if (hash(Math.floor(around / 5), Math.floor(z / 5.4), seed + 7113) < 0.06) return OLDV[Math.max(0, tone - 2)];
    return OLDV[tone];
  };
}

/** Wet ink on a solid: glossy black, a hard light along its top, a sheen of the enemy's pink where `glint` (0 to 1) says. */
export function inkSkin(glint = 0): Skin {
  return (u, tone) => {
    if (glint > 0.05 && u[2] > 0.55 && Math.abs(u[1]) < 0.5) return glint > 0.6 ? FLAME[3] : FLAME[2];
    if (u[2] > 0.72 && Math.abs(u[1]) < 0.35) return INK[4];
    return INK[Math.max(0, Math.min(4, tone - 1))];
  };
}

/** Rolled paper round a limb: a page's grey wound round it, the ends of its writing in short black strokes. */
export function rolledSkin(ramp: Ramp, seed: number): Skin {
  return (u, tone) => {
    const t = Math.max(0, Math.min(4, tone));
    const turn = fr((Math.atan2(u[1], u[0]) / (Math.PI * 2)) * 2 + u[2] * 1.6);
    if (turn < 0.08) return ramp[Math.max(0, t - 2)];
    if (hash(Math.floor(u[2] * 6 + 9), Math.floor(turn * 7), seed) < 0.12) return INK_NEW;
    return ramp[t];
  };
}
