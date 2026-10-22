// Dev page: THE WAYS BETWEEN THE FLOORS (the art chat's, 22 Oct 2026, on his “Go”): floor 4's wall giving way to the cave,
// and the cave's other end on floor 5 (art/cave4.ts). Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_ways.ts shots/ways/cave.png 960 560 "cave:L:a"
//     cave:<L|R>:<b|a|frame>   a corner of the amalgamation's hall, the stretch of its back wall (L: the wall along x, its
//                              face turned to screen-left; R: along y): b the wall standing, a the cave open, or a frame
//     mouth5:<L|R>             the lair's first room, the cave's other end in its back wall, the knight come out of it
//     sheet                    the four stills side by side
//   node tools/page_gif.mjs src/dev/preview_ways.ts "cave-film" shots/ways/cave_film.gif
//     the wall standing; the amalgamation falls (off the picture) and the wall gives way; the dust settles; the knight
//     runs into the mouth; the screen darkens and lightens on floor 5, the knight standing inside the mouth there.
// Drawn in game pixels, twice.

import { caveFilm, lairMouth } from '../art/cave4';
import type { CaveFilm, MouthArt } from '../art/cave4';
import { cryptGround } from '../art/crypt';
import type { GroundArt } from '../art/ground';
import { spriteOf3 } from '../art/heroes3';
import { lairGround } from '../art/lair';
import { makeGroundArt } from '../art/ground';
const lookGround = (): GroundArt => makeGroundArt(VAULT);
import { MOVES3 } from '../art/moves3';
import { GATE_UP, PILLAR, STRIP, makeGateArt } from '../art/gates';
import type { Strip } from '../art/gates';
import { VAULT } from '../art/ground';
import { floorStairsUp, gateBars, gateLeft, unbarFilm } from '../art/town_ways';
import { CRYPT_FLOORS } from '../art/crypt';
import { wardenGates } from '../art/floor1';
import type { Sprite } from '../engine/px';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'cave:L:a';
const [mode, sideArg = 'L', fArg = 'a'] = HASH.split(':');
const SC = 3;
const W = 340;
const H = 200;
const cv = document.createElement('canvas');
cv.width = W * SC;
cv.height = H * SC;
cv.style.display = 'block';
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(cv);
  (window as unknown as { __ready: boolean }).__ready = true;
}
const draw = (s: Sprite, x: number, y: number, flip = false): void => {
  if (!flip) g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  else {
    g.save();
    g.translate(Math.round(x), 0);
    g.scale(-1, 1);
    g.drawImage(s.img, -s.ax, Math.round(y) - s.ay, s.w, s.h);
    g.restore();
  }
};
/** The soft shadow the game lays under a figure. */
function shadow(x: number, y: number, r = 0.36): void {
  g.save();
  const grd = g.createRadialGradient(x, y, 0, x, y, r * 22);
  grd.addColorStop(0, 'rgba(0,0,0,0.6)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.setTransform(SC, 0, 0, SC * 0.5, 0, y * SC * 0.5);
  g.fillRect(x - 30, y - 30, 60, 60);
  g.restore();
}

/** A figure to stand in the room: the knight, where (in tiles), which way (down the screen or up it, mirrored or not), at which moment of a move. */
interface Figure {
  x: number;
  y: number;
  s: Sprite;
  flip: boolean;
}
const knight = (x: number, y: number, t: number, run: boolean, dx: number, dy: number): Figure => {
  const sx = dx - dy;
  const sy = dx + dy;
  const view = sy >= 0 ? 'front' : 'back';
  return { x, y, s: run ? spriteOf3(MOVES3.krun, t, view) : spriteOf3(MOVES3.rear, t, view), flip: sx < 0 };
};

/**
 * A CORNER OF A ROOM: N tiles each way, its back walls along y = 0 and x = 0, the doorway of three tiles at 3 to 5 in one
 * of them (`alongX`: along y = 0), what stands in the doorway (the wall, a frame of the film, or the cave in its two
 * layers), the figures.
 */
function room(gr: GroundArt, alongX: boolean, inDoor: { all?: Sprite; under?: Sprite; over?: Sprite; ax?: number }, figs: Figure[], cam: [number, number] = [0, 0]): void {
  const N = 9;
  g.setTransform(SC, 0, 0, SC, 0, 0);
  g.fillStyle = '#05040a';
  g.fillRect(0, 0, W, H);
  // (the doorway's middle, at its face, a little up and to the side of the picture's middle)
  const ox = W / 2 + (alongX ? -40 : 40) - cam[0];
  const oy = 38 - cam[1];
  const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
  const door = (tx: number, ty: number): boolean => (alongX ? ty === 0 && tx >= 3 && tx <= 5 : tx === 0 && ty >= 3 && ty <= 5);
  const wallAt = (tx: number, ty: number): boolean => (tx === 0 || ty === 0) && !door(tx, ty);
  // the floor, and the doorway's own (its tiles floor, the dark past them)
  for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
    if (wallAt(tx, ty)) continue;
    const [x, y] = at(tx, ty);
    draw(gr.floor(tx + 2, ty + 3), x, y);
    if (wallAt(tx - 1, ty)) draw(gr.shadeLeft, x, y);
    if (wallAt(tx, ty - 1)) draw(gr.shadeRight, x, y);
  }
  // the doorway's middle: its anchor, the foot of the face under the middle of its middle tile
  const [mx, my] = alongX ? at(4, 0) : at(0, 4);
  const anc: [number, number] = alongX ? [mx - 8, my + 12] : [mx + 8, my + 12];
  if (inDoor.under) draw(inDoor.under, anc[0], anc[1]);
  // what stands, far to near: the walls' faces, the doorway's (at its face's middle), the figures
  const stands: { d: number; f: () => void }[] = [];
  for (let s2 = 0; s2 <= 2 * (N - 1); s2++) for (let tx = 0; tx < N; tx++) {
    const ty = s2 - tx;
    if (ty < 0 || ty >= N || !wallAt(tx, ty)) continue;
    const [x, y] = at(tx, ty);
    if (ty + 1 < N && !wallAt(tx, ty + 1) && tx > 0) stands.push({ d: s2 + 1, f: () => draw(gr.faceLeft[(tx * 7 + ty) % gr.faceLeft.length], x, y) });
    if (tx + 1 < N && !wallAt(tx + 1, ty) && ty > 0) stands.push({ d: s2 + 1, f: () => draw(gr.faceRight[(tx * 5 + ty) % gr.faceRight.length], x, y) });
  }
  const dd = 4.5 + 1;
  if (inDoor.all) stands.push({ d: dd, f: () => draw(inDoor.all!, anc[0], anc[1]) });
  if (inDoor.over) stands.push({ d: dd, f: () => draw(inDoor.over!, anc[0], anc[1]) });
  for (const fg of figs) {
    const [x, y] = at(fg.x, fg.y);
    stands.push({ d: fg.x + fg.y, f: () => {
      shadow(x, y);
      draw(fg.s, x, y, fg.flip);
    } });
  }
  stands.sort((a, b) => a.d - b.d);
  for (const s of stands) s.f();
}

const side = sideArg !== 'R';
const caveOf = (alongX: boolean): CaveFilm => caveFilm(alongX);
/** Where the knight stands in the hall, a little off the doorway, looking at it. */
const watch = (alongX: boolean, t = 0): Figure => (alongX ? knight(7.2, 3.4, t, false, -1, -0.5) : knight(3.4, 7.2, t, false, -0.5, -1));

if (mode === 'cave') {
  const c = caveOf(side);
  const f = fArg === 'b' ? -1 : fArg === 'a' ? -2 : fArg === 'u' ? -3 : Number(fArg) || 0;
  if (f === -3) room(cryptGround(4), side, { under: c.under }, []);
  else if (f === -2) room(cryptGround(4), side, { under: c.under, over: c.over }, [watch(side)]);
  else room(cryptGround(4), side, { all: f === -1 ? c.before : c.frames[Math.min(f, c.frames.length - 1)] }, [watch(side)]);
  show();
} else if (mode === 'mouth5') {
  const m: MouthArt = lairMouth(side);
  const fig = side ? knight(4.5, 2.7, 0, false, 0, 1) : knight(2.7, 4.5, 0, false, 1, 0);
  room(lairGround(), side, { under: m.under, over: m.over }, [fig]);
  show();
} else if (mode === 'gate' || mode === 'gate-film') {
  // THE TOWN'S GATE: barred (gate:b), a frame of its unbarring (gate:<n>), what is left (gate:l), its portcullis down; the hall's floor before it, the knight by it.
  //   gate-film: the barring, then the unbarring, then the portcullis rising (for page_gif)
  const A = makeGateArt(VAULT);
  const film = unbarFilm(true);
  const scene = (bars: Strip[], raise: number, t: number): void => {
    g.setTransform(SC, 0, 0, SC, 0, 0);
    g.fillStyle = '#05040a';
    g.fillRect(0, 0, W, H);
    const ox = W / 2 - 24;
    const oy = 70;
    const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    const gr = lookGround();
    for (let ty = 0; ty < 6; ty++) for (let tx = -2; tx < 6; tx++) draw(gr.floor(tx + 4, ty + 6), ...at(tx, ty));
    for (let tx = -2; tx < 6; tx++) if (tx < 0 || tx > 2) draw(gr.faceLeft[(tx + 9) % gr.faceLeft.length], ...at(tx, -1));
    const wide = PILLAR / 32;
    const list: { d: number; f: () => void }[] = [];
    const put = (d: number, sp: Sprite, x: number, y: number): void => {
      const [sx, sy] = at(x, y);
      list.push({ d, f: () => draw(sp, sx, sy) });
    };
    const strips = (ss: Strip[], t0: number, back: number): void => {
      for (const q of ss) put(t0 + q.t + 0 - back + STRIP / 64, q.s, t0 + q.t, -back);
    };
    for (const x of [0, 3 + wide]) put(x - wide, A.pillar(false), x, 0);
    strips(A.portcullis(true, false, raise), -wide, wide);
    strips(A.arch(true, false, false), -wide, 0);
    strips(bars, -wide, wide - 0.03);
    const kx = 3.2 + 0.4 * Math.sin(t);
    list.push({ d: kx + 2.4, f: () => {
      const [sx, sy] = at(kx, 2.4);
      shadow(sx, sy);
      draw(spriteOf3(MOVES3.rear, t, 'back'), sx, sy, true);
    } });
    list.sort((a, b) => a.d - b.d);
    for (const q of list) q.f();
    // (the seal's light, added over all, as the game adds a prop's)
    for (const q of bars) {
      if (!q.s.lights) continue;
      const [sx, sy] = at(-wide + q.t, -(wide - 0.03));
      for (const l of q.s.lights) {
        const cx = sx - q.s.ax + l.x;
        const cy = sy - q.s.ay + l.y;
        const grd = g.createRadialGradient(cx, cy, 0, cx, cy, l.r);
        grd.addColorStop(0, l.color + Math.round((l.a ?? 1) * 255).toString(16).padStart(2, '0'));
        grd.addColorStop(1, l.color + '00');
        g.globalCompositeOperation = 'lighter';
        g.fillStyle = grd;
        g.fillRect(cx - l.r, cy - l.r, l.r * 2, l.r * 2);
        g.globalCompositeOperation = 'source-over';
      }
    }
  };
  if (mode === 'gate') {
    const f = sideArg === 'b' ? -1 : sideArg === 'l' ? -2 : Number(sideArg) || 0;
    scene(f === -1 ? gateBars(true) : f === -2 ? gateLeft(true) : film.frames[Math.min(f, film.frames.length - 1)], 0, 0);
    show();
  } else {
    const HOLD = 30;
    const RISE = 50;
    const total = HOLD + film.frames.length + RISE;
    const frame = (k: number): void => {
      const t = k / 30;
      if (k < HOLD) return scene(gateBars(true), 0, t);
      if (k < HOLD + film.frames.length) return scene(film.frames[k - HOLD], 0, t);
      const r = Math.min(1, (k - HOLD - film.frames.length - 12) / 26);
      scene(gateLeft(true), Math.max(0, Math.round((GATE_UP * r) / 2) * 2), t);
    };
    const w2 = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
    w2.__frames = total;
    w2.__tickMs = 1000 / 30;
    w2.__frame = (k) => {
      frame(k);
      return cv.toDataURL('image/png');
    };
    frame(0);
    show();
  }
} else if (mode === 'up1') {
  // FLOOR 1'S START: its first room's back wall, the gate's arch and pillars with the stairs up in them, the knight come down them
  const theme = CRYPT_FLOORS[0];
  const A = wardenGates();
  const gr = cryptGround(1);
  g.setTransform(SC, 0, 0, SC, 0, 0);
  g.fillStyle = '#05040a';
  g.fillRect(0, 0, W, H);
  const ox = W / 2 - 24;
  const oy = 70;
  const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
  for (let ty = 0; ty < 6; ty++) for (let tx = -2; tx < 6; tx++) draw(gr.floor(tx + 4, ty + 6), ...at(tx, ty));
  for (let tx = -2; tx < 6; tx++) if (tx < 0 || tx > 2) draw(gr.faceLeft[(tx + 9) % gr.faceLeft.length], ...at(tx, -1));
  const wide = PILLAR / 32;
  draw(floorStairsUp(theme, true), ...at(-wide, 0));
  const list: { d: number; f: () => void }[] = [];
  const put = (d: number, sp: Sprite, x: number, y: number): void => {
    const [sx, sy] = at(x, y);
    list.push({ d, f: () => draw(sp, sx, sy) });
  };
  for (const x of [0, 3 + wide]) put(x - wide, A.pillar(false), x, 0);
  for (const q of A.arch(true, false, false)) put(-wide + q.t + STRIP / 64, q.s, -wide + q.t, 0);
  list.push({ d: 1.5 + 1.7, f: () => {
    const [sx, sy] = at(1.5, 1.7);
    shadow(sx, sy);
    draw(spriteOf3(MOVES3.rear, 0, 'front'), sx, sy, true);
  } });
  list.sort((a, b) => a.d - b.d);
  for (const q of list) q.f();
  show();
} else if (mode === 'layer') {
  // one layer alone on grey, close: layer:<cave|mouth5>:<L|R>:<under|over|before|after>
  const [, what, sd, which] = HASH.split(':');
  const al = sd !== 'R';
  const sp = what === 'cave' ? (caveOf(al) as unknown as Record<string, Sprite>)[which] : (lairMouth(al) as unknown as Record<string, Sprite>)[which === 'after' ? 'whole' : which];
  g.setTransform(SC, 0, 0, SC, 0, 0);
  g.fillStyle = '#404048';
  g.fillRect(0, 0, W, H);
  draw(sp, W / 2, H * 0.7);
  show();
} else if (mode === 'sheet') setTimeout(() => {
  // the four stills side by side
  const parts: (() => void)[] = [
    () => room(cryptGround(4), true, { all: caveOf(true).before }, [watch(true)]),
    () => room(cryptGround(4), true, { under: caveOf(true).under, over: caveOf(true).over }, [watch(true)]),
    () => room(cryptGround(4), false, { under: caveOf(false).under, over: caveOf(false).over }, [watch(false)]),
    () => room(lairGround(), true, { under: lairMouth(true).under, over: lairMouth(true).over }, [knight(4.5, 2.7, 0, false, 0, 1)]),
  ];
  const pics: HTMLCanvasElement[] = [];
  for (const p of parts) {
    p();
    const c2 = document.createElement('canvas');
    c2.width = cv.width;
    c2.height = cv.height;
    c2.getContext('2d')!.drawImage(cv, 0, 0);
    pics.push(c2);
  }
  cv.width = W * SC * 2;
  cv.height = H * SC * 2;
  g.setTransform(1, 0, 0, 1, 0, 0);
  pics.forEach((p, i) => g.drawImage(p, (i % 2) * W * SC, Math.floor(i / 2) * H * SC));
  show();
}, 0);
else if (mode === 'cave-film') {
  // THE FILM, at 30 a second: the wall standing (0.8 s), the wall giving way, the knight running into the mouth, the
  // screen darkening (0.35 s) and lightening on floor 5 (0.35 s), the knight standing inside its mouth, then walking on
  const FPS = 30;
  const c = caveOf(side);
  const HOLD = 24;
  const FILM = c.frames.length;
  const RUN = 34;
  const DARK = 11;
  const AFTER = 40;
  const total = HOLD + FILM + 8 + RUN + DARK * 2 + AFTER;
  const m5 = lairMouth(side);
  const frame = (k: number): void => {
    g.setTransform(SC, 0, 0, SC, 0, 0);
    const t = k / FPS;
    if (k < HOLD) return room(cryptGround(4), side, { all: c.before }, [watch(side, t)]);
    if (k < HOLD + FILM) {
      const f = k - HOLD;
      // (the screen's kick at each jolt, as the game kicks it)
      const KICK: ReadonlyArray<readonly [number, number]> = [[2, 5], [-2, -4], [2, 3], [-1, -2], [1, 1], [0, -1]];
      const j = c.jolts.find((q) => f - q >= 0 && f - q < KICK.length);
      const cam: [number, number] = j !== undefined ? [KICK[f - j][0], KICK[f - j][1]] : [0, 0];
      return room(cryptGround(4), side, { all: c.frames[f] }, [watch(side, t)], cam);
    }
    if (k < HOLD + FILM + 8) return room(cryptGround(4), side, { under: c.under, over: c.over }, [watch(side, t)]);
    if (k < HOLD + FILM + 8 + RUN + DARK) {
      // the knight runs to the mouth and into it (the screen darkening as he steps past its face)
      const q = Math.min(1, (k - HOLD - FILM - 8) / RUN);
      const from = side ? [7.2, 3.4] : [3.4, 7.2];
      const mid = side ? [4.5, 2.2] : [2.2, 4.5];
      const to = side ? [4.5, 0.7] : [0.7, 4.5];
      const p = q < 0.4 ? from.map((v, i) => v + (mid[i] - v) * (q / 0.4)) : mid.map((v, i) => v + (to[i] - v) * ((q - 0.4) / 0.6));
      const d = q < 0.4 ? [mid[0] - from[0], mid[1] - from[1]] : [to[0] - mid[0], to[1] - mid[1]];
      room(cryptGround(4), side, { under: c.under, over: c.over }, [knight(p[0], p[1], t, true, d[0], d[1])]);
      const dk = k - (HOLD + FILM + 8 + RUN);
      if (dk >= 0) {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = `rgba(0,0,0,${Math.min(1, (dk + 1) / DARK)})`;
        g.fillRect(0, 0, cv.width, cv.height);
      }
      return;
    }
    // floor 5: the screen lightening, the knight standing just inside the mouth, then walking on into the room
    const k5 = k - (HOLD + FILM + 8 + RUN + DARK);
    const walk = Math.max(0, (k5 - DARK - 10) / (AFTER - 10));
    const pos = side ? [4.5, 2.7 + walk * 1.6] : [2.7 + walk * 1.6, 4.5];
    const fig = side ? knight(pos[0], pos[1], t, walk > 0, 0, 1) : knight(pos[0], pos[1], t, walk > 0, 1, 0);
    room(lairGround(), side, { under: m5.under, over: m5.over }, [fig]);
    if (k5 < DARK) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = `rgba(0,0,0,${1 - (k5 + 1) / DARK})`;
      g.fillRect(0, 0, cv.width, cv.height);
    }
  };
  const w2 = window as unknown as { __frames: number; __tickMs: number; __frame: (k: number) => string };
  w2.__frames = total;
  w2.__tickMs = 1000 / FPS;
  w2.__frame = (k) => {
    frame(k);
    return cv.toDataURL('image/png');
  };
  frame(0);
  show();
}
