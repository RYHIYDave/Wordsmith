// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE SHADOWS OF THE FOUR ROYALS: their rules (game/act1_rules/types.ts).
//
// His doc (level 20): "Enemies: the Hush in its own shapes, the Silent Order's last masks, and shadows of the four royals." His pick
// to the art chat: “Each with one boss move (Recommended)”, offered as "grey fog echoes of the four royals you beat ... each as its
// royal moved (the Prince quick and dancing, the King slow and heavy). Attacks (two): its royal's basic attack, and one of that
// royal's big moves, smaller. Death: it blows apart like smoke, leaving that royal's playing card for a moment. Never: not their
// full boss fights again"; then “Yes, that's them (Recommended)” (docs/mockups/royal_shadows/README.md, every number).
//
// WHICH ROYAL each shadow is: Monster.form (0 the Princess, 1 the Prince, 2 the Queen, 3 the King), by its own dice as it comes into
// the world; its pace its royal's at its size (Royal.pace: the Prince quick, the King slow and heavy). What each does, its royal's
// numbers made smaller (SHADOW_TUNE):
// - THE PRINCESS'S: the vine's lash (its basic: a quarter turn before her, six tiles out); THE SNARE (the vines burst up round where
//   he stood as her held hands' warning ended, 2.75 tiles across, and hold whoever they caught 1.4 s).
// - THE PRINCE'S: the rapier's thrust (its basic: a line before him, the lunge in his picture); MASKS (three smiling masks flung in a
//   fan, six tiles out, each striking where it passes him).
// - THE QUEEN'S: the comb (its basic: a stab before her, carrying her on); THE BLINK (into her hand mirror where she stands, out of
//   it behind him, stabbing as she comes out).
// - THE KING'S, as the King's own were made new (the art chat's mockup/king and mockup/royal-shadows, handed over 31 Oct 18:00 with
//   his yes; brought in at his word of 2 Nov, “All of it in this one”): THE CHARGE (its basic: braced, it runs SHADOW_CHARGE.most
//   tiles along its forward at SHADOW_CHARGE.pace, a wall stopping it; a line of sparks left where it ran, which strikes everything
//   within SHADOW_CHARGE.reach of it as they burst, 2.43 to 2.8 s into the move); THE CROWN'S WEIGHT (its crown sent up off its head
//   at KG_WEIGHT.send, flown out over him, following him at SHADOW_WEIGHT.pace till KG_WEIGHT.hold[0], held trembling, dropped: it
//   strikes within SHADOW_WEIGHT.r of where it lands, KG_WEIGHT.hit; lying a moment; home onto its head; the shadow stands still).
// Their warnings on the floor and their big moves' pictures: render/act1_fx/rshadow.ts.

import { BLINK, ROYALS, ROYAL_IDS } from '../../art/royal_shadows';
import type { RoyalId } from '../../art/royal_shadows';
import { MASKS_SHADOW_FLIGHT, SHADOW_CHARGE, SHADOW_MASKS, SHADOW_SNARE, SHADOW_WEIGHT, shadowCrownAt } from '../../art/royal_shadows_fx';
import { KG_CHARGE, KG_WEIGHT } from '../../art/king_moves';
import { PC_MASKS, PC_THRUST } from '../../art/prince_moves';
import { PR_LASH, PR_SNARE } from '../../art/princess_moves';
import { QN_COMB } from '../../art/queen_moves';
import { MASKS_FX } from '../../art/prince_fx';
import type { ActDef, BossRules } from '../bosses';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** Their numbers, each royal's made smaller (tiles, radians, seconds; blows times their own). */
export const SHADOW_TUNE = {
  lash: { reach: 6, half: 0.85 },
  snare: { r: 1.375 + 0.3, hold: SHADOW_SNARE.hold, slow: 0.9, dmg: 1, cd: 7 },
  thrust: { reach: 4.6 * ROYALS.prince.k, half: 0.6 },
  masks: { ways: [-MASKS_FX.spread, 0, MASKS_FX.spread] as const, speed: MASKS_FX.speed, reach: SHADOW_MASKS.reach, hit: 0.6, dmg: 0.8, cd: 6 },
  comb: { reach: 2.9 * ROYALS.queen.k + 0.2, half: 0.6, lunge: 1.6 * ROYALS.queen.k },
  blink: { behind: 3.4 * ROYALS.queen.k, reach: 1.9 * ROYALS.queen.k + 0.4, half: 0.8, cd: 8 },
  charge: { hit: [2.43, 2.8] as const, lies: 3.15, near: 0, far: 6.5 },
  weight: { dmg: 1.3, cd: 8 },
} as const;

/** Which royal a shadow is. */
export const royalOf = (m: Monster): RoyalId => ROYAL_IDS[Math.max(0, Math.min(3, m.form ?? 0))];

const ACTS: readonly ActDef[] = [
  // (each royal's basic: only the shadow of that royal makes it: `can`)
  { id: 'rshadow:lash', clip: 'attack', long: PR_LASH.long, hit: PR_LASH.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.6, near: 0, far: SHADOW_TUNE.lash.reach - 0.5 },
  { id: 'rshadow:thrust', clip: 'attack', long: PC_THRUST.long, hit: PC_THRUST.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.3, near: 0, far: SHADOW_TUNE.thrust.reach - 0.3 },
  { id: 'rshadow:comb', clip: 'attack', long: QN_COMB.long, hit: QN_COMB.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.4, near: 0, far: SHADOW_TUNE.comb.reach - 0.2 },
  { id: 'rshadow:charge', clip: 'attack', long: KG_CHARGE.long, hit: SHADOW_TUNE.charge.hit[0], dmg: 1.2, cooldown: 0, first: 0.4, after: 0.6, near: SHADOW_TUNE.charge.near, far: SHADOW_TUNE.charge.far },
  // (each royal's one big move)
  { id: 'rshadow:snare', clip: 'snare', long: PR_SNARE.long, hit: PR_SNARE.hit, dmg: SHADOW_TUNE.snare.dmg, cooldown: SHADOW_TUNE.snare.cd, first: 2.5, after: 0.5, near: 0, far: 7 },
  { id: 'rshadow:masks', clip: 'masks', long: PC_MASKS.long, hit: PC_MASKS.hit, dmg: SHADOW_TUNE.masks.dmg, cooldown: SHADOW_TUNE.masks.cd, first: 2.5, after: 0.4, near: 2, far: SHADOW_TUNE.masks.reach - 0.5 },
  { id: 'rshadow:blinkIn', clip: 'blinkIn', long: BLINK.into, hit: BLINK.strikeIn[1], dmg: 0, cooldown: SHADOW_TUNE.blink.cd, first: 2.5, after: 0, near: 3, far: 9 },
  { id: 'rshadow:weight', clip: 'weight', long: KG_WEIGHT.long, hit: KG_WEIGHT.hit, dmg: SHADOW_TUNE.weight.dmg, cooldown: SHADOW_TUNE.weight.cd, first: 2.5, after: 0.6, near: 0, far: 7 },
  { id: 'rshadow:blinkOut', clip: 'blinkOut', long: BLINK.out, hit: BLINK.strikeOut[1], dmg: 1, cooldown: 0, first: 0, after: 0.4, near: 0, far: 999, forced: true },
];
/** Each royal's acts (ids). */
const OWN: Readonly<Record<RoyalId, readonly string[]>> = {
  princess: ['rshadow:lash', 'rshadow:snare'],
  prince: ['rshadow:thrust', 'rshadow:masks'],
  queen: ['rshadow:comb', 'rshadow:blinkIn', 'rshadow:blinkOut'],
  king: ['rshadow:charge', 'rshadow:weight'],
};
const BLINK_OUT = ACTS.findIndex((a) => a.id === 'rshadow:blinkOut');

const a1Of = (m: Monster): Record<string, number> => m.a1 ?? (m.a1 = {});
/** Whether (x, y) is on open floor. */
const open = (R: BossRules, x: number, y: number): boolean => R.g.isOpen(x, y);
/** Move it `d` tiles along (wx, wy), so far as the floor lets it. */
function carry(R: BossRules, m: Monster, wx: number, wy: number, d: number): void {
  const n = Math.max(1, Math.ceil(Math.abs(d) / 0.1));
  for (let i = 0; i < n; i++) {
    const x = m.x + (wx * d) / n;
    const y = m.y + (wy * d) / n;
    if (!open(R, x, y)) return;
    m.x = x;
    m.y = y;
  }
}

/** Where a mask of a shadow's throw is `t` seconds after it left the hand (null once it has burst). */
export function maskAt(p: { x: number; y: number; fx: number; fy: number }, i: number, t: number): { x: number; y: number } | null {
  if (t > MASKS_SHADOW_FLIGHT) return null;
  const a = Math.atan2(p.fy, p.fx) + (SHADOW_TUNE.masks.ways[i] * Math.PI) / 180;
  const d = Math.min(SHADOW_TUNE.masks.reach, SHADOW_TUNE.masks.speed * Math.max(0, t));
  return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d };
}
/** The axis its picture faces along (its throws drawn in its picture fly that way): +x, +y, -y or -x (game/facing.ts). */
export function pictureWay(fx: number, fy: number): { fx: number; fy: number } {
  const back = fx + fy < -0.2;
  const flip = fx - fy < 0;
  return back ? (flip ? { fx: -1, fy: 0 } : { fx: 0, fy: -1 }) : flip ? { fx: 0, fy: 1 } : { fx: 1, fy: 0 };
}
/** THE KING'S SHADOW'S CHARGE: where it set off and the way it ran (Monster.a1 cx, cy, sx, sy), how far it ran (`lane`), and whether its line has struck (`hit`). */
export function chargeLine(m: Monster): { x: number; y: number; fx: number; fy: number; lane: number } | null {
  const k = m.a1;
  if (!k || k.sx === undefined) return null;
  return { x: k.sx, y: k.sy, fx: k.cx, fy: k.cy, lane: k.lane ?? 0 };
}
/** THE KING'S SHADOW'S CROWN: where the floor point under it is (Monster.a1 wx, wy). */
export function crownPoint(m: Monster): { x: number; y: number } | null {
  const k = m.a1;
  return k && k.wx !== undefined ? { x: k.wx, y: k.wy } : null;
}

export const RULES: Act1Rules | null = {
  // (paced each by its royal as it comes into the world: `spawned`; this its gait's, between the four)
  gait: { pace: 2.5, cycle: 1.0, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.0, slack: 0.6, trueBack: true },
  acts: ACTS,
  spawned(_R, m) {
    // (which royal: by its own dice; its pace that royal's at its size, whatever else quickens it kept)
    m.form = Math.floor(((m.seed % 1) + 1) % 1 * 4) % 4;
    const r = ROYALS[royalOf(m)];
    m.speed = (m.speed / 2.5) * r.pace;
  },
  can(_R, m, a) {
    return OWN[royalOf(m)].includes(a.id);
  },
  forced(_R, m) {
    // (the Queen's: out of her mirror at once, once she has gone into it)
    return a1Of(m).out ? BLINK_OUT : -1;
  },
  reachable(m) {
    if (!m.act) return true;
    // (the Queen's: in her mirror, not here)
    if (m.act.id === 'rshadow:blinkIn') return m.act.t < BLINK.strikeIn[0];
    if (m.act.id === 'rshadow:blinkOut') return m.act.t >= BLINK.strikeOut[0];
    return true;
  },
  start(R, m, a) {
    if (a.id === 'rshadow:blinkIn') R.g.sfx('shatter', 0.25);
    const k = a1Of(m);
    if (a.id === 'rshadow:charge') {
      // (the way it will run: the way it faces, at him)
      k.cx = m.fx;
      k.cy = m.fy;
      k.sx = m.x;
      k.sy = m.y;
      k.lane = 0;
      k.hit = 0;
    }
    if (a.id === 'rshadow:weight') {
      // (its crown on its head till it is sent)
      k.wx = m.x;
      k.wy = m.y;
      k.hit = 0;
    }
  },
  end(R, m, a) {
    const k = a1Of(m);
    if (a.id === 'rshadow:comb') carry(R, m, m.fx, m.fy, SHADOW_TUNE.comb.lunge);
    if (a.id === 'rshadow:blinkIn') {
      // (out of her mirror behind him, facing him)
      const h = R.g.hero;
      const B = SHADOW_TUNE.blink;
      for (const [bx, by] of [[-h.fx, -h.fy], [-h.fy, h.fx], [h.fy, -h.fx], [h.fx, h.fy]]) {
        const x = h.x + bx * B.behind;
        const y = h.y + by * B.behind;
        if (!open(R, x, y)) continue;
        m.x = x;
        m.y = y;
        break;
      }
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
      m.fx = (h.x - m.x) / d;
      m.fy = (h.y - m.y) / d;
      k.out = 1;
      return;
    }
    if (a.id === 'rshadow:blinkOut') k.out = 0;
    if (a.id === 'rshadow:charge') k.sx = undefined as unknown as number;
    if (a.id === 'rshadow:weight') k.wx = undefined as unknown as number;
  },
  died(_R, m) {
    const k = a1Of(m);
    k.sx = undefined as unknown as number;
    k.wx = undefined as unknown as number;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const r = R.rel(m);
    const d = Math.hypot(r.fwd, r.left);
    const ang = Math.abs(Math.atan2(r.left, r.fwd));
    const T = SHADOW_TUNE;
    switch (a.id) {
      case 'rshadow:lash':
        if (at(PR_LASH.strike[0])) g.sfx('swing', 0.6);
        if (at(a.hit) && d <= T.lash.reach && ang <= T.lash.half) R.blow(m, a.dmg);
        return;
      case 'rshadow:thrust':
        if (at(PC_THRUST.strike[0])) g.sfx('swing', 0.5);
        if (at(a.hit) && r.fwd >= -0.3 && r.fwd <= T.thrust.reach && Math.abs(r.left) <= T.thrust.half) R.blow(m, a.dmg);
        return;
      case 'rshadow:comb':
        if (at(QN_COMB.strike[0])) g.sfx('swing', 0.5);
        if (at(a.hit) && d <= T.comb.reach && ang <= T.comb.half) R.blow(m, a.dmg);
        return;
      case 'rshadow:charge': {
        // (braced, then carried along its way at its pace, a wall stopping it; its line of sparks bursting, striking all near it)
        const k = a1Of(m);
        const [r0, r1] = KG_CHARGE.run;
        if (at(KG_CHARGE.strike[0])) g.sfx('swing', 0.7);
        if (t1 > r0 && t0 < r1) {
          const step = SHADOW_CHARGE.pace * (Math.min(t1, r1) - Math.max(t0, r0));
          const x0 = m.x;
          const y0 = m.y;
          carry(R, m, k.cx, k.cy, step);
          k.lane = (k.lane ?? 0) + Math.hypot(m.x - x0, m.y - y0);
        }
        if (at(KG_CHARGE.burst)) g.sfx('slam', 0.5);
        if (!k.hit && t1 >= T.charge.hit[0] && t0 <= T.charge.hit[1]) {
          // (within its reach of the line it ran)
          const L = k.lane ?? 0;
          const u = Math.max(0, Math.min(L, (h.x - k.sx) * k.cx + (h.y - k.sy) * k.cy));
          const px = k.sx + k.cx * u;
          const py = k.sy + k.cy * u;
          if (Math.hypot(h.x - px, h.y - py) <= SHADOW_CHARGE.reach && !h.move) {
            k.hit = 1;
            R.blow(m, a.dmg);
          }
        }
        return;
      }
      case 'rshadow:weight': {
        // (its crown: sent off its head, flown out over him, following him, held, dropped; it lies, and goes home; the shadow stands)
        const k = a1Of(m);
        const W = KG_WEIGHT;
        const tc = t1 - W.send;
        if (at(W.send)) g.sfx('whirl', 0.35);
        if (tc >= 0) {
          const w = shadowCrownAt(tc);
          if (w.phase === 'fly') {
            k.wx = m.x + (h.x - m.x) * w.lerp;
            k.wy = m.y + (h.y - m.y) * w.lerp;
          } else if (w.phase === 'follow') {
            const dx = h.x - k.wx;
            const dy = h.y - k.wy;
            const d = Math.hypot(dx, dy);
            const step = Math.min(d, SHADOW_WEIGHT.pace * (t1 - t0));
            if (d > 1e-6) {
              k.wx += (dx / d) * step;
              k.wy += (dy / d) * step;
            }
          } else if (w.phase === 'home') {
            if (k.hx === undefined) {
              k.hx = k.wx;
              k.hy = k.wy;
            }
            k.wx = k.hx + (m.x - k.hx) * w.lerp;
            k.wy = k.hy + (m.y - k.hy) * w.lerp;
          }
        }
        if (at(a.hit)) {
          k.hx = undefined as unknown as number;
          g.sfx('slam', 0.7);
          g.emit({ t: 'shake', amount: 2 });
          if (Math.hypot(h.x - k.wx, h.y - k.wy) <= SHADOW_WEIGHT.r && !h.move) R.blow(m, a.dmg);
        }
        return;
      }
      case 'rshadow:snare':
        // (as her held hands' warning ends: where he stands is where the vines will burst)
        if (at(PR_SNARE.warn[1])) R.peril(m, 'act1', h.x, h.y, { a1: 'rshadow:snare', t: -(a.hit - PR_SNARE.warn[1]), hit: 0, dur: SHADOW_SNARE.long, dmg: g.rollMonsterDmg(m) * a.dmg });
        return;
      case 'rshadow:masks':
        if (at(a.hit)) {
          g.sfx('whirl', 0.4);
          const w = pictureWay(m.fx, m.fy);
          R.peril(m, 'act1', m.x, m.y, { a1: 'rshadow:masks', fx: w.fx, fy: w.fy, dur: MASKS_SHADOW_FLIGHT + SHADOW_MASKS.burst, hit: 0, dmg: g.rollMonsterDmg(m) * a.dmg, a: 0 });
        }
        return;
      case 'rshadow:blinkOut':
        if (at(BLINK.strikeOut[0])) g.sfx('shatter', 0.35);
        if (at(a.hit) && d <= T.blink.reach && ang <= T.blink.half) R.blow(m, a.dmg);
        return;
    }
  },
  peril(R, p: Peril) {
    if (p.done) return;
    const g = R.g;
    const h = g.hero;
    const T = SHADOW_TUNE;
    if (p.a1 === 'rshadow:snare') {
      // (the vines burst up: whoever is in their round is struck and held)
      if (p.t < 0 || p.a) return;
      p.a = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) > T.snare.r || h.move) return;
      g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      const was = (h.slowT ?? 0) > 0 ? h.slowBy ?? 0 : 0;
      h.slowT = Math.max(h.slowT ?? 0, T.snare.hold);
      h.slowBy = Math.max(was, T.snare.slow);
      return;
    }
    if (p.a1 === 'rshadow:masks') {
      // (each mask strikes where it passes him; the three of one throw once at most)
      for (let i = 0; i < 3; i++) {
        const q = maskAt(p, i, p.t);
        if (!q || Math.hypot(h.x - q.x, h.y - q.y) > T.masks.hit) continue;
        p.done = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, q.x, q.y, p.half);
        return;
      }
      return;
    }
  },
};
