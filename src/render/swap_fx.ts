// THE MAGE'S AND THE RANGER'S MOVES TO SWAP, THEIR LOOKS IN THE GAME (game/swap_moves.ts, behind SWAP_MOVES; his words in
// docs/mockups/swap_moves/README.md). Drawn at the game's grain (a tile 32 by 16 of its pixels), in the spell tones her magic
// has always been drawn in (art/spells.ts SPELL_TONES: violet with no word's element, else the element's own), his in rope and
// the friend's cyan. Hers have no element of their own (his words: “i dont want spear to be ice spear, i want it to be spear,
// same with the others”): they take her words'. To be shown him in play before any goes live.
//   BALL     A COMET (his pick): a small dense head, white at its heart, a long ragged tail of her colour streaming off it, sparks
//            shed behind; where it strikes, a SPLASH: a flash, a ring of its light across the floor, drops flung up and falling;
//   SPEAR    A CRYSTAL LANCE (his pick): a long cut crystal of her magic, its lit face pale and the other deep, a white ridge down it
//            and a glint running along it, shards of it trailing behind;
//   AURA     a ring on the floor round her, turning, edged in cyan, faintly filled; FIRE embers rising in it, LIGHTNING crackle
//            running round its edge, FROST motes drifting down and frost stars on its edge (her shield is Guarding's own);
//   SNARE    a loop of rope lying open, its twist, its knot and peg, a glint of cyan while it is set;
//   SNIPE    while he draws, his aim along the floor, the brighter and the fuller the longer he holds, a glint at his bow at full;
//            the arrow loosed trails a streak of white;
//   RALLY    a ring of cyan going out from him as he calls; while it lasts, cyan motes rising off his companions.
import { CYAN } from '../art/kit';
import { SPELL_TONES } from '../art/spells';
import type { Game } from '../game/game';
import type { Element } from '../game/types';
import type { Cam } from './fx';
import { wx, wy } from './fx';

type G = CanvasRenderingContext2D;

const tonesOf = (el: Element | string): readonly string[] => SPELL_TONES[el as Element] ?? SPELL_TONES.phys;
const C = [CYAN[0], CYAN[2], CYAN[3], '#ffffff'] as const;
const ROPE = ['#4a2c1a', '#7e4f2c', '#b67e4a'] as const;

function dot(g: G, x: number, y: number, c: string, w = 1, h = 1): void {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** A filled disc of `r` game pixels, rows of pixels. */
function disc(g: G, cx: number, cy: number, r: number, c: string): void {
  g.fillStyle = c;
  const n = Math.ceil(r);
  for (let dy = -n; dy <= n; dy++) {
    const s = r * r - dy * dy;
    if (s < 0) continue;
    const w = Math.floor(Math.sqrt(s));
    g.fillRect(Math.round(cx) - w, Math.round(cy) + dy, 2 * w + 1, 1);
  }
}

/** A soft glow: discs added onto what is under them, fading outward. */
function glow(g: G, cx: number, cy: number, r: number, c: string, strength = 0.22): void {
  const was = g.globalCompositeOperation;
  g.globalCompositeOperation = 'lighter';
  for (const [k, a] of [[1, 0.35], [0.7, 0.6], [0.45, 1]] as const) {
    g.globalAlpha = strength * a;
    disc(g, cx, cy, r * k, c);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = was;
}

/** A ring on the floor of `r` tiles about (x, y), every `gap`th pixel of it, turned by `turn`. */
function floorRing(g: G, cam: Cam, x: number, y: number, r: number, c: string, gap: number, turn: number, lift = 0): void {
  const n = Math.max(24, Math.round(r * 64));
  for (let k = 0; k < n; k++) {
    if (gap > 1 && k % gap !== 0) continue;
    const a = (k / n) * Math.PI * 2 + turn;
    dot(g, wx(cam, x + Math.cos(a) * r, y + Math.sin(a) * r), wy(cam, x + Math.cos(a) * r, y + Math.sin(a) * r) - lift, c);
  }
}

/** The screen's way for a way in the world, made one long. */
function screenWay(vx: number, vy: number): [number, number] {
  const sx = (vx - vy) * 16;
  const sy = (vx + vy) * 8;
  const l = Math.hypot(sx, sy) || 1;
  return [sx / l, sy / l];
}

/**
 * (THE MAGE'S BALL, A COMET: his pick, “Comet (Recommended)”) In flight at (x, y), going (vx, vy): a small dense head, white at
 * its heart, and a long ragged tail of her colour streaming off it, its strands of different lengths and flickering, sparks shed
 * off it falling behind.
 */
export function drawBall(g: G, cam: Cam, x: number, y: number, vx: number, vy: number, el: Element, t: number, flown?: number): void {
  const T = tonesOf(el);
  const LIFT = 13;
  const [ux, uy] = screenWay(vx, vy);
  const px = -uy;
  const py = ux;
  const sx = wx(cam, x, y);
  const sy = wy(cam, x, y);
  const hx = sx;
  const hy = sy - LIFT;
  // its shadow on the floor, long as the comet is
  g.globalAlpha = 0.35;
  g.fillStyle = '#000000';
  for (let i = 0; i < 16; i += 2) g.fillRect(Math.round(sx - ux * i) - 2, Math.round(sy - uy * i * 0.5), 5, 1);
  g.globalAlpha = 1;
  // the tail: nine strands off the back of the head, each its own length, flickering, fanned a little and narrowing to nothing
  const STRANDS = [-3, -2, -1.5, -1, 0, 1, 1.5, 2, 3];
  for (let s = 0; s < STRANDS.length; s++) {
    const off = STRANDS[s];
    // (short as it leaves her hand, streaming out to its whole length in its first tiles)
    const long = (20 + 22 * (1 - Math.abs(off) / 3.4) + 7 * Math.sin(t * 23 + s * 2.1)) * Math.min(1, 0.25 + (flown ?? 9) * 0.6);
    for (let i = 3; i < long; i++) {
      const k = i / long;
      const fan = off * (1 + k * 1.6) + Math.sin(t * 31 + i * 0.45 + s) * k * 1.4;
      const c = k < 0.22 ? T[3] : k < 0.5 ? T[2] : k < 0.78 ? T[1] : T[0];
      g.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) * 1.8;
      dot(g, hx - ux * i + px * fan, hy - uy * i + py * fan, c);
    }
  }
  g.globalAlpha = 1;
  // sparks shed off the tail, falling behind it
  for (let k = 0; k < 6; k++) {
    const ph = (t * 3.2 + k * 0.173) % 1;
    const back = 10 + ph * 34;
    const side = Math.sin(k * 7.3 + Math.floor(t * 3.2 + k * 0.173) * 3.1) * 6;
    g.globalAlpha = 1 - ph;
    dot(g, hx - ux * back + px * side, hy - uy * back + py * side + ph * 6, ph < 0.4 ? T[3] : T[2], 2, 1);
  }
  g.globalAlpha = 1;
  // the head: its glow, dark all round, its body, its white heart, a streak of light off its front
  glow(g, hx, hy, 15, T[2], 0.34);
  disc(g, hx, hy, 4.4, T[1]);
  disc(g, hx + ux * 0.6, hy + uy * 0.6, 3.4, T[2]);
  disc(g, hx + ux * 0.8, hy + uy * 0.8, 2.2, T[3]);
  dot(g, hx + ux * 1.2 - 0.5, hy + uy * 1.2 - 0.5, '#ffffff', 2, 2);
  glow(g, hx, hy, 6, T[3], 0.35);
}

/** (THE COMET'S SPLASH, where it bursts: game/game.ts ballBurst's event, `comet`) Kept here until each has played out. */
const SPLASHES: { x: number; y: number; el: Element; r: number; at: number | null }[] = [];
export function cometSplash(x: number, y: number, el: Element, r: number): void {
  if (SPLASHES.length < 12) SPLASHES.push({ x, y, el, r, at: null });
}
/** The splashes: a flash, a ring of her light thrown out across the floor as far as its burst reaches, and drops of it flung up and falling. */
export function drawSplashes(g: G, cam: Cam, t: number): void {
  const DUR = 0.55;
  for (let n = SPLASHES.length - 1; n >= 0; n--) {
    const s = SPLASHES[n];
    if (s.at === null || t < s.at) s.at = t;
    const age = t - s.at;
    if (age > DUR) {
      SPLASHES.splice(n, 1);
      continue;
    }
    const k = age / DUR;
    const T = tonesOf(s.el);
    const sx = wx(cam, s.x, s.y);
    const sy = wy(cam, s.x, s.y);
    // the flash
    if (k < 0.3) {
      glow(g, sx, sy - 10, 22 * (1 - k), T[3], 0.5 * (1 - k / 0.3));
      disc(g, sx, sy - 10, 7 * (1 - k / 0.3), '#ffffff');
    }
    // the ring across the floor, broken up as it goes
    g.globalAlpha = 1 - k;
    floorRing(g, cam, s.x, s.y, s.r * (0.25 + 0.75 * Math.sqrt(k)), k < 0.4 ? T[3] : T[2], k < 0.5 ? 1 : 2, k * 2);
    floorRing(g, cam, s.x, s.y, s.r * (0.15 + 0.6 * Math.sqrt(k)), T[1], 3, -k * 3);
    // the drops: thrown up and out, falling, each a short streak
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.4;
      const out = s.r * (0.4 + 0.5 * ((i * 37) % 10) / 10) * Math.min(1, k * 1.6);
      const up = 26 * (0.6 + ((i * 53) % 7) / 10) * (k * 1.6 - k * k * 2.2);
      const dx = wx(cam, s.x + Math.cos(a) * out, s.y + Math.sin(a) * out);
      const dy = wy(cam, s.x + Math.cos(a) * out, s.y + Math.sin(a) * out) - Math.max(0, up);
      dot(g, dx, dy, i % 3 === 0 ? T[3] : T[2], 2, 2);
      dot(g, dx, dy + 2, T[1], 1, 2);
    }
    g.globalAlpha = 1;
  }
}

/**
 * (THE MAGE'S SPEAR, A CRYSTAL LANCE: his pick, “Crystal lance (Recommended)”) In flight at (x, y), going (vx, vy), its point
 * there: a long cut crystal of her magic, pointed at both ends and widest a third of the way back, its face toward the light
 * pale, the other deep, a ridge of white down its length and a cut across it where it is widest, its edges lit, a glint running
 * down it; shards of it trailing behind, turning as they go.
 */
export function drawSpear(g: G, cam: Cam, x: number, y: number, vx: number, vy: number, el: Element, t = 0, flown?: number): void {
  const T = tonesOf(el);
  const LIFT = 12;
  const [ux, uy] = screenWay(vx, vy);
  const px = -uy;
  const py = ux;
  const tx = wx(cam, x, y);
  const ty = wy(cam, x, y) - LIFT;
  // (as it leaves her crystal it is short, and grows to its whole length in its first tiles: it does not reach back through her)
  const LONG = Math.round(Math.min(44, 12 + (flown ?? 9) * 26));
  const WIDE = Math.round(LONG * 0.3);
  const half = (i: number): number => (i < WIDE ? (i * 5.6) / WIDE : 5.6 * (1 - (i - WIDE) / (LONG - WIDE)));
  // which side of it faces the light (up the screen, else to the left)
  const lit = (k: number): boolean => (Math.abs(py) > 0.2 ? py * k < 0 : px * k < 0);
  // its shadow on the floor
  g.globalAlpha = 0.3;
  for (let i = 0; i < LONG; i += 2) dot(g, tx - ux * i, ty + LIFT - uy * i * 0.5, '#000000', 2, 1);
  g.globalAlpha = 1;
  // the shards trailing it, turning as they fall behind
  for (let s = 0; s < 5; s++) {
    const ph = (t * 2.6 + s * 0.2) % 1;
    const back = LONG + 2 + ph * 30;
    const side = Math.sin(s * 5.1 + Math.floor(t * 2.6 + s * 0.2) * 2.3) * 4;
    const cx = tx - ux * back + px * side;
    const cy = ty - uy * back + py * side + ph * 4;
    g.globalAlpha = 1 - ph;
    const spin = Math.floor((t * 12 + s) % 2);
    dot(g, cx, cy - 1, T[3]);
    dot(g, cx - 1 + spin, cy, T[2], 2 - spin, 1);
    dot(g, cx, cy + 1, T[1]);
  }
  g.globalAlpha = 1;
  // its glow along its length
  for (let i = 0; i < LONG; i += 7) glow(g, tx - ux * i, ty - uy * i, 8, T[2], 0.15);
  // its dark edge all round, as everything in the game has, so that it stands off the floor
  for (let i = -1; i <= LONG + 1; i++) {
    const W = Math.round(half(Math.max(0, Math.min(LONG, i)))) + 1;
    for (let k = -W; k <= W; k++) dot(g, tx - ux * i + px * k, ty - uy * i + py * k, '#140a24');
  }
  // the crystal: row by row from its point back
  const glint = (t * 70) % (LONG + 20);
  for (let i = 0; i <= LONG; i++) {
    const w = half(i);
    const W = Math.round(w);
    for (let k = -W; k <= W; k++) {
      let c: string;
      if (W > 0 && Math.abs(k) === W) c = lit(k) ? T[2] : T[0];
      else if (k === 0) c = Math.abs(i - glint) < 3 ? '#ffffff' : T[3];
      else if (Math.abs(i - WIDE) < 1) c = T[3];
      else c = lit(k) ? (Math.abs(k) === 1 ? T[3] : T[2]) : Math.abs(k) === 1 ? T[1] : T[0];
      dot(g, tx - ux * i + px * k, ty - uy * i + py * k, c);
    }
  }
  // the point burning white
  glow(g, tx, ty, 6, T[3], 0.32);
  dot(g, tx - 0.5, ty - 0.5, '#ffffff', 2, 2);
}

/** (THE MAGE'S AURA) On the floor round her while it is on: its kind, its reach, how long it has been on. */
export function drawAura(g: G, cam: Cam, game: Game, t: number): void {
  const a = game.auraNow();
  if (!a) return;
  const h = game.hero;
  const T = tonesOf(a.kind);
  const grow = Math.min(1, a.t / 0.3);
  const r = a.r * (0.3 + 0.7 * grow);
  const at = (ang: number, rr: number): [number, number] => [wx(cam, h.x + Math.cos(ang) * rr, h.y + Math.sin(ang) * rr), wy(cam, h.x + Math.cos(ang) * rr, h.y + Math.sin(ang) * rr)];
  // its floor, breathing
  g.globalAlpha = 0.16 + 0.06 * Math.sin(t * 4);
  g.fillStyle = T[1];
  g.beginPath();
  for (let k = 0; k <= 48; k++) {
    const [X, Y] = at((k / 48) * Math.PI * 2, r);
    if (k === 0) g.moveTo(X, Y);
    else g.lineTo(X, Y);
  }
  g.fill();
  g.globalAlpha = 1;
  // as it comes on: a flash going out to its edge
  if (a.t < 0.35) {
    g.globalAlpha = 1 - a.t / 0.35;
    floorRing(g, cam, h.x, h.y, r * 1.05, T[3], 1, 0);
    g.globalAlpha = 1;
  }
  // its edge: thick, the body tone, its light turning round it, a rim of the friend's cyan just inside
  floorRing(g, cam, h.x, h.y, r + 0.05, T[0], 1, 0);
  floorRing(g, cam, h.x, h.y, r, T[1], 1, 0);
  floorRing(g, cam, h.x, h.y, r - 0.05, T[2], 2, t * 0.8);
  floorRing(g, cam, h.x, h.y, r - 0.18, C[1], 3, -t * 0.5);
  const seed = (k: number): number => Math.abs((Math.sin(k * 12.9898) * 43758.5453) % 1);
  if (a.kind === 'fire') {
    // tongues of flame licking up all round its edge
    for (let k = 0; k < 18; k++) {
      const ang = (k / 18) * Math.PI * 2 + t * 0.4;
      const [X, Y] = at(ang, r);
      const tall = 4 + Math.round(3 * (0.5 + 0.5 * Math.sin(t * 11 + k * 1.9)));
      for (let j = 0; j < tall; j++) {
        const w = j < tall * 0.4 ? 1 : 0;
        dot(g, X - w, Y - j, j < 2 ? T[1] : j < tall - 2 ? T[2] : T[3], 1 + 2 * w, 1);
      }
    }
    // embers rising off the floor inside it
    for (let k = 0; k < 30; k++) {
      const ph = (t * 0.7 + seed(k)) % 1;
      const ang = k * 2.39996;
      const rr = r * Math.sqrt(seed(k + 40)) * 0.92;
      const [X0, Y0] = at(ang, rr);
      const X = X0 + Math.sin(t * 3 + k) * 2;
      const Y = Y0 - ph * 28;
      g.globalAlpha = 1 - ph * 0.6;
      dot(g, X, Y, ph < 0.3 ? T[3] : ph < 0.7 ? T[2] : T[1], 2, 2);
    }
    g.globalAlpha = 1;
  } else if (a.kind === 'lightning') {
    // bright runs along its edge, new every few frames
    const step = Math.floor(t * 16);
    for (let k = 0; k < 3; k++) {
      const a0 = seed(step * 3 + k) * Math.PI * 2;
      for (let s = 0; s < 10; s++) {
        const [X, Y] = at(a0 + s * 0.05, r);
        dot(g, X, Y - 1, T[3], 2, 2);
      }
    }
    // crackle leaping up off its edge: thick zigzags, white at their hearts
    for (let k = 0; k < 7; k++) {
      const ang = seed(step * 7 + k) * Math.PI * 2;
      let [X, Y] = at(ang, r);
      for (let s = 0; s < 5; s++) {
        const nx = X + (seed(step + k * 5 + s) > 0.5 ? 4 : -4);
        const ny = Y - 3 - seed(step * 3 + k + s) * 4;
        for (const [w, c] of [[2, T[2]], [1, T[3]]] as const) {
          g.strokeStyle = c;
          g.lineWidth = w;
          g.beginPath();
          g.moveTo(Math.round(X) + 0.5, Math.round(Y) + 0.5);
          g.lineTo(Math.round(nx) + 0.5, Math.round(ny) + 0.5);
          g.stroke();
        }
        X = nx;
        Y = ny;
      }
      glow(g, X, Y, 5, T[2], 0.3);
    }
  } else {
    // shards of ice standing up round its edge
    for (let k = 0; k < 16; k++) {
      const ang = (k / 16) * Math.PI * 2;
      const [X, Y] = at(ang, r);
      const tall = 3 + (k % 3) * 2;
      for (let j = 0; j < tall; j++) dot(g, X - (j < tall - 2 ? 1 : 0), Y - j, j === tall - 1 ? T[3] : j % 2 ? T[2] : T[1], j < tall - 2 ? 2 : 1, 1);
    }
    // snow drifting down inside it
    for (let k = 0; k < 26; k++) {
      const ph = (t * 0.35 + seed(k)) % 1;
      const ang = k * 2.39996;
      const rr = r * Math.sqrt(seed(k + 40)) * 0.9;
      const [X0, Y0] = at(ang, rr);
      dot(g, X0 + Math.sin(t * 2 + k) * 3, Y0 - (1 - ph) * 26, ph < 0.5 ? T[3] : T[2], 2, 2);
    }
    // stars of frost turning on its edge
    for (let k = 0; k < 8; k++) {
      const [X, Y] = at((k / 8) * Math.PI * 2 + t * 0.3, r);
      const Xr = Math.round(X);
      const Yr = Math.round(Y) - 2;
      dot(g, Xr - 3, Yr, T[2], 7, 1);
      dot(g, Xr, Yr - 3, T[2], 1, 7);
      dot(g, Xr - 1, Yr - 1, T[3], 3, 3);
    }
  }
}

/** (THE RANGER'S SNARE) A loop of rope lying open on the floor at (x, y): `set` once it is armed. */
export function drawSnare(g: G, cam: Cam, x: number, y: number, set: boolean, t: number): void {
  const R = 0.62;
  const n = 44;
  // set: the ground inside it lit in cyan, beating
  if (set) {
    g.globalAlpha = 0.45 + 0.35 * Math.sin(t * 6);
    floorRing(g, cam, x, y, R * 0.7, C[1], 2, t);
    g.globalAlpha = 1;
  }
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const X = wx(cam, x + Math.cos(a) * R, y + Math.sin(a) * R);
    const Y = wy(cam, x + Math.cos(a) * R, y + Math.sin(a) * R);
    // (the far side of the loop lit, the near side in shade; a dark turn every third: its twist)
    const far = Math.sin(a + Math.PI / 4) < 0;
    dot(g, X - 1, Y - 1, k % 3 === 0 ? ROPE[0] : far ? ROPE[2] : ROPE[1], 3, 2);
  }
  // its knot, on the near side, and the line to its peg
  const kx = wx(cam, x + R * 0.7, y + R * 0.7);
  const ky = wy(cam, x + R * 0.7, y + R * 0.7);
  dot(g, kx - 2, ky - 2, ROPE[0], 5, 4);
  dot(g, kx - 1, ky - 2, ROPE[1], 3, 3);
  dot(g, kx - 1, ky - 2, ROPE[2], 2, 1);
  for (let i = 2; i <= 10; i++) dot(g, kx + i, ky + i * 0.5, i % 2 ? ROPE[1] : ROPE[0], 2, 2);
  dot(g, kx + 11, ky + 1, '#5a5f76', 2, 7);
  dot(g, kx + 9, ky, '#c4cbe0', 6, 2);
  // set: a glint of cyan running round it
  if (set) {
    const a = t * 3;
    const X = Math.round(wx(cam, x + Math.cos(a) * R, y + Math.sin(a) * R));
    const Y = Math.round(wy(cam, x + Math.cos(a) * R, y + Math.sin(a) * R)) - 1;
    glow(g, X, Y, 6, C[2], 0.35);
    dot(g, X - 3, Y, C[2], 7, 1);
    dot(g, X, Y - 3, C[2], 1, 7);
    dot(g, X - 1, Y - 1, C[3], 3, 3);
  }
}

/** (THE RANGER'S SNIPE) While he draws: his aim along the floor and a light gathering at his bow, the fuller the longer he holds. */
export function drawSnipeDraw(g: G, cam: Cam, game: Game, t: number): void {
  const d = game.snipeDraw();
  if (!d) return;
  const h = game.hero;
  const dx = d.tx - h.x;
  const dy = d.ty - h.y;
  const l = Math.hypot(dx, dy) || 1;
  const reach = Math.min(l, 14) * (0.3 + 0.7 * d.power);
  const n = Math.round(reach * 4);
  const full = d.power >= 1;
  for (let k = 2; k < n; k++) {
    const X = wx(cam, h.x + (dx / l) * (k / 4), h.y + (dy / l) * (k / 4));
    const Y = wy(cam, h.x + (dx / l) * (k / 4), h.y + (dy / l) * (k / 4));
    g.globalAlpha = 0.4 + 0.6 * d.power * (1 - k / (n + 4));
    dot(g, X, Y, full ? C[2] : C[1], 2, 1);
  }
  g.globalAlpha = 1;
  // the light gathering at his bow: bigger as he draws, a flash and a cross of light when full
  const [ux, uy] = screenWay(dx, dy);
  const bx = wx(cam, h.x, h.y) + ux * 7;
  const by = wy(cam, h.x, h.y) - 15 + uy * 4;
  glow(g, bx, by, 4 + 8 * d.power, C[2], 0.25 + 0.25 * d.power);
  disc(g, bx, by, 1 + 2.5 * d.power, C[2]);
  dot(g, bx, by, C[3], 1, 1);
  if (full && Math.floor(t * 10) % 2 === 0) {
    dot(g, bx - 6, by, C[3], 13, 1);
    dot(g, bx, by - 6, C[3], 1, 13);
  }
}

/** (THE RANGER'S SNIPE) The streak behind an arrow it loosed: long, white at its heart, its glow. */
export function drawSnipeStreak(g: G, cam: Cam, x: number, y: number, vx: number, vy: number): void {
  const [ux, uy] = screenWay(vx, vy);
  const px = -uy;
  const py = ux;
  const tx = wx(cam, x, y);
  const ty = wy(cam, x, y) - 9;
  for (let i = 4; i < 60; i++) {
    const a = Math.max(0, 1 - i / 60);
    g.globalAlpha = a;
    dot(g, tx - ux * i, ty - uy * i, i < 24 ? '#ffffff' : C[2]);
    g.globalAlpha = a * 0.7;
    dot(g, tx - ux * i + px, ty - uy * i + py, C[2]);
    dot(g, tx - ux * i - px, ty - uy * i - py, C[1]);
  }
  g.globalAlpha = 1;
  glow(g, tx, ty, 6, C[2], 0.3);
}

/** (THE RANGER'S RALLY) As he calls: rings of cyan going out from him, and his call's light bursting round him. */
export function drawRally(g: G, cam: Cam, game: Game, t: number): void {
  const r = game.rallyNow();
  if (!r) return;
  const h = game.hero;
  if (r.since < 0.9) {
    for (const [lag, c] of [[0, C[3]], [0.12, C[2]], [0.24, C[1]]] as const) {
      const k = (r.since - lag) / 0.66;
      if (k < 0 || k > 1) continue;
      g.globalAlpha = 1 - k;
      floorRing(g, cam, h.x, h.y, 0.6 + k * 5.4, c, 1, 0);
      floorRing(g, cam, h.x, h.y, 0.55 + k * 5.4, c, 1, 0);
    }
    g.globalAlpha = 1;
  }
  if (r.since < 0.4) {
    const k = r.since / 0.4;
    const sx = wx(cam, h.x, h.y);
    const sy = wy(cam, h.x, h.y) - 16;
    glow(g, sx, sy, 18 * (1 - k * 0.5), C[2], 0.5 * (1 - k));
    g.globalAlpha = 1 - k;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (let j = 8 + k * 10; j < 14 + k * 14; j++) dot(g, sx + Math.cos(a) * j, sy + Math.sin(a) * j * 0.6, C[2], 2, 1);
    }
    g.globalAlpha = 1;
  }
}

/** (THE RANGER'S RALLY) Over the figures, while it lasts: his companions lit in cyan, motes rising off them, a mark over each. */
export function drawRallyAir(g: G, cam: Cam, game: Game, t: number): void {
  if (!game.rallyNow()) return;
  for (const [i, p] of game.pets.entries()) {
    const px = wx(cam, p.x, p.y);
    const py = wy(cam, p.x, p.y) - 6;
    glow(g, px, py - 6, 13, C[2], 0.22 + 0.08 * Math.sin(t * 8 + i));
    for (let k = 0; k < 6; k++) {
      const ph = (t * 1.3 + k / 6 + i * 0.21) % 1;
      const X = px + Math.sin(t * 4 + k * 2 + i) * 7;
      const Y = py - 3 - ph * 22;
      g.globalAlpha = 1 - ph * 0.8;
      dot(g, X, Y, ph < 0.3 ? C[3] : C[2], 2, 2);
    }
    // a mark of the friend's cyan over each while it lasts: a double chevron, pointing up
    g.globalAlpha = 0.75 + 0.25 * Math.sin(t * 8);
    for (const lift of [0, 4]) {
      const cy = py - 28 - lift;
      for (let k = 0; k < 5; k++) {
        dot(g, px - 5 + k, cy + 4 - k, C[2], 2, 1);
        dot(g, px + 4 - k, cy + 4 - k, C[2], 2, 1);
      }
    }
    dot(g, px - 1, cy0(py) - 1, C[3], 2, 2);
  }
  g.globalAlpha = 1;
}

const cy0 = (py: number): number => py - 32;
