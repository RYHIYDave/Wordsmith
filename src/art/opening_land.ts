// THE MOUNTAIN OF THE OPENING (art/opening.ts), BUILT AS LAND AT ITS TRUE SIZE. His words, 25 Oct 2026, of the first box
// (the road up): “The sky is actually really good.  Everything else is wrong.”, and “And the scale is way off.  That
// wordsmith is way too big for where I expect him to be in the distance.  Same with the prison.  I want the mountain to
// look super high and the prison, while big, should look proportional”.
//
// So the mountain is made as the land is: a height for every place, in metres. A peak a kilometre and a quarter above
// the road's start, its faces cut by ridges and gullies, snow in its high gullies, the crag on its top that the prison
// stands on; the road switching back and forth up its face to the prison's gate, cut into the slope as a shelf, walled
// on its downhill side; the foothills before it, wooded low down; a lesser peak off to the left; the far ranges behind.
// A box's camera stands somewhere in it and looks; every pixel is found by sending a ray out from the eye until it meets
// the land (heights kept in two grids: fine near the road's start, coarse for the rest). What it meets is lit as the
// comic lights things, in flat bands with the dots of each band laid over the next: the sun low behind the peak, so the
// faces turned to us are in shadow and every ridge turned toward the sun is rimmed with its light; the further off, the
// more the evening's haze is in it. Where a nearer slope stands in front of a further one it is inked.
//
// Metres: x across (right), y away from the first box's camera, z up. The first box's camera stands at the origin.

import { Px } from '../engine/px';
import { clamp01, dot, hash, noise } from './comic';
import type { V3 } from './sdf';

type Pt = [number, number];

const unit = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
/** Smooth noise -1..1, `oct` octaves. */
function fbm(x: number, y: number, s: number, oct: number): number {
  let t = 0;
  let a = 0.5;
  let f = 1;
  let n = 0;
  for (let k = 0; k < oct; k++) {
    t += a * (noise(x * f, y * f, s + k * 17) * 2 - 1);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return t / n;
}
/** A smooth maximum of two heights: where they meet, a rounded saddle, not a crease. */
const smax = (a: number, b: number, k: number): number => (a + b + Math.sqrt((a - b) * (a - b) + k * k)) / 2;
const sstep = (a: number, b: number, v: number): number => {
  const c = clamp01((v - a) / (b - a));
  return c * c * (3 - 2 * c);
};

// =============================================================================================
// THE PEAK

/** Where the peak's top is, and how high. */
export const PEAK: V3 = [1150, 2500, 1780];
/** How far across the crag on its top is, that the prison stands on, and how high its flat top stands. */
export const CRAG_R = 165;
export const CRAG_TOP = 1565;
/** The shoulder the crag stands up out of, round the peak's top, where the road comes to the crag's foot. */
export const SHOULDER = 1390;

/** Where the bluff by the road is, that the cult waited behind. */
export const BLUFF: Pt = [440, 600];

/** How far out from the peak's middle the crag's edge is, round it. */
export function cragEdge(th: number): number {
  return CRAG_R * (1 + 0.16 * (noise(th * 2.2 + 1, 0, 421) * 2 - 1) + 0.07 * (noise(th * 9, 3, 422) * 2 - 1) + 0.05 * (1 - Math.abs(noise(th * 23, 5, 424) * 2 - 1)));
}

/** A mountain's height at (x, y): its shape round its top `c`, how high, how broad; its ridges and gullies. */
function mountain(x: number, y: number, c: Pt, top: number, broad: number, seed: number): number {
  const dx = x - c[0];
  const dy = y - c[1];
  const r = Math.hypot(dx, dy);
  const th = Math.atan2(dy, dx);
  // (not a cone: its reach out from the top wanders with the angle, a long shoulder here, a short steep face there)
  const warp = 1 + 0.22 * (noise(th * 1.3 + 7, 0.5, seed + 1) * 2 - 1) + 0.12 * (noise(th * 3.7 + 3, 1.5, seed + 2) * 2 - 1);
  const rr = r / warp;
  let h = top * Math.exp(-Math.pow(rr / broad, 1.15));
  const k = h / top;
  // RIDGES AND GULLIES running down its faces, sharpest high up where it is steep: ridged noise round it, wandering
  const a = th * 5.2 + fbm(rr / 600, th, seed + 3, 2) * 1.4;
  const rid = 1 - Math.abs(noise(a, rr / 380, seed + 4) * 2 - 1);
  const rid2 = 1 - Math.abs(noise(a * 2.3 + 11, rr / 160, seed + 5) * 2 - 1);
  const rid3 = 1 - Math.abs(noise(a * 5.1 + 23, rr / 70, seed + 8) * 2 - 1);
  const steep = sstep(0.04, 0.5, k) * (1 - sstep(0.88, 1, k));
  h += ((rid - 0.55) * 260 + (rid2 - 0.55) * 80 + (rid3 - 0.55) * 22) * Math.pow(k, 0.55) * steep;
  // (bands of cliff across it, as rock lies in beds: the slope stepped, a steep band, a shelf)
  const bed = h / 85 + fbm(x / 500, y / 500, seed + 9, 2) * 0.8;
  const fr = bed - Math.floor(bed);
  h += (sstep(0.55, 0.75, fr) - fr) * 26 * steep;
  // (and the lumps of it, big and small)
  h += fbm(x / 340, y / 340, seed + 6, 3) * 55 * k + fbm(x / 70, y / 70, seed + 7, 3) * 12 * Math.sqrt(k);
  return h;
}

/** THE LAND'S HEIGHT, before the road is cut into it. */
/** THE PEAK: a great horn of rock, its faces hollowed between three ridges that run down from its top (one down to the
 * left of us, one to the right, one behind), steepening as they rise; cut into gullies and spurs down every face, the rock
 * in beds across it that stand out as bands of cliff; its top a shoulder, out of which the crag stands. */
function peak(x: number, y: number): number {
  const dx = x - PEAK[0];
  const dy = y - PEAK[1];
  const r = Math.hypot(dx, dy);
  const th = Math.atan2(dy, dx);
  const face = Math.atan2(-PEAK[1], -PEAK[0]);
  let reach = 0;
  for (const a of [face - 0.95, face + 0.8, face + Math.PI * 0.97]) {
    let d = th - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    reach = Math.max(reach, Math.exp(-((d / 0.4) ** 2)));
  }
  const R = 1300 * (0.6 + 0.55 * reach) * (1 + 0.08 * (noise(th * 3 + 2, 0.5, 411) * 2 - 1));
  const u = clamp01(1 - r / R);
  let h = -60 + (SHOULDER + 50 + 60) * Math.pow(u, 1.3);
  // (gullies and spurs down its faces: sharp ridged lines running down it, wandering; finer ones between)
  const inFace = sstep(0.04, 0.35, u) * (1 - sstep(0.9, 1, u));
  const a1 = th * 9 + fbm(r / 500, th * 2, 413, 2) * 1.6;
  const g1 = Math.pow(1 - Math.abs(noise(a1, r / 700, 414) * 2 - 1), 1.6);
  const a2 = th * 23 + fbm(r / 260, th * 3, 415, 2) * 1.6;
  const g2 = Math.pow(1 - Math.abs(noise(a2, r / 300, 416) * 2 - 1), 1.4);
  h += ((g1 - 0.4) * 120 + (g2 - 0.45) * 30) * inFace;
  // (the beds of rock: the slope stepped, a band of cliff, a shelf)
  const bed = h / 70 + fbm(x / 400, y / 400, 417, 2) * 0.9;
  const fr = bed - Math.floor(bed);
  h += (sstep(0.6, 0.78, fr) - fr) * 7 * inFace;
  h += fbm(x / 60, y / 60, 418, 3) * 9 * Math.sqrt(u);
  // (close to, the rock broken: crags and ribs a few metres high, and the rubble between them)
  const rock = sstep(0.02, 0.2, u);
  const c1 = 1 - Math.abs(noise(x / 16, y / 16, 419) * 2 - 1);
  const c2 = 1 - Math.abs(noise(x / 6.5 + 7, y / 6.5, 420) * 2 - 1);
  h += ((c1 - 0.5) * 7 + (c2 - 0.5) * 2.2 + fbm(x / 2.2, y / 2.2, 426, 2) * 0.5) * rock;
  return h;
}

export function natural(x: number, y: number): number {
  // the ground where the road starts, rising gently; the foothills, rolling, between us and the peak
  const fy = Math.max(0, y);
  let h = fy * 0.02 + fbm(x / 420, y / 420, 401, 3) * 75 * sstep(250, 900, fy) + fbm(x / 120, y / 120, 404, 2) * 16 * sstep(80, 400, fy);
  h += fbm(x / 45, y / 45, 402, 3) * 4 * sstep(0, 120, fy);
  // the near ground: a little uneven, boulders lying in it
  h += fbm(x / 9, y / 9, 403, 2) * 0.5;
  {
    const bx = Math.floor(x / 14);
    const by = Math.floor(y / 14);
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const k = hash(bx + i, by + j, 405);
        if (k > 0.22) continue;
        const cx = (bx + i + hash(bx + i, by + j, 406)) * 14;
        const cy = (by + j + hash(bx + i, by + j, 407)) * 14;
        const rr = 1.2 + k * 9;
        const d = Math.hypot(x - cx, (y - cy) * 1.2) / rr;
        if (d < 1) h += rr * 0.55 * Math.sqrt(1 - d * d) * (0.8 + 0.4 * noise(x / 1.5, y / 1.5, 408));
      }
    }
  }
  // THE BLUFF by the road on the foothills, where the cult waited: a long rocky rise on the road's left as it goes toward the
  // peak, its slope coming down to the road
  {
    const ax = x - BLUFF[0];
    const ay = y - BLUFF[1];
    const al = ax * 0.6 + ay * 0.8;
    const ac = -ax * 0.8 + ay * 0.6;
    const b = Math.exp(-((al / 120) ** 2) - ((ac / 34) ** 2));
    if (b > 0.002) {
      const crag = 1 - Math.abs(noise(x / 11, y / 11, 427) * 2 - 1);
      h = smax(h, 4 + 52 * b + (crag - 0.5) * 9 * b + fbm(x / 4, y / 4, 428, 2) * 1.2 * b, 6);
    }
  }
  // THE PEAK
  h = smax(h, peak(x, y), 50);
  // THE CRAG on its top: a flat-topped block of rock, its sides sheer, its edge ragged
  {
    const dx = x - PEAK[0];
    const dy = y - PEAK[1];
    const r = Math.hypot(dx, dy);
    const th = Math.atan2(dy, dx);
    const edge = cragEdge(th);
    const top = CRAG_TOP + fbm(x / 25, y / 25, 423, 2) * 3 - Math.max(0, r - edge * 0.6) * 0.04;
    // (sheer: six metres down for every one out, the cliff's foot falling away into the peak's own slopes)
    const cl = top - Math.max(0, r - edge) * 4.2 - Math.max(0, r - edge - 20) * 2.5 + (1 - Math.abs(noise(th * 40, r / 30, 425) * 2 - 1)) * 6 * sstep(0, 10, r - edge);
    h = Math.max(h, cl);
  }
  // A LESSER PEAK off to the left, behind
  h = smax(h, mountain(x, y, [-1500, 3400], 820, 640, 430), 80);
  // THE FAR RANGES behind, across the whole of the sky's foot
  {
    const ridge = 1050 + fbm(x / 1400, 0.5, 440, 3) * 500 + (1 - Math.abs(noise(x / 520, 1.5, 441) * 2 - 1)) * 260;
    const far = ridge * Math.exp(-Math.pow((y - 7600) / 1500, 2)) + fbm(x / 300, y / 300, 442, 3) * 60 * sstep(5500, 7000, y);
    h = smax(h, far, 120);
  }
  return h;
}

// =============================================================================================
// THE ROAD: from where the first box's camera stands, through the foothills to the peak's foot, then back and forth up
// its face, each leg shorter than the last, to the crag; along the crag's foot and up a ledge in its cliff to the gate

export interface RoadPoint {
  /** Where (its middle), and how far along it. */
  q: V3;
  s: number;
  /** How steep the bank cut over it is (metres up for one in): a slope's, or, on the crag's ledges, a cliff's. */
  cut: number;
  /** Which way it runs, level. */
  dir: Pt;
}

/** How wide the road is, from its middle to its edge. */
export const ROAD_HALF = 3;
/** How far out from the crag's edge the road runs along its top, on the terrace built out under the wall to the gate. */
export const TERRACE = 9.5;

function buildRoad(): RoadPoint[] {
  // THE APPROACH across the foothills, smoothed through its keys, a point every two metres; its height the land's under
  // it, smoothed
  const keys: Pt[] = [[60, 330], [170, 420], [245, 462], [300, 477], [345, 488], [410, 515], [480, 570], [560, 680], [640, 820], [700, 930]];
  const xy: Pt[] = [];
  for (let i = 0; i < keys.length - 1; i++) {
    const p0 = keys[Math.max(0, i - 1)];
    const p1 = keys[i];
    const p2 = keys[i + 1];
    const p3 = keys[Math.min(keys.length - 1, i + 2)];
    const n = Math.max(2, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 2));
    for (let j = 0; j < n; j++) {
      const u = j / n;
      const u2 = u * u;
      const u3 = u2 * u;
      const c = (a: number, b: number, cc: number, d: number): number => 0.5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u2 + (-a + 3 * b - 3 * cc + d) * u3);
      xy.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  xy.push(keys[keys.length - 1]);
  let zs = xy.map(([x, y]) => natural(x, y));
  for (let pass = 0; pass < 3; pass++) {
    zs = zs.map((_, i) => {
      let t = 0;
      let n = 0;
      for (let j = Math.max(0, i - 15); j <= Math.min(zs.length - 1, i + 15); j++) {
        t += zs[j];
        n++;
      }
      return t / n;
    });
  }
  const pts: V3[] = xy.map(([x, y], i) => [x, y, zs[i]]);
  // THE LEGS up the face, back and forth between its two near ridges, each climbing steadily: at every point the road is
  // where the land is at the height it has climbed to, so that it runs in round the gullies and out round the spurs, as a
  // road on a mountain is laid along it
  const face = Math.atan2(-PEAK[1], -PEAK[0]);
  const onFace = (th: number, z: number): V3 => {
    // (out from the top along the angle, to where the land comes down to that height)
    let lo = CRAG_R + 20;
    let hi = 2600;
    for (let k = 0; k < 30; k++) {
      const m = (lo + hi) / 2;
      if (natural(PEAK[0] + Math.cos(th) * m, PEAK[1] + Math.sin(th) * m) > z) lo = m;
      else hi = m;
    }
    const r = (lo + hi) / 2;
    return [PEAK[0] + Math.cos(th) * r, PEAK[1] + Math.sin(th) * r, z];
  };
  const LEGS = 8;
  const zFoot = 150;
  const zTop = SHOULDER - 40;
  const ends = [face - 0.55, face + 0.5];
  // (from the foothills up to where the first leg begins, climbing)
  {
    const st = onFace(ends[0], zFoot);
    const last = pts[pts.length - 1];
    const n = Math.max(2, Math.round(Math.hypot(st[0] - last[0], st[1] - last[1]) / 2));
    for (let j = 1; j < n; j++) {
      const u = j / n;
      const x = last[0] + (st[0] - last[0]) * u;
      const y = last[1] + (st[1] - last[1]) * u;
      pts.push([x, y, Math.max(last[2] + (st[2] - last[2]) * u, natural(x, y) * 0 + last[2] + (st[2] - last[2]) * u)]);
    }
  }
  for (let L = 0; L < LEGS; L++) {
    const from = ends[L % 2];
    const to = ends[(L + 1) % 2];
    // (the higher, the less far round: the peak narrows)
    const k = 1 - 0.25 * (L / LEGS);
    const fa = face + (from - face) * k;
    const ta = face + (to - face) * k;
    const za = zFoot + ((zTop - zFoot) * L) / LEGS;
    const zb = zFoot + ((zTop - zFoot) * (L + 1)) / LEGS;
    const n = 160;
    for (let j = L === 0 ? 0 : 1; j <= n; j++) {
      const u = j / n;
      pts.push(onFace(fa + (ta - fa) * u, za + (zb - za) * u));
    }
  }
  // THE LAST: up the crag's cliff to the gate, on a ledge cut into the cliff, winding once round the crag and a little more,
  // climbing steadily as a wagon can (a metre in six), to come back round over where it began and in at the gate
  const ledgeFrom = pts.length;
  {
    const last = pts[pts.length - 1];
    const th0 = Math.atan2(last[1] - PEAK[1], last[0] - PEAK[0]);
    const z0 = last[2];
    let target = face + 0.8;
    while (target < th0 + Math.PI * 2) target += Math.PI * 2;
    // (how far out from the crag's edge its cliff is at a height: four metres up for one out at first, then steeper)
    const cliffOut = (z: number): number => (z >= CRAG_TOP - 84 ? (CRAG_TOP - z) / 4.2 : 20 + (CRAG_TOP - 84 - z) / 6.7);
    // (the last fifty metres level, along a terrace built out from the crag's top under its wall, past the gatehouse's
    // towers, to the gate; then a turn in at the gate)
    const level = 50 / (CRAG_R + 10);
    const n = Math.round(((target - th0) * (CRAG_R + 30)) / 2);
    for (let j = 1; j <= n; j++) {
      const u = j / n;
      const a = th0 + (target - th0) * u;
      const zz = z0 + (CRAG_TOP - z0) * clamp01((a - th0) / (target - level - th0));
      // (cut a metre into the cliff where it stands at that height; near the top, out on the terrace)
      // (the crag's edge as the land has it, its angle taken round to the half turn either way)
      const r = cragEdge(Math.atan2(Math.sin(a), Math.cos(a))) + Math.max(TERRACE, cliffOut(zz) - 1);
      pts.push([PEAK[0] + Math.cos(a) * r, PEAK[1] + Math.sin(a) * r, zz]);
    }
    // (and in through the gate)
    const a = Math.atan2(Math.sin(target), Math.cos(target));
    for (let j = 1; j <= 2; j++) {
      const r = cragEdge(a) + TERRACE - j * 3;
      pts.push([PEAK[0] + Math.cos(a) * r, PEAK[1] + Math.sin(a) * r, CRAG_TOP]);
    }
    for (let j = 1; j <= 6; j++) {
      const r = cragEdge(a) + 1.5 - j * 4;
      pts.push([PEAK[0] + Math.cos(a) * r, PEAK[1] + Math.sin(a) * r, CRAG_TOP]);
    }
  }
  // (smoothed a little, across and in its height)
  const sm = pts.map((_, i) => {
    let x = 0;
    let y = 0;
    let z = 0;
    let n = 0;
    for (let j = Math.max(0, i - 2); j <= Math.min(pts.length - 1, i + 2); j++) {
      x += pts[j][0];
      y += pts[j][1];
      z += pts[j][2];
      n++;
    }
    return [x / n, y / n, z / n] as V3;
  });
  const out: RoadPoint[] = [];
  let s = 0;
  for (let i = 0; i < sm.length; i++) {
    if (i > 0) s += Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1], sm[i][2] - sm[i - 1][2]);
    const a = sm[Math.max(0, i - 1)];
    const b = sm[Math.min(sm.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    out.push({ q: sm[i], s, dir: [(b[0] - a[0]) / l, (b[1] - a[1]) / l], cut: i >= ledgeFrom - 3 ? 9 : 1.5 });
  }
  return out;
}

/** The road's segments, sorted into squares of the land, that what is near a place is found quickly. */
const BUCKET = 25;
class RoadIndex {
  readonly pts: RoadPoint[];
  private readonly cells = new Map<number, number[]>();
  constructor(pts: RoadPoint[]) {
    this.pts = pts;
    const reach = ROAD_HALF + 30;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i].q;
      const b = pts[i + 1].q;
      const x0 = Math.floor((Math.min(a[0], b[0]) - reach) / BUCKET);
      const x1 = Math.floor((Math.max(a[0], b[0]) + reach) / BUCKET);
      const y0 = Math.floor((Math.min(a[1], b[1]) - reach) / BUCKET);
      const y1 = Math.floor((Math.max(a[1], b[1]) + reach) / BUCKET);
      for (let gy = y0; gy <= y1; gy++) {
        for (let gx = x0; gx <= x1; gx++) {
          const k = gx * 100003 + gy;
          const l = this.cells.get(k);
          if (l) l.push(i);
          else this.cells.set(k, [i]);
        }
      }
    }
  }
  /** The nearest of the road to (x, y), if within 30 m of its edge: how far from its middle, its height there, how far along, which side (1 left of its way, -1 right). */
  near(x: number, y: number): { d: number; z: number; s: number; side: number; i: number } | null {
    const l = this.cells.get(Math.floor(x / BUCKET) * 100003 + Math.floor(y / BUCKET));
    if (!l) return null;
    let best: { d: number; z: number; s: number; side: number; i: number } | null = null;
    for (const i of l) {
      const a = this.pts[i];
      const b = this.pts[i + 1];
      const ex = b.q[0] - a.q[0];
      const ey = b.q[1] - a.q[1];
      const ll = ex * ex + ey * ey || 1;
      const u = clamp01(((x - a.q[0]) * ex + (y - a.q[1]) * ey) / ll);
      const px = a.q[0] + ex * u;
      const py = a.q[1] + ey * u;
      const d = Math.hypot(x - px, y - py);
      if (!best || d < best.d) {
        const cr = ex * (y - a.q[1]) - ey * (x - a.q[0]);
        best = { d, z: a.q[2] + (b.q[2] - a.q[2]) * u, s: a.s + (b.s - a.s) * u, side: cr >= 0 ? 1 : -1, i };
      }
    }
    return best;
  }
}

/** The land's height with the road cut into it: flat across the road; above it a cut bank, below it a wall. */
function carved(x: number, y: number, ri: RoadIndex): number {
  const h = natural(x, y);
  const n = ri.near(x, y);
  if (!n) return h;
  const out = n.d - ROAD_HALF;
  if (out <= 0) return n.z + 0.05 * Math.cos((n.d / ROAD_HALF) * Math.PI * 0.5);
  if (out > 28) return h;
  // (the cut bank rises a metre and a half for every one out, steepening, then gives way to the slope; the wall drops five)
  const rp = ri.pts[n.i];
  const cut = rp.cut;
  const bank = n.z + out * cut + Math.max(0, out - 8) ** 2 * 0.6;
  const z = Math.min(Math.max(h, n.z - out * 5 - Math.max(0, out - 6) ** 2 * 0.6), bank);
  // (on the crag's ledge and its terrace, the side toward the crag is built up level with it to the cliff: no gap between)
  if (cut > 2 && out < 14 && Math.hypot(x - PEAK[0], y - PEAK[1]) < Math.hypot(rp.q[0] - PEAK[0], rp.q[1] - PEAK[1]) - ROAD_HALF) return Math.max(z, n.z);
  return z;
}

// =============================================================================================
// THE GRIDS: the carved heights kept, fine near the road's start, coarse for the rest

class Grid {
  readonly h: Float32Array;
  constructor(readonly x0: number, readonly y0: number, readonly cell: number, readonly nx: number, readonly ny: number) {
    this.h = new Float32Array(nx * ny);
  }
  covers(x: number, y: number): boolean {
    const gx = (x - this.x0) / this.cell;
    const gy = (y - this.y0) / this.cell;
    return gx >= 0 && gy >= 0 && gx < this.nx - 1 && gy < this.ny - 1;
  }
  at(x: number, y: number): number {
    const gx = (x - this.x0) / this.cell;
    const gy = (y - this.y0) / this.cell;
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);
    const fx = gx - ix;
    const fy = gy - iy;
    const i = iy * this.nx + ix;
    const a = this.h[i];
    const b = this.h[i + 1];
    const c = this.h[i + this.nx];
    const d = this.h[i + this.nx + 1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
}

export class Land {
  readonly road: RoadPoint[];
  readonly index: RoadIndex;
  private grids: { near: Grid; far: Grid } | null = null;
  constructor() {
    this.road = buildRoad();
    this.index = new RoadIndex(this.road);
  }
  /** (The grids, made the first time a height is asked for.) */
  private made(): { near: Grid; far: Grid } {
    if (!this.grids) {
      const near = new Grid(-160, -20, 0.25, 1700, 1700);
      const far = new Grid(-6000, -200, 4, 3500, 3200);
      const kept = GRID_STORE?.load(landKey(), near.h.length + far.h.length);
      if (kept) {
        near.h.set(kept.subarray(0, near.h.length));
        far.h.set(kept.subarray(near.h.length));
      } else {
        for (const g of [near, far]) {
          for (let j = 0; j < g.ny; j++) {
            for (let i = 0; i < g.nx; i++) g.h[j * g.nx + i] = carved(g.x0 + i * g.cell, g.y0 + j * g.cell, this.index);
          }
        }
        if (GRID_STORE) {
          const all = new Float32Array(near.h.length + far.h.length);
          all.set(near.h);
          all.set(far.h, near.h.length);
          GRID_STORE.save(landKey(), all);
        }
      }
      this.grids = { near, far };
    }
    return this.grids;
  }
  private fine: Grid[] = [];
  /** A fine grid of the heights round (x, y), `half` metres each way, for a camera standing there to see the road close. */
  focus(x: number, y: number, half = 150): void {
    const cell = 0.25;
    const n = Math.round((half * 2) / cell);
    const g = new Grid(Math.round(x - half), Math.round(y - half), cell, n, n);
    const key = `${landKey()}-${g.x0}-${g.y0}-${n}`;
    const kept = GRID_STORE?.load(key, n * n);
    if (kept) g.h.set(kept);
    else {
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) g.h[j * n + i] = carved(g.x0 + i * cell, g.y0 + j * cell, this.index);
      GRID_STORE?.save(key, g.h);
    }
    this.fine.push(g);
  }
  /** The height at (x, y). */
  height(x: number, y: number): number {
    for (const f of this.fine) if (f.covers(x, y)) return f.at(x, y);
    const g = this.made();
    if (g.near.covers(x, y)) return g.near.at(x, y);
    if (g.far.covers(x, y)) return g.far.at(x, y);
    return natural(x, y);
  }
  /** The height at (x, y), found afresh, without the grids. */
  exact(x: number, y: number): number {
    return carved(x, y, this.index);
  }
  /** Which way the land faces at (x, y). */
  normal(x: number, y: number, e: number): V3 {
    const hx = this.height(x + e, y) - this.height(x - e, y);
    const hy = this.height(x, y + e) - this.height(x, y - e);
    return unit([-hx, -hy, 2 * e]);
  }
  /** A place on the road, `s` metres along it. */
  along(s: number): RoadPoint {
    let lo = 0;
    let hi = this.road.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (this.road[m].s < s) lo = m;
      else hi = m;
    }
    const a = this.road[lo];
    const b = this.road[hi];
    const u = clamp01((s - a.s) / Math.max(1e-6, b.s - a.s));
    return { q: [a.q[0] + (b.q[0] - a.q[0]) * u, a.q[1] + (b.q[1] - a.q[1]) * u, a.q[2] + (b.q[2] - a.q[2]) * u], s, dir: a.dir, cut: a.cut };
  }
}
/** (For the tools that paint the opening outside the game: somewhere to keep the grids between runs, by what made them.) */
export interface GridStore {
  load(key: string, n: number): Float32Array | null;
  save(key: string, h: Float32Array): void;
}
let GRID_STORE: GridStore | null = null;
export function keepGrids(s: GridStore): void {
  GRID_STORE = s;
}
/** What the land is made by, as a short name: changes whenever any of its makers does. */
function landKey(): string {
  const src = [natural, peak, mountain, buildRoad, carved, cragEdge].map((f) => f.toString()).join('|') + JSON.stringify([PEAK, CRAG_R, CRAG_TOP, SHOULDER, ROAD_HALF, BLUFF]);
  let h = 2166136261;
  for (let i = 0; i < src.length; i++) h = Math.imul(h ^ src.charCodeAt(i), 16777619) >>> 0;
  return h.toString(16);
}
let LAND: Land | null = null;
/** The land, built once. */
export function theLand(): Land {
  if (!LAND) LAND = new Land();
  return LAND;
}

// =============================================================================================
// A CAMERA in the land: where it stands, which way it looks (level), how far its picture's plane is (F, in pixels), where
// the middle of its picture is across, and where its eye's level is down it. Its picture is a shifted lens's: what stands
// upright stands upright in it.

export interface LandCam {
  pos: V3;
  yaw: number;
  F: number;
  cx: number;
  hy: number;
  /** How far it is tipped up to look (radians; none, a shifted lens's picture, by default): then what stands upright leans in toward the top. */
  pitch?: number;
}

/** A camera's axes: ahead (as it is tipped), across to its right, up its picture. */
function axes(c: LandCam): { f: V3; r: V3; u: V3 } {
  const cs = Math.cos(c.yaw);
  const sn = Math.sin(c.yaw);
  const cp = Math.cos(c.pitch ?? 0);
  const sp = Math.sin(c.pitch ?? 0);
  return { f: [-sn * cp, cs * cp, sp], r: [cs, sn, 0], u: [sn * sp, -cs * sp, cp] };
}

/** Where a place is seen in the picture, and how far ahead of the camera it is. */
export function seenAt(c: LandCam, q: V3): [number, number, number] {
  const { f, r, u } = axes(c);
  const d: V3 = [q[0] - c.pos[0], q[1] - c.pos[1], q[2] - c.pos[2]];
  const fw = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
  const ax = (d[0] * r[0] + d[1] * r[1]) / fw;
  const az = (d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) / fw;
  return [c.cx + c.F * ax, c.hy - c.F * az, fw];
}
/** A camera for a thing sculpted (art/sdf.ts) standing at `q`, `u` metres to its unit, seen exactly as this camera sees the
 * land (in its perspective, tipped as it is): the camera, and how far the figure must be moved (Figure.moveBy) for it. */
export function figView(c: LandCam, q: V3, u: number): { cam: { look: V3; up: V3; scale: number; ox: number; oy: number; persp: number }; shift: V3 } {
  const { f, u: U } = axes(c);
  const d: V3 = [q[0] - c.pos[0], q[1] - c.pos[1], q[2] - c.pos[2]];
  const D = Math.max(1, d[0] * f[0] + d[1] * f[1] + d[2] * f[2]);
  // (the figure's own origin is put on the camera's line, as far off as the thing is; the thing moved off it to where it is)
  const o: V3 = [c.pos[0] + f[0] * D, c.pos[1] + f[1] * D, c.pos[2] + f[2] * D];
  return {
    cam: { look: f, up: U, scale: c.F / D * u, ox: c.cx, oy: c.hy, persp: D / u },
    shift: [(q[0] - o[0]) / u, (q[1] - o[1]) / u, (q[2] - o[2]) / u],
  };
}

/** A camera for a thing sculpted (art/sdf.ts) standing at `q`, `u` metres to its unit, seen from this camera, exactly
 * (figView: the figure seen moved to where it stands). */
export function figCam(c: LandCam, q: V3, u: number): { look: V3; up: V3; scale: number; ox: number; oy: number; persp: number; shift: V3 } {
  const v = figView(c, q, u);
  return { ...v.cam, shift: v.shift };
}

// =============================================================================================
// THE LAND PAINTED

/** The rock's tones, shadow to light; the sun's rim on it; snow; the road's dust and its lip; the wall's stones; the near
 * ground's scrub. */
const ROCK = ['#07060d', '#0e0b1b', '#151126', '#1d1833', '#272040', '#33294e', '#433460'];
const RIM = ['#5a3a50', '#8e5a5c', '#c4785e', '#f0a070'];
const SNOW = ['#2e2a4c', '#4a4270', '#6e6290', '#a08cb0', '#d4b0c4', '#f4d0cc'];
const DUST = ['#1e1a2e', '#2a2238', '#3c3048', '#54445c', '#6e5a70'];
const LIP = '#9a7a82';
const CAP = ['#1e1830', '#2c2240', '#4a3a56', '#6e5868', '#9a7a82'];
const STONE = ['#0a0814', '#141022', '#1e1830', '#2c2240'];
const SCRUB = ['#08080f', '#0e0f1a', '#141726', '#1b2032', '#252b40'];

/** Which way the sun is, low behind the peak. */
export const SUN: V3 = unit([0.53, 1, 0.3]);

const rgb = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const ROCK_RGB = ROCK.map(rgb);
const RIM_RGB = RIM.map(rgb);
const SNOW_RGB = SNOW.map(rgb);
const DUST_RGB = DUST.map(rgb);
const STONE_RGB = STONE.map(rgb);
const SCRUB_RGB = SCRUB.map(rgb);
const LIP_RGB = rgb(LIP);
const CAP_RGB = CAP.map(rgb);
const INK_RGB = rgb('#07060d');
const HAZE_RGB = rgb('#3a2850');

/** A scatter of points over the ground, one in each cell `s` metres across: how far (x, y) is from the nearest, how far
 * from the next nearest (where the two are nearly equal is the crack between two stones), and the nearest's own number
 * (0..1); where the nearest is. */
function cells(x: number, y: number, s: number, seed: number): [number, number, number, number, number] {
  const gx = Math.floor(x / s);
  const gy = Math.floor(y / s);
  let d1 = 1e9;
  let d2 = 1e9;
  let id = 0;
  let cx0 = 0;
  let cy0 = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = gx + i;
      const cy = gy + j;
      const px = (cx + 0.1 + 0.8 * hash(cx, cy, seed)) * s;
      const py = (cy + 0.1 + 0.8 * hash(cx, cy, seed + 1)) * s;
      const d = Math.hypot(x - px, y - py);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = hash(cx, cy, seed + 2);
        cx0 = px;
        cy0 = py;
      } else if (d < d2) d2 = d;
    }
  }
  return [d1, d2, id, cx0, cy0];
}

/** A tone of `tones` for a light `v` (0..1) at (x, y): the band it falls in, the next band's dots laid over it near its top. */
function toned(tones: [number, number, number][], v: number, x: number, y: number): [number, number, number] {
  const f = clamp01(v) * (tones.length - 1);
  const k = Math.min(tones.length - 1, Math.floor(f));
  const fr = f - k;
  return k < tones.length - 1 && fr > 0.55 && dot(x, y, (fr - 0.55) / 0.45, 3) ? tones[k + 1] : tones[k];
}

/** What a box's camera sees of the land, painted over `p` (its sky already there, which the haze takes its colour from):
 * how far off each pixel's land is (Infinity where it is sky). */
/** A light in the land besides the evening's: a fire, where, its colour, how far its light reaches, how strong. */
export interface LandLight {
  at: V3;
  color: string;
  reach: number;
  k: number;
}

export function paintLand(p: Px, c: LandCam, opts: { haze?: number; snowLine?: number; lights?: LandLight[] } = {}): Float32Array {
  const land = theLand();
  const W = p.w;
  const H = p.h;
  const depth = new Float32Array(W * H).fill(Infinity);
  const nrm = new Float32Array(W * H * 3);
  const what = new Uint8Array(W * H);
  const zs = new Float32Array(W * H);
  const curv = new Float32Array(W * H);
  const wx = new Float32Array(W * H);
  const wy = new Float32Array(W * H);
  const rdist = new Float32Array(W * H);
  const { f: AF, r: AR, u: AU } = axes(c);
  const snowLine = opts.snowLine ?? 1250;
  const hazeK = opts.haze ?? 1;
  for (let sy = 0; sy < H; sy++) {
    for (let sx = 0; sx < W; sx++) {
      // (the ray: forward one metre, across and up by where the pixel is)
      const ax = (sx + 0.5 - c.cx) / c.F;
      const ay = (c.hy - sy - 0.5) / c.F;
      const dx = AF[0] + AR[0] * ax + AU[0] * ay;
      const dy = AF[1] + AR[1] * ax + AU[1] * ay;
      const az = AF[2] + AU[2] * ay;
      let t = 1.5;
      let prev = t;
      let hit = false;
      for (let it = 0; it < 900; it++) {
        const x = c.pos[0] + dx * t;
        const y = c.pos[1] + dy * t;
        const z = c.pos[2] + az * t;
        if (z > 2000 && az >= 0) break;
        if (t > 14000) break;
        const h = land.height(x, y);
        const gap = z - h;
        if (gap <= 0) {
          // (found: narrowed down between the last step and this)
          let lo = prev;
          let hi = t;
          for (let k = 0; k < 7; k++) {
            const m = (lo + hi) / 2;
            if (c.pos[2] + az * m <= land.height(c.pos[0] + dx * m, c.pos[1] + dy * m)) hi = m;
            else lo = m;
          }
          t = hi;
          hit = true;
          break;
        }
        prev = t;
        t += Math.max(gap * 0.22, t * 0.0012 + 0.01);
      }
      if (!hit) continue;
      const i = sy * W + sx;
      const x = c.pos[0] + dx * t;
      const y = c.pos[1] + dy * t;
      depth[i] = t;
      zs[i] = c.pos[2] + az * t;
      const e = Math.max(0.12, t * 0.0016);
      const n = land.normal(x, y, e);
      {
        const ec = e * 4;
        const h0 = land.height(x, y);
        const lap = (land.height(x + ec, y) + land.height(x - ec, y) + land.height(x, y + ec) + land.height(x, y - ec) - 4 * h0) / ec;
        curv[i] = Math.max(-0.3, Math.min(0.3, -lap * 0.9));
      }
      nrm[i * 3] = n[0];
      nrm[i * 3 + 1] = n[1];
      nrm[i * 3 + 2] = n[2];
      // what it is: the road, its lip, the wall under it, the cut bank over it; snow; scrub; rock
      const r = land.index.near(x, y);
      let kd = 0;
      wx[i] = x;
      wy[i] = y;
      rdist[i] = r ? r.d : 99;
      // (the lip only on its downhill side, where the wall's cap is; on its uphill side the dust runs into the ditch)
      if (r && r.d <= ROAD_HALF + 0.15) kd = r.d > ROAD_HALF - 0.45 && zs[i] > r.z - 0.3 && natural(x, y) < r.z - 0.3 ? 2 : 1;
      else if (r && r.d < ROAD_HALF + 2.5 && zs[i] < r.z - 0.4) kd = 3;
      else if (zs[i] > snowLine + fbm(x / 60, y / 60, 451, 2) * 90 && zs[i] < CRAG_TOP - 60 && n[2] > 0.5 + fbm(x / 20, y / 20, 452, 2) * 0.15) kd = 4;
      else if (t < 900 && zs[i] < 420 && n[2] > 0.72) kd = 5;
      what[i] = kd;
    }
  }
  // COLOURED: lit by the sun low behind the peak and the evening sky over it; inked where a nearer slope stands before a
  // further one; hazed by how far off
  const out = p.d;
  for (let sy = 0; sy < H; sy++) {
    for (let sx = 0; sx < W; sx++) {
      const i = sy * W + sx;
      const t = depth[i];
      if (t === Infinity) continue;
      const n: V3 = [nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]];
      const sun = Math.max(0, n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2]);
      // (the evening sky's light from up on the left, and the ridges standing out of the gullies)
      const sky = 0.22 + 0.3 * n[2] + 0.7 * Math.max(0, -0.7 * n[0] - 0.3 * n[1] + 0.5 * n[2]) + curv[i] * 1.4;
      const kd = what[i];
      let col: [number, number, number];
      // (the edge: is the pixel above, or beside, much further off? then this is a slope's top against what is behind)
      const above = sy > 0 ? depth[i - W] : Infinity;
      const left = sx > 0 ? depth[i - 1] : t;
      const right = sx < W - 1 ? depth[i + 1] : t;
      const edge = above > t * 1.12 + 3 || left > t * 1.25 + 5 || right > t * 1.25 + 5;
      const rimRow = sy > 1 && depth[i - 2 * W] > t * 1.12 + 3;
      // (how big a pixel is there, in metres: close to, the land shows its stones)
      const px = t / c.F;
      if (kd === 1) {
        // (the road's dust, patchy, darker where it is churned; the two ruts worn in it by the wheels, wandering a little;
        // close to, stones and pebbles half sunk in it, each lit on its far side and dark on its near)
        const rutD = Math.abs(rdist[i] - 1.1 - fbm(wx[i] / 7, wy[i] / 7, 468, 1) * 0.18);
        const rut = rutD < 0.26 && t < 300;
        const v = 0.25 + sky * 0.35 + sun * 0.9 + fbm(wx[i] / 3, wy[i] / 3, 466, 2) * 0.09 + (noise(wx[i] * 1.5, wy[i] * 1.5, 461) - 0.5) * 0.12 - (rut ? 0.2 : 0);
        col = toned(DUST_RGB, v, sx, sy);
        if (px < 0.05 && rutD > 0.2) {
          const [d1, , id, cx0, cy0] = cells(wx[i], wy[i], 0.6, 469);
          const r = 0.03 + (id - 0.7) * (id - 0.7) * 1.1;
          if (id > 0.7 && d1 < r && r > px * 1.6) {
            const tcx = c.pos[0] - cx0;
            const tcy = c.pos[1] - cy0;
            const nearSide = ((wx[i] - cx0) * tcx + (wy[i] - cy0) * tcy) / (Math.hypot(tcx, tcy) * r);
            col = nearSide > 0.35 ? DUST_RGB[0] : nearSide < -0.3 ? DUST_RGB[3] : DUST_RGB[2];
          } else if (id > 0.7 && d1 < r * 1.35 && r > px * 1.6) {
            // (its shadow on the dust, on its near side)
            const tcx = c.pos[0] - cx0;
            const tcy = c.pos[1] - cy0;
            if (((wx[i] - cx0) * tcx + (wy[i] - cy0) * tcy) / Math.hypot(tcx, tcy) > 0) col = DUST_RGB[Math.max(0, DUST_RGB.indexOf(col) - 1)] ?? DUST_RGB[0];
          }
        }
      }
      else if (kd === 2) {
        // (the wall's cap along the road's edge: from afar a pale line; close to, its stones, rough, with dark joints)
        if (px < 0.1) {
          const [d1, d2, id] = cells(wx[i], wy[i], 0.75, 471);
          col = d2 - d1 < Math.max(0.05, px * 1.3) ? STONE_RGB[0] : toned(CAP_RGB, 0.3 + sky * 0.25 + sun * 0.5 + (id - 0.5) * 0.5 + fbm(wx[i] * 3, wy[i] * 3, 472, 1) * 0.08, sx, sy);
        } else col = LIP_RGB;
      }
      else if (kd === 3) {
        // (the wall's stones in courses, laid by hand: each course its own height, the stones along it their own lengths,
        // their joints dark)
        const zc = zs[i] + fbm(wx[i] / 5, wy[i] / 5, 464, 1) * 0.15;
        const course = Math.floor(zc * 2.2);
        const [d1, d2, id] = cells(wx[i] + course * 0.37, wy[i] - course * 0.29, 0.55, 463 + (course & 7));
        const joint = Math.abs(zc * 2.2 - course) < Math.max(0.12, px * 2.2) || d2 - d1 < Math.max(0.05, px * 1.2);
        col = joint ? STONE_RGB[0] : toned(STONE_RGB, 0.3 + sky * 0.3 + sun * 0.8 + (id - 0.5) * 0.35, sx, sy);
      } else if (kd === 4) col = toned(SNOW_RGB, 0.15 + sky * 0.35 + sun * 1.1, sx, sy);
      else if (kd === 5) col = toned(SCRUB_RGB, 0.15 + sky * 0.45 + sun * 0.7 + (noise(sx / 2, sy / 2, 465) - 0.5) * 0.25, sx, sy);
      else if (px < 0.25) {
        // THE ROCK CLOSE TO: where it stands steep, in its beds, one over another, each a metre or three thick, its lip
        // standing out over the shadow under it; split down through each bed into blocks by joints, the blocks of one bed
        // not over those of the next; each block its own tone; where it lies flatter, broken into stones and rubble
        const near = clamp01((0.25 - px) / 0.12);
        const steep = clamp01((0.82 - n[2]) / 0.3);
        // (its beds: each its own thickness, dipping a little and waving; their lips broken, standing out here and not there)
        const zb = zs[i] + fbm(wx[i] / 14, wy[i] / 14, 501, 2) * 2.6 + wx[i] * 0.035 - wy[i] * 0.02;
        const b0 = Math.floor(zb / 2.4);
        const edges = [b0 - 1, b0, b0 + 1, b0 + 2].map((k) => k * 2.4 + (hash(k, 0, 502) - 0.5) * 1.9);
        let bed = b0;
        for (let k = 0; k < 3; k++) if (zb >= edges[k] && zb < edges[k + 1]) bed = b0 - 1 + k;
        const lo = edges[bed - b0 + 1];
        const hi = edges[bed - b0 + 2];
        const fbz = (zb - lo) / Math.max(0.3, hi - lo);
        const along = (n[0] * wy[i] - n[1] * wx[i]) / Math.max(0.2, Math.hypot(n[0], n[1]));
        const lipOut = noise(along / 3.5, bed * 3.1, 506) > 0.42;
        // (its joints: great cracks running down through the beds, jogging a little from one to the next; finer ones between)
        const [d1, d2, id] = cells(wx[i] + bed * 0.35, wy[i] - bed * 0.25, steep > 0.5 ? 4.6 : 1.4, 503);
        const [e1, e2] = cells(wx[i] - bed * 0.6, wy[i] + bed * 0.8, 1.5, 507 + (bed & 7));
        const crack = d2 - d1 < Math.max(0.07, px * 1.4) * (1 + steep * 0.6);
        const fine = steep > 0.4 && e2 - e1 < Math.max(0.03, px * 0.9) && noise(along / 2, zs[i] / 2, 508) > 0.5;
        const under = steep > 0.4 && lipOut && (zb - lo) < Math.max(0.12, px * 1.8);
        const lipTop = steep > 0.4 && lipOut && (hi - zb) < Math.max(0.08, px * 1.2);
        // (its stains: streaks run down it from the lips, darker)
        const stain = steep > 0.4 ? clamp01((noise(along * 1.1, zs[i] * 0.06, 509) - 0.55) * 3) * (1 - fbz) * 0.12 : 0;
        let v = 0.08 + sky * 0.45 + sun * 0.6 + (noise(sx / 4, sy / 3, 467) - 0.5) * 0.1;
        v += ((id - 0.5) * 0.12 + fbm(along * 0.8 + zs[i] * 0.3, zs[i] * 0.9, 505, 3) * 0.1 - stain) * near;
        col = toned(ROCK_RGB, v + (lipTop ? 0.14 * near : 0), sx, sy);
        if (near > 0.3 && (crack || under)) col = ROCK_RGB[crack && under ? 0 : 1];
        else if (near > 0.5 && fine) col = ROCK_RGB[Math.max(1, ROCK_RGB.indexOf(col) - 1)];
      } else col = toned(ROCK_RGB, 0.08 + sky * 0.45 + sun * 0.6 + (noise(sx / 4, sy / 3, 467) - 0.5) * 0.1, sx, sy);
      // (the sun's rim on what turns to it: the ridges' sun-ward sides, the tops of slopes against what is behind)
      // (close to, only its edges: the rest of a face turned to the sun keeps its stone, warmed)
      const nearPx = t / c.F < 0.25 && kd !== 4;
      if (kd !== 1 && kd !== 3 && sun > 0.3 && (!nearPx || edge || rimRow)) col = toned(RIM_RGB, Math.min(0.5, (sun - 0.3) * 1.1) + (edge || rimRow ? 0.45 : 0), sx, sy);
      else if (kd !== 1 && kd !== 3 && sun > 0.3) col = [col[0] * 0.75 + RIM_RGB[0][0] * 0.25, col[1] * 0.75 + RIM_RGB[0][1] * 0.25, col[2] * 0.75 + RIM_RGB[0][2] * 0.25];
      else if ((edge || rimRow) && sun > 0.12 && kd !== 3) col = RIM_RGB[0];
      if (edge && !(sun > 0.3)) col = t > 2200 ? [col[0] * 0.55, col[1] * 0.55, col[2] * 0.6] : INK_RGB;
      // (a fire's light on what faces it, in bands, near it)
      for (const L of opts.lights ?? []) {
        const lx = L.at[0] - wx[i];
        const ly = L.at[1] - wy[i];
        const lz = L.at[2] - zs[i];
        const dd = Math.hypot(lx, ly, lz);
        if (dd > L.reach) continue;
        const face = Math.max(0, (n[0] * lx + n[1] * ly + n[2] * lz) / dd) * 0.7 + 0.3;
        const a = (1 - dd / L.reach) ** 2 * L.k * face;
        const st = Math.floor(a * 4 + (dot(sx, sy, (a * 4) % 1, 3) ? 1 : 0)) / 4;
        if (st <= 0) continue;
        const lc = rgb(L.color);
        col = [col[0] + (lc[0] - col[0]) * Math.min(0.85, st), col[1] + (lc[1] - col[1]) * Math.min(0.85, st), col[2] + (lc[2] - col[2]) * Math.min(0.85, st)];
      }
      // (the haze of the evening, more of it the further off; it takes the colour of the sky behind)
      const j = i * 4;
      const hz = clamp01((1 - Math.exp(-t / 6500)) * 1.05 * hazeK) * 0.75;
      const sr = out[j] * 0.35 + HAZE_RGB[0] * 0.65;
      const sg = out[j + 1] * 0.35 + HAZE_RGB[1] * 0.65;
      const sb = out[j + 2] * 0.35 + HAZE_RGB[2] * 0.65;
      // (stepped, as the comic's tones are: the haze comes in bands)
      const hs = Math.round(hz * 6) / 6;
      out[j] = col[0] + (sr - col[0]) * hs;
      out[j + 1] = col[1] + (sg - col[1]) * hs;
      out[j + 2] = col[2] + (sb - col[2]) * hs;
      out[j + 3] = 255;
    }
  }
  // (the near ground: tufts of grass standing up out of it, dark, their tips caught by the light)
  for (let sy = 0; sy < H; sy++) {
    for (let sx = 0; sx < W; sx++) {
      const i = sy * W + sx;
      const t = depth[i];
      if (t > 70 || what[i] !== 5 || hash(sx, sy, 491) > 0.05 + 0.1 * clamp01(1 - t / 40)) continue;
      const tall = Math.max(2, Math.round((0.5 + hash(sx, sy, 492) * 0.7) * c.F / t));
      const lean = hash(sx, sy, 493) - 0.5;
      for (let k = 0; k < tall; k++) {
        const yy = sy - k;
        const xx = Math.round(sx + lean * k * 0.6);
        if (yy < 0 || xx < 0 || xx >= W || depth[yy * W + xx] < t - 1 || (what[yy * W + xx] >= 1 && what[yy * W + xx] <= 3)) continue;
        const j = (yy * W + xx) * 4;
        const cc = k === tall - 1 ? RIM_RGB[0] : k > tall * 0.6 ? SCRUB_RGB[3] : SCRUB_RGB[1];
        out[j] = cc[0];
        out[j + 1] = cc[1];
        out[j + 2] = cc[2];
      }
    }
  }
  return depth;
}

/** A dark pine seen `t` metres off at (x, y) (its foot), `hp` pixels high: a crooked spike of drooping boughs. Kept off
 * what stands before it by `depth`. */
export function paintFarPine(p: Px, depth: Float32Array, x: number, y: number, hp: number, t: number, seed: number, col: string, rim: string | null): void {
  const X = Math.round(x);
  const Y = Math.round(y);
  if (X < 0 || X >= p.w || Y < 1 || Y >= p.h + hp) return;
  const fy = Math.min(p.h - 1, Y);
  if (depth[fy * p.w + X] < t - Math.max(4, t * 0.01)) return;
  const h = Math.max(2, Math.round(hp));
  for (let k = 0; k < h; k++) {
    const yy = Y - k;
    if (yy < 0 || yy >= p.h) continue;
    const u = k / h;
    // (its width: widest low down, a spike at the top, ragged where its boughs end)
    const w = Math.max(0, (1 - u) * h * 0.22 * (0.75 + 0.5 * hash(k >> 1, seed, 471)) - 0.2);
    const half = Math.round(w);
    for (let dx = -half; dx <= half; dx++) {
      const xx = X + dx;
      if (xx < 0 || xx >= p.w) continue;
      if (depth[yy * p.w + xx] < t - Math.max(4, t * 0.01)) continue;
      p.set(xx, yy, rim && dx === half && half > 0 ? rim : col);
    }
  }
}
