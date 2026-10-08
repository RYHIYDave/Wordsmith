// Dev page: the frames of a moving picture of the town (Version 14.4), for tools/town_gif.mjs to
// collect and join into a GIF. The hall is the game's own (game/level.ts: makeTown), drawn with
// the game's own pictures in the game's own order, and every thing shows what the game would
// show at that moment (art/townscene.ts: townSprite). What is left out is the hero, the names
// over the services, and the dark: in the game the hall is dimmer away from the hero.
//   node tools/town_gif.mjs smithy previews/v144_smithy.gif
//   hash = <place>[:<scale>[:<still>]]
//     place = hall (default: the whole of it) | gate | smithy | bazaar | ring | corner
//     scale = screen pixels per game pixel (default 2 for the hall, 3 for a place)
//     still = a number: one frame only, at that many seconds (for a still picture)
// One round of a place's person is shown: a turn of their loop, what they do now and then, and
// the rest of their loops; so the picture comes round to where it began. (The hall has all four,
// whose rounds are of different lengths: it is as long as the wordsmith's, and the others jump
// a little where it begins again.)
// The page draws frame 0 and offers window.__frame(i), which draws frame i and returns it as a PNG.

import { makeGroundArt } from '../art/ground';
import { IDLE_FPS } from '../art/kit';
import { makeDungeonProps } from '../art/props';
import { makeTownProps } from '../art/town';
import { ACT_FPS, makeTownsfolk } from '../art/townsfolk';
import type { Townsman } from '../art/townsfolk';
import { isTownFlat, townSprite } from '../art/townscene';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { TOWN, makeTown } from '../game/level';
import { T_FLOOR, T_WALL } from '../game/types';

const [placeArg = 'hall', scaleArg = '', stillArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');

const L = makeTown(7);
const f = L.floor;
const ground = makeGroundArt();
const things = makeDungeonProps();
const art = { town: makeTownProps(), folk: makeTownsfolk() };

/** What each picture shows: the middle of it (a place in the hall, in tiles), how big it is (game pixels), and whose round it lasts. */
interface View {
  x: number;
  y: number;
  w: number;
  h: number;
  /** How far the middle of the picture is above the floor point at (x, y): things stand up from the floor. */
  up: number;
  who: Townsman | null;
  /** The person's clock is set this far on in the game (art/townscene.ts). */
  phase: number;
}
const VIEWS: Record<string, View> = {
  hall: { x: 13.5, y: 12.5, w: 500, h: 300, up: 14, who: art.folk.wordsmith, phase: 6.4 },
  gate: { x: TOWN.gateWall.x + TOWN.gateWall.n / 2, y: TOWN.y0 + 0.6, w: 150, h: 120, up: 26, who: null, phase: 0 },
  smithy: { x: TOWN.armourer.x + 0.6, y: TOWN.armourer.y + 0.4, w: 150, h: 112, up: 16, who: art.folk.armourer, phase: 0 },
  bazaar: { x: TOWN.mystic.x + 0.5, y: TOWN.mystic.y + 0.5, w: 132, h: 124, up: 22, who: art.folk.mystic, phase: 3.1 },
  ring: { x: TOWN.wordsmith.x + 0.5, y: TOWN.wordsmith.y + 0.5, w: 170, h: 124, up: 14, who: art.folk.wordsmith, phase: 6.4 },
  corner: { x: TOWN.stranger.x + 0.9, y: TOWN.stranger.y + 0.9, w: 116, h: 100, up: 24, who: art.folk.stranger, phase: 4.7 },
};
const place = placeArg in VIEWS ? placeArg : 'hall';
const view = VIEWS[place];
const S = Number(scaleArg) || (place === 'hall' ? 2 : 3);

/** Moving-picture frames a second (a GIF counts in hundredths of a second: 20 a second is 5 each). */
const FPS = place === 'hall' || place === 'ring' ? 10 : 20;
const TICK = 1 / FPS;
/** How long the picture is, and the game's time at its first frame: one turn of the loop before the person's act begins. */
let seconds = 4.8;
let t0 = 0;
if (view.who) {
  const loopT = view.who.idle.length / IDLE_FPS;
  const rest = view.who.loops * loopT;
  seconds = rest + view.who.act.length / ACT_FPS;
  t0 = rest - loopT - view.phase;
}
const still = stillArg !== '' && Number.isFinite(Number(stillArg));
const FRAMES = still ? 1 : Math.round(seconds * FPS);

const W = view.w;
const H = view.h;
const cv = document.createElement('canvas');
cv.width = W * S;
cv.height = H * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);

// where the hall's (0, 0) is on the picture, so that the view's middle is in the middle of it
const ox = Math.round(W / 2 - (view.x - view.y) * 16);
const oy = Math.round(H / 2 + view.up - (view.x + view.y) * 8);

interface Stand {
  d: number;
  sp: Sprite;
  x: number;
  y: number;
}

function draw(t: number): void {
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  const stands: Stand[] = [];
  // the floor, and the walls (which stand: they are drawn in their turn with everything else)
  for (let s = 0; s <= f.w + f.h - 2; s++) {
    for (let tx = Math.max(0, s - f.h + 1); tx <= Math.min(f.w - 1, s); tx++) {
      const ty = s - tx;
      const idx = ty * f.w + tx;
      const kind = f.tiles[idx];
      const px = ox + (tx - ty) * 16;
      const py = oy + s * 8;
      if (px < -40 || px > W + 40 || py < -120 || py > H + 40) continue;
      if (kind === T_FLOOR) {
        const sp = ground.floor(tx, ty);
        g.drawImage(sp.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
        const wl = tx > 0 && f.tiles[idx - 1] === T_WALL;
        const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL;
        if (wl) g.drawImage(ground.shadeLeft.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
        if (wr) g.drawImage(ground.shadeRight.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
        if (!wl && !wr && tx > 0 && ty > 0 && f.tiles[idx - f.w - 1] === T_WALL) g.drawImage(ground.shadeCorner.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
      } else if (kind === T_WALL) {
        const part = ty === TOWN.gateWall.y ? tx - TOWN.gateWall.x : -1;
        const v = f.variant[idx];
        const sp =
          part >= 0 && part < TOWN.gateWall.n
            ? ground.gate[Math.floor(t * 6) % ground.gate.length][part]
            : L.low[idx]
              ? ground.wallsLow[v % ground.wallsLow.length]
              : ground.wallsTall[v % ground.wallsTall.length];
        stands.push({ d: s + 1, sp, x: px, y: py });
      }
    }
  }
  // what lies on the floor
  for (const p of L.props) {
    if (!isTownFlat(p.kind)) continue;
    const sp = townSprite(art, p.kind, p.variant, t);
    if (sp) g.drawImage(sp.img, Math.round(ox + (p.x - p.y) * 16) - sp.ax, Math.round(oy + (p.x + p.y) * 8) - sp.ay, sp.w, sp.h);
  }
  // what stands
  for (const p of L.props) {
    if (isTownFlat(p.kind)) continue;
    let sp: Sprite | null;
    switch (p.kind) {
      case 'brazier': sp = things.brazier[(Math.floor(t * 8) + p.variant) % 4]; break;
      case 'pillar': sp = things.pillar; break;
      case 'barrel': sp = things.barrel; break;
      case 'urn': sp = things.urn; break;
      default: sp = townSprite(art, p.kind, p.variant, t);
    }
    if (!sp) continue;
    stands.push({ d: p.x + p.y, sp, x: Math.round(ox + (p.x - p.y) * 16), y: Math.round(oy + (p.x + p.y) * 8) });
  }
  stands.sort((a, b) => a.d - b.d);
  for (const st of stands) {
    if (st.sp.aura) drawAura(g, st.sp, st.x, st.y);
    g.drawImage(st.sp.img, st.x - st.sp.ax, st.y - st.sp.ay, st.sp.w, st.sp.h);
  }
  for (const st of stands) if (st.sp.lights) drawLights(g, st.sp, st.x, st.y);
}

const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
w.__frames = FRAMES;
w.__tickMs = TICK * 1000;
w.__frame = (i: number): string => {
  draw(still ? Number(stillArg) : t0 + i * TICK);
  return cv.toDataURL('image/png');
};
draw(still ? Number(stillArg) : t0);
console.log(`${place}: ${FRAMES} frames of ${W * S}x${H * S}, ${seconds.toFixed(1)} s`);
w.__ready = true;
