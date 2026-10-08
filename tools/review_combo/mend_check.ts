// (scratch) The slash with the proposed key changes: clearances and frame-to-frame turns.
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, cross, lerp3, solve, trunkOf } from '../../src/art/skeleton';
import type { Key3, V3 } from '../../src/art/skeleton';
const D = 180 / Math.PI;
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const ang = (a: V3, b: V3): number => Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * D;
const m = MOVES3.kslash; const B = m.build;
const k = m.motion.keys.map((x) => ({ ...x, pose: { ...x.pose } })) as Key3[];
const which = process.argv[2] ?? 'all';
if (which !== 'none') {
  // the top: hilt forward and lower, head laid toward the left shoulder; reached evenly, not all at once
  k[1] = { ...k[1], ease: 'io', pose: { ...k[1].pose, rhx: 6, rhy: 2, rhz: 12, faceTilt: -10 } };
  // frame 3: the hips go first (yaw -20 -> 0), the chest stays back (twist -32 keeps it at -32), the blade only just past upright
  k[2] = { ...k[2], pose: { ...k[2].pose, yaw: 0, twist: -32, rhx: 12, rhy: 6, rhz: 9, wEl: 85, faceTilt: -10 } };
  // the way back: on through the frame-10 key without stopping at it
  k[6] = { ...k[6], ease: 'in' };
  k[7] = { ...k[7], ease: 'out' };
}
let head = 9, headAt = 0, trunk = 9, trunkAt = 0, short = 0, moved = 0;
for (let i = 0; i <= 26; i++) {
  const t = i / 60; const q = bonesAt(k, m.rest, t); const s = solve(B, q); const R = B.headR;
  for (const [sh, el, ha] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
    for (let j = 0; j <= 10; j++) {
      const up = j <= 5; const p = up ? lerp3(sh, el, j / 5) : lerp3(el, ha, (j - 5) / 5);
      const r = up ? B.armR[0] + (B.armR[1] - B.armR[0]) * (j / 5) : B.armR[1] + (B.armR[2] - B.armR[1]) * ((j - 5) / 5);
      const d = sub(p, s.head); const kk = Math.hypot(dot(d, s.face[0]) / (R[0] + r), dot(d, s.face[1]) / (R[1] + r), dot(d, s.face[2]) / (R[2] + r));
      if (kk < head) { head = kk; headAt = t * 30; }
    }
    for (const [p, r] of [[el, B.armR[1]], [lerp3(el, ha, 0.5), B.armR[1]], [ha, B.armR[2]], [lerp3(sh, el, 0.7), B.armR[0] * 0.6]] as [V3, number][]) {
      for (const o of trunkOf(B, s)) { const d = sub(p, o.c); const kk = Math.hypot(dot(d, o.r[0]) / (o.h[0] + r * 0.6), dot(d, o.r[1]) / (o.h[1] + r * 0.6), dot(d, o.r[2]) / (o.h[2] + r * 0.6)); if (kk < trunk) { trunk = kk; trunkAt = t * 30; } }
    }
  }
  if (q.lhIn === 3 && q.lh2 === undefined) { const want = add(s.handR, add(mul(s.point, q.lhx), add(mul(s.across, q.lhz), mul(cross(s.across, s.point), q.lhy)))); short = Math.max(short, len(sub(want, s.handL))); }
  if (q.rh2 === undefined && q.rhIn === 0) { const c = s.chest; const want = add(s.shoulderR, add(mul(c[0], q.rhx), add(mul(c[1], q.rhy), mul(c[2], q.rhz)))); moved = Math.max(moved, len(sub(want, s.handR))); }
}
console.log(`${which}: head ${head.toFixed(2)}@f${headAt.toFixed(1)} | trunk ${trunk.toFixed(2)}@f${trunkAt.toFixed(1)} | left hand short ${short.toFixed(2)} | right hand moved ${moved.toFixed(2)}`);
console.log(' from>to | hips yaw | chest yaw | right hand | blade turns');
let prev = solve(B, bonesAt(k, m.rest, 0)); let pq = bonesAt(k, m.rest, 0);
const rows: string[] = [];
for (let f = 1; f <= 13; f++) {
  const q = bonesAt(k, m.rest, f / 30); const s = solve(B, q);
  rows.push(`  ${String(f - 1).padStart(2)}>${String(f).padEnd(3)}| ${(q.yaw - pq.yaw).toFixed(1).padStart(8)} | ${(q.yaw + q.twist - pq.yaw - pq.twist).toFixed(1).padStart(9)} | ${len(sub(s.handR, prev.handR)).toFixed(1).padStart(10)} | ${ang(prev.point, s.point).toFixed(1).padStart(11)}`);
  prev = s; pq = q;
}
console.log(rows.join('\n'));
