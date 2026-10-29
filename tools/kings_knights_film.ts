// FLOOR 19'S KING'S KNIGHTS: THE FILM for the owner's phone (a mock-up behind KNIGHTS_ON, off: not in the game). Every
// move of theirs, from in front and then from behind, at the scale of a boss arena with the knight in it for size, on
// cold stone flags (a tile 64 by 32 picture pixels, shown twice as big), each captioned; each strike again at half speed;
// and the king's knight running beside the hero. Painted in node (no browser): every frame of his is the game's own
// (paintMob, deathOfMob), and what his blows leave on the floor (art/kings_knights_fx.ts).
//   tsx tools/kings_knights_film.ts <out.mp4> [stills dir]
// (needs ffmpeg with drawtext; the captions are drawn by it in DejaVu Sans)
// @ts-ignore
import { spawn } from 'node:child_process';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { toSprite } from '../src/art/kit';
import { canvasOf, deathOfMob, paintMob } from '../src/art/new_mobs3';
import type { GameView } from '../src/art/skin';
import { KN_CANVAS } from '../src/art/kings_knights';
import { KINGS_KNIGHT, KN_CHOP, KN_HALT, KN_HALT_PACE, KN_PACE, KN_REEL, KN_RUSH, KN_RUN, KN_SETOFF, KN_DIES, RUSH_SHIELD_AT, rushCarried } from '../src/art/kings_knights_moves';
import { CRACK, CRACK_CANVAS, KNOCK, KNOCK_CANVAS, crackPainted, knockPainted } from '../src/art/kings_knights_fx';
import { TILE3 } from '../src/art/new_mobs3';
import { keepFloor } from '../src/dev/kings_knights_floor';

declare const process: { argv: string[]; exit(n: number): void };
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const [out = 'kings_knights_film.mp4', stills = ''] = process.argv.slice(2);
const W = 1200;
const H = 720;
const BAR = 78;
const Z = 2;
const FPS = 30;
const HERO_PACE = 4.6;

// --- the picture being made ---
const frame = new Uint8ClampedArray(W * H * 4);
const floors: Record<string, Uint8ClampedArray> = {};
/** Where the world's origin is on the screen, by view: set for each shot so that what it shows (`aim`) is in the frame. */
const ORIGIN: Record<GameView, [number, number]> = { front: [200, BAR + 150], back: [200, H - 110] };
/** Frame a shot: the stretch of his way from `u0` to `u1` tiles in the middle of the picture, room above it for the figures. */
function aim(view: GameView, u0: number, u1: number): void {
  const mid = (u0 + u1) / 2;
  const span = Math.abs(u1 - u0) * 16 * Z;
  const yMid = Math.min(H - 24 - span / 2, BAR + 8 + 170 + span / 2 + Math.max(0, (H - BAR - 8 - 170 - 24 - 2 * span) / 2));
  const ox = Math.round(W / 2 - 32 * Z * mid);
  ORIGIN[view] = view === 'front' ? [ox, Math.round(yMid - 16 * Z * mid)] : [ox, Math.round(yMid + 16 * Z * mid)];
}
function floorOf(view: GameView): Uint8ClampedArray {
  const [ox, oy] = ORIGIN[view];
  const key = `${view}:${ox}:${oy}`;
  if (floors[key]) return floors[key];
  const w = Math.ceil(W / Z);
  const h = Math.ceil((H - BAR) / Z);
  // (a flag's top corner on the world's origin: his floor point is a flag's middle)
  floors[key] = keepFloor(w, h, Math.round(ox / Z), Math.round((oy - BAR) / Z) - 16);
  return floors[key];
}
function clear(view: GameView, u0?: number, u1?: number): void {
  if (u0 !== undefined && u1 !== undefined) aim(view, u0, u1);
  const f = floorOf(view);
  const w = Math.ceil(W / Z);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 4;
      if (y < BAR) {
        frame[k] = 20; frame[k + 1] = 18; frame[k + 2] = 28; frame[k + 3] = 255;
        continue;
      }
      const s = (Math.floor((y - BAR) / Z) * w + Math.floor(x / Z)) * 4;
      frame[k] = f[s]; frame[k + 1] = f[s + 1]; frame[k + 2] = f[s + 2]; frame[k + 3] = 255;
    }
  }
}
/** A place in the world (tiles along his way `u` and to his left `v`) on the screen, by view. */
function screen(view: GameView, u: number, v: number): [number, number] {
  const [ox, oy] = ORIGIN[view];
  return view === 'front' ? [ox + 32 * (u + v) * Z, oy + 16 * (u - v) * Z] : [ox + 32 * (u - v) * Z, oy - 16 * (u + v) * Z];
}
/** Lay a picture (a Px) with its anchor (picture pixels) on a screen point, Z times as big, turned over if `flip`. */
function lay(img: Px, ax: number, ay: number, X: number, Y: number, flip = false): void {
  const left = flip ? X - (img.w - ax) * Z : X - ax * Z;
  const top = Y - ay * Z;
  for (let sy = 0; sy < img.h; sy++) {
    for (let sx = 0; sx < img.w; sx++) {
      const i = (sy * img.w + sx) * 4;
      const a = img.d[i + 3];
      if (!a) continue;
      const dx = flip ? img.w - 1 - sx : sx;
      for (let yy = 0; yy < Z; yy++) {
        const Yp = Math.round(top + sy * Z + yy);
        if (Yp < BAR || Yp >= H) continue;
        for (let xx = 0; xx < Z; xx++) {
          const Xp = Math.round(left + dx * Z + xx);
          if (Xp < 0 || Xp >= W) continue;
          const k = (Yp * W + Xp) * 4;
          const al = a / 255;
          frame[k] = frame[k] * (1 - al) + img.d[i] * al;
          frame[k + 1] = frame[k + 1] * (1 - al) + img.d[i + 1] * al;
          frame[k + 2] = frame[k + 2] * (1 - al) + img.d[i + 2] * al;
        }
      }
    }
  }
}
const sprite = (s: Sprite, X: number, Y: number, flip = false): void => lay(s.img as unknown as Px, s.ax * (s.density ?? 1), s.ay * (s.density ?? 1), X, Y, flip);
/** A soft shadow under a figure: an oval darkened, its edge dithered. */
function shadow(X: number, Y: number, r: number): void {
  for (let dy = -r * 0.5; dy <= r * 0.5; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const e = (dx / r) ** 2 + (dy / (r * 0.5)) ** 2;
      if (e > 1) continue;
      if (e > 0.6 && ((Math.round(X + dx) + Math.round(Y + dy)) & 1)) continue;
      const Xp = Math.round(X + dx);
      const Yp = Math.round(Y + dy);
      if (Yp < BAR || Yp >= H || Xp < 0 || Xp >= W) continue;
      const k = (Yp * W + Xp) * 4;
      for (let c = 0; c < 3; c++) frame[k + c] *= 0.62;
    }
  }
}

// --- the figures ---
const MOB = KINGS_KNIGHT;
const can = canvasOf(MOB);
function knightAt(view: GameView, move: string, t: number, u: number, v = 0): void {
  const p = move === 'dying' ? deathOfMob(MOB, Math.min(1, t / MOB.dieTime), view) : paintMob(MOB, move, t, view);
  const [X, Y] = screen(view, u, v);
  if (move !== 'dying' || t < KN_DIES.fold) shadow(X, Y, 16 * Z);
  lay(p.px, can.ax, can.ay, X, Y);
}
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
/** The knight (the hero) at a place, facing back toward the king's knight (or along his way, `along`), standing or running. */
function heroAt(view: GameView, u: number, v: number, run: number | null, along = false): void {
  // (facing back up his way: from in front that is up the screen to the left, the hero's back turned over; from behind, down to the left)
  const set = along ? (view === 'front' ? hero.front : hero.back) : view === 'front' ? hero.back : hero.front;
  const flip = !along;
  const [X, Y] = screen(view, u, v);
  shadow(X, Y, 12 * Z);
  const s = run === null ? set.idle[Math.floor((run ?? 0) * 0)] : set.walk[Math.floor(run * set.walkFps) % set.walk.length];
  sprite(s, X, Y, flip);
}
function fxAt(view: GameView, p: { px: Px }, canv: { ax: number; ay: number }, u: number, v = 0): void {
  const [X, Y] = screen(view, u, v);
  lay(p.px, canv.ax, canv.ay, X, Y);
}

// --- the film, as a list of shots, each a number of frames and a painter for each ---
interface Shot {
  title: string;
  say: string;
  frames: number;
  paint: (i: number) => void;
}
const shots: Shot[] = [];
const hold = (n: number, f: (i: number) => void): ((i: number) => void) => (i) => f(Math.min(i, n - 1));

/** The moves of one view, with the knight in the arena for size. */
function partOf(view: GameView, label: string): void {
  // where things stand (tiles along his way): he starts back at -6.2; runs 7.6 tiles to stop at 1.4; the hero at 6.9
  const START = -6.2;
  const STOP = START + KN_PACE * KN_SETOFF + KN_PACE * 2 * (KN_RUN.frames / KN_RUN.fps) + KN_HALT_PACE * KN_HALT;
  const HERO = STOP + 5.5;
  // STANDING
  shots.push({
    title: `${label} · STANDING GUARD`,
    say: 'Sword planted point down, both gauntlets on its hilt, the shield on his back. Breathing; the Hush leaks from the sight.',
    frames: 72,
    paint: (i) => {
      clear(view, START, HERO);
      heroAt(view, HERO, 0, null);
      knightAt(view, 'stand', (i / FPS) % 3.2, START);
    },
  });
  // SETTING OFF, RUNNING, STOPPING
  const runLong = 2 * (KN_RUN.frames / KN_RUN.fps);
  const nRun = Math.round((KN_SETOFF + runLong + KN_HALT) * FPS) + 12;
  shots.push({
    title: `${label} · QUICK FOR HIS ARMOUR: THE RUN`,
    say: `He plucks up his sword and drives off; runs ${KN_PACE} tiles a second (the hero runs ${HERO_PACE}); stops in three hard steps.`,
    frames: nRun,
    paint: (i) => {
      clear(view, START, HERO);
      heroAt(view, HERO, 0, null);
      const t = i / FPS;
      if (t < KN_SETOFF) knightAt(view, 'setOff', t, START + KN_PACE * t);
      else if (t < KN_SETOFF + runLong) knightAt(view, 'walk', t - KN_SETOFF, START + KN_PACE * t);
      else if (t < KN_SETOFF + runLong + KN_HALT) knightAt(view, 'halt', t - KN_SETOFF - runLong, START + KN_PACE * (KN_SETOFF + runLong) + KN_HALT_PACE * (t - KN_SETOFF - runLong));
      else knightAt(view, 'stand', t - KN_SETOFF - runLong - KN_HALT, STOP);
    },
  });
  // THE CHOP, and its strike at half speed
  const chopFrame = (t: number): void => {
    clear(view, STOP - 1, HERO + 1.5);
    if (t >= KN_CHOP.hit) fxAt(view, crackPainted(t - KN_CHOP.hit, view), CRACK_CANVAS, STOP);
    heroAt(view, HERO, 0, null);
    knightAt(view, 'attack', Math.min(t, KN_CHOP.long), STOP);
  };
  shots.push({
    title: `${label} · THE OVERHEAD CHOP`,
    say: `Heaved high in both hands and held, glinting (the warning); down in two frames; the floor cracks ${CRACK.reach} tiles out.`,
    frames: Math.round((KN_CHOP.long + 0.4) * FPS),
    paint: (i) => chopFrame(i / FPS),
  });
  shots.push({
    title: `${label} · THE CHOP'S STRIKE AT HALF SPEED`,
    say: 'Big wind-up held; the blade over and into the floor in two frames, smeared; held a moment in the floor.',
    frames: 2 * Math.round(0.6 * FPS),
    paint: (i) => chopFrame(KN_CHOP.hit - 0.3 + i / (2 * FPS)),
  });
  // THE RUSH, and its strike at half speed
  const rushFrame = (t: number): void => {
    clear(view, STOP - 1, HERO + 1.5);
    const at = STOP + rushCarried(t);
    if (t >= KN_RUSH.hit) fxAt(view, knockPainted(t - KN_RUSH.hit, view), KNOCK_CANVAS, at);
    // (the hero knocked back as the shield slams in)
    const k = t < KN_RUSH.hit ? 0 : Math.min(1, (t - KN_RUSH.hit) / 0.3);
    heroAt(view, HERO + 1.5 * (1 - (1 - k) * (1 - k)), 0, null);
    knightAt(view, 'rush', Math.min(t, KN_RUSH.long), at);
  };
  shots.push({
    title: `${label} · THE SHIELD RUSH`,
    say: `Shield swung onto his arm, crouched behind it, held (the warning); a two-frame burst of ${KN_RUSH.carry} tiles; you are knocked back.`,
    frames: Math.round((KN_RUSH.long + 0.4) * FPS),
    paint: (i) => rushFrame(i / FPS),
  });
  shots.push({
    title: `${label} · THE RUSH'S STRIKE AT HALF SPEED`,
    say: `Held crouched; the burst in two frames, smeared; the shield slams in, the knockback bursting ${KNOCK.r} tiles out.`,
    frames: 2 * Math.round(0.6 * FPS),
    paint: (i) => rushFrame(KN_RUSH.hit - 0.3 + i / (2 * FPS)),
  });
  // STRUCK, twice
  shots.push({
    title: `${label} · STRUCK`,
    say: 'Jolted back on his sword, the helm rocked back, the Hush coughed out of the sight.',
    frames: 36,
    paint: (i) => {
      clear(view, STOP - 1, HERO + 1.5);
      heroAt(view, HERO - 2.0, 0, null);
      const t = (i % 18) / FPS;
      knightAt(view, t < KN_REEL ? 'reel' : 'stand', t < KN_REEL ? t : 0, STOP);
    },
  });
  // HIS DEATH
  shots.push({
    title: `${label} · THE HUSH LEAVES HIM`,
    say: 'To his knee behind his planted sword, head bowed; the Hush leaves him in a grey breath; the sword falls; he topples.',
    frames: Math.round((KN_DIES.long + 0.7) * FPS),
    paint: hold(Math.round(KN_DIES.long * FPS) + 1, (i) => {
      clear(view, STOP - 1, HERO + 1.5);
      heroAt(view, HERO - 2.0, 0, null);
      knightAt(view, 'dying', i / FPS, STOP);
    }),
  });
}

// the title
shots.push({
  title: 'FLOOR 19, THE KEEP · THE KING’S KNIGHTS (medium: two blows)',
  say: 'His pick: “Quick for their armour”. A head taller than the knight; crowned great helms, royal blue and old gold.',
  frames: 54,
  paint: (i) => {
    clear('front', -1, 3);
    heroAt('front', 1.2, 2.2, null, true);
    knightAt('front', 'stand', i / FPS, 1.2, 0);
  },
});
partOf('front', 'FROM IN FRONT');
partOf('back', 'FROM BEHIND');
// beside the hero: both running from one line
shots.push({
  title: 'QUICK FOR HIS ARMOUR · BESIDE THE HERO',
  say: `From one line: the hero runs ${HERO_PACE} tiles a second, the king’s knight ${KN_PACE}.`,
  frames: 78,
  paint: (i) => {
    clear('front', -6.5, -6.5 + KN_PACE * 2.6);
    const t = i / FPS;
    heroAt('front', -6.5 + HERO_PACE * t, 2.0, t, true);
    knightAt('front', 'walk', t, -6.5 + KN_PACE * t, -0.6);
  },
});

// --- out: frames to ffmpeg, the captions drawn on them ---
const total = shots.reduce((a, s) => a + s.frames, 0);
const dir = fs.mkdtempSync(path.join(path.dirname(path.resolve(out)), '.kk_caps_'));
const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
const BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const filters: string[] = [];
let at = 0;
shots.forEach((s, i) => {
  const a = (at / FPS).toFixed(4);
  const b = ((at + s.frames) / FPS - 0.001).toFixed(4);
  fs.writeFileSync(path.join(dir, `t${i}.txt`), s.title);
  fs.writeFileSync(path.join(dir, `s${i}.txt`), s.say);
  filters.push(`drawtext=fontfile=${BOLD}:textfile=${path.join(dir, `t${i}.txt`)}:fontsize=24:fontcolor=0xe8d8a8:x=18:y=12:enable='between(t,${a},${b})'`);
  filters.push(`drawtext=fontfile=${FONT}:textfile=${path.join(dir, `s${i}.txt`)}:fontsize=19:fontcolor=0xd8d4e4:x=18:y=46:enable='between(t,${a},${b})'`);
  at += s.frames;
});
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-framerate', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
function png(file: string): void {
  const raw = new Uint8Array((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) raw.set(frame.subarray(y * W * 4, (y + 1) * W * 4), y * (W * 4 + 1) + 1);
  const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const o = new Uint8Array(12 + data.length);
    const dv = new DataView(o.buffer);
    dv.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) o[4 + i] = type.charCodeAt(i);
    o.set(data, 8);
    let c = 0xffffffff;
    for (const b of o.subarray(4, 8 + data.length)) c = crcT[(c ^ b) & 255] ^ (c >>> 8);
    dv.setUint32(8 + data.length, (c ^ 0xffffffff) >>> 0);
    return o;
  };
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, W);
  new DataView(ihdr.buffer).setUint32(4, H);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array(0))];
  fs.writeFileSync(file, Buffer.concat(parts));
}
(async () => {
  let n = 0;
  for (const [si, s] of shots.entries()) {
    for (let i = 0; i < s.frames; i++) {
      s.paint(i);
      if (stills && (i === Math.floor(s.frames / 2) || i % 12 === 0)) png(path.join(stills, `s${String(si).padStart(2, '0')}_${String(i).padStart(3, '0')}.png`));
      if (!ff.stdin.write(Buffer.from(frame.buffer))) await new Promise((r) => ff.stdin.once('drain', r));
      n++;
    }
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`${out}: ${n} frames, ${(n / FPS).toFixed(1)} s (${total})`);
})();
void KN_CANVAS;
void RUSH_SHIELD_AT;
void TILE3;
