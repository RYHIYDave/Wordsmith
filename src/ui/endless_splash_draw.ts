// ENDLESS MODE'S SPLASH, PAINTED, AS THE GAME PLAYS IT (the art chat, 11 Nov 2026; the picture and its numbers: art/endless_splash.ts,
// behind ENDLESS_SPLASH, off). drawEndlessSplashArt takes the place of the splash painted in code (ui/endless_fanfare.ts
// drawEndlessSplash sends it here while the switch is on): the same call, the same seconds.
//
// What is drawn, `t` seconds in: the dark; the picture, with all that is still asleep covered (the gates wake one after another,
// away from us: art/endless_splash.ts ES_MOMENT), a flash on each as it wakes, a kick of the screen, dust off its crown; the
// torches' fire, the waypoint's light going round, the far fire, each a small piece painted a few times over and laid on in turn;
// light added where light is (the torches, the waypoint, the far fire's burst); and THE LETTERS, the game's own: ENDLESS falling
// onto the lintel with its whole weight, then THE WAY GOES ON, then HARDCORE in the enemy's pink.
//
// Everything is a function of `t` alone: nothing is kept from one frame to the next, so any moment can be drawn on its own.
// THE PICTURE IS PAINTED ONCE, the first time it is wanted (about a second: readyEndlessSplash paints it ahead, under a loading
// screen say, so that the splash does not wait for it).

import { drawText, textWidth } from '../engine/font';
import { hash2 } from '../engine/rng';
import { ENDLESS_SPLASH, ES_FIRES, ES_FLAMES, ES_H, ES_W, ES_WAYS, HALL_SCENE, endlessAsleep } from '../art/endless_splash';
import type { EndlessPatch, EndlessScene } from '../art/endless_splash';
import { STAIR_SCENE } from '../art/endless_stair';

interface Piece {
  cv: HTMLCanvasElement;
  /** In game pixels, from the picture's top left corner. */
  x: number;
  y: number;
  w: number;
  h: number;
}
interface SplashArt {
  scene: EndlessScene;
  still: HTMLCanvasElement;
  asleep: Int16Array[];
  flames: Piece[][];
  ways: Piece[];
  fires: Piece[];
  glowPink: HTMLCanvasElement;
  glowGold: HTMLCanvasElement;
  glowCyan: HTMLCanvasElement;
  /** A torch's light at three sizes: far, middling, near. */
  glowTorch: HTMLCanvasElement[];
}

const NIGHT = '#05040f';
/** The letters' colours: the stone's pale violet (as the splash painted in code has them), and the enemy's. */
const STONE = { face: '#ece8ff', under: '#b0a4e0', edge: '#2a2466' };
const ENEMY = { edge: '#ff4f8a', gold: '#ffd27a' };
const WORD = 'ENDLESS';
const WAY = 'THE WAY GOES ON';
const HARD = 'HARDCORE';
const SUB_GAP = 10;

/** How far the far fire's light reaches once it has settled, in game pixels. */
const FIRE_R = 50;

const clamp = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

function canvasOf(w: number, h: number, c: Int32Array): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = c[i];
    if (v < 0) continue;
    im.data[i * 4] = (v >> 16) & 255;
    im.data[i * 4 + 1] = (v >> 8) & 255;
    im.data[i * 4 + 2] = v & 255;
    im.data[i * 4 + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return cv;
}
const pieceOf = (p: EndlessPatch): Piece => ({ cv: canvasOf(p.w, p.h, p.c), x: p.x / 2, y: p.y / 2, w: p.w / 2, h: p.h / 2 });

/**
 * A round of light on black, in bands, rx by ry game pixels, painted at the picture's own grain (two pixels to a game pixel) to
 * be added where it is wanted at that size: never stretched, never smoothed.
 */
function glowOf(rx: number, ry: number, r: number, g0: number, b: number, bands: number): HTMLCanvasElement {
  const w = rx * 4;
  const h = ry * 4;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot((x + 0.5 - w / 2) / (w / 2), (y + 0.5 - h / 2) / (h / 2));
      const k = d >= 1 ? 0 : Math.ceil((1 - d) * bands) / bands;
      const i = (y * w + x) * 4;
      im.data[i] = Math.round(r * k * k);
      im.data[i + 1] = Math.round(g0 * k * k);
      im.data[i + 2] = Math.round(b * k * k);
      im.data[i + 3] = 255;
    }
  }
  g.putImageData(im, 0, 0);
  return cv;
}

/** The same light at any size, for the far fire's burst: its bands laid on row by row, each row of the picture's own pixels. */
function burst(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, a: number, bands: number, h: number): void {
  if (a <= 0) return;
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = color;
  for (let i = 1; i <= bands; i++) {
    // (band i from the outside: what it adds to the bands outside it)
    g.globalAlpha = Math.min(1, a * ((i / bands) ** 2 - ((i - 1) / bands) ** 2));
    const f = (bands - i + 1) / bands;
    const by = Math.round(ry * f * 2) / 2;
    for (let y = -by; y < by; y += 0.5) {
      if (cy + y < -1 || cy + y > h) continue;
      const hw = Math.round(rx * f * Math.sqrt(Math.max(0, 1 - ((y + 0.25) / by) ** 2)) * 2) / 2;
      if (hw > 0) g.fillRect(cx - hw, cy + y, hw * 2, 0.5);
    }
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
}

let art: SplashArt | null = null;

/** THE PICTURE MADE READY (painted, once): call it ahead of the splash, where a wait does not show. */
export function readyEndlessSplash(): void {
  const S = ENDLESS_SPLASH.picture === 'hall' ? HALL_SCENE : STAIR_SCENE;
  if (art && art.scene === S) return;
  const p = S.paint();
  art = {
    scene: S,
    still: canvasOf(p.w, p.h, p.c),
    asleep: endlessAsleep(p),
    flames: Array.from({ length: S.flames }, (_, site) => Array.from({ length: ES_FLAMES }, (_u, i) => pieceOf(S.paintFlame(site, i)))),
    ways: Array.from({ length: ES_WAYS }, (_, i) => pieceOf(S.paintWay(i))),
    fires: Array.from({ length: ES_FIRES }, (_, i) => pieceOf(S.paintFire(i))),
    glowPink: glowOf(FIRE_R, Math.round(FIRE_R * 0.7), 255, 79, 138, 6),
    glowGold: glowOf(18, 13, 255, 208, 122, 4),
    glowCyan: glowOf(S.wayGlow[0], S.wayGlow[1], 34, 208, 224, 5),
    glowTorch: [12, 24, 46].map((r) => glowOf(r, r, 255, 138, 42, r > 30 ? 5 : 4)),
  };
}

/** The picture let go of (some 5 MB of it), once the splash is over: it is painted again if it is wanted again. */
export function releaseEndlessSplash(): void {
  art = null;
}

/** The kick of the screen at time t, in game pixels (halves: the picture's own pixels). */
function kickAt(S: EndlessScene, t: number): [number, number] {
  const ES_MOMENT = S.moment;
  let sx = 0;
  let sy = 0;
  for (let j = 0; j <= S.gates; j++) {
    const dt = t - S.wake(j);
    if (dt < 0 || dt >= 0.14) continue;
    const amp = (j === S.gates ? 3.5 : j === 0 ? 2 : 3 * Math.sqrt(S.near(j))) * (1 - dt / 0.14);
    sy += amp * Math.cos(dt * 80);
    sx += amp * 0.6 * Math.sin(dt * 97 + j);
  }
  // (the word landing: the heaviest, straight down)
  const dl = t - ES_MOMENT.land;
  if (dl >= 0 && dl < 0.28) sy += 6 * (1 - dl / 0.28) * Math.cos(dl * 62);
  const dh = t - ES_MOMENT.hard;
  if (dh >= 0 && dh < 0.1) sx += 1.5 * (1 - dh / 0.1) * Math.cos(dh * 90);
  return [Math.round(sx * 2) / 2, Math.round(sy * 2) / 2];
}

/** Rows of the picture (art/endless_splash.ts endlessAsleep) filled, the picture's corner at (x0, y0). */
function fillRuns(g: CanvasRenderingContext2D, runs: Int16Array, x0: number, y0: number, h: number): void {
  for (let i = 0; i < runs.length; i += 3) {
    const y = y0 + runs[i] / 2;
    if (y < -1 || y > h) continue;
    g.fillRect(x0 + runs[i + 1] / 2, y, (runs[i + 2] - runs[i + 1]) / 2, 0.5);
  }
}

/** A light painted by glowOf added with its middle at (cx, cy), at its own size. */
function add(g: CanvasRenderingContext2D, cv: HTMLCanvasElement, cx: number, cy: number, a: number): void {
  if (a <= 0) return;
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = Math.min(1, a);
  g.drawImage(cv, Math.round(cx * 2) / 2 - cv.width / 4, Math.round(cy * 2) / 2 - cv.height / 4, cv.width / 2, cv.height / 2);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
}

/** Dust shaken off stage k (art/endless_splash.ts EndlessScene.dust), born at `born`. `land`: the dust of the word's landing. */
function dust(g: CanvasRenderingContext2D, S: EndlessScene, t: number, born: number, k: number, land: boolean, color: string, x0: number, y0: number): void {
  const a = t - born;
  if (a < 0 || a > 1.4) return;
  g.fillStyle = color;
  const n = S.dustN(k, land);
  for (let i = 0; i < n; i++) {
    const d = S.dust(k, i, a, land);
    if (!d) continue;
    g.globalAlpha = d[3];
    g.fillRect(x0 + Math.round(d[0]) / 2, y0 + Math.round(d[1]) / 2, d[2] / 2, d[2] / 2);
  }
  g.globalAlpha = 1;
}

/** The game's letters with a dark edge round them, as the splash painted in code letters ENDLESS. */
function edged(g: CanvasRenderingContext2D, text: string, cx: number, y: number, scale: number, face: string, edge: string): void {
  const e = Math.ceil(scale / 2);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) drawText(g, text, cx + dx * e, y + dy * e, edge, { align: 'center', scale });
  drawText(g, text, cx, y, face, { align: 'center', scale });
}

/**
 * THE SPLASH, `t` seconds in, on a screen of w by h game pixels (the same call as ui/endless_fanfare.ts drawEndlessSplash).
 */
export function drawEndlessSplashArt(g: CanvasRenderingContext2D, t: number, w: number, h: number): void {
  readyEndlessSplash();
  const a = art as SplashArt;
  const S = a.scene;
  const hall = S === HALL_SCENE;
  const M = S.moment;
  const L = S.lettering(w, h, textWidth(WORD), textWidth(WAY) + SUB_GAP + textWidth(HARD));
  const smooth = g.imageSmoothingEnabled;
  g.save();
  g.imageSmoothingEnabled = false;
  // (the dark coming up over the game)
  g.globalAlpha = clamp(t / 0.1);
  g.fillStyle = NIGHT;
  g.fillRect(0, 0, w, h);
  g.globalAlpha = 1;
  let awake = 0;
  while (awake <= S.gates && t >= S.wake(awake)) awake++;
  const [kx, ky] = kickAt(S, t);
  const x0 = L.ox + kx;
  const y0 = L.oy + ky;
  const cx = Math.floor(w / 2) + kx;
  if (awake > 0) {
    g.drawImage(a.still, x0, y0, ES_W, ES_H);
    // WHAT LIVES: the torches' fire, the waypoint's light going round, the far fire
    for (let site = 0; site < S.flames; site++) {
      if (S.torches[site][2] >= awake) continue;
      const f = a.flames[site][(Math.floor(t * 11) + site * 2) % ES_FLAMES];
      g.drawImage(f.cv, x0 + f.x, y0 + f.y, f.w, f.h);
    }
    if (awake > S.wayStage) {
      const wp = a.ways[Math.floor(t * 9) % ES_WAYS];
      g.drawImage(wp.cv, x0 + wp.x, y0 + wp.y, wp.w, wp.h);
    }
    if (awake > S.gates) {
      const fp = a.fires[Math.floor(t * 8) % ES_FIRES];
      g.drawImage(fp.cv, x0 + fp.x, y0 + fp.y, fp.w, fp.h);
    }
    // LIGHT ADDED where light is
    S.torches.forEach(([tx, ty, stage, size], i) => {
      if (stage >= awake) return;
      const flick = hash2(Math.floor(t * 12), 3 + i, 401);
      add(g, a.glowTorch[size], x0 + tx / 2, y0 + ty / 2, 0.2 + flick * 0.08);
    });
    if (awake > S.wayStage) add(g, a.glowCyan, x0 + S.wayAt[0] / 2, y0 + S.wayAt[1] / 2, 0.3 + 0.07 * Math.sin(t * 4.2));
    // A FLASH on each stage as it wakes (the last three still dying down), over itself and all that is seen beyond it
    for (let j = Math.max(0, awake - 3); j < Math.min(awake, S.gates); j++) {
      const dt = t - S.wake(j);
      if (dt >= 0.16) continue;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = (j === 0 ? 0.4 : hall ? 0.6 : 0.45) * (1 - dt / 0.16);
      g.fillStyle = hall && j > 0 ? '#7af8f0' : '#ffb060';
      fillRuns(g, a.asleep[j], x0, y0, h);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
    }
    // WHAT IS STILL ASLEEP, in the dark
    if (awake <= S.gates) {
      g.fillStyle = NIGHT;
      fillRuns(g, a.asleep[awake], x0, y0, h);
    }
    // DUST off each stage as it wakes
    for (let j = 0; j < Math.min(awake, S.gates); j++) dust(g, S, t, S.wake(j), j, false, !hall ? '#d0c0b0' : j === 0 ? '#c8a890' : '#a8c4d0', x0, y0);
    // THE FAR FIRE TAKES: a burst of its light, then it breathes
    const df = t - M.far;
    if (df >= 0) {
      const big = df < 0.1 ? df / 0.1 : Math.max(0, 1 - (df - 0.1) / 0.4) ** 2;
      const fx = x0 + S.fireAt[0] / 2;
      const fy = y0 + S.fireAt[1] / 2;
      if (big > 0.02) {
        const r = FIRE_R + 130 * big;
        burst(g, fx, fy, r, r * (hall ? 0.7 : 0.9), ENEMY.edge, 0.42 + 0.45 * big, 6, h);
        burst(g, fx, fy, r * 0.36, r * (hall ? 0.26 : 0.33), ENEMY.gold, 0.5 + 0.4 * big, 4, h);
      } else {
        add(g, a.glowPink, fx, fy, 0.42 + 0.06 * Math.sin(t * 3.1));
        add(g, a.glowGold, fx, fy, 0.5 + 0.08 * Math.sin(t * 3.1 + 1));
      }
      if (df < 0.22) {
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.26 * (1 - df / 0.22);
        g.fillStyle = ENEMY.edge;
        g.fillRect(0, 0, w, h);
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
      }
    }
    // MOTES of the waypoint's light, rising off it
    if (awake > S.wayStage) {
      const since = (t - S.wake(S.wayStage)) / 1.9;
      for (let i = 0; i < 11; i++) {
        const age = (((since + i * 0.137) % 1) + 1) % 1;
        if (since + i * 0.137 < 1 && age > since) continue;
        const spread = hall ? 96 : 60;
        const mx = S.wayAt[0] / 2 + (hash2(i, 5, 409) - 0.5) * spread + Math.sin(age * 6 + i) * 3;
        const my = S.wayAt[1] / 2 - 3 - age * (hall ? 38 + hash2(i, 7, 409) * 26 : 14) + (hall ? 0 : (hash2(i, 9, 409) - 0.5) * spread);
        g.globalAlpha = Math.ceil((1 - age) * 4) / 4;
        g.fillStyle = i % 3 === 0 ? '#b8fff8' : '#22d0e0';
        const s = i % 4 === 0 ? 1 : 0.5;
        g.fillRect(x0 + Math.round(mx * 2) / 2, y0 + Math.round(my * 2) / 2, s, s);
      }
      g.globalAlpha = 1;
    }
    // (the stair's picture is made quieter under the letters: the dark laid over its top in flat bands)
    if (!hall) {
      g.fillStyle = NIGHT;
      g.globalAlpha = 0.5;
      g.fillRect(0, 0, w, L.lintel);
      for (let i = 0; i < 8; i++) {
        g.globalAlpha = 0.5 * (1 - (i + 1) / 9);
        g.fillRect(0, L.lintel + i * 3, w, 3);
      }
      g.globalAlpha = 1;
    }
  }
  // THE LETTERS. ENDLESS falls from above the screen and lands on the lintel: a big wind-up, then the blow in a blink
  if (t >= M.drop) {
    const u = clamp((t - M.drop) / (M.land - M.drop));
    const fall = Math.round((1 - u * u) * (L.wordY + 7 * L.scale + 8));
    const dl = t - M.land;
    const sink = dl >= 0 && dl < 0.09 ? Math.round(3 * (1 - dl / 0.09)) : 0;
    const y = L.wordY - fall + sink + ky;
    if (u < 1) {
      // (smeared as it falls)
      for (const [back, al] of [[0.3, 0.3], [0.55, 0.14]] as const) {
        const ub = u - back;
        if (ub <= 0) continue;
        g.globalAlpha = al;
        drawText(g, WORD, cx, L.wordY - Math.round((1 - ub * ub) * (L.wordY + 7 * L.scale + 8)) + ky, STONE.under, { align: 'center', scale: L.scale });
      }
      g.globalAlpha = 1;
    }
    edged(g, WORD, cx, y, L.scale, dl >= 0 && dl < 0.08 ? '#ffffff' : STONE.face, STONE.edge);
    if (dl >= 0) {
      // (the lintel shakes its dust down, and the stone's light flashes)
      dust(g, S, t, M.land, 0, true, hall ? '#b0a4e0' : '#d0c0b0', x0, y0);
      if (dl < 0.1) {
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.22 * (1 - dl / 0.1);
        g.fillStyle = STONE.face;
        g.fillRect(0, 0, w, h);
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'source-over';
      }
    }
  }
  // (THE WAY GOES ON comes up; HARDCORE strikes, gold for a blink, then the enemy's pink)
  if (t >= M.way) {
    const wa = textWidth(WAY);
    const wb = textWidth(HARD);
    const ax = L.oneLine ? cx - Math.floor((wa + SUB_GAP + wb) / 2) + Math.floor(wa / 2) : cx;
    const bx = L.oneLine ? cx - Math.floor((wa + SUB_GAP + wb) / 2) + wa + SUB_GAP + Math.floor(wb / 2) : cx;
    g.globalAlpha = Math.ceil(clamp((t - M.way) / 0.16) * 4) / 4;
    drawText(g, WAY, ax, L.subY + ky, STONE.under, { align: 'center', scale: 1, shadow: STONE.edge });
    g.globalAlpha = 1;
    if (t >= M.hard) drawText(g, HARD, bx, L.subY + (L.oneLine ? 0 : 9) + ky, t - M.hard < 0.09 ? ENEMY.gold : ENEMY.edge, { align: 'center', scale: 1, shadow: STONE.edge });
  }
  g.restore();
  g.imageSmoothingEnabled = smooth;
}
