// THE NEW MONSTERS' ATTACKS (src/art/new_mobs3.ts; what they throw, src/art/mob_shots.ts): a mock-up,
// not in the game. The owner's picks of 9 Oct, by 09:30: the Golem "Hurl skulls (Recommended)"; the
// Shade and the Boneward warn by "Pose and a glint (Recommended)"; by 09:33, the Boneward's second
// attack "Spear throw". And his rules in the main chat (its post of 08:30): small things one attack,
// medium two, large two or three, always with a basic single-target one. So:
//   1. by its size: the Shade has its one attack, its rake, and nothing more; the Boneward its thrust
//      and its spear throw, with what goes with the throw (the shield bash while it has no spear,
//      picking the spear up, its stand and its plod with none); the Golem its club swing (its basic
//      attack), its skull throw, and its slam kept as a third for the rules to use or not;
//   2. each is a clip as the game takes a monster's moves (AnimSet.clips.moves): what is played once
//      has its `hit` on its frame; what goes round is a loop, a walk shown to match a pace;
//   3. every frame of them paints, wears the enemy's pink edge, and has nothing of the friend's cyan;
//   4. THE GLINT: the Shade's claws and the Boneward's spear-head glint through the wind-up, from
//      nothing to brightest just before the blow, and not at all once it lands;
//   5. the Boneward's spear leaves its hand as it throws, and is back in it when it picks it up, its
//      hand down on the floor where the spear lies; the Golem's skull is in its fist from taking it
//      until it throws, and its place on the shoulder empty till the throw is over;
//   6. the Golem's swing leaves a streak behind its club as the blow lands, and its warning is not
//      its slam's;
//   7. what they throw: the skull in flight turns over and wears the pink edge; its shadow on the
//      floor grows and darkens as it comes down (no circle: "It’s not the big red circles I have a
//      problem with, it’s that every attack is a big slam on the ground."); it bursts and is gone;
//      the spear flies over its shadow and lies on the floor; none of it cyan.
//   run: tsx --test tests/new_mobs_attacks.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, Clip } from '../src/art/actor_types';
import { BLADE, CYAN, GLINT, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { SKULL_BURST, drawSkullBurst, drawSkullShadow, drawSpearLying, drawSpearShot } from '../src/art/mob_shots';
import {
  BONEWARD, BW_BASH_HIT, BW_GRAB, BW_GRIP_AT, BW_HIT, BW_THROW_HIT, GOLEM, GOLEM_HIT, GOLEM_SWING_HIT, GOLEM_TAKE, GOLEM_THROW_END, GOLEM_THROW_HIT,
  SHADE, SHADE_HIT, handAt, makeBonewardArt3, makeGolemArt3, makeShadeArt3, makeSkullShotArt, paintMob, walkFpsAt,
} from '../src/art/new_mobs3';
import type { Mob, MobMove } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

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
const cyanColour = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
};
const painted = (p: Px): number => {
  let n = 0;
  for (let i = 3; i < p.d.length; i += 4) if (p.d[i] > 0) n++;
  return n;
};
/** How many pixels of two paintings of the same canvas differ. */
const differ = (a: Px, b: Px): number => {
  let n = 0;
  for (let i = 0; i < a.d.length; i += 4) if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2] || a.d[i + 3] !== b.d[i + 3]) n++;
  return n;
};
const frameAt = (c: Clip, t: number): Sprite => c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
/** A monster with one of its moves changed (to paint the same moment with and without a thing). */
function withMove(mob: Mob, which: string, change: Partial<MobMove>): Mob {
  if (which === 'attack') return { ...mob, attack: { ...mob.attack, ...change } };
  const more = mob.more ?? {};
  return { ...mob, more: { ...more, [which]: { ...more[which], ...change } } };
}

const SHADE_ART: ActorArt = makeShadeArt3();
const BW_ART: ActorArt = makeBonewardArt3();
const GOLEM_ART: ActorArt = makeGolemArt3();

test('by its size: the Shade one attack; the Boneward its thrust and its spear throw; the Golem its swing, its skull throw and the slam kept', () => {
  assert.equal(SHADE.more, undefined, 'the Shade (small) has only its rake');
  assert.ok(SHADE_ART.front.clips?.moves === undefined && SHADE_ART.back.clips?.moves === undefined, 'and no other moves as the game takes it');
  assert.deepEqual(Object.keys(BONEWARD.more ?? {}).sort(), ['bash', 'pickUp', 'standBare', 'throw', 'walkBare'], 'the Boneward (medium): its thrust, and the throw with what goes with it');
  assert.equal(BONEWARD.hit, BW_HIT, 'its thrust is its basic attack');
  assert.deepEqual(Object.keys(GOLEM.more ?? {}).sort(), ['slam', 'throw'], 'the Golem (large): its skull throw, and its slam kept');
  assert.ok(GOLEM.attack.sweep === true && GOLEM.hit === GOLEM_SWING_HIT, 'its basic attack is now the club swing, its blow at its own moment');
});

test('each is a clip as the game takes a monster’s moves: a blow on its frame, a loop going round, a walk to match a pace', () => {
  const once: [ActorArt, string, number][] = [
    [BW_ART, 'throw', BW_THROW_HIT],
    [BW_ART, 'bash', BW_BASH_HIT],
    [BW_ART, 'pickUp', BW_GRAB],
    [GOLEM_ART, 'throw', GOLEM_THROW_HIT],
    [GOLEM_ART, 'slam', GOLEM_HIT],
  ];
  for (const [art, name, hit] of once) {
    for (const s of [art.front, art.back]) {
      const c = s.clips?.moves?.[name];
      assert.ok(c && c.frames.length > 20 && c.loop === undefined, `${name}: a clip, played once`);
      assert.ok(Math.abs((c?.hit ?? -1) - hit) < 1 / 30 + 1e-9, `${name}: its moment (${c?.hit}) on its frame`);
    }
  }
  for (const s of [GOLEM_ART.front, GOLEM_ART.back]) assert.ok(Math.abs((s.clips?.attack?.hit ?? -1) - GOLEM_SWING_HIT) < 1e-9, 'the Golem’s attack clip is its swing');
  for (const s of [BW_ART.front, BW_ART.back]) {
    const stand = s.clips?.moves?.standBare as Clip;
    const walk = s.clips?.moves?.walkBare as Clip;
    assert.ok(stand.loop === 0 && stand.frames.length === BONEWARD.idleFrames && stand.fps === BONEWARD.idleFps, 'its stand with no spear goes round as its stand does');
    assert.ok(walk.loop === 0 && walk.frames.length === BONEWARD.walkFrames && walk.fps === BONEWARD.walkFps, 'its plod with no spear goes round as its plod does');
  }
  const quick = makeBonewardArt3(1.4);
  assert.ok(Math.abs((quick.front.clips?.moves?.walkBare as Clip).fps - walkFpsAt(BONEWARD, 1.4)) < 1e-9, 'its plod with no spear is shown to match another pace, as its plod is');
});

test('every frame of them paints, wears the enemy’s pink edge, and has nothing of the friend’s cyan', () => {
  const rim = rgba(ENEMY_RIM).slice(0, 3).join(',');
  const clips: [string, Clip][] = [];
  for (const [who, art] of [['Boneward', BW_ART], ['Golem', GOLEM_ART]] as const) {
    for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
      for (const [name, c] of Object.entries(s.clips?.moves ?? {})) clips.push([`${who} ${name} ${view}`, c]);
    }
  }
  for (const [view, s] of [['front', GOLEM_ART.front], ['back', GOLEM_ART.back]] as const) clips.push([`Golem swing ${view}`, s.clips?.attack as Clip]);
  for (const [view, s] of [['front', SHADE_ART.front], ['back', SHADE_ART.back]] as const) clips.push([`Shade rake ${view}`, s.clips?.attack as Clip]);
  for (const [name, c] of clips) {
    c.frames.forEach((sp, i) => {
      const p = paintingOf(sp);
      let n = 0;
      let edge = 0;
      for (let j = 0; j < p.d.length; j += 4) {
        if (p.d[j + 3] === 0) continue;
        n++;
        const k = `${p.d[j]},${p.d[j + 1]},${p.d[j + 2]}`;
        if (k === rim) edge++;
        assert.ok(!FRIEND.has(k) && !cyanGlow(p.d[j], p.d[j + 1], p.d[j + 2]), `${name} ${i}: a friend's colour (${k})`);
      }
      assert.ok(n > 400, `${name} ${i}: only ${n} pixels`);
      assert.ok(edge > 40, `${name} ${i}: the pink edge (${edge} pixels)`);
      for (const l of sp.lights ?? []) assert.ok(!cyanColour(l.color), `${name} ${i}: a cyan light`);
    });
  }
});

test('the glint: the Shade’s claws and the Boneward’s spear-head glint through the wind-up, brightest just before the blow, and not once it lands', () => {
  const winds: [Mob, string, number, number][] = [
    [SHADE, 'attack', SHADE.warn, SHADE_HIT],
    [BONEWARD, 'attack', BONEWARD.warn, BW_HIT],
    [BONEWARD, 'throw', 0.6, BW_THROW_HIT],
  ];
  for (const [mob, which, warn, hit] of winds) {
    const mv = which === 'attack' ? mob.attack : (mob.more?.[which] as MobMove);
    const glint = mv.glint as (t: number) => number;
    assert.ok(glint(0) < 0.05, `${mob.id} ${which}: no glint as it begins`);
    assert.ok(glint(warn) >= 0.5, `${mob.id} ${which}: a glint in its warning pose (${glint(warn).toFixed(2)})`);
    assert.ok(glint(hit - 0.02) > glint(warn), `${mob.id} ${which}: brightest just before the blow`);
    assert.ok(glint(hit) === 0 && glint(hit + 0.2) === 0, `${mob.id} ${which}: gone once the blow lands`);
    // (painted: the same moment with no glint has less light, and some pixels fewer; once it lands they are the same)
    const dull = withMove(mob, which, { glint: undefined });
    for (const view of ['front', 'back'] as const) {
      const lit = paintMob(mob, which, warn, view);
      const not = paintMob(dull, which, warn, view);
      assert.ok(lit.lights.length > not.lights.length, `${mob.id} ${which} ${view}: the glint is a light (${not.lights.length} then ${lit.lights.length})`);
      for (const l of lit.lights) assert.ok(!cyanColour(l.color), `${mob.id} ${which} ${view}: the glint is not cyan`);
      const after = paintMob(mob, which, hit + 0.1, view);
      const afterDull = paintMob(dull, which, hit + 0.1, view);
      assert.equal(after.lights.length, afterDull.lights.length, `${mob.id} ${which} ${view}: no glint once it lands`);
    }
  }
});

test('the Boneward’s spear leaves its hand as it throws and is back in it when it picks it up; the Golem’s skull is in its fist until it throws, its place on the shoulder empty', () => {
  const thrown = BONEWARD.more?.throw as MobMove;
  const pick = BONEWARD.more?.pickUp as MobMove;
  assert.ok(!thrown.bare?.(BW_THROW_HIT - 0.02) && thrown.bare?.(BW_THROW_HIT), 'the spear leaves its hand at the throw');
  for (const name of ['bash', 'standBare', 'walkBare']) assert.ok((BONEWARD.more?.[name] as MobMove).bare?.(0.3), `${name}: no spear in its hand`);
  assert.ok(pick.bare?.(BW_GRAB - 0.02) && !pick.bare?.(BW_GRAB), 'it has its spear again once its hand closes on it');
  for (const view of ['front', 'back'] as const) {
    const gone = painted(paintMob(BONEWARD, 'throw', BW_THROW_HIT + 0.05, view).px);
    const kept = painted(paintMob(withMove(BONEWARD, 'throw', { bare: () => false }), 'throw', BW_THROW_HIT + 0.05, view).px);
    assert.ok(kept - gone > 30, `${view}: the spear is gone from its hand (${kept} then ${gone} pixels)`);
  }
  // its hand goes down to the floor where the spear lies
  const hand = handAt(BONEWARD, 'pickUp', BW_GRAB);
  assert.ok(hand[2] < 4 && Math.hypot(hand[0] - BW_GRIP_AT[0], hand[1] - BW_GRIP_AT[1]) < 1.5, `its hand on the floor where the spear lies (${hand.map((v) => v.toFixed(1)).join(', ')})`);
  // the Golem's skull
  const hurl = GOLEM.more?.throw as MobMove;
  assert.ok(!hurl.skull?.(GOLEM_TAKE - 0.02) && hurl.skull?.(GOLEM_TAKE) && hurl.skull?.(GOLEM_THROW_HIT - 0.02) && !hurl.skull?.(GOLEM_THROW_HIT), 'a skull in its fist from taking it until it throws');
  assert.ok(hurl.bare?.(GOLEM_TAKE) && hurl.bare?.(GOLEM_THROW_HIT + 0.2) && !hurl.bare?.(GOLEM_THROW_END), 'its place on the shoulder empty until the throw is over');
  for (const view of ['front', 'back'] as const) {
    const held = paintMob(GOLEM, 'throw', 0.8, view).px;
    const none = paintMob(withMove(GOLEM, 'throw', { skull: () => false }), 'throw', 0.8, view).px;
    assert.ok(differ(held, none) > 40, `${view}: the skull in its fist (${differ(held, none)} pixels differ)`);
    const full = paintMob(withMove(GOLEM, 'throw', { bare: () => false }), 'throw', 1.2, view).px;
    const empty = paintMob(GOLEM, 'throw', 1.2, view).px;
    assert.ok(differ(full, empty) > 15, `${view}: the skull's place on its shoulder empty (${differ(full, empty)} pixels differ)`);
  }
});

test('the Golem’s swing leaves a streak behind its club as the blow lands, and its warning is not its slam’s', () => {
  const still: Mob = { ...GOLEM, hit: -1 };
  for (const view of ['front', 'back'] as const) {
    const blow = painted(paintMob(GOLEM, 'attack', GOLEM_SWING_HIT, view).px);
    const none = painted(paintMob(still, 'attack', GOLEM_SWING_HIT, view).px);
    assert.ok(blow - none > 40, `${view}: the streak (${none} then ${blow} pixels)`);
  }
  for (const [view, s] of [['facing you', GOLEM_ART.front], ['facing away', GOLEM_ART.back]] as const) {
    const swing = frameAt(s.clips?.attack as Clip, GOLEM.warn);
    const slam = frameAt(s.clips?.moves?.slam as Clip, 0.78);
    assert.ok(unlike(swing, slam) > 1200, `${view}: the swing's warning is not the slam's (${unlike(swing, slam)} pixels differ)`);
  }
});

/** A pen that keeps what it is asked to draw. */
function pen(): { g: CanvasRenderingContext2D; rects: { x: number; y: number; w: number; h: number; c: string; a: number }[]; ovals: { rx: number; a: number; c: string }[] } {
  const rects: { x: number; y: number; w: number; h: number; c: string; a: number }[] = [];
  const ovals: { rx: number; a: number; c: string }[] = [];
  let rx = 0;
  const p = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number): void {
      rects.push({ x, y, w, h, c: this.fillStyle, a: this.globalAlpha });
    },
    beginPath(): void {},
    ellipse(_x: number, _y: number, r: number): void {
      rx = r;
    },
    fill(): void {
      ovals.push({ rx, a: this.globalAlpha, c: this.fillStyle });
    },
  };
  return { g: p as unknown as CanvasRenderingContext2D, rects, ovals };
}
const ISO = (x: number, y: number): readonly [number, number] => [(x - y) * 16, (x + y) * 8];

test('what they throw: the skull turns and wears the pink edge; its shadow grows as it falls; it bursts and is gone; the spear flies and lies; none of it cyan', () => {
  const skulls = makeSkullShotArt();
  const rim = rgba(ENEMY_RIM).slice(0, 3).join(',');
  skulls.forEach((sp, i) => {
    const p = paintingOf(sp);
    let edge = 0;
    for (let j = 0; j < p.d.length; j += 4) {
      if (p.d[j + 3] === 0) continue;
      if (`${p.d[j]},${p.d[j + 1]},${p.d[j + 2]}` === rim) edge++;
      assert.ok(!cyanGlow(p.d[j], p.d[j + 1], p.d[j + 2]), `the skull ${i}: a cyan pixel`);
    }
    assert.ok(painted(p) > 30 && edge > 8, `the skull ${i}: painted, with the pink edge (${painted(p)}, ${edge})`);
  });
  assert.ok(unlike(skulls[0], skulls[2]) > 10, 'it turns over as it flies');
  // its shadow: small and faint while it is high, bigger and darker as it comes down
  const high = pen();
  drawSkullShadow(high.g, ISO, 2, 0, 90, 100);
  const low = pen();
  drawSkullShadow(low.g, ISO, 2, 0, 8, 100);
  assert.ok(low.ovals[0].rx > high.ovals[0].rx && low.ovals[0].a > high.ovals[0].a, 'its shadow grows and darkens as it comes down');
  assert.ok(high.ovals.length === 1 && low.ovals.length === 1, 'a shadow, and nothing else: no circle');
  // its burst
  const burst = pen();
  drawSkullBurst(burst.g, ISO, 2, 0, 0.05);
  const later = pen();
  drawSkullBurst(later.g, ISO, 2, 0, 0.4);
  const over = pen();
  drawSkullBurst(over.g, ISO, 2, 0, SKULL_BURST);
  assert.ok(burst.rects.length > 20 && later.rects.length > 10 && over.rects.length === 0, 'it bursts into bone, and is gone');
  // the spear, flying (over its shadow) and lying
  const fly = pen();
  drawSpearShot(fly.g, ISO, 2, 0, 12, 1, 0);
  const lie = pen();
  drawSpearLying(lie.g, ISO, 2, 0, 1, 0);
  const top = (r: { y: number }[]): number => Math.min(...r.map((q) => q.y));
  assert.ok(fly.rects.length > 20 && lie.rects.length > 20, 'the spear is drawn, flying and lying');
  assert.ok(top(fly.rects) < top(lie.rects) - 8, 'in flight it is up off the floor');
  for (const r of [...burst.rects, ...later.rects, ...fly.rects, ...lie.rects]) assert.ok(!cyanColour(r.c), `nothing cyan (${r.c})`);
});
