// FLOOR 5, THE TEMPLE DOOR'S TWO KEY-BEARERS: their rules (game/act1_rules/types.ts), behind art/temple_door.ts TEMPLE_DOOR, off.
// His idea, 13 Nov 2026 (game/temple_door.ts has it whole): two mini-bosses in the mine carry the temple door's two keys; kill both,
// take the keys, and the chains come off the door. His picks: “I think just like a souped up version of the dagger cultist and a super
// version of the plane cult that makes sense flame fire cultist”; their blows, “The leap and the stab, a thrown dagger ranged attack”
// and “Fire fan and fire ring, plus a bigger version of the regular mob attack”; their look (art/key_bearers.ts); “Key rings to the
// floor (Recommended)”.
//
// THE KEYBEARER OF THE KNIFE ('keyblade'), his run the dagger cultist's, a head taller:
//   THE STAB, his basic blow: the dagger cultist's frenzy, four stabs in a blur stepping in (each struck where his picture has him
//     then, along the way it faces: action_f4.ts pictureWays), then winded, your opening; carried on where his steps took him.
//   THE THROW: from 3 to 9 tiles, a knife drawn from his bandolier and flung at you (`keyblade:knife`, flying straight).
//   THE LEAP: from 1.8 to 4.5 tiles, he leaps at you, turning a flip in the air (his word: “Gimme a flip in the knife guys jump”),
//     and plunges his blade down where he lands, struck within LEAP.r of it.
// THE KEYBEARER OF THE FLAME ('keyflame'), walking in procession:
//   THE SIGIL, his basic blow: the fire cultist's sigil made bigger (SIGIL_R tiles), under you as his hand begins to trace it, erupting
//     at his slam and burning on after (`keyflame:sigil`; the art and its timings the cultist's own, art/action_f2_fx.ts).
//   THE FAN: three balls of fire flung across before him in a fan, at you (`keyflame:ball`).
//   THE RING: within 3.5 tiles, he strikes the floor and a ring of fire bursts out from him along it (`keyflame:ring`): struck as its
//     edge passes you, unless you are rolling through it.
// Each, killed, drops his key (`keyblade:key`): it tumbles ringing from his hip to the floor, and is taken as he walks onto it.

import { DAGGER_CULTIST, FRENZY, FRENZY_HITS, FRENZY_STEP } from '../../art/cultists';
import { SIGIL, SIGIL_LONG, burnRadius } from '../../art/action_f2_fx';
import { FL_FAN, FL_PACE, FL_RING, FL_SIGIL, KB_LEAP, KB_THROW, KEY_BLADE, KEY_K, fanFrom, throwFrom } from '../../art/key_bearers';
import { TILE3 } from '../../art/new_mobs3';
import { pictureWays } from '../action_f4';
import type { ActDef, BossRules } from '../bosses';
import { beside } from '../facing';
import type { Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** THE KNIFE'S NUMBERS (tiles, seconds). */
export const KB = {
  /** His frenzy's stabs: each a step of `step` on (his picture's), struck within `reach` of where he is then and before him. */
  stab: { step: FRENZY_STEP * KEY_K, reach: 1.35, travel: 4 * FRENZY_STEP * KEY_K },
  /** His leap: how far his picture lunges in it, the most the rules carry him on besides, and how near its plunge strikes. */
  leap: { lunge: (24 * KEY_K) / TILE3, most: 3.4, r: 1.15 },
  /** His thrown knife: how fast it flies, how far, how near it strikes, and its burst. */
  knife: { speed: 12, reach: 10, r: 0.42, burst: 0.18 },
};
/** THE FLAME'S NUMBERS (tiles, seconds). */
export const KF = {
  /** His sigil's ring: the fire cultist's (1.75) made bigger. */
  sigilR: 2.5,
  /** His fan: how fast each ball flies, how far, how near it strikes, its burst. */
  ball: { speed: 7.5, reach: 9, r: 0.45, burst: 0.3 },
  /** His ring: from `from` tiles out to `to`, at `speed` tiles a second, striking within `half` of its edge; seen dying for `fade` after. */
  ring: { from: 0.8, to: 5.0, speed: 7, half: 0.45, fade: 0.35 },
};
/** THE KEY: how long it tumbles to the floor, where it lands (tiles beside him), and how near he must come to take it. */
export const KEY_DROP = { fall: 0.5, out: 0.75, take: 0.6 };
export const KEY_PERIL = 'keyblade:key';
export const KNIFE_PERIL = 'keyblade:knife';
export const SIGIL_PERIL = 'keyflame:sigil';
export const BALL_PERIL = 'keyflame:ball';
export const RING_PERIL = 'keyflame:ring';
/** How long his ring lasts from its burst. */
export const RING_LASTS = (KF.ring.to - KF.ring.from) / KF.ring.speed + KF.ring.fade;
/** How far out his ring's edge is `t` seconds from its burst (tiles). */
export const ringAt = (t: number): number => Math.min(KF.ring.to, KF.ring.from + KF.ring.speed * Math.max(0, t));

const BLADE_ACTS: readonly ActDef[] = [
  { id: 'keyblade:stab', clip: 'attack', long: FRENZY.long, hit: FRENZY_HITS[0], dmg: 0.45, cooldown: 0, first: 0, after: 0.5, near: 0, far: 2.4 },
  { id: 'keyblade:throw', clip: 'throw', long: KB_THROW.long, hit: KB_THROW.hit, dmg: 1, cooldown: 4.5, first: 1.5, after: 0.6, near: 3, far: 9 },
  { id: 'keyblade:leap', clip: 'leap', long: KB_LEAP.long, hit: KB_LEAP.hit, dmg: 1.4, cooldown: 6, first: 2.5, after: 0.6, near: 1.8, far: 4.5 },
];
const FLAME_ACTS: readonly ActDef[] = [
  { id: 'keyflame:sigil', clip: 'attack', long: FL_SIGIL.long, hit: FL_SIGIL.hit, dmg: 1.2, cooldown: 0, first: 0, after: 1.0, near: 0, far: 8 },
  { id: 'keyflame:fan', clip: 'fan', long: FL_FAN.long, hit: FL_FAN.hit, dmg: 1.25, cooldown: 4, first: 1.5, after: 0.8, near: 0, far: 9 },
  { id: 'keyflame:ring', clip: 'ring', long: FL_RING.long, hit: FL_RING.hit, dmg: 1.5, cooldown: 8, first: 3, after: 0.9, near: 0, far: 3.5 },
];

/** Whether the hero can be struck now: not rolling, not unhurtable, the game not over. */
function open(R: BossRules): boolean {
  const g = R.g;
  return g.hero.invuln <= 0 && !g.hero.move && !g.over;
}
/** Carry one `d` tiles along (vx, vy), so far as the floor lets it. */
function carry(R: BossRules, m: Monster, vx: number, vy: number, d: number): void {
  const L = R.g.level;
  const n = Math.max(1, Math.ceil(Math.abs(d) / 0.1));
  for (let i = 0; i < n; i++) {
    const x = m.x + (vx * d) / n;
    const y = m.y + (vy * d) / n;
    if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] !== 1) return;
    m.x = x;
    m.y = y;
  }
}
/** A thing flown along its way from where it is (`p.fx`, `p.fy`), striking him within `r` (or bursting at a wall or its reach). */
function fly(R: BossRules, p: Peril, dt: number, speed: number, reach: number, r: number, burst: number): void {
  const g = R.g;
  const h = g.hero;
  const go = Math.min(dt, p.t) * speed;
  const steps = Math.max(1, Math.ceil(go / 0.2));
  let done = false;
  for (let s = 0; s < steps && !done; s++) {
    p.x += (p.fx * go) / steps;
    p.y += (p.fy * go) / steps;
    p.d += go / steps;
    if (Math.hypot(h.x - p.x, h.y - p.y) <= r && open(R)) {
      g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x - p.fx, p.y - p.fy, p.half);
      done = true;
    } else if (p.d >= reach || !g.isOpen(p.x, p.y)) done = true;
  }
  if (done) {
    p.done = 1;
    p.hit = p.t;
    p.dur = p.t + burst;
  }
}
/** The hero's way from (x, y), as a unit (the way `fx`, `fy` if he is on it). */
function toward(R: BossRules, x: number, y: number, fx: number, fy: number): [number, number] {
  const h = R.g.hero;
  const d = Math.hypot(h.x - x, h.y - y);
  return d > 0.01 ? [(h.x - x) / d, (h.y - y) / d] : [fx, fy];
}

/** What his death leaves (both of them): his key, tumbling from his hip to the floor beside him, ringing. */
function dropKey(R: BossRules, m: Monster): void {
  const L = R.g.level;
  // (to his left as he is drawn, out from his hip; where that is no floor, at his feet)
  const hand = m.act ? m.act.hand : 1;
  let at = beside(m.x, m.y, m.fx, m.fy, hand, 0.15, KEY_DROP.out);
  if (L.walk[Math.floor(at.y) * L.floor.w + Math.floor(at.x)] !== 1) at = { x: m.x, y: m.y };
  R.peril(m, 'act1', at.x, at.y, { a1: KEY_PERIL, t: 0, dur: 1e9, dmg: 0, a: m.x, b: m.y, c: 0 });
}

export const RULES_BLADE: Act1Rules = {
  // (his run at the pace it is painted for, looping from his stand; from behind as the camera truly sees it)
  gait: { pace: KEY_BLADE.pace, cycle: DAGGER_CULTIST.walkFrames / DAGGER_CULTIST.walkFps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.4, slack: 0.4, trueBack: true },
  acts: BLADE_ACTS,
  start(R, m, a) {
    // (his leap: how far the rules carry him on as he flies, so that its plunge comes down where the hero stands)
    if (a.id === 'keyblade:leap' && m.act) {
      const h = R.g.hero;
      m.act.a = Math.max(0, Math.min(KB.leap.most, Math.hypot(h.x - m.x, h.y - m.y) - KB.leap.lunge - 0.35));
    }
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const { ahead } = pictureWays(m.fx, m.fy);
    if (a.id === 'keyblade:stab') {
      FRENZY_HITS.forEach((T, k) => {
        if (!at(T)) return;
        g.sfx('swing', 0.4);
        // (where his picture has him as the stab lands, and whether the hero is before him there, within its reach)
        const bx = m.x + ahead[0] * KB.stab.step * (k + 1);
        const by = m.y + ahead[1] * KB.stab.step * (k + 1);
        const dx = h.x - bx;
        const dy = h.y - by;
        const d = Math.hypot(dx, dy);
        if (d <= KB.stab.reach && (d < 0.3 || (dx * m.fx + dy * m.fy) / d > -0.1) && open(R)) R.blow(m, a.dmg);
      });
      return;
    }
    if (a.id === 'keyblade:leap') {
      // (in the air from his leap to his plunge: carried on toward where the hero stood)
      const L0 = KB_LEAP.leap;
      const H = a.hit;
      if (m.act && t1 > L0 && t0 < H) carry(R, m, m.fx, m.fy, (m.act.a * (Math.min(t1, H) - Math.max(t0, L0))) / (H - L0));
      if (at(H)) {
        g.emit({ t: 'shake', amount: 2 });
        g.sfx('slam', 0.6);
        const px = m.x + ahead[0] * KB.leap.lunge;
        const py = m.y + ahead[1] * KB.leap.lunge;
        if (Math.hypot(h.x - px, h.y - py) <= KB.leap.r && open(R)) R.blow(m, a.dmg);
      }
      return;
    }
    if (a.id === 'keyblade:throw' && at(a.hit) && m.act) {
      const f = throwFrom();
      const o = beside(m.x, m.y, m.fx, m.fy, m.act.hand, f[0], f[1]);
      const [vx, vy] = toward(R, o.x, o.y, m.fx, m.fy);
      R.peril(m, 'act1', o.x, o.y, { a1: KNIFE_PERIL, hit: 1e9, dur: 1e9, dmg: g.rollMonsterDmg(m) * a.dmg, fx: vx, fy: vy, c: f[2] });
      g.sfx('lunge', 0.45);
    }
  },
  end(R, m, a) {
    // (his frenzy has carried him on, in his picture: he is where it left him)
    if (a.id === 'keyblade:stab') {
      const { ahead } = pictureWays(m.fx, m.fy);
      carry(R, m, ahead[0], ahead[1], KB.stab.travel);
    }
  },
  died(R, m) {
    dropKey(R, m);
  },
  peril(R, p, dt) {
    const g = R.g;
    if (p.a1 === KEY_PERIL) {
      // (taken once it has come to rest, by walking onto it)
      const h = g.hero;
      if (p.t >= KEY_DROP.fall + 0.2 && !g.over && Math.hypot(h.x - p.x, h.y - p.y) <= KEY_DROP.take) {
        p.dur = p.t;
        g.templeKeyTaken(p.x, p.y);
      }
      if (p.t - dt < KEY_DROP.fall && p.t >= KEY_DROP.fall) g.sfx('gold', 0.9);
      return;
    }
    if (p.a1 === KNIFE_PERIL && !p.done) fly(R, p, dt, KB.knife.speed, KB.knife.reach, KB.knife.r, KB.knife.burst);
  },
};

export const RULES_FLAME: Act1Rules = {
  // (his procession, eight frames at eight a second, looping from his stand. He stands off and casts)
  gait: { pace: FL_PACE, cycle: 1.0, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 5, slack: 1, trueBack: true },
  acts: FLAME_ACTS,
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'keyflame:sigil') {
      // (its ring under the hero as his hand begins to trace it; it erupts at his slam, the act's blow)
      const T = a.hit - SIGIL.delay;
      if (at(T)) {
        R.peril(m, 'act1', h.x, h.y, { a1: SIGIL_PERIL, t: -SIGIL.delay + (t1 - T), dur: SIGIL_LONG, dmg: g.rollMonsterDmg(m) * a.dmg, a: m.id, el: 'fire' });
        g.sfx('fire', 0.35);
      }
      return;
    }
    if (a.id === 'keyflame:fan' && at(a.hit) && m.act) {
      const f = fanFrom();
      const o = beside(m.x, m.y, m.fx, m.fy, m.act.hand, f[0], f[1]);
      const [vx, vy] = toward(R, o.x, o.y, m.fx, m.fy);
      const dmg = g.rollMonsterDmg(m) * a.dmg;
      for (const deg of [-FL_FAN.wide, 0, FL_FAN.wide]) {
        const r = (deg * Math.PI) / 180;
        const fx = vx * Math.cos(r) - vy * Math.sin(r);
        const fy = vx * Math.sin(r) + vy * Math.cos(r);
        R.peril(m, 'act1', o.x, o.y, { a1: BALL_PERIL, hit: 1e9, dur: 1e9, dmg, fx, fy, c: f[2], el: 'fire' });
      }
      g.sfx('fire', 0.6);
      return;
    }
    if (a.id === 'keyflame:ring' && at(a.hit)) {
      R.peril(m, 'act1', m.x, m.y, { a1: RING_PERIL, t: 0, dur: RING_LASTS, dmg: g.rollMonsterDmg(m) * a.dmg, el: 'fire' });
      g.sfx('fire', 1);
      g.sfx('slam', 0.5);
      g.emit({ t: 'shake', amount: 3 });
    }
  },
  died(R, m) {
    dropKey(R, m);
  },
  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    if (p.a1 === SIGIL_PERIL) {
      // (its caster still casting: if he has fallen, or been stopped in his cast, nothing erupts)
      if (p.t < -0.05) {
        const m = g.monsters.find((o) => o.id === p.a);
        if (!m || m.dead || m.state !== 'act') p.dur = p.t;
        return;
      }
      if (!p.done && p.t >= 0) {
        p.done = 1;
        if (Math.hypot(h.x - p.x, h.y - p.y) <= KF.sigilR && open(R)) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
        g.sfx('fire', 1);
        g.emit({ t: 'shake', amount: 3 });
        return;
      }
      // (the floor burning on: a tick every half second he stands in what still burns)
      if (p.done && p.t > SIGIL.strike[1]) {
        const next = SIGIL.strike[1] + 0.5 * p.done;
        if (p.t >= next) {
          p.done++;
          if (Math.hypot(h.x - p.x, h.y - p.y) <= burnRadius(p.t, KF.sigilR) && !g.over) g.hurtHero(p.dmg * 0.18, p.el, p.words, null, p.from, p.x, p.y, p.half);
        }
      }
      return;
    }
    if (p.a1 === BALL_PERIL && !p.done) {
      fly(R, p, dt, KF.ball.speed, KF.ball.reach, KF.ball.r, KF.ball.burst);
      return;
    }
    if (p.a1 === RING_PERIL && !p.done) {
      // (struck once, as its edge passes over him)
      // (its edge's way over the floor this step: from where it was to where it is)
      const r0 = p.t - dt <= 0 ? 0 : ringAt(p.t - dt);
      const r1 = ringAt(p.t);
      const d = Math.hypot(h.x - p.x, h.y - p.y);
      if (d >= r0 - KF.ring.half && d <= r1 + KF.ring.half && open(R)) {
        p.done = 1;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      }
    }
  },
};
