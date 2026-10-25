// The opening played as a film, to look at: its scenes (art/opening.ts SCENES), each a big shot filling the screen with
// the camera moving slowly across it, its smaller boxes sliding in over it one at a time, closer shots; the fire, smoke,
// lights and the hero's stroke moving (liveBox); one scene giving way to the next. Written to an MP4 by ffmpeg.
//   tsx tools/opening_film.ts <out.mp4> [fps=15] [scenes, e.g. 0-6] [scale=2]
// Every box is baked once into BAKES (default ./bakes; tools/opening_bake.ts, two at a time) and kept there: REBAKE=all,
// or a list of boxes (p3b1,p7b1), bakes those again. With FRAMES=<dir>, every half second's frame is written there too.
// @ts-ignore
import { spawn } from 'node:child_process';
// @ts-ignore
import { existsSync, mkdirSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { SCENES, SCREEN_W, SCREEN_H, DRIFT, bigSize, boxNamed, liveBox, drawPin, restoreBake } from '../src/art/opening';
import type { BoxDef, Inset, Pin, Scene } from '../src/art/opening';
import { INK, hash, captionSize } from '../src/art/comic';
import { readBake } from './opening_bake';
import { writePng } from './px_png';

// @ts-ignore
const argv: string[] = process.argv;
// @ts-ignore
const env: Record<string, string | undefined> = process.env;
const OUT = argv[2] ?? 'opening.mp4';
const FPS = Number(argv[3] ?? 15);
const [S0, S1] = (argv[4] ?? `0-${SCENES.length - 1}`).split('-').map(Number);
const SCALE = Number(argv[5] ?? 2);
const BAKES = env.BAKES ?? 'bakes';
const REBAKE = (env.REBAKE ?? '').split(',').filter(Boolean);
const FRAMES = env.FRAMES;
mkdirSync(BAKES, { recursive: true });
if (FRAMES) mkdirSync(FRAMES, { recursive: true });

const SW = SCREEN_W;
const SH = SCREEN_H;
/** Reading time per letter of a caption; an inset's hold; the look at a scene after its last inset; an inset's slide. */
const READ = 0.055;
const HOLD = 2.6;
const TAIL = 1.2;
const SLIDE = 0.3;
/** How long each way from one scene to the next takes. */
const INTO = { dissolve: 0.6, flash: 0.8, cut: 0 } as const;
/** Which way each inset's picture drifts in its frame: from (x0, y0) to (x1, y1), shares of its room to move. */
const DRIFTS: readonly [number, number, number, number][] = [[0, 0.5, 1, 0.5], [1, 0, 0, 1], [0.5, 1, 0.5, 0], [1, 0.5, 0, 0.5], [0, 0, 1, 1]];

// BAKE what is not baked yet
interface Job { id: string; w: number; h: number; drift: number; file: string }
const jobs = new Map<string, Job>();
function job(id: string, w: number, h: number, drift: number): Job {
  const file = `${BAKES}/${id}_${Math.round(w * drift)}x${Math.round(h * drift)}.bake`;
  if (!jobs.has(file)) jobs.set(file, { id, w, h, drift, file });
  return jobs.get(file)!;
}
const scenes = SCENES.slice(S0, S1 + 1);
const plans = scenes.map((sc) => {
  const bs = bigSize(sc);
  return {
    sc,
    big: job(sc.big, bs.w, bs.h, 1),
    insets: sc.insets.map((ins) => {
      const { r } = boxNamed(ins.box);
      return { ins, job: job(ins.box, Math.round(r.w * ins.scale), Math.round(r.h * ins.scale), DRIFT), w: Math.round(r.w * ins.scale), h: Math.round(r.h * ins.scale) };
    }),
  };
});

async function bakeAll(): Promise<void> {
  const todo = [...jobs.values()].filter((j) => !existsSync(j.file) || REBAKE.includes('all') || REBAKE.includes(j.id));
  // (the biggest first, two at a time)
  todo.sort((a, b) => b.w * b.h - a.w * a.h);
  const run = (j: Job): Promise<void> =>
    new Promise((ok, no) => {
      const c = spawn('npx', ['--no-install', 'tsx', 'tools/opening_bake.ts', j.id, String(j.w), String(j.h), String(j.drift), j.file], { stdio: ['ignore', 'inherit', 'inherit'] });
      c.on('close', (code: number) => (code === 0 ? ok() : no(new Error(`bake ${j.id} failed`))));
    });
  const lanes = [0, 1].map(async () => {
    for (let j = todo.shift(); j; j = todo.shift()) await run(j);
  });
  await Promise.all(lanes);
}

interface Baked { img: Px; pins: Pin[] }
const baked = new Map<string, Baked>();
function load(j: Job): Baked {
  if (!baked.has(j.file)) {
    const { img, pins, state } = readBake(j.file);
    restoreBake(state);
    baked.set(j.file, { img, pins });
  }
  return baked.get(j.file)!;
}

// THE TIMES: when each scene starts and ends, when each inset comes in, and goes
interface Shown { ins: Inset; b: BoxDef; img: Px; pins: Pin[]; w: number; h: number; at: number; leave: number; drift: readonly [number, number, number, number] }
interface Timed { sc: Scene; b: BoxDef; img: Px; pins: Pin[]; start: number; end: number; insets: Shown[] }

function lay(): Timed[] {
  const out: Timed[] = [];
  let clock = 0;
  let n = 0;
  for (const pl of plans) {
    const sc = pl.sc;
    const big = load(pl.big);
    const start = clock;
    let cursor = start + sc.lead + (sc.say?.length ?? 0) * READ;
    const insets: Shown[] = [];
    for (const pi of pl.insets) {
      const { b } = boxNamed(pi.ins.box);
      const bk = load(pi.job);
      insets.push({ ins: pi.ins, b, img: bk.img, pins: bk.pins, w: pi.w, h: pi.h, at: cursor, leave: Infinity, drift: DRIFTS[n++ % DRIFTS.length] });
      if (pi.ins.replaces) {
        const old = insets.find((q) => q.ins.box === pi.ins.replaces);
        if (old) old.leave = cursor;
      }
      cursor += HOLD + (b.say?.length ?? 0) * READ;
    }
    const end = cursor + (insets.length ? TAIL : 0);
    out.push({ sc, b: boxNamed(sc.big).b, img: big.img, pins: big.pins, start, end, insets });
    clock = end;
  }
  return out;
}

const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
const ease = (u: number): number => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u, 0, 1));
const outBack = (u: number): number => {
  const c = 1.4;
  const x = clamp(u, 0, 1) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** Where the camera is on a scene's big shot at `u` of its time: a share of its room across, and down. */
function panAt(sc: Scene, u: number): [number, number] {
  const k = sc.pan;
  if (u <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 1; i < k.length; i++) {
    if (u <= k[i][0]) {
      const v = ease((u - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
      return [k[i - 1][1] + (k[i][1] - k[i - 1][1]) * v, k[i - 1][2] + (k[i][2] - k[i - 1][2]) * v];
    }
  }
  const l = k[k.length - 1];
  return [l[1], l[2]];
}

/** A picture laid on the screen at (x, y), in its frame: a line of ink, a band of paper, a line of ink. */
function framed(p: Px, q: Px, x: number, y: number): void {
  p.rect(x - 5, y - 5, q.w + 10, q.h + 10, INK);
  p.rect(x - 4, y - 4, q.w + 8, q.h + 8, '#efe4c4');
  p.rect(x - 2, y - 2, q.w + 4, q.h + 4, INK);
  for (let j = 0; j < q.h; j++) {
    const yy = y + j;
    if (yy < 0 || yy >= p.h) continue;
    const a = Math.max(0, -x);
    const b = Math.min(q.w, p.w - x);
    if (b <= a) continue;
    p.d.set(q.d.subarray((j * q.w + a) * 4, (j * q.w + b) * 4), (yy * p.w + x + a) * 4);
  }
}

/** A scene at moment `t` (seconds into the film): its big shot where the camera is, its words, its insets. */
function sceneAt(s: Timed, t: number): Px {
  const tl = t - s.start;
  const [fx, fy] = panAt(s.sc, tl / (s.end - s.start));
  let ox = fx * (s.img.w - SW);
  let oy = fy * (s.img.h - SH);
  if (s.b.jolt !== undefined) {
    const tj = tl - s.b.jolt;
    if (tj >= 0 && tj < 0.4) {
      const A = 7 * (1 - tj / 0.4);
      ox += A * Math.sin(tj * 80);
      oy += A * 0.7 * Math.cos(tj * 61);
    }
  }
  ox = Math.round(clamp(ox, 0, s.img.w - SW));
  oy = Math.round(clamp(oy, 0, s.img.h - SH));
  const p = liveBox(s.b, s.img, tl).crop(ox, oy, SW, SH);
  // (the big shot's words: a caption stays where it is on the screen; a balloon goes with its speaker, over his mouth, and
  // is gone once the first closer shot comes in: his line is said, and no box is laid over it)
  const spoken = s.insets.length > 0 && t >= s.insets[0].at;
  if (tl > 0.5) {
    if (s.sc.ownWords !== false) {
      for (const pin of s.pins) {
        if (pin.tail && spoken) continue;
        if (!pin.tail) {
          drawPin(p, { ...pin, x: clamp(pin.x, 12, SW - 200), y: clamp(pin.y, 12, SH - 40) }, 0, 0);
          continue;
        }
        const [bw, bh] = captionSize(pin.say, pin.maxW);
        const tx = pin.tail[0] - ox;
        const ty = pin.tail[1] - oy;
        // (off to the speaker's side, clear of what he holds up)
        const bx = Math.round(clamp(tx - bw - 40, 12, SW - bw - 16));
        // (it goes off the screen with him: kept from the top edge only)
        const by = Math.round(Math.max(12, ty - bh - 40));
        if (by > SH) continue;
        drawPin(p, { say: pin.say, x: bx, y: by, maxW: pin.maxW, tail: [tx, ty] }, 0, 0);
      }
    }
    if (s.sc.say) drawPin(p, { say: s.sc.say, x: 16, y: 14, maxW: 240 }, 0, 0);
  }
  for (const q of s.insets) {
    const ti = t - q.at;
    if (ti < 0 || t > q.leave + SLIDE) continue;
    const mx = q.img.w - q.w;
    const my = q.img.h - q.h;
    const u = ease((t - q.at) / (s.end - q.at));
    const ix = Math.round(mx * (q.drift[0] + (q.drift[2] - q.drift[0]) * u));
    const iy = Math.round(my * (q.drift[1] + (q.drift[3] - q.drift[1]) * u));
    const win = liveBox(q.b, q.img, ti).crop(ix, iy, q.w, q.h);
    if (ti > SLIDE) for (const pin of q.pins) drawPin(win, pin, ix, iy);
    // (sliding in from its edge, over-running a touch and settling; sliding out the same way when another takes its place)
    const off: [number, number] =
      q.ins.from === 'left' ? [-q.w - 16, q.ins.y] : q.ins.from === 'right' ? [SW + 16, q.ins.y] : q.ins.from === 'bottom' ? [q.ins.x, SH + 16] : [q.ins.x, -q.h - 16];
    const e = outBack(ti / SLIDE);
    const g = t > q.leave ? ease((t - q.leave) / SLIDE) : 0;
    const x = off[0] + (q.ins.x - off[0]) * e + (off[0] - q.ins.x) * g;
    const y = off[1] + (q.ins.y - off[1]) * e + (off[1] - q.ins.y) * g;
    framed(p, win, Math.round(x), Math.round(y));
  }
  return p;
}

function dim(p: Px, k: number): Px {
  for (let i = 0; i < p.d.length; i += 4) {
    p.d[i] *= k;
    p.d[i + 1] *= k;
    p.d[i + 2] *= k;
  }
  return p;
}

async function main(): Promise<void> {
  const tb = Date.now();
  await bakeAll();
  console.log('bakes ready', Math.round((Date.now() - tb) / 1000), 's');
  const timed = lay();
  const last = timed[timed.length - 1];
  const TOTAL = last.end + 1.4;
  const frames = Math.ceil(TOTAL * FPS);
  console.log('film', TOTAL.toFixed(1), 's,', frames, 'frames');
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${SW}x${SH}`, '-r', String(FPS), '-i', '-',
    '-vf', `scale=iw*${SCALE}:ih*${SCALE}:flags=neighbor`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    OUT,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = (buf: Uint8Array): Promise<void> =>
    new Promise((ok) => {
      if (ff.stdin.write(buf)) ok();
      else ff.stdin.once('drain', () => ok());
    });
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    const t = f / FPS;
    let i = 0;
    while (i + 1 < timed.length && timed[i + 1].start <= t) i++;
    const s = timed[i];
    let frame = sceneAt(s, Math.min(t, s.end + 0.6));
    const into = INTO[s.sc.into];
    const u = into > 0 ? (t - s.start) / into : 1;
    if (i > 0 && u < 1) {
      if (s.sc.into === 'dissolve') {
        const a = sceneAt(timed[i - 1], t);
        for (let y = 0, j = 0; y < SH; y++) {
          for (let x = 0; x < SW; x++, j += 4) {
            if (hash(x >> 1, y >> 1, 4243) < u) continue;
            frame.d[j] = a.d[j];
            frame.d[j + 1] = a.d[j + 1];
            frame.d[j + 2] = a.d[j + 2];
          }
        }
      } else {
        // (a flash: pure white a moment, then the scene coming up out of it, slowly at first)
        const v = clamp((t - s.start - 0.2) / (into - 0.2), 0, 1) ** 1.6;
        for (let j = 0; j < frame.d.length; j += 4) {
          frame.d[j] = 255 + (frame.d[j] - 255) * v;
          frame.d[j + 1] = 255 + (frame.d[j + 1] - 255) * v;
          frame.d[j + 2] = 255 + (frame.d[j + 2] - 255) * v;
        }
      }
    }
    if (t < 0.8) frame = dim(frame, t / 0.8);
    if (t > last.end) frame = dim(frame, 1 - clamp((t - last.end) / 1.2, 0, 1));
    await write(new Uint8Array(frame.d.buffer, frame.d.byteOffset, frame.d.byteLength).slice());
    if (FRAMES && f % Math.round(FPS / 2) === 0) writePng(frame, `${FRAMES}/f${String(f).padStart(5, '0')}.png`, 1);
    if (f % (FPS * 5) === 0) console.log('frame', f, '/', frames, Math.round((Date.now() - t0) / 1000), 's');
  }
  ff.stdin.end();
  await new Promise<void>((ok) => ff.on('close', () => ok()));
  console.log('wrote', OUT, Math.round((Date.now() - t0) / 1000), 's');
}
void main();
