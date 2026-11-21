// SKINS FOR THE MAGE'S STAFF (art/staff_skins.ts, behind STAFF_SKINS, off; art/mage_up.ts StaffSkin, PLAIN_STAFF). His words,
// 13 Nov 2026: “can we just put a grey stick in the mage’s hand, build a basic skin for the staff, then have unique staves map
// over the grey stick the same way the basic staff does?”; his pick “Yes, split layer (Recommended)”; shown the three staves of
// his doc on her, 14 Nov: “Yes, all three (Recommended)”.
//   1. the switch is on (his yes, 14 Nov 2026: “Yes, switch them on (Recommended)”), and of the game only her art reads
//      art/staff_skins.ts (where she is drawn, baked and loaded with a staff: tests/staff_skins_game.test.ts);
//   2. her own staff is the first skin, and painted with it she is as she was painted before it was one (the same frame);
//   3. laid over her painted with no staff, each skin's layer gives back the whole frame painted with that staff, exactly; and
//      no pixel of a layer that is not wholly solid lies over one of hers (so the canvas, laying one over the other, does too);
//   4. each skin is a staff of its own: its layer differs from her own staff's, and its stone's light is the friend's cyan (the
//      Kindling Rod's, his yes 14 Nov 2026: “Yes, the Rod's right (Recommended)”, its fire's);
//   5. the hook, the crests and the fork are laid on her, not on the eye: a frame and the same frame turned to her other side
//      have the head on the same side of her.
// (A sample of her moves and sides, every few frames: the whole of every move from all eight sides was looked at once, 14 Nov
// 2026, in docs/staff_skins.md.)

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore - node typings are not part of this project
import { readdirSync, readFileSync } from 'node:fs';
import { paintWithoutCanvas } from './helpers';
import { paintMuMove } from '../src/art/mage_up_art';
import { MU_MOVES } from '../src/art/mage_up_moves';
import { PLAIN_STAFF } from '../src/art/mage_up';
import type { StaffAt } from '../src/art/mage_up';
import { CROOK_STAFF, EBB_STAFF, RESONANCE_STAFF, ROD_STAFF, STAFF_SKINS, STAFF_SKIN_LIST, headWay, laidOver, skinLayer } from '../src/art/staff_skins';
import { WU_SIDES } from '../src/art/warrior_up';
import { muPosed } from '../src/art/mage_up_art';

paintWithoutCanvas();

const same = (a: { d: Uint8ClampedArray }, b: { d: Uint8ClampedArray }): boolean => a.d.length === b.d.length && a.d.every((v, k) => v === b.d[k]);

test('1. the switch is on (his yes), and of the game only her art reads art/staff_skins.ts', () => {
  assert.equal(STAFF_SKINS.on, true);
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e: { name: string; isDirectory(): boolean }) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []));
  const readers = walk('src').filter((f) => f !== 'src/art/staff_skins.ts' && !f.startsWith('src/dev/') && /from '[^']*staff_skins'/.test(readFileSync(f, 'utf8'))).sort();
  // (only her art with a staff reads the staves: art/heroes3.ts. Which staff she holds (staffWorn), the switch, and her places
  // with each are in art/heroes.ts, read by render.ts, main.ts and the bake's groups (render/baked.ts), which must not take the
  // staves' art in: a group of the bake is marked by the code its heroes are painted with, tools/bake_marks.mjs.
  // tests/staff_skins_game.test.ts)
  assert.deepEqual(readers, ['src/art/heroes3.ts']);
});

test('2. her own staff is the first skin; painted with it she is the very frame she is painted as when nothing is said', () => {
  assert.equal(STAFF_SKIN_LIST[0], PLAIN_STAFF);
  assert.deepEqual(STAFF_SKIN_LIST.map((s) => s.id), ['plain', 'crook', 'ebb', 'resonance', 'rod']);
  for (const [key, t] of [['mstand', 0.5], ['wave', 0.4], ['mrun', 0.2]] as const) {
    for (const side of ['front', 'sideL', 'backL'] as const) {
      const a = paintMuMove(MU_MOVES[key], t, side);
      const b = paintMuMove(MU_MOVES[key], t, side, undefined, PLAIN_STAFF);
      assert.ok(same(a.px, b.px), `${key} ${t} ${side}`);
      assert.deepEqual(a.lights, b.lights);
    }
  }
});

test('3. each skin laid over her painted with no staff gives back the whole frame exactly; nothing partly solid lies over her', () => {
  let n = 0;
  for (const key of ['mstand', 'mrun', 'wave', 'orb', 'beam', 'mtown', 'mfall'] as const) {
    const m = MU_MOVES[key];
    const ks = m.motion.keys;
    const end = ks.length ? ks[ks.length - 1].at : 0;
    for (let t = 0; t <= end + 1e-9; t += Math.max(end / 2, 0.2)) {
      for (const side of WU_SIDES.filter((_, i) => i % 2 === 0)) {
        const her = paintMuMove(m, t, side, undefined, null);
        for (const skin of STAFF_SKIN_LIST) {
          const whole = paintMuMove(m, t, side, undefined, skin);
          const layer = skinLayer(whole.px, her.px);
          assert.ok(same(laidOver(her.px, layer), whole.px), `${skin.id} ${key} ${t.toFixed(2)} ${side}`);
          for (let k = 3; k < layer.d.length; k += 4) if (layer.d[k] > 0 && layer.d[k] < 255) assert.equal(her.px.d[k], 0, `${skin.id} ${key} ${side}: a partly solid pixel over her`);
          n++;
        }
      }
    }
  }
  assert.ok(n > 150, `${n} frames`);
});

test('4. each skin is a staff of its own, its stone lit in the friend\'s cyan (the Rod\'s fire an honest fire\'s)', () => {
  const m = MU_MOVES.mstand;
  const her = paintMuMove(m, 0.5, 'side', undefined, null);
  const plain = skinLayer(paintMuMove(m, 0.5, 'side').px, her.px);
  for (const skin of [CROOK_STAFF, EBB_STAFF, RESONANCE_STAFF, ROD_STAFF]) {
    const whole = paintMuMove(m, 0.5, 'side', undefined, skin);
    const layer = skinLayer(whole.px, her.px);
    assert.ok(!same(layer, plain), `${skin.id}: not her own staff`);
    const hers = new Set(her.lights.map((l) => JSON.stringify(l)));
    const own = whole.lights.filter((l) => !hers.has(JSON.stringify(l)));
    assert.equal(own.length, 1, `${skin.id}: its stone's light`);
    assert.equal(own[0].color, skin === ROD_STAFF ? '#ffc24a' : '#b8fff8', `${skin.id}: ${skin === ROD_STAFF ? 'its fire' : "the friend's cyan"}`);
  }
});

test('5. a head that is not the same both ways is laid on her: turned to her other side, the way it leans is hers', () => {
  // (her stance from in front and from behind: the way the head is laid is the same in the world, whichever way the eye is)
  const { q, s } = muPosed(MU_MOVES.mstand, 0.5);
  void q;
  const at = (eye: [number, number, number]): StaffAt => ({ s, q, p3: s.point, side3: [0, 0, 0], foot: s.handR, tip3: s.handR, bar: s.handR, eye, burn: 1, gale: 0, around: {} });
  const a = headWay(at([1, 0, 0]));
  const b = headWay(at([-1, 0, 0]));
  assert.deepEqual(a, b);
  // (square to the staff)
  assert.ok(Math.abs(a[0] * s.point[0] + a[1] * s.point[1] + a[2] * s.point[2]) < 1e-9);
});
