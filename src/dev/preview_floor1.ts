// Dev page: THE WARDEN'S FLOOR (art/floor1.ts), every piece, on the Crypt's first floor.
//   node tools/preview.mjs src/dev/preview_floor1.ts shots/floor1/sheet.png 2800 2400 "sheet:3"
//   hash = <mode>:<scale>[:<n>]
//     sheet   every piece by kind, a hero for size (n: the frame of what moves)
//     spots   every wall piece at each of its places on a wall three tiles long (his note: "I don’t
//             like the wall panels all being in the exact same spot")
//     room    a room of it laid as a picture, the warrior for size (n: the frame of what moves)
//     moment  one of its moments, every frame in a grid of cells (n: 0 the stone, 1 the rats into a
//             face turned to screen-left, 2 the candle, 3 the rats into a face turned to screen-right):
//             what was there before (its loop, twice round), the moment, what is left. The page logs
//             "cells <before> <frames> <after> <columns> <cell w> <cell h>" for the film's maker.
// Scales are whole numbers only, so every pixel of the game is the same size in the picture.
import { cryptGround } from '../art/crypt';
import { wardenMoments, wardenPieces } from '../art/floor1';
import type { Piece, PieceKind } from '../art/floor1';
import { GATE_UP, PILLAR, POST, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import { makeHeroArt3 } from '../art/heroes3';
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

const ground = cryptGround(1);
const pieces = wardenPieces();
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
  // a room of the Warden's floor as the game would lay it: walls along the two far sides, the
  // pieces in it, the warrior for size. (Where each thing stands would be the main chat's rules.)
  const N = 10;
  const W0 = N * 32 + 40;
  size(W0, N * 16 + 120);
  const ox = W0 / 2;
  const oy = 70;
  const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
  const fr = (n: string, k = 0): Sprite => (P(n).frames!.length === 4 ? P(n).frames![F % 4] : P(n).frames![k]);
  // the king's runner along y, from the foot of his throne down the room to where its fringe ends
  const tiles = new Map<string, Sprite>([
    ['5,2', fr("the king's runner", 3)], ['5,3', fr("the king's runner", 4)], ['5,4', fr("the king's runner", 3)], ['5,5', fr("the king's runner", 4)], ['5,6', fr("the king's runner", 3)], ['5,7', fr("the king's runner", 5)],
    ['2,4', fr('ledger stone')], ['7,8', fr('ledger stone')], ['8,1', fr('grave slab and ring')], ['3,1', fr('the crown in the floor')], ['8,6', fr('drain')], ['2,8', fr('sunken grave slab')],
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
  for (const [n, x, y] of [['fallen guard', 7.2, 8.6], ['dropped keys', 3.8, 5.8], ['fallen banner', 2.3, 2.6], ['chain', 8.4, 3.2], ['funeral urn', 1.7, 6.6]] as const) {
    const [px, py] = at(x, y);
    draw(n === 'funeral urn' ? fr(n, 1) : fr(n), px, py);
  }
  // on the walls, each at one of its places, some walls left bare: the far wall's faces turned to
  // screen-left (along ty = 0), the near-left wall's turned to screen-right (along tx = 0)
  const onLeft: [number, string, number][] = [[1, 'great crack', 0], [3, 'torch', 0], [4, 'banner', 1], [6, 'banner', 2], [7, 'torch', 1], [8, 'shield', 2], [9, 'crumbled wall', 0]];
  const onRight: [number, string, number][] = [[1, 'sealed niche', 2], [2, 'barred window', 0], [3, 'fallen-in stones', 1], [4, 'torch', 2], [5, 'horned skull', 1], [6, 'burial niche', 2], [7, 'shackles', 2], [8, 'rat hole', 1], [9, 'keys on a hook', 0]];
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
    ["the king's throne", 5.5, 1.5], ['horned knight', 3.6, 2.2], ['horned knight', 7.6, 2.2], ['candles', 4.6, 2.9], ['crumbled wall', 9.5, 1.5],
    ['pillar', 3.5, 4.6], ['pillar', 7.5, 4.6], ['cresset', 1.5, 3.6], ['cresset', 9.5, 4.0], ["the king's tomb", 2.6, 7.1], ['open sarcophagus', 8.4, 7.2], ['sarcophagus', 8.4, 5.9],
    ['funeral urn', 1.5, 8.5], ['squat urn', 1.4, 7.6], ['bone box', 2.4, 1.4], ['skull jar', 1.4, 1.6], ['rack of mauls', 9.4, 2.8], ["the king's coffer", 1.5, 5.0],
    ["the statue's head", 6.6, 3.6], ['horned helm', 3.2, 8.9],
  ];
  for (const [n, x, y] of things) {
    const [px, py] = at(x, y);
    const p = P(n);
    if (p.shadow) softShadow(px, py, p.shadow);
    stands.push({ d: x + y, s: n === 'crumbled wall' ? p.frames![0] : fr(n), x: px, y: py });
  }
  const [hx, hy] = at(5.5, 8.6);
  softShadow(hx, hy, 0.36);
  stands.push({ d: 14.1, s: hero.front.idle[0], x: hx, y: hy });
  standAll(stands);
}
else if (mode === 'moment') {
  // one of floor 1's moments in a grid of cells: what was there before (twice round, if it is a loop),
  // the moment, what is left. Each cell a patch of floor 6 x 6 with a wall along its far side (for one
  // played in a face turned to screen-right, along its left side), the warrior standing by.
  //   n: 0 the stone (a face turned to screen-left), 4 the stone (one turned to screen-right),
  //      1 the rats (left), 3 the rats (right), 2 the candle
  const which = F;
  const m = wardenMoments()[which === 3 ? 1 : which === 4 ? 0 : which];
  const right = which === 3 || which === 4;
  const film = right ? m.right! : m;
  const before = film.before ? (film.before.length > 1 ? [...film.before, ...film.before] : [film.before[0], film.before[0], film.before[0], film.before[0]]) : [];
  const after = film.after ? [film.after[0]] : [];
  const cells = [...before, ...film.frames, ...after];
  const CWm = 210;
  const CHm = 190;
  const COLS = 10;
  size(CWm * Math.min(COLS, cells.length), CHm * Math.ceil(cells.length / COLS));
  console.log(`cells ${before.length} ${film.frames.length} ${after.length} ${COLS} ${CWm * S} ${CHm * S}`);
  cells.forEach((fr, i) => {
    const ox = (i % COLS) * CWm + CWm / 2;
    const oy = Math.floor(i / COLS) * CHm + 66;
    g.save();
    g.beginPath();
    g.rect((i % COLS) * CWm, Math.floor(i / COLS) * CHm, CWm, CHm);
    g.clip();
    const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    const wallAt = (tx: number, ty: number): boolean => (right ? tx === 0 : ty === 0);
    for (let tx = 0; tx < 6; tx++) for (let ty = 0; ty < 6; ty++) {
      const [x, y] = at(tx, ty);
      if (!wallAt(tx, ty)) {
        draw(ground.floor(tx, ty), x, y);
        if (wallAt(tx, ty - 1)) draw(ground.shadeRight, x, y);
        if (wallAt(tx - 1, ty)) draw(ground.shadeLeft, x, y);
      }
    }
    for (let k = 1; k < 6; k++) {
      if (right) draw(ground.faceRight[k % ground.faceRight.length], ...at(0, k - 1));
      else draw(ground.faceLeft[k % ground.faceLeft.length], ...at(k, 0));
    }
    // (where it plays: at the foot of the wall's face over (3, 0), or over (0, 3); the candles on the floor)
    const [wx, wy] = right ? at(0, 3) : at(3, 0);
    const [px, py] = right ? [wx + 8, wy + 12] : [wx - 8, wy + 12];
    const [hx, hy] = which === 2 ? at(1.4, 3.8) : right ? at(4.4, 1.6) : at(1.6, 4.4);
    if (which === 1 || which === 3) draw(right ? P('rat hole').right![0] : P('rat hole').left![0], px, py);
    softShadow(hx, hy, 0.36);
    if (which === 2) {
      const [cx, cy] = at(3, 2.5);
      softShadow(cx, cy, P('candles').shadow ?? 0.2);
      draw(fr, cx, cy);
    } else draw(fr, px, py);
    draw(hero.front.idle[0], hx, hy);
    g.restore();
  });
}
(window as unknown as { __ready: boolean }).__ready = true;
