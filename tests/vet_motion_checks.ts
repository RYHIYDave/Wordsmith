// THE CHECKS OF A MOVE OF THE VETERAN'S, FRAME BY FRAME, FOR A MOVE ON ITS OWN (the skins chat, 26 Nov 2026): what
// tests/veteran.test.ts asks of every move of his (slick; a foot down on the floor held where it is), written once more here for
// a test that asks it of one move or two, without the whole of his set. (A file of its own: his words, 7 Nov 2026, “a test helper
// changed goes in a file of its own, so that a change to it does not pull in every test”.)
import { inAir, poseAt, skel, slidesOf, spinAt, worldOf } from '../src/dev/veteran_moves';
import type { VetMotion } from '../src/dev/veteran_moves';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';

const framesOf = (m: VetMotion): number[] => Array.from({ length: m.long + (m.loops ? 0 : 1) }, (_, i) => i);
const strikeFrames = (m: VetMotion): [number, number][] => [...m.strikes.map((s) => [s.from, Math.max(s.at, ...s.hits.map((h) => h.f)) + 1] as [number, number]), ...(m.struck ?? []).map((f) => [f - 1, f + 1] as [number, number])];
/** The jolt of a landing or a take-off: the frame a foot leaves or meets the floor, and the next (not judged as slick). */
export function joltsOf(m: VetMotion): number[] {
  const out: number[] = [];
  const fr = framesOf(m);
  const up = (f: number): [boolean, boolean, boolean] => {
    const s = skel(poseAt(m, f));
    return [inAir(s), Math.min(s.toeL[2], s.heelL[2]) > 0.9, Math.min(s.toeR[2], s.heelR[2]) > 0.9];
  };
  for (let i = 1; i < fr.length; i++) {
    const a = up(fr[i - 1]);
    const b = up(fr[i]);
    if (a.some((x, k) => x !== b[k])) out.push(fr[i - 1], fr[i]);
  }
  return out;
}
/** Slick (nothing leaps, stalls or turns straight back at speed but the strike and a landing's jolt); a foot down stays where it is. */
export function slickFindings(m: VetMotion): string[] {
  const found: string[] = [];
  const fr = framesOf(m);
  const strikes = strikeFrames(m);
  const jo = joltsOf(m);
  const whirl = (f: number): boolean => Math.abs(spinAt(m, f) - spinAt(m, f - 1)) > 40 || Math.abs(spinAt(m, f + 1) - spinAt(m, f)) > 40;
  const free = (f: number): boolean => strikes.some(([a, b]) => f >= a && f <= b) || jo.includes(f) || whirl(f);
  const JOINTS = ['pelvis', 'head', 'handL', 'handR', 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'] as const;
  const sk = fr.map((f) => skel(poseAt(m, f)));
  for (const j of JOINTS) {
    for (const view of ['front', 'back'] as const) {
      const xy = sk.map((s, i) => project(worldOf(m, fr[i], s[j] as V3), view));
      const st = xy.slice(1).map((q, i) => [q[0] - xy[i][0], q[1] - xy[i][1]] as const);
      const sp = st.map(([x, y]) => Math.hypot(x, y));
      for (let i = 1; i < sp.length - 1; i++) {
        if (free(fr[i]) || free(fr[i + 1] ?? -1) || free(fr[i - 1])) continue;
        const [a, b, c] = [sp[i - 1], sp[i], sp[i + 1]];
        if (b > 4 && b > 2.4 * Math.max(a, c)) found.push(`${j} leaps ${b.toFixed(1)} at f${fr[i]} (${view})`);
        const sa = st[i - 1];
        const sb = st[i];
        if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3.5 && b > 3.5) found.push(`${j} turns straight back at speed at f${fr[i]} (${view})`);
      }
    }
  }
  const slides = slidesOf(m);
  for (let i = 1; i < fr.length; i++) {
    for (const toe of ['toeL', 'toeR'] as const) {
      if (slides.some(([side, a, b]) => side === toe.slice(3) && fr[i] > a && fr[i] <= b)) continue;
      const a = worldOf(m, fr[i - 1], sk[i - 1][toe]);
      const b = worldOf(m, fr[i], sk[i][toe]);
      if (a[2] < 0.7 && b[2] < 0.7 && Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.55) found.push(`f${fr[i]}: ${toe} slides ${Math.hypot(a[0] - b[0], a[1] - b[1]).toFixed(2)}`);
    }
  }
  return [...new Set(found)];
}
