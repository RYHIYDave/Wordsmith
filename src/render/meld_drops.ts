// RUNEDUST AND THE MELDSTONE IN THE GAME: where their pictures (art/meld_drops.ts, behind MELD_DROPS, off)
// play, and when. The main chat's, 16 Oct 2026, at his word: "Runedust and the meldstone need to be done".
// Nothing here is drawn while MELD_DROPS is off: the stand-ins of art/icons.ts are, as before.
//
//   THE MELDSTONE BURSTING UP OUT OF THE FLESHMANCER'S PIT (riseOf, by the drop's age: the rules hold it
//     under the floor while he is dragged down, game/melds.ts STONE_RISE): a crack of its light in the floor;
//     it shoots up spinning, its halves torn apart and blazing; hangs; SLAMS together in a burst of light,
//     the screen kicked; and comes down to hang over the floor, turning to and fro.
//   TAKEN (takenOf, from the rules' 'stoneGot'): it leaps over the hero's head, wrenches apart, SLAMS
//     together in a burst, everything held a beat, and dives into his chest. Then it shows by INVENTORY
//     (ui/hud.ts) while he carries it.
//   GIVEN (givenOf, from 'stoneGiven'): it rises out of him and floats over the wordsmith's slab; splits;
//     its halves whirl round each other faster and faster and SLAM together in a great burst; and from
//     then on it goes round and round the column of light over his slab, turning as it goes (orbitAt),
//     the sign that he can meld.
//   RUNEDUST TAKEN (from 'dustGot'): it whirls up round the hero and pours into him.

import type { GameEvent } from '../game/state';

/** How high it hangs over the floor (game pixels), and how far it bobs. */
export const HOVER = 8;
export const BOB = 1.5;
/** How high it hangs over the wordsmith's slab (the slab's top is 11 up). */
export const KEPT_Z = 40;
/** In the wordsmith's ring, bright with its own light and letters, it is drawn this much bigger, to be seen. */
export const KEPT_SCALE = 1.35;
/** Kept by the wordsmith, it goes round the column of light over his slab: how far out (tiles), and once round in so many seconds. */
export const ORBIT = { r: 0.75, secs: 7 } as const;

/** Where the kept Meldstone is at the clock's `t`, round the slab at `slab`. */
export function orbitAt(t: number, slab: readonly [number, number]): { x: number; y: number; z: number } {
  const a = (t / ORBIT.secs) * Math.PI * 2;
  return { x: slab[0] + Math.cos(a) * ORBIT.r, y: slab[1] + Math.sin(a) * ORBIT.r, z: KEPT_Z + BOB * Math.sin(t * Math.PI) };
}

export type StoneShown = 'apart' | 'whole' | 'hang';

export interface StoneAt {
  /** How high (game pixels); null: not shown. */
  z: number | null;
  /** Its turn (degrees) when it spins; its look. */
  yaw: number;
  shown: StoneShown;
  /** How big (1 as painted). */
  scale: number;
  /** Its burst of light: how big and how strong; null, none. */
  burst: { scale: number; alpha: number } | null;
  /** The crack of its light in the floor (0 to 1 open; and how strong); null, none. */
  crack: { k: number; alpha: number } | null;
  /** The moment of its slam has come (the screen kicks once, the first time this is true). */
  slammed: boolean;
}

const ease = (k: number): number => k * k * (3 - 2 * k);
const clamp01 = (k: number): number => Math.max(0, Math.min(1, k));
const bobAt = (t: number): number => BOB * Math.sin(t * Math.PI);

/** When the drop's rise happens, from its age (it is under the floor while its age is below 0). */
export const RISE = { crackFrom: -0.4, top: 0.3, slam: 0.55, burst: 0.32, down: 1.2, topZ: 38 } as const;

/** The Meldstone as it drops: its age (seconds; below 0 still under the floor), and the clock `t` for its bob. */
export function riseOf(age: number, t: number): StoneAt {
  const crack = age >= RISE.crackFrom && age < 0.25 ? { k: clamp01((age - RISE.crackFrom) / -RISE.crackFrom), alpha: age < 0 ? 1 : 1 - age / 0.25 } : null;
  if (age < 0) return { z: null, yaw: 0, shown: 'whole', scale: 1, burst: null, crack, slammed: false };
  if (age < RISE.top) {
    // shot up out of the floor, spinning, torn apart
    const k = age / RISE.top;
    return { z: RISE.topZ * (1 - (1 - k) * (1 - k)), yaw: 1080 * k, shown: 'apart', scale: 0.7 + 0.3 * k, burst: null, crack, slammed: false };
  }
  if (age < RISE.slam) {
    // hung at the top, still spinning, straining
    const k = (age - RISE.top) / (RISE.slam - RISE.top);
    return { z: RISE.topZ + 2 * Math.sin(k * Math.PI), yaw: 1080 + 400 * k, shown: 'apart', scale: 1 + 0.15 * k, burst: null, crack, slammed: false };
  }
  const since = age - RISE.slam;
  const burst = since < RISE.burst ? { scale: 0.5 + (since / RISE.burst) * 1.1, alpha: 1 - since / RISE.burst } : null;
  if (age < RISE.down) {
    // slammed together; down to hang, its spin running down
    const k = ease((age - RISE.slam) / (RISE.down - RISE.slam));
    return { z: RISE.topZ + (HOVER + bobAt(t) - RISE.topZ) * k, yaw: 1480 + 260 * k, shown: 'whole', scale: 1, burst, crack, slammed: true };
  }
  return { z: HOVER + bobAt(t), yaw: 0, shown: 'hang', scale: 1, burst, crack, slammed: true };
}

/** When the taking happens, from the moment it is taken. */
export const TAKEN = { leap: 0.22, slam: 0.5, burst: 0.3, gone: 0.8, topZ: 46, chestZ: 20 } as const;

/** The Meldstone taken, `g` seconds after: where it is between where it hung (`from`, tiles) and the hero (`to`), how high, how it looks. */
export function takenOf(g: number, from: readonly [number, number], to: readonly [number, number]): (StoneAt & { x: number; y: number }) | null {
  if (g < 0 || g >= TAKEN.gone) return null;
  const since = g - TAKEN.slam;
  const burst = since >= 0 && since < TAKEN.burst ? { scale: 0.6 + (since / TAKEN.burst) * 1.2, alpha: 1 - since / TAKEN.burst } : null;
  if (g < TAKEN.leap) {
    const k = ease(g / TAKEN.leap);
    return { x: from[0] + (to[0] - from[0]) * k, y: from[1] + (to[1] - from[1]) * k, z: HOVER + (TAKEN.topZ - HOVER) * k, yaw: 720 * k, shown: k > 0.4 ? 'apart' : 'whole', scale: 1, burst, crack: null, slammed: false };
  }
  if (g < TAKEN.slam) {
    // over his head, wrenched wider and wider apart
    const k = (g - TAKEN.leap) / (TAKEN.slam - TAKEN.leap);
    return { x: to[0], y: to[1], z: TAKEN.topZ + 2 * Math.sin(k * Math.PI), yaw: 720 + 300 * k, shown: 'apart', scale: 1 + 0.3 * k, burst, crack: null, slammed: false };
  }
  // slammed; dives into his chest
  const k = clamp01((g - TAKEN.slam - 0.06) / (TAKEN.gone - TAKEN.slam - 0.06));
  return { x: to[0], y: to[1], z: TAKEN.topZ + (TAKEN.chestZ - TAKEN.topZ) * k * k, yaw: 1020 + 360 * k, shown: 'whole', scale: 1.15 - 0.95 * k * k, burst, crack: null, slammed: true };
}

/** When the giving happens, from the moment it is given. */
export const GIVEN = { risen: 0.5, over: 1.3, split: 1.45, slam: 2.25, burst: 0.45, settled: 2.9, riseZ: 34 } as const;

export interface GivenAt {
  /** The whole stone (null while its halves are apart). */
  stone: (StoneAt & { x: number; y: number }) | null;
  /** Its halves, apart, whirling round each other: where each is (tiles), how high, its turn. */
  halves: { x: number; y: number; z: number; yaw: number }[] | null;
  burst: { scale: number; alpha: number } | null;
  slammed: boolean;
}

/** The Meldstone given to the wordsmith, `g` seconds after: from the hero (`hero`, tiles) to over his slab (`slab`). */
export function givenOf(g: number, t: number, hero: readonly [number, number], slab: readonly [number, number]): GivenAt | null {
  if (g < 0) return null;
  const since = g - GIVEN.slam;
  const burst = since >= 0 && since < GIVEN.burst ? { scale: 0.6 + (since / GIVEN.burst) * 1.8, alpha: 1 - since / GIVEN.burst } : null;
  const whole = (x: number, y: number, z: number, shown: StoneShown, yaw: number, scale: number, slammed: boolean): GivenAt => ({
    stone: { x, y, z, yaw, shown, scale, burst: null, crack: null, slammed },
    halves: null,
    burst,
    slammed,
  });
  if (g < GIVEN.risen) {
    // up out of him
    const k = ease(g / GIVEN.risen);
    return whole(hero[0], hero[1], 16 + (GIVEN.riseZ - 16) * k, 'hang', 0, 0.4 + 0.6 * k, false);
  }
  if (g < GIVEN.over) {
    // over to the slab
    const k = ease((g - GIVEN.risen) / (GIVEN.over - GIVEN.risen));
    return whole(hero[0] + (slab[0] - hero[0]) * k, hero[1] + (slab[1] - hero[1]) * k, GIVEN.riseZ + (KEPT_Z + 2 - GIVEN.riseZ) * k + 6 * Math.sin(k * Math.PI), 'hang', 0, 1, false);
  }
  if (g < GIVEN.split) {
    // a shudder, its halves straining
    const k = (g - GIVEN.over) / (GIVEN.split - GIVEN.over);
    return whole(slab[0], slab[1], KEPT_Z + 2, 'apart', 30 * Math.sin(k * Math.PI * 4), 1 + 0.1 * k, false);
  }
  if (g < GIVEN.slam) {
    // its halves torn apart, whirling round each other, faster and faster; then crashing back in
    const k = (g - GIVEN.split) / (GIVEN.slam - GIVEN.split);
    const turn = Math.PI * 2 * (0.5 * k + 2.2 * k * k);
    const r = 0.55 * Math.min(1, k / 0.22) * (k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1);
    const z = KEPT_Z + 2 + 4 * Math.sin(k * Math.PI);
    const halves = [0, 1].map((n) => {
      const a = turn + n * Math.PI;
      return { x: slab[0] + Math.cos(a) * r, y: slab[1] + Math.sin(a) * r, z: z + 2 * Math.sin(a * 2), yaw: (a * 180) / Math.PI + 90 };
    });
    return { stone: null, halves, burst: null, slammed: false };
  }
  // slammed together; it goes out to its round of the column of light, still spinning, and on round it
  const o = orbitAt(t, slab);
  const k = ease(clamp01((g - GIVEN.slam) / (GIVEN.settled - GIVEN.slam)));
  if (g < GIVEN.settled) return whole(slab[0] + (o.x - slab[0]) * k, slab[1] + (o.y - slab[1]) * k, KEPT_Z + 2 + (o.z - KEPT_Z - 2) * k, 'whole', 720 * (1 - k), 1.2 - 0.2 * k, true);
  return whole(o.x, o.y, o.z, 'hang', 0, 1, true);
}

/** Its moments now playing: the clock's time of each, and what is needed of the moment it began. */
export class MeldDrops {
  /** Runedust taken: when, and how much. */
  whirls: { at: number; n: number }[] = [];
  /** The Meldstone taken: when, and where it hung. */
  taken: { at: number; x: number; y: number; slammed: boolean } | null = null;
  /** The Meldstone given: when, and where the hero stood. */
  given: { at: number; hx: number; hy: number; slammed: boolean } | null = null;
  /** The drops whose slam has kicked the screen already. */
  readonly slammedDrops = new WeakSet<object>();

  /** What the rules say happened, at the clock's `clock`; the hero where he stands. */
  see(events: readonly GameEvent[], clock: number, hero: { x: number; y: number }): void {
    for (const e of events) {
      if (e.t === 'dustGot') this.whirls.push({ at: clock, n: e.n });
      else if (e.t === 'stoneGot') this.taken = { at: clock, x: e.x, y: e.y, slammed: false };
      else if (e.t === 'stoneGiven') this.given = { at: clock, hx: hero.x, hy: hero.y, slammed: false };
    }
  }

  /** Forget what has played out by `clock`. */
  tidy(clock: number): void {
    this.whirls = this.whirls.filter((w) => clock - w.at < 1);
    if (this.taken && clock - this.taken.at > 1.5) this.taken = null;
    if (this.given && clock - this.given.at > GIVEN.settled + 0.5) this.given = null;
  }

  /** A new run, or a new level: nothing playing. */
  clear(): void {
    this.whirls = [];
    this.taken = null;
    this.given = null;
  }
}
