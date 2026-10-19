// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE MUTE WATCH HOUNDS: its rules (game/act1_rules/types.ts).
//
// His picks for floor 11's monsters (to the art chat, 18 Oct 2026): "... Silent Order scribes,Mute watch hounds". Their
// brief was the art chat's, the picks it would have marked recommended, made on his word of 21:24 Pacific that day
// ("Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15"),
// read by the planning chat as his yes to go in (docs/act2_build.md): the watch's own dogs, Hushed with them, the
// Order's black gag wound round their muzzles so that they make no sound; fast, in packs at the watch's heels; they
// crouch, tremble and pounce, forepaws slamming down on you. The pictures (art/hounds.ts, painted from their own solids
// as Act 1's deer and wolves are): THE LOPE, painted for 2.4 tiles a second (HOUND_PACE), eight frames at sixteen a
// second; THE POUNCE (HOUND_POUNCE, 1.2 s): it crouches, haunches bunched, head low, held trembling from 0.2 to 0.42 s
// (THE WARNING); it springs, and its forepaws slam down before it at 0.6 s, held a tenth (THE BLOW): 20 of its lengths on
// from where they stood, so about three quarters of a tile before its middle (the art chat's "about half a tile" before
// it); it pushes itself back and settles. Struck, 0.45 s; its death, the gag off, a silent howl, down on its side (2.0
// s), in its pictures. Small: one attack.
//
// THE BLOW: whoever is within `r` of where its forepaws come down is struck (the paws' own spread and the hero's middle).
//
// AT THE WATCH'S HEELS (the art chat's "fast, in packs at the watch's heels"; how is the main chat's): a hound awake near
// one of the Hushed watch (within `heel.r`, of its own pack first) keeps to his heels, behind him and to one side, while
// he trudges on toward the hero: it lopes to its place when he has left it `heel.leave` behind, and waits there, facing
// as he does. It is LET SLIP as he comes within `heel.slip` of the hero (or once the hero is within `heel.near` of the
// hound itself, or once it is struck, or once he is dead): then it lopes in and pounces, as any. And a yellow pack of the watch comes with a
// brace of them (`heel.brace`) at its sergeant's heels (game/act1_rules/watch.ts): so where they are in a pack together,
// they come in behind the watch and are let slip on you at the last.
//
// Every number here that is a picture's is written down here; tests/act2_hound.test.ts holds it to the art.

import type { ActDef, GaitDef } from '../bosses';
import { beside, handOf } from '../facing';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE MUTE WATCH HOUNDS' NUMBERS (tiles, seconds of their pictures). */
export const HOUND = {
  /** THE POUNCE: its forepaws slam down at `hit` (HOUND_POUNCE.hit), `at` tiles before its middle (HOUND_FEET[0][0] + HOUND_POUNCE.reach, in its lengths); whoever is within `r` of there is struck. */
  pounce: { hit: 0.6, at: 0.765, r: 0.5 },
  /**
   * AT THE WATCH'S HEELS: whom it keeps to (one of the watch within `r` tiles: its own pack's first); its place, `at`
   * tiles behind him and `side` to one side (which side, by the hound: its seed); how far he may leave it before it lopes
   * after him; let slip when he is within `slip` of the hero, or the hero within `near` of it. How many a yellow pack of
   * the watch brings at its sergeant's heels (`brace`).
   */
  heel: { r: 7, at: 1.0, side: 0.75, leave: 0.8, there: 0.3, slip: 3.4, near: 2.6, brace: 2 },
};

/** Its lope, painted for 2.4 tiles a second; it may stop at any frame of it, as the fog wolf's glide. */
const GAIT: GaitDef = { pace: 2.4, cycle: 1 / 16, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 0.85, slack: 0.25, trueBack: false };

const ACTS: readonly ActDef[] = [
  // (made from no further than its paws come down on a hero's near side: wherever it stops, its pounce reaches him)
  { id: 'hound:pounce', clip: 'attack', long: 1.2, hit: HOUND.pounce.hit, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 1.15 },
];

/** The one of the watch whose heels it keeps to now (null: none, or let slip). */
export function masterOf(all: readonly Monster[], m: Monster, h: { x: number; y: number }): Monster | null {
  const H = HOUND.heel;
  // (the hero near it, or it struck: it is let slip)
  if (Math.hypot(h.x - m.x, h.y - m.y) < H.near || m.struckT !== undefined) return null;
  let best: Monster | null = null;
  let bestD = Infinity;
  for (const o of all) {
    if (o.dead || o.kind !== 'watch' || o.state === 'sleep') continue;
    const d = Math.hypot(o.x - m.x, o.y - m.y) - (o.packId === m.packId ? 100 : 0);
    if (Math.hypot(o.x - m.x, o.y - m.y) > H.r || d >= bestD) continue;
    best = o;
    bestD = d;
  }
  if (!best || Math.hypot(h.x - best.x, h.y - best.y) < H.slip) return null;
  return best;
}

/** Its place at his heels: behind him and to its side of him. */
export function heelOf(m: Monster, master: Monster): { x: number; y: number } {
  const H = HOUND.heel;
  return beside(master.x, master.y, master.fx, master.fy, handOf(true, master.fx, master.fy), -H.at, (m.seed < 0.5 ? 1 : -1) * H.side);
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  tick(R, m, dt) {
    if (m.state === 'act') return false;
    const g = R.g;
    const H = HOUND.heel;
    const master = g.over ? null : masterOf(g.monsters, m, g.hero);
    const a1 = (m.a1 ??= { heel: 0 });
    if (!master) {
      a1.heel = 0;
      return false;
    }
    // AT HIS HEELS: it lopes to its place when he has left it behind, and waits there, facing as he does
    const spot = heelOf(m, master);
    const dx = spot.x - m.x;
    const dy = spot.y - m.y;
    const d = Math.hypot(dx, dy);
    if (a1.heel === 1 ? d > H.there : d > H.leave) {
      a1.heel = 1;
      const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
      const step = Math.min(d, sp * dt);
      const x0 = m.x;
      const y0 = m.y;
      g.slide(m, Math.min(m.r, 0.42), (dx / d) * step, (dy / d) * step, g.level.walk, true);
      // (held up on its way: it is let go to come on as any)
      if (Math.hypot(m.x - x0, m.y - y0) < step * 0.3) {
        a1.heel = 0;
        return false;
      }
      m.fx = dx / d;
      m.fy = dy / d;
      m.state = 'chase';
      m.anim = 'walk';
      if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
      m.gait.t += step / GAIT.pace;
      return true;
    }
    // (there: it stands at his heels)
    a1.heel = 0;
    m.fx = master.fx;
    m.fy = master.fy;
    m.state = 'chase';
    m.anim = 'idle';
    if (!m.gait || m.gait.mode !== 'stand') m.gait = { mode: 'stand', t: 0 };
    m.gait.t += dt;
    return true;
  },
  acting(R, m, a, t0, t1) {
    if (a.id !== 'hound:pounce' || !(t0 < a.hit && t1 >= a.hit)) return;
    // (its forepaws slam down before it: whoever they come down on is struck)
    const g = R.g;
    const h = g.hero;
    const P = HOUND.pounce;
    const s = beside(m.x, m.y, m.fx, m.fy, m.act!.hand, P.at, 0);
    if (Math.hypot(h.x - s.x, h.y - s.y) <= P.r) R.blow(m, a.dmg);
    // (its paws on the floor: it makes no sound with its mouth, gagged)
    g.sfx('swing', 0.4);
  },
};
