// Dev page: FLOOR 18'S LADIES-IN-WAITING (art/gallery_ladies.ts, art/gallery_ladies_moves.ts, art/gallery_ladies_fx.ts),
// standing, from in front and from behind, beside the knight for size; a crowd of them at the game's size; a move close up;
// and THE FILM, every move at the scale of a boss arena with the knight in it, captioned, frame by frame. The floor under
// them is a stand-in (polished dark stone, its tiles drawn so that they can be counted), not the Glass Gallery's own.
// Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_gallery_ladies.ts shots/ladies/sheet.png 1200 600 "sheet"
//   ... 960 540 "crowd" (at the game's size: a phone's whole view of the game is 480 by 270 game pixels)
//   ... "big:<move>:<t>" (front and behind, four times as big); "grid:<move>:<t>,<t>,..." (both ways, twice as big)
//   frames of the film: node tools/page_gif.mjs src/dev/preview_gallery_ladies.ts "film" <out.gif>
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob, TILE3 } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { GALLERY_LADY, LD_DIES, LD_FLASH, LD_GLIDE, LD_GLIDES, LD_PACE, LD_REEL } from '../art/gallery_ladies_moves';
import { FLASH_CANVAS, FLASH_FX, flashPainted } from '../art/gallery_ladies_fx';
import { GRID } from '../art/skeleton';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = mode === 'film' ? 1280 : mode === 'change' ? 1200 : window.innerWidth;
cv.height = mode === 'film' ? 720 : mode === 'change' ? 676 : window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
const MOB: Mob = GALLERY_LADY;

// =============================================================================================
// THE FLOOR: a stand-in, polished dark stone in the gallery's colours, each tile a diamond you can count

/** Where a point of the floor (the figures' own lengths: +x down the screen to the right, +y up it to the right) is, in picture pixels from the origin. */
const iso = (wx: number, wy: number): [number, number] => [GRID * (wx + wy), GRID * 0.5 * (wx - wy)];
function floorCanvas(w: number, h: number, ox: number, oy: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  const img = ctx.createImageData(w, h);
  const T = TILE3;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = (x + 0.5 - ox) / GRID;
      const sy = (2 * (y + 0.5 - oy)) / GRID;
      const wx = (sx + sy) / 2;
      const wy = (sx - sy) / 2;
      const i = Math.floor(wx / T);
      const j = Math.floor(wy / T);
      const fx = wx / T - i;
      const fy = wy / T - j;
      const edge = Math.min(fx, fy, 1 - fx, 1 - fy);
      const dark = (i + j) % 2 === 0;
      let col = dark ? [26, 22, 38] : [33, 29, 48];
      // (a sheen across each tile from the upper left, and an inlaid silver line round it)
      if (fx < 0.5 && fy > 0.5 && fx - fy > -0.9 && ((x + y) & 3) === 0) col = dark ? [32, 28, 46] : [40, 36, 56];
      if (edge < 0.035) col = [58, 56, 76];
      else if (edge < 0.07) col = [20, 17, 30];
      const k = (y * w + x) * 4;
      img.data[k] = col[0];
      img.data[k + 1] = col[1];
      img.data[k + 2] = col[2];
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
function draw(s: Sprite, x: number, y: number, k: number, flip = false): void {
  const d = s.density ?? 1;
  if (!flip) {
    g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
    return;
  }
  g.save();
  g.translate(Math.round(x), 0);
  g.scale(-1, 1);
  g.drawImage(s.img, Math.round(-s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
  g.restore();
}
const spOf = (which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(MOB, t / MOB.dieTime, view), null, canvasOf(MOB).ax, canvasOf(MOB).ay) : toSprite(paintMob(MOB, which, t, view), MOB.aura, canvasOf(MOB).ax, canvasOf(MOB).ay);
const SP = new Map<string, Sprite>();
/** A frame of hers, kept once painted (the film asks for the same frames many times). */
function sp(which: string, t: number, view: GameView): Sprite {
  const key = `${which}:${view}:${t.toFixed(4)}`;
  let s = SP.get(key);
  if (!s) SP.set(key, (s = spOf(which, t, view)));
  return s;
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
/** The light on the floor at `t` seconds from her blow, as a picture with its anchor at her feet. */
function floorLight(t: number, view: GameView): Sprite | null {
  const p = flashPainted(t, view);
  let any = false;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) { any = true; break; }
  if (!any) return null;
  return p.px.sprite(FLASH_CANVAS.ax, FLASH_CANVAS.ay, 1);
}
/** The game's lights over the dark, softly (as the game lays them): a figure's own and its aura. */
function lightsOf(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const l of s.lights ?? []) {
    const cx = x + (l.x - s.ax) * d * k;
    const cy = y + (l.y - s.ay) * d * k;
    const r = l.r * d * k;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, hexA(l.color, (l.a ?? 0.4) * 0.55));
    gr.addColorStop(1, hexA(l.color, 0));
    g.fillStyle = gr;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  g.restore();
}
function hexA(c: string, a: number): string {
  const v = parseInt(c.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
function caption(text: string, sub = ''): void {
  g.fillStyle = 'rgba(8,6,14,0.82)';
  g.fillRect(0, 0, cv.width, sub ? 78 : 50);
  g.fillStyle = '#ece8f4';
  g.font = 'bold 26px sans-serif';
  g.fillText(text, 18, 34);
  if (sub) {
    g.fillStyle = '#b8b2c8';
    g.font = '20px sans-serif';
    g.fillText(sub, 18, 64);
  }
}

if (mode === 'sheet') {
  // THE SHEET: a lady-in-waiting from in front and from behind beside the knight, three times as big
  const K = 3;
  const F = floorCanvas(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 40, 60);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  const y = cv.height - 36;
  draw(hero.front.idle[0], 140, y, K);
  draw(sp('stand', 0, 'front'), 430, y, K);
  draw(sp('stand', 0, 'back'), 720, y, K);
  draw(hero.back.idle[0], 1000, y, K);
  caption('Ladies-in-waiting, floor 18: from in front and from behind', 'beside the knight, three times the game\'s size');
} else if (mode === 'crowd') {
  // AT THE GAME'S SIZE: a phone's whole view of the game (480 by 270 game pixels); a neat line of them gliding at the knight,
  // three standing at their mirrors, and one throwing her light
  const F = floorCanvas(cv.width, cv.height, 120, 200);
  g.drawImage(F, 0, 0);
  const O: [number, number] = [120, 200];
  const at = (wx: number, wy: number): [number, number] => {
    const [x, y] = iso(wx * TILE3, wy * TILE3);
    return [O[0] + x, O[1] + y];
  };
  const figs: { x: number; y: number; s: Sprite; flip?: boolean; light?: Sprite }[] = [];
  // the knight, facing them
  {
    const [x, y] = at(9.0, 1.0);
    figs.push({ x, y, s: hero.back.idle[0], flip: true });
  }
  // the line, gliding at him (down the screen to the right: in front)
  for (let i = 0; i < 5; i++) {
    const [x, y] = at(1.5, -2.2 + i * 1.25);
    figs.push({ x, y, s: sp('walk', ((i * 3) % LD_GLIDE.frames) / LD_GLIDE.fps, 'front') });
  }
  // three at their mirrors, further off
  for (const [wx, wy, t] of [[3.8, 5.6, 0.3], [5.2, 6.8, 1.2], [2.6, 7.4, 2.0]] as const) {
    const [x, y] = at(wx, wy);
    figs.push({ x, y, s: sp('stand', t, 'front'), flip: true });
  }
  // and one throwing her light at him
  {
    const [x, y] = at(5.0, 1.0);
    const t = LD_FLASH.hit + 2 / 30;
    figs.push({ x, y, s: sp('attack', t, 'front'), light: floorLight(t - LD_FLASH.hit, 'front') ?? undefined });
  }
  for (const f of figs) if (f.light) draw(f.light, f.x, f.y, 1);
  figs.sort((a, b) => a.y - b.y);
  for (const f of figs) draw(f.s, f.x, f.y, 1, f.flip);
  for (const f of figs) lightsOf(f.s, f.x, f.y, 1);
} else if (mode === 'big') {
  const K = 4;
  const F = floorCanvas(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 20, 40);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  const t = Number(a2) || 0;
  draw(sp(a1, t, 'front'), cv.width * 0.18, cv.height - 330, K);
  draw(sp(a1, t, 'back'), cv.width * 0.62, cv.height - 120, K);
} else if (mode === 'flash') {
  // HER FLASH AT FOUR MOMENTS (`flash:<front|back>`), twice the game's size, each with its light on the floor and the knight
  // in the beam: the warning held, the strike, the blow and the beam, the beam breaking up
  const view: GameView = a1 === 'back' ? 'back' : 'front';
  const K = 2;
  const PW = cv.width / 2;
  const PH = cv.height / 2;
  const moments: [number, string][] = [[0.5, 'the warning, held: the glint building'], [LD_FLASH.strike[0] + 1 / 30, 'the strike: two frames, smeared'], [LD_FLASH.hit, 'the blow: the beam thrown'], [LD_FLASH.hit + 0.3, 'the beam breaking up']];
  moments.forEach(([t, label], i) => {
    const x0 = (i % 2) * PW;
    const y0 = Math.floor(i / 2) * PH;
    g.save();
    g.beginPath();
    g.rect(x0, y0, PW, PH);
    g.clip();
    const ox = x0 + (view === 'front' ? 150 : 140);
    const oy = y0 + (view === 'front' ? 196 : 336);
    const F = floorCanvas(Math.ceil(PW / K), Math.ceil(PH / K), (ox - x0) / K, (oy - y0) / K);
    g.drawImage(F, x0, y0, F.width * K, F.height * K);
    const L = floorLight(t - LD_FLASH.hit, view);
    if (L) draw(L, ox, oy, K);
    const s = sp('attack', t, view);
    // (the knight three and a half tiles off, in the beam's way)
    const [kx, ky] = iso(3.5 * TILE3, 0);
    const knightAt: [number, number] = view === 'front' ? [ox + kx * K, oy + ky * K] : [ox + kx * K, oy - ky * K];
    const kn = view === 'front' ? hero.back.idle[0] : hero.front.idle[0];
    const figs = [{ x: ox, y: oy, s, flip: false }, { x: knightAt[0], y: knightAt[1], s: kn, flip: true }].sort((a, b) => a.y - b.y);
    for (const f of figs) draw(f.s, f.x, f.y, K, f.flip);
    lightsOf(s, ox, oy, K);
    g.fillStyle = 'rgba(8,6,14,0.8)';
    g.fillRect(x0, y0, PW, 34);
    g.fillStyle = '#ece8f4';
    g.font = 'bold 20px sans-serif';
    g.fillText(`${i + 1}. ${label}`, x0 + 12, y0 + 24);
    g.restore();
  });
  g.fillStyle = '#08060e';
  g.fillRect(PW - 1, 0, 2, cv.height);
  g.fillRect(0, PH - 1, cv.width, 2);
} else if (mode === 'close') {
  // CLOSE UP (`close:<move>:<t>`): her upper body, ten times as big, from in front (left) and from behind (right)
  const K = 10;
  g.fillStyle = '#1c1828';
  g.fillRect(0, 0, cv.width, cv.height);
  const t = Number(a2) || 0;
  draw(sp(a1, t, 'front'), cv.width * 0.25, cv.height + 60, K);
  draw(sp(a1, t, 'back'), cv.width * 0.72, cv.height + 60, K);
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS (`grid:<move>:<t>,<t>,...`), twice as big: from in front along the top, from behind below
  const K = 2;
  const F = floorCanvas(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 20, 40);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - (row === 0 ? 140 : 40);
      draw(sp(a1, t, view), w * i + 50, y, K);
      g.fillStyle = '#ffffff';
      g.font = '14px monospace';
      g.fillText(`${t.toFixed(3)} s`, w * i + 6, (cv.height / 2) * row + 18);
    }
  });
} else if (mode === 'film') {
  // THE FILM: 1280 by 720, every move at the scale of a boss arena (twice the game's size, so that it reads on a phone),
  // the knight in it for size, captioned; each strike again at half speed
  const K = 2;
  const W = cv.width;
  const Hh = cv.height;
  const O: [number, number] = [W / 2 - 120, Hh / 2 + 40];
  const F = floorCanvas(Math.ceil(W / K), Math.ceil(Hh / K), O[0] / K, O[1] / K);
  /** A point of the arena's floor, in tiles: across the screen down to the right (+x), up to the right (+y). */
  const at = (wx: number, wy: number): [number, number] => {
    const [x, y] = iso(wx * TILE3, wy * TILE3);
    return [O[0] + x * K, O[1] + y * K];
  };
  interface Fig { x: number; y: number; s: Sprite; flip?: boolean; light?: Sprite | null }
  /** The knight, facing the eye (down to the right), or up to the left, or down to the left (the game's pictures turned over). */
  const knight = (wx: number, wy: number, faces: 'eye' | 'upleft' | 'downleft', i = 0): Fig => {
    const [x, y] = at(wx, wy);
    const set = faces === 'upleft' ? hero.back : hero.front;
    return { x, y, s: set.idle[Math.floor(i / 3) % set.idle.length], flip: faces !== 'eye' };
  };
  /** A lady at a moment of a move, from in front (facing down to the right, +x) or from behind (up to the right, +y). */
  const lady = (wx: number, wy: number, move: string, t: number, view: GameView): Fig => {
    const [x, y] = at(wx, wy);
    const atk = move === 'attack';
    return { x, y, s: sp(move, t, view), light: atk ? floorLight(t - LD_FLASH.hit, view) : null };
  };
  const scene = (figs: Fig[], cap: string, sub: string): void => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, Hh);
    g.drawImage(F, 0, 0, F.width * K, F.height * K);
    for (const f of figs) if (f.light) draw(f.light, f.x, f.y, K);
    const sorted = [...figs].sort((a, b) => a.y - b.y);
    for (const f of sorted) draw(f.s, f.x, f.y, K, f.flip);
    for (const f of sorted) lightsOf(f.s, f.x, f.y, K);
    caption(cap, sub);
  };
  const idleAt = (t: number): number => (Math.floor(t * 10) % 24) / 10;
  const walkAt = (t: number): number => (Math.floor(t * LD_GLIDE.fps) % LD_GLIDE.frames) / LD_GLIDE.fps;
  const FPS = 30;
  type Seg = { n: number; f: (i: number) => void };
  const segs: Seg[] = [];
  const add = (seconds: number, f: (t: number, i: number) => void): void => {
    const n = Math.round(seconds * FPS);
    segs.push({ n, f: (i) => f(i / FPS, i) });
  };
  // A move played whole: before it, standing for `pre`; after, standing for `post`
  const played = (move: string, long: number, pre: number, post: number) => (t: number): [string, number] => {
    if (t < pre) return ['stand', idleAt(t)];
    if (t < pre + long) return [move, Math.floor((t - pre) * FPS) / FPS];
    if (move === 'dying') return ['dying', long];
    return ['stand', idleAt(t - pre - long)];
  };
  // 1. STANDING, both ways round, the knight between
  add(3.0, (t, i) => {
    scene([lady(-2.2, -2.2, 'stand', idleAt(t), 'front'), knight(0, 0, 'eye', i), lady(2.4, 2.4, 'stand', idleAt(t + 0.7), 'back')], 'Standing: the mirror held up to her face', 'she breathes, her lips move on no sound, the grey breath leaks out');
  });
  // 2. THE GLIDE, in front: a neat line of four at the knight
  add(2.6, (t) => {
    const figs: Fig[] = [knight(5.6, 1.0, 'upleft')];
    for (let j = 0; j < 4; j++) figs.push(lady(-4.6 + LD_PACE * t, -1.6 + j * 1.15, 'walk', walkAt(t + j * 0.05), 'front'));
    scene(figs, `The glide: ${LD_PACE} tiles a second, in a neat line`, 'quick small steps under the hem, the skirts sweeping (the knight walks 2.5)');
  });
  // 3. THE GLIDE, from behind
  add(2.2, (t) => {
    const figs: Fig[] = [knight(0.6, 4.8, 'downleft')];
    for (let j = 0; j < 4; j++) figs.push(lady(-2.8 + j * 1.15, -4.6 + LD_PACE * t, 'walk', walkAt(t + j * 0.05), 'back'));
    scene(figs, 'The glide, from behind', 'the high lace collars, the hair pinned up');
  });
  // 5. THE FLASH, in front and from behind, at full speed
  for (const view of ['front', 'back'] as const) {
    const p = played('attack', LD_FLASH.long, 0.4, 0.5);
    add(LD_FLASH.long + 0.9, (t) => {
      const [m, u] = p(t);
      const f = view === 'front' ? lady(-2.6, 0.2, m, u, 'front') : lady(0.2, -2.6, m, u, 'back');
      if (m === 'stand' && t > 0.4) f.light = null;
      scene([f, view === 'front' ? knight(1.2, 0.3, 'upleft') : knight(0.3, 1.2, 'downleft')], `The mirror flash${view === 'back' ? ', from behind' : ''}`, `held wind-up, the glint building; a two-frame strike; the beam ${FLASH_FX.reach / TILE3} tiles long, ${FLASH_FX.wide / TILE3} wide`);
    });
  }
  // 6. THE STRIKE AGAIN AT HALF SPEED, both ways
  for (const view of ['front', 'back'] as const) {
    const from = LD_FLASH.warn[1] - 0.2;
    const to = LD_FLASH.hit + 0.45;
    add((to - from) * 2, (t) => {
      const u = from + Math.floor((t / 2) * FPS) / FPS;
      const f = view === 'front' ? lady(-2.6, 0.2, 'attack', u, 'front') : lady(0.2, -2.6, 'attack', u, 'back');
      scene([f, view === 'front' ? knight(1.2, 0.3, 'upleft') : knight(0.3, 1.2, 'downleft')], `The strike again, at half speed${view === 'back' ? ', from behind' : ''}`, 'the hips come round first; the mirror whipped down in two frames, smeared; the light thrown');
    });
  }
  // 7. IN A CROWD: the glide and the flash as the game would play them, a line of three (their dart is no more: 30 Oct)
  {
    const g0 = 0.9;
    add(g0 + LD_FLASH.long + 0.4, (t) => {
      const figs: Fig[] = [knight(4.2, 0.2, 'upleft')];
      for (let j = 0; j < 3; j++) {
        const lag = j * 0.12;
        const tt = Math.max(0, t - lag);
        const wy = -1.4 + j * 1.3;
        if (tt < g0) figs.push(lady(-4.6 + LD_PACE * tt, wy, 'walk', walkAt(tt), 'front'));
        else figs.push(lady(-4.6 + LD_PACE * g0, wy, 'attack', Math.min(LD_FLASH.long, Math.floor((tt - g0) * FPS) / FPS), 'front'));
      }
      scene(figs, 'In a crowd: glide, flash', 'three of them at the knight, as the game would play them');
    });
  }
  // 8. STRUCK, both ways
  add(1.6, (t) => {
    const u = t % 0.8;
    const m = u < LD_REEL ? 'reel' : 'stand';
    const v = u < LD_REEL ? Math.floor(u * FPS) / FPS : idleAt(u);
    scene([lady(-2.2, -2.2, m, v, 'front'), knight(0, 0, 'eye'), lady(2.4, 2.4, m, v, 'back')], 'Struck', 'jolted back, the mirror jerked up, the Hush coughed out');
  });
  // 9. HER DEATH, both ways: the mirror cracks, the Hush leaves her, she sinks to the floor
  add(LD_DIES.long + 1.2, (t) => {
    const p = played('dying', LD_DIES.long, 0.3, 0.9);
    const [m, u] = p(t);
    scene([lady(-2.2, -2.2, m, u, 'front'), knight(0, 0, 'eye'), lady(2.4, 2.4, m, u, 'back')], 'The mirror cracks, the Hush leaves her', 'she sinks to the floor in her skirts: alive, a woman again');
  });
  const starts: number[] = [];
  let n = 0;
  for (const s of segs) {
    starts.push(n);
    n += s.n;
  }
  const w = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
  w.__frames = n;
  w.__tickMs = 1000 / FPS;
  w.__frame = (k: number): string => {
    let j = 0;
    while (j < segs.length - 1 && k >= starts[j + 1]) j++;
    segs[j].f(k - starts[j]);
    return cv.toDataURL('image/png');
  };
  w.__frame(0);
} else if (mode === 'look') {
  // A CLOSE LOOK (`look:<move>:<t>`): from in front (left) and from behind (right), eight times the game's size, on the floor
  const K = Number(a2.split(',')[1] ?? '') || 8;
  const t = Number(a2.split(',')[0]) || 0;
  const F = floorCanvas(Math.ceil(cv.width / K), Math.ceil(cv.height / K), 0, 0);
  g.drawImage(F, 0, 0, F.width * K, F.height * K);
  for (const [i, view] of [[0, 'front'], [1, 'back']] as const) {
    const s = sp(a1, t, view);
    const d = s.density ?? 1;
    // (the figure's box, centred in its half)
    const cx = cv.width * (0.25 + 0.5 * i) - (s.w * d * K) / 2 + s.ax * d * K;
    const cy = cv.height / 2 - (s.h * d * K) / 2 + s.ay * d * K;
    draw(s, cx, cy, K);
    lightsOf(s, cx, cy, K);
  }
  g.fillStyle = '#fff';
  g.font = '16px monospace';
  g.fillText(`${a1} @${t.toFixed(3)} s`, 10, 20);
} else if (mode === 'changesheet' || mode === 'change') {
  // THE TWO CHANGES OF 30 OCT: THEIR GLIDES AND THEIR FLASH FROM RANGE, AND THEIR SWOON. `changesheet`: the sheet;
  // `change`: the film's frames (1200 by 676), captioned
  /** A point of the floor, in tiles from (ox, oy) on the screen, `k` times the game's size: +x down the screen to the right, +y up it to the right. */
  const atK = (ox: number, oy: number, k: number, wx: number, wy: number): [number, number] => {
    const [x, y] = iso(wx * TILE3, wy * TILE3);
    return [ox + x * k, oy + y * k];
  };
  const floors = new Map<string, HTMLCanvasElement>();
  /** The floor over a box of the screen, `k` times the game's size, its tiles lined up on (ox, oy). */
  const ground = (x0: number, y0: number, w: number, h: number, k: number, ox: number, oy: number): void => {
    const key = `${w}x${h}@${k}:${((ox - x0) / k).toFixed(2)},${((oy - y0) / k).toFixed(2)}`;
    let f = floors.get(key);
    if (!f) floors.set(key, (f = floorCanvas(Math.ceil(w / k) + 1, Math.ceil(h / k) + 1, (ox - x0) / k, (oy - y0) / k)));
    g.save();
    g.beginPath();
    g.rect(x0, y0, w, h);
    g.clip();
    g.drawImage(f, x0, y0, f.width * k, f.height * k);
    g.restore();
  };
  interface Fig { x: number; y: number; s: Sprite; flip?: boolean; light?: Sprite | null }
  /** A lady at a moment of a move (a death at the game's own twenty frames a second). */
  const ladyFig = (x: number, y: number, move: string, t: number, view: GameView): Fig => {
    const tt = move === 'dying' ? Math.min(LD_DIES.long, Math.floor(t * 20 + 1e-6) / 20) : t;
    return { x, y, s: sp(move, tt, view), light: move === 'attack' ? floorLight(tt - LD_FLASH.hit, view) : null };
  };
  /** The knight: facing up the screen to the left (at them, from in front of them), or down to the left (from behind them); walking or standing. */
  const knightFig = (x: number, y: number, faces: 'upleft' | 'downleft', walking: number | null, i = 0): Fig => {
    const set = faces === 'upleft' ? hero.back : hero.front;
    const fr = walking !== null ? set.walk[Math.floor(walking * (set.walkFps ?? 8)) % set.walk.length] : set.idle[Math.floor(i / 3) % set.idle.length];
    return { x, y, s: fr, flip: true };
  };
  const layFigs = (figs: Fig[], k: number): void => {
    for (const f of figs) if (f.light) draw(f.light, f.x, f.y, k);
    const sorted = [...figs].sort((a, b) => a.y - b.y);
    for (const f of sorted) draw(f.s, f.x, f.y, k, f.flip);
    for (const f of sorted) lightsOf(f.s, f.x, f.y, k);
  };
  /** An arrow on the floor, from one point to another (tiles), `k` times the game's size. */
  const arrow = (ox: number, oy: number, k: number, from: [number, number], to: [number, number], color = 'rgba(236,232,244,0.75)'): void => {
    const [x0, y0] = atK(ox, oy, k, from[0], from[1]);
    const [x1, y1] = atK(ox, oy, k, to[0], to[1]);
    const a = Math.atan2(y1 - y0, x1 - x0);
    g.save();
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = Math.max(2, k * 1.2);
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1 - Math.cos(a) * 6 * k, y1 - Math.sin(a) * 6 * k);
    g.stroke();
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x1 - Math.cos(a - 0.45) * 9 * k, y1 - Math.sin(a - 0.45) * 9 * k);
    g.lineTo(x1 - Math.cos(a + 0.45) * 9 * k, y1 - Math.sin(a + 0.45) * 9 * k);
    g.closePath();
    g.fill();
    g.restore();
  };
  const label = (text: string, x: number, y: number, size = 17, color = '#ece8f4', bold = true): void => {
    g.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
    const w = g.measureText(text).width;
    g.fillStyle = 'rgba(8,6,14,0.78)';
    g.fillRect(x - 6, y - size - 2, w + 12, size + 10);
    g.fillStyle = color;
    g.fillText(text, x, y);
  };
  const GL = LD_GLIDES;
  const glideAt = (t: number): number => (Math.floor(t * LD_GLIDE.fps) % LD_GLIDE.frames) / LD_GLIDE.fps;
  const idleAt = (t: number): number => (Math.floor(t * 10) % 24) / 10;
  const reach = (FLASH_FX.reach / TILE3).toFixed(1);
  const wide = (FLASH_FX.wide / TILE3).toFixed(1);
  if (mode === 'changesheet') {
    g.fillStyle = '#0c0a14';
    g.fillRect(0, 0, cv.width, cv.height);
    const W = cv.width;
    label('The ladies-in-waiting: their glides, their flash from range, their swoon', 14, 32, 22);
    // ROW 1: THE GLIDES, all facing you; three times the game's size, from in front and from behind
    const r1 = 52;
    const rh1 = 300;
    const glides: [string, string, [number, number]][] = [
      ['walk', `forward, ${GL.walk.pace} tiles a second`, [1, 0]],
      ['glideLeft', `circling to her left, ${GL.glideLeft.pace}`, [0, 1]],
      ['glideRight', `circling to her right, ${GL.glideRight.pace}`, [0, -1]],
      ['glideBack', `backing away, ${GL.glideBack.pace}`, [-1, 0]],
    ];
    const cw = W / 4;
    /** Her way (her own) as the screen has it, from in front or from behind, in tiles of the front's floor. */
    const seenWay = (view: GameView, w: readonly [number, number]): [number, number] => (view === 'front' ? [w[0], w[1]] : [-w[1], w[0]]);
    glides.forEach(([move, what, way], i) => {
      const x0 = cw * i;
      const K = 2.2;
      const ox = x0 + cw * 0.27;
      const oy = r1 + rh1 - 50;
      ground(x0, r1, cw, rh1, K, ox, oy);
      const ox2 = x0 + cw * 0.7;
      const oy2 = r1 + rh1 - 95;
      for (const [x, y, view, t] of [[ox, oy, 'front', 2 / 30], [ox2, oy2, 'back', 5 / 30]] as const) {
        const w = seenWay(view, way);
        arrow(x, y, K, [w[0] * 0.5, w[1] * 0.5], [w[0] * 1.0, w[1] * 1.0]);
        layFigs([ladyFig(x, y, move, t, view)], K);
      }
      label(what, x0 + 10, r1 + 26, 15);
      g.fillStyle = '#0c0a14';
      g.fillRect(x0 + cw - 1, r1, 2, rh1);
    });
    label('Their glides, all facing you (in front, and from behind): no step shows, the hem skims the floor, the gown trails after them', 14, r1 + rh1 + 26, 15, '#cfc8de', false);
    // ROW 2: THE FLASH FROM RANGE: the held raise (three times the game's size), and the blow at the game's size, the knight in its light
    const r2 = r1 + rh1 + 40;
    const rh2 = 330;
    {
      const K = 2.6;
      const w0 = 300;
      const ox = 120;
      const oy = r2 + rh2 - 70;
      ground(0, r2, w0, rh2, K, ox, oy);
      layFigs([ladyFig(ox, oy, 'attack', 0.62, 'front')], K);
      label('the warning, held half a second', 10, r2 + 26, 15);
      label('the mirror raised, catching the light', 10, r2 + 50, 14, '#cfc8de', false);
      const K2 = 1.5;
      const ox2 = w0 + 90;
      const oy2 = r2 + 125;
      ground(w0, r2, W - w0, rh2, K2, ox2, oy2);
      const t = LD_FLASH.hit + 1 / 30;
      layFigs([ladyFig(ox2, oy2, 'attack', t, 'front'), (() => { const [x, y] = atK(ox2, oy2, K2, 6, 0); return knightFig(x, y, 'upleft', null); })()], K2);
      // (its reach marked along the floor, tile by tile)
      for (let i = 1; i <= Math.floor(FLASH_FX.reach / TILE3); i++) {
        const [x, y] = atK(ox2, oy2, K2, i, -(FLASH_FX.wide / TILE3) / 2 - 0.55);
        g.fillStyle = 'rgba(236,232,244,0.85)';
        g.font = 'bold 14px sans-serif';
        g.fillText(String(i), x - 4, y + 5);
      }
      label(`the flash, from range: ${reach} tiles long, ${wide} wide at its end`, w0 + 10, r2 + 26, 15);
      label('a strike of two frames; the knight six tiles off, in its light', w0 + 10, r2 + 50, 14, '#cfc8de', false);
      g.fillStyle = '#0c0a14';
      g.fillRect(w0 - 1, r2, 2, rh2);
    }
    // ROWS 3 AND 4: THE SWOON, eight moments from in front, three times the game's size
    const r3 = r2 + rh2 + 14;
    label('The swoon (from in front, three times the game\'s size)', 14, r3 + 22, 17);
    const keys: [number, string][] = [
      [LD_DIES.brow, 'a hand to her brow, swaying'],
      [LD_DIES.slip + 0.11, 'the mirror slips from her hand'],
      [Math.ceil(LD_DIES.land * 20) / 20, 'it lands and cracks'],
      [1.3, 'her knees give; sinking'],
      [LD_DIES.sit, 'down in a heap of gown'],
      [2.1, 'fainting back'],
      [2.45, 'the Hush leaves her'],
      [LD_DIES.long, 'still: alive'],
    ];
    const cw3 = W / 4;
    const ch3 = 290;
    keys.forEach(([t, what], i) => {
      const x0 = cw3 * (i % 4);
      const y0 = r3 + 34 + ch3 * Math.floor(i / 4);
      const K = 2.6;
      const ox = x0 + cw3 * 0.5;
      const oy = y0 + ch3 - 60;
      ground(x0, y0, cw3, ch3, K, ox, oy);
      layFigs([ladyFig(ox, oy, 'dying', t, 'front')], K);
      label(`${i + 1}. ${what}`, x0 + 10, y0 + 24, 14);
      g.fillStyle = '#0c0a14';
      g.fillRect(x0 + cw3 - 1, y0, 2, ch3);
      g.fillRect(x0, y0 + ch3 - 1, cw3, 2);
    });
  } else {
    // THE FILM
    const W = cv.width;
    const Hh = cv.height;
    const FPS = 30;
    const caption2 = (text: string, sub = ''): void => {
      g.fillStyle = 'rgba(8,6,14,0.82)';
      g.fillRect(0, 0, W, sub ? 70 : 46);
      g.fillStyle = '#ece8f4';
      g.font = 'bold 24px sans-serif';
      g.fillText(text, 16, 31);
      if (sub) {
        g.fillStyle = '#b8b2c8';
        g.font = '18px sans-serif';
        g.fillText(sub, 16, 58);
      }
    };
    type Seg = { n: number; f: (i: number) => void };
    const segs: Seg[] = [];
    const add = (seconds: number, f: (t: number, i: number) => void): void => {
      segs.push({ n: Math.round(seconds * FPS), f: (i) => f(i / FPS, i) });
    };
    /** The game's size: a phone's whole view across (480 game pixels in 1200). */
    const K1 = W / 960;
    const K3 = 3 * K1;
    // 1. IN A NEAT LINE: gliding at the knight; circling, still facing him; backing away as he comes on; one flashes from range
    {
      const ox = 330;
      const oy = 445;
      const T1 = 1.8;
      const T2 = T1 + 2.4;
      const T3 = T2 + 2.6;
      const T4 = T3 + LD_FLASH.long + 0.6;
      add(T4, (t, i) => {
        ground(0, 0, W, Hh, K1, ox, oy);
        // (where the line is, and how it goes)
        const fwd = Math.min(t, T1) * GL.walk.pace;
        const side = Math.max(0, Math.min(t, T2) - T1) * GL.glideLeft.pace;
        const back = Math.max(0, Math.min(t, T3) - T2) * GL.glideBack.pace;
        const lx = -3.4 + fwd - back;
        const ly = -3.0 + side;
        // (the knight: standing, then walking at them as they back away)
        const kn = Math.max(0, Math.min(t, T3) - T2) * 2.5;
        const [kx, ky] = atK(ox, oy, K1, -3.4 + GL.walk.pace * T1 + 6.0 - kn, 4.8);
        const figs: Fig[] = [knightFig(kx, ky, 'upleft', t > T2 && t < T3 ? t : null, i)];
        const move = t < T1 ? 'walk' : t < T2 ? 'glideLeft' : t < T3 ? 'glideBack' : 'stand';
        for (let j = 0; j < 4; j++) {
          const [x, y] = atK(ox, oy, K1, lx, ly + j * 1.1);
          if (move === 'stand') {
            // (the second of them throws her flash from where they stopped; the others gaze into their mirrors)
            if (j === 1) figs.push(ladyFig(x, y, 'attack', Math.min(LD_FLASH.long, Math.floor((t - T3) * FPS) / FPS), 'front'));
            else figs.push(ladyFig(x, y, 'stand', idleAt(t - T3 + j * 0.7), 'front'));
          } else figs.push(ladyFig(x, y, move, glideAt(t + j * 0.04), 'front'));
        }
        layFigs(figs, K1);
        const say = t < T1 ? ['In a neat line, gliding at you', `${GL.walk.pace} tiles a second; no step shows, the hem skims the floor (at the game's size)`]
          : t < T2 ? ['Keeping their distance: circling', `${GL.glideLeft.pace} tiles a second to the side, still facing you`]
          : t < T3 ? ['Backing away as you close in', `${GL.glideBack.pace} tiles a second (the knight walks 2.5), still facing you, the gown trailing toward you`]
          : ['A flash from range', `the mirror raised and held, a strike of two frames; ${reach} tiles long, ${wide} wide at its end`];
        caption2(say[0], say[1]);
      });
    }
    // 2. THE FLASH FROM RANGE, at the game's size, from in front and from behind
    for (const view of ['front', 'back'] as const) {
      add(LD_FLASH.long + 0.7, (t, i) => {
        const ox = view === 'front' ? 260 : 320;
        const oy = view === 'front' ? 250 : 520;
        ground(0, 0, W, Hh, K1, ox, oy);
        const u = t < 0.3 ? 0 : Math.min(LD_FLASH.long, Math.floor((t - 0.3) * FPS) / FPS);
        const f = t < 0.3 ? ladyFig(ox, oy, 'stand', idleAt(t), view) : ladyFig(ox, oy, 'attack', u, view);
        const [kx, ky] = view === 'front' ? atK(ox, oy, K1, 6, 0) : atK(ox, oy, K1, 0, 6);
        layFigs([f, knightFig(kx, ky, view === 'front' ? 'upleft' : 'downleft', null, i)], K1);
        caption2(`The flash from range${view === 'back' ? ', from behind' : ''}`, `the knight six tiles off; the light thrown ${reach} tiles (the game's size)`);
      });
    }
    // 3. THE GLIDES, three times as big: forward, circling, backing away (in front, and from behind)
    for (const [move, what] of [['walk', 'Gliding forward'], ['glideLeft', 'Circling'], ['glideBack', 'Backing away']] as const) {
      add(1.3, (t) => {
        const way = GL[move].way;
        const k = K3 * 0.9;
        // (the floor going by under them, as the game carries them)
        const go = t * GL[move].pace;
        const oxs = [W * 0.27, W * 0.72];
        const oy = [Hh * 0.74, Hh * 0.62];
        // (her going as the screen has it, from in front and from behind)
        const wx = go * way[0] * TILE3;
        const wy = go * way[1] * TILE3;
        const fr: [number, number] = [GRID * (wx + wy), 0.5 * GRID * (wx - wy)];
        const bk: [number, number] = [GRID * (wx - wy), -0.5 * GRID * (wx + wy)];
        ground(0, 0, W / 2, Hh, k, oxs[0] - fr[0] * k, oy[0] - fr[1] * k);
        ground(W / 2, 0, W / 2, Hh, k, oxs[1] - bk[0] * k, oy[1] - bk[1] * k);
        layFigs([ladyFig(oxs[0], oy[0], move, glideAt(t), 'front')], k);
        layFigs([ladyFig(oxs[1], oy[1], move, glideAt(t + 0.05), 'back')], k);
        g.fillStyle = '#0c0a14';
        g.fillRect(W / 2 - 1, 0, 2, Hh);
        caption2(`${what}, three times as big`, `${GL[move].pace} tiles a second, facing you; in front (left) and from behind (right); the floor going by`);
      });
    }
    // 4. THE SWOON at the game's size, both ways round, the knight by her
    const HOLD = 0.8;
    add(LD_DIES.long + HOLD, (t, i) => {
      ground(0, 0, W, Hh, K1, 300, 420);
      const [k1x, k1y] = atK(300, 420, K1, 2.6, 0.2);
      const [k2x, k2y] = atK(820, 420, K1, 0.2, 2.6);
      layFigs([ladyFig(300, 420, 'dying', t, 'front'), knightFig(k1x, k1y, 'upleft', null, i), ladyFig(820, 420, 'dying', t, 'back'), knightFig(k2x, k2y, 'downleft', null, i)], K1);
      caption2('The swoon, at the game\'s size', 'from in front (left) and from behind (right)');
    });
    // 5. THREE TIMES AS BIG, in front and from behind
    for (const view of ['front', 'back'] as const) {
      add(LD_DIES.long + HOLD, (t) => {
        const ox = view === 'front' ? 600 : 560;
        const oy = view === 'front' ? 560 : 470;
        ground(0, 0, W, Hh, K3, ox, oy);
        layFigs([ladyFig(ox, oy, 'dying', t, view)], K3);
        caption2(`The swoon, three times as big ${view === 'front' ? '(in front)' : '(from behind)'}`, 'a hand to her brow; the mirror slips, lands and cracks; her knees give; she faints back in a heap of gown');
      });
    }
    // 6. AT HALF SPEED, in front
    add((LD_DIES.still + 0.1) * 2 + 0.4, (t) => {
      ground(0, 0, W, Hh, K3, 600, 560);
      layFigs([ladyFig(600, 560, 'dying', Math.min(LD_DIES.long, t / 2), 'front')], K3);
      caption2('At half speed (in front)', 'slow and sinking: the drama of a faint; the Hush leaves her in a grey breath; she lies still, alive');
    });
    const starts: number[] = [];
    let n = 0;
    for (const sg of segs) {
      starts.push(n);
      n += sg.n;
    }
    const w = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
    w.__frames = n;
    w.__tickMs = 1000 / FPS;
    w.__frame = (k: number): string => {
      let j = 0;
      while (j < segs.length - 1 && k >= starts[j + 1]) j++;
      segs[j].f(k - starts[j]);
      return cv.toDataURL('image/png');
    };
    const first = Number(a1);
    w.__frame(Number.isFinite(first) ? first : 0);
  }
}
void LD_DIES;
(window as unknown as { __ready: boolean }).__ready = true;
