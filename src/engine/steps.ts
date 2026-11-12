// THE LOADING SCREEN'S WORK IN SLICES (main.ts LOAD_SLICE; the queue's smooth-the-loading-screens-long-frames): what the
// loading screen waits for, made a step at a time, so that its ring goes on turning while the new place's pictures are made.
//
// A STEP is a piece of that work, small enough for one frame: it makes something that is kept once made (a builder's own
// cache, or a part put by for the builder to take: `Ahead`), so that what is made later finds it made. A step may give back
// more steps, done next (a builder in parts that it knows only once it is begun).

/** A step of the loading screen's work; it may give back more steps, to be done next. */
export type LoadStep = () => LoadStep[] | void;

/**
 * PARTS PUT BY FOR A BUILDER (LOAD_SLICE): a builder that makes all its pictures at once (an eager list of pieces) takes each
 * part from here if a step has made it ahead, or makes it as before. A part is taken once: the builder keeps what it makes as it
 * always did, and nothing is held here longer than it would have been held there. `clear` with the builder's own forgetting.
 */
export class Ahead {
  private readonly made = new Map<string, unknown>();

  /** The part made ahead under `key`, taken (it is not held here after), or made now by `make`. */
  take<T>(key: string, make: () => T): T {
    if (this.made.has(key)) {
      const v = this.made.get(key) as T;
      this.made.delete(key);
      return v;
    }
    return make();
  }

  /** A step that makes the part `key` ahead (none if it is made already and not yet taken). */
  step<T>(key: string, make: () => T): LoadStep {
    return () => {
      if (!this.made.has(key)) this.made.set(key, make());
    };
  }

  /** A step that makes the part `key` ahead IN STAGES (a painter written as a generator, `stagesStep`); none if it is put by already. */
  staged<T>(key: string, make: () => Stages<T>): LoadStep {
    return stagesStep(() => (this.made.has(key) ? null : make()), (v) => void this.made.set(key, v));
  }

  /** Whether a part is put by (for the tests). */
  has(key: string): boolean {
    return this.made.has(key);
  }

  /** How many parts are put by, not yet taken (for the tests). */
  get size(): number {
    return this.made.size;
  }

  /** Everything put by let go of (the builder's own pictures are let go of). */
  clear(): void {
    this.made.clear();
  }
}

/**
 * A PICTURE MADE IN STAGES (LOAD_SLICE; the queue's make-floors-look-builders-in-parts): a painter written as a generator, which
 * yields between its stages (a few rows of a solid marched, a solid) and returns the picture. Run through, it is the painter as it
 * was (`finish`); under the loading screen, a few stages a frame (`stagesStep`, `Ahead.staged`). The same work in the same order:
 * the same picture.
 */
export type Stages<T> = Generator<unknown, T, void>;

/** A painter in stages run through at once: what it returns. */
export function finish<T>(g: Stages<T>): T {
  let r = g.next();
  while (!r.done) r = g.next();
  return r.value;
}

/** How long a step of stages runs before it gives the frame back (thousandths of a second): under the loading screen's 50 a frame. */
export const STAGE_MS = 25;

/**
 * A step that runs the painter `make` makes a stage at a time, STAGE_MS of them a step, giving itself back until the painter is
 * done; `done` is given what it returns. (With nothing left to make, `make` returns null: no step.)
 */
export function stagesStep<T>(make: () => Stages<T> | null, done: (v: T) => void = () => {}): LoadStep {
  return () => {
    const g = make();
    if (!g) return;
    const next: LoadStep = () => {
      const t0 = performance.now();
      let r = g.next();
      while (!r.done && performance.now() - t0 < STAGE_MS) r = g.next();
      if (r.done) {
        done(r.value);
        return;
      }
      return [next];
    };
    return [next];
  };
}
