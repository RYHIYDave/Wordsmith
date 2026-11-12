// PHASE 2'S GAZE AIMED AT THE HERO, ITS PICTURES PACKED (tools/bake_colossus.ts `phase2`, into assets/colossus; game/colossus_fight.ts
// GAZE2_AIMED): his body, a frame for each of his stand's; each aim of the rules its own sheets, every frame of the gaze, his eye where
// each shows it, turned the way its aim is; the old gaze kept, for the switch off. (A file of its own: the code's tests,
// tests/colossus_gaze2.test.ts, hold without the pack.)
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
import { BODY2 } from '../src/game/colossus_fight';
import { GAZE as ART_GAZE, GAZE_FIRE } from '../src/art/eye_body';

const fs = nodeFs as { existsSync(p: string): boolean; readFileSync(p: string, e: string): string };

test('the pack holds them: his body, 90 frames; each aim 102 frames, his eye where each shows it, turned the way the aim is; the old gaze kept, for the switch off', () => {
  const file = 'assets/colossus/colossus.json';
  assert.ok(fs.existsSync(file));
  const man = JSON.parse(fs.readFileSync(file, 'utf8')) as { moves: Record<string, { group: string; frames: number[]; eyes?: ([number, number] | null)[] }> };
  assert.equal(man.moves.p2body?.frames.length, 90);
  assert.ok(man.moves.gaze, 'the old gaze');
  const mid = GAZE_FIRE + Math.floor(ART_GAZE.sweep / 2);
  const xs: number[] = [];
  BODY2.aims.forEach((_, j) => {
    const m = man.moves[`gaze2.${j}`];
    assert.ok(m, `gaze2.${j}`);
    assert.equal(m.group, `gaze2.${j}`, 'each its own sheets');
    assert.equal(m.frames.length, ART_GAZE.frames);
    assert.equal(m.eyes?.length, ART_GAZE.frames);
    assert.ok(m.eyes!.filter((e) => e).length >= ART_GAZE.frames - 4, `gaze2.${j}: his eye shown`);
    xs.push(m.eyes![mid]![0]);
  });
  // (half way through its sweep his eye is further toward the stone's right end the further right the aim)
  for (let j = 1; j < xs.length; j++) assert.ok(xs[j] > xs[j - 1], `the eyes across: ${xs.join(', ')}`);
});
