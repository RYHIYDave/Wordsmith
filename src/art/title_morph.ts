// The title's two paintings turning into each other. (The owner: "Actually shift the pictures
// from one to the other, have the librarian really devolve into the evil witch and back again.")
//
// Each painting comes as six groups, back to front, that match one to one (title.ts): everything
// behind, the big figure, the desk or cauldron, her arms, the things on top, the small figure.
// A picture part of the way through the change is put together from the back, group by group:
//
//   - everything behind changes as an uneven front spreading out from the lamp (which is where the
//     brew is), with a line of light riding on it;
//   - the big figure, the desk, her arms and the small figure each flow from one outline to the
//     other while the new colours sweep through them (morph.ts explains how). In her the sweep
//     begins in her eyes; in the desk under the lamp; in the child at the top of the head;
//   - the things on top have no partners (a lamp is not a bubble), so the one picture's go and the
//     other's come as the same sweep passes over the desk.
//
// The groups do not all change at once. She goes first and the child last, so that it reads as
// something happening TO the room, beginning with her.
//
// The way back is the same kind of change, not the way there run backwards: the library spreads
// from the lamp, with the lamp's gold on its front, and the librarian comes back from her eyes
// outward, the witch's hat sinking into her bun as it goes.
//
// Everything here is arithmetic on plain arrays (no canvas), so it runs in the tests.

import { rgba } from '../engine/px';
import { boxAround, comeAndGo, layerOf, morphInto, shapeOf, spreadField, spreadInto, sweepOrder, wobbleField } from './morph';
import type { Box, Layer, Shape } from './morph';
import type { TitleStack } from './title';

/** The groups that flow from one outline to the other. */
type Flowing = 'big' | 'objA' | 'arms' | 'small';

/**
 * When each group changes, as a part of the whole change: [begins, ends]. She leads; the room
 * behind her follows; the child, who is only watching, goes last. (Tuned by eye, on strips of
 * frames from the preview page: `preview_title.ts`, view `morph`.)
 */
const WHEN: Readonly<Record<'bg' | 'objB' | Flowing, readonly [number, number]>> = {
  big: [0, 0.75],
  arms: [0.05, 0.8],
  objA: [0.1, 0.85],
  bg: [0.16, 1],
  objB: [0.2, 0.8],
  small: [0.3, 1],
};

/** The order the groups are made ready in: smallest first, so the work comes in pieces of growing size. */
const READY_ORDER: readonly Flowing[] = ['small', 'arms', 'objA', 'big'];

export interface TitleMorphLook {
  /** Where the change in the background spreads from: the lamp, or the brew. */
  cx: number;
  cy: number;
  /** Her two eyes: the change in her begins there. */
  eyes: readonly (readonly [number, number])[];
  /** The colour of the light on that spreading front, on the way to the dream and on the way back ('#rrggbb'). */
  toDream: string;
  toReal: string;
  /** The colour of the line round every in-between shape. */
  ink: string;
}

export class TitleMorph {
  readonly w: number;
  readonly h: number;
  private readonly real: TitleStack;
  private readonly dream: TitleStack;
  private readonly inkRgb: readonly number[];
  private readonly toDream: readonly number[];
  private readonly toReal: readonly number[];
  /** What is ready so far. */
  private field: Float32Array | null = null;
  private things: [Layer, Layer] | null = null;
  private readonly shapes: Partial<Record<Flowing, [Shape, Shape]>> = {};
  /** The order the change sweeps through each group in. */
  private readonly orders: Partial<Record<Flowing | 'objB', Float32Array>> = {};
  /** The pieces of getting ready that are still to do, in order. */
  private readonly todo: (() => void)[] = [];

  /** Costs nothing: the work of getting ready is done later, a piece at a time (`warm`). */
  constructor(real: TitleStack, dream: TitleStack, look: TitleMorphLook) {
    this.real = real;
    this.dream = dream;
    this.w = real.bg.w;
    this.h = real.bg.h;
    this.inkRgb = rgba(look.ink);
    this.toDream = rgba(look.toDream);
    this.toReal = rgba(look.toReal);
    const { w, h } = this;
    // Where the change begins in each group, and so the order it sweeps through it in. (The
    // wobble keeps the edge of the sweep from being a ruled line. It is worked out in the first
    // piece of getting ready, which every other piece comes after.)
    const eyes = look.eyes;
    const faceX = eyes.reduce((n, e) => n + e[0], 0) / eyes.length;
    const faceY = eyes.reduce((n, e) => n + e[1], 0) / eyes.length;
    let wobble: Float32Array = new Float32Array(0);
    const late: Record<Flowing | 'objB', (x: number, y: number) => number> = {
      // her: in her eyes, and outward from them. (Upward counts for a quarter as far, so that her
      // bun goes up into the point of the hat in one movement, with her brow, and is not left
      // sitting on a finished brim. And below her chin the change runs down her at twice the pace:
      // it is her head that should be watched changing.)
      big: (x, y) => eyes.reduce((n, e) => Math.min(n, Math.hypot(x - e[0], down(y - e[1]))), Infinity) + 3 * wobble[y * w + x],
      // her arms: down from the shoulders, the hands last
      arms: (x, y) => Math.hypot(x - faceX, y - faceY) + 3 * wobble[y * w + x],
      // the desk and what is on it: from under the lamp, outward
      objA: (x, y) => Math.hypot(x - look.cx, y - look.cy) + 4 * wobble[y * w + x],
      objB: (x, y) => Math.hypot(x - look.cx, y - look.cy) + 4 * wobble[y * w + x],
      // the child: from the top of the head down to the boots
      small: (x, y) => y + 3 * wobble[y * w + x],
    };
    this.todo.push(() => {
      wobble = wobbleField(w, h);
    });
    this.todo.push(() => {
      this.field = spreadField(w, h, look.cx, look.cy, wobble);
    });
    this.todo.push(() => {
      const things: [Layer, Layer] = [layerOf(real.objB.d, w, h), layerOf(dream.objB.d, w, h)];
      this.things = things;
      // (a lamp, a bell, a bubble: each goes or comes where it stands, as the sweep reaches it)
      this.orders.objB = sweepOrder(things[0], things[1], late.objB, false);
    });
    for (const name of READY_ORDER) {
      // each of a pair is worked out only in the box that holds them both: the morph looks nowhere else
      let room: Box;
      let a: Shape;
      let b: Shape;
      this.todo.push(() => {
        room = boxAround(layerOf(real[name].d, w, h), layerOf(dream[name].d, w, h));
        a = shapeOf(real[name].d, w, h, room);
      });
      this.todo.push(() => {
        b = shapeOf(dream[name].d, w, h, room);
      });
      this.todo.push(() => {
        this.orders[name] = sweepOrder(a, b, late[name]);
        this.shapes[name] = [a, b];
      });
    }
  }

  /**
   * Do one piece of getting ready, if any is left. Returns true once everything is ready.
   * (All of it at once is a pause a phone could feel. The title rests on the library for a couple
   * of seconds before its first change, so the pieces are done then, one to a frame.)
   */
  warm(): boolean {
    const next = this.todo.shift();
    if (next) next();
    return this.todo.length === 0;
  }

  /**
   * Paint the picture that is `t` of the way from the library (0) to the dream (1) into `out`
   * (RGBA, w * h * 4). `back` says the change is on its way back to the library. Either way the
   * change spreads OUTWARD: on the way back it is the library that spreads from the lamp, with the
   * lamp's gold on its front in place of the brew's teal, and the librarian who comes back from
   * her eyes outward. At 0 and at 1 the result is the painting itself, exactly.
   */
  render(t: number, out: Uint8ClampedArray, back = false): void {
    while (!this.warm()) {
      // (asked for before the getting ready was done: finish it now)
    }
    // how far the change has got, whichever way it is going
    const u = back ? 1 - clamp01(t) : clamp01(t);
    /** How far one group has got: 0 = still the picture the change began from, 1 = changed. */
    const got = (name: keyof typeof WHEN): number => clamp01((u - WHEN[name][0]) / (WHEN[name][1] - WHEN[name][0]));
    // the picture the change began from, and the one it is on its way to
    const from = back ? 1 : 0;
    const to = 1 - from;
    const bg = [this.real.bg.d, this.dream.bg.d];
    spreadInto(out, bg[from], bg[to], this.field as Float32Array, got('bg'), back ? this.toReal : this.toDream);
    this.flow('big', out, from, got('big'));
    this.flow('objA', out, from, got('objA'));
    this.flow('arms', out, from, got('arms'));
    const things = this.things as [Layer, Layer];
    comeAndGo(out, things[from], got('objB'), false, this.orders.objB);
    comeAndGo(out, things[to], got('objB'), true, this.orders.objB);
    this.flow('small', out, from, got('small'));
  }

  /** One group, `k` of the way from the picture the change began from (`from`: 0 for the library, 1 for the dream) to the other. */
  private flow(name: Flowing, out: Uint8ClampedArray, from: number, k: number): void {
    const pair = this.shapes[name] as [Shape, Shape];
    morphInto(out, pair[from], pair[1 - from], k, this.inkRgb, this.orders[name]);
  }
}

/** How far a pixel `dy` rows below her eyes (above them, if less than 0) counts as being from them. */
function down(dy: number): number {
  return dy < 0 ? dy * 0.25 : dy <= 26 ? dy : 26 + (dy - 26) * 0.5;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
