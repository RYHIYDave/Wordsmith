// THE GODOT PORT: THE TEN MELDED WORDS' LOOKS (render/melds3.ts, the art chat's), for godot/scripts/fx_melds3.gd.
//   npx tsx tools/godot_melds3.ts          -> godot/assets/words/melds3.json: each melded word's colours (MELD_RAMP: the ten's,
//                                              Volatile's five's and the eight's stand-ins), what each is made of (MELD_OF), the
//                                              ten (MELD_IDS) and Volatile's five (VOLT_MELD_IDS), Eruption's full heat and the
//                                              hits to Thunder's clap (MELD_TUNE).
//   npx tsx tools/godot_melds3.ts check [dir]  -> also godot/assets/words/melds3_check.json (not kept in the repository):
//     THE PAINTERS: a spread of moments of every look (each patch's at its beats, small and big; the scars; the bolts, the sky's
//       bolts, the bombs and hail, the columns, the jaws at theirs; Blight's brand and rot, Thunder's stun, Eruption's heat, Thunder's
//       charge, the screen's flash), painted by the game's own floorM3, airM3 and overM3 on a canvas that keeps every dot (each
//       pixel's place, colour and strength) and every oval filled; and lightsM3's lights, tintM3, shiftM3, heroAlphaM3 and rotting.
//     THE TELLINGS: each of the rules' tellings the looks answer (a hit of each word, a whirl's turn, a slam, a leap's landing,
//       each twist's burst, each arc, each patch laid, Thunder's stun, a shove, a crush, a swing, a cast, HEAT), given to the
//       game's own eventsM3 with Math.random set to a known run of chances, and the clock (tickM3) after it; every call each makes
//       on the effects (each particle, ring, flash, light, flame, spike, freeze and kick, with its numbers), what it keeps, and
//       the three layers then painted. godot/checks/melds3_check.gd does the same with fx_melds3.gd, given the same chances, and
//       holds each against these. With `dir`, every pixel of each moment is written there too ({name}.json).
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gameSwitches } from './godot_switches';
import { FIGURE_SIZE } from '../src/art/bestiary';
import { MELD_TUNE } from '../src/game/melds';
import { MELD_IDS, MELD_OF, VOLT_MELD_IDS } from '../src/game/types';
import type { Game } from '../src/game/game';
import type { Cam, Fx } from '../src/render/fx';
import { M3, MELD_RAMP, airM3, clearM3, eventsM3, floorM3, heroAlphaM3, lightsM3, meldLookWords, meldOwnsEvent, overM3, ownsZone, rotting, shiftM3, tickM3, tintM3 } from '../src/render/melds3';

declare const process: { argv: string[] };
gameSwitches();
const OUT = 'godot/assets/words';
mkdirSync(OUT, { recursive: true });
writeFileSync(
  `${OUT}/melds3.json`,
  JSON.stringify({ ramp: MELD_RAMP, of: MELD_OF, ten: MELD_IDS, volt: VOLT_MELD_IDS, heatFull: MELD_TUNE.eruption.heat, clapEvery: MELD_TUNE.thunder.every }, null, 1),
);
console.log(`melds3.json: ${Object.keys(MELD_RAMP).length} melded words' colours`);

if (process.argv[2] === 'check') {
  const dump = process.argv[3] ?? '';
  if (dump) mkdirSync(dump, { recursive: true });
  const SK = FIGURE_SIZE.skeleton;
  const q = (v: number): number => Math.round(v * 1000);
  const key = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(3));
  const hex = (c: string): string => c.toLowerCase().replace('#', '');
  // THE GAME'S CANVAS, KEPT: the last colour and strength laid on each pixel; each oval filled, in order; a fill of the whole
  // screen (the flash) as one.
  class Keep {
    private fs = '#000000';
    private ga = 1;
    px = new Map<string, string>();
    ovals: string[] = [];
    private path: number[] | null = null;
    canvas = { width: 640, height: 360 };
    set fillStyle(v: string) {
      this.fs = String(v).toLowerCase();
    }
    get fillStyle(): string {
      return this.fs;
    }
    set globalAlpha(v: number) {
      if (v >= 0 && v <= 1) this.ga = v;
    }
    get globalAlpha(): number {
      return this.ga;
    }
    fillRect(x: number, y: number, w: number, h: number): void {
      if (w * h > 50000) {
        this.ovals.push(`screen,${hex(this.fs)}@${q(this.ga)}`);
        return;
      }
      if (w < 0) {
        x += w;
        w = -w;
      }
      if (h < 0) {
        y += h;
        h = -h;
      }
      const v = `${hex(this.fs)}@${q(this.ga)}`;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px.set(`${key(x + i)},${key(y + j)}`, v);
    }
    beginPath(): void {
      this.path = null;
    }
    ellipse(cx: number, cy: number, rx: number, ry: number): void {
      this.path = [cx, cy, rx, ry];
    }
    fill(): void {
      if (this.path) this.ovals.push(`${q(this.path[0])},${q(this.path[1])},${q(this.path[2])},${q(this.path[3])},${hex(this.fs)}@${q(this.ga)}`);
    }
  }
  const sumOf = (k: Keep): { n: number; md5: string; ovals: number; omd5: string } => {
    const lines = [...k.px.entries()].map(([p, c]) => `${p},${c}`).sort();
    return { n: lines.length, md5: createHash('md5').update(lines.join('\n')).digest('hex'), ovals: k.ovals.length, omd5: createHash('md5').update(k.ovals.join('\n')).digest('hex') };
  };
  const cam: Cam = { ox: 0, oy: 0, lift: null };

  // THE RULES' STATE, as fx_melds3.gd's `view` has it (the game's names), and a Game made of it.
  type Mon = { id: number; x: number; y: number; dead: boolean; seen: boolean; stunT: number; poisonT: number; chillT: number; frozenT: number; biteDps: number; blightT: number; life: number; maxLife: number };
  type Zone = { x: number; y: number; r: number; t: number; dur: number; kind: string; meld?: string; look?: string; hostile?: boolean; m3seed?: number };
  type View = { hero: { x: number; y: number; meld: string[]; meldBehind: string[]; heat: number[]; hits: number[] }; zones: Zone[]; monsters: Mon[]; time: number };
  const H = { x: 20, y: 20 };
  const hero = (more: Partial<View['hero']> = {}): View['hero'] => ({ x: H.x, y: H.y, meld: ['', '', ''], meldBehind: ['', '', ''], heat: [0, 0, 0], hits: [0, 0, 0], ...more });
  const mon = (id: number, x: number, y: number, more: Partial<Mon> = {}): Mon => ({ id, x, y, dead: false, seen: true, stunT: 0, poisonT: 0, chillT: 0, frozenT: 0, biteDps: 0, blightT: 0, life: 30, maxLife: 40, ...more });
  const zone = (x: number, y: number, r: number, t: number, dur: number, kind: string, more: Partial<Zone> = {}): Zone => ({ x, y, r, t, dur, kind, ...more });
  const gameOf = (v: View): Game => {
    const zones = v.zones.map((z) => {
      const o: Record<string, unknown> = { x: z.x, y: z.y, r: z.r, t: z.t, dur: z.dur, kind: z.kind, hostile: !!z.hostile };
      if (z.meld) o.meld = z.meld;
      if (z.look) o.look = z.look;
      return o;
    });
    return {
      level: 1,
      time: v.time,
      hero: { x: v.hero.x, y: v.hero.y, skills: [0, 1, 2].map((i) => ({ r: { meld: v.hero.meld[i] || undefined, meldBehind: v.hero.meldBehind[i] || undefined } })) },
      meldHeat: v.hero.heat,
      meldHits: v.hero.hits,
      zones,
      monsters: v.monsters.map((m) => ({ ...m, kind: 'skeleton', champion: false })),
      projectiles: [],
    } as unknown as Game;
  };
  // (the view as written for the check: a monster's figure's top and half, as fx_melds3.gd reads them)
  const viewOut = (v: View): unknown => ({ ...v, monsters: v.monsters.map((m) => ({ ...m, key: m.id, top: SK.top, half: SK.half })) });

  // THE CHANCES: a known run (an LCG), the same in fx_melds3.gd (its `_seq`).
  let seq = 1;
  const lcg = (): number => {
    seq = (seq * 1664525 + 1013904223) % 4294967296;
    return seq / 4294967296;
  };
  const realRandom = Math.random;

  // ---- THE PAINTERS ----
  // What M3 keeps, laid by hand: each list's things in the game's own form (C: a word's colours, by its name).
  type Lay = {
    bolts?: { pts: number[]; t: number; dur: number; C: string; w: number; kind: string; z: number }[];
    skies?: { x: number; y: number; top: number; offs: number[]; forks: { at: number; offs: number[] }[]; t: number; dur: number; C: string; w: number }[];
    bombs?: { x0: number; y0: number; x1: number; y1: number; t: number; dur: number; h: number; word: string }[];
    scars?: { x: number; y: number; r: number; t: number; dur: number; kind: string; seed: number; lines: number[][]; word: string }[];
    columns?: { x: number; y: number; t: number; dur: number; h: number; w: number; word: string }[];
    clamps?: { id: number; t: number; dur: number; big: boolean }[];
    slides?: { id: number; x0: number; y0: number; x1: number; y1: number; t: number; dur: number; frozen: boolean }[];
    marks?: Record<number, { thunder: number; thunder0: number; blight: boolean; crush: number; bite: number }>;
    flash?: { t: number; dur: number; color: string; a: number };
    heat?: number;
    claps?: number;
    hidden?: boolean;
  };
  type Scene = { name: string; clock: number; view: View; lay: Lay };
  const scenes: Scene[] = [];
  const S = { x: H.x + 1.6, y: H.y + 0.2 };
  const plain = (zones: Zone[] = [], monsters: Mon[] = []): View => ({ hero: hero(), zones, monsters, time: 5 });
  let seedN = 1000;
  // EACH PATCH'S LOOK, small and big, at its beats: newly laid, at work, going
  const patches: [string, string, string][] = [
    ['molten', 'burn', 'eruption'], ['snow', 'ice', 'avalanche'], ['thunderhead', 'storm', 'thunder'], ['rot', 'venom', 'blight'], ['boil', 'steam', 'scald'],
    ['wildfire', 'burn', 'wildfire'], ['smoulder', 'burn', 'fumes'], ['fumes', 'venom', 'fumes'], ['hail', 'storm', 'hailstorm'], ['toxicice', 'ice', 'frostbite'],
    ['coldmist', 'venom', 'frostbite'], ['greenstorm', 'storm', 'contagion'], ['crackle', 'venom', 'contagion'],
  ];
  for (const [look, kind, word] of patches) {
    for (const [r, t, dur] of [[1.0, 0.08, 4], [1.0, 1.7, 4], [2.2, 0.3, 4], [2.2, 2.2, 4], [2.2, 3.8, 4]] as const) {
      // (a hostile one, or one laid by a melded word in front: `look`; else `meld`, behind)
      const z = zone(S.x, S.y, r, t, dur, kind, look === 'molten' && r < 1.2 ? { look: word, m3seed: seedN++ } : { meld: word, m3seed: seedN++ });
      scenes.push({ name: `patch_${look}_r${r}_t${t}`, clock: 3.1 + t * 1.37, view: plain([z]), lay: {} });
    }
  }
  // the small patches a shot leaves along its way share one cloud between those near each other; the hero in a steam cloud
  scenes.push({ name: 'patch_shared_small', clock: 7.7, view: plain([zone(S.x, S.y, 0.8, 1, 4, 'storm', { meld: 'thunder', m3seed: 77 }), zone(S.x + 0.6, S.y + 0.3, 0.8, 1.2, 4, 'storm', { meld: 'thunder', m3seed: 78 }), zone(S.x + 3, S.y, 0.8, 1.3, 4, 'venom', { meld: 'blight', m3seed: 79 })]), lay: {} });
  scenes.push({ name: 'patch_boil_on_him', clock: 9.4, view: plain([zone(H.x + 0.3, H.y, 2.0, 1.5, 4, 'steam', { meld: 'scald', m3seed: 81 })]), lay: { hidden: true } });
  scenes.push({ name: 'patch_fog_round_him', clock: 4.2, view: plain([zone(H.x + 0.2, H.y + 0.1, 2.0, 1.5, 5, 'venom', { meld: 'fumes', m3seed: 82 }), zone(H.x - 0.4, H.y + 0.8, 2.0, 1.5, 5, 'venom', { meld: 'frostbite', m3seed: 83 })]), lay: {} });
  // THE SCARS: a burnt star hot, cooling, going; a fissure; a furrow of snow
  const star = { x: S.x, y: S.y, r: 1.3, dur: 2.4, kind: 'star', seed: 4321, word: 'thunder', lines: [[0.1, 0.02, 0.5, 0.1, 0.9, 0.05, 1.2, 0.2], [-0.05, 0.1, -0.3, 0.6, -0.4, 0.9, -0.6, 1.1], [-0.1, -0.05, -0.6, -0.3, -0.9, -0.2, -1.1, -0.5]] };
  for (const t of [0.1, 0.5, 1.2, 2.1]) scenes.push({ name: `scar_star_t${t}`, clock: 2 + t, view: plain(), lay: { scars: [{ ...star, t }] } });
  const fissure = { ...star, kind: 'fissure', word: 'eruption', r: 1.9, dur: 3.2, seed: 99 };
  for (const t of [0.2, 1.0, 2.9]) scenes.push({ name: `scar_fissure_t${t}`, clock: 3 + t, view: plain(), lay: { scars: [{ ...fissure, t }] } });
  for (const t of [0.1, 2.0]) scenes.push({ name: `scar_furrow_t${t}`, clock: 4 + t, view: plain(), lay: { scars: [{ x: S.x, y: S.y, r: 1.2, t, dur: 2.4, kind: 'furrow', seed: 5, word: 'avalanche', lines: [[1.1, -0.4]] }] } });
  // BOLTS along the ground (plain, ice, fire), at their beats; the sky's bolts; their forks
  const pts = [S.x, S.y, S.x + 0.4, S.y + 0.15, S.x + 0.8, S.y - 0.1, S.x + 1.3, S.y + 0.2];
  for (const [kind, word, w] of [['plain', 'thunder', 2], ['ice', 'hailstorm', 2], ['fire', 'wildfire', 1]] as const) {
    for (const k of [0.1, 0.35, 0.5, 0.75]) scenes.push({ name: `bolt_${kind}_k${k}`, clock: 5, view: plain(), lay: { bolts: [{ pts, t: k * 0.2, dur: 0.2, C: word, w, kind, z: 10 }] } });
  }
  const sky = { x: S.x, y: S.y, top: 200, offs: [0, -4.2, 3.1, 6.6, -2.2, 1.4, 5.5, -3.3, 2.0, 0.4, -1.7], forks: [{ at: 3, offs: [9.2, 15.1, 22.8] }, { at: 7, offs: [-8.1, -13.0, -19.5, -24.4] }], C: 'thunder', w: 3 };
  for (const k of [0.1, 0.4, 0.55, 0.8]) scenes.push({ name: `sky_k${k}`, clock: 5, view: plain(), lay: { skies: [{ ...sky, t: k * 0.3, dur: 0.3 }] } });
  // BOMBS and HAIL on their way; COLUMNS of lava and steam at their beats
  for (const k of [0.1, 0.5, 0.9]) {
    scenes.push({ name: `bomb_k${k}`, clock: 5, view: plain(), lay: { bombs: [{ x0: S.x, y0: S.y, x1: S.x + 1.5, y1: S.y + 0.6, t: k * 0.7, dur: 0.7, h: 90, word: 'eruption' }, { x0: S.x + 0.05, y0: S.y - 0.05, x1: S.x, y1: S.y, t: k * 0.2, dur: 0.2, h: 60, word: 'hailstorm' }] } });
  }
  for (const [word, h, w, dur] of [['eruption', 110, 6, 0.6], ['scald', 34, 2, 0.32]] as const) {
    for (const k of [0.1, 0.4, 0.7, 0.95]) scenes.push({ name: `column_${word}_k${k}`, clock: 5, view: plain(), lay: { columns: [{ x: S.x, y: S.y, t: k * dur, dur, h, w, word }] } });
  }
  // FROSTBITE'S JAWS on a monster, big and small, at their beats; and its bite's tint
  const m7 = (more: Partial<Mon> = {}): Mon => mon(7, S.x, S.y, more);
  for (const [k, big] of [[0.1, true], [0.45, true], [0.8, true], [0.3, false]] as const) {
    scenes.push({ name: `jaws_k${k}${big ? '' : '_small'}`, clock: 6, view: plain([], [m7({ chillT: 1, biteDps: 4 })]), lay: { clamps: [{ id: 7, t: k * (big ? 0.42 : 0.24), dur: big ? 0.42 : 0.24, big }] } });
  }
  // AVALANCHE'S SHOVE: the picture slid (and what is over its head with it); its crush's tint
  for (const k of [0.1, 0.6]) scenes.push({ name: `slide_k${k}`, clock: 6, view: plain([], [m7({ stunT: 1 })]), lay: { slides: [{ id: 7, x0: S.x - 1.2, y0: S.y - 0.3, x1: S.x, y1: S.y, t: k * 0.27, dur: 0.27, frozen: false }], marks: { 7: { thunder: 0.4, thunder0: 0.2, blight: false, crush: 9, bite: -1 } } } });
  scenes.push({ name: 'crush_tint', clock: 6.2, view: plain([], [m7({ chillT: 1 })]), lay: { marks: { 7: { thunder: 0, thunder0: 0, blight: false, crush: 0.05, bite: -1 } } } });
  // THUNDER'S STUN over the head, as it begins and at work
  for (const [t0, clock] of [[0.04, 6.03], [0.5, 7.71]] as const) scenes.push({ name: `stun_t${t0}`, clock, view: plain([], [m7({ stunT: 0.3 })]), lay: { marks: { 7: { thunder: 0.3, thunder0: t0, blight: false, crush: 9, bite: -1 } } } });
  // BLIGHT: its brand under one it touched, its rot on one it struck, whole and nearly dead
  for (const [life, bt] of [[38, 0.2], [6, 3]] as const) scenes.push({ name: `blight_life${life}`, clock: 8.3, view: plain([], [m7({ poisonT: 2, blightT: bt, life })]), lay: { marks: { 7: { thunder: 0, thunder0: 0, blight: true, crush: 9, bite: -1 } } } });
  // ERUPTION'S HEAT at his feet and circling him (2, and full); THUNDER'S CHARGE (1, and one short of the clap)
  for (const n of [2, 5]) scenes.push({ name: `heat_${n}`, clock: 3.37, view: { ...plain(), hero: hero({ meldBehind: ['eruption', '', ''], heat: [n, 0, 0] }) }, lay: { heat: n } });
  for (const n of [1, 3]) scenes.push({ name: `charge_${n}`, clock: 4.91, view: { ...plain(), hero: hero({ meldBehind: ['', 'thunder', ''], hits: [0, n, 0] }) }, lay: { claps: n } });
  // THE SCREEN'S FLASH
  scenes.push({ name: 'screen_flash', clock: 5, view: plain(), lay: { flash: { t: 0.02, dur: 0.07, color: MELD_RAMP.thunder[4], a: 0.24 } } });
  // ALL AT ONCE
  scenes.push({
    name: 'together',
    clock: 11.11,
    view: { hero: hero({ meldBehind: ['eruption', 'thunder', ''], heat: [3, 0, 0], hits: [0, 2, 0] }), zones: [zone(S.x, S.y + 1, 1.6, 1.1, 4, 'burn', { meld: 'wildfire', m3seed: 3 }), zone(H.x - 2, H.y + 1, 1.4, 2, 5, 'venom', { meld: 'contagion', m3seed: 4 }), zone(S.x + 2, S.y - 1, 2.0, 0.5, 4, 'storm', { meld: 'hailstorm', m3seed: 5 })], monsters: [m7({ poisonT: 2, blightT: 1, stunT: 0.5, life: 15 }), mon(8, S.x + 1, S.y + 1, { chillT: 1, biteDps: 3 })], time: 9 },
    lay: { heat: 3, claps: 2, marks: { 7: { thunder: 0.5, thunder0: 0.3, blight: true, crush: 9, bite: -1 } }, clamps: [{ id: 8, t: 0.1, dur: 0.24, big: false }], scars: [{ ...star, t: 0.3 }], columns: [{ x: S.x + 1, y: S.y + 1, t: 0.1, dur: 0.32, h: 34, w: 2, word: 'scald' }] },
  });

  const lay = (l: Lay): void => {
    clearM3();
    const C = (w: string): readonly string[] => MELD_RAMP[w as keyof typeof MELD_RAMP];
    for (const b of l.bolts ?? []) M3.bolts.push({ ...b, C: C(b.C), kind: b.kind as 'plain' });
    for (const s of l.skies ?? []) M3.skies.push({ ...s, C: C(s.C) });
    for (const b of l.bombs ?? []) M3.bombs.push({ ...b, word: b.word as 'eruption' });
    for (const s of l.scars ?? []) M3.scars.push({ ...s, kind: s.kind as 'star', word: s.word as 'thunder' });
    for (const c of l.columns ?? []) M3.columns.push({ ...c, word: c.word as 'eruption' });
    for (const c of l.clamps ?? []) M3.clamps.push({ ...c });
    for (const s of l.slides ?? []) M3.slides.push({ ...s });
    for (const [id, k] of Object.entries(l.marks ?? {})) M3.marks.set(Number(id), { ...k });
    if (l.flash) M3.flash = { ...l.flash };
    M3.heat = l.heat ?? 0;
    M3.claps = l.claps ?? -1;
    M3.hidden = !!l.hidden;
  };
  // (the painters, and what the renderer asks besides: lights, a tint and a slide for each monster, how solid he is, the rot)
  const paint = (game: Game, t: number, name: string): Record<string, unknown> => {
    const floor = new Keep();
    const air = new Keep();
    const over = new Keep();
    floorM3(floor as unknown as CanvasRenderingContext2D, cam, t, game, () => true);
    airM3(air as unknown as CanvasRenderingContext2D, cam, t, game);
    overM3(over as unknown as CanvasRenderingContext2D, cam, t);
    const spots: number[][] = [];
    lightsM3((x, y, r, a) => spots.push([x, y, r, a]), cam, game, t);
    const mons = game.monsters.map((m) => {
      const tn = tintM3(m, t);
      return { tint: tn ? [hex(tn[0]), tn[1]] : null, shift: shiftM3(m), rots: rotting(m) };
    });
    if (dump) writeFileSync(`${dump}/${name}.json`, JSON.stringify({ floor: Object.fromEntries(floor.px), air: Object.fromEntries(air.px), over: Object.fromEntries(over.px), ovals: { floor: floor.ovals, air: air.ovals, over: over.ovals } }));
    return { floor: sumOf(floor), air: sumOf(air), over: sumOf(over), spots, mons, alpha: heroAlphaM3(t) };
  };
  // (the first tick sets which level M3 is of: it forgets everything as a level begins)
  tickM3(0, gameOf(plain()), { decals: [], room: () => 1, particles: [], rings: [], flashes: [], glows: [], spikes: [] } as unknown as Fx);
  const out: unknown[] = [];
  for (const s of scenes) {
    lay(s.lay);
    const game = gameOf(s.view);
    // (each patch's shape: its seed what Math.random gives as the painter first meets it)
    const seeds = s.view.zones.filter((z) => ownsZone(game.zones[s.view.zones.indexOf(z)])).map((z) => z.m3seed ?? 0);
    Math.random = () => ((seeds.shift() ?? 0) + 0.5) / 1e6;
    const p = paint(game, s.clock, s.name);
    Math.random = realRandom;
    out.push({ name: s.name, clock: s.clock, view: viewOut(s.view), lay: s.lay, ...p });
  }

  // ---- THE TELLINGS ----
  // The effects as melds3.ts uses them, each call written down with its numbers.
  type Call = (string | number | boolean | string[])[];
  const stubOf = (calls: Call[], room: number, decals: { x: number; y: number; kind: string }[]): Fx => {
    const ramp = (r: readonly string[] | undefined): string[] => (r ? r.map(hex) : []);
    return {
      particles: {
        length: 0,
        push(p: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; color: string; size: number; grav: number; ramp?: readonly string[]; streak?: number }) {
          calls.push(['add', p.x, p.y, p.z, p.vx, p.vy, p.vz, p.life, hex(p.color), p.size, p.grav, ramp(p.ramp), p.streak ?? 0]);
          this.length++;
        },
      },
      rings: {
        push(r: { x: number; y: number; r: number; dur: number; colors: readonly string[]; fill: boolean; heavy?: boolean; closing?: boolean; jag?: boolean; delay?: number; double?: boolean; swirl?: boolean }) {
          calls.push(['ring', r.x, r.y, r.r, r.dur, ramp(r.colors), !!r.fill, !!r.heavy, !!r.closing, !!r.jag, r.delay ?? 0, !!r.double, !!r.swirl]);
        },
      },
      flashes: { push: (f: { x: number; y: number; z: number; r: number; dur: number; colors: readonly string[] }) => calls.push(['flash', f.x, f.y, f.z, f.r, f.dur, ramp(f.colors)]) },
      glows: { length: 0, push: (g: { x: number; y: number; r: number; dur: number }) => calls.push(['glow', g.x, g.y, g.r, g.dur]) },
      spikes: { push: (s: { x0: number; y0: number; x1: number; y1: number; tall: number; dur: number }) => calls.push(['spike', s.x0, s.y0, s.x1, s.y1, s.tall, s.dur]) },
      decals,
      hold: (s: number) => calls.push(['hold', s]),
      get shake() {
        return 0;
      },
      set shake(v: number) {
        calls.push(['kick', v]);
      },
      flames: (x: number, y: number, r: number, n: number, up = 1) => calls.push(['flames', x, y, r, n, up]),
      room: () => room,
    } as unknown as Fx;
  };
  // What M3 keeps, written out (as fx_melds3.gd's `kept`).
  const C2 = (c: readonly string[]): string => hex(c[3]);
  const kept = (): unknown => ({
    bolts: M3.bolts.map((b) => [b.pts, b.t, b.dur, C2(b.C), b.w, b.kind, b.z]),
    skies: M3.skies.map((s) => [s.x, s.y, s.top, s.offs, s.forks.map((f) => [f.at, f.offs]), s.t, s.dur, C2(s.C), s.w]),
    bombs: M3.bombs.map((b) => [b.x0, b.y0, b.x1, b.y1, b.t, b.dur, b.h, b.word]),
    scars: M3.scars.map((s) => [s.x, s.y, s.r, s.t, s.dur, s.kind, s.seed, s.lines, s.word]),
    columns: M3.columns.map((c) => [c.x, c.y, c.t, c.dur, c.h, c.w, c.word]),
    clamps: M3.clamps.map((c) => [c.id, c.t, c.dur, c.big]),
    slides: M3.slides.map((s) => [s.id, s.x0, s.y0, s.x1, s.y1, s.t, s.dur, s.frozen]),
    marks: [...M3.marks.entries()].map(([id, k]) => [id, k.thunder, k.thunder0, k.blight, k.crush, k.bite]),
    flash: [M3.flash.t, M3.flash.dur, hex(M3.flash.color), M3.flash.a],
    heat: M3.heat,
    claps: M3.claps,
    hidden: M3.hidden,
    later: M3.later.map((l) => l.t),
  });
  type Case = { name: string; view: View; e: Record<string, unknown> | null; ticks: number[]; room?: number; clock: number; decals?: { x: number; y: number; kind: string }[] };
  const cases: Case[] = [];
  const T = { x: S.x, y: S.y };
  const near = (): Mon[] => [mon(5, T.x, T.y), mon(6, T.x + 1.4, T.y - 0.6)];
  const after = [0.03, 0.05, 0.08, 0.12, 0.2, 0.3];
  // a hit of each of the ten
  for (const w of MELD_IDS) {
    cases.push({ name: `hit_${w}`, view: { ...plain([], near()), hero: hero({ meld: [w, '', ''] }) }, e: { t: 'hit', x: T.x, y: T.y, amount: 9, el: 'fire', words: [w, ...MELD_OF[w]] }, ticks: after, clock: 2.2 });
  }
  // an area ability carrying each: a whirl's turn (small), a slam's blast (big), a leap's landing; an echo's turn (none)
  for (const w of MELD_IDS) {
    cases.push({ name: `whirl_${w}`, view: plain([], near()), e: { t: 'burst', x: H.x, y: H.y, r: 2, el: 'phys', style: 'whirl', words: [w, ...MELD_OF[w]] }, ticks: after, clock: 3.1 });
    cases.push({ name: `slam_${w}`, view: plain([], near()), e: { t: 'burst', x: T.x, y: T.y, r: 2.4, el: 'phys', style: 'slam', words: [w, ...MELD_OF[w]] }, ticks: [...after, 0.4, 0.5], clock: 4.4 });
  }
  cases.push({ name: 'land_eruption', view: plain([], near()), e: { t: 'burst', x: T.x, y: T.y, r: 1.6, el: 'phys', style: 'land', words: ['eruption', 'power', 'fire'] }, ticks: after, clock: 4.0 });
  cases.push({ name: 'whirl_echo', view: plain([], near()), e: { t: 'burst', x: H.x, y: H.y, r: 2, el: 'phys', style: 'whirl', words: ['thunder', 'power', 'lightning'], echo: true }, ticks: [0.05], clock: 3.0 });
  cases.push({ name: 'splash_shock', view: plain([], near()), e: { t: 'burst', x: T.x, y: T.y, r: 1.2, el: 'phys', style: 'shock', words: ['blight', 'power', 'poison'] }, ticks: [0.05], clock: 3.0 });
  // the twists' bursts
  cases.push({ name: 'burst_scald', view: plain([], near()), e: { t: 'burst', x: T.x, y: T.y, r: 0.9, el: 'frost', style: 'blast', meld: 'scald' }, ticks: after, clock: 2.5 });
  cases.push({ name: 'burst_eruption', view: plain([], near()), e: { t: 'burst', x: T.x, y: T.y, r: 2, el: 'fire', style: 'blast', meld: 'eruption' }, ticks: [...after, 0.4, 0.5, 0.6], clock: 2.7 });
  cases.push({ name: 'burst_thunder', view: plain([], near()), e: { t: 'burst', x: H.x, y: H.y, r: 2.4, el: 'lightning', style: 'blast', meld: 'thunder' }, ticks: [0.01, 0.02, 0.03, 0.05, 0.1, 0.2], clock: 3.3 });
  cases.push({ name: 'burst_fumes', view: plain([], near()), e: { t: 'burst', x: T.x, y: T.y, r: 1.5, el: 'fire', style: 'blast', meld: 'fumes' }, ticks: [0.1, 0.2, 0.3, 0.4], clock: 3.6 });
  cases.push({ name: 'burst_implode', view: plain([], near()), e: { t: 'burst', x: T.x, y: T.y, r: 2.2, el: 'phys', style: 'shock', meld: 'implode' }, ticks: [0.05], clock: 3.6 });
  // the arcs: Thunder's one great bolt (and from its thunderhead), the sky's first bolt of the three arcing words, their arcs; Forking's
  cases.push({ name: 'arc_thunder', view: plain([], near()), e: { t: 'arc', x0: T.x, y0: T.y, x1: T.x, y1: T.y, sky: true, meld: 'thunder' }, ticks: [0.03, 0.05, 0.08, 0.1, 0.2], clock: 2.1 });
  const tz = zone(T.x - 1, T.y, 2, 1, 4, 'storm', { meld: 'thunder' });
  cases.push({ name: 'arc_thunder_zone', view: plain([tz], near()), e: { t: 'arc', x0: tz.x, y0: tz.y, x1: T.x, y1: T.y, sky: true, meld: 'thunder' }, ticks: [0.05, 0.1], clock: 2.4 });
  for (const w of ['wildfire', 'hailstorm', 'contagion']) {
    cases.push({ name: `arc_sky_${w}`, view: plain([], near()), e: { t: 'arc', x0: T.x, y0: T.y, x1: T.x, y1: T.y, sky: true, meld: w }, ticks: [0.05, 0.1, 0.2], clock: 2.6 });
    cases.push({ name: `arc_${w}`, view: plain([], near()), e: { t: 'arc', x0: T.x, y0: T.y, x1: T.x + 1.4, y1: T.y - 0.6, meld: w }, ticks: [0.02, 0.05, 0.08, 0.12, 0.2], clock: 2.9 });
  }
  const hz = zone(T.x - 1, T.y, 2, 1, 4, 'storm', { meld: 'hailstorm' });
  cases.push({ name: 'arc_sky_hailstorm_zone', view: plain([hz], near()), e: { t: 'arc', x0: hz.x, y0: hz.y, x1: T.x, y1: T.y, sky: true, meld: 'hailstorm' }, ticks: [0.05, 0.1], clock: 2.8 });
  cases.push({ name: 'arc_forking', view: plain([], near()), e: { t: 'arc', x0: T.x, y0: T.y, x1: T.x + 1.4, y1: T.y - 0.6, meld: 'forking' }, ticks: [0.05], clock: 2.0 });
  // each patch laid (small and big), as the telling says it
  for (const [look, kind, word] of patches) {
    for (const r of [0.8, 2.0]) cases.push({ name: `laid_${look}_r${r}`, view: plain([], near()), e: { t: 'zone', kind, x: T.x, y: T.y, r, el: 'phys', meld: word }, ticks: [0.05, 0.1, 0.2], room: 0.7, clock: 2.2 });
  }
  cases.push({ name: 'laid_volatile_rune', view: plain(), e: { t: 'zone', kind: 'rune', x: T.x, y: T.y, r: 2, el: 'fire', meld: 'powderkeg' }, ticks: [0.05], clock: 2.0 });
  // Thunder's stun; a shove (and one stopped short, frozen); a crush, and one too soon after
  cases.push({ name: 'stun_thunder', view: plain([], [mon(5, T.x, T.y, { stunT: 0.5 })]), e: { t: 'stun', id: 5, x: T.x, y: T.y, secs: 0.5, meld: 'thunder' }, ticks: [0.05, 0.1, 0.2], clock: 3.3 });
  cases.push({ name: 'shove', view: plain([], [mon(5, T.x + 1.2, T.y, {})]), e: { t: 'meldFx', what: 'shove', id: 5, x: T.x, y: T.y, x1: T.x + 1.2, y1: T.y }, ticks: [0.05, 0.1, 0.2], clock: 3.5 });
  cases.push({ name: 'shove_frozen', view: plain([], [mon(5, T.x + 0.5, T.y, { frozenT: 2 })]), e: { t: 'meldFx', what: 'shove', id: 5, x: T.x, y: T.y, x1: T.x + 0.5, y1: T.y, frozen: true }, ticks: [0.1, 0.15, 0.2], clock: 3.6 });
  cases.push({ name: 'crush', view: plain([], [mon(5, T.x, T.y, { chillT: 1 })]), e: { t: 'meldFx', what: 'crush', id: 5, x: T.x, y: T.y, x1: T.x, y1: T.y }, ticks: [0.05, 0.08], clock: 3.7 });
  // a swing and a cast with each word in front
  for (const w of MELD_IDS) {
    cases.push({ name: `swing_${w}`, view: plain(), e: { t: 'swing', x: H.x, y: H.y, dx: 0.8, dy: 0.6, reach: 1.4, el: 'phys', words: [w, ...MELD_OF[w]], n: 0 }, ticks: [0.05], clock: 2.0 });
  }
  cases.push({ name: 'cast_frostbite', view: plain(), e: { t: 'cast', x: H.x, y: H.y, dx: 0.6, dy: 0.8, kind: 'leap', el: 'frost', words: ['frostbite', 'frost', 'poison'], behind: [] }, ticks: [0.05], clock: 2.0 });
  cases.push({ name: 'swing_second', view: plain(), e: { t: 'swing', x: H.x, y: H.y, dx: 0.8, dy: 0.6, reach: 1.4, el: 'phys', words: ['eruption', 'power', 'fire'], n: 1 }, ticks: [0.05], clock: 2.0 });
  cases.push({ name: 'text_heat', view: plain(), e: { t: 'text', x: H.x, y: H.y, text: 'HEAT', color: '#ffb43a' }, ticks: [0.05], clock: 2.0 });
  // THE CLOCK: every patch's look at work at once, a full heat, monsters bitten and rotting, a scorch under burning ground;
  // thirty frames
  {
    const zs = patches.map(([, kind, word], i) => zone(10 + (i % 5) * 4, 10 + Math.floor(i / 5) * 4, i % 2 ? 1.0 : 2.0, 0.5, 6, kind, { meld: word }));
    const mons = [mon(5, T.x, T.y, { chillT: 2, biteDps: 3 }), mon(6, T.x + 1, T.y, { poisonT: 3, blightT: 1, life: 10 })];
    cases.push({ name: 'clock', view: { hero: hero({ meldBehind: ['eruption', '', 'thunder'], heat: [5, 0, 0], hits: [0, 0, 2] }), zones: zs, monsters: mons, time: 4.1 }, e: null, ticks: Array.from({ length: 30 }, () => 1 / 30), clock: 6.6, decals: [{ x: 10.2, y: 10.1, kind: 'scorch' }, { x: 30, y: 30, kind: 'scorch' }, { x: 14, y: 10, kind: 'rime' }] });
    // (and the bites marked before, so the next half second's is seen to come; the blight mark from a Blight hit)
  }
  const evOut: unknown[] = [];
  for (const c of cases) {
    clearM3();
    // (clearM3 leaves the last flash's colour, strength and time, only marking it done: each telling begins from none)
    M3.flash = { t: 9, dur: 0.1, color: '#ffffff', a: 0 };
    const calls: Call[] = [];
    const decals = (c.decals ?? []).map((d) => ({ ...d }));
    const fx = stubOf(calls, c.room ?? 1, decals);
    const game = gameOf(c.view);
    seq = 7 + cases.indexOf(c) * 977;
    const seq0 = seq;
    Math.random = lcg;
    if (c.name === 'clock') M3.marks.set(6, { thunder: 0, thunder0: 0, blight: true, crush: 9, bite: -1 });
    if (c.e) eventsM3([c.e as never], game, fx);
    const k0 = kept();
    for (const dt of c.ticks) {
      calls.push(['tick', dt]);
      // (the fight's clock goes on with the looks')
      (game as unknown as { time: number }).time += dt;
      tickM3(dt, game, fx);
    }
    const k1 = kept();
    const p = paint(game, c.clock, c.name);
    Math.random = realRandom;
    evOut.push({ name: c.name, seed: seq0, room: c.room ?? 1, view: viewOut(c.view), e: c.e, ticks: c.ticks, clock: c.clock, decals: c.decals ?? [], calls, kept: k0, kept1: k1, decalsLeft: decals.length, owns: c.e ? meldOwnsEvent(c.e as never) : false, lookWords: c.e && Array.isArray(c.e.words) ? meldLookWords(c.e.words as never) : null, ...p });
  }
  writeFileSync(`${OUT}/melds3_check.json`, JSON.stringify({ scenes: out, cases: evOut }));
  console.log(`check: ${scenes.length} moments of the ten melded words' looks painted by the game's own painters; ${cases.length} of the rules' tellings, through eventsM3 and tickM3, ${evOut.reduce((n, c) => n + (c as { calls: unknown[] }).calls.length, 0)} calls on the effects`);
}
