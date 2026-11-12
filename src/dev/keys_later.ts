// A MOVE'S KEYS WORKED OUT WHEN FIRST WANTED, OR AHEAD A SLICE AT A TIME (the queue's make-tinkerers-art-set-up-in-parts, 12 Nov
// 2026). A move whose keys take a while to work out (each pose solved, its elbows steadied: the Tinkerer's tap and hold, some 2.7 s;
// her fall, a tenth of a second) need not work them out as the figure's art is set up: the art needs only how long the move is,
// and her pictures taken from the bake never need its poses at all. So `motion.keys` is worked out when first read (a picture of
// the move painted), or ahead, a few slices a step, under the loading screen (keysAhead). The same numbers either way: the work is
// the same calls in the same order, only stopping between them.

import type { Key3, Motion } from '../art/skeleton';
import type { LoadStep } from '../engine/steps';

/** The work: it stops (yields) between slices of about the same size, and gives back the keys at its end. */
export type KeysWork = Generator<void, Key3[], void>;

class KeysLater {
  private go: KeysWork | null;
  private made: Key3[] | null = null;

  constructor(go: KeysWork) {
    this.go = go;
  }

  /** Worked out (the rest of it at once, if it is not yet). */
  get keys(): Key3[] {
    while (!this.made) this.slice(Infinity);
    return this.made;
  }

  get done(): boolean {
    return this.made !== null;
  }

  /** Up to `n` more slices of the work; true once it is done. */
  slice(n: number): boolean {
    for (let i = 0; i < n && !this.made; i++) {
      const r = this.go!.next();
      if (r.done) {
        this.made = r.value;
        this.go = null;
      }
    }
    return this.made !== null;
  }
}

const LATER = new WeakMap<object, KeysLater>();

/**
 * A move's motion whose keys are worked out by `work` when first read. The work does not begin until then (or until keysAhead's
 * steps do it). `move` (the move it is set in, once made) is what keysAhead and keysWorkedOut are asked about.
 */
export function laterMotion(work: () => KeysWork): { motion: Motion; own: (move: object) => void } {
  let later: KeysLater | null = null;
  const of = (): KeysLater => (later ??= new KeysLater(work()));
  const motion: Motion = {
    get keys(): Key3[] {
      return of().keys;
    },
  };
  return { motion, own: (move) => LATER.set(move, of()) };
}

/** How many slices of the work a step does (a slice: a key's pose worked out, or a key's elbow steadied: some 1 to 3 ms here). */
export const KEYS_SLICES = { per: 4 };

/** The move's keys worked out ahead, a few slices a step, each step giving back the next until they are done. None once they are (or for a move not made so). */
export function keysAhead(move: object): LoadStep[] {
  const later = LATER.get(move);
  if (!later || later.done) return [];
  const step: LoadStep = () => (later.slice(KEYS_SLICES.per) ? undefined : [step]);
  return [step];
}

/** Whether the move's keys are worked out yet (true for a move not made so). */
export function keysWorkedOut(move: object): boolean {
  return LATER.get(move)?.done ?? true;
}
