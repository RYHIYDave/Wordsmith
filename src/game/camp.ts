// ACT 2'S TOWN: THE CAMP INSIDE VELLUM'S GATE, AS THE GAME HOLDS A LEVEL. The art chat's camp (art/hub2_camp.ts campPlace(false, true),
// his yes to it there by 11:30 Pacific, 22 Oct 2026: “Yes, send to main (Recommended)”), laid tile by tile as it laid it: its open
// yard and streets the floor, every other tile houses (painted as the Gate Ward's, art/gateward.ts, with `swept`); its pieces, the
// Gate Ward's and the hub's own, where it stood them; the town's own things and its four keepers on their tiles; its three
// people by the fire (drawn by render.ts from art/hub2_folk.ts); the services where it wrote their names.
//
// THE HERO'S TOWN FROM FLOOR 10 ON, behind EXITS (game/ways.ts): his pick in the main chat, by 12:26 Pacific, 22 Oct 2026, to
// “Once you reach the camp from floor 10, should it be your town from then on?”: “Yes, the camp from then on (Recommended)”,
// offered as: he wakes there after a death, the waypoints of floors 11 to 15 lead there, and its waypoint takes him back down;
// the prison town is left behind. Floor 10's way on brings him in through its city gate (`CAMP.arrive`); its way on to floor 11
// is the barricaded street off to the right (the art chat's proposal, its look still to come: `CAMP.onward`).

import { campPlace } from '../art/hub2_camp';
// (the camp as laid with its way out to floor 11 open, `campPlace(false, true)`: its cart barricade hauled aside, the art chat's
// mockup/act2-hub at ae89b00, with his yes in the art chat by 11:06, 23 Oct, “Yes, send to main (Recommended)”)
import type { TownKind } from '../art/hub2_camp';
import { RNG } from '../engine/rng';
import type { Land } from './act1_layout';
import { GW_ZONES } from './act2/gateward';
import { finish } from './level';
import type { Level, PropInst, Station, StationSpot } from './state';
import { T_FLOOR, T_WALL } from './types';
import type { Floor } from './types';

/** The camp's pieces are looked up as this floor's (render/act1_pieces.ts act1Pieces): the Gate Ward's, the Hush's set and the hub's own. */
export const CAMP_DRESS = 110;
/** Where he comes in from floor 10 (in through the city gate, at its mouth, as the art chat's film has it); where its way on to floor 11 takes him (a few tiles into the barricaded street, past the cart). */
export const CAMP = { arrive: { x: 13.6, y: 22.5 }, onward: { x: 40.5, y: 26.5 } } as const;

/** The camp's pieces that move, at the art's frames a second (`Laid.anim`). */
export const CAMP_ANIM: ReadonlyMap<string, number> = new Map(campPlace(false, true).dress.filter((l) => l.anim && !l.on).map((l) => [l.name, l.anim as number]));
/** The pieces on its roofs (drawn with the roofs: render/act1_pieces.ts). */
export const CAMP_TOPS = campPlace(false, true).dress.filter((l) => l.on === 'top');

/** The pieces that stand in the way, and how far round their anchor they do (tiles): the rest are walked past or over. */
const SOLID: Readonly<Record<string, number>> = {
  'the city gate, held': 0.6,
  'a tent': 0.9,
  'the cooking fire': 0.4,
  'a log to sit on': 0.4,
  "the armourer's field forge": 1.2,
  "the armourer's anvil, on its stump": 0.4,
  "the mystic's caravan": 1.4,
  "the mystic's trestle": 0.6,
  crates: 0.4,
  barrel: 0.4,
  'sacks of grain': 0.4,
  'hay bales': 0.5,
  handcart: 0.6,
  'the cart barricade': 0.7,
  'street lamp': 0.3,
};
/** The town's own things laid flat (walked over). */
const FLAT: ReadonlySet<TownKind> = new Set(['runeRing', 'rug']);
/** Which service each of the art's names is. */
const STATION_OF: Readonly<Record<string, Station>> = { GATE: 'gate', ARMOURER: 'armourer', MYSTIC: 'mystic', WORDSMITH: 'wordsmith', LEXICON: 'lexicon', STASH: 'stash', STRANGER: 'stranger' };

/** Its light: dusk, warm, the fires lit (his “Dusk, warm and alive (Recommended)”; as render.ts lays the open ground's light, game/act1.ts). */
export const CAMP_DUSK = { dark: 0.12, tint: [46, 22, 40] as const, vignette: 0.32, pool: 0.06 };

/** Is this level the camp? */
export function isCamp(L: Level): boolean {
  return L.town && L.act1?.floor === CAMP_DRESS;
}

/** The camp's three people by the fire (art/hub2_folk.ts), where the art sat them. */
export function campFolk(): NonNullable<ReturnType<typeof campPlace>['folk']> {
  return campPlace(false, true).folk ?? [];
}

/** The camp, made: a Level as the town's is (`town` true), with its land as an Act 2 floor's. `tradesOpen`: the stranger's gamble a service. */
export function makeCamp(seed: number, tradesOpen: boolean): Level {
  const pl = campPlace(false, true);
  const W = pl.w;
  const H = pl.h;
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const zones = new Uint8Array(W * H);
  const inR = (r: readonly number[], x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (pl.streets.some((r) => inR(r, x, y))) tiles[i] = T_FLOOR;
      if (inR(pl.open, x, y)) {
        tiles[i] = T_FLOOR;
        zones[i] = GW_ZONES.Square;
      }
    }
  }
  const rng = new RNG((seed ^ 0x2c4f7a11) >>> 0);
  const variant = new Uint8Array(W * H);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  const [ox0, oy0, ox1, oy1] = pl.open;
  const floor: Floor = {
    depth: 0,
    seed,
    w: W,
    h: H,
    tiles,
    cut: new Uint8Array(W * H),
    variant,
    rooms: [{ id: 0, x: ox0, y: oy0, w: ox1 - ox0, h: oy1 - oy0, kind: 'start', path: 0 }],
    start: { x: pl.hero[0], y: pl.hero[1] },
    boss: { ...CAMP.arrive },
    packs: [],
    props: [],
  };
  const level = finish(floor, true, null);
  const land: Land = {
    kind: 'gateward',
    depth: 11,
    seed,
    way: [],
    areas: [],
    lanes: [],
    holds: [],
    exit: { ...CAMP.onward },
    arrive: { ...CAMP.arrive },
    zones,
    squares: pl.squares,
    houses: [],
    swept: true,
  };
  level.land = land;
  level.act1 = { floor: CAMP_DRESS, tiles: [] };
  level.explored.fill(1);
  const block = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) {
      for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
        if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
        if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r + 0.36) level.walk[ty * W + tx] = 0;
      }
    }
  };
  const push = (p: PropInst): PropInst => {
    level.props.push(p);
    return p;
  };
  // THE PIECES (those on the roofs are the renderer's, with the roofs: render/act1_pieces.ts)
  for (const l of pl.dress) {
    if (l.on === 'top') continue;
    const tx = Math.floor(l.x);
    const ty = Math.floor(l.y);
    if (l.on === 'left' || l.on === 'right') {
      // (on a house front: render/act1_pieces.ts, variant = face | frame << 1; the face looking +y on a front along x, +x on one along y)
      push({ kind: 'piece', name: l.name, tx, ty: l.on === 'left' ? l.y : ty, x: l.x, y: l.y, solid: false, state: 0, variant: (l.on === 'left' ? 0 : 1) | (l.frame << 1) });
      continue;
    }
    const r = SOLID[l.name];
    push({ kind: 'piece', name: l.name, tx, ty, x: l.x, y: l.y, solid: r !== undefined, state: 0, variant: l.frame });
    if (r !== undefined) block(l.x, l.y, r);
  }
  // THE TOWN'S OWN THINGS AND ITS FOUR KEEPERS, each on its tile (the waypoint is the level's way: below)
  let way: { x: number; y: number } | null = null;
  for (const t of pl.town) {
    const x = t.x + 0.5;
    const y = t.y + 0.5;
    if (t.kind === 'waypoint') {
      way = { x, y };
      continue;
    }
    const flat = FLAT.has(t.kind);
    push({ kind: t.kind, tx: Math.floor(x), ty: Math.floor(y), x, y, solid: !flat, state: 0, variant: t.v ?? 0 });
    if (!flat) level.walk[Math.floor(y) * W + Math.floor(x)] = 0;
  }
  // THE SERVICES, where the art wrote their names (and as high over them)
  const stations: StationSpot[] = [];
  for (const [text, x, y, lift] of pl.labels) {
    const kind = STATION_OF[text];
    if (!kind || (kind === 'stranger' && !tradesOpen)) continue;
    stations.push({ kind, x, y, lift });
  }
  level.stations = stations;
  // THE WAYS: its waypoint (awake while there is a floor of the city to warp back to: Game.enterTown); its way on to floor 11
  level.ways = {
    stair: null,
    stairs: [],
    way: way ? { ...way, awake: false, warpAt: null } : null,
    gate: -1,
    shaft: null,
    onward: { x: CAMP.onward.x, y: CAMP.onward.y, awake: true, warpAt: null },
  };
  return level;
}
