// Dev page: FLOOR 17, THE MASQUE, BUILT FROM ITS GAME-READY PARTS: its ground painted by the game's painter in the Masque's
// look (art/masque.ts) from a level laid by hand (dev/masque_level.ts), its pieces (art/floor17.ts) set on it as the game
// sets them (dev/masque_lay.ts: on the walls, on the floor, then what stands, far to near), with the knight in the violet
// room. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_masque.ts shots/masque/game.png 1200 840 "overview"
//   PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_masque.ts shots/masque/game_phone.png 1014 468 "phone"
//     overview  the corner, as built, no dark (600 x 420 game pixels at two picture pixels each)
//     phone     one phone screen (the game's 507 x 234 game pixels), the camera on the knight, the dungeon's dark as the
//               game lays it (render.ts: FAR_DARK over all, the hero's pool and each light's taken out of it, the
//               vignette) and the pieces' lights over it; "phone-bare" the same without the dark
//     black     a phone screen of the black room, its clock at its chime, the dark as the game lays it
//     ground    the ground alone; "tiles" the overview with the tiles the game walks by drawn over it
//     seven     the ground of all seven rooms side by side, in the tale's order, each named (the corner has three)
//     close:X:Y twice as big round picture pixel (X, Y) of the overview
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { masqueLook, masqueWindows } from '../art/masque';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { T_FLOOR } from '../game/types';
import { M_CLOCK, M_HERO, masqueLand, sevenRoomsLand } from './masque_level';
import { MQ_ROOMS } from '../art/masque';
import { drawText } from '../engine/font';
import { P } from '../art/palette';
import { THEME } from '../ui/ui';
import { layMasquePieces } from './masque_lay';

const [mode = 'overview', a1, a2] = decodeURIComponent(location.hash.slice(1)).split(':');
const PHONE = mode === 'phone' || mode === 'phone-bare' || mode === 'black';
const W = PHONE ? 1014 : 1200;
const H = PHONE ? 468 : 840;

function main(): void {
  const seven = mode === 'seven' ? sevenRoomsLand() : null;
  const land = seven ? seven.land : masqueLand();
  const floor = land.floor;
  const T = terrainOf(floor, masqueLook(land));
  // the camera: the overview as the first look's; a phone screen on the knight (or the black room's clock); the seven's middle
  const focus: readonly [number, number] = mode === 'black' ? [M_CLOCK[0] + 3.2, M_CLOCK[1] + 2.4] : seven ? [17.5, 19.5] : M_HERO;
  const [fx, fy] = pictureOf(focus[0], focus[1]);
  const VX = PHONE ? Math.round(fx - W / 2) : Math.round(fx - W / 2 + 120);
  const VY = PHONE ? Math.round(fy - (H * 250) / 468) : Math.round(fy - H / 2 - 10);

  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  cv.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(cv);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const PIECE = 256;
  for (let py = 0; py < H; py += PIECE) {
    for (let px = 0; px < W; px += PIECE) {
      const pw = Math.min(PIECE, W - px);
      const ph = Math.min(PIECE, H - py);
      const p = paintTerrain(T, VX + px, VY + py, pw, ph);
      g.putImageData(new ImageData(p.rgba, pw, ph), px, py);
    }
  }
  if (mode === 'tiles') {
    g.lineWidth = 1;
    for (let ty = 0; ty < floor.h; ty++) {
      for (let tx = 0; tx < floor.w; tx++) {
        if (floor.tiles[ty * floor.w + tx] !== T_FLOOR) continue;
        g.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        g.beginPath();
        ([[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]] as const).forEach(([x, y], n) => {
          const [sx, sy] = pictureOf(x, y);
          if (n) g.lineTo(sx - VX + 0.5, sy - VY + 0.5);
          else g.moveTo(sx - VX + 0.5, sy - VY + 0.5);
        });
        g.closePath();
        g.stroke();
      }
    }
  }
  if (seven) {
    seven.middles.forEach(([x, y], i) => {
      const [sx, sy] = pictureOf(x, y);
      g.save();
      g.scale(2, 2);
      const name = `the ${MQ_ROOMS[i].name} room`;
      drawText(g, name, (sx - VX) / 2 - name.length * 2.6, (sy - VY) / 2 + 30, THEME.text, { shadow: P.ink });
      g.restore();
    });
  }
  const lights: { x: number; y: number; r: number; a: number; color: string }[] = [];
  if (mode !== 'ground' && !seven) {
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
    const stands = layMasquePieces(mode === 'black');
    const hero = makeHeroArt3().of('warrior', { twoHanded: false });
    stands.push({ d: M_HERO[0] + M_HERO[1], s: hero.front.idle[0], x: M_HERO[0], y: M_HERO[1], shadow: 0.36, name: 'hero' });
    // (on the walls first, then what lies on the floor, then what stands, far to near)
    stands.sort((a, b) => (a.wall !== b.wall ? (a.wall ? -1 : 1) : a.under !== b.under ? (a.under ? -1 : 1) : a.d - b.d));
    for (const st of stands) {
      const [px, py] = pictureOf(st.x, st.y);
      const sx = (px - VX) / 2;
      const sy = (py - VY) / 2;
      g.setTransform(2, 0, 0, 2, 0, 0);
      if (st.shadow) {
        const w = st.shadow * 22.6 * 1.5;
        const hh = st.shadow * 11.3 * 1.5;
        g.save();
        g.imageSmoothingEnabled = true;
        g.globalAlpha = 0.6;
        g.drawImage(blot, sx - w, sy - hh, w * 2, hh * 2);
        g.restore();
      }
      const s: Sprite = st.s;
      g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy) - s.ay, s.w, s.h);
      g.setTransform(1, 0, 0, 1, 0, 0);
      for (const L of s.lights ?? []) lights.push({ x: (Math.round(sx) - s.ax + L.x) * 2, y: (Math.round(sy) - s.ay + L.y) * 2, r: L.r * 2, a: L.a ?? 0.4, color: L.color });
    }
    // (the ground's windows: the game may give each a light over the dark, as masqueWindows says where they are)
    for (const w of masqueWindows(land)) {
      const [wx, wy] = pictureOf(w.x, w.y);
      lights.push({ x: wx - VX, y: wy - VY - 58, r: 70, a: 0.4, color: w.light });
    }
  }
  if (mode === 'phone' || mode === 'black') {
    // THE DUNGEON'S DARK as the game lays it (render.ts: FAR_DARK 0.88 over all, the hero's wide gentle pool and his
    // bright one taken out of it, and round every light), then the vignette, then the lights' glow over it
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const d = c.getContext('2d') as CanvasRenderingContext2D;
    d.fillStyle = 'rgba(6,4,14,0.88)';
    d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = 'destination-out';
    const [hx0, hy0] = pictureOf(M_HERO[0], M_HERO[1]);
    const spot = (x: number, y: number, r: number, strength: number): void => {
      d.save();
      d.translate(x, y);
      d.scale(1, 0.62);
      const grd = d.createRadialGradient(0, 0, 0, 0, 0, r);
      grd.addColorStop(0, `rgba(0,0,0,${strength})`);
      grd.addColorStop(0.5, `rgba(0,0,0,${0.7 * strength})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = grd;
      d.fillRect(-r, -r, 2 * r, 2 * r);
      d.restore();
    };
    spot(hx0 - VX, hy0 - VY - 16, 380 * 2, 0.36);
    spot(hx0 - VX, hy0 - VY - 16, 165 * 2, 1);
    for (const L of lights) spot(L.x, L.y, L.r * 1.3, Math.min(0.9, L.a * 1.4));
    g.drawImage(c, 0, 0);
    const grd = g.createRadialGradient(W / 2, H / 2, (0.5 * Math.hypot(W, H)) / 2 / Math.SQRT2, W / 2, H / 2, Math.hypot(W, H) / 2);
    grd.addColorStop(0, 'rgba(6,4,14,0)');
    grd.addColorStop(1, 'rgba(6,4,14,0.62)');
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const L of lights) {
      const gg = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
      gg.addColorStop(0, L.color);
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = L.a * 0.5;
      g.fillStyle = gg;
      g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
    }
    g.restore();
  }
  if (mode === 'close') {
    const src = document.createElement('canvas');
    src.width = W;
    src.height = H;
    (src.getContext('2d') as CanvasRenderingContext2D).drawImage(cv, 0, 0);
    g.fillStyle = '#08070c';
    g.fillRect(0, 0, W, H);
    g.drawImage(src, Math.round(Number(a1) - W / 4), Math.round(Number(a2) - H / 4), W / 2, H / 2, 0, 0, W, H);
  }
  (window as unknown as { __ready: boolean }).__ready = true;
}
// (after the page has loaded: painting it takes a while)
setTimeout(main, 0);
