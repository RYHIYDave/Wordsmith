// THE GATE WARD'S MOMENT AROUND THE HERO (a mock-up; nothing of the game imports it).
//
// His rulebook's Places 8, his words of 10 Oct: “I’d also like a couple environmental things happening around
// you for immersion unique for each floor.  Something shifts above you and dust comes down, you spook a pack of
// birds and they fly off,  a root shrivels as you walk by.  That sort of stuff”. Asked which of four for floor 11
// (18 Oct), his one pick: “Pigeons burst off a roof (Recommended)” (offered as: a flock on a roof ridge explodes
// up as he passes, wings clapping, and wheels off over the rooftops). Checked against his Animations 1 before he
// sees it: “as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch
// too low.”
//
//   THE PIGEONS BURST OFF A ROOF: nine of the city's pigeons along a roof's ridge (`before`, a loop: bobbing,
//     pecking at the moss between the tiles, one puffed up and cooing at another). Something below startles
//     them (the hero going by): every head up at once; then, one hard on another, all nine burst up off the
//     ridge within a fifth of a second, wings clapping over their backs on the first beats, a puff of the roof's
//     grit and moss blown out from under each and feathers shaken loose; they drop off the roof's edge and swoop
//     out low over the street (over the hero's head: the roofs he sees are all beyond him, at the top of his
//     screen, so a flock that only climbed would be gone at once), drawing in together, and the flock wheels round
//     as one and climbs away over the rooftops on fast beats, gliding a beat now and then, darker as it goes up,
//     and out of the picture. The feathers rock down and settle on the roof, where they stay (`after`).
//
// Built as floor 2's ravens are (art/floor2.ts, onPic: picture pixels, KT to a tile), on a roof: the picture's
// anchor is the point of the floor under the middle of the ridge, the birds standing GW_RISE up (the ground's
// roofs, art/gateward.ts), the ridge along x. Lay it on a roof whose ridge runs along x (gateWardRidge says
// which way a roof's ridge runs, and where).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { fastBlit, painted } from './floorkit';
import type { Moment, Track } from './floorkit';
import { TOWARD, onPic, paintPuffs, puffRing, turnToward } from './floor2';
import type { Puff } from './floor2';
import { GW_RISE } from './gateward';
import { GRAIN, ball, compose, hash, limb } from './kit';
import type { Ramp } from './kit';

/** A city pigeon's blue-grey, in the dusk: its back and breast; its wings' two black bars and dark tips; its neck's green and violet sheen; its pale rump and underwing; its feet. */
const PIGEON: Ramp = ['#24263a', '#4a4e68', '#737894', '#a0a4be', '#c8ccdc'];
const PIGEON_DARK: Ramp = ['#18181f', '#26262f', '#34343f', '#44444f', '#56565f'];
const NECK: Ramp = ['#22283a', '#38485a', '#4e6462', '#6a6488', '#827aa0'];
/** Its head, a shade darker than its back. */
const HEAD: Ramp = ['#1e2034', '#363a56', '#525674', '#72769a', '#8c90ae'];
const UNDER: Ramp = ['#40425a', '#666a84', '#9498b0', '#b4b8cc', '#d0d4e2'];
const BAR = '#1a1a24';
const RUMP = '#d0d4e2';
const FEET: Ramp = ['#3a1e26', '#3a1e26', '#6e3640', '#9a4c56', '#9a4c56'];
const BILL: Ramp = ['#1c1a22', '#1c1a22', '#36323c', '#4a4650', '#4a4650'];
const CERE = '#c4c2cc';
const EYE = '#c8803e';
/** A pigeon's feather, shed: pale grey, lit along its edge, so that it shows on the roof. */
const FEATHER: Ramp = ['#3a3c4c', '#3a3c4c', '#6e7290', '#9ea2bc', '#b8bccc'];
/** The roof's grit and moss blown out from under them. */
const GRIT = ['#3e3440', '#544650'] as const;
/** The clap of their wings over their backs on the first beats: a pale crack of air. */
const CLAP = '#c8ccdc';

/** How high the roof is: the ground's tops (art/gateward.ts), the ridge's capping a little higher. */
const RZ = GW_RISE + 2;

/**
 * THE PIGEONS BURST OFF A ROOF (see the head of this file). Its picture is tall and wide, for the flock to wheel
 * round in and fly out of; each frame cut down to what is painted in it.
 */
function pigeonsBurstUp(): Moment {
  const W = 1040;
  const H = 700;
  const ax = 440;
  const ay = 560;
  const STARTLE = 4;
  const N = 9;
  interface Bird { x: number; y: number; h: number; T: number; coo: boolean; hop: boolean; slot: [number, number, number]; beat: number }
  // (along the ridge, about its middle; each its own way, a few facing along it, most across; the frame it leaps)
  const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => hash(a, 7, 2101) - hash(b, 7, 2101));
  const BIRDS: Bird[] = Array.from({ length: N }, (_, i) => {
    const x = -60 + (120 * i) / (N - 1) + (hash(i, 1, 2102) - 0.5) * 5;
    const y = (hash(i, 2, 2102) - 0.5) * 6;
    const h = hash(i, 3, 2102) < 0.3 ? (hash(i, 4, 2102) < 0.5 ? 0 : Math.PI) : (hash(i, 4, 2102) < 0.5 ? 1 : -1) * (Math.PI / 2) + (hash(i, 5, 2102) - 0.5) * 0.8;
    const rank = order.indexOf(i);
    // (in the flock, each its place about its middle: drawn in a little from where it stood, and up or down)
    const slot: [number, number, number] = [(hash(i, 6, 2102) - 0.5) * 70, -x * 0.12 + (hash(i, 7, 2102) - 0.5) * 50, (hash(i, 8, 2102) - 0.5) * 44];
    return { x, y, h, T: 8 + Math.round((rank * 6) / (N - 1)), coo: i === 4, hop: i === 7 || i === 2, slot, beat: 5 + hash(i, 9, 2102) * 0.8 };
  });

  // THE FLOCK'S WAY: off the ridge and out over the street toward the eye, dropping off the roof's edge as it goes
  // (down the picture); wheeling round to the right as one, and climbing away up the picture, faster as it goes
  const H0 = 0.62;
  const TURN = -2.5;
  const smooth = (u: number): number => {
    const k = Math.max(0, Math.min(1, u));
    return k * k * (3 - 2 * k);
  };
  const way: [number, number, number][] = [[0, 0, 0]];
  for (let t = 1; t < 240; t++) {
    const v = 3.0 + 3.4 * (1 - Math.exp(-t / 8));
    const h = H0 + TURN * smooth((t - 10) / 44);
    const [px, py] = way[t - 1];
    const u = Math.max(0, t - 16);
    way.push([px + Math.cos(h) * v, py + Math.sin(h) * v, 12 * (1 - Math.exp(-t / 2.5)) - 34 * smooth((t - 3) / 14) + 1.2 * u + 0.008 * u * u]);
  }
  const headingAt = (t: number): number => H0 + TURN * smooth((t - 10) / 44);

  interface Pose { x: number; y: number; z: number; h: number; pitch: number; wing: number; whip: number; span: number; head: number; puff: number; legs: number; clap: number }
  const LAST = 190;
  const poses: Pose[][] = BIRDS.map((B, i) => {
    const out: Pose[] = [];
    for (let f = 0; f < LAST; f++) {
      const P: Pose = { x: B.x, y: B.y, z: RZ, h: B.h, pitch: 0, wing: 0, whip: 0, span: 0, head: 0, puff: 0, legs: 1, clap: 0 };
      if (f < STARTLE) {
        // bobbing and pecking at the moss, each to its own beat; the one puffed up, cooing
        P.head = [0, -2, -4, -1][(f + i) % 4];
        if (B.coo) P.puff = [1, 0.6, 1, 0.8][f % 4];
      } else if (f < B.T - 3) {
        // startled: heads up and stock still; two hop; the cooing one deflates
        const k = f - STARTLE;
        P.head = 2.5;
        P.h = B.h + Math.sin(k * 1.3 + i) * 0.25;
        if (B.hop) P.z = RZ + ([2, 4, 3, 1][k] ?? 0);
      } else if (f < B.T) {
        // the crouch: down on its legs, turning for the way it will go, its wings flung up over its back
        const k = (f - (B.T - 3) + 1) / 3;
        P.z = RZ - 1.5 * k;
        P.h = turnToward(B.h, headingAt(0), 0.5 * k);
        P.wing = 0.4 + 0.9 * k;
        P.span = 0.4 + 0.6 * k;
        P.head = 2.5 - 3 * k;
        P.pitch = 0.2 * k;
      } else {
        // up: off the ridge on hard beats, the first three clapping over its back; climbing with the flock,
        // drawing in to its place in it; gliding a beat now and then once it is high
        const t = f - B.T;
        const w = way[Math.min(way.length - 1, t)];
        const k = smooth(t / 22);
        const hd = headingAt(t);
        const ch = Math.cos(hd);
        const sh = Math.sin(hd);
        const [sf, sl, su] = B.slot;
        P.x = B.x + w[0] + k * (sf * ch - sl * sh);
        P.y = B.y + w[1] + k * (sf * sh + sl * ch);
        const ph = (2 * Math.PI * t) / B.beat;
        const glide = t > 26 && (t + i * 5) % 19 < 5;
        P.wing = glide ? 0.32 : Math.cos(ph) * (t < 10 ? 1.3 : 1.05);
        P.whip = glide ? 0.1 : 0.5 * Math.sin(ph);
        if (t < 3 * B.beat && Math.cos(ph) > 0.82) {
          // (the clap: its wings up past upright, their tips meeting over its back)
          P.wing = 1.62;
          P.whip = 0.2;
          P.clap = 1;
        }
        P.span = 1;
        P.z = RZ + w[2] + k * su + (glide ? 0 : 1.6 * Math.sin(ph));
        // (near the top of the picture it rides up on its wings held high, so that it goes out of it bit by bit, as
        // floor 2's ravens do)
        if (ay + onPic(P.x, P.y, P.z + 8)[1] < 140) {
          P.wing = 1.0 + 0.06 * Math.sin(ph);
          P.whip = 0.15;
          P.clap = 0;
        }
        P.pitch = 0.1 + 0.3 * Math.exp(-t / 5);
        P.legs = Math.max(0, 1 - t / 4);
        P.h = t < 1 ? P.h : 0;
      }
      out.push(P);
    }
    // the way each faces in the air: the way it goes
    for (let f = 1; f < LAST; f++) {
      if (f < B.T) continue;
      const a = out[f - 1];
      const b = out[f];
      b.h = Math.hypot(b.x - a.x, b.y - a.y) > 0.3 ? Math.atan2(b.y - a.y, b.x - a.x) : a.h;
      if (f === B.T) b.h = turnToward(out[f - 1].h, b.h, 0.6);
    }
    return out;
  });

  /** A pigeon as it is, painted on `q` from the picture's anchor: its plump body, its wings folded or spread, its small head and short bill, its fanned tail. */
  const SC = 1.5;
  const paintBird = (q: Px, P: Pose, ox: number, oy: number): void => {
    const ch = Math.cos(P.h);
    const sh = Math.sin(P.h);
    const cp = Math.cos(P.pitch);
    const sp = Math.sin(P.pitch);
    const F = [ch * cp, sh * cp, sp];
    const L = [-sh, ch, 0];
    const U = [-ch * sp, -sh * sp, cp];
    const bodyZ = 6 * SC + P.z;
    const at = (f: number, l: number, u: number): [number, number] => {
      const k = SC;
      const [x, y] = onPic(P.x + k * (f * F[0] + l * L[0] + u * U[0]), P.y + k * (f * F[1] + l * L[1] + u * U[1]), bodyZ + k * (f * F[2] + l * L[2] + u * U[2]));
      return [ox + x, oy + y];
    };
    const nearSide = L[0] + L[1] > 0 ? 1 : -1;
    const wing = (side: number): void => {
      const span = 17 * P.span;
      const arm = P.wing;
      const hand = P.wing + P.whip;
      const out3 = (from: [number, number, number], al: number, len: number, f: number): [number, number, number] => [f, from[1] + Math.cos(al) * side * len, from[2] + Math.sin(al) * len];
      const sho: [number, number, number] = [1, side * 2.8, 1.6];
      const wrist = out3(sho, arm, span * 0.42, 2);
      const wristT = out3(sho, arm, span * 0.4, -8);
      const tip = out3(wrist, hand, span * 0.58, -3);
      const pt = (q3: [number, number, number]): [number, number] => at(q3[0], q3[1], q3[2]);
      const nUp = [-Math.sin(arm) * side * L[0] + Math.cos(arm) * U[0], -Math.sin(arm) * side * L[1] + Math.cos(arm) * U[1], Math.cos(arm) * U[2]];
      const top = nUp[0] * TOWARD[0] + nUp[1] * TOWARD[1] + nUp[2] * TOWARD[2] > 0;
      const fill = top ? PIGEON[2] : UNDER[2];
      // its long pointed hand, dark at the tip
      q.poly([pt([3, sho[1], sho[2]]), pt(wrist), pt(tip), pt([-5, wristT[1] + (tip[1] - wristT[1]) * 0.72, wristT[2] + (tip[2] - wristT[2]) * 0.72]), pt(wristT), pt([-7, sho[1], sho[2]])], fill);
      const [a0x, a0y] = pt([3, sho[1], sho[2]]);
      const [a1x, a1y] = pt(wrist);
      const [a2x, a2y] = pt(tip);
      const tipBase: [number, number, number] = [wrist[0] + (tip[0] - wrist[0]) * 0.55, wrist[1] + (tip[1] - wrist[1]) * 0.55, wrist[2] + (tip[2] - wrist[2]) * 0.55];
      const [b0x, b0y] = pt(tipBase);
      limb(q, b0x, b0y, a2x, a2y, 1.1, 0.5, top ? PIGEON_DARK : UNDER);
      q.line(a0x, a0y, a1x, a1y, top ? PIGEON[4] : UNDER[4]);
      q.line(a1x, a1y, a2x, a2y, top ? PIGEON[3] : UNDER[3]);
      if (top) {
        // its two black bars across the inner wing
        for (const s of [0.35, 0.62]) {
          const [c0x, c0y] = pt([-1 - 4 * s, sho[1] + (wrist[1] - sho[1]) * (0.3 + 0.2 * s), sho[2] + (wrist[2] - sho[2]) * (0.3 + 0.2 * s)]);
          const [c1x, c1y] = pt([-1 - 4 * s, sho[1] + (wrist[1] - sho[1]) * (0.85 + 0.1 * s), sho[2] + (wrist[2] - sho[2]) * (0.85 + 0.1 * s)]);
          q.line(c0x, c0y, c1x, c1y, BAR);
        }
      }
    };
    if (P.span > 0) wing(-nearSide);
    // legs: short and pink, down to the ridge; tucked up as it climbs
    if (P.legs > 0) {
      for (const side of [-1, 1]) {
        const [x0, y0] = at(0.3, side * 1.3, -3);
        let x1: number;
        let y1: number;
        if (P.span === 0 || P.legs >= 1) {
          [x1, y1] = onPic(P.x + SC * (ch * 0.8 + L[0] * side * 1.5), P.y + SC * (sh * 0.8 + L[1] * side * 1.5), Math.max(RZ, P.z));
          x1 += ox;
          y1 += oy;
        } else [x1, y1] = at(-2, side * 1.3, -3 - 3 * P.legs);
        limb(q, x0, y0, x1, y1, 0.8, 0.6, FEET);
      }
    }
    // its tail: a fan back from its rump, a dark band across its end
    const [t0x, t0y] = at(-5, 0, 0.6);
    const [t1x, t1y] = at(-12, -2.8, 0.2);
    const [t2x, t2y] = at(-13, 0, 0);
    const [t3x, t3y] = at(-12, 2.8, 0.2);
    q.poly([[t0x - 2, t0y - 1], [t1x, t1y], [t2x, t2y + 1], [t3x, t3y], [t0x + 2, t0y + 1]], PIGEON[2]);
    q.line(t1x, t1y, t2x, t2y + 1, BAR).line(t2x, t2y + 1, t3x, t3y, BAR);
    // its body: plump, its breast full (fuller still puffed up and cooing); its pale rump showing as it flies
    const [r0x, r0y] = at(-4.5, 0, 0.4);
    const [r1x, r1y] = at(2.6, 0, 1.4);
    limb(q, r0x, r0y, r1x, r1y, 3.5 * SC, (4.3 + 1.2 * P.puff) * SC, PIGEON);
    if (P.span > 0) {
      const [rx, ry] = at(-4.2, 0, 2.6);
      ball(q, rx, ry, 2.2, 1.6, [RUMP, RUMP, UNDER[3], RUMP, RUMP]);
    }
    // its wing folded along its side, its bars across it
    if (P.span === 0) {
      const [w0x, w0y] = at(2.5, nearSide * 2.4, 2.4);
      const [w1x, w1y] = at(-9, nearSide * 1.6, 0.6);
      limb(q, w0x, w0y, w1x, w1y, 2.6 * SC, 1.2 * SC, PIGEON);
      for (const s of [-2.2, -4.4]) {
        const [b0x, b0y] = at(s, nearSide * 2.6, 3.2);
        const [b1x, b1y] = at(s - 1.4, nearSide * 2.4, 0.4);
        q.line(b0x, b0y, b1x, b1y, BAR);
      }
      const [e1x, e1y] = at(-9.5, nearSide * 1.5, 0.8);
      const [e0x, e0y] = at(-6.5, nearSide * 2, 1.4);
      q.line(e0x, e0y, e1x, e1y, PIGEON_DARK[1]);
    }
    // its neck, green and violet, and its small round head, low as it pecks, up as it looks; its short bill
    const fw = Math.max(0, -P.head) * 0.6;
    const hu = 4.4 + P.head * 0.8;
    const [n0x, n0y] = at(3 + fw * 0.4, 0, 2 + P.head * 0.3);
    const [hx_, hy_] = at(5.2 + fw, 0, hu);
    limb(q, n0x, n0y, hx_, hy_, (2.3 + 0.9 * P.puff) * SC, 1.7 * SC, NECK);
    ball(q, hx_, hy_, 2.2 * SC, 2.0 * SC, HEAD);
    const [b0x, b0y] = at(7 + fw, 0, hu - 0.3);
    const [b1x, b1y] = at(9.4 + fw, 0, hu - 0.9);
    limb(q, b0x, b0y, b1x, b1y, 1.0, 0.5, BILL);
    q.set(Math.round(b0x), Math.round(b0y) - 1, CERE);
    const [ex, ey] = at(5.8 + fw, nearSide * 1.5, hu + 0.6);
    q.set(Math.round(ex), Math.round(ey), EYE);
    if (P.span > 0) wing(nearSide);
    // the clap: a pale crack of air where its wingtips meet over its back
    if (P.clap > 0) {
      const [cx, cy] = at(-2, 0, 17 * 0.98);
      q.line(cx - 4, cy - 2, cx - 1, cy - 4, CLAP).line(cx + 1, cy - 4, cx + 4, cy - 2, CLAP);
      q.line(cx - 5, cy + 1, cx - 3, cy + 1, CLAP).line(cx + 3, cy + 1, cx + 5, cy + 1, CLAP);
    }
  };

  // FEATHERS shaken loose: two or three from each of the first up, rocking down onto the roof and lying there
  interface Feather { f0: number; x: number; y: number; z0: number; ang: number; seed: number }
  const feathers: Feather[] = [];
  for (const i of order.slice(0, 6)) {
    for (const k of i % 2 ? [0, 2] : [0, 1, 3]) {
      const P = poses[i][BIRDS[i].T + k];
      feathers.push({ f0: BIRDS[i].T + k, x: P.x + (hash(i, k, 2112) - 0.5) * 10, y: P.y + (hash(i, k, 2113) - 0.5) * 10, z0: P.z - RZ + 12, ang: hash(i, k, 2111) * Math.PI, seed: i * 4 + k });
    }
  }
  const featherAt = (fe: Feather, k: number): { x: number; y: number; z: number; a: number; down: boolean } => {
    // (flung up a little by the beats, then rocking down; settled where it meets the roof)
    const zOf = (t: number): number => fe.z0 - 1.1 * t + 12 * (1 - Math.exp(-t / 3));
    let t = k;
    let down = false;
    if (zOf(k) <= 0) {
      down = true;
      t = 0;
      while (zOf(t + 1) > 0) t++;
      t++;
    }
    const sway = Math.sin(0.32 * t + fe.seed) * 5;
    return { x: fe.x + Math.cos(fe.ang) * sway + 0.3 * t, y: fe.y + Math.sin(fe.ang) * sway, z: RZ + Math.max(0, zOf(t)), a: fe.ang + 0.9 * Math.sin(0.32 * t + fe.seed + 1.2), down };
  };

  // THE GRIT AND MOSS blown off the tiles from under each as it beats up
  const puffs: Puff[] = BIRDS.flatMap((B, i) => [...puffRing(B.T, B.x, B.y, RZ, 8, 0.9, 4, 60 + i), { f0: B.T, x: B.x, y: B.y, z: RZ, ang: 0, v: 0, r0: 3, grow: 4, rise: 0.25, life: 12, seed: 300 + i }]);

  const tracks: Track[] = [...BIRDS.map((_, i) => ({ name: `pigeon ${i + 1}`, at: [] as Track['at'] })), ...feathers.map((_, i) => ({ name: `feather ${i + 1}`, at: [] as Track['at'] }))];
  const paint = (f: number, loop: number, record: boolean): Sprite => {
    const out = new Px(W, H);
    // the feathers: in the air, and settled on the roof
    const fl = new Px(W, H);
    feathers.forEach((fe, j) => {
      const k = f - fe.f0;
      if (k < 0) {
        if (record) tracks[N + j].at.push(null);
        return;
      }
      const s = featherAt(fe, k);
      const [x, y] = onPic(s.x, s.y, s.z);
      const dx = Math.cos(s.a) * 3.5;
      const dy = Math.sin(s.a) * (s.down ? 1.8 : 3.5);
      limb(fl, ax + x - dx, ay + y - dy, ax + x + dx, ay + y + dy, 0.6, 1.3, FEATHER);
      if (record) tracks[N + j].at.push({ x, y, shown: 1, size: 6 });
    });
    fastBlit(out, compose(null, [fl], null), 0, 0);
    // the birds, the nearest last
    const birds = new Px(W, H);
    const order2 = BIRDS.map((_, i) => i).sort((m, n) => poses[m][f].x + poses[m][f].y - (poses[n][f].x + poses[n][f].y));
    for (const i of order2) {
      const P = { ...poses[i][f] };
      if (f < STARTLE) {
        P.head = [0, -2, -4, -1][(loop + i) % 4];
        if (BIRDS[i].coo) P.puff = [1, 0.6, 1, 0.8][loop % 4];
      }
      const [bx, by] = onPic(P.x, P.y, P.z + 8);
      const BX = Math.round(bx);
      const BY = Math.round(by);
      const q = new Px(140, 140);
      paintBird(q, P, 70 - BX, 70 - BY);
      // (darker as it climbs up into the dusk: a step at a time)
      const dim = P.z > RZ + 240 ? 0.45 : P.z > RZ + 130 ? 0.25 : 0;
      const seamed = compose(null, [q], null);
      const all = painted(seamed);
      const kept = fastBlit(birds, seamed, ax + BX - 70, ay + BY - 70, dim);
      if (record) tracks[i].at.push({ x: bx, y: by, shown: all ? kept / all : 0, size: 30 });
    }
    paintPuffs(puffs, f, ax, ay, out, null, GRIT);
    fastBlit(out, birds, 0, 0);
    const bb = out.bounds(GRAIN)!;
    const cut = new Px(bb.w, bb.h);
    fastBlit(cut, out, -bb.x, -bb.y);
    return cut.sprite(ax - bb.x, ay - bb.y, GRAIN);
  };
  // it is over on the frame the last of them is out of the picture, every feather settled
  const frames: Sprite[] = [];
  for (let f = 0; f < LAST; f++) {
    frames.push(paint(f, f, true));
    if (f > STARTLE && BIRDS.every((_, i) => tracks[i].at[f]!.shown === 0) && feathers.every((fe) => featherAt(fe, f - fe.f0).down)) break;
  }
  const NF = frames.length;
  if (NF === LAST) throw new Error('the pigeons are still in the picture at the end');
  const before = [0, 1, 2, 3].map((k) => paint(0, k, false));
  return { name: 'the pigeons burst off a roof', frames, fps: 30, before, after: [frames[NF - 1]], tracks, jolts: [], holds: [] };
}

let moments: Moment[] | null = null;
/** The Gate Ward's moments around the hero: his one pick, the pigeons. */
export function gateWardMoments(): Moment[] {
  return (moments ??= [pigeonsBurstUp()]);
}
