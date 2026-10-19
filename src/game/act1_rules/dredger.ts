// ACT 2, THE HUSH: FLOOR 12: THE ORDER'S DREDGERS: their rules (game/act1_rules/types.ts).
//
// His doc's floor 12, the Undercity (with his yes as ideas): "Enemies: the Hushed, the Silent Order, and things that live in
// the sewers." These are the Silent Order's labourers in the sewers: the Order's blank white mask (the scribes') smeared with
// muck under a black hood, a long oilskin coat, waders, a wicker creel of voice jars on the back, a boathook. Masked: they make
// no sound with their mouths (the sound chat's, later). Their pictures are the art chat's (art/dredgers.ts, dredgers_moves.ts,
// makeDredgerArt3), made on his word of 18 Oct, 21:24 Pacific ("Hey go without my say so.  If something is shit I’ll get it
// to it but you’re doing a great jobs. At least for 11-15"), its notes docs/mockups/act2_undercity/README.md: their stand,
// leaning on the boathook; their wade, painted for DR_PACE; THE HOOK AND HAUL (the boathook levelled low and drawn back, its
// hook glinting pink, held shaking: the warning; hips first, a lunge, the pole THRUST OUT at 22/30 s; a twist as the hook
// BITES; a hard HAUL back, leaning into it, a step back; the pole stood again); struck; THE JARS BURST, their death. His
// standing word on the act's enemies: "let’s keep the acts separate".
//
// WHAT THEY DO, by those (the planning chat's helper's; the art: "what the hook does to the hero (it is drawn as a pull toward
// them)" is the game's):
// - THE HOOK AND HAUL, their blow: the pole thrust out at its picture's moment strikes whoever is before them along it, as far
//   as its hook is carried through (measured off the picture: 2.28 tiles out at the thrust, 2.46 at its whole length). One
//   who is out where the hook is, not in under the pole, is CAUGHT ON THE HOOK ("Hooked", as the Chained One's hook): held
//   (he cannot walk or dodge) from the thrust to the end of the haul, and, from the moment the hook bites to the end of the
//   haul, HAULED IN TOWARD THEM WITH IT, as far as the picture draws the hook in (from 2.44 tiles to 1.54: near a tile),
//   never nearer them than `least`; what he is dragged over scrapes the floor (render/act1_fx/dredger.ts, as the cliff
//   crawler's drag is drawn). So the pull is the crawler's kind, as the brief asked; the picture's own length of it.
// - ONE BLOW ONLY: his rule of 9 Oct (game/defs.ts MONSTER_ATTACKS) gives a medium kind two attacks; the art chat drew the
//   dredgers one (the hook and haul), so they have that one until it draws another (said in the report).
// - THEY WADE at their picture's pace, slow, and stop where their hook reaches you.
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and tests/act2_dredger.test.ts
// holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { TUNE } from '../defs';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE DREDGER'S NUMBERS: its pictures' own (art/dredgers_moves.ts DR_HAUL, the hook as the motion carries it: tiles before them, seconds) and the rules'. */
export const DREDGER = {
  /**
   * THE HOOK AND HAUL: the pole thrust out at `hit` (DR_HAUL.hit, 22/30 s); its hook BITES at `bite` (DR_HAUL.bite) and is
   * hauled in hardest at `haul` (DR_HAUL.haul), held there to `held` (the step back). Where the hook is, tiles before them,
   * moment by moment from the thrust to the end of the haul (`hook`: measured off the motion, poleOf(...).hook).
   */
  haul: { hit: 22 / 30, bite: 22 / 30 + 0.26, haul: 22 / 30 + 0.52, held: 22 / 30 + 0.52 + 0.14 },
  hook: [[22 / 30, 2.279], [0.85, 2.447], [22 / 30 + 0.26, 2.44], [1.1, 2.119], [1.2, 1.637], [22 / 30 + 0.52, 1.535]] as ReadonlyArray<readonly [number, number]>,
  /**
   * THE THRUST strikes whoever is in the strip before them from `from` to `reach` tiles (the pole out from their hands to its
   * hook carried through, and a little: the hero's middle), within `half` to either side. One struck at `catchFrom` tiles out
   * or more is where the hook is: caught on it. Hauled in, no nearer them than `least`.
   */
  strike: { from: 0.6, reach: 2.75, half: 0.55, catchFrom: 1.4, least: 1.1 },
};

/** Where the hook is (tiles before them) `t` seconds into the hook and haul, from the thrust on: straight between the moments of `DREDGER.hook` (as game/bosses.ts `along`, kept here so that this file asks nothing of that one but its types). */
export function hookAt(t: number): number {
  const keys = DREDGER.hook;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / Math.max(1e-9, t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

/** Their wade (DR_PACE, DR_WALK: twelve frames at eight a second, a round of 1.5 s, looping from their stand). From behind they are painted as the camera truly sees them (art/dredgers_moves.ts DREDGER.trueBack). */
export const DREDGER_GAIT: GaitDef = { pace: 0.85, cycle: 1.5, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.9, slack: 0.5, trueBack: true };

export const DREDGER_ACTS: readonly ActDef[] = [
  // THE HOOK AND HAUL (DR_HAUL: 2.0 s, the thrust at 22/30)
  { id: 'dredger:hook', clip: 'attack', long: 2.0, hit: 22 / 30, dmg: 1, cooldown: 0, first: 0, after: 1.0, near: 0, far: 2.5 },
];

/** What it keeps (Monster.a1): `hooked` 1 while it has the hero on its hook; where he was caught (`ox`, `oy`), for the scrape he leaves. */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { hooked: 0, ox: 0, oy: 0 });
}

/** Lets go of the hero, if it has him. */
function letGo(R: BossRules, m: Monster): void {
  const k = keep(m);
  if (!k.hooked) return;
  k.hooked = 0;
  R.g.hero.held = 0;
}

export const RULES: Act1Rules | null = {
  gait: DREDGER_GAIT,
  acts: DREDGER_ACTS,

  spawned(_R, m) {
    keep(m);
  },

  start(_R, m) {
    keep(m).hooked = 0;
  },

  end(R, m) {
    letGo(R, m);
  },

  died(R, m) {
    letGo(R, m);
  },

  acting(R, m, a, t0, t1) {
    if (a.id !== 'dredger:hook') return;
    const g = R.g;
    const h = g.hero;
    const k = keep(m);
    const H = DREDGER.haul;
    const S = DREDGER.strike;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (at(H.hit - 0.08)) g.sfx('swing', 0.6);
    if (at(a.hit)) {
      // THE THRUST: whoever is before them along the pole is struck; one out where the hook is, caught on it
      const r = R.rel(m);
      if (r.fwd >= S.from && r.fwd <= S.reach && Math.abs(r.left) <= S.half && h.invuln <= 0 && !h.move && !g.over) {
        const was = h.life;
        R.blow(m, a.dmg);
        if (r.fwd >= S.catchFrom && h.life < was) {
          k.hooked = 1;
          k.ox = h.x;
          k.oy = h.y;
          h.held = H.held - t1 + 0.05;
          g.emit({ t: 'text', x: h.x, y: h.y, text: 'Hooked', color: '#ff8a80' });
        }
      }
      g.emit({ t: 'shake', amount: 1 });
    }
    if (at(H.bite)) g.sfx('hit', 0.35);
    if (!k.hooked) return;
    if (g.over) {
      letGo(R, m);
      return;
    }
    // THE HAUL: from the bite he is drawn in with the hook, as far as the hook comes in (never nearer them than `least`)
    if (t1 > H.bite) {
      const step = hookAt(Math.max(t0, H.bite)) - hookAt(Math.min(t1, H.held));
      const r = R.rel(m);
      const room = Math.max(0, r.fwd - S.least);
      const pull = Math.min(Math.max(0, step), room);
      if (pull > 0) g.slide(h, TUNE.heroRadius, -m.fx * pull, -m.fy * pull, g.level.walk);
    }
    h.held = Math.max(h.held ?? 0, 0.05);
    if (t1 >= H.held) letGo(R, m);
  },
};
