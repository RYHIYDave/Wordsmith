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
import { BIRD, BIRD_CANVAS, DECREE_FX, FACE_CANVAS, KN_CANVAS, birdPainted, facePainted, knightPainted } from '../../art/king_fx';
import type { BirdState } from '../../art/king_fx';
import { hash } from '../../art/kit';
import type { GameView } from '../../art/skin';
import { stage } from '../../art/skin';
import { flipSprite } from '../../engine/px';
import type { Px, Sprite } from '../../engine/px';
import { HUSH_MOVE, KING_TUNE, armsOut, decreeNow, facesNow } from '../../game/act1_rules/gking';
import { backView, beside, flipped } from '../../game/facing';
import type { Monster, Peril } from '../../game/state';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

const D = Math.PI / 180;
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

const C = KING_TUNE.charge;
const W = KING_TUNE.weight;
const HF = KING_TUNE.hush.fog;

/** THE LINE OF SPARKS cut by his blade from where he set off (p.x, p.y) to where he is (p.a, p.b): glowing hotter until it bursts. */
function sparks(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const dx = p.a - p.x;
  const dy = p.b - p.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.05) return;
  const burstAt = p.d ? p.d + C.burst : Infinity;
  const was = g.globalAlpha;
  const heat = p.d ? clamp01((p.t - p.d) / C.burst) : 0.2;
  const after = p.t - burstAt;
  const fade = after > 0 ? 1 - clamp01(after / 0.45) : 1;
  if (fade <= 0) return;
  const n = Math.ceil(len / 0.05);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = p.x + dx * u;
    const y = p.y + dy * u;
    // (the cut itself, a dark groove with a hot edge)
    const [sx, sy] = c.at(x, y);
    g.globalAlpha = was * fade;
    dot(g, sx, sy + 1, CRACK, 2);
    const hot = hash(i, Math.floor(c.t * 12), 7901);
    dot(g, sx, sy, hot < 0.3 + 0.5 * heat ? SPARK[1] : SPARK[2]);
    if (after > 0) {
      // (it bursts: a row of flares thrown up along it)
      const up = 3 + 14 * hash(i, 1, 7902) * (1 - fade * 0.3);
      if (hash(i, 2, 7903) < 0.6) dot(g, sx, sy - up * (1 - fade) - 2, SPARK[hash(i, 3, 7904) < 0.4 ? 0 : 1], 2, 2);
    } else if (hash(i, Math.floor(c.t * 20), 7905) < 0.05 + 0.25 * heat) {
      // (sparks spitting up off it, more as it nears the burst)
      dot(g, sx + (hash(i, 4, 7906) - 0.5) * 4, sy - 2 - 6 * hash(i, Math.floor(c.t * 20), 7907), SPARK[0]);
    }
  }
  g.globalAlpha = was;
}

/** The crown's weight's moments: flying off his head till `fly`; hanging over the hero, following, till `follow`; rising and trembling till `rise`; dropping till `slam`. */
const CW = { fly: W.fly, follow: W.follow, rise: W.follow + W.hold, slam: W.follow + W.hold + W.drop };
/** How high the crown hangs over the floor (screen pixels). */
const CROWN_UP = 40;
/** Where the crown is on the floor (tiles) at peril time `t`: flying off his head, then over the hero (the peril's own place). */
function crownFloor(p: Peril): { x: number; y: number } {
  const u = smooth(0, CW.fly, p.t);
  return { x: p.a + (p.x - p.a) * u, y: p.b + (p.y - p.b) * u };
}

/** Where the crown's weight hangs, its shadow under it (darkening as it comes), and where it slammed: a ring of dust and the stones cracked. */
function weightGround(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const was = g.globalAlpha;
  if (p.t < CW.slam) {
    // (its shadow on the floor: wider and darker as it nears its drop; the enemy's pink edge round where it will strike)
    const f = crownFloor(p);
    const k = clamp01(p.t / CW.rise);
    const [sx, sy] = c.at(f.x, f.y);
    const rx = 8 + 10 * k;
    g.globalAlpha = was * (0.25 + 0.4 * k);
    g.fillStyle = '#05040a';
    g.beginPath();
    g.ellipse(sx, sy, rx, rx * 0.5, 0, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = was;
    if (p.t >= CW.fly) drawFanWarn(g, c.at, { x: p.x, y: p.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, W.r, 0.2 + 0.8 * k, c.t * (p.t > CW.follow ? 2.5 : 1));
    return;
  }
  const t = p.t - CW.slam;
  // (a ring of dust and air thrown out from it, past its reach)
  if (t < 0.35) {
    const R = W.r * (0.3 + 1.2 * smooth(0, 0.35, t));
    const n = Math.ceil(R * 40);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = R * (0.92 + 0.08 * hash(i, 1, 7931));
      const [sx, sy] = c.at(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr);
      g.globalAlpha = was * (1 - t / 0.35);
      dot(g, sx, sy - 2 * hash(i, 2, 7932), i % 3 ? GOLD[3] : '#f4f0ff', 2, 1);
    }
  }
  // (the stones cracked out from under it, fading)
  const cf = 1 - smooth(1.0, W.home + 0.8, t);
  for (let j = 0; j < 12; j++) {
    let a = (j / 12) * Math.PI * 2 + hash(j, 1, 7911);
    const long = W.r * (0.5 + 0.55 * hash(j, 2, 7911)) * smooth(0, 0.06, t);
    for (let r = 0.1; r < long; r += 0.05) {
      if (hash(j, Math.round(r * 20), 7912) > cf) continue;
      const [sx, sy] = c.at(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
      g.globalAlpha = was;
      dot(g, sx, sy, CRACK, r < long * 0.4 ? 2 : 1);
      a += (hash(j, Math.round(r * 20), 7913) - 0.5) * 0.14;
    }
  }
  // (dust thrown up, settling)
  if (t < 0.6) {
    for (let i = 0; i < 40; i++) {
      const a = hash(i, 3, 7933) * Math.PI * 2;
      const r = W.r * hash(i, 4, 7934) * smooth(0, 0.3, t);
      const up = 14 * hash(i, 5, 7935) * Math.sin(Math.min(1, t / 0.6) * Math.PI);
      const [sx, sy] = c.at(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
      g.globalAlpha = was * (1 - t / 0.6) * 0.8;
      dot(g, sx, sy - up, i % 2 ? '#4a4658' : '#6a6678', 2, 2);
    }
  }
  g.globalAlpha = was;
}

/**
 * THE CROWN in the game's pixels (a stand-in until the art chat's), in the game's own world (his word, 31 Oct 2026: “It’s not
 * on the plane of the game, like it’s flat to the screen.”): a ring of gold lying level as the floor does, seen from above at
 * the floor's own angle, its band standing up off it and five points rising from the band with pearls on their tips, turned
 * round `spin` (radians) as it hangs; the far side of the ring drawn first, darker, seen past the near side; stones set in the
 * band's near side. (`fx`, `fy`): over which point of the floor (tiles); `lift`: how high it hangs (screen pixels); `size`
 * times its own.
 */
function crownAt(c: Act1FxCtx, fx: number, fy: number, lift: number, alpha: number, spin = 0, size = 1): void {
  if (alpha <= 0) return;
  const g = c.g!;
  const was = g.globalAlpha;
  const R = 0.36 * size;
  const band = Math.max(3, Math.round(4 * size));
  const tall = 7 * size;
  // (a point of the ring at angle `a`: where its foot is on the screen, and how near the eye it is)
  const ring = (a: number): { x: number; y: number; near: number } => {
    const [x, y] = c.at(fx + Math.cos(a) * R, fy + Math.sin(a) * R);
    return { x, y: y - lift, near: Math.cos(a) + Math.sin(a) };
  };
  const N = 48;
  const pts = Array.from({ length: N }, (_, i) => ({ a: (i / N) * Math.PI * 2, ...ring((i / N) * Math.PI * 2) }));
  // (its glow, faint: the enemy's gold)
  const [gx, gy] = c.at(fx, fy);
  g.globalAlpha = was * alpha * 0.07;
  g.fillStyle = GOLD[3];
  g.beginPath();
  g.ellipse(gx, gy - lift - band, 22 * size, 14 * size, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = was * alpha;
  const pointAt = (k: number): { a: number; near: number } => {
    const a = spin + (k / 5) * Math.PI * 2;
    return { a, near: Math.cos(a) + Math.sin(a) };
  };
  const drawPoint = (a: number, near: number): void => {
    const p = ring(a);
    const l = ring(a - 0.32);
    const r = ring(a + 0.32);
    const lit = near > 0;
    g.fillStyle = lit ? GOLD[2] : GOLD[1];
    g.beginPath();
    g.moveTo(l.x, l.y - band + 1);
    g.lineTo(p.x, p.y - band - tall);
    g.lineTo(r.x, r.y - band + 1);
    g.closePath();
    g.fill();
    if (lit) {
      g.fillStyle = GOLD[3];
      g.fillRect(Math.round(p.x - 0.5), Math.round(p.y - band - tall * 0.75), 1, Math.round(tall * 0.6));
    }
    g.fillStyle = lit ? '#f4f0ff' : '#8a86a2';
    const pr = Math.max(1, Math.round(1.2 * size));
    g.fillRect(Math.round(p.x - pr / 2), Math.round(p.y - band - tall - pr), pr + 1, pr + 1);
  };
  // (the far side: its points, then the inside of the band, dark)
  for (let k = 0; k < 5; k++) {
    const q = pointAt(k);
    if (q.near <= 0) drawPoint(q.a, q.near);
  }
  for (const p of pts) {
    if (p.near > 0) continue;
    g.fillStyle = GOLD[0];
    g.fillRect(Math.round(p.x), Math.round(p.y - band), 2, band);
  }
  // (the near side of the band, lit from above: its rim bright, shading to its foot)
  for (const p of pts) {
    if (p.near <= 0) continue;
    for (let y = 0; y < band; y++) {
      g.fillStyle = y === 0 ? GOLD[3] : y < band * 0.5 ? GOLD[2] : y < band - 1 ? GOLD[1] : GOLD[0];
      g.fillRect(Math.round(p.x), Math.round(p.y - band + y), 2, 1);
    }
  }
  // (stones set in its near side, between the points)
  for (let k = 0; k < 5; k++) {
    const a = spin + ((k + 0.5) / 5) * Math.PI * 2;
    if (Math.cos(a) + Math.sin(a) <= 0.3) continue;
    const p = ring(a);
    g.fillStyle = k % 2 ? '#c0204a' : '#2a3a9a';
    g.fillRect(Math.round(p.x - 1), Math.round(p.y - band * 0.7), 2, 2);
  }
  // (the near points over all)
  for (let k = 0; k < 5; k++) {
    const q = pointAt(k);
    if (q.near > 0) drawPoint(q.a, q.near);
  }
  g.globalAlpha = was;
}

/** THE CROWN in the air: off his head and out over the hero; hanging, turning slowly, following him; rising and trembling as it stops; dropping, a heavy slam; then flying home to his head. */
function weightAir(c: Act1FxCtx, p: Peril): void {
  const size = 1.6;
  if (p.t < CW.fly) {
    // (lifted off his head, arcing out over the hero)
    const f = crownFloor(p);
    const u = smooth(0, CW.fly, p.t);
    crownAt(c, f.x, f.y, 58 + (CROWN_UP - 58) * u + 22 * Math.sin(u * Math.PI), 1, p.t * 9, size);
    return;
  }
  if (p.t < CW.follow) {
    // (hanging, turning slowly, bobbing)
    crownAt(c, p.x, p.y, CROWN_UP + 2 * Math.sin(c.t * 4), 1, p.t * 1.6, size);
  } else if (p.t < CW.rise) {
    // (it stops, rises, and trembles: the drop is coming)
    const u = smooth(CW.follow, CW.rise, p.t);
    const shake = (hash(Math.floor(c.t * 40), 1, 7941) - 0.5) * 0.08 * u;
    crownAt(c, p.x + shake, p.y - shake, CROWN_UP + 12 * u, 1, CW.follow * 1.6, size * (1 + 0.1 * u));
  } else if (p.t < CW.slam) {
    // (dropping, fast)
    const u = (p.t - CW.rise) / (CW.slam - CW.rise);
    crownAt(c, p.x, p.y, (CROWN_UP + 12) * (1 - u * u), 1, CW.follow * 1.6, size);
  } else {
    // (struck down: a bounce on the stones, then flying home to his head, turning)
    const t = p.t - CW.slam;
    const king = c.game.monsters.find((q) => q.kind === 'gking' && !q.dead);
    const home = king ?? { x: p.a, y: p.b };
    const u = smooth(0.2, W.home, t);
    const bounce = t < 0.2 ? 6 * Math.sin((t / 0.2) * Math.PI) : 0;
    // (home on his head: gone into his own picture's)
    crownAt(c, p.x + (home.x - p.x) * u, p.y + (home.y - p.y) * u, bounce + 58 * u + 26 * Math.sin(u * Math.PI), (king ? 1 : 1 - u) * (1 - smooth(W.home, W.home + 0.12, t)), t * 10, size);
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
    if (k >= 0) drawStripWarn(c.g!, c.at, w, 0.4, Math.max(0.6, act.a), -0.65, 0.65, k, c.t);
  }
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act) warnings(c, m);
    if (!p) return;
    if (p.a1 === 'gking:sparks') sparks(c, p);
    else if (p.a1 === 'gking:weight') weightGround(c, p);
    else if (p.a1 === 'gking:fog') fog(c, p);
    else if (p.a1 === 'gking:hush' && !p.c && p.b === HUSH_MOVE.grab) arms(c, p, true);
  },
  air(c, m, p) {
    void m;
    if (!c.g || !p) return;
    if (p.a1 === 'gking:weight') weightAir(c, p);
    else if (p.a1 === 'gking:hush' && !p.c && p.b === HUSH_MOVE.grab) arms(c, p, false);
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
