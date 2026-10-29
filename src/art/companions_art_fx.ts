// THE RANGER'S SIX COMPANIONS: THE SMEAR OF A STRIKE, AND EACH ONE'S GIFT WHERE IT BITES (the art chat's helper, 29 Oct
// 2026). A MOCK-UP: NOT IN THE GAME; nothing of the game imports this file.
//
// Each bite shows what it does for him, lightly, in the friend's cyan family (his rulebook, Colour 3: cyan glows only on
// the hero's side), each shaped as the thing it is (How art is made 9: never a plain ball or ring):
//   the HAWK'S MARK   a hunter's mark on its prey: a diamond of four points closing in on where its talons struck, and
//                     the three rakes of its talons (his next hit on it a sure critical: Precise)
//   the SNAKE'S DOSE  venom thrown off its fangs in drops, falling, and a bead or two of it rising off the bite
//   the WOLF'S HOLD   jaws of light: two rows of fangs closing on what it bit and holding there (Binding)
//   the BAT'S DRAW    drops drawn up out of the bite into the bat, for him (Leeching)
//   the FOX'S SPEED   gusts of wind streaming off it as it darts back (Swift; the Ranger's own way: wind)
//   the TORTOISE'S    the plates of its shell, flashing up over it in light, as a ward (Guarding)
//   SHIELD

import type { V3 } from './skeleton';
import { COMP_ATTACK, TAU, add, hash01, mul } from './companions_art_moves';
import type { Kind } from './companions_art_moves';

/** The smear's tones: the friend's wind, pale (the Ranger's own way, his rulebook's Animations 3: “wind, not energy”), newest to oldest. */
export function smearColours(): readonly [string, string, string] {
  return ['#d6f6f4', '#9ad8dc', '#5aa0b0'];
}
/** The friend's cyan, dark to white-hot (art/kit.ts CYAN and SPARK). */
export const GIFT = ['#0c6a80', '#22d0e0', '#8af6f0', '#b8fff8'] as const;
type Grain = [V3, string, number];

/** How long a gift shows after the blow (seconds). */
export const GIFT_LONG = 0.4;

/** A line of grains from a to b, one picture pixel apart or so. */
function line(out: Grain[], a: V3, b: V3, c: string, size = 1): void {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.8));
  for (let i = 0; i <= n; i++) out.push([[a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n, a[2] + ((b[2] - a[2]) * i) / n], c, size]);
}
/** As it fades: every other grain gone, then all but one in four. */
function fade(out: Grain[], from: number, age: number): void {
  if (age < 0.7) return;
  const keep = age < 0.88 ? 2 : 4;
  for (let i = out.length - 1; i >= from; i--) if (i % keep !== 0) out.splice(i, 1);
}

/** What is laid after its edge at `t` of its attack for its gift. `tipAt`: where the end it strikes with is at a moment. */
export function giftOf(k: Kind, t: number, tipAt: (t: number) => V3 | null): Grain[] {
  const A = COMP_ATTACK;
  const since = t - A.hit;
  const out: Grain[] = [];
  if (since < 0 || since > GIFT_LONG) return out;
  const age = since / GIFT_LONG;
  const at = tipAt(A.hit);
  if (!at) return out;
  const pop = Math.min(1, since / 0.08);
  if (k === 'hawk') {
    // the mark: four points closing in to a diamond round the struck place, held, and fading
    const r = 9 - 4.5 * pop;
    const c: V3 = [at[0], at[1], at[2] + 1];
    const pts: V3[] = [add(c, [r, 0, 0]), add(c, [0, r, 0]), add(c, [-r, 0, 0]), add(c, [0, -r, 0])];
    for (let i = 0; i < 4; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % 4];
      line(out, add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], 0.12)), add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], 0.38)), GIFT[1]);
      line(out, add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], 0.62)), add(a, mul([b[0] - a[0], b[1] - a[1], b[2] - a[2]], 0.88)), GIFT[1]);
      // (each point of the diamond a bright tick pointing in)
      line(out, a, add(a, mul([c[0] - a[0], c[1] - a[1], c[2] - a[2]], 0.3)), GIFT[3]);
    }
    // the rakes of its talons, three, across the struck place, gone first
    if (since < 0.22) for (const o of [-1.6, 0, 1.6]) line(out, add(at, [-2.5, o - 1.5, 3]), add(at, [2.5, o + 1.5, -2]), since < 0.1 ? GIFT[3] : GIFT[2]);
  } else if (k === 'snake') {
    // venom off its fangs: drops thrown forward and down, falling; and beads of it rising off the bite
    for (let i = 0; i < 9; i++) {
      const a = (hash01(i, 1) - 0.5) * 2.2;
      const sp = 9 + 8 * hash01(i, 2);
      const v: V3 = [Math.cos(a) * sp, Math.sin(a) * sp, 4 + 6 * hash01(i, 3)];
      const s = since;
      const p: V3 = [at[0] + v[0] * s, at[1] + v[1] * s, Math.max(0.5, at[2] - 0.5 + v[2] * s - 45 * s * s)];
      out.push([p, i % 3 === 0 ? GIFT[3] : GIFT[1], since < 0.12 && i % 2 === 0 ? 2 : 1]);
    }
    for (let i = 0; i < 3; i++) {
      const s = since - i * 0.08;
      if (s < 0) continue;
      out.push([add(at, [0.6 * Math.sin(i * 2.1 + s * 9), 0.6 * Math.cos(i * 1.7), 1 + 14 * s]), GIFT[2], s < 0.15 ? 2 : 1]);
    }
  } else if (k === 'wolf') {
    // jaws of light: an upper and a lower row of fangs, closing on the bite and holding it
    const r = 8 - 4 * pop;
    for (const s of [1, -1]) {
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * (i + 0.5)) / 5;
        const base: V3 = [at[0], at[1] + Math.cos(a) * r * 1.1, at[2] + s * Math.sin(a) * r];
        const toward: V3 = [at[0], at[1] + Math.cos(a) * (r - 2.6), at[2] + s * Math.sin(a) * (r - 2.6)];
        line(out, base, toward, i === 2 ? GIFT[3] : GIFT[2]);
      }
      // (the jaw's line the fangs grow from)
      for (let i = 0; i <= 10; i++) {
        const a = (Math.PI * i) / 10;
        out.push([[at[0], at[1] + Math.cos(a) * r * 1.1, at[2] + s * Math.sin(a) * r], GIFT[1], 1]);
      }
    }
  } else if (k === 'bat') {
    // drops drawn up out of the bite, rising and gathering back toward it
    const to = tipAt(Math.min(t, A.long)) ?? at;
    for (let i = 0; i < 10; i++) {
      const born = 0.03 * i;
      const s = (since - born) / 0.28;
      if (s < 0 || s > 1) continue;
      const wob = 1.2 * Math.sin(i * 2.3 + s * 6);
      const p: V3 = [at[0] + (to[0] - at[0] - 3) * s + wob * 0.5, at[1] + wob, at[2] + (to[2] - at[2] + 4) * s + 3 * Math.sin(Math.PI * s)];
      out.push([p, s < 0.3 ? GIFT[1] : GIFT[3], s > 0.2 && s < 0.7 ? 2 : 1]);
    }
  } else if (k === 'fox') {
    // gusts streaming back off it as it darts away: long thin lines of wind, rushing back and thinning
    const now = tipAt(t) ?? at;
    for (let i = 0; i < 5; i++) {
      const z = 2 + i * 2.2;
      const y = (i - 2) * 1.8;
      const head = 3 + 18 * since + 3 * hash01(i, 4);
      const long = 7 + 5 * hash01(i, 5);
      const a: V3 = [now[0] - head, now[1] + y, z];
      line(out, a, [a[0] - long * (1 - 0.5 * age), a[1], a[2]], i % 2 ? GIFT[2] : GIFT[3]);
    }
  } else {
    // the plates of its shell, flashing up over it as a ward: six of them on a dome round it, one after another
    const dirs: [number, number][] = [[0, 0.95], [0.6, 0.55], [-0.6, 0.55], [1.6, 0.4], [-1.6, 0.4], [3.14, 0.6]];
    dirs.forEach(([az, el], i) => {
      const s = since - 0.025 * i;
      if (s < 0) return;
      const R = 15;
      const c: V3 = [Math.cos(az) * Math.cos(el) * R + 2, Math.sin(az) * Math.cos(el) * R * 0.85, 4 + Math.sin(el) * R * 0.75];
      // (a six-sided plate on the dome, square to the way out to it)
      const n: V3 = [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)];
      const e1: V3 = [-Math.sin(az), Math.cos(az), 0];
      const e2: V3 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]];
      const hr = 3.4 * Math.min(1, s / 0.06);
      const corner = (j: number): V3 => add(c, add(mul(e1, Math.cos((TAU * j) / 6) * hr), mul(e2, Math.sin((TAU * j) / 6) * hr)));
      for (let j = 0; j < 6; j++) line(out, corner(j), corner(j + 1), s < 0.08 ? GIFT[3] : GIFT[1]);
      if (s < 0.12) out.push([c, GIFT[3], 2]);
    });
  }
  fade(out, 0, age);
  return out;
}
