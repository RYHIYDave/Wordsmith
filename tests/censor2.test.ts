// FLOOR 15'S BOSS, THE CENSOR, MADE AGAIN (art/censor2_sculpt.ts, censor2_moves.ts, censor2_art.ts, censor2_shots.ts; behind CENSOR2,
// on at his yes of 14 Nov 2026): his pictures as the game holds them, every clip his acts name; on his rules' own beats; never cyan;
// the painter's workers told of his switch; his floor's own pictures drawn, never cyan.
// @ts-ignore
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CENSOR2, CENSOR2_FPS, CENSOR2_SIZE, censorFramePainted } from '../src/art/censor2_art';
import { CENSOR2_MOVES } from '../src/art/censor2_moves';
import { act1Fig } from '../src/art/act1_figs/index';
import { FIGURE_SIZE, useCensor2 } from '../src/art/bestiary';
import { CENSOR, CENSOR_ACTS } from '../src/game/act1_rules/censor';
import { MONSTERS } from '../src/game/defs';
import { drawRedaction, drawRoomHush, drawSlashMark, drawStrikeLine } from '../src/art/censor2_shots';
import { paintWithoutCanvas } from './helpers';
import { cyanGlow } from './act1_kinds_room';
import { measuredSize } from './act1_kinds_room_c';

paintWithoutCanvas();

test('1. on at his yes; his pictures, his size and his robe\'s reach go with the switch', () => {
  assert.equal(CENSOR2.on, true);
  assert.equal(FIGURE_SIZE.censor.top, CENSOR2_SIZE.top);
  assert.equal(act1Fig('censor')!.size.top, CENSOR2_SIZE.top);
  assert.equal(MONSTERS.censor.radius, 0.85);
  useCensor2(false);
  try {
    assert.equal(FIGURE_SIZE.censor.top, 45, "the art chat's size with his old pictures");
    assert.equal(act1Fig('censor')!.size.top, 45);
    assert.equal(MONSTERS.censor.radius, 0.6);
  } finally {
    useCensor2(true);
  }
  assert.equal(CENSOR2_SIZE.top, 80, 'his own size left as it is');
  assert.equal(FIGURE_SIZE.censor.top, 80);
  // (the game's size of him his picture's own: as the hall measures every kind, tests/act1_kinds_room_c.ts)
  const m = measuredSize('censor');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes him to be ${m.size.top} up; in the picture he is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
});

test('2. every clip his acts name, both ways round, on his rules\' own beats', () => {
  const art = act1Fig('censor')!.make();
  for (const set of [art.front, art.back]) {
    const c = set.clips!;
    assert.ok(c.attack && c.die && c.reel, 'his slash, death, struck');
    for (const a of CENSOR_ACTS) {
      const clip = a.clip === 'attack' ? c.attack : c.moves?.[a.clip];
      assert.ok(clip, `${a.id}: its clip ${a.clip}`);
      assert.ok(Math.abs((clip!.hit ?? -1) - a.hit) < 1e-6, `${a.id}: its blow at ${a.hit}, the picture's at ${clip!.hit}`);
      assert.ok(Math.abs((clip!.frames.length - 1) / clip!.fps - a.long) < 0.05, `${a.id}: ${a.long} s long`);
    }
    assert.ok(set.idle.length > 0 && set.walk.length > 0);
  }
  for (const [m, M] of Object.entries(CENSOR2_MOVES)) {
    const want = m === 'slash' ? CENSOR.slash : m === 'strike' ? CENSOR.strike : m === 'redact' ? CENSOR.redact : CENSOR.hush;
    assert.ok(Math.abs(M.beats[0].at - want.hit) < 1e-6, `${m}'s beat on the rules'`);
    assert.equal(M.long, want.long);
  }
});

test('3. his frames paint, from in front and from behind: the enemy\'s colours, nothing cyan', () => {
  const cyanPx = (f: ReturnType<typeof censorFramePainted>): number => {
    let n = 0;
    for (let i = 0; i < f.px.d.length; i += 4) if (f.px.d[i + 3] > 0 && cyanGlow(f.px.d[i], f.px.d[i + 1], f.px.d[i + 2])) n++;
    return n;
  };
  for (const view of ['front', 'rear'] as const) {
    for (const [what, i] of [['still', 0], ['walk', 5], ['slash', 24], ['strike', 27], ['redact', 30], ['hush', 32], ['reel', 4], ['die', 30]] as const) {
      const f = censorFramePainted(view, what, i);
      let filled = 0;
      for (let k = 3; k < f.px.d.length; k += 4) if (f.px.d[k] > 0) filled++;
      assert.ok(filled > 2000, `${view} ${what} ${i}: painted`);
      assert.equal(cyanPx(f), 0, `${view} ${what} ${i}: nothing cyan`);
    }
  }
  void CENSOR2_FPS;
});

test('4. what he lays on the floor, his own: drawn, never cyan', () => {
  const seen = new Set<string>();
  const g = { globalAlpha: 1, fillStyle: '' as string, fillRect(): void { seen.add(String(g.fillStyle)); } } as unknown as CanvasRenderingContext2D;
  const at = (x: number, y: number): readonly [number, number] => [(x - y) * 16 + 200, (x + y) * 8 + 100];
  for (const t of [0.05, 0.4, 1.0]) drawSlashMark(g, at, 5, 5, 1, 0, t);
  for (const t of [-0.4, 0.02, 0.2, 1.2]) drawRedaction(g, at, [{ x: 5, y: 5, along: 0, long: 6, wide: 1 }], t);
  for (const t of [0.1, 0.5, 1.0]) drawStrikeLine(g, at, 5, 5, 1, 0, 8, t);
  for (const t of [0.3, 1.1, 2.0]) drawRoomHush(g, at, 5, 5, 8, t);
  assert.ok(seen.size > 5, 'drawn');
  for (const c of seen) {
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
    if (!m) continue;
    assert.ok(!cyanGlow(parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)), `${c} is not cyan`);
  }
});
