// ENDLESS MODE'S FINAL BOSS, THE WARPED WORDSMITH ON THE GREAT WOOLLY BOAR: his look standing, through the bosses' checks (his
// rulebook's How art is made 7) for the one move he has so far, his stand.
// @ts-ignore
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { paintMob } from '../src/art/new_mobs3';
import { SPARK, CYAN } from '../src/art/kit';
import { WS_SHAPE, boarLumps, boarPoseAt, wsMob } from '../src/art/endless_boss';
import { skeletonAt } from '../src/art/new_mobs3';

test("his stand passes the bosses' checks", () => {
  const found = checkBoss(wsMob(), WS_SHAPE, ['stand']);
  assert.deepEqual(findingsSaid(found), []);
});

test('nothing of them is cyan, front or back', () => {
  const mob = wsMob();
  const cy = new Set<string>([...SPARK, ...(Array.isArray(CYAN) ? CYAN : [])].map((c) => String(c).toLowerCase()));
  for (const view of ['front', 'back'] as const) {
    const { px } = paintMob(mob, 'stand', 0.4, view);
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
      const c = px.get(x, y);
      if (c) assert.ok(!cy.has(c.toLowerCase()), `${view}: cyan at ${x},${y}`);
    }
  }
});

test('his legs go down the boar\u2019s sides, never into it (his knees and shins outside its body, every frame of his stand)', () => {
  const mob = wsMob();
  const R = 1.8; // (a shin's own thickness, the boot's)
  for (let i = 0; i < 96; i++) {
    const t = i / 30;
    const s = skeletonAt(mob, 'stand', t);
    const lumps = boarLumps(boarPoseAt('stand', t));
    for (const [a, b, name] of [[s.kneeL, s.ankleL, 'shinL'], [s.kneeR, s.ankleR, 'shinR']] as const) {
      for (let k = 0; k <= 8; k++) {
        const p = [a[0] + (b[0] - a[0]) * k / 8, a[1] + (b[1] - a[1]) * k / 8, a[2] + (b[2] - a[2]) * k / 8];
        for (const o of lumps) {
          // (how far inside the ellipsoid, as a share of its size; the shin's thickness taken off)
          const d = [p[0] - o.c[0], p[1] - o.c[1], p[2] - o.c[2]];
          let q = 0;
          for (const v of o.ax) {
            const L = Math.hypot(v[0], v[1], v[2]);
            const along = (d[0] * v[0] + d[1] * v[1] + d[2] * v[2]) / L;
            q += (along / (L + R)) ** 2;
          }
          assert.ok(q >= 1, `${name} in its ${o.name} at ${t.toFixed(2)} s (${q.toFixed(2)})`);
        }
      }
    }
  }
});
