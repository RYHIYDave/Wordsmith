// ACT 1: THE UNFINISHED, FLOOR 6'S BOSS (the Quarry; its floor "The Unfinished Cut"): its rules (game/act1_rules/types.ts).
//
// The owner's doc: "A stone colossus the cult half-carved out of the quarry wall and woke with its chanting. It starts
// fused to the wall and tears itself free at half life. Moves: a fist slam (its basic attack); a rockslide that
// sends boulders rolling down lanes across the terraces; a hurled block that stays as cover; a stomp that cracks the
// terrace." The art chat's pictures of every one of them (art/unfinished.ts, his yeses of 13 Oct by 14:56), in the
// wall and free, as handed over in its post of 13 Oct, 17:20: "the block is yours to fly ... landed, standing as
// cover"; "boulders ... rolling toward +y, the lanes yours"; "stompCracks(k), a floor piece". What each hurts, how
// far, how often, and the lanes, are the main chat's: this file.
//
// HOW IT FIGHTS. It stands with its back in the quarry's far wall, facing out over its cut (`bossAt`): one with the
// wall, it does not walk, and turns no further than its picture there allows (its back stays to the wall); from
// there it slams, stomps, hurls blocks and brings the rockslide down. When its life falls below half it TEARS ITSELF
// FREE (a move of its own the rules bring), and from then on it is free: it walks after the hero, grinding, and
// makes the same four moves. Its four, by his rulebook: the fist slam, its basic blow; the hurled block, at one who
// stands off, which lands where he stood (its shadow shows where) and stays there as cover, a block of the floor
// (the rockslide's boulders break on it); the stomp, a ring round its foot (its ring of warning on the floor), the
// terrace cracked under it; the rockslide, its biggest: two blows on the terrace, and at each a wave of boulders
// comes down off the cliff along lanes marked on the floor, the second wave between the first's.
//
// The rules know nothing of its pictures: every number here that is a picture's is written down here, and
// tests/act1_unfinished.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG, TUNE } from '../defs';
import { beside, fromFigure, handOf } from '../facing';
import type { Level, Monster, Peril } from '../state';
import { T_WALL } from '../types';
import type { Act1Rules } from './types';

// ---------------------------------------------------------------------------------------------
// ITS NUMBERS (the pictures' own where they are the pictures'; tiles before it and to its left)

export const UF = {
  /**
   * It tears itself free of the wall when its life falls below this share of it. (Half, as his doc had it, until 17 Oct
   * 2026: "Neither the unfinished nor the carrion queen moved at all during the fight", 11:37; read as: it tears free
   * soon after the fight begins, and walks after the hero for the rest of it.)
   */
  freeAt: 0.85,
  /** In the wall it turns to the hero no further than this from the way it was carved facing (radians): its picture there stays the one, its back to the wall. */
  turn: 0.7,
  /** The fist slam: its right fist comes down `fist` and skids on to `skid` (art: SLAM_AT, the skid 0.22 s on); what is within `r` of that is struck. */
  slam: { fist: [2.04, -0.66] as const, skid: [2.4, -0.71] as const, r: 1.0 },
  /** The stomp: its right toe comes down at `at`; what is within `r` of it is struck (its ring of warning from `warnFrom`, as its mark flares); the terrace stays cracked there `cracks` seconds. */
  stomp: { at: [1.03, -0.89] as const, r: 2.8, warnFrom: 0.5, cracks: 7 },
  /**
   * The hurled block: torn up out of the floor at `tear`; it is aimed at where the hero stands at `aim` (as it holds
   * the block over its head: its shadow is on the floor from then), no nearer than `least` and no further than
   * `most`, turned no more than `wide` (radians) off the way it faces; it leaves its hands at the move's blow, from
   * `from` (before it, to its left, and its height, tiles), flies `fly(d)` seconds and lands, striking what is within
   * `r`; then it lies there as cover for `lies` seconds (`most` of them at once: the oldest crumbles), a block of the
   * floor half `half` a tile across.
   */
  hurl: { tear: 0.85, aim: 1.4, from: [1.79, 0, 6.02] as const, least: 2.5, most: 9, wide: 0.7, r: 1.0, lies: 30, blocks: 4, crumble: 0.6, half: 0.62 },
  /**
   * The rockslide: at each of its blows (`hits`) a wave of boulders comes down off the cliff along lanes (along the
   * floor's y or its x: the way the boulders are painted rolling), marked on the floor from `laid` (each wave's); the
   * first wave's lanes are through the hero and `apart` x 2 to either side, the second's between them and beyond;
   * each boulder drops in from the cliff (`drop` seconds), rolls at `speed`, harms within `r` (once), and breaks on
   * the lane's end, a wall, or a hurled block.
   */
  slide: { hits: [1.6, 2.16] as const, laid: [0.9, 1.6] as const, apart: 3, waves: [[0, -2, 2], [-1, 1, -3, 3]] as const, speed: 4.6, r: 0.62, drop: 0.25, back: 18, far: 26, burst: 0.6, clear: 2.6 },
  /** Tearing free: the wall rips at `hit`; what is within `r` before it is struck and thrown back. */
  tear: { r: 2.6 },
};

/** How long a hurled block is in the air, thrown `d` tiles. */
export function blockFly(d: number): number {
  return 0.5 + 0.04 * d;
}

// ---------------------------------------------------------------------------------------------
// ITS GAIT AND ITS ACTS

/** Its walk: 24 frames at 8 a second, painted for 0.9 tiles a second; setting off and stopping a second each (art: UF_PACE, ufSetOff, ufHalt). From behind it is painted as the heroes are. */
export const UF_GAIT: GaitDef = { pace: 0.9, cycle: 3.0, setOff: 1.0, halt: 1.0, raise: 0, lower: 0, stopAt: 2.0, slack: 0.8, trueBack: false };

/** Its acts free, and the same in the wall (`...Wall`, its pictures in the wall); tearing free, which the rules bring. */
export const UF_ACTS: readonly ActDef[] = [
  { id: 'unfinished:slam', clip: 'attack', long: 2.5, hit: 1.2, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 2.9 },
  { id: 'unfinished:slamWall', clip: 'fusedSlam', long: 2.5, hit: 1.2, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 2.9 },
  { id: 'unfinished:hurl', clip: 'hurl', long: 3.2, hit: 2.0, dmg: 1.2, cooldown: 7, first: 3, after: 0.6, near: 2.9, far: 9.5 },
  { id: 'unfinished:hurlWall', clip: 'fusedHurl', long: 3.2, hit: 2.0, dmg: 1.2, cooldown: 7, first: 3, after: 0.6, near: 2.9, far: 9.5 },
  { id: 'unfinished:stomp', clip: 'stomp', long: 2.6, hit: 1.3, dmg: 1.3, cooldown: 9, first: 5, after: 0.7, near: 0, far: 3.2 },
  { id: 'unfinished:stompWall', clip: 'fusedStomp', long: 2.6, hit: 1.3, dmg: 1.3, cooldown: 9, first: 5, after: 0.7, near: 0, far: 3.2 },
  { id: 'unfinished:rockslide', clip: 'rockslide', long: 3.4, hit: 1.6, dmg: 0.9, cooldown: 14, first: 8, after: 0.8, near: 0, far: 14 },
  { id: 'unfinished:rockslideWall', clip: 'fusedRockslide', long: 3.4, hit: 1.6, dmg: 0.9, cooldown: 14, first: 8, after: 0.8, near: 0, far: 14 },
  { id: 'unfinished:tear', clip: 'tearFree', long: 3.3, hit: 1.4, dmg: 0.8, cooldown: 0, first: 0, after: 0.6, near: 0, far: 0, forced: true },
];

/** Is it still one with the wall? */
export const inWall = (m: Monster): boolean => (m.form ?? 0) === 0;
/** Is an act one of those made in the wall? */
const wallAct = (a: ActDef): boolean => a.id.endsWith('Wall');
/** An act's move, whether made in the wall or free ('slam', 'hurl', 'stomp', 'rockslide', 'tear'). */
const moveOf = (a: ActDef): string => a.id.slice('unfinished:'.length).replace(/Wall$/, '');

// ---------------------------------------------------------------------------------------------
// WHERE IT STANDS: its back in the quarry's far wall

export interface Perch {
  x: number;
  y: number;
  fx: number;
  fy: number;
}
const perches = new WeakMap<Level, Perch | null>();

/**
 * WHERE THE UNFINISHED STANDS ON ITS FLOOR: in its area, with the quarry's wall (rock, not a piece on the floor)
 * close behind it, as its picture in the wall has its stone (about a tile and a half behind its floor point), the
 * wall across its whole width, and open floor before it; facing out over the cut, along the floor's x or its y
 * (its picture's own ways round, seen from in front: its back to a far wall, up the screen), the way in rather
 * than not, and as far from where the way comes in as may be. Null where the floor has no such place.
 */
export function perchOf(L: Level): Perch | null {
  if (perches.has(L)) return perches.get(L) ?? null;
  const got = findPerch(L);
  perches.set(L, got);
  return got;
}
function findPerch(L: Level): Perch | null {
  const land = L.land;
  if (!land || land.kind !== 'quarry') return null;
  const area = land.areas.find((a) => a.role === 'boss');
  if (!area) return null;
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const tile = (x: number, y: number): number => (x < 0 || y < 0 || x >= W || y >= H ? -1 : Math.floor(y) * W + Math.floor(x));
  const walk = (x: number, y: number): boolean => {
    const i = tile(x, y);
    return i >= 0 && L.walk[i] === 1;
  };
  // (the wall: its rock, or a tile its rounded edge cuts across; not a piece standing on the floor)
  const rock = (x: number, y: number): boolean => {
    const i = tile(x, y);
    return i < 0 || f.tiles[i] === T_WALL || (!!f.cut && f.cut[i] !== 0);
  };
  /** How far behind (x, y) along (-fx, -fy) the floor ends, and whether it ends at the wall. */
  const behind = (x: number, y: number, fx: number, fy: number): number => {
    for (let s = 0.1; s <= 3; s += 0.1) if (!walk(x - fx * s, y - fy * s)) return rock(x - fx * s, y - fy * s) ? s : Infinity;
    return Infinity;
  };
  const clear = (x: number, y: number, r: number): boolean => {
    for (const [ox, oy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) if (!walk(x + ox, y + oy)) return false;
    return true;
  };
  const way = land.way;
  const entry = way.length >= 2 ? way[way.length - 2] : [f.start.x, f.start.y];
  const ix = entry[0] - area.blob.x;
  const iy = entry[1] - area.blob.y;
  const il = Math.hypot(ix, iy) || 1;
  let best: Perch | null = null;
  let bestScore = -Infinity;
  const R = Math.max(area.blob.rx, area.blob.ry) * 1.2 + 2;
  for (let y = area.blob.y - R; y <= area.blob.y + R; y += 0.5) {
    for (let x = area.blob.x - R; x <= area.blob.x + R; x += 0.5) {
      if (!clear(x, y, 0.9)) continue;
      for (const [fx, fy] of [[1, 0], [0, 1]]) {
        const D = behind(x, y, fx, fy);
        if (D < 0.9 || D > 1.6) continue;
        // (the wall behind it across its width)
        const ex = -fy;
        const ey = fx;
        const Dl = behind(x + ex, y + ey, fx, fy);
        const Dr = behind(x - ex, y - ey, fx, fy);
        if (!(Dl <= 2.2 && Dr <= 2.2)) continue;
        // (open floor before it, for its blows)
        let open = true;
        for (let s = 1; s <= 5 && open; s += 0.5) open = clear(x + fx * s, y + fy * s, 0.6);
        if (!open) continue;
        const score = 2 * ((fx * ix + fy * iy) / il) - 2 * Math.abs(D - 1.2) - 0.5 * Math.abs(Dl - Dr) + 0.05 * Math.hypot(x - entry[0], y - entry[1]);
        if (score > bestScore) {
          bestScore = score;
          best = { x, y, fx, fy };
        }
      }
    }
  }
  return best;
}

// ---------------------------------------------------------------------------------------------
// WHAT IT KEEPS (Monster.a1): the way it was carved facing, in the wall

function keptOf(m: Monster): Record<string, number> {
  if (!m.a1) m.a1 = { bfx: m.fx, bfy: m.fy };
  return m.a1;
}

/** Turned toward the hero; in the wall, no further than its picture there allows. */
function turnToHero(R: BossRules, m: Monster): void {
  const h = R.g.hero;
  const dx = h.x - m.x;
  const dy = h.y - m.y;
  if (Math.hypot(dx, dy) < 0.01) return;
  let a = Math.atan2(dy, dx);
  if (inWall(m)) {
    const k = keptOf(m);
    const base = Math.atan2(k.bfy, k.bfx);
    let d = a - base;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    a = base + Math.max(-UF.turn, Math.min(UF.turn, d));
  }
  m.fx = Math.cos(a);
  m.fy = Math.sin(a);
}

/** Would its rules have it make an act now (as BossRules.pickAct would choose one)? */
function anyReady(R: BossRules, m: Monster, dist: number): boolean {
  if (forcedAct(m) >= 0) return true;
  if (m.cd > 0 || !m.moveCd) return false;
  const g = R.g;
  const los = dist < 16 && g.sees(m.x, m.y, g.hero.x, g.hero.y);
  return UF_ACTS.some((a, i) => !a.forced && m.moveCd![i] <= 0 && dist >= a.near && dist <= a.far && allowed(m, a) && los);
}
const allowed = (m: Monster, a: ActDef): boolean => wallAct(a) === inWall(m);
function forcedAct(m: Monster): number {
  return inWall(m) && m.life < m.maxLife * UF.freeAt ? UF_ACTS.findIndex((a) => a.id === 'unfinished:tear') : -1;
}

// ---------------------------------------------------------------------------------------------
// ITS PERILS: the hurled block, the lanes and their boulders, the cracked terrace

const tileOf = (L: Level, x: number, y: number): number => {
  const f = L.floor;
  return x < 0 || y < 0 || x >= f.w || y >= f.h ? -1 : Math.floor(y) * f.w + Math.floor(x);
};
const walkAt = (L: Level, x: number, y: number): boolean => {
  const i = tileOf(L, x, y);
  return i >= 0 && L.walk[i] === 1;
};

/** Where the block it holds will come down: where the hero stands, as near and far as it can throw, as far round as it turns, on the floor. */
function aimOf(R: BossRules, m: Monster): { x: number; y: number } {
  const g = R.g;
  const H = UF.hurl;
  const h = g.hero;
  let a = Math.atan2(h.y - m.y, h.x - m.x);
  const face = Math.atan2(m.fy, m.fx);
  let d = a - face;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  a = face + Math.max(-H.wide, Math.min(H.wide, d));
  let far = Math.max(H.least, Math.min(H.most, Math.hypot(h.x - m.x, h.y - m.y)));
  // (short of a wall: brought back toward it till it is on the floor)
  while (far > H.least && !walkAt(g.level, m.x + Math.cos(a) * far, m.y + Math.sin(a) * far)) far -= 0.25;
  return { x: m.x + Math.cos(a) * far, y: m.y + Math.sin(a) * far };
}

/** THE ROCKSLIDE'S LANES of one wave, laid along (dx, dy) on the floor, each its boulder coming down `at` seconds from now. */
function layLanes(R: BossRules, m: Monster, wave: number, dx: number, dy: number, at: number, dmg: number): void {
  const g = R.g;
  const L = g.level;
  const S = UF.slide;
  const h = g.hero;
  const ex = -dy;
  const ey = dx;
  for (const k of S.waves[wave]) {
    const off = k * S.apart;
    let px = h.x + ex * off;
    let py = h.y + ey * off;
    // (no lane through the Unfinished itself)
    if (Math.abs((m.x - px) * ex + (m.y - py) * ey) < S.clear) continue;
    // (a lane whose middle is not on the floor is looked for a little up and down its way)
    if (!walkAt(L, px, py)) {
      let found = false;
      for (let s = 0.5; s <= 8 && !found; s += 0.5) {
        for (const sg of [-1, 1]) {
          if (walkAt(L, px + dx * s * sg, py + dy * s * sg)) {
            px += dx * s * sg;
            py += dy * s * sg;
            found = true;
            break;
          }
        }
      }
      if (!found) continue;
    }
    // (from the cliff's foot up its way, to where the floor ends down it)
    let back = 0;
    while (back < S.back && walkAt(L, px - dx * (back + 0.25), py - dy * (back + 0.25))) back += 0.25;
    const sx = px - dx * back;
    const sy = py - dy * back;
    let long = 0;
    while (long < S.far && walkAt(L, sx + dx * (long + 0.25), sy + dy * (long + 0.25))) long += 0.25;
    if (long < 3) continue;
    R.peril(m, 'act1', sx, sy, { a1: 'unfinished:lane', fx: dx, fy: dy, t: 0, hit: at, dur: at + long / S.speed + S.drop + 1, dmg, a: sx, b: sy, c: long, d: 0 });
  }
}

/** A step of one of its perils. */
function stepPeril(R: BossRules, p: Peril, dt: number): void {
  const g = R.g;
  const h = g.hero;
  const L = g.level;
  const what = p.a1;
  if (what === 'unfinished:block') {
    const H = UF.hurl;
    if (!p.done && p.t >= p.hit) {
      // (it lands: what is under it is struck, and thrown off)
      p.done = 1;
      const hd = Math.hypot(h.x - p.x, h.y - p.y);
      if (hd <= H.r + TUNE.heroRadius * 0.5) {
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
        g.knockHero(p.x, p.y, 1);
        // (and he is thrown out from under it, as far as the floor lets him)
        const out = H.half + TUNE.heroRadius + 0.15 - hd;
        if (out > 0 && !h.move && !g.over) {
          const ux = hd > 0.01 ? (h.x - p.x) / hd : -h.fx;
          const uy = hd > 0.01 ? (h.y - p.y) / hd : -h.fy;
          g.slide(h, TUNE.heroRadius, ux * out, uy * out, L.walk);
        }
      }
      g.emit({ t: 'shake', amount: 4 });
      g.sfx('slam', 0.8);
      // (as many as may lie: the oldest crumbles)
      const lying = g.perils.filter((q) => q.kind === 'act1' && q.a1 === 'unfinished:block' && q.done && q.dur - q.t > H.crumble);
      if (lying.length > H.blocks) {
        const old = lying.reduce((a, b) => (a.t > b.t ? a : b));
        old.dur = old.t + H.crumble;
      }
    }
    // (lying, it is a block of the floor: once nobody stands where it lies)
    if (p.done && !p.d && p.dur - p.t > H.crumble) {
      const i = tileOf(L, p.x, p.y);
      const tx = Math.floor(p.x) + 0.5;
      const ty = Math.floor(p.y) + 0.5;
      const near = (x: number, y: number, r: number): boolean => Math.abs(x - tx) < 0.5 + r && Math.abs(y - ty) < 0.5 + r;
      if (i >= 0 && L.walk[i] === 1 && !near(h.x, h.y, TUNE.heroRadius) && !g.monsters.some((o) => !o.dead && near(o.x, o.y, Math.min(o.r, 0.42)))) {
        L.walk[i] = 0;
        p.d = i + 1;
      }
    }
    // (crumbling, it is floor again)
    if (p.d && p.dur - p.t <= H.crumble) {
      L.walk[p.d - 1] = 1;
      p.d = 0;
    }
  } else if (what === 'unfinished:lane') {
    const S = UF.slide;
    // (the boulder comes down off the cliff, then rolls: harming the hero once if it meets him; breaking where the floor ends, on a wall or on a hurled block)
    if (p.t < p.hit + S.drop || p.done === 2) return;
    const was = p.d;
    const roll = Math.min(dt, p.t - p.hit - S.drop) * S.speed;
    const steps = Math.max(1, Math.ceil(roll / 0.2));
    for (let s = 1; s <= steps; s++) {
      const d = was + (roll * s) / steps;
      const x = p.a + p.fx * d;
      const y = p.b + p.fy * d;
      const blocked = d >= p.c || !walkAt(L, x + p.fx * S.r * 0.5, y + p.fy * S.r * 0.5) || g.perils.some((q) => q.kind === 'act1' && q.a1 === 'unfinished:block' && q.done && Math.hypot(q.x - x, q.y - y) < S.r + UF.hurl.half);
      p.x = x;
      p.y = y;
      p.d = d;
      if (blocked) {
        p.done = 2;
        p.hit = p.t;
        p.dur = p.t + S.burst;
        g.sfx('slam', 0.3);
        g.emit({ t: 'shake', amount: 1 });
        return;
      }
      if (!p.done && Math.hypot(h.x - x, h.y - y) <= S.r + TUNE.heroRadius * 0.6 && h.invuln <= 0 && !h.move && !g.over) {
        p.done = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, x, y, p.half);
        g.knockHero(x - p.fy * 0.01, y + p.fx * 0.01, 1);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------

export const RULES: Act1Rules | null = {
  gait: UF_GAIT,
  acts: UF_ACTS,

  bossAt(L) {
    return perchOf(L);
  },

  spawned(R, m) {
    // (where its floor has it, its back in the wall: one with it, facing out; anywhere else, free from the first)
    const p = perchOf(R.g.level);
    if (p && Math.hypot(m.x - p.x, m.y - p.y) < 0.2) {
      m.form = 0;
      m.a1 = { bfx: p.fx, bfy: p.fy, hx: m.x, hy: m.y };
      m.fx = p.fx;
      m.fy = p.fy;
    } else m.form = 1;
  },

  tick(R, m, dt, dist) {
    // FREE, it goes as the bosses go (game/bosses.ts); IN THE WALL it stands where it is, turning only as far as the
    // wall lets it, until one of its acts is to be made (then BossRules makes it)
    if (!inWall(m)) return false;
    // (nothing moves it from the wall: game.ts keeps bodies apart, and out of the hero, by moving them; it is put back)
    const k = keptOf(m);
    if (k.hx === undefined) {
      k.hx = m.x;
      k.hy = m.y;
    }
    if (m.x !== k.hx || m.y !== k.hy) {
      m.x = k.hx;
      m.y = k.hy;
    }
    if (m.state === 'act') return false;
    // (never set off: the wall holds it)
    if (!m.gait || m.gait.mode !== 'stand') m.gait = { mode: 'stand', t: m.gait ? m.gait.t : 0 };
    if (!m.moveCd || m.moveCd.length !== UF_ACTS.length) m.moveCd = UF_ACTS.map((a) => a.first * R.g.rng.range(0.7, 1.2));
    if (anyReady(R, m, dist)) return false;
    m.state = 'chase';
    m.anim = 'idle';
    m.gait.t += dt;
    for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt;
    turnToHero(R, m);
    return true;
  },

  can(_R, m, a) {
    return allowed(m, a);
  },

  forced(_R, m) {
    return forcedAct(m);
  },

  start(R, m, a) {
    const g = R.g;
    const act = m.act!;
    // (in the wall, turned no further than the wall lets it; and its left as its picture then has it)
    if (inWall(m)) {
      turnToHero(R, m);
      act.hand = handOf(UF_GAIT.trueBack, m.fx, m.fy);
    }
    const move = moveOf(a);
    if (move === 'tear') {
      g.sfx('bossRoar', 1);
      g.msg(`${m.name} tears itself free of the wall`, MSG.foe);
    } else if (move === 'rockslide') {
      g.sfx('bossRoar', 0.6);
      // (the boulders roll along the floor's y, or its x, as they are painted: of the two, the one more across the way
      // to the hero, so that they come across between it and him, not through it)
      const ux = g.hero.x - m.x;
      const uy = g.hero.y - m.y;
      act.a = Math.abs(ux) > Math.abs(uy) ? 1 : 0;
    }
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const here = (fwd: number, left: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
    switch (moveOf(a)) {
      case 'slam': {
        if (!at(a.hit)) break;
        // (its fist comes down and skids on: what is within reach of where it goes is struck)
        const S = UF.slam;
        const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
        const [ax, ay] = S.fist;
        const [bx, by] = S.skid;
        const k = Math.max(0, Math.min(1, ((r.fwd - ax) * (bx - ax) + (r.left - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
        if (Math.hypot(r.fwd - (ax + (bx - ax) * k), r.left - (ay + (by - ay) * k)) <= S.r + TUNE.heroRadius * 0.5) {
          R.blow(m, a.dmg);
          const c = here(ax, ay);
          g.knockHero(c.x, c.y, 0.7);
        }
        g.emit({ t: 'shake', amount: 4 });
        g.sfx('slam', 0.8);
        break;
      }
      case 'stomp': {
        if (!at(a.hit)) break;
        const S = UF.stomp;
        const c = here(S.at[0], S.at[1]);
        if (Math.hypot(h.x - c.x, h.y - c.y) <= S.r + TUNE.heroRadius * 0.5) {
          R.blow(m, a.dmg);
          g.knockHero(c.x, c.y, 1);
        }
        R.peril(m, 'act1', c.x, c.y, { a1: 'unfinished:cracks', dur: S.cracks });
        g.emit({ t: 'shake', amount: 7 });
        g.sfx('slam', 1);
        break;
      }
      case 'hurl': {
        const H = UF.hurl;
        if (at(H.tear)) {
          // (the block torn up out of the floor before it)
          g.emit({ t: 'shake', amount: 2 });
          g.sfx('slam', 0.4);
        }
        if (at(H.aim)) {
          // (where it will come down: its shadow is there from now)
          const to = aimOf(R, m);
          const from = here(H.from[0], H.from[1]);
          const fly = blockFly(Math.hypot(to.x - from.x, to.y - from.y));
          const lands = a.hit - H.aim + fly;
          R.peril(m, 'act1', to.x, to.y, { a1: 'unfinished:block', t: 0, hit: lands, dur: lands + H.lies, dmg: g.rollMonsterDmg(m) * a.dmg, a: from.x, b: from.y, c: a.hit - H.aim, d: 0 });
        }
        if (at(a.hit)) g.sfx('swing', 1);
        break;
      }
      case 'rockslide': {
        const S = UF.slide;
        const dx = act.a === 1 ? 0 : 1;
        const dy = act.a === 1 ? 1 : 0;
        S.laid.forEach((T, w) => {
          if (at(T)) layLanes(R, m, w, dx, dy, S.hits[w] - T, g.rollMonsterDmg(m) * a.dmg);
        });
        for (const T of S.hits) {
          if (!at(T)) continue;
          g.emit({ t: 'shake', amount: 6 });
          g.sfx('slam', 1);
        }
        break;
      }
      case 'tear': {
        if (!at(a.hit)) break;
        // (it rips free with a lunge: the wall's stone breaks away behind it, and what is before it is thrown back)
        const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
        if (Math.hypot(r.fwd, r.left) <= UF.tear.r && r.fwd > -0.5) {
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, 1);
        }
        g.emit({ t: 'burst', x: m.x, y: m.y, r: UF.tear.r, el: 'phys', style: 'shock' });
        g.emit({ t: 'shake', amount: 8 });
        g.sfx('explode', 0.9);
        break;
      }
      default:
        break;
    }
  },

  end(_R, m, a) {
    if (moveOf(a) !== 'tear') return;
    // (free: and its moves cooling as they were in the wall)
    m.form = 1;
    if (m.moveCd) {
      UF_ACTS.forEach((b, i) => {
        if (!wallAct(b)) return;
        const j = UF_ACTS.findIndex((c) => c.id === b.id.replace(/Wall$/, ''));
        if (j >= 0) m.moveCd![j] = m.moveCd![i];
      });
    }
  },

  peril(R, p, dt) {
    stepPeril(R, p, dt);
  },

  died(R, m) {
    // (what it threw and sent rolling is done with: its blocks crumble, its boulders break, what was coming does not come)
    for (const p of R.g.perils) {
      if (p.kind !== 'act1' || !p.a1 || !p.a1.startsWith('unfinished:') || p.from !== m.name) continue;
      if (p.a1 === 'unfinished:block') p.dur = p.done ? Math.min(p.dur, p.t + UF.hurl.crumble) : p.t;
      else if (p.a1 === 'unfinished:lane') {
        if (p.t < p.hit) p.dur = p.t;
        else if (p.done !== 2) {
          p.done = 2;
          p.hit = p.t;
          p.dur = p.t + UF.slide.burst;
        }
      }
    }
  },
};
