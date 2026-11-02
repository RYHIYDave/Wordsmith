// Dev page: THE YARD'S OWN GATE (art/yard_gate.ts, behind YARD_GATE, off) standing in the yard's boss doorway at night, laid
// as the game lays a boss gate (render.ts, standDoors: a pillar at each end, the portcullis at the back of the arch, the
// arch's strips, each stood at its own depth), in the yard built from its game-ready pieces (art/yard.ts, the mock-up's),
// the dark laid over as the yard's mock-up lays it. Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_yard_gate.ts shots/yard_gate/sheet.png 1200 1700 "sheet"
//   node tools/film_frames.mjs src/dev/preview_yard_gate.ts "film" shots/yard_gate/film
import type { Sprite } from '../engine/px';
import { drawLights, flipSprite } from '../engine/px';
import { headsmanGates, headsmanPieces } from '../art/floor2';
import type { Piece } from '../art/floorkit';
import { GATE_UP, PILLAR, STRIP } from '../art/gates';
import type { GateArt, Strip } from '../art/gates';
import { makeHeroArt3 } from '../art/heroes3';
import { makeYardArt } from '../art/yard';
import { SLAM_FRAMES, YARD_SLAM_AT, makeYardGateArt, yardGateDropAt, yardGateSlam } from '../art/yard_gate';

const mode = decodeURIComponent(location.hash.slice(1)) || 'sheet';
const Y = makeYardArt();
const N = 13;
/** The scene, in picture pixels (two to a game pixel); the yard's far corner (tile (0, 0)'s top corner), in game pixels. */
const SW = 1400;
const SH = 900;
const OX = 300;
const OY = 200;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z / 2];
/** THE BOSS DOORWAY: three tiles of the far wall along x (the wall at y = -1), x = 5 to 7; the face turned to the eye at y = 0. */
const DOOR_A = 5;
const FACE = 0;
const WIDE = PILLAR / 32;
const TORCHES: [number, number][] = [[1.5, 0], [DOOR_A - 0.75, 0], [DOOR_A + 3.75, 0], [11.5, 0]];
const SIDE_TORCHES: [number, number][] = [[0, 3.5], [0, 7.5], [0, 11.5]];

const heroArt = makeHeroArt3().of('warrior', { twoHanded: false });
const own = headsmanPieces();
const P = (n: string): Piece => own.find((p) => p.name === n) ?? Y.pieces.find((p) => p.name === n)!;
const torch = Y.pieces.find((p) => p.name === "the yard's torch")!;
const flipped = new Map<Sprite, Sprite>();
const flip = (s: Sprite): Sprite => flipped.get(s) ?? (flipped.set(s, flipSprite(s)), flipped.get(s)!);

interface Scene {
  gate: GateArt;
  raise: number;
  lit: boolean;
  /** The slam's frame (-1: none). */
  slam: number;
  hero: { x: number; y: number; s: Sprite } | null;
  frame: number;
}

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
const pool = ((): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  const grd = q.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.7)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  q.fillStyle = grd;
  q.fillRect(0, 0, 128, 128);
  return c;
})();

/** The yard at night with the gate in its boss doorway, as the game would lay it: a canvas in picture pixels. */
function scene(o: Scene): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = SW;
  cv.height = SH;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#04040a';
  g.fillRect(0, 0, SW, SH);
  g.setTransform(2, 0, 0, 2, 0, 0);
  const draw = (s: Sprite, x: number, y: number): void => {
    g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  };
  const F = o.frame;
  // THE BACKDROP, the tower; THE PASSAGE beyond the doorway (dark, its floor, its wall on the left), then THE WALL far to near
  draw(Y.beyond, ...at(0, 0));
  g.fillStyle = '#04040a';
  g.beginPath();
  for (const [x, y, z] of [[DOOR_A, FACE, 0], [DOOR_A, FACE, 170], [DOOR_A, -7, 170], [DOOR_A + 3, -7, 170], [DOOR_A + 3, -7, 0], [DOOR_A + 3, FACE, 0]] as const) {
    const [sx, sy] = at(x, y, z);
    g.lineTo(sx, sy);
  }
  g.fill();
  for (let y = -6; y <= -1; y++) for (let x = DOOR_A; x < DOOR_A + 3; x++) draw(Y.floor(x, y), ...at(x, y));
  for (let y = -6; y <= -1; y++) draw(Y.faceRight[(y + 8) % 4], ...at(DOOR_A - 1, y));
  draw(Y.tower, ...at(0, 0));
  for (let s = 0; s < N; s++) draw(Y.faceRight[(s * 3 + 1) % 4], ...at(-1, s));
  for (const [x, y] of SIDE_TORCHES) draw(torch.right![F % 4], ...at(x, y));
  // THE FLOOR
  const tile = (n: string): Sprite => Y.tiles.find((p) => p.name === n)!.frames![0];
  const laid = new Map<string, Sprite>([
    ['11,11', tile('a little puddle')], ['8,11', tile('a puddle')],
    ['6,8', tile('yard sawdust')], ['5,8', tile('yard sawdust')], ['6,9', tile('yard sawdust')],
    ['3,1', tile('beaten earth')], ['3,2', tile('beaten earth')], ['4,2', tile('beaten earth')], ['4,3', tile('beaten earth')], ['9,3', tile('beaten earth')], ['10,3', tile('beaten earth')], ['11,2', tile('beaten earth')],
  ]);
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) draw(x === 0 ? tile('gutter along y') : laid.get(`${x},${y}`) ?? Y.floor(x, y), ...at(x, y));
  for (const [n, x, y] of [['a wide puddle', 2.6, 6.0], ['a great puddle', 10.8, 6.6], ['a wide puddle', 4.6, 11.2]] as const) draw(Y.pieces.find((p) => p.name === n)!.frames![0], ...at(x, y));
  // WHAT STANDS, far to near: the gate (as render.ts lays a boss gate), the yard's pieces, the figures
  interface Stand { d: number; s: Sprite; x: number; y: number; z: number; shadow: number }
  const stands: Stand[] = [];
  const put = (n: string, x: number, y: number, frame = 0, z = 0, d = x + y): void => {
    const p = P(n);
    stands.push({ d, s: p.frames![Math.min(frame, p.frames!.length - 1)], x, y, z, shadow: p.shadow ?? 0 });
  };
  const gat = (t: number, back = 0): [number, number] => [DOOR_A + t, FACE - back];
  const strips = (list: Strip[], t0: number, back: number): void => {
    for (const q of list) {
      const [x, y] = gat(t0 + q.t, back);
      stands.push({ d: x + y + STRIP / 64, s: q.s, x, y, z: 0, shadow: 0 });
    }
  };
  // (the far wall, a tile at a time, and its torches, among what stands: a figure in the passage beyond is behind it, the
  // gate's pillars and arch, which stand in the wall's face, in front of it)
  for (let s = 0; s < N; s++) {
    if (s >= DOOR_A && s < DOOR_A + 3) continue;
    stands.push({ d: s - 0.6, s: Y.faceLeft[(s * 5 + 2) % 4], x: s, y: -1, z: 0, shadow: 0 });
  }
  for (const [x, y] of TORCHES) stands.push({ d: x - 0.5, s: torch.left![F % 4], x, y, z: 0, shadow: 0 });
  const pillar = o.gate.pillar(true);
  for (const [x, y] of [gat(0), gat(3 + WIDE)]) stands.push({ d: x + y - WIDE, s: pillar, x, y, z: 0, shadow: 0 });
  strips(o.gate.portcullis(true, true, o.raise), -WIDE, WIDE);
  strips(o.gate.arch(true, true, o.lit), -WIDE, 0);
  if (o.slam >= 0) {
    const [x, y] = gat(1.5, WIDE);
    stands.push({ d: x + y + 0.3, s: yardGateSlam(true, o.slam), x, y, z: 0, shadow: 0 });
  }
  // (the yard's pieces laid so that the doorway in the middle of its far wall is seen: the gallows along the wall to its
  // left, the scaffold out in the yard to its right; the main chat lays the yard itself)
  put('the scaffold, draped', 10.0, 9.0, 0, 0, 19.0);
  put('the long gallows', 2.3, 1.05);
  put('the great bell', 1.4, 4.6);
  put('sawdust barrel', 1.3, 6.4);
  put('crate', 1.2, 7.2);
  put('the stocks', 2.0, 9.6);
  put('the gibbet', 1.1, 11.4);
  put('the grindstone', 11.9, 3.9);
  put('pail', 6.0, 9.4);
  put('brazier of irons', 3.6, 5.2, F % 4);
  put('brazier of irons', 11.0, 4.6, (F + 2) % 4);
  if (o.hero) stands.push({ d: o.hero.x + o.hero.y, s: o.hero.s, x: o.hero.x, y: o.hero.y, z: 0, shadow: 0.36 });
  stands.sort((a, b) => a.d - b.d);
  for (const st of stands) {
    const [sx, sy] = at(st.x, st.y, st.z);
    if (st.shadow) {
      const w = st.shadow * 22.6 * 1.5;
      const hh = st.shadow * 11.3 * 1.5;
      g.save();
      g.imageSmoothingEnabled = true;
      g.globalAlpha = 0.7;
      g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
      g.restore();
    }
    draw(st.s, sx, sy);
  }
  // THE DARK, as the yard's mock-up lays it: a moonlit dark, a hole cut by each light
  const dark = document.createElement('canvas');
  dark.width = SW / 2;
  dark.height = SH / 2;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = 'rgba(6,4,14,0.42)';
  dg.fillRect(0, 0, SW / 2, SH / 2);
  // (beyond the doorway, the passage: as dark as the Crypt)
  dg.fillStyle = 'rgba(4,3,10,0.5)';
  dg.beginPath();
  for (const [x, y, z] of [[DOOR_A, FACE - 0.4, 0], [DOOR_A, -7, 0], [DOOR_A, -7, 170], [DOOR_A + 3, -7, 170], [DOOR_A + 3, -7, 0], [DOOR_A + 3, FACE - 0.4, 0]] as const) dg.lineTo(...at(x, y, z));
  dg.fill();
  dg.globalCompositeOperation = 'destination-out';
  const spot = (x: number, y: number, r: number, strength: number): void => {
    dg.globalAlpha = Math.min(1, strength);
    dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
  };
  if (o.hero) {
    const [hx, hy] = at(o.hero.x, o.hero.y);
    spot(hx, hy - 8, 165, 1);
  } else {
    const [hx, hy] = at(7.6, 2.2);
    spot(hx, hy - 8, 165, 1);
  }
  for (const [x, y] of [[3.6, 5.2], [11.0, 4.6]]) {
    const [px, py] = at(x, y);
    spot(px, py - 14, 62, 0.9);
  }
  for (const [x, y] of [...TORCHES, ...SIDE_TORCHES]) {
    const [px, py] = at(x, y, 92);
    spot(px, py + 10, 48, 0.85);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(dark, 0, 0, SW, SH);
  g.setTransform(2, 0, 0, 2, 0, 0);
  for (const [x, y] of SIDE_TORCHES) drawLights(g, torch.right![F % 4], ...at(x, y));
  for (const st of stands) {
    // (the hero's blade gives no light through the wall while he is still in the passage beyond it)
    if (o.hero && st.s === o.hero.s && o.hero.y < -1) continue;
    const [sx, sy] = at(st.x, st.y, st.z);
    drawLights(g, st.s, Math.round(sx), Math.round(sy));
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

const NEW = makeYardGateArt();
const OLD = headsmanGates();
const idle = (f: number): Sprite => flip(heroArt.front.idle[Math.floor(f / 6) % heroArt.front.idle.length]);
/** Where the gate's face is on the scene: its middle at the floor, in picture pixels. */
const [GX, GY] = ((): [number, number] => {
  const [x, y] = at(DOOR_A + 1.5, FACE);
  return [x * 2, y * 2];
})();

// =================================================================================================

const FONT = '"Helvetica Neue", Arial, sans-serif';
function crop(g: CanvasRenderingContext2D, src: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, k: number): void {
  g.imageSmoothingEnabled = false;
  g.drawImage(src, sx, sy, sw, sh, dx, dy, sw * k, sh * k);
  g.strokeStyle = '#2a2c48';
  g.lineWidth = 2;
  g.strokeRect(dx - 1, dy - 1, sw * k + 2, sh * k + 2);
}
function caption(g: CanvasRenderingContext2D, text: string, x: number, y: number, size = 22, color = '#e8e4f4'): void {
  g.fillStyle = color;
  g.font = `600 ${size}px ${FONT}`;
  g.fillText(text, x, y);
}

if (mode === 'sheet') {
  const W = 1200;
  const H = 1880;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  document.body.style.margin = '0';
  document.body.style.background = '#0b0a16';
  document.body.appendChild(cv);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#0b0a16';
  g.fillRect(0, 0, W, H);
  caption(g, "The Headsman's yard: its own gate", 24, 44, 32);
  caption(g, "The prison's dark stone, as high as the yard's wall, in the same three-tile doorway. Not in the game yet.", 24, 76, 19, '#aaa6c4');
  // BEFORE and NOW, from the game's camera, the hero before it
  const hero = { x: 6.5, y: 2.5, s: idle(0) };
  const before = scene({ gate: OLD, raise: GATE_UP, lit: false, slam: -1, hero, frame: 0 });
  const now = scene({ gate: NEW, raise: GATE_UP, lit: false, slam: -1, hero, frame: 0 });
  const cw = 564;
  const ch = 420;
  const cx0 = GX - cw / 2 - 30;
  const cy0 = GY - 300;
  caption(g, "Before: the Crypt's boss gate in the yard's doorway", 24, 122);
  crop(g, before, cx0, cy0, cw, ch, 24, 136, 1);
  caption(g, "Now: the yard's own gate", 612, 122);
  crop(g, now, cx0, cy0, cw, ch, 612, 136, 1);
  // UP, HALFWAY, SLAMMED, twice as big
  const y2 = 610;
  const pw = 180;
  const ph = 272;
  const px0 = GX - 74;
  const py0 = GY - 232;
  const shots: [string, Scene][] = [
    ['Gate up', { gate: NEW, raise: GATE_UP, lit: false, slam: -1, hero: null, frame: 1 }],
    ['Halfway down', { gate: NEW, raise: GATE_UP / 2, lit: false, slam: -1, hero: null, frame: 2 }],
    ['Slammed: dust and sparks', { gate: NEW, raise: 0, lit: true, slam: 3, hero: null, frame: 3 }],
  ];
  shots.forEach(([t, o], i) => {
    const x = 24 + i * 392;
    caption(g, t, x, y2);
    crop(g, scene(o), px0, py0, pw, ph, x, y2 + 14, 2);
  });
  // THE ARCH CLOSE, three times as big; HIS MARK, in embers and alight
  const y3 = y2 + 14 + ph * 2 + 52;
  const close = scene({ gate: NEW, raise: GATE_UP, lit: false, slam: -1, hero: null, frame: 0 });
  const closeLit = scene({ gate: NEW, raise: 0, lit: true, slam: -1, hero: null, frame: 0 });
  const aw = 160;
  const ah = 190;
  caption(g, 'The arch, three times as big', 24, y3);
  crop(g, close, GX - 80, GY - 192, aw, ah, 24, y3 + 14, 3);
  const mw = 56;
  const mh = 56;
  // (the keystone's middle on the scene: the face's middle, the mark's height)
  const kx = GX - 1;
  const ky = GY - 133;
  caption(g, 'His mark: a block and his axe, in embers', 530, y3);
  crop(g, close, kx - mw / 2, ky - mh / 2, mw, mh, 530, y3 + 14, 5);
  caption(g, 'Alight, once the gate has fallen behind you', 530, y3 + 14 + mh * 5 + 44);
  crop(g, closeLit, kx - mw / 2, ky - mh / 2, mw, mh, 530, y3 + 14 + mh * 5 + 58, 5);
  (window as unknown as { __ready: boolean }).__ready = true;
}

// =================================================================================================
// THE FILM: the hero walks through the gate into the yard; the portcullis slams down behind him; the slam again at half speed

if (mode === 'film') {
  const FW = 1280;
  const FH = 720;
  const K = 2;
  const cw = FW / K;
  const chh = FH / K;
  const fx0 = GX - cw / 2 - 60;
  const fy0 = GY - 250;
  interface Shot { o: Scene; text: string }
  const shots: Shot[] = [];
  const stride = heroArt.front.walkStride ?? 1;
  const walk = heroArt.front.walk;
  const from = -2.9;
  const to = 2.4;
  const speed = 3.6 / 30;
  let f = 0;
  // the hero waits in the dark of the passage, then walks out under the gate
  for (let i = 0; i < 24; i++, f++) shots.push({ o: { gate: NEW, raise: GATE_UP, lit: false, slam: -1, hero: { x: DOOR_A + 1.5, y: from, s: idle(f) }, frame: f >> 2 }, text: "Into the Headsman's yard, under its own gate" });
  let y = from;
  while (y < to) {
    y = Math.min(to, y + speed);
    const walked = y - from;
    const s = flip(walk[Math.round((walked / stride) * walk.length) % walk.length]);
    shots.push({ o: { gate: NEW, raise: GATE_UP, lit: false, slam: -1, hero: { x: DOOR_A + 1.5, y, s }, frame: f >> 2 }, text: "Into the Headsman's yard, under its own gate" });
    f++;
  }
  const hold = (n: number, o: Omit<Scene, 'frame' | 'hero'>, text: string): void => {
    for (let i = 0; i < n; i++, f++) shots.push({ o: { ...o, hero: { x: DOOR_A + 1.5, y: to, s: idle(f) }, frame: f >> 2 }, text });
  };
  hold(20, { gate: NEW, raise: GATE_UP, lit: false, slam: -1 }, "Into the Headsman's yard, under its own gate");
  const drop = (slow: number, text: string): void => {
    const n = YARD_SLAM_AT + SLAM_FRAMES + 4;
    for (let i = 0; i < n; i++) for (let k = 0; k < slow; k++, f++) shots.push({ o: { gate: NEW, ...yardGateDropAt(i), hero: { x: DOOR_A + 1.5, y: to, s: idle(f) }, frame: f >> 2 }, text });
  };
  drop(1, 'and the gate slams down behind him');
  hold(45, { gate: NEW, raise: 0, lit: true, slam: -1 }, 'and the gate slams down behind him');
  hold(20, { gate: NEW, raise: GATE_UP, lit: false, slam: -1 }, 'Again, at half speed');
  drop(2, 'Again, at half speed');
  hold(50, { gate: NEW, raise: 0, lit: true, slam: -1 }, 'Again, at half speed');
  const out = document.createElement('canvas');
  out.width = FW;
  out.height = FH;
  const og = out.getContext('2d') as CanvasRenderingContext2D;
  const w = window as unknown as { __frames: number; __frame: (k: number) => string; __ready: boolean };
  w.__frames = shots.length;
  w.__frame = (k: number): string => {
    const sh = shots[k];
    og.fillStyle = '#04040a';
    og.fillRect(0, 0, FW, FH);
    og.imageSmoothingEnabled = false;
    og.drawImage(scene(sh.o), fx0, fy0, cw, chh, 0, 0, FW, FH);
    og.fillStyle = 'rgba(4,4,10,0.72)';
    og.fillRect(0, FH - 64, FW, 64);
    caption(og, sh.text, 32, FH - 22, 30);
    return out.toDataURL('image/png');
  };
  w.__ready = true;
}

// =================================================================================================
// (FOR CHECKING) the gate alone, in a wall along x and in one along y, as render.ts lays it; and the slam's frames
if (mode === 'check') {
  const W = 1200;
  const H = 1100;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  document.body.style.margin = '0';
  document.body.appendChild(cv);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#20203a';
  g.fillRect(0, 0, W, H);
  g.imageSmoothingEnabled = false;
  g.setTransform(2, 0, 0, 2, 0, 0);
  const lay = (alongX: boolean, ox: number, oy: number, raise: number, lit: boolean): void => {
    const A = NEW;
    const scr = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    const list: { d: number; s: Sprite; x: number; y: number }[] = [];
    const a0 = 0;
    const face = 0;
    const atp = (t: number, back = 0): [number, number] => (alongX ? [a0 + t, face - back] : [face - back, a0 + t]);
    for (const [x, y] of [atp(0), atp(3 + WIDE)]) list.push({ d: x + y - WIDE, s: A.pillar(true), x, y });
    for (const q of A.portcullis(alongX, true, raise)) {
      const [x, y] = atp(-WIDE + q.t, WIDE);
      list.push({ d: x + y + STRIP / 64, s: q.s, x, y });
    }
    for (const q of A.arch(alongX, true, lit)) {
      const [x, y] = atp(-WIDE + q.t, 0);
      list.push({ d: x + y + STRIP / 64, s: q.s, x, y });
    }
    list.sort((m, n) => m.d - n.d);
    for (const it of list) {
      const [sx, sy] = scr(it.x, it.y);
      g.drawImage(it.s.img, Math.round(sx) - it.s.ax, Math.round(sy) - it.s.ay, it.s.w, it.s.h);
    }
  };
  lay(true, 70, 130, GATE_UP, false);
  lay(false, 330, 130, GATE_UP / 2, true);
  for (let f = 0; f < SLAM_FRAMES; f++) {
    const s = yardGateSlam(f % 2 === 0, f);
    const x = 80 + (f % 4) * 140;
    const y = 250 + Math.floor(f / 4) * 70;
    g.drawImage(s.img, x - s.ax, y - s.ay, s.w, s.h);
  }
  (window as unknown as { __ready: boolean }).__ready = true;
}
