// ENDLESS MODE'S KEY: THE RUNE TABLET, TO THE GAME'S STANDARD (the art chat, 12 Nov 2026; the queue's
// draw-endless-tablet-portal-final-boss). Behind ENDLESS_TABLET (off): nothing of the game imports this file.
//
// His picks, 12 Nov 2026 (docs/mockups/endless_tablet/README.md has every word): the tablet is “B but I want runes over letters”,
// then, shown it so, “Sorry I like the runes”. So: a round disc of the Shaft's Rim's own stone, a raised rim, a small round boss in
// its middle; cut in four, each quarter with one of the wordsmith's own runes cut in it (art/town.ts RUNES) and its boss's small
// mark on the rim. AS THEY DROP, CUT DARK. SET WHOLE IN THE BENCH'S SOCKET (art/shaft_props.ts BENCH_SOCKET), THE FOUR BURN IN THE
// FRIEND'S CYAN (the wordsmith's light, as his slab's runes: nothing pink or gold).
//
// WHAT IS HERE
//   paintQuarter(k)        a quarter as an item: the bag, the gear page and lying on the floor, as every item is shown
//                          (art/icons.ts itemPic): 32 x 32 picture pixels, two to a game pixel, the item pictures' own way (the
//                          light from the upper left, five tones, the ink outline and the rarity's rim round it: art/items_a.ts).
//                          k: 0 floor 5 (the Fleshmancer), 1 floor 10 (the Swamp Colossus), 2 floor 15 (the Censor), 3 floor 20
//                          (the Moth), as the trophies wall has them (TROPHY_BOSSES). Each is its own quarter of the round, as it
//                          sits in the whole: 0 the top left, 1 the top right, 2 the bottom right, 3 the bottom left.
//   paintSocketTablet(held, lit)
//                          the quarters he has set, lying in the bench's socket, laid over the slab (paintSocketSlab) at the same
//                          anchor; `lit` a frame of the four burning once all four are in (SOCKET_LIT frames at 30 a second; -1
//                          dark). Its lights go with it.
//
// The pictures are plain numbers (Px): the tests read them without a browser.

import { Px, mix } from '../engine/px';
import type { Light } from '../engine/px';
import { GRAIN, INK, SPARK } from './kit';
import { RARITY_COLOR } from './palette';
import { BENCH_SOCKET } from './shaft_props';

/** The switch: OFF. On, the game may show these (the main chat's: the quarters as loot, the socket, the rules). */
export const ENDLESS_TABLET = { on: false };

// ---------------------------------------------------------------------------------------------------------------------------
// THE STONE: the Shaft's Rim's own top stone (art/shaft_props.ts S), dark to light, and one tone past it for the rim's crest.

const S = ['#141018', '#241c26', '#352b34', '#463a40', '#584a4c', '#6a5a58', '#7e6c64', '#958474'] as const;
const CREST = '#c2b29c';
/** Five tones as the item pictures take them (0 darkest ... 3 lit, 4 a highlight): a step up the rim's stone, as a thing in the hand. */
const STONE5 = [S[3], S[4], S[6], S[7], CREST] as const;
/** The plaque's sunken face, dark, that the mark is inlaid in. */
const PLAQUE_FACE = ['#1c1620', '#241c26'] as const;

/** Which of the wordsmith's runes each boss guards (art/town.ts RUNES, by index): as sketched and shown him (tablet.py RUNE_OF). */
export const RUNE_OF = [0, 4, 3, 1] as const;
/** The wordsmith's runes (art/town.ts RUNES: the same four, copied so as not to pull the town's file in). */
const RUNES: ReadonlyArray<ReadonlyArray<string>> = [
  ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '.#.#.', '#...#', '.....'],
  ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#', '#....', '#....'],
  ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#....', '#...#', '.###.'],
  ['#.#.#', '#.#.#', '.###.', '..#..', '..#..', '.###.', '#.#.#', '#...#', '.....'],
  ['..#..', '..#..', '#####', '..#..', '.#.#.', '#...#', '#...#', '.#.#.', '..#..'],
  ['#####', '....#', '...#.', '.###.', '...#.', '....#', '....#', '#...#', '.###.'],
];
/** The quarters, by k: which way each lies from the tablet's middle on its face (x right, y down). */
export const QUAD = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const;

// The bosses' small marks, each from the boss's own look as its trophy has it (art/shaft_props.ts paintTrophy): an inlay of his
// colours in the plaque on the rim. Characters: '.' clear, 'o' the plaque's stone, letters the mark's colours (per mark).
const MARKS: { rows: string[]; col: Record<string, string> }[] = [
  // floor 5, the Fleshmancer: his skull, bone, its sockets and teeth dark
  { rows: ['.aaa.', 'abbba', 'bdbdb', '.bbb.', '.b.b.'], col: { a: '#efdcb8', b: '#d6bc94', d: '#1c1620' } },
  // floor 10, the Swamp Colossus: its eye, the yellowed white, the gold iris, the slit
  { rows: ['.....', '.aaa.', 'abdba', '.aaa.', '.....'], col: { a: '#c4b08a', b: '#f0b030', d: '#1c1620' } },
  // floor 15, the Censor: his blank white mask, its eye slits, its crack
  { rows: ['.aaa.', 'adaba', 'aabaa', '.aaa.', '..a..'], col: { a: '#e8e4ec', b: '#9a96a0', d: '#1c1620' } },
  // floor 20, the Moth: its ash wings open, a pale eye on each, its body between
  { rows: ['aa.aa', 'aebea', 'aabaa', '.aba.', '..b..'], col: { a: '#8a848e', b: '#3a363c', e: '#d8d0c0' } },
];

function h3(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// The light as the item pictures have it (art/items_a.ts LV): from the upper left and in front.
const LV = ((): readonly [number, number, number] => {
  const v = [-0.5, -0.66, 0.58];
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
})();
const toneOf = (n: readonly [number, number, number], bias = 0, shine = false): number => {
  const v = n[0] * LV[0] + n[1] * LV[1] + n[2] * LV[2] + bias;
  const t = v > 0.93 ? 4 : v > 0.72 ? 3 : v > 0.42 ? 2 : v > 0.08 ? 1 : 0;
  return shine ? t : Math.min(3, t);
};
const norm = (x: number, y: number, z: number): [number, number, number] => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
};

// ---------------------------------------------------------------------------------------------------------------------------
// A QUARTER AS AN ITEM

/** The item picture's size (as every item's: art/items_a.ts ITEM_A_N). */
export const QUARTER_N = 32;
/** A quarter's shape in its picture: the tablet's radius, the rim's breadth, the boss's radius, the stone's thickness seen below. */
export const QUARTER = { r: 24.6, rim: 5, boss: 5.2, thick: 2 } as const;
/** The plaque on the rim that carries the boss's mark: its half breadth and height, and how much of it is its sunken face. */
const PLQ = { rx: 4.7, ry: 4.4, face: 0.74 } as const;
/** Its rarity's rim: the unique items' orange (the rarest thing a boss drops; the main chat's to change: RARITY_COLOR). */
export const QUARTER_RARITY = 3;

/** Where the tablet's middle lies in quarter k's picture (picture pixels): the quarter, with its thickness under it, in the middle of the frame. */
export function quarterMiddle(k: number): [number, number] {
  const [sx, sy] = QUAD[k];
  const R = QUARTER.r;
  const t = QUARTER.thick;
  return [16 - (sx * R) / 2, sy < 0 ? 16 + (R - t) / 2 : 16 - (R + t) / 2];
}

/**
 * Quarter k as an item (32 x 32): its face toward us, a step of its thickness seen under it, its raised rim along the round, the
 * quarter of the round boss at its corner, its rune cut dark in the middle of its face, its boss's mark on a plaque on the rim.
 */
export function paintQuarter(k: number, rarity = QUARTER_RARITY): Px {
  const N = QUARTER_N;
  const [sx, sy] = QUAD[k];
  const [cx, cy] = quarterMiddle(k);
  const R = QUARTER.r;
  // (the plaque on the rim: at 62 degrees round from the straight edge that runs across, toward the one that runs up)
  const pa = (62 * Math.PI) / 180;
  const plq: [number, number] = [cx + sx * Math.cos(pa) * (R - QUARTER.rim / 2 - 0.2), cy + sy * Math.sin(pa) * (R - QUARTER.rim / 2 - 0.2)];
  /** Is (x, y) (a pixel's middle) on the quarter's face? Its distance from the middle along the face, and across. */
  const onFace = (x: number, y: number, dy = 0): boolean => {
    const u = (x - cx) * sx;
    const v = (y - dy - cy) * sy;
    return u > 0.4 && v > 0.4 && Math.hypot(u, v) < R;
  };
  const out = new Px(N, N);
  const tone = new Int8Array(N * N).fill(-1);
  const part = new Int8Array(N * N).fill(-1); // 0 face, 1 rim, 2 boss, 3 thickness, 4 plaque
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = x + 0.5;
    const py = y + 0.5;
    if (!onFace(px, py)) {
      // (the stone's thickness, seen under the edges that look down: a band of its cut side, in shade)
      if (onFace(px, py, QUARTER.thick)) {
        part[y * N + x] = 3;
        const u = (px - cx) * sx;
        const v = (py - QUARTER.thick - cy) * sy;
        // (under the round: its side turns from the light as it goes round to the right)
        const onRound = Math.hypot(u, v) > R - 1.2 && sy > 0;
        const a = Math.atan2(py - cy, px - cx);
        tone[y * N + x] = onRound ? (Math.cos(a) < -0.3 ? 2 : Math.cos(a) < 0.35 ? 1 : 0) : 1;
      }
      continue;
    }
    const dx = px - cx;
    const dy = py - cy;
    const d = Math.hypot(dx, dy);
    const ux = dx / (d || 1);
    const uy = dy / (d || 1);
    // (the plaque: a small raised oval on the rim, its face flat, its edge rounded)
    const pd = Math.hypot((px - plq[0]) / PLQ.rx, (py - plq[1]) / PLQ.ry);
    if (pd < 1) {
      part[y * N + x] = 4;
      // (its rim a ring of the stone, rounded; inside it the sunken face, dark, its upper left in the rim's shadow)
      if (pd > PLQ.face) {
        const ex = (px - plq[0]) / PLQ.rx;
        const ey = (py - plq[1]) / PLQ.ry;
        tone[y * N + x] = toneOf(norm(ex * 1.3, ey * 1.3, 1), 0.12, true);
      } else tone[y * N + x] = -2 - ((px - plq[0]) + (py - plq[1]) < -1.2 ? 0 : 1);
      continue;
    }
    if (d < QUARTER.boss) {
      // the boss: a low dome
      part[y * N + x] = 2;
      const l = Math.min(0.92, d / QUARTER.boss);
      tone[y * N + x] = toneOf(norm(ux * l, uy * l, Math.sqrt(1 - l * l)), 0.06, true);
      continue;
    }
    if (d > R - QUARTER.rim) {
      // the rim: raised, round in its section: its outer half looks out, its inner half in; its crest catches the light
      part[y * N + x] = 1;
      // (across it, picture pixels from its inner foot: a bevel up from the face, a flat crest, a bevel down to its outer edge)
      const w = d - (R - QUARTER.rim);
      const l = w < 1.6 ? -0.82 : w > QUARTER.rim - 1.3 ? 0.8 : 0;
      tone[y * N + x] = toneOf(norm(ux * l, uy * l, Math.sqrt(1 - l * l)), l === 0 ? 0.2 : 0.04, true);
      continue;
    }
    // the face: flat, its straight cut edges a little worn round
    part[y * N + x] = 0;
    const u = (px - cx) * sx;
    const v = (py - cy) * sy;
    let n: [number, number, number] = [0, 0, 1];
    if (u < 1.6) n = norm(-sx * (1.6 - u) * 0.45, 0, 1);
    if (v < 1.6) n = norm(n[0], -sy * (1.6 - v) * 0.45, n[2]);
    tone[y * N + x] = toneOf(n);
  }
  // the seams: where the rim, the boss or the plaque stands up off the face, a dark line on the face at its foot (the lower side
  // in shadow, the upper side a step darker)
  const at = (x: number, y: number): number => (x < 0 || y < 0 || x >= N || y >= N ? -1 : part[y * N + x]);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x;
    if (part[i] !== 0) continue;
    const raised = [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)].some((p) => p === 1 || p === 2);
    if (raised) tone[i] = Math.max(0, tone[i] - 1);
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x;
    if (part[i] < 0) continue;
    // a shadow cast down and to the right by what stands up (the rim's inner foot above or left of the face; the plaque on the rim)
    const castBy = (p: number): boolean => [at(x - 1, y - 1), at(x - 1, y), at(x, y - 1)].includes(p);
    if (part[i] === 0 && (castBy(1) || castBy(2))) tone[i] = Math.max(0, tone[i] - 1);
    if (part[i] === 1 && castBy(4) && tone[i] >= 0) tone[i] = Math.max(0, tone[i] - 1);
    const t = tone[i];
    out.set(x, y, t <= -2 ? PLAQUE_FACE[-2 - t] : part[i] === 3 ? [S[2], S[3], S[4]][t] : STONE5[t]);
  }
  // WEAR: chips and pits in the face and the rim, each a dark pixel with its lit lip under it to the right
  for (let j = 0; j < 9; j++) {
    const a = (0.12 + 1.35 * h3(j, k, 31)) ;
    const r = QUARTER.boss + 2 + (R - QUARTER.boss - 3) * h3(j, k, 37);
    const x = Math.floor(cx + sx * Math.cos(a) * r);
    const y = Math.floor(cy + sy * Math.sin(a) * r);
    if (at(x, y) !== 0 && at(x, y) !== 1) continue;
    out.set(x, y, S[2]);
    if (at(x + 1, y + 1) === 0 || at(x + 1, y + 1) === 1) out.set(x + 1, y + 1, S[6]);
  }
  // ITS RUNE, cut in the middle of its face, twice the slab's size: each stroke a groove two pixels wide, its floor dark, its
  // upper and left walls in deep shadow, its lip below and to the right catching the light
  const rows = RUNES[RUNE_OF[k]];
  const used = rows.filter((r) => r.includes('#')).length;
  const rw = 10;
  const rh = used * 2;
  // (the rune's middle: along the quarter's diagonal, a little past halfway out from the boss to the rim)
  const mr = (QUARTER.boss + (R - QUARTER.rim)) * 0.5 + 1;
  const mx = cx + sx * mr * Math.SQRT1_2;
  const my = cy + sy * mr * Math.SQRT1_2;
  const rx0 = Math.round(mx - rw / 2);
  const ry0 = Math.round(my - rh / 2);
  const cut = new Uint8Array(N * N);
  for (let j = 0; j < used; j++) for (let i = 0; i < 5; i++) {
    if (rows[j][i] !== '#') continue;
    for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) {
      const x = rx0 + i * 2 + a;
      const y = ry0 + j * 2 + b;
      if (at(x, y) === 0) cut[y * N + x] = 1;
    }
  }
  const isCut = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < N && y < N && cut[y * N + x] === 1;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (isCut(x, y)) {
      out.set(x, y, !isCut(x, y - 1) || !isCut(x - 1, y) ? S[0] : S[1]);
    } else if (at(x, y) === 0 && (isCut(x - 1, y) || isCut(x, y - 1)) && !isCut(x + 1, y + 1)) {
      out.set(x, y, S[6]);
    }
  }
  // HIS BOSS'S MARK, inlaid in the plaque (5 x 5)
  const mk = MARKS[k];
  const bx = Math.round(plq[0] - 2.5);
  const by = Math.round(plq[1] - 2.5);
  mk.rows.forEach((row, j) => {
    for (let i = 0; i < 5; i++) {
      const c = row[i];
      if (c === '.' || c === 'o') continue;
      if (at(bx + i, by + j) === 4) out.set(bx + i, by + j, mk.col[c]);
    }
  });
  // the seam of ink round the whole, and the rarity's rim round that, as every item picture has (art/items_a.ts paint)
  out.outline(INK);
  out.outline(RARITY_COLOR[rarity]);
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE TABLET IN THE BENCH'S SOCKET: laid over art/shaft_props.ts paintSocketSlab at the slab's anchor. Its picture is taller than
// the slab's (68 x 76, the anchor (34, 58)) by the room the runes rise into above it: 68 x 140, the anchor (34, 122).

/** The slab's anchor in its own picture (paintSocketSlab's). */
const SLAB = { w: 68, h: 76, ox: 34, oy: 58 } as const;
/** This picture: the slab's breadth, and room above it for what rises. */
export const SOCKET_PIC = { w: 68, h: 140, ox: 34, oy: 122 } as const;
/** How many frames of the four burning (30 a second): they kindle one by one (floor 5 first), then the moment (the boss in the
 * middle flares, a shaft of the friend's light goes up, the four runes are torn up out of the stone and climb it), then they burn on
 * (the four runes held turning about the shaft over the bench: these frames go round). */
export const SOCKET_LIT = { kindle: 28, flare: 26, burn: 48 } as const;
export const SOCKET_LIT_FRAMES = SOCKET_LIT.kindle + SOCKET_LIT.flare + SOCKET_LIT.burn;

export interface SocketPiece {
  px: Px;
  ox: number;
  oy: number;
  lights?: Light[];
}

/** The tablet's face in the socket: tones for its parts. */
const SET = { face: S[7], faceLo: S[6], rimHi: '#d4c6b2', rim: CREST, rimLo: S[5], seam: S[2], cut: S[3], boss: CREST, lip: '#1c161e' } as const;
/** Each quarter's rune at the socket's size, a short stroke in the middle of its wedge (a quarter there is about ten picture pixels
 * by three: the rune itself is the item picture's and the risen one's): picture pixels about the wedge's middle. */
const TINY: [number, number][][] = [
  [[-1, 0], [0, 0], [1, 0], [0, -1]], // the back wedge (floor 5)
  [[0, 0], [1, 0], [0, -1], [1, 1]], // the right wedge (floor 10)
  [[-1, 0], [0, 0], [1, 0], [0, 1]], // the near wedge (floor 15)
  [[-1, 0], [0, 0], [-1, -1], [0, 1]], // the left wedge (floor 20)
];

/**
 * The quarters he has set (held[k]), lying in the socket a little below the slab's top, each where it sits in the whole (its
 * quarters as the grid lies, the tablet's top toward the back: so its seams run as the socket's ribs). `lit`: -1 dark; else a frame
 * of the four burning, once all four are in (0 ... SOCKET_LIT_FRAMES - 1; past that the burning frames go round).
 */
export function paintSocketTablet(held: readonly boolean[], lit = -1): SocketPiece {
  const W = SOCKET_PIC.w;
  const H = SOCKET_PIC.h;
  const lift = SOCKET_PIC.oy - SLAB.oy;
  const disc = new Px(W, H);
  const back = new Px(W, H);
  const front = new Px(W, H);
  const mx = SOCKET_PIC.ox + BENCH_SOCKET.x * GRAIN;
  const my = SOCKET_PIC.oy + BENCH_SOCKET.y * GRAIN + 1; // (a picture pixel down: set into the hollow)
  const rx = BENCH_SOCKET.rx * GRAIN - 0.6;
  const ry = BENCH_SOCKET.ry * GRAIN - 0.3;
  const all = held.length === 4 && held.every(Boolean);
  const on = all && lit >= 0;
  const f = !on ? -1 : lit < SOCKET_LIT_FRAMES ? lit : SOCKET_LIT.kindle + SOCKET_LIT.flare + ((lit - SOCKET_LIT.kindle - SOCKET_LIT.flare) % SOCKET_LIT.burn);
  /** When rune k kindles (its frame), and how far it has (0 dark ... 1 burning). */
  const kindleAt = (k: number): number => 2 + k * 6;
  const kindled = (k: number): number => (!on ? 0 : Math.max(0, Math.min(1, (f - kindleAt(k)) / 3)));
  const fr = on ? f - SOCKET_LIT.kindle : -1; // frames since the moment
  const moment = fr >= 0 && fr < SOCKET_LIT.flare;
  // THE DISC: a point on it is found from the screen by the grid (its axes the screen's diagonals)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sxp = x + 0.5 - mx;
    const syp = y + 0.5 - my;
    const e = Math.hypot(sxp / rx, syp / ry);
    if (e >= 1) continue;
    const gx = sxp / rx + syp / ry;
    const gy = syp / ry - sxp / rx;
    const k = gx < 0 && gy < 0 ? 0 : gx >= 0 && gy < 0 ? 1 : gx >= 0 && gy >= 0 ? 2 : 3;
    if (!held[k]) continue;
    const seam = Math.abs(gx) < 0.12 || Math.abs(gy) < 0.12;
    let c: string;
    if (e < 0.3) c = on && fr >= 0 ? (e < 0.14 || moment ? SPARK[4] : SPARK[3]) : syp < 0 ? SET.rimHi : SET.boss;
    else if (e > 0.7) c = syp < -ry * 0.25 ? (sxp < 0 ? SET.rimHi : SET.rim) : syp > ry * 0.3 ? SET.rimLo : SET.rim;
    else if (seam) c = all && on && fr >= 0 ? SPARK[2] : SET.seam;
    else if (e > 0.62 && syp < -ry * 0.3) c = SET.faceLo; // (the rim's shadow on the face, under its far side)
    else c = SET.face;
    disc.set(x, y, c);
  }
  // each set quarter's rune, a few pixels of it in its middle: cut dark; burning, the friend's cyan, white as it kindles
  const runeAt: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([a, b]) => [Math.round(mx + a * rx * 0.56 - 0.5), Math.round(my + b * ry * 0.56 - 0.5)]);
  held.forEach((h, k) => {
    if (!h) return;
    const [ax, ay] = runeAt[k];
    const kk = kindled(k);
    const hot = on && f - kindleAt(k) >= 0 && f - kindleAt(k) < 4;
    for (const [dx, dy] of TINY[k]) if (disc.has(ax + dx, ay + dy)) disc.set(ax + dx, ay + dy, kk <= 0 ? SET.cut : hot ? SPARK[4] : SPARK[3]);
    // (as it kindles: a burst of sparks thrown up out of it)
    const t = f - kindleAt(k);
    if (on && t >= 0 && t < 8) {
      for (let j = 0; j < 6; j++) {
        const a = -Math.PI / 2 + (j - 2.5) * 0.45;
        const d = 2 + t * (1.3 + (j % 3) * 0.35);
        const fall = t * t * 0.08;
        front.set(Math.round(ax + Math.cos(a) * d * 1.4), Math.round(ay - 1 + Math.sin(a) * d + fall), t < 3 ? SPARK[4] : t < 6 ? SPARK[3] : SPARK[2]);
      }
    }
  });
  // the hollow's lip round the disc: dark on its far side (it sits down in the stone), the light caught on its near edge
  const out = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = disc.get(x, y);
    if (!c) continue;
    if (!disc.has(x, y - 1) && y < my) out.set(x, y, SET.lip);
    else out.set(x, y, c);
  }
  const lights: Light[] = [];
  if (on) {
    held.forEach((_, k) => {
      const kk = kindled(k);
      if (kk > 0) lights.push({ x: runeAt[k][0] / GRAIN, y: runeAt[k][1] / GRAIN, r: 4 + kk * 3, color: SPARK[2], a: 0.38 * kk });
    });
  }
  if (fr >= 0) {
    // THE MOMENT. The shaft of light: up out of the boss, its foot as broad as the boss, white at its heart; it shoots up in the
    // first frames, holds blazing, then thins to a thread that burns on
    const top0 = my - 4;
    const height = Math.min(1, (fr + 1) / 4) * (moment ? my - 4 : (my - 4) * 0.62);
    const broad = moment ? (fr < 8 ? 3.4 : 3.4 - ((fr - 8) / (SOCKET_LIT.flare - 8)) * 2.2) : 1.2;
    for (let y = Math.round(top0 - height); y <= top0; y++) {
      const up = (top0 - y) / Math.max(1, my - 6);
      const hw = broad * (1 - up * 0.45) + (moment && (y + fr) % 7 === 0 ? 1 : 0);
      for (let x = Math.round(mx - hw - 1); x <= Math.round(mx + hw); x++) {
        const d = Math.abs(x + 0.5 - mx) / Math.max(0.6, hw);
        if (d > 1) continue;
        const c = d < 0.35 && (moment || up < 0.6) ? SPARK[4] : d < 0.7 ? SPARK[3] : SPARK[2];
        if (!moment && (y + Math.floor(fr / 2)) % 5 === 0 && d > 0.3) continue; // (burning on, it shimmers)
        // (its top frays out into the dark: broken, then sparks, never a cut-off edge)
        const fray = (y - (top0 - height)) / Math.max(1, height);
        if (fray < 0.22 && h3(x, y + fr * 3, 41) > fray / 0.22) continue;
        back.set(x, y, fray < 0.22 ? SPARK[2] : c);
      }
    }
    // the flare: two rings of the friend's light run out over the slab's top from the boss, one after the other, thinning
    for (const [start, tone] of [[0, SPARK[3]], [5, SPARK[2]]] as const) {
      const t = fr - start;
      if (t < 0 || t > 11) continue;
      const rr = 3 + t * 2.3;
      const n = 64;
      for (let a = 0; a < n; a++) {
        if (t > 6 && a % 2) continue;
        const th = (a / n) * Math.PI * 2;
        const x = Math.round(mx + Math.cos(th) * rr * 2);
        const y = Math.round(my + Math.sin(th) * rr);
        (Math.sin(th) < 0 ? back : front).set(x, y, t < 3 ? SPARK[4] : tone);
      }
    }
    // a fountain of sparks thrown up and out of the tablet as it wakes, falling back, thinning as they cool
    if (fr < 22) {
      for (let j = 0; j < 26; j++) {
        const a = -Math.PI / 2 + (h3(j, 3, 51) - 0.5) * 2.4;
        const sp = 1.4 + 2.2 * h3(j, 5, 53);
        const t = fr - (j % 4);
        if (t < 0) continue;
        const x = mx + Math.cos(a) * sp * t * 1.7;
        const y = my - 3 + Math.sin(a) * sp * t + 0.16 * t * t;
        if (t > 16 && h3(j, t, 57) < (t - 16) / 6) continue;
        (Math.sin(a) < -0.2 || x < mx ? back : front).set(Math.round(x), Math.round(y), t < 4 ? SPARK[4] : t < 10 ? SPARK[3] : SPARK[2]);
      }
    }
    // THE FOUR RUNES, torn up out of the stone, each from its own quarter, white hot, and up the shaft in a climbing turn; then held
    // turning about it over the bench, burning (the near side of their turn laid in front of the shaft, the far side behind it)
    const rise = Math.min(1, fr / 16);
    const ease = 1 - (1 - rise) ** 3;
    for (let k = 0; k < 4; k++) {
      const rows = RUNES[RUNE_OF[k]];
      const from = Math.atan2(runeAt[k][1] - my, (runeAt[k][0] - mx) / 2);
      const turn = from + ease * Math.PI * 1.5 + Math.max(0, fr - 16) * 0.055;
      const orbit = 4 + 11 * ease;
      const ex = mx + Math.cos(turn) * orbit * 1.15;
      const ey = runeAt[k][1] + (my - 30 - runeAt[k][1]) * ease + Math.sin(turn) * orbit * 0.42 + (fr > 16 ? Math.sin(fr * 0.16 + k * 1.6) * 1.2 : 0);
      const near = Math.sin(turn) > 0;
      const layer = near ? front : back;
      const hot = fr < 6;
      const flick = !hot && (fr + k * 5) % 13 === 0;
      const tone = hot || flick ? SPARK[4] : SPARK[3];
      const x0 = Math.round(ex - 2.5);
      const y0 = Math.round(ey - 4.5);
      for (let j = 0; j < rows.length; j++) for (let i = 0; i < 5; i++) if (rows[j][i] === '#') {
        layer.set(x0 + i, y0 + j, tone);
        // (an edge of the deeper cyan round each stroke, below and to the right, so it reads over the light stone)
        if (!(rows[j + 1]?.[i] === '#')) layer.set(x0 + i, y0 + j + 1, layer.get(x0 + i, y0 + j + 1) ?? SPARK[0]);
      }
      // (as it climbs, a trail of sparks left under it)
      if (rise < 1) for (let s2 = 1; s2 <= 3; s2++) layer.set(x0 + 2 + ((k + s2) % 3) - 1, y0 + 9 + s2 * 2 + (fr % 2), s2 === 1 ? SPARK[3] : SPARK[2]);
      lights.push({ x: ex / GRAIN, y: ey / GRAIN, r: 6, color: SPARK[2], a: hot ? 0.45 : 0.3 });
    }
    lights.push({ x: mx / GRAIN, y: (my - 6) / GRAIN, r: moment ? 22 + (fr % 2) * 2 : 15 + (f % 2), color: SPARK[2], a: moment ? 0.55 : 0.36 });
  }
  void lift;
  // the shaft and the far side behind the disc's near edge? No: the disc lies under everything that rises; the far side of the
  // runes' turn goes behind the shaft, the near side in front
  const pic = new Px(W, H);
  for (const layer of [out, back, front]) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = layer.get(x, y);
    if (c) pic.set(x, y, c);
  }
  return { px: pic, ox: SOCKET_PIC.ox, oy: SOCKET_PIC.oy, lights };
}
