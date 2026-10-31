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
// - THE KING'S: the great sword's sweep (its basic: round before him); THE CROWN (a leap at him, carried 2.5 tiles, a slam where he
//   lands, its ring rolling out four tiles).
// Their warnings on the floor and their big moves' pictures: render/act1_fx/rshadow.ts.

import { BLINK, ROYALS, ROYAL_IDS } from '../../art/royal_shadows';
import type { RoyalId } from '../../art/royal_shadows';
import { MASKS_SHADOW_FLIGHT, SHADOW_CROWN, SHADOW_MASKS, SHADOW_SNARE } from '../../art/royal_shadows_fx';
import { KG_CROWN, KG_SWEEP } from '../../art/king_moves';
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
  sweep: { reach: 3.0, half: 1.9 },
  crown: { carry: SHADOW_CROWN.carry, slam: 1.3, ring: 4, ringFor: 0.8, ringWide: 0.55, ringDmg: 0.7, cd: 7 },
} as const;

/** Which royal a shadow is. */
export const royalOf = (m: Monster): RoyalId => ROYAL_IDS[Math.max(0, Math.min(3, m.form ?? 0))];

const ACTS: readonly ActDef[] = [
  // (each royal's basic: only the shadow of that royal makes it: `can`)
  { id: 'rshadow:lash', clip: 'attack', long: PR_LASH.long, hit: PR_LASH.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.6, near: 0, far: SHADOW_TUNE.lash.reach - 0.5 },
  { id: 'rshadow:thrust', clip: 'attack', long: PC_THRUST.long, hit: PC_THRUST.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.3, near: 0, far: SHADOW_TUNE.thrust.reach - 0.3 },
  { id: 'rshadow:comb', clip: 'attack', long: QN_COMB.long, hit: QN_COMB.hit, dmg: 1, cooldown: 0, first: 0.4, after: 0.4, near: 0, far: SHADOW_TUNE.comb.reach - 0.2 },
  { id: 'rshadow:sweep', clip: 'attack', long: KG_SWEEP.long, hit: KG_SWEEP.hit, dmg: 1.2, cooldown: 0, first: 0.4, after: 0.6, near: 0, far: SHADOW_TUNE.sweep.reach - 0.3 },
  // (each royal's one big move)
  { id: 'rshadow:snare', clip: 'snare', long: PR_SNARE.long, hit: PR_SNARE.hit, dmg: SHADOW_TUNE.snare.dmg, cooldown: SHADOW_TUNE.snare.cd, first: 2.5, after: 0.5, near: 0, far: 7 },
  { id: 'rshadow:masks', clip: 'masks', long: PC_MASKS.long, hit: PC_MASKS.hit, dmg: SHADOW_TUNE.masks.dmg, cooldown: SHADOW_TUNE.masks.cd, first: 2.5, after: 0.4, near: 2, far: SHADOW_TUNE.masks.reach - 0.5 },
  { id: 'rshadow:blinkIn', clip: 'blinkIn', long: BLINK.into, hit: BLINK.strikeIn[1], dmg: 0, cooldown: SHADOW_TUNE.blink.cd, first: 2.5, after: 0, near: 3, far: 9 },
  { id: 'rshadow:crown', clip: 'crown', long: KG_CROWN.long, hit: KG_CROWN.hit, dmg: SHADOW_TUNE.crown.slam, cooldown: SHADOW_TUNE.crown.cd, first: 2.5, after: 0.6, near: 2.5, far: 6 },
  { id: 'rshadow:blinkOut', clip: 'blinkOut', long: BLINK.out, hit: BLINK.strikeOut[1], dmg: 1, cooldown: 0, first: 0, after: 0.4, near: 0, far: 999, forced: true },
];
/** Each royal's acts (ids). */
const OWN: Readonly<Record<RoyalId, readonly string[]>> = {
  princess: ['rshadow:lash', 'rshadow:snare'],
  prince: ['rshadow:thrust', 'rshadow:masks'],
  queen: ['rshadow:comb', 'rshadow:blinkIn', 'rshadow:blinkOut'],
  king: ['rshadow:sweep', 'rshadow:crown'],
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
/** How far out the crown's ring has rolled `t` seconds after the slam. */
export const ringAt = (t: number): number => SHADOW_TUNE.crown.ring * Math.min(1, Math.max(0, t) / SHADOW_TUNE.crown.ringFor);

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
    if (a.id === 'rshadow:crown') {
      // (where it leaps to: toward him, carried SHADOW_TUNE.crown.carry tiles)
      const h = R.g.hero;
      const d = Math.hypot(h.x - m.x, h.y - m.y) || 1;
      const k = a1Of(m);
      k.cx = (h.x - m.x) / d;
      k.cy = (h.y - m.y) / d;
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
      case 'rshadow:sweep':
        if (at(KG_SWEEP.strike[0])) g.sfx('swing', 0.8);
        if (at(a.hit) && d <= T.sweep.reach && ang <= T.sweep.half) R.blow(m, a.dmg);
        return;
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
      case 'rshadow:crown': {
        const k = a1Of(m);
        const [u0, u1] = KG_CROWN.air;
        const u = (t: number): number => Math.max(0, Math.min(1, (t - u0) / (u1 - u0)));
        const step = T.crown.carry * (u(t1) - u(t0));
        if (step > 0) carry(R, m, k.cx ?? m.fx, k.cy ?? m.fy, step);
        if (at(a.hit)) {
          g.sfx('slam', 0.6);
          g.emit({ t: 'shake', amount: 2 });
          if (Math.hypot(h.x - m.x, h.y - m.y) <= 1.2) R.blow(m, a.dmg);
          R.peril(m, 'act1', m.x, m.y, { a1: 'rshadow:ring', dur: 1.25, hit: 0, dmg: g.rollMonsterDmg(m) * T.crown.ringDmg });
        }
        return;
      }
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
    if (p.a1 === 'rshadow:ring') {
      // (the crown's ring rolling out: it strikes him as it passes under him, once)
      const r = ringAt(p.t);
      if (p.t > T.crown.ringFor || r < 1.2) return;
      if (Math.abs(Math.hypot(h.x - p.x, h.y - p.y) - r) <= T.crown.ringWide && !h.move) {
        p.done = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
      }
    }
  },
};
