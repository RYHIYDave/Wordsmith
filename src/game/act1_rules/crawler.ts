// ACT 1: THE CLIFF CRAWLERS (FLOOR 7): its rules (game/act1_rules/types.ts).
//
// His doc's table: "Cliff Crawlers (medium, his pick in place of goats)": "A swipe; a grab that drags you toward the drop.
// They climb up over the lip of the ledge." His brief to the art chat (14 Oct): "Nothing it carries; a claw swipe, then a
// leap onto you (Recommended)". The art chat's pictures (art/ledge_crawlers.ts), its moves each with his yes as shown:
// its stand (never still), its walk (a tripod, painted for 1.4 tiles a second), its claw swipe, its leap, its flinch and
// its death.
//
// WHAT IT DOES, by those (the main chat's):
// - THE CLAW SWIPE, its basic blow: its front claw reared up at its left, whipped across before it at the art's moment;
//   it strikes what is before it and to its left, as far as the claw sweeps (`CRAWLER.swipe`, measured off the picture).
// - THE LEAP, its big move: its crouch (the warning, and a ring on the floor where it will come down), the spring, the
//   landing ON the hero at the art's moment; what it lands on it GRABS, and as it hops back it DRAGS him toward the drop
//   (the nearest edge of the Ledge Road; where there is none near, back with it). He is held while he is dragged; he
//   cannot go over: he is slid along the walk grid, which ends at the edge.
// - IT CLIMBS UP OVER THE LIP: one that comes into the world near the drop waits under the lip of the ledge, out of
//   sight, and when it wakes it springs up over the lip onto the road. The art has no picture of a climb: it is the
//   leap, its own (crouched on the cliff's face below the lip, it springs up and lands on the road, and hops back to the
//   lip), its picture let down below the floor's edge until it springs (render/act1_fx/crawler.ts). Nothing of the
//   hero's reaches it until it is up.

import type { ActDef, BossRules } from '../bosses';
import { beside, handOf } from '../facing';
import { TUNE } from '../defs';
import type { Monster } from '../state';
import { T_FLOOR, T_PIT } from '../types';
import type { Act1Rules } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** THE CRAWLER'S NUMBERS: the art's (art/ledge_crawlers.ts, held to it by tests/act1_crawler.test.ts) and the rules'. */
export const CRAWLER = {
  /** The swipe: its claw at its blow is 1.28 tiles before it and 0.71 to its left, sweeping on to 1.43 and 0.36 (the picture's); what is in this strip before it and to its left at the blow is struck. */
  swipe: { fwd: [-0.2, 1.75] as const, left: [-0.45, 1.2] as const },
  /** The leap: at `hit` (the art's) it comes down `at` tiles before it (its body 0.64 before it, its head 1.14: the picture's), on whatever is within `r`; it lets go at `from` (its landing's freeze over) and hops back by `to`, dragging what it holds `drag` tiles. */
  leap: { hit: 0.72, at: 0.85, r: 0.8, from: 0.82, to: 1.3, drag: 1.6 },
  /** Toward the drop, if there is one within this many tiles of the hero. */
  dropNear: 5,
  /** Under the lip: one that comes into the world within `near` tiles of the drop waits there; it is let down `below` game pixels under the floor until it springs (`spring`, the leap's, from its crouch to its landing); the pack come up one after another, within `stagger` seconds. */
  lip: { near: 5, below: 18, spring: [0.35, 0.72] as const, stagger: 0.7 },
};

const ACTS: readonly ActDef[] = [
  // its claw swipe: its basic blow (light: no freeze)
  { id: 'crawler:swipe', clip: 'attack', long: 0.9, hit: 0.38, dmg: 1, cooldown: 0, first: 0, after: 1.0, near: 0, far: 1.7 },
  // its leap onto you, and the drag: its big move (heavy: held a tenth at the blow)
  { id: 'crawler:leap', clip: 'leap', long: 1.3, hit: CRAWLER.leap.hit, dmg: 1.3, cooldown: 7, first: 2.5, after: 0.6, near: 0, far: 1.6 },
  // up over the lip: the leap's picture, out of the drop onto the road
  { id: 'crawler:climb', clip: 'leap', long: 1.3, hit: CRAWLER.leap.hit, dmg: 0, cooldown: 0, first: 0, after: 0.3, near: 0, far: 0, forced: true },
];
const CLIMB = 2;

/** What it keeps (Monster.a1): `hid` 1 while it waits under the lip, 2 as it climbs up; `wait` before it climbs; `ix`, `iy` the way in from the drop; `grab` 1 while it holds the hero, the way it drags him (`gx`, `gy`) and where it grabbed him (`ox`, `oy`). */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { hid: 0, wait: 0, ix: 0, iy: 0, grab: 0, gx: 0, gy: 0, ox: 0, oy: 0 });
}

/** Is it under the lip, or climbing up over it (out of reach, and, waiting, out of sight)? */
export function underLip(m: Monster): boolean {
  return !!m.a1 && (m.a1.hid === 1 || m.a1.hid === 2);
}

/** How far it is let down under the floor's edge now (game pixels; 0 once it is up). */
export function lipDepth(m: Monster): number {
  if (!m.a1 || m.a1.hid === 0) return 0;
  if (m.a1.hid === 1) return CRAWLER.lip.below;
  const t = m.act && m.act.id === 'crawler:climb' ? m.act.t : 0;
  const [a, b] = CRAWLER.lip.spring;
  const k = clamp01((t - a) / (b - a));
  return CRAWLER.lip.below * (1 - k * k * (3 - 2 * k));
}

/** The nearest place where the Ledge Road falls away, within `far` tiles of (x, y): the middle of a tile of the drop; null if none. */
function dropNear(R: BossRules, x: number, y: number, far: number): { x: number; y: number } | null {
  const L = R.g.level;
  const drop = L.land?.drop;
  if (!drop) return null;
  const f = L.floor;
  let best: { x: number; y: number } | null = null;
  let bd = far;
  for (let ty = Math.floor(y - far); ty <= Math.floor(y + far); ty++) {
    for (let tx = Math.floor(x - far); tx <= Math.floor(x + far); tx++) {
      if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
      const i = ty * f.w + tx;
      if (drop[i] !== 1 || f.tiles[i] !== T_PIT) continue;
      const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
      if (d < bd) {
        bd = d;
        best = { x: tx + 0.5, y: ty + 0.5 };
      }
    }
  }
  return best;
}

/**
 * WHERE ONE THAT COMES INTO THE WORLD NEAR THE DROP WAITS: on the floor at the lip, a tile of the road with the drop
 * beside it down the screen (so the cliff's face it springs up from faces the camera); the nearest to where it was put,
 * and not where another of them waits. Null: not near the drop.
 */
function lipFor(R: BossRules, m: Monster): { x: number; y: number; ix: number; iy: number } | null {
  const g = R.g;
  const L = g.level;
  const drop = L.land?.drop;
  if (!drop) return null;
  const f = L.floor;
  const near = CRAWLER.lip.near;
  const taken = g.monsters.filter((o) => o !== m && !o.dead && o.kind === 'crawler' && o.a1 && o.a1.hid === 1);
  let best: { x: number; y: number; ix: number; iy: number } | null = null;
  let bd = near;
  const pit = (tx: number, ty: number): boolean => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && drop[ty * f.w + tx] === 1 && f.tiles[ty * f.w + tx] === T_PIT;
  for (let ty = Math.floor(m.y - near); ty <= Math.floor(m.y + near); ty++) {
    for (let tx = Math.floor(m.x - near); tx <= Math.floor(m.x + near); tx++) {
      if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
      const i = ty * f.w + tx;
      if (f.tiles[i] !== T_FLOOR || L.walk[i] !== 1 || (f.cut && f.cut[i] !== 0)) continue;
      const px = pit(tx + 1, ty);
      const py = pit(tx, ty + 1);
      if (!px && !py) continue;
      const x = tx + 0.5;
      const y = ty + 0.5;
      const d = Math.hypot(x - m.x, y - m.y);
      if (d >= bd || !g.free(L.walk, x, y, 0.42) || taken.some((o) => Math.hypot(o.x - x, o.y - y) < 1.1)) continue;
      const ix = px ? -1 : 0;
      const iy = py ? -1 : 0;
      const n = Math.hypot(ix, iy);
      bd = d;
      best = { x, y, ix: ix / n, iy: iy / n };
    }
  }
  return best;
}

export const RULES: Act1Rules | null = {
  gait: { pace: 1.4, cycle: 0.5, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.1, slack: 0.4, trueBack: true },
  acts: ACTS,

  reachable: (m) => !underLip(m),

  spawned(R, m) {
    const lip = lipFor(R, m);
    if (!lip) return;
    const a = keep(m);
    m.x = lip.x;
    m.y = lip.y;
    m.fx = lip.ix;
    m.fy = lip.iy;
    a.hid = 1;
    a.ix = lip.ix;
    a.iy = lip.iy;
    // (its pack comes up one after another: each its own moment, by its own seed)
    a.wait = CRAWLER.lip.stagger * ((m.seed * 7.31) % 1);
  },

  tick(_R, m, dt) {
    const a = m.a1;
    if (!a || a.hid !== 1) return false;
    // (under the lip, awake: it waits its moment, then springs: `forced`)
    a.wait -= dt;
    m.anim = 'idle';
    return a.wait > 0;
  },

  forced: (_R, m) => (m.a1 && m.a1.hid === 1 && m.a1.wait <= 0 ? CLIMB : -1),

  start(_R, m, a) {
    const k = keep(m);
    if (a.id === 'crawler:climb') {
      // (it springs up the way in from the drop, not at the hero)
      m.fx = k.ix;
      m.fy = k.iy;
      if (m.act) m.act.hand = handOf(true, m.fx, m.fy);
      k.hid = 2;
    }
    k.grab = 0;
  },

  end(R, m, a) {
    const k = keep(m);
    if (a.id === 'crawler:climb') k.hid = 0;
    if (k.grab) {
      k.grab = 0;
      R.g.hero.held = 0;
    }
  },

  died(R, m) {
    if (m.a1 && m.a1.grab) R.g.hero.held = 0;
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const k = keep(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    switch (a.id) {
      case 'crawler:swipe': {
        if (at(0.26)) g.sfx('swing', 0.6);
        if (!at(a.hit)) break;
        const S = CRAWLER.swipe;
        const r = R.rel(m);
        if (r.fwd >= S.fwd[0] && r.fwd <= S.fwd[1] && r.left >= S.left[0] && r.left <= S.left[1]) R.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 1 });
        break;
      }
      case 'crawler:leap': {
        const L = CRAWLER.leap;
        if (at(0.35)) g.sfx('swing', 0.7);
        if (at(a.hit)) {
          // IT COMES DOWN ON HIM, and grabs what it comes down on
          const p = beside(m.x, m.y, m.fx, m.fy, act.hand, L.at, 0);
          if (Math.hypot(h.x - p.x, h.y - p.y) <= L.r && h.invuln <= 0 && !h.move && !g.over) {
            R.blow(m, a.dmg);
            k.grab = 1;
            k.ox = h.x;
            k.oy = h.y;
            const drop = dropNear(R, h.x, h.y, CRAWLER.dropNear);
            let dx = drop ? drop.x - h.x : -m.fx;
            let dy = drop ? drop.y - h.y : -m.fy;
            const d = Math.hypot(dx, dy) || 1;
            dx /= d;
            dy /= d;
            k.gx = dx;
            k.gy = dy;
            h.held = L.to - t1 + 0.05;
            g.emit({ t: 'text', x: h.x, y: h.y, text: 'Grabbed', color: '#ff8a80' });
          }
          g.emit({ t: 'shake', amount: 4 });
          g.sfx('slam', 0.6);
        }
        if (k.grab && t1 > L.from) {
          // THE DRAG, as it hops back: toward the drop, along the floor (the edge stops him: he cannot go over)
          if (g.over) {
            k.grab = 0;
            break;
          }
          const step = (L.drag * (Math.min(t1, L.to) - Math.max(t0, L.from))) / (L.to - L.from);
          if (step > 0) g.slide(h, TUNE.heroRadius, k.gx * step, k.gy * step, g.level.walk);
          h.held = Math.max(h.held ?? 0, 0.05);
          if (t1 >= L.to) {
            k.grab = 0;
            h.held = 0;
          }
        }
        break;
      }
      case 'crawler:climb': {
        // (up over the lip: the scrape of its claws on the rock as it springs, and lands)
        if (at(0.35)) g.sfx('swing', 0.4);
        if (at(a.hit)) g.emit({ t: 'shake', amount: 1 });
        break;
      }
      default:
        break;
    }
  },
};
