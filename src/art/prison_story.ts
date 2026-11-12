// THE THREADS' PIECES FOR FLOORS 3 AND 4: what the prison's stories (game/stories.ts) want that no floor of theirs had. His pick,
// 12 Nov 2026, of the two threads through all five floors: “Both threads (Recommended)”, offered as: the cult's candles, a few on
// floor 1 and more each floor down to its temple on 5; the Sunken Eye's black water seeping in from floor 3 down. Behind STORIES
// (off): art/floors.ts lookPieces adds these to floor 3's and floor 4's own only with it on, in the floor's look as it is (the
// black iron prison's, PRISON, and the buried chapel's, CHAPEL, on in the game since 2 Nov; the Crypt's first looks without them).
//
//   THE CULT'S CANDLES (floor 3; on the floor): floor 1's candles in their old wax, burning (art/floor1.ts candles: the same cult's,
//     the same candles, four frames, their light), set down on floor 3 before the cage, by the post and at the winch; in the
//     prison's colours as floor 3's own pieces are (art/prison.ts gradedB), their flames as they are. Floor 2 has its black candles
//     and floor 4 the cult's candle of its own already.
//   BLACK WATER DOWN THE WALL (floors 3 and 4; on the wall): floor 5's (art/lair_story.ts seepOn: a split across the stone, the
//     swamp's water welling black along it and running straight down the face to the floor), its lit lip the wall's own stone; in
//     the two new looks without the damp between its runs (their faces are carved: the prison's ribs, the chapel's niches, and
//     the runs are laid over them as they are). At the same three places on the face as floor 5's mine has it.
//   BLACK WATER POOLED (floors 3 and 4; floor tiles, along x and along y): floor 5's pool (art/lair_story.ts poolAt) over the
//     floor's own flags (the look's floorAt; the Crypt's flagstones without it), the floor round it dark with the damp.
// The swamp's water keeps its own colours in every look (black, the fen's dull green sheen): it has come from elsewhere. His art
// rulebook kept as floor 5's pieces keep it: nothing cyan, no red; drawn with the floors' own painters.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { CRYPT_FLOORS } from './crypt';
import { candles } from './floor1';
import { spotsFrom, tilesOf } from './floorkit';
import type { Piece } from './floorkit';
import { LAIR_STORY, SWAMP, makeLairStoryArt, poolAt, seepOn, tileOf } from './lair_story';
import type { R5 } from './lair_story';
import { LAIR_TEMPLE, pixelsOf } from './lair_temple';
import { PRISON, STONE as PRISON_STONE, floorAt as prisonFloor, gradedB } from './prison';
import { CHAPEL, STONE as CHAPEL_STONE, floorAt as chapelFloor } from './chapel';
import { BLACK_POOL, BLACK_WATER, CULT_CANDLES, EYE, inTemple } from '../game/stories';

/** Where the water may come down a face (across, up): floor 5's mine's three (art/lair_story.ts SPOTS). */
const spotsOf = spotsFrom({ [BLACK_WATER]: [[0, 0], [-7, 0], [6, 0]] });
const SWAMPS = new Set<string>(SWAMP);

/** A picture's colours put into a look (`grade`), the swamp's water's kept (`grade` keeps what shines). */
function graded(s: Sprite, grade: (c: string) => string): Sprite {
  const src = pixelsOf(s);
  const out = new Px(src.w, src.h);
  const memo = new Map<string, string>();
  for (let i = 0; i < src.d.length; i += 4) {
    if (src.d[i + 3] === 0) continue;
    const c = `#${((src.d[i] << 16) | (src.d[i + 1] << 8) | src.d[i + 2]).toString(16).padStart(6, '0')}`;
    let to = memo.get(c);
    if (!to) memo.set(c, (to = SWAMPS.has(c) ? c : grade(c)));
    out.set((i / 4) % src.w, Math.floor(i / 4 / src.w), to);
  }
  const d = s.density ?? 1;
  const g = out.sprite(s.ax * d, s.ay * d, d);
  if (s.lights) g.lights = s.lights.map((l) => ({ ...l }));
  return g;
}

/**
 * FLOOR 5'S STORY PIECES, his yes of 11 Nov (art/lair_story.ts), for the rooms that tell its story (game/stories.ts STORY_SETS[5]),
 * behind their own switch LAIR_STORY and in the mine that becomes his temple (LAIR_TEMPLE): the mine's under their own names, the
 * temple's (the same pieces in its colours, over its flags) under theirs with ', in the temple' (game/stories.ts inTemple), the Eye
 * the temple's alone.
 */
function lairStoryPieces(): Piece[] {
  if (!LAIR_STORY.on || !LAIR_TEMPLE.on) return [];
  const art = makeLairStoryArt();
  return [...art.mine, ...art.temple.map((p) => (p.name === EYE ? p : { ...p, name: inTemple(p.name) }))];
}

/** THE THREADS' PIECES OF FLOOR `k` (3 or 4; floor 5's story pieces on 5; none on another), in its look as it is, painted each time they are asked for (art/floors.ts lookPieces keeps them with the floor's own, and lets them go with them). */
export function prisonStoryPieces(k: number): Piece[] {
  if (k === 5) return lairStoryPieces();
  if (k !== 3 && k !== 4) return [];
  const theme = CRYPT_FLOORS[k - 1];
  const look = k === 3 ? (PRISON.on ? 'prison' : null) : CHAPEL.on ? 'chapel' : null;
  const lip: R5 = look === 'prison' ? PRISON_STONE : look === 'chapel' ? CHAPEL_STONE : (theme.lit as R5);
  const water = seepOn(lip, look === null);
  // (the pool over the look's own flags, as at the world's tile (1, 2) or (2, 1), as floor 5's is; or over the Crypt's flagstones)
  const own = look === 'prison' ? prisonFloor : look === 'chapel' ? chapelFloor : null;
  const { onTile, around } = tilesOf(theme);
  const pool = (at: 'x' | 'y'): Piece => {
    const seed = at === 'x' ? 0.7 : 2.9;
    const frame = own ? tileOf((u, v, x, y) => poolAt(u, v, at, seed, own(x, y)), at === 'x' ? 1 : 2, at === 'x' ? 2 : 1) : onTile((u, v) => poolAt(u, v, at, seed, around(u, v)));
    return { name: BLACK_POOL[at], kind: 'floor tile', frames: [frame] };
  };
  const list: Piece[] = [{ name: BLACK_WATER, kind: 'on the wall', ...spotsOf(BLACK_WATER, water) }, pool('x'), pool('y')];
  if (k === 3) {
    const frames = [0, 1, 2, 3].map((f) => candles(f));
    list.push({ name: CULT_CANDLES, kind: 'on the floor', frames: look === 'prison' ? frames.map((s) => graded(s, gradedB)) : frames, shadow: 0.26 });
  }
  return list;
}
