// Dev only: THE QUEEN'S FILM AND HER HALL (art/queen.ts, art/queen_moves.ts, art/queen_fx.ts), drawn by
// src/dev/preview_queen.ts. A stand-in Mirror Hall at the scale of a boss arena (an ellipse 20 tiles along and 17
// across): its floor dark polished stone (floor 18's own ground is another helper's), the hall's mirrors along both
// long sides, her mirror at the hall's end; her and the knight in it, as the game would lay them (its picture's floor
// point on theirs, from in front or behind, turned over for the other two ways). Nothing of the game imports it.
import type { Sprite } from '../engine/px';
import type { AnimSet } from '../art/actor_types';
import { toSprite } from '../art/kit';
import type { Painted } from '../art/kit';
import { canvasOf, deathOfMob, paintMob, skeletonAt } from '../art/new_mobs3';
import { QN_COMB, QN_DIES, QN_IN, QN_OUT, QN_PACE, QN_REFLECT, QN_SHATTER, QUEEN } from '../art/queen_moves';
import { ARENA, CLOUD_CANVAS, CLOUD_FX, EMERGE_CANVAS, EMERGE_FX, HALL_MIRRORS, HALL_MIRROR_CANVAS, SHATTER_CANVAS, SHATTER_FX, TALK_CANVAS, TALK_FX, cloudPainted, emergePainted, hallMirrorPainted, shatterPainted, talkingMirrorPainted } from '../art/queen_fx';
import type { TalkMode } from '../art/queen_fx';
import { TILE3 } from '../art/new_mobs3';
import { GRID } from '../art/skeleton';
import type { GameView } from '../art/skin';

/** The four ways a figure is shown: its picture from in front or behind, turned over or not. Along the floor's grid: */
export type Way = 'dr' | 'dl' | 'ur' | 'ul';
const WAY: Record<Way, readonly [number, number]> = { dr: [1, 0], dl: [0, -1], ur: [0, 1], ul: [-1, 0] };
const VIEW: Record<Way, GameView> = { dr: 'front', dl: 'front', ur: 'back', ul: 'back' };
const FLIP: Record<Way, boolean> = { dr: false, dl: true, ur: false, ul: true };
/** The way from one point of the floor to another, as near as the four ways go. */
export function wayTo(from: readonly [number, number], to: readonly [number, number]): Way {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  // (as the eye sees it: across, and down)
  const sx = dx + dy;
  const sy = dx - dy;
  return sy >= 0 ? (sx >= 0 ? 'dr' : 'dl') : sx >= 0 ? 'ur' : 'ul';
}
export const ahead = (w: Way, d: number): [number, number] => [WAY[w][0] * d, WAY[w][1] * d];

/** One thing in the hall at a moment of the film. */
export type Thing =
  | { k: 'queen'; move: string; t: number; at: readonly [number, number]; way: Way }
  | { k: 'knight'; at: readonly [number, number]; way: Way; i: number; walk?: boolean }
  | { k: 'cloud'; t: number; at: readonly [number, number] }
  | { k: 'emerge'; t: number; at: readonly [number, number] };
/** A frame of the film. */
export interface Scene {
  /** Where the eye looks (the floor, her own lengths) and how big (page pixels to a picture pixel). */
  look: readonly [number, number];
  zoom: number;
  things: Thing[];
  /** Shatter's moment (seconds into her move), if it is on; how many of the hall's mirrors are awake. */
  shatter?: number;
  awake?: number;
  /** Her mirror at the hall's end: what it does, and how far into it. */
  talk: { mode: TalkMode; t: number };
  title: string;
  tag: string;
  say: string;
  slow?: boolean;
}

const G = GRID;
/** A point of the hall as the picture has it (picture pixels from the hall's middle). */
const pic = (x: number, y: number, z = 0): [number, number] => [G * (x + y), G * 0.5 * (x - y) - z];
/** Where her mirror stands at the hall's end, and the hall's edge. */
export const TALK_AT: readonly [number, number] = [-ARENA.a + 0.9 * TILE3, 0];

const caches = new Map<string, Sprite>();
const spriteOf = (key: string, make: () => Painted, ax: number, ay: number): Sprite => {
  let s = caches.get(key);
  if (!s) {
    s = toSprite(make(), null, ax, ay);
    if (caches.size > 600) caches.clear();
    caches.set(key, s);
  }
  return s;
};

export class Hall {
  readonly g: CanvasRenderingContext2D;
  readonly W: number;
  readonly H: number;
  readonly top = 74;
  readonly foot = 96;
  private floorKey = '';
  private floorCanvas: HTMLCanvasElement | null = null;
  constructor(readonly cv: HTMLCanvasElement, private hero: { front: AnimSet; back: AnimSet }) {
    this.g = cv.getContext('2d') as CanvasRenderingContext2D;
    this.W = cv.width;
    this.H = cv.height;
  }
  /** Where a point of the hall is on the page. */
  at(sc: Scene, x: number, y: number, z = 0): [number, number] {
    const [cx, cy] = pic(sc.look[0], sc.look[1]);
    const [px, py] = pic(x, y, z);
    const midY = this.top + (this.H - this.top - this.foot) / 2;
    return [Math.round(this.W / 2 + (px - cx) * sc.zoom), Math.round(midY + (py - cy) * sc.zoom)];
  }
  /** THE FLOOR: dark polished stone in diamonds a tile each, a kerb of silver-grey round the hall, the dark beyond. */
  private floor(sc: Scene): void {
    const key = `${sc.look.join(',')}:${sc.zoom}`;
    const k = sc.zoom;
    if (key !== this.floorKey || !this.floorCanvas) {
      const w = Math.ceil(this.W / k) + 2;
      const h = Math.ceil(this.H / k) + 2;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const x = c.getContext('2d') as CanvasRenderingContext2D;
      const img = x.createImageData(w, h);
      const [cx, cy] = pic(sc.look[0], sc.look[1]);
      const midY = this.top + (this.H - this.top - this.foot) / 2;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          // (the picture pixel here, and the floor under it)
          const X = cx + (i + 0.5 - this.W / 2 / k);
          const Y = cy + (j + 0.5 - midY / k);
          const fx = (X / G + 2 * Y / G) / 2;
          const fy = (X / G - 2 * Y / G) / 2;
          const e = (fx / ARENA.a) ** 2 + (fy / ARENA.b) ** 2;
          let col: [number, number, number];
          if (e > 1.06) {
            const d = Math.min(1, (e - 1.06) * 3);
            col = [Math.round(14 - 6 * d), Math.round(12 - 5 * d), Math.round(22 - 8 * d)];
          } else if (e > 1) col = (i + j) % 2 ? [72, 70, 92] : [58, 56, 76];
          else {
            const u = fx / TILE3;
            const v = fy / TILE3;
            const iu = Math.floor(u);
            const iv = Math.floor(v);
            const seam = u - iu < 0.03 || v - iv < 0.03;
            const dark = (iu + iv) % 2 === 0;
            const vein = Math.sin(fx * 0.21 + Math.sin(fy * 0.13) * 3 + iu * 1.7) > 0.965 ? 7 : 0;
            const sheen = ((X * 0.5 + Y + 4000) % 120) < 5 ? 6 : 0;
            // (a little light toward the middle of the hall, the edge in the dark)
            const lit = Math.round(10 * (1 - e));
            const base = seam ? [48, 46, 64] : dark ? [26, 23, 38] : [33, 30, 47];
            col = [base[0] + vein + sheen + lit, base[1] + vein + sheen + lit, base[2] + vein + sheen + lit + 3];
          }
          const n = (j * w + i) * 4;
          img.data[n] = col[0];
          img.data[n + 1] = col[1];
          img.data[n + 2] = col[2];
          img.data[n + 3] = 255;
        }
      }
      x.putImageData(img, 0, 0);
      this.floorCanvas = c;
      this.floorKey = key;
    }
    this.g.imageSmoothingEnabled = false;
    this.g.drawImage(this.floorCanvas, 0, 0, this.floorCanvas.width * k, this.floorCanvas.height * k);
  }
  /** A picture laid on the page with its floor point at a point of the hall, turned over or not. */
  private lay(sc: Scene, s: Sprite, x: number, y: number, flip = false): void {
    const [X, Y] = this.at(sc, x, y);
    const d = s.density ?? 1;
    const k = sc.zoom;
    const g = this.g;
    g.imageSmoothingEnabled = false;
    if (flip) {
      g.save();
      g.translate(X, 0);
      g.scale(-1, 1);
      g.drawImage(s.img, Math.round(-s.ax * d * k), Math.round(Y - s.ay * d * k), s.w * d * k, s.h * d * k);
      g.restore();
    } else g.drawImage(s.img, Math.round(X - s.ax * d * k), Math.round(Y - s.ay * d * k), s.w * d * k, s.h * d * k);
  }
  /** A soft shadow on the floor under a figure. */
  private shadow(sc: Scene, x: number, y: number, r: number): void {
    const [X, Y] = this.at(sc, x, y);
    const g = this.g;
    g.save();
    g.fillStyle = 'rgba(4,2,10,0.42)';
    g.beginPath();
    g.ellipse(X, Y, r * sc.zoom, r * 0.45 * sc.zoom, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  draw(sc: Scene): void {
    const g = this.g;
    g.fillStyle = '#07050a';
    g.fillRect(0, 0, this.W, this.H);
    this.floor(sc);
    const items: { depth: number; draw: () => void }[] = [];
    // THE HALL'S MIRRORS (each its own picture), and Shatter's floor and air
    HALL_MIRRORS.forEach((m, i) => {
      const awake = i < (sc.awake ?? 0);
      const t = sc.shatter ?? null;
      const key = `hall:${i}:${t === null ? 'still' : t.toFixed(3)}:${awake ? `a${Math.round(((sc.talk.t * 30) % 72))}` : ''}`;
      const s = spriteOf(key, () => hallMirrorPainted(i, t, awake), HALL_MIRROR_CANVAS.ax, HALL_MIRROR_CANVAS.ay);
      items.push({ depth: m.x - m.y, draw: () => this.lay(sc, s, m.x, m.y) });
    });
    // HER MIRROR at the hall's end
    {
      const { mode, t } = sc.talk;
      const s = spriteOf(`talk:${mode}:${t.toFixed(3)}`, () => talkingMirrorPainted(mode, t), TALK_CANVAS.ax, TALK_CANVAS.ay);
      items.push({ depth: TALK_AT[0] - TALK_AT[1], draw: () => this.lay(sc, s, TALK_AT[0], TALK_AT[1]) });
    }
    for (const th of sc.things) {
      if (th.k === 'queen') {
        const view = VIEW[th.way];
        const can = canvasOf(QUEEN);
        const s = spriteOf(`q:${th.move}:${th.t.toFixed(4)}:${view}`, () => (th.move === 'dying' ? deathOfMob(QUEEN, th.t / QUEEN.dieTime, view) : paintMob(QUEEN, th.move, th.t, view)), can.ax, can.ay);
        // (her shadow under her body, wherever her move has carried it in her picture; none while she is through the glass)
        const sk = skeletonAt(QUEEN, th.move, th.t);
        const [fx, fy] = WAY[th.way];
        const side: [number, number] = th.way === 'dr' ? [0, 1] : th.way === 'ur' ? [-1, 0] : th.way === 'dl' ? [-1, 0] : [0, 1];
        const under: [number, number] = [th.at[0] + fx * sk.pelvis[0] + side[0] * sk.pelvis[1], th.at[1] + fy * sk.pelvis[0] + side[1] * sk.pelvis[1]];
        const away = th.move === 'glassIn' ? th.t > QN_IN.strike[1] : th.move === 'glassOut' ? th.t < QN_OUT.strike[1] : false;
        items.push({ depth: th.at[0] - th.at[1], draw: () => {
          if (!away) this.shadow(sc, under[0], under[1], 16);
          this.lay(sc, s, th.at[0], th.at[1], FLIP[th.way]);
        } });
      } else if (th.k === 'knight') {
        const set = VIEW[th.way] === 'front' ? this.hero.front : this.hero.back;
        const list = th.walk ? set.walk : set.idle;
        const s = list[th.i % list.length];
        items.push({ depth: th.at[0] - th.at[1], draw: () => {
          this.shadow(sc, th.at[0], th.at[1], 12);
          this.lay(sc, s, th.at[0], th.at[1], FLIP[th.way]);
        } });
      } else if (th.k === 'cloud') {
        const s = spriteOf(`cloud:${th.t.toFixed(3)}`, () => cloudPainted(th.t), CLOUD_CANVAS.ax, CLOUD_CANVAS.ay);
        // (a cloud hangs over the floor: laid after what stands on its near side's middle)
        // (low over the floor, laid under every figure: it never hides the hero)
        items.push({ depth: -1e6, draw: () => this.lay(sc, s, th.at[0], th.at[1]) });
      } else if (th.k === 'emerge') {
        const s = spriteOf(`emerge:${th.t.toFixed(3)}`, () => emergePainted(th.t), EMERGE_CANVAS.ax, EMERGE_CANVAS.ay);
        items.push({ depth: th.at[0] - th.at[1] - 1, draw: () => this.lay(sc, s, th.at[0], th.at[1]) });
      }
    }
    if (sc.shatter !== undefined) {
      const t = sc.shatter;
      const s = spriteOf(`shf:${t.toFixed(3)}`, () => shatterPainted(t, 'floor'), SHATTER_CANVAS.ax, SHATTER_CANVAS.ay);
      this.lay(sc, s, 0, 0);
    }
    // (Shatter's flying glass laid among the figures by how near the eye it is: between each figure and the next)
    if (sc.shatter !== undefined) {
      const t = sc.shatter;
      const cuts = [-Infinity, ...sc.things.filter((th) => th.k === 'queen' || th.k === 'knight').map((th) => (th as { at: readonly [number, number] }).at[0] - (th as { at: readonly [number, number] }).at[1]).sort((a, b) => a - b), Infinity];
      for (let i = 0; i + 1 < cuts.length; i++) {
        const w: [number, number] = [cuts[i], cuts[i + 1]];
        const s = spriteOf(`sha:${t.toFixed(3)}:${w.join(',')}`, () => shatterPainted(t, 'air', w), SHATTER_CANVAS.ax, SHATTER_CANVAS.ay);
        items.push({ depth: Number.isFinite(w[1]) ? w[1] - 1e-3 : 1e9, draw: () => this.lay(sc, s, 0, 0) });
      }
    }
    items.sort((a, b) => a.depth - b.depth);
    for (const it of items) it.draw();
    // THE CAPTIONS: what it is above, what it does below
    g.fillStyle = '#0b0812';
    g.fillRect(0, 0, this.W, this.top);
    g.fillRect(0, this.H - this.foot, this.W, this.foot);
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.font = 'bold 34px DejaVu Sans, sans-serif';
    g.fillStyle = '#d9d3f3';
    g.fillText(sc.title, 22, this.top / 2 + 2);
    if (sc.tag) {
      g.font = 'bold 22px DejaVu Sans, sans-serif';
      const w = g.measureText(sc.tag).width + 26;
      g.fillStyle = sc.slow ? '#5a2440' : '#2d1d45';
      g.fillRect(this.W - 22 - w, 16, w, this.top - 32);
      g.fillStyle = sc.slow ? '#ffb070' : '#bfb6e6';
      g.textAlign = 'center';
      g.fillText(sc.tag, this.W - 22 - w / 2, this.top / 2 + 1);
    }
    g.textAlign = 'center';
    g.font = '24px DejaVu Sans, sans-serif';
    g.fillStyle = '#e6e2f0';
    const words = sc.say.split(' ');
    const lines: string[] = [''];
    for (const w of words) {
      const tryL = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${w}` : w;
      if (g.measureText(tryL).width > this.W - 60) lines.push(w);
      else lines[lines.length - 1] = tryL;
    }
    lines.slice(0, 2).forEach((l, i) => g.fillText(l, this.W / 2, this.H - this.foot + (lines.length > 1 ? 30 + i * 34 : this.foot / 2)));
  }
}

// =============================================================================================
// THE FILM: every move of hers from in front and from behind, at the scale of the arena with the knight in it; each
// strike again at half speed

const FPS = 30;
const T = TILE3;
export function filmScript(): Scene[] {
  const out: Scene[] = [];
  let talkT = 0;
  const talk = (mode: TalkMode = 'speaking'): { mode: TalkMode; t: number } => ({ mode, t: talkT });
  const push = (sc: Omit<Scene, 'talk'> & { talk?: { mode: TalkMode; t: number } }): void => {
    out.push({ talk: talk(), ...sc } as Scene);
    talkT += 1 / FPS;
  };
  let kn = 0;
  const knight = (at: readonly [number, number], way: Way, walk = false): Thing => ({ k: 'knight', at, way, i: Math.floor(kn++ / 3), walk });
  /** A move of hers played through at the game's speed (or `rate` of it), from `t0` to `t1`, with whatever else `more` adds. */
  const play = (base: Omit<Scene, 'things' | 'talk'>, q: { move: string; at: readonly [number, number]; way: Way }, t0: number, t1: number, more: (t: number) => Thing[] = () => [], rate = 1, extra: (t: number) => Partial<Scene> = () => ({})): void => {
    const n = Math.round(((t1 - t0) * FPS) / rate);
    for (let i = 0; i <= n; i++) {
      const t = t0 + (i * rate) / FPS;
      push({ ...base, things: [{ k: 'queen', move: q.move, t, at: q.at, way: q.way }, ...more(t)], ...extra(t) });
    }
  };
  const hold = (sc: Omit<Scene, 'talk'>, n: number): void => {
    for (let i = 0; i < n; i++) push(sc);
  };

  // --- TITLE: her in the hall, her mirror speaking to her ---
  {
    const at: [number, number] = [-3.5 * T, 0];
    const kAt: [number, number] = [1.5 * T, -1.5 * T];
    for (let i = 0; i < 66; i++) push({ look: [-2.5 * T, 0], zoom: 1.35, things: [{ k: 'queen', move: 'stand', t: (i / FPS) % 2.8, at, way: 'dr' }, knight(kAt, wayTo(kAt, at))], title: 'The Queen', tag: 'floor 18', say: 'The Mirror Hall. Her mirror at the hall\'s end talks to her the whole fight.' });
  }
  // --- HER STAND ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const at: [number, number] = [0, 0];
    const kAt: [number, number] = way === 'dr' ? [2.6 * T, 0] : [-2.6 * T, 0];
    play({ look: [0.6 * T * (way === 'dr' ? 1 : -1), 0], zoom: 3.2, title: 'Her stand', tag, say: 'Cold and still, but breathing. Her comb low at her side.' }, { move: 'stand', at, way }, 0, 2.8, () => [knight(kAt, way === 'dr' ? 'ul' : 'dr')]);
  }
  // --- THE GLIDE: slow and stately ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const sg = way === 'dr' ? 1 : -1;
    const from: [number, number] = [-2.6 * T * sg, 0];
    const n = 80;
    const kAt: [number, number] = [3.6 * T * sg, 0.4 * T];
    for (let i = 0; i <= n; i++) {
      const t = i / FPS;
      const at: [number, number] = [from[0] + sg * QN_PACE * T * t, 0];
      push({ look: [0.4 * T * sg, 0], zoom: 2.4, things: [{ k: 'queen', move: 'walk', t: t % (16 / 12), at, way }, knight(kAt, way === 'dr' ? 'ul' : 'dr')], title: 'The glide', tag, say: `Slow and stately: ${QN_PACE} tiles a second (you walk 2.5). What is sudden in her is the glass.` });
    }
  }
  // --- THE COMB ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const sg = way === 'dr' ? 1 : -1;
    const at: [number, number] = [-1.4 * T * sg, 0];
    const kAt: [number, number] = [1.6 * T * sg, 0];
    const strikeAt: [number, number] = [at[0] + ahead(way, 2.35 * T)[0], at[1]];
    const end: [number, number] = [at[0] + ahead(way, QN_COMB.lunge)[0], at[1]];
    const base = { look: [0.1 * T * sg, 0] as [number, number], zoom: 2.6, title: 'The comb', tag, say: 'A big, held wind-up, its teeth glinting; then a stab in two frames, lunging a tile and a half, the teeth more than two tiles out; a cloud of poison where it strikes.' };
    const cloud = (t: number): Thing[] => (t >= QN_COMB.hit ? [{ k: 'cloud', t: t - QN_COMB.hit, at: strikeAt }] : []);
    play(base, { move: 'attack', at, way }, 0, QN_COMB.long, (t) => [knight(kAt, way === 'dr' ? 'ul' : 'dr'), ...cloud(t)]);
    // (where she has come to, as the cloud thins)
    for (let i = 1; i <= 20; i++) push({ ...base, things: [{ k: 'queen', move: 'stand', t: i / FPS, at: end, way }, knight(kAt, way === 'dr' ? 'ul' : 'dr'), ...cloud(QN_COMB.long + i / FPS)] });
    play({ ...base, tag: `${tag}, half speed`, slow: true, say: 'The stab again at half speed: the wind-up held, the strike two frames, smeared.' }, { move: 'attack', at, way }, QN_COMB.strike[0] - 0.3, QN_COMB.strike[1] + 0.4, (t) => [knight(kAt, way === 'dr' ? 'ul' : 'dr'), ...cloud(t)], 0.5);
  }
  // --- LOOKING GLASS: into one mirror, out of another behind you ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const sg = way === 'dr' ? 1 : -1;
    const A: [number, number] = [-2.2 * T * sg, -0.6 * T * sg];
    const K: [number, number] = [0.8 * T * sg, -0.2 * T * sg];
    // (out behind you: across from where she went in, the knight between, she facing his back)
    const B: [number, number] = [K[0] + 2.4 * T * sg, K[1]];
    const wayB: Way = wayTo(B, K);
    const base = { look: [0.3 * T * sg - 1.1 * T, -0.4 * T * sg + 1.1 * T] as [number, number], zoom: 2.25, title: 'Looking Glass', tag, say: 'A mirror gathers beside her; she lays her hand on it; in two frames she is through. Another gathers behind you, her eyes in it; in two frames she is out.' };
    play(base, { move: 'glassIn', at: A, way }, 0, QN_IN.long, () => [knight(K, wayTo(K, A))]);
    for (let i = 0; i < 6; i++) push({ ...base, things: [knight(K, wayTo(K, A))] });
    play(base, { move: 'glassOut', at: B, way: wayB }, 0, QN_OUT.long, (t) => [knight(K, t < QN_OUT.hit ? wayTo(K, A) : wayTo(K, B))]);
    play({ ...base, tag: `${tag}, half speed`, slow: true, say: 'Into the glass again at half speed.' }, { move: 'glassIn', at: A, way }, QN_IN.strike[0] - 0.25, QN_IN.strike[1] + 0.3, () => [knight(K, wayTo(K, A))], 0.5);
    play({ ...base, tag: `${tag}, half speed`, slow: true, say: 'And out of it, behind you, at half speed.' }, { move: 'glassOut', at: B, way: wayB }, QN_OUT.strike[0] - 0.25, QN_OUT.strike[1] + 0.3, () => [knight(K, wayTo(K, A))], 0.5);
  }
  // --- REFLECTIONS ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const sg = way === 'dr' ? 1 : -1;
    const at: [number, number] = [-1.6 * T * sg, 0];
    const K: [number, number] = [1.6 * T * sg, 0];
    // (round you, on the far side of you from the eye, so that what steps out comes toward you and you are not hidden)
    const spots: [number, number][] = [[K[0] - 2.1 * T, K[1] + 0.1 * T], [K[0] - 1.3 * T, K[1] + 1.5 * T], [K[0] + 0.1 * T, K[1] + 2.1 * T]];
    const base = { look: [0.4 * T * sg, -0.3 * T] as [number, number], zoom: 2.1, title: 'Reflections', tag, say: 'Her hand lifted, glass gathering round it; swept down at you in two frames: mirrors rise round you and copies of you step out of them (another helper makes the copies).' };
    const em = (t: number): Thing[] => (t >= QN_REFLECT.hit ? spots.map((p, i) => ({ k: 'emerge', t: t - QN_REFLECT.hit - i * 0.12, at: p }) as Thing) : []);
    play(base, { move: 'reflect', at, way }, 0, QN_REFLECT.long, (t) => [knight(K, wayTo(K, at)), ...em(t)]);
    for (let i = 1; i <= 8; i++) push({ ...base, things: [{ k: 'queen', move: 'stand', t: i / FPS, at, way }, knight(K, wayTo(K, at)), ...em(QN_REFLECT.long + i / FPS)] });
    play({ ...base, tag: `${tag}, half speed`, slow: true, say: 'The sweep at half speed.' }, { move: 'reflect', at, way }, QN_REFLECT.strike[0] - 0.3, QN_REFLECT.strike[1] + 0.3, (t) => [knight(K, wayTo(K, at)), ...em(t)], 0.5);
  }
  // --- SHATTER: the whole hall ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const sg = way === 'dr' ? 1 : -1;
    const at: [number, number] = [0, -1.2 * T * sg];
    const K: [number, number] = [3 * T * sg, 0.8 * T * sg];
    const base = { look: [-2.4 * T, 2.4 * T] as [number, number], zoom: 1.18, title: 'Shatter', tag, awake: 12, say: 'Arms flung up, held, every mirror trembling and its lane lighting up; then all of them burst at once and the glass flies across the hall in lanes. Stand in the gaps.' };
    play(base, { move: 'shatter', at, way }, 0, QN_SHATTER.long, () => [knight(K, wayTo(K, at))], 1, (t) => ({ shatter: t }));
    for (let i = 1; i <= Math.round((SHATTER_FX.long - QN_SHATTER.long) * FPS); i++) push({ ...base, shatter: QN_SHATTER.long + i / FPS, things: [{ k: 'queen', move: 'stand', t: i / FPS, at, way }, knight(K, wayTo(K, at))] });
    play({ ...base, tag: `${tag}, half speed`, slow: true, say: 'The burst at half speed: each lane as wide as its mirror, the gaps between them safe.' }, { move: 'shatter', at, way }, QN_SHATTER.strike[0] - 0.3, QN_SHATTER.strike[1] + 0.45, () => [knight(K, wayTo(K, at))], 0.5, (t) => ({ shatter: t }));
  }
  // --- STRUCK ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const sg = way === 'dr' ? 1 : -1;
    const K: [number, number] = [1.1 * T * sg, 0];
    for (let r = 0; r < 3; r++) play({ look: [0.4 * T * sg, 0], zoom: 2.6, title: 'Struck', tag, say: 'Jolted back, her arms flung out, her head thrown back.' }, { move: 'reel', at: [0, 0], way }, 0, 0.4 + 0.2, () => [knight(K, way === 'dr' ? 'ul' : 'dr')]);
  }
  // --- HER DEATH, and her mirror telling the truth ---
  for (const [way, tag] of [['dr', 'in front'], ['ul', 'from behind']] as const) {
    const at: [number, number] = [TALK_AT[0] + (way === 'dr' ? 3.6 : 4.4) * T, way === 'dr' ? -1.2 * T : 0.6 * T];
    const K: [number, number] = way === 'dr' ? [at[0] + 2.2 * T, at[1]] : [at[0] - 2.2 * T, at[1] + 0.3 * T];
    const n = Math.round(QN_DIES.long * FPS) + 30;
    for (let i = 0; i <= n; i++) {
      const t = Math.min(QN_DIES.long, i / FPS);
      out.push({ look: [TALK_AT[0] + 2.6 * T, -0.2 * T], zoom: 2.2, things: [{ k: 'queen', move: 'dying', t, at, way }, knight(K, wayTo(K, at))], talk: { mode: 'truth', t: i / FPS }, title: 'Her death', tag, say: i / FPS < 1.5 ? 'Her crown cracks; the Hush leaves her; she sinks to her knees, her comb fallen. Her mirror cracks across...' : '...and for the first time it tells the truth: "the king is dying, and something sits on his chest."' });
    }
  }
  // --- HER MIRROR, close: still, speaking, the truth ---
  {
    // (the eye on her mirror's glass: the floor a little before it, lifted up the page by half its height)
    const look: [number, number] = [TALK_AT[0] - 1.6 * T, 2.3 * T];
    for (let i = 0; i < 40; i++) out.push({ look, zoom: 3.0, things: [], talk: { mode: 'still', t: i / FPS }, title: 'Her mirror', tag: 'still', say: 'A great pier glass, its crest a crown of glass spikes like hers; grey fog drifting in it.' });
    for (let i = 0; i < 70; i++) out.push({ look, zoom: 3.0, things: [], talk: { mode: 'speaking', t: i / FPS }, title: 'Her mirror', tag: 'speaking', say: 'It speaks to her the whole fight: a face of grey fog, the pink of the Hush in its eyes, its words a whisper.' });
    for (let i = 0; i <= Math.round(TALK_FX.long * FPS) + 20; i++) out.push({ look, zoom: 3.0, things: [], talk: { mode: 'truth', t: i / FPS }, title: 'Her mirror', tag: 'as she dies', say: 'It cracks across; its face clears, the pink gone from its eyes; for the first time it tells the truth.' });
  }
  void EMERGE_FX;
  void CLOUD_FX;
  return out;
}
