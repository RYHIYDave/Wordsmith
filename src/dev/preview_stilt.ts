// Dev page: THE STILT TOWN, one of the towns to unlock or buy, drawn to the game's standard (art/stilt_town.ts, art/stilt_stalls.ts,
// dev/sculpt_fen_folk.ts), every station on its own platform where his sketch had it, the game's own pictures for the rest.
// Nothing of the game imports it.
//   node tools/preview.mjs src/dev/preview_stilt.ts out.png 1200 970 whole
//   node tools/preview.mjs src/dev/preview_stilt.ts out.png 1014 528 view:1      (2, 3: the other phone views)
import { drawText } from '../engine/font';
import { drawGlow, drawLights } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { Theme } from '../art/ground';
import { makeHeroArt3 } from '../art/heroes3';
import { makeTownProps } from '../art/town';
import { townSprite } from '../art/townscene';
import type { TownArt } from '../art/townscene';
import { makeTownsfolk } from '../art/townsfolk';
import { makeWaypointArt } from '../art/crypt_ways';
import { GRAIN, toSprite } from '../art/kit';
import { TORCH_FRAMES, paintGate as gatePiece, paintRecord as recordPiece, paintSocketSlab, paintTorchFlame, paintTorchPost, paintTrophies as trophiesPiece } from '../art/shaft_props';
import type { Piece } from '../art/shaft_props';
import { stoneOf } from '../art/props';
import { DECKS, STILT, STILT_LAYOUT, STILT_PORTAL, paintStiltGround, standZ } from '../art/stilt_town';
import { fenAnvil, fenForge, fenHut, fenLantern, fenMat, fenPost, fenRack, fenReeds, fenShack, fenTable, fenTrough } from '../art/stilt_stalls';
import { rnd } from '../art/endless_splash';
import { FACING_TURN3 } from '../art/townsfolk3';
import { TOWN_CANVAS, paintFigure } from './sculpt_townsfolk';
import { ARMOURER_MOVES, MYSTIC_MOVES, STRANGER_MOVES } from './townsfolk_moves';
import { sculptFenHerbalist, sculptFenSmith, sculptFenStranger } from './sculpt_fen_folk';

// ---------------------------------------------------------------------------------------------------------------------------
// THE PICTURE: GW x GH game pixels, each two by two picture pixels.

const GW = 980;
const GH = 560;
const OX = 490;
const OY = 312 - (STILT.cx + STILT.cy) * 8;
/** Where a point of the town is on the picture: on its deck where it stands on one. */
const at = (x: number, y: number, z = standZ(x, y)): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - Math.round(z)];

class Buf {
  readonly d = new Uint8ClampedArray(GW * 2 * GH * 2 * 4);
  canvasAt(cv: HTMLCanvasElement, X: number, Y: number): void {
    const im = (cv.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, cv.width, cv.height);
    const W2 = GW * 2;
    for (let j = 0; j < cv.height; j++)
      for (let i = 0; i < cv.width; i++) {
        const x = Math.round(X) + i;
        const y = Math.round(Y) + j;
        if (x < 0 || y < 0 || x >= W2 || y >= GH * 2) continue;
        const o = (j * cv.width + i) * 4;
        if (im.data[o + 3] < 128) continue;
        const q = (y * W2 + x) * 4;
        for (let c = 0; c < 3; c++) this.d[q + c] = im.data[o + c];
        this.d[q + 3] = 255;
      }
  }
  sprite(s: Sprite, gx: number, gy: number): void {
    const dens = s.density ?? 1;
    const k = 2 / dens;
    const im = pixOf(s);
    const X = (Math.round(gx) - s.ax) * 2;
    const Y = (Math.round(gy) - s.ay) * 2;
    const W2 = GW * 2;
    for (let y = Math.max(0, Math.floor(Y)); y < Math.min(GH * 2, Math.ceil(Y + im.height * k)); y++)
      for (let x = Math.max(0, Math.floor(X)); x < Math.min(W2, Math.ceil(X + im.width * k)); x++) {
        const i = Math.floor((x - X) / k);
        const j = Math.floor((y - Y) / k);
        if (i < 0 || j < 0 || i >= im.width || j >= im.height) continue;
        const o = (j * im.width + i) * 4;
        if (im.data[o + 3] < 128) continue;
        const q = (y * W2 + x) * 4;
        this.d[q] = im.data[o];
        this.d[q + 1] = im.data[o + 1];
        this.d[q + 2] = im.data[o + 2];
        this.d[q + 3] = 255;
      }
  }
  /** The soft shadow the game puts under what stands. */
  shadow(gx: number, gy: number, r: number): void {
    const w = r * 34;
    const hh = r * 17;
    for (let y = Math.floor(gy - hh); y <= gy + hh; y++)
      for (let x = Math.floor(gx - w); x <= gx + w; x++) {
        const n = Math.hypot((x + 0.5 - gx) / w, (y + 0.5 - gy) / hh);
        if (n >= 1 || x < 0 || y < 0 || x >= GW || y >= GH) continue;
        const a = 0.45 * (n < 0.5 ? 1 : 1 - (n - 0.5) / 0.5);
        for (let j = 0; j < 2; j++)
          for (let i = 0; i < 2; i++) {
            const o = ((y * 2 + j) * GW * 2 + x * 2 + i) * 4;
            for (let c = 0; c < 3; c++) this.d[o + c] = this.d[o + c] * (1 - a);
          }
      }
  }
  /** One picture pixel. */
  dot(px: number, py: number, c: string): void {
    if (px < 0 || py < 0 || px >= GW * 2 || py >= GH * 2) return;
    const o = (py * GW * 2 + px) * 4;
    this.d[o] = parseInt(c.slice(1, 3), 16);
    this.d[o + 1] = parseInt(c.slice(3, 5), 16);
    this.d[o + 2] = parseInt(c.slice(5, 7), 16);
    this.d[o + 3] = 255;
  }
}
const pixMemo = new Map<Sprite, ImageData>();
function pixOf(s: Sprite): ImageData {
  let d = pixMemo.get(s);
  if (!d) pixMemo.set(s, (d = (s.img.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, s.img.width, s.img.height)));
  return d;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE GAME'S OWN THINGS, in a cold grey stone; the Shaft's Rim's gate, record, trophies and lamps; the Mere's own.

const STONE = ['#181a16', '#2c2e28', '#40423a', '#56584e', '#707268', '#8e9084'];
const THEME: Theme = {
  id: 'stilt',
  mortar: STONE[0],
  slab: [STONE[1], STONE[2], STONE[3], STONE[4]],
  slabs: 1.6,
  cap: [STONE[0], STONE[3], STONE[4], STONE[4], STONE[5]],
  capLow: [STONE[0], STONE[2], STONE[3], STONE[3], STONE[4]],
  lit: [STONE[0], STONE[2], STONE[3], STONE[4], STONE[5]],
  shade: [STONE[0], STONE[1], STONE[2], STONE[3], STONE[4]],
} as Theme;
const hero = makeHeroArt3().of('warrior', { twoHanded: false, town: true });
const ART: TownArt = { town: makeTownProps(THEME), folk: makeTownsfolk() };
const WAY = makeWaypointArt(THEME);
const T0 = 1.35;
const RUNE_STONES: readonly (readonly [number, number])[] = [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]];
const spr = (p: Piece): Sprite => {
  const s = p.px.sprite(p.ox, p.oy, GRAIN);
  if (p.lights?.length) s.lights = p.lights;
  return s;
};
const FOLK_AURA: Light = { x: TOWN_CANVAS.ax - 4, y: TOWN_CANVAS.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
const folk = (fig: ReturnType<typeof sculptFenSmith>, aura: Light | null): Sprite => toSprite(paintFigure(fig), aura, TOWN_CANVAS.ax, TOWN_CANVAS.ay);
interface Own { [k: string]: Sprite | Sprite[] }
let OWN: Own | null = null;
const own = (): Own => (OWN ??= {
  gate: spr(gatePiece()),
  record: spr(recordPiece(23, true)),
  trophies: spr(trophiesPiece([true, true, true, false])),
  post: spr(paintTorchPost()),
  flame: Array.from({ length: TORCH_FRAMES }, (_, f) => spr(paintTorchFlame(f))),
  slab: Array.from({ length: 8 }, (_, f) => spr(paintSocketSlab({ stone: stoneOf(THEME), lit: THEME.lit, shade: THEME.shade }, f))),
  forge: [0, 1, 2, 3].map(fenForge),
  anvil: fenAnvil(),
  rack: fenRack(),
  trough: fenTrough(),
  tentBack: fenHut(),
  tentTable: fenTable(),
  rug: fenMat(),
  shanty: fenShack(),
  reeds: [0, 1, 2].map(fenReeds),
  posts: [0, 1, 2, 3, 4, 5].map(fenPost),
  lantern: [0, 1, 2, 3].map(fenLantern),
  armourer: folk(sculptFenSmith(ARMOURER_MOVES.idle(0), FACING_TURN3.sw), FOLK_AURA),
  mystic: folk(sculptFenHerbalist(MYSTIC_MOVES.idle(0), FACING_TURN3.sw), FOLK_AURA),
  stranger: folk(sculptFenStranger(STRANGER_MOVES.idle(0), 0), null),
});
const pick = (k: string, t: number, fps = 8): Sprite => {
  const v = own()[k];
  return Array.isArray(v) ? v[Math.floor(t * fps) % v.length] : v;
};

let GROUND: ReturnType<typeof paintStiltGround> | null = null;

interface Put { d: number; f: () => void }
interface Lit { s?: Sprite; x: number; y: number; r?: number; c?: string; a?: number }

export function scene(heroAt: [number, number] | null, t = 2.0): HTMLCanvasElement {
  const B = new Buf();
  const lights: Lit[] = [];
  const G = (GROUND ??= paintStiltGround());
  B.canvasAt(G.canvas, (OX + G.gx) * 2, (OY + G.gy) * 2);
  const c = (p: readonly [number, number]): [number, number] => [p[0] + 0.5, p[1] + 0.5];
  const L = STILT_LAYOUT;
  // ---- what lies flat
  const flat = (s: Sprite, p: [number, number]): void => B.sprite(s, ...at(p[0], p[1]));
  const [wx, wy] = L.wordsmith;
  const [bx, by] = L.tentBack;
  flat(pick('rug', 0), c([bx, by + 1]));
  const ring = townSprite(ART, 'runeRing', 0, T0);
  if (ring) flat(ring, c([wx, wy]));
  // ---- what stands, nearest last
  const puts: Put[] = [];
  const put = (x: number, y: number, f: () => void): void => {
    puts.push({ d: x + y, f });
  };
  const stand = (s: Sprite | null, p: [number, number], shadow = 0.36): void => {
    if (!s) return;
    put(p[0], p[1], () => {
      const [gx, gy] = at(p[0], p[1]);
      if (shadow) B.shadow(gx, gy, shadow);
      B.sprite(s, gx, gy);
      if (s.lights?.length) lights.push({ s, x: gx, y: gy });
    });
  };
  // the smithy
  const [fx, fy] = L.forge;
  stand(pick('forge', t + T0), c([fx, fy]), 0.5);
  stand(pick('rack', 0), c([fx - 3, fy]), 0.3);
  stand(pick('trough', t + T0, 4), c([fx + 1, fy]), 0);
  stand(pick('anvil', 0), c([fx - 1, fy + 2]));
  stand(pick('armourer', 0), c([fx - 1, fy + 1]));
  {
    const [gx, gy] = at(fx + 0.5, fy + 0.5);
    lights.push({ x: gx, y: gy - 20, r: 70, c: '#ff8a2a', a: 0.22 });
  }
  // the booth
  stand(pick('tentBack', 0), c([bx, by]), 0);
  stand(pick('mystic', 0), c([bx, by + 1]));
  stand(pick('tentTable', 0), c([bx, by + 2]), 0.3);
  // the wordsmith's bench and its stones
  stand(townSprite(ART, 'wordsmith', 0, T0), c([wx, wy]));
  stand(pick('slab', t + T0), c([wx, wy + 1]));
  RUNE_STONES.forEach(([dx, dy], i) => stand(townSprite(ART, 'runeStone', i, T0 + i * 0.37), c([wx + dx, wy + dy]), 0.3));
  stand(townSprite(ART, 'lexicon', 0, T0), c(L.lexicon));
  stand(townSprite(ART, 'stash', 0, T0), c(L.stash));
  // the stranger, and the shack he leans on (half a tile behind him)
  {
    const [sx, sy] = c(L.stranger);
    stand(pick('shanty', 0), [sx - 0.5, sy], 0.7);
    stand(pick('stranger', 0), [sx, sy]);
  }
  // the way down: the hatch in the deck (in the ground), the waypoint beside it
  {
    const [qx, qy] = L.waypoint;
    const s = WAY.awake[Math.floor((T0 + t) * 8) % WAY.awake.length];
    put(qx - 0.6, qy - 0.6, () => {
      B.sprite(s, ...at(qx, qy));
      if (s.lights?.length) lights.push({ s, x: at(qx, qy)[0], y: at(qx, qy)[1] });
    });
    lights.push({ x: at(qx, qy)[0], y: at(qx, qy)[1] - 4, r: 40, c: '#22d0e0', a: 0.35 });
  }
  // the portal's round, ringed with old mooring posts
  {
    const [px0, py0] = STILT_PORTAL.at;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      stand((own().posts as Sprite[])[i], [px0 + Math.cos(a) * (STILT_PORTAL.r + 0.12), py0 + Math.sin(a) * (STILT_PORTAL.r + 0.12)], 0.14);
    }
  }
  // reeds standing out of the water by the decks
  {
    let k = 0;
    for (const d of DECKS) {
      if (d.walk) continue;
      for (let i = 0; i < 4; i++) {
        const side = Math.floor(rnd(k, i, 301) * 4);
        const t2 = 0.15 + rnd(k, i, 302) * 0.7;
        const out = 0.25 + rnd(k, i, 303) * 0.35;
        const x = side === 0 ? d.x0 - out : side === 1 ? d.x1 + out : d.x0 + t2 * (d.x1 - d.x0);
        const y = side === 2 ? d.y0 - out : side === 3 ? d.y1 + out : d.y0 + t2 * (d.y1 - d.y0);
        if (standZ(x, y) > 0) continue;
        const s = (own().reeds as Sprite[])[(k + i) % 3];
        put(x, y, () => B.sprite(s, ...at(x, y, 0)));
      }
      k++;
    }
  }
  // the gate, the record, the trophies (the Shaft's Rim's), and the lamps on their posts
  for (const [kind, p, d, sh] of [['gate', L.gate, [1.5, 0.76], 0.9], ['record', L.record, [0.5, 0.63], 0.4], ['trophies', L.trophies, [1.5, 0.7], 0.9]] as const) {
    const ax = kind === 'record' ? 0.5 : 1.5;
    put(p[0] + d[0], p[1] + d[1], () => {
      const [gx, gy] = at(p[0] + ax, p[1] + 0.5);
      const s = pick(kind, 0);
      B.shadow(gx, gy, sh);
      B.sprite(s, gx, gy);
      if (s.lights?.length) lights.push({ s, x: gx, y: gy });
    });
  }
  for (const [x, y] of L.lanterns) {
    put(x, y, () => {
      const [gx, gy] = at(x, y);
      B.shadow(gx, gy, 0.16);
      const fl = (own().lantern as Sprite[])[(Math.floor(t * 8) + Math.round(x * 7 + y * 3)) % 4];
      B.sprite(fl, gx, gy);
      lights.push({ s: fl, x: gx, y: gy });
      lights.push({ x: gx + 6, y: gy - 40, r: 60, c: '#ff8a2a', a: 0.2 });
    });
  }
  // the knight
  if (heroAt) {
    const s = hero.front.idle[0];
    put(heroAt[0], heroAt[1], () => {
      const [gx, gy] = at(heroAt[0], heroAt[1]);
      B.shadow(gx, gy, 0.36);
      B.sprite(s, gx, gy);
      if (s.lights?.length) lights.push({ s, x: gx, y: gy });
    });
  }
  puts.sort((a, b) => a.d - b.d).forEach((p) => p.f());
  // ---- the canvas, the lights added over it (as the game draws them)
  const cv = document.createElement('canvas');
  cv.width = GW * 2;
  cv.height = GH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.putImageData(new ImageData(B.d, GW * 2, GH * 2), 0, 0);
  g.imageSmoothingEnabled = false;
  g.setTransform(2, 0, 0, 2, 0, 0);
  for (const l of lights) {
    if (l.s) drawLights(g, l.s, Math.round(l.x), Math.round(l.y));
    else drawGlow(g, l.x, l.y, l.r ?? 40, l.c ?? '#ff8a2a', l.a ?? 0.3);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE PICTURES

export const VIEWS: readonly { hero: [number, number]; caption: string }[] = [
  { hero: [13.6, 14.4], caption: "On the wordsmith's platform" },
  { hero: [6.0, 11.6], caption: 'At the hatch: the way down' },
  { hero: [16.0, 7.4], caption: "At the smith's platform, by the gate" },
];
const WHOLE = { x: 490 - 300, y: 20, w: 600, h: 440 };
const CAP = 90;

function main(): void {
  const mode = decodeURIComponent(location.hash.slice(1)) || 'whole';
  const out = document.createElement('canvas');
  document.body.style.margin = '0';
  document.body.style.background = '#05040f';
  document.body.appendChild(out);
  out.style.display = 'block';
  const G = (): CanvasRenderingContext2D => out.getContext('2d') as CanvasRenderingContext2D;
  if (mode === 'whole') {
    const cv = scene(null);
    out.width = WHOLE.w * 2;
    out.height = WHOLE.h * 2 + CAP;
    const g = G();
    g.imageSmoothingEnabled = false;
    g.drawImage(cv, WHOLE.x * 2, WHOLE.y * 2, WHOLE.w * 2, WHOLE.h * 2, 0, 0, WHOLE.w * 2, WHOLE.h * 2);
    g.fillStyle = '#0d1030';
    g.fillRect(0, WHOLE.h * 2, out.width, CAP);
    drawText(g, 'THE STILT TOWN', 20, WHOLE.h * 2 + 22, '#e9ecff', { scale: 6 });
  } else {
    const n = Math.max(1, Math.min(3, Number(mode.split(':')[1]) || 1));
    const v = VIEWS[n - 1];
    const cv = scene(v.hero);
    const [hx, hy] = at(v.hero[0], v.hero[1]);
    const PW = 507;
    const PH = 234;
    out.width = PW * 2;
    out.height = PH * 2 + 60;
    const g = G();
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#07060f';
    g.fillRect(0, 0, out.width, out.height);
    g.drawImage(cv, Math.round((PW / 2 - hx) * 2), Math.round((PH / 2 - (hy - 14)) * 2));
    g.fillStyle = '#0d1030';
    g.fillRect(0, PH * 2, out.width, 60);
    drawText(g, `${n}  ${v.caption.toUpperCase()}`, 16, PH * 2 + 14, '#e9ecff', { scale: 4 });
  }
  (window as unknown as { __ready: boolean }).__ready = true;
}
main();
