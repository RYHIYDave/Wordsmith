// THE WARDEN'S NEW MOVES (src/art/monster_warden.ts, WARDEN_MOVES; mkit.ts crawlOut). The owner's yes
// in the main chat, 9 Oct 2026, by 08:15: the boss a swing, his slam, his fan of bolts, and his
// skeleton summon; and to the art chat, 09:30, of the slam: "He can keep the slam.  I just don’t want
// it overused". Behind a switch that is off. So:
//   1. the switch is off, and while it is he has no new moves; and every frame he had is the same with
//      it on (the switch only adds);
//   2. with it on he swings and calls the dead, each a clip as an attack is (the blow, or the rising,
//      on its frame);
//   3. every frame of them paints, wears the enemy's pink edge, and has nothing of the friend's cyan;
//   4. the swing's blow leaves a streak of its fire, and its warning is not the slam's;
//   5. calling the dead, his hand goes up over his helm and embers rise off the floor round his feet;
//      and the dead he calls CRAWL OUT OF THE GROUND (his word, by 10:18: "I’d like them to crawl out
//      of the ground when summoned"; his yes to it by 10:23; mkit.ts crawlOut, behind CRAWL_OUT, off):
//      nothing of a skeleton at first but the pit, then its hand and skull, then all of it standing,
//      the pit gone.
//   run: tsx --test tests/warden_moves.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, Clip } from '../src/art/actor_types';
import { BLADE, CYAN, GLINT, SPARK } from '../src/art/kit';
import { CRAWL_OUT, ENEMY_RIM, FLAME } from '../src/art/mkit';
import { makeSkeletonArt } from '../src/art/monster_bones';
import { SUMMON_RISE, WARDEN_MOVES, WARDEN_SWING_HIT, makeWardenArt } from '../src/art/monster_warden';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

function withMoves<T>(make: () => T): T {
  const was = WARDEN_MOVES.on;
  WARDEN_MOVES.on = true;
  try {
    return make();
  } finally {
    WARDEN_MOVES.on = was;
  }
}

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
const key = (c: string): string => rgba(c).slice(0, 3).join(',');
const frameAt = (c: Clip, t: number): Sprite => c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
function count(sp: Sprite, colours: ReadonlyArray<string>, below = -Infinity): number {
  const want = new Set(colours.map(key));
  const p = paintingOf(sp);
  let n = 0;
  for (let y = 0; y < p.h; y++) {
    if (y < below) continue;
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      if (p.d[i + 3] > 0 && want.has(`${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`)) n++;
    }
  }
  return n;
}
/** The highest painted row of a frame, as far above its floor point as it is (picture pixels). */
function top(sp: Sprite): number {
  const p = paintingOf(sp);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3] > 0) return Math.round(sp.ay * (sp.density ?? 1)) - y;
  return 0;
}
function frames(art: ActorArt): { name: string; sp: Sprite }[] {
  const out: { name: string; sp: Sprite }[] = [];
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    s.idle.forEach((sp, i) => out.push({ name: `${view} idle ${i}`, sp }));
    s.walk.forEach((sp, i) => out.push({ name: `${view} walk ${i}`, sp }));
    s.clips?.attack?.frames.forEach((sp, i) => out.push({ name: `${view} slam ${i}`, sp }));
    s.clips?.heavy?.frames.forEach((sp, i) => out.push({ name: `${view} volley ${i}`, sp }));
    s.clips?.die?.frames.forEach((sp, i) => out.push({ name: `${view} death ${i}`, sp }));
  }
  return out;
}

test('the switch is off; while it is he has no new moves, and every frame he had is the same with it on', () => {
  assert.equal(WARDEN_MOVES.on, false);
  const off = makeWardenArt();
  assert.ok(off.front.clips?.moves === undefined && off.back.clips?.moves === undefined, 'no new moves with the switch off');
  const on = withMoves(makeWardenArt);
  const a = frames(off);
  const b = frames(on);
  assert.equal(a.length, b.length, 'as many frames');
  for (let i = 0; i < a.length; i++) assert.equal(unlike(a[i].sp, b[i].sp), 0, `${a[i].name} is the same with the switch on`);
});

test('with it on he swings and calls the dead, each a clip as an attack is', () => {
  const art = withMoves(makeWardenArt);
  for (const s of [art.front, art.back]) {
    const m = s.clips?.moves;
    assert.ok(m?.swing && m.swing.frames.length > 25 && Math.abs((m.swing.hit ?? 0) - WARDEN_SWING_HIT) < 1 / 30 + 1e-9, 'his swing, its blow on its frame');
    assert.ok(m?.summon && m.summon.frames.length > 40 && Math.abs((m.summon.hit ?? 0) - SUMMON_RISE) < 1 / 30 + 1e-9, 'his calling the dead, the rising on its frame');
  }
});

test('every frame of them paints, wears the enemy’s pink edge, and has nothing of the friend’s cyan', () => {
  const rim = key(ENEMY_RIM);
  const art = withMoves(makeWardenArt);
  for (const s of [art.front, art.back]) {
    for (const [name, c] of Object.entries(s.clips?.moves ?? {})) {
      c.frames.forEach((sp, i) => {
        const p = paintingOf(sp);
        let painted = 0;
        let edge = 0;
        for (let j = 0; j < p.d.length; j += 4) {
          if (p.d[j + 3] === 0) continue;
          painted++;
          const k = `${p.d[j]},${p.d[j + 1]},${p.d[j + 2]}`;
          if (k === rim) edge++;
          assert.ok(!FRIEND.has(k) && !cyanGlow(p.d[j], p.d[j + 1], p.d[j + 2]), `${name} ${i}: a friend's colour (${k})`);
        }
        assert.ok(painted > 1500, `${name} ${i}: only ${painted} pixels`);
        assert.ok(edge > 80, `${name} ${i}: the pink edge (${edge} pixels)`);
        for (const l of sp.lights ?? []) assert.ok(!cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number])), `${name} ${i}: a cyan light`);
      });
    }
  }
});

test('the swing’s blow leaves a streak of its fire, and its warning is not the slam’s', () => {
  const art = withMoves(makeWardenArt);
  for (const [view, s] of [['facing you', art.front], ['facing away', art.back]] as const) {
    const swing = s.clips?.moves?.swing as Clip;
    const held = frameAt(swing, WARDEN_SWING_HIT - 0.04);
    const blow = frameAt(swing, WARDEN_SWING_HIT);
    const fire = [FLAME[3], FLAME[4]];
    assert.ok(count(blow, fire) > count(held, fire) + 60, `${view}: the blow leaves a streak of fire (${count(held, fire)} then ${count(blow, fire)} pixels)`);
    const slam = s.clips?.attack as Clip;
    const slamHeld = frameAt(slam, (slam.hit ?? 0.95) * 0.8);
    assert.ok(unlike(held, slamHeld) > 1200, `${view}: the swing's warning is not the slam's (${unlike(held, slamHeld)} pixels differ)`);
  }
});

test('calling the dead, his hand goes up over his helm and embers rise round his feet; and the dead crawl out of the ground', () => {
  const art = withMoves(makeWardenArt);
  for (const [view, s] of [['facing you', art.front], ['facing away', art.back]] as const) {
    const summon = s.clips?.moves?.summon as Clip;
    const standing = s.idle[0];
    const risen = frameAt(summon, SUMMON_RISE + 0.2);
    assert.ok(top(risen) > top(standing) + 6, `${view}: his hand over his helm (${top(standing)} then ${top(risen)} pixels up)`);
    // (embers: the enemy's fire low down, round his feet)
    const low = (sp: Sprite): number => count(sp, [FLAME[1], FLAME[2], FLAME[3], FLAME[4]], Math.round(sp.ay * (sp.density ?? 1)) - 16);
    assert.ok(low(risen) > low(frameAt(summon, 0.2)), `${view}: embers rise off the floor (${low(frameAt(summon, 0.2))} then ${low(risen)})`);
  }
  // the dead crawl out of the ground: with the switch off the skeleton has no crawl; with it on, out it comes
  assert.ok(makeSkeletonArt().front.clips?.moves?.crawl === undefined, 'no crawl with its switch off');
  const was = CRAWL_OUT.on;
  CRAWL_OUT.on = true;
  let skel: ActorArt;
  try {
    skel = makeSkeletonArt();
  } finally {
    CRAWL_OUT.on = was;
  }
  for (const [view, s] of [['facing you', skel.front], ['facing away', skel.back]] as const) {
    const crawl = s.clips?.moves?.crawl as Clip;
    assert.ok(crawl && crawl.frames.length >= 20, `${view}: its crawl`);
    const first = crawl.frames[1];
    const last = crawl.frames[crawl.frames.length - 1];
    const bone = (sp: Sprite): number => paintingOf(sp).d.reduce((n, v, i) => (i % 4 === 3 && v > 0 ? n + 1 : n), 0);
    assert.ok(top(first) < 12, `${view}: at first nothing of it above the floor but the pit (${top(first)} up)`);
    assert.ok(top(frameAt(crawl, 0.8)) > 18, `${view}: then its hand and skull (${top(frameAt(crawl, 0.8))} up)`);
    assert.ok(top(last) >= top(s.idle[0]) - 2 && unlike(last, s.idle[0]) < bone(s.idle[0]) * 0.25, `${view}: and at last it stands, the pit gone`);
  }
});
