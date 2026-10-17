// ACT 1: THE CARRION QUEEN, FLOOR 7'S BOSS (the Ledge Road; her floor "The Queen's Eyrie"): her rules (game/act1_rules/types.ts).
//
// The owner's doc: "A huge cult-bound vulture nesting on an outcrop over the drop ... Moves: a talon rake (her basic
// attack); a wing gust that shoves you toward the edge; a dive along a marked line; a call that brings her flock."
// THE NEW QUEEN ONLY (art/carrion_queen2*.ts; the art chat's post of 16 Oct, 11:32, his yes to her look and every
// move): her talon rake (her blow), her wing gust ("how far it shoves and toward the edge is yours"), her dive ("your
// mark on her line is the warning then"), her call ("her flock wheeling in is yours"), struck, and her death OFF THE
// EDGE, backward ("stand her with the drop at her back"). What each hurts, how far, how often are the main chat's:
// this file.
//
// HOW SHE FIGHTS: SHE HOLDS HER EYRIE. She stands on its edge with the drop behind her (`bossAt`, `perchOf`), on her
// spot, and does not leave it: her rake and her dive carry her out and bring her back to it, as her pictures do
// ("the clip ends where she began"). So whenever she dies, the drop is behind her, as near as her death's films have
// it, for one of her picture's four ways round at least (her spot is chosen so): she goes over it as her death is
// painted, shown that way round (`died`). Should anything ever put her off her spot, she hops back onto it (her
// hop: the one time she walks). Her four, by his rulebook: the talon rake, her basic blow, at one
// who is close; her wing gust, a blast before her that knocks him back toward the eyrie's far edge; her dive, at one
// who stands off, along a line marked on the floor while she is up out of sight (she cannot be struck up there),
// striking where it ends; her call, her biggest and slowest: her flock comes, never more than a few of it alive.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG, TUNE } from '../defs';
import { backView, flipped, fromFigure } from '../facing';
import { act1Ready } from '../act1_mobs';
import type { Level, Monster } from '../state';
import type { MonsterKind } from '../types';
import type { Act1Rules } from './types';

// ---------------------------------------------------------------------------------------------
// HER NUMBERS (the pictures' own where they are the pictures'; tiles before her and to her left)

export const QN = {
  /** Her eyrie's edge behind her in her death's films (60 of her lengths, as built, times her scale): where she goes over. Her spot has the drop that far behind it, within `edgeGive`. */
  edge: 1.715,
  edgeGive: 0.3,
  /** How long her death is played where she went over (Q2_DIE.long), and a little. */
  fall: 2.05,
  /** Jostled off her spot by no more than this (tiles), she is back on it at once; further, she hops back. */
  hold: 0.4,
  /** The talon rake: her talons go through what is from `from` to `to` before her and within `half` to either side, at its blow (1.9 tiles before her, the art's); she comes down a tile on at `land`. */
  rake: { from: 0.2, to: 2.5, half: 0.9, land: 0.8 },
  /**
   * The wing gust: its blast strikes what is before her, as far as `far`, within `wide` and `spread` more for every
   * tile out, at its blow, and drives it back from her: `push` tiles at her feet, less further out (never less
   * than `least`), over `pushFor` seconds. Her ring of warning on the floor from `warnFrom` (as she rears).
   */
  gust: { far: 5.5, wide: 1.2, spread: 0.45, push: 3.4, least: 1.2, pushFor: 0.35, warnFrom: 0.3 },
  /**
   * The dive: she leaves the rock at `launch`, is up out of sight and out of reach from `up[0]` to `up[1]`, stoops at
   * `stoop`; her talons strike `at` tiles along her line (Q2_DIVE.strikeX, 100 of her lengths) at its blow, harming
   * within `r` of it and on the line from `line` to it, `half` to either side. The line is marked on the floor from
   * `launch` (its warning: she is out of sight then).
   */
  dive: { launch: 0.24, up: [0.3, 1.0] as const, stoop: 0.8, at: 2.858, r: 1.1, line: 1.0, half: 0.6 },
  /** The call: her screech from `screech`; her flock comes at `at`, `n` of it, never more than `most` of it alive. */
  call: { screech: 0.36, at: 0.8, n: 3, most: 4 },
};

/**
 * SHE ROAMS HER EYRIE (the owner, 17 Oct 2026, 11:37: "Neither the unfinished nor the carrion queen moved at all during
 * the fight.  The queen should move around a lot"; and 11:45: "If the queen needs to be at a certain point for her death
 * animation, then when she’s at 1% HP have her fly up and land where she’s supposed to, then one hit kills and it works as
 * designed"). So, `on`: after each of her moves, and when she has stood `every` seconds, she hops to another spot of her
 * eyrie, `near` to `far` tiles from the hero, `apart` to `hop` from where she was (short hops, quick); her life cannot be brought below
 * `last` of it until she is back on her perch over the drop; brought there, she flies up as in her dive and comes down on
 * her perch (`queen:home`: out of sight, out of reach), and stays; the next blow kills her, and she goes over the edge as
 * her death was drawn.
 */
export const QUEEN_ROAM = { on: true, every: [1.0, 2.2] as const, near: 2.2, far: 4.6, apart: 1.6, hop: 3.4, last: 0.01 };

/** Her flock: the Ledge Road's vultures (or, until they are in the game, what stands in for them: game/act1_mobs.ts). */
export function flockKind(): MonsterKind {
  return act1Ready('vulture') ? 'vulture' : 'dagger';
}

// ---------------------------------------------------------------------------------------------
// HER GAIT AND HER ACTS

/** Her hop: 12 frames at 20 a second (0.6 s), painted for 1.5 tiles a second; her round begins and ends as she stands. From behind she is painted as the heroes are. */
export const QN_GAIT: GaitDef = { pace: 1.5, cycle: 0.6, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.0, slack: 0.5, trueBack: false };

export const QN_ACTS: readonly ActDef[] = [
  { id: 'queen:rake', clip: 'attack', long: 1.45, hit: 0.72, dmg: 1, cooldown: 0, first: 0, after: 0.35, near: 0, far: 2.5 },
  { id: 'queen:gust', clip: 'gust', long: 1.45, hit: 0.68, dmg: 0.5, cooldown: 8, first: 3, after: 0.4, near: 0, far: 5.0 },
  { id: 'queen:dive', clip: 'dive', long: 2.2, hit: 1.08, dmg: 1.6, cooldown: 7, first: 4, after: 0.5, near: 2.0, far: 4.0 },
  { id: 'queen:call', clip: 'call', long: 1.7, hit: 0.8, dmg: 0, cooldown: 18, first: 5, after: 0.5, near: 0, far: 16 },
  // (QUEEN_ROAM: home to her perch, at the last of her life: her dive, come down on it)
  { id: 'queen:home', clip: 'dive', long: 2.2, hit: 1.08, dmg: 1.6, cooldown: 0, first: 0, after: 0.5, near: 0, far: 99, forced: true },
];

// ---------------------------------------------------------------------------------------------
// HER SPOT: on the eyrie's edge, the drop behind her

/** The four ways round of her picture (art: from in front and behind, each turned over or not: game/facing.ts), by the floor's way each faces: from in front, not turned over, along the floor's x; turned over, its y; from behind, turned over, -x; not, -y. */
export const QN_VIEWS: readonly { fx: number; fy: number }[] = [
  { fx: 1, fy: 0 },
  { fx: 0, fy: 1 },
  { fx: -1, fy: 0 },
  { fx: 0, fy: -1 },
];
/** Which of them shows one facing (fx, fy). */
export function viewIndex(fx: number, fy: number): number {
  return backView(fx, fy) ? (flipped(fx, fy) ? 2 : 3) : flipped(fx, fy) ? 1 : 0;
}

export interface QueenPerch {
  x: number;
  y: number;
  fx: number;
  fy: number;
  /** Which of her picture's ways round have their backs to the drop there, as her death has it (bit i: QN_VIEWS[i]). */
  views: number;
}
const perches = new WeakMap<Level, QueenPerch | null>();

/**
 * WHERE THE QUEEN STANDS ON HER EYRIE: on its floor, clear round her, with the drop as far behind her as her death's
 * films have the edge (`QN.edge`), across her width, for one of her picture's ways round at least (two, where the
 * eyrie's edge turns); the way she faces there turned into the eyrie, so that the more of its floor lies where
 * she would face one of those ways round the better (she goes over the edge facing one of them: see `died`), the
 * way in rather than not; as far from where the way comes in as may be. Null where the floor has no such place.
 */
export function perchOf(L: Level): QueenPerch | null {
  if (perches.has(L)) return perches.get(L) ?? null;
  const got = findPerch(L);
  perches.set(L, got);
  return got;
}
function findPerch(L: Level): QueenPerch | null {
  const land = L.land;
  if (!land || land.kind !== 'ledge' || !land.drop) return null;
  const drop = land.drop;
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
  // (the drop: a tile that falls away; or one the eyrie's rounded edge cuts across, with the drop past it)
  const cut = f.cut;
  const dropAt = (x: number, y: number, fx: number, fy: number): boolean => {
    const i = tile(x, y);
    if (i < 0 || drop[i] === 1) return true;
    if (!cut || !cut[i]) return false;
    const j = tile(x - fx, y - fy);
    return j < 0 || drop[j] === 1;
  };
  /** How far behind (x, y) along (-fx, -fy) the eyrie ends, if it ends at the drop. */
  const behind = (x: number, y: number, fx: number, fy: number): number => {
    for (let s = 0.05; s <= 3.2; s += 0.05) if (!walk(x - fx * s, y - fy * s)) return dropAt(x - fx * s, y - fy * s, fx, fy) ? s : Infinity;
    return Infinity;
  };
  const clear = (x: number, y: number, r: number): boolean => {
    for (const [ox, oy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) if (!walk(x + ox, y + oy)) return false;
    return true;
  };
  const E = QN.edge;
  /** Is the drop behind (x, y) for this way round, as her death has it, across her width? (How far off the films' edge, or Infinity.) */
  // (the drop behind her, as far as her death's films have the edge, across her width)
  const backToDrop = (x: number, y: number, v: { fx: number; fy: number }): number => {
    const D = behind(x, y, v.fx, v.fy);
    if (Math.abs(D - E) > QN.edgeGive) return Infinity;
    const ex = -v.fy;
    const ey = v.fx;
    for (const o of [-0.7, 0.7]) if (Math.abs(behind(x + ex * o, y + ey * o, v.fx, v.fy) - E) > QN.edgeGive * 2) return Infinity;
    return Math.abs(D - E);
  };
  const way = land.way;
  const entry = way.length >= 2 ? way[way.length - 2] : [f.start.x, f.start.y];
  // (the eyrie's floor, a point a tile)
  const R = Math.max(area.blob.rx, area.blob.ry) * 1.2 + 2;
  const floor: [number, number][] = [];
  for (let y = Math.floor(area.blob.y - R) + 0.5; y <= area.blob.y + R; y += 1) for (let x = Math.floor(area.blob.x - R) + 0.5; x <= area.blob.x + R; x += 1) if (walk(x, y)) floor.push([x, y]);
  let best: QueenPerch | null = null;
  let bestScore = -Infinity;
  for (let y = area.blob.y - R; y <= area.blob.y + R; y += 0.25) {
    for (let x = area.blob.x - R; x <= area.blob.x + R; x += 0.25) {
      if (!clear(x, y, 0.8)) continue;
      let views = 0;
      let off = 0;
      for (let i = 0; i < 4; i++) {
        const d = backToDrop(x, y, QN_VIEWS[i]);
        if (Number.isFinite(d)) {
          views |= 1 << i;
          off = Math.max(off, d);
        }
      }
      if (!views) continue;
      // (how much of the eyrie lies where she would face one of those ways round; and the way in)
      let fit = 0;
      for (const [px, py] of floor) if (views & (1 << viewIndex(px - x, py - y))) fit++;
      const inView = views & (1 << viewIndex(entry[0] - x, entry[1] - y)) ? 1 : 0;
      // (seen from in front through her fight, rather than from behind)
      const faces = views & 3 ? 1 : 0;
      const score = (3 * fit) / Math.max(1, floor.length) + inView + faces - 3 * off + 0.03 * Math.hypot(x - entry[0], y - entry[1]);
      if (score > bestScore) {
        bestScore = score;
        // (she faces the eyrie's middle, as one of those ways round shows her)
        let v = QN_VIEWS[viewIndex(area.blob.x - x, area.blob.y - y)];
        if (!(views & (1 << viewIndex(v.fx, v.fy)))) v = QN_VIEWS[[0, 1, 2, 3].find((i) => views & (1 << i)) ?? 0];
        best = { x, y, fx: v.fx, fy: v.fy, views };
      }
    }
  }
  return best;
}

// ---------------------------------------------------------------------------------------------
// WHAT SHE KEEPS (Monster.a1): her spot, the ways round with the drop at her back there; the way her gust drives the hero

function keptOf(m: Monster): Record<string, number> {
  if (!m.a1) m.a1 = { hx: m.x, hy: m.y, views: 0, gx: 0, gy: 0 };
  return m.a1;
}

/** (QUEEN_ROAM) Where her dive home sets her down: on her perch, as it faces, from the moment she is up out of sight. */
export const HOME_AT = (QN.dive.up[0] + QN.dive.up[1]) / 2;
/** (QUEEN_ROAM) Is she on her perch over the drop (where she began), for good? */
function homeForGood(m: Monster): boolean {
  return keptOf(m).home === 1;
}

/** (QUEEN_ROAM) Another spot of her eyrie to hop to: `near` to `far` from the hero, `apart` to `hop` from where she is, clear round her, in sight of him; null: none. */
function roamSpot(R: BossRules, m: Monster): { x: number; y: number } | null {
  const g = R.g;
  const L = g.level;
  const area = L.land?.areas.find((a) => a.role === 'boss');
  if (!area) return null;
  const W = L.floor.w;
  const H = L.floor.h;
  const walk = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && L.walk[Math.floor(y) * W + Math.floor(x)] === 1;
  const clear = (x: number, y: number, r: number): boolean => {
    for (const [ox, oy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) if (!walk(x + ox, y + oy)) return false;
    return true;
  };
  const h = g.hero;
  const RR = Math.max(area.blob.rx, area.blob.ry) * 1.2 + 2;
  const Q = QUEEN_ROAM;
  const options: { x: number; y: number }[] = [];
  for (let y = area.blob.y - RR; y <= area.blob.y + RR; y += 0.5) {
    for (let x = area.blob.x - RR; x <= area.blob.x + RR; x += 0.5) {
      const dh = Math.hypot(x - h.x, y - h.y);
      const dm = Math.hypot(x - m.x, y - m.y);
      if (dh < Q.near || dh > Q.far || dm < Q.apart || dm > Q.hop) continue;
      if (!clear(x, y, 0.8) || !g.sees(x, y, h.x, h.y)) continue;
      options.push({ x, y });
    }
  }
  if (!options.length) return null;
  return options[Math.floor(g.rng.next() * options.length)];
}

/** Turned to face (x, y). */
function faceToward(m: Monster, x: number, y: number): void {
  const dx = x - m.x;
  const dy = y - m.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.01) return;
  m.fx = dx / d;
  m.fy = dy / d;
}

/** How many of her flock she has called that are alive. */
function flockAlive(R: BossRules, m: Monster): number {
  const kind = flockKind();
  return R.g.monsters.filter((o) => !o.dead && o !== m && o.packId === m.packId && o.kind === kind).length;
}

/** Would she make an act now (as BossRules.pickAct would choose one)? */
function anyReady(R: BossRules, m: Monster, dist: number): boolean {
  if (m.cd > 0 || !m.moveCd) return false;
  const g = R.g;
  const los = dist < 16 && g.sees(m.x, m.y, g.hero.x, g.hero.y);
  // (not her flight home, QUEEN_ROAM's: that is made only when it must be, BossRules.forcedAct)
  return los && QN_ACTS.some((a, i) => !a.forced && m.moveCd![i] <= 0 && dist >= a.near && dist <= a.far && canAct(R, m, a));
}
function canAct(R: BossRules, m: Monster, a: ActDef): boolean {
  if (a.id === 'queen:call') return flockAlive(R, m) <= QN.call.most - 2;
  return true;
}

/** (QUEEN_ROAM) The least her life can be brought to before she is home for good: a hundredth of it. */
function lastOf(m: Monster): number {
  return Math.max(1, Math.ceil(m.maxLife * QUEEN_ROAM.last));
}

/** Where she is from her spot. */
const offSpot = (m: Monster): number => {
  const k = keptOf(m);
  return Math.hypot(m.x - k.hx, m.y - k.hy);
};

// ---------------------------------------------------------------------------------------------

export const RULES: Act1Rules | null = {
  gait: QN_GAIT,
  acts: QN_ACTS,

  bossAt(L) {
    const p = perchOf(L);
    return p ? { x: p.x, y: p.y, fx: p.fx, fy: p.fy } : null;
  },

  spawned(R, m) {
    // (on her spot on her eyrie: the ways round with the drop at her back there; anywhere else, her spot is where she is)
    const p = perchOf(R.g.level);
    const at = p && Math.hypot(m.x - p.x, m.y - p.y) < 0.2;
    m.a1 = { hx: m.x, hy: m.y, views: at ? p.views : 0, gx: 0, gy: 0 };
    if (at) {
      m.fx = p.fx;
      m.fy = p.fy;
    }
  },

  tick(R, m, dt, dist) {
    const g = R.g;
    const k = keptOf(m);
    // (she holds her ground: what jostles her, the hero or her flock pressing on her, moves her no more than a little,
    // and she is back on her spot at once; game.ts keeps bodies apart, and out of the hero, by moving them)
    const jolt = offSpot(m);
    if (jolt > 0 && jolt <= QN.hold && m.gait?.mode !== 'walk') {
      m.x = k.hx;
      m.y = k.hy;
    }
    if (m.state === 'act') return false;
    if (!m.gait) m.gait = { mode: 'stand', t: 0 };
    if (!m.moveCd || m.moveCd.length !== QN_ACTS.length) m.moveCd = QN_ACTS.map((a) => a.first * g.rng.range(0.7, 1.2));
    for (let i = 0; i < m.moveCd.length; i++) m.moveCd[i] -= dt;
    m.state = 'chase';
    // OFF HER SPOT: she hops back onto it (her round ends as she stands: she stops as it comes round, there)
    const off = offSpot(m);
    if (off > 0 || m.gait.mode === 'walk') {
      const sp = m.speed;
      if (m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
      if (off > 0.01) {
        const step = Math.min(off, sp * dt);
        const dx = (k.hx - m.x) / off;
        const dy = (k.hy - m.y) / off;
        m.fx = dx;
        m.fy = dy;
        g.slide(m, Math.min(m.r, 0.42), dx * step, dy * step, g.level.walk, true);
        // (where nothing lets her by, her spot is where she has come to)
        if (offSpot(m) > off - step * 0.5 && step > 1e-4) {
          k.hx = m.x;
          k.hy = m.y;
        }
      }
      const before = m.gait.t;
      m.gait.t += (dt * sp) / QN_GAIT.pace;
      m.anim = 'walk';
      if (offSpot(m) <= 0.05 && Math.floor(m.gait.t / QN_GAIT.cycle) > Math.floor(before / QN_GAIT.cycle)) {
        m.gait = { mode: 'stand', t: 0 };
        m.anim = 'idle';
      }
      return true;
    }
    // (QUEEN_ROAM: home to her perch at the last of her life; and, stood her while, off to another spot)
    if (QUEEN_ROAM.on && !homeForGood(m)) {
      if (m.life <= lastOf(m)) return false;
      k.roamT = (k.roamT ?? QUEEN_ROAM.every[0]) - dt;
      if (k.roamT <= 0) {
        k.roamT = g.rng.range(QUEEN_ROAM.every[0], QUEEN_ROAM.every[1]);
        const to = roamSpot(R, m);
        if (to) {
          k.hx = to.x;
          k.hy = to.y;
          return true;
        }
      }
    }
    // ON IT: an act, when one is to be made (BossRules makes it, turning her to the hero); else she stands, turned to him
    if (anyReady(R, m, dist)) {
      // (BossRules counts her moves down itself)
      for (let i = 0; i < m.moveCd.length; i++) m.moveCd[i] += dt;
      return false;
    }
    m.anim = 'idle';
    if (m.gait.mode !== 'stand') m.gait = { mode: 'stand', t: 0 };
    m.gait.t += dt;
    faceToward(m, g.hero.x, g.hero.y);
    return true;
  },

  can(R, m, a) {
    return canAct(R, m, a);
  },

  start(R, m, a) {
    if (a.id === 'queen:dive' || a.id === 'queen:gust' || a.id === 'queen:home') R.g.sfx('bossRoar', 0.4);
  },

  end(R, m, a) {
    // (QUEEN_ROAM: a move made, she is soon off to another spot; home, she stays)
    const k = keptOf(m);
    if (a.id === 'queen:home') k.home = 1;
    else if (QUEEN_ROAM.on && !homeForGood(m)) k.roamT = Math.min(k.roamT ?? 0.3, 0.3);
  },

  forced(R, m, acts) {
    if (!QUEEN_ROAM.on || homeForGood(m) || m.life > lastOf(m)) return -1;
    // (at the last of her life: home, unless she is on her perch already)
    const p = perchOf(R.g.level);
    if (!p || Math.hypot(m.x - p.x, m.y - p.y) < 0.2) {
      keptOf(m).home = 1;
      return -1;
    }
    return acts.findIndex((a) => a.id === 'queen:home');
  },

  lifeFloor(R, m) {
    return QUEEN_ROAM.on && !homeForGood(m) ? lastOf(m) : 0;
  },

  acting(R, m, a, t0, t1, dt) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const rel = (): { fwd: number; left: number } => fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
    switch (a.id) {
      case 'queen:rake': {
        if (at(QN.rake.land)) g.sfx('slam', 0.3);
        if (!at(a.hit)) break;
        const r = rel();
        if (r.fwd >= QN.rake.from && r.fwd <= QN.rake.to && Math.abs(r.left) <= QN.rake.half) {
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, 0.5);
        }
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('swing', 0.8);
        break;
      }
      case 'queen:gust': {
        const G = QN.gust;
        const k = keptOf(m);
        if (at(a.hit)) {
          g.sfx('gust', 1);
          g.emit({ t: 'shake', amount: 3 });
          const r = rel();
          if (r.fwd > -0.3 && r.fwd <= G.far && Math.abs(r.left) <= G.wide + G.spread * Math.max(0, r.fwd)) {
            R.blow(m, a.dmg);
            if (h.invuln <= 0 && !h.move && !g.over) {
              // (driven back from her: harder the nearer she is)
              act.b = 1;
              act.a = Math.max(G.least, G.push * (1 - Math.max(0, r.fwd) / (G.far + 2)));
              const dx = h.x - m.x;
              const dy = h.y - m.y;
              const d = Math.hypot(dx, dy) || 1;
              k.gx = dx / d;
              k.gy = dy / d;
            }
          }
        }
        if (act.b === 1 && t1 > a.hit && t0 < a.hit + G.pushFor && !g.over) {
          const span = Math.min(t1, a.hit + G.pushFor) - Math.max(t0, a.hit);
          const step = (act.a * span) / G.pushFor;
          g.slide(h, TUNE.heroRadius, k.gx * step, k.gy * step, g.level.walk);
        }
        break;
      }
      case 'queen:home':
      case 'queen:dive': {
        const D = QN.dive;
        // (QUEEN_ROAM: home: up out of sight, she is set down over her perch, turned as it faces, and stoops onto it from there)
        if (a.id === 'queen:home' && at(HOME_AT)) {
          const p = perchOf(g.level);
          const k = keptOf(m);
          if (p) {
            m.x = p.x;
            m.y = p.y;
            m.fx = p.fx;
            m.fy = p.fy;
            k.hx = p.x;
            k.hy = p.y;
            k.views = p.views;
          }
          k.homing = 1;
        }
        if (!at(a.hit)) break;
        const r = rel();
        const inStrike = Math.hypot(r.fwd - D.at, r.left) <= D.r + TUNE.heroRadius * 0.5;
        const onLine = r.fwd >= D.line && r.fwd <= D.at && Math.abs(r.left) <= D.half;
        if (inStrike || onLine) {
          R.blow(m, a.dmg);
          g.knockHero(m.x + m.fx * D.at, m.y + m.fy * D.at, 1);
        }
        g.emit({ t: 'shake', amount: 6 });
        g.sfx('slam', 1);
        break;
      }
      case 'queen:call': {
        const C = QN.call;
        if (at(C.screech)) {
          g.sfx('bossRoar', 0.8);
          g.msg(`${m.name} calls her flock`, MSG.foe);
        }
        if (!at(C.at)) break;
        // (her flock comes down round her, out of the sky, never more than a few of it alive)
        const n = Math.max(0, Math.min(C.n, C.most - flockAlive(R, m)));
        const spots = g.spotsRound(m.x, m.y, 40).filter((s) => Math.hypot(s.x - m.x, s.y - m.y) >= 1.5 && Math.hypot(s.x - m.x, s.y - m.y) <= 5 && Math.hypot(s.x - h.x, s.y - h.y) >= 2.5);
        const kind = flockKind();
        const put: { x: number; y: number }[] = [];
        for (let i = 0; i < n && spots.length; i++) {
          // (spread round her: each as far from the others, and from the hero, as may be)
          let bi = 0;
          let bd = -1;
          spots.forEach((s, j) => {
            const d = Math.min(Math.hypot(s.x - h.x, s.y - h.y) * 0.5, ...put.map((q) => Math.hypot(s.x - q.x, s.y - q.y)));
            if (d > bd) {
              bd = d;
              bi = j;
            }
          });
          const s = spots.splice(bi, 1)[0];
          put.push(s);
          const b = g.spawn(kind, s.x, s.y, m.packId, 0, false, g.rng);
          b.words = [];
          b.half = undefined;
          b.xp = 0;
          b.state = 'chase';
          b.cd = 0.6 + 0.2 * i;
          const dx = h.x - b.x;
          const dy = h.y - b.y;
          const d = Math.hypot(dx, dy) || 1;
          b.fx = dx / d;
          b.fy = dy / d;
        }
        break;
      }
      default:
        break;
    }
    void dt;
  },

  died(R, m) {
    // SHE GOES OVER THE EDGE: her death is painted falling backward, so it is shown the way round of her picture whose
    // back is to the drop (the one she is shown already if it is; else the nearest of those to it: she turns her back
    // to the drop as she dies, as any of them turns, at once). Her spot has the drop that far behind for one at least.
    const views = keptOf(m).views | 0;
    const cur = viewIndex(m.fx, m.fy);
    // (her fall, where she went over: her effects play her death there, render/act1_fx/queen.ts)
    const fall = (): void => void R.peril(m, 'act1', m.x, m.y, { a1: 'queen:fall', fx: QN_VIEWS[viewIndex(m.fx, m.fy)].fx, fy: QN_VIEWS[viewIndex(m.fx, m.fy)].fy, dur: QN.fall });
    if (!views || views & (1 << cur)) {
      fall();
      return;
    }
    const a = Math.atan2(m.fy, m.fx);
    let best = cur;
    let bd = Infinity;
    QN_VIEWS.forEach((v, i) => {
      if (!(views & (1 << i))) return;
      let d = Math.abs(Math.atan2(v.fy, v.fx) - a) % (Math.PI * 2);
      if (d > Math.PI) d = Math.PI * 2 - d;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    const v = QN_VIEWS[best];
    m.fx = v.fx;
    m.fy = v.fy;
    // (the game has just told of her death, the way she faced: it is told the way she falls)
    for (let i = R.g.events.length - 1; i >= 0; i--) {
      const e = R.g.events[i];
      if (e.t === 'die' && e.kind === m.kind && e.x === m.x && e.y === m.y) {
        e.fx = v.fx;
        e.fy = v.fy;
        break;
      }
    }
    fall();
  },

  reachable(m) {
    // (up out of sight in her dive, nothing reaches her; nor in her dive home)
    const D = QN.dive;
    return !(m.act && (m.act.id === 'queen:dive' || m.act.id === 'queen:home') && m.act.t >= D.up[0] && m.act.t < D.up[1]);
  },
};
