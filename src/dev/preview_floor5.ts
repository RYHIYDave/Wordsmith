// Dev page: THE FLESHMANCER'S LAIR (art/lair.ts, art/floor5.ts), the Crypt's fifth floor.
//   node tools/preview.mjs src/dev/preview_floor5.ts shots/floor5/sheet.png 2800 2400 "sheet:3"
//   hash = <mode>:<scale>[:<n>]
//     grounds  the five floors' ground side by side, the same patch of each, walls along its far sides
//     sheet    every piece by kind, a hero for size (n: the frame of what moves)
//     pick     the pieces named after the scale, split by '|'
//     spots    every wall piece at each of its places on a wall three tiles long
//     room     a room of it laid as a picture, the warrior for size (n: which room, and the frame)
// Scales are whole numbers only, so every pixel of the game is the same size in the picture.
import { cryptGround } from '../art/crypt';
import { lairPieces } from '../art/floor5';
import { cageDown, cageUp, riderDark } from '../art/shaft';
import { BEYOND } from '../art/floorkit';
import { lairMoment } from '../art/floor5_moments';
import type { Piece, PieceKind } from '../art/floorkit';
import { GATE_UP, PILLAR, POST, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import { makeGroundArt } from '../art/ground';
import type { GroundArt, Theme } from '../art/ground';
import { makeHeroArt3 } from '../art/heroes3';
import { LAIR, lairGround } from '../art/lair';
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const [mode = 'grounds', scaleArg = '', nArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
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
/** The hero riding up in the cage, taken by the dark with it (art/shaft.ts, riderDark): his picture, row by row mixed toward BEYOND. */
function rider(s: Sprite, lift: number): Sprite {
  const src = s.img as HTMLCanvasElement;
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const x2 = c.getContext('2d') as CanvasRenderingContext2D;
  x2.drawImage(src, 0, 0);
  const d = x2.getImageData(0, 0, c.width, c.height);
  const k = s.h / c.height;
  let top = c.height;
  for (let i = 3; i < d.data.length; i += 4) if (d.data[i] > 0) { top = Math.floor((i >> 2) / c.width); break; }
  const tall = Math.max(1, s.ay - top * k);
  const b = [1, 3, 5].map((j) => parseInt(BEYOND.slice(j, j + 2), 16));
  for (let y = 0; y < c.height; y++) {
    const m = riderDark(lift, (s.ay - y * k) / tall);
    if (m === 0) continue;
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (m >= 1) d.data[i + 3] = 0;
      else for (let j = 0; j < 3; j++) d.data[i + j] = Math.round(d.data[i + j] + (b[j] - d.data[i + j]) * m);
    }
  }
  x2.putImageData(d, 0, 0);
  return { ...s, img: c };
}
const label = (t: string, x: number, y: number, c = '#a3abd8'): void => {
  g.fillStyle = c;
  g.font = '6px monospace';
  g.fillText(t, x, y);
};

/** A patch of a floor, `n` tiles a side, its walls along the two far sides, from (ox, oy) its top corner; its tiles from (x0, y0) of the floor. */
function patch(ground: GroundArt, ox: number, oy: number, n: number, x0 = 0, y0 = 0): void {
  const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
  const wallAt = (tx: number, ty: number): boolean => tx === 0 || ty === 0;
  for (let s2 = 0; s2 <= 2 * (n - 1); s2++) for (let tx = 0; tx < n; tx++) {
    const ty = s2 - tx;
    if (ty < 0 || ty >= n) continue;
    const [x, y] = at(tx, ty);
    if (wallAt(tx, ty)) {
      if (ty + 1 < n && !wallAt(tx, ty + 1)) draw(ground.faceLeft[(tx * 7 + ty) % ground.faceLeft.length], x, y);
      if (tx + 1 < n && !wallAt(tx + 1, ty)) draw(ground.faceRight[(tx * 5 + ty) % ground.faceRight.length], x, y);
    } else {
      draw(ground.floor(x0 + tx, y0 + ty), x, y);
      if (wallAt(tx - 1, ty)) draw(ground.shadeLeft, x, y);
      if (wallAt(tx, ty - 1)) draw(ground.shadeRight, x, y);
    }
  }
}

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

const ground = lairGround();
const pieces = lairPieces();
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
    draw(f(p.frames)!, mx, my + 8);
  } else {
    if (p.shadow) softShadow(mx, my + 8, p.shadow);
    draw(f(p.frames)!, mx, my + 8);
  }
  label(p.name, x - 34, y + 60);
}

if (mode === 'grounds') {
  const N = 9;
  const PW = N * 32 + 8;
  const grounds: [GroundArt, string][] = [[cryptGround(1), 'floor 1'], [cryptGround(2), 'floor 2'], [cryptGround(3), 'floor 3'], [cryptGround(4), 'floor 4'], [lairGround(), 'floor 5, the lair']];
  size(PW * 5, N * 16 + 70);
  grounds.forEach(([gr, name], i) => {
    patch(gr, i * PW + PW / 2, 44, N, F, F);
    label(name, i * PW + PW / 2 - 20, N * 16 + 62, i === 4 ? '#ffd27a' : '#a3abd8');
  });
} else if (mode === 'variants') {
  // the lair's ground with other shares gone, to choose
  const N = 9;
  const PW = N * 32 + 8;
  const vs: [number, number][] = [[0.8, 0.8], [0.9, 0.9], [0.95, 0.95], [1, 1]];
  size(PW * vs.length, N * 16 + 70);
  vs.forEach(([gone, raw], i) => {
    const th: Theme = { ...LAIR, id: `crypt5v${i}`, earth: { ...LAIR.earth!, gone, raw } };
    patch(makeGroundArt(th), i * PW + PW / 2, 44, N, F, F);
    label(`gone ${gone} raw ${raw}`, i * PW + PW / 2 - 20, N * 16 + 62);
  });
}
else if (mode === 'sheet') {
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
    ['the skull wall', 'bone-lined niche', "the miners' breach", "the dead's arm", 'garland of skulls', "the cult's candle", "the cult's daub", 'jaw slot'],
    ['the mine cart', "the rails' end", 'the windlass', 'pyramid of skulls', 'the charnel heap', "the cult's altar", 'the bone column', 'the boulder'],
    ['the rails', 'earth and bones', 'raked earth', 'bone-paved floor', 'the drag', 'spilled ore', 'bone spikes', 'rotten boards'],
    ['empty boots', 'rib cage', 'arm from a heap', "a cultist's robe", 'heap of skulls', 'the eldest skull', 'ore tub', 'oil jug'],
    ["miner's lantern", 'pick in the wall', "the miners' tools", "the miners' ladder", 'ribs on a spike', 'shored rock', 'seam of ore', 'the charnel layer'],
    ['timber crib', 'the reliquary', "the rails' end", 'drill steels', 'broken ladder', 'snapped prop', 'ore sack', "the cult's altar"],
  ];
  const list = (LOOKS[F] ?? LOOKS[0]).map(P);
  const PER = 4;
  const RH = 150;
  size(CW * PER + 40, Math.ceil(list.length / PER) * RH + 20);
  list.forEach((p, i) => cell(p, 56 + (i % PER) * CW, 10 + Math.floor(i / PER) * RH + 90));
}
else if (mode === 'pick') {
  // the pieces named after the scale, split by '|', each in its cell as on the sheet
  const list = decodeURIComponent(location.hash.slice(1)).split(':').slice(2).join(':').split('|').map(P);
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
  // a room of the lair as the game would lay it: walls along the two far sides, the pieces in it, the
  // warrior for size. (Where each thing stands would be the main chat's rules.) n: 0 the old workings,
  // 1 the cult's hall; the frame of what moves is n's tens.
  const which = F % 10;
  const FR = Math.floor(F / 10);
  const N = 10;
  const W0 = N * 32 + 100;
  size(W0, N * 16 + 160);
  const ox = W0 / 2;
  const oy = 110;
  const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
  const fr = (n: string, k = 0): Sprite => (P(n).frames!.length === 4 ? P(n).frames![FR % 4] : P(n).frames![k]);
  const ROOMS: { tiles: [string, string, number?][]; lying: [string, number, number, number?][]; left: [number, string, number][]; right: [number, string, number][]; things: [string, number, number, number?][]; hero: [number, number] }[] = [
    {
      // THE OLD WORKINGS: the miners' gear left lying, the cult's things come in among it
      tiles: [['2,7', 'the trodden way'], ['3,7', 'the trodden way'], ['4,7', 'the trodden way'], ['5,7', 'the trodden way'], ['6,7', 'the trodden way'], ['7,7', "the rails' bend"], ['5,3', 'spoil'], ['6,3', 'spoil'], ['2,4', 'the plank walk'], ['2,5', 'the plank walk'], ['8,5', "the cult's slab"]],
      lying: [["a miner's bones", 6.4, 5.4], ['a dropped lantern', 3.6, 5.5], ['the spilled kibble', 8.3, 8.6]],
      left: [[1, 'the lagged wall', 0], [2, "a miner's candle", 1], [3, 'the drilled face', 0], [4, 'the cave-in', 0], [5, 'rope and pulley', 1], [6, 'the lagged wall', 1], [7, 'the hung kibble', 1], [8, "the cult's banner", 2], [9, 'the daubed mark', 1]],
      right: [[1, 'the boarded adit', 0], [2, "a miner's candle", 2], [3, 'black glass', 1], [4, "a cultist's robe", 1], [5, 'the drilled face', 2], [6, 'the candle ledge', 1], [7, 'the lagged wall', 2], [8, 'bones on cords', 2], [9, 'the shrine', 1]],
      things: [['the winding drum', 3, 2.4], ['the cart on its side', 6.6, 7.6], ['the pile of props', 8.2, 2.6], ['the sump pump', 1.6, 8.6], ['powder keg', 5.6, 1.6], ['powder keg', 6.1, 2.2, 0], ['basket of ore', 8.8, 6.4], ['box of candles', 1.6, 6.2], ['the cave-in', 4.5, 1.5]],
      hero: [5.2, 6],
    },
    {
      // THE CULT'S HALL: where he raises his dead: his bone heaps, the rift, their idol, their candles
      tiles: [["the cult's ring", 5, 5], ["the cult's slab", 3, 7], ["the cult's slab", 7, 3], ['spoil', 8, 8]].map(([n, x, y]) => [`${x},${y}`, n as string]),
      lying: [['skulls given to him', 6.5, 3.3], ['skulls given to him', 3.3, 6.5]],
      left: [[1, "the cult's banner", 0], [2, 'the priest in the stone', 0], [3, "the cult's banner", 1], [4, 'the shrine', 0], [5, 'black glass', 0], [6, 'the candle ledge', 2], [7, "the cult's banner", 2], [8, 'the priest in the stone', 1], [9, 'bones on cords', 0]],
      right: [[1, 'the daubed mark', 0], [2, 'the shrine', 2], [3, "a cultist's robe", 0], [4, 'the priest in the stone', 2], [5, "the cult's banner", 1], [6, 'the shrieking skull', 0], [7, 'the candle ledge', 0], [8, 'black glass', 2], [9, "a cultist's robe", 2]],
      things: [['the great bone heap', 2.4, 2.6], ['the long bone heap', 7.6, 1.8], ['the rift', 6.6, 6.8], ['the effigy', 4.6, 2.2], ['the skull standard', 2.2, 5.2], ['the skull standard', 8.6, 4.4], ["the cult's coffer", 1.6, 8.4], ['offering jar', 3.6, 8.6], ['offering jar', 4.2, 9.1]],
      hero: [4.6, 5.6],
    },
    {
      // HIS HALL: where he fights, the miners' shaft at its back, the way up to town once he is dead
      tiles: [["the cult's slab", 5, 7], ["the cult's slab", 7, 5], ["the cult's ring", 6, 6], ['spoil', 2, 8], ['spoil', 8, 2]].map(([n, x, y]) => [`${x},${y}`, n as string]),
      lying: [['skulls given to him', 3.4, 7.2], ['skulls given to him', 7.2, 3.4]],
      left: [[1, "the cult's banner", 0], [2, 'the candle ledge', 1], [3, 'the priest in the stone', 0], [4, "the cult's banner", 2], [5, 'black glass', 1], [6, "the cult's banner", 1], [7, 'the shrine', 2], [8, 'the priest in the stone', 2], [9, "the cult's banner", 0]],
      right: [[1, "the cult's banner", 2], [2, 'the shrine', 1], [3, 'the priest in the stone', 1], [4, "the cult's banner", 0], [5, 'the candle ledge', 0], [6, 'the priest in the stone', 0], [7, "the cult's banner", 1], [8, 'the daubed mark', 2], [9, 'bones on cords', 1]],
      things: [['the mine shaft', 2.4, 2.4, 1], ['the great bone heap', 6.6, 2.0], ['the long bone heap', 1.8, 6.8], ['the skull standard', 4.6, 1.6], ['the skull standard', 1.6, 4.6], ['the rift', 6.4, 7.4], ['the effigy', 8.6, 4.8]],
      hero: [5.4, 5],
    },
  ];
  const R = ROOMS[which] ?? ROOMS[0];
  const tiles = new Map<string, Sprite>(R.tiles.map(([k, n]) => [k, fr(n)]));
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
  for (const [n, x, y] of R.lying) {
    const [px, py] = at(x, y);
    const p = P(n);
    if (p.shadow) softShadow(px, py, p.shadow);
    draw(fr(n), px, py);
    drawLights(g, fr(n), Math.round(px), Math.round(py));
  }
  for (const [tx, n, k] of R.left) {
    const [x, y] = at(tx, 0);
    const l = P(n).spots![k % P(n).spots!.length].left;
    stands.push({ d: tx + 1.01, s: l[FR % l.length], x: x - 8, y: y + 12 });
  }
  for (const [ty, n, k] of R.right) {
    const [x, y] = at(0, ty);
    const r = P(n).spots![k % P(n).spots!.length].right;
    stands.push({ d: ty + 1.01, s: r[FR % r.length], x: x + 8, y: y + 12 });
  }
  for (const [n, x, y, k] of R.things) {
    const [px, py] = at(x, y);
    const p = P(n);
    if (p.shadow) softShadow(px, py, p.shadow);
    const s = n === 'the cave-in' ? p.frames![0] : p.kind === 'breakable' || n === 'the mine shaft' ? p.frames![k ?? 0] : fr(n);
    stands.push({ d: x + y, s, x: px, y: py });
  }
  const [hx, hy] = at(R.hero[0], R.hero[1]);
  softShadow(hx, hy, 0.36);
  stands.push({ d: R.hero[0] + R.hero[1], s: hero.front.idle[0], x: hx, y: hy });
  standAll(stands);
}
else if (mode === 'film') {
  // a film in a grid of cells: what was there before (four times), the film, what is left. Each cell a
  // patch of the lair's floor, the warrior by (or, riding up, in the cage). n: 0 the cage comes down, 1
  // the cage goes up. The page logs "cells <before> <frames> <after> <columns> <cell w> <cell h>".
  const which = F;
  const m = which === 0 ? cageDown().m : which === 1 ? cageUp().m : lairMoment(which - 2);
  const before = m.before ? [m.before[0], m.before[0], m.before[0], m.before[0]] : [];
  const after = m.after ? [m.after[0], m.after[0], m.after[0], m.after[0]] : [];
  const cells: { s: Sprite; fi: number }[] = [...before.map((s) => ({ s, fi: -1 })), ...m.frames.map((s, i) => ({ s, fi: i })), ...after.map((s) => ({ s, fi: m.frames.length }))];
  const [CWm, CHm, TOP] = which === 2 ? [240, 220, 150] : which === 3 ? [220, 210, 150] : which === 4 ? [200, 170, 110] : [220, 220, 150];
  const COLS = 10;
  size(CWm * Math.min(COLS, cells.length), CHm * Math.ceil(cells.length / COLS));
  console.log(`cells ${before.length} ${m.frames.length} ${after.length} ${COLS} ${CWm * S} ${CHm * S}`);
  const KICK: ReadonlyArray<readonly [number, number]> = [[2, 5], [-2, -4], [2, 3], [-1, -2], [1, 1], [0, -1]];
  const up = which === 1 ? cageUp() : null;
  cells.forEach(({ s, fi }, i) => {
    const ox = (i % COLS) * CWm + CWm / 2;
    const oy = Math.floor(i / COLS) * CHm + TOP;
    g.save();
    g.beginPath();
    g.rect((i % COLS) * CWm, Math.floor(i / COLS) * CHm, CWm, CHm);
    g.clip();
    const j = m.jolts.find((q) => fi - q >= 0 && fi - q < KICK.length);
    if (j !== undefined && fi >= 0 && fi < m.frames.length) g.translate(KICK[fi - j][0], KICK[fi - j][1]);
    const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
    for (let tx = -4; tx < 5; tx++) for (let ty = -4; ty < 5; ty++) draw(ground.floor(tx + 5, ty + 5), ...at(tx - 0.5, ty - 0.5));
    if (up) {
      // riding up: the warrior in the cage, between its layers, lifted with it (the cage's floor an inch over the landing's)
      const k = fi < 0 ? 0 : fi >= m.frames.length ? m.frames.length - 1 : fi;
      const gone = fi >= m.frames.length;
      draw(gone ? s : up.layers.back[k], ox, oy);
      if (!gone) draw(rider(hero.front.idle[0], up.layers.lift[k]), ox, oy - Math.round(up.layers.lift[k] / 2) - 1);
      if (!gone) draw(up.layers.front[k], ox, oy);
    } else if (which >= 2) {
      // (the moment where it plays: on the floor, the warrior a little way off)
      const [hx, hy] = which === 2 ? at(2.6, 3.2) : which === 3 ? at(-0.6, 3.4) : at(-1.4, 2.6);
      if (which === 3) softShadow(ox, oy, 0.62);
      softShadow(hx, hy, 0.36);
      draw(s, ox, oy);
      drawLights(g, s, Math.round(ox), Math.round(oy));
      draw(hero.front.idle[0], hx, hy);
    } else {
      const [hx, hy] = at(2.2, 2.8);
      softShadow(hx, hy, 0.36);
      draw(s, ox, oy);
      draw(hero.front.idle[0], hx, hy);
    }
    g.restore();
  });
}
(window as unknown as { __ready: boolean }).__ready = true;
