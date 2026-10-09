// The cultist: the design the owner said yes to on the style sheet (previews/art_styles_1_and_6.png,
// "6 Bold and modern"; the concept painting is cultist() in src/dev/styles_cast.ts, which faces
// the other way). A long robe of dark violet that flares to the floor, a deep cowl with a point
// and two burning eyes in its dark, a pink stole with a sign of fire on it, a rope round the
// waist, a crooked knife held low in one pale hand, and over the palm of the other a living flame.
//
// It throws that flame. The warning is the flame itself: lifted high over the cowl it swells to a
// ball of fire three times the size, and its light fills the room.
//
// Painted with the kit (art/kit.ts, art/mkit.ts). Every frame faces screen-right: `front` toward
// the camera (down-right), `back` away from it (up-right). The flame hand is on screen-right in
// both views (it is held out toward whatever the cultist faces), the knife hand on screen-left.
//
// TURNED TO THE GRID (after Version 14.5; kit.ts, "Turned to the grid"): seen from a corner, as the
// heroes are. The robe is painted level and then slid by columns: all of the slide at the
// shoulders and the rope, less and less of it down the skirts, none at the hem, which lies round
// on the floor and looks the same from every side. The stole and its sign, which are on the
// body's middle line, are toward the side faced (from behind, the fold of the cowl is away from
// it); the opening of the cowl is turned further that way; the nearer shoulder is lower and the
// further one higher; a step goes along the grid.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt, Clip } from './actor_types';
import { clipPoses } from './clip';
import type { Key, Timeline } from './clip';
import { fallen, quench } from './death';
import { BONE, CLIP_FPS, HI, INDIGO, INK, KAX, KAY, KH, KW, KX, LO, PINK, REST, STEEL, TURN, ball, compose, dim, dir, edge, footOf, hash, inEllipse, joint, layer, lazyFrames, limb, lit, shearBy, slant, stamp, toSprite } from './kit';
import type { Painted, Pose, Ramp, V } from './kit';
import { ENEMY_RIM, FLAME, GLOOM, IRON, MENACE, SOCKET, monsterArt, onGrid, strike } from './mkit';

// --- how the cultist is built, in pixels -------------------------------------------------------
/** Floor to the top of the shoulders, to the rope round the waist, to the chin. */
const SHOULDER = 40;
const ROPE = 29;
const CHIN = 42;
/** Half the width at the shoulders, at the rope and at the hem. */
const CHEST = 7;
const WAIST = 5.5;
const FLARE = 12;
/** Radius of the cowl. */
const HOOD = 7.2;
/** Seen from a corner: the nearer shoulder is this much lower, the further one this much higher. */
const NEAR_DROP = 2;
const FAR_RISE = 3;
/** The heart of a fire that is about to be thrown. */
const WHITE = '#ffffff';

function pick(a: V, b: V, score: (v: V) => number): V {
  return score(a) >= score(b) ? a : b;
}
function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
function between(a: V, b: V, k: number): V {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

// ---------------------------------------------------------------------------------------------
// Parts

/**
 * How wide a tongue of flame is from its foot (0) to its tip (1): round underneath, widest a third
 * of the way up, drawn out to a point. `fat` (0..1) rounds it out: a ball of fire, not a candle's flame.
 */
function tear(t: number, fat: number): number {
  const waist = 0.34 + 0.08 * fat;
  if (t < waist) {
    const k = 1 - t / waist;
    return Math.sqrt(1 - k * k * 0.9);
  }
  return (1 - ((t - waist) / (1 - waist)) ** (1.6 + 0.3 * fat)) ** 1.4;
}

/**
 * The tongues a fire is made of: the middle one, which is the fire's body, and two licks that
 * rise from its shoulders. Where each one's foot stands and where its tip goes (across the fire,
 * in widths of it), how high up the fire its foot is, how tall and how wide it is beside the
 * middle one, and how it flickers: how many times it rises and falls, and how many times it
 * sways, while the wind goes once round, and where in that it starts.
 */
const TONGUES: ReadonlyArray<readonly [foot: number, tip: number, up: number, tall: number, wide: number, beat: number, sway: number, phase: number]> = [
  [0, 0, 0, 1, 1, 2, 1, 0],
  [-0.55, -0.8, 0.18, 0.48, 0.36, 3, 2, 2.1],
  [0.6, 0.88, 0.24, 0.4, 0.32, 1, 3, 4.4],
];

/**
 * The fire: tongues of flame, each a teardrop of pink with gold inside it and a pale heart.
 * (fx, fy) is the middle of its foot. `size` is 1 for the flame a cultist carries and 3 for the
 * ball of fire it winds up to throw (white at the heart by then). `wind` (0..1, round its loop)
 * is what makes it live: every tongue rises, falls and leans to its own beat, and sparks go up
 * from it. `stream` bends the tips sideways (a flame carried at a walk streams back). It is
 * painted on the layer that gets no seam, and it adds its own light to `lights`.
 */
function fire(over: Px, fx: number, fy: number, size: number, wind: number, stream: number, lights: Light[]): void {
  if (size <= 0.08) return;
  const ph = wind * Math.PI * 2;
  const fat = clamp((size - 1) / 1.5, 0, 1);
  const H = 11 * size ** 0.78 * (1 + (0.07 - 0.03 * fat) * Math.sin(ph * 2 + 0.9));
  const W = 3.2 * size * (1 + (0.1 - 0.06 * fat) * Math.sin(ph * 3 + 2));
  // (a small flame is one teardrop; as it swells its licks come out of it)
  const spread = clamp(0.3 + (size - 1) * 0.5, 0.3, 1);
  // (a small flame has three tones; a big fire has room for all five, and for a white heart)
  const shells: [number, string][] = [[1, FLAME[1]], [0.72, FLAME[3]], [0.46, FLAME[4]]];
  if (size > 1.7) shells.splice(1, 0, [0.86, FLAME[2]]);
  if (size > 1.7) shells.push([0.24, WHITE]);
  const y0 = Math.round(fy);
  // (a big fire flickers faster, and keeps more of its height)
  const body = H * (1 + (0.13 - 0.06 * fat) * Math.sin(ph * 2) + (0.08 - 0.05 * fat) * Math.sin(ph * 3 + 1.1) + 0.04 * fat * Math.sin(ph * 8));
  for (const [s, colour] of shells) {
    for (const [at, tip, base, tall, wide, beat, sway, phase] of TONGUES) {
      // (only the middle tongue is white at the heart; and a lick too thin to be more than a line is not there yet)
      if (at !== 0 && (colour === WHITE || wide * W < 1.4)) continue;
      const full = at === 0 ? body : body * tall * clamp(wide * W - 0.9, 0.5, 1) * (1 + 0.22 * Math.sin(ph * beat + phase) + 0.1 * fat * Math.sin(ph * (beat + 6) + phase * 2.3));
      const lean = Math.sin(ph * sway + phase * 1.7) * 0.9 + fat * 0.3 * Math.sin(ph * 7 + phase) + stream;
      const curl = Math.sin(ph * 3 + 1.3 + phase) * 0.22 * W;
      // (an inner flame stands a little above the foot of the one round it)
      const up = Math.round(base * body) + (s < 1 ? Math.max(1, Math.round((1 - s) * full * 0.16)) : 0);
      const rows = Math.max(1, Math.round(full * s));
      // where each row of it begins and ends
      const from: number[] = [];
      const to: number[] = [];
      for (let i = 0; i < rows; i++) {
        const hw = Math.max(0.5, wide * W * s * tear(rows > 1 ? i / (rows - 1) : 0, at === 0 ? fat : 0));
        // (how far up the whole fire this row is: the higher, the further the wind carries it)
        const h = Math.min(1.2, (i + up) / Math.max(1, body));
        const mid = fx + at * W + (tip - at) * spread * W * (i / rows) ** 1.3 + lean * h * h * (1.2 + H * 0.11) + curl * (h - h * h) * 4;
        from.push(Math.round(mid - hw));
        to.push(Math.max(from[i] + 1, Math.round(mid + hw)));
      }
      // (a flame is smooth: no row stands out from the two it lies between, and its point is two rows of one pixel at the most)
      for (let i = 1; i < rows - 1; i++) {
        from[i] = Math.max(from[i], Math.min(from[i - 1], from[i + 1]));
        to[i] = Math.max(from[i] + 1, Math.min(to[i], Math.max(to[i - 1], to[i + 1])));
      }
      let top = rows;
      while (top > 3 && to[top - 3] - from[top - 3] <= 1) top--;
      // (now and then the tip of the middle tongue comes away, and goes up on its own)
      const shed = s === 1 && at === 0 && top > 7 && Math.sin(ph - 1) > 0.72 ? top - 3 : -1;
      for (let i = 0; i < top; i++) {
        if (i === shed) continue;
        for (let x = from[i]; x < to[i]; x++) over.set(x, y0 - up - i - (shed >= 0 && i > shed ? 1 : 0), colour);
      }
    }
  }
  // sparks: thrown off, they rise and go out
  const n = Math.max(1, Math.round(size * 1.7 - 0.8));
  for (let j = 0; j < n; j++) {
    const life = (wind * (1 + (j % 2)) + j * 0.37) % 1;
    if (life > 0.6) continue;
    const x = fx + (hash(j, 5, 91) - 0.5) * W * 2.2 + Math.sin(life * 5 + j) * 1.2 + stream * life * 3;
    over.set(Math.round(x), Math.round(fy - H * (0.7 + life * 0.9)), life < 0.35 ? FLAME[3] : FLAME[2]);
  }
  // its light: it grows with the fire, and breathes with it (brighter as the fire stands taller);
  // the light of a big fire throbs as well. A fire that is only kindling, or dying, gives little.
  const pulse = (body / H - 1) / 0.16;
  const throb = fat * Math.sin(ph * 8);
  lights.push({ x: fx + stream * 0.6, y: fy - H * 0.4, r: 12 + 10 * size + 4 * fat + pulse * 1.8 + throb * 2.5, color: FLAME[3], a: clamp(0.45 + 0.1 * size + pulse * 0.06 + throb * 0.03, 0, 0.8) * clamp(size / 0.6, 0, 1) });
}

/**
 * The crooked knife: a short blade with a kink in it. (hx, hy) is the fist that holds it; `deg`
 * is the way its point goes (0 = screen-right, 90 = up).
 */
function knife(p: Px, hx: number, hy: number, deg: number, steel: Ramp): void {
  const [dx, dy] = dir(deg);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  for (let y = Math.floor(hy - 13); y <= Math.ceil(hy + 13); y++) {
    for (let x = Math.floor(hx - 13); x <= Math.ceil(hx + 13); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy;
      const across = -rx * dy + ry * dx;
      if (u >= 1 && u < 2.2 && Math.abs(across) <= 2.1) p.set(x, y, steel[0]);
      if (u < 2.2 || u > 10.5) continue;
      // (past the kink the blade is set over by a pixel)
      const v = across + (u > 6.4 ? 1 : 0);
      if (Math.abs(v) > (u > 8.8 ? 0.55 : 1.05)) continue;
      p.set(x, y, v * litSide > 0 ? steel[4] : steel[2]);
    }
  }
}

/** The gravecaller's shroud: grave cloth, ashen where the cultist's robe is violet. */
const SHROUD: Ramp = ['#26244a', '#26244a', '#4e5282', '#8c92b8', '#8c92b8'];

/**
 * The gravecaller's staff: a long bone as tall as the caller, its knuckles showing, with a small
 * skull bound to the top of it whose sockets burn. It stands on the floor at (x, floor) and passes
 * through the fist at (x, hy).
 */
const STAFF_SKULL = ['.WWWW.', 'WWWWWM', 'WeWWeM', 'WWWWMM', '.WKWM.', '.WMWM.'];
function boneStaff(p: Px, x: number, hy: number, floor: number, back: boolean, lights: Light[]): void {
  const top = hy - 30;
  const bone = back ? dim(BONE) : BONE;
  for (let y = top + 5; y <= floor; y++) {
    // (a knuckle every nine rows: the bone is wider there)
    const knob = (floor - y) % 9 === 4;
    p.set(x, y, bone[3]).set(x + 1, y, bone[2]);
    if (knob) p.set(x - 1, y, bone[3]).set(x + 2, y, bone[1]);
  }
  stamp(p, x - 2, top, STAFF_SKULL, { W: bone[3], M: bone[2], K: INK, e: back ? INK : SOCKET });
  if (!back) lights.push({ x: x + 1, y: top + 2.5, r: 6, color: SOCKET, a: 0.4 });
}

/** A pale hand, palm up, holding the fire; and the same hand flung open, its fingers pointing where the fire went. */
const PALM = ['HHHH.', 'HHHHH', '.ddd.'];
const OPEN = ['HHHHHH', 'HHHHH.', '.ddd..'];
/** A fist. */
const FIST = ['HHHH', 'HHHH', 'dddd'];
function hand(p: Px, x: number, y: number, rows: ReadonlyArray<string>, ramp: Ramp): void {
  stamp(p, Math.round(x) - 2, Math.round(y) - 1, rows, { H: ramp[3], d: ramp[1] });
}

/** A bare foot under the hem: all that ever shows of it is its toes (or, from behind, its heel). */
function foot(p: Px, x: number, sole: number, far: boolean, back: boolean): void {
  // (it points along the grid: its far end a row lower facing us, a row higher facing away)
  if (back) p.rect(x + 1, sole - 1, 5, 1, BONE[far ? 2 : 3]).rect(x, sole, 5, 1, BONE[2]);
  else p.rect(x, sole - 1, 5, 1, BONE[far ? 2 : 3]).rect(x + 1, sole, 5, 1, BONE[2]);
}

// ---------------------------------------------------------------------------------------------
// The rig
//
// How a Pose is read:
//   bob, lean    the body above the hem (the hem lies on the floor and stays there). A lean arches
//                the back: the shoulders go one way and the waist a little the other.
//   near, far    the feet, under the robe: a foot that steps toward the camera carries the hem out
//                with it, and its toe shows. (nearLift, farLift: as for anything with legs.)
//   swing        the hem swings from side to side, and the knife hand with it.
//   hx, hy       the flame hand, from where it rests.
//   act          how big the flame is: 1 standing, 3 wound up to throw, 0 none.
//   pt           a lick of flame left at the fingertips when the fire has been thrown: 1, dying to 0.
//   off          the knife arm: 0 hanging, 1 flung wide, -1 swept back.
//   wind, drag   the flame, the hem, the open sleeve, the rope's end, the point of the cowl.

function cultist(q: Pose, back: boolean, caller = false, priest = false): Painted {
  const lights: Light[] = [];
  /** The robe's cloth: the cultist's violet, or the gravecaller's shroud. */
  const cloth = caller ? SHROUD : GLOOM;
  const Y = Math.round(q.bob);
  const X = KX + Math.round(q.lean);
  const WX = KX - Math.round(q.lean * 0.35);
  const sy = KAY - SHOULDER + Y;
  const ropeY = KAY - ROPE + Y;
  const floor = KAY - 1;
  const ph = q.wind * Math.PI * 2;
  const fwd = back ? -1 : 1;
  const drag = Math.min(2, q.drag);
  /** How far the fire has swelled past the flame it carries: 0 standing, 2 wound up to throw. */
  const hot = clamp(q.act - 1, 0, 2);

  const body = layer();
  const over = layer();

  // --- seen from a corner: what runs across the cultist is lowest at the corner of the body
  // nearest us and rises both ways from it. All of that at the shoulders and the rope, less and
  // less down the skirts, none at the hem. ---
  const leanAt = slant(back ? X + 3 : X - 4, 2);
  const turn = (x: number, y: number): number => leanAt(x) * (y <= ropeY + 3 ? 1 : Math.max(0, 1 - (y - ropeY - 3) / Math.max(1, floor - ropeY - 8)));
  /** How far the body's middle line is toward the side faced (away from it, seen from behind), and further out as the skirts flare. */
  const midShift = (y: number): number => fwd * (TURN + Math.round(2 * Math.max(0, Math.min(1, (y - ropeY) / Math.max(1, floor - ropeY)))));

  // --- the feet, which the robe hides: they are only painted in mid-stride ---
  /** Each foot: its left end and the row of its sole, which side of the figure it is on, and how far it has stepped toward the camera. */
  const feet: [x0: number, sole: number, left: boolean, toward: number][] = [];
  for (const near of [false, true]) {
    const f = footOf(q, near, back, true);
    const step = near ? q.near : q.far;
    const lift = near ? q.nearLift : q.farLift;
    // (the nearer foot is on screen-left facing us, on screen-right facing away)
    const left = near !== back;
    const x0 = (left ? KX - 7 : KX + 2) + f.dx;
    const sole = (near ? floor : floor - 2) + f.dy;
    const moving = Math.abs(step) > 0.05 || lift > 0.05;
    if (moving) foot(body, x0, sole, !near, back);
    feet.push([x0, sole, left, moving ? step * fwd : 0]);
  }
  const striding = feet.some((f) => f[3] !== 0);
  /** In the middle of its attack: an arm is somewhere other than where it rests. */
  const casting = q.off !== 0 || q.hx !== 0 || q.hy !== 0;
  /** Doing nothing but standing. */
  const idle = !striding && !casting;

  // --- the robe: in from the shoulders to the rope, out to the hem ---
  const hemX = KX - q.swing * 1.4 - Math.min(1.5, drag) * 0.5;
  const ahead = Math.max(0, q.near, q.far) * 1.6;
  const trail = Math.min(1.6, drag) * 1.2;
  // (a draught stirs the skirts of a cultist who stands still: they swing a little, most at the hem)
  const stir = Math.sin(ph - 0.6) * 0.9 * Math.max(0, 1 - drag);
  const down = (y: number): number => Math.max(0, (y - ropeY) / Math.max(1, floor - ropeY));
  const mid = (y: number): number => {
    if (y <= ropeY) return X + (WX - X) * ((y - sy) / Math.max(1, ropeY - sy));
    const u = down(y);
    return WX + (hemX - WX) * u + stir * u * u;
  };
  const half = (y: number, right: boolean): number => {
    if (y <= ropeY) return CHEST + (WAIST - CHEST) * ((y - sy) / Math.max(1, ropeY - sy));
    return WAIST + (FLARE + (right ? ahead : trail) - WAIST) * Math.min(1, down(y)) ** 0.8;
  };
  // the hem. It lies along the floor, and while the cultist only stands a draught lifts it here
  // and there. Striding, a foot that steps toward the camera carries it down the screen (all but
  // the toes: from behind, all but the heel), and it rides up on the side of the foot left behind.
  const bottoms = new Map<number, number>();
  const bottom = (x: number): number => {
    let b = bottoms.get(x);
    if (b === undefined) {
      b = floor - (idle ? Math.max(0, Math.round(Math.sin(ph + (x - KX) / 5) * 1.3 - 0.6)) : 0);
      for (const [x0, sole, left, toward] of feet) {
        if (toward > 0) {
          const out = Math.round((sole - floor) * Math.max(0, 1 - Math.abs(x + 0.5 - (x0 + (back ? 5 : 1))) / 5) ** 0.7);
          if (out > 0) b = Math.max(b, floor + out);
        } else if (toward < 0 && (left ? x < x0 + 4 : x > x0 + 1)) b -= Math.round(-toward * 1.2);
      }
      bottoms.set(x, b);
    }
    return b;
  };
  // (the robe, and what is on it, are painted level on a layer of their own, and then set on the grid)
  const robe = layer();
  lit(robe, cloth, HI, [LO[0], LO[1] + 1], (l) => {
    for (let y = sy; y <= floor + 4; y++) {
      const m = mid(y);
      const x0 = Math.round(m - half(y, false));
      const x1 = Math.round(m + half(y, true));
      // (the corners of the hem are round)
      for (let x = x0; x < x1; x++) if (y <= bottom(x) - (x === x0 || x === x1 - 1 ? 1 : 0)) l.set(x, y, INK);
    }
  });
  // folds: darker lines that follow the cloth down
  for (const f of back ? [-0.5, 0.08, 0.6] : [-0.55, 0.62]) {
    for (let y = ropeY + 4; y <= floor + 4; y++) {
      const x = Math.round(mid(y) + f * half(y, f > 0));
      // (a fold is broken here and there, each in its own places, which stay put as the cloth swings)
      if (robe.has(x, y) && hash(Math.round(f * 100), y, 43) > 0.2) robe.set(x, y, cloth[1]);
    }
  }
  if (!back && caller) {
    // (the gravecaller wears no stole: a string of finger bones across its chest)
    for (let k = -4; k <= 4; k += 2) {
      const x = Math.round(mid(sy + 5)) + midShift(sy + 5) + k;
      const y = sy + 5 + (2 - Math.abs(k) / 2);
      if (robe.has(x, Math.round(y))) robe.set(x, Math.round(y), BONE[3]).set(x, Math.round(y) + 1, BONE[1]);
    }
  } else if (!back) {
    // the stole: a strip of cloth down the front, with a sign on it
    const end = floor - 5 + Y;
    for (let y = sy + 2; y <= end; y++) {
      const x0 = Math.round(mid(y)) - 1 + midShift(y);
      // (a band of gold near its end)
      const band = y === end - 2;
      for (let k = 0; k < 4; k++) if (robe.has(x0 + k, y)) robe.set(x0 + k, y, band || (priest && (k === 0 || k === 3)) ? FLAME[3] : PINK[k === 0 ? 3 : k === 3 ? 1 : 2]);
    }
    // (the sign burns brighter while the fire is gathered)
    const gx = Math.round(mid(sy + 7)) + midShift(sy + 7);
    const sign = FLAME[hot > 0.6 ? 4 : 3];
    robe.rect(gx, sy + 6, 2, 2, sign).rect(gx, sy + 9, 2, 1, sign);
    if (hot > 0.6) lights.push({ x: gx + 1, y: sy + 8 + leanAt(gx), r: 6, color: FLAME[3], a: 0.14 * hot });
  }
  // the rope round the waist, one end hanging
  for (let x = Math.round(WX - WAIST) - 1; x <= Math.round(WX + WAIST); x++) {
    if (!robe.has(x, ropeY)) continue;
    robe.set(x, ropeY, BONE[x < WX - 2 ? 3 : 2]).set(x, ropeY + 1, BONE[1]);
  }
  // (from behind the knot is on the body's middle line: away from the side faced)
  const knotX = back ? WX - TURN : WX - 3;
  const dangle = Math.round(Math.sin(ph + 0.6) * 0.7 - drag * 1.2 - q.swing * 0.8);
  for (let i = 0; i < 6; i++) robe.set(knotX + Math.round((dangle * i) / 5), ropeY + 2 + i, BONE[i === 5 ? 3 : 2]);
  if (back) for (let i = 0; i < 4; i++) robe.set(knotX + 2 + Math.round((dangle * i) / 5), ropeY + 2 + i, BONE[2]);
  robe.rect(knotX - (back ? 0 : 1), ropeY, back ? 3 : 2, 2, BONE[3]);
  shearBy(robe, turn, body);

  // --- the knife arm, on screen-left ---
  // (its shoulder is the nearer one facing us, and the lower; facing away the further, and the higher)
  const kShoulder: V = [X - 6, sy + 4 + (back ? -FAR_RISE : NEAR_DROP)];
  const flung = Math.max(0, q.off);
  const swept = Math.max(0, -q.off);
  // (it swings against the leg on its own side: the nearer leg facing us, the further one facing away)
  const kSwing = back ? -q.swing : q.swing;
  const kHand: V = [X - 9 + kSwing * 1.2 - flung * 8.5 - swept * 3 + (priest ? q.ohx : 0), sy + 14 + kSwing * 1.4 * fwd - flung * 8.5 - swept + (priest ? q.ohy : 0)];
  const kElbow = pick(joint(kShoulder, kHand, 5.5, 5.5, 1), joint(kShoulder, kHand, 5.5, 5.5, -1), (v) => -v[0]);
  const kLen = Math.hypot(kHand[0] - kElbow[0], kHand[1] - kElbow[1]) || 1;
  const kDir: V = [(kHand[0] - kElbow[0]) / kLen, (kHand[1] - kElbow[1]) / kLen];
  // (the knife hangs point down from the fist, and follows the forearm when the arm is flung out)
  const kDeg = (Math.atan2(-(kDir[1] + 0.8), kDir[0] * (0.4 + flung)) * 180) / Math.PI;
  const kRamp = back ? dim(cloth) : cloth;
  const knifeL = layer();
  if (caller) boneStaff(knifeL, Math.round(kHand[0]) - 1, Math.round(kHand[1]), floor, back, lights);
  else if (priest) censerStaff(knifeL, over, kHand, floor, back, q, lights);
  else knife(knifeL, kHand[0] + kDir[0] * 0.5, kHand[1] + 1.5 + kDir[1] * 0.5, kDeg, back ? dim(STEEL) : STEEL);
  // facing us it hangs in front of the robe (under the cowl's mantle); facing away it is the far arm, behind the body
  const far = back ? layer() : body;
  const cuff: V = [kHand[0] - kDir[0] * 2, kHand[1] - kDir[1] * 2];
  // (flung out, its wide sleeve hangs open under it, as the other arm's does)
  if (flung > 0.2) lit(far, kRamp, HI, LO, (l) => l.poly([[kShoulder[0] + 1, kShoulder[1] + 2], [cuff[0] - 1, cuff[1] + 1], [cuff[0] + 2, cuff[1] + 2 + flung * 7]], INK));
  limb(far, kShoulder[0], kShoulder[1], kElbow[0], kElbow[1], 2.4, 2.7, kRamp);
  limb(far, kElbow[0], kElbow[1], cuff[0], cuff[1], 2.7, 3.3, kRamp);

  // --- the cowl: it dips slowly as the cultist stands (and with every step it takes), and goes
  // back and forward with the body. In the middle of the attack it is held still. ---
  const head = layer();
  const tilt = clamp(q.lean / 3, -1, 1);
  const nod = !casting && q.wind % 1 >= 0.25 && q.wind % 1 < 0.75 ? 1 : 0;
  const cx = X + 1.5 + tilt * 0.8;
  const cy = KAY - CHIN + Y - HOOD + 2 + nod + Math.max(0, tilt);
  const tip: V = [cx + HOOD * 0.25 + tilt * 2.2 - drag * 1.1 + Math.sin(ph + 2) * 0.4, cy - HOOD - 3 + Math.abs(tilt) * 0.8];
  // (what of the cowl lies on the shoulders leans with them: painted level, then slid by columns,
  // more the lower it lies; the round of the cowl itself is the same from every side)
  const mantleTop = Math.round(cy + HOOD * 0.5);
  const cowl = layer();
  lit(cowl, cloth, HI, back ? [0, 1] : LO, (l) => {
    l.poly([[cx - HOOD * 0.55, cy - HOOD * 0.65], tip, [cx + HOOD * 0.8, cy - HOOD * 0.5]], INK);
    // the cowl spreads onto the shoulders
    for (let y = mantleTop; y <= sy + 4; y++) {
      const t = (y - mantleTop) / Math.max(1, sy + 4 - mantleTop);
      const h = HOOD * 0.8 + (CHEST + 1 - HOOD * 0.8) * t;
      l.rect(Math.round(X + 0.5 - h), y, Math.round(h * 2), 1, INK);
    }
    // from behind, its back hangs to a point between the shoulders (which is on the middle line: away from the side faced)
    if (back) l.poly([[X - CHEST - 0.5, sy + 3], [X + CHEST + 1.5, sy + 3], [X - 0.5 - TURN, sy + 10.5]], INK);
  });
  shearBy(cowl, (x, y) => leanAt(x) * Math.max(0, Math.min(1, (y - mantleTop + 1) / Math.max(1, sy + 3 - mantleTop))), head);
  ball(head, cx, cy, HOOD, HOOD, cloth);
  if (!back) {
    // its opening: darkness, a lit rim, two eyes
    // (toward the side faced)
    const ox = cx + 2.6 + tilt * 0.6;
    const oy = cy + HOOD * 0.18 + tilt * 0.8;
    const open = inEllipse(ox, oy, HOOD * 0.62, HOOD * 0.7 - Math.max(0, tilt) * 1.2);
    const key = new Set(open.map(([x, y]) => y * KW + x));
    for (const [x, y] of open) head.set(x, y, INK);
    for (const [x, y] of open) if (!key.has(y * KW + x - 1)) head.set(x - 1, y, cloth[4]);
    const eyeY = Math.round(oy - 0.5 + tilt * 0.5);
    if (priest) mask(head, ox, oy, eyeY, hot, q.wind, lights);
    else for (const ex of [Math.round(ox - HOOD * 0.2), Math.round(ox + HOOD * 0.3)]) {
      head.set(ex, eyeY, SOCKET);
      // (they smoulder as it stands, and burn up with the fire)
      lights.push({ x: ex + 0.5, y: eyeY + 0.5, r: 5 + 0.6 * hot, color: SOCKET, a: 0.45 + 0.07 * Math.sin(ph * 2 + 1) + 0.1 * hot });
    }
  } else {
    // from behind: the fold that falls from its point down the back of it, and the fold down the middle of what hangs from it
    for (let i = 0; i < 13; i++) {
      const x = Math.round(tip[0] - 1.2 - i * 0.2);
      const y = Math.round(tip[1] + 2.5 + i);
      if (head.has(x, y)) head.set(x, y, cloth[1]);
    }
    for (let y = sy + 2; y <= sy + 8; y++) if (y !== sy + 5 && head.has(X - 1 - TURN, y + leanAt(X - 1 - TURN))) head.set(X - 1 - TURN, y + leanAt(X - 1 - TURN), cloth[1]);
  }
  // on the edge of the cowl that is turned to the flame, the flame's light
  if (q.act > 0.3) {
    for (let y = Math.round(cy - 3); y <= Math.round(cy + 3); y++) {
      for (let x = Math.round(cx + HOOD) + 1; x > cx; x--) {
        if (!head.has(x, y)) continue;
        head.set(x, y, cloth[3]);
        break;
      }
    }
  }

  // --- the flame arm, on screen-right: raised, palm up ---
  const arm = layer();
  const hands = layer();
  const rest: V = [X + 14.5, sy + 2.5 - (back ? 2 : 0)];
  const fHand: V = [rest[0] + q.hx, rest[1] + q.hy];
  // (how far the hand is lifted above the shoulder: the shoulder goes up with it, and the sleeve falls back from it)
  const raised = clamp((sy + 4 - fHand[1] - 5) / 7, 0, 1);
  // (its shoulder is the further one facing us, and the higher; facing away the nearer, and the lower)
  const fShoulder: V = [X + 6, sy + 4 - raised * 2 + (back ? NEAR_DROP : -FAR_RISE)];
  // (an arm held out toward the camera, or away from it, is seen shortened: its bones are as long as the reach asks)
  const reach = Math.hypot(fHand[0] - fShoulder[0], fHand[1] - fShoulder[1]);
  const bone = clamp(reach / 2 + 1.2 - 0.9 * clamp((reach - 9) / 6, 0, 1), 5.5, 9.2);
  const fElbow = pick(joint(fShoulder, fHand, bone, bone, 1), joint(fShoulder, fHand, bone, bone, -1), (v) => v[1] + v[0] * 0.6);
  const fLen = Math.hypot(fHand[0] - fElbow[0], fHand[1] - fElbow[1]) || 1;
  const fDir: V = [(fHand[0] - fElbow[0]) / fLen, (fHand[1] - fElbow[1]) / fLen];
  const wrist: V = [fHand[0] - fDir[0] * 1.5, fHand[1] - fDir[1] * 1.5];
  // the sleeve's mouth: at the wrist, or fallen to the elbow when the arm is lifted high
  const mouth = between(wrist, fElbow, raised * 0.95);
  // the wide sleeve hangs open below the arm, from the armpit to a point under its mouth, and stirs
  const pit: V = [fShoulder[0] - 1, fShoulder[1] + 2.5];
  const sleeveTip: V = [mouth[0] - 1.5 + Math.sin(ph + 1.1) * 1.3 - drag * 2.6, mouth[1] + 11.5 + Math.sin(ph + 2.7) * 0.6 - drag * 1.6 - raised * 2.5];
  lit(arm, cloth, HI, LO, (l) => l.poly([pit, [mouth[0] + 1.5, mouth[1] + 1], sleeveTip], INK));
  if (raised > 0.05) limb(arm, fElbow[0], fElbow[1], wrist[0], wrist[1], 1.9, 1.6, BONE);
  limb(arm, fShoulder[0], fShoulder[1], fElbow[0], fElbow[1], 2.8, 3.2, cloth);
  limb(arm, fElbow[0], fElbow[1], mouth[0], mouth[1], 3.2, 3.2 + 0.6 * (1 - raised), cloth);
  const thrown = q.act < 0.25;
  // (from behind, the sleeve hides all of that hand but its fingers)
  if (back) hand(hands, fHand[0], fHand[1], thrown ? OPEN.slice(0, 2) : PALM.slice(0, 2), BONE);
  else hand(hands, fHand[0], fHand[1], thrown ? OPEN : PALM, BONE);
  // (the knife hand: facing away it is the far one, and the body hides whatever of it is behind the body)
  const farHand = back ? layer() : hands;
  hand(farHand, kHand[0], kHand[1], FIST, back ? dim(BONE) : BONE);

  // --- the fire ---
  const fy = Math.round(fHand[1]) - 3 - (q.act > 1.5 ? 1 : 0);
  fire(over, fHand[0], fy, q.act, q.wind, -drag * 1.6, lights);
  // (thrown: a last lick of it at the fingertips, streaming back; it lingers a moment as it dies)
  // (the high priest's `pt` is his censer's, while it pours out smoke: `prop` 1)
  if (q.pt > 0.02 && !(priest && q.prop >= 1)) fire(over, fHand[0] + 3, Math.round(fHand[1]) - 2, Math.sqrt(q.pt) * 0.9, q.wind, -3, lights);

  const layers = back ? [knifeL, far, farHand, body, head, arm, hands] : [body, knifeL, head, arm, hands];
  return { px: compose(null, layers, over), lights };
}

// ---------------------------------------------------------------------------------------------
// Animations
//
// Standing and walking are the kit's own loops, read as the notes above the rig say. The attack is
// mkit's strike (rest, wound up, the wound-up pose held as the player's warning, the blow at `hit`,
// the follow-through, rest again 0.3 s after the blow) with three things added to it: while the
// pose is held the fire goes on swelling and the back goes on arching; just before the blow there
// is one more key, the arm coming over the top, so that the hand goes round in an arc as a throw
// does; and the fire stays in the hand, as big as ever, until the very moment of the blow.

/** How long the game waits between the start of the cultist's attack and its landing (game/defs.ts, MONSTERS: windup). */
const HIT = 0.75;

function hurl(wound: Partial<Pose>, held: Partial<Pose>, over: Partial<Pose>, blow: Partial<Pose>, after: Partial<Pose>): Timeline {
  const t = strike(HIT, wound, blow, after);
  const keys: Key[] = t.keys.map((k) => ({ ...k }));
  // (as strike lays them out: 0 rest, 1 wound up, 2 the end of the hold, 3 the blow, 4 after it, 5 rest)
  keys[2].pose = { ...keys[2].pose, ...held };
  // the arm comes over the top, and down to the blow with the fire still in the hand ...
  keys[3] = { at: HIT, pose: { ...blow, act: over.act ?? 0, pt: 0 }, ease: 'lin' };
  keys.splice(3, 0, { at: HIT - 0.04, pose: over, ease: 'in' });
  // ... and at the blow the fire is gone from it, all at once (the game draws the bolt from that moment)
  keys.splice(5, 0, { at: HIT + 0.002, pose: blow, ease: 'hold' });
  return { keys, hit: HIT };
}

// ---------------------------------------------------------------------------------------------
// Its death: it crumples, and its fire goes out
//
// The owner, 5 Oct 2026: "I think we want death animations and corpses for enemies." What he was
// told of this one: the cultist crumples and his fire goes out.
//
// Struck, it is thrown back on its heels, its arms flung out, and the flame in its hand gutters.
// Its knees give under the robe and it sinks, the flame dying to a lick at its fingertips and then
// to nothing, the light going out of its eyes. Then it goes over backward, away from whatever it
// was facing, and lies along the floor in its robe, the knife still in its fist. Down to the last
// part it is the rig's own cultist; lying, it is that same picture laid over (art/death.ts).

/**
 * ITS DEATH (painted again on 6 Oct 2026). The owner saw the first one filmed (it sank, went over
 * backward and lay like a felled body) and said: "the brutes and the cloak guys arent very good",
 * and of the cloaks: "have the cloaks just crumple to the ground like they're empty".
 *
 * So there is nobody in it. It shudders, and its fire flares; then whatever stood in the robe is
 * gone (the eyes, the hands, the fire: all at once), and what is left is cloth and a knife. The
 * robe folds straight down onto its own hem; the empty cowl comes down after it and lands on the
 * heap; the knife drops from where the hand was and lies beside it. Its body is that heap.
 */
function cultistDeath(k: number, back: boolean): Painted {
  /** How much of the death is the shudder before it is empty. */
  const SHUDDER = 0.14;
  if (k < SHUDDER) {
    const u = k / SHUDDER;
    return cultist({ ...REST, act: 1 + 1.4 * Math.sin(u * Math.PI), lean: -1.5 * u, bob: Math.floor(u * 4) % 2, hy: -3 * u, wind: 0.2 * u, drag: 0.5 * u }, back);
  }
  const stood = cultist({ ...REST, act: 0, lean: -1.5, hy: -3, wind: 0.2, drag: 0.5 }, back);
  // what is cloth, what is the knife, and what was whoever wore it (which is gone)
  const cloth = new Px(KW, KH);
  const blade = new Px(KW, KH);
  stood.px.each((x, y, c) => {
    if (STEEL.includes(c)) blade.set(x, y, c);
    // (the eyes were lights in the dark of the cowl: the dark is still there)
    else if (c === SOCKET) cloth.set(x, y, INK);
    else if (!FLAME.includes(c) && !BONE.includes(c) && c !== WHITE) cloth.set(x, y, c);
    return undefined;
  });
  const neck = KAY - SHOULDER + 1;
  const u = (k - SHUDDER) / (1 - SHUDDER);
  const px = fallen(
    [
      { px: cloth, box: [0, neck, KW, KH], to: [KX, KAY + 1], flat: 0.27, from: 0, until: 0.62 },
      { px: blade, to: [KX + (back ? 13 : -13), KAY + 1], turns: back ? 1 : -1, from: 0, until: 0.5, hop: 2, bounce: 1.5 },
      // (the cowl rides down on the robe as it folds, so they come down as one garment, and settles on the heap a moment after)
      { px: cloth, box: [0, 0, KW, neck], to: [KX + (back ? -2 : 2), KAY - 8], flat: 0.7, from: 0, until: 0.66, bounce: 1.5 },
    ],
    u, KW, KH, INK,
  );
  return { px, lights: [] };
}

/** (Its death was switched off from 5 Oct 2026, 23:14, until it was painted again: see cultistDeath.) */
const DEATH_PAINTED = true;

/** How the cultist stands, and how it throws its fire: the timelines of its two views. */
function cultMoves(): { front: { attack: Timeline }; backMoves: { attack: Timeline } } {
  const front = {
    attack: hurl(
      { lean: -2, bob: -1, hx: -3.5, hy: -18, act: 2.6, off: 1, wind: 0.15 },
      { lean: -3, act: 3 },
      { lean: 0, hx: 5, hy: -12, act: 2.8, off: 0.2, wind: 0.4, drag: 1 },
      { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 5, hy: 7, act: 0, pt: 1, off: -1, wind: 0.45, drag: 1.6 },
      { lean: 3, bob: 2, near: 0.5, far: -0.2, hx: 4, hy: 9, act: 0, off: -0.5, wind: 0.75, drag: 0.6 },
    ),
  };
  const backMoves = {
    attack: hurl(
      { lean: -2, bob: -1, hx: -3.5, hy: -16, act: 2.6, off: 1, wind: 0.15 },
      { lean: -3, act: 3 },
      { lean: 0, hx: 4, hy: -14, act: 2.8, off: 0.2, wind: 0.4, drag: 1 },
      { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 4, hy: -3, act: 0, pt: 1, off: -1, wind: 0.45, drag: 1.6 },
      { lean: 3, bob: 2, near: 0.5, far: -0.2, hx: 3, hy: -1, act: 0, off: -0.5, wind: 0.75, drag: 0.6 },
    ),
  };
  return { front, backMoves };
}

/**
 * THE GRAVECALLER (a new monster; art only so far, painted on 6 Oct 2026 for the owner to see): the
 * cultist's rig in a shroud of grave cloth, a string of finger bones at its collar, and a staff of
 * bone with a skull on it where the cultist holds its knife. The idea: it stands well back and
 * raises the bodies on the floor. It has no rules, no death, and is in no dungeon:
 * `src/dev/preview_m_gravecaller.ts` is the only thing that makes it.
 */
export function makeGravecallerArt(): ActorArt {
  const { front, backMoves } = cultMoves();
  return monsterArt((q, back) => cultist(q, back, true), front, backMoves, { rest: { act: 1 }, walkFps: 12 });
}

/** The cultist. */
export function makeCultistArt(): ActorArt {
  const { front, backMoves } = cultMoves();
  // (it does not hurry: its steps are a little slower than a hero's)
  return monsterArt(paintCultist, DEATH_PAINTED ? { ...front, die: (k) => cultistDeath(k, false) } : front, DEATH_PAINTED ? { ...backMoves, die: (k) => cultistDeath(k, true) } : backMoves, { rest: { act: 1 }, walkFps: 14, dieTime: 0.95 });
}

/** One frame of the cultist, as a painting. */
export function paintCultist(q: Pose, back: boolean): Painted {
  return cultist(q, back);
}

// =============================================================================================
// THE HIGH PRIEST: A YELLOW PACK'S LEADER OF CULTISTS (the art chat, 9 Oct 2026). A MOCK-UP: NOT IN
// THE GAME, as the gravecaller is: nothing of the game makes him (`makeHighPriestArt`).
//
// Asked in the art chat who should lead each kind of yellow pack, his pick for the cultists: "A high
// priest (Recommended)". His brief (the art rulebook's "A new character"), asked as a pop-up and
// answered by 14:41: "Their size" (offered as "As tall as they are; you know him by his mask and his
// censer."); "A slow procession (Recommended)"; "His robe crumples empty (Recommended)"; and for the
// Sound chat, "A chant and a chain's clink (Recommended)".
//
// So he is one of his cultists (the rig above), as tall as they are, known by two things: A MASK, a
// smooth face of old ivory in the dark of his cowl, its eye slits slanting down, the pink burning in
// them, a mark of gold on its brow; and HIS CENSER, which hangs on a chain from the iron crook of a
// tall staff of dark wood (in his left hand, where a cultist holds its knife): a round iron vessel,
// fire showing through its holes and licking from its top, smoke rising from it. His stole is edged
// in gold. The flame in his right hand is his cultists'.
//   standing   his censer sways on its chain, smoking.
//   walking    A SLOW PROCESSION: short, gliding steps under the robe, the staff carried upright,
//              the censer swinging on its chain with his steps and trailing smoke.
//   attack     his fire bolt: as his cultists throw theirs (his staff stays where it is).
//   moves.censer  HIS OWN: he raises his staff and swings the censer back on its chain, where it
//              flares and pours smoke (the warning, held); then swings it round and out before
//              him, its burning smoke streaming along the arc it goes through. (Where the smoke
//              settles, and how it burns, are the rules': its cloud on the floor is
//              art/mob_shots.ts drawBurningSmoke.)
//   death      HIS ROBE CRUMPLES EMPTY, as his cultists' do; his staff topples, his censer rolls
//              away spilling fire; and his mask, left hanging in the air where his face was, its
//              eyes still burning, falls last onto the heap.
//
// How the rig reads a pose for him, over and above a cultist's:
//   aim        his staff: 90 upright, less with its top toward the side he faces
//   ohx, ohy   his staff hand, moved from where it rests (pixels)
//   gale       his censer on its chain: degrees from hanging straight down, + toward the side faced
//   sweep      how far his censer has just swung: its burning smoke streams along that arc
//   prop, pt   prop 1: his censer pours out smoke, `pt` how hard (0..1)

/** His mask: old ivory (not the bone of the dead: it is a thing made). */
export const MASK: Ramp = ['#463a64', '#463a64', '#9288c2', '#d4cbef', '#d4cbef'];
/** His staff: dark wood. */
const STAFF_WOOD: Ramp = dim(INDIGO);
/** The smoke from his censer, dark to light. */
const SMOKE: readonly string[] = ['#3e3658', '#5c547c', '#847ca6'];
/** His staff, from his fist up to its crook and down to its foot; and the chain his censer hangs on (pixels). */
const STAFF_UP = 31;
const STAFF_DOWN = 26;
const CHAIN = 13;

/**
 * HIS MASK, in the opening of his cowl (`ox`, `oy` its middle; `eyeY` the row of the eyes): a smooth
 * oval of ivory lit from the upper left, its eye slits slanting down toward its middle with the pink
 * burning in them (hotter with the fire in his hand), a thin dark mouth, a mark of gold on its brow.
 */
function mask(p: Px, ox: number, oy: number, eyeY: number, hot: number, wind: number, lights: Light[]): void {
  const mx = ox + 0.3;
  const my = oy + 0.6;
  const rx = HOOD * 0.5;
  const ry = HOOD * 0.62;
  for (let y = Math.floor(my - ry); y <= Math.ceil(my + ry); y++) {
    for (let x = Math.floor(mx - rx); x <= Math.ceil(mx + rx); x++) {
      const u = (x + 0.5 - mx) / rx;
      const v = (y + 0.5 - my) / ry;
      if (u * u + v * v > 1) continue;
      p.set(x, y, MASK[u + v < -0.75 ? 3 : u + v > 0.85 ? 1 : 2]);
    }
  }
  const ph = wind * Math.PI * 2;
  for (const [ex, side] of [[Math.round(ox - HOOD * 0.2), -1], [Math.round(ox + HOOD * 0.3), 1]] as const) {
    // (a slit: its outer end higher, the pink burning in its middle)
    p.set(ex + side, eyeY - 1, INK);
    p.set(ex, eyeY, SOCKET);
    p.set(ex - side, eyeY, INK);
    lights.push({ x: ex + 0.5, y: eyeY + 0.5, r: 5 + 0.6 * hot, color: SOCKET, a: 0.5 + 0.07 * Math.sin(ph * 2 + 1) + 0.1 * hot });
  }
  const mouth = Math.round(my + ry * 0.5);
  for (let x = Math.round(mx) - 1; x <= Math.round(mx) + 1; x++) p.set(x, mouth, MASK[1]);
  p.set(Math.round(mx), Math.round(my - ry * 0.62), FLAME[3]);
}

/** A puff of smoke: a round of it, thinner (more holes) the older it is (`age` 0..1). */
function puff(p: Px, x: number, y: number, r: number, age: number, seed: number): void {
  const c = age < 0.35 ? SMOKE[2] : age < 0.7 ? SMOKE[1] : SMOKE[0];
  for (let j = Math.floor(y - r); j <= Math.ceil(y + r); j++) {
    for (let i = Math.floor(x - r); i <= Math.ceil(x + r); i++) {
      const d = Math.hypot(i + 0.5 - x, j + 0.5 - y);
      if (d > r) continue;
      if (hash(i * 7 + seed, j, 47) < age * 0.6 + (d / Math.max(0.5, r)) * 0.35) continue;
      p.set(i, j, c);
    }
  }
}

/**
 * HIS STAFF AND HIS CENSER: the staff through his fist (`hand`) at `q.aim`, its foot on the floor when
 * it is upright and his hand at rest; an iron crook at its top, curling out away from him; the chain
 * hanging from it at `q.gale` (swaying with the air as he stands, `wind`, and with the lean of his
 * body); the censer at its end, a round iron vessel, fire in its holes and licking from its top,
 * smoke rising from it. Pouring (`prop` 1, `pt` how hard), its fire flares and the smoke pours out,
 * and along the arc it has just swung through (`sweep`) its burning smoke streams.
 */
function censerStaff(p: Px, over: Px, hand: V, floor: number, back: boolean, q: Pose, lights: Light[]): void {
  const wood = back ? dim(STAFF_WOOD) : STAFF_WOOD;
  const iron = back ? dim(IRON) : IRON;
  const [dx, dy] = dir(q.aim);
  const top: V = [hand[0] + dx * STAFF_UP, hand[1] + dy * STAFF_UP];
  const foot: V = [hand[0] - dx * STAFF_DOWN, Math.min(floor, hand[1] - dy * STAFF_DOWN)];
  limb(p, foot[0], foot[1], top[0], top[1], 1.05, 0.95, wood);
  // the crook: up from the top of the staff, then out away from him, and down to where the chain hangs
  const c1: V = [top[0] + dx * 2, top[1] + dy * 2];
  const c2: V = [c1[0] - 2.6, c1[1] - 0.6];
  const hook: V = [c2[0] - 1.2, c2[1] + 2.2];
  limb(p, top[0], top[1], c1[0], c1[1], 0.85, 0.8, iron);
  limb(p, c1[0], c1[1], c2[0], c2[1], 0.8, 0.75, iron);
  limb(p, c2[0], c2[1], hook[0], hook[1], 0.75, 0.6, iron);
  // the chain, at its angle
  const flare = q.prop >= 1 ? clamp(q.pt, 0, 1) : 0;
  const th = ((q.gale + 9 * Math.sin(q.wind * Math.PI * 2 + 0.7) * (1 - flare) + q.lean * 3) * Math.PI) / 180;
  const cx0 = Math.sin(th);
  const cy0 = Math.cos(th);
  for (let i = 1; i <= CHAIN; i++) {
    if (i % 3 === 0) continue;
    p.set(Math.round(hook[0] + cx0 * i), Math.round(hook[1] + cy0 * i), i % 3 === 1 ? iron[3] : iron[2]);
  }
  const c: V = [hook[0] + cx0 * (CHAIN + 4.5), hook[1] + cy0 * (CHAIN + 4.5)];
  // the censer: a round iron vessel, its lid a little darker under a rim, a knob where the chain is made fast
  ball(p, c[0], c[1], 4.2, 3.8, iron);
  for (let x = Math.round(c[0] - 3); x <= Math.round(c[0] + 3); x++) p.set(x, Math.round(c[1] - 1), iron[1]);
  for (let x = Math.round(c[0] - 1); x <= Math.round(c[0] + 1); x++) p.set(x, Math.round(c[1] - 4), iron[3]);
  p.set(Math.round(c[0]), Math.round(c[1] - 5), iron[3]);
  // fire in its holes: a band of them round its belly, and one under the rim
  const hole = flare > 0.5 ? FLAME[4] : FLAME[3];
  for (const k of [-3, -1, 1, 3]) p.set(Math.round(c[0] + k), Math.round(c[1] + 1), Math.abs(k) === 1 ? hole : FLAME[2]);
  for (const k of [-2, 0, 2]) p.set(Math.round(c[0] + k), Math.round(c[1] + 2.6), FLAME[1]);
  p.set(Math.round(c[0] + 1), Math.round(c[1] - 2), FLAME[2]);
  // and licking from its top (on the layer with no seam), its light
  fire(over, c[0] - cx0 * 2.5, Math.round(c[1] - 4.5), 0.35 + 0.75 * flare, q.wind, -q.drag * 1.2 - cx0 * 1.5, lights);
  lights.push({ x: c[0], y: c[1], r: 8 + 8 * flare, color: FLAME[3], a: 0.32 + 0.35 * flare });
  // the smoke rising from it, carried back as he walks
  const puffs = 4 + Math.round(4 * flare);
  for (let j = 0; j < puffs; j++) {
    const age = (q.wind * 2 + j / puffs) % 1;
    const x = c[0] + Math.sin(age * 4 + j) * 1.4 - q.drag * age * 7 - cx0 * age * 4;
    const y = c[1] - 6 - age * (12 + 6 * flare);
    puff(over, x, y, 0.8 + age * (1.6 + flare), age, j * 13);
  }
  // pouring as it swings: burning smoke along the arc it has just come through, thickest where it is now
  if (flare > 0.05 && q.sweep > 4) {
    const n = Math.max(2, Math.round(q.sweep / 10));
    for (let i = 1; i <= n; i++) {
      const back1 = i / n;
      const a = th - ((q.sweep * back1) * Math.PI) / 180;
      const x = hook[0] + Math.sin(a) * (CHAIN + 4.5);
      const y = hook[1] + Math.cos(a) * (CHAIN + 4.5);
      puff(over, x, y, 2.4 - back1 * 0.9, 0.2 + back1 * 0.7, i * 31);
      if (hash(i, 3, 53) < 0.8 * flare) over.set(Math.round(x + (hash(i, 4, 53) - 0.5) * 3), Math.round(y + (hash(i, 5, 53) - 0.5) * 3), back1 < 0.4 ? FLAME[4] : FLAME[3]);
    }
  }
}

/** His walk, A SLOW PROCESSION (his pick by 14:41): eight poses at nine a second; short gliding steps under the robe, hardly a bob; his staff carried upright; his censer swinging on its chain with his steps. */
export const PROCESSION_FPS = 9;
const PROCESSION: Partial<Pose>[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return {
    near: -Math.cos(a) * 0.55,
    nearLift: Math.max(0, Math.sin(a)) * 0.35,
    far: Math.cos(a) * 0.55,
    farLift: Math.max(0, -Math.sin(a)) * 0.35,
    bob: i % 4 === 2 ? 1 : 0,
    lean: 0,
    swing: Math.cos(a) * 0.25,
    wind: ((i / 8) * 2) % 1,
    drag: 0.55,
    ohy: -1.5,
    gale: 26 * Math.sin(a - 0.9),
  };
});

/** The moment his censer's swing is at its widest (its rules are the main chat's). */
export const CENSER_HIT = 0.8;
/** HIS CENSER SWUNG: raised, swung back on its chain, flaring and pouring smoke (held: the warning); then round and out before him, its burning smoke streaming along the arc. */
function censerSwing(back: boolean): Timeline {
  const H = CENSER_HIT;
  const lift = back ? -1 : 0;
  const wound: Partial<Pose> = { ohx: -3, ohy: -7 + lift, aim: 115, gale: -100, act: 1.3, lean: -2, bob: -1, prop: 1, pt: 0.35, wind: 0.15 };
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 0.32, pose: wound, ease: 'out' },
      { at: 0.55, pose: { ...wound, gale: -108, pt: 0.6, wind: 0.3 }, ease: 'lin' },
      // (the swing: down under the crook and up and out before him, pouring burning smoke all the way)
      { at: H - 0.06, pose: { ...wound, ohx: -1, aim: 100, gale: -60, sweep: 40, pt: 0.8, wind: 0.36 }, ease: 'in' },
      { at: H, pose: { ohx: 6, ohy: -3 + lift, aim: 48, gale: 75, sweep: 170, act: 1.2, lean: 2.5, bob: 1, prop: 1, pt: 1, wind: 0.42, drag: 1 }, ease: 'lin' },
      { at: H + 0.1, pose: { ohx: 7, ohy: -2 + lift, aim: 42, gale: 95, sweep: 30, act: 1.1, lean: 3, bob: 1, prop: 1, pt: 0.85, wind: 0.5, drag: 1 }, ease: 'out' },
      { at: H + 0.32, pose: { ohx: 3, ohy: -1, aim: 70, gale: 20, sweep: 0, act: 1, lean: 1, prop: 1, pt: 0.4, wind: 0.72, drag: 0.4 }, ease: 'io' },
      { at: H + 0.6, pose: { wind: 1 }, ease: 'io' },
    ],
  };
}

/** His fire bolt: his cultists' throw (cultMoves), his staff kept where it is. */
function priestMoves(): { front: { attack: Timeline }; backMoves: { attack: Timeline } } {
  const { front, backMoves } = cultMoves();
  const still = (t: Timeline): Timeline => ({ ...t, keys: t.keys.map((k) => ({ ...k, pose: { ...k.pose, off: 0 } })) });
  return { front: { attack: still(front.attack) }, backMoves: { attack: still(backMoves.attack) } };
}

/** How long his death takes (seconds). */
export const PRIEST_DIE_TIME = 1.5;
/** When, of his death (0..1), his mask lets go and falls. */
const MASK_FALLS = 0.5;
/**
 * HIS DEATH: HIS ROBE CRUMPLES EMPTY (his pick by 14:41), as his cultists' do (cultistDeath): a
 * shudder, his fire and his censer flaring; then there is nobody in the robe, and it folds down onto
 * its hem, the cowl coming down on it; his staff topples; his censer drops from its chain and rolls
 * away, spilling fire that burns a moment on the floor; and his mask, left hanging where his face
 * was, its eyes still burning, falls last onto the heap, and goes dark.
 */
function priestDeath(k: number, back: boolean): Painted {
  const SHUDDER = 0.1;
  if (k < SHUDDER) {
    const u = k / SHUDDER;
    return cultist({ ...REST, act: 1 + 1.4 * Math.sin(u * Math.PI), lean: -1.5 * u, bob: Math.floor(u * 4) % 2, hy: -3 * u, wind: 0.2 * u, drag: 0.5 * u, prop: 1, pt: Math.sin(u * Math.PI), gale: -20 * u }, back, false, true);
  }
  const stood = cultist({ ...REST, act: 0, lean: -1.5, hy: -3, wind: 0.2, drag: 0.5, gale: -20 }, back, false, true);
  // what is cloth, what is his mask, his staff, his censer and its chain; and what was whoever wore them (which is gone)
  const cloth = new Px(KW, KH);
  const face = new Px(KW, KH);
  const faceDark = new Px(KW, KH);
  const staff = new Px(KW, KH);
  const censer = new Px(KW, KH);
  const woodAll = [...STAFF_WOOD, ...dim(STAFF_WOOD)];
  const ironAll = [...IRON, ...dim(IRON)];
  stood.px.each((x, y, c) => {
    if (MASK.includes(c)) {
      face.set(x, y, c);
      faceDark.set(x, y, c);
    } else if (c === SOCKET) {
      // (the eyes of his mask, the only pink on him: lit while it hangs there, dark once it falls)
      face.set(x, y, c);
      faceDark.set(x, y, INK);
    } else if (woodAll.includes(c)) staff.set(x, y, c);
    else if (ironAll.includes(c)) censer.set(x, y, c);
    else if (!FLAME.includes(c) && !BONE.includes(c) && c !== WHITE && !SMOKE.includes(c)) cloth.set(x, y, c);
    return undefined;
  });
  const neck = KAY - SHOULDER + 1;
  const u = (k - SHUDDER) / (1 - SHUDDER);
  const side = back ? 1 : -1;
  const rolled: V = [KX + side * -22, KAY + 1];
  const px = fallen(
    [
      { px: cloth, box: [0, neck, KW, KH], to: [KX, KAY + 1], flat: 0.27, from: 0, until: 0.5 },
      { px: staff, to: [KX + side * 15, KAY + 1], turns: side, topple: true, from: 0.04, until: 0.55, bounce: 1 },
      { px: censer, to: rolled, turns: 2 * -side, from: 0.06, until: 0.62, hop: 3, bounce: 2 },
      { px: cloth, box: [0, 0, KW, neck], to: [KX + (back ? -2 : 2), KAY - 8], flat: 0.7, from: 0, until: 0.55, bounce: 1.5 },
      // (his mask, last: it hangs where his face was, its eyes burning, until the robe is down; then it falls onto the heap)
      { px: u < MASK_FALLS + 0.05 ? face : faceDark, to: [KX + (back ? -1 : 2), KAY - 5], from: MASK_FALLS, until: 0.82, bounce: 1.2 },
    ],
    u, KW, KH, INK,
  );
  // the fire spilled from his censer as it rolled: a moment burning on the floor where it went, dying
  const lights: Light[] = [];
  if (u > 0.3 && u < 0.98) {
    const burn = Math.sin(((u - 0.3) / 0.68) * Math.PI);
    for (const [f, size] of [[0.45, 0.55], [0.75, 0.4], [1, 0.7]] as const) {
      const x = KX + (rolled[0] - KX) * f;
      if ((u - 0.3) / 0.32 < f) continue;
      fire(px, x, KAY - 1, size * burn, u * 3 + f, 0, lights);
    }
  }
  return { px, lights };
}

/** A move of his besides his attack, as the game holds a clip: its frames as monsterArt paints them (his pink edge, his pool of light). */
function priestClip(t: Timeline, back: boolean): Clip {
  const g = onGrid(t);
  const poses = clipPoses(g.keys, { ...REST, act: 1 }, CLIP_FPS);
  const frames = lazyFrames(poses.length, (i) => {
    const f = cultist(poses[i], back, false, true);
    edge(f.px, ENEMY_RIM);
    return toSprite(f, MENACE, KAX, KAY);
  });
  const c: Clip = { frames, fps: CLIP_FPS };
  if (g.hit !== undefined) c.hit = g.hit;
  return c;
}

/** THE HIGH PRIEST, as the game holds a monster: his stand, his procession, his fire bolt (`attack`), his death, and his own move (`clips.moves.censer`). */
export function makeHighPriestArt(): ActorArt {
  const { front, backMoves } = priestMoves();
  const art = monsterArt((q, back) => cultist(q, back, false, true), { ...front, die: (k) => priestDeath(k, false) }, { ...backMoves, die: (k) => priestDeath(k, true) }, { rest: { act: 1 }, walk: PROCESSION, walkFps: PROCESSION_FPS, dieTime: PRIEST_DIE_TIME });
  for (const [set, back] of [[art.front, false], [art.back, true]] as const) set.clips = { ...set.clips, moves: { censer: priestClip(censerSwing(back), back) } };
  return art;
}

/** One frame of the high priest, as a painting (for pictures). */
export function paintHighPriest(q: Pose, back: boolean): Painted {
  return cultist(q, back, false, true);
}
