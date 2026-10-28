// THE BRAWLER MOVING: EVERY CHECK A HERO'S MOVES GO THROUGH, IN EVERY FRAME (dev/brawler_moves.ts; a mock-up, nothing of the
// game imports it). His word, 24 Oct 2026, by 12:43 Pacific: “Animate the brawler (Recommended)”; his art rulebook's checks,
// as the heroes had them on 8 Oct and every boss since (How art is made and approved 7), in every frame, from in front and
// from behind:
//   Pixels 1, 5; Colour 3  crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off (tests/sculpt_checks.ts);
//   Heroes 6               clean body: no arm through his trunk, no leg through the other;
//   Movement 8             feet on the floor, none in it; A FOOT STAYS WHERE IT LANDS: a foot on the floor in two frames
//                          running has not slid along it (where a move carries him over the floor, as the floor sees it);
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
import { BRAWLER_B, FR, GUARD, brawlerMoves, brawlerPose, drawBrawlerAt } from '../src/dev/brawler_moves';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { drawPunchAt } from '../src/dev/brawler_fx';
import { brawlerFights, strikes, struck } from '../src/dev/brawler_punches';
import { brawlerFall, drawFallAt } from '../src/dev/brawler_fall';
import { brawlerLurch, brawlerReel, drawStruckAt } from '../src/dev/brawler_hits';

/** Every move of his: standing, running, each punch from his guard, each of his eight combos and his swipe, the slip and counter (dev/brawler_punches.ts); and his fall, down on his knees (dev/brawler_fall.ts); and struck, hard and from behind (dev/brawler_hits.ts). */
const ALL = [...brawlerMoves(), ...brawlerFights(), brawlerFall(), brawlerReel(), brawlerLurch()];

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const FPS = 30;
/** A run is painted in sixty pictures a second, as the heroes' runs are (art/moves3.ts GRIP: one for each step the game takes on a phone, so that a foot on the floor stays put between one picture and the next); it is judged so. */
const RUN_FPS = 60;
/** How near the floor a toe is when it stands on it (above where it is in his guard), and how far it may give along the floor in a frame. */
const ON_FLOOR = 0.7;
const GIVE = 0.55;

const JOINTS: (keyof Skeleton)[] = ['pelvis', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'];
const far = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

for (const m of ALL) {
  const fps = m.carry ? RUN_FPS : FPS;
  const n = Math.round(m.long * fps);
  const times = Array.from({ length: n + (m.loops ? 0 : 1) }, (_, i) => Math.min(m.long, i / fps));

  test(`${m.name}: every frame crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; his body clean, his feet on the floor: from in front and behind`, () => {
    const found: string[] = [];
    for (const view of ['front', 'back'] as const) {
      for (const t of times) {
        const d = drawBrawlerAt(view, m, t);
        for (const f of pictureFindings(d.px)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
        // (a run has its moments with both feet off the floor, between one step and the next: Movement 8 asks only that a
        // foot down stays where it is)
        // (and a leap, while he is in the air)
        const up = (m.air ?? []).some(([a, b]) => t >= a && t <= b);
        for (const f of bodyFindings(LAST.sc as Sculpt, true)) if (!((m.carry || up) && f.startsWith('standing on nothing'))) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
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
    // (THE PUNCH ITSELF, from a frame before its strike begins to a frame after it lands, goes in a flash and is smeared:
    // his words, 24 Oct, by 19:05, “Like the wind up and wind down are big but the actual punch is lightning quick”; it
    // is not judged frame by frame, its wind-up and wind-down are)
    // (AND HIS SWIPE'S WEAVE, a flash the game carries him through, smeared with his after-images: his pick, “Weaving dash,
    // same reach (Recommended)”, under the same rule: its slip in and its landing are judged, the weave itself is not)
    // (AND A BLOW THAT LANDS ON HIM, his fall's first: it snaps him round in a flash, as every blow goes; what follows is judged)
    const quiet = [...strikes(m.blows ?? []), ...(m.dash ? [[m.dash[0] - FR, m.dash[1] + FR] as [number, number]] : []), ...(m.jolt ? [m.jolt] : [])];
    for (const j of JOINTS) {
      for (const view of ['front', 'back'] as const) {
        const xy = sk.map((k) => project(k[j] as V3, view));
        if (round) xy.push(xy[0]);
        const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
        const sp = st.map(([x, y]) => Math.hypot(x, y));
        const n = sp.length;
        if (n < 3 || Math.max(...sp) < 2) continue;
        for (let i = 0; i < n; i++) {
          if (struck(times[i], quiet)) continue;
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
      // (a move that carries him across the floor: where his foot is on the FLOOR, he carried forward as the game carries
      // him; a loop's last frame goes on to its first a round later)
      const carry = m.carry ?? 0;
      const ta = times[a];
      const tb = b > a ? times[b] : m.long;
      for (const toe of ['toeL', 'toeR'] as const) {
        const p: V3 = [sk[a][toe][0] + carry * ta, sk[a][toe][1], sk[a][toe][2]];
        const q: V3 = [sk[b][toe][0] + carry * tb, sk[b][toe][1], sk[b][toe][2]];
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

// WHAT BURSTS OFF HIS BLOWS (dev/brawler_fx.ts), every frame of each punch with it, from in front and behind: crisp, no
// pixel alone, nothing of the enemy's pink, nothing cut off (Pixels 1; Colour 3; Animations 8, effects are pixel art too)
for (const m of ALL.filter((mv) => mv.blows)) {
  test(`${m.name}: what bursts off it as it lands, and the streak behind the fist, in every frame: crisp, no pixel alone, nothing pink, nothing cut off`, () => {
    const found: string[] = [];
    const n = Math.round(m.long * FPS);
    for (const view of ['front', 'back'] as const) {
      for (let i = 0; i <= n; i++) {
        const t = Math.min(m.long, i / FPS);
        for (const f of pictureFindings(drawPunchAt(view, m, t).px)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}

// WHAT FLIES OFF HIM AS HE FALLS (dev/brawler_fall.ts drawFallBits): the blow's flash and a little blood, the dust of his
// feet and knees, his haymaker's streak; every frame, from in front and behind: crisp, no pixel alone, nothing pink, nothing
// cut off
test('His fall: what flies off him, in every frame: crisp, no pixel alone, nothing pink, nothing cut off', () => {
  const m = ALL.find((mv) => mv.name.startsWith('His fall'))!;
  const found: string[] = [];
  const n = Math.round(m.long * FPS);
  for (const view of ['front', 'back'] as const) {
    for (let i = 0; i <= n; i++) {
      const t = Math.min(m.long, i / FPS);
      for (const f of pictureFindings(drawFallAt(view, m, t).px)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

// STRUCK, HARD AND FROM BEHIND (dev/brawler_hits.ts): the blow's flash on him and the scuff of dust as the foot that caught
// him is set down, every frame, from in front and behind: crisp, no pixel alone, nothing pink, nothing cut off
for (const m of [brawlerReel(), brawlerLurch()]) {
  test(`${m.name}: the blow's flash and the scuff of his foot, in every frame: crisp, no pixel alone, nothing pink, nothing cut off`, () => {
    const found: string[] = [];
    const n = Math.round(m.long * FPS);
    for (const view of ['front', 'back'] as const) {
      for (const turn of [0, 90]) {
        for (let i = 0; i <= n; i++) {
          const t = Math.min(m.long, i / FPS);
          const d = drawStruckAt(view, m, t, turn);
          for (const f of pictureFindings(d.px)) found.push(`${view} ${turn}, ${t.toFixed(2)} s: ${f}`);
        }
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}
