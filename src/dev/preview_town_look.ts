// Dev page: THE FIRST TOWN REDONE TO GO WITH FLOOR 1'S NEW LOOK (dev/town_look_paint.ts, dev/town_look_life.ts), three
// looks for the owner to pick from. Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/a_morning_through_the_boards.png 1200 840 "overview:boards"
//   node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/a_phone.png 1014 468 "phone:boards"
//   node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/the_owl.png 1000 300 "owl"
//   PREVIEW_TIMEOUT=600000 node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/town_look_sheet.png 1200 5600 "sheet"
//     overview  the whole hall, the knight among the vendors
//     phone     one phone screen as the game would show it, the camera on the knight
//     owl       the owl close, three times the game's size, at a few moments, from below
//     window    a barricaded window close, the light through it
//     sheet     the three looks and their phone screens, labelled; the owl; a window close
//   look: boards (A), fallen (B) or rafters (C)
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Theme } from '../art/ground';
import { makeHeroArt3 } from '../art/heroes3';
import { SHINES } from '../art/floorkit';
import { makePropArt } from '../art/tiles';
import { makeTownProps } from '../art/town';
import { townSprite } from '../art/townscene';
import type { TownArt } from '../art/townscene';
import { makeTownsfolk } from '../art/townsfolk';
import { townShaft } from '../art/town_ways';
import { makeWaypointArt } from '../art/crypt_ways';
import { Deep, mixC } from './floor1_look_paint';
import {
  CAPTION, HAMMER, HERO_AT, LETTER, LOOKS, LOWS, PALS, PHONE, PICTURE, POTS, TOWN_AT, TRUSSES, atPx, lowWall, paintAir,
  paintParapet, paintPillars, paintPlace, paintPot, paintTrusses, paintTufts, sunAt,
} from './town_look_paint';
import type { Look, Pal } from './town_look_paint';
import { OWL_MOMENTS, paintOwl, paintTree } from './town_look_life';

const [mode = 'overview', lookArg = 'boards'] = decodeURIComponent(location.hash.slice(1)).split(':');
const ONE: Look = (LOOKS as string[]).includes(lookArg) ? (lookArg as Look) : 'boards';
const { W, H } = PICTURE;

// ---- the town's own things (art/town.ts, his yes), their stone the look's, their wood and iron brought into its light
function themeOf(P: Pal): Theme {
  const S = P.stone;
  return {
    id: 'townlook',
    mortar: P.seam,
    slab: [P.flags[1], P.flags[2], P.flags[3], P.flags[4]],
    slabs: 1.6,
    cap: [P.seam, S[2], S[3], S[3], S[4]],
    capLow: [P.seam, S[1], S[2], S[2], S[3]],
    lit: [P.seam, S[1], S[2], S[3], S[4]],
    shade: [P.seam, S[0], S[1], S[2], S[3]],
  };
}
const rgbOf = (c: string): [number, number, number] => {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
function hsv(c: string): [number, number, number] {
  const [r, g, b] = rgbOf(c);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx === r) h = 60 * (((g - b) / d) % 6);
    else if (mx === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, mx === 0 ? 0 : d / mx, mx / 255];
}
const STEEL5 = ['#19191b', '#2e2f33', '#4f5156', '#7e8186', '#b4b6ba'] as const;
const gradeMemo = new Map<string, string>();
/** A colour of the game's town things brought into the look: its indigo iron and steel to grey steel, its plum wood to the look's timber; the rest (cloth, gold, fire, the town's own teal) as they are. */
function graded(c: string, P: Pal): string {
  if (SHINES.has(c)) return c;
  const key = c + P.stone[2];
  const hit = gradeMemo.get(key);
  if (hit) return hit;
  const [h, s, v] = hsv(c);
  const [r, g, b] = rgbOf(c);
  const lum = 0.3 * r + 0.55 * g + 0.15 * b;
  let out = c;
  const at = (ramp: readonly string[], lo: number, hi: number): string => {
    const t = Math.max(0, Math.min(3.999, ((lum - lo) / (hi - lo)) * 4));
    const i = Math.floor(t);
    return mixC(ramp[i], ramp[Math.min(4, i + 1)], t - i);
  };
  if (h >= 160 && h <= 205 && s > 0.3) out = c;
  else if (h >= 225 && h < 292 && s < 0.72 && v < 0.92) out = at(STEEL5, 10, 200);
  else if (h >= 292 && h <= 352 && s < 0.6 && v < 0.75) out = at(P.wood, 8, 120);
  // (nothing pink in the town: a pink of the game's own wares, the tent's pennant, turned an honest red)
  else if (h >= 296 && h <= 354 && s > 0.4 && v > 0.5) out = mixC('#b8322a', '#e85a3a', Math.min(1, (v - 0.5) * 2));
  gradeMemo.set(key, out);
  return out;
}

/** A person's own colours as they are, but a pink in them (the mystic's) turned an honest red: nothing pink in the town. */
function unPink(c: string): string {
  const [h, s, v] = hsv(c);
  return h >= 296 && h <= 354 && s > 0.4 && v > 0.5 ? mixC('#b8322a', '#e85a3a', Math.min(1, (v - 0.5) * 2)) : c;
}

const pixMemo = new Map<Sprite, ImageData>();
function pixOf(s: Sprite): ImageData {
  let d = pixMemo.get(s);
  if (!d) {
    const q = s.img.getContext('2d') as CanvasRenderingContext2D;
    pixMemo.set(s, (d = q.getImageData(0, 0, s.img.width, s.img.height)));
  }
  return d;
}
interface Blit { s: Sprite; x: number; y: number; z: number; d: number; tone?: (c: string) => string; flat?: boolean; shadow?: number; figure?: boolean }
function blit(D: Deep, b: Blit): void {
  const [px, py] = atPx(b.x, b.y, b.z);
  const dens = b.s.density ?? 1;
  const X = (Math.round(px / 2) - b.s.ax) * 2;
  const Y = (Math.round(py / 2) - b.s.ay) * 2;
  const k = 2 / dens;
  const im = pixOf(b.s);
  const memo = new Map<number, string>();
  D.figure = !!b.figure;
  for (let j = 0; j < im.height; j++) for (let i = 0; i < im.width; i++) {
    const o = (j * im.width + i) * 4;
    if (im.data[o + 3] < 128) continue;
    const key = (im.data[o] << 16) | (im.data[o + 1] << 8) | im.data[o + 2];
    let c = memo.get(key);
    if (!c) {
      c = `#${key.toString(16).padStart(6, '0')}`;
      if (b.tone) c = b.tone(c);
      memo.set(key, c);
    }
    for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) {
      const x = Math.round(X + i * k + dx);
      const y = Math.round(Y + j * k + dy);
      if (b.flat) {
        const at = D.depthAt(x, y);
        if (at > b.d + 2.05 || at < b.d - 2.05) continue;
        D.over(x, y, c);
      } else {
        D.depth = b.d;
        D.set(x, y, c);
      }
    }
  }
  D.figure = false;
}
/** THE SOFT SHADOW the game draws under what stands: on the floor only. */
function shadowUnder(D: Deep, b: Blit): void {
  if (!b.shadow) return;
  const [px, py] = atPx(b.x, b.y, b.z);
  const w = b.shadow * 22.6 * 1.5 * 2;
  const h = b.shadow * 11.3 * 1.5 * 2;
  for (let y = Math.floor(py - h); y <= py + h; y++) for (let x = Math.floor(px - w); x <= px + w; x++) {
    const r = Math.hypot((x + 0.5 - px) / w, (y + 0.5 - py) / h);
    if (r >= 1) continue;
    if (D.depthAt(x, y) > b.d + 0.6) continue;
    const a = 0.5 * (r < 0.4 ? 1 - 0.15 * (r / 0.4) : 0.85 * (1 - (r - 0.4) / 0.6));
    const o = D.get(x, y);
    if (!o || SHINES.has(o)) continue;
    D.over(x, y, mixC(o, '#000000', a));
  }
}

const hero = makeHeroArt3().of('warrior', { twoHanded: false, town: true });
const folk = makeTownsfolk();
const props = makePropArt();
const shaft = townShaft();
const T_ART = new Map<Look, { art: TownArt; way: Sprite }>();
function artOf(look: Look): { art: TownArt; way: Sprite } {
  let a = T_ART.get(look);
  if (!a) {
    const th = themeOf(PALS[look]);
    a = { art: { town: makeTownProps(th), folk }, way: makeWaypointArt(th).asleep };
    T_ART.set(look, a);
  }
  return a;
}
const TIME = 1.35;

/** The whole town for a look, the knight at `heroAt`: W x H. */
function scene(look: Look, heroAt: [number, number]): { D: Deep; blits: Blit[] } {
  const P = PALS[look];
  const { art, way } = artOf(look);
  const D = new Deep(W, H, P.beyond);
  // (a thing stood in the sun takes a little of it, a person less; never so much that its own colours wash out)
  const toneAt = (x: number, y: number, z: number, grade = true) => {
    const s = sunAt(look, x, y, z);
    const k = (grade ? 0.3 : 0.16) * (s >= 1 ? 1 : s > 0 ? 0.5 : 0);
    const own = (c: string): string => (grade ? graded(c, P) : unPink(c));
    return (c: string): string => (SHINES.has(c) ? c : k > 0 ? mixC(own(c), P.sun, k) : own(c));
  };
  paintPlace(D, look);
  // ---- what lies flat: the bazaar's rug, the ring cut in the floor, the waypoint's dais
  const at = (k: readonly [number, number] | readonly number[]): [number, number] => [k[0] + 0.5, k[1] + 0.5];
  const flat = (kind: string, p: [number, number]): void => {
    const s = townSprite(art, kind, 0, TIME);
    if (s) blit(D, { s, x: p[0], y: p[1], z: 0, d: p[0] + p[1], tone: toneAt(p[0], p[1], 0), flat: true });
  };
  flat('rug', at(TOWN_AT.mystic));
  flat('runeRing', at(TOWN_AT.wordsmith));
  blit(D, { s: way, x: TOWN_AT.way[0], y: TOWN_AT.way[1], z: 0, d: TOWN_AT.way[0] + TOWN_AT.way[1] - 0.6, tone: toneAt(TOWN_AT.way[0], TOWN_AT.way[1], 0) });
  paintTufts(D, look);
  paintParapet(D, look);
  paintPillars(D, look);
  paintTrusses(D, look);
  for (const p of POTS[look]) paintPot(D, look, p);

  // ---- WHAT STANDS, each at its depth
  const blits: Blit[] = [];
  const stand = (kind: string, p: [number, number], variant = 0, shadow = 0.4, person = false): void => {
    const s = townSprite(art, kind, variant, TIME + variant * 0.37);
    if (s) blits.push({ s, x: p[0], y: p[1], z: 0, d: p[0] + p[1], tone: toneAt(p[0], p[1], 20, !person), shadow });
  };
  stand('lexicon', at(TOWN_AT.lexicon));
  stand('stash', at(TOWN_AT.stash));
  stand('anvil', at(TOWN_AT.anvil));
  stand('forge', at(TOWN_AT.forge), 0, 0.5);
  stand('rack', at(TOWN_AT.rack), 0, 0.3);
  stand('trough', at(TOWN_AT.trough));
  stand('tentBack', at(TOWN_AT.tentBack), 0, 0);
  stand('tentTable', at(TOWN_AT.tentTable), 0, 0.3);
  stand('runeSlab', at(TOWN_AT.runeSlab));
  TOWN_AT.runeStones.forEach(([dx, dy], i) => stand('runeStone', [TOWN_AT.wordsmith[0] + dx + 0.5, TOWN_AT.wordsmith[1] + dy + 0.5], i, 0.3));
  for (const who of ['armourer', 'mystic', 'wordsmith', 'stranger'] as const) stand(who, at(TOWN_AT[who]), 0, 0.36, true);
  for (const b of TOWN_AT.braziers) {
    const p = at(b);
    blits.push({ s: props.brazier[1], x: p[0], y: p[1], z: 0, d: p[0] + p[1], tone: toneAt(p[0], p[1], 20), shadow: 0.3 });
  }
  for (const b of TOWN_AT.barrels) {
    const p = at(b);
    blits.push({ s: props.barrel, x: p[0], y: p[1], z: 0, d: p[0] + p[1], tone: toneAt(p[0], p[1], 10), shadow: 0.3 });
  }
  {
    const p = at(TOWN_AT.urn);
    blits.push({ s: props.urn, x: p[0], y: p[1], z: 0, d: p[0] + p[1], tone: toneAt(p[0], p[1], 10), shadow: 0.25 });
  }
  {
    const p = at(TOWN_AT.shaft);
    blits.push({ s: shaft.whole, x: p[0], y: p[1], z: 0, d: p[0] + p[1] + 1, tone: toneAt(p[0], p[1], 30) });
  }
  blits.push({ s: hero.front.idle[0], x: heroAt[0], y: heroAt[1], z: 0, d: heroAt[0] + heroAt[1], shadow: 0.36, figure: true });
  blits.sort((a, b) => a.d - b.d);
  for (const b of blits) {
    shadowUnder(D, b);
    blit(D, b);
  }
  // ---- THE OWL on a hammer beam's end, over the smithy
  const owl = paintOwl(OWL_MOMENTS[0].pose);
  blit(D, { s: owl, x: OWL_AT[0], y: OWL_AT[1], z: OWL_AT[2], d: OWL_AT[0] + OWL_AT[1] + 0.05, figure: false });
  // ---- THE WALLS TOWARD THE EYE, cut low; the tree; the sun in the air
  LOWS.forEach((r, i) => lowWall(D, look, r, 451 + i));
  paintTree(D, look);
  paintAir(D, look);
  return { D, blits };
}
/** Where the owl sits: the end of the hammer beam of the truss over the rack and the forge. */
export const OWL_AT: [number, number, number] = [TRUSSES[2], 6 + 0.78, HAMMER.z1];

/** The scene as a canvas, its fires' glow drawn added (as the game draws a light). */
function canvasOf({ D, blits }: { D: Deep; blits: Blit[] }): HTMLCanvasElement {
  const cv = D.toCanvas();
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.setTransform(2, 0, 0, 2, 0, 0);
  for (const b of blits) {
    if (!b.s.lights || b.s.lights.length === 0) continue;
    const [px, py] = atPx(b.x, b.y, b.z);
    drawLights(g, b.s, Math.round(px / 2), Math.round(py / 2));
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

const memo = new Map<Look, HTMLCanvasElement>();
function overview(look: Look): HTMLCanvasElement {
  let c = memo.get(look);
  if (!c) {
    c = canvasOf(scene(look, HERO_AT));
    memo.set(look, c);
  }
  return c;
}
function phoneOf(look: Look): HTMLCanvasElement {
  const src = overview(look);
  const [hx, hy] = atPx(HERO_AT[0], HERO_AT[1]);
  const cv = document.createElement('canvas');
  cv.width = PHONE.W;
  cv.height = PHONE.H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = PALS[look].beyond;
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(src, Math.round(PHONE.W / 2 - hx), Math.round(PHONE.H / 2 - (hy - PHONE.lift)));
  return cv;
}
/** Two barricaded windows close (one with the cart wheel against it, in the left wall), the slats of sun they throw on the floor: a crop, twice as big. */
export const WINDOW_CROP = { x: 296, y: 226, w: 440, h: 280 };
function windowOf(look: Look): HTMLCanvasElement {
  const src = overview(look);
  const C = WINDOW_CROP;
  const cv = document.createElement('canvas');
  cv.width = C.w * 2;
  cv.height = C.h * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.drawImage(src, C.x, C.y, C.w, C.h, 0, 0, C.w * 2, C.h * 2);
  return cv;
}
/** THE OWL CLOSE: three times the game's size, on its beam seen from below, at each of its moments, named. */
export const OWL_PIC = { W: 1000, H: 300, K: 3 };
function owlOf(): HTMLCanvasElement {
  const P = PALS.boards;
  const cv = document.createElement('canvas');
  cv.width = OWL_PIC.W;
  cv.height = OWL_PIC.H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#120d09';
  g.fillRect(0, 0, cv.width, cv.height);
  const K = OWL_PIC.K;
  const n = OWL_MOMENTS.length;
  const cell = OWL_PIC.W / n;
  // the beam, seen from below: its underside, its near face, its lit edge; the roof's boards dim behind
  for (let y = 0; y < 150; y += 2 * K) {
    g.fillStyle = (y / (2 * K)) % 2 ? P.boards[1] : P.boards[2];
    g.fillRect(0, y, cv.width, 2 * K - K);
    g.fillStyle = P.boards[0];
    g.fillRect(0, y + 2 * K - K, cv.width, K);
  }
  const beamY = 210;
  g.fillStyle = P.wood[4];
  g.fillRect(0, beamY, cv.width, K);
  g.fillStyle = P.wood[3];
  g.fillRect(0, beamY + K, cv.width, 7 * K);
  g.fillStyle = P.wood[2];
  g.fillRect(0, beamY + 8 * K, cv.width, 6 * K);
  g.fillStyle = P.wood[1];
  g.fillRect(0, beamY + 14 * K, cv.width, 4 * K);
  g.fillStyle = P.wood[0];
  g.fillRect(0, beamY + 18 * K, cv.width, K);
  OWL_MOMENTS.forEach((m, i) => {
    const s = paintOwl(m.pose);
    const ox = Math.round(i * cell + cell / 2 - s.ax * 2 * K);
    const oy = beamY + 2 * K - Math.round(s.ay * 2 * K);
    g.drawImage(s.img, ox, oy, s.img.width * K, s.img.height * K);
    g.fillStyle = '#e8dccb';
    g.font = 'bold 18px sans-serif';
    g.textBaseline = 'top';
    g.fillText(m.name, Math.round(i * cell + 14), 270);
  });
  return cv;
}

function sheet(): HTMLCanvasElement {
  const SW = 1200;
  type Block = { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void };
  const blocks: Block[] = [];
  const text = (s: string, size: number, bold = false, color = '#e8dccb'): Block => ({
    h: size + 22,
    draw: (g, y) => {
      g.fillStyle = color;
      g.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
      g.textBaseline = 'top';
      g.fillText(s, 24, y + 12);
    },
  });
  const pic = (c: HTMLCanvasElement, gap = 10): Block => ({ h: c.height + gap, draw: (g, y) => g.drawImage(c, Math.round((SW - c.width) / 2), y) });
  blocks.push(text('The first town, redone to go with floor 1: more sun, more plants, an owl in the rafters, the windows barricaded. Three looks.', 20, true));
  blocks.push(text('Everything keeps its place: the smithy, the bazaar, the ring, the Lexicon, the stash, the stairs down, the cage, the gate.', 18, false, '#b8ab98'));
  for (const look of LOOKS) {
    blocks.push(text(CAPTION[look], 18, true));
    blocks.push(pic(overview(look)));
    blocks.push(text(`${LETTER[look].toUpperCase()} on a phone: one screen, the knight among the vendors, the owl over the smithy.`, 18, false, '#b8ab98'));
    blocks.push(pic(phoneOf(look), 26));
  }
  blocks.push(text('The owl in the rafters, three times as big, from below: it breathes, blinks, turns its head, ruffles.', 20, true));
  blocks.push(pic(owlOf(), 26));
  blocks.push(text('Barricaded windows close (A): odd planks nailed crooked, a cart wheel wedged against one, the sun through the gaps.', 20, true));
  blocks.push(pic(windowOf('boards'), 20));
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

const draw = (): void => {
  const out = mode === 'sheet' ? sheet() : mode === 'phone' ? phoneOf(ONE) : mode === 'owl' ? owlOf() : mode === 'window' ? windowOf(ONE) : overview(ONE);
  out.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(out);
  (window as unknown as { __size: [number, number] }).__size = [out.width, out.height];
  (window as unknown as { __ready: boolean }).__ready = true;
};
if (document.readyState === 'complete') setTimeout(draw, 50);
else window.addEventListener('load', () => setTimeout(draw, 50));
