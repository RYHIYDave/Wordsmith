// ACT 1: THE HOLLOW STAG, FLOOR 9'S BOSS (the Pinewood, "The Hollow Wood"): its rules (game/act1_rules/types.ts).
//
// The owner's doc (with his yes of 12 Oct, 18:07): "A great stag hollowed out by the swamp's influence, with a blinking
// eye visible through its ribs." Its moves there: "an antler gore (its basic attack); a charge that splinters trees;
// lines of roots bursting toward you; a bellow that wolves answer from the fog." Its pictures are the art chat's
// (art/hollow_stag.ts, all of it with his yes as shown, 15 Oct by 13:13), and every moment, pace and reach here is
// theirs (tests/act1_stag.test.ts holds them to the art); what each move hurts, how hard and how often is this file's.
//
//   ITS WALK IS STOTTING (his words, 15 Oct: “I’d like it to move fast and erratic bouncing or stotting all over the
//     arena.”): it bounds on all four stiff legs at its picture's pace, and, as the art chat has it, it may change its
//     way only as it lands and stop only landed (STAG_BOUNDS: at 0 and 0.42 s of each round). So in the air it holds
//     its way (`tick`); as it lands it turns: at you, but jinking off to one side or the other; and after its gore it
//     may bound off away from you a round, to come at you again another way.
//   ITS ANTLER GORE, its basic blow: hooked up through whoever is before it, as far as its antlers sweep; thrown back.
//   ITS CHARGE THAT SPLINTERS TREES: only with a clear run (as the red troll's, his rulebook); its way is marked on the
//     floor as it paws (the red troll's lane, art/charge_lane.ts); it runs at its picture's pace for its picture's
//     run, and whoever it meets on the way is run down and thrown aside; at the crash what is before its antlers is
//     struck, and a pine standing there splinters, a stump after (as in its film).
//   ITS LINES OF ROOTS: at the slam, three lines in a fan toward you (as its film lays them); along each one root
//     worms through the ground at its picture's pace out to its reach, its glowing crack before it (the warning); it
//     harms whoever its head passes, once.
//   ITS BELLOW: the wolves answer from the fog: a few fog wolves come out of the wood well off from you (the cult's
//     dagger cultists stand in for them until the wolves are in the game: game/act1_mobs.ts), never more than so many
//     of its calling at once.

import { CHARGE9, CHARGE9_CARRIED, CHARGE9_HIT, CLOSE, CLOSE_HIT, GORE9, GORE9_HIT, STAG_ACTION, STARE, STOT9, charge9Carry, stareCarry } from '../../art/stag_action';
import { CLEARING, WALL, outOf, thrownIn } from '../../art/stag_action_fx';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import { TUNE } from '../defs';
import type { Game } from '../game';
import { MSG } from '../defs';
import { fromFigure } from '../facing';
import type { Monster, Peril } from '../state';
import type { MonsterKind } from '../types';
import { act1Ready } from '../act1_mobs';
import type { Act1Rules } from './types';

/** The figure's lengths in a tile (art/new_mobs3.ts TILE3: the floor's tile as its pictures measure it). */
const T3 = 32 / Math.sqrt(2 / 3);

/** ITS STOTTING (art/hollow_stag.ts STAG_PACE, STAG_WALK: 12 frames at 16 a second, a round of 0.75 s, from its stand and back to it as it lands). */
export const STAG_GAIT: GaitDef = { pace: 3, cycle: 0.75, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.3, slack: 0.5, trueBack: false };

/** Its four, its basic blow first and its biggest last (his rulebook: the bigger the hit, the longer the cooldown). */
export const STAG_ACTS: readonly ActDef[] = [
  { id: 'stag:gore', clip: 'attack', long: 1.6, hit: 0.8, dmg: 1, cooldown: 0, first: 0, after: 0.35, near: 0, far: 2.3 },
  { id: 'stag:roots', clip: 'roots', long: 2.6, hit: 1.0, dmg: 0.9, cooldown: 9, first: 4, after: 0.5, near: 0, far: 6.2 },
  { id: 'stag:charge', clip: 'charge', long: 2.7, hit: 1.74, dmg: 1.5, cooldown: 11, first: 2.5, after: 0.6, near: 2.6, far: 6.2 },
  { id: 'stag:bellow', clip: 'bellow', long: 2.6, hit: 0.75, dmg: 0, cooldown: 18, first: 7, after: 0.6, near: 0, far: 14 },
];

/** THE NUMBERS OF ITS FIGHT: its pictures' own (art/hollow_stag.ts, in tiles and seconds), and what they hurt (the rules'). */
export const STAG = {
  /**
   * Its stotting: its hoofs land at `land` (seconds into each round) and stay down `down` (STAG_BOUNDS); its walk's
   * frames a second (the landed frame after its second landing, 0.4375 s, is where it may stop there). Its jinks as
   * it lands (degrees off its way: near you, and further off); how many bounds it may go off away after its gore,
   * and how often it does.
   */
  stot: { land: [0, 0.42] as const, down: 0.08, fps: 16, jinkNear: [4, 14] as const, jinkFar: [18, 50] as const, away: [25, 70] as const, roam: 2, roamChance: 0.6 },
  /** Its antler gore: its antlers' tips sweep `reach` tiles before its floor point (STAG_GORE.reach, 66 of its lengths, before its forefeet, which stand 19 before it: STAG_FEET), `half` to either side; whoever is in that is struck and thrown back. */
  gore: { reach: (66 + 19) / T3, beyond: 0.3, half: 0.9, knock: 1 },
  /**
   * Its charge: its lane marked from `warn`; the run from `run` to `crash` at `pace` tiles a second (STAG_CHARGE), so
   * `run * pace` along; whoever is before its antlers on the way (`ahead` tiles before its floor point, `half` to
   * either side) is run down and thrown aside; at the crash, whoever is in its gore's reach. A pine within `splinter`
   * tiles before it at the crash splinters (`pines`, a stump after). It needs a clear run of its whole length.
   */
  charge: { warn: 0.3, run: 0.84, crash: 1.74, pace: 6, ahead: [0.2, 2.0] as const, half: 0.8, knock: 1.5, splinter: 1.9, pines: ['young pine', 'pine snag', 'old pine', 'pine'] as readonly string[], stump: 'stump' },
  /**
   * Its roots: they burst out at the slam (`slam`, held `freeze`); three lines in a fan (`fan`, degrees off the way to
   * you: its film's); along each a root's head runs from `from` to `reach` tiles at `speed` tiles a second (ROOT_SNAKE,
   * STAG_ROOTS: stagRootTime), `body` tiles of it behind its head; it harms within `half` of its line as its head
   * passes, once; each line is gone `after` its root has passed.
   */
  roots: { slam: 1.0, freeze: 0.1, fan: [-24, 0, 24] as const, from: 0.6, reach: 6, speed: 5, body: 2.2, half: 0.45, after: 0.6, knock: 0.5 },
  /** Its bellow: from `roar`; the wolves answer at `call`: `n` of them (`more` once it is down to half its life), coming out of the wood `near` to `far` tiles from you, never more than `most` of its calling up at once. */
  bellow: { roar: 0.75, call: 1.3, n: 2, more: 3, most: 4, near: 6, far: 9.5 },
};

/** When a root's head passes `d` tiles out along its line, seconds from the slam (art/hollow_stag.ts stagRootTime, less the slam). */
export function rootHeadAt(d: number): number {
  const R = STAG.roots;
  return R.freeze + (d - R.from) / R.speed;
}
/** How far out its root's head is along its line, `t` seconds from the slam (below `from`: not out yet). */
export function rootHead(t: number): number {
  const R = STAG.roots;
  return R.from + (t - R.freeze) * R.speed;
}
/** How long a line of roots lasts (seconds from the slam): its head out to its reach, its body after it, its furrow closing. */
export const ROOT_LIFE = rootHeadAt(STAG.roots.reach) + STAG.roots.body / STAG.roots.speed + STAG.roots.after;

/** What answers its bellow: the fog wolves, or the cult's dagger cultists while the wolves are not in the game yet. */
export function answers(): MonsterKind {
  return act1Ready('wolf') ? 'wolf' : 'dagger';
}

/** Turn it `deg` degrees (to its left, as the floor has it). */
function turn(m: Monster, deg: number): void {
  const a = Math.atan2(m.fy, m.fx) + (deg * Math.PI) / 180;
  m.fx = Math.cos(a);
  m.fy = Math.sin(a);
}
/** Is the floor clear `far` tiles along its way (it would not bound into what stands there)? */
function clear(R: BossRules, m: Monster, far: number): boolean {
  const g = R.g;
  for (let d = 0.4; d <= far + 1e-6; d += 0.4) if (!g.free(g.level.walk, m.x + m.fx * d, m.y + m.fy * d, 0.36)) return false;
  return true;
}
/** Its way off away from the hero, for a bound or two: away, and off to one side or the other, where the floor is clear. */
function away(R: BossRules, m: Monster): void {
  const g = R.g;
  const h = g.hero;
  const base = Math.atan2(m.y - h.y, m.x - h.x);
  const [lo, hi] = STAG.stot.away;
  const side = g.rng.chance(0.5) ? 1 : -1;
  for (const s of [side, -side]) {
    const a = base + (s * g.rng.range(lo, hi) * Math.PI) / 180;
    m.fx = Math.cos(a);
    m.fy = Math.sin(a);
    if (clear(R, m, 1.6)) return;
  }
  // (hemmed in: across, the way the hero is not)
  m.fx = Math.cos(base + Math.PI / 2);
  m.fy = Math.sin(base + Math.PI / 2);
}
/** As it lands: its way for the next bound. */
function jink(R: BossRules, m: Monster, dist: number): void {
  const g = R.g;
  const a1 = m.a1!;
  if ((a1.roam ?? 0) > 0) {
    a1.roam--;
    away(R, m);
    return;
  }
  // (off to one side, then the other, by turns, now and then the same way twice: erratic)
  const side = g.rng.chance(0.75) ? -(a1.side || 1) : a1.side || 1;
  a1.side = side;
  const [lo, hi] = dist < 3.2 ? STAG.stot.jinkNear : STAG.stot.jinkFar;
  const deg = g.rng.range(lo, hi);
  turn(m, side * deg);
  if (!clear(R, m, 1.3)) {
    turn(m, -2 * side * deg);
    if (!clear(R, m, 1.3)) turn(m, side * deg);
  }
}

/** Those of its calling still up (and coming). */
function called(R: BossRules, m: Monster): number {
  let n = 0;
  for (const o of R.g.monsters) if (!o.dead && o !== m && o.packId === m.packId && o.a1?.stagCalled) n++;
  return n;
}

/** THE WOLVES ANSWER FROM THE FOG: they come out of the wood well off from the hero, out of his sight where it can be. */
function callWolves(R: BossRules, m: Monster): number {
  const g = R.g;
  const h = g.hero;
  const B = STAG.bellow;
  const want = Math.max(0, Math.min(m.life < m.maxLife / 2 ? B.more : B.n, B.most - called(R, m)));
  const kind = answers();
  const spots: { x: number; y: number }[] = [];
  for (let pass = 0; pass < 2 && spots.length < want; pass++) {
    for (let tries = 0; tries < 60 && spots.length < want; tries++) {
      const a = g.rng.range(0, Math.PI * 2);
      const d = g.rng.range(B.near, B.far);
      const x = h.x + Math.cos(a) * d;
      const y = h.y + Math.sin(a) * d;
      if (!g.free(g.level.walk, x, y, 0.36) || spots.some((q) => Math.hypot(q.x - x, q.y - y) < 1.5)) continue;
      // (out of his sight first, from the fog among the trees; then wherever there is room)
      if (pass === 0 && g.sees(h.x, h.y, x, y)) continue;
      spots.push({ x, y });
    }
  }
  for (const s of spots) {
    const w = g.spawn(kind, s.x, s.y, m.packId, 0, false, g.rng);
    w.state = 'chase';
    w.cd = g.rng.range(0.4, 0.9);
    w.xp = 0;
    w.a1 = { ...(w.a1 ?? {}), stagCalled: 1 };
    const dx = h.x - s.x;
    const dy = h.y - s.y;
    const dd = Math.hypot(dx, dy) || 1;
    w.fx = dx / dd;
    w.fy = dy / dd;
  }
  return spots.length;
}

const OLD: Act1Rules = {
  gait: STAG_GAIT,
  acts: STAG_ACTS,

  spawned(_R, m) {
    m.a1 = { bound: -1, side: 1, roam: 0 };
  },

  tick(R, m, dt, dist) {
    // STOTTING: in the air it holds its way; it turns, and stops, only as it lands (BossRules makes the step it lands on)
    if (m.state === 'act' || !m.gait) return false;
    const g = R.g;
    const G = STAG_GAIT;
    const S = STAG.stot;
    const a1 = m.a1 ?? (m.a1 = { bound: -1, side: 1, roam: 0 });
    const gait = m.gait;
    if (gait.mode === 'stand' && (a1.roam ?? 0) > 0) {
      // (restless after its gore: off away from the hero, a bound or two, from where it stands)
      gait.mode = 'walk';
      gait.t = 0;
      gait.stop = false;
      a1.bound = 0;
      a1.roam--;
      away(R, m);
    } else if (gait.mode !== 'walk') return false;
    const slow = m.chillT > 0 ? 1 - m.chill : 1;
    const sp = m.speed * slow;
    const before = gait.t;
    const go = (dt * sp) / G.pace;
    const p0 = before - Math.floor(before / G.cycle) * G.cycle;
    if (p0 + go >= G.cycle || (p0 < S.land[1] && p0 + go >= S.land[1])) return false;
    // (landed from its second bound, near enough to gore it and ready: it stops there, its hoofs down)
    const landed = p0 >= Math.ceil(S.land[1] * S.fps) / S.fps && p0 < S.land[1] + S.down;
    if (landed && !((a1.roam ?? 0) > 0) && m.cd <= 0 && dist <= STAG_ACTS[0].far - 0.1 && g.sees(m.x, m.y, g.hero.x, g.hero.y)) {
      gait.mode = 'stand';
      gait.t = 0;
      m.anim = 'idle';
      return false;
    }
    // (a new bound: its way, as it lands)
    const bound = Math.floor(before / G.cycle) * 2 + (p0 >= S.land[1] ? 1 : 0);
    if (bound !== a1.bound) {
      a1.bound = bound;
      jink(R, m, dist);
    }
    if (m.moveCd) for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt;
    g.slide(m, Math.min(m.r, 0.42), m.fx * sp * dt, m.fy * sp * dt, g.level.walk, true);
    gait.t = before + go;
    m.anim = 'walk';
    m.state = 'chase';
    return true;
  },

  can(R, m, a, dist) {
    const g = R.g;
    if (a.id === 'stag:charge') {
      // (a clear run: the whole of it, from where it stands toward the hero)
      const h = g.hero;
      const fx = (h.x - m.x) / Math.max(0.01, dist);
      const fy = (h.y - m.y) / Math.max(0.01, dist);
      const C = STAG.charge;
      const run = C.pace * (C.crash - C.run);
      for (let d = 0.4; d <= run + 0.3; d += 0.3) if (!g.free(g.level.walk, m.x + fx * d, m.y + fy * d, 0.42)) return false;
      return true;
    }
    if (a.id === 'stag:bellow') return called(R, m) < STAG.bellow.most;
    return true;
  },

  start(R, m, a) {
    if (a.id === 'stag:charge') {
      // (where it set off from, for its lane)
      m.act!.x = m.x;
      m.act!.y = m.y;
    }
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const hurt = (mult: number): boolean => {
      const was = h.life;
      R.blow(m, a.dmg * mult);
      return h.life < was;
    };
    const gored = (): boolean => {
      const G = STAG.gore;
      const r = R.rel(m);
      return r.fwd > -0.2 && r.fwd <= G.reach + G.beyond && Math.abs(r.left) <= G.half;
    };
    switch (a.id) {
      case 'stag:gore': {
        if (at(0.6)) g.sfx('swing', 0.6);
        if (!at(a.hit)) break;
        if (gored() && hurt(1)) g.knockHero(m.x, m.y, STAG.gore.knock);
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('slam', 0.5);
        break;
      }
      case 'stag:charge': {
        const C = STAG.charge;
        if (at(0.5) || at(0.68)) g.sfx('slam', 0.25);
        if (at(0.6)) g.sfx('gust', 0.5);
        if (at(C.run)) g.sfx('bossRoar', 0.6);
        // (THE RUN: carried at its picture's pace, by its picture's clock)
        const ran = Math.max(0, Math.min(t1, C.crash) - Math.max(t0, C.run));
        if (ran > 0) {
          g.slide(m, Math.min(m.r, 0.42), m.fx * C.pace * ran, m.fy * C.pace * ran, g.level.walk, true);
          if (!(act.b & 1)) {
            const r = R.rel(m);
            if (r.fwd >= C.ahead[0] && r.fwd <= C.ahead[1] && Math.abs(r.left) <= C.half && h.invuln <= 0 && !h.move && !g.over) {
              act.b |= 1;
              // (run down, and thrown aside, out of its way: to the side of its line he stands on, or to its left
              // if he stands square on it; so that it runs on past him)
              const side = (h.x - m.x) * m.fy - (h.y - m.y) * m.fx;
              const s = side < -0.02 ? -1 : 1;
              if (hurt(1)) g.knockHero(h.x - m.fy * s, h.y + m.fx * s, C.knock);
            }
          }
          if (Math.floor(t1 * 3.3) !== Math.floor(t0 * 3.3)) g.emit({ t: 'shake', amount: 1 });
        }
        if (!at(C.crash)) break;
        // THE CRASH: whoever is before its antlers; and a pine standing there splinters
        if (!(act.b & 1) && gored()) {
          act.b |= 1;
          if (hurt(1)) g.knockHero(m.x, m.y, C.knock);
        }
        for (const p of g.level.props) {
          if (p.kind !== 'piece' || !p.name || !C.pines.includes(p.name)) continue;
          const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, p.x, p.y);
          if (r.fwd < 0.2 || r.fwd > C.splinter || Math.abs(r.left) > 1.1) continue;
          p.name = C.stump;
          g.emit({ t: 'spark', x: p.x, y: p.y, el: 'phys', n: 14 });
          g.sfx('hit', 0.9);
        }
        g.emit({ t: 'shake', amount: 6 });
        g.sfx('slam', 1);
        break;
      }
      case 'stag:roots': {
        if (at(0.3)) g.sfx('gust', 0.4);
        if (!at(a.hit)) break;
        const Rt = STAG.roots;
        g.emit({ t: 'shake', amount: 5 });
        g.sfx('slam', 0.9);
        // (three lines in a fan, toward the hero as it slams down)
        const base = Math.atan2(h.y - m.y, h.x - m.x);
        const dmg = g.rollMonsterDmg(m) * a.dmg;
        Rt.fan.forEach((deg, j) => {
          const w = base + (deg * Math.PI) / 180;
          R.peril(m, 'act1', m.x, m.y, { a1: 'stag:root', fx: Math.cos(w), fy: Math.sin(w), dmg, dur: ROOT_LIFE, hit: 1e9, c: j, d: act.n });
        });
        break;
      }
      case 'stag:bellow': {
        const B = STAG.bellow;
        if (at(B.roar)) {
          g.sfx('bossRoar', 1);
          g.emit({ t: 'shake', amount: 3 });
        }
        if (at(B.call)) {
          const n = callWolves(R, m);
          g.msg(n > 0 ? `${m.name} bellows: ${answers() === 'wolf' ? 'wolves answer' : 'the cult answers'} from the fog` : `${m.name} bellows`, MSG.foe);
        }
        break;
      }
      default:
        break;
    }
  },

  end(R, m, a) {
    // (restless: after its gore it may bound off away, to come at the hero again another way)
    if (a.id === 'stag:gore' && R.g.rng.chance(STAG.stot.roamChance)) m.a1 = { ...(m.a1 ?? {}), roam: STAG.stot.roam };
  },

  peril(R, p, dt) {
    if (p.a1 !== 'stag:root' || p.done) return;
    const g = R.g;
    const h = g.hero;
    const Rt = STAG.roots;
    const t1 = p.t;
    const t0 = p.t - dt;
    if (t1 < Rt.freeze) return;
    // (where the hero is along its line, and off it)
    const r = fromFigure(p.x, p.y, p.fx, p.fy, 1, h.x, h.y);
    if (Math.abs(r.left) > Rt.half || r.fwd < Rt.from - 0.3 || r.fwd > Rt.reach + 0.3) return;
    const d0 = rootHead(Math.max(Rt.freeze, t0));
    const d1 = rootHead(t1);
    if (d1 < Rt.from || d0 > Rt.reach + 0.3) return;
    if (r.fwd >= d0 - 0.35 && r.fwd <= d1 + 0.2) {
      const was = h.life;
      g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x + p.fx * d1, p.y + p.fy * d1, p.half);
      // (passed over, once, whether it harmed him or he rolled through; and once by its slam's roots, however
      // many of its lines meet where he stands, near it, where they part)
      for (const q of g.perils) if (q.kind === 'act1' && q.a1 === 'stag:root' && q.d === p.d) q.done = 1;
      if (h.life < was) g.knockHero(p.x + p.fx * (r.fwd - 0.5), p.y + p.fy * (r.fwd - 0.5), Rt.knock);
    }
  },
};

/** (for the pictures) A peril of its roots: how far its head is out now. */
export function rootNow(p: Peril): number {
  return rootHead(p.t);
}

// =============================================================================================
// HIS FIGHT DONE THE ACTION WAY (the art chat's art/stag_action.ts behind STAG_ACTION, his yes there; his words of 31 Oct: “I love
// this.  It shrinks at 3/4, 1/2, and 1/4.  And I’d like him to move around the arena like the horse does in the princess fight.
// Really explore the space.  Not EXACTLY like the horse but similar”):
//   HIS BOUNDS: the great stot, STOT9.pace tiles a second, turning and stopping only as he lands (LAND9); between his blows he bounds
//     all round the clearing, the way he is going, swung in and out from its middle (45 to 80 hundredths of the way out), jinking one
//     way and the other as he lands, now and then cutting sharply across, never within EDGE9 of its edge; when his blow is ready he
//     comes at the hero; every six to eight bounds he lands heavy and STANDS TO STARE (its heavy landing knocking whoever is within
//     STARE.knock).
//   HIS GORE: held, then a sweep before him from GORE9.near to GORE9.reach, GORE9.arc across, at GORE9_HIT: struck, thrown back.
//   HIS CHARGE: the lane marked from CHARGE9.aim, CHARGE9.lane long; bursting off at CHARGE9_HIT, carried by charge9Carry to the crash
//     (CHARGE9_CARRIED tiles on); a hero in the lane as he comes by is run down, once, and thrown aside; where the wall (or the wood)
//     is nearer, the run is cut where his antlers meet it (ANTLERS before his floor point) and the crash plays there; at the crash,
//     whoever is before his antlers is struck, and the wall there splinters (its stumps growing back), and a pine splinters as before.
//   THE WOOD CLOSES IN (in place of his roots): at 3/4, 1/2 and 1/4 of his life, as soon as he is free, he rears and bellows, the new
//     edge marked from the start; at CLOSE_HIT a wall of roots and thorny trunks bursts up round it (CLEARING at CLOSE.stages), and
//     STAYS: from then the clearing is all the floor there is for the hero, for him and for the wolves (the level's fence); whoever is
//     in its band or outside it is struck and thrown in (thrownIn); the wall inside it sinks away. He dies: the wall sinks, the
//     fence is gone.
//   HIS BELLOW: as before; the wolves come out of the wood inside the clearing.
// The wall is a peril, 'stag:wall', that lasts the fight: (x, y) the clearing's middle; `a` the Stag; `c` the clearing now (its share
// across), `b` the one before it (sinking); `hit` its clock as the wall now burst up, `d` the way round from which it rippled (round
// the ellipse, as art/stag_action_fx.ts wallAt counts it); `fx` the way round where his charge splintered it, and `fy` when (its clock;
// -1: never).

export const WALL_PERIL = 'stag:wall';
export const LANE9_PERIL = 'stag:lane';
/** Where his hoofs land in each round of his stot (seconds into it): he turns and stops only then. */
export const LAND9 = [0.535, 1.135] as const;
/** How far a bound carries him (tiles). */
export const BOUND9 = STOT9.pace * STOT9.bound;
/** Never within this of the clearing's edge (tiles), bounding. */
const EDGE9 = 1.3;
/** His antlers meet what is before him this far before his floor point (tiles). */
const ANTLERS = 1.5;
const STAG9_GAIT: GaitDef = { pace: STOT9.pace, cycle: STOT9.period, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: GORE9.reach - 0.6, slack: 0.4, trueBack: false };
export const STAG9_ACTS: readonly ActDef[] = [
  { id: 'stag:gore', clip: 'attack', long: GORE9.long, hit: GORE9_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.3, near: 0, far: GORE9.reach - 0.4 },
  { id: 'stag:stare', clip: 'stare', long: STARE.long, hit: 0.05, dmg: 0, cooldown: 0, first: 0, after: 0.1, near: 0, far: 0, forced: true },
  { id: 'stag:charge', clip: 'charge', long: CHARGE9.long, hit: CHARGE9_HIT, dmg: 1.5, cooldown: 9, first: 2.5, after: 0.5, near: 3.2, far: 9.5 },
  { id: 'stag:bellow', clip: 'bellow', long: 2.6, hit: 0.75, dmg: 0, cooldown: 18, first: 7, after: 0.6, near: 0, far: 14 },
  { id: 'stag:close', clip: 'close', long: CLOSE.long, hit: CLOSE_HIT, dmg: 1.2, cooldown: 0, first: 0, after: 0.4, near: 0, far: 0, forced: true },
];

/** His fight's own (on him): the clearing's middle and its share across now, which close is next, his bounds. */
function own(R: BossRules, m: Monster): Record<string, number> {
  if (m.a1 && m.a1.cx !== undefined) return m.a1;
  const L = R.g.level;
  const area = L.land?.areas.find((a) => a.role === 'boss');
  m.a1 = { ...(m.a1 ?? {}), cx: area ? area.blob.x : m.x, cy: area ? area.blob.y : m.y, k: 1, stage: 0, bound: -1, side: 1, spin: 0, bounds: 0, stareAt: 7, stareNow: 0, way: 0.6 };
  return m.a1;
}
/** Whether a body of radius `r` at (x, y) is inside the clearing at `k` (its middle at cx, cy), clear of its wall and `more` besides. */
export function insideClearing(x: number, y: number, cx: number, cy: number, k: number, r: number, more = 0): boolean {
  const dx = x - cx;
  const dy = y - cy;
  const d = outOf(dx, dy, k);
  const rr = Math.hypot(dx, dy);
  return rr < 1e-6 || (d < 1 && rr * (1 / d - 1) >= WALL.band + r + more);
}
/** The fence the clearing makes at `k`: inside it, or well out in the wood beyond the arena (nothing there is of his fight). */
function fenceOf(cx: number, cy: number, k: number): (x: number, y: number, r: number) => boolean {
  return (x, y, r) => outOf(x - cx, y - cy, 1) >= 1.25 || insideClearing(x, y, cx, cy, k, r);
}
/** His wall, if it has risen. */
function wallOf(g: Game, m: Monster): Peril | undefined {
  return g.perils.find((p) => p.kind === 'act1' && p.a1 === WALL_PERIL && p.a === m.id);
}
/** Whether a body may land at (x, y): open floor, inside the clearing as it is now with EDGE9 to spare. */
function landable(R: BossRules, m: Monster, x: number, y: number): boolean {
  const g = R.g;
  const a1 = own(R, m);
  const k = a1.k;
  // (inside the arena's own edge too, while the wood stands where it always stood: k 1)
  if (!insideClearing(x, y, a1.cx, a1.cy, k, 0.42, EDGE9 - WALL.band)) return false;
  return g.free(g.level.walk, x, y, 0.5) && g.free(g.level.walk, (x + m.x) / 2, (y + m.y) / 2, 0.42);
}
/** As he lands: his way for the next bound (the pictures' model, dev/stag_action_scene.ts boundRun). */
function bound9(R: BossRules, m: Monster): void {
  const g = R.g;
  const h = g.hero;
  const a1 = own(R, m);
  const px = m.x - a1.cx;
  const py = m.y - a1.cy;
  const k = a1.k;
  const head = Math.atan2(m.fy, m.fx);
  if (!a1.spin) a1.spin = Math.sin(head - Math.atan2(py, px)) >= 0 ? 1 : -1;
  const spin = a1.spin;
  const ang = Math.atan2(py / CLEARING.ry, px / CLEARING.rx);
  const tan = Math.atan2(CLEARING.ry * Math.cos(ang) * spin, -CLEARING.rx * Math.sin(ang) * spin);
  if (a1.bounds % 2 === 0) a1.way = 0.45 + 0.35 * g.rng.next();
  const inOut = (outOf(px, py, k) - a1.way) * 1.6;
  let goal = tan + spin * inOut;
  // (his blow ready: at the hero)
  const ready = m.cd <= 0.4 && g.sees(m.x, m.y, h.x, h.y);
  if (ready) goal = Math.atan2(h.y - m.y, h.x - m.x);
  const cut = !ready && g.rng.next() > 0.82 ? spin * (1.1 + 0.6 * g.rng.next()) : 0;
  a1.side = -(a1.side || 1);
  const jink = a1.side * (ready ? 0.1 + 0.15 * g.rng.next() : 0.18 + 0.3 * g.rng.next());
  let d = goal + cut + jink - head;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  let next = head + Math.max(-2.2, Math.min(2.2, d));
  for (const t of [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.0, -2.0, 2.6, -2.6, Math.PI]) {
    if (landable(R, m, m.x + Math.cos(next + t) * BOUND9, m.y + Math.sin(next + t) * BOUND9)) {
      next += t;
      break;
    }
  }
  m.fx = Math.cos(next);
  m.fy = Math.sin(next);
}
/** The close due now (its index in CLOSE.at), or -1. */
function closeDue(m: Monster, a1: Record<string, number>): number {
  const s = a1.stage ?? 0;
  return s < CLOSE.at.length && m.life <= m.maxLife * CLOSE.at[s] ? s : -1;
}
/** Those of his calling still up. */
function called9(R: BossRules, m: Monster): number {
  let n = 0;
  for (const o of R.g.monsters) if (!o.dead && o !== m && o.packId === m.packId && o.a1?.stagCalled) n++;
  return n;
}
/** How far he can run from where he is along the way he faces, his body clear, to `most`. */
function runOf(g: Game, m: Monster, most: number): number {
  let d = 0;
  while (d < most && g.free(g.level.walk, m.x + m.fx * (d + 0.1), m.y + m.fy * (d + 0.1), 0.42)) d += 0.1;
  return Math.min(d, most);
}
/** Put a body thrown in by the wall where it may stand: at `to`, or the nearest open place about it. */
function putIn(g: Game, b: { x: number; y: number }, to: readonly [number, number], r: number): void {
  for (let ring = 0; ring <= 6; ring++) {
    for (let i = 0; i < Math.max(1, ring * 8); i++) {
      const a = (i / Math.max(1, ring * 8)) * Math.PI * 2;
      const x = to[0] + Math.cos(a) * ring * 0.35;
      const y = to[1] + Math.sin(a) * ring * 0.35;
      if (g.free(g.level.walk, x, y, r)) {
        b.x = x;
        b.y = y;
        return;
      }
    }
  }
}

const ACTION: Act1Rules = {
  gait: STAG9_GAIT,
  acts: STAG9_ACTS,
  spawned(R, m) {
    own(R, m);
  },
  forced(R, m, acts) {
    const a1 = own(R, m);
    if (closeDue(m, a1) >= 0) return acts.findIndex((a) => a.id === 'stag:close');
    if (a1.stareNow) {
      a1.stareNow = 0;
      return acts.findIndex((a) => a.id === 'stag:stare');
    }
    return -1;
  },
  tick(R, m, dt, dist) {
    if (m.state === 'act' || !m.gait) return false;
    const g = R.g;
    const h = g.hero;
    const a1 = own(R, m);
    const gait = m.gait;
    if (gait.mode !== 'walk') {
      // (stood, with nothing to do yet: off again, round the clearing)
      if (gait.mode === 'stand' && closeDue(m, a1) < 0 && !a1.stareNow && m.cd > 0 && gait.t > 0.25) {
        gait.mode = 'walk';
        gait.t = LAND9[0] + 0.01;
        gait.stop = false;
        a1.bound = -1;
        bound9(R, m);
      } else return false;
    }
    const slow = m.chillT > 0 ? 1 - m.chill : 1;
    const before = gait.t;
    const go = dt * slow;
    const p0 = before - Math.floor(before / STOT9.period) * STOT9.period;
    for (const L of LAND9) {
      if (!(p0 < L && p0 + go >= L)) continue;
      // HE LANDS: he may stop here (a close due, a stare, his blow), else his way for the next bound
      a1.bounds = (a1.bounds ?? 0) + 1;
      const sees = g.sees(m.x, m.y, h.x, h.y);
      const stop = (): boolean => {
        gait.mode = 'stand';
        gait.t = 0;
        m.anim = 'idle';
        return false;
      };
      if (closeDue(m, a1) >= 0) return stop();
      if (a1.bounds >= (a1.stareAt ?? 7)) {
        a1.bounds = 0;
        a1.stareAt = 6 + Math.floor(g.rng.next() * 3);
        a1.stareNow = 1;
        return stop();
      }
      if (m.cd <= 0 && sees && dist <= STAG9_ACTS[0].far - 0.1) return stop();
      const ci = STAG9_ACTS.findIndex((a) => a.id === 'stag:charge');
      if (m.cd <= 0 && sees && m.moveCd && m.moveCd[ci] <= 0 && dist >= STAG9_ACTS[ci].near && dist <= STAG9_ACTS[ci].far) return stop();
      bound9(R, m);
    }
    if (m.moveCd) for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt;
    g.slide(m, Math.min(m.r, 0.42), m.fx * STOT9.pace * slow * dt, m.fy * STOT9.pace * slow * dt, g.level.walk, true);
    gait.t = before + go;
    m.anim = 'walk';
    m.state = 'chase';
    return true;
  },
  can(R, m, a, dist) {
    const g = R.g;
    if (a.id === 'stag:charge') {
      // (a clear run toward him, of a good way at least)
      const h = g.hero;
      const fx = (h.x - m.x) / Math.max(0.01, dist);
      const fy = (h.y - m.y) / Math.max(0.01, dist);
      for (let d = 0.4; d <= 3.4; d += 0.3) if (!g.free(g.level.walk, m.x + fx * d, m.y + fy * d, 0.42)) return false;
      return true;
    }
    if (a.id === 'stag:bellow') return called9(R, m) < STAG.bellow.most;
    return true;
  },
  start(R, m, a) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const a1 = own(R, m);
    if (a.id === 'stag:charge') {
      // (where he set off, and how far he may run: to his crash, or where his antlers meet the wall)
      act.x = m.x;
      act.y = m.y;
      const body = runOf(g, m, CHARGE9_CARRIED);
      a1.run = body >= CHARGE9_CARRIED - 0.05 ? CHARGE9_CARRIED : Math.max(0.3, Math.min(CHARGE9_CARRIED, body + 0.42 - ANTLERS));
      a1.ranDown = 0;
      R.peril(m, 'act1', m.x, m.y, { a1: LANE9_PERIL, t: 0, dur: CHARGE9.crash + 0.2, a: m.id, d: a1.run });
    } else if (a.id === 'stag:stare') {
      // (his heavy landing: a ring of dust, knocking whoever is in it)
      if (Math.hypot(h.x - m.x, h.y - m.y) <= STARE.knock && !h.move && !g.over) g.knockHero(m.x, m.y, 0.8);
      g.emit({ t: 'shake', amount: 2 });
      g.sfx('slam', 0.45);
    }
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const a1 = own(R, m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const free = !h.move && h.invuln <= 0 && !g.over;
    switch (a.id) {
      case 'stag:gore': {
        if (at(GORE9.paw[2])) g.sfx('slam', 0.3);
        if (at(GORE9.held)) g.sfx('swing', 0.5);
        if (!at(a.hit)) break;
        // (the sweep before him, GORE9.arc across, from near to its reach)
        const r = R.rel(m);
        const d = Math.hypot(r.fwd, r.left);
        const half = ((GORE9.arc / 2) * Math.PI) / 180;
        if (free && d >= GORE9.near - TUNE.heroRadius && d <= GORE9.reach + TUNE.heroRadius * 0.5 && Math.abs(Math.atan2(r.left, r.fwd)) <= half) {
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, GORE9.knock);
        }
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('slam', 0.6);
        break;
      }
      case 'stag:stare': {
        // (run on over his planted hoofs as he stops)
        const c = stareCarry(t1) - stareCarry(t0);
        if (c > 0) g.slide(m, Math.min(m.r, 0.42), m.fx * c, m.fy * c, g.level.walk, true);
        if (at(STARE.snort)) g.sfx('gust', 0.3);
        break;
      }
      case 'stag:charge': {
        for (const T of [...CHARGE9.paws[0], ...CHARGE9.paws[1]]) if (at(T)) g.sfx('slam', 0.15);
        if (at(CHARGE9_HIT)) g.sfx('bossRoar', 0.6);
        const run = a1.run ?? CHARGE9_CARRIED;
        if (t1 > CHARGE9.strike[0] && t0 < CHARGE9.crash) {
          const c0 = Math.min(charge9Carry(t0), run);
          const c1 = Math.min(charge9Carry(t1), run);
          m.x = act.x + m.fx * c1;
          m.y = act.y + m.fy * c1;
          // (run down as he comes by: once, thrown aside)
          if (!a1.ranDown && free && c1 > c0) {
            const along = (h.x - act.x) * m.fx + (h.y - act.y) * m.fy;
            const aside = -(h.x - act.x) * m.fy + (h.y - act.y) * m.fx;
            if (Math.abs(aside) <= CHARGE9.half + TUNE.heroRadius * 0.5 && along >= c0 - 0.4 && along <= c1 + ANTLERS) {
              a1.ranDown = 1;
              R.blow(m, a.dmg);
              const s = aside >= 0 ? 1 : -1;
              g.knockHero(act.x + m.fx * along + m.fy * s * 0.05, act.y + m.fy * along - m.fx * s * 0.05, CHARGE9.knock);
            }
          }
          if (Math.floor(t1 * 3.3) !== Math.floor(t0 * 3.3)) g.emit({ t: 'shake', amount: 1 });
          // (cut short where his antlers meet the wall: the crash plays here)
          if (run < CHARGE9_CARRIED - 0.05 && c1 >= run - 1e-6 && t1 < CHARGE9.crash - 0.02) act.t = CHARGE9.crash - 0.01;
        }
        if (!at(CHARGE9.crash)) break;
        // THE CRASH: whoever is before his antlers; the wall there splinters; a pine there splinters
        const r = R.rel(m);
        if (!a1.ranDown && free && r.fwd > -0.2 && r.fwd <= ANTLERS + 0.6 && Math.abs(r.left) <= CHARGE9.half) {
          a1.ranDown = 1;
          R.blow(m, a.dmg);
          g.knockHero(m.x, m.y, CHARGE9.knock);
        }
        const wall = wallOf(g, m);
        const ax = m.x + m.fx * ANTLERS;
        const ay = m.y + m.fy * ANTLERS;
        if (wall && !insideClearing(ax, ay, a1.cx, a1.cy, a1.k, 0, 0.3)) {
          wall.fx = Math.atan2((ay - a1.cy) / CLEARING.ry, (ax - a1.cx) / CLEARING.rx);
          wall.fy = wall.t;
        }
        for (const p of g.level.props) {
          if (p.kind !== 'piece' || !p.name || !STAG.charge.pines.includes(p.name)) continue;
          const q = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, p.x, p.y);
          if (q.fwd < 0.2 || q.fwd > STAG.charge.splinter || Math.abs(q.left) > 1.1) continue;
          p.name = STAG.charge.stump;
          g.emit({ t: 'spark', x: p.x, y: p.y, el: 'phys', n: 14 });
        }
        g.emit({ t: 'shake', amount: 6 });
        g.sfx('slam', 1);
        g.sfx('hit', 0.8);
        break;
      }
      case 'stag:close': {
        if (at(CLOSE.roar)) {
          g.sfx('bossRoar', 1);
          g.emit({ t: 'shake', amount: 2 });
        }
        if (!at(a.hit)) break;
        // THE WALL BURSTS UP round the new edge, and stays
        const s = closeDue(m, a1);
        if (s < 0) break;
        a1.stage = s + 1;
        const k = CLOSE.stages[s + 1];
        const was = a1.k;
        a1.k = k;
        const from = Math.atan2(h.y - a1.cy, h.x - a1.cx);
        let wall = wallOf(g, m);
        if (!wall) wall = R.peril(m, 'act1', a1.cx, a1.cy, { a1: WALL_PERIL, dur: 1e9, hit: 1e9, a: m.id, fx: 0, fy: -1 });
        wall.d = Math.atan2(Math.sin(from) / CLEARING.ry, Math.cos(from) / CLEARING.rx);
        wall.b = was;
        wall.c = k;
        wall.hit = wall.t;
        wall.fy = -1;
        g.level.fence = fenceOf(a1.cx, a1.cy, k);
        // (whoever it catches, in its band or outside it: struck, and thrown in)
        const inH = thrownIn(h.x - a1.cx, h.y - a1.cy, k);
        if (inH && outOf(h.x - a1.cx, h.y - a1.cy, 1) < 1.25) {
          if (!g.over) R.blow(m, a.dmg);
          putIn(g, h, [a1.cx + inH[0], a1.cy + inH[1]], TUNE.heroRadius);
        }
        for (const o of g.monsters) {
          if (o.dead || o === m || outOf(o.x - a1.cx, o.y - a1.cy, 1) >= 1.25) continue;
          const t = thrownIn(o.x - a1.cx, o.y - a1.cy, k);
          if (t) putIn(g, o, [a1.cx + t[0], a1.cy + t[1]], Math.min(o.r, 0.42));
        }
        // (and he himself, should he stand in it)
        const tm = thrownIn(m.x - a1.cx, m.y - a1.cy, k);
        if (tm) putIn(g, m, [a1.cx + tm[0], a1.cy + tm[1]], Math.min(m.r, 0.42));
        g.emit({ t: 'shake', amount: 7 });
        g.sfx('slam', 1);
        g.sfx('explode', 0.6);
        break;
      }
      case 'stag:bellow': {
        const B = STAG.bellow;
        if (at(B.roar)) {
          g.sfx('bossRoar', 1);
          g.emit({ t: 'shake', amount: 3 });
        }
        if (at(B.call)) {
          const n = callWolves9(R, m);
          g.msg(n > 0 ? `${m.name} bellows: ${answers() === 'wolf' ? 'wolves answer' : 'the cult answers'} from the fog` : `${m.name} bellows`, MSG.foe);
        }
        break;
      }
      default:
        break;
    }
  },
  end(R, m, a) {
    // (off again from where the act left him)
    if (a.id === 'stag:stare' || a.id === 'stag:gore' || a.id === 'stag:charge' || a.id === 'stag:close') {
      const a1 = own(R, m);
      a1.bound = -1;
    }
  },
  died(R, m) {
    // (the wood lets go: the wall sinks away, the fence is gone)
    const g = R.g;
    g.level.fence = null;
    const wall = wallOf(g, m);
    if (wall) {
      wall.b = wall.c || 1;
      wall.c = 1;
      wall.hit = wall.t - (WALL.rise + WALL.ripple + WALL_SINK_AFTER);
      wall.dur = wall.t + WALL.rise + WALL.ripple + WALL_SINK_AFTER + WALL.sink + 0.2;
    }
  },
};
/** The wall inside sinks this long after the new one is all up (seconds). */
export const WALL_SINK_AFTER = 0.3;

/** THE WOLVES ANSWER FROM THE FOG, inside the clearing as it is now. */
function callWolves9(R: BossRules, m: Monster): number {
  const g = R.g;
  const h = g.hero;
  const B = STAG.bellow;
  const a1 = own(R, m);
  const want = Math.max(0, Math.min(m.life < m.maxLife / 2 ? B.more : B.n, B.most - called9(R, m)));
  const kind = answers();
  const spots: { x: number; y: number }[] = [];
  for (let tries = 0; tries < 200 && spots.length < want; tries++) {
    const a = g.rng.range(0, Math.PI * 2);
    const d = g.rng.range(Math.min(B.near, 3), B.far);
    const x = h.x + Math.cos(a) * d;
    const y = h.y + Math.sin(a) * d;
    if (!insideClearing(x, y, a1.cx, a1.cy, a1.k, 0.36, 0.3) || !g.free(g.level.walk, x, y, 0.36) || spots.some((q) => Math.hypot(q.x - x, q.y - y) < 1.5)) continue;
    spots.push({ x, y });
  }
  for (const s of spots) {
    const w = g.spawn(kind, s.x, s.y, m.packId, 0, false, g.rng);
    w.state = 'chase';
    w.cd = g.rng.range(0.4, 0.9);
    w.xp = 0;
    w.a1 = { ...(w.a1 ?? {}), stagCalled: 1 };
    const dx = h.x - s.x;
    const dy = h.y - s.y;
    const dd = Math.hypot(dx, dy) || 1;
    w.fx = dx / dd;
    w.fy = dy / dd;
  }
  return spots.length;
}

const pick = (): Act1Rules => (STAG_ACTION.on ? ACTION : OLD);
export const RULES: Act1Rules | null = {
  get gait() {
    return pick().gait;
  },
  get acts() {
    return pick().acts;
  },
  spawned: (R, m) => pick().spawned?.(R, m),
  forced: (R, m, acts) => pick().forced?.(R, m, acts) ?? -1,
  tick: (R, m, dt, dist) => pick().tick?.(R, m, dt, dist) ?? false,
  can: (R, m, a, dist, los) => pick().can?.(R, m, a, dist, los) ?? true,
  start: (R, m, a) => pick().start?.(R, m, a),
  acting: (R, m, a, t0, t1, dt) => pick().acting(R, m, a, t0, t1, dt),
  end: (R, m, a) => pick().end?.(R, m, a),
  died: (R, m) => pick().died?.(R, m),
  peril: (R, p, dt) => pick().peril?.(R, p, dt),
};
