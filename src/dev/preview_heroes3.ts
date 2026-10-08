// Dev page: THE THREE HEROES, TODAY'S BESIDE THE NEW ONES. On the left of each pair the hero as
// the game has them now (hero_warrior.ts and the others); on the right the same hero painted over
// the skeleton (hero3_*.ts), standing, with the head the owner chose (B: 1.3 times life). On a
// piece of the dungeon's own floor, with the pool of light the game puts behind a hero, so that
// each is seen as it would be seen in play. The owner, 6 Oct 2026, 19:17: "We have to get the
// characters right."
//   node tools/preview.mjs src/dev/preview_heroes3.ts previews/heroes_today_and_new.png 1000 1800 "front:4"
//   hash = <front | back | both>:<screen pixels to a picture pixel; 4 if not given>:<head; 1.3 if not given>
import { makeGroundArt } from '../art/ground';
import { HERO_TAILS, makeHeroArt } from '../art/heroes';
import { paintKnight3 } from '../art/hero3_knight';
import { paintMage3 } from '../art/hero3_mage';
import { paintRanger3 } from '../art/hero3_ranger';
import type { Painted } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { bonesAt, solve } from '../art/skeleton';
import type { Sprite } from '../engine/px';
import { Tails } from '../engine/tails';
import type { TailRoot } from '../engine/tails';
import type { ClassId } from '../game/types';

const [which = 'front', scaleArg = '4'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
const VIEWS: GameView[] = which === 'both' ? ['front', 'back'] : [which === 'back' ? 'back' : 'front'];

/** A pane, in picture pixels: how far it reaches to either side of the figure's place on the floor, above it and below it. */
const HALF = 56;
const UP = 104;
const DOWN = 30;
const PW = HALF * 2;
const PH = UP + DOWN;
const PAD = 10;
const HEADING = 64;
const LABEL = 26;
const NAME = 30;

const BG = '#17142e';
const heroes = makeHeroArt();
const ground = makeGroundArt();
const WHO: { cls: ClassId; name: string; stand: string }[] = [
  { cls: 'warrior', name: 'THE KNIGHT', stand: 'rear' },
  { cls: 'ranger', name: 'THE RANGER', stand: 'rstand' },
  { cls: 'mage', name: 'THE MAGE', stand: 'mstand' },
];

const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = BG;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.appendChild(cv);
const cols = VIEWS.length * 2;
cv.width = PAD + cols * (PW * S + PAD);
cv.height = PAD + HEADING + WHO.length * (NAME + PH * S + LABEL + PAD);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.fillStyle = BG;
g.fillRect(0, 0, cv.width, cv.height);
g.fillStyle = '#ffd866';
g.font = '700 20px system-ui, sans-serif';
g.textBaseline = 'middle';
g.textAlign = 'left';
g.fillText('The three heroes: today, and painted over the skeleton', PAD + 2, PAD + 16);
g.fillStyle = '#cfc8ff';
g.font = '600 15px system-ui, sans-serif';
g.fillText(`Left of each pair: in the game today. Right: new. NOT IN THE GAME.`, PAD + 2, PAD + 44);

/** A piece of the dungeon's floor under a figure whose place on the floor is at (fx, fy), and the pool of light the game puts behind a hero. */
function floor(x: number, y: number, fx: number, fy: number): void {
  g.save();
  g.beginPath();
  g.rect(x, y, PW * S, PH * S);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, PW * S, PH * S);
  g.imageSmoothingEnabled = false;
  // (a tile is a diamond 64 picture pixels across and 32 down; its picture is anchored at its top corner)
  for (let ty = -3; ty <= 3; ty++) {
    for (let tx = -3; tx <= 3; tx++) {
      if (Math.abs(tx) + Math.abs(ty) > 4) continue;
      const sp = ground.floor(tx + 20, ty + 20);
      const px = fx + (tx - ty) * 32 * S;
      const py = fy + (tx + ty) * 16 * S - 16 * S;
      g.drawImage(sp.img, px - sp.ax * 2 * S, py - sp.ay * 2 * S, sp.img.width * S, sp.img.height * S);
    }
  }
  // (the dark of a dungeon, thinner where the hero's own light falls: as the game lays it)
  const dark = g.createRadialGradient(fx, fy - 20 * S, 10 * S, fx, fy - 20 * S, 110 * S);
  dark.addColorStop(0, 'rgba(6,4,14,0)');
  dark.addColorStop(0.6, 'rgba(6,4,14,0.35)');
  dark.addColorStop(1, 'rgba(6,4,14,0.8)');
  g.fillStyle = dark;
  g.fillRect(x, y, PW * S, PH * S);
  // the pool of light behind a hero (kit.ts, AURA), and the shadow at their feet
  const pool = g.createRadialGradient(fx - 4 * S, fy - 30 * S, 0, fx - 4 * S, fy - 30 * S, 46 * S);
  pool.addColorStop(0, 'rgba(40,220,240,0.2)');
  pool.addColorStop(0.45, 'rgba(40,220,240,0.09)');
  pool.addColorStop(1, 'rgba(40,220,240,0)');
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = pool;
  g.fillRect(x, y, PW * S, PH * S);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath();
  g.ellipse(fx, fy, 0.28 * 22.6 * 2 * S, 0.28 * 11.3 * 2 * S, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** What flies from a figure (a scarf, a feather), as it hangs when the figure has stood a couple of seconds. */
function settled(roots: ReadonlyArray<TailRoot> | undefined, ax: number, ay: number): Tails {
  const t = new Tails(HERO_TAILS);
  for (let k = 0; k < 80; k++) t.step(1 / 30, roots, ax, ay, 1, 0, 0);
  return t;
}

function label(x: number, y: number, text: string): void {
  g.fillStyle = '#cfc8ff';
  g.font = '600 15px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(text, x + 6, y + LABEL / 2 + 1);
}

/** Today's hero: a picture of the game's own, its anchor on the pane's floor point. */
function today(x: number, y: number, sp: Sprite): void {
  const fx = x + HALF * S;
  const fy = y + UP * S;
  floor(x, y, fx, fy);
  const tails = settled(sp.tails, sp.ax, sp.ay);
  g.save();
  g.beginPath();
  g.rect(x, y, PW * S, PH * S);
  g.clip();
  g.imageSmoothingEnabled = false;
  tails.draw(g, fx, fy, false, S * 2);
  g.drawImage(sp.img, fx - sp.ax * 2 * S, fy - sp.ay * 2 * S, sp.img.width * S, sp.img.height * S);
  tails.draw(g, fx, fy, true, S * 2);
  g.restore();
}

/** The new one: painted over the bones as they stand. */
function fresh(x: number, y: number, f: Painted): void {
  const fx = x + HALF * S;
  const fy = y + UP * S;
  floor(x, y, fx, fy);
  const tails = settled((f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 })), CANVAS3.ax / 2, CANVAS3.ay / 2);
  g.save();
  g.beginPath();
  g.rect(x, y, PW * S, PH * S);
  g.clip();
  g.imageSmoothingEnabled = false;
  tails.draw(g, fx, fy, false, S * 2);
  g.drawImage(f.px.toCanvas(), fx - CANVAS3.ax * S, fy - CANVAS3.ay * S, CANVAS3.w * S, CANVAS3.h * S);
  tails.draw(g, fx, fy, true, S * 2);
  g.restore();
}

WHO.forEach(({ cls, name, stand }, r) => {
  const top = PAD + HEADING + r * (NAME + PH * S + LABEL + PAD);
  g.fillStyle = '#ffd866';
  g.font = '700 17px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(name, PAD + 2, top + NAME / 2);
  const art = heroes.of(cls, { twoHanded: true });
  const move = MOVES3[stand];
  const build = move.build;
  const q = bonesAt(move.motion.keys, move.rest, 0);
  const s = solve(build, q);
  VIEWS.forEach((view, v) => {
    const x0 = PAD + v * 2 * (PW * S + PAD);
    const x1 = x0 + PW * S + PAD;
    const y = top + NAME;
    today(x0, y, (view === 'front' ? art.front : art.back).idle[0]);
    const around = { prev: s, wind: 0 };
    fresh(x1, y, cls === 'warrior' ? paintKnight3(s, q, view, { build, twoHanded: true }, around) : cls === 'ranger' ? paintRanger3(s, q, view, { build }, around) : paintMage3(s, q, view, { build }, around));
    const way = view === 'front' ? 'facing you' : 'facing away';
    label(x0, y + PH * S, `Today, ${way}`);
    label(x1, y + PH * S, `New, ${way}`);
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
