// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: THE HUSHED GROOMS: their rules (game/act1_rules/types.ts).
//
// His answers to the art chat (28 Oct 2026, all with the gardeners': game/act1_rules/gardener.ts says them; docs/mockups/
// swan_gardens/README.md): a stable groom of the palace in its livery, a pitchfork in his hands; “Rush at you”; “Shears snap,
// fork jab (Recommended)”; “The Hush leaves them (Recommended)”. The art chat's pictures (art/palace_hands.ts,
// palace_hands_moves.ts, PALACE_GROOM): STANDING, leaning on his fork stood at his side, at his work till he sees you; THE RUSH
// as the gardener's (PH_PACE, 1.6 tiles a second), the fork carried upright; THE FORK JAB (PH_BLOW, the gardener's timing): the
// fork brought down level in both hands and drawn back, its tines glinting pink, held shaking (THE WARNING, 0.26 to 0.48 s); hips
// first, a lunge, jabbed out its whole length at 18/30 of a second (THE BLOW), the tines a tile and a half before him; carried on
// through; drawn back and stood again. Struck; and the Hush leaving him, his fork dropping clear. Small: one attack.
//
// WHAT HE DOES (the main chat's helper's): THE FORK JAB, his one blow: at its moment, whoever is in the strip along the fork, from
// his breast out past the tines (`jab.at`, measured off the picture: forkOf) and on through where they are carried (`jab.out`) by
// `jab.more`, `jab.half` to either side of its line, is struck: a long narrow strip, 2.17 tiles before him and 1.2 across (his
// rule of 28 Oct, “And bigger AOE to compensate for the extra time the player gets to evade”: longer than the Hush's like
// kinds' blows, the townsfolk's grab, about 1.1 tiles, and floor 13's sickle, about 1.4). Through his wind-up it is marked on
// the floor in the enemy's pink (render/act1_fx/groom.ts). Laid in a pack, a groom is one of a crowd of the two: gardener.ts
// mixCrowd.
//
// Every number here that is a picture's is written down in gardener.ts (PALACE); tests/act2_palace_hands.test.ts holds it to
// the art.

import type { ActDef } from '../bosses';
import { JAB_STRIP, PALACE, inStrip, mixCrowd, palaceGait } from './gardener';
import type { Act1Rules } from './types';
import { GROOM_HORSE, LOOSE, WHISTLE_HIT, horseFormed, horseGone } from '../../art/action_f16_groom';
import { beside, fromFigure } from '../facing';
import type { BossRules } from '../bosses';
import type { Monster, Peril } from '../state';

const ACTS: readonly ActDef[] = [
  // (made from no further than the strip reaches with half a round of his rush to spare: wherever he stops, it reaches the hero)
  { id: 'groom:jab', clip: 'attack', long: PALACE.blow.long, hit: PALACE.blow.hit, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 1.9 },
];

const OLD: Act1Rules = {
  // (he stands off a little further than a gardener: his fork is longer)
  gait: palaceGait(1.25),
  acts: ACTS,
  spawned(_R, m) {
    mixCrowd(m);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    // (silent but their tools: the fork's rush through the air as it is jabbed out)
    if (at(PALACE.blow.hit - 0.08)) g.sfx('swing', 0.4);
    if (a.id !== 'groom:jab' || !at(a.hit)) return;
    // (the tines jabbed out their whole length: whoever is along the fork is struck)
    if (inStrip(R, m, JAB_STRIP)) R.blow(m, a.dmg);
  },
};

// LOOSE THE HORSE (GROOM_HORSE: art/action_f16_groom.ts, the art chat's, his pick of 31 Oct 2026, “Loose the horse (Recommended)”; brought
// in by the main chat, 2 Nov 2026, behind the same switch, off until his yes here). His one attack: two fingers in his mouth, he
// WHISTLES, HELD, while THE LINE is marked across the garden (from LOOSE.aim: from LOOSE.from behind him at his left, through where the
// hero stands then, LOOSE.lane on); at WHISTLE_HIT his arm flung out down it, and THE HORSE bursts out of the Hush's mist at the line's
// start and gallops down it at LOOSE.pace: a hero on the line within LOOSE.body of its middle as it comes by struck once and knocked
// LOOSE.knock. A spectral horse: it bursts out of mist wherever its line begins; but where the line meets a wall or a hedge past where
// the hero stood, it goes into the mist there (the line cut short: `HORSE_PERIL` d). He stands off where he can whistle at you.
/** The line and the horse on it (x, y the line's start; fx, fy its way; a its length, cut short at a wall; t from the hit; d: struck). */
export const HORSE_PERIL = 'groom:horse';
const WHISTLE_ACTS: readonly ActDef[] = [{ id: 'groom:whistle', clip: 'attack', long: LOOSE.long, hit: WHISTLE_HIT, dmg: 1.1, cooldown: 5, first: 0.5, after: 0.7, near: LOOSE.near, far: LOOSE.far }];
/** How long its line runs from its start (x, y) along (dx, dy), through the point `to` tiles along it: on past there to the first wall or hedge, or its whole length. */
function lineRun(R: BossRules, x: number, y: number, dx: number, dy: number, to: number): number {
  const g = R.g;
  const L = g.level;
  const W = L.floor.w;
  for (let d = Math.max(0, to); d < LOOSE.lane; d += 0.2) {
    const tx = Math.floor(x + dx * d);
    const ty = Math.floor(y + dy * d);
    if (tx < 0 || ty < 0 || tx >= W || ty >= L.floor.h || L.walk[ty * W + tx] !== 1) return Math.max(to + 1, d);
  }
  return LOOSE.lane;
}
/** How far down its line the horse is, and how much of it there is, `t` after it bursts out, on a line `long` long (gone into mist at its end). */
export function horseOn(t: number, long: number): { gone: number; formed: number } {
  const gone = horseGone(t);
  // (a line cut short: it goes into the mist over its own last tiles, as at the whole line's end)
  const shift = LOOSE.lane - long;
  const formed = gone > long - LOOSE.fade ? horseFormed((gone + shift) / LOOSE.pace) : horseFormed(t);
  return { gone, formed };
}
const WHISTLER: Act1Rules = {
  gait: palaceGait(3.4),
  acts: WHISTLE_ACTS,
  spawned: OLD.spawned,
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (at(LOOSE.aim)) {
      // THE LINE marked: from behind him at his left, through where the hero stands now
      const S = beside(m.x, m.y, m.fx, m.fy, act.hand, LOOSE.from[0], LOOSE.from[1]);
      const dx = h.x - S.x;
      const dy = h.y - S.y;
      const d = Math.hypot(dx, dy) || 1;
      const long = lineRun(R, S.x, S.y, dx / d, dy / d, d);
      R.peril(m, 'act1', S.x, S.y, { a1: HORSE_PERIL, t: -(WHISTLE_HIT - LOOSE.aim), hit: 0, dur: WHISTLE_HIT - LOOSE.aim + long / LOOSE.pace + 1.0, dmg: g.rollMonsterDmg(m) * a.dmg, fx: dx / d, fy: dy / d, a: long, d: 0 });
      g.sfx('gust', 0.5);
    }
    if (at(WHISTLE_HIT)) g.sfx('swing', 0.5);
  },
  peril(R, p) {
    if (p.a1 !== HORSE_PERIL || p.t < 0 || p.d) return;
    const g = R.g;
    const h = g.hero;
    const on = horseOn(p.t, p.a);
    if (on.formed <= 0.3 || on.gone > p.a) return;
    // (THE HORSE comes by: a hero on its line within LOOSE.body of its middle struck once, and knocked aside)
    const r = fromFigure(p.x, p.y, p.fx, p.fy, 1, h.x, h.y);
    if (Math.abs(r.left) > LOOSE.half || Math.abs(r.fwd - on.gone) > LOOSE.body) return;
    if (h.move || h.invuln > 0 || g.over) return;
    p.d = 1;
    g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x + p.fx * on.gone, p.y + p.fy * on.gone, p.half);
    g.knockHero(p.x + p.fx * (on.gone - 1), p.y + p.fy * (on.gone - 1), LOOSE.knock);
  },
};
void (null as unknown as Monster | Peril);

const pick = (): Act1Rules => (GROOM_HORSE.on ? WHISTLER : OLD);
export const RULES: Act1Rules | null = {
  get gait() {
    return pick().gait;
  },
  get acts() {
    return pick().acts;
  },
  spawned: (R, m) => pick().spawned?.(R, m),
  acting: (R, m, a, t0, t1, dt) => pick().acting(R, m, a, t0, t1, dt),
  peril: (R, p, dt) => pick().peril?.(R, p, dt),
};

/** Its switch, for game/enemy_moves.ts (the new enemy moves of floors 5 to 19 switched on together). */
export { GROOM_HORSE };
