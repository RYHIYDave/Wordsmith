// THE EFFECTS' LISTS OF FRAMES, painted the first time each list is wanted and kept (render/tinkerer_fx.ts, render/warlock_fx.ts).
// Their draws ask for some of them every frame, whether or not anything of theirs is in the air, so the world's first drawing
// painted all of them at once, whoever the hero: on a cloud machine, some 0.5 s of the 1.05 s drawing as the Brawler came into
// town (12 Nov 2026; the queue's smooth-the-loading-screens-long-frames).
//
// THE LOADING SCREEN'S WORK IN SLICES (main.ts LOAD_SLICE): `steps` makes such lists ahead, a frame a step, list by list in the
// order the draws ask for them; each frame is painted by the same code from its number alone, so the lists are the very ones.
// Asked for whole (as every draw asks), a list is finished then, as before.

import type { Sprite } from '../engine/px';
import type { LoadStep } from '../engine/steps';

export class FxLists {
  private readonly kept = new Map<string, Sprite[]>();
  /** Lists begun ahead, a frame a step, not finished yet. */
  private readonly begun = new Map<string, Sprite[]>();
  /** While on (a step of the loading screen's), a list not finished is painted one frame further, not whole. */
  private one = false;
  private finished = true;

  /** List `key`, its `n` frames each painted by `make` the first time the list is wanted, and kept. */
  readonly loop = (key: string, n: number, make: (i: number) => Sprite): Sprite[] => {
    const had = this.kept.get(key);
    if (had) return had;
    const list = this.begun.get(key) ?? [];
    if (this.one && list.length < n - 1) {
      list.push(make(list.length));
      this.begun.set(key, list);
      this.finished = false;
      return list;
    }
    for (let i = list.length; i < n; i++) list.push(make(i));
    this.begun.delete(key);
    this.kept.set(key, list);
    return list;
  };

  /** The loading screen's steps that make these lists ahead (each asked for as its draw asks for it), a frame a step. */
  steps(lists: readonly (() => unknown)[]): LoadStep[] {
    return lists.map((ask) => {
      const step = (): LoadStep[] | void => {
        this.one = true;
        this.finished = true;
        try {
          ask();
        } finally {
          this.one = false;
        }
        if (!this.finished) return [step];
      };
      return step;
    });
  }

  /** For the tests: whether list `key` is made whole, begun ahead, or not yet asked for. */
  state(key: string): 'kept' | 'begun' | 'none' {
    return this.kept.has(key) ? 'kept' : this.begun.has(key) ? 'begun' : 'none';
  }
}
