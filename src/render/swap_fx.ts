// THE MAGE'S AND THE RANGER'S MOVES TO SWAP, THEIR LOOKS IN THE GAME (game/swap_moves.ts, behind SWAP_MOVES; his words in
// docs/mockups/swap_moves/README.md). Drawn at the game's grain (a tile 32 by 16 of its pixels), in the spell tones her magic
// has always been drawn in (art/spells.ts SPELL_TONES: violet with no word's element, else the element's own), his in rope and
// the friend's cyan. Hers have no element of their own (his words: “i dont want spear to be ice spear, i want it to be spear,
// same with the others”): they take her words'. To be shown him in play before any goes live.
//   BALL     a ball of three tones and a white heart, the light from the upper left, its tail of fading motes, its shadow below;
//   SPEAR    a shaft of light with a bright core and a leaf of a head, a streak of air behind it;
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

/** (THE MAGE'S BALL) In flight at (x, y), going (vx, vy): big, lit, its glow about it, its tail behind, sparks going round it. */
export function drawBall(g: G, cam: Cam, x: number, y: number, vx: number, vy: number, el: Element, t: number): void {
  const T = tonesOf(el);
  const LIFT = 13;
  const sx = wx(cam, x, y);
  const sy = wy(cam, x, y);
  // its shadow on the floor
  g.globalAlpha = 0.4;
  g.fillStyle = '#000000';
  g.fillRect(Math.round(sx) - 5, Math.round(sy), 11, 2);
  g.fillRect(Math.round(sx) - 3, Math.round(sy) - 1, 7, 1);
  g.globalAlpha = 1;
  // the tail: motes falling behind it, smaller and darker the further back
  const v = Math.hypot(vx, vy) || 1;
  for (let k = 8; k >= 1; k--) {
    const bx = x - (vx / v) * 0.2 * k;
    const by = y - (vy / v) * 0.2 * k;
    const wob = Math.sin(t * 30 + k * 1.7) * 1;
    disc(g, wx(cam, bx, by), wy(cam, bx, by) - LIFT + wob, Math.max(0.6, 4.6 - k * 0.55), k < 3 ? T[2] : k < 6 ? T[1] : T[0]);
  }
  glow(g, sx, sy - LIFT, 14, T[2], 0.3);
  // the ball: dark all round, its body toward the light, its light, its heart
  disc(g, sx, sy - LIFT, 6.2, T[0]);
  disc(g, sx - 0.7, sy - LIFT - 0.7, 5.2, T[1]);
  disc(g, sx - 1.8, sy - LIFT - 1.8, 3.2, T[2]);
  dot(g, sx - 3, sy - LIFT - 3, T[3], 2, 2);
  // sparks going round it
  for (let k = 0; k < 3; k++) {
    const a = t * 9 + (k / 3) * Math.PI * 2;
    dot(g, sx + Math.cos(a) * 9, sy - LIFT + Math.sin(a) * 5, k === 0 ? T[3] : T[2], 2, 2);
  }
}

/** (THE MAGE'S SPEAR) In flight at (x, y), going (vx, vy), its point there: a long shaft of light, a leaf of a head, its glow, its streak. */
export function drawSpear(g: G, cam: Cam, x: number, y: number, vx: number, vy: number, el: Element): void {
  const T = tonesOf(el);
  const LIFT = 12;
  const [ux, uy] = screenWay(vx, vy);
  const px = -uy;
  const py = ux;
  const tx = wx(cam, x, y);
  const ty = wy(cam, x, y) - LIFT;
  const LONG = 36;
  // the air streaming behind it
  for (const [off, from, to, c, a] of [[3, 30, 64, T[1], 0.6], [-3, 34, 70, T[0], 0.55], [0, 36, 80, T[2], 0.4]] as const) {
    g.globalAlpha = a;
    for (let i = from; i < to; i += 2) dot(g, tx - ux * i + px * off, ty - uy * i + py * off, c);
  }
  g.globalAlpha = 1;
  // its glow along its length
  for (let i = 0; i < LONG; i += 6) glow(g, tx - ux * i, ty - uy * i, 7, T[2], 0.16);
  // the shaft: dark edges, the body, the light toward the sky, a white core near the head
  for (let i = 6; i < LONG; i++) {
    dot(g, tx - ux * i + px * 2, ty - uy * i + py * 2, T[0]);
    dot(g, tx - ux * i - px * 2, ty - uy * i - py * 2, T[0]);
    dot(g, tx - ux * i + px, ty - uy * i + py, T[2]);
    dot(g, tx - ux * i - px, ty - uy * i - py, T[1]);
    dot(g, tx - ux * i, ty - uy * i, i < 18 ? T[3] : T[2]);
  }
  // the head: a leaf, widest a little back from its point, lit along its upper edge
  const W = [0, 1, 2, 3, 4, 4, 3, 3, 2];
  for (let i = 0; i < W.length; i++) {
    for (let k = -W[i]; k <= W[i]; k++) dot(g, tx - ux * i + px * k, ty - uy * i + py * k, k === 0 ? T[3] : Math.abs(k) === W[i] ? T[0] : k > 0 ? T[2] : T[1]);
  }
  glow(g, tx, ty, 6, T[3], 0.3);
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
