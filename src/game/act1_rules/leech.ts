// ACT 1: THE BOG LEECHES (FLOOR 10, THE SUNKEN FEN): its rules (game/act1_rules/types.ts).
//
// His design doc: "Bog Leeches | Tiny | They latch on and drain life until you dodge them off." His pick for its
// attack: "Leap, latch on, suck (Recommended)". The art chat's pictures, each with his yes (art/bog_leech.ts; 16 Oct,
// by 00:54, "Yes, as shown (Recommended)"): its slither, painted for 2.4 tiles a second; its leap and latch (1.9 s):
// reared and quivering through its warning, it springs, and CLAMPS ON at 0.633 s, its mouth 36 of its lengths (0.92
// tiles) before it, at the knight's thigh; it hangs on him drinking, swelling, to 1.25 s; drops off fat, lands at
// 1.4 s, and is back where it stood by 1.9 s. "How much it drinks, and whether it rides along as he moves, are yours."
// Tiny: one attack.
//
// THE LATCH (these rules'): at the blow, a hero its mouth reaches is bitten, and it HOLDS ON (Monster.a1.on): it RIDES
// ALONG with him, its mouth on him, wherever he goes, and DRINKS: every `drink.every` seconds a sip of `drink.dmg` of
// its blow, which heals it by what it takes. Its picture plays its clinging and swelling as painted, then goes on
// swelling and easing back over the last of it (`drink.loop`, there and back), for as long as it holds on. IT LETS GO
// (and drops fat, as its picture has it) when he DODGES IT OFF (any of his evasive moves: a roll, a leap, a warp), when
// it has drunk its fill (`drink.most` seconds on him), when what he passes scrapes it off (where it would hang is a
// wall), or when it is knocked off him (stunned, frozen or staggered, it falls behind). It misses a hero its mouth does
// not reach, or who is rolling, and drops where it sprang. No more than `most` hang on him (or spring at him) at once.
//
// Every number here that is a picture's is written down here; tests/act1_leech.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** THE BOG LEECH'S NUMBERS (tiles, seconds of its pictures). */
export const LEECH = {
  /** Its leap: it springs at `spring` (the end of its warning, BL_WARN[1]); its mouth clamps on at `hit` (BL_HIT), `at` tiles before it (BL_LATCH, 36 of its lengths); a hero up to `reach` before it and `half` to its side is reached. It lets go at `letGo` (BL_LETGO), lands at `land` (BL_LAND). */
  latch: { spring: 0.5, hit: 19 / 30, at: 36 / (32 / Math.sqrt(2 / 3)), reach: 1.2, half: 0.45, letGo: 1.25, land: 1.4 },
  /** Its drinking: a sip every `every` seconds, `dmg` of its blow; its fill, `most` seconds on him; its picture, once it has played its clinging to `loop[1]`, goes there and back over `loop`. */
  drink: { every: 0.5, dmg: 0.45, most: 3.0, loop: [1.05, 1.233] as const },
  /** How many may hang on him (or spring at him) at once. */
  most: 4,
};

/** Its slither, painted for 2.4 tiles a second; it stops at any frame of it. */
const GAIT: GaitDef = { pace: 2.4, cycle: 1 / 30, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: LEECH.latch.at, slack: 0.2, trueBack: false };

const ACTS: readonly ActDef[] = [{ id: 'leech:latch', clip: 'attack', long: 1.9, hit: LEECH.latch.hit, dmg: 0.8, cooldown: 0, first: 0, after: 0.7, near: 0, far: 1.15 }];

/** Where in its picture's clinging it is, `held` seconds after it clamped on: as painted, then there and back over the last of it. */
export function latchClock(held: number): number {
  const L = LEECH.latch;
  const [a, b] = LEECH.drink.loop;
  const t = L.hit + Math.max(0, held);
  if (t <= b) return t;
  const span = b - a;
  const u = (t - b) % (2 * span);
  return u < span ? b - u : a + (u - span);
}

/** Is it hanging on the hero now? */
export function latched(m: Monster): boolean {
  return !!m.a1 && m.a1.on === 1 && m.state === 'act' && !!m.act;
}

/** How many hang on him now, or are springing at him. */
function hanging(R: BossRules): number {
  let n = 0;
  for (const o of R.g.monsters) if (!o.dead && o.kind === 'leech' && (latched(o) || (o.state === 'act' && o.act && o.act.t < LEECH.latch.hit))) n++;
  return n;
}

/** It lets go of him: it drops, fat, where it hangs, as its picture has it. */
function letGo(m: Monster): void {
  if (m.a1) m.a1.on = 0;
  if (m.act) m.act.t = Math.max(m.act.t, LEECH.latch.letGo);
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  can(R) {
    return hanging(R) < LEECH.most;
  },
  start(_R, m) {
    m.a1 = { on: 0, held: 0, sip: 0, hx: 0, hy: 0 };
  },
  end(_R, m) {
    if (m.a1) m.a1.on = 0;
  },
  tick(R, m, dt) {
    const a1 = m.a1;
    if (!a1 || a1.on !== 1) return false;
    const g = R.g;
    const h = g.hero;
    // (broken off: it is down off him)
    if (m.state !== 'act' || !m.act) {
      a1.on = 0;
      return false;
    }
    // DODGED OFF (a roll, a leap; a warp, he is gone from under it), its fill drunk, or knocked off him (it was held still while he went on)
    const gone = Math.hypot(h.x - a1.hx, h.y - a1.hy) > 1.2;
    if (g.over || h.move || gone || a1.held >= LEECH.drink.most) {
      letGo(m);
      return false;
    }
    // IT RIDES ALONG, its mouth on him; scraped off where it would hang in a wall
    const x = h.x - m.fx * LEECH.latch.at;
    const y = h.y - m.fy * LEECH.latch.at;
    if (!g.free(g.level.walk, x, y, Math.min(m.r, 0.3))) {
      letGo(m);
      return false;
    }
    m.x = x;
    m.y = y;
    a1.hx = h.x;
    a1.hy = h.y;
    a1.held += dt;
    m.anim = 'attack';
    // IT DRINKS: a sip at a time, healed by what it takes
    a1.sip += dt;
    while (a1.sip >= LEECH.drink.every) {
      a1.sip -= LEECH.drink.every;
      const was = h.life;
      R.blow(m, LEECH.drink.dmg);
      const took = Math.max(0, was - h.life);
      if (took > 0) m.life = Math.min(m.maxLife, m.life + took);
      g.sfx('leech', 0.3);
    }
    return true;
  },
  acting(R, m, a, t0, t1) {
    if (a.id !== 'leech:latch') return;
    const g = R.g;
    const h = g.hero;
    const L = LEECH.latch;
    const act = m.act!;
    const r = R.rel(m);
    // THE LEAP: carried on (or back) along its line, so that its mouth comes down on him where its picture's does
    if (t1 > L.spring && t0 < L.hit && r.fwd > 0 && r.fwd < L.reach + 0.3 && Math.abs(r.left) <= L.half + 0.2) {
      const k = Math.min(1, (t1 - Math.max(t0, L.spring)) / Math.max(1e-6, L.hit - Math.max(t0, L.spring)));
      const go = (r.fwd - L.at) * k;
      g.slide(m, Math.min(m.r, 0.3), m.fx * go, m.fy * go, g.level.walk);
    }
    if (!(t0 < a.hit && t1 >= a.hit)) return;
    const near = R.rel(m);
    if (near.fwd > 0.15 && near.fwd <= L.reach && Math.abs(near.left) <= L.half && !h.move && h.invuln <= 0 && !g.over) {
      // CLAMPED ON
      const a1 = (m.a1 ??= { on: 0, held: 0, sip: 0, hx: 0, hy: 0 });
      a1.on = 1;
      a1.held = 0;
      a1.sip = 0;
      a1.hx = h.x;
      a1.hy = h.y;
      const x = h.x - m.fx * L.at;
      const y = h.y - m.fy * L.at;
      if (g.free(g.level.walk, x, y, Math.min(m.r, 0.3))) {
        m.x = x;
        m.y = y;
      }
      const was = h.life;
      R.blow(m, a.dmg);
      const took = Math.max(0, was - h.life);
      if (took > 0) m.life = Math.min(m.maxLife, m.life + took);
      g.emit({ t: 'text', x: h.x, y: h.y, text: 'Latched', color: '#ff8a80' });
      g.sfx('leech', 0.6);
    } else {
      // (missed: it drops where it sprang)
      act.t = Math.max(act.t, L.letGo);
      g.sfx('swing', 0.25);
    }
  },
};
