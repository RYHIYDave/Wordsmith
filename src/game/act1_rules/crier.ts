// ACT 2, THE HUSH: FLOOR 11'S BOSS, THE CRIER (the Gate Ward, "The Crier's Square"): his rules (game/act1_rules/types.ts).
//
// The owner's doc ("Wordsmith Act 2: The Hush", with his yes as ideas): "The town crier, a huge man whose voice was the first
// one taken. Now the Hush speaks through his great brass speaking-trumpet, and nothing comes out of it but silence." His
// moves there: "a swing of the trumpet (his basic attack); the Silent Shout, a cone of silence blasting from the trumpet's
// mouth that darkens your words while you're inside it; the Proclamation, a giant blank scroll unrolling down a street lane;
// the Crowd, a soundless call on the trumpet that brings the Hushed shuffling in from the alleys." His brief to the art chat
// (18 Oct): "The act 1 boss was a big huge non-moving horror.  I think we want a smaller, quick moving, no frills fight";
// "Heavy and pompous, then sudden (Recommended)"; to the four moves, "Yes, these four (Recommended)"; his death, "The Hush
// pours out of him". And of the films: "All are really good, but I think the call is going to need a bigger hit box and the
// proclaim needs to be wider.  At this point the player should have either plenty of movespeed and/or cooldown recovery so
// making things harder to dodge is a good thing.  If it’s too big or whatever we can always tone it back" (the art chat made
// so: the Silent Shout's cone 7.4 tiles out and 80 degrees wide; the Proclamation's lane 8.6 tiles long and 2.5 wide).
// His pictures are the art chat's (art/crier.ts, crier_moves.ts, crier_shots.ts), and every moment, pace and reach here is
// theirs (tests/act2_crier.test.ts holds them to the art); what each move hurts, how hard and how often is this file's (the
// planning chat's helper's picks, his to change). Behind ACT2 (game/act1.ts, off): nothing brings him into the game but
// floor 11 of the Hush (game/bosses.ts bossKind).
//
//   HIS MARCH: quick for all that (his "quick moving"): he goes at the pace his march is painted for, chest out, and stops
//     within his swing's reach of you; no frills: he walks straight at you.
//   HIS SWING, his basic blow: the trumpet heaved up and back over his head (held, its throat flaring: the warning), then
//     all at once over the top and down, its bell slamming the flags about two and a half tiles before him (the art's bell
//     at the blow). Whoever is where it lands, or under the trumpet as it comes down, is struck and knocked back; the flags
//     crack in a ring there (art/crier_shots.ts drawBellSlam).
//   THE SILENT SHOUT: the trumpet to his lips and a great breath drawn (the warning: the cone it will fill marked on the
//     floor, the dust drawn in toward him); then the dead air rolls out of the bell over a cone before him, 7.4 tiles out
//     and 80 degrees wide, the way the trumpet points (aimed at you as he begins: `aimAt`), for the eight tenths of a
//     second he blows. WHILE YOU ARE IN IT YOUR
//     WORDS GO DARK (the Hush, Game.hush: about four seconds from the last moment you were in it); and each wave of dead air
//     that rolls over you hurts a little (five come while he blows). Out of it by moving, or out of his sight.
//   THE PROCLAMATION: a great scroll drawn from his satchel and held high (the warning: the lane it will run down marked on
//     the floor), flung down before him, a little to his left as his picture flings it (aimed at you as he begins): it
//     lands 1.3 tiles out and unrolls down the lane, 8.6 tiles out and 2.5 wide, in
//     under half a second. Whoever its roll passes over is struck, once, and swept on ahead of it. Then it lies, blank, and
//     crumbles into the Hush. He makes it only where its whole lane is open floor (a street's length).
//   THE CROWD: the trumpet lifted to the sky, a breath drawn (the warning: a ring closing in on him); he blows a call that
//     makes no sound, rings of the Hush rolling out from him; and where each ring reaches, at the edges of his square (the
//     mouths of the lanes into it, first), a pool of the Hush wells up and one of the Hushed comes out of it (kind 'hushed',
//     run by their own rules: game/act1_rules/hushed.ts; the frame's stand-in until they are built). A few at a call, more
//     once he is down to half his life; never more than so many of his calling up at once.
//   HIS LINE (game/defs.ts BOSS_LINES): he has no voice (the Hush took it first): as you come into his square he says
//     "...", his mouth open on a shout that makes no sound, and his name comes up.
//   HIS DEATH ("The Hush pours out of him": his picture's): what of his is still on the floor and would harm (the shout's
//     dead air, the scroll, the pools not yet given up their Hushed) is gone with him; those of the Hushed already come stay.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG } from '../defs';
import { beside, fromFigure, handOf } from '../facing';
import type { Monster, Peril } from '../state';
import type { MonsterKind } from '../types';
import { act2Ready } from '../act2_mobs';
import { blobDist, laneDist } from '../act1_layout';
import type { Act1Rules } from './types';

/** HIS MARCH (art/crier_moves.ts CR_PACE, CR_WALK_FRAMES at CR_WALK_FPS: 12 frames at 15 a second; CR_SET_OFF and CR_HALT, his setting off and stopping). */
export const CRIER_GAIT: GaitDef = { pace: 1.7, cycle: 0.8, setOff: 0.2472871273885219, halt: 0.29379867887472483, raise: 0, lower: 0, stopAt: 2.2, slack: 0.5, trueBack: true };

/** His four, his basic blow first and his biggest last (his rulebook: the bigger the hit, the longer the cooldown). */
export const CRIER_ACTS: readonly ActDef[] = [
  { id: 'crier:swing', clip: 'attack', long: 1.58, hit: 0.72, dmg: 1, cooldown: 0, first: 0, after: 0.3, near: 0, far: 3.2 },
  // (`dmg`: each wave of dead air that rolls over the hero)
  { id: 'crier:shout', clip: 'shout', long: 2.2, hit: 0.82, dmg: 0.2, cooldown: 8, first: 3, after: 0.4, near: 0, far: 7.2 },
  { id: 'crier:proclaim', clip: 'proclaim', long: 2.2, hit: 0.92, dmg: 1.3, cooldown: 11, first: 5, after: 0.4, near: 2.0, far: 8.4 },
  { id: 'crier:crowd', clip: 'crowd', long: 2.2, hit: 0.74, dmg: 0, cooldown: 16, first: 7, after: 0.4, near: 0, far: 14 },
];

const DEG = Math.PI / 180;

/** THE NUMBERS OF HIS FIGHT: his pictures' own (art/crier.ts, crier_moves.ts, crier_shots.ts, in tiles and seconds), and what they hurt (the rules'). */
export const CRIER = {
  /**
   * His swing: where the bell comes down (tiles before him, to his left: the trumpet's rim in his picture a moment after the
   * blow, CR_SWING_HIT + 0.02, as the art chat's films lay the cracks; the trumpet in his right hand); whoever is within `r`
   * of there at the blow is struck (the cracks run out about 0.9 of a tile, and the hero's own size), or under the trumpet as
   * it comes down (from `from` tiles before him to the bell, `half` to either side of its line); knocked back `knock`. The
   * cracks lie `cracks` seconds (SLAM_FOR). The trumpet comes round from `turn` (his hips turning, CR_SWING_HIT - 0.22).
   */
  swing: { spot: [2.6232, -0.1239] as const, r: 1.1, from: 0.3, half: 0.6, knock: 0.6, cracks: 1.2, turn: 0.5 },
  /**
   * The Silent Shout: the way the trumpet points as he blows (tiles before him and to his left, as a way: its bell at
   * CR_SHOUT.hit + 0.05); the cone from `from` to `to` tiles out from his floor point, `half` to either side (SHOUT_FROM,
   * SHOUT_TO, SHOUT_HALF); he blows from the blow for `blowing` (CR_SHOUT.end - hit), the dark filling the cone in `fill`,
   * and lying on the floor until `lasts` (SHOUT_FOR); a wave of dead air every `every` while he blows, each rolling out at
   * `speed` tiles a second (`waves` of them). The hero is in it within `slack` of its edges. Its warning from `warnFrom`.
   */
  shout: { way: [0.9953145222911534, -0.09669023588932381] as const, from: 0.7, to: 7.4, half: 40 * DEG, blowing: 0.8, fill: 0.18, lasts: 1.4, every: 1 / 6, speed: 9, waves: 5, slack: 0.3, warnFrom: 0.42 },
  /**
   * The Proclamation: the way the scroll is flung (from his hips to his left hand as it lets go, CR_PROCLAIM.hit + 0.04),
   * and where his hand lets it go (`hand`: tiles before him, and its height in the game's pixels); its lane from `from` to
   * `to` tiles out, `half` to either side (PROCLAIM_FROM, PROCLAIM_TO, PROCLAIM_HALF); from the fling it lands at `lands`,
   * has unrolled by `unrolled` (its roll racing out as 1 - (1 - u)^`roll`), crumbles from `crumbles`, is gone at `lasts`.
   * Whoever its roll passes over is struck and swept `knock` on along it. Its warning from `warnFrom`.
   */
  proclaim: { way: [0.95577900872195, 0.2940858488375231] as const, hand: [1.197, 30.886] as const, from: 1.3, to: 8.6, half: 1.25, lands: 0.14, unrolled: 0.56, crumbles: 1.9, lasts: 2.7, roll: 2.2, knock: 0.8, warnFrom: 0.55 },
  /**
   * The Crowd: the call from the blow for `blowing` (CR_CROWD.end - hit); its rings roll out from `r0` tiles at `speed`
   * (drawCrowdCall) for `rings` seconds (CROWD_FOR); where a ring reaches a spot (each `apart` after the one before), a pool
   * wells up, the one it brings is out at `out` (RISING_OUT), and the pool is gone at `pool` (RISING_FOR). `n` come at a
   * call, `more` once he is down to half his life, never more than `most` of his calling up at once; at the edges of his
   * square (`edge`: how far out in it, a share of the way from its middle to its edge), no nearer the hero than `near`, `gap`
   * apart; where the floor has no square for him (the practice room), round the hero from `round[0]` to `round[1]` tiles.
   * Its warning from `warnFrom`.
   */
  crowd: { blowing: 0.82, r0: 0.9, speed: 7.5, rings: 1.82, apart: 0.12, out: 0.9, pool: 1.5, n: 3, more: 4, most: 6, edge: [0.66, 1.0] as const, near: 4, gap: 2, round: [5, 8] as const, warnFrom: 0.36 },
};

/** A way (tiles before him and to his left) as a way on the floor, from one facing (fx, fy) drawn with `hand`. */
function wayOf(fx: number, fy: number, hand: number, w: readonly [number, number]): { fx: number; fy: number } {
  const p = beside(0, 0, fx, fy, hand, w[0], w[1]);
  const n = Math.hypot(p.x, p.y) || 1;
  return { fx: p.x / n, fy: p.y / n };
}
/** Where his bell comes down, from him as he swings. */
export function slamSpot(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, hand, CRIER.swing.spot[0], CRIER.swing.spot[1]);
}
/** The way his Silent Shout's cone goes over the floor, from one facing (fx, fy) drawn with `hand`. */
export function shoutWay(fx: number, fy: number, hand: number): { fx: number; fy: number } {
  return wayOf(fx, fy, hand, CRIER.shout.way);
}
/** The way his Proclamation's lane runs, likewise. */
export function proclaimWay(fx: number, fy: number, hand: number): { fx: number; fy: number } {
  return wayOf(fx, fy, hand, CRIER.proclaim.way);
}
/** How far down its lane the scroll's roll is (tiles out from him), `t` seconds after he flings it; null while it flies. */
export function scrollFront(t: number): number | null {
  const P = CRIER.proclaim;
  if (t < P.lands) return null;
  const u = Math.min(1, (t - P.lands) / (P.unrolled - P.lands));
  return P.from + (P.to - P.from) * (1 - (1 - u) ** P.roll);
}
/** How far out the dark has filled the cone, `t` seconds after the blow. */
export function shoutDark(t: number): number {
  const S = CRIER.shout;
  return S.from + (S.to - S.from) * Math.max(0, Math.min(1, t / S.fill));
}
/** When the Crowd's call reaches a spot `d` tiles from him (seconds after the call), the `i`th of a call. */
export function callReaches(d: number, i: number): number {
  const C = CRIER.crowd;
  return Math.max(0, d - C.r0) / C.speed + C.apart * i;
}

/**
 * HE AIMS IT AT YOU: turned so that a move whose reach goes off to one side of the way he faces (the Shout's cone a little
 * to his right, the way the trumpet points; the scroll flung a little to his left) goes straight at the hero, as he begins
 * it. Which side is his right in his picture depends on the way he faces (game/facing.ts handOf): the way that keeps it so.
 */
function aimAt(m: Monster, tx: number, ty: number, w: readonly [number, number]): void {
  const d = Math.hypot(tx, ty);
  if (d < 0.01 || !m.act) return;
  const th = Math.atan2(w[1], w[0]);
  for (const hand of [m.act.hand, -m.act.hand as 1 | -1]) {
    // (the way he faces, turned back from the hero's by the move's own turn: beside() turns a way by -hand times it)
    const c = Math.cos(hand * th);
    const s = Math.sin(hand * th);
    const fx = (tx * c - ty * s) / d;
    const fy = (tx * s + ty * c) / d;
    if (handOf(CRIER_GAIT.trueBack, fx, fy) !== hand) continue;
    m.fx = fx;
    m.fy = fy;
    m.act.hand = hand;
    return;
  }
}

/** What answers his call: the Hushed townsfolk, or the frame's stand-in while they are not built (game/act2_mobs.ts). */
export function answers(): MonsterKind {
  return act2Ready('hushed') ? 'hushed' : 'dagger';
}

/** His perils on the floor (Peril.a1 'crier:...'), by what. */
function hisPerils(R: BossRules, m: Monster): Peril[] {
  return R.g.perils.filter((p) => p.kind === 'act1' && !!p.a1 && p.a1.startsWith('crier:') && p.from === m.name);
}

/** Those of his calling still up, and those still coming (pools not yet given up the one they bring). */
function called(R: BossRules, m: Monster): number {
  let n = 0;
  for (const o of R.g.monsters) if (!o.dead && o !== m && o.packId === m.packId && o.a1?.crierCalled) n++;
  for (const p of hisPerils(R, m)) if (p.a1 === 'crier:rising' && !p.done) n++;
  return n;
}

/** Is the hero inside the Silent Shout's cone from (x, y) going (fx, fy), out to `far` tiles? */
function inCone(R: BossRules, x: number, y: number, fx: number, fy: number, far: number): { d: number } | null {
  const g = R.g;
  const h = g.hero;
  const S = CRIER.shout;
  const r = fromFigure(x, y, fx, fy, 1, h.x, h.y);
  const d = Math.hypot(r.fwd, r.left);
  if (d < S.from - S.slack || d > far + S.slack) return null;
  const off = Math.abs(Math.atan2(r.left, r.fwd));
  if (off > S.half + Math.atan2(S.slack, Math.max(0.5, d))) return null;
  if (!g.sees(x, y, h.x, h.y)) return null;
  return { d };
}

/**
 * WHERE HIS CALL BRINGS THE HUSHED: at the edges of his square (the boss's area of the floor), on whole floor, no nearer the
 * hero than they may be, apart from each other; at the mouths of the lanes into it first ("from the alleys"). Where the
 * floor has no square for him, round the hero.
 */
function spotsFor(R: BossRules, m: Monster, want: number): { x: number; y: number }[] {
  const g = R.g;
  const h = g.hero;
  const C = CRIER.crowd;
  const L = g.level;
  const land = L.land;
  const area = land?.areas.find((a) => a.role === 'boss');
  const spots: { x: number; y: number }[] = [];
  const ok = (x: number, y: number): boolean => g.free(L.walk, x, y, 0.36) && Math.hypot(x - h.x, y - h.y) >= C.near && Math.hypot(x - m.x, y - m.y) >= 2 && spots.every((q) => Math.hypot(q.x - x, q.y - y) >= C.gap);
  if (land && area) {
    const b = area.blob;
    const reach = Math.ceil(Math.max(b.rx, b.ry) * 1.1) + 1;
    const cands: { x: number; y: number; alley: boolean; k: number }[] = [];
    for (let ty = Math.floor(b.y - reach); ty <= Math.ceil(b.y + reach); ty++) {
      for (let tx = Math.floor(b.x - reach); tx <= Math.ceil(b.x + reach); tx++) {
        const x = tx + 0.5;
        const y = ty + 0.5;
        const e = blobDist(b, x, y);
        if (e < C.edge[0] || e > C.edge[1]) continue;
        const alley = land.lanes.some((l) => laneDist(l, x, y) <= l.w / 2 + 0.5);
        cands.push({ x, y, alley, k: g.rng.next() });
      }
    }
    // (the lanes' mouths first, then anywhere round the edge; each pass in the dice's order)
    cands.sort((a, c) => (a.alley === c.alley ? a.k - c.k : a.alley ? -1 : 1));
    for (const c of cands) {
      if (spots.length >= want) break;
      if (ok(c.x, c.y)) spots.push({ x: c.x, y: c.y });
    }
  }
  for (let tries = 0; spots.length < want && tries < 80; tries++) {
    const a = g.rng.range(0, Math.PI * 2);
    const d = g.rng.range(C.round[0], C.round[1]);
    const x = h.x + Math.cos(a) * d;
    const y = h.y + Math.sin(a) * d;
    if (ok(x, y)) spots.push({ x, y });
  }
  return spots;
}

/** HIS CALL: the pools of the Hush where the Hushed will come out, each as his call's rings reach it. How many. */
function callCrowd(R: BossRules, m: Monster): number {
  const g = R.g;
  const C = CRIER.crowd;
  const want = Math.max(0, Math.min(m.life < m.maxLife / 2 ? C.more : C.n, C.most - called(R, m)));
  const spots = want > 0 ? spotsFor(R, m, want) : [];
  // (the nearest first: the rings reach it first)
  spots.sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y));
  spots.forEach((s, i) => {
    const wait = callReaches(Math.hypot(s.x - m.x, s.y - m.y), i);
    R.peril(m, 'act1', s.x, s.y, { a1: 'crier:rising', t: -wait, hit: C.out, dur: C.pool, c: i, d: m.packId });
  });
  return spots.length;
}

export const RULES: Act1Rules | null = {
  gait: CRIER_GAIT,
  acts: CRIER_ACTS,

  can(R, m, a, dist) {
    const g = R.g;
    if (a.id === 'crier:crowd') return called(R, m) < CRIER.crowd.most;
    if (a.id === 'crier:proclaim') {
      // (a street's length of open floor: the whole of its lane's middle, flung at the hero now: `start` aims it so)
      const h = g.hero;
      const fx = (h.x - m.x) / Math.max(0.01, dist);
      const fy = (h.y - m.y) / Math.max(0.01, dist);
      const P = CRIER.proclaim;
      for (let d = P.from; d <= P.to + 1e-6; d += 0.35) if (!g.free(g.level.walk, m.x + fx * d, m.y + fy * d, 0.25)) return false;
      return true;
    }
    return true;
  },

  start(R, m, a) {
    // (turned to the hero already: the Shout's cone and the scroll's lane aimed straight at him)
    const h = R.g.hero;
    if (a.id === 'crier:shout') aimAt(m, h.x - m.x, h.y - m.y, CRIER.shout.way);
    else if (a.id === 'crier:proclaim') aimAt(m, h.x - m.x, h.y - m.y, CRIER.proclaim.way);
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    switch (a.id) {
      case 'crier:swing': {
        const S = CRIER.swing;
        if (at(a.hit - 0.22)) g.sfx('swing', S.turn);
        if (!at(a.hit)) break;
        // THE BELL SLAMS DOWN: whoever is where it lands, or under the trumpet as it comes down
        const p = slamSpot(m, act.hand);
        const r = R.rel(m);
        const under = r.fwd >= S.from && r.fwd <= S.spot[0] && Math.abs(r.left - S.spot[1]) <= S.half;
        if (Math.hypot(h.x - p.x, h.y - p.y) <= S.r || under) {
          const was = h.life;
          R.blow(m, a.dmg);
          if (h.life < was) g.knockHero(m.x, m.y, S.knock);
        }
        R.peril(m, 'act1', p.x, p.y, { a1: 'crier:slam', dur: S.cracks, hit: 1e9 });
        g.emit({ t: 'shake', amount: 4 });
        g.sfx('slam', 0.8);
        break;
      }
      case 'crier:shout': {
        // (no voice in it: only the dead air rushing out of the bell)
        if (!at(a.hit)) break;
        const w = shoutWay(m.fx, m.fy, act.hand);
        R.peril(m, 'act1', m.x, m.y, { a1: 'crier:shout', fx: w.fx, fy: w.fy, dur: CRIER.shout.lasts, hit: 1e9, dmg: g.rollMonsterDmg(m) * a.dmg });
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('gust', 0.5);
        break;
      }
      case 'crier:proclaim': {
        const P = CRIER.proclaim;
        if (!at(a.hit)) break;
        // THE SCROLL FLUNG DOWN: from where his hand lets it go, down its lane
        const w = proclaimWay(m.fx, m.fy, act.hand);
        R.peril(m, 'act1', m.x, m.y, { a1: 'crier:scroll', fx: w.fx, fy: w.fy, dur: P.lasts, hit: P.lands, dmg: g.rollMonsterDmg(m) * a.dmg, a: P.hand[0], b: P.hand[1] });
        g.sfx('swing', 0.6);
        break;
      }
      case 'crier:crowd': {
        if (!at(a.hit)) break;
        // HIS CALL, WITHOUT A SOUND: its rings roll out from him, and the Hushed come where they reach
        R.peril(m, 'act1', m.x, m.y, { a1: 'crier:call', dur: CRIER.crowd.rings, hit: 1e9 });
        const n = callCrowd(R, m);
        g.msg(n > 0 ? `${m.name} calls, and no sound comes: the Hushed answer` : `${m.name} calls, and no sound comes`, MSG.foe);
        g.sfx('gust', 0.3);
        break;
      }
      default:
        break;
    }
  },

  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    const t1 = p.t;
    const t0 = p.t - dt;
    if (p.a1 === 'crier:shout') {
      // THE SILENT SHOUT: the dark over the cone, and the waves of dead air rolling over it
      const S = CRIER.shout;
      if (t1 < 0 || g.over) return;
      // (in the dark while he blows: the hero's words go dark, for a while after he is out of it)
      if (t1 <= S.blowing && h.invuln <= 0 && !h.move && inCone(R, p.x, p.y, p.fx, p.fy, shoutDark(t1))) {
        if (g.hushT <= 0) g.emit({ t: 'text', x: h.x, y: h.y, text: 'Hushed', color: '#9890b4' });
        g.hush();
      }
      // (each wave hurts whoever it rolls over, once)
      const c = inCone(R, p.x, p.y, p.fx, p.fy, S.to);
      if (!c) return;
      for (let j = 0; j < S.waves; j++) {
        if (p.done & (1 << j)) continue;
        // (where its front was and is: from when it left the bell; once it has run out past the cone's far edge, no more)
        const age = t1 - j * S.every;
        if (age < 0) continue;
        const d1 = S.from + age * S.speed;
        const d0 = S.from + Math.max(0, t0 - j * S.every) * S.speed;
        if (d0 > S.to + S.slack) continue;
        if (c.d >= d0 - S.slack && c.d <= d1 + S.slack * 0.5) {
          p.done |= 1 << j;
          g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
        }
      }
      return;
    }
    if (p.a1 === 'crier:scroll') {
      // THE PROCLAMATION: its roll racing out down the lane; whoever it passes over is struck and swept on ahead of it, once
      const P = CRIER.proclaim;
      if (t0 < P.lands && t1 >= P.lands) g.sfx('slam', 0.3);
      if (p.done || g.over) return;
      const d1 = scrollFront(t1);
      if (d1 === null) return;
      if (t0 >= P.unrolled) {
        // (unrolled to its end: it only lies there now, blank)
        p.done = 1;
        return;
      }
      const d0 = scrollFront(Math.max(P.lands, t0)) ?? P.from;
      const r = fromFigure(p.x, p.y, p.fx, p.fy, 1, h.x, h.y);
      if (Math.abs(r.left) > P.half + 0.15 || r.fwd < P.from - 0.3 || r.fwd > P.to + 0.3) return;
      if (r.fwd >= d0 - 0.35 && r.fwd <= d1 + 0.2 && g.sees(p.x, p.y, h.x, h.y)) {
        p.done = 1;
        const was = h.life;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x + p.fx * d1, p.y + p.fy * d1, p.half);
        if (h.life < was) g.knockHero(p.x + p.fx * (r.fwd - 1), p.y + p.fy * (r.fwd - 1), P.knock);
        g.emit({ t: 'shake', amount: 2 });
      }
      return;
    }
    if (p.a1 === 'crier:rising') {
      // ONE OF THE HUSHED COMES OUT of the pool his call has welled up
      if (p.done || t1 < p.hit) return;
      p.done = 1;
      const kind = answers();
      if (!g.free(g.level.walk, p.x, p.y, 0.3)) return;
      // (of his pack, `d`, as his calling)
      const o = g.spawn(kind, p.x, p.y, p.d, 0, false, g.rng);
      o.state = 'chase';
      o.cd = g.rng.range(0.4, 0.9);
      o.xp = 0;
      o.a1 = { ...(o.a1 ?? {}), crierCalled: 1 };
      const dx = h.x - p.x;
      const dy = h.y - p.y;
      const dd = Math.hypot(dx, dy) || 1;
      o.fx = dx / dd;
      o.fy = dy / dd;
    }
  },

  died(R, m) {
    // (the Hush pours out of him: what of his would still harm goes with him; the cracks his bell left stay a moment)
    const list = R.g.perils;
    for (let k = list.length - 1; k >= 0; k--) {
      const p = list[k];
      if (p.kind === 'act1' && p.a1 && p.a1.startsWith('crier:') && p.a1 !== 'crier:slam' && p.from === m.name) list.splice(k, 1);
    }
  },
};
