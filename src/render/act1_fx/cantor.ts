// ACT 1: THE CANTOR, FLOOR 8'S BOSS: what he does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where his rules (game/act1_rules/cantor.ts) have it. Only what his own pictures do not paint (art/cantor.ts paints
// his bell's rings and cracks, his shout's waves, his copies as they tear away, his six rocks and their shadows):
//   ON THE FLOOR: the echo's spot glowing after his strike, until its echo comes (the bosses' warning ring:
//     art/boss_shots.ts drawSweepRing); his shout's reach marked as he swells, and where its wave will come back
//     from; the rocks his voice shakes loose, with floor 8's own rockfall's pictures (art/floor8.ts: its warning
//     shadow, the rock come down, the rubble), its shadow darkening as it comes as the bosses' falling ball's does
//     (art/boss_shots.ts drawBallShadow); and his copies' doings, which no picture of theirs paints: the rings
//     of their bell on the rock, their shout's waves, their ringing out as they go.
//   AMONG THE FIGURES: his copies, as figures of their own once torn away from him (art/act1_figs/cantor.ts: the
//     art chat's cantorEchoPainted, see-through, in the cult's pink).
// Every colour is the cult's: the bosses' warning's fire, and his sound's own pinks (art/cantor.ts SOUND). Never cyan.

import { ECHO_FPS, ECHO_FROM } from '../../art/act1_figs/cantor';
import { drawBallShadow, drawSweepRing } from '../../art/boss_shots';
import type { FloorAt } from '../../art/mob_shots';
import { PINK } from '../../art/kit';
import { FLAME, SOCKET } from '../../art/mkit';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { CANTOR, COPY, ECHO_MOVES, shoutBack, shoutFrom, shoutOut, strikeSpot } from '../../game/act1_rules/cantor';
import type { Singer } from '../../game/act1_rules/cantor';
import { backView, flipped } from '../../game/facing';
import type { Monster, Peril } from '../../game/state';
import { act1Pieces } from '../act1_pieces';
import { clipFrame } from '../figure';
import type { Act1Fx, Act1FxCtx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** His sound, seen (art/cantor.ts SOUND): the cult's pink, dim, full and bright. */
const SOUND = [FLAME[1], SOCKET, PINK[3]] as const;

/** A pixel of the game's, rounded, in a colour. */
function dot(g: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, w);
}

/**
 * HOW FAR HIS SHOUT WILL ROLL, as he swells (`k` 0 to 1): its far edge on the floor, `r` tiles from (cx, cy) and
 * `half` radians to either side of (fx, fy), and its two sides, in the bosses' warning's fire, a light running
 * along its edge as the sweep ring's does.
 */
function drawReach(g: CanvasRenderingContext2D, at: FloorAt, cx: number, cy: number, fx: number, fy: number, r0: number, r: number, half: number, k: number, t: number): void {
  if (k <= 0) return;
  const was = g.globalAlpha;
  const base = Math.atan2(fy, fx);
  const n = Math.max(24, Math.round(r * half * 2 * 12));
  const run = (t * 1.3) % 1;
  for (let i = 0; i <= n; i++) {
    const a = base - half + (2 * half * i) / n;
    const [x, y] = at(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    const lead = 1 - ((((i / n - run) % 1) + 1) % 1);
    const hot = lead > 0.85 ? (lead - 0.85) / 0.15 : 0;
    g.globalAlpha = was * Math.min(1, 0.2 + 0.6 * k + 0.4 * hot);
    dot(g, x, y, hot > 0.5 ? FLAME[3] : FLAME[2]);
    if (i % 2 === 0) dot(g, x, y + 1, FLAME[0]);
  }
  for (const s of [-1, 1]) {
    const a = base + s * half;
    for (let d = r0; d <= r; d += 0.18) {
      const [x, y] = at(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
      g.globalAlpha = was * (0.15 + 0.45 * k);
      dot(g, x, y, FLAME[1]);
    }
  }
  g.globalAlpha = was;
}

/** A RING OF HIS SOUND ON THE FLOOR (a copy's bell on the rock, its shout's wave, its ringing out): `r` tiles round (cx, cy), all round or `half` to either side of a way, thinning as `u` goes from 0 to 1. */
function drawSound(g: CanvasRenderingContext2D, at: FloorAt, cx: number, cy: number, r: number, u: number, way: { fx: number; fy: number; half: number } | null, seed: number): void {
  if (u < 0 || u >= 1 || r <= 0.02) return;
  const was = g.globalAlpha;
  const base = way ? Math.atan2(way.fy, way.fx) : 0;
  const span = way ? 2 * way.half : Math.PI * 2;
  const n = Math.max(12, Math.min(260, Math.round(r * span * 14)));
  for (let row = 0; row < (way ? 3 : 1); row++) {
    const rr = r - row * 0.1;
    if (rr <= 0.02) continue;
    for (let i = 0; i < n; i++) {
      const h = Math.abs(Math.sin(i * 12.9898 + seed * 78.233 + row * 3.1) * 43758.5453) % 1;
      if (h < u * 0.8) continue;
      const a = base - span / 2 + (span * (i + 0.5)) / n;
      const [x, y] = at(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      g.globalAlpha = was * (1 - u * 0.5);
      dot(g, x, y, row > 1 ? SOUND[0] : row > 0 ? SOUND[1] : h > 0.85 ? SOUND[2] : SOUND[1], u < 0.35 && row === 0 ? 2 : 1);
    }
  }
  g.globalAlpha = was;
}

/** What one who sings warns of and leaves, `T` seconds into one of the moves that strike (0 his strike, 1 his shout); `copy`: a copy's, whose picture paints none of it. */
function warnings(c: Act1FxCtx, which: number, s: Singer, T: number, copy: boolean): void {
  const g = c.g!;
  if (which === 0) {
    const S = CANTOR.strike;
    const p = strikeSpot(s);
    // (a copy's held overhead: where its bell will come down)
    if (copy && T >= 0.45 && T < 1.0) drawSweepRing(g, c.at, p.x, p.y, S.echoR, clamp01((T - 0.45) / 0.45), c.t);
    // (its echo's spot glowing, until the echo comes)
    if (T >= 1.0 + S.glow && T < 1.0 + S.echo) drawSweepRing(g, c.at, p.x, p.y, S.echoR, clamp01((T - 1.0 - S.glow) / (S.echo - S.glow - 0.05)), c.t);
    if (copy) {
      // (its bell on the rock, and its echo after)
      for (const [from, k] of [[1.0, 1], [1.0 + S.echo, 2]] as const) {
        const u = (T - from) / 0.5;
        if (u >= 0 && u < 1) drawSound(g, c.at, p.x, p.y, 0.15 + (k === 1 ? 1.6 : 1.1) * (1 - (1 - u) * (1 - u)), u, null, 11 + k);
      }
    }
    return;
  }
  const S = CANTOR.shout;
  const o = shoutFrom(s);
  if (T >= S.warnFrom && T < 1.0) drawReach(g, c.at, o.x, o.y, s.fx, s.fy, S.r0, S.r0 + S.reach, S.half, clamp01((T - S.warnFrom) / (1.0 - S.warnFrom - 0.08)), c.t);
  // (and where it will come back from: beyond the hero, off the far wall)
  if (T >= 1.0 && T < S.back) drawReach(g, c.at, o.x, o.y, s.fx, s.fy, S.r0 + S.reach, S.r0Back + S.reach, S.halfBack, 0.35 + 0.5 * clamp01((T - 1.0) / (S.back - 1.0)), c.t);
  if (copy) {
    const r1 = shoutOut(T);
    if (r1 !== null) drawSound(g, c.at, o.x, o.y, r1, (T - 1.0) / S.out, { fx: s.fx, fy: s.fy, half: S.half }, 21);
    const r2 = shoutBack(T);
    if (r2 !== null) drawSound(g, c.at, o.x, o.y, r2, (T - S.back) / S.out, { fx: s.fx, fy: s.fy, half: S.halfBack }, 23);
  }
}

/** Floor 8's own rockfall's pictures (art/floor8.ts, the trap tile: 0 its sign, 1 its warning shadow, 2 the rock come down, 3 the rubble). */
function rockFrames(): Sprite[] | null {
  return act1Pieces(8).get('rockfall from the rim')?.frames ?? null;
}

/** One of his copies seen now: its picture, among his (the end of his move, a beat behind him; then his last move). */
function copySprite(c: Act1FxCtx, p: Peril): Sprite | null {
  if (p.done & COPY.fading) return null;
  const art = c.bestiary.of('cantor');
  const set = backView(p.fx, p.fy) ? art.back : art.front;
  const moves = set.clips?.moves;
  if (!moves) return null;
  const T = p.t - p.d;
  const clip = T < 0 ? moves.echoCopies : moves[ECHO_MOVES[p.a].clip];
  if (!clip) return null;
  const s = clipFrame(clip, T < 0 ? p.b + p.t - ECHO_FROM : Math.min(T, ECHO_MOVES[p.a].long));
  return flipped(p.fx, p.fy) ? flipSprite(s) : s;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // HIM, as he makes a move
      const act = m.act;
      if (!act || m.state !== 'act') return;
      const me: Singer = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
      if (act.id === 'cantor:strike') warnings(c, 0, me, act.t, false);
      else if (act.id === 'cantor:shout') warnings(c, 1, me, act.t, false);
      return;
    }
    if (!p) return;
    if (p.a1 === 'cantor:rock') {
      // (his own six are his picture's; those his voice shakes loose, and his copies', are floor 8's rockfall's)
      if (p.a !== 1) return;
      const fr = rockFrames();
      if (!fr || fr.length < 4) return;
      const T = p.t - p.hit;
      const sp = T < 0 ? fr[1] : T < 0.35 ? fr[2] : fr[3];
      if (T < -0.8) return;
      const was = g.globalAlpha;
      if (T >= 0.35) g.globalAlpha = was * clamp01((p.dur - p.t) / 0.5);
      const [sx, sy] = c.at(Math.floor(p.x), Math.floor(p.y));
      g.drawImage(sp.img, Math.round(sx - sp.ax), Math.round(sy - sp.ay), sp.w, sp.h);
      g.globalAlpha = was;
      // (and, as his own rocks have, its shadow darkening as it comes: the bosses' falling ball's, art/boss_shots.ts)
      if (T < 0) drawBallShadow(g, c.at, p.x, p.y, clamp01(1 + T / 0.8));
      return;
    }
    if (p.a1 !== 'cantor:copy') return;
    const s: Singer = { x: p.x, y: p.y, fx: p.fx, fy: p.fy, hand: p.hand };
    const T = p.t - p.d;
    // (ringing out as it goes)
    const fade = p.dur - CANTOR.copies.fade;
    if (p.t >= fade) {
      const u = (p.t - fade) / CANTOR.copies.fade;
      drawSound(g, c.at, p.x, p.y, 0.2 + 1.1 * u, u, null, 31 + p.c);
      return;
    }
    if (T >= 0 && p.a < 2) warnings(c, p.a, s, T, true);
  },

  standing(c, m, p) {
    if (m || !p || p.a1 !== 'cantor:copy') return;
    const s = copySprite(c, p);
    if (!s) return;
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y, s, sx, sy);
  },

  // (struck as he walks in procession, he walks on: his flinch is a standing one, his staff planted beside him)
  sprite(m: Monster, _art, set) {
    if (m.state === 'act' || !m.gait || m.gait.mode !== 'walk' || m.struckT === undefined) return null;
    const reel = set.clips?.reel;
    if (!reel || m.struckT >= reel.frames.length / reel.fps) return null;
    return set.walk[Math.floor(Math.max(0, m.gait.t) * (set.walkFps ?? 16) + 1e-6) % set.walk.length];
  },
};

/** (for the tests) His copies' pictures' frames a second. */
export const COPY_FPS = ECHO_FPS;
