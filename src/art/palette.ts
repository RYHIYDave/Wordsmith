// The game's colour palette. All placeholder art uses only these colours so everything reads as
// one world: a dark stone dungeon lit by embers. Ramps run dark -> light.

export const P = {
  ink: '#120d18', // outlines and deepest shadow
  black: '#07050a',
  white: '#ffffff',

  // cold dungeon stone (walls, floor)
  st1: '#1c1722',
  st2: '#2a2331',
  st3: '#3a3040',
  st4: '#4d4252',
  st5: '#655868',
  st6: '#857888',
  st7: '#a89cab',

  // warm earth / worn flagstones
  er1: '#2b2020',
  er2: '#3d2c28',
  er3: '#544038',
  er4: '#6f584a',
  er5: '#8c7460',

  // bone
  bn1: '#6e6658',
  bn2: '#a39a82',
  bn3: '#d4cbb0',
  bn4: '#f2ecd8',

  // steel
  sl1: '#2e3440',
  sl2: '#4a5466',
  sl3: '#7a879c',
  sl4: '#b4c0d0',
  sl5: '#e6edf5',

  // wood and leather
  wd1: '#2d1b12',
  wd2: '#4a2c1a',
  wd3: '#6e4526',
  wd4: '#96643a',
  wd5: '#c08a55',

  // gold
  gd1: '#7a4a10',
  gd2: '#b87a1c',
  gd3: '#e8b030',
  gd4: '#ffe070',
  gd5: '#fff6c0',

  // fire and embers
  fr1: '#5c1408',
  fr2: '#a82810',
  fr3: '#e05018',
  fr4: '#ff8a2a',
  fr5: '#ffc24a',
  fr6: '#fff0a0',

  // blood and reds
  bl1: '#3a0a12',
  bl2: '#6e1020',
  bl3: '#a81c2c',
  bl4: '#e03c44',
  bl5: '#ff8a80',

  // skin
  sk1: '#7a4a38',
  sk2: '#b07050',
  sk3: '#dc9c74',
  sk4: '#f4c8a0',

  // purple (cultists, arcane)
  pu1: '#22123a',
  pu2: '#3c1e62',
  pu3: '#62329a',
  pu4: '#9858d0',
  pu5: '#d09cf8',

  // blue (mana, frost)
  bu1: '#101c48',
  bu2: '#1c3a86',
  bu3: '#2e6cc8',
  bu4: '#58a8f0',
  bu5: '#b0e0ff',

  // green (ranger, poison)
  gn1: '#12301c',
  gn2: '#1e5a2a',
  gn3: '#3c9038',
  gn4: '#84c84c',
  gn5: '#d0f080',

  // venom (poison: a sour yellow-green, well away from the ranger's leaf green)
  vn1: '#26300c',
  vn2: '#4c5e10',
  vn3: '#7c9416',
  vn4: '#b4cc24',
  vn5: '#e6f47a',

  // teal (hero accents that stand out against the warm dungeon)
  tl1: '#0e3038',
  tl2: '#18545c',
  tl3: '#28868a',
  tl4: '#58c0b0',
  tl5: '#b0f0dc',

  // lightning
  lt1: '#6a5a10',
  lt2: '#c8b020',
  lt3: '#fff060',
  lt4: '#ffffd0',
} as const;

export type PaletteKey = keyof typeof P;

/** Item rarity colours: Normal, Magic, Rare, Unique. */
export const RARITY_COLOR = ['#cfc6bc', '#6f8cff', '#ffe070', '#ff8a3a'] as const;

/** Colour ramps for the damage elements (dark -> light), used by effects and UI. */
export const ELEMENT_RAMP = {
  phys: [P.sl2, P.sl3, P.sl4, P.sl5],
  fire: [P.fr2, P.fr3, P.fr4, P.fr5, P.fr6],
  frost: [P.bu2, P.bu3, P.bu4, P.bu5, P.white],
  lightning: [P.lt1, P.lt2, P.lt3, P.lt4, P.white],
  arcane: [P.pu2, P.pu3, P.pu4, P.pu5, P.white],
} as const;
