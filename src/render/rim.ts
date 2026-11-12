// THE ENDLESS TOWN, THE SHAFT'S RIM, DRAWN (the art chat's pictures, art/shaft_rim.ts and art/shaft_props.ts; his yes to all of
// it there, 11 Nov 2026, by 13:43: “Yes, hand it to main (Recommended)”; behind ENDLESS_TOWN, off until his yes to pictures of it
// from the game). Laid as the art chat's list for the main chat says (docs/mockups/endless_town/README.md, "ONE LIST FOR THE MAIN
// CHAT"), and as its dev page drew the pictures he said yes to (the Shaft's Rim's preview page under src/dev, its `scene`):
//   - THE GROUND: one picture, painted once as the town is come into (under its loading screen), laid behind everything: the
//     paving, the kerb, the cliff, the pit and its stair, the portal's tongue and landing. The floor's own tiles draw nothing.
//   - OVER THE GROUND, before anything stands: the soft shadow under each thing; THE FAR FIRE down the shaft, added, its strength
//     breathing (a 2.6 s round); THE SHAFT'S TORCHES' FLAMES, 12 frames at 30 a second, each at its own phase.
//   - WHAT STANDS, in depth with everything else: the gate (its three sockets holding the words laid on it), the record stone
//     (cut to the endless level reached, the newest notch glowing on the visit it is cut), the trophies wall (each mount filled
//     or empty), the four torches on posts (a post and its flame), the kerb's and the landing's 27 low posts.
//   - THE GAME'S OWN THINGS in the rim's stone (art/shaft_town.ts RIM_THEME: main.ts gives the town its pictures), where the game
//     draws them; but THE WORDSMITH'S SLAB, which is the art chat's with the tablet's socket (eight frames).
//   - THE LIGHT: night, and no dark laid over it: the ground is painted as the night has it, and the fires' warm pools and the
//     friend's cyan are added, as in his pictures. Nothing of the enemy's pink or gold but far down the shaft.
//   - ITS NAMES: the record stone's (the endless level reached) and the trophies wall's, written as the services' are.

import { makeWaypointArt } from '../art/crypt_ways';
import type { WaypointArt } from '../art/crypt_ways';
import { lookStairs } from '../art/floors';
import { WORD_COLOR } from '../art/icons';
import { SPARK } from '../art/kit';
import { GATE_SOCKETS, TORCH_FRAMES, rimPieces, rimProps } from '../art/shaft_props';
import type { RimProps } from '../art/shaft_props';
import { ENDLESS_TOWN, FLAME_FRAMES, GROUND, RIM, groundAt, paintFlame, paintPitGlow, paintPost, paintRimGround, pitGlowAt, rimPosts, shaftTorches } from '../art/shaft_rim';
import { RIM_SHADOWS, RIM_SLAB, RIM_THEME, rimShadow } from '../art/shaft_town';
import type { Sprite } from '../engine/px';
import { RIM_AT, recordLine } from '../game/rim';
import type { Level, PropInst } from '../game/state';
import type { WordId } from '../game/types';
import type { LookLight, LookName, LookStand, LookView } from './looks';

/** How high over each its name is written (game pixels over its foot). */
const NAME_AT = { record: 84, trophies: 52 } as const;
/** The fires' light, as his pictures have it (the dev page's `lights`): a brazier's warm pool, the waypoint's cyan, a shaft torch's glow. */
const GLOW = {
  brazier: { up: 20, r: 70, color: '#ff8a2a', a: 0.22 },
  way: { up: 4, r: 40, color: '#22d0e0', a: 0.35 },
  shaft: { up: 3, r: 16, color: '#ff8a2a', a: 0.3 },
} as const;

/** The night over the cliff's top (the art's own: art/shaft_rim.ts NIGHT). */
const NIGHT = '#07060f';

/** A picture painted on a canvas at the fine grain (two picture pixels to a game pixel), as a Sprite: its anchor in game pixels. */
function fine(cv: HTMLCanvasElement, ax: number, ay: number): Sprite {
  return { img: cv, w: cv.width / 2, h: cv.height / 2, ax, ay, density: 2 };
}
/** The floor point (tiles) that lies at a game pixel of the ground (tile (0, 0) at (0, 0)). */
function tileAt(gx: number, gy: number): [number, number] {
  return [(gx / 16 + gy / 8) / 2, (gy / 8 - gx / 16) / 2];
}
let emptyTile: Sprite | null = null;
/** A floor tile that draws nothing (the ground is one picture, behind everything). */
function nothing(): Sprite {
  if (!emptyTile) {
    const cv = document.createElement('canvas');
    cv.width = 2;
    cv.height = 2;
    emptyTile = { img: cv, w: 0, h: 0, ax: 0, ay: 0 };
  }
  return emptyTile;
}

interface RimArt {
  ground: Sprite;
  glow: Sprite;
  flames: Sprite[];
  post: Sprite;
  props: RimProps;
  torches: { x: number; y: number; k: number }[];
  posts: { x: number; y: number }[];
}

export class RimView implements LookView {
  readonly dark = 0;
  readonly tint = [7, 6, 15] as const;
  readonly vignette = 0;
  private art: RimArt | null = null;
  private way: { stair: Record<'x' | 'y', Sprite>; way: WaypointArt } | null = null;
  private records = new Map<string, Sprite>();
  private wallPics = new Map<string, Sprite>();
  private gems = new Map<string, Sprite>();
  private lit: { of: Level; list: LookLight[] } | null = null;
  private shadows: { of: Level; list: LookStand[] } | null = null;
  /** How long its pictures took to paint the last time they were made, ms (the ground; the new things). */
  readonly cost = { ground: 0, props: 0 };

  on(L: Level): boolean {
    return ENDLESS_TOWN.on && L.town && !!L.rim;
  }

  /** Its pictures let go (another place is come into): made again if it is come back to (render.ts forgetLooks). */
  forget(): void {
    const A = this.art;
    if (A) {
      // (a canvas of no size gives its room back at once: the ground is some four megabytes)
      for (const s of [A.ground, A.glow]) {
        (s.img as HTMLCanvasElement).width = 0;
        (s.img as HTMLCanvasElement).height = 0;
      }
    }
    this.art = null;
    this.way = null;
    this.records.clear();
    this.wallPics.clear();
    this.gems.clear();
    this.lit = null;
    this.shadows = null;
  }

  warm(): void {
    void this.A();
  }

  /** Its pictures (made the first time they are wanted: the ground painted once, some 0.3 s). */
  A(): RimArt {
    if (this.art) return this.art;
    const G = paintRimGround();
    const PG = paintPitGlow();
    const props = rimProps(RIM_SLAB);
    this.cost.ground = G.ms;
    this.cost.props = props.ms;
    return (this.art = {
      ground: fine(G.canvas, -G.gx, -G.gy),
      glow: fine(PG.canvas, -PG.gx, -PG.gy),
      // (a flame's foot at (4, 15) of its picture's 8 by 16; a post's at (4, 17) of its 8 by 18)
      flames: Array.from({ length: FLAME_FRAMES }, (_, f) => fine(paintFlame(f), 2, 7.5)),
      post: fine(paintPost(), 2, 8.5),
      props,
      torches: shaftTorches().map((q) => {
        const [x, y] = tileAt(q.gx, q.gy);
        return { x, y, k: q.k };
      }),
      posts: rimPosts(),
    });
  }

  /** THE WAYS' PICTURES here: the waypoint's dais in the rim's stone (render.ts waysOf). */
  ways(): { stair: Record<'x' | 'y', Sprite>; way: WaypointArt } {
    return (this.way ??= { stair: lookStairs(1), way: makeWaypointArt(RIM_THEME) });
  }

  // (the ground is one picture: no tile of the floor draws anything, and the place has no walls)
  laid(): Sprite | null {
    return null;
  }
  flags(): Sprite {
    return nothing();
  }
  face(): Sprite {
    return nothing();
  }
  unfaced(_L: Level, _i: number, which: number): number {
    return which;
  }
  graded(s: Sprite): Sprite {
    return s;
  }

  /**
   * PAST THE EDGES OF THE GROUND'S PICTURE the screen is the same dark rock, going on (the camera follows him, and at the town's
   * edge a phone shows past the picture: the picture's own edge would be a line in the dark). The rock out there is two flat
   * tones in a weave four picture pixels square (the art's `lit`), so that weave is laid over the whole screen, set on the
   * picture's own pixels; and the night over the cliff's top, between its two sides, as the picture has it. The picture is laid
   * over this.
   */
  behind(g: CanvasRenderingContext2D, ox: number, oy: number, W: number, H: number): void {
    const A = this.A();
    if (!this.rock) {
      // (four pixels square, from the picture's bottom left corner, which is all rock: its height is a whole number of fours)
      const cv = document.createElement('canvas');
      cv.width = 4;
      cv.height = 4;
      const c = cv.getContext('2d') as CanvasRenderingContext2D;
      const h = GROUND.h * 2;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
          c.fillStyle = '#' + groundAt(i, h - 4 + j).toString(16).padStart(6, '0');
          c.fillRect(i, j, 1, 1);
        }
      }
      this.rock = cv;
    }
    const pat = g.createPattern(this.rock, 'repeat');
    if (!pat || typeof DOMMatrix === 'undefined') return;
    const x0 = ox - A.ground.ax;
    const y0 = oy - A.ground.ay;
    pat.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, x0, y0]));
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
    // (over the cliff's top the night, as wide as the cliff: the picture's top row has it so)
    if (y0 > 0) {
      const half = Math.round(RIM.cliff * Math.SQRT2 * 16);
      g.fillStyle = NIGHT;
      g.fillRect(ox - half, 0, half * 2, y0);
    }
  }
  private rock: HTMLCanvasElement | null = null;

  /** THE GROUND, behind everything: its top left where the art says (GROUND), tile (0, 0) at its anchor. */
  back(): readonly LookStand[] {
    return [{ x: 0, y: 0, s: this.A().ground }];
  }

  /** OVER THE GROUND: the shadows; the far fire, breathing; the shaft's torches' flames. */
  flats(L: Level, t: number): readonly LookStand[] {
    const A = this.A();
    if (!this.shadows || this.shadows.of !== L) {
      const list: LookStand[] = [];
      for (const p of L.props) {
        const r = RIM_SHADOWS[p.kind];
        if (r) list.push({ x: p.x, y: p.y, s: rimShadow(r) });
      }
      for (const pc of rimPieces()) list.push({ x: pc.at[0], y: pc.at[1], s: rimShadow(RIM_SHADOWS[pc.kind]) });
      this.shadows = { of: L, list };
    }
    const out: LookStand[] = [...this.shadows.list, { x: 0, y: 0, s: A.glow, add: true, alpha: pitGlowAt(t) }];
    for (const q of A.torches) out.push({ x: q.x, y: q.y, s: A.flames[Math.floor(t * 30 + q.k * 5) % FLAME_FRAMES] });
    return out;
  }

  /** The record stone with `n` notches, the newest glowing or not (painted again when a notch is cut: two or three ms). */
  private record(n: number, fresh: boolean): Sprite {
    const key = `${n}:${fresh ? 1 : 0}`;
    let s = this.records.get(key);
    if (!s) {
      this.records.clear();
      this.records.set(key, (s = this.A().props.record(n, fresh)));
    }
    return s;
  }
  /** The trophies wall, each mount filled or empty. */
  private wall(held: readonly boolean[]): Sprite {
    const key = held.map((h) => (h ? 1 : 0)).join('');
    let s = this.wallPics.get(key);
    if (!s) {
      this.wallPics.clear();
      this.wallPics.set(key, (s = this.A().props.trophies(held)));
    }
    return s;
  }
  /**
   * A WORD SET IN ONE OF THE GATE'S SOCKETS: a small round of the word's own colour in the hollow (five game pixels across, the
   * hollow's own breadth), lighter at its upper left, a dark seam round it; its light the friend's cyan, small.
   */
  private gem(word: WordId): Sprite {
    let s = this.gems.get(word);
    if (!s) {
      const cv = document.createElement('canvas');
      cv.width = 10;
      cv.height = 10;
      const g = cv.getContext('2d') as CanvasRenderingContext2D;
      const col = WORD_COLOR[word] ?? SPARK[2];
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          const d = Math.hypot(x + 0.5 - 5, y + 0.5 - 5);
          if (d > 5) continue;
          g.fillStyle = d > 4 ? '#07060f' : col;
          g.fillRect(x, y, 1, 1);
          if (d <= 4 && (d > 3 && x + y > 10)) {
            g.fillStyle = 'rgba(7,6,15,0.45)';
            g.fillRect(x, y, 1, 1);
          } else if (d <= 2.2 && x + y < 9) {
            g.fillStyle = 'rgba(255,255,255,0.5)';
            g.fillRect(x, y, 1, 1);
          }
        }
      }
      s = { ...fine(cv, 2.5, 2.5), lights: [{ x: 2.5, y: 2.5, r: 6, color: SPARK[2], a: 0.4 }] };
      this.gems.set(word, s);
    }
    return s;
  }

  /** WHAT STANDS: the gate and its words, the record stone, the trophies wall, the torches on posts, the low posts at the brink and round the landing. */
  stands(L: Level, t: number): readonly LookStand[] {
    const A = this.A();
    const R = L.rim;
    const out: LookStand[] = [];
    for (const pc of rimPieces()) {
      const [x, y] = pc.at;
      const d = pc.depth[0] + pc.depth[1];
      if (pc.kind === 'torch') {
        out.push({ x, y, s: A.props.torchPost, d });
        // (each torch at its own phase, as his film has them)
        out.push({ x, y, s: A.props.torchFlame[(Math.floor(t * 30) + Math.round(x * 7 + y * 3)) % TORCH_FRAMES], d: d + 0.001 });
      } else if (pc.kind === 'gate') {
        out.push({ x, y, s: A.props.gate, d });
        // (the words laid on it, each in its socket: just before its face in depth)
        (R?.words ?? []).slice(0, GATE_SOCKETS.length).forEach((w, i) => {
          const at = GATE_SOCKETS[i];
          const [dx, dy] = tileAt(at.x, at.y);
          out.push({ x: x + dx, y: y + dy, s: this.gem(w), d: d + 0.002 });
        });
      } else if (pc.kind === 'record') out.push({ x, y, s: this.record(R?.notches ?? 0, !!R?.fresh), d });
      else out.push({ x, y, s: this.wall(R?.held ?? []), d });
    }
    for (const p of A.posts) out.push({ x: p.x, y: p.y, s: A.post });
    return out;
  }

  /** THE WORDSMITH'S SLAB WITH THE TABLET'S SOCKET, in place of the game's slab (eight frames, as the game's). */
  own(_L: Level, p: PropInst, t: number): Sprite | undefined {
    if (p.kind !== 'runeSlab') return undefined;
    const fr = this.A().props.socketSlab;
    return fr[Math.floor(t * 8) % fr.length];
  }

  /** ITS LIGHTS: no dark is cut (there is none); the fires' warm pools and the waypoint's cyan are added, as in his pictures. */
  lights(L: Level): readonly LookLight[] {
    if (this.lit && this.lit.of === L) return this.lit.list;
    const list: LookLight[] = [];
    const glow = (x: number, y: number, G: { up: number; r: number; color: string; a: number }, still = false): void => {
      list.push({ x, y, up: G.up, r: 0, strength: 0, glow: { r: G.r, color: G.color, a: G.a }, ...(still ? { still: true } : {}) });
    };
    for (const p of L.props) if (p.kind === 'brazier') glow(p.x, p.y, GLOW.brazier);
    const w = L.ways?.way;
    if (w) glow(w.x, w.y, GLOW.way, true);
    for (const q of this.A().torches) glow(q.x, q.y, GLOW.shaft);
    this.lit = { of: L, list };
    return list;
  }

  /** ITS NAMES: the record stone's (the endless level reached; his best, where a hero before went deeper) and the trophies wall's. */
  names(L: Level): readonly LookName[] {
    const R = L.rim;
    if (!R) return [];
    return [
      { x: RIM_AT.record.x, y: RIM_AT.record.y, lift: NAME_AT.record, text: recordLine(R) },
      { x: RIM_AT.trophies.x, y: RIM_AT.trophies.y, lift: NAME_AT.trophies, text: 'TROPHIES' },
    ];
  }
}

/** (for the tests and the dev pages) Where the ground's picture lies, in game pixels, tile (0, 0) at (0, 0). */
export const RIM_GROUND_AT = GROUND;
