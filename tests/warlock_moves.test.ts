// THE WARLOCK MOVING: EVERY CHECK A HERO'S MOVES GO THROUGH, IN EVERY FRAME (dev/warlock_moves.ts; a mock-up, nothing of the
// game imports it). His words, 25 Oct 2026 (Pacific): asked what next, by 07:40, “Animate the warlock”; at 07:53, “Remember
// the rules for animations”. His art rulebook's checks, as the heroes had them on 8 Oct and every boss since (How art is
// made and approved 7), in every frame, from in front and from behind:
//   Pixels 1, 5; Colour 3  crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off (tests/sculpt_checks.ts);
//   Heroes 6               clean body: no arm through his trunk, no leg through the other;
//   Movement 8             feet on the floor, none in it; A FOOT STAYS WHERE IT LANDS: a foot on the floor in two frames
//                          running has not slid along it (where a move carries him over the floor, as the floor sees it);
//   Movement 5             slick, judged as every boss is (art/boss_checks.ts JERK): no joint, as the eye sees it, leaps
//                          from one frame to the next, stalls and goes on, turns straight back at speed, or starts or
//                          stops at its fastest; a move that goes round comes back to where it began as smoothly.
//   run: tsx --test tests/warlock_moves.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { lerp3, project, solve } from '../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../src/art/skeleton';
import { LAST, primDist } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { FR, STANCE, WARLOCK_B, drawWarlockAt, warlockMoves, warlockPose } from '../src/dev/warlock_moves';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { strikes, struck } from '../src/dev/brawler_punches';
import { warlockSpells } from '../src/dev/warlock_spells';
import { boltLight } from '../src/dev/warlock_fx';

/** Every move of his: standing, running, his hellfire bolt (and, as they come, his Curse, his smoke step). */
const ALL = [...warlockMoves(), ...warlockSpells()];

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
        const d = drawWarlockAt(view, m, t);
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
    const sk = times.map((t) => solve(WARLOCK_B, warlockPose(m.motion, t)));
    const stand = solve(WARLOCK_B, STANCE as Posed);
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
    const quiet = [...strikes(m.blows ?? []), ...(m.dash ? [[m.dash[0] - FR, m.dash[1] + FR] as [number, number]] : [])];
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

// HIS COAT CLEAR OF HIS LEGS (Heroes 6, clean bodies: nothing passes through what he wears; his word of the second run,
// 25 Oct: “the bottom of the robe is bad, it’s clipping which is a rule that you should be following”): in every frame, from
// in front and behind, no leg (its rod, as thick as its trousers) passes through a panel of his coat
for (const m of ALL) {
  test(`${m.name}: his coat's skirts clear of his legs in every frame`, () => {
    const found: string[] = [];
    const n = Math.round(m.long * (m.carry ? 60 : 30));
    for (const view of ['front', 'back'] as const) {
      for (let i = 0; i < n; i++) {
        const t = i / (m.carry ? 60 : 30);
        drawWarlockAt(view, m, t);
        const sc = LAST.sc as Sculpt;
        const s = solve(WARLOCK_B, warlockPose(m.motion, t));
        const R = WARLOCK_B.legR;
        for (const p of sc.prims) {
          if (p.tag !== 'panel') continue;
          for (const [hip, knee, ankle, side] of [[s.hipL, s.kneeL, s.ankleL, 'left'], [s.hipR, s.kneeR, s.ankleR, 'right']] as const) {
            for (let k = 0; k <= 10; k++) {
              const u = 0.25 + (k / 10) * 0.75;
              const P = u < 0.5 ? lerp3(hip, knee, u * 2) : lerp3(knee, ankle, (u - 0.5) * 2);
              const r = u < 0.5 ? R[0] + (R[1] - R[0]) * u * 2 : R[1] + (R[2] - R[1]) * (u - 0.5) * 2;
              if (primDist(p, P) < r + 0.5) {
                found.push(`${view}, ${t.toFixed(2)} s: his ${side} leg through his coat`);
                break;
              }
            }
          }
        }
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}

// HIS HELLFIRE'S LIGHT (dev/warlock_fx.ts): the burst off his claws, the bolt in flight, its burst where it hits and the burn
// on the one it hit, every frame of the move and a second and a half of the burn after it, from in front and behind: crisp,
// no pixel alone, nothing of the enemy's pink, nothing cut off (Pixels 1; Colour 3; Animations 8, effects are pixel art too)
for (const m of ALL.filter((mv) => mv.name.includes('bolt'))) {
  test(`${m.name}: its light in every frame, in flight and burning: crisp, no pixel alone, nothing pink, nothing cut off`, () => {
    const found: string[] = [];
    const n = Math.round((m.long + 1.5) * FPS);
    for (const view of ['front', 'back'] as const) {
      for (let i = 0; i <= n; i++) {
        const t = i / FPS;
        for (const f of pictureFindings(boltLight(m, t, view))) if (f !== 'nothing painted') found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}
