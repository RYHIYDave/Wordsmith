// THE EIGHT MELDS' COLOURS (render/melds8.ts): every colour the game's words already have, and how near a colour comes to them, as
// the eye sees colour (CIEDE2000, the check words10's test makes). npx tsx tools/melds8_palette.ts [#hex ...]
import { WORD_COLOR } from '../src/art/icons';
import { WORD_IDS } from '../src/game/types';
import { BIND_RAMP } from '../src/render/binding3';
import { MELD_RAMP } from '../src/render/melds3';
import { VMELD_RAMP } from '../src/render/volatile3';
import { NEW_RAMP } from '../src/render/words3';
import { W7_RAMP } from '../src/render/words7';
import { W10_RAMP } from '../src/render/words10';

export function lab(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number): number => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92);
  const [r, g, b] = [lin(((n >> 16) & 255) / 255), lin(((n >> 8) & 255) / 255), lin((n & 255) / 255)];
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const F = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * F(Y) - 16, 500 * (F(X) - F(Y)), 200 * (F(Y) - F(Z))];
}
export function de2000(a: string, b: string): number {
  const [L1, a1, b1] = lab(a);
  const [L2, a2, b2] = lab(b);
  const rad = Math.PI / 180;
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h1p = ((Math.atan2(b1, a1p) / rad) + 360) % 360;
  const h2p = ((Math.atan2(b2, a2p) / rad) + 360) % 360;
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) dhp = Math.abs(h2p - h1p) <= 180 ? h2p - h1p : h2p - h1p > 180 ? h2p - h1p - 360 : h2p - h1p + 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  const hbp = C1p * C2p === 0 ? h1p + h2p : Math.abs(h1p - h2p) <= 180 ? (h1p + h2p) / 2 : h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dth = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dth * rad) * RC;
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}

/** Every colour a word of the game already shows, the friend's cyan and the enemy's pink and gold. */
export function taken(): Record<string, string> {
  const out: Record<string, string> = { cyan: '#28dcf0', runedust: '#5ce8f8', pink: '#ff4f8a', gold: '#ffd27a', binding: BIND_RAMP[3] };
  for (const w of WORD_IDS) out[w] = WORD_COLOR[w];
  for (const [w, r] of Object.entries(W7_RAMP)) out[w] = r[3];
  for (const [w, r] of Object.entries(W10_RAMP)) out[w] = r[3];
  for (const [w, r] of Object.entries(NEW_RAMP)) out[w] = r[3];
  for (const [w, r] of Object.entries(MELD_RAMP)) out[`meld ${w}`] = r[3];
  for (const [w, r] of Object.entries(VMELD_RAMP)) out[`meld ${w}`] = r[3];
  return out;
}

export function nearest(c: string, others: Record<string, string>): [string, number] {
  let best: [string, number] = ['', 99];
  for (const [w, d] of Object.entries(others)) {
    const e = de2000(c, d);
    if (e < best[1]) best = [w, e];
  }
  return best;
}

// @ts-ignore - node typings are not part of this project
if (process.argv[1] && process.argv[1].endsWith('melds8_palette.ts')) {
  const t = taken();
  // @ts-ignore
  const asked: string[] = process.argv.slice(2);
  if (!asked.length) for (const [w, c] of Object.entries(t)) console.log(`${w.padEnd(20)} ${c}  near ${nearest(c, Object.fromEntries(Object.entries(t).filter(([k]) => k !== w))).map((v) => (typeof v === 'number' ? v.toFixed(1) : v)).join(' ')}`);
  for (const c of asked) console.log(`${c}  nearest ${nearest(c, t)[0]} ${nearest(c, t)[1].toFixed(1)}`);
}
