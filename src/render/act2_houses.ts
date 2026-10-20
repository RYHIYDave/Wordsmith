// ACT 2, THE HUSH, DRAWN: FLOOR 11, THE GATE WARD'S HOUSES WALKED INTO, AND ITS TRAPS BY THEIR BEAT (behind ACT2, off).
//
// HIS RULE, his art rulebook's Places 9 (18 Oct 2026, to the art chat's first picture of the Gate Ward: "Can we make it so the
// fronts of any building you can go into is there, but once you enter, the wholefacade fades to transparent so you can see
// inside?"; then "Let’s make this a rule for rooms and buildings to go into.  The walls are transparent once you go into them.
// Or look into them?", and asked when, "Let’s try when you step inside, but remind me in a couple days to revisit this
// topic"): from the street a house walked into stands whole, front and roof, its door open; once the hero is in its room or its
// doorway, its whole front and roof fade to clear in about a third of a second (SHELL_FADE), and come back as he leaves.
//
// HOW (the art chat's note to the main chat, docs/mockups/act2_gateward/README.md, "FOR THE MAIN CHAT"): the ground is painted
// with every house walked into open (its front cut down, its room's boards: render/outdoor.ts); each house's SHELL is
// art/gateward.ts `houseShell(open, closed, house, paintTerrain)`, what the house whole shows that the ground does not, its
// front, its door and its roof. It is laid over the ground and over whatever stands inside the house, under whatever stands
// outside it: in the renderer's sort by depth (render.ts), everything whose foot is in the house is put just before the house's
// own depth (the foot of its front, where the street before it begins), and its shell at that depth, faded as far as it has.
// One thing more than the art's shell: where its picture shows the street behind the house (the ground's rule, nothing it
// paints stands over walkable floor, cuts the house's roof down there), the shell is left clear, so that it never covers what
// stands on that street.
//
// PAINTING: about 84 thousandths of a second a 256 by 256 piece (the art's measure), two pictures of each house (whole and
// open), so a few tenths of a second a house: painted ONCE A FLOOR, AHEAD, by the ground's worker (render/painter.ts, its
// `shells`), a house at a time between the ground's pieces, and handed over; where there is no worker (or it fails), here, one
// house a frame at most, the nearest first, after the floor's first two seconds. Until a house's shell has come it stands
// open, as the ground has it. Never painted again on the floor, never in a fight.

import { GW_RISE, gateWardLook, gateWardPaintFloor, houseShell, houseShellWhole } from '../art/gateward';
import type { GWHouse, GateWardLand, HouseShell } from '../art/gateward';
import { GRAIN, paintTerrain, terrainOf, worldOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import type { Piece } from '../art/floor1';
import type { Sprite } from '../engine/px';
import type { Land } from '../game/act1_layout';
import type { GWTrap, GateWardDress } from '../game/act2/gateward';
import type { Level, PropInst } from '../game/state';
import { spikeAt } from '../game/traps';
import type { Floor } from '../game/types';
import type { Painter } from './painter';
import { wallsThick } from './act2_walls';
import type { Hole } from './act2_walls';

/** How long a house's front and roof take to fade away, and to come back, in seconds (his "about a third of a second": the art chat's film, 0.3). */
export const SHELL_FADE = 0.33;
/** Where there is no worker: the floor's first this many seconds are left to the ground, before a shell is painted here. */
const SHELL_WAIT = 2;
/** (ACT2_WALLS on) A house on the screen whose shell has not come from the worker this long after it came on the screen (seconds) is painted here. */
const SHELL_LATE = 0.3;

/** Is world (x, y) in a house walked into: its room, or its doorway (his word: in the house)? */
export function inHouse(h: GWHouse, x: number, y: number): boolean {
  if (x >= h.room[0] && x < h.room[2] && y >= h.room[1] && y < h.room[3]) return true;
  const F = h.front;
  return F.along === 'x' ? Math.floor(y) === F.at && x >= F.door[0] && x < F.door[1] : Math.floor(x) === F.at && y >= F.door[0] && y < F.door[1];
}
/** A house's depth in the renderer's sort (world x + y): the foot of its front, where the street before it begins, half a tile in. */
export function houseDepth(h: GWHouse): number {
  return h.front.along === 'x' ? h.room[0] + h.front.at + 0.5 : h.front.at + h.room[1] + 0.5;
}

/**
 * THE SHELLS OF A FLOOR'S HOUSES, made one at a time from its ground (`open`, the terrain the ground is painted with) and the
 * same ground with every house whole (`closed`, made the first time it is wanted): for the ground's worker and for the page.
 * `gl`: the land as the Gate Ward's look asks it (render/outdoor.ts gateWardLand: the very same, so that the two grounds
 * differ only at the houses).
 */
export function shellMaker(gl: GateWardLand, open: Terrain, whole = false): { count: number; make(n: number): HouseShell } {
  const houses = gl.houses ?? [];
  let closed: Terrain | null = null;
  return {
    count: houses.length,
    make(n: number): HouseShell {
      closed ??= terrainOf(gateWardPaintFloor(gl, 'closed'), gateWardLook(gl, 'closed'));
      const h = houses[n];
      // (ACT2_WALLS on, the walls standing whole: the house stands whole over the street behind it too, as every house does,
      // seen through round whoever is behind it: render/act2_walls.ts)
      if (whole) return houseShellWhole(closed, h, paintTerrain);
      const sh = houseShell(open, closed, h, paintTerrain);
      // (clear where it shows the street behind the house: there the ground cuts the house down, and the shell must not
      // cover what stands on that street; the house's own tiles, its room, doorway and front, are kept)
      const F = h.front;
      const own = (tx: number, ty: number): boolean => (tx >= h.room[0] && tx < h.room[2] && ty >= h.room[1] && ty < h.room[3]) || (F.along === 'x' ? ty === F.at && tx >= h.room[0] && tx < h.room[2] : tx === F.at && ty >= h.room[1] && ty < h.room[3]);
      for (let i = 0; i < sh.w * sh.h; i++) {
        const o = i * 4 + 3;
        if (!sh.rgba[o]) continue;
        const [x, y] = worldOf(sh.x0 + (i % sh.w), sh.y0 + Math.floor(i / sh.w));
        if (open.ground(x, y) && !own(Math.floor(x), Math.floor(y))) sh.rgba[o] = 0;
      }
      return sh;
    },
  };
}

/** A shell as the renderer stands it: a picture laid from the world's origin (picture pixels to game pixels, GRAIN). */
function shellSprite(img: HTMLCanvasElement | ImageBitmap, sh: { x0: number; y0: number; w: number; h: number }): Sprite {
  return { img: img as HTMLCanvasElement, w: sh.w / GRAIN, h: sh.h / GRAIN, ax: -sh.x0 / GRAIN, ay: -sh.y0 / GRAIN };
}

/** What of the renderer's stands this asks and moves: its depth and where it is on the screen (render.ts, Stand). */
interface StandLike {
  d: number;
  x: number;
  top?: boolean;
  chunk?: unknown;
}

export class HouseShells {
  private land: Land | null = null;
  private houses: readonly GWHouse[] = [];
  /** Each house's shell, once it has come; how far it shows (1 whole, 0 gone). */
  private shells: (Sprite | null)[] = [];
  private shown: number[] = [];
  /** The worker's number for this floor's shells (0: none asked of it), and whether the page paints them itself. */
  private id = 0;
  private here = false;
  private maker: { count: number; make(n: number): HouseShell } | null = null;
  /** (ACT2_WALLS on) The houses stand whole over the street behind them, seen through round whoever is behind them. */
  private whole = false;
  /** (ACT2_WALLS on) When each house without its shell came on the screen; and whether this is the floor's first frame. */
  private seenAt = new Map<number, number>();
  private firstFrame = false;
  private since = 0;
  private lastT = -1;
  /** For the tests and measuring: shells come, from the worker and painted here, and the time it took here. */
  readonly stats = { worker: 0, here: 0, ms: 0 };
  private static ids = 0;

  constructor(private readonly painterOf: () => Painter | null) {}

  /**
   * This frame's floor (call once a frame, before what stands is laid). A new floor of the Gate Ward with houses walked into: its
   * shells asked of the ground's worker, or (none) painted here. `gl` and `open`: its land as its look asks it, and its ground's
   * terrain (render/outdoor.ts), for painting here.
   */
  begin(land: Land | null, floor: Floor, gl: (() => GateWardLand) | null, open: Terrain | null, t: number, near?: readonly [number, number]): void {
    if (land !== this.land) {
      // (the last floor's let go of)
      for (const s of this.shells) if (s && 'close' in s.img) (s.img as unknown as ImageBitmap).close();
      this.land = land;
      this.houses = land && land.kind === 'gateward' ? land.houses ?? [] : [];
      this.whole = !!land && wallsThick(land) > 0;
      this.seenAt.clear();
      this.firstFrame = true;
      this.shells = this.houses.map(() => null);
      this.shown = this.houses.map(() => 1);
      this.maker = null;
      this.here = false;
      this.id = 0;
      this.since = t;
      this.lastT = t;
      if (!this.houses.length || !land) return;
      const p = this.painterOf();
      const id = ++HouseShells.ids;
      if (p && p.state === 'on' && p.shells(id, land, floor, (n, sh, bmp) => this.took(id, n, sh, bmp), this.whole, near)) this.id = id;
      else this.here = true;
    }
    if (!this.houses.length) return;
    // (the worker failed meanwhile: what is still to come is painted here)
    const p = this.painterOf();
    if (this.id && (!p || p.state !== 'on')) {
      this.id = 0;
      this.here = true;
    }
    if (this.here && gl && open && t - this.since > SHELL_WAIT) this.paintOne(gl, open);
  }

  /** A shell come from the worker (`n` < 0: it could not paint them: what is still to come is painted here). */
  private took(id: number, n: number, sh: { x0: number; y0: number; w: number; h: number }, bmp: ImageBitmap | null): void {
    if (id === this.id && n < 0) {
      this.id = 0;
      this.here = true;
    }
    if (!bmp) return;
    if (id !== this.id || n < 0 || n >= this.shells.length || this.shells[n]) {
      bmp.close();
      return;
    }
    this.shells[n] = shellSprite(bmp, sh);
    this.stats.worker++;
  }

  /** Where there is no worker: one house's shell, the nearest the hero not painted yet. */
  private hero: { x: number; y: number } = { x: 0, y: 0 };
  private paintOne(gl: () => GateWardLand, open: Terrain): void {
    let best = -1;
    let bd = Infinity;
    this.houses.forEach((h, n) => {
      if (this.shells[n]) return;
      const d = Math.hypot((h.room[0] + h.room[2]) / 2 - this.hero.x, (h.room[1] + h.room[3]) / 2 - this.hero.y);
      if (d < bd) {
        bd = d;
        best = n;
      }
    });
    if (best >= 0) this.paintN(gl, open, best);
  }

  /**
   * (ACT2_WALLS on) THE HOUSES ON THE SCREEN, WHOLE AT ONCE: a house walked into stands open (its front cut down, its room seen)
   * until its shell comes, and the worker paints them after the ground round the screen. So one on the screen without its
   * shell is painted here: every one on the floor's first frame, and after that one a frame, once it has been on the screen
   * SHELL_LATE without it. (cam: the screen's origin in game pixels; W, H its size.)
   */
  ensure(gl: (() => GateWardLand) | null, open: Terrain | null, camOx: number, camOy: number, W: number, H: number, t: number): void {
    const first = this.firstFrame;
    this.firstFrame = false;
    if (!this.whole || !gl || !open || !this.houses.length) return;
    let done = false;
    this.houses.forEach((h, n) => {
      if (this.shells[n]) return;
      const [rx0, ry0, rx1, ry1] = h.room;
      const x1 = h.front.along === 'y' ? Math.max(rx1, h.front.at + 1) : rx1;
      const y1 = h.front.along === 'x' ? Math.max(ry1, h.front.at + 1) : ry1;
      const sx0 = camOx + (rx0 - y1) * 16;
      const sx1 = camOx + (x1 - ry0) * 16;
      const sy0 = camOy + (rx0 + ry0) * 8 - GW_RISE / 2;
      const sy1 = camOy + (x1 + y1) * 8;
      if (sx1 < 0 || sx0 > W || sy1 < 0 || sy0 > H) {
        this.seenAt.delete(n);
        return;
      }
      const since = this.seenAt.get(n) ?? t;
      this.seenAt.set(n, since);
      if (first || (!done && t - since > SHELL_LATE)) {
        done = true;
        this.paintN(gl, open, n);
      }
    });
  }

  /** One house's shell, painted here. */
  private paintN(gl: () => GateWardLand, open: Terrain, best: number): void {
    if (best < 0 || typeof document === 'undefined') return;
    const t0 = performance.now();
    this.maker ??= shellMaker(gl(), open, this.whole);
    const sh = this.maker.make(best);
    const cvs = document.createElement('canvas');
    cvs.width = sh.w;
    cvs.height = sh.h;
    (cvs.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(sh.rgba, sh.w, sh.h), 0, 0);
    this.shells[best] = shellSprite(cvs, sh);
    this.stats.here++;
    this.stats.ms += performance.now() - t0;
  }

  /** Is world (x, y) shut in a house standing whole (its shell there and showing more than half)? (Its light is not seen.) */
  hides(x: number, y: number): boolean {
    for (let n = 0; n < this.houses.length; n++) if (this.shells[n] && this.shown[n] > 0.5 && inHouse(this.houses[n], x, y)) return true;
    return false;
  }

  /** How far each house's shell shows now (for the tests and pictures). */
  showing(): readonly number[] {
    return this.shown;
  }
  /** How many shells have come. */
  ready(): number {
    return this.shells.filter((s) => !!s).length;
  }

  /**
   * LAY THE SHELLS among what stands (call before the renderer sorts it): each house fading toward clear while the hero is in it
   * and back while he is not; whatever stands in a house put just before the house's depth, keeping its order there; each shell
   * that shows stood at that depth (`stand`: the renderer's own, with the shell's strength).
   */
  lay(
    stands: StandLike[],
    camOx: number,
    camOy: number,
    hx: number,
    hy: number,
    t: number,
    stand: (d: number, s: Sprite, x: number, y: number, alpha: number, holes: Hole[] | null) => void,
    holesOf: ((key: string, d: number, x: number, y: number, w: number, h: number) => Hole[] | null) | null = null,
  ): void {
    this.hero = { x: hx, y: hy };
    if (!this.houses.length) return;
    const dt = Math.max(0, Math.min(1, t - this.lastT));
    this.lastT = t;
    this.houses.forEach((h, n) => {
      const want = inHouse(h, hx, hy) ? 0 : 1;
      const step = dt / SHELL_FADE;
      this.shown[n] = want < this.shown[n] ? Math.max(0, this.shown[n] - step) : Math.min(1, this.shown[n] + step);
    });
    // (where on the floor each stands: its depth is world x + y, its place across the screen world x - y)
    for (const st of stands) {
      if (st.top || st.chunk) continue;
      const u = (st.x - camOx) / 16;
      const x = (st.d + u) / 2;
      const y = (st.d - u) / 2;
      for (let n = 0; n < this.houses.length; n++) {
        const h = this.houses[n];
        if (!inHouse(h, x, y)) continue;
        const D = houseDepth(h);
        const lo = h.room[0] + h.room[1];
        const hi = h.front.along === 'x' ? h.room[2] + h.front.at + 1 : h.front.at + 1 + h.room[3];
        st.d = D - 0.6 + 0.5 * Math.max(0, Math.min(1, (st.d - lo) / Math.max(1, hi - lo)));
        break;
      }
    }
    this.houses.forEach((h, n) => {
      const s = this.shells[n];
      if (!s || this.shown[n] <= 0.01) return;
      // (ACT2_WALLS on: standing whole over the street behind it, it is seen through round whoever is behind it)
      const D = houseDepth(h);
      const holes = this.whole && holesOf ? holesOf(`house ${n}`, D, camOx - s.ax, camOy - s.ay, s.w, s.h) : null;
      stand(D, s, camOx, camOy, this.shown[n], holes);
    });
  }

  /** Let go of the shells (the floor has been left). */
  clear(): void {
    for (const s of this.shells) if (s && 'close' in s.img) (s.img as unknown as ImageBitmap).close();
    this.land = null;
    this.houses = [];
    this.shells = [];
    this.shown = [];
    this.maker = null;
  }
}

// ---------------------------------------------------------------------------------------------------
// THE GATE WARD'S TRAPS BY THEIR BEAT

const trapsOf = new WeakMap<Level, Map<number, GWTrap>>();

/**
 * THE PICTURE OF ONE OF THE GATE WARD'S TRAPS at the moment of its beat (game/act2/gateward.ts lays each as the descent's traps
 * are, a spike floor's beat: game/traps.ts), or undefined (not one of its traps): the art's frames (art/floor11.ts, art/act2_set.ts),
 * quiet while the beat is down, its warning, then sprung:
 *   the watch's alarm horn: quiet, the warning (its throat kindling), the blast three (from `frame0`: along +y 0, along +x 5);
 *   a jar of the Hush: sealed, cracking, the burst two;
 *   a firepot's crater, still burning: its four frames of flame, the first two (slowly) while down, the last two (fast) as it
 *     warns and bites (the art drew it burning, no warning of its own: the planning chat's helper's pick).
 */
export function trapSprite(L: Level, p: PropInst, time: number, piece: (name: string) => Piece | undefined): Sprite | null | undefined {
  if (p.kind !== 'piece' || !p.name) return undefined;
  const dress = L.act1 as GateWardDress | undefined;
  if (!dress || !('wardTraps' in dress)) return undefined;
  let m = trapsOf.get(L);
  if (!m) {
    m = new Map(dress.wardTraps.map((t) => [t.i, t]));
    trapsOf.set(L, m);
  }
  const tr = m.get(p.ty * L.floor.w + p.tx);
  const spot = tr ? L.floor.hazards?.[tr.hz] : undefined;
  if (!tr || tr.name !== p.name || !spot) return undefined;
  const fr = piece(p.name)?.frames;
  if (!fr || !fr.length) return null;
  const at = spikeAt(spot, time);
  let k: number;
  if (p.name === "a firepot's crater, burning") k = at.at === 'down' ? Math.floor(time * 4) % 2 : 2 + (Math.floor(time * 12) % 2);
  else if (p.name === 'a jar of the Hush') k = at.at === 'down' ? 0 : at.at === 'warn' ? 1 : 2 + Math.min(1, Math.floor(at.k * 2));
  else k = tr.frame0 + (at.at === 'down' ? 0 : at.at === 'warn' ? 1 : 2 + Math.min(2, Math.floor(at.k * 3)));
  return fr[k % fr.length] ?? fr[0];
}
