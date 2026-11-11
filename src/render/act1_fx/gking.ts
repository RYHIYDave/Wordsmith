// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19'S BOSS: THE KING: what his blows leave across the hall and send at him, drawn
// (render/act1_fx/types.ts), where his rules (game/act1_rules/gking.ts) have it. His moves themselves are his own pictures'
// (art/act1_figs/gking.ts). From the art chat's (art/king_fx.ts):
//   ON THE FLOOR: through his charge's warning, the lane he will run marked in the enemy's pink; THE LINE OF SPARKS his blade
//     cuts in the stones as he runs, glowing hotter until it bursts; under THE CROWN'S WEIGHT its shadow, darkening, its edge
//     the enemy's pink, and the stones cracked where it slams; THE HUSH'S GREY FOG lying in patches (marked where they will fall
//     as it breathes in); through its grab's warning, the line its arms will shoot along.
//   IN THE AIR: THE CROWN hanging over the hero, slamming down, flying home; THE HUSH'S ARMS shooting out, and dragging him.
//   (HIS WORD OF 31 OCT: the charge, the crown's weight and the Hush's three moves are drawn here in the game's own pixels by the
//   main chat, standing in until the art chat's pictures of them come: game/act1_rules/gking.ts.)
//   AMONG WHAT STANDS: THE DECREE's knights of fog (the art's knightPainted, each where decreeKnights has it, marching, faded in as
//     they rise and out at the far wall); THE CURTAINS' faces of his deeds (the art's facePainted, each where curtainFaces has
//     it, at its height, a tail of fog behind it); THE HUSH at his side in his last phase (his pictures' third look, its stand;
//     unwinding as he dies); THE CLOCKWORK SONGBIRD as he dies (the art's birdPainted: winding itself up, then singing).
// Nothing cyan: the enemy's pink, the Hush's grey and fog, steel and stone, the bird's gold and silver.

import { toSprite } from '../../art/kit';
import { BIRD, BIRD_CANVAS, DECREE_FX, FACE_CANVAS, FX_CANVAS, KN_CANVAS, WEIGHT_CANVAS, WEIGHT_FX, birdPainted, facePainted, knightPainted, sparksPainted, weightPainted } from '../../art/king_fx';
import type { BirdState } from '../../art/king_fx';
import { hash } from '../../art/kit';
import type { GameView } from '../../art/skin';
import { stage } from '../../art/skin';
import { flipSprite } from '../../engine/px';
import type { Px, Sprite } from '../../engine/px';
import { HUSH_MOVE, KING_TUNE, armsOut, decreeNow, facesNow } from '../../game/act1_rules/gking';
import { backView, beside, flipped } from '../../game/facing';
import type { Monster, Peril } from '../../game/state';
import { keptPictures } from './kept';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

const D = Math.PI / 180;
const FPS = 30;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
/** Colours: the sparks off his blade (white-hot to the enemy's gold to ember), the crown's gold, the Hush's grey fog, the cracks. */
const SPARK = ['#fff4d6', '#ffd27a', '#ff9a3c', '#a8401a'];
const GOLD = ['#5a3c12', '#9a6a1e', '#d9a441', '#ffe08a'];
const FOG = ['#2e2c36', '#47454f', '#666370', '#8c8996', '#b3b0bc'];
const CRACK = '#100e18';

function dot(g: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1): void {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

// ---------------------------------------------------------------------------------------------
// PICTURES, made the first time each is wanted

const MADE = keptPictures<string, Sprite>();
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

const C = KING_TUNE.charge;
const W = KING_TUNE.weight;
const HF = KING_TUNE.hush.fog;

/** THE LINE OF SPARKS (the art's sparksPainted, at the King's size): cut 1.75 tiles behind him from where he set off as he runs,
 * its sparks shooting off and popping 0.6 s after he stops, lying a second; laid where he set off, turned as he ran. */
function sparks(c: Act1FxCtx, p: Peril): void {
  const k = Math.floor(p.t * FPS);
  const lane = Math.round(Math.min(C.most, Math.hypot(p.a - p.x, p.b - p.y)) * 4) / 4;
  const view = viewOf(p.fx, p.fy);
  const sp = made(`sparks:${k}:${view}:${lane}`, flipped(p.fx, p.fy), () => toSprite(sparksPainted(k / FPS, view, lane), null, FX_CANVAS.ax, FX_CANVAS.ay));
  const [sx, sy] = c.at(p.x, p.y);
  c.g!.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
}

/** THE CROWN'S WEIGHT (the art's weightPainted): `'floor'`, under the figures (its shadow, its warning ring, the slam's crack and dust), and `'crown'`, over them, at the floor point under it, seen as he faced as he sent it. */
function weight(c: Act1FxCtx, p: Peril, part: 'floor' | 'crown'): void {
  if (p.t >= WEIGHT_FX.long) return;
  const k = Math.floor(p.t * FPS);
  const view = viewOf(p.fx, p.fy);
  const sp = made(`weight:${part}:${k}:${view}`, flipped(p.fx, p.fy), () => toSprite(weightPainted(k / FPS, view, part), null, WEIGHT_CANVAS.ax, WEIGHT_CANVAS.ay));
  const [sx, sy] = c.at(p.x, p.y);
  if (part === 'floor') c.g!.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
  else c.stand(p.x + p.y + 2, sp, sx, sy);
}
/** The crown's frames painted ahead a little at a time while he stands in his hall (each is heavy to paint), so that none is painted as it is shown. */
let aheadAt = 0;
function paintAhead(m: Monster): void {
  if (aheadAt >= 2 * Math.ceil(WEIGHT_FX.long * FPS)) return;
  const t0 = performance.now();
  const n = Math.ceil(WEIGHT_FX.long * FPS);
  const view = viewOf(m.fx, m.fy);
  while (aheadAt < 2 * n && performance.now() - t0 < 3) {
    const part = aheadAt < n ? 'crown' : 'floor';
    const k = aheadAt % n;
    made(`weight:${part}:${k}:${view}`, false, () => toSprite(weightPainted(k / FPS, view, part), null, WEIGHT_CANVAS.ax, WEIGHT_CANVAS.ay));
    aheadAt++;
  }
}

/** THE HUSH'S GREY FOG, a patch where it lies (its clock below 0: where it will fall, marked as the Hush breathes in). */
function fog(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  if (p.t < 0) {
    const k = clamp01(1 + p.t / HF.warn);
    drawFanWarn(g, c.at, { x: p.x, y: p.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, HF.r, k, c.t);
    return;
  }
  const a = smooth(0, 0.3, p.t) * (1 - smooth(p.dur - 1, p.dur, p.t));
  const was = g.globalAlpha;
  const n = 260;
  for (let i = 0; i < n; i++) {
    // (wisps drifting round in it, thicker in the middle)
    const r = HF.r * Math.sqrt(hash(i, 1, 7921));
    const ang = hash(i, 2, 7922) * Math.PI * 2 + c.t * (0.3 + 0.4 * hash(i, 3, 7923)) * (i % 2 ? 1 : -1);
    const [sx, sy] = c.at(p.x + Math.cos(ang) * r, p.y + Math.sin(ang) * r);
    const up = 1 + 5 * hash(i, 4, 7924);
    g.globalAlpha = was * a * (0.35 + 0.4 * (1 - r / HF.r));
    dot(g, sx, sy - up, FOG[1 + Math.floor(hash(i, 5, 7925) * 4)], 2, 1);
  }
  g.globalAlpha = was;
}

/** THE HUSH'S ARMS: shooting out along its line, or holding the hero as it drags him; through its warning, that line marked. */
function arms(c: Act1FxCtx, p: Peril, ground: boolean): void {
  const g = c.g!;
  const G = KING_TUNE.hush.grab;
  const fx = Math.cos(p.a);
  const fy = Math.sin(p.a);
  if (ground) {
    const k = warnK(p.d, 0, G.warn);
    if (k >= 0 && !p.done) drawStripWarn(g, c.at, { x: p.x, y: p.y, fx, fy, hand: 1 }, 0.3, G.reach, -0.45, 0.45, k, c.t);
    return;
  }
  const h = c.game.hero;
  const out = armsOut(p.d);
  if (!p.done && out <= 0) return;
  const tip = p.done ? { x: h.x, y: h.y } : { x: p.x + fx * out, y: p.y + fy * out };
  const [x0, y0] = c.at(p.x, p.y);
  const [x1, y1] = c.at(tip.x, tip.y);
  const len = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(2, Math.ceil(len / 1.5));
  for (const side of [-1.5, 1.5]) {
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const wob = Math.sin(u * 9 + c.t * 14 + side) * 1.2;
      dot(g, x0 + (x1 - x0) * u + side, y0 - 26 + (y1 - 8 - (y0 - 26)) * u + wob, FOG[u < 0.85 ? 2 : 4]);
    }
  }
  // (its long fingers at the end)
  for (let f = 0; f < 4; f++) dot(g, x1 - 3 + f * 2, y1 - 8 + (f % 2), FOG[4], 1, 3);
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
  // (wrapped round him, shielding him: drawn over him, a little in front)
  const over = !p.c && p.b === HUSH_MOVE.shield;
  c.stand(p.x + p.y + (over ? 0.3 : 0), flipped(p.fx, p.fy) ? flipSprite(s) : s, sx, sy, over ? 0.85 : 1);
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
  if (act.id === 'gking:charge') {
    // (the lane he will run, as far as he will go)
    const k = warnK(act.t, 0, C.warn);
    // (its line of sparks, and where they will strike, is the art's: drawn from the line itself)
    if (k >= 0) drawStripWarn(c.g!, c.at, w, 0.4, Math.max(0.6, act.a), -0.65, 0.65, k, c.t);
  }
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act) warnings(c, m);
    if (!p) return;
    if (p.a1 === 'gking:sparks') sparks(c, p);
    else if (p.a1 === 'gking:weight') weight(c, p, 'floor');
    else if (p.a1 === 'gking:fog') fog(c, p);
    else if (p.a1 === 'gking:hush' && !p.c && p.b === HUSH_MOVE.grab) arms(c, p, true);
  },
  air(c, m, p) {
    void m;
    if (!c.g || !p) return;
    if (p.a1 === 'gking:hush' && !p.c && p.b === HUSH_MOVE.grab) arms(c, p, false);
  },
  standing(c, m, p) {
    if (m) paintAhead(m);
    if (!p) return;
    if (p.a1 === 'gking:weight') weight(c, p, 'crown');
    else if (p.a1 === 'gking:decree') decree(c, p);
    else if (p.a1 === 'gking:faces') faces(c, p);
    else if (p.a1 === 'gking:hush') hush(c, p);
    else if (p.a1 === 'gking:bird') songbird(c, p);
  },
};
