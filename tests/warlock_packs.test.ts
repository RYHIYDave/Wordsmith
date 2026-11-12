// THE WARLOCK KEPT IN PACKS (render/baked.ts warlockPacksOf, render/warlock_packs.ts; the queue's
// finish-mage-and-warlock-eight-sides, 12 Nov 2026, at his word: “Why don’t you pack him away?”). Held here:
//   1. as the game has him (WARLOCK_UP and LIVING_SHADOW off) nothing of his is packed;
//   2. the man brought up, from eight sides, where the game is played: his run held; his stand (blazing, its own), bolt, curse,
//      smoke step, struck, fall and the change each a pack, one a side; nothing of his card packed;
//   3. the Living Shadow: its run held; its stand, dropping down, each rear-up, each slash standing and walking, Damning, smoke
//      step, struck and burning out each a pack;
//   4. what is asked for ahead: what he shows, from his side, and what a press may make him show next.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { packsOf } from '../src/render/baked';
import type { BakeKey, PackOf } from '../src/render/baked';
import { makeWarlockArt } from '../src/art/warlock_art';
import { WARLOCK_UP } from '../src/art/warlock_up';
import { LIVING_SHADOW } from '../src/art/shadow_art';
import { heroSides } from '../src/art/sides';
import { bakeLists } from '../src/art/heroes3';
import type { AnimSet } from '../src/art/actor_types';
import { warlockAskAhead } from '../src/render/warlock_packs';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
paintWithoutCanvas();

const key = (place: BakeKey['place']): BakeKey => ({ cls: 'warlock', place, vet: false });
const sidesOf = (place: BakeKey['place']): AnimSet[] => {
  const look = place === 'demon' ? { form: 'demon' as const, place: 'dungeon' as const } : place === 'blaze' ? { form: 'man' as const, place: 'dungeon' as const, blaze: true } : { form: 'man' as const, place: place as 'town' | 'dungeon' | 'card' };
  return heroSides(makeWarlockArt(look));
};
const switches = <T>(up: boolean, shadow: boolean, f: () => T): T => {
  const was = [WARLOCK_UP.on, LIVING_SHADOW.on];
  WARLOCK_UP.on = up;
  LIVING_SHADOW.on = shadow;
  try {
    return f();
  } finally {
    [WARLOCK_UP.on, LIVING_SHADOW.on] = was;
  }
};
/** The pack each named list of a side is in ('' held, '?' the list is not there). */
function named(side: AnimSet, plan: (PackOf | null)[]): Record<string, string> {
  const lists = bakeLists(side);
  const at = (l: readonly unknown[] | undefined): string => {
    if (!l || !l.length) return '?';
    const i = lists.indexOf(l as never);
    return i < 0 ? '?' : plan[i]?.pack ?? '';
  };
  const c = side.clips ?? {};
  return {
    idle: at(side.idle), walk: at(side.walk), attack: at(c.attack?.frames), attack2: at(c.attack2?.frames), heavy: at(c.heavy?.frames),
    leap: at(c.leap?.frames), land: at(c.land?.frames), reel: at(c.reel?.frames), lurch: at(c.lurch?.frames), fall: at(c.fall?.frames),
    change: at(c.change?.frames), start: at(side.start?.frames), stop: at(side.stops?.[0]?.frames), walkSlash: at(c.attackWalk?.[0]?.frames),
  };
}

test('1. as the game has him, nothing of his is packed', () => {
  switches(false, false, () => {
    for (const place of ['town', 'dungeon', 'blaze', 'demon', 'card'] as const) assert.equal(packsOf(key(place), sidesOf(place)), null, place);
  });
});

test('2. the man brought up: his run held; his stand, spells, step, struck, fall and the change each a pack, one a side', () => {
  switches(true, true, () => {
    for (const place of ['dungeon', 'town', 'blaze'] as const) {
      const sides = sidesOf(place);
      const plan = packsOf(key(place), sides);
      assert.ok(plan && plan.length === 8, `${place}: eight sides planned`);
      sides.forEach((side, v) => {
        const n = named(side, plan![v]);
        assert.equal(n.walk, '', `${place} side ${v}: his run held`);
        assert.equal(n.idle, place === 'blaze' ? 'standBlaze' : 'stand', `${place} side ${v}: his stand`);
        assert.deepEqual([n.attack, n.heavy, n.leap, n.land, n.reel, n.lurch, n.fall], ['bolt', 'curse', 'step', 'step', 'struck', 'struck', 'fall'], `${place} side ${v}: his moves`);
        assert.equal(n.change, place === 'town' ? '?' : 'change', `${place} side ${v}: the change`);
        assert.ok(plan![v].every((p) => !p || p.lead), 'every list\'s first frame held');
      });
    }
    assert.equal(packsOf(key('card'), sidesOf('card')), null, 'nothing of his card');
  });
});

test('3. the Living Shadow: its run held; every other move of it a pack, one a side', () => {
  switches(true, true, () => {
    const sides = sidesOf('demon');
    const plan = packsOf(key('demon'), sides);
    assert.ok(plan && plan.length === 2, 'its two sides planned');
    sides.forEach((side, v) => {
      const n = named(side, plan![v]);
      assert.equal(n.walk, '', 'its run held');
      assert.deepEqual(
        [n.idle, n.start, n.stop, n.attack, n.attack2, n.walkSlash, n.heavy, n.leap, n.land, n.reel, n.lurch, n.change],
        ['it-stand', 'it-drop', 'it-rear0', 'it-slashL', 'it-slashR', 'it-walkSlash0', 'it-damning', 'it-step', 'it-step', 'it-struck', 'it-struck', 'it-burn'],
        `side ${v}`,
      );
    });
  });
  // (the game's own demon, with no rearing up, is not packed: the switch for the Living Shadow off)
  switches(true, false, () => assert.equal(packsOf(key('demon'), sidesOf('demon')), null, 'the game\'s demon not packed'));
});

test('4. asked for ahead: what he shows from his side, and what a press may make him show next', () => {
  const asked = (h: Parameters<typeof warlockAskAhead>[1], full = false, town = false, over = false): string[] => {
    const out: string[] = [];
    warlockAskAhead((p, s, now) => out.push(`${p}:${s}${now ? '!' : ''}`), h, full, town, over);
    return out;
  };
  // (facing down and right: side 0; straight down: 2, 'toward'; up the screen: the demon from behind, 1)
  assert.deepEqual(asked({ fx: 1, fy: 0 }), ['stand:0!', 'bolt:0', 'curse:0', 'step:0'], 'a man standing in a fight');
  assert.deepEqual(asked({ fx: 0.71, fy: 0.71 }, true), ['standBlaze:2!', 'bolt:2', 'curse:2', 'step:2', 'change:2'], 'his pact full: blazing, and the change');
  assert.deepEqual(asked({ fx: 1, fy: 0 }, false, true), ['stand:0!'], 'in town only his stand');
  assert.deepEqual(asked({ fx: 0.71, fy: 0.71, change: { to: 'demon', t: 0, dur: 2.4 } }), ['change:2!', 'it-stand:0'], 'changing: the change, then its stand');
  assert.deepEqual(asked({ fx: -0.71, fy: -0.71, form: 'demon', change: { to: 'man', t: 0, dur: 2 } }), ['it-burn:1!', 'stand:6'], 'burning out: it, then his stand');
  assert.deepEqual(asked({ fx: -0.71, fy: -0.71, form: 'demon' }), ['it-stand:1!', 'it-slashL:1', 'it-slashR:1', 'it-damning:1'], 'the demon in a fight');
  assert.deepEqual(asked({ fx: 1, fy: 0 }, false, false, true), ['fall:0!'], 'his life run out: his fall');
});
