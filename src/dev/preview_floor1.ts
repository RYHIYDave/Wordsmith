// Dev page: THE WARDEN'S FLOOR (art/floor1.ts), every piece, on the Crypt's first floor.
//   node tools/preview.mjs src/dev/preview_floor1.ts shots/floor1/sheet.png 1400 1100 "sheet:2"
//   hash = <mode>:<scale>[:<frame>]   mode: sheet (every piece by kind, a hero for size)
import { cryptGround } from '../art/crypt';
import { candles, wardenMoments, wardenPieces } from '../art/floor1';
import type { Piece, PieceKind } from '../art/floor1';
import { makeHeroArt3 } from '../art/heroes3';
import type { Sprite } from '../engine/px';

const [mode = 'sheet', scaleArg = '', frameArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 2;
const F = Number(frameArg) || 0;

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

const ground = cryptGround(1);
/** A patch of floor, `n` tiles each way, its top corner at (x, y). */
function patch(x: number, y: number, n: number, seed: number): void {
  for (let tx = 0; tx < n; tx++) for (let ty = 0; ty < n; ty++) draw(ground.floor(tx + seed, ty + seed * 3), x + (tx - ty) * 16, y + (tx + ty) * 8);
}

const CW = 96;
const ROWS: [PieceKind[], string][] = [
  [['wall tile'], 'WALL TILES'],
  [['on the wall'], 'ON THE WALLS'],
  [['floor tile', 'trap'], 'FLOOR TILES AND TRAPS'],
  [['breakable', 'broken', 'quest'], 'BREAKABLES, WHAT THEY LEAVE, THE QUEST'],
  [['on the floor'], 'ON THE FLOOR'],
  [['obstacle'], 'OBSTACLES'],
  [['door', 'gate'], 'DOORS AND GATES'],
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
    draw(f(p.left)!, wx - 8, wy + 12);
    draw(f(p.right)!, wx + 8, wy + 12);
  } else if (p.kind === 'floor tile') {
    draw(f(p.frames)!, mx, my);
  } else if (p.kind === 'door') {
    draw(p.frames![0], mx - 16, my + 8);
  } else {
    draw(f(p.frames)!, mx, my + 8);
  }
  label(p.name, x - 34, y + 60);
}

if (mode === 'sheet') {
  const pieces = wardenPieces();
  const PER = 9;
  const RH = 128;
  let rows = 0;
  for (const [kinds] of ROWS) rows += Math.ceil(pieces.filter((p) => kinds.includes(p.kind)).length / PER);
  size(CW * PER + 40, rows * RH + ROWS.length * 10 + 20);
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
  const hero = makeHeroArt3().of('warrior', { twoHanded: false });
  draw(hero.front.idle[0], CW * PER + 20, y - 40);
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
  const pieces = wardenPieces();
  const P = (n: string): Piece => pieces.find((q) => q.name === n)!;
  const fr = (n: string): Sprite => P(n).frames![F % P(n).frames!.length];
  const tiles = new Map<string, Sprite>([
    ['2,4', fr("the king's runner")], ['3,4', fr("the king's runner")], ['4,4', fr("the king's runner")], ['5,4', fr("the king's runner")], ['6,4', fr("the king's runner")], ['7,4', fr("the runner's end")],
    ['3,7', fr('ledger stone')], ['6,8', fr('ledger stone')], ['7,1', fr('grave slab and ring')], ['4,2', fr('the crown in the floor')], ['8,8', fr('drain')], ['2,8', fr('sunken grave slab')],
  ]);
  const wallAt = (tx: number, ty: number): boolean => tx === 0 || ty === 0;
  interface Stand { d: number; s: Sprite; x: number; y: number }
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
  // on the walls: the far wall's faces turned to screen-left (along ty = 0), the near-left wall's turned to screen-right (along tx = 0)
  const onLeft: [number, string][] = [[2, 'banner'], [3, 'torch'], [4, 'burial niche'], [5, 'shield'], [6, "the king's head"], [7, 'torch'], [8, 'sealed niche'], [9, 'crossed mauls']];
  const onRight: [number, string][] = [[2, 'banner in rags'], [3, 'barred window'], [4, 'torch'], [5, 'horned skull'], [6, 'keys on a hook'], [7, 'shackles'], [8, 'horned helm on a peg'], [9, 'fallen-in stones']];
  for (const [tx, n] of onLeft) {
    const [x, y] = at(tx, 0);
    const l = P(n).left!;
    stands.push({ d: tx + 1.01, s: l[F % l.length], x: x - 8, y: y + 12 });
  }
  for (const [ty, n] of onRight) {
    const [x, y] = at(0, ty);
    const r = P(n).right!;
    stands.push({ d: ty + 1.01, s: r[F % r.length], x: x + 8, y: y + 12 });
  }
  // lying on the floor (flat: drawn before anything stands)
  for (const [n, x, y] of [['fallen guard', 7.5, 7.6], ['dropped keys', 4.2, 6.2], ['fallen banner', 4.6, 3.1], ["the effigy's head", 6.7, 5.3], ['horned helm', 3.2, 8.6], ['candles', 6.5, 2.6], ['chain', 8.6, 2.4], ['urn shards and ash', 1.6, 6.4]] as const) {
    const [px, py] = at(x, y);
    draw(fr(n), px, py);
  }
  const hero = makeHeroArt3().of('warrior', { twoHanded: false });
  for (const [n, x, y] of [
    ["the king's throne", 5.5, 1.5], ["the king's tomb", 5.5, 6.5], ['sarcophagus', 2.5, 6.5], ['open sarcophagus', 8.5, 7.0], ['horned knight', 3.5, 2.5], ['horned knight', 7.5, 2.5],
    ['pillar', 3.5, 4.5], ['pillar', 7.5, 4.5], ['cresset', 1.5, 3.5], ['cresset', 9.5, 3.5], ['funeral urn', 1.5, 8.5], ['squat urn', 1.5, 7.6], ['bone box', 9.4, 1.4], ['skull jar', 1.4, 1.5],
    ['rack of mauls', 9.5, 5.5], ["the king's coffer", 1.5, 5.0],
  ] as const) {
    const [px, py] = at(x, y);
    stands.push({ d: x + y, s: fr(n), x: px, y: py });
  }
  const [hx, hy] = at(5.5, 8.6);
  stands.push({ d: 14.1, s: hero.front.idle[0], x: hx, y: hy });
  stands.sort((a, b) => a.d - b.d);
  for (const st of stands) draw(st.s, st.x, st.y);
}
else if (mode === 'moment') {
  // one of floor 1's moments, every frame side by side, each in its place: a patch of floor 5 x 5
  // whose far corner has walls; the warrior standing by
  const which = Number(frameArg) || 0;
  const m = wardenMoments()[which];
  const CWm = 180;
  const CHm = 240;
  size(CWm * m.frames.length, CHm);
  const pieces = wardenPieces();
  const hero = makeHeroArt3().of('warrior', { twoHanded: false });
  m.frames.forEach((fr, i) => {
    const ox = i * CWm + CWm / 2;
    const oy = 120;
    const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    const wallAt = (tx: number, ty: number): boolean => ty === 0;
    for (let tx = 0; tx < 6; tx++) for (let ty = 0; ty < 6; ty++) {
      const [x, y] = at(tx, ty);
      if (!wallAt(tx, ty)) {
        draw(ground.floor(tx, ty), x, y);
        if (wallAt(tx, ty - 1)) draw(ground.shadeRight, x, y);
      }
    }
    for (let tx = 0; tx < 6; tx++) {
      const [x, y] = at(tx, 0);
      draw(ground.faceLeft[tx % ground.faceLeft.length], x, y);
    }
    if (which === 1) {
      // the niche they run into, in the wall's face over (3, 0)
      const [x, y] = at(3, 0);
      draw(pieces.find((q) => q.name === 'burial niche')!.left![0], x - 8, y + 12);
      draw(fr, x - 8, y + 12);
      const [hx, hy] = at(1.2, 4.6);
      draw(hero.front.idle[0], hx, hy);
    } else if (which === 0) {
      const [hx, hy] = at(2.4, 3.5);
      draw(hero.front.idle[0], hx, hy);
      const [sx, sy] = at(3.4, 2.6);
      draw(fr, sx, sy);
    } else {
      const [cx, cy] = at(3, 2.5);
      draw(candles(i, false), cx, cy);
      draw(fr, cx, cy);
      const [hx, hy] = at(1.3, 3.8);
      draw(hero.front.idle[0], hx, hy);
    }
  });
}
(window as unknown as { __ready: boolean }).__ready = true;
