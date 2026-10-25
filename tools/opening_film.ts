// The opening played as a film, to look at: every box baked once (art/opening.ts bakeBox), then frame by frame the spreads
// filled box by box in reading order, each box coming in, its picture drifting slowly in its frame, its fire, smoke and
// lights moving (liveBox), its captions pinned; the pages turning between spreads; written to an MP4 by ffmpeg.
//   tsx tools/opening_film.ts <out.mp4> [fps=15] [spreads, e.g. 0-3] [scale=2]
// With FRAMES=<dir>, every half second's frame is written there as a PNG as well.
// @ts-ignore
import { spawn } from 'node:child_process';
// @ts-ignore
import { mkdirSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { PAGES, boxRect, bakeBox, liveBox, drawPin, paperSpread, pagePins, SPREAD_W, SPREAD_H, DENSITY } from '../src/art/opening';
import type { BoxDef, Pin } from '../src/art/opening';
import { INK, hash } from '../src/art/comic';
import { writePng } from './px_png';

// @ts-ignore
const argv: string[] = process.argv;
// @ts-ignore
const env: Record<string, string | undefined> = process.env;
const OUT = argv[2] ?? 'opening.mp4';
const FPS = Number(argv[3] ?? 15);
const [S0, S1] = (argv[4] ?? '0-3').split('-').map(Number);
const SCALE = Number(argv[5] ?? 2);
const FRAMES = env.FRAMES;
if (FRAMES) mkdirSync(FRAMES, { recursive: true });

const PW = (SPREAD_W * DENSITY) / 2;
const PH = SPREAD_H * DENSITY;
/** How long a box takes to come in; a page turn; the beat on a fresh spread before its first box; the look at a full one. */
const REVEAL = 0.35;
const TURN = 0.8;
const LEAD = 0.5;
const LOOK = 1.2;
/** Reading time per letter of a caption. */
const READ = 0.055;

/** How long a box is held before the next comes in: by its size, and its words. */
function holdOf(b: BoxDef, r: { w: number; h: number }, extra: string): number {
  const f = (r.w * r.h) / (PW * PH);
  const base = b.across ? 6.5 : f < 0.2 ? 2.2 : f < 0.4 ? 2.8 : f < 0.7 ? 3.4 : 4.6;
  return base + ((b.say?.length ?? 0) + extra.length) * READ;
}

/** Which way each picture drifts in its frame: from (x0, y0) to (x1, y1), shares of its room to move. */
const DRIFTS: readonly [number, number, number, number][] = [
  [0.5, 1, 0.5, 0],
  [0, 0.5, 1, 0.5],
  [1, 0, 0, 1],
  [1, 0.5, 0, 0.5],
  [0, 0, 1, 1],
  [0.5, 0, 0.5, 1],
  [1, 1, 0, 0],
];

interface Entry {
  b: BoxDef;
  page: 0 | 1;
  r: { x: number; y: number; w: number; h: number };
  img: Px;
  pins: Pin[];
  at: number;
  drift: readonly [number, number, number, number];
}
interface Spread {
  k: number;
  start: number;
  end: number;
  boxes: Entry[];
  pagePins: { at: number; pin: Pin }[];
}

// BAKE every box, and lay out the time
const spreads: Spread[] = [];
let clock = 0;
let n = 0;
for (let s = S0; s <= S1; s++) {
  const k = s * 2;
  const sp: Spread = { k, start: clock, end: 0, boxes: [], pagePins: [] };
  let cursor = clock + LEAD;
  for (const page of [0, 1] as const) {
    const pp = pagePins(k + page, page);
    const extra = pp.map((q) => q.say).join('');
    (PAGES[k + page] ?? []).forEach((b, i) => {
      const r = boxRect(b, page);
      const t0 = Date.now();
      const { img, pins } = bakeBox(b, r.w, r.h);
      console.log(`baked p${k + page + 1}b${i + 1}`, Date.now() - t0, 'ms');
      // (a page's own caption runs over its top boxes: it comes in with the second of them)
      const withPage = i === Math.min(1, (PAGES[k + page] ?? []).length - 1);
      if (withPage) for (const pin of pp) sp.pagePins.push({ at: cursor + REVEAL, pin });
      sp.boxes.push({ b, page, r, img, pins, at: cursor, drift: DRIFTS[n++ % DRIFTS.length] });
      cursor += holdOf(b, r, withPage ? extra : '');
    });
  }
  sp.end = cursor + LOOK;
  clock = sp.end + TURN;
  spreads.push(sp);
}
const TOTAL = spreads[spreads.length - 1].end + 1.0;
console.log('film', TOTAL.toFixed(1), 's,', Math.ceil(TOTAL * FPS), 'frames');

const ease = (u: number): number => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));

/** A spread at moment `t`: its paper, every box come in so far, moving. */
function spreadAt(sp: Spread, t: number): Px {
  const p = paperSpread();
  for (const e of sp.boxes) {
    const tl = t - e.at;
    if (tl < 0) continue;
    const { r, img } = e;
    const mx = img.w - r.w;
    const my = img.h - r.h;
    const u = ease((t - e.at) / (sp.end - e.at));
    let ox = mx * (e.drift[0] + (e.drift[2] - e.drift[0]) * u);
    let oy = my * (e.drift[1] + (e.drift[3] - e.drift[1]) * u);
    if (e.b.jolt !== undefined) {
      const tj = tl - e.b.jolt;
      if (tj >= 0 && tj < 0.4) {
        const A = 5 * (1 - tj / 0.4);
        ox += A * Math.sin(tj * 80);
        oy += A * 0.7 * Math.cos(tj * 61);
      }
    }
    ox = Math.round(Math.min(mx, Math.max(0, ox)));
    oy = Math.round(Math.min(my, Math.max(0, oy)));
    const win = liveBox(e.b, img, tl).crop(ox, oy, r.w, r.h);
    if (tl >= REVEAL) for (const pin of e.pins) drawPin(win, pin, ox, oy);
    // (its frame, a heavy ink line round it, at once; its picture inked in over the paper, in a dither, as it comes in)
    p.rect(r.x - 2, r.y - 2, r.w + 4, r.h + 4, INK);
    const v = tl / REVEAL;
    for (let y = 0; y < r.h; y++) {
      for (let x = 0; x < r.w; x++) {
        const i = (y * r.w + x) * 4;
        const j = ((r.y + y) * p.w + r.x + x) * 4;
        if (v < 1 && hash(x >> 1, y >> 1, 4242) >= v) {
          p.d[j] = 0xe6;
          p.d[j + 1] = 0xdc;
          p.d[j + 2] = 0xc4;
          p.d[j + 3] = 255;
          continue;
        }
        p.d[j] = win.d[i];
        p.d[j + 1] = win.d[i + 1];
        p.d[j + 2] = win.d[i + 2];
        p.d[j + 3] = 255;
      }
    }
  }
  for (const q of sp.pagePins) if (t >= q.at) drawPin(p, q.pin, 0, 0);
  return p;
}

/** A page turning: the old spread's right page folding over onto its left, the new spread's left page coming down. */
function turnAt(a: Px, b: Px, u: number): Px {
  const p = new Px(a.w, a.h);
  // (under it: the old left page, the new right page)
  p.blit(a.crop(0, 0, PW, PH), 0, 0);
  p.blit(b.crop(PW, 0, PW, PH), PW, 0);
  const c = Math.cos(Math.PI * ease(u));
  const w = Math.round(Math.abs(c) * PW);
  if (w < 1) return p;
  const src = c > 0 ? a : b;
  const sx0 = c > 0 ? PW : 0;
  const shade = 0.25 + 0.75 * Math.abs(c);
  for (let x = 0; x < w; x++) {
    // (the turning page squeezed toward the spine, darker as it stands up edge on)
    const dx = c > 0 ? PW + x : PW - w + x;
    const sx = sx0 + Math.floor((x / w) * PW);
    for (let y = 0; y < PH; y++) {
      const i = (y * src.w + sx) * 4;
      const j = (y * p.w + dx) * 4;
      p.d[j] = src.d[i] * shade;
      p.d[j + 1] = src.d[i + 1] * shade;
      p.d[j + 2] = src.d[i + 2] * shade;
      p.d[j + 3] = 255;
    }
  }
  // (its outer edge, inked)
  const ex = c > 0 ? PW + w - 1 : PW - w;
  for (let y = 0; y < PH; y++) p.set(ex, y, INK);
  return p;
}

// FILM it
const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${PW * 2}x${PH}`, '-r', String(FPS), '-i', '-',
  '-vf', `scale=iw*${SCALE}:ih*${SCALE}:flags=neighbor`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  OUT,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const write = (buf: Uint8Array): Promise<void> =>
  new Promise((ok) => {
    if (ff.stdin.write(buf)) ok();
    else ff.stdin.once('drain', () => ok());
  });

async function main(): Promise<void> {
  const frames = Math.ceil(TOTAL * FPS);
  const t0 = Date.now();
  const last = spreads[spreads.length - 1];
  let held: Px | null = null;
  let heldK = -1;
  const endOf = (sp: Spread): Px => {
    if (heldK !== sp.k || !held) {
      held = spreadAt(sp, sp.end);
      heldK = sp.k;
    }
    return held;
  };
  for (let f = 0; f < frames; f++) {
    const t = f / FPS;
    let frame: Px;
    if (t >= last.end) {
      // (the end: the last spread, darkening away)
      const fade = Math.min(1, (t - last.end) / 1.0);
      frame = endOf(last).clone();
      for (let i = 0; i < frame.d.length; i += 4) {
        frame.d[i] *= 1 - fade;
        frame.d[i + 1] *= 1 - fade;
        frame.d[i + 2] *= 1 - fade;
      }
    } else {
      const sp = spreads.find((q) => t < q.end + TURN) ?? last;
      frame = t < sp.end ? spreadAt(sp, t) : turnAt(endOf(sp), paperSpread(), (t - sp.end) / TURN);
    }
    await write(new Uint8Array(frame.d.buffer, frame.d.byteOffset, frame.d.byteLength).slice());
    if (FRAMES && f % Math.round(FPS / 2) === 0) writePng(frame, `${FRAMES}/f${String(f).padStart(5, '0')}.png`, 1);
    if (f % (FPS * 5) === 0) console.log('frame', f, '/', frames, Math.round((Date.now() - t0) / 1000), 's');
  }
  ff.stdin.end();
  await new Promise<void>((ok) => ff.on('close', () => ok()));
  console.log('wrote', OUT, Math.round((Date.now() - t0) / 1000), 's');
}
void main();
