// (scratch) For every move: the deepest any arm goes into the head, and over which frames.
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, lerp3, solve } from '../../src/art/skeleton';
import type { V3 } from '../../src/art/skeleton';
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
for (const [key, m] of Object.entries(MOVES3)) {
  const B = m.build; const end = m.motion.keys[m.motion.keys.length - 1].at;
  let worst = 9, at = 0, from = -1, to = -1;
  const n = Math.max(1, Math.round(end * 60));
  for (let i = 0; i <= n; i++) {
    const t = (end * i) / n; const s = solve(B, bonesAt(m.motion.keys, m.rest, t)); const R = B.headR;
    let k0 = 9;
    for (const [sh, el, ha] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
      for (let j = 0; j <= 10; j++) {
        const up = j <= 5; const p = up ? lerp3(sh, el, j / 5) : lerp3(el, ha, (j - 5) / 5);
        const r = up ? B.armR[0] + (B.armR[1] - B.armR[0]) * (j / 5) : B.armR[1] + (B.armR[2] - B.armR[1]) * ((j - 5) / 5);
        const d = sub(p, s.head);
        k0 = Math.min(k0, Math.hypot(dot(d, s.face[0]) / (R[0] + r), dot(d, s.face[1]) / (R[1] + r), dot(d, s.face[2]) / (R[2] + r)));
      }
    }
    if (k0 < 1) { if (from < 0) from = t; to = t; }
    if (k0 < worst) { worst = k0; at = t; }
  }
  if (worst < 1) console.log(`${key.padEnd(10)} arm in the head: deepest ${worst.toFixed(2)} at frame ${(at * 30).toFixed(1)}, frames ${(from * 30).toFixed(1)}-${(to * 30).toFixed(1)}`);
}
console.log('(1 = the arm\'s skin touches the head\'s; below 1, in it)');
