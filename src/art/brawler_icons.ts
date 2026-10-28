// THE BRAWLER'S THREE ICONS (the main chat, 28 Oct 2026; game/brawler.ts, behind BRAWLER). Shown to the owner in the main chat
// (brawler_icons.png), his pick by 16:15 (Eastern): “Yes, keep them (Recommended)”. On the buttons' canvas (art/ability_icons.ts: thirty-two picture pixels), his wrapped fist and
// what bursts off his blows (dev/brawler_fx.ts: a ring of air, a crack of light, a streak behind the fist going in). What
// glows is the friend's cyan.
//   jab      his wrapped fist snapped out to the right, a streak behind it, a ring of air off its knuckles
//   cross    a heavier fist driven in, a crack of cyan light bursting where it lands, the air ringing out
//   slip     his after-images weaving low along the floor, and the counter hook's burst where he comes up

import { Px } from '../engine/px';
import { Light } from '../dev/warlock_fx';
import { BREW } from '../dev/contraption_fx';

const N = 32;
/** His skin, and the wraps on his fists (dark to bright). */
const SKIN = ['#4a2418', '#7a4430', '#b06c48', '#e0a070'];
const WRAP = ['#5a5a6a', '#9898aa', '#d0d0dc', '#f4f4fa'];
const GHOST = ['#0e3e4c', '#145a6a', '#1e8494', '#52c2cc'];

function lay(paint: (l: { skin: Light; wrap: Light; glow: Light; ghost: Light }) => void): Px {
  const p = new Px(N, N);
  const l = { skin: new Light(), wrap: new Light(), glow: new Light(), ghost: new Light() };
  paint(l);
  l.ghost.lay(p, GHOST);
  l.skin.lay(p, SKIN);
  l.wrap.lay(p, WRAP);
  l.glow.lay(p, BREW);
  return p;
}
function blob(l: Light, cx: number, cy: number, rx: number, ry: number, lit = 1): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (d > 1) continue;
      const k = (cx - x) / rx + (cy - y) / ry;
      l.put(x, y, d > 0.85 ? 0 : k > 0.5 * lit ? 3 : k > -0.3 ? 2 : 1);
    }
  }
}
/** His wrapped fist, its knuckles to the right, at (x, y), `s` its size; the forearm back to the left. */
function fist(l: { skin: Light; wrap: Light }, x: number, y: number, s: number): void {
  // (the forearm, skin, thick, back off the picture's edge, a little down)
  for (let i = 0; i <= 16 * s; i++) blob(l.skin, x - 5 * s - i * 0.75, y + 1.5 * s + i * 0.1, 3.4 * s, 3 * s);
  // (the fist: a squarish block, wider than it is tall, its knuckles a row of bumps at the front, wrapped white)
  for (let yy = Math.round(-4.5 * s); yy <= Math.round(4.5 * s); yy++) {
    for (let xx = Math.round(-5 * s); xx <= Math.round(4 * s); xx++) {
      const edge = Math.abs(yy) > 3.6 * s && (xx < -4 * s || xx > 3 * s);
      if (edge) continue;
      const k = yy < -2 * s ? 3 : yy < 1.5 * s ? 2 : 1;
      l.wrap.put(x + xx, y + yy, k);
    }
  }
  // (the knuckles: four bumps along the front, the gaps between them dark)
  for (let n = 0; n < 4; n++) {
    const ky = y - 3.6 * s + n * 2.4 * s;
    l.wrap.put(x + 5 * s, ky, 3);
    l.wrap.put(x + 5 * s, ky + 1, 2);
    l.wrap.put(x + 4 * s, ky + 1.8 * s, 0);
  }
  // (the wraps' bands, and the thumb folded across the front, skin showing)
  for (let yy = -4; yy <= 4; yy++) {
    l.wrap.put(x - 2 * s, y + yy * s, 0);
  }
  for (let xx = -1; xx <= 3; xx++) l.skin.put(x + xx * s, y + 2.6 * s, 2);
  l.skin.put(x + 3.5 * s, y + 2 * s, 3);
}
/** A ring of air off the knuckles: an arc of light opening to the right. */
function ring(l: Light, x: number, y: number, r: number, k: number): void {
  for (let a = -1.2; a <= 1.2; a += 0.08) l.put(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r, k);
}

export function jabIcon(): Px {
  return lay((l) => {
    // (the streak behind it: lines of light going in)
    for (const [y, len] of [[11, 9], [16, 12], [21, 8]] as const) for (let i = 0; i < len; i++) l.glow.put(3 + i, y, i > len - 4 ? 2 : 1);
    fist(l, 18, 16, 0.85);
    ring(l.glow, 26, 16, 7, 2);
    ring(l.glow, 29, 16, 4, 3);
  });
}

export function crossIcon(): Px {
  return lay((l) => {
    fist(l, 15, 17, 1.05);
    // (a crack of light bursting where it lands, its rays jagged, white at the heart; the air ringing out round it)
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3;
      const r = i % 2 ? 5 : 9;
      for (let u = 1; u <= r; u++) l.glow.put(25 + Math.cos(a) * u + (u % 3 === 0 ? 1 : 0), 16 + Math.sin(a) * u, u < 3 ? 3 : u < 6 ? 2 : 1);
    }
    for (let a = 0; a < Math.PI * 2; a += 0.12) l.glow.put(25 + Math.cos(a) * 11, 16 + Math.sin(a) * 9, 1);
  });
}

export function slipIcon(): Px {
  return lay((l) => {
    // (the way he weaves, low along the floor: a bold S of after-images, dimmest where he set off)
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const x = 3 + u * 19;
      const y = 26 - u * 8 + Math.sin(u * Math.PI * 2) * 3.5;
      const k = u < 0.35 ? 0 : u < 0.7 ? 1 : 2;
      for (let w = -1; w <= 1; w++) l.ghost.put(x, y + w, k + (w === -1 ? 1 : 0));
    }
    for (const [x, y] of [[8, 25], [14, 18], [19, 19]] as const) blob(l.ghost, x, y, 2.4, 2.2);
    // (coming up: the counter hook's fist, up and to the right, and its burst)
    fist(l, 22, 11, 0.55);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = i % 2 ? 3 : 5;
      for (let u = 1; u <= r; u++) l.glow.put(28 + Math.cos(a) * u, 9 + Math.sin(a) * u, u < 2 ? 3 : 2);
    }
  });
}
