// HER GOLEM WINDING DOWN, WHAT FLIES OFF IT (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Its end is its own (dev/golem_moves.ts golemDown); here is what comes off it, on the picture: yellow sparks off its
// brass where the blow lands (his word of 8 Oct, of what flies off a hit: “yellow sparks hitting an armored target”, his
// rulebook's Hits 4); its gears and springs popping out of it as it shudders, flung up and falling to the floor, where they
// lie; its steam (dev/golem_pound_fx.ts) hissing and bursting out of it, and thin wisps rising off it once it is still.

import { Light } from './warlock_fx';
import { Px } from '../engine/px';

/** Sparks off brass: white-hot to deep yellow. */
export const SPARKS = ['#fff8d8', '#ffe070', '#f0b020', '#b06a10'];
/** Its gears: brass, dark to lit, and the dark of a gear's middle. */
export const GEARS = ['#2a1c08', '#6a4a14', '#b08a2a', '#e8c860'];

const hash = (i: number): number => {
  const x = Math.sin(i * 77.7 + 3.1) * 43758.5453;
  return x - Math.floor(x);
};

/** SPARKS bursting off the blow at (x, y) on the picture, `k` frames after it: flung out, each a streak along its way, falling, gone in ten frames. */
export function sparks(l: Light, x: number, y: number, k: number, seed: number): void {
  if (k < 0 || k > 10) return;
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI * (0.05 + 0.9 * hash(seed + i)) + (hash(seed * 3 + i) - 0.5) * 0.6;
    const v = 3.2 + 4.0 * hash(seed * 5 + i);
    const g = 0.35;
    // (where it is, and where it was a frame ago: drawn between them, a streak)
    const at = (t: number): [number, number] => [x + Math.cos(a) * v * t, y + Math.sin(a) * v * t + (g * t * t) / 2];
    const [x1, y1] = at(k);
    const [x0, y0] = at(Math.max(0, k - 1.6));
    if (hash(seed * 7 + i) < k / 11) continue;
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let j = 0; j <= n; j++) {
      const px = Math.round(x0 + ((x1 - x0) * j) / n);
      const py = Math.round(y0 + ((y1 - y0) * j) / n);
      l.put(px, py, k < 2 ? 0 : j === n ? 1 : 2);
      l.put(px + 1, py, k < 2 ? 1 : 2);
    }
  }
}

/**
 * ITS GEARS AND SPRINGS POPPING OUT of it at (x, y) on the picture, `k` frames after its shudder: flung up and out, tumbling,
 * falling to the floor `floor` pixels below where they started and lying there. Each a little brass gear, its middle dark.
 */
export function gears(st: Light, x: number, y: number, floor: number, k: number, seed: number): void {
  if (k < 0) return;
  for (let i = 0; i < 6; i++) {
    const vx = (hash(seed + i) - 0.5) * 5.2;
    const vy = -2.6 - 2.2 * hash(seed * 3 + i);
    const g = 0.42;
    const born = i * 1.5;
    const t = k - born;
    if (t < 0) continue;
    // (falls to the floor and lies there, a little apart from the others)
    const land = floor + (hash(seed * 9 + i) - 0.5) * 8;
    const tl = (-vy + Math.sqrt(vy * vy + 2 * g * land)) / g;
    const u = Math.min(t, tl);
    const gx = Math.round(x + vx * u);
    const gy = Math.round(y + vy * u + (g * u * u) / 2);
    const r = i % 3 === 0 ? 2 : 1.6;
    const spin = t * 0.7 + i;
    for (let yy = -3; yy <= 3; yy++) {
      for (let xx = -3; xx <= 3; xx++) {
        const d = Math.hypot(xx, yy);
        const ang = Math.atan2(yy, xx) + spin;
        const tooth = Math.cos(ang * 4) > 0.3 ? 0.9 : 0;
        if (d > r + tooth) continue;
        st.put(gx + xx, gy + yy, d < 0.8 ? 0 : yy < 0 ? 3 : d > r ? 1 : 2);
      }
    }
  }
}

/** The picture of its sparks and its gears. */
export function laySparks(w: number, h: number, l: Light): Px {
  const out = new Px(w, h);
  l.lay(out, SPARKS);
  return out;
}
export function layGears(w: number, h: number, st: Light): Px {
  const out = new Px(w, h);
  st.lay(out, GEARS);
  return out;
}
