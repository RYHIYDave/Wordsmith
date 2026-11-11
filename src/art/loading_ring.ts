// THE LOADING SCREEN'S PICTURE: THE WORDSMITH'S RING, BURNING IN THE DARK (11 Nov 2026). A MOCK-UP BEHIND A SWITCH THAT IS OFF:
// LOADING_RING.on. With it off the loading screen is as it has been (main.ts drawLoading: the word LOADING and three marks
// under it lit in turn, on dark ink).
//
// The queue's item “Paint a nicer loading screen” (paint-loading-screen, added by the art chat, 10 Nov 2026). His word on the
// loading screen as it is, shown its picture (loading_screen.png) on 7 Nov 2026, by 22:55: “Yes, but nicer later”.
//
// NOTHING HERE IS NEW ART. His words on the art, 9 Nov 2026: he wants “a good level of quality” held and “the little things
// be better instead of just improved paintings”; and the Gate Ward and the Brawler are the measure for new art, what is finer
// sent back the same as what is rougher. So the picture is laid up out of pictures the game has, at the game's own grain: the
// wordsmith's ring as the town has had it since Version 19.6 (art/ring3.ts; his “Just right (Recommended)”, 8 Oct 2026), in the
// vault's stone as it was first painted and shown him, alone in the dark:
//   - THE CIRCLE IN THE FLOOR burning, its two bright arcs chasing each other round it (what says "at work" here, as the
//     three marks lit in turn did);
//   - THE SIX STANDING STONES round it, a rune burning in each; as the head of an arc comes by a stone its rune flares, light
//     licks up the stone and motes go up off it, and it dies back;
//   - THE SLAB in its middle, the master rune-stone in it, and THE COLUMN OF LIGHT over it, runes climbing in it;
//   - THE LETTERS OF LIGHT swirling round inside the ring.
// The word LOADING stands under it (main.ts), as before. No one is in it. What glows is his, so it is cyan.
//
// A STILL FIRST: while a place's pictures are made the game cannot draw, so the frame seen longest is the first (time 0). At
// time 0 two stones have just flared, across the ring from each other.
//
// CHEAP: the pictures are the ring's own, each painted the first time it is shown (a few thousandths of a second each, nine of
// them for the first frame); after the first frame no more than LOAD_PAINT new ones are painted in a frame, the nearest one
// painted shown meanwhile (a stone whose flare is not painted yet burns lower for that frame). Nothing is painted twice: a
// loading screen after the first of a run of the game costs only its drawing.

import { drawLights, drawSprite } from '../engine/px';
import type { Sprite } from '../engine/px';
import { VAULT } from './ground';
import { COLUMN_FRAMES, FLOOR_FRAMES, STONE_AT, STONE_FRAMES, makeRing3, swirlAt } from './ring3';
import type { Blaze, Ring3Art } from './ring3';

/** THE SWITCH: the loading screen shows this picture only while it is on. Off until he has seen its picture and said yes. */
export const LOADING_RING = { on: true };

/** The screen's own dark, round the picture (the start screen's: ui/panels.ts SMITH_NIGHT). */
export const LOAD_NIGHT = '#05040f';

// ---------------------------------------------------------------------------------------------
// Where things are, in game pixels from the middle of the ring (a floor tile is 32 across and 16 down: engine/iso.ts)

const TILE_W = 32;
const TILE_H = 16;
const across = (x: number, y: number): number => ((x - y) * TILE_W) / 2;
const down = (x: number, y: number): number => ((x + y) * TILE_H) / 2;
/** The slab's top over its foot (as the renderer stands the column on it: render/render.ts standRing3). */
const SLAB_TOP = 11;
/** How far the picture reaches up and down from the middle of the ring: the head of the column; the front of the circle. */
export const LOAD_UP = 88;
export const LOAD_DOWN = 30;

// ---------------------------------------------------------------------------------------------
// THE PICTURE'S LIFE, as numbers of time

/** The circle's frames a second (as in town at rest: art/townscene.ts), and the frame it is on at time 0. */
export const LOAD_TURN_FPS = 10;
export const LOAD_TURN_AT = 4;
/** Where round the circle each standing stone stands, as the circle's own picture counts it (0 at the back, going round by the right; art/ring3.ts makeFloor3). */
const stoneRound = (v: number): number => {
  const [x, y] = STONE_AT[v];
  return ((Math.atan2(down(x, y) / 26.5, across(x, y) / 53) / (Math.PI * 2) + 1.25) % 1 + 1) % 1;
};
/** How far past stone `v` the head of an arc is, the circle on frame `f`: 0 as it comes by, up to 1 as the next one comes. */
const past = (v: number, f: number): number => ((((f / FLOOR_FRAMES - stoneRound(v)) % 0.5) + 0.5) % 0.5) / 0.5;
/** How a stone burns by how far past it the head is: flaring as it comes by, then a pulse on it, then burning. */
const blazeOf = (p: number): Blaze => (p < 0.25 ? 3 : p < 0.5 ? 2 : 1);

/** One thing of the picture at a moment: what it is and which of its pictures, where its foot is from the middle of the ring (game pixels), and how near it stands (what is nearer is drawn later). */
export interface LoadPart {
  what: 'stone' | 'slab' | 'column' | 'letter';
  x: number;
  y: number;
  near: number;
  /** A stone: which, how it burns, and its frame. The slab, the column: its frame. A letter: which rune, how hot, whether big. */
  v: number;
  blaze: Blaze;
  frame: number;
  big: boolean;
}
/** THE PICTURE AT TIME `t` (seconds), as a list: the circle's frame, and what stands on it, from the back to the front. */
export function loadingScene(t: number): { floor: number; parts: LoadPart[] } {
  const floor = Math.floor(t * LOAD_TURN_FPS + LOAD_TURN_AT) % FLOOR_FRAMES;
  const parts: LoadPart[] = [];
  STONE_AT.forEach(([x, y], v) => {
    parts.push({ what: 'stone', x: across(x, y), y: down(x, y), near: x + y, v, blaze: blazeOf(past(v, floor)), frame: Math.floor(t * 9 + v * 1.7) % STONE_FRAMES, big: false });
  });
  parts.push({ what: 'slab', x: 0, y: 0, near: 0, v: 0, blaze: 1, frame: Math.floor(t * 5) % 8, big: false });
  parts.push({ what: 'column', x: 0, y: -SLAB_TOP, near: 0.05, v: 0, blaze: 1, frame: Math.floor(t * 12) % COLUMN_FRAMES, big: false });
  for (const l of swirlAt(t, -1)) parts.push({ what: 'letter', x: across(l.x, l.y), y: down(l.x, l.y) - l.z, near: l.x + l.y, v: l.k, blaze: 1, frame: l.heat, big: l.big });
  // (from the back to the front; what stands as near, in the order given)
  return { floor, parts: parts.map((p, i) => ({ p, i })).sort((a, b) => a.p.near - b.p.near || a.i - b.i).map((q) => q.p) };
}

// ---------------------------------------------------------------------------------------------
// In the game

/** How many pictures not painted yet may be painted in one frame after the first. */
export const LOAD_PAINT = 1;
/** The column's strength over the slab (in town it stands at 0.42 at rest and comes up as he works: art/townscene.ts columnSprite). */
const COLUMN_ALPHA = 0.7;

const paintedAt = (list: readonly Sprite[], i: number): boolean => {
  const d = Object.getOwnPropertyDescriptor(list, i);
  return !!d && 'value' in d && !!d.value;
};

export interface LoadingRing {
  /**
   * The loading screen drawn on the whole screen (`w` by `h` game pixels) at time `t`: the dark, and the ring in its middle
   * with room left under it for the word (`under` game pixels). Gives back the row the word's top goes on.
   */
  draw(g: CanvasRenderingContext2D, t: number, w: number, h: number, under: number): number;
  /** For measuring: how many of the ring's pictures this has had painted so far, and how long its drawing took (thousandths of a second): the first time, the longest time since, and in all. */
  cost(): { painted: number; first: number; most: number; all: number; draws: number };
}

/** The picture as the game draws it: the ring's own pictures in the vault's stone, each painted the first time it is shown. */
export function makeLoadingRing(): LoadingRing {
  let ring: Ring3Art | null = null;
  let count = 0;
  let room = Infinity;
  const spent = { first: 0, most: 0, all: 0, draws: 0 };
  /** The frame of `list` nearest to `i` that is painted already, or null if none is. */
  const nearest = (list: readonly Sprite[], i: number): Sprite | null => {
    for (let d = 0; d < list.length; d++) for (const k of [(i - d + list.length) % list.length, (i + d) % list.length]) if (paintedAt(list, k)) return list[k];
    return null;
  };
  const paint = (list: readonly Sprite[], i: number): Sprite => {
    room--;
    count++;
    return list[i];
  };
  /** Frame `i` of `list`; one not painted yet is painted while there is room this frame, else the nearest painted one is shown. */
  const pick = (list: readonly Sprite[], i: number): Sprite => {
    if (paintedAt(list, i)) return list[i];
    return (room > 0 ? null : nearest(list, i)) ?? paint(list, i);
  };
  /** A stone's picture: the same, and while none of the way it is to burn is painted and there is no room, another way it burns that is (the nearest way, a lower one first). */
  const stone = (ways: readonly (readonly Sprite[])[], blaze: Blaze, i: number): Sprite => {
    if (paintedAt(ways[blaze], i)) return ways[blaze][i];
    if (room > 0) return paint(ways[blaze], i);
    for (const b of [blaze, blaze - 1, blaze + 1, blaze - 2, blaze + 2]) {
      const near = b >= 1 && b <= 3 ? nearest(ways[b], i) : null;
      if (near) return near;
    }
    return paint(ways[blaze], i);
  };
  const draw = (g: CanvasRenderingContext2D, t: number, w: number, h: number, under: number): number => {
    const t0 = performance.now();
    const first = !ring;
    const r = (ring ??= makeRing3(VAULT));
    room = first ? Infinity : LOAD_PAINT;
    g.save();
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = LOAD_NIGHT;
    g.fillRect(0, 0, w, h);
    // (the ring and the word as one block in the middle of the screen; on a short screen the word is kept on it)
    const cx = Math.round(w / 2);
    const cy = Math.min(Math.round((h - (LOAD_UP + LOAD_DOWN + under)) / 2) + LOAD_UP, h - under - LOAD_DOWN - 2);
    const scene = loadingScene(t);
    const lit: { s: Sprite; x: number; y: number; a: number }[] = [];
    const put = (s: Sprite, x: number, y: number, a = 1): void => {
      if (a < 1) g.globalAlpha = a;
      drawSprite(g, s, Math.round(cx + x), Math.round(cy + y));
      g.globalAlpha = 1;
      if (s.lights) lit.push({ s, x: Math.round(cx + x), y: Math.round(cy + y), a });
    };
    put(pick(r.floor, scene.floor), 0, 0);
    for (const p of scene.parts) {
      if (p.what === 'stone') put(stone(r.stones[p.v], p.blaze, p.frame), p.x, p.y);
      else if (p.what === 'slab') put(pick(r.slab, p.frame), p.x, p.y);
      else if (p.what === 'column') put(pick(r.column, p.frame), p.x, p.y, COLUMN_ALPHA);
      else put((p.big ? r.big : r.letters)[p.frame][p.v], p.x, p.y);
    }
    // (the light they give off, over all of it, as the renderer lays it)
    for (const q of lit) drawLights(g, q.s, q.x, q.y, 1, q.a);
    g.restore();
    const ms = performance.now() - t0;
    if (first) spent.first = ms;
    else spent.most = Math.max(spent.most, ms);
    spent.all += ms;
    spent.draws++;
    return cy + LOAD_DOWN;
  };
  return { draw, cost: () => ({ painted: count, ...spent }) };
}
