// Dev page: FLOOR 3, THE BLACK IRON PRISON (dev/floor3_look_paint.ts), three looks for the owner to pick from. Nothing of the
// game imports it.
//   node tools/preview.mjs src/dev/preview_floor3_look.ts docs/mockups/floor3_look/pictures/a_furnace.png 1200 840 "overview:furnace"
//   node tools/preview.mjs src/dev/preview_floor3_look.ts docs/mockups/floor3_look/pictures/a_phone.png 1014 468 "phone:furnace"
//   node tools/preview.mjs src/dev/preview_floor3_look.ts docs/mockups/floor3_look/pictures/floor3_look_sheet.png 1200 4900 "sheet"
//     overview  the whole run of the floor to the gate and the pit, the knight in the cell block (600 x 420 game pixels at two
//               picture pixels each)
//     phone     one phone screen as the game would show it, the camera on the knight in the corridor before the gate
//               (507 x 234 game pixels)
//     gate      the gate close, the knight before it, twice as big
//     sheet     the three looks and their phone screens, labelled, and the gate close beside the knight in each
//   look: furnace (A), torch (B) or cold (C)
import { Px, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Iso } from '../art/isokit';
import { hash } from '../art/kit';
import { chainedPieces } from '../art/floor3';
import type { Piece } from '../art/floorkit';
import { SHINES } from '../art/floorkit';
import { makeHeroArt3 } from '../art/heroes3';
import { makeChainedArt3 } from '../art/bosses3';
import { EMBER } from '../art/props';
import {
  BASKETS, BOSS_AT, C0, PHONE, PICTURE, atPx, C1, CAPTION, CHANNEL, GATE, HALL, HERO_GATE, HERO_PHONE, HERO_RUN, LETTER, LOOKS, PALS, PIT, PIT_RINGS, WALL,
  hangingCage, hangingChain, heat, hookAt, lightsOf, lowWall, mixC, paintGate, paintPit, paintRailings, paintRun, shackleAt, slungChain, smokeOver, warmBy,
} from './floor3_look_paint';
import type { Lights, Look } from './floor3_look_paint';

const [mode = 'overview', lookArg = 'furnace'] = decodeURIComponent(location.hash.slice(1)).split(':');
const ONE: Look = (LOOKS as string[]).includes(lookArg) ? (lookArg as Look) : 'furnace';

/** The whole picture in picture pixels, and where the floor's (0, 0) is on it. */
const { W, H, OX, OY } = PICTURE;

// ---- the floor's own pieces, their colours brought into each look's light (fire is fire, and stays as it is)
const pieces = chainedPieces();
const piece = (n: string): Piece => {
  const p = pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece named ${n}`);
  return p;
};
function graded(c: string, look: Look): string {
  if (SHINES.has(c)) return c;
  const n = parseInt(c.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const l = 0.3 * r + 0.55 * g + 0.15 * b;
  if (look === 'furnace') {
    r = (l + (r - l) * 0.35) * 1.02 + 9;
    g = (l + (g - l) * 0.35) * 0.96 + 2;
    b = (l + (b - l) * 0.35) * 0.8 - 4;
  } else if (look === 'torch') {
    r = (l + (r - l) * 0.35) * 0.92 + 2;
    g = (l + (g - l) * 0.35) * 0.92;
    b = (l + (b - l) * 0.35) * 0.95 + 2;
  } else {
    r = (l + (r - l) * 0.25) * 0.95 - 2;
    g = (l + (g - l) * 0.25) * 1.0 + 1;
    b = (l + (b - l) * 0.25) * 1.05 + 4;
  }
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
}
const gradedMemo = new Map<string, Sprite>();
function gradeSprite(s: Sprite, look: Look, key: string, warmK = 0): Sprite {
  const id = `${look}:${key}:${warmK}`;
  const hit = gradedMemo.get(id);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = s.img.width;
  c.height = s.img.height;
  const q = c.getContext('2d') as CanvasRenderingContext2D;
  q.drawImage(s.img, 0, 0);
  const im = q.getImageData(0, 0, c.width, c.height);
  const d = im.data;
  const memo = new Map<number, [number, number, number]>();
  const P = PALS[look];
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const key2 = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    let out = memo.get(key2);
    if (!out) {
      const src = `#${key2.toString(16).padStart(6, '0')}`;
      const g2 = SHINES.has(src) ? src : warmBy(P, graded(src, look), warmK);
      const m = parseInt(g2.slice(1), 16);
      out = [(m >> 16) & 255, (m >> 8) & 255, m & 255];
      memo.set(key2, out);
    }
    d[i] = out[0];
    d[i + 1] = out[1];
    d[i + 2] = out[2];
  }
  q.putImageData(im, 0, 0);
  const s2 = { ...s, img: c };
  gradedMemo.set(id, s2);
  return s2;
}

const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const boss = makeChainedArt3();

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

/** What stands on the floor, by place: [name, x, y, frame]. */
const PIT_THINGS: [string, number, number, number, number][] = [
  ['the great winch', 4.6, -8.45, 0, 0], ['the chain post', 1.4, -8.5, 0, 0], ['the chain post', 7.4, -8.5, 0, 0], ['a heap of chains', 6.9, -1.2, 0, PIT.z], ['ball and chain', 0.6, -0.9, 0, PIT.z],
];
const RUN_THINGS: [string, number, number, number][] = [
  ['straw bale', -0.45, 7.85, 0], ['meal sack', -0.4, 11.75, 0], ['the feed trough', -0.25, 15.25, 0], ["the jailers' kettle", 6.1, 9.4, 0], ['the anvil', 6.15, 11.3, 0],
  ['the stone bench', 6.25, 14.6, 0], ["the jailers' chest", 6.3, 4.85, 0], ['box of irons', 0.6, 4.75, 0], ['water jug', 4.6, 15.4, 0], ['a heap of chains', 0.3, 14.6, 0],
  ['a snapped chain', 2.6, 3.4, 0], ['a bowl kicked over', 2.7, 18.4, 0], ['a burst cuff', 4.3, 19.6, 0], ['ball and chain', 4.5, 4.6, 0],
];
/** On the walls: [name, along, face (x for a wall along y, y for one along x), along x?]. */
const WALL_THINGS: [string, number, number, boolean][] = [
  ['rings and chains', -0.5, HALL.y0, true], ['balls on a rack', 6.5, HALL.y0, true], ['goad and catch-pole', 1.9, C1.x0, false], ['the wall winch', 18.8, C0.x0, false],
];
const WALL_THINGS_DARK: [string, number, number, boolean][] = [['empty bowls', 7.8, HALL.x0, false], ['rags on a nail', 11.6, HALL.x0, false]];

/** Every picture of the place for a look, with the knight at `heroAt`: the whole picture, W x H. */
function scene(look: Look, heroAt: [number, number]): HTMLCanvasElement {
  const P = PALS[look];
  const L: Lights = lightsOf(look);
  const chainC = (k: number): [string, string, string, string] => [P.iron[0], warmBy(P, P.iron[1], k), warmBy(P, P.iron[2], k), warmBy(P, P.iron[4], k)];

  // ---- THE BACK: the pit, the run's far walls and floors, the channel and its railings
  const back = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) back.set(x, y, P.beyond);
  const iso = new Iso(back, OX, OY);
  paintPit(iso, look, L);
  // (chains slung between the great rings on the pit's walls: the rings every four tiles, 70 up from its floor)
  for (const [a, b] of [[-2.5, 1.5], [1.5, 5.5]]) slungChain(back, atPx(a, PIT.y0, 34), atPx(b, PIT.y0, 34), 20, chainC(Math.min(1, heat((a + b) / 2, PIT.y0, 30, L))));
  slungChain(back, atPx(PIT.x0, -2.5, 34), atPx(PIT.x0, -6.5, 34), 20, chainC(Math.min(1, heat(PIT.x0, -4.5, 30, L))));
  paintRun(iso, look, L);
  paintRailings(back, iso, look, L, 'far');
  paintRailings(back, iso, look, L, 'near');

  // ---- WHAT STANDS, sorted as the game sorts it: by place (the pit, the gate, the run, the walls toward the eye), then by depth
  interface Item { k: number; d: number; draw: (g: CanvasRenderingContext2D) => void }
  const items: Item[] = [];
  const layer = (k: number, d: number, l: Px): void => {
    const c = l.toCanvas();
    items.push({ k, d, draw: (g) => { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, 0, 0); } });
  };
  const stand = (k: number, s: Sprite, x: number, y: number, z = 0, shadow = 0, d = x + y): void => {
    items.push({
      k,
      d,
      draw: (g) => {
        g.setTransform(2, 0, 0, 2, 0, 0);
        const [px, py] = atPx(x, y, z);
        const sx = px / 2;
        const sy = py / 2;
        if (shadow) {
          const w = shadow * 22.6 * 1.5;
          const hh = shadow * 11.3 * 1.5;
          g.save();
          g.imageSmoothingEnabled = true;
          g.globalAlpha = 0.7;
          g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
          g.restore();
        }
        g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy) - s.ay, s.w, s.h);
        drawLights(g, s, Math.round(sx), Math.round(sy));
      },
    });
  };
  const fr = (n: string, f: number, x: number, y: number, z: number): Sprite => {
    const s = piece(n).frames![f];
    // (what stands near the fire takes its light, a band less than the floor under it)
    const k = Math.max(0, heat(x, y, z + 16, L) - 1);
    return gradeSprite(s, look, `${n}:${f}`, k);
  };
  for (const [n, x, y, f, z] of PIT_THINGS) stand(0, fr(n, f, x, y, z), x, y, z, piece(n).shadow ?? 0);
  // (in the cold, no fire burns but in the pit: the kettle's is out, and gone)
  for (const [n, x, y, f] of RUN_THINGS) if (!(look === 'cold' && n === "the jailers' kettle")) stand(2, fr(n, f, x, y, 0), x, y, 0, piece(n).shadow ?? 0);
  const wallThing = (n: string, along: number, face: number, alongX: boolean, z = 0, key = 0): void => {
    const p = piece(n);
    const s = (alongX ? p.left! : p.right!)[0];
    const [x, y] = alongX ? [along, face] : [face, along];
    const k = Math.max(0, heat(x, y, z + 40, L) - 1);
    stand(key, gradeSprite(s, look, `${n}:${alongX}`, k), x, y, z, 0, x + y - 0.01);
  };
  for (const [n, a, f, ax] of WALL_THINGS) wallThing(n, a, f, ax);
  if (look === 'torch') {
    for (const b of BASKETS) wallThing('fire basket', b.alongX ? b.x : b.y, b.alongX ? b.y : b.x, b.alongX, b.z, b.z < 0 ? 0 : 2);
    wallThing("the jailers' lamp", 20.2, C0.x0, false);
  } else for (const [n, a, f, ax] of WALL_THINGS_DARK) wallThing(n, a, f, ax);
  // THE CHAINED ONE, in his pit, on the great grate, as the game has him
  stand(0, boss.front.idle[0], BOSS_AT[0], BOSS_AT[1], PIT.z, 0.9);
  // THE KNIGHT
  stand(2, hero.front.idle[0], heroAt[0], heroAt[1], 0, 0.36);

  // CHAINS HUNG FROM THE DARK: four great ones in the pit, down to the rings in its floor; in the cell block and the corridor,
  // hanging to a hook, a shackle, a cage
  const hang = (key: number, x: number, y: number, z: number, end: 'ring' | 'hook' | 'shackle' | 'cage'): void => {
    const l = new Px(W, H);
    const [X, Y] = atPx(x, y, z);
    const c = chainC(Math.min(1, heat(x, y, z, L)));
    const top = -8;
    hangingChain(l, Math.round(X), top, Math.round(Y) - (end === 'ring' ? 2 : 0), c, Math.round(Y) - 150);
    if (end === 'hook') hookAt(l, Math.round(X), Math.round(Y), c);
    if (end === 'shackle') shackleAt(l, Math.round(X), Math.round(Y), c);
    if (end === 'cage') hangingCage(l, Math.round(X), Math.round(Y), c, mixC(P.beyond, P.iron[0], 0.5));
    layer(key, x + y + 0.02, l);
  };
  for (const [x, y] of PIT_RINGS) hang(0, x, y, PIT.z, 'ring');
  hang(2, 0.9, 6.3, 46, 'hook');
  hang(2, 5.7, 12.9, 70, 'cage');
  hang(2, 0.5, 12.6, 54, 'shackle');
  hang(2, 4.6, 18.9, 58, 'hook');
  hang(2, 2.3, 17.6, 50, 'hook');

  // THE GATE, and the pit's near walls cut low, in front of the pit and behind the corridor
  const gateL = new Px(W, H);
  const gIso = new Iso(gateL, OX, OY);
  lowWall(gIso, look, L, PIT.x1, PIT.y0, PIT.x1 + 1, PIT.y1, 401);
  lowWall(gIso, look, L, PIT.x0, GATE.y0, GATE.x0 - 0.375, GATE.y1, 403);
  lowWall(gIso, look, L, GATE.x1 + 0.375, GATE.y0, PIT.x1 + 1, GATE.y1, 405);
  paintGate(gIso, look, L);
  // (two great rings on the face's upper corners, a chain slung between them over the arch)
  const ringL = atPx(GATE.x0 - 0.1, GATE.y1, 132);
  const ringR = atPx(GATE.x1 + 0.1, GATE.y1, 132);
  const gk = heat((GATE.x0 + GATE.x1) / 2, GATE.y1, 120, L);
  slungChain(gateL, [ringL[0] + 1, ringL[1] + 4], [ringR[0] - 1, ringR[1] + 4], 30, chainC(gk));
  for (const [rx, ry] of [ringL, ringR]) {
    for (let a = 0; a < 48; a++) {
      const t = (a / 48) * Math.PI * 2;
      const X = Math.round(rx + Math.cos(t) * 5);
      const Y = Math.round(ry + 4 + Math.sin(t) * 6);
      gateL.set(X, Y, Math.cos(t) < 0 ? warmBy(P, P.iron[4], gk) : P.iron[1]);
    }
    for (let dy = -3; dy <= 1; dy++) for (let dx = -3; dx <= 3; dx++) gateL.set(Math.round(rx) + dx, Math.round(ry) + dy, Math.abs(dx) === 3 || dy === -3 ? P.iron[0] : dx < 0 ? P.iron[3] : P.iron[2]);
  }
  layer(1, 0, gateL);

  // THE WALLS TOWARD THE EYE, cut low as the game leaves them
  const near = new Px(W, H);
  const nIso = new Iso(near, OX, OY);
  lowWall(nIso, look, L, C1.x1, C1.y0, C1.x1 + 1, C1.y1, 411);
  lowWall(nIso, look, L, HALL.x1, HALL.y0, HALL.x1 + 1, HALL.y1, 413);
  lowWall(nIso, look, L, HALL.x0, HALL.y1, C0.x0, HALL.y1 + 1, 415);
  lowWall(nIso, look, L, C0.x1, HALL.y1, HALL.x1 + 1, HALL.y1 + 1, 417);
  lowWall(nIso, look, L, C0.x1, C0.y0, C0.x1 + 1, C0.y1 + 1, 419);
  layer(3, 0, near);

  // ---- the canvas: picture pixels, the pieces and figures drawn in game pixels (two to one)
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.drawImage(back.toCanvas(), 0, 0);
  items.sort((a, b) => a.k - b.k || a.d - b.d);
  for (const it of items) it.draw(g);
  g.setTransform(1, 0, 0, 1, 0, 0);

  // SMOKE rising from the fire under the floor (the furnace below), kept off the knight and off him; SPARKS going up
  if (P.smoke || look === 'torch') {
    const im = g.getImageData(0, 0, W, H);
    const px = new Px(W, H);
    const d = im.data;
    const hexOf = (i: number): string => `#${((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]).toString(16).padStart(6, '0')}`;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px.set(x, y, hexOf((y * W + x) * 4));
    const hp = atPx(heroAt[0], heroAt[1], 28);
    const bp = atPx(BOSS_AT[0], BOSS_AT[1], PIT.z + 60);
    if (P.smoke) {
      const from: [number, number][] = [
        atPx(3.0, 7.9), atPx(3.0, 12.1), atPx(1.8, -3.0, PIT.z), atPx(5.4, -6.4, PIT.z), atPx(3.5, 18.5), atPx(-1.4, 6.0, 30), atPx(-1.4, 13.4, 30),
      ];
      smokeOver(px, look, from, [[hp[0], hp[1], 46], [bp[0], bp[1], 70]]);
    }
    // sparks: pairs of pixels of the fire's orange, going up over what burns most
    const sparkAt = look === 'furnace' ? 90 : 28;
    for (let i = 0; i < sparkAt; i++) {
      const src = i % 3 === 0 ? atPx(3.5, -4.6 + (hash(i, 9, 3) - 0.5) * 3, PIT.z) : atPx(CHANNEL.x0 + hash(i, 1, 3) * 1.6, CHANNEL.open0 + hash(i, 2, 3) * (CHANNEL.open1 - CHANNEL.open0));
      const X = (Math.round(src[0] + (hash(i, 4, 3) - 0.5) * 40) & ~1);
      const Y = (Math.round(src[1] - 10 - hash(i, 5, 3) * 150) & ~1);
      if (Math.hypot(X - hp[0], Y - hp[1]) < 40) continue;
      const c = hash(i, 6, 3) > 0.6 ? EMBER[3] : EMBER[2];
      px.set(X, Y, c).set(X + 1, Y, c).set(X, Y + 1, c).set(X + 1, Y + 1, c);
    }
    g.drawImage(px.toCanvas(), 0, 0);
  }
  return cv;
}

// =================================================================================================

function phoneOf(look: Look): HTMLCanvasElement {
  const src = scene(look, HERO_PHONE);
  const [hx, hy] = atPx(HERO_PHONE[0], HERO_PHONE[1]);
  const cv = document.createElement('canvas');
  cv.width = PHONE.W;
  cv.height = PHONE.H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = PALS[look].beyond;
  g.fillRect(0, 0, cv.width, cv.height);
  // (the camera on the hero, a little up the screen of him, as the game's)
  g.drawImage(src, Math.round(PHONE.W / 2 - hx), Math.round(PHONE.H / 2 - (hy - PHONE.lift)));
  return cv;
}
/** The gate close, the knight before it: a crop of the picture `cw` x `ch`, twice as big. */
const GATE_CROP = { x: OX - 34, y: OY - 168, w: 200, h: 270 };
function gateOf(look: Look): HTMLCanvasElement {
  const src = scene(look, HERO_GATE);
  const C = GATE_CROP;
  const cv = document.createElement('canvas');
  cv.width = C.w * 2;
  cv.height = C.h * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.drawImage(src, C.x, C.y, C.w, C.h, 0, 0, C.w * 2, C.h * 2);
  return cv;
}

function sheet(): HTMLCanvasElement {
  const SW = 1200;
  const blocks: { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void }[] = [];
  const text = (s: string, size: number, bold = false, color = '#e8dccb'): { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void } => ({
    h: size + 22,
    draw: (g, y) => {
      g.fillStyle = color;
      g.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
      g.textBaseline = 'top';
      g.fillText(s, 24, y + 12);
    },
  });
  const pic = (c: HTMLCanvasElement, gap = 10): { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void } => ({
    h: c.height + gap,
    draw: (g, y) => g.drawImage(c, Math.round((SW - c.width) / 2), y),
  });
  blocks.push(text("Floor 3, the Chained One's floor: the black iron prison. Three looks to pick from.", 26, true));
  blocks.push(text('The way runs from the corridor in (bottom left), through the cell block, to his gate and his pit (top right).', 18, false, '#b8ab98'));
  for (const look of LOOKS) {
    blocks.push(text(CAPTION[look], 21, true));
    blocks.push(pic(scene(look, HERO_RUN)));
    blocks.push(text(`${LETTER[look].toUpperCase()} on a phone: one screen, the knight in the corridor before the gate.`, 18, false, '#b8ab98'));
    blocks.push(pic(phoneOf(look), 26));
  }
  blocks.push(text('His gate, close, the knight before it (A, B, C), twice as big.', 21, true));
  const gates = LOOKS.map(gateOf);
  blocks.push({
    h: gates[0].height + 40,
    draw: (g, y) => {
      gates.forEach((c, i) => {
        g.drawImage(c, i * 400, y);
        g.fillStyle = '#e8dccb';
        g.font = 'bold 22px sans-serif';
        g.fillText(LETTER[LOOKS[i]].toUpperCase(), i * 400 + 12, y + 10);
      });
    },
  });
  const total = blocks.reduce((t, b) => t + b.h, 0);
  const cv = document.createElement('canvas');
  cv.width = SW;
  cv.height = total;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0a0809';
  g.fillRect(0, 0, SW, total);
  let y = 0;
  for (const b of blocks) {
    b.draw(g, y);
    y += b.h;
  }
  return cv;
}

const out = mode === 'sheet' ? sheet() : mode === 'phone' ? phoneOf(ONE) : mode === 'gate' ? gateOf(ONE) : scene(ONE, HERO_RUN);
out.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(out);
(window as unknown as { __ready: boolean; __size: [number, number] }).__size = [out.width, out.height];
(window as unknown as { __ready: boolean }).__ready = true;
void WALL;
void C0;
