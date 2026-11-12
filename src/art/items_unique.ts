// THE UNIQUE ITEMS' OWN PICTURES, for the bag, the gear page and the floor: behind UNIQUE_ART (off until his yes).
// The uniques' art chat, 11 Nov 2026 (queue item draw-unique-items; docs/mockups/uniques_art/README.md).
//
// The 62 are his doc “Wordsmith: Unique Items”; the build (game/uniques.ts, behind UNIQUES) shows each in the orange look of its
// base, so all nine unique boots look alike, all eight amulets, all seven rings. Shown that, and asked how far the bag pictures
// should go, his pick, 11 Nov 2026: “A picture of its own each (Recommended)”, offered as: 62 new bag pictures, each showing what
// the item is, painted the way the bag pictures are now, no finer; he sees them in batches before anything goes in.
//
// So each is painted with THE SAME KIT as the game's item pictures (art/items_a.ts ITEM_A_KIT: the same five-tone materials, the
// same light from the upper left, the same seams, cast shadow, ink outline and orange rim, 32 by 32 picture pixels, two to a game
// pixel), and each still reads as what it is worn as: a boot is a boot. What makes it its own is its shape and its colours.
// NOTHING GLOWS but what glowed already on an item (the demon's red-orange fire, a friend's cyan): no pink, no gold glow.
//
// The game asks for one in one place only, art/icons.ts itemPic (its fourth argument, an item's `unique`), and only with the
// switch on; off, or for a unique not drawn yet, itemPic gives the base's picture as before (tests/items_unique.test.ts).

import type { Px, Sprite } from '../engine/px';
import { ITEM_A_KIT } from './items_a';
import type { ItemAMark, ItemAPart, ItemARamp, ItemAShade, ItemAShape, ItemAV } from './items_a';

/** The switch: OFF. On, a unique that has a picture of its own here shows it in place of its base's orange look. */
export const UNIQUE_ART = { on: false };

const { poly, cap, ell, path, add, sub, mul, lerp, len, unit, at, paint, gem, stud, cog, squeeze, UP, INLAY, PAINTERS } = ITEM_A_KIT;
type V = ItemAV;
type Part = ItemAPart;
type Ramp = ItemARamp;
type Mark = ItemAMark;
type Shape = ItemAShape;
type Shade = ItemAShade;
void [add, sub, mul, lerp, len, unit, at, gem, stud, cog, UP, INLAY, PAINTERS];

// ---------------------------------------------------------------------------------------------
// Materials of their own: five tones each, darkest to brightest, in the item pictures' indigo-leaning palette.

const R = {
  /** grey standing stone */
  stone: ['#1e1c34', '#3c3a56', '#666480', '#9694aa', '#cecce0'],
  moss: ['#0c2416', '#1a4424', '#34722e', '#64a23e', '#aad86a'],
  /** the carrion birds' black-violet feathers */
  raven: ['#0a0718', '#17102e', '#2a1c4c', '#44306e', '#7a62a8'],
  /** a bird's scaled leg: dull yellow */
  shank: ['#3a2a0a', '#6c5416', '#a8882c', '#d8bc58', '#fff0b4'],
  /** polished horn: a hoof, a claw */
  horn: ['#07060c', '#18141e', '#322a34', '#56484e', '#92848a'],
  /** rusted iron */
  rust: ['#1c1018', '#3e2422', '#6e3e2c', '#a0623a', '#d09a66'],
  /** the Long Echo's sea-blue hide, and its two echoes, each fainter */
  echo: ['#0a1a30', '#12304e', '#1c5074', '#2e7c9c', '#84ccd6'],
  echo1: ['#1e4a64', '#2c6280', '#40809e', '#589cb8', '#84bcd0'],
  echo2: ['#18344c', '#204662', '#2c5a78', '#3a6e8e', '#5086a4'],
  /** the Prince's black velvet: black with a violet sheen */
  velvet: ['#100c20', '#1e183a', '#342a56', '#52447a', '#8676ac'],
  /** grey rags */
  rag: ['#26222e', '#46404c', '#6e6670', '#9a9296', '#c8c2c0'],
} satisfies Record<string, Ramp>;

// ---------------------------------------------------------------------------------------------
// Helpers

/** Parts moved by (dx, dy): their shapes, their light and their marks. */
function move(parts: readonly Part[], dx: number, dy: number): Part[] {
  const f = (p: V): V => [p[0] + dx, p[1] + dy];
  const shape = (s: Shape): Shape => {
    switch (s.t) {
      case 'poly': return { t: 'poly', p: s.p.map(f) };
      case 'cap': return { ...s, a: f(s.a), b: f(s.b) };
      case 'ell': return { ...s, c: f(s.c) };
      case 'path': return { t: 'path', p: s.p.map(f), r: s.r };
    }
  };
  const shade = (sh: Shade): Shade => {
    switch (sh.k) {
      case 'cyl': return { ...sh, a: f(sh.a), b: f(sh.b) };
      case 'dome': return { ...sh, c: f(sh.c) };
      case 'ridge': return { ...sh, a: f(sh.a), b: f(sh.b) };
      default: return sh;
    }
  };
  return parts.map((pt) => ({
    ...pt, s: shape(pt.s), cut: pt.cut?.map(shape), sh: shade(pt.sh),
    marks: pt.marks?.map((mk) => ({ a: f(mk.a), b: mk.b ? f(mk.b) : undefined, t: mk.t })),
  }));
}

/** A link of chain seen face on: a ring. */
const link = (c: V, rx: number, ry: number, m: Part['m'], rot = 0): Part => ({ s: ell(c, rx, ry, rot), cut: [ell(c, Math.max(0.5, rx - 1.0), Math.max(0.5, ry - 1.0), rot)], m, sh: { k: 'flat', bev: 0.8 }, shine: true });

// ---------------------------------------------------------------------------------------------
// THE NINE BOOTS. Each from the side, its toe to the left, as the game's boots are.

/** The game's tall boot, in the materials given: what a unique built on it changes is the rest. */
function tallBoot(o: { hide: Part['m']; cuff: Part['m']; sole: Part['m']; bias?: number }): Part[] {
  const b = o.bias ?? 0;
  return [
    { s: poly([13.0, 6.0], [23.8, 6.0], [24.6, 15.0], [25.4, 24.0], [26.4, 27.6], [26.0, 28.6], [4.6, 28.6], [3.6, 25.6], [6.0, 22.8], [11.4, 20.6], [12.6, 15.0]), m: o.hide, sh: { k: 'soft', r: 3.5 }, bias: b, marks: [{ a: [14.4, 8.6], b: [14.0, 19.0], t: 3 }, { a: [8.0, 22.6], b: [5.6, 25.0], t: 3 }, { a: [22.4, 10], b: [23.0, 22], t: 1 }] },
    { s: poly([11.8, 2.6], [25.2, 2.4], [25.4, 7.6], [24.0, 8.6], [12.6, 8.6], [11.4, 7.4]), m: o.cuff, sh: { k: 'soft', r: 1.8 }, bias: 0.12 + b },
    { s: poly([3.4, 27.6], [26.8, 27.6], [26.8, 30.2], [4.8, 30.2], [3.0, 29.0]), m: o.sole, sh: { k: 'flat', bev: 0.8 } },
    { s: poly([19.6, 26.8], [26.8, 26.8], [26.8, 30.4], [20.0, 30.4]), m: o.sole, sh: { k: 'flat', bev: 1 }, bias: -0.1 },
  ];
}

/**
 * THE LONG ECHO (boots, the pool: adds Lasting to every attack). A tall sea-blue boot banded in silver, and behind it its own
 * echo, twice, each fainter: what it does lasts.
 */
function longecho(): Part[] {
  const out: V[] = [[11.8, 2.6], [25.2, 2.4], [25.4, 7.6], [24.6, 15.0], [25.4, 24.0], [26.8, 27.6], [26.8, 30.2], [4.8, 30.2], [3.0, 29.0], [3.6, 25.6], [6.0, 22.8], [11.4, 20.6], [12.6, 15.0], [11.4, 7.4]];
  const sx = 0.76;
  const ghost = (dx: number, k: number): Shape => poly(...out.map(([x, y]) => [(x - 16) * sx * k + 16 + dx, 30.2 - (30.2 - y) * k] as V));
  const parts: Part[] = [];
  parts.push({ s: ghost(6.4, 0.78), m: R.echo2, sh: { k: 'flat', bev: 1 }, marks: [{ a: [24.0, 13.2], b: [27.6, 13.2], t: 0 }] });
  parts.push({ s: ghost(1.8, 0.89), m: R.echo1, sh: { k: 'flat', bev: 1 }, bias: 0.1, marks: [{ a: [20.4, 10.4], b: [24.4, 10.4], t: 0 }] });
  const boot = tallBoot({ hide: R.echo, cuff: 'steel', sole: 'dleather' });
  boot[1].shine = true;
  // three silver bands down its shaft, a stone in the cuff
  for (const y of [11.6, 15.6, 19.4]) boot.push({ s: poly([12.4, y], [24.8, y - 0.6], [24.9, y + 1.0], [12.4, y + 1.6]), m: 'steel', sh: { k: 'flat', bev: 0.6 }, shine: true });
  boot.push(gem([18.4, 5.4], 1.3, 'amber'));
  parts.push(...move(squeeze(boot, sx, 1), -3.6, 0));
  return parts;
}

/**
 * BROKEN SHACKLES (boots, from the Chained One: the swipe move has no cooldown). A prisoner's worn boot bound in rags, a heavy
 * iron shackle round its ankle, and what is left of its chain: three links, the last one snapped open.
 */
function brokenshackles(): Part[] {
  const parts: Part[] = [];
  // the boot: worn hide, no cuff, its top torn
  parts.push({
    s: poly([12.4, 6.2], [14.2, 4.2], [16.0, 5.8], [18.2, 3.6], [20.2, 5.6], [22.2, 4.0], [23.8, 6.2], [24.4, 15.0], [24.8, 24.0], [25.6, 27.6], [25.2, 28.6], [3.8, 28.6], [2.8, 25.6], [5.2, 22.8], [10.8, 20.6], [12.2, 15.0]),
    m: 'leather', sh: { k: 'soft', r: 3.5 }, bias: -0.06,
    marks: [{ a: [13.8, 8.6], b: [13.6, 12.0], t: 3 }, { a: [7.4, 22.8], b: [5.0, 25.0], t: 3 }, { a: [16.6, 22.2], b: [20.4, 21.4], t: 0 }, { a: [16.6, 22.2], b: [16.8, 25.4], t: 0 }, { a: [20.4, 21.4], b: [20.6, 24.8], t: 0 }, { a: [16.8, 25.4], b: [20.6, 24.8], t: 0 }],
  });
  // rags bound round its foot
  parts.push({ s: poly([6.4, 22.0], [10.6, 20.4], [12.4, 28.6], [8.4, 28.6]), m: R.rag, sh: { k: 'soft', r: 1.6 }, marks: [{ a: [7.6, 23.6], b: [11.0, 22.4], t: 1 }, { a: [8.4, 26.2], b: [11.8, 25.2], t: 1 }] });
  parts.push({ s: poly([2.6, 27.6], [26.0, 27.6], [26.0, 30.2], [4.0, 30.2], [2.2, 29.0]), m: 'dleather', sh: { k: 'flat', bev: 0.8 } });
  parts.push({ s: poly([18.8, 26.8], [26.0, 26.8], [26.0, 30.4], [19.2, 30.4]), m: 'dleather', sh: { k: 'flat', bev: 1 }, bias: -0.1 });
  // the shackle: a heavy iron band, a rivet at each end, its lug behind
  parts.push({ s: poly([10.2, 12.4], [26.0, 11.4], [26.6, 17.4], [10.6, 18.6]), m: 'steel', sh: { k: 'cyl', a: [10.4, 15.6], b: [26.4, 14.4], w: 3.2 }, shine: true, marks: [{ a: [12.0, 13.6], b: [24.6, 12.8], t: 4 }] });
  for (const p of [[12.2, 15.6], [24.4, 14.6]] as V[]) parts.push(stud(p, 0.9, 'dsteel'));
  parts.push({ s: poly([16.4, 12.0], [19.4, 11.8], [19.6, 17.8], [16.6, 18.0]), m: 'dsteel', sh: { k: 'flat', bev: 0.8 }, shine: true, marks: [{ a: [18.0, 14.2], b: [18.0, 15.8], t: 0 }] });
  // its chain, hanging: a ring, a link edge on, and the last link broken open
  parts.push(link([27.8, 16.4], 2.2, 2.2, 'steel'));
  parts.push({ s: cap([28.6, 18.6], [28.8, 22.0], 0.95), m: 'steel', sh: { k: 'cyl', a: [28.6, 18.6], b: [28.8, 22.0], w: 0.95 }, shine: true });
  parts.push({ s: ell([28.2, 24.6], 2.2, 2.6), cut: [ell([28.2, 24.6], 1.1, 1.5), poly([28.6, 24.2], [31.6, 23.0], [31.6, 28.4], [28.4, 26.0])], m: 'steel', sh: { k: 'flat', bev: 0.8 }, shine: true });
  return parts;
}

/**
 * THE QUEEN'S TALONS (boots, from the Carrion Queen: each critical hit calls one of her birds). A carrion bird's leg, worn as a
 * boot: her black-violet feathers, a pale ruff at its top, a scaled yellow shank, and four hooked black talons.
 */
function queenstalons(): Part[] {
  const parts: Part[] = [];
  // the shank, scaled
  parts.push({ s: path([[18.6, 13.0], [18.2, 18.0], [18.0, 23.2]], [2.9, 2.5, 2.8]), m: R.shank, sh: { k: 'cyl', a: [18.6, 13], b: [18.0, 23.2], w: 2.8 }, marks: [16.4, 18.2, 20.0, 21.8].map((y) => ({ a: [15.8, y] as V, b: [20.6, y - 0.4] as V, t: 1 })) });
  // three toes, two forward and one behind, each ending in a hooked black talon
  const toe = (a: V, b: V, claw: V[]): void => {
    parts.push({ s: path([a, b], [2.0, 1.5]), m: R.shank, sh: { k: 'cyl', a, b, w: 1.8 }, marks: [{ a: lerp(a, b, 0.5), t: 1 }, { a: lerp(a, b, 0.85), t: 1 }] });
    parts.push({ s: poly(...claw), m: R.horn, sh: { k: 'soft', r: 1.2 }, shine: true, bias: 0.3 });
  };
  toe([19.0, 23.8], [23.6, 25.6], [[23.2, 24.0], [26.6, 24.8], [28.8, 27.2], [29.2, 30.8], [26.6, 28.4], [23.0, 27.4]]);
  toe([17.8, 24.6], [13.8, 27.4], [[14.8, 26.0], [12.0, 27.0], [10.2, 29.0], [9.8, 31.6], [12.4, 30.0], [15.2, 29.4]]);
  toe([17.2, 23.6], [9.8, 25.2], [[10.0, 23.6], [6.4, 24.2], [3.6, 26.6], [2.6, 30.4], [5.6, 28.0], [9.6, 27.2]]);
  // the feathers, in two rows, their tips ragged
  parts.push({
    s: poly([11.8, 5.4], [25.2, 5.0], [26.2, 9.6], [25.4, 13.6], [23.6, 16.6], [22.2, 14.0], [20.4, 17.2], [18.6, 14.4], [16.6, 17.0], [15.0, 14.0], [12.8, 16.2], [11.6, 12.0], [10.8, 8.6]),
    m: R.raven, sh: { k: 'soft', r: 3 }, bias: 0.16,
    marks: [{ a: [16.6, 11.4], b: [16.6, 14.6], t: 0 }, { a: [20.4, 11.4], b: [20.4, 15.0], t: 0 }, { a: [23.6, 11.0], b: [23.6, 14.4], t: 0 }, { a: [14.6, 11.6], b: [14.8, 13.4], t: 4 }, { a: [18.4, 11.6], b: [18.6, 13.6], t: 4 }, { a: [22.0, 11.4], b: [22.0, 13.2], t: 4 }],
  });
  parts.push({
    s: poly([11.0, 8.6], [12.6, 5.6], [24.8, 5.2], [26.2, 8.4], [24.6, 11.0], [22.6, 8.8], [20.6, 11.4], [18.6, 9.0], [16.4, 11.4], [14.6, 9.0], [12.6, 11.0]),
    m: R.raven, sh: { k: 'soft', r: 2 }, bias: 0.36,
  });
  // the ruff: pale down round its top
  parts.push({ s: poly([10.6, 6.2], [11.4, 3.2], [13.6, 4.2], [15.0, 2.0], [17.0, 3.6], [18.8, 1.6], [20.6, 3.4], [22.6, 1.8], [24.0, 4.0], [26.2, 3.2], [26.6, 6.4], [24.2, 8.0], [21.6, 7.0], [18.8, 8.2], [16.0, 7.0], [13.2, 8.2]), m: 'feather', sh: { k: 'soft', r: 1.6 }, marks: [{ a: [15.0, 4.6], b: [15.4, 6.6], t: 1 }, { a: [19.0, 4.6], b: [19.0, 7.2], t: 1 }, { a: [22.6, 4.6], b: [22.4, 6.6], t: 1 }] });
  return parts;
}

/** One court shoe from the side, toe to the left: black velvet, a tall tongue over a gilt buckle, a red heel. */
function courtShoe(): Part[] {
  return [
    // its red heel, its sole, then the shoe over them
    { s: poly([19.8, 22.0], [27.8, 21.4], [28.0, 27.4], [23.4, 27.4], [22.4, 24.4]), m: 'red', sh: { k: 'flat', bev: 1 }, bias: 0.12 },
    { s: poly([2.2, 24.8], [9.0, 26.2], [19.8, 22.6], [19.8, 23.8], [9.0, 27.4], [3.2, 26.6]), m: 'dleather', sh: { k: 'flat', bev: 0.6 } },
    {
      s: poly([2.4, 24.4], [4.8, 21.4], [9.6, 18.6], [13.0, 16.6], [14.4, 11.2], [17.2, 12.2], [17.6, 17.0], [22.4, 15.4], [26.2, 12.4], [28.2, 13.8], [27.8, 21.8], [19.6, 22.6], [9.0, 26.2], [3.8, 25.8]),
      m: R.velvet, sh: { k: 'soft', r: 2.8 }, bias: 0.2, shine: true,
      marks: [{ a: [5.6, 21.6], b: [9.6, 19.4], t: 4 }, { a: [15.2, 12.6], b: [14.6, 15.4], t: 4 }, { a: [25.6, 14.4], b: [26.4, 19.6], t: 4 }],
    },
    // its lining showing at the opening
    { s: poly([17.4, 13.4], [18.0, 16.6], [22.4, 15.0], [25.4, 12.8], [22.0, 13.6]), m: 'red', sh: { k: 'flat' }, flush: true, bias: -0.1 },
    // the buckle, under the tongue
    { s: poly([9.2, 18.4], [13.8, 16.0], [15.6, 19.2], [11.0, 21.6]), cut: [poly([10.9, 18.9], [13.2, 17.7], [13.9, 18.9], [11.6, 20.1])], m: 'gold', sh: { k: 'flat', bev: 0.8 }, shine: true },
  ];
}

/**
 * THE DANCING SHOES (boots, from the Prince: nothing can slow you or hold you in place). The prince's own, the pair of them:
 * black velvet, red heels, gilt buckles.
 */
function dancingshoes(): Part[] {
  return [
    ...move(squeeze(courtShoe(), 0.8, 0.8), 4.2, -9.4),
    ...move(squeeze(courtShoe(), 0.96, 0.96), -1.0, 3.8),
  ];
}

/**
 * THE STANDING STONE (boots, the pool: while you stand still you take much less damage and nothing can shove you). A boot hewn
 * from a standing stone: grey, cracked, a ring carved in it, moss on its head and round its foot.
 */
function standingstone(): Part[] {
  const parts: Part[] = [];
  parts.push({
    s: poly([12.6, 4.4], [15.4, 2.6], [20.6, 2.4], [24.4, 4.4], [25.6, 9.6], [25.0, 16.0], [26.2, 22.6], [27.4, 28.0], [26.8, 30.2], [4.2, 30.2], [2.8, 27.8], [3.8, 24.6], [7.2, 22.4], [11.4, 21.0], [12.2, 14.6], [11.6, 8.6]),
    m: R.stone, sh: { k: 'soft', r: 3.2 }, shine: true,
    marks: [
      { a: [22.4, 12.6], b: [24.4, 16.2], t: 0 }, { a: [24.4, 16.2], b: [23.4, 19.4], t: 0 },
      { a: [13.6, 21.6], b: [16.2, 24.6], t: 0 }, { a: [16.2, 24.6], b: [15.4, 27.4], t: 0 }, { a: [16.2, 24.6], b: [18.6, 25.6], t: 0 },
      { a: [14.0, 6.4], b: [13.4, 11.6], t: 4 }, { a: [6.4, 24.0], b: [9.4, 23.0], t: 4 },
    ],
  });
  // a ring cut into it, and a stroke through the ring
  const rc: V = [18.8, 11.6];
  const ring: Mark[] = [];
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2;
    ring.push({ a: [rc[0] + Math.cos(a0) * 3.4, rc[1] + Math.sin(a0) * 3.6], b: [rc[0] + Math.cos(a1) * 3.4, rc[1] + Math.sin(a1) * 3.6], t: i >= 1 && i <= 3 ? 4 : 0 });
  }
  parts[0] = { ...parts[0], marks: [...(parts[0].marks ?? []), ...ring, { a: rc, t: 0 }, { a: [rc[0], rc[1] + 4.6], b: [rc[0], rc[1] + 7.4], t: 0 }] };
  // moss: on its head, and creeping up from the ground
  parts.push({ s: poly([11.6, 8.0], [12.4, 4.0], [15.4, 2.0], [20.0, 2.0], [19.4, 4.2], [16.4, 4.0], [14.6, 5.8], [13.6, 8.6]), m: R.moss, sh: { k: 'soft', r: 1.4 }, flush: true, bias: 0.1 });
  parts.push({ s: poly([2.6, 28.0], [3.6, 25.6], [6.0, 26.2], [8.0, 25.0], [9.6, 27.4], [11.6, 28.0], [11.0, 30.4], [4.2, 30.4]), m: R.moss, sh: { k: 'soft', r: 1.4 }, flush: true, bias: 0.05 });
  parts.push({ s: poly([20.6, 30.4], [21.6, 28.2], [23.6, 29.0], [25.4, 27.6], [27.2, 28.6], [27.0, 30.4]), m: R.moss, sh: { k: 'soft', r: 1.2 }, flush: true, bias: -0.1 });
  return parts;
}

/**
 * THE PIVOT (boots, the Warrior's own: Lunge ends in a free turn of Whirlwind). A steel sabaton, its plates lapped down to a
 * pointed toe, a great gilt pivot at the ankle for the turn, and a spur.
 */
function pivot(): Part[] {
  const parts: Part[] = [];
  // the spur, behind
  parts.push({ s: cap([25.2, 23.4], [28.6, 22.6], 0.9), m: 'steel', sh: { k: 'flat', bev: 0.6 }, shine: true });
  const rc: V = [29.2, 22.4];
  const star: V[] = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const rr = i % 2 ? 1.0 : 2.5; star.push([rc[0] + Math.cos(a) * rr, rc[1] + Math.sin(a) * rr]); }
  parts.push({ s: poly(...star), m: 'gold', sh: { k: 'dome', c: rc, r: 2.5 }, shine: true });
  // the sole and heel
  parts.push({ s: poly([2.6, 27.8], [26.8, 27.6], [26.8, 30.2], [4.4, 30.2], [2.4, 29.2]), m: 'dleather', sh: { k: 'flat', bev: 0.8 } });
  // the greave: a steel shin, a ridge down its front
  parts.push({ s: poly([12.4, 4.0], [24.4, 3.6], [25.4, 10.0], [24.8, 18.4], [12.0, 19.0], [11.4, 10.4]), m: 'steel', sh: { k: 'ridge', a: [16.4, 3.6], b: [15.6, 19.0], tilt: 0.36 }, shine: true, marks: [{ a: [13.6, 6.4], b: [13.2, 13.0], t: 4 }] });
  parts.push({ s: path([[11.8, 4.4], [18.4, 3.2], [25.0, 3.8]], [1.2, 1.2, 1.2]), m: 'gold', sh: { k: 'flat', bev: 0.8 }, shine: true });
  // the foot: a heel plate, then four lames lapped toward the toe, the last a point
  parts.push({ s: poly([19.4, 20.6], [25.6, 20.0], [26.6, 28.4], [19.6, 28.4]), m: 'steel', sh: { k: 'soft', r: 2 }, shine: true, bias: -0.1 });
  parts.push({ s: poly([12.4, 19.6], [20.4, 19.0], [20.6, 28.4], [12.0, 28.4]), m: 'steel', sh: { k: 'soft', r: 2 }, shine: true });
  parts.push({ s: poly([9.2, 21.4], [13.6, 19.6], [13.4, 28.4], [8.2, 28.4]), m: 'steel', sh: { k: 'soft', r: 1.6 }, shine: true, bias: 0.06 });
  parts.push({ s: poly([6.0, 23.2], [10.0, 21.2], [9.6, 28.4], [5.0, 28.4]), m: 'steel', sh: { k: 'soft', r: 1.6 }, shine: true, bias: 0.1 });
  parts.push({ s: poly([1.6, 28.0], [3.6, 25.2], [6.6, 23.0], [6.2, 28.4], [2.6, 28.8]), m: 'steel', sh: { k: 'soft', r: 1.4 }, shine: true, bias: 0.14 });
  // the pivot: a gilt wheel on the ankle, its pin, the notches round it
  const pc: V = [18.4, 20.6];
  const notches: Mark[] = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; notches.push({ a: [pc[0] + Math.cos(a) * 3.4, pc[1] + Math.sin(a) * 3.4], t: 0 }); }
  parts.push({ s: ell(pc, 4.6), m: 'gold', sh: { k: 'dome', c: pc, r: 4.6 }, shine: true, marks: notches });
  parts.push({ s: ell(pc, 1.7), m: 'dsteel', sh: { k: 'dome', c: pc, r: 1.7 }, shine: true });
  return parts;
}

/**
 * THE SHORT WAY (boots, the Mage's own: Warp again within two seconds to snap back to where you started). A soft violet boot,
 * its toe curled right back on itself, a band of the Warp's own cyan round the ankle.
 */
function shortway(): Part[] {
  const parts: Part[] = [];
  parts.push({ s: poly([6.6, 27.6], [26.8, 27.6], [26.8, 30.2], [7.6, 30.2], [5.8, 29.0]), m: 'dleather', sh: { k: 'flat', bev: 0.8 } });
  // the toe, curled up and back
  parts.push({ s: path([[9.6, 26.6], [5.2, 25.6], [2.9, 22.2], [4.4, 18.6], [7.6, 18.0], [9.2, 20.2], [7.6, 21.8]], [2.3, 2.1, 1.8, 1.5, 1.3, 1.0, 0.8]), m: 'vcloth', sh: { k: 'soft', r: 1.6 }, bias: 0.12 });
  parts.push({ s: ell([7.2, 21.8], 1.35), m: 'gold', sh: { k: 'dome', c: [7.2, 21.8], r: 1.35 }, shine: true });
  // the boot: soft cloth, low
  parts.push({
    s: poly([13.6, 9.6], [24.2, 9.2], [24.8, 16.0], [25.4, 24.0], [26.4, 27.6], [26.0, 28.6], [8.0, 28.6], [8.6, 24.6], [11.8, 21.4], [13.0, 16.0]),
    m: 'vcloth', sh: { k: 'soft', r: 3.5 }, bias: 0.08,
    marks: [{ a: [14.6, 11.6], b: [14.2, 15.0], t: 3 }, { a: [22.6, 20.6], b: [23.4, 26.0], t: 1 }, { a: [12.6, 23.0], b: [10.4, 26.0], t: 3 }],
  });
  // its cuff turned down in points, a star of gold on it
  parts.push({ s: poly([12.0, 6.4], [25.4, 6.0], [26.0, 11.0], [23.6, 13.6], [21.4, 11.2], [19.0, 13.8], [16.8, 11.4], [14.4, 13.8], [12.0, 11.2]), m: 'violet', sh: { k: 'soft', r: 1.8 }, bias: 0.05, marks: [{ a: [13.0, 7.4], b: [24.4, 7.0], t: '#d0902c' }] });
  parts.push({ ...gem([18.9, 9.8], 1.15, 'gold'), flush: true });
  // the Warp's band round the ankle: a friend's cyan
  parts.push({ s: poly([12.4, 17.6], [25.0, 16.4], [25.2, 19.0], [12.2, 20.4]), m: 'core', sh: { k: 'cyl', a: [12.4, 19.0], b: [25.2, 17.8], w: 1.6 }, shine: true, bias: 0.2 });
  return parts;
}

/**
 * THE CLOVEN BOOTS (boots, the Warlock's own: while the demon has him, Smoke Step has no cooldown). The demon's leg, worn: his
 * red leather to the hock, black fur at its top, and a black cloven hoof with an ember in the cleft.
 */
function clovenboots(): Part[] {
  const parts: Part[] = [];
  // the leg below the hock, slanting forward to the hoof
  parts.push({ s: path([[18.6, 15.6], [15.4, 20.0], [12.4, 23.6]], [3.6, 3.0, 3.0]), m: 'bookred', sh: { k: 'cyl', a: [18.6, 15.6], b: [12.4, 23.6], w: 3.2 }, bias: 0.2, marks: [{ a: [14.6, 19.0], b: [17.6, 21.2], t: 0 }] });
  // the tuft at the fetlock
  parts.push({ s: poly([15.0, 20.6], [18.6, 21.6], [20.8, 26.6], [18.0, 25.0], [16.6, 26.4], [15.0, 24.0]), m: 'black', sh: { k: 'soft', r: 1.2 }, bias: 0.4 });
  // the hoof: two toes, the cleft between them
  parts.push({ s: poly([11.8, 23.8], [16.6, 24.8], [18.6, 30.4], [11.6, 30.4]), m: R.horn, sh: { k: 'soft', r: 1.8 }, shine: true, bias: 0.2 });
  parts.push({ s: poly([6.4, 23.0], [12.6, 23.8], [12.8, 30.4], [2.8, 30.4], [3.6, 26.6]), m: R.horn, sh: { k: 'soft', r: 2.2 }, shine: true, bias: 0.4, marks: [{ a: [5.6, 25.6], b: [4.4, 28.6], t: 4 }, { a: [12.2, 26.6], b: [12.2, 29.8], t: '#ff8a2c' }, { a: [12.2, 25.4], t: '#d8401a' }] });
  // the boot's top: red leather to the hock
  parts.push({
    s: poly([12.4, 6.0], [24.4, 5.4], [25.4, 10.6], [24.6, 15.6], [22.0, 19.4], [15.6, 18.6], [12.6, 13.6], [11.8, 9.6]),
    m: 'bookred', sh: { k: 'soft', r: 3.2 }, bias: 0.22,
    marks: [{ a: [14.0, 8.6], b: [13.8, 12.6], t: 4 }, { a: [22.8, 9.6], b: [23.0, 15.0], t: 0 }, { a: [16.0, 17.2], b: [21.6, 17.8], t: 0 }],
  });
  parts.push({ ...gem([18.6, 12.4], 1.4, 'amber') });
  // black fur round its top
  parts.push({ s: poly([10.8, 7.4], [11.6, 3.4], [13.6, 4.6], [15.2, 2.4], [17.2, 4.2], [19.0, 2.0], [20.8, 4.0], [22.8, 2.2], [24.2, 4.4], [26.2, 3.4], [26.4, 7.4], [24.4, 9.0], [22.0, 7.8], [19.6, 9.2], [17.2, 7.8], [14.8, 9.2], [12.6, 8.0]), m: 'black', sh: { k: 'soft', r: 1.6 }, bias: 0.34, marks: [{ a: [14.6, 5.0], b: [15.0, 7.4], t: 4 }, { a: [18.8, 4.6], b: [19.0, 7.6], t: 4 }, { a: [22.8, 4.8], b: [22.6, 6.8], t: 4 }] });
  return parts;
}

/**
 * THE SPRUNG HEELS (boots, the Brawler's own: he can jump again in the air). A fighter's short boot bound in linen at the ankle,
 * tipped onto its toe by the big brass spring coiled under its heel.
 */
function sprungheels(): Part[] {
  const boot: Part[] = [];
  boot.push({
    s: poly([12.6, 6.6], [23.6, 6.2], [24.4, 15.0], [25.2, 21.6], [26.0, 24.6], [25.6, 25.6], [4.4, 25.6], [3.4, 22.8], [5.8, 20.0], [11.2, 17.8], [12.4, 12.0]),
    m: 'leather', sh: { k: 'soft', r: 3.4 }, bias: 0.05,
    marks: [{ a: [7.6, 20.0], b: [5.2, 22.4], t: 3 }, { a: [22.4, 19.0], b: [23.4, 23.6], t: 1 }],
  });
  // linen bound round the ankle and up the shin, a red band at its top
  boot.push({ s: poly([12.0, 6.0], [24.0, 5.6], [24.8, 15.2], [25.0, 18.0], [11.6, 18.6], [12.2, 12.0]), m: 'linen', sh: { k: 'soft', r: 2.6 }, marks: [8.4, 11.0, 13.6, 16.2].map((y) => ({ a: [12.4, y + 0.8] as V, b: [24.6, y - 0.8] as V, t: 1 })) });
  boot.push({ s: poly([11.6, 3.4], [24.2, 3.0], [24.4, 6.4], [11.8, 6.8]), m: 'red', sh: { k: 'soft', r: 1.4 }, bias: 0.1 });
  boot.push({ s: poly([3.2, 24.8], [26.2, 24.8], [26.2, 26.8], [4.4, 26.8], [2.8, 26.0]), m: 'dleather', sh: { k: 'flat', bev: 0.8 } });
  // a toe cap
  boot.push({ s: poly([3.4, 22.8], [5.8, 20.2], [8.6, 19.2], [8.6, 25.6], [4.4, 25.6]), m: 'steel', sh: { k: 'soft', r: 1.6 }, shine: true });
  const parts = move(squeeze(boot, 0.9, 0.84, -13), -0.4, -1.4);
  // the spring under the heel: a brass coil on a steel foot
  const coil: V[] = [[19.0, 21.6], [27.0, 22.7], [19.6, 24.1], [27.2, 25.2], [20.0, 26.6], [27.4, 27.8]];
  parts.push({ s: path(coil, coil.map(() => 0.95)), m: 'brass', sh: { k: 'flat', bev: 0.7 }, shine: true, marks: [{ a: [20.6, 21.9], b: [25.0, 22.5], t: 4 }, { a: [21.0, 24.4], b: [25.2, 25.0], t: 4 }, { a: [21.6, 26.9], b: [25.4, 27.5], t: 4 }] });
  parts.push({ s: cap([18.6, 29.5], [28.0, 29.5], 0.85), m: 'steel', sh: { k: 'flat', bev: 0.6 }, shine: true });
  return parts;
}

// ---------------------------------------------------------------------------------------------

/** Every unique with a picture of its own here, by its id in game/uniques.ts UNIQUE_DEFS. */
const UNIQUE_PAINTERS: Record<string, () => Part[]> = {
  longecho, brokenshackles, queenstalons, dancingshoes, standingstone, pivot, shortway, clovenboots, sprungheels,
};

/** The ids of the uniques drawn so far. */
export const UNIQUE_ART_IDS: readonly string[] = Object.keys(UNIQUE_PAINTERS);

/** One unique's own picture: 32 by 32 picture pixels, as art/items_a.ts paintItemA's, with the orange rim. Null for one not drawn. */
export function paintUnique(id: string): Px | null {
  const f = Object.prototype.hasOwnProperty.call(UNIQUE_PAINTERS, id) ? UNIQUE_PAINTERS[id] : undefined;
  return f ? paint(f(), 3) : null;
}

const made = new Map<string, Sprite | null>();
/**
 * THE PICTURE OF A UNIQUE ITEM, for the UI and the floor, by its id (an item's `unique`): 16 by 16 game pixels painted two picture
 * pixels to a game pixel, anchor the middle (8, 8), exactly as art/items_a.ts itemArt's. Null with the switch off, or for a
 * unique with no picture of its own yet: the game then shows its base's (art/icons.ts itemPic). Made once and kept.
 */
export function uniqueArt(id: string | undefined): Sprite | null {
  if (!UNIQUE_ART.on || !id) return null;
  let s = made.get(id);
  if (s === undefined) {
    const p = paintUnique(id);
    made.set(id, (s = p ? p.sprite(16, 16, 2) : null));
  }
  return s;
}
