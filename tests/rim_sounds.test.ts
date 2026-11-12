// THE SHAFT'S RIM'S OWN SOUNDS (the sound chat's ninth batch, 12 Nov 2026: assets/sound/README.md; game/world_sounds.ts
// RIM_SOUNDS; his “Yes, make them (Recommended)” and, of try-out 14, “It good, kinda loud but I’m sure it’ll be evened out in the
// mix for game”). Held here:
//   1. its files are in assets/sound: the three loops (WAV), two takes each of the notch and the trophy hung (mp3), the one-shots
//      packed with the town's;
//   2. in the Rim the shaft's rumble always, at full; the draught louder at the brink, never gone; the nearest torch on a post
//      heard near it, not far off; no hall's air;
//   3. none of them in another town; a rim loop is let go as a floor's is when no longer wanted (engine/audio.ts FLOOR_LOOP).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { Game } from '../src/game/game';
import { RIM_AT, makeRim } from '../src/game/rim';
import { RIM_SOUNDS, loopWants } from '../src/game/world_sounds';
// @ts-ignore - a tool of the build, plain JavaScript
import { packOf } from '../tools/sound_packs.mjs';

const DIR = 'assets/sound';

test('1. the Rim\'s files: three loops, two takes of the notch and of the trophy hung, packed with the town\'s', () => {
  for (const f of ['rim_rumble_loop.wav', 'rim_draught_loop.wav', 'rim_torch_loop.wav', 'notch_1.mp3', 'notch_2.mp3', 'trophy_hang_1.mp3', 'trophy_hang_2.mp3']) {
    assert.ok(fs.existsSync(`${DIR}/${f}`), f);
  }
  assert.equal(packOf('notch'), 'town');
  assert.equal(packOf('trophy_hang'), 'town');
});

test('2. in the Rim: the rumble always at full, the draught louder at the brink and never gone, the nearest torch near it; no hall\'s air', () => {
  const g = new Game('warrior', 3);
  g.level = makeRim(11, true);
  const h = g.hero;
  const P = RIM_AT.pit;
  // at the brink
  h.x = P.x + P.r;
  h.y = P.y;
  const brink = loopWants(g, true);
  assert.equal(brink.rim_rumble, RIM_SOUNDS.rumble);
  assert.equal(brink.rim_draught, 1, 'the draught, at the brink: full');
  assert.equal(brink.bed_hall, undefined, 'the Rim is no hall');
  // far from the brink: the draught at its least, never gone
  h.x = P.x + P.r + 9;
  const far = loopWants(g, true);
  assert.equal(far.rim_rumble, RIM_SOUNDS.rumble, 'the rumble, everywhere in the town');
  assert.equal(far.rim_draught, RIM_SOUNDS.draught.least, 'the draught, far off: never quite gone');
  // a torch on a post: heard beside it
  assert.ok(RIM_AT.torches.length === 4, 'four torches on posts');
  const t = RIM_AT.torches[0];
  h.x = t.x + 0.5;
  h.y = t.y;
  assert.equal(loopWants(g, true).rim_torch, RIM_SOUNDS.torch.vol, 'beside a torch: its loop at its loudness');
  const away = RIM_AT.torches.reduce((m, q) => Math.min(m, Math.hypot(q.x - (P.x + P.r + 9), q.y - P.y)), Infinity);
  if (away >= RIM_SOUNDS.torch.far) {
    h.x = P.x + P.r + 9;
    h.y = P.y;
    assert.equal(loopWants(g, true).rim_torch, undefined, 'far from every torch: none');
  }
});

test('3. none of them in another town; a rim loop is a place\'s own, let go once unwanted', () => {
  const g = new Game('warrior', 3);
  assert.equal(g.level.town, true);
  const want = loopWants(g, true);
  assert.ok(!Object.keys(want).some((k) => k.startsWith('rim_')), 'the first town: none of the Rim\'s');
  const src = fs.readFileSync('src/engine/audio.ts', 'utf8');
  const m = /const FLOOR_LOOP = (\/.*\/);/.exec(src);
  if (!m) throw new Error('FLOOR_LOOP in engine/audio.ts');
  // eslint-disable-next-line no-eval
  const re = (0, eval)(m[1]) as RegExp;
  for (const n of ['rim_rumble', 'rim_draught', 'rim_torch']) assert.ok(re.test(n), `${n}: let go as a floor's own`);
  assert.ok(!re.test('fire_small') && !re.test('ring_hum'), 'the town\'s own kept, as ever');
});
