// Looks through every move on the bones (src/art/moves3.ts), frame by frame, for what a picture
// would show as a fault: a hand that cannot reach where the pose puts it (it stops short of the
// hilt it is meant to hold), and any part of an arm inside the trunk.
//   /opt/npm-tools/node_modules/.bin/tsx tools/audit_moves3.ts
import { MOVES3 } from '../src/art/moves3';
import { add, bonesAt, cross, dot, lerp3, mul, solve, sub, trunkOf } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';

const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
let bad = 0;
for (const [key, move] of Object.entries(MOVES3)) {
  const B = move.build;
  const end = move.motion.keys[move.motion.keys.length - 1].at;
  let short = 0;
  let shortAt = 0;
  let pulled = 0;
  let pulledAt = 0;
  let inside = 0;
  let insideAt = 0;
  let deepest = 1;
  // (how far the body made each elbow swing from where the pose put it: the least and the most, in degrees)
  const swung = { L: [0, 0, 0, 0], R: [0, 0, 0, 0] };
  const n = Math.max(1, Math.round(end * 60));
  // (an elbow that JUMPS: how much further it goes in a sixtieth of a second than its hand and its shoulder do)
  let jump = 0;
  let jumpAt = 0;
  let jumpArm = '';
  let was: ReturnType<typeof solve> | null = null;
  for (let i = 0; i <= n; i++) {
    const t = (end * i) / n;
    const q = bonesAt(move.motion.keys, move.rest, t);
    const s = solve(B, q);
    if (was) {
      for (const [name, e0, e1, h0, h1, s0, s1] of [['left', was.elbowL, s.elbowL, was.handL, s.handL, was.shoulderL, s.shoulderL], ['right', was.elbowR, s.elbowR, was.handR, s.handR, was.shoulderR, s.shoulderR]] as [string, V3, V3, V3, V3, V3, V3][]) {
        let d = len(sub(e1, e0)) - Math.max(len(sub(h1, h0)), len(sub(s1, s0)));
        if (d > 1.5) {
          // (is it a JUMP, all at once, or only quick? Looked at eight times as finely: a jump is all in one of the eight)
          let most = 0;
          let prev = e0;
          for (let j = 1; j <= 8; j++) {
            const sj = solve(B, bonesAt(move.motion.keys, move.rest, t - (end / n) * (1 - j / 8)));
            const ej = name === 'left' ? sj.elbowL : sj.elbowR;
            most = Math.max(most, len(sub(ej, prev)));
            prev = ej;
          }
          if (most < 0.5 * len(sub(e1, e0))) d = 0;
        }
        if (d > jump) {
          jump = d;
          jumpAt = t;
          jumpArm = name;
        }
      }
    }
    was = s;
    // the left hand on the weapon: where it is meant to be, and where the arm got it to
    if (q.lhIn === 3 && q.lh2 === undefined) {
      const want = add(s.handR, add(mul(s.point, q.lhx), add(mul(s.across, q.lhz), mul(cross(s.across, s.point), q.lhy))));
      const d = len(sub(want, s.handL));
      if (d > short) {
        short = d;
        shortAt = t;
      }
    }
    // how far the right hand is from where the pose put it (a hilt brought forward so that both arms can hold it)
    if (q.rh2 === undefined) {
      const c = s.chest;
      const want: V3 = q.rhIn === 2 ? [q.rhx, q.rhy, q.rhz] : q.rhIn === 1 ? add(s.shoulderR, [q.rhx, q.rhy, q.rhz]) : add(s.shoulderR, add(mul(c[0], q.rhx), add(mul(c[1], q.rhy), mul(c[2], q.rhz))));
      const d = len(sub(want, s.handR));
      if (d > pulled) {
        pulled = d;
        pulledAt = t;
      }
    }
    for (const [k, v] of [['L', s.swungL], ['R', s.swungR]] as ['L' | 'R', number][]) {
      if (v < swung[k][0]) {
        swung[k][0] = v;
        swung[k][2] = t;
      }
      if (v > swung[k][1]) {
        swung[k][1] = v;
        swung[k][3] = t;
      }
    }
    const trunk = trunkOf(B, s);
    const depth = (p: V3, pad: number): number => Math.min(...trunk.map((o) => {
      const d = sub(p, o.c);
      return Math.hypot(dot(d, o.r[0]) / (o.h[0] + pad), dot(d, o.r[1]) / (o.h[1] + pad), dot(d, o.r[2]) / (o.h[2] + pad));
    }));
    for (const [sh, el, hand] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
      for (const [p, r] of [[el, B.armR[1]], [lerp3(el, hand, 0.5), B.armR[1]], [hand, B.armR[2]], [lerp3(sh, el, 0.7), B.armR[0] * 0.6]] as [V3, number][]) {
        const k = depth(p, r * 0.6);
        if (k < 0.97) {
          inside++;
          if (k < deepest) {
            deepest = k;
            insideAt = t;
          }
        }
      }
    }
  }
  // (an arm may graze what is worn on the body, by the skeleton's own rule: it is marked when it is in it by more than three parts in ten)
  const flag = short > 2.2 || deepest < 0.7 || pulled > 3 || jump > 2;
  if (flag) bad++;
  // one line a move: what is wrong first, then how far the body had to move things from where the pose put them
  const fr = (t: number): string => (t * 30).toFixed(1);
  const sw = (k: 'L' | 'R'): string => (swung[k][0] === 0 && swung[k][1] === 0 ? '' : ` ${k} ${swung[k][0] < 0 ? `${swung[k][0].toFixed(0)}@${fr(swung[k][2])}` : ''}${swung[k][0] < 0 && swung[k][1] > 0 ? '..' : ''}${swung[k][1] > 0 ? `+${swung[k][1].toFixed(0)}@${fr(swung[k][3])}` : ''}`);
  console.log(
    `${flag ? '!!' : '  '} ${key.padEnd(9)}` +
      ` short ${short.toFixed(1)}${short > 0.05 ? `@${fr(shortAt)}` : ''}` +
      ` | moved ${pulled.toFixed(1)}${pulled > 0.05 ? `@${fr(pulledAt)}` : ''}` +
      ` | inside ${inside}${inside ? ` (deepest ${deepest.toFixed(2)}@${fr(insideAt)})` : ''}` +
      ` | jump ${jump.toFixed(1)}${jump > 0.8 ? ` ${jumpArm}@${fr(jumpAt)}` : ''}` +
      ` | swung${sw('L') || sw('R') ? `${sw('L')}${sw('R')}` : ' 0'}`,
  );
}
console.log('short: the left hand short of the weapon; moved: the right hand from where the pose put it; inside: samples of an arm in the trunk; jump: an elbow going further than its hand and shoulder in 1/60 s; swung: degrees an elbow was turned to clear the body (L, R; @frame)');
console.log(bad ? `${bad} move(s) to look at` : 'nothing to look at');
