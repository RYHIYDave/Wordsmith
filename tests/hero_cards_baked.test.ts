// THE HERO CARDS FROM THE BAKE (12 Nov 2026; his words, 11 Nov: “Then, character screen lags.  Selecting a character lags.”):
// everything a class card shows of a hero is in the bake's places for his card (render/baked.ts bakedPlaces; art/heroes3.ts
// cardLists), so that once the cards' group has come NOTHING IS PAINTED WHERE THE GAME IS DRAWN while the cards are up: not
// his standing, not his running when his card is chosen, not his coming to a stand when another is, not what he does left
// standing, not his making ready. Each hero's card is played here through a figure as ui/panels.ts plays it, every baked place
// given a stand-in picture first, as the bake gives them (HeroArt.give): no frame may be painted, and none stood in for.
//   run: tsx --test tests/hero_cards_baked.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { bakeLists, cardLists, makeHeroArt3, readyList } from '../src/art/heroes3';

const READY_LIST = readyList();
import { lookOfPlace } from '../src/art/heroes';
import { CARD_FACING, heroSides, isEight } from '../src/art/sides';
import type { EightArt } from '../src/art/sides';
import { HEAVY, LEFT_TO_PAINTER, PAINTING } from '../src/art/kit';
import { Figure } from '../src/render/figure';
import type { FigureState } from '../src/render/figure';
import { bakeGroups, bakedFirst, bakedPlaces } from '../src/render/baked';
import { VETERAN } from '../src/game/veteran';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

const A = makeHeroArt3();
const keys = bakeGroups(VETERAN.on).cards;
/** The stand-in pictures given, and which place each stands for. */
const where = new Map<Sprite, [number, number]>();  // (side, list)

test('the cards are all six heroes, and each hero\'s card has his standing and running first, then the rest of what a card shows', () => {
  assert.deepEqual(keys.map((k) => k.cls), ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler']);
  for (const k of keys) {
    const art = A.of(k.cls, { ...lookOfPlace('card'), vet: k.vet });
    const sides = heroSides(art);
    const lists = sides.map((s) => bakeLists(s));
    const c = cardLists(sides);
    // (the side a card's hero is seen from: HIS FRONT, every hero's, down and to the right, so that none turns for a thing of his
    // own: his words, 13 Nov 2026, “All the sprites should be facing the same way.  Probably down right like the brawler”)
    const v = 0;
    assert.equal(sides[v], art.front);
    assert.equal(c.first, 2, `${k.cls}: standing and running`);
    assert.deepEqual(c.at[0], [v, lists[v].indexOf(sides[v].idle)], `${k.cls}: standing first, as he is seen on his card`);
    assert.deepEqual(c.at[1], [v, lists[v].indexOf(sides[v].walk)], `${k.cls}: then running`);
    const has = (side: number, l: readonly Sprite[]): boolean => c.at.some(([a, b]) => a === side && lists[a][b] === l);
    const places = bakedPlaces(sides, true);
    assert.equal(places.length, c.at.reduce((n, [a, b]) => n + lists[a][b].length, 0) + c.one.length, `${k.cls}: every frame of every list a card shows, and its single frames`);
    // (no single frames: a hero seen from his front is never turned back from it as a thing of his own ends)
    assert.deepEqual(c.one, []);
    assert.equal(new Set(places.map((p) => p.join(':'))).size, places.length, `${k.cls}: none twice`);
    assert.equal(bakedFirst(sides, true), sides[v].idle.length + sides[v].walk.length);
    // (what the art has for a card, it is baked: coming to a stand, of the side he is seen from; his gestures and making ready, of the front)
    for (const s of sides[v].stops ?? []) assert.ok(has(v, s.frames), `${k.cls}: a coming to a stand`);
    for (const g of [art.front.clips?.idleA, art.front.clips?.idleB]) if (g) assert.ok(has(0, g.frames), `${k.cls}: a gesture`);
    if (art.front.clips?.ready) {
      assert.equal(lists[0][READY_LIST], art.front.clips.ready.frames, `${k.cls}: making ready is the last list`);
      assert.ok(has(0, art.front.clips.ready.frames));
    }
  }
  // (and the heroes who have them have them: were these to go, this test would be holding nothing)
  const of = (cls: 'warrior' | 'ranger' | 'mage' | 'warlock') => A.of(cls, lookOfPlace('card'));
  for (const cls of ['warrior', 'ranger', 'mage'] as const) assert.ok(isEight(of(cls)) && of(cls).front.clips?.idleA && of(cls).front.clips?.ready, `${cls}: from eight sides; a gesture, making ready`);
  for (const cls of ['ranger', 'mage'] as const) assert.ok(((of(cls) as EightArt).front.stops?.length ?? 0) > 0, `${cls}: comes to a stand out of his run`);
  assert.ok(of('warlock').front.clips?.ready, 'the Warlock makes ready');
});

test('a card played with its baked places given: nothing is painted where the game is drawn, and nothing stood in for', () => {
  for (const k of keys) {
    const art = A.of(k.cls, { ...lookOfPlace('card'), vet: k.vet });
    const sides = heroSides(art);
    const lists = sides.map((s) => bakeLists(s));
    // (the bake's pictures, as render/baked.ts hands them: a stand-in for each place)
    let given = 0;
    for (const [v, l, i] of bakedPlaces(sides, true)) {
      const s = { img: { width: 1, height: 1 }, w: 1, h: 1, ax: 0, ay: 0 } as unknown as Sprite;
      where.set(s, [v, l]);
      if (A.give!(k.cls, 'card', v, l, i, s, k.vet)) given++;
    }
    assert.ok(given > 0, `${k.cls}: taken in`);
    const painted = PAINTING.frames;
    const stoodIn = HEAVY.deferred;
    const shown = new Set<Sprite[]>();
    const see = (s: Sprite): void => {
      const at = where.get(s);
      assert.ok(at, `${k.cls}: a frame shown on his card that the bake did not give`);
      if (at) shown.add(lists[at[0]][at[1]]);
    };
    // (as ui/panels.ts plays a card: its figure faces as every card's hero does, CARD_FACING (down and to the right), begins its
    // first gesture a second and a half after the cards come up and the next 4.2 s after each; chosen, it runs on the spot by the
    // clock; another chosen, it comes to a stand)
    const fig = new Figure();
    fig.reset(1.5, 0, 4.2);
    let t = 0;
    const dt = 1 / 30;
    const play = (anim: 'idle' | 'walk', secs: number, gestures = true): void => {
      for (let n = Math.round(secs / dt); n > 0; n--) {
        t += dt;
        const st: FigureState = { anim, animT: t, fx: CARD_FACING.fx, fy: CARD_FACING.fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
        LEFT_TO_PAINTER.on = true;
        try {
          see(fig.frame(art, st, dt, 0, 0, gestures));
        } finally {
          LEFT_TO_PAINTER.on = false;
        }
      }
    };
    // left standing long enough for both gestures and the loop between them
    play('idle', 22);
    // chosen and let go eight times, stopped at every part of his stride (each of his comings to a stand)
    for (let n = 0; n < 8; n++) {
      play('walk', 0.6 + n * 0.037);
      play('idle', 0.5);
    }
    // picked: his making ready, every frame of it (panels.ts shows them by the clock, Figure.show)
    const ready = art.front.clips?.ready;
    if (ready) for (const s of ready.frames) see(fig.show(s, dt));
    assert.equal(PAINTING.frames, painted, `${k.cls}: no frame painted`);
    assert.equal(HEAVY.deferred, stoodIn, `${k.cls}: no frame stood in for by its nearest`);
    // (and all of it was in fact shown)
    const seen = sides[0];
    assert.ok(shown.has(seen.idle) && shown.has(seen.walk), `${k.cls}: stood and ran`);
    if (art.front.clips?.idleA) assert.ok(shown.has(art.front.clips.idleA.frames), `${k.cls}: his first gesture`);
    if (art.front.clips?.idleB) assert.ok(shown.has(art.front.clips.idleB.frames), `${k.cls}: his second gesture`);
    if (seen.stops?.length) assert.ok(seen.stops.some((s) => shown.has(s.frames)), `${k.cls}: came to a stand out of his run`);
    if (ready) assert.ok(shown.has(ready.frames), `${k.cls}: made ready`);
  }
});
