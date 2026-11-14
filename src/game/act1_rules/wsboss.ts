// ENDLESS MODE'S FINAL BOSS: THE WARPED WORDSMITH ON HIS BOAR: his rules (game/act1_rules/types.ts). Behind ENDLESS_KEY
// (game/endless_key.ts, off): he is only ever made in his arena (game/final_arena.ts), and that only with it on.
//
// HIS WORDS FOR HIM (the queue's build-endless-tablet-and-final-boss; every word of his in docs/mockups/endless_tablet/README.md):
// “the biggest, baddest boss in the game ... a well geared, well rounded character to deafeat.  The fight needs to be fun and
// engaging and tough as nails.  I want it to be something you have to prep for or he’ll wipe the floor with you.  Not unfair or
// gimmicky, just hard”. His fight's flow, with his yes (docs/mockups/endless_tablet/FIGHT_FLOW.md), and his one change to it:
// “i dont like that something is going to pop every fourth hit.  having them in catagories is fine but i dont want a move to be
// gaurenteed to happen.”
//
// STAGE 2: PHASE 1, IN THE SADDLE (full life to half). His look and every move are the art chat's (art/endless_boss.ts), each with his
// yes; every time and length here is theirs (30 frames a second). What hurts, how hard, how near, how long what lies on the floor
// lasts, and when: these rules (the main chat's numbers, WS_TUNE, to tune).
//   THE FOUR KINDS (FIGHT_FLOW): DODGE (coming at you, warned first), FLOOR (lies a while), TAKE IT (cannot be dodged), OPENING.
//   NEVER MORE THAN TWO THINGS AT ONCE: one thing the boar (or he) is doing, one thing his words are doing; every warning before it
//   can hurt.
//   THE BEATS: the boar's moves and his words take turns, each drawn at random from those that fit (never the same twice running):
//     THE BOAR   THE CHARGE (DODGE): two or three runs down a lane along the way it faces, wheeling round between, each faster; the
//                lane marked first; struck, he is thrown aside. Then, its cost, WINDED (OPENING): it stands panting, nothing comes.
//                THE GORE (DODGE), only if he is close: its tusks hooked up through the 90 degrees before it; thrown.
//                THE REAR UP AND STOMP (DODGE): three shock rings roll out from its forefeet, its reach marked first.
//     HIS WORDS  POWER (DODGE): a great hammer crushed straight down three times on his shadow, which chases him a beat behind.
//                FLAME (DODGE, then FLOOR): meteors over the arena, each onto its mark; where each fell burns a while.
//                FROST (DODGE): five lines of ice spikes racing out at him in a fan; the floor frozen behind them, chilling.
//                LIGHTNING (TAKE IT, then DODGE): one great orb drifting after him, its small zaps finding him wherever he is;
//                its burst at the last, swelling first, dodged.
//                POISON (FLOOR): spore traps over the floor about him, each a rune burned in; come near one and it snaps into a
//                cloud of poison that hangs a while.
//   Never two of his words' FLOORs at once (the meteors' burning, the traps).
//   HIS FACING: one of the four ways he is painted from (art/act1_figs/wsboss.ts): along the grid's axes; each move goes the way he
//   faces, turned to the axis nearest the hero as it begins.
//   AT HALF HIS LIFE the boar dies and he fights on foot: the next stage's (THE BUILD's stage 3). Until it is built his life is held
//   at half.

import { BOLT, CHARGE, CHARGE_SKID, CHARGE_STRIKE, FIRE, FIRE_DROPS, FROST, FROST_SPIKES, GORE, POWER, SPORE, SPORE_PODS, STOMP, WHEEL, WINDED, chargeCarry } from '../../art/endless_boss';
import { TILE3 } from '../../art/new_mobs3';
import { FINAL_BOSS_AT, FINAL_PLACE, onArena, toEdge } from '../../art/final_arena';
import type { ActDef, BossRules } from '../bosses';
import type { Monster, Peril } from '../state';
import type { Element } from '../types';
import type { Act1Rules } from './types';

/**
 * HIS NUMBERS (the main chat's, to tune): the wait between beats; the charge's runs and how much faster each is, its lane's
 * half-breadth (body to body), its throw; the gore's reach and throw; the stomp's rings (their breadth, each ring's share); each
 * word's: the hammer's reach and how far its shadow lags him; the meteors' strike and their burning (how long, how often, how much);
 * the ice's reach at each spike and the frozen floor's chill and how long it lies; the orb's pace, its zaps' every and share, its
 * burst's reach; the traps' trigger and their cloud's reach, bite and every, how long they lie.
 */
export const WS_TUNE = {
  pause: [0.45, 0.95] as const,
  charge: { runs: [2, 3] as const, rate: [1, 1.15, 1.3] as const, half: CHARGE.half + 0.35, dmg: 1.6, throw: 1.6, wall: 1.5 },
  gore: { near: GORE.reach + 0.9, reach: GORE.reach + 1.0, half: (GORE.arc / 2) * (Math.PI / 180), dmg: 1.4, throw: 2.2 },
  stomp: { near: STOMP.reach + 2.5, reach: STOMP.reach, band: 0.55, dmg: [1.0, 0.6, 0.6] as const, foot: 1.0 },
  power: { reach: 1.35, lag: 1.6, lock: 0.3, dmg: 1.5 },
  flame: { reach: 1.05, dmg: 1.1, burn: { r: 0.85, long: 7.0, every: 0.5, dmg: 0.22 }, keep: 2.2 },
  frost: { reach: 0.55, dmg: 1.0, rime: { long: 6.0, chill: 0.5, every: 0.25 } },
  bolt: { pace: 1.7, high: 1.2, life: 6.4, zap: { every: 0.75, from: 0.8, reach: 7.0, dmg: 0.24 }, swell: 0.6, burst: { reach: BOLT.reach + 0.4, dmg: 1.7 } },
  spore: { near: 0.85, cloud: { r: 1.35, every: 0.4, dmg: 0.22 }, lie: 14, swell: SPORE.swell, long: SPORE.cloud },
} as const;

/** The bits of the art's own lengths in a tile. */
const T = TILE3;
const a1Of = (m: Monster): Record<string, number> => m.a1 ?? (m.a1 = {});

/** HIS ACTS, every one brought by his own beats (`forced`), none by the game's choosing. */
const ACTS: readonly ActDef[] = [
  { id: 'wsboss:charge', clip: 'charge', long: CHARGE.long, hit: CHARGE_STRIKE[1], dmg: WS_TUNE.charge.dmg, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:wheel', clip: 'wheel', long: WHEEL.long, hit: WHEEL.long, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:winded', clip: 'winded', long: WINDED.long, hit: WINDED.long, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:gore', clip: 'gore', long: GORE.long, hit: GORE.hit, dmg: WS_TUNE.gore.dmg, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:stomp', clip: 'stomp', long: STOMP.long, hit: STOMP.hit, dmg: 1, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:power', clip: 'power', long: POWER.long, hit: POWER.slams[0], dmg: WS_TUNE.power.dmg, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:flame', clip: 'flame', long: FIRE.long, hit: FIRE.burst, dmg: WS_TUNE.flame.dmg, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:frost', clip: 'frost', long: FROST.long, hit: FROST.hit, dmg: WS_TUNE.frost.dmg, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:lightning', clip: 'lightning', long: BOLT.long, hit: BOLT.crack, dmg: 1, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'wsboss:poison', clip: 'poison', long: SPORE.long, hit: SPORE.burst, dmg: 1, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
];
const IX = (id: string): number => ACTS.findIndex((a) => a.id === `wsboss:${id}`);
/** The boar's moves and his words, as the beats draw them. */
const BODY = ['charge', 'gore', 'stomp'] as const;
const WORDS = ['power', 'flame', 'frost', 'lightning', 'poison'] as const;
/** His words that leave something lying on the floor a while (never two at once). */
const FLOORS = new Set(['flame', 'poison']);
/** Each word's element, as the hero's are. */
const EL: Record<(typeof WORDS)[number], Element> = { power: 'phys', flame: 'fire', frost: 'frost', lightning: 'lightning', poison: 'phys' };

/** Is it in its first phase (in the saddle)? Stage 2 has only this. */
export const inSaddle = (_m: Monster): boolean => true;

/** The axis of the grid nearest a way (he is painted facing along one of the four). */
export function axisOf(dx: number, dy: number): { fx: number; fy: number } {
  return Math.abs(dx) >= Math.abs(dy) ? { fx: dx >= 0 ? 1 : -1, fy: 0 } : { fx: 0, fy: dy >= 0 ? 1 : -1 };
}
/** A point of the art's own (forward, to its left, along the floor, in its lengths) on the floor, from (x, y) facing (fx, fy). */
export function artAt(x: number, y: number, fx: number, fy: number, a: number, b: number): { x: number; y: number } {
  return { x: x + (fx * a + fy * b) / T, y: y + (fy * a - fx * b) / T };
}
/** Where (px, py) is from (x, y) facing (fx, fy): tiles before it, and to its left. */
function rel(x: number, y: number, fx: number, fy: number, px: number, py: number): { fwd: number; left: number } {
  const dx = px - x;
  const dy = py - y;
  return { fwd: dx * fx + dy * fy, left: dx * fy - dy * fx };
}

/** How far the boar has been carried down its lane, `t` seconds into a run (tiles), as far as the lane lets it (`scale`). */
export const carried = (t: number, scale: number): number => chargeCarry(t) * scale;
/** Its run's whole carry (tiles; asked each time, not kept as the module is read: the art's numbers are whole by then). */
export const carryAll = (): number => chargeCarry(CHARGE.long);
/** How far the stomp's ring `j` has rolled out `u` seconds after it struck (tiles; -1 not yet or gone). */
export function ringAt(j: number, u: number): number {
  const s = u - STOMP.rings[j];
  if (s < 0 || s > STOMP.ringLong) return -1;
  const k = s / STOMP.ringLong;
  return 0.6 + (WS_TUNE.stomp.reach - 0.6) * (1 - (1 - k) ** 2);
}
/** THE HAMMER'S SHADOW: where it will come down `t` seconds into his Power, as the rules move it (kept on the monster). */
export const hammerAt = (m: Monster): { x: number; y: number } => ({ x: m.a1?.hx ?? m.x, y: m.a1?.hy ?? m.y });
/** When each of the hammer's three blows lands (seconds into his Power). */
export const SLAMS = POWER.slams;
/** The ice's clusters: where each is from the place the rune struck (its own lengths, along the way he faces) and when it bursts. */
export const ICE_STEPS: ReadonlyArray<{ a: number; b: number; t: number }> = FROST_SPIKES.filter((_, i) => i % 3 === 0).map((s) => ({ a: s.at[0], b: s.at[1], t: s.t }));
/** Where the ice starts: this far before him (tiles). */
export const ICE_FROM = FROST.from;
/** How swollen the orb is `u` seconds into its life (0 ... 1, before it bursts). */
export const orbSwell = (u: number): number => Math.max(0, Math.min(1, (u - (WS_TUNE.bolt.life - WS_TUNE.bolt.swell)) / WS_TUNE.bolt.swell));

/** His floors' perils of his words still lying (the meteors' burning, the traps). */
function floorLying(R: BossRules): boolean {
  return R.g.perils.some((p) => (p.a1 === 'wsboss:meteor' || p.a1 === 'wsboss:trap') && p.t < p.dur - 0.5);
}
/** One of `list`, at random (by the game's own dice), weighted. */
function draw<K extends string>(R: BossRules, list: readonly (readonly [K, number])[]): K | null {
  const sum = list.reduce((s, [, w]) => s + w, 0);
  if (sum <= 0) return null;
  let r = R.g.rng.range(0, sum);
  for (const [k, w] of list) {
    r -= w;
    if (r <= 0) return k;
  }
  return list[list.length - 1][0];
}

export const RULES: Act1Rules | null = {
  // (he never walks: the boar goes over the floor by its charges alone; between moves it stands, turned to him)
  gait: { pace: 1, cycle: 1, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 999, slack: 1, trueBack: true },
  acts: ACTS,
  bossAt(L) {
    return L.final ? { ...FINAL_BOSS_AT } : null;
  },
  spawned(_R, m) {
    const k = a1Of(m);
    k.wait = 1.6;
    k.body = 0;
  },
  seenBy(m, sees) {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (sees(Math.floor(m.x) + dx, Math.floor(m.y) + dy)) return true;
    return false;
  },
  lifeFloor(_R, m) {
    // (STAGE 2: the boar's death and his second phase are the next stage's: until then his life is held at half)
    return inSaddle(m) ? Math.ceil(m.maxLife * 0.5) : 0;
  },
  tick(R, m, dt) {
    const k = a1Of(m);
    // (his stand's own clock, for its pictures)
    k.clock = (k.clock ?? 0) + dt;
    if (!m.act) k.wait = Math.max(0, (k.wait ?? 0) - dt);
    // (mid-charge, between its runs and its wheel, it keeps the way it faces down its lane)
    if (!m.act && (k.runs ?? 0) > 0) {
      m.fx = k.fx ?? m.fx;
      m.fy = k.fy ?? m.fy;
    }
    void R;
    return false;
  },
  forced(R, m) {
    const k = a1Of(m);
    if ((k.wait ?? 0) > 0) return -1;
    const h = R.g.hero;
    const dist = Math.hypot(h.x - m.x, h.y - m.y);
    // (a charge going on: the next run, wheeling round first; when its runs are done, winded)
    if ((k.runs ?? 0) > 0) return k.wheel ? IX('wheel') : IX('charge');
    if (k.windNext) {
      k.windNext = 0;
      return IX('winded');
    }
    // (the beats take turns: the boar, then his word)
    if (k.body) {
      const last = WORDS[(k.lastWord ?? -1) | 0] as string | undefined;
      const floor = floorLying(R);
      const w = draw(R, WORDS.filter((x) => x !== last && !(FLOORS.has(x) && floor)).map((x) => [x, 1] as const));
      if (!w) return -1;
      k.lastWord = WORDS.indexOf(w);
      k.body = 0;
      return IX(w);
    }
    const last = BODY[(k.lastBody ?? -1) | 0] as string | undefined;
    const fits: [(typeof BODY)[number], number][] = [];
    if (last !== 'charge') fits.push(['charge', 1.2]);
    if (last !== 'gore' && dist <= WS_TUNE.gore.near) fits.push(['gore', 1.6]);
    if (last !== 'stomp' && dist <= WS_TUNE.stomp.near) fits.push(['stomp', 1]);
    const b = draw(R, fits.length ? fits : [['charge', 1]]) ?? 'charge';
    k.lastBody = BODY.indexOf(b);
    k.body = 1;
    if (b === 'charge') {
      k.runs = R.g.rng.int(WS_TUNE.charge.runs[0], WS_TUNE.charge.runs[1]);
      k.run = 0;
      k.wheel = 0;
      return IX('charge');
    }
    return IX(b);
  },
  start(R, m, a) {
    const g = R.g;
    const h = g.hero;
    const k = a1Of(m);
    const id = a.id.slice(7);
    // (turned to the axis nearest him; but the wheel spins round from the way it ran, a run after a wheel goes back down its lane
    // the way it now faces, and winded it stands where it stopped)
    const keep = id === 'wheel' || id === 'winded' || (id === 'charge' && (k.run ?? 0) > 0);
    if (!keep) {
      const w = axisOf(h.x - m.x, h.y - m.y);
      m.fx = w.fx;
      m.fy = w.fy;
    } else {
      m.fx = k.fx ?? m.fx;
      m.fy = k.fy ?? m.fy;
    }
    k.fx = m.fx;
    k.fy = m.fy;
    k.x0 = m.x;
    k.y0 = m.y;
    k.struck = 0;
    if (!m.act) return;
    if (id === 'charge') {
      const n = (k.run ?? 0) | 0;
      m.act.rate = WS_TUNE.charge.rate[Math.min(n, 2)];
      // (its lane: as long as its run, or to the floor's edge)
      const room = toEdge(m.x, m.y, m.fx, m.fy, WS_TUNE.charge.wall);
      const all = carryAll();
      k.scale = Math.max(0.15, Math.min(1, room / all));
      k.lane = all * k.scale;
    } else if (id === 'power') {
      // (the hammer's shadow: under him to begin with, chasing him a beat behind)
      k.hx = h.x;
      k.hy = h.y;
    } else if (id === 'lightning' || id === 'poison' || id === 'flame') {
      k.cx = h.x;
      k.cy = h.y;
    }
    g.sfx('bossRoar', 0.35);
  },
  end(R, m, a) {
    const k = a1Of(m);
    const id = a.id.slice(7);
    k.wait = R.g.rng.range(WS_TUNE.pause[0], WS_TUNE.pause[1]);
    if (id === 'charge') {
      k.run = ((k.run ?? 0) | 0) + 1;
      k.runs = Math.max(0, ((k.runs ?? 0) | 0) - 1);
      // (another run to come: it wheels round first, with no wait; its last run's cost: winded)
      if (k.runs > 0) {
        k.wheel = 1;
        k.wait = 0;
      } else k.windNext = 1;
    } else if (id === 'wheel') {
      // (wheeled round: it faces back down its lane, the next run's way)
      k.wheel = 0;
      k.wait = 0;
      m.fx = -(k.fx ?? m.fx);
      m.fy = -(k.fy ?? m.fy);
      k.fx = m.fx;
      k.fy = m.fy;
    }
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const k = a1Of(m);
    const at = (T0: number): boolean => t0 < T0 && t1 >= T0;
    const fx = k.fx ?? m.fx;
    const fy = k.fy ?? m.fy;
    const roll = g.rollMonsterDmg(m);
    switch (a.id) {
      case 'wsboss:charge': {
        // THE RUN: carried down its lane; struck, he is thrown aside, once a run
        const d = carried(t1, k.scale ?? 1);
        const nx = (k.x0 ?? m.x) + fx * d;
        const ny = (k.y0 ?? m.y) + fy * d;
        if (onArena(nx, ny, 0.6)) {
          m.x = nx;
          m.y = ny;
        }
        if (at(CHARGE_STRIKE[1])) {
          g.sfx('slam', 0.7);
          g.emit({ t: 'shake', amount: 4 });
        }
        if (t1 > CHARGE_STRIKE[0] && t1 < CHARGE_SKID[1] && !k.struck && !h.move) {
          const r = rel(m.x, m.y, fx, fy, h.x, h.y);
          if (r.fwd > -1.4 && r.fwd < 1.9 && Math.abs(r.left) < WS_TUNE.charge.half) {
            k.struck = 1;
            R.blow(m, a.dmg);
            // (thrown to the side it was on, out of the lane)
            const side = r.left >= 0 ? 1 : -1;
            g.knockHero(h.x - fy * side, h.y + fx * side, WS_TUNE.charge.throw);
          }
        }
        if (at(CHARGE_SKID[0])) g.sfx('slam', 0.4);
        return;
      }
      case 'wsboss:gore': {
        if (!at(GORE.hit)) return;
        g.emit({ t: 'shake', amount: 4 });
        g.sfx('slam', 0.6);
        if (h.move) return;
        const r = rel(m.x, m.y, fx, fy, h.x, h.y);
        const d = Math.hypot(r.fwd, r.left);
        if (d <= WS_TUNE.gore.reach && (d < 1.2 || Math.abs(Math.atan2(r.left, r.fwd)) <= WS_TUNE.gore.half)) {
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, WS_TUNE.gore.throw);
        }
        return;
      }
      case 'wsboss:stomp': {
        if (!at(STOMP.hit)) return;
        g.sfx('slam', 1);
        g.emit({ t: 'shake', amount: 8 });
        const f = { x: m.x + fx * WS_TUNE.stomp.foot, y: m.y + fy * WS_TUNE.stomp.foot };
        R.peril(m, 'act1', f.x, f.y, { a1: 'wsboss:rings', fx, fy, dur: STOMP.rings[2] + STOMP.ringLong + 0.1, hit: 0, dmg: roll, el: 'phys' });
        return;
      }
      case 'wsboss:power': {
        // (the hammer's shadow chases him a beat behind, held still a moment before each blow; at each blow, it crushes down)
        const lock = SLAMS.some((s) => t1 > s - WS_TUNE.power.lock && t1 <= s + 0.25);
        if (!lock && t1 > POWER.cast) {
          const dt = t1 - t0;
          const hx = k.hx ?? h.x;
          const hy = k.hy ?? h.y;
          const f = Math.min(1, dt * WS_TUNE.power.lag);
          k.hx = hx + (h.x - hx) * f;
          k.hy = hy + (h.y - hy) * f;
        }
        for (const s of SLAMS) {
          if (!at(s)) continue;
          g.sfx('slam', 0.9);
          g.emit({ t: 'shake', amount: 6 });
          const c = hammerAt(m);
          R.peril(m, 'act1', c.x, c.y, { a1: 'wsboss:crater', dur: 1.6, hit: 0 });
          if (!h.move && Math.hypot(h.x - c.x, h.y - c.y) <= WS_TUNE.power.reach) {
            g.hurtHero(roll * a.dmg, EL.power, m.words, m, m.name, c.x, c.y);
            g.knockHero(c.x, c.y, 1);
          }
        }
        return;
      }
      case 'wsboss:flame': {
        if (!at(FIRE.burst)) return;
        g.sfx('fire', 0.9);
        // (the sky opens: each meteor onto its own mark, at random over the arena, none on him, the art's times)
        for (const d of FIRE_DROPS) {
          let p: { x: number; y: number } | null = null;
          for (let tries = 0; tries < 12 && !p; tries++) {
            const ang = g.rng.range(0, Math.PI * 2);
            const r = Math.sqrt(g.rng.range(0, 1)) * (FINAL_PLACE.floor - 0.6);
            const x = FINAL_PLACE.cx + Math.cos(ang) * r;
            const y = FINAL_PLACE.cy + Math.sin(ang) * r;
            if (Math.hypot(x - m.x, y - m.y) >= WS_TUNE.flame.keep) p = { x, y };
          }
          if (!p) continue;
          R.peril(m, 'act1', p.x, p.y, { a1: 'wsboss:meteor', t: -(d.t - FIRE.burst), dur: WS_TUNE.flame.burn.long, hit: 0, dmg: roll, el: EL.flame, a: g.rng.int(0, 3) });
        }
        return;
      }
      case 'wsboss:frost': {
        if (!at(FROST.hit)) return;
        g.sfx('frost', 0.9);
        g.emit({ t: 'shake', amount: 4 });
        const s = { x: m.x + fx * ICE_FROM, y: m.y + fy * ICE_FROM };
        R.peril(m, 'act1', s.x, s.y, { a1: 'wsboss:ice', fx, fy, t: FROST.hit, dur: FROST.hit + WS_TUNE.frost.rime.long, hit: 0, dmg: roll, el: EL.frost });
        return;
      }
      case 'wsboss:lightning': {
        if (!at(BOLT.crack)) return;
        g.sfx('zap', 0.9);
        g.emit({ t: 'shake', amount: 3 });
        // (it cracks open over the room, between him and the hero, and lets out the orb)
        const x = (m.x + h.x) / 2;
        const y = (m.y + h.y) / 2;
        R.peril(m, 'act1', x, y, { a1: 'wsboss:orb', dur: WS_TUNE.bolt.life + 0.5, hit: 0, dmg: roll, el: EL.lightning, a: WS_TUNE.bolt.zap.from });
        return;
      }
      case 'wsboss:poison': {
        if (!at(SPORE.burst)) return;
        g.sfx('poison', 0.8);
        // (the rune bursts over him: its spores flung out round him, each sinking where it lands: a trap)
        const cx = k.cx ?? h.x;
        const cy = k.cy ?? h.y;
        for (const pod of SPORE_PODS) {
          const x = cx + pod.at[0] / T;
          const y = cy + pod.at[1] / T;
          if (!onArena(x, y, 0.4)) continue;
          R.peril(m, 'act1', x, y, { a1: 'wsboss:trap', t: -(pod.land - SPORE.burst), dur: WS_TUNE.spore.lie, hit: 0, dmg: roll, el: EL.poison, b: cx, c: cy });
        }
        return;
      }
    }
  },
  peril(R, p: Peril, dt) {
    const g = R.g;
    const h = g.hero;
    if (g.over) return;
    const hurt = (mult: number, ox = p.x, oy = p.y): void => g.hurtHero(p.dmg * mult, p.el, p.words, null, p.from, ox, oy, p.half);
    switch (p.a1) {
      case 'wsboss:rings': {
        // (each of the three rings strikes him once as it rolls under him)
        for (let j = 0; j < 3; j++) {
          const bit = 1 << j;
          if ((p.done & bit) !== 0 || h.move) continue;
          const r = ringAt(j, p.t);
          if (r < 0) continue;
          if (Math.abs(Math.hypot(h.x - p.x, h.y - p.y) - r) <= WS_TUNE.stomp.band) {
            p.done |= bit;
            hurt(WS_TUNE.stomp.dmg[j]);
            if (j === 0) g.knockHero(p.x, p.y, 0.8);
          }
        }
        return;
      }
      case 'wsboss:meteor': {
        // (it strikes as it lands: within its reach, hurt; then the floor burns where it fell)
        const t0 = p.t - dt;
        if (t0 < 0 && p.t >= 0) {
          g.emit({ t: 'shake', amount: 2 });
          if (!h.move && Math.hypot(h.x - p.x, h.y - p.y) <= WS_TUNE.flame.reach) hurt(WS_TUNE.flame.dmg);
        }
        if (p.t < 0.3 || p.t > p.dur - 0.6) return;
        const B = WS_TUNE.flame.burn;
        if (Math.hypot(h.x - p.x, h.y - p.y) <= B.r) {
          p.d -= dt;
          if (p.d <= 0) {
            p.d = B.every;
            hurt(B.dmg);
          }
        }
        return;
      }
      case 'wsboss:ice': {
        // (each cluster of spikes strikes him as it bursts up under him; behind them the floor frozen, chilling him)
        for (let i = 0; i < ICE_STEPS.length; i++) {
          const s = ICE_STEPS[i];
          const u = p.t - s.t;
          if (u < 0 || u > 0.12) continue;
          if (p.done || h.move) continue;
          const w = artAt(p.x, p.y, p.fx, p.fy, s.a, s.b);
          if (Math.hypot(h.x - w.x, h.y - w.y) <= WS_TUNE.frost.reach + 0.25) {
            p.done = 1;
            hurt(WS_TUNE.frost.dmg, w.x, w.y);
          }
        }
        if (p.t > p.dur - 0.5) return;
        const r = rel(p.x, p.y, p.fx, p.fy, h.x, h.y);
        const ang = Math.abs(Math.atan2(r.left, r.fwd));
        const reach = (0.6 + (FROST.steps - 1) * FROST.step) + 0.4;
        if (r.fwd > 0.2 && r.fwd < reach && ang <= (FROST.fan / 2 + 6) * (Math.PI / 180)) {
          // (on the frozen floor his feet go from under him: chilled while he stands on it)
          const reached = (0.6 + Math.max(0, (p.t - FROST.hit - 0.04) / FROST.race) * FROST.step);
          if (Math.hypot(r.fwd, r.left) <= reached) {
            h.chill = Math.max(h.chillT > 0 ? h.chill : 0, WS_TUNE.frost.rime.chill);
            h.chillT = Math.max(h.chillT, WS_TUNE.frost.rime.every * 2);
          }
        }
        return;
      }
      case 'wsboss:orb': {
        // (it drifts after him, slow; zaps him wherever he is, every so often; swells at the last and bursts)
        const B = WS_TUNE.bolt;
        const u = p.t;
        if (u < B.life) {
          const dx = h.x - p.x;
          const dy = h.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.4 && orbSwell(u) <= 0) {
            const step = Math.min(d - 0.4, B.pace * dt);
            p.x += (dx / d) * step;
            p.y += (dy / d) * step;
          }
          p.a -= dt;
          if (p.a <= 0 && orbSwell(u) <= 0) {
            p.a = B.zap.every;
            // (a zap: from the orb down to him if he is within its reach, else to the floor beside it; the last zap's end kept to draw)
            if (d <= B.zap.reach && !h.move) {
              p.b = h.x;
              p.c = h.y;
              hurt(B.zap.dmg, p.x, p.y);
            } else {
              const ang = g.rng.range(0, Math.PI * 2);
              p.b = p.x + Math.cos(ang) * 1.5;
              p.c = p.y + Math.sin(ang) * 1.5;
            }
            p.d = u;
            g.sfx('zap', 0.35);
          }
          return;
        }
        if (!p.done) {
          p.done = 1;
          g.sfx('zap', 1);
          g.emit({ t: 'shake', amount: 6 });
          if (!h.move && Math.hypot(h.x - p.x, h.y - p.y) <= B.burst.reach) {
            hurt(B.burst.dmg);
            g.knockHero(p.x, p.y, 1);
          }
        }
        return;
      }
      case 'wsboss:trap': {
        // (set once its spore has sunk in and the rune has burned in; come near, it snaps; its cloud hangs, biting him in it)
        const S = WS_TUNE.spore;
        if (p.t < SPORE.sprout) return;
        if (!p.a) {
          if (p.t > p.dur - 1) return;
          if (Math.hypot(h.x - p.x, h.y - p.y) <= S.near) {
            p.a = p.t;
            g.sfx('poison', 0.6);
            // (gone off: it lies no longer than its cloud)
            p.dur = Math.min(p.dur, p.t + S.swell + S.long + 0.1);
          }
          return;
        }
        const u = p.t - p.a - S.swell;
        if (u < 0 || u > S.long) return;
        if (Math.hypot(h.x - p.x, h.y - p.y) <= S.cloud.r) {
          p.d -= dt;
          if (p.d <= 0) {
            p.d = S.cloud.every;
            hurt(S.cloud.dmg);
          }
        }
        return;
      }
    }
  },
  died(R) {
    // (his words' perils harm nothing more once he is dead: they are left to fade)
    for (const p of R.g.perils) if (p.a1?.startsWith('wsboss:')) p.dur = Math.min(p.dur, p.t + 0.4);
  },
};
