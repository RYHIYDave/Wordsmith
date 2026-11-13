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

/** The switch: ON with the uniques, at his yes of 12 Nov 2026 (game/uniques.ts UNIQUES). On, a unique that has a picture of its own here shows it in place of its base's orange look. */
export const UNIQUE_ART = { on: true };

const { poly, cap, ell, path, add, sub, mul, lerp, len, unit, at, paint, gem, stud, cog, squeeze, UP, INLAY, PAINTERS } = ITEM_A_KIT;
type V = ItemAV;
type Part = ItemAPart;
type Ramp = ItemARamp;
type Mark = ItemAMark;
type Shape = ItemAShape;
type Shade = ItemAShade;
void [INLAY];

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
  /** the Swamp Colossus's drowned olive flesh */
  arm: ['#12180e', '#263220', '#42542e', '#687c46', '#a2b07c'],
  /** looking-glass */
  glass: ['#283256', '#506494', '#90a8d2', '#cadcf4', '#ffffff'],
  /** a ghost's pale grey-blue */
  ghost: ['#2a3a5c', '#4a6288', '#7c98bc', '#b4cce4', '#eef8ff'],
  skin: ['#4a2a24', '#7c4c3a', '#b27c5e', '#dca886', '#f8d6b8'],
  /** grey dead hide */
  flesh: ['#26221e', '#4a4238', '#786c5a', '#a69a82', '#d2c8ae'],
  /** pale carving stone */
  marble: ['#38323e', '#605866', '#928a94', '#c4bec2', '#f2eeec'],
  /** rats' tails: a dull grey rose */
  tail: ['#2e2228', '#584046', '#866468', '#b48e8e', '#dcbcb6'],
  /** stout hemp line */
  rope: ['#3a2e1c', '#6a5836', '#a08c58', '#ccb884', '#f0e2b6'],
  /** black waxed cloth: black with a cold sheen */
  wax: ['#090b10', '#141920', '#242b34', '#38424e', '#5a6876'],
  /** the grey moth's wing */
  moth: ['#28242e', '#4a444e', '#767076', '#a69e9e', '#d6d0ca'],
  /** nettle green */
  nettle: ['#0e2212', '#1c401e', '#32682a', '#58963a', '#98ca62'],
  /** deep water, as steel or as glass */
  sea: ['#0a2032', '#12405a', '#1c6a84', '#3aa2aa', '#aae8de'],
  /** storm-grey wood */
  storm: ['#141c2e', '#283650', '#44587a', '#6a82a4', '#a4bcd6'],
  /** pale driftwood */
  drift: ['#3e362e', '#6a5e50', '#9a8c78', '#c8bca6', '#eee6d4'],
  /** charred black */
  char: ['#08060a', '#151014', '#261c20', '#3c2e30', '#5e4a48'],
  /** the Tinkerer's green paste */
  slime: ['#123a10', '#1e6a1a', '#3aa62c', '#7ee04a', '#d6ffa2'],
  /** the Brawler's globes (dev/veteran_globes.ts): a punch's green, a kick's hot orange, a jump's white */
  punch: ['#0c6a38', '#12a050', '#18c060', '#76f4ae', '#d4ffe6'],
  kick: ['#5a1606', '#a8340a', '#e8561a', '#ff7c2e', '#ffb486'],
  jump: ['#6a6890', '#a4a2c4', '#d4d2ea', '#f2f2fc', '#ffffff'],
  /** the Crier's wine-red cloth (art/crier.ts COAT) */
  wine: ['#1c0a14', '#30101c', '#4a1824', '#7c2c36', '#aa525a'],
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

/** What lies outside an ellipse, as shapes to cut by: keeps a part inside the ellipse's own outline. */
function outside(e: Shape): Shape[] {
  if (e.t !== 'ell') return [];
  const out: Shape[] = [];
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const p = (a: number, k: number): V => [e.c[0] + Math.cos(a) * e.rx * k, e.c[1] + Math.sin(a) * e.ry * k];
    out.push(poly(p(a0, 1), p(a1, 1), p(a1, 6), p(a0, 6)));
  }
  return out;
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
// THE EIGHT AMULETS. Each hung on its chain from the top corners, as the game's amulet is; what hangs is the unique.

/** A chain hung in a V from the top corners down to `meet`, and the ring there that the piece hangs by. `links` false: a plain thong. */
function hung(metal: Part['m'], meet: V = [16, 12.2], links = true): Part[] {
  const parts: Part[] = [];
  const L: V[] = [[4.6, 2.8], [6.2, 6.4], [9.6, 9.6], [meet[0] - 2.2, meet[1] - 0.4]];
  const Rr: V[] = [[27.4, 2.8], [25.8, 6.4], [22.4, 9.6], [meet[0] + 2.2, meet[1] - 0.4]];
  for (const ch of [L, Rr]) {
    const marks: Mark[] = [];
    if (links) for (let i = 0; i + 1 < ch.length; i++) for (let t = 0; t < 1; t += 0.34) marks.push({ a: lerp(ch[i], ch[i + 1], t), t: 4 });
    parts.push({ s: path(ch, [0.95, 0.95, 0.95, 0.95]), m: metal, sh: { k: 'flat' }, shine: links, marks });
  }
  parts.push({ s: ell(meet, 2.2, 1.8), cut: [ell(meet, 1.0, 0.8)], m: metal, sh: { k: 'soft', r: 1 }, shine: true });
  return parts;
}

/**
 * THE THIRD WORD (amulet, from the endless final boss only: a third word slot in front of the tap attack). A gold plate with
 * three sockets for words: two dark, as every attack has, and a third, lit in the words' own cyan.
 */
function thirdword(): Part[] {
  const parts = hung('gold');
  parts.push({ s: poly([7.2, 14.6], [24.8, 14.6], [26.2, 16.6], [26.2, 23.6], [24.8, 25.6], [7.2, 25.6], [5.8, 23.6], [5.8, 16.6]), m: 'gold', sh: { k: 'soft', r: 2 }, shine: true, marks: [{ a: [7.6, 15.6], b: [24.4, 15.6], t: 4 }] });
  for (const [cx, lit] of [[10.4, false], [16, false], [21.6, true]] as [number, boolean][]) {
    parts.push({ s: poly([cx - 2.2, 17.8], [cx + 2.2, 17.8], [cx + 2.2, 22.4], [cx - 2.2, 22.4]), m: lit ? 'core' : 'shadow', sh: { k: 'flat', bev: lit ? 0.8 : 0 }, shine: lit, flush: lit, bias: lit ? 0.3 : 0.4 });
  }
  // a stone hung under it
  parts.push({ s: poly([14.6, 25.2], [17.4, 25.2], [16, 27.0]), m: 'gold', sh: { k: 'flat' }, shine: true });
  parts.push(gem([16, 28.4], 1.7, 'amber'));
  return parts;
}

/**
 * THE DROWNED ARM (amulet, from the Swamp Colossus: a tentacle bursts up under the enemy you are fighting). One of his arms,
 * coiled on itself: his drowned olive flesh, pale suckers down its inside, hung on blackened chain and still dripping.
 */
function drownedarm(): Part[] {
  const parts = hung('dsteel');
  const coil: V[] = [[16, 13.6], [20.8, 15.2], [23.4, 19.6], [22.0, 24.6], [17.0, 27.2], [11.8, 25.6], [9.6, 21.2], [11.4, 17.6], [15.0, 17.2], [17.2, 19.8], [16.0, 22.2], [14.2, 21.6]];
  const rs = [2.5, 2.6, 2.6, 2.5, 2.4, 2.2, 2.0, 1.8, 1.6, 1.3, 1.0, 0.7];
  const suckers: Mark[] = ([[19.8, 16.8], [21.4, 20.0], [20.4, 23.4], [17.0, 25.2], [13.4, 24.2], [11.8, 21.0], [12.8, 18.8]] as V[]).map((p) => ({ a: p, t: '#b4aa80' }));
  parts.push({ s: path(coil, rs), m: R.arm, sh: { k: 'soft', r: 1.8 }, bias: 0.12, shine: true, marks: suckers });
  // black water, dripping from it
  parts.push({ s: path([[17.0, 28.6], [17.0, 30.0]], [0.9, 1.3]), m: 'teal', sh: { k: 'soft', r: 1 }, shine: true });
  return parts;
}

/**
 * THE AMALGAM'S HEART (amulet, from the Ossuary Amalgamation: two words in front that can be melded give their meld as well).
 * A heart in two halves made one: bone and raw flesh, stitched together with gold, hung on a string of bone.
 */
function amalgamsheart(): Part[] {
  const parts = hung('ivory');
  parts.push({ s: poly([16, 16.8], [13.6, 14.2], [10.2, 14.2], [7.6, 16.6], [7.2, 20.2], [9.4, 24.0], [12.8, 27.2], [16, 30.0]), m: 'ivory', sh: { k: 'soft', r: 3 }, shine: true, marks: [{ a: [10.0, 18.0], b: [12.6, 20.6], t: 1 }, { a: [12.6, 20.6], b: [11.6, 23.6], t: 1 }] });
  parts.push({ s: poly([16, 16.8], [18.4, 14.2], [21.8, 14.2], [24.4, 16.6], [24.8, 20.2], [22.6, 24.0], [19.2, 27.2], [16, 30.0]), m: 'ruby', sh: { k: 'soft', r: 3 }, shine: true, marks: [{ a: [21.6, 17.0], b: [22.6, 19.6], t: 4 }] });
  for (const y of [18.4, 21.0, 23.6, 26.2]) parts.push({ s: cap([14.6, y], [17.4, y - 0.6], 0.55), m: 'gold', sh: { k: 'flat' }, shine: true, flush: true });
  return parts;
}

/**
 * THE CLOCKWORK SONGBIRD (amulet, from the King: while your life is full the bird sings). A small bird of gold on its perch, a
 * cog in its wing and a winding key in its back: it hangs by the key.
 */
function clockworksongbird(): Part[] {
  const parts = hung('gold', [17.4, 11.4]);
  // the key: its stem into the bird's back, its two wings either side of the ring
  parts.push({ s: cap([17.4, 12.6], [17.2, 17.6], 0.75), m: 'steel', sh: { k: 'flat' }, shine: true });
  for (const sx of [-1, 1]) parts.push({ s: ell([17.4 + sx * 3.0, 13.8], 1.9, 1.5), cut: [ell([17.4 + sx * 3.0, 13.8], 0.8, 0.5)], m: 'steel', sh: { k: 'flat', bev: 0.6 }, shine: true });
  // the perch and its feet
  parts.push({ s: cap([8.6, 29.2], [23.6, 29.2], 0.95), m: 'steel', sh: { k: 'cyl', a: [8.6, 28.6], b: [23.6, 28.6], w: 1 }, shine: true });
  for (const x of [14.2, 18.2]) parts.push({ s: cap([x, 25.4], [x - 0.2, 28.4], 0.7), m: 'brass', sh: { k: 'flat' }, shine: true });
  // its tail, fanned up behind
  parts.push({ s: poly([21.0, 20.0], [26.6, 14.6], [28.4, 15.6], [28.6, 18.6], [27.0, 22.0], [22.6, 24.0]), m: 'gold', sh: { k: 'soft', r: 1.6 }, shine: true, marks: [{ a: [22.6, 21.0], b: [27.0, 16.2], t: 1 }, { a: [23.4, 22.6], b: [27.8, 19.0], t: 1 }] });
  // the body, the head, the beak
  parts.push({ s: ell([16.2, 21.8], 6.6, 4.7, -8), m: 'gold', sh: { k: 'dome', c: [15.4, 21.0], r: 6.6, ry: 4.7 }, shine: true, bias: 0.12 });
  parts.push({ s: ell([10.2, 18.0], 3.3, 3.1), m: 'gold', sh: { k: 'dome', c: [10.0, 17.6], r: 3.3 }, shine: true, bias: 0.12 });
  parts.push({ s: poly([7.8, 16.8], [3.6, 18.6], [7.8, 19.8]), m: 'amber', sh: { k: 'flat' }, shine: true, bias: 0.3 });
  parts.push({ ...gem([9.6, 17.4], 0.95, 'sapphire'), flush: true });
  // its wing, a cog set in it
  parts.push({ s: poly([14.6, 21.0], [20.0, 20.0], [21.6, 22.8], [18.0, 24.8], [15.0, 23.6]), m: 'brass', sh: { k: 'soft', r: 1.2 }, shine: true, bias: 0.1 });
  parts.push({ ...cog([18.0, 22.2], 1.9, 6, 'steel'), flush: true });
  return parts;
}

/**
 * THE DOG-EARED PAGE (amulet, the pool: all your word slots are open, whatever your level; made to hand down). A worn page on
 * a thong, its corner folded down, lines of an old hand on it and one word still bright.
 */
function dogearedpage(): Part[] {
  const parts = hung('dleather', [15.0, 12.4], false);
  parts.push({
    s: poly([8.6, 14.0], [20.6, 12.6], [25.0, 16.2], [25.8, 28.0], [10.4, 30.0]), m: 'linen', sh: { k: 'flat', bev: 1 }, bias: 0.12,
    marks: [
      { a: [11.0, 17.2], b: [20.4, 16.2], t: 1 }, { a: [11.2, 19.8], b: [22.6, 18.6], t: 1 }, { a: [11.4, 22.4], b: [22.8, 21.2], t: 1 },
      { a: [11.6, 25.0], b: [15.6, 24.6], t: 1 }, { a: [16.8, 24.4], b: [21.6, 23.9], t: '#22d0e0' }, { a: [16.8, 25.2], b: [21.6, 24.7], t: '#8af6f0' },
      { a: [11.8, 27.6], b: [19.6, 26.8], t: 1 }, { a: [9.4, 15.0], b: [10.8, 28.6], t: 4 },
    ],
  });
  // the corner, folded down
  parts.push({ s: poly([20.6, 12.6], [25.0, 16.2], [20.2, 17.0]), m: 'linen', sh: { k: 'flat', bev: 0.6 }, bias: -0.32 });
  return parts;
}

/**
 * THE PACK COLLAR (amulet, the Ranger's own: one more companion than she would have). A companion's collar, worn round her own
 * neck: green leather, steel spikes, a brass buckle and a tag with a paw on it.
 */
function packcollar(): Part[] {
  const parts: Part[] = [];
  const c: V = [16, 13.4];
  parts.push({ s: ell(c, 13.4, 8.8), cut: [ell([16, 15.0], 9.8, 5.0), poly([0, 13.8], [32, 13.8], [32, 32], [0, 32])], m: 'green', sh: { k: 'flat' }, bias: -0.36 });
  parts.push({ s: ell(c, 13.4, 8.8), cut: [ell([16, 11.4], 10.2, 5.4), poly([0, 0], [32, 0], [32, 13.2], [0, 13.2])], m: 'green', sh: { k: 'soft', r: 2.2 }, bias: 0.08, marks: [{ a: [4.0, 15.6], b: [6.4, 18.4], t: 4 }] });
  // spikes along its front
  for (const [x, y, dx] of [[5.2, 17.8, -0.5], [9.2, 20.4, -0.3], [22.8, 20.4, 0.3], [26.8, 17.8, 0.5]] as [number, number, number][]) {
    parts.push({ s: poly([x - 1.5, y - 1.0], [x + 1.5, y - 1.0], [x + dx * 2, y + 3.0]), m: 'steel', sh: { k: 'soft', r: 1 }, shine: true });
  }
  // the buckle, and the tag hung from it
  parts.push({ s: poly([12.6, 17.6], [19.4, 17.6], [19.4, 23.0], [12.6, 23.0]), cut: [poly([14.2, 19.0], [17.8, 19.0], [17.8, 21.6], [14.2, 21.6])], m: 'brass', sh: { k: 'flat', bev: 1.1 }, shine: true });
  parts.push({ s: cap([16, 22.6], [16, 24.6], 0.7), m: 'brass', sh: { k: 'flat' }, shine: true });
  parts.push({ s: ell([16, 27.2], 3.4, 3.2), m: 'brass', sh: { k: 'dome', c: [15.6, 26.8], r: 3.4 }, shine: true, marks: [{ a: [14.6, 26.0], t: 0 }, { a: [16.0, 25.4], t: 0 }, { a: [17.4, 26.0], t: 0 }, { a: [15.4, 27.8], b: [16.8, 27.8], t: 0 }, { a: [15.6, 28.6], b: [16.6, 28.6], t: 0 }] });
  return parts;
}

/**
 * THE PRISM (amulet, the Mage's own: fire, frost and lightning each count as all three). A three-sided crystal on a silver
 * chain, a face for each: fire's orange, frost's blue, lightning's yellow.
 */
function prism(): Part[] {
  const parts = hung('steel');
  const top: V = [16, 13.4], mid: V = [16, 22.8], l: V = [6.6, 29.0], r: V = [25.4, 29.0];
  parts.push({ s: poly(top, mid, l), m: 'amber', sh: { k: 'face', n: [-0.5, -0.25] }, shine: true, marks: [{ a: [14.4, 17.6], b: [10.6, 24.6], t: 4 }] });
  parts.push({ s: poly(top, r, mid), m: 'sapphire', sh: { k: 'face', n: [0.45, 0.05] }, shine: true, flush: true });
  parts.push({ s: poly(l, mid, r), m: 'topaz', sh: { k: 'face', n: [-0.05, 0.3] }, shine: true, flush: true, marks: [{ a: [12.0, 27.4], b: [20.0, 27.4], t: 4 }] });
  parts.push({ s: poly([14.2, 13.0], [17.8, 13.0], [18.6, 15.6], [13.4, 15.6]), m: 'steel', sh: { k: 'flat', bev: 0.8 }, shine: true });
  return parts;
}

/**
 * THE UNSIGNED PACT (amulet, the Warlock's own: the demon does not burn out; it feeds on your life). The pact itself, rolled, on
 * blackened chain: its foot hanging open, singed by the demon's fire, a red seal on it and the line for a name still bare.
 */
function unsignedpact(): Part[] {
  const parts = hung('dsteel', [16, 12.0]);
  const emb: Mark[] = [];
  for (let x = 10.6; x < 22; x += 1.2) emb.push({ a: [x, 28.6 + (Math.round(x * 1.7) % 2) * 0.8], t: Math.round(x) % 2 ? '#ff8a2c' : '#d8401a' });
  parts.push({
    s: poly([10.2, 17.0], [21.8, 17.0], [22.6, 28.6], [20.2, 27.6], [18.0, 29.6], [15.6, 28.0], [13.2, 29.6], [11.6, 27.8], [9.6, 28.8]), m: 'linen', sh: { k: 'flat', bev: 0.8 },
    marks: [{ a: [11.8, 20.8], b: [20.2, 20.8], t: 1 }, { a: [11.8, 22.8], b: [18.6, 22.8], t: 1 }, { a: [11.6, 26.2], b: [16.6, 26.2], t: 0 }, ...emb],
  });
  parts.push({ ...gem([19.6, 25.0], 1.7, 'ruby') });
  // the roll
  parts.push({ s: cap([8.8, 16.2], [23.2, 16.2], 2.9), m: 'linen', sh: { k: 'cyl', a: [8.8, 13.4], b: [23.2, 13.4], w: 3.2 }, bias: 0.1, marks: [{ a: [9.6, 17.6], b: [22.4, 17.6], t: 1 }] });
  for (const x of [7.6, 24.4]) parts.push({ s: ell([x, 16.2], 1.5, 2.9), m: 'linen', sh: { k: 'flat' }, bias: -0.3, marks: [{ a: [x, 15.4], b: [x, 17.0], t: 0 }] });
  // a red ribbon round it
  parts.push({ s: poly([14.8, 13.2], [17.2, 13.2], [17.4, 19.2], [14.6, 19.2]), m: 'red', sh: { k: 'cyl', a: [16, 13.2], b: [16, 19.2], w: 1.6 }, bias: 0.1 });
  return parts;
}

// ---------------------------------------------------------------------------------------------
// THE SEVEN RINGS. Each tilted toward you with its head on top, as the game's ring is; the band and the head are the unique's.

/** The game's ring band, in a metal; its shoulders under the head too, if asked. */
function band(metal: Part['m'], shoulders = true): Part[] {
  const parts: Part[] = [{ s: ell([16, 20.6], 10.2, 8.6), cut: [ell([16, 19.4], 6.6, 5.2)], m: metal, sh: { k: 'soft', r: 2.6 }, shine: true, marks: [{ a: [8.0, 17.0], b: [7.6, 21.6], t: 4 }] }];
  if (shoulders) parts.push({ s: poly([10.4, 12.6], [21.6, 12.6], [20.0, 15.6], [12.0, 15.6]), m: metal, sh: { k: 'soft', r: 1.6 }, shine: true });
  return parts;
}

/**
 * THE CENSOR'S SEAL (ring, from the Censor: the hold attack takes no words; the tap attack's are half as strong again). A heavy
 * signet of blackened iron, its face red, and a black bar struck across it: his mark, a line through a word.
 */
function censorsseal(): Part[] {
  const parts = band('dsteel');
  const c: V = [16, 8.4];
  parts.push({ s: ell(c, 7.4, 6.2), m: 'dsteel', sh: { k: 'dome', c, r: 7.4, ry: 6.2 }, shine: true });
  parts.push({ s: ell(c, 5.7, 4.6), m: 'red', sh: { k: 'flat', bev: 0.8 }, flush: true, bias: 0.25 });
  parts.push({ s: poly([9.6, 7.0], [22.4, 7.0], [22.4, 9.8], [9.6, 9.8]), m: 'shadow', sh: { k: 'flat' }, flush: true });
  return parts;
}

/**
 * THE QUILL'S BAND (ring, from the Scraper and the Quill: the tap attack takes no words; the hold attack's are half as strong
 * again). A silver band with a white quill laid over it, its point blue with ink, a drop of ink fallen from it.
 */
function quillsband(): Part[] {
  const parts = band('steel', false);
  const a: V = [4.8, 15.6], b: V = [27.4, 2.6];
  const u = unit(sub(b, a));
  const L = len(sub(b, a));
  // the vane: a point at its tip, broad in the middle, a nick in each edge
  const ts = [0.24, 0.36, 0.5, 0.64, 0.78, 0.9, 1.0];
  parts.push({
    s: path(ts.map((t) => at(a, u, t * L, 0)), [0.8, 2.6, 3.6, 3.8, 3.1, 1.9, 0.5]),
    cut: [poly(at(a, u, 0.5 * L, -4.2), at(a, u, 0.57 * L, -1.3), at(a, u, 0.6 * L, -4.2)), poly(at(a, u, 0.7 * L, 4.2), at(a, u, 0.77 * L, 1.2), at(a, u, 0.8 * L, 4.2))],
    m: 'feather', sh: { k: 'soft', r: 2.2 }, bias: 0.3, shine: true,
    marks: [0.4, 0.52, 0.66, 0.8].flatMap((t) => [{ a: at(a, u, t * L, -0.8), b: at(a, u, (t + 0.05) * L, -2.4), t: 2 }, { a: at(a, u, t * L, 0.8), b: at(a, u, (t + 0.05) * L, 2.4), t: 2 }]),
  });
  // its shaft, and its foot cut to a point black with ink; a drop of ink fallen from it
  parts.push({ s: cap(at(a, u, 0.2 * L, 0), at(a, u, 0.96 * L, 0), 0.5), m: 'ivory', sh: { k: 'flat' }, flush: true, bias: -0.3 });
  parts.push({ s: poly(at(a, u, 0.27 * L, -1.2), at(a, u, 0.1 * L, -0.7), a, at(a, u, 0.1 * L, 0.7), at(a, u, 0.27 * L, 1.2)), m: 'ivory', sh: { k: 'flat' }, bias: 0.2 });
  parts.push({ s: poly(at(a, u, 0.1 * L, -0.8), at(a, u, -0.02 * L, 0), at(a, u, 0.1 * L, 0.8)), m: 'sapphire', sh: { k: 'flat' }, shine: true, flush: true, bias: 0.1 });
  parts.push({ ...gem([3.8, 18.8], 1.2, 'sapphire') });
  return parts;
}

/**
 * THE CANTOR'S ECHO (ring, from the Cantor: adds Twin behind the hold attack). A gold ring with two stones where a ring has one,
 * the pair alike, in Twin's own sea-green.
 */
function cantorsecho(): Part[] {
  const parts = band('gold');
  parts.push({ s: poly([7.6, 9.4], [24.4, 9.4], [22.0, 13.6], [10.0, 13.6]), m: 'gold', sh: { k: 'soft', r: 1.6 }, shine: true });
  for (const x of [11.4, 20.6]) {
    parts.push({ s: ell([x, 7.8], 4.5, 4.9), m: 'gold', sh: { k: 'dome', c: [x, 7.8], r: 4.5, ry: 4.9 }, shine: true });
    parts.push({ ...gem([x, 7.6], 3.3, 'teal', 3.7), marks: [{ a: [x - 1.4, 5.6], t: 4 }] });
  }
  return parts;
}

/**
 * THE QUEEN'S GLASS (ring, from the Queen: adds Mirroring in front of the tap attack). A silver ring whose head is a small round
 * looking-glass in a crowned frame.
 */
function queensglass(): Part[] {
  const parts = band('steel');
  const c: V = [16, 9.4];
  // her crown's glass spikes over the frame
  for (const [x, h] of [[11.6, 2.4], [16, 1.2], [20.4, 2.4]] as [number, number][]) parts.push({ s: poly([x - 1.7, 6.0], [x, h], [x + 1.7, 6.0]), m: R.glass, sh: { k: 'flat', bev: 0.6 }, shine: true, bias: 0.2 });
  parts.push({ s: ell(c, 7.2, 5.2), m: 'steel', sh: { k: 'dome', c, r: 7.2, ry: 5.2 }, shine: true });
  parts.push({ s: ell(c, 5.6, 3.8), m: R.glass, sh: { k: 'flat' }, shine: true, flush: true, bias: -0.42, marks: [{ a: [12.0, 10.0], b: [15.0, 6.6], t: 4 }, { a: [13.4, 10.8], b: [16.4, 7.2], t: 4 }, { a: [17.4, 12.0], b: [20.6, 8.6], t: 3 }] });
  return parts;
}

/**
 * THE GHOSTWRITER (ring, from the endless final boss only: the swipe move also carries every word set on the tap attack). A
 * pale, ghost-grey band whose head is a gold pen's nib, a bead of the words' cyan at its point.
 */
function ghostwriter(): Part[] {
  const parts = band(R.ghost);
  parts.push({ s: poly([16, 2.6], [20.2, 8.0], [19.4, 13.4], [12.6, 13.4], [11.8, 8.0]), m: 'gold', sh: { k: 'ridge', a: [16, 13.4], b: [16, 2.6], tilt: 0.36 }, shine: true, marks: [{ a: [16, 4.6], b: [16, 8.4], t: 0 }] });
  parts.push({ s: ell([16, 9.8], 1.15), m: 'shadow', sh: { k: 'flat' }, flush: true });
  parts.push({ ...gem([16, 2.9], 1.25, 'core'), bias: 0.3 });
  return parts;
}

/**
 * THE ALLOY BAND (ring, the pool: melded words set in your attacks are half as strong again). Two metals twisted into one band,
 * gold and steel by turns, and at its head one stone of two colours.
 */
function alloyband(): Part[] {
  const parts = band('gold');
  const c: V = [16, 20.6];
  const far = 30;
  const ray = (a: number): V => [c[0] + Math.cos(a) * far, c[1] + Math.sin(a) * far];
  for (let i = 0; i < 7; i++) {
    const a0 = (i / 7) * Math.PI * 2 + 0.35, a1 = a0 + Math.PI / 7;
    parts.push({ s: poly(c, ray(a0), ray((a0 + a1) / 2), ray(a1)), cut: [ell([16, 19.4], 6.6, 5.2), ell(c, 40, 40)].slice(0, 1), m: 'steel', sh: { k: 'soft', r: 2.6 }, shine: true, flush: true });
  }
  // (the steel turns are cut to the band's own outline)
  const ring = (pt: Part): Part => ({ ...pt, cut: [...(pt.cut ?? []), ...outside(ell(c, 10.2, 8.6))] });
  for (let i = 2; i < parts.length; i++) parts[i] = ring(parts[i]);
  // the head: one stone, half amber and half sapphire, in a gold collar
  const g: V = [16, 8.6];
  parts.push({ s: ell(g, 5.6, 5.2), m: 'gold', sh: { k: 'dome', c: g, r: 5.6, ry: 5.2 }, shine: true });
  parts.push({ s: ell(g, 4.0, 3.7), cut: [poly([16, 0], [32, 0], [32, 20], [16, 20])], m: 'amber', sh: { k: 'dome', c: g, r: 4.0, ry: 3.7 }, shine: true, flush: true });
  parts.push({ s: ell(g, 4.0, 3.7), cut: [poly([0, 0], [16, 0], [16, 20], [0, 20])], m: 'sapphire', sh: { k: 'dome', c: g, r: 4.0, ry: 3.7 }, shine: true, flush: true });
  return parts;
}

/**
 * THE COMPANY SCRIP (ring, the Tinkerer's own: the whistle and the Blast Jump have no cooldown; each use costs gold). A brass
 * band with a company token for a head: a toothed brass coin, a square hole punched through it.
 */
function companyscrip(): Part[] {
  const parts = band('brass');
  const c: V = [16, 8.4];
  parts.push({ ...cog(c, 6.9, 10, 'brass', 0.1), cut: [] });
  parts.push({ s: ell(c, 4.6), m: 'brass', sh: { k: 'flat', bev: 0.8 }, shine: true, flush: true, bias: 0.12, marks: [{ a: [12.4, 6.0], b: [13.6, 4.8], t: 4 }] });
  parts.push({ s: poly([14.2, 6.6], [17.8, 6.6], [17.8, 10.2], [14.2, 10.2]), m: 'shadow', sh: { k: 'flat' }, flush: true });
  return parts;
}

// ---------------------------------------------------------------------------------------------
// THE SIX GLOVES. The back of the hand toward you, fingers up, the thumb out to the left, as the game's gauntlet is.

const FINGERS: readonly [V, V][] = [[[12.4, 12.6], [11.2, 4.2]], [[15.4, 12.0], [15.0, 2.8]], [[18.4, 12.0], [18.8, 3.4]], [[21.0, 12.6], [22.6, 5.8]]];
const THUMB: readonly V[] = [[11.6, 19.0], [7.8, 16.4], [5.2, 12.4]];

/** The game's gauntlet's hand in the materials given: the cuff, the palm, four fingers, the back of the hand, the thumb. */
function hand(o: { cuff: Part['m']; palm: Part['m']; finger: Part['m']; back: Part['m']; shine?: boolean; joints?: number | string }): Part[] {
  const parts: Part[] = [];
  const sh = !!o.shine;
  parts.push({ s: poly([10.0, 22.0], [22.6, 22.0], [25.2, 29.6], [7.4, 29.6]), m: o.cuff, sh: { k: 'soft', r: 2.4 }, shine: sh });
  parts.push({ s: poly([10.6, 11.8], [22.0, 11.0], [22.6, 18.6], [21.4, 22.6], [11.0, 22.6], [10.0, 17.6]), m: o.palm, sh: { k: 'soft', r: 2.5 } });
  for (const [a, b] of FINGERS) {
    const u = unit(sub(b, a));
    parts.push({ s: cap(a, b, 1.62), m: o.finger, sh: { k: 'cyl', a, b, w: 1.6 }, shine: sh, marks: o.joints === undefined ? [] : [3, 5.8].map((d) => ({ a: at(a, u, d, -1.5), b: at(a, u, d, 1.5), t: o.joints! })) });
  }
  parts.push({ s: poly([10.4, 12.4], [22.2, 11.6], [22.6, 18.4], [16.4, 19.6], [10.2, 18.0]), m: o.back, sh: { k: 'soft', r: 3 }, shine: sh });
  parts.push({ s: path(THUMB, [2.0, 1.7, 1.4]), m: o.finger, sh: { k: 'cyl', a: THUMB[0], b: THUMB[2], w: 1.8 }, shine: sh });
  return parts;
}

/**
 * THE FREE HAND (gloves, the pool: with a wand or tome and no focus beside it, faster attacks and harder critical hits). A
 * caster's glove of violet silk with the fingers cut away: the hand left free.
 */
function freehand(): Part[] {
  const parts = hand({ cuff: 'vcloth', palm: 'vcloth', finger: R.skin, back: 'vcloth' });
  // the silk comes half way up each finger and the thumb
  for (const [a, b] of FINGERS) parts.push({ s: cap(a, lerp(a, b, 0.42), 1.75), m: 'vcloth', sh: { k: 'cyl', a, b, w: 1.75 }, bias: 0.06, flush: true });
  parts.push({ s: path([THUMB[0], THUMB[1]], [2.1, 1.8]), m: 'vcloth', sh: { k: 'cyl', a: THUMB[0], b: THUMB[1], w: 1.9 }, bias: 0.06 });
  parts.push({ s: poly([10.4, 12.4], [22.2, 11.6], [22.6, 18.4], [16.4, 19.6], [10.2, 18.0]), m: 'vcloth', sh: { k: 'soft', r: 3 }, bias: 0.1, marks: [{ a: [11.2, 13.4], b: [21.2, 12.8], t: '#d0902c' }] });
  parts.push({ s: cap([10.0, 22.4], [22.6, 22.4], 0.9), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true });
  parts.push({ s: poly([8.2, 27.6], [24.4, 27.6], [25.0, 29.4], [7.6, 29.4]), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true, flush: true });
  parts.push(gem([16.4, 15.8], 1.5, 'amber'));
  return parts;
}

/**
 * THE FLESHMANCER'S BRAND (gloves, from the Fleshmancer: an elite you kill rises and fights for you). A glove of grey dead hide
 * sewn with black thread, and on the back of the hand his brand, still burning.
 */
function fleshmancersbrand(): Part[] {
  const parts = hand({ cuff: 'black', palm: R.flesh, finger: R.flesh, back: R.flesh, joints: 0 });
  const back = parts[parts.length - 2];
  parts[parts.length - 2] = { ...back, marks: [{ a: [10.8, 13.2], b: [21.8, 12.4], t: 0 }, ...[12.2, 14.4, 16.6, 18.8, 21.0].map((x) => ({ a: [x, 12.2] as V, b: [x + 0.4, 14.0] as V, t: 0 }))] };
  parts[0] = { ...parts[0], bias: 0.3, marks: [{ a: [9.6, 23.4], b: [23.0, 23.4], t: 4 }] };
  // the brand: a ring and a stroke through it, in fire
  const c: V = [16.4, 16.0];
  parts.push({ s: ell(c, 2.9, 2.7), cut: [ell(c, 1.5, 1.3)], m: 'fire', sh: { k: 'flat' }, shine: true, flush: true, bias: 0.5 });
  parts.push({ s: cap([16.4, 12.6], [16.4, 19.2], 0.55), m: 'fire', sh: { k: 'flat' }, shine: true, flush: true, bias: 0.7 });
  return parts;
}

/**
 * THE HALF-CARVED HAND (gloves, from the Unfinished: below half life you attack and move much faster). A hand of pale stone, left
 * as he was: the thumb and two fingers carved fine, the rest still the block, the chisel's marks on it.
 */
function halfcarvedhand(): Part[] {
  const parts: Part[] = [];
  // the block: the cuff, and the half of the hand not yet cut
  parts.push({ s: poly([8.6, 22.0], [25.0, 21.6], [26.0, 29.8], [7.6, 29.8]), m: R.marble, sh: { k: 'flat', bev: 1.4 }, bias: -0.1, marks: [{ a: [10.0, 24.6], b: [13.0, 27.6], t: 1 }, { a: [15.0, 24.0], b: [18.0, 27.0], t: 1 }, { a: [20.0, 24.0], b: [23.0, 27.4], t: 1 }] });
  parts.push({ s: poly([16.6, 3.4], [24.4, 2.6], [26.0, 11.0], [25.0, 22.4], [16.4, 22.6]), m: R.marble, sh: { k: 'flat', bev: 1.6 }, bias: -0.12, marks: [{ a: [18.4, 5.4], b: [21.4, 8.6], t: 1 }, { a: [21.0, 4.4], b: [24.0, 7.6], t: 1 }, { a: [18.6, 10.6], b: [21.6, 13.8], t: 1 }, { a: [21.6, 12.0], b: [24.4, 15.0], t: 1 }, { a: [18.4, 16.4], b: [21.4, 19.6], t: 1 }, { a: [17.6, 4.0], b: [17.4, 21.6], t: 4 }] });
  // the half that is carved: the palm, two fingers, the back of the hand, the thumb
  parts.push({ s: poly([10.6, 11.8], [17.0, 11.4], [17.0, 22.6], [11.0, 22.6], [10.0, 17.6]), m: R.marble, sh: { k: 'soft', r: 2.5 }, shine: true });
  for (const [a, b] of FINGERS.slice(0, 2)) {
    const u = unit(sub(b, a));
    parts.push({ s: cap(a, b, 1.62), m: R.marble, sh: { k: 'cyl', a, b, w: 1.6 }, shine: true, bias: 0.08, marks: [3, 5.8].map((d) => ({ a: at(a, u, d, -1.5), b: at(a, u, d, 1.5), t: 1 })) });
  }
  parts.push({ s: poly([10.4, 12.4], [17.0, 12.0], [17.0, 19.4], [10.2, 18.0]), m: R.marble, sh: { k: 'soft', r: 3 }, shine: true, bias: 0.08 });
  parts.push({ s: path(THUMB, [2.0, 1.7, 1.4]), m: R.marble, sh: { k: 'cyl', a: THUMB[0], b: THUMB[2], w: 1.8 }, shine: true, bias: 0.08 });
  return parts;
}

/**
 * THE PRESS (gloves, the Warrior's own: the more enemies close round you, the harder you hit). A plate gauntlet shut into a
 * fist, seen from the front: steel, a red strap, a gilt spike on every knuckle.
 */
function press(): Part[] {
  const parts: Part[] = [];
  const k = 1.3, cx = 16.6, cy = 12.2;
  const t = (p: V): V => [cx + k * p[0], cy + k * p[1]];
  const tp = (ps: V[]): V[] => ps.map(t);
  // the wrist and its flared cuff
  parts.push({ s: poly(...tp([[-4.4, 6.0], [4.6, 6.0], [6.4, 12.6], [-6.2, 12.6]])), m: 'steel', sh: { k: 'soft', r: 2.4 }, shine: true, marks: [{ a: t([-5.4, 11.4]), b: t([5.6, 11.4]), t: '#d0902c' }] });
  parts.push({ s: poly(...tp([[-4.8, 5.2], [5.0, 5.2], [5.0, 7.2], [-4.8, 7.2]])), m: 'red', sh: { k: 'flat', bev: 0.8 } });
  // the back of the fist, the four fingers rolled under, a spike on each knuckle, the thumb across
  parts.push({ s: poly(...tp([[-6.4, -3.0], [6.4, -3.0], [6.2, 4.8], [4.6, 6.4], [-4.6, 6.4], [-6.4, 4.6]])), m: 'steel', sh: { k: 'soft', r: 2.4 }, shine: true, bias: -0.1 });
  [-4.8, -1.6, 1.6, 4.8].forEach((x, i) => {
    const top = i === 1 || i === 2 ? -4.6 : -3.9;
    parts.push({ s: poly(t([x - 1.2, top - 0.6]), t([x, top - 3.2]), t([x + 1.2, top - 0.6])), m: 'gold', sh: { k: 'soft', r: 1 }, shine: true });
    parts.push({ s: cap(t([x, top]), t([x, 2.2]), 1.62 * k), m: 'steel', sh: { k: 'cyl', a: t([x - 1, 0]), b: t([x + 1, 0]), w: 1.7 * k }, shine: true, bias: 0.04, marks: [{ a: t([x - 1.4, -0.6]), b: t([x + 1.4, -0.6]), t: 0 }] });
  });
  parts.push({ s: cap(t([-6.3, 4.4]), t([1.4, 3.4]), 1.7 * k), m: 'steel', sh: { k: 'cyl', a: t([-6, 4.4]), b: t([1.4, 3.4]), w: 1.7 * k }, shine: true, bias: 0.1 });
  return parts;
}

/**
 * THE HAIR TRIGGER (gloves, the Ranger's own: an arrow of yours that crosses one of your traps sets it off at once, twice as
 * hard). An archer's leather glove, a trap's steel teeth across its knuckles, and a hair stretched from finger to thumb.
 */
function hairtrigger(): Part[] {
  const parts = hand({ cuff: 'green', palm: 'leather', finger: 'leather', back: 'leather', joints: 1 });
  parts[0] = { ...parts[0], marks: [{ a: [8.4, 28.0], b: [24.4, 28.0], t: '#d0902c' }] };
  // the trap's jaw over the knuckles: a steel bar, its teeth up
  const teeth: V[] = [[9.6, 13.6]];
  for (let i = 0; i < 6; i++) teeth.push([10.6 + i * 2.1, 9.6 + (i % 2) * 0.4], [11.7 + i * 2.1, 12.2]);
  teeth.push([23.2, 12.8], [23.0, 15.0], [9.8, 15.8]);
  parts.push({ s: poly(...teeth), m: 'steel', sh: { k: 'flat', bev: 0.8 }, shine: true });
  for (const p of [[10.8, 14.6], [22.0, 13.8]] as V[]) parts.push(stud(p, 0.7, 'brass'));
  // the hair: from the first finger's tip to the thumb's
  parts.push({ s: cap([11.0, 3.6], [4.8, 11.4], 0.45), m: 'string', sh: { k: 'flat' }, flush: true, bias: 0.3 });
  parts.push(gem([16.2, 26.0], 1.0, 'amber'));
  return parts;
}

/**
 * THE RECEIPT (gloves, the Brawler's own: a blow he takes from in front is answered at once with a free punch). A prize
 * fighter's padded glove, red, laced at the wrist.
 */
function receipt(): Part[] {
  const parts: Part[] = [];
  // the cuff, laced
  parts.push({ s: poly([10.6, 20.4], [22.4, 20.4], [23.6, 29.6], [9.4, 29.6]), m: 'red', sh: { k: 'soft', r: 2 }, bias: -0.12 });
  parts.push({ s: poly([13.4, 21.4], [19.0, 21.4], [19.4, 29.6], [13.0, 29.6]), m: 'linen', sh: { k: 'flat', bev: 0.6 }, flush: true, marks: [{ a: [13.8, 23.0], b: [18.6, 25.0], t: 0 }, { a: [18.6, 23.0], b: [13.8, 25.0], t: 0 }, { a: [13.8, 26.4], b: [18.6, 28.4], t: 0 }, { a: [18.6, 26.4], b: [13.8, 28.4], t: 0 }] });
  parts.push({ s: poly([9.8, 20.0], [23.0, 20.0], [23.2, 22.2], [9.6, 22.2]), m: 'linen', sh: { k: 'flat', bev: 0.8 } });
  // the mitt, and the thumb sewn to its side
  parts.push({ s: ell([16.8, 11.6], 8.8, 9.4), m: 'red', sh: { k: 'dome', c: [15.6, 10.4], r: 9.6, ry: 10 }, shine: true, bias: 0.06, marks: [{ a: [12.4, 5.6], b: [10.6, 9.4], t: 4 }, { a: [11.4, 16.6], b: [20.4, 18.6], t: 0 }] });
  parts.push({ s: ell([8.4, 15.4], 3.2, 5.0, -14), m: 'red', sh: { k: 'dome', c: [7.8, 14.6], r: 3.4, ry: 5.2 }, shine: true, bias: 0.12 });
  return parts;
}

// ---------------------------------------------------------------------------------------------
// THE FIVE BELTS. Each a loop with what it carries at the front, as the game's belt is.

/** The game's belt loop in a hide: its inside behind, in shadow, then its front. */
function loop(hide: Part['m'], marks: Mark[] = [], bias = 0): Part[] {
  const c: V = [16, 15.6];
  return [
    { s: ell(c, 13.8, 9.0), cut: [ell([16, 17.2], 10.0, 5.0), poly([0, 16], [32, 16], [32, 32], [0, 32])], m: hide, sh: { k: 'flat' }, bias: -0.36 + bias },
    { s: ell(c, 13.8, 9.0), cut: [ell([16, 13.6], 10.4, 5.4), poly([0, 0], [32, 0], [32, 15.4], [0, 15.4])], m: hide, sh: { k: 'soft', r: 2.2 }, bias, marks: [{ a: [6, 19.6], b: [10, 21.6], t: 3 }, ...marks] },
  ];
}
/** A square buckle at the belt's front, and the belt's tail through it. */
function buckle(metal: Part['m'], hide: Part['m'], tail = true): Part[] {
  const parts: Part[] = [];
  if (tail) parts.push({ s: poly([13.6, 22.6], [17.4, 22.6], [17.8, 29.4], [16.0, 30.4], [14.2, 29.4]), m: hide, sh: { k: 'soft', r: 1.4 }, bias: 0.05 });
  parts.push({ s: poly([11.8, 19.2], [20.2, 19.2], [20.2, 26.0], [11.8, 26.0]), cut: [poly([13.6, 20.8], [18.4, 20.8], [18.4, 24.4], [13.6, 24.4])], m: metal, sh: { k: 'flat', bev: 1.2 }, shine: true });
  parts.push({ s: cap([13.6, 22.6], [17.6, 22.6], 0.55), m: metal, sh: { k: 'flat' }, shine: true });
  return parts;
}

/**
 * BLOODPRICE (belt, the pool: flasks no longer heal; drinking one makes you hit much harder). A blood-red belt with two flasks hung
 * from it, round and full and red, and a red stone in its buckle.
 */
function bloodprice(): Part[] {
  const parts = [...loop('bookred', [], 0.22), ...buckle('gold', 'bookred')];
  parts.push(gem([16, 19.6], 1.2, 'ruby'));
  // a second, smaller, at the other hip
  parts.push({ s: cap([7.6, 20.4], [7.6, 22.4], 1.1), m: 'wood', sh: { k: 'cyl', a: [6.4, 21.4], b: [8.8, 21.4], w: 1.2 } });
  parts.push({ s: ell([7.6, 25.6], 3.2, 3.3), m: 'ruby', sh: { k: 'dome', c: [7.0, 25.0], r: 3.2, ry: 3.3 }, shine: true });
  // the flask: its strap, its neck and cork, its round belly
  parts.push({ s: cap([24.4, 16.6], [24.4, 19.0], 0.8), m: 'dleather', sh: { k: 'flat' } });
  parts.push({ s: cap([24.4, 18.4], [24.4, 20.0], 1.3), m: 'wood', sh: { k: 'cyl', a: [23, 19], b: [26, 19], w: 1.4 } });
  parts.push({ s: cap([24.4, 20.0], [24.4, 22.0], 1.5), m: R.glass, sh: { k: 'cyl', a: [24.4, 20], b: [24.4, 22], w: 1.5 }, shine: true });
  parts.push({ s: ell([24.4, 26.0], 4.8, 4.6), m: 'ruby', sh: { k: 'dome', c: [23.6, 25.2], r: 4.8, ry: 4.6 }, shine: true, marks: [{ a: [22.0, 24.0], b: [21.6, 26.0], t: 4 }] });
  return parts;
}

/**
 * THE KING'S KNOT (belt, from the Rat King: when you kill a monster that carries a word, your tap attack carries it too for a
 * few seconds). A girdle of rats' tails, tied at the front in the knot that made them one king, the ends hanging.
 */
function kingsknot(): Part[] {
  const twist: Mark[] = [];
  for (let x = 4.6; x < 28; x += 2.2) { const y = 15.6 + Math.sqrt(Math.max(0, 1 - ((x - 16) / 13.8) ** 2)) * 7.4; twist.push({ a: [x, y - 1.6], b: [x + 1.0, y + 0.4], t: 1 }); }
  const parts = loop(R.tail, twist);
  // the ends, hanging, each tapering to a point
  parts.push({ s: path([[14.2, 24.6], [12.6, 27.6], [10.4, 30.2]], [1.3, 1.0, 0.5]), m: R.tail, sh: { k: 'soft', r: 1 }, bias: -0.05 });
  parts.push({ s: path([[18.0, 24.6], [19.8, 27.4], [22.8, 29.6]], [1.3, 1.0, 0.5]), m: R.tail, sh: { k: 'soft', r: 1 }, bias: -0.05 });
  parts.push({ s: path([[16.2, 25.0], [16.4, 28.0], [15.6, 30.6]], [1.2, 0.9, 0.5]), m: R.tail, sh: { k: 'soft', r: 1 }, bias: 0.05 });
  // the knot: two loops through each other, and the turn that binds them
  parts.push({ s: ell([13.2, 22.0], 3.9, 3.3), cut: [ell([13.2, 22.0], 1.7, 1.2)], m: R.tail, sh: { k: 'soft', r: 1.4 }, bias: 0.12 });
  parts.push({ s: ell([18.8, 22.0], 3.9, 3.3), cut: [ell([18.8, 22.0], 1.7, 1.2)], m: R.tail, sh: { k: 'soft', r: 1.4 }, bias: 0.12 });
  parts.push({ s: cap([14.4, 20.2], [17.6, 23.8], 1.5), m: R.tail, sh: { k: 'cyl', a: [14.4, 20.2], b: [17.6, 23.8], w: 1.5 }, bias: 0.25 });
  return parts;
}

/**
 * THE WARDEN'S KEYS (belt, from the Warden: every sealed word door opens to you without its word, and every chest holds one
 * more piece). The warden's own belt, his iron ring on it and two keys: one of gold, one of steel.
 */
function wardenskeys(): Part[] {
  const parts = [...loop('leather'), ...buckle('brass', 'leather', false)];
  // two keys hung from the ring, each a shaft and its bit: one of gold, one of steel
  parts.push({ s: cap([23.4, 22.0], [20.4, 29.2], 0.85), m: 'gold', sh: { k: 'flat' }, shine: true });
  parts.push({ s: poly([20.9, 26.0], [18.0, 24.8], [17.2, 26.8], [18.6, 27.4], [18.2, 28.4], [20.2, 29.4]), m: 'gold', sh: { k: 'flat' }, shine: true });
  parts.push({ s: cap([25.0, 22.4], [25.6, 29.8], 0.85), m: 'steel', sh: { k: 'flat' }, shine: true });
  parts.push({ s: poly([25.4, 26.4], [28.6, 26.2], [28.6, 27.6], [27.4, 27.6], [27.4, 28.6], [28.6, 28.6], [28.6, 30.2], [25.6, 30.4]), m: 'steel', sh: { k: 'flat' }, shine: true });
  // the ring they hang from
  parts.push({ s: ell([24.2, 19.8], 3.9, 3.7), cut: [ell([24.2, 19.8], 2.3, 2.1)], m: 'dsteel', sh: { k: 'soft', r: 1 }, shine: true, bias: 0.35 });
  return parts;
}

/**
 * THE MISER'S PURSE (belt, the pool: the more gold you carry, the harder you hit; every hit you take spills some). A belt with a
 * fat purse on it, drawn shut and padlocked, a coin already through the seam.
 */
function miserspurse(): Part[] {
  const parts = [...loop('leather'), ...buckle('brass', 'leather')];
  // a coin fallen, and one on its way
  parts.push({ s: ell([18.6, 29.2], 2.1, 1.5), m: 'gold', sh: { k: 'dome', c: [18.4, 29.0], r: 2.1, ry: 1.5 }, shine: true });
  // the purse: its belly, its gathered neck, the string, the lock
  parts.push({ s: ell([24.0, 24.4], 5.6, 5.4), m: 'green', sh: { k: 'dome', c: [23.0, 23.4], r: 5.8, ry: 5.6 }, bias: 0.28, marks: [{ a: [21.6, 20.6], b: [21.0, 24.6], t: 1 }, { a: [24.4, 20.4], b: [24.6, 24.0], t: 1 }, { a: [27.0, 20.8], b: [27.6, 24.2], t: 1 }] });
  parts.push({ s: poly([20.8, 15.6], [22.6, 16.6], [24.2, 15.4], [25.8, 16.6], [27.6, 15.6], [26.6, 19.6], [21.6, 19.6]), m: 'green', sh: { k: 'soft', r: 1.2 }, bias: 0.2 });
  parts.push({ s: cap([21.4, 19.4], [26.8, 19.4], 0.8), m: 'gold', sh: { k: 'flat' }, shine: true });
  parts.push({ s: poly([22.6, 21.0], [25.6, 21.0], [25.6, 24.2], [22.6, 24.2]), m: 'steel', sh: { k: 'flat', bev: 0.8 }, shine: true, marks: [{ a: [24.1, 22.2], b: [24.1, 23.2], t: 0 }] });
  parts.push({ s: ell([21.4, 28.4], 1.9, 1.5), m: 'gold', sh: { k: 'dome', c: [21.2, 28.2], r: 1.9, ry: 1.5 }, shine: true });
  return parts;
}

/**
 * THE TOW LINE (belt, the Tinkerer's own: the Golem rides the Blast Jump with her). A belt of stout line, a turn of it coiled at
 * her hip, and at the front a steel tow hook in a brass collar.
 */
function towline(): Part[] {
  const twist: Mark[] = [];
  for (let x = 4.0; x < 28.4; x += 1.8) { const y = 15.6 + Math.sqrt(Math.max(0, 1 - ((x - 16) / 13.8) ** 2)) * 7.4; twist.push({ a: [x, y - 1.8], b: [x + 1.2, y + 0.6], t: 1 }); }
  const parts = loop(R.rope, twist);
  // a coil of it at the hip
  for (const [x, y] of [[25.0, 22.0], [26.2, 24.4]] as [number, number][]) parts.push({ s: ell([x, y], 3.2, 2.2), cut: [ell([x, y], 1.6, 0.8)], m: R.rope, sh: { k: 'soft', r: 1 }, bias: 0.1 });
  // the collar and the hook
  parts.push({ s: path([[16, 21.6], [16, 25.4], [18.2, 28.6], [21.4, 28.2], [22.4, 25.4]], [1.6, 1.6, 1.5, 1.3, 0.8]), m: 'steel', sh: { k: 'soft', r: 1.2 }, shine: true });
  parts.push({ s: poly([13.4, 18.6], [18.6, 18.6], [18.6, 22.6], [13.4, 22.6]), m: 'brass', sh: { k: 'cyl', a: [13.4, 20.6], b: [18.6, 20.6], w: 2 }, shine: true, marks: [{ a: [13.8, 20.6], b: [18.2, 20.6], t: 0 }] });
  parts.push({ ...gem([16, 19.6], 0.9, 'core'), bias: 0.3 });
  return parts;
}

// ---------------------------------------------------------------------------------------------
// THE FIVE HELMETS.

/**
 * TWO-FACED MASK (helm, the pool: the first word in front of the tap attack also works as if set behind). One mask, two faces:
 * the pale half smiling, the dark half not, red ribbons to tie it.
 */
function twofacedmask(): Part[] {
  const parts: Part[] = [];
  // the ribbons, behind
  for (const sx of [-1, 1]) parts.push({ s: path([[16 + sx * 9.0, 12.6], [16 + sx * 12.4, 14.6], [16 + sx * 13.2, 19.6]], [1.0, 0.9, 0.6]), m: 'red', sh: { k: 'soft', r: 1 } });
  const half = (sx: number): V[] => [[16, 3.0], [16 + sx * 5.6, 4.2], [16 + sx * 9.0, 8.4], [16 + sx * 9.8, 14.6], [16 + sx * 8.4, 20.8], [16 + sx * 5.0, 25.8], [16, 28.8]];
  parts.push({ s: poly(...half(-1)), m: 'ivory', sh: { k: 'soft', r: 3.4 }, shine: true, marks: [{ a: [11.0, 20.6], b: [12.6, 22.4], t: 0 }, { a: [12.6, 22.4], b: [16, 23.0], t: 0 }, { a: [9.8, 10.4], b: [13.6, 9.8], t: 1 }, { a: [15.4, 14.0], b: [15.4, 18.0], t: 1 }] });
  parts.push({ s: poly(...half(1)), m: R.velvet, sh: { k: 'soft', r: 3.4 }, shine: true, bias: 0.1, marks: [{ a: [16, 23.0], b: [19.4, 23.6], t: 4 }, { a: [19.4, 23.6], b: [21.0, 25.4], t: 4 }, { a: [18.4, 9.4], b: [22.2, 11.0], t: 4 }] });
  // the eyes: the pale one curved in a smile, the dark one slanting down
  parts.push({ s: poly([9.0, 13.6], [11.6, 11.8], [14.2, 13.6], [11.6, 13.0]), m: 'shadow', sh: { k: 'flat' }, flush: true });
  parts.push({ s: poly([17.8, 12.4], [22.8, 14.4], [20.6, 15.4], [18.0, 14.0]), m: 'shadow', sh: { k: 'flat' }, flush: true, marks: [{ a: [19.6, 13.9], t: '#d8401a' }] });
  // gilt down the join and across the brow
  parts.push({ s: cap([16, 3.6], [16, 10.6], 0.55), m: 'gold', sh: { k: 'flat' }, shine: true, flush: true });
  parts.push(gem([16, 6.4], 1.3, 'amber'));
  return parts;
}

/**
 * THE HEADSMAN'S HOOD (helm, from the Headsman: adds Culling in front of the tap attack). The executioner's tall pointed hood:
 * dark red, two holes cut for the eyes, the rope at its neck.
 */
function headsmanshood(): Part[] {
  const parts: Part[] = [];
  parts.push({
    s: poly([17.0, 1.8], [19.4, 6.6], [22.2, 13.6], [23.4, 19.6], [28.4, 24.0], [30.0, 29.6], [2.0, 29.6], [3.6, 24.0], [8.6, 19.6], [9.8, 13.6], [12.6, 6.6], [15.0, 2.6]),
    m: 'bookred', sh: { k: 'soft', r: 4.2 }, bias: 0.26,
    marks: [{ a: [14.6, 5.0], b: [11.8, 13.0], t: 4 }, { a: [16.2, 4.0], b: [16.0, 11.6], t: 0 }, { a: [16.0, 18.4], b: [16.0, 22.6], t: 0 }, { a: [7.4, 25.0], b: [5.4, 28.6], t: 0 }, { a: [24.6, 25.0], b: [26.6, 28.6], t: 0 }, { a: [11.6, 25.6], b: [11.0, 28.8], t: 0 }, { a: [20.6, 25.6], b: [21.4, 28.8], t: 0 }],
  });
  // the eye holes
  for (const sx of [-1, 1]) parts.push({ s: poly([16 + sx * 1.4, 14.4], [16 + sx * 5.6, 12.8], [16 + sx * 6.2, 16.2], [16 + sx * 2.4, 17.8]), m: 'shadow', sh: { k: 'flat' }, flush: true, bias: -0.5 });
  // the rope, knotted at the throat, its end hanging
  parts.push({ s: path([[8.4, 20.8], [12.0, 22.6], [16, 23.2], [20.0, 22.6], [23.6, 20.8]], [1.1, 1.1, 1.1, 1.1, 1.1]), m: 'string', sh: { k: 'soft', r: 1 }, marks: [10, 12.4, 14.8, 17.2, 19.6, 22].map((x) => ({ a: [x, 21.4 + (1 - Math.abs(x - 16) / 8) * 1.6] as V, t: 1 })) });
  parts.push({ s: ell([16, 23.6], 1.9, 1.7), m: 'string', sh: { k: 'dome', c: [16, 23.6], r: 1.9 } });
  parts.push({ s: path([[16.2, 24.6], [16.8, 27.6], [16.2, 29.6]], [0.9, 0.8, 0.7]), m: 'string', sh: { k: 'soft', r: 1 }, marks: [{ a: [16.6, 26.4], t: 1 }, { a: [16.4, 28.4], t: 1 }] });
  return parts;
}

/**
 * THE CRIER'S HUSH (helm, from the Crier: a monster standing close to you has its word darkened). The bell of the Crier's brass
 * trumpet worn as a helmet, mouth down, and bound across its face a gag of his wine-red cloth: nothing comes out of it.
 */
function criershush(): Part[] {
  const parts: Part[] = [];
  // the gag's ends, hanging behind
  parts.push({ s: path([[24.6, 21.6], [28.0, 23.6], [29.4, 27.0]], [1.3, 1.1, 0.6]), m: R.wine, sh: { k: 'soft', r: 1 }, bias: -0.1 });
  // the trumpet's tube, turned over at the top
  parts.push({ s: ell([16.2, 4.4], 3.2, 2.4), cut: [ell([16.2, 4.4], 1.5, 0.9)], m: 'brass', sh: { k: 'soft', r: 1 }, shine: true });
  // the bell: narrow at the crown, flaring to its rim
  parts.push({
    s: poly([14.2, 5.6], [18.0, 5.6], [19.0, 10.0], [21.4, 15.0], [24.8, 20.0], [29.4, 25.0], [29.8, 28.4], [2.2, 28.4], [2.6, 25.0], [7.2, 20.0], [10.6, 15.0], [13.2, 10.0]),
    m: 'brass', sh: { k: 'soft', r: 4 }, shine: true, bias: 0.1,
    marks: [{ a: [13.6, 8.0], b: [9.6, 17.6], t: 4 }, { a: [9.6, 17.6], b: [5.0, 23.6], t: 4 }, { a: [19.6, 12.0], b: [23.6, 19.6], t: 1 }],
  });
  // its rolled rim
  parts.push({ s: path([[2.6, 27.4], [9.0, 28.8], [16, 29.4], [23.0, 28.8], [29.4, 27.4]], [1.5, 1.5, 1.5, 1.5, 1.5]), m: 'gold', sh: { k: 'soft', r: 1.2 }, shine: true });
  // the slit to see by, and the gag bound under it, knotted at the side
  parts.push({ s: poly([10.6, 14.6], [21.4, 14.6], [22.6, 17.4], [9.4, 17.4]), m: 'shadow', sh: { k: 'flat' }, flush: true });
  parts.push({ s: poly([8.4, 18.2], [23.6, 18.2], [26.0, 22.6], [6.0, 22.6]), m: R.wine, sh: { k: 'soft', r: 1.6 }, bias: 0.15, marks: [{ a: [8.6, 20.2], b: [23.4, 20.0], t: 1 }, { a: [12.0, 19.0], b: [20.0, 19.0], t: 4 }] });
  parts.push({ s: ell([24.8, 20.6], 2.1, 1.9), m: R.wine, sh: { k: 'dome', c: [24.4, 20.2], r: 2.1 }, bias: 0.25 });
  return parts;
}

/**
 * THE HOLLOW CROWN (helm, from the Hollow Stag: adds Binding behind the swipe move). A crown of his antlers on a band of bark,
 * bound round with green briar, and nothing inside it.
 */
function hollowcrown(): Part[] {
  const parts: Part[] = [];
  // the antlers: a beam each side, two tines on each
  for (const sx of [-1, 1]) {
    const x = (v: number): number => 16 + sx * v;
    parts.push({ s: path([[x(8.0), 21.6], [x(10.4), 15.6], [x(11.4), 9.6], [x(9.6), 3.6]], [1.7, 1.5, 1.2, 0.6]), m: 'ivory', sh: { k: 'soft', r: 1.2 }, shine: true, bias: sx < 0 ? 0.1 : -0.05 });
    parts.push({ s: path([[x(10.2), 16.0], [x(6.4), 12.2], [x(5.4), 7.6]], [1.2, 1.0, 0.5]), m: 'ivory', sh: { k: 'soft', r: 1 }, shine: true, bias: sx < 0 ? 0.1 : -0.05 });
    parts.push({ s: path([[x(11.2), 10.4], [x(13.8), 7.0]], [1.0, 0.5]), m: 'ivory', sh: { k: 'soft', r: 1 }, shine: true, bias: sx < 0 ? 0.1 : -0.05 });
  }
  // the band: its far rim, the hollow, its front
  parts.push({ s: ell([16, 21.8], 10.4, 3.4), m: 'ebony', sh: { k: 'flat' }, bias: 0.1 });
  parts.push({ s: ell([16, 22.2], 8.8, 2.3), m: 'shadow', sh: { k: 'flat' }, flush: true });
  parts.push({ s: poly([5.6, 21.8], [8.6, 24.0], [16, 25.0], [23.4, 24.0], [26.4, 21.8], [26.6, 27.4], [22.6, 29.4], [16, 30.2], [9.4, 29.4], [5.4, 27.4]), m: 'wood', sh: { k: 'soft', r: 2.2 }, marks: [{ a: [8.6, 25.6], b: [8.8, 28.0], t: 0 }, { a: [13.0, 26.4], b: [13.2, 29.0], t: 0 }, { a: [19.6, 26.4], b: [19.4, 29.0], t: 0 }, { a: [23.6, 25.6], b: [23.4, 27.8], t: 0 }] });
  // the briar bound round it, its leaves
  parts.push({ s: path([[5.6, 25.6], [10.6, 27.8], [16, 27.0], [21.4, 28.2], [26.4, 25.6]], [0.8, 0.8, 0.8, 0.8, 0.8]), m: R.moss, sh: { k: 'flat' }, flush: true, bias: 0.2 });
  for (const [px, py] of [[9.6, 26.0], [16.2, 28.6], [22.6, 26.6]] as [number, number][]) parts.push({ s: poly([px - 1.6, py], [px, py - 1.5], [px + 1.6, py], [px, py + 1.2]), m: R.moss, sh: { k: 'flat' }, flush: true, bias: 0.45 });
  return parts;
}

/**
 * THE LONG ODDS (helm, the pool: you hit elites and bosses much harder, and everything else softer). A plain steel helmet, and
 * for a crest a great bone die, sixes up.
 */
function longodds(): Part[] {
  const helm: Part[] = [];
  helm.push({ s: poly([8.0, 13.0], [9.4, 8.0], [12.8, 5.0], [17.0, 4.0], [21.4, 5.4], [24.4, 9.2], [25.4, 14.6], [26.4, 22.6], [25.0, 26.8], [21.0, 27.6], [12.6, 28.2], [9.2, 27.0], [7.8, 21.0]), m: 'steel', sh: { k: 'soft', r: 4.5 }, shine: true, marks: [{ a: [13.0, 5.0], b: [11.0, 12.0], t: 4 }, { a: [8.4, 24.4], t: 3 }, { a: [24.6, 12.4], t: 1 }] });
  helm.push({ s: poly([8.2, 13.4], [22.0, 13.2], [21.8, 15.6], [16.2, 15.8], [16.2, 23.4], [13.6, 23.4], [13.6, 15.8], [8.4, 15.8]), m: 'shadow', sh: { k: 'flat' } });
  helm.push({ s: path([[8.4, 12.2], [15.2, 11.8], [22.6, 12.0]], [0.8, 0.8, 0.8]), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true });
  for (const p of [[10.6, 19.6], [19.6, 19.6], [21.2, 24.0], [10.8, 24.6]] as V[]) helm.push(stud(p, 0.8, 'gold'));
  const parts = move(squeeze(helm, 0.92, 0.72), 0, 5.0);
  // the die: a face of six toward you, its top lit
  const d: V[] = [[10.6, 4.4], [19.6, 2.6], [21.6, 11.2], [12.6, 13.0]];
  parts.push({ s: poly([10.6, 4.4], [13.0, 1.8], [21.6, 0.9], [19.6, 2.6]), m: 'ivory', sh: { k: 'flat' }, shine: true, bias: 0.5 });
  parts.push({ s: poly(...d), m: 'ivory', sh: { k: 'flat', bev: 0.8 }, shine: true, bias: 0.05 });
  for (const u of [0.28, 0.72]) for (const v of [0.2, 0.5, 0.8]) {
    const top = lerp(d[0], d[1], u), bot = lerp(d[3], d[2], u);
    parts.push({ s: ell(lerp(top, bot, v), 0.85), m: 'shadow', sh: { k: 'flat' }, flush: true });
  }
  return parts;
}

// ---------------------------------------------------------------------------------------------
// THE FOUR FOR THE BODY. Each hung up and seen from the front, as the game's armour and robe are.

/**
 * POLYGLOT'S MANTLE (chest, the pool: every attack can take two damage words on a side). A mantle sewn of five cloths, a colour
 * for each tongue: fire's orange, frost's blue, lightning's yellow, poison's green, volatile's violet.
 */
function polyglotsmantle(): Part[] {
  const parts: Part[] = [];
  const panel = (p: V[], m: Part['m'], bias: number): void => { parts.push({ s: poly(...p), m, sh: { k: 'soft', r: 3 }, bias }); };
  panel([[10.6, 4.6], [12.8, 5.8], [8.6, 29.0], [7.4, 29.6], [2.4, 27.6], [3.0, 17.6], [6.4, 8.6]], 'amber', -0.1);
  panel([[12.8, 5.8], [14.9, 6.8], [13.4, 28.6], [11.8, 27.8], [8.6, 29.0]], 'blue', 0.1);
  panel([[14.9, 6.8], [16, 7.0], [17.1, 6.8], [18.6, 28.6], [16, 30.2], [13.4, 28.6]], 'topaz', -0.1);
  panel([[17.1, 6.8], [19.2, 5.8], [23.4, 29.0], [20.2, 27.8], [18.6, 28.6]], 'green', 0.15);
  panel([[19.2, 5.8], [21.4, 4.6], [25.6, 8.6], [29.0, 17.6], [29.6, 27.6], [24.6, 29.6], [23.4, 29.0]], 'violet', -0.05);
  // its collar and clasp
  parts.push({ s: poly([10.0, 3.2], [16, 6.2], [22.0, 3.2], [22.8, 5.0], [16, 8.8], [9.2, 5.0]), m: 'gold', sh: { k: 'flat', bev: 1 }, shine: true });
  parts.push(gem([16, 7.6], 1.5, 'amber'));
  return parts;
}

/**
 * THE PHYSICIAN'S COAT (chest, from the Physician: flasks refill from the hits you land on elites and bosses, not from kills).
 * His long black waxed coat with its short cape, and across it his strap of vials.
 */
function physicianscoat(): Part[] {
  const parts: Part[] = [];
  const hem: V[] = [[27.6, 30.4], [16, 30.8], [4.4, 30.4]];
  parts.push({ s: poly([11.2, 3.0], [16, 6.4], [20.8, 3.0], [23.4, 4.8], [23.0, 14.0], [24.6, 22.0], ...hem, [7.4, 22.0], [9.0, 14.0], [8.6, 4.8]), m: R.wax, sh: { k: 'soft', r: 4 }, bias: 0.2, shine: true, marks: [{ a: [11.4, 18], b: [9.6, 28.6], t: 1 }, { a: [20.8, 18], b: [22.6, 28.6], t: 1 }, { a: [16, 13.0], b: [16, 30.0], t: 0 }] });
  for (const sx of [-1, 1]) {
    const x = (v: number): number => 16 + sx * v;
    parts.push({ s: poly([x(7.4), 4.4], [x(11.4), 8.6], [x(13.4), 17.4], [x(13.2), 22.6], [x(10.0), 23.0], [x(8.2), 15.0], [x(6.6), 9.6]), m: R.wax, sh: { k: 'soft', r: 2.5 }, shine: true, bias: (sx < 0 ? 0.25 : 0.15), marks: [{ a: [x(12.8), 21.8], b: [x(10.2), 22.2], t: 4 }] });
  }
  // brass buttons down its front
  for (const y of [15.6, 19.6, 23.6]) parts.push(stud([17.4, y], 0.75, 'brass'));
  // the short cape over the shoulders
  parts.push({ s: poly([5.6, 4.6], [11.4, 2.6], [16, 6.0], [20.6, 2.6], [26.4, 4.6], [28.0, 11.4], [22.0, 10.2], [16, 12.6], [10.0, 10.2], [4.0, 11.4]), m: R.wax, sh: { k: 'soft', r: 2.6 }, shine: true, bias: 0.36, marks: [{ a: [6.4, 6.0], b: [5.4, 10.0], t: 4 }] });
  // the strap, and three vials in it: red, green, blue
  parts.push({ s: poly([8.6, 12.0], [10.6, 10.8], [24.4, 22.4], [23.0, 24.2]), m: 'leather', sh: { k: 'flat', bev: 0.8 }, bias: 0.1 });
  for (const [px, py, m] of [[12.6, 15.2, 'ruby'], [16.4, 18.4, 'green'], [20.2, 21.6, 'sapphire']] as [number, number, Part['m']][]) {
    parts.push({ s: cap([px + 1.0, py - 1.6], [px - 0.9, py + 1.5], 1.25), m, sh: { k: 'cyl', a: [px + 1.0, py - 1.6], b: [px - 0.9, py + 1.5], w: 1.25 }, shine: true, bias: 0.2 });
    parts.push({ s: ell([px + 1.2, py - 2.0], 0.9), m: 'wood', sh: { k: 'flat' }, flush: true, bias: 0.3 });
  }
  return parts;
}

/**
 * THE MOTH'S WING (chest, from the Moth: you take much less damage from every hit; each hit darkens one of your words). A cloak
 * cut from the grey moth's wings, their rings still on it, its dust on the collar's fur.
 */
function mothswing(): Part[] {
  const parts: Part[] = [];
  // the two wings a side, the upper over the lower, a notch between them
  parts.push({
    s: poly([16, 6.0], [11.6, 3.6], [6.6, 4.4], [2.6, 8.6], [1.8, 14.0], [4.6, 17.6], [3.0, 21.6], [5.4, 26.0], [9.0, 27.6], [11.4, 25.2], [13.6, 29.6], [16, 27.2], [18.4, 29.6], [20.6, 25.2], [23.0, 27.6], [26.6, 26.0], [29.0, 21.6], [27.4, 17.6], [30.2, 14.0], [29.4, 8.6], [25.4, 4.4], [20.4, 3.6]),
    m: R.moth, sh: { k: 'soft', r: 3.6 }, bias: 0.06,
    marks: [
      { a: [4.6, 17.6], b: [10.0, 18.6], t: 1 }, { a: [10.0, 18.6], b: [14.6, 16.6], t: 1 }, { a: [27.4, 17.6], b: [22.0, 18.6], t: 1 }, { a: [22.0, 18.6], b: [17.4, 16.6], t: 1 },
      { a: [5.0, 22.6], b: [8.6, 24.6], t: 1 }, { a: [8.6, 24.6], b: [11.4, 22.6], t: 1 }, { a: [27.0, 22.6], b: [23.4, 24.6], t: 1 }, { a: [23.4, 24.6], b: [20.6, 22.6], t: 1 },
      { a: [13.6, 7.6], b: [4.6, 8.6], t: 4 }, { a: [14.0, 10.0], b: [3.6, 13.0], t: 3 }, { a: [18.0, 10.0], b: [28.4, 13.0], t: 1 },
    ],
  });
  // where it falls open down the front
  parts.push({ s: poly([15.0, 9.6], [17.0, 9.6], [17.8, 26.6], [16, 27.6], [14.2, 26.6]), m: 'shadow', sh: { k: 'flat' }, flush: true });
  // the rings on the wings: dark round pale, a big one on each upper wing and a small one on each lower
  for (const sx of [-1, 1]) {
    for (const [dx, y, r] of [[7.8, 12.4, 3.1], [6.6, 21.6, 1.9]] as [number, number, number][]) {
      const c: V = [16 + sx * dx, y];
      parts.push({ s: ell(c, r, r), m: R.horn, sh: { k: 'flat' }, flush: true, bias: -0.3 });
      parts.push({ s: ell(c, r - 1.1, r - 1.1), m: 'ivory', sh: { k: 'flat' }, flush: true, bias: 0.2 });
    }
  }
  // the collar: pale fur
  parts.push({ s: poly([9.4, 6.6], [10.6, 3.4], [12.8, 4.4], [14.4, 2.6], [16, 4.2], [17.6, 2.6], [19.2, 4.4], [21.4, 3.4], [22.6, 6.6], [20.4, 9.0], [18.2, 8.0], [16, 9.6], [13.8, 8.0], [11.6, 9.0]), m: 'feather', sh: { k: 'soft', r: 1.8 }, marks: [{ a: [12.6, 5.6], b: [12.8, 7.4], t: 1 }, { a: [16, 5.6], b: [16, 8.2], t: 1 }, { a: [19.4, 5.6], b: [19.2, 7.4], t: 1 }] });
  return parts;
}

/**
 * THE NETTLE SHIRT (chest, from the Princess: her Vow; while you go unhit your words grow stronger). A shirt woven of green
 * nettle stems, leaves still on it, and one sleeve never finished.
 */
function nettleshirt(): Part[] {
  const parts: Part[] = [];
  const weave: Mark[] = [];
  for (let k = 0; k < 6; k++) {
    weave.push({ a: [9.6 + k * 2.4, 9.0], b: [11.6 + k * 2.4, 28.6], t: 1 });
    weave.push({ a: [9.0, 10.6 + k * 3.4], b: [23.4, 9.4 + k * 3.4], t: 1 });
  }
  // the sleeve that was finished, and the one that was not: a stub, its stems loose
  parts.push({ s: poly([10.4, 5.6], [8.4, 12.8], [9.0, 20.6], [5.6, 22.0], [2.6, 20.0], [3.4, 12.0], [6.2, 7.0]), m: R.nettle, sh: { k: 'soft', r: 2.4 }, bias: 0.05, marks: [{ a: [4.4, 13.0], b: [7.6, 20.6], t: 1 }, { a: [7.4, 9.0], b: [4.0, 18.6], t: 1 }] });
  parts.push({ s: path([[26.0, 10.0], [28.6, 13.0], [28.2, 16.6]], [0.8, 0.7, 0.4]), m: R.nettle, sh: { k: 'flat' }, bias: 0.2 });
  parts.push({ s: path([[25.0, 11.6], [26.0, 15.6]], [0.7, 0.4]), m: R.nettle, sh: { k: 'flat' }, bias: 0.0 });
  parts.push({ s: poly([21.6, 5.6], [25.4, 7.2], [27.2, 10.2], [25.6, 12.4], [23.4, 12.6]), m: R.nettle, sh: { k: 'soft', r: 1.6 }, bias: -0.05 });
  // the body
  parts.push({ s: poly([10.4, 5.6], [13.4, 4.0], [16, 6.8], [18.6, 4.0], [21.6, 5.6], [23.6, 12.6], [23.0, 20.6], [24.4, 29.4], [16, 30.4], [7.6, 29.4], [9.0, 20.6], [8.4, 12.6]), m: R.nettle, sh: { k: 'soft', r: 3.6 }, bias: 0.1, marks: weave });
  // its neck, bound round
  parts.push({ s: poly([12.8, 3.6], [16, 6.6], [19.2, 3.6], [20.4, 5.0], [16, 9.0], [11.6, 5.0]), m: R.nettle, sh: { k: 'flat', bev: 0.8 }, bias: -0.35 });
  // nettle leaves, toothed, here and there on it
  const leaf = (c: V, deg: number, k: number): void => {
    const a = (deg * Math.PI) / 180;
    const f = (x: number, y: number): V => [c[0] + k * (x * Math.cos(a) - y * Math.sin(a)), c[1] + k * (x * Math.sin(a) + y * Math.cos(a))];
    parts.push({ s: poly(f(-2.6, 0), f(-1.4, -1.3), f(-0.4, -0.7), f(0.6, -1.4), f(2.8, 0), f(0.6, 1.4), f(-0.4, 0.7), f(-1.4, 1.3)), m: R.nettle, sh: { k: 'flat', bev: 0.6 }, bias: 0.55, flush: true, marks: [{ a: f(-2.0, 0), b: f(2.0, 0), t: 1 }] });
  };
  leaf([12.4, 13.6], 30, 1.0);
  leaf([20.0, 18.4], -35, 1.0);
  leaf([12.0, 25.0], -20, 1.0);
  leaf([20.6, 26.6], 25, 0.9);
  leaf([5.6, 15.0], 70, 0.85);
  return parts;
}

// ---------------------------------------------------------------------------------------------
// THE EIGHTEEN WEAPONS, three for each hero's own. Each lies as the game's does: on the diagonal, its grip at the bottom left.

/** The same parts with some materials changed for others (a base's wood for another wood). */
function dye(parts: readonly Part[], to: Partial<Record<string, Part['m']>>): Part[] {
  return parts.map((pt) => (typeof pt.m === 'string' && to[pt.m] !== undefined ? { ...pt, m: to[pt.m]! } : pt));
}

// ---- the Warrior's greatswords ----
const GS_G: V = [11.4, 20.6];
const GS_T: V = [29.4, 2.6];
/** The game's greatsword blade, grip and pommel in the materials given (no guard: the unique's own). */
function greatBlade(o: { blade: Part['m']; grip: Part['m']; pommel: Part['m']; w?: number; line?: number | string }): Part[] {
  const G = GS_G, T = GS_T;
  const L = len(sub(T, G));
  const w = o.w ?? 4.3;
  const b0 = at(G, UP, 0.8, 0), tn = at(G, UP, L - 5.8, 0);
  const pc = at(G, UP, -10.4, 0);
  return [
    { s: poly(at(b0, UP, 0, -w + 0.4), at(b0, UP, 2.2, -w), at(tn, UP, 0, -w), T, at(tn, UP, 0, w), at(b0, UP, 2.2, w), at(b0, UP, 0, w - 0.4)), m: o.blade, sh: { k: 'ridge', a: G, b: T, tilt: 0.38 }, shine: true, marks: [{ a: at(b0, UP, 3, -0.6), b: at(tn, UP, -2, -0.6), t: o.line ?? 1 }, { a: at(tn, UP, 2, -2), t: 4 }] },
    { s: cap(at(G, UP, -0.6, 0), at(G, UP, -8.6, 0), 1.55), m: o.grip, sh: { k: 'cyl', a: G, b: at(G, UP, -8, 0), w: 1.55 }, bias: 0.16, marks: [2.2, 4.4, 6.6].map((d) => ({ a: at(G, UP, -d, -1.7), b: at(G, UP, -d - 1, 1.7), t: 1 })) },
    { s: poly(at(pc, UP, 2, 0), at(pc, UP, 0.6, -2.3), at(pc, UP, -1.6, -1.4), at(pc, UP, -2.2, 0), at(pc, UP, -1.6, 1.4), at(pc, UP, 0.6, 2.3)), m: o.pommel, sh: { k: 'dome', c: pc, r: 2.4 }, shine: true },
  ];
}

/**
 * THE MILLSTONE (greatsword, the Warrior's: Whirlwind has no time limit; you spin for as long as you hold). A heavy plain blade
 * with a millstone for its guard: a wheel of grey stone, grooved, the blade through its eye.
 */
function millstone(): Part[] {
  const parts = greatBlade({ blade: 'steel', grip: 'leather', pommel: 'steel', w: 4.5 });
  const c = at(GS_G, UP, 1.2, 0);
  const grooves: Mark[] = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.3; grooves.push({ a: [c[0] + Math.cos(a) * 2.6, c[1] + Math.sin(a) * 2.6], b: [c[0] + Math.cos(a + 0.35) * 5.6, c[1] + Math.sin(a + 0.35) * 5.6], t: 1 }); }
  parts.push({ s: ell(c, 6.6), m: R.stone, sh: { k: 'flat', bev: 1.8 }, shine: true, bias: 0.12, marks: grooves });
  parts.push({ s: poly(at(c, UP, -1.6, -1.6), at(c, UP, 1.6, -1.6), at(c, UP, 1.6, 1.6), at(c, UP, -1.6, 1.6)), m: 'dsteel', sh: { k: 'flat', bev: 0.6 }, shine: true, flush: true });
  return parts;
}

/**
 * THE WINDCUTTER (greatsword, the Warrior's: the third Strike in a row sends a blade of wind on ahead). A long curved blade, pale
 * as glass, three slots cut through it for the wind, a winged gilt guard, and white streamers from its pommel.
 */
function windcutter(): Part[] {
  const parts: Part[] = [];
  const G: V = [10.8, 21.2];
  // the streamers, behind
  parts.push({ s: path([[5.2, 26.8], [2.8, 23.6], [2.4, 19.4]], [1.0, 0.9, 0.5]), m: 'feather', sh: { k: 'soft', r: 1 } });
  parts.push({ s: path([[5.2, 26.8], [5.6, 29.6], [9.0, 30.4]], [1.0, 0.9, 0.5]), m: 'feather', sh: { k: 'soft', r: 1 }, bias: -0.15 });
  // the blade: curved, its back to the lower right, slotted
  const spine: V[] = [[11.6, 20.4], [16.0, 14.8], [21.0, 9.6], [26.0, 5.6], [30.0, 2.4]];
  const slots = [0.3, 0.5, 0.68].map((t) => { const i = Math.floor(t * 4), f = t * 4 - i; const p = lerp(spine[i], spine[i + 1], f); return ell(p, 1.5, 0.75, -45); });
  parts.push({ s: path(spine, [2.6, 3.3, 3.2, 2.3, 0.4]), cut: slots, m: R.glass, sh: { k: 'ridge', a: spine[0], b: spine[4], tilt: 0.4 }, shine: true, marks: [{ a: [13.4, 16.0], b: [19.2, 9.4], t: '#8af6f0' }, { a: [19.2, 9.4], b: [25.4, 4.4], t: '#8af6f0' }] });
  // the grip, the pommel, and the guard: two gilt wings
  parts.push({ s: cap(at(G, UP, -0.6, 0), at(G, UP, -7.6, 0), 1.5), m: 'blue', sh: { k: 'cyl', a: G, b: at(G, UP, -7.6, 0), w: 1.5 }, bias: 0.16, marks: [2.2, 4.4].map((d) => ({ a: at(G, UP, -d, -1.7), b: at(G, UP, -d - 1, 1.7), t: 1 })) });
  parts.push({ s: ell(at(G, UP, -8.8, 0), 2.0), m: 'gold', sh: { k: 'dome', c: at(G, UP, -8.8, 0), r: 2 }, shine: true });
  for (const sg of [-1, 1]) parts.push({ s: poly(at(G, UP, -0.8, 0), at(G, UP, 0.2, sg * 3.0), at(G, UP, 2.6, sg * 7.8), at(G, UP, 0.4, sg * 6.4), at(G, UP, 1.0, sg * 4.4), at(G, UP, -1.2, sg * 2.6)), m: 'gold', sh: { k: 'soft', r: 1.2 }, shine: true });
  parts.push(gem(G, 1.4, 'core'));
  return parts;
}

/**
 * THE UNDERTOW (greatsword, the Warrior's: adds Pulling in front of the hold attack; Whirlwind drags in what it cuts). A blade
 * the colour of deep water, and for a guard an anchor's arms, their flukes turned up the blade; a ring for a pommel.
 */
function undertow(): Part[] {
  const G = GS_G;
  const parts = greatBlade({ blade: R.sea, grip: 'dleather', pommel: 'dsteel', line: 4 });
  // the pommel is an anchor's ring
  const pc = at(G, UP, -10.6, 0);
  parts[2] = { s: ell(pc, 2.7), cut: [ell(pc, 1.2)], m: 'dsteel', sh: { k: 'soft', r: 1 }, shine: true, bias: 0.25 };
  // the anchor's arms and their flukes
  parts.push({ s: path([at(G, UP, 4.4, -8.6), at(G, UP, 1.6, -7.4), at(G, UP, -0.4, -3.6), at(G, UP, -0.8, 0), at(G, UP, -0.4, 3.6), at(G, UP, 1.6, 7.4), at(G, UP, 4.4, 8.6)], [0.8, 1.4, 1.8, 2.0, 1.8, 1.4, 0.8]), m: 'dsteel', sh: { k: 'soft', r: 1.4 }, shine: true, bias: 0.25 });
  for (const sg of [-1, 1]) parts.push({ s: poly(at(G, UP, 6.4, sg * 8.2), at(G, UP, 3.2, sg * 10.6), at(G, UP, 2.6, sg * 6.6)), m: 'dsteel', sh: { k: 'flat', bev: 0.6 }, shine: true, bias: 0.35 });
  parts.push(gem(at(G, UP, -0.6, 0), 1.5, 'violet'));
  return parts;
}

// ---- the Ranger's bows ----
const BOW_D: V = UP;
const BOW_N: V = unit([-1, -1]);
const BOW_M: V = [16.2, 16.2]; // the middle of the string
const BOW_GRIP: V = [11.6, 11.6];

/**
 * THE RAINWALKER (bow, the Ranger's: Volley rains around you and moves with you). A bow of storm-grey wood strung with silver,
 * a rain cloud caught on its upper tip, and the rain coming down from it.
 */
function rainwalker(): Part[] {
  const parts = dye(PAINTERS.bow(0), { wood: R.storm, leather: 'steel', ivory: 'steel' });
  // the rain: three falls of it under the cloud
  for (const [a, b] of [[[22.8, 8.4], [21.6, 13.2]], [[25.6, 8.8], [24.6, 14.4]], [[28.2, 8.0], [27.4, 12.4]]] as [V, V][]) parts.push({ s: cap(a, b, 0.6), m: 'sapphire', sh: { k: 'flat' }, shine: true, bias: 0.3 });
  // the cloud
  for (const [c, r] of [[[23.4, 6.6], 2.5], [[26.4, 5.4], 2.9], [[29.0, 7.0], 2.0]] as [V, number][]) parts.push({ s: ell(c, r, r * 0.86), m: 'feather', sh: { k: 'dome', c: [c[0] - 0.4, c[1] - 0.6], r: r + 0.4 }, flush: true, bias: -0.08 });
  return parts;
}

/**
 * THE FAN (bow, the Ranger's: each Shot looses three arrows in a fan). A bow with three arrows on its string at once, spread:
 * three steel heads, three red flights.
 */
function fan(): Part[] {
  const parts = dye(PAINTERS.bow(0), { leather: 'green' });
  const base = Math.atan2(BOW_N[1], BOW_N[0]);
  for (const da of [-0.5, 0.5, 0]) {
    const u: V = [Math.cos(base + da), Math.sin(base + da)];
    const nock = at(BOW_M, u, -4.4, 0), tip = at(BOW_M, u, 12.2, 0);
    parts.push({ s: cap(nock, tip, 0.65), m: 'ivory', sh: { k: 'flat' }, bias: 0.2 });
    parts.push({ s: poly(at(nock, u, 0.2, -0.4), at(nock, u, -1.4, -2.1), at(nock, u, 3.0, -2.1), at(nock, u, 4.4, 0), at(nock, u, 3.0, 2.1), at(nock, u, -1.4, 2.1), at(nock, u, 0.2, 0.4)), m: 'red', sh: { k: 'ridge', a: nock, b: tip, tilt: 0.3 }, bias: 0.2 });
    parts.push({ s: poly(at(tip, u, 2.4, 0), at(tip, u, -2.2, -2.4), at(tip, u, -1.0, 0), at(tip, u, -2.2, 2.4)), m: 'steel', sh: { k: 'ridge', a: nock, b: tip, tilt: 0.4 }, shine: true, bias: 0.15 });
  }
  return parts;
}

/**
 * THE POACHER'S BOW (bow, the Ranger's: where a Volley falls, it leaves one of your traps). A rough, hard-used bow bound in rag, a
 * trap's steel teeth set along its belly, and a wire snare hung from its tip.
 */
function poachersbow(): Part[] {
  const parts = dye(PAINTERS.bow(0), { wood: 'leather', leather: R.rag, ivory: 'brass' });
  // the snare: a wire loop on a short line from the upper tip
  parts.push({ s: cap([25.6, 7.6], [26.4, 11.0], 0.5), m: R.rope, sh: { k: 'flat' } });
  parts.push({ s: ell([26.8, 14.2], 2.7, 3.5), cut: [ell([26.8, 14.2], 1.6, 2.4)], m: R.rope, sh: { k: 'flat' }, bias: 0.2 });
  // the trap's teeth along the belly, either side of the grip
  const g = BOW_GRIP;
  for (const sv of [-7.4, -5.0, -2.6, 2.6, 5.0, 7.4]) {
    const h = 9.6 * (1 - (sv / 14.2) ** 2) - 9.6;
    const o = add(at(g, BOW_D, sv, 0), mul(BOW_N, h + 1.6));
    parts.push({ s: poly(at(o, BOW_D, -1.3, 0), add(o, mul(BOW_N, 3.0)), at(o, BOW_D, 1.3, 0)), m: 'steel', sh: { k: 'flat', bev: 0.6 }, shine: true, bias: 0.2 });
  }
  return parts;
}

// ---- the Mage's staffs ----
const SHAFT: readonly V[] = [[3.4, 29.4], [7.4, 25.8], [10.4, 22.2], [14.2, 18.8], [17.2, 15.2], [19.6, 13.0]];
const shaft = (m: Part['m']): Part => ({ s: path(SHAFT, [1.7, 1.9, 1.8, 2.0, 1.9, 2.1]), m, sh: { k: 'soft', r: 1.5 }, marks: [{ a: [9, 24.2], t: 0 }, { a: [15.4, 17.8], t: 0 }, { a: [6.2, 27.4], b: [8.2, 25.6], t: 3 }] });

/**
 * THE SHEPHERD'S CROOK (staff, the Mage's: the Orb follows you instead of staying where you set it). A shepherd's crook, the
 * Mage's violet orb kept in the bend of it, a small brass bell on its tip.
 */
function shepherdscrook(): Part[] {
  const parts: Part[] = [shaft('wood')];
  parts.push({ s: path([[19.6, 13.0], [21.2, 8.0], [24.4, 4.6], [27.8, 5.6], [28.8, 9.4], [26.8, 12.4], [24.4, 12.0]], [2.1, 1.9, 1.8, 1.7, 1.5, 1.2, 0.9]), m: 'wood', sh: { k: 'soft', r: 1.5 }, marks: [{ a: [22.4, 6.4], b: [24.6, 4.6], t: 3 }] });
  parts.push({ s: ell([24.6, 8.6], 2.6), m: 'violet', sh: { k: 'dome', c: [24.2, 8.2], r: 2.6 }, shine: true });
  parts.push({ s: cap([17.4, 15.4], [19.8, 12.8], 2.1), m: 'gold', sh: { k: 'cyl', a: [17.4, 15.4], b: [19.8, 12.8], w: 2.1 }, shine: true });
  parts.push({ s: cap([4.0, 28.8], [5.6, 27.2], 1.85), m: 'steel', sh: { k: 'cyl', a: [4, 28.8], b: [5.6, 27.2], w: 1.85 }, shine: true });
  // the bell
  parts.push({ s: poly([22.4, 13.2], [25.2, 12.8], [26.2, 16.4], [21.8, 17.0]), m: 'brass', sh: { k: 'soft', r: 1.2 }, shine: true });
  parts.push({ s: ell([24.0, 17.4], 0.9), m: 'dsteel', sh: { k: 'flat' }, shine: true });
  return parts;
}

/**
 * THE TIDE (staff, the Mage's: the Wave comes back; it flies out, turns, and passes through everything again). A staff of pale
 * driftwood bound with line, its head a wave of sea-glass curling over on itself, foam at its lip.
 */
function tide(): Part[] {
  const parts: Part[] = [shaft(R.drift)];
  const curl: V[] = [[19.6, 13.0], [19.8, 8.2], [22.8, 4.6], [26.8, 4.4], [28.8, 7.6], [27.4, 10.6], [24.8, 10.2]];
  parts.push({ s: path(curl, [2.5, 2.8, 2.7, 2.4, 1.9, 1.3, 0.8]), m: R.sea, sh: { k: 'soft', r: 1.8 }, shine: true, bias: 0.1, marks: [{ a: [19.6, 9.0], b: [21.8, 4.8], t: 4 }, { a: [21.8, 4.8], b: [26.0, 3.2], t: 4 }] });
  // foam at the wave's lip, and spray thrown off it
  parts.push({ s: ell([24.6, 10.2], 1.6, 1.4), m: 'feather', sh: { k: 'dome', c: [24.4, 10.0], r: 1.6 }, flush: true });
  parts.push({ s: ell([22.8, 12.2], 1.0), m: 'feather', sh: { k: 'flat' }, bias: 0.2 });
  // the line bound round its neck and its foot
  parts.push({ s: cap([17.4, 15.4], [19.8, 12.8], 2.1), m: R.rope, sh: { k: 'cyl', a: [17.4, 15.4], b: [19.8, 12.8], w: 2.1 }, marks: [{ a: [17.0, 14.0], b: [19.4, 16.0], t: 1 }, { a: [18.4, 12.6], b: [20.8, 14.6], t: 1 }] });
  parts.push({ s: cap([6.4, 26.8], [8.0, 25.2], 1.9), m: R.rope, sh: { k: 'cyl', a: [6.4, 26.8], b: [8.0, 25.2], w: 1.9 }, marks: [{ a: [6.0, 25.6], b: [8.4, 27.4], t: 1 }] });
  return parts;
}

/**
 * THE TUNING STAFF (staff, the Mage's: a Wave that passes through your Orb makes it pulse at once, twice as hard). A black staff
 * banded in gold that ends in a steel tuning fork, a small violet orb set where its two tines meet.
 */
function tuningstaff(): Part[] {
  const parts: Part[] = [shaft('ebony')];
  const B: V = [20.4, 12.2];
  for (const sg of [-1, 1]) parts.push({ s: cap(at(B, UP, 0.4, sg * 2.7), at(B, UP, 10.2, sg * 2.7), 1.2), m: 'steel', sh: { k: 'cyl', a: at(B, UP, 0, sg * 2.7), b: at(B, UP, 10, sg * 2.7), w: 1.2 }, shine: true });
  parts.push({ s: path([at(B, UP, 0.6, -2.7), at(B, UP, -1.4, 0), at(B, UP, 0.6, 2.7)], [1.2, 1.5, 1.2]), m: 'steel', sh: { k: 'soft', r: 1.2 }, shine: true });
  for (const p of [[8.6, 24.4], [13.2, 19.8]] as V[]) parts.push({ s: cap([p[0] - 0.9, p[1] + 0.9], [p[0] + 0.9, p[1] - 0.9], 2.0), m: 'gold', sh: { k: 'cyl', a: [p[0] - 0.9, p[1] + 0.9], b: [p[0] + 0.9, p[1] - 0.9], w: 2 }, shine: true });
  parts.push({ s: ell(at(B, UP, -2.2, 0), 2.4), m: 'gold', sh: { k: 'dome', c: at(B, UP, -2.2, 0), r: 2.4 }, shine: true });
  parts.push(gem(at(B, UP, -2.2, 0), 1.6, 'violet'));
  return parts;
}

// ---- the Warlock's tomes ----

/** A book standing, on the square (the tome's own boards, pages, spine, corners and clasps: art/items_a.ts tomeParts, without its demon): squeeze it to a book's shape after. */
function book(cover: Part['m'], iron: Part['m'], o: { fire?: boolean; bias?: number } = {}): Part[] {
  const parts: Part[] = [];
  const b = o.bias ?? 0;
  parts.push({ s: poly([8.4, 4.4], [27.4, 4.0], [27.8, 28.8], [9.0, 29.6]), m: cover, sh: { k: 'flat', bev: 1 }, bias: -0.3 + b });
  const edge: Mark[] = [];
  if (o.fire) {
    for (let y = 5.2; y < 27.6; y += 1.4) edge.push({ a: [26.6, y], t: '#ff8a2c' }, { a: [26.6, y + 0.7], t: '#d8401a' });
    for (let x = 9.8; x < 26; x += 1.4) edge.push({ a: [x, 28.2], t: '#ff8a2c' }, { a: [x + 0.7, 28.2], t: '#d8401a' });
  }
  parts.push({ s: poly([8.6, 3.6], [26.8, 3.4], [27.0, 28.4], [9.0, 28.8]), m: 'linen', sh: { k: 'flat', bev: 0.6 }, bias: -0.1, marks: [{ a: [25.4, 4.6], b: [25.6, 27.0], t: 1 }, { a: [10.4, 27.6], b: [25.2, 27.4], t: 1 }, ...edge] });
  parts.push({ s: poly([4.6, 2.6], [24.8, 2.2], [25.2, 26.4], [5.0, 27.4]), m: cover, sh: { k: 'soft', r: 2.2 }, bias: b, marks: [{ a: [8.4, 4.8], b: [22.6, 4.4], t: 0 }, { a: [22.8, 4.6], b: [23.0, 24.4], t: 0 }, { a: [8.6, 25.0], b: [22.8, 24.6], t: 0 }] });
  parts.push({ s: cap([5.4, 3.4], [5.8, 26.6], 1.9), m: cover, sh: { k: 'cyl', a: [5.4, 3], b: [5.8, 27], w: 1.9 }, bias: 0.05 + b, marks: [{ a: [4.4, 8.0], b: [7.2, 8.0], t: 0 }, { a: [4.4, 21.2], b: [7.4, 21.2], t: 0 }] });
  for (const [c, sx, sy] of [[[24.8, 2.2], -1, 1], [[25.2, 26.4], -1, -1]] as [V, number, number][]) parts.push({ s: poly(c, [c[0] + sx * 4.2, c[1]], [c[0], c[1] + sy * 4.2]), m: iron, sh: { k: 'flat', bev: 0.8 }, shine: true });
  return parts;
}

/**
 * THE LEDGER OF DEBTS (tome, the Warlock's: the Hellfire Bolt hits harder for every cursed enemy near you). An account book in
 * green cloth, red hide and brass, the tally of what is owed cut into the plate on its cover, a red ribbon keeping the place.
 */
function ledgerofdebts(): Part[] {
  const parts = book('green', 'brass', { bias: 0.05 });
  // (red hide down its spine)
  parts.push({ s: cap([5.4, 3.4], [5.8, 26.6], 2.4), m: 'bookred', sh: { k: 'cyl', a: [5.4, 3], b: [5.8, 27], w: 2.4 }, bias: 0.2, marks: [{ a: [3.8, 8.0], b: [7.8, 8.0], t: '#d0902c' }, { a: [3.8, 21.2], b: [8.0, 21.2], t: '#d0902c' }] });
  parts.push({ s: poly([17.0, 27.0], [19.4, 26.8], [20.2, 31.8], [18.8, 30.6], [17.6, 32.0]), m: 'red', sh: { k: 'flat', bev: 0.8 }, bias: -0.1 });
  // the plate, and the tally on it: four strokes and the one across them, twice
  const tally: Mark[] = [];
  for (const y0 of [8.6, 15.2]) {
    for (const x of [10.4, 12.6, 14.8, 17.0]) tally.push({ a: [x, y0], b: [x, y0 + 4.4], t: 0 });
    tally.push({ a: [9.4, y0 + 3.8], b: [18.2, y0 + 0.6], t: 0 });
  }
  parts.push({ s: poly([8.2, 6.6], [20.4, 6.4], [20.6, 21.6], [8.4, 21.8]), m: 'brass', sh: { k: 'flat', bev: 1 }, shine: true, bias: 0.1, marks: tally });
  for (const y of [7.4, 21.8]) {
    parts.push({ s: poly([21.6, y - 1.2], [27.8, y - 1.1], [28.4, y], [27.8, y + 1.1], [21.6, y + 1.2]), m: 'brass', sh: { k: 'flat', bev: 0.8 }, shine: true });
    parts.push(stud([26.0, y], 0.8, 'steel'));
  }
  return squeeze(parts, 0.7, 0.86, 12);
}

/**
 * THE RESTLESS TOME (tome, the Warlock's; his idea: it leaves his hand and swirls around him, and puts hellfire on any enemy it
 * touches). The book open and in the air, its red boards spread like wings, its leaves lifting, the demon's fire streaming off it.
 */
function restlesstome(): Part[] {
  const parts: Part[] = [];
  // the fire streaming off it, behind
  for (const [p, r] of [[[[5.4, 12.0], [3.6, 7.6], [5.6, 3.4]], [1.9, 1.5, 0.5]], [[[26.6, 12.0], [28.6, 7.4], [26.8, 3.0]], [1.9, 1.5, 0.5]], [[[10.6, 9.0], [10.0, 5.4], [11.8, 2.4]], [1.5, 1.1, 0.4]], [[[21.4, 9.0], [22.4, 5.0], [20.8, 2.2]], [1.5, 1.1, 0.4]]] as [V[], number[]][]) {
    parts.push({ s: path(p, r), m: 'fire', sh: { k: 'flat' }, shine: true, bias: 0.35 });
  }
  // its boards, spread
  parts.push({ s: poly([1.8, 14.2], [16, 9.6], [30.2, 14.2], [28.6, 29.4], [16, 26.6], [3.4, 29.4]), m: 'bookred', sh: { k: 'soft', r: 2 }, bias: 0.2 });
  // its two blocks of leaves, lines of writing on them, and the gutter between
  const lines = (x0: number, x1: number, sl: number): Mark[] => [13.6, 16.4, 19.2, 22.0].map((y) => ({ a: [x0, y + sl * 0] as V, b: [x1, y - sl * 2.6] as V, t: 1 }));
  parts.push({ s: poly([3.6, 13.6], [15.4, 10.0], [15.6, 25.0], [4.8, 27.6]), m: 'linen', sh: { k: 'soft', r: 1.6 }, bias: 0.1, marks: lines(5.6, 13.6, 1).map((m) => ({ ...m, a: [m.a[0], m.a[1] + 0.6] as V })) });
  parts.push({ s: poly([16.6, 10.0], [28.4, 13.6], [27.2, 27.6], [16.4, 25.0]), m: 'linen', sh: { k: 'soft', r: 1.6 }, bias: -0.08, marks: lines(18.4, 26.4, -1).map((m) => ({ a: [m.a[0], m.a[1] - 2.0] as V, b: [m.b![0], m.b![1] - 2.0] as V, t: 1 })) });
  // two leaves lifting off it
  parts.push({ s: poly([15.8, 10.4], [10.8, 5.6], [6.6, 7.4], [9.6, 10.6]), m: 'linen', sh: { k: 'flat', bev: 0.6 }, bias: 0.3 });
  parts.push({ s: poly([16.2, 10.4], [21.4, 5.2], [25.6, 7.2], [22.4, 10.4]), m: 'linen', sh: { k: 'flat', bev: 0.6 }, bias: 0.05 });
  // its ribbon, flying
  parts.push({ s: path([[16, 26.0], [17.6, 29.0], [21.0, 30.4]], [0.9, 0.8, 0.5]), m: 'gold', sh: { k: 'flat' }, shine: true });
  return squeeze(parts, 0.94, 0.94, -10);
}

/**
 * THE BURNING VERSE (tome, the Warlock's: a burn you cause on a cursed enemy never goes out). A book charred black, shut, and
 * through its cover three lines of a verse still burning; its leaves' edges alight.
 */
function burningverse(): Part[] {
  const parts = book(R.char, 'dsteel', { fire: true, bias: 0.3 });
  // the verse: three lines of it, in fire, the last one short
  for (const [y, x1] of [[8.6, 21.0], [13.4, 21.2], [18.2, 16.4]] as [number, number][]) {
    parts.push({ s: poly([8.8, y], [x1, y - 0.2], [x1, y + 2.0], [8.8, y + 2.2]), m: 'fire', sh: { k: 'flat' }, shine: true, flush: true, bias: 0.6, marks: [{ a: [10.2, y + 1.0], t: '#ffd49a' }, { a: [13.4, y + 1.0], t: '#ffd49a' }, { a: [16.0, y + 0.9], t: '#ffd49a' }] });
  }
  // fire out of the leaves' edge and off its head
  for (const [x, y, h] of [[27.6, 10.4, 3.4], [27.8, 17.4, 2.6], [27.6, 25.0, 3.0]] as [number, number, number][]) parts.push({ s: path([[x - 0.6, y + 1.2], [x + 0.8, y], [x + 1.2 + h * 0.3, y - h]], [0.9, 0.7, 0.3]), m: 'fire', sh: { k: 'flat' }, shine: true, bias: 0.3 });
  for (const [x, h] of [[12.0, 3.0], [17.0, 4.2], [22.0, 3.0]] as [number, number][]) parts.push({ s: path([[x, 3.4], [x + 0.6, 2.0], [x + 0.2, 3.4 - h]], [1.2, 0.9, 0.3]), m: 'fire', sh: { k: 'flat' }, shine: true, bias: 0.4 });
  return squeeze(parts, 0.7, 0.86, 12);
}

// ---- the Tinkerer's wrenches ----
const WR_G: V = [7.2, 24.8];
const WR_H: V = at(WR_G, UP, 19.6, 0);

/**
 * THE SECOND WHISTLE (wrench, the Tinkerer's: one more Golem than she would have). Her wrench, and tied to it on a red cord
 * two brass whistles where she carries one.
 */
function secondwhistle(): Part[] {
  const parts = dye(PAINTERS.wrench(1), { blue: 'red' });
  const whistle = (a: V, b: V, r: number): void => {
    const u = unit(sub(b, a));
    parts.push({ s: cap(a, b, r), m: 'gold', sh: { k: 'cyl', a, b, w: r }, shine: true, marks: [{ a: at(a, u, len(sub(b, a)) * 0.55, -r * 0.5), b: at(a, u, len(sub(b, a)) * 0.55, r * 0.5), t: 0 }] });
    parts.push({ s: poly(at(a, u, 0.2, -r * 0.7), at(a, u, -2.4, -r * 0.3), at(a, u, -2.4, r * 0.3), at(a, u, 0.2, r * 0.7)), m: 'gold', sh: { k: 'flat', bev: 0.6 }, shine: true, bias: -0.1 });
  };
  // the cord, from the shaft down to each
  parts.push({ s: path([[14.6, 18.6], [18.0, 22.4], [20.0, 24.2]], [0.55, 0.55, 0.55]), m: 'red', sh: { k: 'flat' } });
  parts.push({ s: path([[16.6, 16.6], [21.6, 18.0], [23.4, 18.6]], [0.55, 0.55, 0.55]), m: 'red', sh: { k: 'flat' } });
  whistle([21.6, 25.6], [26.4, 28.2], 1.9);
  whistle([24.8, 19.2], [29.0, 21.2], 1.6);
  return parts;
}

/**
 * THE STICKY WRENCH (wrench, the Tinkerer's: vials stick to what they hit and burst a moment later, twice as wide). Her wrench
 * with its jaw clotted in green paste, running down the shaft, and one of her vials stuck fast in it.
 */
function stickywrench(): Part[] {
  const parts = PAINTERS.wrench(0);
  const H = WR_H;
  // the paste: over the jaw, in runs down the shaft
  parts.push({
    s: poly(at(H, UP, -3.6, -4.4), at(H, UP, 0.6, -6.2), at(H, UP, 5.0, -5.0), at(H, UP, 6.4, -1.6), at(H, UP, 4.2, 0.6), at(H, UP, 5.6, 3.4), at(H, UP, 3.2, 5.4), at(H, UP, 0.4, 3.0), at(H, UP, -3.2, 3.6), at(H, UP, -7.6, 1.6), at(H, UP, -8.6, 0.2), at(H, UP, -5.4, -0.6), at(H, UP, -6.6, -2.6), at(H, UP, -9.6, -2.4), at(H, UP, -10.4, -3.4), at(H, UP, -6.4, -4.4)),
    m: R.slime, sh: { k: 'soft', r: 1.8 }, shine: true, bias: 0.12, marks: [{ a: at(H, UP, 1.0, -4.4), b: at(H, UP, 3.6, -3.6), t: 4 }],
  });
  parts.push({ s: ell(at(H, UP, -12.4, 1.4), 1.2, 1.5), m: R.slime, sh: { k: 'dome', c: at(H, UP, -12.4, 1.4), r: 1.3 }, shine: true });
  // the vial, stuck in it: glass, a cork
  const va = at(H, UP, 0.6, -1.4), vb = at(H, UP, 3.4, 2.0);
  parts.push({ s: cap(va, vb, 1.7), m: 'teal', sh: { k: 'cyl', a: va, b: vb, w: 1.7 }, shine: true, bias: 0.15 });
  parts.push({ s: ell(at(vb, unit(sub(vb, va)), 1.2, 0), 1.25), m: 'wood', sh: { k: 'flat' }, bias: 0.2 });
  return parts;
}

/**
 * THE FOREMAN'S WRENCH (wrench, the Tinkerer's: whenever you toss a vial, each of your Golems lobs one as well). The foreman's
 * own: its shaft striped yellow and black, a gear at its throat, and a brass star on its jaw.
 */
function foremanswrench(): Part[] {
  const parts = dye(PAINTERS.wrench(1), { blue: 'black' });
  const G = WR_G, H = WR_H;
  // the stripes down its shaft
  for (let i = 0; i < 5; i++) {
    const d0 = 4.0 + i * 2.1;
    parts.push({ s: poly(at(G, UP, d0, -2.0), at(G, UP, d0 + 1.9, -2.0), at(G, UP, d0 + 2.9, 2.0), at(G, UP, d0 + 1.0, 2.0)), m: i % 2 ? 'shadow' : 'topaz', sh: { k: 'flat' }, flush: true, bias: i % 2 ? 0.5 : 0.1 });
  }
  // the star on its jaw
  const c = at(H, UP, -1.4, 0);
  const star: V[] = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2; const rr = i % 2 ? 1.3 : 3.1; star.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); }
  parts.push({ s: poly(...star), m: 'gold', sh: { k: 'dome', c, r: 3.1 }, shine: true, flush: true });
  return parts;
}

// ---- the Brawler's wraps ----
/** The four knuckles of the game's wraps' front fist (art/items_a.ts wraps: the fist at 11.8, 15.6, 1.12 times, turned -6). */
const KNUCKLES: readonly V[] = [-4.8, -1.6, 1.6, 4.8].map((x) => {
  const rad = (-6 * Math.PI) / 180, k = 1.12, y = -3.4;
  return [11.8 + k * (x * Math.cos(rad) - y * Math.sin(rad)), 15.6 + k * (x * Math.sin(rad) + y * Math.cos(rad))] as V;
});

/**
 * THE LAST ROUND (wraps, the Brawler's: the third globe of every combo sets itself in fire without spending the jump). His
 * wraps scorched at the knuckles, and the front fist alight: the kick's own orange fire, with nothing spent to light it.
 */
function lastround(): Part[] {
  const parts = PAINTERS.wraps(0);
  // the knuckles, scorched
  for (const p of KNUCKLES) parts.push({ s: ell(p, 1.3), m: R.char, sh: { k: 'flat' }, flush: true, bias: 0.1 });
  // the fire, off the front fist's knuckles: orange, yellow at its heart
  parts.push({ s: poly([2.6, 12.4], [2.0, 7.6], [4.4, 9.4], [5.0, 4.0], [7.4, 7.8], [9.0, 1.6], [11.2, 6.8], [13.4, 2.4], [14.8, 7.4], [17.2, 3.6], [18.0, 8.2], [20.2, 6.4], [19.8, 11.2], [16.8, 9.8], [13.2, 10.4], [9.6, 10.8], [6.2, 11.4]), m: R.kick, sh: { k: 'flat' }, shine: true, bias: 0.3 });
  parts.push({ s: poly([5.2, 10.8], [6.0, 7.6], [7.8, 9.4], [9.2, 5.0], [11.0, 8.8], [13.2, 6.0], [14.6, 9.4], [16.8, 7.2], [17.6, 10.0], [13.2, 9.8], [9.4, 10.2]), m: 'topaz', sh: { k: 'flat' }, shine: true, flush: true, bias: 0.5 });
  return parts;
}

/**
 * THE FOURTH GLOBE (wraps, the Brawler's: his combos hold four globes, not three). His wraps with a globe set on every knuckle
 * of the front fist: a punch's green, a kick's orange, a jump's white, and a fourth.
 */
function fourthglobe(): Part[] {
  const parts = PAINTERS.wraps(0);
  const ms: Part['m'][] = [R.punch, R.kick, R.jump, R.punch];
  KNUCKLES.forEach((p, i) => {
    const c: V = [p[0], p[1] - 0.9];
    parts.push({ s: ell(c, 2.3), m: 'dsteel', sh: { k: 'flat' }, shine: true, bias: 0.3 });
    parts.push({ s: ell(c, 1.8), m: ms[i], sh: { k: 'dome', c: [c[0] - 0.3, c[1] - 0.3], r: 1.7 }, shine: true, flush: true, bias: 0.1 });
  });
  return parts;
}

/**
 * THE WINNING STREAK (wraps, the Brawler's: every combo he finishes makes his next blows hit harder, and it keeps building). A
 * champion's wraps: linen, gilt at the knuckles, and pinned to the wrist a winner's blue rosette, its ribbons hanging.
 */
function winningstreak(): Part[] {
  const parts = PAINTERS.wraps(2);
  // the rosette's two ribbons, then the rosette
  parts.push({ s: poly([9.6, 23.6], [12.2, 23.2], [12.6, 30.6], [11.0, 29.2], [9.4, 30.8]), m: 'blue', sh: { k: 'flat', bev: 0.8 }, bias: -0.05 });
  parts.push({ s: poly([12.6, 23.2], [15.2, 23.8], [16.6, 30.2], [14.6, 29.2], [13.4, 30.6]), m: 'blue', sh: { k: 'flat', bev: 0.8 }, bias: 0.12 });
  const c: V = [12.4, 22.4];
  const petals: V[] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const rr = i % 2 ? 3.0 : 3.9; petals.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); }
  parts.push({ s: poly(...petals), m: 'blue', sh: { k: 'dome', c, r: 3.9 }, bias: 0.12 });
  parts.push({ s: ell(c, 2.0), m: 'gold', sh: { k: 'dome', c, r: 2.0 }, shine: true, flush: true });
  return parts;
}

// ---------------------------------------------------------------------------------------------
// SET 1: THE WARRIOR'S BATTLE AXES AND WARHAMMERS (game/uniques.ts SET1_DEFS, behind SET1, off until his yes to these pictures).
// Painted by the main chat, 12 Nov 2026, at his word: “just do number 1, get it all finished, screw what chat its supposed to go
// to”. As the 62 are: the item pictures' kit, on the diagonal, the butt at the bottom left, as the game's weapons lie; each told
// from the others by its head's shape and its colours. Nothing glows but the meteor's fire, as fire glows on an item already.

/** Their materials of their own, five tones each, darkest to brightest. */
const S1 = {
  /** Red Tithe's blade: steel gone black-red with blood */
  blood: ['#12060a', '#2e0c12', '#5a1420', '#8e2430', '#c85a5e'],
  /** Death Knell's bell: old bronze */
  bronze: ['#2a1606', '#5a3410', '#946024', '#c8963e', '#f2d48a'],
  /** Starbreaker's head: dark iron fallen from the sky, stone-grey */
  meteor: ['#0c0a12', '#1c1824', '#322a3a', '#544658', '#86788a'],
} satisfies Record<string, Ramp>;
/** The meteor's fire in its cracks, and its white heart. */
const MOLTEN = '#ff8a2a';
const MOLTEN_HI = '#ffd27a';

/** The butt of a Set 1 weapon's haft; a point `d` along the haft (toward the upper right) and `a` across it (+: lower right). */
const AX_O: V = [5.4, 26.6];
const ax = (d: number, a: number): V => at(AX_O, UP, d, a);
const axPoly = (pts: readonly [number, number][]): Shape => poly(...pts.map(([d, a]) => ax(d, a)));
const axMarks = (pts: readonly [number, number][], t: number | string): Mark[] => pts.slice(1).map((q, i) => ({ a: ax(pts[i][0], pts[i][1]), b: ax(q[0], q[1]), t }));

/** A haft from its butt along the diagonal, `long` picture pixels, its grip wrapped, and its knob. */
function haft(o: { wood: Part['m']; grip: Part['m']; knob: Part['m']; long?: number; w?: number }): Part[] {
  const L = o.long ?? 25;
  const w = o.w ?? 1.3;
  const A = ax(0.8, 0), B = ax(L, 0), g0 = ax(2.2, 0), g1 = ax(9.6, 0);
  const marks: Mark[] = [];
  for (let d = 3.2; d < 9.2; d += 2.4) marks.push({ a: ax(d, -w - 0.4), b: ax(d + 1, w + 0.4), t: 1 });
  return [
    { s: cap(A, B, w), m: o.wood, sh: { k: 'cyl', a: A, b: B, w }, bias: 0.1 },
    { s: cap(g0, g1, w + 0.35), m: o.grip, sh: { k: 'cyl', a: g0, b: g1, w: w + 0.35 }, bias: 0.16, marks },
    { s: ell(ax(0.4, 0), w + 0.9), m: o.knob, sh: { k: 'dome', c: ax(0.4, 0), r: w + 0.9 }, shine: true },
  ];
}
/** A band round the haft at `d`. */
const axBand = (d: number, r: number, m: Part['m']): Part => ({ s: axPoly([[d - 0.8, -r], [d + 0.8, -r], [d + 0.8, r], [d - 0.8, r]]), m, sh: { k: 'cyl', a: ax(d, -r), b: ax(d, r), w: 0.8 }, shine: true });

/**
 * GYRE (battle axe, the Warrior's: his thrown axe stops at the end of its flight and spins there, cutting everything round it).
 * A double-bitted axe whose two blades sweep opposite ways round its eye, a pinwheel even lying still; a spiral cut in the boss
 * over the eye; a storm-grey haft and a blue grip.
 */
function gyre(): Part[] {
  const parts = haft({ wood: R.storm, grip: 'blue', knob: 'steel', long: 26 });
  // (each point kept within the frame: along and across together no more than 32)
  const up: [number, number][] = [[19.2, -1.8], [23.0, -1.8], [25.0, -4.6], [25.6, -6.4], [23.4, -8.6], [21.0, -10.0], [18.2, -8.6], [16.4, -7.0], [18.6, -4.0]];
  const down = up.map(([d, a]) => [42.2 - d, -a] as [number, number]);
  for (const [i, b] of [up, down].entries()) {
    const edge = b.slice(3, 8);
    parts.push({ s: axPoly(b), m: 'steel', sh: { k: 'flat', bev: 1.5 }, shine: true, bias: i ? -0.06 : 0.06, marks: [...axMarks(edge, 4), ...axMarks(edge.map(([d, a]) => [d + (i ? 0.6 : -0.6) * 0, a * 0.82] as [number, number]), 3)] });
  }
  const c = ax(21.1, 0);
  parts.push({ s: ell(c, 2.7), m: 'dsteel', sh: { k: 'dome', c, r: 2.7 }, shine: true });
  parts.push(gem(c, 1.5, 'sapphire'));
  parts.push({ s: poly(ax(26.2, -1.2), ax(28.8, 0), ax(26.2, 1.2)), m: 'steel', sh: { k: 'ridge', a: ax(26.2, 0), b: ax(28.8, 0) }, shine: true });
  parts.push(axBand(16.6, 1.9, 'dsteel'));
  return parts;
}

/**
 * RED TITHE (battle axe, the Warrior's: one that dies bleeding throws its blood to the nearest other). A bearded axe, its blade
 * gone black-red with blood, a channel cut along its edge, drops falling from its beard; a gold coin, the tithe, hung on a cord
 * from its poll.
 */
function redtithe(): Part[] {
  const parts = haft({ wood: 'ebony', grip: 'red', knob: 'dsteel' });
  const blade: [number, number][] = [[17.6, -1.8], [23.6, -1.8], [25.0, -4.4], [27.2, -9.0], [24.2, -10.6], [20.4, -10.8], [16.8, -10.0], [13.2, -9.4], [10.8, -7.4], [12.0, -6.0], [14.2, -5.8], [16.2, -4.6], [17.0, -2.6]];
  const edge = blade.slice(3, 9);
  parts.push({ s: axPoly(blade), m: S1.blood, sh: { k: 'flat', bev: 1.5 }, shine: true, marks: [...axMarks(edge, 4), ...axMarks(edge.map(([d, a]) => [d, a + 1.6] as [number, number]), 1)] });
  parts.push({ s: axPoly([[23.6, 1.8], [19.0, 1.8], [19.4, 3.6], [23.2, 3.6]]), m: 'dsteel', sh: { k: 'flat', bev: 0.9 }, shine: true });
  // the drops falling off its beard (straight down the picture)
  for (const [d, a, r] of [[9.0, -5.6, 0.95], [7.0, -3.6, 0.8]] as const) parts.push({ s: ell(ax(d, a), r, r * 1.3), m: 'ruby', sh: { k: 'dome', c: ax(d, a), r }, shine: true });
  // the tithe: a coin on a cord from the poll
  parts.push({ s: path([ax(21.2, 3.6), ax(20.6, 5.0)], [0.5, 0.5]), m: 'string', sh: { k: 'soft', r: 0.5 } });
  const coin = ax(19.8, 6.8);
  parts.push({ s: ell(coin, 2.2), m: 'gold', sh: { k: 'dome', c: coin, r: 2.2 }, shine: true, marks: [{ a: [coin[0] - 0.8, coin[1]], b: [coin[0] + 0.8, coin[1]], t: 1 }, { a: [coin[0], coin[1] - 0.8], b: [coin[0], coin[1] + 0.8], t: 1 }] });
  parts.push(axBand(16.0, 1.9, 'dsteel'));
  return move(parts, 1.0, 1.0);
}

/**
 * WIDOWFALL (battle axe, the Warrior's: Leaping Chop lands with a Cleave all round him, and all it strikes bleed). A long black
 * crescent of a blade, horned top and bottom, its edge silver, a moon pierced through it; a pale mourning ribbon tied under the head.
 */
function widowfall(): Part[] {
  const parts = haft({ wood: 'ebony', grip: 'vcloth', knob: 'steel' });
  // (a true crescent: its horns turned back toward the haft, its back hollowed between them)
  const blade: [number, number][] = [[18.4, -1.8], [22.6, -1.8], [22.2, -4.0], [24.4, -5.0], [26.8, -4.6], [28.8, -3.6], [29.4, -6.8], [28.2, -9.6], [24.6, -11.2], [20.0, -11.2], [16.0, -10.0], [13.4, -7.8], [12.4, -4.6], [14.4, -5.0], [16.6, -5.6], [18.4, -4.0]];
  const edge = blade.slice(5, 13);
  parts.push({ s: axPoly(blade), m: R.velvet, sh: { k: 'flat', bev: 1.6 }, shine: true, marks: [...axMarks(edge, '#d8dcf0'), ...axMarks(edge.map(([d, a]) => [d, a + 1.1] as [number, number]), 4)] });
  parts.push({ s: poly(ax(25.0, -1.2), ax(27.8, 0), ax(25.0, 1.2)), m: 'steel', sh: { k: 'ridge', a: ax(25, 0), b: ax(27.8, 0) }, shine: true });
  // the ribbon's two tails, then its knot
  parts.push({ s: path([ax(16.2, 1.2), ax(14.0, 3.8), ax(11.4, 5.2)], [1.0, 0.9, 0.6]), m: 'linen', sh: { k: 'soft', r: 0.8 }, bias: 0.05 });
  parts.push({ s: path([ax(15.8, 1.4), ax(15.2, 4.8), ax(13.2, 7.2)], [1.0, 0.9, 0.6]), m: 'linen', sh: { k: 'soft', r: 0.8 }, bias: -0.1 });
  parts.push({ s: ell(ax(16.4, 0.6), 1.6, 1.3), m: 'linen', sh: { k: 'soft', r: 1 }, bias: 0.15 });
  // (its tall blade reaches higher than the others': the whole brought down and right into the middle of its frame)
  return move(parts, 1.6, 1.6);
}

/**
 * DEATH KNELL (warhammer, the Warrior's: every enemy his hammer stuns rings like a bell). Its head is a bell, old bronze, lying
 * across the haft, its crown to the upper left and its mouth to the lower right, its clapper showing; two bands round it; a ring
 * at its crown.
 */
function deathknell(): Part[] {
  const parts = haft({ wood: 'ebony', grip: 'leather', knob: 'brass', long: 20 });
  const bell: [number, number][] = [[19.6, -6.6], [22.6, -6.6], [24.0, -5.4], [24.2, -1.0], [25.4, 3.2], [26.6, 5.4], [26.4, 6.4], [15.8, 6.4], [15.6, 5.4], [16.8, 3.2], [18.0, -1.0], [18.2, -5.4]];
  parts.push(link(ax(21.1, -7.6), 1.7, 1.3, 'brass', 45));
  parts.push({ s: axPoly(bell), m: S1.bronze, sh: { k: 'cyl', a: ax(17, 0), b: ax(25.2, 0), w: 4.2 }, shine: true, bias: 0.05, marks: [...axMarks([[18.2, -3.4], [24.1, -3.4]], 1), ...axMarks([[16.6, 3.8], [25.6, 3.8]], 1), ...axMarks([[16.0, 5.6], [26.2, 5.6]], 4)] });
  // the mouth's dark inside, and the clapper in it
  parts.push({ s: axPoly([[16.4, 6.0], [25.8, 6.0], [25.2, 7.0], [17.0, 7.0]]), m: 'shadow', sh: { k: 'flat' }, flush: true });
  const cl = ax(21.1, 7.4);
  parts.push({ s: ell(cl, 1.5), m: 'dsteel', sh: { k: 'dome', c: cl, r: 1.5 }, shine: true });
  return parts;
}

/**
 * DEADWEIGHT (warhammer, the Warrior's: the hammer grows heavier with every Smash in a row). A great crude block of dark iron,
 * chains wrapped twice round it, and an iron weight hung from it on a short chain; a thick haft.
 */
function deadweight(): Part[] {
  const parts = haft({ wood: 'wood', grip: 'dleather', knob: 'dsteel', long: 24, w: 1.6 });
  parts.push({ s: axPoly([[16.8, -6.4], [26.4, -6.4], [26.4, 6.4], [16.8, 6.4]]), m: R.rust, sh: { k: 'flat', bev: 1.8 }, shine: true, bias: 0.04 });
  for (const a of [-6.4, 6.4]) parts.push({ s: axPoly([[16.2, a - 0.9], [27.0, a - 0.9], [27.0, a + 0.9], [16.2, a + 0.9]]), m: 'dsteel', sh: { k: 'flat', bev: 0.8 }, shine: true, marks: [{ a: ax(16.6, a + (a > 0 ? 0.7 : -0.7)), b: ax(26.6, a + (a > 0 ? 0.7 : -0.7)), t: 4 }] });
  // the chains round it
  for (const d of [19.0, 24.2]) for (let k = 0; k < 6; k++) {
    const a = -5.0 + k * 2.0;
    parts.push(link(ax(d, a), k % 2 ? 0.8 : 1.05, k % 2 ? 1.05 : 0.8, 'steel', 45));
  }
  // the weight on its chain
  for (const [d, a] of [[19.6, 8.4], [18.6, 9.8]] as const) parts.push(link(ax(d, a), 0.8, 1.0, 'steel', 45));
  const wt = ax(17.0, 11.8);
  parts.push({ s: ell(wt, 2.5, 2.2), m: 'dsteel', sh: { k: 'dome', c: wt, r: 2.5 }, shine: true, marks: [{ a: [wt[0] - 1, wt[1] + 0.4], b: [wt[0] + 1, wt[1] + 0.4], t: 1 }] });
  return parts;
}

/**
 * STARBREAKER (warhammer, the Warrior's: Earthquake pulls a meteor down out of the sky). A rough head of dark iron fallen from the
 * sky, cracked through with its fire still in it; a star set in its face; an ebony haft banded in iron.
 */
function starbreaker(): Part[] {
  const parts = haft({ wood: 'ebony', grip: 'red', knob: 'dsteel' });
  const head: [number, number][] = [[18.2, -6.4], [21.0, -7.4], [24.6, -6.6], [26.4, -3.4], [26.0, 0.6], [26.8, 4.2], [24.8, 6.6], [20.6, 7.0], [17.4, 6.0], [16.4, 2.4], [17.0, -1.4], [16.6, -4.2]];
  const cracks: Mark[] = [
    ...axMarks([[18.0, -5.0], [19.6, -3.6], [19.0, -2.0], [20.4, -1.0]], MOLTEN),
    ...axMarks([[25.2, 4.6], [23.6, 3.8], [24.0, 2.4], [22.6, 1.6]], MOLTEN),
    ...axMarks([[24.8, -5.2], [23.4, -3.8]], MOLTEN),
    ...axMarks([[18.6, 5.0], [20.0, 3.8]], MOLTEN),
    { a: ax(19.6, -3.6), t: MOLTEN_HI },
    { a: ax(23.6, 3.8), t: MOLTEN_HI },
  ];
  parts.push({ s: axPoly(head), m: S1.meteor, sh: { k: 'soft', r: 2.4 }, shine: true, marks: cracks });
  const c = ax(21.6, 0.4);
  const star: V[] = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k / 10) * Math.PI * 2;
    const r = k % 2 ? 1.1 : 2.8;
    star.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
  }
  parts.push({ s: poly(...star), m: 'fire', sh: { k: 'dome', c, r: 2.6 }, shine: true, flush: true });
  parts.push(axBand(15.6, 2.0, 'dsteel'));
  parts.push(axBand(13.8, 1.8, 'dsteel'));
  return parts;
}

/** Set 1's pictures, by their ids in game/uniques.ts SET1_DEFS: kept apart from the 62's (UNIQUE_ART_IDS), as Set 1 is behind its own switch. */
const SET1_PAINTERS: Record<string, () => Part[]> = { gyre, redtithe, widowfall, deathknell, deadweight, starbreaker };
/** The ids of Set 1's pictures. */
export const SET1_ART_IDS: readonly string[] = Object.keys(SET1_PAINTERS);

// ---------------------------------------------------------------------------------------------

/** Every unique with a picture of its own here, by its id in game/uniques.ts UNIQUE_DEFS. */
const UNIQUE_PAINTERS: Record<string, () => Part[]> = {
  longecho, brokenshackles, queenstalons, dancingshoes, standingstone, pivot, shortway, clovenboots, sprungheels,
  thirdword, drownedarm, amalgamsheart, clockworksongbird, dogearedpage, packcollar, prism, unsignedpact,
  censorsseal, quillsband, cantorsecho, queensglass, ghostwriter, alloyband, companyscrip,
  freehand, fleshmancersbrand, halfcarvedhand, press, hairtrigger, receipt,
  bloodprice, kingsknot, wardenskeys, miserspurse, towline,
  twofacedmask, headsmanshood, criershush, hollowcrown, longodds,
  polyglotsmantle, physicianscoat, mothswing, nettleshirt,
  millstone, windcutter, undertow, rainwalker, fan, poachersbow, shepherdscrook, tide, tuningstaff,
  ledgerofdebts, restlesstome, burningverse, secondwhistle, stickywrench, foremanswrench, lastround, fourthglobe, winningstreak,
};

/** The ids of the uniques drawn so far. */
export const UNIQUE_ART_IDS: readonly string[] = Object.keys(UNIQUE_PAINTERS);

/** One unique's own picture: 32 by 32 picture pixels, as art/items_a.ts paintItemA's, with the orange rim. Null for one not drawn. */
export function paintUnique(id: string): Px | null {
  const own = (m: Record<string, () => Part[]>): (() => Part[]) | undefined => (Object.prototype.hasOwnProperty.call(m, id) ? m[id] : undefined);
  const f = own(UNIQUE_PAINTERS) ?? own(SET1_PAINTERS);
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
