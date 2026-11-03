// ACT 2, THE HUSH: FLOOR 11'S BOSS, THE CRIER: what he does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where his rules (game/act1_rules/crier.ts) have it. The pictures are the art chat's own (art/crier_shots.ts, with his yes
// to the films they are in), drawn in the game's own pixels as they come; only what his own picture does not paint (art/
// crier.ts paints the burst of the Hush off his bell as it slams, the dead air boiling out of it as he shouts, the rings of
// his call going up out of it, and the Hush pouring out of him as he dies):
//   ON THE FLOOR, as he makes a move: the Silent Shout's cone marked as he draws breath, the dust drawn in toward him
//     (drawShoutWarn); the Proclamation's lane marked as he holds the scroll high (drawProclaimWarn); a ring closing in
//     on him as he draws breath for the Crowd (drawCrowdBreath). Each from where his film has it begin, to its blow.
//   ON THE FLOOR, what his moves leave: the flags cracked where his bell slams down (drawBellSlam); the dead air rolling
//     out over the Shout's cone, the floor dark under it (drawShoutBlast); the scroll flung down, unrolling down its lane,
//     lying, and crumbling into the Hush (drawProclamation); his call's rings rolling out from him (drawCrowdCall); and
//     where the Hushed come out, a pool of the Hush welling up first (drawHushedRising).
// Every colour is the enemy's pink and gold, and the Hush's grey: never a friend's cyan (the art chat's, held by
// tests/crier.test.ts).

import { drawBellSlam, drawCrowdBreath, drawCrowdCall, drawHushedRising, drawProclaimWarn, drawProclamation, drawShoutBlast, drawShoutWarn } from '../../art/crier_shots';
import { CRIER, CRIER_ACTS, proclaimWay, shoutWay } from '../../game/act1_rules/crier';
import type { Monster } from '../../game/state';
import type { Act1Fx, Act1FxCtx } from './types';
import { CRIER_ACTION, CROWD_HIT, PROCLAIM_HIT, SHOUT_HIT, SHOUT_HOLD, TOLL } from '../../art/crier_action';
import { CALL, DECREE, WALLS, echoTimes, frontsAt, paintCall, paintDecree, paintToll } from '../../art/crier_action_fx';
import { drawSprite } from '../../engine/px';
import type { Px } from '../../engine/px';
import { CALL9_PERIL, DECREE_PERIL, SHOUT9_PERIL, TOLL_PERIL, poolsOf } from '../../game/act1_rules/crier';
import { beside } from '../../game/facing';
import type { Peril } from '../../game/state';
import { livePicture } from './live';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const hitOf = (id: string): number => CRIER_ACTS.find((a) => a.id === id)!.hit;
/** How far through a warning, `t` seconds into its move: from `from` to just before its blow (as the art chat's films have it). */
const warnK = (t: number, from: number, hit: number): number => clamp01((t - from) / (hit - 0.04 - from));

const OLD: Act1Fx = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // HIM, as he makes a move: its warning on the floor, until its blow
      const act = m.act;
      if (!act || m.state !== 'act') return;
      const t = act.t;
      if (act.id === 'crier:shout' && t < hitOf(act.id)) {
        const w = shoutWay(m.fx, m.fy, act.hand);
        drawShoutWarn(g, c.at, m.x, m.y, w.fx, w.fy, warnK(t, CRIER.shout.warnFrom, hitOf(act.id)), c.t);
      } else if (act.id === 'crier:proclaim' && t < hitOf(act.id)) {
        const w = proclaimWay(m.fx, m.fy, act.hand);
        drawProclaimWarn(g, c.at, m.x, m.y, w.fx, w.fy, warnK(t, CRIER.proclaim.warnFrom, hitOf(act.id)), c.t);
      } else if (act.id === 'crier:crowd' && t < hitOf(act.id)) {
        drawCrowdBreath(g, c.at, m.x, m.y, warnK(t, CRIER.crowd.warnFrom, hitOf(act.id)), c.t);
      }
      return;
    }
    if (!p) return;
    switch (p.a1) {
      case 'crier:slam':
        drawBellSlam(g, c.at, p.x, p.y, p.t);
        break;
      case 'crier:shout':
        drawShoutBlast(g, c.at, p.x, p.y, p.fx, p.fy, p.t);
        break;
      case 'crier:scroll':
        drawProclamation(g, c.at, p.x, p.y, p.fx, p.fy, p.t, [p.a, p.b]);
        break;
      case 'crier:call':
        drawCrowdCall(g, c.at, p.x, p.y, p.t);
        break;
      case 'crier:rising':
        if (p.t >= 0) drawHushedRising(g, c.at, p.x, p.y, p.t);
        break;
      default:
        break;
    }
  },

  // (struck as he marches, he marches on: his flinch is a standing one, and the game carries him on at his pace)
  sprite(m: Monster, _art, set) {
    if (m.state === 'act' || !m.gait || m.struckT === undefined || m.frozenT > 0) return null;
    const gt = m.gait;
    const reel = set.clips?.reel;
    if (!reel || m.struckT >= reel.frames.length / reel.fps) return null;
    const more = set.clips?.moves ?? {};
    const of = (clip: { frames: readonly unknown[]; fps: number } | undefined, t: number): number => (clip ? Math.max(0, Math.min(clip.frames.length - 1, Math.floor(Math.max(0, t) * clip.fps + 1e-6))) : -1);
    if (gt.mode === 'walk') return set.walk[Math.floor(Math.max(0, gt.t) * (set.walkFps ?? 15) + 1e-6) % set.walk.length];
    if (gt.mode === 'setOff' && more.setOff) return more.setOff.frames[of(more.setOff, gt.t)];
    if (gt.mode === 'halt' && more.halt) return more.halt.frames[of(more.halt, gt.t)];
    return null;
  },
};

// HIS FIGHT DONE THE ACTION WAY (CRIER_ACTION: art/crier_action.ts, his yes, 2 Nov 2026): ON THE FLOOR each toll's mark where the hero
// stood, counting down, and its burst (art/crier_action_fx.ts paintToll); the decree's lane marked, the roll flung down it and
// unrolling (paintDecree), and once it lies there its letters burning along it and crumbling; the pools of his call welling up at the
// edges of his square (paintCall); and the shout off the walls: his square's three walls lit at their feet and the one spot ringed
// as he draws breath, then the wave out before him and the echoes back off the walls, the floor dark where they have passed. The
// decree's burning and the shout are drawn here with the canvas's own lines in the art's colours (their painters paint the whole
// square a frame at a time: too slow for the game; the art chat's README allows it: "or their few drawing calls turned into the
// canvas's").
const HUSHC = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4', '#d8d0f0'] as const;
const PINKS = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
const LETTERS = ['#e0287a', '#ff7aa8', '#ffc040', '#ffe6a0', '#ffffff'] as const;
type At = (x: number, y: number, z?: number) => [number, number];
/** A floor picture round (x, y), `rx` by `ry` tiles, painted by `paint` with its `at` (world floor points to its pixels). */
function floorPicture(c: Act1FxCtx, key: string, stamp: string, x: number, y: number, rx: number, ry: number, paint: (px: Px, at: At) => void): void {
  if (!c.g) return;
  const span = Math.hypot(rx, ry) + 1;
  const w = Math.ceil(64 * span) + 8;
  const h = Math.ceil(32 * span) + 8;
  const s = livePicture(key, w, h, w / 2, h / 2, stamp, (px) => paint(px, (u, v, z = 0) => [w / 2 + 32 * (u - x - (v - y)), h / 2 + 16 * (u - x + (v - y)) - z]));
  if (!s) return;
  const [sx, sy] = c.at(x, y);
  drawSprite(c.g, s, sx, sy);
}
/** A point of his frame (tiles before him, to his left) on the screen. */
function framed(c: Act1FxCtx, p: { x: number; y: number; fx: number; fy: number; hand: number }, fwd: number, left: number): readonly [number, number] {
  const w = beside(p.x, p.y, p.fx, p.fy, p.hand, fwd, left);
  return c.at(w.x, w.y);
}
/** THE SHOUT OFF THE WALLS, `m` seconds into it, its walls `w` (his frame). */
function drawShout(c: Act1FxCtx, P: { x: number; y: number; fx: number; fy: number; hand: number }, m: number, w: { far: number; back: number; left: number; right: number }): void {
  const g = c.g!;
  const s = m - SHOUT_HIT;
  const pt = (fwd: number, left: number): readonly [number, number] => framed(c, P, fwd, left);
  const line = (pts: (readonly [number, number])[], colour: string, width: number, alpha: number): void => {
    g.save();
    g.globalAlpha = alpha;
    g.strokeStyle = colour;
    g.lineWidth = width;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
    g.restore();
  };
  const fill = (pts: (readonly [number, number])[], colour: string, alpha: number): void => {
    g.save();
    g.globalAlpha = alpha;
    g.fillStyle = colour;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
    g.restore();
  };
  const T = echoTimes(w);
  const done = Math.max(T.far[1], T.left[1], T.right[1]);
  // THE WARNING: the three walls lit along their feet, beating faster; the one spot ringed in the Hush's pale
  if (m >= SHOUT_HOLD[0] - 0.2 && s < done) {
    const k = Math.min(1, (m - SHOUT_HOLD[0] + 0.2) / 0.5) * (s < 0 ? 1 : Math.max(0, 1 - s / 0.4));
    const beat = 0.55 + 0.45 * Math.sin(m * (8 + 10 * Math.max(0, Math.min(1, m / SHOUT_HIT))));
    if (k > 0) {
      const far = [pt(w.far, w.left), pt(w.far, -w.right)];
      const left = [pt(-w.back, w.left), pt(w.far, w.left)];
      const right = [pt(-w.back, -w.right), pt(w.far, -w.right)];
      for (const ln of [far, left, right]) {
        line(ln, PINKS[2], 4, 0.5 * k);
        line(ln, PINKS[0], 2, 0.85 * k * beat);
      }
    }
    // (THE ONE SPOT, none of them reach)
    const f0 = -(WALLS.behind + WALLS.band);
    const f1 = -w.back + 0.2;
    if (f1 < f0) {
      const half = WALLS.side - WALLS.band;
      const ring = [pt(f0, half), pt(f1, half), pt(f1, -half), pt(f0, -half), pt(f0, half)];
      line(ring, HUSHC[5], 2, 0.8);
      fill(ring, HUSHC[4], 0.12);
    }
  }
  if (s < 0) return;
  // THE DARK where a front has passed, fading after the last echo
  const dark = s < done ? 0.42 : Math.max(0, 0.42 * (1 - (s - done) / WALLS.dark));
  const F = frontsAt(s, w);
  const far = Math.min(w.far, WALLS.from + WALLS.out * s);
  if (dark > 0) {
    const arc: (readonly [number, number])[] = [pt(0, 0)];
    for (let a = -90; a <= 90; a += 6) {
      const r = WALLS.from + WALLS.out * s;
      const fx = Math.cos((a * Math.PI) / 180) * r;
      const lf = Math.sin((a * Math.PI) / 180) * r;
      arc.push(pt(Math.max(0, Math.min(w.far, fx)), Math.max(-w.right, Math.min(w.left, lf))));
    }
    fill(arc, HUSHC[0], dark);
    if (s >= T.far[0]) fill([pt(w.far, w.left), pt(w.far, -w.right), pt(F.far ?? -WALLS.behind, -w.right), pt(F.far ?? -WALLS.behind, w.left)], HUSHC[0], dark * 0.8);
    if (s >= T.left[0]) fill([pt(-w.back, w.left), pt(w.far, w.left), pt(w.far, F.left ?? WALLS.side), pt(-w.back, F.left ?? WALLS.side)], HUSHC[0], dark * 0.8);
    if (s >= T.right[0]) fill([pt(-w.back, -w.right), pt(w.far, -w.right), pt(w.far, -(F.right ?? WALLS.side)), pt(-w.back, -(F.right ?? WALLS.side))], HUSHC[0], dark * 0.8);
  }
  void far;
  // THE FRONTS: a low wall of dead air, pale, its leading edge the enemy's pink
  const front = (pts: (readonly [number, number])[]): void => {
    line(pts, HUSHC[3], 7, 0.55);
    line(pts, HUSHC[5], 3, 0.9);
    line(pts, PINKS[1], 1, 0.9);
  };
  if (F.wave !== null) {
    const pts: (readonly [number, number])[] = [];
    for (let a = -90; a <= 90; a += 4) {
      const fx = Math.cos((a * Math.PI) / 180) * F.wave;
      const lf = Math.sin((a * Math.PI) / 180) * F.wave;
      if (fx > w.far || lf > w.left || -lf > w.right) continue;
      pts.push(pt(fx, lf));
    }
    if (pts.length > 1) front(pts);
  }
  if (F.far !== null) front([pt(F.far, w.left), pt(F.far, -w.right)]);
  if (F.left !== null) front([pt(-w.back, F.left), pt(w.far, F.left)]);
  if (F.right !== null) front([pt(-w.back, -F.right), pt(w.far, -F.right)]);
}
/** THE DECREE lying on its lane, `s` seconds after it was flung: its letters burning along it, then crumbling. */
function drawDecreeBurning(c: Act1FxCtx, p: Peril, s: number): void {
  const g = c.g!;
  const P = { x: p.x, y: p.y, fx: p.fx, fy: p.fy, hand: 1 };
  const pt = (fwd: number, left: number): readonly [number, number] => framed(c, P, fwd, left);
  const to = p.d;
  const unrolled = Math.min(to, DECREE.from + (to - DECREE.from) * Math.min(1, (s - DECREE.lands) / (DECREE.unrolled - DECREE.lands)));
  const crumble = s < DECREE.out ? 0 : Math.min(1, (s - DECREE.out) / (DECREE.gone - DECREE.out));
  g.save();
  g.globalAlpha = 1 - crumble;
  // (the parchment, scorched dark)
  const quad = [pt(DECREE.from, DECREE.half * 0.85), pt(unrolled, DECREE.half * 0.85), pt(unrolled, -DECREE.half * 0.85), pt(DECREE.from, -DECREE.half * 0.85)];
  g.fillStyle = '#3a2a1e';
  g.beginPath();
  quad.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
  g.strokeStyle = PINKS[2];
  g.lineWidth = 1;
  g.stroke();
  // (the decree's letters, burning along it, lit as fast as DECREE.burn tiles a second, flickering)
  const lit = DECREE.from + DECREE.burn * Math.max(0, s - DECREE.lands);
  for (let row = -2; row <= 2; row++) {
    for (let d = DECREE.from + 0.3; d < unrolled - 0.2; d += 0.32) {
      if (d > lit) break;
      const n = Math.sin(d * 12.9898 + row * 78.233) * 43758.5453;
      const hsh = n - Math.floor(n);
      if (hsh < 0.25) continue;
      const fresh = lit - d < 1.5;
      const flick = Math.sin(s * 23 + d * 7 + row) > -0.3;
      const col = fresh ? LETTERS[4] : flick ? LETTERS[Math.floor(hsh * 4)] : HUSHC[3];
      const [x, y] = pt(d, row * DECREE.half * 0.3);
      g.fillStyle = col;
      g.fillRect(Math.round(x) - 2, Math.round(y) - 1, 3 + Math.floor(hsh * 3), 2);
    }
  }
  g.restore();
  c.spot(...pt((DECREE.from + unrolled) / 2, 0), 40, 0.35 * (1 - crumble));
}

const ACTION_FX: Act1Fx = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) return;
    if (!p) return;
    if (p.a1 === TOLL_PERIL) {
      floorPicture(c, `cr:toll:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 30)}`, p.x, p.y, TOLL.r + 0.6, TOLL.r + 0.6, (px, at) => paintToll(px, at(p.x, p.y), p.t));
      return;
    }
    if (p.a1 === SHOUT9_PERIL) {
      drawShout(c, p, p.t, { far: p.a, back: p.b, left: p.c, right: p.d });
      return;
    }
    if (p.a1 === DECREE_PERIL) {
      const s = p.t - PROCLAIM_HIT;
      const aim = Math.atan2(p.fy, p.fx);
      if (s < DECREE.lands) {
        floorPicture(c, `cr:decree:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 15)}`, p.x, p.y, p.d + 1, p.d + 1, (px, at) => paintDecree(px, at, p.t, [p.x, p.y], aim, p.d));
        return;
      }
      drawDecreeBurning(c, p, s);
      return;
    }
    if (p.a1 === CALL9_PERIL) {
      const pools = poolsOf(p).map((q) => [q.x, q.y] as const);
      if (!pools.length) return;
      const R = Math.max(...pools.map(([x, y]) => Math.hypot(x - p.x, y - p.y))) + 2;
      floorPicture(c, `cr:call:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 8)}`, p.x, p.y, R, R, (px, at) => paintCall(px, at, p.t, [p.x, p.y], pools));
    }
  },
  standing(c, m, p) {
    if (!p || p.a1 !== DECREE_PERIL) return;
    // (the roll in the air, flung down from his hand)
    const s = p.t - PROCLAIM_HIT;
    if (s < 0 || s >= DECREE.lands) return;
    const aim = Math.atan2(p.fy, p.fx);
    const key = `cr:decree:air:${p.x.toFixed(3)}:${p.y.toFixed(3)}`;
    const span = 3;
    const w = 64 * span;
    const h = 32 * span + 160;
    const S = livePicture(key, w, h, w / 2, h - 60, `${Math.floor(p.t * 30)}`, (px) => paintDecree(px, (u, v, z = 0) => [w / 2 + 32 * (u - p.x - (v - p.y)), h - 60 + 16 * (u - p.x + (v - p.y)) - z], p.t, [p.x, p.y], aim, p.d, undefined, 'air'));
    if (!S) return;
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y + 0.5, S, sx, sy);
  },
};
void CROWD_HIT;
void CALL;

export const FX: Act1Fx | null = {
  ground: (c, m, p) => {
    if (p && (p.a1 === TOLL_PERIL || p.a1 === SHOUT9_PERIL || p.a1 === DECREE_PERIL || p.a1 === CALL9_PERIL)) return ACTION_FX.ground!(c, m, p);
    if (CRIER_ACTION.on && m) return;
    return OLD.ground!(c, m, p);
  },
  standing: (c, m, p) => ACTION_FX.standing!(c, m, p),
  sprite: (m, art, set) => OLD.sprite!(m, art, set),
};
