// THE WARRIOR BROUGHT UP: THE PICTURES FOR THE OWNER (the art chat's helper, 6 Nov 2026; docs/mockups/warrior_up/README.md).
// Paints him BEFORE (the game's knight as he is: art/heroes3.ts paintMove3, his moves in art/moves3.ts) and AFTER (art/warrior_up*.ts),
// both ways round, with his scarf's two ends hung and moved as the game moves them (engine/tails.ts), and writes each picture
// as an RGBA PNG; tools/warrior_up_pics.py lays out the sheets and the film with their captions. Nothing of the game imports it.
// The second sheet: his helm close, before and now, and his eight facings (his five sides, mirrored as the game mirrors).
//   npx tsx tools/warrior_up_pics.ts sheet <dir>      npx tsx tools/warrior_up_pics.ts sheet2 <dir>
//   npx tsx tools/warrior_up_pics.ts film <dir>

// @ts-ignore - node typings are not part of this project
import { deflateSync } from 'node:zlib';
// @ts-ignore
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { Tails } from '../src/engine/tails';
import type { TailRoot } from '../src/engine/tails';
import { paintMove3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { WARRIOR_TAILS } from '../src/art/hero_warrior';
import type { Painted } from '../src/art/kit';
import { CANVAS3 } from '../src/art/skin';
import { paintWu, wuFacing } from '../src/art/warrior_up_art';
import { WU_MOVES, swingCarried } from '../src/art/warrior_up_moves';
import { WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { GRIP_SPEED, UNITS_PER_TILE } from '../src/art/moves3';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };
paintWithoutCanvas();

// ---- a PNG with its see-through kept ----
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
  return out;
}
function pngRGBA(px: Px): Uint8Array {
  const raw = new Uint8Array((px.w * 4 + 1) * px.h);
  for (let y = 0; y < px.h; y++) {
    raw[y * (px.w * 4 + 1)] = 0;
    raw.set(px.d.subarray(y * px.w * 4, (y + 1) * px.w * 4), y * (px.w * 4 + 1) + 1);
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, px.w);
  dv.setUint32(4, px.h);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

type View = WuSide;
type Who = 'before' | 'after';
const W = CANVAS3.w;
const H = CANVAS3.h;

/** A moment of one of his moves, as it was (before: in front or behind only) or as it is now (after: from any of his five sides). */
function paintOf(who: Who, key: string, t: number, view: View): Painted {
  if (who === 'before') return paintMove3(MOVES3[key], t, view === 'back' ? 'back' : 'front');
  return paintWu(WU_MOVES[key], t, view);
}

/** The way on the game's floor (fx, fy) that each side shows him facing, unmirrored (art/warrior_up_art.ts wuFacing). */
const FACES: Record<View, [number, number]> = { front: [1, 0], back: [0, -1], side: [Math.SQRT1_2, -Math.SQRT1_2], toward: [Math.SQRT1_2, Math.SQRT1_2], away: [-Math.SQRT1_2, -Math.SQRT1_2] };

/** Pixels a mirrored frame would put off its picture (there should be none). */
const LOST = { n: 0 };
/** A frame mirrored as the game mirrors a figure that faces left: about his feet, its scarf's roots with it. */
function mirrored(f: Painted): Painted {
  const px = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = 2 * CANVAS3.ax - x;
    const si = (y * W + x) * 4;
    if (f.px.d[si + 3] === 0) continue;
    if (X < 0 || X >= W) {
      LOST.n++;
      continue;
    }
    const di = (y * W + X) * 4;
    for (let c = 0; c < 4; c++) px.d[di + c] = f.px.d[si + c];
  }
  return { ...f, px, tails: (f.tails ?? []).map((r) => ({ ...r, x: 2 * CANVAS3.ax - r.x })) };
}

/**
 * HIS SCARF'S TWO ENDS, hung from where a frame fixes them and moved as the game moves them (engine/tails.ts), for one figure
 * facing (fx, fy) on the game's floor (mirrored, as the game draws him, if that is to the left of the screen).
 */
class Rig {
  tails = new Tails(WARRIOR_TAILS);
  ox = 0;
  oy = 0;
  fx: number;
  fy: number;
  flip = false;
  constructor(view: View, flip = false, at: [number, number] = [0, 0]) {
    this.fx = 0;
    this.fy = 0;
    this.face(view, flip);
    [this.ox, this.oy] = at;
  }
  /** Turn him to the way a side shows him (mirrored or not); his scarf goes on as it was. */
  face(view: View, flip: boolean): void {
    [this.fx, this.fy] = FACES[view];
    if (flip) [this.fx, this.fy] = [this.fy, this.fx];
    this.flip = flip;
  }
  /**
   * Step the scarf on by `dt` to this frame and lay the frame with it: the figure carried `move` tiles on the way he faces
   * meanwhile (the game's floor on the screen: a tile along fx is 16 game pixels right and 8 down, along fy 16 left and 8
   * down), or put at `to` (game pixels) if given.
   */
  frame(f0: Painted, dt: number, move = 0, to?: [number, number]): Px {
    const f = this.flip ? mirrored(f0) : f0;
    // (as the game has it: a figure is turned to the left, mirrored, when it goes left across the screen)
    const facing = this.fx - this.fy < -1e-6 ? -1 : 1;
    if (to) [this.ox, this.oy] = to;
    else {
      this.ox += (this.fx - this.fy) * 16 * move;
      this.oy += (this.fx + this.fy) * 8 * move;
    }
    const roots: TailRoot[] = (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    this.tails.step(dt, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, facing, this.ox, this.oy);
    const out = new Px(W, H);
    const lay = (over: boolean): void => {
      const buf = new Uint8ClampedArray(TAIL_PW * TAIL_PH * 4);
      if (!this.tails.paint(buf, over)) return;
      const dx = CANVAS3.ax - TAIL_HW;
      const dy = CANVAS3.ay - TAIL_UP;
      for (let y = 0; y < TAIL_PH; y++) for (let x = 0; x < TAIL_PW; x++) {
        const si = (y * TAIL_PW + x) * 4;
        if (buf[si + 3] === 0) continue;
        const X = x + dx;
        const Y = y + dy;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const di = (Y * W + X) * 4;
        out.d[di] = buf[si];
        out.d[di + 1] = buf[si + 1];
        out.d[di + 2] = buf[si + 2];
        out.d[di + 3] = 255;
      }
    };
    lay(false);
    for (let i = 0; i < W * H * 4; i += 4) {
      if (f.px.d[i + 3] === 0) continue;
      out.d[i] = f.px.d[i];
      out.d[i + 1] = f.px.d[i + 1];
      out.d[i + 2] = f.px.d[i + 2];
      out.d[i + 3] = f.px.d[i + 3] === 255 ? 255 : f.px.d[i + 3];
    }
    lay(true);
    return out;
  }
}
const TAIL_PW = 192;
const TAIL_PH = 152;
const TAIL_HW = 96;
const TAIL_UP = 112;

/** How far the game carries him a frame while he runs: 4.6 tiles a second. */
const RUN_STEP = 4.6 / 30;

/** One of his moves, before or after, as the game shows it: the frame it shows at `t` (its own pictures a second, or by how far through). */
interface Shown {
  key: string;
  /** The game's pictures a second of this list (the moment shown is the last picture before t). */
  fps: number;
  /** A loop's length, if it goes round. */
  loop?: number;
  /** The last moment it has (a move played once holds its last picture). */
  end: number;
  runs?: boolean;
}
function shown(s: Shown, t: number): number {
  let u = t;
  if (s.loop) u = t % s.loop;
  u = Math.floor(u * s.fps + 1e-6) / s.fps;
  return Math.min(u, s.end);
}
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;
/** The lists of the film: what each shows before and after, and how. */
function lists(key: string): { before: Shown; after: Shown } {
  const o = MOVES3[key];
  const n = WU_MOVES[key];
  const loopO = o.motion.loop !== undefined ? endOf(o) - (o.motion.loop ?? 0) : undefined;
  const loopN = n.motion.loop !== undefined ? endOf(n) - (n.motion.loop ?? 0) : undefined;
  // (as the game had him: standing at 10 a second, looking about him at 20, the rest at 30; now all at 30, his run at 60)
  const fpsO = key === 'rear' || key === 'ktown' ? 10 : key === 'klook' ? 20 : 30;
  const fpsN = n.stride !== undefined ? 60 : 30;
  const endO = key === 'kdraw' ? 40 / 30 : endOf(o);
  const endN = key === 'kdraw' ? 40 / 30 : endOf(n);
  return { before: { key, fps: fpsO, loop: loopO, end: endO, runs: o.stride !== undefined || key.includes('run') }, after: { key, fps: fpsN, loop: loopN, end: endN, runs: key.includes('run') } };
}

// ---------------------------------------------------------------------------------------------
// THE SHEET: the key moments, each painted with the scarf hung by playing the move up to it

/** Him at a moment of a move, his scarf's ends hung as they would be (the move played from its start up to it, the floor going by if he runs). */
function still(who: Who, key: string, t: number, view: View, flip = false): Px {
  const rig = new Rig(view, flip);
  const runs = key.includes('run');
  // (from a second before, in a loop; from its start, else)
  const loop = (who === 'before' ? MOVES3[key] : WU_MOVES[key]).motion.loop !== undefined;
  const from = loop ? t - 1.2 : -0.5;
  let px: Px | null = null;
  for (let u = from; u <= t + 1e-6; u += 1 / 60) {
    px = rig.frame(paintOf(who, key, Math.min(Math.max(0, u), t), view), 1 / 60, runs ? RUN_STEP / 2 : 0);
  }
  return px as Px;
}

const SHEET: { title: string; rows: { label: string; key: string; before: number; after: number }[] }[] = [
  { title: 'Standing in his guard', rows: [{ label: 'his guard (now he breathes, shifts his weight, and has a habit of his own)', key: 'rear', before: 0, after: 1.3 }] },
  { title: 'Running', rows: [{ label: 'a stride (now his feet grip the floor)', key: 'krun', before: 0.1, after: 0.1 }] },
  { title: 'His class card: drawing his sword when picked', rows: [{ label: 'ready in his guard (now his feet step into it, never slide)', key: 'kdraw', before: 33 / 30, after: 33 / 30 }] },
  { title: 'Strike, the first swing (a rising cut)', rows: [
    { label: 'the wind-up (now big, and held)', key: 'strike', before: 2 / 30, after: 7 / 30 },
    { label: 'the strike (now two frames, smeared)', key: 'strike', before: 4 / 30, after: 10 / 30 },
    { label: 'the wind-down', key: 'strike', before: 8 / 30, after: 16 / 30 },
  ] },
  { title: 'Strike, the second swing (a downward slash)', rows: [
    { label: 'the wind-up (now big, and held)', key: 'kslash', before: 2 / 30, after: 7 / 30 },
    { label: 'the strike (now two frames, smeared)', key: 'kslash', before: 4 / 30, after: 10 / 30 },
    { label: 'the wind-down', key: 'kslash', before: 8 / 30, after: 18 / 30 },
  ] },
  { title: 'Slam', rows: [
    { label: 'the wind-up (now up on his toes, held)', key: 'slam', before: 5 / 30, after: 12 / 30 },
    { label: 'the strike (now two frames, smeared)', key: 'slam', before: 7 / 30, after: 15 / 30 },
    { label: 'the wind-down', key: 'slam', before: 12 / 30, after: 24 / 30 },
  ] },
  { title: 'Whirlwind', rows: [{ label: 'going round (now pivoting on one foot, the blade smeared)', key: 'whirl', before: 2 / 30, after: 2 / 30 }] },
  { title: 'Lunge (the diving thrust)', rows: [
    { label: 'the dive', key: 'kthrust', before: 0.25, after: 0.25 },
    { label: 'the point punched out as he lands', key: 'kthrust', before: 0.5, after: 0.5 },
  ] },
  { title: 'His fall', rows: [
    { label: 'now: once more he pushes up on the hilt', key: 'kfall', before: 33 / 30, after: 31 / 30 },
    { label: 'the end: kneeling, the light gone out', key: 'kfall', before: 46 / 30, after: 46 / 30 },
  ] },
];
const SMALL = [
  { label: 'standing', key: 'rear', before: 0, after: 1.3 },
  { label: 'the strike', key: 'strike', before: 4 / 30, after: 10 / 30 },
  { label: 'the slam', key: 'slam', before: 7 / 30, after: 15 / 30 },
  { label: 'running', key: 'krun', before: 0.1, after: 0.1 },
  { label: 'his fall', key: 'kfall', before: 46 / 30, after: 46 / 30 },
];

function sheet(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const spec: { title: string; rows: { label: string; files: string[] }[] }[] = [];
  let n = 0;
  for (const sec of SHEET) {
    const rows: { label: string; files: string[] }[] = [];
    for (const r of sec.rows) {
      const files: string[] = [];
      for (const view of ['front', 'back'] as const) {
        for (const who of ['before', 'after'] as const) {
          const px = still(who, r.key, who === 'before' ? r.before : r.after, view);
          const f = `s${String(n++).padStart(3, '0')}_${who}_${view}.png`;
          writeFileSync(`${dir}/${f}`, pngRGBA(px));
          files.push(f);
        }
      }
      rows.push({ label: r.label, files });
    }
    spec.push({ title: sec.title, rows });
  }
  const small: { label: string; files: string[] }[] = [];
  for (const r of SMALL) {
    const files: string[] = [];
    for (const who of ['before', 'after'] as const) {
      const f = `g${String(n++).padStart(3, '0')}_${who}.png`;
      writeFileSync(`${dir}/${f}`, pngRGBA(still(who, r.key, who === 'before' ? r.before : r.after, 'front')));
      files.push(f);
    }
    small.push({ label: r.label, files });
  }
  writeFileSync(`${dir}/sheet.json`, JSON.stringify({ sections: spec, small }, null, 1));
  console.log(`${n} pictures in ${dir}`);
}

// ---------------------------------------------------------------------------------------------
// THE FILM: each list before and after, side by side, both ways round, at 30 frames a second; the strikes again at half speed;
// his class card's standing loop

interface Part {
  caption: string;
  key: string;
  seconds: number;
  /** Played slower than life (2: half speed). */
  slow?: number;
  /** Only from in front, the card's: before and after side by side, bigger. */
  card?: boolean;
}
const FILM: Part[] = [
  { caption: 'STANDING IN HIS GUARD · before: 10 pictures a second, still · now: 30, breathing, shifting his weight, a habit of his own', key: 'rear', seconds: 4 },
  { caption: 'RUNNING · now his feet grip the floor (they slid before)', key: 'krun', seconds: 2.2 },
  { caption: 'STRIKE, THE FIRST SWING · now a big held wind-up, a strike of two frames smeared, a big wind-down', key: 'strike', seconds: 1.5 },
  { caption: 'STRIKE, THE SECOND SWING · the same', key: 'kslash', seconds: 1.2 },
  { caption: 'SLAM · up on his toes and held, then two frames into the floor', key: 'slam', seconds: 1.4 },
  { caption: 'WHIRLWIND · now he pivots on one foot (both feet slid round before)', key: 'whirl', seconds: 1.6 },
  { caption: 'LUNGE · the dive, the point drawn back and punched out as he lands', key: 'kthrust', seconds: 1.4 },
  { caption: 'STRUCK FROM IN FRONT', key: 'kreel', seconds: 0.6 },
  { caption: 'STRUCK FROM BEHIND', key: 'klurch', seconds: 0.6 },
  { caption: 'HIS FALL · now he pushes up once more on his sword before the light goes out', key: 'kfall', seconds: 2.2 },
  { caption: 'IN TOWN, STANDING · before: 10 pictures a second · now: 30, alive', key: 'ktown', seconds: 2.6 },
  { caption: 'IN TOWN, RUNNING · now his feet grip the floor', key: 'ktownrun', seconds: 1.8 },
  { caption: 'IN TOWN, LOOKING ABOUT HIM · before: 20 pictures a second · now: 30', key: 'klook', seconds: 3.7 },
  { caption: "HIS CLASS CARD, DRAWING HIS SWORD WHEN PICKED · now his feet step, never slide", key: 'kdraw', seconds: 1.6 },
  { caption: 'STRIKE, THE FIRST SWING, AT HALF SPEED', key: 'strike', seconds: 1.3, slow: 2 },
  { caption: 'STRIKE, THE SECOND SWING, AT HALF SPEED', key: 'kslash', seconds: 1.0, slow: 2 },
  { caption: 'SLAM, AT HALF SPEED', key: 'slam', seconds: 1.2, slow: 2 },
  { caption: 'LUNGE, AT HALF SPEED', key: 'kthrust', seconds: 1.1, slow: 2 },
  { caption: 'HIS CLASS CARD: STANDING, BEFORE AND NOW, SIDE BY SIDE', key: 'ktown', seconds: 4.8, card: true },
];

function film(dir: string): void {
  mkdirSync(dir, { recursive: true });
  // (first, what is new since he saw him: his eight facings, at the game's size)
  const turned = scenes(dir, 0);
  const frames: { caption: string; file: string; card: boolean; part: number }[] = [];
  let n = 0;
  FILM.forEach((p, pi) => {
    const L = lists(p.key);
    const rigs = { 'before:front': new Rig('front'), 'before:back': new Rig('back'), 'after:front': new Rig('front'), 'after:back': new Rig('back') };
    const total = Math.round(p.seconds * (p.slow ?? 1) * 30);
    // (a moment's warm-up for the scarf, so it hangs as it would)
    for (const [k, rig] of Object.entries(rigs)) {
      const [who, view] = k.split(':') as [Who, View];
      for (let i = 0; i < 30; i++) rig.frame(paintOf(who, p.key, 0, view), 1 / 30, L[who].runs ? RUN_STEP : 0);
    }
    for (let i = 0; i < total; i++) {
      const t = i / 30 / (p.slow ?? 1);
      const strip = new Px(W * 4, H);
      const order: [Who, View][] = [['before', 'front'], ['after', 'front'], ['before', 'back'], ['after', 'back']];
      order.forEach(([who, view], j) => {
        const s = L[who];
        const u = shown(s, t);
        const px = rigs[`${who}:${view}` as keyof typeof rigs].frame(paintOf(who, p.key, u, view), 1 / 30 / (p.slow ?? 1), s.runs ? RUN_STEP / (p.slow ?? 1) : 0);
        for (let y = 0; y < H; y++) strip.d.set(px.d.subarray(y * W * 4, (y + 1) * W * 4), (y * strip.w + j * W) * 4);
      });
      const f = `f${String(n++).padStart(4, '0')}.png`;
      writeFileSync(`${dir}/${f}`, pngRGBA(strip));
      frames.push({ caption: p.caption, file: f, card: !!p.card, part: pi });
    }
  });
  writeFileSync(`${dir}/film.json`, JSON.stringify({ scenes: turned, frames }, null, 0));
  console.log(`${turned.length} + ${n} frames in ${dir} (${((turned.length + n) / 30).toFixed(1)} s); ${LOST.n} pixels lost off a mirrored picture`);
}

// ---------------------------------------------------------------------------------------------
// THE SECOND SHEET: his helm close, before and now; and his eight facings

/** The eight ways the game may have him face, round from down-and-right (art/warrior_up_art.ts wuFacing): (fx, fy) and a name. */
const EIGHT = Array.from({ length: 8 }, (_, k) => {
  const a = (k * 45 * Math.PI) / 180;
  const fx = Math.cos(a);
  const fy = Math.sin(a);
  const names = ['down and to the right', 'down (toward you)', 'down and to the left', 'to the left', 'up and to the left', 'up (away from you)', 'up and to the right', 'to the right'];
  return { k, fx, fy, name: names[k], ...wuFacing(fx, fy) };
});

/** Where his head is in a picture (its top, its middle across), the blade above him passed over by its colour. */
function headOf(px: Px): [number, number] {
  for (let y = 0; y < H; y++) for (let x = 30; x < W - 30; x++) {
    const k = (y * W + x) * 4;
    if (px.d[k + 3] === 255 && !(px.d[k + 2] > 200 && px.d[k] < 160)) return [x, y];
  }
  return [CANVAS3.ax, 20];
}

function sheet2(dir: string): void {
  mkdirSync(dir, { recursive: true });
  let n = 0;
  const write = (px: Px): string => {
    const f = `t${String(n++).padStart(3, '0')}.png`;
    writeFileSync(`${dir}/${f}`, pngRGBA(px));
    return f;
  };
  // HIS HELM: before (the game's knight, in front and behind) and now (his five sides), at his guard, cut round his head
  const helm: { label: string; now: boolean; file: string; box: [number, number, number, number] }[] = [];
  const HW = 34;
  const HH = 26;
  const cut = (px: Px): [number, number, number, number] => {
    const [cx, top] = headOf(px);
    return [cx - HW / 2, top - 3, cx + HW / 2, top - 3 + HH];
  };
  for (const view of ['front', 'back'] as const) {
    const px = still('before', 'rear', 0, view);
    helm.push({ label: `BEFORE · ${view === 'front' ? 'in front' : 'from behind'}`, now: false, file: write(px), box: cut(px) });
  }
  const SIDE_NAMES: Record<View, string> = { front: 'in front', back: 'from behind', side: 'side-on', toward: 'toward you', away: 'away from you' };
  for (const view of WU_SIDES) {
    const px = still('after', 'rear', 1.3, view);
    helm.push({ label: `NOW · ${SIDE_NAMES[view]}`, now: true, file: write(px), box: cut(px) });
  }
  // HIS EIGHT FACINGS: his stance, a stride of his run, Strike's smeared blow
  const turn: { title: string; cells: { k: number; name: string; side: string; flip: boolean; file: string }[] }[] = [];
  for (const [title, key, t] of [['Standing in his guard', 'rear', 1.3], ['Running: a stride', 'krun', 0.1], ['Strike: the blow, smeared', 'strike', 10 / 30]] as const) {
    const cells = EIGHT.map((e) => {
      const px = still('after', key, t, e.side, e.flip);
      return { k: e.k, name: e.name, side: `${SIDE_NAMES[e.side]}${e.flip ? ', mirrored' : ''}`, flip: e.flip, file: write(px) };
    });
    turn.push({ title, cells });
  }
  writeFileSync(`${dir}/sheet2.json`, JSON.stringify({ helm, turn }, null, 1));
  console.log(`${n} pictures in ${dir}; ${LOST.n} pixels lost off a mirrored picture`);
}

// ---------------------------------------------------------------------------------------------
// THE FILM'S TWO NEW PARTS, AT THE GAME'S SIZE: running round a circle through all eight facings; striking each of the eight ways

/** The game's floor on the screen, in picture pixels (two to the game's pixel): a tile along fx 32 right and 16 down, along fy 32 left and 16 down. */
const onScreen = (X: number, Y: number): [number, number] => [(X - Y) * 32, (X + Y) * 16];
const SCENE_W = 560;
const SCENE_H = 420;

interface SceneFrame {
  caption: string;
  scene: string;
  cell: string;
  at: [number, number];
  facing: string;
  side: string;
  path?: { r: number };
  way?: number;
}

/** A frame of a scene: him laid at `at` (picture pixels in the scene) from his frame with its scarf `px`. */
function laid(px: Px, at: [number, number]): Px {
  const out = new Px(SCENE_W, SCENE_H);
  const dx = Math.round(at[0]) - CANVAS3.ax;
  const dy = Math.round(at[1]) - CANVAS3.ay;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const si = (y * W + x) * 4;
    if (px.d[si + 3] === 0) continue;
    const X = x + dx;
    const Y = y + dy;
    if (X < 0 || Y < 0 || X >= SCENE_W || Y >= SCENE_H) continue;
    const di = (Y * SCENE_W + X) * 4;
    for (let c = 0; c < 4; c++) out.d[di + c] = px.d[si + c];
  }
  return out;
}

function scenes(dir: string, start: number): SceneFrame[] {
  const out: SceneFrame[] = [];
  let n = start;
  const write = (px: Px, pre: string): string => {
    const f = `${pre}${String(n++).padStart(4, '0')}.png`;
    writeFileSync(`${dir}/${f}`, pngRGBA(px));
    return f;
  };
  const SIDE_NAMES: Record<View, string> = { front: 'his front side', back: 'his back side', side: 'his side-on side', toward: 'his side toward you', away: 'his side away from you' };
  const centre: [number, number] = [SCENE_W / 2, SCENE_H / 2 + 50];
  // RUNNING ROUND A CIRCLE: once round (clockwise as seen on the screen) at the game's pace, 4.6 tiles a second
  {
    const seconds = 5.4;
    const r = (4.6 * seconds) / (2 * Math.PI);
    let rig: Rig | null = null;
    const m = WU_MOVES.krun;
    const period = (m.stride as number) / GRIP_SPEED;
    for (let i = 0; i < Math.round(seconds * 30); i++) {
      const t = i / 30;
      const ph = (t / seconds) * 2 * Math.PI;
      const [X, Y] = [r * Math.cos(ph), r * Math.sin(ph)];
      // (going round: his way is the circle's own, a quarter turn on from where he is)
      const fx = -Math.sin(ph);
      const fy = Math.cos(ph);
      const { side, flip } = wuFacing(fx, fy);
      const [sx, sy] = onScreen(X, Y);
      const at: [number, number] = [centre[0] + sx, centre[1] + sy];
      // (one scarf for him all the way round: the side he is drawn from changes, the scarf goes on)
      if (!rig) {
        rig = new Rig(side, flip, [at[0] / 2, at[1] / 2]);
        for (let w = 0; w < 30; w++) rig.frame(paintOf('after', 'krun', (w / 30) % period, side), 1 / 30, 0, [at[0] / 2, at[1] / 2]);
      }
      rig.face(side, flip);
      const u = Math.floor(((t % period) * 60) + 1e-6) / 60;
      const px = rig.frame(paintOf('after', 'krun', u, side), 1 / 30, 0, [at[0] / 2, at[1] / 2]);
      const e = EIGHT[((Math.round((Math.atan2(fy, fx) * 180) / Math.PI / 45) % 8) + 8) % 8];
      out.push({ caption: 'NOW: RUNNING ROUND A CIRCLE, THROUGH ALL EIGHT FACINGS · at the game\'s size, and three times as big', scene: write(laid(px, at), 'c'), cell: write(px, 'd'), at, facing: e.name, side: `${SIDE_NAMES[side]}${flip ? ', mirrored' : ''}`, path: { r } });
    }
  }
  // STRIKING EACH OF THE EIGHT WAYS: the first swing of Strike, once each way round from down and to the right
  {
    const len = 36 / 30;
    for (const e of EIGHT) {
      const rig = new Rig(e.side, e.flip, [centre[0] / 2, centre[1] / 2]);
      for (let w = 0; w < 20; w++) rig.frame(paintOf('after', 'strike', 0, e.side), 1 / 30, 0, [centre[0] / 2, centre[1] / 2]);
      for (let i = 0; i < Math.round(len * 30); i++) {
        const t = i / 30;
        // (the game's step on the swing: a third of a tile the way he faces, over its first 0.12 s)
        const step = swingCarried(t) / UNITS_PER_TILE;
        const [sx, sy] = onScreen(e.fx * step, e.fy * step);
        const at: [number, number] = [centre[0] + sx, centre[1] + sy];
        const px = rig.frame(paintOf('after', 'strike', t, e.side), 1 / 30, 0, [at[0] / 2, at[1] / 2]);
        out.push({ caption: 'NOW: STRIKE, EACH OF THE EIGHT WAYS · at the game\'s size, and three times as big', scene: write(laid(px, at), 'c'), cell: write(px, 'd'), at, facing: e.name, side: `${SIDE_NAMES[e.side]}${e.flip ? ', mirrored' : ''}`, way: e.k });
      }
    }
  }
  return out;
}

const [mode, dir] = process.argv.slice(2);
if (mode === 'sheet') sheet(dir);
else if (mode === 'sheet2') sheet2(dir);
else if (mode === 'film') film(dir);
else console.log('usage: warrior_up_pics.ts sheet|sheet2|film <dir>');
