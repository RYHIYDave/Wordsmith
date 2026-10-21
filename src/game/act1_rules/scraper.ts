// ACT 2, THE HUSH: FLOOR 13'S DOUBLE BOSS, ITS FIRST HALF: THE SCRAPER (the Millrace; its floor "The Pulping Floor"): its
// rules (game/act1_rules/types.ts). What the two share, his words, and the combo: game/act1_rules/pair.ts.
//
// The art chat's pictures (art/scraper.ts; what it does to the floor, art/pair_shots.ts; docs/mockups/act2_pair/README.md),
// each with his yes. A giant crayfish of sodden pages, about four tiles from its claws to its tail fan. It scuttles after
// the hero (1.0 tiles a second, as its walk is painted) and makes its three, and its half of the combo:
// - CLAW SNAP, its basic blow: its left claw drawn back high and wide (a ring closing on where it will snap: its warning);
//   it lunges and the claw snaps shut: whoever is within SNAP_R (1.15 tiles) of SNAP_AT (3.4 tiles before it, 0.3 to its
//   right) is struck.
// - THE SCOUR: it rears, both claws high and wide (the whole fan before it marked: its warning), slams them down at the
//   fan's two edges and drags them in to its middle: whoever is in the fan (4.0 tiles out, 82 degrees either side) is struck
//   as a claw comes across him, harder than the snap.
// - THE BACKWARD RUSH, at one behind it or who has got round it: it turns its tail on him (the lane behind it marked: its
//   warning), its tail snaps under it and it shoots back 5 tiles down the lane: whoever is in the lane (7.4 tiles back,
//   1.3 either side) as it goes is struck and thrown aside. Made only where the lane is floor all the way.
// - ITS HALF OF THE PALIMPSEST (game/act1_rules/pair.ts): it slams both claws down and scrapes the strip bare before it;
//   the strip bursts after the Quill has written it.
// ITS LINE as the hero comes into its ground: no mouth, the clack of its claws (game/defs.ts BOSS_LINES).
//
// Every number here that is a picture's is the art's own, imported from it; tests/pair_rules.test.ts holds the rest.

import { RUSH_HALF, RUSH_LANE, RUSH_WAKE_FOR, SCOUR_FOR, SCOUR_HALF, SCOUR_REACH, SNAP_AT, SNAP_FOR, SNAP_R, STRIP_BURST_AFTER, STRIP_BURST_FOR, STRIP_FROM, STRIP_HALF, STRIP_TILES } from '../../art/pair_shots';
import { QL_SWOOP } from '../../art/quill';
import { RUSH_TILES, SR_PACE, SR_RUSH, SR_SCOUR, SR_SNAP, SR_STRIP } from '../../art/scraper';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG, TUNE } from '../defs';
import type { Monster, Peril } from '../state';
import { PAIR_TUNE, STRIP_TIMES, ahead, burstReaches, free, partnerOf, relOf, writtenAt } from './pair';
import type { Act1Rules } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

/** Its scuttle: 12 frames at 12 a second, painted for SR_PACE tiles a second; it stops a little short of where its claw snaps. */
export const SR_GAIT: GaitDef = { pace: SR_PACE, cycle: 1 / 12, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 3.2, slack: 0.7, trueBack: true };

/** Its acts: its basic blow first, its biggest last (the biggest ready that the hero is in reach of is made). Its strip comes only when the pair makes the combo. */
export const SR_ACTS: readonly ActDef[] = [
  { id: 'scraper:snap', clip: 'attack', long: SR_SNAP.long, hit: SR_SNAP.hit, dmg: 1, cooldown: 0, first: 0, after: 0.55, near: 0, far: SNAP_AT.ahead + 0.6 },
  { id: 'scraper:rush', clip: 'rush', long: SR_RUSH.long, hit: SR_RUSH.go, dmg: 1.3, cooldown: 11, first: 8, after: 0.6, near: 1.2, far: 6.5 },
  { id: 'scraper:scour', clip: 'scour', long: SR_SCOUR.long, hit: SR_SCOUR.slam, dmg: 1.4, cooldown: 8, first: 4, after: 0.7, near: 0, far: SCOUR_REACH - 0.3 },
  { id: 'scraper:strip', clip: 'strip', long: SR_STRIP.long, hit: SR_STRIP.slam, dmg: PAIR_TUNE.combo.dmg, cooldown: 0, first: 0, after: 0.6, near: 0, far: 99, forced: true },
];
const SNAP = 0;
const RUSH = 1;
const SCOUR = 2;
const STRIP = 3;

/**
 * What it keeps (Monster.a1): `combo` its next combo's clock (seconds till it may be made), `heal` the Overwrite's; `plan` 1
 * while the combo is under way (the Quill on its way to the strip's far end), with its line `ux`, `uy` and how long it has
 * waited `waited`; `written` 1 while the Quill writes over it (it holds its ground); `struck` its reel's clock as last seen.
 */
export function keptOf(m: Monster): Record<string, number> {
  return (m.a1 ??= { combo: PAIR_TUNE.combo.first, heal: PAIR_TUNE.overwrite.first, plan: 0, ux: 1, uy: 0, waited: 0, written: 0 });
}

/** Is the floor walkable at (x, y)? */
function walkable(R: BossRules, x: number, y: number): boolean {
  const L = R.g.level;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return tx >= 0 && ty >= 0 && tx < L.floor.w && ty < L.floor.h && L.walk[ty * L.floor.w + tx] === 1;
}

/** How much room a body of theirs needs where it is carried or set down (the game moves every body by so much: Game.slide). */
const ROOM = 0.42;

/** Is the floor walkable all the way from `from` to `to` tiles along (ux, uy) from (x, y), every quarter tile, with room for a body (`room`) where `room` is given? */
function clearAlong(R: BossRules, x: number, y: number, ux: number, uy: number, from: number, to: number, room = 0): boolean {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  for (let d = lo; d <= hi + 1e-6; d += 0.25) {
    const px = x + ux * d;
    const py = y + uy * d;
    if (room > 0 ? !R.g.free(R.g.level.walk, px, py, room) : !walkable(R, px, py)) return false;
  }
  return true;
}

/** The rush's way back: floor all the way, and room to stand where it stops. */
function rushClear(R: BossRules, m: Monster): boolean {
  const h = R.g.hero;
  const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
  // (it turns its tail on him: its back to him, and back it goes, toward him)
  const ux = (h.x - m.x) / d;
  const uy = (h.y - m.y) / d;
  return clearAlong(R, m.x, m.y, ux, uy, 0.25, RUSH_TILES, ROOM);
}

/**
 * THE PALIMPSEST'S LINE, if the floor lets them make it now: the way from the Scraper along which the strip lies (toward the
 * hero, or near it), where the Quill can stand at its far end and swoop all the way down. Null: nowhere.
 */
export function comboLine(R: BossRules, m: Monster): { ux: number; uy: number } | null {
  const h = R.g.hero;
  const C = PAIR_TUNE.combo;
  const d = Math.hypot(h.x - m.x, h.y - m.y);
  if (d < C.near || d > C.far) return null;
  const a0 = Math.atan2(h.y - m.y, h.x - m.x);
  // (the nearest the way to him first, then either side of it, as far as `turn`)
  for (let n = 0; n <= Math.round(C.turn / 0.15); n++) {
    for (const sgn of n === 0 ? [1] : [1, -1]) {
      const da = sgn * n * 0.15;
      const ux = Math.cos(a0 + da);
      const uy = Math.sin(a0 + da);
      // (the strip, the Quill's way down it with room for its body, and room for it to stand at its far end)
      if (!clearAlong(R, m.x, m.y, ux, uy, STRIP_FROM, STRIP_FROM + STRIP_TILES)) continue;
      if (!clearAlong(R, m.x, m.y, ux, uy, STRIP_FROM + 0.4, C.stand, ROOM)) continue;
      return { ux, uy };
    }
  }
  return null;
}

/** The Quill's half of the combo is to begin (pair.ts): the Scraper's strip `combo.start` in. */
export function swoopDue(m: Monster): boolean {
  return !!m.act && m.act.id === 'scraper:strip' && m.act.t >= PAIR_TUNE.combo.start;
}

/** Its strip on the floor (peril 'scraper:strip'), if one lies there now. */
export function stripOf(R: BossRules, m: Monster): Peril | null {
  return R.g.perils.find((p) => p.kind === 'act1' && p.a1 === 'scraper:strip' && p.from === m.name && p.done < 2) ?? null;
}

/** It holds its ground now (the combo under way, or written over by the Quill): it strikes from where it stands, and goes nowhere. */
function holds(m: Monster): boolean {
  const k = keptOf(m);
  return k.plan === 1 || k.written === 1;
}

/** What it strikes from where it stands, holding its ground: the biggest ready that he is in reach of, but the rush, which would carry it off. */
function strikeInPlace(R: BossRules, m: Monster, dist: number): boolean {
  const g = R.g;
  const h = g.hero;
  if (m.cd > 0 || !g.sees(m.x, m.y, h.x, h.y)) return false;
  for (const i of [SCOUR, SNAP]) {
    const a = SR_ACTS[i];
    if ((m.moveCd && m.moveCd[i] > 0) || dist < a.near || dist > a.far) continue;
    R.startAct(m, SR_ACTS, i);
    return true;
  }
  return false;
}

/** Is the hero struck by a blow on the floor from (x, y) facing (ux, uy): within the box `f0` to `f1` ahead and `half` either side? */
function inBox(R: BossRules, x: number, y: number, ux: number, uy: number, f0: number, f1: number, half: number): boolean {
  const h = R.g.hero;
  const r = relOf(x, y, ux, uy, h.x, h.y);
  const e = TUNE.heroRadius * 0.5;
  return r.f >= Math.min(f0, f1) - e && r.f <= Math.max(f0, f1) + e && Math.abs(r.s) <= half + e;
}

/** Can the hero be struck now (not rolling through, not leaping, not already fallen)? */
function open(R: BossRules): boolean {
  const h = R.g.hero;
  return h.invuln <= 0 && !h.move && !R.g.over;
}

export const RULES: Act1Rules | null = {
  gait: SR_GAIT,
  acts: SR_ACTS,

  spawned(_R, m) {
    keptOf(m);
  },

  tick(R, m, dt, dist) {
    const g = R.g;
    const k = keptOf(m);
    const q = partnerOf(g, m);
    k.combo -= dt;
    k.heal -= dt;
    // (alone, there is nothing to plan, and nobody to write over it)
    if (!q) {
      k.plan = 0;
      k.written = 0;
    }
    // THE COMBO UNDER WAY: it waits for the Quill to land at the strip's far end, then makes its strip along the line
    if (k.plan === 1 && m.state !== 'act') {
      k.waited += dt;
      const qk = q ? q.a1 : undefined;
      if (!q || !qk || k.waited > PAIR_TUNE.combo.wait) {
        k.plan = 0;
        if (qk) qk.mode = 0;
      } else if (qk.mode === 4) {
        // (the Quill is there, facing back down the line: the strip, along it)
        R.startAct(m, SR_ACTS, STRIP);
        return true;
      }
    }
    // THE PAIR'S MOMENTS, made by the Scraper (it is the one the floor holds as its boss): the combo, or the Quill sent to write over it
    if (q && free(m) && k.plan === 0 && k.written === 0 && q.a1 && q.a1.mode === 0 && free(q)) {
      if (k.combo <= 0) {
        const line = comboLine(R, m);
        if (line) {
          k.plan = 1;
          k.waited = 0;
          k.ux = line.ux;
          k.uy = line.uy;
          k.combo = PAIR_TUNE.combo.every;
          // (the Quill flies to the strip's far end, to stand facing back down it)
          const at = ahead(m.x, m.y, line.ux, line.uy, PAIR_TUNE.combo.stand);
          sendQuill(q, at.x, at.y, -line.ux, -line.uy, 3);
        } else k.combo = 2;
      } else if (k.heal <= 0 && m.life < m.maxLife * PAIR_TUNE.overwrite.below) {
        // (the Quill flies to stand beside it, facing it, and writes over its wounds)
        const side = writeSpot(R, m, q);
        if (side) {
          k.heal = PAIR_TUNE.overwrite.every;
          sendQuill(q, side.x, side.y, side.fx, side.fy, 2);
          g.msg(`${q.name} comes to write over ${m.name}'s wounds`, MSG.foe);
        } else k.heal = 2;
      }
    }
    // HOLDING ITS GROUND: it strikes from where it stands, and goes nowhere
    if (holds(m) && m.state !== 'act') {
      m.state = 'chase';
      m.anim = 'idle';
      if (!m.gait || m.gait.mode !== 'stand') m.gait = { mode: 'stand', t: 0 };
      m.gait.t += dt;
      const h = g.hero;
      if (dist > 0.01 && k.plan !== 1) {
        m.fx = (h.x - m.x) / dist;
        m.fy = (h.y - m.y) / dist;
      }
      strikeInPlace(R, m, dist);
      return true;
    }
    return false;
  },

  can(R, m, a) {
    if (a.id === 'scraper:rush') return !holds(m) && rushClear(R, m);
    return true;
  },

  start(R, m, a) {
    const g = R.g;
    const k = keptOf(m);
    const act = m.act!;
    act.a = 0;
    act.b = 0;
    if (a.id === 'scraper:rush') {
      // (its tail on him: it faces away from him, and goes back toward him)
      m.fx = -m.fx;
      m.fy = -m.fy;
      act.x = m.x;
      act.y = m.y;
      g.sfx('gust', 0.4);
    } else if (a.id === 'scraper:strip') {
      // (along the line the Quill waits at the end of)
      m.fx = k.ux;
      m.fy = k.uy;
      act.x = m.x;
      act.y = m.y;
      g.msg(`${m.name} scrapes a strip bare`, MSG.foe);
    }
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    switch (a.id) {
      case 'scraper:snap': {
        if (!at(a.hit)) break;
        // THE SNAP: whoever is in its mark is struck
        const c = ahead(m.x, m.y, m.fx, m.fy, SNAP_AT.ahead, SNAP_AT.left);
        const h = g.hero;
        if (open(R) && Math.hypot(h.x - c.x, h.y - c.y) <= SNAP_R + TUNE.heroRadius * 0.5) R.blow(m, a.dmg);
        R.peril(m, 'act1', m.x, m.y, { a1: 'scraper:snap', dur: SNAP_FOR, fx: m.fx, fy: m.fy });
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('slam', 0.7);
        break;
      }
      case 'scraper:scour': {
        if (at(SR_SCOUR.slam)) {
          R.peril(m, 'act1', m.x, m.y, { a1: 'scraper:scour', dur: SCOUR_FOR, fx: m.fx, fy: m.fy });
          g.emit({ t: 'shake', amount: 4 });
          g.sfx('slam', 0.9);
        }
        if (t1 < SR_SCOUR.sweep[0] || act.a) break;
        // THE SWEEP: its claws come in from the fan's edges to its middle; whoever is in the fan is struck as a claw comes across him
        const h = g.hero;
        const r = relOf(m.x, m.y, m.fx, m.fy, h.x, h.y);
        const d = Math.hypot(r.f, r.s);
        if (d > SCOUR_REACH + TUNE.heroRadius * 0.5) break;
        const half = (SCOUR_HALF * Math.PI) / 180;
        const angle = Math.abs(Math.atan2(r.s, r.f));
        if (angle > half + 0.05) break;
        const claw = half * (1 - sm((t1 - SR_SCOUR.sweep[0]) / (SR_SCOUR.sweep[1] - SR_SCOUR.sweep[0])));
        if (angle + 0.02 >= claw && open(R)) {
          act.a = 1;
          R.blow(m, a.dmg);
          g.sfx('hit', 0.5);
        }
        break;
      }
      case 'scraper:rush': {
        if (at(SR_RUSH.flip)) g.sfx('swing', 1);
        // (its wake: the floor ploughed up along the lane behind it, from where it set off)
        if (at(SR_RUSH.go)) R.peril(m, 'act1', act.x, act.y, { a1: 'scraper:rush', dur: RUSH_WAKE_FOR + 0.5, fx: m.fx, fy: m.fy, a: RUSH_TILES });
        if (t1 <= SR_RUSH.go || t0 >= SR_RUSH.stop) break;
        // CARRIED BACK down its lane, as its picture shoots back
        const b = (t: number): number => RUSH_TILES * sm((Math.min(t, SR_RUSH.stop) - SR_RUSH.go) / (SR_RUSH.stop - SR_RUSH.go));
        const step = b(t1) - b(Math.max(t0, SR_RUSH.go));
        const nx = m.x - m.fx * step;
        const ny = m.y - m.fy * step;
        if (g.free(g.level.walk, nx, ny, ROOM)) {
          m.x = nx;
          m.y = ny;
        }
        // WHOEVER IS IN ITS LANE as it goes is struck, and thrown aside
        if (!act.a && open(R) && inBox(R, act.x, act.y, -m.fx, -m.fy, 0, RUSH_LANE, RUSH_HALF)) {
          act.a = 1;
          R.blow(m, a.dmg);
          const h = g.hero;
          const r = relOf(act.x, act.y, m.fx, m.fy, h.x, h.y);
          const side = ahead(h.x, h.y, m.fx, m.fy, 0, r.s >= 0 ? -1 : 1);
          g.knockHero(side.x, side.y, 0.9);
          g.emit({ t: 'shake', amount: 4 });
        }
        break;
      }
      case 'scraper:strip': {
        if (!at(SR_STRIP.slam)) break;
        // THE STRIP, scraped bare before it: it lies for the Quill to write (pair.ts STRIP_TIMES), and bursts after it
        keptOf(m).plan = 0;
        R.peril(m, 'act1', act.x, act.y, { a1: 'scraper:strip', dur: STRIP_TIMES.gone, fx: m.fx, fy: m.fy, dmg: g.rollMonsterDmg(m) * a.dmg, a: 0, b: 0, c: 0, d: 0, hit: 0, done: 0 });
        g.emit({ t: 'shake', amount: 5 });
        g.sfx('slam', 1);
        break;
      }
      default:
        break;
    }
  },

  end(_R, m, a) {
    if (a.id === 'scraper:strip') keptOf(m).plan = 0;
  },

  peril(R, p, dt) {
    void dt;
    if (p.a1 !== 'scraper:strip') return;
    const g = R.g;
    // THE STRIP: `d` 1 once the Quill has set off down it, `a` the moment it did (the strip's clock), `b` how much of it is
    // written (0 to 1); `done` 0 lying, 1 bursting (from `c`), 2 fading without bursting (the Quill felled before it had
    // written it, or never coming); `hit` 1 once the burst has struck
    const m = g.monsters.find((o) => !o.dead && o.kind === 'scraper' && o.name === p.from) ?? null;
    const q = m ? partnerOf(g, m) : null;
    if (p.done === 0) {
      const swooping = !!q && !!q.act && q.act.id === 'quill:swoop';
      if (!p.d && swooping) {
        p.d = 1;
        p.a = p.t - q!.act!.t;
      }
      if (p.d && swooping) p.b = writtenAt(p.t - p.a);
      // (written to its near end: it bursts after; the Quill felled before that, or never coming, it lies and fades)
      if (p.d && p.b >= 1 && p.t - p.a >= QL_SWOOP.stop + STRIP_BURST_AFTER) {
        p.done = 1;
        p.c = p.t;
        g.sfx('slam', 0.9);
        g.emit({ t: 'shake', amount: 5 });
      } else if (p.b < 1 && (!q || (p.d && !swooping) || (!p.d && p.t > STRIP_TIMES.swoopFrom + 1.5))) {
        p.done = 2;
        p.c = p.t;
        p.dur = Math.min(p.dur, p.t + 1.2);
      }
      return;
    }
    if (p.done !== 1 || p.hit) return;
    // THE BURST runs along it from its far end: whoever is on it as it passes him is struck
    const h = g.hero;
    const r = relOf(p.x, p.y, p.fx, p.fy, h.x, h.y);
    const e = TUNE.heroRadius * 0.5;
    if (r.f < STRIP_FROM - e || r.f > STRIP_FROM + STRIP_TILES + e || Math.abs(r.s) > STRIP_HALF + e) return;
    const since = p.t - p.c;
    const when = burstReaches(Math.max(STRIP_FROM, Math.min(STRIP_FROM + STRIP_TILES, r.f)));
    if (since >= when && since <= when + STRIP_BURST_FOR && open(R)) {
      p.hit = 1;
      g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
      g.knockHero(h.x - p.fx, h.y - p.fy, 0.5);
    }
  },

  died(R, m) {
    // (what it scraped lies and fades without bursting)
    for (const p of R.g.perils) {
      if (p.kind !== 'act1' || p.from !== m.name || p.a1 !== 'scraper:strip' || p.done !== 0) continue;
      p.done = 2;
      p.dur = Math.min(p.dur, p.t + 1.2);
    }
  },
};

/** Where the Quill stands to write over the Scraper: WRITE_AT.ahead from its middle, on the side nearer the Quill if it can, facing it. */
function writeSpot(R: BossRules, m: Monster, q: Monster): { x: number; y: number; fx: number; fy: number } | null {
  const a0 = Math.atan2(q.y - m.y, q.x - m.x);
  const D = 1.85;
  for (const da of [0, 0.6, -0.6, 1.2, -1.2, Math.PI]) {
    const x = m.x + Math.cos(a0 + da) * D;
    const y = m.y + Math.sin(a0 + da) * D;
    if (!R.g.free(R.g.level.walk, x, y, 0.35)) continue;
    return { x, y, fx: (m.x - x) / D, fy: (m.y - y) / D };
  }
  return null;
}

/** The Quill is sent: it flies to (x, y) and lands there facing (fx, fy), to do `what` (2 write over the Scraper, 3 wait at the strip's far end): game/act1_rules/quill.ts. */
function sendQuill(q: Monster, x: number, y: number, fx: number, fy: number, what: number): void {
  const k = q.a1!;
  k.mode = 1;
  k.what = what;
  k.tx = x;
  k.ty = y;
  k.tfx = fx;
  k.tfy = fy;
}
