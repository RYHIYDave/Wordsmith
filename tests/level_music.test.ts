// ACT 1'S LEVEL MUSIC (the sound chat's tenth batch, 12 Nov 2026: assets/sound/README.md, "Tenth batch"; his songs, “That’s all
// the tracks for the first five levels and the town”; try-out 15, his pick “All good, hand over (Recommended)”; engine/audio.ts
// MUSIC_PLACES and levelMusic, game/level_music.ts). Held here:
//   1. its eleven files are in assets/sound, each its loop and 2 s more (the guard), shipped as files of their own, not packed
//      (MP3 since 14 Nov 2026: they were AAC in .mp4, which claude.ai's check of a page's files before it is shared does not take);
//   2. the loops' lengths and fight-in points are the tenth batch's table's, to the figure;
//   3. the place: the prison town, floors 1 to 5; not the camp, the Rim, floor 6 on, nor the endless levels;
//   4. a fight: on as soon as an enemy is awake and near him, still on a few seconds after the last is gone, then off; never in
//      town; a new floor starts with none.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { MUSIC, MUSIC_PLACES } from '../src/engine/audio';
import { makeCamp } from '../src/game/camp';
import { Game } from '../src/game/game';
import { FIGHT_MUSIC, fightMusic, fightWas, musicPlace } from '../src/game/level_music';
import { makeRim } from '../src/game/rim';
// @ts-ignore - a tool of the build, plain JavaScript
import { ownFile, packOf } from '../tools/sound_packs.mjs';

const DIR = 'assets/sound';

/** An MP3's length in seconds as it is decoded: its frames (the Xing/Info header) less the encoder's delay and padding (the LAME
 *  tag), as a browser decodes it gaplessly (14 Nov 2026: the music made MP3; tools/music_align.mjs lines each up in Chrome). */
function mp3Seconds(file: string): number {
  const b = fs.readFileSync(file) as Uint8Array & { indexOf(s: string): number; readUInt32BE(at: number): number };
  let at = 0;
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) at = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  while (!(b[at] === 0xff && (b[at + 1] & 0xe0) === 0xe0)) at++;
  const rate = [44100, 48000, 32000][(b[at + 2] >> 2) & 3];
  let x = b.indexOf('Xing');
  if (x < 0 || x > at + 64) x = b.indexOf('Info');
  if (x < 0) throw new Error(`${file}: no Xing/Info header`);
  if (!(b.readUInt32BE(x + 4) & 1)) throw new Error(`${file}: no frame count`);
  const frames = b.readUInt32BE(x + 8);
  const lame = x + 120;
  const delay = (b[lame + 21] << 4) | (b[lame + 22] >> 4);
  const pad = ((b[lame + 22] & 0x0f) << 8) | b[lame + 23];
  return (frames * 1152 - delay - pad) / rate;
}

function onFloor(depth: number, seed = 5): Game {
  const g = new Game('warrior', seed);
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  return g;
}

const loops = Object.values(MUSIC_PLACES).flatMap((p) => (p.fight ? [p.walk, p.fight] : [p.walk]));

test('1. its eleven files are in assets/sound, each its loop and the 2 s guard, shipped as files of their own', () => {
  assert.equal(loops.length, 11);
  for (const t of loops) {
    const f = `${DIR}/${t.file}`;
    assert.ok(fs.existsSync(f), t.file);
    const s = mp3Seconds(f);
    assert.ok(Math.abs(s - (t.loop + 2)) < 0.05, `${t.file}: ${s.toFixed(3)} s, its loop ${t.loop} and 2 s`);
    if (t.fightIn !== undefined) assert.ok(t.fightIn >= 0 && t.fightIn < t.loop, `${t.file}: comes in within its loop`);
  }
  // (MP3 since 14 Nov 2026, not packed: each shipped as a file of its own, as the title theme is)
  assert.ok(loops.every((t) => t.file.endsWith('.mp3') && ownFile(t.file)));
  assert.ok(ownFile('title.mp3') && !ownFile('swing_1.mp3'), 'the packs keep the rest of the mp3s');
  assert.equal(typeof packOf, 'function');
  assert.ok(MUSIC.vol > 0 && MUSIC.vol <= 1);
  assert.deepEqual([MUSIC.walkIn, MUSIC.walkDown, MUSIC.fightOut, MUSIC.walkBack], [0.6, 0.6, 1.5, 1.5], 'the fades of try-out 15');
});

test("2. the loops' lengths and the fights' points are the tenth batch's table's", () => {
  const readme = fs.readFileSync(`${DIR}/README.md`, 'utf8');
  const from = readme.indexOf('## Tenth batch');
  assert.ok(from >= 0, 'the tenth batch in the README');
  const part = readme.slice(from);
  const rows = [...part.matchAll(/^\|[^|\n]*\| `(music_[a-z0-9_]+\.mp3)` \| *([\d.]+) *\| *([\d.]*) *\|/gm)];
  assert.equal(rows.length, 11, 'eleven rows');
  for (const r of rows) {
    const t = loops.find((q) => q.file === r[1]);
    if (!t) throw new Error(`${r[1]}: not played`);
    assert.equal(t.loop, Number(r[2]), `${r[1]}: its loop`);
    assert.equal(t.fightIn, r[3] ? Number(r[3]) : undefined, `${r[1]}: where its fight comes in`);
  }
});

test('3. the place: the prison town, floors 1 to 5; not the camp, the Rim, floor 6 on, nor the endless levels', () => {
  const g = new Game('warrior', 3);
  assert.equal(g.level.town, true);
  assert.equal(musicPlace(g), 'town');
  for (let d = 1; d <= 5; d++) assert.equal(musicPlace(onFloor(d)), `f${d}`, `floor ${d}`);
  assert.equal(musicPlace(onFloor(6)), null, 'floor 6: none made yet');
  const e = onFloor(2);
  e.inEndless = true;
  assert.equal(musicPlace(e), null, 'the endless levels');
  g.level = makeRim(11, true);
  assert.equal(musicPlace(g), null, "the Shaft's Rim");
  g.level = makeCamp(11, true);
  assert.equal(musicPlace(g), null, "the camp inside Vellum's gate");
});

test('4. a fight: on as an enemy wakes near him, on a few seconds after the last is gone, then off; never in town', () => {
  const g = onFloor(1);
  const was = fightWas();
  for (const m of g.monsters) m.state = 'sleep';
  assert.equal(fightMusic(was, g, 0.016), false, 'all asleep: no fight');
  const m = g.monsters.find((q) => !q.dead);
  if (!m) throw new Error('a monster on floor 1');
  m.x = g.hero.x + 2;
  m.y = g.hero.y;
  m.state = 'chase';
  assert.equal(g.inFight(), true);
  assert.equal(fightMusic(was, g, 0.016), true, 'it has seen him: the fight is on');
  m.dead = true;
  assert.equal(fightMusic(was, g, FIGHT_MUSIC.calm / 2), true, 'just after the last is gone: still on');
  assert.equal(fightMusic(was, g, FIGHT_MUSIC.calm), false, 'a few seconds after: over');
  // (a new floor: none to begin with, whatever the last had)
  m.dead = false;
  fightMusic(was, g, 0.016);
  const h = onFloor(2);
  for (const q of h.monsters) q.state = 'sleep';
  assert.equal(fightMusic(was, h, 0), false, 'a new floor: no fight carried over');
  // (in town: never)
  const t = new Game('warrior', 3);
  assert.equal(fightMusic(was, t, 0.016), false);
});
