// Tests for the ranger's new stances and moves (art/moves3.ts RANGER_STANCES, with game/defs.ts
// RANGER_ARROW; the art chat, 8 Oct 2026). The owner, 15:38: "When you run, the ranger is
// crouched, but when you stop he pops back up.  I want him to stay crouched when he stops in
// battle." He said yes to each part: 15:57, 16:28, 16:41 and 17:07; and in the main chat at 20:27
// to putting them into the game as Version 19.4. So the switches are ON from Version 19.4; switched
// off, he is as he was before (for pictures beside the new).
//   run: tsx --test tests/ranger_stances.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { makeHeroArt3 } from '../src/art/heroes3';
import { GRIP, MOVES3, RANGER_STANCES, SETTLES, UNITS_PER_TILE, arrowTip, useRangerStances } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { bonesAt, solve } from '../src/art/skeleton';
import { RANGER_ARROW } from '../src/game/defs';
import type { Sprite } from '../src/engine/px';
import { Figure } from '../src/render/figure';
import type { FigureState } from '../src/render/figure';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

/** Every move of the ranger's that the switch changes, by its short name. */
const HIS = ['rstand', 'rtown', 'rrun', 'rtownrun', 'shot', 'volley', 'roll', 'rreel', 'rlurch', 'rfall', 'squirrel', 'sighting', 'rdraw'];
const now = (k: string): string => JSON.stringify({ rest: MOVES3[k].rest, motion: MOVES3[k].motion, ready: MOVES3[k].ready });
const all = (): Map<string, string> => new Map(HIS.map((k) => [k, now(k)]));
/** His moves as the game starts with them (the switch on, since Version 19.4). */
const LOADED = all();
/** His moves as they were before Version 19.4 (the switch off), and the new ones (switched on again). */
useRangerStances(false);
const BEFORE = all();
useRangerStances(true);
const NEW = all();
/** With the switch on, as the game has it. */
const on = (fn: () => void): void => {
  useRangerStances(true);
  try {
    fn();
  } finally {
    useRangerStances(true);
  }
};
/** With the switch off for a while (him as he was before Version 19.4), and on again after. */
const off = (fn: () => void): void => {
  useRangerStances(false);
  try {
    fn();
  } finally {
    useRangerStances(true);
  }
};

test('the switches are on, since Version 19.4: the game starts with his new moves', () => {
  assert.equal(RANGER_STANCES.on, true);
  assert.equal(RANGER_ARROW.on, true);
  for (const k of HIS) assert.equal(LOADED.get(k), NEW.get(k), `${k}: the game starts with the new one`);
  assert.ok((MOVES3.rrun.stride ?? 0) > 0);
  assert.ok(MOVES3.roll.tumble !== undefined);
});

test('switched off and on again, his moves are the new ones exactly; off, they are as they were before', () => {
  off(() => {
    assert.equal(RANGER_STANCES.on, false);
    assert.equal(RANGER_ARROW.on, false);
    for (const k of HIS) assert.equal(MOVES3[k].stride, undefined, `${k} has no stride with the switch off`);
    assert.equal(MOVES3.roll.tumble, undefined);
    for (const k of ['rstand', 'shot', 'volley', 'roll', 'rreel', 'rfall', 'sighting', 'rdraw', 'rrun', 'rtownrun']) assert.ok(now(k) !== NEW.get(k), `${k} is not the new one with the switch off`);
    for (const k of HIS) assert.equal(now(k), BEFORE.get(k), `${k} is as it was before`);
  });
  assert.equal(RANGER_ARROW.on, true);
  for (const k of HIS) assert.equal(now(k), NEW.get(k), `${k} is the new one again`);
});

test('his runs grip with the switch, and the others\' do not', () => {
  on(() => {
    assert.equal(GRIP.on, false);
    assert.ok((MOVES3.rrun.stride ?? 0) > 0);
    assert.ok((MOVES3.rtownrun.stride ?? 0) > 0);
    for (const k of ['krun', 'mrun', 'ktownrun']) assert.equal(MOVES3[k].stride, undefined, `${k} is today's`);
  });
});

test('in battle he stands as low as he runs', () => {
  on(() => {
    const head = (m: Move3, t: number): number => solve(m.build, bonesAt(m.motion.keys, m.rest, t)).head[2];
    const run = MOVES3.rrun;
    const end = run.motion.keys[run.motion.keys.length - 1].at;
    let sum = 0;
    for (let i = 0; i < 24; i++) sum += head(run, (end * i) / 24);
    const stand = head(MOVES3.rstand, 0);
    assert.ok(Math.abs(stand - sum / 24) < 1.5, `standing ${stand.toFixed(1)}, running ${(sum / 24).toFixed(1)}`);
    // (and upright in town: today's town stance)
    assert.ok(head(MOVES3.rtown, 0) > stand + 4);
  });
});

test('he shoots from the crouch without moving his feet, and the arrow is gone from the string when it goes', () => {
  on(() => {
    const shot = MOVES3.shot;
    const end = shot.motion.keys[shot.motion.keys.length - 1].at;
    const at = (t: number) => bonesAt(shot.motion.keys, shot.rest, t);
    const first = at(0);
    for (let t = 0; t <= end + 1e-9; t += 1 / 30) {
      const q = at(t);
      assert.ok(Math.abs(q.lfx - first.lfx) < 1e-6 && Math.abs(q.rfx - first.rfx) < 1e-6 && q.lfz < 1e-6 && q.rfz < 1e-6, `feet at ${t.toFixed(3)}`);
    }
    const hit = shot.motion.hit as number;
    assert.ok(at(hit - 1 / 30).draw >= 0.2, 'on the string the frame before');
    assert.ok(at(hit).draw < 0.2, 'gone in the frame of the blow');
    assert.ok(!shot.motion.keys.some((k) => k.pose.prop === 3), 'no streak of its own');
    assert.ok(!MOVES3.volley.motion.keys.some((k) => k.pose.prop === 4), 'no fan of its own');
  });
});

test('the game\'s arrows leave from where the picture\'s are', () => {
  on(() => {
    for (const [key, from, height] of [['shot', RANGER_ARROW.from, RANGER_ARROW.height], ['volley', RANGER_ARROW.volleyFrom, RANGER_ARROW.volleyHeight]] as const) {
      const m = MOVES3[key];
      // (the frame shown before the blow)
      const tip = arrowTip(m, Math.round((m.motion.hit as number) * 30 - 1) / 30);
      assert.ok(Math.abs(tip[0] / UNITS_PER_TILE - from) < 0.01, `${key}: ${(tip[0] / UNITS_PER_TILE).toFixed(3)} tiles ahead, the game has ${from}`);
      assert.ok(Math.abs(tip[2] / 2 - height) < 0.2, `${key}: ${(tip[2] / 2).toFixed(2)} game px up, the game has ${height}`);
    }
  });
});

test('his art has the new pictures with the switch on (the game\'s own), and none of them without', () => {
  const check = (yes: boolean): void => {
    const art = makeHeroArt3();
    const dungeon = art.of('ranger', { twoHanded: false, town: false });
    const town = art.of('ranger', { twoHanded: false, town: true });
    for (const set of [dungeon.front, dungeon.back]) {
      assert.equal(set.stops?.length ?? 0, yes ? SETTLES : 0);
      assert.equal(set.start !== undefined, yes);
      assert.equal(set.walkWays?.length ?? 0, yes ? 3 : 0);
      assert.equal(set.clips?.attackWalk?.length ?? 0, yes ? 4 : 0);
      assert.equal(set.clips?.heavyWalk?.length ?? 0, yes ? 4 : 0);
      assert.equal(set.clips?.land !== undefined, yes, 'the roll\'s coming up');
    }
    assert.equal(town.front.stops?.length ?? 0, yes ? SETTLES : 0);
    // (in town nothing is fought: the pictures only a fight shows, made walking, are not made there)
    for (const set of [town.front, town.back]) {
      assert.equal(set.walkWays, undefined);
      assert.equal(set.clips?.attackWalk, undefined);
      assert.equal(set.clips?.heavyWalk, undefined);
      assert.equal(set.clips?.reelWalk, undefined);
      assert.equal(set.clips?.lurchWalk, undefined);
    }
    for (const cls of ['warrior', 'mage'] as const) {
      const a = art.of(cls, { twoHanded: cls === 'warrior', town: false });
      assert.equal(a.front.stops, undefined);
      assert.equal(a.front.clips?.attackWalk, undefined);
    }
  };
  check(true);
  off(() => check(false));
});

// ---------------------------------------------------------------------------------------------
// The game's chooser, with made-up art: frames that are only names

const named = (name: string): Sprite => ({ img: name as unknown as HTMLCanvasElement, w: 20, h: 30, ax: 10, ay: 29 });
const frames = (tag: string, n: number): Sprite[] => Array.from({ length: n }, (_, i) => named(`${tag} ${i}`));
const clip = (tag: string, n: number, fps: number, hit?: number): Clip => (hit === undefined ? { frames: frames(tag, n), fps } : { frames: frames(tag, n), fps, hit });
const STRIDE = 2;
function facing(tag: string): AnimSet {
  return {
    idle: frames(`${tag}idle`, 24), walk: frames(`${tag}walk`, 25), attack: frames(`${tag}a`, 3), idleFps: 10, walkFps: 60, walkStride: STRIDE,
    stops: Array.from({ length: SETTLES }, (_, k) => clip(`${tag}stop${k}`, 8, 30)),
    start: clip(`${tag}start`, 9, 60), startAt: 0.2,
    walkWays: [frames(`${tag}left`, 25), frames(`${tag}back`, 25), frames(`${tag}right`, 25)],
    clips: {
      attack: clip(`${tag}shot`, 16, 30, 5 / 30),
      attackWalk: [clip(`${tag}shot ahead`, 16, 30, 5 / 30), clip(`${tag}shot left`, 16, 30, 5 / 30), clip(`${tag}shot back`, 16, 30, 5 / 30), clip(`${tag}shot right`, 16, 30, 5 / 30)],
      roll: clip(`${tag}roll`, 14, 35),
      land: clip(`${tag}land`, 9, 30),
    },
  };
}
const ART: ActorArt = { front: facing(''), back: facing('back ') };
const BASE: FigureState = { anim: 'idle', animT: 0, fx: 1, fy: 0, attackSkill: 0, attackAge: 0, attackWind: 0.16, leapK: -1, walked: 0, moved: [0, 0] };
const name = (s: Sprite): string => s.img as unknown as string;

test('stopping out of the run, he comes to a stand by the stop from where the run was', () => {
  const fig = new Figure();
  let walked = 0;
  let last = '';
  for (let i = 0; i < 20; i++) {
    walked += STRIDE / 25;
    last = name(fig.frame(ART, { ...BASE, anim: 'walk', walked, moved: [STRIDE / 25, 0] }, 1 / 60, 0, 0, false));
  }
  assert.ok(last.startsWith('start') || last.startsWith('walk'), last);
  const s = name(fig.frame(ART, { ...BASE, anim: 'idle', walked, moved: [0, 0] }, 1 / 60, 0, 0, false));
  assert.ok(/^stop\d 0$/.test(s), s);
});

test('setting off from a stand, the start comes first, by how far he has gone', () => {
  const fig = new Figure();
  fig.frame(ART, { ...BASE }, 1 / 60, 0, 0, false);
  const s0 = name(fig.frame(ART, { ...BASE, anim: 'walk', walked: 0, moved: [0.01, 0] }, 1 / 60, 0, 0, false));
  assert.equal(s0, 'start 0');
  const s1 = name(fig.frame(ART, { ...BASE, anim: 'walk', walked: (STRIDE * 4) / 25, moved: [0.01, 0] }, 1 / 60, 0, 0, false));
  assert.equal(s1, 'start 4');
  const s2 = name(fig.frame(ART, { ...BASE, anim: 'walk', walked: (STRIDE * 12) / 25, moved: [0.01, 0] }, 1 / 60, 0, 0, false));
  assert.equal(s2, `walk ${Math.round(0.2 * 25) + 12}`);
});

test('backing away from the way he faces, his run steps back; across, it steps across', () => {
  const fig = new Figure();
  fig.frame(ART, { ...BASE, anim: 'walk', walked: 5, moved: [0.05, 0] }, 1 / 60, 0, 0, false);
  const back = name(fig.frame(ART, { ...BASE, anim: 'walk', walked: 5.05, moved: [-0.05, 0] }, 1 / 60, 0, 0, false));
  assert.ok(back.startsWith('back '), back);
  // (facing screen down-right, world +x: world -y is up-right on the screen, his left)
  const left = name(fig.frame(ART, { ...BASE, anim: 'walk', walked: 5.1, moved: [0, -0.05] }, 1 / 60, 0, 0, false));
  assert.ok(left.startsWith('left '), left);
});

test('shooting while he walks, his legs run under it the way he goes; standing, it is the shot as it was', () => {
  const fig = new Figure();
  const ahead = name(fig.frame(ART, { ...BASE, anim: 'attack', attackAge: 0.05, walked: 1, moved: [0.05, 0] }, 1 / 60, 0, 0, false));
  assert.ok(ahead.startsWith('shot ahead '), ahead);
  const back = name(fig.frame(ART, { ...BASE, anim: 'attack', attackAge: 0.07, walked: 1.05, moved: [-0.05, 0] }, 1 / 60, 0, 0, false));
  assert.ok(back.startsWith('shot back '), back);
  const still = name(fig.frame(ART, { ...BASE, anim: 'attack', attackAge: 0.09, walked: 1.05, moved: [0, 0] }, 1 / 60, 0, 0, false));
  assert.ok(/^shot \d+$/.test(still), still);
});

test('after a roll, standing, he comes up (clips.land), not a frame of the run', () => {
  const fig = new Figure();
  fig.frame(ART, { ...BASE, anim: 'walk', rollK: 0.5 }, 1 / 60, 0, 0, false);
  fig.frame(ART, { ...BASE, anim: 'walk', rollK: 0.99 }, 1 / 60, 0, 0, false);
  // (the rules still call him walking in the step the roll ends)
  const end = name(fig.frame(ART, { ...BASE, anim: 'walk', rollK: -1 }, 1 / 60, 0, 0, false));
  assert.ok(end.startsWith('land'), end);
});
