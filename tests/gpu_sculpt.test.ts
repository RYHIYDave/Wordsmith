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
import { GPU_SCULPT, GPU_SCULPT_TEST } from '../src/dev/gpu_sculpt';
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
  try {
    for (const p of picked()) assert.equal(hashSprite(p.frames[p.i]), PINNED.lists[p.name][p.i], `${p.name}[${p.i}]`);
  } finally {
    GPU_SCULPT.on = false;
    GPU_SCULPT_TEST.mode = 'gpu';
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
