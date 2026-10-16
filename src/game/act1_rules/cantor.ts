// ACT 1: THE CANTOR, FLOOR 8'S BOSS (Echo Canyon, "The Cantor's Gorge"): his rules (game/act1_rules/types.ts).
//
// The owner's doc (with his yes of 12 Oct, 18:07): "The cult's choirmaster, leading the chant down the supply road.
// Everything he does echoes off the canyon walls a beat later." His moves there: "a staff strike (his basic attack); a
// shout whose shockwave comes back off the wall behind you, so you dodge twice; sound-copies of him that repeat his
// last move; rockfall shaken loose by his voice." His pictures are the art chat's (art/cantor.ts, every move with his
// yes as shown, 15 Oct by 07:35), and every moment and reach here is theirs (tests/act1_cantor.test.ts holds them to
// the art); what each move hurts, how hard and how often is this file's.
//
//   HIS STAFF STRIKE, his basic blow: held overhead (the warning), brought down at its blow; whoever is under the
//     staff or its bell, where it comes down about two and a half tiles before him, is struck. A beat later its echo
//     strikes the same spot again, weaker: the spot glows meanwhile (render/act1_fx/cantor.ts).
//   HIS SHOUT: the shockwave rolls out across the floor before him, as far as his picture throws it, and comes back
//     a beat later from beyond you, as his picture has it come back: each harms whoever its front passes, once (dodge
//     twice). Going out it throws you back from him; coming back, toward him.
//   HIS SOUND-COPIES: the two copies his picture tears away to either side of him stand there as figures of their
//     own once his move is over ('cantor:copy', a peril: they are sound, and cannot be struck), each still a beat
//     behind him; then each turns to you and REPEATS HIS LAST MOVE (his strike, his shout or his rockfall) from where
//     it stands, the second a beat after the first, weaker; then it rings out and is gone.
//   HIS ROCKFALL: he sings up at the rim, and the six rocks his picture brings down round him smash where it shows
//     them (each with its shadow first, painted); and his voice shakes three more loose over you, on your tile and
//     near it, each with floor 8's own rockfall's pictures (art/floor8.ts, "the Cantor's voice shakes the rim loose":
//     its warning shadow, the rock come down, the rubble), drawn by render/act1_fx/cantor.ts.
// As he dies (his last note tears him apart) his copies ring out and fade, and what of his own rocks is still to fall
// round him falls no more (his picture paints them no more).

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG } from '../defs';
import { backView, beside, flipped, fromFigure, handOf } from '../facing';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** The figure's lengths in a tile (art/new_mobs3.ts TILE3: the heroes' bones he is painted on). */
const T3 = 32 / Math.sqrt(2 / 3);

/** HIS WALK, a procession (art/cantor.ts CANTOR_PACE, CANTOR_WALK: 24 frames at 16 a second, looping straight from his stand). */
export const CANTOR_GAIT: GaitDef = { pace: 0.8, cycle: 1.5, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.3, slack: 0.6, trueBack: true };

/** His four, his basic blow first and his biggest last (his rulebook: the bigger the hit, the longer the cooldown). */
export const CANTOR_ACTS: readonly ActDef[] = [
  { id: 'cantor:strike', clip: 'attack', long: 2.2, hit: 1.0, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 3.1 },
  { id: 'cantor:shout', clip: 'shout', long: 2.2, hit: 1.0, dmg: 0.8, cooldown: 8, first: 3, after: 0.6, near: 0, far: 5 },
  { id: 'cantor:copies', clip: 'copies', long: 2.2, hit: 0.62, dmg: 0.6, cooldown: 13, first: 6, after: 0.5, near: 0, far: 7 },
  { id: 'cantor:rockfall', clip: 'rockfall', long: 2.6, hit: 1.3, dmg: 1, cooldown: 14, first: 8, after: 0.7, near: 0, far: 9 },
];

/** THE NUMBERS OF HIS FIGHT: his pictures' own (art/cantor.ts, in tiles and seconds), and what they hurt (the rules'). */
export const CANTOR = {
  /**
   * His staff strike: where the bell comes down (tiles before him, to his left: art/cantor.ts strikeSpot, his staff
   * in his right hand); the strip it harms, from him out `beyond` past the bell, `half` to either side of its line;
   * its echo `echo` after the blow on the same spot, harming within `echoR`, `echoDmg` of the blow (the spot glowing
   * from `glow` after the blow until then).
   */
  strike: { spot: [2.729, -0.293] as const, beyond: 0.35, half: 0.6, echo: 0.45, echoR: 0.8, echoDmg: 0.5, glow: 0.1 },
  /**
   * His shout: its wave rolls out at its blow from where his feet are (`at` tiles before him), for `out` seconds, from
   * `r0` to `r0 + reach` tiles (art/cantor.ts CANTOR_SHOUT: 16 and 175 of his lengths), `half` radians to either side
   * of the way he faces; it comes back at `back`, for `out`, from `reach + r0Back` down to `r0Back`, `halfBack` to
   * either side. It harms whoever its front passes (`thick`: how near). Its warning on the floor from `warnFrom`.
   */
  shout: { at: 0.18, out: 0.5, r0: 16 / T3, reach: 175 / T3, half: 1.15, back: 1.45, r0Back: 30 / T3, halfBack: 1.0, thick: 0.3, knock: 0.7, warnFrom: 0.3 },
  /**
   * His sound-copies: they tear away at `tear` (the first to his left, the second to his right), each `delay` behind
   * him, `side` tiles out (art/cantor.ts CANTOR_COPIES: 46 of his lengths); each, once his move (`long`) is over,
   * plays its end a beat behind him, then repeats his last move; `fade`: how long it rings out as it goes.
   */
  copies: { tear: [0.62, 0.86] as const, delay: [0.18, 0.36] as const, side: 46 / T3, long: 2.2, fade: 0.4 },
  /**
   * His rockfall: the staff planted (`plant`, the bell tolls); he sings from `sing` to `hush`; the six rocks his
   * picture brings down round him: when each lands, where (tiles before him and to his left, as his picture lays
   * them), its size; each falls the `fall` before it lands, and harms within `r` of where it lands. His voice shakes
   * more loose over you, landing at `hero.at`: the first on your tile, the others a tile or two from it, each
   * harming whoever is on its tile (`hero.r` of a tile from its middle either way: half a tile, and the hero's own size).
   */
  rockfall: {
    plant: 0.4, sing: 0.75, hush: 1.9, fall: 0.5, r: 0.55,
    rocks: [[1.3, 70, 40, 12], [1.42, -40, -78, 10], [1.54, 104, -46, 13], [1.66, -66, 66, 11], [1.78, 36, 96, 9], [1.9, 20, -104, 12]].map(([t, x, y, r]) => [t, x / T3, y / T3, r / T3] as const),
    hero: { at: [1.42, 1.66, 1.9] as const, r: 0.65 },
  },
};

/** The moves his copies can repeat, in the order a copy keeps them (Peril.a): his strike, his shout, his rockfall. */
export const ECHOED = ['cantor:strike', 'cantor:shout', 'cantor:rockfall'] as const;
/** Each repeated move's length, and its copies' picture among his (art/act1_figs/cantor.ts). */
export const ECHO_MOVES = [
  { long: 2.2, clip: 'echoAttack' },
  { long: 2.2, clip: 'echoShout' },
  { long: 2.6, clip: 'echoRockfall' },
] as const;

/** A copy's marks (Peril.done): its strike's or its shout's two blows landed (1, 2); turned to the hero and begun (32); ringing out (64). */
export const COPY = { begun: 32, fading: 64 } as const;

/** One who makes his moves: him, or one of his copies: where, the way it faces, the hand its picture is drawn with. */
export interface Singer {
  x: number;
  y: number;
  fx: number;
  fy: number;
  hand: 1 | -1;
}

/**
 * WHERE A POINT OF HIS PICTURE IS ON THE FLOOR, from where he stands (tiles before him and to his left in the
 * picture, as it is painted: render/bossfx.ts onPicture). His picture is one of four ways round, so what it paints
 * round him (his copies, his rocks) is where the picture shows it, not along the way he faces.
 */
export function onPicture(fx: number, fy: number, fwd: number, left: number): { x: number; y: number } {
  // (in front: along the floor's x, his left its -y; from behind as the camera truly sees him; turned over, x and y change places)
  let [a, b] = backView(fx, fy) ? [-left, -fwd] : [fwd, -left];
  if (flipped(fx, fy)) [a, b] = [b, a];
  return { x: a, y: b };
}

/** The radius of the shout's wave going out (tiles), `t` seconds into the shout; null while it does not roll. */
export function shoutOut(t: number): number | null {
  const S = CANTOR.shout;
  const u = (t - 1.0) / S.out;
  if (u < 0 || u >= 1) return null;
  return S.r0 + S.reach * (1 - (1 - u) * (1 - u));
}
/** And coming back. */
export function shoutBack(t: number): number | null {
  const S = CANTOR.shout;
  const u = (t - S.back) / S.out;
  if (u < 0 || u >= 1) return null;
  return S.reach + S.r0Back - S.reach * (1 - (1 - u) * (1 - u));
}
/** The middle of the shout's waves, from one who shouts. */
export function shoutFrom(s: Singer): { x: number; y: number } {
  return beside(s.x, s.y, s.fx, s.fy, s.hand, CANTOR.shout.at, 0);
}
/** Where his strike's bell comes down, from one who strikes. */
export function strikeSpot(s: Singer): { x: number; y: number } {
  const S = CANTOR.strike;
  return beside(s.x, s.y, s.fx, s.fy, s.hand, S.spot[0], S.spot[1]);
}

/**
 * A STEP OF ONE OF HIS MOVES THAT STRIKE (his strike, 0; his shout, 1), made by him or by a copy, from `t0` to `t1`
 * of it: `hurt(mult, fromX, fromY)` strikes the hero with `mult` of the singer's blow (true if it harmed him); `seen`
 * keeps which of its blows have come (bits 1 and 2), so that each comes once.
 */
function sing(R: BossRules, which: 0 | 1, s: Singer, t0: number, t1: number, seen: { v: number }, hurt: (mult: number, ox: number, oy: number) => boolean, copy: boolean): void {
  const g = R.g;
  const h = g.hero;
  const at = (T: number): boolean => t0 < T && t1 >= T;
  if (which === 0) {
    const S = CANTOR.strike;
    if (at(1.0)) {
      const r = fromFigure(s.x, s.y, s.fx, s.fy, s.hand, h.x, h.y);
      if (r.fwd > -0.2 && r.fwd <= S.spot[0] + S.beyond && Math.abs(r.left - S.spot[1]) <= S.half) hurt(1, s.x, s.y);
      g.emit({ t: 'shake', amount: copy ? 2 : 4 });
      g.sfx('slam', copy ? 0.5 : 0.8);
    }
    if (at(1.0 + S.echo)) {
      // (its echo, on the same spot)
      const p = strikeSpot(s);
      if (Math.hypot(h.x - p.x, h.y - p.y) <= S.echoR) hurt(S.echoDmg, p.x, p.y);
      g.emit({ t: 'shake', amount: 1 });
      g.sfx('echo', copy ? 0.35 : 0.6);
    }
    return;
  }
  const S = CANTOR.shout;
  if (at(1.0)) {
    g.sfx('wave', copy ? 0.6 : 1);
    if (!copy) g.sfx('bossRoar', 0.5);
    g.emit({ t: 'shake', amount: copy ? 2 : 4 });
  }
  if (at(S.back)) g.sfx('echo', copy ? 0.5 : 0.8);
  if (t1 <= 1.0) return;
  const c = shoutFrom(s);
  const r = fromFigure(c.x, c.y, s.fx, s.fy, s.hand, h.x, h.y);
  const d = Math.hypot(r.fwd, r.left);
  const bearing = Math.abs(Math.atan2(r.left, r.fwd));
  // (going out: its front passes him as it grows past where he stands)
  const o1 = shoutOut(t1);
  const o0 = shoutOut(Math.max(1.0, t0)) ?? S.r0;
  if (!(seen.v & 1) && o1 !== null && bearing <= S.half && d >= o0 - S.thick && d <= o1 + S.thick * 0.5) {
    seen.v |= 1;
    if (hurt(1, c.x, c.y)) g.knockHero(c.x, c.y, S.knock);
  }
  // (coming back: its front passes him as it shrinks past where he stands, coming from beyond him)
  const b1 = shoutBack(t1);
  const b0 = shoutBack(Math.max(S.back, t0)) ?? S.reach + S.r0Back;
  if (!(seen.v & 2) && b1 !== null && bearing <= S.halfBack && d <= b0 + S.thick && d >= b1 - S.thick * 0.5) {
    seen.v |= 2;
    // (thrown toward him, from beyond where he stands: once its going out is over, not back into it)
    const k = d > 0.01 ? 1 / d : 0;
    const bx = h.x + (h.x - c.x) * k;
    const by = h.y + (h.y - c.y) * k;
    if (hurt(1, bx, by) && t1 >= 1.0 + S.out) g.knockHero(bx, by, S.knock);
  }
}

/** What a rock's or a copy's harm is made of: whose blow, its element and words. */
type Blow = Pick<Peril, 'el' | 'words' | 'from' | 'half'>;

/** A rock that lands `hit` seconds from now at (x, y): `a` 0, one his picture paints; 1, one drawn with floor 8's rockfall's pictures. */
function rock(R: BossRules, by: Blow, x: number, y: number, hit: number, dmg: number, a: number, size = 0): void {
  const p: Peril = { kind: 'act1', a1: 'cantor:rock', x, y, fx: 0, fy: 1, t: 0, hit, dur: hit + 1.3, dmg, el: by.el, words: by.words, from: by.from, done: 0, a, b: size, c: 0, d: 0, hand: 1 };
  if (by.half) p.half = by.half;
  R.g.perils.push(p);
}

/** The six rocks round one who sings, where his picture lays them (`own`: his, which his picture paints; else a copy's). */
function rocksRound(R: BossRules, by: Blow, s: Singer, dmg: number, own: boolean): void {
  const F = CANTOR.rockfall;
  for (const [t, fwd, left, size] of F.rocks) {
    const o = onPicture(s.fx, s.fy, fwd, left);
    rock(R, by, s.x + o.x, s.y + o.y, t - F.sing, dmg, own ? 0 : 1, size);
  }
}

/** His voice shakes rocks loose over the hero: the first on his tile, the others on open tiles a tile or two off it. */
function rocksOver(R: BossRules, by: Blow, dmg: number): void {
  const g = R.g;
  const h = g.hero;
  const F = CANTOR.rockfall;
  const spots: { x: number; y: number }[] = [{ x: Math.floor(h.x) + 0.5, y: Math.floor(h.y) + 0.5 }];
  for (let tries = 0; spots.length < F.hero.at.length && tries < 40; tries++) {
    const x = Math.floor(h.x + g.rng.range(-2.5, 2.5)) + 0.5;
    const y = Math.floor(h.y + g.rng.range(-2.5, 2.5)) + 0.5;
    const d = Math.hypot(x - h.x, y - h.y);
    if (d < 0.9 || d > 2.6 || !g.isOpen(x, y) || spots.some((q) => Math.hypot(q.x - x, q.y - y) < 1)) continue;
    spots.push({ x, y });
  }
  spots.forEach((p, k) => rock(R, by, p.x, p.y, F.hero.at[k] - F.sing, dmg, 1));
}

/** His copies on the floor. */
function copiesOf(R: BossRules, m: Monster): Peril[] {
  return R.g.perils.filter((p) => p.kind === 'act1' && p.a1 === 'cantor:copy' && p.from === m.name);
}

/** His blow's make (what his rocks carry of him). */
function blowOf(R: BossRules, m: Monster): Blow {
  const half = R.g.halfOf(m);
  return half ? { el: R.g.monsterElement(m), words: m.words, from: m.name, half } : { el: R.g.monsterElement(m), words: m.words, from: m.name };
}

export const RULES: Act1Rules | null = {
  gait: CANTOR_GAIT,
  acts: CANTOR_ACTS,

  spawned(_R, m) {
    m.a1 = { last: 0 };
  },

  can(R, m, a) {
    // (his copies: not while those he sent out last are still about)
    if (a.id === 'cantor:copies') return copiesOf(R, m).length === 0;
    return true;
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const me: Singer = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
    const hurt = (mult: number): boolean => {
      const was = g.hero.life;
      R.blow(m, a.dmg * mult);
      return g.hero.life < was;
    };
    const seen = { v: act.b };
    switch (a.id) {
      case 'cantor:strike':
        sing(R, 0, me, t0, t1, seen, hurt, false);
        break;
      case 'cantor:shout':
        sing(R, 1, me, t0, t1, seen, hurt, false);
        break;
      case 'cantor:copies': {
        // (the bell rung three times; the copies torn away from him, in his picture)
        if (at(0.55) || at(0.78) || at(1.0)) g.sfx('echo', 0.45);
        if (at(CANTOR.copies.tear[0])) g.msg(`${m.name} rings out his echoes`, MSG.foe);
        break;
      }
      case 'cantor:rockfall': {
        const F = CANTOR.rockfall;
        if (at(F.plant)) {
          g.sfx('slam', 0.5);
          g.emit({ t: 'shake', amount: 2 });
        }
        if (at(F.sing)) {
          g.sfx('bossRoar', 0.7);
          const dmg = g.rollMonsterDmg(m) * a.dmg;
          rocksRound(R, blowOf(R, m), me, dmg, true);
          rocksOver(R, blowOf(R, m), dmg);
        }
        // (the rim rumbles as he sings)
        if (t1 > F.sing && t0 < F.hush && Math.floor(t1 * 8) !== Math.floor(t0 * 8)) g.emit({ t: 'shake', amount: 1 });
        break;
      }
      default:
        break;
    }
    act.b = seen.v;
  },

  end(R, m, a) {
    if (a.id !== 'cantor:copies') {
      m.a1 = { ...(m.a1 ?? {}), last: Math.max(0, ECHOED.indexOf(a.id as (typeof ECHOED)[number])) };
      return;
    }
    // HIS COPIES, torn away to either side where his picture put them, each a beat behind him still
    const g = R.g;
    const C = CANTOR.copies;
    const which = m.a1?.last ?? 0;
    const dmg = g.rollMonsterDmg(m) * a.dmg;
    for (let j = 0; j < 2; j++) {
      const o = onPicture(m.fx, m.fy, 0, (j === 0 ? 1 : -1) * C.side);
      // (how far into his move it is as he ends it, and so how much of its end it has still to play)
      const from = C.long - C.delay[j];
      const tail = C.long - from;
      R.peril(m, 'act1', m.x + o.x, m.y + o.y, { a1: 'cantor:copy', a: which, b: from, c: j, d: tail, dmg, dur: tail + ECHO_MOVES[which].long + C.fade, hit: 1e9, hand: handOf(true, m.fx, m.fy) });
    }
  },

  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    if (p.a1 === 'cantor:rock') {
      if (p.done || p.t < p.hit) return;
      p.done = 1;
      // (one of his picture's, round where it lands; one of floor 8's rockfall's, on its tile)
      const r = CANTOR.rockfall.hero.r;
      const under = p.a === 1 ? Math.abs(h.x - p.x) <= r && Math.abs(h.y - p.y) <= r : Math.hypot(h.x - p.x, h.y - p.y) <= CANTOR.rockfall.r;
      if (under) {
        const was = h.life;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
        if (h.life < was) g.knockHero(p.x, p.y, 0.5);
      }
      g.emit({ t: 'shake', amount: 2 });
      g.sfx('slam', 0.35);
      return;
    }
    if (p.a1 !== 'cantor:copy' || p.done & COPY.fading) return;
    // ONE OF HIS COPIES: its end of his move (its tail, `d` long), then his last move, on a clock of its own
    const T1 = p.t - p.d;
    if (T1 < 0) return;
    const move = ECHO_MOVES[p.a];
    if (!(p.done & COPY.begun)) {
      // (its tail played out: it turns to the hero, and begins)
      p.done |= COPY.begun;
      const dx = h.x - p.x;
      const dy = h.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.01) {
        p.fx = dx / d;
        p.fy = dy / d;
      }
      p.hand = handOf(true, p.fx, p.fy);
      g.sfx('echo', 0.4);
    }
    const T0 = Math.max(0, T1 - dt);
    if (T0 >= move.long) {
      // (its move made: it rings out)
      p.done |= COPY.fading;
      return;
    }
    const s: Singer = { x: p.x, y: p.y, fx: p.fx, fy: p.fy, hand: p.hand };
    if (p.a === 2) {
      // (its rockfall: the six round it, drawn with floor 8's rockfall's pictures)
      const F = CANTOR.rockfall;
      if (T0 < F.sing && T1 >= F.sing) rocksRound(R, p, s, p.dmg, false);
      return;
    }
    const hurt = (mult: number, ox: number, oy: number): boolean => {
      const was = h.life;
      g.hurtHero(p.dmg * mult, p.el, p.words, null, p.from, ox, oy, p.half);
      return h.life < was;
    };
    const seen = { v: p.done & 3 };
    sing(R, p.a as 0 | 1, s, T0, Math.min(move.long, T1), seen, hurt, true);
    p.done = (p.done & ~3) | seen.v;
  },

  died(R, m) {
    // (his last note: his copies ring out and fade; his own rocks still to fall round him fall no more)
    const list = R.g.perils;
    for (const p of copiesOf(R, m)) {
      p.done |= COPY.fading;
      p.dur = Math.min(p.dur, p.t + CANTOR.copies.fade);
    }
    for (let k = list.length - 1; k >= 0; k--) {
      const p = list[k];
      if (p.kind === 'act1' && p.a1 === 'cantor:rock' && p.a === 0 && !p.done && p.from === m.name) list.splice(k, 1);
    }
  },
};
