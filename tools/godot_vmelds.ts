// THE GODOT PORT: THE LOOKS OF VOLATILE'S FIVE MELDS (render/volatile3.ts, VOLATILE3) AND OF THE EIGHT MELDS ACROSS THE GROUPS
// (render/melds8.ts, MELDS8_LOOK), the art chat's, for godot/scripts/fx_volatile3.gd and fx_melds8.gd.
//   npx tsx tools/godot_vmelds.ts          -> godot/assets/words/vmelds.json: the five's colours (VMELD_RAMP) and their runes'
//                                              times (VRUNE); the eight's colours (M8_RAMP), beats (M8_LOOK) and runes (M8_GLYPH).
//   npx tsx tools/godot_vmelds.ts check [dir]  -> also godot/assets/words/vmelds_check.json (not kept in the repository): THE
//                                              GAME'S OWN LOOKS RUN ON A SPREAD OF MOMENTS: each of the five's blasts, runes,
//                                              hits and moments of their own (eventsV3, tickV3, floorV3, airV3, overV3,
//                                              lightsV3, shiftV3, tintV3), and each of the eight's moments, in front and behind
//                                              (M8Fx moment, update, drawGround, drawAir), on a fake game of the fields they read,
//                                              their chance (Math.random) a sequence of the check's own, frame by frame. Of each
//                                              painted frame and layer, every fill the painter makes (its place, size, colour
//                                              and strength, in order) summed; of what each throws into the effects (particles,
//                                              rings, flashes, glows, flames, bubbles, holds, shakes) the same. godot/checks/
//                                              vmelds_check.gd runs the same moments through the ports and holds them against
//                                              these. With `dir`, every line of each is written there too, to see where two differ.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gameSwitches } from './godot_switches';
import { FIGURE_SIZE } from '../src/art/bestiary';
import { VMELD_IDS, VMELD_RAMP, VRUNE, V3, airV3, clearV3, eventsV3, floorV3, lightsV3, overV3, shiftV3, tickV3, tintV3 } from '../src/render/volatile3';
import { M8Fx, M8_GLYPH, M8_IDS, M8_LOOK, M8_RAMP } from '../src/render/melds8';
import type { Cam, Fx } from '../src/render/fx';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';

declare const process: { argv: string[] };
gameSwitches();
const OUT = 'godot/assets/words';
mkdirSync(OUT, { recursive: true });
writeFileSync(
  `${OUT}/vmelds.json`,
  JSON.stringify({ vids: VMELD_IDS, vramp: VMELD_RAMP, vrune: VRUNE, m8ids: M8_IDS, m8ramp: M8_RAMP, m8look: M8_LOOK, m8glyph: M8_GLYPH }, null, 1),
);
console.log(`vmelds.json: the five's and the eight's colours, times and runes`);

if (process.argv[2] === 'check') {
  const dump = process.argv[3] ?? '';
  if (dump) mkdirSync(dump, { recursive: true });

  // THE CHANCE, the check's own: the same sequence the ports take in their check (fx_volatile3.gd `_r`, seeded).
  let seed = 1;
  const lcg = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return ((seed >>> 8) & 0xffffff) / 0x1000000;
  };
  Math.random = lcg;

  // (a number as the lines have it: ten-thousandths, whole)
  const q = (v: number): string => String(Math.round(v * 10000));
  const hex = (c: string): string => {
    const s = c.toLowerCase();
    if (s.startsWith('#')) return s.slice(1);
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) throw new Error(`colour ${c}`);
    return [m[1], m[2], m[3]].map((v) => Number(v).toString(16).padStart(2, '0')).join('');
  };
  const cols = (list: readonly string[] | undefined): string => (list ? list.map(hex).join('/') : '-');

  // THE CANVAS: keeps every fill, as the canvas would lay it (a strength out of 0..1 not taken; a size below 0 turned round;
  // none laid of no size), in order.
  class Rec {
    private _fill = '#000000';
    private _alpha = 1;
    globalCompositeOperation = 'source-over';
    canvas = { width: 960, height: 540 };
    lines: string[] = [];
    get fillStyle(): string {
      return this._fill;
    }
    set fillStyle(v: string) {
      // (as the canvas: a colour it cannot read is not taken; the one before stays)
      if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) this._fill = v;
    }
    get globalAlpha(): number {
      return this._alpha;
    }
    set globalAlpha(v: number) {
      if (Number.isFinite(v) && v >= 0 && v <= 1) this._alpha = v;
    }
    fillRect(x: number, y: number, w: number, h: number): void {
      if (![x, y, w, h].every(Number.isFinite)) return;
      if (w < 0) {
        x += w;
        w = -w;
      }
      if (h < 0) {
        y += h;
        h = -h;
      }
      if (w === 0 || h === 0) return;
      if (x === 0 && y === 0 && w === this.canvas.width && h === this.canvas.height) {
        this.lines.push(`s,${hex(this._fill)},${q(this._alpha)}`);
        return;
      }
      this.lines.push(`r,${q(x)},${q(y)},${q(w)},${q(h)},${hex(this._fill)},${q(this._alpha)}`);
    }
    drawImage(img: { color?: string }, x: number, y: number, w: number, h: number): void {
      if (w <= 0 || h <= 0) return;
      this.lines.push(`g,${q(x)},${q(y)},${q(w)},${q(h)},${hex(img.color ?? '#000')},${q(this._alpha)}`);
    }
  }
  // (drawGlow paints its light once into a canvas of its own: here, a canvas that keeps the colour it was painted in)
  (globalThis as unknown as { document: unknown }).document = {
    createElement: () => {
      const cv: { color?: string; width: number; height: number; getContext: () => unknown } = {
        width: 0,
        height: 0,
        getContext: () => ({
          createRadialGradient: () => ({
            addColorStop: (stop: number, c: string) => {
              if (stop === 0) cv.color = c;
            },
          }),
          fillRect: () => {},
          fillStyle: '',
        }),
      };
      return cv;
    },
  };

  // THE EFFECTS: keeps what is thrown into them, in order.
  const rec: string[] = [];
  const fx = {
    particles: [] as unknown[],
    rings: [] as unknown[],
    flashes: [] as unknown[],
    glows: [] as unknown[],
    get shake(): number {
      return 0;
    },
    set shake(v: number) {
      rec.push(`k,${q(v)}`);
    },
    hold(s: number): void {
      rec.push(`h,${q(s)}`);
    },
    room(): number {
      return 1;
    },
    flames(x: number, y: number, r: number, n: number, up = 1): void {
      rec.push(`f,${q(x)},${q(y)},${q(r)},${n},${q(up)}`);
    },
    bubbles(x: number, y: number, r: number, n: number): void {
      rec.push(`b,${q(x)},${q(y)},${q(r)},${n}`);
    },
  };
  type P = { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; color: string; size: number; grav: number; ramp?: readonly string[]; streak?: number };
  type Rg = { x: number; y: number; r: number; dur: number; colors: readonly string[]; fill: boolean; heavy?: boolean; closing?: boolean; jag?: boolean; delay?: number; double?: boolean };
  type Fl = { x: number; y: number; z: number; r: number; dur: number; colors: readonly string[] };
  type Gl = { x: number; y: number; r: number; dur: number };
  // (each list's pushes taken down as they come: the lists themselves never shrink here, so their limits, 900 particles and 24
  // glows, are the game's as they would be from an empty start)
  const keep = <T>(list: T[], line: (v: T) => string): void => {
    const push = list.push.bind(list);
    list.push = (...vs: T[]): number => {
      for (const v of vs) rec.push(line(v));
      return push(...vs);
    };
  };
  keep(fx.particles as P[], (p) => `p,${q(p.x)},${q(p.y)},${q(p.z)},${q(p.vx)},${q(p.vy)},${q(p.vz)},${q(p.life)},${hex(p.color)},${p.size},${q(p.grav)},${cols(p.ramp)},${q(p.streak ?? 0)}`);
  keep(fx.rings as Rg[], (r) => `o,${q(r.x)},${q(r.y)},${q(r.r)},${q(r.dur)},${cols(r.colors)},${r.fill ? 1 : 0},${r.heavy ? 1 : 0},${r.closing ? 1 : 0},${r.jag ? 1 : 0},${q(r.delay ?? 0)},${r.double ? 1 : 0}`);
  keep(fx.flashes as Fl[], (f) => `l,${q(f.x)},${q(f.y)},${q(f.z)},${q(f.r)},${q(f.dur)},${cols(f.colors)}`);
  keep(fx.glows as Gl[], (g) => `w,${q(g.x)},${q(g.y)},${q(g.r)},${q(g.dur)}`);

  const cam: Cam = { ox: 0, oy: 0, lift: null };
  const md5 = (lines: string[]): string => createHash('md5').update(lines.join('\n')).digest('hex');
  const top = FIGURE_SIZE.skeleton?.top ?? 22;

  // THE PLACE: a pack of six before him (as main.gd's words check gathers them), each moving as the scene says.
  type Mon = { id: number; x: number; y: number; dead: boolean; vx: number; vy: number };
  const H = { x: 18, y: 18 };
  const pack = (): Mon[] => [
    { id: 11, x: 20, y: 20, dead: false, vx: 0, vy: 0 },
    { id: 12, x: 21.1, y: 19.4, dead: false, vx: 0, vy: 0 },
    { id: 13, x: 19.3, y: 21.2, dead: false, vx: 0, vy: 0 },
    { id: 14, x: 22.4, y: 21.6, dead: false, vx: 0, vy: 0 },
    { id: 15, x: 20.6, y: 22.9, dead: false, vx: 0, vy: 0 },
    { id: 16, x: 25.5, y: 24.0, dead: false, vx: 0, vy: 0 },
  ];
  type Zone = Record<string, unknown> & { x: number; y: number; r: number; t: number; dur: number; kind: string };
  // A SCENE: its moments (`at` frames from its start: tellings to the five's looks, `v3`, or the eight's, `m8`; zones laid or
  // taken up; monsters killed or moved), how many frames, which are painted.
  type Act = { at: number; v3?: Record<string, unknown>[]; m8?: Record<string, unknown>[]; lay?: Zone[]; lift?: number[]; kill?: number[]; walk?: [number, number, number][]; clock?: number };
  type Scene = { name: string; frames: number; paint: number[]; acts: Act[]; hero?: { vx: number; vy: number } };
  const dt = 1 / 60;
  const scenes: Scene[] = [];
  const A = { x: 20, y: 20 };
  const along = (n: number, every: number): number[] => Array.from({ length: Math.floor(n / every) }, (_, i) => (i + 1) * every - 1);

  // --- VOLATILE'S FIVE ---
  for (const w of VMELD_IDS) {
    // ITS KILL'S EXPLOSION (a 'burst', style 'blast', with `meld`), A killed: as melds.gd explode tells it
    const r = w === 'demolition' ? 2.7 : 1.8;
    scenes.push({ name: `v3_blast_${w}`, frames: 170, paint: [0, 2, 5, 9, 14, 20, 28, 40, 60, 90, 130, 169], acts: [{ at: 0, kill: [11], v3: [{ t: 'burst', x: A.x, y: A.y, r, el: 'phys', style: 'blast', words: ['volatile'], meld: w }] }] });
    // ITS HIT, a Strike's (its `words` carrying it), and its Lunge's landing (big)
    scenes.push({ name: `v3_hit_${w}`, frames: 45, paint: [0, 3, 8, 16, 30, 44], acts: [{ at: 0, v3: [{ t: 'hit', x: A.x, y: A.y, amount: 20, crit: false, el: 'phys', onHero: false, heavy: false, words: [w, 'volatile'] }] }] });
    scenes.push({ name: `v3_land_${w}`, frames: 45, paint: [0, 3, 8, 16, 30, 44], acts: [{ at: 0, v3: [{ t: 'burst', x: A.x, y: A.y, r: 1.6, el: 'phys', style: 'land', words: [w, 'volatile'] }] }] });
    // ITS RUNE behind: written, waiting its own time, going off (a 'burst', style 'ruin'), and what it leaves (wakes.gd add_rune,
    // _shatter_freeze, _rune, _rune_twist, as the game's addRune, updateZones and runeTwist)
    const wait = VRUNE.wait[w];
    const rr = w === 'demolition' ? 3 : 2;
    const goes = Math.round(wait * 60);
    const rune: Zone = { kind: 'rune', x: A.x + 0.5, y: A.y - 0.3, r: rr, t: 0, dur: wait, element: 'phys', meld: w, skill: 0 };
    const acts: Act[] = [{ at: 0, lay: [rune], v3: [{ t: 'zone', kind: 'rune', x: rune.x, y: rune.y, r: rr, el: 'phys', meld: w }] }];
    const fz = Math.round(wait * VRUNE.freezeAt * 60);
    if (w === 'shatter') acts.push({ at: fz, v3: [{ t: 'volFx', meld: 'shatter', what: 'freeze', x: rune.x, y: rune.y, r: rr, ids: [11, 12, 13] }] });
    acts.push({ at: goes, lift: [0], v3: [{ t: 'burst', x: rune.x, y: rune.y, r: rr, el: 'phys', style: 'ruin', words: ['volatile'], meld: w }] });
    if (w === 'powderkeg') acts.push({ at: goes, lay: [{ kind: 'burn', x: rune.x, y: rune.y, r: rr * 0.7, t: 0, dur: 3, element: 'fire', meld: 'powderkeg', skill: 0 }] });
    if (w === 'rupture') acts.push({ at: goes, lay: [{ kind: 'venom', x: rune.x, y: rune.y, r: rr * 0.75, t: 0, dur: 5, element: 'phys', meld: 'rupture', skill: 0 }] });
    if (w === 'chainreaction') {
      // (a second of his runes, laid 0.3 s after, set off by the first: a link, and it goes off 0.12 s on)
      const two: Zone = { kind: 'rune', x: A.x + 2.6, y: A.y + 1.4, r: rr, t: 0, dur: wait, element: 'phys', meld: w, skill: 0 };
      acts.push({ at: 18, lay: [two], v3: [{ t: 'zone', kind: 'rune', x: two.x, y: two.y, r: rr, el: 'phys', meld: w }] });
      acts.push({ at: goes, v3: [{ t: 'volFx', meld: 'chainreaction', what: 'link', x0: rune.x, y0: rune.y, x1: two.x, y1: two.y }] });
      acts.push({ at: goes + 7, lift: [0], v3: [{ t: 'burst', x: two.x, y: two.y, r: rr, el: 'phys', style: 'ruin', words: ['volatile'], meld: w }] });
    }
    const n = goes + 200;
    scenes.push({ name: `v3_rune_${w}`, frames: n, paint: [...along(goes, 9), goes, goes + 2, goes + 6, goes + 12, goes + 20, goes + 30, goes + 45, goes + 70, goes + 110, goes + 160, n - 1], acts, hero: { vx: 0.004, vy: 0.002 } });
  }
  // THEIR MOMENTS OF THEIR OWN (`volFx`), as melds.gd tells them
  scenes.push({ name: 'v3_half_demolition', frames: 150, paint: [0, 3, 8, 14, 22, 36, 60, 100, 149], acts: [{ at: 0, v3: [{ t: 'volFx', meld: 'demolition', what: 'half', id: 11, x: A.x, y: A.y, r: 2.7 }] }, { at: 7, v3: [{ t: 'burst', x: A.x, y: A.y, r: 2.7, el: 'phys', style: 'blast', words: ['volatile'], meld: 'demolition' }] }] });
  for (const [what, word] of [['catch', 'powderkeg'], ['shard', 'shatter'], ['arc', 'chainreaction'], ['splash', 'rupture']] as const) {
    const to = [12, 13, 14];
    const at = [[21.1, 19.4], [19.3, 21.2], [22.4, 21.6]];
    scenes.push({
      name: `v3_${what}_${word}`,
      frames: 80,
      paint: [0, 2, 4, 7, 10, 14, 20, 30, 50, 79],
      acts: [{ at: 0, kill: [11], v3: to.map((id, i) => ({ t: 'volFx', meld: word, what, id, x0: A.x, y0: A.y, x1: at[i][0], y1: at[i][1] })), walk: [[12, 0.01, 0.0], [13, -0.005, 0.008]] }],
    });
  }

  // --- THE EIGHT ACROSS THE GROUPS, in front (k 1) and behind (k 0.5) ---
  for (const k of [1, 0.5]) {
    const kk = k === 1 ? 'front' : 'behind';
    const m8 = (frames: number, paint: number[], acts: Act[], name: string): void => {
      scenes.push({ name: `m8_${name}_${kk}`, frames, paint, acts });
    };
    m8(80, [0, 3, 8, 14, 20, 26, 33, 40, 55, 79], [{ at: 0, m8: [{ id: 'siphon', on: 11, k }], walk: [[11, 0.01, 0.004]] }, { at: 20, m8: [{ id: 'siphon', on: 11, k }] }], 'siphon');
    m8(110, [0, 3, 8, 14, 20, 30, 36, 42, 50, 60, 80, 109], [{ at: 0, kill: [11], m8: [{ id: 'cauterize', x: A.x, y: A.y, k }] }], 'cauterize');
    m8(45, [0, 2, 4, 7, 10, 15, 18, 24, 30, 44], [{ at: 0, m8: [{ id: 'forking', x: A.x, y: A.y, x1: 21.1, y1: 19.4, k }] }, { at: 9, m8: [{ id: 'forking', x: A.x, y: A.y, x1: 19.3, y1: 21.2, k }] }], 'forking');
    m8(80, [0, 2, 5, 8, 12, 18, 25, 35, 50, 79], [{ at: 0, m8: [{ id: 'shiver', on: 11, k }] }], 'shiver');
    m8(170, [0, 3, 7, 12, 20, 32, 46, 60, 90, 110, 130, 169], [{ at: 0, m8: [{ id: 'sunder', on: 11, secs: 1.6, k }], walk: [[11, 0.003, 0.002]] }, { at: 30, m8: [{ id: 'sunder', what: 'hit', on: 11 }] }, { at: 70, m8: [{ id: 'sunder', what: 'hit', on: 11 }] }], 'sunder');
    m8(
      380,
      [0, 4, 10, 18, 26, 50, 62, 70, 90, 125, 140, 180, 250, 300, 340, 379],
      [
        { at: 0, kill: [11], m8: [{ id: 'fervor', x: A.x, y: A.y, n: Math.ceil(k), most: 5, secs: 4, k }] },
        { at: 60, kill: [12], m8: [{ id: 'fervor', x: 21.1, y: 19.4, n: Math.ceil(2 * k), most: 5, secs: 4, k }] },
        { at: 120, kill: [13, 14], m8: [{ id: 'fervor', x: 19.3, y: 21.2, n: Math.ceil(3 * k), most: 5, secs: 4, k }, { id: 'fervor', x: 22.4, y: 21.6, n: 5, most: 5, secs: 4, k }] },
      ],
      'fervor',
    );
    m8(160, [0, 3, 8, 14, 19, 25, 40, 70, 100, 130, 159], [{ at: 0, m8: [{ id: 'rimeward', on: 12, secs: 2 * k, k }], walk: [[12, -0.004, 0.003]] }, { at: 50, m8: [{ id: 'rimeward', on: 12, secs: 2 * k, k }] }], 'rimeward');
    m8(
      130,
      [0, 4, 9, 15, 20, 23, 25, 28, 34, 44, 60, 90, 129],
      [{ at: 0, m8: [{ id: 'implode', x: A.x, y: A.y, reach: 3, r: 2.2 * (k < 1 ? 0.7 : 1), wait: 0.4, k }], walk: [[12, -0.04, 0.02], [13, 0.02, -0.04], [14, -0.05, -0.04]] }],
      'implode',
    );
  }
  // ALL AT ONCE: the five's and the eight's, a blast, a rune going off, an arc and a siphon together
  scenes.push({
    name: 'together',
    frames: 120,
    paint: [0, 6, 12, 20, 30, 45, 70, 119],
    acts: [
      { at: 0, kill: [11], v3: [{ t: 'burst', x: A.x, y: A.y, r: 1.8, el: 'fire', style: 'blast', words: ['volatile'], meld: 'powderkeg' }], m8: [{ id: 'cauterize', x: A.x, y: A.y, k: 1 }, { id: 'siphon', on: 12, k: 0.5 }], lay: [{ kind: 'rune', x: 22, y: 18, r: 2, t: 0, dur: 1.3, element: 'phys', meld: 'rupture', skill: 1 }] },
      { at: 8, v3: [{ t: 'volFx', meld: 'chainreaction', what: 'arc', id: 13, x0: A.x, y0: A.y, x1: 19.3, y1: 21.2 }], m8: [{ id: 'implode', x: 21.1, y: 19.4, reach: 3, r: 2.2, wait: 0.4, k: 1 }] },
      { at: 78, lift: [0], v3: [{ t: 'burst', x: 22, y: 18, r: 2, el: 'phys', style: 'ruin', words: ['volatile'], meld: 'rupture' }], lay: [{ kind: 'venom', x: 22, y: 18, r: 1.5, t: 0, dur: 5, element: 'phys', meld: 'rupture', skill: 1 }] },
    ],
    hero: { vx: 0.01, vy: 0 },
  });

  // RUN EACH: the game's own looks, on its own clock, from a fresh start
  const out: unknown[] = [];
  let lines = 0;
  for (const s of scenes) {
    clearV3();
    V3.clock = 0;
    const mons = pack();
    const hero = { x: H.x, y: H.y };
    const zones: Zone[] = [];
    const game = { level: 1, hero, monsters: [] as unknown[], zones } as unknown as Game;
    // (the game's monsters are the same things from frame to frame: what a look keeps of one sees where it is now)
    const objs = new Map(mons.map((m) => [m.id, { id: m.id, x: m.x, y: m.y, dead: false, kind: 'skeleton', champion: false, r: 0.32 }]));
    const view = (): void => {
      for (const m of mons) Object.assign(objs.get(m.id) as object, { x: m.x, y: m.y, dead: m.dead });
      (game as unknown as { monsters: unknown[] }).monsters = mons.filter((m) => !m.dead).map((m) => objs.get(m.id));
    };
    view();
    // (the five's clock joins the place, as tickV3 does on a new floor, before the scene's own chance begins)
    tickV3(0, game, fx as unknown as Fx);
    clearV3();
    V3.clock = 0;
    const m8 = new M8Fx();
    m8.game = game;
    seed = 7;
    rec.length = 0;
    (fx.particles as unknown[]).length = 0;
    (fx.rings as unknown[]).length = 0;
    (fx.flashes as unknown[]).length = 0;
    (fx.glows as unknown[]).length = 0;
    const frames: unknown[] = [];
    let clock = 0.37;
    for (let f = 0; f < s.frames; f++) {
      // (what moves: his and their walking; what the scene does this frame)
      if (s.hero) {
        hero.x += s.hero.vx;
        hero.y += s.hero.vy;
      }
      for (const a of s.acts) if (a.at === f) for (const [id, vx, vy] of a.walk ?? []) Object.assign(mons.find((m) => m.id === id) as Mon, { vx, vy });
      for (const m of mons) {
        m.x += m.vx;
        m.y += m.vy;
      }
      for (const z of zones) z.t += dt;
      for (const a of s.acts) {
        if (a.at !== f) continue;
        for (const id of a.kill ?? []) (mons.find((m) => m.id === id) as Mon).dead = true;
        for (const i of a.lift ?? []) zones.splice(i, 1);
        for (const z of a.lay ?? []) zones.push({ ...z });
      }
      for (let i = zones.length - 1; i >= 0; i--) if (zones[i].kind !== 'rune' && zones[i].t >= zones[i].dur) zones.splice(i, 1);
      view();
      // (the frame: the rules' tellings to the looks, then their clocks, then their pictures, as main.ts and render.ts have it)
      for (const a of s.acts) {
        if (a.at !== f) continue;
        if (a.v3) eventsV3(a.v3, game, fx as unknown as Fx);
        for (const e of a.m8 ?? []) m8.handle({ t: 'meld8', ...e });
      }
      m8.update(dt);
      tickV3(dt, game, fx as unknown as Fx);
      clock += dt;
      if (s.paint.includes(f)) {
        const layer = (paint: (g: CanvasRenderingContext2D) => void): string[] => {
          const g = new Rec();
          paint(g as unknown as CanvasRenderingContext2D);
          return g.lines;
        };
        const floor = layer((g) => floorV3(g, cam, clock, game, () => true));
        const air = layer((g) => airV3(g, cam, clock, game));
        const over = layer((g) => overV3(g, cam, clock));
        const ground8 = layer((g) => m8.drawGround(g, cam));
        const air8 = layer((g) => m8.drawAir(g, cam));
        const lights: string[] = [];
        lightsV3((x, y, r, a) => lights.push(`${q(x)},${q(y)},${q(r)},${q(a)}`), cam, game, clock);
        const figs: string[] = [];
        for (const m of (game as unknown as { monsters: Monster[] }).monsters) {
          const [ox, oy] = shiftV3(m);
          const tn = tintV3(m, clock);
          figs.push(`${m.id},${ox},${oy},${tn ? `${hex(tn[0])},${q(tn[1])}` : '-'}`);
        }
        const each: Record<string, string[]> = { floor, air, over, ground8, air8, lights, figs, fx: [...rec] };
        const sums: Record<string, { n: number; md5: string }> = {};
        for (const [k, v] of Object.entries(each)) {
          sums[k] = { n: v.length, md5: md5(v) };
          lines += v.length;
        }
        frames.push({ f, clock, sums });
        if (dump) writeFileSync(`${dump}/${s.name}_${f}.json`, JSON.stringify(each));
      }
    }
    out.push({ ...s, count: s.frames, top, half: FIGURE_SIZE.skeleton?.half ?? 9, hero0: H, pack: pack(), frames });
  }
  // (a number not whole is written as its exact bits, '~' and sixteen hex digits: Godot reads decimals back a little off, and a
  // clock that should come to exactly 4 would come to 3.9999…)
  const exact = (_k: string, v: unknown): unknown => {
    if (typeof v !== 'number' || Number.isInteger(v)) return v;
    const b = Buffer.alloc(8);
    b.writeDoubleLE(v);
    return `~${b.toString('hex')}`;
  };
  writeFileSync(`${OUT}/vmelds_check.json`, JSON.stringify({ dt, scenes: out }, exact));
  console.log(`check: ${scenes.length} scenes of the five's and the eight's looks run by the game's own painters, ${lines} lines kept`);
}
