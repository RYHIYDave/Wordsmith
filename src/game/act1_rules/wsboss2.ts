// ENDLESS MODE'S FINAL BOSS, HIS SECOND PHASE, ON FOOT (the queue's build-endless-tablet-and-final-boss, stage 3; behind ENDLESS_KEY):
// his melds' rules, a meld at a time, for game/act1_rules/wsboss.ts. His look and each meld are the art chat's (art/endless_boss.ts,
// every one with his yes: docs/mockups/endless_tablet/README.md), and the fight's flow his (FIGHT_FLOW.md, his yes with one change);
// every time here is theirs, from each meld's slam. What hurts, how hard, how near: these rules (the main chat's numbers, WS2_TUNE).
//
// A MELD: he writes his word, his shade the other; they meet over him and meld; THE SLAM (the meld's act's `hit`) drives it into the
// floor (or flings it up, or to the wall), a small ring rolling out over the whole floor that cannot be dodged (TAKE IT: the
// phase's steady price), and what it makes begins: a peril of its own, `wsboss:<meld>`, its clock from the slam.
// Each meld's place is his own (forward, to his left: the art's lengths), turned the way he aimed it, straight at the hero; what of
// it falls past the floor's edge is not there.

import { AVAL, BLIGHT, BLIGHT_FIELD, BLIGHT_TREES, CONTAGION, ERUPT, ERUPT_VENTS, FROSTBITE, FUMES, FUMES_CLOUDS, HAIL, MELD, SCALD, THUNDER, WILDFIRE } from '../../art/endless_boss';
import { FINAL_PLACE, onArena } from '../../art/final_arena';
import { TILE3 } from '../../art/new_mobs3';
import type { BossRules } from '../bosses';
import type { Monster, Peril } from '../state';

const T = TILE3;
const S = MELD.slam;

/** HIS MELDS (the art's ten), the two words in each (his, then his shade's), and each's kind and lengths from the slam: when what
 * comes at you is done (the next may begin then, below a quarter of his life), and when all of it is gone. FLOOR: it lies a while. */
export const MELDS = {
  eruption: { words: ['power', 'fire'], floor: false, dodge: 2.3, end: ERUPT.end },
  hailstorm: { words: ['frost', 'lightning'], floor: false, dodge: HAIL.rain[1] + 0.5, end: HAIL.end },
  thunder: { words: ['power', 'lightning'], floor: false, dodge: 8.2, end: THUNDER.end },
  avalanche: { words: ['power', 'frost'], floor: false, dodge: AVAL.rumble[1] + AVAL.cross + AVAL.stream + AVAL.tail, end: AVAL.end },
  contagion: { words: ['lightning', 'poison'], floor: false, dodge: 7.0, end: CONTAGION.end },
  scald: { words: ['fire', 'frost'], floor: true, dodge: SCALD.beams[1], end: SCALD.end },
  blight: { words: ['power', 'poison'], floor: true, dodge: BLIGHT.heave + 0.3, end: BLIGHT.end },
  fumes: { words: ['fire', 'poison'], floor: true, dodge: 5.4, end: FUMES.end },
  wildfire: { words: ['fire', 'lightning'], floor: true, dodge: 4.6, end: WILDFIRE.end },
  frostbite: { words: ['frost', 'poison'], floor: false, dodge: FROSTBITE.gale[1], end: FROSTBITE.end },
} as const;
export type MeldId = keyof typeof MELDS;
export const MELD_IDS = Object.keys(MELDS) as MeldId[];

/** HIS NUMBERS ON FOOT (the main chat's, to tune): each blow's share of his own; the slam's ring; spent; and each meld's reach. */
export const WS2_TUNE = {
  ring: { pace: 14, band: 0.6, dmg: 0.3 },
  spent: 3.0,
  eruption: { reach: 0.85, dmg: 1.2 },
  hail: { reach: 0.55, dmg: 0.45, chill: 0.4, aim: 0.3, bolt: { reach: 1.0, dmg: 1.3 } },
  thunder: { reach: THUNDER.R, dmg: 1.3, clap: { band: 0.55, dmg: 0.2, knock: 1.2 } },
  avalanche: { dmg: 2.2, freeze: 1.6, safe: AVAL.safe.w },
  contagion: { every: 0.4, dmg: 0.28, cell: CONTAGION.cell, spots: 4 },
  scald: { inner: 1.0, outer: SCALD.r, every: 0.4, dmg: 0.25, beam: { half: 0.45, every: 0.45, dmg: 0.9 } },
  blight: { dmg: 1.6, poison: 6 },
  fumes: { every: 0.4, dmg: 0.16, boom: 1.4 },
  wildfire: { reach: 0.65, dmg: 1.0, arc: { half: 0.35, every: 0.4, dmg: 0.3 }, link: 3.2, boom: { reach: 0.95, dmg: 1.6 } },
  frostbite: { eye: FROSTBITE.eye, every: 0.5, dmg: 0.2, chill: 0.55 },
} as const;

/** A point of his own lengths (forward, to his left) on the floor, from (x, y) facing (fx, fy). */
export function own(x: number, y: number, fx: number, fy: number, a: number, b: number): { x: number; y: number } {
  return { x: x + (fx * a + fy * b) / T, y: y + (fy * a - fx * b) / T };
}
/** Where (px, py) is from (x, y) facing (fx, fy), in his own lengths. */
export function ownOf(x: number, y: number, fx: number, fy: number, px: number, py: number): { a: number; b: number } {
  const dx = (px - x) * T;
  const dy = (py - y) * T;
  return { a: dx * fx + dy * fy, b: dx * fy - dy * fx };
}

// ---------------------------------------------------------------------------------------------
// THE LAYOUTS, worked out as a meld is cast (on the peril: its own numbers, and its list on `MeldPeril.list`)

/** One meld's lay over the floor as it was cast (the places the rules hurt at, and the drawing draws). */
export interface MeldLay {
  /** Its spots: where (tiles), when (seconds from the slam), and a number of its own (its looks; a cloud's or a tree's reach). */
  spots: { x: number; y: number; t: number; k: number; r?: number; done?: number }[];
  /** CONTAGION: the patches' grid, each patch's moment sickened (Infinity: never) and the one that passed it on. */
  grid?: { x0: number; y0: number; n: number; m: number; size: number; at: Float64Array; from: Int32Array };
  /** WILDFIRE: the arcs, each two spots. */
  links?: [number, number][];
  /** AVALANCHE: which side the safe strip is (+1 his left, -1 his right). */
  side?: number;
}
const LAYS = new WeakMap<Peril, MeldLay>();
export const layOf = (p: Peril): MeldLay | undefined => LAYS.get(p);

/** Is (x, y) on the floor, with room for a thing of reach `r`? */
const fits = (x: number, y: number, r = 0.3): boolean => onArena(x, y, r);

/** A meld begins at his slam: its peril, its lay. */
export function meldBegins(R: BossRules, m: Monster, id: MeldId, fx: number, fy: number): Peril {
  const g = R.g;
  const h = g.hero;
  const roll = g.rollMonsterDmg(m);
  const M = MELDS[id];
  const p = R.peril(m, 'act1', m.x, m.y, { a1: `wsboss:${id}`, fx, fy, dur: M.end, hit: 0, dmg: roll, el: id === 'eruption' || id === 'scald' || id === 'wildfire' || id === 'fumes' ? 'fire' : id === 'hailstorm' || id === 'avalanche' || id === 'frostbite' ? 'frost' : id === 'thunder' || id === 'contagion' ? 'lightning' : 'phys' });
  const lay: MeldLay = { spots: [] };
  const rng = g.rng;
  switch (id) {
    case 'eruption':
      for (const v of ERUPT_VENTS) {
        const w = own(m.x, m.y, fx, fy, v.at[0], v.at[1]);
        if (fits(w.x, w.y, 0.4)) lay.spots.push({ x: w.x, y: w.y, t: v.t - S, k: v.fan * 10 + v.j });
      }
      break;
    case 'hailstorm': {
      // (the stones at random all over the floor, a share of them at him as each is let go; the bolts each on him as it is ringed)
      for (let i = 0; i < HAIL.stones; i++) {
        const t = HAIL.rain[0] + (HAIL.rain[1] - HAIL.rain[0]) * (i / HAIL.stones) + rng.range(-0.05, 0.05);
        const a = rng.range(0, Math.PI * 2);
        const r = Math.sqrt(rng.range(0, 1)) * (FINAL_PLACE.floor - 0.5);
        lay.spots.push({ x: FINAL_PLACE.cx + Math.cos(a) * r, y: FINAL_PLACE.cy + Math.sin(a) * r, t, k: i, r: rng.next() < WS2_TUNE.hail.aim ? 1 : 0 });
      }
      for (let i = 0; i < HAIL.bolts; i++) lay.spots.push({ x: h.x, y: h.y, t: HAIL.rain[0] + 0.3 + ((HAIL.rain[1] - HAIL.rain[0] - 0.3) * (i + 0.5)) / HAIL.bolts, k: -1 - i, r: 2 });
      break;
    }
    case 'thunder': {
      // (seven, each locking on where he is, each faster: its moment of locking on, its bolt after its warning)
      let t = THUNDER.first;
      THUNDER.strikes.forEach((s, i) => {
        lay.spots.push({ x: h.x, y: h.y, t, k: i, r: s.warn });
        t += s.warn + THUNDER.gap;
      });
      break;
    }
    case 'avalanche':
      lay.side = rng.next() < 0.5 ? 1 : -1;
      break;
    case 'contagion': {
      // (the rune splits into sparks that leap to four spots over the floor, one near him; the sickness spreading out of each,
      // patch by patch, ragged, each patch's own moment)
      const size = WS2_TUNE.contagion.cell;
      const x0 = FINAL_PLACE.cx - FINAL_PLACE.floor;
      const y0 = FINAL_PLACE.cy - FINAL_PLACE.floor;
      const n = Math.ceil((2 * FINAL_PLACE.floor) / size);
      const at = new Float64Array(n * n).fill(Infinity);
      const from = new Int32Array(n * n).fill(-1);
      const open: number[] = [];
      const seeds: [number, number, number][] = [];
      CONTAGION.seeds.forEach(([, , st], i) => {
        let sx = h.x;
        let sy = h.y;
        if (i > 0) {
          for (let tries = 0; tries < 30; tries++) {
            const a = rng.range(0, Math.PI * 2);
            const r = rng.range(2.5, FINAL_PLACE.floor - 0.8);
            sx = FINAL_PLACE.cx + Math.cos(a) * r;
            sy = FINAL_PLACE.cy + Math.sin(a) * r;
            if (seeds.every(([qx, qy]) => Math.hypot(qx - sx, qy - sy) > 3.5)) break;
          }
        } else {
          sx += rng.range(-0.8, 0.8);
          sy += rng.range(-0.8, 0.8);
        }
        seeds.push([sx, sy, st]);
      });
      for (const [sx, sy, st] of seeds) {
        const i = Math.floor((sx - x0) / size);
        const j = Math.floor((sy - y0) / size);
        if (i < 0 || j < 0 || i >= n || j >= n) continue;
        const k = j * n + i;
        at[k] = Math.min(at[k], st);
        open.push(k);
        lay.spots.push({ x: sx, y: sy, t: st, k: lay.spots.length });
      }
      while (open.length) {
        let bi = 0;
        for (let q = 1; q < open.length; q++) if (at[open[q]] < at[open[bi]]) bi = q;
        const k = open.splice(bi, 1)[0];
        const i = k % n;
        const j = Math.floor(k / n);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const ii = i + di;
          const jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
          const cx = x0 + (ii + 0.5) * size;
          const cy = y0 + (jj + 0.5) * size;
          if (!fits(cx, cy, 0) || Math.hypot(cx - m.x, cy - m.y) < 1.3) continue;
          const kk = jj * n + ii;
          const d = (CONTAGION.step[0] + (CONTAGION.step[1] - CONTAGION.step[0]) * rng.next()) * (di && dj ? 1.41 : 1);
          if (at[k] + d < at[kk]) {
            if (!isFinite(at[kk])) open.push(kk);
            at[kk] = at[k] + d;
            from[kk] = k;
          }
        }
      }
      lay.grid = { x0, y0, n, m: n, size, at, from };
      break;
    }
    case 'blight':
      for (const tr of BLIGHT_TREES) {
        const w = own(m.x, m.y, fx, fy, tr.at[0], tr.at[1]);
        if (fits(w.x, w.y, 0.4)) lay.spots.push({ x: w.x, y: w.y, t: tr.t - S, k: tr.seed, r: tr.size });
      }
      break;
    case 'fumes':
      FUMES_CLOUDS.forEach((c, i) => {
        const w = own(m.x, m.y, fx, fy, c.at[0], c.at[1]);
        // (a cloud the floor has no room for is drawn in toward the middle)
        let x = w.x;
        let y = w.y;
        const R = c.R / T;
        const d = Math.hypot(x - FINAL_PLACE.cx, y - FINAL_PLACE.cy);
        const most = FINAL_PLACE.floor - R * 0.6;
        if (d > most) {
          x = FINAL_PLACE.cx + ((x - FINAL_PLACE.cx) / d) * most;
          y = FINAL_PLACE.cy + ((y - FINAL_PLACE.cy) / d) * most;
        }
        lay.spots.push({ x, y, t: c.vent - S, k: i, r: R, done: c.boom - S });
      });
      break;
    case 'wildfire': {
      // (sixteen spots at random all over the floor, none near another, each its own moment; the arcs between those near each other)
      for (let i = 0, tries = 0; i < WILDFIRE.spots && tries < 400; tries++) {
        const a = rng.range(0, Math.PI * 2);
        const r = Math.sqrt(rng.range(0, 1)) * (FINAL_PLACE.floor - 0.7);
        const x = FINAL_PLACE.cx + Math.cos(a) * r;
        const y = FINAL_PLACE.cy + Math.sin(a) * r;
        if (Math.hypot(x - m.x, y - m.y) < 1.6 || lay.spots.some((q) => Math.hypot(q.x - x, q.y - y) < 2.2)) continue;
        lay.spots.push({ x, y, t: WILDFIRE.first + (WILDFIRE.over * i) / WILDFIRE.spots, k: i });
        i++;
      }
      lay.links = [];
      for (let i = 0; i < lay.spots.length; i++) for (let j = i + 1; j < lay.spots.length; j++) {
        const a = lay.spots[i];
        const b = lay.spots[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) <= WS2_TUNE.wildfire.link) lay.links.push([i, j]);
      }
      break;
    }
    case 'scald':
    case 'frostbite':
      break;
  }
  LAYS.set(p, lay);
  // (THE SLAM'S RING, rolling out over the whole floor from him: it cannot be dodged)
  R.peril(m, 'act1', m.x, m.y, { a1: 'wsboss:slamring', dur: (FINAL_PLACE.floor * 2) / WS2_TUNE.ring.pace, hit: 0, dmg: roll });
  return p;
}

/** How far the slam's ring has rolled out, `t` seconds on (tiles). */
export const slamRingAt = (t: number): number => 0.6 + WS2_TUNE.ring.pace * t;
/** A Scald's beam: where it points (radians, his own: 0 the way he aimed it), and whether it is firing; null before or after. */
export function scaldBeamAt(t: number, kind: 'fire' | 'frost'): { ang: number; on: number } | null {
  if (t < SCALD.tele[0] || t > SCALD.beams[1]) return null;
  const u = Math.max(0, t - SCALD.beams[0]);
  const deg = kind === 'fire' ? SCALD.fire0 - SCALD.turn * u : SCALD.frost0 + SCALD.turn * u;
  return { ang: (deg * Math.PI) / 180, on: t < SCALD.beams[0] ? 0 : Math.min(1, (t - SCALD.beams[0]) / 0.08) };
}
/** The Avalanche: how far its front has come and its tail gone, along its way across the floor (tiles from the floor's far side
 * behind him), and how wide the floor is that way. */
export function avalancheAt(t: number): { front: number; tail: number; span: number } {
  const span = FINAL_PLACE.floor * 2;
  const out = AVAL.rumble[1];
  const f = Math.max(0, Math.min(1, (t - out) / AVAL.cross));
  const g = Math.max(0, Math.min(1, (t - out - AVAL.cross - AVAL.stream) / AVAL.tail));
  return { front: f * span, tail: g * span, span };
}
/** Whether (x, y) is on the Avalanche's safe strip: the floor's edge on his left (side +1) or right (-1), along its way. */
export function avalancheSpared(p: Peril, x: number, y: number): boolean {
  const side = layOf(p)?.side ?? 1;
  const across = (x - FINAL_PLACE.cx) * p.fy - (y - FINAL_PLACE.cy) * p.fx;
  return across * side >= FINAL_PLACE.floor - WS2_TUNE.avalanche.safe;
}
/** Blight: how far its rot has crept (his own lengths) `t` seconds from the slam, and whether it has reached (px, py). */
export function blightReached(p: Peril, t: number, px: number, py: number): boolean {
  const o = ownOf(p.x, p.y, p.fx, p.fy, px, py);
  const F = BLIGHT_FIELD;
  const i = Math.round(o.a) - F.x0;
  const j = Math.round(o.b) - F.y0;
  if (i < 0 || j < 0 || i >= F.w || j >= F.h) return false;
  const d = F.at[j * F.w + i];
  if (!isFinite(d)) return false;
  const u = Math.max(0, Math.min(1, (t - BLIGHT.spread[0]) / (BLIGHT.spread[1] - BLIGHT.spread[0])));
  return d <= u * F.far;
}
/** Fumes: how far a cloud has spread (0 ... 1) `t` seconds from the slam. */
export const fumesSpreadAt = (c: { t: number }, t: number): number => {
  const u = Math.max(0, Math.min(1, (t - c.t) / FUMES.spread));
  return u * u * (3 - 2 * u);
};
/** Wildfire: when the whole web goes up (seconds from the slam). */
export const WILD_BOOM = WILDFIRE.link + WILDFIRE.hold;

/** A step of one of his melds' perils: what it does to the hero. */
export function meldPeril(R: BossRules, p: Peril, dt: number): void {
  const g = R.g;
  const h = g.hero;
  const id = (p.a1 ?? '').slice(7) as MeldId | 'slamring';
  const t = p.t;
  const t0 = t - dt;
  const lay = LAYS.get(p);
  const hurt = (mult: number, ox = p.x, oy = p.y, dodge = true): boolean => {
    if (dodge && h.move) return false;
    g.hurtHero(p.dmg * mult, p.el, p.words, null, p.from, ox, oy, p.half);
    return true;
  };
  const tick = (every: number, mult: number): void => {
    p.d -= dt;
    if (p.d <= 0) {
      p.d = every;
      hurt(mult, h.x, h.y, false);
    }
  };
  const chill = (k: number): void => {
    h.chill = Math.max(h.chillT > 0 ? h.chill : 0, k);
    h.chillT = Math.max(h.chillT, 0.5);
  };
  switch (id) {
    case 'slamring': {
      // (it cannot be dodged: once it rolls under him it has him)
      if (p.done) return;
      if (Math.abs(Math.hypot(h.x - p.x, h.y - p.y) - slamRingAt(t)) <= WS2_TUNE.ring.band) {
        p.done = 1;
        hurt(WS2_TUNE.ring.dmg, p.x, p.y, false);
      }
      return;
    }
    case 'eruption':
      for (const v of lay?.spots ?? []) {
        if (v.done || t < v.t || t > v.t + ERUPT.burst + ERUPT.hold) continue;
        if (Math.hypot(h.x - v.x, h.y - v.y) <= WS2_TUNE.eruption.reach && hurt(WS2_TUNE.eruption.dmg, v.x, v.y)) v.done = 1;
      }
      return;
    case 'hailstorm':
      for (const s of lay?.spots ?? []) {
        // (a stone let go at him, as it is let go: where he is then)
        if (s.r === 1 && t0 < s.t - HAIL.fall - HAIL.warn && t >= s.t - HAIL.fall - HAIL.warn) {
          s.x = h.x + g.rng.range(-0.4, 0.4);
          s.y = h.y + g.rng.range(-0.4, 0.4);
        }
        if (s.r === 2 && t0 < s.t - HAIL.boltWarn && t >= s.t - HAIL.boltWarn) {
          s.x = h.x;
          s.y = h.y;
        }
        if (s.done || t0 >= s.t || t < s.t) continue;
        s.done = 1;
        const bolt = s.r === 2;
        if (bolt) g.emit({ t: 'shake', amount: 4 });
        if (Math.hypot(h.x - s.x, h.y - s.y) <= (bolt ? WS2_TUNE.hail.bolt.reach : WS2_TUNE.hail.reach) && hurt(bolt ? WS2_TUNE.hail.bolt.dmg : WS2_TUNE.hail.dmg, s.x, s.y) && !bolt) chill(WS2_TUNE.hail.chill);
      }
      return;
    case 'thunder':
      for (const s of lay?.spots ?? []) {
        // (it locks on where he is as it comes round, and follows him a little while it charges, then holds)
        const lock = s.t;
        const bolt = s.t + (s.r ?? 0.6);
        if (t >= lock && t < bolt - 0.25) {
          const f = Math.min(1, dt * 1.5);
          s.x += (h.x - s.x) * f;
          s.y += (h.y - s.y) * f;
        }
        if (t0 < bolt && t >= bolt) {
          g.emit({ t: 'shake', amount: 6 });
          g.sfx('thunder', 0.9);
          if (Math.hypot(h.x - s.x, h.y - s.y) <= WS2_TUNE.thunder.reach) hurt(WS2_TUNE.thunder.dmg, s.x, s.y);
        }
        // (its thunderclap rolling out after it: knocked back)
        const u = t - bolt - THUNDER.clapAfter;
        if (u > 0 && u < THUNDER.clapLong && !(((s.done ?? 0) | 0) & 1)) {
          const r = 0.3 + THUNDER.clap * (1 - (1 - u / THUNDER.clapLong) ** 2);
          if (Math.abs(Math.hypot(h.x - s.x, h.y - s.y) - r) <= WS2_TUNE.thunder.clap.band && !h.move) {
            s.done = 1;
            hurt(WS2_TUNE.thunder.clap.dmg, s.x, s.y);
            g.knockHero(s.x, s.y, WS2_TUNE.thunder.clap.knock);
          }
        }
      }
      return;
    case 'avalanche': {
      const A = avalancheAt(t);
      if (A.front <= 0 || p.done) return;
      // (where he is along its way, from the far side behind the boss)
      const along = (h.x - FINAL_PLACE.cx) * p.fx + (h.y - FINAL_PLACE.cy) * p.fy + FINAL_PLACE.floor;
      if (along <= A.front && along >= A.tail && !avalancheSpared(p, h.x, h.y)) {
        p.done = 1;
        hurt(WS2_TUNE.avalanche.dmg, h.x - p.fx, h.y - p.fy, false);
        // (frozen in it: long enough to be hit)
        h.iceT = Math.max(h.iceT ?? 0, WS2_TUNE.avalanche.freeze);
      }
      return;
    }
    case 'contagion': {
      const G = lay?.grid;
      if (!G) return;
      const i = Math.floor((h.x - G.x0) / G.size);
      const j = Math.floor((h.y - G.y0) / G.size);
      if (i < 0 || j < 0 || i >= G.n || j >= G.m) return;
      const at = G.at[j * G.n + i];
      // (sick for a moment as it passes: then burned out, and safe)
      if (t >= at && t < at + CONTAGION.sick) tick(WS2_TUNE.contagion.every, WS2_TUNE.contagion.dmg);
      return;
    }
    case 'scald': {
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      // (the steam, once it has flashed: burned and chilled in it)
      if (t > SCALD.flash && t < SCALD.flash + SCALD.hang && d >= WS2_TUNE.scald.inner && d <= WS2_TUNE.scald.outer) {
        tick(WS2_TUNE.scald.every, WS2_TUNE.scald.dmg);
        chill(0.4);
      }
      // (the beams, each from him to the wall, sweeping round)
      for (const kind of ['fire', 'frost'] as const) {
        const B = scaldBeamAt(t, kind);
        if (!B || B.on < 1 || h.move) continue;
        const ca = Math.cos(B.ang);
        const sa = Math.sin(B.ang);
        const bx = p.fx * ca + p.fy * sa;
        const by = p.fy * ca - p.fx * sa;
        const along = (h.x - p.x) * bx + (h.y - p.y) * by;
        const across = Math.abs(-(h.x - p.x) * by + (h.y - p.y) * bx);
        const key = kind === 'fire' ? 'b' : 'c';
        if (along > 0.4 && across <= WS2_TUNE.scald.beam.half && t - (p[key] || -9) > WS2_TUNE.scald.beam.every) {
          p[key] = t;
          hurt(WS2_TUNE.scald.beam.dmg, p.x, p.y, false);
          if (kind === 'frost') chill(0.6);
        }
      }
      return;
    }
    case 'blight': {
      // (the trees punch up through the rot: on the rot as they burst, impaled, Blight's poison in him)
      const heave = BLIGHT.heave;
      if (t0 < heave && t >= heave && !h.move && blightReached(p, heave, h.x, h.y)) {
        hurt(WS2_TUNE.blight.dmg, h.x, h.y);
        h.poisonT = Math.max(h.poisonT ?? 0, WS2_TUNE.blight.poison);
        h.poisonDps = Math.max(h.poisonDps ?? 0, (p.dmg * 0.08) / 1);
      }
      return;
    }
    case 'fumes': {
      for (const c of lay?.spots ?? []) {
        const r = (c.r ?? 1.5) * fumesSpreadAt(c, t);
        const inIt = Math.hypot(h.x - c.x, h.y - c.y) <= r;
        const boom = c.done ?? 99;
        if (inIt && t > c.t && t < boom) tick(WS2_TUNE.fumes.every, WS2_TUNE.fumes.dmg);
        if (t0 < boom && t >= boom) {
          g.emit({ t: 'shake', amount: 4 });
          g.sfx('explode', 0.8);
          if (inIt) hurt(WS2_TUNE.fumes.boom, c.x, c.y);
        }
      }
      return;
    }
    case 'wildfire': {
      const W = WS2_TUNE.wildfire;
      for (const s of lay?.spots ?? []) {
        if (t0 < s.t && t >= s.t && Math.hypot(h.x - s.x, h.y - s.y) <= W.reach) hurt(W.dmg, s.x, s.y);
      }
      // (the arcs between burning spots: crossing them burns and shocks)
      if (t < WILD_BOOM) {
        for (const [a, b] of lay?.links ?? []) {
          const A = lay!.spots[a];
          const B = lay!.spots[b];
          if (t < Math.max(A.t, B.t)) continue;
          const vx = B.x - A.x;
          const vy = B.y - A.y;
          const L = Math.hypot(vx, vy) || 1;
          const u = ((h.x - A.x) * vx + (h.y - A.y) * vy) / (L * L);
          if (u < 0 || u > 1) continue;
          if (Math.abs((-(h.x - A.x) * vy + (h.y - A.y) * vx) / L) <= W.arc.half) {
            tick(W.arc.every, W.arc.dmg);
            break;
          }
        }
      }
      // (the whole web goes up at once)
      if (t0 < WILD_BOOM && t >= WILD_BOOM) {
        g.emit({ t: 'shake', amount: 7 });
        g.sfx('explode', 1);
        const near = (lay?.spots ?? []).some((s) => Math.hypot(h.x - s.x, h.y - s.y) <= W.boom.reach);
        if (near) hurt(W.boom.dmg, h.x, h.y);
      }
      return;
    }
    case 'frostbite': {
      // (the gale: no dodging it, chilled and poisoned the whole while; in the eye round him, out of it)
      if (t < FROSTBITE.gale[0] || t > FROSTBITE.gale[1]) return;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= WS2_TUNE.frostbite.eye) return;
      chill(WS2_TUNE.frostbite.chill);
      tick(WS2_TUNE.frostbite.every, WS2_TUNE.frostbite.dmg);
      return;
    }
  }
}

/** The next meld, drawn at random from those that fit (never the same twice running; a FLOOR meld never straight after another). */
export function drawMeld(R: BossRules, last: MeldId | null): MeldId {
  const fits0 = MELD_IDS.filter((id) => id !== last && !(last && MELDS[last].floor && MELDS[id].floor));
  return fits0[Math.floor(R.g.rng.range(0, fits0.length)) % fits0.length];
}
