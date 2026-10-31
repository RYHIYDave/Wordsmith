// THE BOSSES' REVIEW FOR THE OLD RIGS (the art chat's helper, 31 Oct 2026; docs/mockups/action_f1/README.md). A MOCK-UP TOOL:
// NOTHING OF THE GAME IMPORTS IT.
//
// The owner's words to the art chat, 9 Oct 2026: at 23:35, "I need all bosses ran through all checks from now on.  These boss
// fights are important"; at 23:44, "Add it to the rulebook.  All checks must be made."; at 23:56, "And every boss gets the same
// treatment as characters". The review (art/boss_checks.ts, checkBoss) reads a figure built on the heroes' bones (a Mob of
// art/new_mobs3.ts: bones in three dimensions). The bone archer (art/monster_bones.ts) and the Warden (art/monster_warden.ts) are
// older: rigs of the painter's kit, drawn on the picture itself in two dimensions, with no bones in space to hand it. So the
// same checks are made here on what those rigs say of every frame they paint (BONES_SEEN, WARDEN_SEEN: where their head, hips,
// hands, elbows and soles are, and the end they strike with), in game pixels, on every frame the game shows of a move (at 30 a
// second; the stand at its own), with the same limits as checkBoss:
//
//   SLIDE    a sole that is down stays where it came down until it lifts (SLIDE_MAX).
//   FLOOR    a sole below the floor (SINK_MAX).
//   JERK     a point that leaps, stalls, turns straight back at speed, starts at its fastest or stops dead from it (the strike's
//            own steps, and the step as it lands, not held to it: his Movement 9).
//   JUMP     from every frame of his stand into the move, and from its end back into his stand: the picture must not leap
//            (JUMP_MAX, the mean of the points followed).
//   BLOW     the end he strikes with drawn back before the blow, held still a while (the warning), and carried on after it.
//   HIPS     the hips get going first, then the chest, then the end he strikes with.
//   STRIKE   the strike one frame or two, its blow inside it, every frame of it smeared, and far faster than anything of its
//            wind-up or wind-down a third of a second either side.
// (ARM and THROUGH, which ask whether a limb or a thing passes through a body in space, have no body in space here to ask: what
// stands for them for these two moves, the arrow past the archer's face and the keys clear of the Warden's head, is asked in
// tests/action_f1.test.ts, with what every frame is painted in: crisp, the enemy's pink rim, no cyan, nothing cut off.)

import type { V } from './kit';
import { JUMP_MAX, SINK_MAX, SLIDE_MAX } from './boss_checks';
import type { Finding } from './boss_checks';

/** A frame of a move as the review sees it: when (seconds), the points followed (game pixels from the floor point, across and down), the soles and whether each is down, the end it strikes with (or null), and whether it is smeared. */
export interface KitFrame {
  t: number;
  pts: Record<string, V>;
  soles: [V, V];
  down: [boolean, boolean];
  tip: V | null;
  smeared: boolean;
}
/** A move: its frames, its blow (seconds), its strike (the last frame of its wind-up to the frame it lands on), and whether it goes round. */
export interface KitMove {
  name: string;
  frames: KitFrame[];
  hit?: number;
  strike?: readonly [number, number];
  round?: boolean;
  /** After the blow, where the end it strikes with goes on to when it has left the figure's own frames (the arrow loosed, flying on): seconds from the blow. */
  after?: (t: number) => V | null;
}

const dist = (a: V, b: V): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** THE REVIEW of a move, and of its handing over to and from his stand. */
export function checkKit(move: KitMove, stand: KitMove): Finding[] {
  const found: Finding[] = [];
  const which = move.name;
  const F = move.frames;
  const ts = F.map((f) => f.t);
  // --- SLIDE ---
  for (const side of [0, 1] as const) {
    let start: V | null = null;
    let from = 0;
    for (const f of F) {
      if (!f.down[side]) {
        start = null;
        continue;
      }
      if (!start) {
        start = f.soles[side];
        from = f.t;
        continue;
      }
      const d = dist(f.soles[side], start);
      if (d > SLIDE_MAX) found.push({ move: which, t: f.t, kind: 'slide', what: `sole ${side ? 'far' : 'near'} (down from ${from.toFixed(2)} s)`, by: d });
    }
  }
  // --- FLOOR ---
  for (const f of F) for (const side of [0, 1] as const) if (f.soles[side][1] > SINK_MAX) found.push({ move: which, t: f.t, kind: 'floor', what: `sole ${side ? 'far' : 'near'}`, by: f.soles[side][1] });
  // --- JERK ---
  const strike = move.strike;
  const struck = (i: number): boolean => !!strike && ts[i] !== undefined && ts[i] >= strike[0] - 1e-6 && ts[i] <= strike[1] + 1e-6;
  const names = ['tip', ...Object.keys(F[0]?.pts ?? {})];
  for (const name of names) {
    const at = (i: number): V | null => (name === 'tip' ? F[i].tip : F[i].pts[name] ?? null);
    // (a point there only part of the time, the end it strikes with: followed while it is there)
    let i0 = 0;
    while (i0 < F.length) {
      while (i0 < F.length && !at(i0)) i0++;
      let i1 = i0;
      while (i1 < F.length && at(i1)) i1++;
      if (i1 - i0 >= 4) jerks(found, which, name, ts.slice(i0, i1), Array.from({ length: i1 - i0 }, (_, k) => at(i0 + k) as V), move.round === true && i0 === 0 && i1 === F.length, (k) => struck(i0 + k), i0 === 0, i1 === F.length);
      i0 = i1 + 1;
    }
  }
  // --- STRIKE ---
  if (strike) {
    const [t0, t1] = strike;
    const steps = Math.round((t1 - t0) * 30);
    if (steps < 1 || steps > 2) found.push({ move: which, t: t0, kind: 'strike', what: `the strike takes ${steps} frames (one or two)`, by: steps });
    if (move.hit !== undefined && (move.hit < t0 - 1e-6 || move.hit > t1 + 1e-6)) found.push({ move: which, t: move.hit, kind: 'strike', what: 'the blow lands outside its strike', by: 1 });
    const a = ts.findIndex((t) => Math.abs(t - t0) < 1e-6);
    const b = ts.findIndex((t) => Math.abs(t - t1) < 1e-6);
    if (a < 0 || b < 0) found.push({ move: which, t: t0, kind: 'strike', what: "its strike is not on the game's frames", by: 1 });
    else if (F[a].tip && F[b].tip) {
      const step = (i: number): number | null => (F[i].tip && F[i + 1]?.tip ? dist(F[i].tip as V, F[i + 1].tip as V) : null);
      let flash = Infinity;
      for (let i = a; i < b; i++) flash = Math.min(flash, step(i) ?? Infinity);
      let slow = 0;
      for (let i = Math.max(0, a - 10); i < Math.min(F.length - 1, b + 11); i++) if (i < a || i > b) slow = Math.max(slow, step(i) ?? 0);
      if (flash < 2 * slow) found.push({ move: which, t: t0, kind: 'strike', what: `not a flash: its slowest step ${flash.toFixed(1)}, its wind-up or wind-down's fastest ${slow.toFixed(1)}`, by: 2 * slow - flash });
    } else found.push({ move: which, t: t0, kind: 'strike', what: 'the end it strikes with is not there through its strike', by: 1 });
    for (const f of F) if (f.t > t0 + 1e-6 && f.t <= t1 + 1e-6 && !f.smeared) found.push({ move: which, t: f.t, kind: 'strike', what: 'not smeared', by: 1 });
  }
  // --- BLOW and HIPS ---
  const hit = move.hit;
  if (hit !== undefined) {
    const ih = ts.findIndex((t) => Math.abs(t - hit) < 1e-6);
    const h0 = ih > 0 ? F[ih - 1].tip : null;
    const h1 = ih >= 0 ? F[ih].tip : null;
    if (!h0 || !h1 || dist(h0, h1) < 1e-6) found.push({ move: which, t: hit, kind: 'blow', what: 'the end it strikes with is not there either side of the blow', by: 1 });
    else {
      const len = dist(h0, h1);
      const way: V = [(h1[0] - h0[0]) / len, (h1[1] - h0[1]) / len];
      const along = (p: V): number => (p[0] - h1[0]) * way[0] + (p[1] - h1[1]) * way[1];
      let back = 0;
      let on = 0;
      let still = 0;
      let stillMost = 0;
      F.forEach((f, i) => {
        const p = f.tip;
        if (p && f.t < hit - 1e-6) back = Math.max(back, -along(p));
        if (p && f.t > hit + 1e-6) on = Math.max(on, along(p));
        if (i > 0 && f.t > 0.15 && f.t < hit - 0.08 && p && F[i - 1].tip) {
          const d = Math.min(dist(p, F[i - 1].tip as V), Math.max(dist(f.pts.head, F[i - 1].pts.head), dist(f.pts.hips, F[i - 1].pts.hips)));
          still = d < 1.5 ? still + 1 : 0;
          stillMost = Math.max(stillMost, still);
        }
      });
      // (what has left the figure's frames, the loosed arrow, goes on as `after` says)
      if (move.after) for (const t of [1 / 30, 2 / 30, 3 / 30]) {
        const p = move.after(t);
        if (p) on = Math.max(on, along(p));
      }
      if (back < 8) found.push({ move: which, t: hit, kind: 'blow', what: 'not drawn back before the blow', by: back });
      if (on < 3) found.push({ move: which, t: hit, kind: 'blow', what: 'no follow-through after the blow', by: on });
      if (stillMost < 2) found.push({ move: which, t: hit, kind: 'blow', what: 'no held warning before the blow', by: stillMost });
      // HIPS: where in the blow each gets going (the first frame it moves at most of its own top speed), from the end of the held warning to just after the blow
      let from = hit - 0.5;
      for (let i = 1; i < F.length; i++) {
        const a = F[i].tip;
        const b = F[i - 1].tip;
        if (ts[i] >= hit - 0.04 || !a || !b) continue;
        if (dist(a, b) < 1.5 && ts[i] > from) from = ts[i];
      }
      const going = (of: (f: KitFrame) => V | null): number => {
        const sp: [number, number][] = [];
        for (let i = 1; i < F.length; i++) {
          if (ts[i] < from || ts[i] > hit + 0.1) continue;
          const a = of(F[i - 1]);
          const b = of(F[i]);
          if (a && b) sp.push([i, dist(a, b)]);
        }
        const top = Math.max(0, ...sp.map(([, v]) => v));
        if (top <= 1) return -1;
        return sp.find(([, v]) => v >= 0.6 * top)?.[0] ?? -1;
      };
      const fh = going((f) => f.pts.hips);
      const fc = going((f) => f.pts.head);
      const ft = going((f) => f.tip);
      if (fh >= 0 && fc >= 0 && ft >= 0 && !(fh <= fc && fc <= ft)) found.push({ move: which, t: hit, kind: 'hips', what: `gets going: hips at ${ts[fh].toFixed(2)} s, chest ${ts[fc].toFixed(2)}, the blow's end ${ts[ft].toFixed(2)}`, by: Math.max(0, ts[fh] - ts[fc], ts[fc] - ts[ft]) * 30 });
    }
  }
  // --- JUMP: from every frame of his stand into the move, and from its end into his stand ---
  const leap = (a: KitFrame, b: KitFrame): number => {
    const keys = Object.keys(a.pts).filter((k) => b.pts[k]);
    let sum = 0;
    for (const k of keys) sum += dist(a.pts[k], b.pts[k]);
    for (const s of [0, 1] as const) sum += dist(a.soles[s], b.soles[s]);
    return sum / (keys.length + 2);
  };
  const first = F[0];
  const last = F[F.length - 1];
  let worst = 0;
  let worstAt = 0;
  for (const s of stand.frames) {
    const d = leap(s, first);
    if (d > worst) {
      worst = d;
      worstAt = s.t;
    }
  }
  if (worst > JUMP_MAX) found.push({ move: `stand > ${which}`, t: worstAt, kind: 'jump', what: `stand at ${worstAt.toFixed(2)} s into ${which}`, by: worst });
  const back = leap(last, stand.frames[0]);
  if (back > JUMP_MAX) found.push({ move: `${which} > stand`, t: last.t, kind: 'jump', what: `${which} at its end into stand`, by: back });
  return found.sort((a, b) => b.by - a.by);
}

/** JERK, as checkBoss has it, on one point's run of frames. */
function jerks(found: Finding[], which: string, name: string, ts: number[], pts: V[], round: boolean, struck: (k: number) => boolean, fromStart: boolean, toEnd: boolean): void {
  const st: V[] = [];
  for (let i = 1; i < pts.length; i++) st.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
  const sp = st.map(([x, y]) => Math.hypot(x, y));
  const n = sp.length;
  if (n < 3 || Math.max(...sp) < 2) return;
  const said = new Set<string>();
  const say = (what: string, i: number, by: number): void => {
    if (said.has(what)) return;
    said.add(what);
    found.push({ move: which, t: ts[Math.min(ts.length - 1, i + 1)], kind: 'jerk', what: `${name} ${what}`, by });
  };
  for (let i = 0; i < n; i++) {
    const a = sp[(i - 1 + n) % n];
    const b = sp[i];
    const c = sp[(i + 1) % n];
    const edge = !round && (i === 0 || i === n - 1);
    const flash = !round && (struck(i) || struck((i - 1 + n) % n) || struck((i + 1) % n));
    if (!edge && !struck(i) && b > 4 && b > 2.2 * Math.max(round || !struck((i - 1 + n) % n) ? a : 0, round || !struck((i + 1) % n) ? c : 0)) say('leaps', i, b);
    if (!edge && !flash && a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) {
      const sa = st[(i - 1 + n) % n];
      const sc = st[(i + 1) % n];
      if ((sa[0] * sc[0] + sa[1] * sc[1]) / (Math.hypot(...sa) * Math.hypot(...sc) || 1) > 0.5) say('stalls', i, Math.min(a, c) - b);
    }
    if ((i > 0 || round) && !(struck(i) || struck((i - 1 + n) % n))) {
      const sa = st[(i - 1 + n) % n];
      const sb = st[i];
      if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) say('turns straight back at speed', i, Math.min(a, b));
    }
  }
  const plain = sp.map((v, i) => (struck(i) ? 0 : v));
  // (a run that begins or ends where the point comes into or out of sight, the keys taken off the belt or hung back on it, begins or ends where it is: not held to starting or stopping)
  if (!round && fromStart && !struck(0) && sp[0] > 3 && sp[0] >= 0.95 * Math.max(...plain.slice(0, 4))) say('starts at its fastest', 0, sp[0]);
  if (!round && toEnd && !struck(n - 1) && sp[n - 1] > 3 && sp[n - 1] >= 0.95 * Math.max(...plain.slice(-4))) say('stops dead from its fastest', n - 1, sp[n - 1]);
}
