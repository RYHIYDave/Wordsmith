// THE SHADOWS OF THE FOUR ROYALS: their big moves made smaller, the Queen's blink through her hand mirror, their deaths
// (blown apart like smoke) and the four playing cards they leave hanging in the air. A MOCK-UP: NOT IN THE GAME. Nothing
// of the game imports this file (art/royal_shadows.ts says how they are made; `SHADOWS_ON` is off).
//
// Each big move's effect is its boss's own (the very painter), as fog, drawn smaller:
//   THE PRINCESS'S VINE SNARE (art/princess_fx.ts `snarePainted`): a small cage, 0.55 of hers (hers 5 tiles across, this
//     2.75), and short: it holds 1.4 s (hers 6 s) and sinks.
//   THE PRINCE'S MASKS (art/prince_fx.ts `maskPainted`): three masks (his five, the middle three), flown 6 tiles (his 12)
//     at his speed (15 tiles a second), each bursting into fog at its end.
//   THE KING'S CROWN (art/king_fx.ts `crownPainted`): its ring 0.4 of his (his 10 tiles out, this 4), the game carrying
//     him 2.5 tiles in the leap (his 5).
//   THE QUEEN'S LOOKING GLASS, as a blink through her own hand mirror (no wall mirrors): art/royal_shadows.ts `BLINK`.

import { Px, rgba } from '../engine/px';
import { hash } from './kit';
import { TILE3, canvasOf, paintViewOf } from './new_mobs3';
import { snarePainted, SNARE_CANVAS, SNARE_FX } from './princess_fx';
import { MASKS_FX, MASK_CANVAS, flungMask, maskPainted } from './prince_fx';
import { CROWN_FX, FX_CANVAS, crownPainted } from './king_fx';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';
import { BLINK, EYE, EYE_LIT, FOG, ROYALS, bonesAt, pointOn, shadowFrame, toneOf } from './royal_shadows';
import type { Frame, Royal, RoyalId } from './royal_shadows';

const FOG_RGB = FOG.map((c) => rgba(c));
const EYE_RGB = rgba(EYE);
const EYE_LIT_RGB = rgba(EYE_LIT);
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const smooth = (a: number, b: number, t: number): number => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

// =============================================================================================
// AN EFFECT, AS FOG, SMALLER

/** A picture of an effect drawn `k` of its size about its floor point, as fog: each pixel the average of what lies under it (its see-through kept); the pinks kept where they are. */
export function fxSmaller(src: Px, ax: number, ay: number, k: number): Frame {
  const dax = Math.round(ax * k) + 2;
  const day = Math.round(ay * k) + 2;
  const w = Math.ceil(src.w * k) + 4;
  const h = Math.ceil(src.h * k) + 4;
  const px = new Px(w, h);
  const s = src.d;
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      let a = 0;
      let y = 0;
      let pink = 0;
      for (let j = 0; j < 3; j++) {
        const sy = Math.floor(ay + (Y + (j + 0.5) / 3 - day) / k);
        if (sy < 0 || sy >= src.h) continue;
        for (let i = 0; i < 3; i++) {
          const sx = Math.floor(ax + (X + (i + 0.5) / 3 - dax) / k);
          if (sx < 0 || sx >= src.w) continue;
          const si = (sy * src.w + sx) * 4;
          const sa = s[si + 3];
          if (!sa) continue;
          const r = s[si];
          const g = s[si + 1];
          const b = s[si + 2];
          if (r === EYE_LIT_RGB[0] && g === EYE_LIT_RGB[1] && b === EYE_LIT_RGB[2]) pink += sa;
          a += sa;
          y += sa * (0.299 * r + 0.587 * g + 0.114 * b);
        }
      }
      if (a < 9 * 12) continue;
      const di = (Y * w + X) * 4;
      px.d.set(pink * 2 > a ? EYE_LIT_RGB : FOG_RGB[toneOf(y / a)], di);
      px.d[di + 3] = Math.min(255, Math.round(a / 9));
    }
  }
  return { px, ax: dax, ay: day, lights: [] };
}

/** THE PRINCESS'S SNARE, small and short (`SHADOW_SNARE`): `t` seconds after her blow lands, round where you stand. */
export const SHADOW_SNARE = { k: 0.55, hold: 1.4, long: 2.0 } as const;
export function snareFx(t: number, view: GameView): Frame {
  const ft = t < SHADOW_SNARE.hold ? t : SNARE_FX.sink[0] + (t - SHADOW_SNARE.hold);
  if (t < 0 || t > SHADOW_SNARE.long) return { px: new Px(1, 1), ax: 0, ay: 0, lights: [] };
  return fxSmaller(snarePainted(ft, view).px, SNARE_CANVAS.ax, SNARE_CANVAS.ay, SHADOW_SNARE.k);
}

/** THE KING'S CROWN, its ring small (`SHADOW_CROWN`): `t` seconds after he lands, round the floor point under him. */
export const SHADOW_CROWN = { k: 0.4, carry: 2.5 } as const;
export function crownFx(t: number, view: GameView): Frame {
  if (t < 0 || t > CROWN_FX.long) return { px: new Px(1, 1), ax: 0, ay: 0, lights: [] };
  return fxSmaller(crownPainted(t, view).px, FX_CANVAS.ax, FX_CANVAS.ay, SHADOW_CROWN.k);
}

/** THE PRINCE'S MASKS, three and short (`SHADOW_MASKS`): `t` seconds after they leave his hand, round the floor point under him. */
export const SHADOW_MASKS = { which: [1, 2, 3] as const, reach: 6, burst: 0.3 } as const;
export const MASKS_SHADOW_FLIGHT = SHADOW_MASKS.reach / MASKS_FX.speed;
export const MASKS_CANVAS = { w: 420, h: 300, ax: 210, ay: 190 } as const;
const MASK_CACHE = new Map<string, Frame>();
export function masksFx(t: number, view: GameView): Frame {
  const r = ROYALS.prince;
  const can = MASKS_CANVAS;
  const px = new Px(can.w, can.h);
  const out: Frame = { px, ax: can.ax, ay: can.ay, lights: [] };
  if (t < 0 || t > MASKS_SHADOW_FLIGHT + SHADOW_MASKS.burst) return out;
  const st = stage(paintViewOf(r.mob, view), can.ax, can.ay, can);
  const at = (p: V3): readonly [number, number] => st.at([p[0] * r.k, p[1] * r.k, p[2] * r.k]);
  const dot = (x: number, y: number, tone: number, a: number): void => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 0 || Y < 0 || X >= can.w || Y >= can.h) return;
    const di = (Y * can.w + X) * 4;
    px.d.set(FOG_RGB[tone], di);
    px.d[di + 3] = Math.max(px.d[di + 3], Math.round(255 * a));
  };
  const ft = Math.min(t, MASKS_SHADOW_FLIGHT);
  for (const i of SHADOW_MASKS.which) {
    // (his flight's way and height, flown half as far)
    const m = flungMask(i, ft);
    const d = MASKS_FX.speed * TILE3 * ft;
    const p: V3 = [10 + m.way[0] * d, m.way[1] * d, m.at[2]];
    if (t <= MASKS_SHADOW_FLIGHT) {
      // its smear: fog dots where it has just been
      for (let s = 1; s <= 10; s++) {
        const q: V3 = [p[0] - m.way[0] * s * 3, p[1] - m.way[1] * s * 3, p[2] + (s % 3) * 2 - 2];
        if (q[0] < 10) break;
        const [x, y] = at(q);
        dot(x, y, s < 4 ? 9 : s < 7 ? 7 : 5, 0.8 - s * 0.06);
      }
      const key = `${view}:${Math.round(m.spin * 12) % 75}`;
      let f = MASK_CACHE.get(key);
      if (!f) {
        f = fxSmaller(maskPainted(m.spin, view, 14).px, MASK_CANVAS.ax, MASK_CANVAS.ay, r.k);
        MASK_CACHE.set(key, f);
      }
      const [x, y] = at([p[0], p[1], p[2] - 14]);
      layOn(px, f, x, y);
    } else {
      // its end: a puff of fog, spreading and thinning
      const u = (t - MASKS_SHADOW_FLIGHT) / SHADOW_MASKS.burst;
      for (let j = 0; j < 26; j++) {
        if (hash(i, j, 9101) < u * 0.8) continue;
        const a = hash(i, j, 9102) * Math.PI * 2;
        const rr = 3 + 20 * u * (0.4 + hash(i, j, 9103));
        const [x, y] = at([p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr, Math.max(1, p[2] + 10 * u * (hash(i, j, 9104) - 0.2))]);
        dot(x, y, j % 3 === 0 ? 9 : 7, 0.85 * (1 - u));
      }
    }
  }
  return out;
}

/** Lays one picture on another, its floor point at (x, y), through its see-through (no colours mixed). */
export function layOn(dst: Px, f: { px: Px; ax: number; ay: number }, x: number, y: number, alpha = 1): void {
  const x0 = Math.round(x - f.ax);
  const y0 = Math.round(y - f.ay);
  const s = f.px.d;
  const d = dst.d;
  for (let j = 0; j < f.px.h; j++) {
    const Y = y0 + j;
    if (Y < 0 || Y >= dst.h) continue;
    for (let i = 0; i < f.px.w; i++) {
      const X = x0 + i;
      if (X < 0 || X >= dst.w) continue;
      const si = (j * f.px.w + i) * 4;
      const a = (s[si + 3] / 255) * alpha;
      if (a <= 0) continue;
      const di = (Y * dst.w + X) * 4;
      // (no colours mixed: the stronger one's, as the style's whole pixels are; the see-through added)
      const da = d[di + 3] / 255;
      if (a >= da) d.set(s.subarray(si, si + 3), di);
      d[di + 3] = Math.round((a + da * (1 - a)) * 255);
    }
  }
}

// =============================================================================================
// THE QUEEN'S BLINK

/** Her hand mirror: an oval glass in a fog frame on a short handle, `s` of its size (0 to 1), its glass flashing by `flash` (0 to 1), her eyes in it if `eyes`. */
function handMirror(px: Px, x: number, y: number, s: number, flash: number, eyes: boolean, alpha = 1): void {
  if (s <= 0.05) return;
  const rx = 4 * s;
  const ry = 5.4 * s;
  const set = (X: number, Y: number, c: readonly number[], a = 1): void => {
    if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) return;
    const di = (Y * px.w + X) * 4;
    px.d.set(c.slice(0, 3), di);
    px.d[di + 3] = Math.round(255 * a * alpha);
  };
  // the handle, down into her hand
  for (let j = 1; j <= Math.round(4 * s); j++) set(Math.round(x), Math.round(y + ry + j), FOG_RGB[3]);
  for (let Y = Math.floor(y - ry - 1); Y <= Math.ceil(y + ry + 1); Y++) {
    for (let X = Math.floor(x - rx - 1); X <= Math.ceil(x + rx + 1); X++) {
      const q = ((X + 0.5 - x) / (rx + 1)) ** 2 + ((Y + 0.5 - y) / (ry + 1)) ** 2;
      if (q > 1) continue;
      const g = ((X + 0.5 - x) / rx) ** 2 + ((Y + 0.5 - y) / ry) ** 2;
      if (g > 1) set(X, Y, FOG_RGB[3]);
      else {
        // the glass: pale, a glint across it on the slant, brighter as it flashes
        const glint = Math.abs((X - x) + (Y - y) * 0.7 + 2 - 4 * flash) < 1.0;
        set(X, Y, FOG_RGB[glint || flash > 0.6 ? 10 : flash > 0.2 ? 9 : 8]);
      }
    }
  }
  if (eyes) {
    set(Math.round(x - 1), Math.round(y - 0.5), EYE_LIT_RGB);
    set(Math.round(x + 1), Math.round(y - 0.5), EYE_RGB);
  }
}
/** A figure squeezed toward a point (x, y) of its frame, `s` of its size (its smear: what it was a moment ago, faint). */
function squeezed(f: Frame, x: number, y: number, s: number, ghost: number | null): Px {
  const out = new Px(f.px.w, f.px.h);
  const put = (k: number, a: number): void => {
    for (let Y = 0; Y < out.h; Y++) {
      for (let X = 0; X < out.w; X++) {
        const sx = Math.floor(x + (X + 0.5 - x) / k);
        const sy = Math.floor(y + (Y + 0.5 - y) / k);
        if (sx < 0 || sy < 0 || sx >= f.px.w || sy >= f.px.h) continue;
        const si = (sy * f.px.w + sx) * 4;
        if (!f.px.d[si + 3]) continue;
        const di = (Y * out.w + X) * 4;
        if (a < 1 && out.d[di + 3]) continue;
        out.d.set(f.px.d.subarray(si, si + 3), di);
        out.d[di + 3] = Math.round(f.px.d[si + 3] * a);
      }
    }
  };
  if (ghost !== null) put(ghost, 0.35);
  // (the figure over its ghost)
  const g = new Px(out.w, out.h);
  g.d.set(out.d);
  out.d.fill(0);
  put(s, 1);
  for (let i = 0; i < out.d.length; i += 4) if (!out.d[i + 3] && g.d[i + 3]) out.d.set(g.d.subarray(i, i + 4), i);
  return out;
}
/** ONE FRAME OF THE QUEEN'S BLINK: `into` her hand mirror where she is, or `out` of it where the game puts her. */
export function blinkFrame(phase: 'into' | 'out', t: number, view: GameView): Frame {
  const r = ROYALS.queen;
  const B = BLINK;
  if (phase === 'into') {
    const rt = Math.min(B.lift, t * 1.7);
    const body = shadowFrame(r, 'reflect', rt, view);
    const h = bonesAt(r, 'reflect', rt).handL;
    const [mx, my] = pointOn(r, view, [h[0], h[1], h[2] + 5], body);
    const flash = t >= B.warnIn[0] && t < B.strikeIn[0] ? 0.5 + 0.5 * Math.sin((t - B.warnIn[0]) * 40) : 0;
    const grow = smooth(B.form[0], B.form[1], t);
    let px: Px;
    if (t <= B.strikeIn[0] + 1e-6) px = body.px;
    else if (t <= B.strikeIn[1] + 1e-6 + 1 / 30) {
      // the fold, in two frames, its smear the frame before
      const first = t <= (B.strikeIn[0] + B.strikeIn[1]) / 2 + 1e-6;
      px = t > B.strikeIn[1] + 1e-6 ? squeezed(body, mx, my, 0.04, 0.12) : squeezed(body, mx, my, first ? 0.45 : 0.12, first ? 1 : 0.45);
    } else px = new Px(body.px.w, body.px.h);
    const shrink = 1 - smooth(B.gone[0], B.gone[1], t);
    handMirror(px, mx, my, grow * shrink, flash || (t > B.strikeIn[0] && t < B.gone[0] ? 1 : 0), false);
    if (t > B.gone[0]) puff(px, mx, my, (t - B.gone[0]) / (B.gone[1] - B.gone[0]), 9201);
    return { px, ax: body.ax, ay: body.ay, lights: [] };
  }
  const body = shadowFrame(r, 'stand', Math.max(0, t - B.strikeOut[1]), view);
  const h = bonesAt(r, 'stand', 0).handL;
  const [mx, my] = pointOn(r, view, [h[0] + 4, h[1], h[2] + 12], body);
  const grow = smooth(B.formOut[0], B.formOut[1], t);
  let px: Px;
  if (t <= B.strikeOut[0] + 1e-6) px = new Px(body.px.w, body.px.h);
  else if (t <= B.strikeOut[1] + 1e-6) px = squeezed(body, mx, my, t <= (B.strikeOut[0] + B.strikeOut[1]) / 2 + 1e-6 ? 0.3 : 0.75, t <= (B.strikeOut[0] + B.strikeOut[1]) / 2 + 1e-6 ? null : 0.3);
  else if (t <= B.strikeOut[1] + 1 / 30 + 1e-6) px = squeezed(body, mx, my, 1, 0.75);
  else px = body.px;
  const fade = 1 - smooth(B.fadeOut[0], B.fadeOut[1], t);
  handMirror(px, mx, my, grow, t < B.strikeOut[0] ? 0.3 : 0, t >= B.eyesOut && t <= B.strikeOut[1], fade);
  return { px, ax: body.ax, ay: body.ay, lights: [] };
}
/** A puff of fog motes from a point, `u` of the way through (0 to 1). */
function puff(px: Px, x: number, y: number, u: number, seed: number): void {
  for (let j = 0; j < 18; j++) {
    if (hash(j, 1, seed) < u * 0.7) continue;
    const a = hash(j, 2, seed) * Math.PI * 2;
    const rr = 2 + 12 * u * (0.4 + hash(j, 3, seed));
    const X = Math.round(x + Math.cos(a) * rr);
    const Y = Math.round(y + Math.sin(a) * rr * 0.7 - 6 * u);
    if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
    const di = (Y * px.w + X) * 4;
    px.d.set(FOG_RGB[j % 2 ? 9 : 7], di);
    px.d[di + 3] = Math.round(220 * (1 - u));
  }
}

// =============================================================================================
// THE CARDS

/** A PLAYING CARD (picture pixels): bone white, a fog border, the family's swan crest in two corners, the royal's own mark twice, head to foot as a court card's is. */
export const CARD = { w: 27, h: 41 } as const;
const INK: Readonly<Record<string, number>> = { k: 2, d: 4, m: 6, l: 8, w: 10 };
/** Each royal's mark, 13 by 9, its own: the Princess's crown of nettles, the Prince's smiling mask, the Queen's crown of glass spikes, the King's crown of fleurons over his great sword. */
export const MARKS: Readonly<Record<RoyalId, readonly string[]>> = {
  princess: [
    '..k...k...k..',
    '.kmk.kmk.kmk.',
    'kmlmkmlmkmlmk',
    '.kmmkmlmkmmk.',
    '..kmmmmmmmk..',
    '...kmmmmmk...',
    '..kkkkkkkkk..',
    '..klklklklk..',
    '..kkkkkkkkk..',
  ],
  prince: [
    '...kkkkkkk...',
    '.kklllllllkk.',
    'klkkklllkkklk',
    'klllllmlllllk',
    'klllllmlllllk',
    'klklllllllklk',
    '.kllkkkkkllk.',
    '..klllllllk..',
    '...kkkkkkk...',
  ],
  queen: [
    '......k......',
    '......k......',
    '..k..klk..k..',
    '.klk.klk.klk.',
    '.klkkklkkklk.',
    'kklllllllllkk',
    'kmdmdmdmdmdmk',
    'kkkkkkkkkkkkk',
    '.............',
  ],
  king: [
    '..k...k...k..',
    '.klk.klk.klk.',
    '..k..kmk..k..',
    '.kmk.kmk.kmk.',
    '.kmmkmmmkmmk.',
    '.kmmmmmmmmmk.',
    '.kdkdkdkdkdk.',
    '.kmmmmmmmmmk.',
    '.kkkkkkkkkkk.',
  ],
};
/** The family's crest, the royal swan (its wings raised, its neck curved), drawn small: its corners' mark. (The guard's and the King's `royalSwan` is too fine to hold at this size.) */
export const SWAN: readonly string[] = [
  '.##..#.',
  '#.#.##.',
  '..#.###',
  '..#####',
  '.######',
  '..####.',
];
const CARDS = new Map<RoyalId, Px>();
export function cardPx(id: RoyalId): Px {
  let px = CARDS.get(id);
  if (px) return px;
  px = new Px(CARD.w, CARD.h);
  const { w, h } = CARD;
  const set = (x: number, y: number, tone: number): void => {
    px!.d.set(FOG_RGB[tone], (y * w + x) * 4);
    px!.d[(y * w + x) * 4 + 3] = 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const corner = (x === 0 || x === w - 1) && (y === 0 || y === h - 1);
      if (corner) continue;
      const rim = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      set(x, y, rim ? 3 : 10);
    }
  }
  // a fine line across its middle
  for (let x = 4; x <= w - 5; x++) set(x, Math.floor(h / 2), 8);
  // the mark, head to foot
  const mark = MARKS[id];
  const mx = Math.floor((w - 13) / 2);
  const my = Math.floor(h / 2) - 2 - mark.length;
  mark.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === '.') return;
    set(mx + i, my + j, INK[c]);
    set(w - 1 - (mx + i), h - 1 - (my + j), INK[c]);
  }));
  // the swan crest, top left and bottom right
  SWAN.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === '.') return;
    set(2 + i, 2 + j, 4);
    set(w - 3 - i, h - 3 - j, 4);
  }));
  CARDS.set(id, px);
  return px;
}

// =============================================================================================
// THE DEATH: BLOWN APART LIKE SMOKE; ITS CARD HANGS IN THE AIR A MOMENT AND FADES

/** Its death (seconds): struck (to `struck`), blown apart (`smoke`), its card turning to face you (`card`), hanging, and fading (`fade`). */
export const DEATH = { long: 2.4, struck: 0.12, smoke: [0.12, 1.25] as const, card: [0.3, 0.45] as const, fade: [1.7, 2.4] as const } as const;
const MARGIN = { x: 60, top: 70, bottom: 10 } as const;
const STRUCK = new Map<string, Frame>();
/** ONE FRAME OF ITS DEATH, `t` seconds in. */
export function deathFrame(r: Royal, t: number, view: GameView): Frame {
  const key = `${r.id}:${view}`;
  let base = STRUCK.get(key);
  if (!base) STRUCK.set(key, (base = shadowFrame(r, 'reel', DEATH.struck, view, false)));
  const W = base.px.w + 2 * MARGIN.x;
  const H = base.px.h + MARGIN.top + MARGIN.bottom;
  const px = new Px(W, H);
  const ax = base.ax + MARGIN.x;
  const ay = base.ay + MARGIN.top;
  const out: Frame = { px, ax, ay, lights: [] };
  if (t < DEATH.struck) {
    layOn(px, shadowFrame(r, 'reel', t, view), ax, ay);
    return out;
  }
  // its height (for where its middle and its chest are)
  const b = base.px;
  let top = b.h;
  for (let i = 3; i < b.d.length; i += 4) if (b.d[i] === 255) { top = Math.floor(i / 4 / b.w); break; }
  const cx = base.ax;
  const cy = (top + base.ay) / 2;
  const u = clamp01((t - DEATH.smoke[0]) / (DEATH.smoke[1] - DEATH.smoke[0]));
  if (u < 1) {
    for (let y = 0; y < b.h; y++) {
      for (let x = 0; x < b.w; x++) {
        const si = (y * b.w + x) * 4;
        if (b.d[si + 3] < 255) continue;
        // each speck goes in its own time, the outside first, rising, spreading and curling, paling, thinning
        const out = Math.hypot(x - cx, (y - cy) * 0.7) / (b.h * 0.5);
        const late = 0.35 * hash(x, y, 9301) + 0.2 * (1 - Math.min(1, out));
        const v = clamp01((u - late) / (1 - late) * 1.25);
        if (v >= 1) continue;
        const ease = v * (2 - v);
        const sw = Math.sin(y * 0.3 + v * 6 + hash(x, y, 9302) * 6) * 5 * ease;
        const X = Math.round(x + MARGIN.x + (x - cx) * 0.9 * ease + sw);
        const Y = Math.round(y + MARGIN.top + (y - cy) * 0.35 * ease - 40 * ease * (0.6 + hash(x, y, 9303)));
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const pink = b.d[si] === EYE_RGB[0] && b.d[si + 1] === EYE_RGB[1] || b.d[si] === EYE_LIT_RGB[0] && b.d[si + 1] === EYE_LIT_RGB[1];
        const t0 = toneOf(0.299 * b.d[si] + 0.587 * b.d[si + 1] + 0.114 * b.d[si + 2]);
        const di = (Y * W + X) * 4;
        px.d.set(pink && v < 0.15 ? b.d.subarray(si, si + 3) : FOG_RGB[Math.round(t0 + (7 - t0) * Math.min(1, v * 2))], di);
        px.d[di + 3] = Math.max(px.d[di + 3], Math.round(255 * (1 - v) ** 1.2));
      }
    }
  }
  // its card, at its chest, turning to face you, hanging, rising a little, fading
  if (t >= DEATH.card[0]) {
    const turn = smooth(DEATH.card[0], DEATH.card[1], t);
    const fade = 1 - smooth(DEATH.fade[0], DEATH.fade[1], t);
    const card = cardPx(r.id);
    const sx = Math.max(0.08, turn);
    const ccx = ax;
    const ccy = MARGIN.top + top + (base.ay - top) * 0.38 - 6 * clamp01((t - DEATH.card[0]) / (DEATH.long - DEATH.card[0]));
    const half = (CARD.w * sx) / 2;
    for (let j = 0; j < CARD.h; j++) {
      for (let i = 0; i < Math.round(CARD.w * sx); i++) {
        const si = (j * CARD.w + Math.min(CARD.w - 1, Math.floor(i / sx))) * 4;
        if (!card.d[si + 3]) continue;
        const X = Math.round(ccx - half + i);
        const Y = Math.round(ccy - CARD.h / 2 + j);
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const di = (Y * W + X) * 4;
        // (dithered as it fades: whole pixels going, as the style's are)
        if (hash(i, j, 9304) > fade) continue;
        px.d.set(card.d.subarray(si, si + 3), di);
        px.d[di + 3] = 255;
      }
    }
  }
  return out;
}
/** The canvas a shadow's death is painted on (its floor point on it): its struck frame's, with room round it for the smoke and its card. */
export function deathCanvasOf(r: Royal): { w: number; h: number } {
  const c = canvasOf(r.mob);
  return { w: Math.ceil(c.w * r.k) + 4 + 2 * MARGIN.x, h: Math.ceil(c.h * r.k) + 4 + MARGIN.top + MARGIN.bottom };
}
