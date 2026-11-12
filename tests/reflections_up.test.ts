// FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW (src/art/reflections_up.ts). A MOCK-UP: behind REFLECTIONS_UP, off.
// Each hero's own painter's frames turned to glass by the first reflections' steps (src/art/reflections.ts, his yes), from every
// side the hero has; its stepping out of a mirror and its shattering the first reflections' (src/art/reflections_fx.ts).
//   1. the switch is off, and of the game only floor 18's own figure imports it;
//   2. A REFLECTION HAS THE HERO'S SIDES, AND WHAT IT DOES IN THE GAME: his stance, his run, his tap and his hold, each list as
//      long as the hero's own and its blow at the same moment; its shattering; from in front, its stepping out;
//   3. ITS FRAMES (each hero, from in front and from another side: standing, running, his tap's blow and his hold's, its
//      shattering and its stepping out): NO CYAN AT ALL, no light it gives off cyan; every pixel whole or empty but the pink
//      edge; and the pink edge round it;
//   4. THE HERO'S SHAPE: its silhouette the hero's own, pixel for pixel, in the same place;
//   5. the Hush's dull pink in its eyes, and cracks on it, from in front.
//   run: node tools/unit.mjs --only reflections_up

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import type { Px, Sprite } from '../src/engine/px';
import { rgba } from '../src/engine/px';
import type { ClassId } from '../src/game/types';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { EYE, isCyan } from '../src/art/reflections';
import { STEP_OUT } from '../src/art/reflections_fx';
import { REFLECTIONS_UP, glassAt, heroGlass, makeReflectionUpArt } from '../src/art/reflections_up';
import type { HeroGlass, Track } from '../src/art/reflections_up';
import { makeWarriorUpArt } from '../src/art/warrior_up_art';
import { makeRangerUpArt } from '../src/art/ranger_up_art';
import { makeMageUpArt } from '../src/art/mage_up_art';
import { makeTinkererArt } from '../src/art/tinkerer_art';
import { makeVeteranArt } from '../src/art/veteran_art';
import { makeWarlockArt } from '../src/art/warlock_art';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

const CLASSES: ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
const art = makeReflectionUpArt();
/** The hero's own pictures in a dungeon, as the game makes them. */
function heroArt(cls: ClassId): ActorArt {
  if (cls === 'warrior') return makeWarriorUpArt('dungeon');
  if (cls === 'ranger') return makeRangerUpArt('dungeon');
  if (cls === 'mage') return makeMageUpArt('dungeon');
  if (cls === 'tinkerer') return makeTinkererArt();
  if (cls === 'brawler') return makeVeteranArt();
  return makeWarlockArt({ form: 'man', place: 'dungeon' });
}
const sidesOf = (a: ActorArt): string[] => Object.keys(a).filter((k) => typeof (a as unknown as Record<string, unknown>)[k] === 'object');

/** What is wrong with a frame of a reflection (none: an empty list): cyan, a light cyan, a pixel neither whole nor empty nor the pink edge, no pink edge. */
function faults(px: Px, lights: ReadonlyArray<{ color: string }> = []): string[] {
  const out: string[] = [];
  const d = px.d;
  const [er, eg, eb] = rgba(ENEMY_RIM);
  let edge = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 0) continue;
    if (isCyan(d[i], d[i + 1], d[i + 2])) out.push(`cyan at ${(i / 4) % px.w},${Math.floor(i / 4 / px.w)}`);
    if (a !== 255) {
      if (d[i] === er && d[i + 1] === eg && d[i + 2] === eb && a === RIM_ALPHA) edge++;
      else out.push(`a pixel neither whole nor the edge (alpha ${a})`);
    }
    if (out.length > 3) break;
  }
  if (!edge) out.push('no pink edge');
  for (const l of lights) {
    const [r, g, b] = rgba(l.color);
    if (isCyan(r, g, b)) out.push(`a cyan light ${l.color}`);
  }
  return out;
}
/** The moments of a hero's moves a check looks at: standing, running, his tap's blow and his hold's. */
function moments(h: HeroGlass): [Track, number][] {
  return [
    [h.stand, 0],
    [h.run, h.run.from + (h.run.long - h.run.from) * 0.4],
    [h.tap, h.tap.hit ?? h.tap.long / 2],
    [h.hold, h.hold.hit ?? h.hold.long / 2],
  ];
}
/** From in front, and from one other side (behind, or a side of the eight between). */
const twoSides = (h: HeroGlass): string[] => ['front', h.sides.includes('away') ? 'away' : 'back'];

test("1. the switch is on (his yes of 12 Nov 2026), and of the game only floor 18's own figure imports it", () => {
  assert.equal(REFLECTIONS_UP.on, true);
  // (brought into the game behind its switch by the queue's wire-floor-18-new-reflections, 12 Nov 2026, and switched on at his
  // “Yes, hand it to main (Recommended)”: floor 18's figure, art/act1_figs/reflection.ts, takes it with the switch on)
  const root = path.join('src');
  const users: string[] = [];
  for (const f of fs.readdirSync(root, { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('reflections_up.ts')) continue;
    if (/from ['"][^'"]*reflections_up['"]/.test(fs.readFileSync(path.join(root, f), 'utf8'))) users.push(f.replace(/\\/g, '/'));
  }
  assert.equal(users.sort().join(' '), 'art/act1_figs/reflection.ts', 'game files that import it');
});

test("2. A REFLECTION HAS THE HERO'S SIDES, and his stance, run, tap and hold as long as his, its blow at the same moment; its shattering; its stepping out from in front", () => {
  for (const cls of CLASSES) {
    const mine = art.of(cls) as unknown as Record<string, AnimSet>;
    const his = heroArt(cls) as unknown as Record<string, AnimSet>;
    assert.equal(sidesOf(mine as never).sort().join(','), sidesOf(his as never).sort().join(','), `${cls}: its sides`);
    for (const side of sidesOf(mine as never)) {
      const a = mine[side];
      const b = his[side];
      const at = `${cls} ${side}`;
      assert.equal(a.idle.length, b.idle.length, `${at}: its stance`);
      assert.equal(a.walk.length, b.walk.length, `${at}: its run`);
      assert.equal(a.idleFps, b.idleFps, `${at}: its stance's pace`);
      assert.equal(a.walkFps, b.walkFps, `${at}: its run's pace`);
      assert.equal(a.walkStride, b.walkStride, `${at}: its stride`);
      for (const k of ['attack', 'heavy'] as const) {
        const ca = a.clips?.[k];
        // (THE TINKERER'S HOLD IS HER VIAL TOSS, his word of 12 Nov 2026: “I think just have the tinkerer throw her vials if there’s
        // no golem”: her copy's hold is her own tap's picture)
        const cb = cls === 'tinkerer' && k === 'heavy' ? b.clips?.attack : b.clips?.[k];
        assert.ok(ca && cb, `${at}: ${k}`);
        assert.equal(ca!.frames.length, cb!.frames.length, `${at}: ${k}'s frames`);
        assert.equal(ca!.fps, cb!.fps, `${at}: ${k}'s pace`);
        assert.ok(Math.abs((ca!.hit ?? -1) - (cb!.hit ?? -1)) < 1e-9, `${at}: ${k}'s blow at the same moment (${ca!.hit} and ${cb!.hit})`);
      }
      assert.ok(a.clips?.die && a.clips.die.frames.length > 10, `${at}: its shattering`);
      assert.equal(!!a.clips?.moves?.stepOut, side === 'front', `${at}: its stepping out, from in front only`);
    }
  }
});

test('3. ITS FRAMES: NO CYAN AT ALL, every pixel whole or empty but the pink edge, the pink edge round it (each hero, two sides; its shattering and stepping out)', () => {
  for (const cls of CLASSES) {
    const h = heroGlass(cls);
    for (const side of twoSides(h)) {
      for (const [tr, t] of moments(h)) {
        const g = glassAt(h, tr, t, side);
        const bad = faults(g.px, g.lights);
        assert.equal(bad.length, 0, `${cls} ${side} ${tr.name} at ${t.toFixed(2)}: ${bad.join('; ')}`);
      }
    }
    const front = (art.of(cls) as unknown as Record<string, AnimSet>).front;
    const die = front.clips!.die!.frames;
    for (const i of [1, 6]) assert.equal(faults(paintingOf(die[i])).filter((f) => !f.startsWith('no pink')).length, 0, `${cls}: its shattering, frame ${i}`);
    const step = front.clips!.moves!.stepOut.frames as Sprite[];
    for (const t of [0.6, STEP_OUT.time]) {
      const s = step[Math.round(t * STEP_OUT.fps)];
      const bad = faults(paintingOf(s)).filter((f) => !f.startsWith('no pink') && !f.startsWith('a pixel'));
      assert.equal(bad.length, 0, `${cls}: its stepping out at ${t} s: ${bad.join('; ')}`);
    }
  }
});

test("4. THE HERO'S SHAPE: its silhouette the hero's own, pixel for pixel, in the same place", () => {
  for (const cls of CLASSES) {
    const h = heroGlass(cls);
    for (const [tr, t] of moments(h).slice(0, 3)) {
      const his = tr.paint(t, 'front').px;
      const mine = glassAt(h, tr, t, 'front').px;
      assert.equal(mine.w, his.w);
      let differ = 0;
      for (let i = 3; i < his.d.length; i += 4) if ((his.d[i] === 255) !== (mine.d[i] === 255)) differ++;
      assert.equal(differ, 0, `${cls} ${tr.name}: ${differ} pixels not his shape`);
    }
  }
});

test("5. the Hush's dull pink in its eyes, and cracks on it, from in front", () => {
  const [er, eg, eb] = rgba(EYE);
  for (const cls of CLASSES) {
    const h = heroGlass(cls);
    let eyes = 0;
    let cracks = 0;
    for (const [tr, t] of moments(h)) {
      const g = glassAt(h, tr, t, 'front');
      cracks += g.cracks;
      for (const [x, y] of g.eyes) {
        const i = (y * g.px.w + x) * 4;
        if (g.px.d[i] === er && g.px.d[i + 1] === eg && g.px.d[i + 2] === eb) eyes++;
      }
    }
    assert.ok(eyes > 0, `${cls}: its eyes in the Hush's pink`);
    assert.ok(cracks > 0, `${cls}: cracks on it`);
  }
});
