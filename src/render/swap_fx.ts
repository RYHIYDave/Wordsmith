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

/** (THE MAGE'S BALL) In flight at (x, y), going (vx, vy). */
export function drawBall(g: G, cam: Cam, x: number, y: number, vx: number, vy: number, el: Element, t: number): void {
  const T = tonesOf(el);
  const LIFT = 11;
  const sx = wx(cam, x, y);
  const sy = wy(cam, x, y);
  // its shadow on the floor
  g.globalAlpha = 0.35;
  g.fillStyle = '#000000';
  g.fillRect(Math.round(sx) - 3, Math.round(sy), 7, 1);
  g.fillRect(Math.round(sx) - 2, Math.round(sy) - 1, 5, 1);
  g.globalAlpha = 1;
  // the tail: motes falling behind it, smaller and darker the further back
  const v = Math.hypot(vx, vy) || 1;
  for (let k = 5; k >= 1; k--) {
    const bx = x - (vx / v) * 0.17 * k;
    const by = y - (vy / v) * 0.17 * k;
    const wob = Math.sin(t * 30 + k * 1.7) * 0.6;
    disc(g, wx(cam, bx, by), wy(cam, bx, by) - LIFT + wob, Math.max(0.4, 2.6 - k * 0.45), k < 3 ? T[1] : T[0]);
  }
  // the ball: dark all round, its body toward the light, its light, its heart
  disc(g, sx, sy - LIFT, 4.2, T[0]);
  disc(g, sx - 0.5, sy - LIFT - 0.5, 3.4, T[1]);
  disc(g, sx - 1.3, sy - LIFT - 1.3, 2, T[2]);
  dot(g, sx - 2, sy - LIFT - 2, T[3], 2, 1);
  // a spark thrown off it now and then
  if (Math.floor(t * 20) % 3 === 0) dot(g, sx + 3 + Math.sin(t * 50) * 2, sy - LIFT - 4, T[2]);
}

/** (THE MAGE'S SPEAR) In flight at (x, y), going (vx, vy): its point there. */
export function drawSpear(g: G, cam: Cam, x: number, y: number, vx: number, vy: number, el: Element): void {
  const T = tonesOf(el);
  const LIFT = 10;
  const [ux, uy] = screenWay(vx, vy);
  const px = -uy;
  const py = ux;
  const tx = wx(cam, x, y);
  const ty = wy(cam, x, y) - LIFT;
  // the air streaming behind it
  g.globalAlpha = 0.55;
  for (let i = 18; i < 30; i += 2) dot(g, tx - ux * i + px * 2, ty - uy * i + py * 2, T[1]);
  for (let i = 20; i < 34; i += 3) dot(g, tx - ux * i - px * 2, ty - uy * i - py * 2, T[0]);
  g.globalAlpha = 1;
  // the shaft: its sides in the body tone, its core bright
  for (let i = 4; i < 20; i++) {
    dot(g, tx - ux * i + px, ty - uy * i + py, T[1]);
    dot(g, tx - ux * i - px, ty - uy * i - py, T[0]);
    dot(g, tx - ux * i, ty - uy * i, i < 9 ? T[3] : T[2]);
  }
  // the head: a leaf, widest a little back from its point
  const W = [0, 1, 2, 2, 1, 1];
  for (let i = 0; i < W.length; i++) {
    for (let k = -W[i]; k <= W[i]; k++) dot(g, tx - ux * i + px * k, ty - uy * i + py * k, k === 0 ? T[3] : k > 0 ? T[2] : T[1]);
  }
  dot(g, tx + ux, ty + uy, T[3]);
}

/** (THE MAGE'S AURA) On the floor round her while it is on: its kind, its reach, how long it has been on. */
export function drawAura(g: G, cam: Cam, game: Game, t: number): void {
  const a = game.auraNow();
  if (!a) return;
  const h = game.hero;
  const T = tonesOf(a.kind);
  const grow = Math.min(1, a.t / 0.25);
  const r = a.r * (0.4 + 0.6 * grow);
  // a faint floor of it
  g.globalAlpha = 0.1;
  g.fillStyle = T[1];
  g.beginPath();
  for (let k = 0; k <= 40; k++) {
    const ang = (k / 40) * Math.PI * 2;
    const X = wx(cam, h.x + Math.cos(ang) * r, h.y + Math.sin(ang) * r);
    const Y = wy(cam, h.x + Math.cos(ang) * r, h.y + Math.sin(ang) * r);
    if (k === 0) g.moveTo(X, Y);
    else g.lineTo(X, Y);
  }
  g.fill();
  g.globalAlpha = 1;
  // its edge: the body tone all round, its light turning round it, a rim of the friend's cyan just inside
  floorRing(g, cam, h.x, h.y, r, T[1], 1, 0);
  floorRing(g, cam, h.x, h.y, r, T[2], 3, t * 0.8);
  floorRing(g, cam, h.x, h.y, r - 0.1, C[1], 4, -t * 0.5);
  const seed = (k: number): number => (Math.sin(k * 12.9898) * 43758.5453) % 1;
  if (a.kind === 'fire') {
    // embers rising off the floor inside it
    for (let k = 0; k < 16; k++) {
      const ph = (t * 0.7 + Math.abs(seed(k))) % 1;
      const ang = k * 2.39996;
      const rr = r * Math.sqrt(Math.abs(seed(k + 40))) * 0.92;
      const X = wx(cam, h.x + Math.cos(ang) * rr, h.y + Math.sin(ang) * rr) + Math.sin(t * 3 + k) * 1.5;
      const Y = wy(cam, h.x + Math.cos(ang) * rr, h.y + Math.sin(ang) * rr) - ph * 18;
      dot(g, X, Y, ph < 0.4 ? T[3] : ph < 0.75 ? T[2] : T[1]);
    }
  } else if (a.kind === 'lightning') {
    // crackle running round its edge: a few short zigzags, new every few frames
    const step = Math.floor(t * 14);
    for (let k = 0; k < 4; k++) {
      const ang = Math.abs(seed(step * 7 + k)) * Math.PI * 2;
      let X = wx(cam, h.x + Math.cos(ang) * r, h.y + Math.sin(ang) * r);
      let Y = wy(cam, h.x + Math.cos(ang) * r, h.y + Math.sin(ang) * r);
      for (let s = 0; s < 4; s++) {
        const nx = X + (seed(step + k * 5 + s) > 0 ? 3 : -3);
        const ny = Y - 2 - Math.abs(seed(step * 3 + k + s)) * 3;
        g.strokeStyle = s % 2 ? T[2] : T[3];
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(Math.round(X) + 0.5, Math.round(Y) + 0.5);
        g.lineTo(Math.round(nx) + 0.5, Math.round(ny) + 0.5);
        g.stroke();
        X = nx;
        Y = ny;
      }
    }
  } else {
    // motes of frost drifting down inside it, and stars of frost on its edge
    for (let k = 0; k < 14; k++) {
      const ph = (t * 0.35 + Math.abs(seed(k))) % 1;
      const ang = k * 2.39996;
      const rr = r * Math.sqrt(Math.abs(seed(k + 40))) * 0.9;
      const X = wx(cam, h.x + Math.cos(ang) * rr, h.y + Math.sin(ang) * rr) + Math.sin(t * 2 + k) * 2;
      const Y = wy(cam, h.x + Math.cos(ang) * rr, h.y + Math.sin(ang) * rr) - (1 - ph) * 20;
      dot(g, X, Y, ph < 0.5 ? T[3] : T[2]);
    }
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + t * 0.3;
      const X = Math.round(wx(cam, h.x + Math.cos(ang) * r, h.y + Math.sin(ang) * r));
      const Y = Math.round(wy(cam, h.x + Math.cos(ang) * r, h.y + Math.sin(ang) * r));
      dot(g, X - 1, Y, T[2], 3, 1);
      dot(g, X, Y - 1, T[2], 1, 3);
      dot(g, X, Y, T[3]);
    }
  }
}

/** (THE RANGER'S SNARE) A loop of rope lying open on the floor at (x, y): `set` once it is armed. */
export function drawSnare(g: G, cam: Cam, x: number, y: number, set: boolean, t: number): void {
  const R = 0.42;
  const n = 30;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const X = wx(cam, x + Math.cos(a) * R, y + Math.sin(a) * R);
    const Y = wy(cam, x + Math.cos(a) * R, y + Math.sin(a) * R);
    // (the far side of the loop lit, the near side in shade; a dark turn every third: its twist)
    const far = Math.sin(a + Math.PI / 4) < 0;
    dot(g, X, Y, k % 3 === 0 ? ROPE[0] : far ? ROPE[2] : ROPE[1], 2, 1);
  }
  // its knot, on the near side, and the line to its peg
  const kx = wx(cam, x + R * 0.7, y + R * 0.7);
  const ky = wy(cam, x + R * 0.7, y + R * 0.7);
  dot(g, kx - 1, ky - 1, ROPE[1], 3, 2);
  dot(g, kx - 1, ky - 1, ROPE[2]);
  for (let i = 1; i <= 6; i++) dot(g, kx + i, ky + i * 0.5, i % 2 ? ROPE[1] : ROPE[0]);
  dot(g, kx + 7, ky + 1, '#7a7f96', 1, 4);
  dot(g, kx + 6, ky + 1, '#c4cbe0', 3, 1);
  // set: a glint of cyan running round it
  if (set) {
    const a = t * 3;
    const X = wx(cam, x + Math.cos(a) * R, y + Math.sin(a) * R);
    const Y = wy(cam, x + Math.cos(a) * R, y + Math.sin(a) * R);
    dot(g, X - 1, Y, C[2], 3, 1);
    dot(g, X, Y - 1, C[2], 1, 3);
    dot(g, X, Y, C[3]);
  }
}

/** (THE RANGER'S SNIPE) While he draws: his aim along the floor, the fuller and brighter the longer he holds; a glint at full. */
export function drawSnipeDraw(g: G, cam: Cam, game: Game, t: number): void {
  const d = game.snipeDraw();
  if (!d) return;
  const h = game.hero;
  const dx = d.tx - h.x;
  const dy = d.ty - h.y;
  const l = Math.hypot(dx, dy) || 1;
  const reach = Math.min(l, 14) * (0.35 + 0.65 * d.power);
  const n = Math.round(reach * 4);
  for (let k = 2; k < n; k++) {
    if (k % (d.power >= 1 ? 1 : 2) !== 0) continue;
    const X = wx(cam, h.x + (dx / l) * (k / 4), h.y + (dy / l) * (k / 4));
    const Y = wy(cam, h.x + (dx / l) * (k / 4), h.y + (dy / l) * (k / 4));
    g.globalAlpha = 0.35 + 0.65 * d.power * (1 - k / (n + 4));
    dot(g, X, Y, d.power >= 1 ? C[2] : C[1]);
  }
  g.globalAlpha = 1;
  if (d.power >= 1 && Math.floor(t * 10) % 2 === 0) {
    const X = Math.round(wx(cam, h.x, h.y) + (dx - dy) / l * 6);
    const Y = Math.round(wy(cam, h.x, h.y) - 14 + (dx + dy) / l * 3);
    dot(g, X - 2, Y, C[3], 5, 1);
    dot(g, X, Y - 2, C[3], 1, 5);
  }
}

/** (THE RANGER'S SNIPE) The streak behind an arrow it loosed. */
export function drawSnipeStreak(g: G, cam: Cam, x: number, y: number, vx: number, vy: number): void {
  const [ux, uy] = screenWay(vx, vy);
  const tx = wx(cam, x, y);
  const ty = wy(cam, x, y) - 9;
  for (let i = 6; i < 34; i++) {
    g.globalAlpha = Math.max(0, 0.85 - i / 40);
    dot(g, tx - ux * i, ty - uy * i, i < 16 ? '#ffffff' : C[2]);
  }
  g.globalAlpha = 1;
}

/** (THE RANGER'S RALLY) A ring of cyan going out from him as he calls; while it lasts, cyan motes rising off his companions. */
export function drawRally(g: G, cam: Cam, game: Game, t: number): void {
  const r = game.rallyNow();
  if (!r) return;
  const h = game.hero;
  if (r.since < 0.6) {
    const k = r.since / 0.6;
    g.globalAlpha = 1 - k;
    floorRing(g, cam, h.x, h.y, 0.5 + k * 5, C[2], 1, 0);
    floorRing(g, cam, h.x, h.y, 0.3 + k * 4.2, C[1], 2, 0);
    g.globalAlpha = 1;
  }
  g.globalAlpha = 1;
}

/** (THE RANGER'S RALLY) Over the figures, while it lasts: cyan motes rising off his companions, and a cyan mark over each. */
export function drawRallyAir(g: G, cam: Cam, game: Game, t: number): void {
  if (!game.rallyNow()) return;
  for (const [i, p] of game.pets.entries()) {
    const px = wx(cam, p.x, p.y);
    const py = wy(cam, p.x, p.y) - 6;
    for (let k = 0; k < 5; k++) {
      const ph = (t * 1.3 + k / 5 + i * 0.21) % 1;
      const X = px + Math.sin(t * 4 + k * 2 + i) * 5;
      const Y = py - 3 - ph * 18;
      g.globalAlpha = 1 - ph * 0.8;
      dot(g, X, Y, ph < 0.3 ? C[3] : C[2], 2, 2);
    }
    // (a mark of the friend's cyan over each while it lasts: a chevron, pointing up)
    g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 8);
    const cy = py - 24;
    for (let k = 0; k < 4; k++) {
      dot(g, px - 3 + k, cy + 3 - k, C[2]);
      dot(g, px + 3 - k, cy + 3 - k, C[2]);
    }
    dot(g, px, cy - 1, C[3]);
  }
  g.globalAlpha = 1;
}
