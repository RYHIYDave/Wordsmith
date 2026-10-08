// Dev page: one MONSTER seen from all four sides at once, on the dungeon's own floor, each facing
// outward along its diagonal of the grid. The heroes have preview_turn.ts; this is the same picture
// for the figures of the bestiary, for the before and after of turning them to the grid
// (art/kit.ts, "Turned to the grid").
//   node tools/preview.mjs src/dev/preview_turn_m.ts shots/turn_m.png 900 624 "skeleton"
//   (the picture is 150 x 104 game pixels for the small figures, 190 x 140 for the brute, 220 x 176 for the
//   guardian and 250 x 190 for the Warden, times the scale: ask for a window that size)
//   hash = <figure>[:<doing>[:<scale>[:<frame>]]]
//     figure = skeleton | archer | cultist | bat | brute | guardian | warden
//     doing  = idle (default) | walk | windup | blow | after   (the last three: the attack's stills)
//     scale  = screen pixels per game pixel (default 6; 4 is enough for the Warden)
//     frame  = which frame of the loop (default 0)

import { makeBestiary } from '../art/bestiary';
import type { MonsterFigure } from '../art/bestiary';
import { makeGroundArt } from '../art/ground';
import { drawAura, drawLights, drawSprite, flipSprite } from '../engine/px';
import type { Sprite } from '../engine/px';

const [figArg = 'skeleton', doing = 'idle', scaleArg = '', frameArg = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const figure = figArg as MonsterFigure;
const big = figure === 'warden' || figure === 'guardian' || figure === 'brute';
const S = Number(scaleArg) || (figure === 'warden' ? 4 : figure === 'guardian' ? 5 : 6);
const art = makeBestiary().of(figure);
const ground = makeGroundArt();

/** The picture, in game pixels; where the middle of the four figures is on it; and how far each stands from the middle, in tiles. */
const [GW, GH, MY, OUT] = figure === 'warden' ? [250, 190, 118, 4.4] : figure === 'guardian' ? [220, 176, 112, 4] : big ? [190, 140, 84, 3.2] : [150, 104, 60, 2.5];
const MX = GW / 2;

const cv = document.createElement('canvas');
cv.width = GW * S;
cv.height = GH * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${cv.width}px`;
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
g.fillStyle = '#05040c';
g.fillRect(0, 0, GW, GH);

/** Where a point of the floor is on the picture: tile (0, 0) is the middle. */
const at = (x: number, y: number): [number, number] => [MX + (x - y) * 16, MY + (x + y) * 8];

for (let s = -24; s <= 24; s++) {
  for (let tx = -14; tx <= 14; tx++) {
    const ty = s - tx;
    if (ty < -14 || ty > 14) continue;
    const [x, y] = at(tx, ty);
    if (x < -40 || x > GW + 40 || y < -30 || y > GH + 30) continue;
    const f = ground.floor(tx + 40, ty + 40);
    g.drawImage(f.img, x - f.ax, y - f.ay, f.w, f.h);
  }
}

/** The four ways a figure can face, as steps in the world: down-right, down-left, up-right, up-left. */
const WAYS: [number, number][] = [[1, 0], [0, 1], [0, -1], [-1, 0]];

// an arrow on the floor in front of each: the way it faces
for (const [fx, fy] of WAYS) {
  const a = at(fx * (OUT + 0.55), fy * (OUT + 0.55));
  const b = at(fx * (OUT + 1.5), fy * (OUT + 1.5));
  const sx = fx - fy;
  const sy = (fx + fy) * 0.5;
  g.strokeStyle = 'rgba(255,79,138,0.5)';
  g.fillStyle = 'rgba(255,79,138,0.5)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
  g.beginPath();
  g.moveTo(b[0] + sx * 4, b[1] + sy * 4);
  g.lineTo(b[0] - sy * 4 * 1.2, b[1] + sx * 4 * 0.3);
  g.lineTo(b[0] + sy * 4 * 1.2, b[1] - sx * 4 * 0.3);
  g.closePath();
  g.fill();
}

const frame = Number(frameArg) || 0;
const shown: { d: number; sp: Sprite; x: number; y: number }[] = [];
for (const [fx, fy] of WAYS) {
  const left = fx - fy < 0;
  const set = fx + fy < -0.2 ? art.back : art.front;
  const list = doing === 'walk' ? set.walk : doing === 'idle' ? set.idle : set.attack;
  const k = doing === 'windup' ? 0 : doing === 'blow' ? 1 : doing === 'after' ? 2 : frame % list.length;
  const base = list[k];
  const sp = left ? flipSprite(base) : base;
  const [px, py] = at(fx * OUT, fy * OUT);
  shown.push({ d: fx + fy, sp, x: Math.round(px), y: Math.round(py) });
}
shown.sort((a, b) => a.d - b.d);
for (const s of shown) {
  drawAura(g, s.sp, s.x, s.y);
  g.fillStyle = 'rgba(0,0,0,0.42)';
  g.beginPath();
  g.ellipse(s.x, s.y, big ? 12 : 7, big ? 5 : 3, 0, 0, Math.PI * 2);
  g.fill();
  drawSprite(g, s.sp, s.x, s.y);
}
for (const s of shown) drawLights(g, s.sp, s.x, s.y);

(window as unknown as { __ready: boolean }).__ready = true;
