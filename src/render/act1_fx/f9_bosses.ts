// FLOOR 9'S TWO SIDE BOSSES: what their moves do to the floor and throw up from it, drawn (render/act1_fx/types.ts). Their stand, walk,
// moves, struck and death are their own pictures (art/f9_bosses_art.ts), what follows them in their moves in them too; here, what lies
// where it is (art/f9_bosses_fx.ts): each move's peril (game/act1_rules/f9_bosses.ts) painted live at the floor point where the move
// began, in the frame its picture is shown in (in front or behind, turned over or not: game/act1_rules/stoker.ts FRAMES), afresh at
// PAINT_FPS, its pictures let go once it is done; under what stands (`ground`: the warnings, the ground broken, the mist's clouds) and
// over it (`air`: the bursts, stone and dust flung up, mist bursting). And THE RAGE on the chieftain while it lasts after his war cry:
// its embers rising off him, its light. Behind F9_LAIRS, off.

import { F9_FX_AFTER, F9_FX_CANVAS, chiefFxGlow, chiefFxPaint, wolfFxGlow, wolfFxPaint } from '../../art/f9_bosses_fx';
import type { F9View } from '../../art/f9_bosses_art';
import { CHIEF_MOVES, TILE3, WOLF_MOVES } from '../../art/f9_bosses_moves';
import type { ChiefMove, WolfMove } from '../../art/f9_bosses_moves';
import { WK } from '../../art/f9_bosses_sculpt';
import { FLAME } from '../../art/mkit';
import type { Sprite } from '../../engine/px';
import { CHIEF_FX, WOLF_FX, raging } from '../../game/act1_rules/f9_bosses';
import { FRAMES, inFrame } from '../../game/act1_rules/stoker';
import type { Monster, Peril } from '../../game/state';
import { liveDone, livePicture } from './live';
import type { Act1Fx, Act1FxCtx } from './types';

/** How often what they do to the floor is painted afresh. */
const PAINT_FPS = 15;

const names = new WeakMap<Peril, string>();
let made = 0;
function nameOf(p: Peril): string {
  let n = names.get(p);
  if (!n) names.set(p, (n = `f9b${++made}`));
  return n;
}

/** A picture drawn at (sx, sy), turned over about its anchor where `flip`. */
function drawAt(c: Act1FxCtx, s: Sprite, sx: number, sy: number, flip: boolean): void {
  const g = c.g;
  if (!g) return;
  const x = Math.round(sx);
  const y = Math.round(sy);
  if (!flip) {
    g.drawImage(s.img, x - s.ax, y - s.ay, s.w, s.h);
    return;
  }
  g.save();
  g.translate(x, 0);
  g.scale(-1, 1);
  g.drawImage(s.img, -s.ax, y - s.ay, s.w, s.h);
  g.restore();
}

/** One layer of a move's peril, painted and drawn. */
function layerOf(c: Act1FxCtx, p: Peril, layer: 'ground' | 'air'): void {
  const chief = p.a1!.startsWith(CHIEF_FX);
  const move = p.a1!.slice((chief ? CHIEF_FX : WOLF_FX).length);
  const long = chief ? CHIEF_MOVES[move as ChiefMove]?.long : WOLF_MOVES[move as WolfMove]?.long;
  const key = `${nameOf(p)}:${layer}`;
  if (long === undefined || p.t >= p.dur - 0.02 || p.t >= long + F9_FX_AFTER) {
    liveDone(key);
    return;
  }
  const F = FRAMES[p.a];
  const view: F9View = F.view === 'front' ? 'front' : 'rear';
  // (the hero, for the claws seen in the wolf's cloud where he is: where he is in its frame, its own lengths)
  let hero: { f: number; l: number; struck: number } | undefined;
  if (!chief && move === 'cloud') {
    const h = c.game.hero;
    const r = inFrame(F, p.x, p.y, h.x, h.y);
    hero = { f: (r.fwd * TILE3) / WK, l: (r.left * TILE3) / WK, struck: p.d };
  }
  const C = F9_FX_CANVAS;
  const stamp = `${Math.floor(p.t * PAINT_FPS + 1e-6)}:${p.d}`;
  const s = livePicture(key, C.w, C.h, C.ax, C.ay, stamp, (px) => {
    if (chief) chiefFxPaint(px, layer, move as ChiefMove, p.t, view);
    else wolfFxPaint(px, layer, move as WolfMove, p.t, view, hero);
  });
  if (!s) return;
  const [sx, sy] = c.at(p.x, p.y);
  drawAt(c, s, sx, sy, F.flip);
}

/** THE RAGE on him while it lasts after his war cry (in his war cry itself, his pictures have it): embers rising off him, its light. */
function rageOn(c: Act1FxCtx, m: Monster): void {
  const g = c.g;
  if (!g || !raging(m) || m.dead) return;
  const [sx, sy] = c.at(m.x, m.y);
  const left = Math.min(1, (m.a1?.rage ?? 0) / 1.5);
  for (let i = 0; i < 22; i++) {
    const h1 = Math.sin(i * 127.1 + 31.7) * 43758.5453;
    const r1 = h1 - Math.floor(h1);
    const h2 = Math.sin(i * 311.7 + 74.7) * 43758.5453;
    const r2 = h2 - Math.floor(h2);
    const ph = (c.t * (0.7 + r1 * 0.8) + r2) % 1;
    if (r1 > left) continue;
    const x = sx + (r2 - 0.5) * 40 + Math.sin(c.t * 4 + i) * 1.5;
    const y = sy - 6 - ph * 80;
    g.fillStyle = ph < 0.3 ? FLAME[4] : ph < 0.7 ? FLAME[3] : FLAME[2];
    g.fillRect(Math.round(x), Math.round(y), 1, ph < 0.5 ? 2 : 1);
  }
  c.spot(sx, sy - 40, 46, 0.35 * left);
}

/** The whole screen washed with `color` at `a` (a heavy blow's flash; the rage's red at its edges). */
function wash(c: Act1FxCtx, color: string, a: number, edges = false): void {
  const g = c.g;
  const cv = g?.canvas as HTMLCanvasElement | undefined;
  if (!g || !cv || a <= 0.003) return;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = Math.min(1, a);
  if (edges && typeof g.createRadialGradient === 'function') {
    const w = cv.width;
    const h = cv.height;
    const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.62);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, color);
    g.fillStyle = gr;
  } else g.fillStyle = color;
  g.fillRect(0, 0, cv.width, cv.height);
  g.restore();
}

/** THE MIST rolling in from the screen's edges (the wolf's howl, its cloud): great pale billows drifting along them, `a` of it. */
function mistIn(c: Act1FxCtx, a: number): void {
  const g = c.g;
  const cv = g?.canvas as HTMLCanvasElement | undefined;
  if (!g || !cv || a <= 0.01) return;
  const w = cv.width;
  const h = cv.height;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 18; i++) {
    const side = i % 4;
    const u = ((i * 0.618 + c.t * 0.05 * (1 + (i % 3))) % 1) * (side < 2 ? w : h);
    const r = Math.min(w, h) * (0.16 + 0.1 * ((i * 7) % 5) / 5) * (0.6 + 0.4 * a);
    const x = side === 0 ? u : side === 1 ? u : side === 2 ? -r * 0.2 + r * 0.5 * a : w + r * 0.2 - r * 0.5 * a;
    const y = side === 0 ? -r * 0.2 + r * 0.5 * a : side === 1 ? h + r * 0.2 - r * 0.5 * a : u;
    // (each billow soft all through, thinning to nothing at its edge: never a shape with an edge of its own)
    if (typeof g.createRadialGradient !== 'function') continue;
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 1.3);
    gr.addColorStop(0, i % 2 ? 'rgba(198,194,218,0.55)' : 'rgba(238,236,248,0.5)');
    gr.addColorStop(0.55, i % 2 ? 'rgba(198,194,218,0.25)' : 'rgba(238,236,248,0.22)');
    gr.addColorStop(1, 'rgba(238,236,248,0)');
    g.globalAlpha = a;
    g.fillStyle = gr;
    g.fillRect(x - r * 1.3, y - r * 1.3, r * 2.6, r * 2.6);
  }
  g.restore();
}

/** A heavy blow landing: its light where it lands, and the screen flashed; the wolf's howl and its cloud: the screen darkened, the mist rolling in. */
function blowGlow(c: Act1FxCtx, p: Peril, flashOnly: boolean): void {
  const chief = p.a1!.startsWith(CHIEF_FX);
  const move = p.a1!.slice((chief ? CHIEF_FX : WOLF_FX).length);
  const F = FRAMES[p.a];
  const view = F.view === 'front' ? 'front' : 'rear';
  const gl = chief ? chiefFxGlow(move as ChiefMove, p.t, view) : wolfFxGlow(move as WolfMove, p.t, view);
  if (!gl) return;
  if (flashOnly) {
    const dark = 'dark' in gl ? (gl as { dark: number }).dark : 0;
    if (dark > 0) {
      wash(c, 'rgba(14,10,30,1)', dark * 0.45, true);
      mistIn(c, dark);
    }
    wash(c, chief ? '#fff6e8' : '#f2f0ff', gl.flash);
    return;
  }
  const C = F9_FX_CANVAS;
  const [sx, sy] = c.at(p.x, p.y);
  c.spot(sx + ((gl.x - C.ax) / 2) * (F.flip ? -1 : 1), sy + (gl.y - C.ay) / 2, gl.r / 2, gl.a);
}

const fx = (prefix: string): Act1Fx => ({
  ground(c, m, p) {
    if (m || !p || !p.a1?.startsWith(prefix)) return;
    layerOf(c, p, 'ground');
  },
  air(c, m, p) {
    if (m) {
      if (prefix === CHIEF_FX) rageOn(c, m);
      return;
    }
    if (!p || !p.a1?.startsWith(prefix)) return;
    layerOf(c, p, 'air');
    blowGlow(c, p, false);
  },
  glow(c, m, p) {
    // (THE RAGE: the screen's edges red while it is on him, beating; a heavy blow: the screen flashed white)
    if (m) {
      if (prefix === CHIEF_FX && raging(m) && !m.dead) wash(c, 'rgba(200,24,70,1)', (0.14 + 0.06 * Math.sin(c.t * 9)) * Math.min(1, (m.a1?.rage ?? 0) / 1.5), true);
      return;
    }
    if (p && p.a1?.startsWith(prefix)) blowGlow(c, p, true);
  },
  // (a body as big as these, struck again and again: a flash of white over it, faint, that it is not lost in white)
  flash: 0.18,
});

export const FX_CHIEF: Act1Fx | null = fx(CHIEF_FX);
export const FX_WOLF: Act1Fx | null = fx(WOLF_FX);
