// THE HEROES' MOVES ON THE BONES, ONE BY ONE, AGAINST THE ART RULEBOOK (see lib.ts). Nothing of the
// game here: each move as it is made (src/art/moves3.ts), sampled as the game plays it (the frames a
// second it is shown at), seen from in front and from behind, in game pixels.
//   node node_modules/tsx/dist/cli.mjs tools/review_heroes/bones.ts [move ...] [--speeds]
// For each move:
//   HEAD   (Heroes 6, "Clean bodies"): the deepest any arm goes into the head (1: the skins touch; below 1, in it).
//   FEET   (Movement 8, "A foot stays where it lands"): how far a foot on the floor moves over it while
//          it stays down, the game's own carrying of the hero NOT counted (play.ts counts that).
//   JERK   (Movement 5, "nothing jerky"; Movement 1, "slow to start and slow to stop"): a frame that
//          leaps (a spike), a motion that stalls and goes on (a hitch), a motion that turns straight
//          back at speed (a snap), a motion that starts at its fastest (no ease in), and for a loop
//          the step from its last frame back to its first.
//   BLOW   (Movement 3, "Every attack winds up before it lands and follows through after"): how far
//          the far end of the weapon goes back before the blow, and on after it, and the hold.
//   HIPS   (Movement 1, "A blow ... turns the hips"; moves3.ts, "hips first, then the trunk, then the
//          arms, then the blade, each part later and faster than the one before"): the frames at
//          which the hips, the chest and the weapon turn fastest, and how fast.
//   SINK   (Movement 1, "A landing sinks"): how far the hips go down below standing after a landing.
//   ALIVE  (Movement 6, "breathes, shifts its weight"): in a standing loop, how far the chest rises and the hips sway.
import { MOVES3 } from '../../src/art/moves3';
import type { Move3 } from '../../src/art/moves3';
import { lerp3, sub } from '../../src/art/skeleton';
import type { V3 } from '../../src/art/skeleton';
import { FR, ORDER, USES, VIEWS, at, checkOrder, endOf, pointsOf, seen, tipOf } from './lib';
import type { View } from './lib';

checkOrder();
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const SPEEDS = process.argv.includes('--speeds');
const keys = args.length ? args : ORDER;
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const f1 = (v: number): string => v.toFixed(1);
const fr = (t: number): string => (t * 30).toFixed(1);
/** Where the ball of the foot is, from the heel to the toe. */
const BALL = 0.72;

/** The moments a move is shown at in the game: its frames at the game's own frames a second, from start to end (a loop: from where it goes round). */
function moments(key: string, m: Move3): number[] {
  const use = USES[key];
  const end = endOf(m);
  const t0 = use.how === 'loop' || use.how === 'held' ? (m.motion.loop ?? 0) : 0;
  const out: number[] = [];
  if (use.how === 'loop' || (use.how === 'held' && m.motion.loop !== undefined)) {
    // (a held move: what comes before its loop once, then the loop; here, the loop alone, which is what is seen for longest)
    const n = Math.max(1, Math.round((end - t0) * use.fps));
    for (let i = 0; i < n; i++) out.push(t0 + i / use.fps);
  } else {
    const n = Math.max(1, Math.ceil((end - 0) * use.fps - 1e-6) + 1);
    for (let i = 0; i < n; i++) out.push(Math.min(end, i / use.fps));
  }
  return out;
}

/** HEAD: the deepest any arm goes into the head over the move, at sixty a second. */
function head(m: Move3): { worst: number; at: number; from: number; to: number } {
  const B = m.build;
  const end = endOf(m);
  let worst = 9;
  let when = 0;
  let from = -1;
  let to = -1;
  const n = Math.max(1, Math.round(end * 60));
  for (let i = 0; i <= n; i++) {
    const t = (end * i) / n;
    const { s } = at(m, t);
    const R = B.headR;
    let here = 9;
    for (const [sh, el, ha] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
      for (let j = 0; j <= 10; j++) {
        const up = j <= 5;
        const p = up ? lerp3(sh, el, j / 5) : lerp3(el, ha, (j - 5) / 5);
        const r = up ? B.armR[0] + (B.armR[1] - B.armR[0]) * (j / 5) : B.armR[1] + (B.armR[2] - B.armR[1]) * ((j - 5) / 5);
        const d = sub(p, s.head);
        here = Math.min(here, Math.hypot(dot(d, s.face[0]) / (R[0] + r), dot(d, s.face[1]) / (R[1] + r), dot(d, s.face[2]) / (R[2] + r)));
      }
    }
    if (here < 1) {
      if (from < 0) from = t;
      to = t;
    }
    if (here < worst) {
      worst = here;
      when = t;
    }
  }
  return { worst, at: when, from, to };
}

/**
 * FEET: where each foot holds the floor, from when it comes down until it lifts, how far that moves
 * in the picture (game px), in each view. A foot holds the floor by its ball while the ball is down
 * (it may roll up onto it, or turn on it: the ball stays), and by its heel while only the heel is.
 */
function feet(m: Move3, ts: number[], loop: boolean): { most: number; where: string } {
  let most = 0;
  let where = '';
  for (const view of VIEWS) {
    for (const side of ['L', 'R'] as const) {
      let start: [number, number] | null = null;
      let by: 'ball' | 'heel' | null = null;
      let from = 0;
      // (a loop is gone round twice, so that a foot that is down where it closes is followed across it)
      const list = loop ? [...ts, ...ts] : ts;
      list.forEach((t, i) => {
        const { s } = at(m, t);
        const heel = side === 'L' ? s.heelL : s.heelR;
        const toe = side === 'L' ? s.toeL : s.toeR;
        const ball = lerp3(heel, toe, BALL);
        const holds: 'ball' | 'heel' | null = ball[2] < 0.6 ? 'ball' : heel[2] < 0.5 ? 'heel' : null;
        if (!holds) {
          start = null;
          by = null;
          return;
        }
        const [x, y] = seen(holds === 'ball' ? ball : heel, view);
        if (!start || holds !== by) {
          start = [x, y];
          by = holds;
          from = t;
          return;
        }
        const d = Math.hypot(x - start[0], y - start[1]);
        if (d > most) {
          most = d;
          where = `${view}, the ${side === 'L' ? 'left' : 'right'} foot's ${holds}, down from frame ${fr(from)}, by frame ${fr(t)}${loop && i >= ts.length ? ' (round the loop)' : ''}`;
        }
      });
    }
  }
  return { most, where };
}

/** The way a point goes from one shown moment to the next, in game pixels, as seen in a view. */
function steps(m: Move3, ts: number[], name: string, view: View, loop: boolean): [number, number][] {
  const pts = ts.map((t) => seen(pointsOf(m, at(m, t).s)[name], view));
  const out: [number, number][] = [];
  for (let i = 1; i < pts.length; i++) out.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
  if (loop && pts.length > 1) out.push([pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]]);
  return out;
}

/** JERK: what leaps, stalls, snaps back or starts at its fastest, for the points that carry a move. */
function jerk(m: Move3, ts: number[], loop: boolean): string[] {
  const found: string[] = [];
  for (const name of ['tip', 'handR', 'handL', 'head', 'pelvis']) {
    for (const view of VIEWS) {
      const st = steps(m, ts, name, view, loop);
      const sp = st.map(([x, y]) => Math.hypot(x, y));
      const n = sp.length;
      const most = Math.max(0, ...sp);
      if (most < 2) continue;
      for (let i = 0; i < n; i++) {
        const a = sp[(i - 1 + n) % n];
        const b = sp[i];
        const c = sp[(i + 1) % n];
        const edge = !loop && (i === 0 || i === n - 1);
        const at = loop && i === n - 1 ? 'the loop closing' : `frames ${i}>${i + 1}`;
        // a spike: one step far bigger than both its neighbours
        if (!edge && b > 4 && b > 2.2 * Math.max(a, c)) found.push(`${name} (${view}) leaps ${f1(b)} px at ${at} (neighbours ${f1(a)}, ${f1(c)})`);
        // a hitch: a motion that stalls between two big steps going the same way
        if (!edge && a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) {
          const sa = st[(i - 1 + n) % n];
          const sc = st[(i + 1) % n];
          const same = (sa[0] * sc[0] + sa[1] * sc[1]) / (Math.hypot(...sa) * Math.hypot(...sc) || 1);
          if (same > 0.5) found.push(`${name} (${view}) stalls at ${at}: ${f1(a)}, ${f1(b)}, ${f1(c)} px`);
        }
        // a snap: straight back at speed
        if (i > 0 || loop) {
          const sa = st[(i - 1 + n) % n];
          const sb = st[i];
          const cos = (sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1);
          if (cos < -0.5 && a > 3 && b > 3) found.push(`${name} (${view}) turns straight back at speed at ${at}: ${f1(a)} then ${f1(b)} px`);
        }
      }
      // no ease in: the first step of a motion from stillness is its fastest
      if (!loop && n > 2 && sp[0] > 3 && sp[0] >= 0.95 * Math.max(...sp.slice(0, 4))) found.push(`${name} (${view}) starts at its fastest: ${sp.slice(0, 4).map(f1).join(', ')} px`);
      // no ease out: it stops dead from speed
      if (!loop && n > 2 && sp[n - 1] > 3 && sp[n - 1] >= 0.95 * Math.max(...sp.slice(-4))) found.push(`${name} (${view}) stops dead from its fastest: ${sp.slice(-4).map(f1).join(', ')} px`);
    }
  }
  // the same fault in both views is one fault: keep the first named
  const seenKey = new Set<string>();
  return found.filter((s) => {
    const k = s.replace(/\((front|back)\) /, '').replace(/[\d.]+ px.*$/, '').replace(/: .*$/, '');
    if (seenKey.has(k)) return false;
    seenKey.add(k);
    return true;
  });
}

/** BLOW: the far end of the weapon, back before the blow and on after it. */
function blow(m: Move3): string {
  const hit = m.motion.hit;
  if (hit === undefined) return '';
  const end = endOf(m);
  const tip = (t: number): V3 => tipOf(m, at(m, t).s);
  const h0 = tip(Math.max(0, hit - FR / 2));
  const h1 = tip(Math.min(end, hit + FR / 2));
  const v = sub(h1, h0);
  const vl = len3(v) || 1;
  const u: V3 = [v[0] / vl, v[1] / vl, v[2] / vl];
  const atHit = tip(hit);
  let back = 0;
  for (let t = 0; t <= hit + 1e-6; t += FR / 2) back = Math.max(back, -dot(sub(tip(t), atHit), u) - 0);
  let on = 0;
  for (let t = hit; t <= end + 1e-6; t += FR / 2) on = Math.max(on, dot(sub(tip(t), atHit), u));
  // the hold: frames after the blow in which the far end hardly moves
  let hold = 0;
  let run = 0;
  for (let t = hit; t < end - 1e-6; t += FR) {
    const d = len3(sub(tip(t + FR), tip(t))) / 2;
    if (d < 1) {
      run++;
      hold = Math.max(hold, run);
    } else run = 0;
  }
  // (figure units are picture pixels: half a game pixel)
  return `blow at frame ${fr(hit)} of ${fr(end)}: the weapon goes back ${f1(back / 2)} px before it and on ${f1(on / 2)} px after; held still ${hold} frame${hold === 1 ? '' : 's'} after it; at the blow it moves ${f1(vl / 2)} px a frame`;
}

/**
 * HIPS: over the blow itself (from the top of the wind-up, where the weapon is furthest back, to just
 * after the blow), the frames at which the hips, the chest and the weapon turn fastest (degrees a frame).
 */
function hips(m: Move3): string {
  const hit = m.motion.hit;
  if (hit === undefined) return '';
  const end = endOf(m);
  const tip = (t: number): V3 => tipOf(m, at(m, t).s);
  const v = sub(tip(Math.min(end, hit + FR / 2)), tip(Math.max(0, hit - FR / 2)));
  const vl = len3(v) || 1;
  const u: V3 = [v[0] / vl, v[1] / vl, v[2] / vl];
  const atHit = tip(hit);
  let top = 0;
  let back = -Infinity;
  for (let f = 0; f * FR <= hit + 1e-6; f++) {
    const b = -dot(sub(tip(f * FR), atHit), u);
    if (b > back + 1e-6) {
      back = b;
      top = f;
    }
  }
  const rows: { f: number; hips: number; chest: number; blade: number }[] = [];
  let pq = at(m, top * FR);
  for (let f = top + 1; f * FR <= Math.min(end, hit + 2 * FR) + 1e-6; f++) {
    const c = at(m, f * FR);
    const a = pq.s.point;
    const b = c.s.point;
    const cos = Math.max(-1, Math.min(1, dot(a, b) / ((len3(a) * len3(b)) || 1)));
    rows.push({ f, hips: Math.abs(c.q.yaw - pq.q.yaw), chest: Math.abs(c.q.yaw + c.q.twist - pq.q.yaw - pq.q.twist), blade: (Math.acos(cos) * 180) / Math.PI });
    pq = c;
  }
  const peak = (k: 'hips' | 'chest' | 'blade'): { f: number; v: number } => rows.reduce((best, r) => (r[k] > best.v ? { f: r.f, v: r[k] } : best), { f: 0, v: 0 });
  const h = peak('hips');
  const c = peak('chest');
  const b = peak('blade');
  const order = h.v < 1 ? 'the hips do not turn' : h.f <= c.f && c.f <= b.f ? (h.v <= c.v + 1 && c.v <= b.v + 1 ? 'in order, each faster' : 'in order, but not each faster') : 'OUT OF ORDER';
  const table = rows.map((r) => `${r.f - 1}>${r.f} ${r.hips.toFixed(0)}/${r.chest.toFixed(0)}/${r.blade.toFixed(0)}`).join(', ');
  return `from the top (frame ${top}) to the blow, degrees a frame, hips/chest/weapon: ${table}. Fastest: hips at ${h.f}, chest at ${c.f}, weapon at ${b.f}: ${order}`;
}

/** BOW: the draw (how far apart the hands are, game px) frame by frame, and what the two hands do after the arrow goes. */
function bow(m: Move3): string {
  const hit = m.motion.hit;
  if (hit === undefined) return '';
  const end = endOf(m);
  const apart: string[] = [];
  for (let f = 0; f * FR <= end + 1e-6; f++) {
    const { s } = at(m, f * FR);
    apart.push(`${f === Math.round(hit / FR) ? '*' : ''}${(len3(sub(s.handR, s.handL)) / 2).toFixed(1)}`);
  }
  return `the hands apart, game px a frame (* the arrow goes): ${apart.join(' ')}`;
}

/** SINK and ALIVE. */
function body(key: string, m: Move3, ts: number[]): string[] {
  const out: string[] = [];
  const stand = at(m, 0).s.pelvis[2];
  if (m.arc) {
    let low = Infinity;
    for (let t = m.arc.until; t <= endOf(m) + 1e-6; t += FR / 2) low = Math.min(low, at(m, t).s.pelvis[2]);
    const rest = at(m, endOf(m)).s.pelvis[2];
    out.push(`SINK  after the landing the hips go ${f1((rest - low) / 2)} px below where they end`);
  }
  if (USES[key].how === 'loop' && !/run/.test(key)) {
    const z = ts.map((t) => at(m, t).s.ribs[2]);
    const sway = VIEWS.map((v) => ts.map((t) => seen(at(m, t).s.pelvis, v)[0]));
    const swing = Math.max(...sway.map((xs) => Math.max(...xs) - Math.min(...xs)));
    out.push(`ALIVE a loop of ${f1(ts.length / USES[key].fps)} s: the chest rises ${f1((Math.max(...z) - Math.min(...z)) / 2)} px, the hips sway ${f1(swing)} px`);
  }
  void stand;
  return out;
}

for (const key of keys) {
  const m = MOVES3[key];
  const use = USES[key];
  const end = endOf(m);
  const ts = moments(key, m);
  const loop = use.how === 'loop' || use.how === 'held';
  console.log(`\n== ${key}: ${use.role}. ${use.how} at ${use.fps} a second; ${f1(end * 30)} frames${m.motion.hit !== undefined ? `, the blow at ${fr(m.motion.hit)}` : ''}${m.motion.loop !== undefined ? `, goes round from ${fr(m.motion.loop)}` : ''}${m.arc ? `, in the air until ${fr(m.arc.until)}` : ''}`);
  const hd = head(m);
  console.log(`HEAD  ${hd.worst < 1 ? `ARM IN THE HEAD: deepest ${hd.worst.toFixed(2)} at frame ${fr(hd.at)} (frames ${fr(hd.from)} to ${fr(hd.to)})` : `clear (nearest ${hd.worst.toFixed(2)} at frame ${fr(hd.at)})`}`);
  if (!/run/.test(key)) {
    const ft = feet(m, ts.length > 1 ? ts : [0], loop && use.how === 'loop');
    console.log(`FEET  ${ft.most < 1 ? `still (the most a foot on the floor moves: ${f1(ft.most)} px)` : `A FOOT ON THE FLOOR MOVES ${f1(ft.most)} px: ${ft.where}`}`);
  }
  const jk = jerk(m, ts, loop && (use.how === 'loop' || m.motion.loop !== undefined));
  console.log(`JERK  ${jk.length ? jk.join('\n      ') : 'none found'}`);
  const bl = m.held === 'bow' ? bow(m) : blow(m);
  if (bl) console.log(`${m.held === 'bow' ? 'DRAW' : 'BLOW'}  ${bl}`);
  const hp = m.held === 'bow' ? '' : hips(m);
  if (hp) console.log(`HIPS  ${hp}`);
  for (const line of body(key, m, ts)) console.log(line);
  if (SPEEDS) {
    for (const name of ['tip', 'handR', 'head', 'pelvis']) {
      console.log(`      ${name.padEnd(6)} front ${steps(m, ts, name, 'front', loop && use.how === 'loop').map(([x, y]) => Math.hypot(x, y).toFixed(1)).join(' ')}`);
    }
  }
}
