// THE HEADSMAN'S YARD, DRAWN (the art chat's pieces, art/yard.ts; the yard laid by game/yard.ts, behind YARD): floor 2's boss
// hall outdoors, at night. What the renderer asks of it (render/render.ts):
//   - `back`: the sky over the far walls, the keep and the cell block, the hills, and the tower in the far corner, drawn first,
//     only over what lies behind the yard's far walls on the screen, and only while the hero is in the yard;
//   - `floor`: the cobbles of a tile of the yard, or one of the yard's own tiles laid there (the gutter along the left wall's
//     foot, beaten earth where the doorway is walked from, sawdust at the scaffold's steps, puddles);
//   - `face`: the prison wall, 150 high, for a face of the ring of wall round the yard (the Crypt's for every other);
//   - `stands`: the scaffold and the gallows, each cut into strips a half tile wide, each strip in its place in the order of what
//     stands (the nearer edge of the thing in that strip), so that whoever walks round them is in front or behind as he should
//     be; the flat puddles; the torches on the far walls, and their light.
//   - `dark`: under the open sky the yard's dark is the moon's (the art's preview lays it at 0.42), while the hero is in it.

import { YARD, makeYardArt } from '../art/yard';
import { YARD_GATE } from '../art/yard_gate';
import type { YardArt } from '../art/yard';
import type { Sprite } from '../engine/px';
import { YARD_FOOT, inYard } from '../game/yard';
import type { Floor } from '../game/types';
import type { Cam } from './fx';
import { wx, wyFlat } from './fx';

/** The yard's dark (rgba alpha, the art's preview). */
export const YARD_DARK = 0.42;
/** How high on the wall a torch's fire is (game pixels: the art's 92 picture pixels). */
const TORCH_UP = 46;
/** How high the prison wall stands, to its battlements' tops (game pixels: the art's 150 and its merlons' 24). */
const YARD_WALL_UP = 87;
/** How much of the dark is taken off the sky over the far walls (the moon's own light), and the yard's vignette. */
export const YARD_SKY_LIFT = 0.55;
export const YARD_VIGNETTE = 0.4;

/** What stands, for the renderer's list of stands: depth, picture, where, how seen. */
export interface YardStand {
  d: number;
  s: Sprite;
  x: number;
  y: number;
  alpha: number;
}

/** A big piece's box on the floor (from its anchor: x from x0 to x1, y from y0 to y1), for its strips' order. */
const BOXES: Record<string, { x0: number; x1: number; y0: number; y1: number }> = {
  // (the scaffold's 3.4 by 3.2 and half its steps' run toward the eye)
  'the scaffold, draped': { x0: -1.7, x1: 1.7, y0: -1.6, y1: 2.2 },
  // (the gallows' 3.8 by 1.6, its steps toward the eye)
  'the long gallows': { x0: -1.9, x1: 1.9, y0: -0.8, y1: 1.2 },
};
/** The flat puddles (the art's 'on the floor'), from the yard's far corner. */
const PUDDLES: [string, number, number][] = [['a wide puddle', 2.6, 6.0], ['a great puddle', 10.8, 6.6], ['a wide puddle', 4.6, 11.2]];
/** Puddles laid as tiles, and the sawdust at the scaffold's steps, from the yard's far corner. */
const LAID: [number, number, string][] = [
  [11, 11, 'a little puddle'], [8, 11, 'a puddle'], [12, 4, 'a long puddle'],
  [6, 8, 'yard sawdust'], [5, 8, 'yard sawdust'], [6, 9, 'yard sawdust'], [7, 9, 'yard sawdust'],
];

export class YardView {
  private art: YardArt | null = null;
  private laid = new Map<number, Sprite>();
  private laidFor: Floor | null = null;
  private strips = new Map<Sprite, { s: Sprite; u: number }[]>();

  /** Its pictures let go (another floor is come into): made again if it is come back to. His words, 4 Nov 2026, 08:12: “I don’t know if my phone is getting to hot or whatever but it’s crashing every couple of levels” (render.ts forgetLooks). */
  forget(): void {
    this.art = null;
    this.laid = new Map();
    this.laidFor = null;
    this.strips = new Map();
  }

  /** Is the yard to be drawn on this floor? */
  on(f: Floor): boolean {
    return YARD.on && !!f.yard;
  }

  /** Make its pictures now (about a second and a half the first time: as the floor is come into, with the floor's own pieces, not as the yard first comes in sight). */
  warm(): void {
    this.A();
  }

  private A(): YardArt {
    return (this.art ??= makeYardArt());
  }

  private tileNamed(n: string): Sprite {
    return this.A().tiles.find((p) => p.name === n)!.frames![0];
  }

  /** The yard's own tiles where they lie (by tile index), made once a floor. */
  private laidOf(f: Floor): Map<number, Sprite> {
    if (this.laidFor === f) return this.laid;
    this.laidFor = f;
    this.laid = new Map();
    const Y = f.yard!;
    const put = (x: number, y: number, n: string): void => {
      if (x < 0 || y < 0 || x >= Y.n || y >= Y.n) return;
      this.laid.set((Y.y + y) * f.w + Y.x + x, this.tileNamed(n));
    };
    // (the gutter at the left wall's foot)
    for (let y = 0; y < Y.n; y++) put(0, y, 'gutter along y');
    // (beaten earth where the doorway is walked from)
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2], [1, 3]]) put(Y.door + dx, dy, 'beaten earth');
    for (const [x, y, n] of LAID) put(x, y, n);
    return this.laid;
  }

  /** The picture of floor tile (tx, ty) if it is the yard's, else null. */
  floor(f: Floor, tx: number, ty: number): Sprite | null {
    if (!inYard(f, tx, ty)) return null;
    return this.laidOf(f).get(ty * f.w + tx) ?? this.A().floor(tx - f.yard!.x, ty - f.yard!.y);
  }

  /** Is wall tile (tx, ty) the yard's (its ring, the doorway's sides with it)? */
  ring(f: Floor, tx: number, ty: number): boolean {
    const Y = f.yard;
    return !!Y && tx >= Y.x - 1 && tx <= Y.x + Y.n && ty >= Y.y - 1 && ty <= Y.y + Y.n;
  }

  /** The prison wall's face for wall tile (tx, ty), `left` the face turned to screen-left (a wall along x), by its variant. */
  face(left: boolean, v: number): Sprite {
    const A = this.A();
    return left ? A.faceLeft[v % A.faceLeft.length] : A.faceRight[v % A.faceRight.length];
  }

  /**
   * While the hero is in the yard, is tile (tx, ty) drawn? The yard, its ring of wall, and the way in through the doorway a few
   * tiles back: what lies further behind the far walls is the sky's (the Crypt's rooms there are not seen over the wall).
   */
  shows(f: Floor, tx: number, ty: number): boolean {
    const Y = f.yard!;
    if (tx >= Y.x - 1 && tx <= Y.x + Y.n && ty >= Y.y - 1 && ty <= Y.y + Y.n) return true;
    return ty >= Y.y - 4 && ty < Y.y - 1 && tx >= Y.x + Y.door - 1 && tx <= Y.x + Y.door + 3;
  }

  /** Is the hero where the yard is seen as outdoors (in it, or in its doorway)? */
  heroIn(f: Floor, x: number, y: number): boolean {
    const Y = f.yard;
    return !!Y && x >= Y.x - 0.5 && x < Y.x + Y.n + 0.5 && y >= Y.y - 1.5 && y < Y.y + Y.n + 0.5;
  }

  /** THE SKY AND THE TOWER, over what lies behind the yard's far walls on the screen. */
  back(g: CanvasRenderingContext2D, cam: Cam, f: Floor, W: number, H: number): void {
    const Y = f.yard!;
    const A = this.A();
    const tx = wx(cam, Y.x, Y.y);
    const ty = wyFlat(cam, Y.x, Y.y);
    const lx = wx(cam, Y.x, Y.y + Y.n);
    const ly = wyFlat(cam, Y.x, Y.y + Y.n);
    const rx = wx(cam, Y.x + Y.n, Y.y);
    const ry = wyFlat(cam, Y.x + Y.n, Y.y);
    if (rx < 0 || lx > W || ty - A.beyond.ay > H) return;
    g.save();
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(tx, ty);
    g.lineTo(rx, ry);
    g.lineTo(rx, -10);
    g.lineTo(lx, -10);
    g.closePath();
    g.clip();
    const b = A.beyond;
    g.drawImage(b.img, Math.round(tx) - b.ax, Math.round(ty) - b.ay, b.w, b.h);
    const t = A.tower;
    g.drawImage(t.img, Math.round(tx) - t.ax, Math.round(ty) - t.ay, t.w, t.h);
    g.restore();
  }

  /** The picture of a big piece (whole), for whether it covers the hero. */
  bigSprite(name: string): Sprite | null {
    return this.A().pieces.find((q) => q.name === name)?.frames?.[0] ?? null;
  }

  /** THE SKY'S OWN LIGHT: the dark over what lies behind the far walls taken down by `lift` (a share of it), on the dark's own canvas. */
  skyLift(dg: CanvasRenderingContext2D, cam: Cam, f: Floor, lift: number): void {
    const Y = f.yard!;
    dg.save();
    dg.globalCompositeOperation = 'destination-out';
    dg.globalAlpha = lift;
    dg.beginPath();
    dg.moveTo(wx(cam, Y.x, Y.y + Y.n), wyFlat(cam, Y.x, Y.y + Y.n) - YARD_WALL_UP);
    dg.lineTo(wx(cam, Y.x, Y.y), wyFlat(cam, Y.x, Y.y) - YARD_WALL_UP);
    dg.lineTo(wx(cam, Y.x + Y.n, Y.y), wyFlat(cam, Y.x + Y.n, Y.y) - YARD_WALL_UP);
    dg.lineTo(wx(cam, Y.x + Y.n, Y.y), -10);
    dg.lineTo(wx(cam, Y.x, Y.y + Y.n), -10);
    dg.closePath();
    dg.fillStyle = '#000';
    dg.fill();
    dg.restore();
  }

  /** The torches' places on the far walls (the yard's tiles: along x at y 0, along y at x 0), clear of the doorway. */
  torches(f: Floor): { x: number; y: number; alongX: boolean }[] {
    const Y = f.yard!;
    const out: { x: number; y: number; alongX: boolean }[] = [];
    for (const x of [1.5, 4.5, 7.5, 10.5]) if (x < Y.door - 1 || x > Y.door + 4) out.push({ x: Y.x + x, y: Y.y, alongX: true });
    // (its own gate, YARD_GATE: a torch either side of the doorway, three quarters of a tile out from each end, as the art's pictures have them)
    if (YARD_GATE.on) for (const x of [Y.door - 0.75, Y.door + 3.75]) if (!out.some((q) => q.alongX && Math.abs(q.x - Y.x - x) < 1.5)) out.push({ x: Y.x + x, y: Y.y, alongX: true });
    for (const y of [3.5, 7.5, 11.5]) out.push({ x: Y.x, y: Y.y + y, alongX: false });
    return out;
  }

  /** A torch's picture this moment. */
  torch(alongX: boolean, t: number): Sprite {
    const p = this.A().pieces.find((q) => q.name === "the yard's torch")!;
    const list = alongX ? p.left! : p.right!;
    return list[Math.floor(t * 8) % list.length];
  }

  /** Where a torch's light falls (screen), and its pool. */
  torchLight(cam: Cam, x: number, y: number): { x: number; y: number } {
    return { x: wx(cam, x, y), y: wyFlat(cam, x, y) - TORCH_UP + 10 };
  }

  /** The flat puddles that lie on the yard's floor: picture and where (screen), for drawing with what lies on the floor. */
  puddles(f: Floor, cam: Cam): { s: Sprite; x: number; y: number }[] {
    const Y = f.yard!;
    return PUDDLES.map(([n, x, y]) => ({ s: this.A().pieces.find((p) => p.name === n)!.frames![0], x: Math.round(wx(cam, Y.x + x, Y.y + y)), y: Math.round(wyFlat(cam, Y.x + x, Y.y + y)) }));
  }

  /** Is a piece of this name the yard's own (drawn here), or its foot (drawn by nobody)? */
  owns(name: string | undefined): 'piece' | 'foot' | null {
    if (name === YARD_FOOT) return 'foot';
    return name !== undefined && name in BOXES ? 'piece' : null;
  }

  /**
   * A BIG PIECE AS STRIPS: its picture cut into strips a half tile wide, each with its depth in the order of what stands (the
   * nearer edge of its box on the floor in that strip's column), and the alpha it is seen with (seen through while `heroBehind`).
   */
  bigStands(name: string, x: number, y: number, cam: Cam, alpha: number): YardStand[] {
    const p = this.A().pieces.find((q) => q.name === name);
    const s = p?.frames?.[0];
    const box = BOXES[name];
    if (!s || !box) return [];
    const sx = Math.round(wx(cam, x, y));
    const sy = Math.round(wyFlat(cam, x, y));
    const out: YardStand[] = [];
    for (const st of this.stripsOf(s)) {
      // (the strip's column in the world: the line x - y = c through its middle)
      const c = st.u / 16 + (x - y);
      const lo = box.x0 + x - (box.y1 + y);
      const hi = box.x1 + x - (box.y0 + y);
      const cc = Math.max(lo, Math.min(hi, c));
      // (the nearest point of the box on that line: as far toward +y as it goes)
      const yy = Math.min(box.y1 + y, box.x1 + x - cc);
      out.push({ d: 2 * yy + cc, s: st.s, x: sx, y: sy, alpha });
    }
    return out;
  }

  /** Is the hero behind a big piece (not beyond its near edges), so that it is seen through where it covers him? */
  behind(name: string, x: number, y: number, hx: number, hy: number): boolean {
    const b = BOXES[name];
    return !!b && hx < x + b.x1 && hy < y + b.y1;
  }

  private stripsOf(s: Sprite): { s: Sprite; u: number }[] {
    let list = this.strips.get(s);
    if (list) return list;
    list = [];
    const d = s.density ?? 1;
    const step = 8;
    for (let x0 = 0; x0 < s.w; x0 += step) {
      const w = Math.min(step, s.w - x0);
      const c = document.createElement('canvas');
      c.width = Math.round(w * d);
      c.height = s.img.height;
      const q = c.getContext('2d') as CanvasRenderingContext2D;
      q.drawImage(s.img, Math.round(x0 * d), 0, c.width, c.height, 0, 0, c.width, c.height);
      list.push({ s: { img: c, w, h: s.h, ax: s.ax - x0, ay: s.ay, density: d }, u: x0 + w / 2 - s.ax });
    }
    this.strips.set(s, list);
    return list;
  }
}
