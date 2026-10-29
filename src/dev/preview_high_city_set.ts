// Dev page: THE HIGH CITY'S OWN PIECES, the set's twenty-five for floors 16 to 20 (art/high_city_set.ts), each with its
// name, on the ground it goes on: what stands outside on floor 16's own lawn (art/swangardens.ts), what stands in the
// palace's rooms on a marble floor, what hangs on a wall on a wall of the palace's stone. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_high_city_set.ts shots/hc/sheet1.png 1200 900 "sheet:1"
//   ... "sheet:2", "sheet:3" (the twenty-five over three sheets, twice the game's size, each frame cut to what is in it)
//   ... "look=<name>@K" (every picture of one piece, K times as big: a wall piece's both faces at every spot)
//   ... "royals" (the four royals' banners and cards, three times as big)
//   ... "garden" (the set laid on floor 16's own gardens where they meet the palace: its railings and gate, the coach on
//       the drive, the fountain, a garden party left out on the lawn; floor 16's own yews and roses; the knight; 1200 x 840)
//   ... "room" (a stand-in room of the palace, its walls hung with the set's banners, portrait, sconces and the rest, its
//       floor set with the rest of the set, the knight; 1200 x 840: the rooms of floors 17 to 20 are not drawn yet)
//   ... "garden:2", "room:2" (the middle of either, twice as big)
import { ROYALS, ROYAL_LOOK, highCitySetPieces, markTone } from '../art/high_city_set';
import type { Piece } from '../art/floorkit';
import { swanGardensTerrain, paintSwanGardens } from '../art/swangardens';
import { pictureOf } from '../art/terrain';
import { drawText, textWidth } from '../engine/font';
import type { Sprite } from '../engine/px';
import { P } from '../art/palette';
import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import { THEME } from '../ui/ui';
import { swanGardensPieces } from '../art/floor16';
import { makeHeroArt3 } from '../art/heroes3';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'sheet:1';
const BG = '#07080d';

// =================================================================================================
// THE GROUNDS: floor 16's lawn and gravel; a palace room's marble; a wall of the palace's stone

const Wt = 40;
const Ht = 40;
const tiles = new Uint8Array(Wt * Ht).fill(T_WALL);
for (let y = 2; y < 38; y++) for (let x = 2; x < 38; x++) tiles[y * Wt + x] = T_FLOOR;
const FLOOR = { depth: 16, seed: 16, w: Wt, h: Ht, tiles, cut: new Uint8Array(Wt * Ht), variant: new Uint8Array(Wt * Ht), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const T = swanGardensTerrain(FLOOR, { walk: (x, y) => (x + y) % 9 < 3 });

const hex = (c: string): [number, number, number] => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function mixHex(a: string, b: string, t: number): string {
  const A = hex(a);
  const B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function canvasOf(w: number, h: number, paint: (x: number, y: number) => string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [r, gg, b] = hex(paint(x, y));
    const i = (y * w + x) * 4;
    im.data[i] = r;
    im.data[i + 1] = gg;
    im.data[i + 2] = b;
    im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
}
/** Floor 16's own lawn, a piece of it `w` by `h`. */
function lawn(w: number, h: number, seed: number): HTMLCanvasElement {
  const [cx, cy] = pictureOf(12 + (seed % 14), 18);
  const p = paintSwanGardens(T, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, w, h), 0, 0);
  return c;
}
/** A palace room's floor: squares of two marbles laid on the tiles' lines, (ax, ay) a tile's middle. */
const MARBLE_A = ['#46424c', '#4e4a55'];
const MARBLE_B = ['#2c2834', '#322e3a'];
function marbleAt(x: number, y: number, ax: number, ay: number): string {
  const a = (x + 0.5 - ax) / 32;
  const b = (y + 0.5 - ay) / 16;
  const u = (a + b) / 2 + 0.5;
  const v = (b - a) / 2 + 0.5;
  const fu = u - Math.floor(u);
  const fv = v - Math.floor(v);
  if (fu < 0.02 || fv < 0.02) return '#1a1820';
  const dark = (Math.floor(u) + Math.floor(v)) & 1;
  const vein = Math.abs(Math.sin(u * 9 + Math.sin(v * 5) * 1.4)) < 0.06;
  const R = dark ? MARBLE_B : MARBLE_A;
  return vein ? R[0] : R[(x * 7 + y * 3) % 11 === 0 ? 0 : 1];
}
/** A wall of the palace's stone, in courses, turned to the screen's left (in the light) or right (in shade), its foot through (ax, ay); the marble floor before it. */
function wallAt(x: number, y: number, ax: number, ay: number, left: boolean): string {
  const dx = x + 0.5 - ax;
  // (the face's foot runs down to the right on a left face, up to the right on a right face)
  const foot = ay + (left ? dx * 0.5 : -dx * 0.5);
  if (y + 0.5 > foot) return marbleAt(x, y, ax, ay + 16);
  const up = foot - (y + 0.5);
  const course = Math.floor(up / 10);
  const along = (left ? dx : -dx) / 0.8 + (course % 2) * 13;
  const joint = up % 10 < 1 || ((along % 26) + 26) % 26 < 1.2;
  const L = left ? ['#4a4450', '#56505c', '#3a3640'] : ['#322e3a', '#3a3644', '#26222c'];
  if (up < 4) return L[2];
  if (joint) return L[2];
  return (Math.floor(along / 26) + course) % 3 === 0 ? L[0] : L[1];
}

// =================================================================================================
// WHERE EACH PIECE GOES

/** What stands in the palace's rooms (the rest stands out on the hill: on floor 16's lawn here). */
const INDOORS = new Set(['a velvet rope barrier', 'a gilt chair', 'a royal card table', 'a silver tea service, left out', 'a grand vase', 'a hat stand, cloaks left on it', "the heralds' trumpets, stopped", 'a standing candelabrum', "a songbird's cage, silent", 'a royal carpet', 'a heap of invitations', 'a dropped fan and a rose', 'a royal card']);

/** Every picture of a piece to show: a wall piece's on its left face (and its right, if asked), at its first spot. */
function pictures(p: Piece, both = false): { s: Sprite; wall: 0 | 1 | 2 }[] {
  if (p.left) return [...p.left.map((s) => ({ s, wall: 1 as const })), ...(both ? p.right!.map((s) => ({ s, wall: 2 as const })) : [])];
  return (p.frames ?? []).map((s) => ({ s, wall: 0 as const }));
}
/** What of a picture is painted: its box, in picture pixels. */
function painted(s: Sprite): { x: number; y: number; w: number; h: number } {
  const c = s.img;
  const d = (c.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width;
  let y0 = c.height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return x1 < 0 ? { x: 0, y: 0, w: 1, h: 1 } : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * A CELL: one picture cut to what is painted (and `pad` round it), K times as big, on its ground: a wall piece on a wall
 * of the palace's stone, what stands in the rooms on marble, the rest on floor 16's lawn; its soft shadow as the game
 * draws it.
 */
function cell(p: Piece, s: Sprite, wall: 0 | 1 | 2, K: number, seed: number, pad = 8): HTMLCanvasElement {
  const d = s.density ?? 1;
  const b = painted(s);
  const ax = s.ax * d;
  const ay = s.ay * d;
  // (the cell takes in the anchor's row and some floor under it, and for a wall piece the wall's foot)
  const x0 = Math.min(b.x, Math.round(ax) - 10) - pad;
  const x1 = Math.max(b.x + b.w, Math.round(ax) + 10) + pad;
  const y0 = b.y - pad;
  const y1 = Math.max(b.y + b.h, Math.round(ay) + (wall ? 18 : 10)) + pad;
  const w = x1 - x0;
  const h = y1 - y0;
  const out = document.createElement('canvas');
  out.width = w * K;
  out.height = h * K;
  const g = out.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const AX = ax - x0;
  const AY = ay - y0;
  const ground = wall ? canvasOf(w, h, (x, y) => wallAt(x, y, AX, AY, wall === 1)) : INDOORS.has(p.name) ? canvasOf(w, h, (x, y) => marbleAt(x, y, AX, AY)) : lawn(w, h, seed);
  g.drawImage(ground, 0, 0, w * K, h * K);
  if (!wall && p.shadow) {
    g.save();
    g.globalAlpha = 0.5;
    g.fillStyle = '#05040a';
    g.beginPath();
    g.ellipse(AX * K, AY * K, p.shadow * 34 * K, p.shadow * 17 * K, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.drawImage(s.img, -x0 * K, -y0 * K, s.img.width * K, s.img.height * K);
  return out;
}

const cvs = document.createElement('canvas');
const g = cvs.getContext('2d') as CanvasRenderingContext2D;
document.body.style.margin = '0';
document.body.style.background = BG;
document.body.appendChild(cvs);
const label = (text: string, x: number, y: number, scale = 2): void => {
  g.save();
  g.imageSmoothingEnabled = false;
  drawText(g, text, x, y, THEME.text, { shadow: P.ink, scale });
  g.restore();
};

const ALL = highCitySetPieces();

/** A piece's block: its name over its pictures, wrapped to `W` wide. */
function block(p: Piece, pics: { s: Sprite; wall: 0 | 1 | 2 }[], W: number, K: number, seed: number): HTMLCanvasElement {
  const cells = pics.map(({ s, wall }, i) => cell(p, s, wall, K, seed * 5 + i));
  const at: [number, number][] = [];
  let x = 0;
  let y = 22;
  let rowH = 0;
  let wMax = textWidth(p.name, 'normal', 2);
  for (const c of cells) {
    if (x > 0 && x + c.width > W) {
      x = 0;
      y += rowH + 6;
      rowH = 0;
    }
    at.push([x, y]);
    x += c.width + 6;
    wMax = Math.max(wMax, x - 6);
    rowH = Math.max(rowH, c.height);
  }
  const out = document.createElement('canvas');
  out.width = Math.ceil(wMax);
  out.height = y + rowH;
  const q = out.getContext('2d') as CanvasRenderingContext2D;
  q.imageSmoothingEnabled = false;
  drawText(q, p.name, 0, 0, THEME.text, { shadow: P.ink, scale: 2 });
  cells.forEach((c, i) => {
    q.drawImage(c, at[i][0], at[i][1]);
    q.strokeStyle = '#1c1a26';
    q.strokeRect(at[i][0] + 0.5, at[i][1] + 0.5, c.width - 1, c.height - 1);
  });
  return out;
}

/** Lay the pieces' blocks in rows `W` wide; return the height used. */
function layOut(list: { p: Piece; pics: { s: Sprite; wall: 0 | 1 | 2 }[] }[], W: number, K: number, draw: boolean): number {
  let x = 10;
  let y = 10;
  let rowH = 0;
  list.forEach(({ p, pics }, n) => {
    const b = block(p, pics, W - 20, K, n);
    if (x > 10 && x + b.width > W - 10) {
      x = 10;
      y += rowH + 18;
      rowH = 0;
    }
    if (draw) g.drawImage(b, x, y);
    x += b.width + 22;
    rowH = Math.max(rowH, b.height);
  });
  return y + rowH + 10;
}

function sheet(list: { p: Piece; pics: { s: Sprite; wall: 0 | 1 | 2 }[] }[], W: number, K: number, title?: string): void {
  const top = title ? 34 : 0;
  const h = layOut(list, W, K, false) + top;
  cvs.width = W;
  cvs.height = h;
  g.fillStyle = BG;
  g.fillRect(0, 0, W, h);
  if (title) label(title, 10, 8);
  g.save();
  g.translate(0, top);
  layOut(list, W, K, true);
  g.restore();
}

if (HASH.startsWith('sheet:')) {
  // the twenty-five over three sheets, in the set's order, each piece's every frame (a wall piece's on its left face)
  const k = Number(HASH.slice(6)) || 1;
  // (what hangs on the wall three times the game's size; the rest twice)
  const parts: [number, number, number, string][] = [[0, 6, 3, 'on the walls'], [6, 12, 2, 'out on the hill'], [12, 25, 2, "in the palace's rooms, and on the floor"]];
  const [a, b, K, what] = parts[k - 1] ?? parts[0];
  sheet(ALL.slice(a, b).map((p) => ({ p, pics: pictures(p) })), 1200, K, `The High City's 25 (${k} of 3), ${what}: ${K} times the game's size`);
} else if (HASH.startsWith('look=')) {
  const [name, ks] = HASH.slice(5).split('@');
  const p = ALL.find((q) => q.name === name);
  const K = Number(ks) || 2;
  if (p) {
    const pics = p.left ? [...(p.spots ?? []).flatMap((sp) => [...sp.left.map((s) => ({ s, wall: 1 as const })), ...sp.right.map((s) => ({ s, wall: 2 as const }))])] : pictures(p);
    sheet([{ p, pics }], 1200, K);
  }
} else if (HASH === 'marks') {
  // the four marks alone, at 14, 20, 28 and 56 pixels across, four times as big
  const sizes = [14, 20, 28, 56];
  cvs.width = 1200;
  cvs.height = 4 * (56 * 4 + 20) + 20;
  g.fillStyle = BG;
  g.fillRect(0, 0, cvs.width, cvs.height);
  ROYALS.forEach((r, i) => {
    const L = ROYAL_LOOK[r];
    let x = 10;
    for (const n of sizes) {
      const c = canvasOf(n + 4, n + 4, (px, py) => {
        const mx = ((px + 0.5 - (n + 4) / 2) / n) * 2;
        const my = -((py + 0.5 - (n + 4) / 2) / n) * 2;
        const t = markTone(r, mx, my, 2 / n);
        return t >= 0 ? L.mark[t] : L.field[2];
      });
      g.imageSmoothingEnabled = false;
      g.drawImage(c, x, 10 + i * (56 * 4 + 20), (n + 4) * 4, (n + 4) * 4);
      x += (n + 4) * 4 + 12;
    }
  });
} else if (HASH === 'royals') {
  // the four royals: their banners (left face) and their cards, three times as big
  const banner = ALL.find((q) => q.name === "a royal's banner")!;
  const card = ALL.find((q) => q.name === 'a royal card')!;
  const names = ['the Princess', 'the Prince', 'the Queen', 'the King'];
  const W = 1200;
  const cells = names.map((_n, i) => [cell(banner, banner.left![i], 1, 3, i, 4), cell(card, card.frames![i], 0, 3, i + 10, 4)]);
  const colW = W / 4;
  const H = Math.max(...cells.map((c) => c[0].height + c[1].height)) + 90;
  cvs.width = W;
  cvs.height = H;
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.imageSmoothingEnabled = false;
  label('The four royals: their banners and their cards (three times as big)', 10, 8);
  cells.forEach(([b, c], i) => {
    const x = i * colW + (colW - b.width) / 2;
    label(names[i], i * colW + 12, 40);
    g.drawImage(b, Math.round(x), 64);
    g.drawImage(c, Math.round(i * colW + (colW - c.width) / 2), 64 + b.height + 12);
  });
}

// =================================================================================================
// THE SCENES: the pieces laid as the game lays them, far to near, with the knight for scale

interface Stand { d: number; s: Sprite; x: number; y: number; shadow: number; under?: boolean; hero?: boolean }
/** THE SOFT SHADOW the game draws under what stands (render.ts): a soft oval, darkest under it, gone at its rim. */
const blot = ((): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = q.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.4, 'rgba(0,0,0,0.85)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  q.fillStyle = grd;
  q.fillRect(0, 0, 64, 64);
  return c;
})();
/** Draw what stands and lies, far to near (what lies on the floor first), the picture's top left at world picture pixel (VX, VY). */
function drawStands(stands: Stand[], VX: number, VY: number): void {
  stands.sort((a, b) => (a.under === b.under ? a.d - b.d : a.under ? -1 : 1));
  for (const st of stands) {
    const [px, py] = pictureOf(st.x, st.y);
    const sx = (px - VX) / 2;
    const sy = (py - VY) / 2;
    g.setTransform(2, 0, 0, 2, 0, 0);
    if (st.shadow) {
      const w = st.shadow * 22.6 * 1.5;
      const hh = st.shadow * 11.3 * 1.5;
      g.save();
      g.imageSmoothingEnabled = true;
      g.globalAlpha = 0.55;
      g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
      g.restore();
    }
    g.imageSmoothingEnabled = false;
    g.drawImage(st.s.img, Math.round(sx - st.s.ax), Math.round(sy - st.s.ay), st.s.w, st.s.h);
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
}
const pieceOf = (list: Piece[], name: string): Piece => {
  const p = list.find((q) => q.name === name);
  if (!p) throw new Error(`no piece named ${name}`);
  return p;
};
function zoomCentre(W: number, H: number, k: number): void {
  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cvs, 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(src, Math.round(W / 2 - W / k / 2), Math.round(H / 2 - H / k / 2), W / k, H / k, 0, 0, W, H);
}
const knight = (): Sprite => makeHeroArt3().of('warrior', { twoHanded: false }).front.idle[0];

if (HASH.startsWith('garden')) {
  // THE GARDENS WHERE THEY MEET THE PALACE: a level laid by hand on floor 16's ground (art/swangardens.ts)
  const LW = 34;
  const LH = 28;
  const tl = new Uint8Array(LW * LH).fill(T_WALL);
  for (let y = 3; y < 25; y++) for (let x = 7; x < 27; x++) tl[y * LW + x] = T_FLOOR;
  const level = { depth: 16, seed: 16, w: LW, h: LH, tiles: tl, cut: new Uint8Array(LW * LH), variant: new Uint8Array(LW * LH), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
  const FT: [number, number] = [17, 10];
  const BED = { x0: 8.6, x1: 12.4, y0: 17.6, y1: 20.4 };
  const T2 = swanGardensTerrain(level, {
    walk: (x, y) => (x >= 15 && x < 19 && y > 3) || Math.hypot(x - FT[0], y - FT[1]) < 4.6 || (y >= 3 && y < 4.2),
    paved: (x, y) => Math.hypot(x - FT[0], y - FT[1]) < 2.4,
    bed: (x, y) => x > BED.x0 && x < BED.x1 && y > BED.y0 && y < BED.y1,
  });
  const W = 1200;
  const H = 840;
  const [cx, cy] = pictureOf(17, 14.2);
  const VX = Math.round(cx - W / 2);
  const VY = Math.round(cy - H / 2);
  cvs.width = W;
  cvs.height = H;
  for (let py = 0; py < H; py += 256) for (let px = 0; px < W; px += 256) {
    const pw = Math.min(256, W - px);
    const ph = Math.min(256, H - py);
    const pp = paintSwanGardens(T2, VX + px, VY + py, pw, ph);
    g.putImageData(new ImageData(pp.rgba, pw, ph), px, py);
  }
  const OWN = swanGardensPieces();
  const stands: Stand[] = [];
  const put = (list: Piece[], name: string, x: number, y: number, f = 0, under = false): void => {
    const p = pieceOf(list, name);
    stands.push({ d: x + y, s: p.frames![f], x, y, shadow: under ? 0 : p.shadow ?? 0, under });
  };
  const set = (name: string, x: number, y: number, f = 0, under = false): void => put(ALL, name, x, y, f, under);
  // the palace railings along the back, the gate's gap between two sentry boxes; the Order's mask on two of them
  for (let x = 7.5; x < 14; x++) set('palace railings', x, 3.5, x === 9.5 ? 2 : 0);
  for (let x = 20.5; x < 27; x++) set('palace railings', x, 3.5, x === 24.5 ? 2 : 0);
  set('a sentry box', 14.3, 4.6);
  set('a sentry box', 19.7, 4.6);
  set("the heralds' trumpets, stopped", 11.6, 6.4);
  // the fountain of the four royals in the forecourt; the gilt lamps down the drive; the coach left on it
  set('the fountain of the four royals', FT[0], FT[1]);
  for (const y of [15.5, 22.6]) {
    set('a gilt lamp post', 14.4, y, 0);
    set('a gilt lamp post', 19.6, y, 1);
  }
  set('a royal coach, abandoned', 17.1, 17.2);
  set('a velvet rope barrier', 15.3, 18.4, 1);
  // the carpet laid out from the coach's door to the party on the lawn
  for (let x = 17.5; x < 22.6; x++) set('a royal carpet', x, 17.5, 0, true);
  // THE GARDEN PARTY, left as it was: the card table, its chairs, the tea, the candles still burning, the cage, cloaks
  set('a royal card table', 23.6, 17.6);
  set('a gilt chair', 23.6, 16.5);
  set('a gilt chair', 24.9, 19.1, 1);
  set('a silver tea service, left out', 22.2, 20.3);
  set('a standing candelabrum', 25.6, 16.1);
  set("a songbird's cage, silent", 21.5, 14.6);
  set('a hat stand, cloaks left on it', 25.8, 21.6);
  set('a heap of invitations', 23.4, 22.1, 0, true);
  set('a dropped fan and a rose', 21.2, 22.6, 0, true);
  set('a royal card', 19.9, 20.4, 3, true);
  // the left lawn: a king's statue by a bed of roses edged in box
  set('a marble statue of a royal', 11.6, 13.4);
  for (let y = BED.y0 + 0.4; y < BED.y1; y++) for (let x = BED.x0 + 0.4; x < BED.x1; x++) put(OWN, 'a rose bush', x, y);
  for (let x = 8.5; x < 13; x++) {
    put(OWN, 'box edging', x, BED.y0 - 0.2, 0);
    put(OWN, 'box edging', x, BED.y1 + 0.2, 0);
  }
  // floor 16's own yews round the edges
  for (const [x, y] of [[8, 8.5], [8, 12.5], [8, 23.4], [13.5, 23.6], [25.8, 9.5], [25.8, 12.5], [20.8, 23.8]] as const) put(OWN, 'a yew cone', x, y);
  // the knight on the drive
  stands.push({ d: 17 + 21.6, s: knight(), x: 17, y: 21.6, shadow: 0.36, hero: true });
  drawStands(stands, VX, VY);
  if (HASH === 'garden:2') zoomCentre(W, H, 2);
} else if (HASH.startsWith('room')) {
  // A ROOM OF THE PALACE, a stand-in (the rooms of floors 17 to 20 are not drawn yet): a marble floor; two walls, a
  // walnut dado under a gilt rail, panels of a dark damask framed in gilt above, going into the dark at their tops
  const W = 1200;
  const H = 840;
  const X0 = 6;
  const X1 = 18;
  const Y0 = 6;
  const Y1 = 18;
  const TALL = 128;
  const [ccx, ccy] = pictureOf(10.2, 10.2);
  const VX = Math.round(ccx - W / 2);
  const VY = Math.round(ccy - H / 2);
  cvs.width = W;
  cvs.height = H;
  const DAMASK = ['#2a1e2e', '#33253a', '#1e1622'];
  const wallPx = (along: number, z: number, lit: boolean): string => {
    let c: string;
    if (z < 22) c = Math.abs((along * 2.4) % 1) < 0.06 || z > 20.5 ? '#2a1a18' : z < 2 ? '#140e10' : '#3e2820';
    else if (z < 25) c = z > 24 ? '#b4924a' : '#8a6a30';
    else {
      const pa = ((along * 1.6) % 1 + 1) % 1;
      const frame = pa < 0.05 || pa > 0.95 || (z > 30 && z < 31.4) || (z > 104 && z < 105.4);
      c = frame ? '#8a6a30' : (Math.floor(along * 6.4) + Math.floor(z / 6)) % 2 ? DAMASK[0] : DAMASK[1];
    }
    if (!lit) c = mixHex(c, '#06051a', 0.32);
    // (the top of the wall going into the dark, as the game's walls do)
    if (z > TALL - 36) c = mixHex(c, '#07080d', Math.min(1, (z - (TALL - 36)) / 36));
    return c;
  };
  const bg = canvasOf(W, H, (x, y) => {
    const px = x + VX + 0.5;
    const py = y + VY + 0.5;
    // the back wall along x (at y = Y0, turned to the screen's left: in the light)
    const xa = px / 32 + Y0;
    const za = (xa + Y0) * 16 - py;
    if (xa >= X0 && xa <= X1 && za >= 0 && za <= TALL) return wallPx(xa - X0, za, true);
    // the wall along y (at x = X0, turned to the screen's right: in shade)
    const yb = X0 - px / 32;
    const zb = (X0 + yb) * 16 - py;
    if (yb >= Y0 && yb <= Y1 && zb >= 0 && zb <= TALL) return wallPx(yb - Y0, zb, false);
    const fx = (px / 32 + py / 16) / 2;
    const fy = (py / 16 - px / 32) / 2;
    if (fx < X0 || fy < Y0 || fx > X1 || fy > Y1) return BG;
    return marbleAt(x, y, -VX, -VY);
  });
  g.drawImage(bg, 0, 0);
  const stands: Stand[] = [];
  // what hangs on the walls: on the back wall (its left face), on the wall at the left (its right face)
  const hang = (name: string, f: number, along: number, onBack: boolean): void => {
    const p = pieceOf(ALL, name);
    const s = onBack ? p.left![f] : p.right![f];
    const x = onBack ? X0 + along : X0;
    const y = onBack ? Y0 : Y0 + along;
    stands.push({ d: -100 + x + y, s, x, y, shadow: 0, under: true });
  };
  hang("a royal's banner", 0, 1.5, true);
  hang('a gilt sconce', 0, 3.4, true);
  hang('a palace door', 1, 5.6, true);
  hang('a gilt sconce', 1, 7.8, true);
  hang("a royal's banner", 3, 9.5, true);
  hang('a court portrait, faces painted out', 0, 11.2, true);
  hang("a royal's banner", 1, 1.6, false);
  hang('a court notice, gone blank', 0, 3.6, false);
  hang("the Order's mask over the crest", 0, 5.8, false);
  hang('a gilt sconce', 0, 7.8, false);
  hang("a royal's banner", 2, 9.8, false);
  const set = (name: string, x: number, y: number, f = 0, under = false): void => {
    const p = pieceOf(ALL, name);
    stands.push({ d: x + y, s: p.frames![f], x, y, shadow: under ? 0 : p.shadow ?? 0, under });
  };
  // the carpet from the door down the room; what stands about it
  for (let y = Y0 + 0.5; y < Y0 + 9; y++) set('a royal carpet', X0 + 5.6, y, 1, true);
  set('a velvet rope barrier', X0 + 4.2, Y0 + 3.5, 1);
  set('a velvet rope barrier', X0 + 7, Y0 + 3.5, 1);
  set("the heralds' trumpets, stopped", X0 + 8.4, Y0 + 1.2);
  set('a grand vase', X0 + 1.1, Y0 + 1.1);
  set('a grand vase', X0 + 1.2, Y0 + 10.2, 1);
  set('a standing candelabrum', X0 + 4.2, Y0 + 1.1, 0);
  set('a standing candelabrum', X0 + 7.1, Y0 + 1.1, 1);
  set('a royal card table', X0 + 9.4, Y0 + 6.4);
  set('a gilt chair', X0 + 9.4, Y0 + 5.3);
  set('a gilt chair', X0 + 10.8, Y0 + 7.6, 1);
  set('a silver tea service, left out', X0 + 2.6, Y0 + 6.2, 1);
  set('a hat stand, cloaks left on it', X0 + 1.1, Y0 + 6.2);
  set("a songbird's cage, silent", X0 + 12, Y0 + 3.4);
  set('a heap of invitations', X0 + 7.6, Y0 + 9.2, 0, true);
  set('a dropped fan and a rose', X0 + 3.6, Y0 + 9.8, 0, true);
  set('a royal card', X0 + 6.8, Y0 + 7.4, 1, true);
  stands.push({ d: X0 + 5.6 + Y0 + 8.4, s: knight(), x: X0 + 5.6, y: Y0 + 8.4, shadow: 0.36, hero: true });
  drawStands(stands, VX, VY);
  if (HASH === 'room:2') zoomCentre(W, H, 2);
}
(window as unknown as { __ready: boolean }).__ready = true;
