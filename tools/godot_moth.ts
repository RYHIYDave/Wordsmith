// THE GODOT PORT: FLOOR 20'S BOSS, THE MOTH, MADE GHOSTLY (art/moth2.ts MOTH2, on at his yes of 14 Nov 2026): her rules' numbers and
// what her attacks look like, for godot/scripts/act3/moth.gd (her rules, game/act1_rules/moth.ts), act3/moth_paint.gd (art/moth2_fx.ts,
// brought over line for line) and act3/moth_marks.gd (render/act1_fx/moth.ts). Her own pictures are baked by tools/godot_bake_moth.mjs;
// the last chapter on the stones is filmed by tools/godot_fx.ts (mo_book_*).
//   npx tsx tools/godot_moth.ts            -> godot/assets/act3/moth.json: her numbers (MOTH_TUNE, her acts and gait, her beat, each
//                                              move's warning and blow, the cone, the cloud, the ring, the book; the Hush's, the
//                                              ghost wing's, ECLIPSE's and the PHANTOMS' own), her wings' two outlines (art/moth.ts,
//                                              their radius by angle, as inWing and wingRim read them) and their eyes, her colours,
//                                              the Hush's little letters, how high she rears and wraps; and where each mote of light
//                                              leaves her as she dies, and each word she swallowed flies out of her from (her own
//                                              lengths, from her pictures' own sums: art/moth_moves.ts mothGeomAt), the two views'
//                                              projections (art/skin.ts stage), each word's rune and colours.
//   npx tsx tools/godot_moth.ts check [dir] -> also godot/assets/act3/moth_check.json (not kept in the repository): THE GAME'S OWN
//                                              PAINTERS (art/moth2_fx.ts) RUN ON A SPREAD OF MOMENTS of each, on a canvas that keeps
//                                              every fillRect as it is laid (where, how big, its colour, its alpha) and every light
//                                              given off; and the words flying home as her death paints them (wordsPainted), pixel by
//                                              pixel. godot/checks/moth_check.gd lays the same with moth_paint.gd and holds them against
//                                              these. With `dir`, every one's calls are written there too.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { paintWithoutCanvas } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { hash } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { EYE_AT, LF, LH, inWing, wingRim, onWing } from '../src/art/moth';
import { BEAT_RING, BOOK, BUFFET_CONE, DUST_CLOUD, MOTH, MOTH_BEAT, MOTH_BEAT_BLOW, MOTH_BUFFET, MOTH_DIES, MOTH_DUST, MOTH_EYES, MOTH_LAND, MOTH_PACE, MOTH_REEL, MOTH_SWARM, MOTH_WORDS, mothGeomAt } from '../src/art/moth_moves';
import { CLOUD_FX, FX_CANVAS, GUST_FX, WAVE_FX, wordsPainted } from '../src/art/moth_fx';
import { ECLIPSE, MOTH2, PHANTOMS, PHANTOMS_LONG, PHANTOM_LANE } from '../src/art/moth2';
import { DARK, GHOST, GHOST_WING, HUSH_FX, MOON, PAGE, deathLights, drawDeathMotes, drawEclipse, drawGhostWing, drawHushGround, drawHushSnow, drawMoon, drawPagesLoosing, drawPhantoms, drawPhantomsGather, drawUnwritingGround, drawUnwritingPages } from '../src/art/moth2_fx';
import { TILE3, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { GLYPH, WORD_COLOR, WORD_GLOW } from '../src/art/icons';
import { CLOUD_LONG, MOTH_TUNE, RULES, artToWorld } from '../src/game/act1_rules/moth';
import type { V3 } from '../src/art/skeleton';

declare const process: { argv: string[] };
gameSwitches();
paintWithoutCanvas();
if (!MOTH2.on) throw new Error('the Moth made ghostly is off: this port is of her made ghostly');
const OUT = 'godot/assets/act3';
mkdirSync(OUT, { recursive: true });

// HER WINGS' OUTLINES (art/moth.ts outlineOf, kept to itself: made again here as it makes them, and held against its own inWing
// and wingRim below, so that a change there is caught)
const BINS = 720;
function outlineOf(pts: readonly (readonly [number, number])[], o: readonly [number, number], scallop: number, tears: number, seed: number): { o: readonly [number, number]; r: Float32Array } {
  const n = pts.length;
  const fine: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let k = 0; k < 12; k++) {
      const u = k / 12;
      const f = (j: 0 | 1): number => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u * u * u);
      fine.push([f(0), f(1)]);
    }
  }
  const r = new Float32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    const a = (b / BINS) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let best = 0;
    for (let i = 0; i < fine.length; i++) {
      const [ax, ay] = fine[i];
      const [bx, by] = fine[(i + 1) % fine.length];
      const ex = bx - ax;
      const ey = by - ay;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const wx = ax - o[0];
      const wy = ay - o[1];
      const t = (wx * ey - wy * ex) / den;
      const u = (wx * dy - wy * dx) / den;
      if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
    }
    r[b] = best;
  }
  const out = new Float32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    const a = (b / BINS) * Math.PI * 2;
    let v = r[b];
    v -= scallop * Math.pow(Math.abs(Math.sin(a * 9 + seed)), 0.55);
    for (let k = 0; k < tears; k++) {
      const at = hash(k, 1, seed) * Math.PI * 2;
      const wide = (0.012 + 0.02 * hash(k, 2, seed)) * Math.PI;
      const deep = 0.03 + 0.06 * hash(k, 3, seed);
      let da = Math.abs(a - at);
      da = Math.min(da, Math.PI * 2 - da);
      if (da < wide) v -= deep * (1 - da / wide);
    }
    out[b] = Math.max(0.02, v);
  }
  return { o, r: out };
}
const SRC_MOTH = readFileSync('src/art/moth.ts', 'utf8');
const ptsOf = (name: string): [number, number][] => {
  const m = SRC_MOTH.match(new RegExp(`const ${name}: readonly \\(readonly \\[number, number\\]\\)\\[\\] = \\[([\\s\\S]*?)\\];`));
  if (!m) throw new Error(`no ${name} in art/moth.ts`);
  return JSON.parse(`[${m[1].replace(/\s+/g, '').replace(/,$/, '')}]`);
};
const callOf = (name: string): RegExpMatchArray => {
  const m = SRC_MOTH.match(new RegExp(`const ${name} = outlineOf\\((\\w+), \\[([-\\d.]+), ([-\\d.]+)\\], ([-\\d.]+), (\\d+), (\\d+)\\);`));
  if (!m) throw new Error(`no ${name} = outlineOf(...) in art/moth.ts`);
  return m;
};
const outline = (name: string): { o: readonly [number, number]; r: Float32Array } => {
  const m = callOf(name);
  return outlineOf(ptsOf(m[1]), [Number(m[2]), Number(m[3])], Number(m[4]), Number(m[5]), Number(m[6]));
};
const FORE = outline('FORE');
const HIND = outline('HIND');
{
  // (held against the art's own: its inWing at points all over each wing's box, and its wingRim)
  const mine = (hind: boolean, x: number, y: number): number => {
    const O = hind ? HIND : FORE;
    const dx = x - O.o[0];
    const dy = y - O.o[1];
    let a = Math.atan2(dy, dx);
    if (a < 0) a += Math.PI * 2;
    const f = (a / (Math.PI * 2)) * BINS;
    const i = Math.floor(f) % BINS;
    const R = O.r[i] + (O.r[(i + 1) % BINS] - O.r[i]) * (f - Math.floor(f));
    return R - Math.hypot(dx, dy);
  };
  for (const hind of [false, true]) {
    for (let j = 0; j < 4000; j++) {
      const x = -0.1 + 1.2 * hash(j, 1, 99);
      const y = -0.2 + 1.2 * hash(j, 2, 99);
      if (mine(hind, x, y) !== inWing(hind, x, y)) throw new Error(`the wing's outline made here is not the art's (${hind ? 'hind' : 'fore'} at ${x}, ${y})`);
    }
  }
}

// HER COLOURS AND LETTERS (art/moth2_fx.ts: LETTERS kept to itself, read out of it as it is written)
const SRC_FX = readFileSync('src/art/moth2_fx.ts', 'utf8');
const lm = SRC_FX.match(/const LETTERS: readonly string\[\] = \[([^\]]*)\]/);
if (!lm) throw new Error('no LETTERS in art/moth2_fx.ts');
const LETTERS: string[] = JSON.parse(`[${lm[1].replace(/'/g, '"')}]`);

// (render/act1_fx/moth.ts rearH, wrapH: how high her thorax is as she rears for Eclipse and wraps her wings for her Phantoms)
const rearH = Math.max(60, mothGeomAt('eyes', MOTH_EYES.warn[1]).TC[2] / 2);
const wrapH = Math.max(50, mothGeomAt('swarm', MOTH_SWARM.warn[1]).TC[2] / 2);

// HER DEATH'S MOTES (render/act1_fx/moth.ts glow, `moth:words`, drawDeathMotes' `from`): each mote's moment of birth (as
// drawDeathMotes has it) and where on her it leaves her then (her own lengths, from where every part of her is a twentieth of a
// second at a time: dyingAt)
const motes: { born: number; q: V3 }[] = [];
{
  const [c0, c1] = MOTH_DIES.crumble;
  for (let i = 0; i < 220; i++) {
    const born = c0 + (c1 - c0) * Math.pow(hash(i, 1, 7395), 0.8);
    const G = mothGeomAt('dying', Math.round(born * 20) / 20);
    const w = G.wings[i % 4];
    const q: V3 = i % 5 === 0 ? (G.ab[(i * 7) % G.ab.length] ?? G.TC) : onWing(w, (0.2 + 0.75 * ((i * 0.618) % 1)) * w.len, (0.06 + 0.5 * ((i * 0.381) % 1)) * w.len);
    motes.push({ born, q: [q[0], q[1], q[2]] });
  }
}
// THE WORDS FLYING HOME (art/moth_fx.ts wordsPainted, the mouth it is given: render/act1_fx/moth.ts mouthAt): each word's birth, its
// way, how far it flies, which word it is (its rune, its colours) and where her mouth is at its birth
const WORDS_N = 110;
const words: { born: number; a: number; far: number; word: string; mouth: V3 }[] = [];
for (let i = 0; i < WORDS_N; i++) {
  const [w0, w1] = MOTH_DIES.words;
  const born = w0 + (w1 - w0) * hash(i, 1, 8861);
  const m = mothGeomAt('dying', Math.round(born * 20) / 20).HC;
  words.push({ born, a: hash(i, 2, 8861) * Math.PI * 2, far: (6 + 7 * hash(i, 3, 8861)) * TILE3, word: MOTH_WORDS[i % MOTH_WORDS.length], mouth: [m[0], m[1], m[2]] });
}
const runes = Object.fromEntries(MOTH_WORDS.map((w) => [w, { rows: GLYPH[w], color: WORD_COLOR[w], glow: WORD_GLOW[w] }]));
// (the two views her paintings are seen from: in front, and from behind as her pictures are, turned round: art/skin.ts stage)
const rowsOf = (view: 'front' | 'back'): number[][] => {
  const st = stage(paintViewOf(MOTH, view), 0, 0, { w: 8, h: 8 });
  const ax = st.at([1, 0, 0]);
  const ay = st.at([0, 1, 0]);
  const az = st.at([0, 0, 1]);
  return [[ax[0], ay[0], az[0]], [ax[1], ay[1], az[1]]];
};

const acts = RULES!.acts.map((a) => ({ id: a.id, clip: a.clip, long: a.long, hit: a.hit, dmg: a.dmg, cooldown: a.cooldown, first: a.first, after: a.after, near: a.near, far: a.far, forced: !!a.forced }));
const data = {
  tile3: TILE3,
  tune: MOTH_TUNE,
  acts,
  gait: RULES!.gait,
  beat: MOTH_BEAT,
  pace: MOTH_PACE,
  reel: MOTH_REEL,
  land: MOTH_LAND,
  dies: MOTH_DIES,
  moves: { buffet: MOTH_BUFFET, dust: MOTH_DUST, eyes: MOTH_EYES, swarm: MOTH_SWARM, beat: MOTH_BEAT_BLOW },
  cone: BUFFET_CONE,
  cloud: DUST_CLOUD,
  ring: BEAT_RING,
  book: BOOK,
  cloudFx: CLOUD_FX,
  gustFx: GUST_FX,
  waveFx: WAVE_FX,
  cloudLong: CLOUD_LONG,
  eclipse: ECLIPSE,
  phantoms: PHANTOMS,
  lane: PHANTOM_LANE,
  phantomsLong: PHANTOMS_LONG,
  ghostWing: GHOST_WING,
  hushFx: HUSH_FX,
  bins: BINS,
  outlines: { fore: { o: FORE.o, r: Array.from(FORE.r) }, hind: { o: HIND.o, r: Array.from(HIND.r) } },
  rims: { fore: { from: -160, span: 230 }, hind: { from: -150, span: 250 } },
  eyeAt: EYE_AT,
  lf: LF,
  lh: LH,
  colours: { ghost: GHOST, moon: MOON, dark: DARK, page: PAGE, flame: FLAME },
  letters: LETTERS,
  rearH,
  wrapH,
  motes,
  words,
  runes,
  fxCanvas: FX_CANVAS,
  rows: { front: rowsOf('front'), back: rowsOf('back') },
};
// (held against the art's own wingRim, as moth_paint.gd reads it from these)
for (const hind of [false, true]) {
  for (const n of [12, 24, 30, 36, 40, 44]) {
    const O = hind ? HIND : FORE;
    const R = data.rims[hind ? 'hind' : 'fore'];
    const want = wingRim(hind, n);
    for (let k = 0; k < n; k++) {
      const D2R = Math.PI / 180;
      const a = R.from * D2R + (k / (n - 1)) * R.span * D2R;
      const aa = a < 0 ? a + Math.PI * 2 : a;
      const f = (aa / (Math.PI * 2)) * BINS;
      const r = O.r[Math.floor(f) % BINS];
      if (O.o[0] + Math.cos(a) * r !== want[k][0] || O.o[1] + Math.sin(a) * r !== want[k][1]) throw new Error(`wingRim(${hind}, ${n}) at ${k} is not as made here`);
    }
  }
}
writeFileSync(`${OUT}/moth.json`, JSON.stringify(data));
console.log(`moth.json: ${acts.length} acts, ${motes.length} motes, ${words.length} words, outlines of ${BINS}`);

if (process.argv[2] === 'check') {
  const dump = process.argv[3];
  if (dump) mkdirSync(dump, { recursive: true });
  // A CANVAS THAT KEEPS EVERY fillRect as it is laid: where, how big, its colour and the alpha it is laid at (a canvas's
  // globalAlpha: a value outside 0 to 1 is not taken)
  class Rec {
    fillStyle = '#000000';
    private a = 1;
    calls: string[] = [];
    get globalAlpha(): number {
      return this.a;
    }
    set globalAlpha(v: number) {
      if (v >= 0 && v <= 1) this.a = v;
    }
    fillRect(x: number, y: number, w: number, h: number): void {
      this.calls.push(`${x},${y},${w},${h},${this.fillStyle.toLowerCase()},${this.a.toFixed(4)}`);
    }
  }
  const at = (x: number, y: number): readonly [number, number] => [(x - y) * 16 + 480, (x + y) * 8 + 40];
  type Scene = { name: string; painter: string; args: unknown[] };
  const scenes: Scene[] = [];
  const add = (name: string, painter: string, ...args: unknown[]): void => {
    scenes.push({ name, painter, args });
  };
  const W1 = [Math.SQRT1_2, Math.SQRT1_2];
  const W2 = [-0.6, 0.8];
  for (const t of [0, 0.12, 0.33, 0.6, 0.9, 1.2]) add(`ghost_wing_t${t}`, 'ghost_wing', 10.3, 8.6, W1[0], W1[1], t);
  add('ghost_wing_turned', 'ghost_wing', 9.1, 11.4, W2[0], W2[1], 0.4);
  for (const [k, t] of [[0.3, 0.5], [1, 2.37], [0.75, 4.1]]) add(`moon_k${k}`, 'moon', 300.5, 120.25, k, t);
  for (const t of [0.2, 0.6, 0.95, 1.12, 1.18, 1.3, 1.6, 2.2]) {
    for (const part of ['floor', 'rising'] as const) add(`eclipse_${part}_t${t}`, 'eclipse', 10.2, 9.4, W2[0], W2[1], t, 470.5, 210.25, 3.37 + t, part);
  }
  for (const [k, c] of [[0.3, 1.7], [0.8, 5.31]]) add(`phantoms_gather_k${k}`, 'phantoms_gather', 9.6, 9.9, W1[0], W1[1], k, wrapH, c);
  for (const t of [0, 0.25, 0.7, 1.3, 1.9]) add(`phantoms_t${t}`, 'phantoms', 9.6, 9.9, W2[0], W2[1], t);
  for (const t of [0.5, 1.5, 3, 5.9]) add(`hush_ground_t${t}`, 'hush_ground', 11.25, 10.5, DUST_CLOUD.tiles / 2, t, 7.21 + t);
  for (const t of [-0.1, 0.5, 1.2, 3, 6.2]) add(`hush_snow_t${t}`, 'hush_snow', 11.25, 10.5, DUST_CLOUD.tiles / 2, t);
  for (const [k, c] of [[0.3, 2.2], [0.9, 8.8]]) add(`pages_loosing_k${k}`, 'pages_loosing', 9.8, 10.7, k, c);
  for (const [R, f] of [[2.4, 1], [9.6, 0.45]]) add(`unwriting_ground_R${R}`, 'unwriting_ground', 10, 10, R, MOTH_TUNE.beat.wide, f);
  for (const [R, t, f] of [[2.4, 0.1, 1], [6.5, 0.5, 1], [10.8, 1.1, 0.4]]) add(`unwriting_pages_t${t}`, 'unwriting_pages', 10, 10, R, t, f);
  for (const t of [2.2, 2.6, 3.5, 4.4, 5.6]) add(`death_motes_t${t}`, 'death_motes', 10.4, 9.7, W2[0], W2[1], t);
  for (const [k, c] of [[0.2, 1.1], [0.7, 3.3]]) add(`death_lights_k${k}`, 'death_lights', 300.5, 200.5, k, c);
  const geomOf = (x: number, y: number, fx: number, fy: number) => (i: number, born: number): readonly [number, number] => {
    void born;
    const q = motes[i].q;
    // (render/act1_fx/moth.ts: artToWorld, then lifted half its height)
    const f = artToWorld(x, y, fx, fy, q);
    const [sx, sy] = at(f.x, f.y);
    return [sx, sy - q[2] / 2];
  };
  const out: unknown[] = [];
  for (const s of scenes) {
    const g = new Rec();
    const spots: number[][] = [];
    const spot = (x: number, y: number, r: number, a: number): void => {
      spots.push([x, y, r, a]);
    };
    const G = g as unknown as CanvasRenderingContext2D;
    const A = s.args as never[];
    const n = (i: number): number => A[i] as unknown as number;
    switch (s.painter) {
      case 'ghost_wing':
        drawGhostWing(G, at, n(0), n(1), n(2), n(3), n(4), spot);
        break;
      case 'moon':
        drawMoon(G, n(0), n(1), n(2), n(3), spot);
        break;
      case 'eclipse':
        drawEclipse(G, at, n(0), n(1), n(2), n(3), n(4), n(5), n(6), n(7), spot, A[8] as unknown as 'floor' | 'rising');
        break;
      case 'phantoms_gather':
        drawPhantomsGather(G, at, n(0), n(1), n(2), n(3), n(4), n(5), n(6));
        break;
      case 'phantoms':
        drawPhantoms(G, at, n(0), n(1), n(2), n(3), n(4), spot);
        break;
      case 'hush_ground':
        drawHushGround(G, at, n(0), n(1), n(2), n(3), n(4), spot);
        break;
      case 'hush_snow':
        drawHushSnow(G, at, n(0), n(1), n(2), n(3), spot);
        break;
      case 'pages_loosing':
        drawPagesLoosing(G, at, n(0), n(1), n(2), n(3), spot);
        break;
      case 'unwriting_ground':
        drawUnwritingGround(G, at, n(0), n(1), n(2), n(3), n(4));
        break;
      case 'unwriting_pages':
        drawUnwritingPages(G, at, n(0), n(1), n(2), n(3), n(4), spot);
        break;
      case 'death_motes':
        drawDeathMotes(G, n(4), MOTH_DIES.crumble, geomOf(n(0), n(1), n(2), n(3)));
        break;
      case 'death_lights':
        deathLights(n(0), n(1), n(2), n(3), spot);
        break;
    }
    const md5 = createHash('md5').update(g.calls.join('\n')).digest('hex');
    out.push({ ...s, n: g.calls.length, md5, spots: spots.map((q) => q.map((v) => Number(v.toFixed(4)))) });
    if (dump) writeFileSync(`${dump}/${s.name}.txt`, g.calls.join('\n'));
  }
  // THE WORDS FLYING HOME, as her death paints them (on its own canvas, at two painting pixels to the game's, its floor point at
  // FX_CANVAS's anchor): each game pixel laid, from that point, and its colour, seen from in front and from behind
  const wordsOut: unknown[] = [];
  for (const view of ['front', 'back'] as const) {
    for (const t of [0.9, 1.6, 2.4, 3.3, 4.2, 5.2]) {
      const p = wordsPainted(t, paintViewOf(MOTH, view), (b) => {
        const w = words.find((q) => q.born === b);
        if (!w) throw new Error('a word born at no word\'s birth');
        return w.mouth;
      });
      const px = p.px as unknown as { w: number; h: number; d: Uint8ClampedArray };
      const cells: string[] = [];
      for (let y = 0; y < px.h; y += 2) for (let x = 0; x < px.w; x += 2) {
        const o = (y * px.w + x) * 4;
        if (px.d[o + 3] === 0) continue;
        const hex = [px.d[o], px.d[o + 1], px.d[o + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
        cells.push(`${(x - FX_CANVAS.ax) / 2},${(y - FX_CANVAS.ay) / 2},${hex}`);
      }
      cells.sort();
      wordsOut.push({ view, t, n: cells.length, md5: createHash('md5').update(cells.join('\n')).digest('hex') });
      if (dump) writeFileSync(`${dump}/words_${view}_t${t}.txt`, cells.join('\n'));
    }
  }
  writeFileSync(`${OUT}/moth_check.json`, JSON.stringify({ scenes: out, words: wordsOut }));
  console.log(`moth_check.json: ${out.length} moments of her painters, ${wordsOut.length} of her words flying home`);
}
