// (scratch) Per shown frame: how far the hips and the chest turn, how far the right hand goes, how far the blade turns (degrees between its directions).
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, solve } from '../../src/art/skeleton';
import type { V3 } from '../../src/art/skeleton';
const D = 180 / Math.PI;
const ang = (a: V3, b: V3): number => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * D;
for (const key of ['strike', 'kslash']) {
  const m = MOVES3[key];
  console.log(`\n${key}: frame-to-frame (the hit is frame 4)`);
  console.log(' from>to | hips yaw | chest yaw | right hand moves | blade turns | pelvis fwd | pelvis z');
  let prev = solve(m.build, bonesAt(m.motion.keys, m.rest, 0)); let pq = bonesAt(m.motion.keys, m.rest, 0);
  for (let f = 1; f <= 13; f++) {
    const q = bonesAt(m.motion.keys, m.rest, f / 30); const s = solve(m.build, q);
    const dh = Math.hypot(s.handR[0] - prev.handR[0], s.handR[1] - prev.handR[1], s.handR[2] - prev.handR[2]);
    console.log(`  ${String(f - 1).padStart(2)}>${String(f).padEnd(3)}| ${(q.yaw - pq.yaw).toFixed(1).padStart(8)} | ${(q.yaw + q.twist - pq.yaw - pq.twist).toFixed(1).padStart(9)} | ${dh.toFixed(1).padStart(16)} | ${ang(prev.point, s.point).toFixed(1).padStart(11)} | ${(s.pelvis[0] - prev.pelvis[0]).toFixed(1).padStart(10)} | ${(s.pelvis[2] - prev.pelvis[2]).toFixed(1).padStart(8)}`);
    prev = s; pq = q;
  }
}
