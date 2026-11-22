// THE LIVING SHADOW FROM ALL EIGHT SIDES: ITS PICTURES FOR THE FILM, AND HOW NEAR EACH COMES TO ITS CANVAS'S EDGE (the queue's
// draw-the-demon-from-eight-sides, 22 Nov 2026; docs/mockups/demon_eight/README.md; tools/shadow_eight_film.py makes the film).
// Its lists, as the game holds them with art/sides_more.ts EIGHT_MORE.demon on, side by side (art/shadow_art.ts shadowDemonSet,
// the way makeShadowArt makes each side). Every frame of every list of a truly turned side is painted and measured (how near it comes
// to its canvas's edge); a mirrored side's are its source's mirrored, so of those only what the film shows and its burning out
// (truly turned) are painted. What the film shows is written as PNG: <out>/<side>/<list>_<f>.png; the measures to <out>/<side>.json.
//   npx tsx tools/shadow_eight_pics.ts <out> <side,side,...> [list,list,...: only these, the rest kept]     (about three minutes a
//   side; two runs at once, four sides each)
// Nothing of the game imports it.
// @ts-ignore
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
declare const process: { argv: string[] };
const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const out = process.argv[2];
const SIDES = process.argv[3].split(',');
// (only these lists, if named: the rest of what was painted before kept)
const ONLY = process.argv[4] ? new Set(process.argv[4].split(',')) : null;
const { paintWithoutCanvas } = await import(`${root}/tests/helpers.ts`);
paintWithoutCanvas();
const { EIGHT_MORE, MORE_TURN } = await import(`${root}/src/art/sides_more.ts`);
EIGHT_MORE.demon = true;
// (the man in its burning out dressed as the game dresses him, brought up: art/warlock_up.ts sets his sculptor's WARLOCK_DRESS)
const { WARLOCK_UP } = await import(`${root}/src/art/warlock_up.ts`);
if (!WARLOCK_UP.on) throw new Error('the man is brought up in the game (WARLOCK_UP)');
const { shadowDemonSet, SHADOW_MIRRORS } = await import(`${root}/src/art/shadow_art.ts`);
const { slashAlong, SHADOW_CARRY } = await import(`${root}/src/dev/shadow_moves.ts`);

const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = (b: Uint8Array) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type: string, data: Uint8Array): Uint8Array { const o = new Uint8Array(12 + data.length); const dv = new DataView(o.buffer); dv.setUint32(0, data.length); for (let i = 0; i < 4; i++) o[4 + i] = type.charCodeAt(i); o.set(data, 8); dv.setUint32(8 + data.length, crc(o.subarray(4, 8 + data.length))); return o; }
function png(path: string, w: number, h: number, d: Uint8ClampedArray): void {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(d.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const ih = new Uint8Array(13); const dv = new DataView(ih.buffer); dv.setUint32(0, w); dv.setUint32(4, h); ih[8] = 8; ih[9] = 6;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw, { level: 1 })), chunk('IEND', new Uint8Array(0))];
  writeFileSync(path, Buffer.concat(parts));
}
// (the canvases, in the game's pixels: two painted pixels each; its own, with the switch on, SHADOW_BELOW painted pixels taller)
const { SHADOW_BELOW } = await import(`${root}/src/dev/demon_new.ts`);
const RIG = { w: 180, h: 160 + SHADOW_BELOW / 2, ax: 90, ay: 138 };
const SCENE = { w: 260, h: 210, ax: 130, ay: 163 };
/** The edges of its canvas it has paint on (so is cut at): a picture trimmed to what is painted, read on the canvas's own last rows. */
function cutAt(s: any, cv: typeof RIG, flip: boolean): string[] {
  const k = s.density ?? 1;
  const d = s.img.d as Uint8ClampedArray;
  const W = Math.round(s.w * k);
  const H = Math.round(s.h * k);
  const ax = flip ? s.w - 1 / k - s.ax : s.ax;
  const ink = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + (flip ? W - 1 - x : x)) * 4 + 3] > 0;
  const row = (y: number) => { for (let x = 0; x < W; x++) if (ink(x, y)) return true; return false; };
  const col = (x: number) => { for (let y = 0; y < H; y++) if (ink(x, y)) return true; return false; };
  const out: string[] = [];
  if (row(Math.round((s.ay - cv.ay) * k))) out.push('top');
  if (row(Math.round((s.ay + cv.h - cv.ay) * k) - 1)) out.push('foot');
  if (col(Math.round((ax - cv.ax) * k))) out.push('left');
  if (col(Math.round((ax + cv.w - cv.ax) * k) - 1)) out.push('right');
  return out;
}
const SHOWN = new Set(['idle', 'start', 'walk', 'stop5', 'attack', 'attack2', 'attackWalk0', 'attack2Walk0', 'heavy', 'leap', 'land', 'reel', 'lurch', 'change']);
for (const side of SIDES) {
  const t0 = Date.now();
  const of = (SHADOW_MIRRORS as Record<string, string | undefined>)[side];
  const set: any = of ? shadowDemonSet('front', MORE_TURN[of], true) : shadowDemonSet('front', MORE_TURN[side]);
  const lists: [string, any[], number, any][] = [
    ['idle', set.idle, set.idleFps, RIG], ['walk', set.walk, set.walkFps, RIG], ['start', set.start.frames, set.start.fps, RIG],
    ...set.stops.map((c: any, i: number) => [`stop${i}`, c.frames, c.fps, RIG]),
    ['attack', set.clips.attack.frames, set.clips.attack.fps, SCENE], ['attack2', set.clips.attack2.frames, set.clips.attack2.fps, SCENE],
    ...set.clips.attackWalk.map((c: any, i: number) => [`attackWalk${i}`, c.frames, c.fps, SCENE]),
    ...set.clips.attack2Walk.map((c: any, i: number) => [`attack2Walk${i}`, c.frames, c.fps, SCENE]),
    ['heavy', set.clips.heavy.frames, set.clips.heavy.fps, SCENE], ['leap', set.clips.leap.frames, set.clips.leap.fps, RIG],
    ['land', set.clips.land.frames, set.clips.land.fps, RIG], ['reel', set.clips.reel.frames, set.clips.reel.fps, RIG],
    ['lurch', set.clips.lurch.frames, set.clips.lurch.fps, RIG], ['change', set.clips.change.frames, set.clips.change.fps, SCENE],
  ];
  mkdirSync(`${out}/${side}`, { recursive: true });
  const note: any = ONLY ? JSON.parse(readFileSync(`${out}/${side}.json`, 'utf8')) : { side, mirrorOf: of ?? null, startAt: set.startAt, carry: SHADOW_CARRY, lists: {} };
  for (const [name, frames, fps, cv] of lists) {
    if (ONLY && !ONLY.has(name)) continue;
    const shown = SHOWN.has(name);
    if (of && !shown) continue;
    let margin = Infinity, at = -1;
    const cut: Record<string, number[]> = {};
    const boxes: number[][] = [];
    for (let f = 0; f < frames.length; f++) {
      const s = frames[f];
      const m = Math.min(cv.ax - s.ax, cv.w - cv.ax - (s.w - s.ax), cv.ay - s.ay, cv.h - cv.ay - (s.h - s.ay));
      if (m < margin) { margin = m; at = f; }
      if (m < 1) for (const e of cutAt(s, cv, !!of && name !== 'change')) (cut[e] ??= []).push(f);
      if (shown) {
        const d = s.img.d as Uint8ClampedArray;
        const k = Math.round(Math.sqrt(d.length / 4 / (s.w * s.h)));
        png(`${out}/${side}/${name}_${String(f).padStart(3, '0')}.png`, s.w * k, s.h * k, d);
        boxes.push([s.w, s.h, s.ax, s.ay, k]);
      }
      Object.defineProperty(frames, f, { value: null, configurable: true });
    }
    const along = name.startsWith('attackWalk') || name.startsWith('attack2Walk') ? Array.from({ length: frames.length }, (_, i) => slashAlong(i / fps)) : undefined;
    note.lists[name] = { n: frames.length, fps, margin: +margin.toFixed(2), at, cut, boxes: shown ? boxes : undefined, along };
  }
  writeFileSync(`${out}/${side}.json`, JSON.stringify(note));
  const cuts = Object.entries(note.lists).filter(([, v]: any) => Object.keys(v.cut).length).map(([k, v]: any) => `${k} ${JSON.stringify(v.cut)}`);
  console.log(side, ((Date.now() - t0) / 1000).toFixed(0), 's', 'nearest its edge', Math.min(...Object.values(note.lists).map((v: any) => v.margin)), cuts.length ? `CUT: ${cuts.join('; ')}` : 'nothing cut');
}
