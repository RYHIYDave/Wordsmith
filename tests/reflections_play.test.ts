// FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW, IN PLAY (the queue's wire-floor-18-new-reflections, 12 Nov 2026): floor
// 18's figure (src/art/act1_figs/reflection.ts) and rules (src/game/act1_rules/reflection.ts) behind REFLECTIONS_UP, off.
//   1. OFF, AS IT WAS: the switch is off; every form's look the first reflections' (front and back only); the forms by class
//      (the Warrior's weapon makes no other); the two acts as they were; each blow its style's, landing at its style's moment;
//   2. ON, EACH FORM ITS HERO AS HE LOOKS NOW, from his sides (eight, or two while his are two), each blow landing when its
//      picture's does and played as long (UP: the art's clips' `hit`, its tracks' length), each standing as tall as SIZE_UP says;
//      the Tinkerer throwing her vials, tap and hold (his word);
//   3. THE WARRIOR HOLDS WHAT HE HOLDS: with his war axe or his maul, that form (on); the knight's whatever he holds (off);
//   4. A FORM MAKES ONLY ITS OWN BLOWS, each act its warning and then its picture's length;
//   5. A FIGURE SEEN FROM EIGHT SIDES, as the bestiary, the painter and the bake count it: all eight sides' lists (figureLens), each
//      in the painting order (paintOrder), and a frame given to any side lands in its own place (giveFrame).
//   run: node tools/unit.mjs --only reflections_play

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';
import { act1Fig } from '../src/art/act1_figs/index';
import { SIZE_UP } from '../src/art/act1_figs/reflection';
import { formGlass } from '../src/art/reflections_up';
import { framesOf, giveFrame, paintOrder } from '../src/art/bestiary';
import { EIGHT_ORDER, heroSides, isEight } from '../src/art/sides';
import { figureLens } from '../src/render/monsters_bake_list';
import { FORMS, FORM_OF, REFLECT, REFLECTIONS_UP, RULES, STYLE_OF, UP, WEAPON_FORM, blowOf, formOf, hitOf } from '../src/game/act1_rules/reflection';
import type { Monster } from '../src/game/state';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { equal(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void };

paintWithoutCanvas();

/** Floor 18's figure of a form, made now (the switch as it is now). */
const figOf = (form: number): ActorArt => {
  const f = act1Fig(form === 0 ? 'reflection' : `reflection:${form}`);
  if (!f) throw new Error(`no figure for form ${form}`);
  return f.make();
};
const one = (form: number): Monster => ({ kind: 'reflection', form, x: 10, y: 10, fx: 1, fy: 0 }) as unknown as Monster;
const near = (a: number, b: number): boolean => Math.abs(a - b) < 1e-3;
/** The switch set for one test, and put back as it was (it is on in the game since his yes of 12 Nov 2026). */
const at = (v: boolean, fn: () => void): void => {
  const was = REFLECTIONS_UP.on;
  REFLECTIONS_UP.on = v;
  try {
    fn();
  } finally {
    REFLECTIONS_UP.on = was;
  }
};
const on = (fn: () => void): void => at(true, fn);
const off = (fn: () => void): void => at(false, fn);

test('1. OFF, AS IT WAS: the first reflections, the forms by class, the two acts, each blow its style\'s at its moment', () => off(() => {
  assert.equal(REFLECTIONS_UP.on, false, 'REFLECTIONS_UP is off');
  for (let form = 0; form < FORMS; form++) {
    const art = figOf(form);
    assert.ok(!isEight(art), `form ${form}: the first reflections' look, from in front and behind`);
  }
  for (const cls of Object.keys(FORM_OF) as (keyof typeof FORM_OF)[]) {
    assert.equal(formOf(cls, ['battleaxe', 'warhammer']), FORM_OF[cls], `${cls}: by class`);
  }
  assert.equal(RULES!.acts.map((a) => a.id).join(' '), 'reflection:tap reflection:hold reflection:out', 'its acts');
  assert.equal(RULES!.acts[0].long, REFLECT.tap.warn + REFLECT.tap.play);
  assert.equal(RULES!.acts[1].long, REFLECT.hold.warn + REFLECT.hold.play);
  for (let form = 0; form < 6; form++) {
    const s = STYLE_OF[form];
    const m = one(form);
    assert.equal(hitOf(m, { id: 'reflection:tap' }), REFLECT.tap.warn + REFLECT.hit[s].tap, `form ${form}: its tap's moment`);
    assert.equal(hitOf(m, { id: 'reflection:hold' }), REFLECT.hold.warn + REFLECT.hit[s].hold, `form ${form}: its hold's moment`);
    const tap = blowOf(m, { id: 'reflection:tap' });
    const hold = blowOf(m, { id: 'reflection:hold' });
    if (s === 'blade') {
      assert.deepEqual([tap.k, hold.k], ['fan', 'ring'], `form ${form}: a cut, a whirl`);
      if (tap.k === 'fan') assert.deepEqual([tap.reach, tap.half, tap.far], [REFLECT.blade.reach, REFLECT.blade.half, REFLECT.blade.reach + 0.2]);
      if (hold.k === 'ring') assert.deepEqual([hold.r, hold.at, hold.far, hold.sfx], [REFLECT.blade.whirl, 'self', REFLECT.blade.whirl, 'whirl']);
    } else if (s === 'bow') {
      assert.deepEqual([tap.k, hold.k], ['shot', 'shot'], `form ${form}: an arrow, a volley`);
      if (tap.k === 'shot' && hold.k === 'shot') assert.deepEqual([tap.n, hold.n, hold.spread, hold.dmg, hold.near, tap.far], [1, REFLECT.bow.volley, REFLECT.bow.spread, 0.8, 2, REFLECT.bow.far]);
    } else {
      assert.deepEqual([tap.k, hold.k], ['wave', 'lob'], `form ${form}: a wave, an orb`);
      if (hold.k === 'lob') assert.deepEqual([hold.burst, hold.speed, hold.after, hold.dmg, hold.near, hold.far], [REFLECT.magic.orb.burst, REFLECT.magic.orb.speed, REFLECT.magic.orb.after, 1.5, 2, REFLECT.magic.far]);
    }
  }
}));

test('2. ON, EACH FORM ITS HERO AS HE LOOKS NOW: his sides, each blow at his picture\'s moment and as long, as tall as SIZE_UP', () => {
  on(() => {
    for (let form = 0; form < FORMS; form++) {
      const h = formGlass(form);
      const art = figOf(form);
      const sides = heroSides(art);
      assert.equal(sides.length, h.sides.length, `form ${form}: his sides`);
      const c = art.front.clips!;
      assert.ok(near(UP[form].tap.hit, c.attack!.hit ?? -1), `form ${form}: its tap lands as his picture's (${UP[form].tap.hit} vs ${c.attack!.hit})`);
      assert.ok(near(UP[form].hold.hit, c.heavy!.hit ?? -1), `form ${form}: its hold lands as his picture's (${UP[form].hold.hit} vs ${c.heavy!.hit})`);
      assert.ok(near(UP[form].tap.play, h.tap.long), `form ${form}: its tap played as long as his (${UP[form].tap.play} vs ${h.tap.long})`);
      assert.ok(near(UP[form].hold.play, h.hold.long), `form ${form}: its hold played as long as his (${UP[form].hold.play} vs ${h.hold.long})`);
      assert.equal(hitOf(one(form), { id: `reflection:tap${form}` }), REFLECT.tap.warn + UP[form].tap.hit);
      // (its head, standing, from in front: within a game pixel and a half of SIZE_UP, a weapon held over it aside)
      const s = art.front.idle[0];
      const px = paintingOf(s);
      const d = s.density ?? 1;
      let top = Infinity;
      for (let y = 0; y < px.h && top === Infinity; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] > 0) { top = y; break; }
      const tall = (s.ay * d - top) / d;
      assert.ok(Math.abs(tall - SIZE_UP[form].top) <= 2.6, `form ${form}: stands ${tall} tall, SIZE_UP ${SIZE_UP[form].top}`);
    }
    // (THE TINKERER THROWS HER VIALS, tap and hold, no whistle: his word of 12 Nov 2026, “I think just have the tinkerer throw her
    // vials if there’s no golem”: one, then three side by side, her toss's picture for both)
    const tap = UP[FORM_OF.tinkerer].tap.blow;
    const hold = UP[FORM_OF.tinkerer].hold.blow;
    assert.ok(tap.k === 'lob' && tap.look === 'vial' && tap.n === 1, 'her tap: a vial');
    assert.ok(hold.k === 'lob' && hold.look === 'vial' && hold.n === 3, 'her hold: three vials');
    assert.ok(!UP.some((u) => u.tap.blow.sfx === 'whistle' || u.hold.blow.sfx === 'whistle'), 'no whistle');
    const her = figOf(FORM_OF.tinkerer).front.clips!;
    assert.equal(her.heavy!.frames.length, her.attack!.frames.length, 'her hold her toss');
    // (the size the game reads follows the switch)
    assert.equal(act1Fig('reflection:3')!.size.top, SIZE_UP[3].top);
  });
  off(() => assert.equal(act1Fig('reflection:3')!.size.top, 35, 'off: the mage\'s stand-in\'s'));
});

test('3. THE WARRIOR HOLDS WHAT HE HOLDS: his war axe\'s form, his maul\'s; the great sword\'s with none picked', () => {
  on(() => {
    assert.equal(formOf('warrior', []), 0);
    assert.equal(formOf('warrior', ['greatsword']), 0);
    assert.equal(formOf('warrior', ['battleaxe']), WEAPON_FORM.axe);
    assert.equal(formOf('warrior', ['warhammer']), WEAPON_FORM.hammer);
    assert.equal(formOf('mage', ['battleaxe']), FORM_OF.mage);
    // (and his copy holds it: its stance is his with it, not his great sword's)
    const sword = paintingOf(figOf(0).front.idle[0]);
    const axe = paintingOf(figOf(WEAPON_FORM.axe).front.idle[0]);
    const maul = paintingOf(figOf(WEAPON_FORM.hammer).front.idle[0]);
    const same = (a: typeof sword, b: typeof sword): boolean => a.w === b.w && a.h === b.h && a.d.every((v, i) => v === b.d[i]);
    assert.ok(!same(sword, axe) && !same(sword, maul) && !same(axe, maul), 'three looks');
  });
});

test('4. A FORM MAKES ONLY ITS OWN BLOWS, each act its warning and then its picture\'s length', () => {
  on(() => {
    const acts = RULES!.acts;
    assert.equal(acts.length, FORMS * 2 + 1, 'each form\'s tap and hold, and stepping out');
    for (let form = 0; form < FORMS; form++) {
      const m = one(form);
      for (const a of acts) {
        if (a.id === 'reflection:out') continue;
        const mine = a.id.endsWith(`p${form}`) || a.id.endsWith(`d${form}`);
        const b = blowOf(m, a);
        const ok = RULES!.can!(null as never, m, a, (b.near + b.far) / 2, true);
        assert.equal(ok, mine, `form ${form}, ${a.id}`);
        if (!mine) continue;
        const tap = a.id.startsWith('reflection:tap');
        const u = tap ? UP[form].tap : UP[form].hold;
        assert.ok(near(a.long, (tap ? REFLECT.tap.warn : REFLECT.hold.warn) + u.play), `${a.id}: as long as its warning and its picture`);
        assert.ok(near(a.hit, (tap ? REFLECT.tap.warn : REFLECT.hold.warn) + u.hit), `${a.id}: its blow where its picture's lands`);
      }
    }
  });
});

test('5. A FIGURE SEEN FROM EIGHT SIDES: all eight counted, painted in order, a frame given to any side lands in its place', () => {
  on(() => {
    const art = figOf(1);
    assert.ok(isEight(art), 'the Ranger\'s copy is seen from eight sides');
    const sets = heroSides(art);
    assert.equal(sets.length, EIGHT_ORDER.length);
    const lens = figureLens(art);
    assert.equal(lens.length, 8, 'its lists counted from eight sides');
    assert.deepEqual(lens[0], framesOf(art.front).map((l) => l.length), 'the front first');
    assert.deepEqual(lens[1], framesOf(art.back).map((l) => l.length), 'the back second');
    const order = paintOrder(art);
    const total = lens.reduce((n, ls) => n + ls.reduce((a, b) => a + b, 0), 0);
    assert.equal(new Set(order.map(([v, l, i]) => `${v},${l},${i}`)).size, total, 'every frame of every side in the painting order, once');
    assert.deepEqual(order[0], [0, 0, 0], 'standing, from in front, first');
    // (a frame given to its last side, as the painter gives one: it is that place's, and no other's)
    const set7 = sets[7] as AnimSet;
    const given = { w: 1, h: 1, ax: 0, ay: 0, img: null } as unknown as Sprite;
    assert.ok(giveFrame(art, 7, 1, 2, given), 'given');
    assert.equal(framesOf(set7)[1][2], given, 'in its place');
    assert.ok(framesOf(sets[0])[1][2] !== given, 'not the front\'s');
  });
});
