// (scratch) The slash's top (2*FR) and its 3*FR key together: hilt places that keep every arm off the head over frames 0-4.5.
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, cross, lerp3, solve, trunkOf } from '../../src/art/skeleton';
import type { Key3, V3 } from '../../src/art/skeleton';
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const m = MOVES3.kslash; const B = m.build;
function judge(keys: Key3[]): { head: number; at: number; short: number; moved: number; trunk: number } {
  let head = 9, at = 0, short = 0, moved = 0, trunk = 9;
  for (let i = 0; i <= 9; i++) {
    const t = i / 60; const q = bonesAt(keys, m.rest, t); const s = solve(B, q); const R = B.headR;
    for (const [sh, el, ha] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
      for (let j = 0; j <= 10; j++) {
        const up = j <= 5; const p = up ? lerp3(sh, el, j / 5) : lerp3(el, ha, (j - 5) / 5);
        const r = up ? B.armR[0] + (B.armR[1] - B.armR[0]) * (j / 5) : B.armR[1] + (B.armR[2] - B.armR[1]) * ((j - 5) / 5);
        const d = sub(p, s.head);
        const k = Math.hypot(dot(d, s.face[0]) / (R[0] + r), dot(d, s.face[1]) / (R[1] + r), dot(d, s.face[2]) / (R[2] + r));
        if (k < head) { head = k; at = t * 30; }
      }
      for (const [p, r] of [[el, B.armR[1]], [lerp3(el, ha, 0.5), B.armR[1]], [ha, B.armR[2]], [lerp3(sh, el, 0.7), B.armR[0] * 0.6]] as [V3, number][]) {
        for (const o of trunkOf(B, s)) { const d = sub(p, o.c); trunk = Math.min(trunk, Math.hypot(dot(d, o.r[0]) / (o.h[0] + r * 0.6), dot(d, o.r[1]) / (o.h[1] + r * 0.6), dot(d, o.r[2]) / (o.h[2] + r * 0.6))); }
      }
    }
    if (q.lhIn === 3 && q.lh2 === undefined) { const want = add(s.handR, add(mul(s.point, q.lhx), add(mul(s.across, q.lhz), mul(cross(s.across, s.point), q.lhy)))); short = Math.max(short, len(sub(want, s.handL))); }
    if (q.rh2 === undefined && q.rhIn === 0) { const c = s.chest; const want = add(s.shoulderR, add(mul(c[0], q.rhx), add(mul(c[1], q.rhy), mul(c[2], q.rhz)))); moved = Math.max(moved, len(sub(want, s.handR))); }
  }
  return { head, at, short, moved, trunk };
}
const base = m.motion.keys.map((k) => ({ ...k, pose: { ...k.pose } }));
const res: [number, string][] = [];
for (const [rhx, rhy, rhz] of [[2, 2, 16], [2, 2, 12], [3, 0, 11], [4, 2, 10], [2, 0, 10], [6, 2, 12], [1, 4, 19], [0, 6, 20]]) {
  for (const faceTilt of [0, -10]) for (const x3 of [10, 12, 14, 16]) for (const y3 of [0, 3, 6]) for (const z3 of [6, 9, 12, 15]) {
    const keys = base.map((k) => ({ ...k, pose: { ...k.pose } }));
    keys[1].pose = { ...keys[1].pose, rhx, rhy, rhz, faceTilt };
    keys[2].pose = { ...keys[2].pose, rhx: x3, rhy: y3, rhz: z3, faceTilt };
    const j = judge(keys as Key3[]);
    if (j.short < 0.6 && j.moved < 1.5 && j.trunk > 0.9) res.push([j.head, `top (${rhx},${rhy},${rhz}) f3 (${x3},${y3},${z3}) faceTilt ${faceTilt} -> head ${j.head.toFixed(2)} @f${j.at.toFixed(1)} trunk ${j.trunk.toFixed(2)} moved ${j.moved.toFixed(2)}`]);
  }
}
res.sort((a, b) => b[0] - a[0]);
console.log(res.length, 'candidates'); console.log(res.slice(0, 20).map((r) => r[1]).join('\n'));
console.log('--- keeping the top as it is (2,2,16):'); console.log(res.filter((r) => r[1].startsWith('top (2,2,16)')).slice(0, 5).map((r) => r[1]).join('\n'));
