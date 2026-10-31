// THE KING'S NEW MOVES (31 Oct 2026), made outside a browser: the charge and its line of sparks; the crown's weight
// following the knight round and slamming down; the Hush's grab and drag, its shield, its grey fog. Each from in front
// and from behind at the hall's scale with the knight in it, captioned; each strike again at half speed. Frames are piped
// to ffmpeg (1200 wide). Nothing of the game imports it.
//   npx tsx tools/king_new_moves.ts film <out.mp4>
//   npx tsx tools/king_new_moves.ts stills <out dir>      (frames of the film, to look at)
//   npx tsx tools/king_new_moves.ts sheet <out dir>       (the sheet's panels: tools/king_new_moves_sheet.py puts them together)
import { Px } from '../src/engine/px';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { HS_FOG, HS_GRAB, HS_STRUCK, HS_WRAP, HUSH, HUSH_BESIDE, KG_CHARGE, KG_STAND_LONG, KG_WEIGHT, KING, KING_ALONE, KING_SHIELDED, chargeCarried, grabReach } from '../src/art/king_moves';
import { FOG_CANVAS, FX_CANVAS, SHIELD_FX, WEIGHT_CANVAS, WEIGHT_FX, breathPainted, fogPatchPainted, grabPainted, shieldPainted, sparksPainted, weightAt, weightPainted } from '../src/art/king_fx';
import { TILE3 } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { makeHeroArt3 } from '../src/art/heroes3';
import type { GameView } from '../src/art/skin';
import { cut, frameOf, hallFloor, lay, laidOf, onScene, scaled, shadow, spriteLaid } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 600;
const H = 338;
const FPS = 30;
const T = TILE3;
type XY = readonly [number, number];

/** A pass: the hall seen with the King facing down the picture to the right (from in front) or up it to the right (from behind); his own ways (forward, to his left) as the hall's. */
interface Pass {
  view: GameView;
  cx: number;
  cy: number;
  hall: (f: number, l: number) => [number, number];
  floor: Px;
}
const passOf = (view: GameView, cx: number, cy: number): Pass => ({
  view, cx, cy,
  hall: view === 'front' ? (f, l) => [f, l] : (f, l) => [-l, f],
  floor: hallFloor(W, H, cx, cy, true),
});
/** A point in the hall (tiles), on the scene. */
const at = (p: Pass, hx: number, hy: number, z = 0): [number, number] => onScene([hx * T, hy * T, z], p.cx, p.cy);
/** From a place in the hall, his own (tiles), to the hall. */
const own = (p: Pass, from: XY, f: number, l: number): [number, number] => {
  const [a, b] = p.hall(f, l);
  return [from[0] + a, from[1] + b];
};

let KN: ReturnType<ReturnType<typeof makeHeroArt3>['of']> | null = null;
/** The knight: standing, or running if he is going somewhere (`vx`, `vy`: his going on the scene), facing the way he goes, or `face` (scene). */
function knightAt(px: Px, x: number, y: number, ft: number, vx: number, vy: number, face: XY, striking = false): void {
  KN ??= makeHeroArt3().of('warrior', { twoHanded: false });
  const moving = Math.hypot(vx, vy) > 4;
  const [dx, dy] = moving ? [vx, vy] : face;
  const set = dy > 0 ? KN.front : KN.back;
  const frames = striking ? set.attack : moving ? set.walk : set.idle;
  const i = Math.floor(ft * (moving || striking ? 12 : 6)) % frames.length;
  shadow(px, x, y, 9);
  // (the heroes' pictures face down-left from in front and up-left from behind: turned over to go right)
  lay(px, spriteLaid(frames[i]), x, y, 1, undefined, dx > 0);
}

const KC = new Map<string, Laid>();
function fig(mob: Mob, move: string, t: number, view: GameView): Laid {
  const key = `${mob.id}:${move}:${t.toFixed(4)}:${view}`;
  let f = KC.get(key);
  if (!f) {
    f = frameOf(mob, move, t, view);
    if (KC.size > 300) KC.clear();
    KC.set(key, f);
  }
  return f;
}

/** One frame: the floor, what lies on it, the figures nearest last, what flies over them. */
interface Shot {
  p: Pass;
  king: { mob: Mob; move: string; t: number; at: XY };
  hush?: { move: string; t: number; at: XY; with?: Laid[] } | null;
  knight?: { at: XY; v?: XY; face?: XY; striking?: boolean } | null;
  under?: [Laid, XY][];
  behind?: [Laid, XY][];
  before?: [Laid, XY][];
  over?: [Laid, XY][];
}
function shot(s: Shot, ft: number): Px {
  const px = new Px(W, H);
  px.d.set(s.p.floor.d);
  for (const [l, a] of s.under ?? []) lay(px, l, ...at(s.p, a[0], a[1]));
  for (const [l, a] of s.behind ?? []) lay(px, l, ...at(s.p, a[0], a[1]));
  const figs: { y: number; draw: () => void }[] = [];
  const [kx, ky] = at(s.p, s.king.at[0], s.king.at[1]);
  figs.push({ y: ky, draw: () => {
    shadow(px, kx, ky, 24);
    lay(px, fig(s.king.mob, s.king.move, s.king.t, s.p.view), kx, ky);
  } });
  if (s.hush) {
    const h = s.hush;
    const [hx, hy] = at(s.p, h.at[0], h.at[1]);
    figs.push({ y: hy, draw: () => {
      shadow(px, hx, hy, 10);
      lay(px, fig(HUSH, h.move, h.t, s.p.view), hx, hy);
      for (const l of h.with ?? []) lay(px, l, hx, hy);
    } });
  }
  if (s.knight) {
    const k = s.knight;
    const [nx, ny] = at(s.p, k.at[0], k.at[1]);
    const v = k.v ?? [0, 0];
    const [vx, vy] = [(v[0] + v[1]) * 32, (v[0] - v[1]) * 16];
    const f = k.face ?? [kx - nx, ky - ny];
    figs.push({ y: ny, draw: () => knightAt(px, nx, ny, ft, vx, vy, f, k.striking) });
  }
  for (const f of figs.sort((a, b) => a.y - b.y)) f.draw();
  for (const [l, a] of s.before ?? []) lay(px, l, ...at(s.p, a[0], a[1]));
  for (const [l, a] of s.over ?? []) lay(px, l, ...at(s.p, a[0], a[1]));
  return px;
}
const fx = (p: { px: Px }): Laid => laidOf(p.px, FX_CANVAS.ax, FX_CANVAS.ay);
const wfx = (p: { px: Px }): Laid => laidOf(p.px, WEIGHT_CANVAS.ax, WEIGHT_CANVAS.ay);
const ffx = (p: { px: Px }): Laid => laidOf(p.px, FOG_CANVAS.ax, FOG_CANVAS.ay);
/** A piece of a frame twice as big, round a point of the scene. */
function close(px: Px, x: number, y: number): Px {
  const w = W / 2;
  const h = Math.round(H / 2);
  const x0 = Math.round(Math.max(0, Math.min(W - w, x - w / 2)));
  const y0 = Math.round(Math.max(0, Math.min(H - h, y - h / 2)));
  return scaled(cut(px, x0, y0, w, h), 2);
}

// =============================================================================================
// THE MOVES AS SCENES (each a function of the time into it)

/** THE CHARGE: he sets himself, bursts away, runs nine tiles down the hall past the knight, stops, wrenches the blade up: the line bursts. */
function chargeScene(p: Pass, t: number, ft: number): Px {
  const start: XY = own(p, [0, 0], -4.6, 0);
  const tt = Math.min(t, KG_CHARGE.long);
  const kAt = own(p, start, chargeCarried(tt) / T, 0);
  const since = t - KG_CHARGE.run[0];
  return shot({
    p, king: { mob: KING, move: t < KG_CHARGE.long ? 'attack' : 'stand', t: t < KG_CHARGE.long ? tt : (t - KG_CHARGE.long) % KG_STAND_LONG, at: kAt },
    knight: { at: own(p, start, 5.6, 2.6) },
    under: since >= 0 ? [[fx(sparksPainted(since, p.view)), start]] : [],
  }, ft);
}
/** THE CROWN'S WEIGHT: sent up off his head, it follows the knight round the hall; stops, hangs, and slams down as the knight runs clear; and flies home. */
function weightScene(p: Pass, t: number, ft: number, mob: Mob = KING): { px: Px; crown: XY } {
  const kAt: XY = own(p, [0, 0], -3.2, -1.4);
  // (the knight's way round: walking off, the crown after him; as it stops he runs clear)
  const path = (tt: number): XY => {
    const a: XY = own(p, kAt, 4.0, 2.4);
    const b: XY = own(p, kAt, 5.6, 0.4);
    const c: XY = own(p, kAt, 4.6, -1.2);
    const d: XY = own(p, kAt, 2.0, -3.6);
    const s0 = KG_WEIGHT.send;
    const lerp = (u: XY, v: XY, k: number): XY => [u[0] + (v[0] - u[0]) * k, u[1] + (v[1] - u[1]) * k];
    const sm = (x0: number, x1: number, x: number): number => {
      const u = Math.max(0, Math.min(1, (x - x0) / (x1 - x0)));
      return u * u * (3 - 2 * u);
    };
    if (tt < s0 + 0.8) return a;
    if (tt < s0 + 2.0) return lerp(a, b, sm(s0 + 0.8, s0 + 2.0, tt));
    if (tt < KG_WEIGHT.hold[0] + 0.05) return lerp(b, c, sm(s0 + 2.0, KG_WEIGHT.hold[0] + 0.05, tt));
    return lerp(c, d, sm(KG_WEIGHT.hold[0] + 0.15, KG_WEIGHT.hold[1] - 0.05, tt));
  };
  // (where the crown's floor point is: following him at its pace, from where he stood as it was sent)
  const follow = (tt: number): XY => {
    let q = path(KG_WEIGHT.send);
    const dt = 1 / 60;
    for (let u = KG_WEIGHT.send; u < Math.min(tt, KG_WEIGHT.send + WEIGHT_FX.follow); u += dt) {
      const h = path(u);
      const dx = h[0] - q[0];
      const dy = h[1] - q[1];
      const d = Math.hypot(dx, dy);
      const go = Math.min(d, KG_WEIGHT.pace * dt);
      if (d > 1e-6) q = [q[0] + (dx / d) * go, q[1] + (dy / d) * go];
    }
    return q;
  };
  const tt = Math.min(t, KG_WEIGHT.long);
  const since = tt - KG_WEIGHT.send;
  const v = (() => {
    const a = path(tt - 0.05);
    const b = path(tt + 0.05);
    return [(b[0] - a[0]) * 10, (b[1] - a[1]) * 10] as XY;
  })();
  let crown: XY = kAt;
  const under: [Laid, XY][] = [];
  const over: [Laid, XY][] = [];
  if (since >= 0 && since < WEIGHT_FX.long) {
    const w = weightAt(since, p.view);
    const fp = follow(tt);
    const slam = follow(KG_WEIGHT.send + WEIGHT_FX.follow);
    crown = w.phase === 'fly' ? [kAt[0] + (fp[0] - kAt[0]) * w.lerp, kAt[1] + (fp[1] - kAt[1]) * w.lerp] : w.phase === 'home' ? [slam[0] + (kAt[0] - slam[0]) * w.lerp, slam[1] + (kAt[1] - slam[1]) * w.lerp] : fp;
    under.push([wfx(weightPainted(since, p.view, 'floor')), crown]);
    over.push([wfx(weightPainted(since, p.view, 'crown')), crown]);
  }
  const px = shot({ p, king: { mob, move: t < KG_WEIGHT.long ? 'weight' : 'stand', t: t < KG_WEIGHT.long ? tt : 0, at: kAt }, knight: { at: path(tt), v }, under, over }, ft);
  return { px, crown };
}
const KING_AT_HUSH: XY = [-2.2, -1.6];
/** The Hush at his side (its own place, in the hall). */
const hushHome = (p: Pass, kAt: XY): XY => own(p, kAt, HUSH_BESIDE[0] / T, HUSH_BESIDE[1] / T);
/** GRAB AND DRAG: its arms shoot out at the knight, catch him and drag him back before the King. */
function grabScene(p: Pass, t: number, ft: number): Px {
  const kAt: XY = own(p, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const hAt = hushHome(p, kAt);
  const kn0: XY = own(p, hAt, 6.2, -0.2);
  const before: XY = own(p, kAt, 1.7, 0.4);
  const tt = Math.min(t, HS_GRAB.long);
  // (its hands out at 16 tiles a second; they catch him where he stands; from the haul they bring him in)
  const L0 = 1.15;
  const d0 = Math.hypot(kn0[0] - hAt[0], kn0[1] - hAt[1]);
  const caught = HS_GRAB.out[0] + (d0 - L0) / HS_GRAB.pace;
  const haul = Math.max(0, Math.min(1, (tt - HS_GRAB.haul[0]) / (HS_GRAB.haul[1] - 0.25 - HS_GRAB.haul[0])));
  const e = haul * haul * (3 - 2 * haul);
  const kn: XY = [kn0[0] + (before[0] - kn0[0]) * e, kn0[1] + (before[1] - kn0[1]) * e];
  const dk = Math.hypot(kn[0] - hAt[0], kn[1] - hAt[1]);
  const free = grabReach(tt);
  const reach = tt < caught ? free : Math.max(0, dk - L0) * (tt > HS_GRAB.haul[1] - 0.25 ? 1 - Math.min(1, (tt - (HS_GRAB.haul[1] - 0.25)) / 0.25) : 1);
  // (which way, from its forward, its arms go: at him)
  const [f0, l0] = p.view === 'front' ? [kn[0] - hAt[0], kn[1] - hAt[1]] : [kn[1] - hAt[1], -(kn[0] - hAt[0])];
  const aim = (Math.atan2(l0, f0) * 180) / Math.PI;
  const grip = tt >= caught ? 1 : 0;
  const v: XY = tt > HS_GRAB.haul[0] && tt < HS_GRAB.haul[1] ? [(before[0] - kn0[0]) * 0.1, (before[1] - kn0[1]) * 0.1] : [0, 0];
  return shot({
    p, king: { mob: KING_ALONE, move: 'stand', t: t % KG_STAND_LONG, at: kAt },
    hush: { move: t < HS_GRAB.long ? 'attack' : 'stand', t: t < HS_GRAB.long ? tt : t - HS_GRAB.long, at: hAt, with: [fx(grabPainted(tt, p.view, { reach, aim, grip }))] },
    knight: { at: kn, v: [0, 0], face: [-1, -1] },
  }, ft + 0 * v[0]);
}
/** THE SHIELD: it goes to him and wraps itself round him; he is shielded; it is struck off him, dazed, back at his side. */
const SH = { stand: 0.4, held: 2.0 };
function shieldScene(p: Pass, t: number, ft: number): Px {
  const kAt: XY = own(p, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const hAt = hushHome(p, kAt);
  const t1 = SH.stand;
  const t2 = t1 + HS_WRAP.long;
  const t3 = t2 + SH.held;
  const knight = { at: own(p, kAt, 1.5, -0.3) as XY };
  if (t < t1) return shot({ p, king: { mob: KING_ALONE, move: 'stand', t, at: kAt }, hush: { move: 'stand', t, at: hAt }, knight }, ft);
  if (t < t2) {
    const u = (t - t1) / HS_WRAP.long;
    const e = u * u;
    return shot({ p, king: { mob: KING_ALONE, move: 'stand', t, at: kAt }, hush: { move: 'wrap', t: t - t1, at: [hAt[0] + (kAt[0] - hAt[0]) * e, hAt[1] + (kAt[1] - hAt[1]) * e] }, knight }, ft);
  }
  if (t < t3) {
    const s = t - t2;
    return shot({ p, king: { mob: KING_SHIELDED, move: 'stand', t: s % KG_STAND_LONG, at: kAt }, knight: { ...knight, striking: s > 0.5 }, behind: [[fx(shieldPainted(s, p.view, 'on', 'behind')), kAt]], before: [[fx(shieldPainted(s, p.view, 'on', 'before')), kAt]] }, ft);
  }
  const s = t - t3;
  const k = Math.min(1, s / HS_STRUCK.knock[1]);
  const e = 1 - (1 - k) * (1 - k);
  const at2: XY = [kAt[0] + (hAt[0] - kAt[0]) * e, kAt[1] + (hAt[1] - kAt[1]) * e];
  return shot({
    p, king: { mob: KING_ALONE, move: s < 0.4 ? 'reel' : 'stand', t: s < 0.4 ? s : s - 0.4, at: kAt },
    hush: { move: s < HS_STRUCK.long ? 'struckOff' : 'stand', t: s < HS_STRUCK.long ? s : s - HS_STRUCK.long, at: at2 }, knight,
    behind: [[fx(shieldPainted(s, p.view, 'off', 'behind')), kAt]], before: [[fx(shieldPainted(s, p.view, 'off', 'before')), kAt]],
  }, ft);
}
/** GREY FOG: it draws in its breath (the three places marked round the knight), breathes it out: three patches lie, and later thin and go. */
function fogScene(p: Pass, t: number, ft: number, skip: number): Px {
  const kAt: XY = own(p, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const hAt = hushHome(p, kAt);
  const kn: XY = own(p, hAt, 6.0, 0);
  const spots: XY[] = [kn, own(p, hAt, 6.0, HS_FOG.apart), own(p, hAt, 6.0, -HS_FOG.apart)];
  // (after `skip` seconds of it lying, the film goes on to its last seconds)
  const tt = t < skip ? t : t - skip + (HS_FOG.hit + HS_FOG.lies - 1.7);
  const since = tt - HS_FOG.hit;
  const under: [Laid, XY][] = since > -0.6 ? spots.map((s) => [ffx(fogPatchPainted(since, p.view)), s] as [Laid, XY]) : [];
  return shot({
    p, king: { mob: KING_ALONE, move: 'stand', t: t % KG_STAND_LONG, at: kAt },
    hush: { move: tt < HS_FOG.long ? 'fog' : 'stand', t: tt < HS_FOG.long ? tt : (tt - HS_FOG.long) % 3.6, at: hAt },
    knight: { at: kn },
    under,
    over: since >= 0 && since < 1 ? [[fx(breathPainted(since, p.view, [[6, 0], [6, HS_FOG.apart], [6, -HS_FOG.apart]])), hAt]] : [],
  }, ft);
}

// =============================================================================================
// THE FILM

interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}
const FRONT_C = passOf('front', 300, 205);
const BACK_C = passOf('back', 300, 202);
const FRONT_W = passOf('front', 300, 215);
const BACK_W = passOf('back', 330, 225);
const FRONT_H = passOf('front', 250, 215);
const BACK_H = passOf('back', 270, 214);
const FRONT_S = passOf('front', 400, 250);
const FRONT_F = passOf('front', 250, 190);
const BACK_S = passOf('back', 250, 210);
function parts(): Part[] {
  const out: Part[] = [];
  out.push({ long: 3.0, title: 'THE KING: HIS NEW MOVES', line: 'His word: “His sweep and leap are pretty lame.  There are a dozen other enemies that have that’s same moves with those same animations.”', frame: (t) => chargeScene(FRONT_C, Math.min(0.2, t) * 0, t) });
  for (const [v, pc, pw, ph] of [['FROM IN FRONT', FRONT_C, FRONT_W, FRONT_H], ['FROM BEHIND', BACK_C, BACK_W, BACK_H]] as const) {
    const first = v === 'FROM IN FRONT';
    out.push({ long: 3.25, title: `THE CHARGE · ${v}`, line: 'He sets himself, sword dragged back; bursts away at 12 tiles a second; the blade cuts a line of sparks; it bursts', frame: (t) => chargeScene(pc, t, t) });
    out.push({ long: KG_WEIGHT.long + 0.2, title: `THE CROWN’S WEIGHT · ${v}`, line: 'Sent up off his head, it follows the knight; stops, hangs (the pink ring); slams down; flies home', frame: (t) => weightScene(pw, t, t).px });
    out.push({ long: HS_GRAB.long + 0.2, title: `THE HUSH: GRAB AND DRAG · ${v}`, line: 'It rears back; its arms shoot out 8 tiles, catch the knight and drag him back before the King', frame: (t) => grabScene(ph, t, t) });
    const shLong = SH.stand + HS_WRAP.long + SH.held + HS_STRUCK.long + 0.2;
    out.push({ long: first ? shLong : shLong - 0.6, title: `THE HUSH: SHIELD · ${v}`, line: 'It wraps itself round him (nothing hurts him while it holds); struck off, it is flung back to his side, dazed', frame: (t) => shieldScene(first ? FRONT_S : BACK_S, first ? t : t + 0.6, t) });
    const skip = first ? 3.4 : 2.6;
    out.push({ long: skip + 1.8, title: `THE HUSH: GREY FOG · ${v}`, line: first ? 'It draws in a breath (the places marked); breathes out: three patches lie 7 s, slowing you; then its last seconds' : 'Three patches of grey fog round the knight; then they thin and are gone', frame: (t) => fogScene(first ? FRONT_F : ph, t, t, skip) });
  }
  // EACH STRIKE AGAIN AT HALF SPEED, close
  const p = FRONT_C;
  out.push({ long: 1.6, title: 'THE CHARGE · HALF SPEED', line: 'The set held; he bursts off his mark in two frames, his streaks left behind him', frame: (t) => {
    const tt = 0.55 + t / 2;
    const start: XY = own(p, [0, 0], -4.6, 0);
    const [x, y] = at(p, start[0] + chargeCarried(tt) / T, start[1], 0);
    return close(chargeScene(p, tt, t), x + 30, y - 50);
  } });
  out.push({ long: 1.4, title: 'THE LINE BURSTS · HALF SPEED', line: 'He wrenches the blade up off the stones; the line of sparks bursts its whole length', frame: (t) => {
    const tt = KG_CHARGE.rip[0] - 0.05 + t / 2;
    const start: XY = own(p, [0, 0], -4.6, 0);
    const [x, y] = at(p, start[0] + 5.6, start[1], 0);
    return close(chargeScene(p, tt, t), x + 20, y - 40);
  } });
  out.push({ long: 1.5, title: 'THE CROWN’S WEIGHT · HALF SPEED', line: 'Held over the knight, trembling; slammed down in two frames as the King yanks his fist down', frame: (t) => {
    const tt = KG_WEIGHT.hold[0] + 0.2 + t / 2;
    // (at the hall's scale: close, it would not all go in)
    return weightScene(FRONT_W, tt, t).px;
  } });
  const ph = FRONT_H;
  const kAt: XY = own(ph, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const [hx, hy] = at(ph, ...hushHome(ph, kAt));
  out.push({ long: 1.2, title: 'THE GRAB · HALF SPEED', line: 'Its arms drawn back, held; flung out in two frames', frame: (t) => close(grabScene(ph, 0.4 + t / 2, t), hx + 70, hy - 52) });
  const pf = FRONT_F;
  const kF: XY = own(pf, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const [fx2, fy2] = at(pf, ...hushHome(pf, kF));
  out.push({ long: 1.2, title: 'THE BREATH · HALF SPEED', line: 'Its breath held; thrust out in two frames: three clots of fog fly out', frame: (t) => close(fogScene(pf, 0.6 + t / 2, t, 99), fx2 + 75, fy2 - 50) });
  return out;
}

// =============================================================================================
// THE SHEET'S PANELS

function sheet(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const save = (name: string, px: Px): void => writeFileSync(`${dir}/${name}.png`, png(px));
  const crop = (px: Px, cx: number, cy: number, w: number, h: number): Px => scaled(cut(px, Math.round(Math.max(0, Math.min(W - w, cx - w / 2))), Math.round(Math.max(0, Math.min(H - h, cy - h / 2))), w, h), 2);
  // THE CHARGE (300 by 150 each): set; burst away; running, the line cut behind him; the line bursting
  const p = FRONT_C;
  const start: XY = own(p, [0, 0], -4.6, 0);
  for (const [i, t] of [[0, 0.6], [1, 26 / 30], [2, 1.3], [3, KG_CHARGE.burst + 0.07]] as const) {
    const [x, y] = at(p, start[0] + chargeCarried(t) / T, start[1]);
    save(`charge_${i}`, crop(chargeScene(p, t, t), i >= 2 ? x - 90 : x + 60, y - 55, 300, 150));
  }
  // THE CROWN'S WEIGHT (200 by 170): sent up; following the knight; held over him; slammed; lying, ringing; flying home
  for (const [i, t] of [[0, KG_WEIGHT.send + 0.15], [1, KG_WEIGHT.send + 1.6], [2, KG_WEIGHT.hold[1] - 0.04], [3, KG_WEIGHT.hit], [4, KG_WEIGHT.hit + 0.12], [5, KG_WEIGHT.home[0] + 0.35]] as const) {
    const r = weightScene(FRONT_W, t, t);
    const [x, y] = at(FRONT_W, r.crown[0], r.crown[1]);
    const [kx, ky] = at(FRONT_W, -3.2, -1.4);
    save(`weight_${i}`, crop(r.px, i === 0 || i === 5 ? (x + kx) / 2 : x - 20, i === 0 || i === 5 ? ky - 70 : y - 72, 200, 220));
  }
  // THE HUSH (200 by 150): its grab; its shield; its fog
  const ph = FRONT_H;
  const kAt: XY = own(ph, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const [hx, hy] = at(ph, ...hushHome(ph, kAt));
  for (const [i, t] of [[0, 0.5], [1, 0.8], [2, 1.05], [3, 1.6]] as const) save(`grab_${i}`, crop(grabScene(ph, t, t), hx + 78, hy - 12, 300, 240));
  const ps = FRONT_S;
  const kS: XY = own(ps, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const [sx, sy] = at(ps, ...kS);
  const [shx] = at(ps, ...hushHome(ps, kS));
  for (const [i, t] of [[0, SH.stand + 0.35], [1, SH.stand + HS_WRAP.long + 1.1], [2, SH.stand + HS_WRAP.long + SH.held + 0.12], [3, SH.stand + HS_WRAP.long + SH.held + 0.8]] as const) save(`shield_${i}`, crop(shieldScene(ps, t, t), (sx + shx) / 2 + 10, sy - 55, 150, 150));
  const pf = FRONT_F;
  const kF: XY = own(pf, [0, 0], KING_AT_HUSH[0], KING_AT_HUSH[1]);
  const [fx2, fy2] = at(pf, ...hushHome(pf, kF));
  for (const [i, t, skip] of [[0, 0.6, 99], [1, HS_FOG.hit + 0.14, 99], [2, HS_FOG.hit + 2.0, 99], [3, 1.0 + 1.2, 1.0]] as const) save(`fog_${i}`, crop(fogScene(pf, t, t, skip), i < 2 ? fx2 + 105 : fx2 + 150, i < 2 ? fy2 - 28 : fy2 + 52, 300, 250));
  console.log('wrote the panels to', dir);
}

const [mode = 'film', out = 'king_new_moves.mp4'] = process.argv.slice(2);
if (mode === 'sheet') sheet(out);
else {
  const ps = parts();
  let total = 0;
  for (const q of ps) total += q.long;
  console.log(ps.length, 'parts,', total.toFixed(1), 's');
  if (mode === 'stills') {
    mkdirSync(out, { recursive: true });
    const only = process.argv[4];
    ps.forEach((q, i) => {
      if (only && String(i) !== only) return;
      for (const k of (process.argv[5] ?? '0.15,0.4,0.65,0.9').split(',').map(Number)) writeFileSync(`${out}/p${String(i).padStart(2, '0')}_${k}.png`, png(scaled(q.frame(q.long * k), 2)));
    });
  } else {
    const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
    const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
    const dir = `${out}.captions`;
    mkdirSync(dir, { recursive: true });
    const filters: string[] = ['scale=1200:676:flags=neighbor'];
    let t0 = 0;
    ps.forEach((q, i) => {
      writeFileSync(`${dir}/t${i}.txt`, q.title);
      // (wrapped to two lines, big enough to read on a phone)
      const words = q.line.split(' ');
      const rows: string[] = [''];
      for (const w of words) {
        if ((rows[rows.length - 1] + ' ' + w).trim().length > 84) rows.push('');
        rows[rows.length - 1] = (rows[rows.length - 1] + ' ' + w).trim();
      }
      writeFileSync(`${dir}/l${i}.txt`, rows.join('\n'));
      const en = `:enable='between(t,${t0.toFixed(3)},${(t0 + q.long - 0.001).toFixed(3)})'`;
      filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=16:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
      filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=16:y=676-(text_h)-14:fontsize=21:line_spacing=4:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=7${en}`);
      t0 += q.long;
    });
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const rgb = Buffer.alloc(W * H * 3);
    let n = 0;
    const start = Date.now();
    const write = async (): Promise<void> => {
      for (const [i, q] of ps.entries()) {
        const frames = Math.round(q.long * FPS);
        for (let f = 0; f < frames; f++) {
          const px = q.frame(f / FPS);
          for (let k = 0, j = 0; k < W * H * 4; k += 4, j += 3) {
            rgb[j] = px.d[k];
            rgb[j + 1] = px.d[k + 1];
            rgb[j + 2] = px.d[k + 2];
          }
          if (!ff.stdin.write(rgb)) await new Promise((r) => ff.stdin.once('drain', r));
          n++;
        }
        console.log(`part ${i} done (${n} frames, ${((Date.now() - start) / 1000).toFixed(0)} s)`);
      }
      ff.stdin.end();
    };
    void write();
    ff.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
  }
}
void SHIELD_FX;
