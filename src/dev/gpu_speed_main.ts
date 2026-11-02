// THE GRAPHICS CHIP, TRIED ON THE OWNER'S OWN PHONE (dist/gpu_speed.html; docs/mockups/gpu_sculpt/README.md). A DEV TOOL;
// NOTHING OF THE GAME IMPORTS IT.
//
// ROUND 2 (the art chat's helper, 1 Nov 2026). Opened on any phone or computer, it paints some frames of the Warlock (a man
// standing, his bolt, the change), the demon (standing, its rake), the Tinkerer and the Brawler three ways, and shows the
// times in big plain words: NOW (the way the game paints them now, on the CPU), ROUND 1 (on the graphics chip as he tried it,
// 1 Nov) and ROUND 2 (on the chip, as it is now); the Warrior's own (no chip) beside them, as the mark to reach. Then where a
// round 2 frame's time goes, on this device; and last, whether the game's side painter (a worker) can use the chip.

import { CHIP_SEEN, GPU_ROUND2, GPU_SCULPT, GPU_SCULPT_TEST, chipName, chipReady, chipSeenReset, chipTimes } from './gpu_sculpt';
import { listsOf } from './gpu_lists';
import type { FrameList, Who } from './gpu_lists';

// (measured even where the chip is a software stand-in or slower than the CPU: the page says whether the game would use it)
GPU_SCULPT_TEST.allowSlow = true;

const WORKER_MARK = '__GPU_SPEED_WORKER__';
const G = globalThis as unknown as { [WORKER_MARK]?: boolean; postMessage(m: unknown): void; onmessage: ((e: MessageEvent) => void) | null };

/** What is painted: a list, and the frames of it timed (its first painted before, untimed: it makes the move). */
interface Item {
  label: string;
  who: Who;
  name: string;
  frames: number[];
}
const SET: Item[] = [
  { label: 'The Warlock standing', who: 'warlock', name: 'warlock:dungeon/front.idle', frames: [16, 40] },
  { label: 'His bolt', who: 'warlock', name: 'warlock:dungeon/front.clips.attack.frames', frames: [12, 24] },
  { label: 'The change', who: 'warlock', name: 'warlock:dungeon/front.clips.change.frames', frames: [24, 40] },
  { label: 'The demon standing', who: 'warlock', name: 'warlock:demon/front.idle', frames: [16, 32] },
  { label: 'Its rake', who: 'warlock', name: 'warlock:demon/front.clips.attack.frames', frames: [10, 14] },
  { label: 'The Tinkerer standing', who: 'tinkerer', name: 'tinkerer:dungeon/front.idle', frames: [16, 40] },
  { label: 'The Brawler standing', who: 'brawler', name: 'brawler:dungeon/front.idle', frames: [16, 40] },
];
const WARRIOR: Item = { label: 'The Warrior standing', who: 'warrior', name: 'warrior:dungeon/front.idle', frames: [4, 10] };

/** The ways a frame is painted: now (the CPU), the chip as in round 1, the chip as it is now, and round 2 with its saving not kept. */
type Way = 'now' | 'round1' | 'round2' | 'hop';
const ROUND2_AS_MADE = { ...GPU_ROUND2 };
function setWay(w: Way): void {
  GPU_SCULPT.on = w !== 'now';
  if (w === 'round1') Object.assign(GPU_ROUND2, { cullSkip: false, raySkip: false, hop: false, hopBig: false, keep: false, oneGo: false });
  else if (w === 'hop') Object.assign(GPU_ROUND2, { ...ROUND2_AS_MADE, hopBig: true });
  else Object.assign(GPU_ROUND2, ROUND2_AS_MADE);
}

/**
 * Each way paints the frames one on from the way before (NOW the listed ones, ROUND 1 the next, ...): the Tinkerer and the
 * Brawler keep a frame painted once for good (their standing and running are made once for every set), so a frame asked for
 * a second time would cost nothing; a frame next to it costs the same as it.
 */
const STEP: Record<Way, number> = { now: 0, round1: 1, round2: 2, hop: 3 };

/** The times of an item's frames painted one way (each list made afresh, so nothing is painted already). */
function paintItem(it: Item, w: Way): number[] {
  setWay(w);
  try {
    const l = listsOf(it.who).find((x) => x.name === it.name) as FrameList;
    void l.frames[0];
    return it.frames.map((f) => {
      const i = Math.min(l.frames.length - 1, f + STEP[w]);
      const t0 = performance.now();
      void l.frames[i];
      return performance.now() - t0;
    });
  } finally {
    setWay('now');
    GPU_SCULPT.on = false;
  }
}

/** One frame of an item painted on the chip as it is now, and what its parts took (the chip's own work waited for, pass by pass, when `profile`). */
function splitOf(it: Item, profile: boolean): { all: number; ms: typeof CHIP_SEEN.ms; draws: number; readBytes: number; box: [number, number]; solids: number } {
  setWay('round2');
  GPU_SCULPT_TEST.profile = profile;
  try {
    const l = listsOf(it.who).find((x) => x.name === it.name) as FrameList;
    void l.frames[0];
    chipSeenReset();
    const t0 = performance.now();
    void l.frames[it.frames[0] + 1];
    const all = performance.now() - t0;
    return { all, ms: { ...CHIP_SEEN.sum }, draws: CHIP_SEEN.draws, readBytes: CHIP_SEEN.readBytes, box: [...CHIP_SEEN.box] as [number, number], solids: CHIP_SEEN.solids };
  } finally {
    GPU_SCULPT_TEST.profile = false;
    setWay('now');
  }
}

// THE WORKER'S SIDE: a frame of the man and one of the demon painted on the chip, as the side painter would
if (G[WORKER_MARK]) {
  G.onmessage = () => {
    try {
      const ready = chipReady();
      const which: Item[] = [{ ...SET[0], frames: [16] }, { ...SET[3], frames: [16] }];
      const t = ready ? which.map((it) => paintItem(it, 'round2')[0]) : [];
      G.postMessage({ ready, why: GPU_SCULPT_TEST.why || (GPU_SCULPT_TEST.fellBack ? 'it fell back' : '') || (ready ? '' : 'no chip, and no reason given'), name: chipName(), t, marched: GPU_SCULPT_TEST.marched });
    } catch (e) {
      G.postMessage({ ready: false, why: String((e as Error)?.message ?? e), t: [] });
    }
  };
}

// THE PAGE'S SIDE
const SRC = typeof document !== 'undefined' ? (document.currentScript?.textContent ?? '') : '';
const PRELUDE = `self.${WORKER_MARK} = true;
self.window = self;
self.document = { currentScript: null, createElement: function (n) { if (n === 'canvas') return new OffscreenCanvas(1, 1); throw new Error('no ' + n); }, addEventListener: function () {}, removeEventListener: function () {} };
`;

const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const ms = (x: number): string => (x >= 100 ? Math.round(x).toLocaleString('en-GB') : x.toFixed(x >= 10 ? 0 : 1)) + ' ms';
/** A frame's time, or a dash where it was painted already (the Tinkerer and the Brawler keep their standing once painted). */
const msOr = (x: number): string => (x > 0.05 ? ms(x) : '— (painted already)');
const tick = (n = 30): Promise<void> => new Promise((r) => setTimeout(r, n));
/** How a time `b` stands to a time `a` (`than`: what `a` is). */
const than = (a: number, b: number, what: string): string =>
  !(a > 0.05 && b > 0.05) ? `(a frame painted already: not timed against ${what})` : b <= a ? `${(a / b).toFixed(1)} times as fast as ${what}` : `${(b / a).toFixed(1)} times slower than ${what}`;

async function page(): Promise<void> {
  document.title = 'Graphics chip test, round 2';
  const st = document.createElement('style');
  st.textContent = `:root{color-scheme:dark;--bg:#0d0b14;--fg:#ece6dc;--dim:#9a92a6;--good:#7fe0b0;--bad:#f0a070;--card:#1a1624}
body{margin:0;background:var(--bg);color:var(--fg);font:20px/1.35 -apple-system,system-ui,sans-serif;padding:18px 16px 40px;overflow-wrap:anywhere}
h1{font-size:30px;margin:0 0 6px}h2{font-size:22px;margin:26px 0 4px}.dim{color:var(--dim);font-size:17px}.row{margin:14px 0;padding:12px 14px;border-radius:12px;background:var(--card)}
.big{font-size:30px;font-weight:700;margin:4px 0}.way{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:24px;margin:2px 0}.way b{font-size:26px;white-space:nowrap}
.part{font-size:18px}.part b{font-size:20px}
.good{color:var(--good)}.bad{color:var(--bad)}.small{font-size:15px;color:var(--dim)}
table{border-collapse:collapse;font-size:15px;color:var(--dim);width:100%}td{padding:2px 4px;vertical-align:top}td:last-child{text-align:right;white-space:nowrap}
button{font:inherit;font-size:22px;padding:12px 20px;border-radius:12px;border:0;background:#3a3150;color:var(--fg);margin-top:10px}`;
  document.head.appendChild(st);
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width,initial-scale=1';
  document.head.appendChild(meta);
  const root = document.body;
  root.innerHTML = '<h1>Graphics chip test, round 2</h1><div class="dim">Paints some frames of the Warlock, the demon, the Tinkerer and the Brawler three ways and shows how long each takes: NOW (the way the game paints them now), ROUND 1 (on the graphics chip, as you tried it) and ROUND 2 (on the chip, made faster). About a minute; keep the screen on.</div>';
  const say = (html: string, cls = 'row', into: HTMLElement = root): HTMLDivElement => {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    into.appendChild(d);
    return d;
  };
  await tick();
  const ready = chipReady();
  const seen = GPU_SCULPT_TEST.seen;
  const soft = /swiftshader|llvmpipe|softpipe|lavapipe|software|basic render/i.test(seen.name);
  const slow = soft || seen.chipMs > 1.5 * seen.cpuMs + 2;
  say(
    !ready
      ? `<div class="big bad">Graphics chip: no</div><div class="dim">${GPU_SCULPT_TEST.why || 'no WebGL2'}: the game would paint as it does now.</div>`
      : slow
        ? `<div class="big bad">Graphics chip: too slow</div><div class="dim">${chipName() || 'WebGL2'}${soft ? ' is the CPU pretending to be a graphics chip' : ' is slower than the CPU here'}: the game would not use it and would paint as it does now. Timed all the same below.</div>`
        : `<div class="big good">Graphics chip: yes</div><div class="dim">${chipName() || 'WebGL2'}: the game would use it.</div>`,
  );
  const status = say('Painting…', 'dim');
  await tick();
  // the Warrior, painted his own way: the mark
  status.textContent = 'Painting the Warrior…';
  await tick();
  const war = avg(paintItem(WARRIOR, 'now'));
  say(`<div>${WARRIOR.label} (no chip: painted his own way)</div><div class="big">${ms(war)}</div><div class="dim">a frame: the mark to reach</div>`);
  const rows: { it: Item; now: number; r1: number; r2: number; hop: number }[] = [];
  for (const it of SET) {
    status.textContent = `Painting ${it.label.replace(/^The /, 'the ').replace(/^His /, 'his ').replace(/^Its /, 'its ')}…`;
    await tick();
    const now = avg(paintItem(it, 'now'));
    await tick();
    const r1 = ready ? avg(paintItem(it, 'round1')) : NaN;
    await tick();
    const r2 = ready ? avg(paintItem(it, 'round2')) : NaN;
    await tick();
    const hop = ready && it.who === 'warlock' && /demon|change/.test(it.name) ? avg(paintItem(it, 'hop')) : NaN;
    rows.push({ it, now, r1, r2, hop });
    if (ready) {
      say(
        `<div>${it.label}</div>` +
          `<div class="way"><span>NOW</span><b>${ms(now)}</b></div>` +
          `<div class="way"><span>ROUND 1</span><b>${msOr(r1)}</b></div>` +
          `<div class="way"><span>ROUND 2</span><b class="${r2 <= now ? 'good' : 'bad'}">${msOr(r2)}</b></div>` +
          `<div class="dim">a frame. Round 2: ${than(now, r2, 'now')}; ${than(r1, r2, 'round 1')}</div>`,
      );
    } else say(`<div>${it.label}</div><div class="big">${ms(now)}</div><div class="dim">a frame, the way the game paints now</div>`);
  }
  status.remove();
  if (ready && GPU_SCULPT_TEST.fellBack) say(`<div class="bad">${GPU_SCULPT_TEST.fellBack} frames fell back to the old way (${GPU_SCULPT_TEST.why})</div>`);

  // WHERE A ROUND 2 FRAME'S TIME GOES, ON THIS DEVICE
  if (ready) {
    const box = say('<h2 style="margin-top:0">Where the time goes (round 2)</h2><div class="dim">Working it out…</div>', 'row');
    await tick();
    const parts: { label: string; plain: ReturnType<typeof splitOf>; waited: ReturnType<typeof splitOf> }[] = [];
    for (const it of [SET[0], SET[3]]) {
      const plain = splitOf(it, false);
      await tick();
      const waited = splitOf(it, true);
      await tick();
      parts.push({ label: it.label, plain, waited });
    }
    // the chip's own times for its passes, where this browser can say
    let chipOwn = 'this browser does not say';
    GPU_SCULPT_TEST.timer = true;
    try {
      chipTimes();
      for (const it of [SET[0], SET[3]]) {
        splitOf(it, false);
        await tick(60);
      }
      let got: { cull: number; cols: number; march: number }[] | null = null;
      for (let k = 0; k < 20 && !(got && got.length >= 2); k++) {
        await tick(50);
        const t = chipTimes();
        if (t === null) break;
        got = [...(got ?? []), ...t];
      }
      if (got && got.length) chipOwn = got.slice(-2).map((g, k) => `${k ? 'the demon' : 'the man'}: first pass ${ms(g.cull)}, columns ${ms(g.cols)}, march ${ms(g.march)}`).join('; ');
      else if (got) chipOwn = 'asked, but no answer came';
    } finally {
      GPU_SCULPT_TEST.timer = false;
    }
    const line = (k: string, v: number): string => `<tr><td>${k}</td><td>${ms(v)}</td></tr>`;
    box.innerHTML =
      '<h2 style="margin-top:0">Where the time goes (round 2)</h2>' +
      parts
        .map(({ label, plain: p, waited: w }) => {
          const outside = p.all - p.ms.all;
          const chipAndRead = p.ms.read;
          return (
            `<div style="margin-top:10px">${label}: a frame ${ms(p.all)}</div>` +
            `<div class="way part"><span>on the CPU: the figure and the rest of the picture</span><b>${ms(outside + p.ms.pack + p.ms.upload + p.ms.check + p.ms.shade)}</b></div>` +
            `<div class="way part"><span>waiting for the chip, and reading back</span><b>${ms(chipAndRead)}</b></div>` +
            `<table>${line('making the figure, its ink and edge (outside the chip\'s part)', outside)}${line('laying out the solids for the chip', p.ms.pack)}${line('sending them', p.ms.upload)}${line('the chip works, then the readback', chipAndRead)}${line('checking its numbers', p.ms.check)}${line('colouring each pixel', p.ms.shade)}</table>` +
            `<div class="small">Each pass waited for in turn: the chip's first pass ${ms(w.ms.cull)}, its columns ${ms(w.ms.cols)}, its march ${ms(w.ms.march)}, the readback alone ${ms(w.ms.read)} (a frame so ${ms(w.all)}). ${p.draws} draws, ${Math.round(p.readBytes / 1024)} KB read back, ${p.box[0]} by ${p.box[1]} pixels, ${p.solids} solids.</div>`
          );
        })
        .join('') +
      `<div class="small" style="margin-top:8px">The chip's own clock: ${chipOwn}.</div>`;
    // for the main chat: each saving of round 2
    const ex = rows.filter((r) => !Number.isNaN(r.hop));
    if (ex.length) say(`<div class="small">For the main chat: round 2 with its one saving not kept (passing over the cells where no skin can be met; it puts more pixels a tone off than the bound allows): ${ex.map((r) => `${r.it.label.toLowerCase()} ${ms(r.hop)}`).join(', ')}; as kept: ${ex.map((r) => ms(r.r2)).join(', ')}.</div>`, 'row');
  }

  // the side painter: a worker, as the game's (render/painter.ts)
  const side = say('In the side painter (a worker, as the game paints his frames)…', 'row dim');
  await tick();
  // (first a tiny worker of its own: can a worker start here at all, and does it get WebGL2 on a canvas that needs no page?)
  const probe = await new Promise<string>((res) => {
    try {
      const pw = new Worker(
        URL.createObjectURL(
          new Blob(
            [
              "try{var c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(1,1):null;var g=c?c.getContext('webgl2'):null;" +
                "postMessage(!c?'a worker starts; no OffscreenCanvas in it':g?'a worker starts; WebGL2 in it: yes':'a worker starts; WebGL2 in it: no')}" +
                "catch(e){postMessage('a worker starts; trying WebGL2 in it threw: '+e)}",
            ],
            { type: 'text/javascript' },
          ),
        ),
      );
      const to = setTimeout(() => res('a worker made no answer in ten seconds'), 10000);
      pw.onmessage = (e) => {
        clearTimeout(to);
        pw.terminate();
        res(String(e.data));
      };
      pw.onerror = (e) => {
        clearTimeout(to);
        pw.terminate();
        res('a worker could not run here' + (e.message ? ': ' + e.message : ''));
      };
    } catch (e) {
      res('a worker could not be made here: ' + String((e as Error)?.message ?? e));
    }
  });
  say(`<div class="dim">Worker check: ${probe}</div>`, 'row');
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined' || !SRC) side.innerHTML = '<div>In the side painter</div><div class="big bad">not on this browser</div><div class="dim">the game would paint his frames on the page instead</div>';
  else {
    const w = new Worker(URL.createObjectURL(new Blob([PRELUDE, SRC], { type: 'text/javascript' })));
    const r = await new Promise<{ ready: boolean; why?: string; t: number[] }>((res) => {
      const to = setTimeout(() => res({ ready: false, why: 'no answer in five minutes', t: [] }), 300000);
      w.onmessage = (e) => {
        clearTimeout(to);
        res(e.data);
      };
      w.onerror = (e) => {
        clearTimeout(to);
        e.preventDefault?.();
        const where = e.filename || e.lineno ? ` (line ${e.lineno}, column ${e.colno})` : '';
        res({ ready: false, why: 'the painter stopped with an error' + (e.message ? ': ' + e.message : '') + where, t: [] });
      };
      w.postMessage(1);
    });
    w.terminate();
    side.className = 'row';
    side.innerHTML = r.ready ? `<div>In the side painter (a worker, as the game paints)</div><div class="big good">works</div><div class="dim">the Warlock standing ${ms(r.t[0])}, the demon standing ${ms(r.t[1])} a frame, on the graphics chip (round 2)</div>` : `<div>In the side painter</div><div class="big bad">chip not available there</div><div class="dim">${r.why || ''}: the game would paint his frames the old way there</div>`;
  }
  const b = document.createElement('button');
  b.textContent = 'Run again';
  b.onclick = () => location.reload();
  root.appendChild(b);
  (window as unknown as { GPU_SPEED_DONE?: unknown }).GPU_SPEED_DONE = { war, rows: rows.map((r) => ({ label: r.it.label, now: r.now, r1: r.r1, r2: r.r2, hop: r.hop })) };
}

if (!G[WORKER_MARK] && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void page());
  else void page();
}
