// THE STORIES THE PRISON'S FLOORS TELL (STORIES). The rooms along the way from where he comes in to the boss's hall laid in order
// as one story, a beat to a room or two, with the floor's own pieces and no text (game/first5.ts `dress` lays them).
//
// His question, 7 Nov 2026, 12:34: “What other stories can we tell throughout the prison?” (floor 5's own, his 7 Nov 12:00, is
// the main chat's: the queue's lay-floor-5-as-story-scenes). Asked by pop-up, 12 Nov 2026, his picks:
//   floor 1 “The night it fell (Recommended)”, offered as: guard post overrun, cells burst open, jailers fallen, the Warden still
//     at his post;
//   floor 2 “The endless line (Recommended)”: pens where the condemned waited, the line along the walls, gallows and wheel,
//     ending at his block;
//   floor 3 “The thing below (Recommended)”: jailers' rooms, the Stoker's furnace forging ever bigger chains, cells torn open as
//     it grew, the great winch, his pit;
//   floor 4 “The miners dig in (Recommended)”: their breach into the bones, tools dropped, bones heaped, the cult's candles among
//     them, then the Amalgamation;
//   and the two threads through all five, “Both threads (Recommended)”: the cult's candles, a few on floor 1 and more on each
//     floor down to its temple on 5; the Sunken Eye's black water seeping in from floor 3 down (art/prison_story.ts: the few
//     pieces no floor had).
// ON AT HIS WORD: shown the rooms in pictures from the game (docs/mockups/prison_stories/pictures), asked “The prison stories for
// floors 1 to 4 ...: are they right?”, his pick, 12 Nov 2026: “Yes, hand it to main (Recommended)”. The rooms off the way keep
// what they have: floors 1 and 2 their scenes (first5.ts SCENES), floors 3 and 4 their things laid about.
//
// HOW IT IS LAID. The way's rooms are the map-maker's main path (Room.path, from 1 to the last before the boss's hall; no cell),
// in order. Each beat takes a share of them, in proportion, in the story's order; a room is laid with the first of its beat's
// scenes that it takes (the last of each a trace of the beat, a piece or three, that fits nearly any room), so that no room of
// the way is skipped and the story is not broken.

import type { Room } from './types';
import type { SceneCtx } from './first5';

/** THE SWITCH (on at his word, 12 Nov 2026), and the floors laid so. */
export const STORIES: { on: boolean; floors: number[] } = { on: true, floors: [1, 2, 3, 4] };

/** What a story's scene is given: a scene's own (first5.ts SceneCtx), and the threads'. */
export interface StoryCtx extends SceneCtx {
  /** The floor has the threads' new pieces (art/prison_story.ts: floors 3 and 4). */
  fresh: boolean;
  /** Is this one of the floor's own pieces, in its look (a look may leave one out: floor 4's chapel stands the cult's altar in his hall)? */
  has: (name: string) => boolean;
  /** The same, each piece only where it is asked for (a row along a wall keeps its spacing): what is not given here is laid as near as it can be. */
  exact: Pick<SceneCtx, 'lie' | 'stand' | 'onWall' | 'onFloor'>;
  /** THE BLACK WATER: down the face of the back wall behind floor tile (x, y), pooled on that tile at its foot; true if it was (never where the look has none). */
  water: (x: number, y: number, side: 0 | 1) => boolean;
}
/** A scene of a story: its name, the least room it wants (area, width along x, depth along y), and how it is laid (true if it was). */
export interface StoryScene {
  name: string;
  area: number;
  w: number;
  h: number;
  lay: (c: StoryCtx) => boolean;
}
/** A beat of a floor's story: its name, how many of the way's rooms it takes (shared out in proportion), its scenes in order. */
export interface Beat {
  name: string;
  share: number;
  scenes: readonly StoryScene[];
}

/** The threads' pieces (art/prison_story.ts). */
export const CULT_CANDLES = "the cult's candles";
export const BLACK_WATER = 'black water down the wall';
export const BLACK_POOL = { x: 'black water pooled, at a wall along x', y: 'black water pooled, at a wall along y' } as const;

/** Along a room's back wall (side 0), every `step` tiles from its third tile to its last but two: the x's. */
const backXs = (r: Room, step: number): number[] => {
  const xs: number[] = [];
  for (let x = r.x + 2; x <= r.x + r.w - 3; x += step) xs.push(x);
  return xs;
};
/** A fire stood by a scene: the first of the places that is free. */
const fireAt = (c: StoryCtx, list: [number, number][]): void => {
  for (const [x, y] of list) if (c.fire(x, y)) return;
};

export const STORY_SETS: Readonly<Record<number, readonly Beat[]>> = {
  1: [
    // THE NIGHT IT FELL. From the gate in: the guard post at the way in overrun; the cells thrown open; the tombs burst from within,
    // where the dead rose (by one of them a few of the cult's candles: the thread's few, with the floor's own candles in a
    // corner, first5.ts CANDLES_BY_WALL); the jailers' last stand before the Warden's hall. Then he, still at his post.
    {
      name: 'the way in overrun', share: 2, scenes: [
        {
          // the jailers' rack by the side wall, a guard fallen before it, his helm rolled off, their banner pulled down and the one
          // on the wall in rags
          name: 'the guard post overrun', area: 30, w: 6, h: 6,
          lay: (c) => {
            const { r, cy } = c;
            if (!c.stand(r.x + 1, cy, 'rack of mauls')) return false;
            c.onWall(r.x, cy - 1, 1, 'crossed mauls');
            c.onWall(r.x, cy + 1, 1, 'banner in rags');
            c.lie(r.x + 2, cy + 1, 'fallen guard');
            c.lie(r.x + 3, cy - 1, 'horned helm');
            c.lie(r.x + 3, cy + 2, 'fallen banner');
            return true;
          },
        },
        {
          name: 'a guard fallen at the way in', area: 9, w: 3, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'fallen guard')) return false;
            c.lie(c.cx + 1, c.cy + 1, 'horned helm');
            c.onWall(c.cx, c.r.y, 0, 'banner in rags');
            return true;
          },
        },
      ],
    },
    {
      name: 'the cells thrown open', share: 3, scenes: [
        {
          // shackles hanging empty along the back wall, the chain from one dragged out across the floor, the jailers' keys dropped
          // where they ran, a barred window by them
          name: 'the shackles empty', area: 30, w: 7, h: 5,
          lay: (c) => {
            const { r, cx, cy } = c;
            const at = backXs(r, 2).filter((x) => c.exact.onWall(x, r.y, 0, 'shackles'));
            if (at.length < 2) return false;
            c.lie(at[0], r.y + 1, 'chain');
            c.lie(cx + 1, cy + 1, 'dropped keys');
            c.onFloor(cx - 1, cy + 1, 'drain');
            for (const x of [at[at.length - 1] + 1, at[0] - 1]) if (c.onWall(x, r.y, 0, 'barred window')) break;
            return true;
          },
        },
        {
          name: 'the keys dropped', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'dropped keys')) return false;
            c.lie(c.cx - 1, c.cy + 1, 'chain');
            c.onWall(c.r.x, c.cy, 1, 'shackles');
            return true;
          },
        },
      ],
    },
    {
      name: 'the tombs burst open', share: 2, scenes: [
        {
          // every sarcophagus along the back wall open, the niche over each broken in, the slab before each sunk; a great crack up
          // the wall; and by one of them a few of the cult's candles
          name: 'the dead risen', area: 40, w: 8, h: 6,
          lay: (c) => {
            const { r } = c;
            const at = backXs(r, 3).filter((x) => c.exact.stand(x, r.y + 1, 'open sarcophagus', true));
            if (at.length === 0) return false;
            for (const x of at) {
              c.exact.onWall(x, r.y, 0, 'burial niche');
              c.exact.onFloor(x, r.y + 3, 'sunken grave slab');
            }
            c.onWall(at[0] + 2, r.y, 0, 'great crack');
            c.lie(at[at.length - 1] + 1, r.y + 3, 'candles');
            return true;
          },
        },
        {
          name: 'a tomb broken open', area: 16, w: 4, h: 4,
          lay: (c) => {
            if (!c.stand(c.cx, c.cy, 'open sarcophagus')) return false;
            c.onWall(c.cx, c.r.y, 0, 'burial niche');
            c.lie(c.cx + 1, c.cy + 1, "the statue's head");
            return true;
          },
        },
      ],
    },
    {
      name: 'the last stand', share: 2, scenes: [
        {
          // the jailers fallen together where they stood, their helm and banner about them, their shield and mauls still on the
          // back wall; part of it come down where they were overrun
          name: 'the jailers fallen together', area: 36, w: 7, h: 6,
          lay: (c) => {
            const { r, cx, cy } = c;
            let n = 0;
            for (const [dx, dy] of [[-1, 0], [1, 1], [0, -1], [2, -1]]) if (c.lie(cx + dx, cy + dy, 'fallen guard')) n++;
            if (n < 2) return false;
            c.lie(cx - 1, cy + 2, 'horned helm');
            c.lie(cx + 2, cy + 2, 'fallen banner');
            c.onWall(cx - 1, r.y, 0, 'shield');
            c.onWall(cx + 1, r.y, 0, 'crossed mauls');
            for (let x = r.x + r.w - 3; x >= r.x + 2; x--) if (c.heap(x, r.y, 0, 'crumbled wall')) break;
            return true;
          },
        },
        {
          name: 'two jailers fallen', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'fallen guard')) return false;
            c.lie(c.cx + 1, c.cy - 1, 'fallen guard');
            c.onWall(c.cx, c.r.y, 0, 'shield');
            return true;
          },
        },
      ],
    },
  ],
  2: [
    // THE ENDLESS LINE. The pens where the condemned waited; the line of them along the walls, room after room, still in their
    // irons; the gallows and the wheel, the cult's black candles there (more than floor 1's); the block, and the chute the dead
    // went down. Then his hall.
    {
      name: 'the pens', share: 2, scenes: [
        {
          // a row of stocks along the back wall, bones still in irons before them, a chain from the dark over them, a stool kicked
          // over, a lantern dropped
          name: 'the stocks in a row', area: 36, w: 8, h: 6,
          lay: (c) => {
            const { r } = c;
            const at = backXs(r, 3).filter((x) => c.exact.stand(x, r.y + 2, 'the stocks'));
            if (at.length < 2) {
              for (const x of at) c.unstand(x, r.y + 2);
              return false;
            }
            for (const x of at) c.exact.onFloor(x, r.y + 3, 'sawdust');
            c.lie(at[0] + 1, r.y + 3, 'bones in irons');
            c.lie(at[at.length - 1] + 1, r.y + 4, 'kicked-over stool');
            c.onWall(at[0], r.y, 0, 'chain from the dark');
            c.lie(at[0] - 1, r.y + 4, 'dropped lantern');
            return true;
          },
        },
        {
          name: 'one held in the stocks', area: 16, w: 4, h: 4,
          lay: (c) => {
            if (!c.stand(c.cx, c.cy, 'the stocks')) return false;
            c.lie(c.cx + 1, c.cy + 1, 'bones in irons');
            return true;
          },
        },
      ],
    },
    {
      name: 'the line', share: 4, scenes: [
        {
          // THE LINE THAT NEVER ENDED: the condemned, bones in their irons, one after another along the back wall where they
          // waited, chains from the dark and the hoods over them; it goes on in the next room, and the next
          name: 'the line along the back wall', area: 30, w: 8, h: 5,
          lay: (c) => {
            const { r } = c;
            const at = backXs(r, 2).filter((x) => c.exact.lie(x, r.y + 1, 'bones in irons'));
            if (at.length < 3) return false;
            at.forEach((x, k) => c.exact.onWall(x, r.y, 0, k % 2 ? 'hoods on pegs' : 'chain from the dark'));
            c.onWall(at[at.length - 1] + 1, r.y, 0, 'torch');
            return true;
          },
        },
        {
          name: 'the line along the side wall', area: 30, w: 5, h: 8,
          lay: (c) => {
            const { r } = c;
            const at: number[] = [];
            for (let y = r.y + 2; y <= r.y + r.h - 3; y += 2) if (c.exact.lie(r.x + 1, y, 'bones in irons')) at.push(y);
            if (at.length < 3) return false;
            at.forEach((y, k) => c.exact.onWall(r.x, y, 1, k % 2 ? 'hoods on pegs' : 'chain from the dark'));
            return true;
          },
        },
        {
          // (a bay of the open yard with no wall to its back: the line across its middle)
          name: 'the line across the yard', area: 20, w: 6, h: 4,
          lay: (c) => {
            const { r, cy } = c;
            let n = 0;
            for (let x = r.x + 2; x <= r.x + r.w - 3; x += 2) if (c.exact.lie(x, cy, 'bones in irons')) n++;
            return n >= 2;
          },
        },
      ],
    },
    {
      name: 'the gallows and the wheel', share: 2, scenes: [
        {
          // the gallows, its trapdoor before it, the noose by it and the cult's black candles either side; the broken wheel, a coil
          // of rope, the grindstone the axes were kept on
          name: 'the gallows and the wheel', area: 50, w: 8, h: 7,
          lay: (c) => {
            const { r, cx } = c;
            if (!c.stand(cx, r.y + 2, 'the gallows')) return false;
            c.onFloor(cx, r.y + 3, 'trapdoor');
            c.onWall(cx, r.y, 0, 'noose');
            c.onWall(cx - 2, r.y, 0, 'black candles');
            c.onWall(cx + 2, r.y, 0, 'black candles');
            c.lie(cx - 2, r.y + 4, 'broken wheel');
            c.lie(cx + 2, r.y + 4, 'coil of rope');
            if (!c.stand(cx + 3, r.y + 2, 'the grindstone')) c.stand(cx - 3, r.y + 2, 'the grindstone');
            return true;
          },
        },
        {
          name: 'the wheel and the black candles', area: 16, w: 4, h: 4,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'broken wheel')) return false;
            c.lie(c.cx + 1, c.cy + 1, 'coil of rope');
            c.onWall(c.cx - 1, c.r.y, 0, 'black candles');
            c.onWall(c.cx + 1, c.r.y, 0, 'black candles');
            return true;
          },
        },
      ],
    },
    {
      name: 'the block', share: 2, scenes: [
        {
          // the end of the line: the block in sawdust, its gutter, the skulls and a broken axe; his axes on their hooks and the long
          // stain on the back wall; the chute by it, where the dead were sent down, bones in irons at its foot
          name: 'the block and the chute', area: 49, w: 8, h: 7,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.stand(cx, cy, 'the block')) return false;
            for (const [dx, dy] of [[-1, 1], [1, 1], [1, -1], [0, 1], [-1, 0]]) c.onFloor(cx + dx, cy + dy, 'sawdust');
            for (let k = 2; k <= 3; k++) c.onFloor(cx, cy + k, 'gutter');
            c.lie(cx + 1, cy + 2, 'skulls in the sawdust');
            c.lie(cx - 1, cy - 1, 'broken axe');
            c.onWall(cx, r.y, 0, 'the long stain');
            c.onWall(cx + 2, r.y, 0, 'axe on hooks');
            for (const x of [cx - 3, cx - 2, cx + 3]) {
              if (!c.heap(x, r.y, 0, 'the chute')) continue;
              c.lie(x, r.y + 2, 'bones in irons');
              break;
            }
            return true;
          },
        },
        {
          name: 'skulls in the sawdust', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'skulls in the sawdust')) return false;
            c.lie(c.cx + 1, c.cy + 1, 'broken axe');
            c.onWall(c.cx, c.r.y, 0, 'the long stain');
            return true;
          },
        },
      ],
    },
  ],
  3: [
    // THE THING BELOW. The jailers' room where they kept it fed; the forge where its chains were made, each bigger than the last;
    // the cage it outgrew, the cult's candles before it; the chains it broke, the Sunken Eye's black water coming through the
    // stone; the great winch that hauls its chains down to the pit, the candles and the water at it. Then his pit.
    {
      name: "the jailers' room", share: 2, scenes: [
        {
          // their bench, their poles to keep it off on the side wall, their lamp; the trough it was fed from, its bowls on the wall,
          // one kicked over
          name: 'where they fed it', area: 30, w: 6, h: 5,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.stand(cx, cy, 'the feed trough')) return false;
            c.stand(cx - 2, cy - 1, 'the stone bench');
            c.onWall(r.x, cy, 1, 'goad and catch-pole');
            c.onWall(cx, r.y, 0, "the jailers' lamp");
            c.onWall(cx + 2, r.y, 0, 'empty bowls');
            c.lie(cx + 1, cy + 1, 'a bowl kicked over');
            return true;
          },
        },
        {
          name: 'a bowl kicked over', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'a bowl kicked over')) return false;
            c.onWall(c.cx, c.r.y, 0, 'empty bowls');
            c.onWall(c.r.x, c.cy, 1, 'goad and catch-pole');
            return true;
          },
        },
      ],
    },
    {
      name: 'the forge of chains', share: 2, scenes: [
        {
          // the anvil, a fire by it; the chains made there heaped, a ball and chain; balls on their rack, rings and chains, the fire
          // basket on the wall
          name: 'the forge of chains', area: 36, w: 7, h: 6,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.stand(cx, cy, 'the anvil')) return false;
            c.stand(cx + 2, cy + 1, 'a heap of chains');
            c.lie(cx - 1, cy + 2, 'ball and chain');
            fireAt(c, [[cx - 2, cy], [cx - 2, cy - 1], [cx - 2, cy + 1]]);
            c.onWall(cx, r.y, 0, 'balls on a rack');
            c.onWall(cx + 2, r.y, 0, 'rings and chains');
            c.onWall(cx - 2, r.y, 0, 'fire basket');
            return true;
          },
        },
        {
          name: 'chains heaped', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.stand(c.cx, c.cy, 'a heap of chains')) return false;
            c.lie(c.cx + 1, c.cy + 1, 'ball and chain');
            c.onWall(c.cx, c.r.y, 0, 'rings and chains');
            return true;
          },
        },
      ],
    },
    {
      name: 'the cage it outgrew', share: 2, scenes: [
        {
          // the cage, its pallet beside it, straw about it; the bars on the wall bent out, the stone clawed; a cuff burst; and
          // before it the cult's candles, kept to it either side
          name: 'the cage it outgrew', area: 40, w: 7, h: 7,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.stand(cx, cy, 'the cage', true)) return false;
            c.lie(cx + 2, cy + 1, 'his pallet');
            c.lie(cx - 2, cy + 2, 'a burst cuff');
            for (const [dx, dy] of [[1, 2], [2, 2], [-1, 2]]) c.onFloor(cx + dx, cy + dy, 'old straw');
            c.onWall(cx, r.y, 0, 'bent bars');
            c.onWall(cx - 2, r.y, 0, 'claw-torn stone');
            if (c.fresh) {
              c.lie(cx - 1, cy + 2, CULT_CANDLES);
              c.lie(cx + 1, cy + 2, CULT_CANDLES);
            }
            return true;
          },
        },
        {
          name: 'its pallet', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'his pallet')) return false;
            c.lie(c.cx + 1, c.cy + 1, 'a burst cuff');
            c.onWall(c.cx, c.r.y, 0, 'bent bars');
            if (c.fresh) c.lie(c.cx - 1, c.cy + 1, CULT_CANDLES);
            return true;
          },
        },
      ],
    },
    {
      name: 'the chains it broke', share: 2, scenes: [
        {
          // the post it was chained to, the chain snapped; a ring torn out of the wall with the stone, a bar torn out, the wall
          // bowed where it struck it, the muzzle it wore cut into the floor, the cult's candles by it; and the black water seeping
          // through the stone
          name: 'the chains it broke', area: 36, w: 7, h: 6,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.stand(cx, cy, 'the chain post')) return false;
            c.lie(cx + 1, cy + 1, 'a snapped chain');
            c.lie(cx - 2, cy + 1, 'a torn-out bar');
            c.onFloor(cx - 1, cy + 2, 'his muzzle in the floor');
            if (c.fresh) {
              c.lie(cx + 2, cy - 1, CULT_CANDLES);
              c.lie(cx - 2, cy - 1, CULT_CANDLES);
            }
            c.onWall(cx + 2, r.y, 0, 'the bowed wall');
            for (let x = r.x + 2; x <= r.x + r.w - 3; x++) if (x !== cx + 2 && c.heap(x, r.y, 0, 'the torn-out ring')) break;
            for (let y = r.y + r.h - 2; y >= r.y + 1; y--) if (c.water(r.x, y, 1)) break;
            return true;
          },
        },
        {
          name: 'a chain snapped', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'a snapped chain')) return false;
            c.lie(c.cx + 1, c.cy - 1, 'a torn-out bar');
            for (const x of [c.cx + 1, c.cx - 1, c.cx]) if (c.water(x, c.r.y, 0)) break;
            return true;
          },
        },
      ],
    },
    {
      name: 'the great winch', share: 2, scenes: [
        {
          // the great winch that hauls its chains down to the pit, the port they run through in the wall and the wall's own winch;
          // the grooves its balls wore; the cult's candles either side of it and under the port; the black water coming down the wall
          name: 'the great winch', area: 40, w: 8, h: 7,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.stand(cx, cy, 'the great winch', true)) return false;
            c.onWall(cx, r.y, 0, 'the chain port');
            c.onWall(cx + 2, r.y, 0, 'the wall winch');
            for (let k = 2; k <= 3; k++) c.onFloor(cx, cy + k, 'ball grooves');
            if (c.fresh) {
              c.lie(cx - 2, cy + 1, CULT_CANDLES);
              c.lie(cx + 2, cy + 1, CULT_CANDLES);
              c.lie(cx - 1, r.y + 1, CULT_CANDLES);
            }
            for (const x of [cx - 3, cx - 2, cx + 3, cx + 4]) if (c.water(x, r.y, 0)) break;
            return true;
          },
        },
        {
          name: 'the chain port', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.onWall(c.cx, c.r.y, 0, 'the chain port')) return false;
            c.stand(c.cx, c.cy + 1, 'a heap of chains');
            if (c.fresh) c.lie(c.cx - 1, c.cy + 1, CULT_CANDLES);
            c.water(c.cx + 2, c.r.y, 0);
            return true;
          },
        },
      ],
    },
  ],
  4: [
    // THE MINERS DIG IN. The ossuary's dead as they were laid, quiet; the dead the miners dug out of the walls, dragged and heaped;
    // the cult come among the bones after them, its candles and its marks; the miners' last camp, their tools dropped and their
    // boots left empty (they are the Amalgamation now); the breach they dug in by, the black water seeping in with them. Then his
    // hall.
    {
      name: 'the quiet dead', share: 2, scenes: [
        {
          // niches lined with bones along the back wall, a garland of skulls on the side wall, the dead's own floor of bone, their
          // skulls stacked
          name: 'the dead as they were laid', area: 30, w: 7, h: 5,
          lay: (c) => {
            const { r, cx, cy } = c;
            const at = backXs(r, 2).filter((x) => c.exact.onWall(x, r.y, 0, 'bone-lined niche'));
            if (at.length < 2) return false;
            c.onWall(r.x, cy, 1, 'garland of skulls');
            for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [-1, 1]]) c.onFloor(cx + dx, cy + dy, 'bone-paved floor');
            c.stand(cx, cy + 2, 'pyramid of skulls');
            return true;
          },
        },
        {
          name: 'a niche of bones', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.onWall(c.cx, c.r.y, 0, 'bone-lined niche')) return false;
            c.onFloor(c.cx, c.cy, 'bone-paved floor');
            c.onWall(c.r.x, c.cy, 1, 'garland of skulls');
            return true;
          },
        },
      ],
    },
    {
      name: 'the dead dug out', share: 2, scenes: [
        {
          // the charnel layer cut open in the back wall, an arm hanging out of it, ribs on a spike; the drag where the dead were
          // pulled out across the floor, the earth raked over and the bones in it, a rib cage and an arm left by it; the black water
          // come in where they dug
          name: 'the dead dug out', area: 30, w: 7, h: 5,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.onWall(cx, r.y, 0, 'the charnel layer')) return false;
            c.onWall(cx - 2, r.y, 0, "the dead's arm");
            c.onWall(cx + 2, r.y, 0, 'ribs on a spike');
            for (let k = 1; k <= 3; k++) c.onFloor(cx, r.y + k, 'the drag');
            c.onFloor(cx - 1, cy + 1, 'earth and bones');
            c.onFloor(cx + 1, cy, 'raked earth');
            c.lie(cx + 2, cy + 1, 'rib cage');
            c.lie(cx - 2, cy + 1, 'arm from a heap');
            for (let y = r.y + r.h - 2; y >= r.y + 1; y--) if (c.water(r.x, y, 1)) break;
            return true;
          },
        },
        {
          name: 'a rib cage left', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'rib cage')) return false;
            c.lie(c.cx + 1, c.cy + 1, 'arm from a heap');
            c.onFloor(c.cx - 1, c.cy, 'earth and bones');
            return true;
          },
        },
      ],
    },
    {
      name: 'the cult among the bones', share: 3, scenes: [
        {
          // the cult's altar against the back wall (where the floor's look has it among the bones), its candles on the wall either
          // side, its daub over it, a robe dropped, the skulls stacked as its offerings; the black water down the wall by it
          name: 'the cult among the bones', area: 36, w: 7, h: 6,
          lay: (c) => {
            const { r, cx, cy } = c;
            const altar = c.has("the cult's altar") && c.stand(cx, r.y + 2, "the cult's altar");
            if (!c.onWall(cx - 1, r.y, 0, "the cult's candle") && !altar) return false;
            c.onWall(cx + 1, r.y, 0, "the cult's candle");
            c.onWall(cx, r.y, 0, "the cult's daub");
            c.onWall(cx + 3, r.y, 0, "the cult's candle");
            c.lie(cx + 2, cy + 1, "a cultist's robe");
            c.stand(cx - 2, cy + 1, 'pyramid of skulls');
            c.onWall(r.x, cy, 1, 'garland of skulls');
            for (const x of [cx - 3, cx + 4, cx - 4]) if (c.water(x, r.y, 0)) break;
            return true;
          },
        },
        {
          name: "a cultist's robe", area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, "a cultist's robe")) return false;
            c.onWall(c.cx - 1, c.r.y, 0, "the cult's candle");
            c.onWall(c.cx + 1, c.r.y, 0, "the cult's daub");
            return true;
          },
        },
      ],
    },
    {
      name: "the miners' last camp", share: 2, scenes: [
        {
          // their timber crib, their tools on the wall and their lantern; drill steels and a broken ladder dropped, a prop snapped,
          // and their boots standing empty; the black water come in at the wall
          name: "the miners' last camp", area: 36, w: 7, h: 6,
          lay: (c) => {
            const { r, cx, cy } = c;
            if (!c.stand(cx, cy - 1, 'timber crib')) return false;
            c.onWall(cx - 1, r.y, 0, "the miners' tools");
            c.onWall(cx + 1, r.y, 0, "miner's lantern");
            c.lie(cx - 2, cy + 1, 'drill steels');
            c.lie(cx + 2, cy, 'broken ladder');
            c.lie(cx + 1, cy + 2, 'empty boots');
            c.lie(cx - 1, cy + 2, 'empty boots');
            c.lie(cx + 3, cy + 2, 'snapped prop');
            for (let y = r.y + r.h - 2; y >= r.y + 1; y--) if (c.water(r.x, y, 1)) break;
            return true;
          },
        },
        {
          name: 'boots left empty', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.lie(c.cx, c.cy, 'empty boots')) return false;
            c.lie(c.cx + 1, c.cy - 1, 'drill steels');
            c.onWall(c.cx, c.r.y, 0, "miner's lantern");
            return true;
          },
        },
      ],
    },
    {
      name: 'the breach', share: 2, scenes: [
        {
          // the breach they dug in by, in the back wall, its heap on the floor; the rock shored up either side of it, the seam of
          // ore they followed, ore spilled; their windlass and ladder; the black water coming in by it
          name: 'the breach', area: 40, w: 8, h: 6,
          lay: (c) => {
            const { r, cx, cy } = c;
            let at = -1;
            for (const x of [cx, cx - 1, cx + 1, cx - 2, cx + 2]) {
              if (!c.heap(x, r.y, 0, "the miners' breach")) continue;
              at = x;
              break;
            }
            if (at < 0) return false;
            c.onWall(at - 1, r.y, 0, 'shored rock');
            c.onWall(at + 1, r.y, 0, 'shored rock');
            c.onWall(at + 3, r.y, 0, 'seam of ore');
            for (const [dx, dy] of [[0, 2], [1, 2], [-1, 3]]) c.onFloor(at + dx, r.y + dy, 'spilled ore');
            c.stand(cx + 2, cy + 1, 'the windlass', true);
            c.onWall(r.x, cy, 1, "the miners' ladder");
            for (const x of [at - 3, at - 2, at + 4]) if (c.water(x, r.y, 0)) break;
            return true;
          },
        },
        {
          name: 'the rock shored', area: 12, w: 4, h: 3,
          lay: (c) => {
            if (!c.onWall(c.cx, c.r.y, 0, 'shored rock')) return false;
            c.onFloor(c.cx, c.cy, 'spilled ore');
            c.onWall(c.cx + 2, c.r.y, 0, 'pick in the wall');
            c.water(c.cx - 2, c.r.y, 0);
            return true;
          },
        },
      ],
    },
  ],
};

/** The way's rooms (the main path from the first room after the way in to the last before the boss's hall; no cell), in order. */
export function wayRooms(rooms: readonly Room[]): Room[] {
  return rooms.filter((r) => r.path > 0 && r.kind !== 'boss' && r.kind !== 'start' && !r.cell).sort((a, b) => a.path - b.path);
}
/** Which beat each of `n` rooms of the way is, in order: the beats' shares of them in proportion, every beat at least one room where there are enough. */
export function beatsOf(beats: readonly Beat[], n: number): number[] {
  const total = beats.reduce((a, b) => a + b.share, 0);
  const enough = n >= beats.length;
  const out: number[] = [];
  let at = 0;
  let cum = 0;
  beats.forEach((b, k) => {
    cum += b.share;
    let end = k === beats.length - 1 ? n : Math.round((n * cum) / total);
    // (every beat a room at least, and a room left for each beat after it)
    if (enough) end = Math.min(Math.max(end, at + 1), n - (beats.length - 1 - k));
    for (; at < end; at++) out.push(k);
  });
  return out;
}
/** A floor's story laid: each room of the way with the first of its beat's scenes it takes. The rooms laid, and how. */
export function layStory(depth: number, rooms: readonly Room[], ctxOf: (r: Room) => StoryCtx): { room: number; beat: string; name: string }[] {
  const beats = STORY_SETS[depth];
  const out: { room: number; beat: string; name: string }[] = [];
  if (!beats) return out;
  const way = wayRooms(rooms);
  const of = beatsOf(beats, way.length);
  way.forEach((r, k) => {
    const beat = beats[of[k]];
    const base = nearby(ctxOf(r));
    const at = anchors(r, base.cx, base.cy);
    for (const sc of beat.scenes) {
      if (r.w * r.h < sc.area || r.w < sc.w || r.h < sc.h) continue;
      // (laid about the room's middle where it can be, else about a tile near it: the middle is often kept clear, for a pack)
      if (!at.some(([cx, cy]) => sc.lay({ ...base, cx, cy }))) continue;
      out.push({ room: r.id, beat: beat.name, name: sc.name });
      return;
    }
  });
  return out;
}
/**
 * A scene's pieces each where it is asked for, or as near as it can be: what stands, lies or is laid in the floor a tile or two
 * off (round it, nearest first), what is set in a wall a tile or two along it (a pillar, a pack's place or a door often takes the
 * very tile). Within the room. A row along a wall is laid with `exact`, so that it keeps its spacing.
 */
function nearby(c: StoryCtx): StoryCtx {
  const { r } = c;
  const inside = (x: number, y: number): boolean => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  const ring: [number, number][] = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [0, 2], [-2, 0], [0, -2]];
  const round = <A extends unknown[]>(f: (x: number, y: number, ...rest: A) => boolean) => (x: number, y: number, ...rest: A): boolean => ring.some(([dx, dy]) => inside(x + dx, y + dy) && f(x + dx, y + dy, ...rest));
  const along = (x: number, y: number, side: 0 | 1, name: string): boolean => [0, 1, -1, 2, -2].some((d) => (side === 0 ? inside(x + d, y) && c.onWall(x + d, y, side, name) : inside(x, y + d) && c.onWall(x, y + d, side, name)));
  return { ...c, lie: round(c.lie), stand: round(c.stand), onFloor: round(c.onFloor), onWall: along, exact: { lie: c.lie, stand: c.stand, onFloor: c.onFloor, onWall: c.onWall } };
}
/** Where a scene may be laid about in room `r`: its middle first, then the tiles round it ring by ring (two tiles in from its walls). */
function anchors(r: Room, cx: number, cy: number): [number, number][] {
  const out: [number, number][] = [[cx, cy]];
  for (let d = 1; d <= Math.max(r.w, r.h); d++) {
    for (let dy = -d; dy <= d; dy++) {
      for (let dx = -d; dx <= d; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < r.x + 2 || x > r.x + r.w - 3 || y < r.y + 2 || y > r.y + r.h - 3) continue;
        out.push([x, y]);
      }
    }
  }
  return out;
}
