// THE GRAPHICS CHIP, TRIED ON THE OWNER'S OWN PHONE (dist/gpu_speed.html; docs/mockups/gpu_sculpt/README.md). A DEV TOOL;
// NOTHING OF THE GAME IMPORTS IT.
//
// Opened on any phone or computer, it paints some frames of the Warlock (a man standing, his bolt, the change) and of the
// demon (standing, its rake) both ways, the way the game paints them now and on the graphics chip, and shows the times in
// big plain words. Then, where the browser lets the game's side painter use the chip (a worker with a canvas that needs no
// page: Safari 17 and later), it paints a demon frame there too, as the game would.

import { GPU_SCULPT, GPU_SCULPT_TEST, chipName, chipReady } from './gpu_sculpt';
import { listsOf } from './gpu_lists';

// (measured even where the chip is a software stand-in or slower than the CPU: the page says whether the game would use it)
GPU_SCULPT_TEST.allowSlow = true;
import type { FrameList } from './gpu_lists';

const WORKER_MARK = '__GPU_SPEED_WORKER__';
const G = globalThis as unknown as { [WORKER_MARK]?: boolean; postMessage(m: unknown): void; onmessage: ((e: MessageEvent) => void) | null };

/** What is painted: a list of his, and the frames of it timed (its first painted before, untimed: it makes the move). */
const SET: { label: string; name: string; frames: number[] }[] = [
  { label: 'The Warlock standing', name: 'warlock:dungeon/front.idle', frames: [16, 40] },
  { label: 'His bolt', name: 'warlock:dungeon/front.clips.attack.frames', frames: [12, 24] },
  { label: 'The change', name: 'warlock:dungeon/front.clips.change.frames', frames: [24, 40] },
  { label: 'The demon standing', name: 'warlock:demon/front.idle', frames: [16, 32] },
  { label: 'Its rake', name: 'warlock:demon/front.clips.attack.frames', frames: [10, 14] },
];

function paintTimes(on: boolean, which = SET, warm = true): number[][] {
  GPU_SCULPT.on = on;
  const lists = listsOf('warlock');
  const out: number[][] = [];
  for (const s of which) {
    const l = lists.find((x) => x.name === s.name) as FrameList;
    if (warm) void l.frames[0];
    out.push(
      s.frames.map((i) => {
        const t0 = performance.now();
        void l.frames[i];
        return performance.now() - t0;
      }),
    );
  }
  GPU_SCULPT.on = false;
  return out;
}

// THE WORKER'S SIDE: a frame of the man and one of the demon painted on the chip, as the side painter would
if (G[WORKER_MARK]) {
  G.onmessage = () => {
    try {
      const ready = chipReady();
      const which = [{ ...SET[0], frames: [16] }, { ...SET[3], frames: [16] }];
      const t = ready ? paintTimes(true, which, false).map((x) => x[0]) : [];
      G.postMessage({ ready, why: GPU_SCULPT_TEST.why || (GPU_SCULPT_TEST.fellBack ? 'it fell back' : ''), name: chipName(), t, marched: GPU_SCULPT_TEST.marched });
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
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 30));

async function page(): Promise<void> {
  document.title = 'Graphics chip test';
  const st = document.createElement('style');
  st.textContent = `:root{color-scheme:dark;--bg:#0d0b14;--fg:#ece6dc;--dim:#9a92a6;--good:#7fe0b0;--bad:#f0a070}
body{margin:0;background:var(--bg);color:var(--fg);font:20px/1.35 -apple-system,system-ui,sans-serif;padding:18px 16px 40px}
h1{font-size:30px;margin:0 0 6px}.dim{color:var(--dim);font-size:17px}.row{margin:14px 0;padding:12px 14px;border-radius:12px;background:#1a1624}
.big{font-size:30px;font-weight:700;margin:4px 0}.good{color:var(--good)}.bad{color:var(--bad)}button{font:inherit;font-size:22px;padding:12px 20px;border-radius:12px;border:0;background:#3a3150;color:var(--fg);margin-top:10px}`;
  document.head.appendChild(st);
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width,initial-scale=1';
  document.head.appendChild(meta);
  const root = document.body;
  root.innerHTML = '<h1>Graphics chip test</h1><div class="dim">Paints some frames of the Warlock and the demon the way the game paints them now, then on this device\'s graphics chip, and shows how long each takes. About a minute; keep the screen on.</div>';
  const say = (html: string, cls = 'row'): HTMLDivElement => {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    root.appendChild(d);
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
  const status = say('Painting the way the game paints now…', 'dim');
  await tick();
  const now = paintTimes(false);
  let chip: number[][] = [];
  if (ready) {
    status.textContent = 'Painting on the graphics chip…';
    await tick();
    chip = paintTimes(true);
  }
  status.remove();
  for (let k = 0; k < SET.length; k++) {
    const a = avg(now[k]);
    if (ready && chip[k]) {
      const b = avg(chip[k]);
      const how = b <= a ? `${(a / b).toFixed(1)} times as fast` : `${(b / a).toFixed(1)} times slower`;
      say(`<div>${SET[k].label}</div><div class="big">${ms(a)} → <span class="${b <= a ? 'good' : 'bad'}">${ms(b)}</span></div><div class="dim">a frame now → on the chip: ${how}</div>`);
    } else say(`<div>${SET[k].label}</div><div class="big">${ms(a)}</div><div class="dim">a frame, the way the game paints now</div>`);
  }
  if (ready && GPU_SCULPT_TEST.fellBack) say(`<div class="bad">${GPU_SCULPT_TEST.fellBack} frames fell back to the old way (${GPU_SCULPT_TEST.why})</div>`);
  // the side painter: a worker, as the game's (render/painter.ts)
  const side = say('In the side painter (a worker, as the game paints his frames)…', 'row dim');
  await tick();
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
        res({ ready: false, why: e.message, t: [] });
      };
      w.postMessage(1);
    });
    w.terminate();
    side.className = 'row';
    side.innerHTML = r.ready ? `<div>In the side painter (a worker, as the game paints)</div><div class="big good">works</div><div class="dim">the Warlock standing ${ms(r.t[0])}, the demon standing ${ms(r.t[1])} a frame, on the graphics chip</div>` : `<div>In the side painter</div><div class="big bad">chip not available there</div><div class="dim">${r.why || ''}: the game would paint his frames the old way there</div>`;
  }
  const b = document.createElement('button');
  b.textContent = 'Run again';
  b.onclick = () => location.reload();
  root.appendChild(b);
}

if (!G[WORKER_MARK] && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void page());
  else void page();
}
