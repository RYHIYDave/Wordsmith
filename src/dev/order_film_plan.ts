// THE SILENT ORDER'S FILM (dev; nothing of the game imports it): every move of theirs, from in front (left) and from
// behind (right), on a ballroom floor of tiles at twice the game's size, the knight in it for size; each blow and the
// rush again at half speed. Drawn frame by frame for tools/order_film.mjs.
import type { Mob } from '../art/new_mobs3';
import { TILE3, skeletonAt } from '../art/new_mobs3';
import type { OrderWho } from '../art/silent_order';
import { KNIFE_FAN, fanOf } from '../art/silent_order';
import { KNIFE_CANVAS, WAVE_CANVAS, knifeAt, knifePainted, wavePainted } from '../art/silent_order_fx';
import { KNIFE_FLIGHT, ORDER_DIES, ORDER_PACE, PALM, RUSH, THROW, orderOf, rushCarry } from '../art/silent_order_moves';
import { toSprite } from '../art/kit';
import type { GameView } from '../art/skin';
import type { Sprite } from '../engine/px';
import { draw, floor, hero, shadow, spOf } from './order_kit';

const GRID = Math.sqrt(2 / 3);
const FPS = 30;
const FILM_K = 2;

/** A shot: what is shown (`who`, `move`), for how long (seconds of film), at what speed, from where in the move; where they start and where the knight stands (tiles along their way); its caption. */
interface Shot {
  who: OrderWho;
  move: string;
  long: number;
  speed?: number;
  from?: number;
  /** Their start and the knight, tiles along the way they face. */
  at?: number;
  knight?: number;
  caption: string;
  /** A move that goes round (stand, run): its own clock. */
  loop?: number;
}
function plan(who: OrderWho | 'all'): Shot[] {
  const out: Shot[] = [];
  const set = (w: OrderWho, full: boolean): void => {
    const name = w === 'guest' ? 'THE GUEST (floor 17)' : w === 'armed' ? 'THE ARMED LAST (floor 19)' : 'THE MASKS (floor 20)';
    out.push({ who: w, move: 'stand', long: 2.2, at: 0, knight: 4, caption: `${name}: standing, utterly still`, loop: 3.2 });
    out.push({ who: w, move: 'rush', long: 1.4, at: -2.4, knight: 3.6, caption: `${name}: THE RUSH, still, then sudden: ${RUSH.carry} tiles in a fifth of a second` });
    if (full) out.push({ who: w, move: 'rush', long: 1.4, speed: 0.5, from: 0.12, at: -2.4, knight: 3.6, caption: 'The rush at half speed' });
    out.push({ who: w, move: 'walk', long: 1.6, at: -3.5, knight: 6.5, caption: `${name}: the run, ${ORDER_PACE} tiles a second (the knight walks 2.5)`, loop: 10 / 30 });
    out.push({ who: w, move: 'attack', long: 2.5, at: -2.5, knight: 1.5, caption: `${name}: THE HUSHING PALM, the grey wave ${5.5} tiles out, 100 degrees wide` });
    if (full) out.push({ who: w, move: 'attack', long: 1.8, speed: 0.5, from: 0.55, at: -2.5, knight: 1.5, caption: 'The palm at half speed: held, then two frames' });
    out.push({ who: w, move: 'knife', long: 2.4, at: -4, knight: 4.5, caption: w === 'armed' ? `${name}: A FAN OF THREE CURVED KNIVES, ${KNIFE_FLIGHT.reach} tiles at ${KNIFE_FLIGHT.speed} tiles a second` : `${name}: THE CURVED KNIFE, thrown ${KNIFE_FLIGHT.reach} tiles at ${KNIFE_FLIGHT.speed} tiles a second` });
    if (w === 'armed') out.push({ who: w, move: 'knife', long: 1.8, speed: 0.5, from: 0.55, at: -4, knight: 4.5, caption: 'The fan of three at half speed: held, then two frames' });
    if (full) out.push({ who: w, move: 'knife', long: 1.8, speed: 0.5, from: 0.55, at: -4, knight: 4.5, caption: 'The throw at half speed: held, then two frames' });
    out.push({ who: w, move: 'reel', long: 0.9, at: 0, knight: 1.6, caption: `${name}: struck`, loop: 0.45 });
    out.push({ who: w, move: 'dying', long: ORDER_DIES.long + 0.8, at: 0, knight: 2.2, caption: `${name}: the mask cracks in two, ${w === 'mask' ? 'the fog scatters' : 'the cloak falls empty'}` });
  };
  if (who === 'all') {
    set('guest', true);
    set('armed', false);
    set('mask', false);
  } else set(who, true);
  return out;
}

const KNIGHT_FPS = 10;
const fxCache = new Map<string, Sprite>();
function fxSprite(key: string, make: () => Sprite): Sprite {
  let s = fxCache.get(key);
  if (!s) {
    s = make();
    fxCache.set(key, s);
    if (fxCache.size > 300) fxCache.delete(fxCache.keys().next().value as string);
  }
  return s;
}

/** A PANEL of the arena, `panelW` by `panelH` at `K` times the game's size: a shot at a moment, from in front or behind. */
function panelPainter(panelW: number, panelH: number, K: number): { sub: HTMLCanvasElement; paint: (shot: Shot, s: number, view: GameView) => void } {
  const sub = document.createElement('canvas');
  sub.width = panelW;
  sub.height = panelH;
  const sg = sub.getContext('2d') as CanvasRenderingContext2D;
  sg.imageSmoothingEnabled = false;
  const paintPanel = (shot: Shot, s: number, view: GameView): void => {
    const mob: Mob = orderOf(shot.who);
    const speed = shot.speed ?? 1;
    const raw = (shot.from ?? 0) + s * speed;
    const long = shot.move === 'stand' || shot.move === 'walk' || shot.move === 'reel' ? Infinity : shot.move === 'dying' ? mob.dieTime : shot.move === 'attack' ? PALM.long : shot.move === 'knife' ? THROW.long : RUSH.long;
    // (the move's own moment: a loop goes round; a move played once is held at its end)
    const t = shot.loop ? raw % shot.loop : Math.min(raw, long);
    // where they are along their way (the figure's own lengths): their start, the game's carry in the rush, their pace in the run
    let x = (shot.at ?? 0) * TILE3;
    if (shot.move === 'rush') x += rushCarry(Math.min(t, RUSH.long));
    if (shot.move === 'walk') x += ORDER_PACE * TILE3 * raw;
    const kx = (shot.knight ?? 4) * TILE3;
    // the panel's middle: half way between them and the knight, a little toward the knight
    const midX = shot.move === 'walk' ? ((shot.at ?? 0) * TILE3 + kx) / 2 : (x + kx) / 2;
    const proj = (wx: number, wy: number, wz = 0): [number, number] => (view === 'front' ? [GRID * (wx + wy), GRID * 0.5 * (wx - wy) - wz] : [GRID * (wx - wy), GRID * 0.5 * (-wx - wy) - wz]);
    const [mx, my] = proj(midX, 0);
    const ox = panelW / 2 - mx * K;
    const oy = panelH * (view === 'front' ? 0.56 : 0.62) - my * K;
    floor(sg, panelW, panelH, ox, oy, K, view);
    const at = (wx: number, wy: number, wz = 0): [number, number] => {
      const [px, py] = proj(wx, wy, wz);
      return [ox + px * K, oy + py * K];
    };
    // what is on the floor first: the grey wave
    if (shot.move === 'attack' && t >= PALM.hit) {
      const wt = raw - PALM.hit;
      const sp = fxSprite(`wave:${view}:${wt.toFixed(3)}`, () => toSprite(wavePainted(wt, view), null, WAVE_CANVAS.ax, WAVE_CANVAS.ay));
      const [wx, wy] = at(x, 0);
      draw(sg, sp, wx, wy, K);
    }
    // then the figures, the further first
    const items: { y: number; paint: () => void }[] = [];
    const [fx, fy] = at(x, 0);
    items.push({
      y: fy,
      paint: () => {
        const sp = spOf(mob, shot.move, t, view);
        if (shot.move !== 'dying' || t < ORDER_DIES.empty + 0.3) shadow(sg, fx, fy, shot.move === 'rush' && t > RUSH.air[0] && t < RUSH.air[1] ? 9 : 11, K);
        draw(sg, sp, fx, fy, K);
      },
    });
    const [kxs, kys] = at(kx, 0);
    items.push({
      y: kys,
      paint: () => {
        const set = view === 'front' ? hero.back : hero.front;
        const fr = set.idle[Math.floor(raw * KNIGHT_FPS) % set.idle.length];
        shadow(sg, kxs, kys, 11, K);
        draw(sg, fr, kxs, kys, K, true);
      },
    });
    // the knife in flight (the armed last's fan of three)
    if (shot.move === 'knife' && raw >= THROW.hit) for (const way of fanOf(shot.who)) {
      const kt = raw - THROW.hit;
      const hand = skeletonAt(mob, 'knife', THROW.hit).handR;
      const k = knifeAt(kt, hand[2]);
      const h = (way * Math.PI) / 180;
      const [qx, qy] = at(x + hand[0] + Math.cos(h) * k.x * TILE3, hand[1] + Math.sin(h) * k.x * TILE3);
      items.push({
        y: qy + (k.flying ? 0 : -1),
        paint: () => {
          const sp = fxSprite(`knife:${view}:${kt.toFixed(3)}:${hand[2].toFixed(2)}:${way}`, () => toSprite(knifePainted(kt, view, hand[2], way), null, KNIFE_CANVAS.ax, KNIFE_CANVAS.ay));
          // (its shadow on the floor under it)
          sg.save();
          sg.fillStyle = 'rgba(4,3,8,0.45)';
          sg.beginPath();
          sg.ellipse(qx, qy, 5 * K, 2.5 * K, 0, 0, Math.PI * 2);
          sg.fill();
          sg.restore();
          draw(sg, sp, qx, qy, K);
        },
      });
    }
    items.sort((a, b) => a.y - b.y).forEach((it) => it.paint());
    // the panel's label
    sg.font = 'bold 20px sans-serif';
    sg.fillStyle = '#bdb8c8';
    sg.fillText(view === 'front' ? 'from in front' : 'from behind', 14, panelH - 16);
    if (shot.speed && shot.speed < 1) {
      sg.fillStyle = '#e8d070';
      sg.fillText('HALF SPEED', panelW - 150, panelH - 16);
    }
  };
  return { sub, paint: paintPanel };
}

/** THE FILM: how many frames, and a painter of each. */
export function filmFrames(g: CanvasRenderingContext2D, W: number, H: number, who: OrderWho | 'all'): { n: number; draw: (k: number) => void } {
  const shots = plan(who);
  const frames: { shot: Shot; s: number }[] = [];
  for (const shot of shots) {
    const n = Math.round(shot.long * FPS);
    for (let i = 0; i < n; i++) frames.push({ shot, s: i / FPS });
  }
  // (the two views one over the other: for a phone held upright)
  const panelW = W;
  const top = 50;
  const panelH = Math.floor((H - top) / 2);
  const { sub, paint: paintPanel } = panelPainter(panelW, panelH, FILM_K);
  g.imageSmoothingEnabled = false;
  const drawFrame = (k: number): void => {
    const { shot, s } = frames[Math.max(0, Math.min(frames.length - 1, k))];
    g.fillStyle = '#07060a';
    g.fillRect(0, 0, W, H);
    for (const [view, y0] of [['front', top], ['back', top + panelH]] as const) {
      paintPanel(shot, s, view);
      g.drawImage(sub, 0, y0);
    }
    g.fillStyle = '#2a2833';
    g.fillRect(0, top + panelH - 1, W, 2);
    g.font = 'bold 24px sans-serif';
    g.fillStyle = '#ece8f2';
    g.fillText(shot.caption, 16, 34);
  };
  return { n: frames.length, draw: drawFrame };
}

/**
 * THE FAN OF THREE (the armed last, his pick “A fan of three on 19 (Recommended)”), a picture: the three knives fanned in
 * the fist through the held warning and at the throw (three times as big), then flying out across the floor and lying
 * where they come down (at the game's size, the knight in it); from in front, and from behind.
 */
export function fanPicture(g: CanvasRenderingContext2D, W: number, H: number): void {
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#07060a';
  g.fillRect(0, 0, W, H);
  const mob = orderOf('armed');
  // the close row: held (0.6 s) and thrown (the blow), each from in front and from behind
  const rowH = 330;
  const top = 46;
  floor(g, W, rowH, W / 2, top + rowH / 2, 3, 'front');
  const cells: [number, GameView, string][] = [[0.6, 'front', 'held, from in front'], [0.6, 'back', 'held, from behind'], [THROW.hit, 'front', 'thrown, from in front'], [THROW.hit, 'back', 'thrown, from behind']];
  cells.forEach(([t, view, name], i) => {
    const x = (W / 4) * (i + 0.5);
    const y = top + rowH - 40;
    shadow(g, x, y, 12, 3);
    draw(g, spOf(mob, 'knife', t, view), x, y, 3);
    g.font = 'bold 17px sans-serif';
    g.fillStyle = '#d8d4e0';
    g.fillText(name, x - 70, top + rowH - 10);
  });
  // the arena rows: in flight, and lying
  const pw = Math.floor(W / 2);
  const ph = Math.floor((H - top - rowH) / 2);
  const P = panelPainter(pw, ph, 1);
  const shot: Shot = { who: 'armed', move: 'knife', long: 3, at: -4, knight: 4.6, caption: '' };
  const moments: [number, string][] = [[THROW.hit + 0.17, 'in flight'], [THROW.hit + 0.7, 'lying where they came down']];
  moments.forEach(([raw, name], c) => {
    (['front', 'back'] as const).forEach((view, r) => {
      P.paint(shot, raw, view);
      g.drawImage(P.sub, c * pw, top + rowH + r * ph);
      g.font = 'bold 17px sans-serif';
      g.fillStyle = '#e8e4ee';
      g.fillText(name, c * pw + 14, top + rowH + r * ph + 24);
    });
  });
  g.fillStyle = '#2a2833';
  g.fillRect(pw - 1, top + rowH, 2, H - top - rowH);
  g.fillRect(0, top + rowH + ph - 1, W, 2);
  g.font = 'bold 22px sans-serif';
  g.fillStyle = '#ece8f2';
  g.fillText(`The armed last's fan of three: ${KNIFE_FAN.spread} degrees apart, each ${KNIFE_FLIGHT.reach} tiles at ${KNIFE_FLIGHT.speed} tiles a second`, 14, 31);
}
