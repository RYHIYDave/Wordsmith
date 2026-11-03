// THE WARLOCK STRUCK, THE MAN AND THE DEMON: HARD, AND FROM BEHIND (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE
// GAME IMPORTS IT.
//
// His pick, 28 Oct: “Warlock getting hit (Recommended)” (offered as: struck hard and from behind, the man and the demon), after
// the brawler's and hers (dev/brawler_hits.ts, dev/tinkerer_hits.ts: as short, 13 frames, the game showing a hit only a
// moment while a hero carries on). Told him how it was read: THE MAN, struck hard, the pain folding him and his demon arm
// flaring; struck from behind, lurching forward and glaring back over his shoulder. THE DEMON, struck hard, a snarl, its
// wings snapping open as it rocks back; struck from behind, its wings flung wide and a snap round at whatever hit it. His
// rulebook: a heavy blow rocks him (Hits 3); the strike a flash, what follows not (Movement 9); loose things follow (his
// coat's skirts; its wings and its tail: Movement 4); feet grip the floor, and the demon's claws (Movement 8).

import type { Bones, Key3, Motion } from '../art/skeleton';
import { FR, STANCE, T, clamp, curl } from './warlock_moves';
import type { WarlockMove } from './warlock_moves';
import { DEMON_STANCE, elbowsOf, track, wingsFrom } from './demon_moves';
import type { DemonMove } from './demon_moves';

/** Each blow through time, in frames (30 a second): its keys; it lands at the second (`hit`), snaps him by the third; his stance again by the last. */
export const WSTRUCK = { at: [0, 1, 3, 6, 9, 13], hit: 1, snapped: 3, end: 13 };
/** (still where the blow lands, and at the end) */
const HOLDS = new Set([1, 5]);
const key = (vals: number[], f: number): number => track(WSTRUCK.at.map((a, i) => [a, vals[i]] as const), f, HOLDS);
const ease = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
/** A foot stepped out over frames 2 to 6 and back in over 8 to 12: how far out (0 to 1) and how high it is lifted (0 to 1). */
function stepAt(f: number): { go: number; up: number } {
  const one = (a: number, b: number): { go: number; up: number } => {
    const u = Math.max(0, Math.min(1, (f - a) / (b - a)));
    const e = ease(u);
    return { go: ease((u - 0.12) / 0.76), up: 4 * e * (1 - e) };
  };
  const o = one(2, 6);
  const b = one(8, 12);
  return f < 8 ? o : { go: 1 - b.go, up: b.up };
}

// ---- THE MAN

/**
 * STRUCK HARD: the blow throws his head back and uncurls him, the demon arm flung up and its fire flaring; his back foot steps
 * back to catch him; the pain folds him right over, the arm hauled down, the fire guttering; he comes up, glaring.
 * STRUCK FROM BEHIND: thrown forward over his lead foot, folded, his head whipped back; he catches himself on it and glares
 * back over his right shoulder (the demon arm is his left), the fire flaring.
 */
function manStruck(behind: boolean): WarlockMove {
  const long = WSTRUCK.end * FR;
  const keys: Key3[] = [];
  const n = Math.round(long * 60);
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    const f = t / FR;
    const fold = behind ? key([0, 0, 16, 20, 8, 0], f) : key([0, 0, -14, 24, 10, 0], f);
    const step = stepAt(f);
    const pose: Partial<Bones> = {
      px: STANCE.px + T * (behind ? key([0, 0, 3.2, 4.0, 1.8, 0], f) : key([0, 0, -2.6, -3.4, -1.6, 0], f)),
      pz: STANCE.pz + T * (behind ? key([0, 0, -0.6, -1.6, -0.6, 0], f) : key([0, 0, -0.3, -1.8, -0.7, 0], f)),
      pitch: STANCE.pitch + (behind ? key([0, 0, 8, 4, 1, 0], f) : key([0, 0, -6, -2, -1, 0], f)),
      ...curl(fold),
      twist: STANCE.twist + (behind ? key([0, 0, 4, -8, -14, 0], f) : key([0, 0, 6, -2, 0, 0], f)),
      faceUp: STANCE.faceUp + (behind ? key([0, 0, 16, -6, 4, 0], f) : key([0, 0, 18, -12, -4, 0], f)),
      faceTurn: STANCE.faceTurn + (behind ? key([0, 0, 4, -40, -70, 0], f) : key([0, 0, -20, -8, -14, 0], f)),
      faceTilt: STANCE.faceTilt + (behind ? key([0, 0, 4, -4, -6, 0], f) : key([0, 0, -10, -2, -6, 0], f)),
      // (the demon arm flung, and hauled back down)
      lhIn: 0,
      lhx: STANCE.lhx + T * (behind ? key([0, 0, 2.4, 0.8, 0.4, 0], f) : key([0, 0, 1.8, -0.6, -0.4, 0], f)),
      lhy: STANCE.lhy + T * (behind ? key([0, 0, 0.6, 0.2, 0, 0], f) : key([0, 0, 1.2, -0.6, -0.2, 0], f)),
      lhz: STANCE.lhz + T * (behind ? key([0, 0, -0.6, -1.4, -0.4, 0], f) : key([0, 0, 2.4, -2.0, -0.6, 0], f)),
      le: STANCE.le + (behind ? key([0, 0, 10, -4, 0, 0], f) : key([0, 0, 22, -6, 2, 0], f)),
      // (the foot that catches him: his back foot for a blow from in front, his lead foot for one from behind)
      ...(behind
        ? { lfx: STANCE.lfx + 3.0 * T * step.go, lfz: STANCE.lfz + 1.6 * T * step.up, lfp: -10 * step.up }
        : { rfx: STANCE.rfx - 2.8 * T * step.go, rfz: STANCE.rfz + 1.6 * T * step.up }),
    };
    keys.push({ at: t, ease: 'lin', pose: { ...pose, ...clamp(pose) } });
  }
  const motion: Motion = { keys, loop: 0 };
  return {
    name: behind ? 'Struck from behind' : 'Struck hard',
    motion,
    long,
    loops: false,
    jolt: [(WSTRUCK.hit - 1) * FR, (WSTRUCK.snapped + 1) * FR],
    // (the fire in his claws flaring with the blow; guttering as the pain folds him; licking back up)
    fire: behind ? [[0, 4.0], [WSTRUCK.hit * FR, 4.0], [WSTRUCK.snapped * FR, 6.6], [7 * FR, 5.0], [long, 4.0]] : [[0, 4.0], [WSTRUCK.hit * FR, 4.0], [WSTRUCK.snapped * FR, 7.2], [6 * FR, 2.8], [9 * FR, 4.6], [long, 4.0]],
  };
}
/** THE MAN STRUCK HARD: thrown back, folded by the pain, the arm flaring. */
export function warlockReel(): WarlockMove {
  return manStruck(false);
}
/** THE MAN STRUCK FROM BEHIND: lurching forward, a glare back over his shoulder. */
export function warlockLurch(): WarlockMove {
  return manStruck(true);
}

// ---- THE DEMON

const S0 = DEMON_STANCE;
/**
 * STRUCK HARD: it rocks back off its claws (they keep their grip), its head snapped up and round, snarling; its wings snap
 * open; its tail lashes; it drops back onto its claws, its head low, and settles. STRUCK FROM BEHIND: driven forward and down
 * onto its claws, its wings flung wide, its head whipped up; it snaps its head round to glare back over its shoulder.
 */
function demonStruck(behind: boolean): DemonMove {
  const long = WSTRUCK.end * FR;
  const keys: Key3[] = [];
  const n = Math.round(long * 60);
  for (let i = 0; i <= n; i++) {
    const t = Math.min(long, i / 60);
    const f = t / FR;
    const pose: Bones = {
      ...S0,
      px: S0.px + (behind ? key([0, 0, 2.6, 3.2, 1.2, 0], f) : key([0, 0, -2.8, -3.4, -1.2, 0], f)),
      pz: S0.pz + (behind ? key([0, 0, -1.4, -2.4, -0.8, 0], f) : key([0, 0, 1.6, -1.4, -0.4, 0], f)),
      pitch: S0.pitch + (behind ? key([0, 0, 5, 3, 1, 0], f) : key([0, 0, -8, -2, 1, 0], f)),
      bend: S0.bend + (behind ? key([0, 0, 6, 3, 1, 0], f) : key([0, 0, -7, 2, 1, 0], f)),
      hunch: (S0.hunch ?? 0) + (behind ? key([0, 0, 7, 3, 0, 0], f) : key([0, 0, -10, 4, 2, 0], f)),
      roll: S0.roll + (behind ? key([0, 0, -2, 2, 1, 0], f) : key([0, 0, 3, 1, 0, 0], f)),
      faceUp: S0.faceUp + (behind ? key([0, 0, 12, 2, 4, 0], f) : key([0, 0, 16, -6, 4, 0], f)),
      faceTurn: S0.faceTurn + (behind ? key([0, 0, 6, -34, -52, 0], f) : key([0, 0, -18, -6, 4, 0], f)),
      faceTilt: S0.faceTilt + (behind ? key([0, 0, 4, -6, -8, 0], f) : key([0, 0, -10, -4, 0, 0], f)),
    };
    keys.push({ at: t, ease: 'lin', pose: elbowsOf(pose) });
  }
  return {
    name: behind ? 'The demon struck from behind' : 'The demon struck hard',
    motion: { keys, loop: 0 },
    long,
    loops: false,
    wings: wingsFrom((t) => {
      const f = t / FR;
      return behind
        ? { spread: key([1, 1, 1.6, 1.45, 1.15, 1], f), beat: key([0, 0, 0.5, 0.3, 0.08, 0], f), sweep: key([0, 0, -0.22, -0.1, 0, 0], f) }
        : { spread: key([1, 1, 1.5, 1.3, 1.1, 1], f), beat: key([0, 0, 0.45, 0.2, 0.05, 0], f), sweep: key([0, 0, 0.2, 0.05, 0, 0], f) };
    }),
    // (its claws' fire flaring with the blow, and dying back)
    fire: (t) => key([1, 1, 1.9, 1.4, 1.1, 1], t / FR),
    tail: (t) => (behind ? key([0, 0, -0.5, 0.35, -0.1, 0], t / FR) : key([0, 0, 0.45, -0.3, 0.1, 0], t / FR)),
    strike: [(WSTRUCK.hit - 1) * FR, (WSTRUCK.snapped + 1) * FR],
  };
}
/** THE DEMON STRUCK HARD: rocked back, snarling, its wings snapping open. */
export function demonReel(): DemonMove {
  return demonStruck(false);
}
/** THE DEMON STRUCK FROM BEHIND: driven down onto its claws, its wings flung wide, a glare back over its shoulder. */
export function demonLurch(): DemonMove {
  return demonStruck(true);
}
