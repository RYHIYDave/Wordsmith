// THE CLIPPING TEST FOR WHAT THE HEROES WEAR (7 Oct 2026; the owner, 00:06: "be sure to run the
// clipping tests for new models"). tools/audit_moves3.ts looks for an arm inside the BODY. The
// heroes he chose that night wear things that stand off the body, and an arm, a hand or a weapon
// can pass through those too: the mage's pointed hat (its brim and its cone) and her cape; the
// knight's helm and the visor that stands out from it; the ranger's cap. This goes through every
// move on the bones, a sixtieth of a second at a time, in both of the game's views (what is worn
// on a head is tipped from the eye, so it lies differently in each), and measures how far each
// hand, forearm, upper arm and weapon is INSIDE each of those things.
//   /opt/npm-tools/node_modules/.bin/tsx tools/audit_worn3.ts [depth to report from, in picture pixels: 1 if not given]
// THE SHAPES HERE ARE THE PAINTERS' OWN NUMBERS, WRITTEN AGAIN (art/hero3_mage.ts, hero3_knight.ts,
// hero3_ranger.ts): if a painter's hat, cape, helm or cap is changed, change it here.
import { MOVES3, GREAT_BLADE, STAFF_DOWN, STAFF_UP } from '../src/art/moves3';
import { BENT, BRIM, CAPE, POINT } from '../src/art/hero3_mage';
import { HELM } from '../src/art/hero3_knight';
import { eyesToward, stage, tippedFrom, wornOn } from '../src/art/skin';
import type { GameView, Stage } from '../src/art/skin';
import { add, bonesAt, cross, dot, lerp3, mul, norm, solve, sub } from '../src/art/skeleton';
import type { Build, Posed, Skeleton, V3 } from '../src/art/skeleton';

const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const D = Math.PI / 180;
const FROM = Number(process.argv[2] ?? 1) || 1;

/** Something worn: told a point and how thick what is there is, it says how deep inside it that is (0 or less: outside). */
interface Worn {
  name: string;
  depth: (p: V3, r: number) => number;
}
/** A round thing, its three half-lengths each along its own line. */
function egg(name: string, c: V3, axes: readonly [V3, V3, V3]): Worn {
  const r = axes.map(len);
  const least = Math.min(...r);
  return { name, depth: (p, pr) => {
    const d = sub(p, c);
    const u = Math.hypot(...axes.map((a, k) => dot(d, a) / (r[k] * r[k])));
    return (1 - u) * least + pr;
  } };
}
/** A length that is round, thick at one end and thin at the other. */
function cone(name: string, a: V3, b: V3, ra: number, rb: number): Worn {
  const ab = sub(b, a);
  const l2 = dot(ab, ab) || 1;
  return { name, depth: (p, pr) => {
    const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2));
    return ra + (rb - ra) * t + pr - len(sub(p, add(a, mul(ab, t))));
  } };
}
/** A plate: round, thin. */
function plate(name: string, c: V3, up: V3, wide: number, thick: number): Worn {
  return { name, depth: (p, pr) => {
    const d = sub(p, c);
    const h = dot(d, up);
    const out = len(sub(d, mul(up, h)));
    return Math.min(thick + pr - Math.abs(h), wide + pr - out);
  } };
}
/** Cloth that hangs round the shoulders: between two rings one over the other, each so far to the front and so far to the side. Only what is INSIDE it and below its top is counted (the body is inside it too). */
function tube(name: string, top: V3, low: V3, f: V3, l: V3, at: readonly [number, number, number, number]): Worn {
  const down = sub(low, top);
  const l2 = dot(down, down) || 1;
  return { name, depth: (p, pr) => {
    const t = dot(sub(p, top), down) / l2;
    if (t < 0 || t > 1) return -1;
    const c = add(top, mul(down, t));
    const u = at[0] + (at[2] - at[0]) * t;
    const v = at[1] + (at[3] - at[1]) * t;
    const d = sub(p, c);
    const k = Math.hypot(dot(d, f) / u, dot(d, l) / v);
    // (how far in from its skin, and no deeper than how far up from its hem)
    return Math.min((1 - k) * Math.min(u, v) + pr, (1 - t) * Math.sqrt(l2) + pr);
  } };
}

type Hero = 'knight' | 'ranger' | 'mage';
const heroOf = (held: string): Hero => (held === 'bow' ? 'ranger' : held === 'staff' ? 'mage' : 'knight');

/** What a hero wears that stands off the body, as it lies in one view. */
function wornBy(hero: Hero, st: Stage, s: Skeleton, B: Build): Worn[] {
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  const [cf, cl, cu] = s.chest;
  if (hero === 'mage') {
    const U = tippedFrom(st, hu, 22);
    const F = norm(sub(hf, mul(U, dot(hf, U))), hf);
    const C0 = add(s.head, mul(hu, R[2] * 0.82));
    const at = (up: number, back: number): V3 => add(C0, add(mul(U, up), mul(F, -back)));
    return [
      plate("her hat's brim", C0, U, BRIM * B.tall, 1.0),
      cone("her hat's point", at(0.9, 0), at(POINT * 0.5, BENT * 0.2), R[1] * 1.46, R[1] * 0.85),
      cone("her hat's point", at(POINT * 0.5, BENT * 0.2), at(POINT * 0.82, BENT * 0.55), R[1] * 0.85, R[1] * 0.44),
      cone("her hat's point", at(POINT * 0.82, BENT * 0.55), at(POINT * 0.92, BENT * 1.25), R[1] * 0.44, 0.4),
      // (the battle mage's cape: it hangs 4.4 below the root of her neck; the robed one's, CAPE)
      tube('her cape', add(s.neck, mul(cu, -1.3)), add(s.neck, mul(cu, -Math.min(CAPE, 4.4))), cf, cl, [B.ribDeep + 1.5, B.shoulderHalf + B.armR[0] + 0.7, B.ribDeep + 1.7, B.shoulderHalf + B.armR[0] + 1.0]),
    ];
  }
  if (hero === 'knight' && process.env.WAS === '1') {
    // (AS HE WAS until the night of 6 Oct: a smaller head, and over it a cone of steel drawn up to a point. To measure the new helm against.)
    const [wf, wl, wu] = wornOn(st, s);
    const brow = add(s.head, mul(hu, R[2] * 0.32));
    const peak = add(add(brow, mul(wu, R[2] * 2.25)), mul(wf, -R[0] * 0.15));
    return [
      egg('his head (as it was)', s.head, [mul(hf, R[0] * 1.14), mul(hl, R[1] * 1.2), mul(hu, R[2] * 1.02)]),
      cone('his pointed helm (as it was)', brow, peak, (R[0] * 1.3 + R[1] * 1.45) / 2, 0.45),
    ];
  }
  if (hero === 'knight') {
    const eyes = eyesToward(st, s);
    const mid = ((eyes[0] + eyes[1]) / 2) * D;
    const out = add(mul(hf, Math.cos(mid)), mul(hl, Math.sin(mid)));
    return [
      egg('his helm', add(s.head, mul(hu, R[2] * 0.05)), [mul(hf, R[0] * HELM[0]), mul(hl, R[1] * HELM[1]), mul(hu, R[2] * HELM[2])]),
      cone('his visor', add(s.head, add(mul(out, R[0] * 0.55), mul(hu, -R[2] * 0.22))), add(s.head, add(mul(out, R[0] * 2.25), mul(hu, -R[2] * 0.5))), 3.2, 0.7),
    ];
  }
  // (the ranger's cap SLUMPS on a head that is tipped far from upright, as the painter has it: it stays level, and is less wide)
  const [wf0, , wu0] = wornOn(st, s);
  const slump = Math.max(0, Math.min(1, (Math.acos(Math.max(-1, Math.min(1, hu[2]))) / D - 12) / 38));
  const wu = norm(add(mul(wu0, 1 - 0.65 * slump), [0, 0, 0.65 * slump]), wu0);
  const wf = norm(sub(wf0, mul(wu, dot(wf0, wu))), wf0);
  const wl = cross(wu, wf);
  const capC = add(add(s.head, mul(hu, R[2] * (0.82 - 0.12 * slump))), mul(wf, -R[0] * (0.1 + 0.25 * slump)));
  return [
    egg('his cap', capC, [mul(wf, R[0] * (1.42 - 0.22 * slump)), mul(wl, R[1] * (1.8 - 0.4 * slump)), mul(wu, R[2] * 0.56)]),
    egg("his cap's sag", add(add(capC, add(mul(wf, -R[0] * 0.85), mul(wl, -R[1] * 1.1))), [0, 0, -1.6]), [mul(wf, R[0] * 0.95), mul(wl, R[1] * 1.05), [0, 0, R[2] * 0.62]]),
  ];
}

/** The parts of a hero that may pass through what they wear: each a name, a place, and how thick it is there. */
function probes(hero: Hero, s: Skeleton, q: Posed, B: Build): { name: string; p: V3; r: number; arm: 'upper' | 'fore' | 'hand' | 'held' }[] {
  const [aS, aE, aW] = B.armR;
  const out: { name: string; p: V3; r: number; arm: 'upper' | 'fore' | 'hand' | 'held' }[] = [];
  for (const [side, sh, el, hand] of [['left', s.shoulderL, s.elbowL, s.handL], ['right', s.shoulderR, s.elbowR, s.handR]] as const) {
    for (const k of [0.45, 0.75, 1]) out.push({ name: `${side} upper arm`, p: lerp3(sh, el, k), r: aS + (aE - aS) * k + 0.4, arm: 'upper' });
    for (const k of [0.25, 0.5, 0.75]) out.push({ name: `${side} forearm`, p: lerp3(el, hand, k), r: aE + (aW - aE) * k + 0.5, arm: 'fore' });
    out.push({ name: `${side} hand`, p: hand, r: aW + 0.7, arm: 'hand' });
  }
  if (hero === 'mage') {
    const foot = add(s.handR, mul(s.point, -STAFF_DOWN));
    const tip = add(s.handR, mul(s.point, STAFF_UP + 6));
    for (let i = 0; i <= 30; i++) out.push({ name: i > 26 ? "her staff's head" : 'her staff', p: lerp3(foot, tip, i / 30), r: i > 26 ? 2.4 : 1.05, arm: 'held' });
  }
  if (hero === 'knight' && q.stow <= 0.5) {
    const guard = add(s.handR, mul(s.point, 1.3));
    for (let i = 0; i <= 20; i++) out.push({ name: 'his blade', p: add(guard, mul(s.point, (GREAT_BLADE * i) / 20)), r: 1.3, arm: 'held' });
    out.push({ name: "his sword's pommel", p: add(s.handR, mul(s.point, -5)), r: 1.2, arm: 'held' });
  }
  if (hero === 'ranger' && q.stow <= 0.5) {
    // (the bow's two limbs, from its grip in his left hand)
    for (const side of [1, -1]) for (const k of [0.4, 0.7, 1]) out.push({ name: 'his bow', p: add(s.handL, add(mul(s.across, side * 0.31 * B.tall * k), mul(s.point, -2 * k))), r: 1.1, arm: 'held' });
  }
  return out;
}

let flagged = 0;
const lines: string[] = [];
for (const [key, move] of Object.entries(MOVES3)) {
  const hero = heroOf(move.held);
  const B = move.build;
  const end = move.motion.keys[move.motion.keys.length - 1].at;
  const n = Math.max(1, Math.round(end * 60));
  // the worst of each (part, thing) there is in the move: how deep, when, in which view
  const worst = new Map<string, { d: number; t: number; view: GameView }>();
  for (const view of ['front', 'back'] as const) {
    const st = stage(view);
    for (let i = 0; i <= n; i++) {
      const t = (end * i) / n;
      const q = bonesAt(move.motion.keys, move.rest, t);
      const s = solve(B, q);
      const things = wornBy(hero, st, s, B);
      for (const pr of probes(hero, s, q, B)) {
        for (const w of things) {
          // (an upper arm is under a cape that hangs over the shoulders: that is how a cape is worn)
          if (w.name === 'her cape' && pr.arm === 'upper') continue;
          const d = w.depth(pr.p, pr.r);
          if (d <= 0) continue;
          const k = `${pr.name} in ${w.name}`;
          const was = worst.get(k);
          if (!was || d > was.d) worst.set(k, { d, t, view });
        }
      }
    }
  }
  const found = [...worst].filter(([, v]) => v.d >= FROM).sort((a, b) => b[1].d - a[1].d);
  if (found.length === 0) continue;
  flagged++;
  lines.push(`${key.padEnd(10)} (${hero})`);
  for (const [k, v] of found) lines.push(`    ${k}: ${v.d.toFixed(1)} deep at frame ${(v.t * 30).toFixed(1)} of ${(end * 30).toFixed(0)}, ${v.view}`);
}
console.log(lines.join('\n'));
console.log(flagged === 0 ? `nothing passes through anything worn (looked for ${FROM} deep or more, in ${Object.keys(MOVES3).length} moves, both views)` : `${flagged} of ${Object.keys(MOVES3).length} moves have something ${FROM} or more deep in something worn`);
