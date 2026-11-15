// SKINS FOR THE WARRIOR'S AXE AND MAUL (14 Nov 2026): the game's four unique battle axes and three unique warhammers drawn in his
// hands, as his unique great swords are (art/sword_skins.ts). His word, 14 Nov 2026, of the Mage's staves done: “then do it for the
// rest of the cast”; asked whether to start, his pick: “Start the rest of the cast (Recommended)”. PICTURES FIRST: nothing of the
// game draws these until he has seen them on him and said yes. Shown them (docs/mockups/warrior_skins/pictures/axes_moves.mp4,
// hammers_moves.mp4), 14 Nov 2026: “Yes, all seven (Recommended)”. In the game behind art/heroes.ts WARRIOR_SKINS (off until his
// yes to them in play).
//
// Each is a take (art/warrior_up_weapons.ts WeaponTake) in the war axe's or the maul's place in every frame of his with it
// (paintAxe's `skin`): its haft as long, its grip and balance where theirs are, so his hands and every move of his are theirs;
// only its head and its stuffs its own (`look`). Each is drawn to its picture in the bag (art/items_unique.ts):
//   GYRE: two pale bits sweeping opposite ways round its eye, a pinwheel even lying still; a spiral on the boss; a storm-grey haft,
//     a blue grip.
//   RED TITHE: a bearded blade gone black-red with blood, drops falling from its beard; a gold coin, the tithe, on a cord from its
//     poll; a red grip.
//   WIDOWFALL: a long black crescent, horned top and bottom, a moon pierced through it; a pale mourning ribbon tied under the head;
//     a violet grip.
//   THE ROT AXE (the levelling unique of floor 10): its two bits gone green with rot, dripping.
//   DEATH KNELL: its head a bell of old bronze lying across the haft, its mouth to the striking side, its clapper showing; two
//     bands round it; a ring at its crown.
//   DEADWEIGHT: a great crude block of dark iron, chains wrapped twice round it, an iron weight hung from it on a short chain.
//   STARBREAKER: a rough head of dark iron fallen from the sky, cracked through with its fire still in it (an honest fire's
//     orange); a star set in its face; an ebony haft banded in iron, a red grip.
// The honed edges of the axes glow the friend's cyan, as the war axe's do; nothing else of them glows.

import { hash } from './kit';
import type { Ramp } from './kit';
import { AXE_A_BLADE, AXE_A_EDGE, AXE_B_BIT, AXE_B_EDGE, bev, collar, mirrorY, plate } from './warrior_up_weapons';
import type { P2, SkinTakeId, Smith, WeaponTake } from './warrior_up_weapons';
import { AXE } from './warrior_up_axe_moves';
import { MAUL } from './warrior_up_hammer_moves';

/** The war axe's haft, grip and balance (art/warrior_up_axe_moves.ts AXE): every unique axe's, so his hands and moves are its. */
const AXE_FIT = { butt: AXE.butt, top: AXE.top, hr: AXE.hr, grip: AXE.grip, heart: AXE.heart } as const;
/** The maul's (art/warrior_up_hammer_moves.ts MAUL): every unique hammer's. */
const MAUL_FIT = { butt: MAUL.butt, top: MAUL.top, hr: MAUL.hr, grip: MAUL.grip, heart: MAUL.heart } as const;

const shear = (pts: readonly P2[], k: number): P2[] => pts.map(([x, y]) => [x + k * y, y] as P2);

// ---------------------------------------------------------------------------------------------
// GYRE (game/uniques.ts `gyre`: the thrown axe stops at the end of its flight and spins there)

const PALE: Ramp = ['#2e2e44', '#55557a', '#8a8ab4', '#c4c4e6', '#f0f0ff'];
const STORM_WOOD: Ramp = ['#1e2028', '#30343e', '#4a505c', '#6c7480', '#9aa2ac'];
const BLUE_GRIP: Ramp = ['#0e1a3a', '#16285a', '#203c84', '#3058b0', '#5a84d8'];

export const GYRE_AXE: WeaponTake = {
  id: 'gyre', kind: 'axe', letter: 'B', name: 'Gyre: two bits sweeping opposite ways, a pinwheel',
  ...AXE_FIT,
  edges: [shear(AXE_B_EDGE, 0.42), shear(mirrorY(AXE_B_EDGE), 0.42)],
  look: { iron: PALE, wood: STORM_WOOD, leather: BLUE_GRIP },
  head: (sm) => {
    // (the two bits, the one swept up the haft, the other down it: a pinwheel)
    plate(sm, sm.iron, 'head', shear(AXE_B_BIT, 0.42), 1.0, 0, 'blade', 0.5, bev(1, 13.3));
    plate(sm, sm.iron, 'head', shear(mirrorY(AXE_B_BIT), 0.42), 1.0, 0, 'blade', 0.5, bev(-1, 13.3));
    const cheek: P2[] = [[23.6, 1.5], [30.4, 1.5], [31.2, 4.8], [22.8, 4.8]];
    plate(sm, sm.iron, 'head', shear(cheek, 0.42), 1.15, 0, 'cheek', 0.9);
    plate(sm, sm.iron, 'head', shear(mirrorY(cheek), 0.42), 1.15, 0, 'cheek', 0.9);
    // (the eye, and a round boss on each face of it, a spiral cut in it)
    sm.sc.box(sm.iron, 'head', [27.0, 0, 0], [[3.4, 0, 0], [0, 2.1, 0], [0, 0, 1.9]], 0.75, 0.6, { tag: 'eye' });
    const spiral = sm.sc.mat({ ramp: PALE, crease: 0.25, paint: (h) => {
      const a = Math.atan2(h.p[1], h.p[0] - 27.0);
      const r = Math.hypot(h.p[0] - 27.0, h.p[1]);
      const k = (r / 0.9 - a / Math.PI + 8) % 2;
      return k < 0.55 ? PALE[0] : null;
    } });
    for (const z of [1, -1]) sm.sc.ell(spiral, 'head', [27.0, 0, z * 1.9], [[2.6, 0, 0], [0, 2.6, 0], [0, 0, 0.7]], 0.3, { tag: 'boss' });
    sm.sc.cone(sm.iron, 'head', [30.4, 0, 0], [33.0, 0, 0], 1.4, 0.6, 0.5, { tag: 'cap' });
    collar(sm, 22.4, 1.4, 1.55);
  },
};

// ---------------------------------------------------------------------------------------------
// RED TITHE (game/uniques.ts `redtithe`: an enemy that dies bleeding throws its blood to the nearest other)

const BLOODIRON: Ramp = ['#1a0608', '#3a0c10', '#62161a', '#8e2a26', '#c04a3c'];
const BLOOD: Ramp = ['#2a0204', '#4e0608', '#7a0e10', '#a81c18', '#d23a2c'];
const GOLD: Ramp = ['#3e2a0c', '#6a4a16', '#a07a2a', '#d0aa4c', '#f4dc8c'];
const DARK_WOOD: Ramp = ['#140c08', '#24160e', '#3a2416', '#563620', '#7a5030'];
const RED_GRIP: Ramp = ['#2a0a0c', '#4a1216', '#781e22', '#a8322e', '#d05a4a'];

export const REDTITHE_AXE: WeaponTake = {
  id: 'redtithe', kind: 'axe', letter: 'A', name: 'Red Tithe: a bearded blade black-red with blood, a gold coin on a cord',
  ...AXE_FIT,
  edges: [AXE_A_EDGE],
  look: { iron: BLOODIRON, wood: DARK_WOOD, leather: RED_GRIP },
  head: (sm) => {
    plate(sm, sm.iron, 'head', AXE_A_BLADE, 1.05, 0, 'blade', 0.5, bev(1, 15.6));
    plate(sm, sm.iron, 'head', [[23.2, 1.5], [31.0, 1.5], [31.5, 5.0], [29.4, 6.6], [24.2, 6.4], [22.2, 4.2]], 1.2, 0, 'cheek', 0.9);
    sm.sc.box(sm.iron, 'head', [27.2, 0, 0], [[3.6, 0, 0], [0, 2.2, 0], [0, 0, 1.85]], 0.75, 0.7, { tag: 'eye' });
    sm.sc.box(sm.iron, 'head', [27.4, -3.0, 0], [[2.8, 0, 0], [0, 1.4, 0], [0, 0, 1.6]], 0.55, 0.6, { tag: 'poll' });
    collar(sm, 21.8, 1.4, 1.6);
    // (the blood: drops falling from the beard's hook)
    const blood = sm.sc.mat({ ramp: BLOOD, crease: 0.2 });
    for (const [x, y, r] of [[11.2, 8.4, 0.75], [10.0, 8.9, 0.55], [8.4, 9.3, 0.45]] as const) sm.sc.ell(blood, 'head', [x, y, 0], [[r * 1.3, 0, 0], [0, r, 0], [0, 0, r]], 0.2, { tag: 'drop' });
    // (the tithe: a gold coin on a cord from the poll, hung down the haft)
    const gold = sm.sc.mat({ ramp: GOLD, crease: 0.2 });
    const cord = sm.sc.mat({ ramp: RED_GRIP, crease: 0.2 });
    sm.sc.cone(cord, 'head', [26.0, -4.2, 0], [21.6, -6.2, 0], 0.3, 0.3, 0.1, { tag: 'cord' });
    sm.sc.ell(gold, 'head', [20.4, -6.6, 0], [[1.5, 0, 0], [0, 1.5, 0], [0, 0, 0.4]], 0.2, { tag: 'coin' });
  },
};

// ---------------------------------------------------------------------------------------------
// WIDOWFALL (game/uniques.ts `widowfall`: Leaping Chop lands with a Cleave all round him, and all it strikes bleed)

const BLACK: Ramp = ['#0c0a14', '#18142a', '#2a2440', '#423a5e', '#6a6090'];
const MOURNING: Ramp = ['#5a5868', '#86849a', '#b4b2c6', '#dcdaea', '#f6f4ff'];
const VIOLET_GRIP: Ramp = ['#1a0c30', '#2c1650', '#46247a', '#6638a6', '#9060d0'];

/** The crescent's edge: from its upper horn, round, to its lower horn. */
const WIDOW_EDGE: P2[] = [[35.6, 5.8], [34.4, 9.6], [31.6, 12.8], [27.6, 14.6], [23.0, 14.8], [18.8, 13.2], [15.6, 10.2], [13.8, 6.4]];
const WIDOW_BLADE: P2[] = [[22.4, 1.6], [25.2, 3.4], [28.8, 3.4], [31.6, 1.6], [34.0, 2.6], ...WIDOW_EDGE, [16.4, 4.2], [19.8, 1.6]];

export const WIDOWFALL_AXE: WeaponTake = {
  id: 'widowfall', kind: 'axe', letter: 'B', name: 'Widowfall: a long black crescent, a moon pierced through it',
  ...AXE_FIT,
  edges: [WIDOW_EDGE],
  look: { iron: BLACK, leather: VIOLET_GRIP },
  head: (sm) => {
    plate(sm, sm.iron, 'head', WIDOW_BLADE, 1.0, 0, 'blade', 0.5, bev(1, 14.8));
    // (the moon pierced through it)
    sm.sc.cone(sm.iron, 'head', [25.6, 8.4, -3], [25.6, 8.4, 3], 2.0, 2.0, 0, { tag: 'moon', carve: true });
    sm.sc.box(sm.iron, 'head', [26.8, 0, 0], [[4.6, 0, 0], [0, 2.0, 0], [0, 0, 1.8]], 0.7, 0.6, { tag: 'eye' });
    sm.sc.cone(sm.iron, 'head', [31.0, 0, 0], [34.0, 0, 0], 1.3, 0.4, 0.5, { tag: 'cap' });
    collar(sm, 21.4, 1.2, 1.5);
    // (a pale mourning ribbon tied under the head, its two tails hung down the haft)
    const ribbon = sm.sc.mat({ ramp: MOURNING, crease: 0.2 });
    sm.sc.cone(ribbon, 'ribbon', [20.2, 0, 0], [19.6, 0, 0], 1.75, 1.75, 0.1, { tag: 'knot' });
    for (const sd of [1, -1]) sm.sc.box(ribbon, 'ribbon', [16.6, sd * 1.9, 0], [[3.4, 0, 0], [0, 0.18, 0], [0, 0, 0.75]], 0.1, 0.1, { tag: 'tail' });
  },
};

// ---------------------------------------------------------------------------------------------
// THE ROT AXE (game/uniques.ts `rotaxe`, the levelling unique of floor 10: its hits poison, and do no physical harm)

const ROT: Ramp = ['#0e1e0c', '#1c3616', '#2e5420', '#4c7a30', '#80aa50'];
const OOZE: Ramp = ['#14300e', '#24521a', '#3a7c26', '#62aa3a', '#a2d870'];

export const ROT_AXE: WeaponTake = {
  id: 'rotaxe', kind: 'axe', letter: 'B', name: 'The Rot Axe: its two bits gone green with rot, dripping',
  ...AXE_FIT,
  edges: [AXE_B_EDGE, mirrorY(AXE_B_EDGE)],
  look: { iron: ROT },
  head: (sm) => {
    plate(sm, sm.iron, 'head', AXE_B_BIT, 1.0, 0, 'blade', 0.5, bev(1, 13.3));
    plate(sm, sm.iron, 'head', mirrorY(AXE_B_BIT), 1.0, 0, 'blade', 0.5, bev(-1, 13.3));
    const cheek: P2[] = [[23.6, 1.5], [30.4, 1.5], [31.2, 4.8], [22.8, 4.8]];
    plate(sm, sm.iron, 'head', cheek, 1.15, 0, 'cheek', 0.9);
    plate(sm, sm.iron, 'head', mirrorY(cheek), 1.15, 0, 'cheek', 0.9);
    sm.sc.box(sm.iron, 'head', [27.0, 0, 0], [[3.4, 0, 0], [0, 2.1, 0], [0, 0, 1.9]], 0.75, 0.6, { tag: 'eye' });
    sm.sc.cone(sm.iron, 'head', [30.4, 0, 0], [36.0, 0, 0], 1.45, 0.3, 0.6, { tag: 'spike' });
    collar(sm, 22.4, 1.4, 1.55);
    // (the rot: ooze clotted on each bit and dripping from its lower horn)
    const ooze = sm.sc.mat({ ramp: OOZE, crease: 0.2, paint: (h) => (hash(Math.round(h.p[0] * 2), Math.round(h.p[1] * 2), 5) < 0.12 ? OOZE[4] : null) });
    for (const sd of [1, -1]) {
      for (const [x, y, r] of [[25.0, 6.0, 1.2], [21.0, 9.4, 0.9], [18.4, 11.4, 0.8]] as const) sm.sc.ell(ooze, 'head', [x, sd * y, 0], [[r * 1.3, 0, 0], [0, r, 0], [0, 0, r * 1.2]], 0.5, { tag: 'ooze' });
      sm.sc.ell(ooze, 'head', [16.0, sd * 11.0, 0], [[0.9, 0, 0], [0, 0.6, 0], [0, 0, 0.6]], 0.2, { tag: 'drip' });
      sm.sc.ell(ooze, 'head', [14.2, sd * 11.2, 0], [[0.6, 0, 0], [0, 0.45, 0], [0, 0, 0.45]], 0.1, { tag: 'drip' });
    }
  },
};

// ---------------------------------------------------------------------------------------------
// DEATH KNELL (game/uniques.ts `deathknell`: every enemy his hammer stuns rings like a bell)

const BRONZE: Ramp = ['#2a1606', '#523010', '#86561e', '#c08a3a', '#ecc070'];

export const DEATHKNELL_HAMMER: WeaponTake = {
  id: 'deathknell', kind: 'hammer', letter: 'A', name: 'Death Knell: a bell of old bronze lying across the haft',
  ...MAUL_FIT,
  edges: [],
  look: { iron: BRONZE },
  head: (sm: Smith) => {
    // (the bell: its crown toward the back, its mouth to the striking side, flaring; a lip round its mouth; the hollow of it)
    sm.sc.cone(sm.iron, 'head', [27.0, -5.0, 0], [27.0, 5.8, 0], 2.6, 4.6, 0.6, { tag: 'bell' });
    sm.sc.cone(sm.iron, 'head', [27.0, 5.6, 0], [27.0, 7.2, 0], 5.2, 5.2, 0.4, { tag: 'lip' });
    sm.sc.cone(sm.iron, 'head', [27.0, 2.0, 0], [27.0, 9.0, 0], 2.0, 4.2, 0, { tag: 'hollow', carve: true });
    sm.sc.ell(sm.iron, 'head', [27.0, -5.2, 0], [[2.6, 0, 0], [0, 1.2, 0], [0, 0, 2.6]], 0.5, { tag: 'crown' });
    // (two bands round it)
    for (const y of [-2.2, 2.4]) sm.sc.cone(sm.dark, 'band', [27.0, y - 0.35, 0], [27.0, y + 0.35, 0], 3.3 + (y + 5) * 0.2, 3.3 + (y + 5) * 0.2, 0.1, { tag: 'band' });
    // (its clapper, showing in its mouth)
    sm.sc.ell(sm.dark, 'head', [27.0, 6.4, 0], [[1.2, 0, 0], [0, 1.2, 0], [0, 0, 1.2]], 0.2, { tag: 'clapper' });
    // (a ring at its crown)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const b = ((i + 1) / 8) * Math.PI * 2;
      sm.sc.cone(sm.iron, 'head', [27.0 + Math.cos(a) * 1.6, -7.4 + Math.sin(a) * 1.6, 0], [27.0 + Math.cos(b) * 1.6, -7.4 + Math.sin(b) * 1.6, 0], 0.45, 0.45, 0.2, { tag: 'ring' });
    }
    collar(sm, 21.4, 1.2, 1.6);
  },
};

// ---------------------------------------------------------------------------------------------
// DEADWEIGHT (game/uniques.ts `deadweight`: the hammer grows heavier with every blow in a row)

const CRUDE: Ramp = ['#121218', '#1e1e28', '#2e2e3c', '#464656', '#686878'];
const CHAIN: Ramp = ['#1a1a24', '#2e2e3c', '#4c4c5e', '#76768a', '#a8a8bc'];

export const DEADWEIGHT_HAMMER: WeaponTake = {
  id: 'deadweight', kind: 'hammer', letter: 'A', name: 'Deadweight: a crude iron block in chains, a weight hung from it',
  ...MAUL_FIT,
  edges: [],
  look: { iron: CRUDE, wood: DARK_WOOD },
  head: (sm: Smith) => {
    // (the block: great and crude, its corners knocked rough)
    sm.sc.box(sm.iron, 'head', [27.0, 0.6, 0], [[4.8, 0, 0], [0, 6.6, 0], [0, 0, 4.6]], 1.4, 0.5, { tag: 'block' });
    for (const [x, y, z] of [[30.6, 5.2, 3.4], [23.6, -4.6, -3.2], [30.2, -5.0, 3.0]] as const) sm.sc.ell(sm.iron, 'head', [x, y, z], [[1.6, 0, 0], [0, 1.4, 0], [0, 0, 1.2]], 0.9, { tag: 'lump' });
    // (the chains, wrapped twice round it: links, each across the last)
    const chain = sm.sc.mat({ ramp: CHAIN, crease: 0.3 });
    for (const x of [24.6, 29.4]) {
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const y = 0.6 + Math.cos(a) * 7.0;
        const z = Math.sin(a) * 5.0;
        sm.sc.ell(chain, 'chain', [x, y, z], i % 2 ? [[0.9, 0, 0], [0, 0.35, 0], [0, 0, 0.35]] : [[0.35, 0, 0], [0, 0.9, 0], [0, 0, 0.9]], 0.1, { tag: 'link' });
      }
    }
    // (the weight: hung from the back of the block on a short chain, a squat iron bell of a thing)
    for (let i = 0; i < 3; i++) sm.sc.ell(chain, 'chain', [27.0 - i * 1.4, -7.0 - i * 0.6, 0], i % 2 ? [[0.9, 0, 0], [0, 0.35, 0], [0, 0, 0.35]] : [[0.35, 0, 0], [0, 0.9, 0], [0, 0, 0.9]], 0.1, { tag: 'link' });
    sm.sc.cone(sm.iron, 'head', [22.6, -8.4, 0], [20.0, -9.4, 0], 1.6, 2.4, 0.4, { tag: 'weight' });
    // (the haft thick: a sleeve of wood over it below the head)
    sm.sc.cone(sm.wood, 'haft', [14.0, 0, 0], [22.0, 0, 0], 1.45, 1.6, 0.4, { tag: 'haft' });
    collar(sm, 21.0, 1.2, 1.9);
  },
};

// ---------------------------------------------------------------------------------------------
// STARBREAKER (game/uniques.ts `starbreaker`: Earthquake pulls a meteor down out of the sky)

const METEOR: Ramp = ['#14101a', '#241c2a', '#3a2e3c', '#584656', '#7e6a78'];
const EBONY: Ramp = ['#0c0a0e', '#18141c', '#26202c', '#3a3242', '#564c60'];
const FIRE = ['#b8501c', '#ff8a2a', '#ffc24a'] as const;

export const STARBREAKER_HAMMER: WeaponTake = {
  id: 'starbreaker', kind: 'hammer', letter: 'A', name: 'Starbreaker: a rough head fallen from the sky, its fire in its cracks, a star in its face',
  ...MAUL_FIT,
  edges: [],
  look: { iron: METEOR, wood: EBONY, leather: RED_GRIP },
  head: (sm: Smith) => {
    // (the head: rough, lumped, a stone fallen from the sky; cracked through, its fire in the cracks: an honest fire's orange)
    const rock = sm.sc.mat({ ramp: METEOR, crease: 0.4, paint: (h) => {
      const k = Math.sin(h.p[0] * 1.3 + h.p[1] * 0.7) + Math.sin(h.p[1] * 1.1 - h.p[2] * 1.5);
      if (Math.abs(k) < 0.16) return h.tone >= 2 ? FIRE[2] : FIRE[1];
      if (Math.abs(k) < 0.3) return FIRE[0];
      return null;
    } });
    sm.sc.ell(rock, 'head', [27.0, 0.6, 0], [[4.6, 0, 0], [0, 6.0, 0], [0, 0, 4.4]], 1.0, { tag: 'rock' });
    for (const [x, y, z, r] of [[29.8, 3.4, 2.2, 2.4], [24.0, -3.2, -2.0, 2.6], [28.6, -4.0, 2.6, 2.0], [24.6, 4.0, -2.6, 2.2]] as const) sm.sc.ell(rock, 'head', [x, y, z], [[r, 0, 0], [0, r * 0.9, 0], [0, 0, r * 0.85]], 1.0, { tag: 'rock' });
    // (the star set in its face: five brass points)
    const brass = sm.sc.mat({ ramp: GOLD, crease: 0.25 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
      sm.sc.cone(brass, 'head', [27.0, 6.6, 0], [27.0 + Math.cos(a) * 2.4, 6.9, Math.sin(a) * 2.4], 0.7, 0.12, 0.1, { tag: 'star' });
    }
    // (the haft banded in iron below the head)
    const iron = sm.sc.mat({ ramp: CHAIN, crease: 0.3 });
    for (const x of [16.0, 19.0]) sm.sc.cone(iron, 'band', [x - 0.4, 0, 0], [x + 0.4, 0, 0], 1.45, 1.45, 0.1, { tag: 'band' });
    collar(sm, 21.6, 1.2, 1.7);
  },
};

/** The unique axes and hammers, by their takes' ids. */
export const HEAVY_SKIN_OF: Readonly<Record<SkinTakeId, WeaponTake>> = {
  gyre: GYRE_AXE,
  redtithe: REDTITHE_AXE,
  widowfall: WIDOWFALL_AXE,
  rotaxe: ROT_AXE,
  deathknell: DEATHKNELL_HAMMER,
  deadweight: DEADWEIGHT_HAMMER,
  starbreaker: STARBREAKER_HAMMER,
};
/** The axes, the war axe first; the hammers, the maul first. */
export const AXE_SKIN_LIST: readonly WeaponTake[] = [AXE, GYRE_AXE, REDTITHE_AXE, WIDOWFALL_AXE, ROT_AXE];
export const HAMMER_SKIN_LIST: readonly WeaponTake[] = [MAUL, DEATHKNELL_HAMMER, DEADWEIGHT_HAMMER, STARBREAKER_HAMMER];
