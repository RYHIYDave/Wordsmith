// FLOOR 5'S BOSS, THE FLESHMANCER, BROUGHT UP TO PAR (art/fm2_switch.ts FLESH2): HIS LIGHT ABOUT HIM AND HIS DEATH, drawn straight
// onto the game's own pixels each frame (render/act1_fx/fm.ts), given where a point of the floor is on the screen.
//   HIS LIGHT: he is human sized, and in his dark hall he was lost: so his ritual circle burns under him wherever he glides, its
//     runes turning, his pink light pooled in it, and his power rising off him in motes.
//   HIS DEATH (his pick, 11 Oct 2026: “His own dead drag him down (Recommended)”, his own pictures, art/fleshmancer.ts): as he is
//     struck, his light bursts out over the floor and the floor cracks out from under him, lit; the hands of his dead burst up all
//     round him (render/act1_fx/fm.ts, the game's own hands) and drag him under; as the skull goes down last it shrieks, and his
//     power goes up out of the pit in a pillar of his pink fire, and is gone in motes. His rings of hands sink with him.
// His colours: his pink and gold (art/mkit.ts FLAME), bone, the dark of his robes. Never cyan.

import { hash } from './kit';
import { FLAME } from './mkit';
/** Where a spot of the floor (tiles) is on the screen, in game pixels. */
export type FloorAt = (x: number, y: number) => readonly [number, number];

/** A light given off (screen game pixels; how wide; how strong). */
export type Spot = (x: number, y: number, r: number, a: number) => void;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const easeOut = (v: number): number => 1 - (1 - clamp01(v)) ** 3;
function dot(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}
/** The dark of the floor's cracks. */
const INK = '#0b0710';
/** White hotter than his gold. */
const WHITE = '#fff6e0';

// =============================================================================================
// HIS LIGHT

/** His circle's size (tiles) and how many runes in it. */
export const CIRCLE = { r: 1.15, runes: 7 } as const;
/** A rune of his (three across, four down): the cult's marks. */
const RUNES: readonly string[] = ['010111010010', '101010101010', '111001010100', '100110101011', '011100110001', '110011100110', '001011101100'];
/** HIS CIRCLE under him at (x, y), the screen's clock `t`: its rings, its runes turning, his light pooled in it. */
export function drawCircle(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number, spot?: Spot): void {
  const was = g.globalAlpha;
  const beat = 0.75 + 0.25 * Math.sin(t * 3.2);
  // (his light pooled: a dither, thicker in the middle)
  for (let i = 0; i < 90; i++) {
    const a = hash(i, 1, 6101) * Math.PI * 2 + t * 0.2;
    const d = Math.sqrt(hash(i, 2, 6101)) * CIRCLE.r * 0.95;
    const [px, py] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
    g.globalAlpha = was * 0.35 * beat * (1 - d / CIRCLE.r);
    dot(g, px, py, FLAME[1], 2, 1);
  }
  // (its two rings: the outer burning, the inner dim)
  for (const [r, col, al] of [[CIRCLE.r, FLAME[2], 0.75], [CIRCLE.r * 0.72, FLAME[1], 0.55]] as const) {
    const n = Math.round(r * 46);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r === CIRCLE.r ? t * 0.35 : -t * 0.5);
      if (hash(i, Math.floor(t * 6), 6102) < 0.12) continue;
      const [px, py] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.globalAlpha = was * al * beat;
      dot(g, px, py, col);
    }
  }
  // (its runes between the rings, turning slowly)
  for (let k = 0; k < CIRCLE.runes; k++) {
    const a = (k / CIRCLE.runes) * Math.PI * 2 + t * 0.35;
    const [rx, ry] = at(x + Math.cos(a) * CIRCLE.r * 0.86, y + Math.sin(a) * CIRCLE.r * 0.86);
    const R = RUNES[k % RUNES.length];
    g.globalAlpha = was * 0.85 * beat;
    for (let j = 0; j < 12; j++) if (R[j] === '1') dot(g, rx - 2 + (j % 3), ry - 2 + Math.floor(j / 3), j % 2 ? FLAME[3] : FLAME[2]);
  }
  g.globalAlpha = was;
  if (spot) {
    const [sx, sy] = at(x, y);
    spot(sx, sy - 14, 64, 0.5 * beat);
  }
}
/** His power rising off him in motes (over the dark), (sx, sy) his floor point on the screen, `tall` how tall he is there (game pixels). */
export function drawPowerMotes(g: CanvasRenderingContext2D, sx: number, sy: number, tall: number, t: number): void {
  const was = g.globalAlpha;
  for (let i = 0; i < 16; i++) {
    const life = (t * (0.4 + 0.3 * hash(i, 1, 6103)) + hash(i, 2, 6103)) % 1;
    const a = hash(i, 3, 6103) * Math.PI * 2;
    const r = 6 + 10 * hash(i, 4, 6103);
    const x = sx + Math.cos(a + life * 2) * r;
    const y = sy - 4 - life * (tall + 14) + Math.sin(a) * r * 0.4;
    g.globalAlpha = was * Math.sin(Math.PI * life) * 0.9;
    dot(g, x, y, i % 4 === 0 ? FLAME[3] : FLAME[2]);
  }
  g.globalAlpha = was;
}

// =============================================================================================
// HIS DEATH

/** Its moments (seconds into his death, his own pictures' FM_DEATH): his light bursting out, his dead's hands, the skull's shriek and his power going up, gone. */
export const FM_END = { burst: [0.08, 0.6] as const, cracks: [0.1, 2.6] as const, hands: [0.2, 0.62] as const, handR: [0.9, 1.5] as const, hands_n: 12, pillar: [2.25, 3.3] as const, long: 3.4 } as const;
/** The burst of his light and the floor cracking out from under him, at (x, y), `t` seconds into his death. */
export function drawDeathFloor(g: CanvasRenderingContext2D, at: FloorAt, x: number, y: number, t: number, spot?: Spot): void {
  if (t < 0 || t > FM_END.long) return;
  const was = g.globalAlpha;
  // (the cracks: out from under him, lit, going dark)
  const [c0, c1] = FM_END.cracks;
  const lit = sm((t - c0) / 0.25) * (1 - sm((t - (c1 - 0.8)) / 0.8));
  if (lit > 0) {
    for (let k = 0; k < 9; k++) {
      let a = (k / 9) * Math.PI * 2 + hash(k, 1, 6111) * 0.5;
      const long = 1.6 + 1.6 * hash(k, 2, 6111);
      const grown = long * easeOut((t - c0) / 0.35);
      let px = x;
      let py = y;
      for (let s = 0; s < grown; s += 0.06) {
        a += (hash(k, Math.floor(s * 6), 6112) - 0.5) * 0.35;
        px += Math.cos(a) * 0.06;
        py += Math.sin(a) * 0.06;
        const [sx, sy] = at(px, py);
        g.globalAlpha = was;
        dot(g, sx, sy, INK, 2, 1);
        g.globalAlpha = was * lit * (1 - (s / long) * 0.6);
        dot(g, sx, sy - 1, s < long * 0.4 ? FLAME[3] : FLAME[2]);
      }
    }
  }
  // (his light bursting out over the floor: a ring rolling out, gone)
  const [b0, b1] = FM_END.burst;
  const k = (t - b0) / (b1 - b0);
  if (k >= 0 && k <= 1) {
    const R = 0.4 + 3.2 * easeOut(k);
    const n = Math.round(R * 60);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      if (hash(i, 3, 6113) < k * 0.7) continue;
      for (const [dr, col] of [[0, WHITE], [-0.12, FLAME[3]], [-0.26, FLAME[2]]] as const) {
        const [sx, sy] = at(x + Math.cos(a) * (R + dr), y + Math.sin(a) * (R + dr));
        g.globalAlpha = was * (1 - k);
        dot(g, sx, sy, col, 2, 1);
      }
    }
    if (spot) {
      const [sx, sy] = at(x, y);
      spot(sx, sy, 60 + 120 * k, 0.9 * (1 - k));
    }
  }
  g.globalAlpha = was;
}
/** Where each of the hands of his dead comes up round him as he dies (tiles from him), and when (seconds into his death). */
export function deathHands(): { dx: number; dy: number; at: number; j: number }[] {
  const out: { dx: number; dy: number; at: number; j: number }[] = [];
  for (let j = 0; j < FM_END.hands_n; j++) {
    const a = (j / FM_END.hands_n) * Math.PI * 2 + hash(j, 1, 6121) * 0.3;
    const r = FM_END.handR[0] + (FM_END.handR[1] - FM_END.handR[0]) * hash(j, 2, 6121);
    out.push({ dx: Math.cos(a) * r, dy: Math.sin(a) * r, at: FM_END.hands[0] + (FM_END.hands[1] - FM_END.hands[0]) * hash(j, 3, 6121), j });
  }
  return out;
}
/** THE SKULL'S SHRIEK AND HIS POWER GOING UP: a pillar of his fire out of the pit at (sx, sy) on the screen, and gone in motes (over the dark). */
export function drawDeathPillar(g: CanvasRenderingContext2D, sx: number, sy: number, t: number, spot?: Spot): void {
  const [p0, p1] = FM_END.pillar;
  if (t < p0 || t > p1 + 0.6) return;
  const u = (t - p0) / (p1 - p0);
  const was = g.globalAlpha;
  const up = easeOut(u / 0.25) * 190;
  const fade = 1 - sm((u - 0.45) / 0.55);
  const wide = 9 * (1 - 0.5 * u);
  // (the pillar: white at its heart, his gold and pink about it, rippling, thinning as it goes)
  if (fade > 0.01) {
    for (let y = 0; y < up; y += 1) {
      const f = y / Math.max(1, up);
      const w = wide * (1 - 0.6 * f) + Math.sin(y * 0.3 - t * 20) * 1.5;
      for (const [k, col] of [[1, FLAME[1]], [0.7, FLAME[2]], [0.45, FLAME[3]], [0.2, WHITE]] as const) {
        if (hash(Math.floor(y / 2), Math.floor(t * 20) + Math.round(k * 10), 6131) < f * 0.5) continue;
        g.globalAlpha = was * fade * (1 - f * 0.5);
        dot(g, sx - w * k + Math.sin(y * 0.11 + t * 6) * 2 * f, sy - y, col, Math.max(1, Math.round(2 * w * k)), 1);
      }
    }
  }
  // (and his power gone up out of it in motes, spiralling, going out)
  for (let i = 0; i < 70; i++) {
    const born = hash(i, 1, 6132) * 0.6;
    const age = u * (p1 - p0) - born;
    if (age < 0 || age > 1.3) continue;
    const a = hash(i, 2, 6132) * Math.PI * 2 + age * 3;
    const r = 4 + age * 34 * hash(i, 3, 6132);
    const y = sy - 20 - age * (110 + 90 * hash(i, 4, 6132));
    g.globalAlpha = was * (1 - age / 1.3);
    dot(g, sx + Math.cos(a) * r, y + Math.sin(a) * r * 0.3, i % 3 === 0 ? WHITE : i % 3 === 1 ? FLAME[3] : FLAME[2], i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
  }
  g.globalAlpha = was;
  if (spot && fade > 0.01) {
    spot(sx, sy - up * 0.5, 90, 0.8 * fade);
    spot(sx, sy, 70, 0.6 * fade);
  }
}
