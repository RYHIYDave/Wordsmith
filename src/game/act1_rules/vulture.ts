// ACT 1: THE VULTURES (FLOOR 7): its rules (game/act1_rules/types.ts).
//
// His doc's table: "Vultures (small)": "They circle overhead, then dive." His brief to the art chat (14 Oct): "Circling,
// then a sudden dive (Recommended)"; the cult chains some on its perch. The art chat's pictures, each with his yes as
// shown (art/ledge_vultures.ts): its stand (hunched on its perch), its walk (circling flight, its feet off the floor all
// the round, one wing beat a second), its dive (its one attack: the warning held at the top, the stoop, the strike held a
// tenth, the pull-out), its flinch (struck in the air) and its death (knocked from the air onto its back).
//
// WHAT IT DOES, by those (the main chat's):
// - It sits on its perch (its stand) until it wakes; then it takes off and goes up over the hero.
// - IT CIRCLES OVERHEAD: `VULTURE.high` game pixels up, round the hero `VULTURE.ring` tiles out, out over the drop as
//   much as over the road (it flies by the open grid: floor or pit), its walk's wing beat at the beat it is painted
//   for. Its shadow goes over the floor under it. UP THERE IT IS STRUCK AS ANYWHERE (since Version 23.5; his words to
//   the main chat, 20 Oct 2026, 21:31 Pacific: “Oh the vultures being unhittable in the air has to go.  It’s infuriating
//   to fight them”): up in the air it is only `aloft`, over what is on the ground, neither jostling nor jostled by it.
//   Killed up there, it falls from its `height` as its death plays (render.ts fallenLift); over the drop, it falls away
//   into it, and what it leaves lands on the nearest floor (game.ts kill).
// - THEN IT DIVES: its dive is the art's, played from start to end; the line it will stoop along is laid on the floor
//   from its warning (render/act1_fx/vulture.ts); it comes down out of the air onto where the hero stood as it began,
//   its talons striking at the art's moment, `reach` before it; it pulls out low past where it struck and climbs back.
// - One called into a fight (the Carrion Queen's flock: spawned awake beside the hero) comes down out of the sky to
//   its height and dives at once.

import type { ActDef, BossRules } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number): number => {
  const k = clamp01(v);
  return k * k * (3 - 2 * k);
};
/** Slow at both ends, as the art's own curves are ('io', art/ledge_vultures.ts stretch). */
const io = (v: number): number => (1 - Math.cos(Math.PI * clamp01(v))) / 2;

/** THE VULTURE'S NUMBERS: the art's (art/ledge_vultures.ts, held to it by tests/act1_vulture.test.ts) and the rules'. */
export const VULTURE = {
  /** How high it circles (game pixels over the floor, its picture lifted by so much), and how far round the hero (tiles). */
  high: 26,
  ring: 2.4,
  /** How far ahead round its ring it makes for (radians): it keeps to its ring as it goes. Further off than `chase` beyond its ring, it flies straight at him. */
  lead: 0.35,
  chase: 2.5,
  /** Taking off from its perch, it climbs to its height in `takeOff` seconds; one called in comes down from `fall` game pixels higher in `arrive`; after a dive it climbs back in `climb`. */
  takeOff: 0.8,
  fall: 70,
  arrive: 0.9,
  climb: 1.0,
  /** How long it circles between dives (seconds, a range); one called in, before its first. */
  circle: [1.8, 3.4] as const,
  called: [0.3, 0.8] as const,
  /** Called in: put into the world awake within this many tiles of the hero. */
  callNear: 6,
  /** Higher than this (game pixels) it is `aloft`: over what is on the ground, not among it (until Version 23.5, it could be struck only so low). */
  low: 9,
  /** The dive (the art's VULTURE_DIVE: 1.2 s, its warning from 0.25 s, the strike at 0.7 s held a tenth). */
  dive: {
    /** How long, and the strike's moment (held a tenth after it). Its warning, held at the top, begins at `warn` (its cry). */
    long: 1.2,
    hit: 0.7,
    warn: 0.25,
    /** It stoops from `stoop` to the strike: out of the air and down the line onto where the hero stood. */
    stoop: 0.5,
    /** Its talons at the strike: `reach` tiles before its floor point (measured off the picture); they harm within `r` of there. */
    reach: 0.77,
    r: 0.55,
    /** Its body comes back to its floor point by `back` tiles from `from` to `to` (the picture's pull-out): the rules carry it on by as much, so it flies on past. */
    from: 1.0,
    to: 1.2,
    back: 28 / 39.19,
    /** As it comes out of the dive it is this high (game pixels), climbing from there. */
    out: 3,
    /** From how near to how far it dives (tiles from the hero). */
    near: 1.0,
    far: 4.2,
  },
};

const ACTS: readonly ActDef[] = [
  // its one attack (small: one, by his rule): the dive
  { id: 'vulture:dive', clip: 'attack', long: VULTURE.dive.long, hit: VULTURE.dive.hit, dmg: 1, cooldown: 0, first: 0, after: 0.3, near: VULTURE.dive.near, far: VULTURE.dive.far },
];

/** What it keeps (Monster.a1): `lift` how high it is now (game pixels); a climb from `from` over `dur` seconds, `k` of the way; `next` seconds of circling before its next dive; `spin` its way round (1 or -1); `born`, the moment it came into the world, and `near` 1 if beside the hero then; `sx`, `sy` where its dive began. */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { lift: 0, k: 1, from: 0, dur: 1, next: 0, spin: 0, born: -1, near: 0, sx: 0, sy: 0 });
}

/** How far up it is now (game pixels): 0 on its perch. */
export function liftOf(m: Monster): number {
  return m.a1 ? m.a1.lift : 0;
}

/** Is it up in the air, over what is on the ground (not jostling it, nor jostled)? It is struck all the same (Version 23.5). */
function aloft(m: Monster): boolean {
  return liftOf(m) > VULTURE.low;
}

/** It begins to climb to its height from where it is. */
function climbFrom(a: Record<string, number>, from: number, dur: number): void {
  a.from = from;
  a.lift = from;
  a.k = 0;
  a.dur = dur;
}

/** Does another of its flock dive now? (They take turns.) */
function flockDiving(R: BossRules, m: Monster): boolean {
  return R.g.monsters.some((o) => o !== m && !o.dead && o.kind === 'vulture' && o.packId === m.packId && o.state === 'act');
}

export const RULES: Act1Rules | null = {
  // (its walk is painted for 1.2 tiles a second, VULTURE_PACE: but it is a flier, its feet never on the floor, so the
  // rules fly it at its own speed, MONSTERS.vulture, and run its wing beat by the clock)
  gait: { pace: 1.2, cycle: 1.0, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: VULTURE.ring, slack: 0.6, trueBack: true },
  acts: ACTS,
  aloft,
  height: liftOf,

  spawned(R, m) {
    const a = keep(m);
    a.born = R.g.time;
    // (one put into the world beside the hero, as the Queen's call brings her flock, is called in; the floor's own
    // packs are laid well away from where the hero comes in, and sit on their perches until he comes)
    a.near = Math.hypot(m.x - R.g.hero.x, m.y - R.g.hero.y) < VULTURE.callNear ? 1 : 0;
  },

  tick(R, m, dt, dist) {
    const g = R.g;
    const h = g.hero;
    const a = keep(m);
    // (its dive runs by the rules' clock: BossRules.stepAct, and `acting` below)
    if (m.state === 'act') return false;
    if (a.spin === 0) {
      // ITS FIRST STEP AWAKE: off its perch, or (just come into the world, awake: called in) down out of the sky
      a.spin = g.rng.chance(0.5) ? 1 : -1;
      const called = a.near === 1 && g.time - a.born < 0.3;
      if (called) climbFrom(a, VULTURE.high + VULTURE.fall, VULTURE.arrive);
      else climbFrom(a, 0, VULTURE.takeOff);
      a.next = called ? g.rng.range(VULTURE.called[0], VULTURE.called[1]) + VULTURE.arrive : g.rng.range(VULTURE.circle[0], VULTURE.circle[1]);
      m.gait = { mode: 'walk', t: 0 };
    }
    if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
    m.state = 'chase';
    m.anim = 'walk';
    // ITS HEIGHT: climbing (from its perch, out of a dive) or coming down to it (called in)
    if (a.k < 1) {
      a.k = Math.min(1, a.k + dt / a.dur);
      a.lift = a.from + (VULTURE.high - a.from) * smooth(a.k);
    } else a.lift = VULTURE.high;
    // ITS WING BEAT, one a second, as painted; struck, its flinch plays from the walk's first pose and hands back to it
    if (m.struckT !== undefined && m.struckT < 0.4) m.gait.t = 0;
    else m.gait.t += dt;
    // ROUND THE HERO: the point a little further round its ring, or straight at him from far off
    const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
    const ox = m.x - h.x;
    const oy = m.y - h.y;
    let vx: number;
    let vy: number;
    if (dist > VULTURE.ring + VULTURE.chase) {
      vx = -ox / (dist || 1);
      vy = -oy / (dist || 1);
    } else {
      const ang = Math.atan2(oy, ox) + a.spin * VULTURE.lead;
      const px = h.x + Math.cos(ang) * VULTURE.ring - m.x;
      const py = h.y + Math.sin(ang) * VULTURE.ring - m.y;
      const d = Math.hypot(px, py) || 1;
      vx = px / d;
      vy = py / d;
    }
    const bx = m.x;
    const by = m.y;
    g.slide(m, Math.min(m.r, 0.3), vx * sp * dt, vy * sp * dt, g.level.open, true);
    // (it faces the way it goes; held against the rock, it turns its way round the other way)
    const mx = m.x - bx;
    const my = m.y - by;
    const md = Math.hypot(mx, my);
    if (md > 1e-4) {
      m.fx = mx / md;
      m.fy = my / md;
    } else if (dist <= VULTURE.ring + VULTURE.chase) a.spin = -a.spin;
    // ITS DIVE, when it has circled long enough, is up at its height, and he is in its sight; its flock take turns
    a.next -= dt;
    if (a.next <= 0 && a.k >= 1 && !g.over) {
      const d = ACTS[0];
      const ok = dist >= d.near && dist <= d.far && g.sees(m.x, m.y, h.x, h.y) && !flockDiving(R, m);
      // (where its floor point will be at the strike must be floor to come down on: the road, not the drop)
      const ux = (h.x - m.x) / (dist || 1);
      const uy = (h.y - m.y) / (dist || 1);
      if (ok && g.free(g.level.walk, h.x - ux * VULTURE.dive.reach, h.y - uy * VULTURE.dive.reach, 0.3)) {
        R.startAct(m, ACTS, 0);
        return true;
      }
      a.next = 0.25;
    }
    return true;
  },

  start(_R, m) {
    const a = keep(m);
    a.sx = m.x;
    a.sy = m.y;
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const k1 = keep(m);
    const act = m.act!;
    const D = VULTURE.dive;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    // the line it stoops along: from where it began to where the hero stood as it began
    const lx = act.x - k1.sx;
    const ly = act.y - k1.sy;
    const ll = Math.hypot(lx, ly) || 1;
    const ux = lx / ll;
    const uy = ly / ll;
    if (at(D.warn)) g.sfx('gust', 0.35);
    if (at(D.stoop)) g.sfx('swing', 0.6);
    if (t1 <= D.stoop) {
      k1.lift = VULTURE.high;
    } else if (t0 < a.hit) {
      // THE STOOP: down the line onto where he stood, faster and faster, out of the air to the floor
      const k = clamp01((t1 - D.stoop) / (a.hit - D.stoop));
      const e = k * k;
      const ex = act.x - ux * D.reach;
      const ey = act.y - uy * D.reach;
      m.x = k1.sx + (ex - k1.sx) * e;
      m.y = k1.sy + (ey - k1.sy) * e;
      k1.lift = VULTURE.high * (1 - e);
    }
    if (at(a.hit)) {
      // THE STRIKE: its talons, `reach` before it
      const tx = m.x + m.fx * D.reach;
      const ty = m.y + m.fy * D.reach;
      if (Math.hypot(h.x - tx, h.y - ty) <= D.r) {
        R.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 2 });
      }
      g.sfx('hit', 0.4);
    }
    if (t1 > a.hit) {
      // THE PULL-OUT, low: its body comes back to its floor point in the picture, and the rules carry it on as much
      const b = (t: number): number => D.back * io((t - D.from) / (D.to - D.from));
      const step = b(t1) - b(t0);
      if (step > 0 && g.isOpen(m.x + ux * step, m.y + uy * step)) {
        m.x += ux * step;
        m.y += uy * step;
      }
      k1.lift = D.out * smooth((t1 - (a.hit + 0.1)) / (a.long - a.hit - 0.1));
    }
  },

  end(R, m) {
    const a = keep(m);
    // (out of its dive: climbing back, circling on from its walk's first pose, where its dive ends)
    climbFrom(a, a.lift, VULTURE.climb);
    a.next = R.g.rng.range(VULTURE.circle[0], VULTURE.circle[1]);
    m.gait = { mode: 'walk', t: 0 };
    m.anim = 'walk';
  },
};
