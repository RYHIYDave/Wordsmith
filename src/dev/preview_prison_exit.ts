// Dev page: FLOOR 3'S WAY OUT, THE DOOR OUT THE BACK OF HIS HALL (art/prison_exit.ts, behind PRISON_EXIT, off), in his hall
// built the game's way from the prison's game-ready pieces (art/prison.ts) and lit as the renderer lights it (render.ts:
// the dark, holes where the lights burn, their glows over it), as src/dev/preview_prison_game.ts lays floor 3. Nothing of the
// game imports it.
//   node tools/preview.mjs src/dev/preview_prison_exit.ts docs/mockups/floor3_look/pictures/exit_door.png 1200 2240 "sheet"
//   node tools/film_frames.mjs src/dev/preview_prison_exit.ts "film" <dir>     (the film's frames, 1200 x 660)
import type { Sprite } from '../engine/px';
import { drawGlow, drawLights } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { makeChainedArt3 } from '../art/bosses3';
import { cryptGround } from '../art/crypt';
import type { Piece } from '../art/floorkit';
import { GATE_UP, PILLAR, STRIP } from '../art/gates';
import type { Strip } from '../art/gates';
import { GREAT, HALL_RINGS, PRISON_LIGHTS, makePrisonArt } from '../art/prison';
import { makePrisonGateArt } from '../art/prison_gate';
import { EXIT_FRAMES, EXIT_LIGHTS, exitArt, exitSpill } from '../art/prison_exit';

const [mode = 'sheet'] = decodeURIComponent(location.hash.slice(1)).split(':');
const A = makePrisonArt();
const G = makePrisonGateArt();
const X = exitArt(true);
const ground = cryptGround(3);

// =================================================================================================
// HIS HALL (as preview_prison_game.ts lays it): the hall, his doorway and gate, a little of the corridor to it. THE DOOR in
// its far wall (the wall along x at y = -10, the farthest from his gate), its two tiles x = 2 and 3; the face at y = -9.

type R = { x0: number; y0: number; x1: number; y1: number };
const ROOMS: R[] = [
  { x0: -2, y0: -9, x1: 8, y1: 0 },
  { x0: 2, y0: 0, x1: 5, y1: 1 },
  { x0: 2, y0: 1, x1: 5, y1: 4 },
];
const isFloor = (x: number, y: number): boolean => ROOMS.some((r) => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1);
const GX = 2;
const GY = -7;
const BOSS: [number, number] = [GX + GREAT / 2, GY + GREAT / 2];
/** The door: its first tile along the wall, the wall's row, its anchor (the foot of the face under its middle). */
const DOOR = { x: 4, row: -10 };
const DOOR_AT: [number, number] = [DOOR.x + 1, DOOR.row + 1];
const isDoor = (x: number, y: number): boolean => y === DOOR.row && (x === DOOR.x || x === DOOR.x + 1);

const RW = 600;
const RH = 300;
const OX = 128;
const OY = 200;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 16, OY + (x + y) * 8 - z];

const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const boss = makeChainedArt3();
const piece = (n: string): Piece => {
  const p = A.pieces.find((q) => q.name === n);
  if (!p) throw new Error(`no piece ${n}`);
  return p;
};
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

const dieClip = boss.front.clips?.die;
/** His picture `t` seconds after he falls (his death played once, its last frame his body); null t: standing, fighting. */
function bossAt(t: number | null, tick: number): Sprite {
  if (t === null || !dieClip) return boss.front.idle[Math.floor(tick / 15) % boss.front.idle.length];
  const k = Math.min(dieClip.frames.length - 1, Math.floor(t * dieClip.fps));
  return dieClip.frames[k];
}
/** The knight walking (his back to us, going up the screen), `walked` tiles. */
function heroWalk(walked: number): Sprite {
  const set = hero.back;
  const n = set.walk.length;
  const k = set.walkStride !== undefined ? Math.round((walked / set.walkStride) * n) : Math.floor(walked * 3);
  return set.walk[((k % n) + n) % n];
}

interface Shot {
  /** The door's frame (-1: shut, the fight). */
  door: number;
  /** Seconds since he fell (null: he fights). */
  fell: number | null;
  hero: [number, number];
  heroS: Sprite;
  tick: number;
  /** The screen going dark as he goes in (0 to 1). */
  curtain?: number;
}
interface Stand { d: number; s: Sprite; x: number; y: number; shadow: number }

/** The hall drawn, RW x RH game pixels at two picture pixels each. */
function scene(sh: Shot): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = RW * 2;
  cv.height = RH * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#040406';
  g.fillRect(0, 0, cv.width, cv.height);
  g.setTransform(2, 0, 0, 2, 0, 0);
  const draw = (s: Sprite, x: number, y: number): void => {
    g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
  };
  const fr = Math.floor(sh.tick / 5);
  const doorF = sh.door < 0 ? 0 : Math.min(EXIT_FRAMES - 1, sh.door);
  const [dx, dy] = at(DOOR_AT[0], DOOR_AT[1]);
  // ---- THE FLOOR; then THE PASSAGE behind the door, with the floor, under everything that stands
  for (let x = -4; x < 10; x++) for (let y = -11; y < 6; y++) {
    if (!isFloor(x, y)) continue;
    const [px, py] = at(x, y);
    const hall = A.hall.floor(x, y, x - GX, y - GY);
    draw(hall ? hall[fr % hall.length] : A.floor(x, y), px, py);
    if (!isFloor(x - 1, y)) draw(ground.shadeLeft, px, py);
    if (!isFloor(x, y - 1) && !isDoor(x, y - 1)) draw(ground.shadeRight, px, py);
    if (!isFloor(x + 1, y)) draw(ground.edgeRight, px, py);
    if (!isFloor(x, y + 1)) draw(ground.edgeLeft, px, py);
  }
  const under = X.under[fr % X.under.length];
  draw(under, dx, dy);
  const lit: { s: Sprite; x: number; y: number }[] = [{ s: under, x: dx, y: dy }];

  // ---- WHAT STANDS, sorted as the renderer sorts it
  const stands: Stand[] = [];
  const stand = (d: number, s: Sprite, x: number, y: number, shadow = 0): void => {
    stands.push({ d, s, x, y, shadow });
  };
  const inHall = (x: number, y: number): boolean => x >= -3 && x <= 8 && y >= -10 && y <= -1;
  for (let x = -4; x < 10; x++) for (let y = -11; y < 6; y++) {
    if (isFloor(x, y) || isDoor(x, y)) continue;
    const d = x + y + 1;
    if (isFloor(x, y + 1) && !isFloor(x, y - 1)) stand(d, inHall(x, y) ? A.hall.faceLeft[((x % 4) + 4) % 4] : A.face(true, x, y), x, y);
    if (isFloor(x + 1, y) && !isFloor(x - 1, y)) stand(d, inHall(x, y) ? A.hall.faceRight[((y % 4) + 4) % 4] : A.face(false, x, y), x, y);
  }
  // THE DOOR, at the wall's face: before it whoever stands in the hall, behind it whoever has gone into its doorway
  const DOOR_D = DOOR_AT[0] + DOOR_AT[1];
  stand(DOOR_D, X.frames[doorF], DOOR_AT[0], DOOR_AT[1]);
  const onWall = (n: string, tx: number, ty: number, alongX: boolean): void => {
    const p = piece(n);
    const q = p.spots?.[0];
    const list = q ? (alongX ? q.left : q.right) : alongX ? p.left! : p.right!;
    const [wx, wy] = alongX ? [tx + 0.5, ty + 1] : [tx + 1, ty + 0.5];
    stand(tx + ty + 1.01, list[fr % list.length], wx, wy);
  };
  const BASKETS: [number, number, boolean][] = [[3, -10, true], [6, -10, true], [0, -10, true], [-3, -3, false], [-3, -7, false], [0, 3, true]];
  for (const [x, y, ax] of BASKETS) onWall('fire basket', x, y, ax);
  onWall('a chain from the dark, a hook', -3, -5, false);
  const things: [string, number, number][] = [['the great winch', -0.6, -6.6], ['the chain post', 2.6, -8.5], ['the chain post', 7.4, -6.2], ['a heap of chains', 6.9, -1.2], ['ball and chain', 0.6, -0.9]];
  for (const [n, x, y] of things) {
    const p = piece(n);
    stand(x + y, p.frames![0], x, y, p.shadow ?? 0);
  }
  for (const [rx, ry] of HALL_RINGS) stand(GX + rx + GY + ry, piece('a great chain from the dark').frames![0], GX + rx, GY + ry);
  // HIS GATE (down behind the knight: the fight began)
  {
    const a = 2;
    const face = 1;
    const wide = PILLAR / 32;
    const pAt = (t: number, back = 0): [number, number] => [a + t, face - back];
    const strips = (list: Strip[], t0: number, back: number): void => {
      for (const q of list) {
        const [x, y] = pAt(t0 + q.t, back);
        stand(x + y + STRIP / 64, q.s, x, y);
      }
    };
    for (const [x, y] of [pAt(0), pAt(3 + wide)]) stand(x + y - wide, G.pillar(true), x, y);
    strips(G.portcullis(true, true, sh.fell === null ? 0 : sh.door > 60 ? GATE_UP : 0), -wide, wide);
    strips(G.arch(true, true, true), -wide, 0);
  }
  // HIM; THE KNIGHT (in the doorway's row: behind the door's face)
  stand(BOSS[0] + BOSS[1], bossAt(sh.fell, sh.tick), BOSS[0], BOSS[1], sh.fell === null ? 0.9 : 0.6);
  const [hx0, hy0] = sh.hero;
  const hd = hy0 < DOOR_AT[1] ? Math.min(hx0 + hy0, DOOR_D - 0.05) : Math.max(hx0 + hy0, DOOR_D + 0.05);
  stand(hd, sh.heroS, hx0, hy0, 0.36);
  stands.sort((p, q) => p.d - q.d);
  for (const st of stands) {
    const [sx, sy] = at(st.x, st.y);
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
    if (st.s.lights) lit.push({ s: st.s, x: Math.round(sx), y: Math.round(sy) });
  }

  // ---- THE DARK, as the renderer lays it, with its holes
  const dark = document.createElement('canvas');
  dark.width = RW;
  dark.height = RH;
  const dg = dark.getContext('2d') as CanvasRenderingContext2D;
  dg.fillStyle = `rgba(6,4,14,${PRISON_LIGHTS.dark})`;
  dg.fillRect(0, 0, RW, RH);
  dg.globalCompositeOperation = 'destination-out';
  dg.imageSmoothingEnabled = true;
  const spot = (x: number, y: number, r: number, strength: number): void => {
    if (strength <= 0) return;
    dg.globalAlpha = Math.min(1, strength);
    dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
  };
  const [hx, hy] = at(hx0, hy0);
  spot(hx, hy - 8, 380, 0.36);
  spot(hx, hy - 8, 165, 1);
  const L = PRISON_LIGHTS;
  const glowsOver: [number, number, number, string, number][] = [];
  for (const [x, y, ax] of BASKETS) {
    const [fx, fy] = ax ? at(x + 0.5, y + 1) : at(x + 1, y + 0.5);
    spot(fx, fy - L.basket.up, L.basket.r, L.basket.strength);
    glowsOver.push([fx, fy - L.basket.up, L.basket.glow.r, L.basket.glow.color, L.basket.glow.a]);
  }
  // the passage's baskets (lit all the while), and the doorway's light once the leaf moves
  for (const b of EXIT_LIGHTS.baskets) {
    spot(dx + b.x, dy + b.y, EXIT_LIGHTS.basket.r, EXIT_LIGHTS.basket.strength);
    glowsOver.push([dx + b.x, dy + b.y, EXIT_LIGHTS.basket.glow.r, EXIT_LIGHTS.basket.glow.color, EXIT_LIGHTS.basket.glow.a]);
  }
  for (const q of EXIT_LIGHTS.path) spot(dx + q.x, dy + q.y, q.r, q.strength);
  const spill = sh.door < 0 ? 0 : exitSpill(doorF);
  const S = EXIT_LIGHTS.spill;
  spot(dx + S.x, dy + S.y, S.r, S.strength * spill);
  if (spill > 0) glowsOver.push([dx + S.x, dy + S.y, S.glow.r, S.glow.color, S.glow.a * spill]);
  {
    const [cx, cy] = at(BOSS[0], BOSS[1]);
    spot(cx, cy, L.great.r, L.great.strength);
    glowsOver.push([cx, cy, L.great.glow.r, L.great.glow.color, L.great.glow.a]);
    if (sh.fell === null) spot(cx, cy - 12, 56, 0.7);
  }
  dg.globalAlpha = 1;
  dg.globalCompositeOperation = 'source-over';
  {
    dg.save();
    dg.translate(RW / 2, RH / 2);
    dg.scale(RW / 2, RH / 2);
    const grd = dg.createRadialGradient(0, 0, 0.55, 0, 0, Math.SQRT2);
    grd.addColorStop(0, 'rgba(4,3,10,0)');
    grd.addColorStop(1, 'rgba(4,3,10,0.62)');
    dg.fillStyle = grd;
    dg.fillRect(-1, -1, 2, 2);
    dg.restore();
  }
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.drawImage(dark, 0, 0);
  for (const q of lit) drawLights(g, q.s, q.x, q.y);
  for (const [x, y, r, c, a] of glowsOver) drawGlow(g, x, y, r, c, a);
  if (sh.curtain && sh.curtain > 0) {
    g.fillStyle = `rgba(0,0,0,${Math.min(1, sh.curtain)})`;
    g.fillRect(0, 0, RW, RH);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return cv;
}

// =================================================================================================
// THE MOMENTS

const STAND: [number, number] = [5.2, -3.6];
const fight = (tick: number): Shot => ({ door: -1, fell: null, hero: [2.6, -3.0], heroS: hero.back.idle[Math.floor(tick / 15) % hero.back.idle.length], tick });
const opening = (f: number): Shot => ({ door: f, fell: f / 30, hero: STAND, heroS: hero.back.idle[Math.floor(f / 15) % hero.back.idle.length], tick: f });
/** Walking in: from where he stood to the doorway's middle and in, `t` seconds after the door is open. */
const WALK_SPEED = 3.6;
const WALK_TO: [number, number] = [DOOR_AT[0], DOOR_AT[1] - 0.55];
function walking(t: number): Shot {
  const dxw = WALK_TO[0] - STAND[0];
  const dyw = WALK_TO[1] - STAND[1];
  const len = Math.hypot(dxw, dyw);
  const go = Math.min(len, t * WALK_SPEED);
  const k = go / len;
  const reached = t * WALK_SPEED - len;
  return {
    door: EXIT_FRAMES - 1,
    fell: 10,
    hero: [STAND[0] + dxw * k, STAND[1] + dyw * k],
    heroS: go < len ? heroWalk(go) : heroWalk(len),
    tick: 90 + Math.floor(t * 30),
    curtain: reached > 0 ? (reached / WALK_SPEED) / 0.35 : 0,
  };
}
const WALK_SECS = Math.hypot(WALK_TO[0] - STAND[0], WALK_TO[1] - STAND[1]) / WALK_SPEED;

/** The door close, twice as big (a crop of the hall round it). */
function close(src: HTMLCanvasElement, w = 200, h = 150, scale = 2): HTMLCanvasElement {
  const [cx, cy] = at(DOOR_AT[0], DOOR_AT[1]);
  const cv = document.createElement('canvas');
  cv.width = w * scale;
  cv.height = h * scale;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const x0 = (cx + Math.round(w * 0.16) - w / 2) * 2;
  const y0 = (cy - Math.round(h * 0.36) - h / 2) * 2;
  g.drawImage(src, x0, y0, w * 2, h * 2, 0, 0, w * scale, h * scale);
  return cv;
}
/** One phone screen (507 x 234 game pixels at two picture pixels each), the camera on the knight. */
function phone(sh: Shot): HTMLCanvasElement {
  const src = scene(sh);
  const [hx, hy] = at(sh.hero[0], sh.hero[1]);
  const cv = document.createElement('canvas');
  cv.width = 1014;
  cv.height = 468;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#040406';
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  g.drawImage(src, Math.round(507 - hx * 2), Math.round(234 - (hy - 30) * 2));
  return cv;
}

function label(g: CanvasRenderingContext2D, s: string, x: number, y: number, size = 20): void {
  g.font = `bold ${size}px sans-serif`;
  g.textBaseline = 'top';
  g.lineWidth = 4;
  g.strokeStyle = 'rgba(0,0,0,0.85)';
  g.strokeText(s, x, y);
  g.fillStyle = '#efe4d2';
  g.fillText(s, x, y);
}

function sheet(): HTMLCanvasElement {
  const SW = 1200;
  const blocks: { h: number; draw: (g: CanvasRenderingContext2D, y: number) => void }[] = [];
  const text = (s: string, size: number, bold = false, color = '#e8dccb'): void => {
    blocks.push({ h: size + 16, draw: (g, y) => {
      g.fillStyle = color;
      g.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
      g.textBaseline = 'top';
      g.fillText(s, 24, y + 8);
    } });
  };
  const pic = (c: HTMLCanvasElement, x = 0, gap = 12): void => {
    blocks.push({ h: c.height + gap, draw: (g, y) => g.drawImage(c, x, y) });
  };
  text('Floor 3: the way out of his hall. A door out the back, no stairs.', 26, true);
  text('Built from the game pieces and lit the way the game lights it.', 18, false, '#b8ab98');
  text('1. During the fight: the iron door at the back of his hall, barred and locked, his mark on it.', 18, true);
  pic(scene(fight(0)));
  text('2. He falls: his mark goes out, the bars slide back, the lock drops ... a beat ... then it swings open.', 18, true);
  const m = [opening(21), opening(48), opening(56)].map((s) => close(scene(s), 130, 100, 3));
  const row = document.createElement('canvas');
  row.width = SW;
  // (three close-ups, each the door three times the game's size)
  row.height = m[0].height;
  const rg = row.getContext('2d') as CanvasRenderingContext2D;
  m.forEach((c, i) => rg.drawImage(c, i * 400, 0));
  ['bars drawn back', 'it swings in, sparks off the hinge', 'it hits the wall: soot and grit'].forEach((s, i) => label(rg, s, i * 400 + 10, 8, 17));
  pic(row);
  text('3. Open: the knight walks into the passage. It leads away from the fire, its steps going down to floor 4.', 18, true);
  pic(scene(walking(WALK_SECS * 0.96)));
  text('On a phone, the game\'s own size: the door open, the knight on his way in.', 18, true);
  const ph = phone(walking(WALK_SECS * 0.7));
  blocks.push({ h: ph.height + 14, draw: (g, y) => g.drawImage(ph, Math.round((SW - ph.width) / 2), y) });
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

// =================================================================================================
// THE FILM, frame by frame (1200 x 660: a caption over the hall)

interface FilmFrame { shot: Shot; caption: string; closeUp?: boolean }
const film: FilmFrame[] = [];
for (let i = 0; i < 45; i++) film.push({ shot: fight(i), caption: 'During the fight: the door at the back of his hall is barred shut.' });
for (let f = 0; f < EXIT_FRAMES; f++) film.push({ shot: opening(f), caption: 'He falls: the bars slide back, a beat, then the door grinds open.' });
for (let i = 0; i < Math.ceil((WALK_SECS + 0.35) * 30) + 12; i++) film.push({ shot: walking(i / 30), caption: i / 30 < WALK_SECS ? 'Walk into the doorway ...' : '... and on, down to floor 4.' });
for (let i = 0; i < EXIT_FRAMES * 2; i++) film.push({ shot: opening(Math.floor(i / 2)), caption: 'Again, close up, at half speed.', closeUp: true });

function filmFrame(k: number): HTMLCanvasElement {
  const fr = film[k];
  const cv = document.createElement('canvas');
  cv.width = 1200;
  cv.height = 660;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0a0809';
  g.fillRect(0, 0, cv.width, cv.height);
  const src = scene(fr.shot);
  if (fr.closeUp) g.drawImage(close(src, 300, 150, 4), 0, 60);
  // (the hall a little closer than the game's size: its middle, from the gate to the passage beyond the door)
  else g.drawImage(src, 170, 160, 860, 430, 0, 60, 1200, 600);
  g.fillStyle = '#efe4d2';
  g.font = 'bold 26px sans-serif';
  g.textBaseline = 'middle';
  g.fillText(fr.caption, 24, 30);
  return cv;
}

const w = window as unknown as { __size: [number, number]; __ready: boolean; __frames: number; __frame: (k: number) => string };
if (mode === 'film') {
  w.__frames = film.length;
  w.__frame = (k: number): string => filmFrame(k).toDataURL('image/png');
  w.__ready = true;
} else {
  const out = mode === 'phone' ? phone(walking(WALK_SECS * 0.55)) : mode === 'fight' ? scene(fight(0)) : mode === 'open' ? scene(walking(WALK_SECS * 0.96)) : sheet();
  out.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(out);
  w.__size = [out.width, out.height];
  w.__ready = true;
}
