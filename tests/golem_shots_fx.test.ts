// THE GOLEM'S CHARGED SHOTS AND THE CONTRAPTION'S BOMBS AND BOLTS, READY FOR THE GAME (src/art/golem_shots_fx.ts): the same
// pictures as the films he said yes to, cut into pieces the game lays at a point of the floor. Their points the sculpture's
// own (baked: src/art/golem_shots_points.ts). Everything at the Golem, and the shell's flight, its blast, the beam, light for
// light the art's own chargeFx; laid as the game lays them, pixel for pixel all but a few of the film's own picture. Every
// frame of every piece crisp, cyan and white and greys only (nothing pink, nothing gold), nothing cut off, gone when done;
// the charge's loop the same each round; the beam, the shell and the bolt at any heading and any length from 1 to 8 tiles;
// the blasts as wide as their numbers say.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';
import { paintWithoutCanvas } from './helpers';
paintWithoutCanvas();
import { UNITS_PER_TILE } from '../src/art/moves3';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { Px } from '../src/engine/px';
import { GCHARGE, GCHARGE_BEAM, GCHARGE_SHELL } from '../src/dev/golem_moves';
import { BEAM_FX, GUN_STEAM, SHELL_FX, beamFx, beamReach, beamWidth, chargeFx, chargeLayers, charging, layAir, layFloor, shellFlight, shellFlightFx, wideBlast } from '../src/dev/golem_charge_fx';
import type { ChargeAt, ChargeLayers } from '../src/dev/golem_charge_fx';
import { BOLT_FX, BOMB_FX, CBOLT } from '../src/dev/contraption_shots';
import { BEAM_END_UP, BEAM_FRAMES, BOLT_HIT_UP, CHARGE_CANVAS, CHARGE_FX_LAST, SHOT_CON_TURN, SHOT_GOLEM_TURN, beamPiece, bombBlastPiece, boltFrames, boltPiece, golemBeamFx, golemChargeFx, golemChargeLights, golemChargePiece, golemMuzzle, golemShellBlastFx, golemShellFlightFx, golemShotAt, shellBlastPiece, shellFlightPiece, shellFrames } from '../src/art/golem_shots_fx';
import type { Piece, ShotGun } from '../src/art/golem_shots_fx';
import { CONTRAPTION_BALL, GOLEM_SHOT_POINTS } from '../src/art/golem_shots_points';
import { golemPointsAt, measureBall } from './golem_shots_measure';
import { pictureFindings } from './sculpt_checks';
import { TINKER_TUNE } from '../src/game/tinkerer';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void } = nodeAssert;
const T = UNITS_PER_TILE;
const GUNS: ShotGun[] = ['cannon', 'tesla'];
const VIEWS = ['front', 'back'] as const;
const kindOf = (gun: ShotGun): 'shell' | 'beam' => (gun === 'tesla' ? 'beam' : 'shell');
const endOf = (gun: ShotGun): number => (gun === 'tesla' ? GCHARGE_BEAM.end : GCHARGE_SHELL.end);
const scene = (ax: number, ay: number) => (p: V3): [number, number] => {
  const s = project(p, 'front');
  return [ax + s[0], ay + s[1]];
};

// ---- what a picture is checked for ---------------------------------------------------------------------------------------

function hsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255;
  const d = mx - mn;
  let h = 0;
  if (d) h = mx === r / 255 ? ((g - b) / 255 / d) % 6 : mx === g / 255 ? (b - r) / 255 / d + 2 : (r - g) / 255 / d + 4;
  return [((h * 60) + 360) % 360, mx ? d / mx : 0, mx];
}
/** Every pixel of colour in it the friend's cyan (the rest white, grey, dark): what is pink, gold or any other glow, counted. */
function notCyan(p: Px): number {
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (!p.d[i + 3]) continue;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    if (s > 0.35 && v > 0.4 && (h < 165 || h > 205)) n++;
  }
  return n;
}
function cyanOf(p: Px): number {
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (!p.d[i + 3]) continue;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    if (s > 0.35 && v > 0.4 && h >= 165 && h <= 205) n++;
  }
  return n;
}
const lit = (p: Px): boolean => p.bounds() !== null;
/** Its own checks (crisp: no pixel half there, none alone, nothing pink, not at its picture's edge), nothing but cyan glowing, and room to spare all round (nothing cut off). */
function findings(p: Px, where: string): string[] {
  if (!lit(p)) return [];
  const out = pictureFindings(p).map((x) => `${where}: ${x}`);
  const c = notCyan(p);
  if (c) out.push(`${where}: ${c} pixels glowing other than the friend's cyan`);
  const b = p.bounds()!;
  if (b.x < 4 || b.y < 4 || b.x + b.w > p.w - 4 || b.y + b.h > p.h - 4) out.push(`${where}: reaches the edge of its canvas (cut off)`);
  return out;
}
/** A Light's own pixels (its level at each), and every layer's. */
const pxOf = (l: unknown): Map<number, number> => (l as { px: Map<number, number> }).px;
const LAYERS = ['floor', 'floorLit', 'sm', 'st', 'stone', 'iron', 'l'] as const;
function union(a: ChargeLayers, b: ChargeLayers): ChargeLayers {
  for (const k of LAYERS) for (const [q, v] of pxOf(b[k])) if ((pxOf(a[k]).get(q) ?? -1) < v) pxOf(a[k]).set(q, v);
  return a;
}
function sameLights(a: ChargeLayers, b: ChargeLayers): string[] {
  const out: string[] = [];
  for (const k of LAYERS) {
    const A = pxOf(a[k]);
    const B = pxOf(b[k]);
    let d = 0;
    for (const [q, v] of A) if (B.get(q) !== v) d++;
    for (const q of B.keys()) if (!A.has(q)) d++;
    if (d) out.push(`${k}: ${d} lights differ`);
  }
  return out;
}
/** Lay `p` over `on` with its anchor at (x, y). */
function layOn(on: Px, p: Piece, x: number, y: number): void {
  for (let yy = 0; yy < p.px.h; yy++) for (let xx = 0; xx < p.px.w; xx++) {
    const i = (yy * p.px.w + xx) * 4;
    if (!p.px.d[i + 3]) continue;
    const X = x - p.ax + xx;
    const Y = y - p.ay + yy;
    if (X < 0 || Y < 0 || X >= on.w || Y >= on.h) continue;
    const j = (Y * on.w + X) * 4;
    for (let c = 0; c < 4; c++) on.d[j + c] = p.px.d[i + c];
  }
}
function over(a: Px, b: Px): Px {
  const o = a.clone();
  for (let i = 0; i < b.d.length; i += 4) if (b.d[i + 3]) for (let c = 0; c < 4; c++) o.d[i + c] = b.d[i + c];
  return o;
}
/** How alike two pictures are: of the pixels the friend's cyan lights in either, the share it lights in both; and how many pixels each has. */
function alike(a: Px, b: Px): { cyan: number; litA: number; litB: number } {
  let both = 0, either = 0, la = 0, lb = 0;
  const cy = (p: Px, i: number): boolean => {
    if (!p.d[i + 3]) return false;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    return s > 0.35 && v > 0.4 && h >= 165 && h <= 205;
  };
  for (let i = 0; i < a.d.length; i += 4) {
    if (a.d[i + 3]) la++;
    if (b.d[i + 3]) lb++;
    const x = cy(a, i), y = cy(b, i);
    if (x || y) either++;
    if (x && y) both++;
  }
  return { cyan: either ? both / either : 1, litA: la, litB: lb };
}
function differ(a: Px, b: Px): { diff: number; of: number } {
  let diff = 0;
  let of = 0;
  for (let i = 0; i < a.d.length; i += 4) {
    if (a.d[i + 3] || b.d[i + 3]) of++;
    if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2] || a.d[i + 3] !== b.d[i + 3]) diff++;
  }
  return { diff, of };
}
/** The Golem's gun's way across the floor (the game's tiles) as drawn in `view`. */
function facing(gun: ShotGun, view: 'front' | 'back'): [number, number] {
  const w = golemShotAt(gun, GCHARGE.fire, view, scene(0, 0)).way;
  const n = Math.hypot(w[0], w[1]);
  return [w[0] / n, -w[1] / n];
}

// ---- 1. the points are the sculpture's own ---------------------------------------------------------------------------------

test('1. the baked points are where the sculpture puts them: the Golem\'s gun\'s mouth and way, its coil, its stacks, its feet and fist, every frame of both shots (turned as the game turns it, the same); the energy Contraption\'s ball as it fires', () => {
  const found: string[] = [];
  for (const gun of GUNS) {
    const B = GOLEM_SHOT_POINTS[gun];
    if (B.from !== GCHARGE.aimed || B.from + B.n - 1 !== endOf(gun)) found.push(`${gun}: frames ${B.from} to ${B.from + B.n - 1}`);
    for (let f = B.from; f <= endOf(gun); f++) {
      const want = golemPointsAt(gun, f, f % 7 === 0 ? 135 : 45);
      const got = B.v.slice((f - B.from) * B.per, (f - B.from + 1) * B.per);
      const worst = Math.max(...want.map((v, i) => Math.abs(v - got[i])));
      if (want.length !== B.per || worst > 2e-3) found.push(`${gun}, frame ${f}: off by ${worst}`);
    }
  }
  for (const turn of [315, 45]) {
    const b = measureBall(turn);
    const worst = Math.max(...[...b.p, ...b.way].map((v, i) => Math.abs(v - [...CONTRAPTION_BALL.p, ...CONTRAPTION_BALL.way][i])));
    if (worst > 2e-3) found.push(`the Contraption's ball, turned ${turn}: off by ${worst}`);
  }
  assert.deepEqual(found, []);
});

// ---- 2. everything at the Golem --------------------------------------------------------------------------------------------

for (const gun of GUNS) {
  test(`2. ${gun}: everything at the Golem, every frame from the brace to gone, from in front and behind: crisp, the friend's cyan, nothing cut off, nothing before it aims, gone after its last; its loop the same each round; a great flash of cyan at its full and at the shot`, () => {
    const found: string[] = [];
    const kind = kindOf(gun);
    for (const view of VIEWS) {
      for (let f = 0; f <= CHARGE_FX_LAST[gun] + 3; f++) {
        const p = golemChargePiece(view, gun, f);
        const where = `${view}, frame ${f}`;
        const any = lit(p.floor.px) || lit(p.air.px);
        if ((f < GCHARGE.aimed || f > CHARGE_FX_LAST[gun]) && any) found.push(`${where}: something there`);
        if (f >= GCHARGE.aimed && f <= GCHARGE.fire + 20 && !any) found.push(`${where}: nothing there`);
        found.push(...findings(p.floor.px, `${where}, on the floor`), ...findings(p.air.px, `${where}, in the air`));
        if ((f === GCHARGE.full || (f === GCHARGE.fire && gun === 'cannon')) && cyanOf(p.air.px) < 40) found.push(`${where}: no great flash of the friend's cyan`);
        // (the coil's shot: its flash is the beam itself, blazing out of its ball)
        if (f === GCHARGE.fire && gun === 'tesla' && cyanOf(beamPiece(view, false, 8, view === 'front' ? 0 : -8, 0).px) < 40) found.push(`${where}: no great flash of the friend's cyan`);
      }
      // (the loop: each of its frames as the art paints it a round on, and ten rounds on: the same)
      for (let f = GCHARGE.loop; f < GCHARGE.fire; f++) {
        const mine = golemChargeLights(gun, view, f, 0, scene(150, 150));
        for (const r of [1, 10]) {
          const ly = chargeLayers();
          charging(kind, ly, golemShotAt(gun, f, view, scene(150, 150)), f + r * GCHARGE.round);
          const d = sameLights(mine, ly);
          if (d.length) found.push(`${view}: its loop's frame ${f} not the same ${r} rounds on (${d.join('; ')})`);
        }
      }
    }
    // (the sprites the game lays: as many as its frames, and each the painted piece's)
    const s = golemChargeFx('front', gun);
    if (s.air.length !== CHARGE_FX_LAST[gun] + 1 || s.floor.length !== s.air.length) found.push(`${s.air.length} frames`);
    const one = s.air[GCHARGE.fire];
    if (Math.abs(one.ax * 2 - (CHARGE_CANVAS.ax - (golemChargePiece('front', gun, GCHARGE.fire).air.px.bounds(2)?.x ?? 0))) > 1e-9) found.push('its anchor not the Golem\'s floor point');
    assert.deepEqual([...new Set(found)], []);
  });
}

// ---- 3. light for light the art's own -----------------------------------------------------------------------------------

for (const gun of GUNS) {
  test(`3. ${gun}: from its shot on, everything at the Golem with the ${gun === 'tesla' ? 'beam' : 'shell\'s flight and its blast'} is the art's own chargeFx, light for light, every frame; from in front and behind`, () => {
    const found: string[] = [];
    const kind = kindOf(gun);
    for (const view of VIEWS) {
      const S = scene(400, 300);
      const [fx, fy] = facing(gun, view);
      const fired = golemShotAt(gun, GCHARGE.fire, view, S).muzzle;
      const land: V3 = [Math.round(5 * fx) * T, -Math.round(5 * fy) * T, 0];
      const end: V3 = [fired[0] + fx * 8 * T, fired[1] - fy * 8 * T, BEAM_END_UP * 2];
      const n = shellFlight({ fired, aim: land } as ChargeAt);
      for (let f = GCHARGE.fire; f <= CHARGE_FX_LAST[gun] + 2; f++) {
        const k = f - GCHARGE.fire;
        const t = f / 30;
        const full = golemShotAt(gun, f, view, S);
        const art = chargeLayers();
        chargeFx(kind, art, { ...full, fired, aim: kind === 'shell' ? land : end }, f, t);
        const mine = golemChargeLights(gun, view, f, t, S);
        const rest = chargeLayers();
        if (kind === 'shell') {
          shellFlightFx(rest, { S, fired, aim: land } as ChargeAt, k, n);
          wideBlast(rest, S, land, k - n, t, 61);
        } else if (beamWidth(f) > 0) {
          const m = S(full.muzzle);
          const r = beamReach(f);
          const e = S([full.muzzle[0] + (end[0] - full.muzzle[0]) * r, full.muzzle[1] + (end[1] - full.muzzle[1]) * r, full.muzzle[2] + (end[2] - full.muzzle[2]) * r]);
          beamFx(rest.l, m[0], m[1], e[0], e[1], Math.max(1.5, BEAM_FX.drawn * T * beamWidth(f)), f, f > GCHARGE_BEAM.held);
        }
        const d = sameLights(union(mine, rest), art);
        if (d.length) found.push(`${view}, frame ${f}: ${d.join('; ')}`);
      }
    }
    assert.deepEqual(found, []);
  });
}

// ---- 4. pixel for pixel the film's own picture --------------------------------------------------------------------------

/** The art's film at frame `f` (the Golem as sculpted, not baked), and the game-ready pieces laid on the same scene as the game lays them: how many pixels differ. */
function filmAndPieces(gun: ShotGun, view: 'front' | 'back', f: number): { film: Px; game: Px; diff: number; of: number; cyan: number; litA: number; litB: number } {
  const W = 760;
  const H = 520;
  const GX = 260;
  const GY = 300;
  const S = scene(GX, GY);
  const kind = kindOf(gun);
  const fresh = (ff: number): ChargeAt => {
    const v = golemPointsAt(gun, Math.min(ff, endOf(gun)), SHOT_GOLEM_TURN[view]);
    const turn = (j: number): V3 => {
      const a = (SHOT_GOLEM_TURN[view] * Math.PI) / 180;
      return [v[j] * Math.cos(a) - v[j + 1] * Math.sin(a), v[j] * Math.sin(a) + v[j + 1] * Math.cos(a), v[j + 2]];
    };
    const c = gun === 'tesla' ? 6 : 0;
    const coil = gun === 'tesla' ? [turn(6), turn(9)] : [];
    return { S, muzzle: turn(0), way: turn(3), vents: coil.length ? [coil[0], coil[1], coil[0], coil[1]] : [], ventWays: [], stacks: [turn(6 + c), turn(9 + c)], grip: [turn(12 + c), turn(15 + c), turn(18 + c)], fired: turn(0), aim: turn(0) };
  };
  const [fx, fy] = facing(gun, view);
  const fired = fresh(GCHARGE.fire).muzzle;
  const L = [Math.round(5 * fx), Math.round(5 * fy)];
  const land: V3 = [L[0] * T, -L[1] * T, 0];
  const E = [fired[0] / T + fx * 8, -fired[1] / T + fy * 8];
  const end: V3 = [E[0] * T, -E[1] * T, BEAM_END_UP * 2];
  // THE FILM: the art's chargeFx, its floor laid under, its air over
  const ly = chargeLayers();
  chargeFx(kind, ly, { ...fresh(f), fired, aim: kind === 'shell' ? land : end }, f, f / 30);
  const film = over(layFloor(W, H, ly), layAir(W, H, ly));
  // THE GAME: each piece at its anchor, the floors first
  const floor = new Px(W, H);
  const air = new Px(W, H);
  const at = golemChargePiece(view, gun, f);
  layOn(floor, at.floor, GX, GY);
  const k = f - GCHARGE.fire;
  if (kind === 'shell') {
    const n = shellFrames(view, false, L[0], L[1]);
    const [bx, by] = S(land);
    const b = shellBlastPiece(k - n, SHELL_FX.blast, f / 30);
    if (k - n >= 0) layOn(floor, b.floor, bx, by);
    // (the shell under the Golem's air while it is in the great burst, its first two frames; over it after: as the README says)
    if (k >= 0 && k < 2) layOn(air, shellFlightPiece(view, false, L[0], L[1], k, n), GX, GY);
    layOn(air, at.air, GX, GY);
    if (k >= 2) layOn(air, shellFlightPiece(view, false, L[0], L[1], k, n), GX, GY);
    if (k - n >= 0) layOn(air, b.air, bx, by);
  } else {
    layOn(air, at.air, GX, GY);
    if (k >= 0) layOn(air, beamPiece(view, false, E[0], E[1], k), GX, GY);
  }
  const game = over(floor, air);
  return { film, game, ...differ(film, game), ...alike(film, game) };
}
/** The moments compared (and shown on the sheet): the charge, its full, the loop, the shot, the flight, the blast, the beam held and thinning. */
const COMPARED: Record<ShotGun, number[]> = {
  cannon: [20, GCHARGE.full, 32, GCHARGE.fire, GCHARGE.fire + 3, GCHARGE.fire + 8, GCHARGE.fire + 12, GCHARGE.fire + 24],
  tesla: [20, GCHARGE.full, 32, GCHARGE.fire, GCHARGE.fire + 1, GCHARGE.fire + 6, GCHARGE_BEAM.held + 3, GCHARGE_BEAM.gone + 6],
};
for (const gun of GUNS) {
  test(`4. ${gun}: laid as the game lays them, the pieces are the film's own picture at the same moment (the friend's cyan where the film's is, as many pixels; the grain of smoke, steam and the blast's fire the picture's own), from in front and behind`, () => {
    const found: string[] = [];
    for (const view of VIEWS) {
      for (const f of COMPARED[gun]) {
        const r = filmAndPieces(gun, view, f);
        if (r.of < 30) found.push(`${view}, frame ${f}: nothing to compare`);
        // (the light where it is, as much of it: all of it the same but where the blast's dome of fire boils, whose torn edge
        // the art draws from where on the picture it is; the smoke and steam as much, their grain the same way their own)
        const [fx, fy] = facing(gun, view);
        const k = f - GCHARGE.fire - (gun === 'cannon' ? shellFrames(view, false, Math.round(5 * fx), Math.round(5 * fy)) : 99);
        const dome = k >= 0 && k < 9;
        if (r.cyan < (dome ? 0.3 : 0.7)) found.push(`${view}, frame ${f}: its light ${Math.round(r.cyan * 100)}% where the film's is`);
        if (Math.abs(r.litA - r.litB) > Math.max(40, 0.12 * Math.max(r.litA, r.litB))) found.push(`${view}, frame ${f}: ${r.litB} pixels, the film's ${r.litA}`);
      }
    }
    assert.deepEqual(found, []);
  });
}

// ---- 5. along a line: the beam, the shell, the bolt, any heading and any length ------------------------------------------

const HEADINGS = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
/** The lit pixels' furthest reach from (x, y) the way (ux, uy). */
function reach(p: Piece, x: number, y: number, ux: number, uy: number): number {
  let far = -Infinity;
  for (let yy = 0; yy < p.px.h; yy++) for (let xx = 0; xx < p.px.w; xx++) if (p.px.d[(yy * p.px.w + xx) * 4 + 3]) far = Math.max(far, (xx - p.ax - x) * ux + (yy - p.ay - y) * uy);
  return far;
}
function mirrored(a: Piece, b: Piece): boolean {
  const f = b.px.flipX();
  return a.px.w === b.px.w && a.px.h === b.px.h && a.ax === b.px.w - 1 - b.ax && a.ay === b.ay && a.px.d.every((v, i) => v === f.d[i]);
}

test('5. THE BEAM at every heading and every length from 1 to 8 tiles, from in front and behind: every frame crisp, the friend\'s cyan, nothing cut off; out to its end the frame after the shot, and no further than its splash; gone after its last; turned over with the Golem, the mirror of itself', () => {
  const found: string[] = [];
  for (const view of VIEWS) {
    const m = golemMuzzle(view, 'tesla', GCHARGE.fire + 1);
    for (const L of view === 'front' ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 4, 8]) {
      for (const a of HEADINGS) {
        const dx = m.x + Math.cos(a) * L;
        const dy = m.y + Math.sin(a) * L;
        for (let k = 0; k <= BEAM_FRAMES + 1; k++) {
          const p = beamPiece(view, false, dx, dy, k);
          const where = `${view}, ${L} tiles at ${Math.round((a * 180) / Math.PI)}°, frame ${k}`;
          if (k >= BEAM_FRAMES) {
            if (lit(p.px)) found.push(`${where}: still there`);
            continue;
          }
          if (!lit(p.px)) found.push(`${where}: nothing there`);
          found.push(...findings(p.px, where));
          if (k === 1) {
            const s = scene(0, 0);
            const mm = golemMuzzle(view, 'tesla', GCHARGE.fire + 1);
            const a0 = s([mm.x * T, -mm.y * T, mm.up * 2]);
            const e = s([dx * T, -dy * T, BEAM_END_UP * 2]);
            const len = Math.hypot(e[0] - a0[0], e[1] - a0[1]);
            if (len > 8) {
              const far = reach(p, a0[0], a0[1], (e[0] - a0[0]) / len, (e[1] - a0[1]) / len);
              if (far < len - 4 || far > len + 32) found.push(`${where}: reaches ${Math.round(far)} pixels, its end ${Math.round(len)}`);
            }
          }
        }
        if (L === 4 && !mirrored(beamPiece(view, true, dy, dx, 3), beamPiece(view, false, dx, dy, 3))) found.push(`${view}, ${L} tiles at ${Math.round((a * 180) / Math.PI)}°: turned over, not its mirror`);
      }
    }
  }
  const s = golemBeamFx('front', false, 9, 0);
  if (s.length !== BEAM_FRAMES || BEAM_FRAMES !== GCHARGE_BEAM.gone - GCHARGE.fire) found.push(`${s.length} frames`);
  assert.deepEqual([...new Set(found)], []);
});

test('6. THE SHELL\'S FLIGHT at every heading and every length from 1 to 8 tiles, from in front and behind: every frame crisp, cyan and its iron, nothing cut off; it lands where it is aimed on its last frame of flight; its trail gone three frames after; the game\'s own flight time kept; turned over, the mirror of itself', () => {
  const found: string[] = [];
  for (const view of VIEWS) {
    const m = golemMuzzle(view, 'cannon', GCHARGE.fire);
    for (const L of view === 'front' ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 4, 8]) {
      for (const a of HEADINGS) {
        const dx = m.x + Math.cos(a) * L;
        const dy = m.y + Math.sin(a) * L;
        const n = shellFrames(view, false, dx, dy);
        if (Math.abs(n - Math.max(2, (L / SHELL_FX.speed) * 30)) > 0.51) found.push(`${L} tiles: flies ${n} frames`);
        for (let k = 0; k <= n + 5; k++) {
          const p = shellFlightPiece(view, false, dx, dy, k, n);
          const where = `${view}, ${L} tiles at ${Math.round((a * 180) / Math.PI)}°, frame ${k}`;
          if (k > n + 3) {
            if (lit(p.px)) found.push(`${where}: still there`);
            continue;
          }
          found.push(...findings(p.px, where));
          if (k === n - 1) {
            // (the shell's iron, its middle where it lands)
            let sx = 0, sy = 0, c = 0;
            for (let yy = 0; yy < p.px.h; yy++) for (let xx = 0; xx < p.px.w; xx++) {
              const i = (yy * p.px.w + xx) * 4;
              if (!p.px.d[i + 3]) continue;
              const [, sat] = hsv(p.px.d[i], p.px.d[i + 1], p.px.d[i + 2]);
              if (sat < 0.3 && p.px.d[i] < 0x90) { sx += xx; sy += yy; c++; }
            }
            const e = scene(p.ax, p.ay)([dx * T, -dy * T, 0]);
            if (!c || Math.hypot(sx / c - e[0], sy / c - e[1]) > 9) found.push(`${where}: the shell not where it lands`);
          }
        }
        if (L === 4 && !mirrored(shellFlightPiece(view, true, dy, dx, 2, n), shellFlightPiece(view, false, dx, dy, 2, n))) found.push(`${view}, ${L} tiles at ${Math.round((a * 180) / Math.PI)}°: turned over, not its mirror`);
      }
    }
  }
  const g = golemShellFlightFx('front', false, 6, 0, 11);
  if (g.n !== 11 || g.frames.length !== 15) found.push(`the game's flight not kept: ${g.n} frames, ${g.frames.length} pictures`);
  assert.deepEqual([...new Set(found)], []);
});

test('7. THE ENERGY BOLT at every heading and every length from 1 to 8 tiles, from in front and behind: every frame crisp, the friend\'s cyan, nothing cut off; at what it hits from its flight\'s end; gone after; turned over, the mirror of itself', () => {
  const found: string[] = [];
  for (const view of VIEWS) {
    for (const L of view === 'front' ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 4, 8]) {
      for (const a of HEADINGS) {
        const dx = Math.cos(a) * L;
        const dy = Math.sin(a) * L;
        const { long, n } = boltFrames(view, false, dx, dy);
        if (n < 1 || n > Math.ceil((L / BOLT_FX.speed) * 30) + 1) found.push(`${L} tiles: flies ${n} frames`);
        for (let k = 0; k <= long + 1; k++) {
          const p = boltPiece(view, false, dx, dy, k);
          const where = `${view}, ${L} tiles at ${Math.round((a * 180) / Math.PI)}°, frame ${k}`;
          if (k >= long) {
            if (lit(p.px)) found.push(`${where}: still there`);
            continue;
          }
          found.push(...findings(p.px, where));
          if (k === n + 1) {
            const e = scene(p.ax, p.ay)([dx * T, -dy * T, BOLT_HIT_UP * 2]);
            const i = (Math.round(e[1]) * p.px.w + Math.round(e[0])) * 4;
            let near = 0;
            for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) if (p.px.d[i + (yy * p.px.w + xx) * 4 + 3]) near++;
            if (near < 20) found.push(`${where}: nothing crackling at what it hits`);
          }
        }
        if (L === 4 && !mirrored(boltPiece(view, true, dy, dx, 2), boltPiece(view, false, dx, dy, 2))) found.push(`${view}, ${L} tiles at ${Math.round((a * 180) / Math.PI)}°: turned over, not its mirror`);
      }
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

// ---- 8. the blasts ------------------------------------------------------------------------------------------------------

/** The cyan's width across the picture (pixels). */
function cyanWide(p: Px): number {
  let x0 = Infinity, x1 = -Infinity;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const i = (y * p.w + x) * 4;
    if (!p.d[i + 3]) continue;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    if (s > 0.35 && v > 0.4 && h >= 165 && h <= 205) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  }
  return x1 - x0;
}
test('8. THE BLASTS, the shell\'s (2.5 tiles round, and a weaker one\'s 1.5) and her bomb\'s (2.0): every frame crisp, cyan and white and greys, nothing cut off, gone when done; their ring racing out as wide as their numbers say; light for light the art\'s own', () => {
  const found: string[] = [];
  const BL = [
    { name: 'the shell\'s blast', r: SHELL_FX.blast, long: SHELL_FX.long, at: shellBlastPiece, ring: [5, 6] },
    { name: 'a weaker shell\'s blast', r: 1.5, long: SHELL_FX.long, at: shellBlastPiece, ring: [5, 6] },
    { name: 'her bomb\'s blast', r: BOMB_FX.blast, long: BOMB_FX.long, at: bombBlastPiece, ring: [3, 4] },
  ];
  for (const B of BL) {
    for (let k = -1; k <= B.long + 1; k++) {
      const p = B.at(k, B.r);
      const where = `${B.name}, frame ${k}`;
      const any = lit(p.floor.px) || lit(p.air.px);
      if ((k < 0 || k >= B.long) && any) found.push(`${where}: something there`);
      if (k >= 0 && k < B.long - 2 && !any) found.push(`${where}: nothing there`);
      found.push(...findings(p.floor.px, `${where}, on the floor`), ...findings(p.air.px, `${where}, in the air`));
    }
    // (its ring at its widest: a round of the floor `r` tiles across, seen as the game sees the floor, 2 x 45.25 pixels a tile)
    const want = 2 * B.r * 32 * Math.SQRT2;
    const got = Math.max(...B.ring.map((k) => cyanWide(B.at(k, B.r).air.px)));
    if (Math.abs(got - want) > 10) found.push(`${B.name}: its ring ${got} pixels across, its ${B.r} tiles ${Math.round(want)}`);
  }
  // (light for light the art's own: the shell's blast is dev/golem_charge_fx.ts wideBlast, her bomb's dev/contraption_shots.ts bombBlast, at the same moment)
  for (const k of [0, 3, 9, 20, 35]) {
    const art = chargeLayers();
    wideBlast(art, scene(128, 152), [0, 0, 0], k, k / 30, 61);
    const p = shellBlastPiece(k);
    const want = over(layFloor(256, 222, art), layAir(256, 222, art));
    const d = differ(want, over(p.floor.px, p.air.px));
    if (d.diff) found.push(`the shell's blast, frame ${k}: ${d.diff} pixels not the art's`);
  }
  const g = golemShellBlastFx(2.2);
  if (g.air.length !== SHELL_FX.long || g.floor.length !== SHELL_FX.long) found.push('the shell\'s blast not SHELL_FX.long frames');
  assert.deepEqual([...new Set(found)], []);
});

// ---- 9. its numbers and its ties to the game ------------------------------------------------------------------------------

test('9. the numbers it is drawn to are the game\'s and the art\'s: the shell 20 tiles a second and 2.5 round, the beam 8 long, the bolt 30 a second; the Golem and the Contraption turned as the game draws them; the gun\'s own vents quiet (his word), so none of their steam is drawn here', () => {
  const found: string[] = [];
  const C = TINKER_TUNE.golem.charge;
  if (C.speed !== SHELL_FX.speed || C.blast !== SHELL_FX.blast || C.beam !== BEAM_FX.long || C.wide !== BEAM_FX.wide) found.push('the Gun Arm\'s numbers not the art\'s');
  if (TINKER_TUNE.contraption.boltSpeed !== BOLT_FX.speed) found.push('the bolt\'s speed not the art\'s');
  const art = readFileSync('src/art/tinkerer_art.ts', 'utf8');
  if (!art.includes(`GOLEM_TURN: Record<GameView, number> = { front: ${SHOT_GOLEM_TURN.front}, back: ${SHOT_GOLEM_TURN.back} }`)) found.push('the Golem not turned as the game turns it');
  if (!art.includes(`CON_TURN: Record<GameView, number> = { front: ${SHOT_CON_TURN.front}, back: ${SHOT_CON_TURN.back} }`)) found.push('the Contraption not turned as the game turns it');
  if (GUN_STEAM.on) found.push('the gun\'s own steam is on: bake its vents (tools/bake_golem_shots.ts) and draw them');
  if (CBOLT.fire !== 11) found.push('the bolt fires at another frame: bake the ball again');
  assert.deepEqual(found, []);
});
