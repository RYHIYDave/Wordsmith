// FLOOR 9'S TWO SIDE BOSSES: their rules (game/act1_rules/types.ts). Each guards a piece of the ward-stone in a side area of the
// Pinewood (game/f9_lairs.ts; game.ts f9SideBosses), behind F9_LAIRS (off until his yes to them in play). His words, 13 Nov 2026: “I need
// two side bosses for level 9. There are three pieces that need to drop for the three obelisks in the swamp boss fight. The deer boss
// drops one, I was a spectral wolf boss, and I want a guardian boss, the troll guys from the prison”. Their moves as he picked them and
// saw them filmed (docs/mockups/f9_side_bosses/README.md); his word to build them in, 14 Nov 2026: “Yes, build them in (Recommended)”.
//
// THE TROLL CHIEFTAIN, in his camp (every number his pictures' own, art/f9_bosses_moves.ts and art/f9_bosses_fx.ts, each one number here):
// - THE CLUB SMASH (his blow): wound up over his head and held, and down on the ring marked where it lands: struck there, thrown back.
// - THE GROUND SLAM: up in the air and held, and down: a crack runs out along the lane marked before him, struck as it reaches you.
// - THE BULL ROAR, HIS WAR CRY: a rage (his pick: “I want the warcry to be a rage that gives him attack speed and move speed”): those
//   near him struck and thrown back by the roar; for RAGE.lasts seconds after, his moves quicker by RAGE.quick, his feet by RAGE.fast,
//   and he is ready again sooner; then three heavy strides at you.
// - THE BULL RUSH: the lane marked, pawing, and down it at a run: whoever he runs into struck and thrown.
// THE MIST WOLF, in its glade:
// - THE BITE (its blow): coiled and held, and at you: struck in the ring marked before it.
// - THE CLAW SWEEP: reared up and held, and down across the arc marked before it: struck, thrown.
// - THE HOWL: the wolves of the floor come out of the mist either side of it (as many as HOWL.most at once).
// - THE LUNGE: crouched and held, the lane marked, and through you as mist: struck as it passes; nothing reaches it while it is mist.
// - THE MIST CLOUD: blasted out round it; it is gone into it (nothing reaches it) while its claws come at whoever is in it, again and
//   again (CLOUD.hurts).
// EACH IS DRAWN IN THE FRAME ITS PICTURE HAS (as the Stoker's: game/act1_rules/stoker.ts FRAMES): as each act begins it is turned square
// to the nearest of the four ways toward the hero, and every blow is reckoned in that frame, where its picture lands. Each move keeps it
// over the floor point under it as its picture has it, and the ground it covers is covered here (`carry`). As a move comes, it SQUARES UP:
// goes to stand with the hero square before it along one of its four ways, as far off as its blows reach (`squareUp`). Heavy blows land with the
// game held still a moment and the screen kicked (his rulebook, Movement 7). Drawn: render/act1_fx/f9_bosses.ts.

import { CHIEF_MOVES, CHIEF_PLAY, LUNGE_LONG, TILE3, WOLF_MOVES, WOLF_PLAY, chiefCarry, wolfCarry } from '../../art/f9_bosses_moves';
import type { ChiefMove, WolfMove } from '../../art/f9_bosses_moves';
import { BITE_RING, CHIEF_LANDS, CLAW_SWEEP, CLOUD, F9_FX_AFTER, HOWL_FOGS, ROAR_RING, RUSH_LANE, SLAM_CRACK, SMASH_RING } from '../../art/f9_bosses_fx';
import { CK, WK } from '../../art/f9_bosses_sculpt';
import { MSG, TUNE as GAME_TUNE } from '../defs';
import type { ActDef, BossRules } from '../bosses';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';
import { FRAMES, inFrame, nearestFrame, spotOf } from './stoker';

/** Its perils: one for each move it makes, named by the move (what it does to the floor, drawn: render/act1_fx/f9_bosses.ts). */
export const CHIEF_FX = 'warchief:fx:';
export const WOLF_FX = 'mistwolf:fx:';

/** THE RULES' OWN NUMBERS: how hard each blow is (times its own blow); the rage; the howl; how near each comes. */
export const F9_TUNE = {
  chief: { smash: 1.4, slam: 1.2, rush: 1.6, roar: 0.5, stopAt: 2.9 },
  wolf: { bite: 1.0, claw: 1.3, lunge: 1.4, cloud: 0.35, stopAt: 1.5 },
  /**
   * SQUARING UP: its pictures face only the four ways along the floor's grid, and its blows land where its pictures' do, so as a move
   * comes it goes to stand with the hero square before it along one of them, as far off as its blows reach him (tiles: `band`);
   * so long at most (`most` seconds), then not again for `rest`.
   */
  square: { chief: { near: 2.3, far: 3.7 }, wolf: { near: 1.1, far: 2.0 }, ready: 0.6, most: 2.6, rest: 2.5, off: 0.35, pace: 1.2 },
  /** The war cry's rage: how long, how much quicker his moves and his readiness, how much faster his feet. */
  rage: { lasts: 9, quick: 1.3, fast: 1.45 },
  /** The howl: how many of its wolves may be about at once. */
  howl: { most: 3 },
  /** How far a blow throws the hero back (times a heavy blow's), each. */
  knock: { smash: 1.0, slam: 0.7, rush: 3.0, roar: 1.0, claw: 0.9 },
  /** The bull rush, once it has struck: how much of its run is left to it (skidding on). */
  rushSkid: 0.1,
  /** His war cry's strides: how near the hero they bring him at most (tiles between them, past his and the hero's own room). */
  strideGap: 1.0,
  /** The heavy blows: how long the game holds still, and how far the screen kicks (game pixels), as each lands; heard and felt within `near` tiles. */
  beat: {
    smash: [0.12, 4], slam: [0.13, 5], warcry: [0.1, 4.5], rush: [0.12, 4.5],
    bite: [0.08, 2], claw: [0.12, 3.5], howl: [0.05, 2], lunge: [0.08, 2.5], cloud: [0.05, 2.5],
  } as Record<string, readonly [number, number]>,
  beatNear: 14,
  /** His footfalls as he walks: how far the screen shakes, felt within so many tiles. */
  footfall: { by: 0.8, near: 10 },
} as const;

const chief = (move: ChiefMove): { long: number; hit: number } => ({ long: CHIEF_MOVES[move].long, hit: CHIEF_MOVES[move].beats[0].at });
const wolf = (move: WolfMove): { long: number; hit: number } => ({ long: WOLF_MOVES[move].long, hit: WOLF_MOVES[move].beats[0].at });
/** Its own lengths in tiles. */
const tC = (u: number): number => (u * CK) / TILE3;
const tW = (u: number): number => (u * WK) / TILE3;

const T = F9_TUNE;
const CHIEF_ACTS: readonly ActDef[] = [
  { id: 'warchief:smash', clip: 'attack', ...chief('smash'), dmg: T.chief.smash, cooldown: 0, first: 0.6, after: 0.8, near: 0, far: tC(CHIEF_LANDS.smash[0]) + 0.9 },
  { id: 'warchief:slam', clip: 'slam', ...chief('slam'), dmg: T.chief.slam, cooldown: 7, first: 3, after: 0.9, near: 1.2, far: tC(CHIEF_LANDS.slam[0] + SLAM_CRACK.long) - 0.4 },
  { id: 'warchief:rush', clip: 'rush', ...chief('rush'), dmg: T.chief.rush, cooldown: 9, first: 5, after: 1.0, near: 2.6, far: tC(RUSH_LANE.to) - 0.3 },
  { id: 'warchief:warcry', clip: 'warcry', ...chief('warcry'), dmg: T.chief.roar, cooldown: 18, first: 7, after: 0.6, near: 0, far: 9 },
];
const WOLF_ACTS: readonly ActDef[] = [
  { id: 'mistwolf:bite', clip: 'attack', ...wolf('bite'), dmg: T.wolf.bite, cooldown: 0, first: 0.5, after: 0.5, near: 0, far: tW(BITE_RING.f) + 0.6 },
  { id: 'mistwolf:claw', clip: 'claw', ...wolf('claw'), dmg: T.wolf.claw, cooldown: 4.5, first: 2, after: 0.6, near: 0, far: tW(CLAW_SWEEP.f + CLAW_SWEEP.r1) - 0.2 },
  // (made only at a hero near enough that it lands well beyond him: through him, never into him)
  { id: 'mistwolf:lunge', clip: 'lunge', ...wolf('lunge'), dmg: T.wolf.lunge, cooldown: 6, first: 3, after: 0.7, near: 1.0, far: tW(LUNGE_LONG) - 1.5 },
  { id: 'mistwolf:cloud', clip: 'cloud', ...wolf('cloud'), dmg: T.wolf.cloud, cooldown: 13, first: 6, after: 0.8, near: 0, far: tW(CLOUD.r) * 0.8 },
  { id: 'mistwolf:howl', clip: 'howl', ...wolf('howl'), dmg: 0, cooldown: 20, first: 7, after: 0.8, near: 0, far: 12 },
];

/** The move an act is (its id after its kind's name). */
const moveOf = (id: string): string => id.slice(id.indexOf(':') + 1);
const r0 = GAME_TUNE.heroRadius;

/** The peril of the act it is making now, and whose each is. */
const actPeril = new WeakMap<Monster, Peril>();
const perilOf = new WeakMap<Peril, Monster>();

/** Is it raging now (the war cry's rage)? */
export function raging(m: Monster): boolean {
  return (m.a1?.rage ?? 0) > 0;
}

/** Where on the floor (tiles) a point of its own lengths is, from the peril of the act it began (its frame and where it stood). */
function spot(p: Peril, k: number, f: number, l: number): [number, number] {
  return spotOf(FRAMES[p.a], p.x, p.y, (f * k) / TILE3, (l * k) / TILE3);
}

/** How near the hero is to the line from (x0, y0) to (x1, y1) (tiles). */
function nearLine(hx: number, hy: number, x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = dx * dx + dy * dy;
  const k = L > 1e-9 ? Math.max(0, Math.min(1, ((hx - x0) * dx + (hy - y0) * dy) / L)) : 0;
  return Math.hypot(hx - (x0 + dx * k), hy - (y0 + dy * k));
}

/** Its body carried `d` tiles along the way it faces, over the floor as it lets it (a little at a time, not through a wall). */
function carried(R: BossRules, m: Monster, d: number): void {
  if (Math.abs(d) < 1e-6) return;
  const n = Math.max(1, Math.ceil(Math.abs(d) / 0.2));
  for (let i = 0; i < n; i++) R.g.slide(m, Math.min(m.r, 0.42), (m.fx * d) / n, (m.fy * d) / n, R.g.level.walk, true);
}

/** A heavy blow landing: the game held still a moment, the screen kicked, if the hero is near enough to feel it. */
function beat(R: BossRules, m: Monster, move: string): void {
  const b = T.beat[move];
  if (!b) return;
  const h = R.g.hero;
  if (Math.hypot(h.x - m.x, h.y - m.y) > T.beatNear) return;
  R.g.emit({ t: 'shake', amount: b[1], hold: b[0] });
}

/**
 * SQUARING UP (F9_TUNE.square) as a move comes: to the spot on the hero's line along the nearest of its four ways, as far off as its
 * blows reach him, walking. True while it goes there (that step is all it does).
 */
function squareUp(R: BossRules, m: Monster, dt: number, band: { near: number; far: number }, pace: number): boolean {
  const g = R.g;
  const h = g.hero;
  const S = T.square;
  const a = (m.a1 ??= {});
  if (m.state === 'act' || m.cd > S.ready || g.over) {
    a.sq = 0;
    return false;
  }
  if ((a.sqRest ?? 0) > 0) {
    a.sqRest = Math.max(0, (a.sqRest ?? 0) - dt);
    return false;
  }
  const dx = h.x - m.x;
  const dy = h.y - m.y;
  const dist = Math.hypot(dx, dy);
  if (dist > band.far + 2 || !g.sees(m.x, m.y, h.x, h.y)) {
    a.sq = 0;
    return false;
  }
  const F = FRAMES[nearestFrame(dx, dy)];
  const r = inFrame(F, m.x, m.y, h.x, h.y);
  // (there: it stands, and makes its move)
  const done = (rest: number): false => {
    if (a.sq) m.gait = { mode: 'stand', t: 0 };
    a.sq = 0;
    a.sqRest = rest;
    return false;
  };
  if (Math.abs(r.left) <= S.off && r.fwd >= band.near && r.fwd <= band.far) return done(0);
  const fwd = Math.max(band.near, Math.min(band.far, r.fwd));
  const tx = h.x - F.f[0] * fwd;
  const ty = h.y - F.f[1] * fwd;
  const off = Math.hypot(tx - m.x, ty - m.y);
  if (off < 0.15) return done(0);
  if ((a.sq ?? 0) > S.most) return done(S.rest);
  a.sq = (a.sq ?? 0) + dt;
  const step = Math.min(off, m.speed * S.pace * dt);
  const ux = (tx - m.x) / off;
  const uy = (ty - m.y) / off;
  const x0 = m.x;
  const y0 = m.y;
  g.slide(m, Math.min(m.r, 0.42), ux * step, uy * step, g.level.walk, true);
  // (barred: it gives up, and makes its move as it stands)
  if (Math.hypot(m.x - x0, m.y - y0) < step * 0.3) return done(S.rest);
  m.fx = ux;
  m.fy = uy;
  m.anim = 'walk';
  m.state = 'chase';
  if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
  m.gait.t += step / pace;
  return true;
}

/** As an act begins: turned square to the nearest of its four ways toward the hero; its move's peril laid where it stands; quicker if raging. */
function begin(R: BossRules, m: Monster, a: ActDef, prefix: string): void {
  const h = R.g.hero;
  const k = nearestFrame(h.x - m.x, h.y - m.y);
  m.fx = FRAMES[k].f[0];
  m.fy = FRAMES[k].f[1];
  if (raging(m) && m.act) m.act.rate = T.rage.quick;
  const p = R.peril(m, 'act1', m.x, m.y, { a1: prefix + moveOf(a.id), fx: m.fx, fy: m.fy, t: 0, dur: a.long + F9_FX_AFTER, hit: a.hit, dmg: R.g.rollMonsterDmg(m), a: k, b: m.act?.n ?? 0, d: 0 });
  actPeril.set(m, p);
  perilOf.set(p, m);
  const a1 = (m.a1 ??= {});
  a1.px = m.x;
  a1.py = m.y;
}

/** The peril's clock kept with its act's while the act goes on (quickened by the rage, slowed by a chill); gone with it if it is cut off before its blow. */
function keepTime(p: Peril): Monster | null {
  const m = perilOf.get(p);
  const acting = !!m && !m.dead && m.state === 'act' && !!m.act && m.act.n === p.b;
  if (acting) p.t = m!.act!.t;
  else if (p.t < p.hit) p.dur = p.t;
  return acting ? m! : null;
}

export const RULES_CHIEF: Act1Rules | null = {
  gait: { pace: CHIEF_PLAY.walk.pace, cycle: CHIEF_PLAY.walk.frames / CHIEF_PLAY.walk.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: T.chief.stopAt, slack: 0.7, trueBack: true },
  acts: CHIEF_ACTS,
  can(R, m, a) {
    // (no war cry while the last one's rage is on him)
    if (a.id === 'warchief:warcry') return !raging(m);
    return true;
  },
  start(R, m, a) {
    begin(R, m, a, CHIEF_FX);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const move = moveOf(a.id) as ChiefMove;
    const at = (q: number): boolean => t0 < q && t1 >= q;
    const p = actPeril.get(m);
    // (the ground he covers: his war cry's strides at you no further than up to you; his bull rush, once it has struck you, only
    // skidding on a little)
    const x0 = m.x;
    const y0 = m.y;
    let d = tC(chiefCarry(move, t1) - chiefCarry(move, t0));
    const ahead = (h.x - m.x) * m.fx + (h.y - m.y) * m.fy;
    const beside = Math.abs((h.x - m.x) * m.fy - (h.y - m.y) * m.fx);
    if (move === 'warcry' && beside < m.r + r0 && ahead > 0) d = Math.min(d, Math.max(0, ahead - (m.r + r0 + T.strideGap)));
    if (move === 'rush' && p && p.d & 1) d *= T.rushSkid;
    carried(R, m, d);
    if (!p) return;
    const free = !h.move && h.invuln <= 0 && !g.over;
    const struck = (bit: number): boolean => (p.d & bit) !== 0;
    // (struck from where the blow lands; thrown back away from him)
    const strike = (bit: number, mult: number, knock: number, fx: number, fy: number): void => {
      p.d |= bit;
      g.hurtHero(p.dmg * mult, p.el, p.words, m, '', fx, fy, p.half);
      if (knock > 0) g.knockHero(m.x, m.y, knock);
    };
    if (at(a.hit)) {
      beat(R, m, move);
      g.sfx(move === 'warcry' ? 'bossRoar' : 'hit', move === 'warcry' ? 0.9 : 0.8);
    }
    if (move === 'smash') {
      if (at(0.4)) g.sfx('swing', 0.4);
      if (at(a.hit) && free) {
        const [cx, cy] = spot(p, CK, CHIEF_LANDS.smash[0], CHIEF_LANDS.smash[1]);
        if (Math.hypot(h.x - cx, h.y - cy) <= tC(SMASH_RING) + r0) strike(1, 1, T.knock.smash, cx, cy);
      }
    } else if (move === 'slam') {
      // (the crack running out along the lane: struck as it reaches him)
      if (t1 >= a.hit && !struck(1) && free) {
        const K = SLAM_CRACK;
        const [cf, cl] = CHIEF_LANDS.slam;
        const front = cf - K.back + Math.min(1, (t1 - a.hit) / K.runs) * K.long;
        const r = inFrame(FRAMES[p.a], p.x, p.y, h.x, h.y);
        const f = (r.fwd * TILE3) / CK;
        const l = (r.left * TILE3) / CK;
        if (f >= cf - K.back - 8 && f <= front + 6 && Math.abs(l - cl) <= K.half + (r0 * TILE3) / CK && t1 - a.hit < K.runs + 0.15) {
          const [cx, cy] = spot(p, CK, f, cl);
          strike(1, 1, T.knock.slam, cx, cy);
        }
      }
    } else if (move === 'warcry') {
      if (at(a.hit)) {
        // (the roar: those near him struck and thrown; the rage on him)
        if (free && Math.hypot(h.x - m.x, h.y - m.y) <= tC(ROAR_RING) + r0) strike(1, 1, T.knock.roar, m.x, m.y);
        const a1 = (m.a1 ??= {});
        a1.rage = T.rage.lasts;
        g.msg(`${m.name} roars, enraged`, MSG.foe);
      }
    } else if (move === 'rush') {
      if (at(0.52) || at(0.76)) g.emit({ t: 'shake', amount: 1 });
      if (at(1.15)) g.sfx('swing', 0.7);
      // (whoever he runs into, as he runs: struck and thrown)
      if (t1 > 1.15 && t0 < 1.5 && !struck(1) && free && nearLine(h.x, h.y, x0, y0, m.x, m.y) <= m.r + r0) strike(1, 1, T.knock.rush, m.x - m.fx, m.y - m.fy);
    }
    const a1 = (m.a1 ??= {});
    a1.px = m.x;
    a1.py = m.y;
  },
  tick(R, m, dt) {
    const g = R.g;
    const a = (m.a1 ??= {});
    a.base ??= m.speed;
    // THE RAGE: his moves quicker, his feet faster, ready sooner
    if ((a.rage ?? 0) > 0) {
      a.rage = Math.max(0, (a.rage ?? 0) - dt);
      m.speed = a.base * T.rage.fast;
      const more = dt * (T.rage.quick - 1);
      m.cd -= more;
      if (m.moveCd) for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= more;
    } else m.speed = a.base;
    const squaring = squareUp(R, m, dt, T.square.chief, CHIEF_PLAY.walk.pace);
    // (the floor shaking at each footfall as he walks, two a turn of his walk; felt near him)
    const walking = m.state !== 'act' && m.gait?.mode === 'walk';
    if (!walking) {
      a.step = 0;
      return squaring;
    }
    a.step = (a.step ?? 0) + (dt * m.speed) / CHIEF_PLAY.walk.pace;
    const every = CHIEF_PLAY.walk.frames / CHIEF_PLAY.walk.fps / 2;
    if (a.step >= every) {
      a.step -= every;
      if (Math.hypot(g.hero.x - m.x, g.hero.y - m.y) < T.footfall.near) g.emit({ t: 'shake', amount: T.footfall.by });
    }
    return squaring;
  },
  peril(R, p) {
    if (!p.a1?.startsWith(CHIEF_FX)) return;
    keepTime(p);
  },
};

export const RULES_WOLF: Act1Rules | null = {
  gait: { pace: WOLF_PLAY.walk.pace, cycle: WOLF_PLAY.walk.frames / WOLF_PLAY.walk.fps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: T.wolf.stopAt, slack: 0.6, trueBack: true },
  acts: WOLF_ACTS,
  can(R, m, a) {
    // (no howl while as many of its wolves as may be are about)
    if (a.id === 'mistwolf:howl') return calledOf(R, m) < T.howl.most;
    return true;
  },
  start(R, m, a) {
    begin(R, m, a, WOLF_FX);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const move = moveOf(a.id) as WolfMove;
    const at = (q: number): boolean => t0 < q && t1 >= q;
    const p = actPeril.get(m);
    const x0 = m.x;
    const y0 = m.y;
    carried(R, m, tW(wolfCarry(move, t1) - wolfCarry(move, t0)));
    if (!p) return;
    const free = !h.move && h.invuln <= 0 && !g.over;
    const strike = (bit: number, mult: number, knock: number, fx: number, fy: number): void => {
      p.d |= bit;
      g.hurtHero(p.dmg * mult, p.el, p.words, m, '', fx, fy, p.half);
      if (knock > 0) g.knockHero(fx, fy, knock);
    };
    if (at(a.hit)) {
      beat(R, m, move);
      if (move === 'howl') g.sfx('bossRoar', 0.7);
    }
    const r = inFrame(FRAMES[p.a], p.x, p.y, h.x, h.y);
    const f = (r.fwd * TILE3) / WK;
    const l = (r.left * TILE3) / WK;
    const rr = (r0 * TILE3) / WK;
    if (move === 'bite') {
      if (at(a.hit) && free && Math.hypot(f - BITE_RING.f, l) <= BITE_RING.r + rr + 10) strike(1, 1, 0, m.x, m.y);
    } else if (move === 'claw') {
      const S = CLAW_SWEEP;
      if (at(a.hit) && free) {
        const d = Math.hypot(f - S.f, l);
        const ang = Math.atan2(l, f - S.f);
        if (d >= S.r0 - rr - 8 && d <= S.r1 + rr && ang >= S.a0 - 0.2 && ang <= S.a1 + 0.2) strike(1, 1, T.knock.claw, m.x, m.y);
      }
    } else if (move === 'lunge') {
      // (through him as mist: struck as it passes)
      if (t1 > 0.7 && t0 < 0.9 && !(p.d & 1) && free && nearLine(h.x, h.y, x0, y0, m.x, m.y) <= m.r + r0) strike(1, 1, 0, x0, y0);
    } else if (move === 'cloud') {
      // (its claws at whoever is in its cloud, again and again)
      CLOUD.hurts.forEach((q, i) => {
        if (!at(q) || !free) return;
        const cf = wolfCarry(move, q) + CLOUD.f;
        if (Math.hypot(f - cf, l) <= CLOUD.r * 0.85 + rr) strike(1 << i, 1, 0, m.x, m.y);
      });
    } else if (move === 'howl') {
      HOWL_FOGS.forEach((q, i) => {
        if (!at(q.at) || calledOf(R, m) >= T.howl.most) return;
        const [x, y] = spot(p, WK, q.f, q.l);
        const s = walkableNear(R, x, y) ?? walkableNear(R, m.x + (x - m.x) * 0.5, m.y + (y - m.y) * 0.5);
        if (!s) return;
        const o = g.spawn('wolf', s[0], s[1], m.packId, 0, false, g.rng);
        o.words = [];
        o.half = undefined;
        o.xp = 0;
        o.state = 'chase';
        o.cd = 0.5 + 0.3 * i;
        const dx = h.x - o.x;
        const dy = h.y - o.y;
        const n = Math.hypot(dx, dy) || 1;
        o.fx = dx / n;
        o.fy = dy / n;
      });
    }
  },
  peril(R, p) {
    if (!p.a1?.startsWith(WOLF_FX)) return;
    keepTime(p);
  },
  tick(R, m, dt) {
    return squareUp(R, m, dt, T.square.wolf, WOLF_PLAY.walk.pace);
  },
  reachable(m) {
    // (nothing reaches it while it is mist: going through you, and gone into its cloud)
    const a = m.act;
    if (!a || m.state !== 'act') return true;
    if (a.id === 'mistwolf:lunge') return !(a.t >= 0.66 && a.t <= 0.9);
    if (a.id === 'mistwolf:cloud') return !(a.t >= 0.66 && a.t <= CLOUD.thins);
    return true;
  },
  aloft(m) {
    // (going through you as mist: it neither jostles nor is jostled)
    return lunging(m);
  },
  through(m) {
    // (nor does it bar your way, nor you its)
    return lunging(m);
  },
};

/** Going through as mist, in its lunge (and a moment after, as it lands beyond). */
function lunging(m: Monster): boolean {
  const a = m.act;
  return !!a && m.state === 'act' && a.id === 'mistwolf:lunge' && a.t >= 0.66 && a.t <= 1.0;
}

/** How many of the wolves it has called are about. */
function calledOf(R: BossRules, m: Monster): number {
  let n = 0;
  for (const o of R.g.monsters) if (!o.dead && o.kind === 'wolf' && o.packId === m.packId) n++;
  return n;
}

/** The nearest whole floor to (x, y), a ring at a time out to two tiles. */
function walkableNear(R: BossRules, x: number, y: number): [number, number] | null {
  const L = R.g.level;
  const W = L.floor.w;
  const H = L.floor.h;
  for (let r = 0; r <= 2; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const tx = Math.floor(x) + dx;
      const ty = Math.floor(y) + dy;
      if (tx < 0 || ty < 0 || tx >= W || ty >= H || L.walk[ty * W + tx] !== 1) continue;
      return [tx + 0.5, ty + 0.5];
    }
  }
  return null;
}
