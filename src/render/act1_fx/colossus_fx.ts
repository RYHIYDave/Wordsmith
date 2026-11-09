// THE SWAMP COLOSSUS'S FIGHT: WHAT THE GAME DRAWS ROUND HIS PICTURES (the art chat's README, stages 3 to 5: “The waves, the crash, the
// warnings, cracks, chunks, goo and ichor are yours to draw”; its films draw them as the game would, and these follow them). His rule for
// everything drawn: “Everything drawn should not just look like shapes.  That’s the rule”: every edge ragged and moving, nothing ruled.
// Nothing cyan (the friend's); the warnings the enemy's pink flaring to its gold.
//   ON THE STONE (under the hero): where a slam lands, the stone split along its line and slabs tipped up (faded by 7 s); the slime
//     it leaves as it is dragged back (fading from 1.2 s, gone 3.2 s after); the stone wet where a wave has passed; his bile's pools
//     (ragged, bubbling, burning at the edge, smoking); where his gaze swept, the stone scorched and smouldering (fading in 3 s); the
//     rings on the water round him and his tentacles where they break it, and a water slam's rings.
//   OVER IT (over the hero): each wave, a wall of black water rolling across, its crest breaking white, spray off it, foam spilling
//     at its foot; the crash where two meet, a plume of white water and the foam it leaves; the chunks of paving flung up by a slam,
//     tumbling, bouncing twice, gone by 3.2 s; its goo flung and splatting, soaked away by 1.4 s; a water slam's crown; his glob of bile
//     in flight, its splash's gobs; his gaze's beam and the fire along it.
// Each slam, smash and splash is kept here from the frame it is first seen (by the fight's clock), so that what it leaves lasts after
// the rules have done with it.

import { BODY2, CHANGE3, CRASH, EYE3, EYE_SLAM, GAZE, HIS_PLACE, RAIN, ROOTS, SLAM, SMASH, STONE, WAKE, WAVE, poolR, rootAt, waveFront } from '../../game/colossus_fight';
import type { ColossusFight, Seg } from '../../game/colossus_fight';
import type { ColossusOn } from '../../game/act1_rules/colossus';
import type { Game } from '../../game/game';

/** Game pixels up for each tile of height (the art's lengths: 39.19 to a tile, two picture pixels to a game pixel). */
const UP = 19.6;
const C = {
  water: [14, 22, 18] as const,
  deep: [8, 14, 11] as const,
  wave: [22, 36, 30] as const,
  lit: [58, 82, 70] as const,
  foam: ['#5a6a60', '#8e9c92', '#c4cec4', '#e8eee6'] as const,
  stone: ['#2a2830', '#3c3944', '#57525e', '#77717e'] as const,
  crack: '#141218',
  goo: ['#1c2412', '#2e3a1c', '#4a5a2a', '#6e7c3a'] as const,
  slime: 'rgba(70, 92, 44, ',
  bile: ['#0c0c06', '#25270c', '#4a4e14', '#7a7c1e', '#b4ac34'] as const,
  burn: ['#c0206a', '#ff4f8a', '#ffb070', '#fff0a0'] as const,
  beam: ['#7a1058', '#c0206a', '#ff4f8a', '#ffb070', '#fff0a0', '#fffbe8'] as const,
  scorch: 'rgba(24, 12, 16, ',
};

/** A hash of numbers, 0 to 1. */
function h(a: number, b = 0, c = 0): number {
  let x = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647)) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
/** Smooth noise along `x`, 0 to 1. */
function n1(x: number, s: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return h(i, s) * (1 - u) + h(i + 1, s) * u;
}

interface Slam {
  key: number;
  at: number;
  line: Seg;
  root: { u: number; v: number };
  seed: number;
  /** When it was dragged back (the slime laid). */
  drag: number;
}
interface Smash {
  key: number;
  at: number;
  u: number;
  v: number;
  seed: number;
}
interface Splash {
  key: number;
  at: number;
  u: number;
  v: number;
  seed: number;
}
interface Scorch {
  key: number;
  at: number;
  o: { u: number; v: number };
  a0: number;
  a1: number;
  /** How far round it has swept (degrees), and when the sweep ended. */
  to: number;
  done: number;
}
/** What is kept of the fight here: its slams, water slams, splashes and scorches, and the stone wet where each wave has been. */
/** The one begun at `start` (the fight's clock) of `who` among `list`, if kept (a frame's clock wavering a little). */
const kept = <T extends { key: number; at: number }>(list: T[], who: number, start: number, by: number): T | undefined => list.find((q) => q.key === who && Math.abs(q.at - by - start) < 0.05);
const KEPT = {
  fight: null as ColossusFight | null,
  slams: [] as Slam[],
  smashes: [] as Smash[],
  splashes: [] as Splash[],
  scorches: [] as Scorch[],
  wet: [] as { from: 'l' | 'r'; at: number; meets: boolean }[],
  /** (Phase 3) Where his eye came down, where the bolts struck, and when he gripped the stone's edge (the fight's clock). */
  eyeSlams: [] as Splash[],
  bolts: [] as Splash[],
  grip: Infinity,
};

/** Where a point of the stone (tiles) is on the screen, at the water's height. */
export type StoneAt = (u: number, v: number) => readonly [number, number];

/** What the fight leaves, looked at once a frame (before either drawing). */
export function keepColossusFx(f: ColossusFight): void {
  if (KEPT.fight !== f) {
    KEPT.fight = f;
    KEPT.slams = [];
    KEPT.smashes = [];
    KEPT.splashes = [];
    KEPT.scorches = [];
    KEPT.wet = [];
    KEPT.eyeSlams = [];
    KEPT.bolts = [];
    KEPT.grip = Infinity;
  }
  const now = f.time;
  for (const a of f.arms) {
    if (a.state === 'slam' && a.line && a.t >= SLAM.hit) {
      let s = kept(KEPT.slams, a.id, now - a.t, SLAM.hit);
      if (!s) {
        s = { key: a.id, at: now - (a.t - SLAM.hit), line: a.line, root: rootAt(a.u), seed: Math.round(now * 7) * 97 + a.id * 13, drag: Infinity };
        KEPT.slams.push(s);
      }
      if (a.t >= SLAM.lying[1] - 0.55 && s.drag === Infinity) s.drag = now;
    }
    if (a.state === 'smash' && a.t >= SMASH.hit) {
      if (!kept(KEPT.smashes, a.id, now - a.t, SMASH.hit)) KEPT.smashes.push({ key: a.id, at: now - (a.t - SMASH.hit), u: a.side === 'l' ? -1.79 : STONE.w + 1.79, v: 1.53, seed: Math.round(now * 7) * 31 + a.id });
    }
  }
  for (const w of f.waves) if (!KEPT.wet.some((q) => q.from === w.from && Math.abs(q.at - (now - w.t)) < 0.05)) KEPT.wet.push({ from: w.from, at: now - w.t, meets: w.meets });
  const B = f.body2;
  if (B && B.kind === 'bile' && B.landed && !kept(KEPT.splashes, 0, now - B.t, BODY2.bile.land)) KEPT.splashes.push({ key: 0, at: now - (B.t - BODY2.bile.land), u: B.at.u, v: B.at.v, seed: Math.round(now * 7) * 53 + 7 });
  const E = f.eye ?? (B && B.kind === 'gaze' ? B : null);
  if (E && E.kind === 'gaze' && E.t >= GAZE.warn) {
    let s = kept(KEPT.scorches, 0, now - E.t, GAZE.warn);
    if (!s) {
      s = { key: 0, at: now - (E.t - GAZE.warn), o: E.at, a0: E.a0, a1: E.a1, to: E.a0, done: Infinity };
      KEPT.scorches.push(s);
    }
    const k = Math.min(1, (E.t - GAZE.warn) / GAZE.sweep);
    s.to = E.a0 + (E.a1 - E.a0) * k;
    if (k >= 1 && s.done === Infinity) s.done = now;
  }
  // (phase 3: his eye slammed down; the bolts struck; his grip on the stone's edge)
  const E3 = f.eye;
  if (E3 && E3.kind === 'slam' && E3.landed && !kept(KEPT.eyeSlams, 0, now - E3.t, EYE_SLAM.hit)) KEPT.eyeSlams.push({ key: 0, at: now - (E3.t - EYE_SLAM.hit), u: E3.at.u, v: E3.at.v, seed: Math.round(now * 7) * 41 + 3 });
  for (const r of f.rains) if (r.t >= RAIN.warn && !KEPT.bolts.some((q) => q.u === r.u && q.v === r.v && Math.abs(q.at - (now - (r.t - RAIN.warn))) < 0.05)) KEPT.bolts.push({ key: 0, at: now - (r.t - RAIN.warn), u: r.u, v: r.v, seed: Math.round(now * 13) * 17 + KEPT.bolts.length });
  if (f.ph === 2 && f.mode === 'change' && f.phT >= CHANGE3.grip && KEPT.grip === Infinity) KEPT.grip = now - (f.phT - CHANGE3.grip);
  KEPT.eyeSlams = KEPT.eyeSlams.filter((s) => now - s.at < 6);
  KEPT.bolts = KEPT.bolts.filter((s) => now - s.at < 2.4);
  KEPT.slams = KEPT.slams.filter((s) => now - s.at < 7.2);
  KEPT.smashes = KEPT.smashes.filter((s) => now - s.at < 3);
  KEPT.splashes = KEPT.splashes.filter((s) => now - s.at < 1.6);
  KEPT.scorches = KEPT.scorches.filter((s) => s.done === Infinity || now - s.done < GAZE.long + 3.2);
  KEPT.wet = KEPT.wet.filter((w) => now - w.at < 8);
}

// ---------------------------------------------------------------------------------------------------
// ON THE STONE

/** What lies on the stone and the water under the hero. */
const sm2 = (a: number, b: number, x: number): number => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

export function drawColossusGround(g: CanvasRenderingContext2D, P: StoneAt, f: ColossusFight, t: number): void {
  const now = f.time;
  // HIS WAKING (WAKE): bubbles coming up where his two tentacles will burst and over his eye, a few and then a boil, after the water has
  // lain still a moment; going on a little as they burst
  if (f.ph === 1 && (f.wakeT !== null || f.phT < WAKE.rise + 0.8) && f.mode === 'fight') {
    const w = f.wakeT ?? WAKE.rise + (f.phT - WAKE.rise);
    const k = sm2(WAKE.still, WAKE.rise, w) * (1 - sm2(WAKE.rise, WAKE.rise + 0.8, w));
    if (k > 0) {
      const spots: [number, number, number][] = [...ROOTS[1].map((u, i): [number, number, number] => [rootAt(u).u, rootAt(u).v, i]), [HIS_PLACE.u, HIS_PLACE.v + 3.2, 2], [HIS_PLACE.u - 2, HIS_PLACE.v + 2.4, 3], [HIS_PLACE.u + 2, HIS_PLACE.v + 2.4, 4]];
      for (const [su, sv, si] of spots) {
        const R = 0.25 + 1.0 * k;
        const n = Math.round(2 + 16 * k);
        // (the boil: the water heaving pale over the spot)
        if (k > 0.55) {
          const b = (k - 0.55) / 0.45;
          g.globalAlpha = 0.22 * b;
          g.fillStyle = C.foam[1];
          g.beginPath();
          for (let i = 0; i <= 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            const r = R * 0.8 * (0.7 + 0.5 * n1(i * 0.8 + t * 2.5, si * 13 + 5));
            const [x, y] = P(su + Math.cos(a) * r, sv + Math.sin(a) * r * 0.9);
            if (i === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          g.closePath();
          g.fill();
        }
        for (let i = 0; i < n; i++) {
          const per = 0.55 + 0.6 * h(si, i, 31);
          const ph = (t / per + h(si, i, 32)) % 1;
          const cyc = Math.floor(t / per + h(si, i, 32));
          const a = h(si, i, cyc) * Math.PI * 2;
          const d = R * Math.sqrt(h(si, i, cyc + 7));
          const [x, y] = P(su + Math.cos(a) * d, sv + Math.sin(a) * d);
          if (ph < 0.82) {
            // (swelling as it comes up)
            const r = 0.6 + 2.2 * (ph / 0.82) * (0.6 + 0.6 * h(si, i, 33));
            g.globalAlpha = 0.85;
            g.strokeStyle = i % 3 ? C.foam[2] : C.foam[3];
            g.lineWidth = 1;
            g.beginPath();
            g.ellipse(Math.round(x) + 0.5, Math.round(y) + 0.5, r, r * 0.7, 0, 0, Math.PI * 2);
            g.stroke();
            g.globalAlpha = 0.6;
            g.fillStyle = C.foam[3];
            g.fillRect(Math.round(x - r * 0.4), Math.round(y - r * 0.4), 1, 1);
          } else {
            // (popped: a few drops flung up)
            const q = (ph - 0.82) / 0.18;
            g.globalAlpha = 0.8 * (1 - q);
            g.fillStyle = C.foam[2];
            for (let j = 0; j < 3; j++) {
              const aj = (j / 3) * Math.PI * 2 + a;
              g.fillRect(Math.round(x + Math.cos(aj) * 3 * q), Math.round(y - 4 * q + 6 * q * q + Math.sin(aj) * 1.5 * q), 1, 1);
            }
          }
        }
      }
      g.globalAlpha = 1;
    }
  }
  // THE STONE WET where a wave has passed, darker and sheened, drying from its far side
  for (const w of KEPT.wet) {
    const s = now - w.at;
    for (let v = 0; v <= STONE.d; v += 1) {
      const front = waveFront(w.from, s, v + 0.5);
      const dry = Math.max(0, 1 - (s - 1.5) / 4);
      if (dry <= 0) continue;
      const u0 = w.from === 'l' ? Math.max(0, Math.min(STONE.w, front - 3.2)) : Math.max(0, Math.min(STONE.w, front + 3.2));
      const u1 = w.from === 'l' ? Math.max(0, Math.min(w.meets ? STONE.w / 2 : STONE.w, front - WAVE.face)) : Math.max(w.meets ? STONE.w / 2 : 0, Math.min(STONE.w, front + WAVE.face));
      if (Math.abs(u1 - u0) < 0.05) continue;
      quad(g, P, u0, v, u1, v + 1, `rgba(10, 18, 16, ${0.28 * dry})`);
    }
  }
  // THE SLAMS: the stone split along each line, slabs tipped up; the slime dragged along it
  for (const s of KEPT.slams) {
    const age = now - s.at;
    const a = Math.max(0, 1 - Math.max(0, age - 4) / 3);
    const L = s.line;
    const len = Math.hypot(L.b.u - L.a.u, L.b.v - L.a.v) || 1;
    const du = (L.b.u - L.a.u) / len;
    const dv = (L.b.v - L.a.v) / len;
    const nu = -dv;
    const nv = du;
    // (its split, wandering along the line, branching)
    g.save();
    g.globalAlpha = a;
    g.strokeStyle = C.crack;
    g.lineWidth = 1;
    for (let side = -1; side <= 1; side += 2) {
      g.beginPath();
      for (let i = 0; i <= 40; i++) {
        const k = i / 40;
        const off = side * 0.18 + (n1(k * 9, s.seed + side) - 0.5) * 0.5;
        const [x, y] = P(L.a.u + du * len * k + nu * off, L.a.v + dv * len * k + nv * off);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    for (let b = 0; b < 9; b++) {
      const k = h(s.seed, b, 1);
      const side = h(s.seed, b, 2) < 0.5 ? -1 : 1;
      const l = 0.5 + h(s.seed, b, 3) * 1.1;
      const u0 = L.a.u + du * len * k;
      const v0 = L.a.v + dv * len * k;
      const [x0, y0] = P(u0, v0);
      const [x1, y1] = P(u0 + (nu * side + du * (h(s.seed, b, 4) - 0.5)) * l, v0 + (nv * side + dv * (h(s.seed, b, 4) - 0.5)) * l);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo((x0 + x1) / 2 + (h(s.seed, b, 5) - 0.5) * 3, (y0 + y1) / 2 + (h(s.seed, b, 6) - 0.5) * 2);
      g.lineTo(x1, y1);
      g.stroke();
    }
    // (slabs tipped up along it: a lit edge and a dark face)
    for (let i = 0; i < 7; i++) {
      const k = 0.08 + 0.84 * h(s.seed, i, 7);
      const side = h(s.seed, i, 8) < 0.5 ? -1 : 1;
      const [x, y] = P(L.a.u + du * len * k + nu * side * 0.45, L.a.v + dv * len * k + nv * side * 0.45);
      const w = 3 + 3 * h(s.seed, i, 9);
      const up = Math.min(1, age / 0.08) * (2 + 2 * h(s.seed, i, 10));
      g.fillStyle = C.stone[0];
      g.fillRect(Math.round(x - w / 2), Math.round(y - up), Math.round(w), Math.round(up + 1));
      g.fillStyle = C.stone[3];
      g.fillRect(Math.round(x - w / 2), Math.round(y - up - 1), Math.round(w), 1);
    }
    g.restore();
    // (the slime it leaves as it is dragged back: laid along the line from its tip, fading from 1.2 s, gone 3.2 s after)
    if (s.drag < Infinity) {
      const sa = now - s.drag;
      const fade = sa < 1.2 ? 1 : Math.max(0, 1 - (sa - 1.2) / 2);
      if (fade > 0) {
        for (let i = 0; i < 26; i++) {
          const k = i / 25;
          const wob = (n1(k * 7 + 3, s.seed + 9) - 0.5) * 0.35;
          const [x, y] = P(L.a.u + du * len * k + nu * wob, L.a.v + dv * len * k + nv * wob);
          const r = 2.2 + 2.5 * n1(k * 5, s.seed + 11);
          g.fillStyle = `${C.slime}${(0.5 * fade).toFixed(3)})`;
          g.beginPath();
          g.ellipse(x, y, r * 1.6, r * 0.7, 0, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
  }
  // HIS BILE'S POOLS: ragged, bubbling, burning at the edge, smoking
  for (const p of f.pools) {
    const r = poolR(p.t);
    if (r <= 0.05) continue;
    const seed = Math.round(p.u * 31 + p.v * 17);
    const edge = (a: number): number => r * (0.84 + 0.24 * n1(a * 3 + p.t * 0.6, seed) + 0.06 * Math.sin(a * 5 + p.t * 2));
    const ring = (k: number, fill: string): void => {
      g.fillStyle = fill;
      g.beginPath();
      for (let i = 0; i <= 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        const [x, y] = P(p.u + Math.cos(a) * edge(a) * k, p.v + Math.sin(a) * edge(a) * k);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
    };
    ring(1.08, `rgba(255, 79, 138, ${0.35 + 0.15 * Math.sin(t * 11 + seed)})`);
    ring(1.0, C.bile[1]);
    ring(0.82, C.bile[2]);
    ring(0.5, C.bile[3]);
    // (bubbles welling and bursting)
    for (let i = 0; i < 9; i++) {
      const life = (t * 1.3 + h(seed, i)) % 1;
      const a = h(seed, i, 2) * Math.PI * 2;
      const d = Math.sqrt(h(seed, i, 3)) * r * 0.75;
      const [x, y] = P(p.u + Math.cos(a) * d, p.v + Math.sin(a) * d);
      g.strokeStyle = life > 0.85 ? C.burn[2] : C.bile[4];
      g.lineWidth = 1;
      g.beginPath();
      g.arc(x, y - life * 1.5, 0.8 + life * 1.8, 0, Math.PI * 2);
      g.stroke();
    }
    // (its smoke rising)
    for (let i = 0; i < 5; i++) {
      const life = (t * 0.5 + h(seed, i, 5)) % 1;
      const [x, y] = P(p.u + (h(seed, i, 6) - 0.5) * r, p.v + (h(seed, i, 7) - 0.5) * r);
      g.fillStyle = `rgba(40, 36, 30, ${0.3 * (1 - life)})`;
      g.beginPath();
      g.arc(x + Math.sin(life * 6 + i) * 3, y - life * 26, 3 + life * 5, 0, Math.PI * 2);
      g.fill();
    }
  }
  // HIS GAZE'S SCORCH: the stone burnt where the beam passed, smouldering, cooling, fading
  for (const s of KEPT.scorches) {
    const cool = s.done === Infinity ? 0 : Math.max(0, now - s.done - GAZE.long + GAZE.warn + GAZE.sweep);
    const a = Math.max(0, 1 - cool / 3);
    if (a <= 0) continue;
    const lo = Math.min(s.a0, s.to);
    const hi = Math.max(s.a0, s.to);
    for (let d = lo; d <= hi; d += 1.5) {
      const r = (d * Math.PI) / 180;
      for (let k = 0; k < 14; k++) {
        const far = 4.3 + k * 0.9;
        const u = s.o.u + Math.sin(r) * far;
        const v = s.o.v + Math.cos(r) * far;
        if (u < 0 || u > STONE.w || v < 0 || v > STONE.d) continue;
        const [x, y] = P(u, v);
        const w = (GAZE.width / 2) * 22 * (0.6 + 0.5 * n1(far * 2 + d * 0.3, 41));
        g.fillStyle = `${C.scorch}${(0.12 * a).toFixed(3)})`;
        g.fillRect(Math.round(x - w / 2), Math.round(y - 2), Math.round(w), 4);
        if (h(Math.round(d * 10), k, 3) < 0.08 * a) {
          g.fillStyle = h(Math.round(d * 10), k, 4) < 0.5 ? C.burn[1] : C.burn[2];
          g.fillRect(Math.round(x + (h(Math.round(d), k) - 0.5) * w), Math.round(y - 1), 1, 1);
        }
      }
    }
  }
  // THE WATER SLAMS' RINGS on the water off the stone's end
  for (const s of KEPT.smashes) {
    const age = now - s.at;
    for (let r = 0; r < 4; r++) {
      const ra = 0.6 + age * (2.2 + r * 0.8);
      const al = Math.max(0, 1 - age / (1.4 + r * 0.4));
      if (al <= 0) continue;
      brokenEllipse(g, P, s.u, s.v, ra, al, s.seed + r, C.foam[2]);
    }
  }
}

/** A ring on the water round (u, v), `r` tiles, broken by noise. */
function brokenEllipse(g: CanvasRenderingContext2D, P: StoneAt, u: number, v: number, r: number, a: number, seed: number, col: string): void {
  g.save();
  g.globalAlpha = a;
  g.fillStyle = col;
  const n = Math.max(16, Math.round(r * 14));
  for (let i = 0; i < n; i++) {
    const k = i / n;
    if (n1(k * 11, seed) < 0.42) continue;
    const ang = k * Math.PI * 2;
    const [x, y] = P(u + Math.cos(ang) * r, v + Math.sin(ang) * r);
    g.fillRect(Math.round(x), Math.round(y), 2, 1);
  }
  g.restore();
}

/** A quad of the stone from (u0, v0) to (u1, v1). */
function quad(g: CanvasRenderingContext2D, P: StoneAt, u0: number, v0: number, u1: number, v1: number, fill: string): void {
  const a = P(u0, v0);
  const b = P(u1, v0);
  const c = P(u1, v1);
  const d = P(u0, v1);
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.lineTo(c[0], c[1]);
  g.lineTo(d[0], d[1]);
  g.closePath();
  g.fill();
}

/** The rings on the water round him and his standing tentacles where they break it (his own rings, as the art's films have them): from
 *  `ru` across and `rv` deep (tiles) out, further apart further out, each broken. */
export function drawColossusRings(g: CanvasRenderingContext2D, P: StoneAt, at: { u: number; v: number }, ru: number, rv: number, t: number, seed: number, strong = 1): void {
  for (let r = 0; r < 5; r++) {
    const u = (t / 1.5 + r / 5) % 1;
    const grow = 0.6 + 3 * u ** 1.35;
    const a = (1 - u) * Math.min(1, u * 12) * 0.5 * strong;
    if (a <= 0.02) continue;
    g.save();
    g.globalAlpha = a;
    g.fillStyle = u < 0.3 ? C.foam[2] : C.foam[1];
    const s = seed + r * 7 + Math.floor(t / 1.5 + r / 5) * 3;
    const n = Math.round((ru + rv + grow * 2) * 10);
    for (let i = 0; i < n; i++) {
      const k = i / n;
      if (n1(k * 13, s) < 0.45) continue;
      const ang = k * Math.PI * 2;
      const [x, y] = P(at.u + Math.cos(ang) * (ru + grow), at.v + Math.sin(ang) * (rv + grow * 0.6));
      g.fillRect(Math.round(x), Math.round(y), 2, 1);
    }
    g.restore();
  }
}

// ---------------------------------------------------------------------------------------------------
// OVER IT

/** What flies and rolls over the hero. */
export function drawColossusAir(g: CanvasRenderingContext2D, P: StoneAt, f: ColossusFight, t: number, eye3: readonly [number, number] | null = null): void {
  const now = f.time;
  // THE WAVES: each a wall of black water, tallest at the back, its crest breaking white
  for (const w of f.waves) waveWall(g, P, w.from, w.t, w.meets, t);
  // THE CRASH: a plume of white water where they meet, falling back into foam that spreads over the stone and drains away
  if (f.crash) crashPlume(g, P, f.crash.t, t);
  // THE SLAMS' CHUNKS AND GOO, flung up, tumbling, bouncing, splatting
  for (const s of KEPT.slams) {
    const age = now - s.at;
    if (age > 3.3) continue;
    const L = s.line;
    for (let i = 0; i < 34; i++) {
      const k = h(s.seed, i, 21);
      const u0 = L.a.u + (L.b.u - L.a.u) * k;
      const v0 = L.a.v + (L.b.v - L.a.v) * k;
      const ang = h(s.seed, i, 22) * Math.PI * 2;
      const sp = 0.8 + 2.4 * h(s.seed, i, 23);
      const vz = 2.5 + 4 * h(s.seed, i, 24);
      const p = bounce(age, vz);
      const go = Math.min(age, p.flat);
      const u = u0 + Math.cos(ang) * sp * go * 0.8;
      const v = v0 + Math.sin(ang) * sp * go * 0.8;
      if (age > 3.2 - h(s.seed, i, 25) * 0.6) continue;
      const [x, y] = P(u, v);
      const sz = 1 + Math.round(2 * h(s.seed, i, 26));
      g.fillStyle = C.stone[0];
      g.fillRect(Math.round(x - sz / 2) - 1, Math.round(y - p.z * UP) - 1, sz + 2, sz + 1);
      g.fillStyle = C.stone[2 + (i % 2)];
      g.fillRect(Math.round(x - sz / 2), Math.round(y - p.z * UP) - 1, sz, sz);
    }
    for (let i = 0; i < 52; i++) {
      const k = h(s.seed, i, 31);
      const u0 = L.a.u + (L.b.u - L.a.u) * k;
      const v0 = L.a.v + (L.b.v - L.a.v) * k;
      const ang = h(s.seed, i, 32) * Math.PI * 2;
      const sp = 0.6 + 2.2 * h(s.seed, i, 33);
      const vz = 2 + 4.5 * h(s.seed, i, 34);
      const flight = (2 * vz) / 9.8;
      const string = i >= 40;
      if (age < flight) {
        const z = vz * age - 4.9 * age * age;
        const [x, y] = P(u0 + Math.cos(ang) * sp * age, v0 + Math.sin(ang) * sp * age);
        g.fillStyle = C.goo[2 + (i % 2)];
        if (string) g.fillRect(Math.round(x) - 1, Math.round(y - z * UP), 1, 4);
        else g.fillRect(Math.round(x) - 1, Math.round(y - z * UP) - 1, 2, 2);
      } else if (age < flight + 1.4) {
        // (splatted where it came down, soaking away)
        const a = 1 - (age - flight) / 1.4;
        const [x, y] = P(u0 + Math.cos(ang) * sp * flight, v0 + Math.sin(ang) * sp * flight);
        g.fillStyle = `rgba(46, 58, 28, ${(0.85 * a).toFixed(3)})`;
        g.beginPath();
        g.ellipse(x, y, string ? 4 : 2.5, string ? 1.2 : 1.1, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  // THE WATER SLAMS' CROWNS, thrown up off the stone's end
  for (const s of KEPT.smashes) {
    const age = now - s.at;
    if (age > 1.2) continue;
    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * Math.PI * 2 + h(s.seed, i) * 0.2;
      const sp = 1.2 + 1.6 * h(s.seed, i, 2);
      const vz = 4 + 5 * h(s.seed, i, 3);
      const z = vz * age - 4.9 * age * age;
      if (z < 0) continue;
      const [x, y] = P(s.u + Math.cos(ang) * sp * age, s.v + Math.sin(ang) * sp * age * 0.6);
      g.fillStyle = C.foam[2 + (i % 2)];
      g.fillRect(Math.round(x), Math.round(y - z * UP), 2, 2);
    }
  }
  // HIS GLOB OF BILE IN FLIGHT, and its splash's gobs
  const B = f.body2;
  if (B && B.kind === 'bile' && B.t >= BODY2.bile.release && B.t < BODY2.bile.land) {
    const L = BODY2.bile;
    const throat = { u: 7.79, v: -7.14 };
    const s = (B.t - L.release) / (L.land - L.release);
    const at = (q: number): [number, number] => {
      const [x, y] = P(throat.u + (B.at.u - throat.u) * q, throat.v + (B.at.v - throat.v) * q);
      return [x, y - (1 + 5.1 * 4 * q * (1 - q) + (1 - q) * 0) * UP + q * UP];
    };
    const [gx, gy] = at(s);
    // (strings trailing behind it)
    g.strokeStyle = C.bile[2];
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 0; i <= 6; i++) {
      const [x, y] = at(Math.max(0, s - i * 0.03));
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x + Math.sin(i + t * 20) * 1.5, y);
    }
    g.stroke();
    for (let i = 0; i < 10; i++) {
      const a = h(9, i) * Math.PI * 2 + t * 6;
      const d = 2 + 4 * h(9, i, 2);
      g.fillStyle = C.bile[i % 3 === 0 ? 0 : i % 3 === 1 ? 2 : 3];
      g.beginPath();
      g.arc(gx + Math.cos(a) * d, gy + Math.sin(a) * d * 0.8, 2.5 + 2 * h(9, i, 3), 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = C.bile[4];
    g.fillRect(Math.round(gx - 2), Math.round(gy - 3), 2, 1);
  }
  for (const s of KEPT.splashes) {
    const age = now - s.at;
    for (let i = 0; i < 24; i++) {
      const ang = h(s.seed, i) * Math.PI * 2;
      const sp = 1 + 2.4 * h(s.seed, i, 2);
      const vz = 2 + 4 * h(s.seed, i, 3);
      const flight = (2 * vz) / 9.8;
      if (age < flight) {
        const z = vz * age - 4.9 * age * age;
        const [x, y] = P(s.u + Math.cos(ang) * sp * age, s.v + Math.sin(ang) * sp * age);
        g.fillStyle = C.bile[2 + (i % 3)];
        g.fillRect(Math.round(x) - 1, Math.round(y - z * UP) - 1, 3, 2);
      } else if (age < flight + 1.0) {
        const a = 1 - (age - flight);
        const [x, y] = P(s.u + Math.cos(ang) * sp * flight, s.v + Math.sin(ang) * sp * flight);
        g.fillStyle = `rgba(74, 78, 20, ${(0.8 * a).toFixed(3)})`;
        g.beginPath();
        g.ellipse(x, y, 3, 1.3, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  // HIS GAZE'S BEAM: from his eye down onto the stone and along its line, burning
  const E = f.eye ?? (B && B.kind === 'gaze' ? B : null);
  if (E && E.kind === 'gaze' && E.t >= GAZE.warn && E.t < GAZE.warn + GAZE.sweep + 0.3) {
    const k = Math.min(1, (E.t - GAZE.warn) / GAZE.sweep);
    const gut = Math.max(0, 1 - Math.max(0, E.t - GAZE.warn - GAZE.sweep) / 0.3);
    const deg = E.a0 + (E.a1 - E.a0) * k;
    const r = (deg * Math.PI) / 180;
    // (from his eye: phase 3's where its picture has it glowing; phase 2's high over the water under it)
    const [ex0, ey0] = P(E.at.u, E.at.v);
    const ex = f.ph === 3 && eye3 ? eye3[0] : ex0;
    const ey = f.ph === 3 && eye3 ? eye3[1] : ey0 - (f.ph === 3 ? 2.2 : 5.2) * UP;
    // (where it comes onto the stone, and on along it to where it leaves)
    let land = 0;
    for (let d = 0; d < 20; d += 0.25) {
      const u = E.at.u + Math.sin(r) * d;
      const v = E.at.v + Math.cos(r) * d;
      if (v >= 0 && u >= 0 && u <= STONE.w) {
        land = d;
        break;
      }
    }
    let end = land;
    for (let d = land; d < 22; d += 0.25) {
      const u = E.at.u + Math.sin(r) * d;
      const v = E.at.v + Math.cos(r) * d;
      if (v > STONE.d || u < 0 || u > STONE.w) break;
      end = d;
    }
    const [lx, ly] = P(E.at.u + Math.sin(r) * land, E.at.v + Math.cos(r) * land);
    const [fx, fy] = P(E.at.u + Math.sin(r) * end, E.at.v + Math.cos(r) * end);
    // (down from his eye, widening to where it comes onto the stone; along the stone 0.9 tiles wide; each a glow round a white heart)
    const lu = E.at.u + Math.sin(r) * land;
    const lv = E.at.v + Math.cos(r) * land;
    const fu = E.at.u + Math.sin(r) * end;
    const fv = E.at.v + Math.cos(r) * end;
    const nu = Math.cos(r);
    const nv = -Math.sin(r);
    for (const [k, col, al] of [[1.5, C.beam[0], 0.3], [1.0, C.beam[2], 0.55], [0.55, C.beam[3], 0.8], [0.22, C.beam[5], 1]] as const) {
      const flick = 0.9 + 0.2 * Math.sin(t * 37 + k * 9);
      const half = (GAZE.width / 2) * k * flick;
      g.fillStyle = col;
      g.globalAlpha = al * gut;
      const a0 = P(lu + nu * half, lv + nv * half);
      const a1 = P(fu + nu * half, fv + nv * half);
      const b1 = P(fu - nu * half, fv - nv * half);
      const b0 = P(lu - nu * half, lv - nv * half);
      g.beginPath();
      g.moveTo(a0[0], a0[1]);
      g.lineTo(a1[0], a1[1]);
      g.lineTo(b1[0], b1[1]);
      g.lineTo(b0[0], b0[1]);
      g.closePath();
      g.fill();
      const wEye = 2.5 * k * 2 * flick;
      const wLand = Math.max(wEye, Math.abs(a0[0] - b0[0]) / 2 + 2);
      g.beginPath();
      g.moveTo(ex - wEye, ey);
      g.lineTo(ex + wEye, ey);
      g.lineTo(lx + wLand, ly);
      g.lineTo(lx - wLand, ly);
      g.closePath();
      g.fill();
    }
    g.globalAlpha = 1;
    // (the fire along its line, and sparks thrown up)
    for (let i = 0; i < 18; i++) {
      const q = i / 17;
      const x = lx + (fx - lx) * q;
      const y = ly + (fy - ly) * q;
      const fl = 3 + 5 * n1(q * 8 - t * 9, 77);
      g.fillStyle = i % 2 ? C.burn[2] : C.burn[1];
      g.globalAlpha = 0.8 * gut;
      g.fillRect(Math.round(x - 1), Math.round(y - fl), 2, Math.round(fl));
      if (h(i, Math.floor(t * 30), 3) < 0.3) {
        g.fillStyle = C.burn[3];
        g.fillRect(Math.round(x + (h(i, Math.floor(t * 30), 4) - 0.5) * 8), Math.round(y - fl - 4 * h(i, Math.floor(t * 30), 5)), 1, 1);
      }
    }
    g.globalAlpha = 1;
  }
}

/** A chunk's height (tiles) `age` seconds after it was flung up at `vz`, bouncing twice, each lower; and when it lies still. */
function bounce(age: number, vz: number): { z: number; flat: number } {
  let v = vz;
  let t = age;
  let flat = 0;
  for (let b = 0; b < 3; b++) {
    const fl = (2 * v) / 9.8;
    if (t < fl) return { z: v * t - 4.9 * t * t, flat: flat + fl };
    t -= fl;
    flat += fl;
    v *= 0.38;
  }
  return { z: 0, flat };
}

/** A wave: its wall rolling from `from`, `s` seconds after its smash; tallest at the back (1.48 tiles), 0.49 at the near edge. */
function waveWall(g: CanvasRenderingContext2D, P: StoneAt, from: 'l' | 'r', s: number, meets: boolean, t: number): void {
  const d = from === 'l' ? -1 : 1;
  const form = Math.min(1, s / 0.25);
  const crest: [number, number][] = [];
  const foot: [number, number][] = [];
  const back: [number, number][] = [];
  for (let v = -0.6; v <= STONE.d + 1.0; v += 0.25) {
    let fr0 = waveFront(from, s, Math.min(STONE.d, Math.max(0, v)));
    if (meets) fr0 = from === 'l' ? Math.min(fr0, STONE.w / 2) : Math.max(fr0, STONE.w / 2);
    const vv = Math.max(0, Math.min(STONE.d, v));
    const hi = form * (1.48 - (0.99 * vv) / STONE.d) * (0.9 + 0.2 * n1(v * 1.3 - s * 4, 5)) * (v > STONE.d ? Math.max(0, 1 - (v - STONE.d)) : 1);
    const [fx, fy] = P(fr0, v);
    const [bx, by] = P(fr0 + d * (WAVE.face + 1.2), v);
    crest.push([fx + d * 4, fy - hi * UP]);
    foot.push([fx, fy]);
    back.push([bx, by]);
  }
  // (its body: the back slope down into the water behind, the face up to the crest)
  const grd = g.createLinearGradient(0, Math.min(...crest.map((p) => p[1])), 0, Math.max(...foot.map((p) => p[1])));
  grd.addColorStop(0, `rgb(${C.lit.join(',')})`);
  grd.addColorStop(0.35, `rgb(${C.wave.join(',')})`);
  grd.addColorStop(1, `rgb(${C.deep.join(',')})`);
  g.fillStyle = grd;
  g.globalAlpha = 0.92;
  g.beginPath();
  crest.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
  for (let i = back.length - 1; i >= 0; i--) g.lineTo(back[i][0], back[i][1]);
  g.closePath();
  g.fill();
  g.beginPath();
  crest.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
  for (let i = foot.length - 1; i >= 0; i--) g.lineTo(foot[i][0], foot[i][1]);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;
  // (its face's streaks of light, running down it)
  for (let i = 0; i < crest.length; i += 2) {
    const [cx, cy] = crest[i];
    const [fx, fy] = foot[i];
    if (n1(i * 0.7 + s * 3, 9) < 0.55) continue;
    g.strokeStyle = 'rgba(120, 150, 130, 0.35)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx, cy + 2);
    g.lineTo(cx + (fx - cx) * 0.6, cy + (fy - cy) * 0.6);
    g.stroke();
  }
  // (the crest breaking white: a ragged line of foam along it, clumps on it, its curl lit under it; spray thrown up off it in a mist)
  const jit = (i: number, k: number): number => (n1(i * 0.6 + s * 5 + t * 3, k) - 0.5) * 2;
  g.strokeStyle = 'rgba(96, 128, 112, 0.7)';
  g.lineWidth = 2;
  g.beginPath();
  crest.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y + 3) : g.lineTo(x + jit(i, 21), y + 3 + jit(i, 22))));
  g.stroke();
  g.strokeStyle = C.foam[2];
  g.lineWidth = 1.5;
  g.beginPath();
  crest.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x + jit(i, 23), y + jit(i, 24))));
  g.stroke();
  for (let i = 0; i < crest.length; i++) {
    const [x, y] = crest[i];
    const k = n1(i * 0.45 + s * 6 + t * 1.5, 13);
    if (k > 0.45) {
      g.fillStyle = C.foam[k > 0.72 ? 3 : 2];
      g.beginPath();
      g.ellipse(x + jit(i, 25) * 2, y - 1, 1.5 + 2.5 * (k - 0.45), 1 + 1.5 * (k - 0.45), 0, 0, Math.PI * 2);
      g.fill();
    }
    // (spray: a mist of white off the crest, drifting back as it rolls)
    const m = n1(i * 0.3 - t * 2, 29);
    if (m > 0.55) {
      g.fillStyle = `rgba(220, 230, 222, ${(0.25 * (m - 0.55) * 2).toFixed(3)})`;
      g.beginPath();
      g.arc(x - d * 3 * m, y - 4 - 7 * m, 2 + 4 * m, 0, Math.PI * 2);
      g.fill();
    }
    for (let j = 0; j < 2; j++) {
      const q = h(i, Math.floor(t * 15) + j * 7, 31);
      if (q > 0.35) continue;
      g.fillStyle = C.foam[3];
      g.fillRect(Math.round(x + d * (2 + 6 * q) + jit(i, 33 + j) * 3), Math.round(y - 3 - 10 * h(i, Math.floor(t * 15) + j, 32)), 1, 1);
    }
  }
  // (foam spilling over the stone ahead of its foot, a lace thinning out ahead)
  for (let i = 0; i < foot.length; i++) {
    const [fx, fy] = foot[i];
    for (let j = 0; j < 3; j++) {
      const q = n1(i * 0.8 + j * 3.3 - s * 6, 41 + j);
      if (q < 0.5) continue;
      g.fillStyle = j === 0 ? C.foam[2] : C.foam[1];
      g.globalAlpha = 0.5 + 0.5 * (q - 0.5) * 2;
      g.fillRect(Math.round(fx - d * (2 + j * 4) + jit(i, 45 + j) * 2), Math.round(fy - 1 + j), 2 + Math.round(3 * q), 1);
    }
  }
  g.globalAlpha = 1;
}

/** The crash where two waves meet, `s` seconds after: a plume 5.87 tiles high (rising 0.35 s, falling 1.4 s), then its foam over the stone. */
function crashPlume(g: CanvasRenderingContext2D, P: StoneAt, s: number, t: number): void {
  const mid = { u: STONE.w / 2, v: CRASH.v };
  const rise = Math.min(1, s / 0.35);
  const fall = s > 0.35 ? Math.max(0, 1 - (s - 0.35) / 1.4) : 1;
  const hi = 5.87 * rise * (0.25 + 0.75 * fall);
  const half = 1.79 + (4.64 - 1.79) * Math.min(1, s / 1.75);
  if (fall > 0) {
    // (a column of mist, white at its heart, thinning out at its edges and top)
    const [mx, my] = P(mid.u, mid.v);
    const top = my - hi * UP;
    const wide = half * 22.6;
    const grd = g.createLinearGradient(0, top, 0, my);
    grd.addColorStop(0, 'rgba(200, 214, 204, 0)');
    grd.addColorStop(0.35, `rgba(200, 214, 204, ${(0.35 * fall).toFixed(3)})`);
    grd.addColorStop(1, `rgba(150, 170, 160, ${(0.55 * fall).toFixed(3)})`);
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(mx - wide * 0.55, my);
    for (let i = 0; i <= 12; i++) {
      const q = i / 12;
      const x = mx - wide * 0.55 + wide * 1.1 * q;
      const y = top + (1 - Math.sin(Math.PI * q)) * hi * UP * 0.8 + (n1(q * 6 + t * 3, 67) - 0.5) * 8;
      g.lineTo(x, y);
    }
    g.lineTo(mx + wide * 0.55, my);
    g.closePath();
    g.fill();
    // (water thrown up in it: drops and strings, rising then falling back)
    for (let i = 0; i < 170; i++) {
      const q = h(i, 61);
      const across = (h(i, 62) * 2 - 1) * half * (0.3 + 0.7 * q);
      const up = hi * (1 - q * q) * (0.5 + 0.5 * h(i, 63));
      const [x, y] = P(mid.u + across, mid.v + (h(i, 64) - 0.5) * 1.2);
      const yy = y - up * UP + (s > 0.35 ? (s - 0.35) * 30 * h(i, 68) : 0);
      g.fillStyle = C.foam[h(i, 66) < 0.35 ? 3 : h(i, 66) < 0.7 ? 2 : 1];
      g.globalAlpha = Math.min(1, fall * 1.6);
      if (h(i, 69) < 0.25) g.fillRect(Math.round(x), Math.round(yy), 1, 3 + Math.round(4 * h(i, 70)));
      else g.fillRect(Math.round(x + Math.sin(t * 8 + i) * 1.5), Math.round(yy), 1 + Math.round(2 * h(i, 65)), 1 + Math.round(h(i, 71) * 1.5));
    }
    g.globalAlpha = 1;
  }
  // (the foam it leaves over the stone, spreading out either side, draining away)
  if (s > CRASH.surge[0]) {
    const k = (s - CRASH.surge[0]) / (CRASH.surge[1] - CRASH.surge[0]);
    const a = Math.max(0, 1 - k);
    const spread = CRASH.half * Math.min(1, (s - CRASH.surge[0]) / 0.8);
    for (let i = 0; i < 160; i++) {
      const u = mid.u + (h(i, 71) * 2 - 1) * spread;
      const v = h(i, 72) * STONE.d;
      if (n1(u * 1.7 + v * 0.9 + s, 73) < 0.35 + 0.5 * k) continue;
      const [x, y] = P(u, v);
      g.fillStyle = C.foam[h(i, 74) < 0.3 ? 3 : 1];
      g.globalAlpha = a * 0.8;
      g.fillRect(Math.round(x), Math.round(y), 3 + Math.round(3 * h(i, 75)), 1);
    }
    g.globalAlpha = 1;
  }
}

/** For the checks: what is kept now. */
export function colossusFxKept(): { slams: number; smashes: number; splashes: number; scorches: number; wet: number } {
  return { slams: KEPT.slams.length, smashes: KEPT.smashes.length, splashes: KEPT.splashes.length, scorches: KEPT.scorches.length, wet: KEPT.wet.length };
}

// ---------------------------------------------------------------------------------------------------
// PHASE 3 (the art chat's README stage 6: “the pillars, the lines, the ward, the bolts, the warnings, the slime, the cracks, the splashes
// and the shakes are yours”): drawn as its film draws them.

/** Game pixels across and down for one of his lengths across, deep (toward the stone) and up (the art's: 39.19 to a tile, two picture
 *  pixels to a game pixel). */
const SEEN2 = 1 / Math.sqrt(3);
const DEEP2 = 1 / (2 * Math.sqrt(3));
/** His place in phase 3 from his place before (his lengths forward and up: the art's P3). */
const P3_FWD = 166;
const P3_RISE = 60;
/** A point of his own space, at his new place, on the screen (his middle at the water at his place before at `mid`). */
const his3 = (mid: readonly [number, number], p: readonly [number, number, number]): [number, number] => [mid[0] + p[0] * SEEN2, mid[1] + (p[1] + P3_FWD) * DEEP2 - (p[2] + P3_RISE) / 2];
/** Each pillar's line ends in him (his own space: deep in his left heap, his right, the foot of his left jaw: the art's PILLARS `to`). */
const PILLAR_TO: readonly (readonly [number, number, number])[] = [[-210, -20, 30], [210, -20, 30], [-150, 40, 20]];
/** Each pillar's fire this high over its foot (tiles: 151 of his lengths). */
const PILLAR_UP = 151 / 39.19;
const FIRE = ['#7a1058', '#c0206a', '#ff3d8b', '#ffb070', '#fff0a0'] as const;
const CYAN = ['#0e6f80', '#28dcf0', '#bff8ff'] as const;
const ICHOR = ['#0a0408', '#1e0a14', '#3a1020', '#5a1a2c'] as const;
const sm = (a: number, b: number, x: number): number => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

/** A flame at (x, y): ragged tongues licking up `hi` pixels, pink round a gold heart, `k` of it. */
function flame(g: CanvasRenderingContext2D, x: number, y: number, hi: number, k: number, t: number, seed: number): void {
  if (k <= 0.02) return;
  const H = hi * k;
  for (let i = 0; i < 9; i++) {
    const sx = (h(seed, i, 1) - 0.5) * 7 * k;
    const ph = t * (6 + 4 * h(seed, i, 2)) + h(seed, i, 3) * 6;
    const lick = H * (0.45 + 0.55 * n1(ph, seed + i));
    const w = Math.max(1, Math.round((2.5 - Math.abs(sx) * 0.25) * k));
    for (let j = 0; j < lick; j++) {
      const q = j / Math.max(1, lick);
      const sway = Math.sin(ph * 1.7 + q * 4) * q * 2.2;
      const col = q < 0.25 ? FIRE[4] : q < 0.5 ? FIRE[3] : q < 0.8 ? FIRE[2] : FIRE[1];
      g.globalAlpha = Math.min(1, (1 - q * 0.6) * k);
      g.fillStyle = col;
      g.fillRect(Math.round(x + sx + sway - w / 2), Math.round(y - j), Math.max(1, Math.round(w * (1 - q * 0.6))), 1);
    }
  }
  // (its glow)
  g.globalAlpha = 0.18 * k * (0.8 + 0.2 * Math.sin(t * 11 + seed));
  g.fillStyle = FIRE[2];
  g.beginPath();
  g.ellipse(x, y - H * 0.35, 9 * k + 2, 11 * k + 2, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
}

/** THE SIEGE'S MAGIC from a pillar's point into him: a wavering crackling cord of its fire, pink at its edges and gold at its heart, sagging
 *  a little, motes running along it into him; `u0` to `u1` of its way drawn. */
function siegeLine(g: CanvasRenderingContext2D, a: readonly [number, number], b: readonly [number, number], u0: number, u1: number, k: number, t: number, seed: number): void {
  if (u1 <= u0 || k <= 0.02) return;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  const n = Math.ceil(len / 2);
  for (let s = Math.floor(n * u0); s <= n * u1; s++) {
    const u = s / n;
    const sag = 9 * Math.sin(Math.PI * u);
    const wob = (n1(u * 9 + t * 5, seed) - 0.5) * 3 + (n1(u * 31 - t * 13, seed + 1) - 0.5) * 1.6;
    const x = a[0] + (b[0] - a[0]) * u + nx * wob;
    const y = a[1] + (b[1] - a[1]) * u + ny * wob + sag;
    const mote = Math.max(0, Math.sin((u * 9 - t * 3.2 + seed) * Math.PI)) ** 8;
    const flick = 0.75 + 0.25 * n1(u * 13 + t * 14, seed + 2);
    const w = (1.1 + 0.9 * mote) * flick;
    g.globalAlpha = 0.55 * k * flick;
    g.fillStyle = FIRE[1];
    g.fillRect(Math.round(x - w - 1), Math.round(y - w - 1), Math.round(2 * w + 2), Math.round(2 * w + 2));
    g.globalAlpha = k * flick;
    g.fillStyle = mote > 0.5 ? FIRE[4] : FIRE[3];
    g.fillRect(Math.round(x - w / 2), Math.round(y - w / 2), Math.max(1, Math.round(w)), Math.max(1, Math.round(w)));
  }
  g.globalAlpha = 1;
}

/** HIS WARD (while any pillar burns): a film of the siege's pink round him, its edge crawling, flashing where a blow meets it, breaking
 *  apart in shards with the last pillar. `him` draws him (body and tongue) into a canvas at a point; drawn behind him, and what it gives
 *  laid over him after. */
let WARD: HTMLCanvasElement | null = null;
export function drawColossusWard(g: CanvasRenderingContext2D, f: ColossusFight, me: ColossusOn, now: number, him: (o: CanvasRenderingContext2D, x: number, y: number) => boolean, hx: number, hy: number, eye: readonly [number, number] | null, t: number): () => void {
  const none = (): void => {};
  if (f.ph !== 3 || typeof document === 'undefined') return none;
  const breakS = me.wardOff === undefined ? -1 : f.time - me.wardOff;
  const on = f.shielded ? sm(EYE3.ward, EYE3.ward + 20 / 30, f.phT) : breakS >= 0 && breakS < 1 ? 1 - sm(4 / 30, 28 / 30, breakS) : 0;
  const flashS = me.wardHit !== undefined ? now - me.wardHit : 99;
  const flash = flashS >= 0 && flashS < 0.55 ? 1 - sm(0.1, 0.55, flashS) : 0;
  if (on <= 0.01 && !(breakS >= 0 && breakS < 1)) return none;
  const W = 460;
  const Hh = 320;
  const MX = 230;
  const MY = 110;
  if (!WARD) {
    WARD = document.createElement('canvas');
    WARD.width = W;
    WARD.height = Hh;
  }
  const o = WARD.getContext('2d', { willReadFrequently: true });
  if (!o) return none;
  o.globalCompositeOperation = 'source-over';
  o.globalAlpha = 1;
  o.clearRect(0, 0, W, Hh);
  if (!him(o, MX, MY)) return none;
  // (him over the water only, as the art's ward hugs: what is seen under it, his pink edge and a strike's after-image left out)
  const px = o.getImageData(0, 0, W, Hh);
  const a = px.data;
  for (let q = 3; q < a.length; q += 4) a[q] = a[q] >= 250 ? 255 : 0;
  o.putImageData(px, 0, 0);
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = flash > 0.3 ? '#ffb0d0' : FIRE[2];
  o.fillRect(0, 0, W, Hh);
  o.globalCompositeOperation = 'source-over';
  // (round him: his outline grown, crawling, breathing; brighter as a blow flashes on it, and failing as it breaks)
  const fail = breakS >= 0 ? (h(Math.floor(t * 24), 5) < 0.5 ? 0.4 : 1) : 1;
  for (const [r, al] of [[7, 0.1], [4.5, 0.16], [2.5, 0.26]] as const) {
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + t * 0.9 + r;
      const rr = r * (0.8 + 0.4 * n1(t * 3 + i, r * 11));
      g.globalAlpha = Math.min(1, al * on * fail * (0.85 + 0.15 * Math.sin(t * 5 + i)) + al * flash * 1.5);
      g.drawImage(WARD, Math.round(hx - MX + Math.cos(ang) * rr), Math.round(hy - MY + Math.sin(ang) * rr * 0.8));
    }
  }
  g.globalAlpha = 1;
  // (breaking: shards falling away off him)
  if (breakS >= 4 / 30 && breakS < 1.2) {
    const s = breakS - 4 / 30;
    for (let i = 0; i < 30; i++) {
      const ang = h(i, 71) * Math.PI * 2;
      const x0 = hx + Math.cos(ang) * (110 + 40 * h(i, 72));
      const y0 = hy - 40 + Math.sin(ang) * (55 + 20 * h(i, 73));
      const sp = 30 + 50 * h(i, 74);
      const x = x0 + Math.cos(ang) * sp * s;
      const y = y0 + Math.sin(ang) * sp * s * 0.6 + 60 * s * s;
      const a = Math.max(0, 1 - s / 1.05);
      if (a <= 0) continue;
      const sz = 2 + Math.round(3 * h(i, 75));
      g.globalAlpha = a;
      g.fillStyle = i % 3 ? FIRE[2] : FIRE[3];
      g.beginPath();
      g.moveTo(x, y - sz);
      g.lineTo(x + sz * (0.4 + h(i, 76)), y + sz * 0.5);
      g.lineTo(x - sz * (0.4 + h(i, 77)), y + sz * 0.7);
      g.closePath();
      g.fill();
    }
    g.globalAlpha = 1;
  }
  return () => {
    if (!WARD) return;
    // (the film over him, and the flash where the blow met it, running out round him)
    g.globalAlpha = Math.min(1, 0.05 * on * fail + 0.2 * flash);
    g.drawImage(WARD, Math.round(hx - MX), Math.round(hy - MY));
    if (flash > 0 && eye) {
      g.globalAlpha = flash;
      g.fillStyle = '#fff0f6';
      const r = 3 + 26 * (1 - flash);
      g.beginPath();
      for (let i = 0; i <= 18; i++) {
        const ang = (i / 18) * Math.PI * 2;
        const rr = r * (0.7 + 0.5 * h(i, Math.floor(now * 30), 81));
        if (i === 0) g.moveTo(eye[0] + Math.cos(ang) * rr, eye[1] + Math.sin(ang) * rr);
        else g.lineTo(eye[0] + Math.cos(ang) * rr, eye[1] + Math.sin(ang) * rr);
      }
      g.closePath();
      g.globalAlpha = flash * 0.5;
      g.fill();
      // (glancing off in pink sparks)
      g.globalAlpha = flash;
      for (let i = 0; i < 14; i++) {
        const ang = h(i, 82, Math.floor((me.wardHit ?? 0) * 10)) * Math.PI * 2;
        const d = 4 + 30 * (1 - flash) * (0.5 + h(i, 83));
        g.fillStyle = i % 2 ? FIRE[3] : FIRE[4];
        g.fillRect(Math.round(eye[0] + Math.cos(ang) * d), Math.round(eye[1] + Math.sin(ang) * d * 0.7), 2, 1);
      }
    }
    g.globalAlpha = 1;
  };
}

/** PHASE 3, THE GAME'S PARTS: on the stone, his grip's cracks along its back edge and the water surging over it, where his eye came down
 *  (cracks, slime), where the bolts struck (scorched, smouldering), the pieces set (the friend's cyan at a pillar's foot); over it, the
 *  pillars' fire and their lines into him, a broken pillar toppling, the bolts falling and bursting, his eye's ichor as it is struck,
 *  what his eye's slam and his grip fling up. */
export function drawColossusP3(g: CanvasRenderingContext2D, P: StoneAt, f: ColossusFight, me: ColossusOn, game: Game, mid: readonly [number, number], eye: readonly [number, number] | null, t: number, pass: 'ground' | 'air'): void {
  const now = f.time;
  const gnow = game.time;
  if (pass === 'ground') {
    // HIS GRIP: the stone cracked along its back edge where his heaps clamp onto it; the water surging over it, draining off
    if (KEPT.grip !== Infinity) {
      const s = now - KEPT.grip;
      g.fillStyle = C.crack;
      g.globalAlpha = 0.9;
      for (let c = 0; c < 7; c++) {
        let u = 3.6 + c * 1.55 + (h(c, 91) - 0.5) * 0.6;
        let v = 0.02;
        const reach = 0.6 + 1.4 * h(c, 92);
        const grow = Math.min(1, s * 6);
        for (let i = 0; i < 14 * grow; i++) {
          const ang = Math.PI / 2 + (n1(i * 0.7, c * 7 + 93) - 0.5) * 1.6;
          u += Math.cos(ang) * reach / 14;
          v += Math.sin(ang) * reach / 14;
          const [x, y] = P(u, v);
          g.fillRect(Math.round(x), Math.round(y), 1 + (i < 5 ? 1 : 0), 1);
        }
      }
      const wet = Math.max(0, 1 - Math.max(0, s - 0.4) / 2.2);
      if (wet > 0) {
        const reach = 1.3 * sm(0, 0.35, s) * (1 - sm(0.8, 2.6, s) * 0.6);
        for (let u = 2.5; u < 14.5; u += 0.5) quad(g, P, u, 0, u + 0.5, reach * (0.6 + 0.6 * n1(u * 1.7, 94)), `rgba(10, 18, 16, ${0.35 * wet})`);
        g.fillStyle = C.foam[2];
        for (let i = 0; i < 70; i++) {
          const u = 2.5 + 12 * h(i, 95);
          const v = reach * (0.6 + 0.6 * n1(u * 1.7, 94)) * (0.7 + 0.3 * h(i, 96));
          if (h(i, 97, Math.floor(t * 8)) < 0.4) continue;
          g.globalAlpha = 0.7 * wet;
          const [x, y] = P(u, v);
          g.fillRect(Math.round(x), Math.round(y), 2, 1);
        }
      }
      g.globalAlpha = 1;
    }
    // HIS EYE COME DOWN: the stone cracked out from it, slime pooled round it, drying after it is dragged back up
    for (const e of KEPT.eyeSlams) {
      const s = now - e.at;
      const a = Math.max(0, 1 - Math.max(0, s - 3.5) / 2.5);
      g.fillStyle = C.crack;
      g.globalAlpha = a;
      for (let c = 0; c < 9; c++) {
        const a0 = (c / 9) * Math.PI * 2 + h(e.seed, c, 1) * 0.6;
        let u = e.u;
        let v = e.v;
        const reach = EYE_SLAM.r * (0.7 + 0.5 * h(e.seed, c, 2)) * Math.min(1, s * 8);
        for (let i = 0; i < 16; i++) {
          const ang = a0 + (n1(i * 0.6, e.seed + c) - 0.5) * 1.2;
          u += (Math.cos(ang) * reach) / 16;
          v += (Math.sin(ang) * reach) / 16;
          const [x, y] = P(u, v);
          g.fillRect(Math.round(x), Math.round(y), i < 6 ? 2 : 1, 1);
        }
      }
      const slime = s < EYE_SLAM.long - EYE_SLAM.hit ? Math.min(1, s * 4) : Math.max(0, 1 - (s - (EYE_SLAM.long - EYE_SLAM.hit)) / 1.5);
      if (slime > 0) {
        g.globalAlpha = 0.55 * slime;
        g.fillStyle = C.slime + '1)';
        g.beginPath();
        for (let i = 0; i <= 24; i++) {
          const ang = (i / 24) * Math.PI * 2;
          const r = 0.9 * (0.75 + 0.45 * n1(i * 0.9 + s * 0.6, e.seed + 40));
          const [x, y] = P(e.u + Math.cos(ang) * r, e.v + Math.sin(ang) * r);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.closePath();
        g.fill();
      }
      g.globalAlpha = 1;
    }
    // THE BOLTS' STRIKES: the stone scorched, smouldering, embers winking out (2.2 s)
    for (const b of KEPT.bolts) {
      const s = now - b.at;
      const a = Math.max(0, 1 - s / 2.2);
      g.globalAlpha = 0.7 * a;
      g.fillStyle = C.scorch + '1)';
      g.beginPath();
      for (let i = 0; i <= 20; i++) {
        const ang = (i / 20) * Math.PI * 2;
        const r = RAIN.r * 0.8 * (0.7 + 0.5 * h(b.seed, i, 3));
        const [x, y] = P(b.u + Math.cos(ang) * r, b.v + Math.sin(ang) * r);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
      for (let i = 0; i < 14; i++) {
        if (h(b.seed, i, Math.floor(s * 6)) < 0.45 + s * 0.2) continue;
        const ang = h(b.seed, i, 4) * Math.PI * 2;
        const r = RAIN.r * 0.7 * h(b.seed, i, 5);
        const [x, y] = P(b.u + Math.cos(ang) * r, b.v + Math.sin(ang) * r);
        g.globalAlpha = a;
        g.fillStyle = i % 3 ? FIRE[2] : FIRE[3];
        g.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      g.globalAlpha = 1;
    }
    // THE PIECES SET: the friend's cyan glowing at a pillar's foot
    (game.level.pillars ?? []).forEach((pl, i) => {
      if (pl.by !== 'piece' || pl.outAt === undefined || !EYE3.pillars[i]) return;
      const s = gnow - pl.outAt;
      if (s < 0.33) return;
      const [x, y] = P(EYE3.pillars[i][0], EYE3.pillars[i][1]);
      const pulse = 0.75 + 0.25 * Math.sin(t * 3 + i);
      g.globalAlpha = 0.3 * pulse;
      g.fillStyle = CYAN[1];
      g.beginPath();
      g.ellipse(x, y - 4, 10, 5, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      g.fillStyle = CYAN[0];
      g.fillRect(Math.round(x) - 2, Math.round(y) - 7, 4, 4);
      g.fillStyle = CYAN[s < 0.6 ? 2 : 1];
      g.fillRect(Math.round(x) - 1, Math.round(y) - 6, 2, 2);
    });
    return;
  }
  // OVER IT: THE PILLARS' FIRE AND THEIR LINES INTO HIM
  const ps = game.level.pillars ?? [];
  const lit0 = f.ph === 3 ? f.phT : -1;
  EYE3.pillars.forEach(([u, v], i) => {
    const pl = ps[i];
    if (!pl) return;
    const [fx, fy0] = P(u, v);
    const fy = fy0 - PILLAR_UP * UP;
    const to = his3(mid, PILLAR_TO[i]);
    const kindle = lit0 < 0 ? 0 : sm(EYE3.kindle[i], EYE3.kindle[i] + 26 / 30, lit0);
    const out = pl.outAt === undefined ? -1 : gnow - pl.outAt;
    if (pl.lit || out < 0) {
      // (burning: kindled at its point, its line crawling out to him)
      flame(g, fx, fy, 15, kindle, t, 600 + i);
      siegeLine(g, [fx, fy - 3], to, 0, kindle, kindle, t, 610 + i * 7);
    } else if (pl.by === 'piece') {
      // (put out: its fire guttering, its line going dark from its end toward him)
      const k = 1 - sm(0, 1, out);
      flame(g, fx, fy, 15 * (0.4 + 0.6 * k), k * (h(Math.floor(t * 20), i, 9) < 0.3 ? 0.5 : 1), t, 600 + i);
      siegeLine(g, [fx, fy - 3], to, sm(0, 1, out), 1, k, t, 610 + i * 7);
    } else {
      // (broken: its line snapped, the half toward him whipping back into him; its shaft toppling outward into the water, splashing)
      const snap = sm(0, 0.35, out);
      if (snap < 1) siegeLine(g, to, [to[0] + (fx - to[0]) * 0.5 * (1 - snap), to[1] + (fy - to[1]) * 0.5 * (1 - snap)], 0, 1, 1 - snap, t, 640 + i);
      const fall = Math.min(1, out / (14 / 30));
      if (out < 1.6) {
        const away = i === 0 ? -1 : i === 1 ? 1 : 0;
        const ang = fall ** 2 * (Math.PI / 2) * (away === 0 ? 0.9 : 1);
        const len = PILLAR_UP * UP;
        const dx = away === 0 ? 0 : away * Math.sin(ang) * len;
        const dy = away === 0 ? Math.sin(ang) * len * 0.5 : 0;
        const top: [number, number] = [fx + dx, fy0 - Math.cos(ang) * len + dy];
        if (fall < 1) {
          g.fillStyle = '#24222a';
          g.beginPath();
          g.moveTo(fx - 4, fy0 - 6);
          g.lineTo(top[0] - 2, top[1]);
          g.lineTo(top[0] + 2, top[1]);
          g.lineTo(fx + 4, fy0 - 6);
          g.closePath();
          g.fill();
          g.fillStyle = '#3c3944';
          g.fillRect(Math.round(fx - 4), Math.round(fy0 - 6), 3, 2);
        } else {
          // (its splash where it went in)
          const s2 = out - 14 / 30;
          for (let k = 0; k < 26; k++) {
            const a2 = h(k, 650 + i) * Math.PI;
            const sp = 30 + 50 * h(k, 651 + i);
            const x = top[0] + Math.cos(a2) * sp * s2 * (away || (h(k, 652) - 0.5) * 2) * 0.6;
            const y = top[1] + 10 - Math.sin(a2) * sp * s2 + 140 * s2 * s2;
            if (y > top[1] + 14) continue;
            g.globalAlpha = Math.max(0, 1 - s2 / 1.1);
            g.fillStyle = k % 3 ? C.foam[2] : C.foam[3];
            g.fillRect(Math.round(x), Math.round(y), 2, 2);
          }
          g.globalAlpha = 1;
        }
      }
      // (its foot left standing, broken off)
      g.fillStyle = '#2a2830';
      g.fillRect(Math.round(fx) - 4, Math.round(fy0) - 8, 8, 8);
      g.fillStyle = '#57525e';
      g.fillRect(Math.round(fx) - 4, Math.round(fy0) - 8, 8, 1);
    }
  });
  // THE PIECE OF THE WARD-STONE, flung from where he stood into the pillar's foot (the friend's cyan)
  ps.forEach((pl, i) => {
    if (pl.by !== 'piece' || pl.outAt === undefined || !pl.from || !EYE3.pillars[i]) return;
    const out = gnow - pl.outAt;
    if (out < 0 || out >= 0.33) return;
    const S = game.level.land?.stone;
    if (!S) return;
    const du = pl.from.x - S.cx;
    const dv = pl.from.y - S.cy;
    const fu = STONE.w / 2 + (du - dv) / Math.SQRT2;
    const fv = STONE.d / 2 + (du + dv) / Math.SQRT2;
    const q = out / 0.33;
    const [ax, ay] = P(fu, fv);
    const [bx, by] = P(EYE3.pillars[i][0], EYE3.pillars[i][1]);
    const x = ax + (bx - ax) * q;
    const y = ay + (by - ay) * q - 26 - 24 * Math.sin(Math.PI * q) + 18 * q;
    g.fillStyle = CYAN[0];
    g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    g.fillStyle = CYAN[2];
    g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
    g.globalAlpha = 0.3;
    g.fillStyle = CYAN[1];
    g.fillRect(Math.round(x) - 4, Math.round(y) - 4, 8, 8);
    g.globalAlpha = 1;
  });
  // THE BOLTS: each falling out of the sky over its warning's last frames (from in front of him, a little to the left), bursting
  for (const r of f.rains) {
    const fall = (r.t - 24 / 30) / (9 / 30);
    if (fall < 0 || fall >= 1) continue;
    const [tx, ty] = P(r.u, r.v);
    const H0 = 300 * (1 - fall);
    const H1 = Math.max(0, 300 * (1 - fall) - 120);
    const a: [number, number] = [tx + 0.0866 * H0, ty - 0.846 * H0];
    const b: [number, number] = [tx + 0.0866 * H1, ty - 0.846 * H1];
    for (const [w, col, al] of [[4, FIRE[1], 0.45], [2, FIRE[3], 0.9], [1, FIRE[4], 1]] as const) {
      g.globalAlpha = al;
      g.strokeStyle = col;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(a[0], a[1]);
      for (let k = 1; k <= 6; k++) {
        const q = k / 6;
        const j = k < 6 ? (h(Math.floor(t * 30), k, 99) - 0.5) * 6 : 0;
        g.lineTo(a[0] + (b[0] - a[0]) * q + j, a[1] + (b[1] - a[1]) * q);
      }
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  for (const bo of KEPT.bolts) {
    const s = now - bo.at;
    if (s > 0.45) continue;
    const [x, y] = P(bo.u, bo.v);
    const k = 1 - s / 0.45;
    flame(g, x, y, 26 * (0.6 + 0.4 * k), k, t, bo.seed);
    for (let i = 0; i < 20; i++) {
      const ang = h(bo.seed, i, 7) * Math.PI;
      const sp = 40 + 70 * h(bo.seed, i, 8);
      const px = x + Math.cos(ang) * sp * s * (h(bo.seed, i, 9) < 0.5 ? -1 : 1);
      const py = y - Math.sin(ang) * sp * s + 160 * s * s;
      g.globalAlpha = k;
      g.fillStyle = i % 2 ? FIRE[3] : FIRE[4];
      g.fillRect(Math.round(px), Math.round(py), 1, 1);
    }
    g.globalAlpha = 1;
  }
  // HIS EYE COME DOWN: slime and water flung up and out, chips of the stone
  for (const e of KEPT.eyeSlams) {
    const s = now - e.at;
    if (s > 1.4) continue;
    for (let i = 0; i < 40; i++) {
      const ang = h(e.seed, i, 11) * Math.PI * 2;
      const sp = 0.8 + 2.2 * h(e.seed, i, 12);
      const vz = 1.5 + 3.5 * h(e.seed, i, 13);
      const z = Math.max(0, vz * s - 9 * s * s);
      if (z <= 0 && s > 0.1) continue;
      const [x, y] = P(e.u + Math.cos(ang) * sp * s, e.v + Math.sin(ang) * sp * s);
      g.fillStyle = i < 12 ? C.stone[2] : i % 2 ? C.goo[2] : C.foam[1];
      g.fillRect(Math.round(x), Math.round(y - z * UP), i < 12 ? 2 : 2, i < 12 ? 2 : 1);
    }
  }
  // HIS GRIP: grit flung up off the stone's edge
  if (KEPT.grip !== Infinity) {
    const s = now - KEPT.grip;
    if (s < 1.2) {
      for (let i = 0; i < 46; i++) {
        const u0 = 3 + 11 * h(i, 101);
        const vz = 2 + 3 * h(i, 102);
        const z = vz * s - 9 * s * s;
        if (z < 0) continue;
        const [x, y] = P(u0 + (h(i, 103) - 0.5) * s * 2, 0.1 + s * 1.2 * h(i, 104));
        g.fillStyle = i % 3 ? C.stone[2] : C.foam[2];
        g.fillRect(Math.round(x), Math.round(y - z * UP), 1 + (i % 2), 1);
      }
    }
  }
  // HIS EYE STRUCK: its dark ichor spurting (never cyan)
  const hitS = me.hitAt === undefined ? 99 : now - me.hitAt;
  if (eye && hitS >= 0 && hitS < 0.6) {
    const seed = Math.round((me.hitAt ?? 0) * 30);
    for (let i = 0; i < 22; i++) {
      const ang = -Math.PI / 2 + (h(seed, i, 21) - 0.5) * 2.6;
      const sp = 40 + 70 * h(seed, i, 22);
      const x = eye[0] + Math.cos(ang) * sp * hitS;
      const y = eye[1] + Math.sin(ang) * sp * hitS + 150 * hitS * hitS;
      g.globalAlpha = Math.max(0, 1 - hitS / 0.6);
      g.fillStyle = ICHOR[i % 4];
      g.fillRect(Math.round(x), Math.round(y), i % 3 ? 2 : 3, 2);
    }
    g.globalAlpha = 1;
  }
}
