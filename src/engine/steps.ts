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
