// Dev page: THE HEADSMAN'S FLOOR (art/floor2.ts), every piece, on the Crypt's second floor.
//   node tools/preview.mjs src/dev/preview_floor2.ts shots/floor2/sheet.png 2800 2400 "sheet:3"
//   hash = <mode>:<scale>[:<n>]
//     sheet   every piece by kind, a hero for size (n: the frame of what moves)
//     spots   every wall piece at each of its places on a wall three tiles long (his note: "I don’t
//             like the wall panels all being in the exact same spot")
//     room    a room of it laid as a picture, the warrior for size (n: the frame of what moves)
//     moment  one of its moments, every frame in a grid of cells (n: 0 the ravens, 1 the bell, 2 the
//             gibbet): what was there before (its loop, twice round), the moment, what is left. The page logs
//             "cells <before> <frames> <after> <columns> <cell w> <cell h>" for the film's maker.
// Scales are whole numbers only, so every pixel of the game is the same size in the picture.
import { cryptGround } from '../art/crypt';
import { headsmanMoments, headsmanPieces } from '../art/floor2';
import type { Piece, PieceKind } from '../art/floorkit';
import { GATE_UP, PILLAR, POST, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import { makeHeroArt3 } from '../art/heroes3';
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const [mode = 'sheet', scaleArg = '', nArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Math.max(1, Math.round(Number(scaleArg) || 2));
const F = Number(nArg) || 0;

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
function size(w: number, h: number): void {
  cv.width = w * S;
  cv.height = h * S;
  cv.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(cv);
  g.imageSmoothingEnabled = false;
  g.setTransform(S, 0, 0, S, 0, 0);
  g.fillStyle = '#07050a';
  g.fillRect(0, 0, w, h);
}
const draw = (s: Sprite, x: number, y: number): void => {
  g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
};
const label = (t: string, x: number, y: number, c = '#a3abd8'): void => {
  g.fillStyle = c;
  g.font = '6px monospace';
  g.fillText(t, x, y);
};

/**
 * THE SOFT SHADOW the game draws under what stands (render.ts, shadow: a soft oval, darkest under
 * it and gone at its rim, at 0.7): `r` its reach in tiles, as Piece.shadow gives it.
 */
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
function softShadow(cx: number, cy: number, r: number): void {
  const w = r * 22.6 * 1.5;
  const hh = r * 11.3 * 1.5;
  g.save();
  g.imageSmoothingEnabled = true;
  g.globalAlpha = 0.7;
  g.drawImage(blot, cx - w, cy - hh, w * 2, hh * 2);
  g.restore();
}

const ground = cryptGround(2);
const pieces = headsmanPieces();
const P = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

/** Things stood on the floor, drawn far to near. */
interface Stand {
  d: number;
  s: Sprite;
  x: number;
  y: number;
}
function standAll(list: Stand[]): void {
  list.sort((a, b) => a.d - b.d);
  for (const st of list) draw(st.s, st.x, st.y);
  // (then the light each gives off, added over all, as the game adds a prop's: render.ts, propLit)
  for (const st of list) drawLights(g, st.s, Math.round(st.x), Math.round(st.y));
}

/**
 * A DOORWAY of the floor's own door or gate, as the game stands one (render.ts, standDoors): three
 * tiles wide along +x (or along +y), its face on the line y = `face` (x = `face`), from `a`; `at`
 * turns tiles into the picture. A door's leaf swung a little open; a gate's portcullis part raised.
 */
function doorway(p: Piece, at: (x: number, y: number) => [number, number], a: number, face: number, out: Stand[], alongX = true): void {
  const G = p.gates!;
  const pos = (t: number, back = 0): [number, number] => (alongX ? [a + t, face - back] : [face - back, a + t]);
  const put = (depth: number, s: Sprite, x: number, y: number): void => {
    const [sx, sy] = at(x, y);
    out.push({ d: depth, s, x: sx, y: sy });
  };
  const strips = (list: Strip[], t0: number, back: number): void => {
    for (const q of list) {
      const [x, y] = pos(t0 + q.t, back);
      put(x + y + STRIP / 64, q.s, x, y);
    }
  };
  if (p.kind === 'gate') {
    const boss = p.name === "the boss's gate";
    const wide = PILLAR / 32;
    for (const [x, y] of [pos(0), pos(3 + wide)]) put(x + y - wide, G.pillar(boss), x, y);
    strips(G.portcullis(alongX, boss, GATE_UP / 3 - ((GATE_UP / 3) % 2)), -wide, wide);
    strips(G.arch(alongX, boss, false), -wide, 0);
    return;
  }
  const wide = POST / 32;
  for (const [x, y] of [pos(1), pos(2 + wide)]) put(x + y - wide, G.post, x, y);
  strips(G.lintel(alongX), 1, 0);
  // (a third of the way open: swung back from along the plane)
  const turn = Math.PI / 6;
  const along = Math.cos(turn);
  const back = Math.sin(turn);
  const dx = alongX ? along : -back;
  const dy = alongX ? -back : along;
  const [hx, hy] = pos(1);
  put(hx + hy + 0.5 * dx + 0.2 * dy, G.leaf(Math.round(32 * (dx - dy)), Math.round(16 * (dx + dy))), hx, hy);
}

const CW = 96;
const ROWS: [PieceKind[], string][] = [
  [['wall tile'], 'WALL TILES'],
  [['on the wall'], 'ON THE WALLS'],
  [['floor tile', 'trap'], 'FLOOR TILES AND TRAPS'],
  [['breakable', 'quest'], 'BREAKABLES, WHAT THEY LEAVE, THE QUEST'],
  [['on the floor'], 'ON THE FLOOR'],
  [['obstacle'], 'OBSTACLES'],
];

/** One cell: a patch of 3 x 3 tiles whose top corner is at (x, y), the piece where it belongs (a wall piece on a block of wall on its far tile, all else on its middle tile), its name under it. */
function cell(p: Piece, x: number, y: number): void {
  const f = (list: Sprite[] | undefined): Sprite | undefined => list?.[F % list.length];
  const at = (i: number, j: number): [number, number] => [x + (i - j) * 16, y + (i + j) * 8];
  const wall = !!(p.left && p.right);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (!(wall && i === 0 && j === 0)) draw(ground.floor(i + 3, j + 5), ...at(i, j));
  const [mx, my] = at(1, 1);
  if (wall) {
    const [wx, wy] = at(0, 0);
    draw(ground.faceLeft[0], wx, wy);
    draw(ground.faceRight[1], wx, wy);
    // (a wall piece with a heap of its own: on the floor before each face, drawn before the wall's face is)
    if (p.frames) {
      for (const q of [at(0.5, 1.5), at(1.5, 0.5)]) {
        if (p.shadow) softShadow(q[0], q[1], p.shadow);
        draw(p.frames[0], ...q);
      }
    }
    draw(f(p.left)!, wx - 8, wy + 12);
    draw(f(p.right)!, wx + 8, wy + 12);
  } else if (p.kind === 'breakable') {
    if (p.shadow) softShadow(mx - 14, my + 4, p.shadow);
    draw(p.frames![0], mx - 14, my + 4);
    draw(p.frames![1], mx + 16, my + 12);
  } else if (p.kind === 'floor tile') {
    draw(f(p.frames)!, mx, my);
  } else if (p.kind === 'trap') {
    // (traps lie flat at the middle of their tile; the spikes up and the plate trodden on beside them)
    draw(p.frames![0], mx, my + 8);
  } else {
    if (p.shadow) softShadow(mx, my + 8, p.shadow);
    draw(f(p.frames)!, mx, my + 8);
  }
  label(p.name, x - 34, y + 60);
}

if (mode === 'sheet') {
  const PER = 9;
  const RH = 128;
  let rows = 0;
  for (const [kinds] of ROWS) rows += Math.ceil(pieces.filter((p) => kinds.includes(p.kind)).length / PER);
  const DH = 150;
  size(CW * PER + 40, rows * RH + (ROWS.length + 1) * 10 + DH + 20);
  let y = 6;
  for (const [kinds, title] of ROWS) {
    label(title, 6, y + 6, '#e9ecff');
    y += 10;
    const list = pieces.filter((p) => kinds.includes(p.kind));
    list.forEach((p, i) => {
      const cx = 56 + (i % PER) * CW;
      const cy = y + Math.floor(i / PER) * RH;
      cell(p, cx, cy + 64);
    });
    y += Math.ceil(list.length / PER) * RH;
  }
  // a hero for size, beside the obstacles
  draw(hero.front.idle[0], CW * PER + 16, y - 40);
  // the doors and gates, each its doorway three tiles wide, whole, a hero by each for size: the door
  // in a wall along x (its leaf in the light) and in one along y (its leaf in shade), the gate, the boss's gate
  label('DOORS AND GATES', 6, y + 6, '#e9ecff');
  y += 10;
  const DW = (CW * PER + 40) / 4;
  ([['the door', true], ['the door', false], ['the gate', true], ["the boss's gate", true]] as const).forEach(([n, alongX], i) => {
    const ox = i * DW + DW / 2 + (alongX ? -8 : 8);
    const oy = y + 50;
    const at = (x: number, yy: number): [number, number] => [ox + (x - yy) * 16, oy + (x + yy) * 8];
    for (let tx = -1; tx < 5; tx++) for (let ty = -1; ty < 5; ty++) if (alongX ? ty >= 0 && ty < 3 : tx >= 0 && tx < 3) draw(ground.floor(tx + 9, ty + 2), ...at(tx, ty));
    const out: Stand[] = [];
    doorway(P(n), at, 0, 1, out, alongX);
    const [hx, hy] = alongX ? at(3.9, 2.2) : at(2.2, 3.9);
    out.push({ d: 6.1, s: hero.front.idle[0], x: hx, y: hy });
    standAll(out);
    label(alongX || n !== 'the door' ? n : 'the door, the other way', i * DW + 10, oy + 92);
  });
}
else if (mode === 'look') {
  // a few pieces close, by name, each in its cell as on the sheet (n: which few)
  const LOOKS: string[][] = [
    ['the long stain', 'the chute', 'sawdust', 'the block', 'the hood carved', 'the hood in the floor', 'bell niche', 'branding irons'],
    ['hoods on pegs', 'the great bell', 'the gibbet', 'the gallows', 'skull ledge', 'tools of the trade', 'his banner', 'axe on hooks'],
    ['the hood carved', 'the hood in the floor', 'tools of the trade', 'the great bell', "the boss's gate", "the Headsman's hood", 'hoods on pegs', 'branding irons'],
  ];
  const list = (LOOKS[F] ?? LOOKS[0]).map(P);
  const PER = 4;
  const RH = 150;
  size(CW * PER + 40, Math.ceil(list.length / PER) * RH + 20);
  list.forEach((p, i) => cell(p, 56 + (i % PER) * CW, 10 + Math.floor(i / PER) * RH + 90));
}
else if (mode === 'spots') {
  // every wall piece at each of its places: a wall three tiles long, the piece at its first, second
  // and third place on the three, so that the eye can see it move about
  const list = pieces.filter((p) => p.spots && p.spots.length > 1);
  const PER = 4;
  const CWs = 120;
  const RHs = 110;
  size(CWs * PER, Math.ceil(list.length / PER) * RHs + 10);
  list.forEach((p, i) => {
    // (the wall's foot from (ox, oy) down to the right; its pieces at their three places)
    const ox = (i % PER) * CWs + 36;
    const oy = Math.floor(i / PER) * RHs + 58;
    const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    for (let tx = 0; tx < 3; tx++) for (let ty = 1; ty < 3; ty++) draw(ground.floor(tx + 1, ty + 4), ...at(tx, ty));
    for (let tx = 0; tx < 3; tx++) {
      const [x, y] = at(tx, 0);
      draw(ground.faceLeft[tx % ground.faceLeft.length], x, y);
      const sp = p.spots![tx % p.spots!.length];
      draw(sp.left[F % sp.left.length], x - 8, y + 12);
    }
    label(p.name, (i % PER) * CWs + 6, oy + 48);
  });
}
else if (mode === 'room') {
  // a room of the Headsman's floor as the game would lay it: walls along the two far sides, the
  // pieces in it, the warrior for size. (Where each thing stands would be the main chat's rules.)
  const N = 10;
  // (room enough on the right for the chute's heap)
  const W0 = N * 32 + 100;
  size(W0, N * 16 + 150);
  const ox = W0 / 2;
  const oy = 100;
  const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
  const fr = (n: string, k = 0): Sprite => (P(n).frames!.length === 4 ? P(n).frames![F % 4] : P(n).frames![k]);
  const tiles = new Map<string, Sprite>([
    ['4,4', fr('sawdust')], ['5,5', fr('sawdust')], ['3,6', fr('gutter')], ['8,4', fr('trapdoor')], ['5,7', fr('the split floor')], ['6,7', fr('the split floor')],
    ['4,8', fr('the hood in the floor')], ['6,2', fr('cobbles')], ['7,2', fr('cobbles')], ['6,1', fr('cobbles')],
  ]);
  const wallAt = (tx: number, ty: number): boolean => tx === 0 || ty === 0;
  const stands: Stand[] = [];
  for (let s2 = 0; s2 <= 2 * (N - 1); s2++) for (let tx = 0; tx < N; tx++) {
    const ty = s2 - tx;
    if (ty < 0 || ty >= N) continue;
    const [x, y] = at(tx, ty);
    if (wallAt(tx, ty)) {
      if (ty + 1 < N && !wallAt(tx, ty + 1)) stands.push({ d: s2 + 1, s: ground.faceLeft[(tx * 7 + ty) % ground.faceLeft.length], x, y });
      if (tx + 1 < N && !wallAt(tx + 1, ty)) stands.push({ d: s2 + 1, s: ground.faceRight[(tx * 5 + ty) % ground.faceRight.length], x, y });
    } else {
      draw(tiles.get(`${tx},${ty}`) ?? ground.floor(tx, ty), x, y);
      if (wallAt(tx - 1, ty)) draw(ground.shadeLeft, x, y);
      if (wallAt(tx, ty - 1)) draw(ground.shadeRight, x, y);
      if (tx === N - 1) draw(ground.edgeRight, x, y);
      if (ty === N - 1) draw(ground.edgeLeft, x, y);
    }
  }
  // lying on the floor (flat: drawn before anything stands)
  for (const [n, x, y] of [['bones in irons', 3.4, 8.6], ['skulls in the sawdust', 6.2, 6.0], ['broken axe', 7.8, 4.6], ['coil of rope', 4.4, 1.8], ['broken wheel', 7.0, 9.0], ['basket', 6.4, 4.3]] as const) {
    const [px, py] = at(x, y);
    draw(n === 'basket' ? fr(n, 1) : fr(n), px, py);
  }
  // on the walls, each at one of its places, some walls left bare: the far wall's faces turned to
  // screen-left (along ty = 0), the near-left wall's turned to screen-right (along tx = 0)
  const onLeft: [number, string, number][] = [[1, 'the long stain', 0], [2, 'hoods on pegs', 1], [3, 'torch', 0], [4, 'bell niche', 2], [5, 'his banner', 0], [6, 'axe on hooks', 2], [7, 'torch', 1], [8, 'skull ledge', 1], [9, 'the chute', 0]];
  const onRight: [number, string, number][] = [[1, 'chain from the dark', 1], [2, 'hatch', 0], [3, 'torch', 2], [4, 'tools of the trade', 1], [5, 'the hood carved', 2], [6, 'black candles', 0], [7, 'noose', 2], [8, 'axe-scarred stone', 1], [9, 'branding irons', 0]];
  for (const [tx, n, k] of onLeft) {
    const [x, y] = at(tx, 0);
    const l = P(n).spots![k].left;
    stands.push({ d: tx + 1.01, s: l[F % l.length], x: x - 8, y: y + 12 });
  }
  for (const [ty, n, k] of onRight) {
    const [x, y] = at(0, ty);
    const r = P(n).spots![k].right;
    stands.push({ d: ty + 1.01, s: r[F % r.length], x: x + 8, y: y + 12 });
  }
  // what stands, its soft shadow under it
  const things: [string, number, number][] = [
    ['the scaffold', 6.5, 2.5], ['the block', 5.0, 4.4], ['basket', 5.6, 5.1], ['the gallows', 2.5, 2.4], ['kicked-over stool', 2.9, 3.6], ['the great bell', 8.6, 2.4], ['the gibbet', 8.6, 6.0],
    ['the stocks', 2.6, 6.6], ['the grindstone', 8.4, 8.0], ['brazier of irons', 1.6, 4.4], ["the headsman's strongbox", 1.5, 8.4], ['sawdust barrel', 1.4, 1.5], ['crate', 2.3, 1.2],
    ['pail', 6.0, 8.6], ['dropped lantern', 9.2, 8.8], ['the chute', 9.5, 1.5],
  ];
  for (const [n, x, y] of things) {
    const [px, py] = at(x, y);
    const p = P(n);
    if (p.shadow) softShadow(px, py, p.shadow);
    stands.push({ d: x + y, s: n === 'the chute' ? p.frames![0] : fr(n), x: px, y: py });
  }
  const [hx, hy] = at(5.5, 8.6);
  softShadow(hx, hy, 0.36);
  stands.push({ d: 14.1, s: hero.front.idle[0], x: hx, y: hy });
  standAll(stands);
}
else if (mode === 'moment') {
  // one of floor 2's moments in a grid of cells: what was there before (twice round, if it is a loop),
  // the moment, what is left. Each cell a patch of the floor, 7 x 7, the warrior standing by.
  //   n: 0 the ravens, 1 the bell, 2 the gibbet
  const which = F;
  const MS = headsmanMoments();
  const m = MS[Math.min(which, MS.length - 1)];
  const before = m.before ? (m.before.length > 1 ? [...m.before, ...m.before] : [m.before[0], m.before[0], m.before[0], m.before[0]]) : [];
  const after = m.after ? [m.after[0]] : [];
  const cells = [...before, ...m.frames, ...after];
  // (the ravens' cells tall and wide, for them to fly out of)
  const [CWm, CHm, TOP] = which === 0 ? [300, 330, 200] : [220, 224, 100];
  const COLS = 10;
  size(CWm * Math.min(COLS, cells.length), CHm * Math.ceil(cells.length / COLS));
  console.log(`cells ${before.length} ${m.frames.length} ${after.length} ${COLS} ${CWm * S} ${CHm * S}`);
  // (where it plays, and where he stands, in tiles of the patch; what stands there casts its shadow)
  const HERE: ReadonlyArray<readonly [number, number, number, number, string | null]> = [
    [3.0, 3.0, 5.7, 5.3, null],
    [3.4, 2.6, 1.8, 4.9, 'the great bell'],
    [3.0, 2.0, 4.6, 4.8, 'the gibbet'],
  ];
  const [mx, my, hxT, hyT, standing] = HERE[Math.min(which, HERE.length - 1)];
  // (THE SCREEN'S KICK at each jolt, as the game kicks it for a blow: the main chat's to do in the
  // game, drawn here so that the film shows it. The bell's strokes are heavy; the gibbet's lighter)
  const KICK: ReadonlyArray<readonly [number, number]> = which === 1 ? [[1, 3], [-1, -2], [0, 1]] : [[0, 2], [0, -1]];
  cells.forEach((fr, i) => {
    const ox = (i % COLS) * CWm + CWm / 2 - 8;
    const oy = Math.floor(i / COLS) * CHm + TOP;
    g.save();
    g.beginPath();
    g.rect((i % COLS) * CWm, Math.floor(i / COLS) * CHm, CWm, CHm);
    g.clip();
    const fi = i - before.length;
    const j = m.jolts.find((q) => fi - q >= 0 && fi - q < KICK.length);
    if (j !== undefined && fi < m.frames.length) g.translate(KICK[fi - j][0], KICK[fi - j][1]);
    const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    for (let tx = 0; tx < 7; tx++) for (let ty = 0; ty < 7; ty++) draw(ground.floor(tx, ty), ...at(tx, ty));
    const [px, py] = at(mx, my);
    const [hx, hy] = at(hxT, hyT);
    if (standing) softShadow(px, py, P(standing).shadow ?? 0.3);
    softShadow(hx, hy, 0.36);
    // (he is nearer than it: drawn after)
    draw(fr, px, py);
    draw(hero.front.idle[0], hx, hy);
    g.restore();
  });
}
else if (mode === 'strip') {
  // twelve frames of one of its moments, close, side by side on the floor, for a look at its shapes
  //   n: 0 the ravens, 1 the bell, 2 the gibbet; the frames picked evenly, and every jolt
  const MS = headsmanMoments();
  const m = MS[Math.min(F, MS.length - 1)];
  const n = m.frames.length;
  const pick = [...new Set([...Array.from({ length: 12 }, (_, i) => Math.round((i * (n - 1)) / 11)), ...m.jolts])].sort((a, b) => a - b).slice(0, 16);
  const CWs = 170;
  // (the ravens' cells tall, for them to fly up in)
  const CHs = F === 0 ? 300 : 190;
  const COLS = 4;
  size(CWs * COLS, CHs * Math.ceil(pick.length / COLS));
  pick.forEach((f, i) => {
    const ox = (i % COLS) * CWs + CWs / 2;
    const oy = Math.floor(i / COLS) * CHs + CHs - 40;
    g.save();
    g.beginPath();
    g.rect((i % COLS) * CWs, Math.floor(i / COLS) * CHs, CWs, CHs);
    g.clip();
    const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    for (let tx = -3; tx < 4; tx++) for (let ty = -3; ty < 4; ty++) draw(ground.floor(tx + 3, ty + 3), ...at(tx, ty));
    draw(m.frames[f], ox, oy);
    label(`${f}${m.jolts.includes(f) ? ' jolt' : ''}`, (i % COLS) * CWs + 4, Math.floor(i / COLS) * CHs + 10);
    g.restore();
  });
}
(window as unknown as { __ready: boolean }).__ready = true;
