// THE GOLEM'S GUN ARM (dev/sculpt_golem.ts GOLEM_GUNS; his word, 28 Oct, by 00:50: “I’d like the big construct to have a
// ranged attack as well.  Maybe put a cannon or a tesla coil on his other arm or whatever.”): each gun, at rest and as it
// is brought down to aim and fires (kicked back up its arm), passes the picture's checks (crisp, the friend's edge, no
// pixel alone, nothing pink, nothing cut off) and the body's (nothing sunk, standing on the floor), from in front and
// behind, turned eight ways; and the gun arm never goes through its body, its legs or its giant arm.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import type { V3 } from '../src/art/skeleton';
import { LAST, primDist } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { GOLEM_GUNS, GOLEM_PICK, sculptGolemBuild } from '../src/dev/sculpt_golem';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];
const POSES: [number, number][] = [[0, 0], [0.33, 0], [0.66, 0], [1, 0], [1, 1], [1, 0.4]];

/** Where its gun arm goes through the rest of it: points along each of its solids, against everything of it but the gun arm. */
function gunThrough(sc: Sculpt): string[] {
  const prims = sc.prims.filter((p) => !p.carve);
  const gun = prims.filter((p) => p.piece === 'gunL');
  const rest = prims.filter((p) => p.piece !== 'gunL');
  const out: string[] = [];
  for (const g of gun) {
    // (its upper arm from its shoulder's ball, under its shoulder plate, as a shoulder is: looked at from halfway down it)
    const pts: V3[] = g.k === 'cone' ? (g.tag === 'upper' ? [0.5, 0.75, 1] : [0, 0.25, 0.5, 0.75, 1]).map((k) => [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k, g.a[2] + (g.b[2] - g.a[2]) * k] as V3) : g.k === 'tri' ? [] : [g.c];
    // (its shoulder's ball and plate are rooted in its body, as a shoulder is)
    if (g.tag === 'ball' || g.tag === 'plate') continue;
    for (const q of pts) for (const b of rest) if (primDist(b, q) < -0.5) out.push(`its gun's ${g.tag} through its ${b.piece} (${b.tag ?? b.k})`);
  }
  return [...new Set(out)];
}

for (const g of GOLEM_GUNS) {
  test(`the Golem with its ${g.name}: at rest, brought down to aim and firing: crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; on the floor; its gun clear of the rest of it: from in front and behind, turned eight ways`, () => {
    const found: string[] = [];
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (const [aim, kick] of POSES) {
          const d = sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, g.id, aim, kick);
          const at = `${view}, turned ${turn}, aimed ${aim}, kicked ${kick}`;
          for (const f of pictureFindings(d.px)) found.push(`${at}: ${f}`);
          const sc = LAST.sc as Sculpt;
          for (const f of bodyFindings(sc, true)) found.push(`${at}: ${f}`);
          for (const f of gunThrough(sc)) found.push(`${at}: ${f}`);
        }
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}
