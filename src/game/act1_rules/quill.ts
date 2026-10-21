// ACT 2, THE HUSH: FLOOR 13'S DOUBLE BOSS, ITS SECOND HALF: THE QUILL (the Millrace; "The Pulping Floor"): its rules
// (game/act1_rules/types.ts). What the two share, his words, the combo and the Overwrite: game/act1_rules/pair.ts.
//
// The art chat's pictures (art/quill.ts; what it does to the floor, art/pair_shots.ts), each with his yes. A great heron of
// white pages, its beak a steel pen nib. It wades after the hero (1.1 tiles a second, as its walk is painted) and makes
// its two, and its half of the pair's two:
// - THE NIB STAB, its basic blow: its neck drawn back into an S, the nib glinting (a ring closing on where it will go in:
//   its warning), then shot out and the nib stabbed into the floor: whoever is within STAB_R (1.05 tiles) of STAB_AT (2.4
//   tiles before it) is struck.
// - INK LINES: reared up, it whips its neck across before it three times, writing three lines of the Order's ink across
//   the floor (LINES_AT 1.8, 3.3 and 4.8 tiles before it, each 5.2 long and 0.45 either side); each lies wet and burning
//   pink (its warning) and bursts LINE_BURST_AFTER its stroke: whoever is on a line as it bursts is struck.
// - OVERWRITE (pair.ts): it takes off, flies to the Scraper, lands beside it facing it and writes over its wounds, healing
//   it while it writes; a blow on it stops it, and so does the Scraper burning.
// - ITS HALF OF THE PALIMPSEST (pair.ts): it flies to the far end of the strip and waits there, facing back down it; as
//   the Scraper's strip runs out it swoops down it, carried SWOOP_TILES, its nib writing it, and lands short of the Scraper.
// IT IS STRUCK WHEREVER IT IS, in the air too (his word on the vultures, 20 Oct, 21:31 Pacific: “Oh the vultures being
// unhittable in the air has to go.  It’s infuriating to fight them”); in the air, or skimming down the strip, it is not
// brought below the last of its life (its death is painted from the floor): the next blow after it lands fells it.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG, TUNE } from '../defs';
import type { Monster } from '../state';
import { LINE_BURST_AFTER, LINE_BURST_FOR, LINE_HALF, LINE_LONG, LINE_STAIN_FOR, LINE_STROKE, LINES_AT, PAIR_TUNE, QL_LAND, QL_LINES, QL_PACE, QL_STAB, QL_SWOOP, QL_TAKEOFF, STAB_AT, STAB_FOR, STAB_R, SWOOP_TILES, WRITE_AT, ahead, partnerOf, relOf } from './pair';
import { keptOf as scraperKept, swoopDue } from './scraper';
import type { Act1Rules } from './types';

/** Its wade: 12 frames at 8 a second, painted for QL_PACE tiles a second; it stops at any frame of it, a little short of where its nib reaches. */
export const QL_GAIT: GaitDef = { pace: QL_PACE, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.5, slack: 0.6, trueBack: true };

/** Its acts: its basic blow first, then its ink lines; the rest come only as the pair has them (forced). */
export const QL_ACTS: readonly ActDef[] = [
  { id: 'quill:stab', clip: 'attack', long: QL_STAB.long, hit: QL_STAB.hit, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: STAB_AT + 0.8 },
  { id: 'quill:lines', clip: 'lines', long: QL_LINES.long, hit: QL_LINES.strokes[0][0], dmg: 0.9, cooldown: 9, first: 5, after: 0.6, near: 1.0, far: LINES_AT[2] + 0.8 },
  { id: 'quill:takeoff', clip: 'takeoff', long: QL_TAKEOFF.long, hit: QL_TAKEOFF.spring, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'quill:fly', clip: 'fly', long: 60, hit: 0, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'quill:land', clip: 'land', long: QL_LAND.long, hit: QL_LAND.down, dmg: 0, cooldown: 0, first: 0, after: 0.3, near: 0, far: 99, forced: true },
  { id: 'quill:write', clip: 'write', long: 60, hit: 0, dmg: 0, cooldown: 0, first: 0, after: 0.4, near: 0, far: 99, forced: true },
  { id: 'quill:swoop', clip: 'swoop', long: QL_SWOOP.long, hit: QL_SWOOP.go, dmg: 0, cooldown: 0, first: 0, after: 0.5, near: 0, far: 99, forced: true },
];
const TAKEOFF = 2;
const FLY = 3;
const LAND = 4;
const WRITE = 5;
const SWOOP = 6;

/** Its moments with the Scraper (Monster.a1.mode): free to fight, on its way (taking off, flying, landing), writing over the Scraper, waiting at the strip's far end, swooping down it. */
export const QMODE = { free: 0, going: 1, writing: 2, waiting: 4, swooping: 5 } as const;

/**
 * What it keeps (Monster.a1): `mode` (QMODE); where it is sent, `tx`, `ty`, the way it is to face there, `tfx`, `tfy`, and
 * what for, `what` (2 to write over the Scraper, 3 to wait at the strip's far end), and sent to the Scraper, where that is
 * from it, `ox`, `oy` (followed as it flies); `wrote` how long it has written; `told`
 * the last whole second it said it heals.
 */
export function keptOf(m: Monster): Record<string, number> {
  return (m.a1 ??= { mode: 0, what: 0, tx: 0, ty: 0, tfx: 1, tfy: 0, ox: 0, oy: 0, wrote: 0, told: -1 });
}

/** Is it in the air, or skimming down the strip (its death is painted from the floor: it is held at the last of its life)? */
export function aloft(m: Monster): boolean {
  const id = m.act && m.state === 'act' ? m.act.id : '';
  return id === 'quill:takeoff' || id === 'quill:fly' || id === 'quill:land' || id === 'quill:swoop';
}

/** Can the hero be struck now (not rolling through, not leaping, not already fallen)? */
function open(R: BossRules): boolean {
  const h = R.g.hero;
  return h.invuln <= 0 && !h.move && !R.g.over;
}

/** It stops writing over the Scraper (struck, the writing burned, the Scraper gone, or written long enough). */
function stopWriting(R: BossRules, m: Monster, why: string): void {
  const k = keptOf(m);
  k.mode = QMODE.free;
  const s = partnerOf(R.g, m);
  if (s) scraperKept(s).written = 0;
  if (why) R.g.msg(why, MSG.foe);
  R.breakOff(m);
}

/** Is the hero on ink line `i` of the Quill at (x, y) facing (ux, uy), as the art lays it (a little slanted)? */
export function onLine(x: number, y: number, ux: number, uy: number, i: number, hx: number, hy: number): boolean {
  const r = relOf(x, y, ux, uy, hx, hy);
  const half = LINE_LONG / 2;
  const slant = 0.25 * (i - 1);
  const e = TUNE.heroRadius * 0.5;
  if (Math.abs(r.s) > half + e) return false;
  const mid = LINES_AT[i] + (slant * Math.max(-half, Math.min(half, r.s))) / half;
  return Math.abs(r.f - mid) <= LINE_HALF + e;
}

export const RULES: Act1Rules | null = {
  gait: QL_GAIT,
  acts: QL_ACTS,

  spawned(_R, m) {
    keptOf(m);
  },

  tick(R, m, dt) {
    const k = keptOf(m);
    if (m.state === 'act') return false;
    const s = partnerOf(R.g, m);
    // SENT: it takes off, toward where it is going
    if (k.mode === QMODE.going) {
      R.startAct(m, QL_ACTS, TAKEOFF);
      return true;
    }
    // WAITING AT THE STRIP'S FAR END, facing back down it: it swoops as the Scraper's strip runs out
    if (k.mode === QMODE.waiting) {
      if (!s || (scraperKept(s).plan !== 1 && !(s.act && s.act.id === 'scraper:strip'))) {
        k.mode = QMODE.free;
        return false;
      }
      if (swoopDue(s)) {
        k.mode = QMODE.swooping;
        R.startAct(m, QL_ACTS, SWOOP);
        return true;
      }
      m.state = 'chase';
      m.anim = 'idle';
      m.fx = k.tfx;
      m.fy = k.tfy;
      if (!m.gait || m.gait.mode !== 'stand') m.gait = { mode: 'stand', t: 0 };
      m.gait.t += dt;
      return true;
    }
    // (out of whatever it was making: free again)
    if (k.mode !== QMODE.free) {
      if ((k.mode === QMODE.writing || k.what === 2) && s) scraperKept(s).written = 0;
      k.mode = QMODE.free;
    }
    return false;
  },

  start(R, m, a) {
    const k = keptOf(m);
    const act = m.act!;
    act.a = 0;
    act.b = 0;
    const face = (fx: number, fy: number): void => {
      const d = Math.hypot(fx, fy);
      if (d > 1e-6) {
        m.fx = fx / d;
        m.fy = fy / d;
      }
    };
    if (a.id === 'quill:takeoff' || a.id === 'quill:fly') face(k.tx - m.x, k.ty - m.y);
    else if (a.id === 'quill:land') {
      // (it lands where it was sent: there, facing as it is to stand; landing beside the Scraper to write over it, the
      // Scraper holds its ground from now)
      m.x = k.tx;
      m.y = k.ty;
      const s = k.what === 2 ? partnerOf(R.g, m) : null;
      if (s) scraperKept(s).written = 1;
    } else if (a.id === 'quill:write' || a.id === 'quill:swoop') face(k.tfx, k.tfy);
    if (a.id === 'quill:takeoff') R.g.sfx('gust', 0.5);
    if (a.id === 'quill:write') {
      k.wrote = 0;
      k.told = -1;
      const s = partnerOf(R.g, m);
      if (s) scraperKept(s).written = 1;
    }
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const k = keptOf(m);
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    switch (a.id) {
      case 'quill:stab': {
        if (!at(a.hit)) break;
        // THE STAB: whoever is in its mark is struck
        const c = ahead(m.x, m.y, m.fx, m.fy, STAB_AT);
        const h = g.hero;
        if (open(R) && Math.hypot(h.x - c.x, h.y - c.y) <= STAB_R + TUNE.heroRadius * 0.5) R.blow(m, a.dmg);
        R.peril(m, 'act1', m.x, m.y, { a1: 'quill:stab', dur: STAB_FOR, fx: m.fx, fy: m.fy });
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('hit', 0.5);
        break;
      }
      case 'quill:lines': {
        // EACH STROKE lays a line across the floor before it: each bursts after (its peril, below)
        QL_LINES.strokes.forEach(([from], i) => {
          if (!at(from)) return;
          R.peril(m, 'act1', m.x, m.y, { a1: 'quill:line', c: i, dur: LINE_STROKE + LINE_BURST_AFTER + LINE_STAIN_FOR, fx: m.fx, fy: m.fy, dmg: g.rollMonsterDmg(m) * a.dmg, done: 0 });
          g.sfx('swing', 0.5);
        });
        break;
      }
      case 'quill:fly': {
        // FLYING, straight to where it is sent, at its pace; there, it lands. Sent to write over the Scraper, where it is
        // going follows the Scraper as it moves (where the floor lets it stand)
        // (or, where that side of it has no room for it now, the nearest side round it that has, facing it)
        const s = k.what === 2 ? partnerOf(g, m) : null;
        if (s) {
          const r = Math.hypot(k.ox, k.oy) || WRITE_AT.ahead;
          const a0 = Math.atan2(k.oy, k.ox);
          for (const da of [0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6, Math.PI]) {
            const x = s.x + Math.cos(a0 + da) * r;
            const y = s.y + Math.sin(a0 + da) * r;
            if (!g.free(g.level.walk, x, y, 0.35)) continue;
            k.tx = x;
            k.ty = y;
            k.ox = x - s.x;
            k.oy = y - s.y;
            k.tfx = (s.x - x) / r;
            k.tfy = (s.y - y) / r;
            break;
          }
        }
        const dx = k.tx - m.x;
        const dy = k.ty - m.y;
        const d = Math.hypot(dx, dy);
        const step = PAIR_TUNE.fly * (t1 - t0);
        if (d <= step + 1e-6) {
          R.startAct(m, QL_ACTS, LAND);
          break;
        }
        m.x += (dx / d) * step;
        m.y += (dy / d) * step;
        m.fx = dx / d;
        m.fy = dy / d;
        break;
      }
      case 'quill:write': {
        // WRITING OVER THE SCRAPER: it heals while it writes; stopped by a blow on the Quill, the Scraper burning, or in time
        const s = partnerOf(g, m);
        if (!s || Math.hypot(s.x - m.x, s.y - m.y) > 3) {
          stopWriting(R, m, '');
          break;
        }
        if (m.struckT !== undefined && m.struckT < t1 - t0 + 1e-6) {
          stopWriting(R, m, `${m.name} is struck from its writing`);
          break;
        }
        if (s.burnT > 0) {
          stopWriting(R, m, `The fresh writing burns on ${s.name.replace(/^The /, 'the ')}`);
          break;
        }
        k.wrote += t1 - t0;
        if (k.wrote >= PAIR_TUNE.overwrite.most) {
          stopWriting(R, m, '');
          break;
        }
        s.life = Math.min(s.maxLife, s.life + s.maxLife * PAIR_TUNE.overwrite.heal * (t1 - t0));
        const sec = Math.floor(k.wrote);
        if (sec !== k.told) {
          k.told = sec;
          g.emit({ t: 'text', x: s.x, y: s.y, text: 'heals', color: '#ff8a80' });
        }
        break;
      }
      case 'quill:swoop': {
        // CARRIED DOWN THE STRIP, its nib writing it, SWOOP_TILES along the way it faces
        if (at(QL_SWOOP.spring)) g.sfx('gust', 0.6);
        if (t1 <= QL_SWOOP.go || t0 >= QL_SWOOP.stop) break;
        const b = (t: number): number => (SWOOP_TILES * (Math.min(t, QL_SWOOP.stop) - QL_SWOOP.go)) / (QL_SWOOP.stop - QL_SWOOP.go);
        const step = b(t1) - b(Math.max(t0, QL_SWOOP.go));
        m.x += m.fx * step;
        m.y += m.fy * step;
        break;
      }
      default:
        break;
    }
    void act;
  },

  end(R, m, a) {
    const k = keptOf(m);
    if (a.id === 'quill:takeoff') {
      R.startAct(m, QL_ACTS, FLY);
    } else if (a.id === 'quill:land') {
      // (there: to write over the Scraper, or to wait at the strip's far end)
      const s = partnerOf(R.g, m);
      if (k.what === 2 && s) {
        k.mode = QMODE.writing;
        R.startAct(m, QL_ACTS, WRITE);
      } else if (k.what === 3 && s && (scraperKept(s).plan === 1 || (s.act && s.act.id === 'scraper:strip'))) {
        k.mode = QMODE.waiting;
        m.fx = k.tfx;
        m.fy = k.tfy;
      } else {
        k.mode = QMODE.free;
        if (s && k.what === 2) scraperKept(s).written = 0;
      }
    } else if (a.id === 'quill:swoop') k.mode = QMODE.free;
  },

  lifeFloor(_R, m) {
    // (in the air, or skimming down the strip, it is not felled: its death is painted from the floor)
    return aloft(m) ? 1 : 0;
  },

  peril(R, p) {
    if (p.a1 !== 'quill:line' || p.done) return;
    // ITS LINE BURSTS LINE_BURST_AFTER its stroke: whoever is on it as it bursts is struck
    const since = p.t - LINE_STROKE - LINE_BURST_AFTER;
    if (since < 0 || since > LINE_BURST_FOR) return;
    const h = R.g.hero;
    if (!open(R) || !onLine(p.x, p.y, p.fx, p.fy, p.c, h.x, h.y)) return;
    p.done = 1;
    R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
  },

  died(R, m) {
    // (its lines not yet burst lie and dry without bursting; the Scraper is no longer written over)
    for (const p of R.g.perils) {
      if (p.kind !== 'act1' || p.from !== m.name || p.a1 !== 'quill:line') continue;
      if (p.t < LINE_STROKE + LINE_BURST_AFTER) p.done = 2;
    }
    const s = partnerOf(R.g, m);
    if (s) scraperKept(s).written = 0;
    keptOf(m).mode = QMODE.free;
  },
};
