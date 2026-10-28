// WHAT THE DEMON'S SWIPES LEAVE, AND DO (the art chat, 27 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His word of its swipe, 25 Oct: “I think smoke step but it’s much more violent.  But maybe pounce.  Let’s see both.”
// Both (dev/demon_moves.ts pounceMove, smokeStepMove), six tiles the way you swipe, as the other heroes' swipes go; each
// cursing what it strikes, as its claw rakes do (his word of 25 Oct, “So I think the tap claw rake has to apply the curse
// as well”), and every one struck by the rules of hits (Hits 3, 4: it flashes, it is knocked back, a scrap of its robe
// and a little blood fly off it). All of it in real shapes (How art is made 9): flames, broken stone, smoke, torn cloth.
//
// THE POUNCE: as it springs, the floor under its hooves cracks and a blast of its fire and stone is kicked out behind it;
// as it lands its claws slam into the floor, which cracks open under them, its fire bursting up between them, stone flung
// and dust rolling out; whoever is where it lands is knocked back and cursed.
// THE SMOKE STEP: its smoke boils up off it as it coils; it bursts into smoke in a blast where it stood; a storm of black
// smoke tears along the floor with its hellfire flickering in it and its eyes burning in its front, its talons scoring
// the floor under it, a river of its smoke left flowing along the floor behind (his word of the man's, “I like it flowing
// on the ground, with smoke billowing up”); whoever it passes through is raked aside and cursed; at the far end it bursts
// out of the smoke slamming its claws into the floor, knocking back whoever is there.

import { UNITS_PER_TILE } from '../art/moves3';
import { project, solve } from '../art/skeleton';
import type { Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { Px } from '../engine/px';
import { noise2 } from './sculpt_warlock';
import { DEMON_B } from './sculpt_demon_rig';
import { DEMON_STANCE, FR, PN, SS, SWIPE_REACH, demonPose } from './demon_moves';
import type { DemonMove } from './demon_moves';
import { BLOOD, PIT, chunk, crackStar, drawCrack, dust, embers, flung, jet, laid, landedAt, onRig, rag, scrap } from './demon_fx';
import type { ToScene } from './demon_fx';
import { Light, TARGET_BOX, burst, cloud, smolder } from './warlock_fx';

const T = UNITS_PER_TILE;
/** The scene: room for the six tiles of it, its picture (RIG_CANVAS) where it starts at (`ox`, `oy`) as seen from in front or behind. */
export const SWIPE_SCENE = { w: 660, h: 500 };
const AT = { front: { ox: 10, oy: 30 }, back: { ox: 10, oy: 150 } };
const origin = (view: GameView): { ox: number; oy: number } => (view === 'back' ? AT.back : AT.front);
/** Where a point (its own measure, where it starts) is in the scene. */
export function swipeTo(view: GameView, turn = 0): ToScene {
  const o = origin(view);
  return (p) => {
    const [x, y] = onRig(p, view, turn);
    return [x + o.ox, y + o.oy];
  };
}
/** How near the eye a point is (more is nearer). */
export function swipeNear(p: V3, view: GameView, turn = 0): number {
  const a = (turn * Math.PI) / 180;
  const q: V3 = [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  return project(q, view === 'back' ? 'rear' : view)[2];
}
/** Where its picture goes in the scene at a moment of a swipe (its top left), carried as far as it has gone. */
export function swipeCanvas(m: DemonMove, t: number, view: GameView, turn = 0): [number, number] {
  const S = swipeTo(view, turn);
  const [x0, y0] = S([0, 0, 0]);
  const [x1, y1] = S([m.along?.(t) ?? 0, 0, 0]);
  const o = origin(view);
  return [Math.round(o.ox + x1 - x0), Math.round(o.oy + y1 - y0)];
}
/** The ones in its way (its own measure, forward and to its left): beside the line it takes, on its left and its right; and one just past where it ends. */
export const SWIPE_TARGETS: readonly { x: number; y: number }[] = [
  { x: 2.2 * T, y: 0.75 * T },
  { x: 4.0 * T, y: -0.75 * T },
  { x: 7.3 * T, y: 0.9 * T },
];
/** Where its claws come down at the far end, and where it is when they do (its middle, between them). */
const ENDS = { lx: SWIPE_REACH + DEMON_STANCE.lhx, ly: DEMON_STANCE.lhy, rx: SWIPE_REACH + DEMON_STANCE.rhx, ry: DEMON_STANCE.rhy };
const ENDS_MID: [number, number] = [(ENDS.lx + ENDS.rx) / 2, 0];
const hash = (i: number): number => {
  const x = Math.sin(i * 73.3 + 11.9) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const eased = (u: number): number => {
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
};

// ---- WHO IS STRUCK, WHEN, FROM WHERE
/** How far ahead of where it is the smoke step's storm reaches (its own measure): where it takes the ones it passes. */
const STORM_LEAD = 34;
/** The frame (at thirty a second) at which the smoke step's storm, or the pounce's landing, reaches each; and from where it is struck; heavy as it lands. */
interface Blow {
  f: number;
  from: [number, number];
  heavy: boolean;
}
function blowsOf(m: DemonMove): (Blow | null)[] {
  if (m.name.includes('pounce')) return [null, null, { f: PN.land, from: ENDS_MID, heavy: true }];
  return SWIPE_TARGETS.map((p, i) => {
    if (i === 2) return { f: SS.slam, from: ENDS_MID, heavy: true };
    // (the first frame its storm's front is past it; struck from the line it takes, so thrown off it to the side)
    let f = SS.burst;
    while (f < SS.slam && (m.along?.(f * FR) ?? 0) + STORM_LEAD < p.x) f += 0.25;
    return { f, from: [p.x, 0] as [number, number], heavy: false };
  });
}
/** How one struck is thrown (frames, its own measure, pixels, degrees): held in its flash, then off its feet; heavier from its landing. */
const THROW = { heavy: { flight: 7, back: 11, high: 12, tilt: 17 }, light: { flight: 6, back: 8, high: 8, tilt: 13 }, flash: 2, skid: 2, skidFor: 3 };

/** One in its way at a moment: where it stands in the scene, lifted, rocked (radians, its head away from the blow), in its flash; how near the eye; how long since it was cursed (seconds; less than nothing, not yet). */
export interface Swiped {
  gx: number;
  gy: number;
  lift: number;
  tilt: number;
  flash: boolean;
  near: number;
  cursed: number;
}
export function swipedAt(m: DemonMove, i: number, t: number, view: GameView, turn = 0): Swiped {
  const p = SWIPE_TARGETS[i];
  const S = swipeTo(view, turn);
  const b = blowsOf(m)[i];
  const rest = (): Swiped => {
    const [gx, gy] = S([p.x, p.y, 0]);
    return { gx, gy, lift: 0, tilt: 0, flash: false, near: swipeNear([p.x, p.y, 0], view, turn), cursed: -1 };
  };
  if (!b) return rest();
  const f = t / FR - b.f;
  if (f < 0) return rest();
  const K = b.heavy ? THROW.heavy : THROW.light;
  const ax = p.x - b.from[0];
  const ay = p.y - b.from[1];
  const al = Math.hypot(ax, ay) || 1;
  const s = f - THROW.flash;
  const air = Math.max(0, Math.min(K.flight, s));
  const sk = Math.max(0, Math.min(THROW.skidFor, s - K.flight)) / THROW.skidFor;
  const back = s <= 0 ? 0 : (K.back * air) / K.flight + THROW.skid * (1 - (1 - sk) * (1 - sk));
  const at: V3 = [p.x + (ax / al) * back, p.y + (ay / al) * back, 0];
  const [gx, gy] = S(at);
  const u = air / K.flight;
  const lift = s > 0 && s < K.flight ? 4 * K.high * u * (1 - u) : 0;
  const away = Math.sign(S([p.x + ax / al, p.y + ay / al, 0])[0] - S([p.x, p.y, 0])[0]) || 1;
  const TT = (K.tilt * Math.PI) / 180;
  let tilt = 0;
  if (s > 0 && s <= K.flight) tilt = TT * (1 - Math.exp(-s / 2));
  else if (s > K.flight) {
    const w = s - K.flight;
    tilt = TT * (1 - Math.exp(-K.flight / 2)) * Math.exp(-w / 2) * Math.cos(w * 0.9);
  }
  return { gx, gy, lift, tilt: tilt * away, flash: f < THROW.flash, near: swipeNear(at, view, turn), cursed: f * FR };
}

/** A layer of its light, laid in order of how near the eye it is (with the demon's picture and the ones in its way). */
export interface Layer {
  px: Px;
  near: number;
}
/** All of a swipe's light at a moment: on the floor (under everything); layers among the figures; over and under each one in its way. */
export interface SwipeLight {
  floor: Px;
  layers: Layer[];
  struck: { under: Px; over: Px }[];
}

/** WHAT HAPPENS TO EACH IN ITS WAY: cursed (smoldering from then on, flaring as it is struck); flecks of its fire where it is struck; a scrap of robe and blood thrown off it; the dust as it lands. */
function strikes(m: DemonMove, t: number, view: GameView, turn: number, fd: Light): { under: Px; over: Px }[] {
  const { w, h } = SWIPE_SCENE;
  const S = swipeTo(view, turn);
  const bl = blowsOf(m);
  return SWIPE_TARGETS.map((p, i) => {
    const ol = new Light();
    const os = new Light();
    const osm = new Light();
    const me = swipedAt(m, i, t, view, turn);
    const b = bl[i];
    const fy = me.gy - me.lift;
    if (b && me.cursed >= 0) {
      const f = me.cursed / FR;
      // (the blow: a burst of flecks of its fire at its chest; raked as the storm passes through it, its talons' slashes across it)
      if (f < 5) burst(ol, me.gx, fy - TARGET_BOX.h * 0.55, 5 + f * 6, f / 5, 40 + i);
      if (!b.heavy) slashes(ol, me.gx, fy, f, 70 + i);
      // (cursed from then on: seeping its black smoke and cyan embers, more as it is struck)
      smolder(ol, osm, me.gx, fy, TARGET_BOX.w, TARGET_BOX.h, t, Math.min(1, 0.4 + f / 8), 50 + i);
      // (a scrap of its robe, and a little blood, flying off it the way it is thrown; the blood a stain where it lands, drying away)
      const ax = p.x - b.from[0];
      const ay = p.y - b.from[1];
      const al = Math.hypot(ax, ay) || 1;
      const ux = ax / al;
      const uy = ay / al;
      const s = f - THROW.flash;
      if (s >= 0) {
        const sc = scrap([p.x, p.y, 36], [ux * 1.3 - uy * 0.4, uy * 1.3 + ux * 0.4, 4], s, i * 5 + 1);
        const [x, y] = S(sc.at);
        rag(sc.landed ? fd : os, x, y, sc.a, sc.landed);
        for (let j = 0; j < 3; j++) {
          const side = (j - 1) * 0.6;
          const b0: V3 = [p.x, p.y, 30 + 6 * hash(i * 7 + j)];
          const bv: V3 = [ux * (1 + hash(i + j)) - uy * side, uy * (1 + hash(i * 3 + j)) + ux * side, 2.5 + 2.5 * hash(i * 11 + j)];
          const fly = flung(b0, bv, s);
          const [bx, by] = S(fly.at);
          if (!fly.landed) {
            os.put(bx, by, BLOOD + 1);
            os.put(bx + 1, by, BLOOD + 1);
            os.put(bx, by - 1, BLOOD + 2);
          } else {
            const since = s - landedAt(b0, bv[2]);
            const wd = since < 14 ? 3 : since < 26 ? 2 : since < 36 ? 1 : 0;
            for (let k = 0; k <= wd && wd > 0; k++) fd.put(bx + k - 1, by, BLOOD);
            if (wd >= 2) fd.put(bx, by + 1, BLOOD);
          }
        }
        dust(osm, me.gx, me.gy, s - (b.heavy ? THROW.heavy.flight : THROW.light.flight), 300 + i);
      }
    }
    return { under: new Px(w, h), over: laid(w, h, osm, os, ol) };
  });
}

/** A fountain of its fire flung up out of the floor at (`gx`, `gy`) on the picture, `f` frames after it bursts: tongue after tongue of its fire's own shape, shrinking as each rises; `n` of them, `big` as big, spread `wide` across, leaning `lean`. */
function fountain(l: Light, gx: number, gy: number, f: number, t: number, n: number, big: number, wide: number, lean: number, seed: number, lip: number): void {
  if (f < 0) return;
  const base = f < 1 ? big * 0.6 : f < 4 ? big : Math.max(0, big - (f - 4) * big * 0.12);
  jet(l, gx, gy - 1, base, t * 1.6 + seed, lean, lip);
  for (let k = 0; k < n; k++) {
    const age = f - k * 0.7;
    const life = 7 + 4 * hash(seed * 41 + k);
    if (age < 0 || age > life) continue;
    const rise = (6 + 3 * hash(seed * 43 + k)) * age - 0.3 * age * age;
    const sz = big * (0.7 + 0.3 * hash(seed * 47 + k)) * Math.min(1, (1 - age / life) * 1.6);
    jet(l, gx + (k % 2 ? 1 : -1) * (1 + wide * hash(seed * 53 + k)) + lean * rise, gy - 4 - rise, sz, t * 2 + k * 0.41 + seed, lean, 1e9);
  }
}

/** The floor broken under its claws or hooves as they strike it, `f` frames after: a star of cracks glowing and cooling, its fire bursting up, stone flung and dust rolling out. */
function strikeFloor(fd: Light, fl: Light, l: Light, st: Light, sm: Light, S: ToScene, at: [number, number], f: number, t: number, seed: number, big: number, back = 0): void {
  if (f < 0) return;
  const [x, y] = at;
  const heat = f < 2 ? 3.4 : 3 - (f - 2) / 7;
  for (const k of crackStar(x, y, 6, 14 + 8 * big, 2.5, seed)) drawCrack(fd, fl, k, Math.min(1, 0.55 + f * 0.22), heat, S);
  const [gx, gy] = S([x, y, 0]);
  fountain(l, gx, gy, f, t, 5, 3 + 1.5 * big, 6, back * 0.25, seed, gy + 3);
  if (f < 4) burst(l, gx, gy - 6, 4 + f * 5, f / 4, seed + 1);
  for (let j = 0; j < 4; j++) {
    const a = back ? Math.PI + (hash(seed * 7 + j) - 0.5) * 1.6 : (j / 4) * Math.PI * 2 + hash(seed + j);
    const sp = 0.6 + 1.1 * hash(seed * 3 + j);
    const fly = flung([x, y, 2], [Math.cos(a) * sp, Math.sin(a) * sp, 3.5 + 3 * hash(seed * 5 + j) * big], f);
    const [cx, cy] = S(fly.at);
    chunk(fly.landed ? fd : st, l, cx, cy, 1.6 + 1.6 * hash(seed * 9 + j), fly.landed ? j : j + f * 0.4, seed * 10 + j, fly.landed ? 0 : 3 - f / 6);
  }
  dust(sm, gx, gy, f, seed + 3);
}

/** Where a joint of its is (its own measure, carried as far as it has gone) at a moment of a move. */
function jointAt(m: DemonMove, t: number, j: 'toeL' | 'toeR' | 'handL' | 'handR'): [number, number] {
  const s = solve(DEMON_B, demonPose(m.motion, t) as Posed);
  return [s[j][0] + (m.along?.(t) ?? 0), s[j][1]];
}

/** THE POUNCE'S LIGHT AT A MOMENT `t` of its move (`m`): see above. */
export function pounceLight(m: DemonMove, t: number, view: GameView, turn = 0): SwipeLight {
  const { w, h } = SWIPE_SCENE;
  const S = swipeTo(view, turn);
  const f = t / FR;
  const fd = new Light();
  const fl = new Light();
  // (behind it as it springs: the floor under its hooves; kicked out behind)
  const bl = new Light();
  const bs = new Light();
  const bsm = new Light();
  const push: [number, number][] = [jointAt(m, PN.spring * FR, 'toeL'), jointAt(m, PN.spring * FR, 'toeR')];
  push.forEach((p, k) => strikeFloor(fd, fl, bl, bs, bsm, S, p, f - PN.spring, t, 120 + k * 9, 0.6, 1));
  // (as it lands: its claws, then its hooves)
  const al = new Light();
  const as = new Light();
  const asm = new Light();
  strikeFloor(fd, fl, al, as, asm, S, [ENDS.lx, ENDS.ly], f - PN.land, t, 160, 1);
  strikeFloor(fd, fl, al, as, asm, S, [ENDS.rx, ENDS.ry], f - PN.land - 1, t, 170, 1);
  const hooves: [number, number][] = [jointAt(m, m.long, 'toeL'), jointAt(m, m.long, 'toeR')];
  hooves.forEach(([x, y], k) => {
    const [gx, gy] = S([x, y, 0]);
    dust(asm, gx, gy, f - PN.hold - k, 180 + k);
  });
  const struck = strikes(m, t, view, turn, fd);
  return {
    floor: laid(w, h, new Light(), fd, fl),
    layers: [
      { px: laid(w, h, bsm, bs, bl), near: swipeNear([push[0][0], 0, 0], view, turn) },
      { px: laid(w, h, asm, as, al), near: swipeNear([ENDS.lx, 0, 0], view, turn) },
    ],
    struck,
  };
}

/**
 * A BLAST OF ITS SMOKE out from (`at`, on the floor, its own measure), `f` frames after it goes off: billows of black smoke
 * flung out along the floor all round and up, swelling, slowing and thinning; embers of its fire flung out in them.
 */
function blast(sm: Light, l: Light, S: ToScene, at: [number, number], f: number, t: number, seed: number, big: number): void {
  if (f < 0 || f > 26) return;
  const n = 9;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + hash(seed + k) * 0.5;
    const go = (1 - Math.pow(1 - clamp01(f / 14), 2)) * (26 + 18 * hash(seed * 3 + k)) * big;
    const up = (1 - Math.pow(1 - clamp01(f / 20), 2)) * (10 + 22 * hash(seed * 5 + k));
    const [x, y] = S([at[0] + Math.cos(a) * go, at[1] + Math.sin(a) * go, up]);
    const r = (10 + 10 * clamp01(f / 10) + 6 * hash(seed * 7 + k)) * big;
    cloud(sm, x, y + r * 0.4, 2 * r, 1.7 * r, t + k * 0.4, clamp01((f - 6) / 20) + 0.05, seed + k);
    if (f < 10 && k % 2 === 0) {
      const e = 1 - f / 10;
      l.put(x + 2, y - r * 0.6, e > 0.5 ? 2 : 1);
      l.put(x + 3, y - r * 0.6, e > 0.5 ? 2 : 1);
    }
  }
  // (and the heart of it, where it went off, the thickest, thinning last)
  const [cx, cy] = S([at[0], at[1], 0]);
  cloud(sm, cx, cy + 6, (40 + 30 * clamp01(f / 6)) * big, (44 + 30 * clamp01(f / 6)) * big, t, clamp01((f - 4) / 18), seed + 20);
}

/** Its talons' slashes across one it rakes as it passes: four of its fire, side by side, glowing and dying. */
function slashes(l: Light, gx: number, gy: number, f: number, seed: number): void {
  if (f < 0 || f > 14) return;
  const k = f < 2 ? 3 : f < 5 ? 2 : f < 9 ? 1 : 0;
  // (down across it from its far shoulder to its near hip)
  const dx = 0.62;
  const dy = 0.78;
  for (let g = 0; g < 4; g++) {
    const cx = gx - dy * (g - 1.5) * 4 + (hash(seed + g) - 0.5) * 2;
    const cy = gy - TARGET_BOX.h * 0.55 + dx * (g - 1.5) * 4;
    const len = 20 - Math.abs(g - 1.5) * 3;
    for (let i = 0; i <= len; i++) {
      const u = i / len - 0.5;
      // (each a tapered gash: thin at its ends)
      const x = cx + u * len * dx;
      const y = cy + u * len * dy;
      l.put(x, y, k);
      if (Math.abs(u) < 0.3) l.put(x + 1, y, Math.max(0, k - 1));
    }
  }
}

/** How long its river of smoke lingers on the floor (seconds), and its talons' gouges glow. */
const RIVER_LIFE = 1.1;
/** THE SMOKE STEP'S LIGHT AT A MOMENT `t` of its move (`m`): see above. */
export function smokeStepLight(m: DemonMove, t: number, view: GameView, turn = 0): SwipeLight {
  const { w, h } = SWIPE_SCENE;
  const S = swipeTo(view, turn);
  const f = t / FR;
  const along = (g: number): number => m.along?.(g * FR) ?? 0;
  /** When its storm passed a place along its way (frames). */
  const passed = (x: number): number => {
    let g = SS.burst;
    while (g < SS.slam && along(g) + 15 < x) g += 0.25;
    return g;
  };
  const fd = new Light();
  const fl = new Light();
  // ---- AS IT COILS: its claws biting into the floor, cracks glowing under them as its fire builds
  const coil = clamp01((f - 2) / (SS.coiled - 2));
  (['handL', 'handR'] as const).forEach((j, k) => {
    const p = jointAt(m, 0, j);
    const heat = f < SS.coiled ? 1 + 1.5 * coil : f < SS.burst + 2 ? 3 : 3 - (f - SS.burst - 2) / 6;
    if (f > 2) for (const c of crackStar(p[0] + 3, p[1], 5, 12, 2, 400 + k * 7)) drawCrack(fd, fl, c, Math.min(1, coil * 1.2), heat, S);
  });
  // ---- THE GOUGES of its talons along the floor where the storm went: four, jagged, glowing behind it and cooling to scars
  const reach = f < SS.burst ? 0 : along(Math.min(f, SS.slam)) + STORM_LEAD - 6;
  for (let g = 0; g < 4; g++) {
    const off = (g - 1.5) * 6;
    let prev: [number, number] | null = null;
    for (let x = 18; x <= Math.min(reach, SWIPE_REACH + 8); x += 2) {
      // (the gouge wandering a little as it goes, and fading in and out at its ends)
      const y = off + (noise2(x * 0.08 + g * 3.3, 1.7) - 0.5) * 5;
      const pt = S([x, y, 0]);
      const age = f - passed(x);
      const k = age < 1.5 ? 3 : age < 5 ? 2 : age < 12 ? 1 : age < 22 ? 0 : -1;
      if (prev) {
        const n = Math.max(1, Math.ceil(Math.hypot(pt[0] - prev[0], pt[1] - prev[1])));
        for (let i = 0; i <= n; i++) {
          const px = Math.round(prev[0] + ((pt[0] - prev[0]) * i) / n);
          const py = Math.round(prev[1] + ((pt[1] - prev[1]) * i) / n);
          fd.put(px, py, PIT);
          if (k >= 0) fl.put(px, py, k);
        }
      }
      prev = pt;
    }
  }
  // ---- ITS RIVER OF SMOKE along the floor where it went, rolling on the way it went, puffs billowing up off it, thinning
  const rsm = new Light();
  if (f >= SS.burst) {
    const [sx, sy] = S([0, 0, 0]);
    const [ex, ey] = S([Math.max(0, reach - STORM_LEAD + 10), 0, 0]);
    const [fx2, fy2] = S([SWIPE_REACH, 0, 0]);
    const LEN = Math.hypot(fx2 - sx, fy2 - sy) || 1;
    const ux = (fx2 - sx) / LEN;
    const uy = (fy2 - sy) / LEN;
    const got = Math.hypot(ex - sx, ey - sy);
    for (let y = Math.floor(Math.min(sy, ey) - 14); y <= Math.ceil(Math.max(sy, ey) + 9); y++) {
      for (let x = Math.floor(Math.min(sx, ex) - 12); x <= Math.ceil(Math.max(sx, ex) + 12); x++) {
        const a = (x - sx) * ux + (y - sy) * uy;
        if (a < -4 || a > got + 2) continue;
        const age = ((f - passed((a / LEN) * SWIPE_REACH)) * FR) / RIVER_LIFE;
        if (age >= 1) continue;
        const off = (x - sx) * -uy + (y - sy) * ux + (noise2(a * 0.15 - t * 4, 7.7) - 0.5) * 3;
        const flow = noise2((a - t * 80) * 0.09, off * 0.35 + 2.3) * 0.7 + noise2((a - t * 120) * 0.25, off * 0.6) * 0.3;
        const half = (7 + 5 * flow) * (1 - 0.4 * Math.max(0, age));
        const up = -off;
        const depth = up > 0 ? up / (half * 1.3) : -up / (half * 0.45);
        const vv = 1 - depth + (flow - 0.5) * 0.8 - Math.max(0, age - 0.45) * 1.8;
        if (vv < 0) continue;
        rsm.put(x, y, vv > 0.55 ? 0 : vv > 0.3 ? 1 : vv > 0.12 || up < half * 0.5 ? 2 : 3);
      }
    }
    // (puffs billowing up off it, each place along it sending one up after another while it lasts)
    for (let k = 0; k <= 14; k++) {
      const x = ((k + 0.5) / 15) * SWIPE_REACH;
      if (x > reach - STORM_LEAD + 10) break;
      const born0 = passed(x) * FR;
      for (let j = 0; j < 3; j++) {
        const born = born0 + j * 0.24 + hash(k * 3 + j) * 0.1;
        const ph = (t - born) / 0.9;
        if (ph < 0 || ph >= 1 || born > born0 + RIVER_LIFE * 0.7) continue;
        const [px0, py0] = S([x, 0, 0]);
        const lift = 1 - (1 - ph) * (1 - ph);
        const drift = (noise2(k * 0.9 + j * 4, t * 0.7) - 0.5) * 16 * ph + (hash(k * 7 + j) - 0.5) * 8;
        const size = (15 + 12 * ph) * (0.8 + 0.4 * hash(k * 11 + j));
        cloud(rsm, px0 + drift, py0 + 3 - lift * 24, size, size * 0.95, t + k, Math.max(0, (ph - 0.45) / 0.55), 7 + k * 3 + j, ph > 0.3 ? 1 : 0);
      }
    }
  }
  // ---- WHERE IT STOOD: its smoke boiling up off it as it coils; the blast as it bursts into smoke, its fire flung up in it
  const ul = new Light();
  const usm = new Light();
  const [x0, y0] = S([15, 0, 0]);
  if (f > 1 && f < SS.burst + 2) {
    // (boiling up off its back and shoulders, thicker as it coils: behind it, never over it)
    for (let k = 0; k < 4; k++) {
      const rise = ((t * 1.6 + k / 4) % 1) * 46;
      cloud(usm, x0 - 24 + k * 16, y0 - 50 - rise, 22 + rise * 0.6, 20 + rise * 0.5, t + k, 1 - coil * 0.85 + rise / 70, 21 + k);
    }
  }
  const fb = f - SS.coiled;
  if (fb >= 0) {
    // (the blast: its smoke flung out from where it stood, rolling out along the floor and up, thinning)
    blast(usm, ul, S, [15, 0], fb, t, 31, 1);
    fountain(ul, x0, y0, fb, t, 8, 5.5, 12, 0, 33, y0 + 4);
    if (fb < 5) burst(ul, x0, y0 - 30, 8 + fb * 10, fb / 5, 35);
  }
  // ---- THE STORM: black smoke tearing along the floor, a comet of it, its head thick and churning with its hellfire and its
  // eyes burning in its front, its tail streaming back along the way it went and thinning into the river it leaves
  const ml = new Light();
  const msm = new Light();
  const gone = m.gone?.(t) ?? 0;
  const here = along(f);
  if (f >= SS.coiled && f <= SS.slam + 1) {
    const [sx0, sy0] = S([0, 0, 0]);
    const [sx1, sy1] = S([SWIPE_REACH, 0, 0]);
    const ln = Math.hypot(sx1 - sx0, sy1 - sy0) || 1;
    const ux = (sx1 - sx0) / ln;
    const uy = (sy1 - sy0) / ln;
    const v = Math.abs(along(f + 0.5) - along(f - 0.5));
    const fast = clamp01(v / 26);
    // (as it nears the end it slows and gathers: its tail drawn in, its head swelling)
    const gather = clamp01((f - (SS.out - 2)) / 4);
    const [hx, hy] = S([here + 26, 0, 0]);
    const tail = 30 + 140 * fast;
    const R0 = 32 + 8 * gather;
    const K = 16;
    for (let k = K; k >= 0; k--) {
      const d = (k / K) * tail;
      const r = R0 * Math.pow(1 - (k / K) * 0.85, 0.7);
      const wob = (noise2(k * 0.7, t * 6) - 0.5) * 8 * (k / K);
      const cx = hx - ux * d - uy * wob;
      const cy = hy - uy * d + ux * wob;
      cloud(msm, cx, cy + r * 0.35, 2 * r, 1.8 * r, t * 1.5 + k * 0.3, Math.min(0.95, 0.05 + (k / K) * 0.55 + (1 - gone) * 0.5), 41 + k);
    }
    if (gone > 0.4) {
      // (its fire churning in its head: tongues licking up out of the smoke and streaming back the way it came)
      for (let k = 0; k < 5; k++) {
        const along2 = (k - 1) * 9 + (hash(k * 7 + Math.floor(t * 20)) - 0.5) * 6;
        const across = (hash(k * 13) - 0.5) * 18;
        jet(ml, hx - ux * along2 - uy * across, hy - uy * along2 + ux * across - 8, 3.2 + 2 * Math.abs(Math.sin(t * 21 + k * 2.1)), t * 2.4 + k, -0.45 * fast * Math.sign(ux || 1), hy + 6);
      }
      // (sparks of its fire torn off it, streaming back)
      for (let k = 0; k < 7; k++) {
        const d = ((t * 9 + k / 7) % 1) * tail * 0.8;
        const sx = hx - ux * d + (hash(k * 3) - 0.5) * 20;
        const sy = hy - uy * d - 10 - hash(k * 5) * 26;
        ml.put(sx, sy, 2);
        ml.put(sx - ux * 2, sy - uy * 2, 1);
      }
      // (its eyes, burning in its front, slanted, a pair)
      const [ex, ey] = S([here + 52, 0, 30]);
      for (const dd of [-4, 4]) {
        ml.put(ex + dd, ey, 3);
        ml.put(ex + dd + Math.sign(dd), ey, 3);
        ml.put(ex + dd, ey + 1, 2);
        ml.put(ex + dd - Math.sign(dd), ey - 1, 2);
      }
    }
  }
  // (as it bursts out at the far end: its smoke blasted out from round it, rolling out along the floor and up, thinning)
  const fo = f - SS.slam + 1;
  if (fo >= 0) blast(msm, ml, S, [SWIPE_REACH + 20, 0], fo, t, 51, 1.15);
  // ---- WHERE IT BURSTS OUT: its claws slammed into the floor
  const el = new Light();
  const es = new Light();
  const esm = new Light();
  strikeFloor(fd, fl, el, es, esm, S, [ENDS.lx, ENDS.ly], f - SS.slam, t, 460, 1);
  strikeFloor(fd, fl, el, es, esm, S, [ENDS.rx, ENDS.ry], f - SS.slam - 0.5, t, 470, 1);
  const struck = strikes(m, t, view, turn, fd);
  return {
    floor: laid(w, h, rsm, fd, fl),
    layers: [
      { px: laid(w, h, usm, new Light(), ul), near: swipeNear([0, 0, 0], view, turn) - 1 },
      { px: laid(w, h, msm, new Light(), ml), near: swipeNear([here, 0, 0], view, turn) + 0.5 },
      { px: laid(w, h, esm, es, el), near: swipeNear([ENDS.lx, 0, 0], view, turn) },
    ],
    struck,
  };
}
