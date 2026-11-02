// THE GRAPHICS CHIP'S MARCH, HELD AGAINST THE CPU'S, FRAME BY FRAME, IN A BROWSER (tools/gpu_sculpt_check.mjs drives it;
// docs/mockups/gpu_sculpt/README.md). A DEV TOOL; NOTHING OF THE GAME IMPORTS IT.
//
// The page starts two workers from its own script, as the game's side painter does (render/painter.ts): one paints with the
// switch off (the CPU, exactly as now), one with it on (the chip, through OffscreenCanvas and WebGL2, as the side painter
// would). A worker of its own for each, as some of the art keeps what it has painted where every set can find it. Each is
// asked for the same frame in turn (never both at once, so each frame's time is its own), and the page compares the two
// pictures pixel by pixel.

import { CHIP_SEEN, GPU_ROUND2, GPU_SCULPT, GPU_SCULPT_TEST, chipReady, chipSeenReset } from './gpu_sculpt';
import { listsOf } from './gpu_lists';
import type { FrameList, Who } from './gpu_lists';
import type { Sprite } from '../engine/px';
import { INK } from '../art/kit';
import { rgba } from '../engine/px';

const WORKER_MARK = '__GPU_CHECK_WORKER__';
const self_ = globalThis as unknown as {
  [WORKER_MARK]?: boolean;
  postMessage(m: unknown, t?: Transferable[]): void;
  onmessage: ((e: MessageEvent) => void) | null;
};

// ---------------------------------------------------------------------------------------------
// THE WORKER'S SIDE

if (self_[WORKER_MARK]) {
  const lists = new Map<Who, FrameList[]>();
  const seen = new Map<Sprite, string>();
  const listsFor = (who: Who): FrameList[] => {
    let l = lists.get(who);
    if (!l) lists.set(who, (l = listsOf(who)));
    return l;
  };
  self_.onmessage = (e: MessageEvent) => {
    const m = e.data as { t: string; gpu?: boolean; who?: Who; li?: number; i?: number; pixels?: boolean };
    try {
      if (m.t === 'init') {
        GPU_SCULPT.on = !!m.gpu;
        // (this Chromium's WebGL2 is SwiftShader, a software stand-in the game itself would not use: measured all the same)
        GPU_SCULPT_TEST.allowSlow = true;
        GPU_SCULPT_TEST.profile = !!(m as { profile?: boolean }).profile;
        // (ROUND 1: every saving of round 2 off; or some of them, as asked)
        const r2 = (m as { round2?: Partial<typeof GPU_ROUND2> | false }).round2;
        if (r2 === false) Object.assign(GPU_ROUND2, { cullSkip: false, raySkip: false, hop: false, hopBig: false, keep: false, oneGo: false });
        else if (r2) Object.assign(GPU_ROUND2, r2);
        const cell = (m as { cell?: { ts: number; dt: number } }).cell;
        if (cell) GPU_SCULPT_TEST.cell = cell;
        const ready = m.gpu ? chipReady() : false;
        self_.postMessage({ t: 'ready', chip: ready, why: GPU_SCULPT_TEST.why });
      } else if (m.t === 'lists') {
        const t0 = performance.now();
        const ls = listsFor(m.who as Who);
        self_.postMessage({ t: 'lists', names: ls.map((l) => l.name), lengths: ls.map((l) => l.frames.length), ms: performance.now() - t0 });
      } else if (m.t === 'frame') {
        const ls = listsFor(m.who as Who);
        const l = ls[m.li as number];
        const marched = GPU_SCULPT_TEST.marched;
        const fell = GPU_SCULPT_TEST.fellBack;
        chipSeenReset();
        const t0 = performance.now();
        const s = l.frames[m.i as number];
        const ms = performance.now() - t0;
        const key = `${m.li}:${m.i}`;
        const was = seen.get(s);
        if (!was) seen.set(s, key);
        const out: Record<string, unknown> = { t: 'frame', ms, same: was ?? null, marched: GPU_SCULPT_TEST.marched - marched, parts: { ...GPU_SCULPT_TEST.ms }, seen: { ...CHIP_SEEN, ms: { ...CHIP_SEEN.sum } }, fell: GPU_SCULPT_TEST.fellBack - fell, why: GPU_SCULPT_TEST.why, w: s.w, h: s.h, ax: s.ax, ay: s.ay };
        if (!was || m.pixels) {
          const cv = s.img as unknown as OffscreenCanvas;
          const g = cv.getContext('2d') as OffscreenCanvasRenderingContext2D;
          const im = g.getImageData(0, 0, cv.width, cv.height);
          out.pw = cv.width;
          out.ph = cv.height;
          out.data = im.data.buffer;
          self_.postMessage(out, [im.data.buffer]);
        } else self_.postMessage(out);
      }
    } catch (err) {
      self_.postMessage({ t: 'error', why: String((err as Error)?.stack ?? err) });
    }
  };
}

// ---------------------------------------------------------------------------------------------
// THE PAGE'S SIDE

/** What stands before the script in a worker (as render/painter.ts's prelude): a canvas is one that needs no page. */
const PRELUDE = `self.${WORKER_MARK} = true;
self.window = self;
self.document = {
  currentScript: null,
  createElement: function (n) {
    if (n === 'canvas') return new OffscreenCanvas(1, 1);
    throw new Error('no ' + n);
  },
  addEventListener: function () {},
  removeEventListener: function () {},
};
`;

interface Reply {
  t: string;
  [k: string]: unknown;
}
class Lane {
  w: Worker;
  private waiting: ((r: Reply) => void) | null = null;
  constructor(src: string) {
    this.w = new Worker(URL.createObjectURL(new Blob([PRELUDE, src], { type: 'text/javascript' })));
    this.w.onmessage = (e) => {
      const r = this.waiting;
      this.waiting = null;
      r?.(e.data as Reply);
    };
    this.w.onerror = (e) => {
      const r = this.waiting;
      this.waiting = null;
      r?.({ t: 'error', why: e.message });
    };
  }
  ask(m: unknown): Promise<Reply> {
    return new Promise((res) => {
      this.waiting = res;
      this.w.postMessage(m);
    });
  }
}

/** How two pictures of a frame differ: the figure's pixels, those that differ, and where (its edge, its ink, a tone). */
export interface Diff {
  fig: number;
  diff: number;
  edge: number;
  ink: number;
  tone: number;
  sizeSame: boolean;
}
const ink = rgba(INK);
function compare(a: Uint8ClampedArray, b: Uint8ClampedArray, w: number, h: number, mark?: Uint8Array): Diff {
  let fig = 0;
  let diff = 0;
  let edge = 0;
  let inkN = 0;
  let tone = 0;
  const isInk = (d: Uint8ClampedArray, i: number): boolean => d[i + 3] > 0 && d[i] === ink[0] && d[i + 1] === ink[1] && d[i + 2] === ink[2];
  for (let k = 0, i = 0; k < w * h; k++, i += 4) {
    if (a[i + 3] > 0) fig++;
    if (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2] && a[i + 3] === b[i + 3]) continue;
    diff++;
    let kind: number;
    if ((a[i + 3] > 0) !== (b[i + 3] > 0)) kind = 1;
    else if (isInk(a, i) !== isInk(b, i)) kind = 2;
    else kind = 3;
    if (kind === 1) edge++;
    else if (kind === 2) inkN++;
    else tone++;
    if (mark) mark[k] = kind;
  }
  return { fig, diff, edge, ink: inkN, tone, sizeSame: true };
}

let CPU: Lane | null = null;
let GPU: Lane | null = null;

const enc = (buf: ArrayBuffer): string => {
  const u = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
};

const SRC = typeof document !== 'undefined' ? (document.currentScript?.textContent ?? '') : '';
if (!self_[WORKER_MARK] && typeof window !== 'undefined') {
  (window as unknown as { GPUCHECK: unknown }).GPUCHECK = {
    async start(profile = false, round2: unknown = undefined, cell: unknown = undefined): Promise<unknown> {
      CPU = new Lane(SRC);
      GPU = new Lane(SRC);
      const a = await CPU.ask({ t: 'init', gpu: false });
      const b = await GPU.ask({ t: 'init', gpu: true, profile, round2, cell });
      return { cpu: a, gpu: b };
    },
    async lists(who: Who): Promise<unknown> {
      const a = (await (CPU as Lane).ask({ t: 'lists', who })) as Reply;
      const b = (await (GPU as Lane).ask({ t: 'lists', who })) as Reply;
      return { names: a.names, lengths: a.lengths, same: JSON.stringify(a.names) === JSON.stringify(b.names), msCpu: a.ms, msGpu: b.ms };
    },
    /** One frame painted both ways (the CPU first, then the chip), compared; with `pixels`, both pictures too (base64 RGBA). */
    async frame(who: Who, li: number, i: number, pixels = false): Promise<unknown> {
      const a = (await (CPU as Lane).ask({ t: 'frame', who, li, i, pixels })) as Reply;
      if (a.t !== 'frame') return a;
      if (a.same && !pixels) return { same: a.same, ms: [a.ms, 0] };
      const b = (await (GPU as Lane).ask({ t: 'frame', who, li, i, pixels })) as Reply;
      if (b.t !== 'frame') return b;
      const pw = a.pw as number;
      const ph = a.ph as number;
      const res: Record<string, unknown> = { ms: [a.ms, b.ms], parts: b.parts, seen: b.seen, marched: b.marched, fell: b.fell, why: b.why, w: a.w, h: a.h, ax: a.ax, ay: a.ay, pw, ph };
      if (a.w !== b.w || a.h !== b.h || a.ax !== b.ax || a.ay !== b.ay || pw !== b.pw || ph !== b.ph) {
        res.diff = { fig: 0, diff: -1, edge: 0, ink: 0, tone: 0, sizeSame: false };
        return res;
      }
      const da = new Uint8ClampedArray(a.data as ArrayBuffer);
      const db = new Uint8ClampedArray(b.data as ArrayBuffer);
      const mark = pixels ? new Uint8Array(pw * ph) : undefined;
      res.diff = compare(da, db, pw, ph, mark);
      if (pixels) {
        res.cpu = enc(a.data as ArrayBuffer);
        res.gpu = enc(b.data as ArrayBuffer);
        res.mark = enc((mark as Uint8Array).buffer as ArrayBuffer);
      }
      return res;
    },
  };
}
