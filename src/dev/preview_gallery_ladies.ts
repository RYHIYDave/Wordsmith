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
import { GALLERY_LADY, LD_DART, LD_DIES, LD_FLASH, LD_GLIDE, LD_PACE, LD_REEL } from '../art/gallery_ladies_moves';
import { FLASH_CANVAS, FLASH_FX, flashPainted } from '../art/gallery_ladies_fx';
import { GRID } from '../art/skeleton';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = mode === 'film' ? 1280 : window.innerWidth;
cv.height = mode === 'film' ? 720 : window.innerHeight;
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
    gr.addColorStop(0, hexA(l.color, l.a * 0.55));
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
  const y = cv.height - 70;
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
    const [x, y] = at(9.5, 0.5);
    figs.push({ x, y, s: hero.back.idle[0], flip: true });
  }
  // the line, gliding at him (down the screen to the right: in front)
  for (let i = 0; i < 5; i++) {
    const [x, y] = at(1.5 + i * 0.0, -2.2 + i * 1.25);
    void i;
    figs.push({ x: x + 0, y, s: sp('walk', ((i * 3) % LD_GLIDE.frames) / LD_GLIDE.fps, 'front') });
  }
  // three at their mirrors, further off
  for (const [wx, wy, t] of [[3.8, 5.6, 0.3], [5.2, 6.8, 1.2], [2.6, 7.4, 2.0]] as const) {
    const [x, y] = at(wx, wy);
    figs.push({ x, y, s: sp('stand', t, 'front'), flip: true });
  }
  // and one throwing her light at him
  {
    const [x, y] = at(5.0, -3.4);
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
  const moments: [number, string][] = [[0.5, 'the warning, held: the glint building'], [LD_FLASH.strike[0] + 1 / 30, 'the strike: two frames, smeared'], [LD_FLASH.hit, 'the blow: the beam thrown'], [LD_FLASH.hit + 0.2, 'the beam breaking up']];
  moments.forEach(([t, label], i) => {
    const x0 = (i % 2) * PW;
    const y0 = Math.floor(i / 2) * PH;
    g.save();
    g.beginPath();
    g.rect(x0, y0, PW, PH);
    g.clip();
    const ox = x0 + (view === 'front' ? 150 : 140);
    const oy = y0 + (view === 'front' ? 150 : 300);
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
  // 4. THE DART, in front and from behind
  for (const view of ['front', 'back'] as const) {
    const p = played('dart', LD_DART.long, 0.4, 0.6);
    add(LD_DART.long + 1.0, (t) => {
      const [m, u] = p(t);
      const done = m === 'stand' && t > 0.4;
      const off = done ? LD_DART.reach / TILE3 : 0;
      const f = view === 'front' ? lady(-2.2 + off, 0.4, m, u, 'front') : lady(-0.4, -2.6 + off, m, u, 'back');
      scene([f, view === 'front' ? knight(2.4, 0.4, 'upleft') : knight(-0.4, 2.0, 'downleft')], `The dart${view === 'back' ? ', from behind' : ''}: two and a half tiles in under half a second`, 'a dip, then a burst at you, the skirt streaming back; she checks, and settles');
    });
  }
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
  // 7. IN A CROWD: the glide, the dart and the flash as the game would play them, a line of three
  {
    const g0 = 0.9;
    add(g0 + LD_DART.long + LD_FLASH.long + 0.4, (t) => {
      const figs: Fig[] = [knight(4.2, 0.2, 'upleft')];
      for (let j = 0; j < 3; j++) {
        const lag = j * 0.12;
        const tt = Math.max(0, t - lag);
        const wy = -1.4 + j * 1.3;
        if (tt < g0) figs.push(lady(-4.6 + LD_PACE * tt, wy, 'walk', walkAt(tt), 'front'));
        else if (tt < g0 + LD_DART.long) figs.push(lady(-4.6 + LD_PACE * g0, wy, 'dart', Math.floor((tt - g0) * FPS) / FPS, 'front'));
        else {
          const u = Math.min(LD_FLASH.long, Math.floor((tt - g0 - LD_DART.long) * FPS) / FPS);
          figs.push(lady(-4.6 + LD_PACE * g0 + LD_DART.reach / TILE3, wy, 'attack', u, 'front'));
        }
      }
      scene(figs, 'In a crowd: glide, dart, flash', 'three of them at the knight, as the game would play them');
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
}
void LD_DIES;
(window as unknown as { __ready: boolean }).__ready = true;
