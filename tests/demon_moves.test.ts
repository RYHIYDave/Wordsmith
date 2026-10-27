// THE DEMON MOVING (dev/demon_moves.ts): every frame of each of its moves, as the heroes' moves are checked: the picture's
// own checks (crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off), its body clean and on the floor; and
// slick (his art rulebook's Movement: nothing leaps, stalls or turns straight back at speed, nor jumps from a loop's end round
// to its start), every claw and hoof down on the floor staying where it is (Movement 8, feet grip the floor: its claws too,
// on all fours).

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { project, solve } from '../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../src/art/skeleton';
import { LAST } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { DEMON_B } from '../src/dev/sculpt_demon_rig';
import { DEMON_STANCE, demonMoves, demonPose, drawDemonAt } from '../src/dev/demon_moves';
import { bodyFindings, pictureFindings } from './sculpt_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const FPS = 30;
/** A run is painted in sixty pictures a second, as the heroes' runs are; it is judged so. */
const RUN_FPS = 60;
/** How near the floor a claw or hoof is when it stands on it (above where it is in its stance), and how far it may give in a frame. */
const ON_FLOOR = 0.7;
const GIVE = 0.55;
const JOINTS: (keyof Skeleton)[] = ['pelvis', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'];

for (const m of demonMoves()) {
  const fps = m.carry ? RUN_FPS : FPS;
  const n = Math.round(m.long * fps);
  const times = Array.from({ length: n + (m.loops ? 0 : 1) }, (_, i) => Math.min(m.long, i / fps));

  test(`${m.name}: every frame crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; its body clean, on the floor: from in front and behind`, () => {
    const found: string[] = [];
    for (const view of ['front', 'back'] as const) {
      for (const t of times) {
        const d = drawDemonAt(view, m, t);
        for (const f of pictureFindings(d.px)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
        // (a gallop has its moment in the air, between its legs pushing off and its claws landing: Movement 8 asks only that
        // a claw or hoof down stays where it is)
        for (const f of bodyFindings(LAST.sc as Sculpt, true)) if (!(m.carry && f.startsWith('standing on nothing'))) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${m.name}: slick (nothing of it leaps, stalls, turns straight back at speed${m.loops ? ', nor jumps from its end round to its start' : ', nor starts or stops at its fastest'}${m.strike ? ', but for the strike itself' : ''}); a claw or hoof on the floor stays where it is`, () => {
    const found: string[] = [];
    const sk = times.map((t) => solve(DEMON_B, demonPose(m.motion, t)));
    const stand = solve(DEMON_B, DEMON_STANCE as Posed);
    const pairs: [number, number][] = times.slice(1).map((_, i) => [i, i + 1]);
    if (m.loops) pairs.push([times.length - 1, 0]);
    const round = m.loops;
    for (const j of JOINTS) {
      for (const view of ['front', 'back'] as const) {
        const xy = sk.map((k) => project(k[j] as V3, view));
        if (round) xy.push(xy[0]);
        const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
        const sp = st.map(([x, y]) => Math.hypot(x, y));
        const N = sp.length;
        if (N < 3 || Math.max(...sp) < 2) continue;
        for (let i = 0; i < N; i++) {
          // (THE STRIKE ITSELF, a flash smeared by what it leaves, and the freeze as it lands, are not judged frame by frame:
          // his rulebook's Movement 9, big wind-up, lightning strike; its wind-up and its wind-down are)
          if (m.strike && times[i] >= m.strike[0] - 1e-6 && times[i] <= m.strike[1] + 1e-6) continue;
          const a = sp[(i - 1 + N) % N];
          const b = sp[i];
          const c = sp[(i + 1) % N];
          const edge = !round && (i === 0 || i === N - 1);
          const at = `${times[i].toFixed(2)} s (${view})`;
          if (!edge && b > 4 && b > 2.2 * Math.max(a, c)) found.push(`${j} leaps ${b.toFixed(1)} at ${at}`);
          if (!edge && a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) {
            const sa = st[(i - 1 + N) % N];
            const sc = st[(i + 1) % N];
            if ((sa[0] * sc[0] + sa[1] * sc[1]) / (Math.hypot(...sa) * Math.hypot(...sc) || 1) > 0.5) found.push(`${j} stalls at ${at}`);
          }
          if (i > 0 || round) {
            const sa = st[(i - 1 + N) % N];
            const sb = st[i];
            if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) found.push(`${j} turns straight back at speed at ${at}`);
          }
        }
        if (!round && sp[0] > 3 && sp[0] >= 0.95 * Math.max(...sp.slice(0, 4))) found.push(`${j} starts at its fastest (${view})`);
        if (!round && sp[N - 1] > 3 && sp[N - 1] >= 0.95 * Math.max(...sp.slice(-4))) found.push(`${j} stops dead from its fastest (${view})`);
      }
    }
    for (const [a, b] of pairs) {
      const at = `${times[a].toFixed(2)} to ${times[b].toFixed(2)} s`;
      const carry = m.carry ?? 0;
      const ta = times[a];
      const tb = b > a ? times[b] : m.long;
      for (const pt of ['toeL', 'toeR', 'handL', 'handR'] as const) {
        const p: V3 = [sk[a][pt][0] + carry * ta, sk[a][pt][1], sk[a][pt][2]];
        const q: V3 = [sk[b][pt][0] + carry * tb, sk[b][pt][1], sk[b][pt][2]];
        const floor = (stand[pt] as V3)[2] + ON_FLOOR;
        if (p[2] < floor && q[2] < floor) {
          const slide = Math.hypot(p[0] - q[0], p[1] - q[1]);
          if (slide > GIVE) found.push(`${at}: ${pt} slides ${slide.toFixed(2)} along the floor`);
        }
      }
    }
    assert.deepEqual(found, []);
  });
}
