// FLOOR 3'S SIDE BOSS, THE STOKER: his rules (game/act1_rules/types.ts). The furnace's keeper, in his arena off floor 3 while the
// furnace burns (the quest line, game/quests15.ts). His pictures and numbers are the art chat's (art/stoker.ts, stoker_moves.ts,
// stoker_fx.ts; docs/mockups/stoker/README.md, “How the main chat brings it in”); his yes to hand them over, 6 Nov 2026, 16:28:
// “Yes, hand it over (Recommended)”. His word on the room, 16:29: “The stoker and his area is done.  I’d like a little hallway
// leading to his arena tho.  Not a door into it like a stronghold.” (game/furnace_arena.ts).
//
// WHAT HE DOES (every number the art's, each one number to change):
// - HE WALKS at ST_PACE, 1.4 tiles a second, the floor shaking at each footfall (ST_SHAKE), and comes no nearer than `gait.stopAt`.
// - THE SHOVEL OF COALS (ST_COALS, 3.1 s): at a hero up to COALS.reach tiles off. From ST_COALS.mark where the hero stands is taken
//   and kept; at the hit seven coals fly, each coming down on its own spot round it (COAL_SPOTS) COAL_FIRE.r round: a hero within it
//   as it lands is struck; it burns COAL_FIRE.burns s, and whoever stands in it is burnt, tick by tick.
// - THE FIRE RAKE (ST_RAKE, 3.0 s): from the hit the blade is dragged round across RAKE_ARC; a hero in the band RAKE_FIRE.r0 to r1
//   before him as the blade passes his way is struck; the band behind the blade burns RAKE_FIRE.burns s, burning whoever stands in it.
// - THE FURNACE BURSTS (ST_BURST, 3.4 s), his finisher, once he is below a third of his life (the art chat's suggestion): from the hit
//   a ring rolls out from him (ringAt); a hero within its depth as it passes, and not in one of its three gaps (inGap), is struck once.
// - EACH IS DRAWN IN THE FRAME HIS PICTURE HAS: the game shows him from in front or behind, turned over or not (four ways, each with
//   his forward along one of the floor's axes: `frameOf`), and his fire is painted in that frame. So as each act begins he is
//   turned square to the nearest of those four ways toward the hero, and every hit is reckoned in it, where its picture lands.
// - HIS DEATH, THE FURNACE EXPLODES (ST_DIES, 4.2 s): the blast on the floor under him (harmless); THE GEAR lying at GEAR_REST, to be
//   picked up once it lies still (game.ts furnaceGearTaken).
// Drawn: render/act1_fx/stoker.ts.

import { TILE3 } from '../../art/new_mobs3';
import { COALS, COAL_FIRE, COAL_SPOTS, RAKE_FIRE, RING, coalLands, inGap, rakePasses, rakeWay, ringAt } from '../../art/stoker_fx';
import { GEAR_REST, RAKE_ARC, ST_BURST, ST_COALS, ST_DIES, ST_PACE, ST_RAKE, ST_SHAKE, ST_WALK } from '../../art/stoker_moves';
import { TUNE as GAME_TUNE } from '../defs';
import type { ActDef } from '../bosses';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

export const COALS_PERIL = 'stoker:coals';
export const RAKE_PERIL = 'stoker:rake';
export const RING_PERIL = 'stoker:ring';
export const BLAST_PERIL = 'stoker:blast';
export const GEAR_PERIL = 'stoker:gear';

/**
 * His numbers that are the rules' own: how hard each blow is (times his own blow), the burning's tick and how hard it burns; when
 * the burst comes (below `burstBelow` of his life); how near he comes; how near the gear must be to be picked up (tiles).
 */
export const STOKER_TUNE = {
  coal: 1.0,
  rake: 1.2,
  ring: 1.6,
  burn: 0.3,
  tick: 0.5,
  burstBelow: 1 / 3,
  stopAt: 2.6,
  take: 0.9,
} as const;

const ACTS: readonly ActDef[] = [
  { id: 'stoker:coals', clip: 'attack', long: ST_COALS.long, hit: ST_COALS.hit, dmg: STOKER_TUNE.coal, cooldown: 0, first: 0.8, after: 0.9, near: 2.2, far: COALS.reach },
  { id: 'stoker:rake', clip: 'rake', long: ST_RAKE.long, hit: ST_RAKE.hit, dmg: STOKER_TUNE.rake, cooldown: 4.5, first: 1.5, after: 0.9, near: 0, far: RAKE_FIRE.r1 },
  { id: 'stoker:burst', clip: 'burst', long: ST_BURST.long, hit: ST_BURST.hit, dmg: STOKER_TUNE.ring, cooldown: 10, first: 0, after: 1.2, near: 0, far: RING.r1 },
];

/** One of the four ways the game shows him: from in front or behind, turned over or not, and his forward and his left on the floor. */
export interface StokerFrame {
  view: 'front' | 'back';
  flip: boolean;
  f: readonly [number, number];
  l: readonly [number, number];
}
/** The four, by index (as kept on his perils): in front, in front turned over, behind, behind turned over. */
export const FRAMES: readonly StokerFrame[] = [
  { view: 'front', flip: false, f: [1, 0], l: [0, -1] },
  { view: 'front', flip: true, f: [0, 1], l: [-1, 0] },
  { view: 'back', flip: false, f: [0, -1], l: [-1, 0] },
  { view: 'back', flip: true, f: [-1, 0], l: [0, -1] },
];
/** The frame he is shown in, facing (fx, fy) (as render/fx.ts shows the fallen: from behind if fx + fy < -0.2; turned over if fx - fy < 0). */
export function frameOf(fx: number, fy: number): number {
  const back = fx + fy < -0.2;
  const flip = fx - fy < 0;
  return back ? (flip ? 3 : 2) : flip ? 1 : 0;
}
/** The one of the four nearest the way (dx, dy). */
export function nearestFrame(dx: number, dy: number): number {
  let best = 0;
  let bd = -Infinity;
  for (let k = 0; k < FRAMES.length; k++) {
    const d = dx * FRAMES[k].f[0] + dy * FRAMES[k].f[1];
    if (d > bd) {
      bd = d;
      best = k;
    }
  }
  return best;
}
/** A spot of the floor in a frame (tiles along his forward, and to his left) from (x, y). */
export function spotOf(F: StokerFrame, x: number, y: number, fwd: number, left: number): [number, number] {
  return [x + F.f[0] * fwd + F.l[0] * left, y + F.f[1] * fwd + F.l[1] * left];
}
/** Where (x, y) is in a frame from (ox, oy): tiles along his forward, to his left; how far; and the way (degrees off his forward, to his left). */
export function inFrame(F: StokerFrame, ox: number, oy: number, x: number, y: number): { fwd: number; left: number; d: number; deg: number } {
  const dx = x - ox;
  const dy = y - oy;
  const fwd = dx * F.f[0] + dy * F.f[1];
  const left = dx * F.l[0] + dy * F.l[1];
  return { fwd, left, d: Math.hypot(fwd, left), deg: (Math.atan2(left, fwd) * 180) / Math.PI };
}

/** The coals still burning `t` seconds into his throw: those landed and not yet died down. */
const coalBurning = (i: number, t: number): boolean => {
  const age = t - (ST_COALS.hit + coalLands(i));
  return age >= 0 && age < COAL_FIRE.burns - COAL_FIRE.dies * 0.5;
};
/** How long a peril of his lasts, the clock its act's (its fire painted on: render/act1_fx/stoker.ts). */
export const LASTS = {
  coals: ST_COALS.hit + coalLands(COALS.n - 1) + COAL_FIRE.burns + 1.3,
  rake: ST_RAKE.hit + (ST_RAKE.drag[1] - ST_RAKE.drag[0]) + RAKE_FIRE.burns + 0.2,
  ring: ST_BURST.hit + (RING.r1 + RING.deep - RING.r0) / RING.pace + RING.scorch + 0.2,
  blast: ST_DIES.long + 1.5,
} as const;
/** The gear, `GEAR_REST` (his lengths: forward, to his left), in tiles. */
export const GEAR_AT: readonly [number, number] = [GEAR_REST[0] / TILE3, GEAR_REST[1] / TILE3];

const r0 = GAME_TUNE.heroRadius * 0.5;
/** The peril of the act he is making now, and whose each is (stopped before it lands, it is gone with him). */
const actPeril = new WeakMap<Monster, Peril>();
const perilOf = new WeakMap<Peril, Monster>();
const ACT_OF: Record<string, string> = { [COALS_PERIL]: 'stoker:coals', [RAKE_PERIL]: 'stoker:rake', [RING_PERIL]: 'stoker:burst' };

export const RULES: Act1Rules | null = {
  gait: { pace: ST_PACE, cycle: ST_WALK.frames / ST_WALK.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: STOKER_TUNE.stopAt, slack: 0.8, trueBack: true },
  acts: ACTS,
  can(R, m, a) {
    if (a.id === 'stoker:burst') return m.life < m.maxLife * STOKER_TUNE.burstBelow;
    return true;
  },
  start(R, m, a) {
    // (turned square to the nearest of his four ways toward the hero: his fire is painted in it)
    const h = R.g.hero;
    const k = nearestFrame(h.x - m.x, h.y - m.y);
    m.fx = FRAMES[k].f[0];
    m.fy = FRAMES[k].f[1];
    const which = a.id === 'stoker:coals' ? COALS_PERIL : a.id === 'stoker:rake' ? RAKE_PERIL : RING_PERIL;
    const dur = a.id === 'stoker:coals' ? LASTS.coals : a.id === 'stoker:rake' ? LASTS.rake : LASTS.ring;
    // (its clock his act's; `a` his frame; `b`, `c` where the coals are aimed; `d` the coals landed, one bit each; `done` the burning's ticks)
    const aim = inFrame(FRAMES[k], m.x, m.y, h.x, h.y);
    const p = R.peril(m, 'act1', m.x, m.y, { a1: which, fx: m.fx, fy: m.fy, t: 0, dur, dmg: R.g.rollMonsterDmg(m), a: k, b: aim.fwd, c: aim.left, d: 0, el: 'fire', hit: a.hit });
    actPeril.set(m, p);
    perilOf.set(p, m);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'stoker:coals') {
      if (at(0.1)) g.sfx('fire', 0.35);
      // (where the hero stands at the mark is kept)
      const q = actPeril.get(m);
      if (at(ST_COALS.mark) && q && q.a1 === COALS_PERIL) {
        const h = g.hero;
        const r = inFrame(FRAMES[q.a], q.x, q.y, h.x, h.y);
        // (thrown at a hero up to COALS.reach off: farther, at that much along the way to him)
        const k = r.d > COALS.reach ? COALS.reach / r.d : 1;
        q.b = r.fwd * k;
        q.c = r.left * k;
      }
      if (at(ST_COALS.hit)) {
        g.sfx('swing', 0.7);
        g.sfx('fire', 0.5);
      }
    } else if (a.id === 'stoker:rake') {
      if (at(ST_RAKE.hit)) {
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('hit', 0.6);
        g.sfx('fire', 0.6);
      }
    } else if (a.id === 'stoker:burst') {
      if (at(ST_BURST.open[0])) g.sfx('fire', 0.5);
      if (at(ST_BURST.hit)) {
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('explode', 0.8);
      }
    }
  },
  tick(R, m, dt) {
    // (the floor shaking at each footfall as he walks, two a round of his walk; felt near him)
    const g = R.g;
    const a = (m.a1 ??= {});
    const walking = m.state !== 'act' && m.gait?.mode === 'walk';
    if (!walking) {
      a.step = 0;
      return false;
    }
    a.step = (a.step ?? 0) + dt;
    const every = ST_WALK.frames / ST_WALK.fps / 2;
    if (a.step >= every) {
      a.step -= every;
      if (Math.hypot(g.hero.x - m.x, g.hero.y - m.y) < 12) g.emit({ t: 'shake', amount: ST_SHAKE.by });
    }
    return false;
  },
  died(R, m) {
    // (the blast on the floor under him, from his death's start; the gear where it comes to lie)
    const k = frameOf(m.fx, m.fy);
    R.peril(m, 'act1', m.x, m.y, { a1: BLAST_PERIL, t: 0, dur: LASTS.blast, a: k, dmg: 0 });
    const [gx, gy] = spotOf(FRAMES[k], m.x, m.y, GEAR_AT[0], GEAR_AT[1]);
    const g = R.g;
    // (on the floor, or as near it as can be had)
    const s = g.level.walk;
    const W = g.level.floor.w;
    let x = gx;
    let y = gy;
    if (s[Math.floor(y) * W + Math.floor(x)] !== 1) {
      x = m.x;
      y = m.y;
    }
    R.peril(m, 'act1', x, y, { a1: GEAR_PERIL, t: 0, dur: 1e9, a: k, dmg: 0 });
  },
  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    void dt;
    if (p.a1 === GEAR_PERIL) {
      // (picked up once it lies still, by walking onto it)
      if (p.t >= ST_DIES.gearStill && !g.over && Math.hypot(h.x - p.x, h.y - p.y) <= STOKER_TUNE.take) {
        p.dur = p.t;
        g.furnaceGearTaken(p.x, p.y);
      }
      return;
    }
    if (p.a1 !== COALS_PERIL && p.a1 !== RAKE_PERIL && p.a1 !== RING_PERIL) return;
    const F = FRAMES[p.a];
    // (stopped before it lands, it is gone with him: killed, struck out of it)
    if (p.t < p.hit) {
      const m = perilOf.get(p);
      if (!m || m.dead || m.state !== 'act' || m.act?.id !== ACT_OF[p.a1]) p.dur = p.t;
      return;
    }
    if (g.over) return;
    const free = !h.move && h.invuln <= 0;
    const r = inFrame(F, p.x, p.y, h.x, h.y);
    if (p.a1 === COALS_PERIL) {
      let struck = false;
      for (let i = 0; i < COALS.n; i++) {
        const bit = 1 << i;
        const lands = ST_COALS.hit + coalLands(i);
        if (p.d & bit || p.t < lands) continue;
        p.d |= bit;
        const [cx, cy] = spotOf(F, p.x, p.y, p.b + COAL_SPOT(i)[0], p.c + COAL_SPOT(i)[1]);
        if (!struck && free && Math.hypot(h.x - cx, h.y - cy) <= COAL_FIRE.r + r0) {
          struck = true;
          g.hurtHero(p.dmg * STOKER_TUNE.coal, 'fire', p.words, null, p.from, cx, cy, p.half);
        }
        if (i === 0) g.emit({ t: 'shake', amount: 1 });
      }
      if (p.d === 0) return;
      // (the fires burning: whoever stands in one is burnt, tick by tick)
      const first = ST_COALS.hit + coalLands(0);
      const tick = Math.floor((p.t - first) / STOKER_TUNE.tick);
      if (tick < 1 || tick <= p.done) return;
      p.done = tick;
      for (let i = 0; i < COALS.n; i++) {
        if (!coalBurning(i, p.t)) continue;
        const [cx, cy] = spotOf(F, p.x, p.y, p.b + COAL_SPOT(i)[0], p.c + COAL_SPOT(i)[1]);
        if (Math.hypot(h.x - cx, h.y - cy) <= COAL_FIRE.r + r0) {
          g.hurtHero(p.dmg * STOKER_TUNE.burn, 'fire', p.words, null, p.from, cx, cy, p.half);
          break;
        }
      }
      return;
    }
    if (p.a1 === RAKE_PERIL) {
      const since = p.t - p.hit;
      const inBand = r.d >= RAKE_FIRE.r0 - r0 && r.d <= RAKE_FIRE.r1 + r0;
      const way = Math.max(RAKE_ARC[0], Math.min(RAKE_ARC[1], r.deg));
      const passes = rakePasses(way);
      const inArc = r.deg >= RAKE_ARC[0] - 6 && r.deg <= RAKE_ARC[1] + 6;
      // (the blade passing his way: struck once)
      if (!(p.d & 1) && inBand && inArc && free && passes !== null && since >= 0 && Math.abs(rakeWay(since) - way) < 10) {
        p.d |= 1;
        g.hurtHero(p.dmg * STOKER_TUNE.rake, 'fire', p.words, null, p.from, h.x, h.y, p.half);
      }
      // (the sheet of fire behind it: burning whoever stands in it)
      const tick = Math.floor(since / STOKER_TUNE.tick);
      if (tick < 1 || tick <= p.done) return;
      p.done = tick;
      if (!inBand || !inArc || passes === null) return;
      const age = since - passes;
      if (age >= 0 && age < RAKE_FIRE.burns - RAKE_FIRE.dies * 0.5) g.hurtHero(p.dmg * STOKER_TUNE.burn, 'fire', p.words, null, p.from, h.x, h.y, p.half);
      return;
    }
    // THE RING: struck once as it passes him, unless he is in a gap
    if (p.done) return;
    const front = ringAt(p.t - p.hit);
    if (front === null) return;
    if (Math.abs(r.d - front) <= RING.deep / 2 + r0 && !inGap(r.deg) && free) {
      p.done = 1;
      g.hurtHero(p.dmg * STOKER_TUNE.ring, 'fire', p.words, null, p.from, h.x, h.y, p.half);
    }
  },
};

/** Coal `i`'s spot about where it is aimed (tiles: along his forward, to his left). */
function COAL_SPOT(i: number): readonly [number, number] {
  return COAL_SPOTS[i];
}
