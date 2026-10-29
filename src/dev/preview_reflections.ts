// Dev page: FLOOR 18'S MIRROR ENEMIES, YOUR REFLECTIONS (art/reflections.ts, art/reflections_fx.ts): each hero beside
// his glass copy, from in front and from behind, three times as big, and at the game's size; a moment of a move close
// up; and the film. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_reflections.ts shots/refl/sheet.png 1200 1400 "sheet"
//   ... "big:<warrior|ranger|mage>:<move>:<t>" (the hero and his reflection at that moment, front and behind, 4x)
//   ... "step:<cls>:<t>" (stepping out of the mirror at t seconds, 4x), "shatter:<cls>:<front|back>:<k>" (4x),
//   ... "strip:<cls>:<move>:<front|back>:<n>" (n moments of a move, the hero above, his reflection below, 3x)
//   ... "stepgrid:<cls>", "shattergrid:<cls>:<front|back>" (six moments of either, 2x, captioned)
//   ... "film" (the film, frame by frame: window.__frames, window.__frame(k) gives frame k as a PNG, as tools/page_gif.mjs
//       takes them; 1080 x 1080 at 30 a second)
import type { Sprite } from '../engine/px';
import { Px } from '../engine/px';
import { Tails } from '../engine/tails';
import type { TailRoot } from '../engine/tails';
import type { ClassId } from '../game/types';
import { HERO_TAILS } from '../art/heroes';
import { PLANS, makeHeroArt3, spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { makeSpellArt } from '../art/spells';
import { GLASS_TAILS, REFLECTION_POOL, asEnemy, makeReflectionArt, reflectionPainted, reflectionSprite } from '../art/reflections';
import { GALLERY_MIRROR, SHATTER, SHATTER_CANVAS, STEP_CANVAS, STEP_MIRROR, STEP_OUT, chipsPainted, mirrorPainted, reflectionEffects, shatterFrom, shatterPainted, steppingAt, stepOutPainted } from '../art/reflections_fx';
import { hash, toSprite } from '../art/kit';
import type { Painted } from '../art/kit';
import { CANVAS3 } from '../art/skin';
import { BOW_HALF, STAFF_UP } from '../art/moves3';
import { bonesAt, solve, heading, add, mul } from '../art/skeleton';
import { stage } from '../art/skin';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'warrior', a2 = 'strike', a3 = '0.2'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
cv.style.display = 'block';
cv.width = window.innerWidth;
cv.height = window.innerHeight;
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

const CLASSES: { cls: ClassId; name: string }[] = [
  { cls: 'warrior', name: 'THE KNIGHT' },
  { cls: 'ranger', name: 'THE RANGER' },
  { cls: 'mage', name: 'THE MAGE' },
];
const heroes = makeHeroArt3();
const reflections = makeReflectionArt(reflectionEffects);

// ---------------------------------------------------------------------------------------------
// THE GALLERY'S FLOOR (a stand-in for floor 18's own: polished stone in the floor's palette, a step quieter than the figures)

const FLOOR_TONES = ['#120f22', '#1a1630', '#221d3c', '#2a2546'];
/** A piece of polished floor `w` x `h` picture pixels, a tile's corner at (ox, oy) on it. */
function floorPx(w: number, h: number, ox: number, oy: number): Px {
  const p = new Px(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // (tile coordinates: a tile is a diamond 64 across and 32 down)
      const u = (x - ox) / 64 + (y - oy) / 32;
      const v = (y - oy) / 32 - (x - ox) / 64;
      const fu = u - Math.floor(u);
      const fv = v - Math.floor(v);
      const dark = (Math.floor(u) + Math.floor(v)) % 2 === 0;
      let c = dark ? FLOOR_TONES[0] : FLOOR_TONES[1];
      // (the seam between flags, and a lit lip on each flag's upper left edges)
      if (fu < 0.025 || fv < 0.025) c = '#0b0918';
      else if (fu < 0.06 || fv < 0.06) c = dark ? FLOOR_TONES[1] : FLOOR_TONES[2];
      // (polish: a faint streak of light across each flag)
      else if (Math.abs(fu - fv) < 0.05 && fu > 0.3 && fu < 0.7) c = dark ? FLOOR_TONES[1] : FLOOR_TONES[3];
      p.set(x, y, c);
    }
  }
  return p;
}
const floorCanvas = new Map<string, HTMLCanvasElement>();
/** The floor laid over a box of the page, `k` page pixels to a picture pixel, a tile's corner under (fx, fy). */
function floor(x: number, y: number, w: number, h: number, k: number, fx: number, fy: number): void {
  const pw = Math.ceil(w / k);
  const ph = Math.ceil(h / k);
  const ox = (((fx - x) / k) % 64) + 64;
  const oy = (((fy - y) / k) % 32) + 32;
  const key = `${pw}x${ph}:${ox.toFixed(1)}:${oy.toFixed(1)}`;
  let c = floorCanvas.get(key);
  if (!c) {
    c = floorPx(pw, ph, Math.round(ox), Math.round(oy)).toCanvas();
    floorCanvas.set(key, c);
  }
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.drawImage(c, x, y, pw * k, ph * k);
  // (the dark of the gallery, thinner round the figure)
  const dark = g.createRadialGradient(fx, fy - 30 * k, 10 * k, fx, fy - 30 * k, Math.max(w, h) * 0.7);
  dark.addColorStop(0, 'rgba(6,4,14,0)');
  dark.addColorStop(1, 'rgba(6,4,14,0.75)');
  g.fillStyle = dark;
  g.fillRect(x, y, w, h);
  g.restore();
}

// ---------------------------------------------------------------------------------------------
// FIGURES AS THE GAME LAYS THEM DOWN: the pool of light, the soft shadow, the tails behind, the figure, the tails in front

/** A pool of light (a Sprite's `aura`), as the renderer lays it: added to what is under it. */
function pool(s: Sprite, x: number, y: number, k: number): void {
  const a = s.aura;
  if (!a) return;
  const d = s.density ?? 1;
  const cx = x + (a.x - s.ax) * d * k;
  const cy = y + (a.y - s.ay) * d * k;
  const r = a.r * d * k;
  const [rr, gg, bb] = [parseInt(a.color.slice(1, 3), 16), parseInt(a.color.slice(3, 5), 16), parseInt(a.color.slice(5, 7), 16)];
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, `rgba(${rr},${gg},${bb},${a.a ?? 0.5})`);
  gr.addColorStop(0.45, `rgba(${rr},${gg},${bb},${(a.a ?? 0.5) * 0.45})`);
  gr.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = gr;
  g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.restore();
}
/** The lights a frame gives off, as the renderer lays them over the dark. */
function lights(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  for (const l of s.lights ?? []) {
    const cx = x + (l.x - s.ax) * d * k;
    const cy = y + (l.y - s.ay) * d * k;
    const r = l.r * d * k;
    const [rr, gg, bb] = [parseInt(l.color.slice(1, 3), 16), parseInt(l.color.slice(3, 5), 16), parseInt(l.color.slice(5, 7), 16)];
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, `rgba(${rr},${gg},${bb},${(l.a ?? 0.5) * 0.6})`);
    gr.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = gr;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
    g.restore();
  }
}
function shadow(x: number, y: number, k: number): void {
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath();
  g.ellipse(x, y, 13 * k, 6.5 * k, 0, 0, Math.PI * 2);
  g.fill();
}
/** What flies from a figure, settled as it hangs after standing a couple of seconds (or carried on from `was`). */
function tailsOf(s: Sprite, glass: boolean, was?: Tails, dt = 1 / 30, steps = 80): Tails {
  const t = was ?? new Tails(glass ? GLASS_TAILS : HERO_TAILS);
  for (let i = 0; i < steps; i++) t.step(dt, s.tails as TailRoot[] | undefined, s.ax, s.ay, 1, 0, 0);
  return t;
}
/** A figure laid down with its feet at (x, y), `k` page pixels to a picture pixel. */
function figure(s: Sprite, x: number, y: number, k: number, glass: boolean, tails?: Tails): void {
  const d = s.density ?? 1;
  pool(s, x, y, k);
  shadow(x, y, k);
  const t = tails ?? tailsOf(s, glass);
  t.draw(g, x, y, false, k * d);
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
  t.draw(g, x, y, true, k * d);
  lights(s, x, y, k);
}

function text(t: string, x: number, y: number, size: number, color = '#e8e2ff', weight = 600, align: CanvasTextAlign = 'left'): void {
  g.fillStyle = color;
  g.font = `${weight} ${size}px system-ui, sans-serif`;
  g.textAlign = align;
  g.textBaseline = 'middle';
  g.fillText(t, x, y);
}

/** A painting (on any canvas) as a Sprite, its feet at (ax, ay) on it. */
const spriteOfPainted = (f: Painted, ax: number, ay: number, aura: typeof REFLECTION_POOL | null = null): Sprite => toSprite(f, aura, ax, ay);
/** Draw a painting with its pixel (ax, ay) at (x, y) on the page, `k` page pixels to a picture pixel (no pool, no shadow). */
function paint(f: Painted, ax: number, ay: number, x: number, y: number, k: number): void {
  const s = spriteOfPainted(f, ax, ay);
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
  lights(s, x, y, k);
}

if (mode === 'sheet') {
  // THE SHEET: each class, the hero beside his reflection, from in front and from behind, three times as big; and below,
  // at the game's size (a picture pixel to a page pixel, as the other sheets have it), the hero among his reflections
  const K = 3;
  const W = 1200;
  const CELL = W / 4;
  const ROW = 250;
  const GAP = 56;
  const HEAD = 96;
  const GAME = 330;
  cv.width = W;
  cv.height = HEAD + CLASSES.length * (ROW + GAP) + GAME;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d0b1a';
  g.fillRect(0, 0, cv.width, cv.height);
  text('Your reflections: floor 18, the Glass Gallery', 20, 30, 28, '#ffd866', 700);
  text('Each hero (left and right) beside his glassy copy (middle), from in front and from behind. Mock-up: not in the game.', 20, 68, 17, '#cfc8ff', 500);
  CLASSES.forEach(({ cls, name }, r) => {
    const top = HEAD + r * (ROW + GAP);
    text(name, 20, top + 14, 19, '#ffd866', 700);
    const hero = heroes.of(cls, { twoHanded: true });
    const refl = reflections.of(cls);
    const cells: [Sprite, boolean, string][] = [
      [hero.front.idle[0], false, 'The hero, facing you'],
      [refl.front.idle[4], true, 'His reflection, facing you'],
      [refl.back.idle[4], true, 'His reflection, facing away'],
      [hero.back.idle[0], false, 'The hero, facing away'],
    ];
    cells.forEach(([s, glass, label], c) => {
      const x = c * CELL;
      const y = top + 30;
      const fx = x + CELL / 2;
      const fy = y + ROW - 34;
      floor(x + 4, y, CELL - 8, ROW - 8, K, fx, fy);
      g.save();
      g.beginPath();
      g.rect(x + 4, y, CELL - 8, ROW - 8);
      g.clip();
      figure(s, fx, fy, K, glass);
      g.restore();
      text(label, x + 12, y + ROW + 4, 14, glass ? '#ffb0cc' : '#a8f0ff', 600);
    });
  });
  // AT THE GAME'S SIZE
  const top = HEAD + CLASSES.length * (ROW + GAP) + 6;
  text("At the game's size: each hero (in colour) with two of his reflections", 20, top + 12, 19, '#ffd866', 700);
  floor(0, top + 30, W, GAME - 40, 1, W / 2, top + 200);
  CLASSES.forEach(({ cls }, i) => {
    const hero = heroes.of(cls, { twoHanded: true });
    const refl = reflections.of(cls);
    const cx = 200 + i * 400;
    const y = top + 210;
    figure(refl.back.idle[3], cx - 70, y - 54, 1, true);
    figure(refl.front.idle[6], cx + 64, y - 36, 1, true);
    figure(hero.front.idle[0], cx - 16, y + 12, 1, false);
  });
} else if (mode === 'big') {
  // A MOMENT OF A MOVE (`big:<cls>:<move>:<t>`): the hero and his reflection, from in front and from behind, four times as big
  const K = 4;
  cv.width = 1200;
  cv.height = 520;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d0b1a';
  g.fillRect(0, 0, cv.width, cv.height);
  const move = MOVES3[a2];
  const t = Number(a3) || 0;
  const views: GameView[] = ['front', 'back'];
  views.forEach((view, v) => {
    const x0 = v * 600;
    floor(x0 + 4, 4, 592, 512, K, x0 + 300, 440);
    figure(spriteOf3(move, t, view), x0 + 160, 440, K, false);
    figure(reflectionSprite(move, t, view), x0 + 440, 440, K, true);
  });
  text(`${a2} @ ${t.toFixed(3)} s`, 12, 20, 16);
} else if (mode === 'strip') {
  // `strip:<cls>:<move>:<view>:<n>`: n moments of a move, evenly through it, the hero above and his reflection below, 3x
  const K = 3;
  const move = MOVES3[a2];
  const view = (a3 === 'back' ? 'back' : 'front') as GameView;
  const n = Number(decodeURIComponent(location.hash.slice(1)).split(':')[4] ?? '6') || 6;
  const keys = move.motion.keys;
  const end = keys[keys.length - 1].at;
  cv.width = 1200;
  cv.height = 640;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d0b1a';
  g.fillRect(0, 0, cv.width, cv.height);
  floor(0, 0, 1200, 640, K, 600, 300);
  for (let i = 0; i < n; i++) {
    const t = (end * i) / Math.max(1, n - 1);
    const x = (1200 / n) * (i + 0.5);
    figure(spriteOf3(move, t, view), x, 280, K, false);
    figure(reflectionSprite(move, t, view), x, 600, K, true);
    text(`${t.toFixed(2)} s`, x - 30, 20, 13);
  }
  void a1;
} else if (mode === 'step') {
  // `step:<cls>:<t>`: stepping out of the mirror, t seconds in, four times as big, the stand-in mirror behind
  const K = 4;
  const cls = a1 as ClassId;
  const t = Number(a2) || 0;
  cv.width = STEP_CANVAS.w * K;
  cv.height = STEP_CANVAS.h * K;
  g.imageSmoothingEnabled = false;
  floor(0, 0, cv.width, cv.height, K, STEP_CANVAS.ax * K, STEP_CANVAS.ay * K);
  const m = mirrorPainted(STEP_CANVAS.w, STEP_CANVAS.h, STEP_MIRROR[0], STEP_MIRROR[1]);
  g.drawImage(m.toCanvas(), 0, 0, cv.width, cv.height);
  paint(stepOutPainted(cls, t), STEP_CANVAS.ax, STEP_CANVAS.ay, STEP_CANVAS.ax * K, STEP_CANVAS.ay * K, K);
  text(`${cls} stepping out @ ${t.toFixed(2)} s`, 12, 20, 16);
} else if (mode === 'shatter') {
  // `shatter:<cls>:<view>:<k>`: shattering, k of the way through, four times as big
  const K = 3;
  const cls = a1 as ClassId;
  const view = (a2 === 'back' ? 'back' : 'front') as GameView;
  const k = Number(a3) || 0;
  cv.width = SHATTER_CANVAS.w * K;
  cv.height = SHATTER_CANVAS.h * K;
  g.imageSmoothingEnabled = false;
  floor(0, 0, cv.width, cv.height, K, SHATTER_CANVAS.ax * K, SHATTER_CANVAS.ay * K);
  paint(shatterPainted(shatterFrom(cls, view), k), SHATTER_CANVAS.ax, SHATTER_CANVAS.ay, SHATTER_CANVAS.ax * K, SHATTER_CANVAS.ay * K, K);
  text(`${cls} shattering, ${view}, k ${k.toFixed(2)}`, 12, 20, 16);
} else if (mode === 'stepgrid' || mode === 'shattergrid') {
  // `stepgrid:<cls>` / `shattergrid:<cls>:<view>`: six moments of its stepping out of a mirror, or of its shattering,
  // twice as big, captioned, about 1200 across
  const K = 2;
  const cls = a1 as ClassId;
  const step = mode === 'stepgrid';
  const view = (a2 === 'back' ? 'back' : 'front') as GameView;
  const moments = step ? [0.3, 0.6, 0.8, 0.92, 1.12, 1.5] : [0.04, 0.1, 0.2, 0.36, 0.62, 0.85];
  const words = step
    ? ['the glass stirs: it forms in the dark', 'bright as glass, its eyes kindled', 'thrown out through the glass', 'the glass clings to it', 'the surface bursts', 'it stands; the rings die away']
    : ['struck: cracks race over it', 'it bursts', 'shards and glitter fly', 'they fall, turning, flashing', 'they lie and fade', 'nearly gone; then nothing']
  const CW = 390;
  const CH = step ? 340 : 300;
  const HEAD = 70;
  cv.width = CW * 3 + 40;
  cv.height = HEAD + 2 * (CH + 40);
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d0b1a';
  g.fillRect(0, 0, cv.width, cv.height);
  const name = CLASSES.find((c) => c.cls === cls)?.name ?? cls;
  text(step ? `${name}'S REFLECTION steps out of a mirror` : `${name}'S REFLECTION shatters`, 20, 26, 24, '#ffd866', 700);
  text(step ? `1.6 seconds, from in front; the mirror's frame is a stand-in. Mock-up: not in the game.` : `1.4 seconds, ${view === 'front' ? 'from in front' : 'from behind'}; at the end nothing is left. Mock-up: not in the game.`, 20, 54, 15, '#cfc8ff', 500);
  const mirror = step ? mirrorPainted(STEP_CANVAS.w, STEP_CANVAS.h, STEP_MIRROR[0], STEP_MIRROR[1]).toCanvas() : null;
  moments.forEach((t, i) => {
    const x = 20 + (i % 3) * CW;
    const y = HEAD + Math.floor(i / 3) * (CH + 40);
    // (the feet's place in the cell)
    const fx = x + (step ? 250 : CW / 2);
    const fy = y + (step ? 300 : 200);
    floor(x + 4, y, CW - 8, CH, K, fx, fy);
    g.save();
    g.beginPath();
    g.rect(x + 4, y, CW - 8, CH);
    g.clip();
    if (step && mirror) {
      g.drawImage(mirror, fx - STEP_CANVAS.ax * K, fy - STEP_CANVAS.ay * K, STEP_CANVAS.w * K, STEP_CANVAS.h * K);
      const at = steppingAt(cls, t);
      if (t >= STEP_OUT.until) shadow(fx + (at.x - STEP_CANVAS.ax) * K, fy + (at.y - STEP_CANVAS.ay) * K, K);
      paint(stepOutPainted(cls, t), STEP_CANVAS.ax, STEP_CANVAS.ay, fx, fy, K);
    } else paint(shatterPainted(shatterFrom(cls, view), t), SHATTER_CANVAS.ax, SHATTER_CANVAS.ay, fx, fy, K);
    g.restore();
    text(`${step ? t.toFixed(2) + ' s' : (t * SHATTER.time).toFixed(2) + ' s'}: ${words[i]}`, x + 10, y + CH + 18, 15, '#ffb0cc', 600);
  });
} else if (mode === 'film') {
  setUpFilm();
}

// =============================================================================================
// THE FILM: for each class, its reflection stepping out of a mirror, standing, running, its attacks, struck, shattering;
// from in front, then from behind; captioned. 1080 x 1080, 30 frames a second, five page pixels to a picture pixel.

function setUpFilm(): void {
  const FPS = 30;
  const SIZE = 1080;
  const K = 5;
  const CAP = 150;
  cv.width = SIZE;
  cv.height = SIZE;
  /** Where the reflection's feet are on the page. */
  const FX = 580;
  const FY = 880;
  /** One shot of the film: how long, its words, and what to draw `t` seconds into it. */
  interface Shot {
    long: number;
    who: string;
    what: string;
    view: GameView | null;
    draw: (t: number) => void;
  }
  const shots: Shot[] = [];
  /** The run's floor slides by under it (the camera goes with it), so far a second, in picture pixels, along the way it faces. */
  let slide = 0;
  /** The floor, slid by `along` picture pixels the way the figure faces. */
  const ground = (view: GameView, along: number): void => {
    const [dx, dy] = view === 'front' ? [2 / Math.sqrt(5), 1 / Math.sqrt(5)] : [2 / Math.sqrt(5), -1 / Math.sqrt(5)];
    const sx = Math.round(-dx * along) * K;
    const sy = Math.round(-dy * along) * K;
    floor(0, CAP, SIZE, SIZE - CAP, K, FX + sx, FY + sy);
  };
  const tails = new Map<string, Tails>();
  /** The reflection at a moment of a move, laid down with its tails carried on from the last frame drawn. */
  const glassAt = (key: string, s: Sprite, x = FX, y = FY, lift = 0): void => {
    let t = tails.get(key);
    if (!t) {
      t = tailsOf(s, true);
      tails.set(key, t);
    } else tailsOf(s, true, t, 1 / FPS, 1);
    g.save();
    g.beginPath();
    g.rect(0, CAP, SIZE, SIZE - CAP);
    g.clip();
    pool(s, x, y - lift, K);
    shadow(x, y, K);
    const d = s.density ?? 1;
    t.draw(g, x, y - lift, false, K * d);
    g.drawImage(s.img, Math.round(x - s.ax * d * K), Math.round(y - lift - s.ay * d * K), s.w * d * K, s.h * d * K);
    t.draw(g, x, y - lift, true, K * d);
    lights(s, x, y - lift, K);
    g.restore();
  };
  /** Stand-ins for what the game draws for an attack besides the figure (an arrow, a wave, an orb, a beam), in the enemy's pink, painted in picture pixels. */
  const fx = new Px(Math.ceil(SIZE / K), Math.ceil(SIZE / K));
  const fxClear = (): void => {
    fx.d.fill(0);
  };
  const fxDraw = (): void => {
    g.drawImage(fx.toCanvas(), 0, 0, fx.w * K, fx.h * K);
  };
  /** A point of the stage in picture pixels from the reflection's feet. */
  const P = (x: number, y: number): [number, number] => [Math.round(FX / K + x), Math.round(FY / K + y)];
  const PINK = ['#7a1058', '#c0206a', '#ff4f8a', '#ff8ab4', '#ffc0d6', '#ffffff'];
  const facing = (view: GameView): [number, number] => (view === 'front' ? [2 / Math.sqrt(5), 1 / Math.sqrt(5)] : [2 / Math.sqrt(5), -1 / Math.sqrt(5)]);
  /** Where a point of a move's figure is, on the stage, from its feet (its bones, projected as its painter does). */
  const onFigure = (move: (typeof MOVES3)[string], t: number, view: GameView, at: (s: ReturnType<typeof solve>, q: ReturnType<typeof bonesAt>) => readonly [number, number, number]): [number, number] => {
    const q = bonesAt(move.motion.keys, move.rest, t);
    const s = solve(move.build, q);
    const st = stage(view);
    const [x, y] = st.at(at(s, q));
    return [x - CANVAS3.ax, y - CANVAS3.ay];
  };
  /** An arrow of glass with a pink head, flying, a streak of pink behind it. */
  const arrow = (x: number, y: number, ux: number, uy: number): void => {
    for (let i = 0; i < 26; i++) {
      const c = i < 2 ? PINK[5] : i < 4 ? PINK[3] : i < 12 ? '#cdd2e6' : i % 2 === 0 ? PINK[2] : PINK[1];
      if (i >= 12 && i > 12 + hash(Math.round(x), Math.round(y), i) * 14) continue;
      fx.set(Math.round(x - ux * i), Math.round(y - uy * i), c);
    }
  };
  /** A wave of pink force running out along the floor, `r` tiles out from (x, y) the way the figure faces: a crest standing on a wall of its own light, its body streaming back behind it. */
  const wave = (x: number, y: number, view: GameView, r: number, SPAN = 0.6): void => {
    // (the way it faces, on the floor: its x from in front, its -y from behind; a tile on the picture is 32 across and 16 down per step of x)
    const [fx0, fy0] = view === 'front' ? [1, 0] : [0, -1];
    for (let a = -SPAN; a <= SPAN; a += 0.01) {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const wx = fx0 * ca - fy0 * sa;
      const wy = fy0 * ca + fx0 * sa;
      const mid = SPAN > 3 ? 0.6 : 1 - Math.abs(a) / SPAN;
      for (let b = 0; b < 7; b++) {
        const rr = r - b * 0.07;
        if (rr <= 0.1) continue;
        const px = Math.round(x + (wx - wy) * 32 * rr);
        const py = Math.round(y + (wx + wy) * 16 * rr);
        const up = b === 0 ? 3 + Math.round(9 * mid) : b === 1 ? 2 + Math.round(4 * mid) : 1;
        for (let h = 0; h < up; h++) fx.set(px, py - h, b === 0 ? (h >= up - 1 ? PINK[5] : h > up * 0.6 ? PINK[4] : PINK[3]) : b < 3 ? PINK[2] : b < 5 ? PINK[1] : PINK[0]);
      }
    }
  };
  /** THE GAME'S OWN ORB (art/spells.ts, the mage's untyped one), its violet turned to the enemy's pink, turning. */
  const ORB_TO: Record<string, string> = { '#3a1a7a': '#7a1058', '#7a3ae0': '#e0287a', '#b890ff': '#ff8ab4', '#ffffff': '#ffffff' };
  const orbs = makeSpellArt().orb.phys.map((sp) => {
    const c = document.createElement('canvas');
    c.width = sp.img.width;
    c.height = sp.img.height;
    const cg = c.getContext('2d') as CanvasRenderingContext2D;
    cg.drawImage(sp.img, 0, 0);
    const im = cg.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < im.data.length; i += 4) {
      if (im.data[i + 3] === 0) continue;
      const hex = '#' + [0, 1, 2].map((j) => im.data[i + j].toString(16).padStart(2, '0')).join('');
      const to = ORB_TO[hex] ?? asEnemy(hex);
      const [r, gg, b] = [1, 3, 5].map((j) => parseInt(to.slice(j, j + 2), 16));
      im.data[i] = r;
      im.data[i + 1] = gg;
      im.data[i + 2] = b;
    }
    cg.putImageData(im, 0, 0);
    return { c, ax: sp.ax * (sp.density ?? 1), ay: sp.ay * (sp.density ?? 1) };
  });
  /** It set down `t` seconds ago at (x, y) on the stage (picture pixels), floating a little over the floor. */
  const orb = (x: number, y: number, t: number): void => {
    const o = orbs[Math.floor(t * 12) % orbs.length];
    g.drawImage(o.c, Math.round((x - o.ax) * K), Math.round((y - 16 - o.ay) * K), o.c.width * K, o.c.height * K);
  };
  /** A beam of pink force from (x, y) along (ux, uy). */
  const beam = (x: number, y: number, ux: number, uy: number, t: number): void => {
    const flick = Math.floor(t * 30) % 2;
    for (let i = 0; i < 180; i++) {
      for (let w = -2; w <= 2; w++) {
        const c = Math.abs(w) === 0 ? PINK[5] : Math.abs(w) === 1 ? PINK[3] : PINK[flick ? 2 : 1];
        fx.set(Math.round(x + ux * i - uy * w), Math.round(y + uy * i + ux * w), c);
      }
    }
  };
  /** Words over the film. */
  const caption = (s: Shot, t: number): void => {
    g.fillStyle = '#0d0b1a';
    g.fillRect(0, 0, SIZE, CAP);
    text(s.who, 30, 42, 40, '#ffd866', 800);
    text(s.what, 30, 94, 34, '#ffffff', 600);
    if (s.view) text(s.view === 'front' ? 'from in front' : 'from behind', SIZE - 30, 42, 28, '#ffb0cc', 600, 'right');
    text('Mock-up: not in the game', SIZE - 30, 128, 20, '#8a84b0', 500, 'right');
    void t;
  };

  const clipShot = (who: string, what: string, view: GameView, key: string, move: (typeof MOVES3)[string], long: number, extra?: (t: number) => void, opts: { slow?: number; lift?: (t: number) => number; loop?: boolean } = {}): void => {
    shots.push({
      long,
      who,
      what,
      view,
      draw: (t) => {
        ground(view, 0);
        const keys = move.motion.keys;
        const end = keys[keys.length - 1].at;
        let at = t / (opts.slow ?? 1);
        if (opts.loop) at = at % end;
        else at = Math.min(end, at);
        fxClear();
        glassAt(key, reflectionSprite(move, at, view), FX, FY, opts.lift ? opts.lift(at) * K : 0);
        if (extra) extra(at);
        fxDraw();
      },
    });
  };

  for (const { cls, name } of CLASSES) {
    const who = `${name}'S REFLECTION`;
    const plan = PLANS[cls].dungeon;
    const stand = MOVES3[plan.idle];
    const run = MOVES3[plan.walk];
    const reel = MOVES3[plan.reel ?? plan.idle];
    const hero = heroes.of(cls, { twoHanded: true });
    // (a title card)
    shots.push({
      long: 1.0,
      who,
      what: 'a glass copy of your own hero',
      view: null,
      draw: () => {
        ground('front', 0);
        figure(hero.front.idle[0], 300, 820, K, false);
        glassAt(`${cls}:card`, reflections.of(cls).front.idle[2], 780, 820);
        text('you', 300, 880, 34, '#a8f0ff', 700, 'center');
        text('your reflection', 780, 880, 34, '#ffb0cc', 700, 'center');
      },
    });
    for (const view of ['front', 'back'] as GameView[]) {
      const key = `${cls}:${view}`;
      if (view === 'front') {
        // STEPPING OUT OF A MIRROR, you standing by
        const mirror = mirrorPainted(STEP_CANVAS.w, STEP_CANVAS.h, STEP_MIRROR[0], STEP_MIRROR[1]).toCanvas();
        shots.push({
          long: STEP_OUT.time,
          who,
          what: 'steps out of a mirror',
          view,
          draw: (t) => {
            ground('front', 0);
            const ox = FX - STEP_CANVAS.ax * K;
            const oy = FY - STEP_CANVAS.ay * K;
            g.save();
            g.beginPath();
            g.rect(0, CAP, SIZE, SIZE - CAP);
            g.clip();
            g.drawImage(mirror, ox, oy, STEP_CANVAS.w * K, STEP_CANVAS.h * K);
            figure(hero.front.idle[Math.floor(t * 10) % hero.front.idle.length], 160, 1025, K, false, tailsOf(hero.front.idle[0], false));
            const at = steppingAt(cls, t);
            if (t >= STEP_OUT.until) shadow(FX + (at.x - STEP_CANVAS.ax) * K, FY + (at.y - STEP_CANVAS.ay) * K, K);
            paint(stepOutPainted(cls, t), STEP_CANVAS.ax, STEP_CANVAS.ay, FX, FY, K);
            g.restore();
          },
        });
        // standing: the sheen runs over it
        clipShot(who, 'stands: light runs over the glass', view, key, stand, 1.2, undefined, { loop: true });
      }
      // RUNNING (the floor slides by under it, as fast as you run)
      {
        const long = view === 'front' ? 1.0 : 0.8;
        const keys = run.motion.keys;
        const end = keys[keys.length - 1].at;
        const from = run.motion.loop ?? 0;
        shots.push({
          long,
          who,
          what: 'runs as fast as you',
          view,
          draw: (t) => {
            slide = t * 4.6 * 35.8;
            ground(view, slide);
            const at = from + ((t % (end - from)) + (end - from)) % (end - from);
            glassAt(key, reflectionSprite(run, at, view));
          },
        });
      }
      // ITS ATTACKS: the hero's own, each with what the game draws for it in the enemy's pink
      const [ux, uy] = facing(view);
      if (cls === 'warrior') {
        clipShot(who, 'Strike, your attack', view, key, MOVES3.strike, MOVES3.strike.motion.keys[MOVES3.strike.motion.keys.length - 1].at);
        clipShot(who, 'Strike, the second swing', view, key, MOVES3.kslash, 0.47);
        clipShot(who, 'Slam', view, key, MOVES3.slam, 0.6);
        if (view === 'front') {
          clipShot(who, 'Whirlwind', view, key, MOVES3.whirl, 0.8, undefined, { loop: true });
          const th = MOVES3.kthrust;
          const until = th.arc ? th.arc.until : 0.5;
          clipShot(who, 'Lunge, the diving thrust', view, key, th, 0.9, undefined, { lift: (t) => (t < until ? (th.arc?.high ?? 10) * 4 * (t / until) * (1 - t / until) : 0) });
        }
      } else if (cls === 'ranger') {
        const shot = MOVES3.shot;
        const hit = shot.motion.hit ?? 0.17;
        clipShot(who, 'Shot, your attack', view, key, shot, 0.75, (t) => {
          if (t < hit) return;
          const [x, y] = onFigure(shot, hit, view, (s, q) => add(s.handR, mul(heading(q.wAz, q.wEl), 0.43 * shot.build.tall)));
          const d = (t - hit) * 16 * 35.8;
          const [sx, sy] = P(x, y);
          arrow(sx + ux * d, sy + uy * d * 0.9, ux, uy * 0.9);
        });
        const vol = MOVES3.volley;
        const vhit = vol.motion.hit ?? 0.2;
        clipShot(who, 'Volley', view, key, vol, 0.75, (t) => {
          if (t < vhit) return;
          const [x, y] = onFigure(vol, vhit, view, (s, q) => add(s.handR, mul(heading(q.wAz, q.wEl), 0.43 * vol.build.tall)));
          for (let i = -1; i <= 1; i++) {
            const d = (t - vhit) * 16 * 35.8;
            const [sx, sy] = P(x, y);
            arrow(sx + ux * d * 0.6 + i * 4, sy - d * 0.9 + Math.abs(i) * 3, 0.3 + i * 0.15, -0.95);
          }
        });
        if (view === 'front') clipShot(who, 'Roll', view, key, MOVES3.roll, 0.68);
      } else {
        const wv = MOVES3.wave;
        const whit = wv.motion.hit ?? 0.17;
        clipShot(who, 'Wave, your attack', view, key, wv, 0.75, (t) => {
          if (t < whit) return;
          wave(...P(0, 0), view, 0.5 + (t - whit) * 9);
        });
        const ob = MOVES3.orb;
        const ohit = ob.motion.hit ?? 0.27;
        clipShot(who, 'Orb', view, key, ob, 1.0, (t) => {
          if (t < ohit) return;
          orb(...P(64, view === 'front' ? 32 : -32), t - ohit);
        });
        if (view === 'front') {
          const bm = MOVES3.beam;
          clipShot(who, 'Beam, held', view, key, bm, 1.0, (t) => {
            const [x, y] = onFigure(bm, t, view, (s) => add(s.handR, mul(s.point, STAFF_UP)));
            beam(...P(x, y), ux, uy * 0.5, t);
          }, { loop: true });
          clipShot(who, 'Beam, let go', view, key, MOVES3.beamend, 0.3);
        }
      }
      // STRUCK: chips of glass fly off it
      clipShot(who, 'struck: chips of glass fly off it', view, key, reel, 0.5, (t) => {
        const [x, y] = P(-4, -36);
        chipsPainted(fx, x, y, t, -1);
      }, { slow: 1.5 });
      // SHATTERS
      const source = shatterFrom(cls, view);
      shots.push({
        long: SHATTER.time + 0.3,
        who,
        what: 'shatters: the shards fall and fade',
        view,
        draw: (t) => {
          ground(view, 0);
          g.save();
          g.beginPath();
          g.rect(0, CAP, SIZE, SIZE - CAP);
          g.clip();
          paint(shatterPainted(source, Math.min(1, t / SHATTER.time)), SHATTER_CANVAS.ax, SHATTER_CANVAS.ay, FX, FY, K);
          g.restore();
        },
      });
    }
  }
  // (frame by frame)
  const starts: number[] = [];
  let total = 0;
  for (const s of shots) {
    starts.push(total);
    total += Math.round(s.long * FPS);
  }
  const w = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string; __shots: string[] };
  w.__frames = total;
  w.__tickMs = 1000 / FPS;
  w.__shots = shots.map((s, i) => `${starts[i]} ${s.who}: ${s.what} (${s.view ?? ''})`);
  w.__frame = (k: number): string => {
    let i = shots.length - 1;
    while (i > 0 && starts[i] > k) i--;
    const s = shots[i];
    const t = (k - starts[i]) / FPS;
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#07050e';
    g.fillRect(0, 0, SIZE, SIZE);
    s.draw(t);
    caption(s, t);
    return cv.toDataURL('image/png');
  };
  // (`film:<k>`: that frame, drawn at once, to look at)
  if (a1 !== '' && !Number.isNaN(Number(a1)) && mode === 'film' && location.hash.includes(':')) w.__frame(Number(a1));
  void slide;
}
void PLANS;
void REFLECTION_POOL;
void GALLERY_MIRROR;
void asEnemy;
void reflectionPainted;
void BOW_HALF;
(window as unknown as { __ready: boolean }).__ready = true;
