// THE KING'S FILM, made outside a browser: every move of his from in front and from behind, at the scale of his hall
// with the knight in it, captioned; each strike again at half speed, close. Frames are piped to ffmpeg. Nothing of the
// game imports it.
//   npx tsx tools/king_film.ts <out.mp4> [only: a segment's number, to look at one]
//   (frames the film takes, as stills: npx tsx tools/king_film.ts <out dir> stills)
import { Px } from '../src/engine/px';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { HUSH, HUSH_BESIDE, KG_CLIMB, KG_CROWN, KG_CURTAINS, KG_DECREE, KG_DIES, KG_PACE, KG_REEL, KG_STAND_LONG, KG_SWEEP, KG_WALK, KING, KING_ALONE } from '../src/art/king_moves';
import { BIRD, BIRD_CANVAS, CROWN_FX, FX_CANVAS, KG_REACH, SWEEP_FX, birdPainted, crownPainted, curtainsPainted, decreePainted, sweepPainted } from '../src/art/king_fx';
import type { DecreeAt } from '../src/art/king_fx';
import { TILE3 } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import type { GameView } from '../src/art/skin';
import { arenaOut, cut, floorAt, frameOf, hallFloor, hangingsAt, knight, lay, laidOf, onScene, scaled, shadow } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 960;
const H = 540;
const CX = 480;
const CY = 300;
const FPS = 30;
const FLOOR = hallFloor(W, H, CX, CY, true);
const inHall = (X: number, Y: number): boolean => {
  const [x, y] = floorAt(X + 0.5, Y + 0.5, CX, CY);
  return arenaOut(x, y) <= 1.0;
};

/** A pass of the film: the King seen from in front (facing down the picture and right, the knight before him) or from behind (facing up it and right). */
interface Pass {
  view: GameView;
  /** Where he stands (tiles, the hall's own ways), and the way he faces there. */
  at: readonly [number, number];
  /** His own lengths (forward, to his left) as the hall's. */
  hall: (x: number, y: number) => [number, number];
  knightAt: readonly [number, number];
  knightView: GameView;
  knightFlip: boolean;
}
const FRONT: Pass = { view: 'front', at: [-3.2, -2.2], hall: (x, y) => [x, y], knightAt: [3.6, 2.4], knightView: 'back', knightFlip: true };
const BACK: Pass = { view: 'back', at: [1.6, -3.4], hall: (x, y) => [-y, x], knightAt: [1.6, 4.4], knightView: 'front', knightFlip: true };
/** A point of his own (own lengths), from where he stands now, on the scene. */
const sceneOf = (p: Pass, from: readonly [number, number], own: readonly [number, number, number]): [number, number] => {
  const [hx, hy] = p.hall(own[0], own[1]);
  return onScene([from[0] * TILE3 + hx, from[1] * TILE3 + hy, own[2]], CX, CY);
};
/** The hall's hangings as his own (tiles from him): where the faces come out of. */
function hangingsOwn(p: Pass, from: readonly [number, number]): [number, number][] {
  const all = hangingsAt(CX, CY).map(([, , fx, fy]) => [fx / TILE3 - from[0], fy / TILE3 - from[1]] as [number, number]);
  // (three of them: the far left, the middle, the far right)
  const pick = [all[0], all[Math.floor(all.length / 2)], all[all.length - 1]];
  return pick.map(([x, y]) => (p.view === 'front' ? [x, y] : [y, -x]));
}

const KCACHE = new Map<string, Laid>();
function kingFrame(mob: Mob, move: string, t: number, view: GameView): Laid {
  const key = `${mob.id}:${move}:${t.toFixed(4)}:${view}`;
  let f = KCACHE.get(key);
  if (!f) {
    f = frameOf(mob, move, t, view);
    if (KCACHE.size > 400) KCACHE.clear();
    KCACHE.set(key, f);
  }
  return f;
}

/** One frame of the hall: the floor, what lies on it, the figures nearest last, what flies over them. */
interface Shot {
  pass: Pass;
  mob: Mob;
  move: string;
  t: number;
  /** Where he is now (tiles), if the game has carried him from where he stood. */
  at?: readonly [number, number];
  under?: Laid[];
  behind?: Laid[];
  before?: Laid[];
  over?: Laid[];
  hush?: { t: number; move: string } | null;
  knight?: boolean;
  bird?: { state: 'broken' | 'winding' | 'singing'; t: number; k: number } | null;
}
const KNIGHT_FPS = 6;
function shot(s: Shot, ft: number): Px {
  const px = new Px(W, H);
  px.d.set(FLOOR.d);
  const at = s.at ?? s.pass.at;
  const [kx, ky] = sceneOf(s.pass, at, [0, 0, 0]);
  for (const l of s.under ?? []) lay(px, l, kx, ky, 1, inHall);
  const figs: { y: number; draw: () => void }[] = [];
  figs.push({ y: ky, draw: () => {
    shadow(px, kx, ky, 24);
    lay(px, kingFrame(s.mob, s.move, s.t, s.pass.view), kx, ky);
  } });
  if (s.knight !== false) {
    const [nx, ny] = onScene([s.pass.knightAt[0] * TILE3, s.pass.knightAt[1] * TILE3, 0], CX, CY);
    figs.push({ y: ny, draw: () => {
      shadow(px, nx, ny, 9);
      lay(px, knight(s.pass.knightView, Math.floor(ft * KNIGHT_FPS)), nx, ny, 1, undefined, s.pass.knightFlip);
    } });
  }
  if (s.hush) {
    const [hx, hy] = sceneOf(s.pass, at, [HUSH_BESIDE[0], HUSH_BESIDE[1], 0]);
    const h = kingFrame(HUSH, s.hush.move, s.hush.t, s.pass.view);
    figs.push({ y: hy, draw: () => {
      shadow(px, hx, hy, 10);
      lay(px, h, hx, hy);
    } });
  }
  if (s.bird) {
    const [bx, by] = sceneOf(s.pass, at, [10, -26, 0]);
    figs.push({ y: by, draw: () => lay(px, laidOf(birdPainted(s.bird!.state, s.bird!.t, s.pass.view), BIRD_CANVAS.ax, BIRD_CANVAS.ay), bx, by) });
  }
  for (const l of s.behind ?? []) lay(px, l, kx, ky, 1, inHall);
  for (const f of figs.sort((a, b) => a.y - b.y)) f.draw();
  for (const l of s.before ?? []) lay(px, l, kx, ky, 1, inHall);
  for (const l of s.over ?? []) lay(px, l, kx, ky, 1);
  // (the songbird close, in a frame at the corner: it is small)
  if (s.bird && s.bird.k > 0) {
    const K = 4;
    const bw = BIRD_CANVAS.w * K;
    const bh = BIRD_CANVAS.h * K;
    const x0 = W - bw - 12;
    const y0 = H - bh - 12;
    const fl = hallFloor(BIRD_CANVAS.w, BIRD_CANVAS.h, BIRD_CANVAS.ax, BIRD_CANVAS.ay - 40, false);
    const box = scaled(fl, K);
    lay(box, laidOf(birdPainted(s.bird.state, s.bird.t, s.pass.view), 0, 0), 0, 0, K);
    for (let y = -2; y < bh + 2; y++) for (let x = -2; x < bw + 2; x++) {
      const inside = x >= 0 && y >= 0 && x < bw && y < bh;
      const X = x0 + x;
      const Y = y0 + y;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      if (!inside) px.set(X, Y, '#a08646');
      else px.d.set(box.d.subarray((y * bw + x) * 4, (y * bw + x) * 4 + 4), (Y * W + X) * 4);
    }
  }
  return px;
}
const fxL = (p: { px: Px }): Laid => laidOf(p.px, FX_CANVAS.ax, FX_CANVAS.ay);

// =============================================================================================
// THE FILM: its parts, each with its caption

interface Part {
  long: number;
  title: string;
  line: string;
  /** The frame `t` seconds into the part. */
  frame: (t: number) => Px;
}
/** A strike again, at half speed, close: the King and what is about him, twice as big. */
function close(px: Px, p: Pass, at: readonly [number, number], lift = 70): Px {
  const [kx, ky] = sceneOf(p, at, [0, 0, 0]);
  const w = W / 2;
  const h = H / 2;
  const x = Math.round(Math.max(0, Math.min(W - w, kx - w / 2)));
  const y = Math.round(Math.max(0, Math.min(H - h, ky - lift - h / 2)));
  return scaled(cut(px, x, y, w, h), 2);
}
function partsOf(p: Pass, first: boolean): Part[] {
  const v = p.view === 'front' ? 'FROM IN FRONT' : 'FROM BEHIND';
  const own = (x: number, y: number): [number, number] => {
    const [hx, hy] = p.hall(x * TILE3, y * TILE3);
    return [hx / TILE3, hy / TILE3];
  };
  const toward = ((): [number, number] => {
    const d = [p.knightAt[0] - p.at[0], p.knightAt[1] - p.at[1]];
    const l = Math.hypot(d[0], d[1]);
    return [d[0] / l, d[1] / l];
  })();
  // (his own way forward, in the hall: the game carries him that way)
  const fwd = ((): [number, number] => {
    const [hx, hy] = p.hall(1, 0);
    return [hx, hy];
  })();
  void own;
  void toward;
  const carried = (d: number): [number, number] => [p.at[0] + fwd[0] * d, p.at[1] + fwd[1] * d];
  const curtFrom = hangingsOwn(p, p.at);
  const atYou: [number, number] = p.view === 'front' ? [p.knightAt[0] - p.at[0], p.knightAt[1] - p.at[1]] : [p.knightAt[1] - p.at[1], -(p.knightAt[0] - p.at[0])];
  const decree: DecreeAt = { from: -6, to: 12, half: 11 };
  const parts: Part[] = [];
  if (first) parts.push({ long: 2.4, title: 'THE KING', line: 'Floor 19, the Throne Hall. His pick: “Slow and heavy, huge reach (Recommended)”', frame: (t) => shot({ pass: p, mob: KING, move: 'stand', t: t % KG_STAND_LONG }, t) });
  parts.push({ long: KG_STAND_LONG, title: `STANDING · ${v}`, line: 'Bowed under the Hush, heaving for breath; its fog curls up through his crown', frame: (t) => shot({ pass: p, mob: KING, move: 'stand', t: t % KG_STAND_LONG }, t) });
  const walkLong = first ? 3.6 : 1.8;
  const period = KG_WALK.frames / KG_WALK.fps;
  parts.push({ long: walkLong, title: `HIS WALK · ${v}`, line: `Slow and heavy, ${KG_PACE} tile a second; the great sword drags on the stones`, frame: (t) => shot({ pass: p, mob: KING, move: 'walk', t: t % period, at: carried(-walkLong * KG_PACE + t * KG_PACE) }, t) });
  // THE SWEEP and its wave
  parts.push({
    long: KG_SWEEP.long + 0.3, title: `THE SWEEP · ${v}`, line: 'Hauled round behind him, held; in two frames round from behind his right to his left; the wave rolls 10 tiles out',
    frame: (t) => shot({ pass: p, mob: KING, move: 'attack', t: Math.min(t, KG_SWEEP.long), under: t >= KG_SWEEP.hit ? [fxL(sweepPainted(t - KG_SWEEP.hit, p.view))] : [] }, t),
  });
  if (first) {
    parts.push({
      long: 2.0, title: 'THE SWEEP · HALF SPEED', line: 'The wind-up held, the strike two frames and smeared, the wind-down big',
      frame: (t) => {
        const tt = KG_SWEEP.warn[1] - 0.25 + t / 2;
        return close(shot({ pass: p, mob: KING, move: 'attack', t: tt, under: tt >= KG_SWEEP.hit ? [fxL(sweepPainted(tt - KG_SWEEP.hit, p.view))] : [], knight: false }, t), p, p.at);
      },
    });
  }
  // THE DECREE and his knights' march
  const march = first ? 6.5 : 4.5;
  parts.push({
    long: KG_DECREE.long + march - 1.2, title: `THE DECREE · ${v}`, line: 'The sword raised, held, driven into the stones: his knights of fog march across the hall in lines; slip through the gaps',
    frame: (t) => {
      const since = t - KG_DECREE.hit;
      const move = t < KG_DECREE.long ? 'decree' : 'stand';
      const tt = t < KG_DECREE.long ? t : (t - KG_DECREE.long) % KG_STAND_LONG;
      return shot({ pass: p, mob: KING, move, t: tt, behind: since >= 0 ? [fxL(decreePainted(since, p.view, decree, 'behind'))] : [], before: since >= 0 ? [fxL(decreePainted(since, p.view, decree, 'before'))] : [] }, t);
    },
  });
  if (first) {
    parts.push({
      long: 1.6, title: 'THE DECREE · HALF SPEED', line: 'Held high, then driven down in two frames',
      frame: (t) => close(shot({ pass: p, mob: KING, move: 'decree', t: KG_DECREE.warn[1] - 0.2 + t / 2, knight: false }, t), p, p.at, 90),
    });
  }
  // THE CROWN: the leap (the game carrying him), the slam, the ring
  const [a0, a1] = KG_CROWN.air;
  const leapAt = (t: number): [number, number] => carried(KG_CROWN.carry * Math.max(0, Math.min(1, (t - a0) / (a1 + 1 / 15 - a0))) - KG_CROWN.carry * 0.5);
  parts.push({
    long: KG_CROWN.long + 0.4, title: `THE CROWN · ${v}`, line: `A deep crouch, held; a leap of ${KG_CROWN.carry} tiles; the slam lands in two frames and the shockwave rings out across the hall`,
    frame: (t) => {
      const tt = Math.min(t, KG_CROWN.long);
      return shot({ pass: p, mob: KING, move: 'crown', t: tt, at: leapAt(tt), under: tt >= KG_CROWN.hit ? [fxL(crownPainted(t - KG_CROWN.hit, p.view))] : [] }, t);
    },
  });
  if (first) {
    parts.push({
      long: 1.6, title: 'THE CROWN · HALF SPEED', line: 'Down out of the air and slammed in two frames; the landing sinks',
      frame: (t) => {
        const tt = KG_CROWN.hit - 0.35 + t / 2;
        const at = leapAt(tt);
        return close(shot({ pass: p, mob: KING, move: 'crown', t: tt, at, under: tt >= KG_CROWN.hit ? [fxL(crownPainted(tt - KG_CROWN.hit, p.view))] : [], knight: false }, t), p, at, 80);
      },
    });
  }
  // THE CURTAINS
  parts.push({
    long: KG_CURTAINS.long + 0.6, title: `THE CURTAINS · ${v}`, line: 'He reaches to the hangings; the faces of his deeds look out; flung at you, they stream across the hall',
    frame: (t) => {
      const tt = Math.min(t, KG_CURTAINS.long);
      const since = t - KG_CURTAINS.hit;
      return shot({ pass: p, mob: KING, move: 'curtains', t: tt, over: since >= -0.6 ? [fxL(curtainsPainted(since, p.view, atYou, curtFrom))] : [] }, t);
    },
  });
  if (first) {
    parts.push({
      long: 1.4, title: 'THE CURTAINS · HALF SPEED', line: 'His hand flung out in two frames',
      frame: (t) => close(shot({ pass: p, mob: KING, move: 'curtains', t: KG_CURTAINS.warn[1] - 0.15 + t / 2, knight: false }, t), p, p.at),
    });
  }
  // STRUCK
  parts.push({ long: 1.0, title: `STRUCK · ${v}`, line: 'He barely gives', frame: (t) => shot({ pass: p, mob: KING, move: t < KG_REEL ? 'reel' : 'stand', t: t < KG_REEL ? t : 0 }, t) });
  // HIS LAST PHASE: the Hush climbs off him and stands at his side
  parts.push({
    long: KG_CLIMB.long + 1.4, title: `THE HUSH CLIMBS OFF · ${v}`, line: 'His last phase: it lets go, rises off his back and comes down at his side to fight beside him',
    frame: (t) => (t < KG_CLIMB.long ? shot({ pass: p, mob: KING, move: 'climbOff', t }, t) : shot({ pass: p, mob: KING_ALONE, move: 'stand', t: (t - KG_CLIMB.long) % KG_STAND_LONG, hush: { move: 'stand', t: (t - KG_CLIMB.long) % 3.6 } }, t)),
  });
  // HIS DEATH, and the songbird
  const birdFrom = KG_DIES.long + 0.2;
  const deathLong = first ? KG_DIES.long + 0.2 + BIRD.wind + 2.4 : KG_DIES.long + 0.6;
  parts.push({
    long: deathLong, title: `HIS DEATH · ${v}`, line: first ? 'He sinks to his knees and down; the Hush unwinds into nothing; his clockwork songbird winds itself up and sings' : 'He sinks to his knees and down; the Hush unwinds into nothing',
    frame: (t) => {
      const tt = Math.min(t, KG_DIES.long);
      const b = t < birdFrom ? { state: 'broken' as const, t: 0 } : t < birdFrom + BIRD.wind ? { state: 'winding' as const, t: t - birdFrom } : { state: 'singing' as const, t: (t - birdFrom - BIRD.wind) % BIRD.song };
      return shot({ pass: p, mob: KING_ALONE, move: 'dying', t: tt, hush: t < 3.0 ? { move: 'dying', t: Math.min(t, 3.0) } : null, bird: first ? { ...b, k: t > KG_DIES.long - 0.6 ? 1 : 0 } : { state: 'broken', t: 0, k: 0 } }, t);
    },
  });
  void SWEEP_FX;
  void CROWN_FX;
  void KG_REACH;
  return parts;
}

const [out = 'film.mp4', only = ''] = process.argv.slice(2);
const parts = [...partsOf(FRONT, true), ...partsOf(BACK, false)];
let total = 0;
for (const p of parts) total += p.long;
console.log(parts.length, 'parts,', total.toFixed(1), 's');
if (only === 'stills') {
  mkdirSync(out, { recursive: true });
  parts.forEach((p, i) => {
    for (const k of [0.25, 0.5, 0.75]) writeFileSync(`${out}/p${String(i).padStart(2, '0')}_${k}.png`, png(p.frame(p.long * k)));
  });
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = `${out}.captions`;
  mkdirSync(dir, { recursive: true });
  const filters: string[] = ['scale=1920:1080:flags=neighbor'];
  let at = 0;
  parts.forEach((p, i) => {
    if (only && String(i) !== only) return;
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = only ? '' : `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=28:y=24:fontsize=40:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.6:boxborderw=10${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=28:y=1080-64:fontsize=28:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.6:boxborderw=10${en}`);
    at += p.long;
  });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(W * H * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of parts.entries()) {
      if (only && String(i) !== only) continue;
      const frames = Math.round(p.long * FPS);
      for (let f = 0; f < frames; f++) {
        const px = p.frame(f / FPS);
        for (let k = 0, j = 0; k < W * H * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise((r) => ff.stdin.once('drain', r));
        n++;
      }
      console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
}
void HUSH;
