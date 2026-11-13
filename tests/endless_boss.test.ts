// ENDLESS MODE'S FINAL BOSS, THE WARPED WORDSMITH ON THE GREAT WOOLLY BOAR: his look standing, through the bosses' checks (his
// rulebook's How art is made 7) for his moves so far: his stand; the boar's charge, wheel round, gore, and rear up and stomp; his
// word attacks from the saddle: Power, Flame, Frost, Lightning, Poison; the boar's death and his rising on foot; on foot, his stand and his melds (Eruption, Hailstorm); his death.
// @ts-ignore
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { paintMob } from '../src/art/new_mobs3';
import { SPARK, CYAN } from '../src/art/kit';
import { BOLT, CHARGE, CHARGE_SKID, FALL, FIRE, FROST, GORE, POWER, SPORE, STOMP, WHEEL, WS_SHAPE, boarLumps, boarPoseAt, wsMob } from '../src/art/endless_boss';
import { skeletonAt } from '../src/art/new_mobs3';

test("his stand passes the bosses' checks", () => {
  const found = checkBoss(wsMob(), WS_SHAPE, ['stand']);
  assert.deepEqual(findingsSaid(found), []);
});

test("the boar's charge, wheel round, gore and stomp, his five words, and the boar's death and his rising, pass the bosses' checks (but the skid: its hooves ploughing, his pick)", () => {
  // (the one place a hoof slides: the skid at the end of each run, its hooves ploughing the floor, as he picked it, 12 Nov 2026:
  // “Heavy charges, skid and turn (Recommended)”; anything else that slides, or anything else at all, is a finding)
  const found = checkBoss(wsMob(), WS_SHAPE, ['charge', 'wheel', 'gore', 'stomp', 'power', 'flame', 'frost', 'lightning', 'poison', 'fall', 'foot', 'turn', 'eruption', 'hailstorm', 'avalanche', 'thunder', 'death']).filter(
    (f) => !(f.kind === 'slide' && /^hoof[0-3] \(down from /.test(f.what) && ((d) => d >= CHARGE_SKID[0] - 1e-6 && d <= CHARGE_SKID[1])(Number(/from ([\d.]+)/.exec(f.what)?.[1]))),
  );
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

test('his legs go down the boar\u2019s sides, never into it (his knees and shins outside its body, every frame of his stand and the boar’s moves)', () => {
  const mob = wsMob();
  const R = 1.8; // (a shin's own thickness, the boot's)
  const moments: [string, number][] = [];
  for (let i = 0; i < 144; i++) moments.push(['stand', i / 30]);
  for (let i = 0; i <= Math.round(CHARGE.long * 30); i++) moments.push(['charge', i / 30]);
  for (let i = 0; i <= Math.round(WHEEL.long * 30); i++) moments.push(['wheel', i / 30]);
  for (let i = 0; i <= Math.round(GORE.long * 30); i++) moments.push(['gore', i / 30]);
  for (let i = 0; i <= Math.round(STOMP.long * 30); i++) moments.push(['stomp', i / 30]);
  for (let i = 0; i <= Math.round(POWER.long * 30); i++) moments.push(['power', i / 30]);
  for (let i = 0; i <= Math.round(FIRE.long * 30); i++) moments.push(['flame', i / 30]);
  for (let i = 0; i <= Math.round(FROST.long * 30); i++) moments.push(['frost', i / 30]);
  for (let i = 0; i <= Math.round(BOLT.long * 30); i++) moments.push(['lightning', i / 30]);
  for (let i = 0; i <= Math.round(SPORE.long * 30); i++) moments.push(['poison', i / 30]);
  // (its death: in the saddle, and thrown up out of it over the boar)
  for (let i = 0; i <= Math.round(1.0 * 30); i++) moments.push(['fall', i / 30]);
  for (const [move, t] of moments) {
    const s = skeletonAt(mob, move, t);
    const lumps = boarLumps(boarPoseAt(move, t));
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
          assert.ok(q >= 1, `${move}: ${name} in its ${o.name} at ${t.toFixed(2)} s (${q.toFixed(2)})`);
        }
      }
    }
  }
});
