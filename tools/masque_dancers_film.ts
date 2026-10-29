// THE MASKED DANCERS' PICTURES AND FILM for the owner's phone (art/masque_dancers.ts, art/masque_dancers_moves.ts; behind
// DANCERS_ON, off: not in the game). Paints them in node, as the game would paint them, on a ballroom floor laid in tiles
// with the knight beside them for size; tools/masque_dancers_film.py then captions the frames and makes the film.
//   tsx tools/masque_dancers_film.ts sheet <out.png>     (standing, front and behind, beside the knight, three times as big)
//   tsx tools/masque_dancers_film.ts crowd <out.png>     (a crowd of them in the seven rooms' colours, at the game's size, twice as big)
//   tsx tools/masque_dancers_film.ts film <frames dir>   (every move, front and behind; and a whole ballroom at the chime: frames and captions.json)
import { Px } from '../src/engine/px';
import type { Light } from '../src/engine/px';
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
import { Canvas } from './masque_canvas';
import { DANCERS, DN_CHIME, DN_DIES, DN_PACE, DN_REEL, DN_SPIN, SPIN, SPIN_END, WALTZ_PACE, WHIRL_ROUND, chimeSplit, pairPainted } from '../src/art/masque_dancers_moves';
import type { RoomName } from '../src/art/masque_dancers';
import { TILE3, canvasOf, deathOfMob, paintMob, skeletonAt } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { makeHeroArt3 } from '../src/art/heroes3';
import { GRID } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
// @ts-ignore
import fs from 'node:fs';

type View = 'front' | 'back';
/** Which way one faces on the floor: the game's two pictures, either turned over (as the game turns them for one who faces left). */
interface Facing {
  view: View;
  flip: boolean;
}
const FRONT: Facing = { view: 'front', flip: false };
const BACK: Facing = { view: 'back', flip: false };
const [mode = 'sheet', out = '.'] = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);

// ---------------------------------------------------------------------------------------------
// THE FLOOR: polished stone in squares, a stand-in in the blue room's colours (the Masque's own floor is not drawn yet), its
// joints showing every tile; outside the ballroom (`inside`), dark

const FLOOR_A = rgba('#1b2136');
const FLOOR_B = rgba('#20283e');
const JOINT = rgba('#2c3654');
function floor(c: Canvas, ox: number, oy: number, K: number, inside?: (X: number, Y: number) => boolean): void {
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const u = (x - ox) / (K * GRID);
      const v = (y - oy) / (K * GRID * 0.5);
      const X = (u + v) / 2 / TILE3;
      const Y = (u - v) / 2 / TILE3;
      const i = (y * c.w + x) * 4;
      if (inside && !inside(X, Y)) {
        c.d[i] = 8;
        c.d[i + 1] = 7;
        c.d[i + 2] = 14;
        continue;
      }
      const fx = X - Math.floor(X);
      const fy = Y - Math.floor(Y);
      const joint = fx < 0.025 * Math.max(1, 3 / K) || fy < 0.025 * Math.max(1, 3 / K);
      const col = joint ? JOINT : (Math.floor(X) + Math.floor(Y)) & 1 ? FLOOR_A : FLOOR_B;
      c.d[i] = col[0];
      c.d[i + 1] = col[1];
      c.d[i + 2] = col[2];
    }
  }
}
/** Where a point of the floor (the floor's own forward and left, as one facing the eye sees it) is on the screen from (ox, oy). */
const onFloor = (X: number, Y: number, ox: number, oy: number, K: number): [number, number] => [ox + K * GRID * (X + Y), oy + K * GRID * 0.5 * (X - Y)];
/** A point of a figure (its own forward and left), as it lies on the floor for the way it faces (picture pixels from its floor point). */
function seenAs(f: Facing, x: number, y: number): [number, number] {
  const [X, Y] = toWorld(f, x, y);
  return [GRID * (X + Y), GRID * 0.5 * (X - Y)];
}
/** A figure's own forward and left as the floor's (turned over, its left is the other way). */
function toWorld(f: Facing, x: number, y: number): [number, number] {
  if (f.view === 'front') return f.flip ? [-y, -x] : [x, y];
  return f.flip ? [-x, y] : [-y, x];
}

// ---------------------------------------------------------------------------------------------
// FIGURES ON IT

/** Its lights (the eyes burning through the warning), laid soft over it. */
function glows(c: Canvas, lights: ReadonlyArray<Light>, ax: number, ay: number, x: number, y: number, K: number, flip: boolean): void {
  for (const l of lights) {
    const [r, g, b] = rgba(l.color);
    const cx = flip ? x - (l.x - ax) * K : x + (l.x - ax) * K;
    const cy = y + (l.y - ay) * K;
    const R = l.r * K;
    for (let yy = Math.floor(cy - R); yy <= Math.ceil(cy + R); yy++) {
      for (let xx = Math.floor(cx - R); xx <= Math.ceil(cx + R); xx++) {
        const q = Math.hypot(xx - cx, yy - cy) / R;
        if (q < 1) c.dot(xx, yy, r, g, b, (l.a ?? 0.5) * (1 - q) * (1 - q));
      }
    }
  }
}
/** A moment as the game shows it: on the frames of the move (its stand at 10 a second, its whirl and waltz at 24, its death at 20, the rest at 30). */
function onFrames(mob: Mob, move: string, t: number): number {
  const fps = move === 'stand' ? mob.idleFps : move === 'walk' || move === 'waltz' ? mob.walkFps : move === 'dying' ? 20 : 30;
  return Math.floor(t * fps + 1e-6) / fps;
}
/** One of them, a move at a moment, its floor point at screen (x, y), `K` screen pixels to a picture pixel; its shadow under it. */
function dancer(c: Canvas, mob: Mob, move: string, t0: number, f: Facing, x: number, y: number, K: number): void {
  const t = onFrames(mob, move, t0);
  const can = canvasOf(mob);
  const s = skeletonAt(mob, move, Math.min(t, move === 'dying' ? mob.dieTime : 1e9));
  const [sx, sy] = seenAs(f, s.pelvis[0], s.pelvis[1]);
  c.shadow(x + sx * K, y + sy * K, 12 * K, 4.5 * K, 0.45);
  const p = move === 'dying' ? deathOfMob(mob, Math.min(1, t / mob.dieTime), f.view) : paintMob(mob, move, t, f.view);
  c.lay(p.px, can.ax, can.ay, x, y, K, f.flip);
  glows(c, p.lights, can.ax, can.ay, x, y, K, f.flip);
}
function pair(c: Canvas, lady: Mob, gent: Mob, move: 'waltz' | 'chime', t0: number, f: Facing, x: number, y: number, K: number): void {
  const t = onFrames(gent, move, t0);
  const can = canvasOf(gent);
  for (const m of [lady, gent]) {
    const s = skeletonAt(m, move, t);
    const [sx, sy] = seenAs(f, s.pelvis[0], s.pelvis[1]);
    c.shadow(x + sx * K, y + sy * K, 11 * K, 4 * K, 0.4);
  }
  const p = pairPainted(lady, gent, move, t, f.view);
  c.lay(p.px, can.ax, can.ay, x, y, K, f.flip);
  glows(c, p.lights, can.ax, can.ay, x, y, K, f.flip);
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
function knight(c: Canvas, f: Facing, t: number, x: number, y: number, K: number): void {
  const set = hero[f.view];
  const fps = set.idleFps ?? 2;
  const s = set.idle[Math.floor(t * fps) % set.idle.length];
  const d = s.density ?? 1;
  c.shadow(x, y, 12 * K, 4.5 * K, 0.45);
  c.lay(s.img as unknown as Px, s.ax * d, s.ay * d, x, y, K, f.flip);
}
const L = (r: RoomName): Mob => DANCERS.lady[r];
const G = (r: RoomName): Mob => DANCERS.gent[r];

// ---------------------------------------------------------------------------------------------

if (mode === 'sheet') {
  // THE SHEET: the lady and the gentleman, from in front and from behind, beside the knight, three times as big
  const K = 3;
  const c = new Canvas(1200, 600);
  floor(c, 600, 560, K);
  const y = 560;
  knight(c, FRONT, 0, 95, y, K);
  dancer(c, L('violet'), 'stand', 0, FRONT, 265, y, K);
  dancer(c, L('violet'), 'stand', 0, BACK, 445, y, K);
  dancer(c, G('blue'), 'stand', 0, FRONT, 640, y, K);
  dancer(c, G('blue'), 'stand', 0, BACK, 830, y, K);
  knight(c, BACK, 0, 1040, y, K);
  c.png(out);
} else if (mode === 'crowd') {
  // A CROWD AT THE GAME'S SIZE (twice as big, for the phone): pairs waltzing in the seven rooms' colours; one pair the clock
  // has struck for, frozen, masks on you; at the front, some whirling at the knight
  const K = 2;
  const c = new Canvas(1200, 640);
  floor(c, 600, 330, K);
  const pairs: [RoomName, RoomName, number, number, number][] = [['green', 'orange', 200, 200, 0.1], ['white', 'black', 450, 170, 0.45], ['blue', 'violet', 760, 210, 0.7], ['purple', 'white', 330, 330, 0.25], ['orange', 'blue', 1000, 290, 0.85]];
  for (const [l, g, x, y, t] of pairs) pair(c, L(l), G(g), 'waltz', t, FRONT, x, y, K);
  pair(c, L('violet'), G('green'), 'chime', 0.8, FRONT, 620, 360, K);
  knight(c, BACK, 0, 900, 560, K);
  const whirl: [Mob, number, number, number][] = [[L('blue'), 520, 470, 0.0], [G('purple'), 640, 520, 0.4], [L('orange'), 380, 520, 0.7], [G('white'), 730, 430, 0.2]];
  for (const [m, x, y, t] of whirl) dancer(c, m, 'walk', t, FRONT, x, y, K);
  c.png(out);
} else if (mode === 'film') {
  // THE FILM: each move a scene; each frame a picture of 1080 by 640 under its caption (tools/masque_dancers_film.py)
  const W = 1080;
  const H = 640;
  const FPS = 30;
  const caps: { title: string; sub: string; note: string }[] = [];
  let n = 0;
  const scene = (secs: number, title: string, sub: string, note: string, draw: (c: Canvas, t: number) => void): void => {
    const frames = Math.round(secs * FPS);
    for (let i = 0; i < frames; i++) {
      const c = new Canvas(W, H);
      draw(c, i / FPS);
      c.png(`${out}/f${String(n).padStart(4, '0')}.png`);
      caps.push({ title, sub, note });
      n++;
    }
  };
  const K = 3;
  const BACKL: Facing = { view: 'back', flip: true };
  // 1. POSED
  scene(2.4, 'Masked dancers, posed', 'from in front and from behind, the knight for size', 'They breathe, sway and turn the head; the grey Hush leaks from the mask', (c, t) => {
    floor(c, 540, 560, K);
    knight(c, FRONT, t, 105, 560, K);
    dancer(c, L('violet'), 'stand', t, FRONT, 290, 560, K);
    dancer(c, G('blue'), 'stand', t, FRONT, 480, 560, K);
    dancer(c, L('violet'), 'stand', t, BACK, 690, 560, K);
    dancer(c, G('blue'), 'stand', t, BACK, 880, 560, K);
  });
  // 2. THE WALTZ, drifting round the room as they turn
  for (const f of [FRONT, BACK]) {
    scene(3.0, 'The waltz', f.view === 'front' ? 'a pair, from in front' : 'a pair, from behind', `In hold, a turn a second, six steps to the turn, drifting ${WALTZ_PACE} tiles a second`, (c, t) => {
      floor(c, 540, 330, K);
      const [dx, dy] = seenAs(f, WALTZ_PACE * TILE3 * t, 0);
      if (f.view === 'front') {
        knight(c, BACKL, t, 930, 600, K);
        pair(c, L('green'), G('orange'), 'waltz', t, f, 290 + dx * K, 260 + dy * K, K);
      } else {
        knight(c, FRONT, t, 930, 170, K);
        pair(c, L('green'), G('orange'), 'waltz', t, f, 290 + dx * K, 590 + dy * K, K);
      }
    });
  }
  // 3. THE CHIME
  for (const f of [FRONT, BACK]) {
    scene(DN_CHIME.long + 0.9, 'The chime', f.view === 'front' ? 'the clock strikes, from in front' : 'the clock strikes, from behind', 'They stop dead, the masks snap round to you, held; then the hold breaks and they turn to you', (c, t) => {
      floor(c, 540, 330, K);
      const front = f.view === 'front';
      knight(c, front ? BACKL : { view: 'front', flip: true }, t, 900, front ? 610 : 140, K);
      // (the waltz a moment first, coming round to its first frame, then the chime)
      const w = 0.5;
      const spots: [RoomName, RoomName, number, number][] = front ? [['green', 'orange', 250, 250], ['violet', 'blue', 560, 330]] : [['green', 'orange', 250, 560], ['violet', 'blue', 560, 470]];
      for (const [l, g, x, y] of spots) {
        if (t < w) pair(c, L(l), G(g), 'waltz', 1 - w + t, f, x, y, K);
        else pair(c, L(l), G(g), 'chime', Math.min(DN_CHIME.long, t - w), f, x, y, K);
      }
    });
  }
  // 4. THE WHIRL, at you
  for (const f of [FRONT, BACK]) {
    scene(2.2, 'The whirl', f.view === 'front' ? 'gliding fast at you, from in front' : 'gliding fast at you, from behind', `${DN_PACE} tiles a second (the knight runs 4.6), three turns a second, the mask kept on you`, (c, t) => {
      floor(c, 540, 330, K);
      const [dx, dy] = seenAs(f, DN_PACE * TILE3 * t, 0);
      if (f.view === 'front') {
        knight(c, BACKL, t, 960, 600, K);
        dancer(c, L('violet'), 'walk', t, f, 40 + dx * K, 150 + dy * K, K);
        dancer(c, G('blue'), 'walk', t + 0.3, f, -60 + dx * K, 300 + dy * K, K);
      } else {
        knight(c, { view: 'front', flip: true }, t, 960, 110, K);
        dancer(c, L('violet'), 'walk', t, f, 60 + dx * K, 620 + dy * K, K);
        dancer(c, G('blue'), 'walk', t + 0.3, f, -40 + dx * K, 480 + dy * K, K);
      }
    });
  }
  // 5. THE WHIRLING SPIN, and its strike again at half speed
  const ring = (c: Canvas, f: Facing, x: number, y: number, a: number): void => {
    // (marked on the floor for this film only: the area it strikes, `SPIN.area` tiles round where they land)
    const R = SPIN.area * TILE3;
    for (let i = 0; i < 200; i++) {
      if (i % 4 > 1) continue;
      const q = (i / 200) * Math.PI * 2;
      const [px, py] = seenAs(f, SPIN.lunge * TILE3 + Math.cos(q) * R, Math.sin(q) * R);
      c.rect(x + px * K - 1, y + py * K - 1, 3, 3, '#c8c4d8', a);
    }
  };
  for (const [who, f] of [['lady', FRONT], ['gent', BACK], ['gent', FRONT], ['lady', BACK]] as const) {
    const mob = who === 'lady' ? L('violet') : G('blue');
    const front = f.view === 'front';
    const [x, y] = front ? [330, 230] : [330, 560];
    const draw = (c: Canvas, t: number, slow: boolean): void => {
      floor(c, 540, 330, K);
      knight(c, front ? BACKL : { view: 'front', flip: true }, 0, 860, front ? 600 : 150, K);
      if (t >= DN_SPIN.hit - 0.04 || slow) ring(c, f, x, y, slow ? 0.55 : Math.max(0, 0.55 * (1 - (t - DN_SPIN.hit) / 0.9)));
      dancer(c, mob, 'attack', t, f, x, y, K);
    };
    const name = who === 'lady' ? 'the lady' : 'the gentleman';
    scene(DN_SPIN.long + 0.3, 'The whirling spin', `${name}, ${front ? 'from in front' : 'from behind'}`, `Wound up, held, the eyes burning; struck in 2 frames, ${SPIN.lunge} tiles in, ${SPIN.area} tiles round (marked)`, (c, t) => draw(c, Math.min(t, DN_SPIN.long), false));
    const [s0] = DN_SPIN.strike;
    scene(1.2, 'Its strike at half speed', `${name}, ${front ? 'from in front' : 'from behind'}`, 'The 2-frame strike, smeared, and its wind-down', (c, t) => draw(c, s0 - 0.12 + t / 2, true));
  }
  // 6. STRUCK
  scene(DN_REEL * 4, 'Struck', 'from in front and from behind', 'Knocked back and half turned, the head thrown back', (c, t) => {
    floor(c, 540, 560, K);
    const u = t % DN_REEL;
    knight(c, FRONT, t, 105, 560, K);
    dancer(c, L('violet'), 'reel', u, FRONT, 290, 560, K);
    dancer(c, G('blue'), 'reel', u, FRONT, 480, 560, K);
    dancer(c, L('violet'), 'reel', u, BACK, 690, 560, K);
    dancer(c, G('blue'), 'reel', u, BACK, 880, 560, K);
  });
  // 7. THE MASK DROPS
  scene(DN_DIES.long + 0.9, 'The mask drops', 'their death, from in front and from behind', 'The Hush leaves them; they sink down in a last bow: people again, alive, still', (c, t) => {
    floor(c, 540, 540, K);
    const u = Math.min(DN_DIES.long, t);
    knight(c, FRONT, t, 95, 540, K);
    dancer(c, L('violet'), 'dying', u, FRONT, 270, 540, K);
    dancer(c, G('blue'), 'dying', u, FRONT, 470, 540, K);
    dancer(c, L('violet'), 'dying', u, BACK, 690, 540, K);
    dancer(c, G('blue'), 'dying', u, BACK, 890, 540, K);
  });
  // 8. THE WHOLE BALLROOM AT THE CHIME, at the game's own size: an arena of about 17 by 20 tiles, the knight in its middle;
  // the pairs waltz, the clock strikes, they stop dead and look at him, then all come at once
  {
    const K1 = 1;
    const ox = 540;
    const oy = 320;
    const inside = (X: number, Y: number): boolean => (X / 8.5) ** 2 + (Y / 10) ** 2 <= 1;
    // (each pair: where on the floor (tiles), which way it faces (toward the knight), its colours)
    const face = (fx: number, fy: number): Facing => (Math.abs(fx) >= Math.abs(fy) ? (fx > 0 ? FRONT : { view: 'back', flip: true }) : fy > 0 ? BACK : { view: 'front', flip: true });
    const PAIRS: [number, number, RoomName, RoomName][] = [
      [-6.0, 0.4, 'green', 'orange'], [-5.2, -3.0, 'white', 'purple'], [6.0, -0.6, 'blue', 'violet'], [5.0, 2.8, 'orange', 'black'],
      [0.5, -7.2, 'violet', 'green'], [-2.6, -6.4, 'purple', 'blue'], [-0.4, 7.4, 'black', 'white'], [2.8, 6.2, 'blue', 'orange'],
    ];
    const WALTZ = 1.0;
    const CHIME_AT = WALTZ;
    const GO = CHIME_AT + DN_CHIME.long;
    const LONG = GO + 3.4;
    type One = { mob: Mob; f: Facing; from: [number, number]; dir: [number, number]; stopAt: number; phase: number };
    const ones: One[] = [];
    PAIRS.forEach(([X, Y, l, g], k) => {
      const f = face(-X, -Y);
      const dir = toWorld(f, 1, 0);
      // (the pair drifts toward the knight as it waltzes, then stops dead where the chime catches it)
      const drift = (WALTZ_PACE * WALTZ) / 1;
      const at: [number, number] = [X + dir[0] * drift, Y + dir[1] * drift];
      for (const [mob, who] of [[L(l), 'lady'], [G(g), 'gent']] as const) {
        const sp = chimeSplit(who);
        const w = toWorld(f, sp[0] / TILE3, sp[1] / TILE3);
        const from: [number, number] = [at[0] + w[0], at[1] + w[1]];
        // (it whirls along its way until it is two and a half tiles from him, coming past him to one side if it must, then spins)
        const along = -(from[0] * dir[0] + from[1] * dir[1]);
        ones.push({ mob, f, from, dir, stopAt: Math.max(0, along - 2.4), phase: k * 0.13 });
      }
    });
    scene(LONG, 'At the chime, the whole ballroom', 'the game\'s own size: an arena of about 17 by 20 tiles', 'They waltz; the clock strikes; they stop dead and look at you; then they all come at once', (c, t) => {
      floor(c, ox, oy, K1, inside);
      const items: { y: number; draw: () => void }[] = [];
      const [kx, ky] = onFloor(0, 0, ox, oy, K1);
      items.push({ y: ky, draw: () => knight(c, BACK, t, kx, ky, K1) });
      if (t < GO) {
        PAIRS.forEach(([X, Y, l, g], k) => {
          const f = face(-X, -Y);
          const dir = toWorld(f, 1, 0);
          const d = WALTZ_PACE * Math.min(t, WALTZ);
          const [x, y] = onFloor((X + dir[0] * d) * TILE3, (Y + dir[1] * d) * TILE3, ox, oy, K1);
          const move = t < CHIME_AT ? 'waltz' : 'chime';
          const tt = t < CHIME_AT ? 1 - WALTZ + t : t - CHIME_AT;
          void k;
          items.push({ y, draw: () => pair(c, L(l), G(g), move, tt, f, x, y, K1) });
        });
      } else {
        for (const o of ones) {
          const u = t - GO;
          const go = DN_PACE * u;
          // (whirling until it is near; then, as the whirl comes round to face him, the spin)
          const reach = Math.ceil((o.stopAt / DN_PACE) * 3) / 3;
          const whirling = u < reach;
          const d = Math.min(go, DN_PACE * reach);
          const [x, y] = onFloor((o.from[0] + o.dir[0] * d) * TILE3, (o.from[1] + o.dir[1] * d) * TILE3, ox, oy, K1);
          items.push({ y, draw: () => (whirling ? dancer(c, o.mob, 'walk', u, o.f, x, y, K1) : dancer(c, o.mob, u - reach < DN_SPIN.long ? 'attack' : 'stand', u - reach < DN_SPIN.long ? u - reach : 0, o.f, x, y, K1)) });
        }
      }
      items.sort((a, b) => a.y - b.y);
      for (const it of items) it.draw();
    });
  }
  fs.writeFileSync(`${out}/captions.json`, JSON.stringify(caps));
  console.log(`${n} frames`);
  void WHIRL_ROUND;
  void SPIN_END;
}
