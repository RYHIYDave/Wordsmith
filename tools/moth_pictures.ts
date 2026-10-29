// THE MOTH'S PICTURES AND ITS FILM, for the owner (art/moth.ts, art/moth_moves.ts, art/moth_fx.ts; a mock-up behind
// MOTH_ON, off). Painted here as the game paints them, laid on the stand-in tower top (dev/moth_top.ts), no browser.
//   npx tsx tools/moth_pictures.ts sheet <out.png>   the Moth from in front and from behind, beside the knight, as big as each other
//   npx tsx tools/moth_pictures.ts top <out.png>     at the game's size on the top, the knight before it
//   npx tsx tools/moth_pictures.ts close <out.png>   its wing-eyes close up (shut, half-lidded, wide, burning), its head and body
//   npx tsx tools/moth_pictures.ts film <out.mp4>    every move from in front and behind, at the scale of the arena with the knight
//                                                    in it, captioned; each strike again at half speed (tools/moth_film.py, ffmpeg)
//   npx tsx tools/moth_pictures.ts still <move> <t> <front|back> <out.png>
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import type { Light, Sprite } from '../src/engine/px';

// (a sprite's picture is its painting, here where there is no canvas)
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

import { makeHeroArt3 } from '../src/art/heroes3';
import type { Painted } from '../src/art/kit';
import { MOTH_CANVAS, onWing } from '../src/art/moth';
import { BEAT_RING, BOOK, MOTH, MOTH_BEAT, MOTH_BEAT_BLOW, MOTH_BUFFET, MOTH_DIES, MOTH_DUST, MOTH_EYES, MOTH_LAND, MOTH_PACE, MOTH_REEL, MOTH_SWARM, mothGeomAt, mothLong } from '../src/art/moth_moves';
import { CHAPTER_CANVAS, FX_CANVAS, beamsPainted, chapterPainted, cloudPainted, gustPainted, swarmPainted, wavePainted, wordsPainted } from '../src/art/moth_fx';
import { TILE3, deathOfMob, paintMob, paintViewOf } from '../src/art/new_mobs3';
import type { V3 } from '../src/art/skeleton';
import { frameOf, layLight, layPx, layShadow, paintTop, seenAt } from '../src/dev/moth_top';
import type { Frame } from '../src/dev/moth_top';

type View = 'front' | 'back';
const T = TILE3;
const [cmd = 'sheet', ...args] = process.argv.slice(2);

// ---------------------------------------------------------------------------------------------
// Saving

const table = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc = (b: Uint8Array): number => {
  let c = -1;
  for (const v of b) c = table[(c ^ v) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
function savePng(path: string, f: Frame): void {
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const o = new Uint8Array(12 + data.length);
    const dv = new DataView(o.buffer);
    dv.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) o[4 + i] = type.charCodeAt(i);
    o.set(data, 8);
    dv.setUint32(8 + data.length, crc(o.subarray(4, 8 + data.length)));
    return o;
  };
  const raw = new Uint8Array((f.w * 3 + 1) * f.h);
  for (let y = 0; y < f.h; y++) {
    raw[y * (f.w * 3 + 1)] = 0;
    for (let x = 0; x < f.w; x++) for (let c = 0; c < 3; c++) raw[y * (f.w * 3 + 1) + 1 + x * 3 + c] = f.d[(y * f.w + x) * 4 + c];
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, f.w);
  dv.setUint32(4, f.h);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array(0))];
  writeFileSync(path, Buffer.concat(parts.map((p) => Buffer.from(p))));
}
function fill(f: Frame, c: readonly [number, number, number]): void {
  for (let i = 0; i < f.w * f.h; i++) {
    f.d[i * 4] = c[0];
    f.d[i * 4 + 1] = c[1];
    f.d[i * 4 + 2] = c[2];
    f.d[i * 4 + 3] = 255;
  }
}

// ---------------------------------------------------------------------------------------------
// What is laid

const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const knightPx = (view: View, i = 0): { px: Px; ax: number; ay: number } => {
  const s: Sprite = (view === 'front' ? hero.front.idle : hero.back.idle)[i % 8];
  const d = s.density ?? 1;
  return { px: s.img as unknown as Px, ax: s.ax * d, ay: s.ay * d };
};
const MOTH_CACHE = new Map<string, Painted>();
/** A frame of the Moth (its death, as the game paints a death: art/new_mobs3.ts deathOfMob). */
function mothPainted(move: string, t: number, view: View): Painted {
  const key = `${move}:${t.toFixed(4)}:${view}`;
  let p = MOTH_CACHE.get(key);
  if (!p) {
    p = move === 'dying' ? deathOfMob(MOTH, Math.min(1, t / MOTH.dieTime), view) : paintMob(MOTH, move, t, view);
    if (MOTH_CACHE.size > 6) MOTH_CACHE.delete(MOTH_CACHE.keys().next().value as string);
    MOTH_CACHE.set(key, p);
  }
  return p;
}
/** The figure's own floor ways laid on the world's: from in front as they are; from behind, its forward is the world's left (art/skeleton.ts `project`, 'rear'). */
const toWorld = (view: View, fx: number, fy: number): [number, number] => (view === 'front' ? [fx, fy] : [-fy, fx]);

interface Shot {
  move: string;
  t: number;
  view: View;
  /** Where the Moth is (the world's floor), and the knight. */
  at: V3;
  knight: V3 | null;
  knightView: View;
  /** Its effects: under the figures (on the top) and over them, each a painting on the effects' canvas, anchored on the Moth. */
  under: Painted[];
  over: Painted[];
  book: number | null;
}
/** Lay a shot on `f` (the top's middle at (ox, oy)): the top, the shadows, what lies on it, the figures far to near, what flies over. */
function layShot(f: Frame, top: Frame, ox: number, oy: number, s: Shot): void {
  f.d.set(top.d);
  const [mx, my] = seenAt(s.at, ox, oy);
  const mp = mothPainted(s.move, s.t, s.view);
  const G = mothGeomAt(s.move, s.t);
  // (its shadow, under its body and the wings over it, wide and soft; deeper as it comes down)
  const lowBody = G.TC[2];
  const [sx, sy] = seenAt([s.at[0] + toWorld(s.view, G.TC[0], G.TC[1])[0], s.at[1] + toWorld(s.view, G.TC[0], G.TC[1])[1], 0], ox, oy);
  layShadow(f, sx, sy, 150 + 0.6 * Math.max(0, 200 - lowBody), 0.42 + 0.2 * Math.max(0, 1 - lowBody / 260));
  for (const u of s.under) layPx(f, u.px, FX_CANVAS.ax, FX_CANVAS.ay, mx, my);
  if (s.book !== null) {
    const b = chapterPainted(paintViewOf(MOTH, s.view), s.book, s.t);
    layPx(f, b.px, CHAPTER_CANVAS.ax, CHAPTER_CANVAS.ay, mx, my);
  }
  // (its pool of light: the Hush's, faint, behind it)
  const aura = MOTH.aura;
  layLight(f, mx - MOTH_CANVAS.ax + aura.x, my - MOTH_CANVAS.ay + aura.y, aura.r, aura.color, aura.a ?? 0.07);
  const figs: { y: number; draw: () => void }[] = [{ y: my, draw: () => layPx(f, mp.px, MOTH_CANVAS.ax, MOTH_CANVAS.ay, mx, my) }];
  if (s.knight) {
    const [kx, ky] = seenAt(s.knight, ox, oy);
    layShadow(f, kx, ky, 16, 0.5);
    const k = knightPx(s.knightView, Math.floor(s.t * 10));
    figs.push({ y: ky, draw: () => layPx(f, k.px, k.ax, k.ay, kx, ky) });
  }
  figs.sort((a, b) => a.y - b.y).forEach((g) => g.draw());
  for (const o of s.over) layPx(f, o.px, FX_CANVAS.ax, FX_CANVAS.ay, mx, my);
  const lights: [Light, number, number][] = [...mp.lights.map((l): [Light, number, number] => [l, MOTH_CANVAS.ax, MOTH_CANVAS.ay]), ...s.over.flatMap((o) => o.lights.map((l): [Light, number, number] => [l, FX_CANVAS.ax, FX_CANVAS.ay]))];
  for (const [l, ax, ay] of lights) layLight(f, mx - ax + l.x, my - ay + l.y, l.r, l.color, l.a ?? 0.15);
}

/** What each move leaves on the top `t` seconds in (and over it): its effects, painted for that moment. */
function effectsOf(move: string, t: number, view: View): { under: Painted[]; over: Painted[] } {
  const pv = paintViewOf(MOTH, view);
  const under: Painted[] = [];
  const over: Painted[] = [];
  if (move === 'attack') under.push(gustPainted(t - MOTH_BUFFET.hit, pv));
  if (move === 'dust') under.push(cloudPainted(t - MOTH_DUST.hit, pv));
  if (move === 'eyes') over.push(beamsPainted(t - MOTH_EYES.hit, pv, mothGeomAt('eyes', MOTH_EYES.hit)));
  if (move === 'swarm') over.push(swarmPainted(t - MOTH_SWARM.hit, pv, mothGeomAt('swarm', MOTH_SWARM.hit).TC));
  if (move === 'beat') under.push(wavePainted(t - MOTH_BEAT_BLOW.hit, pv));
  if (move === 'dying') over.push(wordsPainted(t, pv, (u) => mothGeomAt('dying', Math.min(MOTH_DIES.long, u)).HC));
  return { under, over };
}

// ---------------------------------------------------------------------------------------------
// THE SHEET: from in front and from behind, beside the knight, as big as each other (the game's own size: two picture
// pixels to a game pixel), on the dark

const BG: readonly [number, number, number] = [22, 21, 26];
if (cmd === 'sheet') {
  const W = 1200;
  const rows: { view: View; t: number; label: string }[] = [
    { view: 'front', t: 1.3, label: 'from in front' },
    { view: 'back', t: 0.8, label: 'from behind' },
  ];
  const H = 920 * 2;
  const f = frameOf(W, H);
  fill(f, BG);
  rows.forEach((r, i) => {
    const y = 820 + i * 920;
    const p = mothPainted('stand', r.t, r.view);
    layPx(f, p.px, MOTH_CANVAS.ax, MOTH_CANVAS.ay, 620, y);
    const k = knightPx(r.view === 'front' ? 'front' : 'back');
    layShadow(f, 120, y, 16, 0.5);
    layPx(f, k.px, k.ax, k.ay, 120, y);
  });
  savePng(args[0], f);
  console.log('saved', args[0]);
}

// ---------------------------------------------------------------------------------------------
// AT THE GAME'S SIZE, ON THE TOP

const FW = 1200;
const FH = 1080;
const OX = 600;
const OY = 800;
let TOP: Frame | null = null;
const topFrame = (): Frame => {
  if (!TOP) {
    TOP = frameOf(FW, FH);
    paintTop(TOP, OX, OY);
  }
  return TOP;
};
/** Where the Moth hovers and the knight stands, each way round: the knight five and a half tiles before it. */
const PLACE: Record<View, { at: V3; knight: V3 }> = {
  front: { at: [-4.2 * T, 0.6 * T, 0], knight: [1.5 * T, 0.9 * T, 0] },
  back: { at: [-0.6 * T, -4.2 * T, 0], knight: [2.2 * T, 5.4 * T, 0] },
};
if (cmd === 'top') {
  const f = frameOf(FW, FH);
  layShot(f, topFrame(), OX, OY, { move: 'stand', t: 0.8, view: 'front', at: PLACE.front.at, knight: PLACE.front.knight, knightView: 'back', under: [], over: [], book: null });
  savePng(args[0], f);
  console.log('saved', args[0]);
}
/** A moment of a move on the top, what it leaves with it. */
function still(move: string, t: number, v: View, out: string): void {
  const f = frameOf(FW, FH);
  const fx = effectsOf(move, t, v);
  const onBook = ['perch', 'beat', 'perchReel', 'dying', 'land'].includes(move);
  layShot(f, topFrame(), OX, OY, { move, t, view: v, at: PLACE[v].at, knight: PLACE[v].knight, knightView: v === 'front' ? 'back' : 'front', ...fx, book: onBook ? 0.3 : null });
  savePng(out, f);
  console.log('saved', out);
}
if (cmd === 'still') still(args[0], Number(args[1]), args[2] as View, args[3]);
// (`stills <dir> <move:t:view> ...`: many at once)
if (cmd === 'stills') for (const spec of args.slice(1)) {
  const [move, t, v] = spec.split(':');
  still(move, Number(t), v as View, `${args[0]}/st_${move}_${t}_${v}.png`);
}

// ---------------------------------------------------------------------------------------------
// CLOSE UP: its wing-eyes (shut, half-lidded, wide, burning) and its head and body, four times as big

function zoomInto(f: Frame, p: Px, sx: number, sy: number, w: number, h: number, dx: number, dy: number, k: number): void {
  for (let y = 0; y < h * k; y++) {
    for (let x = 0; x < w * k; x++) {
      const px0 = sx + Math.floor(x / k);
      const py0 = sy + Math.floor(y / k);
      const o = ((dy + y) * f.w + dx + x) * 4;
      if (dx + x >= f.w || dy + y >= f.h) continue;
      if (px0 < 0 || py0 < 0 || px0 >= p.w || py0 >= p.h) continue;
      const i = (py0 * p.w + px0) * 4;
      const a = p.d[i + 3] / 255;
      for (let c = 0; c < 3; c++) f.d[o + c] = f.d[o + c] * (1 - a) + p.d[i + c] * a;
    }
  }
}
/** Where a point of the Moth is on its picture, seen this way round. */
function onPicture(p: V3, view: View): [number, number] {
  const G = 0.8165;
  return view === 'front' ? [MOTH_CANVAS.ax + G * (p[0] + p[1]), MOTH_CANVAS.ay + G * 0.5 * (p[0] - p[1]) - p[2]] : [MOTH_CANVAS.ax + G * (p[0] - p[1]), MOTH_CANVAS.ay + G * 0.5 * (-p[0] - p[1]) - p[2]];
}
if (cmd === 'close') {
  const f = frameOf(1200, 1250);
  fill(f, BG);
  // ITS GREAT EYE, on a hindwing, four times as big at four moments: shut as it blinks, half-lidded as it hovers, opening
  // wide in the Eyes' warning, burning as the beams fire
  const shots: [string, number, View, number][] = [['stand', 1.8, 'back', 1], ['stand', 0.8, 'back', 1], ['eyes', 1.0, 'front', 3], ['eyes', 1.4, 'back', 1]];
  shots.forEach(([move, t, view, wi], i) => {
    const p = mothPainted(move, t, view);
    const w = mothGeomAt(move, t).wings[wi];
    const [x, y] = onPicture(onWing(w, 0.5 * w.len, 0.4 * w.len), view);
    zoomInto(f, p.px, Math.round(x) - 72, Math.round(y) - 54, 144, 108, 12 + (i % 2) * 594, 12 + Math.floor(i / 2) * 444, 4);
  });
  // ITS HEAD, three times as big: as it hovers; and as it screams, dying
  ([['stand', 0.8], ['dying', 1.05]] as const).forEach(([move, t], i) => {
    const p = mothPainted(move, t, 'front');
    const [x, y] = onPicture(mothGeomAt(move, t).HC, 'front');
    zoomInto(f, p.px, Math.round(x) - 95, Math.round(y) - 70, 190, 120, 12 + i * 594, 900, 3);
  });
  savePng(args[0], f);
  console.log('saved', args[0]);
}

// ---------------------------------------------------------------------------------------------
// THE FILM

interface Cut {
  title: string;
  sub: string;
  tag: string;
  /** Each film frame: the shot. */
  frames: Shot[];
}
const cuts: Cut[] = [];
const FPS = 30;
const NAMES: Record<string, [string, string]> = {
  stand: ['HOVERING', 'Slow, heavy wingbeats; dust sifting off it; its eyes half-lidded, following you'],
  walk: ['THE DRIFT', `Its beat in step with its hover, drifting ${MOTH_PACE} tiles a second (faster each phase)`],
  attack: ['THE BUFFET', 'Wings raised high and held; down in two frames; the gust: 140 degrees, 9 tiles'],
  dust: ['DUST', 'Its wings shaken over the top; its scales drift down, 7 tiles across; words go dark in it'],
  eyes: ['THE EYES', 'It rears, its four eyes open wide; its wings snap to you; four beams, the top\'s whole length'],
  swarm: ['THE SWARM', 'Little moths crawl out over its wings; flung open; the swarm pours across the top'],
  land: ['THE LAST PHASE: IT COMES DOWN', 'Onto the last chapter, a braking downbeat, its feet down round the book'],
  perch: ['ON THE BOOK', 'Its wings, as wide as the top is long, fanning; its feet gripping the stones'],
  beat: ['THE BEAT', 'Wings raised, held; slammed down to the stones in two frames; the wind over the whole top (11 tiles)'],
  reel: ['STRUCK', 'In the air, and on the book'],
  dying: ['IT DIES SCREAMING', 'The first sound it ever makes; every word it swallowed flies home; it crumbles to dust'],
};
const shotAt = (move: string, t: number, view: View, extra: Partial<Shot> = {}): Shot => {
  const fx = effectsOf(move, t, view);
  const onBook = ['perch', 'beat', 'perchReel', 'dying', 'land'].includes(move);
  const wind = move === 'beat' ? Math.max(0, 1 - Math.abs(t - MOTH_BEAT_BLOW.hit - 0.15) / 0.5) : move === 'land' ? Math.max(0, 1 - Math.abs(t - 0.9) / 0.4) : move === 'perch' ? 0.25 : 0.1;
  return { move, t, view, at: PLACE[view].at, knight: PLACE[view].knight, knightView: view === 'front' ? 'back' : 'front', ...fx, book: onBook ? wind : null, ...extra };
};
/** A move played at the game's speed (its loop at its own frames a second), `after` more seconds of what it leaves with its stand going on after it. */
function play(move: string, view: View, after = 0, then = 'stand'): Shot[] {
  const out: Shot[] = [];
  const long = move === 'stand' || move === 'walk' || move === 'perch' ? MOTH_BEAT.long : move === 'dying' ? MOTH.dieTime : mothLong(move);
  const n = Math.round((long + after) * FPS);
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    if (t <= long) {
      // (a loop shows its own frames: 15 a second)
      const tt = move === 'stand' || move === 'walk' || move === 'perch' ? Math.floor(t * MOTH_BEAT.fps) / MOTH_BEAT.fps : move === 'dying' ? Math.floor(t * 20) / 20 : t;
      out.push(shotAt(move, tt, view));
    } else {
      // (after it: its stand going on, what it left still at work)
      const u = t - long;
      const tt = then === 'dying' ? MOTH.dieTime : Math.floor(u * MOTH_BEAT.fps) / MOTH_BEAT.fps;
      const fx = effectsOf(move, t, view);
      out.push({ ...shotAt(then, tt, view), ...fx, move: then, t: tt });
    }
  }
  return out;
}
if (cmd === 'film') {
  for (const view of ['front', 'back'] as const) {
    const tag = view === 'front' ? 'FROM IN FRONT' : 'FROM BEHIND';
    const add = (key: string, frames: Shot[]): void => {
      cuts.push({ title: NAMES[key][0], sub: NAMES[key][1], tag, frames });
    };
    add('stand', play('stand', view));
    // the drift: carried over the top at its pace, toward the knight
    {
      const frames = play('walk', view);
      frames.forEach((s, i) => {
        const k = i / FPS;
        const [wx, wy] = toWorld(view, (-3.6 + MOTH_PACE * k) * T, 0);
        s.at = [PLACE[view].at[0] + wx, PLACE[view].at[1] + wy, 0];
      });
      add('walk', frames);
    }
    add('attack', play('attack', view, 0.3));
    add('dust', play('dust', view, 1.6));
    add('eyes', play('eyes', view, 0.2));
    add('swarm', play('swarm', view, 1.4));
    add('land', play('land', view, 0, 'perch'));
    add('perch', play('perch', view));
    add('beat', play('beat', view, 0.1, 'perch'));
    add('reel', [...play('reel', view, 0.25), ...play('perchReel', view, 0.25, 'perch')]);
    add('dying', play('dying', view, 0.8, 'dying'));
  }
  // EACH STRIKE AGAIN AT HALF SPEED, from in front: the game's own frames, each held twice as long
  for (const [move, s] of [['attack', MOTH_BUFFET.strike], ['dust', MOTH_DUST.strike], ['eyes', MOTH_EYES.strike], ['swarm', MOTH_SWARM.strike], ['beat', MOTH_BEAT_BLOW.strike]] as const) {
    const frames: Shot[] = [];
    const t0 = Math.max(0, s[0] - 0.4);
    const t1 = s[1] + 0.5;
    for (let i = 0; i <= Math.round((t1 - t0) * FPS); i++) {
      const sh = shotAt(move, t0 + i / FPS, 'front');
      frames.push(sh, sh);
    }
    cuts.push({ title: NAMES[move][0], sub: `The strike: two frames at the game's 30 a second, here at half speed`, tag: 'HALF SPEED', frames });
  }
  const total = cuts.reduce((n, c) => n + c.frames.length, 0);
  console.error(`film: ${cuts.length} cuts, ${total} frames, ${(total / FPS).toFixed(1)} s`);
  const out = args[0];
  const py = spawn('python3', ['tools/moth_film.py', String(FW), String(FH), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f = frameOf(FW, FH);
  const rgb = Buffer.alloc(FW * FH * 3);
  let n = 0;
  const write = (b: Buffer): Promise<void> => new Promise((res) => (py.stdin.write(b) ? res() : py.stdin.once('drain', () => res())));
  (async () => {
    for (const c of cuts) {
      for (const s of c.frames) {
        layShot(f, topFrame(), OX, OY, s);
        for (let i = 0; i < FW * FH; i++) {
          rgb[i * 3] = f.d[i * 4];
          rgb[i * 3 + 1] = f.d[i * 4 + 1];
          rgb[i * 3 + 2] = f.d[i * 4 + 2];
        }
        const head = Buffer.from(JSON.stringify({ title: c.title, sub: c.sub, tag: c.tag }) + '\n');
        await write(Buffer.concat([Buffer.from(`${head.length}\n`), head, rgb]));
        if (++n % 100 === 0) console.error(`${n} of ${total}`);
      }
    }
    py.stdin.end();
  })();
}
void BOOK;
void BEAT_RING;
void MOTH_LAND;
void MOTH_REEL;
