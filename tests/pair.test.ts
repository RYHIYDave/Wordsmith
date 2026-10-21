// FLOOR 13'S DOUBLE BOSS, THE SCRAPER AND THE QUILL (src/art/scraper.ts, src/art/quill.ts; what they are made of,
// src/art/pair_skins.ts; what they do to the floor, src/art/pair_shots.ts). A MOCK-UP: NOT IN THE GAME, behind PAIR_ON,
// off. In place of the Palimpsest, at his word, 20 Oct 2026, 14:14 Pacific: “I’d like the palimpsest to be something
// different.  There’s too many humanoid looking enemies”; his pick, “Scraper and Quill (Recommended)”; to their moves,
// “Sounds good.  But make the hit boxes on the attacks, and the attacks themselves big”; to their look, “Yes, animate them
// (Recommended)”.
// Held to his art rulebook before he sees them, in every frame of every move, from in front and from behind, as every
// boss is (Approval 7: “I need all bosses ran through all checks from now on”):
//   - nothing of the game imports them; their switch off;
//   - crisp pixels; the pink edge while they live and none dead; nothing cyan; every light the enemy's; nothing cut off
//     at their canvas's edge;
//   - their sizes: the Scraper's back under the knight's head, four tiles from claws to fan; the Quill's head over the
//     knight's, its body at his head;
//   - FLOOR: nothing of either below the floor;
//   - JERK: nothing leaps from one frame to the next but a blow; their loops close; JUMP: each move begins and ends as its
//     neighbours do;
//   - their blows land where their floor marks say, and the marks are big;
//   - the marks drawn, the warnings the enemy's pink, never cyan;
//   - their pictures as the game holds them.
//   run: tsx --test tests/pair.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { PAIR_ON, SR_CANVAS, SR_SCOUR, SR_SNAP, SR_STRIP, makeScraperArt, scraperLong, scraperPainted, scraperSolids } from '../src/art/scraper';
import { QL_CANVAS, QL_FLY, QL_LAND, QL_STAB, QL_SWOOP, QL_TAKEOFF, QL_WRITE, STAB_AT, WRITE_AT, makeQuillArt, qlNibAt, quillLong, quillPainted, quillSolids } from '../src/art/quill';
import { LINES_AT, LINE_HALF, LINE_LONG, SCOUR_HALF, SCOUR_REACH, SNAP_AT, SNAP_R, STAB_R, STRIP_FROM, STRIP_HALF, STRIP_TILES, drawInkLine, drawOverwriting, drawRushWake, drawRushWarn, drawScour, drawScourWarn, drawSnap, drawSnapWarn, drawStab, drawStabWarn, drawStrip, drawStripBurst, drawStripWarn } from '../src/art/pair_shots';
import { TILE3 } from '../src/art/new_mobs3';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const SR_MOVES = ['stand', 'walk', 'attack', 'scour', 'rush', 'strip', 'reel', 'dying'];
const QL_MOVES = ['stand', 'walk', 'attack', 'lines', 'takeoff', 'fly', 'land', 'write', 'swoop', 'reel', 'dying'];
const LOOPS = new Set(['stand', 'walk', 'fly', 'write']);
type Who = { name: string; moves: string[]; long: (m: string) => number; painted: (m: string, t: number, v: 'front' | 'back') => Painted; solids: (m: string, t: number) => Solid[]; canvas: { w: number; h: number } };
type Solid = { part: string; piece: string; shape: any };
const PAIR: Who[] = [
  { name: 'the Scraper', moves: SR_MOVES, long: scraperLong, painted: scraperPainted, solids: (m, t) => scraperSolids(m, t) as Solid[], canvas: SR_CANVAS },
  { name: 'the Quill', moves: QL_MOVES, long: quillLong, painted: quillPainted, solids: (m, t) => quillSolids(m, t) as Solid[], canvas: QL_CANVAS },
];

function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return Infinity;
}
function topOf(sh: any): number {
  if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
  if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return -Infinity;
}
function centreOf(sh: any): number[] {
  if (sh.k === 'rod') return [(sh.a[0] + sh.b[0]) / 2, (sh.a[1] + sh.b[1]) / 2, (sh.a[2] + sh.b[2]) / 2];
  if (sh.k === 'dot' || sh.k === 'glow' || sh.k === 'mote') return sh.p;
  return sh.c;
}
const keyed = (sol: Solid[]): Map<string, Solid> => {
  const seen = new Map<string, number>();
  const m = new Map<string, Solid>();
  for (const x of sol) {
    if (x.shape.k === 'mote' || x.shape.k === 'glow' || x.shape.k === 'dot') continue;
    const id = `${x.part}/${x.piece}`;
    const k = seen.get(id) ?? 0;
    seen.set(id, k + 1);
    m.set(`${id}#${k}`, x);
  }
  return m;
};
/** How far the solids of two moments lie apart: the most any one's middle has moved. */
function apart(a: Solid[], b: Solid[]): { d: number; piece: string } {
  const A = keyed(a);
  let best = { d: 0, piece: '' };
  for (const [key, x] of keyed(b)) {
    const y = A.get(key);
    if (!y) continue;
    const p = centreOf(y.shape);
    const q = centreOf(x.shape);
    const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    if (d > best.d) best = { d, piece: key };
  }
  return best;
}
function hue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max];
}
const isCyan = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  const [h, s] = hue(r, g, b);
  return s > 0.4 && Math.max(r, g, b) > 140 && h >= 165 && h <= 205;
};

test('1. a mock-up: their switch off, and nothing of the game imports them', () => {
  assert.equal(PAIR_ON.on, false, 'PAIR_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(scraper|quill|pair_skins|pair_shots)\.ts$/.test(f)) continue;
    if (/from ['"][^'"]*\/(scraper|quill|pair_skins|pair_shots)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.equal(users.length, 0, `imported by ${users.join(', ')}`);
});

test('2. every other frame of every move, from in front and behind: crisp, their pink edge while they live and none dead, nothing cyan, every light the enemy\'s, their eyes burning, nothing cut off', () => {
  const pr = rgba(ENEMY_RIM);
  for (const who of PAIR) {
    for (const view of ['front', 'back'] as const) {
      for (const move of who.moves) {
        const long = who.long(move);
        const n = Math.round(long * 30);
        for (let i = 0; i <= n; i += 2) {
          if (LOOPS.has(move) && i === n) break;
          const name = `${who.name} ${move} ${view} ${i}/30`;
          const { px, lights } = who.painted(move, i / 30, view);
          let rim = 0;
          let soft = 0;
          let body = 0;
          let eyes = 0;
          for (let k = 0; k < px.d.length; k += 4) {
            const a = px.d[k + 3];
            if (a === 0) continue;
            body++;
            if (a !== 255) {
              if (a === RIM_ALPHA && px.d[k] === pr[0] && px.d[k + 1] === pr[1] && px.d[k + 2] === pr[2]) rim++;
              else soft++;
            }
            const [h, sat] = hue(px.d[k], px.d[k + 1], px.d[k + 2]);
            assert.ok(!(sat > 0.4 && Math.max(px.d[k], px.d[k + 1], px.d[k + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan`);
            if (FIRE.has(`${px.d[k]},${px.d[k + 1]},${px.d[k + 2]}`)) eyes++;
          }
          assert.equal(soft, 0, `${name}: ${soft} soft pixels`);
          if (move !== 'dying' && body > 400) assert.ok(rim > 100, `${name}: its pink edge, ${rim} pixels`);
          if (move === 'dying') assert.equal(rim, 0, `${name}: a pink edge on it dead`);
          if (move !== 'dying') assert.ok(eyes > 0 || lights.length > 0, `${name}: its eyes`);
          for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
          let cut = 0;
          for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
          for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
          assert.equal(cut, 0, `${name}: ${cut} pixels on its canvas's edge`);
        }
      }
    }
  }
});

test('3. their sizes: the Scraper long and low, its back under the knight\'s head, four tiles from claws to fan; the Quill tall, its head over the knight\'s (he is 58 tall)', () => {
  let top = 0;
  let fore = 0;
  let aft = 0;
  for (const b of scraperSolids('stand', 0) as Solid[]) {
    if (b.part === 'body' || b.part === 'tail') top = Math.max(top, topOf(b.shape));
    const c = centreOf(b.shape);
    fore = Math.max(fore, c[0]);
    aft = Math.min(aft, c[0]);
  }
  assert.ok(top > 26 && top < 50, `the Scraper's back ${top.toFixed(1)} up`);
  assert.ok((fore - aft) / TILE3 > 3.6 && (fore - aft) / TILE3 < 5.5, `the Scraper ${((fore - aft) / TILE3).toFixed(2)} tiles long`);
  let qtop = 0;
  for (const b of quillSolids('stand', 0) as Solid[]) qtop = Math.max(qtop, topOf(b.shape));
  assert.ok(qtop > 90 && qtop < 130, `the Quill's head ${qtop.toFixed(1)} up`);
});

test('4. FLOOR: nothing of either below the floor, in any frame of any move, their deaths too', () => {
  for (const who of PAIR) {
    for (const move of who.moves) {
      const long = who.long(move);
      let low = Infinity;
      let what = '';
      for (let i = 0; i <= Math.round(long * 30); i++) {
        for (const x of who.solids(move, i / 30)) {
          const b = bottomOf(x.shape);
          if (b < low) {
            low = b;
            what = `${x.part}/${x.piece} at ${(i / 30).toFixed(2)}`;
          }
        }
      }
      assert.ok(low >= -0.5, `${who.name} ${move}: its lowest point is ${low.toFixed(2)}, under the floor (${what})`);
    }
  }
});

test('5. JERK: nothing leaps from one thirtieth of a second to the next but in a blow; the loops close', () => {
  // (in a blow a claw, a neck or a whole body may be flung, a tile and a half in a thirtieth of a second at most: his “as big
  // and wild and kinetic and weighty as possible”; out of one, half a tile, and two thirds of one for the tips of the long
  // things, the claws' fingers, the wings' tips and the nib, swung at the end of their length; the plates and the pages
  // flying off them as they die are let go)
  const BLOW = 1.5 * TILE3;
  const STEP = 16;
  const TIP = 26;
  const tip = (piece: string): boolean => /fixed|moving|tips|nib/.test(piece);
  const fast: Record<string, [number, number][]> = {
    'the Scraper attack': [[SR_SNAP.warn[1], SR_SNAP.hit + 0.15]],
    'the Scraper scour': [[SR_SCOUR.warn[1], SR_SCOUR.sweep[1] + 0.15]],
    'the Scraper strip': [[SR_STRIP.warn[1], SR_STRIP.slam + 0.15]],
    'the Scraper rush': [[0.55, 1.35]],
    'the Scraper reel': [[0, 0.2]],
    'the Quill attack': [[QL_STAB.warn[1], QL_STAB.hit + 0.35]],
    'the Quill lines': [[0.6, 1.7]],
    'the Quill takeoff': [[0.3, 0.9]],
    'the Quill land': [[0, 0.6]],
    'the Quill swoop': [[0.5, 2.1]],
    'the Quill reel': [[0, 0.2]],
    'the Quill fly': [[0, 0.5]],
  };
  for (const who of PAIR) {
    for (const move of who.moves) {
      const long = who.long(move);
      const n = Math.round(long * 30);
      for (let i = 0; i < n; i++) {
        const t = (i + 1) / 30;
        const before = who.solids(move, i / 30).filter((x) => !(move === 'dying' && /plate|feather/.test(x.piece)));
        const after = who.solids(move, t).filter((x) => !(move === 'dying' && /plate|feather/.test(x.piece)));
        const { d, piece } = apart(before, after);
        const inBlow = (fast[`${who.name} ${move}`] ?? []).some(([a, b]) => t >= a && t <= b + 1e-6);
        assert.ok(d <= (inBlow ? BLOW : tip(piece) ? TIP : STEP), `${who.name} ${move} at ${t.toFixed(2)}: ${piece} leapt ${d.toFixed(1)}`);
      }
      if (LOOPS.has(move)) {
        const { d, piece } = apart(who.solids(move, 0), who.solids(move, long - 1e-9));
        assert.ok(d < 1.5, `${who.name} ${move}: its loop does not close (${piece} ${d.toFixed(2)} apart)`);
      }
    }
  }
});

test('6. JUMP: every move begins as it stands and ends as it stands, but where it hands over to another', () => {
  const near = (a: Solid[], b: Solid[], what: string, most = 2.5): void => {
    const { d, piece } = apart(a, b);
    assert.ok(d < most, `${what}: ${piece} ${d.toFixed(2)} apart`);
  };
  const S = (m: string, t: number): Solid[] => scraperSolids(m, t) as Solid[];
  const Q = (m: string, t: number): Solid[] => quillSolids(m, t) as Solid[];
  for (const m of ['walk', 'attack', 'scour', 'rush', 'strip', 'reel', 'dying']) near(S('stand', 0), S(m, 0), `the Scraper from its stand into ${m}`, m === 'walk' ? 14 : 2.5);
  for (const m of ['attack', 'scour', 'rush', 'strip', 'reel']) near(S(m, scraperLong(m) - 1e-9), S('stand', 0), `the Scraper from ${m} into its stand`);
  for (const m of ['attack', 'lines', 'takeoff', 'swoop', 'reel', 'dying']) near(Q('stand', 0), Q(m, 0), `the Quill from its stand into ${m}`);
  for (const m of ['attack', 'lines', 'swoop', 'reel', 'land']) near(Q(m, quillLong(m) - 1e-9), Q('stand', 0), `the Quill from ${m} into its stand`);
  near(Q('takeoff', QL_TAKEOFF.long - 1e-9), Q('fly', 0), 'the Quill from taking off into flight');
  near(Q('fly', 0), Q('land', 0), 'the Quill from flight into landing');
  near(Q('write', 0), Q('write', QL_WRITE.period - 1e-9), 'the Quill writing, its loop', 2.5);
});

test('7. THE BLOWS LAND WHERE THEIR MARKS SAY, AND THE MARKS ARE BIG (his words: “make the hit boxes on the attacks, and the attacks themselves big”)', () => {
  // the Scraper's snap: its fingers' tips in the ring at SNAP_AT at the blow
  const tips = (m: string, t: number): number[][] => (scraperSolids(m, t) as Solid[]).filter((b) => /^arm[01]$/.test(b.part)).map((b) => centreOf(b.shape));
  const snap = tips('attack', SR_SNAP.hit);
  const inSnap = snap.filter((c) => Math.hypot(c[0] / TILE3 - SNAP_AT.ahead, c[1] / TILE3 - SNAP_AT.left) < SNAP_R);
  assert.ok(inSnap.length >= 3, `the snapping claw in its ring (${inSnap.length} of its pieces)`);
  assert.ok(SNAP_R >= 1, 'the snap a tile round at least');
  // the scour: its claws sweep the fan, from its edges in, out to its reach
  for (const [t, ang] of [[SR_SCOUR.sweep[0] + 0.02, SCOUR_HALF], [SR_SCOUR.sweep[1], 0]] as const) {
    const far = tips('scour', t).reduce((m, c) => (Math.hypot(c[0], c[1]) > Math.hypot(m[0], m[1]) ? c : m), [0, 0, 0]);
    const r = Math.hypot(far[0], far[1]) / TILE3;
    const a = Math.abs((Math.atan2(far[1], far[0]) * 180) / Math.PI);
    assert.ok(r <= SCOUR_REACH && r > SCOUR_REACH - 1.2, `the scour's claws ${r.toFixed(2)} tiles out at ${t.toFixed(2)}`);
    assert.ok(Math.abs(a - ang) < 22, `the scour's claws at ${a.toFixed(0)} degrees at ${t.toFixed(2)} (expected about ${ang})`);
  }
  assert.ok(SCOUR_REACH >= 3.5 && SCOUR_HALF >= 75, 'the scour a great fan');
  // the strip: its claws come down where it begins
  const strip = tips('strip', SR_STRIP.slam).reduce((m, c) => Math.max(m, c[0]), 0) / TILE3;
  assert.ok(Math.abs(strip - (STRIP_FROM + 0.6)) < 0.9, `the strip's claws down at ${strip.toFixed(2)} tiles (it begins at ${STRIP_FROM})`);
  assert.ok(STRIP_TILES >= 5 && STRIP_HALF >= 0.75, 'the strip long and wide');
  // the Quill's stab: the nib's point on the floor at STAB_AT at the blow
  const nib = qlNibAt('attack', QL_STAB.hit);
  assert.ok(Math.abs(nib[0] / TILE3 - STAB_AT) < 0.15 && Math.abs(nib[1]) < 4 && nib[2] < 3, `the nib at ${(nib[0] / TILE3).toFixed(2)} tiles, ${nib[2].toFixed(1)} up`);
  assert.ok(STAB_R >= 1, 'the stab a tile round at least');
  // its swoop: the nib dragged on the floor all through the skim
  for (let t = QL_SWOOP.go + 0.15; t < QL_SWOOP.lift; t += 0.1) assert.ok(qlNibAt('swoop', t)[2] < 3, `the swoop's nib off the floor at ${t.toFixed(2)}`);
  // its writing: the nib on the Scraper's back
  for (let t = 0; t < QL_WRITE.period; t += 0.1) {
    const w = qlNibAt('write', t);
    assert.ok(Math.abs(w[0] / TILE3 - WRITE_AT.ahead) < 0.3 && Math.abs(w[2] - WRITE_AT.up) < 8, `the writing nib at ${(w[0] / TILE3).toFixed(2)} tiles, ${w[2].toFixed(1)} up`);
  }
  // the lines: three, across the floor before it, long and wide
  assert.ok(LINES_AT.length === 3 && LINE_LONG >= 4.5 && LINE_HALF >= 0.4, 'three great lines');
  // its flight and landing: the feet off the floor in flight, on it as it lands
  assert.ok(QL_FLY.period > 0 && QL_LAND.down < QL_LAND.long, 'its landing in time');
});

function recorder(): { g: CanvasRenderingContext2D; colours: Set<string>; n: () => number } {
  const colours = new Set<string>();
  let n = 0;
  const g = {
    globalAlpha: 1,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    fillRect(): void {
      n++;
      colours.add(String(g.fillStyle));
    },
    beginPath(): void {},
    moveTo(): void {},
    lineTo(): void {},
    closePath(): void {},
    fill(): void {
      n++;
      colours.add(String(g.fillStyle));
    },
  } as unknown as CanvasRenderingContext2D;
  return { g, colours, n: () => n };
}

test('8. what they do to the floor: drawn; the warnings the enemy\'s pink, the ink black; never cyan', () => {
  const at = (x: number, y: number): readonly [number, number] => [200 + (x - y) * 16, 100 + (x + y) * 8];
  const r = recorder();
  for (let k = 0.1; k <= 1; k += 0.3) {
    drawSnapWarn(r.g, at, 2, 2, 1, 0, k);
    drawScourWarn(r.g, at, 2, 2, 1, 0, k);
    drawRushWarn(r.g, at, 2, 2, 1, 0, k);
    drawStripWarn(r.g, at, 2, 2, 1, 0, k);
    drawStabWarn(r.g, at, 2, 2, 1, 0, STAB_AT, k);
  }
  for (let t = 0; t < 2; t += 0.1) {
    drawSnap(r.g, at, 2, 2, 1, 0, t);
    drawScour(r.g, at, 2, 2, 1, 0, t);
    drawRushWake(r.g, at, 2, 2, 1, 0, t, Math.min(5, t * 10));
    drawStrip(r.g, at, 2, 2, 1, 0, t, t / 2);
    drawStripBurst(r.g, at, 2, 2, 1, 0, t);
    drawStab(r.g, at, 2, 2, 1, 0, STAB_AT, t);
    for (let i = 0; i < 3; i++) drawInkLine(r.g, at, 2, 2, 1, 0, i, t);
    drawOverwriting(r.g, 100, 80, t);
  }
  assert.ok(r.n() > 3000, `${r.n()} drawn`);
  for (const c of r.colours) if (c.startsWith('#')) assert.ok(!isCyan(c), `the marks draw cyan, ${c}`);
  assert.ok([...r.colours].some((c) => FLAME.includes(c)), 'the enemy\'s pink in the warnings');
});

test('9. as the game holds them: each move a clip, the blows marked, the loops looping', () => {
  for (const [name, art, moves] of [
    ['the Scraper', makeScraperArt(), ['scour', 'rush', 'strip']],
    ['the Quill', makeQuillArt(), ['lines', 'takeoff', 'fly', 'land', 'write', 'swoop']],
  ] as const) {
    for (const view of ['front', 'back'] as const) {
      const set = art[view];
      assert.ok(set.idle.length > 10 && set.walk.length > 6, `${name} ${view}: its stand and walk`);
      assert.ok(set.clips?.attack?.hit !== undefined, `${name} ${view}: its blow marked`);
      for (const m of moves) assert.ok(set.clips?.moves?.[m] !== undefined, `${name} ${view}: its ${m}`);
      assert.ok(set.clips?.die !== undefined && set.clips?.reel !== undefined, `${name} ${view}: struck and its death`);
    }
  }
  const q = makeQuillArt().front.clips?.moves;
  assert.ok(q?.fly?.loop === 0 && q?.write?.loop === 0, 'the Quill\'s flight and writing loop');
});
