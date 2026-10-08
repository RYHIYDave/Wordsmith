// (scratch, not committed) Per-frame measures of the strike and the slash on the bones.
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, lerp3, solve, trunkOf } from '../../src/art/skeleton';
import type { V3 } from '../../src/art/skeleton';
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const D = 180 / Math.PI;
for (const key of (process.argv[2] ?? 'strike,kslash').split(',')) {
  const m = MOVES3[key];
  const B = m.build;
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  console.log(`\n== ${key}: ${m.name}; hit at frame ${((m.motion.hit ?? 0) * 30).toFixed(1)}, ends at frame ${(end * 30).toFixed(1)}`);
  console.log('frame | head: arm depth (<1 = in it) which | trunk depth | hips yaw  chest yaw  chest tilt(pitch+bend)  | face up | blade az el  tip z | handR fig xyz | pelvis x z | L toe x,y,z  R toe x,y,z');
  const steps = Math.round(end * 60);
  for (let i = 0; i <= steps; i++) {
    const t = i / 60;
    const q = bonesAt(m.motion.keys, m.rest, t);
    const s = solve(B, q);
    // the head as an ellipsoid on the face's own axes; an arm point is in it if its skin is
    const R = B.headR;
    let worst = 9, which = '';
    for (const [nm, sh, el, ha] of [['L', s.shoulderL, s.elbowL, s.handL], ['R', s.shoulderR, s.elbowR, s.handR]] as [string, V3, V3, V3][]) {
      for (let j = 0; j <= 10; j++) {
        const upper = j <= 5;
        const p = upper ? lerp3(sh, el, j / 5) : lerp3(el, ha, (j - 5) / 5);
        const r = upper ? B.armR[0] + (B.armR[1] - B.armR[0]) * (j / 5) : B.armR[1] + (B.armR[2] - B.armR[1]) * ((j - 5) / 5);
        const d = sub(p, s.head);
        const k = Math.hypot(dot(d, s.face[0]) / (R[0] + r), dot(d, s.face[1]) / (R[1] + r), dot(d, s.face[2]) / (R[2] + r));
        if (k < worst) { worst = k; which = `${nm} ${upper ? 'upper arm' : j === 10 ? 'hand' : 'forearm'}`; }
      }
    }
    // the audit's own measure against the trunk
    const trunk = trunkOf(B, s);
    let tdeep = 9;
    for (const [sh, el, hand] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
      for (const [p, r] of [[el, B.armR[1]], [lerp3(el, hand, 0.5), B.armR[1]], [hand, B.armR[2]], [lerp3(sh, el, 0.7), B.armR[0] * 0.6]] as [V3, number][]) {
        for (const o of trunk) {
          const d = sub(p, o.c);
          const k = Math.hypot(dot(d, o.r[0]) / (o.h[0] + r * 0.6), dot(d, o.r[1]) / (o.h[1] + r * 0.6), dot(d, o.r[2]) / (o.h[2] + r * 0.6));
          tdeep = Math.min(tdeep, k);
        }
      }
    }
    const tip: V3 = [s.handR[0] + s.point[0] * (1.3 + 0.6 * 57), s.handR[1] + s.point[1] * (1.3 + 0.6 * 57), s.handR[2] + s.point[2] * (1.3 + 0.6 * 57)];
    const az = Math.atan2(s.point[1], s.point[0]) * D, el = Math.asin(Math.max(-1, Math.min(1, s.point[2]))) * D;
    const up = s.chest[2];
    const tilt = Math.acos(Math.max(-1, Math.min(1, up[2]))) * D;
    const fUp = Math.asin(Math.max(-1, Math.min(1, s.face[0][2]))) * D;
    const f = (v: number, w = 6, p = 1): string => v.toFixed(p).padStart(w);
    const fr = (t * 30).toFixed(1).padStart(5);
    console.log(`${fr} | ${f(worst, 5, 2)} ${which.padEnd(13)} | ${f(tdeep, 5, 2)} | ${f(q.yaw)} ${f(q.yaw + q.twist)} ${f(tilt)} (${f(q.pitch, 4, 0)}+${f(q.bend, 3, 0)}) | ${f(fUp)} | ${f(az)} ${f(el)} ${f(tip[2])} | ${f(s.handR[0])}${f(s.handR[1])}${f(s.handR[2])} | ${f(s.pelvis[0])}${f(s.pelvis[2])} | ${f(s.toeL[0])}${f(s.toeL[1])}${f(s.toeL[2])}  ${f(s.toeR[0])}${f(s.toeR[1])}${f(s.toeR[2])}`);
  }
}
