// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19'S BOSS: THE KING: what his blows leave across the hall and send at him, drawn
// (render/act1_fx/types.ts), where his rules (game/act1_rules/gking.ts) have it. His moves themselves are his own pictures'
// (art/act1_figs/gking.ts). From the art chat's (art/king_fx.ts):
//   ON THE FLOOR: through the sweep's warning, the wedge its wave will roll over marked in the enemy's pink (out to 10 tiles; behind
//     his left is clear); through the Crown's, where he will come down, a ring in the enemy's pink; THE SWEEP'S WAVE (the art's
//     sweepPainted, drawn in the game's own pixels: a bright edge of wind rolling out over the wedge, the pale air off his blade
//     streaked behind it, grit churned up behind that); THE CROWN'S RING (crownPainted so: the stones cracked out from under him,
//     the ring rolling out across the hall, its edge ringing pale, the flags heaved up along it and dust behind it).
//   AMONG WHAT STANDS: THE DECREE's knights of fog (the art's knightPainted, each where decreeKnights has it, marching, faded in as
//     they rise and out at the far wall); THE CURTAINS' faces of his deeds (the art's facePainted, each where curtainFaces has
//     it, at its height, a tail of fog behind it); THE HUSH at his side in his last phase (his pictures' third look, its stand;
//     unwinding as he dies); THE CLOCKWORK SONGBIRD as he dies (the art's birdPainted: winding itself up, then singing).
// Nothing cyan: the enemy's pink, the Hush's grey and fog, steel and stone, the bird's gold and silver.

import { toSprite } from '../../art/kit';
import { BIRD, BIRD_CANVAS, CROWN_FX, DECREE_FX, FACE_CANVAS, KN_CANVAS, SWEEP_FX, birdPainted, facePainted, knightPainted } from '../../art/king_fx';
import type { BirdState } from '../../art/king_fx';
import { KG_CROWN, KG_SWEEP } from '../../art/king_moves';
import { hash } from '../../art/kit';
import type { GameView } from '../../art/skin';
import { stage } from '../../art/skin';
import { flipSprite } from '../../engine/px';
import type { Px, Sprite } from '../../engine/px';
import { KING_TUNE, decreeNow, facesNow, ringFront, sweepFront } from '../../game/act1_rules/gking';
import { backView, beside, flipped } from '../../game/facing';
import type { Monster, Peril } from '../../game/state';
import { drawFanWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

const D = Math.PI / 180;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
/** The art's colours for the wave and the ring (art/king_fx.ts): steel and wind, grit, the stones heaved up, the cracks. */
const STEEL_W = ['#5c5874', '#8a86a2', '#c2bfd2', '#eceaf2'];
const GRIT = ['#2c2a38', '#45424f', '#646070'];
const STONE_UP = ['#262a3e', '#3a4058', '#565e7a', '#7a82a0'];
const CRACK = '#100e18';

function dot(g: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1): void {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

// ---------------------------------------------------------------------------------------------
// PICTURES, made the first time each is wanted

const MADE = new Map<string, Sprite>();
function made(key: string, flip: boolean, make: () => Sprite): Sprite {
  const k = `${key}:${flip ? 1 : 0}`;
  let s = MADE.get(k);
  if (!s) {
    s = flip ? flipSprite(made(key, false, make)) : make();
    MADE.set(k, s);
  }
  return s;
}
const viewOf = (fx: number, fy: number): GameView => (backView(fx, fy) ? 'back' : 'front');
const pxSprite = (px: Px, ax: number, ay: number): Sprite => toSprite({ px, lights: [] }, null, ax, ay);
/** A knight of the Decree, frame `j` of his march, seen the way the King faces. */
const knight = (j: number, fx: number, fy: number): Sprite => made(`kn:${j}:${viewOf(fx, fy)}`, flipped(fx, fy), () => pxSprite(knightPainted(j, viewOf(fx, fy)), KN_CANVAS.ax, KN_CANVAS.ay));
/** A face of his deeds (`kind`), seen from in front. */
const face = (kind: number): Sprite => made(`face:${kind}`, false, () => pxSprite(facePainted(kind, 'front'), FACE_CANVAS.ax, FACE_CANVAS.ay));
/** The songbird, `state` at frame `k` (fifteen a second). */
const BIRD_FPS = 15;
const bird = (state: BirdState, k: number): Sprite => made(`bird:${state}:${k}`, false, () => toSprite(birdPainted(state, k / BIRD_FPS, 'front'), null, BIRD_CANVAS.ax, BIRD_CANVAS.ay));

/** How many screen pixels up a length of the art's up is (its stage, seen from in front, against a tile across). */
let upScale = 0;
function upOf(c: Act1FxCtx, x: number, y: number): number {
  if (!upScale) {
    const st = stage('front', 0, 0, { w: 1, h: 1 });
    const [ax, ay] = st.at([0, 0, 0]);
    const [bx, by] = st.at([39.19183588453085, 0, 0]);
    const [, uy] = st.at([0, 0, 10]);
    const [sx0, sy0] = c.at(x, y);
    const [sx1, sy1] = c.at(x + 1, y);
    upScale = (Math.hypot(sx1 - sx0, sy1 - sy0) / Math.max(1e-6, Math.hypot(bx - ax, by - ay))) * ((ay - uy) / 10);
  }
  return upScale;
}

// ---------------------------------------------------------------------------------------------
// ON THE FLOOR

/** THE SWEEP'S WAVE, `t` seconds after the blow, from a peril laid where he stood. */
function wave(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const t = p.t;
  if (t > SWEEP_FX.long) return;
  const front = sweepFront(t);
  const fade = 1 - smooth(SWEEP_FX.out - 0.12, SWEEP_FX.long, t);
  const deep = 1.3 * (0.8 + 0.9 * clamp01(t / SWEEP_FX.out));
  const a0 = KING_TUNE.sweep.from * D;
  const a1 = KING_TUNE.sweep.to * D;
  const steps = Math.ceil(((a1 - a0) * front) / 0.07);
  const was = g.globalAlpha;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const end = Math.min(1, Math.min(i, steps - i) / (steps * 0.07));
    const streak = Math.floor(i / 3) % 5;
    for (let r = front - deep * end; r <= front; r += 0.09) {
      const u = (front - r) / Math.max(0.05, deep);
      const h = hash(i, Math.round(r * 20), 7801);
      let col: string | null = null;
      let up = 0;
      if (u < 0.06) col = h < fade * 1.2 ? STEEL_W[3] : null;
      else if (u < 0.12) col = h < fade ? STEEL_W[2] : null;
      else if (u < 0.42) {
        const dens = (streak === 0 ? 0.9 : streak === 2 ? 0.6 : 0.3) * (1 - u) * fade * end;
        if (h < dens) col = streak === 0 ? STEEL_W[2] : STEEL_W[1];
        up = 2 * (0.42 - u);
      } else {
        const dens = 0.45 * (1 - u) * fade * end;
        if (h < dens) col = h < dens * 0.4 ? STEEL_W[0] : GRIT[(i + Math.round(r * 3)) % 3];
        up = 6 * (u - 0.42) * hash(i, 3, 7802);
      }
      if (!col) continue;
      const q = beside(p.x, p.y, p.fx, p.fy, p.hand, Math.cos(a) * r, Math.sin(a) * r);
      const [sx, sy] = c.at(q.x, q.y);
      g.globalAlpha = was * Math.max(0.35, fade);
      dot(g, sx, sy - up, col);
    }
  }
  g.globalAlpha = was;
}

/** THE CROWN'S RING, `t` seconds after he lands, round where he landed. */
function ring(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const t = p.t;
  if (t > CROWN_FX.long) return;
  const front = ringFront(t);
  const fade = 1 - smooth(CROWN_FX.out, CROWN_FX.long, t);
  const was = g.globalAlpha;
  // (the cracks out from under him, ragged and forking, fading last)
  const cf = 1 - smooth(CROWN_FX.long - 0.5, CROWN_FX.long, t);
  for (let j = 0; j < 14; j++) {
    let a = (j / 14) * Math.PI * 2 + hash(j, 1, 7811);
    const long = KING_TUNE.crown.slam * (0.55 + 0.6 * hash(j, 2, 7811)) * smooth(0, 0.1, t);
    for (let r = 0.15; r < long; r += 0.05) {
      if (hash(j, Math.round(r * 20), 7812) > cf) continue;
      const [sx, sy] = c.at(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
      g.globalAlpha = was;
      dot(g, sx, sy, CRACK, r < long * 0.45 ? 2 : 1);
      a += (hash(j, Math.round(r * 20), 7813) - 0.5) * 0.12;
    }
  }
  if (t <= CROWN_FX.out + 0.25) {
    // (the ring: its edge ringing pale; the flags heaved up along it; dust behind)
    const n = Math.ceil((Math.PI * 2 * front) / 0.06);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      for (let r = front - 0.9; r <= front; r += 0.1) {
        const u = (front - r) / 0.9;
        const h = hash(i, Math.round(r * 10), 7814);
        let col: string | null = null;
        let up = 0;
        if (u < 0.12) col = h < 0.9 * fade + 0.1 ? STEEL_W[3] : null;
        else if (u < 0.45) {
          if (h < 0.55 * fade) col = STONE_UP[(i >> 2) % 4];
          up = 3 * Math.sin(u * Math.PI);
        } else if (h < 0.3 * fade) {
          col = GRIT[i % 3];
          up = 5 * (u - 0.45) * hash(i, 4, 7815);
        }
        if (!col) continue;
        const [sx, sy] = c.at(p.x + ca * r, p.y + sa * r);
        g.globalAlpha = was * Math.max(0.3, fade);
        dot(g, sx, sy - up, col);
      }
    }
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// AMONG WHAT STANDS

/** THE DECREE: each knight where he marches, faded in as he rises and out at the far wall. */
function decree(c: Act1FxCtx, p: Peril): void {
  for (const k of decreeNow(c.game, p)) {
    const seen = Math.min(k.up, k.whole);
    if (seen <= 0.02) continue;
    const s = knight(Math.floor(k.step) % DECREE_FX.march.frames, p.fx, p.fy);
    const [sx, sy] = c.at(k.x, k.y);
    c.stand(k.x + k.y, s, sx, sy + (1 - k.up) * 6, seen);
  }
}

/** THE CURTAINS: each face where it flies, at its height, a tail of fog behind it. */
function faces(c: Act1FxCtx, p: Peril): void {
  const fs = facesNow(p);
  for (const f of fs) {
    const lift = f.z * upOf(c, f.x, f.y);
    const [sx, sy] = c.at(f.x, f.y);
    c.stand(f.x + f.y + 0.1, face(f.kind), sx, sy - lift, 1 - smooth(0.85, 1, f.k));
  }
}

/** THE HUSH at his side: its stand; unwinding into nothing as he dies (its death). */
function hush(c: Act1FxCtx, p: Peril): void {
  const art = c.bestiary.of('gking:2' as never);
  const back = backView(p.fx, p.fy);
  const set = back ? art.back : art.front;
  let s: Sprite | undefined;
  if (p.c) {
    const die = set.clips?.die;
    if (!die || !die.frames.length) return;
    const k = Math.floor(p.t * die.fps);
    if (k >= die.frames.length) return;
    s = die.frames[k];
  } else {
    const list = set.idle;
    if (!list.length) return;
    s = list[Math.floor(c.game.time * (set.idleFps ?? 10)) % list.length];
  }
  if (!s) return;
  const [sx, sy] = c.at(p.x, p.y);
  c.stand(p.x + p.y, flipped(p.fx, p.fy) ? flipSprite(s) : s, sx, sy);
}

/** THE SONGBIRD as he dies: winding itself up, then singing. */
function songbird(c: Act1FxCtx, p: Peril): void {
  const winding = p.t < BIRD.wind;
  const k = winding ? Math.min(Math.floor(p.t * BIRD_FPS), Math.floor(BIRD.wind * BIRD_FPS) - 1) : Math.floor(((p.t - BIRD.wind) % BIRD.song) * BIRD_FPS);
  const s = bird(winding ? 'winding' : 'singing', k);
  const [sx, sy] = c.at(p.x, p.y);
  c.stand(p.x + p.y, s, sx, sy);
}

// ---------------------------------------------------------------------------------------------
// HIS WARNINGS

function warnings(c: Act1FxCtx, m: Monster): void {
  const act = m.act!;
  const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
  if (act.id === 'gking:sweep') {
    // (the wedge the wave will roll over, out to its reach: behind his left is clear)
    const k = warnK(act.t, KG_SWEEP.warn[0] - 0.15, KG_SWEEP.hit);
    if (k >= 0) drawFanWarn(c.g!, c.at, w, KING_TUNE.sweep.from * D, KING_TUNE.sweep.to * D, KING_TUNE.sweep.reach, k, c.t);
  } else if (act.id === 'gking:crown') {
    // (where he will come down: carried at where the hero stood, so far as he goes)
    const k = warnK(act.t, KG_CROWN.warn[0], KG_CROWN.hit);
    if (k < 0) return;
    const dx = act.x - m.x;
    const dy = act.y - m.y;
    const d = Math.hypot(dx, dy);
    const left = act.t < KG_CROWN.air[0] ? Math.min(KING_TUNE.crown.carry, Math.max(0, d - 0.6)) : Math.max(0, Math.min(d - 0.6, KING_TUNE.crown.carry - (m.a1?.carried ?? 0)));
    const at = d > 0.01 ? { x: m.x + (dx / d) * left, y: m.y + (dy / d) * left } : { x: m.x, y: m.y };
    drawFanWarn(c.g!, c.at, { ...w, x: at.x, y: at.y }, -Math.PI, Math.PI, KING_TUNE.crown.slam, k, c.t);
  }
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act) warnings(c, m);
    if (p && p.a1 === 'gking:wave') wave(c, p);
    if (p && p.a1 === 'gking:ring') ring(c, p);
  },
  standing(c, m, p) {
    void m;
    if (!p) return;
    if (p.a1 === 'gking:decree') decree(c, p);
    else if (p.a1 === 'gking:faces') faces(c, p);
    else if (p.a1 === 'gking:hush') hush(c, p);
    else if (p.a1 === 'gking:bird') songbird(c, p);
  },
};
