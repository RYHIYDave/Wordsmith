// THE VETERAN'S COMBO GLOBES (the art chat, 2 Nov 2026). A MOCK-UP: A PICTURE OF THE IDEA; NOTHING OF THE GAME IMPORTS IT
// (tests/veteran.test.ts).
//
// His words, 2 Nov 2026: “So what I want is three empty globes above him.  Cyan is punch, pink is kick, and yellow is
// jump.  As you tap or hold, the globes fill and it locks in your combo.  And early swipe just does a jump, like inputting
// a dodge.  A swipe then an input puts the globe in either pink or cyan fire, and that’s the uppercut or jump kick.”; told
// that pink and gold glows are the enemy's by his rulebook, his pick: “Keep the rule (Recommended)”, offered as: cyan
// punch, hot orange kick, white jump; the fires cyan and orange.
//
// So: three glass globes over his head, painted pixel by pixel (crisp, no smoothing), each empty, filling or full: CYAN a
// punch (a tap), HOT ORANGE a kick (a hold), WHITE a jump (a swipe); three in and the combo LOCKS (their rims go bright,
// a bar joins them); a swipe then a tap puts the globe in CYAN FIRE (the flying uppercut), a swipe then a hold in ORANGE
// FIRE (the jump kick). Never pink, never gold.

import { Px, rgba } from '../engine/px';
import type { Ramp } from '../art/kit';
import { CYAN, INK } from '../art/kit';

/** The punch's cyan (the friend's own). */
export const GLOBE_CYAN: Ramp = CYAN;
/** The kick's hot orange: a red-orange, kept well off gold. */
export const GLOBE_ORANGE: Ramp = ['#5a1606', '#a8340a', '#e8561a', '#ff7c2e', '#ffb486'];
/** The jump's white. */
export const GLOBE_WHITE: Ramp = ['#6a6890', '#a4a2c4', '#d4d2ea', '#f2f2fc', '#ffffff'];
/** The glass of an empty globe, and its rim. */
const GLASS = ['#141230', '#1e1b44', '#2a2758', '#4a4688', '#8c88c8'];

export type GlobeKind = 'punch' | 'kick' | 'jump';
export type Globe = { kind: 'empty' } | { kind: GlobeKind; level: number } | { kind: 'fire'; of: 'punch' | 'kick' };
export interface GlobeRow {
  globes: readonly [Globe, Globe, Globe];
  /** Three in: the combo locked. */
  locked?: boolean;
  /** Where the fire is in its flicker (a frame number; the film's flames lick and leap). */
  flick?: number;
}

/** Their size, in the picture's pixels at the game's size: each globe's radius, the gap between two, and room above for the fire. */
export const GLOBE = { r: 5, gap: 3, fire: 8, pad: 2 };
/** How wide and tall a row of three is painted. */
export const GLOBES_W = GLOBE.pad * 2 + 3 * (GLOBE.r * 2 + 1) + 2 * GLOBE.gap;
export const GLOBES_H = GLOBE.pad * 2 + GLOBE.fire + GLOBE.r * 2 + 1 + 2;

const rampOf = (k: GlobeKind | 'punchFire' | 'kickFire'): Ramp => (k === 'punch' || k === 'punchFire' ? GLOBE_CYAN : k === 'kick' || k === 'kickFire' ? GLOBE_ORANGE : GLOBE_WHITE);

/** A little hash for the flames' tongues (the same every time: a still picture). */
const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** THREE GLOBES IN A ROW, painted at the game's size. */
export function paintGlobes(row: GlobeRow): Px {
  const px = new Px(GLOBES_W, GLOBES_H);
  const { r, gap, fire, pad } = GLOBE;
  const set = (x: number, y: number, c: string): void => {
    if (x < 0 || y < 0 || x >= px.w || y >= px.h) return;
    const v = rgba(c);
    const i = (y * px.w + x) * 4;
    px.d[i] = v[0];
    px.d[i + 1] = v[1];
    px.d[i + 2] = v[2];
    px.d[i + 3] = 255;
  };
  const cy = pad + fire + r;
  const centres = [0, 1, 2].map((i) => pad + r + i * (2 * r + 1 + gap));
  // THE LOCK: a bar under them, joining all three (drawn first: the globes sit over it)
  if (row.locked) {
    const y = cy + r - 1;
    for (let x = centres[0]; x <= centres[2]; x++) {
      set(x, y, INK);
      set(x, y + 1, GLOBE_WHITE[3]);
      set(x, y + 2, INK);
    }
  }
  row.globes.forEach((g, i) => {
    const cx = centres[i];
    const fireOf = g.kind === 'fire' ? g.of : null;
    const fill = g.kind === 'fire' ? 1 : g.kind === 'empty' ? 0 : g.level;
    const liquid = g.kind === 'fire' ? rampOf(g.of) : g.kind === 'empty' ? null : rampOf(g.kind);
    // THE FIRE, behind and round the globe: three tongues licking up from it, the outer flame dark, lighter in toward
    // the globe, hottest at its root; inked round so it reads on any floor
    if (fireOf) {
      const F = rampOf(fireOf);
      const flip = fireOf === 'kick' ? -1 : 1;
      const fl = (k: number): number => (row.flick === undefined ? 0 : Math.round(2.2 * Math.sin(row.flick * 1.9 + k * 2.3)));
      const tongues = [[-3 * flip, fire - 2 + fl(0)], [0, fire + 1 + fl(1)], [3 * flip, fire - 3 + fl(2)], [-5 * flip, 3 + fl(3) * 0.5], [5 * flip, 4 + fl(4) * 0.5]] as const;
      const W0 = 2 * r + 7;
      const H0 = r * 2 + fire + 4;
      const ox = cx - r - 3;
      const oy = cy - r - fire - 2;
      // how far above the globe's skin the flame reaches at each column, and so its body
      const mask = new Float32Array(W0 * H0).fill(-1);
      for (let yy = 0; yy < H0; yy++) {
        for (let xx = 0; xx < W0; xx++) {
          const dx = ox + xx - cx;
          const dy = oy + yy - cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          // (a tongue: tall and narrow, leaning a little with the wind of his move)
          let reach = 1.4 - Math.max(0, dy) * 0.2;
          for (const [tx, th] of tongues) {
            const lean = (-dy - r) * 0.18 * flip;
            const w = Math.max(0, 1 - Math.abs(dx - tx - lean) / 2.2);
            reach = Math.max(reach, w * th * (dy < 0 ? 1 : 0.35));
          }
          const above = d - r;
          if (above > 0 && above < reach && dy < r - 1) mask[yy * W0 + xx] = above / reach;
        }
      }
      for (let yy = 0; yy < H0; yy++) {
        for (let xx = 0; xx < W0; xx++) {
          const m = mask[yy * W0 + xx];
          if (m < 0) continue;
          const edgeOf = (a: number, b: number): boolean => a < 0 || b < 0 || a >= W0 || b >= H0 || mask[b * W0 + a] < 0;
          const rim = edgeOf(xx - 1, yy) || edgeOf(xx + 1, yy) || edgeOf(xx, yy - 1);
          const c = rim ? F[1] : m > 0.62 ? F[2] : m > 0.3 ? F[3] : F[4];
          set(ox + xx, oy + yy, c);
        }
      }
      for (let yy = 0; yy < H0; yy++) {
        for (let xx = 0; xx < W0; xx++) {
          if (mask[yy * W0 + xx] >= 0) continue;
          const dx = ox + xx - cx;
          const dy = oy + yy - cy;
          if (Math.sqrt(dx * dx + dy * dy) <= r + 0.5) continue;
          const near = (a: number, b: number): boolean => a >= 0 && b >= 0 && a < W0 && b < H0 && mask[b * W0 + a] >= 0;
          if (near(xx - 1, yy) || near(xx + 1, yy) || near(xx, yy - 1) || near(xx, yy + 1)) set(ox + xx, oy + yy, INK);
        }
      }
    }
    // THE GLOBE: ink round it, glass in it, the liquid filled to its level, a glint of light top left
    const level = cy + r - Math.round(fill * (2 * r));
    for (let dy = -r - 1; dy <= r + 1; dy++) {
      for (let dx = -r - 1; dx <= r + 1; dx++) {
        const d = Math.sqrt(dx * dx + dy * dy);
        const x = cx + dx;
        const y = cy + dy;
        if (d > r + 0.5) continue;
        if (d > r - 0.5) {
          set(x, y, row.locked ? GLOBE_WHITE[4] : INK);
          continue;
        }
        const lit = -dx * 0.5 - dy * 0.7;
        if (liquid && y > level) {
          const k = y === level + 1 ? 4 : lit > 1.5 ? 3 : lit > -2 ? 2 : 1;
          set(x, y, liquid[k]);
        } else if (liquid && y === level) {
          // the meniscus: the liquid's bright top
          set(x, y, liquid[4]);
        } else {
          // (the glass: dark in it, a pale rim inside the ink, brightest where the light falls on it)
          const k = d > r - 1.5 ? (lit > 1 ? 4 : 3) : lit > 2 ? 2 : lit > -1 ? 1 : 0;
          set(x, y, GLASS[k]);
        }
      }
    }
    // the glint
    set(cx - 2, cy - 3, '#ffffff');
    set(cx - 3, cy - 2, '#ffffff');
    if (row.locked) set(cx - 2, cy - 2, GLOBE_WHITE[3]);
  });
  return px;
}

/** THE STATES TO SHOW HIM (a picture of the idea), in order, each with its line in plain words. */
export const GLOBE_STATES: { row: GlobeRow; title: string; line: string }[] = [
  { row: { globes: [{ kind: 'empty' }, { kind: 'empty' }, { kind: 'empty' }] }, title: 'Empty', line: 'Three empty globes over his head: nothing put in yet.' },
  { row: { globes: [{ kind: 'punch', level: 0.6 }, { kind: 'empty' }, { kind: 'empty' }] }, title: 'Tap: a punch', line: 'A tap fills the first globe cyan.' },
  { row: { globes: [{ kind: 'kick', level: 0.7 }, { kind: 'empty' }, { kind: 'empty' }] }, title: 'Hold: a kick', line: 'A hold fills it hot orange.' },
  { row: { globes: [{ kind: 'jump', level: 1 }, { kind: 'empty' }, { kind: 'empty' }] }, title: 'Swipe first: the jump', line: 'A swipe on its own fills it white: the jump, his dodge.' },
  { row: { globes: [{ kind: 'punch', level: 1 }, { kind: 'punch', level: 1 }, { kind: 'kick', level: 1 }], locked: true }, title: 'Locked: punch, punch, kick', line: 'Three in and the combo locks: the rims go white, a bar joins them.' },
  { row: { globes: [{ kind: 'fire', of: 'punch' }, { kind: 'empty' }, { kind: 'empty' }] }, title: 'Swipe, then tap', line: 'The globe in cyan fire: the flying uppercut.' },
  { row: { globes: [{ kind: 'fire', of: 'kick' }, { kind: 'empty' }, { kind: 'empty' }] }, title: 'Swipe, then hold', line: 'The globe in orange fire: the jump kick.' },
  { row: { globes: [{ kind: 'punch', level: 1 }, { kind: 'punch', level: 1 }, { kind: 'fire', of: 'kick' }], locked: true }, title: 'After two punches', line: 'Punch, punch, then swipe and hold: locked, ending in the flying knee.' },
];
