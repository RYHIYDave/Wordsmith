// THE TINKERER MOVING (dev/tinkerer_moves.ts): every frame of each of her moves, as the other heroes' are checked: the
// picture's own checks (crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off), her body clean and on the
// floor; and slick (his art rulebook's Movement: nothing leaps, stalls or turns straight back at speed, nor jumps from a
// loop's end round to its start), a foot down on the floor staying where it is (Movement 8, feet grip the floor).

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { project, solve } from '../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../src/art/skeleton';
import { LAST, primDist } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { TINK_B, TSTANCE, drawTinkerAt, tinkerMoves, tinkerPose } from '../src/dev/tinkerer_moves';
import { bodyFindings, pictureFindings } from './sculpt_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const FPS = 30;
const RUN_FPS = 60;
const ON_FLOOR = 0.7;
const GIVE = 0.55;
const JOINTS: (keyof Skeleton)[] = ['pelvis', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'];

/** Where her wrench goes through her: each point along its shaft and its head, against everything of her but the fist that holds it. */
function wrenchThrough(sc: Sculpt): string[] {
  const prims = sc.prims.filter((p) => !p.carve);
  const wrench = prims.filter((p) => p.piece === 'wrench');
  const her = prims.filter((p) => ['head', 'torso', 'hips', 'pony', 'armL', 'legL', 'legR'].includes(p.piece) || (p.piece === 'armR' && !['fist', 'thumb', 'cuff'].includes(p.tag ?? '')));
  const out: string[] = [];
  for (const w of wrench) {
    const pts: V3[] = w.k === 'cone' ? [0, 0.2, 0.4, 0.6, 0.8, 1].map((k) => [w.a[0] + (w.b[0] - w.a[0]) * k, w.a[1] + (w.b[1] - w.a[1]) * k, w.a[2] + (w.b[2] - w.a[2]) * k] as V3) : w.k === 'box' ? [w.c] : [];
    for (const q of pts) for (const b of her) if (primDist(b, q) - (w.k === 'cone' ? 0.6 : 0.5) < -0.4) out.push(`the wrench's ${w.tag} through her ${b.piece} (${b.tag ?? b.k})`);
  }
  return [...new Set(out)];
}

for (const m of tinkerMoves()) {
  const fps = m.carry ? RUN_FPS : FPS;
  const n = Math.round(m.long * fps);
  const times = Array.from({ length: n + (m.loops ? 0 : 1) }, (_, i) => Math.min(m.long, i / fps));

  test(`${m.name}: every frame crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; her body clean, her feet on the floor, her wrench clear of her: from in front and behind`, () => {
    const found: string[] = [];
    for (const view of ['front', 'back'] as const) {
      for (const t of times) {
        const d = drawTinkerAt(view, m, t);
        for (const f of pictureFindings(d.px)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
        // (a run has its moments with both feet off the floor, and a hop its: Movement 8 asks only that a foot down stays where it is)
        const up = !!m.carry || (m.air ?? []).some(([a, b]) => t >= a - 1e-6 && t <= b + 1e-6);
        for (const f of bodyFindings(LAST.sc as Sculpt, true)) if (!(up && f.startsWith('standing on nothing'))) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
        // HER WRENCH CLEAR OF HER (his word, 27 Oct, “the wrench is clipping”): no point along it inside her head, her
        // hair, her body or her arms (but the fist that holds it)
        for (const f of wrenchThrough(LAST.sc as Sculpt)) found.push(`${view}, ${t.toFixed(2)} s: ${f}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${m.name}: slick (nothing of her leaps, stalls, turns straight back at speed${m.loops ? ', nor jumps from its end round to its start' : ', nor starts or stops at its fastest'}); a foot on the floor stays where it is`, () => {
    const found: string[] = [];
    const sk = times.map((t) => solve(TINK_B, tinkerPose(m.motion, t)));
    const stand = solve(TINK_B, TSTANCE as Posed);
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
      // (her toes, against where they are on the floor as she stands; and her ankles, against the floor's own height, as a
      // foot set down flat has its toe a little higher than her pointed toes do as she stands: either way down, it may not slide)
      for (const toe of ['toeL', 'toeR', 'ankleL', 'ankleR'] as const) {
        const p: V3 = [sk[a][toe][0] + carry * ta, sk[a][toe][1], sk[a][toe][2]];
        const q: V3 = [sk[b][toe][0] + carry * tb, sk[b][toe][1], sk[b][toe][2]];
        const floor = (toe.startsWith('toe') ? stand[toe][2] : TINK_B.ankle) + ON_FLOOR;
        if (p[2] < floor && q[2] < floor) {
          const slide = Math.hypot(p[0] - q[0], p[1] - q[1]);
          if (slide > GIVE) found.push(`${at}: ${toe} slides ${slide.toFixed(2)} along the floor`);
        }
      }
    }
    assert.deepEqual(found, []);
  });
}
