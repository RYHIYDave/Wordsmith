// ACT 2, THE HUSH: FLOOR 13, THE MILLRACE: THE SILENT ORDER'S CARTERS: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", level 13, "Out a side gate and along the river, following the night carts."):
// "Enemies: the Silent Order's carters, and the Hushed working the fields." The art chat's pictures (art/carters.ts,
// carters_moves.ts; docs/mockups/act2_millrace/README.md), made on his word of 18 Oct, 21:24 Pacific ("Hey go without my
// say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15"): the Order's men who
// drive the night carts of stolen voices out to the mill, masked, a long carter's whip. Their trudge, painted for 0.85
// tiles a second; THE WHIP CRACK, swung back over the right shoulder, its cracker glinting pink (the warning, 0.36 to 0.58
// s), then the lash rolled out before them, CRACKING at 25/30 of a second about 1.8 tiles out, head-high, rolled out its
// whole length (about 2.65 tiles) at 0.9, on the ground by 1.12, drawn back 1.15 to 1.75; their death over onto their back.
// The art leaves to the game "what the lash does to the hero (it reaches about 2.65 tiles at most)".
//
// WHAT IT DOES (the planning chat's helper's pick, as the cliff crawler's grab is the descent's medium's):
// - THE CRACK: from its crack, as the lash rolls on out to its whole length, its end goes from `crack` to `out` (the
//   picture's, measured): what is in the lash's line before them as far as its end has come is struck, once.
// - THE LASH COILS ROUND ONE IT CATCHES NEAR ITS END (`wrap.from` tiles out and further, where only the lash's end is): and
//   as the carter draws it back (the picture's `draw`), he is dragged in toward the carter, `wrap.drag` tiles at most and no
//   nearer than `wrap.near`; held while he is dragged, as the crawler's grab holds him. So one who stands off from a carter
//   is pulled in among the sickles of the fields; one close in takes the lash's weight, and stays where he is.
// - TWO ATTACKS, his rule of 9 Oct (a medium monster's two; the main chat's, 19 Oct, as the dredger's are): THE LASH, their
//   basic blow (it cracks and is drawn back empty: never a coil), and THE COIL, their big one, made only when he stands where
//   its end can catch him (`wrap.from` tiles out or more): coiled round and dragged in, a blow and a quarter, every 6 seconds
//   at most. The same picture for both.
//
// Every number here that is a picture's is written down here; tests/act2_carter.test.ts holds it to the art.

import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE CARTERS' NUMBERS (tiles before them and to their left; seconds of their pictures). */
export const CARTER = {
  /**
   * The lash: it cracks at `hit` (CT_WHIP.hit, frame 25 of 30), its end then at `crack`; rolled out its whole length at
   * `full`, its end at `out` (the picture's cracker, measured). What is from `from` before them out to where its end has
   * come, and within `half` of its line to either side, is struck as its end reaches him.
   */
  lash: { hit: 25 / 30, full: 0.9, crack: [1.787, -0.358] as const, out: [2.641, -0.269] as const, from: -0.2, half: 0.5 },
  /** One struck `from` tiles out or further is coiled round by its end and dragged in as it is drawn back (`draw`, CT_WHIP.draw), `drag` tiles at most, no nearer than `near`. */
  wrap: { from: 1.5, draw: [1.15, 1.75] as const, drag: 1.3, near: 1.1 },
};

/** How far out the lash's end is `t` seconds into the crack (from its crack to its whole length; nearer before). */
export function lashReach(t: number): { fwd: number; left: number } {
  const L = CARTER.lash;
  const k = Math.max(0, Math.min(1, (t - L.hit) / (L.full - L.hit)));
  return { fwd: L.crack[0] + (L.out[0] - L.crack[0]) * k, left: L.crack[1] + (L.out[1] - L.crack[1]) * k };
}

/** Their trudge, painted for 0.85 tiles a second (CT_PACE); they stop at any frame of it, as the game's monsters on the bones always have; and stand off at the lash's length. */
const GAIT: GaitDef = { pace: 0.85, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.0, slack: 0.4, trueBack: true };

const ACTS: readonly ActDef[] = [
  { id: 'carter:lash', clip: 'attack', long: 1.9, hit: CARTER.lash.hit, dmg: 1, cooldown: 0, first: 0, after: 0.9, near: 0, far: CARTER.lash.out[0] },
  { id: 'carter:coil', clip: 'attack', long: 1.9, hit: CARTER.lash.hit, dmg: 1.25, cooldown: 6, first: 1.5, after: 0.9, near: CARTER.wrap.from, far: CARTER.lash.out[0] },
];

/** What it keeps (Monster.a1): `grab` 1 while its lash holds the hero; where it caught him (`ox`, `oy`), for the scrape he leaves as he is dragged. */
function keep(m: Monster): Record<string, number> {
  return (m.a1 ??= { grab: 0, ox: 0, oy: 0 });
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  start(_R, m) {
    keep(m).grab = 0;
  },
  end(R, m) {
    const k = keep(m);
    if (k.grab) {
      k.grab = 0;
      R.g.hero.held = 0;
    }
  },
  died(R, m) {
    if (m.a1 && m.a1.grab) R.g.hero.held = 0;
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const k = keep(m);
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id !== 'carter:lash' && a.id !== 'carter:coil') return;
    const L = CARTER.lash;
    const W = CARTER.wrap;
    if (at(0.6)) g.sfx('swing', 0.55);
    // THE CRACK, and the lash rolling on out to its whole length: what is in its line as far as its end has come is struck, once
    if (!act.b && t1 >= L.hit && t0 < L.full + 1e-6) {
      const end = lashReach(Math.min(t1, L.full));
      const r = R.rel(m);
      // (the lash runs out straight before them from the hand at their right: its line a little to their right all along)
      const off = Math.abs(r.left - end.left);
      if (r.fwd >= L.from && r.fwd <= end.fwd + TUNE.heroRadius * 0.5 && off <= L.half) {
        act.b = 1;
        R.blow(m, a.dmg);
        // (caught by its end: coiled round)
        if (a.id === 'carter:coil' && r.fwd >= W.from && h.invuln <= 0 && !h.move && !g.over) {
          k.grab = 1;
          k.ox = h.x;
          k.oy = h.y;
          h.held = W.draw[1] - t1 + 0.05;
          g.emit({ t: 'text', x: h.x, y: h.y, text: 'Lashed', color: '#ff8a80' });
        }
      }
    }
    if (at(L.hit)) g.sfx('hit', 0.5);
    // THE DRAG, as the lash is drawn back: in toward the carter, no nearer than its own length's start
    if (k.grab && t1 > W.draw[0]) {
      if (g.over) {
        k.grab = 0;
        return;
      }
      const dx = m.x - h.x;
      const dy = m.y - h.y;
      const d = Math.hypot(dx, dy) || 1;
      const share = (Math.min(t1, W.draw[1]) - Math.max(t0, W.draw[0])) / (W.draw[1] - W.draw[0]);
      const step = Math.max(0, Math.min(W.drag * share, d - W.near));
      if (step > 0) g.slide(h, TUNE.heroRadius, (dx / d) * step, (dy / d) * step, g.level.walk);
      h.held = Math.max(h.held ?? 0, 0.05);
      if (t1 >= W.draw[1]) {
        k.grab = 0;
        h.held = 0;
      }
    }
  },
};
