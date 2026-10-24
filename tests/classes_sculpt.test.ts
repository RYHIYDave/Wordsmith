// THE NEW CLASSES, SCULPTED: EVERY CHECK A CHARACTER GOES THROUGH (dev/sculpt_*.ts; mock-ups, nothing of the game imports
// them). His word, 23 Oct 2026, by 22:07 Pacific: “I’d like to run all the checks for characters and have you ask some
// questions like you are a game developer to nail down the style and feel of each”. The checks are his art rulebook's, as
// the heroes had them on 8 Oct and every boss since (How art is made and approved 6 and 7):
//   Pixels 1    crisp: every pixel all there or not at all, but the friend's edge of light; no pixel alone;
//   Pixels 5    the friend's crisp edge round every one of them, and nothing else in its colour at its strength;
//   Colour 3    nothing on them glows the enemy's pink;
//   Heroes 6    clean bodies: no arm passes through the trunk, no leg through the other;
//   Movement 8  feet on the floor: something of each of them stands on the floor, nothing of them sinks into it;
//   Heroes 7    truly turned, eight ways: each, turned round in eight steps and seen from in front and from behind, passes all
//               of the above, and nothing of it is cut off at its picture's edge;
//   Rule 6      at phone size: each as tall as it should be beside the knight (a hero about his height, the Golem a head
//               over him, the Contraption knee high).
// On 24 Oct (his “The Golem,Her hands are tiny too.  The golem is suffering from the same issue as the demon was at first.
// It’s too humanoid”, “I still don’t like his outfit”), every Golem build and every new outfit he is offered is checked too.
//   run: tsx --test tests/classes_sculpt.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FRIEND_RIM } from '../src/art/hero3_knight';
import { paintMove3 } from '../src/art/heroes3';
import { RIM_ALPHA } from '../src/art/kit';
import { HEAD_B, MOVES3 } from '../src/art/moves3';
import { buildOf } from '../src/art/skeleton';
import type { Build } from '../src/art/skeleton';
import type { GameView } from '../src/art/skin';
import type { Px } from '../src/engine/px';
import { LAST, primDist, primLow } from '../src/dev/sculpt';
import type { Drawn, Prim, Sculpt } from '../src/dev/sculpt';
import { BRAWLER_BUILD, BRAWLER_LOOKS, COATS, OUTFITS_2, boxerStance, sculptBrawler } from '../src/dev/sculpt_classes';
import { DEMON_LOOKS, sculptDemon } from '../src/dev/sculpt_demon';
import { GIANT_BODIES, GOLEM_BUILDS, GOLEM_BUILDS_2, GOLEM_BUILDS_3, sculptGolemBuild } from '../src/dev/sculpt_golem';
import { TINKERER_BODY, TINKER_KITS, sculptContraption, sculptTinkerer, tinkererStance } from '../src/dev/sculpt_tinkerer';
import { WARLOCK_SCULPT_BODY, sculptWarlock, warlockStance } from '../src/dev/sculpt_warlock';
import { hsv, rgb } from './floor_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const VIEWS: GameView[] = ['front', 'back'];
const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];

interface Fig {
  name: string;
  /** Draw it turned `turn` degrees from its stance, in a view. */
  make: (view: GameView, turn: number) => Drawn;
  /** It has arms and legs to keep clean. */
  body: boolean;
  /** It turns (the Contraption is set down as it is). */
  turns: boolean;
}
const brawlerB: Build = (() => {
  const L = BRAWLER_LOOKS[BRAWLER_BUILD];
  return buildOf(L.tall, HEAD_B * L.head, L.shape);
})();
// (truly turned: the whole figure turned round the floor point under it, Sculpt.spin; never its picture flipped)
const FIGS: Fig[] = [
  { name: 'the brawler', make: (v, t) => sculptBrawler(v, boxerStance(brawlerB), BRAWLER_BUILD, undefined, t), body: true, turns: true },
  { name: 'the warlock', make: (v, t) => sculptWarlock(v, warlockStance(WARLOCK_SCULPT_BODY), t), body: true, turns: true },
  { name: 'the Tinkerer', make: (v, t) => sculptTinkerer(v, tinkererStance(TINKERER_BODY), t), body: true, turns: true },
  // (and with each of the four kits of tools he is offered, 24 Oct)
  ...TINKER_KITS.map((k): Fig => ({ name: `the Tinkerer, ${k.name}`, make: (v, t) => sculptTinkerer(v, tinkererStance(TINKERER_BODY, k.id), t, k.id), body: true, turns: true })),
  // (the Golem freed from the human frame, 24 Oct: each build still in the running (his “The crab is cool but too
  // messy”: the crab is out), and the twenty after them)
  ...[...GOLEM_BUILDS.filter((g) => g.id !== 'crab'), ...GOLEM_BUILDS_2, ...GOLEM_BUILDS_3].map((g): Fig => ({ name: `the Golem, ${g.name}`, make: (v, t) => sculptGolemBuild(v, g.id, t), body: true, turns: true })),
  // (and with one giant arm, his “Can I get the one big arm on a bunch of golems”, 24 Oct)
  ...GIANT_BODIES.map((g): Fig => ({ name: `the Golem, ${g.name}, one giant arm`, make: (v, t) => sculptGolemBuild(v, g.id, t, -14, true), body: true, turns: true })),
  { name: 'the Contraption', make: (v, t) => sculptContraption(v, t), body: false, turns: true },
  { name: "the warlock's demon", make: (v, t) => sculptDemon(v, 'smoke', 0, -16 + t), body: true, turns: true },
  // (and the brawler in each of the four new outfits he is offered, 24 Oct)
  ...[...OUTFITS_2, ...COATS].map((o): Fig => ({ name: `the brawler as ${o.name}`, make: (v, t) => sculptBrawler(v, boxerStance(brawlerB), BRAWLER_BUILD, o.id, t), body: true, turns: true })),
];

const FRIEND = rgb(FRIEND_RIM);
/** Everything the checks find wrong with one picture of a figure. */
function pictureFindings(px: Px): string[] {
  const out: string[] = [];
  const { w, h, d } = px;
  let x0 = w;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  let fuzzy = 0;
  let wrongRim = 0;
  let alone = 0;
  let pink = 0;
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = d[i + 3];
      if (a === 0) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      if (a !== 255 && a !== RIM_ALPHA) fuzzy++;
      if (a === RIM_ALPHA && (d[i] !== FRIEND[0] || d[i + 1] !== FRIEND[1] || d[i + 2] !== FRIEND[2])) wrongRim++;
      if (a === 255) {
        if (!solid(x - 1, y) && !solid(x + 1, y) && !solid(x, y - 1) && !solid(x, y + 1)) alone++;
        const [hu, s, v] = hsv(d[i], d[i + 1], d[i + 2]);
        if (hu >= 320 && hu <= 352 && s > 0.55 && v > 0.62) pink++;
      }
    }
  }
  if (x1 < 0) return ['nothing painted'];
  if (fuzzy) out.push(`${fuzzy} pixels neither there nor not`);
  if (wrongRim) out.push(`${wrongRim} pixels of its edge not the friend's cyan`);
  if (alone) out.push(`${alone} pixels alone`);
  if (pink) out.push(`${pink} pixels of the enemy's pink`);
  if (x0 < 2 || y0 < 2 || x1 > w - 3 || y1 > h - 3) out.push(`cut off at its picture's edge (${x0},${y0} to ${x1},${y1} of ${w} by ${h})`);
  return out;
}
const TRUNK = new Set(['ribs', 'yoke', 'belly', 'pec', 'lat', 'bust', 'chest', 'hump', 'pelvis', 'abs', 'waist', 'drum', 'shell']);
const LIMB = new Set(['upper', 'fore', 'finger', 'gauntlet', 'wrist', 'thigh', 'shin', 'shank', 'pastern', 'calf', 'quad']);
/** Points along a solid's line (a rod's), from `from` of the way along it to its end. */
function along(p: Prim, from: number): [number, number, number][] {
  if (p.k !== 'cone') return [];
  const out: [number, number, number][] = [];
  for (let k = 0; k <= 4; k++) {
    const t = from + ((1 - from) * k) / 4;
    out.push([p.a[0] + (p.b[0] - p.a[0]) * t, p.a[1] + (p.b[1] - p.a[1]) * t, p.a[2] + (p.b[2] - p.a[2]) * t]);
  }
  return out;
}
/** Everything the checks find wrong with the solids of one figure: its body clean, its feet on the floor. */
function bodyFindings(sc: Sculpt, body: boolean): string[] {
  const out: string[] = [];
  const solids = sc.prims.filter((p) => !p.carve);
  // NOTHING SINKS INTO THE FLOOR; SOMETHING STANDS ON IT
  const lows = solids.map((p) => [primLow(p), p] as const);
  const sunk = lows.filter(([z]) => z < -0.35);
  if (sunk.length) out.push(`sunk into the floor: ${sunk.map(([z, p]) => `${p.piece}/${p.tag ?? p.k} to ${z.toFixed(2)}`).join(', ')}`);
  const lowest = Math.min(...lows.map(([z]) => z));
  if (lowest > 1.2) out.push(`standing on nothing: its lowest point ${lowest.toFixed(2)} over the floor`);
  if (!body) return out;
  // CLEAN BODIES: no arm's line inside the trunk; no leg's line inside the other leg
  const trunk = solids.filter((p) => TRUNK.has(p.tag ?? '') && (p.piece === 'torso' || p.piece === 'hips'));
  for (const p of solids) {
    if (!p.piece.startsWith('arm') || !LIMB.has(p.tag ?? '')) continue;
    for (const q of along(p, p.tag === 'upper' ? 0.5 : 0)) {
      const inside = Math.min(...trunk.map((t) => primDist(t, q)));
      if (inside < -1.0) out.push(`${p.piece}'s ${p.tag} through the trunk (${inside.toFixed(2)} inside)`);
    }
  }
  for (const [mine, other] of [['legL', 'legR'], ['legR', 'legL']] as const) {
    const others = solids.filter((p) => p.piece === other && LIMB.has(p.tag ?? ''));
    for (const p of solids) {
      if (p.piece !== mine || !LIMB.has(p.tag ?? '')) continue;
      for (const q of along(p, 0.15)) {
        const inside = Math.min(...others.map((t) => primDist(t, q)));
        if (inside < -0.5) out.push(`${mine}'s ${p.tag} through ${other} (${inside.toFixed(2)} inside)`);
      }
    }
  }
  return [...new Set(out)];
}

const HEIGHT = (px: Px): number => {
  let top = -1;
  let low = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] === 255) {
    if (top < 0) top = y;
    low = y;
  }
  return low - top + 1;
};

for (const fig of FIGS) {
  test(`${fig.name}: crisp, the friend's edge round it, no pixel alone, nothing pink, nothing cut off; its body clean and its feet on the floor: from in front and behind, turned eight ways`, () => {
    const found: string[] = [];
    for (const view of VIEWS) {
      for (const turn of fig.turns ? TURNS : [0]) {
        const d = fig.make(view, turn);
        for (const f of pictureFindings(d.px)) found.push(`${view}, turned ${turn}: ${f}`);
        const sc = LAST.sc as Sculpt;
        for (const f of bodyFindings(sc, fig.body)) found.push(`${view}, turned ${turn}: ${f}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}

test("the demon in every word's look passes the picture's checks too (its flames, frost, lightning and stink drawn round it)", () => {
  const found: string[] = [];
  for (const look of DEMON_LOOKS) for (const view of VIEWS) for (const f of pictureFindings(sculptDemon(view, look.aura, look.hide).px)) found.push(`${look.name}, ${view}: ${f}`);
  assert.deepEqual(found, []);
});

test('at phone size: a hero about the knight’s height, the Golem a head over him, the Contraption knee high', () => {
  const knight = HEIGHT(paintMove3(MOVES3.ktown, 0, 'front').px);
  const h = (fig: string): number => HEIGHT((FIGS.find((f) => f.name === fig) as Fig).make('front', 0).px);
  for (const hero of ['the brawler', 'the warlock', 'the Tinkerer']) {
    const r = h(hero) / knight;
    assert.ok(r > 0.82 && r < 1.3, `${hero} ${h(hero)} high, the knight ${knight}`);
  }
  for (const g of [...GOLEM_BUILDS.filter((b) => b.id !== 'crab'), ...GOLEM_BUILDS_2, ...GOLEM_BUILDS_3, ...GIANT_BODIES.map((b) => ({ ...b, name: `${b.name}, one giant arm` }))]) {
    const name = `the Golem, ${g.name}`;
    assert.ok(h(name) > knight * 1.12, `${name} ${h(name)} high, the knight ${knight}`);
  }
  assert.ok(h('the Contraption') < knight * 0.6, `the Contraption ${h('the Contraption')} high, the knight ${knight}`);
  assert.ok(h("the warlock's demon") > h('the warlock') * 1.3, `the demon ${h("the warlock's demon")} high, the warlock ${h('the warlock')}`);
});
