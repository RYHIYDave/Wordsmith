// Scarves and feathers that really move.
//
// A figure's frames are painted once, so anything painted INTO them can only repeat. What flies
// from a figure (the warrior's scarf, the feather in the ranger's cap, the end of the mage's
// scarf) is therefore not in the frames at all: each frame only says where such a thing is fixed
// (`Sprite.tails`), and this file hangs a little chain of points from that spot and moves it every
// frame. It trails behind the hero when they run, swings on past them when they stop, whips round
// when they turn or strike, ripples in the wind when they stand, and never repeats.
//
// A chain lives in the WORLD as it is laid out on the screen (game pixels, before the camera), so
// it has real momentum: its fixed end goes wherever the figure takes it and the rest follows. It is
// drawn the way the kit paints cloth: flat tones, light along its upper-left edge, shade along its
// lower-right, and the dark seam of the style round it.

/** How one kind of tail behaves and looks. Lengths are in game pixels; widths in picture pixels (two to a game pixel). */
export interface TailDef {
  /** Points in the chain after the fixed one, and the distance between neighbours. */
  n: number;
  seg: number;
  /** Thickness at the fixed end and at the free end, and how much thicker it is in the middle (a feather's vane). */
  w0: number;
  w1: number;
  belly?: number;
  /** Dark, middle and light tone. */
  dark: string;
  mid: string;
  light: string;
  /**
   * The shape it holds in still air, for a figure facing screen-right: one step per point, in game
   * pixels (it is scaled to `seg`). A feather's steps sweep up and back. Cloth has none: it hangs.
   */
  rest?: ReadonlyArray<readonly [number, number]>;
  /** How firmly it springs back to that shape: 0 = cloth, 1 = a stiff quill. */
  stiff?: number;
  /** How hard it is pulled down, and how hard the standing wind blows it back, in game pixels a second, squared. */
  gravity: number;
  wind: number;
  /** How big the ripple is that the wind sends down it (the same units), and how many times a second it comes. */
  flutter: number;
  rate: number;
  /**
   * How far on its way round the ripple is at the free end, against the fixed one (radians): 5.6
   * if not given, less than one whole wave, so that the tail bends; more than two pi puts an S in
   * it that travels down it. (The heroes reimagined, art/reimagined.ts: their switches are off.)
   */
  wave?: number;
  /** The ripple pushes across the tail where it lies, not only down the screen: it snakes as cloth in the wind does, whichever way it streams. Down the screen if not said. */
  across?: boolean;
  /** How quickly the air stops it: the share of its speed it loses in a second (0 = never stops, 20 = at once). */
  drag: number;
  /** A light it carries part of the way along (a glowing feather), or none. Radius in game pixels. */
  glow?: { color: string; r: number; a: number; at?: number };
  /** The last pixels of the free end in another colour (a fringe), or none. */
  tip?: string;
}

/** Where a tail is fixed on a frame. */
export interface TailRoot {
  /** Which TailDef. */
  id: string;
  /** In game pixels from the picture's top left corner. */
  x: number;
  y: number;
  /** Drawn over the figure (true) or behind it (false). */
  over: boolean;
  /**
   * A blast of air from the way the figure faces, in this frame (the mage's own beam: the owner,
   * 6 Oct 2026, "the mage fires his beam and it blows his cloak back"): this many times the
   * standing wind on top of it, and a ripple that much bigger. Absent or 0 = none.
   */
  blast?: number;
}

interface Chain {
  /** Positions now and one step ago, as x, y pairs, in world pixels. */
  p: Float32Array;
  q: Float32Array;
  over: boolean;
  def: TailDef;
  /** Where its fixed end was when the chain was last moved. */
  rx: number;
  ry: number;
}

export interface TailLight {
  x: number;
  y: number;
  r: number;
  color: string;
  a: number;
}

const SUB = 1 / 120;
const INK = [14, 12, 36];
/** The patch the tails are painted on, in picture pixels: this far to each side of the figure's feet, and above and below them. */
const HW = 96;
const UP = 112;
const DOWN = 40;
const PW = HW * 2;
const PH = UP + DOWN;

function rgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/** The tails of one figure. */
export class Tails {
  private chains = new Map<string, Chain>();
  private clock = 0;
  private left = 0;
  /** Where the figure's feet were when last stepped. */
  private ox = 0;
  private oy = 0;
  private placed = false;
  private cv: HTMLCanvasElement | null = null;
  private cg: CanvasRenderingContext2D | null = null;
  private buf: ImageData | null = null;
  private mask = new Uint8Array(PW * PH);

  constructor(private defs: Readonly<Record<string, TailDef>>) {}

  /** Forget where everything was (a new figure). */
  reset(): void {
    this.chains.clear();
    this.placed = false;
  }

  /** The chains as they are: for tests. Each is x, y pairs in pixels from the figure's feet. */
  shapes(): { id: string; over: boolean; points: number[] }[] {
    const out: { id: string; over: boolean; points: number[] }[] = [];
    for (const [id, c] of this.chains) {
      const points: number[] = [];
      for (let i = 0; i <= c.def.n; i++) points.push(c.p[i * 2] - this.ox, c.p[i * 2 + 1] - this.oy);
      out.push({ id, over: c.over, points });
    }
    return out;
  }

  private seed(c: Chain, rx: number, ry: number, facing: number): void {
    const d = c.def;
    let x = rx;
    let y = ry;
    for (let i = 0; i <= d.n; i++) {
      if (i > 0) {
        const s = this.restStep(d, i, facing);
        x += s[0];
        y += s[1];
      }
      c.p[i * 2] = c.q[i * 2] = x;
      c.p[i * 2 + 1] = c.q[i * 2 + 1] = y;
    }
  }

  /** The i-th step of a tail's shape in still air (cloth with no shape of its own hangs back and down). */
  private restStep(d: TailDef, i: number, facing: number): [number, number] {
    const r = d.rest && d.rest.length ? d.rest[Math.min(i - 1, d.rest.length - 1)] : ([-0.8, 0.6] as const);
    const len = Math.hypot(r[0], r[1]) || 1;
    return [(r[0] / len) * d.seg * facing, (r[1] / len) * d.seg];
  }

  /**
   * Move every tail on by `dt` seconds. `roots` is where the frame being shown fixes them (already
   * mirrored if the figure faces left) and (ax, ay) is that frame's anchor, in the same units.
   * `facing` is +1 for a figure facing screen-right and -1 for screen-left. (ox, oy) is where the
   * figure's feet are in the world as it is laid out on the screen, in game pixels: a figure that
   * does not move about (on a card) can pass 0, 0.
   */
  step(dt: number, roots: ReadonlyArray<TailRoot> | undefined, ax: number, ay: number, facing: number, ox: number, oy: number): void {
    const list = roots ?? [];
    // a figure that has been moved further at once than anything runs or rolls (a warp, a new
    // level) takes its tails with it
    if (!this.placed || Math.hypot(ox - this.ox, oy - this.oy) > 10 + 420 * Math.min(Math.max(dt, 0), 0.1)) {
      const dx = ox - this.ox;
      const dy = oy - this.oy;
      for (const c of this.chains.values()) {
        c.rx += dx;
        c.ry += dy;
        for (let i = 0; i <= c.def.n; i++) {
          c.p[i * 2] += dx;
          c.q[i * 2] += dx;
          c.p[i * 2 + 1] += dy;
          c.q[i * 2 + 1] += dy;
        }
      }
      this.placed = true;
    }
    this.ox = ox;
    this.oy = oy;
    // a tail that has gone from the figure is dropped; a new one starts in its still-air shape
    for (const id of [...this.chains.keys()]) if (!list.some((r) => r.id === id)) this.chains.delete(id);
    for (const r of list) {
      const def = this.defs[r.id];
      if (!def) continue;
      let c = this.chains.get(r.id);
      if (!c) {
        c = { p: new Float32Array((def.n + 1) * 2), q: new Float32Array((def.n + 1) * 2), over: r.over, def, rx: ox + r.x - ax, ry: oy + r.y - ay };
        this.seed(c, c.rx, c.ry, facing);
        this.chains.set(r.id, c);
      }
      c.over = r.over;
    }
    this.left += Math.min(Math.max(dt, 0), 0.1);
    const steps = Math.floor(this.left / SUB);
    for (let j = 1; j <= steps; j++) {
      this.left -= SUB;
      this.clock += SUB;
      let k = 0;
      for (const r of list) {
        const c = this.chains.get(r.id);
        if (!c) continue;
        // (the fixed end is carried smoothly from where it was to where it is now: a tail that is
        // jerked along once a frame is thrown about by every jerk)
        const tx = ox + r.x - ax;
        const ty = oy + r.y - ay;
        this.sub(c, c.rx + ((tx - c.rx) * j) / steps, c.ry + ((ty - c.ry) * j) / steps, facing, k++, r.blast ?? 0);
        if (j === steps) {
          c.rx = tx;
          c.ry = ty;
        }
      }
    }
  }

  private sub(c: Chain, rx: number, ry: number, facing: number, k: number, blast = 0): void {
    const d = c.def;
    const p = c.p;
    const q = c.q;
    const keep = Math.max(0, 1 - d.drag * SUB);
    // the fixed end goes where the figure puts it
    q[0] = p[0];
    q[1] = p[1];
    p[0] = rx;
    p[1] = ry;
    for (let i = 1; i <= d.n; i++) {
      const t = i / d.n;
      const x = p[i * 2];
      const y = p[i * 2 + 1];
      // what it was doing, a little less of it: the air slows it
      let nx = x + (x - q[i * 2]) * keep;
      let ny = y + (y - q[i * 2 + 1]) * keep;
      // the standing wind blows it back from the way the figure faces, gravity pulls it down, and a
      // ripple runs along it from the fixed end to the free one (each tail in its own time)
      // (in a blast the ripple is bigger and comes three times as fast)
      const ripple = Math.sin(this.clock * d.rate * (blast > 0 ? 3 : 1) * Math.PI * 2 - t * (d.wave ?? 5.6) + k * 2.1) * d.flutter * (0.3 + 0.7 * t) * (1 + blast * 1.6);
      const gust = 1 + 0.25 * Math.sin(this.clock * 1.7 + k) + blast * 2.4;
      nx += -facing * d.wind * gust * SUB * SUB;
      if (d.across) {
        // (square to the tail where it lies: from the point before this one to this one)
        const ax = x - p[(i - 1) * 2];
        const ay = y - p[(i - 1) * 2 + 1];
        const al = Math.hypot(ax, ay) || 1;
        nx += ((-ay / al) * ripple) * SUB * SUB;
        ny += (d.gravity + (ax / al) * ripple) * SUB * SUB;
      } else ny += (d.gravity + ripple) * SUB * SUB;
      q[i * 2] = x;
      q[i * 2 + 1] = y;
      p[i * 2] = nx;
      p[i * 2 + 1] = ny;
    }
    // a quill springs back toward the shape it grew in
    const stiff = d.stiff ?? 0;
    if (stiff > 0) {
      let tx = rx;
      let ty = ry;
      for (let i = 1; i <= d.n; i++) {
        const s = this.restStep(d, i, facing);
        tx += s[0];
        ty += s[1];
        const pull = stiff * (1 - 0.6 * (i / d.n)) * 0.2;
        p[i * 2] += (tx - p[i * 2]) * pull;
        p[i * 2 + 1] += (ty - p[i * 2 + 1]) * pull;
      }
    }
    // and it does not stretch: neighbours are pulled back to their distance, each giving half
    // the way (the fixed end gives nothing), a few times over. That keeps the chain's momentum
    // honest, which simply dragging each point after the one before does not.
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 1; i <= d.n; i++) {
        const a = (i - 1) * 2;
        const b = i * 2;
        const dx = p[b] - p[a];
        const dy = p[b + 1] - p[a + 1];
        const len = Math.hypot(dx, dy) || 0.0001;
        const off = (len - d.seg) / len;
        if (i === 1) {
          p[b] -= dx * off;
          p[b + 1] -= dy * off;
        } else {
          p[a] += dx * off * 0.5;
          p[a + 1] += dy * off * 0.5;
          p[b] -= dx * off * 0.5;
          p[b + 1] -= dy * off * 0.5;
        }
      }
    }
    // (cloth gives a little and no more: a link that a hard pull has left too long is drawn in)
    const most = d.seg * 1.1;
    for (let i = 1; i <= d.n; i++) {
      const a = (i - 1) * 2;
      const b = i * 2;
      const dx = p[b] - p[a];
      const dy = p[b + 1] - p[a + 1];
      const len = Math.hypot(dx, dy);
      if (len > most) {
        p[b] = p[a] + (dx / len) * most;
        p[b + 1] = p[a + 1] + (dy / len) * most;
      }
    }
  }

  /** Where each tail's light is now, in game pixels from the figure's feet. */
  lights(): TailLight[] {
    const out: TailLight[] = [];
    for (const c of this.chains.values()) {
      const g = c.def.glow;
      if (!g) continue;
      const at = (g.at ?? 0.6) * c.def.n;
      const i = Math.min(c.def.n - 1, Math.floor(at));
      const u = at - i;
      out.push({ x: c.p[i * 2] + (c.p[i * 2 + 2] - c.p[i * 2]) * u - this.ox, y: c.p[i * 2 + 1] + (c.p[i * 2 + 3] - c.p[i * 2 + 1]) * u - this.oy, r: g.r, color: g.color, a: g.a });
    }
    return out;
  }

  /**
   * Paint the tails that go behind the figure (`over` false) or in front of it (`over` true) into
   * an RGBA buffer of picture pixels, PW x PH, whose pixel (HW, UP) is the figure's feet. Returns
   * the box that was painted, or null if there was nothing to paint. (No canvas: the tests use it.)
   */
  paint(out: Uint8ClampedArray, over: boolean): { x0: number; y0: number; x1: number; y1: number } | null {
    const mask = this.mask;
    let x0 = PW;
    let y0 = PH;
    let x1 = -1;
    let y1 = -1;
    const tones: [number, number, number][] = [];
    const tips: ([number, number, number] | null)[] = [];
    let k = 0;
    for (const c of this.chains.values()) {
      if (c.over !== over) continue;
      if (k === 0) mask.fill(0);
      k++;
      const d = c.def;
      tones.push(rgb(d.dark), rgb(d.mid), rgb(d.light));
      tips.push(d.tip ? rgb(d.tip) : null);
      // discs strung along the chain, half a picture pixel apart
      for (let i = 0; i < d.n; i++) {
        const ax = (c.p[i * 2] - this.ox) * 2 + HW;
        const ay = (c.p[i * 2 + 1] - this.oy) * 2 + UP;
        const bx = (c.p[i * 2 + 2] - this.ox) * 2 + HW;
        const by = (c.p[i * 2 + 3] - this.oy) * 2 + UP;
        const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) * 2));
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const t = (i + u) / d.n;
          const r = (d.w0 + (d.w1 - d.w0) * t + (d.belly ?? 0) * Math.sin(Math.PI * t)) / 2;
          const cx = ax + (bx - ax) * u;
          const cy = ay + (by - ay) * u;
          for (let py = Math.floor(cy - r); py <= Math.ceil(cy + r); py++) {
            if (py < 2 || py >= PH - 2) continue;
            for (let px = Math.floor(cx - r); px <= Math.ceil(cx + r); px++) {
              if (px < 2 || px >= PW - 2) continue;
              const ex = px + 0.5 - cx;
              const ey = py + 0.5 - cy;
              if (ex * ex + ey * ey > r * r) continue;
              // (the last stretch of a fringed tail is marked apart: 100 + its number)
              mask[py * PW + px] = d.tip && t > 0.9 ? 100 + k : k;
              if (px < x0) x0 = px;
              if (px > x1) x1 = px;
              if (py < y0) y0 = py;
              if (py > y1) y1 = py;
            }
          }
        }
      }
    }
    if (k === 0 || x1 < 0) return null;
    x0 -= 1;
    y0 -= 1;
    x1 += 1;
    y1 += 1;
    const has = (i: number): boolean => mask[i] !== 0;
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const i = py * PW + px;
        const o = i * 4;
        const m = mask[i];
        if (m === 0) {
          // the seam: an empty pixel beside a filled one
          if (has(i - 1) || has(i + 1) || has(i - PW) || has(i + PW)) {
            out[o] = INK[0];
            out[o + 1] = INK[1];
            out[o + 2] = INK[2];
            out[o + 3] = 255;
          } else out[o + 3] = 0;
          continue;
        }
        const tipped = m > 100;
        const id = tipped ? m - 100 : m;
        const tip = tips[id - 1];
        if (tipped && tip && (px + py) % 2 === 0) {
          out[o] = tip[0];
          out[o + 1] = tip[1];
          out[o + 2] = tip[2];
          out[o + 3] = 255;
          continue;
        }
        // lit from the upper left as the kit lights cloth: how many diagonal steps to the edge on
        // the lit side and on the shaded side decide the tone (two pixels of each, when it is thick enough)
        const a = !has(i - PW - 1) || (!has(i - 1) && !has(i - PW)) ? 1 : !has(i - 2 * PW - 2) || (!has(i - PW - 2) && !has(i - 2 * PW - 1)) ? 2 : 3;
        const b = !has(i + PW + 1) || (!has(i + 1) && !has(i + PW)) ? 1 : !has(i + 2 * PW + 2) || (!has(i + PW + 2) && !has(i + 2 * PW + 1)) ? 2 : 3;
        const tone = b <= 1 && a > 1 ? 0 : a <= 1 ? 2 : b <= 2 && a > 2 ? 0 : a <= 2 && b > 2 ? 2 : 1;
        const c = tones[(id - 1) * 3 + tone];
        out[o] = c[0];
        out[o + 1] = c[1];
        out[o + 2] = c[2];
        out[o + 3] = 255;
      }
    }
    return { x0, y0, x1, y1 };
  }

  /**
   * Draw the tails that go behind the figure (`over` false) or in front of it (`over` true), with
   * the figure's feet at (x, y) and each game pixel `scale` units wide.
   */
  draw(g: CanvasRenderingContext2D, x: number, y: number, over: boolean, scale = 1): void {
    let any = false;
    for (const c of this.chains.values()) if (c.over === over) any = true;
    if (!any) return;
    if (!this.cv) {
      this.cv = document.createElement('canvas');
      this.cv.width = PW;
      this.cv.height = PH;
      this.cg = this.cv.getContext('2d');
      this.buf = (this.cg as CanvasRenderingContext2D).createImageData(PW, PH);
    }
    const buf = this.buf as ImageData;
    const box = this.paint(buf.data, over);
    if (!box) return;
    const w = box.x1 - box.x0 + 1;
    const h = box.y1 - box.y0 + 1;
    const cg = this.cg as CanvasRenderingContext2D;
    cg.putImageData(buf, 0, 0, box.x0, box.y0, w, h);
    g.drawImage(this.cv as HTMLCanvasElement, box.x0, box.y0, w, h, x + ((box.x0 - HW) / 2) * scale, y + ((box.y0 - UP) / 2) * scale, (w / 2) * scale, (h / 2) * scale);
  }
}

export const TAIL_PATCH = { w: PW, h: PH, hw: HW, up: UP };
