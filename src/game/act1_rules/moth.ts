// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE MOTH: its rules (game/act1_rules/types.ts).
//
// His doc (level 20): "Boss: The Moth (his pick). Its floor is the Tower Top. A vast grey moth, its wings wider than the room is
// long, an eye on each wing that opens and follows you. The dust off its wings is the Hush itself: where it falls, words go dark
// and sound dies. It never lands for long. ... in the last [phase] it settles on the last chapter and its wings beat the whole
// top. The payoff: it dies screaming, the first sound it ever makes, and every word it ever swallowed pours out of it and flies
// home." His pick for how it moves: “Slow, heavy wingbeats”; his yes to its pictures, “Yes, that's the Moth (Recommended)”; and,
// asked where it lands, “Book knocked to the stones (Recommended)” (docs/mockups/moth/README.md, every number).
//
// WHAT IT DOES (the art's numbers, art/moth_moves.ts and moth_fx.ts; the main chat's picks where the art leaves them to the game):
// - IT HOVERS AND DRIFTS over the top (MOTH_PACE), never touching it, keeping off him (MOTH_TUNE.keep); ITS WINGS BEAT one slow
//   beat in 2.4 s, and EACH OF ITS MOVES BEGINS AT THE TOP OF A BEAT and ends there (the art's ask: a move begun mid-beat would
//   make its wings jump): its beat's clock is its own (Monster.a1.beat), drawn by render/act1_fx/moth.ts.
// - ITS BLOWS, all along the way its picture faces (one of the four ways the camera shows it: pictureWay), as the art paints them:
//   THE BUFFET (its basic; MOTH_BUFFET): a gust over a cone before it 140 degrees wide and 9 tiles long: struck, and thrown back.
//   DUST (MOTH_DUST): a cloud of its scales 7 tiles across, 4.5 tiles before it, falling 1.4 s, then a haze of the Hush lying 4 s:
//     in it, his words go dark (Game.hush) and it bites a little.
//   THE EYES (MOTH_EYES): four beams from the eyes on its wings along the lines they stare, the top's whole length, 1.2 wide.
//   THE SWARM (MOTH_SWARM): 150 little grey moths pouring off it in a winding stream, widening to 5 tiles across 18: where they
//     pass him, they strike, a little, again and again.
// - ITS PHASES (by its life: two thirds, a third): each phase it beats faster and drifts faster (MOTH_TUNE.quick), and sheds more
//   dust (a cloud now and then over him, besides its own Dust: MOTH_TUNE.shed). THE LAST: it cannot die in the air; it flies to
//   the lectern, THE LAST CHAPTER IS KNOCKED FROM IT TO THE STONES, and it comes down on the book (MOTH_LAND): there its wings
//   fan over the whole top, and THE BEAT (MOTH_BEAT_BLOW) sends a wind rolling out round it 11 tiles, the whole top (dodge
//   through it); its dust falls thick.
// - ITS DEATH, on the book: it screams, the first sound it ever makes; every word it swallowed pours out of it and flies home; it
//   falls onto the book and crumbles to dust (its own picture: MOTH_DIES).
// No lines: it is silent until its scream (game/defs.ts BOSS_LINES, game/boss_calls.ts).

import { BEAT_RING, BOOK, BUFFET_CONE, DUST_CLOUD, EYE_BEAMS, MOTH_BEAT, MOTH_BEAT_BLOW, MOTH_BUFFET, MOTH_DUST, MOTH_EYES, MOTH_LAND, MOTH_PACE, MOTH_SWARM, SWARM, beamLines, mothGeomAt } from '../../art/moth_moves';
import { CLOUD_FX, GUST_FX, WAVE_FX, swarmAt } from '../../art/moth_fx';
import { TILE3 } from '../../art/new_mobs3';
import type { V3 } from '../../art/skeleton';
import { beside, handOf } from '../facing';
import type { ActDef, BossRules } from '../bosses';
import type { Level, Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/**
 * ITS NUMBERS: how near him it keeps (under it, its buffet throws him back off it); how much faster each phase beats and drifts; each blow's share of its blow, its waits; the
 * gust's throw; the dust's bite and how often, how long his words go dark in it; the beams' strike; the swarm's; the beat's ring;
 * the dust it sheds over him each phase (how often, none in the first); how fast it flies to the book, where the book falls.
 */
export const MOTH_TUNE = {
  keep: 4.2,
  quick: [1, 1.25, 1.4] as const,
  buffet: { dmg: 1, push: 1.6 },
  dust: { bite: 0.18, every: 0.6, hush: 1.2, cd: [9, 7] as const },
  eyes: { dmg: 1.3, cd: [11, 9] as const, wide: EYE_BEAMS.wide / 2 + 0.25, from: 2 },
  swarm: { dmg: 0.3, every: 0.45, near: 0.75, cd: [13, 11] as const },
  beat: { dmg: 1.1, wide: 0.75, cd: 3.2 },
  shed: { every: [0, 9, 5] as const, warn: 1.0 },
  fly: 6,
  /** The book on the stones: this far from the lectern, toward the eye; the Moth coming down on it facing the eye. */
  book: 1.6,
} as const;

/** Its phase: 0, 1 or 2 (its last, on the book), by its life. */
export function mothPhase(m: Monster): 0 | 1 | 2 {
  const k = m.life / m.maxLife;
  return k > 2 / 3 ? 0 : k > 1 / 3 ? 1 : 2;
}

const ACTS: readonly ActDef[] = [
  { id: 'moth:buffet', clip: 'attack', long: MOTH_BUFFET.long, hit: MOTH_BUFFET.hit, dmg: MOTH_TUNE.buffet.dmg, cooldown: 0, first: 1, after: 0.4, near: 0, far: BUFFET_CONE.tiles - 1 },
  { id: 'moth:dust', clip: 'dust', long: MOTH_DUST.long, hit: MOTH_DUST.hit, dmg: 0, cooldown: MOTH_TUNE.dust.cd[0], first: 4, after: 0.2, near: 1.5, far: DUST_CLOUD.ahead + DUST_CLOUD.tiles / 2 },
  { id: 'moth:swarm', clip: 'swarm', long: MOTH_SWARM.long, hit: MOTH_SWARM.hit, dmg: MOTH_TUNE.swarm.dmg, cooldown: MOTH_TUNE.swarm.cd[0], first: 9, after: 0.2, near: 3, far: SWARM.tiles - 3 },
  { id: 'moth:eyes', clip: 'eyes', long: MOTH_EYES.long, hit: MOTH_EYES.hit, dmg: MOTH_TUNE.eyes.dmg, cooldown: MOTH_TUNE.eyes.cd[0], first: 6, after: 0.2, near: 2.4, far: EYE_BEAMS.tiles - 2 },
  { id: 'moth:beat', clip: 'beat', long: MOTH_BEAT_BLOW.long, hit: MOTH_BEAT_BLOW.hit, dmg: MOTH_TUNE.beat.dmg, cooldown: MOTH_TUNE.beat.cd, first: 1.2, after: 0, near: 0, far: 99 },
  { id: 'moth:land', clip: 'land', long: MOTH_LAND.long, hit: MOTH_LAND.touch, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 999, forced: true },
];
const LAND = ACTS.findIndex((a) => a.id === 'moth:land');
const IN_AIR = new Set(['moth:buffet', 'moth:dust', 'moth:swarm', 'moth:eyes']);

const a1Of = (m: Monster): Record<string, number> => m.a1 ?? (m.a1 = {});
/** Whether it is down on the book. */
export const perched = (m: Monster): boolean => (m.a1?.perched ?? 0) === 1;
/** Its beat's clock now (seconds into the beat, 0 its top). */
export const beatOf = (m: Monster): number => m.a1?.beat ?? 0;

/** The axis its picture faces along (its blows drawn in its picture go that way): +x, +y, -y or -x (game/facing.ts). */
export function pictureWay(fx: number, fy: number): { fx: number; fy: number } {
  const back = fx + fy < -0.2;
  const flip = fx - fy < 0;
  return back ? (flip ? { fx: -1, fy: 0 } : { fx: 0, fy: -1 }) : flip ? { fx: 0, fy: 1 } : { fx: 1, fy: 0 };
}
/** A point of the art's (its own lengths: forward, to its left, up) on the floor of the world, from (x, y) facing (fx, fy) as its picture does. */
export function artToWorld(x: number, y: number, fx: number, fy: number, p: V3 | readonly number[]): { x: number; y: number } {
  return beside(x, y, fx, fy, handOf(true, fx, fy), p[0] / TILE3, p[1] / TILE3);
}

/** THE LECTERN (the last chapter on it): its middle, from the floor's plan. */
function lecternOf(L: Level): { x: number; y: number } | null {
  const T = L.land?.tower;
  return T ? { x: T.top.cx, y: T.top.cy } : null;
}
/** Where the book falls, and where the Moth comes down on it (its floor point, BOOK.at behind the book), facing the eye. */
export function bookOf(L: Level): { book: { x: number; y: number }; at: { x: number; y: number }; fx: number; fy: number } | null {
  const c = lecternOf(L);
  if (!c) return null;
  // (toward the eye: +x +y; it faces the eye, its picture the front's)
  const fx = Math.SQRT1_2;
  const fy = Math.SQRT1_2;
  const book = { x: c.x + fx * MOTH_TUNE.book, y: c.y + fy * MOTH_TUNE.book };
  const w = pictureWay(fx, fy);
  const at = { x: book.x - (w.fx * BOOK.at[0]) / TILE3, y: book.y - (w.fy * BOOK.at[0]) / TILE3 };
  return { book, at, fx, fy };
}

/** Whether (hx, hy) is in a beam of the Eyes laid from (x, y) facing (fx, fy). */
export function inBeams(x: number, y: number, fx: number, fy: number, hx: number, hy: number): boolean {
  const G = mothGeomAt('eyes', MOTH_EYES.hit);
  for (const b of beamLines(G)) {
    // (from the top under its eye, MOTH_TUNE.eyes.from tiles on, along the line it stares)
    const a = artToWorld(x, y, fx, fy, [b.from[0] + MOTH_TUNE.eyes.from * TILE3, b.from[1], 0]);
    const z = artToWorld(x, y, fx, fy, [b.from[0] + b.to[0], b.from[1] + b.to[1], 0]);
    const vx = z.x - a.x;
    const vy = z.y - a.y;
    const len = Math.hypot(vx, vy) || 1;
    const along = ((hx - a.x) * vx + (hy - a.y) * vy) / len;
    const across = Math.abs((-(hx - a.x) * vy + (hy - a.y) * vx) / len);
    if (along >= -0.3 && along <= len && across <= MOTH_TUNE.eyes.wide) return true;
  }
  return false;
}
/** Whether (hx, hy) is under the gust of a buffet from (x, y) facing (fx, fy). */
export function inGust(x: number, y: number, fx: number, fy: number, hx: number, hy: number): boolean {
  const dx = hx - x;
  const dy = hy - y;
  const d = Math.hypot(dx, dy);
  if (d > BUFFET_CONE.tiles) return false;
  if (d < 1.2) return true;
  return (dx * fx + dy * fy) / d >= Math.cos(((BUFFET_CONE.deg / 2) * Math.PI) / 180);
}
/** The middle of its Dust's cloud, from (x, y) facing (fx, fy). */
export const cloudAt = (x: number, y: number, fx: number, fy: number): { x: number; y: number } => ({ x: x + fx * DUST_CLOUD.ahead, y: y + fy * DUST_CLOUD.ahead });
/** How long a cloud of its dust lasts: falling, lying, fading. */
export const CLOUD_LONG = 1.4 + CLOUD_FX.hold + CLOUD_FX.fade;
/** How far its beat's wind has rolled out `t` seconds after the beat lands (tiles). */
export const waveAt = (t: number): number => 1.6 + (BEAT_RING.tiles - 1.6) * (1 - (1 - Math.min(1, Math.max(0, t) / WAVE_FX.reach)) ** 3);

/** Where its swarm pours from: its thorax at the swarm's burst (its own lengths). */
let FROM: V3 | null = null;
export function swarmFrom(): V3 {
  return (FROM ??= mothGeomAt('swarm', MOTH_SWARM.hit).TC);
}

export const RULES: Act1Rules | null = {
  // (its walk's loop for the gait a short one: it stops where it means to; its wings' beat is its own clock's, `tick`)
  gait: { pace: MOTH_PACE, cycle: 0.2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: MOTH_TUNE.keep, slack: 1.2, trueBack: true },
  acts: ACTS,
  bossAt(L) {
    // (hovering over the top beyond the lectern, facing where he comes up)
    const T = L.land?.tower;
    if (!T) return null;
    const fx = T.top.arrive.x - T.top.cx;
    const fy = T.top.arrive.y - (T.top.cy - 3);
    const d = Math.hypot(fx, fy) || 1;
    return { x: T.top.cx, y: T.top.cy - 3, fx: fx / d, fy: fy / d };
  },
  spawned(_R, m) {
    a1Of(m).beat = 0;
  },
  aloft: () => true,
  height: (m) => (perched(m) ? 10 : 90),
  seenBy(m, sees) {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (sees(Math.floor(m.x) + dx, Math.floor(m.y) + dy)) return true;
    return false;
  },
  lifeFloor(_R, m) {
    // (it cannot die in the air: its last phase is on the book)
    return perched(m) ? 0 : 1;
  },
  invulnerable(m) {
    // (flying to the book and coming down on it)
    return !!a1Of(m).toLand || m.act?.id === 'moth:land';
  },
  tick(R, m, dt) {
    const k = a1Of(m);
    const ph = mothPhase(m);
    // (its beat's clock: faster each phase)
    k.beat = ((k.beat ?? 0) + dt * MOTH_TUNE.quick[ph]) % MOTH_BEAT.long;
    // (its drift faster each phase; on the book it stays where it came down, facing the eye, its feet round the book)
    if (!k.base) k.base = m.speed;
    m.speed = perched(m) ? 0 : k.base * MOTH_TUNE.quick[ph];
    if (perched(m)) {
      const B = bookOf(R.g.level);
      if (B) {
        m.x = B.at.x;
        m.y = B.at.y;
        m.fx = B.fx;
        m.fy = B.fy;
      }
    }
    // (the dust it sheds over him, now and then, from its second phase)
    const every = MOTH_TUNE.shed.every[ph];
    if (every > 0 && !k.toLand && m.act?.id !== 'moth:land') {
      k.shed = (k.shed ?? every * 0.6) - dt;
      if (k.shed <= 0) {
        k.shed = every;
        const h = R.g.hero;
        R.peril(m, 'act1', h.x, h.y, { a1: 'moth:shed', t: -MOTH_TUNE.shed.warn, hit: 0, dur: CLOUD_LONG, dmg: R.g.rollMonsterDmg(m) * MOTH_TUNE.dust.bite });
      }
    }
    // THE LAST PHASE: to the lectern; the book knocked to the stones; down on it
    if (ph === 2 && !perched(m) && !m.act) {
      const B = bookOf(R.g.level);
      if (!B) return false;
      if (!k.toLand) {
        k.toLand = 1;
        R.g.sfx('whirl', 0.6);
      }
      const dx = B.at.x - m.x;
      const dy = B.at.y - m.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.15) {
        const step = Math.min(d, MOTH_TUNE.fly * dt);
        m.x += (dx / d) * step;
        m.y += (dy / d) * step;
        m.anim = 'walk';
        return true;
      }
      m.x = B.at.x;
      m.y = B.at.y;
      m.fx = B.fx;
      m.fy = B.fy;
      if (!k.bookDown) {
        // (the chapter falls from its lectern to the stones)
        k.bookDown = 1;
        R.peril(m, 'act1', B.book.x, B.book.y, { a1: 'moth:book', dur: 1e9, hit: 0 });
        const lectern = R.g.level.props.find((q) => q.kind === 'piece' && q.name === 'the last chapter on its lectern');
        if (lectern) lectern.variant = 1;
        R.g.sfx('door', 0.4);
      }
      m.anim = 'idle';
      // (at the top of a beat the rest of its step runs, and brings its coming down: forced)
      return (k.beat ?? 0) >= 1 / MOTH_BEAT.fps;
    }
    return false;
  },
  forced(_R, m) {
    const k = a1Of(m);
    // (down on the book, once it is over it and at the top of a beat)
    if (k.toLand && k.bookDown && !perched(m) && (k.beat ?? 0) < 1 / MOTH_BEAT.fps) return LAND;
    return -1;
  },
  can(_R, m, a) {
    const k = a1Of(m);
    if (k.toLand) return false;
    // (each move begun at the top of a beat)
    if ((k.beat ?? 0) >= 1.2 / MOTH_BEAT.fps) return false;
    if (perched(m)) return a.id === 'moth:beat';
    return IN_AIR.has(a.id);
  },
  start(R, m, a) {
    // (its blows go the way its picture faces)
    const w = pictureWay(m.fx, m.fy);
    const k = a1Of(m);
    k.wx = w.fx;
    k.wy = w.fy;
    if (a.id === 'moth:eyes' || a.id === 'moth:swarm') R.g.sfx('whirl', 0.3);
  },
  end(R, m, a) {
    const k = a1Of(m);
    // (each move ends at the top of a beat)
    k.beat = 0;
    if (a.id === 'moth:land') {
      k.perched = 1;
      k.toLand = 0;
      R.g.emit({ t: 'shake', amount: 4 });
    }
    // (its waits shorter in its second phase)
    void R;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const k = a1Of(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const wx = k.wx ?? m.fx;
    const wy = k.wy ?? m.fy;
    switch (a.id) {
      case 'moth:buffet':
        if (!at(a.hit)) return;
        g.sfx('gust', 0.9);
        g.emit({ t: 'shake', amount: 3 });
        R.peril(m, 'act1', m.x, m.y, { a1: 'moth:gust', fx: wx, fy: wy, dur: GUST_FX.long, hit: 0 });
        if (!h.move && inGust(m.x, m.y, wx, wy, h.x, h.y)) {
          R.blow(m, a.dmg);
          // (thrown back by the wind, so far as the floor lets him)
          const dx = h.x - m.x;
          const dy = h.y - m.y;
          const d = Math.hypot(dx, dy) || 1;
          for (let s = 0; s < 16; s++) {
            const nx = h.x + ((dx / d) * MOTH_TUNE.buffet.push) / 16;
            const ny = h.y + ((dy / d) * MOTH_TUNE.buffet.push) / 16;
            if (!g.isOpen(nx, ny)) break;
            h.x = nx;
            h.y = ny;
          }
        }
        return;
      case 'moth:dust':
        if (!at(a.hit)) return;
        g.sfx('whirl', 0.4);
        {
          const c = cloudAt(m.x, m.y, wx, wy);
          R.peril(m, 'act1', c.x, c.y, { a1: 'moth:dust', fx: wx, fy: wy, dur: CLOUD_LONG, hit: 0, dmg: g.rollMonsterDmg(m) * MOTH_TUNE.dust.bite, b: m.x, c: m.y });
        }
        return;
      case 'moth:eyes':
        if (!at(a.hit)) return;
        g.sfx('beam', 0.8);
        g.emit({ t: 'shake', amount: 3 });
        R.peril(m, 'act1', m.x, m.y, { a1: 'moth:beams', fx: wx, fy: wy, dur: 0.75, hit: 0 });
        if (!h.move && inBeams(m.x, m.y, wx, wy, h.x, h.y)) R.blow(m, a.dmg);
        return;
      case 'moth:swarm':
        if (!at(a.hit)) return;
        g.sfx('whirl', 0.7);
        R.peril(m, 'act1', m.x, m.y, { a1: 'moth:swarm', fx: wx, fy: wy, dur: SWARM.long, hit: 0, dmg: g.rollMonsterDmg(m) * a.dmg });
        return;
      case 'moth:land':
        if (at(MOTH_LAND.touch)) {
          g.sfx('slam', 0.6);
          g.emit({ t: 'shake', amount: 5 });
        }
        return;
      case 'moth:beat':
        if (!at(a.hit)) return;
        g.sfx('gust', 1);
        g.emit({ t: 'shake', amount: 6 });
        R.peril(m, 'act1', m.x, m.y, { a1: 'moth:wave', dur: WAVE_FX.long, hit: 0, dmg: g.rollMonsterDmg(m) * a.dmg });
        return;
    }
  },
  peril(R, p: Peril, dt) {
    const g = R.g;
    const h = g.hero;
    if (p.done || g.over) return;
    switch (p.a1) {
      case 'moth:dust':
      case 'moth:shed': {
        // (once its scales have fallen: the haze of the Hush, his words dark in it, biting now and then)
        if (p.t < 1.4 || p.t > CLOUD_LONG - CLOUD_FX.fade * 0.5) return;
        if (Math.hypot(h.x - p.x, h.y - p.y) > DUST_CLOUD.tiles / 2) return;
        g.hush(MOTH_TUNE.dust.hush);
        p.d = (p.d ?? 0) - dt;
        if (p.d <= 0) {
          p.d = MOTH_TUNE.dust.every;
          g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
        }
        return;
      }
      case 'moth:swarm': {
        // (where the little moths pass him they strike, again and again)
        p.d = (p.d ?? 0) - dt;
        if (p.d > 0 || h.move) return;
        for (const q of swarmAt(p.t, swarmFrom())) {
          const w = artToWorld(p.x, p.y, p.fx, p.fy, q.p);
          if (Math.hypot(h.x - w.x, h.y - w.y) <= MOTH_TUNE.swarm.near) {
            p.d = MOTH_TUNE.swarm.every;
            g.hurtHero(p.dmg, p.el, p.words, null, p.from, w.x, w.y, p.half);
            return;
          }
        }
        return;
      }
      case 'moth:wave': {
        // (the beat's wind rolling out over the whole top: it strikes him as it passes under him, once)
        if (p.t > WAVE_FX.reach + 0.1) return;
        if (!h.move && Math.abs(Math.hypot(h.x - p.x, h.y - p.y) - waveAt(p.t)) <= MOTH_TUNE.beat.wide) {
          p.done = 1;
          g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
        }
        return;
      }
    }
  },
  died(R, m) {
    // (the scream: the first sound it ever makes; every word it swallowed flying home, far off over the top)
    R.g.sfx('bossRoar', 1);
    R.g.emit({ t: 'shake', amount: 8 });
    const w = pictureWay(m.fx, m.fy);
    R.peril(m, 'act1', m.x, m.y, { a1: 'moth:words', fx: w.fx, fy: w.fy, dur: 6, hit: 0 });
  },
};
