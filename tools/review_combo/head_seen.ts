// (scratch) Is the head SEEN at a frame? Head centre and arm joints projected into each view, with nearness (bigger = nearer the eye).
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, project, solve } from '../../src/art/skeleton';
import type { Key3, V3 } from '../../src/art/skeleton';
const m = MOVES3.kslash; const B = m.build;
const variants: [string, Key3[]][] = [['as it is', m.motion.keys as Key3[]]];
const fix = m.motion.keys.map((k) => ({ ...k, pose: { ...k.pose } })) as Key3[];
fix[1].pose = { ...fix[1].pose, rhx: 6, rhy: 2, rhz: 12, faceTilt: -10 };
fix[2].pose = { ...fix[2].pose, rhx: 12, rhy: 6, rhz: 9, faceTilt: -10 };
variants.push(['hilt forward (6,2,12)', fix]);
for (const [name, keys] of variants) for (const fr of [2, 3]) {
  const s = solve(B, bonesAt(keys, m.rest, fr / 30));
  for (const v of ['front', 'back'] as const) {
    const P = (p: V3): string => { const r = project(p, v); return `(${r[0].toFixed(1)},${r[1].toFixed(1)} n${r[2].toFixed(1)})`; };
    console.log(`${name.padEnd(22)} f${fr} ${v.padEnd(5)} head ${P(s.head)} top-of-head z ${(s.head[2] + B.headR[2]).toFixed(1)} | handL ${P(s.handL)} z${s.handL[2].toFixed(1)} handR ${P(s.handR)} z${s.handR[2].toFixed(1)} | elbowL ${P(s.elbowL)} elbowR ${P(s.elbowR)} | shL ${P(s.shoulderL)} shR ${P(s.shoulderR)}`);
  }
}
