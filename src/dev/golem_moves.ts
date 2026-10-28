// HER GOLEM MOVING: ITS GROUND POUND (the art chat, 28 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His brief, 23 Oct: “Tap and hold will be “Golem”.  And this is gonna be clockwork Automaton that follows her around and
// attacks.  It will just go around and I guess punch things or whatever but tap+hold will have him do a bigger move.”; its
// bigger move, “Ground pound (Recommended)”; and of its look, 24 Oct: “Ground pound might be one of his moves but it
// doesn’t need to factor into his design.”, his pick the boiler ape with one giant arm (dev/sculpt_golem.ts GOLEM_PICK).
//
// SO, THE GROUND POUND, by his art rulebook's Movement 9 (a big wind-up, the strike a flash, a big wind-down): it rears
// back, its giant arm hauled up and back over its head, its forearm folded, its boiler body leaning back and rising on its
// stumpy legs; it holds there, quivering, steam hissing out of its stacks; then in a flash it HAMMERS the fist down onto the
// floor before it; the floor cracks open round the fist, a ring of dust and its pale steam bursting out over the floor,
// stone flung up, whoever is near thrown up and back; it rocks back up off the blow, its fist bouncing on the floor, steam
// venting off it, and settles. Its body is drawn whole each frame (dev/sculpt_golem.ts GOLEM_POSE): its arm swung about
// its shoulder, its forearm folded at its elbow, its body leaning about its hips and bobbing; its legs stand where they
// stand.

/** Its ground pound through time, in frames (30 a second). */
export const GP = { rear: 2, raised: 16, hold: 22, slam: 23, hit: 25, rock: 29, settle: 40, end: 50 };
/** The strike itself: the hammer coming down, a flash (his rulebook's Movement 9): not judged frame by frame. */
export const GP_STRIKE: [number, number] = [GP.hold, GP.hit + 1];

/** A number through keys (frame, value), eased in and out between them. */
function track(ks: [number, number][], f: number): number {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) {
      const u = (f - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]);
      return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * u * u * (3 - 2 * u);
    }
  }
  return ks[ks.length - 1][1];
}
/** Its pose at frame `f` of its ground pound: its giant arm's swing and fold, its body's lean and bob. */
export function groundPound(f: number): { swing: number; fold: number; lean: number; bob: number } {
  // (quivering as it holds there, the arm straining)
  const quiver = f > GP.raised && f < GP.hold ? Math.sin(((f - GP.raised) / (GP.hold - GP.raised)) * Math.PI * 2) * 0.9 : 0;
  // (the hammer coming down: all at once, gathering speed as it falls, as a hammer does)
  if (f > GP.hold && f < GP.hit) {
    const u = (f - GP.hold) / (GP.hit - GP.hold);
    const e = u * u;
    return { swing: 158 * (1 - e), fold: 52 * (1 - e), lean: -15 + 15 * e, bob: 4 - 4 * e };
  }
  return {
    swing: track([[0, 0], [GP.rear, 4], [GP.raised, 150], [GP.hold, 158], [GP.hit, 0], [GP.rock, 4], [GP.settle, 0]], f) + quiver,
    fold: track([[0, 0], [GP.rear, 2], [GP.raised, 48], [GP.hold, 52], [GP.hit, 0], [GP.end, 0]], f),
    lean: track([[0, 0], [GP.rear, 2], [GP.raised, -12], [GP.hold, -15], [GP.hit, 0], [GP.rock, -5], [GP.settle, 1], [GP.end, 0]], f),
    bob: track([[0, 0], [GP.rear, -0.6], [GP.raised, 3.2], [GP.hold, 4], [GP.hit, 0], [GP.rock, 1.8], [GP.settle, 0], [GP.end, 0]], f),
  };
}

// ---- ITS WALK: KNUCKLING ALONG AFTER HER (his brief: “It will just go around”). The boiler ape walks on its giant fist,
// as an ape on its knuckles: the fist planted on the floor before it, its body vaulting forward over it, rocking down
// onto it, its stumpy legs stepping up behind, one and the other; then the fist heaved up and swung on ahead to plant
// again. Heavy and slow: a round of 40 frames. Its fist and its feet grip the floor while down (his rulebook's Movement 8),
// keeping pace with the floor as the game carries it along.
export const GWALK = { round: 40, speed: 26 };
/** Where its giant arm's shoulder, elbow and fist are as it was built (forward, up), for reaching its fist to a spot. */
const SH: [number, number] = [6, 56];
const EL: [number, number] = [16, 40.72];
const FI: [number, number] = [27, 12.8];
const rot2 = (x: number, y: number, a: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
/** The swing and fold of its giant arm that put its fist's middle at `t` (forward, up), its body leaning `lean` (degrees) about its hips and bobbed `bob`. */
export function reachFist(t: [number, number], lean: number, bob: number): { swing: number; fold: number } {
  const D = Math.PI / 180;
  // (the spot as its arm sees it, before its body leans and bobs: its lean about its hips undone)
  const pv: [number, number] = [-7, 28];
  const r = rot2(t[0] - pv[0], t[1] - bob - pv[1], lean * D);
  const T: [number, number] = [pv[0] + r[0], pv[1] + r[1]];
  const want = Math.hypot(T[0] - SH[0], T[1] - SH[1]);
  const lenAt = (fold: number): number => {
    const e = rot2(FI[0] - EL[0], FI[1] - EL[1], fold * D);
    return Math.hypot(EL[0] + e[0] - SH[0], EL[1] + e[1] - SH[1]);
  };
  // (its elbow folded until its fist is as far from its shoulder as the spot is: of the two ways a fold can do that, the
  // one bent forward, as its elbow bends; as near as it reaches, if the spot is out of its reach)
  let best = 0;
  let bestErr = Infinity;
  for (let g = -60; g <= 150; g += 1) {
    const err = Math.abs(lenAt(g) - want) + (g < -5 ? 0.02 * (-5 - g) : 0);
    if (err < bestErr) {
      bestErr = err;
      best = g;
    }
  }
  let lo = best - 1;
  let hi = best + 1;
  const sign = lenAt(hi) < lenAt(lo) ? 1 : -1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if ((lenAt(mid) - want) * sign > 0) lo = mid;
    else hi = mid;
  }
  const fold = Math.abs(lenAt((lo + hi) / 2) - want) < bestErr + 1e-6 ? (lo + hi) / 2 : best;
  const e = rot2(FI[0] - EL[0], FI[1] - EL[1], fold * D);
  const v: [number, number] = [EL[0] + e[0] - SH[0], EL[1] + e[1] - SH[1]];
  const swing = (Math.atan2(T[1] - SH[1], T[0] - SH[0]) - Math.atan2(v[1], v[0])) / D;
  return { swing, fold };
}
/** Its pose at frame `f` of its walk (a round; the game carries it GWALK.speed a second). */
export function golemWalk(f: number): { swing: number; fold: number; lean: number; bob: number; feet: [number, number, number, number]; level: number } {
  const P = GWALK.round;
  const ph = (((f / P) % 1) + 1) % 1;
  const v = GWALK.speed / 30;
  const ease = (u: number): number => {
    const c = Math.max(0, Math.min(1, u));
    return c * c * (3 - 2 * c);
  };
  /** A foot or a fist: down for `on` of the round from `at`, going back under it at the floor's pace; then up and swung on ahead. */
  const step = (at: number, on: number, lift: number): [number, number] => {
    const q = (((ph - at) % 1) + 1) % 1;
    const L = v * on * P;
    if (q < on) return [L / 2 - v * q * P, 0];
    const u = (q - on) / (1 - on);
    return [-L / 2 + L * ease(u), lift * Math.sin(Math.PI * u)];
  };
  // (its body vaulting forward over its planted fist and rocking down onto it; rising as it swings it on)
  // (leaning out over its fist as it plants it, its shoulder reaching it; back as the fist goes back under and behind it)
  const lean = 2 + 7 * Math.cos(ph * Math.PI * 2);
  const bob = 1.8 * Math.sin((ph - 0.2) * Math.PI * 2);
  const [ff, fz] = step(0, 0.6, 12);
  // (planted a little behind where it rests as it stands, within its reach as its body vaults over it)
  const arm = reachFist([21 + ff, FI[1] + fz], lean, bob);
  const [lf, lz] = step(0.15, 0.7, 6);
  const [rf, rz] = step(0.55, 0.7, 6);
  return { ...arm, lean, bob, feet: [lf, lz, rf, rz], level: 1 };
}

// ---- ITS PUNCH (his brief: “It will just go around and I guess punch things”): by his rulebook's Movement 9, a big
// wind-up and a lightning strike. It draws its giant arm back, the forearm cocked, its boiler body turning back and
// rising; then in a flash it drives the fist straight out before it, its body lunging after it; holds a beat on the blow;
// and hauls the arm back down to rest on the floor, its body settling.
export const GPUNCH = { cock: 12, hold: 15, hit: 17, stay: 20, back: 34, end: 40 };
export const GPUNCH_STRIKE: [number, number] = [GPUNCH.hold, GPUNCH.hit + 1];
/** Its pose at frame `f` of its punch. */
export function golemPunch(f: number): { swing: number; fold: number; lean: number; bob: number } {
  // (the blow itself: driven out all at once)
  if (f > GPUNCH.hold && f < GPUNCH.hit) {
    const u = (f - GPUNCH.hold) / (GPUNCH.hit - GPUNCH.hold);
    return { swing: -58 + (64 + 58) * u, fold: 82 - 88 * u, lean: -12 + 24 * u, bob: 2 - 3 * u };
  }
  return {
    swing: track([[0, 0], [GPUNCH.cock, -52], [GPUNCH.hold, -58], [GPUNCH.hit, 64], [GPUNCH.stay, 61], [GPUNCH.back, 0], [GPUNCH.end, 0]], f),
    fold: track([[0, 0], [GPUNCH.cock, 76], [GPUNCH.hold, 82], [GPUNCH.hit, -6], [GPUNCH.stay, -4], [GPUNCH.back, 0], [GPUNCH.end, 0]], f),
    lean: track([[0, 0], [GPUNCH.cock, -11], [GPUNCH.hold, -12], [GPUNCH.hit, 12], [GPUNCH.stay, 11], [GPUNCH.back, 0], [GPUNCH.end, 0]], f),
    bob: track([[0, 0], [GPUNCH.cock, 1.6], [GPUNCH.hold, 2], [GPUNCH.hit, -1], [GPUNCH.stay, -1], [GPUNCH.back, 0], [GPUNCH.end, 0]], f),
  };
}
