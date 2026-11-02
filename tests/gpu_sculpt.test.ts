// THE SCULPTED FIGURES' MARCH ON THE GRAPHICS CHIP, BEHIND ITS SWITCH (the art chat's helper, 1 Nov 2026;
// docs/mockups/gpu_sculpt/README.md). The owner, 1 Nov, of the Warlock, the Tinkerer and the Brawler painted faster: "Use the
// phone's graphics chip (Recommended)", offered as the same sculpted look painted many times faster, a pixel here and there
// perhaps different, shown to him side by side first. Until his yes on the pictures the switch stays off, and with it off
// not one pixel of any frame changes.
//
// Here: the switch is off; with it off every frame sampled is the very picture pinned in tests/cheap_heroes.hashes.json (that
// test holds every list's first, middle and last); with it on where there is no WebGL2 (node has none) the CPU paints, the
// very same pictures; and the chip's own march, done in the CPU's 64-bit numbers (`listMarch`: every solid the cells' lists
// leave out is one the plain field passes over), gives the very same pictures, which proves the lists. How the chip itself
// compares (its 32-bit sums) is measured in a browser: tools/gpu_sculpt_check.mjs.
//   run: tsx --test tests/gpu_sculpt.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { COUNT, GPU_ROUND2, GPU_SCULPT, GPU_SCULPT_TEST, countReset } from '../src/dev/gpu_sculpt';
import { paintingOf } from './helpers';
import { hashSprite, listsOf } from '../tools/cheap_heroes';
import type { FrameList, Who } from '../tools/cheap_heroes';

const PINNED = JSON.parse(readFileSync(new URL('./cheap_heroes.hashes.json', import.meta.url), 'utf8')) as { lists: Record<string, string[]> };

/** Frames to hold against their pins: a man, blazing, the change, the demon and its burning out, her, her Golem and Contraption, him. */
const PICKS: [Who, string, number[]][] = [
  ['warlock', 'warlock:dungeon/front.idle', [0, 33]],
  ['warlock', 'warlock:blaze/back.walk', [5]],
  ['warlock', 'warlock:dungeon/front.clips.change.frames', [30]],
  ['warlock', 'warlock:demon/front.clips.attack.frames', [12]],
  ['warlock', 'warlock:demon/back.clips.change.frames', [20]],
  ['tinkerer', 'tinkerer:dungeon/front.clips.heavy.frames', [20]],
  ['tinkerer-kit', 'golem:tesla/front.clips.attack.frames', [6]],
  ['tinkerer-kit', 'contraption:bombs/back.shot.frames', [3]],
  ['brawler', 'brawler:dungeon/back.clips.punches.TTH.frames', [17]],
];

function picked(): { name: string; i: number; frames: FrameList['frames'] }[] {
  const by = new Map<Who, FrameList[]>();
  const out: { name: string; i: number; frames: FrameList['frames'] }[] = [];
  for (const [who, name, is] of PICKS) {
    if (!by.has(who)) by.set(who, listsOf(who));
    const l = (by.get(who) as FrameList[]).find((x) => x.name === name);
    if (!l) throw new Error(`${name}: not there`);
    for (const i of is) out.push({ name, i, frames: l.frames });
  }
  return out;
}

test('the switch is off', () => {
  assert.equal(GPU_SCULPT.on, false);
  assert.equal(GPU_SCULPT_TEST.mode, 'gpu');
});

test('switch off: the frames are the very pictures pinned', () => {
  for (const p of picked()) assert.equal(hashSprite(p.frames[p.i]), PINNED.lists[p.name][p.i], `${p.name}[${p.i}]`);
});

test('switch on with no graphics chip (node has none): the CPU paints, the very same pictures', () => {
  GPU_SCULPT.on = true;
  try {
    for (const p of picked()) assert.equal(hashSprite(p.frames[p.i]), PINNED.lists[p.name][p.i], `${p.name}[${p.i}]`);
    assert.equal(GPU_SCULPT_TEST.marched, 0, 'nothing marched on a chip');
    assert.ok(GPU_SCULPT_TEST.fellBack > 0, 'each frame fell back');
    assert.ok(/no WebGL2/.test(GPU_SCULPT_TEST.why), `why: ${GPU_SCULPT_TEST.why}`);
  } finally {
    GPU_SCULPT.on = false;
  }
});

test("the chip's march in the CPU's own numbers: the very same pictures (the cells' lists leave out nothing that matters)", () => {
  GPU_SCULPT.on = true;
  GPU_SCULPT_TEST.mode = 'emulate';
  // (round 2's savings that keep every pixel, on: its first pass's sums spared, and the rays that can meet nothing not marched)
  const was = { ...GPU_ROUND2 };
  Object.assign(GPU_ROUND2, { cullSkip: true, raySkip: true, hop: false, hopBig: false });
  countReset();
  try {
    for (const p of picked()) assert.equal(hashSprite(p.frames[p.i]), PINNED.lists[p.name][p.i], `${p.name}[${p.i}]`);
    assert.ok(COUNT.skipped > 0, 'some rays were not marched');
    assert.ok(COUNT.upsDone < COUNT.ups, 'some bounds were spared');
  } finally {
    Object.assign(GPU_ROUND2, was);
    GPU_SCULPT.on = false;
    GPU_SCULPT_TEST.mode = 'gpu';
  }
});

test("round 1's march in the CPU's own numbers (every saving of round 2 off): the very same pictures", () => {
  GPU_SCULPT.on = true;
  GPU_SCULPT_TEST.mode = 'emulate';
  const was = { ...GPU_ROUND2 };
  Object.assign(GPU_ROUND2, { cullSkip: false, raySkip: false, hop: false, hopBig: false, keep: false });
  try {
    for (const p of picked().slice(0, 3)) assert.equal(hashSprite(p.frames[p.i]), PINNED.lists[p.name][p.i], `${p.name}[${p.i}]`);
  } finally {
    Object.assign(GPU_ROUND2, was);
    GPU_SCULPT.on = false;
    GPU_SCULPT_TEST.mode = 'gpu';
  }
});

test("round 2's passing over of the cells where no skin can be met: not kept (off), and when on, for the biggest figures only, a few pixels a tone off", () => {
  assert.equal(GPU_ROUND2.hop, false, 'not kept, for every figure');
  assert.equal(GPU_ROUND2.hopBig, false, 'not kept, for the biggest');
  const lists = listsOf('warlock');
  const again = listsOf('warlock');
  const was = { ...GPU_ROUND2 };
  GPU_ROUND2.hopBig = true;
  try {
    for (const [name, i] of [['warlock:demon/front.clips.attack.frames', 12], ['warlock:dungeon/front.idle', 16]] as const) {
      const li = lists.findIndex((l) => l.name === name);
      const a = paintingOf(lists[li].frames[i]);
      GPU_SCULPT.on = true;
      GPU_SCULPT_TEST.mode = 'emulate';
      countReset();
      try {
        const b = paintingOf(again[li].frames[i]);
        let fig = 0;
        let diff = 0;
        let edge = 0;
        for (let k = 0; k < a.d.length; k += 4) {
          if (a.d[k + 3]) fig++;
          if (a.d[k] !== b.d[k] || a.d[k + 1] !== b.d[k + 1] || a.d[k + 2] !== b.d[k + 2] || a.d[k + 3] !== b.d[k + 3]) diff++;
          if ((a.d[k + 3] > 0) !== (b.d[k + 3] > 0)) edge++;
        }
        if (name.includes('demon')) {
          assert.ok(COUNT.hops > 0, 'cells were passed over');
          assert.ok(diff > 0 && diff / fig < 0.005, `${name}[${i}]: ${diff} of ${fig}`);
        } else {
          // (the man is not one of the biggest: his pictures are the very same)
          assert.equal(COUNT.hops, 0);
          assert.equal(diff, 0, `${name}[${i}]`);
        }
        assert.equal(edge, 0, 'no pixel there in one and not the other');
      } finally {
        GPU_SCULPT.on = false;
        GPU_SCULPT_TEST.mode = 'gpu';
      }
    }
  } finally {
    Object.assign(GPU_ROUND2, was);
  }
});

test("nothing of the game reads the chip's checks or its test page (dev/gpu_check_main.ts, dev/gpu_speed_main.ts, dev/gpu_lists.ts)", () => {
  const root = new URL('../src/', import.meta.url);
  const files: string[] = [];
  const walk = (dir: URL, rel: string): void => {
    for (const n of readdirSync(dir)) {
      const u = new URL(n, dir);
      if (statSync(u).isDirectory()) walk(new URL(`${n}/`, dir), `${rel}${n}/`);
      else if (n.endsWith('.ts')) files.push(`${rel}${n}`);
    }
  };
  walk(root, '');
  const tools = new Set(['dev/gpu_check_main.ts', 'dev/gpu_speed_main.ts', 'dev/gpu_lists.ts']);
  for (const f of files) {
    if (tools.has(f)) continue;
    const src = readFileSync(new URL(f, root), 'utf8');
    assert.ok(!/from '[./]*(dev\/)?gpu_(check_main|speed_main|lists)'/.test(src), `${f} imports a check`);
  }
});
