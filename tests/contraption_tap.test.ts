// HER CONTRAPTION AS SHE THROWS IT DOWN (dev/sculpt_contraption.ts CONTRAPTION_POSE; dev/contraption_fx.ts): the tripod
// mortar shut, springing open by steps, set up, and kicked back by its shot: every one crisp, the friend's edge round it,
// no pixel alone, nothing pink, nothing cut off; nothing of it sunk into the floor and something of it standing on it;
// from in front and behind, turned eight ways. And set up as it always stood, it is the picture he picked, to the pixel.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { createHash } from 'node:crypto';
import { LAST } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { CONTRAPTION_PICK, CONTRAPTION_POSE, sculptContraptionBuild } from '../src/dev/sculpt_contraption';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void } = nodeAssert;

const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];
const POSES: [number, number, number][] = [[0, 0, 0], [0.1, 0, 0], [0.2, 0, 0], [0.3, 0, 0], [0.4, 0, 0], [0.5, 0, 0], [0.6, 0, 0], [0.7, 0, 0], [0.8, 0, 0], [0.9, 0, 0], [1, 0, 1], [1, 1, 1], [1, 0.4, 1]];

test('the Contraption shut, springing open and set up, kicked by its shot: crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, standing on the floor: from in front and behind, turned eight ways', () => {
  const found: string[] = [];
  try {
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (const [open, kick, lit] of POSES) {
          Object.assign(CONTRAPTION_POSE, { open, kick, lit });
          const d = sculptContraptionBuild(view, CONTRAPTION_PICK, turn);
          const at = `${view}, turned ${turn}, open ${open}, kicked ${kick}`;
          for (const f of pictureFindings(d.px)) found.push(`${at}: ${f}`);
          for (const f of bodyFindings(LAST.sc as Sculpt, false)) found.push(`${at}: ${f}`);
        }
      }
    }
  } finally {
    Object.assign(CONTRAPTION_POSE, { open: 1, kick: 0, lit: 1 });
  }
  assert.deepEqual([...new Set(found)], []);
});

test('set up, as it always stood: the very picture he picked, to the pixel (its picture before it could be thrown, 28 Oct)', () => {
  Object.assign(CONTRAPTION_POSE, { open: 1, kick: 0, lit: 1 });
  const PICKED = { front: '7f0ab17b6659e571', back: 'e906d02b07897ecb' };
  for (const view of ['front', 'back'] as const) {
    const d = sculptContraptionBuild(view, CONTRAPTION_PICK).px.d;
    assert.ok(createHash('sha256').update(d).digest('hex').slice(0, 16) === PICKED[view], view);
  }
});
