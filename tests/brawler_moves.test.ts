// THE BRAWLER MOVING: EVERY CHECK A HERO'S MOVES GO THROUGH, IN EVERY FRAME (dev/brawler_moves.ts; a mock-up, nothing of the
// game imports it). His word, 24 Oct 2026, by 12:43 Pacific: “Animate the brawler (Recommended)”; his art rulebook's checks,
// as the heroes had them on 8 Oct and every boss since (How art is made and approved 7), in every frame, from in front and
// from behind:
//   Pixels 1, 5; Colour 3  crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off (tests/sculpt_checks.ts);
//   Heroes 6               clean body: no arm through his trunk, no leg through the other;
//   Movement 8             feet on the floor, none in it; A FOOT STAYS WHERE IT LANDS: a foot on the floor in two frames
//                          running has not slid along it;
//   Movement 5             slick, judged as every boss is (art/boss_checks.ts JERK): no joint, as the eye sees it, leaps
//                          from one frame to the next, stalls and goes on, turns straight back at speed, or starts or
//                          stops at its fastest; a move that goes round comes back to where it began as smoothly.
//   run: tsx --test tests/brawler_moves.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { project, solve } from '../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../src/art/skeleton';
import { LAST } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { BRAWLER_B, GUARD, brawlerMoves, brawlerPose, drawBrawlerAt } from '../src/dev/brawler_moves';
import { bodyFindings, pictureFindings } from './sculpt_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const FPS = 30;
/** How near the floor a toe is when it stands on it (above where it is in his guard), and how far it may give along the floor in a frame. */
const ON_FLOOR = 0.7;
const GIVE = 0.55;

const JOINTS: (keyof Skeleton)[] = ['pelvis', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'];
const far = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

for (const m of brawlerMoves()) {
  const n = Math.round(m.long * FPS);
  const times = Array.from({ length: n + (m.loops ? 0 : 1) }, (_, i) => Math.min(m.long, i / FPS));

  test(`${m.name}: every frame crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; his body clean, his feet on the floor: from in front and behind`, () => {
    const found: string[] = [];
    for (const view of ['front', 'back'] as const) {
      for (const t of times) {
        const d = drawBrawlerAt(view, m, t);
        for (const f of pictureFindings(d.px)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
        for (const f of bodyFindings(LAST.sc as Sculpt, true)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${m.name}: slick (nothing of him leaps, stalls, turns straight back at speed${m.loops ? ', nor jumps from its end round to its start' : ', nor starts or stops at its fastest'}); a foot on the floor stays where it is`, () => {
    const found: string[] = [];
    const sk = times.map((t) => solve(BRAWLER_B, brawlerPose(m.motion, t)));
    const stand = solve(BRAWLER_B, GUARD as Posed);
    const pairs: [number, number][] = times.slice(1).map((_, i) => [i, i + 1]);
    if (m.loops) pairs.push([times.length - 1, 0]);
    // NOTHING JERKY, judged as every boss is (art/boss_checks.ts JERK): the points that carry a move, as the eye sees them,
    // frame to frame: none leaps (more than twice as far as the frames either side of it), stalls and goes on, turns
    // straight back at speed, or starts or stops at its fastest; a loop's last frame steps to its first as any other
    const round = m.loops;
    for (const j of JOINTS) {
      for (const view of ['front', 'back'] as const) {
        const xy = sk.map((k) => project(k[j] as V3, view));
        if (round) xy.push(xy[0]);
        const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
        const sp = st.map(([x, y]) => Math.hypot(x, y));
        const n = sp.length;
        if (n < 3 || Math.max(...sp) < 2) continue;
        for (let i = 0; i < n; i++) {
          const a = sp[(i - 1 + n) % n];
          const b = sp[i];
          const c = sp[(i + 1) % n];
          const edge = !round && (i === 0 || i === n - 1);
          const at = `${times[i].toFixed(2)} s (${view})`;
          if (!edge && b > 4 && b > 2.2 * Math.max(a, c)) found.push(`${j} leaps ${b.toFixed(1)} at ${at}`);
          if (!edge && a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) {
            const sa = st[(i - 1 + n) % n];
            const sc = st[(i + 1) % n];
            if ((sa[0] * sc[0] + sa[1] * sc[1]) / (Math.hypot(...sa) * Math.hypot(...sc) || 1) > 0.5) found.push(`${j} stalls at ${at}`);
          }
          if (i > 0 || round) {
            const sa = st[(i - 1 + n) % n];
            const sb = st[i];
            if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) found.push(`${j} turns straight back at speed at ${at}`);
          }
        }
        if (!round && sp[0] > 3 && sp[0] >= 0.95 * Math.max(...sp.slice(0, 4))) found.push(`${j} starts at its fastest (${view})`);
        if (!round && sp[n - 1] > 3 && sp[n - 1] >= 0.95 * Math.max(...sp.slice(-4))) found.push(`${j} stops dead from its fastest (${view})`);
      }
    }
    for (const [a, b] of pairs) {
      const at = `${times[a].toFixed(2)} to ${times[b].toFixed(2)} s`;
      // (a move that carries him across the floor slides its planted foot back under him at the speed it carries him, as
      // the heroes' runs do: the game holds that foot still on the floor; that is checked where the game carries him)
      if (m.travel) continue;
      for (const toe of ['toeL', 'toeR'] as const) {
        const p = sk[a][toe];
        const q = sk[b][toe];
        // (on the floor: as low as it is when he stands in his guard, near enough)
        const floor = stand[toe][2] + ON_FLOOR;
        if (p[2] < floor && q[2] < floor) {
          const slide = Math.hypot(p[0] - q[0], p[1] - q[1]);
          if (slide > GIVE) found.push(`${at}: ${toe} slides ${slide.toFixed(2)} along the floor`);
        }
      }
    }
    assert.deepEqual(found, []);
  });
}
