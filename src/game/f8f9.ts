// FLOORS 8 AND 9 FROM HIS PHONE: THE BRIDGES, A STRONGHOLD ENTRANCE FLOATING, THE CANYON WALLS NOT SEEN (a mock-up behind a
// switch that is off; docs/mockups/f8f9_fixes/README.md has all of it, and his pictures beside the game's after).
//
// His words, 4 Nov 2026: 08:17, “The bridges in level 9 are really bad”; 08:21, “The bridges don’t line up but they also just
// look bad.”; 08:19, “This stronghold entrance is really weird looking, it’s like it’s floating.  Overlapping the top plateau
// section.”; 08:20, “The perspective of the side walls is still off.  I should be able to see the walls of the canyons when points
// of the plateau jut out”. Asked who mends them: “The art chat (Recommended)”.
//
// WHAT THE GAME LAYS DIFFERENTLY, with the switch on (the rest is the art's and the renderer's: art/f8f9.ts, art/terrain.ts,
// render/act1_pieces.ts):
//   THE PINEWOOD'S BRIDGES (game/act1_layout.ts bridgesOf): each crossing's bridge is turned square to the stream where it
//   crosses (its axis at right angles to the stream's own line there, whatever way that runs on the grid), as long as the stream
//   is wide and a little more, its middle on the stream's middle. The tiles a body walks on over the water are the WHOLE TILES
//   whose middles lie within a band along the bridge's axis (`squareBridge`): never more than 0.62 of a tile from it, slid along
//   the stream by up to half a tile so that the band is as wide as it can be, side to side joined from bank to bank (the walk
//   grid, nav.ts, has cut tiles shut: whole tiles must join by their sides). Over a stream that runs along the grid, that is two
//   rows of tiles under a deck 1.6 tiles wide; over one that runs on the slant, a staircase two tiles thick, every one of its
//   tiles' middles under the deck (a body's middle stays within 0.7 of the axis: the deck reaches 0.8).

/** THE SWITCH: on, shown the pictures, his “Yes, hand them over (Recommended)” to the art chat, 4 Nov 2026 (by 11:30), brought in by the main chat. */
export const F8F9_FIX = { on: true };

/**
 * THE FOOTBRIDGE'S MEASURES (tiles): the deck reaches `half` from the stream's middle along its axis (the water 0.55, its
 * boulders and bank to 0.99, the bridge's ends resting on the bank past that), and `deck` either side of its axis; the tiles
 * under it are those whose middles lie within `band` of the axis and `reach` along it.
 */
export const BRIDGE = { half: 1.42, deck: 0.8, band: 0.62, reach: 1.9 };

/** A bridge laid square to the stream: its middle (world), its axis's angle (world radians; the bridge runs along it), its length and width (tiles), its tiles. */
export interface SquareBridge {
  x: number;
  y: number;
  ang: number;
  len: number;
  wide: number;
  tiles: number[];
}

/** The point `s` tiles along a line from its first point (clamped to its ends). */
function pointAt(pts: readonly [number, number][], s: number): [number, number] {
  let left = s;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const l = Math.hypot(bx - ax, by - ay);
    if (left <= l || i + 2 === pts.length) {
      const t = l > 0 ? Math.max(0, Math.min(1, left / l)) : 0;
      return [ax + (bx - ax) * t, ay + (by - ay) * t];
    }
    left -= l;
  }
  return pts[pts.length - 1];
}
/** How far along a line (tiles from its first point) the point of it nearest (x, y) is. */
function alongOf(pts: readonly [number, number][], x: number, y: number): number {
  let best = Infinity;
  let at = 0;
  let run = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
    const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    const l = Math.sqrt(l2);
    if (d < best) {
      best = d;
      at = run + t * l;
    }
    run += l;
  }
  return at;
}

/** The stream's own way at the point of it nearest (x, y): a unit vector (world), from the chord 1.5 tiles either side (so a bend's corner gives the way between its two runs). */
export function streamWay(river: readonly [number, number][], x: number, y: number): [number, number] {
  const s = alongOf(river, x, y);
  const a = pointAt(river, s - 1.5);
  const b = pointAt(river, s + 1.5);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
}

/** Are these tiles joined by their sides from one bank to the other (a tile at least `end` along the axis each way)? */
function joined(W: number, tiles: number[], alongOfTile: (i: number) => number, end: number): boolean {
  const set = new Set(tiles);
  const from = tiles.filter((i) => alongOfTile(i) <= -end);
  if (!from.length) return false;
  const seen = new Set<number>(from);
  const q = [...from];
  while (q.length) {
    const i = q.pop()!;
    if (alongOfTile(i) >= end) return true;
    for (const j of [i - 1, i + 1, i - W, i + W]) {
      if ((j === i - 1 || j === i + 1) && Math.floor(j / W) !== Math.floor(i / W)) continue;
      if (!set.has(j) || seen.has(j)) continue;
      seen.add(j);
      q.push(j);
    }
  }
  return false;
}

/**
 * A FOOTBRIDGE SQUARE TO THE STREAM at a crossing (cx, cy) on its middle line: its axis at right angles to the stream's way there,
 * and its walkable tiles (see the head of this file). W: the floor's width in tiles.
 */
export function squareBridge(river: readonly [number, number][], cx: number, cy: number, W: number): SquareBridge {
  const [tx, ty] = streamWay(river, cx, cy);
  // (along the bridge: square to the stream, turned toward the eye so that its near end is its far end's +; across it: the stream's way)
  let ax = -ty;
  let ay = tx;
  if (ax + ay < 0 || (Math.abs(ax + ay) < 1e-9 && ax < 0)) {
    ax = -ax;
    ay = -ay;
  }
  const lay = (x: number, y: number, band: number): number[] => {
    const out: number[] = [];
    const R = Math.ceil(BRIDGE.reach + band) + 1;
    for (let j = Math.floor(y) - R; j <= Math.floor(y) + R; j++) {
      for (let i = Math.floor(x) - R; i <= Math.floor(x) + R; i++) {
        const dx = i + 0.5 - x;
        const dy = j + 0.5 - y;
        const along = dx * ax + dy * ay;
        const off = dx * tx + dy * ty;
        if (Math.abs(along) <= BRIDGE.reach && Math.abs(off) < band) out.push(j * W + i);
      }
    }
    return out;
  };
  let best: { x: number; y: number; tiles: number[] } | null = null;
  for (const band of [BRIDGE.band, 0.72, 0.85, 1.0]) {
    for (let k = 0; k <= 10; k++) {
      // (slid along the stream by up to half a tile, nearest first)
      const s = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.05;
      const x = cx + tx * s;
      const y = cy + ty * s;
      const tiles = lay(x, y, band);
      const al = (i: number): number => ((i % W) + 0.5 - x) * ax + (Math.floor(i / W) + 0.5 - y) * ay;
      if (!joined(W, tiles, al, 1.2)) continue;
      if (!best || tiles.length > best.tiles.length) best = { x, y, tiles };
    }
    if (best) break;
  }
  const b = best ?? { x: cx, y: cy, tiles: lay(cx, cy, 1.0) };
  return { x: b.x, y: b.y, ang: Math.atan2(ay, ax), len: 2 * BRIDGE.half, wide: 2 * BRIDGE.deck, tiles: b.tiles };
}

/** How far the middle of tile `i` lies from a bridge's axis, across it, and along it (tiles). */
export function bridgeOffsets(b: { x: number; y: number; ang: number }, W: number, i: number): { along: number; off: number } {
  const ax = Math.cos(b.ang);
  const ay = Math.sin(b.ang);
  const dx = (i % W) + 0.5 - b.x;
  const dy = Math.floor(i / W) + 0.5 - b.y;
  return { along: dx * ax + dy * ay, off: -dx * ay + dy * ax };
}
