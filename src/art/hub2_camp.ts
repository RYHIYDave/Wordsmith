// ACT 2'S TOWN HUB, THE CAMP INSIDE THE GATE: WHERE EVERYTHING STANDS (the art chat's, 22 Oct 2026). A MOCK-UP: NOTHING
// OF THE GAME IMPORTS THIS FILE; it is behind HUB2 (art/hub2.ts), off.
//
// His word, by 11:30 Pacific, 22 Oct, shown the camp moving (src/dev/preview_hub2.ts camp-film) and asked “Is the camp
// right as the Act 2 hub: the camp, its shops, its people and how it moves?”: “Yes, send to main (Recommended)”.
//
// The camp laid by hand in tiles, as the dev page paints it and as the game's map-maker for the hub may lay it (that is
// the main chat's): the open yard and the streets off it (every other tile houses, painted by the Gate Ward's look,
// art/gateward.ts, with `swept`); the pieces (the Gate Ward's, art/floor11.ts and art/act2_set.ts, and the hub's own,
// art/hub2.ts), each by name and frame where it stands, `anim` the frames a second of those that move; the town's own
// things and its four people (art/town.ts, art/townsfolk.ts, kinds as the game names them) on their tiles; the camp's
// three people (art/hub2_folk.ts) on their logs; where each service's name is written (the stations); where the hero
// starts. `campPlace(false)` is the camp he said yes to; `campPlace(true)`, the rest camp-style, he saw and let go
// (“Just the shops (Recommended)”).

export type Rect = [number, number, number, number]; // x0, y0, x1, y1 (x1, y1 not in it)
/** A piece of the Gate Ward's or the hub's, by name: on the floor, hung on a house front ('left': a front along x; 'right': along y), or on the roofs. */
export interface Laid { name: string; frame: number; x: number; y: number; on?: 'left' | 'right' | 'top'; flat?: boolean; anim?: number }
/** The town's own things (art/town.ts) and its four people, each on its tile; `kind` as the game names them. */
export type TownKind = 'forge' | 'anvil' | 'rack' | 'trough' | 'tentBack' | 'tentTable' | 'rug' | 'runeRing' | 'runeSlab' | 'runeStone' | 'lexicon' | 'stash' | 'brazier' | 'waypoint' | 'armourer' | 'mystic' | 'wordsmith' | 'stranger';
export interface TownLaid { kind: TownKind; x: number; y: number; v?: number }
export interface Place {
  name: string;
  w: number;
  h: number;
  open: Rect;
  streets: Rect[];
  squares: { x: number; y: number; r: number }[];
  dress: Laid[];
  town: TownLaid[];
  /** The services' names, where the game writes them (render.ts NAME_LIFT). */
  labels: [string, number, number, number][];
  hero: [number, number];
  whole: [number, number];
  /** The camp's people (art/hub2_folk.ts), each sat on a log: from in front or behind, mirrored or not. */
  folk?: { who: 'porter' | 'goodwife' | 'baker'; x: number; y: number; view: 'front' | 'back'; flip: boolean }[];
}

export const st = (facing: number, v: number): number => facing * 4 + v;
/** The wordsmith's ring round the tile (x, y): him, his slab before him, six standing stones, the circle in the floor (level.ts TOWN). */
export function ring(x: number, y: number): TownLaid[] {
  const stones: [number, number][] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
  return [
    { kind: 'runeRing', x, y },
    { kind: 'wordsmith', x, y },
    { kind: 'runeSlab', x, y: y + 1 },
    ...stones.map(([dx, dy], i) => ({ kind: 'runeStone' as const, x: x + dx, y: y + dy, v: i % 5 })),
  ];
}
/** The armourer's smithy against a house front along x at row y: the forge, his rack, his trough; him, his anvil. */
export function smithy(x: number, y: number): TownLaid[] {
  return [
    { kind: 'forge', x, y },
    { kind: 'rack', x: x - 3, y },
    { kind: 'trough', x: x + 1, y },
    { kind: 'armourer', x: x - 1, y: y + 1 },
    { kind: 'anvil', x: x - 1, y: y + 2 },
  ];
}
/** The mystic's tent, its back toward -y: its rug, its back, him, his table of wares. */
export function bazaar(x: number, y: number): TownLaid[] {
  return [
    { kind: 'rug', x, y },
    { kind: 'tentBack', x, y: y - 1 },
    { kind: 'mystic', x, y },
    { kind: 'tentTable', x, y: y + 1 },
  ];
}

/**
 * THE CAMP INSIDE THE GATE (his pick, 22 Oct: “The camp yes.  Also some different looks for the shops”): the yard just
 * inside the city's broken gate, 20 tiles by 18, where the survivors of the siege camp: the gatehouse at the end of the
 * short street in from the left (the gate, the way on), the waypoint at its mouth; tents of patched canvas along the
 * back, bedrolls before them; the cooking fire in the middle, logs round it to sit on; THE ARMOURER'S FIELD FORGE ON ITS
 * CART against the back row on the right, his anvil on its stump before it (his pick); THE MYSTIC'S PAINTED CARAVAN on
 * the right, its side let down, he before it and his trestle of wares before him (his pick); the wordsmith's ring at the
 * front on the left, the Lexicon by the gate's street, the stash by a handcart; the stranger in the gatehouse's shadow.
 * A cart barricade across the street off to the right, braziers, crates and sacks of what was saved. `all`: the rest
 * camp-style too, to look at (his words: “I’d like to see all of them in a new style but more than likely we’ll stick
 * to just the vendors for new looks”): the ring of stones prised up out of the street round a column's drum, chalked;
 * the Lexicon on crates; the stash on a handcart; the stranger's barrel of dice.
 */
const STONES: [number, number][] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
export function campPlace(all: boolean): Place {
  const R: [number, number] = [21, 28];
  return {
    name: 'Vellum',
    w: 56,
    h: 56,
    open: [16, 14, 36, 32],
    streets: [
      [11, 21, 16, 24], // in from the broken gate
      [36, 25, 50, 28], // a street off to the right, barricaded
      [22, 32, 25, 46], // a street toward the eye
    ],
    squares: [],
    dress: [
      { name: 'the city gate, held', frame: 1, x: 11.4, y: 22.5 },
      // the tents along the back, their bedrolls; one on the left, one at the front with its back to the eye
      { name: 'a tent', frame: 0 * 4 + 0, x: 18.4, y: 15.4 },
      { name: 'a tent', frame: 1 * 4 + 0, x: 22.4, y: 15.4 },
      { name: 'a tent', frame: 2 * 4 + 1, x: 17.2, y: 25.0 },
      { name: 'a tent', frame: 3 * 4 + 2, x: 26.0, y: 30.8 },
      { name: 'a bedroll', frame: 0 * 2 + 0, x: 18.3, y: 17.9 },
      { name: 'a bedroll', frame: 2 * 2 + 0, x: 22.6, y: 18.0 },
      // the cooking fire, the logs round it
      { name: 'the cooking fire', frame: 0, x: 25.6, y: 22.6, anim: 8 },
      { name: 'a log to sit on', frame: 0, x: 25.6, y: 20.5 },
      { name: 'a log to sit on', frame: 1, x: 23.4, y: 22.8 },
      { name: 'a log to sit on', frame: 1, x: 27.8, y: 23.0 },
      // THE ARMOURER'S FIELD FORGE, his anvil before it; THE MYSTIC'S CARAVAN, his trestle before him
      { name: "the armourer's field forge", frame: 1, x: 31.6, y: 15.3, anim: 8 },
      { name: "the armourer's anvil, on its stump", frame: 0, x: 32.05, y: 17.4 },
      { name: "the mystic's caravan", frame: 0, x: 26.4, y: 15.7 },
      { name: "the mystic's trestle", frame: 1, x: 26.4, y: 18.6 },
      { name: 'a tent', frame: 1 * 4 + 3, x: 33.8, y: 21.0 },
      // what was saved: crates, a barrel, sacks, hay; the handcart; the barricade across the street off to the right
      { name: 'crates', frame: 0, x: 31.6, y: 30.9 },
      { name: 'barrel', frame: 0, x: 30.4, y: 31.2 },
      { name: 'sacks of grain', frame: 0, x: 23.6, y: 15.8 },
      { name: 'hay bales', frame: 0, x: 34.9, y: 29.6 },
      { name: 'handcart', frame: 0, x: 33.0, y: 30.6 },
      { name: 'the cart barricade', frame: 0, x: 36.4, y: 26.4 },
      { name: 'crates', frame: 0, x: 35.2, y: 24.4 },
      { name: 'street lamp', frame: 0, x: 16.6, y: 20.6, anim: 3 },
      { name: 'street lamp', frame: 1, x: 18.6, y: 31.4, anim: 3 },
      // on the fronts: washing strung out, lanterns, bunting
      { name: 'washing on a line', frame: 0, x: 20.4, y: 14, on: 'left' },
      { name: 'paper lanterns', frame: 0, x: 22.0, y: 14, on: 'left' },
      { name: 'wall lantern', frame: 0, x: 29.4, y: 14, on: 'left' },
      { name: 'festival bunting', frame: 0, x: 34.8, y: 14, on: 'left' },
      { name: 'wall lantern', frame: 1, x: 16, y: 19.2, on: 'right' },
      { name: 'washing on a line', frame: 0, x: 16, y: 29.6, on: 'right' },
      { name: 'paper lanterns', frame: 0, x: 14.4, y: 21, on: 'left' },
      // the roofs
      { name: 'chimney', frame: 0, x: 23.6, y: 11.2, on: 'top' },
      { name: 'chimney', frame: 1, x: 12.6, y: 27.4, on: 'top' },
      // THE REST CAMP-STYLE, to look at
      ...(all
        ? [
            { name: "the wordsmith's chalk ring", frame: 0, x: R[0] + 0.5, y: R[1] + 0.5, flat: true },
            { name: "the wordsmith's drum", frame: 0, x: R[0] + 0.5, y: R[1] + 1.5 },
            ...STONES.map(([dx, dy], i) => ({ name: "the wordsmith's stone, propped", frame: i % 5, x: R[0] + dx + 0.5, y: R[1] + dy + 0.5 })),
            { name: 'the Lexicon, on its crates', frame: 0, x: 19.5, y: 20.5 },
            { name: 'the stash, on its cart', frame: 0, x: 29.5, y: 29.5 },
            { name: "the stranger's barrel", frame: 0, x: 16.6, y: 20.5 },
          ]
        : []),
    ],
    town: [
      { kind: 'waypoint', x: 17.0, y: 22.0 },
      { kind: 'armourer', x: 31.6, y: 16.0 },
      { kind: 'mystic', x: 25.9, y: 17.1 },
      ...(all ? [{ kind: 'wordsmith' as const, x: R[0], y: R[1] }] : [...ring(R[0], R[1]), { kind: 'lexicon' as const, x: 19, y: 20 }, { kind: 'stash' as const, x: 29, y: 29 }]),
      { kind: 'stranger', x: 16, y: 19 },
      { kind: 'brazier', x: 22.6, y: 25.2 },
      { kind: 'brazier', x: 29.4, y: 19.4 },
      { kind: 'brazier', x: 34, y: 27 },
    ],
    labels: [
      ['GATE', 11.9, 22.5, 150],
      ['ARMOURER', 32.1, 16.5, 50],
      ['MYSTIC', 26.4, 18.6, 96],
      ['WORDSMITH', 21.5, 28.5, 44],
      ['LEXICON', 19.5, 20.5, all ? 50 : 40],
      ['STASH', 29.5, 29.5, all ? 34 : 26],
      ['STRANGER', 16.5, 19.5, 40],
    ],
    hero: [25.4, 25.6],
    whole: [23.8, 22.4],
    folk: [
      { who: 'porter', x: 25.6, y: 20.55, view: 'front', flip: true },
      { who: 'goodwife', x: 23.45, y: 22.8, view: 'front', flip: false },
      { who: 'baker', x: 27.75, y: 23.0, view: 'back', flip: true },
    ],
  };
}

