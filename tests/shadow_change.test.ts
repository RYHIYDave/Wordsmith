// THE CHANGE INTO THE LIVING SHADOW, AND ITS HIDE CARRIED BY ITS BONES (dev/shadow_change.ts, dev/demon_new.ts carry; the
// queue's finish-mage-and-warlock-eight-sides, 12 Nov 2026). What can be counted:
//   its hide carried by its bones: in the still's own pose nothing is turned at all (a still is as it was, to the pixel);
//   with its chest turned, what its chest carries turns with it;
//   the change is the game's own until he begins to become it (dev/warlock_change.ts: the very same picture);
//   it ends in its stance up on two legs exactly (his word, 11 Nov: “Yes, all on two legs (Recommended)”), and its roar
//   begins from that stance, so there is no jump into the roar;
//   each part of it grows and never shrinks, from nothing before the change to whole at its end;
//   and nothing of it is cut off at the edge of its scene.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { solve } from '../src/art/skeleton';
import type { Posed, Rot, Skeleton, V3 } from '../src/art/skeleton';
import { DEMON_UP, WOLF_B, carry } from '../src/dev/demon_new';
import type { Kit } from '../src/dev/demon_new';
import { MORPH_AT, ROAR_AT, becoming, changeFrame } from '../src/dev/warlock_change';
import { SHADOW_CHANGE_ALL, SHADOW_GROWTH, shadowChangeFrame, shadowChangeRig, shadowChangeRoar } from '../src/dev/shadow_change';
import { warlockSpells } from '../src/dev/warlock_spells';
import { shadowPose } from '../src/dev/shadow_moves';
import { CHANGE_SCENE } from '../src/dev/warlock_fx';
import { paintWithoutCanvas } from './helpers';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void } = nodeAssert;
paintWithoutCanvas();

const JOINTS = ['pelvis', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'] as const;
const far = (a: Skeleton, b: Skeleton): number => Math.max(...JOINTS.map((j) => Math.hypot((a[j] as V3)[0] - (b[j] as V3)[0], (a[j] as V3)[1] - (b[j] as V3)[1], (a[j] as V3)[2] - (b[j] as V3)[2])));
const STILL = solve(WOLF_B, DEMON_UP as Posed);

test('its hide carried by its bones: in the still\'s own pose nothing is turned; with its chest turned, what its chest carries turns with it', () => {
  const kit = (s: Skeleton): Kit => ({ s, rest: STILL } as unknown as Kit);
  const v: V3 = [-4, 0, 7.5];
  // (the same pose solved again: the very same numbers, not near them)
  const again = solve(WOLF_B, DEMON_UP as Posed);
  assert.deepEqual(carry(kit(again), 'chest', v), v, 'unturned in the still');
  assert.deepEqual(carry(kit(again), 'hips', v), v);
  // (its chest turned a quarter round to its left: what it carries a quarter round too)
  const turned = { ...again, chest: again.chest.map((r) => [-r[1], r[0], r[2]]) as unknown as Rot } as Skeleton;
  const c = carry(kit(turned), 'chest', [1, 0, 0]);
  // (the world's forward as the still had it beside its chest, carried: it lies to its chest now as it lay to it then)
  const was = [STILL.chest[0][0], STILL.chest[0][1], STILL.chest[0][2]];
  const now = [turned.chest[0][0], turned.chest[0][1], turned.chest[0][2]];
  const dotWas = was[0] * 1 + was[1] * 0 + was[2] * 0;
  const dotNow = now[0] * c[0] + now[1] * c[1] + now[2] * c[2];
  assert.ok(Math.abs(dotWas - dotNow) < 1e-9, `as it lay to its chest then, it lies to it now (${dotWas} ${dotNow})`);
  // (and without a still to carry from, nothing is turned: the other looks of the record)
  assert.deepEqual(carry({ s: turned } as unknown as Kit, 'chest', v), v);
});

test('the change: the game\'s own until he begins to become it; it ends in its stance up on two legs exactly; its roar begins from that stance', () => {
  const change = warlockSpells().find((m) => m.name.startsWith('Tapped'));
  assert.ok(change, 'the change');
  if (!change) return;
  // (before he begins to become it: the very picture of the game's change)
  for (const t of [0, MORPH_AT / 2, MORPH_AT - 1e-3]) {
    for (const view of ['front', 'back'] as const) {
      const mine = shadowChangeFrame(view, t).d.px;
      const its = changeFrame(view, t).d.px;
      assert.ok(mine.w === its.w && mine.h === its.h && mine.d.every((b, i) => b === its.d[i]), `at ${t.toFixed(2)} s from ${view}: the game's own change`);
    }
  }
  // (whole: its frame and its stance exactly)
  const end = shadowChangeRig(change, ROAR_AT);
  assert.equal(end.k, 1);
  assert.ok(end.B === WOLF_B && end.q === (DEMON_UP as Posed), 'its build and its stance');
  // (a picture before it is whole, it is all but there: no jump)
  const near = shadowChangeRig(change, ROAR_AT - 1 / 30);
  const d0 = far(solve(near.B, near.q), STILL);
  assert.ok(d0 < 4, `a picture before it is whole, its joints within ${d0.toFixed(2)} of its stance`);
  // (its roar begins from its stance)
  const r0 = far(solve(WOLF_B, shadowPose(shadowChangeRoar(), 0)), STILL);
  assert.ok(r0 < 0.5, `its roar's first picture is its stance (${r0.toFixed(3)})`);
  assert.ok(Math.abs(SHADOW_CHANGE_ALL - ROAR_AT - shadowChangeRoar().long) < 0.05, 'the change ends as its roar does');
});

test('each part of it grows and never shrinks: nothing before the change, whole at its end', () => {
  for (const [part, g] of Object.entries(SHADOW_GROWTH)) {
    assert.ok(g.start > 0 && g.start < g.end && g.end <= 1 && g.from >= 0 && g.from < 1, `${part}: when it grows`);
  }
  // (the change's own easing: none before, all after)
  assert.equal(becoming(MORPH_AT - 1e-6), 0);
  assert.equal(becoming(ROAR_AT + 1e-6), 1);
});

test('nothing of it cut off at the edge of its scene, from in front, behind and turned, as it changes', () => {
  for (const t of [MORPH_AT + 0.3, MORPH_AT + 0.75, MORPH_AT + 1.2, ROAR_AT - 1 / 30]) {
    for (const [view, turn] of [['front', 0], ['back', 0], ['front', -90], ['front', 135]] as const) {
      const px = shadowChangeFrame(view, t, turn).d.px;
      assert.equal(px.w, CHANGE_SCENE.w);
      let edge = 0;
      let seen = 0;
      for (let y = 0; y < px.h; y++) {
        for (let x = 0; x < px.w; x++) {
          if (!px.d[(y * px.w + x) * 4 + 3]) continue;
          seen++;
          if (x === 0 || y === 0 || x === px.w - 1 || y === px.h - 1) edge++;
        }
      }
      assert.ok(seen > 2000, `at ${t.toFixed(2)} s from ${view} turned ${turn}: it is there (${seen})`);
      assert.equal(edge, 0, `at ${t.toFixed(2)} s from ${view} turned ${turn}: nothing on the scene's edge`);
    }
  }
});
