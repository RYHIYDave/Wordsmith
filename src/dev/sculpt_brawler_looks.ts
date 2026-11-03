// THE BRAWLER REWORKED: TWENTY ROUGH LOOKS TO CHOOSE FROM (the art chat, 2 Nov 2026). MOCK-UPS; NOTHING OF THE GAME
// IMPORTS IT (tests/brawler_looks.test.ts).
//
// His words, 2 Nov 2026, 19:59: “Or we might have to do a rework of the brawler.  He’s not really what I’m looking for”;
// asked what isn't right: “I think it can go two ways.  More of an old timey boxer.  Longer wind ups for hits so you have
// time for inputting combos.  Or an actual fighter, tap for punch, hold for kick, and swipe for jump to insert the swipe
// into the combo for jump kicks or flying uppercuts”; asked how to decide: “Give me some possible looks, 10 for each”; and,
// by 21:06: “Just some rough ideas, don’t need some fully animated sprites or whatever”.
//
// So: ten old-timey bare-knuckle boxers and ten fighters who punch, kick and leap, each a man of his own, ROUGH: standing,
// one view (the game's three-quarter), sculpted as the classes are (dev/sculpt.ts: one body of flesh, muscle melted into
// muscle, not circles and squares), on the heroes' bones; his fists big (his “His hands are tiny compared to his body”).
// Original designs only.

import type { Ramp } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { HEAD_B } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { add, buildOf, cross, lerp3, mul, norm, solve, standing, sub } from '../art/skeleton';
import type { Bones, Build, Posed, Shape, V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Cone, Drawn, Ell } from './sculpt';
import { BLACKHIDE, BRASS, CHAR, HIDE, RED, SKIN_W, WRAP, boxerStance, farSide, faceAt, manBody, manHead, onHead, shadeOf, tailorFor } from './sculpt_classes';
import type { Who } from './sculpt_classes';

// ---------------------------------------------------------------------------------------------
// Colours (none of them glows; nothing the enemy's pink)

const SKIN_PALE: Ramp = ['#3a2030', '#74464e', '#c08478', '#ecb49c', '#ffe0c8'];
const SKIN_OLIVE: Ramp = ['#2a1a20', '#5a3a34', '#946048', '#c08a64', '#e8b88a'];
const SKIN_BROWN: Ramp = ['#1e1018', '#40241e', '#6c402c', '#9a6440', '#c48c5c'];
const SKIN_DEEP: Ramp = ['#120a10', '#28160f', '#46281c', '#6c4230', '#946248'];

const H_BLACK: Ramp = ['#08060c', '#16121e', '#2a2436', '#443a52', '#5e5270'];
const H_BROWN: Ramp = ['#140a08', '#2e1a10', '#4e2e1a', '#74482a', '#9a663a'];
const H_GREY: Ramp = ['#2a2a36', '#4a4a5a', '#7a7a8c', '#aeaebe', '#dcdce6'];
const H_RED: Ramp = ['#2a0c06', '#5a1c0c', '#963414', '#c8582a', '#ec8646'];
const H_SAND: Ramp = ['#3a2a14', '#6a4e24', '#a8803a', '#d4ac5a', '#f4d68a'];

const CREAM: Ramp = ['#4a3a34', '#7a6658', '#b8a48c', '#e4d4b4', '#fff4dc'];
const NAVY: Ramp = ['#060a1c', '#0e1634', '#1c2a5a', '#30468a', '#4c66b4'];
const GREEN: Ramp = ['#06140c', '#0e2616', '#1a4226', '#2c6a3a', '#4a9454'];
const OCHRE: Ramp = ['#2a1606', '#4e2c0c', '#8a5414', '#c08024', '#e8aa46'];
const TEAL: Ramp = ['#041818', '#0a2c2c', '#14484a', '#226c6a', '#3a948e'];
const MAROON: Ramp = ['#1c060a', '#340c12', '#561820', '#7c2a2c', '#a4463e'];
const FLANNEL: Ramp = ['#2a0808', '#501210', '#8a2218', '#be3a22', '#e4683a'];
const GREY_C: Ramp = ['#1a1a24', '#30303e', '#50505e', '#787886', '#a4a4b0'];
const TARTAN: Ramp = ['#0a1410', '#14261c', '#24402c', '#386040', '#58845a'];
const INK_BLUE = '#26346a';
const OXBLOOD: Ramp = ['#1e080a', '#3e1012', '#6a2018', '#9a3a24', '#c46038'];

const sk = (r: Ramp, k: number): string => shadeOf(r, k);

// ---------------------------------------------------------------------------------------------
// What each look is

type Hair = 'spikes' | 'bald' | 'fringe' | 'slick' | 'crop' | 'curly' | 'topknot' | 'crest' | 'ponytail' | 'cap' | 'wrap' | 'tied';
type Tash = 'none' | 'handlebar' | 'walrus' | 'pencil' | 'drooping';
type Beard = 'none' | 'chops' | 'full' | 'goatee' | 'stubble' | 'forked' | 'short';
type Fists = 'wraps' | 'bare' | 'gloves' | 'straps' | 'tape';

export interface BrawlerLook2 {
  /** Its number on his sheet, and which way the rework goes. */
  n: number;
  kind: 'boxer' | 'fighter';
  name: string;
  /** One line saying who he is (plain words, for the owner). */
  line: string;
  tall: number;
  head: number;
  shape: Shape;
  bulk: number;
  skin: Ramp;
  hair: Hair;
  hairRamp?: Ramp;
  tash: Tash;
  beard: Beard;
  whiskers?: Ramp;
  ears?: 'cauli';
  nose?: 'broken';
  brow?: string;
  marks?: { scar?: boolean; patch?: boolean; tattoos?: boolean; freckles?: boolean; shinScar?: boolean; stubble?: boolean };
  fists: Fists;
  fistRamp?: Ramp;
  fistK: number;
  /** His stance: the old ring's upright stance, or a fighter's, light on his feet (a knee lifted to kick). */
  stance: 'classic' | 'tucked' | 'reach' | 'fight' | 'chamber' | 'low' | 'tall';
  pose?: Partial<Bones>;
  /** HIS KICK, a still of it (the better three, his “Show me a better 7, 2, and 1 of the fighters”): the stance changed so. */
  kick?: (t: number) => Partial<Bones>;
  kickName?: string;
  /** A close pass (the better three): his mouth, his muscles drawn, an earring, a brow of three pixels. */
  close?: { mouth?: string; abs?: boolean; earring?: Ramp; browW?: number; cheekScar?: boolean; grey?: boolean; patchSide?: number };
  dress: (k: Kit) => void;
}

// ---------------------------------------------------------------------------------------------
// Stances

function stanceOf(look: BrawlerLook2, B: Build, kick = false): Bones {
  const t = B.tall / 57;
  const base = boxerStance(B);
  let q: Bones;
  if (look.stance === 'classic') {
    // THE OLD RING'S STANCE: upright, leaning back a little, the lead fist held well out at his chest, the rear across his
    // body by his breastbone, chin tucked
    q = { ...base, pz: -0.9 * t, bend: 0, pitch: -4, faceUp: -5, lhx: 12 * t, lhy: 1.0 * t, lhz: -1.6 * t, le: 44, rhx: 6.6 * t, rhy: 2.2 * t, rhz: -3.8 * t, re: 40 };
  } else if (look.stance === 'tucked') {
    // both fists up high before his face, elbows in, chin buried behind his lead shoulder
    q = { ...base, bend: 10, faceUp: -7, lhx: 8.6 * t, lhy: 0.4 * t, lhz: 1.6 * t, le: 30, rhx: 6.2 * t, rhy: -0.4 * t, rhz: 2.0 * t, re: 26 };
  } else if (look.stance === 'reach') {
    // the long lead arm reaching out level, the rear fist cocked by his jaw
    q = { ...base, pitch: -2, faceUp: -3, lhx: 13 * t, lhy: 1.4 * t, lhz: 0.4 * t, le: 52, rhx: 5.6 * t, rhy: -1.8 * t, rhz: 2.2 * t, re: 34 };
  } else if (look.stance === 'tall') {
    // a big man standing tall, chest out, both fists out before him at chest height, rolling
    q = { ...base, pz: -0.6 * t, bend: -2, pitch: -5, faceUp: -2, lhx: 11 * t, lhy: 0.8 * t, lhz: -2.2 * t, le: 46, rhx: 9.4 * t, rhy: -0.6 * t, rhz: -2.6 * t, re: 44 };
  } else {
    // A FIGHTER'S STANCE: side-on, his knees bent, up on the ball of his back foot, his hands up by his face
    q = {
      ...base,
      pz: -3.0 * t, yaw: -30, twist: 12, bend: 6, faceTurn: -26, faceUp: -1,
      lfx: 5.8 * t, lfy: 3.6 * t, lft: 24, lk: 26, lfp: 4, lfz: 0,
      rfx: -5.2 * t, rfy: -3.6 * t, rft: -28, rk: -20, rfp: 30, rfz: 1.3 * t,
      lhIn: 0, lhx: 8.4 * t, lhy: 0.8 * t, lhz: 2.4 * t, le: 30,
      rhIn: 0, rhx: 5.6 * t, rhy: -0.8 * t, rhz: 3.2 * t, re: 26,
    };
    if (look.stance === 'chamber') {
      // his lead knee drawn up to kick, his weight on the ball of his back foot
      q = { ...q, pz: -1.6 * t, lfx: 4.6 * t, lfy: 2.4 * t, lfz: 10 * t, lfp: 36, lk: 20, rfx: -3.4 * t, rfy: -2.6 * t, rfz: 0.8 * t, rfp: 20 };
    } else if (look.stance === 'low') {
      // low and wide, a wrestler's crouch, his hands out before him
      q = { ...q, pz: -5.2 * t, bend: 18, faceUp: 6, lfx: 6.6 * t, lfy: 5.6 * t, rfx: -5.6 * t, rfy: -5.6 * t, rfp: 10, rfz: 0.4 * t, lk: 34, rk: -30, lhx: 10 * t, lhy: 2.4 * t, lhz: -1.0 * t, le: 20, rhx: 9 * t, rhy: -2.6 * t, rhz: -0.6 * t, re: 18 };
    }
  }
  return { ...q, ...(look.pose ?? {}), ...(kick && look.kick ? look.kick(t) : {}) };
}

// ---------------------------------------------------------------------------------------------
// The kit a look is dressed with

export interface Kit {
  sc: Sculpt;
  w: Who;
  t: ReturnType<typeof tailorFor>;
  /** Tights or trousers from the hip to `to` (1 the knee, 2 the ankle), `loose` off the leg, `high` up over the belly; stripes. */
  legs(ramp: Ramp, to: number, loose: number, high?: number, stripes?: 'down' | 'round' | 'side' | null, stripe?: Ramp, cloth?: { folds?: boolean; frayed?: boolean }): void;
  /** Wraps round the arch of each foot and up round the ankle, the toes and heel bare (a fighter's foot wraps). */
  footWraps(ramp: Ramp): void;
  /** Leather bracers laced on each forearm. */
  bracers(ramp: Ramp): void;
  /** An open sleeveless vest, its fronts hanging apart over his bare chest. */
  openVest(ramp: Ramp, trim?: Ramp): void;
  /** A gathered fold of cloth over each knee and at each ankle where loose trousers are bound (they hang, not tubes). */
  bagginess(ramp: Ramp, at: number): void;
  /** Cloth over the trunk: a vest (sleeveless, `neck` how far below the root of the neck it is cut), stripes round it. */
  top(ramp: Ramp, neck: number, stripes?: boolean, stripe?: Ramp, shoulders?: boolean, sleeves?: 'none' | 'short' | 'long'): void;
  sash(ramp: Ramp, tails?: boolean): void;
  belt(ramp: Ramp, tall: number, plate?: Ramp, studs?: boolean): void;
  braces(ramp: Ramp, hanging?: boolean): void;
  boots(ramp: Ramp, high: boolean, laces?: Ramp | null): void;
  /** Stockings or socks from the knee (or `from`) to the ankle. */
  stockings(ramp: Ramp, from?: number, stripes?: boolean): void;
  wraps(ramp: Ramp, from: number, feet: boolean): void;
  bareFeet(sandal?: Ramp): void;
  capOnFloor(ramp: Ramp): void;
  neckerchief(ramp: Ramp): void;
  beads(ramp: Ramp): void;
  armBand(ramp: Ramp, side: 'L' | 'R', at: number): void;
  kneePads(ramp: Ramp): void;
  headband(ramp: Ramp, tails: boolean): void;
  kilt(ramp: Ramp): void;
  tunic(ramp: Ramp, trim: Ramp): void;
}

const WOODB: Ramp = ['#1a0c08', '#341a10', '#5a3018', '#84502a', '#aa7440'];

/** One of the twenty, sculpted standing, in a view (`turn`: truly turned, degrees to his left). */
export function sculptLook(look: BrawlerLook2, view: GameView = 'front', turn = 0, kick = false): Drawn {
  const B = buildOf(look.tall, HEAD_B * look.head, look.shape);
  const s = solve(B, stanceOf(look, B, kick) as Posed);
  const cl = look.close ?? {};
  const w: Who = { s, B, view, spin: turn };
  const sc = new Sculpt();
  sc.spin = turn;
  const [f, l, u] = s.chest;
  const SK = look.skin;
  const mk = look.marks ?? {};
  const farArm = (piece: string): boolean => (piece.endsWith('L') ? farSide(w, s.elbowL) : piece.endsWith('R') ? farSide(w, s.elbowR) : false);
  const skin = sc.mat({
    ramp: SK,
    paint: (h) => {
      const far = farArm(h.prim.piece) ? 1 : 0;
      const tg = h.prim.tag ?? '';
      if (h.prim.piece === 'head') {
        const c = faceAt(w, h);
        if (c) return c === SKIN_W[1] ? sk(SK, 1) : sk(SK, Math.max(1, h.tone - 1));
        const [ff, lf, fu] = onHead(w, h.p);
        if (mk.stubble && tg === 'jaw' && fu < -0.42 && ff > 0.0) return sk(SK, h.tone - 1 - ((h.x + h.y) % 2));
        if (mk.freckles && ff > 0.5 && fu > -0.3 && fu < 0.1 && Math.abs(lf) > 0.18 && Math.abs(lf) < 0.6 && (h.x * 3 + h.y) % 4 === 0) return sk(OCHRE, 2);
        if (tg !== 'neck' && ff > 0.42 && fu < 0.3) return sk(SK, h.tone + 1);
      }
      // tattoos up his arms and on his chest: sailor's ink, dark blue
      if (mk.tattoos && h.prim.piece.startsWith('arm') && (tg === 'bicep' || tg === 'upper' || tg === 'fore' || tg === 'foreBulge' || tg === 'tricep')) {
        // (a sleeve of ink: bands and a hatch, not spots)
        if ((h.x + 2 * h.y) % 5 < 2 || (tg === 'fore' && h.y % 4 === 0)) return h.tone >= 2 ? INK_BLUE : '#1a2048';
      }
      if (mk.tattoos && tg === 'pec' && (h.x + 2 * h.y) % 7 < 2) return INK_BLUE;
      if (cl.abs && h.prim.piece === 'torso' && h.prim.k !== 'cone') {
        const b = onBall(h.prim as Ell, h.p);
        if (tg === 'belly' && b[0] > 0.3) {
          // the belly's muscles: a groove down the middle, two across, the light on each
          if (Math.abs(b[1]) < 0.09 && b[2] > -0.75) return sk(SK, h.tone - 1);
          if ((Math.abs(b[2] - 0.15) < 0.07 || Math.abs(b[2] + 0.3) < 0.07) && Math.abs(b[1]) < 0.42) return sk(SK, h.tone - 1);
        }
        // the foot of each breast muscle, and the groove of the spine down his back
        if (tg === 'pec' && b[2] < -0.72 && b[0] > 0) return sk(SK, h.tone - 1);
        if ((tg === 'ribs' || tg === 'belly') && b[0] < -0.75 && Math.abs(b[1]) < 0.08) return sk(SK, h.tone - 1);
      }
      if (mk.shinScar && h.prim.piece === 'legL' && (tg === 'shin' || tg === 'calf') && (h.x + h.y) % 4 === 0) return sk(SK, h.tone + 1);
      return far ? sk(SK, h.tone - 1) : null;
    },
  });
  manBody(sc, w, skin, look.bulk);
  manHead(sc, w, skin);
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const at = (fw: number, lf: number, up: number): V3 => add(s.head, add(mul(hf, R[0] * fw), add(mul(hl, R[1] * lf), mul(hu, R[2] * up))));
  const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  /** Keep only what is above a slanting line round the head (a hairline): `level` and `slope` as shares of the head. */
  const above = (slope: number, level: number): { n: V3; o: number } => {
    const m = norm(sub(hu, mul(hf, slope)));
    return { n: mul(m, -1), o: -dot(m, s.head) - level * R[2] };
  };
  const below = (slope: number, level: number): { n: V3; o: number } => {
    const m = norm(sub(hu, mul(hf, slope)));
    return { n: m, o: dot(m, s.head) + level * R[2] };
  };

  // HIS EARS AND NOSE
  if (look.ears === 'cauli') for (const side of [1, -1]) {
    sc.ell(skin, 'head', at(-0.1, side * 0.98, 0.02), [mul(hf, 1.0), mul(hl, 0.6), mul(hu, 1.25)], 0.5, { tag: 'cauli' });
    sc.ell(skin, 'head', at(-0.02, side * 1.06, 0.2), [mul(hf, 0.6), mul(hl, 0.45), mul(hu, 0.6)], 0.3, { tag: 'cauli' });
  }
  if (look.nose === 'broken') {
    sc.ell(skin, 'head', at(0.98, 0.16, 0.02), [mul(hf, 0.7), mul(hl, 0.75), mul(hu, 0.55)], 0.5, { tag: 'nose' });
    sc.ell(skin, 'head', at(1.04, -0.1, -0.12), [mul(hf, 0.55), mul(hl, 0.8), mul(hu, 0.5)], 0.5, { tag: 'nose' });
  }

  // HIS HAIR
  const HR = look.hairRamp ?? H_BLACK;
  const hairM = sc.mat({
    ramp: HR,
    meld: true,
    paint: (h) => {
      const [ff, lf, fu] = onHead(w, h.p);
      if (look.hair === 'slick' && Math.abs(lf) < 0.07 && fu > 0.2 && ff > -0.3) return sk(HR, 0);
      if (look.hair === 'cap' || look.hair === 'wrap') return (h.x + Math.floor(h.y / 2)) % 3 === 0 ? sk(HR, h.tone - 1) : null;
      const strand = (look.hair === 'slick' ? (h.x * 2 + h.y) % 5 : (h.x + Math.floor(h.y / 2)) % 4) === 0;
      return sk(HR, h.tone - (strand ? 1 : 0) + (fu > 0.55 && ff > -0.2 ? 1 : 0));
    },
  });
  const skullC = at(-0.1, 0, -0.04);
  const shell = (th: number, cuts: { n: V3; o: number }[], tag = 'hair', mat = hairM): void => {
    sc.ell(mat, 'head', skullC, [mul(hf, R[0] * 0.88 + th), mul(hl, R[1] * 0.96 + th), mul(hu, R[2] * 0.74 + th)], 0.6, { cuts, tag });
  };
  switch (look.hair) {
    case 'bald':
      break;
    case 'fringe':
      // a bald pate, a fringe of hair round the back and sides over the ears
      shell(0.45, [above(0.0, -0.5), below(0.0, 0.25), { n: mul(hf, 1), o: dot(hf, s.head) + R[0] * 0.15 }]);
      break;
    case 'slick':
      // slicked flat and parted down the middle, a lick of it over each temple
      shell(0.32, [above(0.4, 0.22)]);
      for (const side of [1, -1]) sc.ell(hairM, 'head', at(0.52, side * 0.42, 0.62), [mul(hf, 1.0), mul(hl, 1.2), mul(hu, 0.55)], 0.5, { tag: 'hair' });
      break;
    case 'crop':
      shell(0.4, [above(0.42, 0.1)]);
      // a flat top
      sc.box(hairM, 'head', at(-0.05, 0, 0.72), [mul(hf, R[0] * 0.8), mul(hl, R[1] * 0.82), mul(hu, 0.8)], 0.6, 0.8, { tag: 'hair' });
      break;
    case 'curly':
      shell(0.55, [above(0.45, 0.08)]);
      for (const [fw, lf, up] of [[0.55, 0.3, 0.6], [0.6, -0.3, 0.6], [0.25, 0.55, 0.72], [0.25, -0.55, 0.72], [0.15, 0, 0.88], [-0.3, 0.45, 0.7], [-0.3, -0.45, 0.7], [-0.5, 0, 0.6], [0.55, 0, 0.72]] as const) {
        sc.ell(hairM, 'head', at(fw, lf, up), [mul(hf, 1.15), mul(hl, 1.15), mul(hu, 1.0)], 0.4, { tag: 'hair' });
      }
      break;
    case 'topknot':
      // shaved but for a knot of hair on his crown, tied with a cord
      shell(0.12, [above(0.42, 0.1)]);
      sc.ell(hairM, 'head', at(-0.25, 0, 0.98), [mul(hf, 1.3), mul(hl, 1.3), mul(hu, 1.1)], 0.6, { tag: 'hair' });
      sc.ell(hairM, 'head', at(-0.32, 0, 1.3), [mul(hf, 1.0), mul(hl, 1.0), mul(hu, 1.0)], 0.6, { tag: 'hair' });
      break;
    case 'crest':
      // the sides shaved, a crest of hair down the middle from brow to nape
      for (let i = 0; i < 5; i++) {
        const a = -0.3 + i * 0.32;
        sc.ell(hairM, 'head', at(0.55 - i * 0.36, 0, 0.76 - Math.abs(a) * 0.3 - (i > 3 ? 0.2 : 0)), [mul(hf, 1.3), mul(hl, 0.75), mul(hu, 1.25)], 0.8, { tag: 'hair' });
      }
      break;
    case 'spikes': {
      // the sides shaved to a shadow, a tall crest of stiffened hair in spikes from his brow to the nape, swept back
      shell(0.1, [above(0.42, 0.12)], 'shadow', sc.mat({ ramp: SK, paint: (h) => ((h.x + h.y) % 2 === 0 ? sk(HR, 2) : sk(SK, h.tone - 1)) }));
      const n = 6;
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const fw = 0.62 - k * 1.45;
        const up = 0.72 - Math.max(0, -fw - 0.2) * 0.5 + (fw > 0.4 ? -0.08 : 0);
        const root = at(fw, 0, up);
        const tall = 2.6 - Math.abs(k - 0.4) * 1.6;
        const tip = add(root, add(mul(hu, tall), mul(hf, -1.4 - k * 0.8)));
        sc.cone(hairM, 'head', root, tip, 1.05, 0.25, 0.7, { tag: 'hair' });
      }
      break;
    }
    case 'ponytail':
    case 'tied':
      shell(0.5, [above(0.42, 0.06)]);
      {
        const root = at(-0.85, 0, 0.2);
        const tip = add(root, add(mul(hf, -2.4), mul(hu, look.hair === 'tied' ? -2.5 : -6.5)));
        sc.cone(hairM, 'head', root, tip, 1.1, 0.7, 0.6, { tag: 'hair' });
      }
      break;
    case 'cap': {
      // a knitted cap rolled up at its edge, sat on the back of his head
      shell(0.7, [above(0.3, 0.15)], 'cap');
      const band = sc.mat({ ramp: HR });
      shell(1.05, [above(0.3, 0.12), below(0.3, 0.38)], 'roll', band);
      break;
    }
    case 'wrap': {
      // a cloth wound round his head, its tail hanging down behind
      shell(1.1, [above(0.25, -0.05)], 'wrap');
      sc.ell(hairM, 'head', at(-0.2, 0, 0.6), [mul(hf, R[0] * 0.9), mul(hl, R[1] * 0.9), mul(hu, R[2] * 0.42)], 0.8, { tag: 'wrap' });
      const root = at(-0.95, 0.3, 0.1);
      sc.cone(hairM, 'head', root, add(root, add(mul(hf, -1.6), add(mul(hl, 1.2), mul(hu, -7)))), 1.2, 0.8, 0.5, { tag: 'wrap' });
      break;
    }
  }

  // HIS WHISKERS
  const WR = look.whiskers ?? HR;
  const whisk = sc.mat({
    ramp: WR,
    meld: true,
    paint: (h) => ((h.x + Math.floor(h.y / 3)) % 3 === 0 ? sk(WR, h.tone - 1) : sk(WR, h.tone)),
  });
  if (look.tash === 'handlebar') {
    // waxed and curled up at its ends, wider than his face
    for (const side of [1, -1]) {
      const a = at(1.0, side * 0.05, -0.3);
      const b = at(0.92, side * 0.7, -0.38);
      const c = at(0.66, side * 1.32, -0.2);
      const d = at(0.54, side * 1.42, 0.16);
      sc.cone(whisk, 'head', a, b, 0.85, 0.72, 0.4, { tag: 'tash' });
      sc.cone(whisk, 'head', b, c, 0.72, 0.5, 0.3, { tag: 'tash' });
      sc.cone(whisk, 'head', c, d, 0.5, 0.4, 0.2, { tag: 'tash' });
    }
  } else if (look.tash === 'walrus') {
    sc.ell(whisk, 'head', at(0.96, 0, -0.42), [mul(hf, 0.8), mul(hl, R[1] * 0.68), mul(hu, 0.95)], 0.5, { tag: 'tash' });
  } else if (look.tash === 'pencil') {
    sc.cone(whisk, 'head', at(1.0, 0.45, -0.3), at(1.0, -0.45, -0.3), 0.35, 0.35, 0.2, { tag: 'tash' });
  } else if (look.tash === 'drooping') {
    for (const side of [1, -1]) {
      sc.cone(whisk, 'head', at(1.0, side * 0.1, -0.3), at(0.92, side * 0.5, -0.42), 0.6, 0.5, 0.3, { tag: 'tash' });
      sc.cone(whisk, 'head', at(0.92, side * 0.5, -0.42), at(0.86, side * 0.6, -1.15), 0.5, 0.35, 0.3, { tag: 'tash' });
    }
  }
  if (look.beard === 'chops' || look.beard === 'full' || look.beard === 'short') {
    // the whiskers down each cheek from the ear to the corner of the jaw, thick
    for (const side of [1, -1]) sc.cone(whisk, 'head', at(-0.05, side * 0.86, -0.06), at(0.42, side * 0.74, -0.78), 0.85, look.beard === 'chops' ? 1.35 : 1.1, 0.8, { tag: 'chop' });
  }
  if (look.beard === 'full') {
    sc.ell(whisk, 'head', at(0.42, 0, -0.95), [mul(hf, R[0] * 0.6), mul(hl, R[1] * 0.9), mul(hu, R[2] * 0.45)], 1.0, { tag: 'chin' });
    sc.ell(whisk, 'head', at(0.44, 0, -1.32), [mul(hf, R[0] * 0.55), mul(hl, R[1] * 0.78), mul(hu, R[2] * 0.48)], 1.2, { tag: 'fall' });
  } else if (look.beard === 'short') {
    sc.ell(whisk, 'head', at(0.4, 0, -0.9), [mul(hf, R[0] * 0.58), mul(hl, R[1] * 0.86), mul(hu, R[2] * 0.36)], 1.0, { tag: 'chin' });
  } else if (look.beard === 'goatee') {
    sc.ell(whisk, 'head', at(0.72, 0, -0.95), [mul(hf, R[0] * 0.36), mul(hl, R[1] * 0.36), mul(hu, R[2] * 0.42)], 0.6, { tag: 'chin' });
  } else if (look.beard === 'forked') {
    sc.ell(whisk, 'head', at(0.42, 0, -0.95), [mul(hf, R[0] * 0.58), mul(hl, R[1] * 0.88), mul(hu, R[2] * 0.4)], 1.0, { tag: 'chin' });
    for (const side of [1, -1]) sc.cone(whisk, 'head', at(0.5, side * 0.32, -1.1), add(at(0.6, side * 0.46, -1.4), add(mul(u, -5.5), mul(f, 1.0))), 1.35, 0.7, 0.6, { tag: 'fall' });
  }

  // HIS FACE: the sockets, the eyes deep in them, the brows (and what life has left on it)
  const brow = look.brow ?? sk(look.whiskers ?? HR, 1);
  for (const side of [1, -1]) {
    const out = side > 0 ? 0 : -1;
    sc.mark(at(0.84, side * 0.38, 0.04), sk(SK, 1), 2, 1, out);
    if (mk.patch && !cl.patchSide && side < 0) {
      sc.mark(at(0.86, side * 0.36, 0.06), '#0a0610', 2, 2, out);
    } else sc.mark(at(0.86, side * 0.34, 0.06), '#140a18');
    sc.mark(at(0.86, side * 0.42, 0.28), brow, cl.browW ?? 2, 1, out);
    sc.mark(at(0.92, side * 0.16, 0.2), brow);
  }
  // (the close pass: a hard mouth, set; the light on his cheekbones; a scar down his cheek)
  if (cl.mouth) sc.mark(at(0.96, 0.02, -0.56), cl.mouth, 2, 1, -1);
  if (cl.cheekScar) for (let i = 0; i < 4; i++) sc.mark(at(0.8, -(cl.patchSide ?? -1) * (0.46 - i * 0.03), 0.3 - i * 0.24), sk(SK, 4));
  if (cl.earring) {
    const ear = sc.mat({ ramp: cl.earring });
    sc.ell(ear, 'head', at(-0.05, 1.0, -0.42), [mul(hf, 0.55), mul(hl, 0.3), mul(hu, 0.7)], 0.05, { tag: 'earring' });
  }
  if (mk.scar) for (let i = 0; i < 3; i++) sc.mark(at(0.82, 0.5 - i * 0.02, 0.4 - i * 0.22), sk(SK, 4));
  if (mk.patch && cl.patchSide) {
    // (the close pass: a patch of black leather over the eye, sculpted, its string slanting round his head)
    const ps = cl.patchSide;
    const pm = sc.mat({ ramp: BLACKHIDE });
    sc.ell(pm, 'patch', at(0.82, ps * 0.36, 0.08), [mul(hf, 0.55), mul(hl, 1.05), mul(hu, 1.0)], 0.2, { tag: 'patch' });
    sc.cone(pm, 'patch', at(0.8, ps * 0.66, 0.22), at(-0.2, ps * 0.98, 0.42), 0.3, 0.3, 0.1, { tag: 'string' });
    sc.cone(pm, 'patch', at(0.8, -ps * 0.1, 0.3), at(0.5, -ps * 0.7, 0.62), 0.3, 0.3, 0.1, { tag: 'string' });
  } else if (mk.patch) {
    // the patch's string round his head
    sc.cone(sc.mat({ ramp: BLACKHIDE }), 'head', at(0.6, -0.8, 0.22), at(-0.6, -0.9, 0.48), 0.32, 0.32, 0.1, { tag: 'string' });
  }

  // HIS FISTS: big (his “His hands are tiny compared to his body”), bare, wrapped, strapped or gloved
  const FR = look.fistRamp ?? (look.fists === 'gloves' ? HIDE : WRAP);
  const fistM = look.fists === 'bare' || look.fists === 'straps' ? skin : sc.mat({
    ramp: FR,
    paint: (h) => {
      const c = h.prim;
      const far = farArm(c.piece) ? 1 : 0;
      if (look.fists === 'gloves') {
        if (c.tag === 'cuff') return sk(FR, h.tone - 1 - far + (((h.x + h.y) % 3 === 0) ? 1 : 0));
        return far ? sk(FR, h.tone - 1) : null;
      }
      if (c.k === 'cone' && (look.fists === 'wraps' || look.fists === 'tape')) {
        const { t, around } = onCone(c as Cone, h.p, u);
        if (Math.floor(t * 7 + around / 1.6) % 2 === 0) return sk(FR, h.tone - 1 - far);
      }
      if (c.k === 'box') {
        const b = onBall(c, h.p);
        if (b[0] > 0.55 && Math.floor((b[1] + 1) * 2.5) % 2 === 0) return sk(FR, h.tone - 1 - far);
      }
      return far ? sk(FR, h.tone - 1) : null;
    },
  });
  const strapM = sc.mat({ ramp: look.fistRamp ?? BLACKHIDE });
  for (const side of ['L', 'R'] as const) {
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const ha = side === 'L' ? s.handL : s.handR;
    const piece = `arm${side}`;
    const d = norm(sub(ha, el));
    const across = norm(cross(d, side === 'L' ? l : mul(l, -1)));
    const side3 = norm(cross(across, d));
    const F = look.fistK;
    const glove = look.fists === 'gloves';
    if (look.fists === 'wraps' || look.fists === 'tape') {
      sc.cone(fistM, piece, lerp3(el, ha, look.fists === 'tape' ? 0.72 : 0.5), lerp3(el, ha, 0.92), 1.85, 1.95 * F, 0.8, { tag: 'wrist' });
    }
    if (glove) {
      // an old leather glove, little padded, laced up a cuff on the wrist
      sc.cone(fistM, piece, lerp3(el, ha, 0.62), lerp3(el, ha, 0.95), 1.95 * F, 2.1 * F, 0.6, { tag: 'cuff' });
    }
    if (look.fists === 'straps') {
      // a leather strap round the wrist and over the knuckles
      sc.cone(strapM, piece, lerp3(el, ha, 0.72), lerp3(el, ha, 0.9), 1.75, 1.85, 0.3, { tag: 'band' });
    }
    const g = glove ? 1.12 : 1;
    sc.box(fistM, piece, add(ha, mul(d, 1.25 * F * g)), [mul(d, 2.4 * F * g), mul(side3, 2.3 * F * g), mul(across, 2.15 * F * g)], (glove ? 1.9 : 1.3) * F, 1.0, { tag: 'fist' });
    sc.ell(fistM, piece, add(ha, add(mul(d, 1.6 * F), add(mul(across, -1.6 * F * g), mul(side3, -1.2 * F)))), [mul(d, 1.2 * F), mul(side3, 0.9 * F), mul(across, 0.8 * F)], 0.5, { tag: 'thumb' });
    if (look.fists === 'straps') sc.box(strapM, piece, add(ha, mul(d, 1.6 * F)), [mul(d, 0.8 * F), mul(side3, 2.45 * F), mul(across, 2.3 * F)], 0.6 * F, 0.2, { tag: 'knuckleStrap' });
  }

  // HIS CLOTHES
  const t = tailorFor(sc, w, look.bulk);
  const { belly, ribs } = t;
  const kit: Kit = {
    sc,
    w,
    t,
    legs(ramp, to, loose, high = 0, stripes = null, stripe, cloth = {}) {
      const sr = stripe ?? CREAM;
      t.legsIn(sc.mat({
        ramp,
        paint: (h) => {
          if (h.prim.k === 'cone' && (cloth.folds || cloth.frayed)) {
            const { t: tt, around } = onCone(h.prim as Cone, h.p, f);
            const lower = h.prim.tag === 'shin' || to <= 1.15;
            // a ragged hem where it was cut off at the knee
            if (cloth.frayed && lower && tt > 0.86 && (h.x * 3 + h.y) % 3 !== 0) return sk(ramp, h.tone - 2);
            // the folds of loose cloth: creases running down it, the light on the crest of each
            if (cloth.folds) {
              const c = Math.sin(around * 3 + tt * 2.2);
              if (c > 0.8) return sk(ramp, h.tone - 1);
              if (c < -0.85) return sk(ramp, h.tone + 1);
            }
          }
          if (stripes === 'round' && Math.floor(h.p[2] / 1.6) % 2 === 0) return sk(sr, h.tone);
          if (stripes === 'down' && h.x % 4 === 0) return sk(sr, h.tone - 1);
          if (stripes === 'side' && h.prim.k === 'cone') {
            const { around } = onCone(h.prim as Cone, h.p, l);
            if (Math.abs(Math.abs(around) - Math.PI / 2) < 0.3) return sk(sr, h.tone);
          }
          return null;
        },
      }), to, loose, high);
    },
    top(ramp, neck, stripes = false, stripe, shoulders = false, sleeves = 'none') {
      const sr = stripe ?? CREAM;
      const m = sc.mat({ ramp, paint: (h) => (stripes && Math.floor(h.p[2] / 2.4) % 2 === 0 ? sk(sr, h.tone) : null) });
      // (over the yoke of his shoulders too, cut at the neckline: else the chest's yoke shows through a sleeveless top)
      t.overTrunk(m, 0.9, [{ n: u, o: dot(u, s.neck) - neck }], 'shirt', true);
      void shoulders;
      if (sleeves !== 'none') for (const side of ['L', 'R'] as const) {
        const sh = side === 'L' ? s.shoulderL : s.shoulderR;
        const el = side === 'L' ? s.elbowL : s.elbowR;
        const ha = side === 'L' ? s.handL : s.handR;
        sc.ell(m, `arm${side}`, add(sh, mul(u, -0.4)), [mul(f, 2.8 * look.bulk + 0.5), mul(l, 2.6 * look.bulk + 0.5), mul(u, 2.6 * look.bulk + 0.5)], 1.4, { tag: 'sleeve' });
        sc.cone(m, `arm${side}`, sh, sleeves === 'long' ? el : lerp3(sh, el, 0.6), 2.75 * look.bulk + 0.3, 2.4 * look.bulk + 0.3, 1.0, { tag: 'sleeve' });
        if (sleeves === 'long') sc.cone(m, `arm${side}`, el, lerp3(el, ha, 0.55), 2.3 * look.bulk + 0.4, 1.8 * look.bulk + 0.4, 0.8, { tag: 'sleeve' });
      }
    },
    sash(ramp, tails = true) {
      const m = sc.mat({ ramp, paint: (h) => ((h.x + h.y) % 4 === 0 ? sk(ramp, h.tone - 1) : null) });
      const bc = t.waistBand(m, 1.8, 1.45, 0.35);
      if (!tails) return;
      const knot = add(bc, add(mul(f, belly.h[0] * 0.7 + 0.8), mul(l, -(belly.h[1] * 0.75 + 0.6))));
      sc.ell(m, 'hips', knot, [mul(f, 1.2), mul(l, 1.0), mul(u, 1.2)], 0.4, { tag: 'knot' });
      for (const [k, len] of [[0.9, 7.6], [-0.2, 6.0]] as const) sc.cone(m, 'hips', knot, add(knot, add(mul(f, k), add(mul(l, -0.7), mul(u, -len)))), 1.05, 0.8, 0.4, { tag: 'tail' });
    },
    belt(ramp, tall, plate, studs = false) {
      const m = sc.mat({ ramp, paint: (h) => (studs && h.prim.tag === 'band' && (h.x * 2 + h.y) % 4 === 0 ? sk(BRASS, h.tone) : null) });
      const bc = t.waistBand(m, tall, 1.5, 0.45);
      if (plate) {
        const pm = sc.mat({ ramp: plate, paint: (h) => (onBall(h.prim as Ell, h.p)[0] > 0.2 && Math.abs(onBall(h.prim as Ell, h.p)[1]) < 0.3 && Math.abs(onBall(h.prim as Ell, h.p)[2]) < 0.3 ? sk(plate, h.tone + 1) : null) });
        sc.box(pm, 'hips', add(bc, mul(f, belly.h[0] + 1.7)), [mul(f, 0.7), mul(l, tall > 1.4 ? 3.0 : 1.6), mul(u, tall * 1.25)], 0.7, 0.3, { tag: 'plate' });
        if (tall > 1.4) for (const side of [1, -1]) sc.ell(pm, 'hips', add(bc, add(mul(f, belly.h[0] * 0.6 + 1.3), mul(l, side * (belly.h[1] + 0.4)))), [mul(f, 0.6), mul(l, 1.0), mul(u, 1.4)], 0.2, { tag: 'stud' });
      }
    },
    braces(ramp, hanging = false) {
      const m = sc.mat({ ramp });
      for (const side of [1, -1]) {
        if (hanging) {
          // let down off his shoulders, hanging in loops at his hips
          const top = t.hipFront(side * 0.6);
          sc.cone(m, 'hips', top, add(top, add(mul(f, 1.4), add(mul(l, side * 1.6), mul(u, -7)))), 0.45, 0.45, 0.2, { tag: 'brace' });
          const back = add(belly.c, add(mul(f, -belly.h[0] - 1.0), mul(l, side * belly.h[1] * 0.5)));
          sc.cone(m, 'hips', add(top, add(mul(f, 1.4), add(mul(l, side * 1.6), mul(u, -7)))), add(back, add(mul(l, side * 1.8), mul(u, -6))), 0.45, 0.45, 0.2, { tag: 'brace' });
        } else {
          t.strapOver(m, add(side > 0 ? s.shoulderL : s.shoulderR, add(mul(u, 1.8), add(mul(l, -side * 2.2), mul(f, 1.2)))), t.hipFront(side * 0.45), 0.55, 0.15, 'brace');
          sc.cone(m, 'torso', add(side > 0 ? s.shoulderL : s.shoulderR, add(mul(u, 1.8), mul(l, -side * 2.2))), add(belly.c, add(mul(f, -belly.h[0] - 0.9), add(mul(l, side * 1.4), mul(u, -belly.h[2] * 0.4)))), 0.55, 0.55, 0.2, { tag: 'brace' });
        }
      }
    },
    boots(ramp, high, laces = null) {
      t.boots(t.bootMat(ramp, laces), high, laces);
    },
    stockings(ramp, from = 0, stripes = false) {
      const m = sc.mat({ ramp, paint: (h) => (stripes && Math.floor(h.p[2] / 1.4) % 2 === 0 ? sk(ramp, h.tone - 2) : null) });
      for (const side of ['L', 'R'] as const) {
        const knee = side === 'L' ? s.kneeL : s.kneeR;
        const ankle = side === 'L' ? s.ankleL : s.ankleR;
        const [, lK, lA] = B.legR;
        sc.cone(m, `leg${side}`, lerp3(knee, ankle, from), ankle, lK * 0.98 + 0.35, lA + 0.4, 1.0, { tag: 'shin' });
      }
    },
    wraps(ramp, from, feet) {
      const m = sc.mat({ ramp, paint: (h) => (h.prim.k === 'cone' && Math.floor(onCone(h.prim as Cone, h.p, u).t * 6 + onCone(h.prim as Cone, h.p, u).around / 1.6) % 2 === 0 ? sk(ramp, h.tone - 1) : null) });
      for (const side of ['L', 'R'] as const) {
        const knee = side === 'L' ? s.kneeL : s.kneeR;
        const ankle = side === 'L' ? s.ankleL : s.ankleR;
        const [, lK, lA] = B.legR;
        sc.cone(m, `leg${side}`, lerp3(knee, ankle, from), lerp3(knee, ankle, 0.96), lK * 0.92 + 0.6, lA + 0.6, 0.6, { tag: 'binding' });
      }
      if (feet) t.boots(m, false, null);
    },
    bareFeet(sandal) {
      t.boots(sandal ? sc.mat({ ramp: SK, paint: (h) => (h.prim.tag === 'sole' ? sk(sandal, h.tone) : null) }) : skin, false, null);
    },
    footWraps(ramp) {
      const m = sc.mat({
        ramp,
        paint: (h) => {
          if (h.prim.tag === 'foot' || h.prim.tag === 'sole') {
            const b = onBall(h.prim as Ell, h.p);
            // the toes and the heel bare; the wraps round the arch, slanting
            if (b[0] > 0.45 || b[0] < -0.62) return h.prim.tag === 'sole' ? sk(SK, h.tone - 1) : sk(SK, h.tone);
            if ((h.x + h.y) % 3 === 0) return sk(ramp, h.tone - 1);
          }
          if (h.prim.k === 'cone' && Math.floor(onCone(h.prim as Cone, h.p, u).t * 5 + onCone(h.prim as Cone, h.p, u).around / 1.6) % 2 === 0) return sk(ramp, h.tone - 1);
          return null;
        },
      });
      t.boots(m, false, null);
    },
    bracers(ramp) {
      const m = sc.mat({ ramp, paint: (h) => (h.prim.k === 'cone' && Math.abs(onCone(h.prim as Cone, h.p, u).around) < 0.35 && (h.y % 2 === 0) ? sk(CREAM, h.tone - 1) : null) });
      for (const side of ['L', 'R'] as const) {
        const el = side === 'L' ? s.elbowL : s.elbowR;
        const ha = side === 'L' ? s.handL : s.handR;
        sc.cone(m, `arm${side}`, lerp3(el, ha, 0.3), lerp3(el, ha, 0.74), 2.15 * look.bulk + 0.45, 1.6 * look.bulk + 0.45, 0.5, { tag: 'bracer' });
      }
    },
    openVest(ramp, trim) {
      const m = sc.mat({ ramp, paint: (h) => (h.prim.tag === 'vestEdge' && trim ? sk(trim, h.tone) : (h.x * 2 + h.y) % 7 === 0 ? sk(ramp, h.tone - 1) : null) });
      const down: V3 = [0, 0, -1];
      t.overTrunk(m, 0.95, [{ n: down, o: -(belly.c[2] - belly.h[2] * 0.75) }], 'vest', true);
      // (open down the front: a slot cut out of it down his chest and belly, its edges turned)
      sc.box(m, 'torso', add(lerp3(belly.c, ribs.c, 0.5), mul(f, ribs.h[0] + 2.0)), [mul(f, ribs.h[0] * 0.9 + 1.8), mul(l, ribs.h[1] * 0.42), mul(u, ribs.h[2] * 2.6)], 0.3, 0.6, { carve: true });
      for (const side of [1, -1]) {
        const top = add(s.neck, add(mul(l, side * 2.6), mul(f, 0.6)));
        const foot = t.front(side * 0.5, -ribs.h[2] * 1.6, 1.2);
        sc.cone(m, 'torso', top, foot, 0.8, 0.7, 0.4, { tag: 'vestEdge' });
      }
    },
    bagginess(ramp, at) {
      const m = sc.mat({ ramp, paint: (h) => ((h.x + Math.floor(h.y / 2)) % 3 === 0 ? sk(ramp, h.tone - 1) : null) });
      for (const side of ['L', 'R'] as const) {
        const knee = side === 'L' ? s.kneeL : s.kneeR;
        const ankle = side === 'L' ? s.ankleL : s.ankleR;
        const [, lK, lA] = B.legR;
        // the cloth bunched where the wraps bind it, bellying out over them
        const p = lerp3(knee, ankle, at);
        const d = norm(sub(ankle, knee));
        sc.ell(m, `leg${side}`, add(p, mul(d, -1.2)), [mul(d, 2.0), mul(norm(cross(d, f)), lK + (lA - lK) * at + 1.9), mul(norm(cross(d, norm(cross(d, f)))), lK + (lA - lK) * at + 1.9)], 0.8, { tag: 'bunch' });
      }
    },
    capOnFloor(ramp) {
      // his flat cap, set down on the floor beside him
      const m = sc.mat({ ramp, paint: (h) => (h.prim.tag === 'brim' ? sk(ramp, h.tone - 1) : null) });
      const c: V3 = [s.ankleR[0] - 2, s.ankleR[1] - 8, 0];
      sc.ell(m, 'cap', add(c, [0, 0, 1.2]), [[2.9, 0, 0], [0, 2.7, 0], [0, 0, 1.2]], 0.5, { tag: 'crown' });
      sc.box(m, 'cap', add(c, [2.4, 0, 0.45]), [[1.6, 0, 0], [0, 2.4, 0], [0, 0, 0.35]], 0.3, 0.6, { tag: 'brim' });
    },
    neckerchief(ramp) {
      const m = sc.mat({ ramp });
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const dir = add(mul(f, Math.cos(a)), mul(l, Math.sin(a)));
        sc.ell(m, 'torso', add(s.neck, add(mul(u, 0.2), mul(dir, B.shoulderHalf * 0.3))), [mul(dir, 1.2), mul(cross(u, dir), 1.6), mul(u, 1.1)], 1.2, { tag: 'scarf' });
      }
      const knot = add(s.neck, add(mul(f, B.shoulderHalf * 0.36 + 0.6), mul(u, -0.8)));
      sc.cone(m, 'torso', knot, add(knot, add(mul(f, 1.4), add(mul(u, -4.5), mul(l, 1.0)))), 1.2, 0.6, 0.3, { tag: 'scarfTail' });
      sc.cone(m, 'torso', knot, add(knot, add(mul(f, 1.2), add(mul(u, -4.0), mul(l, -1.4)))), 1.1, 0.6, 0.3, { tag: 'scarfTail' });
    },
    beads(ramp) {
      const m = sc.mat({ ramp });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const ca = Math.cos(a);
        const dir = add(mul(f, ca), mul(l, Math.sin(a)));
        const r = B.shoulderHalf * 0.42 + (ca > 0 ? ca * 2.2 : 0);
        sc.ell(m, 'beads', add(s.neck, add(mul(u, -0.8 - Math.max(0, ca) * 4.5), mul(dir, r))), [mul(f, 0.75), mul(l, 0.75), mul(u, 0.75)], 0.05, { tag: 'bead' });
      }
    },
    armBand(ramp, side, k) {
      const m = sc.mat({ ramp });
      const sh = side === 'L' ? s.shoulderL : s.shoulderR;
      const el = side === 'L' ? s.elbowL : s.elbowR;
      const d = norm(sub(el, sh));
      const p = lerp3(sh, el, k);
      sc.cone(m, `arm${side}`, add(p, mul(d, -0.45)), add(p, mul(d, 0.45)), 2.75 * look.bulk + 0.3, 2.65 * look.bulk + 0.3, 0.2, { tag: 'band' });
    },
    kneePads(ramp) {
      const m = sc.mat({ ramp });
      for (const side of ['L', 'R'] as const) {
        const knee = side === 'L' ? s.kneeL : s.kneeR;
        const hip = side === 'L' ? s.hipL : s.hipR;
        const ankle = side === 'L' ? s.ankleL : s.ankleR;
        const d = norm(sub(ankle, hip));
        sc.cone(m, `leg${side}`, add(knee, mul(d, -1.6)), add(knee, mul(d, 1.6)), B.legR[1] + 1.0, B.legR[1] + 0.9, 0.4, { tag: 'pad' });
      }
    },
    headband(ramp, tails) {
      const m = sc.mat({ ramp });
      shell(0.55, [above(0.25, 0.22), below(0.25, 0.48)], 'band', m);
      if (tails) {
        const root = at(-0.95, 0.2, 0.35);
        for (const k of [1, -1]) sc.cone(m, 'head', root, add(root, add(mul(hf, -2.2), add(mul(hl, k * 1.4), mul(hu, -4.5)))), 0.6, 0.45, 0.2, { tag: 'bandTail' });
      }
    },
    kilt(ramp) {
      const m = sc.mat({ ramp, paint: (h) => (h.x % 4 === 0 || Math.floor(h.p[2]) % 4 === 0 ? sk(ramp, h.tone + 1) : h.prim.tag === 'pleat' && (h.x % 2 === 0) ? sk(ramp, h.tone - 1) : null) });
      const pc = t.pel.c;
      // a pleated skirt from the belly to above his knees, standing off his thighs
      const kneeZ = (s.kneeL[2] + s.kneeR[2]) / 2;
      sc.ell(m, 'hips', add(pc, mul(u, -1.0)), [mul(t.pel.r[0], t.pel.h[0] + 1.6), mul(t.pel.r[1], t.pel.h[1] + 1.6), mul(t.pel.r[2], t.pel.h[2] + 1.0)], 1.4, { tag: 'kilt' });
      const fw = norm([f[0], f[1], 0]);
      const sd = norm([l[0], l[1], 0]);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const dir = add(mul(fw, Math.cos(a)), mul(sd, Math.sin(a)));
        const top = add(pc, add(mul(dir, B.pelvisHalf * 0.9), mul(u, 0.5)));
        const foot: V3 = [top[0] + dir[0] * 2.2, top[1] + dir[1] * 2.2, kneeZ + 3.2];
        sc.cone(m, 'hips', top, foot, 2.0, 2.4, 1.2, { tag: 'pleat' });
      }
    },
    tunic(ramp, trim) {
      // a sleeveless tunic crossed over at the chest, its skirts split to the hip at each side
      // (its folds: creases slanting down across him from the crossing, the light on the crest of each)
      const m = sc.mat({ ramp, paint: (h) => (h.prim.tag === 'lapel' ? sk(trim, h.tone) : (h.x * 2 + h.y) % 7 === 0 ? sk(ramp, h.tone - 1) : (h.x * 2 + h.y) % 7 === 1 ? sk(ramp, h.tone + 1) : null) });
      t.overTrunk(m, 0.7, [], 'shirt', true);
      t.strapOver(sc.mat({ ramp: trim }), t.shoulderTop(-1, 1.4), t.hipFront(0.7), 0.7, 0.55, 'lapel');
      for (const side of [1, -1]) {
        const top = add(t.hipFront(side * 0.4), mul(f, 0.4));
        const foot = add(top, add(mul(f, 1.2), mul(u, -9)));
        sc.box(m, 'skirt', lerp3(top, foot, 0.5), [mul(norm(sub(foot, top)), 4.5), mul(l, 2.6), mul(f, 0.5)], 0.3, 0.6, { tag: 'flap' });
      }
    },
  };
  void ribs;
  look.dress(kit);
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}

// ---------------------------------------------------------------------------------------------
// THE TWENTY

const OLD = (shape: Shape): Shape => ({ ...shape, pad: 1.0 });

/** TEN OLD-TIMEY BOXERS: the bare-knuckle prizefighters of the old ring, in its upright stance. */
export const OLD_BOXERS: BrawlerLook2[] = [
  {
    n: 1, kind: 'boxer', name: 'The Champion',
    line: 'Waxed handlebar moustache, black hair parted down the middle, the broad brass champion’s belt over high-waisted black tights, laced boots.',
    tall: 58, head: 1.1, shape: OLD({ shoulders: 1.24, chest: 1.2, waist: 0.9, hips: 0.9, legs: 1.04, depth: 1.06, limbs: 1.06 }), bulk: 1.12,
    skin: SKIN_PALE, hair: 'slick', hairRamp: H_BLACK, tash: 'handlebar', beard: 'none', fists: 'bare', fistK: 1.2, stance: 'classic',
    dress: (k) => { k.legs(CHAR, 1.9, 0.6, 0.9); k.belt(BLACKHIDE, 2.0, BRASS); k.boots(BLACKHIDE, true, CREAM); },
  },
  {
    n: 2, kind: 'boxer', name: 'The Iron Squire',
    line: 'Grey mutton chops and a bald pate fringed in grey, a striped sleeveless vest, plain tights, a sash at the hip: an old gentleman who still hits.',
    tall: 56, head: 1.12, shape: OLD({ shoulders: 1.16, chest: 1.18, waist: 1.04, hips: 0.98, depth: 1.12, limbs: 1.08 }), bulk: 1.1,
    skin: SKIN_PALE, hair: 'fringe', hairRamp: GREY_C, tash: 'none', beard: 'chops', whiskers: GREY_C, fists: 'bare', fistK: 1.2, stance: 'reach',
    pose: { twist: 2, yaw: -14 },
    dress: (k) => { k.top(NAVY, 3.2, true, GREY_C); k.legs(GREY_C, 1.9, 0.6, 0.6); k.sash(MAROON); k.boots(BLACKHIDE, false, null); },
  },
  {
    n: 3, kind: 'boxer', name: 'The Bruiser',
    line: 'Flat-top crop, a nose broken flat, ears like cauliflowers; grey long johns rolled down and tied at his waist, braces let down, work boots.',
    tall: 55, head: 1.18, shape: OLD({ shoulders: 1.26, chest: 1.28, waist: 1.06, hips: 1.0, legs: 0.94, depth: 1.14, limbs: 1.16, arms: 1.02 }), bulk: 1.22,
    skin: SKIN_OLIVE, hair: 'crop', hairRamp: H_BROWN, tash: 'none', beard: 'none', ears: 'cauli', nose: 'broken', marks: { stubble: true, scar: true },
    fists: 'bare', fistK: 1.3, stance: 'tucked',
    dress: (k) => { k.legs(GREY_C, 1.85, 1.0, 0.5); k.sash(GREY_C, false); k.braces(MAROON, true); k.boots(HIDE, false, null); },
  },
  {
    n: 4, kind: 'boxer', name: 'The Tattooed Tar',
    line: 'A shaven head, a drooping moustache, arms and chest blue with old sailor’s tattoos; cream tights, a red sash, bare knuckles, low boots.',
    tall: 57, head: 1.1, shape: OLD({ shoulders: 1.2, chest: 1.16, waist: 0.92, hips: 0.92, depth: 1.06, limbs: 1.08 }), bulk: 1.14,
    skin: SKIN_OLIVE, hair: 'bald', hairRamp: H_BROWN, tash: 'drooping', beard: 'none', whiskers: H_BROWN, marks: { tattoos: true },
    fists: 'bare', fistK: 1.22, stance: 'reach',
    dress: (k) => { k.legs(CREAM, 1.9, 0.6, 0.7); k.sash(RED); k.boots(BLACKHIDE, false, null); },
  },
  {
    n: 5, kind: 'boxer', name: 'The Young Contender',
    line: 'Lean and long, clean-shaven, a mop of black curls; high-waisted maroon trunks, old brown leather gloves laced at the wrist, tall laced boots.',
    tall: 58, head: 1.06, shape: OLD({ shoulders: 1.14, chest: 1.06, waist: 0.84, hips: 0.88, legs: 1.08, depth: 1.0, limbs: 1.0 }), bulk: 1.02,
    skin: SKIN_DEEP, hair: 'curly', hairRamp: H_BLACK, tash: 'none', beard: 'none', fists: 'gloves', fistRamp: OXBLOOD, fistK: 1.2, stance: 'tucked',
    dress: (k) => { k.legs(MAROON, 0.62, 0.9, 0.9); k.belt(BLACKHIDE, 0.9); k.boots(HIDE, true, CREAM); },
  },
  {
    n: 6, kind: 'boxer', name: 'The Old Lion',
    line: 'A heavyweight gone grey: grey whiskers all round his jaw, a big belly, red flannel long johns buttoned down the front, a plain belt, fists wrapped.',
    tall: 58, head: 1.12, shape: OLD({ shoulders: 1.26, chest: 1.28, waist: 1.18, hips: 1.06, depth: 1.18, limbs: 1.14 }), bulk: 1.2,
    skin: SKIN_PALE, hair: 'crop', hairRamp: H_GREY, tash: 'walrus', beard: 'full', whiskers: H_GREY, fists: 'wraps', fistK: 1.25, stance: 'tall',
    dress: (k) => {
      k.top(FLANNEL, 2.6, false, undefined, true, 'short');
      k.legs(FLANNEL, 1.9, 0.7, 0.8);
      k.belt(BLACKHIDE, 1.1, BRASS);
      for (let i = 0; i < 4; i++) k.sc.ell(k.sc.mat({ ramp: CREAM }), 'torso', k.t.front(0, k.t.ribs.h[2] * (0.6 - i * 0.4), 0.7), [mul(k.t.f, 0.4), mul(k.t.l, 0.5), mul(k.t.u, 0.5)], 0.05, { tag: 'button' });
      k.boots(BLACKHIDE, false, null);
    },
  },
  {
    n: 7, kind: 'boxer', name: 'The Georgian Gentleman',
    line: 'The oldest ring of all: tied-back hair, a pencil moustache, cream knee breeches, white stockings and buckled shoes, a green sash.',
    tall: 57, head: 1.08, shape: OLD({ shoulders: 1.16, chest: 1.12, waist: 0.88, hips: 0.92, depth: 1.04, limbs: 1.02 }), bulk: 1.06,
    skin: SKIN_PALE, hair: 'tied', hairRamp: H_BROWN, tash: 'pencil', beard: 'none', fists: 'bare', fistK: 1.18, stance: 'classic',
    dress: (k) => { k.legs(CREAM, 1.05, 0.95, 0.9); k.stockings(['#5a5470', '#8a86a4', '#c4c0d8', '#ecebf6', '#ffffff'], 0.05); k.sash(GREEN); k.boots(BLACKHIDE, false, null); },
  },
  {
    n: 8, kind: 'boxer', name: 'The Dock Fighter',
    line: 'A navvy off the docks: a short dark beard, braces over his bare chest, rolled work trousers, hobnailed boots, his flat cap set down on the floor.',
    tall: 56, head: 1.14, shape: OLD({ shoulders: 1.22, chest: 1.18, waist: 1.0, hips: 0.96, depth: 1.1, limbs: 1.14, arms: 1.04 }), bulk: 1.18,
    skin: SKIN_BROWN, hair: 'crop', hairRamp: H_BLACK, tash: 'none', beard: 'short', fists: 'straps', fistRamp: HIDE, fistK: 1.28, stance: 'tucked',
    dress: (k) => { k.legs(NAVY, 1.6, 1.1, 0.7); k.braces(OCHRE); k.boots(HIDE, false, null); k.capOnFloor(GREY_C); },
  },
  {
    n: 9, kind: 'boxer', name: 'The Bearded Giant',
    line: 'Bald and huge, a black forked beard down his chest, plain black tights to the ankle, a wide green sash, fists like hams. (Nearest to today’s Brawler.)',
    tall: 60, head: 1.06, shape: OLD({ shoulders: 1.32, chest: 1.3, waist: 1.0, hips: 0.98, legs: 1.04, depth: 1.14, limbs: 1.16, arms: 1.04 }), bulk: 1.24,
    skin: SKIN_OLIVE, hair: 'bald', hairRamp: H_BLACK, tash: 'walrus', beard: 'forked', whiskers: H_BLACK, fists: 'wraps', fistK: 1.32, stance: 'classic',
    dress: (k) => { k.legs(CHAR, 1.9, 0.65, 0.5); k.sash(GREEN); k.boots(BLACKHIDE, false, null); },
  },
  {
    n: 10, kind: 'boxer', name: 'The Copper Kid',
    line: 'Short, wiry and quick: a shock of red hair, freckles, a red moustache curled up, green striped tights to the knee and wool socks, wrapped fists.',
    tall: 55, head: 1.14, shape: OLD({ shoulders: 1.12, chest: 1.04, waist: 0.86, hips: 0.88, legs: 0.98, depth: 1.0, limbs: 1.0 }), bulk: 1.02,
    skin: SKIN_PALE, hair: 'crop', hairRamp: H_RED, tash: 'handlebar', beard: 'none', whiskers: H_RED, marks: { freckles: true },
    fists: 'wraps', fistK: 1.22, stance: 'reach',
    dress: (k) => { k.legs(GREEN, 1.05, 0.7, 0.8, 'down', CREAM); k.stockings(GREY_C, 0.1, true); k.belt(HIDE, 0.9); k.boots(HIDE, false, null); },
  },
];

/** TEN FIGHTERS: punches, kicks and leaps, light on their feet, legs and feet free to kick. */
export const REAL_FIGHTERS: BrawlerLook2[] = [
  {
    n: 1, kind: 'fighter', name: 'The Wandering Monk',
    line: 'Shaven, a short grey beard; an ochre sleeveless wrap, wooden beads, loose brown trousers bound at the shins, bare feet; his knee up ready to kick.',
    tall: 57, head: 1.08, shape: { shoulders: 1.16, chest: 1.1, waist: 0.88, hips: 0.92, depth: 1.04, limbs: 1.04, pad: 1.0 }, bulk: 1.06,
    skin: SKIN_BROWN, hair: 'bald', hairRamp: H_GREY, tash: 'drooping', beard: 'short', whiskers: H_GREY, fists: 'wraps', fistK: 1.18, stance: 'chamber',
    dress: (k) => { k.tunic(OCHRE, MAROON); k.legs(GREY_C, 1.7, 1.5, 0.4); k.wraps(CREAM, 0.45, false); k.bareFeet(); k.beads(WOODB); k.sash(MAROON, false); },
  },
  {
    n: 2, kind: 'fighter', name: 'The Pit Kicker',
    line: 'A kickboxer of the fighting pits: a crest of black hair, a cord round his arm, short green trunks, shins and feet bound in grey, bare chest.',
    tall: 57, head: 1.06, shape: { shoulders: 1.18, chest: 1.1, waist: 0.86, hips: 0.9, legs: 1.06, depth: 1.02, limbs: 1.04, pad: 1.0 }, bulk: 1.08,
    skin: SKIN_DEEP, hair: 'crest', hairRamp: H_BLACK, tash: 'none', beard: 'goatee', fists: 'tape', fistK: 1.18, stance: 'fight',
    dress: (k) => { k.legs(GREEN, 0.5, 0.95, 0.4, 'side', OCHRE); k.belt(OCHRE, 0.9); k.wraps(WRAP, 0.05, true); k.armBand(MAROON, 'L', 0.3); k.armBand(MAROON, 'R', 0.3); },
  },
  {
    n: 3, kind: 'fighter', name: 'The Savate Man',
    line: 'Old French boxing, that kicks: a curled moustache, slicked hair, a navy sleeveless top over long tights, laced pointed shoes; up on his toes.',
    tall: 58, head: 1.06, shape: { shoulders: 1.12, chest: 1.06, waist: 0.84, hips: 0.88, legs: 1.1, depth: 1.0, limbs: 0.98, pad: 1.0 }, bulk: 1.0,
    skin: SKIN_PALE, hair: 'slick', hairRamp: H_BROWN, tash: 'handlebar', beard: 'none', fists: 'bare', fistK: 1.16, stance: 'fight',
    pose: { lfp: 22, lfz: 0.6 },
    dress: (k) => { k.top(NAVY, 3.0, false); k.legs(NAVY, 1.92, 0.5, 0.6); k.belt(CREAM, 0.7); k.boots(BLACKHIDE, false, CREAM); },
  },
  {
    n: 4, kind: 'fighter', name: 'The Wrestler',
    line: 'Low and wide, built like a barrel: shaved head, cauliflower ears, a maroon singlet, leather knee pads, laced boots; grabs, throws and stomps.',
    tall: 56, head: 1.12, shape: { shoulders: 1.3, chest: 1.3, waist: 1.12, hips: 1.04, legs: 0.94, depth: 1.18, limbs: 1.18, arms: 1.02, pad: 1.0 }, bulk: 1.24,
    skin: SKIN_PALE, hair: 'bald', hairRamp: H_SAND, tash: 'none', beard: 'stubble', ears: 'cauli', nose: 'broken', marks: { stubble: true },
    fists: 'tape', fistK: 1.3, stance: 'low',
    dress: (k) => { k.top(MAROON, 1.8, false); k.legs(MAROON, 0.4, 0.8, 0.9); k.kneePads(BLACKHIDE); k.boots(BLACKHIDE, true, MAROON); },
  },
  {
    n: 5, kind: 'fighter', name: 'The Temple Fighter',
    line: 'Shaved but for a topknot, a teal tunic crossed at the chest, a cream sash, loose trousers wrapped from the shin, cloth shoes.',
    tall: 57, head: 1.06, shape: { shoulders: 1.14, chest: 1.08, waist: 0.86, hips: 0.92, legs: 1.04, depth: 1.02, limbs: 1.0, pad: 1.0 }, bulk: 1.04,
    skin: SKIN_OLIVE, hair: 'topknot', hairRamp: H_BLACK, tash: 'none', beard: 'none', fists: 'wraps', fistRamp: CREAM, fistK: 1.18, stance: 'fight',
    dress: (k) => { k.tunic(TEAL, CREAM); k.legs(CHAR, 1.7, 1.4, 0.4); k.wraps(CREAM, 0.4, true); k.sash(CREAM); },
  },
  {
    n: 6, kind: 'fighter', name: 'The Sailor',
    line: 'Fights with feet and fists like a ship’s brawler: a knitted cap, a striped sleeveless shirt, a red neckerchief, wide trousers rolled up, bare feet, tattoos.',
    tall: 57, head: 1.1, shape: { shoulders: 1.2, chest: 1.14, waist: 0.92, hips: 0.92, depth: 1.06, limbs: 1.08, pad: 1.0 }, bulk: 1.12,
    skin: SKIN_OLIVE, hair: 'cap', hairRamp: NAVY, tash: 'none', beard: 'short', whiskers: H_BROWN, marks: { tattoos: true }, fists: 'bare', fistK: 1.24, stance: 'fight',
    dress: (k) => { k.top(CREAM, 3.4, true, NAVY); k.legs(NAVY, 1.55, 1.6, 0.5); k.neckerchief(RED); k.belt(BLACKHIDE, 0.8, BRASS); k.bareFeet(); },
  },
  {
    n: 7, kind: 'fighter', name: 'The Veteran',
    line: 'Grey and scarred, a patch over one eye, a short grey beard; trousers cut off at the knee, one shin bound and the other bare and scarred, leather bracers.',
    tall: 57, head: 1.1, shape: { shoulders: 1.2, chest: 1.16, waist: 0.98, hips: 0.96, depth: 1.08, limbs: 1.08, pad: 1.0 }, bulk: 1.1,
    skin: SKIN_BROWN, hair: 'crop', hairRamp: H_GREY, tash: 'walrus', beard: 'short', whiskers: H_GREY, marks: { patch: true, shinScar: true, scar: true },
    fists: 'straps', fistRamp: HIDE, fistK: 1.24, stance: 'chamber',
    dress: (k) => {
      k.legs(GREY_C, 1.08, 1.1, 0.6);
      const m = k.sc.mat({ ramp: WRAP, paint: (h) => (h.prim.k === 'cone' && Math.floor(onCone(h.prim as Cone, h.p, k.t.u).t * 6) % 2 === 0 ? sk(WRAP, h.tone - 1) : null) });
      const s = k.w.s;
      k.sc.cone(m, 'legR', lerp3(s.kneeR, s.ankleR, 0.1), lerp3(s.kneeR, s.ankleR, 0.95), k.w.B.legR[1] * 0.92 + 0.6, k.w.B.legR[2] + 0.6, 0.6, { tag: 'binding' });
      k.belt(HIDE, 1.0, BRASS);
      k.bareFeet(HIDE);
    },
  },
  {
    n: 8, kind: 'fighter', name: 'The Tumbler',
    line: 'A fairground acrobat who fights in the air: lean and springy, a sandy ponytail, a short leather vest, two-tone tights, soft shoes; built for flying kicks.',
    tall: 56, head: 1.08, shape: { shoulders: 1.08, chest: 1.0, waist: 0.82, hips: 0.88, legs: 1.1, depth: 0.98, limbs: 0.96, pad: 1.0 }, bulk: 0.98,
    skin: SKIN_PALE, hair: 'ponytail', hairRamp: H_SAND, tash: 'none', beard: 'none', fists: 'wraps', fistRamp: WRAP, fistK: 1.16, stance: 'fight',
    pose: { pz: -2.0, rfp: 40, rfz: 2.4, lfp: 18 },
    dress: (k) => { k.top(HIDE, 3.6, false, undefined, true); k.legs(TEAL, 1.92, 0.5, 0.6, 'side', OCHRE); k.belt(OCHRE, 0.8); k.boots(CREAM, false, null); },
  },
  {
    n: 9, kind: 'fighter', name: 'The Caravan Guard',
    line: 'From the dry roads: a cloth wound round his head, its tail behind, a black beard, bare chest crossed by a strap, loose ochre trousers, sandals and shin wraps.',
    tall: 58, head: 1.08, shape: { shoulders: 1.2, chest: 1.12, waist: 0.88, hips: 0.92, legs: 1.06, depth: 1.04, limbs: 1.04, pad: 1.0 }, bulk: 1.1,
    skin: SKIN_DEEP, hair: 'wrap', hairRamp: CREAM, tash: 'walrus', beard: 'full', whiskers: H_BLACK, fists: 'wraps', fistRamp: CREAM, fistK: 1.2, stance: 'fight',
    dress: (k) => {
      k.legs(OCHRE, 1.65, 1.6, 0.4);
      k.sash(MAROON);
      k.t.strapOver(k.sc.mat({ ramp: BLACKHIDE }), k.t.shoulderTop(1, 0.8), k.t.hipFront(-1), 0.8, 0.6, 'strap');
      k.wraps(CREAM, 0.5, false);
      k.bareFeet(HIDE);
    },
  },
  {
    n: 10, kind: 'fighter', name: 'The Hill Runner',
    line: 'A highland kicker: long red hair tied back, a red beard, bare-chested, a green checked kilt, wool socks to the knee and laced brogues; his knee up to kick.',
    tall: 58, head: 1.08, shape: { shoulders: 1.2, chest: 1.12, waist: 0.9, hips: 0.92, legs: 1.08, depth: 1.04, limbs: 1.06, pad: 1.0 }, bulk: 1.1,
    skin: SKIN_PALE, hair: 'ponytail', hairRamp: H_RED, tash: 'none', beard: 'short', whiskers: H_RED, marks: { freckles: true }, fists: 'bare', fistK: 1.22, stance: 'chamber',
    dress: (k) => { k.kilt(TARTAN); k.belt(BLACKHIDE, 1.0, BRASS); k.stockings(CREAM, 0.0, false); k.boots(HIDE, false, null); },
  },
];

export const BRAWLER_LOOKS_2: BrawlerLook2[] = [...OLD_BOXERS, ...REAL_FIGHTERS];

/** Olive drab: an old soldier's vest. */
const DRAB: Ramp = ['#10120a', '#20241a', '#363c2a', '#525a3e', '#727c56'];

/**
 * THE BETTER THREE: his pick of the fighters, 2 Nov 2026: “Show me a better 7, 2, and 1 of the fighters”. Each worked close:
 * a face with character, whiskers and hair that read, clothes that hang and fold, wraps on shins, feet and fists, the
 * muscles drawn, fists big; and each with a still of his kick.
 */
export const BETTER_FIGHTERS: BrawlerLook2[] = [
  {
    n: 7, kind: 'fighter', name: 'The Veteran',
    line: 'An old soldier who fights dirty: one eye under a patch, a scar down the other cheek, a grey walrus moustache and beard; an old drab vest open on his scarred chest, trousers hacked off at the knee, one shin bound, the other bare and scarred, leather bracers, knuckles strapped. His kick: a knee driven up into whoever he has by the head.',
    kickName: 'mid-kick: the knee, driven up',
    tall: 57, head: 1.16, shape: { shoulders: 1.22, chest: 1.18, waist: 0.98, hips: 0.96, depth: 1.08, limbs: 1.1, arms: 1.02, pad: 1.0 }, bulk: 1.14,
    skin: SKIN_BROWN, hair: 'crop', hairRamp: GREY_C, tash: 'walrus', beard: 'short', whiskers: H_GREY, brow: H_GREY[3],
    marks: { patch: true, shinScar: true },
    close: { mouth: '#2a1410', browW: 3, cheekScar: true, abs: true, patchSide: 1 },
    fists: 'straps', fistRamp: HIDE, fistK: 1.3, stance: 'fight',
    kick: (t) => ({
      pz: 3 * t, pitch: -4, bend: 6, yaw: 50, twist: 10, faceTurn: -10, faceUp: -4,
      rfx: 12 * t, rfy: -1.0 * t, rfz: 34 * t, rfp: 72, rk: -2, rkUp: 85,
      lfx: 2.4 * t, lfy: 2.6 * t, lfz: 1.0 * t, lfp: 24, lk: 18,
      lhIn: 0, lhx: 12.5 * t, lhy: -1.4 * t, lhz: 0.4 * t, le: 6, rhIn: 0, rhx: 12.5 * t, rhy: 1.6 * t, rhz: 0.4 * t, re: 6,
    }),
    dress: (k) => {
      k.openVest(DRAB, HIDE);
      k.legs(GREY_C, 1.08, 1.2, 0.6, null, undefined, { folds: true, frayed: true });
      const m = k.sc.mat({ ramp: WRAP, paint: (h) => (h.prim.k === 'cone' && Math.floor(onCone(h.prim as Cone, h.p, k.t.u).t * 7 + onCone(h.prim as Cone, h.p, k.t.u).around / 1.6) % 2 === 0 ? sk(WRAP, h.tone - 1) : null) });
      const s = k.w.s;
      k.sc.cone(m, 'legR', lerp3(s.kneeR, s.ankleR, 0.08), lerp3(s.kneeR, s.ankleR, 0.95), k.w.B.legR[1] * 0.92 + 0.6, k.w.B.legR[2] + 0.6, 0.6, { tag: 'binding' });
      k.belt(HIDE, 1.2, BRASS, true);
      k.bracers(HIDE);
      k.footWraps(WRAP);
    },
  },
  {
    n: 2, kind: 'fighter', name: 'The Pit Kicker',
    line: 'A kickboxer of the fighting pits: his head shaved at the sides under a tall crest of black spikes, a goatee, a brass ring in his ear; bare chest, short green trunks with an ochre stripe and a wide ochre waistband, cords knotted round his arms, his shins and feet bound in grey, fists taped. His kick: a high kick to the head.',
    kickName: 'mid-kick: a high kick',
    tall: 57, head: 1.12, shape: { shoulders: 1.2, chest: 1.12, waist: 0.84, hips: 0.88, legs: 1.08, depth: 1.02, limbs: 1.06, pad: 1.0 }, bulk: 1.1,
    skin: SKIN_DEEP, hair: 'spikes', hairRamp: H_BLACK, tash: 'none', beard: 'goatee', whiskers: H_BLACK, brow: '#0a0608',
    close: { mouth: '#140a08', earring: BRASS, abs: true },
    fists: 'tape', fistRamp: WRAP, fistK: 1.28, stance: 'fight',
    kick: (t) => ({
      pz: -1.0 * t, pitch: -14, bend: -2, yaw: 30, twist: 20, faceTurn: -14, faceUp: 2,
      lfx: 20 * t, lfy: 3.0 * t, lfz: 44 * t, lfp: 46, lk: 8, lkUp: 46,
      rfx: -3.0 * t, rfy: -2.4 * t, rfz: 1.0 * t, rfp: 24, rk: -16,
      lhIn: 0, lhx: 7.5 * t, lhy: 1.6 * t, lhz: 3.4 * t, le: 26, rhIn: 0, rhx: -3.0 * t, rhy: -3.0 * t, rhz: -8.5 * t, re: 34,
    }),
    dress: (k) => {
      k.legs(GREEN, 0.5, 0.95, 0.4, 'side', OCHRE, { folds: true });
      k.belt(OCHRE, 1.4);
      k.wraps(WRAP, 0.05, false);
      k.footWraps(WRAP);
      k.armBand(MAROON, 'L', 0.32);
      k.armBand(MAROON, 'R', 0.32);
    },
  },
  {
    n: 1, kind: 'fighter', name: 'The Wandering Monk',
    line: 'A shaven old monk off the roads: a long drooping grey moustache and a short grey beard, heavy grey brows; an ochre wrap crossed over his chest and tied with a maroon sash, big wooden beads, baggy grey trousers bound at the shins with cream wraps, his feet wrapped, his fists wrapped. His kick: a flying kick off the ground.',
    kickName: 'mid-kick: a flying kick',
    tall: 57, head: 1.14, shape: { shoulders: 1.16, chest: 1.1, waist: 0.88, hips: 0.92, depth: 1.04, limbs: 1.06, pad: 1.0 }, bulk: 1.08,
    skin: SKIN_BROWN, hair: 'bald', hairRamp: H_GREY, tash: 'drooping', beard: 'short', whiskers: H_GREY, brow: H_GREY[3],
    close: { mouth: '#2a1410', browW: 3, abs: true },
    fists: 'wraps', fistRamp: CREAM, fistK: 1.26, stance: 'fight',
    kick: (t) => ({
      pz: 10 * t, pitch: -10, bend: 4, yaw: 30, twist: 14, faceTurn: -12, faceUp: 0,
      lfx: 20 * t, lfy: 2.0 * t, lfz: 50 * t, lfp: 30, lk: 6, lkUp: 26,
      rfx: -1.0 * t, rfy: -2.0 * t, rfz: 18 * t, rfp: 52, rk: -10, rkUp: 24,
      lhIn: 0, lhx: 6.5 * t, lhy: 0.4 * t, lhz: 2.6 * t, le: 30, rhIn: 0, rhx: 4.0 * t, rhy: 1.4 * t, rhz: -2.4 * t, re: 40,
    }),
    dress: (k) => {
      k.tunic(OCHRE, MAROON);
      k.legs(GREY_C, 1.7, 1.6, 0.4, null, undefined, { folds: true });
      k.bagginess(GREY_C, 0.45);
      k.wraps(CREAM, 0.45, false);
      k.footWraps(CREAM);
      k.beads(WOODB);
      k.sash(MAROON, true);
    },
  },
];
void RED;
