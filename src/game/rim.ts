// THE ENDLESS TOWN, THE SHAFT'S RIM, AS THE GAME HOLDS A LEVEL. The art chat's town (art/shaft_rim.ts rimPlace(), its ground;
// art/shaft_props.ts rimPieces(), what stands on it), with his yes to all of it in the art chat, 11 Nov 2026, by 13:43: “Yes,
// hand it to main (Recommended)”. Behind ENDLESS_TOWN (art/shaft_rim.ts), OFF on this branch. HIS YES TO IT IN THE GAME, shown
// pictures and a film of it from the game, 11 Nov 2026, by 20:31: “Yes, hand it to main (Recommended)”: the main chat sets the
// switch on as it brings the branch in (docs/endless_town_build.md).
//
// HIS WORDS. His queue item, 11 Nov 2026, 10:31: “A town that is different from the two we currently have, with all the bells and
// whistles needed for the endless run.” His picks, asked by the main chat as pop-ups, 11 Nov 2026, by 15:40: when it is his
// town, “Once endless opens (Recommended)” (offered as: from the moment a hero beats floor 20 and endless opens, the Shaft's
// Rim is his town from then on); what the record stone's notches count, “Every endless level (Recommended)” (offered as: one
// notch for each endless level he has reached, every fifth notch longer). Of the art chat's two additions, the record stone
// (“how deep you've gone in endless”) and the trophies wall (“the bosses whose tablet quarters you hold”): “Keep both
// (Recommended)”.
//
// WHAT IS HERE:
//   THE PLACE     a Level as a town's is (`town` true), 24 tiles by 24, laid as the art laid it: the paved rim and the rough
//                 rock just past it the floor; the pit in its middle, the cliff and the rock beyond no floor; the town's own
//                 things and its four keepers on their tiles; the gate, the record stone and the trophies wall on theirs.
//   ITS STATIONS  the armourer, the mystic (across his table), the wordsmith, the Lexicon, the stash, the stranger, as in the
//                 game's two towns; and THE GATE, where up to three words are burned into the next endless level (RIM_RULES
//                 .gateWords: his rulebook has the gate's words “to come back later as endgame”, his words of 9 Oct 2026,
//                 22:50: “Let’s have the door words go for now.  I think that’ll be endgame stuff”; the art he said yes to
//                 is a gate with three word sockets. HIS YES, shown it in the game, 11 Nov 2026, by 20:31, to “Should burning
//                 up to three spare words into the next endless level come back, in this town only?”: “Yes, back in this
//                 town (Recommended)”).
//   THE WAY DOWN  the waypoint at the stair's head: awake, it takes him to the endless level he has reached, as the towns'
//                 waypoint does now (Game.takeWay). The stair is how it looks; nobody walks on it.
//   WHERE HE WAKES before the gate, the pit before him (RIM_ARRIVE); back by the waypoint, on it.
//   THE RECORD    a notch for each endless level this hero has reached (Game.endless; his yes, 11 Nov 2026, by 20:31, to a
//                 stone that “cuts a notch for each endless level the hero you are playing has reached, and writes your best
//                 ever beside it”: “Yes, this hero's (Recommended)”), at most the stone's seventy; the
//                 newest glowing on the visit it is cut (`fresh`). Past seventy the stone is full and stays full; its name
//                 says the level (RIM_RULES.record, recordLine).
//   THE TROPHIES  four mounts, for the bosses of floors 5, 10, 15 and 20: filled while he holds that boss's quarter of the
//                 tablet (his yes was to “the bosses whose tablet quarters you hold”). The quarters are not built (the
//                 queue's build-endless-tablet-and-final-boss), so `Game.quartersHeld` says none and the mounts are empty.
//   WALKING       the Shaft's Rim is round, and so are things on it. The pit's brink, the six standing stones and the six
//                 braziers hold a body off by their own round, not by a whole tile (`rounds`, the level's `fence`): he walks
//                 up to the kerb all the way round, out on the tongue to the portal's landing, and into the wordsmith's ring
//                 between its stones. The four torches on posts hold nobody (a post is thinner than he is; he passes before
//                 or behind it): the tent's stands in the one way between the pit and the smithy. A touch's errand goes by a
//                 finer grid (`Level.errand`, game/nav.ts), since these ways are narrower than a tile. A step a round thing
//                 refuses is taken round it (`roundStep`).

import { RECORD_ROOM, TROPHY_BOSSES, rimPieces } from '../art/shaft_props';
import { ENDLESS_TOWN, LANDING, RIM, RIM_H, RIM_W, TONGUE, rimPlace } from '../art/shaft_rim';
import { RNG } from '../engine/rng';
import { TUNE } from './defs';
import { endlessName } from './endless';
import { finish } from './level';
import { fineGrid } from './nav';
import type { Level, PropInst, Station, StationSpot } from './state';
import { T_FLOOR, T_VOID } from './types';
import type { Floor, WordId } from './types';

export { ENDLESS_TOWN };

/** The town's rules that are a pick, each one line. */
export const RIM_RULES = {
  /** The gate's three words: burned into the next endless level at its panel, shown in its three sockets (his yes, 11 Nov 2026: “Yes, back in this town (Recommended)”). */
  gateWords: true,
  /** How many notches the record stone has room for (the art's seven rows of ten); past it the stone is full. */
  recordRoom: RECORD_ROOM,
} as const;

/** What the town is called on the screen (the art chat's name for it, his pick of ten: “1 The Shaft's Rim (Recommended)”). */
export const RIM_NAME = "The Shaft's Rim";

const D2R = Math.PI / 180;
/** The kerb's outer edge, from the shaft's middle: nobody's middle is nearer the drop than this (but on the tongue and its landing). */
export const BRINK = RIM.pit + RIM.kerb;
/** How far in from the landing's edge (its kerb and its low posts) and from the tongue's sides a body's middle is kept. */
const LAND_IN = 0.28;
const TONGUE_IN = 0.1;
/** How far round its middle each round thing holds a body's edge off (tiles): a standing stone, a brazier. */
const STONE_R = 0.18;
const FIRE_R = 0.18;

/** The finer grid a touch's errand goes by here: cells to a tile; how much further its round things hold him off in it (so that a run along one never grazes it). */
export const ERRAND = { k: 8, more: 0.02 } as const;

/** Where he stands as he comes into the town (before the gate, the pit before him), and which way he looks. */
export const RIM_ARRIVE = { x: 8.5, y: 8.4, fx: 0.7071, fy: 0.7071 } as const;

/** A ROUND THING that holds a body off by its own round (tiles): the pit's brink (a body's middle is kept out of it), a standing stone, a fire. */
export interface RimRound {
  x: number;
  y: number;
  r: number;
  pit?: boolean;
}

/** What only the Shaft's Rim has, as it stands now (Level.rim). */
export interface RimTown {
  /** The notches cut in the record stone. */
  notches: number;
  /** The newest of them was cut as he came in this time: it glows. */
  fresh: boolean;
  /** The endless level its name says (the one he has reached), and the best any hero of his has reached (0: none before this one). */
  reached: number;
  best: number;
  /** The four mounts of the trophies wall (the bosses of floors 5, 10, 15 and 20), filled or empty. */
  held: boolean[];
  /** The words laid on the gate, in its sockets' order (the game's own list, Game.plan: what is laid or taken back is seen at once). */
  words: readonly WordId[];
  /** The round things (the pit's brink first). */
  rounds: RimRound[];
}

/** Is this level the Shaft's Rim? */
export function isRim(L: Level | null | undefined): boolean {
  return !!L && L.town && !!L.rim;
}

/** Is (x, y) on the portal's tongue or its landing, far enough in from their edges for a body's middle (`more`: further in still)? */
export function onWayOut(x: number, y: number, more = 0): boolean {
  const [lx, ly] = LANDING;
  if (Math.hypot(x - lx, y - ly) <= TONGUE.r - LAND_IN - more) return true;
  const ax = Math.cos(TONGUE.at * D2R);
  const ay = Math.sin(TONGUE.at * D2R);
  const ox = x - RIM.cx;
  const oy = y - RIM.cy;
  const along = ox * ax + oy * ay;
  const across = Math.abs(-ox * ay + oy * ax);
  return along >= TONGUE.out && along <= BRINK + 0.6 && across <= TONGUE.half - TONGUE_IN - more;
}

/** May a body of radius `r` stand at (x, y) for the town's round things (`more`: each held off this much further, for the finer grid)? */
export function rimHolds(rounds: readonly RimRound[], x: number, y: number, r: number, more = 0): boolean {
  for (const q of rounds) {
    const d = Math.hypot(x - q.x, y - q.y);
    if (q.pit) {
      if (d < q.r + more && !onWayOut(x, y, more)) return false;
    } else if (d < q.r + r + more) return false;
  }
  return true;
}

/**
 * A STEP A ROUND THING REFUSED, TAKEN ROUND IT: a body at (x, y) whose step (dx, dy) one of the town's round things would not
 * let it take goes along that thing's round instead, as far as the step went that way. Null where none of them refused it, or
 * the step went straight at its middle. (A wall along the grid needs none of this: the other half of a step slides along it.)
 */
export function roundStep(rounds: readonly RimRound[], x: number, y: number, r: number, dx: number, dy: number): { x: number; y: number } | null {
  const nx = x + dx;
  const ny = y + dy;
  let c: { x: number; y: number; keep: number } | null = null;
  for (const q of rounds) {
    const d = Math.hypot(nx - q.x, ny - q.y);
    if (q.pit ? d < q.r && !onWayOut(nx, ny) : d < q.r + r) {
      c = { x: q.x, y: q.y, keep: q.pit ? q.r : q.r + r };
      break;
    }
  }
  if (!c) return null;
  const ox = x - c.x;
  const oy = y - c.y;
  const d = Math.hypot(ox, oy);
  if (d < 1e-6) return null;
  const tx = -oy / d;
  const ty = ox / d;
  const along = dx * tx + dy * ty;
  if (Math.abs(along) < 1e-6) return null;
  const px = x + tx * along;
  const py = y + ty * along;
  // (a step along a tangent leaves the round by a hair: back onto it, never inside it)
  const pd = Math.hypot(px - c.x, py - c.y);
  if (pd < 1e-6) return null;
  const k = Math.max(pd, c.keep + 1e-4) / pd;
  return { x: c.x + (px - c.x) * k, y: c.y + (py - c.y) * k };
}

/** How many notches the stone shows for the endless level reached. */
export function notchesFor(endless: number): number {
  return Math.max(0, Math.min(RIM_RULES.recordRoom, Math.floor(endless)));
}

/** What is written over the record stone: the endless level he has reached; and his best, where a hero before this one went deeper. */
export function recordLine(R: RimTown): string {
  if (R.reached <= 0) return 'RECORD';
  const here = endlessName(R.reached).toUpperCase();
  return R.best > R.reached ? `${here}, BEST ${R.best}` : here;
}

/** Which mount of the trophies wall is a floor's boss's (0 to 3: floors 5, 10, 15 and 20), or -1. */
export function trophyOf(floor: number): number {
  return TROPHY_BOSSES.findIndex((b) => b.floor === floor);
}

/** Where the new things stand, for whoever draws or names them: the gate's, the record's and the trophies wall's anchors (tiles). */
export const RIM_AT = (() => {
  const P = rimPieces();
  const at = (k: 'gate' | 'record' | 'trophies'): { x: number; y: number } => {
    const p = P.find((q) => q.kind === k)!;
    return { x: p.at[0], y: p.at[1] };
  };
  return { gate: at('gate'), record: at('record'), trophies: at('trophies') };
})();

/** Which service each of the town's own things on a tile is used at, and how high over it its name is written (game pixels; none: render.ts NAME_LIFT). */
const STATION_AT: Partial<Record<string, { kind: Station; lift?: number }>> = {
  armourer: { kind: 'armourer' },
  tentTable: { kind: 'mystic' },
  wordsmith: { kind: 'wordsmith' },
  lexicon: { kind: 'lexicon' },
  stash: { kind: 'stash' },
  stranger: { kind: 'stranger' },
};
/** The gate's service: used from the floor before it; its name over its cap (the arch is 105 game pixels tall). */
const GATE_SPOT = { dy: 0.4, lift: 108 } as const;
/** The town's own things laid flat (walked over). */
const FLAT: ReadonlySet<string> = new Set(['runeRing', 'rug']);
/** Its round things: each holds a body off by its own round, its tile open. */
const ROUND: Readonly<Record<string, number>> = { runeStone: STONE_R, brazier: FIRE_R };

/** The Shaft's Rim, made: a Level as the town's is (`town` true). `tradesOpen`: the stranger's gamble a service. */
export function makeRim(seed: number, tradesOpen: boolean): Level {
  const pl = rimPlace();
  const W = RIM_W;
  const H = RIM_H;
  const tiles = new Uint8Array(W * H).fill(T_VOID);
  // THE FLOOR: the paving and the rough rock just past it, as the art has them; and, round the brink and under the tongue and
  // its landing, every tile a body standing at the kerb or on them lies over (the brink's own round holds him, not these tiles)
  const [lx, ly] = LANDING;
  const bx = RIM.cx + Math.cos(TONGUE.at * D2R) * BRINK;
  const by = RIM.cy + Math.sin(TONGUE.at * D2R) * BRINK;
  const toTongue = (x: number, y: number): number => {
    const vx = bx - lx;
    const vy = by - ly;
    const t = Math.max(0, Math.min(1, ((x - lx) * vx + (y - ly) * vy) / (vx * vx + vy * vy)));
    return Math.hypot(x - (lx + vx * t), y - (ly + vy * t));
  };
  const reach = TUNE.heroRadius * Math.SQRT2 + Math.SQRT1_2 + 0.05;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = Math.hypot(x + 0.5 - RIM.cx, y + 0.5 - RIM.cy);
      const floor = pl.walk[y * W + x] === 1 || (r < RIM.pit && r >= BRINK - reach) || toTongue(x + 0.5, y + 0.5) <= TONGUE.r - LAND_IN + reach;
      if (floor) tiles[y * W + x] = T_FLOOR;
    }
  }
  const rng = new RNG((seed ^ 0x5a17f00d) >>> 0);
  const variant = new Uint8Array(W * H);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  const floor: Floor = {
    depth: 0,
    seed,
    w: W,
    h: H,
    tiles,
    variant,
    rooms: [{ id: 0, x: 3, y: 3, w: W - 6, h: H - 6, kind: 'start', path: 0 }],
    start: { x: RIM_ARRIVE.x, y: RIM_ARRIVE.y },
    boss: { x: RIM_AT.gate.x, y: RIM_AT.gate.y + 1 },
    packs: [],
    props: [],
  };
  const level = finish(floor, true, null);
  const shut = (tx: number, ty: number): void => {
    if (tx >= 0 && ty >= 0 && tx < W && ty < H) level.walk[ty * W + tx] = 0;
  };
  const push = (p: PropInst): PropInst => {
    level.props.push(p);
    return p;
  };
  const rounds: RimRound[] = [{ x: RIM.cx, y: RIM.cy, r: BRINK, pit: true }];
  // THE TOWN'S OWN THINGS AND ITS FOUR KEEPERS, each on its tile (the waypoint is the level's way: below)
  const stations: StationSpot[] = [];
  let way: { x: number; y: number } | null = null;
  for (const t of pl.town) {
    const x = t.x + 0.5;
    const y = t.y + 0.5;
    if (t.kind === 'waypoint') {
      way = { x, y };
      continue;
    }
    const flat = FLAT.has(t.kind);
    const round = ROUND[t.kind];
    push({ kind: t.kind, tx: t.x, ty: t.y, x, y, solid: !flat, state: 0, variant: t.v ?? (t.kind === 'brazier' ? (t.x * 7 + t.y * 3) & 255 : 0) });
    if (round !== undefined) rounds.push({ x, y, r: round });
    else if (!flat) shut(t.x, t.y);
    // (the bazaar is the trader's own, his tile and the eight round it: nobody walks under its roof or behind its table, as in the first town)
    if (t.kind === 'mystic') for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) shut(t.x + dx, t.y + dy);
    const st = STATION_AT[t.kind];
    if (st && (st.kind !== 'stranger' || tradesOpen)) stations.push({ kind: st.kind, x, y, ...(st.lift === undefined ? {} : { lift: st.lift }) });
  }
  // THE NEW THINGS: the gate, the record stone and the trophies wall on their tiles; the torches on posts hold nobody
  for (const p of rimPieces()) if (p.kind !== 'torch') for (const [tx, ty] of p.blocks) shut(tx, ty);
  // (the gate's service is used from the floor before it; its name is written over its cap)
  stations.unshift({ kind: 'gate', x: RIM_AT.gate.x, y: RIM_AT.gate.y + GATE_SPOT.dy, lift: GATE_SPOT.lift });
  level.stations = stations;
  // THE WAYS: its waypoint, the way down (awake while there is a level to go down to: Game.enterTown)
  level.ways = { stair: null, stairs: [], way: way ? { ...way, awake: false, warpAt: null } : null, gate: -1, shaft: null };
  // ITS ROUND THINGS hold a body off by their own round
  level.fence = (x, y, r) => rimHolds(rounds, x, y, r);
  level.rim = { notches: 0, fresh: false, reached: 0, best: 0, held: [false, false, false, false], words: [], rounds };
  // A TOUCH'S ERRAND goes by a finer grid: a cell open where his body may stand anywhere in it (its middle and its four corners)
  const r = TUNE.heroRadius;
  const stands = (x: number, y: number): boolean => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) {
      for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) if (tx < 0 || ty < 0 || tx >= W || ty >= H || level.walk[ty * W + tx] !== 1) return false;
    }
    return rimHolds(rounds, x, y, r, ERRAND.more);
  };
  const half = 0.5 / ERRAND.k;
  level.errand = fineGrid(W, H, ERRAND.k, (x, y) => stands(x, y) && stands(x - half, y - half) && stands(x + half, y - half) && stands(x - half, y + half) && stands(x + half, y + half));
  return level;
}
